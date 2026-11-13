# Design: S5.4 Khi không có mic

## Context

Đã quan sát trong repo (không phải đề xuất):

- `core/services/recorder.service.ts` (S5.1): `RecorderService` nhận `RecorderDeps` (`getUserMedia`, `createRecorder`, `createObjectUrl`, `revokeObjectUrl`). `start()` bọc mọi lỗi
  `getUserMedia` thành một `Error` chung ("Không mở được micro…", `cause` giữ lỗi gốc), nên chưa phân biệt được lý do. `createRecorderService()` gọi thẳng
  `navigator.mediaDevices.getUserMedia` (sẽ ném `TypeError` nếu `mediaDevices` không tồn tại) và `new MediaRecorder` (ném nếu thiếu).
- `core/hooks/useRecorder.ts`: trả `{ isRecording, recordingUrl, hasError, start, stop }`; `start` bắt lỗi và đặt `hasError`, không throw ra UI. Chưa có trạng thái lý do.
- `shared/components/RecordCompare.tsx` (S5.1, đã nhận `onRecordStart/onRecordStop` ở S5.3): 3 prop; nút "Ghi âm"/"Dừng", "Nghe mẫu", "Nghe bản ghi"; `hasError` ở đây là lỗi **phát** của `useAudioPlayer`.
- `shared/components/exercises/SpeakExercise.tsx` (S5.2/S5.3): chữ Hán/pinyin/nghĩa, `RecordCompare`, `SpeakAutoCheck` khi `canAutoCheck`, 3 nút mức. `LessonRunner` render exercise với `key={exercise.id}`
  nên **mỗi câu mount lại** ⇒ state cục bộ của `SpeakExercise`/`RecordCompare` không sống qua câu kế.
- `LessonRunnerContainer.tsx` bọc runner trong `<AudioSpeedProvider key={lessonId}>`: mẫu có sẵn cho state "theo bài, reset khi mở bài khác"
  (`shared/contexts/AudioSpeedContext.tsx` + `useAudioSpeed.ts`, giá trị mặc định no-op khi thiếu provider).
- Test hiện có: `RecordCompare.record.test.tsx` ca "kỹ thuật, không có Scenario" (dòng ~127) kiểm tra `getUserMedia` reject `NotAllowedError` thì "các nút vẫn bấm được". Hành vi này **đổi** theo S5.4
  (nút Ghi âm bị ẩn): ca đó phải được cập nhật ở task RED tương ứng, không xoá lặng lẽ.
- Helper test: `src/test/record-compare.helpers.ts` (`installRecordingEnvironment`, `stubMediaDevices`, `FakeMediaRecorder`, `recordOnce`), `src/test/speech.helpers.ts` (S5.3).
- i18n nhóm `record.*`, `speak.*` ở `assets/i18n/vi/lesson.json`; CSS BEM `_record.css`, `_speak-rating.css`, `_auto-check.css`, import ở `styles/tailwind/main.css`.

Layer đích và phạm vi: xem `proposal.md`.

## Goals / Non-Goals

**Goals:** phân loại 3 lý do không ghi âm được; hướng dẫn theo lý do; "Thử lại" kiểm tra mic không bắt đầu ghi; chế độ "đọc to rồi tự chấm" giữ cả bài, reset khi mở bài khác; không chặn bài.
**Non-Goals:** lưu lựa chọn qua bài/cài đặt (S8.2), hướng dẫn theo trình duyệt/OS, kiểm tra mic trước bài, e2e, đổi schema/IndexedDB/dependency, đổi chấm điểm (S5.2).

## Decisions

### D1. `core/services/recorder.service.ts` — phân loại lý do (hạ tầng, không business rule)
- `type RecorderFailureReason = 'blocked' | 'no-device' | 'unsupported'`; `class RecorderError extends Error { readonly reason: RecorderFailureReason }`.
- `RecorderDeps` thêm `isSupported: () => boolean` (thật: `navigator.mediaDevices?.getUserMedia` và `typeof MediaRecorder` đều có). Bản giả của test truyền `() => true` hoặc `false`.
- Rule phân loại (hàm private thuần `classifyFailure(error: unknown)`; lỗi là dữ liệu ngoài nên đọc `name` qua type guard `unknown`, không `any`, không cần Zod vì không lưu):
  `NotAllowedError`, `SecurityError` ⇒ `blocked` (cả từ chối ở hộp xin quyền lẫn đã chặn từ trước, xử lý như nhau, proposal câu hỏi mở 3);
  `NotFoundError`, `OverconstrainedError`, `DevicesNotFoundError` ⇒ `no-device`; lỗi khác (vd `NotReadableError`: mic đang bị app khác giữ) ⇒ `no-device` (hướng dẫn "kiểm tra micro" là phù hợp nhất; xem Câu hỏi mở 1).
