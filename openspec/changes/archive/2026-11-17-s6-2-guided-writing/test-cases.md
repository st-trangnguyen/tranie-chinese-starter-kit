# Test cases: S6.2 Viết theo nét có gợi ý

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Cách mở màn luyện viết**: "Mở luyện viết chữ X" nghĩa là mở màn xem thứ tự nét của chữ X (S6.1) rồi bấm nút "Tập viết".
  Đây là lối vào do S6.2 thêm; lối vào từ thẻ từ vựng hoặc bài học thuộc story khác nên không kiểm ở đây. Cần S6.1 đã merge và
  có nút "Tập viết" trên bản build.
- **Chữ không có dữ liệu nét** không có nút "Tập viết", nên case "Chữ không có dữ liệu nét" mở màn luyện viết của 龘 trực tiếp bằng
  địa chỉ trang (mẫu địa chỉ do dev ghi trong mô tả PR code).
- **Dữ liệu mẫu có dữ liệu nét**: 十 (2 nét: nét ngang từ trái sang phải trước, nét sổ dọc từ trên xuống sau), 人 (2 nét: phẩy trước, mác sau),
  你 (7 nét). Đã kiểm thư mục dữ liệu nét hiện có các chữ 人 你 八 十 四 好 爸 白 百.
- **Chữ không có dữ liệu nét**: 龘 (không có trong thư mục dữ liệu nét; cùng chữ mẫu với spec S6.1). Đây là dữ liệu mẫu tạm: nếu S2.5
  bổ sung dữ liệu cho 龘 thì đổi sang một chữ khác vẫn chưa có.
- **Nét sai** ở các case dưới là nét viết rõ ràng không khớp nét kế tiếp (không sát ngưỡng dung sai), gồm ba kiểu: nét của nét khác
  (vẽ nét sổ dọc khi 十 đang chờ nét ngang), ngược hướng (vẽ nét ngang từ phải sang trái), hoặc hình dạng khác hẳn (vẽ vòng tròn).
- **Ba trạng thái nét trên khung**: *nét mờ* của cả chữ (luôn có, để viết đè lên), *nét đã viết đúng* (được giữ lại), *nét gợi ý*
  (nét đúng hiện tại được làm nổi bật sau 3 lần sai liên tiếp). Gợi ý là lớp phủ tĩnh, giữ nguyên đến khi người học viết đúng nét đó
  (không nháy, không tự tắt theo thời gian), không có điểm bắt đầu hay mũi tên chỉ hướng.
- Mỗi case bắt đầu từ trạng thái vừa mở luyện viết chữ đó, chưa viết nét nào, trừ khi nêu khác.
- **Ngưỡng nhìn rõ** (CLAUDE.md §7, áp cho mọi case "đọc rõ"/"nhìn rõ" dưới đây): chữ và thông báo tương phản ≥ 4.5:1; nét đã viết đúng,
  nét gợi ý và viền focus tương phản ≥ 3:1 với nền; nút và liên kết có vùng chạm ≥ 44×44 px.
- **Tiêu chí "phân biệt được"** giữa nét mờ và nét gợi ý (áp cho TC-S6.2-AC1-3, TC-S6.2-AC3-2, -4, -10): nét gợi ý khác nét mờ không chỉ
  ở màu (đậm hơn hoặc dùng màu nhấn), và tương phản giữa nét gợi ý với nét mờ ≥ 3:1. Nét mờ "nhìn thấy được" nghĩa là đúng màu theo token
  nét mờ của design system (`docs/04-specs/2026-11-04-design-system.md`; dev ghi tên token trong design.md khi có).

