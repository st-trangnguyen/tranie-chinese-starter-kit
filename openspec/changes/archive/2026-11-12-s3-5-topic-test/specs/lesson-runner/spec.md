## ADDED Requirements

### Requirement: Không đạt thì làm lại được
Hệ thống SHALL cho biết bài kiểm tra cuối chủ đề đạt hay chưa đạt trên màn tổng kết, và khi chưa đạt SHALL cho
người học làm lại bài kiểm tra từ câu 1, không giới hạn số lần.

#### Scenario: S3.5-AC2 Chưa đạt thì hiện nút làm lại
- **WHEN** người học làm hết bài kiểm tra và chưa đạt 80%
- **THEN** màn tổng kết hiện "Chưa đạt, cần từ 80%" và nút "Làm lại"

#### Scenario: S3.5-AC2 Đạt thì báo đạt và không hiện nút làm lại
- **WHEN** người học làm hết bài kiểm tra và đạt từ 80% trở lên
- **THEN** màn tổng kết hiện "Bạn đã đạt"
- **AND** màn không hiện nút "Làm lại"

#### Scenario: S3.5-AC2 Bấm làm lại thì bắt đầu từ câu 1
- **WHEN** người học bấm "Làm lại" trên màn tổng kết bài kiểm tra 5 câu
- **THEN** màn hiện câu thứ nhất và thanh tiến độ cho biết "Câu 1 / 5"
- **AND** điểm, thời gian và số câu sai của lần làm lại tính từ đầu, không cộng dồn lần trước

#### Scenario: S3.5-AC2 Làm lại nhiều lần
- **WHEN** người học làm lại bài kiểm tra lần thứ hai mà vẫn chưa đạt
- **THEN** màn tổng kết lại hiện nút "Làm lại"

### Requirement: Câu sai trong bài kiểm tra được chuyển sang ôn tập
Hệ thống SHALL chuyển danh sách các câu người học làm sai trong một lần làm bài kiểm tra sang phần ôn tập khi lần
làm bài kết thúc, và SHALL NOT chuyển câu trả lời đúng hay câu bỏ qua. Việc tạo thẻ ôn tập thuộc story S9.4.

#### Scenario: S3.5-AC2 Chưa đạt thì câu sai được chuyển
- **WHEN** người học làm hết bài kiểm tra 5 câu, sai câu 2 và câu 4, chưa đạt
- **THEN** phần ôn tập nhận được đúng hai câu 2 và 4 của bài kiểm tra đó

#### Scenario: S3.5-AC2 Đạt nhưng còn câu sai vẫn được chuyển
- **WHEN** người học làm hết bài kiểm tra 10 câu, sai 1 câu, đạt 90%
- **THEN** phần ôn tập nhận được đúng câu sai đó

#### Scenario: S3.5-AC2 Không sai câu nào thì không chuyển gì
- **WHEN** người học làm hết bài kiểm tra và trả lời đúng mọi câu
- **THEN** phần ôn tập không nhận câu nào

#### Scenario: S3.5-AC2 Làm lại không chuyển trùng câu của lần trước
- **WHEN** người học sai câu 2 ở lần làm thứ nhất, làm lại và sai câu 3 ở lần thứ hai
- **THEN** lần thứ hai chỉ chuyển câu 3, không chuyển lại câu 2

### Requirement: Bài kiểm tra luôn bắt đầu từ câu 1 (biện pháp tạm)
Hệ thống SHALL mở bài kiểm tra ở câu 1 kể cả khi người học từng thoát giữa chừng, để điểm luôn tính trên toàn bộ
các câu của bài. Biện pháp này không thuộc AC của story S3.5; xem Câu hỏi mở 1 trong proposal.

#### Scenario: S3.5-X1 Mở lại bài kiểm tra đang làm dở
- **WHEN** người học đã sang câu 3 của một bài kiểm tra, thoát rồi mở lại bài đó
- **THEN** màn hiện câu thứ nhất và thanh tiến độ cho biết "Câu 1 / n"
