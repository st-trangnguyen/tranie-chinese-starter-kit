# Test cases: S8.5 Export / Import tiến độ

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Người học mới**: trình duyệt chưa có dữ liệu của app (xoá dữ liệu trang hoặc cửa sổ ẩn danh), mở app, qua màn chào mừng với
  mục tiêu 15 phút mỗi ngày, chưa học bài nào.
- **Máy A / máy B**: hai hồ sơ trình duyệt riêng (hoặc hai trình duyệt khác nhau, hoặc điện thoại và máy tính), mỗi bên có dữ liệu
  app riêng. Máy B là "Người học mới" (đã qua màn chào mừng với mục tiêu 15 phút) trừ khi case ghi khác. e2e dùng hai phiên trình
  duyệt tách dữ liệu.
- **"Bài 1, bài 2…"**: thứ tự bài trên màn Lộ trình, tính từ bài đầu tiên.
- **Tạo tiến độ**: QA chạy tay thì làm bài thật cho tới khi đạt trạng thái cần (hoặc nhập một file mẫu hợp lệ đã có trạng thái đó);
  e2e được nạp sẵn tiến độ (cách nạp do dev ghi trong design.md).
- **Phút học, mục tiêu theo ngày, chuỗi ngày học**: có từ S8.1 và S8.3 (dependency chặn, code trước S8.5), nên mọi case có phút học
  đều chạy được trên bản build.
- **"Không có mạng"**: mở app khi có mạng và chờ app tải xong, rồi tắt mạng (chế độ máy bay hoặc chế độ ngoại tuyến của trình duyệt).
- **File mẫu** (dev cung cấp cùng PR code, đường dẫn ghi trong design.md; e2e dùng cùng bộ file):
  - `hop-le-5-bai`: xuất ngày 17/11/2026, bài 1–5 "Đã xong".
  - `hop-le-3-bai-15-phut`: bài 1–3 "Đã xong", mục tiêu 15 phút mỗi ngày, không có phút học nào.
  - `vuot-cap`: **không** phải file dev cung cấp sẵn; tạo bằng cách làm thật trên máy A (xem "Trạng thái vượt cấp" dưới đây)
    rồi bấm "Xuất tiến độ". e2e nạp sẵn đúng trạng thái này ở máy A rồi xuất qua nút "Xuất tiến độ".
  - `bai-la`: bài 1 "Đã xong" và một bài không có trong nội dung app ở trạng thái đã xong.
  - `trang-thai-sai`: bài 2, bài 3 hợp lệ "Đã xong", bài 4 có trạng thái không tồn tại.
  - `muc-tieu-45`: mục tiêu 45 phút mỗi ngày, phần còn lại hợp lệ.
  - `rong.json`: file JSON rỗng (0 byte).
  - `json-noi-khac.json`: JSON hợp lệ không do app xuất (ví dụ `{"name": "abc"}`).
  - `ban-moi-hon`: file tiến độ ghi phiên bản định dạng cao hơn bản app đang dùng.
  - `lon-hon-20mb`: file lớn hơn 20 MB (e2e tạo trong test, không commit vào repo; QA chạy tay tự tạo một file bất kỳ > 20 MB).
  - Một file ảnh bất kỳ (`.png`/`.jpg`).
- **Trạng thái vượt cấp** (TC-S8.5-AC1-20, TC-S8.5-AC3-5): máy A là Người học mới; làm xong bài 1; trên màn Lộ trình chọn một chủ
  đề chưa mở có bài kiểm tra vượt cấp (gọi là chủ đề thứ k) sao cho giữa chủ đề 1 và chủ đề thứ k có ít nhất
  một chủ đề, và chủ đề thứ k không phải chủ đề cuối; làm và đạt bài kiểm tra đó; không làm bài nào khác. Trên màn Lộ trình
  máy A ghi lại: k, số bài của chủ đề thứ k (N), và các chủ đề ở giữa chủ đề 1 và chủ đề thứ k vẫn "Đã khóa".
- **Giả lập lỗi đọc/ghi tiến độ** (TC-S8.5-AC1-13, TC-S8.5-AC3-13): cách tạo lỗi nằm hoàn toàn trong test e2e (chặn hoặc làm hỏng
  việc đọc/ghi dữ liệu trên máy từ phía test; cách cụ thể do dev ghi trong design.md). Bản build **không** có công tắc, tham số hay
  màn ẩn nào để giả lập lỗi. QA chạy tay không tạo được điều kiện này trên bản build, chỉ xem kết quả e2e.
