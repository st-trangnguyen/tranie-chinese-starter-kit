## ADDED Requirements

### Requirement: Mỗi bài có audio và ít nhất 2 dạng bài tập
Mỗi bài có audio và ít nhất 2 dạng bài tập. Mỗi bài trong 12 bài Nhập môn SHALL có câu thuộc ít nhất 2 dạng bài tập
khác nhau, có ít nhất một câu có nút "Nghe", và mọi từ, câu mà các câu có nút "Nghe" hoặc "Nghe mẫu" dùng tới MUST có
audio phát được. Câu viết chữ không có nút nghe nên không đòi audio.

#### Scenario: S7.1-AC1 Mỗi bài có ít nhất 2 dạng bài tập
- **WHEN** đọc nội dung đã build của từng bài trong 12 bài Nhập môn
- **THEN** mỗi bài có câu thuộc ít nhất 2 dạng bài tập khác nhau

#### Scenario: S7.1-AC1 Không bài nào có câu phải bỏ qua
- **WHEN** người học mở lần lượt từng câu của mỗi bài trong 12 bài Nhập môn
- **THEN** không câu nào hiện lựa chọn bỏ qua vì dạng bài chưa có

#### Scenario: S7.1-AC1 Mỗi bài có câu nghe
- **WHEN** người học mở một bài bất kỳ trong 12 bài Nhập môn
- **THEN** bài có ít nhất một câu có nút "Nghe"

#### Scenario: S7.1-AC1 Mọi từ và câu của bài đều có audio
- **WHEN** đọc nội dung đã build của 12 bài Nhập môn
- **THEN** mọi từ và câu mà các câu có nút "Nghe" hoặc "Nghe mẫu" dùng tới đều có file audio có trong bản build và phát được (độ dài lớn hơn 0)

#### Scenario: S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện
- **WHEN** người học bấm "Nghe" hoặc "Nghe mẫu" ở một câu bất kỳ của 12 bài Nhập môn
- **THEN** audio được phát là audio của đúng từ hoặc câu mà câu bài tập đó đang hỏi, không phải của từ, câu khác hay của câu bài tập trước

### Requirement: Bài Nhập môn chỉ dùng dạng bài tập màn bài đã hỗ trợ
Mỗi câu trong 12 bài Nhập môn SHALL thuộc một dạng bài tập màn bài đã hỗ trợ (bảng dưới), để không câu nào phải bỏ qua:

| Dạng bài tập | Có audio | Dùng trong bài Nhập môn |
|---|---|---|
| Chọn thanh điệu (S4.1) | Có, nút "Nghe" | Có |
| Phân biệt cặp âm (S4.2) | Có, nút "Nghe" | Có |
| Gõ pinyin (S4.3) | Có, nút "Nghe" | Có |
| Nói theo mẫu (S5.1–S5.4) | Có, nghe mẫu | Có |
| Viết chữ theo nét (S6.2, thêm ở S7.1) | Không | Có |
| Dạng màn bài chưa hỗ trợ | — | Không |

#### Scenario: S7.1-AC1 Mọi câu thuộc dạng đã hỗ trợ
- **WHEN** đọc nội dung đã build của 12 bài Nhập môn
- **THEN** mọi câu đều thuộc một trong 5 dạng có "Có" ở cột cuối của bảng

### Requirement: Bài 2 chỉ luyện biến điệu bằng nói theo mẫu
Pinyin trong app viết theo thanh gốc (ví dụ "一起" là "yīqǐ"). Bài "Thanh nhẹ và biến điệu (3-3, 不, 一)" SHALL luyện biến
điệu bằng câu nói theo mẫu, và MUST NOT hỏi từ có biến điệu (có chữ "不", chữ "一", hoặc hai âm tiết thanh 3 liền nhau) trong
câu chọn thanh hay gõ pinyin, để người học không bị chấm "Sai" khi làm theo biến điệu.

#### Scenario: S7.1-AC1 Bài 2 không hỏi từ có biến điệu trong câu chọn thanh và gõ pinyin
- **WHEN** đọc nội dung đã build của bài "Thanh nhẹ và biến điệu (3-3, 不, 一)"
- **THEN** không câu chọn thanh hay gõ pinyin nào hỏi từ có chữ "不", chữ "一", hoặc có hai âm tiết thanh 3 liền nhau

