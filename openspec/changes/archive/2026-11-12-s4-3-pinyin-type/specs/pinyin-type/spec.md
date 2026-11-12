## ADDED Requirements

### Requirement: Gõ kiểu số thì tự đổi thành dấu
Hệ thống SHALL tự đổi pinyin gõ kiểu số (số thanh 1–5 ngay sau âm tiết) thành pinyin có dấu ngay trong ô nhập.

| Gõ | Ô hiện |
|---|---|
| ni3 | nǐ |
| ni3hao3 | nǐhǎo |
| ni3 hao3 | nǐ hǎo |
| lv4 | lǜ |
| ma5 | ma |

#### Scenario: S4.3-AC1 Gõ ni3 thì hiện nǐ
- **WHEN** người học gõ "ni3" vào ô nhập
- **THEN** ô hiện "nǐ"

#### Scenario: S4.3-AC1 Gõ liền nhiều âm tiết thì đổi từng âm tiết
- **WHEN** người học gõ "ni3hao3"
- **THEN** ô hiện "nǐhǎo"

#### Scenario: S4.3-AC1 Gõ v thay cho ü
- **WHEN** người học gõ "lv4"
- **THEN** ô hiện "lǜ"

#### Scenario: S4.3-AC1 Số 5 là thanh nhẹ
- **WHEN** người học gõ "ma5"
- **THEN** ô hiện "ma"

#### Scenario: S4.3-AC1 Số đứng sai chỗ thì giữ nguyên
- **WHEN** người học gõ số không đứng sau âm tiết (vd "3" ở đầu ô)
- **THEN** ô giữ nguyên ký tự đã gõ

### Requirement: Chấp nhận cả kiểu gõ số và kiểu gõ có dấu
Hệ thống SHALL chấm đúng khi người học gõ đúng pinyin, dù gõ kiểu số hay kiểu dấu, gõ liền hay cách âm tiết, không phân biệt hoa/thường
và khoảng trắng thừa. Thanh nhẹ MUST được nhận cả khi gõ số 5 lẫn khi không gõ số.

| Đáp án | Cách gõ được chấm đúng |
|---|---|
| nǐ | ni3, nǐ, Ni3 |
| bàba | ba4ba, ba4ba5, ba4 ba, bàba |
| nǐ hǎo | ni3hao3, ni3 hao3, nǐhǎo, nǐ hǎo |

#### Scenario: S4.3-AC2 Gõ kiểu số đúng thì được chấm đúng
- **WHEN** từ là "nǐ", người học gõ "ni3" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng

#### Scenario: S4.3-AC2 Gõ kiểu dấu đúng thì được chấm đúng
- **WHEN** từ là "nǐ", người học gõ "nǐ" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng

#### Scenario: S4.3-AC2 Gõ liền hay cách âm tiết đều đúng
- **WHEN** từ là "bàba" và người học gõ lần lượt "ba4ba", "ba4ba5", "ba4 ba" (mỗi lần một câu)
- **THEN** cả ba lần đều được chấm đúng

#### Scenario: S4.3-AC2 Hoa thường và khoảng trắng thừa không ảnh hưởng
- **WHEN** từ là "nǐ hǎo" và người học gõ "  Ni3  Hao3 " rồi nhấn Enter
- **THEN** câu được chấm đúng

#### Scenario: S4.3-AC2 Ô trống thì chưa chấm
- **WHEN** người học bấm "Kiểm tra" khi ô còn trống
- **THEN** câu chưa được chấm và ô vẫn nhập được

#### Scenario: S4.3-AC2 Chấm xong thì khóa ô nhập
- **WHEN** câu đã được chấm
- **THEN** ô nhập bị khóa, gõ thêm không đổi kết quả

#### Scenario: S4.3-AC2 Câu gõ pinyin không còn bị bỏ qua
- **WHEN** bài có câu nghe rồi gõ pinyin
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"

### Requirement: Gõ sai thì tô chỗ sai
Hệ thống SHALL chỉ ra phần sai của từng âm tiết người học gõ: thanh mẫu (phụ âm đầu), vận mẫu (phần vần), thanh điệu. Mọi phần sai đều
được tô và MUST có nhãn chữ, không chỉ phân biệt bằng màu. Khi sai, hệ thống SHALL hiện pinyin đúng.

#### Scenario: S4.3-AC3 Sai thanh mẫu
- **WHEN** từ là "shì" và người học gõ "si4"
- **THEN** câu được chấm sai
- **AND** chỉ thanh mẫu được tô sai

#### Scenario: S4.3-AC3 Sai vận mẫu
- **WHEN** từ là "nǐ" và người học gõ "na3"
- **THEN** chỉ vận mẫu được tô sai

#### Scenario: S4.3-AC3 Sai thanh điệu
- **WHEN** từ là "mā" và người học gõ "ma2"
- **THEN** chỉ thanh điệu được tô sai

#### Scenario: S4.3-AC3 Sai nhiều phần thì tô hết các phần sai
- **WHEN** từ là "mā" và người học gõ "na2"
- **THEN** thanh mẫu và thanh điệu được tô sai, vận mẫu không bị tô

#### Scenario: S4.3-AC3 Từ nhiều âm tiết thì tô theo từng âm tiết
- **WHEN** từ là "nǐ hǎo" và người học gõ "ni3hao2"
- **THEN** chỉ thanh điệu của âm tiết thứ hai được tô sai

#### Scenario: S4.3-AC3 Thiếu âm tiết thì âm tiết thiếu bị tô sai
- **WHEN** từ là "nǐ hǎo" và người học gõ "ni3"
- **THEN** âm tiết thứ hai được tô sai ở cả ba phần

#### Scenario: S4.3-AC3 Phần sai có nhãn chữ và có đáp án đúng
- **WHEN** câu bị chấm sai
- **THEN** mỗi phần sai có nhãn chữ "Thanh mẫu", "Vận mẫu" hoặc "Thanh điệu"
- **AND** màn hiện pinyin đúng của từ
