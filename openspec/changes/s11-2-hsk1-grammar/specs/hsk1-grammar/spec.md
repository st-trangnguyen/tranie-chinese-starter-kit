## ADDED Requirements

### Requirement: Mọi điểm ngữ pháp cấp 1 có trong ít nhất một bài Ngữ pháp
Mọi điểm ngữ pháp cấp 1 đều xuất hiện trong ít nhất một bài Ngữ pháp. Luật độ phủ ngữ pháp của kiểm tra nội dung SHALL tính điểm
theo bảng; điểm chưa có thì luật MUST liệt kê (số thứ tự, tên) và kiểm tra kết thúc không thành công.

| Thẻ dạy điểm nằm ở | Tính |
|---|---|
| Bài "Ngữ pháp" của chủ đề HSK 1 trên lộ trình | Có |
| Bài loại khác của chủ đề HSK 1 | Không |
| Bài không nằm trên lộ trình | Không |

#### Scenario: S11.2-AC1 Nội dung phát hành phủ đủ ngữ pháp cấp 1
- **WHEN** chạy kiểm tra nội dung trên nội dung phát hành của app
- **THEN** kiểm tra kết thúc thành công, không báo điểm ngữ pháp cấp 1 nào còn thiếu
- **AND** mỗi điểm trong 48 điểm của danh sách chuẩn có ít nhất một thẻ ngữ pháp trong bài "Ngữ pháp" của một chủ đề HSK 1 trên lộ trình

#### Scenario: S11.2-AC1 Nội dung mẫu phủ đủ thì luật độ phủ không báo lỗi
- **WHEN** chạy luật độ phủ ngữ pháp trên nội dung mẫu có danh sách chuẩn 3 điểm, mỗi điểm có một thẻ ngữ pháp trong bài "Ngữ pháp" của
  một chủ đề trên lộ trình, điểm 2 được dạy ở hai chủ đề
- **THEN** luật độ phủ ngữ pháp không báo lỗi nào

#### Scenario: S11.2-AC1 Thiếu điểm thì luật độ phủ báo đủ các điểm thiếu
- **WHEN** chạy luật độ phủ ngữ pháp trên nội dung mẫu có danh sách chuẩn 3 điểm nhưng chỉ điểm 1 có thẻ ngữ pháp trong bài "Ngữ pháp"
- **THEN** luật độ phủ ngữ pháp báo lỗi nêu đủ điểm 2 và điểm 3 (số thứ tự và tên)
- **AND** lỗi không nêu điểm 1

#### Scenario: S11.2-AC1 Điểm chỉ có trong bài loại khác thì không tính
- **WHEN** chạy luật độ phủ ngữ pháp trên nội dung mẫu có danh sách chuẩn 3 điểm, điểm 3 chỉ được dạy bằng thẻ ngữ pháp trong bài
  "Hội thoại" của một chủ đề trên lộ trình, điểm 1 và 2 có trong bài "Ngữ pháp"
- **THEN** luật độ phủ ngữ pháp báo lỗi nêu điểm 3 là còn thiếu
- **AND** lỗi không nêu điểm 1 và điểm 2

#### Scenario: S11.2-AC1 Điểm chỉ có trong bài không nằm trên lộ trình thì không tính
- **WHEN** chạy luật độ phủ ngữ pháp trên nội dung mẫu có danh sách chuẩn 3 điểm, điểm 3 chỉ được dạy bằng thẻ ngữ pháp trong một bài
  không nằm trên lộ trình, điểm 1 và 2 có trong bài "Ngữ pháp" của chủ đề trên lộ trình
- **THEN** luật độ phủ ngữ pháp báo lỗi nêu điểm 3 là còn thiếu
- **AND** lỗi không nêu điểm 1 và điểm 2

### Requirement: Danh sách chuẩn có đủ 48 điểm
Danh sách chuẩn điểm ngữ pháp cấp 1 SHALL có đúng 48 điểm theo phụ lục ngữ pháp cấp 1 của chuẩn HSK 3.0 (GF 0025-2021), số thứ tự liền
nhau từ 1 đến 48 (không trùng, không nhảy số), điểm nào cũng có tên. Vi phạm điều nào thì luật danh sách chuẩn của kiểm tra nội dung MUST
báo lỗi nêu đúng vi phạm đó (số điểm hiện có và cần 48; số trùng; số ngoài 1–48 và số còn thiếu; số của điểm thiếu tên) và kiểm tra kết
thúc không thành công.

#### Scenario: S11.2-AC1 Danh sách chuẩn phát hành có 48 điểm
- **WHEN** chạy kiểm tra nội dung trên nội dung phát hành của app
- **THEN** kiểm tra không báo lỗi nào về danh sách chuẩn điểm ngữ pháp cấp 1
- **AND** danh sách có 48 điểm, số thứ tự từ 1 đến 48, không trùng, điểm nào cũng có tên

#### Scenario: S11.2-AC1 Danh sách thiếu điểm thì báo lỗi
- **WHEN** chạy luật danh sách chuẩn trên danh sách chỉ có 47 điểm, số thứ tự từ 1 đến 47, đủ tên
- **THEN** luật danh sách chuẩn báo lỗi nêu danh sách có 47 điểm, cần 48

