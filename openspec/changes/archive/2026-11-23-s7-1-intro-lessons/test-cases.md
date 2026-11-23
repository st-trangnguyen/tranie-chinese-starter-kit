# Test cases: S7.1 Soạn 12 bài Nhập môn

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Danh sách 12 bài (nguyên văn, đúng thứ tự)**: 1. Thanh 1–4 · 2. Thanh nhẹ và biến điệu (3-3, 不, 一) · 3. Vận mẫu đơn ·
  4. Thanh mẫu b p m f d t n l · 5. Thanh mẫu g k h j q x · 6. Thanh mẫu zh ch sh r z c s · 7. Vận mẫu kép · 8. Vận mẫu mũi ·
  9. Quy tắc viết pinyin · 10. Nét cơ bản và thứ tự nét · 11. 30 bộ thủ phổ biến · 12. Ôn tổng hợp + câu chào đầu tiên.
  So khớp từng ký tự, kể cả dấu gạch ngang dài "–" trong "Thanh 1–4", dấu "+" và chữ Hán 不 一.
- **Người học mới**: trình duyệt chưa có dữ liệu của app (xoá dữ liệu trang hoặc cửa sổ ẩn danh), mở app, làm xong onboarding.
- **Tiến độ tới bài 10**: đã xong bài 1–9, bài "Nét cơ bản và thứ tự nét" "Đang mở".
- **Tiến độ mở hết 12 bài**: QA chạy tay thì làm lần lượt bài 1 → 11 cho tới khi bài 12 "Đang mở" (TC-S7.1-AC1-2 tạo ra đúng trạng
  thái này, kể cả "Tiến độ tới bài 10"); e2e được nạp sẵn tiến độ (cách nạp do dev ghi trong design.md).
- **"Đã mở app một lần"**: mở app khi có mạng và chờ app tải xong (theo cách S1.2 đã nghiệm thu), rồi mới tắt mạng.
- **5 dạng bài tập màn bài hỗ trợ** và cách nhận ra trên màn: chọn thanh điệu (S4.1), phân biệt cặp âm (S4.2), gõ pinyin (S4.3)
  — cả ba có nút "Nghe"; nói theo mẫu (S5.x) — có nút "Nghe mẫu"; viết chữ theo nét — khung viết có nét mờ của một chữ và liên kết
  "Xem thứ tự nét", không có nút nghe.
- **Câu viết**: viết từng nét bằng chuột (máy tính) hoặc ngón tay (điện thoại) theo đúng thứ tự nét của chữ. "人" có 2 nét (phẩy, mác);
  "十" có 2 nét (ngang, sổ dọc).
- **Làm chậm / làm hỏng việc tải dữ liệu nét**: case trạng thái "Đang tải…", "Có lỗi xảy ra" cần làm chậm hoặc chặn việc tải dữ liệu nét
  của chữ đang viết. e2e làm bằng cách chặn yêu cầu trong test; QA chạy tay dùng công cụ dành cho nhà phát triển của trình duyệt (chặn
  yêu cầu tải dữ liệu nét, bỏ qua bản lưu sẵn). Cách cụ thể do dev ghi trong design.md.
- **Câu nói theo mẫu khi không ghi âm được** (trình duyệt tự động, máy không có micro): câu chuyển sang chế độ đọc to rồi tự chấm
  (S5.4) và vẫn tính là đã làm, không phải bỏ qua.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code. `không` = QA chạy tay mỗi lần nghiệm thu (nghe bằng tai, thiết bị thật),
hoặc là phần Dev phủ ở tầng thấp hơn (kiểm tra nội dung, component/hook) theo mục "Ghi chú" cuối file.