#### Scenario: S7.1-AC1 Bài 2 có câu nói theo mẫu với từ có biến điệu
- **WHEN** đọc nội dung đã build của bài "Thanh nhẹ và biến điệu (3-3, 不, 一)"
- **THEN** bài có ít nhất một câu nói theo mẫu dùng từ có chữ "不", chữ "一", hoặc có hai âm tiết thanh 3 liền nhau

### Requirement: Câu viết chữ làm được trong màn bài
Màn bài SHALL hỗ trợ dạng bài tập viết chữ theo nét: mỗi câu viết là đúng MỘT chữ Hán, hiện khung viết có gợi ý giống màn
luyện viết của S6.2 (nét mờ cả chữ, báo sai nét, gợi ý sau 3 lần sai, giảm chuyển động). Câu viết MUST NOT hiện lựa chọn
bỏ qua vì dạng bài chưa có. Khung viết SHALL nhận focus bằng Tab, có viền focus nhìn thấy và có nhãn cho trình đọc màn hình
nêu chữ đang viết (như S6.2); viết nét vẫn là thao tác trỏ.

#### Scenario: S7.1-AC1 Câu viết hiện khung viết của đúng chữ
- **WHEN** người học tới một câu viết chữ "人" trong bài Nhập môn
- **THEN** màn hiện khung viết của chữ "人" với đủ nét mờ của cả chữ, chưa có nét nào được đánh dấu là đã viết
- **AND** màn không hiện lựa chọn bỏ qua vì dạng bài chưa có

#### Scenario: S7.1-AC1 Khung viết trong bài nhận focus bàn phím
- **WHEN** người học nhấn Tab ở câu viết chữ "人" trong bài Nhập môn
- **THEN** khung viết nhận focus, có viền focus nhìn thấy
- **AND** trình đọc màn hình đọc được nhãn của khung nêu chữ "人"

### Requirement: Viết xong chữ thì câu viết được tính đúng
Câu viết SHALL có kết quả theo bảng; câu viết MUST NOT ghi mức chấm vào thẻ ôn tập nào và không có giải thích.

| Tình huống | Màn hiện | Tổng kết bài |
|---|---|---|
| Viết sai một nét | Báo sai nét (S6.2), chưa có kết quả câu, chưa có "Tiếp tục" | — |
| Viết xong nét cuối | "Đúng" và nút "Tiếp tục" | Câu đúng |

#### Scenario: S7.1-AC1 Viết sai nét trong câu viết chưa kết thúc câu
- **WHEN** ở câu viết chữ "十", người học viết nét sổ dọc khi khung đang chờ nét ngang
- **THEN** màn hiện thông báo viết sai nét, chưa hiện "Đúng" hay "Sai" của câu và chưa có nút "Tiếp tục"

#### Scenario: S7.1-AC1 Viết xong chữ thì câu được tính đúng
- **WHEN** ở câu viết chữ "十", người học viết sai một nét một lần rồi viết đúng đủ 2 nét
- **THEN** màn hiện "Đúng" và nút "Tiếp tục"
- **AND** bấm "Tiếp tục" thì sang câu kế, thanh tiến độ tăng một câu

#### Scenario: S7.1-AC1 Làm hết bài có câu viết thì bài Đã xong
- **WHEN** người học làm hết các câu của bài "Nét cơ bản và thứ tự nét", kể cả các câu viết, mà không bỏ qua câu nào
- **THEN** màn báo đã làm xong các câu của bài, tổng kết tính mỗi câu viết đã viết xong là một câu đúng
- **AND** trên màn Lộ trình bài "Nét cơ bản và thứ tự nét" có nhãn "Đã xong" và bài "30 bộ thủ phổ biến" có nhãn "Đang mở"

### Requirement: Câu viết đã Đúng thì khung viết bị khóa
Sau khi câu viết "Đúng", khung viết SHALL bị khóa như đáp án của câu đã chấm (S3.2): vẽ thêm không thêm nét, không báo sai
nét, kết quả không đổi. Trong màn bài MUST NOT có nút "Viết lại".

