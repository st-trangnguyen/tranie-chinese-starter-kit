# Tasks: S3.2 Chạy bài

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.

## 1. Hợp đồng dạng bài tập — `shared/components/exercises`

- [x] 1.1 Thêm `exercise.types.ts` (`ExerciseResult { isCorrect, explanation? }`, `ExerciseProps<K>`) và `exercise.registry.ts` (`ExerciseRegistry`, `exerciseRegistry` rỗng) — ngoại lệ test-first: chỉ là type + map rỗng, hành vi được test ở nhóm 4; kiểm: `pnpm typecheck`

## 2. Quy tắc phiên làm bài (S3.2-AC1, AC2, AC3) — `shared/services/lesson.service.ts` Phần 2

- [x] 2.1 RED: test fail cho S3.2-AC1 "Bài mở ra ở câu đầu tiên", "Sang câu kế thì thanh tiến độ tăng", "Làm xong câu cuối" — Vitest thuần, `apps/web/src/app/shared/services/lesson.service.test.ts`; kiểm: `pnpm test:run lesson.service` fail vì chưa có `LessonService`
- [x] 2.2 GREEN: thêm `LessonSession`, `startSession`, `advance` (Phần 2, comment "Rule: …"); kiểm: test 2.1 pass
- [x] 2.3 RED: test S3.2-AC2 "Chưa trả lời thì chưa có kết quả", "Trả lời đúng được báo ngay", "Trả lời sai được báo ngay" (gồm bấm đúp bị bỏ qua, `advance` khi chưa chấm bị bỏ qua) — `lesson.service.test.ts`; kiểm: fail vì thiếu `submitResult`
- [x] 2.4 GREEN: thêm `submitResult` và chặn `advance` ngoài pha `feedback`; kiểm: test 2.3 pass
- [x] 2.5 RED: test S3.2-AC3 "Trả lời sai hiện giải thích", "Trả lời đúng thì không có giải thích" cho `shouldShowExplanation` — `lesson.service.test.ts`; kiểm: fail
- [x] 2.6 GREEN: thêm `shouldShowExplanation`; kiểm: test 2.5 pass

## 3. Nạp bài (S3.2-AC1 "Không mở được bài") — `shared/services` Phần 1 + 3

- [ ] 3.1 RED: test `ContentService.getLesson(id)` với `ContentSource` giả (trả bài; ném lỗi khi không có/sai schema) — `content.service.test.ts`; kiểm: fail vì thiếu method
- [ ] 3.2 GREEN: thêm `getLesson` vào Phần 3 của `ContentService`; kiểm: test 3.1 pass
- [ ] 3.3 RED: test S3.2-AC1 "Không mở được bài" cho `LessonService.openLesson` (nguồn giả ném lỗi → `openLesson` throw rõ nghĩa; bài hợp lệ → session ở câu 1) — `lesson.service.test.ts`; kiểm: fail vì thiếu `openLesson`
- [ ] 3.4 GREEN: thêm Phần 1 `readLesson` + Phần 3 `openLesson`; kiểm: test 3.3 pass

## 4. Khung chạy bài (S3.2-AC1, AC2, AC3) — `pages/lesson`

- [ ] 4.1 RED: test `LessonRunner` chọn component theo `kind` từ registry truyền qua props (dạng bài giả) — Vitest + Testing Library (`src/test/render.tsx`), `apps/web/src/app/pages/lesson/components/LessonRunner.test.tsx`; kiểm: fail vì chưa có component
- [ ] 4.2 GREEN: thêm `LessonRunner`, `LessonProgressBar` (`role="progressbar"`, chữ "Câu k / n"), `LessonFeedback`, `LessonFinished` (tạm); kiểm: test 4.1 pass
- [ ] 4.3 RED: test S3.2-AC1 "Bài mở ra ở câu đầu tiên", "Sang câu kế thì thanh tiến độ tăng", "Làm xong câu cuối", "Không mở được bài" — `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.test.tsx`, nguồn nội dung giả ở ranh giới `fetch`, registry giả; kiểm: fail vì chưa có container
- [ ] 4.4 GREEN: thêm `useLessonRunner` (`useState<LessonSession>`, gọi `LessonService`), `LessonRunnerContainer`, gom vào `lesson.routes.ts` thay `LessonPlaceholder`, i18n `assets/i18n/vi/lesson.json`; kiểm: test 4.3 pass
- [ ] 4.5 RED: test S3.2-AC2 "Trả lời đúng được báo ngay", "Trả lời sai được báo ngay", "Chưa trả lời thì chưa có kết quả" — `LessonRunnerContainer.test.tsx`; kiểm: fail
- [ ] 4.6 GREEN: hiện `LessonFeedback` khi phase `feedback` (chữ + biểu tượng `aria-hidden`, `role="status"`, focus vào "Tiếp tục"); kiểm: test 4.5 pass
- [ ] 4.7 RED: test S3.2-AC3 "Trả lời sai hiện giải thích", "Chưa bấm Tiếp tục thì chưa sang câu sau", "Trả lời đúng thì không có giải thích" — `LessonRunnerContainer.test.tsx`; kiểm: fail
- [ ] 4.8 GREEN: hiện giải thích theo `shouldShowExplanation`, chặn sang câu kế tới khi bấm "Tiếp tục"; kiểm: test 4.7 pass
- [ ] 4.9 Style BEM cho khung chạy bài trong `apps/web/src/styles/tailwind/` (JSX chỉ layout/spacing, contrast ≥ 4.5:1, focus thấy được, sáng + tối, `prefers-reduced-motion`) — ngoại lệ test-first: CSS thuần; kiểm: xem preview `web-dev` ở 375px sáng/tối
- [ ] 4.10 Xoá `LessonPlaceholder` + test + i18n `placeholder.*`; sửa các test cũ còn chờ chữ của màn giữ chỗ (`OnboardingContainer.test.tsx`, `e2e/E1/s1.2-offline.spec.ts`, `e2e/E1/s1.3-onboarding.spec.ts`) nếu có; kiểm: `pnpm test:run` và `pnpm e2e` (E1) pass

## 5. Kiểm tra

- [ ] 5.0 Cập nhật `docs/03-architecture.md` (hợp đồng `ExerciseResult`, registry rỗng cho tới E4–E6, `LessonService`) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 5.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [ ] 5.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm e2e` và ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 5.3 Chụp screenshot màn chạy bài (đang làm, đúng, sai kèm giải thích) mobile 375×812 và desktop 1280×800, sáng và tối cho PR; kiểm: có file ảnh

## Workflow follow-up

- `/opsx:archive s3-2-lesson-runner`, rồi `pnpm exec openspec validate --all --strict` (mở PR review trước, archive sau review).
- PR: `Closes #23` (S3.2 làm đủ AC1–AC3). Chưa có e2e; nêu rõ trong PR.
