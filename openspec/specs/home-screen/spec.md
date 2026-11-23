# home-screen Specification

## Purpose
màn Trang chủ — vào từ đâu, bài tiếp theo, phút hôm nay so với mục tiêu, liên kết lộ trình.

## Requirements

### Requirement: Mở app là vào Trang chủ
Hệ thống SHALL đưa người học đã xong onboarding vào màn Trang chủ khi họ mở app theo bảng dưới.

| Cách mở (người học đã xong onboarding) | Người học thấy |
|---|---|
| Bấm biểu tượng app đã cài, hoặc mở địa chỉ gốc của app | Trang chủ |
| Mở địa chỉ của màn onboarding | Trang chủ |
| Tải lại trang hoặc mở thẳng địa chỉ của một màn khác (bài, lộ trình…) | Vẫn ở màn đó |

#### Scenario: S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ
- **WHEN** người học đã xong onboarding rồi mở lại app từ biểu tượng app hoặc địa chỉ gốc
- **THEN** người học thấy màn Trang chủ, không bị đưa thẳng vào bài 1

#### Scenario: S8.1-AC1 Mở màn onboarding khi đã xong
- **WHEN** người học đã xong onboarding và mở lại màn onboarding
- **THEN** người học được đưa về màn Trang chủ

#### Scenario: S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó
- **WHEN** người học đã xong onboarding, đang ở màn bản đồ lộ trình và tải lại trang
- **THEN** người học vẫn ở màn bản đồ lộ trình

### Requirement: Luồng onboarding giữ như S1.3
Lúc vừa bấm xong bước cuối của onboarding, hệ thống SHALL vẫn đưa người học vào thẳng bài đầu tiên của lộ trình (S1.3 AC4).
Người chưa xong onboarding MUST vẫn vào màn onboarding như S1.3.

#### Scenario: S8.1-AC1 Vừa xong onboarding vẫn vào bài 1
- **WHEN** người học bấm xong bước cuối của onboarding lần đầu
- **THEN** người học vào màn học của bài đầu tiên của lộ trình

#### Scenario: S8.1-AC1 Chưa xong onboarding thì vẫn vào onboarding
- **WHEN** người học chưa xong onboarding và mở app từ địa chỉ gốc
- **THEN** người học thấy màn onboarding, không thấy Trang chủ

### Requirement: Hiện bài tiếp theo, bấm vào là vào bài
Hiện bài tiếp theo, bấm vào là vào bài. Hệ thống SHALL hiện trên Trang chủ tiêu đề bài tiếp theo kèm nút "Vào học". Bấm
"Vào học" MUST đưa người học vào màn học của bài đó; bài đang làm dở thì tiếp tục từ câu đang dở (S3.3), trừ bài kiểm tra
(luôn bắt đầu từ câu 1 như S3.5).

#### Scenario: S8.1-AC1 Bấm "Vào học" thì vào bài
- **WHEN** Trang chủ đang hiện một bài tiếp theo và người học bấm "Vào học"
- **THEN** người học vào màn học của đúng bài đó

#### Scenario: S8.1-AC1 Bài tiếp theo đang làm dở
- **WHEN** người học đã làm tới câu thứ ba của bài tiếp theo rồi rời bài, sau đó bấm "Vào học" trên Trang chủ
- **THEN** người học vào bài đó và đang ở câu thứ ba

#### Scenario: S8.1-AC1 Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở
- **WHEN** bài tiếp theo là bài kiểm tra cuối chủ đề, người học đã làm tới câu thứ ba rồi rời bài, sau đó bấm "Vào học" trên Trang chủ
- **THEN** người học vào bài kiểm tra đó và đang ở câu thứ nhất

#### Scenario: S8.1-AC1 Dùng được bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, di chuyển tới nút "Vào học" và nhấn Enter
- **THEN** nút có viền focus nhìn thấy được và người học vào màn học của bài đó

### Requirement: Chọn bài tiếp theo
Hệ thống SHALL chọn bài tiếp theo trên Trang chủ theo bảng (trạng thái bài như bản đồ lộ trình S3.1):

| Tiến độ | Trang chủ hiện |
|---|---|
| Chưa xong bài nào | Bài đầu tiên của lộ trình |
| Còn bài "Đang mở" | Bài "Đang mở" đầu tiên theo thứ tự lộ trình |
| Đã xong mọi bài | "Bạn đã học xong lộ trình hiện có.", không có nút "Vào học" |

Kết quả học đã lưu của một bài không đọc được thì bài đó MUST được coi là chưa xong.

#### Scenario: S8.1-AC1 Chưa học bài nào
- **WHEN** người học đã xong onboarding, chưa xong bài nào và mở Trang chủ
- **THEN** Trang chủ hiện tiêu đề bài đầu tiên của lộ trình và nút "Vào học"

#### Scenario: S8.1-AC1 Đã xong vài bài thì hiện bài kế tiếp
- **WHEN** người học đã xong bài thứ nhất và bài thứ hai, chưa xong bài thứ ba, rồi mở Trang chủ
- **THEN** Trang chủ hiện tiêu đề bài thứ ba

#### Scenario: S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau
- **WHEN** người học đã xong mọi bài của nhóm đầu tiên và mở Trang chủ
- **THEN** Trang chủ hiện tiêu đề bài đầu tiên của nhóm (hoặc giai đoạn) kế tiếp

#### Scenario: S8.1-AC1 Còn bài đang mở ở trước một bài đã xong
- **WHEN** người học đã xong một bài ở chủ đề sau nhưng bài đầu tiên của lộ trình vẫn đang mở
- **THEN** Trang chủ hiện tiêu đề bài đầu tiên của lộ trình

