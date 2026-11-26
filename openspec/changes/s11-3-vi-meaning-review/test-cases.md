# Test cases: S11.3 Review nghĩa tiếng Việt

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Story nội dung, không có màn mới.** TC-1 … TC-4 đọc kết quả của **kiểm tra nội dung** (lệnh kiểm tra nội dung chuẩn của dự án,
  chạy trên nội dung thật ở nhánh PR code) chứ không thao tác trên app; chỉ TC-5 thao tác trên bản build.
- **Cột Tự động** theo `spec-driven.md` §3: `e2e` là Playwright, `không` là QA chạy tay. Story này không có case Playwright. TC-1 … TC-4
  ghi `không (test nội dung trong CI)`: ngoài việc QA chạy lại khi nghiệm thu, dev phải có test tự động cạnh bước kiểm tra nội dung
  (theo proposal, xem bảng "Tầng test gợi ý") chạy trong CI để cảnh báo không quay lại. TC-5 ghi `không`: chỉ QA chạy tay.
- **"Nội dung thật"**: file nghĩa tiếng Việt và nội dung app đã sinh lại, đúng như trong PR code, không sửa tay trước khi chạy.
- **"Cảnh báo nghĩa tiếng Việt"**: một trong ba dòng của bảng trong spec: "… từ chưa có nghĩa tiếng Việt: …", "… từ chưa review nghĩa: …",
  "ID không có trong danh sách HSK: …".
- **Nghĩa có đúng không** là phán đoán của người review, ngoài phạm vi các case dưới (xem proposal, mục ngoại lệ); người thật duyệt diff
  file nghĩa trong PR code.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.3-AC1-1 | S11.3-AC1 Cả 500 từ có nghĩa và đã đánh dấu review | Chức năng | Đọc danh sách từ HSK 1 và nghĩa tiếng Việt trong nội dung thật | Danh sách có đúng 500 từ; từng từ có ít nhất một nghĩa không rỗng (không phải chuỗi chỉ có khoảng trắng) và được đánh dấu đã review | không (test nội dung trong CI) |
| TC-S11.3-AC1-2 | S11.3-AC1 Kiểm tra nội dung không còn cảnh báo nghĩa tiếng Việt | Chức năng | Chạy kiểm tra nội dung trên nội dung thật, đọc toàn bộ kết quả in ra | Không có dòng nào chứa "chưa có nghĩa tiếng Việt", "chưa review nghĩa" hay "ID không có trong danh sách HSK". Cảnh báo khác (ví dụ chữ thiếu dữ liệu nét, audio) không tính | không (test nội dung trong CI) |
| TC-S11.3-AC1-3 | S11.3-AC1 Một từ bị bỏ đánh dấu review thì cảnh báo quay lại | Biên | Lấy bản sao nội dung thật, đổi riêng từ "爱" thành chưa review (giữ nguyên nghĩa), chạy kiểm tra nội dung trên bản sao | Trong các cảnh báo nghĩa tiếng Việt chỉ có đúng một dòng, nội dung đúng "1 từ chưa review nghĩa: 爱"; không có dòng "chưa có nghĩa tiếng Việt" hay "ID không có trong danh sách HSK". Cảnh báo khác của kiểm tra nội dung (ví dụ chữ thiếu dữ liệu nét, audio) không tính. Nội dung thật không bị đổi sau khi chạy | không (test nội dung trong CI) |
| TC-S11.3-AC1-4 | S11.3-AC1 Nội dung app dùng đúng nghĩa đã review | Chức năng | Chạy kiểm tra nội dung trên nội dung thật; so nghĩa của từng từ trong 500 từ giữa nội dung app và file nghĩa đã review | Không có lỗi nội dung app lệch nguồn; nội dung app có đúng 500 từ HSK 1, từ nào cũng được đánh dấu đã review; với mỗi từ, danh sách nghĩa trong nội dung app trùng từng nghĩa và cùng thứ tự với nghĩa đã review | không (test nội dung trong CI) |
| TC-S11.3-AC1-5 | S11.3-AC1 Nội dung app dùng đúng nghĩa đã review | Chức năng | Điều kiện đầu: bản build của PR code, dữ liệu học trống (bài "Thanh 1–4" luôn mở). Từ dùng để kiểm: "是", câu cuối (câu nói) của bài "Thanh 1–4"; nghĩa gợi ý hiện tại có chú thích dịch máy "sự thừa nhận tôn kính một mệnh lệnh: rất tốt" nên gần như chắc đổi khi review. Chuẩn bị: chụp câu này trên bản build từ `main` làm ảnh so sánh. Bước: mở bài "Thanh 1–4", làm lần lượt tới câu cuối, đọc dòng nghĩa tiếng Việt dưới chữ "是" | Dòng nghĩa hiện đúng các nghĩa đã review của "是" trong diff nghĩa tiếng Việt của PR code, cùng thứ tự, không còn nghĩa đã bị bỏ (ví dụ chú thích dịch máy trên). So với ảnh từ `main`: vị trí dòng nghĩa và cách nối các nghĩa (dấu phẩy) không đổi, chỉ nội dung nghĩa khác. Nếu PR code không đổi nghĩa của "是" thì chọn câu nói khác có từ đã đổi nghĩa (ví dụ "来" ở câu cuối bài "Thanh mẫu b p m f d t n l") và ghi rõ từ đã dùng | không |

## Tầng test gợi ý cho dev

| Case | Tầng |
|---|---|
| TC-S11.3-AC1-1 … 4 | Vitest cạnh bước kiểm tra nội dung, chạy trên nội dung thật (TC-3 dùng bản sao trong bộ nhớ, không ghi file) |
| TC-S11.3-AC1-5 | QA chạy tay trên bản build; không thêm Playwright vì TC-4 đã phủ toàn bộ 500 từ |
