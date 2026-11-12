# Tasks: S3.6 Kiểm tra vượt cấp

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.
Chỉ làm sau khi PR spec đã merge **và** code S3.5 (kéo theo S3.4, S3.3) đã merge vào `main`.

## 1. Quy tắc chủ đề nào có nút — `shared/services/progress.service.ts` Phần 2

- [x] 1.1 RED: test S3.6-AC1 "Chủ đề chưa mở có nút", "Chủ đề đang mở không có nút", "Chủ đề đã xong không có nút", "Chủ đề không có bài kiểm tra không có nút" cho `getPlacementTestLessonId` (kèm chủ đề nhiều bài `test` lấy bài cuối) — Vitest thuần, `apps/web/src/app/shared/services/progress.service.test.ts`; kiểm: fail vì thiếu method
- [x] 1.2 GREEN: thêm `getPlacementTestLessonId` (comment "Rule: …"); kiểm: test 1.1 pass

## 2. Ghi tiến độ hàng loạt — `core/services`

- [x] 2.1 RED: test `saveLessonProgressBatch` ghi mọi dòng hoặc không dòng nào khi một dòng lỗi — Vitest + `fake-indexeddb`, `apps/web/src/app/core/services/progress-store.service.test.ts`; kiểm: fail vì thiếu method
- [x] 2.2 GREEN: thêm `saveLessonProgressBatch` (transaction Dexie) vào `ProgressStore` và `DexieProgressStore`; kiểm: test 2.1 pass

## 3. Kết thúc bài vượt cấp — `shared/services/lesson.service.ts` Phần 3

- [x] 3.1 RED: test S3.6-AC2 "Đạt thì chủ đề xong và chủ đề kế mở", "Vượt chủ đề ở xa không mở các chủ đề ở giữa" qua `finishLesson` với `placement` + `getCompletedLessonIds` + `deriveLessonStatuses` — Vitest + `fake-indexeddb`, `lesson.service.test.ts`; kiểm: fail vì `finishLesson` chưa hiểu `placement`
- [x] 3.2 GREEN: `finishLesson` ghi `completed` mọi bài của chủ đề bằng `saveLessonProgressBatch` khi đạt; kiểm: test 3.1 pass
- [x] 3.3 RED: test S3.6-AC2 "Chưa đạt thì chủ đề giữ nguyên khóa", "Còn câu bỏ qua thì chưa đạt", và ghi lỗi → `isSaved = false` — `lesson.service.test.ts`; kiểm: fail
- [x] 3.4 GREEN: không ghi gì khi chưa đạt/còn câu bỏ qua, bắt lỗi ghi; kiểm: test 3.3 pass

## 4. Bản đồ và màn vượt cấp — `pages/learning-path`, `pages/lesson`

- [x] 4.1 RED: test S3.6-AC1 "Chủ đề chưa mở có nút", "Chủ đề đang mở không có nút", "Bài khóa trong chủ đề vẫn không vào được" — Vitest + Testing Library, `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.test.tsx`, nguồn nội dung giả ở ranh giới `fetch`; kiểm: fail
- [x] 4.2 GREEN: `useLearningPath` nạp loại bài của chủ đề chưa mở (`Promise.all`) và trả `placementTestUnitIds`; nút trong `LearningPathStage`; i18n; kiểm: test 4.1 pass
- [x] 4.3 RED: test S3.6-AC1 "Bấm nút vào bài kiểm tra của chủ đề" (mở ở "Câu 1 / n", `unitId` sai thì báo không mở được), S3.6-AC2 "Chưa đạt thì làm lại được" — `apps/web/src/app/pages/lesson/containers/PlacementTestContainer.test.tsx`, registry giả; kiểm: fail vì chưa có container
- [x] 4.4 GREEN: thêm route `units/:unitId/placement-test` (RESTful, D1), `PlacementTestContainer` dùng lại `useLessonRunner` và `LessonSummary` của S3.5; kiểm: test 4.3 pass
- [x] 4.5 Style BEM cho nút "Kiểm tra vượt cấp" trong `apps/web/src/styles/tailwind/` (JSX chỉ layout/spacing, contrast ≥ 4.5:1, focus thấy được, sáng + tối) — ngoại lệ test-first: CSS thuần; kiểm: xem preview `web-dev` ở 375px sáng/tối

## 5. Kiểm tra

- [x] 5.0 Cập nhật `docs/03-architecture.md` (route vượt cấp, `saveLessonProgressBatch`) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [x] 5.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [x] 5.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và ghi kết quả thật; kiểm: toàn bộ pass. e2e chưa có (Câu hỏi mở 4), nêu rõ trong PR
- [x] 5.3 Chụp screenshot bản đồ có nút và màn tổng kết vượt cấp mobile 375×812 và desktop 1280×800, sáng và tối cho PR; kiểm: có file ảnh

## Workflow follow-up

- PR code: `Spec PR: #<số PR spec>`, `OpenSpec change: s3-6-placement-test`, `Closes #54` (đủ AC1–AC2). Không archive trong PR code.
