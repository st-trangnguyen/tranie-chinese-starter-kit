## ADDED Requirements

Màn ôn tập, thứ tự hỏi, tự chấm và xếp lịch là của S9.2 "Màn ôn tập"; thẻ và trạng thái "mới" là của S9.1 "Tạo thẻ ôn tập". Spec này
chỉ thêm giới hạn mỗi ngày vào bước chốt danh sách thẻ của phiên. Chỉnh giới hạn trong Cài đặt: capability `settings` của change này.

### Requirement: Giới hạn thẻ mới và lượt ôn mỗi ngày
Mặc định tối đa 20 thẻ mới và 200 lượt ôn mỗi ngày.

Khi chốt danh sách thẻ của phiên lúc mở màn ôn tập, hệ thống SHALL lấy tối đa số thẻ theo bảng sau, mỗi loại tính riêng. Giới hạn là giá trị
đang chọn trong Cài đặt; chưa từng chỉnh thì là 20 thẻ mới và 200 lượt ôn.

| Loại thẻ đến hạn | Tối đa trong phiên |
|---|---|
| Thẻ "mới" | Giới hạn thẻ mới trừ số thẻ mới đã chấm hôm nay, không dưới 0 |
| Thẻ đã chấm | Giới hạn lượt ôn trừ số lượt ôn hôm nay, không dưới 0 |

#### Scenario: S9.3-AC1 Mặc định tối đa 20 thẻ mới
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn, rồi mở màn
  ôn tập
- **THEN** màn hiện "Thẻ 1 / 20"
- **AND** 5 thẻ "mới" không được lấy là 5 thẻ đứng sau cùng theo thứ tự hỏi, vẫn ở trạng thái "mới"

#### Scenario: S9.3-AC1 Thẻ mới và lượt ôn tính riêng
- **WHEN** (unit test của quy tắc chốt phiên) người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 210 thẻ đã chấm đến hạn và
  30 thẻ "mới"
- **THEN** phiên có 220 thẻ: 200 thẻ đã chấm có hạn sớm nhất, rồi 20 thẻ "mới" đứng trước theo thứ tự hỏi

#### Scenario: S9.3-AC1 Số đã chấm trong ngày cộng dồn qua nhiều lần mở màn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 25 thẻ "mới"; người học mở màn ôn tập, chấm "Dễ" 12 thẻ đầu,
  bấm "Về Trang chủ", rồi mở lại màn ôn tập ngay
- **THEN** màn hiện "Thẻ 1 / 8"

### Requirement: Thẻ bị bỏ qua không tính vào giới hạn
Thẻ bị bỏ qua của S9.2 (Requirement "Thẻ bị bỏ qua": thẻ của từ không có trong nội dung app, thẻ đọc không được) SHALL bị loại trước khi áp
giới hạn: không chiếm chỗ trong giới hạn, không tính là thẻ đến hạn bị giữ lại vì giới hạn, và MUST NOT làm hiện câu "Đã đạt giới hạn ôn tập
hôm nay.".

#### Scenario: S9.3-AC1 Thẻ bị bỏ qua không chiếm chỗ trong giới hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 22 thẻ "mới" và 2 thẻ "mới" của từ không có trong nội dung app
  (đến từ file sao lưu), không có thẻ đã chấm nào đến hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 20"
- **AND** khi người học chấm hết 20 thẻ, màn hiện "Đã ôn xong 20 thẻ." rồi "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể
  tăng giới hạn trong Cài đặt."

#### Scenario: S9.3-AC1 Chỉ thẻ bị bỏ qua vượt giới hạn thì không hiện câu giới hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 20 thẻ "mới" và 2 thẻ "mới" của từ không có trong nội dung app
  (đến từ file sao lưu), không có thẻ đã chấm nào đến hạn, mở màn ôn tập và chấm hết 20 thẻ
- **THEN** màn hiện "Đã ôn xong 20 thẻ." và không có câu "Đã đạt giới hạn ôn tập hôm nay."

### Requirement: Thẻ nào được lấy khi vượt giới hạn
Khi số thẻ đến hạn của một loại nhiều hơn số tối đa còn lại, hệ thống SHALL lấy các thẻ đứng trước theo Requirement "Thứ tự hỏi các thẻ"
(thẻ đã chấm: hạn sớm hơn trước). Thẻ không được lấy SHALL giữ nguyên trạng thái và thời điểm ôn tiếp theo, và được xét lại ở lần mở màn sau.

#### Scenario: S9.3-AC1 Mặc định tối đa 200 lượt ôn
- **WHEN** (unit test của quy tắc chốt phiên) người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 230 thẻ đã chấm đến hạn với
  hạn khác nhau và không có thẻ "mới"