## Nội dung 12 bài và audio

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC1-1 | S7.1-AC1 Mỗi bài có ít nhất 2 dạng bài tập | Chức năng | Có tiến độ mở hết 12 bài; mở lần lượt từng bài, đi qua mọi câu, ghi dạng bài tập của từng câu | Bài nào cũng có câu thuộc ít nhất 2 dạng khác nhau trong 5 dạng đã hỗ trợ | không |
| TC-S7.1-AC1-2 | S7.1-AC1 Không bài nào có câu phải bỏ qua | Chức năng | Người học mới; làm lần lượt 12 bài từ bài 1 tới bài 12, trả lời mọi câu (đúng hay sai đều được; câu viết thì viết đủ các nét) rồi bấm "Tiếp tục" | Không câu nào hiện lựa chọn "Bỏ qua câu này"; cuối mỗi bài không có thông báo đã bỏ qua câu; sau mỗi bài, bài đó "Đã xong" và bài kế "Đang mở"; cuối cùng cả 12 bài "Đã xong" | e2e |
| TC-S7.1-AC1-3 | S7.1-AC1 Không bài nào có câu phải bỏ qua | Biên | Chặn quyền micro của trang; mở một bài có câu nói theo mẫu, làm hết các câu (câu nói dùng chế độ đọc to rồi tự chấm) | Câu nói theo mẫu không hiện lựa chọn bỏ qua; bài kết thúc không có thông báo đã bỏ qua câu và bài "Đã xong" trên lộ trình | không |
| TC-S7.1-AC1-4 | S7.1-AC1 Mỗi bài có câu nghe | Chức năng | Có tiến độ mở hết 12 bài; mở lần lượt từng bài, đi qua các câu | Mỗi bài, kể cả bài 10 và 11, có ít nhất một câu có nút "Nghe" | e2e |
| TC-S7.1-AC1-5 | S7.1-AC1 Mọi từ và câu của bài đều có audio | Chức năng | Có mạng; ở mọi câu có nút "Nghe" hoặc "Nghe mẫu" của 12 bài, bấm nút đó | Mỗi lần bấm đều bắt đầu phát audio có thời lượng lớn hơn 0; không có thông báo lỗi phát audio | e2e |
| TC-S7.1-AC1-6 | S7.1-AC1 Mọi từ và câu của bài đều có audio | Chức năng | Như TC-S7.1-AC1-5, nghe bằng tai trên máy thật (bật loa) | Mỗi lần bấm đều nghe được tiếng, không im lặng, không bị cắt cụt giữa chừng | không |
| TC-S7.1-AC1-7 | S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện | Chức năng | Có tiến độ mở hết 12 bài; ở mỗi câu có nút "Nghe"/"Nghe mẫu" của 12 bài: bấm nghe, trả lời, đọc đáp án màn hiện sau khi trả lời (với câu nói theo mẫu: đọc từ/câu mẫu đang hiện), bấm nghe lại | Tiếng nghe được (bằng tai) đúng là từ/câu của đáp án hoặc mẫu đang hiện ở câu đó, đúng cả thanh điệu; lần bấm trước và sau khi trả lời phát cùng một từ/câu | không |
| TC-S7.1-AC1-8 | S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện | Biên | Ở một câu có nút "Nghe", bấm "Nghe" rồi trả lời và bấm "Tiếp tục" ngay khi audio còn đang phát; ở câu kế bấm "Nghe" | Audio của câu trước dừng hoặc không còn nghe khi sang câu kế; bấm "Nghe" ở câu kế phát từ/câu của câu kế, không phát lại từ của câu trước | e2e |
| TC-S7.1-AC1-9 | S7.1-AC1 Mọi câu thuộc dạng đã hỗ trợ | Chức năng | Kết quả ghi được ở TC-S7.1-AC1-1 | Mọi câu của 12 bài đều là một trong 5 dạng: chọn thanh điệu, phân biệt cặp âm, gõ pinyin, nói theo mẫu, viết chữ theo nét; không câu nào là dạng khác | không |
| TC-S7.1-AC1-10 | S7.1-AC1 Bài 2 không hỏi từ có biến điệu trong câu chọn thanh và gõ pinyin | Chức năng | Có tiến độ mở bài 2; làm hết bài "Thanh nhẹ và biến điệu (3-3, 不, 一)"; ở mỗi câu chọn thanh và gõ pinyin, ghi từ màn hiện sau khi trả lời | Không từ nào trong các câu đó có chữ "不", chữ "一", hoặc có hai âm tiết thanh 3 liền nhau (ví dụ "你好") | không |
| TC-S7.1-AC1-11 | S7.1-AC1 Bài 2 có câu nói theo mẫu với từ có biến điệu | Chức năng | Như TC-S7.1-AC1-10, ghi từ/câu mẫu của các câu nói theo mẫu | Có ít nhất một câu nói theo mẫu dùng từ có chữ "不", chữ "一", hoặc hai âm tiết thanh 3 liền nhau; bấm "Nghe mẫu" thì nghe được cách đọc có biến điệu | không |

