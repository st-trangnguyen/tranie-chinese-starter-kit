## ADDED Requirements

### Requirement: Sao lưu giữ giới hạn ôn tập và số đã chấm từng ngày
Yêu cầu bổ sung cho S9.3 theo hợp đồng sao lưu S8.5 (file chứa mọi lựa chọn trong Cài đặt và tiến độ từng ngày). File xuất SHALL chứa giới
hạn "Thẻ mới mỗi ngày", "Lượt ôn mỗi ngày" và số thẻ mới, số lượt ôn đã chấm của từng ngày; nhập file đó và bấm "Ghi đè" MUST cho lại đúng
các giá trị này. Như S8.5, ghi đè toàn bộ: số đã chấm của các ngày trên máy mà file không có SHALL không còn.

#### Scenario: S9.3-AC2 (bổ sung) Xuất rồi nhập ở máy khác giữ giới hạn
- **WHEN** ở máy A người học chọn "10 thẻ" và "100 lượt" trong Cài đặt rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng, giới hạn đang là "20 thẻ" và "200 lượt") người học nhập file đó và bấm "Ghi đè"
- **THEN** màn Cài đặt của máy B hiện "10 thẻ" và "100 lượt" đang được chọn

#### Scenario: S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay
- **WHEN** ở máy A giới hạn là "20 thẻ", hôm nay người học đã chấm 15 thẻ mới, máy A còn ít nhất 10 thẻ "mới" và không có thẻ đã chấm nào
  đến hạn, rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng, hôm nay chưa chấm thẻ nào) người học nhập file đó trong cùng ngày, bấm "Ghi đè", rồi mở màn ôn tập
  trước khi thẻ nào trong file tới hạn
- **THEN** màn hiện "Thẻ 1 / 5"

### Requirement: File sao lưu chưa có giới hạn ôn tập vẫn nhập được
Yêu cầu bổ sung cho S9.3. Hệ thống SHALL nhận như file hợp lệ cả hai loại file do bản app trước S9.3 xuất: file trước S9.1 (chưa có thẻ,
nhập như S9.1 "File sao lưu xuất trước khi có thẻ vẫn nhập được") và file từ S9.1 tới trước S9.3 (có thẻ). Bấm "Ghi đè" với cả hai loại thì
giới hạn về "20 thẻ" và "200 lượt", số thẻ mới và số lượt ôn đã chấm của mọi ngày là 0.

#### Scenario: S9.3-AC2 (bổ sung) Nhập file sao lưu bản S9.1 thì giới hạn về mặc định
- **WHEN** máy đang chọn "50 thẻ" và "500 lượt"; người học chọn file tiến độ do bản app từ S9.1 tới trước S9.3 xuất rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** màn Cài đặt hiện "20 thẻ" và "200 lượt" đang được chọn

#### Scenario: S9.3-AC1 (bổ sung) Nhập file sao lưu bản S9.1 thì số đã chấm hôm nay là 0
- **WHEN** máy B hôm nay đã chấm 20 thẻ mới với giới hạn "20 thẻ"; người học chọn file tiến độ do bản app từ S9.1 tới trước S9.3 xuất trong
  hôm nay, có 25 thẻ "mới" và không có thẻ đã chấm nào đến hạn, bấm "Ghi đè" rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 20"

#### Scenario: S9.3-AC2 (bổ sung) Nhập file sao lưu bản trước S9.1 thì giới hạn về mặc định
- **WHEN** máy đang chọn "50 thẻ" và "500 lượt"; người học chọn file tiến độ do bản app trước S9.1 xuất (chưa có thẻ ôn tập) rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** màn Cài đặt hiện "20 thẻ" và "200 lượt" đang được chọn

### Requirement: File sao lưu từ S9.3 có phiên bản định dạng mới
Yêu cầu bổ sung cho S9.3. File do bản app từ S9.3 xuất SHALL ghi phiên bản định dạng cao hơn file của bản S9.1, để bản app trước S9.3 gặp
file này thì báo "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại." (S8.5) thay vì nhập mà bỏ mất giới hạn và số đã
chấm.

#### Scenario: S9.3-AC2 (bổ sung) File xuất từ S9.3 ghi phiên bản định dạng cao hơn file bản S9.1
- **WHEN** (unit test của định dạng file) người học bấm "Xuất tiến độ" ở bản app từ S9.3
- **THEN** phiên bản định dạng ghi trong file cao hơn phiên bản định dạng của file do bản S9.1 xuất

### Requirement: File có giới hạn hoặc số đã chấm sai bị từ chối
Yêu cầu bổ sung cho S9.3, như S8.5. Hệ thống SHALL xử lý file theo bảng; từ chối thì báo "File tiến độ bị hỏng, không nhập được." và tiến
độ, cài đặt trên máy MUST NOT đổi.

| Trong file | Kết quả |
|---|---|
| Thiếu số thẻ mới / số lượt ôn của một ngày | Nhận file, số thiếu là 0 |
| Số đó âm, có phần lẻ, hoặc không phải số | Từ chối cả file |
| Giới hạn không thuộc các mức trong Cài đặt | Từ chối cả file |

#### Scenario: S9.3-AC2 (bổ sung) File có giới hạn thẻ mới không hợp lệ bị từ chối
- **WHEN** máy đang chọn "20 thẻ"; người học chọn file tiến độ có giới hạn thẻ mới là 25 (không có trong các mức của Cài đặt)
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và không hiện hộp xác nhận
- **AND** màn Cài đặt vẫn hiện "20 thẻ" đang được chọn

#### Scenario: S9.3-AC1 (bổ sung) File có số lượt ôn âm bị từ chối
- **WHEN** người học chọn file tiến độ có một ngày với số lượt ôn đã chấm là -3
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ trên máy không đổi

#### Scenario: S9.3-AC1 (bổ sung) File có số thẻ mới có phần lẻ bị từ chối
- **WHEN** người học chọn file tiến độ có một ngày với số thẻ mới đã chấm là 2.5
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ trên máy không đổi

#### Scenario: S9.3-AC1 (bổ sung) File có số lượt ôn không phải số bị từ chối
- **WHEN** người học chọn file tiến độ có một ngày với số lượt ôn đã chấm là chữ "ba"
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ trên máy không đổi

#### Scenario: S9.3-AC1 (bổ sung) Ngày thiếu số thẻ mới đã chấm thì coi là 0
- **WHEN** giới hạn là "20 thẻ"; người học chọn file tiến độ do bản app từ S9.3 xuất trong hôm nay, có 25 thẻ "mới", không có thẻ đã chấm nào
  đến hạn, và ngày hôm nay trong file có số lượt ôn nhưng thiếu số thẻ mới đã chấm; bấm "Ghi đè" rồi mở màn ôn tập
- **THEN** màn báo "Đã nhập tiến độ." trước khi mở màn ôn tập
- **AND** màn ôn tập hiện "Thẻ 1 / 20"
