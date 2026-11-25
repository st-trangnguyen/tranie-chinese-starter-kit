# Test cases: S10.2 Nghe chọn chữ / Nhìn chữ chọn nghĩa

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/word-recognition/spec.md`. Nhiều
Scenario dùng chung ID `S10.2-AC1` / `S10.2-AC2`, nên cột Scenario ghi thêm tên Scenario và số TC chạy liên tục trong mỗi AC. Các quyết
định `ba` đề xuất trong Open Questions của proposal được dùng nguyên văn; nếu người thật chốt khác thì sửa case tương ứng. Case không gắn
với một Scenario riêng (A11y, Mobile 375, Sáng/Tối) nằm ở mục cuối "Case mở rộng", cột Scenario ghi Requirement liên quan.

**Điều kiện đầu chung**

- Chạy trên **bản build dành cho e2e** (proposal, mục "Nghiệm thu"): chỉ bản này có các bài mẫu dưới đây. Bản build người dùng thật không
  có bài mẫu nào và lộ trình không đổi. Cách mở từng bài mẫu trên bản build e2e (đặt ở đầu lộ trình của bản e2e, hoặc e2e nạp nội dung /
  tiến độ mẫu) do dev ghi rõ trong mô tả PR code; case không đi qua luật mở khóa của lộ trình.
- Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong màn chào mừng, chưa có thẻ ôn tập nào, công tắc "Hiện pinyin" trong Cài
  đặt và công tắc "Nghe chậm" đang tắt, có mạng, trừ khi case nêu khác.
- **Từ dùng trong case** (như spec): "你好" (nǐ hǎo, "xin chào"), "谢谢" (xièxie, "cảm ơn; cảm ơn bạn"), "再见" (zàijiàn, "tạm biệt"),
  và **từ thứ tư** do dev chọn (có chữ Hán, pinyin, nghĩa khác ba từ trên, không chung nghĩa nào với chúng), chỉ dùng cho câu 4 lựa chọn.
- **Bài mẫu trên bản build e2e** (tên người học thấy ghi trong mô tả PR code; e2e và chạy tay dùng chung):
  - **Bài mẫu NC** (bài học thường): câu NC1 nghe chọn chữ, đáp án "你好", lựa chọn "你好", "谢谢", "再见"; câu NC2 nghe chọn chữ, đáp án
    "谢谢", **2** lựa chọn "谢谢", "再见"; câu NC3 nhìn chữ chọn nghĩa, đáp án "再见", **4** lựa chọn "你好", "谢谢", "再见", từ thứ tư.
  - **Bài mẫu NN** (bài học thường): câu NN1 nhìn chữ chọn nghĩa, đáp án "你好", lựa chọn "你好", "谢谢", "再见"; câu NN2 nhìn chữ chọn
    nghĩa, đáp án "谢谢", cùng ba lựa chọn đó.
  - **Bài mẫu H1** (bài học thường): **chỉ** một câu nghe chọn chữ, đáp án "你好", lựa chọn "你好", "谢谢", "再见".
  - **Bài kiểm tra mẫu K1** (bài kiểm tra cuối chủ đề): **chỉ** một câu nhìn chữ chọn nghĩa, đáp án "你好", lựa chọn "你好", "谢谢", "再见".
- **Bộ nội dung lỗi mẫu** (chỉ dùng cho kiểm tra nội dung, không nằm trong bản build nào): mỗi trường hợp ở mục "Kiểm tra nội dung" bên dưới
  là một câu riêng trong bài riêng; dev ghi tên bài và số câu của từng trường hợp trong mô tả PR code. Bộ này cần có các từ "他" (tā),
  "她" (tā), "妈" (mā), "马" (mǎ), một từ không có nghĩa tiếng Việt nào, một từ có nghĩa chưa review, một từ chỉ có nghĩa "cảm ơn", một từ
  có nghĩa "cảm ơn " (dấu cách cuối), **cặp từ đa âm cùng chữ "地"**: một từ "地" đọc "dì" và một từ "地" đọc "de" (hai từ khác nhau,
  cùng chữ Hán), một từ có pinyin "Tā" (viết hoa; là từ khác, không phải "他"), và một từ có pinyin "nǐhǎo"
  (viết liền; là từ khác, không phải "你好").
- **"Nghe" / "có audio phát"**: e2e kiểm audio nào được phát, phát từ đầu, bao nhiêu lần; chạy tay nghe bằng tai (bật loa).
  **"Chưa có audio nào phát"**: không có âm thanh trong ít nhất 3 giây sau khi màn/kết quả hiện.
- **"Chấm đúng" / "chấm sai"**: màn hiện "Đúng" / "Sai" và nút "Tiếp tục" (S3.2).
- **"Không bị bỏ qua"**: màn hiện câu để làm, không có nút "Bỏ qua câu này" hay thông báo dạng bài chưa có.
- **"Vị trí lựa chọn"**: thứ tự từ trên xuống (hoặc trái sang phải) của các lựa chọn trên màn.
- **"Đọc thẻ từ phía test"** (chỉ e2e, như S9.1/S9.4): danh sách thẻ ôn tập đã lưu, mỗi thẻ có từ và chiều. Bản build không có màn ẩn
  để xem thẻ; QA chạy tay kiểm qua màn ôn tập (S9.2: "Thẻ 1 / N", từ của từng thẻ).
- **Ngưỡng nhìn rõ** (CLAUDE.md §7): chữ tương phản ≥ 4.5:1 với nền; viền focus ≥ 3:1; nút có vùng chạm ≥ 44×44 px.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code. `không` = QA chạy tay mỗi lần nghiệm thu, hoặc chỉ kiểm được bằng Vitest /
lệnh kiểm tra nội dung (ghi rõ trong cột Các bước).

Số TC mới thêm ở vòng 2 (TC-S10.2-AC1-33, TC-S10.2-AC2-22 tới TC-S10.2-AC2-24) nối tiếp số lớn nhất của mỗi AC để không đổi ID cũ, nên
nằm xen giữa bảng theo Requirement chứ không theo thứ tự số.

## Dạng nghe: nghe audio rồi chọn chữ đúng

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-1 | S10.2-AC1 Câu nghe chọn chữ hiện nút Nghe và các chữ lựa chọn | Chức năng | Mở bài mẫu NC, tới câu NC1, không bấm gì, chờ 3 giây | Có nút "Nghe" và công tắc "Nghe chậm"; đúng 3 lựa chọn ghi "你好", "谢谢", "再见" (thứ tự bất kỳ); chưa có audio nào phát | e2e |
| TC-S10.2-AC1-2 | S10.2-AC1 Bấm Nghe phát âm của từ đáp án | Chức năng | Ở câu NC1 bấm "Nghe" một lần; sau khi phát xong bấm "Nghe" lần nữa | Mỗi lần bấm, audio của "你好" phát một lần từ đầu; không phát audio của "谢谢" hay "再见"; nghe lại không giới hạn | e2e |
| TC-S10.2-AC1-3 | S10.2-AC1 Bấm Nghe phát âm của từ đáp án | Biên | Ở câu NC1 bật "Nghe chậm" rồi bấm "Nghe" | Audio "你好" phát ở tốc độ chậm (như S4.4); công tắc cho biết đang bật | e2e |
| TC-S10.2-AC1-4 | S10.2-AC1 Bấm Nghe phát âm của từ đáp án | Biên | Giả lập audio của "你好" không phát được (e2e chặn file audio đó), ở câu NC1 bấm "Nghe" | Màn hiện thông báo không phát được audio (như S4.4); các lựa chọn vẫn chọn được | e2e |
| TC-S10.2-AC1-5 | S10.2-AC1 Chọn đúng chữ | Chức năng | Ở câu NC1 chọn "你好", chờ 3 giây | Chấm đúng; màn hiện "Đáp án đúng" kèm "你好", "nǐ hǎo" và "xin chào"; chưa có audio nào phát | e2e |
| TC-S10.2-AC1-6 | S10.2-AC1 Chọn sai chữ thì có giải thích | Chức năng | Ở câu NC1 chọn "谢谢", chờ 3 giây | Chấm sai; giải thích đúng từng chữ "Đáp án đúng: 你好 · nǐ hǎo · xin chào"; chưa có audio nào phát | e2e |
| TC-S10.2-AC1-7 | S10.2-AC1 Sau khi chấm vẫn nghe lại được | Chức năng | Ở câu NC1 chọn một lựa chọn bất kỳ, rồi bấm "Nghe" hai lần | Nút "Nghe" vẫn bấm được; mỗi lần bấm phát lại âm "你好" từ đầu | e2e |
| TC-S10.2-AC1-8 | S10.2-AC1 Câu nghe chọn chữ không còn bị bỏ qua | Chức năng | Mở bài mẫu NC và bài mẫu H1, đi lần lượt các câu nghe chọn chữ | Mỗi câu nghe chọn chữ không bị bỏ qua, làm được và chấm được | e2e |

## Dạng đọc: nhìn chữ rồi chọn nghĩa đúng

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC2-1 | S10.2-AC2 Câu nhìn chữ chọn nghĩa hiện chữ và các nghĩa lựa chọn | Chức năng | Mở bài mẫu NN, tới câu NN1, không bấm gì | Màn hiện chữ "你好"; đúng 3 lựa chọn ghi "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt" (thứ tự bất kỳ, nghĩa của "谢谢" đúng thứ tự đã soạn) | e2e |
| TC-S10.2-AC2-2 | S10.2-AC2 Chọn đúng nghĩa | Chức năng | Ở bài mẫu NN, làm câu NN1 rồi bấm "Tiếp tục" tới câu NN2 (đáp án "谢谢", lựa chọn là ba từ "你好", "谢谢", "再见"); kiểm câu hiện chữ "谢谢" và đúng 3 lựa chọn ghi "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt"; chọn "cảm ơn; cảm ơn bạn" | Chấm đúng; màn hiện "Đáp án đúng" kèm "谢谢", "xièxie" và "cảm ơn; cảm ơn bạn" | e2e |
| TC-S10.2-AC2-3 | S10.2-AC2 Chọn sai nghĩa thì có giải thích | Chức năng | Ở câu NN1 chọn "tạm biệt" | Chấm sai; giải thích đúng từng chữ "Đáp án đúng: 你好 · nǐ hǎo · xin chào" | e2e |
| TC-S10.2-AC2-4 | S10.2-AC2 Sau khi chấm có nút Nghe nhưng không tự phát | Chức năng | Ở câu NN1 chọn một lựa chọn bất kỳ, chờ 3 giây, rồi bấm "Nghe" | Sau khi chấm màn có nút "Nghe"; trong 3 giây chưa có audio nào phát; bấm "Nghe" thì phát âm "你好" | e2e |
| TC-S10.2-AC2-5 | S10.2-AC2 Câu nhìn chữ chọn nghĩa không còn bị bỏ qua | Chức năng | Mở bài mẫu NN, bài mẫu NC (câu NC3) và bài kiểm tra mẫu K1, đi lần lượt các câu nhìn chữ chọn nghĩa | Mỗi câu nhìn chữ chọn nghĩa không bị bỏ qua, làm được và chấm được, cả trong bài học thường và bài kiểm tra | e2e |

## Trước khi chấm không lộ đáp án, sau khi chấm hiện đáp án đầy đủ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-9 | S10.2-AC1 Tắt "Hiện pinyin" vẫn hiện pinyin trong đáp án sau khi chấm | Chức năng | Vào Cài đặt, kiểm công tắc "Hiện pinyin" đang tắt; mở bài mẫu NC, ở câu NC1 chọn "谢谢" | Màn hiện "Đáp án đúng" kèm "你好", "nǐ hǎo" và "xin chào" | e2e |
| TC-S10.2-AC2-6 | S10.2-AC2 Bật "Hiện pinyin" vẫn không lộ pinyin trước khi chấm | Chức năng | Bật "Hiện pinyin" trong Cài đặt; mở bài mẫu NN, tới câu NN1, không chọn gì | Màn không hiện "nǐ hǎo" hay pinyin nào | e2e |
| TC-S10.2-AC2-7 | S10.2-AC2 Bật "Hiện pinyin" vẫn không lộ pinyin trước khi chấm | Biên | Bật "Hiện pinyin" trong Cài đặt; ở câu NN1 chọn "xin chào" | Sau khi chấm vẫn hiện "Đáp án đúng" kèm "你好", "nǐ hǎo", "xin chào" như khi công tắc tắt (công tắc không đổi gì sau khi chấm) | e2e |
| TC-S10.2-AC1-10 | S10.2-AC1 Chưa chọn thì chưa lộ đáp án | Chức năng | Mở bài mẫu NC, tới câu NC1, không chọn gì | Màn không có "nǐ hǎo", "xin chào", "xièxie", "cảm ơn", "zàijiàn", "tạm biệt"; chỉ có một nút nghe, lựa chọn không có nút nghe riêng | e2e |
| TC-S10.2-AC1-11 | S10.2-AC1 Chưa chọn thì chưa lộ đáp án | Biên | Bật "Hiện pinyin" trong Cài đặt; mở bài mẫu NC, tới câu NC1, không chọn gì | Vẫn không có pinyin hay nghĩa nào trên màn (công tắc "Hiện pinyin" không áp dụng cho dạng này) | e2e |
| TC-S10.2-AC2-8 | S10.2-AC2 Chưa chọn thì chưa lộ pinyin | Chức năng | Mở bài mẫu NN, tới câu NN1, không chọn gì, chờ 3 giây | Màn không có "nǐ hǎo"; không có nút "Nghe"; chưa có audio nào phát | e2e |

## Lựa chọn do người soạn khai báo

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-12 | S10.2-AC1 Câu nghe chọn chữ có 2 lựa chọn | Biên | Mở bài mẫu NC, làm câu NC1, bấm "Tiếp tục" tới câu NC2 | Câu NC2 hiện đúng 2 lựa chọn "谢谢", "再见"; chọn "谢谢" thì chấm đúng | e2e |
| TC-S10.2-AC2-9 | S10.2-AC2 Câu nhìn chữ chọn nghĩa có 4 lựa chọn | Biên | Mở bài mẫu NC, làm tới câu NC3 | Màn hiện chữ "再见" và đúng 4 lựa chọn: "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt" và nghĩa của từ thứ tư; chọn "tạm biệt" thì chấm đúng | e2e |

## Thứ tự lựa chọn xáo khi câu hiện và giữ nguyên tới khi rời câu

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-13 | S10.2-AC1 Thứ tự lựa chọn câu nghe chọn chữ không cố định | Chức năng | Cho câu NC1 hiện 20 lần (làm hết bài mẫu NC rồi học lại bài), mỗi lần ghi vị trí của "你好" | "你好" không ở cùng một vị trí trong cả 20 lần; mỗi lần vẫn đủ đúng 3 lựa chọn | e2e |
| TC-S10.2-AC2-10 | S10.2-AC2 Thứ tự lựa chọn câu nhìn chữ chọn nghĩa không cố định | Chức năng | Cho câu NN1 hiện 20 lần (làm hết bài mẫu NN rồi học lại bài), mỗi lần ghi vị trí của "xin chào" | "xin chào" không ở cùng một vị trí trong cả 20 lần; mỗi lần vẫn đủ đúng 3 lựa chọn | e2e |
| TC-S10.2-AC1-14 | S10.2-AC1 Thứ tự giữ nguyên khi bấm Nghe và sau khi chấm | Chức năng | Mở câu NC1, ghi vị trí của ba lựa chọn; bấm "Nghe", ghi lại; bật "Nghe chậm", bấm "Nghe", ghi lại; chọn "谢谢", ghi lại sau khi chấm | Ở mọi lần ghi, "你好", "谢谢", "再见" ở đúng vị trí như lúc câu vừa hiện | e2e |
| TC-S10.2-AC2-11 | S10.2-AC2 Thứ tự giữ nguyên sau khi chấm | Chức năng | Mở câu NN1, ghi vị trí của ba lựa chọn; chọn "tạm biệt", ghi lại sau khi chấm; bấm "Nghe", ghi lại | Ở mọi lần ghi, "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt" ở đúng vị trí như lúc câu vừa hiện | e2e |
| TC-S10.2-AC1-15 | S10.2-AC1 Mở lại bài đang dở thì câu hiện như mới | Chức năng | Mở bài mẫu NC, tới câu NC1, bấm "Nghe" nhưng không chọn; thoát bài; mở lại bài mẫu NC | Màn hiện lại câu NC1 ở trạng thái chưa trả lời (không có "Đúng"/"Sai", lựa chọn bấm được), đủ 3 lựa chọn "你好", "谢谢", "再见" | e2e |
| TC-S10.2-AC1-16 | S10.2-AC1 Mở lại bài đang dở thì câu hiện như mới | Chức năng | Lặp 20 lần: ở câu NC1 chưa trả lời, ghi vị trí của "你好", thoát bài, mở lại bài mẫu NC | Vị trí của "你好" không giống nhau trong cả 20 lần mở lại (thứ tự được xáo mới, không giữ thứ tự lần trước) | e2e |
| TC-S10.2-AC2-22 | S10.2-AC2 Mở lại bài đang dở thì câu nhìn chữ chọn nghĩa hiện như mới | Chức năng | Mở bài mẫu NN, tới câu NN1, không chọn gì; thoát bài; mở lại bài mẫu NN | Màn hiện lại câu NN1 ở trạng thái chưa trả lời (chữ "你好", không có "Đúng"/"Sai", không có "nǐ hǎo", không có nút "Nghe", lựa chọn bấm được), đủ 3 lựa chọn "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt" | e2e |
| TC-S10.2-AC2-23 | S10.2-AC2 Mở lại bài đang dở thì câu nhìn chữ chọn nghĩa hiện như mới | Chức năng | Lặp 20 lần: ở câu NN1 chưa trả lời, ghi vị trí của "xin chào", thoát bài, mở lại bài mẫu NN | Vị trí của "xin chào" không giống nhau trong cả 20 lần mở lại (thứ tự được xáo mới, không giữ thứ tự lần trước) | e2e |

## Chọn xong thì khóa lựa chọn và dùng được bằng bàn phím

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-17 | S10.2-AC1 Chọn xong thì khóa lựa chọn | Chức năng | Ở câu NC1 chọn "谢谢", rồi bấm "你好" và "再见" | Các lựa chọn bị khóa (không bấm được); vẫn là "Sai" với cùng giải thích; không có kết quả mới | e2e |
| TC-S10.2-AC2-12 | S10.2-AC2 Chọn xong thì khóa lựa chọn | Chức năng | Ở câu NN1 chọn "xin chào", rồi bấm "tạm biệt" | Các lựa chọn bị khóa; vẫn là "Đúng"; không đổi thành "Sai" | e2e |
| TC-S10.2-AC1-18 | S10.2-AC1 Chọn bằng bàn phím | A11y | Ở câu NC1 chỉ dùng phím Tab tới lựa chọn "你好" rồi nhấn Enter | Mỗi lựa chọn nhận focus theo thứ tự, viền focus nhìn thấy; nhấn Enter ở "你好" thì chấm đúng | e2e |
| TC-S10.2-AC1-19 | S10.2-AC1 Chọn bằng bàn phím | A11y | Ở câu NC1 chỉ dùng bàn phím: Tab tới "Nghe", nhấn Enter; Tab tới "你好", nhấn Space | "Nghe" phát âm "你好"; nhấn Space ở "你好" thì chấm đúng; viền focus nhìn thấy ở mọi nút | không |
| TC-S10.2-AC2-13 | S10.2-AC2 Chọn bằng bàn phím | A11y | Ở câu NN1 chỉ dùng phím Tab tới lựa chọn "xin chào" rồi nhấn Enter | Mỗi lựa chọn nhận focus theo thứ tự, viền focus nhìn thấy; nhấn Enter ở "xin chào" thì chấm đúng | e2e |

## Sau khi chấm, lựa chọn được đánh dấu bằng chữ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-20 | S10.2-AC1 Chọn sai thì đáp án và lựa chọn đã chọn đều có nhãn | Chức năng | Ở câu NC1 chọn "谢谢" | Lựa chọn "你好" có nhãn chữ "Đáp án đúng"; lựa chọn "谢谢" có nhãn chữ "Đã chọn"; lựa chọn "再见" không có nhãn | e2e |
| TC-S10.2-AC1-21 | S10.2-AC1 Chọn đúng thì chỉ lựa chọn đó có nhãn | Chức năng | Ở câu NC1 chọn "你好" | Lựa chọn "你好" có nhãn chữ "Đáp án đúng"; không lựa chọn nào có nhãn "Đã chọn"; "谢谢", "再见" không có nhãn | e2e |
| TC-S10.2-AC2-14 | S10.2-AC2 Chọn sai nghĩa thì đáp án và lựa chọn đã chọn đều có nhãn | Chức năng | Ở câu NN1 chọn "tạm biệt" | Lựa chọn "xin chào" có nhãn chữ "Đáp án đúng"; lựa chọn "tạm biệt" có nhãn chữ "Đã chọn"; lựa chọn "cảm ơn; cảm ơn bạn" không có nhãn | e2e |

## Kiểm tra nội dung

Các case dưới đây chạy lệnh kiểm tra nội dung của repo trên **bộ nội dung lỗi mẫu**, không phải trên app. Vitest của PR code kiểm từng
trường hợp; QA chạy lệnh một lần để xem báo lỗi đọc được và chỉ đúng bài, câu.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-22 | S10.2-AC1 Đáp án không nằm trong lựa chọn thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nghe chọn chữ đáp án "你好", lựa chọn "谢谢", "再见" | Báo lỗi, chỉ rõ bài và số câu của câu đó; kiểm tra không thành công; nội dung không được ghi ra | không |
| TC-S10.2-AC1-23 | S10.2-AC1 Số lựa chọn ngoài khoảng 2 đến 4 thì bị báo lỗi | Biên | Chạy kiểm tra nội dung trên câu nghe chọn chữ 1 lựa chọn, câu nghe chọn chữ 5 lựa chọn, và trên nội dung bài mẫu NC | Câu 1 lựa chọn và câu 5 lựa chọn mỗi câu một lỗi, chỉ rõ bài và câu; câu NC2 (2 lựa chọn) và NC3 (4 lựa chọn) không bị báo lỗi | không |
| TC-S10.2-AC1-24 | S10.2-AC1 Lựa chọn trùng nhau thì bị báo lỗi | Biên | Chạy kiểm tra nội dung trên câu nghe chọn chữ có "谢谢" lặp hai lần, và câu nghe chọn chữ có hai từ khác nhau cùng chữ Hán (cặp "地" đọc "dì" / "地" đọc "de") | Mỗi câu một lỗi, chỉ rõ bài và câu; nội dung không được ghi ra | không |
| TC-S10.2-AC2-24 | S10.2-AC2 Từ nhiễu cùng chữ Hán với đáp án thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nhìn chữ chọn nghĩa có đáp án là từ "地" đọc "dì", lựa chọn gồm từ đó và từ "地" đọc "de" | Báo lỗi, chỉ rõ bài và câu; kiểm tra không thành công; nội dung không được ghi ra | không |
| TC-S10.2-AC1-25 | S10.2-AC1 Từ nhiễu đọc giống hệt đáp án thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nghe chọn chữ đáp án "他" (tā), lựa chọn "他", "她" (tā) | Báo lỗi, chỉ rõ bài và câu | không |
| TC-S10.2-AC1-33 | S10.2-AC1 Từ nhiễu chỉ khác chữ hoa/thường ở pinyin vẫn bị coi là đọc giống | Biên | Chạy kiểm tra nội dung trên câu nghe chọn chữ có đáp án pinyin "tā" và một lựa chọn khác có pinyin "Tā" | Báo lỗi, chỉ rõ bài và câu (coi là đọc giống nhau) | không |
| TC-S10.2-AC1-26 | S10.2-AC1 Từ nhiễu chỉ khác dấu cách ở pinyin vẫn bị coi là đọc giống | Biên | Chạy kiểm tra nội dung trên câu nghe chọn chữ có đáp án "你好" (pinyin "nǐ hǎo") và một lựa chọn khác có pinyin "nǐhǎo" | Báo lỗi, chỉ rõ bài và câu (coi là đọc giống nhau) | không |
| TC-S10.2-AC1-27 | S10.2-AC1 Từ nhiễu khác thanh điệu với đáp án thì hợp lệ | Chức năng | Chạy kiểm tra nội dung trên câu nghe chọn chữ đáp án "妈" (mā), lựa chọn "妈", "马" (mǎ) | Không có lỗi nào cho câu đó | không |
| TC-S10.2-AC1-28 | S10.2-AC1 Từ đáp án không có nghĩa thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nghe chọn chữ có đáp án là từ không có nghĩa tiếng Việt nào | Báo lỗi, chỉ rõ bài và câu | không |
| TC-S10.2-AC2-15 | S10.2-AC2 Hai lựa chọn trùng hệt nghĩa thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nhìn chữ chọn nghĩa có hai từ khác nhau cùng chỉ có nghĩa "cảm ơn" | Báo lỗi, chỉ rõ bài và câu | không |
| TC-S10.2-AC2-16 | S10.2-AC2 Hai lựa chọn có chung một nghĩa thì bị báo lỗi | Biên | Chạy kiểm tra nội dung trên câu nhìn chữ chọn nghĩa có lựa chọn "谢谢" ("cảm ơn", "cảm ơn bạn") và một từ khác có nghĩa "cảm ơn " (dấu cách cuối) | Báo lỗi, chỉ rõ bài và câu | không |
| TC-S10.2-AC2-17 | S10.2-AC2 Từ lựa chọn không có nghĩa thì bị báo lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nhìn chữ chọn nghĩa đáp án "你好", một từ lựa chọn khác không có nghĩa tiếng Việt nào | Báo lỗi, chỉ rõ bài và câu | không |
| TC-S10.2-AC2-18 | S10.2-AC2 Nghĩa chưa review không làm câu bị lỗi | Chức năng | Chạy kiểm tra nội dung trên câu nhìn chữ chọn nghĩa hợp lệ có một từ lựa chọn mang nghĩa chưa review | Không có lỗi cho câu đó; vẫn có cảnh báo nghĩa chưa review của từ đó | không |

## Từ của câu là từ đáp án

Cần code S9.1 (tạo thẻ khi học xong bài) có trước; TC-S10.2-AC2-19, TC-S10.2-AC2-20 cần thêm code S9.4 (câu sai trong bài kiểm tra vào ôn
tập). Chưa có thì ghi "không chạy được" kèm lý do khi nghiệm thu.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-29 | S10.2-AC1 Xong bài có câu nghe chọn chữ chỉ tạo thẻ cho từ đáp án | Chức năng | Chưa có thẻ nào; làm hết bài mẫu H1 (chọn đúng) tới màn tổng kết; đọc thẻ từ phía test | Có thẻ "你好" chiều nghĩa và "你好" chiều nghe; không có thẻ nào của "谢谢" hay "再见" | e2e |
| TC-S10.2-AC1-30 | S10.2-AC1 Xong bài có câu nghe chọn chữ chỉ tạo thẻ cho từ đáp án | Chức năng | Như TC-S10.2-AC1-29 nhưng QA chạy tay; xong bài, mở màn ôn tập, đi hết các thẻ | Phiên ôn tập có đúng 2 thẻ ("Thẻ 1 / 2"), cả hai là "你好"; không thẻ nào hiện "谢谢" hay "再见" | không |
| TC-S10.2-AC2-19 | S10.2-AC2 Câu nhìn chữ chọn nghĩa sai trong bài kiểm tra chỉ đưa từ đáp án vào ôn tập | Chức năng | Chưa có thẻ nào; mở bài kiểm tra mẫu K1, chọn "tạm biệt" (sai), làm tới màn tổng kết; đọc thẻ từ phía test | Có thẻ "你好" chiều nghĩa và "你好" chiều nghe; không có thẻ nào của "谢谢" hay "再见" | e2e |
| TC-S10.2-AC2-20 | S10.2-AC2 Câu nhìn chữ chọn nghĩa sai trong bài kiểm tra chỉ đưa từ đáp án vào ôn tập | Chức năng | Như TC-S10.2-AC2-19 nhưng QA chạy tay; xong bài kiểm tra, mở màn ôn tập, đi hết các thẻ | Không thẻ nào hiện "谢谢" hay "再见"; có thẻ "你好" | không |

## Case mở rộng (A11y, hiển thị)

Không gắn với một Scenario riêng; kiểm Requirement ghi ở cột Scenario theo chất lượng mặc định (CLAUDE.md §7).

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.2-AC1-31 | Mở rộng A11y: Requirement "Sau khi chấm, lựa chọn được đánh dấu bằng chữ" và "Chọn xong thì khóa lựa chọn và dùng được bằng bàn phím" | A11y | Bật trình đọc màn hình (VoiceOver/TalkBack), đi qua câu NC1 rồi câu NN1, mỗi câu chọn một lựa chọn sai | Nút nghe đọc là "Nghe"; mỗi lựa chọn đọc đúng chữ Hán / nghĩa ghi trên nó; sau khi chọn, trình đọc báo "Đúng"/"Sai", đọc được phần "Đáp án đúng", và đọc nhãn "Đáp án đúng" / "Đã chọn" kèm lựa chọn tương ứng; lựa chọn bị khóa được báo là không dùng được | không |
| TC-S10.2-AC2-21 | Mở rộng hiển thị: Requirement "Lựa chọn do người soạn khai báo" và "Sau khi chấm, lựa chọn được đánh dấu bằng chữ" | Mobile 375 | Khổ 375×812, mở bài mẫu NC tới câu NC3 (4 lựa chọn nghĩa), chọn một lựa chọn sai | Đủ 4 lựa chọn, chữ không bị cắt, không cuộn ngang; mỗi lựa chọn vùng chạm ≥ 44×44 px; nhãn "Đáp án đúng", "Đã chọn", giải thích "Đáp án đúng: …" và nút "Tiếp tục" đọc được hết | không |
| TC-S10.2-AC1-32 | Mở rộng hiển thị: Requirement "Sau khi chấm, lựa chọn được đánh dấu bằng chữ" và "Chọn xong thì khóa lựa chọn và dùng được bằng bàn phím" | Sáng/Tối | Ở chế độ sáng rồi tối: mở câu NC1, focus một lựa chọn bằng Tab, chọn sai; lặp lại với câu NN1 | Chữ Hán, nghĩa ở lựa chọn, lựa chọn đã khóa, nhãn "Đáp án đúng" / "Đã chọn", phần "Đáp án đúng" và giải thích đạt ngưỡng nhìn rõ ở cả hai chế độ; viền focus nhìn thấy; phân biệt được đáp án và lựa chọn đã chọn khi chỉ đọc nhãn chữ (không dựa vào màu) | không |