## Câu viết chữ trong màn bài

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC1-12 | S7.1-AC1 Câu viết hiện khung viết của đúng chữ | Chức năng | Tiến độ tới bài 10; mở bài "Nét cơ bản và thứ tự nét", đi tới câu viết chữ "人" | Màn hiện khung viết của chữ "人" với đủ 2 nét mờ của cả chữ, chưa nét nào được đánh dấu đã viết; không có lựa chọn bỏ qua; có liên kết "Xem thứ tự nét" | e2e |
| TC-S7.1-AC1-13 | S7.1-AC1 Câu viết hiện khung viết của đúng chữ | Mobile 375 | Khổ 375×812 (điện thoại thật nếu có); như TC-S7.1-AC1-12, rồi viết đủ 2 nét bằng ngón tay | Khung viết nằm trọn trong màn, không cuộn ngang; liên kết "Xem thứ tự nét" nhìn thấy; vuốt trong khung để viết thì trang không cuộn theo; viết xong hiện "Đúng" và "Tiếp tục" | không |
| TC-S7.1-AC1-14 | S7.1-AC1 Câu viết hiện khung viết của đúng chữ | Sáng/Tối | Ở câu viết chữ "人", xem ở chế độ sáng và tối; viết sai một nét để hiện thông báo sai | Ở cả hai chế độ: nét mờ của chữ nhìn thấy được trên nền khung, nét đã viết phân biệt rõ với nét mờ, thông báo sai nét và liên kết "Xem thứ tự nét" đọc được rõ | không |
| TC-S7.1-AC1-15 | S7.1-AC1 Câu viết hiện khung viết của đúng chữ | Biên | Ở câu viết chữ "十", viết sai nét đầu 3 lần liên tiếp | Sau lần sai thứ 3 khung hiện gợi ý cho nét đang chờ (như màn luyện viết S6.2); câu vẫn chưa có "Đúng"/"Sai", chưa có "Tiếp tục"; viết đúng thì gợi ý ẩn và khung chờ nét kế | không |
| TC-S7.1-AC1-16 | S7.1-AC1 Khung viết trong bài nhận focus bàn phím | A11y | Ở câu viết chữ "人", chỉ dùng bàn phím, nhấn Tab cho tới khi khung viết nhận focus | Khung viết nhận được focus bằng Tab (thứ tự Tab đi qua khung) | e2e |
| TC-S7.1-AC1-17 | S7.1-AC1 Khung viết trong bài nhận focus bàn phím | A11y | Như TC-S7.1-AC1-16, ở chế độ sáng và tối, bật trình đọc màn hình (VoiceOver hoặc NVDA) | Khung có viền focus nhìn thấy rõ ở cả hai chế độ; trình đọc màn hình đọc nhãn của khung có nêu chữ "人" | không |
| TC-S7.1-AC1-18 | S7.1-AC1 Viết sai nét trong câu viết chưa kết thúc câu | Chức năng | Ở câu viết chữ "十", khi khung đang chờ nét ngang thì viết nét sổ dọc | Màn hiện thông báo viết sai nét; chưa hiện "Đúng" hay "Sai" của câu; chưa có nút "Tiếp tục"; thanh tiến độ không đổi | e2e |
| TC-S7.1-AC1-19 | S7.1-AC1 Viết xong chữ thì câu được tính đúng | Chức năng | Ở câu viết chữ "十" (câu k / n), viết sai một nét một lần, rồi viết đúng nét ngang và nét sổ dọc; bấm "Tiếp tục" | Sau nét cuối màn hiện "Đúng" và nút "Tiếp tục"; bấm "Tiếp tục" thì sang câu kế, thanh tiến độ hiện "Câu k+1 / n" | e2e |
| TC-S7.1-AC1-20 | S7.1-AC1 Viết xong chữ thì câu được tính đúng | A11y | Ở câu viết, viết xong nét cuối; không dùng chuột nữa, nhấn Tab | Focus tới được nút "Tiếp tục", có viền focus nhìn thấy; nhấn Enter thì sang câu kế | không |
| TC-S7.1-AC1-21 | S7.1-AC1 Câu viết chỉ có kết quả Đúng | Chức năng | Ở câu viết chữ "十", viết sai nét 4 lần, rồi viết đúng đủ 2 nét | Màn hiện "Đúng" và nút "Tiếp tục"; không lúc nào hiện "Sai" của câu; không hiện giải thích | e2e |
| TC-S7.1-AC1-22 | S7.1-AC1 Câu viết đã Đúng thì khung bị khóa | Chức năng | Ở câu viết chữ "十", viết đủ 2 nét để màn hiện "Đúng"; vẽ thêm một nét bất kỳ vào khung viết | Khung không thêm nét, không báo sai nét; màn vẫn hiện "Đúng" và nút "Tiếp tục"; trên màn không có nút "Viết lại" | e2e |
| TC-S7.1-AC1-23 | S7.1-AC1 Làm hết bài có câu viết thì bài Đã xong | Chức năng | Tiến độ tới bài 10; làm hết các câu của bài "Nét cơ bản và thứ tự nét", câu viết thì viết đủ nét (có thể sai nét vài lần), không bỏ qua câu nào; ghi số câu viết và số câu trả lời đúng của các dạng khác; mở màn Lộ trình | Màn báo đã làm xong các câu của bài; số câu đúng trong tổng kết bằng số câu viết cộng số câu đúng của các dạng khác; trên Lộ trình bài "Nét cơ bản và thứ tự nét" có nhãn "Đã xong", bài "30 bộ thủ phổ biến" có nhãn "Đang mở" | e2e |

