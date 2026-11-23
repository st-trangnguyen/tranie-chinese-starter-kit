## ADDED Requirements

### Requirement: Chỉnh giới hạn ôn tập trong Cài đặt
Chỉnh được trong Cài đặt.

Hệ thống SHALL có trên màn Cài đặt hai nhóm chọn một mức sau. Lựa chọn MUST được lưu ngay, giữ sau khi mở lại app, dùng từ lần mở
màn ôn tập kế tiếp; lưu lỗi thì như "Cài đặt được lưu an toàn".

| Nhóm | Các mức | Mặc định ban đầu |
|---|---|---|
| "Thẻ mới mỗi ngày" | "0 thẻ", "10 thẻ", "20 thẻ", "30 thẻ", "50 thẻ" | "20 thẻ" |
| "Lượt ôn mỗi ngày" | "50 lượt", "100 lượt", "200 lượt", "500 lượt" | "200 lượt" |

#### Scenario: S9.3-AC2 Mặc định 20 thẻ mới và 200 lượt ôn
- **WHEN** người học chưa từng chỉnh giới hạn và mở màn Cài đặt
- **THEN** nhóm "Thẻ mới mỗi ngày" có các mức "0 thẻ", "10 thẻ", "20 thẻ", "30 thẻ", "50 thẻ" và "20 thẻ" đang được chọn
- **AND** nhóm "Lượt ôn mỗi ngày" có các mức "50 lượt", "100 lượt", "200 lượt", "500 lượt" và "200 lượt" đang được chọn

#### Scenario: S9.3-AC2 Đổi số thẻ mới mỗi ngày thì màn ôn tập theo
- **WHEN** người học chọn "10 thẻ" ở "Thẻ mới mỗi ngày", hôm nay chưa chấm thẻ nào, có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn, rồi
  mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 10"

#### Scenario: S9.3-AC2 Đổi số lượt ôn mỗi ngày thì màn ôn tập theo
- **WHEN** người học chọn "50 lượt" ở "Lượt ôn mỗi ngày", hôm nay chưa chấm thẻ nào, có 60 thẻ đã chấm đến hạn và không có thẻ "mới", rồi mở
  màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 50"

#### Scenario: S9.3-AC2 Chọn 0 thẻ mới thì chỉ ôn thẻ đã chấm
- **WHEN** người học chọn "0 thẻ" ở "Thẻ mới mỗi ngày", có 2 thẻ đã chấm và 5 thẻ "mới" đến hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 2" và phiên chỉ có 2 thẻ đã chấm

#### Scenario: S9.3-AC2 Giới hạn giữ sau khi mở lại app
- **WHEN** người học chọn "30 thẻ" và "100 lượt", đóng app rồi mở lại màn Cài đặt
- **THEN** "30 thẻ" và "100 lượt" đang được chọn

#### Scenario: S9.3-AC2 Không lưu được giới hạn thì giữ giá trị cũ
- **WHEN** "Thẻ mới mỗi ngày" đang là "20 thẻ", người học chọn "30 thẻ" nhưng app không lưu được
- **THEN** màn hiện thông báo "Không lưu được cài đặt. Hãy thử lại." và thông báo được đọc cho trình đọc màn hình
- **AND** "20 thẻ" đang được chọn

### Requirement: Đổi giới hạn giữa ngày
Đổi giới hạn giữa ngày MUST NOT xóa số thẻ mới và lượt ôn đã chấm hôm nay; phần còn lại hôm nay SHALL tính theo giới hạn mới. Bảng sau
áp dụng giống nhau cho "Thẻ mới mỗi ngày" (so với số thẻ mới đã chấm hôm nay) và "Lượt ôn mỗi ngày" (so với số lượt ôn hôm nay), mỗi loại
xét riêng:

| Giới hạn mới so với số đã chấm hôm nay | Lần mở màn ôn tập kế tiếp |
|---|---|
| Lớn hơn | Lấy thêm tối đa phần chênh lệch |
| Bằng hoặc nhỏ hơn | Không lấy thêm loại thẻ đó, không báo lỗi |

#### Scenario: S9.3-AC2 Tăng giới hạn giữa ngày thì được thêm thẻ
- **WHEN** giới hạn đang là "20 thẻ", hôm nay người học đã chấm 20 thẻ mới, còn 15 thẻ "mới" và không có thẻ đã chấm nào đến hạn; người học
  chọn "30 thẻ" rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 10"

#### Scenario: S9.3-AC2 Hạ giới hạn dưới số đã chấm hôm nay
- **WHEN** giới hạn đang là "20 thẻ", hôm nay người học đã chấm 15 thẻ mới, còn 5 thẻ "mới" và không có thẻ đã chấm nào đến hạn; người học
  chọn "10 thẻ" rồi mở màn ôn tập
- **THEN** màn hiện "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt."
- **AND** khi người học chọn lại "20 thẻ" và mở màn ôn tập, màn hiện "Thẻ 1 / 5"

#### Scenario: S9.3-AC2 Hạ giới hạn lượt ôn dưới số lượt đã chấm hôm nay
- **WHEN** giới hạn đang là "200 lượt", hôm nay người học đã chấm 120 lượt ôn, còn 30 thẻ đã chấm và không có thẻ "mới" nào đến hạn; người
  học chọn "100 lượt" rồi mở màn ôn tập
