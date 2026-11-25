# Proposal: S10.8 Đọc hiểu

Story **S10.8 Đọc hiểu · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s108-đọc-hiểu--f3)) ·
GitHub issue [#51](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/51). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #51

## Why

Là người học, tôi muốn đọc đoạn văn ngắn và trả lời câu hỏi để luyện đọc. Bản 0.1 chỉ có bài nghe, pinyin, nói, viết theo từng từ hoặc từng
câu; chưa có dạng bài nào cho người học đọc một đoạn chữ Hán liền mạch. S10.8 thêm dạng câu "đọc hiểu" chạy trong màn bài học: một đoạn văn
ngắn, một câu hỏi trắc nghiệm, và chạm vào từ trong đoạn để xem pinyin và nghĩa khi gặp từ chưa nhớ.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Schema nội dung cho dạng câu đọc hiểu (đoạn văn chia theo từ, câu hỏi, lựa chọn, đáp án) và quy tắc hợp lệ | `packages/shared` (`@csk/shared`, `content.schema.ts`) |
| Kiểm tra nội dung khi soạn: từ của đoạn trỏ đúng một mục danh sách từ hoặc có pinyin/nghĩa khai báo, câu hỏi có đúng một đáp án | `content/` (pipeline `@csk/content`, `content:check`) |
| Nạp dữ liệu từ của đoạn văn cho câu; quy tắc chấm lựa chọn (Phần 2) | `shared/services/content.service.ts`, `shared/services/lesson.service.ts` (có sẵn, thêm method) |
| Hiện đoạn văn, từ chạm được, ô xem pinyin + nghĩa, lựa chọn, đáp án | `shared/components/exercises/` (component mới + đăng ký vào registry theo dạng bài) |
| Nối câu đọc hiểu vào màn bài học (chấm, giải thích, "Tiếp tục") | `pages/lesson/hooks/` (hook màn học hiện có, nếu cần) |
| Style đoạn văn, từ đang chọn, ô xem nghĩa | `apps/web/src/styles/tailwind/` (class BEM mới) |

Không đổi dữ liệu lưu trên máy (IndexedDB), không đổi file sao lưu, không thêm dependency.

## What Changes

- **Dạng câu mới "đọc hiểu"** trong bài học và bài kiểm tra: màn hiện một đoạn văn ngắn bằng chữ Hán, bên dưới là một câu hỏi trắc nghiệm
  (câu hỏi và lựa chọn bằng tiếng Việt) với 2 đến 4 lựa chọn, theo quy tắc thứ tự lựa chọn chung của S10.2: xáo khi câu hiện, giữ nguyên tới khi rời câu (kể cả khi chạm từ,
  đóng ô, chấm); mở lại bài đang dở hoặc học lại thì xáo mới. Chọn một lựa chọn là chấm ngay theo luồng chung của màn bài (S3.2): khóa lựa
  chọn, gắn nhãn theo bảng nhãn chung của S10.2 ("Đáp án đúng" cho đáp án; "Đã chọn" cho lựa chọn sai người học đã chọn; lựa chọn khác không
  nhãn), sai thì có giải thích "Đáp án đúng: <lựa chọn đúng>", bấm "Tiếp tục" sang câu kế.
- **Một câu đọc hiểu = một đoạn văn + một câu hỏi.** Muốn hỏi nhiều câu về cùng một đoạn, người soạn đặt nhiều câu đọc hiểu liền nhau dùng
  chung đoạn văn; mỗi câu chấm và tính điểm riêng như mọi câu khác.
- **Đoạn văn chỉ hiện chữ Hán**, không có dòng pinyin dưới chữ (mục đích là luyện đọc), bất kể công tắc "Hiện pinyin" (S8.2).
- **Chạm vào một từ** trong đoạn (chuột, chạm, hoặc bàn phím Enter/Space) mở ô xem chữ Hán, pinyin có dấu và mọi nghĩa tiếng Việt của từ đó
  (nối bằng "; " như S10.2/S10.9); từ được đánh dấu đang chọn. Mỗi lần xuất hiện của một từ là một từ riêng: chạm từ khác (kể cả lần xuất hiện
  khác của cùng chữ) thì dấu chọn chuyển theo; chạm lại chính từ đó, bấm "Đóng" hoặc phím Escape thì đóng. Dấu câu không
  chạm được. Xem nghĩa được cả trước và sau khi trả lời, không ảnh hưởng điểm. Ô xem luôn hiện pinyin, kể cả khi "Hiện pinyin" tắt (người
  học chủ động hỏi). Sang câu kế thì ô đóng.
- **Dữ liệu từ của đoạn:** mỗi từ trỏ tới đúng một mục của danh sách từ HSK 1 chung của app (theo mục, không theo chữ: chữ đa âm như 地
  "de"/"dì" phải chỉ định một mục, và mục đó phải tồn tại). Từ đã có trong danh sách thì không được khai báo pinyin/nghĩa riêng. Từ không có
  trong danh sách (tên riêng như 小明) được người soạn khai báo pinyin + nghĩa ngay trong câu.
- **Kiểm tra nội dung** báo lỗi (chỉ rõ bài và câu) khi: một từ trong đoạn không trỏ được tới mục nào và không có pinyin/nghĩa khai báo; từ có
  trong danh sách nhưng khai báo pinyin/nghĩa riêng; chữ đa âm không chỉ định mục; mục chỉ định không tồn tại; câu hỏi không có đúng một đáp án đúng; số lựa chọn ngoài 2–4; hai lựa chọn trùng nhau (bỏ khoảng trắng đầu/cuối,
  không phân biệt hoa thường); câu hỏi rỗng; đoạn không có từ nào.
- **Thẻ ôn tập:** câu đọc hiểu tính điểm như câu khác. Câu đọc hiểu không gắn với một từ nên làm hết bài học **không tạo thẻ** cho từ trong
  đoạn, và làm sai trong bài kiểm tra **không tạo hay đổi thẻ ôn tập** (giống câu nói theo một câu ở S9.1/S9.4).
- **Nội dung mẫu để nghiệm thu:** hai đoạn văn mẫu ("我叫小明。我是学生。" và "他高兴地说。" có 地 đọc "de"), pinyin và nghĩa của từ lấy
  đúng từ danh sách từ HSK 1 hiện có (không dùng danh sách từ giả). Đoạn văn mẫu chỉ có trên bản build dùng cho kiểm thử tự động (theo tiền lệ bài mẫu của các story trước),
  không vào nội dung phát hành. QA nghiệm thu trên bản build đó.

## Không làm (out of scope)

- Nút nghe đoạn văn hoặc nghe từ trong ô xem nghĩa (story không yêu cầu; hội thoại có audio là S10.6).
- Dịch cả đoạn văn sang tiếng Việt, bật/tắt bản dịch (S10.6 làm cho hội thoại).
- Câu hỏi tự luận, gõ câu trả lời, chọn nhiều đáp án.
- Lưu "từ đã tra" hay tạo thẻ ôn tập từ việc chạm xem nghĩa.
- Tra từ tự do bằng ô tìm kiếm (S10.9 Tra từ).
- Soạn đoạn văn thật cho HSK 1 (E11); change này chỉ cần nội dung mẫu đủ để test, và nội dung mẫu không có trong bản phát hành.
- Tạo thẻ ôn tập cho từ trong đoạn văn khi học xong bài.

## Phụ thuộc

- **S3.2** (màn chạy bài, chấm ngay, giải thích, "Tiếp tục"), **S3.5** (bài kiểm tra): dùng lại, không đổi.
- **S9.1/S9.4** (thẻ ôn tập, câu sai vào ôn tập): mới merge spec, chưa có code. Hai Scenario về thẻ ôn tập ("Học xong bài chỉ có câu đọc hiểu
  không tạo thẻ", "Sai câu đọc hiểu trong bài kiểm tra") cần code S9.1/S9.4 có trước. Sau khi S9.1 và S9.4 archive, bảng "Từ nào của bài được
  tạo thẻ" (S9.1) và bảng "Câu nào là câu sai" (S9.4) cần thêm dòng "Đọc hiểu | … | Không có" (PR spec riêng, không làm trong change này).
- **S10.2** (cùng quy ước: xáo thứ tự lựa chọn, nối mọi nghĩa bằng "; "), **S10.9** (hiện toàn bộ nghĩa): S10.8 theo cùng quy ước.
- **S8.2** (công tắc "Hiện pinyin"): đoạn văn không có pinyin nên không bị ảnh hưởng; ô xem nghĩa luôn hiện pinyin.
- **S10.9 Tra từ** (đang viết song song): ô xem pinyin + nghĩa của S10.8 lấy từ dữ liệu từ của chính bài, không phụ thuộc S10.9. Nếu S10.9
  có ô hiện thông tin từ dùng chung thì dev có thể tái dùng ở pha code; hành vi người học thấy trong spec này không đổi.
- **S10.2 / S10.4** (cũng có trắc nghiệm, thành phần dùng chung): nếu đã có thành phần lựa chọn dùng chung thì dev tái dùng; spec không phụ thuộc thứ tự làm.

## Capabilities

### New Capabilities

- `reading-comprehension`: câu đọc hiểu trong màn bài học: đoạn văn chữ Hán, câu hỏi trắc nghiệm chấm ngay, chạm từ xem pinyin và nghĩa, kiểm
  tra nội dung cho dạng câu này.

### Modified Capabilities

Không có. Luồng chấm/giải thích/"Tiếp tục" của `lesson-runner` áp dụng nguyên cho dạng câu mới; quy tắc riêng nằm trong `reading-comprehension`.

## Impact

- `packages/shared`: thêm dạng bài vào schema nội dung (JSON nội dung, không phải dữ liệu người dùng).
- `content/`: kiểm tra nội dung cho dạng câu mới, nội dung mẫu.
- `apps/web`: component câu đọc hiểu + registry, service chấm/nạp dữ liệu, CSS.
- Không đổi IndexedDB, sao lưu, service worker.

## Open Questions

- [x] Một câu đọc hiểu có bao nhiêu câu hỏi? → Một đoạn + một câu hỏi; nhiều câu hỏi cho cùng đoạn là nhiều câu liền nhau dùng chung đoạn,
  khớp luồng "mỗi câu chấm ngay" của S3.2 (ba đề xuất, chờ người thật xác nhận)
- [x] Câu hỏi và lựa chọn viết bằng tiếng gì? → Tiếng Việt, cho người học mới bắt đầu; đoạn văn bằng chữ Hán (ba đề xuất, chờ người thật xác nhận)
- [x] Số lựa chọn và thứ tự? → 2 đến 4 lựa chọn, đúng một đáp án, thứ tự xáo ngẫu nhiên mỗi lần hiện (sửa theo finding 5, xem dưới)
  (ba đề xuất, chờ người thật xác nhận)
- [x] Đoạn văn có hiện pinyin không, có theo công tắc "Hiện pinyin" không? → Không hiện pinyin dưới đoạn văn trong mọi trường hợp; pinyin chỉ
  xem qua chạm từ, ô xem nghĩa luôn hiện pinyin kể cả khi công tắc tắt (ba đề xuất, chờ người thật xác nhận)
- [x] Chạm từ mở gì, đóng thế nào, dùng bàn phím được không? → Ô xem cạnh đoạn văn với chữ Hán, pinyin, nghĩa; đóng bằng chạm lại từ, nút
  "Đóng" hoặc Escape; mỗi từ là phần tử bấm được bằng Tab + Enter/Space; nội dung ô được đọc cho trình đọc màn hình; không hiệu ứng chuyển động
  khi bật giảm chuyển động (ba đề xuất, chờ người thật xác nhận)
- [x] Xem nghĩa sau khi đã trả lời, hoặc trong bài kiểm tra, có được không, có trừ điểm không? → Được, cả trước và sau khi trả lời, cả bài học
  và bài kiểm tra; không ảnh hưởng điểm (ba đề xuất, chờ người thật xác nhận)
- [x] Từ trong đoạn thiếu dữ liệu thì sao? → Kiểm tra nội dung báo lỗi và không ghi nội dung, nên trên app mọi từ của đoạn đều xem được
  (ba đề xuất, chờ người thật xác nhận)
- [x] (Duyệt vòng 1, finding 1) Nguồn dữ liệu của từ trong đoạn, tên riêng như 小明 không có trong danh sách từ, chữ đa âm như 地? → Mỗi từ
  trỏ tới đúng một mục của danh sách từ (theo mục, không theo chữ); tên riêng khai báo pinyin + nghĩa trong câu đọc hiểu; chữ đa âm phải chỉ
  định mục, không chỉ định là lỗi kiểm tra nội dung. Đã thêm Requirement "Dữ liệu từ của đoạn văn", sửa ví dụ và Scenario thiếu dữ liệu (dùng
  "小红") (ba đề xuất, chờ người thật xác nhận)
- [x] (finding 2) Ô xem hiện một nghĩa hay mọi nghĩa? → Mọi nghĩa theo thứ tự soạn, nối "; ", khớp S10.2/S10.9; thêm 叫 "jiào" "gọi; tên là"
  vào ví dụ và Scenario "Từ nhiều nghĩa hiện mọi nghĩa" (ba đề xuất, chờ người thật xác nhận)
- [x] (finding 3) Bấm "我" ở vị trí khác khi đang chọn "我" vị trí 1? → Mỗi lần xuất hiện là một từ riêng: dấu chọn chuyển sang vị trí vừa
  bấm, ô giữ nội dung; thêm dòng bảng + Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] (finding 4) Phụ thuộc S9.1/S9.4 chưa có code; học xong bài có câu đọc hiểu có tạo thẻ không? → Ghi ở Phụ thuộc rằng hai Scenario thẻ
  ôn tập cần code S9.1/S9.4 có trước và bảng S9.1/S9.4 cần thêm dòng "Đọc hiểu" sau archive; thêm điều kiện "đã có thẻ của '学生' (chưa tới
  hạn)" vào WHEN; chốt không tạo thẻ cho từ trong đoạn (như "Nói theo câu"), thêm Requirement + Scenario và mục Không làm (ba đề xuất, chờ
  người thật xác nhận)