#### Scenario: S7.1-AC1 Câu viết đã Đúng thì khung bị khóa
- **WHEN** câu viết chữ "十" đang hiện "Đúng" và người học vẽ thêm một nét vào khung viết
- **THEN** khung không thêm nét, không báo sai nét, màn vẫn hiện "Đúng" và nút "Tiếp tục"
- **AND** màn không có nút "Viết lại"

### Requirement: Câu viết chỉ dùng chữ có dữ liệu nét
Mỗi câu viết trong nội dung SHALL là đúng một chữ Hán có dữ liệu nét. Kiểm tra nội dung MUST báo lỗi (không chỉ cảnh báo)
theo bảng (hiện mọi chữ HSK 1 đều có dữ liệu nét; luật là hàng rào khi nguồn nét hoặc từ điển đổi):

| Câu viết dùng | Kiểm tra nội dung |
|---|---|
| Một chữ Hán có dữ liệu nét | Không báo |
| Một chữ Hán thiếu dữ liệu nét | Lỗi, nêu chữ và lý do |
| Từ nhiều hơn một chữ | Lỗi |
| Rỗng | Lỗi |
| Không phải chữ Hán (ví dụ "abc") | Lỗi |

#### Scenario: S7.1-AC3 Câu viết dùng chữ không có dữ liệu nét thì kiểm tra nội dung báo lỗi
- **WHEN** trên nội dung thử với dữ liệu nét thử không có chữ "爱", chạy kiểm tra nội dung với một bài có câu viết chữ "爱" (có trong từ điển HSK 1)
- **THEN** kiểm tra kết thúc không thành công và báo lỗi nêu chữ "爱" và lý do là thiếu dữ liệu nét
- **AND** lỗi không phải lỗi từ ngoài từ điển

#### Scenario: S7.1-AC3 Câu viết dùng từ nhiều chữ thì kiểm tra nội dung báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có câu viết từ "爸爸"
- **THEN** kiểm tra kết thúc không thành công và báo lỗi nêu từ "爸爸"

#### Scenario: S7.1-AC3 Câu viết rỗng thì kiểm tra nội dung báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có câu viết không ghi chữ nào
- **THEN** kiểm tra kết thúc không thành công và báo lỗi câu viết rỗng

#### Scenario: S7.1-AC3 Câu viết không phải chữ Hán thì kiểm tra nội dung báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có câu viết "abc"
- **THEN** kiểm tra kết thúc không thành công và báo lỗi nêu "abc"

#### Scenario: S7.1-AC3 Mọi câu viết của 12 bài có dữ liệu nét
- **WHEN** đọc nội dung đã build của 12 bài Nhập môn
- **THEN** mỗi câu viết là đúng một chữ Hán và chữ đó có dữ liệu nét trong bản build

### Requirement: Trạng thái câu viết khi tải dữ liệu nét
Câu viết SHALL hiện theo bảng (giống S6.1) và MUST NOT kẹt; câu bỏ qua làm bài chưa hoàn thành (S3.2).

| Trạng thái | Màn hiện (thay khung viết) | "Xem thứ tự nét" | Đi tiếp |
|---|---|---|---|
| Đang tải | "Đang tải…" | Không | Chờ |
| Tải lỗi, dữ liệu hỏng | "Có lỗi xảy ra", "Thử lại" | Không | "Thử lại" hoặc "Bỏ qua câu này" |
| Không có dữ liệu nét | "Chưa có dữ liệu nét cho chữ này." | Không | "Bỏ qua câu này" |
| Có dữ liệu nét | Khung viết | Có (ẩn sau khi Đúng) | Viết chữ |

#### Scenario: S7.1-AC1 Câu viết đang tải dữ liệu nét
- **WHEN** người học tới câu viết chữ "人" và dữ liệu nét chưa tải xong
- **THEN** màn hiện "Đang tải…", không hiện khung viết, không hiện liên kết "Xem thứ tự nét" và chưa có nút "Tiếp tục"

