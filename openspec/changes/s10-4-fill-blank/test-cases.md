# Test cases: S10.4 Điền chỗ trống

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Nơi chạy.** S10.4 không soạn bài thật có câu điền chỗ trống (proposal, mục "Không làm"). Theo quyết định nghiệm thu trong proposal (mục
Impact, tiền lệ S1.2/S8.4), mọi case trên màn bài chạy trên **bản build dành cho e2e**, bản này có một bài mẫu chứa câu điền chỗ trống
(gọi là **bài thử**); bản build thường không có bài này. Bài thử có các câu theo thứ tự:

| Câu | Kiểu | Câu hiện | Câu đầy đủ · pinyin · nghĩa | Đáp án | Lựa chọn (người soạn ghi) |
|---|---|---|---|---|---|
| A | Chọn | 我＿米饭 | 我吃米饭 · wǒ chī mǐfàn · Tôi ăn cơm | 吃 (chī) | 吃, 喝, 看 (màn hiện theo thứ tự xáo) |
| B | Gõ | 我＿米饭 | 我吃米饭 · wǒ chī mǐfàn · Tôi ăn cơm | 吃 (chī) | không có |
| C | Gõ | 我吃＿ | 我吃米饭 · wǒ chī mǐfàn · Tôi ăn cơm | 米饭 (mǐfàn) | không có |
| D | Gõ | 你好＿ | 你好吗 · nǐ hǎo ma · Bạn khỏe không | 吗 (ma, thanh nhẹ) | không có |

- **"Mở lại bài thử"**: đưa bài thử về câu A để làm lại một câu với câu trả lời khác. Thoát giữa chừng rồi vào lại **không** dùng được, vì
  bài đang dở mở lại đúng câu đang làm (S3.3). Cách làm: trả lời nốt các câu còn lại (đúng hay sai đều được), bấm "Tiếp tục" tới màn tổng
  kết, rồi mở bài thử lại từ bản đồ; màn phải hiện câu A, thanh tiến độ ở câu 1. Nếu bài thử chưa học lần nào (hồ sơ trình duyệt mới, hoặc đã xoá
  dữ liệu trang) thì mở bài thử là vào câu A luôn. Bản e2e có thể dùng phiên trình duyệt mới cho mỗi lần thay cho cách trên.
- **"Đi tới câu X"**: trả lời các câu đứng trước (đúng hay sai đều được) và bấm "Tiếp tục" cho tới khi câu X hiện.
- Thứ tự lựa chọn ở câu A được xáo mỗi lần câu hiện, nên các case gọi lựa chọn theo **chữ** ("吃", "喝", "看"), không theo vị trí.

**Điều kiện đầu chung:** bản build e2e có bài thử, "Hiện pinyin" (Cài đặt) đang **bật** (trừ khi case ghi khác), giao diện sáng, khổ
desktop 1280×800 (trừ case Mobile 375). Phần "Đúng"/"Sai"/"Tiếp tục" là của màn bài hiện có (S3.2), không kiểm lại ở đây ngoài việc nó hiện
ra.

**Case kiểm tra nội dung** (Requirement "Nội dung câu điền chỗ trống phải hợp lệ" và "Câu điền chỗ trống phải đủ chữ, pinyin và nghĩa")
chạy bằng lệnh kiểm tra nội dung trên một bản sao nội dung thử có sửa câu theo bước của case; không chạy trên màn hình. "Báo lỗi chỉ rõ bài
và câu" nghĩa là dòng lỗi nêu được bài nào và câu thứ mấy (hoặc tên câu) trong bài; "không ghi nội dung ra" nghĩa là kiểm tra kết thúc không
thành công và nội dung xuất bản không được cập nhật.

