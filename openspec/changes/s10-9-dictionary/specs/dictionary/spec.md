## ADDED Requirements

### Requirement: Tìm được theo chữ Hán, pinyin (có dấu hoặc không) hoặc nghĩa tiếng Việt
Hệ thống SHALL tìm từ theo chữ Hán, pinyin có dấu, pinyin không dấu hoặc nghĩa tiếng Việt, trong mọi từ HSK 1 của app (kể cả từ của bài
chưa mở). Từ khớp theo nhiều cách MUST chỉ hiện một lần. Quy tắc khớp của từng cách nằm ở các Requirement "Quy tắc khớp chữ Hán và pinyin" và "Quy tắc khớp nghĩa tiếng Việt".

#### Scenario: S10.9-AC1 Tìm theo chữ Hán
- **WHEN** người học mở màn Tra từ và gõ "学"
- **THEN** kết quả có 学, 学生, 学习 và 大学

#### Scenario: S10.9-AC1 Tìm theo pinyin có dấu
- **WHEN** người học gõ "nǐ"
- **THEN** kết quả có 你 và 你们

#### Scenario: S10.9-AC1 Tìm theo pinyin không dấu
- **WHEN** người học gõ "ni"
- **THEN** kết quả có 你, 你们, 年 và 您

#### Scenario: S10.9-AC1 Tìm theo nghĩa tiếng Việt
- **WHEN** người học gõ "yêu"
- **THEN** kết quả có 爱 (nghĩa "yêu; thích")

#### Scenario: S10.9-AC1 Một chuỗi khớp cả pinyin lẫn nghĩa
- **WHEN** người học gõ "ai"
- **THEN** kết quả có 爱 (ài, khớp pinyin), 爱好 (àihào, khớp pinyin), 谁 (nghĩa "ai") và 哪些 (nghĩa "ai?")
- **AND** mỗi từ chỉ hiện một lần

### Requirement: Quy tắc khớp chữ Hán và pinyin
Hệ thống SHALL chọn cách tìm theo nội dung ô và coi một từ là khớp theo bảng sau:

| Cách tìm | Áp dụng khi ô | Từ khớp khi |
|---|---|---|
| Chữ Hán | Có chữ Hán | Chữ Hán của từ chứa nguyên chuỗi đã gõ |
| Pinyin có dấu | Không có chữ Hán, có dấu thanh | Pinyin của từ bắt đầu bằng chuỗi đã gõ, đúng cả dấu |
| Pinyin không dấu | Không có chữ Hán, không có dấu thanh | Pinyin của từ, bỏ dấu thanh, bắt đầu bằng chuỗi đã gõ |

#### Scenario: S10.9-AC1 Ô có chữ Hán chỉ tìm theo chữ Hán
- **WHEN** người học gõ "学"
- **THEN** mọi dòng kết quả đều có chữ Hán chứa "学"

#### Scenario: S10.9-AC1 Pinyin có dấu phải đúng dấu, khớp từ đầu pinyin
- **WHEN** người học gõ "nǐ"
- **THEN** kết quả không có 年 (nián), 您 (nín) và không có từ nào mà pinyin không bắt đầu bằng "nǐ"

### Requirement: Ô có dấu thanh so theo pinyin có dấu
Hệ thống SHALL coi ô có dấu thanh khi chứa ít nhất một nguyên âm pinyin mang dấu (ā á ǎ à, ē é ě è, ī í ǐ ì, ō ó ǒ ò, ū ú ǔ ù, ǖ ǘ ǚ
ǜ; "ü" không dấu không tính). Ô có dấu thanh MUST so cả chuỗi theo cách "Pinyin có dấu", kể cả khi chỉ một phần chuỗi có dấu.

#### Scenario: S10.9-AC1 Ô trộn có dấu và không dấu so theo có dấu
- **WHEN** người học gõ "xuéxi"
- **THEN** kết quả có 学校 (xuéxiào)
- **AND** kết quả không có 学习 (xuéxí)

### Requirement: Quy tắc khớp nghĩa tiếng Việt
Hệ thống SHALL tìm theo nghĩa tiếng Việt khi ô không có chữ Hán (cùng lúc với tìm theo pinyin). Một từ MUST khớp khi một đoạn nghĩa của từ
chứa chuỗi đã gõ thành một hay nhiều từ trọn vẹn và đúng dấu tiếng Việt ("hoc" không khớp "học").

#### Scenario: S10.9-AC1 Nghĩa tiếng Việt khớp theo từ trọn vẹn và đúng dấu
- **WHEN** người học gõ "học sinh"
- **THEN** kết quả có 学生
- **WHEN** người học gõ "hoc"
- **THEN** kết quả không có 学