## Câu viết khi tải dữ liệu nét

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC1-24 | S7.1-AC1 Câu viết đang tải dữ liệu nét | Chức năng | Làm chậm việc tải dữ liệu nét; đi tới câu viết chữ "人" của bài "Nét cơ bản và thứ tự nét" | Trong lúc chờ màn hiện "Đang tải…"; không có khung viết, không có liên kết "Xem thứ tự nét", chưa có nút "Tiếp tục"; tải xong thì hiện khung viết của chữ "人" | e2e |
| TC-S7.1-AC1-25 | S7.1-AC1 Câu viết tải dữ liệu nét lỗi | Chức năng | Chặn việc tải dữ liệu nét; đi tới câu viết chữ "人" | Màn hiện "Có lỗi xảy ra", nút "Thử lại" và lựa chọn "Bỏ qua câu này"; không có khung viết, không có liên kết "Xem thứ tự nét", không có dòng "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S7.1-AC1-26 | S7.1-AC1 Câu viết tải dữ liệu nét lỗi | A11y | Như TC-S7.1-AC1-25, chỉ dùng bàn phím | Tab tới được "Thử lại" và "Bỏ qua câu này", cả hai có viền focus nhìn thấy, Enter kích hoạt được | không |
| TC-S7.1-AC1-27 | S7.1-AC1 Câu viết thử lại sau khi tải lỗi | Chức năng | Từ TC-S7.1-AC1-25, bỏ chặn việc tải dữ liệu nét rồi bấm "Thử lại" | Thông báo "Có lỗi xảy ra" biến mất; màn hiện khung viết của chữ "人" và liên kết "Xem thứ tự nét"; không còn "Bỏ qua câu này" | e2e |
| TC-S7.1-AC1-28 | S7.1-AC1 Câu viết tải lỗi rồi bỏ qua | Chức năng | Chặn việc tải dữ liệu nét; ở bài "Nét cơ bản và thứ tự nét", tới một câu viết không phải câu cuối (câu k / n) đang hiện "Có lỗi xảy ra", bấm "Bỏ qua câu này", làm hết các câu còn lại (câu viết khác cũng bỏ qua nếu vẫn lỗi; ghi số câu đã bỏ qua); mở màn Lộ trình | Sau khi bỏ qua màn hiện câu kế với "Câu k+1 / n"; cuối bài màn báo đã bỏ qua đúng số câu đã bỏ và bài chưa hoàn thành, không báo đã làm xong; trên Lộ trình bài không có nhãn "Đã xong" | e2e |
| TC-S7.1-AC1-29 | S7.1-AC1 Câu viết gặp chữ không có dữ liệu nét khi chạy app | Biên | Dev phủ ở tầng component/hook với dữ liệu thử (câu viết có chữ mà dữ liệu nét báo "không có", không phải lỗi tải); bản build thật không tạo được trạng thái này. Tới câu đó, chọn "Bỏ qua câu này", làm hết các câu còn lại | Màn hiện "Chưa có dữ liệu nét cho chữ này."; không có khung viết, không có liên kết "Xem thứ tự nét", không có "Thử lại", có "Bỏ qua câu này"; bỏ qua thì sang câu kế; cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành (trên Lộ trình bài không có nhãn "Đã xong") | không |

## Kiểm tra nội dung với câu viết

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC3-1 | S7.1-AC3 Câu viết dùng chữ không có dữ liệu nét thì kiểm tra nội dung báo lỗi | Biên | Chỉ phủ bằng test của luật kiểm tra nội dung (Dev): nội dung thử có một bài có câu viết chữ "爱" (có trong từ điển HSK 1), dữ liệu nét thử không có chữ "爱"; chạy kiểm tra nội dung. QA không tái tạo được bằng nội dung thật (mọi chữ HSK 1 đều có dữ liệu nét), không chạy tay; khi nghiệm thu chỉ xem test này có trong bộ test và CI xanh | Kiểm tra kết thúc không thành công; có dòng lỗi (không phải cảnh báo) nêu chữ "爱" và lý do là thiếu dữ liệu nét; không có lỗi từ ngoài từ điển cho chữ "爱" | không |
| TC-S7.1-AC3-2 | S7.1-AC3 Câu viết dùng từ nhiều chữ thì kiểm tra nội dung báo lỗi | Biên | Trên nội dung thử, thêm một câu viết từ "爸爸"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; có dòng lỗi nêu từ "爸爸" | không |
| TC-S7.1-AC3-3 | S7.1-AC3 Câu viết rỗng thì kiểm tra nội dung báo lỗi | Biên | Trên nội dung thử, thêm một câu viết không ghi chữ nào; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; có dòng lỗi nói câu viết rỗng | không |
| TC-S7.1-AC3-4 | S7.1-AC3 Câu viết không phải chữ Hán thì kiểm tra nội dung báo lỗi | Biên | Trên nội dung thử, thêm một câu viết "abc"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; có dòng lỗi nêu "abc" | không |
| TC-S7.1-AC3-5 | S7.1-AC3 Mọi câu viết của 12 bài có dữ liệu nét | Chức năng | Có tiến độ mở hết 12 bài; đi qua mọi câu viết của 12 bài | Mỗi câu viết hiện khung viết của đúng một chữ Hán; không câu nào hiện "Chưa có dữ liệu nét cho chữ này." | e2e |

