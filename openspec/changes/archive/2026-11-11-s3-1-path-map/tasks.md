# Tasks: S3.1 Bản đồ lộ trình

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.

## 0. Chuẩn hoá route bài học `/lesson/:id` → `/lessons/:id` (design D4b)

- [x] 0.1 RED: sửa kỳ vọng URL sang `/lessons/intro-01` trong `apps/web/src/app/pages/onboarding/containers/OnboardingContainer.test.tsx`, `apps/web/e2e/E1/s1.3-onboarding.spec.ts`, `apps/web/e2e/E1/s1.2-offline.spec.ts`; kiểm: `pnpm test:run OnboardingContainer` fail vì app vẫn dùng `/lesson/`
- [x] 0.2 GREEN: đổi `ROUTE_PATHS.lesson` thành `/lessons/${id}` và route `lessons/:lessonId` trong `pages/lesson/lesson.routes.ts`; kiểm: test 0.1 pass, `pnpm e2e` (E1) pass

## 1. Quy tắc trạng thái bài (S3.1-AC2) — `shared/services` Phần 2

- [x] 1.1 RED: viết test fail cho S3.1-AC2 "Chưa học bài nào", "Xong bài trước thì bài kế tiếp mở", "Bài kế tiếp nằm ở nhóm hoặc giai đoạn sau" — Vitest thuần, `apps/web/src/app/shared/services/progress.service.test.ts`; kiểm: `pnpm test:run progress.service` fail vì thiếu `deriveLessonStatuses`
- [x] 1.2 GREEN: thêm `LessonStatus` + `deriveLessonStatuses(stages, completedLessonIds)` vào Phần 2 của `ProgressService` (comment "Rule: …"); kiểm: test 1.1 pass

## 2. Đọc tiến độ bài (S3.1-AC2 tiến độ hỏng) — `@csk/shared` + `core/services`

- [x] 2.1 RED: test `lessonProgressSchema` (hợp lệ / sai status / thiếu lessonId) — `packages/shared/src/progress.schema.test.ts`; kiểm: fail vì chưa có schema
- [x] 2.2 GREEN: thêm `lessonProgressSchema`, `LessonProgress`, export từ `@csk/shared`; kiểm: test 2.1 pass
- [x] 2.3 RED: test S3.1-AC2 "Tiến độ lưu bị hỏng không làm sai trạng thái" cho `getAllLessonProgress` (dòng hỏng bị bỏ qua) và nâng DB v1 → v2 giữ nguyên `settings` — Vitest + `fake-indexeddb`, `apps/web/src/app/core/services/progress-store.service.test.ts`; kiểm: fail vì thiếu bảng/method
- [x] 2.4 GREEN: Dexie `version(2)` thêm `lessonProgress: 'lessonId'` trong `core/helpers/db.helper.ts` (không sửa version 1); thêm `getAllLessonProgress` vào `ProgressStore` + `DexieProgressStore`; kiểm: test 2.3 pass
- [x] 2.5 RED: test use case `getCompletedLessonIds()` với store giả (chỉ lấy `status: 'completed'`) — `progress.service.test.ts`; kiểm: fail vì thiếu method
- [x] 2.6 GREEN: thêm Phần 1 `readAllLessonProgress` + Phần 3 `getCompletedLessonIds` vào `ProgressService`; kiểm: test 2.5 pass

## 3. Nạp nội dung lộ trình (S3.1-AC1) — `core/services` + `shared/services`

- [x] 3.1 RED: test S3.1-AC1 "Bản đồ giữ đúng thứ tự giai đoạn, nhóm và bài" cho `ContentService.getPathMap()` với `ContentSource` giả (2 giai đoạn, nhiều nhóm, tiêu đề lấy từ bài) — `apps/web/src/app/shared/services/content.service.test.ts`; kiểm: fail vì chưa có service
- [x] 3.2 GREEN: thêm `core/services/content-source.service.ts` (interface `ContentSource` + bản `fetch`, parse bằng `contentRootSchema`/`lessonSchema`) và `shared/services/content.service.ts` (3 phần); kiểm: test 3.1 pass
- [x] 3.3 RED: test bản `fetch` của `ContentSource` báo lỗi rõ nghĩa khi JSON sai schema — `apps/web/src/app/core/services/content-source.service.test.ts` (mock `fetch` ở ranh giới); kiểm: fail
- [x] 3.4 GREEN: xử lý lỗi validate/HTTP trong `ContentSource`; kiểm: test 3.3 pass