- **Ngày trên máy**: case cần ngày cố định (17/11/2026, "hôm qua") thì e2e cố định đồng hồ trong test; QA chạy tay đổi ngày giờ của máy.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code. `không` = QA chạy tay mỗi lần nghiệm thu.

## Mục Sao lưu tiến độ trong Cài đặt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC1-1 | S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ | Chức năng | Người học mới; mở màn Cài đặt | Có mục "Sao lưu tiến độ" với nút "Xuất tiến độ" và nút "Nhập tiến độ" | e2e |
| TC-S8.5-AC1-2 | S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ | Mobile 375 | Mở màn Cài đặt ở khổ 375×812, cuộn tới mục "Sao lưu tiến độ" | Thấy đủ tiêu đề mục và hai nút, chữ trên nút không bị cắt, không phải cuộn ngang | không |
| TC-S8.5-AC1-3 | S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ | Sáng/Tối | Mở màn Cài đặt ở giao diện Sáng rồi Tối | Ở cả hai giao diện, tiêu đề mục và chữ trên hai nút đọc rõ trên nền | không |
| TC-S8.5-AC1-4 | S8.5-AC1 Hai nút dùng được bằng bàn phím | A11y | Ở màn Cài đặt chỉ dùng bàn phím: Tab tới "Xuất tiến độ", bấm Enter; rồi bấm Tab tiếp | Có viền focus nhìn thấy trên từng nút khi Tab tới; Enter lưu file tiến độ xuống máy như bấm chuột và màn báo "Đã xuất tiến độ."; Tab tiếp tới nút "Nhập tiến độ" | e2e |
| TC-S8.5-AC1-5 | S8.5-AC1 Hai nút dùng được bằng bàn phím | A11y | Tab tới "Nhập tiến độ", bấm Space | Mở hộp chọn file của máy | không |

## Xuất tiến độ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC1-6 | S8.5-AC1 Bấm Xuất tiến độ thì lưu được file | Chức năng | Ngày trên máy là 17/11/2026; ở màn Cài đặt bấm "Xuất tiến độ" | Máy lưu file tên `tranie-tien-do-2026-11-17.json`; mở file bằng trình soạn thảo thấy nội dung JSON đọc được; màn báo "Đã xuất tiến độ." | e2e |
| TC-S8.5-AC1-7 | S8.5-AC1 Bấm Xuất tiến độ thì lưu được file | Mobile 375 | Trên điện thoại thật (Android Chrome và iOS Safari), bấm "Xuất tiến độ", lưu file | File `tranie-tien-do-<ngày hôm nay>.json` được lưu (hoặc lưu qua lựa chọn lưu/chia sẻ của máy); màn báo "Đã xuất tiến độ." | không |
| TC-S8.5-AC1-8 | S8.5-AC1 Báo đã xuất ngay khi trình duyệt nhận file | Chức năng | Ở màn Cài đặt bấm "Xuất tiến độ" | Trình duyệt nhận một file tải xuống tên `tranie-tien-do-<năm>-<tháng>-<ngày>.json` (ngày hôm nay trên máy); màn báo "Đã xuất tiến độ."; không có thông báo lỗi nào | e2e |
| TC-S8.5-AC1-9 | S8.5-AC1 Báo đã xuất ngay khi trình duyệt nhận file | Biên | Trên điện thoại thật (iOS Safari hiện bảng chia sẻ; hoặc trình duyệt máy tính bật "hỏi nơi lưu"), bấm "Xuất tiến độ", rồi hủy hộp lưu / bảng chia sẻ | Màn vẫn báo "Đã xuất tiến độ."; không có thông báo lỗi hay thông báo nào khác sau khi hủy | không |
| TC-S8.5-AC1-10 | S8.5-AC1 Xuất không làm đổi tiến độ | Chức năng | Có bài 1 "Đã xong", bài 2 đang dở ở câu 3; bấm "Xuất tiến độ"; mở màn Lộ trình rồi mở bài 2 | Bài 1 vẫn "Đã xong"; bài 2 làm tiếp từ câu 3 | e2e |
| TC-S8.5-AC1-11 | S8.5-AC1 Chưa học gì vẫn xuất được | Biên | Người học mới, chưa học bài nào; bấm "Xuất tiến độ" | Máy lưu file tiến độ; màn báo "Đã xuất tiến độ." | e2e |
| TC-S8.5-AC1-12 | S8.5-AC1 Xuất khi không có mạng | Offline | Không có mạng; mở màn Cài đặt, bấm "Xuất tiến độ" | Máy lưu file tiến độ; màn báo "Đã xuất tiến độ." | e2e |
| TC-S8.5-AC1-13 | S8.5-AC1 Không đọc được tiến độ thì báo lỗi | Biên | Test e2e làm hỏng việc đọc tiến độ (xem "Giả lập lỗi đọc/ghi tiến độ"); bấm "Xuất tiến độ" | Không có file nào được lưu; màn báo "Không xuất được tiến độ. Hãy thử lại." | e2e |
| TC-S8.5-AC1-14 | S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình | A11y | Bật trình đọc màn hình (VoiceOver hoặc NVDA); ở màn Cài đặt bấm "Xuất tiến độ" | Trình đọc màn hình tự đọc "Đã xuất tiến độ." mà người học không phải di chuyển tới thông báo | không |
| TC-S8.5-AC1-15 | S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình | A11y | Bấm "Xuất tiến độ"; kiểm tra thông báo bằng công cụ trợ năng của trình duyệt | "Đã xuất tiến độ." nằm trong vùng được đọc tự động khi thay đổi | e2e |

