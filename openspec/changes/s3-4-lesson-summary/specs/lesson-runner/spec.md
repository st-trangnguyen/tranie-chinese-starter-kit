## ADDED Requirements

### Requirement: Màn tổng kết hiện điểm, thời gian, số câu sai
Hệ thống SHALL hiện màn tổng kết khi người học làm hết các câu của bài, gồm điểm, thời gian làm và số câu
sai, dưới thông báo đã làm xong (hoặc đã bỏ qua câu) của bài.

| Thông tin | Cách hiện | Cách tính |
|---|---|---|
| Điểm | "80%" kèm "Đúng 4 / 5 câu" | Câu đúng chia câu đã trả lời, bỏ qua không tính |
| Thời gian | "2:05" | Từ lúc câu đầu hiện tới lúc xong câu cuối |
| Số câu sai | "Sai 1 câu" | Số câu trả lời sai |

#### Scenario: S3.4-AC1 Tổng kết sau câu cuối
- **WHEN** người học làm xong câu cuối của bài 5 câu, trả lời đúng 4 câu và sai 1 câu
- **THEN** màn hiện thông báo đã làm xong các câu của bài
- **AND** màn hiện điểm "80%", "Đúng 4 / 5 câu" và "Sai 1 câu"

#### Scenario: S3.4-AC1 Làm đúng hết
- **WHEN** người học trả lời đúng cả 5 câu của bài
- **THEN** màn hiện điểm "100%" và "Sai 0 câu"

#### Scenario: S3.4-AC1 Làm sai hết
- **WHEN** người học trả lời sai cả 5 câu của bài
- **THEN** màn hiện điểm "0%" và "Sai 5 câu"

#### Scenario: S3.4-AC1 Điểm làm tròn thành số nguyên
- **WHEN** người học trả lời đúng 2 trong 3 câu
- **THEN** màn hiện điểm "67%"

#### Scenario: S3.4-AC1 Thời gian hiện theo phút và giây
- **WHEN** người học làm hết bài trong 125 giây kể từ lúc câu đầu hiện
- **THEN** màn hiện thời gian "2:05"

#### Scenario: S3.4-AC1 Thời gian dưới một phút
- **WHEN** người học làm hết bài trong 9 giây
- **THEN** màn hiện thời gian "0:09"

#### Scenario: S3.4-AC1 Có câu bỏ qua
- **WHEN** người học làm bài 3 câu, bỏ qua 1 câu vì dạng bài chưa có, trả lời đúng 2 câu còn lại
- **THEN** màn hiện thông báo đã bỏ qua 1 câu và bài chưa hoàn thành
- **AND** màn hiện điểm "100%" tính trên 2 câu đã trả lời và "Sai 0 câu"

#### Scenario: S3.4-AC1 Làm tiếp từ câu đang dở
- **WHEN** người học mở lại bài 5 câu ở câu 3, trả lời 3 câu còn lại: đúng 2 câu và sai 1 câu
- **THEN** màn tổng kết hiện điểm "67%", "Đúng 2 / 3 câu" và "Sai 1 câu"
- **AND** thời gian tính từ lúc câu 3 hiện

#### Scenario: S3.4-AC1 Chưa hết bài thì chưa có tổng kết
- **WHEN** người học đang ở giữa bài
- **THEN** màn không hiện điểm, thời gian hay số câu sai

### Requirement: Không lưu được kết quả thì báo trên màn tổng kết
Hệ thống SHALL hiện thông báo chưa lưu được kết quả bài trên màn tổng kết khi app không ghi được tiến độ, và
MUST vẫn hiện đầy đủ điểm, thời gian, số câu sai.

#### Scenario: S3.4-AC1 Ghi tiến độ lỗi
- **WHEN** người học làm xong bài nhưng app không ghi được kết quả
- **THEN** màn tổng kết vẫn hiện điểm, thời gian và số câu sai
- **AND** màn hiện thông báo "Chưa lưu được kết quả bài này"
