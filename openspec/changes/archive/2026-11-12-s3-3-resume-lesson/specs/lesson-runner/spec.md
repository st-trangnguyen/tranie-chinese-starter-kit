## ADDED Requirements

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
