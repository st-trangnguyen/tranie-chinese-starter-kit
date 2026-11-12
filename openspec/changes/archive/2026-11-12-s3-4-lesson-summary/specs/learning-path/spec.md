## ADDED Requirements

### Requirement: Xong một bài thì bài kế tiếp mở
Hệ thống SHALL ghi nhận bài học thường là "Đã xong" khi người học làm hết các câu mà không bỏ qua câu nào, và
mở bài kế tiếp theo quy tắc Nhập môn: học xong bài trước thì mở bài sau, không đòi điểm tối thiểu. Bài kiểm tra
cuối chủ đề có quy tắc riêng (S3.5).

| Tình huống | Bài vừa học | Bài kế tiếp |
|---|---|---|
| Làm hết các câu, không bỏ qua câu nào | "Đã xong" | "Đang mở" |
| Còn câu bỏ qua, hoặc thoát giữa chừng | Giữ nguyên | Giữ nguyên |

#### Scenario: S3.4-AC2 Xong bài thì bài kế tiếp mở
- **WHEN** người học làm hết các câu của bài thứ nhất, không bỏ qua câu nào
- **THEN** trên bản đồ bài thứ nhất là "Đã xong" và bài thứ hai là "Đang mở"

#### Scenario: S3.4-AC2 Điểm thấp vẫn xong bài
- **WHEN** người học trả lời sai cả 5 câu của bài thứ nhất rồi làm hết bài
- **THEN** trên bản đồ bài thứ nhất vẫn là "Đã xong" và bài thứ hai là "Đang mở"

#### Scenario: S3.4-AC2 Bài cuối của nhóm mở bài đầu nhóm kế
- **WHEN** người học làm hết bài cuối cùng của một nhóm
- **THEN** trên bản đồ bài đầu tiên của nhóm kế tiếp là "Đang mở"

#### Scenario: S3.4-AC2 Còn câu bỏ qua thì bài chưa xong
- **WHEN** người học làm hết bài nhưng đã bỏ qua 1 câu vì dạng bài chưa có
- **THEN** trên bản đồ bài đó không phải "Đã xong" và bài kế tiếp vẫn "Đã khóa"

#### Scenario: S3.4-AC2 Thoát giữa chừng thì bài chưa xong
- **WHEN** người học thoát khỏi bài khi chưa làm hết các câu
- **THEN** trên bản đồ bài đó không phải "Đã xong" và bài kế tiếp vẫn "Đã khóa"

#### Scenario: S3.4-AC2 Làm lại bài đã xong không hạ trạng thái
- **WHEN** người học làm lại một bài đã "Đã xong" và trả lời sai nhiều hơn lần trước
- **THEN** trên bản đồ bài đó vẫn là "Đã xong" và các bài đã mở nhờ nó vẫn mở

#### Scenario: S3.4-AC2 Xong bài rồi mở lại thì bắt đầu câu 1
- **WHEN** người học đã xong một bài rồi mở lại bài đó
- **THEN** màn hiện câu thứ nhất
