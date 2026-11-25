# Proposal: S10.3 Sắp xếp câu

Story **S10.3 Sắp xếp câu · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s103-sắp-xếp-câu--f3)) ·
GitHub issue [#46](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/46). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #46

## Why

Là người học, tôi muốn sắp xếp các từ thành câu đúng để nắm trật tự câu. Bản 0.1 chỉ có bài nghe, pinyin, nói và viết; chưa có dạng bài
nào luyện trật tự từ trong câu, trong khi trật tự câu là điểm ngữ pháp đầu tiên của HSK 1.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng câu "sắp xếp câu" trong nội dung: câu tham chiếu, danh sách từ theo đúng thứ tự; quy tắc nội dung hợp lệ | `packages/shared` (`@csk/shared`, schema nội dung) + `content/scripts` (kiểm tra nội dung) |
| Quy tắc: xáo thứ tự ban đầu khác thứ tự đúng, chấm theo đáp án | `shared/utils/` (pure, dùng được từ component dạng bài) |
| Component dạng bài sắp xếp câu (chạm, kéo, bàn phím) và đăng ký vào registry theo dạng câu | `shared/components/exercises/` |
| Style thẻ từ, hàng câu trả lời | `apps/web/src/styles/tailwind/` |
| Chữ hiện trên màn (nhãn, thông báo, giải thích) | `core/services/` (i18n) |

Màn chạy bài (`pages/lesson/`), cách chấm "Đúng/Sai", nút "Tiếp tục", màn tổng kết giữ nguyên; dạng bài mới cắm vào như các dạng bài E4.
Không đổi dữ liệu lưu trên máy, không đổi file sao lưu.

## What Changes

- **Dạng câu mới "Sắp xếp câu"**: màn hiện nghĩa tiếng Việt của câu, một hàng câu trả lời (ban đầu trống) và các thẻ từ chữ Hán đã xáo trộn.
  Dãy chữ trên các thẻ ở thứ tự xáo ban đầu không bao giờ trùng dãy chữ của thứ tự đúng (kể cả câu có thẻ trùng chữ).
- **Sắp xếp (AC1)**: chạm thẻ ở dưới thì thẻ nối vào cuối câu; chạm thẻ trong câu thì thẻ trở về chỗ cũ ở dưới. Kéo thẻ vào câu ở vị trí
  muốn đặt (thả đè nửa trái một thẻ thì đặt trước, nửa phải thì đặt sau), kéo thẻ trong câu để đổi chỗ. Bàn phím: Tab tới thẻ,
  Enter/Space như chạm; focus chuyển sang thẻ kế bên trong vùng cũ (hết thẻ thì sang nút "Kiểm tra" hoặc thẻ đầu bên dưới) và trình đọc
  màn hình được báo "Đã thêm/Đã bỏ <chữ>" mỗi khi thẻ chuyển vùng. Vùng thẻ bên dưới có nhãn "Các từ". Bật giảm chuyển động thì thẻ đổi chỗ ngay, không có hiệu ứng
  di chuyển.
- **Chấm (AC2)**: nút "Kiểm tra" chỉ bấm được khi mọi thẻ đã nằm trong câu. Đúng khi các thẻ đúng thứ tự đáp án (từ trùng nhau đổi chỗ cho
  nhau vẫn đúng). Chấm xong khóa các thẻ, hiện câu đúng (chữ Hán có dấu câu + pinyin). Sai thì giải thích "Đáp án đúng: <câu chữ Hán>".
- **Kiểm tra nội dung và dựng nội dung** báo lỗi câu sắp xếp có ít hơn 2 thẻ từ, các thẻ ghép lại không thành câu tham chiếu (bỏ qua dấu câu), hoặc mọi thẻ giống hệt nhau (không xáo được).
- Câu sắp xếp sai trong bài kiểm tra tính là câu sai trên màn tổng kết như mọi dạng câu, nhưng **không** tạo hay đổi thẻ ôn tập (câu không
  gắn với một từ, giống câu nói theo câu ở S9.4).
- Học xong bài thường có câu sắp xếp: câu sắp xếp **không** tạo thẻ ôn tập (giống dòng "Câu nói theo câu" của S9.1).
- Câu sắp xếp câu không còn bị "Bỏ qua câu này" vì dạng bài chưa có.
- Các Scenario lỗi nội dung mang ID AC2: nội dung hợp lệ là điều kiện để "chấm theo đáp án" và "hiện câu đúng" (đáp án phải ghép được
  thành câu tham chiếu), nên gắn AC2.

## Capabilities

### New Capabilities

- `sentence-order`: câu sắp xếp các thẻ từ thành câu đúng: cách hiện, cách sắp (chạm, kéo, bàn phím), chấm theo đáp án, hiện câu đúng, quy
  tắc nội dung hợp lệ.

### Modified Capabilities

Không có. Màn chạy bài (`lesson-runner`) đã có cơ chế chấm, giải thích và bỏ qua dạng bài chưa có; dạng mới chỉ cắm vào.

## Không làm (out of scope)

- Phát audio câu (trước hoặc sau khi chấm), hiện pinyin trên từng thẻ từ.
- Nhiều đáp án đúng cho một câu (chỉ một thứ tự đúng do người soạn ghi); thẻ từ nhiễu không thuộc câu.
- Tô từng thẻ đặt sai chỗ; chấm điểm một phần.
- Giữ cách sắp dở khi thoát giữa câu: mở lại bài thì câu hiện lại từ đầu như các dạng câu khác (S3.3).
- Soạn nội dung câu sắp xếp cho HSK 1 (E11) và sửa các bài Nhập môn hiện có.
- Đổi quy tắc tạo thẻ ôn tập của S9.1/S9.4.

## Liên quan

- Phụ thuộc: S3.2 (màn chạy bài), S3.5 (bài kiểm tra cuối chủ đề, màn tổng kết).
- **S9.4** (spec đã merge ở `openspec/changes/s9-4-wrong-answers-srs/`, code chưa có): yêu cầu "không tạo thẻ" ở đây khớp dòng "Nói theo
  câu" của S9.4. Trước khi S9.4 có code thì chưa có gì tạo thẻ từ câu sai, Scenario "Câu sắp xếp sai không tạo thẻ ôn tập" sẽ pass trống.
  **Code S10.3 làm sau code S9.4.** Sau khi S9.4 archive, bảng "Câu nào là câu sai và thuộc từ nào" của `wrong-answer-review` cần thêm dòng
  "Sắp xếp câu | Chấm Sai | Không có" (sửa câu chữ, không đổi hành vi S9.4; như cách S9.4 ghi chú cho S9.1).
- **S9.1** (spec đã merge ở `openspec/changes/s9-1-review-cards/`, code chưa có): bảng "Từ nào của bài được tạo thẻ" chưa có dòng cho câu
  sắp xếp; S10.3 viết luật "câu sắp xếp không tạo thẻ" trong `sentence-order`. Trước khi S9.1 có code thì chưa có gì tạo thẻ, Scenario
  "Học xong bài thường chỉ có câu sắp xếp thì không tạo thẻ" sẽ pass trống; **code S10.3 làm sau code S9.1**. Sau khi S9.1 archive, bảng
  đó của `review-cards` cần thêm dòng "Sắp xếp câu | Không có" (sửa câu chữ, không đổi hành vi S9.1).
- Cùng epic, không phụ thuộc: S10.2, S10.4, S10.8 cũng là dạng bài mới cắm vào registry; không dùng chung nội dung với S10.3.

## Impact

- Schema nội dung thêm một dạng câu (thêm, không phá nội dung cũ). Kiểm tra nội dung thêm quy tắc.
- Thêm component dạng bài và style; không thêm dependency (kéo thả viết bằng sự kiện con trỏ có sẵn của trình duyệt).
- Gợi ý cho planner: chia task schema + kiểm tra nội dung trước, quy tắc xáo/chấm, rồi component dạng bài và style sau.
- **Dữ liệu nghiệm thu**: S10.3 không soạn bài thật (E11 soạn). Bài mẫu có câu sắp xếp chỉ nằm trong bản build `--mode e2e` (tiền lệ
  `apps/web/e2e/fixtures/offlineFixturesPlugin.ts`) hoặc e2e thay nội dung bằng chặn route (tiền lệ
  `apps/web/e2e/E8/multi-unit-path.helpers.ts`), không vào nội dung phát hành. QA nghiệm thu trên bản build e2e.

## Open Questions

- [x] Màn hiện gợi ý gì để người học biết câu cần ghép? → Hiện nghĩa tiếng Việt của câu; không phát audio, không hiện pinyin trước khi
  chấm (ba đề xuất, chờ người thật xác nhận)
- [x] Chạm và kéo cụ thể ra sao? → Chạm thẻ dưới: nối cuối câu; chạm thẻ trong câu: trả về chỗ cũ; kéo: đặt vào vị trí thả, đổi chỗ trong
  câu; bàn phím Enter/Space như chạm (ba đề xuất, chờ người thật xác nhận)
- [x] Khi nào được chấm? → Nút "Kiểm tra" chỉ bấm được khi mọi thẻ đã vào câu; không tự chấm khi đặt thẻ cuối (ba đề xuất, chờ người thật
  xác nhận)
- [x] Câu có từ lặp lại (vd hai thẻ "的") chấm thế nào? → So theo chữ trên thẻ, hai thẻ giống nhau đổi chỗ vẫn đúng (ba đề xuất, chờ người
  thật xác nhận)
- [x] "Hiện câu đúng" gồm gì, đúng thì có hiện không? → Hiện chữ Hán có dấu câu và pinyin cả khi đúng lẫn sai (như câu chọn thanh); sai thì
  thêm giải thích "Đáp án đúng: <câu chữ Hán>" (ba đề xuất, chờ người thật xác nhận)
- [x] Dấu câu có là thẻ không? → Không. Thẻ chỉ có từ; dấu câu chỉ hiện trong câu đúng sau khi chấm (ba đề xuất, chờ người thật xác nhận)
- [x] Giảm chuyển động? → Bật giảm chuyển động thì thẻ đổi chỗ ngay, không có hiệu ứng di chuyển (ba đề xuất, chờ người thật xác nhận)
- [x] Câu sắp xếp sai trong bài kiểm tra có vào ôn tập không? → Tính là câu sai trên màn tổng kết, không tạo/đổi thẻ ôn tập (như câu nói
  theo câu ở S9.4) (ba đề xuất, chờ người thật xác nhận)
- [x] (qa/dev-lead, major) Scenario "không tạo thẻ ôn tập" pass trống nếu S9.4 chưa có code → Ghi vào Liên quan: code S10.3 làm sau code
  S9.4; thêm dòng "Sắp xếp câu | Chấm Sai | Không có" vào bảng của `wrong-answer-review` sau khi S9.4 archive
- [x] (major) Focus sau Enter/Space đi đâu, có báo trình đọc màn hình không? → Bảng focus trong Requirement bàn phím: vào hàng thì tới thẻ
  kế còn lại bên dưới (hết thì nút "Kiểm tra"); về bên dưới thì tới thẻ kế trong hàng (hàng trống thì thẻ đầu bên dưới); báo "Đã thêm
  <chữ> vào câu" / "Đã bỏ <chữ> khỏi câu" mỗi khi thẻ chuyển vùng (chạm, kéo hay bàn phím); thêm Requirement focus (4 Scenario) và
  Requirement thông báo (2 Scenario) (ba đề xuất, chờ người thật xác nhận)
- [x] (major) Thứ tự ban đầu khác thứ tự đúng với thẻ trùng chữ → So theo dãy chữ trên thẻ; thêm Scenario "我的朋友的书" mở 20 lần
- [x] (minor) Scenario "không còn bị bỏ qua" sai Requirement, THEN không thấy được → Chuyển sang Requirement hiện nghĩa/thẻ, THEN là nghĩa,
  hàng câu trả lời, các thẻ và không có "Bỏ qua câu này"
- [x] (minor) Requirement nội dung lẫn hai lệnh; ID AC2 cho lỗi nội dung → Viết "kiểm tra nội dung và dựng nội dung", dựng nội dung không
  ghi ra khi lỗi; giữ AC2, lý do ghi ở What Changes
- [x] (minor) Thả đè lên một thẻ trong hàng thì đặt trước hay sau? → Nửa trái đặt trước, nửa phải đặt sau; chỗ trống sau thẻ cuối đặt cuối;
  thêm 2 Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] (minor) "Đặt đủ thẻ thì chưa tự chấm" THEN không thấy được → THEN: màn không hiện "Đúng" hay "Sai" cho tới khi bấm "Kiểm tra"
