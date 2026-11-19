# Test cases: S8.2 Cài đặt

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

## Điều kiện đầu

- **Người học mới:** trừ khi case ghi khác, bắt đầu bằng cửa sổ ẩn danh mới (hoặc xóa dữ liệu trang của app), đi hết onboarding
  với mục tiêu "15 phút", rồi ở màn Lộ trình. "Chưa từng đổi" một tùy chọn nghĩa là chưa mở màn Cài đặt để đổi tùy chọn đó.
- **Bài dùng để thử:** bản build hiện chỉ có một bài, "Bốn thanh điệu" (giai đoạn Nhập môn), gồm 7 câu theo thứ tự: 3 câu chọn thanh
  (八, 白, 百), 1 câu phân biệt cặp âm (四 / 十), 1 câu gõ pinyin (爸爸), 1 câu "nói", 1 câu luyện viết (人). Câu "nói" là câu 6 / 7 với
  chữ "你好！", pinyin "nǐ hǎo!", nghĩa "Xin chào!" (khớp từ "你好" / "nǐ hǎo" / "xin chào" trong spec). Muốn tới câu "nói" thì làm
  lần lượt 5 câu đầu (trả lời bất kỳ, bấm "Tiếp tục").
- **"Vào lại màn học" / "mở bài mới":** proposal đã chốt (Open Questions, dòng "Mở bài mới" có gồm mở lại chính bài đó…) rằng mỗi
  lần vào màn học (bài khác, chính bài đó, học tiếp bài đang dở) đều tính. Bản build chỉ có một bài nên case dùng hai cách: **mở lại từ
  câu 1** (thoát bài khi vẫn ở câu 1 rồi mở lại "Bốn thanh điệu", bài bắt đầu ở câu 1) và **học tiếp** (sang câu 2 rồi thoát, mở lại
  bài, bài mở ở câu 2). Nhánh **bài khác** của hai Scenario "Mở bài mới…" (TC-S4.4-AC2-7, TC-S8.2-AC2-16) chưa chạy được vì bản
  build chỉ có một bài. Đề xuất mặc định lúc nghiệm thu: ghi "không chạy được", escalate với đề xuất chấp nhận (hai nhánh mở lại
  chính bài và học tiếp đã phủ cùng hành vi "mỗi lần vào màn học theo tốc độ mặc định"); chạy tay khi có nội dung S7.1.
- **"Đóng app rồi mở lại":** đóng hẳn thẻ trình duyệt (hoặc app đã cài), mở lại app; với e2e là tải lại trang.
- **Tốc độ phát:** QA chạy tay nghe so sánh (0.75x chậm rõ so với 1x); dev ghi trong mô tả PR code cách QA đọc được tốc độ phát
  thực tế trên bản build. Bản `e2e` kiểm tốc độ phát của audio.
- **Không ghi âm được:** chặn quyền micro của trang trong trình duyệt (hoặc máy không có micro) trước khi bấm "Ghi âm".
- **Không lưu được / cài đặt đã lưu bị hỏng:** dev ghi trong mô tả PR code cách tạo tình huống trên bản build (ví dụ đoạn lệnh dán
  vào DevTools để làm lần ghi cài đặt tiếp theo bị lỗi, hoặc để ghi một giá trị hỏng cho tốc độ mặc định). Bản `e2e` tạo tình huống
  tương tự bằng Playwright.
- **Không đọc được cài đặt:** người học đã xong onboarding và **đang ở màn Lộ trình**; tại đó tạo lỗi đọc: dev ghi trong mô tả PR
  code cách làm app không đọc được toàn bộ cài đặt trên máy ở bản build (ví dụ đoạn lệnh dán vào DevTools làm các lần đọc cài đặt sau
  đó bị lỗi). Sau đó **không đi qua trang bắt đầu**: vào màn cần kiểm bằng liên kết trong app (liên kết "Cài đặt", hoặc mở bài từ Lộ
  trình), hoặc tải lại đúng trang đó (đang ở màn Cài đặt / màn học thì tải lại trang). Mở app từ trang bắt đầu lúc này vẫn hiện
  onboarding như S1.3 (mục "Không làm" của proposal), không tính là Fail. Bản `e2e` tạo tình huống tương tự.
- **Giao diện:** mặc định sáng; case Sáng/Tối chuyển giao diện của thiết bị/trình duyệt.

