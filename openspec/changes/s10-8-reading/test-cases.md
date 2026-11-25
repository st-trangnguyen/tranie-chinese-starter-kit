# Test cases: S10.8 Đọc hiểu

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/reading-comprehension/spec.md`. Các quyết
định `ba` đề xuất trong Open Questions của proposal được dùng nguyên văn; nếu người thật chốt khác thì sửa case tương ứng. Case thêm ở vòng
sau lấy số tiếp theo để giữ ID cũ, nên số trong một mục có thể không liền nhau.

**Điều kiện đầu chung**

- Chạy trên **bản build dùng cho kiểm thử tự động** (bản `pnpm e2e` tự build và mở ở cổng 4173), vì nội dung mẫu chỉ có trên bản build đó,
  không có trong nội dung phát hành. Không chạy trên bản dev. Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, giao
  diện sáng, công tắc "Hiện pinyin" để mặc định, có mạng, khổ desktop 1280×800, trừ khi case nêu khác.
- **Nội dung mẫu** (theo ví dụ đầu spec):
  - **Đoạn A** "我叫小明。我是学生。" gồm 6 từ 我 · 叫 · 小明 · 我 · 是 · 学生 và hai dấu "。"; "我" ở vị trí 1 và 4.
  - **Đoạn B** "他高兴地说。" gồm 4 từ 他 · 高兴 · 地 · 说 và một dấu "。"; "地" được chỉ định là mục đọc "de".
  - Dữ liệu từ (đúng danh sách từ HSK 1 hiện có của app): 我 "wǒ" "tôi; mình; của tôi"; 叫 "jiào" "kêu; gọi; đặt hàng; bảo"; 学生
    "xuésheng" "học sinh; trẻ đi học"; 地 mục "de": "de" "trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa
    đứng trước"; 地 mục "dì" (không dùng trong đoạn B): "dì" "đất; mặt đất; ruộng; vùng". 小明 là tên riêng khai báo trong câu: "Xiǎo Míng"
    "Tiểu Minh (tên người)". Nghĩa của 是, 他, 高兴, 说 không được case nào kiểm. Nếu danh sách từ đổi nghĩa, kết quả mong đợi theo dữ liệu
    mới của danh sách từ.
  - **Câu hỏi 1** (đoạn A): "Tiểu Minh là ai?", lựa chọn "Giáo viên", "Học sinh", "Bác sĩ", đúng "Học sinh".
  - **Câu hỏi 2** (đoạn A): "Người nói tên là gì?", lựa chọn "Tiểu Minh", "Tiểu Hồng", "Tiểu Lan", đúng "Tiểu Minh".
  - **Câu hỏi 3** (đoạn B): "Anh ấy nói như thế nào?", lựa chọn "Vui vẻ", "Chậm rãi", "Tức giận", đúng "Vui vẻ".
  - Thứ tự lựa chọn xáo khi câu hiện: mọi case chọn lựa chọn **theo chữ**, không theo vị trí. "Thứ tự lựa chọn" = thứ tự ba lựa chọn từ
    trên xuống (hoặc trái sang phải) đang hiện trên màn.
- **Bài mẫu hai câu** = bài học chỉ gồm hai câu đọc hiểu liền nhau dùng chung đoạn A (câu hỏi 1 rồi câu hỏi 2). **Bài mẫu 地** = bài có câu
  đọc hiểu với câu hỏi 3 (đoạn B). **Bài kiểm tra mẫu** = bài kiểm tra cuối chủ đề có một câu đọc hiểu (câu hỏi 1) và ít nhất một câu khác.
  **Bài có từ 学生** = một bài học thường (không phải đọc hiểu) có từ "学生", học xong thì tạo thẻ ôn tập của "学生" (S9.1). Dev ghi tên các
  bài này và cách mở (nếu cần mở khóa trước) trong PR code, như bài mẫu của các story trước.
- **Tới câu đọc hiểu** = mở bài mẫu hai câu và ở câu 1 (câu hỏi 1), trừ khi case nêu khác.
- **"Thoát bài"** = rời màn bài khi chưa làm xong (về Trang chủ/bản đồ) bằng cách thoát của màn bài; **"mở lại"** = mở lại đúng bài đó.
- **Nhãn sau khi chấm** (bảng nhãn chung S10.2): lựa chọn là đáp án có nhãn chữ "Đáp án đúng" (dù người học chọn hay không); lựa chọn người
  học chọn mà sai có nhãn "Đã chọn"; lựa chọn khác không có nhãn. **"Được đánh dấu đang chọn"** (từ trong đoạn) = có trạng thái đọc được,
  không chỉ đổi màu.
- **Kiểm tra nội dung** chạy bằng lệnh kiểm tra nội dung của dự án trên nội dung lỗi mẫu dev cung cấp trong test của PR code; người học không
  thấy phần này. QA đối chiếu kết quả test trên CI (xem Ghi chú).
- **Case thẻ ôn tập** (TC-S10.8-AC1-23 đến AC1-26) cần code S9.1 (thẻ ôn tập) và S9.4 (câu sai vào ôn tập) đã có trên bản build. Chưa có thì
  ghi "không chạy được: thiếu S9.1/S9.4".
  - **e2e** đọc danh sách thẻ đã lưu từ phía test (như S9.1/S9.4, cách đọc do dev ghi trong design.md) và có thể **nạp sẵn** thẻ, tiến độ
    bài (cách nạp thuộc phần test của PR code, như S9.4). Bản build không có màn ẩn hay công tắc nào để nạp hoặc xem thẻ.
  - **QA chạy tay** không xem được danh sách thẻ. App không có màn liệt kê thẻ; QA dùng màn "Thống kê ôn tập" từ Trang chủ (S9.5) vì màn này
    đếm mọi thẻ, kể cả thẻ chưa tới hạn. Không dùng màn ôn tập hay số thẻ cần ôn ở Trang chủ để kết luận "không có thẻ", vì chúng trống cả
    khi có thẻ chưa tới hạn. Bản build chưa có S9.5 thì QA đọc kết quả e2e cho phần thẻ.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.8-AC1-1 | S10.8-AC1 Câu đọc hiểu hiện đoạn văn và câu hỏi | Chức năng | Tới câu đọc hiểu | Đoạn văn "我叫小明。我是学生。" hiện ở trên; bên dưới là "Tiểu Minh là ai?" và đúng ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ" (thứ tự bất kỳ, không có lựa chọn thứ tư). Chưa có "Đúng", "Sai", nhãn "Đáp án đúng" hay nút "Tiếp tục" | e2e |
| TC-S10.8-AC1-2 | S10.8-AC1 Câu đọc hiểu hiện đoạn văn và câu hỏi | Mobile 375 | Ở khổ 375×812, tới câu đọc hiểu | Đoạn văn xuống dòng trong khung, không cuộn ngang; câu hỏi và cả ba lựa chọn đọc đủ chữ, bấm được bằng ngón tay | không |
| TC-S10.8-AC1-3 | S10.8-AC1 Câu đọc hiểu hiện đoạn văn và câu hỏi | Sáng/Tối | Tới câu đọc hiểu ở giao diện sáng, rồi đổi sang tối | Ở cả hai giao diện, đoạn văn chữ Hán, câu hỏi và lựa chọn đọc rõ trên nền | không |
| TC-S10.8-AC1-4 | S10.8-AC1 Thứ tự lựa chọn không cố định | Chức năng | Tới câu đọc hiểu, ghi vị trí (1, 2 hay 3) của "Học sinh". Thoát bài, mở lại bài mẫu hai câu, ghi lại vị trí. Lặp đủ 10 lần | Trong 10 lần, "Học sinh" không lần nào cũng ở cùng một vị trí. Mỗi lần vẫn đủ đúng ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ" | không |
| TC-S10.8-AC1-27 | S10.8-AC1 Chạm từ và chấm không đổi thứ tự lựa chọn | Chức năng | Tới câu đọc hiểu, ghi thứ tự lựa chọn. Bấm từ "学生", ghi thứ tự. Bấm "Đóng", ghi thứ tự. Chọn "Giáo viên", ghi thứ tự | Cả ba lần ghi sau đều giống hệt thứ tự lúc câu vừa hiện; vẫn đủ ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ" | e2e |
| TC-S10.8-AC1-28 | S10.8-AC1 Chạm từ và chấm không đổi thứ tự lựa chọn | Biên | Tới câu đọc hiểu, ghi thứ tự lựa chọn. Bấm "学生", rồi bấm "叫" (đổi từ), rồi bấm lại "叫" (đóng ô), rồi Tab tới "我" và nhấn Enter, nhấn Escape; chọn "Học sinh" | Sau mỗi thao tác, thứ tự lựa chọn vẫn giống hệt lúc câu vừa hiện, kể cả sau khi chấm "Đúng" | không |
| TC-S10.8-AC1-29 | S10.8-AC1 Mở lại bài đang dở thì thứ tự xáo mới | Chức năng | Tới câu đọc hiểu, không chọn gì (có thể bấm "学生" rồi "Đóng"); thoát bài; mở lại bài mẫu hai câu | Màn hiện lại câu 1 với đoạn văn "我叫小明。我是学生。", câu hỏi "Tiểu Minh là ai?" ở trạng thái chưa trả lời (không có "Đúng", "Sai", nhãn hay nút "Tiếp tục"; lựa chọn bấm được), đủ ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ"; không có ô xem nghĩa đang mở | e2e |
| TC-S10.8-AC1-30 | S10.8-AC1 Mở lại bài đang dở thì thứ tự xáo mới | Chức năng | Lặp 20 lần: ở câu 1 chưa trả lời, ghi vị trí của "Học sinh", thoát bài, mở lại bài mẫu hai câu | Vị trí của "Học sinh" không giống nhau trong cả 20 lần mở lại (thứ tự được xáo mới, không giữ thứ tự lần trước) | e2e |
| TC-S10.8-AC1-5 | S10.8-AC1 Hai câu hỏi về cùng một đoạn văn | Chức năng | Mở bài mẫu hai câu. Câu 1: chọn "Học sinh", bấm "Tiếp tục". Câu 2: chọn "Tiểu Hồng", bấm "Tiếp tục" tới màn tổng kết | Câu 1 hiện "Câu 1 / 2" và đoạn văn "我叫小明。我是学生。", báo "Đúng". Câu 2 hiện "Câu 2 / 2", cùng đoạn văn đó, câu hỏi "Người nói tên là gì?" với "Tiểu Minh", "Tiểu Hồng", "Tiểu Lan", báo "Sai" với giải thích "Đáp án đúng: Tiểu Minh". Màn tổng kết hiện "Sai 1 câu" | e2e |
| TC-S10.8-AC1-6 | S10.8-AC1 Câu đọc hiểu không bị bỏ qua | Chức năng | Mở bài mẫu hai câu, đi qua từng câu tới cuối bài | Cả hai câu đọc hiểu hiện đầy đủ để trả lời; không có nhãn bỏ qua vì dạng bài chưa có, không có nút "Bỏ qua câu này" | e2e |
| TC-S10.8-AC1-7 | S10.8-AC1 Đoạn văn không có pinyin dù công tắc bật | Chức năng | Bật "Hiện pinyin" trong Cài đặt, tới câu đọc hiểu | Đoạn văn không có dòng pinyin nào (không thấy "wǒ", "jiào", "Xiǎo Míng", "xuésheng") | e2e |
| TC-S10.8-AC1-8 | S10.8-AC1 Đoạn văn không có pinyin dù công tắc bật | Biên | Tắt "Hiện pinyin", tới câu đọc hiểu | Không có dòng pinyin nào; đoạn văn hiện đúng "我叫小明。我是学生。" | không |
| TC-S10.8-AC1-14 | S10.8-AC1 Chọn xong thì khóa lựa chọn | Chức năng | Tới câu đọc hiểu, chọn "Giáo viên", rồi bấm "Học sinh", rồi bấm "Bác sĩ" | Kết quả vẫn là "Sai" với giải thích "Đáp án đúng: Học sinh"; "Giáo viên" vẫn có nhãn "Đã chọn", "Học sinh" vẫn có nhãn "Đáp án đúng", "Bác sĩ" không có nhãn; hai lần bấm sau không đổi gì | e2e |
| TC-S10.8-AC1-15 | S10.8-AC1 Chọn xong thì khóa lựa chọn | Biên | Tới câu đọc hiểu, bấm "Học sinh" rồi bấm thật nhanh "Bác sĩ" ngay sau đó | Câu chỉ được chấm một lần, theo lựa chọn bấm trước ("Đúng"); "Bác sĩ" không có nhãn | không |
| TC-S10.8-AC1-16 | S10.8-AC1 Chọn được bằng bàn phím | Chức năng | Tới câu đọc hiểu, chỉ dùng bàn phím: Tab tới "Học sinh" (ở bất kỳ vị trí nào), nhấn Enter | Câu được chấm "Đúng" | e2e |
| TC-S10.8-AC1-17 | S10.8-AC1 Chọn được bằng bàn phím | A11y | Tới câu đọc hiểu, Tab qua cả ba lựa chọn | Từng lựa chọn nhận focus theo thứ tự đang hiện trên màn, focus nhìn thấy rõ ở cả giao diện sáng và tối; mỗi lựa chọn có nhãn đọc được bằng trình đọc màn hình | không |
| TC-S10.8-AC1-9 | S10.8-AC1 Chọn đúng | Chức năng | Tới câu đọc hiểu, chọn "Học sinh" | Hiện ngay "Đúng" và nút "Tiếp tục"; "Học sinh" có nhãn "Đáp án đúng"; không lựa chọn nào có nhãn "Đã chọn"; "Giáo viên" và "Bác sĩ" không có nhãn; không có giải thích | e2e |
| TC-S10.8-AC1-10 | S10.8-AC1 Chọn đúng | Sáng/Tối | Làm lại TC-S10.8-AC1-9 ở giao diện sáng rồi tối | Ở cả hai giao diện "Đúng" và nhãn chữ "Đáp án đúng" trên "Học sinh" đọc rõ trên nền | không |
| TC-S10.8-AC1-11 | S10.8-AC1 Chọn sai thì hiện đáp án đúng và giải thích | Chức năng | Tới câu đọc hiểu, chọn "Giáo viên" | Hiện ngay "Sai" và nút "Tiếp tục"; "Học sinh" có nhãn "Đáp án đúng", "Giáo viên" có nhãn "Đã chọn", "Bác sĩ" không có nhãn; giải thích đúng từng chữ "Đáp án đúng: Học sinh" | e2e |
| TC-S10.8-AC1-12 | S10.8-AC1 Chọn sai thì hiện đáp án đúng và giải thích | Sáng/Tối | Làm lại TC-S10.8-AC1-11 ở giao diện sáng rồi tối | Ở cả hai giao diện, nhãn chữ "Đáp án đúng" và "Đã chọn" đọc rõ trên nền, phân biệt được bằng chữ (không chỉ bằng màu); giải thích đọc rõ | không |
| TC-S10.8-AC1-13 | S10.8-AC1 Chọn sai thì hiện đáp án đúng và giải thích | Mobile 375 | Ở khổ 375×812, làm lại TC-S10.8-AC1-11 | "Sai", hai nhãn "Đáp án đúng" và "Đã chọn", giải thích và nút "Tiếp tục" đọc đủ chữ, không cuộn ngang; nút "Tiếp tục" bấm được | không |
| TC-S10.8-AC1-31 | S10.8-AC1 Chọn sai thì hiện đáp án đúng và giải thích | A11y | Bật trình đọc màn hình (VoiceOver hoặc NVDA). Tới câu đọc hiểu, chọn "Giáo viên", rồi Tab (hoặc vuốt) lần lượt qua ba lựa chọn | Trình đọc màn hình đọc "Học sinh" kèm "Đáp án đúng", "Giáo viên" kèm "Đã chọn", "Bác sĩ" không kèm nhãn nào; kết quả "Sai" được đọc lên | không |
| TC-S10.8-AC2-1 | S10.8-AC2 Chạm một từ thì hiện pinyin và nghĩa | Chức năng | Tới câu đọc hiểu, bấm từ "学生" trong đoạn văn | Ô xem nghĩa hiện "学生", "xuésheng" và đúng chuỗi "học sinh; trẻ đi học"; "学生" được đánh dấu đang chọn | e2e |
| TC-S10.8-AC2-2 | S10.8-AC2 Chạm một từ thì hiện pinyin và nghĩa | Mobile 375 | Ở khổ 375×812, chạm bằng ngón tay vào "学生", rồi vào "叫" | Mỗi từ chạm trúng được (không chạm nhầm từ bên cạnh); ô xem nghĩa nằm trong màn, không cuộn ngang, đọc đủ chữ Hán, pinyin và cả chuỗi nghĩa dài "kêu; gọi; đặt hàng; bảo" | không |
| TC-S10.8-AC2-3 | S10.8-AC2 Chạm một từ thì hiện pinyin và nghĩa | Sáng/Tối | Bấm "学生" ở giao diện sáng, rồi đổi sang tối | Ở cả hai giao diện, ô xem nghĩa và dấu từ đang chọn đọc rõ, phân biệt được với các từ khác | không |
| TC-S10.8-AC2-4 | S10.8-AC2 Từ nhiều nghĩa hiện mọi nghĩa | Chức năng | Tới câu đọc hiểu, bấm "叫" | Ô xem nghĩa hiện "叫", "jiào" và đúng chuỗi "kêu; gọi; đặt hàng; bảo" (cả bốn nghĩa, theo thứ tự đó, nối bằng "; ") | e2e |
| TC-S10.8-AC2-5 | S10.8-AC2 Tên riêng hiện pinyin và nghĩa khai báo trong câu | Chức năng | Tới câu đọc hiểu, bấm "小明" | Ô xem nghĩa hiện "小明", "Xiǎo Míng" và "Tiểu Minh (tên người)"; "小明" được bấm như một từ (không tách thành "小" và "明") | e2e |
| TC-S10.8-AC2-6 | S10.8-AC2 Tắt "Hiện pinyin" vẫn xem được pinyin khi chạm | Chức năng | Tắt "Hiện pinyin" trong Cài đặt, tới câu đọc hiểu, bấm "学生" | Ô xem nghĩa vẫn hiện "xuésheng" | e2e |
| TC-S10.8-AC2-7 | S10.8-AC2 Xem nghĩa bằng bàn phím | Chức năng | Tới câu đọc hiểu, chỉ dùng bàn phím: Tab tới "学生", nhấn Enter | Ô xem nghĩa hiện "学生", "xuésheng" và "học sinh; trẻ đi học"; focus vẫn ở từ "学生" | e2e |
| TC-S10.8-AC2-8 | S10.8-AC2 Xem nghĩa bằng bàn phím | A11y | Tab tới "叫", nhấn Space | Ô xem nghĩa hiện "叫", "jiào", "kêu; gọi; đặt hàng; bảo"; trang không cuộn xuống; focus vẫn ở "叫" và nhìn thấy rõ | không |
| TC-S10.8-AC2-9 | S10.8-AC2 Trình đọc màn hình đọc nội dung ô | Chức năng | Tới câu đọc hiểu, bấm "学生", rồi bấm "叫" | Sau lần bấm 1, vùng thông báo cho trình đọc màn hình chứa "学生", "xuésheng", "học sinh; trẻ đi học"; sau lần bấm 2 chứa "叫", "jiào", "kêu; gọi; đặt hàng; bảo" | e2e |
| TC-S10.8-AC2-10 | S10.8-AC2 Trình đọc màn hình đọc nội dung ô | A11y | Bật trình đọc màn hình (VoiceOver trên macOS/iOS hoặc NVDA trên Windows), Tab tới "学生", Enter; rồi Tab tới "叫", Enter | Mỗi lần, trình đọc màn hình đọc lên chữ Hán, pinyin, nghĩa của từ vừa bấm mà không cần di chuyển tới ô; focus không rời từ vừa bấm | không |
| TC-S10.8-AC2-11 | S10.8-AC2 Dấu câu không bấm được | Chức năng | Tới câu đọc hiểu, từ phần tử ngay trước đoạn văn nhấn Tab liên tiếp qua đoạn văn | Focus lần lượt qua đúng 6 từ 我, 叫, 小明, 我, 是, 学生, không dừng ở dấu "。" nào | e2e |
| TC-S10.8-AC2-12 | S10.8-AC2 Dấu câu không bấm được | Biên | Bấm chuột vào dấu "。" sau "小明"; rồi khi ô đang hiện "学生", bấm vào dấu "。" cuối đoạn | Lần 1: không mở ô xem nghĩa. Lần 2: ô vẫn hiện "学生", không đổi | không |
| TC-S10.8-AC2-13 | S10.8-AC2 Chạm từ khác thì ô đổi sang từ mới | Chức năng | Bấm "学生", rồi bấm "叫" | Ô hiện "jiào" và "kêu; gọi; đặt hàng; bảo", không còn "xuésheng"; chỉ "叫" được đánh dấu đang chọn, "学生" không còn đánh dấu | e2e |
| TC-S10.8-AC2-14 | S10.8-AC2 Chạm lần xuất hiện khác của cùng chữ thì dấu chọn chuyển theo | Chức năng | Bấm "我" đầu đoạn (vị trí 1), rồi bấm "我" sau dấu "。" đầu tiên (vị trí 4) | Ô xem nghĩa vẫn mở, hiện "我", "wǒ" và "tôi; mình; của tôi"; chỉ "我" ở vị trí 4 được đánh dấu đang chọn, "我" ở vị trí 1 không còn đánh dấu | e2e |
| TC-S10.8-AC2-15 | S10.8-AC2 Chạm lần xuất hiện khác của cùng chữ thì dấu chọn chuyển theo | Biên | Tiếp TC-S10.8-AC2-14: bấm lại "我" ở vị trí 4 | Ô đóng, không từ nào được đánh dấu (bấm lại đúng từ đang chọn) | không |
| TC-S10.8-AC2-16 | S10.8-AC2 Chạm lại từ đang chọn thì đóng ô | Chức năng | Bấm "学生", rồi bấm lại "学生" | Ô xem nghĩa đóng; không từ nào được đánh dấu | e2e |
| TC-S10.8-AC2-17 | S10.8-AC2 Đóng ô bằng nút Đóng hoặc Escape | Chức năng | Bấm "学生", bấm "Đóng". Lần khác: Tab tới "学生", Enter, rồi nhấn Escape | Cả hai lần: ô xem nghĩa đóng, focus nằm ở từ "学生" | e2e |
| TC-S10.8-AC2-18 | S10.8-AC2 Đóng ô bằng nút Đóng hoặc Escape | A11y | Mở ô cho "学生" bằng bàn phím, Tab tới nút "Đóng", nhấn Enter | Nút "Đóng" nhận focus, focus nhìn thấy, có nhãn "Đóng" đọc được; Enter đóng ô và focus về "学生" | không |
| TC-S10.8-AC2-19 | S10.8-AC2 Sang câu kế thì ô đóng | Chức năng | Mở bài mẫu hai câu. Ở câu 1 chọn "Học sinh", bấm "学生" để mở ô, bấm "Tiếp tục" | Câu 2 hiện ra không có ô xem nghĩa, không từ nào được đánh dấu | e2e |
| TC-S10.8-AC2-20 | S10.8-AC2 Giảm chuyển động thì ô không có hiệu ứng | A11y | Giả lập (hoặc bật trên thiết bị) giảm chuyển động, tới câu đọc hiểu, bấm "学生", rồi bấm "Đóng" | Ô hiện đầy đủ ngay khi bấm và biến mất ngay khi đóng, không trượt, mờ dần hay phóng to (chi tiết phần e2e kiểm: xem Ghi chú) | e2e |
| TC-S10.8-AC2-21 | S10.8-AC2 Xem nghĩa không đổi kết quả | Chức năng | Tới câu đọc hiểu, chọn "Giáo viên", rồi bấm "学生", rồi bấm "Học sinh" | Ô xem nghĩa hiện "学生", "xuésheng", "học sinh; trẻ đi học"; màn vẫn hiện "Sai", giải thích "Đáp án đúng: Học sinh"; lựa chọn vẫn bị khóa, bấm "Học sinh" không đổi kết quả, nhãn "Đáp án đúng"/"Đã chọn" giữ nguyên | e2e |
| TC-S10.8-AC2-22 | S10.8-AC2 Chạm từ trước khi trả lời không chấm câu | Chức năng | Tới câu đọc hiểu, chưa chọn lựa chọn nào, bấm "学生", rồi bấm "叫", rồi bấm "Đóng" | Không lúc nào hiện "Đúng", "Sai", nhãn "Đáp án đúng"/"Đã chọn" hay nút "Tiếp tục"; vẫn chọn được lựa chọn sau đó và câu được chấm bình thường | e2e |
| TC-S10.8-AC2-23 | S10.8-AC2 Chạm từ trước khi trả lời không chấm câu | Biên | Mở bài kiểm tra mẫu, tới câu đọc hiểu, bấm "学生" trước khi trả lời, rồi chọn "Học sinh", rồi bấm "我" | Ô xem nghĩa mở được cả trước và sau khi trả lời; câu chỉ được chấm khi chọn lựa chọn, kết quả "Đúng" không đổi sau khi xem nghĩa | không |
| TC-S10.8-AC2-24 | S10.8-AC2 Chữ nhiều cách đọc chỉ hiện mục được chỉ định | Chức năng | Mở bài mẫu 地, tới câu hỏi 3 (đoạn văn "他高兴地说。", câu hỏi "Anh ấy nói như thế nào?"), bấm từ "地" | Ô xem nghĩa hiện "地", "de" và đúng chuỗi "trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa đứng trước"; ô không có "dì" và không có "đất; mặt đất; ruộng; vùng" | e2e |
| TC-S10.8-AC2-30 | S10.8-AC2 Chữ nhiều cách đọc chỉ hiện mục được chỉ định | Biên | Ở câu hỏi 3, Tab qua đoạn văn "他高兴地说。"; rồi chọn "Vui vẻ" và bấm lại "地" | Focus qua đúng 4 từ 他, 高兴, 地, 说, không dừng ở "。"; sau khi chấm "Đúng", ô của "地" vẫn chỉ hiện mục "de", không có "dì" | không |
| TC-S10.8-AC2-25 | S10.8-AC2 Từ trong đoạn thiếu dữ liệu thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có từ "小红" trong đoạn, "小红" không có trong danh sách từ và câu không khai báo pinyin, nghĩa cho nó | Báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC2-26 | S10.8-AC2 Từ trong đoạn thiếu dữ liệu thì bị báo lỗi | Biên | Đối chứng: chạy kiểm tra nội dung trên câu có "小明" khai báo pinyin + nghĩa trong câu (như nội dung mẫu) | Không báo lỗi về từ "小明" | không |
| TC-S10.8-AC2-28 | S10.8-AC2 Từ có trong danh sách mà khai báo riêng thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có từ "学生" trong đoạn và khai báo riêng pinyin "xuéshēng", nghĩa "sinh viên" cho từ đó trong câu | Báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC2-27 | S10.8-AC2 Chữ nhiều cách đọc không chỉ định mục thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có "地" trong đoạn mà không chỉ định mục "de" hay "dì" | Báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC2-29 | S10.8-AC2 Chỉ định mục không có trong danh sách thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có "地" chỉ định mục đọc "da"; đối chứng: cùng câu chỉ định "de" (như đoạn B), rồi chỉ định "dì" | "da": báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra. "de" và "dì": không báo lỗi về "地" | không |
| TC-S10.8-AC1-18 | S10.8-AC1 Đoạn văn không có từ thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có đoạn văn để trống; lần khác: đoạn chỉ gồm dấu "。" | Cả hai lần: báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC1-19 | S10.8-AC1 Câu hỏi không có đúng một đáp án thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có hai lựa chọn được đánh dấu đúng; lần khác: không lựa chọn nào đúng | Cả hai lần: báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC1-20 | S10.8-AC1 Số lựa chọn ngoài 2 đến 4 thì bị báo lỗi | Biên | Chạy kiểm tra nội dung trên câu đọc hiểu có 1 lựa chọn; lần khác 5 lựa chọn; đối chứng với 2 và 4 lựa chọn | 1 và 5 lựa chọn: báo lỗi, nêu rõ bài và câu sai. 2 và 4 lựa chọn: không báo lỗi về số lựa chọn | không |
| TC-S10.8-AC1-21 | S10.8-AC1 Lựa chọn trùng nhau thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có hai lựa chọn "Học sinh" và " học sinh" (khác hoa thường, có khoảng trắng đầu) | Báo lỗi, nêu rõ bài và câu sai | không |
| TC-S10.8-AC1-22 | S10.8-AC1 Câu hỏi để trống thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu đọc hiểu có câu hỏi để trống; lần khác: câu hỏi chỉ có khoảng trắng | Cả hai lần: báo lỗi, nêu rõ bài và câu sai; nội dung không được ghi ra | không |
| TC-S10.8-AC1-23 | S10.8-AC1 Học xong bài chỉ có câu đọc hiểu không tạo thẻ | Chức năng | Cần S9.1. Trình duyệt sạch (chưa có thẻ nào). Mở bài mẫu hai câu, trả lời cả hai câu, tới màn tổng kết | Sau bài, danh sách thẻ ôn tập không có thẻ nào (e2e đọc thẻ từ phía test) | e2e |
| TC-S10.8-AC1-24 | S10.8-AC1 Học xong bài chỉ có câu đọc hiểu không tạo thẻ | Chức năng | Cần S9.1 và S9.5. Làm như TC-S10.8-AC1-23 khi chạy tay, rồi từ Trang chủ mở "Thống kê ôn tập" | Màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." (không có thẻ nào). Bản build chưa có S9.5: ghi "không chạy được: thiếu S9.5", đọc kết quả TC-S10.8-AC1-23 | không |
| TC-S10.8-AC1-25 | S10.8-AC1 Sai câu đọc hiểu trong bài kiểm tra | Chức năng | Cần S9.1, S9.4. Nạp sẵn thẻ của "学生" (mọi chiều mà S9.1 tạo cho từ đó) ở trạng thái đã chấm, còn 10 ngày nữa mới tới hạn, hôm nay chưa ôn thẻ nào; nạp sẵn tiến độ mở bài kiểm tra mẫu (không học bài thường nào, nên không có thẻ khác); cố định đồng hồ. Đọc thẻ: ghi số thẻ và thời điểm ôn tiếp theo của từng thẻ "学生". Làm bài kiểm tra mẫu: chọn "Giáo viên" ở câu đọc hiểu, đúng mọi câu còn lại, tới màn tổng kết; đọc lại thẻ | Màn tổng kết hiện "Sai 1 câu". Sau bài: số thẻ ôn tập không đổi; mỗi thẻ "学生" vẫn chưa tới hạn, thời điểm ôn tiếp theo giống hệt trước bài | e2e |
| TC-S10.8-AC1-26 | S10.8-AC1 Sai câu đọc hiểu trong bài kiểm tra | Chức năng | Cần S9.1, S9.4, S9.5. Chạy tay: học xong bài có từ 学生 (tạo thẻ "学生" và các thẻ khác của bài); mở màn ôn tập, chấm "Dễ" mọi thẻ trong phiên để chúng đã chấm và chưa tới hạn (hạn từ 1 ngày trở lên); về Trang chủ, mở "Thống kê ôn tập", ghi tổng số thẻ, các nhóm và bảng dự báo. Mở bài kiểm tra mẫu (cách mở khóa theo PR code): chọn "Giáo viên" ở câu đọc hiểu, đúng mọi câu còn lại. Mở lại "Thống kê ôn tập"; bấm "Ôn tập" | Màn tổng kết hiện "Sai 1 câu". "Thống kê ôn tập" giống hệt trước bài (tổng số thẻ, các nhóm, bảng dự báo); màn ôn tập không có thẻ "学生" nào (không bị đưa về cần ôn). Bản build chưa có S9.5: chỉ kiểm màn tổng kết và màn ôn tập, phần còn lại đọc TC-S10.8-AC1-25 | không |

## Ghi chú: phần kiểm bằng test tự động không phải e2e, hoặc e2e cần nói rõ

- **Kiểm tra nội dung** (TC-S10.8-AC2-25 đến AC2-29, TC-S10.8-AC1-18 đến AC1-22): dev kiểm bằng Vitest ở tầng schema nội dung và pipeline
  kiểm tra nội dung trong PR code, tên test mang ID Scenario; mỗi dòng trong bảng của bốn Requirement "Kiểm tra nội dung chặn từ sai nguồn dữ
  liệu", "Kiểm tra nội dung chặn chữ nhiều cách đọc chỉ định sai mục", "Kiểm tra nội dung chặn đoạn văn không có từ" và "Kiểm tra nội dung
  chặn câu hỏi không hợp lệ" có ít nhất một ca lỗi. QA đối chiếu các test này pass trên CI và thông báo lỗi có tên bài và vị trí câu.
- **Thứ tự lựa chọn không cố định** (TC-S10.8-AC1-4): không đưa vào e2e vì kết quả ngẫu nhiên; phần e2e của việc xáo mới khi mở lại là
  TC-S10.8-AC1-30 (20 lần, như S10.2). Dev kiểm thêm bằng Vitest ở tầng quy tắc xáo lựa chọn (nguồn ngẫu nhiên điều khiển được: hai giá trị
  ngẫu nhiên khác nhau cho hai thứ tự khác nhau, mọi thứ tự vẫn đủ đúng các lựa chọn). Chạy tay 10 lần: xác suất "Học sinh" trùng vị trí cả
  10 lần khi xáo đúng là khoảng 1/20 000, nên trùng cả 10 lần coi là Fail.
- **Thứ tự giữ nguyên khi chạm từ và chấm** (TC-S10.8-AC1-27): e2e ghi thứ tự chữ của ba lựa chọn ngay khi câu hiện và so sau từng thao tác;
  kết quả không phụ thuộc lần xáo nên không lỗi ngẫu nhiên.
- **Giảm chuyển động** (TC-S10.8-AC2-20): e2e giả lập giảm chuyển động của trình duyệt, bấm "学生" rồi kiểm ô đã hiện đầy đủ (không còn hiệu
  ứng chuyển động nào đang chạy trên ô) ngay trong khung hình đầu tiên sau khi bấm; tương tự khi bấm "Đóng" thì ô biến mất ngay. QA chạy tay
  thêm một lần trên máy có bật giảm chuyển động để nhìn bằng mắt.
- **Trình đọc màn hình** (TC-S10.8-AC2-9): e2e kiểm nội dung của vùng thông báo cho trình đọc màn hình; việc trình đọc màn hình thật đọc lên
  được kiểm tay ở TC-S10.8-AC2-10. Nhãn "Đáp án đúng"/"Đã chọn" (TC-S10.8-AC1-9, AC1-11) e2e tìm theo tên đọc được của từng lựa chọn, nên
  phần đọc được bằng trình đọc màn hình đã được kiểm; TC-S10.8-AC1-31 kiểm thêm bằng trình đọc màn hình thật.
- **Thẻ ôn tập** (TC-S10.8-AC1-23, AC1-25): e2e đọc và nạp sẵn thẻ từ phía test, theo quy ước của S9.1/S9.4. Thẻ "学生" chưa tới hạn ở
  AC1-25 được nạp sẵn (không dựng bằng học bài, để không có thẻ "mới" khác lẫn vào); AC1-26 dựng bằng thao tác thật như S9.4. Chỉ viết được
  khi code S9.1/S9.4 đã có; chưa có thì các case thẻ ghi "không chạy được: thiếu S9.1/S9.4".