- `start()` ném `RecorderError` (giữ message tiếng Việt và `cause`): kiểm `isSupported()` trước (⇒ `unsupported`), rồi bọc lỗi `getUserMedia`.
- Thêm `checkAvailability(): Promise<RecorderFailureReason | null>`: `isSupported()` sai ⇒ `'unsupported'`; gọi `getUserMedia`, **nhả stream ngay** (`getTracks().forEach(stop)`), trả `null`; lỗi ⇒ reason. Không tạo `MediaRecorder`, không đụng `chunks`/`currentUrl`.
  Dùng cho "Thử lại" (kiểm tra mic mà không bắt đầu ghi, để "Ghi âm" quay lại đúng như AC "Cấp quyền rồi thử lại"). Bỏ kết quả lỗi thời bằng `generation` như `start()`.
- `createRecorderService()` cập nhật `isSupported` thật; `getUserMedia` giữ nguyên.

### D2. `core/hooks/useRecorder.ts`
- Trả thêm `failureReason: RecorderFailureReason | null` và `retry: () => Promise<RecorderFailureReason | null>`; `start` đổi kiểu trả `Promise<RecorderFailureReason | null>` (kết quả cho caller, vẫn **không throw**).
- `start`: xóa `failureReason` trước; bắt `RecorderError` ⇒ `failureReason = error.reason`, `hasError = true` (S5.1 giữ), `isRecording = false`. Lỗi không phải `RecorderError` ⇒ như cũ (`hasError`), `failureReason` giữ `null`.
- `retry`: `await service.checkAvailability()`; đặt `failureReason` theo kết quả (thành công ⇒ `null`); cờ `isMountedRef` chống setState sau unmount.
- `useEffect` cleanup `discard()` giữ nguyên. Kiểm `import`: `core/hooks → core/services`, không import `shared/*`.

### D3. `shared/contexts/RecordingModeContext.tsx` + `useRecordingMode.ts` — chế độ "đọc to" theo bài
Bám đúng mẫu `AudioSpeedContext` (provider + hook tách file, default no-op khi thiếu provider):
```ts
interface RecordingModeValue {
  isReadAloud: boolean;
  enterReadAloud: () => void;
  leaveReadAloud: () => void;
}
```
- `RecordingModeProvider` giữ `useState(false)`. Đặt ở `LessonRunnerContainer.tsx` cạnh `AudioSpeedProvider`, **cùng `key={lessonId}`** ⇒ mở bài khác thì state reset và `RecordCompare` mới thử ghi âm như thường (AC2 "Mở bài mới"). Câu kế trong bài mount lại nhưng context còn nguyên (AC2 "Giữ chế độ").
- Chỉ lưu `isReadAloud`, **không** lưu lý do: lý do sống ở `useRecorder` của câu vừa thất bại (D4). Không ghi localStorage/IndexedDB (out of scope, S8.2).
- `PlacementTestContainer` chưa bọc: nếu bài xếp lớp có câu "nói" thì chế độ không giữ qua câu (default no-op). Xem Câu hỏi mở 2.

### D4. `shared/components/RecordCompare.tsx` — nhánh theo trạng thái (vẫn 3 prop)
- Đọc `useRecordingMode()` và `useRecorder()`. Hai trạng thái:
  - **Ghi âm bình thường** (`!isReadAloud`): như hiện tại (nút Ghi âm/Dừng, Nghe mẫu, Nghe bản ghi).
  - **Đọc to** (`isReadAloud`): chỉ render nút **Nghe mẫu**; ẩn Ghi âm, Nghe bản ghi (không còn bản ghi để nghe).
