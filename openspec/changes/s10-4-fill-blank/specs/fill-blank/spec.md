## Purpose

Câu điền chỗ trống: người học đọc một câu chữ Hán còn thiếu một từ, chọn hoặc gõ từ còn thiếu, được chấm ngay và thấy đáp án khi sai.

## ADDED Requirements

### Requirement: Chọn hoặc gõ từ vào chỗ trống, chấm ngay
Hệ thống SHALL cho người học chọn hoặc gõ từ vào chỗ trống của câu điền chỗ trống, và MUST chấm ngay: chạm lựa chọn là chấm, gõ thì chấm khi
bấm "Kiểm tra" hoặc nhấn Enter. Chấm xong, chỗ trống MUST hiện từ đúng, câu đầy đủ hiện kèm pinyin, và lựa chọn hoặc ô gõ bị khóa.

Các Scenario dưới đây dùng câu mẫu "我＿米饭" (đầy đủ: "我吃米饭", pinyin "wǒ chī mǐfàn", nghĩa "Tôi ăn cơm"), đáp án "吃" (chī); kiểu chọn có
các lựa chọn "吃", "喝", "看".

#### Scenario: S10.4-AC1 Chọn đúng thì được chấm đúng ngay
- **WHEN** câu kiểu chọn hiện ra và người học chạm "吃"
- **THEN** câu được chấm đúng ngay, không cần bấm "Kiểm tra"
- **AND** chỗ trống hiện "吃", câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn"
- **AND** trên lựa chọn "吃" có nhãn "Đáp án đúng"
- **AND** không lựa chọn nào có nhãn "Đã chọn"

#### Scenario: S10.4-AC1 Chọn sai thì được chấm sai và hiện đáp án
- **WHEN** câu kiểu chọn hiện ra và người học chạm "喝"
- **THEN** câu được chấm sai ngay
- **AND** chỗ trống hiện "吃", câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn"
- **AND** giải thích là "Đáp án đúng: 吃 · chī"
- **AND** trên lựa chọn "吃" có nhãn "Đáp án đúng", trên lựa chọn "喝" có nhãn "Đã chọn", lựa chọn "看" không có nhãn (các nhãn này nằm
  trên lựa chọn, khác với dòng giải thích)

#### Scenario: S10.4-AC1 Gõ chữ Hán đúng thì được chấm đúng
- **WHEN** câu kiểu gõ hiện ra, người học gõ "吃" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng
- **AND** chỗ trống hiện "吃", câu hiện kèm pinyin "wǒ chī mǐfàn"

#### Scenario: S10.4-AC1 Gõ sai thì được chấm sai và hiện đáp án
- **WHEN** câu kiểu gõ hiện ra, người học gõ "喝" rồi nhấn Enter
- **THEN** câu được chấm sai
- **AND** giải thích là "Đáp án đúng: 吃 · chī"

#### Scenario: S10.4-AC1 Chấm xong thì khóa lựa chọn
- **WHEN** ở câu kiểu chọn, người học đã chạm một lựa chọn
- **THEN** các lựa chọn bị khóa, chạm lựa chọn khác không đổi kết quả

#### Scenario: S10.4-AC1 Chấm xong thì khóa ô gõ
- **WHEN** ở câu kiểu gõ, câu đã được chấm
- **THEN** ô gõ bị khóa, gõ thêm hay nhấn Enter không đổi kết quả

#### Scenario: S10.4-AC1 Câu điền chỗ trống không còn bị bỏ qua
- **WHEN** bài có câu điền chỗ trống
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"

### Requirement: Mỗi câu có một kiểu điền: chọn hoặc gõ
Hệ thống SHALL hiện mỗi câu điền chỗ trống theo đúng một kiểu do nội dung của câu quyết định. Người học MUST NOT đổi kiểu trên cùng một câu.

| Kiểu | Màn hiện | Chấm khi |
|---|---|---|
| Chọn | Các lựa chọn chữ Hán, thứ tự xáo theo quy tắc chung câu trắc nghiệm E10 (S10.2) | Người học chạm một lựa chọn |
| Gõ | Một ô gõ có nhãn và nút "Kiểm tra" | Người học bấm "Kiểm tra" hoặc nhấn Enter, ô không trống |

