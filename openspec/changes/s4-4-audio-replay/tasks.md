# Tasks: S4.4 Nghe lại và nghe chậm

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do (thiếu hành vi, không phải lỗi import), commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID. Chỉ ghi code sau khi PR spec đã merge.
Mọi test dùng `Audio` giả ở ranh giới (không mock hook/service của ta). Đường dẫn tính từ `apps/web/src/app/`.

## 1. Hạ tầng phát audio — `core/services`, `core/constants`

- [x] 1.1 RED: test S4.4-AC1 "Bấm Nghe thì phát âm của câu" (phát một lần từ đầu: `src`, `currentTime = 0`) và S4.4-AC1 "Bấm khi đang phát thì phát lại từ đầu" (gọi `play` khi đang phát: chỉ một element, luồng cũ nhận `'interrupted'`, `currentTime` về 0) cho `AudioService` — Vitest thuần với `Audio` giả, `core/services/audio.service.test.ts`; kiểm: fail vì chưa có tệp
- [x] 1.2 GREEN: thêm `core/constants/audio.constants.ts` (`PLAYBACK_RATES`, `AUDIO_BASE_PATH`) và `core/services/audio.service.ts` (`play`, `stop`, token chống chồng); kiểm: test 1.1 pass
- [x] 1.3 RED: test S4.4-AC1 "Audio không phát được" (`play()` từ chối hoặc sự kiện `error` → reject; ngắt chủ động không reject) và S4.4-AC1 "Sang câu khác thì dừng audio" (`stop()` dừng luồng đang phát) — `audio.service.test.ts`; kiểm: fail
- [x] 1.4 GREEN: xử lý reject/`AbortError`/`stop`; kiểm: test 1.3 pass

## 2. Hook phát — `core/hooks/useAudioPlayer.ts`

- [x] 2.1 RED: test S4.4-AC1 "Nghe lại nhiều lần" (10 lần bấm sau khi lần trước phát xong → 10 lần phát, `isPlaying` về false, vẫn gọi `play` được) và S4.4-AC1 "Bấm khi đang phát thì phát lại từ đầu" (`isPlaying` giữ true qua lần bấm thứ hai, không nhận `'interrupted'` làm xong) — Vitest + Testing Library `renderHook`, `core/hooks/useAudioPlayer.test.ts`; kiểm: fail vì chưa có hook
- [x] 2.2 GREEN: thêm `useAudioPlayer` (`isPlaying`, `hasError`, `play`, `stop`; cờ `isMounted`); kiểm: test 2.1 pass
- [x] 2.3 RED: test S4.4-AC1 "Audio không phát được" (`hasError = true`, bấm lại được, lần sau thành công thì xóa lỗi) và S4.4-AC1 "Sang câu khác thì dừng audio" (unmount hook → `stop` được gọi, không `setState` sau unmount) — `useAudioPlayer.test.ts`; kiểm: fail
- [x] 2.4 GREEN: thêm xử lý lỗi và cleanup unmount; kiểm: test 2.3 pass

## 3. Công tắc tốc độ theo bài — `shared/contexts`

- [x] 3.1 RED: test S4.4-AC2 "Mặc định phát tốc độ thường", "Bật Nghe chậm thì phát 0.75x", "Tắt Nghe chậm thì về tốc độ thường" cho `AudioSpeedProvider`/`useAudioSpeed` (mặc định `false`; `toggleSlow` đảo; ngoài provider không lỗi) — Vitest + `renderHook`, `shared/contexts/AudioSpeedContext.test.tsx`; kiểm: fail vì chưa có tệp
- [x] 3.2 GREEN: thêm `AudioSpeedContext.tsx`; kiểm: test 3.1 pass

## 4. Nút Nghe và công tắc Nghe chậm — `shared/components`, i18n, style

- [x] 4.1 RED: test S4.4-AC1 "Câu vừa hiện thì chưa phát" (có nút "Nghe", `Audio.play` chưa được gọi), S4.4-AC1 "Bấm Nghe thì phát âm của câu" (phát đúng `audio` của từ, 1 lần), S4.4-AC1 "Nghe lại nhiều lần" (10 lần, nút vẫn bấm được) cho `ListenButton` — Vitest + Testing Library, `shared/components/ListenButton.test.tsx`; kiểm: fail vì chưa có component
- [x] 4.2 GREEN: thêm `ListenButton.tsx`, khóa i18n `lesson:listen.*` (`assets/i18n/vi/lesson.json`); kiểm: test 4.1 pass
- [x] 4.3 RED: test S4.4-AC1 "Audio không phát được" (hiện `role="alert"` "Không phát được audio.", nút "Nghe" vẫn bấm được, nút khác trong cùng màn không bị khóa) — `ListenButton.test.tsx`; kiểm: fail
- [x] 4.4 GREEN: nhánh `hasError` của `ListenButton`; kiểm: test 4.3 pass
- [x] 4.5 RED: test S4.4-AC2 "Mặc định phát tốc độ thường" (`playbackRate = 1`), "Bật Nghe chậm thì phát 0.75x" (`playbackRate = 0.75`, công tắc `aria-checked="true"`), "Tắt Nghe chậm thì về tốc độ thường" cho `SlowToggle` + `ListenButton` trong `AudioSpeedProvider` — Vitest + Testing Library, `shared/components/SlowToggle.test.tsx`; kiểm: fail vì chưa có component
- [x] 4.6 GREEN: thêm `SlowToggle.tsx` (`role="switch"`), nối `isSlow` vào `ListenButton`; kiểm: test 4.5 pass
- [x] 4.7 Style `styles/tailwind/components/_audio.css` + import trong `main.css` (ngoại lệ test-first: CSS thuần theo CLAUDE.md §0.7; không đổi hành vi, kiểm bằng `pnpm test:run` của `tokens.test.ts` và mắt trên preview `web-dev`)