#### Scenario: S7.1-AC1 Câu viết tải dữ liệu nét lỗi
- **WHEN** người học tới câu viết chữ "人" và việc tải dữ liệu nét thất bại
- **THEN** màn hiện "Có lỗi xảy ra", nút "Thử lại" và lựa chọn "Bỏ qua câu này"
- **AND** màn không hiện khung viết, không hiện liên kết "Xem thứ tự nét", không hiện "Chưa có dữ liệu nét cho chữ này."

#### Scenario: S7.1-AC1 Câu viết thử lại sau khi tải lỗi
- **WHEN** câu viết chữ "人" đang hiện "Có lỗi xảy ra", người học bấm "Thử lại" và lần tải này thành công
- **THEN** thông báo lỗi biến mất, màn hiện khung viết của chữ "人" và liên kết "Xem thứ tự nét"

#### Scenario: S7.1-AC1 Câu viết tải lỗi rồi bỏ qua
- **WHEN** câu viết thứ 2 của bài 3 câu đang hiện "Có lỗi xảy ra", người học bấm "Bỏ qua câu này" rồi làm câu 3
- **THEN** sau câu 2 màn hiện câu 3 với "Câu 3 / 3"
- **AND** cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành

#### Scenario: S7.1-AC1 Câu viết gặp chữ không có dữ liệu nét khi chạy app
- **WHEN** người học tới một câu viết mà chữ của câu không có dữ liệu nét
- **THEN** màn hiện "Chưa có dữ liệu nét cho chữ này.", không hiện khung viết, không hiện liên kết "Xem thứ tự nét", và có lựa chọn "Bỏ qua câu này"
- **AND** bỏ qua thì sang câu kế; cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành

### Requirement: Lối vào xem thứ tự nét và luyện viết từ bài Nhập môn
Mỗi câu viết hiện được khung viết và chưa Đúng SHALL có liên kết "Xem thứ tự nét" mở màn xem thứ tự nét (S6.1) của đúng chữ của câu đó; từ màn
này người học vào màn luyện viết (S6.2) bằng nút "Tập viết" đã có. Quay lại bằng nút quay lại của trình duyệt SHALL đưa
người học về đúng câu viết đó trong bài, câu làm lại từ đầu (khung viết trống). Liên kết MUST tới được bằng Tab và mở được
bằng Enter. Câu viết không hiện được khung viết MUST NOT hiện liên kết này.

#### Scenario: S7.1-AC2 Từ câu viết mở màn xem thứ tự nét
- **WHEN** người học ở câu viết chữ "人" của bài "Nét cơ bản và thứ tự nét" và bấm liên kết "Xem thứ tự nét"
- **THEN** màn xem thứ tự nét của chữ "人" mở, có nút "Tập viết"

#### Scenario: S7.1-AC2 Từ bài vào luyện viết qua màn thứ tự nét
- **WHEN** người học đang ở màn xem thứ tự nét mở từ câu viết chữ "人" và bấm "Tập viết"
- **THEN** màn luyện viết của chữ "人" mở

#### Scenario: S7.1-AC2 Quay lại bài từ màn thứ tự nét
- **WHEN** người học mở màn xem thứ tự nét từ câu viết thứ k của bài, rồi bấm nút quay lại của trình duyệt
- **THEN** màn bài hiện lại câu thứ k với "Câu k / n", khung viết trống, chưa có nét nào được đánh dấu là đã viết

#### Scenario: S7.1-AC2 Liên kết Xem thứ tự nét dùng được bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím ở câu viết chữ "人", nhấn Tab tới liên kết "Xem thứ tự nét" rồi nhấn Enter
- **THEN** màn xem thứ tự nét của chữ "人" mở

### Requirement: Câu viết đã Đúng thì không còn liên kết xem thứ tự nét
Khi câu viết đã "Đúng", màn bài MUST NOT hiện liên kết "Xem thứ tự nét" của câu đó, để người học không mất kết quả "Đúng" vì
rời bài rồi quay lại; người học đi tiếp bằng nút "Tiếp tục".

#### Scenario: S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét
- **WHEN** người học viết xong nét cuối của chữ "人" trong câu viết và câu hiện "Đúng"
- **THEN** màn không còn liên kết "Xem thứ tự nét" và có nút "Tiếp tục"

