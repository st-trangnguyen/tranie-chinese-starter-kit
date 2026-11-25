# Test cases: S10.7 Đóng vai

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/role-play/spec.md`. Mọi Scenario mang ID
`S10.7-AC1` hoặc `S10.7-AC2`, nên cột Scenario ghi thêm tên Scenario. Case thêm ở vòng sau lấy số tiếp theo để giữ ID cũ; ID của case đã gỡ (TC-S10.7-AC1-37, theo Scenario "Hội thoại một lượt" đã bỏ khỏi spec)
không dùng lại.

**Điều kiện đầu chung**

- Chạy trên **bản build kiểm thử dùng cho e2e** (không phải bản dev, không phải bản build phát hành). Bản phát hành chưa có câu đóng vai cho
  tới E11; câu đóng vai mẫu chỉ có trong bản build kiểm thử, như bài mẫu offline và nội dung nhiều chủ đề. QA chạy tay cũng dùng bản build
  kiểm thử đó. Bản build có code S10.6 và E5.
- Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong màn chào mừng, có mạng, "Hiện pinyin" trong Cài đặt đang bật, tốc độ audio
  mặc định trong Cài đặt để nguyên, trừ khi case nêu khác.
- **Bài mẫu**: một bài có 1 câu, câu đó là câu "đóng vai" trỏ tới **hội thoại ví dụ** của spec (hội thoại theo cấu trúc S10.6, mỗi lời
  là một lượt; 4 lượt, bốn câu riêng): lượt 1 vai A "你好！" giọng nữ; lượt 2 vai B "你好！" giọng nam (câu riêng, khác câu của lượt 1);
  lượt 3 vai A "你叫什么名字？" giọng nữ; lượt 4 vai B "我叫小明。" giọng nam. Mỗi câu có chữ Hán, pinyin, nghĩa tiếng Việt và audio riêng. Case nêu bài khác thì dùng biến thể tương ứng trong bản build kiểm thử: bài 5 câu có câu đóng vai là câu 2; bài 2 câu có câu
  đóng vai là câu 2; bài có câu đóng vai là câu 3; câu đóng vai trỏ tới hội thoại 3 lượt A, B, A; bài kiểm tra cuối chủ đề có một câu đóng vai.
- **Micro**: "có mic" = trình duyệt có micro và người học cho phép; "quyền micro bị chặn" = người học chặn quyền micro của trang. e2e dùng
  micro giả của trình duyệt.
- **Chấm tự động**: "trình duyệt hỗ trợ" = trình duyệt có nhận diện giọng nói tiếng Trung (Chrome desktop/Android). e2e giả lập kết quả nhận
  diện; QA chạy tay nói thật.
- "Đi tới lượt k" = từ lượt 1, bấm "Lượt tiếp" ở lượt vai A và chọn một mức rồi bấm "Lượt tiếp" ở lượt vai B, đến khi lượt k hiện ra.
- "Chấm câu" = đi tới lượt 4, chọn mức, bấm "Kết thúc hội thoại".

## Requirement: App phát lời vai A, người học ghi âm lời vai B

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-1 | S10.7-AC1 Câu đóng vai mở ra ở lượt 1 | Chức năng | Mở bài mẫu | Màn hiện dòng chữ "Bạn đóng vai B"; hiện lượt 1 với nhãn vai "Vai A", "Lượt 1 / 4", chữ "你好！" và nghĩa tiếng Việt; màn không có dòng "Lượt 2 / 4", "Lượt 3 / 4", "Lượt 4 / 4" và không có nhãn "Vai B (bạn)" | e2e |
| TC-S10.7-AC1-2 | S10.7-AC1 Lượt vai A có nút nghe, không có ghi âm | Chức năng | Mở bài mẫu, nhìn lượt 1 | Có nút "Nghe lời A" và nút "Lượt tiếp" bấm được; không có nút "Ghi âm", không có nút "Chưa đúng", "Gần đúng", "Đúng" | e2e |
| TC-S10.7-AC1-3 | S10.7-AC1 Lượt vai A không tự phát | Chức năng | Bật loa, mở bài mẫu, không bấm gì, chờ 3 giây | Không có audio nào phát | e2e |
| TC-S10.7-AC1-4 | S10.7-AC1 Bấm Nghe lời A thì phát lời A | Chức năng | Mở bài mẫu, bấm "Nghe lời A" | Phát "你好！" của lượt 1 bằng giọng nữ, một lần, từ đầu câu | e2e |
| TC-S10.7-AC1-5 | S10.7-AC1 Nghe lời A nhiều lần | Biên | Ở lượt 1, bấm "Nghe lời A", chờ phát xong; lặp lại đủ 3 lần | Lời A phát đủ 3 lần, mỗi lần từ đầu; sau lần 3 nút "Nghe lời A" vẫn bấm được | không |
| TC-S10.7-AC1-6 | S10.7-AC1 Lời A không phát được | Biên | Mở bài mẫu với audio lượt 1 không tải được (e2e chặn file audio; chạy tay: không dựng được, đọc kết quả e2e), bấm "Nghe lời A" | Màn hiện thông báo "Không phát được audio."; nút "Lượt tiếp" vẫn bấm được và bấm vào thì sang lượt 2 | e2e |
| TC-S10.7-AC1-48 | S10.7-AC1 Sang lượt khác thì thông báo lỗi audio không còn | Biên | Như TC-S10.7-AC1-6: audio lượt 1 không tải được; bấm "Nghe lời A", thấy "Không phát được audio."; bấm "Lượt tiếp" | Màn hiện lượt 2 ("Lượt 2 / 4", "Vai B (bạn)"); thông báo "Không phát được audio." không còn trên màn | e2e |
| TC-S10.7-AC2-20 | S10.7-AC2 Mẫu lời B không phát được | Biên | Mở bài mẫu với audio lượt 2 không tải được, audio các lượt khác bình thường (e2e chặn file audio; chạy tay: không dựng được, đọc kết quả e2e); đi tới lượt 2, bấm "Nghe mẫu" | Màn hiện thông báo "Không phát được audio."; nút "Ghi âm" và ba nút "Chưa đúng", "Gần đúng", "Đúng" vẫn bấm được (chọn "Đúng" thì hiện "Lượt tiếp") | e2e |
| TC-S10.7-AC1-49 | S10.7-AC1 Thông báo lỗi audio mất khi lần phát sau phát được | Biên | Tiếp TC-S10.7-AC2-20: màn đang hiện "Không phát được audio."; bấm "Nghe lời A" của lượt 1 | Phát "你好！" của lượt 1 bằng giọng nữ; thông báo "Không phát được audio." không còn trên màn | e2e |
| TC-S10.7-AC1-50 | S10.7-AC1 Kết thúc hội thoại thì thông báo lỗi audio không còn | Biên | Mở bài mẫu với audio lượt 4 không tải được (e2e chặn file audio); đi tới lượt 4, chọn mức, bấm "Nghe mẫu", thấy "Không phát được audio."; bấm "Kết thúc hội thoại" | Màn báo kết quả câu ("Đúng" hoặc "Sai" theo mức đã chọn); thông báo "Không phát được audio." không còn trên màn | e2e |
| TC-S10.7-AC1-51 | S10.7-AC1 Lời A không phát được | A11y | Bật VoiceOver hoặc NVDA; dựng như TC-S10.7-AC1-6 (audio lượt 1 không tải được; chạy tay dùng công cụ chặn tải file của trình duyệt); bấm "Nghe lời A" bằng bàn phím | Trình đọc màn hình tự đọc "Không phát được audio." mà không cần di chuyển focus; focus vẫn ở nút "Nghe lời A" | không |
| TC-S10.7-AC1-26 | S10.7-AC1 Đã tải audio của chủ đề thì nghe lời A khi không có mạng | Offline | Khi có mạng, tải audio của chủ đề chứa bài mẫu về máy (như S8.4) và chờ báo tải xong; tắt mạng; mở bài mẫu, bấm "Nghe lời A" ở lượt 1 | Phát "你好！" của lượt 1 bằng giọng nữ, không có thông báo "Không phát được audio." | e2e |
| TC-S10.7-AC1-7 | S10.7-AC1 Sang lượt vai B | Chức năng | Ở lượt 1, bấm "Lượt tiếp" | Hiện lượt 2 với nhãn vai "Vai B (bạn)", "Lượt 2 / 4", chữ "你好！", nghĩa tiếng Việt; lượt 1 vẫn hiện phía trên, không còn nút "Lượt tiếp"; lượt 2 có nút "Ghi âm" và ba nút "Chưa đúng", "Gần đúng", "Đúng" | e2e |
| TC-S10.7-AC1-8 | S10.7-AC1 Lượt vai B chưa chọn mức thì chưa đi tiếp | Chức năng | Đi tới lượt 2, không chọn mức (có thể ghi âm rồi dừng) | Không có nút "Lượt tiếp" | e2e |
| TC-S10.7-AC1-9 | S10.7-AC1 Chọn mức ở lượt vai B thì đi tiếp được | Chức năng | Đi tới lượt 2, chọn "Đúng" | Màn ghi bằng chữ đã chọn "Đúng"; có nút "Lượt tiếp"; màn chưa báo kết quả câu là "Đúng"/"Sai", chưa có nút "Tiếp tục" của bài | e2e |
| TC-S10.7-AC1-10 | S10.7-AC1 Lượt cuối có nút Kết thúc hội thoại | Chức năng | Đi tới lượt 4, chọn "Gần đúng" | Có nút "Kết thúc hội thoại", không có nút "Lượt tiếp" | e2e |
| TC-S10.7-AC1-11 | S10.7-AC1 Lượt cuối là vai A | Biên | Mở bài có câu đóng vai trỏ tới hội thoại 3 lượt A, B, A; đi tới lượt 3 | Lượt 3 có nút "Nghe lời A" và nút "Kết thúc hội thoại" bấm được ngay, không cần bấm "Nghe lời A" | e2e |
| TC-S10.7-AC1-12 | S10.7-AC1 Thanh tiến độ của bài không đổi khi đi qua các lượt | Chức năng | Mở bài 5 câu có câu đóng vai là câu 2; trả lời câu 1; ở câu đóng vai đi từ lượt 1 tới lượt 4 | Ở mọi lượt, thanh tiến độ của bài vẫn hiện "Câu 2 / 5" | e2e |
| TC-S10.7-AC1-13 | S10.7-AC1 Lượt mới nhận focus | A11y | Chỉ dùng bàn phím: Tab tới "Lượt tiếp" ở lượt 1, nhấn Enter | Focus bàn phím nằm ở dòng "Lượt 2 / 4"; tên mà trình đọc màn hình nhận được ở chỗ focus (tên truy cập) chứa nhãn vai "Vai B (bạn)" và lời "你好！" | e2e |
| TC-S10.7-AC1-27 | S10.7-AC1 Lượt mới nhận focus | A11y | Bật VoiceOver (macOS/iOS) rồi NVDA (Windows); chỉ dùng bàn phím: Tab tới "Lượt tiếp" ở lượt 1, nhấn Enter; làm tiếp tới lượt 3 | Viền focus nhìn thấy ở dòng "Lượt 2 / 4"; trình đọc màn hình đọc thật "Vai B (bạn)" và "你好！" của lượt 2; ở lượt 3 đọc "Vai A" và "你叫什么名字？" | không |
| TC-S10.7-AC1-14 | S10.7-AC1 Lượt mới nhận focus | A11y | Chỉ dùng bàn phím đi hết câu đóng vai: "Nghe lời A", "Lượt tiếp", "Ghi âm"/"Dừng", "Nghe mẫu", chọn mức, "Kết thúc hội thoại", "Tiếp tục" | Mọi nút tới được bằng Tab, bấm được bằng Enter/Space, viền focus nhìn thấy ở mỗi nút | không |

## Requirement: Nút nghe của mỗi lượt có tên kèm số lượt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-52 | S10.7-AC1 Nút nghe của mỗi lượt được đọc kèm số lượt | A11y | Mở bài mẫu, chọn "Đúng" ở lượt 2 và lượt 4, bấm "Kết thúc hội thoại"; đọc tên truy cập (tên trình đọc màn hình nhận được) và chữ hiển thị của bốn nút nghe | Tên truy cập của bốn nút theo thứ tự là "Nghe lời A, lượt 1", "Nghe mẫu, lượt 2", "Nghe lời A, lượt 3", "Nghe mẫu, lượt 4"; chữ hiển thị trên nút lượt 1, 3 là "Nghe lời A", trên nút lượt 2, 4 là "Nghe mẫu" | e2e |
| TC-S10.7-AC1-53 | S10.7-AC1 Nút nghe của mỗi lượt được đọc kèm số lượt | A11y | Bật VoiceOver rồi NVDA; làm như TC-S10.7-AC1-52; Tab qua bốn nút nghe | Trình đọc màn hình đọc thật "Nghe lời A, lượt 1", "Nghe mẫu, lượt 2", "Nghe lời A, lượt 3", "Nghe mẫu, lượt 4" | không |

## Requirement: Mỗi lượt ghi rõ vai và lời

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-15 | S10.7-AC1 Tắt pinyin thì lời không có pinyin | Chức năng | Tắt "Hiện pinyin" trong Cài đặt; mở bài mẫu, đi tới lượt 4 | Mỗi lượt 1–4 hiện chữ Hán và nghĩa tiếng Việt, không lượt nào hiện pinyin | e2e |
| TC-S10.7-AC1-16 | S10.7-AC1 Bật pinyin thì lời có pinyin | Chức năng | "Hiện pinyin" đang bật; mở bài mẫu, đi tới lượt 4 | Mỗi lượt 1–4 hiện chữ Hán, pinyin và nghĩa tiếng Việt | e2e |
| TC-S10.7-AC1-17 | S10.7-AC1 Bật pinyin thì lời có pinyin | Sáng/Tối | Ở giao diện sáng rồi tối, đi tới lượt 4 | Dòng "Bạn đóng vai B", nhãn "Vai A", "Vai B (bạn)", "Lượt k / n", chữ Hán, pinyin, nghĩa của mọi lượt đọc rõ trên nền; vai phân biệt bằng chữ, không chỉ bằng màu; lượt đã qua trông khác lượt đang làm nhưng vẫn đọc được | không |
| TC-S10.7-AC1-18 | S10.7-AC1 Bật pinyin thì lời có pinyin | Mobile 375 | Khổ 375×812, đi tới lượt 4, cuộn màn | Mọi lượt hiện đủ chữ, không tràn ngang, không phải cuộn ngang; nút "Ghi âm", "Nghe mẫu", ba nút tự đánh giá và "Kết thúc hội thoại" bấm được bằng tay, không bị che | không |

## Requirement: Lượt đã qua và câu đã chấm vẫn nghe lại được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-28 | S10.7-AC1 Nghe lại lời A của lượt trước khi đang ở lượt B | Chức năng | Đi tới lượt 2; bấm "Nghe lời A" của lượt 1 | Phát "你好！" của lượt 1 bằng giọng nữ, một lần từ đầu; lượt 2 vẫn là lượt đang làm (vẫn có "Ghi âm" và ba nút tự đánh giá bấm được, không có lượt 3) | e2e |
| TC-S10.7-AC1-29 | S10.7-AC1 Lượt B đã qua chỉ còn nghe mẫu | Chức năng | Đi tới lượt 2, ghi âm rồi dừng, chọn "Gần đúng", bấm "Lượt tiếp" tới lượt 3; ở lượt 2 bấm "Nghe mẫu", rồi thử bấm "Đúng" của lượt 2 | "Nghe mẫu" của lượt 2 phát "你好！" của lượt 2 bằng giọng nam; lượt 2 không có nút "Ghi âm", không có nút "Nghe bản ghi"; ba nút tự đánh giá của lượt 2 không bấm được và vẫn ghi bằng chữ đã chọn "Gần đúng" | e2e |
| TC-S10.7-AC1-30 | S10.7-AC1 Sau khi chấm vẫn nghe lại được | Chức năng | Chấm câu; lần lượt bấm "Nghe lời A" của lượt 1, lượt 3 và "Nghe mẫu" của lượt 2, lượt 4, mỗi lần chờ phát xong | Lượt 1 phát "你好！" giọng nữ; lượt 3 phát "你叫什么名字？" giọng nữ; lượt 2 phát "你好！" giọng nam; lượt 4 phát "我叫小明。" giọng nam | e2e |
| TC-S10.7-AC1-24 | S10.7-AC1 Đã chấm thì không đổi được | Chức năng | Chọn "Đúng" ở lượt 2, "Gần đúng" ở lượt 4, bấm "Kết thúc hội thoại"; thử bấm "Đúng" của lượt 4 và "Chưa đúng" của lượt 2 | Không lượt nào có nút "Ghi âm" hay "Nghe bản ghi"; ba nút tự đánh giá của lượt 2 và lượt 4 không bấm được, vẫn ghi mức đã chọn ("Đúng", "Gần đúng"); không có nút "Lượt tiếp" hay "Kết thúc hội thoại"; màn vẫn báo kết quả câu là "Sai" như lúc chấm; nút "Tiếp tục" vẫn có | e2e |

## Requirement: Một luồng âm, dừng audio và ghi âm khi đi tiếp

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-31 | S10.7-AC1 Bấm nghe khi audio khác đang phát | Chức năng | Đi tới lượt 2; bấm "Nghe mẫu", trong lúc mẫu còn phát bấm "Nghe lời A" của lượt 1 | Mẫu lời B (giọng nam) ngừng; lời A "你好！" của lượt 1 (giọng nữ) phát từ đầu; lúc nào cũng chỉ nghe một luồng âm | e2e |
| TC-S10.7-AC1-32 | S10.7-AC1 Bấm Lượt tiếp khi lời A đang phát thì audio dừng | Chức năng | Ở lượt 1, bấm "Nghe lời A", trong lúc lời A còn phát bấm "Lượt tiếp" | Lời A ngừng; màn hiện lượt 2; không có audio nào đang phát | e2e |
| TC-S10.7-AC1-33 | S10.7-AC1 Bấm Kết thúc hội thoại khi audio đang phát thì audio dừng | Chức năng | Đi tới lượt 4, chọn mức; bấm "Nghe mẫu", trong lúc mẫu còn phát bấm "Kết thúc hội thoại" | Mẫu ngừng; màn báo kết quả câu là "Đúng" hoặc "Sai" theo mức đã chọn | e2e |
| TC-S10.7-AC2-16 | S10.7-AC2 Bấm Lượt tiếp khi đang ghi âm thì dừng ghi và bỏ bản ghi | Chức năng | Có mic; đi tới lượt 2, chọn mức, bấm "Ghi âm", trong lúc còn "Đang ghi âm" bấm "Lượt tiếp" | Màn không còn báo "Đang ghi âm"; trình duyệt không còn báo trang đang dùng micro; màn hiện lượt 3; lượt 2 không có nút "Nghe bản ghi" | e2e |
| TC-S10.7-AC2-17 | S10.7-AC2 Bấm Kết thúc hội thoại khi đang ghi âm thì dừng ghi | Chức năng | Có mic; đi tới lượt 4, chọn mức, bấm "Ghi âm", trong lúc còn "Đang ghi âm" bấm "Kết thúc hội thoại" | Màn không còn báo "Đang ghi âm"; trình duyệt không còn báo trang đang dùng micro; màn báo kết quả câu là "Đúng" hoặc "Sai" | e2e |

## Requirement: Audio câu đóng vai phát ở tốc độ thường

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-34 | S10.7-AC1 Tốc độ mặc định Chậm vẫn phát lời A ở 1x | Chức năng | Chọn tốc độ audio mặc định "Chậm (0.75x)" trong Cài đặt; mở bài mẫu, bấm "Nghe lời A" ở lượt 1 (e2e kiểm tốc độ phát; chạy tay: so với lần nghe cùng lời khi tốc độ mặc định là 1x) | Lời A phát ở tốc độ 1x, nhanh như khi tốc độ mặc định là 1x | e2e |
| TC-S10.7-AC2-18 | S10.7-AC2 Tốc độ mặc định Chậm vẫn phát mẫu lời B ở 1x | Chức năng | Chọn tốc độ audio mặc định "Chậm (0.75x)" trong Cài đặt; đi tới lượt 2, bấm "Nghe mẫu" (cách kiểm như TC-S10.7-AC1-34) | Lời B phát ở tốc độ 1x | e2e |
| TC-S10.7-AC1-35 | S10.7-AC1 Câu đóng vai không có công tắc Nghe chậm | Chức năng | Mở bài mẫu, đi tới lượt 4 | Ở mọi lượt, màn không có công tắc "Nghe chậm" | e2e |

## Requirement: Câu đóng vai được chấm như một câu của bài

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-19 | S10.7-AC1 Mọi lượt B Đúng thì câu đúng | Chức năng | Chọn "Đúng" ở lượt 2 và lượt 4, bấm "Kết thúc hội thoại" | Màn báo kết quả câu là "Đúng" và hiện nút "Tiếp tục"; không hiện giải thích | e2e |
| TC-S10.7-AC1-20 | S10.7-AC1 Một lượt B chưa Đúng thì câu sai | Chức năng | Chọn "Đúng" ở lượt 2, "Gần đúng" ở lượt 4, bấm "Kết thúc hội thoại" | Màn báo kết quả câu là "Sai" và hiện nút "Tiếp tục"; giải thích hiện chữ "我叫小明。", pinyin và nghĩa của lượt 4; không có lời lượt 2 trong giải thích | e2e |
| TC-S10.7-AC1-21 | S10.7-AC1 Một lượt B chưa Đúng thì câu sai | Biên | Chọn "Chưa đúng" ở lượt 2, "Gần đúng" ở lượt 4, bấm "Kết thúc hội thoại" | Màn báo kết quả câu là "Sai"; giải thích hiện lời lượt 2 "你好！" rồi lời lượt 4 "我叫小明。" theo thứ tự đó, mỗi lời có chữ, pinyin, nghĩa | e2e |
| TC-S10.7-AC1-22 | S10.7-AC1 Giải thích luôn có pinyin | Chức năng | Tắt "Hiện pinyin"; mở bài mẫu, chọn "Đúng" ở lượt 2, "Chưa đúng" ở lượt 4, bấm "Kết thúc hội thoại" | Màn báo kết quả câu là "Sai"; giải thích hiện pinyin của lời lượt 4, dù lời của các lượt phía trên không có pinyin | e2e |
| TC-S10.7-AC1-23 | S10.7-AC1 Câu đóng vai cộng chung với các câu khác | Chức năng | Mở bài 2 câu: trả lời đúng câu 1; ở câu 2 (đóng vai) chọn "Đúng" ở lượt 2, "Chưa đúng" ở lượt 4, "Kết thúc hội thoại", "Tiếp tục" | Màn tổng kết hiện "50%", "Đúng 1 / 2 câu", "Sai 1 câu" | e2e |
| TC-S10.7-AC1-36 | S10.7-AC1 Câu đóng vai sai trong bài kiểm tra cuối chủ đề không tạo thẻ ôn tập | Chức năng | **Chỉ chạy khi code S9.1/S9.4 đã có trong bản build** (proposal, Dependencies); chưa có thì ghi "không chạy được". Trình duyệt sạch, chưa có thẻ ôn tập nào; mở bài kiểm tra cuối chủ đề có câu đóng vai; trả lời đúng mọi câu khác; ở câu đóng vai chọn "Chưa đúng" ở một lượt B, bấm "Kết thúc hội thoại"; làm xong bài; mở danh sách thẻ ôn tập | Câu đóng vai bị báo "Sai"; danh sách thẻ ôn tập không có thẻ nào | e2e |

## Requirement: Thoát giữa câu đóng vai thì làm lại từ lượt đầu

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-25 | S10.7-AC1 Thoát giữa câu đóng vai rồi học tiếp | Chức năng | Mở bài có câu đóng vai là câu 3; trả lời câu 1, 2; ở câu 3 ghi âm và chọn mức ở lượt 2, bấm "Lượt tiếp" tới lượt 3; thoát bài; mở lại bài và học tiếp | Màn hiện câu 3 (thanh tiến độ "Câu 3 / …") ở lượt 1, chưa có lượt nào khác; khi đi tới lượt 2 thì chưa có mức nào được chọn và nút "Nghe bản ghi" không bấm được | e2e |

## Requirement: Dùng lại phần ghi âm, so sánh và đánh giá của E5

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC2-1 | S10.7-AC2 Ghi âm lời vai B | Chức năng | Có mic; đi tới lượt 2, bấm "Ghi âm" | Màn báo "Đang ghi âm"; nút đổi thành "Dừng" | e2e |
| TC-S10.7-AC2-2 | S10.7-AC2 Dừng ghi thì nghe lại được bản ghi | Chức năng | Ở lượt 2, bấm "Ghi âm", nói "你好", bấm "Dừng", bấm "Nghe bản ghi" | Nút đổi lại "Ghi âm"; "Nghe bản ghi" bấm được và phát giọng người học vừa ghi | e2e |
| TC-S10.7-AC2-3 | S10.7-AC2 Nghe mẫu lời vai B | Chức năng | Ở lượt 2, bấm "Nghe mẫu" | Phát "你好！" của lượt 2 bằng giọng nam (không phải giọng nữ của lượt 1), một lần từ đầu | e2e |
| TC-S10.7-AC2-4 | S10.7-AC2 Chưa ghi thì chưa nghe được bản ghi | Chức năng | Đi tới lượt 2, không bấm gì | "Nghe mẫu" bấm được; "Nghe bản ghi" không bấm được | e2e |
| TC-S10.7-AC2-5 | S10.7-AC2 Bắt đầu ghi thì lời A đang nghe lại dừng | Biên | Có mic; đi tới lượt 2; bấm "Nghe lời A" của lượt 1, trong lúc lời A còn phát bấm "Ghi âm" | Lời A ngừng phát; màn báo "Đang ghi âm" và nút đổi thành "Dừng" | e2e |
| TC-S10.7-AC2-19 | S10.7-AC2 Bắt đầu ghi thì mẫu lời B đang phát dừng | Biên | Có mic; đi tới lượt 2; bấm "Nghe mẫu", trong lúc mẫu còn phát bấm "Ghi âm" | Mẫu ngừng phát; màn báo "Đang ghi âm" và nút đổi thành "Dừng" | e2e |
| TC-S10.7-AC2-6 | S10.7-AC2 Sang lượt khác thì bản ghi của lượt trước không còn | Chức năng | Ở lượt 2 ghi âm rồi dừng, chọn mức, "Lượt tiếp" tới lượt 3, "Lượt tiếp" tới lượt 4 | Lượt 4 chưa có bản ghi, "Nghe bản ghi" không bấm được; lượt 2 phía trên không còn nút "Nghe bản ghi" | e2e |
| TC-S10.7-AC2-7 | S10.7-AC2 Bản ghi không có trong dữ liệu lưu của máy | Chức năng | Ở lượt 2 ghi âm rồi dừng, thoát bài; test đọc dữ liệu tiến độ đã lưu (chạy tay: không xem được, đọc kết quả e2e) | Dữ liệu tiến độ lưu trên máy không chứa bản ghi nào | e2e |
| TC-S10.7-AC2-8 | S10.7-AC2 Tự chấm mà không ghi âm | Chức năng | Đi tới lượt 2, không ghi âm, chọn "Gần đúng" | Màn ghi bằng chữ đã chọn "Gần đúng"; ba nút đánh giá của lượt 2 không bấm được nữa | e2e |
| TC-S10.7-AC2-9 | S10.7-AC2 Có mạng và hỗ trợ thì có chấm tự động | Chức năng | Có mạng, trình duyệt hỗ trợ; đi tới lượt 2 | Lượt 2 có khu "Chấm tự động" | e2e |
| TC-S10.7-AC2-10 | S10.7-AC2 Không có mạng thì không có chấm tự động | Offline | Mở bài mẫu khi có mạng, tắt mạng, đi tới lượt 2; ghi âm, dừng, "Nghe bản ghi", chọn "Đúng" | Lượt 2 không có khu "Chấm tự động"; ghi âm, nghe lại bản ghi và chọn mức vẫn làm được; có nút "Lượt tiếp" | e2e |
| TC-S10.7-AC2-11 | Hồi quy S8.4 (proposal, Dependencies: audio các lượt nằm trong audio tải về của chủ đề); không có Scenario riêng, Scenario lời A offline là TC-S10.7-AC1-26 | Offline | Khi có mạng, tải audio của chủ đề chứa bài mẫu về máy và chờ báo tải xong; tắt mạng; mở bài mẫu, đi tới lượt 4: bấm "Nghe mẫu" ở lượt 2, "Nghe lời A" ở lượt 3, "Nghe mẫu" ở lượt 4 | Cả ba lời phát được khi không có mạng, không có thông báo "Không phát được audio." | không |
| TC-S10.7-AC2-12 | S10.7-AC2 Chấm tự động so với lời vai B | Chức năng | Có mạng, trình duyệt hỗ trợ; đi tới lượt 4, ghi âm và nói sao cho máy nhận được "我叫小名" (e2e giả lập kết quả nhận diện), dừng | Khu "Chấm tự động" hiện "我叫小名", chữ "名" tô màu và có nhãn "Khác"; chưa có mức nào được chọn | e2e |
| TC-S10.7-AC2-13 | S10.7-AC2 Không có mic thì lượt B đọc to rồi tự chấm | Chức năng | Chặn quyền micro; đi tới lượt 2, bấm "Ghi âm" | Màn hiện hướng dẫn cấp quyền micro; lượt 2 không còn "Ghi âm", "Nghe bản ghi", khu "Chấm tự động"; vẫn có "Nghe mẫu" và ba nút tự đánh giá | e2e |
| TC-S10.7-AC2-14 | S10.7-AC2 Chế độ đọc to giữ cho lượt B sau, lượt A vẫn nghe được | Chức năng | Tiếp TC-S10.7-AC2-13: ở lượt 2 chọn mức, "Lượt tiếp" tới lượt 3, bấm "Nghe lời A", "Lượt tiếp" tới lượt 4 | Lượt 3 có "Nghe lời A" bấm được và phát lời A; lượt 4 ở chế độ "đọc to rồi tự chấm" (không có "Ghi âm") và có nút "Thử lại ghi âm" | e2e |
| TC-S10.7-AC2-15 | S10.7-AC2 Không có mic thì lượt B đọc to rồi tự chấm | Mobile 375 | Điện thoại thật (iOS Safari, Android Chrome), khổ 375: đi tới lượt 2, bấm "Ghi âm", cho phép micro, nói "你好", "Dừng", "Nghe bản ghi"; làm lại với quyền micro bị chặn | Khi cho phép: ghi và nghe lại được giọng mình. Khi chặn: hiện hướng dẫn cấp quyền micro và chế độ "đọc to rồi tự chấm" | không |

## Requirement: Nội dung câu đóng vai phải hợp lệ

Các case dưới đây là công cụ của người soạn, chạy trên nội dung thử (không phải nội dung phát hành), kiểm bằng test của kiểm tra nội dung,
không phải Playwright. QA chạy tay được bằng cách sửa nội dung thử rồi chạy kiểm tra nội dung/dựng nội dung, hoặc xem test tương ứng có trong
bộ test và CI xanh.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-42 | S10.7-AC1 Câu đóng vai trỏ tới hội thoại không có thì báo lỗi | Biên | Trong một bài nháp, tạo câu đóng vai trỏ tới một hội thoại không có trong nội dung; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó | không |
| TC-S10.7-AC1-43 | S10.7-AC1 Lượt của câu đóng vai thiếu nghĩa thì báo lỗi | Biên | Tạo câu đóng vai trỏ tới một hội thoại mà câu của lượt 2 thiếu nghĩa tiếng Việt; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó | không |
| TC-S10.7-AC1-54 | S10.7-AC1 Lượt của câu đóng vai sai giọng thì báo lỗi | Biên | Tạo câu đóng vai trỏ tới bản sao hội thoại ví dụ, chỉ đổi câu của lượt 2 (vai B) sang khai giọng nữ; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó | không |
| TC-S10.7-AC1-38 | S10.7-AC1 Lượt 1 là vai B thì báo lỗi | Biên | Tạo câu đóng vai trỏ tới hội thoại 2 lượt, hai câu riêng: lượt 1 vai B "你好！" giọng nam, lượt 2 vai A "你好！" giọng nữ (hợp lệ với mọi luật hội thoại của S10.6); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó, và cho biết lượt 1 của câu đóng vai phải là vai A | không |
| TC-S10.7-AC1-39 | S10.7-AC1 Không có lượt vai B thì báo lỗi | Biên | Tạo câu đóng vai trỏ tới hội thoại 2 lượt đều vai A, hai câu riêng: lượt 1 "你好！" giọng nữ, lượt 2 "你叫什么名字？" giọng nữ (hợp lệ với mọi luật hội thoại của S10.6); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu đó, và cho biết câu đóng vai phải có ít nhất một lượt vai B | không |
| TC-S10.7-AC1-44 | S10.7-AC1 Quy tắc riêng của đóng vai không áp cho câu hội thoại | Biên | Tạo bài học gồm một câu hội thoại (S10.6) trỏ tới hội thoại 2 lời đều vai A, hai câu riêng đều giọng nữ ("你好！", "你叫什么名字？"), và một câu chấm điểm khác; không câu đóng vai nào trỏ tới hội thoại đó; chạy kiểm tra nội dung | Kiểm tra không báo lỗi nào cho bài đó | không |
| TC-S10.7-AC1-40 | S10.7-AC1 Nội dung lỗi thì dựng nội dung không ghi ra | Biên | Dùng nội dung có câu đóng vai lỗi của TC-S10.7-AC1-38; chạy dựng nội dung | Dựng nội dung báo lỗi và kết thúc không thành công; nội dung đã dựng trước đó không đổi | không |
| TC-S10.7-AC1-41 | S10.7-AC1 Hội thoại ví dụ là hợp lệ | Chức năng | Tạo câu đóng vai trỏ tới hội thoại ví dụ 4 lượt (bốn câu riêng; lượt 1, 3 giọng nữ; lượt 2, 4 giọng nam); chạy kiểm tra nội dung | Kiểm tra không báo lỗi nào cho bài đó | không |

## Requirement: Câu đóng vai là câu chấm điểm

Hai case kiểm tra nội dung (TC-S10.7-AC1-46, TC-S10.7-AC1-47) chạy như mục trên: trên nội dung thử, bằng test của kiểm tra nội dung.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.7-AC1-45 | S10.7-AC1 Câu đóng vai vừa hiện chưa có Tiếp tục | Chức năng | Mở bài mẫu, không bấm gì | Không có nút "Tiếp tục" của bài | e2e |
| TC-S10.7-AC1-46 | S10.7-AC1 Bài kiểm tra có câu đóng vai thì qua kiểm tra nội dung | Chức năng | Tạo bài kiểm tra cuối chủ đề gồm một câu đóng vai trỏ tới hội thoại ví dụ và các câu chấm điểm khác; chạy kiểm tra nội dung | Kiểm tra không báo lỗi nào cho bài đó | không |
| TC-S10.7-AC1-47 | S10.7-AC1 Bài học gồm câu hội thoại và câu đóng vai thì qua kiểm tra nội dung | Biên | Tạo bài học chỉ gồm một câu hội thoại (S10.6) và một câu đóng vai, cả hai trỏ tới cùng hội thoại ví dụ (bốn câu riêng; lượt 1, 3 giọng nữ; lượt 2, 4 giọng nam); chạy kiểm tra nội dung | Kiểm tra không báo lỗi nào cho bài đó | không |
