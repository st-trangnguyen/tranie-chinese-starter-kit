# Test cases: S6.1 Xem thứ tự nét

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

## Điều kiện đầu

- **Chữ thử có dữ liệu nét thật** (đã kiểm có trong thư mục dữ liệu nét của bản build): 人 (2 nét, có trong bài
  Nhập môn), 十 (2 nét), 白 (5 nét), 好 (6 nét). Toàn bộ chữ có dữ liệu nét trong bản app hiện tại (dùng cho case
  offline TC-S6.1-AC1-37): 人 (2), 你 (7), 八 (2), 十 (2), 四 (5), 好 (6), 爸 (8), 白 (5), 百 (6). **Chữ chưa có dữ liệu nét: "龘"** (đã kiểm không có trong thư mục
  dữ liệu nét; nếu sau này S2.5 thêm dữ liệu cho chữ này thì đổi sang chữ khác chưa có).
- **Cách mở màn trong bản build:** lối vào màn (nút trên thẻ từ vựng, liên kết từ bài Nhập môn S7.1) thuộc story khác nên
  S6.1 chưa có nút nào trong app để bấm tới. QA mở màn xem thứ tự nét của một chữ bằng địa chỉ trực tiếp do dev ghi trong
  mô tả PR code (kèm cách chọn chữ, và cách mở màn mà không chỉ định chữ nào). Mỗi case dưới đây bắt đầu từ lúc màn vừa
  mở xong.
- **Giảm chuyển động:** mặc định tắt giảm chuyển động của thiết bị; chỉ các case ghi rõ "bật giảm chuyển động" mới bật,
  và tắt lại sau case đó.
- **Mạng:** mặc định có mạng. Các case đang tải, lỗi tải, dữ liệu hỏng và offline cần tạo tình huống theo mục Ghi chú.
- **Nét đã vẽ và chữ mờ nền:** trong lúc phát, khối animation luôn có chữ mờ của cả chữ làm nền. "Nét đã vẽ" chỉ tính
  các nét đậm được animation vẽ ra, không tính chữ mờ nền. "Chưa có nét nào được vẽ" nghĩa là khối chỉ còn chữ mờ nền.
- **Cột Tự động:** `e2e` = Playwright trên bản build (chỉ kiểm trạng thái ổn định, không phụ thuộc thời điểm từng nét);
  `không` = QA chạy tay mỗi lần nghiệm thu. Case `không` phụ thuộc thời điểm animation còn được dev phủ bằng test
  Vitest (xem Ghi chú), nhưng QA vẫn xác nhận trên bản build.