#### Scenario: S10.4-AC1 Câu kiểu chọn hiện các lựa chọn, không có ô gõ
- **WHEN** câu kiểu chọn có các lựa chọn "吃", "喝", "看" hiện ra
- **THEN** màn hiện đúng ba lựa chọn "吃", "喝", "看" (thứ tự bất kỳ)
- **AND** không có ô gõ, không có nút "Kiểm tra"

#### Scenario: S10.4-AC1 Câu kiểu gõ hiện ô gõ, không có lựa chọn
- **WHEN** câu kiểu gõ hiện ra
- **THEN** màn hiện một ô gõ có nhãn đọc được và nút "Kiểm tra"
- **AND** không hiện lựa chọn nào

#### Scenario: S10.4-AC1 Ô trống thì chưa chấm
- **WHEN** ở câu kiểu gõ, người học bấm "Kiểm tra" khi ô còn trống hoặc chỉ có khoảng trắng
- **THEN** câu chưa được chấm và ô vẫn gõ được

### Requirement: Kiểu chọn theo quy tắc chung câu trắc nghiệm E10
Câu kiểu chọn SHALL theo quy tắc chung câu trắc nghiệm E10 của S10.2, gồm: xáo thứ tự khi câu hiện, giữ nguyên tới khi rời câu, xáo mới
khi mở lại bài đang dở hoặc học lại; khóa lựa chọn sau khi chấm; chọn được bằng bàn phím. Sau khi chấm, mỗi lựa chọn MUST có nhãn chữ
nằm trên lựa chọn (không chỉ màu):

| Lựa chọn | Nhãn |
|---|---|
| Đáp án (dù chọn hay không) | "Đáp án đúng" |
| Đã chọn, và sai | "Đã chọn" |
| Khác | Không có |

#### Scenario: S10.4-AC1 Thứ tự lựa chọn kiểu chọn không cố định
- **WHEN** cùng một câu kiểu chọn có 3 lựa chọn hiện ra nhiều lần
- **THEN** đáp án không luôn ở cùng một vị trí

#### Scenario: S10.4-AC1 Thứ tự lựa chọn giữ nguyên tới khi rời câu
- **WHEN** câu kiểu chọn vừa hiện và người học chạm một lựa chọn
- **THEN** sau khi chấm, các lựa chọn vẫn ở đúng thứ tự như lúc câu vừa hiện

#### Scenario: S10.4-AC1 Kết quả trên lựa chọn ghi bằng chữ
- **WHEN** ở câu kiểu chọn, người học chạm "喝" (sai)
- **THEN** trên lựa chọn "吃" có nhãn "Đáp án đúng" và trên lựa chọn "喝" có nhãn "Đã chọn", đọc được cả khi không nhìn màu (kể cả với
  trình đọc màn hình)

### Requirement: Kiểu gõ chấp nhận chữ Hán hoặc pinyin của đáp án
Hệ thống SHALL chấm đúng câu kiểu gõ khi người học gõ chữ Hán của đáp án, hoặc pinyin của đáp án theo quy tắc chấp nhận của câu gõ pinyin
(S4.3, kể cả thanh nhẹ). Pinyin thiếu hoặc sai thanh MUST bị chấm sai, trừ âm tiết thanh nhẹ. Khi so chữ Hán, mọi khoảng trắng (kể cả
toàn khổ) MUST được bỏ qua.

| Đáp án | Đúng | Sai |
|---|---|---|
| 吃 chī | 吃, "　吃　", chi1, chī, Chi1 | chi, chi2, 吃饭 |
| 米饭 mǐfàn | "米 饭", mi3 fan4, mǐfàn | mifan |
| 吗 ma | ma, ma5 | ma1 |

#### Scenario: S10.4-AC1 Gõ pinyin kiểu số đúng thì được chấm đúng
- **WHEN** đáp án là "吃" (chī) và người học gõ "chi1" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng

#### Scenario: S10.4-AC1 Gõ pinyin kiểu dấu đúng thì được chấm đúng
- **WHEN** đáp án là "吃" (chī) và người học gõ "chī" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng

