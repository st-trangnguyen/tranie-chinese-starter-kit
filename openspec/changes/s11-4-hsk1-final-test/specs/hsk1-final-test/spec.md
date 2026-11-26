## ADDED Requirements

### Requirement: Bài kiểm tra gồm đủ 4 kỹ năng nghe, nói, đọc, viết
Bài kiểm tra gồm đủ 4 kỹ năng nghe, nói, đọc, viết. Bài kiểm tra cuối cấp SHALL có ít nhất 5 câu cho mỗi kỹ năng nghe, nói,
đọc, viết, với kỹ năng của câu tính theo bảng của yêu cầu "Mỗi dạng bài tính cho đúng một kỹ năng". Khi một kỹ năng dưới 5 câu
(kể cả 0 câu), kiểm tra nội dung SHALL kết thúc không thành công, lỗi nêu bài, kỹ năng thiếu và số câu đang có.

#### Scenario: S11.4-AC1 Bài kiểm tra cuối cấp có ít nhất 5 câu mỗi kỹ năng
- **WHEN** đọc nội dung đã build của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** bài có ít nhất 5 câu nghe, 5 câu nói, 5 câu đọc và 5 câu viết theo bảng kỹ năng
- **AND** số câu viết không quá một phần tư tổng số câu của bài

#### Scenario: S11.4-AC1 Kiểm tra nội dung báo lỗi khi thiếu hẳn một kỹ năng
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu đọc, 5 câu viết và không có câu nói nào
- **THEN** kiểm tra nội dung kết thúc không thành công và lỗi nêu bài đó thiếu kỹ năng "nói" (0 câu, cần ít nhất 5)

#### Scenario: S11.4-AC1 Kiểm tra nội dung báo lỗi khi một kỹ năng dưới 5 câu
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 4 câu nói, 5 câu đọc và 5 câu viết
- **THEN** kiểm tra nội dung kết thúc không thành công và lỗi nêu bài đó thiếu kỹ năng "nói" (4 câu, cần ít nhất 5)

#### Scenario: S11.4-AC1 Đủ 5 câu mỗi kỹ năng thì không báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có đúng 5 câu nghe, 5 câu nói, 5 câu đọc và 5 câu viết
- **THEN** kiểm tra nội dung không báo lỗi nào về số câu theo kỹ năng

#### Scenario: S11.4-AC1 Kiểm tra nội dung chạy qua với nội dung thật
- **WHEN** chạy kiểm tra nội dung trên nội dung thật có bài "Kiểm tra cuối cấp HSK 1"
- **THEN** kiểm tra kết thúc thành công và không báo lỗi nào

### Requirement: Câu viết không quá một phần tư bài kiểm tra cuối cấp
Số câu viết của bài kiểm tra cuối cấp MUST NOT vượt quá một phần tư tổng số câu, để người học sai hết câu nghe, nói, đọc luôn
"Chưa đạt" dù câu viết luôn được tính đúng. Vượt thì kiểm tra nội dung SHALL kết thúc không thành công, lỗi nêu bài, số câu viết và
tổng số câu.

#### Scenario: S11.4-AC1 Kiểm tra nội dung báo lỗi khi câu viết quá một phần tư
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu nói, 5 câu đọc và 6 câu viết
- **THEN** kiểm tra nội dung kết thúc không thành công và lỗi nêu bài đó có 6 câu viết trên tổng 21 câu, vượt một phần tư

#### Scenario: S11.4-AC1 Câu viết đúng một phần tư thì không báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu nói, 5 câu đọc và 5 câu viết
- **THEN** kiểm tra nội dung không báo lỗi nào về số câu viết

### Requirement: Bài kiểm tra cuối cấp được khai báo trong nội dung
Nội dung SHALL khai báo bài nào là bài kiểm tra cuối cấp. Luật phủ kỹ năng và luật câu viết chỉ áp cho bài được khai báo như
vậy, không dựa vào tiêu đề bài hay tên giai đoạn; bài kiểm tra cuối chủ đề không bị áp. Nội dung không có bài nào được khai báo thì
không lỗi về các luật này. Nội dung thật của app MUST khai báo bài "Kiểm tra cuối cấp HSK 1" là bài kiểm tra cuối cấp.

#### Scenario: S11.4-AC1 Nội dung thật khai báo bài cuối cấp HSK 1
- **WHEN** đọc nội dung đã build của app
- **THEN** bài "Kiểm tra cuối cấp HSK 1" được khai báo là bài kiểm tra cuối cấp
- **AND** không bài kiểm tra cuối chủ đề nào được khai báo là bài kiểm tra cuối cấp

