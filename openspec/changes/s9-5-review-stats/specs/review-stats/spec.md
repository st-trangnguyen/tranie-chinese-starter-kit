## ADDED Requirements

### Requirement: Hiện số thẻ theo từng trạng thái
Hiện số thẻ theo từng trạng thái (mới / đang học / đã nhớ).

Màn Thống kê ôn tập SHALL hiện ba nhóm theo thứ tự "Mới", "Đang học", "Đã nhớ", mỗi nhóm là nhãn chữ kèm số thẻ. Mỗi thẻ được đếm MUST
thuộc đúng một nhóm theo trạng thái nhớ, không theo hạn:

| Nhóm | Thẻ thuộc nhóm |
|---|---|
| Mới | Chưa được chấm lần nào |
| Đang học | Đã chấm, còn trong bước học ngắn (thẻ mới chấm "Được"; thẻ "Đã nhớ" vừa chấm "Quên") |
| Đã nhớ | Đã qua bước học ngắn (thẻ mới chấm "Dễ") |

#### Scenario: S9.5-AC1 Ba nhóm theo trạng thái thẻ
- **WHEN** người học có 3 thẻ "mới", một thẻ "mới" vừa chấm "Được" và hai thẻ "mới" vừa chấm "Dễ", rồi mở màn Thống kê ôn tập
- **THEN** màn hiện theo thứ tự "Mới" 3, "Đang học" 1, "Đã nhớ" 2

#### Scenario: S9.5-AC1 Thẻ đã nhớ chấm Quên thì về Đang học
- **WHEN** người học có thẻ "你好" chiều nghĩa ở nhóm "Đã nhớ", tới hạn, chấm "Quên" ở màn ôn tập, rồi mở màn Thống kê ôn tập
- **THEN** thẻ "你好" chiều nghĩa được đếm ở "Đang học", không còn ở "Đã nhớ"

#### Scenario: S9.5-AC1 Thẻ đã nhớ quá hạn vẫn ở nhóm Đã nhớ
- **WHEN** người học có thẻ đã chấm "Dễ" và đã quá thời điểm ôn tiếp theo 3 ngày mà chưa ôn, rồi mở màn Thống kê ôn tập
- **THEN** thẻ đó được đếm ở "Đã nhớ"

### Requirement: Đếm theo thẻ, không theo từ
Số của mỗi nhóm SHALL đếm theo thẻ: mỗi chiều (nghĩa, nghe, viết) của một từ là một thẻ, nên một từ có thể nằm ở nhiều nhóm.

#### Scenario: S9.5-AC1 Đếm theo thẻ, không theo từ
- **WHEN** người học chỉ có ba thẻ của từ "你好": chiều nghĩa đã chấm "Dễ", chiều nghe đã chấm "Được", chiều viết chưa chấm, rồi mở màn
  Thống kê ôn tập
- **THEN** màn hiện "Mới" 1, "Đang học" 1, "Đã nhớ" 1

### Requirement: Thẻ bị bỏ qua không được đếm
Thẻ bị bỏ qua ở màn ôn tập (thẻ của từ không có trong nội dung app, thẻ đọc không được) MUST NOT được đếm vào nhóm nào hay vào bảng dự báo,
và MUST NOT làm hiện thông báo lỗi.

#### Scenario: S9.5-AC1 Thẻ bị bỏ qua không được đếm
- **WHEN** người học có thẻ "你好" chiều nghĩa ở trạng thái "mới", một thẻ "mới" của từ không có trong nội dung app (đến từ file sao lưu)
  và một thẻ đã lưu không đọc được, rồi mở màn Thống kê ôn tập
- **THEN** màn hiện "Mới" 1, "Đang học" 0, "Đã nhớ" 0, không có thông báo lỗi

### Requirement: Dự báo số lượt ôn mỗi ngày trong 7 ngày tới
Dự báo số lượt ôn mỗi ngày trong 7 ngày tới.

Màn Thống kê ôn tập SHALL hiện bảng "Dự báo lượt ôn 7 ngày tới" gồm 7 dòng, cột "Ngày" và "Số lượt ôn": dòng 1 "Hôm nay", dòng 2 "Ngày
mai", dòng 3–7 là thứ + ngày/tháng ("Thứ Tư 25/11"). Ngay dưới bảng MUST có câu "Không tính thẻ mới.". Ngày theo giờ máy, 0 giờ tới 23 giờ
59 (như S8.1).

#### Scenario: S9.5-AC2 Bảng 7 dòng với nhãn ngày
- **WHEN** giờ trên máy là 10:00 Thứ Hai 23/11 và người học mở màn Thống kê ôn tập
- **THEN** bảng "Dự báo lượt ôn 7 ngày tới" có cột "Ngày" và "Số lượt ôn", 7 dòng lần lượt "Hôm nay", "Ngày mai", "Thứ Tư 25/11",
  "Thứ Năm 26/11", "Thứ Sáu 27/11", "Thứ Bảy 28/11", "Chủ nhật 29/11"
