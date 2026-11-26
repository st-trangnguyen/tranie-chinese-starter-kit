# Proposal: S11.5 Audio HSK 1 đầy đủ

Story **S11.5 Audio HSK 1 đầy đủ · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s115-audio-hsk-1-đầy-đủ--nội-dung)) ·
GitHub issue [#63](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/63). Bản 0.2, epic E11 Nội dung HSK 1 (#12).

Refs #63

## Why

Là người soạn nội dung, tôi muốn mọi từ, câu và hội thoại đều có audio để người học luôn nghe được. Kiểm tra nội dung (S2.4) đã coi thiếu
audio là lỗi và CI chạy nó cho mọi PR, nên mỗi story S11.1, S11.2, S11.4 phải tự mang audio của nội dung mình khi merge; 500 từ cấp 1 đã có
audio. S11.5 vì vậy **không** phải là bước "chạy pipeline cho toàn bộ HSK 1", mà là **bước chốt** của E11: khóa độ phủ audio HSK 1 bằng
test, nghe lại phát âm và sửa chỗ đọc sai.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Test phủ audio HSK 1 (mọi từ + mọi câu có file, file không rỗng), như test của Nhập môn (S7.1) | `content/scripts/content-check/` (chỉ thêm test và helper cho test, không đổi luật kiểm tra). Mẫu: `content/scripts/content-check/introLessons.test.ts` (đã có helper kiểm file tồn tại và size > 0) |
| Chữ đọc thay cho **từ** đa âm bị đọc sai khi nghe lại (nếu có) | `content/authored/tts-overrides.yaml` (đầu vào pipeline E2) |
| File mp3 tạo lại sau khi thêm chữ đọc thay hoặc soạn lại câu (pipeline sinh, không sửa tay) | `apps/web/src/assets/audio/` |
| Câu HSK 1 soạn lại để tránh cách đọc sai (nếu có) | file bài trong `content/authored/` |

Không có code app (`apps/web/src/app/`), không đổi schema, không đổi giao diện.

## What Changes

1. **Test phủ audio HSK 1**: đọc nội dung đã dựng, kiểm mỗi từ trong 500 từ cấp 1 và mỗi câu của các bài HSK 1 (lời hội thoại, câu ví dụ
   ngữ pháp, câu của bài kiểm tra chủ đề và bài kiểm tra cuối cấp) có file trong thư mục audio, và **file không rỗng**.
2. **Nghe lại phát âm** (người soạn / QA, theo mẫu): từ đa âm đọc sai thì thêm chữ đọc thay rồi tạo lại audio; câu đọc sai thì soạn lại câu
   (xem Open Questions).
3. Chạy lại kiểm tra nội dung trên toàn bộ repo: 0 audio thiếu (AC1).

### RED và hồi quy (CLAUDE.md §0.7)

| Scenario | Loại | Vì sao |
|---|---|---|
| File audio rỗng của một câu HSK 1 thì bị nêu tên | **RED trước** | Kiểm tra nội dung hiện chỉ kiểm có file, không kiểm file rỗng; test trên nội dung thử fail đến khi có phần kiểm phủ audio |
| Câu HSK 1 thiếu file audio thì bị nêu tên | **RED trước** | Test trên nội dung thử của phần kiểm phủ audio mới; fail đến khi phần đó có |
| Mọi từ và câu HSK 1 có file audio không rỗng | Hồi quy (có thể xanh ngay) | Chạy trên nội dung thật; xanh nếu S11.1–S11.4 đã mang đủ audio. Nếu fail (file rỗng, câu chưa phủ) thì sửa nội dung/audio |
| Kiểm tra nội dung trên nội dung HSK 1 không báo thiếu audio | Hồi quy | CI đã chặn thiếu audio từ S2.4; Scenario này ghi lại AC1 |

### Phần không kiểm thử tự động được (ngoại lệ asset)

- **Tạo lại file mp3** là thay đổi asset thuần (ngoại lệ có tên ở CLAUDE.md §0.7). "Không thiếu, không rỗng" được khóa bằng test ở trên.
- **Chất lượng phát âm** (đúng thanh, đúng âm chữ đa âm, giọng tự nhiên) không kiểm tự động được: người soạn / QA nghe lại khi nghiệm thu.

## Phụ thuộc

- **S2.4 Tạo audio TTS** (đã có): kiểm tra nội dung đã báo **lỗi** khi thiếu file audio của từ/câu, nêu số file thiếu và chữ Hán; hành vi
  này đã có test ở `content/scripts/content-check/checks.test.ts` (đúng ví dụ 你好/谢谢). S11.5 không lặp lại Requirement này và không đổi luật.
  Chữ đọc thay của S2.4 khóa theo ID từ, chỉ áp cho từ; audio câu đọc thẳng chữ Hán.
- **S10.6 Hội thoại**: giọng theo vai của lời hội thoại (vai A nữ, vai B nam) do kiểm tra nội dung của S10.6 kiểm. S11.5 không viết lại.
- **S11.1, S11.2, S11.4** (đang viết song song): mỗi story phải tự có audio cho nội dung của mình khi merge, vì CI chạy kiểm tra nội dung.
  S11.5 chạy cuối E11.
- **Xung đột với S11.4 (cần điều phối báo lại)**: proposal S11.4 ghi "audio của câu nghe trong bài này → S11.5" và "Audio cho từ, câu, hội
  thoại (kể cả câu nghe của bài này) → S11.5". Thực tế CI sẽ chặn PR S11.4 nếu câu nghe chưa có audio, nên S11.4 phải tự tạo audio của mình.
  S11.5 không sửa S11.4; điều phối cần báo S11.4 chỉnh lại.
- Nếu kiểm tra nội dung chưa phủ một loại nội dung có nút nghe, đó là thiếu sót của story mở ra loại đó (mở PR spec cho story đó); test phủ
  của S11.5 sẽ lộ ra chỗ đó nhưng không tự vá luật kiểm tra.
- Tạo audio cần mạng; kiểm tra nội dung và test phủ thì không.

## Không làm (out of scope)

- Không lặp lại hay đổi luật "thiếu audio là lỗi" (S2.4, đã phủ test) và luật giọng theo vai (S10.6).
- Không thêm kiểm file rỗng vào kiểm tra nội dung; file rỗng chỉ kiểm trong test phủ audio HSK 1.
- Không đổi pipeline tạo audio (không thêm chữ đọc thay cho câu); không đổi giọng, định dạng, bitrate; không thu âm người thật.
- Không chạy pipeline sinh audio hàng loạt cho nội dung của S11.1–S11.4 (việc của từng story đó).
- Không thêm audio cho đoạn văn đọc hiểu (S10.8), trừ khi đoạn văn được soạn thành câu có nút nghe.
- Không đổi hành vi tải audio offline (S8.4) hay cách app phát audio.
- Không soạn nội dung mới, không sửa nghĩa tiếng Việt (S11.3); chỉ soạn lại câu khi cần tránh cách đọc sai.

## Capabilities

### New Capabilities
- `hsk1-audio`: nội dung HSK 1 có đủ audio không rỗng cho mọi từ, câu và lời hội thoại; kiểm tra nội dung báo không thiếu file nào.

### Modified Capabilities
(không có)

## Impact

- `content/scripts/content-check/`: thêm test phủ audio HSK 1 (kèm helper đọc nội dung đã dựng, nếu cần).
- `content/authored/tts-overrides.yaml`: có thể thêm dòng đọc thay cho từ.
- File bài HSK 1 trong `content/authored/`: có thể soạn lại vài câu bị đọc sai.
- `apps/web/src/assets/audio/`: có thể thay vài file mp3 (tạo lại), không thêm hàng loạt.

## Open Questions

- [x] **"Mọi từ, câu và hội thoại" gồm những gì** → mọi từ trong 500 từ cấp 1, mọi câu của các bài HSK 1 gồm lời hội thoại, câu ví dụ ngữ
  pháp, câu của bài kiểm tra chủ đề và kiểm tra cuối cấp. Đoạn văn đọc hiểu không thuộc phạm vi (ba đề xuất, chờ người thật xác nhận)
- [x] **Thiếu audio là lỗi hay cảnh báo** → lỗi, giữ nguyên luật S2.4, không đổi (ba đề xuất, chờ người thật xác nhận)
- [x] **Có kiểm file rỗng không** → có, chỉ trong test phủ audio HSK 1, không thêm vào kiểm tra nội dung (ba đề xuất, chờ người thật xác nhận)
- [x] **Kiểm chất lượng phát âm thế nào** → không tự động; người soạn / QA nghe lại khi nghiệm thu. Thuộc ngoại lệ asset (ba đề xuất, chờ người thật xác nhận)
- [x] (qa/dev-lead #1) **S11.5 thực sự giao gì, khi CI đã buộc S11.1–S11.4 tự có audio và 500 từ đã có audio** → S11.5 là bước chốt: test phủ
  audio HSK 1 (có file + không rỗng), nghe lại, chữ đọc thay. Đã viết lại Why/What Changes/Impact, thêm bảng RED và hồi quy; thêm Scenario
  trên nội dung thử (thiếu file, file rỗng) để có RED
- [x] (qa/dev-lead #2) **Requirement "Thiếu audio thì kiểm tra nội dung thất bại" trùng S2.4** → bỏ khỏi spec; ghi ở Phụ thuộc là hành vi của
  S2.4, đã có test ở `checks.test.ts`
- [x] (qa/dev-lead #3) **Scenario giọng theo vai trùng S10.6** → bỏ Scenario; giữ bảng giọng làm mô tả, dẫn chiếu "giọng theo vai do S10.6 kiểm"
- [x] (qa/dev-lead #4) **Câu/lời hội thoại có chữ đa âm bị đọc sai (还, 地…), khi chữ đọc thay chỉ áp cho từ** → soạn lại câu để tránh cách
  đọc sai, giữ nghĩa và mục tiêu bài, rồi tạo lại audio. Nếu không soạn lại được mà không mất mục tiêu bài (vd điểm ngữ pháp chính là chữ
  đa âm đó), ghi câu đó vào PR và mở story pipeline riêng cho chữ đọc thay của câu; S11.5 không đổi pipeline (ba đề xuất, chờ người thật xác nhận)
- [x] (qa/dev-lead #5) **S11.4 đẩy audio câu nghe sang S11.5 nhưng CI sẽ chặn S11.4** → không sửa S11.4; ghi xung đột ở mục Phụ thuộc để điều
  phối báo S11.4 tự tạo audio của mình
- [x] (qa/dev-lead #6) **"MUST đọc đúng chữ Hán" không kiểm tự động được** → viết lại: file audio sinh từ chữ Hán (hoặc chữ đọc thay của từ,
  nếu có) với đúng giọng; đúng phát âm để cho nghe lại thủ công
- [x] (qa/dev-lead #7) **Cột giọng "Như khai báo (mặc định nữ)" khó hiểu** → đổi thành "Người soạn chọn; không chọn thì nữ" (rút gọn để requirement dưới 500 ký tự)
- [x] (qa/dev-lead #8) **"có trong bản build" không khớp cách test** → đổi thành "có file trong thư mục audio của nội dung đã dựng"
- [x] (qa vòng 2 #1, dev-lead minor) **MUST "đúng một file" và "giọng theo bảng" không Scenario nào kiểm** → MUST chỉ còn "có file audio
  không rỗng trong thư mục audio của nội dung đã dựng"; bỏ bảng giọng khỏi MUST, thay bằng đoạn mô tả dẫn chiếu S2.4 (giọng mặc định) và
  S10.6 (vai A/B), ghi rõ giọng không thuộc phạm vi kiểm của S11.5
- [x] (qa vòng 2 #2) **`## Purpose` còn "kiểm tra nội dung chặn khi thiếu audio" (hành vi S2.4)** → viết lại: S11.5 khóa độ phủ audio HSK 1
  (có file, không rỗng) bằng test; luật thiếu audio thuộc S2.4, chỉ dẫn chiếu
- [x] (qa vòng 2 #3) **Layer đích chưa chỉ file mẫu** → ghi `content/scripts/content-check/introLessons.test.ts` (helper kiểm file tồn tại
  và size > 0) để planner dùng lại