#### Scenario: S11.4-AC1 Nội dung không có bài cuối cấp thì không báo lỗi phủ kỹ năng
- **WHEN** chạy kiểm tra nội dung trên một nội dung có bài kiểm tra cuối chủ đề chỉ gồm câu chọn thanh điệu và không có bài nào được khai báo là bài kiểm tra cuối cấp
- **THEN** kiểm tra nội dung không báo lỗi nào về số câu theo kỹ năng

### Requirement: Chỉ bài loại kiểm tra được khai báo là bài kiểm tra cuối cấp
Kiểm tra nội dung SHALL kết thúc không thành công, lỗi nêu bài, khi một bài không phải loại kiểm tra được khai báo là bài kiểm tra
cuối cấp.

#### Scenario: S11.4-AC1 Bài học thường không được khai báo là bài cuối cấp
- **WHEN** chạy kiểm tra nội dung trên một nội dung có một bài học thường được khai báo là bài kiểm tra cuối cấp
- **THEN** kiểm tra nội dung kết thúc không thành công và lỗi nêu bài đó

### Requirement: Mỗi dạng bài tính cho đúng một kỹ năng
Hệ thống SHALL tính mỗi câu của bài kiểm tra cuối cấp cho đúng một kỹ năng theo dạng bài. Dạng có dấu * chỉ dùng được khi
màn bài đã hỗ trợ (story E10 tương ứng đã merge).

| Kỹ năng | Dạng bài |
|---|---|
| Nghe | Nghe chọn thanh, Phân biệt cặp âm, Nghe rồi gõ pinyin, Nghe chọn chữ* |
| Nói | Nói theo mẫu, Đóng vai* |
| Đọc | Nhìn chữ chọn nghĩa*, Sắp xếp câu*, Điền chỗ trống*, Đọc hiểu* |
| Viết | Viết chữ theo nét (có gợi ý, trong màn bài) |

#### Scenario: S11.4-AC1 Câu gõ pinyin được tính cho kỹ năng nghe
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nói, 5 câu đọc, 5 câu viết và 5 câu nghe đều là câu nghe rồi gõ pinyin
- **THEN** kiểm tra nội dung không báo thiếu kỹ năng "nghe"

#### Scenario: S11.4-AC1 Câu nói theo mẫu được tính cho kỹ năng nói
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu đọc, 5 câu viết và 5 câu nói đều là câu nói theo mẫu
- **THEN** kiểm tra nội dung không báo thiếu kỹ năng "nói"

#### Scenario: S11.4-AC1 Câu viết chữ được tính cho kỹ năng viết, không tính cho kỹ năng khác
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu nói, 5 câu viết chữ và không có câu đọc nào
- **THEN** kiểm tra nội dung báo thiếu kỹ năng "đọc" và không báo thiếu kỹ năng "viết"

#### Scenario: S11.4-AC1 Câu đọc dạng E10 được tính cho kỹ năng đọc
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối cấp có 5 câu nghe, 5 câu nói, 5 câu viết và 5 câu đọc đều thuộc một dạng đọc của bảng mà màn bài đã hỗ trợ
- **THEN** kiểm tra nội dung không báo thiếu kỹ năng "đọc"

### Requirement: Mọi câu của bài kiểm tra cuối cấp có kết quả chấm
Mọi câu của bài kiểm tra cuối cấp SHALL có kết quả chấm và thuộc một dạng trong bảng kỹ năng. Câu không chấm điểm (thẻ từ mới,
thẻ ngữ pháp, hội thoại) bị chặn bằng luật chung "bài kiểm tra không có câu không chấm điểm" của S10.1/S10.6, áp cho mọi bài kiểm
tra; S11.4 không thêm luật riêng cho chúng. Câu viết chữ trong màn bài có gợi ý và luôn được tính "Đúng" khi viết xong (S7.1):
đây là hạn chế đã biết của bản này, viết không gợi ý trong màn bài để story sau.

#### Scenario: S11.4-AC1 Mọi câu thuộc dạng bài có trong bảng kỹ năng
- **WHEN** đọc nội dung đã build của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** mọi câu đều thuộc một dạng bài có trong bảng kỹ năng
- **AND** không câu nào là thẻ từ mới, thẻ ngữ pháp hay hội thoại

#### Scenario: S11.4-AC1 Mọi chữ của câu viết có dữ liệu nét
- **WHEN** đọc nội dung đã build của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** mọi chữ trong các câu viết chữ của bài đều có dữ liệu nét

### Requirement: Bài kiểm tra cuối cấp nằm ngay sau giai đoạn HSK 1
Lộ trình SHALL có, ngay sau giai đoạn "HSK 1" (15 chủ đề của S11.1), một giai đoạn "Kiểm tra cuối cấp HSK 1" gồm một nhóm với
đúng một bài kiểm tra cùng tên.

