# Proposal: S8.1 Trang chủ

Story **S8.1 Trang chủ · F2** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s81-trang-chủ--f2)) ·
GitHub issue [#37](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/37). Bản 0.1, epic E8.

Refs #37

## Why

Là người học, tôi muốn mở app là thấy ngay hôm nay cần học gì để bắt đầu nhanh. Hiện người học đã xong onboarding mở
app thì bị đưa thẳng vào bài 1, không biết bài tiếp theo của mình là bài nào, cũng không biết hôm nay đã học bao nhiêu
phút so với mục tiêu đã chọn ở onboarding (S1.3). Luồng F2 ([business-flows.md](../../../docs/02-design/business-flows.md))
bắt đầu từ trang chủ.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Màn Trang chủ (entry lazy-load) và route của feature | `pages/home/containers/`, `pages/home/home.routes.ts` |
| UI riêng của trang chủ (thẻ bài tiếp theo, dòng phút hôm nay / mục tiêu) | `pages/home/components/` |
| State + lifecycle trang chủ, gọi service | `pages/home/hooks/` |
| Quy tắc chọn bài tiếp theo; quy tắc tính phút học hôm nay (ngày theo giờ máy, làm tròn, khi nào cộng); use case ghi và đọc thời gian học | `shared/services/` (service tiến độ hiện có, Phần 2 + Phần 3) |
| Ghi nhận thời gian ở màn bài (bắt đầu, rời màn, app chạy nền) | `pages/<feature bài học>/hooks/` gọi service; lắng nghe app ẩn/hiện qua `core/hooks/` nếu cần |
| Liên kết "Trang chủ" trên bản đồ lộ trình và màn tổng kết | `pages/learning-path/components/`, `pages/lesson/components/` |
| Lưu thời gian học theo ngày | `core/services/` (adapter tiến độ) + `core/helpers/db.helper.ts` (xem Open Questions) + schema Zod ở `@csk/shared` |
| Mở app sau onboarding thì vào Trang chủ thay vì vào bài 1 | `pages/onboarding/containers/` (cổng mở app hiện có) |
| Nhãn giao diện | `assets/i18n/vi/home.json` |
| Kiểm tra luồng mở app → trang chủ → vào bài, phút học | Playwright `apps/web/e2e/E8/` |

## What Changes

- **Màn Trang chủ mới.** Người học đã xong onboarding mở app thì vào Trang chủ (trước đây vào thẳng bài 1). Xong onboarding
  lần đầu vẫn vào thẳng bài 1 như S1.3 AC4.
- **Bài tiếp theo**: trang chủ hiện tiêu đề bài tiếp theo và nút "Vào học"; bấm thì vào màn bài đó (bài đang làm dở thì
  tiếp tục từ câu dở như S3.3, trừ bài kiểm tra (luôn bắt đầu từ câu 1 như S3.5)). Bài tiếp theo là bài đầu tiên theo thứ tự lộ trình đang ở trạng thái "Đang mở". Đã xong
  mọi bài thì hiện thông báo đã học hết lộ trình.
- **Phút hôm nay / mục tiêu**: trang chủ hiện "Hôm nay: X / Y phút", Y là mục tiêu đã chọn. Đạt mục tiêu thì thêm dòng
  "Đã đạt mục tiêu hôm nay".
- **Ghi nhận thời gian học**: thời gian người học ở màn bài (kể cả bài chưa làm xong, học lại bài đã xong, bài kiểm tra cuối
  chủ đề, bài kiểm tra vượt cấp và màn tổng kết) được cộng vào số phút học của ngày nó diễn ra; thời gian app chạy nền không
  tính. Sang ngày mới (theo giờ máy) thì đếm lại từ 0. Đóng app lúc đang ở màn bài (bất kỳ cách nào) thì mất tối đa 30 giây cuối.
- **Liên kết "Xem lộ trình"** trên trang chủ để mở bản đồ lộ trình (S3.1).
- **Liên kết "Trang chủ"** trên bản đồ lộ trình và trên màn tổng kết cuối bài, để người học (nhất là app đã cài trên iPhone,
  không có nút Quay lại) về được Trang chủ.
- Dữ liệu ở trên máy nên trang chủ dùng được khi offline như phần còn lại của app.

## Capabilities

### New Capabilities
- `home-screen`: màn Trang chủ — vào từ đâu, bài tiếp theo, phút hôm nay so với mục tiêu, liên kết lộ trình.
- `daily-study-time`: quy tắc ghi nhận số phút học mỗi ngày (cái gì được tính, ngày tính thế nào, làm tròn). S8.3 Streak
  sẽ dùng lại.

### Modified Capabilities
- `learning-path`: thêm liên kết "Trang chủ" trên bản đồ lộ trình.
- `lesson-runner`: thêm liên kết "Trang chủ" trên màn tổng kết cuối bài; màn bài khi đang làm câu chưa có.
- (Hành vi "mở app sau onboarding vào thẳng bài 1" của S1.3 chưa có trong `openspec/specs/`; hành vi mới ghi ở `home-screen`.)

## Dependency

- S1.3 Onboarding: mục tiêu phút mỗi ngày đã lưu; AC4 vừa xong onboarding vào thẳng bài 1.
- S3.1 Bản đồ lộ trình: thứ tự bài và trạng thái khóa / đang mở / đã xong.
- S3.3 Học tiếp từ câu đang dở.
- S3.4 Màn tổng kết (nơi đặt liên kết "Trang chủ").
- S3.5 Kiểm tra cuối chủ đề (luôn bắt đầu từ câu 1) và S3.6 Kiểm tra vượt cấp (thời gian được tính).
- S7.1 AC4: nội dung bài 1, nơi người học vừa xong onboarding được đưa tới.

## Không làm (out of scope)

- Streak trên trang chủ (S8.3, bản 0.2) và số thẻ cần ôn (SRS, E9, bản 0.2).
- Đổi mục tiêu phút (S8.2 AC1). Trang chủ chỉ đọc mục tiêu đã lưu.
- Tính thời gian ở màn xem thứ tự nét (S6.1) và màn luyện viết (S6.2): bản này chỉ tính màn bài.
- Thanh điều hướng chung của app; nút thoát hoặc "Trang chủ" trong màn bài khi đang làm câu (chỉ có trên màn tổng kết và
  bản đồ lộ trình).
- Phát hiện người học bỏ đi khi app vẫn mở ở màn bài (không thao tác): thời gian đó vẫn được tính.
- Chống cộng trùng khi mở màn bài ở hai tab cùng lúc.
- Gợi ý "luyện tự do" khi còn thời gian (nhánh Q của F2).
- Hiện lịch sử phút học các ngày trước.

## Impact

- Đổi luồng mở app sau onboarding: e2e S1.3 và S3.1 hiện mong đợi mở `/` thì vào bài 1, phải cập nhật trong PR code.
- Thêm nơi lưu thời gian học theo ngày trên máy (IndexedDB), xem Open Questions.
- Màn bài thêm việc ghi nhận thời gian; không đổi hành vi người học nhìn thấy khi đang làm câu.
- Bản đồ lộ trình và màn tổng kết có thêm liên kết "Trang chủ".

## Open Questions

- [x] Lưu phút học theo ngày cần thêm một bảng mới trong dữ liệu trên máy (thay đổi schema IndexedDB, khó đảo ngược). → người thật đồng ý (2026-11-17): theo bảng thống kê theo ngày đã có trong docs/03-architecture.md §6.2, khóa là ngày theo giờ máy, giữ mọi ngày để S8.3 Streak dùng lại; lưu theo giây thay vì phút để không mất phần lẻ khi cộng nhiều lần, nên PR code cập nhật docs/03-architecture.md §6.2 (trường phút → giây) và §6.3 (hàm cộng phút → cộng giây) cho khớp; tính năng sao lưu/khôi phục sau này phải gồm bảng mới
- [x] Mở app sau onboarding vào đâu? → Mở từ biểu tượng app hoặc địa chỉ gốc thì vào Trang chủ; mở địa chỉ onboarding khi đã xong thì về Trang chủ; tải lại hoặc mở thẳng màn khác thì vẫn ở màn đó; vừa xong onboarding vẫn vào thẳng bài 1 (S1.3 AC4); chưa xong onboarding vẫn vào onboarding, có Scenario riêng (finding qa #11, #12; ba đề xuất, chờ người thật xác nhận)
- [x] "Bài tiếp theo" là bài nào? → Bài đầu tiên theo thứ tự lộ trình đang ở trạng thái "Đang mở"; nếu bài đó đang làm dở thì bấm vào tiếp tục từ câu dở, trừ bài kiểm tra (luôn bắt đầu từ câu 1 như S3.5) (finding dev-lead #5; vòng 3 finding qa, dev-lead #1); đã xong mọi bài thì hiện "Bạn đã học xong lộ trình hiện có." và không có nút "Vào học" (ba đề xuất, chờ người thật xác nhận)
- [x] Thời gian nào được tính là "phút đã học"? → Thời gian ở màn bài, kể cả bài chưa xong, học lại bài đã xong, bài kiểm tra cuối chủ đề, bài kiểm tra vượt cấp và màn tổng kết của chúng, mỗi loại có Scenario (finding dev-lead #2, qa #8); không tính lúc app chạy nền hay ở màn khác; màn thứ tự nét / luyện viết chưa tính (ba đề xuất, chờ người thật xác nhận)
- [x] "Hôm nay" tính thế nào, học qua nửa đêm thì sao? → Theo giờ trên máy, từ 0 giờ đến hết 23:59; mỗi phần thời gian tính vào ngày nó diễn ra, học qua nửa đêm thì phần trước 0 giờ cho hôm trước, phần sau cho hôm sau, có Scenario; cộng dồn theo giây rồi làm tròn xuống phút khi hiện (finding dev-lead #1; ba đề xuất, chờ người thật xác nhận)
- [x] Hiện phút so với mục tiêu ra sao, vượt mục tiêu thì sao? → Dòng chữ "Hôm nay: X / Y phút"; vượt thì vẫn hiện số thật (ví dụ "45 / 30 phút") kèm "Đã đạt mục tiêu hôm nay"; mục tiêu đã lưu không đọc được thì dùng 15 phút như mặc định hiện có (ba đề xuất, chờ người thật xác nhận)
- [x] Thời gian có mất khi người học đóng app giữa bài không, mất tối đa bao nhiêu? → Rời màn bài hay app bị ẩn thì không mất; đóng app lúc đang ở màn bài, bất kỳ cách nào (vuốt tắt, đóng tab/cửa sổ, tắt máy), mất tối đa 30 giây cuối. Bỏ phân biệt "đóng bình thường / đóng đột ngột" vì trên web/PWA người học không có thao tác đóng nào cho kết quả khác; gộp hai Scenario đóng app thành "S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối" (3 phút 40 giây → 3), đổi tên Requirement thành "Đóng app giữa bài chỉ mất tối đa 30 giây cuối" (finding dev-lead #3, qa #10; vòng 2 finding qa #1; ba đề xuất, chờ người thật xác nhận)
- [x] Để app mở ở màn bài rồi bỏ đi nhiều giờ (màn vẫn hiện) có tính hết không? → Có, tính hết; bản này không phát hiện người học bỏ đi, có Scenario (finding dev-lead #4; ba đề xuất, chờ người thật xác nhận)
- [x] Mở màn bài ở hai tab cùng lúc có cộng hai lần không? → Có, mỗi tab cộng riêng, không chống trùng, không phần nào bị mất; có Scenario (finding dev-lead #4; ba đề xuất, chờ người thật xác nhận)
- [x] Từ trang chủ có đi được tới bản đồ lộ trình không? → Có liên kết "Xem lộ trình" (ba đề xuất, chờ người thật xác nhận)
- [x] Người học quay về Trang chủ bằng cách nào (màn bài, tổng kết, lộ trình chưa có đường về; app cài trên iPhone không có nút Quay lại)? → Thêm liên kết "Trang chủ" trên bản đồ lộ trình và trên màn tổng kết cuối bài (màn tổng kết hiện chưa có liên kết nào ra ngoài nên không thể chỉ dựa vào lộ trình); màn bài khi đang làm câu chưa có; Scenario "học xong quay lại Trang chủ" đổi WHEN thành bấm "Trang chủ" trên màn tổng kết (finding qa #9; ba đề xuất, chờ người thật xác nhận)
- [x] Ngoại lệ "bài kiểm tra cuối chủ đề luôn bắt đầu từ câu 1" hẹp hơn quy tắc hiện có (mọi bài kiểm tra)? → Sửa thành "trừ bài kiểm tra (luôn bắt đầu từ câu 1 như S3.5)" ở spec và proposal (vòng 2 finding dev-lead #2)
- [x] Liên kết "Trang chủ" trên bản đồ lộ trình và màn tổng kết thuộc capability nào? → Chuyển thành delta ADDED của `learning-path` (bản đồ lộ trình) và `lesson-runner` (màn tổng kết, màn bài khi đang làm câu không có), ghi vào Modified Capabilities; bỏ Requirement "Đường về Trang chủ" khỏi `home-screen`, Scenario giữ nguyên ID và nội dung (vòng 2 finding dev-lead #3)
- [x] Để Trang chủ mở qua nửa đêm thì dòng "Hôm nay: X / Y phút" có tự về 0 không? → Không tự đổi khi đang mở; tính lại mỗi khi Trang chủ được mở (mở app hoặc quay về từ màn khác), có Scenario "S8.1-AC2 Để Trang chủ mở qua nửa đêm" (vòng 2 finding dev-lead #4; ba đề xuất, chờ người thật xác nhận)
- [x] Scenario "Để Trang chủ mở qua nửa đêm" dùng Y nhưng WHEN không nêu mục tiêu? → Thêm "mục tiêu 15 phút" vào WHEN, thay Y bằng 15 (vòng 3 finding qa #2)
- [x] Trang chủ hiện lại sau khi app bị ẩn hoặc chạy nền (vd bấm biểu tượng app trên iPhone sáng hôm sau, app chạy tiếp chứ không mở lại) có tính lại "Hôm nay: X / Y phút" không? → Có; ghi vào Requirement "Hiện số phút đã học hôm nay so với mục tiêu", thêm Scenario "S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm" (20 phút, mục tiêu 15, hiện lại sau nửa đêm → "Hôm nay: 0 / 15 phút") (vòng 3 finding qa major; người thật đã xác nhận 2026-11-17)
- [x] Proposal thiếu mục Dependency → Thêm mục Dependency: S1.3, S3.1, S3.3, S3.4, S3.5/S3.6, S7.1 AC4 (nội dung bài 1) (finding dev-lead #7)
