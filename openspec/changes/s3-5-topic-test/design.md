# Design: S3.5 Kiểm tra cuối chủ đề

## Context

- `lessonSchema` đã có `type: 'lesson' | 'test'`. `unit` trong `content.json` = chủ đề (Stage → Unit → lessonIds).
- S3.1: `ProgressService.deriveLessonStatuses` mở bài khi bài liền trước `completed`, kể cả qua ranh giới chủ đề. Vậy bài kiểm tra
  là bài cuối của chủ đề, ghi nó `completed` thì chủ đề sau tự mở; không cần đổi bản đồ.
- S3.4 (PR spec #76): `LessonService.summarize` có `isComplete = finished && skippedCount === 0`, `finishLesson` ghi `completed`.
  S3.5 làm `isComplete` phụ thuộc loại bài.
- S3.3 (PR spec #75): `saveCursor`, `resolveStartIndex`.
- Layer đích và Dependency Rule: xem `proposal.md`, CLAUDE.md §1–§2.

## Goals / Non-Goals

**Goals:** ngưỡng 80% là một rule thuần ở Phần 2; bài kiểm tra chưa đạt không chạm tiến độ; câu sai ra khỏi phiên qua một cổng mỏng.

**Non-Goals:** tạo thẻ SRS (S9.4), vượt cấp (S3.6), nội dung bài kiểm tra (E11).

## Decisions

### D1. Ngưỡng và rule đạt/chưa đạt (Phần 2)
- `TEST_PASS_PERCENT = 80` ở `core/constants/lesson.constants.ts`.
- `isTestPassed(correctCount, totalCount): boolean` = `totalCount > 0 && correctCount * 100 >= TEST_PASS_PERCENT * totalCount`
  (số nguyên, không so số đã làm tròn, không float). 4/5 → đạt; 23/30, 39/49 → chưa đạt.
- `summarize(session, lessonType)` thêm `isPassed: boolean | null`: `null` với bài thường; với `test` là `isTestPassed(correct, answered)`
  (khi hoàn thành, `answered === tổng số câu`).
- `isComplete(summary-input, lessonType)`: bài thường như S3.4; bài `test` = `finished && skippedCount === 0 && isPassed`.
- `finishLesson` giữ nguyên khung S3.4, chỉ ghi `completed` khi `isComplete`; bài kiểm tra chưa đạt không ghi gì (không hạ trạng thái cũ).
- *Đã cân nhắc:* khoá theo stage ("HSK" khác "Nhập môn") — bỏ vì `type: 'test'` đã có sẵn trong nội dung; quy tắc theo loại bài đơn giản
  hơn và không gắn cứng tên giai đoạn.

### D2. Câu sai ghi theo ID
`LessonSession` thêm `wrongExerciseIds: readonly string[]`; `submitResult` thêm ID câu hiện tại khi sai (chỉ ở `answering`, nên bấm đúp
không ghi đôi). Làm lại tạo phiên mới nên danh sách rỗng (Scenario "không chuyển trùng").

### D3. Cổng chuyển câu sai sang ôn tập
- Interface `WrongAnswerSink { record(lessonId: string, exerciseIds: readonly string[]): Promise<void> }` ở `shared/services/`,
  `LessonService` nhận qua constructor; bản mặc định không làm gì (E9/S9.4 thay bằng bản tạo thẻ). Cổng ở service, không ở hook,
  vì "câu sai ra ôn tập" là use case.
- `finishLesson` với bài `test`: gọi `record` khi `wrongExerciseIds.length > 0` (đạt hay không, Câu hỏi mở 2); bài thường không gọi.
- Lỗi của cổng bị bắt như lỗi ghi tiến độ ở S3.4 (`isSaved = false`), không chặn tổng kết.
- *Đã cân nhắc:* S3.5 tự ghi bảng `cards` — bỏ vì E9 chưa có `FSRS`/schema thẻ, đó là scope S9.4.

### D4. Bài kiểm tra bắt đầu từ câu 1, làm lại
- `openLesson`: bài `test` bỏ qua vị trí đã lưu (`startIndex = 0`) và `saveCursor` không ghi vị trí cho bài `test` (S3.5-X1).
- `LessonSummary` nhận `isPassed` (null với bài thường): hiện dòng đạt/chưa đạt; chưa đạt thì có nút "Làm lại" gọi `restart()`.
- `useLessonRunner.restart()` dựng phiên mới bằng `startSession(exercises, 0, now)`, không nạp lại từ nguồn nội dung.
- Focus sau khi bấm "Làm lại" chuyển về dòng "Câu 1 / n" (như khi sang câu mới ở S3.2). Nút là `<button>` có nhãn chữ.

### D5. Không đổi bản đồ và schema
Bản đồ vẫn chỉ đọc `completed`. Bài kiểm tra chưa đạt không có dòng tiến độ mới, nên "Đang mở" giữ nguyên.

## Risks / Trade-offs

- Điểm hiển thị làm tròn có thể hiện "80%" cho 79,6% chưa đạt (Câu hỏi mở 3). Rule so sánh đúng; chỉ cách hiện gây khó hiểu.
- Bài `test` có nhiều dạng bài chưa đăng ký: bỏ qua câu → không bao giờ đạt. Chấp nhận tới khi E4–E6, E10 đủ dạng.
- Cổng mặc định không làm gì nên tới S9.4 câu sai chưa tới tay người học; test dùng cổng giả.

## Scenario → tầng test

| Scenario | Tầng | Tệp test |
|---|---|---|
| S3.5-AC1 đạt/chưa đạt, 80%, 23/30, 39/49, bài thường | `shared/services` Phần 2 (thuần) | `lesson.service.test.ts` |
| S3.5-AC1 bản đồ: chủ đề kế mở/khóa, bỏ qua, làm lại điểm thấp | `shared/services` Phần 3 + `fake-indexeddb` | `lesson.service.test.ts` |
| S3.5-AC2 nút làm lại, đạt/chưa đạt, làm lại từ câu 1, nhiều lần | container | `LessonRunnerContainer.test.tsx` |
| S3.5-AC2 câu sai chuyển ôn tập (cổng giả), không trùng | `shared/services` Phần 3 | `lesson.service.test.ts` |
| S3.5-X1 bài kiểm tra bắt đầu từ câu 1 | `shared/services` Phần 3 + container | `lesson.service.test.ts`, `LessonRunnerContainer.test.tsx` |

e2e chưa làm được (Câu hỏi mở 5 trong `proposal.md`).