**Không có case Offline:** spec không nói gì riêng về mạng cho dạng câu này.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.4-AC1-1 | S10.4-AC1 Chọn đúng thì được chấm đúng ngay | Chức năng | Mở bài thử, ở câu A chạm "吃" | Câu được chấm "Đúng" ngay, không có nút "Kiểm tra" phải bấm; chỗ trống hiện "吃"; câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn"; ngay trên lựa chọn "吃" có nhãn "Đáp án đúng" (viết hoa chữ đầu); không lựa chọn nào có nhãn "Đã chọn"; "喝" và "看" không có nhãn; nút "Tiếp tục" hiện | e2e |
| TC-S10.4-AC1-2 | S10.4-AC1 Chọn sai thì được chấm sai và hiện đáp án | Chức năng | Mở bài thử, ở câu A chạm "喝" | Câu được chấm "Sai" ngay; chỗ trống hiện "吃" (không phải "喝"); câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn"; giải thích đúng nguyên văn "Đáp án đúng: 吃 · chī"; ngoài dòng giải thích đó, ngay trên lựa chọn "吃" có nhãn "Đáp án đúng", ngay trên lựa chọn "喝" có nhãn "Đã chọn", lựa chọn "看" không có nhãn (nhãn nằm trên lựa chọn, là chỗ khác với dòng giải thích) | e2e |
| TC-S10.4-AC1-3 | S10.4-AC1 Gõ chữ Hán đúng thì được chấm đúng | Chức năng | Mở bài thử, đi tới câu B, gõ "吃" rồi bấm "Kiểm tra" | Câu được chấm "Đúng"; chỗ trống hiện "吃"; câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn" | e2e |
| TC-S10.4-AC1-4 | S10.4-AC1 Gõ sai thì được chấm sai và hiện đáp án | Chức năng | Mở bài thử, đi tới câu B, gõ "喝" rồi nhấn Enter (không bấm "Kiểm tra") | Câu được chấm "Sai" sau khi nhấn Enter; giải thích đúng nguyên văn "Đáp án đúng: 吃 · chī"; chỗ trống hiện "吃", câu hiện kèm pinyin "wǒ chī mǐfàn" | e2e |
| TC-S10.4-AC1-5 | S10.4-AC1 Chấm xong thì khóa lựa chọn | Chức năng | Mở bài thử, ở câu A chạm "喝" (được chấm sai); ghi lại kết quả, dòng giải thích và nhãn trên từng lựa chọn; rồi chạm "吃", rồi chạm "看" | Sau mỗi lần chạm thêm, mọi thứ giữ y như lúc vừa chấm: vẫn "Sai", dòng giải thích vẫn "Đáp án đúng: 吃 · chī"; trên lựa chọn "吃" vẫn có nhãn "Đáp án đúng", trên "喝" vẫn có nhãn "Đã chọn", "看" vẫn không có nhãn (nhãn nằm trên lựa chọn, khác dòng giải thích); lựa chọn được chạm thêm không đổi trạng thái (không được đánh dấu là đã chọn) | e2e |
| TC-S10.4-AC1-6 | S10.4-AC1 Chấm xong thì khóa lựa chọn | A11y | Bật trình đọc màn hình (VoiceOver/TalkBack/NVDA). Mở bài thử, ở câu A chọn "吃" bằng bàn phím (Enter/Space); sau khi chấm, dùng Tab/phím mũi tên đi qua các lựa chọn và nhấn Enter/Space trên "喝" | Trình đọc màn hình đọc mỗi lựa chọn kèm trạng thái không dùng được (ví dụ "mờ", "không khả dụng", "dimmed"); nhấn Enter/Space trên "喝" không chấm lại, kết quả vẫn "Đúng", "喝" không có nhãn "Đã chọn" | không |
| TC-S10.4-AC1-7 | S10.4-AC1 Chấm xong thì khóa ô gõ | Chức năng | Mở bài thử, đi tới câu B, gõ "喝", nhấn Enter (được chấm sai); rồi bấm vào ô gõ, thử xoá và gõ "吃", nhấn Enter | Ô gõ không sửa được, vẫn hiện "喝"; nhấn Enter không chấm lại; kết quả vẫn "Sai" với giải thích "Đáp án đúng: 吃 · chī" | e2e |
| TC-S10.4-AC1-8 | S10.4-AC1 Câu điền chỗ trống không còn bị bỏ qua | Chức năng | Mở bài thử, làm lần lượt câu A, B, C, D đến hết bài | Cả bốn câu đều hiện để làm; không câu nào bị đánh dấu "bỏ qua vì dạng bài chưa có"; bài kết thúc như bài bình thường | e2e |
| TC-S10.4-AC1-9 | S10.4-AC1 Câu kiểu chọn hiện các lựa chọn, không có ô gõ | Chức năng | Mở bài thử, nhìn câu A khi chưa trả lời | Có đúng ba lựa chọn, đúng là "吃", "喝", "看" (thứ tự nào cũng được), mỗi chữ một lần; không có ô gõ, không có nút "Kiểm tra"; không có nút hay công tắc nào đổi sang kiểu gõ | e2e |
| TC-S10.4-AC1-10 | S10.4-AC1 Câu kiểu chọn hiện các lựa chọn, không có ô gõ | A11y | Ở câu A, chỉ dùng bàn phím: Tab tới từng lựa chọn, nhấn Enter hoặc Space trên "吃" | Mỗi lựa chọn nhận focus theo đúng thứ tự đang hiện trên màn, có viền focus nhìn thấy; nhấn Enter/Space chấm câu như khi chạm (được "Đúng") | không |
| TC-S10.4-AC1-11 | S10.4-AC1 Câu kiểu chọn hiện các lựa chọn, không có ô gõ | Mobile 375 | Ở khổ 375×812, mở câu A; đo kích thước từng lựa chọn bằng công cụ đo của trình duyệt | Câu, nghĩa và ba lựa chọn hiện đủ, không cuộn ngang; vùng chạm của mỗi lựa chọn ≥ 44×44 px và vùng chạm của các lựa chọn không chồng lên nhau | không |
| TC-S10.4-AC1-12 | S10.4-AC1 Câu kiểu gõ hiện ô gõ, không có lựa chọn | Chức năng | Mở bài thử, đi tới câu B, nhìn khi chưa trả lời | Có một ô gõ có nhãn và nút "Kiểm tra"; không có lựa chọn nào; không có nút hay công tắc nào đổi sang kiểu chọn | e2e |
| TC-S10.4-AC1-13 | S10.4-AC1 Câu kiểu gõ hiện ô gõ, không có lựa chọn | A11y | Ở câu B, dùng trình đọc màn hình và bàn phím: Tab tới ô gõ, rồi tới nút "Kiểm tra" | Trình đọc màn hình đọc nhãn có nghĩa cho ô gõ (không chỉ "ô nhập" hay "text field"); ô gõ và nút "Kiểm tra" đều có viền focus nhìn thấy | không |
| TC-S10.4-AC1-14 | S10.4-AC1 Câu kiểu gõ hiện ô gõ, không có lựa chọn | Mobile 375 | Ở khổ 375×812, mở câu B, chạm vào ô gõ để bàn phím ảo hiện | Ô gõ và nút "Kiểm tra" vẫn nhìn thấy (hoặc cuộn tới được) khi bàn phím ảo mở; không cuộn ngang | không |
| TC-S10.4-AC1-15 | S10.4-AC1 Ô trống thì chưa chấm | Biên | Ở câu B, để ô trống, bấm "Kiểm tra"; rồi gõ ba dấu cách, bấm "Kiểm tra", rồi nhấn Enter | Cả ba lần câu đều chưa được chấm: không hiện "Đúng"/"Sai", không hiện đáp án hay pinyin; ô vẫn gõ được; sau đó xoá ô, gõ "吃" và bấm "Kiểm tra" thì được chấm "Đúng" | e2e |
| TC-S10.4-AC1-16 | S10.4-AC1 Thứ tự lựa chọn kiểu chọn không cố định | Chức năng | Mở bài thử, ghi vị trí của "吃" trong ba lựa chọn ở câu A (thứ 1, 2 hay 3) ngay khi câu hiện, trước khi trả lời; rồi mở lại bài thử (theo định nghĩa ở trên) và ghi lại, lặp tổng cộng 10 lần | Trong 10 lần, "吃" xuất hiện ở ít nhất hai vị trí khác nhau (xác suất 10 lần trùng một vị trí khi xáo đúng là dưới 1/19.000) | e2e |
| TC-S10.4-AC1-17 | S10.4-AC1 Thứ tự lựa chọn giữ nguyên tới khi rời câu | Chức năng | Mở bài thử, ở câu A ghi thứ tự ba lựa chọn lúc câu vừa hiện; chạm "喝"; ghi thứ tự sau khi chấm | Thứ tự sau khi chấm giống hệt thứ tự lúc câu vừa hiện | e2e |
| TC-S10.4-AC1-18 | S10.4-AC1 Kết quả trên lựa chọn ghi bằng chữ | Chức năng | Mở bài thử, ở câu A chạm "喝" | Ngay trên lựa chọn "吃" có nhãn chữ "Đáp án đúng"; ngay trên lựa chọn "喝" có nhãn chữ "Đã chọn"; lựa chọn "看" không có nhãn. Hai nhãn này nằm trên lựa chọn, là chỗ khác với dòng giải thích "Đáp án đúng: 吃 · chī" | e2e |
| TC-S10.4-AC1-19 | S10.4-AC1 Kết quả trên lựa chọn ghi bằng chữ | A11y | Bật trình đọc màn hình; ở câu A chạm "喝"; đọc lần lượt ba lựa chọn. Rồi bật chế độ thang xám của hệ điều hành (hoặc chụp màn hình và chuyển sang đen trắng) và nhìn lại ba lựa chọn | Trình đọc đọc "吃" kèm "Đáp án đúng", "喝" kèm "Đã chọn", "看" không kèm gì; ở thang xám vẫn đọc được nhãn "Đáp án đúng" và "Đã chọn" trên lựa chọn, phân biệt được ba lựa chọn mà không cần màu | không |
| TC-S10.4-AC1-20 | S10.4-AC1 Gõ pinyin kiểu số đúng thì được chấm đúng | Chức năng | Mở lại bài thử, đi tới câu B, gõ "chi1" rồi bấm "Kiểm tra" | Câu được chấm "Đúng" | e2e |
| TC-S10.4-AC1-21 | S10.4-AC1 Gõ pinyin kiểu số đúng thì được chấm đúng | Biên | Mở lại bài thử, đi tới câu B, gõ "Chi1" rồi bấm "Kiểm tra" | Câu được chấm "Đúng" (chữ hoa không ảnh hưởng) | không |
| TC-S10.4-AC1-22 | S10.4-AC1 Gõ pinyin kiểu dấu đúng thì được chấm đúng | Chức năng | Mở lại bài thử, đi tới câu B, gõ "chī" (có dấu thanh 1) rồi bấm "Kiểm tra" | Câu được chấm "Đúng" | không |
| TC-S10.4-AC1-23 | S10.4-AC1 Gõ pinyin nhiều âm tiết liền hay cách đều đúng | Chức năng | Lần 1: mở bài thử ở câu A, đi tới câu C, gõ "mi3fan4", bấm "Kiểm tra". Lần 2: mở lại bài thử (làm nốt bài tới màn tổng kết, mở lại thấy câu A), đi tới câu C, gõ "mi3 fan4", bấm "Kiểm tra". Lần 3: mở lại bài thử như lần 2, đi tới câu C, gõ "mǐfàn", bấm "Kiểm tra" | Cả ba lần câu đều được chấm "Đúng"; chỗ trống hiện "米饭", câu hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn" | e2e |
| TC-S10.4-AC1-24 | S10.4-AC1 Pinyin thiếu thanh hoặc sai thanh thì sai | Chức năng | Lần 1: mở bài thử ở câu A, đi tới câu B, gõ "chi", bấm "Kiểm tra". Lần 2: mở lại bài thử (làm nốt bài tới màn tổng kết, mở lại thấy câu A), đi tới câu B, gõ "chi2", bấm "Kiểm tra" | Cả hai lần câu đều được chấm "Sai"; giải thích đúng nguyên văn "Đáp án đúng: 吃 · chī"; không có phần tô chỗ sai theo thanh mẫu/vận mẫu/thanh điệu | e2e |
| TC-S10.4-AC1-25 | S10.4-AC1 Đáp án thanh nhẹ nhận cả khi không gõ số lẫn khi gõ số 5 | Chức năng | Lần 1: mở bài thử ở câu A, đi tới câu D, gõ "ma", bấm "Kiểm tra". Lần 2: mở lại bài thử (bấm "Tiếp tục" tới màn tổng kết, mở lại thấy câu A), đi tới câu D, gõ "ma5", bấm "Kiểm tra" | Cả hai lần câu đều được chấm "Đúng"; chỗ trống hiện "吗", câu hiện "你好吗" kèm pinyin "nǐ hǎo ma" | e2e |
| TC-S10.4-AC1-26 | S10.4-AC1 Đáp án thanh nhẹ gõ số thanh khác thì sai | Chức năng | Đi tới câu D, gõ "ma1", bấm "Kiểm tra" | Câu được chấm "Sai"; giải thích đúng nguyên văn "Đáp án đúng: 吗 · ma" | e2e |
| TC-S10.4-AC1-27 | S10.4-AC1 Chữ Hán thừa chữ thì sai | Biên | Mở lại bài thử, đi tới câu B, gõ "吃饭" rồi bấm "Kiểm tra" | Câu được chấm "Sai"; giải thích "Đáp án đúng: 吃 · chī" | không |
| TC-S10.4-AC1-28 | S10.4-AC1 Khoảng trắng đầu cuối không ảnh hưởng | Biên | Lần 1: mở bài thử ở câu A, đi tới câu B, gõ " 吃 " (một dấu cách thường trước và sau) rồi nhấn Enter. Lần 2: mở lại bài thử (làm nốt bài tới màn tổng kết, mở lại thấy câu A), đi tới câu B, gõ "　吃　" (một dấu cách toàn khổ trước và sau, kiểu bộ gõ tiếng Trung tạo ra) rồi nhấn Enter | Cả hai lần câu đều được chấm "Đúng" | e2e |
| TC-S10.4-AC1-29 | S10.4-AC1 Khoảng trắng giữa các chữ Hán không ảnh hưởng | Biên | Mở lại bài thử, đi tới câu C, gõ "米 饭" (một dấu cách giữa hai chữ) rồi bấm "Kiểm tra" | Câu được chấm "Đúng"; chỗ trống hiện "米饭" | không |
| TC-S10.4-AC1-30 | S10.4-AC1 Ô gõ không tự đổi pinyin kiểu số thành dấu | Chức năng | Mở lại bài thử, đi tới câu B, gõ "chi1" vào ô; chưa bấm "Kiểm tra", nhấn Tab để rời ô | Ô vẫn hiện đúng "chi1" cả khi đang gõ lẫn sau khi rời ô, không đổi thành "chī" | e2e |
| TC-S10.4-AC1-31 | S10.4-AC1 Enter để chọn chữ trong bộ gõ tiếng Trung không chấm câu | Chức năng | Bật bộ gõ tiếng Trung của hệ điều hành (ví dụ Pinyin giản thể trên macOS/Windows). Mở lại bài thử, đi tới câu B; gõ "chi" để bộ gõ hiện ô gợi ý chữ (chữ đang gạch chân, chưa xác nhận); nhấn Enter để xác nhận; quan sát; rồi nhấn Enter lần nữa | Sau Enter thứ nhất: câu chưa được chấm (không hiện "Đúng"/"Sai", không hiện đáp án hay pinyin), ô có chữ bộ gõ vừa xác nhận và vẫn gõ được. Sau Enter thứ hai: câu được chấm theo chữ đang có trong ô | không |
| TC-S10.4-AC1-32 | S10.4-AC1 Câu vừa hiện chỉ có chữ Hán có chỗ trống và nghĩa | Chức năng | "Hiện pinyin" bật; mở bài thử, nhìn câu A khi chưa trả lời | Màn hiện "我", một chỗ trống, "米饭" và nghĩa "Tôi ăn cơm"; "吃" chỉ xuất hiện trong các lựa chọn; không có "wǒ chī mǐfàn", không có "chī" ở bất cứ đâu trên màn (kể cả trên các lựa chọn) | e2e |
| TC-S10.4-AC1-33 | S10.4-AC1 Câu vừa hiện chỉ có chữ Hán có chỗ trống và nghĩa | Biên | "Hiện pinyin" bật; mở bài thử, đi tới câu B, nhìn khi chưa trả lời | Màn hiện "我", chỗ trống, "米饭" và "Tôi ăn cơm"; không có "吃", "wǒ chī mǐfàn" hay "chī" ở bất cứ đâu trên màn | không |
| TC-S10.4-AC1-34 | S10.4-AC1 Sau khi chấm luôn hiện pinyin dù "Hiện pinyin" tắt | Chức năng | Tắt "Hiện pinyin" trong Cài đặt; mở bài thử, ở câu A chạm "吃" (đúng), nhìn; bấm "Tiếp tục", ở câu B gõ "喝", nhấn Enter (sai), nhìn | Trước khi chấm mỗi câu không có pinyin; sau khi chấm cả câu A (đúng) lẫn câu B (sai) đều hiện "我吃米饭" kèm pinyin "wǒ chī mǐfàn" | e2e |
| TC-S10.4-AC1-35 | S10.4-AC1 Câu vừa hiện chỉ có chữ Hán có chỗ trống và nghĩa | Sáng/Tối | Ở giao diện sáng rồi tối: mở câu A, nhìn trước khi trả lời; chạm "喝", nhìn sau khi chấm; đi tới câu B, Tab tới ô gõ | Cả hai giao diện: chỗ trống phân biệt được với chữ xung quanh (có gạch chân hoặc khung); chữ Hán, nghĩa, các lựa chọn, nhãn "Đáp án đúng"/"Đã chọn" trên lựa chọn, từ đúng ở chỗ trống, pinyin và dòng "Đáp án đúng: 吃 · chī" đều đọc được; viền focus của ô gõ nhìn thấy | không |
| TC-S10.4-AC1-36 | S10.4-AC1 Chỗ trống có nhãn đọc được | A11y | Bật trình đọc màn hình (VoiceOver/TalkBack/NVDA), mở câu A, đọc lần lượt câu từ trái qua phải | Trình đọc đọc "我" bằng giọng tiếng Trung, rồi đọc "Chỗ trống", rồi đọc "米饭" bằng giọng tiếng Trung; không bỏ qua chỗ trống, không đọc "gạch dưới" hay tên ký tự lạ | không |
| TC-S10.4-AC1-37 | S10.4-AC1 Câu có hai chỗ trống thì bị báo lỗi | Biên | Trên bản sao nội dung thử, sửa câu A thành có hai chỗ trống ("我＿米＿"); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu A; nội dung xuất bản không được cập nhật | không |
| TC-S10.4-AC1-38 | S10.4-AC1 Câu không có chỗ trống thì bị báo lỗi | Biên | Trên bản sao nội dung thử, sửa câu A thành không có chỗ trống ("我吃米饭"); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu A | không |
| TC-S10.4-AC1-39 | S10.4-AC1 Đáp án không nằm trong lựa chọn thì bị báo lỗi | Biên | Trên bản sao nội dung thử, sửa lựa chọn của câu A thành "喝", "看" (đáp án vẫn "吃"); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu A | không |
| TC-S10.4-AC1-40 | S10.4-AC1 Số lựa chọn ngoài 2–4 thì bị báo lỗi | Biên | Trên bản sao nội dung thử, sửa lựa chọn câu A thành chỉ "吃", chạy kiểm tra nội dung; rồi sửa thành 5 lựa chọn "吃", "喝", "看", "说", "听", chạy lại | Cả hai lần kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu A. Đối chiếu: với đúng 2 lựa chọn "吃", "喝" và với 4 lựa chọn "吃", "喝", "看", "说" thì không có lỗi cho câu A | không |
| TC-S10.4-AC1-41 | S10.4-AC1 Lựa chọn trùng nhau thì bị báo lỗi | Biên | Trên bản sao nội dung thử, sửa lựa chọn câu A thành "吃", "吃", "喝"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu A | không |
| TC-S10.4-AC1-42 | S10.4-AC1 Câu kiểu gõ có lựa chọn thì bị báo lỗi | Biên | Trên bản sao nội dung thử, thêm vào câu B (kiểu gõ) các lựa chọn "吃", "喝"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu B | không |
| TC-S10.4-AC1-43 | S10.4-AC1 Đáp án thiếu pinyin thì bị báo lỗi | Biên | Trên bản sao nội dung thử, bỏ pinyin của đáp án câu B (đáp án vẫn "吃"); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu B | không |
| TC-S10.4-AC1-44 | S10.4-AC1 Đáp án thiếu chữ Hán thì bị báo lỗi | Biên | Trên bản sao nội dung thử, bỏ chữ Hán của đáp án câu B (pinyin vẫn "chī"); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu B | không |
| TC-S10.4-AC1-45 | S10.4-AC1 Thiếu pinyin hoặc nghĩa của câu thì bị báo lỗi | Biên | Trên bản sao nội dung thử, bỏ pinyin câu đầy đủ của câu C, chạy kiểm tra nội dung; khôi phục, rồi bỏ nghĩa tiếng Việt của câu C, chạy lại | Cả hai lần kiểm tra kết thúc không thành công; dòng lỗi nêu bài thử và câu C | không |
| TC-S10.4-AC1-46 | S10.4-AC1 Câu hợp lệ thì qua kiểm tra | Chức năng | Chạy kiểm tra nội dung trên nội dung thử nguyên bản (câu A: "我＿米饭", đáp án "吃", lựa chọn "吃", "喝", "看") | Không có dòng lỗi nào cho câu A, B, C, D | không |

