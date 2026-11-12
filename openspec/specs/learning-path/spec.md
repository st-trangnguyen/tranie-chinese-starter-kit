# learning-path Specification

## Purpose

Bản đồ lộ trình cho người học thấy toàn bộ giai đoạn và bài theo thứ tự, trạng thái của từng bài
(khóa / đang mở / đã xong) và cho vào những bài đã được mở.

## Requirements

### Requirement: Hiện các giai đoạn và bài theo thứ tự
Hệ thống SHALL hiện trên bản đồ lộ trình mọi giai đoạn, nhóm và bài theo đúng thứ tự khai báo
trong nội dung lộ trình, mỗi bài kèm tiêu đề của bài.

#### Scenario: S3.1-AC1 Bản đồ giữ đúng thứ tự giai đoạn, nhóm và bài
- **WHEN** nội dung lộ trình có hai giai đoạn, mỗi giai đoạn có các nhóm và bài theo một thứ tự xác định
- **THEN** bản đồ hiện tiêu đề các giai đoạn, nhóm và bài theo đúng thứ tự đó

#### Scenario: S3.1-AC1 Mở bản đồ lộ trình trong app thật
- **WHEN** người học đã xong onboarding và mở màn Lộ trình
- **THEN** màn hiện giai đoạn "Nhập môn" và tiêu đề bài đầu tiên của giai đoạn đó

### Requirement: Mỗi bài có đúng một trạng thái
Hệ thống SHALL hiện cho mỗi bài trên bản đồ đúng một trong ba trạng thái, bằng chữ chứ không chỉ
bằng màu:

| Trạng thái | Nhãn hiện ra | Khi nào |
|---|---|---|
| Đã xong | "Đã xong" | Người học đã hoàn thành bài |
| Đang mở | "Đang mở" | Bài đầu tiên của lộ trình, hoặc bài ngay sau một bài đã xong |
| Khóa | "Đã khóa" | Các bài còn lại |

#### Scenario: S3.1-AC2 Chưa học bài nào
- **WHEN** người học chưa xong bài nào
- **THEN** bài đầu tiên của lộ trình ở trạng thái đang mở và mọi bài còn lại ở trạng thái khóa

#### Scenario: S3.1-AC2 Xong bài trước thì bài kế tiếp mở
- **WHEN** người học đã xong bài thứ nhất và bài thứ hai, chưa xong bài thứ ba
- **THEN** bài thứ nhất và thứ hai ở trạng thái đã xong, bài thứ ba đang mở, các bài sau đó khóa

#### Scenario: S3.1-AC2 Bài kế tiếp nằm ở nhóm hoặc giai đoạn sau
- **WHEN** người học đã xong bài cuối cùng của một nhóm
- **THEN** bài đầu tiên của nhóm (hoặc giai đoạn) kế tiếp ở trạng thái đang mở

#### Scenario: S3.1-AC2 Bản đồ hiện nhãn trạng thái của từng bài
- **WHEN** bản đồ hiện một bài đã xong, một bài đang mở và một bài khóa
- **THEN** mỗi bài có nhãn chữ tương ứng "Đã xong", "Đang mở", "Đã khóa"

#### Scenario: S3.1-AC2 Tiến độ lưu bị hỏng không làm sai trạng thái
- **WHEN** kết quả học đã lưu của một bài không đọc được
- **THEN** bài đó được coi là chưa xong và bản đồ vẫn hiện bình thường

### Requirement: Bấm vào bài khóa thì không vào được
Hệ thống SHALL không chuyển người học sang màn bài khi họ bấm vào một bài đang khóa trên bản đồ.
Bài đang mở hoặc đã xong MUST dẫn tới màn của bài đó.

#### Scenario: S3.1-AC3 Bấm bài khóa
- **WHEN** người học bấm vào một bài ở trạng thái khóa
- **THEN** người học vẫn ở màn bản đồ lộ trình và không vào màn bài

#### Scenario: S3.1-AC3 Bấm bài đang mở
- **WHEN** người học bấm vào một bài ở trạng thái đang mở
- **THEN** người học vào màn học của bài đó

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

#### Scenario: S3.6-AC2 Còn câu bỏ qua thì chưa đạt
- **WHEN** người học làm hết bài kiểm tra vượt cấp nhưng còn 1 câu bỏ qua vì dạng bài chưa có
- **THEN** trên bản đồ mọi bài của chủ đề đó vẫn "Đã khóa"