## Lối vào xem thứ tự nét và luyện viết

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC2-1 | S7.1-AC2 Bài "Nét cơ bản và thứ tự nét" có câu viết | Chức năng | Tiến độ tới bài 10; đi qua các câu của bài "Nét cơ bản và thứ tự nét" | Có câu viết chữ "人" và câu viết chữ "十" | e2e |
| TC-S7.1-AC2-2 | S7.1-AC2 Bài "30 bộ thủ phổ biến" có câu viết | Chức năng | Có tiến độ mở hết 12 bài; đi qua các câu của bài "30 bộ thủ phổ biến", ghi chữ của từng câu viết | Có ít nhất một câu viết chữ | e2e |
| TC-S7.1-AC2-3 | S7.1-AC2 Câu viết của bài "30 bộ thủ phổ biến" là chữ trong từ điển | Chức năng | Với từng chữ ghi được ở TC-S7.1-AC2-2, tra trong màn từ điển của app | Mỗi chữ tra được trong từ điển HSK 1 của app và câu viết của nó hiện khung viết (có dữ liệu nét); không có bộ thủ không đứng riêng như "氵", "扌", "亻" | không |
| TC-S7.1-AC2-4 | S7.1-AC2 Từ câu viết mở màn xem thứ tự nét | Chức năng | Ở câu viết chữ "人" của bài "Nét cơ bản và thứ tự nét", bấm "Xem thứ tự nét" | Màn xem thứ tự nét của chữ "人" mở (hiện chữ "人", animation nét), có nút "Tập viết" | e2e |
| TC-S7.1-AC2-5 | S7.1-AC2 Từ bài vào luyện viết qua màn thứ tự nét | Chức năng | Từ TC-S7.1-AC2-4, bấm "Tập viết" | Màn luyện viết của chữ "人" mở, khung viết có nét mờ của chữ "人" | e2e |
| TC-S7.1-AC2-6 | S7.1-AC2 Quay lại bài từ màn thứ tự nét | Chức năng | Ở câu viết thứ k của bài (thanh tiến độ "Câu k / n"), viết đúng 1 nét, rồi bấm "Xem thứ tự nét"; trên màn thứ tự nét bấm nút quay lại của trình duyệt | Màn bài hiện lại câu thứ k với "Câu k / n" (không về câu 1, không sang câu khác); khung viết trống, chưa nét nào được đánh dấu đã viết | e2e |
| TC-S7.1-AC2-7 | S7.1-AC2 Quay lại bài từ màn thứ tự nét | Mobile 375 | Điện thoại thật, khổ 375; như TC-S7.1-AC2-6 nhưng quay lại bằng cử chỉ/nút quay lại của hệ điều hành | Về đúng câu thứ k, khung viết trống | không |
| TC-S7.1-AC2-8 | S7.1-AC2 Liên kết Xem thứ tự nét dùng được bằng bàn phím | A11y | Ở câu viết chữ "人", chỉ dùng bàn phím: nhấn Tab cho tới liên kết "Xem thứ tự nét", nhấn Enter | Liên kết nhận focus bằng Tab; Enter mở màn xem thứ tự nét của chữ "人" | e2e |
| TC-S7.1-AC2-9 | S7.1-AC2 Liên kết Xem thứ tự nét dùng được bằng bàn phím | A11y | Như TC-S7.1-AC2-8, ở chế độ sáng và tối, bật trình đọc màn hình (VoiceOver hoặc NVDA) | Liên kết có viền focus nhìn thấy rõ ở cả hai chế độ; trình đọc màn hình đọc tên "Xem thứ tự nét" | không |
| TC-S7.1-AC2-10 | S7.1-AC2 Quay lại bài thì tổng kết chỉ tính từ câu viết đó | Chức năng | Tiến độ tới bài 10; ở bài "Nét cơ bản và thứ tự nét", làm đúng mọi câu trước câu viết thứ k (câu k / n), để màn mở ít nhất 2 phút trước khi tới câu k; ở câu k bấm "Xem thứ tự nét", quay lại bằng nút quay lại của trình duyệt; làm đúng câu k tới câu n trong dưới 1 phút | Màn tổng kết hiện "Đúng m / m câu" và "Sai 0 câu" với m = n − k + 1 (số câu từ câu k tới hết bài); thời gian trong tổng kết dưới 2 phút (chỉ tính từ lúc câu k hiện lại) | e2e |
| TC-S7.1-AC2-15 | S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét | Chức năng | Tiến độ tới bài 10; ở câu viết chữ "人" của bài "Nét cơ bản và thứ tự nét" (thấy liên kết "Xem thứ tự nét"), viết đủ 2 nét để màn hiện "Đúng" | Màn hiện "Đúng" và nút "Tiếp tục"; liên kết "Xem thứ tự nét" không còn trên màn | e2e |
| TC-S7.1-AC2-16 | S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét | A11y | Từ TC-S7.1-AC2-15, chỉ dùng bàn phím nhấn Tab qua hết các phần tử trên màn | Focus không dừng ở liên kết "Xem thứ tự nét" nào; tới được nút "Tiếp tục" và Enter đi sang câu kế | không |