## 4. Màn bản đồ lộ trình (S3.1-AC1, AC2, AC3) — `pages/learning-path`

- [x] 4.1 RED: test component S3.1-AC1 (thứ tự giai đoạn/nhóm/bài hiện trên màn) — Vitest + Testing Library (`src/test/render.tsx`), `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.test.tsx`, mock `fetch` nội dung, `fake-indexeddb` cho tiến độ; kiểm: fail vì chưa có màn
- [x] 4.2 GREEN: thêm `ROUTE_PATHS.learningPaths`, `learning-path.routes.ts` (gom vào `page.routes.ts`), `useLearningPath`, `LearningPathContainer`, `LearningPathStage`, `LearningPathLessonItem`, i18n `assets/i18n/vi/learning-path.json`; kiểm: test 4.1 pass
- [x] 4.3 RED: test S3.1-AC2 "Bản đồ hiện nhãn trạng thái của từng bài" (seed 1 bài đã xong → thấy "Đã xong", "Đang mở", "Đã khóa") — `LearningPathContainer.test.tsx`; kiểm: fail
- [x] 4.4 GREEN: hiện nhãn trạng thái (chữ + icon `aria-hidden`); kiểm: test 4.3 pass
- [x] 4.5 RED: test S3.1-AC3 "Bấm bài khóa" (vẫn ở `/learning-paths`) và "Bấm bài đang mở" (tới `/lessons/<id>`) dùng `LocationProbe` — `LearningPathContainer.test.tsx`; kiểm: fail
- [x] 4.6 GREEN: bài mở/xong là `<Link>`, bài khóa không tương tác (không link, nhãn "Đã khóa"; không `aria-disabled` vì không phải control — design D5); kiểm: test 4.5 pass
- [x] 4.7 Style BEM cho bản đồ trong `apps/web/src/styles/tailwind/` (JSX chỉ layout/spacing, contrast ≥ 4.5:1, focus thấy được, sáng + tối) — ngoại lệ test-first: CSS thuần; kiểm: xem preview `web-dev` ở 375px sáng/tối

## 5. Luồng thật (S3.1-AC1) — e2e

- [x] 5.1 RED: test Playwright S3.1-AC1 "Mở bản đồ lộ trình trong app thật" (xong onboarding → `/learning-paths` → thấy "Nhập môn" và tiêu đề `intro-01`) — `apps/web/e2e/E3/s3.1-learning-path.spec.ts`, theo mẫu `test.describe('S3.1 …')`; kiểm: `pnpm e2e` fail trước 4.2 (nếu viết sau 4.2 thì tạm đổi route để thấy fail, rồi trả lại)
- [x] 5.2 GREEN: sửa đến khi pass; kiểm: `pnpm e2e` pass

## 6. Kiểm tra

- [x] 6.0 Cập nhật `docs/03-architecture.md` (cây thư mục `pages/learning-path`, i18n `learning-path.json`, ghi quy ước route RESTful) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff

- [x] 6.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [x] 6.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm e2e` và ghi kết quả thật; kiểm: toàn bộ pass
- [x] 6.3 Chụp screenshot màn `/learning-paths` mobile 375px sáng và tối cho PR; kiểm: có file ảnh

## Workflow follow-up

- `/opsx:archive s3-1-path-map`, rồi `pnpm exec openspec validate --all --strict`.
- PR: `Closes #22` (S3.1 làm đủ AC1–AC3). Ghi chú IndexedDB lên version 2.
