# Spec Delta

## Purpose

Chạy một bài học: người học làm lần lượt từng câu, mỗi câu được chấm ngay, câu sai có giải thích.

## ADDED Requirements

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
