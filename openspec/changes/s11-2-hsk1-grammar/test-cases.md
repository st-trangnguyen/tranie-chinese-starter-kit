# Test cases: S11.2 Ngữ pháp HSK 1

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Kiểm tra nội dung**: lệnh kiểm tra nội dung chuẩn của repo (`pnpm content:check`), chạy lại trên mọi PR ở CI. "Kết thúc không thành
  công" = lệnh báo lỗi và CI đỏ; "kết thúc thành công" = không có lỗi, CI xanh.
- **Ba luật của S11.2** trong kiểm tra nội dung: **luật danh sách chuẩn** (danh sách 48 điểm), **luật độ phủ ngữ pháp** (điểm nào đã có
  trong bài "Ngữ pháp"), **luật điểm của thẻ** (thẻ ngữ pháp dạy điểm có trong danh sách chuẩn, thẻ trong bài "Ngữ pháp" HSK 1 có ghi điểm).
- **Nội dung phát hành**: nội dung HSK 1 của PR code (15 chủ đề S11.1, mỗi chủ đề có bài "Ngữ pháp"), cùng danh sách chuẩn 48 điểm ngữ pháp
  cấp 1 (HSK 3.0, GF 0025-2021). Chỉ case trên nội dung phát hành mới xét kết quả của cả lệnh kiểm tra nội dung.
- **Nội dung mẫu**: bộ nội dung thử nhỏ do Dev dựng trong test (danh sách chuẩn 2, 3, 47 hoặc 48 điểm, vài chủ đề trên lộ trình, bài
  "Ngữ pháp" / "Hội thoại", bài giai đoạn Nhập môn, bài không nằm trên lộ trình, thẻ ngữ pháp ghi dạy điểm nào) đúng như mô tả trong từng
  Scenario. Case trên nội dung mẫu **chỉ chạy và kiểm đúng luật được nêu trong case**, không chạy cả lệnh kiểm tra nội dung (nội dung mẫu
  không đủ 48 điểm, 500 từ hay 15 chủ đề nên các luật khác chắc chắn báo lỗi và không thuộc case). Không sửa nội dung thật.
- **Điểm 1, 2, 3** trong nội dung mẫu: điểm có số thứ tự 1, 2, 3 của danh sách chuẩn mẫu, mỗi điểm có tên riêng để đối chiếu thông báo lỗi.

**Cột Tự động**: toàn bộ Scenario của S11.2 là luật kiểm tra nội dung, không có luồng người học mới, nên không case nào là `e2e`. `không` ở
đây = Dev phủ bằng Vitest (tên test chứa ID và tên Scenario), QA đối chiếu khi nghiệm thu bằng cách xem test có trong bộ test và check CI
xanh (xem "Ghi chú").