- [x] (finding 5) Thứ tự lựa chọn không thống nhất với S10.2? → Đổi sang xáo ngẫu nhiên mỗi lần hiện như S10.2/S4.2 (bài kiểm tra làm lại
  không giới hạn, thứ tự cố định thì người học nhớ vị trí); sửa Scenario AC1 thành "thứ tự bất kỳ", thêm Scenario "Thứ tự lựa chọn không cố
  định" (ba đề xuất, chờ người thật xác nhận)
- [x] (finding 6) Nội dung mẫu có trên bản build không? → Chỉ có trên bản build dùng cho kiểm thử tự động, không vào nội dung phát hành; QA
  nghiệm thu trên bản build đó; ghi ở What Changes, Không làm và đầu spec (ba đề xuất, chờ người thật xác nhận)
- [x] (finding 7) Scenario hai câu hỏi cùng đoạn mơ hồ? → Ghi "bài chỉ gồm hai câu đọc hiểu", thêm câu hỏi 2 ("Người nói tên là gì?",
  "Tiểu Minh"/"Tiểu Hồng"/"Tiểu Lan", đúng "Tiểu Minh") vào ví dụ
- [x] (finding 8) Nhãn màn tổng kết? → Dùng đúng "Sai 1 câu"
- [x] (finding 9) Trình đọc màn hình? → Thêm Scenario "Trình đọc màn hình đọc nội dung ô" (vùng thông báo chứa chữ Hán, pinyin, nghĩa)
- [x] (finding 10) Câu hỏi trống, đoạn không có từ, so trùng lựa chọn? → Thêm hai Scenario báo lỗi; so trùng bỏ khoảng trắng đầu/cuối và
  không phân biệt hoa thường (ba đề xuất, chờ người thật xác nhận)