## Lộ trình, kiểm tra nội dung, onboarding

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC2-11 | S7.1-AC2 Lộ trình có đủ 12 bài Nhập môn đúng thứ tự | Chức năng | Người học mới; mở màn Lộ trình | Giai đoạn đầu tiên là "Nhập môn", có đúng một nhóm, nhóm có đúng 12 bài với tiêu đề nguyên văn theo đúng thứ tự trong danh sách ở "Điều kiện đầu chung" | e2e |
| TC-S7.1-AC2-12 | S7.1-AC2 Lộ trình có đủ 12 bài Nhập môn đúng thứ tự | Mobile 375 | Khổ 375×812, mở màn Lộ trình, cuộn qua 12 bài Nhập môn | Tiêu đề dài ("Thanh nhẹ và biến điệu (3-3, 不, 一)", "Ôn tổng hợp + câu chào đầu tiên") hiện đầy đủ, không bị cắt hay thay bằng "…"; trang không cuộn ngang | không |
| TC-S7.1-AC2-13 | S7.1-AC2 Không còn bài mẫu cũ | Chức năng | Mở màn Lộ trình | Không có bài nào tên "Bốn thanh điệu" | e2e |
| TC-S7.1-AC2-14 | S7.1-AC2 Tiêu đề trên màn bài khớp lộ trình | Chức năng | Có tiến độ mở hết 12 bài; từ màn Lộ trình mở lần lượt từng bài | Tiêu đề trên màn bài giống từng ký tự tiêu đề của bài đó trên lộ trình, ở cả 12 bài | e2e |
| TC-S7.1-AC3-6 | S7.1-AC3 Kiểm tra nội dung chạy qua | Chức năng | Chạy kiểm tra nội dung trên nhánh có 12 bài Nhập môn | Kiểm tra kết thúc thành công, không có dòng lỗi nào (dòng cảnh báo, ví dụ nghĩa tiếng Việt chưa review, được phép) | không |
| TC-S7.1-AC3-7 | S7.1-AC3 Nội dung đã build khớp file soạn | Chức năng | Chạy kiểm tra nội dung sau khi soạn xong 12 bài (cùng lần chạy với TC-S7.1-AC3-6) | Không có báo lỗi nội dung đã build lệch với file soạn | không |
| TC-S7.1-AC4-1 | S7.1-AC4 Xong onboarding vào thẳng bài "Thanh 1–4" | Chức năng | Trình duyệt chưa có dữ liệu của app; mở app, làm xong onboarding | Người học vào ngay màn học có tiêu đề "Thanh 1–4" (không qua màn Lộ trình); thanh tiến độ hiện "Câu 1 / n" với n là số câu của bài | e2e |
| TC-S7.1-AC4-2 | S7.1-AC4 Xong onboarding vào thẳng bài "Thanh 1–4" | Mobile 375 | Khổ 375×812, như TC-S7.1-AC4-1 | Tiêu đề "Thanh 1–4" và "Câu 1 / n" nhìn thấy mà không cần cuộn ngang | không |
| TC-S7.1-AC4-3 | S7.1-AC4 Bài 1 đang mở trên lộ trình | Chức năng | Người học mới, chưa làm câu nào; mở màn Lộ trình | Bài "Thanh 1–4" có nhãn "Đang mở"; 11 bài Nhập môn còn lại có nhãn "Đã khóa" | e2e |

## Offline

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S7.1-AC5-1 | S7.1-AC5 Offline mở được cả 12 bài | Offline | Có tiến độ mở hết 12 bài; đã mở app một lần; tắt mạng; mở lần lượt từng bài trong 12 bài | Mỗi bài hiện đúng tiêu đề và câu thứ nhất ("Câu 1 / n"); không có thông báo lỗi tải | e2e |
| TC-S7.1-AC5-2 | S7.1-AC5 Offline mở được cả 12 bài | Offline | Trên điện thoại thật (khổ 375), có tiến độ mở hết 12 bài, đã mở app một lần, bật chế độ máy bay, đóng hẳn app rồi mở lại, mở bài "Ôn tổng hợp + câu chào đầu tiên" | Bài mở được, hiện đúng tiêu đề và câu thứ nhất, không có thông báo lỗi tải | không |
| TC-S7.1-AC5-3 | S7.1-AC5 Offline phát được mọi audio của 12 bài | Offline | Có tiến độ mở hết 12 bài; đã mở app một lần; tắt mạng; ở mọi câu có nút "Nghe" hoặc "Nghe mẫu" của 12 bài bấm nút đó | Mọi audio tải được và bắt đầu phát (thời lượng lớn hơn 0); không có thông báo lỗi phát audio | e2e |
| TC-S7.1-AC5-4 | S7.1-AC5 Offline phát được mọi audio của 12 bài | Offline | Trên điện thoại thật ở chế độ máy bay, bấm "Nghe"/"Nghe mẫu" ở vài câu của bài 1, bài 6 và bài 12 | Nghe được tiếng ở mọi lần bấm | không |
| TC-S7.1-AC5-5 | S7.1-AC5 Offline làm hết bài thì bài xong và bài kế mở | Offline | Người học mới; đã mở app một lần; tắt mạng; làm hết các câu của bài "Thanh 1–4" mà không bỏ qua câu nào; mở màn Lộ trình | Bài "Thanh 1–4" có nhãn "Đã xong"; bài "Thanh nhẹ và biến điệu (3-3, 不, 一)" có nhãn "Đang mở"; các bài 3–12 vẫn "Đã khóa" | e2e |
| TC-S7.1-AC5-6 | S7.1-AC5 Offline làm được câu viết | Offline | Chỉ chạy bằng e2e: trình duyệt mới được nạp sẵn tiến độ mở hết 12 bài (không đi qua bài 10, 11 khi có mạng); mở app một lần khi có mạng, chờ tải xong; tắt mạng; đi qua mọi câu viết của bài "Nét cơ bản và thứ tự nét" và "30 bộ thủ phổ biến", viết đủ nét | Mỗi câu viết hiện khung viết của đúng chữ đó; không hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này."; viết xong mỗi câu hiện "Đúng" | e2e |
| TC-S7.1-AC5-7 | S7.1-AC5 Offline làm được câu viết | Offline | Trên điện thoại thật, có tiến độ mở hết 12 bài, đã mở app một lần, bật chế độ máy bay; mở bài "30 bộ thủ phổ biến", viết xong một câu viết; ở câu viết kế bấm "Xem thứ tự nét" rồi "Tập viết" | Câu viết hiện khung viết, viết xong hiện "Đúng"; màn thứ tự nét và màn luyện viết mở được, hiện đúng chữ, không có thông báo lỗi tải | không |