## Độ phủ ngữ pháp cấp 1

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.2-AC1-1 | S11.2-AC1 Nội dung phát hành phủ đủ ngữ pháp cấp 1 | Chức năng | Trên nội dung phát hành, chạy kiểm tra nội dung | Kiểm tra kết thúc thành công; không có lỗi nào báo điểm ngữ pháp cấp 1 còn thiếu | không |
| TC-S11.2-AC1-2 | S11.2-AC1 Nội dung phát hành phủ đủ ngữ pháp cấp 1 | Chức năng | Đối chiếu kết quả độ phủ của nội dung phát hành (test chạy trên nội dung phát hành thật, hoặc kết quả kiểm tra nội dung trên CI) với danh sách chuẩn | Đủ 48 điểm, điểm nào cũng có ít nhất một thẻ ngữ pháp nằm trong bài "Ngữ pháp" của một chủ đề HSK 1 trên lộ trình | không |
| TC-S11.2-AC1-3 | S11.2-AC1 Nội dung phát hành phủ đủ ngữ pháp cấp 1 | Chức năng | Trên bản build, người học mới mở lộ trình HSK 1, vào bài "Ngữ pháp" của 2–3 chủ đề bất kỳ (QA tự chọn, ghi lại chủ đề đã mở), đi qua các câu | Mỗi bài "Ngữ pháp" đã mở có ít nhất một thẻ ngữ pháp hiện đủ tiêu đề, phần "Giải thích", cấu trúc và ví dụ có nút nghe (hiển thị theo S10.5) | không |
| TC-S11.2-AC1-4 | S11.2-AC1 Nội dung mẫu phủ đủ thì luật độ phủ không báo lỗi | Chức năng | Chạy luật độ phủ ngữ pháp trên nội dung mẫu: danh sách chuẩn 3 điểm, mỗi điểm có một thẻ trong bài "Ngữ pháp" của một chủ đề trên lộ trình, điểm 2 được dạy ở hai chủ đề | Luật độ phủ ngữ pháp không báo lỗi nào (điểm 2 dạy hai lần không bị báo) | không |
| TC-S11.2-AC1-5 | S11.2-AC1 Thiếu điểm thì luật độ phủ báo đủ các điểm thiếu | Chức năng | Chạy luật độ phủ ngữ pháp trên nội dung mẫu: danh sách chuẩn 3 điểm, chỉ điểm 1 có thẻ trong bài "Ngữ pháp" | Luật độ phủ ngữ pháp báo lỗi nêu đủ điểm 2 và điểm 3, mỗi điểm kèm số thứ tự và tên; lỗi không nêu điểm 1 | không |
| TC-S11.2-AC1-6 | S11.2-AC1 Điểm chỉ có trong bài loại khác thì không tính | Chức năng | Chạy luật độ phủ ngữ pháp trên nội dung mẫu: danh sách chuẩn 3 điểm, điểm 3 chỉ được dạy bằng thẻ ngữ pháp trong bài "Hội thoại" của một chủ đề trên lộ trình, điểm 1 và 2 có trong bài "Ngữ pháp" | Luật độ phủ ngữ pháp báo lỗi nêu điểm 3 (số thứ tự, tên) còn thiếu; lỗi không nêu điểm 1, 2 | không |
| TC-S11.2-AC1-7 | S11.2-AC1 Điểm chỉ có trong bài không nằm trên lộ trình thì không tính | Chức năng | Chạy luật độ phủ ngữ pháp trên nội dung mẫu: danh sách chuẩn 3 điểm, điểm 3 chỉ được dạy bằng thẻ ngữ pháp trong một bài không nằm trên lộ trình, điểm 1 và 2 có trong bài "Ngữ pháp" của chủ đề trên lộ trình | Luật độ phủ ngữ pháp báo lỗi nêu điểm 3 (số thứ tự, tên) còn thiếu; lỗi không nêu điểm 1, 2 | không |

## Danh sách chuẩn 48 điểm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.2-AC1-8 | S11.2-AC1 Danh sách chuẩn phát hành có 48 điểm | Chức năng | Trên nội dung phát hành, chạy kiểm tra nội dung; mở danh sách chuẩn điểm ngữ pháp cấp 1 | Kiểm tra không báo lỗi nào về danh sách chuẩn; danh sách có đúng 48 điểm, số thứ tự liền nhau từ 1 đến 48 (không trùng, không nhảy số), điểm nào cũng có tên | không |
| TC-S11.2-AC1-9 | S11.2-AC1 Danh sách thiếu điểm thì báo lỗi | Biên | Chạy luật danh sách chuẩn trên danh sách mẫu 47 điểm, số thứ tự từ 1 đến 47, đủ tên | Luật danh sách chuẩn báo lỗi nêu danh sách có 47 điểm, cần 48 | không |
| TC-S11.2-AC1-10 | S11.2-AC1 Danh sách trùng số thứ tự thì báo lỗi | Biên | Chạy luật danh sách chuẩn trên danh sách mẫu 48 điểm đủ tên, hai điểm cùng số thứ tự 5 (không có số 6) | Luật danh sách chuẩn báo lỗi nêu số thứ tự 5 bị trùng | không |
| TC-S11.2-AC1-11 | S11.2-AC1 Danh sách nhảy số thì báo lỗi | Biên | Chạy luật danh sách chuẩn trên danh sách mẫu 48 điểm đủ tên, số thứ tự từ 1 đến 47 và 50 | Luật danh sách chuẩn báo lỗi nêu số thứ tự 50 nằm ngoài 1–48 và thiếu số 48 | không |
| TC-S11.2-AC1-12 | S11.2-AC1 Điểm thiếu tên thì báo lỗi | Biên | Chạy luật danh sách chuẩn trên danh sách mẫu 48 điểm, số thứ tự từ 1 đến 48, điểm số 7 để trống tên | Luật danh sách chuẩn báo lỗi nêu điểm số 7 thiếu tên | không |