- [x] Câu đọc hiểu sai trong bài kiểm tra có vào ôn tập (S9.4) không? → Không tạo hay đổi thẻ, vì câu không gắn với một từ (như câu nói theo
  một câu) (ba đề xuất, chờ người thật xác nhận)
- [x] Có nút nghe đoạn văn/nghe từ không? → Không, ngoài AC; để story sau nếu cần (ba đề xuất, chờ người thật xác nhận)
- [x] (Duyệt vòng 2, finding 1) Dữ liệu từ trong ví dụ không khớp danh sách từ thật? → Đã kiểm lại danh sách từ: 我 "wǒ" "tôi; mình; của
  tôi", 叫 "jiào" "kêu; gọi; đặt hàng; bảo" (dùng làm ví dụ từ nhiều nghĩa), 学生 "xuésheng" "học sinh; trẻ đi học"; viết lại bảng dữ liệu
  ví dụ và mọi Scenario theo đúng dữ liệu này, giữ dữ liệu thật (không dùng danh sách từ giả); 是 không được Scenario nào kiểm nghĩa
- [x] (vòng 2, finding 2) Scenario chữ đa âm 地 không có trong nội dung mẫu và không nói nghĩa nào hiện? → Thêm đoạn B "他高兴地说。" (地
  chỉ định mục "de") + câu hỏi 3; THEN hiện "地", "de" và nghĩa mục "de", không hiện "dì" và "đất; mặt đất; ruộng; vùng" (ba đề xuất, chờ
  người thật xác nhận)
- [x] (vòng 2, finding 3) Thứ tự lựa chọn mới ghi nửa đầu quy tắc S10.2? → Thêm Requirement "Thứ tự lựa chọn giữ nguyên tới khi rời câu"
  theo đúng bảng S10.2 (chạm/đóng ô xem nghĩa cũng giữ nguyên), Scenario "Chạm từ và chấm không đổi thứ tự lựa chọn" và "Mở lại bài đang dở
  thì thứ tự xáo mới"
- [x] (vòng 2, finding 4) Nhãn sau khi chấm chưa chốt chữ? → Dùng bảng nhãn của S10.2: "Đáp án đúng", "Đã chọn", lựa chọn khác không nhãn;
  chọn đúng thì không có "Đã chọn"; sửa Scenario "Chọn đúng" và "Chọn sai"
- [x] (vòng 2, finding 5) Từ có trong danh sách có được khai báo pinyin/nghĩa riêng không, mục chỉ định không tồn tại thì sao? → Cả hai là lỗi
  kiểm tra nội dung; thêm hai dòng bảng và hai Scenario (ba đề xuất, chờ người thật xác nhận)