### Requirement: Quay lại bài thì tổng kết tính từ câu viết đó
Quay lại bài từ màn thứ tự nét là mở lại bài ở câu đang dở, nên tổng kết SHALL theo luật làm tiếp đã có (S3.4): chỉ tính các
câu từ câu viết đó trở đi, thời gian tính từ lúc câu đó hiện lại; kết quả các câu trước MUST NOT vào tổng kết.

#### Scenario: S7.1-AC2 Quay lại bài thì tổng kết chỉ tính từ câu viết đó
- **WHEN** ở bài 5 câu, người học làm đúng câu 1 và 2, ở câu 3 (câu viết) bấm "Xem thứ tự nét", quay lại bằng nút quay lại của trình duyệt, rồi làm đúng câu 3, 4, 5
- **THEN** màn tổng kết hiện "Đúng 3 / 3 câu" và "Sai 0 câu"
- **AND** thời gian tính từ lúc câu 3 hiện lại

### Requirement: Câu viết của bài 10 và bài 11
Bài "Nét cơ bản và thứ tự nét" SHALL có câu viết chữ "人" và câu viết chữ "十". Bài "30 bộ thủ phổ biến" SHALL có ít nhất một
câu viết; câu viết của bài này dùng bộ thủ tự đứng được thành chữ có trong từ điển HSK 1 (ví dụ "口", "人", "女", "日"). Bộ thủ
không đứng riêng được (ví dụ "氵", "扌", "亻") không có câu viết, chỉ có thể xuất hiện qua chữ chứa nó trong các dạng bài khác.

#### Scenario: S7.1-AC2 Bài "Nét cơ bản và thứ tự nét" có câu viết
- **WHEN** đọc nội dung đã build của bài "Nét cơ bản và thứ tự nét"
- **THEN** bài có câu viết chữ "人" và câu viết chữ "十"

#### Scenario: S7.1-AC2 Bài "30 bộ thủ phổ biến" có câu viết
- **WHEN** đọc nội dung đã build của bài "30 bộ thủ phổ biến"
- **THEN** bài có ít nhất một câu viết chữ

#### Scenario: S7.1-AC2 Câu viết của bài "30 bộ thủ phổ biến" là chữ trong từ điển
- **WHEN** đọc nội dung đã build của bài "30 bộ thủ phổ biến"
- **THEN** mỗi câu viết của bài là một chữ có trong từ điển HSK 1 và có dữ liệu nét

### Requirement: Danh sách bài
Danh sách bài: 1. Thanh 1–4 · 2. Thanh nhẹ và biến điệu (3-3, 不, 一) · 3. Vận mẫu đơn · 4. Thanh mẫu b p m f d t n l ·
5. Thanh mẫu g k h j q x · 6. Thanh mẫu zh ch sh r z c s · 7. Vận mẫu kép · 8. Vận mẫu mũi · 9. Quy tắc viết pinyin ·
10. Nét cơ bản và thứ tự nét · 11. 30 bộ thủ phổ biến · 12. Ôn tổng hợp + câu chào đầu tiên.

Lộ trình SHALL có giai đoạn đầu "Nhập môn" gồm một nhóm với đúng 12 bài trên, đúng thứ tự, tiêu đề nguyên văn; MUST NOT còn bài khác.

#### Scenario: S7.1-AC2 Lộ trình có đủ 12 bài Nhập môn đúng thứ tự
- **WHEN** người học đã xong onboarding và mở màn Lộ trình
- **THEN** giai đoạn đầu tiên là "Nhập môn", có một nhóm, và hiện đúng 12 bài với tiêu đề theo đúng thứ tự từ "Thanh 1–4" tới "Ôn tổng hợp + câu chào đầu tiên"

#### Scenario: S7.1-AC2 Không còn bài mẫu cũ
- **WHEN** người học mở màn Lộ trình
- **THEN** không có bài nào tên "Bốn thanh điệu"

#### Scenario: S7.1-AC2 Tiêu đề trên màn bài khớp lộ trình
- **WHEN** người học mở từng bài trong 12 bài Nhập môn
- **THEN** màn bài hiện tiêu đề giống tiêu đề của bài đó trên lộ trình

