# speak-no-mic Specification

## Purpose
hướng dẫn cấp quyền mic và chế độ "đọc to rồi tự chấm" khi không ghi âm được.

## Requirements

### Requirement: Hiện hướng dẫn cấp quyền mic khi không ghi âm được
Hệ thống SHALL hiện hướng dẫn khi người học không ghi âm được, theo đúng lý do. Hệ thống MUST NOT hiện hướng dẫn khi ghi âm bình thường.

| Lý do | Hướng dẫn hiện ra | Có nút "Thử lại" |
|---|---|---|
| Quyền micro bị chặn | Các bước cấp quyền micro cho trang trong trình duyệt | Có |
| Không tìm thấy micro | Kiểm tra đã cắm và bật micro | Có |
| Trình duyệt không hỗ trợ ghi âm | Trình duyệt này không ghi âm được, gợi ý dùng trình duyệt khác | Không |

#### Scenario: S5.4-AC1 Ghi âm bình thường thì không hiện hướng dẫn
- **WHEN** người học bấm "Ghi âm" và micro hoạt động
- **THEN** màn không hiện hướng dẫn cấp quyền

#### Scenario: S5.4-AC1 Quyền micro bị chặn
- **WHEN** người học bấm "Ghi âm" nhưng quyền micro bị chặn (từ chối hoặc đã chặn từ trước)
- **THEN** màn hiện hướng dẫn cấp quyền micro
- **AND** có nút "Thử lại"

#### Scenario: S5.4-AC1 Không tìm thấy micro
- **WHEN** người học bấm "Ghi âm" nhưng thiết bị không có micro
- **THEN** màn hiện hướng dẫn kiểm tra micro
- **AND** có nút "Thử lại"

#### Scenario: S5.4-AC1 Trình duyệt không hỗ trợ ghi âm
- **WHEN** người học bấm "Ghi âm" trên trình duyệt không hỗ trợ ghi âm
- **THEN** màn báo trình duyệt này không ghi âm được
- **AND** không có nút "Thử lại"

#### Scenario: S5.4-AC1 Cấp quyền rồi thử lại thì ghi âm được
- **WHEN** người học thấy hướng dẫn vì quyền micro bị chặn, cấp quyền rồi bấm "Thử lại"
- **THEN** hướng dẫn biến mất
- **AND** màn ghi âm được bình thường (có nút "Ghi âm")

#### Scenario: S5.4-AC1 Thử lại mà vẫn bị chặn
- **WHEN** người học bấm "Thử lại" nhưng quyền micro vẫn bị chặn
- **THEN** màn vẫn hiện hướng dẫn cấp quyền

#### Scenario: S5.4-AC1 Hướng dẫn đọc được bằng trình đọc màn hình
- **WHEN** màn hiện hướng dẫn cấp quyền micro
- **THEN** hướng dẫn được thông báo cho trình đọc màn hình và focus không bị mất khỏi màn

### Requirement: Không ghi âm được thì chuyển sang "đọc to rồi tự chấm"
Hệ thống SHALL chuyển câu "nói" sang chế độ "đọc to rồi tự chấm" khi không ghi âm được: người học đọc to chữ hiện trên màn rồi tự
chọn mức. Hệ thống MUST ẩn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động", MUST giữ "Nghe mẫu" và 3 nút tự đánh giá, và MUST tính điểm
như chế độ bình thường. Chế độ này MUST NOT chặn người học làm tiếp bài.

#### Scenario: S5.4-AC2 Chuyển chế độ khi không ghi âm được
- **WHEN** người học bấm "Ghi âm" nhưng không ghi âm được
- **THEN** màn hiện lời nhắc đọc to chữ trên màn rồi tự chấm
- **AND** không còn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động"

#### Scenario: S5.4-AC2 Vẫn nghe mẫu và thấy chữ để đọc
- **WHEN** câu "nói" đang ở chế độ "đọc to rồi tự chấm"
- **THEN** có nút "Nghe mẫu" bấm được
- **AND** màn hiện chữ Hán, pinyin và nghĩa của từ (hoặc câu)

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
