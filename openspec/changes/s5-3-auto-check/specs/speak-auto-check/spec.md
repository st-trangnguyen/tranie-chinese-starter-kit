## ADDED Requirements

### Requirement: Chấm tự động chỉ hiện khi có mạng và trình duyệt hỗ trợ
Hệ thống SHALL hiện khu "Chấm tự động" ở câu "nói" chỉ khi thiết bị đang có mạng và trình duyệt hỗ trợ nhận diện giọng nói tiếng Trung
(`zh-CN`). Hệ thống MUST ẩn khu này khi thiếu một trong hai điều kiện.

| Có mạng | Trình duyệt hỗ trợ | Khu "Chấm tự động" |
|---|---|---|
| Có | Có | Hiện |
| Có | Không | Ẩn |
| Không | Có | Ẩn |
| Không | Không | Ẩn |

#### Scenario: S5.3-AC1 Có mạng và hỗ trợ thì hiện
- **WHEN** câu "nói" hiện ra, thiết bị có mạng và trình duyệt hỗ trợ nhận diện giọng nói tiếng Trung
- **THEN** có khu "Chấm tự động"

#### Scenario: S5.3-AC1 Không có mạng thì ẩn
- **WHEN** câu "nói" hiện ra khi thiết bị không có mạng, dù trình duyệt hỗ trợ
- **THEN** không có khu "Chấm tự động"

#### Scenario: S5.3-AC1 Trình duyệt không hỗ trợ thì ẩn
- **WHEN** câu "nói" hiện ra khi thiết bị có mạng nhưng trình duyệt không hỗ trợ nhận diện giọng nói tiếng Trung
- **THEN** không có khu "Chấm tự động"

#### Scenario: S5.3-AC1 Mất mạng giữa chừng thì ẩn
- **WHEN** khu "Chấm tự động" đang hiện và thiết bị mất mạng
- **THEN** khu "Chấm tự động" biến mất

#### Scenario: S5.3-AC1 Có mạng lại thì hiện lại
- **WHEN** khu "Chấm tự động" đang ẩn vì mất mạng và thiết bị có mạng lại
- **THEN** khu "Chấm tự động" hiện lại

#### Scenario: S5.3-AC1 Chưa ghi âm thì chưa có kết quả
- **WHEN** khu "Chấm tự động" hiện và người học chưa ghi âm
- **THEN** khu này chưa hiện chữ nhận được nào

### Requirement: Hiện chữ máy nhận được và tô chỗ khác với câu đúng
Hệ thống SHALL, sau khi người học ghi âm xong, hiện chữ máy nhận được và so với câu đúng theo từng chữ Hán. Hệ thống MUST tô màu
**và** ghi nhãn bằng chữ cho mỗi chỗ khác, và MUST bỏ qua dấu câu và khoảng trắng khi so sánh. Kết quả chỉ để tham khảo, hệ thống
MUST NOT tự chọn mức tự đánh giá thay người học. Nhãn là "Khác", "Thiếu" hoặc "Thừa".

#### Scenario: S5.3-AC2 Nhận được đúng hết
- **WHEN** câu đúng là "你好" và người học ghi âm xong, máy nhận được "你好"
- **THEN** khu "Chấm tự động" hiện "你好" không tô chỗ nào
- **AND** báo bằng chữ rằng máy nhận được khớp với câu đúng

#### Scenario: S5.3-AC2 Nhận được một chữ khác
- **WHEN** câu đúng là "你好" và máy nhận được "你号"
- **THEN** khu hiện "你号", chữ "号" tô màu và có nhãn "Khác"
- **AND** chữ "你" không tô

#### Scenario: S5.3-AC2 Thiếu chữ
- **WHEN** câu đúng là "你好吗" và máy nhận được "你好"
- **THEN** khu hiện "你好" và chỗ của "吗" tô màu có nhãn "Thiếu"

#### Scenario: S5.3-AC2 Thừa chữ
- **WHEN** câu đúng là "你好" và máy nhận được "你好吗"
- **THEN** chữ "吗" tô màu có nhãn "Thừa"

#### Scenario: S5.3-AC2 Bỏ qua dấu câu và khoảng trắng
- **WHEN** câu đúng là "你好！" và máy nhận được "你 好"
- **THEN** khu hiện không tô chỗ nào và báo khớp với câu đúng

#### Scenario: S5.3-AC2 Chỗ khác không chỉ báo bằng màu
- **WHEN** khu hiện có một chữ tô màu
- **THEN** chữ đó có nhãn bằng chữ ("Khác", "Thiếu" hoặc "Thừa") đọc được bằng trình đọc màn hình

#### Scenario: S5.3-AC2 Máy không nghe được gì
- **WHEN** người học ghi âm xong nhưng máy không nhận được chữ nào
- **THEN** khu hiện thông báo "Máy không nghe được, hãy thử lại"
- **AND** không tô sai toàn bộ câu

#### Scenario: S5.3-AC2 Ghi lại thì kết quả mới thay kết quả cũ
- **WHEN** người học đã có kết quả chấm tự động rồi ghi âm lại và dừng
- **THEN** khu chỉ hiện chữ nhận được của lần ghi mới

#### Scenario: S5.3-AC2 Không tự chọn mức đánh giá
- **WHEN** máy nhận được khớp hoàn toàn với câu đúng
- **THEN** câu chưa được chấm
- **AND** ba nút "Chưa đúng", "Gần đúng", "Đúng" vẫn chờ người học chọn

### Requirement: Không hỗ trợ thì ẩn chấm tự động, bài tập vẫn dùng bình thường
Hệ thống SHALL ẩn phần chấm tự động khi không dùng được, và MUST để người học vẫn ghi âm, nghe lại và tự đánh giá như bình thường. Hệ
thống MUST NOT hiện lỗi chặn người học làm bài.

#### Scenario: S5.3-AC3 Không hỗ trợ vẫn ghi âm và tự đánh giá được
- **WHEN** trình duyệt không hỗ trợ nhận diện giọng nói và người học ghi âm, nghe lại, rồi chọn "Đúng"
- **THEN** các bước này hoạt động bình thường
- **AND** câu được chấm theo mức "Đúng"

#### Scenario: S5.3-AC3 Offline vẫn ghi âm và tự đánh giá được
- **WHEN** thiết bị không có mạng và người học ghi âm rồi chọn "Gần đúng"
- **THEN** câu được chấm theo mức "Gần đúng"

#### Scenario: S5.3-AC3 Nhận diện bị lỗi giữa chừng
- **WHEN** nhận diện giọng nói báo lỗi trong lúc người học ghi âm
- **THEN** khu "Chấm tự động" không hiện chữ nhận được
- **AND** bản ghi vẫn nghe lại được và người học vẫn chọn mức được
