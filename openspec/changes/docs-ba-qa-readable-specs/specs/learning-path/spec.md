## RENAMED Requirements

- FROM: `### Requirement: Mỗi bài có một trong ba trạng thái: khóa / đang mở / đã xong`
- TO: `### Requirement: Mỗi bài có đúng một trạng thái`

## MODIFIED Requirements

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