## Ghi chú

- Case kiểm tra nội dung (TC-S10.4-AC1-37 đến -46) cũng được Dev phủ bằng test của luật kiểm tra nội dung trong PR code; khi nghiệm thu QA
  có thể chạy tay theo bảng hoặc đối chiếu test mang đúng tên Scenario đã pass trên CI.
- TC-S10.4-AC1-16 dựa vào ngẫu nhiên; bản e2e nên lặp đủ 10 lần như bước ghi để khả năng báo sai gần như bằng 0. Dev nên phủ thêm quy tắc
  xáo bằng test không phụ thuộc may rủi.
- TC-S10.4-AC1-31 (bộ gõ tiếng Trung) không đưa vào e2e vì cần bộ gõ thật của hệ điều hành; Dev phủ bằng test component giả lập trạng thái
  đang chọn chữ.
- Bảng chấp nhận pinyin đầy đủ (kiểu số/dấu, liền/cách, hoa/thường, khoảng trắng) là quy tắc của câu gõ pinyin S4.3, đã có case riêng; ở đây
  chỉ kiểm các dòng spec S10.4 nêu.
- Câu D ("你好＿", đáp án "吗") là câu thử do QA đề xuất cho các Scenario thanh nhẹ, vì spec chỉ nêu đáp án "吗 ma" mà không nêu câu; Dev đưa
  câu này (hoặc câu tương đương có đáp án thanh nhẹ "吗") vào bài thử của bản build e2e.
