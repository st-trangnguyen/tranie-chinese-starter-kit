## ADDED Requirements

### Requirement: Đạt từ 80% trở lên thì mở chủ đề tiếp theo
Hệ thống SHALL chỉ ghi nhận bài kiểm tra cuối chủ đề là "Đã xong" khi điểm từ 80% trở lên, và khi đó mở chủ đề
tiếp theo. Bài kiểm tra chưa đạt MUST giữ nguyên trạng thái. Bài học thường trong chủ đề không cần điểm tối thiểu.

| Điểm bài kiểm tra | Bài kiểm tra | Chủ đề tiếp theo |
|---|---|---|
| Từ 80% trở lên | "Đã xong" | Bài đầu tiên "Đang mở" |
| Dưới 80%, hoặc còn câu bỏ qua | Giữ nguyên | "Đã khóa" |

#### Scenario: S3.5-AC1 Đạt đúng 80%
- **WHEN** người học trả lời đúng 4 trong 5 câu của bài kiểm tra cuối chủ đề
- **THEN** trên bản đồ bài kiểm tra là "Đã xong" và bài đầu tiên của chủ đề tiếp theo là "Đang mở"

#### Scenario: S3.5-AC1 Đạt trên 80%
- **WHEN** người học trả lời đúng cả 5 câu của bài kiểm tra
- **THEN** trên bản đồ chủ đề tiếp theo mở

#### Scenario: S3.5-AC1 Chưa đạt thì chủ đề tiếp theo vẫn khóa
- **WHEN** người học trả lời đúng 23 trong 30 câu của bài kiểm tra
- **THEN** trên bản đồ bài kiểm tra không phải "Đã xong" và chủ đề tiếp theo vẫn "Đã khóa"

#### Scenario: S3.5-AC1 Điểm gần ngưỡng nhưng chưa tới
- **WHEN** người học trả lời đúng 39 trong 49 câu của bài kiểm tra
- **THEN** bài kiểm tra chưa đạt và chủ đề tiếp theo vẫn "Đã khóa"

#### Scenario: S3.5-AC1 Còn câu bỏ qua thì chưa đạt
- **WHEN** người học làm hết bài kiểm tra nhưng đã bỏ qua 1 câu vì dạng bài chưa có
- **THEN** trên bản đồ bài kiểm tra không phải "Đã xong" và chủ đề tiếp theo vẫn "Đã khóa"

#### Scenario: S3.5-AC1 Bài học thường không cần điểm tối thiểu
- **WHEN** người học trả lời sai cả 5 câu của một bài học thường trong chủ đề rồi làm hết bài
- **THEN** trên bản đồ bài đó là "Đã xong" và bài kế tiếp trong chủ đề là "Đang mở"

#### Scenario: S3.5-AC1 Đã đạt rồi làm lại điểm thấp hơn
- **WHEN** người học đã đạt bài kiểm tra, làm lại và chỉ đúng 2 trong 5 câu
- **THEN** trên bản đồ bài kiểm tra vẫn "Đã xong" và chủ đề tiếp theo vẫn mở
