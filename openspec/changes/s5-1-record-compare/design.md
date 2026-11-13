# Design: S5.1 Ghi âm và so sánh

## Context

Đã quan sát trong repo (không phải đề xuất):

- `core/services/audio.service.ts`: `AudioService` giữ **một** `HTMLAudioElement` dùng chung; `play(src, rate): Promise<'ended' | 'interrupted'>`, `stop()`.
  Một element ⇒ không bao giờ có hai luồng âm. Export singleton `audioService`.
- `core/hooks/useAudioPlayer.ts`: `{ isPlaying, hasError, play(audioPath, isSlow), stop }`. `play` luôn ghép `AUDIO_BASE_PATH` vào đường dẫn, và dùng biến
  module `activeOwner` để biết hook nào đang giữ luồng.
- `shared/components/ListenButton.tsx`, `SlowToggle.tsx`, `shared/contexts/AudioSpeedContext.tsx` (`useAudioSpeed`): mẫu khối audio dùng chung; style ở
  `styles/tailwind/components/_audio.css` (`.audio-listen-button`, `.audio-listen-error`), i18n `assets/i18n/vi/lesson.json` (`listen.*`).
- `ExerciseContent` (`shared/models/exercise.model.ts`) đã mang `Word.audio` / `Sentence.audio`; dạng bài nhận qua props (S4.4).
- Chưa có code ghi âm, `MediaRecorder`, `getUserMedia` trong repo. `fake-indexeddb` đã có trong `src/test/setup.ts`.
- Layer đích và phạm vi: xem `proposal.md`. S5.1 **không** đăng ký dạng bài "nói" (S5.2), nên khối giao ra chưa có chỗ cắm vào `LessonRunner`.

## Goals / Non-Goals

**Goals:** hạ tầng ghi âm test được bằng micro giả; khối "ghi âm và so sánh" dùng lại được cho S5.2–S5.4, S10.7; bản mẫu và bản ghi chung một luồng phát.

**Non-Goals:** dạng bài `speak` trong registry, tự đánh giá, nhận diện giọng, xử lý mic bị chặn/không có (S5.2–S5.4), lưu bản ghi, giới hạn thời lượng (đề xuất ở `proposal.md`: không giới hạn).

## Decisions

### D1. `core/services/recorder.service.ts` — hạ tầng ghi âm (không business rule, không chia 3 phần)
- `class RecorderService`, constructor nhận một `RecorderDeps` để test truyền bản giả:
  `{ getUserMedia: () => Promise<MediaStream>; createRecorder: (stream: MediaStream) => MediaRecorder; createObjectUrl: (blob: Blob) => string; revokeObjectUrl: (url: string) => void }`.
  Export `createRecorderService()` dựng bản thật (`navigator.mediaDevices.getUserMedia({ audio: true })`, `new MediaRecorder`, `URL.createObjectURL`/`revokeObjectURL`).
  Không export singleton: mỗi `useRecorder` giữ một instance riêng, để rời màn là giải phóng đúng phần của mình.
- `start(): Promise<void>`: xin stream, tạo recorder, gom `dataavailable` vào mảng chunk, `recorder.start()`. Throw `Error` tiếng Việt nếu không xin được stream.
- `stop(): Promise<string>`: `recorder.stop()`, chờ `stop` event, ghép chunk thành `Blob`, **thu hồi URL của bản cũ** (bản mới thay bản cũ), tạo object URL mới, tắt mọi track của stream, trả URL.
- `discard(): void` (cũng là cleanup): nếu đang ghi thì dừng recorder, tắt mọi track, thu hồi object URL, bỏ chunk. Gọi nhiều lần vẫn an toàn.
- Bản ghi chỉ là `Blob` + object URL trong bộ nhớ trang. Không chạm IndexedDB, `localStorage`, `ProgressStore` (AC3).
- *Đã cân nhắc:* giữ `Blob` rồi tạo `Audio` riêng để phát bản ghi — bỏ vì tạo luồng thứ hai, vi phạm "không phát chồng" (AC2). Dùng lại `audioService` (D3).

### D2. `core/hooks/useRecorder.ts`
```ts
useRecorder(): { isRecording: boolean; recordingUrl: string | null; hasError: boolean; start: () => Promise<void>; stop: () => Promise<void> }
```
- `useRef(createRecorderService())` giữ service; effect cleanup gọi `service.discard()` ⇒ rời màn/đổi câu (remount theo `key`) thì dừng ghi, nhả mic, thu hồi URL (AC1 "Rời màn", AC3).
- `start`: `audioService.stop()` (dừng bất kỳ audio nào đang phát, kể cả do hook khác giữ), xóa `hasError`, gọi `service.start()`, `isRecording = true`.
  Lỗi từ service: `hasError = true`, `isRecording = false`, **không throw ra UI** (spec chỉ yêu cầu không làm hỏng màn; thông báo mic chặn/không có là S5.4).
- `stop`: `service.stop()` → `recordingUrl = url`, `isRecording = false`. Ghi lần nữa: `recordingUrl` bị thay bằng URL mới (service đã thu hồi URL cũ).
- Cờ `isMounted` trong ref để không `setState` sau unmount (cùng mẫu `useAudioPlayer`).
- Kiểm `import` (§2): `core/hooks → core/services` đúng chiều; không import `shared/*`.