## Case

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.1-AC1-1 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Chức năng | Mở màn xem thứ tự nét của chữ "好", không bấm gì | Màn hiện khối animation của chữ "好"; ngay khi mở chưa có nét nào được vẽ (chỉ có chữ mờ nền), rồi các nét bắt đầu được vẽ mà không cần bấm | không |
| TC-S6.1-AC1-2 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Chức năng | Mở màn của chữ "白", không bấm gì, chờ | Khối animation của chữ "白" hiện ra; sau một lúc chữ tự vẽ xong đủ 5 nét mà không cần bấm | e2e |
| TC-S6.1-AC1-3 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Mobile 375 | Khổ 375 px, mở màn của chữ "好" | Khối animation hiện đủ trong màn hình, không bị cắt, không phải cuộn ngang | không |
| TC-S6.1-AC1-4 | S6.1-AC1 Chữ hiện animation và tự phát khi mở | Sáng/Tối | Mở màn của chữ "好" ở giao diện sáng, chờ phát xong, rồi chuyển sang tối | Nét đã vẽ và nền khối animation đều nhìn rõ ở cả hai giao diện | không |
| TC-S6.1-AC1-5 | S6.1-AC1 Chữ mờ nền hiện trong lúc vẽ | Chức năng | Mở màn của chữ "好", quan sát khối animation từ lúc mở đến khi phát xong | Chữ mờ của cả chữ "好" luôn hiện làm nền ở mọi thời điểm, kể cả ngay khi mở (lúc chưa có nét nào được vẽ) và khi đã phát xong; số nét đã vẽ đếm được chỉ gồm nét đậm (ngay khi mở là 0, khi xong là 6), không tính chữ mờ | không |
| TC-S6.1-AC1-6 | S6.1-AC1 Chữ mờ nền hiện trong lúc vẽ | Sáng/Tối | Mở màn của chữ "好" ở giao diện sáng, quan sát giữa lúc đang vẽ; lặp lại ở giao diện tối | Ở cả hai giao diện, chữ mờ nền nhìn thấy được và phân biệt rõ với các nét đã vẽ | không |
| TC-S6.1-AC1-7 | S6.1-AC1 Mỗi lúc chỉ vẽ một nét | Chức năng | Mở màn của chữ "好", quan sát animation từ đầu | Sau mỗi bước, số nét đã được vẽ chỉ tăng đúng một nét (1, 2, 3, … 6); không lúc nào có hai nét cùng đang được vẽ | không |
| TC-S6.1-AC1-8 | S6.1-AC1 Nét hiện đúng thứ tự viết | Chức năng | Mở màn của chữ "人", chờ animation phát hết | Nét phẩy (nét trái) được vẽ xong trước khi nét mác (nét phải) bắt đầu được vẽ; khi xong chữ có đủ 2 nét đã được vẽ | không |
| TC-S6.1-AC1-9 | S6.1-AC1 Nét hiện đúng thứ tự viết | Biên | Mở màn của chữ "十", chờ animation phát hết | Nét ngang được vẽ trước, nét sổ sau; khi xong chữ có đủ 2 nét đã được vẽ | không |
| TC-S6.1-AC1-10 | S6.1-AC1 Số nét được vẽ bằng số nét của chữ | Chức năng | Mở màn của chữ "白" (5 nét), chờ phát xong, đếm số nét đã vẽ | Đúng 5 nét đã được vẽ, không thừa không thiếu | e2e |
| TC-S6.1-AC1-11 | S6.1-AC1 Số nét được vẽ bằng số nét của chữ | Biên | Mở màn của chữ "好" (6 nét), chờ phát xong, đếm nét đã vẽ | Đúng 6 nét đã được vẽ | e2e |
| TC-S6.1-AC1-12 | S6.1-AC1 Animation chỉ tự phát một lần | Chức năng | Mở màn của chữ "人", chờ phát xong, rồi không bấm gì trong 10 giây | Animation không tự phát lại; chữ giữ nguyên đủ 2 nét đã được vẽ | e2e |
| TC-S6.1-AC1-13 | S6.1-AC1 Animation chỉ tự phát một lần | Biên | Mở màn của chữ "人", chờ phát xong, chuyển sang thẻ/ứng dụng khác rồi quay lại màn (không tải lại) | Animation không tự phát lại; chữ giữ nguyên đủ 2 nét đã được vẽ | không |
| TC-S6.1-AC1-14 | S6.1-AC1 Màn chỉ hiện một chữ | Chức năng | Mở màn xem thứ tự nét của chữ "好" | Màn chỉ hiện khối animation của chữ "好"; không có chữ nào khác để xem lần lượt, không có nút chuyển chữ | e2e |
| TC-S6.1-AC1-15 | S6.1-AC1 Chữ không có dữ liệu nét | Chức năng | Mở màn xem thứ tự nét của chữ "龘" (chưa có dữ liệu nét) | Màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-16 | S6.1-AC1 Chữ không có dữ liệu nét | Mobile 375 | Khổ 375 px, mở màn của chữ "龘" | Thông báo hiện đủ, đọc được, không bị cắt, không phải cuộn ngang | không |
| TC-S6.1-AC1-17 | S6.1-AC1 Chữ không có dữ liệu nét | Sáng/Tối | Mở màn của chữ "龘" ở giao diện sáng, rồi chuyển sang tối | Thông báo đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC1-18 | S6.1-AC1 Chữ được yêu cầu rỗng | Biên | Mở màn xem thứ tự nét mà không chỉ định chữ nào (theo cách dev ghi trong mô tả PR code) | Màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-19 | S6.1-AC1 Chữ được yêu cầu không phải chữ Hán | Biên | Mở màn xem thứ tự nét của "abc" | Màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-20 | S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ | Biên | Mở màn xem thứ tự nét của "你好" | Màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."; không có khối animation; không có nút "Phát lại"; không hiện riêng chữ "你" hay chữ "好" | e2e |
| TC-S6.1-AC1-21 | S6.1-AC1 Đang tải dữ liệu nét | Chức năng | Làm chậm việc tải dữ liệu nét (xem Ghi chú), mở màn của chữ "人", nhìn màn trước khi tải xong | Màn hiện "Đang tải…"; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-22 | S6.1-AC1 Tải dữ liệu nét lỗi | Chức năng | Chặn việc tải dữ liệu nét (xem Ghi chú), mở màn của chữ "人" | Màn hiện "Có lỗi xảy ra" và nút "Thử lại"; không có khối animation; không có nút "Phát lại"; không hiện "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S6.1-AC1-23 | S6.1-AC1 Tải dữ liệu nét lỗi | A11y | Như TC-S6.1-AC1-22, rồi dùng phím Tab tới nút "Thử lại" | Nút "Thử lại" nhận được focus, thấy rõ viền focus, được gọi tên là "Thử lại" | không |
| TC-S6.1-AC1-24 | S6.1-AC1 Tải dữ liệu nét lỗi | Mobile 375 | Khổ 375 px, chặn việc tải dữ liệu nét, mở màn của chữ "人" | Thông báo "Có lỗi xảy ra" và nút "Thử lại" hiện đủ, bấm được bằng ngón tay, không phải cuộn ngang | không |
| TC-S6.1-AC1-25 | S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc | Chức năng | Thay dữ liệu nét của chữ "人" bằng nội dung hỏng, không đọc được (xem Ghi chú), mở màn của chữ "人" | Màn hiện "Có lỗi xảy ra" và nút "Thử lại"; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-26 | S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc | Biên | Thay dữ liệu nét của chữ "人" bằng nội dung đọc được nhưng sai cấu trúc, ví dụ thiếu phần nét (xem Ghi chú), mở màn của chữ "人" | Màn hiện "Có lỗi xảy ra" và nút "Thử lại"; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-27 | S6.1-AC1 Thử lại sau khi tải lỗi | Chức năng | Chặn việc tải dữ liệu nét, mở màn của chữ "人", thấy "Có lỗi xảy ra"; bỏ chặn, bấm "Thử lại", chờ | Thông báo lỗi biến mất; màn hiện khối animation của chữ "人" và nút "Phát lại"; animation tự phát và vẽ đủ 2 nét | e2e |
| TC-S6.1-AC1-28 | S6.1-AC1 Thử lại sau khi tải lỗi | Biên | Chặn việc tải dữ liệu nét, mở màn của chữ "人", thấy "Có lỗi xảy ra"; vẫn giữ chặn, bấm "Thử lại" | Màn vẫn hiện "Có lỗi xảy ra" và nút "Thử lại"; không có khối animation, không có nút "Phát lại" | không |
| TC-S6.1-AC1-29 | S6.1-AC1 Xem animation khi offline | Offline | Có mạng, mở app và chờ app sẵn sàng dùng offline (xem Ghi chú); tắt mạng; mở màn của chữ "人" | Màn hiện khối animation của chữ "人" và animation phát đủ 2 nét; không hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S6.1-AC1-30 | S6.1-AC1 Xem animation khi offline | Offline | Như TC-S6.1-AC1-29 trên điện thoại thật (bật chế độ máy bay), khổ màn của máy; khi phát xong bấm "Phát lại" | Animation phát đủ 2 nét; "Phát lại" vẽ lại đủ 2 nét; không có thông báo lỗi | không |
| TC-S6.1-AC1-37 | S6.1-AC1 Mọi chữ có dữ liệu nét đều xem được khi offline | Offline | Có mạng, mở app và chờ app sẵn sàng dùng offline (xem Ghi chú); tắt mạng; lần lượt mở màn xem thứ tự nét của từng chữ có dữ liệu nét trong bản app (danh sách lấy từ dữ liệu nét của chính bản build đang thử, không cố định; hiện là 人, 你, 八, 十, 四, 好, 爸, 白, 百), mỗi chữ chờ phát xong | Với mỗi chữ: màn hiện khối animation của chữ đó và khi phát xong có đúng số nét của chữ đó (theo dữ liệu nét của bản build; hiện là 2, 7, 2, 2, 5, 6, 8, 5, 6); không chữ nào hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S6.1-AC1-38 | S6.1-AC1 Chữ không có dữ liệu nét khi offline | Offline | Có mạng, mở app và chờ app sẵn sàng dùng offline; tắt mạng; mở màn xem thứ tự nét của chữ "龘" | Màn hiện "Chưa có dữ liệu nét cho chữ này."; không hiện "Có lỗi xảy ra"; không có nút "Thử lại"; không có khối animation; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-39 | S6.1-AC1 Chữ không có dữ liệu nét khi offline | Biên | Có mạng, mở app và chờ app sẵn sàng dùng offline; tắt mạng; lần lượt mở màn của "龘", rồi màn của chữ "人" | Chữ "龘": hiện "Chưa có dữ liệu nét cho chữ này.", không có "Có lỗi xảy ra" hay "Thử lại". Chữ "人" ngay sau đó: hiện khối animation và phát đủ 2 nét (thông báo của "龘" không còn) | không |
| TC-S6.1-AC1-31 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Chức năng | Bật giảm chuyển động của thiết bị, mở màn của chữ "白" | Màn hiện đủ 5 nét ngay lập tức, mỗi nét có số từ 1 đến 5 đúng thứ tự viết; không có animation chạy; không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-32 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Biên | Bật giảm chuyển động, mở màn của chữ "好" rồi chữ "人" | Chữ "好" hiện 6 nét đánh số 1 đến 6; chữ "人" hiện 2 nét đánh số 1 đến 2; không có nút "Phát lại" | không |
| TC-S6.1-AC1-33 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Mobile 375 | Bật giảm chuyển động, khổ 375 px, mở màn của chữ "白" | Các số thứ tự không chồng lên nhau, đọc được, không phải cuộn ngang | không |
| TC-S6.1-AC1-34 | S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh | Sáng/Tối | Bật giảm chuyển động, mở màn của chữ "白" ở giao diện sáng rồi tối | Số thứ tự và nét chữ đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC1-35 | S6.1-AC1 Đổi giảm chuyển động khi đang ở màn | Chức năng | Giảm chuyển động tắt, mở màn của chữ "人"; không rời màn, bật giảm chuyển động; rồi mở lại màn của chữ "人" | Trước khi mở lại: màn vẫn giữ khối animation và nút "Phát lại" như lúc mở. Sau khi mở lại: màn hiện thứ tự nét tĩnh có đánh số 1 đến 2, không có nút "Phát lại" | e2e |
| TC-S6.1-AC1-36 | S6.1-AC1 Đổi giảm chuyển động khi đang ở màn | Biên | Bật giảm chuyển động, mở màn của chữ "人" (hiện tĩnh); không rời màn, tắt giảm chuyển động; rồi mở lại màn của chữ "人" | Trước khi mở lại: màn vẫn hiện thứ tự nét tĩnh có đánh số, không có nút "Phát lại". Sau khi mở lại: màn hiện khối animation, animation tự phát và có nút "Phát lại" | không |
| TC-S6.1-AC2-1 | S6.1-AC2 Có nút Phát lại bấm được | Chức năng | Mở màn của chữ "人", nhìn nút ngay khi mở (animation đang phát), rồi nhìn lại sau khi phát xong | Màn có nút "Phát lại"; nút ở trạng thái bấm được cả khi đang phát lẫn sau khi phát xong | e2e |
| TC-S6.1-AC2-2 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", dùng phím Tab để tới nút "Phát lại" | Nút nhận được focus và thấy rõ viền focus | không |
| TC-S6.1-AC2-3 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", chờ phát xong, Tab tới nút "Phát lại", bấm phím Enter | Phát lại được kích hoạt: ngay sau khi bấm chưa có nét nào được vẽ (chỉ có chữ mờ nền), rồi vẽ lại từ nét đầu | không |
| TC-S6.1-AC2-4 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人", chờ phát xong, Tab tới nút "Phát lại", bấm phím Space | Phát lại được kích hoạt: ngay sau khi bấm chưa có nét nào được vẽ (chỉ có chữ mờ nền), rồi vẽ lại từ nét đầu | không |
| TC-S6.1-AC2-5 | S6.1-AC2 Có nút Phát lại bấm được | A11y | Mở màn của chữ "人" với trình đọc màn hình (hoặc xem tên truy cập của nút) | Nút được đọc/gọi tên là "Phát lại" (không chỉ là biểu tượng không tên) | e2e |
| TC-S6.1-AC2-6 | S6.1-AC2 Có nút Phát lại bấm được | Mobile 375 | Khổ 375 px, mở màn của chữ "人" | Nút "Phát lại" hiện đủ, bấm được bằng ngón tay, không bị khối animation che | không |
| TC-S6.1-AC2-7 | S6.1-AC2 Có nút Phát lại bấm được | Sáng/Tối | Mở màn của chữ "人" ở giao diện sáng, rồi chuyển sang tối | Nhãn nút "Phát lại" và viền focus đọc rõ ở cả hai giao diện | không |
| TC-S6.1-AC2-8 | S6.1-AC2 Phát lại sau khi đã phát xong | Chức năng | Mở màn của chữ "人", chờ phát xong, bấm "Phát lại" | Ngay sau khi bấm, chưa có nét nào được vẽ (chỉ có chữ mờ nền); sau đó các nét được vẽ lại từ nét đầu theo thứ tự phẩy rồi mác, xong thì có đủ 2 nét đã được vẽ | không |
| TC-S6.1-AC2-9 | S6.1-AC2 Phát lại sau khi đã phát xong | Chức năng | Mở màn của chữ "人", chờ phát xong, bấm "Phát lại", chờ phát xong | Chữ có lại đủ 2 nét đã được vẽ | e2e |
| TC-S6.1-AC2-10 | S6.1-AC2 Phát lại khi đang phát | Chức năng | Mở màn của chữ "好" (6 nét), khi đang vẽ giữa chừng (đã vẽ ít nhất 1 nét, chưa đủ 6) thì bấm "Phát lại" | Ngay sau khi bấm, chưa có nét nào được vẽ (chỉ có chữ mờ nền, không còn nét của lượt trước); animation vẽ lại từ nét đầu, xong thì có đủ 6 nét đã được vẽ, không có nét thừa | không |
| TC-S6.1-AC2-11 | S6.1-AC2 Phát lại khi đang phát | Chức năng | Mở màn của chữ "好", bấm "Phát lại" ngay khi vừa mở, rồi chờ phát xong | Cuối cùng có đúng 6 nét đã được vẽ, không thừa, animation không bị đứng giữa chừng | e2e |
| TC-S6.1-AC2-12 | S6.1-AC2 Phát lại khi đang phát | Biên | Mở màn của chữ "白", bấm "Phát lại" liên tiếp thật nhanh 5 lần không chờ, rồi chờ phát xong | Lượt cuối vẽ từ nét đầu đến hết, đúng 5 nét đã được vẽ, không có nét thừa của các lượt trước | e2e |
| TC-S6.1-AC2-13 | S6.1-AC2 Phát lại nhiều lần | Chức năng | Mở màn của chữ "人"; bấm "Phát lại" 3 lần, mỗi lần chờ phát xong rồi mới bấm | Cả 3 lần animation vẽ đủ 2 nét theo đúng thứ tự phẩy rồi mác | e2e |

