# sound-pair Specification

## Purpose
nghe một âm, chọn đúng âm trong cặp, rồi nghe lại cả hai để so sánh.

## Requirements

### Requirement: Có các cặp âm dễ nhầm
Hệ thống SHALL hiện được câu phân biệt cặp âm cho mọi loại cặp dễ nhầm, gồm zh/z, q/ch, an/ang và ü/u. Mỗi câu có đúng 2 lựa chọn ghi pinyin
của hai từ trong cặp, thứ tự xáo ngẫu nhiên mỗi lần câu hiện.

| Cặp | Khác nhau ở | Ví dụ |
|---|---|---|
| zh/z | phụ âm đầu | zhǐ / zǐ |
| q/ch | phụ âm đầu | qī / chī |
| an/ang | vận mẫu | fàn / fàng |
| ü/u | nguyên âm | nǚ / nǔ |

#### Scenario: S4.2-AC1 Câu cặp âm có đúng 2 lựa chọn
- **WHEN** câu phân biệt cặp âm hiện ra
- **THEN** màn hiện đúng 2 lựa chọn, ghi pinyin của hai từ trong cặp
- **AND** có nút "Nghe"

#### Scenario: S4.2-AC1 Mỗi loại cặp đều chấm được
- **WHEN** người học làm bốn câu thuộc các cặp zh/z, q/ch, an/ang, ü/u và chọn đúng cả bốn
- **THEN** cả bốn câu đều được chấm đúng

#### Scenario: S4.2-AC1 Thứ tự lựa chọn không cố định
- **WHEN** cùng một câu cặp âm hiện ra nhiều lần
- **THEN** đáp án không luôn ở cùng một vị trí; có lần ở trước, có lần ở sau

### Requirement: Nghe một âm, chọn đúng âm trong cặp, rồi nghe lại cả hai để so sánh
Hệ thống SHALL cho người học nghe một âm rồi chọn âm đó trong cặp. Trước khi chấm hệ thống MUST NOT cho nghe riêng từng lựa chọn.
Sau khi chấm hệ thống SHALL cho nghe từng âm trong cặp để so sánh.

| Thời điểm | Nghe được |
|---|---|
| Trước khi chấm | Chỉ âm của câu hỏi |
| Sau khi chấm | Âm của câu hỏi và từng âm trong cặp |

#### Scenario: S4.2-AC2 Chọn đúng âm
- **WHEN** câu hỏi là âm "sì" trong cặp "sì / shì" và người học chọn "sì"
- **THEN** câu được chấm đúng

#### Scenario: S4.2-AC2 Chọn sai âm
- **WHEN** câu hỏi là âm "sì" trong cặp "sì / shì" và người học chọn "shì"
- **THEN** câu được chấm sai
- **AND** giải thích nêu âm đúng là "sì"

#### Scenario: S4.2-AC2 Trước khi chấm không nghe riêng từng lựa chọn
- **WHEN** câu vừa hiện và người học chưa chọn
- **THEN** chỉ có một nút nghe, phát âm của câu hỏi
- **AND** không có nút nghe riêng cho từng lựa chọn

#### Scenario: S4.2-AC2 Sau khi chấm nghe lại được cả hai âm
- **WHEN** người học đã chọn và câu đã được chấm
- **THEN** màn hiện nút "Nghe sì" và "Nghe shì"
- **AND** mỗi nút phát âm tương ứng, bấm bao nhiêu lần cũng được

#### Scenario: S4.2-AC2 Chọn xong thì khóa lựa chọn
- **WHEN** người học đã chọn một lựa chọn
- **THEN** hai lựa chọn bị khóa, bấm thêm không đổi kết quả

#### Scenario: S4.2-AC2 Câu cặp âm không còn bị bỏ qua
- **WHEN** bài có câu phân biệt cặp âm
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"
