# Test cases: S6.1 Xem thứ tự nét

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

## Điều kiện đầu

- **Chữ thử có dữ liệu nét thật** (đã kiểm có trong thư mục dữ liệu nét của bản build): 人 (2 nét), 十 (2 nét),
  白 (5 nét), 好 (6 nét). **Chữ chưa có dữ liệu nét: "龘"** (đã kiểm không có trong thư mục dữ liệu nét; nếu sau này
  S2.5 thêm dữ liệu cho chữ này thì đổi sang chữ khác chưa có).
- **Cách mở màn trong bản build:** lối vào màn (nút trên thẻ từ vựng, liên kết từ bài Nhập môn S7.1) thuộc story khác nên
  S6.1 chưa có nút nào trong app để bấm tới. QA mở màn xem thứ tự nét của một chữ bằng địa chỉ trực tiếp do dev ghi trong
  mô tả PR code (kèm cách chọn chữ). Mỗi case dưới đây bắt đầu từ lúc màn vừa mở xong.
- **Giảm chuyển động:** mặc định tắt giảm chuyển động của thiết bị; chỉ các case ghi rõ "bật giảm chuyển động" mới bật,
  và tắt lại sau case đó.
- **Cột Tự động** ghi tầng: `e2e` = Playwright trên bản build với dữ liệu nét thật (chỉ kiểm trạng thái ổn định, không
  phụ thuộc thời gian từng nét); `Vitest` = Vitest + Testing Library với dữ liệu nét giả và đồng hồ giả (case phụ thuộc
  thời điểm của animation); `không` = QA chạy tay.
- Case `Vitest` vẫn có bước chạy tay để QA xác nhận trên bản build, bằng mắt hoặc quay màn hình rồi xem từng khung.

