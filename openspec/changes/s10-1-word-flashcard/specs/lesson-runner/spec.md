## ADDED Requirements

### Requirement: Câu chấm điểm và câu không chấm điểm
Mỗi câu của bài SHALL thuộc đúng một trong hai loại. Câu không chấm điểm là thẻ từ mới và các dạng câu mà một yêu cầu khác của màn học
khai báo là không chấm điểm; mọi dạng câu còn lại là câu chấm điểm.

| Loại | Khi câu vừa hiện | Màn tổng kết |
|---|---|---|
| Không chấm điểm | Có "Tiếp tục" ngay, không "Đúng", "Sai", giải thích | Không tính |
| Chấm điểm (ví dụ: thanh điệu, pinyin, cặp âm, nói, viết) | Chưa có "Tiếp tục", có kết quả sau khi trả lời | Tính |

#### Scenario: S10.1-AC1 Câu không chấm điểm có Tiếp tục ngay
- **WHEN** một câu thẻ từ mới vừa hiện và người học chưa bấm gì
- **THEN** màn có nút "Tiếp tục" bấm được
- **AND** màn không hiện "Đúng", "Sai" hay giải thích

### Requirement: Câu không chấm điểm vẫn là một câu của bài
Câu không chấm điểm SHALL được đếm trong "Câu k / n" và được ghi nhớ vị trí khi thoát giữa bài như mọi câu. Bấm "Tiếp tục" ở câu không
chấm điểm là đã làm xong câu đó, không phải bỏ qua, nên bài làm hết mà không bỏ qua câu nào vẫn thành "Đã xong".

#### Scenario: S10.1-AC1 Câu không chấm điểm không phải câu bị bỏ qua
- **WHEN** người học làm hết bài học thường 3 câu gồm 1 thẻ từ mới và 2 câu chọn thanh điệu, không bấm "Bỏ qua câu này" lần nào
- **THEN** màn báo đã làm xong các câu của bài, không báo có câu bị bỏ qua

### Requirement: Kiểm tra nội dung chặn bài không hợp với câu không chấm điểm
Kiểm tra nội dung SHALL báo lỗi nêu bài, và kết thúc không thành công, theo bảng:

| Bài | Kết quả |
|---|---|
| Bài kiểm tra (cuối chủ đề hoặc vượt cấp) có ít nhất một câu không chấm điểm | Lỗi |
| Bài học thường không có câu chấm điểm nào (chỉ gồm câu không chấm điểm) | Lỗi |
| Bài học thường có ít nhất một câu chấm điểm, kèm hoặc không kèm câu không chấm điểm | Không lỗi (về luật này) |

#### Scenario: S10.1-AC1 Bài kiểm tra có câu không chấm điểm thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối chủ đề có một thẻ từ mới
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó

#### Scenario: S10.1-AC1 Bài chỉ có câu không chấm điểm thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài học thường chỉ gồm 2 thẻ từ mới
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó

#### Scenario: S10.1-AC1 Bài có câu chấm điểm và câu không chấm điểm thì qua
- **WHEN** chạy kiểm tra nội dung trên một bài học thường gồm 1 thẻ từ mới hợp lệ và 1 câu chọn thanh điệu
- **THEN** kiểm tra không báo lỗi nào cho bài đó

## MODIFIED Requirements

### Requirement: Mỗi câu chấm ngay sau khi trả lời
Hệ thống SHALL báo đúng hay sai ngay sau khi người học trả lời một câu chấm điểm, trước khi cho sang câu kế. Câu không chấm điểm không
có kết quả (xem yêu cầu "Câu chấm điểm và câu không chấm điểm").

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
- **WHEN** câu chấm điểm vừa hiện và người học chưa trả lời
- **THEN** màn không hiện "Đúng", "Sai" hay nút "Tiếp tục"

### Requirement: Màn tổng kết hiện điểm, thời gian, số câu sai
Hệ thống SHALL hiện màn tổng kết khi người học làm hết các câu của bài, gồm điểm, thời gian làm và số câu
sai, dưới thông báo đã làm xong (hoặc đã bỏ qua câu) của bài. Điểm và số câu chỉ tính trên câu chấm điểm.

| Thông tin | Cách hiện | Cách tính |
|---|---|---|
| Điểm | "80%" kèm "Đúng 4 / 5 câu" | Câu chấm điểm trả lời đúng chia câu chấm điểm đã trả lời; câu bỏ qua và câu không chấm điểm không tính |
| Thời gian | "2:05" | Từ lúc câu đầu hiện tới lúc xong câu cuối |
| Số câu sai | "Sai 1 câu" | Số câu chấm điểm trả lời sai |

Nếu lần làm này không có câu chấm điểm nào được trả lời (ví dụ mở lại bài đang dở mà các câu còn lại đều là câu không chấm điểm), màn
tổng kết MUST NOT hiện điểm và "Đúng x / y câu"; vẫn hiện thời gian và "Sai 0 câu". Luật này áp cả khi không lưu được kết quả (xem yêu
cầu "Không lưu được kết quả thì báo trên màn tổng kết").

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

#### Scenario: S10.1-AC1 Câu không chấm điểm không tính vào điểm
- **WHEN** người học làm hết bài 5 câu gồm 1 thẻ từ mới và 4 câu chấm điểm, trả lời đúng 3 và sai 1 câu chấm điểm
- **THEN** màn tổng kết hiện điểm "75%", "Đúng 3 / 4 câu" và "Sai 1 câu"

#### Scenario: S10.1-AC1 Lần làm không có câu chấm điểm nào thì không hiện điểm
- **WHEN** người học mở lại bài 3 câu ở câu 3, câu 3 là thẻ từ mới, rồi bấm "Tiếp tục"
- **THEN** màn tổng kết không hiện điểm và không hiện "Đúng x / y câu"
- **AND** màn tổng kết hiện thời gian và "Sai 0 câu"

### Requirement: Không lưu được kết quả thì báo trên màn tổng kết
Hệ thống SHALL hiện thông báo chưa lưu được kết quả bài trên màn tổng kết khi app không ghi được tiến độ, và
MUST vẫn hiện đầy đủ điểm, thời gian, số câu sai như khi lưu được. Ngoại lệ: lần làm không có câu chấm điểm nào được trả lời thì màn
vẫn không hiện điểm và "Đúng x / y câu" (theo yêu cầu "Màn tổng kết hiện điểm, thời gian, số câu sai"), chỉ hiện thời gian, "Sai 0 câu"
và thông báo.

#### Scenario: S3.4-AC1 Ghi tiến độ lỗi
- **WHEN** người học làm xong bài nhưng app không ghi được kết quả
- **THEN** màn tổng kết vẫn hiện điểm, thời gian và số câu sai
- **AND** màn hiện thông báo "Chưa lưu được kết quả bài này"

#### Scenario: S10.1-AC1 Ghi tiến độ lỗi khi lần làm không có câu chấm điểm
- **WHEN** người học mở lại bài 3 câu ở câu 3, câu 3 là thẻ từ mới, bấm "Tiếp tục" nhưng app không ghi được kết quả
- **THEN** màn tổng kết không hiện điểm và không hiện "Đúng x / y câu"
- **AND** màn tổng kết hiện thời gian, "Sai 0 câu" và thông báo "Chưa lưu được kết quả bài này"