## File xuất chứa toàn bộ tiến độ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC1-16 | S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ | Chức năng | Máy A: bài 1, bài 2 "Đã xong", bài 3 dở ở câu 4, chọn mục tiêu 30 phút mỗi ngày, bấm "Xuất tiến độ". Máy B: vừa qua màn chào mừng với mục tiêu 15 phút, chưa học bài nào; Cài đặt → "Nhập tiến độ", chọn file vừa xuất, bấm "Ghi đè" | Máy B: màn Lộ trình hiện bài 1, bài 2 "Đã xong"; mở bài 3 thì làm tiếp từ câu 4; màn Cài đặt hiện mục tiêu 30 phút mỗi ngày (không còn 15 phút) | e2e |
| TC-S8.5-AC1-17 | S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ | Chức năng | Như TC-S8.5-AC1-16 (máy B qua màn chào mừng với 15 phút) nhưng máy A là điện thoại thật, máy B là máy tính (chuyển file qua cách bất kỳ: thư, ổ đĩa, cáp) | Kết quả trên máy B như TC-S8.5-AC1-16 | không |
| TC-S8.5-AC1-18 | S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ | Biên | Sau TC-S8.5-AC1-16, tải lại app ở máy B | Máy B vào thẳng app, không hiện màn chào mừng; màn Lộ trình vẫn hiện bài 1, bài 2 "Đã xong"; Cài đặt vẫn mục tiêu 30 phút mỗi ngày | không |
| TC-S8.5-AC1-19 | S8.5-AC1 File có số phút đã học từng ngày | Chức năng | Máy A mục tiêu 15 phút mỗi ngày, học tới khi Trang chủ hiện "Hôm nay: 12 / 15 phút", bấm "Xuất tiến độ"; máy B nhập file trong cùng ngày, bấm "Ghi đè"; mở Trang chủ máy B | Trang chủ máy B hiện "Hôm nay: 12 / 15 phút" | e2e |
| TC-S8.5-AC1-20 | S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp | Chức năng | Máy A tạo "Trạng thái vượt cấp" (chọn chủ đề thứ k sao cho giữa chủ đề 1 và chủ đề thứ k có ít nhất một chủ đề, và chủ đề thứ k không phải chủ đề cuối; ghi lại k), bấm "Xuất tiến độ" (file `vuot-cap`); máy B nhập file, bấm "Ghi đè"; mở màn Lộ trình máy B | Bài 1 "Đã xong"; mọi bài của chủ đề thứ k "Đã xong"; bài đầu của chủ đề thứ k+1 "Đang mở"; các chủ đề ở giữa chủ đề 1 và chủ đề thứ k vẫn "Đã khóa" (giống màn Lộ trình máy A) | e2e |
| TC-S8.5-AC1-21 | S8.5-AC1 Chuỗi ngày học giữ đúng nhờ mục tiêu của từng ngày | Chức năng | Máy A: hôm qua mục tiêu 15 phút, đã học 20 phút; hôm nay đổi mục tiêu sang 30 phút, chưa học; kiểm Trang chủ máy A hiện "Chuỗi ngày học: 1 ngày"; bấm "Xuất tiến độ". Máy B nhập file trong cùng ngày, bấm "Ghi đè"; mở Trang chủ máy B | Trang chủ máy B hiện "Chuỗi ngày học: 1 ngày" | e2e |
| TC-S8.5-AC1-22 | S8.5-AC1 File có lựa chọn hiện pinyin | Chức năng | Máy A: trong Cài đặt tắt "hiện pinyin", bấm "Xuất tiến độ". Máy B: Người học mới, kiểm Cài đặt đang bật "hiện pinyin"; nhập file đó, bấm "Ghi đè"; mở màn Cài đặt máy B | Màn Cài đặt máy B hiện "hiện pinyin" đang tắt | e2e |

