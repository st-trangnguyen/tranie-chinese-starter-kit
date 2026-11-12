# lesson-runner Specification

## Purpose
Chạy một bài học: người học làm lần lượt từng câu, mỗi câu được chấm ngay, câu sai có giải thích.

## Requirements

### Requirement: Các câu hiện lần lượt, có thanh tiến độ
Hệ thống SHALL hiện các câu của bài lần lượt, mỗi lúc một câu, kèm thanh tiến độ cho biết đang ở câu
thứ mấy trong tổng số câu.

#### Scenario: S3.2-AC1 Bài mở ra ở câu đầu tiên
- **WHEN** người học mở một bài có 3 câu
- **THEN** màn hiện câu thứ nhất, không hiện câu thứ hai và thứ ba
- **AND** thanh tiến độ cho biết "Câu 1 / 3"

#### Scenario: S3.2-AC1 Sang câu kế thì thanh tiến độ tăng
- **WHEN** người học làm xong câu thứ nhất và bấm "Tiếp tục"
- **THEN** màn hiện câu thứ hai
- **AND** thanh tiến độ cho biết "Câu 2 / 3"

#### Scenario: S3.2-AC1 Làm xong câu cuối
- **WHEN** người học làm xong câu cuối cùng và bấm "Tiếp tục"
- **THEN** màn báo đã làm xong các câu của bài
- **AND** không còn hiện câu nào

#### Scenario: S3.2-AC1 Sang câu kế thì focus chuyển về đầu câu mới
- **WHEN** người học bấm "Tiếp tục" để sang câu kế
- **THEN** focus bàn phím nằm ở dòng "Câu k / n" của câu mới
- **AND** khi làm xong câu cuối, focus nằm ở thông báo đã làm xong

#### Scenario: S3.2-AC1 Đổi sang bài khác thì không còn câu của bài trước
- **WHEN** người học đang ở một bài rồi chuyển sang bài khác
- **THEN** màn không hiện tiêu đề hay câu của bài trước trong lúc bài mới đang mở
- **AND** nếu bài mới không mở được thì chỉ hiện thông báo lỗi, nếu mở được thì không còn thông báo lỗi của bài trước

#### Scenario: S3.2-AC1 Không mở được bài
- **WHEN** người học mở một bài mà nội dung không đọc được hoặc không tồn tại
- **THEN** màn hiện thông báo không mở được bài
- **AND** không hiện câu nào

### Requirement: Mỗi câu chấm ngay sau khi trả lời
Hệ thống SHALL báo đúng hay sai ngay sau khi người học trả lời một câu, trước khi cho sang câu kế.

| Kết quả | Màn hiện | Cho sang câu kế khi nào |
|---|---|---|
| Đúng | Thông báo "Đúng" | Người học bấm "Tiếp tục" |
| Sai | Thông báo "Sai" kèm giải thích (xem yêu cầu kế tiếp) | Người học bấm "Tiếp tục" |

#### Scenario: S3.2-AC2 Trả lời đúng được báo ngay
- **WHEN** người học trả lời đúng một câu
- **THEN** màn hiện ngay "Đúng" và nút "Tiếp tục"
- **AND** chưa chuyển sang câu kế

#### Scenario: S3.2-AC2 Trả lời sai được báo ngay
- **WHEN** người học trả lời sai một câu
- **THEN** màn hiện ngay "Sai" và nút "Tiếp tục"
- **AND** chưa chuyển sang câu kế

#### Scenario: S3.2-AC2 Trả lời xong thì không trả lời lại được
- **WHEN** câu đã được chấm và đang hiện kết quả
- **THEN** các đáp án của câu bị khóa, bấm thêm không đổi kết quả
- **AND** sang câu kế thì đáp án được mở lại

#### Scenario: S3.2-AC2 Chưa trả lời thì chưa có kết quả
- **WHEN** câu vừa hiện và người học chưa trả lời
- **THEN** màn không hiện "Đúng", "Sai" hay nút "Tiếp tục"

### Requirement: Trả lời sai thì hiện giải thích trước khi sang câu sau
Hệ thống SHALL hiện giải thích khi người học trả lời sai, và chỉ sang câu kế sau khi người học đã
xem giải thích và bấm "Tiếp tục".

#### Scenario: S3.2-AC3 Trả lời sai hiện giải thích
- **WHEN** người học trả lời sai một câu và câu đó có giải thích
- **THEN** màn hiện nội dung giải thích cùng với "Sai"

#### Scenario: S3.2-AC3 Chưa bấm Tiếp tục thì chưa sang câu sau
- **WHEN** người học đã trả lời sai và đang xem giải thích
- **THEN** màn vẫn ở câu hiện tại cho tới khi người học bấm "Tiếp tục"

#### Scenario: S3.2-AC3 Trả lời đúng thì không có giải thích
- **WHEN** người học trả lời đúng một câu
- **THEN** màn không hiện giải thích

