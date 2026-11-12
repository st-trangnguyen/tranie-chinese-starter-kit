# Proposal: S3.3 Học tiếp từ câu đang dở

Story **S3.3 Học tiếp từ câu đang dở · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s33-học-tiếp-từ-câu-đang-dở--f3)) ·
GitHub issue [#24](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/24).

Refs #24

## Why

Là người học, tôi muốn thoát giữa chừng mà không mất tiến độ để học tiếp lúc khác. Hiện S3.2 luôn mở bài
ở câu 1 và không ghi gì xuống máy, nên thoát giữa bài là làm lại từ đầu. S3.3 lưu vị trí câu đang làm và
mở lại đúng chỗ đó.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Thêm trường vị trí câu vào schema tiến độ bài, tự rơi về "không có" khi giá trị hỏng | `packages/shared` (`progress.schema.ts`) |
| Đọc/ghi tiến độ một bài (`getLessonProgress`, `saveLessonProgress`) | `core/services/progress-store.service.ts` (hạ tầng, không thêm bảng hay version Dexie) |
| Quy tắc vị trí bắt đầu (hợp lệ hay quay về câu 1, không hạ bài đã xong) | `shared/services/lesson.service.ts` Phần 2 |
| Nạp vị trí khi mở bài, lưu vị trí khi sang câu | `shared/services/lesson.service.ts` Phần 1 + 3 (nhận `ProgressStore` qua constructor) |
| Gọi lưu mỗi khi câu hiện tại đổi | `pages/lesson/hooks/useLessonRunner.ts` |

## What Changes

- Mỗi khi người học sang câu kế (kể cả bỏ qua câu), vị trí câu mới được lưu cho bài đó.
- Mở lại bài đang dở thì vào đúng câu đã lưu; câu đang dở làm lại từ đầu câu (đáp án chưa chấm không được lưu).
- Vị trí hỏng hoặc vượt số câu hiện có thì quay về câu 1, không báo lỗi.
- Lưu không được thì người học vẫn học tiếp, không hiện lỗi.
- Làm xong câu cuối thì xoá vị trí, mở lại bắt đầu từ câu 1 (biện pháp cho tới khi S3.4 ghi "đã xong").
- Lưu vị trí không bao giờ hạ một bài đã xong về chưa xong.

## Không làm (out of scope)

- Điểm, thời gian, số câu sai đã làm, số câu bỏ qua: không lưu qua lần thoát (chỉ lưu vị trí câu).
- Ghi bài "đã xong" và mở khoá bài kế → **S3.4**.
- Nút thoát bài, điều hướng về bản đồ → chưa có trong AC.
- Dạng bài tập cụ thể → E4–E6, E10.
- Đồng bộ giữa nhiều thiết bị (chỉ lưu trên máy này; chuyển máy qua export/import là S8.5).

## Dependencies

- **S3.2** (đã archive): khung chạy bài, phiên làm bài, `LessonService`.
- **S3.1** (đã archive): bản đồ đọc `lessonProgress`; trạng thái "đang làm dở" không đổi nhãn trên bản đồ.
- **S3.4**: sẽ thay biện pháp "xoá vị trí khi hết câu" bằng ghi đã xong; không mở rộng scope ở đây.
- **E4–E6**: chưa có dạng bài thật nên chưa có e2e (xem Câu hỏi mở 1).

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `lesson-runner`: thêm khả năng lưu vị trí câu đang làm và mở lại đúng chỗ.

## Câu hỏi mở

1. e2e cho S3.3 chưa làm được vì app thật chưa có dạng bài tập nào chạy trọn (giống S3.2). Chấp nhận kiểm bằng
   Vitest + `fake-indexeddb` tới khi E4 xong, rồi bổ sung e2e?
2. Mở lại một bài **đã xong** (chưa có vị trí lưu) thì bắt đầu câu 1. Giữ vậy hay hỏi người học "làm lại" /
   "xem lại"? Để S3.4 quyết.
3. Câu đã trả lời nhưng chưa bấm "Tiếp tục" khi thoát: giả định **làm lại từ đầu câu đó**. BA xác nhận.

## Impact

- Code sửa: `progress.schema.ts`, `progress-store.service.ts` (+ test), `lesson.service.ts` (+ test),
  `useLessonRunner.ts` (+ test), nơi tạo `LessonService` truyền store.
- Không đổi IndexedDB schema/version (dòng `lessonProgress` đã cho phép trường mở rộng; schema Zod lo phần validate).
- Không thêm dependency.
