# progress-backup Specification

## Purpose
xuất toàn bộ tiến độ ra file JSON, nhập file (kiểm tra trước, báo lỗi giữ nguyên dữ liệu cũ, hỏi xác nhận rồi ghi đè toàn bộ), chạy offline.

## Requirements

### Requirement: Mục Sao lưu tiến độ trong Cài đặt
Màn Cài đặt SHALL có mục "Sao lưu tiến độ" gồm hai nút "Xuất tiến độ" và "Nhập tiến độ". Hai nút MUST dùng được bằng bàn phím
(Tab tới, Enter hoặc Space để bấm) và dùng được khi không có mạng.

#### Scenario: S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ
- **WHEN** người học mở màn Cài đặt
- **THEN** màn có mục "Sao lưu tiến độ" với nút "Xuất tiến độ" và nút "Nhập tiến độ"

#### Scenario: S8.5-AC1 Hai nút dùng được bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím ở màn Cài đặt, bấm Tab tới "Xuất tiến độ" rồi bấm Enter
- **THEN** file tiến độ được lưu xuống máy như khi bấm bằng chuột
- **AND** bấm Tab tiếp thì tới được nút "Nhập tiến độ"

### Requirement: Xuất toàn bộ tiến độ ra file JSON
Export ra một file JSON chứa toàn bộ tiến độ. Khi người học bấm "Xuất tiến độ", hệ thống SHALL lưu xuống máy một file JSON tên
`tranie-tien-do-<năm>-<tháng>-<ngày>.json` (ngày trên máy lúc xuất, ví dụ `tranie-tien-do-2026-11-17.json`) và báo
"Đã xuất tiến độ." Xuất MUST NOT làm đổi tiến độ trên máy. Không có tiến độ nào thì
vẫn xuất được.

#### Scenario: S8.5-AC1 Bấm Xuất tiến độ thì lưu được file
- **WHEN** ngày trên máy là 17/11/2026 và người học bấm "Xuất tiến độ"
- **THEN** máy lưu một file tên `tranie-tien-do-2026-11-17.json` có nội dung là JSON đọc được
- **AND** màn báo "Đã xuất tiến độ."

#### Scenario: S8.5-AC1 Xuất không làm đổi tiến độ
- **WHEN** người học đã xong bài 1, đang dở bài 2 rồi bấm "Xuất tiến độ"
- **THEN** màn Lộ trình vẫn hiện bài 1 "Đã xong" và bài 2 làm tiếp từ đúng câu đang dở

#### Scenario: S8.5-AC1 Chưa học gì vẫn xuất được
- **WHEN** người học vừa qua màn chào mừng, chưa học bài nào, bấm "Xuất tiến độ"
- **THEN** máy lưu file tiến độ và màn báo "Đã xuất tiến độ."

#### Scenario: S8.5-AC1 Xuất khi không có mạng
- **WHEN** máy không có mạng và người học bấm "Xuất tiến độ"
- **THEN** máy lưu file tiến độ và màn báo "Đã xuất tiến độ."

#### Scenario: S8.5-AC1 Không đọc được tiến độ thì báo lỗi
- **WHEN** người học bấm "Xuất tiến độ" nhưng app không đọc được tiến độ đang lưu trên máy
- **THEN** không có file nào được lưu
- **AND** màn báo "Không xuất được tiến độ. Hãy thử lại."

### Requirement: Báo đã xuất khi file đã đưa cho trình duyệt
"Đã xuất tiến độ." SHALL hiện khi app đã đưa file cho trình duyệt lưu, không chờ người học lưu xong. Người học hủy hộp lưu hoặc
bảng chia sẻ của trình duyệt sau đó thì MUST NOT bị coi là lỗi và không có thông báo khác.

#### Scenario: S8.5-AC1 Báo đã xuất ngay khi trình duyệt nhận file
- **WHEN** người học bấm "Xuất tiến độ"
- **THEN** trình duyệt nhận một file tải xuống tên `tranie-tien-do-<năm>-<tháng>-<ngày>.json`
- **AND** màn báo "Đã xuất tiến độ." mà không có thông báo lỗi nào

### Requirement: File xuất chứa toàn bộ tiến độ
File xuất SHALL chứa các loại tiến độ theo bảng dưới; nhập lại file đó MUST cho lại đúng các loại tiến độ này.