### Requirement: Câu có dạng bài chưa có thì được bỏ qua (biện pháp tạm)
Hệ thống SHALL cho người học bỏ qua câu có dạng bài chưa được hỗ trợ để không kẹt giữa bài, và
SHALL NOT báo "đã làm xong" khi có câu bị bỏ qua. Biện pháp này không thuộc AC của story S3.2; gỡ khi
E4–E6 đăng ký đủ các dạng bài.

#### Scenario: S3.2-X1 Bỏ qua câu thì không báo là đã làm xong
- **WHEN** người học bỏ qua 3 câu trong bài có 3 câu vì dạng bài chưa có
- **THEN** màn báo đã bỏ qua 3 câu và bài chưa hoàn thành
- **AND** màn không báo đã làm xong các câu của bài

#### Scenario: S3.2-X1 Bỏ qua một câu giữa bài
- **WHEN** người học làm câu 1, bỏ qua câu 2 (dạng bài chưa có) rồi làm câu 3
- **THEN** sau câu 2 màn hiện câu 3 với "Câu 3 / 3"
- **AND** cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành

### Requirement: Thoát giữa bài thì vị trí câu hiện tại được lưu
Hệ thống SHALL ghi nhớ câu người học đang làm trong một bài, để khi người học thoát giữa chừng thì
tiến độ không bị mất. Mỗi bài có vị trí riêng.

#### Scenario: S3.3-AC1 Thoát sau khi sang câu kế
- **WHEN** người học làm xong câu 1, bấm "Tiếp tục" sang câu 2 của một bài rồi thoát khỏi bài
- **THEN** app ghi nhớ rằng người học đang ở câu 2 của bài đó

#### Scenario: S3.3-AC1 Bỏ qua câu cũng cập nhật vị trí
- **WHEN** người học bỏ qua câu 1 (dạng bài chưa có) để sang câu 2 rồi thoát khỏi bài
- **THEN** app ghi nhớ rằng người học đang ở câu 2 của bài đó

#### Scenario: S3.3-AC1 Thoát khi đang xem kết quả câu
- **WHEN** người học trả lời câu 2 rồi thoát khi chưa bấm "Tiếp tục"
- **THEN** app vẫn ghi nhớ vị trí là câu 2, câu 2 chưa được tính là đã xong

#### Scenario: S3.3-AC1 Mỗi bài có vị trí riêng
- **WHEN** người học đang ở câu 3 của bài A rồi mở bài B và sang câu 2 của bài B
- **THEN** vị trí đã lưu của bài A vẫn là câu 3 và của bài B là câu 2

#### Scenario: S3.3-AC1 Không lưu được thì vẫn học tiếp
- **WHEN** app không ghi được vị trí khi người học sang câu kế
- **THEN** màn vẫn hiện câu kế bình thường
- **AND** màn không hiện thông báo lỗi

### Requirement: Mở lại bài thì học tiếp từ câu đó
Hệ thống SHALL mở bài đang dở ở đúng câu đã được ghi nhớ thay vì câu 1. Bài chưa học bao giờ, hoặc có
vị trí đã ghi nhớ không dùng được, MUST bắt đầu ở câu 1.

| Tình huống khi mở bài | Màn hiện |
|---|---|
| Có vị trí đã ghi nhớ và vị trí đó còn nằm trong số câu của bài | Câu ở vị trí đó |
| Chưa từng học bài này | Câu 1 |
| Vị trí đã ghi nhớ không đọc được | Câu 1 |
| Vị trí đã ghi nhớ lớn hơn số câu hiện có của bài (bài bị rút bớt câu) | Câu 1 |

#### Scenario: S3.3-AC2 Mở lại bài đang dở
- **WHEN** người học mở lại một bài có 5 câu mà vị trí đã ghi nhớ là câu 3
- **THEN** màn hiện câu thứ ba
- **AND** thanh tiến độ cho biết "Câu 3 / 5"

#### Scenario: S3.3-AC2 Câu đang dở làm lại từ đầu câu
- **WHEN** người học đã trả lời câu 3 nhưng thoát trước khi bấm "Tiếp tục", rồi mở lại bài
- **THEN** màn hiện câu 3 ở trạng thái chưa trả lời
- **AND** màn không hiện "Đúng" hay "Sai"

#### Scenario: S3.3-AC2 Bài chưa học bao giờ bắt đầu ở câu 1
- **WHEN** người học mở một bài chưa có vị trí đã ghi nhớ
- **THEN** màn hiện câu thứ nhất và thanh tiến độ cho biết "Câu 1 / n"

#### Scenario: S3.3-AC2 Vị trí đã ghi nhớ không đọc được thì về câu 1
- **WHEN** vị trí đã ghi nhớ của bài không đọc được và người học mở bài
- **THEN** màn hiện câu thứ nhất
- **AND** màn không hiện thông báo lỗi

#### Scenario: S3.3-AC2 Bài bị rút bớt câu thì về câu 1
- **WHEN** vị trí đã ghi nhớ là câu 6 nhưng bài hiện chỉ còn 5 câu
- **THEN** màn hiện câu thứ nhất