### Requirement: Đoạn nghĩa
Hệ thống SHALL tách mỗi nghĩa của từ tại dấu ";" thành các đoạn nghĩa, bỏ khoảng trắng đầu cuối mỗi đoạn (爱 có nghĩa "yêu; thích" → hai
đoạn "yêu" và "thích"). Phần trong ngoặc vuông, kể cả ngoặc (ví dụ "[shui2]", "[ge4]"), MUST bị bỏ qua khi so.

#### Scenario: S10.9-AC1 Đoạn nghĩa tách theo dấu chấm phẩy
- **WHEN** người học gõ "đam mê"
- **THEN** kết quả có 爱好 (đoạn "đam mê" trong "thích; đam mê; lấy làm thú vui; say mê")

#### Scenario: S10.9-AC1 Bỏ qua phần trong ngoặc vuông khi so nghĩa
- **WHEN** người học gõ "shui"
- **THEN** kết quả có 水 (shuǐ) và 睡 (shuì)
- **AND** kết quả không có 谁 (nghĩa "cũng đọc là [shui2]")

### Requirement: Từ trọn vẹn trong nghĩa
Hệ thống SHALL coi chuỗi đã gõ là từ trọn vẹn trong đoạn nghĩa khi ký tự ngay trước và ngay sau chỗ khớp (nếu có) không phải chữ cái hay
chữ số. Khoảng trắng, dấu câu (kể cả "?"), ngoặc tròn, chữ Hán và dấu "|" MUST là ranh giới từ.

#### Scenario: S10.9-AC1 Không khớp giữa chữ
- **WHEN** người học gõ "ái"
- **THEN** kết quả không có 女 (nghĩa "con gái")
- **WHEN** người học gõ "gái"
- **THEN** kết quả có 女

#### Scenario: S10.9-AC1 Dấu câu là ranh giới từ
- **WHEN** người học gõ "ai"
- **THEN** kết quả có 哪些 (nghĩa "ai?")

### Requirement: Khớp trọn theo nghĩa
Hệ thống SHALL coi một từ là khớp trọn theo nghĩa khi có một đoạn nghĩa, sau khi bỏ dấu câu và khoảng trắng ở đầu và cuối đoạn, đúng bằng
chuỗi đã gõ (không phân biệt hoa thường). Ví dụ đoạn "ai?" của 哪些 khớp trọn với "ai".

#### Scenario: S10.9-AC1 Đoạn nghĩa đúng bằng chuỗi đã gõ là khớp trọn
- **WHEN** người học gõ "thích"
- **THEN** kết quả có 爱 (đoạn "thích" trong "yêu; thích") và 爱好 (đoạn "thích" trong "thích; đam mê; lấy làm thú vui; say mê")
- **AND** cả hai thuộc nhóm khớp trọn, đứng trước mọi từ chỉ khớp một phần

### Requirement: Ô tìm kiếm cập nhật kết quả khi gõ
Hệ thống SHALL có trên màn Tra từ một ô tìm kiếm có nhãn "Tra từ"; kết quả MUST cập nhật theo nội dung ô mỗi khi nội dung đổi, không có
nút "Tìm".

#### Scenario: S10.9-AC1 Kết quả đổi khi gõ thêm
- **WHEN** người học gõ "学" rồi gõ thêm "生" thành "学生"
- **THEN** kết quả đổi theo mà không cần bấm nút: có 学生, 大学生, không còn 学习

### Requirement: Cách so chuỗi đã gõ
Hệ thống SHALL so chuỗi đã gõ với từ theo các quy tắc sau:

| Quy tắc | Áp dụng cho | Ví dụ |
|---|---|---|
| Bỏ khoảng trắng đầu và cuối ô trước khi tìm | Mọi cách tìm | "  学  " như "学" |
| Chữ có dấu dạng dựng sẵn hay dạng tổ hợp (chữ + dấu rời) như nhau | Pinyin, nghĩa | "ǐ" một ký tự như "i" + dấu rời |
| Không phân biệt chữ hoa, chữ thường | Pinyin, nghĩa | "NǏMEN" như "nǐmen" |

#### Scenario: S10.9-AC1 Dạng dựng sẵn và dạng tổ hợp như nhau
- **WHEN** người học gõ "nǐ" dạng tổ hợp ("i" kèm dấu thanh rời), rồi gõ "yêu" dạng tổ hợp ("e" kèm dấu mũ rời)
- **THEN** lần đầu kết quả có 你 và 你们 như khi gõ "nǐ" dạng dựng sẵn
- **AND** lần sau kết quả có 爱 như khi gõ "yêu" dạng dựng sẵn

#### Scenario: S10.9-AC1 Bỏ khoảng trắng đầu cuối
- **WHEN** người học gõ "  学  "
- **THEN** kết quả giống như khi gõ "学"

