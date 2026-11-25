# Test cases: S10.1 Flashcard từ mới

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/word-flashcard/spec.md` và
`specs/lesson-runner/spec.md`. Mọi Scenario mới của story cùng ID `S10.1-AC1`, nên cột Scenario ghi thêm tên Scenario để phân biệt.
Các Scenario S3.2-AC2 và S3.4-AC1 chép lại nguyên văn trong phần sửa của `lesson-runner` (chỉ vì Requirement của chúng đổi) chạy lại
như hồi quy: S3.2-AC2 chạy lại theo TC-S3.2-AC2-1..4 của `openspec/changes/archive/2026-11-23-s7-1-intro-lessons/test-cases.md` trên
bài Nhập môn; S3.4-AC1 (chưa có `test-cases.md`) hồi quy bằng bộ test tự động hiện có (`pnpm test:run`, `pnpm e2e`). Ở đây chỉ thêm case
cho Scenario có chữ đổi ("S3.2-AC2 Chưa trả lời thì chưa có kết quả", nay chỉ nói câu chấm điểm).

**Điều kiện đầu chung**

- **Hai bản build** (proposal, mục "Dữ liệu nghiệm thu"):
  - **Bản build kiểm thử**: bản build dành cho kiểm thử tự động, có các bài mẫu dưới đây. Mọi case trên màn học chạy trên bản này.
  - **Bản build phát hành**: bản app người học tải về, không có bài mẫu nào (chỉ dùng ở TC-S10.1-AC1-35).
- Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app (xoá dữ liệu trang hoặc cửa sổ ẩn danh), đã qua màn chào mừng, có mạng, "Hiện
  pinyin" bật, "Nghe chậm" tắt, chưa có thẻ ôn tập nào, trừ khi case nêu khác.
- **Bài mẫu** (chỉ có trong bản build kiểm thử, không nằm trong nội dung phát hành; e2e và chạy tay dùng chung). Mọi bài mẫu là bài học
  thường. Cách vào bài mẫu trên bản build kiểm thử do dev ghi trong `design.md`; không dùng file sao lưu để mở bài.
  - **F1** (3 câu): câu 1 là thẻ từ mới của "你好" (nǐ hǎo, xin chào), câu ví dụ "你好，老师！" (Nǐ hǎo, lǎoshī!, Chào thầy/cô!); câu 2 là
    thẻ từ mới của "好" (ba nghĩa "tốt", "khỏe", "hay" theo thứ tự đó); câu 3 là một câu chọn thanh.
  - **F2** (5 câu): câu 1 là thẻ từ mới, câu 2–5 là bốn câu chọn thanh.
  - **F3** (3 câu): câu 1 là một câu chọn thanh; câu 2 là thẻ từ mới của "你好" (như F1); câu 3 là thẻ từ mới của "好" (như F1).
  - **F4** (3 câu): câu 1 là thẻ từ mới của "你好" (câu ví dụ "你好，老师！"); câu 2 và câu 3 là câu chọn thanh của "谢谢", không có từ
    nào khác. Ngay sau F4 trên Lộ trình là một bài khác, lúc bắt đầu có nhãn "Đã khóa".
  - **F5** (2 câu): câu 1 là thẻ từ mới có câu ví dụ dài 20 chữ Hán; câu 2 là một câu chọn thanh.
- **Nội dung lỗi mẫu** (cho kiểm tra nội dung): dev cung cấp cùng PR code các bài lỗi nêu trong từng case, đặt **ngoài** nội dung phát
  hành, để lệnh kiểm tra nội dung chạy trên nội dung phát hành không quét tới chúng (kiểm ở TC-S10.1-AC1-27). QA chạy lệnh kiểm tra nội
  dung của dự án trên từng bài lỗi (cách trỏ lệnh tới bài lỗi do dev ghi trong `design.md`) và đọc kết quả. Các case này được dev tự động
  hóa bằng test của kiểm tra nội dung, không phải e2e, nên cột Tự động ghi `không`.
- **Thẻ ôn tập** (TC-S10.1-AC1-32, TC-S10.1-AC1-33): **cần code S9.1 (tạo thẻ ôn tập) đã có trên nhánh trước khi chạy**; chưa có thì
  ghi "không chạy được: chờ S9.1". App chưa có màn hiện danh sách thẻ ôn tập (S9.2, S9.5), nên như S9.1: e2e đọc danh sách thẻ đã lưu từ
  phía test sau khi thao tác thật trên bản build; QA chạy tay chỉ kiểm phần nhìn thấy (màn tổng kết, nhãn "Đã xong") và đọc kết quả e2e
  cho phần danh sách thẻ.
- "Có âm phát" khi chạy tay = nghe thấy ở loa/tai nghe; e2e kiểm bằng trạng thái phát của trình duyệt.

## Thẻ hiện đủ năm phần

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-1 | S10.1-AC1 Thẻ hiện đủ năm phần | Chức năng | Mở bài mẫu F1, không bấm gì | Thẻ hiện cùng lúc: chữ "你好" (cỡ lớn nhất trên thẻ), pinyin "nǐ hǎo", nghĩa "xin chào", nút "Nghe" và công tắc "Nghe chậm" ngay sau nút, câu ví dụ "你好，老师！", pinyin "Nǐ hǎo, lǎoshī!", nghĩa "Chào thầy/cô!", nút "Nghe câu ví dụ". Không có phần nào bị ẩn, không phải bấm lật | e2e |
| TC-S10.1-AC1-2 | S10.1-AC1 Từ có nhiều nghĩa thì hiện mọi nghĩa | Chức năng | Mở bài mẫu F1, bấm "Tiếp tục" ở câu 1 | Thẻ của "好" hiện nghĩa đúng chuỗi "tốt; khỏe; hay" (đúng thứ tự, ngăn bằng "; ") | e2e |

## Pinyin trên thẻ luôn hiện

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-3 | S10.1-AC1 Tắt Hiện pinyin vẫn thấy pinyin trên thẻ | Chức năng | Vào Cài đặt, tắt "Hiện pinyin"; mở bài mẫu F1 | Thẻ vẫn hiện pinyin "nǐ hǎo" của từ và "Nǐ hǎo, lǎoshī!" của câu ví dụ | e2e |

## Audio của thẻ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-4 | S10.1-AC1 Thẻ vừa hiện thì chưa phát | Chức năng | Mở bài mẫu F1, chờ 3 giây không bấm gì | Không có âm nào phát | e2e |
| TC-S10.1-AC1-5 | S10.1-AC1 Bấm Nghe thì phát âm của từ | Chức năng | Mở bài mẫu F1, bấm "Nghe" | Âm "你好" phát một lần từ đầu, rồi dừng | e2e |
| TC-S10.1-AC1-6 | S10.1-AC1 Bấm Nghe câu ví dụ thì phát âm của câu | Chức năng | Mở bài mẫu F1, bấm "Nghe câu ví dụ" | Âm câu "你好，老师！" phát một lần từ đầu, rồi dừng | e2e |
| TC-S10.1-AC1-7 | S10.1-AC1 Nghe lại nhiều lần | Biên | Ở thẻ "你好" của F1, bấm "Nghe", chờ phát xong; lặp lại đủ 3 lần | Âm của từ phát đủ 3 lần; sau lần 3 nút "Nghe" vẫn bấm được | không |
| TC-S10.1-AC1-8 | S10.1-AC1 Bấm nút kia khi đang phát thì không chồng âm | Biên | Ở thẻ "你好" của F1, bấm "Nghe" rồi bấm ngay "Nghe câu ví dụ" khi âm của từ chưa dứt | Âm của từ dừng, âm câu ví dụ phát từ đầu; không lúc nào nghe hai âm cùng lúc | e2e |
| TC-S10.1-AC1-10 | S10.1-AC1 Sang câu kế thì dừng audio của thẻ | Chức năng | Ở thẻ "你好" của F1, bấm "Nghe câu ví dụ", khi âm đang phát bấm "Tiếp tục" | Âm câu ví dụ dừng ngay; màn sang câu 2 | e2e |
| TC-S10.1-AC1-11 | S10.1-AC1 Audio không phát được | Biên | Ở thẻ "你好" của F1, làm audio của từ không tải được (e2e: chặn file audio; chạy tay: chặn file audio bằng công cụ trình duyệt), bấm "Nghe" | Màn hiện thông báo "Không phát được audio." (đúng chữ đang dùng ở câu nghe); nút "Nghe" vẫn bấm được; bấm "Tiếp tục" sang được câu 2 | e2e |

## Công tắc Nghe chậm trên thẻ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-9 | S10.1-AC1 Bật Nghe chậm thì thẻ phát 0.75x; S10.1-AC1 Bật Nghe chậm thì câu ví dụ cũng phát 0.75x | Chức năng | Mở bài mẫu F1. Trên thẻ "你好", bật công tắc "Nghe chậm" nằm ngay sau nút "Nghe"; bấm "Nghe", chờ phát xong; bấm "Nghe câu ví dụ" | Công tắc cho biết đang bật. Âm của từ phát ở tốc độ 0.75x; âm câu ví dụ cũng phát ở tốc độ 0.75x (chạy tay: chậm rõ so với lúc tắt; e2e kiểm tốc độ phát của từng lần) | e2e |
| TC-S10.1-AC1-28 | S10.1-AC1 Nghe chậm bật ở câu trước thì thẻ vẫn bật | Chức năng | Mở bài mẫu F3. Ở câu 1 (chọn thanh) bật "Nghe chậm", trả lời rồi bấm "Tiếp tục"; ở thẻ "你好" (câu 2) không chạm công tắc, bấm "Nghe" | Công tắc "Nghe chậm" trên thẻ cho biết đang bật; âm của từ phát ở tốc độ 0.75x | e2e |

## Câu không chấm điểm (thẻ từ mới) trong màn học

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-12 | S10.1-AC1 Câu không chấm điểm có Tiếp tục ngay | Chức năng | Mở bài mẫu F1, không bấm gì | Nút "Tiếp tục" có và bấm được ngay; không có chữ "Đúng", "Sai" hay phần giải thích | e2e |
| TC-S3.2-AC2-5 | S3.2-AC2 Chưa trả lời thì chưa có kết quả | Chức năng (hồi quy câu chấm điểm) | Mở bài mẫu F1, bấm "Tiếp tục" ở câu 1 và câu 2; ở câu 3 (chọn thanh) không bấm gì | Màn không hiện "Đúng", "Sai" hay nút "Tiếp tục" cho tới khi trả lời | e2e |
| TC-S10.1-AC1-13 | S10.1-AC1 Thẻ được đếm trong thanh tiến độ | Chức năng | Mở bài mẫu F1, đọc thanh tiến độ; bấm "Tiếp tục" | Ở thẻ: "Câu 1 / 3"; sau khi bấm: câu 2 với "Câu 2 / 3" | e2e |
| TC-S10.1-AC1-14 | S10.1-AC1 Thoát ở thẻ thì mở lại vào đúng thẻ đó | Chức năng | Mở bài mẫu F1, bấm "Tiếp tục" ở câu 1 để tới thẻ "好" (câu 2); thoát bài; mở lại bài mẫu F1 | Màn hiện thẻ "好" với "Câu 2 / 3" | e2e |
| TC-S10.1-AC1-29 | S10.1-AC1 Câu không chấm điểm không phải câu bị bỏ qua | Chức năng | Mở bài mẫu F4, bấm "Tiếp tục" ở thẻ, trả lời câu 2 và câu 3 (đúng hay sai đều được), không bấm "Bỏ qua câu này" lần nào | Màn hiện "Bạn đã làm xong các câu của bài này."; không có thông báo "Bạn đã bỏ qua … câu, bài chưa hoàn thành." | e2e |
| TC-S10.1-AC1-30 | S10.1-AC1 Làm hết bài có thẻ thì bài thành Đã xong | Chức năng | Như TC-S10.1-AC1-29 rồi về Lộ trình | F4 có nhãn "Đã xong"; bài ngay sau F4 có nhãn "Đang mở" (trước đó là "Đã khóa") | e2e |

## Màn tổng kết chỉ tính câu chấm điểm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-15 | S10.1-AC1 Câu không chấm điểm không tính vào điểm | Chức năng | Mở bài mẫu F2, bấm "Tiếp tục" ở thẻ; trả lời đúng 3 và sai 1 trong 4 câu chọn thanh | Màn tổng kết hiện "75%", "Đúng 3 / 4 câu", "Sai 1 câu", và "Bạn đã làm xong các câu của bài này." | e2e |
| TC-S10.1-AC1-31 | S10.1-AC1 Lần làm không có câu chấm điểm nào thì không hiện điểm | Biên | Mở bài mẫu F3, trả lời câu 1, bấm "Tiếp tục" ở câu 2 để tới câu 3 (thẻ "好"); thoát bài; mở lại F3 (màn hiện câu 3 với "Câu 3 / 3"); bấm "Tiếp tục" | Màn tổng kết không hiện điểm phần trăm và không hiện "Đúng x / y câu"; có hiện thời gian và "Sai 0 câu" | e2e |
| TC-S10.1-AC1-40 | S10.1-AC1 Ghi tiến độ lỗi khi lần làm không có câu chấm điểm | Biên | Mở bài mẫu F3, trả lời câu 1, bấm "Tiếp tục" ở câu 2 để tới câu 3 (thẻ "好"); thoát bài; mở lại F3 (màn hiện câu 3 với "Câu 3 / 3"); giả lập lỗi lưu tiến độ (e2e: làm lần ghi kết quả bài thất bại, như case hồi quy "Ghi tiến độ lỗi" của S3.4; chạy tay: cách giả lập do dev ghi trong `design.md`); bấm "Tiếp tục" | Màn tổng kết không hiện điểm phần trăm và không hiện "Đúng x / y câu"; có hiện thời gian, "Sai 0 câu" và thông báo "Chưa lưu được kết quả bài này" | e2e |

## Thẻ ôn tập của từ (cần code S9.1)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-32 | S10.1-AC1 Xong bài có thẻ thì từ của thẻ có thẻ ôn tập | Chức năng | **Cần code S9.1.** Người học chưa có thẻ ôn tập nào. Mở bài mẫu F4, bấm "Tiếp tục" ở thẻ "你好", trả lời câu 2 và câu 3, không bỏ qua câu nào, tới màn tổng kết | Danh sách thẻ ôn tập có đúng 4 thẻ: "你好" chiều nghĩa, "你好" chiều nghe, "谢谢" chiều nghĩa, "谢谢" chiều nghe; không có thẻ nào của "老师" hay của câu "你好，老师！" (chạy tay: chỉ kiểm màn tổng kết và F4 "Đã xong", đọc kết quả e2e cho danh sách thẻ) | e2e |
| TC-S10.1-AC1-33 | S10.1-AC1 Thoát ở thẻ thì chưa tạo thẻ ôn tập | Chức năng | **Cần code S9.1.** Người học chưa có thẻ ôn tập nào. Mở bài mẫu F4, bấm "Tiếp tục" ở thẻ "你好" (câu 1); ở câu 2 thoát bài | Danh sách thẻ ôn tập không có thẻ mới (chạy tay: F4 trên Lộ trình chưa "Đã xong", đọc kết quả e2e cho danh sách thẻ) | e2e |

## Bàn phím, trình đọc màn hình, điện thoại

Focus đặt ở dòng "Câu k / n" khi sang câu mới; thứ tự Tab tính từ dòng đó.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-34 | S10.1-AC1 Thứ tự Tab trên thẻ | A11y | Mở bài mẫu F3, trả lời câu 1 rồi bấm "Tiếp tục" để tới thẻ "你好" (câu 2); nhấn Tab 4 lần | Sau khi sang thẻ, focus ở dòng "Câu 2 / 3"; mỗi lần Tab focus đi lần lượt tới "Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục" | e2e |
| TC-S10.1-AC1-16 | S10.1-AC1 Dùng thẻ chỉ bằng bàn phím | A11y | Mở bài mẫu F3, chỉ dùng bàn phím: trả lời câu 1, Enter ở "Tiếp tục" để tới thẻ; Tab tới "Nghe", Enter; Tab tới "Nghe chậm", Space; Tab tới "Nghe câu ví dụ", Enter; Tab tới "Tiếp tục", Enter | Focus đi đúng thứ tự "Nghe" → "Nghe chậm" → "Nghe câu ví dụ" → "Tiếp tục", mỗi điều khiển có viền focus nhìn thấy; "Nghe" phát âm của từ, "Nghe chậm" đổi trạng thái công tắc (tắt → bật), "Nghe câu ví dụ" phát âm câu ví dụ, "Tiếp tục" sang câu 3 | e2e |
| TC-S10.1-AC1-17 | S10.1-AC1 Dùng thẻ chỉ bằng bàn phím | Sáng/Tối | Ở thẻ "你好" của F1, lần lượt ở giao diện sáng và tối, Tab qua bốn điều khiển | Viền focus của cả bốn điều khiển ("Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục") nhìn thấy rõ ở cả hai giao diện | không |
| TC-S10.1-AC1-18 | S10.1-AC1 Tên nút cho trình đọc màn hình | A11y | Ở thẻ "你好" của F1, đọc tên truy cập của từng điều khiển trên thẻ; đọc trạng thái của "Nghe chậm", bật nó, đọc lại trạng thái, tắt nó, đọc lại trạng thái | Tên truy cập lần lượt là "Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục"; "Nghe chậm" là công tắc có trạng thái tắt lúc đầu, bật sau lần bấm thứ nhất, tắt sau lần bấm thứ hai | e2e |
| TC-S10.1-AC1-36 | S10.1-AC1 Tên nút cho trình đọc màn hình | A11y | Bật trình đọc màn hình thật (VoiceOver trên macOS/iOS hoặc NVDA trên Windows), ở thẻ "你好" của F1 di chuyển qua các điều khiển; bật rồi tắt "Nghe chậm" | Tên được đọc lần lượt là "Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục"; trình đọc báo trạng thái bật/tắt của "Nghe chậm" và báo lại mỗi lần đổi | không |
| TC-S10.1-AC1-19 | S10.1-AC1 Chữ Hán được đánh dấu là tiếng Trung | A11y | Ở thẻ "你好" của F1, đọc đánh dấu ngôn ngữ của từng phần chữ trên thẻ | "你好" và "你好，老师！" được đánh dấu là tiếng Trung; nghĩa "xin chào", "Chào thầy/cô!" được đánh dấu là tiếng Việt (hoặc theo ngôn ngữ của trang, là tiếng Việt) | e2e |
| TC-S10.1-AC1-37 | S10.1-AC1 Chữ Hán được đánh dấu là tiếng Trung | A11y | Bật trình đọc màn hình thật (VoiceOver hoặc NVDA, máy có giọng đọc tiếng Trung), đọc lần lượt thẻ "你好" của F1 | "你好" và "你好，老师！" được đọc bằng giọng tiếng Trung; nghĩa "xin chào", "Chào thầy/cô!" được đọc bằng giọng tiếng Việt | không |
| TC-S10.1-AC1-20 | S10.1-AC1 Khổ 375 px không cuộn ngang | Mobile 375 | Đặt khổ màn 375×812, mở bài mẫu F5 | Màn không cuộn ngang; đọc được đủ 20 chữ của câu ví dụ (xuống dòng nếu cần, không bị cắt); bốn điều khiển nằm trọn trong màn | e2e |

## Audio của thẻ khi offline

Case của Requirement "Audio của thẻ từ mới thuộc audio của chủ đề". Chạy trên bản build kiểm thử (có service worker, như khi xem PWA), bắt đầu khi chưa tải audio của chủ đề nào. "Chủ đề của
F1" là chủ đề chứa bài mẫu F1 trên Lộ trình của bản build kiểm thử.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-38 | S10.1-AC1 Đã tải chủ đề thì nghe thẻ offline được | Offline | Có mạng, trên Lộ trình bấm "Tải audio (…)" của chủ đề của F1, chờ khối hiện "Đã tải audio (…)"; tắt mạng; mở bài mẫu F1; ở thẻ "你好" bấm "Nghe", chờ phát xong; bấm "Nghe câu ví dụ" | Âm "你好" phát; âm câu "你好，老师！" phát; không lúc nào hiện "Không phát được audio." | e2e |
| TC-S10.1-AC1-39 | S10.1-AC1 Dung lượng tải của chủ đề gồm audio của thẻ | Chức năng | Điều kiện đầu: chưa tải audio của chủ đề nào; trong chủ đề của F1, từ "你好" và câu "你好，老师！" chỉ xuất hiện trên thẻ từ mới (không câu nào khác của chủ đề dùng hai audio này); `design.md` liệt kê từng file audio của chủ đề của F1 trên bản build kiểm thử kèm dung lượng (byte), trong đó có audio của từ "你好" và audio của câu "你好，老师！". Bước: có mạng, mở Lộ trình, đọc nút "Tải audio (…)" của chủ đề của F1. QA tự cộng dung lượng mọi file trong danh sách và đổi đơn vị theo luật S8.4 (1 KB = 1024 byte, 1 MB = 1024 KB, cùng cách làm tròn); cộng thêm một lần nữa nhưng bỏ hai audio của thẻ | Danh sách trong `design.md` có cả audio từ "你好" và audio câu "你好，老师！"; dung lượng trên nút đúng bằng tổng đã đổi của mọi file (gồm hai audio đó) và khác tổng đã đổi khi bỏ hai audio đó (nếu sau làm tròn hai tổng trùng nhau thì case không quyết được: báo dev chọn audio mẫu đủ lớn) | e2e |

## Kiểm tra nội dung

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-21 | S10.1-AC1 Câu ví dụ không chứa từ thì báo lỗi | Chức năng | Chạy kiểm tra nội dung trên bài lỗi có thẻ "谢谢" với câu ví dụ "你好，老师！" | Kiểm tra kết thúc không thành công; lỗi nêu tên bài và câu đó | không |
| TC-S10.1-AC1-22 | S10.1-AC1 Thẻ thiếu câu ví dụ thì báo lỗi | Chức năng | Chạy kiểm tra nội dung trên bài lỗi có thẻ không có câu ví dụ | Kiểm tra kết thúc không thành công; lỗi nêu tên bài và câu đó | không |
| TC-S10.1-AC1-23 | S10.1-AC1 Thẻ trỏ tới từ hoặc câu không có thì báo lỗi | Chức năng | Chạy kiểm tra nội dung trên hai bài lỗi: một bài có thẻ trỏ tới từ không có trong nội dung, một bài có thẻ trỏ tới câu ví dụ không có | Kiểm tra kết thúc không thành công; có lỗi riêng cho từng bài, mỗi lỗi nêu bài và câu | không |
| TC-S10.1-AC1-24 | S10.1-AC1 Thẻ hợp lệ thì qua; S10.1-AC1 Bài có câu chấm điểm và câu không chấm điểm thì qua | Chức năng | Chạy kiểm tra nội dung trên bài học thường gồm thẻ "你好" với câu ví dụ "你好，老师！" và một câu chọn thanh | Không có lỗi nào cho bài đó | không |
| TC-S10.1-AC1-25 | S10.1-AC1 Bài kiểm tra có câu không chấm điểm thì báo lỗi | Chức năng | Chạy kiểm tra nội dung trên một bài kiểm tra cuối chủ đề có một thẻ từ mới (hợp lệ về từ và câu ví dụ) | Kiểm tra kết thúc không thành công; lỗi nêu bài đó | không |
| TC-S10.1-AC1-26 | S10.1-AC1 Bài chỉ có câu không chấm điểm thì báo lỗi | Chức năng | Chạy kiểm tra nội dung trên một bài học thường chỉ gồm 2 thẻ từ mới (hợp lệ về từ và câu ví dụ) | Kiểm tra kết thúc không thành công; lỗi nêu bài đó | không |

## Hồi quy (không có Scenario riêng)

Hai case dưới không ứng với Scenario nào; chúng kiểm điều proposal cam kết ở mục "Dữ liệu nghiệm thu" (bài mẫu chỉ có trong bản build
kiểm thử, nội dung phát hành không có thẻ từ mới) và bảo đảm luật kiểm tra nội dung mới không chặn nội dung đang phát hành.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.1-AC1-27 | Hồi quy: luật kiểm tra mới không chặn nội dung phát hành, bài mẫu không bị quét | Biên | Chạy lệnh kiểm tra nội dung của dự án như CI chạy, không trỏ tới bài lỗi nào | Kiểm tra thành công, không có lỗi nào; kết quả không nhắc tới bài mẫu F1–F5 hay bài lỗi mẫu nào | không |
| TC-S10.1-AC1-35 | Hồi quy: bản build phát hành không có bài mẫu | Biên | Mở bản build phát hành, xem toàn bộ Lộ trình | Lộ trình chỉ có các bài của nội dung phát hành, như trước S10.1; không có bài mẫu F1–F5 hay bài nào có thẻ từ mới | không |
