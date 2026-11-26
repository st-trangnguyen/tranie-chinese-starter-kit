# Test cases: S11.5 Audio HSK 1 đầy đủ

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Nhánh đủ nội dung**: nhánh code của S11.5 cắt từ `main` sau khi đã merge S10.5 (thẻ ngữ pháp), S10.6 (hội thoại) và nội dung S11.1,
  S11.2, S11.4 (Nhập môn + 15 chủ đề HSK 1, kể cả bài ngữ pháp, bài hội thoại, bài kiểm tra chủ đề và bài kiểm tra cuối cấp).
- **Kiểm tra nội dung**: lệnh kiểm tra nội dung chuẩn của dự án, chạy không cần mạng.
- **Kiểm tra phủ audio**: test phủ audio HSK 1 do Dev thêm trong story này.
- **Nội dung thử**: bộ nội dung nhỏ dùng riêng cho test của kiểm tra phủ audio (Dev dựng), không đụng nội dung thật.
- **Có mạng, bật loa**: dùng cho phần nghe lại trong app (bản build thật).

Mọi Scenario của story này cùng ID `S11.5-AC1`; cột Scenario ghi thêm tên Scenario để phân biệt.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.5-AC1-1 | S11.5-AC1 Kiểm tra nội dung trên nội dung HSK 1 không báo thiếu audio | Chức năng | Trên nhánh đủ nội dung, chạy kiểm tra nội dung | Không có dòng lỗi nào về audio thiếu (không có dòng "… audio chưa tạo"); kiểm tra kết thúc thành công (dòng cảnh báo khác, ví dụ nghĩa tiếng Việt chưa review, được phép). CI của PR code xanh ở bước kiểm tra nội dung | không |
| TC-S11.5-AC1-2 | S11.5-AC1 Mọi từ và câu HSK 1 có file audio không rỗng | Chức năng | Xem test phủ audio HSK 1 (Dev) có trong bộ test, tên chứa `S11.5-AC1`, và chạy xanh trên CI; đối chiếu test đó duyệt đủ: cả 500 từ cấp 1, câu của các bài HSK 1, lời hội thoại, câu ví dụ ngữ pháp, câu của bài kiểm tra chủ đề và bài kiểm tra cuối cấp, và kiểm file trong thư mục audio của nội dung đã dựng | Test chạy xanh; mỗi từ/câu trong các nhóm trên có file audio trong thư mục audio của nội dung đã dựng, không file nào rỗng (độ dài lớn hơn 0) | không |
| TC-S11.5-AC1-3 | S11.5-AC1 Mọi từ và câu HSK 1 có file audio không rỗng | Biên | Trong test phủ audio HSK 1, kiểm có tính cả từ cấp 1 không xuất hiện trong câu nào của bài (chỉ có trên thẻ từ) | Những từ này cũng được kiểm có file audio không rỗng; test không bỏ qua chúng | không |
| TC-S11.5-AC1-4 | S11.5-AC1 Mọi từ và câu HSK 1 có file audio không rỗng | Chức năng | Bản build thật, có mạng, bật loa. Ở một bài của chủ đề HSK 1 đầu tiên, một bài của chủ đề cuối cùng, một bài ngữ pháp, một bài hội thoại, bài kiểm tra chủ đề và bài kiểm tra cuối cấp: bấm nút "Nghe" (hoặc "Nghe mẫu") ở mọi câu có nút đó; mở thẻ của ba từ cấp 1 bất kỳ và bấm nghe | Mỗi lần bấm đều nghe được tiếng, không im lặng, không bị cắt cụt; không có thông báo lỗi phát audio | không |
| TC-S11.5-AC1-5 | S11.5-AC1 File audio rỗng của một câu HSK 1 thì bị nêu tên | Biên | Trên nội dung thử có hai câu "你好" và "谢谢", cả hai có file audio nhưng file của "谢谢" rỗng (độ dài 0); chạy kiểm tra phủ audio (Dev phủ bằng test; QA xem test có trong bộ test, tên chứa `S11.5-AC1`, và chạy xanh) | Kết quả nêu chữ "谢谢" là có file audio rỗng; không nêu chữ "你好" | không |
| TC-S11.5-AC1-6 | S11.5-AC1 Câu HSK 1 thiếu file audio thì bị nêu tên | Biên | Trên nội dung thử có hai câu "你好" và "谢谢", chỉ câu "你好" có file audio; chạy kiểm tra phủ audio (Dev phủ bằng test; QA xem test có trong bộ test, tên chứa `S11.5-AC1`, và chạy xanh) | Kết quả nêu chữ "谢谢" là thiếu file audio; không nêu chữ "你好" | không |

