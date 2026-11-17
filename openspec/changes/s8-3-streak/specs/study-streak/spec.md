## ADDED Requirements

### Requirement: Streak tăng theo ngày đạt mục tiêu
Ngày nào số phút học đạt mục tiêu thì streak tăng 1.

Hệ thống SHALL tính streak là số ngày đạt mục tiêu liên tiếp, đếm lùi theo bảng sau:

| Hôm nay | Hôm qua | Streak |
|---|---|---|
| Đã đạt | bất kỳ | 1 + số ngày đạt liên tiếp tính lùi từ hôm qua |
| Chưa đạt | Đã đạt | Số ngày đạt liên tiếp tính lùi từ hôm qua (chưa về 0 trong ngày) |
| Chưa đạt | Chưa đạt | 0 |

#### Scenario: S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1
- **WHEN** mục tiêu là 15 phút, người học đã đạt mục tiêu 2 ngày liền trước hôm nay, và hôm nay học từ 14 phút lên đủ 15 phút
- **THEN** streak đổi từ 2 thành 3

#### Scenario: S8.3-AC1 Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua
- **WHEN** mục tiêu là 30 phút, người học đã đạt mục tiêu 4 ngày liền đến hết hôm qua, và hôm nay mới học 10 phút
- **THEN** streak là 4

#### Scenario: S8.3-AC1 Bỏ một ngày thì chuỗi đứt
- **WHEN** người học đạt mục tiêu 5 ngày liền đến hết hôm kia, hôm qua không đạt (hoặc không mở app), hôm nay chưa đạt
- **THEN** streak là 0

#### Scenario: S8.3-AC1 Đếm lại sau khi chuỗi đứt
- **WHEN** người học đạt mục tiêu 5 ngày liền đến hết ngày cách đây 3 ngày, hôm kia không đạt, rồi đạt mục tiêu hôm qua và hôm nay
- **THEN** streak là 2, không cộng các ngày trước ngày bị đứt

#### Scenario: S8.3-AC1 Người học mới chưa có ngày nào
- **WHEN** người học vừa xong onboarding và chưa học phút nào
- **THEN** streak là 0

### Requirement: Thế nào là ngày đạt mục tiêu
Hệ thống SHALL coi một ngày là "đạt mục tiêu" khi số phút đã học của ngày đó (đúng con số trang chủ hiện, làm tròn xuống
phút) lớn hơn hoặc bằng mục tiêu dùng để so của ngày đó. Ngày, cách tính phút học và việc phút học được tính cho ngày nào
theo đúng các Requirement tính phút học mỗi ngày của S8.1: "Thời gian ở màn bài được tính là thời gian học", "Màn
bài còn hiện thì thời gian được tính hết", "Làm tròn xuống phút" và "Mỗi ngày đếm lại từ 0"; streak không tính lại theo
cách khác.

#### Scenario: S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt
- **WHEN** mục tiêu là 15 phút và số phút đã học hôm nay là 14 phút 59 giây (trang chủ hiện 14 phút)
- **THEN** hôm nay chưa tính là ngày đạt mục tiêu

#### Scenario: S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy
- **WHEN** người học đạt mục tiêu ngày hôm qua, đồng hồ máy vừa qua 0:00 và hôm nay chưa học phút nào
- **THEN** streak vẫn là chuỗi tính đến hôm qua; nếu hết ngày hôm nay vẫn chưa đạt thì sang ngày kế tiếp streak là 0

#### Scenario: S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó
- **WHEN** mục tiêu là 15 phút, trước hôm qua chưa đạt ngày nào, hôm qua người học đã học 10 phút, rồi ở màn bài liên tục từ 23 giờ 50 hôm qua tới 0 giờ 10 hôm nay và rời màn bài, sau đó mở Trang chủ
- **THEN** hôm qua có 20 phút (đạt), hôm nay có 10 phút (chưa đạt) và streak là 1

### Requirement: Ngày không có số phút dùng được
Hệ thống SHALL xử lý ngày không có số phút dùng được theo bảng sau:

| Tình huống của một ngày | Coi là |
|---|---|
| Không có phút học nào được ghi (không mở app, hoặc trước khi app bắt đầu ghi phút học) | Chưa đạt |
| Số phút học đã lưu của ngày đó không đọc được | 0 phút, chưa đạt |
| Ngày ghi sau hôm nay theo đồng hồ máy (đồng hồ hoặc múi giờ bị chỉnh lùi) | Bỏ qua, không tính vào streak |

#### Scenario: S8.3-AC1 Số phút của một ngày đã qua bị hỏng
- **WHEN** mục tiêu là 15 phút, người học học 20 phút mỗi ngày trong hôm kia, hôm qua và hôm nay, nhưng số phút đã lưu của hôm qua không đọc được
- **THEN** streak là 1 (hôm qua tính là chưa đạt) và Trang chủ vẫn hiện bình thường

#### Scenario: S8.3-AC1 Ngày ghi sau hôm nay không được tính
- **WHEN** mục tiêu là 15 phút, đã có ngày mai được ghi 20 phút (đồng hồ máy bị chỉnh lùi), hôm qua và hôm nay mỗi ngày học 20 phút
- **THEN** streak là 2