### Requirement: Cách so pinyin
Hệ thống SHALL bỏ qua khoảng trắng, dấu nháy và gạch nối ở cả chuỗi đã gõ lẫn pinyin của từ khi so pinyin ("xiaoxuesheng" khớp 小学生
"xiǎo xuésheng"). Khi so pinyin không dấu, "ü", "u" và "v" MUST coi là như nhau.

#### Scenario: S10.9-AC1 Pinyin không phân biệt hoa thường, khoảng trắng
- **WHEN** người học lần lượt gõ "ni men", "NǏMEN" và "nǐmen"
- **THEN** cả ba lần kết quả đều có 你们

#### Scenario: S10.9-AC1 Pinyin không dấu với ü
- **WHEN** người học lần lượt gõ "nu", "nv" và "nü"
- **THEN** cả ba lần kết quả đều có 女 (nǚ)

#### Scenario: S10.9-AC1 Pinyin của từ có khoảng trắng
- **WHEN** người học gõ "xiaoxuesheng"
- **THEN** kết quả có 小学生 (xiǎo xuésheng)

### Requirement: Mỗi kết quả hiện chữ Hán, pinyin và nghĩa
Hệ thống SHALL hiện mỗi kết quả thành một dòng gồm chữ Hán, pinyin có dấu và toàn bộ nghĩa tiếng Việt của từ: mọi nghĩa theo thứ tự, ngăn
bằng "; " (cùng cách hiện nghĩa với thẻ từ S10.1 và đáp án S10.2). Chữ có hai cách đọc là hai
mục riêng trong danh sách từ (ví dụ 地 "de" và 地 "dì") thì MUST hiện thành hai dòng riêng. Phía trên danh sách MUST có dòng số kết quả
"<N> kết quả". Kết quả chỉ để đọc: bấm vào không mở màn khác, dòng kết quả không nhận focus và không nằm trong thứ tự Tab.

#### Scenario: S10.9-AC1 Một dòng kết quả
- **WHEN** người học gõ "爱好"
- **THEN** có dòng kết quả hiện "爱好", "àihào" và nghĩa "thích; đam mê; lấy làm thú vui; say mê; sở thích"
- **AND** phía trên danh sách hiện "1 kết quả"

#### Scenario: S10.9-AC1 Chữ có hai cách đọc hiện hai dòng
- **WHEN** người học gõ "地"
- **THEN** có hai dòng chữ 地, một dòng pinyin "de" và một dòng pinyin "dì", mỗi dòng có nghĩa riêng

### Requirement: Thứ tự kết quả
Hệ thống SHALL xếp kết quả thành hai nhóm, nhóm khớp trọn lên trước; trong mỗi nhóm, từ xếp theo thứ tự của danh sách từ HSK 1 trong app
(theo pinyin A–Z):

| Nhóm | Từ thuộc nhóm |
|---|---|
| Khớp trọn | Chữ Hán đúng bằng chuỗi đã gõ; hoặc pinyin đúng bằng chuỗi đã gõ theo "Cách so chuỗi đã gõ" và "Cách so pinyin" (ô không dấu thanh: so với pinyin đã bỏ dấu thanh; ô có dấu thanh: so đúng cả dấu); hoặc khớp trọn theo nghĩa (theo "Khớp trọn theo nghĩa") |
| Khớp một phần | Các từ khớp còn lại |

#### Scenario: S10.9-AC1 Từ khớp trọn lên đầu
- **WHEN** người học gõ "学"
- **THEN** dòng kết quả đầu tiên là 学
- **AND** các dòng sau (大学, 学生, 学习…) theo thứ tự của danh sách từ

#### Scenario: S10.9-AC1 Khớp trọn theo pinyin và theo nghĩa
- **WHEN** người học gõ "ai"
- **THEN** ba dòng đầu lần lượt là 爱 (pinyin "ài" bỏ dấu bằng "ai"), 哪些 (đoạn nghĩa "ai?") rồi 谁 (đoạn nghĩa "ai")
- **AND** dòng thứ tư là 爱好

#### Scenario: S10.9-AC1 Khớp trọn pinyin có dấu phải đúng dấu
- **WHEN** người học gõ "xué"
- **THEN** dòng đầu tiên là 学 (xué)
- **WHEN** người học gõ "xuè"
- **THEN** không có kết quả 学

### Requirement: Trạng thái ô tìm kiếm trống và không có kết quả
Hệ thống SHALL hiện câu gợi ý khi ô tìm kiếm trống và câu báo khi không có từ nào khớp, không hiện danh sách và dòng số kết quả trong hai
trường hợp này:

| Tình huống | Màn hiện |
|---|---|
| Ô trống hoặc chỉ có khoảng trắng (cả lúc vừa mở màn) | "Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt để tra từ." |
| Có nội dung nhưng không từ nào khớp | "Không tìm thấy từ nào cho "<nội dung đã gõ, bỏ khoảng trắng đầu cuối>"." |

