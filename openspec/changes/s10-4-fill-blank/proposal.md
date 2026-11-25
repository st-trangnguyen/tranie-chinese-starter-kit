# Proposal: S10.4 Điền chỗ trống

Story **S10.4 Điền chỗ trống · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s104-điền-chỗ-trống--f3)) ·
GitHub issue [#47](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/47). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #47

## Why

Là người học, tôi muốn điền từ còn thiếu trong câu để luyện dùng từ và ngữ pháp. Các dạng bài bản 0.1 (E4–E6) chỉ luyện âm, pinyin, nói và
viết từng từ; chưa có dạng nào bắt người học dùng từ trong ngữ cảnh một câu. S10.4 thêm dạng câu "Điền chỗ trống" chạy trong màn bài hiện có.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng câu mới "Điền chỗ trống" trong nội dung, kiểm tra nội dung hợp lệ (đúng một chỗ trống, đáp án có trong lựa chọn…) | `packages/shared` (`@csk/shared`, schema nội dung) |
| Quy tắc chấm: so câu trả lời với đáp án (chữ Hán, hoặc pinyin theo quy tắc chấm pinyin S4.3) | `shared/services/` (Phần 2, pure), dùng lại quy tắc chuẩn hóa pinyin có sẵn |
| Giao diện câu: câu có chỗ trống, các lựa chọn hoặc ô gõ, kết quả | `shared/components/exercises/` (component mới, đăng ký vào registry theo dạng câu) |
| Nối dạng câu mới vào màn bài | `pages/lesson/` (hook/container màn bài hiện có, nếu registry chưa đủ) |
| Style | `apps/web/src/styles/tailwind/` (BEM class mới) |

## What Changes

- **Dạng câu mới "Điền chỗ trống"**: màn bài hiện một câu chữ Hán có đúng một chỗ trống và nghĩa tiếng Việt của cả câu. Người học điền từ
  còn thiếu theo một trong hai kiểu, do nội dung của câu quyết định:
  - **Chọn**: chạm một trong các lựa chọn (chữ Hán), câu được chấm ngay khi chạm, không cần bấm "Kiểm tra". Theo quy tắc chung câu
    trắc nghiệm E10 của S10.2: thứ tự lựa chọn xáo mỗi lần câu hiện, giữ nguyên tới khi rời câu; sau khi chấm, trên đáp án có nhãn "Đáp án đúng",
    trên lựa chọn sai đã chọn có nhãn "Đã chọn" (bằng chữ, không chỉ màu); khóa lựa chọn, chọn được bằng bàn phím.
  - **Gõ**: gõ từ vào ô rồi bấm "Kiểm tra" hoặc nhấn Enter. Chấp nhận chữ Hán của đáp án, hoặc pinyin của đáp án theo đúng quy tắc chấm của
    câu gõ pinyin (S4.3: kiểu số hay kiểu dấu, liền hay cách, hoa/thường, khoảng trắng thừa, thanh nhẹ nhận cả khi gõ số 5 lẫn khi không
    gõ số). Chữ Hán bỏ qua mọi khoảng trắng (cả dấu cách toàn khổ). Ô gõ giữ nguyên chữ đã gõ, không tự đổi số thành dấu. Ô trống thì chưa
    chấm; Enter dùng để xác nhận chữ trong bộ gõ tiếng Trung không chấm câu.
- **Chấm ngay**: chấm xong thì chỗ trống hiện từ đúng, câu đầy đủ hiện kèm pinyin; lựa chọn/ô gõ bị khóa. Sai thì giải thích là
  "Đáp án đúng: <chữ Hán> · <pinyin>". Phần "Đúng"/"Sai"/"Tiếp tục" theo màn bài hiện có (lesson-runner).
- **Chưa chấm thì không lộ đáp án**: trước khi chấm không hiện pinyin của câu (pinyin của câu chứa pinyin của từ cần điền). Sau khi chấm
  luôn hiện pinyin của câu, kể cả khi "Hiện pinyin" tắt.
- **Kiểm tra nội dung**: câu điền chỗ trống phải có đúng một chỗ trống; kiểu chọn phải có 2–4 lựa chọn không trùng, đáp án nằm trong các lựa
  chọn; kiểu gõ không có lựa chọn; đáp án có đủ chữ Hán và pinyin; câu có pinyin câu đầy đủ và nghĩa. Sai thì kiểm tra nội dung báo lỗi chỉ
  rõ bài và câu, không ghi nội dung ra.
- Màn bài hiện câu điền chỗ trống, không đánh dấu "bỏ qua vì dạng bài chưa có".

## Không làm

- Không soạn bài học hay chủ đề mới có câu điền chỗ trống; S10.4 chỉ thêm dạng câu và kiểm tra nội dung. Đưa câu vào lộ trình là việc của
  story nội dung (ngoài S10.4).
- Không có nhiều chỗ trống trong một câu, không có nhiều đáp án đúng cho một chỗ trống.
- Không cho người học tự đổi giữa kiểu chọn và kiểu gõ trên cùng một câu.
- Ô gõ điền chỗ trống không tự đổi pinyin kiểu số thành dấu như ô gõ pinyin (S4.3-AC1), vì ô nhận cả chữ Hán lẫn pinyin.
- Kiểm tra nội dung không so pinyin của câu với chữ Hán của câu.
- Không tô chỗ sai theo thanh mẫu/vận mẫu/thanh điệu như câu gõ pinyin (S4.3-AC3); sai chỉ hiện đáp án đúng.
- Không có nút nghe audio câu, không có chạm từ để tra nghĩa (S10.8 làm việc chạm từ ở bài đọc).
- Không đưa câu điền chỗ trống làm sai vào ôn tập (S9.4 chỉ liệt kê các dạng câu bản 0.1); nối vào ôn tập là story riêng nếu cần.
- Công tắc "Hiện pinyin" (S8.2) không đổi: câu điền chỗ trống chỉ hiện pinyin sau khi chấm, là đáp án nên luôn hiện.
- Không thêm dependency.

## Dependencies

- **lesson-runner** (S3.2): dùng nguyên cách hiện "Đúng"/"Sai", giải thích, "Tiếp tục", khóa đáp án; không đổi Requirement.
- **pinyin-type** (S4.3): dùng lại quy tắc chấp nhận kiểu gõ pinyin; không đổi Requirement.
- **S10.2 Nhận diện từ** (đang viết spec song song): sở hữu quy tắc chung cho câu trắc nghiệm của E10 (xáo thứ tự lựa chọn, giữ nguyên tới
  khi rời câu, nhãn "Đáp án đúng"/"Đã chọn" bằng chữ trên lựa chọn, khóa lựa chọn và bàn phím, xáo mới khi mở lại bài đang dở hoặc học lại). Kiểu chọn của S10.4 theo quy tắc đó; quy tắc đổi ở S10.2 thì S10.4 đổi theo.
- **S10.3** (đang viết spec song song): cùng là dạng câu mới của E10 trong màn bài. S10.4 không phụ thuộc thứ tự merge với S10.2/S10.3.
- **S10.5 Thẻ ngữ pháp**: không phụ thuộc; câu điền chỗ trống không trỏ tới thẻ ngữ pháp ở S10.4.

## Capabilities

### New Capabilities
- `fill-blank`: câu chữ Hán có một chỗ trống, người học chọn hoặc gõ từ còn thiếu, chấm ngay, sai thì hiện đáp án; kiểm tra nội dung chặn
  câu sai cấu trúc.

### Modified Capabilities
(không có; `lesson-runner`, `pinyin-type`, `settings` giữ nguyên)

## Impact

- Code mới/sửa: schema nội dung (dạng câu mới), quy tắc chấm điền chỗ trống, component dạng câu + đăng ký registry, kiểm tra nội dung, style.
- Không đổi dữ liệu tiến độ lưu trên máy, không đổi file sao lưu. Không thêm dependency.
- Tầng test: Vitest cho quy tắc chấm và schema/kiểm tra nội dung; Testing Library cho component dạng câu và màn bài; e2e Playwright cho một
  bài mẫu có câu điền chỗ trống (một câu kiểu chọn, một câu kiểu gõ).
- Nguồn dữ liệu nghiệm thu: vì S10.4 không soạn bài thật, bài mẫu có câu điền chỗ trống chỉ có trong bản build dành cho e2e (theo tiền lệ
  S1.2/S8.4), bản build thường không có. QA nghiệm thu `test-cases.md` trên bản build đó.

## Open Questions

- [x] **"Chọn hoặc gõ" nghĩa là gì: mỗi câu một kiểu do nội dung quyết định, hay người học tự chọn kiểu trên cùng một câu?** → Mỗi câu một
  kiểu do nội dung quyết định; người học không đổi kiểu (Requirement "Mỗi câu có một kiểu điền: chọn hoặc gõ") (ba đề xuất, chờ người thật
  xác nhận)
- [x] **Kiểu gõ chấp nhận gì: chỉ chữ Hán, hay cả pinyin?** → Chấp nhận chữ Hán hoặc pinyin theo quy tắc S4.3; pinyin thiếu/sai thanh là
  sai, trừ thanh nhẹ nhận cả khi gõ số 5 lẫn khi không gõ số (Requirement "Kiểu gõ chấp nhận chữ Hán hoặc pinyin của đáp án") (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Trước khi chấm hiện gì?** → Câu chữ Hán có chỗ trống + nghĩa tiếng Việt, không hiện pinyin dù "Hiện pinyin" bật; sau khi chấm luôn
  hiện câu đầy đủ kèm pinyin dù "Hiện pinyin" tắt (Requirement "Chưa chấm thì không lộ đáp án") (ba đề xuất, chờ người thật xác nhận)
- [x] **Số lựa chọn và thứ tự ở kiểu chọn?** → 2–4 lựa chọn; kiểm tra nội dung chặn ngoài 2–4, trùng, đáp án không nằm trong lựa chọn
  (Requirement "Mỗi câu có một kiểu điền" và "Nội dung câu điền chỗ trống phải hợp lệ"). Thứ tự: xem finding dev-lead bên dưới (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Sai thì có tô chỗ sai như câu gõ pinyin không?** → Không, chỉ hiện "Đáp án đúng: <chữ Hán> · <pinyin>" (Requirement "Chọn hoặc gõ
  từ vào chỗ trống, chấm ngay", mục "Không làm") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thanh nhẹ ở kiểu gõ mâu thuẫn với S4.3?** (finding 2) → Sửa theo S4.3: thanh nhẹ nhận cả "ma" lẫn "ma5", "ma1" sai; thêm dòng bảng
  và Scenario (Requirement "Kiểu gõ chấp nhận chữ Hán hoặc pinyin của đáp án")
- [x] **Ô gõ có tự đổi "chi1" thành "chī" như S4.3-AC1 không?** (finding 3) → Không, ô giữ nguyên chữ đã gõ vì nhận cả chữ Hán; thêm
  Requirement "Ô gõ giữ nguyên chữ đã gõ và tôn trọng bộ gõ tiếng Trung" + Scenario, và mục "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Nghiệm thu trên bản build lấy dữ liệu ở đâu khi S10.4 không soạn bài thật?** (finding 4) → Bài mẫu chỉ có trong bản build e2e theo
  tiền lệ S1.2/S8.4, QA nghiệm thu trên bản build đó; bỏ cụm "khi nội dung đã có" (mục Impact) (ba đề xuất, chờ người thật xác nhận)
- [x] **Sau khi chấm có hiện pinyin khi "Hiện pinyin" tắt không?** (finding 5) → Có, thêm Scenario (Requirement "Chưa chấm thì không lộ
  đáp án")
- [x] **Kiểm tra nội dung có chặn kiểu gõ có lựa chọn, đáp án thiếu pinyin, câu đầy đủ không khớp không?** (finding 6) → Chặn kiểu gõ có
  lựa chọn, đáp án thiếu chữ Hán/pinyin, thiếu pinyin câu hoặc nghĩa; câu đầy đủ do điền đáp án vào chỗ trống nên không thể lệch; không so
  pinyin câu với chữ Hán (Requirement "Nội dung câu điền chỗ trống phải hợp lệ" và "Câu điền chỗ trống phải đủ chữ,
  pinyin và nghĩa") (ba đề xuất, chờ người thật xác nhận)
- [x] **Enter xác nhận chữ trong bộ gõ tiếng Trung có chấm câu không?** (finding 7) → Không, chỉ Enter khi không đang chọn chữ mới chấm;
  thêm Scenario (Requirement "Ô gõ giữ nguyên chữ đã gõ và tôn trọng bộ gõ tiếng Trung") (ba đề xuất, chờ người thật xác nhận)
- [x] **"米 饭" và dấu cách toàn khổ "　吃　" có đúng không?** (finding 8) → Đúng, so chữ Hán bỏ qua mọi khoảng trắng kể cả toàn khổ; thêm
  dòng bảng và Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **Dependencies nói "có thể dùng chung dữ liệu câu ví dụ" với S10.2/S10.3?** (finding 9) → Bỏ cụm đó, chỉ giữ "không phụ thuộc thứ tự
  merge"
- [x] **Thứ tự lựa chọn trắc nghiệm không thống nhất trong E10: S10.4 giữ thứ tự người soạn, S10.2 xáo; bài làm lại không giới hạn nên thứ tự
  cố định để người học nhớ vị trí đáp án** (finding dev-lead, duyệt S10.2/S10.8) → Đồng ý; kiểu chọn theo quy tắc chung của S10.2: xáo mỗi
  lần câu hiện, giữ nguyên tới khi rời câu, sau khi chấm ghi "Đáp án đúng"/"Đã chọn" bằng chữ. Thêm Requirement "Kiểu chọn theo quy tắc
  chung câu trắc nghiệm E10" + 3 Scenario, sửa bảng kiểu điền, Scenario "hiện các lựa chọn" (thứ tự bất kỳ), Dependencies trỏ S10.2 (ba đề
  xuất, chờ người thật xác nhận)
- [x] **Nhãn trên lựa chọn sau khi chấm viết thường "đáp án đúng"/"đã chọn", lệch với S10.2 ("Đáp án đúng"/"Đã chọn")** (finding vòng 2,
  major) → Sửa khớp từng chữ với S10.2 ở bảng, Scenario "Chọn đúng…", "Chọn sai…", "Kết quả trên lựa chọn ghi bằng chữ", What Changes,
  Dependencies; Scenario ghi rõ nhãn nằm trên lựa chọn, khác dòng giải thích "Đáp án đúng: 吃 · chī" (giữ nguyên)
- [x] **Requirement "Kiểu chọn theo quy tắc chung…" chưa nói rõ phạm vi dẫn lại** (finding vòng 2, minor) → Thêm câu: gồm cả khóa lựa
  chọn, chọn bằng bàn phím và các trường hợp xáo mới (mở lại bài đang dở, học lại, gặp ở lần học khác) của S10.2
- [x] **Đáp án thiếu chữ Hán chưa có Scenario** (finding vòng 2, minor) → Thêm Scenario "Đáp án thiếu chữ Hán thì bị báo lỗi"
  (Requirement "Câu điền chỗ trống phải đủ chữ, pinyin và nghĩa")
