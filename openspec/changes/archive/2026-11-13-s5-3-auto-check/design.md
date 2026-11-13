# Design: S5.3 Chấm tự động

## Context

Đã quan sát trong repo (không phải đề xuất):

- `core/services/recorder.service.ts` + `core/hooks/useRecorder.ts` (S5.1): service nhận `deps` để test truyền bản giả, hook giữ một instance qua `useRef`,
  cleanup `discard()`, cờ `isMountedRef`, `generation` để bỏ kết quả của lần cũ. Mẫu để bám theo cho speech.
- `shared/components/RecordCompare.tsx` (S5.1): props chỉ `audioPath`; nút "Ghi âm"/"Dừng" gọi `handleToggleRecording` → `start()`/`stop()` của `useRecorder`.
- `shared/components/exercises/SpeakExercise.tsx` (S5.2): hiện chữ Hán/pinyin/nghĩa, `<RecordCompare audioPath>`, 3 nút mức. `resolveTarget` cho `target.hanzi`.
  Đăng ký ở `exercise.registry.ts` (`speak`). Mức chọn gọi `onResult`; ghi âm không liên quan tới `onResult`.
- Helper test: `src/test/record-compare.helpers.ts` (`installRecordingEnvironment`, `FakeMediaRecorder` kế thừa `EventTarget`, `stubMediaDevices`).
- i18n nhóm `record.*`, `speak.*` ở `assets/i18n/vi/lesson.json`; CSS BEM `_record.css`, `_speak-rating.css` (token `danger`, `warning`, `accent-soft`…) import ở `styles/tailwind/main.css`.
- **Chưa có**: `speech.service.ts`, `useSpeechRecognition`, hook trạng thái online (`useOnlineStatus` chỉ được nhắc ở `docs/03-architecture.md` §hooks), kiểu `SpeechRecognition`
  (không nằm trong `lib.dom` của TS ⇒ phải tự khai báo interface tối thiểu). Không có file nào dùng `navigator.onLine`.

Layer đích: xem `proposal.md`. Phạm vi: xem `proposal.md` (Không làm).

## Goals / Non-Goals

**Goals:** hạ tầng nhận diện `zh-CN` test được bằng bản giả; hàm so sánh thuần; khu "Chấm tự động" chỉ nhận props; ẩn gọn khi thiếu mạng/hỗ trợ/lỗi.
**Non-Goals:** chấm điểm, thanh điệu, server, mic bị chặn (S5.4), e2e, đổi schema/IndexedDB, thêm dependency.

## Decisions

### D1. `core/services/speech.service.ts` — hạ tầng nhận diện (không business rule, không chia 3 phần)
- Khai báo kiểu cục bộ `SpeechRecognitionLike` (extends `EventTarget`): `lang`, `interimResults`, `continuous`, `start()`, `stop()`, `abort()`. Sự kiện dùng `addEventListener`
  (`result`, `error`, `end`) để bản giả chỉ cần `EventTarget`, giống `FakeMediaRecorder`.
- `interface SpeechDeps { createRecognition: () => SpeechRecognitionLike | null }`. `createSpeechService()` dựng bản thật: lấy `window.SpeechRecognition ?? window.webkitSpeechRecognition`
  (đọc qua type guard, không `any`), trả `null` nếu không có; set `lang = 'zh-CN'`, `interimResults = false`, `continuous = false`.
- `class SpeechService`: `isSupported(): boolean`; `start(): void` (throw `Error` tiếng Việt nếu không hỗ trợ hoặc `start()` của trình duyệt ném); `stop(): Promise<string>`
  (gọi `recognition.stop()`, chờ `end`, trả chữ nhận được ghép từ các `result`; `''` nếu không có kết quả hoặc lỗi `no-speech`; **reject** với các lỗi khác: `network`, `not-allowed`, `audio-capture`…);
  `abort(): void` (cleanup, gọi nhiều lần an toàn). `generation` bỏ kết quả của lần cũ khi `start` lại (AC2 "Ghi lại").
- Đọc kết quả từ sự kiện trình duyệt là dữ liệu ngoài: trích `results[i][0].transcript` qua type guard (`unknown` → `string`), không cần Zod vì không lưu và không đi vào schema nội dung.
- Không export singleton; mỗi `useSpeechRecognition` giữ instance riêng (cùng lý do `RecorderService`).
- *Đã cân nhắc:* tự dựng hai nguồn micro riêng — bỏ, Web Speech tự giữ micro. Xung đột micro với `MediaRecorder` xem "Rủi ro".

### D2. `core/hooks/useOnlineStatus.ts` — trạng thái có mạng
- `useOnlineStatus(): boolean` bằng `useSyncExternalStore` (subscribe sự kiện `online`/`offline` của `window`, snapshot `navigator.onLine`), cleanup khi unmount (AC1 mất mạng/có lại).

