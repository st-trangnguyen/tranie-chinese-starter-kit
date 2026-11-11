## ADDED Requirements

### Requirement: Chủ đề chưa mở có nút "Kiểm tra vượt cấp"
Hệ thống SHALL hiện nút "Kiểm tra vượt cấp" trên mỗi chủ đề chưa mở mà có bài kiểm tra, và MUST dẫn tới bài kiểm
tra của chủ đề đó. Chủ đề đã mở, đã xong, hoặc không có bài kiểm tra MUST NOT có nút.

| Chủ đề | Nút "Kiểm tra vượt cấp" |
|---|---|
| Chưa mở (mọi bài khóa), có bài kiểm tra | Có |
| Đã mở hoặc đã xong | Không |
| Không có bài kiểm tra | Không |

#### Scenario: S3.6-AC1 Chủ đề chưa mở có nút
- **WHEN** người học xem bản đồ có một chủ đề mà mọi bài đang khóa và chủ đề đó có bài kiểm tra
- **THEN** chủ đề đó hiện nút "Kiểm tra vượt cấp"

#### Scenario: S3.6-AC1 Chủ đề đang mở không có nút
- **WHEN** người học xem bản đồ có một chủ đề đang có bài "Đang mở"
- **THEN** chủ đề đó không hiện nút "Kiểm tra vượt cấp"

#### Scenario: S3.6-AC1 Chủ đề đã xong không có nút
- **WHEN** người học xem bản đồ có một chủ đề mà mọi bài đã xong
- **THEN** chủ đề đó không hiện nút "Kiểm tra vượt cấp"

#### Scenario: S3.6-AC1 Chủ đề không có bài kiểm tra không có nút
- **WHEN** người học xem bản đồ có một chủ đề chưa mở nhưng không có bài kiểm tra (như các chủ đề của Nhập môn)
- **THEN** chủ đề đó không hiện nút "Kiểm tra vượt cấp"

#### Scenario: S3.6-AC1 Bấm nút vào bài kiểm tra của chủ đề
- **WHEN** người học bấm "Kiểm tra vượt cấp" của một chủ đề chưa mở
- **THEN** người học vào màn làm bài kiểm tra của chủ đề đó, bắt đầu từ câu 1

#### Scenario: S3.6-AC1 Bài khóa trong chủ đề vẫn không vào được
- **WHEN** người học bấm vào một bài khóa của chủ đề chưa mở
- **THEN** người học vẫn ở màn bản đồ và không vào màn bài

### Requirement: Đạt từ 80% trở lên thì chủ đề được đánh dấu xong và chủ đề tiếp theo mở
Hệ thống SHALL đánh dấu mọi bài của chủ đề là "Đã xong" khi người học đạt từ 80% trở lên ở bài kiểm tra vượt cấp, và
mở chủ đề tiếp theo. Chưa đạt thì chủ đề MUST giữ nguyên khóa và người học làm lại được.

#### Scenario: S3.6-AC2 Đạt thì chủ đề xong và chủ đề kế mở
- **WHEN** người học đạt 80% bài kiểm tra vượt cấp của một chủ đề chưa mở
- **THEN** trên bản đồ mọi bài của chủ đề đó là "Đã xong"
- **AND** bài đầu tiên của chủ đề tiếp theo là "Đang mở"

#### Scenario: S3.6-AC2 Chưa đạt thì chủ đề giữ nguyên khóa
- **WHEN** người học đúng 3 trong 5 câu của bài kiểm tra vượt cấp
- **THEN** trên bản đồ mọi bài của chủ đề đó vẫn "Đã khóa" và chủ đề tiếp theo không đổi

#### Scenario: S3.6-AC2 Chưa đạt thì làm lại được
- **WHEN** người học chưa đạt bài kiểm tra vượt cấp
- **THEN** màn tổng kết hiện "Chưa đạt, cần từ 80%" và nút "Làm lại"

#### Scenario: S3.6-AC2 Vượt chủ đề ở xa không mở các chủ đề ở giữa
- **WHEN** người học đang ở chủ đề thứ 3, đạt bài kiểm tra vượt cấp của chủ đề thứ 5
- **THEN** chủ đề thứ 4 vẫn "Đã khóa", chủ đề thứ 5 "Đã xong" và bài đầu của chủ đề thứ 6 "Đang mở"

#### Scenario: S3.6-AC2 Không có điểm thì bài không bị đánh dấu xong
- **WHEN** người học làm hết bài kiểm tra vượt cấp nhưng còn 1 câu bỏ qua vì dạng bài chưa có
- **THEN** trên bản đồ mọi bài của chủ đề đó vẫn "Đã khóa"