## Màn bài (lesson-runner): hồi quy và phần đổi

Các Scenario S3.2 dưới đây không đổi câu chữ nhưng nằm trong Requirement bị sửa; chạy lại để chắc dạng viết chữ không làm hỏng chúng.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S3.2-AC2-1 | S3.2-AC2 Trả lời đúng được báo ngay | Chức năng | Ở bài "Thanh 1–4", trả lời đúng một câu chọn thanh điệu | Màn hiện ngay "Đúng" và nút "Tiếp tục"; thanh tiến độ chưa đổi | e2e |
| TC-S3.2-AC2-2 | S3.2-AC2 Trả lời sai được báo ngay | Chức năng | Ở bài "Thanh 1–4", trả lời sai một câu chọn thanh điệu | Màn hiện ngay "Sai" và nút "Tiếp tục"; thanh tiến độ chưa đổi | e2e |
| TC-S3.2-AC2-3 | S3.2-AC2 Trả lời xong thì không trả lời lại được | Chức năng | Sau TC-S3.2-AC2-1, bấm một đáp án khác; bấm "Tiếp tục" rồi bấm một đáp án ở câu kế | Bấm đáp án khác không đổi kết quả "Đúng"; ở câu kế các đáp án bấm được | e2e |
| TC-S3.2-AC2-4 | S3.2-AC2 Chưa trả lời thì chưa có kết quả | Chức năng | Mở một câu bất kỳ (kể cả câu viết chữ "人") và chưa trả lời / chưa viết nét nào | Màn không hiện "Đúng", "Sai" hay nút "Tiếp tục" | e2e |
| TC-S3.2-X1-1 | S3.2-X1 Bỏ qua câu thì không báo là đã làm xong | Biên | Bản build thử có một bài 3 câu đều thuộc dạng màn bài chưa hỗ trợ (dev chuẩn bị); bỏ qua cả 3 câu | Màn báo đã bỏ qua 3 câu và bài chưa hoàn thành; không báo đã làm xong các câu của bài; thông báo không nêu lý do "dạng bài chưa có" | không |
| TC-S3.2-X1-2 | S3.2-X1 Bỏ qua một câu giữa bài | Biên | Bản build thử có bài 3 câu, câu 2 thuộc dạng chưa hỗ trợ; làm câu 1, bỏ qua câu 2, làm câu 3 | Sau câu 2 màn hiện "Câu 3 / 3"; cuối bài màn báo đã bỏ qua 1 câu và bài chưa hoàn thành | không |
| TC-S7.1-AC1-30 | S7.1-AC1 Bỏ qua câu viết thiếu dữ liệu nét thì bài chưa hoàn thành | Chức năng | Dev phủ ở tầng component/hook như TC-S7.1-AC1-29 (bài 3 câu, câu 2 là câu viết hiện "Chưa có dữ liệu nét cho chữ này."); làm câu 1, bỏ qua câu 2, làm câu 3; đọc thông báo cuối bài | Màn báo đã bỏ qua 1 câu và bài chưa hoàn thành; thông báo không có cụm nói lý do là dạng bài chưa có | không |

## Ghi chú cho QA và Dev

