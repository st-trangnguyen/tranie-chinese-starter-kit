## ADDED Requirements

### Requirement: Công tắc "Nghe chậm" cho biết trạng thái không chỉ bằng màu
Hệ thống SHALL hiện trạng thái công tắc "Nghe chậm" bằng tín hiệu không phụ thuộc màu. Khi "Nghe chậm" bật, công tắc hiện dấu tick
nhìn thấy được; khi tắt thì không có. Tên truy cập của công tắc vẫn là "Nghe chậm"; trạng thái báo cho trình đọc màn hình MUST phản ánh
đúng bật/tắt. Dấu tick nằm trước chữ, MUST NOT được đọc thành chữ; màu nhấn hiện có lúc bật được giữ.

#### Scenario: S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ
- **WHEN** người học bật "Nghe chậm" ở một câu nghe
- **THEN** công tắc hiện dấu tick ngay trước chữ "Nghe chậm"
- **AND** dấu tick và chữ "Nghe chậm" nằm cùng một hàng
- **AND** viền, nền và chữ của công tắc vẫn đổi sang màu nhấn như lúc bật hiện nay

#### Scenario: S4.4-AC3 Tắt thì không có dấu tick
- **WHEN** người học mở bài và công tắc "Nghe chậm" đang tắt
- **THEN** công tắc chỉ hiện chữ "Nghe chậm", không có dấu tick

#### Scenario: S4.4-AC3 Bật rồi tắt thì dấu tick biến mất
- **WHEN** người học bật "Nghe chậm" rồi tắt lại
- **THEN** dấu tick không còn trên công tắc

#### Scenario: S4.4-AC3 Bật bằng bàn phím cũng hiện dấu tick
- **WHEN** người học dùng phím Tab đưa focus tới "Nghe chậm" rồi nhấn phím Space (hoặc Enter)
- **THEN** công tắc chuyển sang bật và hiện dấu tick

#### Scenario: S4.4-AC3 Dấu tick giữ qua các câu trong bài
- **WHEN** người học bật "Nghe chậm" ở câu 1 rồi sang câu 2
- **THEN** công tắc ở câu 2 vẫn hiện dấu tick

#### Scenario: S4.4-AC3 Tên truy cập và trạng thái cho trình đọc màn hình
- **WHEN** trình đọc màn hình đọc công tắc "Nghe chậm" lúc tắt rồi lúc bật
- **THEN** tên của công tắc ở cả hai lúc đều đúng là "Nghe chậm", không có thêm chữ nào từ dấu tick
- **AND** trạng thái báo là đang tắt khi tắt và đang bật khi bật

### Requirement: Dấu tick "Nghe chậm" dễ thấy ở thang xám, giao diện sáng và tối
Ở thang xám (light và dark), hệ thống SHALL cho phân biệt được bật/tắt mà không cần màu. Tương phản icon/chữ so với nền công tắc MUST
≥ 3:1 (thành phần UI) / ≥ 4.5:1 (chữ); hệ thống MUST tôn trọng giảm chuyển động.

#### Scenario: S4.4-AC3 Phân biệt bật và tắt ở thang xám, giao diện sáng và tối
- **WHEN** công tắc "Nghe chậm" hiển thị lần lượt với giao diện sáng và giao diện tối, lúc tắt rồi lúc bật
- **THEN** lúc bật dấu tick hiện trước chữ và có độ tương phản với nền công tắc ít nhất 3:1 (tương phản tính theo độ sáng nên giữ
  nguyên ở thang xám)
- **AND** lúc tắt không có dấu tick

#### Scenario: S4.4-AC3 Tương phản của dấu tick và chữ
- **WHEN** công tắc "Nghe chậm" hiển thị ở giao diện sáng và giao diện tối, con trỏ không nằm trên công tắc
- **THEN** nền công tắc dùng để đo là nền nhấn nhạt của công tắc lúc bật, và là nền màn phía sau công tắc lúc tắt (công tắc tắt
  không có nền riêng)
- **AND** dấu tick (lúc bật) có độ tương phản với nền công tắc ít nhất 3:1
- **AND** chữ "Nghe chậm" có độ tương phản với nền công tắc ít nhất 4.5:1 ở cả lúc tắt và lúc bật

#### Scenario: S4.4-AC3 Không giảm chuyển động thì dấu tick vẫn hiện ngay
- **WHEN** thiết bị không bật chế độ giảm chuyển động và người học bật "Nghe chậm" rồi tắt lại
- **THEN** dấu tick hiện ngay khi bật và mất ngay khi tắt, không có hiệu ứng mờ dần, trượt hay phóng to

#### Scenario: S4.4-AC3 Giảm chuyển động thì dấu tick hiện ngay
- **WHEN** thiết bị bật chế độ giảm chuyển động và người học bật "Nghe chậm"
- **THEN** dấu tick hiện ngay, không có hiệu ứng chuyển động hay chuyển màu dần
