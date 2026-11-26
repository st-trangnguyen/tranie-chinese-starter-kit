# Proposal: S11.1 15 chủ đề HSK 1

Story **S11.1 15 chủ đề HSK 1 · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s111-15-chủ-đề-hsk-1--nội-dung)) ·
GitHub issue [#59](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/59). Bản 0.2, epic E11 (#12).

Refs #59

## Why

Là người soạn nội dung, tôi muốn có 15 chủ đề × 5 bài phủ đủ từ vựng HSK 1 để người học không bỏ sót từ nào. Hiện lộ trình chỉ có
giai đoạn Nhập môn (S7.1); bản 0.2 cần giai đoạn HSK 1 hoàn chỉnh, ra một lần cho cả 15 chủ đề (roadmap), và cần một hàng rào tự động
để không từ nào trong 500 từ cấp 1 bị bỏ sót.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| 75 file bài YAML (15 chủ đề × 5 bài) + giai đoạn HSK 1 trong lộ trình | `content/authored/` (đầu vào pipeline E2) |
| JSON nội dung + mp3 sinh ra | `apps/web/src/assets/content/` (pipeline sinh, không sửa tay) |
| Báo độ phủ 500 từ cấp 1 (thiếu thì cảnh báo khi dưới 15 chủ đề, lỗi khi đủ 15) | `content/scripts/content-check/` (gói `@csk/content`, docs/03-architecture.md: "kiểm tra schema và độ phủ từ") |
| Test cấu trúc 15 × 5 trên nội dung đã build, test báo độ phủ | Vitest cạnh script trong `content/scripts/content-check/` |
| Bản đồ hiện giai đoạn HSK 1 | Playwright `apps/web/e2e/E11/` (chỉ kiểm tra, không đổi code app) |

Không dự kiến đổi code trong `apps/web/src/app/`: màn lộ trình, màn bài, các dạng bài và quy tắc mở khóa đã có hoặc thuộc story khác.

**Ngoại lệ TDD (nội dung thuần):** việc soạn 75 file bài YAML là nội dung, không có test viết trước cho từng file. Nội dung đó được
kiểm tra tự động bằng các Scenario của AC1 (đọc nội dung đã build) và AC2 (lệnh kiểm tra nội dung). Riêng luật báo độ phủ (AC2) là code
mới nên theo RED → GREEN như thường.

**Chia PR code:** story giữ nguyên một story, nhưng PR code chia thành nhiều PR nối tiếp, mỗi PR `Refs #59`, PR cuối `Closes #59`:
1. PR đầu: luật độ phủ (thiếu từ ở mức cảnh báo khi dưới 15 chủ đề, lỗi khi đủ 15; Scenario AC2 trên nội dung thử) + khung giai đoạn
   "HSK 1" trong lộ trình.
2. Các PR giữa: mỗi PR thêm một nhóm chủ đề (đủ 5 bài, thẻ từ, câu ví dụ, hội thoại, audio của nhóm đó); lệnh kiểm tra nội dung vẫn
   chạy qua vì độ phủ chỉ cảnh báo, luật thiếu audio đang có vẫn áp cho từng nhóm.
3. PR cuối: chủ đề thứ 15, độ phủ 100%, bật các Scenario AC1 kiểm tra cấu trúc 15 × 5 và Scenario "Nội dung thật phủ 100%".

## What Changes

- Lộ trình có giai đoạn **"HSK 1"** ngay sau "Nhập môn", gồm **15 chủ đề**, mỗi chủ đề có tên riêng không trùng.
- Mỗi chủ đề có đúng **5 bài theo thứ tự**: Từ mới → Ngữ pháp → Hội thoại → Viết chữ → Kiểm tra. Tiêu đề bài là `<loại bài> · <tên chủ đề>`
  (ví dụ "Từ mới · Chào hỏi"), để Trang chủ (chỉ hiện tiêu đề bài) vẫn rõ bài thuộc chủ đề nào.
- Mỗi loại bài có ít nhất một câu thuộc dạng đặc trưng (bảng trong spec); 4 bài học thường còn có ít nhất một câu chấm điểm (S10.1);
  mọi câu của 75 bài thuộc dạng màn bài đã hỗ trợ, không câu nào phải bỏ qua: Từ mới có thẻ từ mới, Ngữ pháp có thẻ ngữ pháp, Hội thoại có
  câu hội thoại, Viết chữ có câu viết chữ theo nét. Bài Kiểm tra là bài kiểm tra cuối chủ đề (đạt từ 80% mới mở chủ đề sau, S3.5; có
  nút "Kiểm tra vượt cấp", S3.6).
- **Độ phủ từ**: một từ cấp 1 tính là "được phủ" khi có thẻ từ mới của từ đó trong bài Từ mới của ít nhất một chủ đề HSK 1. Lệnh kiểm
  tra nội dung luôn in dòng độ phủ (`Độ phủ từ HSK 1: <p>% (<số từ>/500)`, phần trăm làm tròn xuống). Mỗi mục trong danh sách 500 từ
  tính riêng theo chữ Hán + pinyin (地 "de" và 地 "dì" là hai từ). Thiếu từ thì báo kèm danh sách từ thiếu: **cảnh báo** khi giai đoạn
  HSK 1 dưới 15 chủ đề (nội dung đang thêm dần), **lỗi** và kết thúc không thành công khi đã đủ 15 chủ đề.
- 15 chủ đề phủ đủ 100% trong 500 từ cấp 1; lệnh kiểm tra nội dung chạy qua không lỗi.

## Không làm (out of scope)

- Danh sách và phân bổ điểm ngữ pháp cấp 1 vào bài Ngữ pháp: **S11.2**. S11.1 chỉ đòi mỗi bài Ngữ pháp có ít nhất một thẻ ngữ pháp.
- Review nghĩa tiếng Việt (cảnh báo S2.2 không chặn story này): **S11.3**.
- Bài kiểm tra cuối cấp HSK 1: **S11.4**. Đầy đủ audio cho mọi từ, câu, hội thoại: **S11.5** (S11.1 vẫn phải qua luật thiếu audio đang có
  của lệnh kiểm tra nội dung).
- Dạng bài tập mới, sửa màn bài, màn lộ trình, quy tắc mở khóa (S3.1–S3.6), tải audio theo chủ đề (S8.4), tạo thẻ ôn tập (S9.1): dùng
  nguyên như đã spec.
- Quy tắc mở chủ đề 1 của HSK 1 khi xong Nhập môn: theo quy tắc mở khóa đã có, không thêm luật.
- Tên 15 chủ đề và từ nào vào chủ đề nào: người soạn chọn, spec không cố định.
- Tính độ phủ từ cho bài Nhập môn; từ ngoài danh sách cấp 1 (đã bị S2.3 AC3 chặn).
- Kiểm tra cấu trúc 15 × 5 bằng lệnh kiểm tra nội dung: kiểm tra bằng test trên nội dung đã build, không thêm luật vào lệnh.

## Dependencies

- **E2 pipeline (S2.1–S2.5)**: danh sách 500 từ, soạn bài YAML, kiểm tra tham chiếu từ, audio TTS, dữ liệu nét. Đã có.
- **S3.1–S3.6**: bản đồ lộ trình, màn bài, mở khóa, kiểm tra cuối chủ đề, kiểm tra vượt cấp. Đã có (`openspec/specs/learning-path`, `lesson-runner`).
- **S7.1 / S6.1–S6.2**: câu viết chữ theo nét trong màn bài. Đã có.
- **E10 (chặn)**: thẻ từ mới (S10.1), nhận diện từ (S10.2), sắp xếp câu (S10.3), điền chỗ trống (S10.4), thẻ ngữ pháp (S10.5), hội thoại
  (S10.6), đóng vai (S10.7), đọc hiểu (S10.8) đang ở giai đoạn spec/code. Ít nhất S10.1, S10.5, S10.6 phải **code xong và merge** trước khi
  soạn bài của S11.1; các dạng còn lại dùng được khi đã merge. Luật "bài kiểm tra không có câu không chấm điểm" lấy từ S10.1.
- **S11.2** dùng bài Ngữ pháp của S11.1; **S11.4**, **S11.5** dùng nội dung của S11.1. S11.1 không chờ các story đó.

## Capabilities

### New Capabilities
- `hsk1-topics`: cấu trúc giai đoạn HSK 1 (15 chủ đề × 5 bài theo loại, tiêu đề, dạng câu đặc trưng của từng loại bài) và báo độ phủ
  500 từ cấp 1 trong lệnh kiểm tra nội dung.

### Modified Capabilities
Không có.

## Impact

- `content/authored/path.yaml`, `content/authored/lessons/` (thư mục mới cho HSK 1), có thể `vi-meanings.yaml`, `tts-overrides.yaml`.
- `apps/web/src/assets/content/` sinh lại: nhiều JSON và mp3 mới, dung lượng audio tăng (audio HSK tải theo chủ đề, không precache).
- `content/scripts/content-check/`: thêm luật độ phủ (cảnh báo khi dưới 15 chủ đề, lỗi khi đủ 15).
- Không thêm dependency.

## Open Questions

- [x] **Tiêu đề bài hiện cho người học** → `<loại bài> · <tên chủ đề>` (ví dụ "Từ mới · Chào hỏi"), vì Trang chủ chỉ hiện tiêu đề bài; loại bài đứng đầu đúng tên AC1 (ba đề xuất, chờ người thật xác nhận)
- [x] **Giai đoạn HSK 1 nằm đâu trên bản đồ, chủ đề là gì** → một giai đoạn "HSK 1" ngay sau "Nhập môn"; mỗi chủ đề là một nhóm của giai đoạn, tên do người soạn chọn, không trùng (ba đề xuất, chờ người thật xác nhận)
- [x] **"Mỗi chủ đề 5 bài: Từ mới / Ngữ pháp / Hội thoại / Viết chữ / Kiểm tra" kiểm tra nội dung từng bài thế nào** → mỗi loại bài có ít nhất một câu của dạng đặc trưng (bảng trong spec); bài Kiểm tra là bài kiểm tra cuối chủ đề, 4 bài trước là bài học thường; không đặt số câu tối thiểu (ba đề xuất, chờ người thật xác nhận)
- [x] **Thế nào là một từ "được phủ"** → có thẻ từ mới của từ đó trong bài Từ mới của ít nhất một chủ đề HSK 1; chỉ xuất hiện trong câu ví dụ, hội thoại, bài khác hay bài Nhập môn không tính, để mỗi từ thật sự được dạy và có thẻ ôn tập. Một từ có thể là từ mới ở nhiều chủ đề, tính một lần (ba đề xuất, chờ người thật xác nhận)
- [x] **Độ phủ dưới 100% là lỗi hay cảnh báo** → lỗi khi giai đoạn HSK 1 đủ 15 chủ đề, cảnh báo khi dưới 15 (xem finding quy mô bên dưới); phần trăm làm tròn xuống để 499/500 không hiện "100%" (ba đề xuất, chờ người thật xác nhận)
- [x] **Thứ tự 5 bài trong chủ đề** → đúng thứ tự AC1, bài Kiểm tra cuối cùng (khớp S3.5 "bài kiểm tra cuối chủ đề") (ba đề xuất, chờ người thật xác nhận)
- [x] **Quy mô (dev-lead, vòng 1): luật lỗi ngay từ đầu + test 15 × 5 buộc cả story vào một PR code khổng lồ (75 bài, ~500 thẻ từ có câu ví dụ, hội thoại, hàng trăm mp3)** → giữ một story, PR code chia nối tiếp: PR đầu luật độ phủ + khung giai đoạn, các PR giữa thêm từng nhóm chủ đề, PR cuối đủ 15 chủ đề và bật test 15 × 5. Luật thiếu từ là cảnh báo khi dưới 15 chủ đề, lỗi khi đủ 15, nên trạng thái cuối vẫn chặn thiếu từ; thêm Scenario "Dưới 15 chủ đề mà thiếu từ thì chỉ cảnh báo" (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ Hán ứng với hai từ cấp 1 (qa, vòng 1: 地 de/dì, 干 gān/gàn, 还 hái/huán)** → mỗi mục trong danh sách 500 từ tính riêng theo chữ Hán + pinyin; danh sách từ thiếu ghi "地 (de)" khi chữ có nhiều mục, chữ chỉ một mục ghi chữ Hán; thêm dòng bảng và Scenario "Chữ Hán có hai mục được tính riêng theo pinyin" (ba đề xuất, chờ người thật xác nhận)
- [x] **Có cần chặn câu phải bỏ qua trong 75 bài không (qa, vòng 1)** → có, theo tiền lệ S7.1; thêm Scenario "Mọi câu của 75 bài thuộc dạng màn bài đã hỗ trợ"
- [x] **Bài học thường có cần câu chấm điểm không (qa/dev-lead, vòng 1)** → có, theo S10.1 bài học thường phải có ít nhất một câu chấm điểm; thẻ từ mới, thẻ ngữ pháp, câu hội thoại là câu không chấm; bổ sung vào bảng và thêm Scenario "Bốn bài học thường của mỗi chủ đề có câu chấm điểm"
- [x] **Nút "Kiểm tra vượt cấp" chỉ ở chủ đề thứ hai? (vòng 1)** → với người học mới, mọi chủ đề HSK 1 đang khóa, kể cả chủ đề 1, đều hiện nút; sửa Scenario cho rõ