- **THEN** phiên có 200 thẻ, là 200 thẻ có hạn sớm nhất

### Requirement: Cách đếm thẻ mới và lượt ôn trong ngày
Hệ thống SHALL đếm mỗi lần chấm đã lưu được trên màn ôn tập theo bảng sau; lần chấm ở chỗ khác không được đếm:

| Lần chấm | Tính vào |
|---|---|
| Thẻ đang ở trạng thái "mới", chấm trên màn ôn tập | 1 thẻ mới (không tính lượt ôn) |
| Thẻ đã chấm trước đó, chấm trên màn ôn tập, kể cả thẻ quay lại sau bước học ngắn trong cùng ngày | 1 lượt ôn |
| Lần chấm không lưu được | Không tính |
| Thẻ nhận mức chấm từ viết không gợi ý (S6.3) | Không tính |

#### Scenario: S9.3-AC1 Chấm lại sau bước học ngắn tính là lượt ôn
- **WHEN** (unit test của quy tắc đếm) hôm nay chưa chấm thẻ nào, người học chấm "Quên" thẻ "你好" chiều nghĩa đang ở trạng thái "mới", rồi
  khi thẻ đó tới hạn lại trong cùng ngày, chấm thẻ đó "Được"
- **THEN** hôm nay có 1 thẻ mới và 1 lượt ôn

#### Scenario: S9.3-AC1 Lưu lỗi thì không đếm
- **WHEN** hôm nay người học đã chấm 19 thẻ mới, có 3 thẻ "mới" và không có thẻ đã chấm nào đến hạn, mở màn ôn tập (màn hiện "Thẻ 1 / 1"),
  bấm "Được" nhưng lưu bị lỗi, rồi bấm "Về Trang chủ" và mở lại màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 1"

#### Scenario: S9.3-AC1 Viết không gợi ý không tính vào giới hạn
- **WHEN** (unit test của quy tắc đếm) hôm nay chưa chấm thẻ nào trên màn ôn tập, thẻ "人" chiều viết ở trạng thái "mới" nhận một mức chấm từ
  viết không gợi ý
- **THEN** hôm nay có 0 thẻ mới và 0 lượt ôn

### Requirement: Mỗi ngày đếm lại từ 0
Hệ thống SHALL tính "hôm nay" cho giới hạn ôn tập giống số phút học (S8.1, Requirement "Mỗi ngày đếm lại từ 0"): theo ngày trên đồng hồ của
máy, từ 0 giờ tới hết 23 giờ 59. Sang ngày mới thì số thẻ mới và số lượt ôn hôm nay MUST bắt đầu lại từ 0. Mỗi lần chấm MUST được tính
vào ngày nó được lưu; danh sách thẻ của phiên đang mở không đổi khi qua nửa đêm.

#### Scenario: S9.3-AC1 Sang ngày mới được thêm thẻ mới
- **WHEN** người học chưa từng chỉnh giới hạn, hôm qua đã chấm 20 thẻ mới, còn 10 thẻ "mới" và không có thẻ đã chấm nào đến
  hạn, và hôm nay mở màn ôn tập lúc 0 giờ 05
- **THEN** màn hiện "Thẻ 1 / 10"