### D3. `core/hooks/useSpeechRecognition.ts`
```ts
useSpeechRecognition(): { isSupported: boolean; isListening: boolean; transcript: string | null; hasError: boolean; start: () => void; stop: () => Promise<void> }
```
- `transcript`: `null` = chưa có kết quả (chưa ghi, hoặc đang ghi); `''` = máy không nghe được; còn lại là chữ nhận được.
- `start`: xóa `transcript` và `hasError`, gọi `service.start()`; ném ⇒ `hasError = true`, `isListening = false`, **không throw ra UI**.
- `stop`: `await service.stop()` → `transcript`; reject ⇒ `hasError = true`, `transcript` giữ `null` (AC3 "Nhận diện bị lỗi").
- `useEffect` cleanup `service.abort()`; cờ `isMountedRef` chống setState sau unmount (mẫu `useRecorder`). Kiểm `import`: `core/hooks → core/services`, không import `shared/*`.

### D4. `shared/utils/speech-diff.utils.ts` — so sánh thuần (leaf, không import service)
```ts
type DiffKind = 'same' | 'different' | 'missing' | 'extra';
interface DiffSegment { kind: DiffKind; char: string }
normalizeSpeechText(text: string): string
diffSpeech(expected: string, heard: string): DiffSegment[]
isSpeechMatch(segments: DiffSegment[]): boolean
```
- Rule: `normalizeSpeechText` bỏ mọi khoảng trắng và dấu câu/ký hiệu (`/[\p{P}\p{S}\s]/gu`), giữ nguyên chữ (không đổi giản/phồn).
- Rule: `diffSpeech` căn hai chuỗi đã chuẩn hoá theo từng ký tự bằng LCS: ký tự trong LCS là `same`; đoạn lệch có cả thiếu lẫn thừa thì ghép từng cặp theo thứ tự thành
  `different` (hiện chữ **máy nghe được**), phần dư là `missing` (chữ của câu đúng, hiển thị chỗ trống) hoặc `extra` (chữ máy nghe thêm). Thứ tự segment = thứ tự đọc.
- `isSpeechMatch` = mọi segment là `same`. Chuỗi nghe được rỗng sau chuẩn hoá do **component** xử lý ("không nghe được"), không gọi `diffSpeech` (tránh tô sai toàn bộ câu).
- Mọi hàm kèm comment "Rule: …", pure, không mutate tham số.

### D5. `shared/components/exercises/SpeakAutoCheck.tsx` — khu "Chấm tự động" (chỉ nhận props)
- Props: `expected: string`, `transcript: string | null`. Không hook hạ tầng, không service.
- Khung `<section aria-labelledby>` với tiêu đề "Chấm tự động" và câu "Chỉ để tham khảo" (chữ). `transcript === null` ⇒ chưa hiện chữ nào (AC1 "Chưa ghi âm").
- `normalizeSpeechText(transcript) === ''` ⇒ `<p role="status">` "Máy không nghe được, hãy thử lại", không tô.
- Ngược lại: `diffSpeech` → danh sách `<span class="auto-check-char">`; segment khác `same` có class `is-different|is-missing|is-extra` **và** nhãn chữ
  `<span class="auto-check-label">Khác|Thiếu|Thừa</span>` ngay trong span (trình đọc màn hình đọc được, không chỉ màu). `missing` hiện chữ câu đúng mờ/gạch nối. Khớp hoàn toàn ⇒ `<p role="status">` "Khớp với câu đúng".
- Vùng kết quả `aria-live="polite"` để báo khi có kết quả mới.

### D6. Sửa `RecordCompare` và `SpeakExercise`
- `RecordCompare` thêm 2 prop tuỳ chọn `onRecordStart?: () => void`, `onRecordStop?: () => void` (tổng 3 prop). `handleToggleRecording` gọi `onRecordStart` **trước** `start()` (đồng bộ trong cú bấm, một số
  trình duyệt đòi thao tác người dùng) và `onRecordStop` cùng lúc gọi `stop()`. Hành vi cũ không đổi; test S5.1 phải vẫn xanh.
- `SpeakExercise`: gọi `useOnlineStatus()` và `useSpeechRecognition()`; `const canAutoCheck = isOnline && speech.isSupported && !speech.hasError`.
  - `handleRecordStart`: nếu `canAutoCheck` thì `speech.start()`. `handleRecordStop`: nếu đang `isListening` thì `void speech.stop()`.
  - `canAutoCheck` ⇒ render `<SpeakAutoCheck expected={target.hanzi} transcript={speech.transcript} />` bên dưới `RecordCompare`, trên 3 nút mức. Ẩn khi thiếu một điều kiện (AC1, AC3).
  - **Không** nối `transcript` với `onResult`/`selectedRating` (AC2 "Không tự chọn mức"). Mất mạng khi đang ghi: khu ẩn, ghi âm và mức vẫn chạy.
