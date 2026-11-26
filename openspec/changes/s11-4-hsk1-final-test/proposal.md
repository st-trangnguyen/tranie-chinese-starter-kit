# Proposal: S11.4 Kiểm tra cuối cấp

Story **S11.4 Kiểm tra cuối cấp · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s114-kiểm-tra-cuối-cấp--nội-dung)),
epic E11 Nội dung HSK 1 · GitHub issue [#62](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/62). Bản 0.2.

Refs #62

## Why

Là người học, tôi muốn làm bài kiểm tra cuối HSK 1 để biết mình đã đạt cấp độ này chưa. Mỗi chủ đề HSK 1 đã có bài kiểm
tra riêng (S11.1, luật đạt 80% của S3.5), nhưng chưa có bài nào gom cả cấp và phủ đủ bốn kỹ năng. S11.4 thêm một bài kiểm
tra cuối cấp ngay sau giai đoạn HSK 1, có câu nghe, nói, đọc, viết, chạy bằng màn bài và luật bài kiểm tra đã có.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Nội dung bài kiểm tra cuối cấp (các câu hỏi), khai báo bài cuối cấp, vị trí trong lộ trình | `content/authored/` (nội dung soạn, build ra `assets/content`) |
| Cách khai báo bài kiểm tra cuối cấp trong nội dung, bảng dạng bài → kỹ năng | `packages/shared` (`@csk/shared`) |
| Quy tắc phủ kỹ năng (≥5 câu mỗi kỹ năng, câu viết ≤ 1/4), chỉ bài loại kiểm tra được khai báo cuối cấp | kiểm tra nội dung (`content/scripts/content-check`) |
| Chạy bài, chấm, màn tổng kết đạt/chưa đạt, làm lại, "Kiểm tra vượt cấp" | Không đổi: màn bài và lộ trình S3.2–S3.6 (`pages/lesson/`, `pages/learning-path/`, `shared/services/`) |

Không đổi code màn bài, lộ trình hay service: bài kiểm tra cuối cấp là một bài loại kiểm tra như bài kiểm tra cuối chủ đề.

## What Changes

- Thêm một giai đoạn "Kiểm tra cuối cấp HSK 1" ngay sau giai đoạn "HSK 1" (S11.1), gồm một nhóm với đúng một bài kiểm tra cùng
  tên. Giai đoạn "HSK 1" giữ đúng 15 chủ đề × 5 bài của S11.1.
- Audio cho từ và câu của bài kiểm tra cuối cấp được sinh bằng quy trình tạo audio đã có (S2.4) và đi cùng PR code, để kiểm tra
  nội dung chạy qua; không thêm luật audio mới.
- Nội dung khai báo bài nào là bài kiểm tra cuối cấp (không nhận ra theo tiêu đề). Chỉ bài loại kiểm tra được khai báo như vậy.
- Bài kiểm tra cuối cấp có ít nhất 5 câu cho mỗi kỹ năng nghe, nói, đọc, viết; câu viết không quá một phần tư tổng số câu. Mỗi
  câu thuộc một dạng bài màn bài đã hỗ trợ, quy về đúng một kỹ năng theo bảng trong spec.
- Kiểm tra nội dung báo lỗi khi bài kiểm tra cuối cấp có kỹ năng dưới 5 câu, câu viết quá một phần tư, hoặc khi bài không phải loại
  kiểm tra được khai báo cuối cấp.
- Bài chạy như mọi bài kiểm tra (S3.5): đạt từ 80% thì "Bạn đã đạt", chưa đạt thì "Chưa đạt, cần từ 80%" kèm "Làm lại". Nhóm cuối
  cấp chưa mở có nút "Kiểm tra vượt cấp" (S3.6); đạt qua nút chỉ đánh dấu bài cuối cấp "Đã xong".

## Không làm (out of scope)

- 15 chủ đề × 5 bài, độ phủ 500 từ → **S11.1**. Điểm ngữ pháp → **S11.2**. Review nghĩa tiếng Việt → **S11.3**.
- Dạng bài mới hoặc sửa dạng bài: nghe, chọn thanh, cặp âm, gõ pinyin (E4), nói (E5), viết chữ (E6), nhận diện từ, sắp xếp câu,
  điền chỗ trống, đóng vai, đọc hiểu (E10). S11.4 chỉ dùng lại.
- Viết không gợi ý trong màn bài: câu viết chữ trong màn bài có gợi ý và luôn "Đúng" khi viết xong (S7.1), nên kỹ năng viết chưa đo
  thật. Đây là hạn chế đã biết; đưa viết không gợi ý (S6.3) vào màn bài để story sau.
- Kiểm tra tự động "câu hỏi chỉ dùng từ trong 500 từ HSK 1": không làm (cần tách từ câu tiếng Trung). QA kiểm tay khi nghiệm thu
  trong mục chất lượng câu hỏi.
- Luật riêng chặn câu không chấm điểm trong bài cuối cấp: dùng lại luật chung của S10.1/S10.6 cho mọi bài kiểm tra, không cài lại.
- Điểm riêng từng kỹ năng trên màn tổng kết, chứng nhận/huy hiệu "Đã đạt HSK 1", hiện kết quả trên Trang chủ → không làm.
- Câu sai của bài kiểm tra vào ôn tập (S9.4): hành vi kế thừa của mọi bài kiểm tra, không thuộc phạm vi kiểm của S11.4.

## Dependencies

- **Phụ thuộc cứng — kỹ năng đọc:** `main` hiện chỉ có dạng chọn thanh, cặp âm, gõ pinyin, nói, viết chữ; không dạng nào là "đọc".
  Pha Code của S11.4 **chỉ bắt đầu khi ít nhất một dạng đọc đã merge**: S10.2 (nhìn chữ chọn nghĩa), S10.3 (sắp xếp câu), S10.4
  (điền chỗ trống) hoặc S10.8 (đọc hiểu). Scenario "Câu đọc dạng E10 được tính cho kỹ năng đọc" và mọi Scenario có câu đọc phụ
  thuộc điều này. Các dạng còn lại của E10 (nghe chọn chữ S10.2, đóng vai S10.7) là tùy chọn: chưa merge thì không dùng, không
  Scenario nào phụ thuộc chúng.
- **S11.1** (đang viết song song): giai đoạn "HSK 1" với đúng 15 chủ đề × 5 bài. Bài cuối cấp nằm trong giai đoạn riêng để không
  làm sai luật đếm của S11.1; bài mở khi bài kiểm tra của chủ đề thứ 15 đã xong.
- **S3.5**, **S3.6** (đã archive): bài kiểm tra, ngưỡng 80%, "Bạn đã đạt" / "Chưa đạt, cần từ 80%", "Làm lại", nút "Kiểm tra vượt cấp".
- **S10.1/S10.6** (spec đang mở): luật chung "bài kiểm tra không có câu không chấm điểm". Khi chưa merge thì `main` chưa có dạng
  không chấm điểm nào, nên không có lỗ hổng.
- **E4** (S4.1–S4.3), **E5** (S5.1–S5.4), **S6.2/S7.1** (câu viết chữ trong màn bài), kiểm tra nội dung chặn câu viết thiếu dữ liệu
  nét (S7.1): đã có.
- **S9.4** (spec đang mở): câu sai vào ôn tập, kế thừa, không kiểm ở đây.
- **S11.5**: bước chốt kiểm phủ và nghe lại audio HSK 1; S11.4 tự mang audio của mình vì luật thiếu audio của S2.4 là lỗi.

## Ngoại lệ test-first và phần không tự động

- Soạn câu hỏi của bài kiểm tra là **nội dung thuần** (asset), được miễn test-first theo `docs/05-standards/spec-driven.md`; quy tắc
  phủ kỹ năng vẫn có test (kiểm tra nội dung + Vitest trên nội dung đã build), luồng làm bài có e2e. File mp3 do quy trình tạo
  audio sinh ra cũng là **asset thuần**, miễn test-first; luật thiếu audio đã có (S2.4) bắt việc thiếu file.
- Không kiểm thử tự động được, QA chạy tay khi nghiệm thu: chất lượng câu hỏi (đúng trình độ HSK 1, chỉ dùng từ HSK 1, đáp án đúng,
  không mơ hồ), ghi âm bằng mic thật và chấm tự động bằng nhận dạng giọng nói (S5.3). E2e làm câu nói theo đường không có mic (S5.4).

## Capabilities

### New Capabilities
- `hsk1-final-test`: bài kiểm tra cuối cấp HSK 1: khai báo trong nội dung, vị trí trên lộ trình, phủ đủ 4 kỹ năng, dạng bài được
  dùng, cách làm bài và kết quả.

### Modified Capabilities
- (không có)

## Impact

- Nội dung mới: giai đoạn + bài kiểm tra cuối cấp trong `content/authored/` (lộ trình và bài), có khai báo bài cuối cấp.
- Schema nội dung thêm cách khai báo bài kiểm tra cuối cấp (tùy chọn, nội dung cũ vẫn hợp lệ).
- Kiểm tra nội dung thêm quy tắc phủ kỹ năng cho bài kiểm tra cuối cấp.
- File mp3 mới cho từ và câu của bài kiểm tra cuối cấp, do quy trình tạo audio có sẵn sinh ra và commit trong PR code.
- Không đổi code màn bài/lộ trình, không đổi IndexedDB, không thêm dependency.

## Open Questions

- [x] Số câu tối thiểu mỗi kỹ năng (AC chỉ nói "đủ 4 kỹ năng") → mỗi kỹ năng ít nhất 5 câu, và câu viết không quá một phần tư tổng số câu để "Chưa đạt" luôn đạt được dù câu viết luôn "Đúng"; kiểm tra nội dung báo lỗi nêu kỹ năng và số câu (ba đề xuất, chờ người thật xác nhận)
- [x] Kỹ năng viết: câu viết chữ trong màn bài có gợi ý và luôn "Đúng" (S7.1) → bản này dùng câu viết chữ đã có, ghi rõ hạn chế đã biết trong spec và "Không làm"; viết không gợi ý (S6.3) trong màn bài để story sau (ba đề xuất, chờ người thật xác nhận)
- [x] Bảng dạng bài → kỹ năng: sắp xếp câu và điền chỗ trống là "đọc", gõ pinyin sau khi nghe là "nghe", đóng vai là "nói" → giữ như bảng trong spec, thêm cột "Có từ" (ba đề xuất, chờ người thật xác nhận)
- [x] Nhóm cuối cấp chưa mở có nút "Kiểm tra vượt cấp" (S3.6) → chấp nhận, khớp mục đích "biết mình đã đạt chưa"; đạt qua nút chỉ đánh dấu bài cuối cấp "Đã xong", không mở chủ đề nào của HSK 1; đã thêm vào bảng trạng thái và Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] Câu hỏi chỉ dùng từ trong 500 từ HSK 1? → không kiểm tự động (cần tách từ câu tiếng Trung), QA kiểm tay; ghi vào "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] Vị trí: giai đoạn riêng "Kiểm tra cuối cấp HSK 1" ngay sau "HSK 1" thay vì nhóm thứ 16 (sẽ làm sai luật "đúng 15 chủ đề" của S11.1) → giai đoạn riêng (ba đề xuất, chờ người thật xác nhận)
- [x] Câu chữ tên giai đoạn và tên bài → "Kiểm tra cuối cấp HSK 1" cho cả hai (ba đề xuất, chờ người thật xác nhận)
- [x] (dev-lead) Kỹ năng đọc chưa có dạng nào trên `main`, câu "đủ 4 kỹ năng bằng các dạng đã có" sai → bỏ câu đó; ghi phụ thuộc cứng: pha Code chỉ bắt đầu khi ít nhất một dạng đọc (S10.2/S10.3/S10.4/S10.8) đã merge; Scenario đóng vai và sắp xếp câu thay bằng Scenario dùng dạng đã có (gõ pinyin, nói theo mẫu, viết chữ) và một Scenario đọc chung cho dạng đọc đã merge
- [x] (dev-lead) Kiểm tra nội dung nhận ra bài cuối cấp theo tiêu chí gì → nội dung khai báo bài nào là bài kiểm tra cuối cấp, không theo tiêu đề; không có bài nào được khai báo thì không lỗi; bài không phải loại kiểm tra được khai báo thì lỗi; nội dung thật phải khai báo bài HSK 1 (ba đề xuất, chờ người thật xác nhận)
- [x] (qa/dev-lead) Requirement "chỉ có câu chấm được đúng/sai" mâu thuẫn với câu viết luôn "Đúng" → đổi thành "có kết quả chấm", ghi hạn chế đã biết; câu không chấm điểm dùng lại luật chung S10.1/S10.6, không cài trùng
- [x] (qa) Scenario "Sai nhiều câu thì chưa đạt" thiếu câu viết trong WHEN → thêm "viết xong mọi chữ"; với câu viết ≤ 1/4 thì điểm tối đa 25%, chắc chắn chưa đạt
- [x] (qa) Bảng trạng thái chồng dòng → đặt "Đã xong" lên đầu, ghi "xét từ trên xuống", thêm cột nút "Kiểm tra vượt cấp"
- [x] (qa) Scenario "Không câu nào phải bỏ qua" thiếu điều kiện dữ liệu nét → thêm điều kiện có mạng; thêm Scenario nội dung đã build "mọi chữ của câu viết có dữ liệu nét"
- [x] (qa) "câu sai chuyển sang ôn tập (S9.4)" trong What Changes → chuyển sang Dependencies và "Không làm", là hành vi kế thừa không kiểm ở đây
- [x] (qa/dev-lead) "Không làm" đẩy audio câu nghe của bài này sang S11.5, nhưng luật S2.4 coi thiếu mp3 là lỗi nên PR code sẽ đỏ và mâu thuẫn Scenario "Kiểm tra nội dung chạy qua với nội dung thật" → đưa audio của bài cuối cấp vào phạm vi S11.4 (sinh bằng quy trình có sẵn, commit mp3 trong PR code, không thêm luật audio); bỏ dòng audio ở "Không làm"; S11.5 chỉ còn chốt kiểm phủ và nghe lại; mp3 là asset thuần
- [x] (qa) TC-8 kỳ vọng thêm "không bài kiểm tra cuối chủ đề nào được khai báo như vậy" mà Scenario chưa có → thêm AND tương ứng vào Scenario "Nội dung thật khai báo bài cuối cấp HSK 1" (khớp Requirement: luật cuối cấp không áp cho bài kiểm tra cuối chủ đề)