#### Scenario: S11.4-AC1 Bài kiểm tra cuối cấp đứng ngay sau giai đoạn HSK 1
- **WHEN** người học mở màn Lộ trình
- **THEN** ngay sau giai đoạn "HSK 1" là giai đoạn "Kiểm tra cuối cấp HSK 1", có một nhóm và đúng một bài "Kiểm tra cuối cấp HSK 1"
- **AND** giai đoạn "HSK 1" vẫn có đúng 15 chủ đề

### Requirement: Trạng thái bài và nhóm cuối cấp theo luật lộ trình
Bài và nhóm cuối cấp MUST theo luật đã có của lộ trình (S3.1, S3.5, S3.6). Bảng xét từ trên xuống, dòng đầu tiên khớp là kết quả:

| Tình trạng | Bài cuối cấp | Nút "Kiểm tra vượt cấp" |
|---|---|---|
| Đã đạt bài cuối cấp (từ lộ trình hoặc qua vượt cấp) | "Đã xong" | Không |
| Bài kiểm tra chủ đề thứ 15 đã "Đã xong" | "Đang mở" | Không |
| Còn lại | "Đã khóa" | Có |

#### Scenario: S11.4-AC1 Chưa xong chủ đề thứ 15 thì bài cuối cấp khóa và có nút vượt cấp
- **WHEN** người học chưa đạt bài kiểm tra của chủ đề thứ 15 của giai đoạn HSK 1 và mở màn Lộ trình
- **THEN** bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã khóa"
- **AND** nhóm của bài đó hiện nút "Kiểm tra vượt cấp"

#### Scenario: S11.4-AC1 Đạt bài kiểm tra chủ đề thứ 15 thì bài cuối cấp mở
- **WHEN** người học đạt bài kiểm tra của chủ đề thứ 15 của giai đoạn HSK 1 rồi mở màn Lộ trình
- **THEN** bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đang mở"
- **AND** nhóm của bài đó không hiện nút "Kiểm tra vượt cấp"

### Requirement: Đạt qua Kiểm tra vượt cấp chỉ đánh dấu bài cuối cấp
Đạt bài cuối cấp qua "Kiểm tra vượt cấp" SHALL chỉ đánh dấu bài cuối cấp "Đã xong"; MUST NOT đổi trạng thái chủ đề nào của giai
đoạn "HSK 1".

#### Scenario: S11.4-AC1 Đạt qua Kiểm tra vượt cấp thì chỉ bài cuối cấp xong
- **WHEN** người học mới chỉ xong giai đoạn Nhập môn, bấm "Kiểm tra vượt cấp" của nhóm cuối cấp và đạt từ 80%
- **THEN** trên màn Lộ trình bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã xong" và nhóm không còn nút "Kiểm tra vượt cấp"
- **AND** bài đầu của chủ đề thứ hai trong giai đoạn "HSK 1" vẫn "Đã khóa"

### Requirement: Làm bài kiểm tra cuối cấp đủ 4 kỹ năng trong màn bài
Hệ thống SHALL cho người học làm hết mọi câu của bài kiểm tra cuối cấp trong màn bài mà không câu nào phải bỏ qua, kể cả khi
không có mic (câu nói chuyển sang "đọc to rồi tự chấm" như S5.4), khi có mạng hoặc dữ liệu nét của các chữ đã được tải. Kết quả
MUST theo luật bài kiểm tra của S3.5:

| Điểm | Màn tổng kết | Bài trên lộ trình |
|---|---|---|
| Từ 80% trở lên | "Bạn đã đạt", không có nút "Làm lại" | "Đã xong" |
| Dưới 80% | "Chưa đạt, cần từ 80%" và nút "Làm lại" | Giữ nguyên |

#### Scenario: S11.4-AC1 Không câu nào phải bỏ qua
- **WHEN** người học có mạng, mở lần lượt từng câu của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** không câu nào hiện lựa chọn "Bỏ qua câu này"

#### Scenario: S11.4-AC1 Làm đúng hết cả 4 kỹ năng thì đạt
- **WHEN** người học có mạng và không có mic, trả lời đúng mọi câu nghe và đọc, chọn "Đúng" ở mọi câu nói và viết xong mọi chữ của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** màn tổng kết hiện điểm "100%" và "Bạn đã đạt"
- **AND** trên màn Lộ trình bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã xong"

#### Scenario: S11.4-AC1 Sai nhiều câu thì chưa đạt và làm lại được
- **WHEN** người học có mạng và không có mic, trả lời sai mọi câu nghe và đọc, chọn "Chưa đúng" ở mọi câu nói và viết xong mọi chữ của bài "Kiểm tra cuối cấp HSK 1"
- **THEN** màn tổng kết hiện "Chưa đạt, cần từ 80%" và nút "Làm lại"
- **AND** trên màn Lộ trình bài "Kiểm tra cuối cấp HSK 1" không có nhãn "Đã xong"
