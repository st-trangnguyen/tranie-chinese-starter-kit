# Design: S4.4 Nghe lại và nghe chậm

## Context

Đã quan sát trong repo (không phải đề xuất):

- Chưa có code audio nào. `core/hooks/` chỉ có `useInstallPrompt` (mẫu hook hạ tầng: listener có cleanup, test `useInstallPrompt.test.ts`).
- `ExerciseProps<K>` (`shared/components/exercises/exercise.types.ts`) chỉ có `exercise`, `onResult`, `isLocked`. Câu chỉ chứa ID
  (`wordId`, `wordIds`, `sentenceId`). `LessonRunner` render `ExerciseComponent` với `key={exercise.id}` nên dạng bài **remount** mỗi câu.
- `ContentSource` (`core/services/content-source.service.ts`) đã nạp `content.json` và `lessons/<id>.json`, validate bằng schema `@csk/shared`.
  Pipeline sinh thêm `words.json`, `sentences.json` (mảng `Word[]`, `Sentence[]`), `Word.audio`/`Sentence.audio` dạng `audio/<16hex>.mp3`.
  `vite` có `publicDir: 'assets'` nên chạy ở `/content/words.json` và `/audio/<hash>.mp3`. `wordSchema`, `sentenceSchema` đã export từ `@csk/shared`.
- `useLessonRunner` gọi `LessonService.openLesson` trong một effect gắn với `lessonId`; test hiện có (S3.x) mock `fetch` chỉ cho `/content/lessons/*.json`.
- Layer đích và Dependency Rule: xem `proposal.md`, CLAUDE.md §1–§2.

## Goals / Non-Goals

**Goals:** một bộ phát audio dùng chung cho mọi dạng bài nghe; quy tắc "tốc độ giữ trong bài, về 1x ở bài mới" không phụ thuộc dạng bài;
test được bằng `Audio` giả ở ranh giới.

**Non-Goals:** lưu tốc độ (S8.2), tự phát, audio offline (S8.4), ghi âm (E5), đăng ký dạng bài vào registry (S4.1–S4.3).

## Decisions

### D1. `core/services/audio.service.ts` — hạ tầng phát mp3 (không business rule, không chia 3 phần)
- `class AudioService` giữ **một** `HTMLAudioElement` dùng chung (inject factory `() => HTMLAudioElement` qua constructor để test truyền `Audio` giả),
  export instance `audioService`.
- `play(src: string, rate: number): Promise<'ended' | 'interrupted'>`:
  dừng luồng đang phát (`pause()`), đặt `currentTime = 0`, `playbackRate = rate`, `src`, gọi `play()`.
  Resolve `'ended'` khi sự kiện `ended`; resolve `'interrupted'` khi bị `stop()` hoặc `play()` khác chen vào (mỗi lần gọi giữ một token, token cũ bị vô hiệu);
  reject `Error` khi `play()` bị từ chối hoặc phát sinh `error`. `AbortError` do chính ta ngắt không tính là lỗi.
- `stop(): void`: pause, trả `'interrupted'` cho lần phát đang chờ.
- Một element duy nhất ⇒ không bao giờ có hai luồng âm (Scenario "phát lại từ đầu").
- *Đã cân nhắc:* tạo `new Audio()` mỗi lần bấm — bỏ vì khó đảm bảo luồng cũ dừng, và iOS Safari thích element đã được mở khóa bằng thao tác người dùng.
- `core/constants/audio.constants.ts`: `PLAYBACK_RATES = { normal: 1, slow: 0.75 } as const`, `AUDIO_BASE_PATH = '/'`
  (URL = `AUDIO_BASE_PATH + word.audio`, khớp `publicDir: 'assets'`). Hằng số tốc độ nằm ở đây, **không** ở service, để UI và test dùng chung.

### D2. `core/hooks/useAudioPlayer.ts`
```ts
useAudioPlayer(): { isPlaying: boolean; hasError: boolean; play: (audioPath: string, isSlow: boolean) => Promise<void>; stop: () => void }
```
- `play` xóa `hasError`, `isPlaying = true`, gọi `audioService.play(AUDIO_BASE_PATH + audioPath, rate)`; `'ended'` → `isPlaying = false`;
  reject → `hasError = true`, `isPlaying = false`; `'interrupted'` do lần bấm sau thì **không** đụng state (lần bấm sau đang giữ state).
- Cleanup khi unmount: `audioService.stop()` ⇒ dạng bài remount ở câu kế (key theo `exercise.id`) tự dừng audio câu trước. Không cần effect theo `exerciseId`.
- Cờ `isMounted` trong closure để không `setState` sau unmount.
- Hook không biết "chậm" là gì ngoài nhận `isSlow` rồi đổi sang `PLAYBACK_RATES`.

### D3. Trạng thái "Nghe chậm" giữ theo bài: context, không prop
- `shared/contexts/AudioSpeedContext.tsx`: `AudioSpeedProvider` giữ `useState(false)`; `useAudioSpeed(): { isSlow, toggleSlow }`.
  Dùng ngoài provider thì mặc định `isSlow = false` và `toggleSlow` no-op (dạng bài vẫn render được ở test riêng).
- `LessonRunnerContainer` bọc nội dung trong `<AudioSpeedProvider key={lessonId}>`. Đổi/mở bài khác ⇒ provider remount ⇒ về 1x (Scenario "Mở bài mới");
  chuyển câu chỉ remount dạng bài bên trong ⇒ trạng thái giữ (Scenario "giữ qua các câu").
- *Đã cân nhắc:* thêm `isSlow`, `onToggleSlow` vào `ExerciseProps` — bỏ vì làm props ≥ 5 và mọi dạng bài phải chuyển tiếp. State trong `useLessonRunner` — bỏ vì
  tốc độ không phải tiến độ bài; để hook đó nhỏ.