**Cột Tự động**: `e2e` = đưa vào Playwright (mở màn, focus, Tab/Enter, offline; không cần vẽ cử chỉ). `không` = QA chạy tay mỗi lần nghiệm
thu (vẽ nét, mắt nhìn, thiết bị thật, trình đọc màn hình). Phần Dev kiểm thêm bằng Vitest/Testing Library ghi ở mục "Ghi chú" cuối file.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.2-AC1-1 | S6.2-AC1 Hiện khung viết có nét mờ của cả chữ | Chức năng | Mở luyện viết chữ 十 | Màn hiện khung viết với đủ 2 nét mờ của chữ 十 (nét ngang và nét sổ dọc); chưa có nét nào được đánh dấu là đã viết | e2e |
| TC-S6.2-AC1-2 | S6.2-AC1 Hiện khung viết có nét mờ của cả chữ | Mobile 375 | Khổ 375×812, mở luyện viết chữ 你 | Khung viết nằm gọn trong màn hình, không cuộn ngang, cạnh ngắn nhất của khung ≥ 240 px để viết bằng ngón tay; đủ 7 nét mờ nằm trong khung | e2e |
| TC-S6.2-AC1-3 | S6.2-AC1 Hiện khung viết có nét mờ của cả chữ | Sáng/Tối | Mở luyện viết chữ 十 ở giao diện sáng rồi tối, viết đúng nét ngang | Ở cả hai giao diện: nét mờ của cả chữ nhìn thấy được (đúng token nét mờ); nét ngang đã viết đúng tương phản ≥ 3:1 với nền và phân biệt được với nét sổ còn mờ | không |
| TC-S6.2-AC1-4 | S6.2-AC1 Hiện khung viết có nét mờ của cả chữ | Offline | Mở app một lần khi có mạng, chờ app tải xong; tắt mạng; mở luyện viết chữ 人 | Khung viết hiện đủ 2 nét mờ của chữ 人; không hiện "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S6.2-AC1-5 | S6.2-AC1 Hiện khung viết có nét mờ của cả chữ | Offline | Tiếp TC-S6.2-AC1-4 (vẫn mất mạng): viết đúng nét phẩy rồi nét mác của chữ 人 | Từng nét đúng được giữ lại trên khung; sau nét mác màn báo đã viết xong chữ, giống khi có mạng | không |
| TC-S6.2-AC1-6 | S6.2-AC1 Viết bằng chuột | Chức năng | Nhấn giữ chuột trong khung, kéo ngang từ trái sang phải, chưa nhả | Nét hiện ra theo đường chuột ngay khi kéo, không đợi nhả chuột | không |
| TC-S6.2-AC1-7 | S6.2-AC1 Viết bằng chuột | Biên | Nhấn giữ chuột trong khung, kéo ra ngoài rìa khung rồi nhả | Nét không kẹt ở trạng thái đang viết; lần nhấn kế tiếp trong khung vẫn viết được bình thường | không |
| TC-S6.2-AC1-8 | S6.2-AC1 Viết bằng ngón tay | Chức năng | Trên màn cảm ứng (hoặc giả lập cảm ứng 375×812), chạm và kéo ngón tay trong khung viết | Nét hiện ra theo ngón tay ngay khi kéo | không |
| TC-S6.2-AC1-9 | S6.2-AC1 Viết bằng ngón tay | Mobile 375 | Trên trang đủ dài để cuộn được, kéo ngón tay dọc từ trên xuống dưới trong khung viết | Trang không cuộn khi viết trong khung; kéo ngoài khung thì trang vẫn cuộn bình thường | không |
| TC-S6.2-AC1-10 | S6.2-AC1 Viết đúng nét thì sang nét kế | Chức năng | Mở chữ 十, viết nét ngang rõ ràng từ trái sang phải | Nét ngang được giữ lại trên khung (khác nét mờ); không có thông báo sai; chưa báo hoàn thành; viết tiếp nét sổ thì được nhận | không |
| TC-S6.2-AC1-11 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Chức năng | Mở chữ 十, viết đúng nét ngang rồi nét sổ dọc từ trên xuống | Sau nét cuối màn báo đã viết xong chữ; cả hai nét còn trên khung; màn không chuyển sang màn khác; có nút "Viết lại"; không có điểm hay tiến độ nào hiện ra | không |
| TC-S6.2-AC1-12 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Biên | Mở chữ 你 (7 nét), viết đúng lần lượt 7 nét | Chỉ báo hoàn thành sau nét thứ 7, không báo sớm ở nét nào trước đó | không |
| TC-S6.2-AC1-13 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Biên | Sau khi đã báo hoàn thành chữ 十, viết thêm một nét trong khung | Không phát sinh thông báo sai hay gợi ý; màn vẫn ở trạng thái đã xong, không lỗi | không |
| TC-S6.2-AC1-14 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Sáng/Tối | Hoàn thành chữ 十 ở giao diện sáng rồi tối | Thông báo hoàn thành và nút "Viết lại" đọc rõ ở cả hai giao diện (chữ ≥ 4.5:1, vùng chạm nút ≥ 44×44 px) | không |
| TC-S6.2-AC1-15 | S6.2-AC1 Viết lại sau khi hoàn thành | Chức năng | Hoàn thành chữ 十, bấm "Viết lại" | Khung chỉ còn 2 nét mờ của cả chữ, không còn nét đã viết; thông báo hoàn thành biến mất; viết đúng nét ngang được nhận như nét đầu tiên | không |
| TC-S6.2-AC1-16 | S6.2-AC1 Viết lại sau khi hoàn thành | Biên | Sai 2 lần ở nét sổ của 十, hoàn thành chữ, bấm "Viết lại", sai nét ngang 1 lần | Chưa có nét nào được làm nổi bật như gợi ý (bộ đếm sai bắt đầu lại từ 0 sau "Viết lại") | không |
| TC-S6.2-AC1-17 | S6.2-AC1 Chạm một điểm thì bỏ qua | Chức năng | Mở chữ 十, chạm (hoặc nhấp chuột) một điểm trong khung rồi nhả, không kéo | Không có thông báo viết sai nét; không có nét nào được giữ lại trên khung; chữ vẫn chờ nét ngang | không |
| TC-S6.2-AC1-18 | S6.2-AC1 Chạm một điểm thì bỏ qua | Biên | Mở chữ 十, chạm một điểm trong khung, giữ yên rồi nhả, không kéo (kiểm thêm nét ngắn hơn ngưỡng "quá ngắn" trong design.md khi nghiệm thu) | Không có thông báo viết sai nét; không có nét nào được giữ lại; chữ vẫn chờ nét ngang | không |
| TC-S6.2-AC1-19 | S6.2-AC1 Chạm một điểm thì bỏ qua | Biên | Mở chữ 十, chạm một điểm 5 lần liên tiếp rồi viết đúng nét ngang | Không có thông báo, không có nét gợi ý; nét ngang đúng vẫn được nhận | không |
| TC-S6.2-AC1-20 | S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét | Chức năng | Mở luyện viết chữ 人, bấm liên kết "Xem thứ tự nét" | Màn xem thứ tự nét của đúng chữ 人 mở (không phải chữ khác) | e2e |
| TC-S6.2-AC1-21 | S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét | Mobile 375 | Khổ 375×812, mở luyện viết chữ 人 | Liên kết "Xem thứ tự nét" nhìn thấy, có vùng chạm ≥ 44×44 px, không bị khung viết che; không cuộn ngang | e2e |
| TC-S6.2-AC1-22 | S6.2-AC1 Chữ không có dữ liệu nét | Chức năng | Mở màn luyện viết của chữ 龘 trực tiếp bằng địa chỉ trang (mẫu địa chỉ do dev ghi trong mô tả PR code) | Không hiện khung viết; hiện đúng câu "Chưa có dữ liệu nét cho chữ này." | e2e |
| TC-S6.2-AC1-23 | S6.2-AC1 Khung viết nhận focus bàn phím | A11y | Mở luyện viết chữ 十, nhấn Tab cho đến khi vào khung viết | Khung viết nhận focus; viền focus nhìn thấy (tương phản ≥ 3:1 với nền) ở cả giao diện sáng và tối | e2e |
| TC-S6.2-AC1-24 | S6.2-AC1 Khung viết nhận focus bàn phím | A11y | Bật trình đọc màn hình, đưa focus vào khung viết của chữ 十 | Trình đọc màn hình đọc nhãn của khung, trong đó có nêu chữ 十 | không |
| TC-S6.2-AC1-25 | S6.2-AC1 Khung viết nhận focus bàn phím | Biên | Đưa focus vào khung viết, nhấn các phím chữ, số, Space, Enter, mũi tên | Không có nét nào được tạo, không thông báo sai, không có nét gợi ý, trang không lỗi (viết không cần bàn phím) | e2e |
| TC-S6.2-AC1-26 | S6.2-AC1 Đường thay thế khi không dùng được chuột hoặc cảm ứng | A11y | Chỉ dùng bàn phím trên màn luyện viết chữ 人: Tab đến liên kết "Xem thứ tự nét", nhấn Enter | Liên kết nhận focus bằng Tab (có viền focus); Enter mở màn xem thứ tự nét của chữ 人 | e2e |
| TC-S6.2-AC1-27 | S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét | Chức năng | Mở màn xem thứ tự nét của chữ 人, bấm "Tập viết" | Màn luyện viết của 人 mở, chỉ có một khung viết với 2 nét mờ của chữ 人 | e2e |
| TC-S6.2-AC1-28 | S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét | Mobile 375 | Khổ 375×812, mở màn xem thứ tự nét của chữ 人 | Nút "Tập viết" nhìn thấy, có vùng chạm ≥ 44×44 px; không cuộn ngang | e2e |
| TC-S6.2-AC1-29 | S6.2-AC1 Nút Tập viết bấm được bằng bàn phím | A11y | Trên màn xem thứ tự nét của chữ 人, chỉ dùng bàn phím: Tab đến nút "Tập viết", nhấn Enter | Nút nhận focus bằng Tab, viền focus nhìn thấy; Enter mở màn luyện viết của chữ 人 | e2e |
| TC-S6.2-AC1-30 | S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét | Chức năng | Mở màn xem thứ tự nét của chữ 龘 | Màn không hiện nút "Tập viết" | e2e |
| TC-S6.2-AC2-1 | S6.2-AC2 Báo ngay khi viết sai nét | Chức năng | Mở chữ 十, vẽ vòng tròn (hình dạng khác hẳn nét ngang), nhả chuột | Ngay sau khi nhả, màn hiện thông báo viết sai nét; trong lúc đang kéo chưa có thông báo | không |
| TC-S6.2-AC2-2 | S6.2-AC2 Báo ngay khi viết sai nét | Sáng/Tối | Gây thông báo viết sai nét ở giao diện sáng rồi tối | Thông báo là chữ (không chỉ phân biệt bằng màu), tương phản chữ ≥ 4.5:1 ở cả hai giao diện | không |
| TC-S6.2-AC2-3 | S6.2-AC2 Viết ngược hướng thì sai | Chức năng | Mở chữ 十 (đang chờ nét ngang), vẽ nét ngang từ phải sang trái, nhả | Màn hiện thông báo viết sai nét; nét vừa vẽ bị xoá; chữ vẫn chờ nét ngang | không |
| TC-S6.2-AC2-4 | S6.2-AC2 Viết ngược hướng thì sai | Biên | Mở chữ 十, viết đúng nét ngang, rồi vẽ nét sổ dọc từ dưới lên trên | Màn hiện thông báo viết sai nét; nét sổ ngược bị xoá; nét ngang vẫn còn; chữ vẫn chờ nét sổ | không |
| TC-S6.2-AC2-5 | S6.2-AC2 Viết nét của một nét khác thì sai | Chức năng | Mở chữ 十 (đang chờ nét ngang), vẽ nét sổ dọc từ trên xuống, nhả | Màn hiện thông báo viết sai nét; nét sổ dọc không được giữ lại trên khung; chữ vẫn chờ nét ngang | không |
| TC-S6.2-AC2-6 | S6.2-AC2 Nét sai bị xoá và được viết lại | Chức năng | Mở chữ 十, vẽ nét sai, nhả; sau đó viết nét ngang đúng | Nét sai biến mất khỏi khung ngay sau khi nhả (chỉ còn nét mờ); nét ngang đúng được nhận, chữ sang nét kế | không |
| TC-S6.2-AC2-7 | S6.2-AC2 Nét sai bị xoá và được viết lại | Biên | Viết sai 5 lần liên tiếp ở nét đầu của chữ 十 | Bài không bị chặn hay kết thúc; sau mỗi lần sai vẫn viết lại được; khung không còn nét sai nào tồn đọng | không |
| TC-S6.2-AC2-8 | S6.2-AC2 Nét sai bị xoá và được viết lại | Mobile 375 | Trên màn cảm ứng 375, viết sai một nét bằng ngón tay rồi viết lại đúng | Nét sai bị xoá, viết lại đúng được nhận, trang không cuộn | không |
| TC-S6.2-AC2-9 | S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình | A11y | Bật trình đọc màn hình, viết sai một nét, nhả | Trình đọc màn hình đọc thông báo viết sai nét mà không cần di chuyển focus | không |
| TC-S6.2-AC2-10 | S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình | A11y | Dùng Tab đưa focus vào khung viết (thấy viền focus), viết sai một nét bằng chuột hoặc ngón tay | Khi thông báo hiện, focus vẫn ở khung viết, viền focus vẫn nhìn thấy | không |
| TC-S6.2-AC2-11 | S6.2-AC2 Lần sai liên tiếp sau cũng được đọc lại | A11y | Bật trình đọc màn hình, mở chữ 十, viết sai nét ngang 2 lần liên tiếp | Trình đọc màn hình đọc thông báo viết sai nét ở cả lần sai thứ nhất và lần sai thứ hai (lần hai không bị bỏ qua dù cùng nội dung) | không |
| TC-S6.2-AC2-12 | S6.2-AC2 Viết đúng thì thông báo sai biến mất | Chức năng | Viết sai nét ngang của 十 (thấy thông báo), rồi viết đúng nét ngang | Thông báo viết sai không còn hiện | không |
| TC-S6.2-AC3-1 | S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý | Chức năng | Mở chữ 十, viết sai nét đầu đúng 2 lần liên tiếp | Mỗi lần sai có thông báo sai; khung chỉ có nét mờ của cả chữ, chưa có nét nào được làm nổi bật như gợi ý | không |
| TC-S6.2-AC3-2 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Chức năng | Mở chữ 十, viết sai nét đầu đúng 3 lần liên tiếp | Sau lần sai thứ 3, nét ngang được làm nổi bật, phân biệt được với nét mờ của cả chữ; nét sổ vẫn mờ, không nổi bật; không có nét nổi bật ở lần sai thứ 1 và 2 | không |
| TC-S6.2-AC3-3 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Mobile 375 | Trên màn cảm ứng 375, mở chữ 你, viết đúng nét 1, rồi sai nét 2 ba lần liên tiếp | Nét 2 được làm nổi bật, nằm gọn trong khung và nhìn rõ (≥ 3:1 với nền); nét 1 đã viết vẫn nhìn thấy; các nét 3–7 vẫn mờ | không |
| TC-S6.2-AC3-4 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Sáng/Tối | Mở chữ 十, viết đúng nét ngang, sai nét sổ 3 lần; làm ở giao diện sáng rồi tối | Ở cả hai giao diện: nét sổ gợi ý tương phản ≥ 3:1 với nền; khác nét mờ không chỉ ở màu và tương phản với nét mờ ≥ 3:1; phân biệt được với nét ngang đã viết đúng | không |
| TC-S6.2-AC3-5 | S6.2-AC3 Bộ đếm sai tính riêng từng nét | Chức năng | Mở chữ 十: sai nét ngang 2 lần, viết đúng nét ngang, sai nét sổ 2 lần, rồi sai nét sổ lần thứ 3 | Sau lần sai thứ 2 của nét sổ chưa có nét nổi bật; sau lần sai thứ 3 của nét sổ, nét sổ được làm nổi bật; nét ngang không được làm nổi bật như gợi ý | không |
| TC-S6.2-AC3-6 | S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai | Chức năng | Mở chữ 十: sai nét ngang 2 lần, chạm một điểm trong khung, rồi sai nét ngang thêm 1 lần | Lần chạm một điểm không có thông báo và chưa có gợi ý; nét ngang được làm nổi bật ở lần sai thứ 3 | không |
| TC-S6.2-AC3-7 | S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai | Biên | Mở chữ 十: sai nét ngang 1 lần, chạm một điểm 3 lần, rồi sai thêm 1 lần | Chưa có nét nổi bật (mới sai 2 lần, các lần chạm không được đếm) | không |
| TC-S6.2-AC3-8 | S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai | Chức năng | Mở chữ 十, sai nét đầu 3 lần (gợi ý hiện), chờ 10 giây không thao tác, rồi sai thêm 1 lần | Nét ngang vẫn được làm nổi bật liên tục: không tự tắt sau 10 giây chờ, không tắt trong lúc kéo nét sai thứ 4, không tắt rồi hiện lại sau khi nhả | không |
| TC-S6.2-AC3-9 | S6.2-AC3 Viết đúng thì gợi ý ẩn | Chức năng | Mở chữ 十, sai nét ngang 3 lần (gợi ý hiện), rồi viết đúng nét ngang | Nét ngang được giữ lại trên khung và không còn được làm nổi bật như gợi ý; chờ nét sổ, nét sổ vẫn mờ, không nổi bật | không |
| TC-S6.2-AC3-10 | S6.2-AC3 Gợi ý không phụ thuộc chuyển động | A11y | Bật giảm chuyển động của hệ điều hành, mở chữ 十, sai nét đầu 3 lần, chờ 10 giây | Nét ngang được làm nổi bật tĩnh ngay khi hiện và suốt 10 giây: không nháy, không chạy animation; vẫn phân biệt được với nét mờ của cả chữ (theo tiêu chí ở "Điều kiện đầu chung") | không |
| TC-S6.2-AC1-31 | S6.2-AC1 Giảm chuyển động trên khung viết | A11y | Bật giảm chuyển động của hệ điều hành, mở chữ 十: viết đúng nét ngang, viết sai nét sổ (vẽ từ dưới lên) một lần, rồi viết đúng nét sổ | Nét ngang đúng hiện ngay trên khung, không hiện dần; nét sai biến mất ngay khi nhả, không mờ dần; khi hoàn thành chữ không có nhấp sáng cả chữ, thông báo hoàn thành vẫn hiện | không |
| TC-S6.2-AC1-32 | S6.2-AC1 Giảm chuyển động trên khung viết | A11y | Tắt giảm chuyển động, lặp lại các bước của TC-S6.2-AC1-31 để đối chiếu | Nét đúng được giữ lại, nét sai bị xoá, màn báo đã viết xong chữ, giống TC-S6.2-AC1-31 (chỉ khác hiệu ứng chuyển động) | không |