## Nghe lại phát âm (ngoại lệ asset, không phải Scenario)

Chất lượng phát âm không kiểm tự động được (proposal, mục "Phần không kiểm thử tự động được"). Các bước dưới đây không gắn ID Scenario và
không quyết pass/fail của bảng trên; QA ghi kết quả vào báo cáo nghiệm thu để người soạn xử lý.

| ID | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|
| NL-1 | Nghe lại | Khi chạy TC-S11.5-AC1-4, nghe kỹ từng từ/câu; thêm hai bài hội thoại HSK 1 khác chủ đề, bấm nghe lần lượt từng lời | Mỗi file đọc đúng từ/câu đang hiện, đúng thanh, đúng âm của chữ đa âm. Từ/câu đọc sai được ghi lại (chữ Hán, bài, cách đọc sai) | không |
| NL-2 | Nghe lại | Với mỗi **từ** đa âm ghi lại ở NL-1: sau khi người soạn thêm chữ đọc thay và tạo lại audio, mở thẻ từ đó trên bản build mới và bấm nghe; chạy lại kiểm tra nội dung | Từ đó đọc đúng âm; kiểm tra nội dung vẫn không báo audio thiếu | không |
| NL-3 | Nghe lại | Với mỗi **câu** (hoặc lời hội thoại) đọc sai chữ đa âm ghi lại ở NL-1: chữ đọc thay chỉ áp cho từ, nên người soạn soạn lại câu để tránh cách đọc sai rồi tạo lại audio. Mở câu đó trên bản build mới và bấm nghe; chạy lại kiểm tra nội dung | Câu mới đọc đúng, vẫn giữ nghĩa và mục tiêu của bài; kiểm tra nội dung không báo audio thiếu. Câu không soạn lại được mà không mất mục tiêu bài (ví dụ điểm ngữ pháp chính là chữ đa âm đó) thì có ghi trong mô tả PR kèm đề xuất mở story riêng | không |

## Ghi chú

- **Tầng kiểm**: story này là nội dung, không đổi giao diện. TC-1, -2, -3, -5, -6 Dev phủ ở tầng kiểm tra nội dung / test phủ audio (theo
  `spec-driven.md` §4), chạy trên CI; khi nghiệm thu QA xem các test đó có trong bộ test, tên chứa `S11.5-AC1`, và CI xanh. TC-4, NL-1 đến
  NL-3 QA chạy tay.
- **Không có case e2e**: phát lần lượt mọi audio của 75 bài trong trình duyệt quá chậm và lặp lại phần test phủ audio đã kiểm. Không có case
  A11y, Mobile 375, Sáng/Tối, Offline vì story không đổi giao diện và không đổi hành vi tải audio offline (S8.4).
- **Hồi quy, không gắn ID S11.5** (hành vi của story khác, QA có thể chạy thêm khi nghiệm thu nếu muốn, không quyết verdict của S11.5):
  - S2.4: trên bản sao cục bộ của nhánh đủ nội dung, xoá tạm file audio của một từ cấp 1 không xuất hiện trong câu nào; chạy kiểm tra nội
    dung thì báo lỗi audio thiếu nêu chữ Hán của từ đó và kết thúc thất bại; khôi phục file thì kết thúc thành công.
  - S2.4: sửa chữ Hán của một câu HSK 1 đã có audio mà không tạo lại audio thì kiểm tra nội dung báo lỗi audio thiếu, nêu chữ Hán mới.
  - S10.6: lời vai A nghe giọng nữ, lời vai B nghe giọng nam (theo test và luật giọng của S10.6).
