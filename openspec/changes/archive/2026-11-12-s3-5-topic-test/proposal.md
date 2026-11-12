# Proposal: S3.5 Kiểm tra cuối chủ đề

Story **S3.5 Kiểm tra cuối chủ đề · F5** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s35-kiểm-tra-cuối-chủ-đề--f5)) ·
GitHub issue [#53](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/53). Bản 0.2.

Refs #53

## Why

Là người học, tôi muốn làm bài kiểm tra cuối mỗi chủ đề để chắc mình đã nắm trước khi đi tiếp. Hiện S3.4 mở bài kế
ngay khi làm hết câu, không phân biệt bài kiểm tra. S3.5 đặt ngưỡng 80% cho bài kiểm tra: đạt mới mở chủ đề tiếp theo,
chưa đạt thì làm lại, câu sai được chuyển sang ôn tập.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc "bài kiểm tra đạt khi nào", "bài xong khi nào" theo loại bài; danh sách câu sai | `shared/services/lesson.service.ts` Phần 2 |
| Kết thúc bài kiểm tra: ghi `completed` chỉ khi đạt, chuyển câu sai cho ôn tập | `shared/services/lesson.service.ts` Phần 3 |
| Ngưỡng 80% | `core/constants/lesson.constants.ts` (hằng số dùng toàn app) |
| Kiểu `LessonSession` thêm danh sách câu sai | `shared/models/lesson-session.model.ts` |
| Nút "Làm lại", dòng đạt/chưa đạt trên màn tổng kết | `pages/lesson/components/` (`LessonSummary`) |
| Nối nút làm lại, không lưu vị trí cho bài kiểm tra | `pages/lesson/hooks/useLessonRunner.ts` |
| Cầu nối sang ôn tập (cổng nhận câu sai; thẻ thật do S9.4) | `shared/services/` (một interface nhỏ, bản mặc định chưa làm gì) |

Quy tắc mở khoá theo bài đã xong đã có (`ProgressService.deriveLessonStatuses`, S3.1): bài kiểm tra chỉ cần được ghi
"đã xong" đúng điều kiện thì chủ đề kế tiếp tự mở.

## What Changes

- Bài loại kiểm tra chỉ được ghi "Đã xong" khi điểm từ 80% trở lên; đạt thì chủ đề tiếp theo mở. Bài học thường giữ
  quy tắc S3.4 (làm hết là xong).
- Màn tổng kết bài kiểm tra cho biết đạt hay chưa đạt; chưa đạt thì có nút "Làm lại" (không giới hạn lần).
- Làm lại bắt đầu từ câu 1 với điểm, thời gian, số câu sai tính lại.
- Mọi câu làm sai trong lần làm bài kiểm tra được chuyển cho phần ôn tập qua một cổng; E9/S9.4 nối thẻ thật.
- Bài kiểm tra luôn bắt đầu từ câu 1, không học tiếp từ câu đang dở (xem Câu hỏi mở 1).

## Không làm (out of scope)

- Tạo thẻ SRS từ câu sai → **S9.4** (E9). S3.5 chỉ giao danh sách câu sai qua cổng.
- Nút "Kiểm tra vượt cấp" và đánh dấu cả chủ đề đã xong → **S3.6**.
- Nội dung bài kiểm tra từng chủ đề HSK → **E11** (S11.1, S11.4).
- Nút ra khỏi màn tổng kết (về lộ trình, sang chủ đề kế) → như Câu hỏi mở 4 của S3.4.
- Điểm cao nhất của bài (`bestScore`): chưa có chỗ nào hiện.

## Dependencies

- **S3.4** (PR spec #76): màn tổng kết, `LessonSummary`, `finishLesson`, điểm. Code S3.5 chỉ apply sau khi code S3.4 merge.
- **S3.3** (PR spec #75): vị trí câu đang dở; S3.5 bỏ qua nó cho bài kiểm tra.
- **S9.4** (E9, chưa làm): tạo thẻ từ câu sai (AC2 của S3.5 nhắc tới "S9.4"). Cho tới đó cổng chuyển câu sai chưa có tác dụng với người học.
- **E11**: có bài `type: test` thật thì mới thấy được trên app, nên chưa có e2e (Câu hỏi mở 5).

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `learning-path`: bài kiểm tra cuối chủ đề phải đạt 80% mới mở chủ đề tiếp theo.
- `lesson-runner`: màn tổng kết bài kiểm tra, làm lại, chuyển câu sai sang ôn tập, bài kiểm tra bắt đầu từ câu 1.

## Câu hỏi mở

1. **Học tiếp từ câu dở trong bài kiểm tra:** S3.3 không lưu đáp án đã làm, nên làm tiếp từ giữa bài sẽ cho điểm chỉ trên
   phần còn lại và có thể đạt oan. Giả định trong spec: **bài kiểm tra luôn bắt đầu từ câu 1** (Scenario `S3.5-X1`). BA xác nhận,
   hoặc yêu cầu S3.3 lưu kết quả từng câu.
2. **Câu sai nào vào ôn tập:** AC2 đặt câu này ở nhánh "không đạt", còn S9.4 nói "câu sai trong bài kiểm tra". Giả định:
   mọi câu sai của lần làm bài kiểm tra đều chuyển, kể cả lần đạt. BA xác nhận.
3. **Làm tròn điểm:** ngưỡng so sánh trên tỉ lệ thật (đúng ×100 ≥ 80 × số câu), không so trên số đã làm tròn. Ví dụ 39/49 = 79,6% hiện
   "80%" (S3.4 làm tròn) nhưng chưa đạt. Chấp nhận, hay đổi cách hiện (cắt thay vì làm tròn)?
4. Bài kiểm tra đã đạt, người học có làm lại được không (để cải thiện)? Giả định: không hiện nút "Làm lại" khi đạt; vào lại từ bản
   đồ vẫn làm được như bài thường.
5. Chưa có e2e vì chưa có nội dung bài kiểm tra thật (E11); kiểm bằng Vitest.
6. Câu chữ nhãn đạt/chưa đạt ("Bạn đã đạt", "Chưa đạt, cần từ 80%") BA duyệt.

## Impact

- Code mới: `core/constants/lesson.constants.ts`, cổng ôn tập (interface + bản mặc định).
- Code sửa: `lesson.service.ts`, `lesson-session.model.ts`, `useLessonRunner.ts`, `LessonSummary.tsx`, i18n `lesson.json`, style
  `styles/tailwind/`.
- Không đổi schema nội dung (`type: 'test'` đã có), không đổi IndexedDB schema/version, không thêm dependency.