#### Scenario: S10.9-AC1 Vừa mở màn Tra từ
- **WHEN** người học mở màn Tra từ
- **THEN** màn hiện tiêu đề "Tra từ", ô tìm kiếm trống và câu "Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt để tra từ."
- **AND** không có dòng kết quả nào

#### Scenario: S10.9-AC1 Không có từ nào khớp
- **WHEN** người học gõ "xyzw"
- **THEN** màn hiện "Không tìm thấy từ nào cho "xyzw"."
- **AND** không có dòng kết quả và không có dòng số kết quả

#### Scenario: S10.9-AC1 Xóa hết nội dung ô
- **WHEN** người học gõ "学" rồi xóa hết nội dung ô
- **THEN** danh sách kết quả biến mất và màn hiện lại câu gợi ý

### Requirement: Không tải được danh sách từ
Hệ thống SHALL hiện "Không tải được từ điển." kèm nút "Thử lại" khi danh sách từ không tải được; câu MUST nằm trong vùng trình đọc màn
hình tự đọc. Bấm "Thử lại" thì tải lại; tải được thì màn về trạng thái ô trống như lúc vừa mở.

#### Scenario: S10.9-AC1 Lỗi tải danh sách từ và thử lại
- **WHEN** danh sách từ không tải được lúc mở màn Tra từ
- **THEN** màn hiện "Không tải được từ điển." và nút "Thử lại"
- **WHEN** lần tải sau thành công và người học bấm "Thử lại"
- **THEN** màn hiện ô tìm kiếm và câu gợi ý, gõ "学" thì có kết quả 学

### Requirement: Màn Tra từ dùng được bằng bàn phím
Hệ thống SHALL có ở đầu màn Tra từ tiêu đề "Tra từ" và liên kết "Về Trang chủ"; ô tìm kiếm MUST có nhãn "Tra từ" gắn với ô. Mở màn không
chuyển focus; Tab đầu tiên tới "Về Trang chủ", Tab kế tiếp tới ô tìm kiếm. Dòng kết quả không nằm trong thứ tự Tab: Tab từ ô tìm kiếm
không dừng ở dòng kết quả nào. Mọi thành phần tương tác có viền focus nhìn thấy được.

#### Scenario: S10.9-AC1 Về Trang chủ
- **WHEN** người học bấm "Về Trang chủ" trên màn Tra từ
- **THEN** người học về Trang chủ

#### Scenario: S10.9-AC1 Thứ tự Tab trên màn Tra từ
- **WHEN** người học mở màn Tra từ và nhấn Tab hai lần
- **THEN** lần thứ nhất focus ở liên kết "Về Trang chủ", lần thứ hai focus ở ô tìm kiếm có nhãn "Tra từ"

#### Scenario: S10.9-AC1 Dòng kết quả không nhận focus
- **WHEN** người học gõ "学" rồi nhấn Tab từ ô tìm kiếm
- **THEN** focus không rơi vào dòng kết quả nào

### Requirement: Kết quả đọc được bằng trình đọc màn hình
Hệ thống SHALL đặt dòng số kết quả và câu báo không có kết quả trong vùng trình đọc màn hình tự đọc (đọc lịch sự, không ngắt lời). Kết quả
MUST là một danh sách; chữ Hán, pinyin và nghĩa không chỉ phân biệt bằng màu.

#### Scenario: S10.9-AC1 Số kết quả được trình đọc màn hình đọc
- **WHEN** người học gõ "爱好"
- **THEN** vùng tự đọc chứa "1 kết quả"

### Requirement: Màn Tra từ trên khổ hẹp
Hệ thống SHALL hiện màn Tra từ ở khổ 375 px không có thanh cuộn ngang, nghĩa dài tự xuống dòng. Màn không có hiệu ứng chuyển động.

#### Scenario: S10.9-AC1 Khổ 375 px không cuộn ngang
- **WHEN** người học mở màn Tra từ ở khổ 375 × 812 và gõ "ni"
- **THEN** trang không có thanh cuộn ngang

### Requirement: Chạy offline
Hệ thống SHALL cho mở màn Tra từ và tìm từ đầy đủ như khi có mạng khi không có mạng, với điều kiện người học đã mở app ít nhất một lần
(như S1.2).

#### Scenario: S10.9-AC2 Tra từ khi offline
- **WHEN** người học đã mở app một lần và xong onboarding, tắt mạng, mở lại app rồi vào màn Tra từ
- **THEN** gõ "学" thì kết quả có 学, 学生 và 学习
- **AND** gõ "ni" thì kết quả có 你
- **AND** gõ "yêu" thì kết quả có 爱