- Bản ghi/nghe lại/mức không phụ thuộc `speech.*`: lỗi nhận diện chỉ làm khu ẩn (AC3).
- File `SpeakExercise.tsx` đang ~110 dòng, thêm ~20; vẫn <300.

### D7. i18n và style
- `assets/i18n/vi/lesson.json`, nhóm `speak.autoCheck`: `title` "Chấm tự động", `hint` "Chỉ để tham khảo, bạn vẫn tự chọn mức bên dưới.", `matched` "Khớp với câu đúng",
  `notHeard` "Máy không nghe được, hãy thử lại", `label.different` "Khác", `label.missing` "Thiếu", `label.extra` "Thừa". (Câu `hint` do plan đề xuất, spec không nêu: BA xem khi review PR.)
- `styles/tailwind/components/_auto-check.css` (+ `@import` ở `main.css`): `.auto-check`, `.auto-check-title`, `.auto-check-text`, `.auto-check-char` (+ `.is-different`, `.is-missing`, `.is-extra` dùng token
  `danger-soft/danger-text`, `warning-soft/warning-text`; có viền/gạch dưới để không chỉ dựa màu), `.auto-check-label` (chữ nhỏ), `.auto-check-message`. Contrast ≥ 4.5:1 cả theme tối.
  JSX chỉ `flex flex-col gap-sm`/`flex flex-wrap`.

### D8. Dữ liệu ngoài và Zod
Chỉ có kết quả nhận diện từ Web Speech (runtime, không lưu, không đọc file/IndexedDB/URL). Trích bằng type guard ở D1. Không thêm schema Zod, không đổi IndexedDB, không thêm dependency.

### D9. Kiểm tra dependency (CLAUDE.md §2)
`SpeakExercise → useOnlineStatus, useSpeechRecognition (core/hooks) → speech.service (core/services)`; `SpeakAutoCheck → shared/utils/speech-diff.utils` (leaf).
Không `shared/services`, không Dexie, không React trong `core/services`; `speech-diff.utils` không import service. `SpeakAutoCheck` không gọi service/hook hạ tầng.

### D10. Tầng test (spec-driven §4)
- Hàm thuần so sánh: Vitest `speech-diff.utils.test.ts`.
- Hiện/ẩn, kết quả, lỗi: Vitest + Testing Library ở `SpeakExercise.autocheck.test.tsx` (file mới để file test hiện có <300 dòng), render qua `exerciseRegistry.speak` như `SpeakExercise.test.tsx`.
- Bản giả ở ranh giới: `FakeSpeechRecognition` (EventTarget; `stop()` phát `result` rồi `end`; có thể phát `error`) và stub `navigator.onLine` + sự kiện `online`/`offline`; đặt ở
  `src/test/speech.helpers.ts`, gắn vào `window.SpeechRecognition` bằng `vi.stubGlobal`. Không mock hook/service của ta. Dùng lại `installRecordingEnvironment`.
- Dưới: `speech.service.test.ts`, `useOnlineStatus.test.ts`, `useSpeechRecognition.test.ts` cạnh file.
- Chưa có e2e (Playwright không có micro/Web Speech; proposal, câu hỏi mở 4).

## File sẽ tạo/sửa (từ `apps/web/src/`)
- Tạo: `app/core/services/speech.service.ts` (+ `.test.ts`), `app/core/hooks/useOnlineStatus.ts` (+ `.test.ts`), `app/core/hooks/useSpeechRecognition.ts` (+ `.test.ts`),
  `app/shared/utils/speech-diff.utils.ts` (+ `.test.ts`), `app/shared/components/exercises/SpeakAutoCheck.tsx` (+ test qua `SpeakExercise.autocheck.test.tsx`),
  `test/speech.helpers.ts`, `styles/tailwind/components/_auto-check.css`.
- Sửa: `app/shared/components/RecordCompare.tsx`, `app/shared/components/exercises/SpeakExercise.tsx`, `assets/i18n/vi/lesson.json`, `styles/tailwind/main.css`.

## Rủi ro
- **Xung đột micro** (proposal, câu hỏi mở 1): `MediaRecorder` và Web Speech cùng mic có thể bị chặn (Safari iOS). Cách xử lý đã thiết kế: `speech.start()` ném hoặc phát `error` ⇒
  `hasError` ⇒ ẩn khu (đúng AC3), ghi âm vẫn chạy. Vitest không chứng minh được; cần thử tay trên Chrome desktop/Android và Safari iOS ở task verify, ghi kết quả vào PR.
  Nếu ghi âm bị hỏng theo (không chỉ ẩn khu), phải mở PR spec fix.
- Lỗi `no-speech` coi là "không nghe được" (D1), không phải lỗi; mọi lỗi khác ẩn khu.
- `webkitSpeechRecognition` gửi âm lên dịch vụ của trình duyệt (Chrome); proposal đã chốt chỉ dùng Web Speech, ghi chú trong PR.