### Requirement: Làm hết các câu thì không giữ vị trí cũ (biện pháp tạm)
Hệ thống SHALL xoá vị trí đã ghi nhớ của bài khi người học làm xong câu cuối, để mở lại bài không kẹt ở
câu cuối. Biện pháp này không thuộc AC của story S3.3; S3.4 sẽ thay bằng việc ghi nhận bài đã xong.

#### Scenario: S3.3-X1 Làm xong câu cuối rồi mở lại bài
- **WHEN** người học làm xong câu cuối cùng của một bài rồi mở lại bài đó
- **THEN** màn hiện câu thứ nhất

### Requirement: Ghi nhớ vị trí không làm bài đã xong bị khóa lại
Hệ thống MUST giữ nguyên trạng thái "Đã xong" của một bài khi người học mở lại bài đó và làm dở, để
các bài đã mở nhờ bài này không bị khóa lại.

#### Scenario: S3.3-X2 Làm lại bài đã xong rồi thoát giữa chừng
- **WHEN** người học đã xong bài thứ nhất, mở lại bài đó, sang câu 2 rồi thoát
- **THEN** trên bản đồ bài thứ nhất vẫn là "Đã xong" và bài thứ hai vẫn "Đang mở"

### Requirement: Màn tổng kết hiện điểm, thời gian, số câu sai
Hệ thống SHALL hiện màn tổng kết khi người học làm hết các câu của bài, gồm điểm, thời gian làm và số câu
sai, dưới thông báo đã làm xong (hoặc đã bỏ qua câu) của bài.

| Thông tin | Cách hiện | Cách tính |
|---|---|---|
| Điểm | "80%" kèm "Đúng 4 / 5 câu" | Câu đúng chia câu đã trả lời, bỏ qua không tính |
| Thời gian | "2:05" | Từ lúc câu đầu hiện tới lúc xong câu cuối |
| Số câu sai | "Sai 1 câu" | Số câu trả lời sai |

#### Scenario: S3.4-AC1 Tổng kết sau câu cuối
- **WHEN** người học làm xong câu cuối của bài 5 câu, trả lời đúng 4 câu và sai 1 câu
- **THEN** màn hiện thông báo đã làm xong các câu của bài
- **AND** màn hiện điểm "80%", "Đúng 4 / 5 câu" và "Sai 1 câu"

#### Scenario: S3.4-AC1 Làm đúng hết
- **WHEN** người học trả lời đúng cả 5 câu của bài
- **THEN** màn hiện điểm "100%" và "Sai 0 câu"

#### Scenario: S3.4-AC1 Làm sai hết
- **WHEN** người học trả lời sai cả 5 câu của bài
- **THEN** màn hiện điểm "0%" và "Sai 5 câu"

#### Scenario: S3.4-AC1 Điểm làm tròn thành số nguyên
- **WHEN** người học trả lời đúng 2 trong 3 câu
- **THEN** màn hiện điểm "67%"

#### Scenario: S3.4-AC1 Thời gian hiện theo phút và giây
- **WHEN** người học làm hết bài trong 125 giây kể từ lúc câu đầu hiện
- **THEN** màn hiện thời gian "2:05"

#### Scenario: S3.4-AC1 Thời gian dưới một phút
- **WHEN** người học làm hết bài trong 9 giây
- **THEN** màn hiện thời gian "0:09"

#### Scenario: S3.4-AC1 Có câu bỏ qua
- **WHEN** người học làm bài 3 câu, bỏ qua 1 câu vì dạng bài chưa có, trả lời đúng 2 câu còn lại
- **THEN** màn hiện thông báo đã bỏ qua 1 câu và bài chưa hoàn thành
- **AND** màn hiện điểm "100%" tính trên 2 câu đã trả lời và "Sai 0 câu"

#### Scenario: S3.4-AC1 Làm tiếp từ câu đang dở
- **WHEN** người học mở lại bài 5 câu ở câu 3, trả lời 3 câu còn lại: đúng 2 câu và sai 1 câu
- **THEN** màn tổng kết hiện điểm "67%", "Đúng 2 / 3 câu" và "Sai 1 câu"
- **AND** thời gian tính từ lúc câu 3 hiện

#### Scenario: S3.4-AC1 Chưa hết bài thì chưa có tổng kết
- **WHEN** người học đang ở giữa bài
- **THEN** màn không hiện điểm, thời gian hay số câu sai

### Requirement: Không lưu được kết quả thì báo trên màn tổng kết
Hệ thống SHALL hiện thông báo chưa lưu được kết quả bài trên màn tổng kết khi app không ghi được tiến độ, và
MUST vẫn hiện đầy đủ điểm, thời gian, số câu sai.

#### Scenario: S3.4-AC1 Ghi tiến độ lỗi
- **WHEN** người học làm xong bài nhưng app không ghi được kết quả
- **THEN** màn tổng kết vẫn hiện điểm, thời gian và số câu sai
- **AND** màn hiện thông báo "Chưa lưu được kết quả bài này"
