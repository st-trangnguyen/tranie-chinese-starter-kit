## ADDED Requirements

### Requirement: Cả 500 từ HSK 1 đã review nghĩa, build không còn cảnh báo S2.2
Cả 500 từ đều được đánh dấu đã review. Build không còn cảnh báo của S2.2.

Kiểm tra nội dung trên nội dung thật SHALL không in cảnh báo nào của bước kiểm tra nghĩa tiếng Việt (S2.2):

| Điều kiện cho mỗi từ HSK 1 | Cảnh báo phải không còn |
|---|---|
| Có ít nhất một nghĩa tiếng Việt | "… từ chưa có nghĩa tiếng Việt: …" |
| Được đánh dấu đã review | "… từ chưa review nghĩa: …" |
| Từ có nghĩa nằm trong danh sách HSK 1 | "ID không có trong danh sách HSK: …" |

#### Scenario: S11.3-AC1 Cả 500 từ có nghĩa và đã đánh dấu review
- **WHEN** đọc nội dung thật của dự án
- **THEN** danh sách từ HSK 1 có đúng 500 từ, và mỗi từ trong 500 từ có ít nhất một nghĩa tiếng Việt không rỗng và được đánh dấu đã review

#### Scenario: S11.3-AC1 Kiểm tra nội dung không còn cảnh báo nghĩa tiếng Việt
- **WHEN** chạy kiểm tra nội dung trên nội dung thật của dự án
- **THEN** kết quả không có cảnh báo nào của bước kiểm tra nghĩa tiếng Việt (không có dòng "chưa có nghĩa tiếng Việt", "chưa review nghĩa"
  hay "ID không có trong danh sách HSK")

#### Scenario: S11.3-AC1 Một từ bị bỏ đánh dấu review thì cảnh báo quay lại
- **WHEN** chạy kiểm tra nội dung trên bản sao nội dung thật, trong đó riêng từ "爱" được đổi thành chưa review
- **THEN** trong các cảnh báo của bước kiểm tra nghĩa tiếng Việt chỉ có đúng một cảnh báo: "1 từ chưa review nghĩa: 爱"
- **AND** cảnh báo khác của kiểm tra nội dung (ngoài bước kiểm tra nghĩa tiếng Việt) không được tính

Scenario này chứng minh Scenario "Kiểm tra nội dung không còn cảnh báo nghĩa tiếng Việt" không pass tầm thường: bước kiểm tra
thật sự chạy trên nội dung thật và bắt được từ chưa review.

### Requirement: Người học thấy nghĩa đã review
Nội dung app SHALL được sinh lại từ nghĩa đã review: mỗi từ trong nội dung app MUST được đánh dấu đã review, nghĩa của từ đó MUST
trùng nghĩa đã review, cùng thứ tự, và kiểm tra nội dung MUST không báo lỗi nội dung app lệch nguồn. Requirement này cũng là hàng
rào chống hồi quy: lần sinh lại nội dung sau không được làm mất nghĩa đã review.

#### Scenario: S11.3-AC1 Nội dung app dùng đúng nghĩa đã review
- **WHEN** chạy kiểm tra nội dung trên nội dung thật của dự án sau khi review
- **THEN** không có lỗi nội dung app lệch nguồn
- **AND** nội dung app có đúng 500 từ HSK 1, mỗi từ được đánh dấu đã review
- **AND** với mỗi từ trong 500 từ, nghĩa trong nội dung app trùng nghĩa đã review, cùng thứ tự