- Context là cross-cutting React Context đúng ô `shared/contexts/` (CLAUDE.md §1); không phải service nên không vướng §2.

### D4. Nút dùng chung `shared/components/`
- `ListenButton.tsx` (`audioPath: string`, `label?`): nút "Nghe" (`t('lesson:listen.play')`), `type="button"`, **không** bị `isLocked` khóa; gọi `useAudioPlayer().play(audioPath, isSlow)`;
  `aria-busy`/class `is-playing` khi `isPlaying`; khi `hasError` hiện `<p role="alert">` "Không phát được audio" ngay dưới nút (không chặn việc khác).
- `SlowToggle.tsx`: `<button role="switch" aria-checked={isSlow}>` "Nghe chậm" dùng `useAudioSpeed()`. Một công tắc cho cả câu, không theo từng nút.
- Dạng bài tự ghép: `ListenButton` (một hoặc mỗi đáp án một nút) + `SlowToggle` một lần. `shared/components` được phép dùng `core/hooks` (CLAUDE.md §2: audio qua `core/hooks`).
- Kiểm `import` (§2): `ListenButton → core/hooks/useAudioPlayer → core/services/audio.service` (đúng chiều); `ListenButton → shared/contexts`; không import `shared/services`.
  `shared/components/exercises` không import service: chỉ nhận `content` qua props (D6).

### D5. Nạp từ/câu — `ContentSource` + `ContentService`
- `ContentSource` thêm `getWords(): Promise<Word[]>`, `getSentences(): Promise<Sentence[]>`; `FetchContentSource` dùng `load()` hiện có với `wordSchema.array()`
  / `sentenceSchema.array()` (có `safeParse`, khớp interface `Schema<T>`; không import `zod` mới). **Dữ liệu ngoài đã Zod** (CLAUDE.md §0.4); không `as Word`.
- `ContentService`:
  - Phần 1: `readWords()`, `readSentences()` (private, gọi source).
  - Phần 2 (pure): `collectContentIds(exercise): { wordIds: string[]; sentenceIds: string[] }`
    — Rule: gom `wordId`, `wordIds`, `sentenceId` của câu (theo `kind` của `Exercise`, chỗ duy nhất biết field nào chứa ID).
  - Phần 3: `getExerciseContents(lesson): Promise<ReadonlyMap<string, ExerciseContent>>` — map `exercise.id` → nội dung; ID không có trong `words.json`/`sentences.json`
    thì throw `Error('Không tìm thấy từ "<id>" của câu "<exerciseId>".')`. Bọc lỗi tải bằng message tiếng Việt như `getLesson`.
- `ExerciseContent` (`shared/models/exercise.model.ts`): `{ words: readonly Word[]; sentences: readonly Sentence[] }` (thứ tự theo thứ tự ID của câu).

### D6. Hợp đồng dạng bài và hook chạy bài (đổi S3.2)
- `ExerciseProps<K>` thêm `content: ExerciseContent` (4 props).
- `LessonRunner`/`LessonRunnerView` thêm `content` của câu hiện tại; `LessonRunnerContainer` lấy `contents.get(exercise.id)`.
- `useLessonRunner`: trong effect mở bài, sau `openLesson` gọi `ContentService.getExerciseContents(lesson)`; thành công mới `setOpened`, lỗi vào nhánh `hasError`
  (nội dung hỏng = không mở được bài). `OpenedState` thêm `contents`; state trả ra thêm `contents`.
  Không đụng `LessonService` để các fake `LessonSource` của S3.x giữ nguyên.
- *Đã cân nhắc:* tải words/sentences trong `LessonService.openLesson` — bỏ vì đổi `LessonSource` và mọi fake. Nạp lười theo từng câu — bỏ vì dạng bài sync props.
- Tác động test cũ: các test S3.x mock `fetch` phải trả thêm `words.json`/`sentences.json`; gom vào helper `src/test/mocks/content-fetch.ts` để khỏi lặp.

### D7. i18n và style
- `assets/i18n/vi/lesson.json` thêm `listen.play` "Nghe", `listen.slow` "Nghe chậm", `listen.error` "Không phát được audio.".
- `styles/tailwind/components/_audio.css` (import trong `main.css`): `.listen-button`, `.is-playing`, `.slow-toggle` (`aria-checked="true"` đổi nền), `.listen-error`;
  layout/spacing trong JSX, visual qua `@apply` (CLAUDE.md §6), focus nhìn thấy, `prefers-reduced-motion`. Hit area ≥ 44px.

## Risks / Trade-offs

- [iOS Safari chặn phát khi không có thao tác] → không tự phát (đã chốt); `play()` luôn chạy trong handler `onClick`.
- [`play()` bị `AbortError` khi bấm dồn] → token trong `AudioService` phân biệt ngắt chủ động với lỗi thật; có test bấm liên tiếp.
- [Nạp cả `words.json`/`sentences.json` cho mỗi bài] → file nhỏ, service worker đã precache, `fetch` chạy một lần mỗi lần mở bài; chưa cần cache trong service.
- [Hợp đồng `ExerciseProps` đổi] → chưa có dạng bài nào đăng ký (`exerciseRegistry = {}`), nên chỉ đổi test/registry giả.
- [`HTMLMediaElement.play` không có ở jsdom] → mọi test dùng `Audio` giả ở ranh giới (spec-driven §5), kiểm hành vi (src, rate, số lần) không kiểm mock.

## Migration Plan

Không đổi schema nội dung hay IndexedDB; không có migration. Rollback = revert PR.

## Open Questions

- Không có. (Chưa có e2e vì nội dung Nhập môn dùng dạng bài nghe chưa soạn; xem `proposal.md`.)