| Loại tiến độ | Có trong file |
|---|---|
| Bài đã xong, đang dở, câu đang dở (kể cả qua kiểm tra vượt cấp) | Có |
| Mọi lựa chọn trong Cài đặt: mục tiêu phút mỗi ngày, tốc độ audio mặc định, hiện pinyin; đã qua màn chào mừng | Có |
| Số phút đã học từng ngày | Có |
| Mục tiêu của từng ngày | Có |
| Thẻ ôn tập, chữ đã viết xong (S9.1) | Có |
| Bản ghi âm, audio đã tải | Không |

#### Scenario: S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ
- **WHEN** ở máy A người học đã xong bài 1 và bài 2, đang dở bài 3 ở câu 4, chọn mục tiêu 30 phút mỗi ngày, rồi bấm "Xuất tiến độ"
- **AND** ở máy B người học vừa qua màn chào mừng với mục tiêu 15 phút mỗi ngày, chưa học bài nào, rồi vào Cài đặt nhập file đó
  và bấm "Ghi đè"
- **THEN** ở máy B màn Lộ trình hiện bài 1, bài 2 "Đã xong", mở bài 3 thì làm tiếp từ câu 4
- **AND** màn Cài đặt của máy B hiện mục tiêu 30 phút mỗi ngày

#### Scenario: S8.5-AC1 File có lựa chọn hiện pinyin
- **WHEN** ở máy A người học tắt "hiện pinyin" trong Cài đặt rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng) "hiện pinyin" đang bật, người học nhập file đó và bấm "Ghi đè"
- **THEN** màn Cài đặt của máy B hiện "hiện pinyin" đang tắt

#### Scenario: S8.5-AC1 File có số phút đã học từng ngày
- **WHEN** ở máy A mục tiêu là 15 phút mỗi ngày, hôm nay người học đã học 12 phút, xuất file rồi nhập file đó ở máy B (đã qua màn
  chào mừng) trong cùng ngày
- **THEN** Trang chủ của máy B hiện "Hôm nay: 12 / 15 phút"

#### Scenario: S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp
- **WHEN** ở máy A người học đã xong bài 1, rồi đạt bài kiểm tra vượt cấp của một chủ đề chưa mở có bài kiểm tra (chủ đề thứ k),
  các chủ đề ở giữa vẫn "Đã khóa"; người học xuất file rồi nhập file đó ở máy B (đã qua màn chào mừng)
- **THEN** màn Lộ trình của máy B hiện bài 1 "Đã xong", mọi bài của chủ đề thứ k "Đã xong" và bài đầu của chủ đề thứ k+1 "Đang mở"
- **AND** các chủ đề ở giữa vẫn "Đã khóa"

### Requirement: Chuỗi ngày học có lại đúng sau khi nhập
Chuỗi ngày học không lưu riêng mà được tính lại từ phút học và mục tiêu của từng ngày. Sau khi nhập, Trang chủ SHALL hiện chuỗi
ngày học như ở máy xuất file trong cùng ngày.

#### Scenario: S8.5-AC1 Chuỗi ngày học giữ đúng nhờ mục tiêu của từng ngày
- **WHEN** ở máy A hôm qua người học học 20 phút với mục tiêu 15 phút, hôm nay đổi mục tiêu sang 30 phút và chưa học, Trang chủ
  hiện "Chuỗi ngày học: 1 ngày"
- **AND** người học xuất file rồi nhập file đó ở máy B (đã qua màn chào mừng) trong cùng ngày
- **THEN** Trang chủ của máy B hiện "Chuỗi ngày học: 1 ngày"