## Nhập: kiểm tra file và thông báo lỗi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC2-1 | S8.5-AC2 File không phải JSON bị từ chối | Chức năng | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn file ảnh | Màn báo "File này không phải file tiến độ của Tranie Chinese."; không hiện hộp xác nhận; màn Lộ trình vẫn hiện bài 1 "Đã xong" | e2e |
| TC-S8.5-AC2-2 | S8.5-AC2 File rỗng bị từ chối | Biên | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `rong.json` | Màn báo "File này không phải file tiến độ của Tranie Chinese."; không hiện hộp xác nhận; bài 1 vẫn "Đã xong" | e2e |
| TC-S8.5-AC2-3 | S8.5-AC2 File JSON của nơi khác bị từ chối | Chức năng | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `json-noi-khac.json` | Màn báo "File này không phải file tiến độ của Tranie Chinese."; không hiện hộp xác nhận; bài 1 vẫn "Đã xong" | e2e |
| TC-S8.5-AC2-4 | S8.5-AC2 File lớn hơn 20 MB bị từ chối | Biên | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `lon-hon-20mb` | Màn báo "File này không phải file tiến độ của Tranie Chinese."; không hiện hộp xác nhận; màn Lộ trình vẫn hiện bài 1 "Đã xong" | e2e |
| TC-S8.5-AC2-5 | S8.5-AC2 File từ phiên bản app mới hơn bị từ chối | Chức năng | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `ban-moi-hon` | Màn báo "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại."; không hiện hộp xác nhận; bài 1 vẫn "Đã xong" | e2e |
| TC-S8.5-AC2-6 | S8.5-AC2 File có một phần dữ liệu sai bị từ chối cả file | Chức năng | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `trang-thai-sai` | Màn báo "File tiến độ bị hỏng, không nhập được."; không hiện hộp xác nhận; màn Lộ trình vẫn hiện bài 1 "Đã xong", bài 2 và bài 3 không thành "Đã xong" | e2e |
| TC-S8.5-AC2-7 | S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối | Biên | Mục tiêu trên máy là 30 phút; bấm "Nhập tiến độ", chọn `muc-tieu-45` | Màn báo "File tiến độ bị hỏng, không nhập được."; không hiện hộp xác nhận; màn Cài đặt vẫn hiện mục tiêu 30 phút | e2e |
| TC-S8.5-AC2-8 | S8.5-AC2 Nhập file lỗi khi không có mạng | Offline | Không có mạng; có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `trang-thai-sai` (có một bài ở trạng thái không tồn tại) | Màn báo "File tiến độ bị hỏng, không nhập được."; không hiện hộp xác nhận; màn Lộ trình vẫn hiện bài 1 "Đã xong" | e2e |
| TC-S8.5-AC2-9 | S8.5-AC2 Đóng hộp chọn file thì không có gì xảy ra | Biên | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", đóng hộp chọn file (Hủy/Esc của máy) mà không chọn file | Không hiện thông báo lỗi, không hiện hộp xác nhận; bài 1 vẫn "Đã xong" | không |
| TC-S8.5-AC2-10 | S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình | A11y | Bật trình đọc màn hình (VoiceOver hoặc NVDA); bấm "Nhập tiến độ", chọn file ảnh | Trình đọc màn hình tự đọc "File này không phải file tiến độ của Tranie Chinese." mà người học không phải di chuyển tới thông báo | không |
| TC-S8.5-AC2-11 | S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình | A11y | Bấm "Nhập tiến độ", chọn file ảnh; kiểm tra thông báo lỗi bằng công cụ trợ năng của trình duyệt | Thông báo lỗi nằm trong vùng được đọc tự động khi thay đổi | e2e |
| TC-S8.5-AC2-12 | S8.5-AC2 File không phải JSON bị từ chối | Sáng/Tối | Gây lỗi như TC-S8.5-AC2-1 ở giao diện Sáng rồi Tối | Thông báo lỗi đọc rõ trên nền ở cả hai giao diện, nhận ra là lỗi không chỉ nhờ màu | không |