### Requirement: Kiểm tra nội dung không có lỗi
`content:check` chạy qua mà không có lỗi. Kiểm tra nội dung SHALL kết thúc thành công và MUST NOT báo lỗi nào khi chạy
trên nội dung có 12 bài Nhập môn. Cảnh báo (ví dụ nghĩa tiếng Việt chưa review) không làm hỏng điều kiện này.

#### Scenario: S7.1-AC3 Kiểm tra nội dung chạy qua
- **WHEN** chạy kiểm tra nội dung trên nội dung có 12 bài Nhập môn
- **THEN** kiểm tra kết thúc thành công và không báo lỗi nào

#### Scenario: S7.1-AC3 Nội dung đã build khớp file soạn
- **WHEN** chạy kiểm tra nội dung sau khi soạn xong 12 bài
- **THEN** kiểm tra không báo nội dung đã build lệch với file soạn

### Requirement: Xong onboarding thì mở được bài 1
Xong onboarding thì mở được bài 1 "Thanh 1–4" (chuyển từ S1.3 AC4). Hệ thống SHALL đưa người học vào màn học của bài
"Thanh 1–4" ngay khi xong onboarding, bắt đầu ở câu thứ nhất, và bài này MUST ở trạng thái "Đang mở" trên lộ trình.

#### Scenario: S7.1-AC4 Xong onboarding vào thẳng bài "Thanh 1–4"
- **WHEN** người học mở app lần đầu và làm xong onboarding
- **THEN** người học vào màn học có tiêu đề "Thanh 1–4", thanh tiến độ hiện "Câu 1 / n"

#### Scenario: S7.1-AC4 Bài 1 đang mở trên lộ trình
- **WHEN** người học vừa xong onboarding, chưa học bài nào, rồi mở màn Lộ trình
- **THEN** bài "Thanh 1–4" có nhãn "Đang mở" và 11 bài Nhập môn còn lại có nhãn "Đã khóa"

### Requirement: Học trọn 12 bài khi không có mạng
Đã mở app 1 lần thì tắt mạng vẫn học trọn 12 bài, kể cả audio (chuyển từ S1.2 AC2). Khi người học đã mở app ít nhất
một lần, rồi mất mạng, hệ thống SHALL vẫn mở được cả 12 bài Nhập môn, phát được mọi audio của 12 bài, hiện được khung viết
của mọi câu viết (không hiện "Có lỗi xảy ra" ở câu viết), và ghi nhận bài "Đã xong" như khi có mạng.

#### Scenario: S7.1-AC5 Offline mở được cả 12 bài
- **WHEN** người học đã mở app một lần, tắt mạng, rồi mở lần lượt từng bài trong 12 bài Nhập môn
- **THEN** mỗi bài hiện đúng tiêu đề và câu thứ nhất, không có thông báo lỗi tải

#### Scenario: S7.1-AC5 Offline phát được mọi audio của 12 bài
- **WHEN** người học đã mở app một lần, tắt mạng, rồi ở mọi câu có nút "Nghe" hoặc "Nghe mẫu" của 12 bài Nhập môn bấm nút đó
- **THEN** mỗi lần bấm đều phát được audio, không có thông báo lỗi phát audio

#### Scenario: S7.1-AC5 Offline làm hết bài thì bài xong và bài kế mở
- **WHEN** người học đã mở app một lần, tắt mạng, làm hết các câu của bài "Thanh 1–4" mà không bỏ qua câu nào
- **THEN** trên màn Lộ trình bài "Thanh 1–4" có nhãn "Đã xong" và bài "Thanh nhẹ và biến điệu (3-3, 不, 一)" có nhãn "Đang mở"

#### Scenario: S7.1-AC5 Offline làm được câu viết
- **WHEN** người học đã mở app một lần, tắt mạng, rồi đi qua mọi câu viết của bài "Nét cơ bản và thứ tự nét" và "30 bộ thủ phổ biến"
- **THEN** mỗi câu viết hiện khung viết của đúng chữ đó, không hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này."