### Requirement: Nhập kiểm tra file trước khi ghi
Import kiểm tra file hợp lệ trước. File lỗi thì báo lỗi và giữ nguyên dữ liệu cũ. Hệ thống SHALL kiểm tra toàn bộ file người học
chọn qua "Nhập tiến độ" trước khi đụng vào tiến độ trên máy. File lỗi thì MUST báo lỗi (yêu cầu "Thông báo cho từng loại file
lỗi"), MUST NOT hiện hộp xác nhận và MUST NOT đổi tiến độ trên máy.

#### Scenario: S8.5-AC2 File không phải JSON bị từ chối
- **WHEN** người học đã xong bài 1, bấm "Nhập tiến độ" và chọn một file ảnh
- **THEN** màn báo "File này không phải file tiến độ của Tranie Chinese." và không hiện hộp xác nhận
- **AND** màn Lộ trình vẫn hiện bài 1 "Đã xong"

#### Scenario: S8.5-AC2 Nhập file lỗi khi không có mạng
- **WHEN** máy không có mạng và người học chọn một file tiến độ có một bài ở trạng thái không tồn tại
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ trên máy không đổi

### Requirement: Hỏi xác nhận rồi ghi đè toàn bộ tiến độ
File hợp lệ thì hỏi xác nhận rồi ghi đè toàn bộ tiến độ. Khi file hợp lệ, hệ thống SHALL hiện hộp xác nhận gồm ngày xuất file,
số bài đã xong trong file, câu "Toàn bộ tiến độ hiện có trên máy này sẽ bị thay bằng tiến độ trong file. Không hoàn tác được.",
nút "Ghi đè" và nút "Hủy". Số bài đã xong chỉ đếm bài có trong nội dung app, kể cả bài xong nhờ kiểm tra vượt cấp; bài không có
trong nội dung app không được đếm. Hệ thống MUST NOT ghi gì trước khi người học bấm "Ghi đè".

#### Scenario: S8.5-AC3 File hợp lệ thì hiện hộp xác nhận
- **WHEN** người học chọn file tiến độ xuất ngày 17/11/2026 có 5 bài đã xong
- **THEN** hiện hộp xác nhận nêu ngày 17/11/2026, 5 bài đã xong, câu cảnh báo không hoàn tác được, nút "Ghi đè" và "Hủy"
- **AND** tiến độ trên máy chưa đổi khi hộp đang mở

#### Scenario: S8.5-AC3 Số bài đã xong gồm bài qua bằng kiểm tra vượt cấp
- **WHEN** người học chọn file xuất từ máy mà người học đã xong bài 1 rồi đạt bài kiểm tra vượt cấp của một chủ đề chưa mở có bài
  kiểm tra (chủ đề thứ k), các chủ đề ở giữa vẫn "Đã khóa" và không có bài nào khác đã xong
- **THEN** hộp xác nhận nêu số bài đã xong bằng 1 cộng số bài của chủ đề thứ k

#### Scenario: S8.5-AC3 Nhập khi không có mạng
- **WHEN** máy không có mạng, người học nhập file hợp lệ và bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ." và màn Lộ trình hiện đúng tiến độ trong file

### Requirement: File sai một phần bị từ chối cả file
Một phần dữ liệu trong file sai thì hệ thống SHALL từ chối cả file, MUST NOT nhận phần đúng. Ví dụ dữ liệu sai: một bài có
trạng thái không tồn tại, mục tiêu phút không có trong lựa chọn 15/30/60.

#### Scenario: S8.5-AC2 File có một phần dữ liệu sai bị từ chối cả file
- **WHEN** máy đang có bài 1 "Đã xong", người học chọn file tiến độ có bài 2, bài 3 hợp lệ nhưng bài 4 có trạng thái không tồn tại
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và không hiện hộp xác nhận
- **AND** màn Lộ trình vẫn hiện bài 1 "Đã xong", bài 2 và bài 3 không thành "Đã xong"

#### Scenario: S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối
- **WHEN** người học chọn file tiến độ có mục tiêu 45 phút mỗi ngày (không có trong lựa chọn 15/30/60)
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và mục tiêu phút trên máy không đổi

### Requirement: Đóng hộp chọn file thì không làm gì
Người học bấm "Nhập tiến độ" rồi đóng hộp chọn file mà không chọn file thì hệ thống SHALL NOT hiện thông báo, hộp xác nhận hay đổi tiến độ.

#### Scenario: S8.5-AC2 Đóng hộp chọn file thì không có gì xảy ra
- **WHEN** người học bấm "Nhập tiến độ" rồi đóng hộp chọn file mà không chọn file nào
- **THEN** màn không hiện thông báo lỗi, không hiện hộp xác nhận và tiến độ trên máy không đổi

### Requirement: Thông báo sao lưu được trình đọc màn hình đọc
Thông báo thành công và thông báo lỗi của xuất, nhập SHALL nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện.

#### Scenario: S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình
- **WHEN** người học chọn một file không phải file tiến độ
- **THEN** thông báo lỗi nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện

#### Scenario: S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình
- **WHEN** người học bấm "Xuất tiến độ" và xuất thành công
- **THEN** "Đã xuất tiến độ." nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện

#### Scenario: S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình
- **WHEN** người học ghi đè thành công
- **THEN** "Đã nhập tiến độ." nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện

### Requirement: Hộp xác nhận dùng được bằng bàn phím
Khi hộp xác nhận mở, focus SHALL nằm trong hộp, ở nút "Hủy" (tránh ghi đè nhầm); Tab chỉ đi giữa các nút trong hộp; đóng hộp thì
focus MUST về nút "Nhập tiến độ".

#### Scenario: S8.5-AC3 Hộp xác nhận dùng được bằng bàn phím
- **WHEN** hộp xác nhận vừa mở
- **THEN** focus ở nút "Hủy", bấm Tab chỉ đi giữa các nút trong hộp
- **AND** đóng hộp thì focus về nút "Nhập tiến độ"

### Requirement: Tiến độ mới hiện ngay sau khi nhập
Sau khi ghi đè thành công, mọi màn (Trang chủ, Lộ trình, Cài đặt) SHALL hiện tiến độ mới mà không cần tải lại app.

#### Scenario: S8.5-AC3 Màn khác hiện tiến độ mới không cần tải lại
- **WHEN** người học ghi đè thành công rồi mở màn Lộ trình mà không tải lại app
- **THEN** màn Lộ trình hiện đúng tiến độ trong file

### Requirement: Tiến độ của bài không có trong app không ảnh hưởng lộ trình
File có tiến độ của bài không có trong nội dung app vẫn hợp lệ. Tiến độ đó SHALL NOT hiện ở đâu và MUST NOT làm đổi trạng thái
hay mở khóa của bài nào.

#### Scenario: S8.5-AC3 Bài không có trong app không ảnh hưởng lộ trình
- **WHEN** người học chọn file có bài 1 "Đã xong" và một bài không có trong nội dung app ở trạng thái đã xong
- **THEN** hộp xác nhận nêu 1 bài đã xong
- **AND** người học bấm "Ghi đè" thì màn Lộ trình hiện bài 1 "Đã xong", bài 2 "Đang mở", các bài còn lại "Đã khóa"

### Requirement: Thông báo cho từng loại file lỗi
Với file lỗi, hệ thống SHALL hiện thông báo theo loại lỗi:

| File chọn | Thông báo |
|---|---|
| Rỗng, không phải JSON, JSON không do app xuất, hoặc lớn hơn 20 MB | "File này không phải file tiến độ của Tranie Chinese." |
| Có dữ liệu sai bên trong | "File tiến độ bị hỏng, không nhập được." |
| Từ phiên bản app mới hơn | "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại." |

#### Scenario: S8.5-AC2 File rỗng bị từ chối
- **WHEN** người học bấm "Nhập tiến độ" và chọn một file JSON rỗng
- **THEN** màn báo "File này không phải file tiến độ của Tranie Chinese." và tiến độ trên máy không đổi

#### Scenario: S8.5-AC2 File JSON của nơi khác bị từ chối
- **WHEN** người học bấm "Nhập tiến độ" và chọn một file JSON hợp lệ nhưng không do app xuất
- **THEN** màn báo "File này không phải file tiến độ của Tranie Chinese." và tiến độ trên máy không đổi

#### Scenario: S8.5-AC2 File lớn hơn 20 MB bị từ chối
- **WHEN** người học đã xong bài 1, bấm "Nhập tiến độ" và chọn một file lớn hơn 20 MB
- **THEN** màn báo "File này không phải file tiến độ của Tranie Chinese." và không hiện hộp xác nhận
- **AND** màn Lộ trình vẫn hiện bài 1 "Đã xong"

#### Scenario: S8.5-AC2 File từ phiên bản app mới hơn bị từ chối
- **WHEN** người học chọn file tiến độ ghi phiên bản định dạng cao hơn bản app đang dùng đọc được
- **THEN** màn báo "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại." và tiến độ trên máy không đổi

### Requirement: Kết quả theo lựa chọn trong hộp xác nhận
Hệ thống SHALL xử lý lựa chọn của người học trong hộp xác nhận theo bảng; ghi đè là tất cả hoặc không gì:

| Người học | Kết quả | Thông báo |
|---|---|---|
| "Hủy" hoặc Esc | Đóng hộp, tiến độ không đổi | Không có |
| "Ghi đè", ghi thành công | Tiến độ trên máy đúng bằng file, không gộp | "Đã nhập tiến độ." |
| "Ghi đè", ghi lỗi giữa chừng | Tiến độ giữ nguyên, không ghi dở | "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên." |

#### Scenario: S8.5-AC3 Hủy thì không đổi gì
- **WHEN** máy có bài 1 "Đã xong", người học chọn file hợp lệ có 5 bài đã xong rồi bấm "Hủy"
- **THEN** hộp đóng và màn Lộ trình vẫn hiện chỉ bài 1 "Đã xong"

#### Scenario: S8.5-AC3 Esc thì như Hủy
- **WHEN** hộp xác nhận đang mở và người học bấm Esc
- **THEN** hộp đóng và tiến độ trên máy không đổi

#### Scenario: S8.5-AC3 Ghi đè thì tiến độ đúng bằng file
- **WHEN** máy có bài 1 đến bài 6 "Đã xong", mục tiêu 60 phút; người học nhập file có bài 1 đến bài 3 "Đã xong", mục tiêu 15 phút, rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** màn Lộ trình hiện bài 1 đến bài 3 "Đã xong", bài 4 "Đang mở", bài 5 và bài 6 "Đã khóa"
- **AND** màn Cài đặt hiện mục tiêu 15 phút mỗi ngày

#### Scenario: S8.5-AC3 Ghi đè xóa số phút học mà file không có
- **WHEN** hôm nay máy đã học 20 phút; người học nhập file có mục tiêu 15 phút và không có phút học nào của hôm nay rồi bấm "Ghi đè"
- **THEN** Trang chủ hiện "Hôm nay: 0 / 15 phút"

#### Scenario: S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ
- **WHEN** máy có bài 1 "Đã xong", người học bấm "Ghi đè" với file hợp lệ có 5 bài đã xong, nhưng việc ghi bị lỗi giữa chừng
- **THEN** màn báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên."
- **AND** màn Lộ trình vẫn hiện chỉ bài 1 "Đã xong" và mục tiêu phút trong Cài đặt không đổi

### Requirement: Sao lưu rồi nhập lại không mất thẻ ôn tập và chữ đã viết
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1 (không thuộc văn bản AC1, AC2 của story): file sao lưu (S8.5) phải
chứa thẻ và chữ đã viết; export rồi import không mất thẻ.

Sau khi người học xuất file rồi nhập file đó và bấm "Ghi đè", hệ thống SHALL có lại đúng các thẻ ôn tập trong file (cùng từ, chiều, trạng
thái, ngày ôn tiếp theo) và đúng các chữ đã viết xong trên khung có gợi ý.

#### Scenario: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ
- **WHEN** ở máy A người học có thẻ "你好" chiều nghĩa đã ôn một lần (có trạng thái và ngày ôn tiếp theo khác thẻ mới) và thẻ "你好" chiều
  nghe ở trạng thái "mới", rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng, chưa có thẻ nào) người học nhập file đó và bấm "Ghi đè"
