# Test cases: S11.4 Kiểm tra cuối cấp

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Hai nhóm case.** Nhóm "nội dung" (TC-1 … TC-16) đọc nội dung đã build hoặc kết quả của **kiểm tra nội dung** (lệnh kiểm tra nội
  dung chuẩn của dự án), không thao tác trên app. Nhóm "màn bài" (TC-17 trở đi) chạy trên bản build.
- **Cột Tự động** theo `spec-driven.md` §3: `e2e` = Playwright trên bản build; `không` = QA chạy tay mỗi lần nghiệm thu. Riêng nhóm
  nội dung ghi `Vitest`: test tự động cạnh bước kiểm tra nội dung, chạy trong CI, không phải Playwright; khi nghiệm thu QA chỉ xác nhận
  CI xanh và có test mang đúng tên Scenario, không chạy tay.
- **"Nội dung thật"**: nội dung app đúng như trong PR code, không sửa tay trước khi chạy.
- **"Bản sao lỗi"**: bản sao của nội dung thật, chỉ sửa bài được khai báo là bài kiểm tra cuối cấp (hoặc khai báo đó) như ghi ở từng
  case; nội dung thật không bị đổi sau khi chạy. "5 câu nói" nghĩa là đúng 5 câu thuộc kỹ năng nói theo **bảng kỹ năng** (bảng trong yêu
  cầu "Mỗi dạng bài tính cho đúng một kỹ năng" của spec); câu đọc dùng một dạng đọc màn bài đã hỗ trợ.
- Ở bản sao có câu viết vượt một phần tư tổng số câu (TC-2, TC-3, TC-13), kiểm tra nội dung có thể báo thêm lỗi về số câu viết; lỗi đó
  không làm case fail, case chỉ xét lỗi ghi trong cột Kết quả mong đợi.
- **Tiến độ "chỉ xong Nhập môn"**: người học đã đạt mọi bài của giai đoạn Nhập môn, chưa làm bài nào của giai đoạn "HSK 1".
- **Tiến độ "đã xong 15 chủ đề"**: đã đạt mọi bài của giai đoạn trước và cả 15 chủ đề của "HSK 1" (kể cả bài kiểm tra chủ đề thứ 15),
  chưa làm bài cuối cấp. **"Chưa xong chủ đề 15"**: như trên nhưng bài kiểm tra chủ đề thứ 15 chưa đạt.