## Ghi chú cho QA và Dev

- **Phần Dev kiểm bằng Vitest/Testing Library** (bộ so nét giả phát sự kiện đúng/sai/bỏ qua, theo "Tầng test" trong proposal), QA vẫn chạy
  tay khi nghiệm thu: TC-S6.2-AC1-6, -8, -10 đến -13, -15 đến -19, -31; TC-S6.2-AC2-1, -3 đến -7, -10, -12; TC-S6.2-AC3-1, -2, -5 đến -10.
  Các case này đánh `không` vì vẽ bằng cử chỉ khó ổn định trên Playwright. Bộ so nét giả không chứng minh bộ so nét thật nhận đúng nét vẽ tay,
  nên khi nghiệm thu QA ưu tiên chạy tay TC-S6.2-AC1-6, -8, TC-S6.2-AC2-3, TC-S6.2-AC3-2 trên bản build thật.
- Chưa có case cho ngưỡng dung sai của "sai nét": việc so khớp do thư viện vẽ và chấm nét đảm nhiệm, nên các case dùng nét sai rõ ràng.
- Chạm một điểm / nét quá ngắn: spec đã chốt là bỏ qua. Ngưỡng "quá ngắn" do design.md đặt; TC-S6.2-AC1-18 chỉ chạm giữ không kéo, phần
  nét ngắn kiểm lại theo ngưỡng design.md khi nghiệm thu.
- Giảm chuyển động (TC-S6.2-AC1-31, -32, TC-S6.2-AC3-10): Dev có thể thêm e2e giả lập giảm chuyển động để kiểm phần mở màn; phần vẽ nét
  vẫn chạy tay.
- Chữ 十 và 人 có 2 nét, 你 có 7 nét, theo dữ liệu nét hiện có; nếu dữ liệu đổi, QA đổi chữ mẫu.
- Nút "Tập viết" trên màn S6.1 do S6.2 thêm sau khi S6.1 merge; nghiệm thu S6.2 cần bản build có cả hai.
- Offline (TC-S6.2-AC1-4, -5): dữ liệu nét đang dùng được tải sẵn khi cài app (docs/03-architecture.md §7), nên bản 0.1 học offline hoàn toàn.