- **Phần Dev kiểm ở tầng nội dung** (Vitest hoặc luật kiểm tra nội dung, theo bảng tầng test của `spec-driven.md` §4), QA vẫn đối chiếu
  khi nghiệm thu: TC-S7.1-AC1-1, -9 (đếm dạng bài, dạng chưa hỗ trợ), -10, -11 (bài 2 và biến điệu), phần "mọi từ, câu có file audio trong
  bản build, dung lượng lớn hơn 0" của TC-S7.1-AC1-5, TC-S7.1-AC2-1, -2, -3 (câu viết bài 10, 11, chữ trong từ điển) và TC-S7.1-AC3-5 (mọi
  câu viết một chữ, có dữ liệu nét). Các Scenario này viết theo "nội dung đã build" nên kiểm ở tầng nội dung chắc hơn đi qua giao diện; case
  giao diện là lớp đối chiếu.
- **TC-S7.1-AC3-1 → -4, -6, -7**: lệnh kiểm tra nội dung chuẩn là `pnpm content:check`; -1 → -4 Dev phủ bằng test của luật kiểm tra nội dung
  (dữ liệu thử, không sửa bài thật). CI chạy lại trên mọi PR, QA chỉ cần xem kết quả check của CI trên PR code. -1 cần dữ liệu nét thử thiếu
  chữ "爱" nên chỉ có ở test, không chạy tay; -2 → -4 nếu chạy tay thì hoàn tác thay đổi tạm sau khi chạy.
- **TC-S7.1-AC1-2** vừa phủ Scenario "không câu bỏ qua" vừa là cách QA tạo "Tiến độ tới bài 10" và "Tiến độ mở hết 12 bài" cho các case
  khác; chạy nó trước. Trong e2e, câu viết được làm bằng thao tác kéo chuột theo từng nét của chữ.
- **TC-S7.1-AC1-7, -8** (Scenario "Nút Nghe phát đúng từ hoặc câu đang hiện"): Dev phủ phần tự động ở tầng component/hook theo `spec-driven.md` §4
  (bấm "Nghe"/"Nghe mẫu" ở mỗi dạng bài thì yêu cầu phát đúng audio của từ/câu câu đó đang hỏi; sang câu kế thì không phát audio của câu
  trước). -7 vẫn chạy tay vì chỉ tai người mới xác nhận được tiếng phát ra đúng từ: với câu chọn thanh điệu / phân biệt cặp âm / gõ pinyin,
  từ đang hỏi chỉ hiện ra sau khi trả lời, nên QA so tiếng nghe được với đáp án màn hiện.
- **TC-S7.1-AC1-24 → -28** (đang tải, lỗi tải, thử lại, bỏ qua sau lỗi): cần làm chậm hoặc chặn việc tải dữ liệu nét (xem "Điều kiện đầu
  chung"). Khi app đã lưu sẵn dữ liệu nét, QA chạy tay phải bỏ qua bản lưu sẵn thì mới thấy được hai trạng thái này.
- **TC-S7.1-AC1-29, -30**: "chữ không có dữ liệu nét" khác "tải dữ liệu nét lỗi" (-25). Nội dung thật đã bị kiểm tra nội dung chặn chữ không
  có dữ liệu nét, và trên bản build thật chặn việc tải dữ liệu nét chỉ ra "Có lỗi xảy ra" (-25), nên không case e2e nào dựng được trạng thái
  này; Dev phủ ở tầng component/hook với dữ liệu thử (design.md ghi cách), QA không chạy tay mà xem test có trong bộ test và CI xanh. Tương tự TC-S3.2-X1-1, -2 (dạng bài chưa hỗ trợ): Dev phủ ở tầng component/hook với dữ liệu thử, QA đối chiếu nếu có bản build thử.
- **TC-S7.1-AC2-10**: số câu thật của bài "Nét cơ bản và thứ tự nét" do người soạn chọn, nên case viết theo k, n thay cho ví dụ "bài 5 câu, câu 3"
  của Scenario. Mốc 2 phút / 1 phút để phân biệt thời gian tính từ đầu bài với thời gian tính từ lúc câu k hiện lại; e2e có thể điều khiển đồng hồ.
- **TC-S7.1-AC5-6** chỉ chạy bằng e2e: "không đi qua bài 10, 11 khi có mạng" để chắc dữ liệu nét đến từ bản lưu sẵn khi mở app, không phải từ lần
  xem trước; QA chạy tay không tạo được tiến độ mở hết 12 bài mà không đi qua bài 10, 11, nên phần chạy tay là TC-S7.1-AC5-7.
- Sáng/Tối và Mobile 375 của màn Lộ trình, màn bài với 4 dạng cũ, màn thứ tự nét và màn luyện viết đã nghiệm thu ở S3.x, S4.x, S6.1, S6.2;
  ở đây chỉ kiểm phần S7.1 thêm (câu viết trong màn bài, liên kết "Xem thứ tự nét").
- Viết nét là thao tác trỏ (ngoại lệ đường vẽ WCAG, đã chốt trong proposal): không có case làm câu viết chỉ bằng bàn phím; người dùng bàn phím
  có liên kết "Xem thứ tự nét" (TC-S7.1-AC2-8, -9).