## Nhập: hộp xác nhận và ghi đè

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC3-1 | S8.5-AC3 File hợp lệ thì hiện hộp xác nhận | Chức năng | Có bài 1 "Đã xong"; bấm "Nhập tiến độ", chọn `hop-le-5-bai` | Hiện hộp xác nhận nêu ngày 17/11/2026, 5 bài đã xong, câu "Toàn bộ tiến độ hiện có trên máy này sẽ bị thay bằng tiến độ trong file. Không hoàn tác được.", nút "Ghi đè" và "Hủy" | e2e |
| TC-S8.5-AC3-2 | S8.5-AC3 File hợp lệ thì hiện hộp xác nhận | Biên | Như TC-S8.5-AC3-1; khi hộp đang mở, mở thêm một tab app khác, vào màn Lộ trình | Tab kia vẫn hiện chỉ bài 1 "Đã xong" | không |
| TC-S8.5-AC3-3 | S8.5-AC3 File hợp lệ thì hiện hộp xác nhận | Mobile 375 | Ở khổ 375×812, nhập `hop-le-5-bai` | Hộp xác nhận nằm trọn trong màn hình (hoặc cuộn được trong hộp), đọc được hết nội dung, bấm được cả "Ghi đè" và "Hủy" | không |
| TC-S8.5-AC3-4 | S8.5-AC3 File hợp lệ thì hiện hộp xác nhận | Sáng/Tối | Mở hộp xác nhận ở giao diện Sáng rồi Tối | Nội dung, câu cảnh báo và hai nút đọc rõ trên nền ở cả hai giao diện | không |
| TC-S8.5-AC3-5 | S8.5-AC3 Số bài đã xong gồm bài qua bằng kiểm tra vượt cấp | Chức năng | Máy A tạo "Trạng thái vượt cấp" (ghi lại N = số bài của chủ đề thứ k đếm trên màn Lộ trình), bấm "Xuất tiến độ" (file `vuot-cap`); ở máy B bấm "Nhập tiến độ", chọn file đó | Hộp xác nhận nêu 1 + N bài đã xong | e2e |
| TC-S8.5-AC3-6 | S8.5-AC3 Hủy thì không đổi gì | Chức năng | Có bài 1 "Đã xong"; nhập `hop-le-5-bai`, bấm "Hủy" | Hộp đóng; không có thông báo; màn Lộ trình vẫn hiện chỉ bài 1 "Đã xong" | e2e |
| TC-S8.5-AC3-7 | S8.5-AC3 Esc thì như Hủy | A11y | Có bài 1 "Đã xong"; nhập `hop-le-5-bai`; khi hộp mở, bấm Esc | Hộp đóng; không có thông báo; màn Lộ trình vẫn hiện chỉ bài 1 "Đã xong" | e2e |
| TC-S8.5-AC3-8 | S8.5-AC3 Hộp xác nhận dùng được bằng bàn phím | A11y | Nhập `hop-le-5-bai` bằng bàn phím; khi hộp mở, bấm Tab nhiều lần rồi Shift+Tab nhiều lần; bấm "Hủy" bằng Enter | Focus ban đầu ở "Hủy", có viền focus nhìn thấy; Tab và Shift+Tab chỉ đi giữa các nút trong hộp, không ra phần màn phía sau; đóng hộp thì focus về nút "Nhập tiến độ" | e2e |
| TC-S8.5-AC3-9 | S8.5-AC3 Hộp xác nhận dùng được bằng bàn phím | A11y | Mở hộp, Tab tới "Ghi đè", bấm Enter | Ghi đè thành công, màn báo "Đã nhập tiến độ."; focus về nút "Nhập tiến độ" | không |
| TC-S8.5-AC3-10 | S8.5-AC3 Ghi đè thì tiến độ đúng bằng file | Chức năng | Máy có bài 1–6 "Đã xong", mục tiêu 60 phút; nhập `hop-le-3-bai-15-phut`, bấm "Ghi đè" | Màn báo "Đã nhập tiến độ."; màn Lộ trình hiện bài 1–3 "Đã xong", bài 4 "Đang mở", bài 5 và bài 6 "Đã khóa"; màn Cài đặt hiện mục tiêu 15 phút mỗi ngày | e2e |
| TC-S8.5-AC3-11 | S8.5-AC3 Ghi đè thì tiến độ đúng bằng file | Biên | Máy có bài 1–2 "Đã xong"; nhập file xuất ở TC-S8.5-AC1-11 (chưa học bài nào), bấm "Ghi đè" | Màn báo "Đã nhập tiến độ."; màn Lộ trình hiện bài 1 "Đang mở", các bài còn lại "Đã khóa" (không gộp với bài đã xong trên máy) | không |
| TC-S8.5-AC3-12 | S8.5-AC3 Ghi đè xóa số phút học mà file không có | Chức năng | Học tới khi Trang chủ hiện đã học 20 phút hôm nay; nhập `hop-le-3-bai-15-phut` (mục tiêu 15 phút, không có phút học nào), bấm "Ghi đè"; mở Trang chủ | Trang chủ hiện "Hôm nay: 0 / 15 phút" | e2e |
| TC-S8.5-AC3-13 | S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ | Biên | Máy có bài 1 "Đã xong", mục tiêu 30 phút; nhập `hop-le-5-bai`; test e2e làm hỏng việc ghi (xem "Giả lập lỗi đọc/ghi tiến độ") rồi bấm "Ghi đè" | Màn báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên."; màn Lộ trình vẫn hiện chỉ bài 1 "Đã xong"; Cài đặt vẫn mục tiêu 30 phút | e2e |
| TC-S8.5-AC3-14 | S8.5-AC3 Nhập khi không có mạng | Offline | Không có mạng; có bài 1 "Đã xong"; nhập `hop-le-5-bai`, bấm "Ghi đè" | Màn báo "Đã nhập tiến độ."; màn Lộ trình hiện bài 1–5 "Đã xong" | e2e |
| TC-S8.5-AC3-15 | S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình | A11y | Bật trình đọc màn hình; nhập `hop-le-5-bai`, bấm "Ghi đè" | Trình đọc màn hình tự đọc "Đã nhập tiến độ." | không |
| TC-S8.5-AC3-16 | S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình | A11y | Nhập `hop-le-5-bai`, bấm "Ghi đè"; kiểm tra thông báo bằng công cụ trợ năng của trình duyệt | "Đã nhập tiến độ." nằm trong vùng được đọc tự động khi thay đổi | e2e |
| TC-S8.5-AC3-17 | S8.5-AC3 Màn khác hiện tiến độ mới không cần tải lại | Chức năng | Có bài 1 "Đã xong"; ở màn Cài đặt nhập `hop-le-5-bai`, bấm "Ghi đè"; không tải lại app, bấm sang màn Lộ trình | Màn Lộ trình hiện bài 1–5 "Đã xong", bài 6 "Đang mở" | e2e |
| TC-S8.5-AC3-18 | S8.5-AC3 Bài không có trong app không ảnh hưởng lộ trình | Biên | Người học mới; bấm "Nhập tiến độ", chọn `bai-la`; xem hộp xác nhận; bấm "Ghi đè"; mở màn Lộ trình | Hộp xác nhận nêu 1 bài đã xong; sau khi ghi đè màn báo "Đã nhập tiến độ."; Lộ trình hiện bài 1 "Đã xong", bài 2 "Đang mở", các bài còn lại "Đã khóa"; không hiện bài lạ ở đâu | e2e |

## Ghi chú

- Dev phủ thêm ở tầng thấp hơn (schema, service) các trường hợp file lỗi khác (thiếu phần dữ liệu, sai kiểu) và việc đọc file từ bản app
  cũ hơn (phần thiếu lấy mặc định); test-cases.md chỉ giữ các trường hợp spec nêu.
