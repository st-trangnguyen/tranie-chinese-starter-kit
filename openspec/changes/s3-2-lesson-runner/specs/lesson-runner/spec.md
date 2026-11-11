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

#### Scenario: S3.2-AC1 Bỏ qua câu thì không báo là đã làm xong
- **WHEN** người học bỏ qua 3 câu trong bài có 3 câu vì dạng bài chưa có
- **THEN** màn báo đã bỏ qua 3 câu và bài chưa hoàn thành
- **AND** màn không báo đã làm xong các câu của bài

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
