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
- **WHEN** người học đã xong onboarding và mở route `/learning-paths`
- **THEN** màn hiện giai đoạn "Nhập môn" và tiêu đề bài đầu tiên của giai đoạn đó

### Requirement: Mỗi bài có một trong ba trạng thái: khóa / đang mở / đã xong
Hệ thống SHALL gán cho mỗi bài trên bản đồ đúng một trạng thái trong ba trạng thái khóa, đang mở,
đã xong, theo quy tắc mở khóa Nhập môn (F5): bài đầu tiên của lộ trình luôn được mở; một bài được mở
khi bài liền trước nó trong lộ trình đã xong; bài có tiến độ đã xong là đã xong; các bài còn lại bị khóa.
Trạng thái MUST được hiện bằng chữ, không chỉ bằng màu.

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
- **WHEN** dữ liệu tiến độ đã lưu của một bài không hợp lệ
- **THEN** bài đó được coi là chưa xong và bản đồ vẫn hiện bình thường

### Requirement: Bấm vào bài khóa thì không vào được
Hệ thống SHALL không chuyển người học sang màn bài khi họ bấm vào một bài đang khóa trên bản đồ.
Bài đang mở hoặc đã xong MUST dẫn tới màn của bài đó.

#### Scenario: S3.1-AC3 Bấm bài khóa
- **WHEN** người học bấm vào một bài ở trạng thái khóa
- **THEN** người học vẫn ở màn bản đồ lộ trình và không vào màn bài

#### Scenario: S3.1-AC3 Bấm bài đang mở
- **WHEN** người học bấm vào một bài ở trạng thái đang mở
- **THEN** app chuyển tới route `/lessons/<id bài>`