- **THEN** màn hiện "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt."
- **AND** khi người học chọn lại "200 lượt" và mở màn ôn tập, màn hiện "Thẻ 1 / 30"

## MODIFIED Requirements

### Requirement: Có màn Cài đặt
Hệ thống SHALL có màn "Cài đặt" mở được từ liên kết "Cài đặt" trên màn Lộ trình. Màn Cài đặt MUST có năm nhóm "Mục tiêu mỗi ngày",
"Tốc độ audio mặc định", "Hiện pinyin", "Thẻ mới mỗi ngày" và "Lượt ôn mỗi ngày", mỗi nhóm có nhãn đọc được, hiện sẵn giá trị đang dùng, và
MUST có liên kết quay về màn Lộ trình. Mọi lựa chọn trên màn MUST thao tác được bằng bàn phím.

#### Scenario: S8.2-AC1 Mở Cài đặt từ màn Lộ trình
- **WHEN** người học bấm liên kết "Cài đặt" trên màn Lộ trình
- **THEN** người học vào màn Cài đặt
- **AND** màn có năm nhóm "Mục tiêu mỗi ngày", "Tốc độ audio mặc định", "Hiện pinyin", "Thẻ mới mỗi ngày" và "Lượt ôn mỗi ngày"

#### Scenario: S8.2-AC1 Quay về Lộ trình
- **WHEN** người học đang ở màn Cài đặt và bấm liên kết quay về Lộ trình
- **THEN** người học về màn Lộ trình

#### Scenario: S8.2-AC1 Đổi lựa chọn bằng bàn phím
- **WHEN** người học chỉ dùng phím Tab, phím mũi tên và phím Space trên màn Cài đặt
- **THEN** người học chọn được mức mục tiêu, mức tốc độ và bật/tắt được "Hiện pinyin"
- **AND** ô đang có focus nhìn thấy được

#### Scenario: S9.3-AC2 Chọn giới hạn ôn tập bằng bàn phím
- **WHEN** người học chỉ dùng phím Tab, phím mũi tên và phím Space trên màn Cài đặt
- **THEN** người học chọn được một mức ở "Thẻ mới mỗi ngày" và một mức ở "Lượt ôn mỗi ngày"
- **AND** ô đang có focus nhìn thấy được

### Requirement: Cài đặt đọc không được thì dùng mặc định
Khi cài đặt đã lưu không đọc được, hệ thống SHALL dùng mặc định (15 phút, "Bình thường (1x)", bật pinyin, "20 thẻ", "200 lượt") và MUST NOT báo lỗi. Tùy chọn nào hỏng thì chỉ tùy chọn đó về mặc định. Không đọc được cả cài đặt khi người học đã ở trong app thì màn học, màn ôn tập và màn Cài đặt dùng mặc định; mở app từ trang bắt đầu lúc đó vẫn như S1.3.

#### Scenario: S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định
- **WHEN** mục tiêu đã lưu là "60 phút", "Hiện pinyin" đã lưu là tắt, còn tốc độ mặc định đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** "Bình thường (1x)" đang được chọn
- **AND** "60 phút" đang được chọn và công tắc "Hiện pinyin" đang tắt
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC1 Mục tiêu đã lưu bị hỏng thì về 15 phút
- **WHEN** tốc độ mặc định đã lưu là "Chậm (0.75x)", còn mục tiêu đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** "15 phút" đang được chọn
- **AND** "Chậm (0.75x)" đang được chọn
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC3 Tùy chọn pinyin đã lưu bị hỏng thì về bật
- **WHEN** mục tiêu đã lưu là "30 phút", còn "Hiện pinyin" đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** công tắc "Hiện pinyin" đang bật
- **AND** "30 phút" đang được chọn
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin
- **WHEN** người học đang ở màn Lộ trình thì app không còn đọc được cài đặt trên máy, rồi người học mở một bài có câu "nói" với từ "你好" bằng liên kết trong app hoặc tải lại đúng trang bài đó (không đi qua trang bắt đầu)
- **THEN** bài mở bình thường, công tắc "Nghe chậm" đang tắt
- **AND** câu "nói" hiện "你好", "nǐ hǎo" và "xin chào"
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định
- **WHEN** người học đang ở màn Lộ trình thì app không còn đọc được cài đặt trên máy, rồi người học mở màn Cài đặt bằng liên kết "Cài đặt" hoặc tải lại đúng trang Cài đặt (không đi qua trang bắt đầu)
- **THEN** "15 phút", "Bình thường (1x)" đang được chọn và công tắc "Hiện pinyin" đang bật
- **AND** màn không hiện thông báo lỗi
- **AND** khi người học chọn "30 phút" mà không lưu được, màn báo "Không lưu được cài đặt. Hãy thử lại." và "15 phút" vẫn đang được chọn

#### Scenario: S9.3-AC2 Giới hạn đã lưu bị hỏng thì chỉ giới hạn đó về mặc định
- **WHEN** mục tiêu đã lưu là "30 phút", "Lượt ôn mỗi ngày" đã lưu là "100 lượt", còn "Thẻ mới mỗi ngày" đã lưu không đọc được, và người học
  mở màn Cài đặt
- **THEN** "20 thẻ" đang được chọn
- **AND** "100 lượt" và "30 phút" đang được chọn
- **AND** màn không hiện thông báo lỗi