- **AND** ngay dưới bảng có câu "Không tính thẻ mới."

### Requirement: Nhãn ngày trong bảng dự báo
Nhãn dòng 3–7 của bảng dự báo SHALL theo dạng thứ + ngày/tháng: ngày và tháng viết số không thêm số 0 ở đầu, không có năm; thứ viết "Thứ
Hai" … "Thứ Bảy", "Chủ nhật".

| Ngày | Nhãn |
|---|---|
| Thứ Tư 25/11 | "Thứ Tư 25/11" |
| Thứ Sáu 1/1 | "Thứ Sáu 1/1" (không phải "01/01") |
| Chủ nhật 3/1 | "Chủ nhật 3/1" |

#### Scenario: S9.5-AC2 Nhãn ngày một chữ số và sang năm mới
- **WHEN** giờ trên máy là 10:00 Thứ Hai 28/12 và người học mở màn Thống kê ôn tập
- **THEN** 7 dòng của bảng lần lượt là "Hôm nay", "Ngày mai", "Thứ Tư 30/12", "Thứ Năm 31/12", "Thứ Sáu 1/1", "Thứ Bảy 2/1",
  "Chủ nhật 3/1"

### Requirement: Thẻ nào được đếm vào ngày nào
Mỗi dòng của bảng dự báo SHALL là số thẻ đếm theo bảng sau, chỉ dựa trên thời điểm ôn tiếp theo đã lưu, không đoán các lần chấm tới:

| Thẻ | Đếm vào |
|---|---|
| "Đang học" / "Đã nhớ", ôn tiếp theo trong 7 ngày | Ngày chứa thời điểm đó |
| "Đang học" / "Đã nhớ", quá hạn | "Hôm nay" |
| "Đang học" / "Đã nhớ", sau dòng 7 | Không đếm |
| "Mới" | Không đếm |

Ngày không có thẻ hiện 0.

#### Scenario: S9.5-AC2 Mỗi thẻ đếm vào ngày ôn tiếp theo
- **WHEN** giờ trên máy là 10:00 Thứ Hai 23/11, người học có hai thẻ đã chấm với thời điểm ôn tiếp theo 15:00 hôm nay, một thẻ 08:00 Thứ
  Tư 25/11 và một thẻ 23:59 Chủ nhật 29/11, rồi mở màn Thống kê ôn tập
- **THEN** bảng hiện "Hôm nay" 2, "Thứ Tư 25/11" 1, "Chủ nhật 29/11" 1, các dòng còn lại 0

#### Scenario: S9.5-AC2 Thẻ quá hạn đếm vào Hôm nay
- **WHEN** giờ trên máy là 10:00 Thứ Hai 23/11, người học có một thẻ đã chấm với thời điểm ôn tiếp theo 08:00 Thứ Sáu 20/11 và một thẻ 09:00
  hôm nay, rồi mở màn Thống kê ôn tập
- **THEN** dòng "Hôm nay" hiện 2

#### Scenario: S9.5-AC2 Ranh giới nửa đêm theo giờ máy
- **WHEN** giờ trên máy là 23:55 Thứ Hai 23/11, người học có một thẻ đã chấm với thời điểm ôn tiếp theo 23:59 hôm nay và một thẻ 00:05 Thứ
  Ba 24/11, rồi mở màn Thống kê ôn tập
- **THEN** dòng "Hôm nay" hiện 1 và dòng "Ngày mai" hiện 1

#### Scenario: S9.5-AC2 Thẻ ôn sau 7 ngày không được đếm
- **WHEN** giờ trên máy là 10:00 Thứ Hai 23/11, người học chỉ có một thẻ đã chấm với thời điểm ôn tiếp theo 00:00 Thứ Hai 30/11, rồi mở màn
  Thống kê ôn tập
- **THEN** cả 7 dòng của bảng hiện 0

#### Scenario: S9.5-AC2 Thẻ mới không được đếm trong dự báo
- **WHEN** người học có 5 thẻ "mới" và không có thẻ đã chấm nào, rồi mở màn Thống kê ôn tập
- **THEN** nhóm "Mới" hiện 5 và cả 7 dòng của bảng hiện 0

### Requirement: Dự báo không áp giới hạn mỗi ngày
Dự báo MUST NOT áp giới hạn mỗi ngày (S9.3): số hiện ra là số thẻ tới hạn trong ngày, có thể lớn hơn số thẻ màn ôn tập lấy trong ngày.

#### Scenario: S9.5-AC2 Không áp giới hạn mỗi ngày
- **WHEN** giới hạn lượt ôn mỗi ngày đang là 200, người học có 201 thẻ đã chấm có thời điểm ôn tiếp theo trong hôm nay, rồi mở màn Thống
  kê ôn tập