- **"Không có mic"**: trình duyệt từ chối quyền micro (hoặc không có thiết bị mic), câu nói hiện "đọc to rồi tự chấm" như S5.4.
- **"Có mạng"**: máy đang online khi làm bài (dữ liệu nét của chữ viết tải được).
- Chất lượng câu hỏi (đúng trình độ HSK 1, chỉ dùng từ HSK 1, đáp án đúng, không mơ hồ) là phán đoán của người review, chỉ có ở TC-16.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.4-AC1-1 | S11.4-AC1 Bài kiểm tra cuối cấp có ít nhất 5 câu mỗi kỹ năng | Chức năng | Đọc nội dung thật đã build của bài "Kiểm tra cuối cấp HSK 1"; xếp từng câu vào kỹ năng theo bảng kỹ năng, đếm | Mỗi kỹ năng nghe, nói, đọc, viết có ít nhất 5 câu; số câu viết ≤ một phần tư tổng số câu của bài | Vitest |
| TC-S11.4-AC1-2 | S11.4-AC1 Kiểm tra nội dung báo lỗi khi thiếu hẳn một kỹ năng | Chức năng | Bản sao lỗi: bài cuối cấp có 5 câu nghe, 5 câu đọc, 5 câu viết, không câu nói nào. Chạy kiểm tra nội dung | Kết thúc không thành công; có lỗi nêu tên bài, kỹ năng "nói", 0 câu, cần ít nhất 5; không có lỗi thiếu "nghe", "đọc", "viết" | Vitest |
| TC-S11.4-AC1-3 | S11.4-AC1 Kiểm tra nội dung báo lỗi khi một kỹ năng dưới 5 câu | Biên | Bản sao lỗi: 5 câu nghe, 4 câu nói, 5 câu đọc, 5 câu viết. Chạy kiểm tra nội dung | Kết thúc không thành công; có lỗi nêu tên bài, kỹ năng "nói", 4 câu, cần ít nhất 5; không có lỗi thiếu kỹ năng khác | Vitest |
| TC-S11.4-AC1-4 | S11.4-AC1 Đủ 5 câu mỗi kỹ năng thì không báo lỗi | Biên | Bản sao lỗi: đúng 5 câu nghe, 5 câu nói, 5 câu đọc, 5 câu viết. Chạy kiểm tra nội dung | Không có lỗi nào về số câu theo kỹ năng | Vitest |
| TC-S11.4-AC1-5 | S11.4-AC1 Kiểm tra nội dung chạy qua với nội dung thật | Chức năng | Chạy kiểm tra nội dung trên nội dung thật, đọc toàn bộ kết quả in ra | Kết thúc thành công, 0 lỗi (kể cả không thiếu file audio nào cho câu của bài cuối cấp); cảnh báo không làm case fail | Vitest |
| TC-S11.4-AC1-6 | S11.4-AC1 Kiểm tra nội dung báo lỗi khi câu viết quá một phần tư | Biên | Bản sao lỗi: 5 câu nghe, 5 câu nói, 5 câu đọc, 6 câu viết. Chạy kiểm tra nội dung | Kết thúc không thành công; lỗi nêu tên bài, 6 câu viết trên tổng 21 câu, vượt một phần tư | Vitest |
| TC-S11.4-AC1-7 | S11.4-AC1 Câu viết đúng một phần tư thì không báo lỗi | Biên | Bản sao lỗi: 5 câu nghe, 5 câu nói, 5 câu đọc, 5 câu viết (5/20). Chạy kiểm tra nội dung | Không có lỗi nào về số câu viết | Vitest |
| TC-S11.4-AC1-8 | S11.4-AC1 Nội dung thật khai báo bài cuối cấp HSK 1 | Chức năng | Đọc nội dung thật đã build của app | Bài "Kiểm tra cuối cấp HSK 1" được khai báo là bài kiểm tra cuối cấp; không bài kiểm tra cuối chủ đề nào được khai báo như vậy | Vitest |
| TC-S11.4-AC1-9 | S11.4-AC1 Nội dung không có bài cuối cấp thì không báo lỗi phủ kỹ năng | Chức năng | Bản sao lỗi: bỏ khai báo bài cuối cấp (không bài nào được khai báo); có một bài kiểm tra cuối chủ đề chỉ gồm câu chọn thanh điệu. Chạy kiểm tra nội dung | Không có lỗi nào về số câu theo kỹ năng hay số câu viết | Vitest |
| TC-S11.4-AC1-10 | S11.4-AC1 Bài học thường không được khai báo là bài cuối cấp | Chức năng | Bản sao lỗi: khai báo một bài học thường (không phải bài kiểm tra) là bài kiểm tra cuối cấp. Chạy kiểm tra nội dung | Kết thúc không thành công; lỗi nêu đúng bài học thường đó | Vitest |
| TC-S11.4-AC1-11 | S11.4-AC1 Câu gõ pinyin được tính cho kỹ năng nghe | Chức năng | Bản sao lỗi: 5 câu nói, 5 câu đọc, 5 câu viết, 5 câu nghe đều là "nghe rồi gõ pinyin". Chạy kiểm tra nội dung | Không có lỗi thiếu kỹ năng "nghe" | Vitest |
| TC-S11.4-AC1-12 | S11.4-AC1 Câu nói theo mẫu được tính cho kỹ năng nói | Chức năng | Bản sao lỗi: 5 câu nghe, 5 câu đọc, 5 câu viết, 5 câu nói đều là "nói theo mẫu". Chạy kiểm tra nội dung | Không có lỗi thiếu kỹ năng "nói" | Vitest |
| TC-S11.4-AC1-13 | S11.4-AC1 Câu viết chữ được tính cho kỹ năng viết, không tính cho kỹ năng khác | Chức năng | Bản sao lỗi: 5 câu nghe, 5 câu nói, 5 câu viết chữ, không câu đọc nào. Chạy kiểm tra nội dung | Có lỗi thiếu kỹ năng "đọc" (0 câu); không có lỗi thiếu kỹ năng "viết" | Vitest |
| TC-S11.4-AC1-14 | S11.4-AC1 Câu đọc dạng E10 được tính cho kỹ năng đọc | Chức năng | Điều kiện: ít nhất một dạng đọc của bảng (nhìn chữ chọn nghĩa, sắp xếp câu, điền chỗ trống, đọc hiểu) đã có trong màn bài. Bản sao lỗi: 5 câu nghe, 5 câu nói, 5 câu viết, 5 câu đọc đều thuộc dạng đọc đó; lặp lại với từng dạng đọc đã có | Mỗi lần: không có lỗi thiếu kỹ năng "đọc" | Vitest |
| TC-S11.4-AC1-15 | S11.4-AC1 Mọi câu thuộc dạng bài có trong bảng kỹ năng | Chức năng | Đọc nội dung thật đã build của bài "Kiểm tra cuối cấp HSK 1", xem dạng bài của từng câu | Mọi câu thuộc một dạng có trong bảng kỹ năng; không câu nào là thẻ từ mới, thẻ ngữ pháp hay hội thoại | Vitest |
| TC-S11.4-AC1-16 | S11.4-AC1 Mọi câu thuộc dạng bài có trong bảng kỹ năng | Chức năng | QA đọc toàn bộ câu hỏi của bài cuối cấp trên bản build (hoặc diff nội dung trong PR code) | Mỗi câu đúng trình độ HSK 1, chỉ dùng từ HSK 1, có đáp án đúng duy nhất, không mơ hồ; chữ của câu viết là chữ HSK 1 | không |
| TC-S11.4-AC1-17 | S11.4-AC1 Mọi chữ của câu viết có dữ liệu nét | Chức năng | Đọc nội dung thật đã build của bài "Kiểm tra cuối cấp HSK 1", xem từng chữ của các câu viết chữ | Mọi chữ đều có dữ liệu nét | Vitest |
| TC-S11.4-AC1-18 | S11.4-AC1 Bài kiểm tra cuối cấp đứng ngay sau giai đoạn HSK 1 | Chức năng | Người học mới, mở màn Lộ trình, cuộn tới hết giai đoạn "HSK 1" | Giai đoạn ngay sau "HSK 1" là "Kiểm tra cuối cấp HSK 1", có một nhóm và đúng một bài "Kiểm tra cuối cấp HSK 1"; giai đoạn "HSK 1" có đúng 15 chủ đề | e2e |
| TC-S11.4-AC1-19 | S11.4-AC1 Bài kiểm tra cuối cấp đứng ngay sau giai đoạn HSK 1 | Mobile 375 | Khổ 375×812, chế độ sáng rồi tối. Tiến độ "chưa xong chủ đề 15". Xem giai đoạn, nhóm và bài cuối cấp trên màn Lộ trình (cả nút "Kiểm tra vượt cấp"), mở bài qua nút đó và đi tới màn tổng kết | Tên giai đoạn, tên bài, nhãn trạng thái, nút "Kiểm tra vượt cấp" hiện đủ chữ, không tràn ngang; chữ đọc được ở cả sáng và tối | không |
| TC-S11.4-AC1-20 | S11.4-AC1 Chưa xong chủ đề thứ 15 thì bài cuối cấp khóa và có nút vượt cấp | Chức năng | Tiến độ "chưa xong chủ đề 15". Mở màn Lộ trình, tìm nhóm cuối cấp | Bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã khóa" (bằng chữ); nhóm của bài hiện nút "Kiểm tra vượt cấp" | e2e |
| TC-S11.4-AC1-21 | S11.4-AC1 Đạt bài kiểm tra chủ đề thứ 15 thì bài cuối cấp mở | Chức năng | Tiến độ "chưa xong chủ đề 15". Làm bài kiểm tra chủ đề thứ 15 tới khi màn tổng kết hiện "Bạn đã đạt", rồi mở màn Lộ trình | Bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đang mở" và mở được màn bài; nhóm của bài không hiện nút "Kiểm tra vượt cấp" | e2e |
| TC-S11.4-AC1-22 | S11.4-AC1 Đạt qua Kiểm tra vượt cấp thì chỉ bài cuối cấp xong | Chức năng | Tiến độ "chỉ xong Nhập môn", có mạng, không có mic. Trên màn Lộ trình bấm "Kiểm tra vượt cấp" của nhóm cuối cấp; trả lời đúng mọi câu nghe và đọc, chọn "Đúng" ở mọi câu nói, viết xong mọi chữ; tới màn tổng kết rồi quay lại màn Lộ trình | Màn tổng kết hiện "Bạn đã đạt". Bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã xong", nhóm không còn nút "Kiểm tra vượt cấp"; bài đầu của chủ đề thứ hai trong "HSK 1" vẫn "Đã khóa" | e2e |
| TC-S11.4-AC1-23 | S11.4-AC1 Không câu nào phải bỏ qua | Chức năng | Tiến độ "đã xong 15 chủ đề", có mạng, không có mic. Mở bài "Kiểm tra cuối cấp HSK 1", trả lời lần lượt từng câu tới câu cuối | Không câu nào hiện "Bỏ qua câu này"; câu nói hiện cách đọc to rồi tự chấm ("Đúng" / "Chưa đúng"); câu viết hiện khung viết chữ; làm được tới màn tổng kết | e2e |
| TC-S11.4-AC1-24 | S11.4-AC1 Không câu nào phải bỏ qua | Chức năng | Tiến độ "đã xong 15 chủ đề", có mạng, máy thật có mic, cho phép quyền micro. Làm bài cuối cấp, ở câu nói đọc to câu mẫu | Câu nói ghi âm và chấm tự động bằng nhận dạng giọng nói (S5.3); không câu nào hiện "Bỏ qua câu này" | không |
| TC-S11.4-AC1-25 | S11.4-AC1 Không câu nào phải bỏ qua | Offline | Tiến độ "đã xong 15 chủ đề", không có mic. Có mạng, mở bài cuối cấp và đi qua mọi câu viết (để dữ liệu nét được tải); thoát bài, tắt mạng, mở lại bài và làm tới câu cuối | Không câu nào hiện "Bỏ qua câu này"; câu viết vẫn viết được; làm được tới màn tổng kết | không |
| TC-S11.4-AC1-26 | S11.4-AC1 Làm đúng hết cả 4 kỹ năng thì đạt | Chức năng | Tiến độ "đã xong 15 chủ đề", có mạng, không có mic. Trả lời đúng mọi câu nghe và đọc, chọn "Đúng" ở mọi câu nói, viết xong mọi chữ. Ở màn tổng kết, quay lại màn Lộ trình | Màn tổng kết hiện "100%" và "Bạn đã đạt", không có nút "Làm lại"; trên màn Lộ trình bài "Kiểm tra cuối cấp HSK 1" có nhãn "Đã xong" | e2e |
| TC-S11.4-AC1-27 | S11.4-AC1 Làm đúng hết cả 4 kỹ năng thì đạt | A11y | Chỉ dùng bàn phím (Tab, Shift+Tab, Enter, Space): từ màn Lộ trình mở bài cuối cấp, trả lời một câu nghe, một câu đọc, một câu nói (không có mic, tự chấm) và một câu viết | Tới và kích hoạt được mọi nút, lựa chọn; focus luôn nhìn thấy; nút và lựa chọn có tên đọc được bằng trình đọc màn hình. Câu viết theo nét không làm được bằng bàn phím thì ghi lại, xử lý như các bài có viết chữ hiện có (S7.1) | không |
| TC-S11.4-AC1-28 | S11.4-AC1 Sai nhiều câu thì chưa đạt và làm lại được | Chức năng | Tiến độ "đã xong 15 chủ đề", có mạng, không có mic. Trả lời sai mọi câu nghe và đọc, chọn "Chưa đúng" ở mọi câu nói, viết xong mọi chữ. Ở màn tổng kết bấm "Làm lại", rồi thoát ra màn Lộ trình | Màn tổng kết hiện điểm không quá 25% (chỉ câu viết được tính đúng, mà câu viết ≤ một phần tư bài), "Chưa đạt, cần từ 80%" và nút "Làm lại"; bấm "Làm lại" thì bài bắt đầu lại từ câu 1; trên màn Lộ trình bài "Kiểm tra cuối cấp HSK 1" không có nhãn "Đã xong" (vẫn "Đang mở") | e2e |

## Tầng test gợi ý cho dev

| Case | Tầng |
|---|---|
| TC-S11.4-AC1-1, 5, 8, 15, 17 | Vitest trên nội dung thật đã build |
| TC-S11.4-AC1-2 … 4, 6, 7, 9 … 14 | Vitest cạnh bước kiểm tra nội dung, bản sao trong bộ nhớ (không ghi file) |
| TC-S11.4-AC1-18, 20 … 23, 26, 28 | Playwright `apps/web/e2e/E11/s11.4-hsk1-final-test.spec.ts`, nạp sẵn tiến độ cho điều kiện đầu, câu nói theo đường không có mic |
| TC-S11.4-AC1-16, 19, 24, 25, 27 | QA chạy tay trên bản build (24 cần máy thật có mic) |