## Thẻ gắn với điểm chuẩn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.2-AC1-13 | S11.2-AC1 Thẻ dạy hai điểm chuẩn thì cả hai được tính | Chức năng | Chạy luật độ phủ ngữ pháp và luật điểm của thẻ trên nội dung mẫu: danh sách chuẩn 2 điểm, một thẻ duy nhất trong bài "Ngữ pháp" của chủ đề trên lộ trình ghi dạy cả điểm 1 và điểm 2 | Luật độ phủ ngữ pháp không báo điểm nào còn thiếu; luật điểm của thẻ không báo lỗi nào | không |
| TC-S11.2-AC1-14 | S11.2-AC1 Thẻ trong bài Ngữ pháp dạy điểm không có trong danh sách thì báo lỗi | Biên | Chạy luật điểm của thẻ trên nội dung mẫu: danh sách chuẩn 3 điểm, một thẻ trong bài "Ngữ pháp" của chủ đề HSK 1 ghi dạy điểm số 99 | Luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó, và điểm số 99 không có trong danh sách chuẩn | không |
| TC-S11.2-AC1-15 | S11.2-AC1 Thẻ trong bài Hội thoại dạy điểm không có trong danh sách thì báo lỗi | Biên | Chạy luật điểm của thẻ trên nội dung mẫu: danh sách chuẩn 3 điểm, một thẻ trong bài "Hội thoại" của chủ đề HSK 1 ghi dạy điểm số 99 | Luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó, và điểm số 99 không có trong danh sách chuẩn | không |
| TC-S11.2-AC1-16 | S11.2-AC1 Nội dung phát hành không có thẻ dạy điểm lạ | Chức năng | Trên nội dung phát hành, chạy kiểm tra nội dung | Luật điểm của thẻ không báo lỗi nào (không có thẻ dạy điểm ngoài danh sách chuẩn, không có thẻ trong bài "Ngữ pháp" HSK 1 thiếu điểm) | không |
| TC-S11.2-AC1-17 | S11.2-AC1 Thẻ trong bài Ngữ pháp không dạy điểm nào thì báo lỗi | Biên | Chạy luật điểm của thẻ trên nội dung mẫu: một thẻ trong bài "Ngữ pháp" của chủ đề HSK 1 không ghi dạy điểm chuẩn nào | Luật điểm của thẻ báo lỗi nêu bài và câu của thẻ đó | không |
| TC-S11.2-AC1-18 | S11.2-AC1 Thẻ ngoài bài Ngữ pháp không ghi điểm thì không báo lỗi | Biên | Chạy luật điểm của thẻ trên nội dung mẫu: một thẻ trong bài "Hội thoại" của chủ đề HSK 1 và một thẻ trong bài của giai đoạn Nhập môn, cả hai không ghi dạy điểm chuẩn nào | Luật điểm của thẻ không báo lỗi nào | không |

## Ghi chú cho QA và Dev

- Mọi Scenario đều cùng ID `S11.2-AC1` (story có một AC), nên số thứ tự trong ID case chạy liên tục -1 → -18.
- **TC-S11.2-AC1-4 → -7, -9 → -15, -17, -18**: Dev phủ bằng Vitest cho đúng luật nêu trong case với nội dung mẫu, mỗi Scenario một test có
  tên chứa ID và tên Scenario. QA không sửa nội dung thật để dựng các trường hợp lỗi; khi nghiệm thu chỉ cần (a) thấy test tương ứng có trong
  bộ test, (b) đọc thông báo lỗi mà test khẳng định khớp cột "Kết quả mong đợi" (nêu số thứ tự và tên điểm, nêu bài và câu của thẻ), (c) CI
  xanh.
- **TC-S11.2-AC1-1, -2, -8, -16** chạy trên nội dung phát hành: CI chạy kiểm tra nội dung trên mọi PR, QA xem check CI của PR code và test
  chạy trên nội dung phát hành thật (proposal mục Impact). Một lần chạy kiểm tra nội dung có thể dùng làm bằng chứng cho cả bốn case.
- **TC-S11.2-AC1-3** là lớp đối chiếu duy nhất trên giao diện: chỉ kiểm nội dung ngữ pháp đã xuất hiện trong bài "Ngữ pháp"; cách thẻ hiện,
  nút nghe ví dụ, pinyin, A11y, Mobile 375, Sáng/Tối của thẻ ngữ pháp thuộc S10.5, không lặp ở đây. Để tới được bài "Ngữ pháp" của chủ đề sau,
  QA có thể cần làm các bài trước theo quy tắc mở khóa của lộ trình.
- **Ngoài phạm vi test**: độ chính xác sư phạm của giải thích tiếng Việt và cách chọn chủ đề cho từng điểm (nhóm ngoại lệ nội dung thuần, người
  soạn review trong PR code); kiểm tra "không thiếu audio nào" của toàn HSK 1 (S11.5); thứ tự dạy, số điểm mỗi bài (đã ghi "Không làm").
