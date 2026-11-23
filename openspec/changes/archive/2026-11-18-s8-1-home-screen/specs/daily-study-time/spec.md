## ADDED Requirements

### Requirement: Thời gian ở màn bài được tính là thời gian học
Hệ thống SHALL tính số phút đã học hôm nay bằng cách cộng dồn thời gian người học ở màn bài (kể cả màn tổng kết) trong
ngày; bài xong hay chưa, học mới hay học lại, đạt hay chưa đều tính:

| Thời gian | Tính? |
|---|---|
| Bài thường | Có |
| Bài kiểm tra cuối chủ đề | Có |
| Bài kiểm tra vượt cấp | Có |
| App bị ẩn hoặc chạy nền (chuyển app, khóa màn hình, chuyển tab) | Không |
| Màn khác (Trang chủ, lộ trình, onboarding, thứ tự nét, luyện viết) | Không |

#### Scenario: S8.1-AC2 Ở màn bài được tính
- **WHEN** hôm nay người học chưa học, rồi ở màn bài 3 phút và rời màn bài
- **THEN** số phút đã học hôm nay là 3

#### Scenario: S8.1-AC2 Thoát giữa bài vẫn được tính
- **WHEN** người học ở màn bài 2 phút, chưa làm xong bài thì rời màn bài
- **THEN** số phút đã học hôm nay tăng thêm 2

#### Scenario: S8.1-AC2 Học lại bài đã xong vẫn được tính
- **WHEN** người học mở lại một bài đã xong và ở màn bài đó 4 phút
- **THEN** số phút đã học hôm nay tăng thêm 4

#### Scenario: S8.1-AC2 Bài kiểm tra cuối chủ đề được tính
- **WHEN** người học làm bài kiểm tra cuối chủ đề 3 phút rồi ở màn tổng kết của bài đó thêm 1 phút
- **THEN** số phút đã học hôm nay tăng thêm 4

#### Scenario: S8.1-AC2 Bài kiểm tra vượt cấp được tính
- **WHEN** người học làm bài kiểm tra vượt cấp 3 phút rồi ở màn tổng kết của bài đó thêm 1 phút
- **THEN** số phút đã học hôm nay tăng thêm 4

#### Scenario: S8.1-AC2 Thời gian app chạy nền không tính
- **WHEN** người học ở màn bài 1 phút, chuyển sang app khác 10 phút, quay lại màn bài thêm 1 phút rồi rời bài
- **THEN** số phút đã học hôm nay tăng thêm 2

#### Scenario: S8.1-AC2 Màn khác không tính
- **WHEN** người học chỉ ở Trang chủ và bản đồ lộ trình 5 phút, không vào màn bài nào
- **THEN** số phút đã học hôm nay không đổi

### Requirement: Màn bài còn hiện thì thời gian được tính hết
Hệ thống SHALL tính hết thời gian màn bài còn hiện trên màn hình, kể cả khi người học không thao tác gì. Mở màn bài ở hai tab
hoặc hai cửa sổ cùng hiện thì thời gian của mỗi nơi MUST được cộng riêng, không phần nào bị mất.

#### Scenario: S8.1-AC2 Để app mở ở màn bài không thao tác vẫn tính
- **WHEN** người học mở màn bài, không thao tác gì trong 2 giờ, màn bài vẫn hiện trên màn hình suốt thời gian đó, rồi rời màn bài
- **THEN** số phút đã học hôm nay tăng thêm 120

#### Scenario: S8.1-AC2 Hai tab cùng mở màn bài
- **WHEN** người học mở màn bài ở hai cửa sổ cùng hiện trên màn hình, ở đó 3 phút rồi rời màn bài ở cả hai cửa sổ
- **THEN** số phút đã học hôm nay tăng thêm 6

### Requirement: Làm tròn xuống phút
Hệ thống SHALL hiện số phút đã học hôm nay là tổng thời gian trong ngày làm tròn xuống phút. Phần giây lẻ của các lần học
MUST được cộng dồn trước khi làm tròn, không bị bỏ ở từng lần.

#### Scenario: S8.1-AC2 Làm tròn xuống phút
- **WHEN** tổng thời gian ở màn bài hôm nay là 7 phút 50 giây
- **THEN** số phút đã học hôm nay hiện là 7

#### Scenario: S8.1-AC2 Giây lẻ được cộng dồn
- **WHEN** hôm nay người học vào màn bài hai lần, mỗi lần 40 giây
- **THEN** số phút đã học hôm nay là 1

### Requirement: Mỗi ngày đếm lại từ 0
Hệ thống SHALL tính "hôm nay" theo ngày trên đồng hồ của máy người học, từ 0 giờ tới hết 23 giờ 59. Sang ngày mới thì số phút
đã học hôm nay MUST bắt đầu lại từ 0; số phút của ngày trước không cộng sang ngày mới. Mỗi phần thời gian học MUST được tính
vào ngày nó diễn ra: học qua nửa đêm thì phần trước 0 giờ tính cho hôm trước, phần từ 0 giờ trở đi tính cho hôm sau.

#### Scenario: S8.1-AC2 Sang ngày mới đếm lại
- **WHEN** hôm qua người học đã học 20 phút, hôm nay chưa vào màn bài và mở Trang chủ
- **THEN** số phút đã học hôm nay là 0

#### Scenario: S8.1-AC2 Nhiều lần học trong cùng ngày được cộng
- **WHEN** buổi sáng người học ở màn bài 5 phút, buổi tối ở màn bài thêm 6 phút trong cùng ngày
- **THEN** số phút đã học hôm nay là 11

#### Scenario: S8.1-AC2 Học qua nửa đêm chia cho hai ngày
- **WHEN** chưa học gì hai ngày đó, người học ở màn bài liên tục từ 23 giờ 50 tới 0 giờ 10 hôm sau rồi rời màn bài
- **THEN** số phút đã học của hôm trước là 10 và số phút đã học hôm nay là 10

### Requirement: Đóng app giữa bài chỉ mất tối đa 30 giây cuối
Hệ thống SHALL giữ thời gian đã học khi người học rời màn bài hoặc khi app bị ẩn: phần thời gian đó MUST không bị mất. Khi
app bị đóng lúc đang ở màn bài, theo bất kỳ cách nào (vuốt tắt app, đóng tab hay cửa sổ, tắt máy), phần bị mất MUST không
quá 30 giây cuối trước lúc đóng; phần còn lại MUST vẫn được tính khi mở lại app. Số phút đã học MUST còn sau khi mở lại app.

#### Scenario: S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối
- **WHEN** hôm nay người học chưa học, ở màn bài 3 phút 40 giây thì đóng app, sau đó mở lại app vào Trang chủ
- **THEN** số phút đã học hôm nay là 3

#### Scenario: S8.1-AC2 Số phút còn sau khi mở lại app
- **WHEN** hôm nay người học đã học 9 phút, đóng app rồi mở lại trong cùng ngày
- **THEN** Trang chủ vẫn hiện 9 phút đã học hôm nay

#### Scenario: S8.1-AC2 Thời gian học đã lưu bị hỏng
- **WHEN** số phút học đã lưu của hôm nay không đọc được
- **THEN** số phút đã học hôm nay được coi là 0 và Trang chủ vẫn hiện bình thường
