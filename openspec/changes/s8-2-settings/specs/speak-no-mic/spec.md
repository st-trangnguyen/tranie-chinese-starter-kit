## MODIFIED Requirements

### Requirement: Không ghi âm được thì chuyển sang "đọc to rồi tự chấm"
Hệ thống SHALL chuyển câu "nói" sang chế độ "đọc to rồi tự chấm" khi không ghi âm được: người học đọc to chữ hiện trên màn rồi tự
chọn mức. Hệ thống MUST ẩn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động", MUST giữ "Nghe mẫu" và 3 nút tự đánh giá, và MUST tính điểm
như chế độ bình thường. Chế độ này MUST NOT chặn người học làm tiếp bài. Pinyin của nội dung cần đọc MUST hiện theo tùy chọn "Hiện pinyin"
trong Cài đặt, như ở chế độ bình thường.

#### Scenario: S5.4-AC2 Chuyển chế độ khi không ghi âm được
- **WHEN** người học bấm "Ghi âm" nhưng không ghi âm được
- **THEN** màn hiện lời nhắc đọc to chữ trên màn rồi tự chấm
- **AND** không còn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động"

#### Scenario: S5.4-AC2 Vẫn nghe mẫu và thấy chữ để đọc
- **WHEN** "Hiện pinyin" trong Cài đặt đang bật và câu "nói" đang ở chế độ "đọc to rồi tự chấm"
- **THEN** có nút "Nghe mẫu" bấm được
- **AND** màn hiện chữ Hán, pinyin và nghĩa của từ (hoặc câu)

#### Scenario: S8.2-AC3 Đọc to rồi tự chấm khi tắt pinyin
- **WHEN** "Hiện pinyin" trong Cài đặt đang tắt và câu "nói" đang ở chế độ "đọc to rồi tự chấm"
- **THEN** màn hiện chữ Hán và nghĩa của từ (hoặc câu), không hiện pinyin
- **AND** có nút "Nghe mẫu" bấm được

#### Scenario: S5.4-AC2 Vẫn tự đánh giá và tính điểm
- **WHEN** câu "nói" đang ở chế độ "đọc to rồi tự chấm" và người học chọn "Đúng"
- **THEN** câu được chấm đúng và tính vào điểm của bài như bình thường

#### Scenario: S5.4-AC2 Chọn Chưa đúng thì tính sai như thường
- **WHEN** câu "nói" đang ở chế độ "đọc to rồi tự chấm" và người học chọn "Chưa đúng"
- **THEN** câu được chấm sai và hiện chữ, pinyin, nghĩa của câu mẫu

#### Scenario: S5.4-AC2 Giữ chế độ cho các câu nói sau trong bài
- **WHEN** người học ở chế độ "đọc to rồi tự chấm" ở câu "nói" đầu rồi sang câu "nói" kế trong cùng bài
- **THEN** câu mới cũng ở chế độ "đọc to rồi tự chấm"
- **AND** có nút "Thử lại ghi âm"

#### Scenario: S5.4-AC2 Thử lại ghi âm thì quay về chế độ ghi âm
- **WHEN** người học bấm "Thử lại ghi âm" và micro hoạt động
- **THEN** câu "nói" hiện nút "Ghi âm" và "Nghe bản ghi" như bình thường

#### Scenario: S5.4-AC2 Mở bài mới thì kiểm tra lại mic
- **WHEN** người học đã ở chế độ "đọc to rồi tự chấm", thoát bài rồi mở bài khác có câu "nói"
- **THEN** câu "nói" mới hiện nút "Ghi âm" như bình thường