- **THEN** danh sách thẻ ôn tập của máy B có đúng hai thẻ: "你好" chiều nghĩa với trạng thái và ngày ôn tiếp theo như ở máy A, và "你好"
  chiều nghe ở trạng thái "mới"

#### Scenario: S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết
- **WHEN** ở máy A người học có thẻ "人" chiều viết và đã viết xong chữ "你" (chưa viết chữ "好") trên khung có gợi ý, rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng) người học nhập file đó, bấm "Ghi đè", xong một bài học có từ "你好", rồi luyện viết xong chữ "好"
- **THEN** danh sách thẻ ôn tập của máy B có thẻ "人" chiều viết
- **AND** có thẻ "你好" chiều viết (chữ "你" đã viết ở máy A vẫn được tính)

### Requirement: Nhập ghi đè toàn bộ thẻ ôn tập và chữ đã viết
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1. Nhập MUST ghi đè toàn bộ như S8.5, tất cả hoặc không gì: thẻ và chữ đã
viết trên máy mà file không có SHALL không còn sau khi nhập; "Hủy", file lỗi hoặc ghi lỗi giữa chừng thì thẻ trên máy không đổi.

#### Scenario: S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học nhập file chỉ có thẻ "你好" chiều nghĩa và chiều nghe rồi bấm "Ghi đè"
- **THEN** danh sách thẻ ôn tập chỉ có thẻ "你好" chiều nghĩa và chiều nghe, không còn thẻ "谢谢"

