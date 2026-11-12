# Proposal: S3.4 Tổng kết bài và mở khóa

Story **S3.4 Tổng kết bài và mở khóa · F3, F5** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s34-tổng-kết-bài-và-mở-khóa--f3-f5)) ·
GitHub issue [#25](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/25).

Refs #25

## Why

Là người học, tôi muốn xem kết quả cuối bài để biết mình làm tốt tới đâu. Hiện S3.2 chỉ báo "đã làm xong các
câu" rồi dừng, chưa có điểm, chưa ghi bài là đã xong nên bài kế tiếp không bao giờ mở. S3.4 thay thông báo tạm
bằng màn tổng kết và ghi nhận bài đã xong để bản đồ (S3.1) mở bài kế.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Màn tổng kết (điểm, thời gian, số câu sai) thay `LessonFinished` | `pages/lesson/components/` |
| Giữ kết quả tổng kết, gọi service khi hết bài | `pages/lesson/hooks/useLessonRunner.ts` |
| Đếm đúng/sai và mốc thời gian trong phiên; quy tắc điểm, "bài xong khi nào" | `shared/services/lesson.service.ts` Phần 2 |
| Use case kết thúc bài: tính tổng kết, ghi "đã xong" | `shared/services/lesson.service.ts` Phần 3 (ghi qua `ProgressStore`) |
| Kiểu `LessonSession` thêm bộ đếm và mốc thời gian | `shared/models/lesson-session.model.ts` |
| Định dạng thời gian "phút:giây" | `shared/utils/duration.utils.ts` (pure) |
| Chữ trên màn tổng kết | `assets/i18n/vi/lesson.json` |
| Style BEM màn tổng kết | `apps/web/src/styles/tailwind/` |

Quy tắc mở khoá Nhập môn đã có (`ProgressService.deriveLessonStatuses`, S3.1); S3.4 chỉ cần ghi nhận bài đã xong.

## What Changes

- Hết câu cuối thì hiện **màn tổng kết**: điểm (phần trăm), thời gian làm, số câu sai.
- Bài làm xong mà không bỏ qua câu nào thì được ghi là **đã xong**; bài kế tiếp trên bản đồ chuyển "Đang mở".
- Bài còn câu bỏ qua (S3.2-X1) hoặc thoát giữa chừng thì chưa xong, bài kế vẫn khoá.
- Nhập môn không có ngưỡng điểm: làm hết câu là xong, dù điểm thấp.
- Ghi tiến độ lỗi thì vẫn hiện tổng kết kèm thông báo chưa lưu được.
- Thông báo cũ "Bạn đã làm xong các câu của bài này." được giữ làm tiêu đề màn tổng kết, nên các Scenario S3.2 hiện có không đổi.

## Không làm (out of scope)

- Ngưỡng 80% mở chủ đề (HSK) → **S3.5**; kiểm tra vượt cấp → **S3.6**.
- Điểm cao nhất của bài (`bestScore`): chưa có chỗ nào hiện cho người học, để **S3.5** thêm khi cần.
- "Từ mới vào SRS" trên màn tổng kết (F3, bản 0.2) → **E9**.
- Nút ra khỏi màn tổng kết (về lộ trình, sang bài kế): AC không nêu, xem Câu hỏi mở 4.
- Lưu điểm/thời gian qua lần thoát giữa chừng: S3.3 chỉ lưu vị trí câu, xem Câu hỏi mở 1.
- Tạm dừng đồng hồ khi app ở nền.

## Dependencies

- **S3.2** (đã archive): phiên làm bài, màn hết bài tạm, bộ đếm câu bỏ qua.
- **S3.1** (đã archive): bản đồ suy trạng thái từ tiến độ; quy tắc mở khoá Nhập môn.
- **S3.3** (PR spec #75): thêm `ProgressStore.saveLessonProgress` và vị trí câu đã lưu. Phần code của S3.4 chỉ
  `/opsx:apply` sau khi code S3.3 đã merge. Khi xong bài, S3.4 ghi `completed` và bỏ vị trí đã lưu (giữ biện pháp
  `S3.3-X1`).
- **E4–E6**: chưa có dạng bài thật nên chưa có e2e (Câu hỏi mở 5).

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `lesson-runner`: thêm màn tổng kết cuối bài.
- `learning-path`: thêm quy tắc xong bài thì bài kế tiếp mở.

## Câu hỏi mở

1. **Làm tiếp từ câu đang dở (S3.3):** S3.3 không lưu đáp án của các câu đã làm trước khi thoát. Giả định trong spec:
   điểm, số câu sai và thời gian chỉ tính trên các câu **làm trong lần mở này**. BA xác nhận, hoặc yêu cầu S3.3 lưu
   thêm kết quả từng câu (đổi scope S3.3).
2. **Cách tính điểm:** giả định điểm = số câu đúng / số câu đã trả lời, làm tròn thành phần trăm nguyên (cùng thang
   80% của S3.5); câu bỏ qua không tính vào mẫu số. Hiện kèm "Đúng x / y câu". BA xác nhận.
3. **Thời gian:** giả định tính từ lúc câu đầu hiện tới lúc xong câu cuối trong lần mở này, hiện dạng "phút:giây", kể cả
   lúc người học để app ở nền. BA xác nhận.
4. Màn tổng kết chưa có nút đi tiếp (về lộ trình, bài kế). Thêm vào story này, hay story riêng?
5. e2e chưa làm được vì chưa có dạng bài tập chạy trọn; kiểm bằng Vitest tới khi E4 xong.
6. Ghi tiến độ lỗi: giả định hiện thông báo "Chưa lưu được kết quả bài này" trên màn tổng kết. BA xác nhận câu chữ.

## Impact

- Code mới: `shared/utils/duration.utils.ts`, `pages/lesson/components/LessonSummary.tsx`.
- Code sửa: `lesson.service.ts`, `lesson-session.model.ts`, `useLessonRunner.ts`, `LessonRunner.tsx`, i18n `lesson.json`,
  style `styles/tailwind/`; xoá `LessonFinished.tsx` (hoặc đổi tên) và test của nó.
- Không đổi schema nội dung, không đổi IndexedDB schema/version, không thêm dependency.
- Docs: `docs/03-architecture.md` (vòng đời bài: xong → `completed`).
