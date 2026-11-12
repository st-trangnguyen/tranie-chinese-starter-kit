# Tasks: S3.5 Kiểm tra cuối chủ đề

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.
Chỉ làm sau khi PR spec đã merge **và** code S3.4 (và S3.3) đã merge vào `main`.

## 1. Quy tắc đạt/chưa đạt — `shared/services/lesson.service.ts` Phần 2

- [x] 1.1 Thêm `TEST_PASS_PERCENT = 80` vào `core/constants/lesson.constants.ts` — ngoại lệ test-first: hằng số thuần, được test ở 1.2; kiểm: `pnpm typecheck`
- [x] 1.2 RED: test S3.5-AC1 "Đạt đúng 80%", "Đạt trên 80%", "Chưa đạt thì chủ đề tiếp theo vẫn khóa" (23/30), "Điểm gần ngưỡng nhưng chưa tới" (39/49) cho `isTestPassed` — Vitest thuần, `apps/web/src/app/shared/services/lesson.service.test.ts`; kiểm: fail vì thiếu `isTestPassed`
- [x] 1.3 GREEN: thêm `isTestPassed` (so sánh số nguyên); kiểm: test 1.2 pass
- [x] 1.4 RED: test S3.5-AC1 "Còn câu bỏ qua thì chưa đạt", "Bài học thường không cần điểm tối thiểu" cho `summarize(session, lessonType)` (`isPassed`, `isComplete` theo loại bài) — `lesson.service.test.ts`; kiểm: fail
- [x] 1.5 GREEN: mở rộng `summarize` và `isComplete` theo `lessonType`; kiểm: test 1.4 pass
- [x] 1.6 RED: test S3.5-AC2 "Chưa đạt thì câu sai được chuyển", "Làm lại không chuyển trùng câu của lần trước" cho `wrongExerciseIds` trong `submitResult` (bấm đúp không ghi đôi) — `lesson.service.test.ts`; kiểm: fail
- [x] 1.7 GREEN: thêm `wrongExerciseIds` vào `LessonSession` và `submitResult`; kiểm: test 1.6 pass

## 2. Use case kết thúc bài kiểm tra — Phần 3

- [x] 2.1 RED: test S3.5-AC1 "Đạt đúng 80%" (bản đồ: bài kiểm tra "Đã xong", chủ đề kế "Đang mở"), "Chưa đạt thì chủ đề tiếp theo vẫn khóa", "Còn câu bỏ qua thì chưa đạt", "Đã đạt rồi làm lại điểm thấp hơn" qua `finishLesson` + `getCompletedLessonIds` + `deriveLessonStatuses` — Vitest + `fake-indexeddb`, `lesson.service.test.ts`; kiểm: fail vì `finishLesson` chưa theo loại bài
- [x] 2.2 GREEN: `finishLesson` chỉ ghi `completed` khi `isComplete` theo loại bài; kiểm: test 2.1 pass
- [x] 2.3 RED: test S3.5-AC2 "Chưa đạt thì câu sai được chuyển", "Đạt nhưng còn câu sai vẫn được chuyển", "Không sai câu nào thì không chuyển gì" với `WrongAnswerSink` giả; lỗi của cổng thì `isSaved = false` — `lesson.service.test.ts`; kiểm: fail vì thiếu cổng
- [x] 2.4 GREEN: thêm interface `WrongAnswerSink` (bản mặc định không làm gì), `LessonService` nhận qua constructor, `finishLesson` gọi cho bài `test`; kiểm: test 2.3 pass
- [x] 2.5 RED: test S3.5-X1 "Mở lại bài kiểm tra đang làm dở" (`openLesson` bỏ qua vị trí đã lưu, `saveCursor` không ghi cho bài `test`) — `lesson.service.test.ts`; kiểm: fail
- [x] 2.6 GREEN: xử lý bài `test` trong `openLesson` và `saveCursor`; kiểm: test 2.5 pass

## 3. Màn tổng kết bài kiểm tra — `pages/lesson`

- [x] 3.1 RED: test S3.5-AC2 "Chưa đạt thì hiện nút làm lại", "Đạt thì báo đạt và không hiện nút làm lại", "Bấm làm lại thì bắt đầu từ câu 1" (điểm/thời gian/số câu sai tính lại), "Làm lại nhiều lần"; S3.5-X1 ở mức màn hình — Vitest + Testing Library, `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.test.tsx`, registry giả, bài `type: test` giả; kiểm: fail
- [x] 3.2 GREEN: `LessonSummary` nhận `isPassed`, hiện dòng đạt/chưa đạt và nút "Làm lại" (focus về "Câu 1 / n"); `useLessonRunner.restart()`; i18n `lesson.json`; kiểm: test 3.1 pass
- [x] 3.3 Style BEM cho dòng đạt/chưa đạt và nút làm lại trong `apps/web/src/styles/tailwind/` (JSX chỉ layout/spacing, contrast ≥ 4.5:1, không chỉ dùng màu, focus thấy được, sáng + tối) — ngoại lệ test-first: CSS thuần; kiểm: xem preview `web-dev` ở 375px sáng/tối

## 4. Kiểm tra

- [x] 4.0 Cập nhật `docs/03-architecture.md` (`type: test`, ngưỡng 80%, `WrongAnswerSink`) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [x] 4.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [x] 4.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và ghi kết quả thật; kiểm: toàn bộ pass. e2e chưa có (Câu hỏi mở 5), nêu rõ trong PR
- [ ] 4.3 Chụp screenshot màn tổng kết bài kiểm tra (đạt, chưa đạt) mobile 375×812 và desktop 1280×800, sáng và tối cho PR; kiểm: có file ảnh

## Workflow follow-up

- PR code: `Spec PR: #<số PR spec>`, `OpenSpec change: s3-5-topic-test`, `Closes #53` (đủ AC1–AC2; phần tạo thẻ SRS thuộc S9.4, ghi rõ trong PR). Không archive trong PR code.