- `handleToggleRecording` (nhánh bắt đầu): `onRecordStart?.()` rồi `const reason = await start()`; `reason !== null` ⇒ `enterReadAloud()` (không cần effect, derive từ kết quả cú bấm).
  `onRecordStart` vẫn gọi **trước** `start()` (S5.3 giữ). Nhưng `speech.start()` của S5.3 nên bị hủy khi mic hỏng: `SpeakExercise` đã ẩn `SpeakAutoCheck` bằng `isReadAloud` (D5), và `speech.stop/abort` đã an toàn khi không ghi.
- Khối thông báo dưới nút, theo thứ tự:
  1. `failureReason !== null` (câu **vừa** thất bại): `<RecordGuidance reason onRetry />` (D5).
  2. `isReadAloud` (mọi câu trong chế độ): `<p role="status">` lời nhắc "Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới".
  3. `isReadAloud && failureReason === null && reason !== 'unsupported'` (câu **sau**, mount lại): nút **"Thử lại ghi âm"**. Nút này gọi `retry()`; trả `null` ⇒ `leaveReadAloud()` (hiện lại Ghi âm/Nghe bản ghi);
     còn lỗi ⇒ `failureReason` mới ⇒ hiện `RecordGuidance` ngay trong câu hiện tại. Câu sau mount lại chưa biết lý do `unsupported`, nên `retry()` gọi service sẽ trả `'unsupported'` và hiện hướng dẫn (đúng, không treo).
     Vì vậy điều kiện nút "Thử lại ghi âm" chỉ là `isReadAloud && failureReason === null`.
- **Focus (AC1 "trình đọc màn hình")**: bấm "Ghi âm" làm nút bị ẩn, focus sẽ rơi về `body`. Cách xử lý: `RecordGuidance` là `<section role="alert" tabIndex={-1}>`; khi mount, focus chuyển vào chính section đó
  (`useEffect` + ref, có cleanup không cần vì không có listener). `role="alert"` ⇒ trình đọc màn hình đọc nội dung. Khi "Thử lại" thành công, hướng dẫn biến mất và nút "Ghi âm" hiện lại: đưa focus về nút "Ghi âm" (ref).
  Khi "Thử lại ghi âm" thành công thì nút đó biến mất: cũng focus về "Ghi âm". Mọi chuyển focus có test (`document.activeElement` nằm trong câu, không phải `body`).
- File `RecordCompare.tsx` hiện 77 dòng, thêm ~50 vẫn < 300.

### D5. `shared/components/RecordGuidance.tsx` — khối hướng dẫn (chỉ nhận props)
- Props: `reason: RecorderFailureReason`, `onRetry: () => void` (2 prop). Không hook hạ tầng, không service; import type `RecorderFailureReason` từ `@core/services/recorder.service` (type-only, hợp lệ
  `shared/components → core`, giống `RecordCompare` đã import `core/hooks`).
- Nội dung theo bảng `proposal.md`, từ i18n `record.guidance.*`: tiêu đề + các bước. `blocked`: danh sách có thứ tự (`<ol>`) các bước cấp quyền; `no-device`: kiểm tra đã cắm/bật micro;
  `unsupported`: báo không ghi âm được + gợi ý dùng trình duyệt khác. Nút "Thử lại" chỉ khi `reason !== 'unsupported'`.
- Bản chữ hướng dẫn từng bước là đề xuất của plan, BA duyệt khi review PR (proposal câu hỏi mở 2).

### D6. `shared/components/exercises/SpeakExercise.tsx`
- Đọc `isReadAloud` từ `useRecordingMode()`: `canAutoCheck = isOnline && speech.isSupported && !isReadAloud` (ẩn khu "Chấm tự động" trong chế độ đọc to, AC2).
- Chữ Hán/pinyin/nghĩa, `handleSelect`, `onResult`, 3 nút mức **không đổi** ⇒ chấm điểm như thường, "Chưa đúng" vẫn hiện đáp án qua `explanation` (AC2 "Vẫn tự đánh giá", "Chọn Chưa đúng").
- Không import service; không chặn "Tiếp tục" (runner không đổi).

### D7. i18n và style
- `assets/i18n/vi/lesson.json`: `record.retry` "Thử lại", `record.retryRecording` "Thử lại ghi âm", `record.readAloud` "Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.",
  `record.guidance.blocked.title/steps.{1,2,3}`, `record.guidance.noDevice.title/body`, `record.guidance.unsupported.title/body` (câu chữ do plan đề xuất, BA xem khi review PR).
