## ADDED Requirements

### Requirement: Có 3 mức tự đánh giá: Chưa đúng, Gần đúng, Đúng
Hệ thống SHALL hiện cho mỗi câu "nói" ba nút tự đánh giá "Chưa đúng", "Gần đúng" và "Đúng". Hệ thống MUST cho chọn mức mà không bắt buộc
ghi âm trước, và MUST hiện chữ, pinyin, nghĩa của câu để người học đọc.

#### Scenario: S5.2-AC1 Câu nói hiện nội dung để đọc và 3 mức
- **WHEN** một câu "nói" vừa hiện ra
- **THEN** màn hiện chữ Hán, pinyin và nghĩa tiếng Việt của từ (hoặc câu) cần nói
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

### Requirement: Mức đánh giá được tính vào điểm của bài
Hệ thống SHALL tính mỗi câu "nói" vào điểm của bài theo mức người học chọn. Hệ thống MUST tính "Đúng" là câu đúng, và MUST tính
"Gần đúng" và "Chưa đúng" là câu sai.

| Mức đã chọn | Tính vào điểm | Giải thích hiện ra |
|---|---|---|
| Đúng | Câu đúng | Không |
| Gần đúng | Câu sai | Chữ, pinyin, nghĩa của câu mẫu |
| Chưa đúng | Câu sai | Chữ, pinyin, nghĩa của câu mẫu |

#### Scenario: S5.2-AC2 Chọn Đúng thì tính câu đúng
- **WHEN** người học chọn "Đúng" ở câu "nói" duy nhất của một bài
- **THEN** câu được báo đúng và không hiện giải thích
- **AND** màn tổng kết hiện điểm "100%" và "Sai 0 câu"

#### Scenario: S5.2-AC2 Chọn Gần đúng thì tính câu sai
- **WHEN** người học chọn "Gần đúng" ở câu "nói" duy nhất của một bài
- **THEN** câu được báo sai và hiện chữ, pinyin, nghĩa của câu mẫu
- **AND** màn tổng kết hiện điểm "0%" và "Sai 1 câu"

#### Scenario: S5.2-AC2 Chọn Chưa đúng thì tính câu sai
- **WHEN** người học chọn "Chưa đúng" ở câu "nói" duy nhất của một bài
- **THEN** câu được báo sai và hiện chữ, pinyin, nghĩa của câu mẫu
- **AND** màn tổng kết hiện điểm "0%" và "Sai 1 câu"

#### Scenario: S5.2-AC2 Câu nói cộng chung với các câu khác
- **WHEN** một bài có 4 câu, người học trả lời đúng 2 câu thường rồi chọn "Đúng" ở câu "nói" thứ ba và "Chưa đúng" ở câu "nói" thứ tư
- **THEN** màn tổng kết hiện điểm "75%", "Đúng 3 / 4 câu" và "Sai 1 câu"

#### Scenario: S5.2-AC2 Bài kiểm tra tính câu nói như câu thường
- **WHEN** bài kiểm tra cuối chủ đề có 5 câu và người học chọn "Đúng" ở 4 câu, "Gần đúng" ở 1 câu
- **THEN** điểm là "80%" và bài kiểm tra được ghi nhận là đã xong
