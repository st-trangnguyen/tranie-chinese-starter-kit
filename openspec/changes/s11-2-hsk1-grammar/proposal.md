# Proposal: S11.2 Ngữ pháp HSK 1

Story **S11.2 Ngữ pháp HSK 1 · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s112-ngữ-pháp-hsk-1--nội-dung)) ·
GitHub issue [#60](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/60). Bản 0.2, epic E11 Nội dung HSK 1.

Refs #60

## Why

Là người soạn nội dung, tôi muốn các điểm ngữ pháp cấp 1 theo HSK 3.0 được phân bổ vào các chủ đề để học dần. Danh sách từ HSK 1 đã có
nguồn chuẩn và kiểm tra nội dung đếm đủ 500 từ (S2.1), nhưng ngữ pháp chưa có danh sách chuẩn nào trong repo, nên không ai biết bài
"Ngữ pháp" của 15 chủ đề (S11.1) đã dạy đủ ngữ pháp cấp 1 hay còn sót. S11.2 thêm danh sách điểm ngữ pháp cấp 1 chuẩn, soạn thẻ ngữ pháp
(S10.5) cho từng điểm trong bài "Ngữ pháp" của các chủ đề, và cho kiểm tra nội dung báo lỗi khi còn điểm nào chưa được dạy.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Danh sách chuẩn điểm ngữ pháp cấp 1 HSK 3.0 (chép từ chuẩn, có ghi nguồn) | `content/` (nội dung soạn tay của `@csk/content`) |
| Điểm ngữ pháp, câu ví dụ và thẻ ngữ pháp trong bài "Ngữ pháp" của 15 chủ đề HSK 1 | `content/` (nội dung soạn tay) |
| Kiểm tra nội dung: luật danh sách chuẩn, luật độ phủ ngữ pháp, luật điểm của thẻ | `content/` (script kiểm tra nội dung) |
| Nếu cần: cho nội dung thẻ ngữ pháp ghi được "thẻ dạy điểm chuẩn nào" (vị trí cụ thể do `design.md` chốt) | `packages/shared` (`@csk/shared`) |

Không đụng `apps/web`: màn bài, thẻ ngữ pháp và nạp nội dung đã do S10.5 làm. Người học thấy kết quả qua bài "Ngữ pháp" sẵn có.

## What Changes

- **Danh sách chuẩn điểm ngữ pháp cấp 1**: 48 điểm theo *Chuẩn trình độ tiếng Trung cho giáo dục tiếng Trung quốc tế* (HSK 3.0,
  GF 0025-2021), phụ lục ngữ pháp cấp 1, giữ số thứ tự và tên gốc. Kiểm tra nội dung báo lỗi nếu danh sách không đủ 48 điểm, số thứ tự không liền
  nhau từ 1 đến 48 hoặc có điểm thiếu tên (như kiểm tra 500 từ của S2.1).
- **Soạn nội dung ngữ pháp**: mỗi điểm chuẩn được dạy bằng ít nhất một thẻ ngữ pháp (S10.5: giải thích tiếng Việt, cấu trúc, ví dụ có
  audio) nằm trong bài "Ngữ pháp" của một chủ đề HSK 1 trên lộ trình. Các điểm được phân bổ theo thứ tự chủ đề do người soạn chọn.
- **Ghi điểm cho thẻ đã có**: S11.1 bắt buộc mỗi bài "Ngữ pháp" có ít nhất một thẻ ngữ pháp nên sẽ tạo thẻ chưa ghi điểm chuẩn. S11.2 ghi
  điểm chuẩn cho, hoặc viết lại, mọi thẻ ngữ pháp S11.1 đã tạo trong bài "Ngữ pháp".
- **Kiểm tra độ phủ ngữ pháp**: kiểm tra nội dung kết thúc không thành công và liệt kê các điểm chuẩn chưa có trong bài "Ngữ pháp" nào; báo
  lỗi khi bất kỳ thẻ ngữ pháp nào dạy điểm không có trong danh sách chuẩn, hoặc thẻ trong bài "Ngữ pháp" HSK 1 không ghi điểm nào.

## Nhóm ngoại lệ (nội dung thuần)

Theo CLAUDE.md §0.7, phần **soạn nội dung** (chọn chủ đề cho từng điểm, viết giải thích tiếng Việt, chọn câu ví dụ) là nội dung thuần,
không có Scenario riêng và không theo TDD. Độ chính xác về mặt sư phạm của giải thích tiếng Việt không kiểm tra tự động được; người soạn
nội dung tự review trong PR code. Phần kiểm tra tự động được (danh sách chuẩn đủ điểm, độ phủ, điểm lạ, nội dung phát hành đạt độ phủ)
có Scenario và test như bình thường.

## Không làm (out of scope)

- Dạng bài thẻ ngữ pháp, cách hiện và audio ví dụ, kiểm tra thẻ thiếu dữ liệu → **S10.5** (đã spec).
- Tạo 15 chủ đề, cấu trúc 5 bài mỗi chủ đề, độ phủ 500 từ → **S11.1**. S11.2 chỉ điền nội dung ngữ pháp vào bài "Ngữ pháp" S11.1 tạo ra.
- Audio cho câu ví dụ đầy đủ → **S11.5** (S11.2 vẫn phải có audio cho câu ví dụ mình thêm vì S10.5 đòi, nhưng kiểm tra "không thiếu audio
  nào" của toàn HSK 1 là S11.5).
- Review nghĩa tiếng Việt của 500 từ → **S11.3**.
- Bài tập luyện ngữ pháp có chấm điểm trong bài "Ngữ pháp" (sắp xếp câu S10.3, điền chỗ trống S10.4): bài vẫn cần ít nhất một câu chấm
  điểm theo quy tắc S10.1, việc soạn các câu đó thuộc S11.1; S11.2 không đặt yêu cầu về chúng.
- Ràng buộc thứ tự dạy (điểm A phải trước điểm B), số điểm tối đa mỗi bài, ngữ pháp cấp 2 trở lên, ôn tập điểm ngữ pháp bằng SRS.
- Màn tra cứu ngữ pháp riêng ngoài bài.

## Dependencies

- **S10.5 Thẻ ngữ pháp** (spec viết trước, `s10-5-grammar-card`): dạng bài thẻ ngữ pháp và kiểm tra thẻ đủ dữ liệu. **Thứ tự code: S10.5
  trước S11.2.** S10.5 là dependency code trực tiếp và cũng đi qua S11.1 (bài "Ngữ pháp" của S11.1 cần thẻ ngữ pháp).
- **S10.1 Flashcard từ mới**: quy tắc câu không chấm điểm (bài học phải có ít nhất một câu chấm điểm), áp cho bài "Ngữ pháp".
- **S11.1 15 chủ đề HSK 1** (spec viết song song, `s11-1-hsk1-topics`): 15 chủ đề trên lộ trình, mỗi chủ đề có bài "Ngữ pháp". **Thứ tự
  code: S11.1 (ít nhất phần tạo chủ đề và bài) trước S11.2.** Cách S11.1 đánh dấu một bài là bài "Ngữ pháp" là cách S11.2 dùng để đếm.
- **S11.5 Audio HSK 1** (song song): audio câu ví dụ của thẻ ngữ pháp sinh bằng pipeline audio hiện có.

## Capabilities

### New Capabilities
- `hsk1-grammar`: danh sách chuẩn điểm ngữ pháp cấp 1 HSK 3.0 và kiểm tra nội dung bảo đảm mọi điểm có trong ít nhất một bài "Ngữ pháp"
  của chủ đề HSK 1.

### Modified Capabilities
(không có)

## Open Questions

- [x] **Danh sách điểm ngữ pháp cấp 1 lấy ở đâu?** Repo chưa có nguồn mở ghim sẵn như danh sách từ (S2.1) → chép tay 48 điểm từ phụ lục
  ngữ pháp cấp 1 của chuẩn GF 0025-2021 vào nội dung soạn tay, ghi nguồn trong file; không thêm nguồn tải về hay dependency mới
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Cấp 1 có bao nhiêu điểm ngữ pháp?** → 48 theo phụ lục chuẩn; kiểm tra nội dung chặn danh sách khác 48 (Requirement "Danh sách
  chuẩn có đủ 48 điểm") (ba đề xuất, chờ người thật xác nhận số 48 với bản chuẩn)
- [x] **"Xuất hiện trong bài Ngữ pháp" tính thế nào?** → điểm chuẩn được tính khi có ít nhất một thẻ ngữ pháp dạy điểm đó nằm trong bài
  "Ngữ pháp" của một chủ đề HSK 1 trên lộ trình; điểm chỉ có trong ví dụ của bài khác loại hoặc trong bài không nằm trên lộ trình thì không
  tính (bảng trong Requirement "Mọi điểm ngữ pháp cấp 1 có trong ít nhất một bài Ngữ pháp") (ba đề xuất, chờ người thật xác nhận)
- [x] **Một thẻ dạy được nhiều điểm chuẩn, hoặc nhiều thẻ dạy cùng một điểm không?** → được cả hai: một điểm có thể dạy lại ở nhiều chủ đề
  (học dần); một thẻ có thể gộp vài điểm gần nhau (vd các dạng câu hỏi) (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ dạy điểm không có trong danh sách cấp 1 thì sao?** → báo lỗi, để bắt gõ sai; ngữ pháp ngoài cấp 1 không thuộc phạm vi
  0.2 (ba đề xuất, chờ người thật xác nhận)
- [x] **(Finding 1, qa + dev-lead) Scenario trên nội dung mẫu ghi "kiểm tra kết thúc thành công" mâu thuẫn với luật 48 điểm và luật 500 từ
  S2.1, độ phủ S11.1** → đặt tên ba luật (danh sách chuẩn, độ phủ ngữ pháp, điểm của thẻ); Scenario trên nội dung mẫu chỉ khẳng định về
  đúng luật đang kiểm; "kiểm tra kết thúc thành công" chỉ còn ở Scenario trên nội dung phát hành
- [x] **(Finding 2) Luật điểm lạ áp cho thẻ ở đâu?** → điểm không có trong danh sách chuẩn là lỗi ở mọi thẻ ngữ pháp (mọi loại bài, mọi
  giai đoạn, cả bài ngoài lộ trình) để bắt gõ sai; "phải ghi ít nhất một điểm" chỉ áp cho thẻ trong bài "Ngữ pháp" của chủ đề HSK 1
  (Requirement "Thẻ ngữ pháp chỉ dạy điểm có trong danh sách chuẩn" và "Thẻ trong bài Ngữ pháp HSK 1 phải dạy ít nhất một điểm chuẩn";
  thêm Scenario thẻ bài "Hội thoại" dạy điểm 99 và thẻ ngoài bài Ngữ pháp không ghi điểm) (ba đề xuất, chờ người thật xác nhận)
- [x] **(Finding 3) Có cần bảng phân bổ điểm → chủ đề trong spec không?** → không; phân bổ là nội dung thuần do người soạn chọn, chỉ kiểm
  tự động độ phủ trên nội dung phát hành; test-cases dựa vào test trên nội dung phát hành (ba đề xuất, chờ người thật xác nhận)
- [x] **(Finding 4) Scenario đòi số thứ tự 1–48 nhưng Requirement không** → thêm "số thứ tự liền nhau từ 1 đến 48" vào Requirement "Danh
  sách chuẩn có đủ 48 điểm", kèm Scenario nhảy số (1–47 và 50) (ba đề xuất, chờ người thật xác nhận)
- [x] **(Finding 5) Bài ngoài lộ trình không có loại bài theo S11.1** → viết lại Scenario thành "thẻ dạy điểm 3 chỉ nằm trong một bài không
  nằm trên lộ trình", khớp dòng bảng
- [x] **(Finding 6) S11.1 tạo thẻ ngữ pháp chưa có điểm chuẩn trước S11.2** → thêm mục "Ghi điểm cho thẻ đã có" ở What Changes: S11.2 ghi
  điểm hoặc viết lại mọi thẻ ngữ pháp S11.1 đã tạo; ghi rõ S10.5 là dependency code (trực tiếp và qua S11.1)
- [x] **(Finding 7) Câu chữ "thẻ ghi điểm" và "trường trong schema"** → spec diễn đạt "thẻ dạy điểm nào" theo cái người soạn thấy;
  proposal không nêu vị trí trường, để `design.md` chốt
- [x] **"Phân bổ để học dần" có ràng buộc thứ tự hay số lượng không?** → không ràng buộc tự động; AC chỉ đòi độ phủ, người soạn chọn
  thứ tự theo chủ đề; ghi ở "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Độ chính xác giải thích tiếng Việt kiểm tra thế nào?** → không tự động được; thuộc nhóm ngoại lệ nội dung thuần, người soạn
  review trong PR code (mục "Nhóm ngoại lệ") (ba đề xuất, chờ người thật xác nhận)

## Impact

- Nội dung mới: danh sách chuẩn 48 điểm ngữ pháp cấp 1; điểm ngữ pháp, câu ví dụ (kèm audio) và thẻ ngữ pháp trong bài "Ngữ pháp" của
  15 chủ đề HSK 1.
- Code mới/sửa: ba luật mới trong kiểm tra nội dung (danh sách chuẩn; độ phủ ngữ pháp; điểm của thẻ); có thể cần cho nội dung thẻ ngữ
  pháp ghi được điểm chuẩn mà thẻ dạy (vị trí do `design.md` chốt). Không đổi dữ liệu người dùng trong trình duyệt, không đổi file sao lưu.
- Dependency: không thêm.
- Tầng test: Vitest cho các luật kiểm tra nội dung (dữ liệu mẫu nhỏ) và một test chạy trên nội dung phát hành thật; `pnpm content:check`
  phải pass.