#### Scenario: S11.2-AC1 Danh sách trùng số thứ tự thì báo lỗi
- **WHEN** chạy luật danh sách chuẩn trên danh sách 48 điểm đủ tên mà hai điểm cùng số thứ tự 5 (không có số 6)
- **THEN** luật danh sách chuẩn báo lỗi nêu số thứ tự 5 bị trùng

#### Scenario: S11.2-AC1 Danh sách nhảy số thì báo lỗi
- **WHEN** chạy luật danh sách chuẩn trên danh sách 48 điểm đủ tên, số thứ tự từ 1 đến 47 và 50
- **THEN** luật danh sách chuẩn báo lỗi nêu số thứ tự 50 nằm ngoài 1–48 và thiếu số 48

#### Scenario: S11.2-AC1 Điểm thiếu tên thì báo lỗi
- **WHEN** chạy luật danh sách chuẩn trên danh sách 48 điểm, số thứ tự từ 1 đến 48, mà điểm số 7 để trống tên
- **THEN** luật danh sách chuẩn báo lỗi nêu điểm số 7 thiếu tên

### Requirement: Thẻ ngữ pháp chỉ dạy điểm có trong danh sách chuẩn
Người soạn ghi trên thẻ ngữ pháp thẻ đó dạy (những) điểm nào trong danh sách chuẩn; một thẻ có thể dạy một hoặc vài điểm. Luật điểm của
thẻ áp cho mọi thẻ ngữ pháp ở mọi bài (mọi loại bài, mọi giai đoạn, cả bài không nằm trên lộ trình) và MUST báo lỗi khi thẻ dạy điểm
không có trong danh sách chuẩn, nêu bài, câu của thẻ và điểm sai; kiểm tra nội dung khi đó kết thúc không thành công.

#### Scenario: S11.2-AC1 Thẻ dạy hai điểm chuẩn thì cả hai được tính
- **WHEN** chạy luật độ phủ ngữ pháp và luật điểm của thẻ trên nội dung mẫu có danh sách chuẩn 2 điểm và một thẻ ngữ pháp duy nhất trong
  bài "Ngữ pháp" của chủ đề trên lộ trình, thẻ dạy cả điểm 1 và điểm 2
- **THEN** luật độ phủ ngữ pháp không báo điểm nào còn thiếu
- **AND** luật điểm của thẻ không báo lỗi nào

#### Scenario: S11.2-AC1 Thẻ trong bài Ngữ pháp dạy điểm không có trong danh sách thì báo lỗi
- **WHEN** chạy luật điểm của thẻ trên nội dung mẫu có danh sách chuẩn 3 điểm và một thẻ ngữ pháp trong bài "Ngữ pháp" của chủ đề HSK 1
  dạy điểm số 99
- **THEN** luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó và điểm số 99 không có trong danh sách chuẩn

#### Scenario: S11.2-AC1 Thẻ trong bài Hội thoại dạy điểm không có trong danh sách thì báo lỗi
- **WHEN** chạy luật điểm của thẻ trên nội dung mẫu có danh sách chuẩn 3 điểm và một thẻ ngữ pháp trong bài "Hội thoại" của chủ đề HSK 1
  dạy điểm số 99
- **THEN** luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó và điểm số 99 không có trong danh sách chuẩn

#### Scenario: S11.2-AC1 Nội dung phát hành không có thẻ dạy điểm lạ
- **WHEN** chạy kiểm tra nội dung trên nội dung phát hành của app
- **THEN** luật điểm của thẻ không báo lỗi nào

### Requirement: Thẻ trong bài Ngữ pháp HSK 1 phải dạy ít nhất một điểm chuẩn
Mỗi thẻ ngữ pháp trong bài "Ngữ pháp" của chủ đề HSK 1 SHALL ghi dạy ít nhất một điểm trong danh sách chuẩn. Thẻ không ghi điểm nào thì
luật điểm của thẻ MUST báo lỗi nêu bài và câu của thẻ, và kiểm tra nội dung kết thúc không thành công. Thẻ ngữ pháp ở bài khác (bài loại
khác của chủ đề HSK 1, bài ngoài giai đoạn HSK 1 như Nhập môn) được phép không ghi điểm.

#### Scenario: S11.2-AC1 Thẻ trong bài Ngữ pháp không dạy điểm nào thì báo lỗi
- **WHEN** chạy luật điểm của thẻ trên nội dung mẫu có một thẻ ngữ pháp trong bài "Ngữ pháp" của chủ đề HSK 1 không ghi dạy điểm chuẩn nào
- **THEN** luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó

#### Scenario: S11.2-AC1 Thẻ ngoài bài Ngữ pháp không ghi điểm thì không báo lỗi
- **WHEN** chạy luật điểm của thẻ trên nội dung mẫu có một thẻ ngữ pháp trong bài "Hội thoại" của chủ đề HSK 1 và một thẻ ngữ pháp trong
  bài của giai đoạn Nhập môn, cả hai không ghi dạy điểm chuẩn nào
- **THEN** luật điểm của thẻ không báo lỗi nào