- **THEN** dòng "Hôm nay" hiện 201

### Requirement: Số liệu tính lúc mở màn
Màn Thống kê ôn tập SHALL tính ba nhóm và bảng dự báo một lần khi màn mở, theo thẻ đã lưu và giờ trên máy lúc đó; số liệu MUST NOT tự đổi
khi màn đang mở. Mở lại màn thì số liệu được tính lại. Màn chỉ đọc: mở màn MUST NOT thay đổi thẻ nào.

#### Scenario: S9.5-AC1 Mở lại màn sau khi ôn thì số liệu mới
- **WHEN** người học có một thẻ "mới", mở màn Thống kê ôn tập (thấy "Mới" 1), về Trang chủ, vào màn ôn tập chấm thẻ đó "Dễ", rồi mở lại màn
  Thống kê ôn tập
- **THEN** màn hiện "Mới" 0, "Đang học" 0, "Đã nhớ" 1

### Requirement: Màn Thống kê ôn tập khi chưa có thẻ
Khi không có thẻ được đếm nào (chưa có thẻ, hoặc chỉ có thẻ bị bỏ qua), màn Thống kê ôn tập SHALL hiện "Bạn chưa có thẻ ôn tập. Học xong
một bài để có thẻ.", và MUST NOT hiện ba nhóm và bảng dự báo. Lối về Trang chủ chỉ là liên kết "Về Trang chủ" ở đầu màn (Requirement "Rời
màn Thống kê ôn tập"); màn MUST NOT có liên kết hay nút "Về Trang chủ" thứ hai cạnh thông báo. Khi có thẻ được đếm nhưng chưa thẻ nào đã chấm,
màn SHALL hiện ba nhóm và bảng 7 dòng như bình thường.

#### Scenario: S9.5-AC1 Chưa có thẻ nào
- **WHEN** người học chưa có thẻ ôn tập nào và mở màn Thống kê ôn tập
- **THEN** màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."
- **AND** màn có đúng một liên kết "Về Trang chủ", ở đầu màn
- **AND** màn không có ba nhóm "Mới", "Đang học", "Đã nhớ" và không có bảng dự báo

### Requirement: Không tải được thống kê thì thử lại được
Khi đọc thẻ ôn tập bị lỗi, màn Thống kê ôn tập SHALL hiện "Không tải được thống kê ôn tập." trong vùng được trình đọc màn hình đọc tự động
khi xuất hiện, kèm nút "Thử lại". Lối về Trang chủ chỉ là liên kết "Về Trang chủ" ở đầu màn; màn MUST NOT có "Về Trang chủ" thứ hai cạnh
thông báo lỗi. Bấm "Thử lại" thì hệ thống SHALL đọc lại thẻ và hiện số liệu nếu đọc được.

#### Scenario: S9.5-AC1 Không tải được thống kê
- **WHEN** người học mở màn Thống kê ôn tập nhưng đọc thẻ ôn tập bị lỗi
- **THEN** màn hiện "Không tải được thống kê ôn tập." trong vùng được trình đọc màn hình đọc tự động, cùng nút "Thử lại"
- **AND** màn có đúng một liên kết "Về Trang chủ", ở đầu màn

#### Scenario: S9.5-AC1 Thử lại sau lỗi
- **WHEN** màn đang hiện "Không tải được thống kê ôn tập.", lần đọc sau thành công, và người học bấm "Thử lại"
- **THEN** màn hiện ba nhóm và bảng dự báo, không còn thông báo lỗi

### Requirement: Rời màn Thống kê ôn tập
Màn Thống kê ôn tập SHALL có tiêu đề "Thống kê ôn tập" và một liên kết "Về Trang chủ" ở đầu màn, ở mọi trạng thái của màn (có số liệu,
chưa có thẻ, lỗi); đây là lối về Trang chủ duy nhất trên màn.

#### Scenario: S9.5-AC1 Về Trang chủ từ màn Thống kê ôn tập
- **WHEN** người học đang ở màn Thống kê ôn tập và bấm "Về Trang chủ"
- **THEN** người học vào màn Trang chủ

### Requirement: Focus khi mở màn Thống kê ôn tập
Khi màn Thống kê ôn tập vừa mở (có số liệu, chưa có thẻ, hoặc lỗi), hệ thống MUST NOT chuyển focus vào một vùng riêng của màn; chỗ đầu tiên
Tab tới trong màn SHALL là liên kết "Về Trang chủ". Câu lỗi (nếu có) được đọc qua vùng đọc tự động, không kéo focus.