## Case

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.1-AC1-1 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Chức năng | Mở màn xem thứ tự nét của chữ "好", không bấm gì | Màn hiện khối animation của chữ "好"; ngay khi mở chưa có nét nào hiện, rồi các nét bắt đầu được vẽ mà không cần bấm | Vitest |
| TC-S6.1-AC1-2 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Chức năng | Mở màn của chữ "白", không bấm gì, chờ | Khối animation của chữ "白" hiện ra; sau một lúc chữ tự vẽ xong đủ 5 nét mà không cần bấm | e2e |
| TC-S6.1-AC1-3 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Mobile 375 | Khổ 375 px, mở màn của chữ "好" | Khối animation hiện đủ trong màn hình, không bị cắt, không phải cuộn ngang | không |
| TC-S6.1-AC1-4 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Sáng/Tối | Mở màn của chữ "好" ở giao diện sáng, rồi chuyển sang tối | Nét chữ và nền khối animation đều nhìn rõ, đọc được ở cả hai giao diện | không |
| TC-S6.1-AC1-5 | S6.1-AC1 Mỗi lúc chỉ vẽ một nét | Chức năng | Mở màn của chữ "好", quan sát animation từ đầu | Sau mỗi bước, số nét đã hiện chỉ tăng đúng một nét (1, 2, 3, … 6); không lúc nào có hai nét cùng đang được vẽ | Vitest |
| TC-S6.1-AC1-6 | S6.1-AC1 Nét hiện đúng thứ tự viết | Chức năng | Mở màn của chữ "人", chờ animation phát hết | Nét phẩy (nét trái) vẽ xong trước khi nét mác (nét phải) bắt đầu được vẽ; khi xong chữ hiện đủ 2 nét | Vitest |
| TC-S6.1-AC1-7 | S6.1-AC1 Nét hiện đúng thứ tự viết | Biên | Mở màn của chữ "十", chờ animation phát hết | Nét ngang vẽ trước, nét sổ sau; khi xong chữ hiện đủ 2 nét | không |
| TC-S6.1-AC1-8 | S6.1-AC1 Số nét được vẽ bằng số nét của chữ | Chức năng | Mở màn của chữ "白" (5 nét), chờ phát xong, đếm số nét đã vẽ | Đúng 5 nét được vẽ, không thừa không thiếu | e2e |
| TC-S6.1-AC1-9 | S6.1-AC1 Số nét được vẽ bằng số nét của chữ | Biên | Mở màn của chữ "好" (6 nét), chờ phát xong, đếm nét | Đúng 6 nét được vẽ | e2e |
| TC-S6.1-AC1-10 | S6.1-AC1 Animation chỉ tự phát một lần | Chức năng | Mở màn của chữ "人", chờ phát xong, rồi không bấm gì trong 10 giây | Animation không tự phát lại; chữ giữ nguyên đủ 2 nét | e2e |
| TC-S6.1-AC1-11 | S6.1-AC1 Animation chỉ tự phát một lần | Biên | Mở màn của chữ "人", chờ phát xong, chuyển sang thẻ/ứng dụng khác rồi quay lại màn (không tải lại) | Animation không tự phát lại; chữ giữ nguyên đủ 2 nét | không |
| TC-S6.1-AC1-12 | S6.1-AC1 Màn chỉ hiện một chữ | Chức năng | Mở màn xem thứ tự nét của chữ "好" | Màn chỉ hiện khối animation của chữ "好"; không có chữ nào khác để xem lần lượt, không có nút chuyển chữ | e2e |
| TC-S6.1-AC1-13 | S6.1-AC1 Chữ không có dữ liệu nét | Chức năng | Mở màn xem thứ tự nét của chữ "龘" (chưa có dữ liệu nét) | Màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-14 | S6.1-AC1 Chữ không có dữ liệu nét | Mobile 375 | Khổ 375 px, mở màn của chữ "龘" | Thông báo hiện đủ, đọc được, không bị cắt, không phải cuộn ngang | không |
| TC-S6.1-AC1-15 | S6.1-AC1 Chữ không có dữ liệu nét | Sáng/Tối | Mở màn của chữ "龘" ở giao diện sáng, rồi chuyển sang tối | Thông báo đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC1-16 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Chức năng | Bật giảm chuyển động của thiết bị, mở màn của chữ "白" | Màn hiện đủ 5 nét ngay lập tức, mỗi nét có số từ 1 đến 5 đúng thứ tự viết; không có animation chạy; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-17 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Biên | Bật giảm chuyển động, mở màn của chữ "好" rồi chữ "人" | Chữ "好" hiện 6 nét đánh số 1 đến 6; chữ "人" hiện 2 nét đánh số 1 đến 2; không có nút "Phát lại" | không |
| TC-S6.1-AC1-18 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Mobile 375 | Bật giảm chuyển động, khổ 375 px, mở màn của chữ "白" | Các số thứ tự không chồng lên nhau, đọc được, không phải cuộn ngang | không |
| TC-S6.1-AC1-19 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Sáng/Tối | Bật giảm chuyển động, mở màn của chữ "白" ở giao diện sáng rồi tối | Số thứ tự và nét chữ đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC2-1 | S6.1-AC2 Có nút Phát lại bấm được | Chức năng | Mở màn của chữ "人", nhìn nút ngay khi mở (animation đang phát), rồi nhìn lại sau khi phát xong | Màn có nút "Phát lại"; nút ở trạng thái bấm được cả khi đang phát lẫn sau khi phát xong | e2e |
| TC-S6.1-AC2-2 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", dùng phím Tab để tới nút "Phát lại" | Nút nhận được focus và thấy rõ viền focus | không |
| TC-S6.1-AC2-3 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", Tab tới nút "Phát lại", bấm phím Enter | Phát lại được kích hoạt: chữ xóa sạch rồi vẽ lại từ nét đầu | không |
| TC-S6.1-AC2-4 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", Tab tới nút "Phát lại", bấm phím Space | Phát lại được kích hoạt: chữ xóa sạch rồi vẽ lại từ nét đầu | không |
| TC-S6.1-AC2-5 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人" với trình đọc màn hình (hoặc xem tên truy cập của nút) | Nút được đọc/gọi tên là "Phát lại" (không chỉ là biểu tượng không tên) | e2e |
| TC-S6.1-AC2-6 | S6.1-AC2 Có nút Phát lại bấm được | Mobile 375 | Khổ 375 px, mở màn của chữ "人" | Nút "Phát lại" hiện đủ, bấm được bằng ngón tay, không bị khối animation che | không |
| TC-S6.1-AC2-7 | S6.1-AC2 Có nút Phát lại bấm được | Sáng/Tối | Mở màn của chữ "人" ở giao diện sáng, rồi chuyển sang tối | Nhãn nút "Phát lại" và viền focus đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC2-8 | S6.1-AC2 Phát lại sau khi đã phát xong | Chức năng | Mở màn của chữ "人", chờ phát xong, bấm "Phát lại" | Ngay sau khi bấm, chưa có nét nào hiện; sau đó các nét vẽ lại từ nét đầu theo thứ tự phẩy rồi mác, xong thì đủ 2 nét | Vitest |
| TC-S6.1-AC2-9 | S6.1-AC2 Phát lại sau khi đã phát xong | Chức năng | Mở màn của chữ "人", chờ phát xong, bấm "Phát lại", chờ phát xong | Chữ hiện lại đủ 2 nét | e2e |
| TC-S6.1-AC2-10 | S6.1-AC2 Phát lại khi đang phát | Chức năng | Mở màn của chữ "好" (6 nét), khi đang vẽ giữa chừng (đã có ít nhất 1 nét, chưa đủ 6) thì bấm "Phát lại" | Ngay sau khi bấm, chưa có nét nào hiện (không còn nét của lượt trước); animation vẽ lại từ nét đầu, xong thì đúng 6 nét, không có nét thừa | Vitest |
| TC-S6.1-AC2-11 | S6.1-AC2 Phát lại khi đang phát | Chức năng | Mở màn của chữ "好", bấm "Phát lại" ngay khi vừa mở, rồi chờ phát xong | Cuối cùng đúng 6 nét, không thừa, không đứng | e2e |
| TC-S6.1-AC2-12 | S6.1-AC2 Phát lại khi đang phát | Biên | Mở màn của chữ "白", bấm "Phát lại" liên tiếp thật nhanh 5 lần không chờ, rồi chờ phát xong | Lượt cuối phát từ nét đầu đến hết, đúng 5 nét, không có nét thừa của các lượt trước | e2e |
| TC-S6.1-AC2-13 | S6.1-AC2 Phát lại nhiều lần | Chức năng | Mở màn của chữ "人"; bấm "Phát lại" 3 lần, mỗi lần chờ phát xong rồi mới bấm | Cả 3 lần animation phát đủ 2 nét theo đúng thứ tự phẩy rồi mác | e2e |

## Ghi chú

- Quan sát "mỗi lúc một nét" và "không còn nét của lượt trước" bằng mắt, hoặc quay màn hình rồi xem từng khung.
- **Offline:** spec không có Scenario hay yêu cầu offline, nên không có case Offline (không bịa case cho thứ spec không nói).
  Dữ liệu nét có chạy offline hay không thuộc S2.5 và các story PWA; nếu spec sau này thêm yêu cầu thì thêm case.
- Case `e2e` chỉ kiểm trạng thái ổn định (số nét cuối, nút, thông báo, giảm chuyển động bằng giả lập tùy chọn giảm chuyển động
  của trình duyệt), vì thời điểm từng nét phụ thuộc thời gian chạy animation nên dễ chập chờn; phần thời điểm do `Vitest` đảm nhận.