### D3. Phát bản ghi qua cùng `audioService` — sửa nhỏ `useAudioPlayer`
- `useAudioPlayer` thêm `playUrl: (url: string, isSlow: boolean) => Promise<void>`; tách thân `play` thành hàm nội bộ `start(src, rate)`; `play` ghép `AUDIO_BASE_PATH`,
  `playUrl` dùng nguyên URL (object URL `blob:`). Hành vi cũ của `play`/`stop`/`isPlaying`/`hasError` giữ nguyên (test S4.4 hiện có phải vẫn xanh).
- Bản mẫu và bản ghi cùng đi qua `audioService` ⇒ một element ⇒ "Nghe bản ghi rồi Nghe mẫu" tự dừng bản ghi, không chồng (AC2). Lỗi `reject` ⇒ `hasError` (AC2 "không phát được").
- Bản ghi phát ở tốc độ thường (`isSlow = false`): "Nghe chậm" của S4.4 chỉ áp cho bản mẫu (proposal: tốc độ nghe mẫu dùng lại của S4.4).

### D4. `shared/components/RecordCompare.tsx` — khối dùng chung
- Props: chỉ `audioPath: string` (bản mẫu, đã lấy từ `content` của dạng bài); S5.2 thêm prop khi cần.
- Nội bộ: `useRecorder()`, một `useAudioPlayer()` cho cả hai nút, `useAudioSpeed()` cho bản mẫu.
  - Nút ghi: `type="button"`, nhãn "Ghi âm" ↔ "Dừng" (`isRecording`); trong lúc ghi hiện `<p role="status">` "Đang ghi âm" (chữ, không chỉ màu).
    Bấm "Ghi âm": `player.stop()` rồi `recorder.start()`.
  - "Nghe mẫu": `player.play(audioPath, isSlow)`. "Nghe bản ghi": `player.playUrl(recordingUrl, false)`, `disabled` khi `recordingUrl === null` hoặc đang ghi.
  - `hasError` của player ⇒ `<p role="alert">` "Không phát được bản ghi." (tái dùng class `.audio-listen-error`); nút khác vẫn dùng được.
- Không gọi service; chỉ dùng `core/hooks` (§2 cho phép `shared/components` → `core/hooks`). Không `dangerouslySetInnerHTML`; không `any`.
- "Sang câu khác thì bản ghi câu trước không còn": do **component bị remount** (khung chạy bài đã render dạng bài với `key={exercise.id}`; S5.2 giữ nguyên) ⇒ cleanup D2 chạy.
  Test dùng `key` khác để giả lập. Không thêm state/effect theo `exerciseId`.
- *Đã cân nhắc:* dùng `ListenButton` cho "Nghe mẫu" — bỏ vì cần chung một `useAudioPlayer` với nút bản ghi để lỗi/đang phát nhất quán; `ListenButton` có hook riêng.

### D5. i18n và style
- `assets/i18n/vi/lesson.json` thêm nhóm `record`: `start` "Ghi âm", `stop` "Dừng", `recording` "Đang ghi âm", `listenSample` "Nghe mẫu", `listenRecording` "Nghe bản ghi",
  `playError` "Không phát được bản ghi."
- `styles/tailwind/components/_record.css` (import vào `main.css`): `.record-compare` và `.record-compare-button`, `.record-compare-status` bằng `@apply`; nút cao ≥ 44px, trạng thái `.is-recording`,
  `:disabled`, `prefers-reduced-motion`. Trong JSX chỉ dùng class layout (`flex flex-wrap gap-md`). Theme tối: dùng token sẵn có.

### D6. Dữ liệu ngoài và Zod
Không có dữ liệu ngoài mới đi vào app (bản ghi sinh ra tại chỗ, không đọc từ file/IndexedDB/URL). Không thêm schema Zod. Không đổi IndexedDB, không thêm dependency.

### D7. Kiểm tra dependency (CLAUDE.md §2)
`RecordCompare (shared/components) → useRecorder, useAudioPlayer (core/hooks) → recorder.service, audio.service (core/services)`; `RecordCompare → shared/contexts` (`useAudioSpeed`).
Không có `shared/services`, không có Dexie, không React trong `core/services`. `recorder.service.ts` không import React.

### D8. Tầng test (spec-driven §4)
Vitest + Testing Library, cạnh file. `MediaRecorder`, `getUserMedia`, `URL.createObjectURL` và `Audio` là bản giả ở ranh giới; không mock hook/service của ta.
AC3 "không có trong dữ liệu lưu": dùng `fake-indexeddb` (đã có) mở `createDatabase()`, ghi âm bằng component, rồi đọc mọi bảng và `localStorage` để khẳng định không chứa Blob/URL.
Chưa có e2e (proposal, câu hỏi mở 3).

## File sẽ tạo/sửa (từ `apps/web/src/`)
- Tạo: `app/core/services/recorder.service.ts` (+ `.test.ts`), `app/core/hooks/useRecorder.ts` (+ `.test.ts`), `app/shared/components/RecordCompare.tsx` (+ `.test.tsx`),
  `styles/tailwind/components/_record.css`.
- Sửa: `app/core/hooks/useAudioPlayer.ts` (+ `playUrl`), `assets/i18n/vi/lesson.json`, `styles/tailwind/main.css`.

## Rủi ro
- `MediaRecorder` định dạng khác nhau theo trình duyệt (webm/mp4): để mặc định của trình duyệt, `Blob.type` lấy từ `recorder.mimeType`.
- Tắt track phải làm cả khi `stop` lẫn `discard`, nếu không đèn mic vẫn sáng (AC1 "micro không còn được dùng").