#### Scenario: S10.4-AC1 Gõ pinyin nhiều âm tiết liền hay cách đều đúng
- **WHEN** đáp án là "米饭" (mǐfàn) và người học gõ lần lượt "mi3fan4", "mi3 fan4", "mǐfàn" (mỗi lần một câu)
- **THEN** cả ba lần đều được chấm đúng

#### Scenario: S10.4-AC1 Pinyin thiếu thanh hoặc sai thanh thì sai
- **WHEN** đáp án là "吃" (chī) và người học gõ lần lượt "chi", "chi2" (mỗi lần một câu)
- **THEN** cả hai lần đều được chấm sai
- **AND** giải thích là "Đáp án đúng: 吃 · chī"

#### Scenario: S10.4-AC1 Đáp án thanh nhẹ nhận cả khi không gõ số lẫn khi gõ số 5
- **WHEN** đáp án là "吗" (ma, thanh nhẹ) và người học gõ lần lượt "ma", "ma5" (mỗi lần một câu)
- **THEN** cả hai lần đều được chấm đúng

#### Scenario: S10.4-AC1 Đáp án thanh nhẹ gõ số thanh khác thì sai
- **WHEN** đáp án là "吗" (ma, thanh nhẹ) và người học gõ "ma1"
- **THEN** câu được chấm sai
- **AND** giải thích là "Đáp án đúng: 吗 · ma"

#### Scenario: S10.4-AC1 Chữ Hán thừa chữ thì sai
- **WHEN** đáp án là "吃" và người học gõ "吃饭"
- **THEN** câu được chấm sai

#### Scenario: S10.4-AC1 Khoảng trắng đầu cuối không ảnh hưởng
- **WHEN** đáp án là "吃" và người học gõ lần lượt " 吃 " và "　吃　" (dấu cách toàn khổ), mỗi lần một câu, rồi nhấn Enter
- **THEN** cả hai lần đều được chấm đúng

#### Scenario: S10.4-AC1 Khoảng trắng giữa các chữ Hán không ảnh hưởng
- **WHEN** đáp án là "米饭" và người học gõ "米 饭" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng

### Requirement: Ô gõ giữ nguyên chữ đã gõ và tôn trọng bộ gõ tiếng Trung
Ô gõ của câu điền chỗ trống SHALL giữ nguyên chữ người học gõ, MUST NOT tự đổi pinyin kiểu số thành kiểu dấu. Enter dùng để xác nhận chữ
trong bộ gõ tiếng Trung MUST NOT chấm câu.

#### Scenario: S10.4-AC1 Ô gõ không tự đổi pinyin kiểu số thành dấu
- **WHEN** ở câu kiểu gõ, người học gõ "chi1" vào ô
- **THEN** ô vẫn hiện đúng "chi1", không đổi thành "chī"

#### Scenario: S10.4-AC1 Enter để chọn chữ trong bộ gõ tiếng Trung không chấm câu
- **WHEN** người học đang gõ bằng bộ gõ tiếng Trung, ô đang ở trạng thái chọn chữ (chưa xác nhận), và nhấn Enter để xác nhận chữ
- **THEN** câu chưa được chấm, ô nhận chữ vừa xác nhận và vẫn gõ được
- **AND** nhấn Enter lần nữa khi đã xác nhận chữ thì câu mới được chấm

### Requirement: Chưa chấm thì không lộ đáp án
Trước khi chấm, hệ thống SHALL hiện câu chữ Hán có chỗ trống và nghĩa tiếng Việt của cả câu, và MUST NOT hiện pinyin của câu hay từ cần
điền, dù công tắc "Hiện pinyin" đang bật. Chỗ trống MUST có nhãn đọc được cho trình đọc màn hình, không chỉ là gạch chân.

#### Scenario: S10.4-AC1 Câu vừa hiện chỉ có chữ Hán có chỗ trống và nghĩa
- **WHEN** câu điền chỗ trống vừa hiện, "Hiện pinyin" đang bật, người học chưa trả lời
- **THEN** màn hiện "我", chỗ trống, "米饭" và nghĩa "Tôi ăn cơm"
- **AND** màn không hiện "吃" ngoài các lựa chọn, không hiện "wǒ chī mǐfàn" hay "chī"