### Requirement: Mục tiêu dùng để so cho từng ngày
Hệ thống SHALL so hôm nay với mục tiêu đang chọn lúc này, và so mỗi ngày đã qua với mục tiêu đang chọn lúc ngày đó kết
thúc (kể cả khi đổi mục tiêu sau lần học cuối của ngày). Nhờ vậy kết quả của hôm nay không đổi khi qua 0:00, và đổi mục
tiêu không làm mất hay tạo thêm ngày đã đạt trong quá khứ, trừ ngoại lệ ở Requirement "Mục tiêu bị thiếu hoặc hỏng".

#### Scenario: S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua
- **WHEN** người học đạt mục tiêu 15 phút 3 ngày liền đến hết hôm qua (mỗi ngày học 20 phút), rồi hôm nay đổi mục tiêu sang 30 phút và học 20 phút
- **THEN** streak là 3 (ba ngày đã qua vẫn tính là đạt; hôm nay chưa đạt mục tiêu mới 30 phút)

#### Scenario: S8.3-AC1 Hạ mục tiêu không biến ngày chưa đạt thành đạt
- **WHEN** mục tiêu là 30 phút, hôm kia và hôm qua mỗi ngày người học học 20 phút (chưa đạt), rồi hôm nay đổi mục tiêu sang 15 phút và chưa học
- **THEN** streak là 0

#### Scenario: S8.3-AC1 Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi
- **WHEN** mục tiêu là 15 phút, người học chưa đạt ngày nào trước hôm nay, hôm nay học 20 phút rồi đổi mục tiêu sang 30 phút và không học thêm (streak hiện 0), sau đó đồng hồ máy qua 0:00
- **THEN** streak vẫn là 0

### Requirement: Mục tiêu bị thiếu hoặc hỏng
Hệ thống SHALL dùng mục tiêu thay thế theo bảng sau khi không đọc được mục tiêu:

| Tình huống | Mục tiêu dùng để so |
|---|---|
| Mục tiêu đang chọn không đọc được (cho hôm nay) | 15 phút (giống Trang chủ S8.1) |
| Ngày đã qua, mục tiêu của ngày đó không có (ngày được ghi trước khi app bắt đầu lưu mục tiêu theo ngày) hoặc không đọc được | Mục tiêu dùng để so của hôm nay |

#### Scenario: S8.3-AC1 Mục tiêu đang chọn bị hỏng
- **WHEN** mục tiêu đang chọn không đọc được, hôm nay người học học 15 phút và chưa đạt ngày nào trước hôm nay
- **THEN** streak là 1

#### Scenario: S8.3-AC1 Ngày đã qua không có mục tiêu đọc được
- **WHEN** mục tiêu đang chọn là 15 phút, hôm qua người học học 20 phút nhưng mục tiêu của hôm qua không có hoặc không đọc được, hôm nay học 20 phút
- **THEN** streak là 2 (hôm qua được so với 15 phút)

### Requirement: Streak hiện trên trang chủ
Streak hiện trên trang chủ.

Hệ thống SHALL hiện trên Trang chủ một dòng chữ "Chuỗi ngày học: N ngày", với N là streak hiện tại, kể cả khi N = 0. Dòng
này MUST là chữ đọc được bằng trình đọc màn hình (không chỉ là biểu tượng hay màu), không có hiệu ứng chuyển động, và
MUST hiện được khi không có mạng.

#### Scenario: S8.3-AC2 Trang chủ hiện streak
- **WHEN** hôm kia, hôm qua và hôm nay đều đã đạt mục tiêu, người học mở Trang chủ
- **THEN** Trang chủ hiện "Chuỗi ngày học: 3 ngày"

#### Scenario: S8.3-AC2 Streak bằng 0 vẫn hiện
- **WHEN** người học chưa có ngày nào đạt mục tiêu và mở Trang chủ
- **THEN** Trang chủ hiện "Chuỗi ngày học: 0 ngày"

#### Scenario: S8.3-AC2 Streak hiện khi không có mạng
- **WHEN** người học đã mở app ít nhất một lần khi có mạng, đã đạt mục tiêu 2 ngày liền đến hết hôm qua, tắt mạng rồi mở Trang chủ
- **THEN** Trang chủ hiện "Chuỗi ngày học: 2 ngày"

### Requirement: Lúc streak trên Trang chủ được tính lại
Hệ thống SHALL tính lại streak trên Trang chủ theo bảng sau:

| Lúc | Streak trên Trang chủ |
|---|---|
| Mở hoặc quay lại Trang chủ từ màn khác | Tính lại |
| App quay lại từ nền (chuyển app, mở khóa màn hình, quay lại tab) khi đang ở Trang chủ | Tính lại |
| Trang chủ đang hiện liên tục và đồng hồ máy qua 0:00 | Giữ số cũ cho tới lần tính lại kế tiếp |

#### Scenario: S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay
- **WHEN** Trang chủ đang hiện "Chuỗi ngày học: 2 ngày", hôm nay chưa đạt mục tiêu, người học vào bài học đủ số phút còn thiếu rồi quay lại Trang chủ
- **THEN** Trang chủ hiện "Chuỗi ngày học: 3 ngày" mà không cần mở lại app

#### Scenario: S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật
- **WHEN** Trang chủ đang hiện "Chuỗi ngày học: 2 ngày" (đạt đến hết hôm qua, hôm nay chưa đạt), người học chuyển app khác, đồng hồ máy qua 0:00 rồi người học quay lại app ở Trang chủ
- **THEN** Trang chủ hiện "Chuỗi ngày học: 0 ngày"