#### Scenario: S9.1-AC1 (bổ sung) Hủy nhập thì thẻ không đổi
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file hợp lệ chỉ có thẻ "你好" rồi bấm "Hủy"
- **THEN** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC1 (bổ sung) Ghi lỗi giữa chừng thì giữ nguyên thẻ
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học bấm "Ghi đè" với file hợp lệ có thẻ "你好", nhưng việc ghi bị lỗi giữa chừng
- **THEN** màn báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên."
- **AND** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file
- **WHEN** người học chọn file tiến độ đúng định dạng app nhưng một thẻ trong file có chiều không phải nghĩa, nghe hay viết
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ, thẻ ôn tập trên máy không đổi

### Requirement: File sao lưu xuất trước khi có thẻ vẫn nhập được
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1. Hệ thống SHALL nhận file sao lưu do bản app trước S9.1 xuất (không có
thẻ ôn tập và chữ đã viết) như file hợp lệ: hiện hộp xác nhận như S8.5; bấm "Ghi đè" thì tiến độ đúng bằng file, và vì ghi đè toàn bộ nên
máy không còn thẻ ôn tập và chữ đã viết nào.

#### Scenario: S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file tiến độ do bản app trước S9.1 xuất, có bài 1 "Đã xong", rồi
  bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ." và màn Lộ trình hiện bài 1 "Đã xong"
