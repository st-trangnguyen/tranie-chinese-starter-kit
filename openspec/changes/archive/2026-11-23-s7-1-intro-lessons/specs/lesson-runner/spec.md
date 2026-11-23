## MODIFIED Requirements

### Requirement: Mỗi câu chấm ngay sau khi trả lời
Hệ thống SHALL báo đúng hay sai ngay sau khi người học trả lời một câu, trước khi cho sang câu kế. Câu viết chữ (S7.1) chỉ
có kết quả "Đúng" khi viết xong nét cuối; viết sai nét không làm câu "Sai" nên câu viết không có giải thích.

| Kết quả | Màn hiện | Cho sang câu kế khi nào |
|---|---|---|
| Đúng | Thông báo "Đúng" | Người học bấm "Tiếp tục" |
| Sai | Thông báo "Sai" kèm giải thích (xem yêu cầu kế tiếp) | Người học bấm "Tiếp tục" |
| Câu viết chữ: viết xong nét cuối | Thông báo "Đúng", khung viết bị khóa, không có "Viết lại", không còn liên kết "Xem thứ tự nét" | Người học bấm "Tiếp tục" |

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
- **WHEN** câu vừa hiện và người học chưa trả lời
- **THEN** màn không hiện "Đúng", "Sai" hay nút "Tiếp tục"

#### Scenario: S7.1-AC1 Câu viết chỉ có kết quả Đúng
- **WHEN** ở câu viết chữ "十", người học viết sai nét 4 lần rồi viết đúng đủ 2 nét
- **THEN** màn hiện "Đúng" và nút "Tiếp tục", không hiện "Sai" và không hiện giải thích

### Requirement: Câu có dạng bài chưa có thì được bỏ qua (biện pháp tạm)
Hệ thống SHALL cho người học bỏ qua câu bằng "Bỏ qua câu này" để không kẹt giữa bài trong hai trường hợp: (1) câu có dạng
bài chưa được hỗ trợ; (2) câu viết chữ không hiện được khung viết (chữ không có dữ liệu nét, hoặc tải dữ liệu nét lỗi), xem
yêu cầu "Trạng thái câu viết khi tải dữ liệu nét" của S7.1. Hệ thống SHALL NOT báo "đã làm xong" khi có câu bị bỏ qua.
Thông báo cuối bài nêu số câu đã bỏ qua và bài chưa hoàn thành, không nêu lý do "dạng bài chưa có".

Từ S7.1 màn bài đã hỗ trợ đủ các dạng bài của E4–E6 và kiểm tra nội dung chặn câu viết thiếu dữ liệu nét, nên cả hai trường
hợp chỉ còn là lưới an toàn khi nội dung hoặc bản app lệch nhau. Biện pháp này không thuộc AC của story S3.2; gỡ trường hợp (1)
khi kiểm tra nội dung chặn được mọi dạng bài màn bài chưa hỗ trợ; trường hợp (2) giữ lâu dài.

#### Scenario: S3.2-X1 Bỏ qua câu thì không báo là đã làm xong
- **WHEN** người học bỏ qua 3 câu trong bài có 3 câu vì dạng bài chưa có
- **THEN** màn báo đã bỏ qua 3 câu và bài chưa hoàn thành
- **AND** màn không báo đã làm xong các câu của bài

#### Scenario: S3.2-X1 Bỏ qua một câu giữa bài
- **WHEN** người học làm câu 1, bỏ qua câu 2 (dạng bài chưa có) rồi làm câu 3
- **THEN** sau câu 2 màn hiện câu 3 với "Câu 3 / 3"
- **AND** cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành

#### Scenario: S7.1-AC1 Bỏ qua câu viết thiếu dữ liệu nét thì bài chưa hoàn thành
- **WHEN** người học làm câu 1, bỏ qua câu 2 (câu viết hiện "Chưa có dữ liệu nét cho chữ này.") rồi làm câu 3
- **THEN** cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành
- **AND** thông báo cuối bài không nói lý do là dạng bài chưa có
