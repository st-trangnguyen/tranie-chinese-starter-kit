# Tasks: S3.4 Tổng kết bài và mở khóa

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do, commit
`test(...)`; mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID.
Chỉ làm sau khi PR spec đã merge **và** code S3.3 đã merge vào `main` (S3.4 dùng `saveLessonProgress` và `nextProgress` của S3.3).

## 1. Tiện ích thời gian — `shared/utils`

- [ ] 1.1 RED: test S3.4-AC1 "Thời gian hiện theo phút và giây", "Thời gian dưới một phút" cho `formatDuration` (125 → `2:05`, 9 → `0:09`, 0 → `0:00`, 3600 → `60:00`) — Vitest thuần, `apps/web/src/app/shared/utils/duration.utils.test.ts`; kiểm: fail vì chưa có tệp
- [ ] 1.2 GREEN: thêm `duration.utils.ts`; kiểm: test 1.1 pass

## 2. Quy tắc tổng kết — `shared/services/lesson.service.ts` Phần 2

- [ ] 2.1 RED: test S3.4-AC1 "Tổng kết sau câu cuối", "Làm đúng hết", "Làm sai hết", "Điểm làm tròn thành số nguyên" cho `submitResult` đếm đúng/sai (bấm đúp không đếm đôi) và `summarize` — Vitest thuần, `apps/web/src/app/shared/services/lesson.service.test.ts`; kiểm: fail vì thiếu bộ đếm và `summarize`
- [ ] 2.2 GREEN: thêm `correctCount`/`wrongCount`/`startedAt`/`finishedAt` vào `LessonSession` (`lesson-session.model.ts`), mở rộng `startSession`/`advance`/`skip` nhận `now`, thêm `summarize`; kiểm: test 2.1 pass
- [ ] 2.3 RED: test S3.4-AC1 "Có câu bỏ qua", "Làm tiếp từ câu đang dở" (bộ đếm bắt đầu từ 0, thời gian từ lúc mở) và `isComplete` false khi còn câu bỏ qua — `lesson.service.test.ts`; kiểm: fail
- [ ] 2.4 GREEN: hoàn thiện `isComplete`, thời gian không âm; kiểm: test 2.3 pass

## 3. Kết thúc bài — `shared/services/lesson.service.ts` Phần 3

- [ ] 3.1 RED: test S3.4-AC2 "Xong bài thì bài kế tiếp mở", "Điểm thấp vẫn xong bài", "Bài cuối của nhóm mở bài đầu nhóm kế" cho `finishLesson` ghi `completed` rồi suy trạng thái bản đồ bằng `ProgressService.getCompletedLessonIds` + `deriveLessonStatuses` — Vitest + `fake-indexeddb`, `lesson.service.test.ts`; kiểm: fail vì thiếu `finishLesson`
- [ ] 3.2 GREEN: thêm `finishLesson` (ghi `completed`, bỏ `cursor`); kiểm: test 3.1 pass
- [ ] 3.3 RED: test S3.4-AC2 "Còn câu bỏ qua thì bài chưa xong", "Thoát giữa chừng thì bài chưa xong", "Làm lại bài đã xong không hạ trạng thái", "Xong bài rồi mở lại thì bắt đầu câu 1" — `lesson.service.test.ts`; kiểm: fail
- [ ] 3.4 GREEN: không ghi `completed` khi `isComplete` false, giữ `completed` đã có; kiểm: test 3.3 pass
- [ ] 3.5 RED: test S3.4-AC1 "Ghi tiến độ lỗi" (store giả ném lỗi ở ranh giới → `isSaved = false`, tổng kết vẫn trả về) — `lesson.service.test.ts`; kiểm: fail
- [ ] 3.6 GREEN: bắt lỗi ghi trong `finishLesson`; kiểm: test 3.5 pass

## 4. Màn tổng kết — `pages/lesson`

- [ ] 4.1 RED: test S3.4-AC1 "Tổng kết sau câu cuối", "Chưa hết bài thì chưa có tổng kết", "Ghi tiến độ lỗi", và các Scenario S3.2 về thông báo đã làm xong/focus vẫn pass — Vitest + Testing Library, `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.test.tsx`, registry giả, store `fake-indexeddb`; kiểm: fail vì chưa có màn tổng kết
- [ ] 4.2 GREEN: `useLessonRunner` gọi `finishLesson` một lần khi hết câu (effect có cờ và cleanup), thêm `LessonSummary` thay `LessonFinished` (tiêu đề giữ chữ cũ, `dl` điểm/thời gian/số câu sai, `role="alert"` khi chưa lưu), i18n `lesson.json`; kiểm: test 4.1 pass
- [ ] 4.3 Style BEM màn tổng kết trong `apps/web/src/styles/tailwind/` (JSX chỉ layout/spacing, contrast ≥ 4.5:1, focus thấy được, sáng + tối, `prefers-reduced-motion`) — ngoại lệ test-first: CSS thuần; kiểm: xem preview `web-dev` ở 375px sáng/tối
- [ ] 4.4 Xoá `LessonFinished.tsx` và test cũ; kiểm: `pnpm test:run` pass

## 5. Kiểm tra

- [ ] 5.0 Cập nhật `docs/03-architecture.md` (vòng đời bài: xong → `completed`, `LessonService.finishLesson`) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 5.1 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, dependency một chiều, file < 300 dòng); kiểm: `pnpm lint` sạch
- [ ] 5.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và ghi kết quả thật; kiểm: toàn bộ pass. e2e chưa có (Câu hỏi mở 5), nêu rõ trong PR
- [ ] 5.3 Chụp screenshot màn tổng kết mobile 375×812 và desktop 1280×800, sáng và tối cho PR; kiểm: có file ảnh

## Workflow follow-up

- PR code: `Spec PR: #<số PR spec>`, `OpenSpec change: s3-4-lesson-summary`, `Closes #25` (S3.4 đủ AC1–AC2). Không archive trong PR code.