- [x] (minor) Nhãn vùng thẻ bên dưới → "Các từ", thêm vào Requirement và Scenario tên đọc được (ba đề xuất, chờ người thật xác nhận)
- [x] (minor) "Câu sắp xếp sai tính vào số câu sai" THEN chưa cụ thể → THEN: màn tổng kết hiện "Sai 1 câu"
- [x] (minor) Dữ liệu nghiệm thu → Ghi ở Impact: bài mẫu chỉ trong bản build e2e hoặc chặn route, không vào nội dung phát hành; QA nghiệm
  thu trên bản build e2e
- [x] (minor) Gợi ý chia task → Một dòng ở Impact cho planner
- [x] (vòng 2, major) Scenario focus "đưa thẻ vào câu" có bên dưới đúng thứ tự "我", "很", "好", không dựng được → Đổi WHEN: bên dưới
  "好", "我", "很", hàng trống, Enter trên "我" → focus trên "很" bên dưới; đã soát các Scenario focus/thông báo khác, không còn Scenario
  nào đặt thứ tự ban đầu bên dưới trùng thứ tự đúng
- [x] (vòng 2, major) Học xong bài thường có câu sắp xếp có tạo thẻ ôn tập (S9.1) không? → Không, như "Câu nói theo câu"; thêm Requirement
  và Scenario "Học xong bài thường chỉ có câu sắp xếp thì không tạo thẻ"; ghi ở Liên quan: code S10.3 làm sau code S9.1, bảng S9.1 thêm
  dòng "Sắp xếp câu | Không có" sau khi S9.1 archive (ba đề xuất, chờ người thật xác nhận)
- [x] (vòng 2, minor) Bảng Layer đích thiếu chữ i18n → Thêm dòng "Chữ hiện trên màn (nhãn, thông báo, giải thích) | `core/services/` (i18n)"