#### Scenario: S9.3-AC1 Phiên qua nửa đêm tính mỗi lần chấm vào ngày của nó
- **WHEN** người học chưa từng chỉnh giới hạn, chưa chấm thẻ nào hai ngày đó, có 30 thẻ "mới"; mở màn ôn tập lúc 23 giờ 58 (màn hiện "Thẻ
  1 / 20"), chấm "Dễ" 2 thẻ trước 0 giờ và 3 thẻ sau 0 giờ, vẫn thấy "Thẻ 6 / 20", rồi bấm "Về Trang chủ" và mở lại màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 17"

### Requirement: Số đã chấm và số phút học không ảnh hưởng nhau
Số đã chấm và số phút học (S8.1) của cùng một ngày MUST NOT làm đổi nhau:

| Việc | Không làm đổi |
|---|---|
| Chấm thẻ | Số phút học, mục tiêu của ngày, ngày đạt mục tiêu, streak |
| Ghi thêm phút học | Số thẻ mới, số lượt ôn đã chấm |
| Ngày chỉ chấm thẻ | Ngày đó như ngày không học phút nào |

#### Scenario: S9.3-AC1 Ôn tập không làm đổi số phút học và streak
- **WHEN** mục tiêu là 15 phút, Trang chủ hiện "Hôm nay: 7 / 15 phút" và streak là 2; người học mở màn ôn tập, chấm "Được" 3 thẻ, bấm "Về
  Trang chủ"
- **THEN** Trang chủ vẫn hiện "Hôm nay: 7 / 15 phút" và streak là 2

#### Scenario: S9.3-AC1 Học thêm phút không làm mất số đã chấm hôm nay
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn; người học mở
  màn ôn tập, chấm "Dễ" 12 thẻ đầu, bấm "Về Trang chủ", vào học một bài trong 2 phút, rồi mở lại màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 8"

#### Scenario: S9.3-AC1 Ngày chỉ ôn tập không tính là ngày học
- **WHEN** (unit test) hôm qua người học không học phút nào nhưng đã chấm 5 thẻ trên màn ôn tập, hôm kia đạt mục tiêu, và hôm nay chưa học
- **THEN** số phút đã học hôm qua là 0, hôm qua không tính là ngày đạt mục tiêu, và streak là 0

### Requirement: Số đã chấm hôm nay đọc không được thì coi là 0
Khi số thẻ mới hoặc số lượt ôn đã chấm hôm nay không đọc được, hệ thống SHALL coi số đó là 0 và MUST NOT báo lỗi; khi giới hạn trong Cài
đặt không đọc được, hệ thống SHALL dùng mặc định 20 thẻ mới và 200 lượt ôn, MUST NOT báo lỗi.

#### Scenario: S9.3-AC1 Số đã chấm hôm nay bị hỏng thì coi là 0
- **WHEN** người học chưa từng chỉnh giới hạn, có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn, số thẻ mới đã chấm hôm nay đã lưu không
  đọc được, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 20", không có thông báo lỗi

#### Scenario: S9.3-AC1 Cài đặt không đọc được thì dùng giới hạn mặc định
- **WHEN** người học đã chọn "10 thẻ" ở "Thẻ mới mỗi ngày", có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn, hôm nay chưa chấm thẻ nào;
  người học đang ở màn Lộ trình thì app không còn đọc được cài đặt trên máy, rồi người học mở màn ôn tập bằng liên kết trong app hoặc tải lại
  đúng trang ôn tập (không đi qua trang bắt đầu)
- **THEN** màn hiện "Thẻ 1 / 20", không có thông báo lỗi

## MODIFIED Requirements

### Requirement: Thẻ nào được hỏi trong phiên
Hệ thống SHALL chốt danh sách thẻ của phiên lúc mở màn ôn tập theo bảng sau, rồi áp giới hạn mỗi ngày (Requirement "Giới hạn thẻ mới và lượt
ôn mỗi ngày"):

| Thẻ | Được hỏi? |
|---|---|
| Thẻ "mới" (chưa chấm lần nào) | Có, đến hạn ngay khi tạo, trong giới hạn thẻ mới còn lại hôm nay |
| Đã chấm, thời điểm ôn tiếp theo đã tới lúc mở màn | Có, trong giới hạn lượt ôn còn lại hôm nay |
| Đã chấm, thời điểm ôn tiếp theo sau lúc mở màn | Không |
| Tới hạn trong lúc đang ôn, kể cả thẻ vừa chấm "Quên" | Không, hỏi ở lần mở màn sau |
| Đến hạn nhưng vượt giới hạn hôm nay | Không, xét lại ở lần mở màn sau |

#### Scenario: S9.2-AC1 Danh sách chốt lúc mở màn
- **WHEN** phiên có 2 thẻ, người học chấm "Quên" thẻ thứ nhất rồi ở lại màn đủ lâu để thẻ đó tới hạn lại trước khi chấm thẻ thứ hai
- **THEN** sau khi chấm thẻ thứ hai, màn báo hết thẻ của phiên, thẻ thứ nhất không được hỏi lại trong phiên này
- **AND** khi người học mở lại màn ôn tập, thẻ thứ nhất được hỏi

#### Scenario: S9.3-AC1 Thẻ vượt giới hạn không được hỏi trong phiên
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay đã chấm 18 thẻ mới, có 5 thẻ "mới" và 1 thẻ đã chấm đến hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 3": thẻ đã chấm, rồi 2 thẻ "mới" đứng trước theo thứ tự hỏi

### Requirement: Màn ôn tập khi không có thẻ để hỏi
Khi phiên không có thẻ nào, hệ thống SHALL hiện một thông báo theo bảng sau, xét từ trên xuống, kèm nút "Về Trang chủ":

| Tình huống | Thông báo |
|---|---|
| Không có thẻ được hỏi nào (chưa có thẻ, hoặc chỉ có thẻ bị bỏ qua) | "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." |
| Có thẻ được hỏi nhưng chưa thẻ nào tới hạn | "Không có thẻ nào cần ôn lúc này." |
| Có thẻ đến hạn nhưng giới hạn hôm nay đã hết, kể cả khi "Thẻ mới mỗi ngày" là "0 thẻ" và chỉ có thẻ "mới" đến hạn | "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." |

#### Scenario: S9.2-AC1 Chưa có thẻ nào
- **WHEN** người học chưa có thẻ ôn tập nào và mở màn ôn tập
- **THEN** màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." và nút "Về Trang chủ"

#### Scenario: S9.2-AC1 Không có thẻ đến hạn
- **WHEN** người học có thẻ nhưng thẻ nào cũng còn ít nhất 1 ngày nữa mới tới hạn, và mở màn ôn tập
- **THEN** màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"

#### Scenario: S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay đã chấm 20 thẻ mới, còn 5 thẻ "mới" và không có thẻ đã chấm nào đến hạn, rồi mở màn ôn
  tập
- **THEN** màn hiện "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." và nút "Về Trang chủ"
- **AND** 5 thẻ đó vẫn ở trạng thái "mới"

#### Scenario: S9.3-AC1 Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn
- **WHEN** người học chọn "0 thẻ" ở "Thẻ mới mỗi ngày", có 5 thẻ "mới" và không có thẻ đã chấm nào đến hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." và nút "Về Trang chủ"
- **AND** màn không hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."

#### Scenario: S9.3-AC1 Hết giới hạn và không còn thẻ đến hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay đã chấm 20 thẻ mới, có thẻ nhưng không thẻ nào đến hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"

### Requirement: Hết thẻ của phiên
Khi người học đã chấm hết N thẻ của phiên, hệ thống SHALL hiện "Đã ôn xong N thẻ." kèm nút "Về Trang chủ". Nếu lúc mở màn có thẻ đến hạn
không được lấy vì giới hạn hôm nay, thông báo SHALL có thêm câu "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới
hạn trong Cài đặt." ngay sau "Đã ôn xong N thẻ.".

#### Scenario: S9.2-AC2 Hết thẻ của phiên
- **WHEN** phiên có 2 thẻ và người học đã chấm cả hai
- **THEN** màn hiện "Đã ôn xong 2 thẻ." và nút "Về Trang chủ"
- **AND** bấm "Về Trang chủ" thì người học vào màn Trang chủ

#### Scenario: S9.3-AC1 Hết phiên khi còn thẻ bị giới hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 25 thẻ "mới", mở màn ôn tập và chấm hết 20 thẻ của phiên
- **THEN** màn hiện "Đã ôn xong 20 thẻ." rồi "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt."
  và nút "Về Trang chủ"

#### Scenario: S9.3-AC1 Hết phiên khi không thẻ nào bị giới hạn
- **WHEN** người học chưa từng chỉnh giới hạn, hôm nay chưa chấm thẻ nào, có 3 thẻ "mới", mở màn ôn tập và chấm hết 3 thẻ
- **THEN** màn hiện "Đã ôn xong 3 thẻ." và không có câu "Đã đạt giới hạn ôn tập hôm nay."

### Requirement: Focus khi màn đổi
Khi nút đang có focus biến mất, hệ thống SHALL chuyển focus theo bảng sau:

| Lúc | Focus ở | Trình đọc màn hình đọc |
|---|---|---|
| Vừa "Hiện đáp án" | Mặt đáp án | "Đáp án", rồi chữ, pinyin, nghĩa |
| Vừa chấm, còn thẻ | Mặt hỏi thẻ kế | "Thẻ x / y", rồi mặt hỏi |
| Vừa chấm, hết thẻ | Thông báo hết thẻ | "Đã ôn xong N thẻ.", rồi câu giới hạn hôm nay nếu có |

Vùng nhận focus (mặt đáp án, mặt hỏi, thông báo) SHALL có viền focus nhìn thấy được, nhưng MUST NOT nằm trong thứ tự Tab.

#### Scenario: S9.2-AC2 Focus không rơi khi đổi mặt thẻ
- **WHEN** người học nhấn Enter ở "Hiện đáp án"
- **THEN** focus nằm ở mặt đáp án, không ở nút "Quên" hay nút chấm nào khác; mặt đáp án có viền focus nhìn thấy được và có tên đọc
  được "Đáp án"
- **AND** khi người học chấm bằng bàn phím và còn thẻ, focus nằm ở mặt hỏi của thẻ kế, có viền focus nhìn thấy được và tên đọc được bắt
  đầu bằng "Thẻ 2 / 2"

#### Scenario: S9.3-AC1 Focus ở thông báo hết thẻ có câu giới hạn
- **WHEN** phiên có 1 thẻ "mới" và lúc mở màn còn thẻ "mới" khác không được lấy vì giới hạn hôm nay; người học chấm thẻ đó bằng bàn phím
- **THEN** focus nằm ở thông báo hết thẻ, có viền focus nhìn thấy được, tên đọc được bắt đầu bằng "Đã ôn xong 1 thẻ." và có câu "Đã đạt giới
  hạn ôn tập hôm nay."
