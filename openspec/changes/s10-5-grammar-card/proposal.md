# Proposal: S10.5 Thẻ ngữ pháp

Story **S10.5 Thẻ ngữ pháp · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s105-thẻ-ngữ-pháp--f3)) ·
GitHub issue [#48](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/48). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #48

## Why

Là người học, tôi muốn đọc giải thích ngữ pháp bằng tiếng Việt để hiểu cách dùng. Bài "Ngữ pháp" là một trong năm loại bài của mỗi chủ đề
HSK 1 (S11.1, S11.2), nhưng màn bài hiện chỉ có các dạng bài tập luyện nghe, nói, viết; chưa có chỗ để người học đọc một điểm ngữ pháp trước
khi luyện. S10.5 thêm thẻ ngữ pháp: một câu trong bài, chỉ để đọc và nghe, không chấm đúng sai.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Schema Zod cho điểm ngữ pháp và dạng bài thẻ ngữ pháp (nội dung JSON phải validate khi nạp) | `packages/shared` (`@csk/shared`) |
| Pipeline nội dung: soạn, build điểm ngữ pháp, kiểm tra nội dung báo lỗi thẻ ngữ pháp thiếu dữ liệu, đưa audio ví dụ vào audio của chủ đề | `content/` (`@csk/content`) |
| Nạp điểm ngữ pháp và câu ví dụ cho thẻ; xếp thẻ ngữ pháp vào tập câu không chấm điểm của S10.1 (Phần 2) | `shared/services/` (service nội dung hiện có) |
| Component thẻ ngữ pháp, đăng ký vào registry theo dạng bài; audio ví dụ qua hook audio | `shared/components/exercises/` + `core/hooks/` (hook audio hiện có) |
| Màn bài cho thẻ ngữ pháp sang câu kế mà không qua bước chấm (dùng luồng câu không chấm điểm của S10.1) | `pages/lesson/hooks/`, `pages/lesson/components/` |
| Nhãn giao diện ("Giải thích", "Cấu trúc", "Ví dụ", "Nghe ví dụ …") | `apps/web/src/assets/i18n/vi/` |
| Style BEM của thẻ | `apps/web/src/styles/tailwind/` |

Không có màn mới: thẻ ngữ pháp hiện trong màn bài hiện có, như một câu của bài.

## What Changes

- **Dạng bài mới "thẻ ngữ pháp"** trong màn bài. Thẻ hiện tiêu đề điểm ngữ pháp, đoạn **giải thích tiếng Việt**, **cấu trúc câu** và
  **danh sách ví dụ**. Mỗi ví dụ có chữ Hán, pinyin, nghĩa tiếng Việt và nút nghe audio của câu ví dụ.
- **Thẻ ngữ pháp là câu không chấm điểm** theo quy tắc chung của E10 do **S10.1** sở hữu (delta `lesson-runner` của
  `s10-1-word-flashcard`): "Tiếp tục" ngay, không "Đúng"/"Sai", vẫn đếm trong "Câu k / n" và vị trí học dở, bấm "Tiếp tục" là đã làm (không
  phải bỏ qua), không tính vào điểm và số câu; bài kiểm tra không có câu không chấm điểm, bài học phải có ít nhất một câu chấm điểm.
  S10.5 chỉ thêm thẻ ngữ pháp vào tập dạng câu đó (delta `lesson-runner` nhỏ), không định nghĩa lại quy tắc.
- **Audio ví dụ:** không tự phát, nghe lại không giới hạn, mỗi lúc chỉ một ví dụ phát, theo tốc độ "Nghe chậm" đang dùng trong bài; audio
  lỗi thì báo "Không phát được audio." như ở câu nghe và vẫn đi tiếp được. Audio ví dụ thuộc audio của chủ đề: tính vào dung lượng tải,
  được tải về và phát được offline sau khi tải (S8.4).
- **Kiểm tra nội dung** (cho người soạn nội dung) báo lỗi khi thẻ ngữ pháp trỏ tới điểm ngữ pháp không có, điểm ngữ pháp thiếu tiêu đề,
  giải thích hoặc cấu trúc, không có ví dụ, hoặc ví dụ trỏ tới câu không có.

## Dữ liệu nghiệm thu

Nội dung phát hành không có bài nào chứa thẻ ngữ pháp (12 bài Nhập môn không đổi, bài "Ngữ pháp" HSK 1 là S11.2). Bài mẫu có thẻ ngữ pháp
chỉ có trong bản build dành cho kiểm thử tự động (theo tiền lệ bài mẫu của S1.2, S8.4), hoặc e2e thay nội dung bài khi chạy; bản app người
học tải về không có bài mẫu nào. QA nghiệm thu S10.5 trên bản build kiểm thử đó.

## Không làm (out of scope)

- Soạn nội dung ngữ pháp HSK 1 (các điểm ngữ pháp, bài Ngữ pháp của từng chủ đề) → **S11.2**. S10.5 chỉ cần nội dung mẫu đủ để test.
- Thẻ ngữ pháp **không tạo thẻ ôn tập** (S9.1 không tạo thẻ cho câu; ví dụ của thẻ ngữ pháp là câu). Ôn tập điểm ngữ pháp chưa có trong backlog.
- Công tắc "Nghe chậm" riêng trên thẻ; ẩn pinyin của ví dụ theo cài đặt "Hiện pinyin" (cài đặt này chỉ áp dụng cho câu nói, S8.2).
- Chạm vào từ trong ví dụ để xem nghĩa (đó là S10.8 cho đoạn đọc hiểu), tô màu thành phần câu trong ví dụ, bảng tra ngữ pháp riêng ngoài bài.
- Bài tập luyện ngữ pháp có chấm (sắp xếp câu S10.3, điền chỗ trống S10.4).
- Đổi quy tắc mở khóa bài, quy tắc "Đã xong" (S3.4), cách tính điểm của các câu có chấm.

## Dependencies

- **S3.2 / S3.3 / S3.4** (đã có): màn bài, thanh "Câu k / n", lưu vị trí học dở, màn tổng kết.
- **S4.4 / S8.2** (đã có): nút "Nghe", nghe lại không giới hạn, tốc độ "Nghe chậm" giữ qua các câu trong bài. Thẻ ngữ pháp dùng lại hành vi này cho audio ví dụ.
- **S8.4** (đã có): tải audio theo chủ đề. Danh sách audio của chủ đề hiện chỉ gồm audio của các dạng bài đã có, nên S10.5 phải thêm audio
  ví dụ của thẻ ngữ pháp vào danh sách đó (Requirement "Audio ví dụ thuộc audio của chủ đề").
- **S10.1 Flashcard từ mới** (spec viết song song): sở hữu quy tắc chung câu chấm điểm / câu không chấm điểm và hai luật kiểm tra nội dung
  (delta `lesson-runner` của `s10-1-word-flashcard`). S10.5 chỉ thêm thẻ ngữ pháp vào tập câu không chấm điểm. **Thứ tự code: S10.1 trước
  S10.5.** Nếu S10.1 đổi quy tắc này thì S10.5 theo, không định nghĩa riêng.
- **S11.1 / S11.2** (sau): dùng thẻ ngữ pháp trong bài "Ngữ pháp" của 15 chủ đề HSK 1.

## Capabilities

### New Capabilities
- `grammar-card`: thẻ ngữ pháp trong màn bài: giải thích tiếng Việt, cấu trúc câu, ví dụ có audio (thuộc audio chủ đề); kiểm tra nội dung
  chặn thẻ thiếu dữ liệu.

### Modified Capabilities
- `lesson-runner`: thêm yêu cầu "Thẻ ngữ pháp là câu không chấm điểm" (thêm dạng vào tập câu không chấm điểm của S10.1, không đổi quy tắc).
  Hành vi của các câu chấm điểm và audio của câu nghe không đổi.

## Open Questions

- [x] **Thẻ ngữ pháp có chấm không, sang câu kế thế nào?** → không chấm; thẻ hiện là có ngay nút "Tiếp tục", không có "Đúng"/"Sai" (theo quy tắc S10.1; Requirement `lesson-runner` "Thẻ ngữ pháp là câu không chấm điểm") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ có tính vào "Câu k / n", vị trí học dở, điểm và điều kiện "Đã xong" không?** → có trong "Câu k / n" và vị trí học dở; bấm "Tiếp tục" là đã làm, không phải bỏ qua, nên không cản bài thành "Đã xong"; không tính vào điểm và số câu sai (theo quy tắc S10.1) (ba đề xuất, chờ người thật xác nhận)
- [x] **Bài chỉ gồm thẻ ngữ pháp, hoặc bài kiểm tra có thẻ ngữ pháp thì điểm tính sao?** → kiểm tra nội dung từ chối cả hai trường hợp (cùng luật S10.1), nên màn tổng kết không bao giờ gặp bài không có câu chấm (luật chung S10.1 sở hữu) (ba đề xuất, chờ người thật xác nhận)
- [x] **Ví dụ hiện những gì? Pinyin có theo cài đặt "Hiện pinyin" không?** → chữ Hán, pinyin, nghĩa tiếng Việt và nút nghe; pinyin luôn hiện vì cài đặt "Hiện pinyin" (S8.2) chỉ ẩn pinyin ở câu nói (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio ví dụ tự phát hay bấm? Tốc độ?** → bấm nút nghe của từng ví dụ, không tự phát (như S4.4); bấm ví dụ khác thì ví dụ đang phát dừng; theo tốc độ "Nghe chậm" đang dùng trong bài, thẻ không có công tắc riêng; audio lỗi thì báo, vẫn bấm "Tiếp tục" được (Requirement "Nghe audio của ví dụ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ thiếu dữ liệu thì sao?** → chặn ở kiểm tra nội dung cho người soạn (Requirement "Kiểm tra nội dung chặn thẻ ngữ pháp thiếu dữ liệu"); không thêm trạng thái lỗi riêng trên màn bài vì nội dung hỏng đã có thông báo "không mở được bài" (S3.2) (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ ngữ pháp có tạo thẻ ôn tập (S9.1) không?** → không; ghi ở "Không làm" (ba đề xuất, chờ người thật xác nhận)

- [x] **(Vòng 1, finding 1) Quy tắc câu không chấm điểm định nghĩa trùng với S10.1?** → bỏ các Requirement trùng ("Thẻ ngữ pháp không
  chấm", "tính vào tiến độ", "Điểm tổng kết", "Kiểm tra nội dung chặn bài không hợp"); thêm delta `lesson-runner` một yêu cầu xếp thẻ ngữ
  pháp vào tập câu không chấm điểm của S10.1, kèm Scenario bài trộn 1 thẻ ngữ pháp + 1 thẻ từ mới bị báo lỗi; ghi phụ thuộc code S10.1 trước
- [x] **(Vòng 1, finding 2) Audio ví dụ có tự vào audio offline của chủ đề không?** → không tự vào (danh sách audio của chủ đề chỉ lấy audio
  các dạng bài đã có); thêm Requirement "Audio ví dụ thuộc audio của chủ đề" (tính dung lượng, tải về, phát offline), sửa mục Dependencies
  và Impact (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, finding 3) Bài mẫu để nghiệm thu lấy ở đâu khi không vào nội dung phát hành?** → chỉ có trong bản build kiểm thử tự động
  (hoặc e2e thay nội dung); QA nghiệm thu trên bản build đó (mục "Dữ liệu nghiệm thu") (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, finding 4) Thông báo audio lỗi viết thế nào?** → "Không phát được audio." như ở câu nghe, khớp S10.1/S10.6
- [x] **(Vòng 1, finding 5) Bảng thiếu dữ liệu có ba trường hợp tiêu đề/giải thích/cấu trúc nhưng chỉ có Scenario thiếu giải thích?** →
  thêm Scenario thiếu tiêu đề và thiếu cấu trúc
- [x] **(Vòng 1, finding 6) Tên nút "Nghe ví dụ 1/2" khác "Nghe câu ví dụ" của S10.1?** → giữ "Nghe ví dụ <n>": thẻ ngữ pháp có nhiều ví dụ
  nên cần số thứ tự để trình đọc màn hình phân biệt; nhãn mục đã là "Ví dụ" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 2, finding 1) Scenario "Thẻ ngữ pháp có Tiếp tục ngay" nói "không hiện giải thích" mâu thuẫn với phần "Giải thích" của thẻ?**
  → sửa THEN: không hiện thông báo "Đúng"/"Sai" hay phần giải thích đáp án (phần hiện khi trả lời sai, S3.2); phần giải thích ngữ pháp
  dưới nhãn "Giải thích" vẫn hiện
- [x] **(Vòng 2, finding 2) Impact "Tầng test" còn ghi quy tắc tổng kết dù S10.1 sở hữu?** → đổi thành test việc xếp thẻ ngữ pháp vào tập
  câu không chấm điểm (Phần 2); câu Requirement `lesson-runner` khai báo rõ thẻ ngữ pháp là câu không chấm điểm, khớp bảng mở theo khai
  báo của S10.1

## Impact

- Code mới: component thẻ ngữ pháp (+ test), schema điểm ngữ pháp và dạng bài mới, phần build/kiểm tra điểm ngữ pháp trong pipeline nội dung.
- Code sửa: registry dạng bài, tập dạng câu không chấm điểm của S10.1 (thêm thẻ ngữ pháp), nạp nội dung (điểm ngữ pháp), danh sách audio
  của chủ đề trong pipeline nội dung (thêm audio câu ví dụ của thẻ ngữ pháp, ảnh hưởng dung lượng tải và tải offline của chủ đề).
- Nội dung: thêm file điểm ngữ pháp do pipeline sinh; không đổi dữ liệu người dùng trong trình duyệt, không đổi file sao lưu.
- Dependency: không thêm.
- Tầng test: Vitest cho schema và kiểm tra nội dung, việc xếp thẻ ngữ pháp vào tập câu không chấm điểm (Phần 2); Testing Library cho component thẻ và màn bài; e2e Playwright
  cho luồng làm bài có thẻ ngữ pháp, audio ví dụ lỗi và nghe ví dụ offline sau khi tải chủ đề, chạy trên bản build kiểm thử.