## Ghi chú

- **Case phụ thuộc thời điểm animation** (TC-S6.1-AC1-1, AC1-5, AC1-7, AC1-8, AC2-8, AC2-10) để `không` vì Playwright
  trên dữ liệu thật dễ chập chờn theo thời gian từng nét. Dev phủ phần này bằng Vitest + Testing Library với dữ liệu nét giả
  và đồng hồ giả (không thuộc cột Tự động). QA xác nhận trên bản build bằng mắt, hoặc quay màn hình rồi xem từng khung.
- Case `e2e` chỉ kiểm trạng thái ổn định: số nét cuối, nút, thông báo; giảm chuyển động bằng giả lập tùy chọn giảm chuyển
  động của trình duyệt (cả khi đổi giữa chừng ở TC-S6.1-AC1-35).
- **Tạo tình huống đang tải / lỗi tải / dữ liệu hỏng khi chạy tay** (Chrome DevTools, trên bản build `vite preview`):
  - Dùng cửa sổ ẩn danh mới (app chưa từng mở, chưa có bộ nhớ offline), hoặc trong DevTools mục Application →
    Service workers bật "Bypass for network", để dữ liệu nét không được lấy từ bộ nhớ offline. Bật "Disable cache" ở tab Network.
  - Dev ghi trong mô tả PR code mẫu địa chỉ của yêu cầu tải dữ liệu nét một chữ, để QA nhận ra yêu cầu cần chặn/sửa.
  - **Đang tải** (AC1-21): tab Network chọn mức mạng rất chậm (ví dụ "Slow 3G" hoặc mức tự tạo có độ trễ vài giây).
  - **Lỗi tải** (AC1-22, 23, 24, 27, 28): tab Network → chuột phải yêu cầu dữ liệu nét của "人" → "Block request URL".
    Với AC1-27, sau khi thấy lỗi thì bỏ chặn rồi mới bấm "Thử lại".
  - **Dữ liệu hỏng / sai cấu trúc** (AC1-25, 26): tab Network → chuột phải yêu cầu dữ liệu nét của "人" → "Override
    content", thay nội dung bằng chuỗi không đọc được (hỏng), hoặc nội dung đúng dạng nhưng bỏ phần nét (sai cấu trúc),
    rồi tải lại màn. Gỡ override sau case.
  - Bản `e2e` của các case này chặn/làm chậm/thay phản hồi của yêu cầu dữ liệu nét bằng Playwright.
