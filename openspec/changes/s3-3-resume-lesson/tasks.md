# Tasks: S3.3 Học tiếp từ câu đang dở

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.
Chỉ làm sau khi PR spec đã merge vào `main`.

## 1. Schema và store — `packages/shared`, `core/services`

- [x] 1.1 RED: test `cursor` hợp lệ được giữ, `cursor` hỏng (âm, không nguyên, sai kiểu) thành `undefined` mà dòng vẫn hợp lệ (nền cho S3.3-AC2 "Vị trí đã ghi nhớ không đọc được thì về câu 1", S3.3-X2) — Vitest, `packages/shared/src/progress.schema.test.ts`; kiểm: fail vì schema chưa có `cursor`
- [x] 1.2 GREEN: thêm `cursor` vào `lessonProgressSchema`; kiểm: test 1.1 pass
- [x] 1.3 RED: test `getLessonProgress` (có, không có, dòng hỏng → `undefined`) và `saveLessonProgress` ghi rồi đọc lại — Vitest + `fake-indexeddb`, `apps/web/src/app/core/services/progress-store.service.test.ts`; kiểm: fail vì thiếu method
- [x] 1.4 GREEN: thêm hai method vào `ProgressStore` và `DexieProgressStore`; kiểm: test 1.3 pass

## 2. Quy tắc vị trí — `shared/services/lesson.service.ts` Phần 2

- [x] 2.1 RED: test S3.3-AC2 "Bài chưa học bao giờ bắt đầu ở câu 1", "Vị trí đã ghi nhớ không đọc được thì về câu 1", "Bài bị rút bớt câu thì về câu 1", "Mở lại bài đang dở" cho `resolveStartIndex` và `startSession(exercises, startIndex)` — Vitest thuần, `apps/web/src/app/shared/services/lesson.service.test.ts`; kiểm: fail vì thiếu `resolveStartIndex`
- [x] 2.2 GREEN: thêm `resolveStartIndex`, mở rộng `startSession` (comment "Rule: …"); kiểm: test 2.1 pass
- [x] 2.3 RED: test S3.3-X2 cho `nextProgress` (bài đã xong giữ `completed`, bài khác thành `in-progress`, ghi `cursor`) — `lesson.service.test.ts`; kiểm: fail vì thiếu `nextProgress`
- [x] 2.4 GREEN: thêm `nextProgress`; kiểm: test 2.3 pass

## 3. Use case lưu và mở lại — `shared/services/lesson.service.ts` Phần 1 + 3

- [x] 3.1 RED: test S3.3-AC1 "Thoát sau khi sang câu kế", "Bỏ qua câu cũng cập nhật vị trí", "Mỗi bài có vị trí riêng" cho `saveCursor` và S3.3-AC2 "Mở lại bài đang dở" cho `openLesson` — Vitest + `fake-indexeddb` (store thật, nguồn nội dung giả), `lesson.service.test.ts`; kiểm: fail vì thiếu `saveCursor` và `openLesson` chưa đọc vị trí
- [x] 3.2 GREEN: `LessonService` nhận `ProgressStore` qua constructor, thêm Phần 1 `readCursor`/`writeCursor`, Phần 3 `saveCursor`, sửa `openLesson`; kiểm: test 3.1 pass
- [x] 3.3 RED: test S3.3-X1 "Làm xong câu cuối rồi mở lại bài", S3.3-X2 "Làm lại bài đã xong rồi thoát giữa chừng" (bản đồ vẫn thấy bài xong qua `getCompletedLessonIds`), và đọc tiến độ lỗi thì `openLesson` vẫn mở ở câu 1 — `lesson.service.test.ts`; kiểm: fail
- [x] 3.4 GREEN: xử lý `phase = 'finished'` trong `saveCursor`, bắt lỗi đọc trong `openLesson`; kiểm: test 3.3 pass

## 4. Hook và màn chạy bài — `pages/lesson`

- [x] 4.1 RED: test S3.3-AC1 "Thoát khi đang xem kết quả câu", "Không lưu được thì vẫn học tiếp" (store giả ném lỗi ở ranh giới) — Vitest + Testing Library, `apps/web/src/app/pages/lesson/hooks/useLessonRunner.test.ts`; kiểm: fail vì hook chưa lưu
- [x] 4.2 GREEN: `useLessonRunner` gọi `saveCursor` khi `currentIndex` hoặc `phase = 'finished'` đổi, nuốt lỗi ghi; kiểm: test 4.1 pass
- [x] 4.3 RED: test S3.3-AC2 "Mở lại bài đang dở" (thanh "Câu 3 / 5"), "Câu đang dở làm lại từ đầu câu" — `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.test.tsx`, registry giả, store `fake-indexeddb`; kiểm: fail
- [x] 4.4 GREEN: nối container với phiên đã mở ở vị trí lưu; kiểm: test 4.3 pass

## 5. Kiểm tra

- [x] 5.0 Cập nhật `docs/03-architecture.md` (`cursor` trong `lessonProgress`, `ProgressStore.getLessonProgress/saveLessonProgress`) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [x] 5.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [x] 5.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và ghi kết quả thật; kiểm: toàn bộ pass. e2e chưa có (Câu hỏi mở 1), nêu rõ trong PR

## Workflow follow-up

- PR code: `Spec PR: #<số PR spec>`, `OpenSpec change: s3-3-resume-lesson`, `Closes #24` (S3.3 đủ AC1–AC2). Không archive trong PR code.