#### Scenario: S9.5-AC1 Focus khi mở màn
- **WHEN** người học chỉ dùng bàn phím, mở màn Thống kê ôn tập từ Trang chủ và đọc thẻ ôn tập bị lỗi
- **THEN** "Không tải được thống kê ôn tập." được trình đọc màn hình đọc tự động mà không cần chuyển focus
- **AND** nhấn Tab lần đầu trong màn thì focus tới liên kết "Về Trang chủ", nhấn Tab lần nữa thì tới nút "Thử lại"

### Requirement: Focus sau khi Thử lại
Khi người học bấm "Thử lại", hệ thống SHALL đặt focus theo bảng sau; vùng nhận focus có viền focus nhìn thấy được và MUST NOT nằm trong thứ
tự Tab.

| Lúc | Focus ở |
|---|---|
| Đọc được, có thẻ được đếm | Tiêu đề chính "Thống kê ôn tập" |
| Đọc được, không thẻ nào được đếm | Thông báo chưa có thẻ |
| Vẫn lỗi | Nút "Thử lại", câu lỗi đọc lại tự động |

#### Scenario: S9.5-AC1 Focus sau khi Thử lại thành công
- **WHEN** màn đang hiện "Không tải được thống kê ôn tập.", người học có thẻ đã chấm, nhấn Enter ở "Thử lại" và lần này đọc được thẻ
- **THEN** focus nằm ở tiêu đề chính "Thống kê ôn tập", có viền focus nhìn thấy được, không về đầu trang
- **AND** tiêu đề không nằm trong thứ tự Tab

#### Scenario: S9.5-AC1 Focus sau khi Thử lại mà chưa có thẻ
- **WHEN** màn đang hiện "Không tải được thống kê ôn tập.", người học chưa có thẻ ôn tập nào, nhấn Enter ở "Thử lại" và lần này đọc được
- **THEN** focus nằm ở thông báo "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ.", có viền focus nhìn thấy được, tên đọc được là câu
  thông báo đó

#### Scenario: S9.5-AC1 Focus khi Thử lại vẫn lỗi
- **WHEN** màn đang hiện "Không tải được thống kê ôn tập.", người học nhấn Enter ở "Thử lại" và lần này vẫn lỗi
- **THEN** focus vẫn ở nút "Thử lại" và "Không tải được thống kê ôn tập." được trình đọc màn hình đọc lại tự động

### Requirement: Thống kê ôn tập dùng được khi offline
Hệ thống SHALL cho mở màn Thống kê ôn tập và hiện đúng số liệu khi không có mạng, với điều kiện người học đã mở app ít nhất một lần (như
S1.2).

#### Scenario: S9.5-AC2 Xem thống kê khi offline
- **WHEN** người học đã mở app một lần, có một thẻ "mới" và một thẻ đã chấm "Dễ", tắt mạng, mở Trang chủ rồi bấm "Thống kê ôn tập"
- **THEN** màn hiện "Mới" 1, "Đã nhớ" 1 và bảng dự báo 7 dòng

### Requirement: Đọc và dùng được màn Thống kê ôn tập
Màn Thống kê ôn tập SHALL:

| Mục | Yêu cầu |
|---|---|
| Trình đọc màn hình | Tiêu đề màn "Thống kê ôn tập" là tiêu đề chính; mỗi số của ba nhóm đi cùng nhãn chữ của nhóm; bảng dự báo là bảng có tên "Dự báo lượt ôn 7 ngày tới" và tiêu đề cột "Ngày", "Số lượt ôn" |
| Bàn phím | Mọi liên kết và nút tới được bằng Tab, dùng được bằng Enter, có viền focus nhìn thấy được |
| Khổ hẹp | Ở khổ 375 px không cuộn ngang |
| Chuyển động | Không có hiệu ứng chuyển động |

#### Scenario: S9.5-AC2 Bảng dự báo đọc được bằng trình đọc màn hình
- **WHEN** người học có thẻ đã chấm và mở màn Thống kê ôn tập
- **THEN** màn có tiêu đề chính "Thống kê ôn tập", có bảng tên "Dự báo lượt ôn 7 ngày tới" với tiêu đề cột "Ngày" và "Số lượt ôn"
- **AND** mỗi số của ba nhóm có nhãn "Mới", "Đang học" hoặc "Đã nhớ" đi kèm

#### Scenario: S9.5-AC1 Dùng màn Thống kê ôn tập bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, mở màn Thống kê ôn tập, Tab tới "Về Trang chủ" và nhấn Enter
- **THEN** liên kết có viền focus nhìn thấy được và người học vào màn Trang chủ

#### Scenario: S9.5-AC1 Khổ 375 px không cuộn ngang
- **WHEN** người học mở màn Thống kê ôn tập ở khổ 375 × 812 có thẻ ở cả ba nhóm
- **THEN** trang không cuộn ngang và thấy đủ ba nhóm và 7 dòng của bảng khi cuộn dọc