## Case

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.2-AC1-1 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Chức năng | Ở màn Lộ trình, bấm liên kết "Cài đặt" | Vào màn Cài đặt; màn có ba nhóm có nhãn "Mục tiêu mỗi ngày", "Tốc độ audio mặc định", "Hiện pinyin", mỗi nhóm hiện sẵn một giá trị đang dùng | e2e |
| TC-S8.2-AC1-2 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Mobile 375 | Khổ 375×812, ở màn Lộ trình tìm và bấm "Cài đặt" | Liên kết "Cài đặt" nhìn thấy, bấm được bằng ngón tay; màn Cài đặt hiện đủ ba nhóm, nhãn không bị cắt, không phải cuộn ngang | không |
| TC-S8.2-AC1-3 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Sáng/Tối | Mở màn Cài đặt ở giao diện sáng, rồi chuyển sang tối | Nhãn nhóm, nhãn lựa chọn, lựa chọn đang được chọn và trạng thái công tắc đọc rõ ở cả hai giao diện | không |
| TC-S8.2-AC1-4 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Offline | Có mạng, mở app và chờ app sẵn sàng dùng offline; tắt mạng; ở màn Lộ trình bấm "Cài đặt", đổi mục tiêu sang "30 phút" | Màn Cài đặt mở được, "30 phút" đang được chọn, không có thông báo lỗi | không |
| TC-S8.2-AC1-5 | S8.2-AC1 Quay về Lộ trình | Chức năng | Ở màn Cài đặt, bấm liên kết quay về Lộ trình | Về màn Lộ trình | e2e |
| TC-S8.2-AC1-6 | S8.2-AC1 Đổi lựa chọn bằng bàn phím | A11y | Ở màn Cài đặt, chỉ dùng Tab, phím mũi tên và Space: chọn "60 phút", chọn "Chậm (0.75x)", tắt "Hiện pinyin" | Chọn được cả ba; "60 phút", "Chậm (0.75x)" đang được chọn và "Hiện pinyin" đang tắt | e2e |
| TC-S8.2-AC1-7 | S8.2-AC1 Đổi lựa chọn bằng bàn phím | A11y | Ở màn Cài đặt, nhấn Tab qua từng ô (liên kết quay về, nhóm mục tiêu, nhóm tốc độ, công tắc pinyin) ở giao diện sáng rồi tối | Ô đang có focus luôn có viền focus nhìn thấy được ở cả hai giao diện | không |
| TC-S8.2-AC1-8 | S8.2-AC1 Đổi lựa chọn bằng bàn phím | A11y | Mở màn Cài đặt với trình đọc màn hình (hoặc xem tên truy cập), đi qua từng lựa chọn | Mỗi nhóm được đọc đúng nhãn; mỗi lựa chọn đọc được tên ("15 phút", "Bình thường (1x)"…) và trạng thái đang chọn/bật/tắt | không |
| TC-S8.2-AC1-9 | S8.2-AC1 Hiện mục tiêu đã chọn ở onboarding | Chức năng | Người học mới chọn "30 phút" ở onboarding, đi hết onboarding, ở màn Lộ trình bấm "Cài đặt" | Nhóm "Mục tiêu mỗi ngày" có đúng ba lựa chọn "15 phút", "30 phút", "60 phút"; "30 phút" đang được chọn | e2e |
| TC-S8.2-AC1-10 | S8.2-AC1 Đổi mục tiêu thì giữ sau khi mở lại app | Chức năng | Ở màn Cài đặt chọn "60 phút" (không bấm nút nào khác), đóng app, mở lại, vào màn Cài đặt | "60 phút" đang được chọn; màn không có nút "Lưu" | e2e |
| TC-S8.2-AC1-11 | S8.2-AC1 Đổi mục tiêu thì giữ sau khi mở lại app | Biên | Ở màn Cài đặt lần lượt chọn "60 phút", "30 phút", "15 phút", "30 phút" thật nhanh, đóng app, mở lại, vào màn Cài đặt | "30 phút" (lựa chọn cuối) đang được chọn | không |
| TC-S8.2-AC1-12 | S8.2-AC1 Đổi mục tiêu không hiện lại onboarding | Chức năng | Người học đã xong onboarding, vào Cài đặt đổi mục tiêu sang "60 phút", đóng app rồi mở lại | App không hiện màn chào mừng của onboarding (không có "Chào mừng đến …" và nút "Bắt đầu") | e2e |
| TC-S8.2-AC1-13 | S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ | Chức năng | Mục tiêu đang là "15 phút"; tạo tình huống không lưu được (xem Điều kiện đầu); chọn "30 phút" | Màn hiện "Không lưu được cài đặt. Hãy thử lại."; "15 phút" đang được chọn | e2e |
| TC-S8.2-AC1-14 | S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ | A11y | Như TC-S8.2-AC1-13, bật trình đọc màn hình | Trình đọc màn hình tự đọc "Không lưu được cài đặt. Hãy thử lại." mà không cần di focus tới thông báo | không |
| TC-S8.2-AC1-15 | S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất | Chức năng | Như TC-S8.2-AC1-13 (thông báo lỗi đang hiện); bỏ tình huống lỗi; chọn lại "30 phút"; đóng app, mở lại, vào Cài đặt | Ngay sau khi chọn lại: màn không còn "Không lưu được cài đặt. Hãy thử lại.", "30 phút" đang được chọn. Sau khi mở lại: "30 phút" vẫn đang được chọn, không có thông báo lỗi | e2e |
| TC-S8.2-AC1-16 | S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ | Mobile 375 | Khổ 375×812, như TC-S8.2-AC1-13 | Thông báo lỗi hiện đủ, đọc được, không che lựa chọn, không phải cuộn ngang | không |
| TC-S8.2-AC1-17 | S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất | Biên | Như TC-S8.2-AC1-13 (thông báo lỗi đang hiện); bỏ tình huống lỗi; không chọn lại mục tiêu mà đổi tốc độ sang "Chậm (0.75x)" | Màn không còn "Không lưu được cài đặt. Hãy thử lại."; "15 phút" và "Chậm (0.75x)" đang được chọn | không |
| TC-S8.2-AC1-18 | S8.2-AC1 Lỗi lặp lại chỉ có một thông báo | Chức năng | Mục tiêu đang là "15 phút"; tạo tình huống không lưu được; chọn "30 phút", rồi chọn "60 phút" | Màn có đúng một thông báo "Không lưu được cài đặt. Hãy thử lại." (không có hai dòng giống nhau); "15 phút" đang được chọn | e2e |
| TC-S8.2-AC1-19 | S8.2-AC1 Lỗi lặp lại chỉ có một thông báo | A11y | Như TC-S8.2-AC1-18, bật trình đọc màn hình | Trình đọc màn hình đọc "Không lưu được cài đặt. Hãy thử lại." sau lần lỗi thứ nhất và đọc lại lần nữa sau lần lỗi thứ hai, không cần di focus | không |
| TC-S8.2-AC1-20 | S8.2-AC1 Mục tiêu đã lưu bị hỏng thì về 15 phút | Chức năng | Ở Cài đặt chọn "Chậm (0.75x)"; làm hỏng giá trị mục tiêu đã lưu (xem Điều kiện đầu); đóng app, mở lại, vào Cài đặt | "15 phút" đang được chọn; "Chậm (0.75x)" đang được chọn; màn không hiện thông báo lỗi nào | không |
| TC-S8.2-AC1-21 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Chức năng | Trước đó đã chọn "60 phút", "Chậm (0.75x)", tắt "Hiện pinyin"; về màn Lộ trình; tạo lỗi đọc cài đặt khi đang ở màn Lộ trình (xem Điều kiện đầu); bấm liên kết "Cài đặt" | Vào màn Cài đặt; "15 phút", "Bình thường (1x)" đang được chọn; công tắc "Hiện pinyin" đang bật; màn không hiện thông báo lỗi nào | e2e |
| TC-S8.2-AC1-22 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Chức năng | Như TC-S8.2-AC1-21, tạo thêm tình huống không lưu được (xem Điều kiện đầu); chọn "30 phút" | Màn hiện "Không lưu được cài đặt. Hãy thử lại."; "15 phút" vẫn đang được chọn | e2e |
| TC-S8.2-AC1-23 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Biên | Trước đó đã chọn "60 phút", "Chậm (0.75x)", tắt "Hiện pinyin"; ở màn Lộ trình tạo lỗi đọc cài đặt; bấm "Cài đặt", rồi tải lại trang Cài đặt | Sau khi tải lại vẫn ở màn Cài đặt (không hiện onboarding); "15 phút", "Bình thường (1x)" đang được chọn; công tắc "Hiện pinyin" đang bật; không có thông báo lỗi nào | không |
| TC-S8.2-AC2-1 | S8.2-AC2 Mặc định ban đầu là tốc độ thường | Chức năng | Người học mới, chưa đổi tốc độ, mở màn Cài đặt | Nhóm "Tốc độ audio mặc định" có hai lựa chọn "Bình thường (1x)" và "Chậm (0.75x)"; "Bình thường (1x)" đang được chọn | e2e |
| TC-S8.2-AC2-2 | S8.2-AC2 Chọn Chậm thì mở bài là phát chậm | Chức năng | Ở Cài đặt chọn "Chậm (0.75x)", quay về Lộ trình, mở bài "Bốn thanh điệu", bấm "Nghe" ở câu 1 | Công tắc "Nghe chậm" đang bật ngay khi mở bài; audio phát ở 0.75x | e2e |
| TC-S8.2-AC2-3 | S8.2-AC2 Chọn Chậm thì mở bài là phát chậm | Mobile 375 | Khổ 375×812, như TC-S8.2-AC2-2 | Công tắc "Nghe chậm" nhìn thấy ở trạng thái bật, trạng thái đọc được bằng chữ hoặc nhãn, không chỉ bằng màu | không |
| TC-S8.2-AC2-4 | S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app | Chức năng | Ở Cài đặt chọn "Chậm (0.75x)", đóng app, mở lại, vào màn Cài đặt | "Chậm (0.75x)" đang được chọn | e2e |
| TC-S8.2-AC2-5 | S8.2-AC2 Tắt Nghe chậm trong bài không đổi Cài đặt | Chức năng | Tốc độ mặc định là "Chậm (0.75x)"; mở bài, tắt "Nghe chậm"; thoát bài về Lộ trình, mở màn Cài đặt | "Chậm (0.75x)" vẫn đang được chọn | e2e |
| TC-S8.2-AC2-6 | S8.2-AC2 Tắt Nghe chậm trong bài không đổi Cài đặt | Biên | Tốc độ mặc định là "Bình thường (1x)"; mở bài, bật "Nghe chậm"; thoát bài, mở màn Cài đặt | "Bình thường (1x)" vẫn đang được chọn | không |
| TC-S8.2-AC2-7 | S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ | Chức năng | Tốc độ mặc định đang là "Bình thường (1x)"; tạo tình huống không lưu được; chọn "Chậm (0.75x)" | Màn hiện "Không lưu được cài đặt. Hãy thử lại."; "Bình thường (1x)" đang được chọn | e2e |
| TC-S8.2-AC2-8 | S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ | Biên | Như TC-S8.2-AC2-7 (thông báo lỗi đang hiện); bỏ tình huống lỗi; chọn lại "Chậm (0.75x)"; quay về Lộ trình, mở bài "Bốn thanh điệu" | Ngay sau khi chọn lại: màn không còn "Không lưu được cài đặt. Hãy thử lại.", "Chậm (0.75x)" đang được chọn. Trong bài: công tắc "Nghe chậm" đang bật | không |
| TC-S8.2-AC2-9 | S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định | Chức năng | Ở Cài đặt chọn "60 phút", tắt "Hiện pinyin"; làm hỏng giá trị tốc độ mặc định đã lưu (xem Điều kiện đầu); đóng app, mở lại, vào Cài đặt | "Bình thường (1x)" đang được chọn; "60 phút" đang được chọn; "Hiện pinyin" đang tắt; màn không hiện thông báo lỗi nào | e2e |
| TC-S8.2-AC2-10 | S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm | Chức năng | Tốc độ mặc định là "Chậm (0.75x)"; mở bài, ở câu 1 tắt "Nghe chậm"; thoát bài về Lộ trình khi vẫn ở câu 1; mở lại bài "Bốn thanh điệu" (bài bắt đầu ở câu 1), bấm "Nghe" | Công tắc "Nghe chậm" đang bật; audio phát ở 0.75x | e2e |
| TC-S8.2-AC2-11 | S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm | Chức năng | Tốc độ mặc định là "Chậm (0.75x)"; mở bài, ở câu 1 tắt "Nghe chậm", trả lời, bấm "Tiếp tục" sang câu 2; thoát bài; mở lại bài (học tiếp ở câu 2), bấm "Nghe" | Bài mở ở câu 2; công tắc "Nghe chậm" đang bật; audio phát ở 0.75x | không |
| TC-S8.2-AC2-12 | S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin | Chức năng | Trước đó đã chọn "Chậm (0.75x)" và tắt "Hiện pinyin"; về màn Lộ trình; tạo lỗi đọc cài đặt khi đang ở màn Lộ trình (xem Điều kiện đầu); từ Lộ trình mở bài "Bốn thanh điệu"; xem công tắc ở câu 1, rồi làm tới câu "nói" | Bài mở bình thường; công tắc "Nghe chậm" đang tắt; câu "nói" hiện "你好！", "nǐ hǎo!" và "Xin chào!"; không có thông báo lỗi nào trong bài | e2e |
| TC-S8.2-AC2-13 | S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ | Biên | Như TC-S8.2-AC2-7 (vẫn để tình huống lỗi, không chọn lại); quay về Lộ trình, mở bài "Bốn thanh điệu" | Công tắc "Nghe chậm" đang tắt (theo tốc độ cũ "Bình thường (1x)") | không |
| TC-S8.2-AC2-15 | S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin | Biên | Trước đó đã chọn "Chậm (0.75x)" và tắt "Hiện pinyin"; ở màn Lộ trình tạo lỗi đọc cài đặt; mở bài "Bốn thanh điệu", làm tới câu "nói" (câu 6 / 7); tải lại trang bài | Sau khi tải lại vẫn ở màn học (không hiện onboarding); công tắc "Nghe chậm" đang tắt; câu "nói" hiện "你好！", "nǐ hǎo!" và "Xin chào!"; không có thông báo lỗi nào | không |
| TC-S8.2-AC2-16 | S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm | Chức năng | Tốc độ mặc định là "Chậm (0.75x)"; mở một bài, tắt "Nghe chậm"; thoát bài; mở một bài khác, bấm "Nghe" | Công tắc "Nghe chậm" đang bật; audio phát ở 0.75x. Không chạy được trên bản build hiện tại (chỉ có một bài). Đề xuất mặc định lúc nghiệm thu: ghi "không chạy được", escalate với đề xuất chấp nhận (TC-S8.2-AC2-10, TC-S8.2-AC2-11 đã phủ cùng hành vi); chạy tay khi có nội dung S7.1 | không |
| TC-S8.2-AC2-14 | S8.2-AC2 Chọn Chậm thì mở bài là phát chậm | Biên (hồi quy) | Tốc độ mặc định là "Chậm (0.75x)"; mở bài, làm tới câu "nói"; bấm "Nghe mẫu"; bấm "Ghi âm", nói, dừng, bấm "Nghe bản ghi" | "Nghe mẫu" và "Nghe bản ghi" đều phát ở 1x (đúng mục "Không làm" của proposal: tốc độ mặc định chỉ áp cho nút "Nghe" của câu có công tắc "Nghe chậm"); không tính là Fail | không |
| TC-S8.2-AC3-1 | S8.2-AC3 Mặc định hiện pinyin | Chức năng | Người học mới, chưa đổi "Hiện pinyin", mở màn Cài đặt | Công tắc "Hiện pinyin" đang bật | e2e |
| TC-S8.2-AC3-2 | S8.2-AC3 Mặc định hiện pinyin | A11y | Như TC-S8.2-AC3-1, nhìn công tắc ở chế độ thang xám (hoặc trình đọc màn hình) rồi tắt công tắc | Trạng thái bật/tắt nhận ra được bằng chữ hoặc nhãn đọc được, không chỉ bằng màu; trình đọc màn hình đọc đúng trạng thái trước và sau khi đổi | không |
| TC-S8.2-AC3-3 | S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; mở bài "Bốn thanh điệu", làm tới câu "nói" | Câu "nói" hiện "你好！" và "Xin chào!"; không hiện "nǐ hǎo!" ở đâu trên câu trước khi chấm | e2e |
| TC-S8.2-AC3-4 | S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin | Mobile 375 | Khổ 375×812, như TC-S8.2-AC3-3 | Chữ Hán và nghĩa hiện đủ, không để lại khoảng trống lạ chỗ pinyin bị ẩn, không phải cuộn ngang | không |
| TC-S8.2-AC3-5 | S8.2-AC3 Bật lại pinyin thì câu nói hiện pinyin | Chức năng | Ở Cài đặt tắt rồi bật lại "Hiện pinyin"; mở bài, làm tới câu "nói" | Câu "nói" hiện "你好！", "nǐ hǎo!" và "Xin chào!" | e2e |
| TC-S8.2-AC3-6 | S8.2-AC3 Tùy chọn pinyin giữ sau khi mở lại app | Chức năng | Ở Cài đặt tắt "Hiện pinyin", đóng app, mở lại, vào màn Cài đặt | Công tắc "Hiện pinyin" đang tắt | e2e |
| TC-S8.2-AC3-7 | S8.2-AC3 Tắt pinyin vẫn giữ pinyin của lựa chọn và đáp án | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; mở bài; ở câu 1 (chọn thanh) chọn một thanh; làm tới câu 4 (phân biệt cặp âm) | Câu chọn thanh, sau khi chọn, hiện thanh đúng kèm pinyin có dấu của âm (ví dụ "bā"); câu phân biệt cặp âm có hai lựa chọn ghi pinyin ("sì", "shí") | e2e |
| TC-S8.2-AC3-8 | S8.2-AC3 Tắt pinyin vẫn gõ pinyin được | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; mở bài, làm tới câu 5 (gõ pinyin); gõ "ni3", bấm "Kiểm tra" | Ô gõ hiện "nǐ"; sau khi kiểm tra, phần so sánh vẫn hiện pinyin (pinyin đúng và phần gõ sai) | e2e |
| TC-S8.2-AC3-9 | S8.2-AC3 Tắt pinyin vẫn hiện pinyin trong giải thích khi sai | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; mở bài, làm tới câu "nói", bấm "Chưa đúng" | Phần giải thích hiện chữ "你好！", pinyin "nǐ hǎo!" và nghĩa "Xin chào!" | e2e |
| TC-S8.2-AC3-10 | S8.2-AC3 Không lưu được pinyin thì công tắc về trạng thái cũ | Chức năng | "Hiện pinyin" đang bật; tạo tình huống không lưu được; tắt "Hiện pinyin" | Màn hiện "Không lưu được cài đặt. Hãy thử lại."; công tắc "Hiện pinyin" đang bật | e2e |
| TC-S8.2-AC3-11 | S8.2-AC3 Không lưu được pinyin thì công tắc về trạng thái cũ | Biên | Như TC-S8.2-AC3-10, bỏ tình huống lỗi, quay về Lộ trình, mở bài, làm tới câu "nói" | Câu "nói" vẫn hiện "nǐ hǎo!" (pinyin theo trạng thái cũ là bật) | không |
| TC-S8.2-AC3-12 | S8.2-AC3 Câu nói khi tắt pinyin | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; mở bài, làm tới câu "nói", chưa bấm gì | Màn hiện "你好！" và "Xin chào!", không hiện "nǐ hǎo!"; có ba nút "Chưa đúng", "Gần đúng", "Đúng" | e2e |
| TC-S8.2-AC3-13 | S8.2-AC3 Câu nói khi tắt pinyin | Sáng/Tối | Như TC-S8.2-AC3-12 ở giao diện sáng, rồi chuyển sang tối | Chữ Hán, nghĩa và ba nút đọc rõ ở cả hai giao diện | không |
| TC-S8.2-AC3-14 | S8.2-AC3 Đọc to rồi tự chấm khi tắt pinyin | Chức năng | Ở Cài đặt tắt "Hiện pinyin"; chặn micro; mở bài, làm tới câu "nói", bấm "Ghi âm" | Màn chuyển sang chế độ "đọc to rồi tự chấm"; hiện "你好！" và "Xin chào!", không hiện "nǐ hǎo!"; nút "Nghe mẫu" bấm được | e2e |
| TC-S8.2-AC3-15 | S8.2-AC3 Tùy chọn pinyin đã lưu bị hỏng thì về bật | Chức năng | Ở Cài đặt chọn "30 phút" và tắt "Hiện pinyin"; làm hỏng giá trị "Hiện pinyin" đã lưu (xem Điều kiện đầu); đóng app, mở lại, vào Cài đặt | Công tắc "Hiện pinyin" đang bật; "30 phút" đang được chọn; màn không hiện thông báo lỗi nào | không |
| TC-S4.4-AC2-1 | S4.4-AC2 Mặc định phát tốc độ thường | Chức năng | Tốc độ mặc định là "Bình thường (1x)"; mở bài, không chạm "Nghe chậm", bấm "Nghe" ở câu 1 | Công tắc "Nghe chậm" đang tắt; audio phát ở 1x | e2e |
| TC-S4.4-AC2-2 | S4.4-AC2 Bật Nghe chậm thì phát 0.75x | Chức năng | Mở bài, bật "Nghe chậm", bấm "Nghe" | Audio phát ở 0.75x; công tắc "Nghe chậm" cho biết đang bật | không |
| TC-S4.4-AC2-3 | S4.4-AC2 Tắt Nghe chậm thì về tốc độ thường | Chức năng | Mở bài, bật "Nghe chậm" rồi tắt, bấm "Nghe" | Audio phát ở 1x | không |
| TC-S4.4-AC2-4 | S4.4-AC2 Nghe chậm giữ qua các câu trong bài | Chức năng | Tốc độ mặc định "Bình thường (1x)"; mở bài, bật "Nghe chậm" ở câu 1, trả lời, bấm "Tiếp tục" sang câu 2, bấm "Nghe" | Công tắc "Nghe chậm" vẫn bật; audio phát ở 0.75x | không |
| TC-S4.4-AC2-5 | S4.4-AC2 Mở bài mới thì về tốc độ thường | Chức năng | Tốc độ mặc định "Bình thường (1x)"; mở bài, ở câu 1 bật "Nghe chậm"; thoát bài về Lộ trình khi vẫn ở câu 1; mở lại bài "Bốn thanh điệu" (bài bắt đầu ở câu 1) | Công tắc "Nghe chậm" đang tắt | e2e |
| TC-S4.4-AC2-6 | S4.4-AC2 Mở bài mới thì về tốc độ thường | Chức năng | Tốc độ mặc định "Bình thường (1x)"; mở bài, ở câu 1 bật "Nghe chậm", trả lời, bấm "Tiếp tục" sang câu 2; thoát bài; mở lại bài (học tiếp ở câu 2) | Bài mở ở câu 2; công tắc "Nghe chậm" đang tắt | không |
| TC-S4.4-AC2-7 | S4.4-AC2 Mở bài mới thì về tốc độ thường | Chức năng | Tốc độ mặc định "Bình thường (1x)"; mở một bài, bật "Nghe chậm"; thoát bài; mở một bài khác | Công tắc "Nghe chậm" đang tắt. Không chạy được trên bản build hiện tại (chỉ có một bài). Đề xuất mặc định lúc nghiệm thu: ghi "không chạy được", escalate với đề xuất chấp nhận (TC-S4.4-AC2-5, TC-S4.4-AC2-6 đã phủ cùng hành vi); chạy tay khi có nội dung S7.1 | không |
| TC-S5.2-AC1-1 | S5.2-AC1 Câu nói hiện nội dung để đọc và 3 mức | Chức năng | "Hiện pinyin" đang bật (mặc định); mở bài, làm tới câu "nói" | Màn hiện "你好！", "nǐ hǎo!" và "Xin chào!"; có ba nút "Chưa đúng", "Gần đúng", "Đúng" | e2e |
| TC-S5.2-AC1-2 | S5.2-AC1 Chưa chọn mức thì chưa chấm | Chức năng | Mở bài, làm tới câu "nói", không chọn mức | Câu chưa có kết quả; chưa có nút "Tiếp tục" | không |
| TC-S5.2-AC1-3 | S5.2-AC1 Chọn mức mà chưa ghi âm | Chức năng | Ở câu "nói", không ghi âm, bấm "Đúng" | Câu được chấm "Đúng" | không |
| TC-S5.2-AC1-4 | S5.2-AC1 Chọn mức thì câu được chấm ngay | Chức năng | Ở câu "nói", bấm "Gần đúng" | Màn báo kết quả của câu bằng chữ; có nút "Tiếp tục" | không |
| TC-S5.2-AC1-5 | S5.2-AC1 Đã chọn thì không đổi được | Chức năng | Ở câu "nói", bấm "Gần đúng" rồi bấm "Đúng" | Kết quả vẫn theo "Gần đúng"; ba nút đánh giá không bấm được nữa | không |
| TC-S5.2-AC1-6 | S5.2-AC1 Mức đã chọn được báo bằng chữ | A11y | Ở câu "nói", bấm "Gần đúng" | Màn cho biết "Gần đúng" đang được chọn bằng chữ ("Đã chọn"), không chỉ bằng màu | không |
| TC-S5.2-AC1-7 | S5.2-AC1 Chọn bằng bàn phím | A11y | Ở câu "nói", dùng Tab tới nút "Đúng", bấm Enter | Câu được chấm theo mức "Đúng" | không |
| TC-S5.4-AC2-1 | S5.4-AC2 Chuyển chế độ khi không ghi âm được | Chức năng | Chặn micro; mở bài, làm tới câu "nói", bấm "Ghi âm" | Màn hiện "Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới."; không còn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động" | không |
| TC-S5.4-AC2-2 | S5.4-AC2 Vẫn nghe mẫu và thấy chữ để đọc | Chức năng | "Hiện pinyin" đang bật; chặn micro; làm tới câu "nói", bấm "Ghi âm" | Nút "Nghe mẫu" bấm được; màn hiện "你好！", "nǐ hǎo!" và "Xin chào!" | e2e |
| TC-S5.4-AC2-3 | S5.4-AC2 Vẫn tự đánh giá và tính điểm | Chức năng | Ở chế độ "đọc to rồi tự chấm", bấm "Đúng", làm hết bài | Câu "nói" được chấm đúng và tính vào điểm ở màn tổng kết bài | không |
| TC-S5.4-AC2-4 | S5.4-AC2 Chọn Chưa đúng thì tính sai như thường | Chức năng | "Hiện pinyin" đang bật; ở chế độ "đọc to rồi tự chấm", bấm "Chưa đúng" | Câu được chấm sai; hiện "你好！", "nǐ hǎo!", "Xin chào!" của câu mẫu | không |
| TC-S5.4-AC2-5 | S5.4-AC2 Giữ chế độ cho các câu nói sau trong bài | Chức năng | Ở chế độ "đọc to rồi tự chấm" ở câu "nói" đầu, chấm xong, sang câu "nói" kế trong cùng bài | Câu mới cũng ở chế độ "đọc to rồi tự chấm"; có nút "Thử lại ghi âm". Không chạy được trên bản build hiện tại (bài chỉ có một câu "nói"). Đề xuất mặc định lúc nghiệm thu: ghi "không chạy được", escalate với đề xuất chấp nhận vì là hồi quy S8.2 không đổi, đã có test component S5.4 (proposal Open Questions, dòng S5.4-AC2 đã chốt); chạy tay khi có nội dung S7.1 | không |
| TC-S5.4-AC2-6 | S5.4-AC2 Thử lại ghi âm thì quay về chế độ ghi âm | Chức năng | Ở chế độ "đọc to rồi tự chấm", cho phép lại micro, bấm "Thử lại ghi âm" | Câu "nói" hiện nút "Ghi âm" và "Nghe bản ghi" như bình thường | không |
| TC-S5.4-AC2-7 | S5.4-AC2 Mở bài mới thì kiểm tra lại mic | Chức năng | Ở chế độ "đọc to rồi tự chấm", cho phép lại micro, thoát bài, mở lại bài (xem Điều kiện đầu), làm tới câu "nói" | Câu "nói" hiện nút "Ghi âm" như bình thường | không |