#### Scenario: S8.1-AC1 Đã học xong mọi bài
- **WHEN** người học đã xong mọi bài của lộ trình và mở Trang chủ
- **THEN** Trang chủ hiện "Bạn đã học xong lộ trình hiện có." và không có nút "Vào học"

#### Scenario: S8.1-AC1 Tiến độ lưu bị hỏng
- **WHEN** kết quả học đã lưu của bài thứ nhất không đọc được
- **THEN** Trang chủ vẫn hiện bình thường và bài tiếp theo là bài thứ nhất

### Requirement: Hiện số phút đã học hôm nay so với mục tiêu
Hiện số phút đã học hôm nay so với mục tiêu. Hệ thống SHALL hiện trên Trang chủ dòng chữ "Hôm nay: X / Y phút", X là số phút
đã học hôm nay (theo quy tắc tính phút học mỗi ngày), Y là mục tiêu mỗi ngày người học đã chọn. Mục tiêu đã lưu không đọc
được thì Y MUST là 15. Dòng này MUST được tính lại khi Trang chủ được mở (mở app, quay về từ màn khác) hoặc hiện lại sau khi
app bị ẩn, và không tự đổi khi Trang chủ đang hiện, kể cả khi qua nửa đêm.

#### Scenario: S8.1-AC2 Chưa học hôm nay
- **WHEN** người học chọn mục tiêu 30 phút, hôm nay chưa học phút nào và mở Trang chủ
- **THEN** Trang chủ hiện "Hôm nay: 0 / 30 phút" và không hiện "Đã đạt mục tiêu hôm nay"

#### Scenario: S8.1-AC2 Đã học một phần mục tiêu
- **WHEN** người học chọn mục tiêu 15 phút, hôm nay đã học 7 phút và mở Trang chủ
- **THEN** Trang chủ hiện "Hôm nay: 7 / 15 phút"

#### Scenario: S8.1-AC2 Mục tiêu lưu bị hỏng
- **WHEN** mục tiêu mỗi ngày đã lưu không đọc được và người học mở Trang chủ
- **THEN** Trang chủ hiện mục tiêu là 15 phút

#### Scenario: S8.1-AC2 Để Trang chủ mở qua nửa đêm
- **WHEN** người học chọn mục tiêu 15 phút, hôm nay đã học 20 phút, để Trang chủ hiện trên màn hình từ 23 giờ 59 tới 0 giờ 01 hôm sau, chưa vào màn bài nào
- **THEN** Trang chủ vẫn hiện "Hôm nay: 20 / 15 phút" cho tới khi người học rời rồi quay về Trang chủ hoặc mở lại app, lúc đó hiện "Hôm nay: 0 / 15 phút"

#### Scenario: S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm
- **WHEN** người học chọn mục tiêu 15 phút, hôm nay đã học 20 phút, đang ở Trang chủ thì app bị ẩn (chuyển sang app khác hoặc khóa màn hình) lúc 23 giờ 59 và hiện lại lúc 0 giờ 01 hôm sau, vẫn ở Trang chủ
- **THEN** Trang chủ hiện "Hôm nay: 0 / 15 phút" và không hiện "Đã đạt mục tiêu hôm nay"

#### Scenario: S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng
- **WHEN** người học mở Trang chủ thấy "Hôm nay: 0 / 15 phút", bấm "Vào học", làm xong bài trong 2 phút, bấm "Trang chủ" trên màn tổng kết
- **THEN** Trang chủ hiện "Hôm nay: 2 / 15 phút"

### Requirement: Báo đã đạt mục tiêu hôm nay
Hệ thống SHALL hiện thêm dòng "Đã đạt mục tiêu hôm nay" khi số phút đã học hôm nay (X) bằng hoặc lớn hơn mục tiêu (Y); khi vượt, X MUST vẫn là số thật.

| Tình huống | Trang chủ hiện |
|---|---|
| X < Y | "Hôm nay: X / Y phút" |
| X ≥ Y | "Hôm nay: X / Y phút" và "Đã đạt mục tiêu hôm nay" |

#### Scenario: S8.1-AC2 Vượt mục tiêu
- **WHEN** người học chọn mục tiêu 30 phút, hôm nay đã học 45 phút và mở Trang chủ
- **THEN** Trang chủ hiện "Hôm nay: 45 / 30 phút" và "Đã đạt mục tiêu hôm nay"

#### Scenario: S8.1-AC2 Vừa đúng mục tiêu
- **WHEN** người học chọn mục tiêu 15 phút, hôm nay đã học đúng 15 phút và mở Trang chủ
- **THEN** Trang chủ hiện "Hôm nay: 15 / 15 phút" và "Đã đạt mục tiêu hôm nay"

### Requirement: Liên kết tới bản đồ lộ trình
Hệ thống SHALL có trên Trang chủ liên kết "Xem lộ trình" đưa người học tới màn bản đồ lộ trình (S3.1), ở mọi tình huống kể
cả khi đã học xong mọi bài.

#### Scenario: S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ
- **WHEN** người học bấm "Xem lộ trình" trên Trang chủ
- **THEN** người học vào màn bản đồ lộ trình

### Requirement: Trang chủ dùng được khi offline
Hệ thống SHALL hiện Trang chủ đầy đủ (bài tiếp theo, phút hôm nay / mục tiêu) khi không có mạng, với điều kiện người học đã
mở app ít nhất một lần (như S1.2).

#### Scenario: S8.1-AC1 Mở Trang chủ khi offline
- **WHEN** người học đã mở app một lần và xong onboarding, tắt mạng rồi mở lại app
- **THEN** Trang chủ hiện tiêu đề bài tiếp theo, nút "Vào học" và dòng "Hôm nay: X / Y phút"
