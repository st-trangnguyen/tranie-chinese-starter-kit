# tone-choice Specification

## Purpose
nghe một âm rồi chọn đúng thanh điệu trong các lựa chọn, chấm ngay sau khi chọn.

## Requirements

### Requirement: Có 5 lựa chọn thanh
Hệ thống SHALL hiện đúng 5 lựa chọn cho câu nghe chọn thanh theo thứ tự cố định: thanh 1, thanh 2, thanh 3, thanh 4, thanh nhẹ.
Từ của câu MUST là một âm tiết.

| Pinyin của từ | Thanh đúng |
|---|---|
| bā | Thanh 1 |
| bái | Thanh 2 |
| bǎi | Thanh 3 |
| bà | Thanh 4 |
| ma (không dấu) | Thanh nhẹ |

#### Scenario: S4.1-AC1 Hiện đúng 5 lựa chọn
- **WHEN** câu nghe chọn thanh hiện ra
- **THEN** màn hiện đúng 5 lựa chọn theo thứ tự: thanh 1, thanh 2, thanh 3, thanh 4, thanh nhẹ
- **AND** có nút "Nghe"

#### Scenario: S4.1-AC1 Chưa chọn thì chưa lộ đáp án
- **WHEN** câu vừa hiện và người học chưa chọn
- **THEN** màn không hiện thanh đúng và không hiện pinyin của từ

#### Scenario: S4.1-AC1 Từ không có dấu là thanh nhẹ
- **WHEN** từ của câu có pinyin không dấu (vd "ma") và người học chọn "Thanh nhẹ"
- **THEN** câu được chấm đúng

#### Scenario: S4.1-AC1 Nội dung dùng từ nhiều âm tiết thì bị báo lỗi
- **WHEN** người soạn tạo câu nghe chọn thanh với từ nhiều âm tiết (vd "bàba") và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Chọn xong thì hiện đáp án đúng kèm pinyin có dấu
Hệ thống SHALL chấm ngay khi người học chọn một thanh, hiện thanh đúng kèm pinyin có dấu của từ, và MUST khóa các lựa chọn.

#### Scenario: S4.1-AC2 Chọn đúng thì hiện đáp án và pinyin
- **WHEN** từ là "nǐ" và người học chọn "Thanh 3"
- **THEN** câu được chấm đúng
- **AND** màn hiện "Thanh 3" kèm pinyin "nǐ"

#### Scenario: S4.1-AC2 Chọn sai thì vẫn hiện đáp án đúng
- **WHEN** từ là "nǐ" và người học chọn "Thanh 1"
- **THEN** câu được chấm sai
- **AND** màn hiện "Thanh 3" kèm pinyin "nǐ"
- **AND** giải thích là "Đáp án đúng: thanh 3 · nǐ"

#### Scenario: S4.1-AC2 Mỗi thanh đều nhận đúng
- **WHEN** người học chọn đúng thanh cho năm câu có từ thanh 1, 2, 3, 4 và thanh nhẹ
- **THEN** cả năm câu đều được chấm đúng

#### Scenario: S4.1-AC2 Chọn xong thì khóa lựa chọn
- **WHEN** người học đã chọn một thanh
- **THEN** các lựa chọn bị khóa, bấm thêm không đổi kết quả

#### Scenario: S4.1-AC2 Câu chọn thanh không còn bị bỏ qua
- **WHEN** bài có câu nghe chọn thanh
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"
