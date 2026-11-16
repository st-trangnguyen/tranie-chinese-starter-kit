# Proposal: S7.1 Soạn 12 bài Nhập môn

Story **S7.1 Soạn 12 bài Nhập môn · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s71-soạn-12-bài-nhập-môn--nội-dung)) ·
GitHub issue [#36](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/36). Bản 0.1, epic E7.

Refs #36

## Why

Là người soạn nội dung, tôi muốn có đủ 12 bài Nhập môn để người học nắm pinyin và chữ Hán cơ bản. Hiện giai đoạn
Nhập môn chỉ có một bài mẫu của pipeline (E2); bản 0.1 cần đủ 12 bài để người học đi hết giai đoạn, kể cả khi offline.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| 12 file bài YAML + lộ trình giai đoạn Nhập môn | `content/authored/` (đầu vào pipeline E2) |
| JSON nội dung + mp3 sinh ra | `apps/web/src/assets/content/` (pipeline sinh, không sửa tay) |
| Kiểm tra số dạng bài tập / audio của từng bài; câu viết phải là một chữ có dữ liệu nét (lỗi, không chỉ cảnh báo) | `content/scripts/content-check/` |
| Đăng ký dạng bài viết chữ vào registry màn bài, dùng lại khung viết có gợi ý của S6.2 (chỉ nhận props/callback) | `shared/components/exercises/` |
| State câu viết trong bài (viết xong thì câu đúng), tải dữ liệu nét và trạng thái tải, liên kết "Xem thứ tự nét" của câu viết | `pages/<feature bài học>/hooks/` (hoặc `core/hooks/`), `pages/<feature bài học>/components/`; dữ liệu nét và trạng thái tải đi vào khung viết qua props, vì `shared/components/exercises/` không gọi service (CLAUDE.md §2) |
| Quy tắc tính kết quả câu viết vào tổng kết bài (nếu cần rule riêng) | `shared/services/` (service bài học hiện có, Phần 2) |
| Nhãn giao diện mới ("Xem thứ tự nét" trong câu viết; thông báo cuối bài khi có câu bỏ qua không nêu lý do) | `assets/i18n/vi/` |
| Kiểm tra mở bài 1 sau onboarding, học offline 12 bài, câu viết trong bài 10–11 | Playwright `apps/web/e2e/E7/` |

Không thêm màn mới: màn xem thứ tự nét và màn luyện viết là của S6.1, S6.2; S7.1 chỉ thêm dạng bài viết vào màn bài và lối vào.

## What Changes

- Giai đoạn "Nhập môn" có đúng 12 bài theo đúng thứ tự và tiêu đề của AC2, thay bài mẫu hiện có.
- Mỗi bài có audio và ít nhất 2 dạng bài tập, chỉ dùng các dạng bài màn bài đã hỗ trợ: chọn thanh điệu (S4.1),
  phân biệt cặp âm (S4.2), gõ pinyin (S4.3), nói theo mẫu (S5.x), và **viết chữ theo nét** (thêm ở story này). Không câu nào phải bỏ qua.
  Nút "Nghe" phát đúng audio của từ/câu đang hỏi.
- **Màn bài hỗ trợ dạng viết chữ** (người thật chốt gộp vào S7.1): mỗi câu viết là một chữ Hán, dùng khung viết có gợi ý của S6.2;
  viết xong nét cuối thì câu "Đúng" (lần sai nét không làm câu sai), khung khóa lại, không có "Viết lại", không ghi thẻ ôn tập.
  Câu viết có các trạng thái đang tải / lỗi tải ("Thử lại" hoặc bỏ qua) / không có dữ liệu nét như S6.1. Bài 10 "Nét cơ bản và
  thứ tự nét" có câu viết chữ "人" và "十", bài 11 "30 bộ thủ phổ biến" có câu viết bộ thủ đứng được thành chữ HSK 1; làm hết
  thì bài "Đã xong" như bài khác.
- Bài 2 "Thanh nhẹ và biến điệu" luyện biến điệu bằng nói theo mẫu; câu chọn thanh và gõ pinyin của bài 2 không hỏi từ có biến điệu.
  Ở các bài khác (ví dụ "你好" ở bài 12), câu gõ pinyin vẫn chấm theo thanh gốc như S4.3 (quy ước viết pinyin), trong khi audio đọc
  có biến điệu; không đổi luật chấm.
- **Lối vào S6.1/S6.2 từ bài Nhập môn**: mỗi câu viết có liên kết "Xem thứ tự nét" mở màn thứ tự nét của chữ đó, từ đó nút "Tập viết"
  (S6.2) mở màn luyện viết; quay lại thì về đúng câu viết, làm lại từ đầu câu, và tổng kết bài chỉ tính từ câu đó (luật
  làm tiếp S3.4 đã có).
- **Chữ không có dữ liệu nét**: kiểm tra nội dung báo lỗi nếu câu viết dùng chữ không có dữ liệu nét, từ nhiều chữ, rỗng hoặc không phải
  chữ Hán; nếu lúc chạy vẫn gặp, màn bài hiện "Chưa có dữ liệu nét cho chữ này." và cho bỏ qua câu (bài chưa hoàn thành), không kẹt.
- **Màn bài (lesson-runner) đổi**: bảng chấm thêm dòng câu viết (chỉ "Đúng", khóa, không giải thích); luật bỏ qua câu giữ cho dạng bài
  chưa hỗ trợ và thêm câu viết không hiện được khung viết; thông báo cuối bài không còn nêu lý do "dạng bài chưa có".
- Kiểm tra nội dung chạy qua không lỗi với 12 bài.
- Xong onboarding thì vào bài 1 "Thanh 1–4" (nhận từ S1.3 AC4).
- Đã mở app một lần thì offline vẫn học trọn 12 bài, kể cả audio (nhận từ S1.2 AC2).

## Không làm (out of scope)

- Dạng bài tập mới ngoài viết chữ theo nét.
- Viết không gợi ý (S6.3) trong màn bài, chấm mức vào thẻ ôn tập chiều viết, tạo thẻ chiều viết (S9.1 AC2): câu viết trong bài chỉ dùng khung có gợi ý.
- Câu viết nhiều chữ trong một câu; sửa màn xem thứ tự nét hoặc màn luyện viết của S6.1/S6.2 (dùng nguyên như đã spec).
- Cách hoàn thành câu viết bằng bàn phím thay cho thao tác vẽ: viết là thao tác trỏ (ngoại lệ đường vẽ của WCAG, như S6.2);
  người dùng bàn phím có liên kết "Xem thứ tự nét".
- Lối vào màn thứ tự nét / luyện viết từ thẻ từ vựng.
- Màn lý thuyết / phần giảng giải trước bài tập: màn bài hiện chỉ có câu bài tập.
- Bài kiểm tra cuối chủ đề (S3.5) và kiểm tra vượt cấp (S3.6) cho giai đoạn Nhập môn.
- Quy tắc mở khóa, màn lộ trình, màn bài, onboarding, cơ chế lưu sẵn offline: đã có ở S3.x, S1.2, S1.3; S7.1 chỉ cung cấp nội dung.
- Từ ngoài danh sách HSK 1 (ví dụ bộ thủ không đứng một mình như 氵, 扌): bài chỉ dùng từ có trong từ điển của app (S2.3 AC3).
- Nghĩa tiếng Việt chưa review (cảnh báo S2.2) không chặn story này; AC3 chỉ đòi không có lỗi.

## Dependencies

- **E2 pipeline (S2.1–S2.5)**: soạn bài bằng YAML, kiểm tra schema, tạo audio TTS, dữ liệu nét. Đã có.
- **S3.1, S3.2, S3.4**: màn lộ trình, màn bài, quy tắc mở khóa Nhập môn. Đã có (`openspec/specs/learning-path`, `lesson-runner`).
- **S4.1–S4.4, S5.1–S5.4**: các dạng bài tập dùng trong 12 bài. Đã có.
- **S1.2, S1.3**: lưu sẵn offline và onboarding. Đã có; AC4/AC5 của S7.1 là phần nội dung của S1.3 AC4 và S1.2 AC2.
- **S6.1, S6.2** (chặn): màn xem thứ tự nét, màn luyện viết, khung viết có gợi ý và dữ liệu nét offline phải **code xong và merge
  trước** khi code S7.1 (spec đã merge, code chưa có trong `main`). Riêng phần 4 dạng bài cũ và AC2–AC5 không phụ thuộc, nhưng PR code S7.1
  gồm cả câu viết nên chờ S6.1–S6.2.
- **S6.3** không chặn: S7.1 không dùng chế độ không gợi ý.

## Capabilities

### New Capabilities
- `intro-lessons`: nội dung giai đoạn Nhập môn (12 bài, dạng bài tập, audio), câu viết chữ trong màn bài và lối vào xem thứ tự nét,
  mở bài 1 sau onboarding, học offline trọn giai đoạn.

### Modified Capabilities
- `lesson-runner`: Requirement "Mỗi câu chấm ngay sau khi trả lời" thêm kết quả của câu viết; Requirement "Câu có dạng bài chưa có thì
  được bỏ qua (biện pháp tạm)" thêm trường hợp câu viết không hiện được khung viết và cập nhật điều kiện gỡ.

## Impact

- `content/authored/lessons/intro/`, `content/authored/path.yaml`, có thể `content/authored/vi-meanings.yaml`, `tts-overrides.yaml`.
- `apps/web/src/assets/content/` (sinh lại, nhiều mp3 mới, tăng dung lượng precache).
- Test E2E đang tìm tiêu đề bài mẫu cũ phải cập nhật theo tiêu đề mới.
- `apps/web`: registry dạng bài của màn bài thêm dạng viết; feature bài học thêm liên kết "Xem thứ tự nét"; i18n thêm nhãn.
- `content:check`: luật mới cho câu viết (chữ có dữ liệu nét, đúng một chữ) ở mức lỗi; luật chung "chữ thiếu dữ liệu nét" vẫn là cảnh báo.
- Không thêm dependency.

## Open Questions

- [x] **Tiêu đề bài hiện cho người học** → dùng nguyên văn tên trong danh sách AC2 (bài 1 là "Thanh 1–4", thay "Bốn thanh điệu" của bài mẫu) (ba đề xuất, chờ người thật xác nhận)
- [x] **Chia nhóm trong giai đoạn Nhập môn** → một giai đoạn "Nhập môn", một nhóm duy nhất chứa 12 bài theo thứ tự 1→12, khớp docs/03-architecture.md ("Nhập môn = 1 unit gồm 12 bài") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Có audio" nghĩa là gì** → mỗi bài có ít nhất một câu có nút "Nghe", và mọi từ/câu bài dùng đều phát được audio; cả 4 dạng bài đã có đều có audio nên điều kiện này đi cùng "ít nhất 2 dạng" (ba đề xuất, chờ người thật xác nhận)
- [x] **"Ít nhất 2 dạng bài tập" tính thế nào** → ít nhất 2 dạng khác nhau trong 4 dạng màn bài đã hỗ trợ; câu dạng chưa hỗ trợ (sẽ bị bỏ qua) không tính và không được có, vì bài có câu bỏ qua thì không "Đã xong" và chặn bài sau (ba đề xuất, chờ người thật xác nhận)
- [x] **"Học trọn" offline kiểm tra thế nào** → offline: mở được cả 12 bài, mọi audio của 12 bài phát được, và làm hết một bài thì bài đó "Đã xong", bài kế "Đang mở" (ba đề xuất, chờ người thật xác nhận)
- [x] **Số câu tối thiểu mỗi bài** → không đặt thêm ngoài AC1; người soạn tự chọn (ba đề xuất, chờ người thật xác nhận)
- [x] **Bài tập viết chữ trong bài 10 "Nét cơ bản và thứ tự nét" và bài 11 "30 bộ thủ phổ biến"** → gộp vào S7.1 (người thật chốt). Màn bài
  thêm dạng viết chữ dùng khung có gợi ý của S6.2; bài 10–11 có câu viết; mỗi câu viết có liên kết "Xem thứ tự nét" tới màn S6.1 (từ đó "Tập viết"
  tới S6.2). S7.1 phụ thuộc S6.1–S6.2 code xong trước.
- [x] **Câu viết tính đúng/sai thế nào trong tổng kết bài** → viết xong nét cuối thì câu "Đúng"; lần sai nét chỉ báo tại chỗ như S6.2, không làm câu
  sai, không có giải thích; không ghi thẻ ôn tập (ba đề xuất, chờ người thật xác nhận)
- [x] **Mỗi câu viết bao nhiêu chữ** → đúng một chữ Hán, khớp S6.2 (một màn một chữ); kiểm tra nội dung báo lỗi với từ nhiều chữ (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu viết dùng chữ không có dữ liệu nét** → kiểm tra nội dung báo **lỗi** (khác cảnh báo chung của S2.5) để không lọt vào bản build; nếu lúc chạy
  vẫn gặp thì hiện "Chưa có dữ liệu nét cho chữ này." (cùng câu chữ S6.1/S6.2), không hiện liên kết "Xem thứ tự nét", cho bỏ qua câu, bài chưa hoàn thành
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Lối vào thứ tự nét / luyện viết từ bài Nhập môn (S6.1, S6.2 ghi "thuộc S7.1")** → liên kết "Xem thứ tự nét" trên mọi câu viết hiện được khung viết (không chỉ bài 10);
  luyện viết vào qua nút "Tập viết" có sẵn của S6.2; nút quay lại của trình duyệt về đúng câu, khung viết trống (ba đề xuất, chờ người thật xác nhận)
- [x] **Người chỉ dùng bàn phím với câu viết** → vẽ nét là thao tác trỏ (ngoại lệ đường vẽ WCAG 2.1.1, như S6.2); liên kết "Xem thứ tự nét" tới được bằng Tab.
  Hệ quả: người không dùng được chuột/cảm ứng không làm xong bài 10–11 (ba đề xuất, chờ người thật xác nhận)
- [x] **QA: audio chỉ đòi "phát được", chưa đòi đúng từ/câu đang hiện** → thêm Scenario "S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện" (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (qa): Scenario câu viết dùng "人", "十" nhưng nội dung chỉ đòi "ít nhất một câu viết"** → thêm Requirement "Câu viết của bài 10 và bài 11": bài 10 có câu viết chữ "人" và "十" (đã có dữ liệu nét) (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (qa, dev-lead): câu viết thiếu trạng thái đang tải / lỗi tải như S6.1; Scenario offline nhắc "Có lỗi xảy ra" không có Requirement** → thêm Requirement "Trạng thái câu viết khi tải dữ liệu nét": "Đang tải…"; lỗi tải hoặc dữ liệu hỏng hiện "Có lỗi xảy ra" + "Thử lại" và cho "Bỏ qua câu này" (câu bỏ qua làm bài chưa hoàn thành); không có dữ liệu nét hiện "Chưa có dữ liệu nét cho chữ này." + bỏ qua; chỉ trạng thái có khung viết mới hiện "Xem thứ tự nét" (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (qa, dev-lead): khung S6.2 có "Viết lại", màn bài khóa câu đã chấm** → trong màn bài không có "Viết lại"; sau "Đúng" khung khóa, vẽ thêm không đổi gì; thêm Requirement + Scenario và dòng trong bảng chấm của lesson-runner (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (dev-lead): bấm "Xem thứ tự nét" giữa bài rồi quay lại thì luật làm tiếp S3.4 bỏ kết quả câu trước khỏi tổng kết** → chọn (a): giữ luật làm tiếp hiện có, tổng kết chỉ tính từ câu viết đó, thời gian tính từ lúc câu đó hiện lại; thêm Requirement + Scenario. Phương án (b) giữ kết quả các câu đã làm phải đổi dữ liệu tiến độ lưu trên máy, để story khác nếu người thật muốn. Hệ quả của (a) (Review v2, dev-lead): bỏ qua câu viết tải lỗi ở câu 2, tới câu viết 4 bấm "Xem thứ tự nét" rồi quay lại làm hết thì tổng kết chỉ tính từ câu 4, câu đã bỏ qua không còn tính và bài có thể "Đã xong"; lỗ này có sẵn từ luật làm tiếp S3.4, S7.1 làm dễ xảy ra hơn (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (dev-lead): Scenario chữ "龘" pass giả vì "龘" ngoài từ điển HSK 1** → đổi sang chữ "爱" (có trong từ điển HSK 1) trên nội dung thử với dữ liệu nét thử không có chữ "爱"; THEN đòi lỗi nêu lý do thiếu dữ liệu nét, không phải lỗi từ ngoài từ điển
- [x] **Review v1 (dev-lead): lesson-runner bị đổi hành vi nhưng proposal ghi không có Modified Capabilities** → thêm delta `lesson-runner` (MODIFIED "Mỗi câu chấm ngay sau khi trả lời" và "Câu có dạng bài chưa có thì được bỏ qua (biện pháp tạm)"): bỏ qua giữ cho dạng bài chưa hỗ trợ (lưới an toàn) và câu viết không hiện được khung viết (giữ lâu dài); thông báo cuối bài nêu số câu bỏ qua, không nêu lý do "dạng bài chưa có" (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (dev-lead): bài 2 dạy biến điệu nhưng pinyin trong app là thanh gốc, gõ theo biến điệu bị chấm "Sai"** → bài 2 luyện biến điệu bằng nói theo mẫu (nghe mẫu đọc có biến điệu rồi nói theo); câu chọn thanh và gõ pinyin của bài 2 không hỏi từ có "不", "一" hay hai âm tiết thanh 3 liền nhau. Pinyin hiện cạnh từ vẫn là thanh gốc theo quy ước viết pinyin (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (qa): phạm vi "mọi từ và câu của bài đều có audio"** → chỉ từ/câu của các câu có nút "Nghe" hoặc "Nghe mẫu"; câu viết không đòi audio; Requirement AC5 hiểu cùng cách
- [x] **Review v1 (qa): a11y khung viết trong bài** → khung nhận focus bằng Tab, viền focus nhìn thấy, nhãn trình đọc màn hình nêu chữ (như S6.2); thêm Scenario
- [x] **Review v1 (qa): bảng kiểm tra câu viết thiếu rỗng / không phải chữ Hán** → thêm hai dòng Lỗi và hai Scenario, khớp S6.1
- [x] **Review v1 (qa): Scenario offline audio viết theo app, không theo thao tác người học** → WHEN đổi thành người học bấm "Nghe"/"Nghe mẫu" ở mọi câu có nút
- [x] **Review v1 (qa, dev-lead): bài 11 "30 bộ thủ phổ biến" không viết được bộ thủ không đứng riêng (氵, 扌, 亻…)** → câu viết bài 11 dùng bộ thủ tự đứng được thành chữ HSK 1 (ví dụ 口, 人, 女, 日); bộ thủ không đứng riêng không có câu viết, chỉ gặp qua chữ chứa nó ở dạng bài khác. Hệ quả: bài 11 không phủ đủ 30 bộ thủ bằng câu viết (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (dev-lead): bài 1 thay bài mẫu, máy đã có tiến độ bài mẫu sẽ thấy "Thanh 1–4" là "Đã xong"** → chấp nhận, không chuyển đổi tiến độ cũ, vì app chưa phát hành (chỉ máy dev/test có tiến độ bài mẫu) (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v1 (dev-lead): PR code lớn** → không đổi spec; ghi chú cho planner chia cụm commit
- [x] **Review v2 (qa, dev-lead): Scenario và dòng Review v1 khẳng định "爱" không có dữ liệu nét là sai; pipeline lấy dữ liệu nét cho mọi chữ bài dùng, mọi chữ HSK 1 đều có** → WHEN viết lại "trên nội dung thử với dữ liệu nét thử không có chữ "爱""; Requirement ghi hiện mọi chữ HSK 1 có dữ liệu nét, luật này là hàng rào cho khi nguồn dữ liệu nét hoặc từ điển đổi
- [x] **Review v2 (dev-lead): hệ quả phương án (a) với câu đã bỏ qua** → ghi vào dòng Review v1 về phương án (a); không đổi spec (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v2 (dev-lead): layer của dữ liệu nét cho khung viết** → bảng "Layer đích" ghi dữ liệu nét và trạng thái tải đi vào khung viết qua props từ hook của feature bài học (hoặc `core/hooks/`), vì `shared/components/exercises/` không gọi service (CLAUDE.md §2)
- [x] **Review v2 (qa): câu gõ pinyin ở bài khác bài 2 (ví dụ "你好" ở bài 12) chấm theo thanh gốc trong khi audio đọc biến điệu** → giữ luật chấm thanh gốc của S4.3 (quy ước viết pinyin, bài 2 đã dạy biến điệu chỉ là cách đọc); ghi một dòng ở What Changes. Không dùng bài 9 để giảng vì màn bài chưa có phần lý thuyết (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v2 (qa): liên kết "Xem thứ tự nét" còn hiện sau khi câu viết "Đúng" thì bấm rồi quay lại mất kết quả** → câu viết đã "Đúng" ẩn liên kết, chỉ còn "Tiếp tục"; thêm Requirement "Câu viết đã Đúng thì không còn liên kết xem thứ tự nét" và Scenario "S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét" (ba đề xuất, chờ người thật xác nhận)
- [x] **Review v3 (qa, dev-lead): Requirement lối vào và bảng trạng thái nói mọi câu viết có liên kết "Xem thứ tự nét", mâu thuẫn Requirement ẩn liên kết sau khi Đúng; bảng chấm lesson-runner chưa nêu** → Requirement lối vào sửa thành "mỗi câu viết hiện được khung viết và chưa Đúng"; ô bảng thành "Có (ẩn sau khi Đúng)"; dòng câu viết của bảng chấm thêm "không còn liên kết Xem thứ tự nét". Không đổi Scenario