## Ghi chú

- Case Scenario cũ của `audio-replay` (S4.4), `speak-rating` (S5.2), `speak-no-mic` (S5.4) là case hồi quy: hành vi không đổi, chỉ thêm
  điều kiện về Cài đặt. Case `e2e` trong nhóm này là những case nay phụ thuộc Cài đặt (tốc độ khi mở bài, pinyin ở câu "nói").
- "Không hiện pinyin" ở câu "nói" tính trên toàn câu trước khi chấm (không chỉ dòng ngay dưới chữ Hán); sau khi chọn "Chưa đúng" thì
  pinyin hiện lại trong phần giải thích là đúng spec (TC-S8.2-AC3-9).
- Offline: chỉ một case (TC-S8.2-AC1-4) vì spec không có Scenario riêng về offline; cài đặt lưu trên máy nên phải dùng được khi
  không có mạng như mọi màn khác.
- "Nghe mẫu" và "Nghe bản ghi" ở câu "nói" luôn phát 1x kể cả khi tốc độ mặc định là "Chậm (0.75x)" (mục "Không làm" của proposal);
  TC-S8.2-AC2-14 ghi lại để QA không báo Fail nhầm.
- Đổi số so với bản trước: TC-S8.2-AC2-10 (mục tiêu hỏng) chuyển thành TC-S8.2-AC1-20; TC-S8.2-AC2-11 (pinyin hỏng) chuyển thành
  TC-S8.2-AC3-15; TC-S8.2-AC2-12 cũ nay là TC-S8.2-AC2-10.

## Câu hỏi mở

- Không còn. Các câu hỏi của bản trước (mở lại chính bài thay cho bài khác; S5.4-AC2 "Giữ chế độ…" khi chỉ có một câu "nói"; trạng
  thái onboarding khi không đọc được cài đặt) đã được chốt trong `proposal.md` (Open Questions, các dòng `- [x]` tương ứng).
