# Test cases: S10.6 Hội thoại

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/dialogue/spec.md`.

## Điều kiện đầu

- **Bản build kiểm thử** (theo mục "Dữ liệu nghiệm thu" của `proposal.md`): nội dung phát hành không có câu hội thoại nào, nên mọi case trên
  màn bài chạy trên bản build dành cho kiểm thử tự động (bản build thật, không phải bản dev), có các bài mẫu dưới đây. Cách vào từng bài mẫu
  trên bản build kiểm thử do dev ghi trong `design.md`; không dùng file sao lưu để mở bài.
- Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, có mạng, tiến độ trống, Cài đặt để mặc định (tốc độ audio
  "Bình thường (1x)", "Hiện pinyin" bật), giảm chuyển động của thiết bị tắt, giao diện sáng, trừ khi case nêu khác.
- **Hội thoại 3 lời** (như spec): lời 1 vai A "你好！" (nǐ hǎo!, "Xin chào!"); lời 2 vai B "你好！你叫什么名字？" (nǐ hǎo! nǐ jiào shénme
  míngzi?, "Chào bạn! Bạn tên là gì?"); lời 3 vai A "我叫王明。" (wǒ jiào Wáng Míng., "Tôi tên là Vương Minh."). Câu của lời 1 và lời 3
  (vai A) khai giọng nữ, câu của lời 2 (vai B) khai giọng nam; ba lời là ba câu riêng.
- **Bài mẫu** (chỉ có trong bản build kiểm thử; mọi bài là bài học thường, có ít nhất một câu chấm điểm; e2e và chạy tay dùng chung):
  - **Bài H**: câu 1 là câu có hội thoại 3 lời, câu 2 là câu chấm điểm (dev ghi đáp án đúng).
  - **Bài H2**: câu 1 và câu 2 là hai câu có hội thoại 3 lời liền nhau, câu 3 là câu chấm điểm.
  - **Bài H3**: đúng 3 câu: câu 1 có hội thoại 3 lời, câu 2 và câu 3 là câu chấm điểm (dev ghi đáp án đúng của hai câu).
  - **Bài HD**: đúng 3 câu: câu 1 là câu nghe (có công tắc "Nghe chậm"), câu 2 có hội thoại 3 lời, câu 3 là câu chấm điểm.
  - **Bài HL**: câu hội thoại đủ dài để ở khổ 375×812 lời cuối nằm ngoài khung nhìn khi câu vừa hiện, kèm một câu chấm điểm.
  - Giọng trong mọi bài mẫu: câu của lời vai A khai giọng nữ, câu của lời vai B khai giọng nam. Chữ Hán nào do cả hai vai nói thì soạn
    thành hai câu riêng (một câu giọng nữ cho vai A, một câu giọng nam cho vai B), không có câu nào được cả hai vai dùng. Nhờ vậy bài mẫu
    qua được kiểm tra nội dung theo luật giọng của S10.6.
  - Các bài mẫu nằm trong một chủ đề mẫu có khối "Tải audio (<dung lượng>)" để chạy case offline.
- **"Đang nghe cả bài ở lời N"** = đã bấm "Nghe cả bài" và lời N đang có chữ "Đang phát".
- **Kiểm audio khi chạy tay:** QA nghe bằng tai, có thể dùng công cụ dev của trình duyệt (tab mạng/media) để xem lời nào đang phát và tốc độ
  phát. **Audio lời 2 không phát được khi chạy tay:** chặn yêu cầu tải đúng file audio của lời 2 bằng công cụ dev của trình duyệt (dev ghi
  tên file trong `design.md`); e2e tự giả lập lỗi.
- **Trình đọc màn hình:** VoiceOver (macOS/iOS) hoặc NVDA (Windows), một trong hai là đủ.
- **Kiểm tra nội dung:** dành cho người soạn nội dung, không có giao diện cho người học. QA chạy lệnh kiểm tra nội dung của dự án (và lệnh
  dựng nội dung cho TC-S10.6-AC1-40) trên một **bản sao nội dung** đã sửa theo case; nội dung lỗi mẫu không nằm trong nội dung phát hành.
  Các case này để `không` vì được kiểm bằng test của kiểm tra nội dung trong PR code, và CI chạy kiểm tra nội dung trên mọi PR.
- **Cột Tự động:** `e2e` = Playwright trên bản build kiểm thử; `không` = QA chạy tay mỗi lần nghiệm thu.

## Case

### Câu hội thoại hiện đủ các lời theo thứ tự

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-1 | S10.6-AC1 Câu hội thoại hiện các lời theo thứ tự | Chức năng | Mở Bài H, tới câu hội thoại 3 lời | Hiện 3 lời theo thứ tự "你好！", "你好！你叫什么名字？", "我叫王明。"; lời 1 và lời 3 có nhãn "Vai A", lời 2 có nhãn "Vai B"; mỗi lời có một nút "Nghe" riêng; phía trên các lời có nút "Nghe cả bài" và ba công tắc "Nghe chậm", "Pinyin", "Bản dịch"; cuối màn có "Tiếp tục" | e2e |
| TC-S10.6-AC1-2 | S10.6-AC1 Câu hội thoại hiện các lời theo thứ tự | A11y | Bật trình đọc màn hình, ở câu hội thoại 3 lời, di chuyển tới nút "Nghe" của từng lời | Ba nút lần lượt được đọc là "Nghe lời 1", "Nghe lời 2", "Nghe lời 3" | không |
| TC-S10.6-AC1-3 | S10.6-AC1 Câu hội thoại hiện các lời theo thứ tự | Mobile 375 | Khổ 375×812, mở câu hội thoại 3 lời | Hàng điều khiển ("Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch"), nhãn vai, chữ Hán, pinyin và nút "Nghe" của mỗi lời không bị cắt, không chồng lên nhau, không phải cuộn ngang | không |
| TC-S10.6-AC1-4 | S10.6-AC1 Câu hội thoại hiện các lời theo thứ tự | Sáng/Tối | Ở câu hội thoại 3 lời, xem lần lượt ở giao diện sáng và tối | Ở cả hai giao diện, nhãn "Vai A"/"Vai B", chữ Hán, pinyin, nút "Nghe", "Nghe cả bài", ba công tắc và "Tiếp tục" đều đọc rõ, không mất chữ vào nền | không |

### Câu hội thoại không tự phát

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-5 | S10.6-AC1 Câu hội thoại vừa hiện thì chưa phát | Chức năng | Mở Bài H, tới câu hội thoại 3 lời, không bấm gì, chờ 5 giây | Không có audio nào phát; không lời nào có chữ "Đang phát"; nút vẫn là "Nghe cả bài" | e2e |

### Nghe cả bài hoặc từng câu

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-6 | S10.6-AC1 Nghe cả bài phát lần lượt mọi lời | Chức năng | Ở câu hội thoại 3 lời, bấm "Nghe cả bài", chờ tới khi hết | Lời 1, lời 2, lời 3 phát lần lượt, mỗi lời một lần; trong lúc phát nút là "Dừng"; khi lời 2 phát chỉ lời 2 có chữ "Đang phát"; sau lời 3 không còn audio, không lời nào có "Đang phát", nút hiện lại "Nghe cả bài" | e2e |
| TC-S10.6-AC1-7 | S10.6-AC1 Nghe cả bài phát lần lượt mọi lời | Sáng/Tối | Ở giao diện sáng rồi tối, bấm "Nghe cả bài", nhìn lời đang phát | Ở cả hai giao diện, chữ "Đang phát" đọc rõ, nhìn ra ngay lời nào đang phát | không |
| TC-S10.6-AC1-8 | S10.6-AC1 Dừng khi đang nghe cả bài | Chức năng | Bấm "Nghe cả bài"; khi đang nghe cả bài ở lời 2, bấm "Dừng"; chờ 5 giây | Audio dừng ngay; lời 3 không phát; nút hiện lại "Nghe cả bài" | e2e |
| TC-S10.6-AC1-9 | S10.6-AC1 Nghe cả bài lần nữa thì phát lại từ đầu | Chức năng | Làm như TC-S10.6-AC1-8 (dừng ở lời 2), rồi bấm "Nghe cả bài" | Audio phát lại từ lời 1 (lời 1 có chữ "Đang phát"), rồi lời 2, lời 3 | e2e |
| TC-S10.6-AC1-10 | S10.6-AC1 Nghe từng câu | Chức năng | Ở câu hội thoại 3 lời, bấm "Nghe" của lời 2, chờ 5 giây sau khi phát xong | Chỉ audio lời 2 phát, một lần từ đầu; lời 2 có chữ "Đang phát" trong lúc phát; lời 3 không tự phát sau đó; nút vẫn là "Nghe cả bài" | e2e |
| TC-S10.6-AC1-11 | S10.6-AC1 Nghe từng câu | Biên | Bấm "Nghe" của lời 2; khi lời 2 đang phát, bấm lại "Nghe" của lời 2 | Lời 2 phát lại từ đầu, chỉ một luồng âm, không nghe hai lớp tiếng chồng nhau | không |
| TC-S10.6-AC1-12 | S10.6-AC1 Nghe một câu nhiều lần | Chức năng | Bấm "Nghe" của lời 3, chờ phát xong; lặp lại tổng cộng năm lần | Audio lời 3 phát đủ năm lần, lần nào cũng phát trọn | e2e |
| TC-S10.6-AC1-13 | S10.6-AC1 Bấm nghe một câu khi đang nghe cả bài | Chức năng | Bấm "Nghe cả bài"; khi đang nghe cả bài ở lời 1, bấm "Nghe" của lời 3; chờ 5 giây sau khi lời 3 xong | Lời 1 dừng, lời 3 phát từ đầu, không lúc nào có hai luồng âm cùng lúc; lời 3 có "Đang phát"; nút hiện lại "Nghe cả bài"; sau lời 3 không lời nào phát tiếp | e2e |

### Hội thoại có công tắc Nghe chậm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-14 | S10.6-AC1 Bật Nghe chậm ở câu hội thoại thì phát 0.75x | Chức năng | Mở Bài H, tới câu hội thoại 3 lời; bật công tắc "Nghe chậm" trên câu; bấm "Nghe cả bài", chờ hết | Công tắc "Nghe chậm" có dấu tick; lời 1, lời 2, lời 3 đều phát ở tốc độ 0.75x | e2e |
| TC-S10.6-AC1-15 | S10.6-AC1 Nghe chậm áp dụng cho nút Nghe của một lời | Chức năng | Ở câu hội thoại 3 lời, bật "Nghe chậm", bấm "Nghe" của lời 2 | Audio của lời 2 phát ở tốc độ 0.75x | e2e |
| TC-S10.6-AC1-16 | S10.6-AC1 Nghe chậm áp dụng cho nút Nghe của một lời | Biên | Ở câu hội thoại 3 lời, bật "Nghe chậm", bấm "Nghe" của lời 2, chờ xong; tắt "Nghe chậm", bấm "Nghe" của lời 2 lần nữa | Lần đầu lời 2 phát 0.75x (chậm hơn rõ), lần sau phát tốc độ 1x; công tắc có dấu tick khi bật, không có khi tắt | không |
| TC-S10.6-AC1-17 | S10.6-AC1 Nghe chậm bật ở câu trước giữ sang câu hội thoại | Chức năng | Cài đặt để tốc độ "Bình thường (1x)". Mở Bài HD; ở câu 1 (câu nghe) bật "Nghe chậm", làm xong câu 1, bấm "Tiếp tục" tới câu hội thoại (câu 2); bấm "Nghe cả bài" | Công tắc "Nghe chậm" của câu hội thoại có dấu tick ngay khi câu hiện ra; mọi lời phát ở tốc độ 0.75x | e2e |

### Lời đang phát được cuộn vào khung nhìn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-18 | S10.6-AC1 Lời đang phát được cuộn vào khung nhìn | Mobile 375 | Khổ 375×812, mở Bài HL, không cuộn tay; bấm "Nghe cả bài", chờ tới lời cuối | Khi lời cuối đang phát (có chữ "Đang phát"), lời cuối nằm trong khung nhìn | e2e |
| TC-S10.6-AC1-19 | S10.6-AC1 Giảm chuyển động thì cuộn không có hiệu ứng | A11y | Bật giảm chuyển động của thiết bị; khổ 375×812, mở Bài HL; bấm "Nghe cả bài", chờ tới lời cuối | Màn nhảy tới lời cuối ngay, không có hiệu ứng trượt; lời cuối nằm trong khung nhìn khi đang phát. Tắt giảm chuyển động sau case | không |

### Sang câu khác hoặc rời bài thì dừng audio hội thoại

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-20 | S10.6-AC1 Bấm Tiếp tục khi đang nghe cả bài | Chức năng | Mở Bài H; bấm "Nghe cả bài"; khi đang nghe cả bài ở lời 1, bấm "Tiếp tục"; chờ 5 giây | Audio dừng; lời 2, lời 3 không phát; câu kế (câu 2) hiện ra | e2e |
| TC-S10.6-AC1-21 | S10.6-AC1 Rời màn bài khi đang nghe cả bài | Chức năng | Mở Bài H; bấm "Nghe cả bài"; khi đang nghe cả bài ở lời 1, rời màn bài về Lộ trình; chờ 5 giây | Màn Lộ trình hiện ra; audio dừng ngay, lời 2 và lời 3 không phát | e2e |

### Audio hội thoại không phát được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-22 | S10.6-AC1 Một lời không phát được khi nghe cả bài | Chức năng | Làm audio lời 2 không phát được (xem Điều kiện đầu); bấm "Nghe cả bài" | Lời 1 phát; tới lời 2 màn hiện "Không phát được audio."; lời 3 không phát; nút hiện lại "Nghe cả bài"; bấm "Nghe" của lời 1 thì lời 1 phát; bấm "Tiếp tục" thì sang câu kế | e2e |
| TC-S10.6-AC1-23 | S10.6-AC1 Một lời không phát được khi nghe cả bài | A11y | Bật trình đọc màn hình, làm như TC-S10.6-AC1-22 | Trình đọc màn hình tự đọc "Không phát được audio." mà không cần di chuyển tới thông báo; sau đó vẫn bật/tắt được "Nghe chậm", "Pinyin", "Bản dịch" | không |
| TC-S10.6-AC1-24 | S10.6-AC1 Sang câu kế thì thông báo lỗi không còn | Chức năng | Làm audio lời 2 không phát được; ở câu hội thoại của Bài H bấm "Nghe cả bài", chờ hiện "Không phát được audio."; bấm "Tiếp tục" | Câu 2 của Bài H hiện ra; thông báo "Không phát được audio." không còn trên màn | e2e |
| TC-S10.6-AC1-25 | S10.6-AC1 Một lời không phát được khi nghe cả bài | Offline | Chủ đề mẫu chưa tải audio; mở Bài H tới câu hội thoại, tắt mạng; bấm "Nghe cả bài" | Hiện "Không phát được audio."; nút hiện lại "Nghe cả bài"; vẫn đọc được 3 lời, bật/tắt được "Pinyin" và "Bản dịch", bấm được "Tiếp tục" | không |
| TC-S10.6-AC1-26 | S10.6-AC1 Bấm Nghe một lời không phát được | Chức năng | Làm audio lời 2 không phát được; ở câu hội thoại 3 lời bấm "Nghe" của lời 2 | Màn hiện "Không phát được audio."; không lời nào có chữ "Đang phát"; nút "Nghe cả bài" vẫn bấm được | e2e |
| TC-S10.6-AC1-27 | S10.6-AC1 Thông báo lỗi mất khi lần phát sau phát được | Chức năng | Làm audio lời 2 không phát được; bấm "Nghe" của lời 2, chờ hiện "Không phát được audio."; bấm "Nghe" của lời 1 | Lời 1 phát; thông báo "Không phát được audio." không còn trên màn | e2e |
| TC-S10.6-AC1-28 | S10.6-AC1 Offline đã tải audio của chủ đề thì nghe được hội thoại | Offline | Ở màn Lộ trình bấm "Tải audio (<dung lượng>)" của chủ đề mẫu, chờ hiện "Đã tải audio"; tắt mạng; mở Bài H, tới câu hội thoại, bấm "Nghe cả bài" | Cả 3 lời phát lần lượt, không có thông báo "Không phát được audio." | e2e |

### Bật/tắt pinyin và bản dịch tiếng Việt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC2-1 | S10.6-AC2 Mặc định hiện pinyin, ẩn bản dịch | Chức năng | Mở Bài H, tới câu hội thoại 3 lời | Lời 2 hiện "你好！你叫什么名字？" và "nǐ hǎo! nǐ jiào shénme míngzi?"; không lời nào hiện bản dịch (lời 2 không có "Chào bạn! Bạn tên là gì?"); "Pinyin" có dấu tick, "Bản dịch" không có dấu tick | e2e |
| TC-S10.6-AC2-2 | S10.6-AC2 Bật bản dịch thì mọi lời hiện bản dịch | Chức năng | Ở câu hội thoại 3 lời, bật "Bản dịch" | Lời 1 hiện "Xin chào!", lời 2 hiện "Chào bạn! Bạn tên là gì?", lời 3 hiện "Tôi tên là Vương Minh."; "Bản dịch" có dấu tick | e2e |
| TC-S10.6-AC2-3 | S10.6-AC2 Bật bản dịch thì mọi lời hiện bản dịch | Mobile 375 | Khổ 375×812, bật "Bản dịch" | Bản dịch của từng lời xuống dòng gọn, không bị cắt, không chồng lên nút "Nghe", không phải cuộn ngang | không |
| TC-S10.6-AC2-4 | S10.6-AC2 Tắt bản dịch thì bản dịch biến mất | Chức năng | Bật "Bản dịch" rồi tắt | Không lời nào hiện bản dịch; "Bản dịch" không có dấu tick | e2e |
| TC-S10.6-AC2-5 | S10.6-AC2 Tắt pinyin thì mọi lời không hiện pinyin | Chức năng | Ở câu hội thoại 3 lời, tắt "Pinyin" | Không lời nào hiện pinyin; lời 3 vẫn hiện "我叫王明。"; "Pinyin" không có dấu tick | e2e |
| TC-S10.6-AC2-6 | S10.6-AC2 Bật lại pinyin | Chức năng | Tắt "Pinyin" rồi bật lại | Lời 3 hiện "wǒ jiào Wáng Míng."; "Pinyin" có dấu tick | e2e |
| TC-S10.6-AC2-7 | S10.6-AC2 Bật tắt khi đang nghe cả bài không làm dừng audio | Chức năng | Bấm "Nghe cả bài"; khi đang nghe cả bài ở lời 1, bật "Bản dịch"; chờ hết | Bản dịch hiện ở cả 3 lời; audio vẫn phát tiếp lời 2 rồi lời 3; nút vẫn là "Dừng" tới khi hết | e2e |
| TC-S10.6-AC2-8 | S10.6-AC2 Lựa chọn giữ cho câu hội thoại kế trong cùng bài | Chức năng | Mở Bài H2; ở câu hội thoại thứ nhất tắt "Pinyin", bật "Bản dịch", bấm "Tiếp tục" | Câu hội thoại thứ hai không hiện pinyin, có hiện bản dịch; "Pinyin" không có dấu tick, "Bản dịch" có dấu tick | e2e |
| TC-S10.6-AC2-9 | S10.6-AC2 Mở lại bài thì về mặc định | Chức năng | Mở Bài H; ở câu hội thoại tắt "Pinyin", bật "Bản dịch"; rời màn bài; mở lại Bài H | Câu hội thoại hiện pinyin, không hiện bản dịch; "Pinyin" có dấu tick, "Bản dịch" không có | e2e |

### Công tắc của hội thoại độc lập với Cài đặt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC2-10 | S10.6-AC2 Công tắc của hội thoại không đổi Cài đặt | Chức năng | Cài đặt: "Hiện pinyin" đang bật. Mở Bài H, ở câu hội thoại tắt "Pinyin"; rời bài, mở màn Cài đặt | Công tắc "Hiện pinyin" trong Cài đặt vẫn bật | e2e |
| TC-S10.6-AC2-11 | S10.6-AC2 Cài đặt tắt pinyin không đổi mặc định của hội thoại | Chức năng | Trong Cài đặt tắt "Hiện pinyin"; mở Bài H tới câu hội thoại 3 lời | "Pinyin" của câu hội thoại có dấu tick; cả 3 lời hiện pinyin | e2e |

### Câu hội thoại là câu không chấm điểm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-29 | S10.6-AC1 Câu hội thoại có Tiếp tục ngay, không có Đúng Sai | Chức năng | Mở Bài H, tới câu hội thoại, không bấm gì | Có nút "Tiếp tục" bấm được ngay; màn không hiện "Đúng", "Sai" hay giải thích; bấm "Tiếp tục" thì câu 2 hiện ra | e2e |
| TC-S10.6-AC1-30 | S10.6-AC1 Câu hội thoại không tính vào điểm | Chức năng | Mở Bài H3; ở câu hội thoại bấm "Tiếp tục" mà không nghe; trả lời đúng câu 2, trả lời sai câu 3; tới màn tổng kết | Màn tổng kết hiện "50%", "Đúng 1 / 2 câu" và "Sai 1 câu"; màn báo đã làm xong các câu của bài, không báo có câu bị bỏ qua | e2e |
| TC-S10.6-AC1-31 | S10.6-AC1 Thoát ở câu hội thoại rồi mở lại bài | Chức năng | Mở Bài HD, làm xong câu 1 và bấm "Tiếp tục" tới câu hội thoại (câu 2); rời màn bài; mở lại Bài HD | Bài mở ở câu hội thoại, không về câu 1; thanh tiến độ hiện "Câu 2 / 3" | e2e |

### Kiểm tra nội dung chặn câu hội thoại sai chỗ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-32 | S10.6-AC1 Bài kiểm tra có câu hội thoại thì báo lỗi | Chức năng | Trên bản sao nội dung, thêm một câu hội thoại dùng hội thoại 3 lời (hợp lệ) vào một bài kiểm tra cuối chủ đề; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài kiểm tra đó | không |
| TC-S10.6-AC1-33 | S10.6-AC1 Bài chỉ gồm câu hội thoại thì báo lỗi | Chức năng | Trên bản sao nội dung, tạo một bài học thường chỉ gồm 2 câu hội thoại dùng hội thoại 3 lời (hợp lệ), không có câu chấm điểm; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài đó | không |
| TC-S10.6-AC1-34 | S10.6-AC1 Bài có câu hội thoại và câu chấm điểm thì qua | Chức năng | Trên bản sao nội dung, tạo một bài học thường gồm 1 câu hội thoại dùng hội thoại 3 lời và 1 câu chọn thanh điệu (dữ liệu đầy đủ); chạy kiểm tra nội dung | Không có lỗi nào nêu bài đó | không |

### Kiểm tra nội dung chặn hội thoại không hợp lệ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-35 | S10.6-AC1 Câu hội thoại trỏ tới hội thoại không có thì báo lỗi | Chức năng | Trên bản sao nội dung, cho câu hội thoại của một bài (có thêm câu chấm điểm) trỏ tới một hội thoại không có trong nội dung; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó | không |
| TC-S10.6-AC1-36 | S10.6-AC1 Hội thoại ít hơn 2 lời thì báo lỗi | Chức năng | Trên bản sao nội dung, cho câu hội thoại dùng một hội thoại chỉ có lời 1; chạy kiểm tra nội dung. Lặp lại với hội thoại không có lời nào | Cả hai lần: kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó | không |
| TC-S10.6-AC1-37 | S10.6-AC1 Lời có vai khác A và B thì báo lỗi | Chức năng | Trên bản sao nội dung, sửa hội thoại 3 lời cho lời 3 có vai "C"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-38 | S10.6-AC1 Lời trỏ tới câu không có thì báo lỗi | Chức năng | Trên bản sao nội dung, sửa hội thoại 3 lời cho lời 2 trỏ tới một câu không có trong nội dung; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-39 | S10.6-AC1 Câu của lời thiếu pinyin, nghĩa hoặc audio thì báo lỗi | Chức năng | Trên bản sao nội dung, xóa nghĩa tiếng Việt của câu lời 2 ("你好！你叫什么名字？"); chạy kiểm tra nội dung. Khôi phục, lặp lại với xóa pinyin, rồi với xóa audio của câu đó | Cả ba lần: kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-40 | S10.6-AC1 Nội dung lỗi thì dựng nội dung không ghi ra | Chức năng | Trên bản sao nội dung có một câu hội thoại vi phạm (lời 3 vai "C"); ghi lại thời điểm sửa của nội dung đã dựng; chạy lệnh dựng nội dung. Khôi phục, lặp lại với vi phạm giọng (câu của lời 2, vai B, khai giọng nữ) | Cả hai lần: dựng nội dung báo lỗi; nội dung đã dựng không được ghi mới (không đổi so với trước khi chạy) | không |
| TC-S10.6-AC1-41 | S10.6-AC1 Hội thoại 3 lời là hợp lệ | Chức năng | Trên bản sao nội dung, tạo câu hội thoại dùng hội thoại 3 lời (đủ chữ Hán, pinyin, nghĩa, audio; câu của lời 1 và lời 3 khai giọng nữ, câu của lời 2 khai giọng nam) trong một bài học thường có thêm một câu chấm điểm; chạy kiểm tra nội dung | Không có lỗi nào nêu bài đó | không |
| TC-S10.6-AC1-42 | S10.6-AC1 Hội thoại 3 lời là hợp lệ | Biên | Chạy lệnh kiểm tra nội dung của dự án trên nội dung phát hành như CI chạy, không trỏ tới bản sao nào | Kiểm tra thành công, không có lỗi nào; kết quả không nhắc tới bài mẫu (Bài H, H2, H3, HD, HL) hay nội dung lỗi mẫu nào, tức luật mới không chặn nội dung đang phát hành và bài mẫu không nằm trong nội dung phát hành | không |

### Kiểm tra nội dung chặn câu sai giọng theo vai

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-47 | S10.6-AC1 Câu của lời vai B không phải giọng nam thì báo lỗi | Chức năng | Trên bản sao nội dung, dùng hội thoại 3 lời trong một bài học thường có thêm câu chấm điểm; sửa câu của lời 2 ("你好！你叫什么名字？", vai B) khai giọng nữ; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-48 | S10.6-AC1 Câu của lời vai A không phải giọng nữ thì báo lỗi | Chức năng | Như TC-S10.6-AC1-47 nhưng giữ lời 2 giọng nam, sửa câu của lời 1 ("你好！", vai A) khai giọng nam; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-49 | S10.6-AC1 Một câu dùng cho cả hai vai thì báo lỗi | Chức năng | Trên bản sao nội dung, trong một bài học thường có thêm câu chấm điểm, tạo hội thoại có lời 1 (vai A) và lời 2 (vai B) cùng trỏ tới một câu "你好！" (một câu duy nhất, đủ pinyin, nghĩa, audio); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu hội thoại dùng hội thoại đó | không |
| TC-S10.6-AC1-50 | S10.6-AC1 Cùng chữ Hán soạn hai câu riêng cho hai vai thì qua | Chức năng | Trên bản sao nội dung, trong một bài học thường có thêm câu chấm điểm, tạo hội thoại có lời 1 (vai A) trỏ câu "你好！" khai giọng nữ và lời 2 (vai B) trỏ một câu khác cũng là "你好！" khai giọng nam (cả hai câu đủ pinyin, nghĩa, audio); chạy kiểm tra nội dung | Không có lỗi nào nêu bài đó | không |

### Câu hội thoại dùng được bằng bàn phím

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC1-43 | S10.6-AC1 Thứ tự Tab của câu hội thoại | A11y | Ở câu hội thoại 3 lời vừa hiện, đặt focus vào "Nghe cả bài", bấm Tab lần lượt 7 lần | Focus đi qua đúng thứ tự "Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch", "Nghe lời 1", "Nghe lời 2", "Nghe lời 3", "Tiếp tục"; mỗi lần có viền focus nhìn thấy | e2e |
| TC-S10.6-AC1-44 | S10.6-AC1 Thứ tự Tab của câu hội thoại | Sáng/Tối | Ở giao diện sáng rồi tối, Tab qua tám điểm dừng như TC-S10.6-AC1-43 | Ở cả hai giao diện, viền focus thấy rõ ở mọi điểm dừng, không lẫn vào nền | không |
| TC-S10.6-AC1-45 | S10.6-AC1 Nghe cả bài bằng bàn phím | A11y | Ở câu hội thoại 3 lời, chỉ dùng bàn phím: Tab tới "Nghe cả bài", bấm Enter; khi đang phát bấm Space | Enter: phát từ lời 1, nút đổi thành "Dừng" và vẫn giữ focus (viền focus vẫn ở nút). Space: audio dừng, nút trở lại "Nghe cả bài" và vẫn giữ focus | e2e |
| TC-S10.6-AC2-12 | S10.6-AC2 Bật bản dịch bằng bàn phím | A11y | Chỉ dùng bàn phím: Tab tới "Bản dịch", bấm Space | Mọi lời hiện bản dịch; "Bản dịch" có dấu tick; focus vẫn ở công tắc, viền focus nhìn thấy | e2e |
| TC-S10.6-AC2-13 | S10.6-AC2 Bật bản dịch bằng bàn phím | A11y | Bật trình đọc màn hình, Tab tới "Bản dịch", bấm Space | Trình đọc màn hình đọc công tắc "Bản dịch" là đang bật | không |

### Câu hội thoại đọc được bằng trình đọc màn hình

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.6-AC2-14 | S10.6-AC2 Công tắc có dấu tick và trạng thái đọc được | A11y | Bật trình đọc màn hình, mở câu hội thoại 3 lời, di chuyển tới hai công tắc "Pinyin", "Bản dịch" | "Pinyin" có dấu tick trước chữ và được đọc là đang bật; "Bản dịch" không có dấu tick và được đọc là đang tắt | không |
| TC-S10.6-AC2-15 | S10.6-AC2 Công tắc có dấu tick và trạng thái đọc được | Sáng/Tối | Ở giao diện sáng rồi tối, xem hai công tắc trước và sau khi bật "Bản dịch" | Ở cả hai giao diện, dấu tick nhìn thấy rõ; phân biệt bật/tắt được nhờ dấu tick, không chỉ nhờ màu | không |
| TC-S10.6-AC2-16 | S10.6-AC2 Lời đọc theo thứ tự vai, chữ, pinyin, bản dịch | A11y | Bật trình đọc màn hình, ở câu hội thoại 3 lời bật "Bản dịch", đọc lời 1 | Lời 1 được đọc theo thứ tự "Vai A", "你好！", "nǐ hǎo!", "Xin chào!" | không |
| TC-S10.6-AC1-46 | S10.6-AC1 Chữ Đang phát không được đọc tự động | A11y | Bật trình đọc màn hình; bấm "Nghe cả bài", nghe trong lúc lời 2 bắt đầu phát; rồi (khi lời 2 đang phát) di chuyển trình đọc màn hình tới lời 2 | Khi lời 2 bắt đầu phát, trình đọc màn hình không tự đọc "Đang phát" (không chồng tiếng với audio); khi di chuyển tới lời 2 thì nghe được "Đang phát" | không |

## Ghi chú

- Tổng 66 case: 50 cho AC1 (gồm 15 case kiểm tra nội dung), 16 cho AC2; 35 case `e2e`. Mọi Scenario trong `specs/dialogue/spec.md` có ít
  nhất một case.
- Đổi số so với bản trước: các case sau TC-S10.6-AC1-13 được đánh số lại theo thứ tự Requirement trong spec mới; case "Chữ Đang phát" trước
  là TC-S10.6-AC2-17 nay là TC-S10.6-AC1-46 vì Scenario mang ID S10.6-AC1.
- TC-S10.6-AC1-19 (giảm chuyển động), TC-S10.6-AC1-11 và các kết quả "không có hiệu ứng trượt", "không chồng tiếng" là quan sát bằng
  mắt/tai; dev phủ thêm bằng test component, QA vẫn xác nhận trên bản build kiểm thử.
- Case kiểm tra nội dung (TC-S10.6-AC1-32 tới -42 và -47 tới -50) chạy bằng lệnh, không qua màn hình người học.
- Vòng 2: TC-S10.6-AC1-24 chuyển sang Scenario mới "Sang câu kế thì thông báo lỗi không còn", đổi Loại thành Chức năng và cột Tự động
  thành `e2e` (đây là case chính của Scenario, e2e đã giả lập được lỗi audio). Bốn case giọng theo vai lấy số -47 tới -50 (nối tiếp số
  cuối) để không đánh số lại các case bàn phím và trình đọc màn hình; bảng vẫn xếp theo thứ tự Requirement. TC-S10.6-AC1-40 thêm lần chạy
  với vi phạm giọng vì Requirement giọng theo vai cũng cấm dựng nội dung ghi ra.