## 5. Nạp từ/câu và hợp đồng dạng bài — `core/services`, `shared/services`, `pages/lesson` (kỹ thuật, không có Scenario riêng)

- [x] 5.1 RED: test `FetchContentSource.getWords`/`getSentences` (hợp lệ, HTTP lỗi, JSON sai schema → throw) — Vitest, `core/services/content-source.service.test.ts`; kiểm: fail vì chưa có method
- [x] 5.2 GREEN: thêm `getWords`/`getSentences` vào `ContentSource` và `FetchContentSource` (`wordSchema.array()`, `sentenceSchema.array()`); kiểm: test 5.1 pass
- [x] 5.3 RED: test `ContentService.collectContentIds` (Phần 2, mỗi `kind`: `wordId`, `wordIds`, `sentenceId`) và `getExerciseContents` (map theo `exercise.id`, đúng thứ tự, ID thiếu → throw message rõ, lỗi tải bị bọc) — Vitest thuần + source giả, `shared/services/content.service.test.ts`; kiểm: fail
- [x] 5.4 GREEN: thêm `ExerciseContent` (`shared/models/exercise.model.ts`), Phần 1/2/3 mới của `ContentService`; kiểm: test 5.3 pass
- [x] 5.5 RED: test `useLessonRunner` trả `contents` của bài; nội dung thiếu hoặc `words.json` lỗi → `hasError` — Vitest + Testing Library, `pages/lesson/hooks/useLessonRunner.test.ts`; kiểm: fail
- [x] 5.6 GREEN: `useLessonRunner` gọi `getExerciseContents` sau `openLesson`; thêm helper fetch `src/test/mocks/content-fetch.ts` và cập nhật test S3.x (`useLessonRunner.test.ts`, `LessonRunnerContainer.test.tsx`) trả `words.json`/`sentences.json`; kiểm: test 5.5 pass và các test S3.x cũ vẫn pass
- [x] 5.7 RED: test `LessonRunner` truyền `content` của câu hiện tại xuống dạng bài (registry giả đọc `content.words[0].hanzi`) — `pages/lesson/components/LessonRunner.test.tsx`; kiểm: fail
- [x] 5.8 GREEN: thêm `content` vào `ExerciseProps`, `LessonRunnerView`, `LessonRunner`, `LessonRunnerContainer`; kiểm: test 5.7 pass

## 6. Hành vi trong màn chạy bài — `pages/lesson/containers`

Dùng registry giả có `ListenButton` + `SlowToggle` + nút trả lời, `Audio` giả, store `fake-indexeddb`;
`apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.test.tsx`.

- [x] 6.1 RED: test S4.4-AC1 "Nghe lại sau khi đã chấm" (sau khi trả lời, `isLocked` true, nút "Nghe" vẫn bấm được và phát lại) và S4.4-AC1 "Sang câu khác thì dừng audio" (đang phát, bấm "Tiếp tục" → audio dừng); kiểm: fail vì chưa bọc provider/chưa có `content`
- [x] 6.2 GREEN: hoàn thiện nối `ListenButton` trong container (chưa cần thay đổi nếu 5.8 đủ); kiểm: test 6.1 pass
- [x] 6.3 RED: test S4.4-AC2 "Nghe chậm giữ qua các câu trong bài" (bật ở câu 1, sang câu 2: công tắc vẫn bật, phát 0.75x) và S4.4-AC2 "Mở bài mới thì về tốc độ thường" (bật rồi đổi `lessonId`/mở bài khác: công tắc tắt) ; kiểm: fail
- [x] 6.4 GREEN: bọc `AudioSpeedProvider key={lessonId}` trong `LessonRunnerContainer`; kiểm: test 6.3 pass

## 7. Kiểm tra và hoàn tất

- [x] 7.1 REFACTOR khi đã xanh; self-review §0, §2 (đặc biệt `shared/components` và `shared/components/exercises` không import `shared/services`), §6, §7 (a11y: `role="switch"`, focus nhìn thấy, `prefers-reduced-motion`)
- [x] 7.2 Verify: `pnpm typecheck && pnpm lint && pnpm test:run`
- [x] 7.3 Verify build: `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` (đụng CSS, i18n)
- [x] 7.4 Xem UI trên preview `web-dev` (nút Nghe, công tắc, thông báo lỗi) sáng/tối, 375×812 và 1280×800 cho screenshot PR; chưa có dạng bài nghe nên dùng trang thử tạm, **không commit**
- [x] 7.5 Tick mọi task; PR ghi `Spec PR: #<số>` và `Refs #29`
