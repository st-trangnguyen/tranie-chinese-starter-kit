# Test cases: S10.3 Sắp xếp câu

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/sentence-order/spec.md`. Scenario của
spec chỉ mang hai ID (`S10.3-AC1`, `S10.3-AC2`), nên cột Scenario ghi thêm tên Scenario. Số thứ tự đếm riêng cho từng ID và giữ nguyên qua
các vòng sửa (case mới nhận số tiếp theo), nên trong bảng số thứ tự có thể không liền nhau.

**Điều kiện đầu chung**

- Chạy trên **bản build e2e** (bản build có nạp bài mẫu, xem dưới), không phải bản dev và không phải bản phát hành. Mỗi case bắt đầu từ
  trình duyệt sạch dữ liệu của app, đã xong màn chào mừng, chưa có thẻ ôn tập nào, có mạng, giao diện sáng, khổ desktop 1280×800, thiết bị
  không bật giảm chuyển động, trừ khi case nêu khác.
- **Nội dung mẫu**: bản 0.2 chưa có câu sắp xếp trong nội dung thật (soạn ở E11). Bài mẫu có câu sắp xếp chỉ có trong bản build e2e (hoặc
  được e2e thay vào nội dung), không có trong nội dung phát hành. **Chủ đề mẫu** mở được ngay từ bản đồ với người học mới và gồm:
  - **Bài mẫu**: bài học thường duy nhất của chủ đề mẫu, **chỉ có ba câu sắp xếp câu**, theo thứ tự Câu A → Câu B → Câu C:
    - **Câu A** (câu 1): câu "我很好", nghĩa "Tôi rất khỏe", thẻ đúng thứ tự "我", "很", "好".
    - **Câu B** (câu 2): câu "我很好，谢谢！", pinyin "wǒ hěn hǎo, xièxie!", thẻ đúng thứ tự "我", "很", "好", "谢谢".
    - **Câu C** (câu 3): câu "我的朋友的书", thẻ đúng thứ tự "我", "的", "朋友", "的", "书" (hai thẻ "的").
  - **Bài kiểm tra mẫu** cuối chủ đề mẫu: đúng **5 câu**, gồm Câu B và 4 câu dạng chọn đáp án đã có từ trước (không có câu viết chữ, không
    có câu nói). Bài kiểm tra mở trên bản đồ sau khi bài mẫu "Đã xong".
- **Đi tới từng câu**:
  - "Ở Câu A" / "tới Câu A" = từ bản đồ mở bài mẫu; Câu A là câu hiện đầu tiên.
  - "Ở Câu B" / "mở Câu B" = ở Câu A, chạm lần lượt "我", "很", "好" (sắp đúng), bấm "Kiểm tra", thấy "Đúng", bấm "Tiếp tục".
  - "Ở Câu C" / "mở Câu C" = tới Câu B như trên; ở Câu B chạm lần lượt "我", "很", "好", "谢谢", bấm "Kiểm tra", thấy "Đúng", bấm "Tiếp tục".
  - "Làm xong bài mẫu" = tới Câu C như trên; ở Câu C chạm "我", một thẻ "的", "朋友", thẻ "的" còn lại, "书", bấm "Kiểm tra", thấy "Đúng",
    bấm "Tiếp tục" tới màn tổng kết; không bấm "Bỏ qua câu này" ở câu nào. Trên bản đồ bài mẫu hiện "Đã xong".
  - "Mở lại" một câu = thoát bài, từ bản đồ mở lại bài mẫu và đi tới câu đó như trên (câu hiện lại từ đầu, thẻ được xáo lại).
- "Hàng" = hàng câu trả lời có nhãn "Câu trả lời". "Bên dưới" = vùng các thẻ chưa đặt, có nhãn "Các từ". Ghi hàng là `"我", "很"` theo thứ
  tự trái sang phải.
- Muốn có hàng ban đầu cụ thể (vd `"很", "我", "好"`), QA chạm các thẻ bên dưới theo đúng thứ tự đó.
- Thứ tự bên dưới chỉ do lần xáo lúc mở quyết định (thẻ trả về luôn về chỗ cũ), nên không dựng được bằng thao tác. Case cần một thứ tự bên
  dưới cụ thể thì **mở lại câu tới khi thứ tự bên dưới lúc mở đúng như case ghi** (Câu A có 5 thứ tự có thể có, thường vài lần là gặp); e2e
  làm như vậy hoặc dùng thứ tự đã ghi lúc mở để suy ra kết quả.
- **Danh sách thẻ ôn tập** (case "không tạo thẻ"): app không có màn liệt kê thẻ. **e2e** đọc danh sách thẻ đã lưu từ phía test (như
  S9.1/S9.4, cách đọc do dev ghi trong design.md). **QA chạy tay** mở màn "Thống kê ôn tập" từ Trang chủ (S9.5): màn này đếm mọi thẻ, kể cả
  thẻ chưa tới hạn, và hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." khi không có thẻ nào. Không dùng màn ôn tập để kết luận
  "không có thẻ", vì màn ôn tập trống cả khi có thẻ nhưng chưa tới hạn hoặc đã chạm giới hạn mỗi ngày. Bản build chưa có S9.5 thì QA đọc kết
  quả e2e cho phần này.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| **Câu sắp xếp hiện nghĩa và các thẻ từ đã xáo** | | | | | |
| TC-S10.3-AC1-1 | S10.3-AC1 Câu hiện nghĩa và các thẻ từ đã xáo | Chức năng | Mở bài mẫu, tới Câu A | Màn hiện "Tôi rất khỏe"; hàng "Câu trả lời" trống; bên dưới có đúng ba thẻ "我", "很", "好"; không thấy chữ "我很好" liền nhau ở đâu trên màn và không thấy pinyin nào (vd "wǒ", "hěn", "hǎo") | e2e |
| TC-S10.3-AC1-2 | S10.3-AC1 Câu hiện nghĩa và các thẻ từ đã xáo | Mobile 375 | Khổ 375×812, mở Câu B | Nghĩa, hàng "Câu trả lời" và cả bốn thẻ nằm gọn trong màn, không cuộn ngang, không thẻ nào bị che hay cắt chữ | không |
| TC-S10.3-AC1-3 | S10.3-AC1 Câu hiện nghĩa và các thẻ từ đã xáo | Sáng/Tối | Mở Câu B ở giao diện sáng, rồi chuyển sang tối | Ở cả hai giao diện: chữ trên thẻ, nghĩa và nhãn "Câu trả lời" đọc rõ; viền hàng câu trả lời phân biệt được với nền | không |
| TC-S10.3-AC1-4 | S10.3-AC1 Thứ tự ban đầu không trùng thứ tự đúng | Chức năng | Mở bài mẫu tới Câu A, ghi lại thứ tự thẻ bên dưới; thoát bài, mở lại; lặp đủ 20 lần | Không lần nào thứ tự bên dưới (trái sang phải) là "我", "很", "好" | không |
| TC-S10.3-AC1-18 | S10.3-AC1 Câu có thẻ trùng chữ không hiện ban đầu theo dãy chữ đúng | Biên | Mở bài mẫu tới Câu C, đọc chữ trên các thẻ bên dưới từ trái sang phải; thoát bài, mở lại; lặp đủ 20 lần | Không lần nào dãy chữ bên dưới là "我", "的", "朋友", "的", "书" | không |
| TC-S10.3-AC1-17 | S10.3-AC1 Câu sắp xếp câu không còn bị bỏ qua | Chức năng | Mở bài mẫu, đi tới Câu A | Màn hiện nghĩa "Tôi rất khỏe", hàng "Câu trả lời" và các thẻ từ; không hiện "Bỏ qua câu này" | e2e |
| **Kéo hoặc chạm để sắp xếp các từ** | | | | | |
| TC-S10.3-AC1-5 | S10.3-AC1 Chạm thẻ thì thẻ nối vào cuối câu | Chức năng | Ở Câu A, chạm thẻ "我", rồi chạm thẻ "很" | Hàng là "我", "很"; bên dưới chỉ còn thẻ "好" | e2e |
| TC-S10.3-AC1-6 | S10.3-AC1 Chạm thẻ trong câu thì thẻ trở về bên dưới | Chức năng | Ở Câu A, chạm "我", "很", "好" để hàng là "我", "很", "好"; chạm thẻ "很" trong hàng | Hàng là "我", "好" ("好" dồn lên sát "我"); thẻ "很" hiện lại bên dưới | e2e |
| TC-S10.3-AC1-7 | S10.3-AC1 Chạm thẻ trong câu thì thẻ trở về bên dưới | Biên | Ở Câu B, ghi lại thứ tự thẻ bên dưới lúc mở; chạm cả bốn thẻ vào hàng; chạm lần lượt từng thẻ trong hàng cho tới khi hàng trống | Hàng trống; bốn thẻ bên dưới nằm lại đúng thứ tự như lúc mở (mỗi thẻ về chỗ cũ của nó) | không |
| TC-S10.3-AC1-8 | S10.3-AC1 Kéo thẻ vào giữa câu | Chức năng | Ở Câu A, chạm "我" rồi "好" để hàng là "我", "好"; kéo thẻ "很" từ bên dưới thả vào khe giữa "我" và "好" | Hàng là "我", "很", "好"; bên dưới trống | e2e |
| TC-S10.3-AC1-9 | S10.3-AC1 Kéo để đổi chỗ trong câu | Chức năng | Ở Câu A, chạm "很", "我", "好" để hàng là "很", "我", "好"; kéo thẻ "很" thả vào sau "我" | Hàng là "我", "很", "好" | e2e |
| TC-S10.3-AC1-10 | S10.3-AC1 Kéo thẻ ra ngoài câu thì thẻ trở về bên dưới | Chức năng | Ở Câu A, ghi lại thứ tự thẻ bên dưới lúc mở; chạm "我" rồi "很" để hàng là "我", "很"; kéo thẻ "很" thả ra ngoài hàng (vùng trống của màn) | Hàng là "我"; thẻ "很" hiện lại bên dưới, đúng chỗ của nó lúc mở (so với thẻ "好") | e2e |
| TC-S10.3-AC1-11 | S10.3-AC1 Kéo thẻ vào giữa câu | Mobile 375 | Khổ 375×812, bật mô phỏng cảm ứng (hoặc điện thoại thật); ở Câu A làm lại bước của TC-S10.3-AC1-8 và TC-S10.3-AC1-9 bằng ngón tay | Kết quả như TC-S10.3-AC1-8 và TC-S10.3-AC1-9; khi kéo, màn không bị cuộn theo ngón tay thay cho thẻ | không |
| **Vị trí thẻ khi thả đè lên một thẻ trong hàng** | | | | | |
| TC-S10.3-AC1-19 | S10.3-AC1 Thả đè lên nửa trái một thẻ thì đặt trước thẻ đó | Chức năng | Ở Câu A, chạm "我" rồi "好" để hàng là "我", "好"; kéo thẻ "很" từ bên dưới thả sao cho điểm thả nằm trên nửa trái thẻ "我" | Hàng là "很", "我", "好" | e2e |
| TC-S10.3-AC1-20 | S10.3-AC1 Thả đè lên nửa phải một thẻ thì đặt sau thẻ đó | Chức năng | Ở Câu A, chạm "我" rồi "好" để hàng là "我", "好"; kéo thẻ "很" từ bên dưới thả sao cho điểm thả nằm trên nửa phải thẻ "我" | Hàng là "我", "很", "好" | e2e |
| TC-S10.3-AC1-21 | S10.3-AC1 Thả đè lên nửa phải một thẻ thì đặt sau thẻ đó | Biên | Ở Câu A, chạm "很" rồi "我" để hàng là "很", "我"; kéo thẻ "好" từ bên dưới thả vào chỗ trống của hàng, bên phải thẻ "我" (không đè lên thẻ nào) | Hàng là "很", "我", "好" (thẻ được đặt cuối hàng) | không |
| **Sắp xếp được bằng bàn phím và trình đọc màn hình** | | | | | |
| TC-S10.3-AC1-12 | S10.3-AC1 Sắp xếp bằng bàn phím | A11y | Ở Câu A, chỉ dùng bàn phím: nhấn Tab tới thẻ "我", nhấn Enter; sau đó dùng Tab hoặc Shift+Tab (focus giờ đang ở một thẻ bên dưới) tới thẻ "很", nhấn Space | Hàng là "我", "很"; sau mỗi lần nhấn Enter/Space focus nằm trên một thẻ bên dưới hoặc nút "Kiểm tra", không rơi về đầu trang; thẻ đang có focus luôn có viền nhìn thấy | e2e |
| TC-S10.3-AC1-13 | S10.3-AC1 Sắp xếp bằng bàn phím | A11y | Ở Câu A, chỉ dùng bàn phím đặt cả ba thẻ vào hàng theo thứ tự "我", "很", "好"; dùng Shift+Tab tới thẻ "很" trong hàng và nhấn Enter | Sau khi đặt thẻ thứ ba, focus nằm trên nút "Kiểm tra"; sau khi nhấn Enter trên "很", thẻ "很" về bên dưới, hàng là "我", "好" và focus nằm trên thẻ "好" trong hàng | không |
| TC-S10.3-AC1-14 | S10.3-AC1 Sắp xếp bằng bàn phím | Sáng/Tối | Giao diện tối, Tab qua các thẻ bên dưới và trong hàng | Viền focus trên thẻ nhìn thấy rõ trên nền tối | không |
| TC-S10.3-AC1-15 | S10.3-AC1 Thẻ có tên đọc được cho trình đọc màn hình | A11y | Mở Câu B, xem cây trợ năng của trình duyệt (hoặc bật trình đọc màn hình) | Mỗi thẻ là một nút, tên là chữ trên thẻ ("我", "很", "好", "谢谢"); hàng câu trả lời có nhãn "Câu trả lời"; vùng thẻ bên dưới có nhãn "Các từ" | e2e |
| TC-S10.3-AC1-16 | S10.3-AC1 Giảm chuyển động thì thẻ đổi chỗ ngay | Chức năng | Bật giảm chuyển động trên thiết bị (hoặc mô phỏng trong trình duyệt); ở Câu A chạm thẻ "我" | Thẻ "我" hiện ngay trong hàng, không có hiệu ứng thẻ bay/trượt từ dưới lên | e2e |
| **Focus sau khi chuyển thẻ bằng bàn phím** | | | | | |
| TC-S10.3-AC1-22 | S10.3-AC1 Focus sau khi đưa thẻ vào câu bằng bàn phím | A11y | Mở lại Câu A tới khi thứ tự bên dưới lúc mở là "好", "我", "很" (hàng trống); chỉ dùng bàn phím: Tab tới thẻ "我" bên dưới, nhấn Enter | Hàng là "我"; bên dưới là "好", "很"; focus nằm trên thẻ "很" bên dưới (có viền nhìn thấy) | e2e |
| TC-S10.3-AC1-23 | S10.3-AC1 Focus sau khi đưa thẻ vào câu bằng bàn phím | Biên | Ở Câu A, hàng trống; ghi lại thứ tự ba thẻ bên dưới; Tab tới thẻ **cuối cùng** bên dưới, nhấn Enter | Thẻ đó vào hàng; focus nằm trên thẻ vốn đứng ngay trước nó bên dưới (thẻ thứ hai lúc mở) | không |
| TC-S10.3-AC1-24 | S10.3-AC1 Đưa thẻ cuối vào câu thì focus tới nút Kiểm tra | A11y | Ở Câu A, chạm "我" rồi "很" để hàng là "我", "很"; Tab tới thẻ "好" bên dưới, nhấn Enter | Hàng là "我", "很", "好"; focus nằm trên nút "Kiểm tra" | e2e |
| TC-S10.3-AC1-25 | S10.3-AC1 Focus sau khi trả thẻ về bằng bàn phím | A11y | Ở Câu A, chạm "我", "很", "好" để hàng là "我", "很", "好"; Tab tới thẻ "很" trong hàng, nhấn Enter | Hàng là "我", "好"; thẻ "很" về bên dưới; focus nằm trên thẻ "好" trong hàng | e2e |
| TC-S10.3-AC1-26 | S10.3-AC1 Focus sau khi trả thẻ về bằng bàn phím | Biên | Ở Câu A, chạm "我", "很", "好" để hàng là "我", "很", "好"; Tab tới thẻ "好" trong hàng (thẻ cuối hàng), nhấn Enter | Hàng là "我", "很"; focus nằm trên thẻ "很" trong hàng | không |
| TC-S10.3-AC1-27 | S10.3-AC1 Trả thẻ cuối khỏi hàng thì focus tới thẻ đầu bên dưới | A11y | Ở Câu A, chạm "我" để hàng chỉ có "我"; Tab tới thẻ "我" trong hàng, nhấn Enter | Hàng trống; focus nằm trên thẻ đầu tiên (trái nhất) bên dưới | e2e |
| **Báo cho trình đọc màn hình khi thẻ chuyển vùng** | | | | | |
| TC-S10.3-AC1-28 | S10.3-AC1 Thẻ vào câu thì trình đọc màn hình được báo | A11y | Bật trình đọc màn hình (VoiceOver/NVDA); ở Câu A, Tab tới thẻ "很" bên dưới, nhấn Enter | Trình đọc màn hình đọc "Đã thêm 很 vào câu" | e2e |
| TC-S10.3-AC1-29 | S10.3-AC1 Thẻ về bên dưới thì trình đọc màn hình được báo | A11y | Bật trình đọc màn hình; ở Câu A, chạm "我", "很", "好" để hàng là "我", "很", "好"; Tab tới thẻ "很" trong hàng, nhấn Enter | Trình đọc màn hình đọc "Đã bỏ 很 khỏi câu" | e2e |
| TC-S10.3-AC1-30 | S10.3-AC1 Thẻ vào câu thì trình đọc màn hình được báo | Biên | Bật trình đọc màn hình; ở Câu A: chạm thẻ "我" bên dưới; kéo thẻ "很" từ bên dưới thả vào hàng; kéo thẻ "很" từ hàng thả ra ngoài hàng | Lần lượt đọc "Đã thêm 我 vào câu", "Đã thêm 很 vào câu", "Đã bỏ 很 khỏi câu" (thông báo có cả khi chạm và kéo, không chỉ bàn phím) | không |
| **Chỉ chấm khi mọi thẻ đã vào câu và người học bấm Kiểm tra** | | | | | |
| TC-S10.3-AC2-1 | S10.3-AC2 Còn thẻ chưa đặt thì chưa chấm được | Chức năng | Ở Câu A, chạm hai thẻ vào hàng; thử bấm "Kiểm tra" | Nút "Kiểm tra" không bấm được; màn không hiện "Đúng" hay "Sai" | e2e |
| TC-S10.3-AC2-2 | S10.3-AC2 Đặt đủ thẻ thì chưa tự chấm | Chức năng | Ở Câu A, chạm cả ba thẻ vào hàng; chờ 3 giây, không bấm gì | Nút "Kiểm tra" bấm được; màn không hiện "Đúng" hay "Sai" cho tới khi bấm "Kiểm tra" | e2e |
| TC-S10.3-AC2-3 | S10.3-AC2 Còn thẻ chưa đặt thì chưa chấm được | Biên | Ở Câu A, chạm cả ba thẻ vào hàng (nút "Kiểm tra" bấm được); chạm một thẻ trong hàng để trả về bên dưới | Nút "Kiểm tra" lại không bấm được | không |
| **Chấm theo đáp án. Sai thì hiện câu đúng** | | | | | |
| TC-S10.3-AC2-4 | S10.3-AC2 Sắp đúng thì được chấm đúng | Chức năng | Ở Câu B, sắp hàng "我", "很", "好", "谢谢"; bấm "Kiểm tra" | Hiện "Đúng"; hiện "我很好，谢谢！" kèm pinyin "wǒ hěn hǎo, xièxie!"; không có dòng "Đáp án đúng: …"; có nút "Tiếp tục" | e2e |
| TC-S10.3-AC2-5 | S10.3-AC2 Sắp sai thì hiện câu đúng | Chức năng | Ở Câu B, sắp hàng "很", "我", "好", "谢谢"; bấm "Kiểm tra" | Hiện "Sai"; hiện "我很好，谢谢！" kèm pinyin "wǒ hěn hǎo, xièxie!"; giải thích "Đáp án đúng: 我很好，谢谢！"; hàng vẫn là "很", "我", "好", "谢谢"; có nút "Tiếp tục" | e2e |
| TC-S10.3-AC2-6 | S10.3-AC2 Từ lặp lại đổi chỗ cho nhau vẫn đúng | Biên | Chạy hai lần, mỗi lần mở lại Câu C. **Lần 1**: chạm "我", chạm thẻ "的" nằm **bên trái** trong hai thẻ "的" bên dưới, chạm "朋友", chạm thẻ "的" còn lại, chạm "书"; bấm "Kiểm tra". **Lần 2**: như lần 1 nhưng thẻ "的" chạm trước là thẻ nằm **bên phải** | Cả hai lần: hàng hiện "我", "的", "朋友", "的", "书"; hiện "Đúng" | không |
| TC-S10.3-AC2-7 | S10.3-AC2 Chấm xong thì khóa các thẻ | Chức năng | Làm TC-S10.3-AC2-5 tới khi hiện "Sai"; rồi chạm một thẻ trong hàng, kéo một thẻ sang chỗ khác, Tab tới một thẻ và nhấn Enter | Hàng vẫn là "很", "我", "好", "谢谢"; kết quả vẫn là "Sai", không có cách nào chấm lại | e2e |
| TC-S10.3-AC2-8 | S10.3-AC2 Sắp sai thì hiện câu đúng | Mobile 375 | Khổ 375×812, làm TC-S10.3-AC2-5 | "Sai", câu đúng, pinyin, giải thích và nút "Tiếp tục" nằm trong màn (cuộn dọc được nếu cần), không cuộn ngang, chữ không bị cắt | không |
| TC-S10.3-AC2-9 | S10.3-AC2 Sắp sai thì hiện câu đúng | Sáng/Tối | Làm TC-S10.3-AC2-4 và TC-S10.3-AC2-5 ở giao diện tối | "Đúng"/"Sai", câu đúng, pinyin và giải thích đọc rõ trên nền tối; thẻ đã khóa vẫn đọc được chữ | không |
| **Câu sắp xếp sai trong bài kiểm tra không tạo thẻ ôn tập** | | | | | |
| TC-S10.3-AC2-10 | S10.3-AC2 Câu sắp xếp sai tính vào số câu sai | Chức năng | Làm xong bài mẫu; mở bài kiểm tra mẫu (5 câu) từ bản đồ; trả lời đúng cả 4 câu dạng khác; ở Câu B sắp "很", "我", "好", "谢谢" và bấm "Kiểm tra"; làm hết bài | Màn tổng kết hiện điểm "80%", "Đúng 4 / 5 câu" và "Sai 1 câu" | e2e |
| TC-S10.3-AC2-11 | S10.3-AC2 Câu sắp xếp sai không tạo thẻ ôn tập | Chức năng | **Cần code S9.4 (câu sai vào ôn tập) đã có trong bản build**; chưa có thì ghi "không chạy được". Chưa có thẻ ôn tập nào; làm xong bài mẫu; e2e đọc danh sách thẻ (phải rỗng, nếu không thì dừng: lỗi thuộc TC-S10.3-AC2-16); làm bài kiểm tra mẫu như TC-S10.3-AC2-10 tới màn tổng kết ("80%", "Đúng 4 / 5 câu", "Sai 1 câu"); kiểm danh sách thẻ ôn tập (xem Điều kiện đầu) | Danh sách thẻ ôn tập rỗng. QA chạy tay: màn "Thống kê ôn tập" hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." | e2e |
| **Học xong bài có câu sắp xếp không tạo thẻ ôn tập cho câu đó** | | | | | |
| TC-S10.3-AC2-16 | S10.3-AC2 Học xong bài thường chỉ có câu sắp xếp thì không tạo thẻ | Chức năng | **Cần code S9.1 (học xong bài thì tạo thẻ) đã có trong bản build**; chưa có thì ghi "không chạy được". Chưa có thẻ ôn tập nào; làm xong bài mẫu (ba câu sắp xếp, không bỏ qua câu nào); kiểm danh sách thẻ ôn tập (xem Điều kiện đầu) | Bài mẫu hiện "Đã xong" trên bản đồ; danh sách thẻ ôn tập rỗng. QA chạy tay: màn "Thống kê ôn tập" hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." | e2e |
| **Nội dung câu sắp xếp phải ghép được thành câu** | | | | | |
| TC-S10.3-AC2-12 | S10.3-AC2 Thẻ không ghép thành câu thì kiểm tra nội dung báo lỗi | Chức năng | Trong một bài nháp, tạo câu sắp xếp cho câu "我很好，谢谢！" với thẻ "我", "好", "谢谢"; chạy kiểm tra nội dung, rồi chạy dựng nội dung | Kiểm tra nội dung báo lỗi, nêu tên bài và câu đó; dựng nội dung báo cùng lỗi và không ghi nội dung ra (nội dung đã có trước đó không đổi) | không |
| TC-S10.3-AC2-13 | S10.3-AC2 Chỉ một thẻ thì kiểm tra nội dung báo lỗi | Chức năng | Tạo câu sắp xếp cho câu "好" chỉ với thẻ "好"; chạy kiểm tra nội dung | Kiểm tra nội dung báo lỗi, nêu tên bài và câu đó | không |
| TC-S10.3-AC2-14 | S10.3-AC2 Các thẻ giống hệt nhau thì kiểm tra nội dung báo lỗi | Chức năng | Tạo câu sắp xếp cho câu "谢谢" với thẻ "谢", "谢"; chạy kiểm tra nội dung | Kiểm tra nội dung báo lỗi, nêu tên bài và câu đó | không |
| TC-S10.3-AC2-15 | S10.3-AC2 Nội dung hợp lệ thì qua kiểm tra | Chức năng | Tạo câu sắp xếp cho câu "我很好，谢谢！" với thẻ "我", "很", "好", "谢谢"; chạy kiểm tra nội dung | Kiểm tra nội dung không báo lỗi cho câu đó | không |

**Ghi chú**

- TC-S10.3-AC1-4, TC-S10.3-AC1-18 và TC-S10.3-AC2-6 đánh `không` vì tầng tự động phù hợp là test quy tắc xáo/chấm (Vitest), không phải
  e2e; QA vẫn chạy tay trên bản build e2e. TC-S10.3-AC2-12 tới TC-S10.3-AC2-15 là công cụ kiểm tra nội dung của người soạn, kiểm bằng
  Vitest/kiểm tra nội dung, không phải Playwright.
- Case thông báo cho trình đọc màn hình đánh `e2e` (TC-S10.3-AC1-28, -29) kiểm bằng nội dung vùng thông báo mà trình đọc màn hình đọc;
  QA chạy tay nghe bằng trình đọc màn hình thật.
- TC-S10.3-AC2-11 phụ thuộc code S9.4, TC-S10.3-AC2-16 phụ thuộc code S9.1 (proposal: code S10.3 làm sau code S9.4 và S9.1). Trước
  khi có code đó thì chưa có gì tạo thẻ, case sẽ pass trống, nên ghi "không chạy được" thay vì Pass.
- Không có case Offline: spec không nói gì về mạng và dạng bài không phát audio.