- **AND** danh sách thẻ ôn tập rỗng

### Requirement: File có thẻ hoặc chữ đã viết trùng bị từ chối
Yêu cầu bổ sung cho S9.1, như S8.5 từ chối bài trùng. File đúng định dạng app có hai thẻ cùng từ và cùng chiều, hoặc một chữ đã viết
xuất hiện hai lần, SHALL bị từ chối cả file với thông báo "File tiến độ bị hỏng, không nhập được."; tiến độ và thẻ trên máy MUST NOT đổi.

#### Scenario: S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file tiến độ đúng định dạng app có hai thẻ "你好" chiều nghĩa
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được."
- **AND** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file
- **WHEN** người học chọn file tiến độ đúng định dạng app có chữ "你" đã viết xuất hiện hai lần
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ, thẻ ôn tập trên máy không đổi

### Requirement: Thẻ và chữ đã viết của từ không có trong app vẫn nhập được
Yêu cầu bổ sung cho S9.1, như S8.5 nhận bài không có trong app. Thẻ của từ không có trong nội dung app, và chữ đã viết không có trong
nội dung app hoặc không có dữ liệu nét, SHALL được nhận và giữ như trong file; chúng MUST NOT làm đổi hay tạo thêm thẻ nào khác.

#### Scenario: S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được
- **WHEN** người học chọn file có thẻ "你好" chiều nghĩa và một thẻ chiều nghĩa của một từ không có trong nội dung app, rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập có đúng hai thẻ đó, như trong file

#### Scenario: S9.1-AC2 (bổ sung) Chữ đã viết không có trong app không tạo thẻ
- **WHEN** người học chọn file có bài học chứa từ "你好" "Đã xong", thẻ "你好" chiều nghĩa và chiều nghe, chữ đã viết gồm "你" và một chữ không
  có trong nội dung app (không có "好"), rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập không có thẻ "你好" chiều viết

#### Scenario: S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ
- **WHEN** người học chọn file có bài học chứa một từ "Đã xong", thẻ chiều nghĩa và chiều nghe của từ đó, và chữ đã viết gồm mọi chữ của từ,
  trong đó có một chữ không có dữ liệu nét, rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập có đúng thẻ chiều nghĩa và chiều nghe của từ đó như trong file, không có thẻ chiều viết của từ đó