#### Scenario: S10.4-AC1 Sau khi chấm luôn hiện pinyin dù "Hiện pinyin" tắt
- **WHEN** công tắc "Hiện pinyin" đang tắt và người học vừa trả lời câu điền chỗ trống (đúng hoặc sai)
- **THEN** câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn"

#### Scenario: S10.4-AC1 Chỗ trống có nhãn đọc được
- **WHEN** câu điền chỗ trống vừa hiện
- **THEN** chỗ trống có nhãn "Chỗ trống" cho trình đọc màn hình

### Requirement: Nội dung câu điền chỗ trống phải hợp lệ
Kiểm tra nội dung SHALL báo lỗi chỉ rõ bài và câu, và MUST NOT ghi nội dung ra, khi câu điền chỗ trống sai cấu trúc:

| Câu sai cấu trúc |
|---|
| Không có chỗ trống, hoặc từ hai chỗ trống trở lên |
| Kiểu chọn có ít hơn 2 hoặc nhiều hơn 4 lựa chọn |
| Kiểu chọn có lựa chọn trùng nhau |
| Kiểu chọn mà đáp án không nằm trong các lựa chọn |
| Kiểu gõ mà vẫn có lựa chọn |

#### Scenario: S10.4-AC1 Câu có hai chỗ trống thì bị báo lỗi
- **WHEN** người soạn tạo câu điền chỗ trống có hai chỗ trống và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

#### Scenario: S10.4-AC1 Câu không có chỗ trống thì bị báo lỗi
- **WHEN** người soạn tạo câu điền chỗ trống không có chỗ trống và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Đáp án không nằm trong lựa chọn thì bị báo lỗi
- **WHEN** người soạn tạo câu kiểu chọn có đáp án "吃" và các lựa chọn "喝", "看" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Số lựa chọn ngoài 2–4 thì bị báo lỗi
- **WHEN** người soạn tạo lần lượt câu kiểu chọn có 1 lựa chọn và câu kiểu chọn có 5 lựa chọn, mỗi lần chạy kiểm tra nội dung
- **THEN** cả hai lần kiểm tra nội dung đều báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Lựa chọn trùng nhau thì bị báo lỗi
- **WHEN** người soạn tạo câu kiểu chọn có các lựa chọn "吃", "吃", "喝" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Câu kiểu gõ có lựa chọn thì bị báo lỗi
- **WHEN** người soạn tạo câu kiểu gõ có các lựa chọn "吃", "喝" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

### Requirement: Câu điền chỗ trống phải đủ chữ, pinyin và nghĩa
Kiểm tra nội dung SHALL báo lỗi chỉ rõ bài và câu khi đáp án thiếu chữ Hán hoặc pinyin, hoặc câu thiếu pinyin câu đầy đủ hoặc nghĩa tiếng
Việt. Câu đầy đủ là câu có chỗ trống được điền đáp án nên không thể lệch; kiểm tra nội dung không so pinyin câu với chữ Hán.

#### Scenario: S10.4-AC1 Đáp án thiếu chữ Hán thì bị báo lỗi
- **WHEN** người soạn tạo câu điền chỗ trống có pinyin đáp án "chī" nhưng không có chữ Hán của đáp án rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Đáp án thiếu pinyin thì bị báo lỗi
- **WHEN** người soạn tạo câu điền chỗ trống có đáp án "吃" nhưng không có pinyin của đáp án rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Thiếu pinyin hoặc nghĩa của câu thì bị báo lỗi
- **WHEN** người soạn tạo lần lượt câu điền chỗ trống không có pinyin của câu đầy đủ và câu không có nghĩa tiếng Việt, mỗi lần chạy kiểm tra
  nội dung
- **THEN** cả hai lần kiểm tra nội dung đều báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.4-AC1 Câu hợp lệ thì qua kiểm tra
- **WHEN** người soạn tạo câu "我＿米饭" kiểu chọn với đáp án "吃" và các lựa chọn "吃", "喝", "看" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung không báo lỗi cho câu đó