- `styles/tailwind/components/_record-guidance.css` (+ `@import` ở `main.css`): `.record-guidance` (+ `-title`, `-steps`, `-body`), dùng token `warning-soft/warning-text` và viền để không chỉ dựa màu;
  nút "Thử lại" dùng lại `.record-play-button`. Contrast ≥ 4.5:1 cả theme tối. JSX chỉ `flex flex-col gap-*`.

### D8. Dữ liệu ngoài và Zod
Lỗi từ `getUserMedia` (runtime, không lưu, không đọc file/IndexedDB/URL): đọc `name` bằng type guard ở D1. Không thêm schema Zod, không đổi IndexedDB, không thêm dependency.

### D9. Kiểm tra dependency (CLAUDE.md §2)
`SpeakExercise`/`RecordCompare → useRecorder (core/hooks) → recorder.service (core/services)`; `RecordCompare → shared/contexts/useRecordingMode`; `RecordGuidance` chỉ nhận props.
`LessonRunnerContainer → RecordingModeProvider` (container → shared/contexts, cùng mẫu `AudioSpeedProvider`). Không `shared/services`, không Dexie, không React trong `core/services`,
`core/* → shared/*` không có (chỉ `shared/components → core` đúng chiều). `RecordGuidance` không gọi service/hook.

### D10. Tầng test (spec-driven §4)
- Hiện/ẩn, chuyển chế độ, giữ qua câu, reset theo bài: Vitest + Testing Library ở `SpeakExercise.no-mic.test.tsx` (file mới, <300 dòng), render qua `exerciseRegistry.speak`, bọc `RecordingModeProvider`
  (và `key` theo exercise/lesson bằng `rerender` để mô phỏng runner). Không mock hook/service của ta.
- Bản giả ở ranh giới: `stubMediaDevices` với `getUserMedia` reject `DOMException('…', 'NotAllowedError' | 'NotFoundError')`, hoặc `mediaDevices` vắng/`MediaRecorder` vắng cho `unsupported`;
  "cấp quyền rồi thử lại" = đổi giả sang resolve stream. Thêm `rejectGetUserMedia(name)` và `grantMicrophone()` vào `src/test/record-compare.helpers.ts`.
- Dưới: `recorder.service.test.ts` (phân loại, `checkAvailability`), `useRecorder.test.ts` (`failureReason`, `retry`), `RecordingModeContext.test.tsx`.
- Chưa có e2e (Playwright không giả được micro; proposal câu hỏi mở 4).

## File sẽ tạo/sửa (từ `apps/web/src/`)
- Tạo: `app/shared/contexts/RecordingModeContext.tsx`, `app/shared/contexts/useRecordingMode.ts` (+ `RecordingModeContext.test.tsx`), `app/shared/components/RecordGuidance.tsx`,
  `app/shared/components/exercises/SpeakExercise.no-mic.test.tsx`, `styles/tailwind/components/_record-guidance.css`.
- Sửa: `app/core/services/recorder.service.ts` (+ test), `app/core/hooks/useRecorder.ts` (+ test), `app/shared/components/RecordCompare.tsx`, `app/shared/components/RecordCompare.record.test.tsx` (ca mic bị chặn),
  `app/shared/components/exercises/SpeakExercise.tsx`, `app/pages/lesson/containers/LessonRunnerContainer.tsx`, `test/record-compare.helpers.ts`, `assets/i18n/vi/lesson.json`, `styles/tailwind/main.css`.

## Rủi ro
- `getUserMedia` lúc "Thử lại" có thể hiện lại hộp xin quyền (hành vi trình duyệt); nếu quyền đã bị chặn vĩnh viễn thì trả lỗi ngay ⇒ vẫn hướng dẫn (AC1 "Thử lại mà vẫn bị chặn"). Vitest giả `DOMException`, không chứng minh được hành vi thật: thử tay ở task verify.
- Tên lỗi `getUserMedia` khác nhau giữa trình duyệt (Safari/Firefox cũ); bảng ở D1 là đề xuất, mọi tên lạ rơi về `no-device`.
- Chuyển focus (D4) là chỗ dễ lỗi a11y; có test `document.activeElement` và thử tay với bàn phím.
