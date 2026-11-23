## MODIFIED Requirements

### Requirement: Có 3 mức tự đánh giá: Chưa đúng, Gần đúng, Đúng
Hệ thống SHALL hiện cho mỗi câu "nói" ba nút tự đánh giá "Chưa đúng", "Gần đúng" và "Đúng". Hệ thống MUST cho chọn mức mà không bắt buộc
ghi âm trước, và MUST hiện chữ, nghĩa của câu để người học đọc. Pinyin của câu MUST hiện khi "Hiện pinyin" trong Cài đặt đang bật và
MUST NOT hiện khi tắt; phần giải thích sau khi chấm sai vẫn có pinyin.

#### Scenario: S5.2-AC1 Câu nói hiện nội dung để đọc và 3 mức
- **WHEN** "Hiện pinyin" trong Cài đặt đang bật và một câu "nói" vừa hiện ra
- **THEN** màn hiện chữ Hán, pinyin và nghĩa tiếng Việt của từ (hoặc câu) cần nói
- **AND** có ba nút "Chưa đúng", "Gần đúng", "Đúng"

#### Scenario: S8.2-AC3 Câu nói khi tắt pinyin
- **WHEN** "Hiện pinyin" trong Cài đặt đang tắt và một câu "nói" vừa hiện ra
- **THEN** màn hiện chữ Hán và nghĩa tiếng Việt của từ (hoặc câu) cần nói, không hiện pinyin
- **AND** có ba nút "Chưa đúng", "Gần đúng", "Đúng"

#### Scenario: S5.2-AC1 Chưa chọn mức thì chưa chấm
- **WHEN** người học chưa chọn mức nào
- **THEN** câu chưa có kết quả
- **AND** chưa có nút "Tiếp tục"

#### Scenario: S5.2-AC1 Chọn mức mà chưa ghi âm
- **WHEN** người học chưa ghi âm và chọn "Đúng"
- **THEN** câu được chấm theo mức đã chọn

#### Scenario: S5.2-AC1 Chọn mức thì câu được chấm ngay
- **WHEN** người học chọn một mức
- **THEN** màn báo kết quả của câu bằng chữ
- **AND** có nút "Tiếp tục"

#### Scenario: S5.2-AC1 Đã chọn thì không đổi được
- **WHEN** người học đã chọn "Gần đúng" rồi bấm "Đúng"
- **THEN** kết quả của câu vẫn theo "Gần đúng"
- **AND** ba nút đánh giá không bấm được nữa

#### Scenario: S5.2-AC1 Mức đã chọn được báo bằng chữ
- **WHEN** người học chọn "Gần đúng"
- **THEN** màn cho biết nút "Gần đúng" đang được chọn, không chỉ bằng màu

#### Scenario: S5.2-AC1 Chọn bằng bàn phím
- **WHEN** người học chuyển focus tới nút "Đúng" bằng phím Tab và bấm Enter
- **THEN** câu được chấm theo mức "Đúng"