- **Offline** (AC1-29, 30, 37, 38, 39): theo Requirement "Xem thứ tự nét khi không có mạng". "App sẵn sàng dùng offline" nghĩa là đã mở app có
  mạng và tải lại một lần sau khi trang báo đã cài xong bộ nhớ offline (DevTools Application → Service workers thấy
  trạng thái đang chạy). Tắt mạng bằng DevTools Network → "Offline" hoặc chế độ máy bay trên điện thoại. Không mở màn
  xem thứ tự nét trước khi tắt mạng, để kiểm dữ liệu nét đã có sẵn từ lúc mở app chứ không phải nhờ lần xem trước.
- **Danh sách chữ của TC-S6.1-AC1-37:** bản `e2e` đọc danh sách chữ và số nét từng chữ từ dữ liệu nét của chính bản build
  (không ghi cố định trong test), để khi S2.5 thêm/bớt chữ thì case vẫn phủ đủ. Khi chạy tay, QA đối chiếu danh sách ở mục
  Điều kiện đầu với thư mục dữ liệu nét của bản build; khác nhau thì theo bản build. Không mở màn của chữ nào trước khi tắt mạng.
- **Chữ không có dữ liệu nét khi offline** (AC1-38, 39): khi offline, "龘" phải cho cùng thông báo như khi có mạng
  (TC-S6.1-AC1-15), không phải thông báo lỗi tải.
