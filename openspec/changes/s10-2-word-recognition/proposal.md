# Proposal: S10.2 Nghe chọn chữ / Nhìn chữ chọn nghĩa

Story **S10.2 Nghe chọn chữ / Nhìn chữ chọn nghĩa · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s102-nghe-chọn-chữ--nhìn-chữ-chọn-nghĩa--f3)) ·
GitHub issue [#45](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/45). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp / Đọc / Hội thoại.

Refs #45

## Why

Là người học, tôi muốn luyện nhận diện từ qua nghe và đọc để nhớ từ. Bản 0.1 chỉ có các dạng câu về âm (chọn thanh, cặp âm, gõ pinyin), nói
và viết; chưa có dạng câu nào hỏi người học có nhận ra một từ khi nghe hoặc khi nhìn chữ hay không. S10.2 thêm hai dạng câu trắc nghiệm vào
bài học: **nghe chọn chữ** và **nhìn chữ chọn nghĩa**, chạy trong màn học như các dạng câu đã có (chấm ngay, sai có giải thích).

## Quy tắc chung cho câu trắc nghiệm của E10

S10.2 là story **sở hữu quy tắc chung** cho câu trắc nghiệm (chọn một trong các lựa chọn) của E10. Các câu kiểu chọn của S10.4 (điền chỗ
trống) và câu hỏi đọc hiểu của S10.8 theo đúng ba quy tắc dưới đây, không tự định nghĩa lại:

1. **Thứ tự lựa chọn xáo ngẫu nhiên** mỗi lần câu hiện (khớp câu cặp âm S4.2), giữ nguyên khi bấm "Nghe"/"Nghe chậm", khi chọn và khi
   chấm, cho tới khi rời câu; mở lại bài đang dở thì câu làm lại từ đầu nên xáo mới.
2. **Đánh dấu lựa chọn sau khi chấm bằng chữ**, không chỉ bằng màu: lựa chọn là đáp án ghi "Đáp án đúng", lựa chọn sai người học đã chọn ghi
   "Đã chọn", lựa chọn khác không ghi gì.
3. **Khóa lựa chọn sau khi chấm, chọn được bằng bàn phím**: chọn một lựa chọn thì chấm ngay, sau đó các lựa chọn bị khóa (bấm thêm không đổi
   kết quả); mỗi lựa chọn chọn được bằng bàn phím (Tab tới rồi Enter). Xem Requirement "Chọn xong thì khóa lựa chọn và dùng được bằng bàn phím".

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Khai báo hai dạng câu mới trong nội dung bài (từ đáp án + các từ lựa chọn) và quy tắc hợp lệ khi kiểm tra nội dung | `packages/shared` (`@csk/shared`, schema nội dung) |
| Hai dạng bài + đăng ký vào registry theo dạng câu | `shared/components/exercises/` |
| Xáo thứ tự lựa chọn (pure) | `shared/utils/` (hoặc tái dùng chỗ xáo của câu cặp âm nếu đã có) |
| "Từ của câu" cho hai dạng mới khi tạo thẻ ôn tập (S9.1) và xử lý câu sai (S9.4) | `shared/services/srs.service.ts` (Phần 2) |
| Chữ hiển thị | `apps/web/src/assets/i18n/vi/lesson.json` |
| Phát audio, "Nghe chậm" | `core/services/` audio hiện có, không đổi |

Không có màn mới, route mới, dữ liệu lưu trên máy mới hay đổi file sao lưu.

## What Changes

- **Câu nghe chọn chữ**: màn có nút "Nghe" phát âm của từ đáp án (không tự phát, theo quy tắc nghe lại của S4.4, có "Nghe chậm"); các lựa
  chọn chỉ ghi chữ Hán. Trước khi chấm không hiện pinyin hay nghĩa, không có nút nghe riêng từng lựa chọn.
- **Câu nhìn chữ chọn nghĩa**: màn hiện chữ Hán của từ đáp án; các lựa chọn ghi nghĩa tiếng Việt (mọi nghĩa của từ đó, cách nhau bằng
  "; "). Trước khi chấm không hiện pinyin và không có nút "Nghe".
- **Lựa chọn**: người soạn khai báo từ 2 đến 4 từ lựa chọn cho mỗi câu, trong đó có từ đáp án. Thứ tự lựa chọn xáo ngẫu nhiên mỗi lần câu
  hiện (như câu cặp âm), giữ nguyên cho tới khi rời câu; mở lại bài đang dở thì xáo mới.
- **Chấm**: chọn xong thì chấm ngay, khóa các lựa chọn, hiện "Đáp án đúng" gồm chữ Hán, pinyin có dấu và nghĩa của từ đáp án, kèm nút
  "Nghe". Chọn sai thì giải thích "Đáp án đúng: <chữ Hán> · <pinyin> · <nghĩa>". Lựa chọn là đáp án ghi nhãn "Đáp án đúng", lựa chọn sai đã
  chọn ghi "Đã chọn". Công tắc "Hiện pinyin" trong Cài đặt không áp dụng cho hai dạng này (bật hay tắt, trước hay sau khi chấm).
- **Kiểm tra nội dung** báo lỗi (chỉ rõ bài và câu) khi: từ đáp án không nằm trong các lựa chọn, ít hơn 2 hoặc nhiều hơn 4 lựa chọn, một từ
  lặp lại trong lựa chọn, hai lựa chọn khác nhau nhưng cùng chữ Hán (chữ đa âm như 地 "de"/"dì", 行, 还), từ đáp án không có nghĩa
  tiếng Việt; câu nghe chọn chữ có một lựa chọn đọc giống hệt từ đáp án (cùng pinyin có dấu, ví dụ 他/她); câu nhìn chữ chọn nghĩa có từ lựa
  chọn không có nghĩa hoặc hai lựa chọn có chung ít nhất một nghĩa. Mọi lỗi kiểm tra nội dung của hai dạng đều chỉ rõ bài và câu, và nội
  dung không được ghi ra. Nghĩa chưa review vẫn dùng được (giữ cảnh báo như đã có).
- **Từ của câu** (dùng cho thẻ ôn tập S9.1 và câu sai S9.4): chỉ từ đáp án; các từ nhiễu không tính là đã học. Đây là **ngoại lệ có chủ ý**
  so với luật của S9.1 "coi là đã học mọi từ xuất hiện trong các câu của bài": từ nhiễu chỉ hiện để gây nhiễu (ở câu nghe chọn chữ người học
  không nghe chúng, ở câu nhìn chữ chọn nghĩa chỉ thấy nghĩa), khác câu cặp âm nơi cả hai từ đều được nghe và so sánh sau khi chấm.
- Hai dạng câu không còn bị màn học đánh dấu "bỏ qua vì dạng bài chưa có"; dùng được trong bài học thường và bài kiểm tra.

## Nghiệm thu

Chưa có bài thật nào dùng hai dạng câu này (nội dung HSK 1 là E11). Để QA và e2e kiểm được, bài mẫu có hai dạng câu này **chỉ có trong
bản build dành cho e2e** (như các bài mẫu đã có cho S1.2, S8.4), hoặc e2e thay nội dung bài khi chạy. Bản build người dùng thật dùng
**không** có bài mẫu nào và lộ trình không đổi. QA nghiệm thu trên bản build e2e.

## Không làm (out of scope)

- Tự sinh từ nhiễu từ kho từ (người soạn khai báo lựa chọn); tự sinh câu hỏi từ danh sách từ của bài.
- Dạng ngược (nhìn nghĩa chọn chữ, nghe chọn nghĩa), chọn theo câu (sentence) thay vì từ, chọn pinyin.
- Nghe riêng từng lựa chọn trước khi chấm; hiện pinyin dưới chữ ở lựa chọn.
- Soạn câu hai dạng này cho bài cụ thể (nội dung HSK 1 là E11); flashcard từ mới (S10.1); tra từ (S10.9).
- Đổi màn ôn tập SRS (S9.2 đã có chiều nghĩa/nghe dạng tự chấm, không dùng hai dạng câu này).
- Đổi dữ liệu tiến độ lưu trên máy, file sao lưu.

## Dependencies

- **S3.2 / `lesson-runner`** (đã có): chạy câu lần lượt, chấm ngay, "Đúng"/"Sai", giải thích, "Tiếp tục", khóa đáp án.
- **S4.4 / `audio-replay`** (đã có): câu nghe chọn chữ là một câu nghe, theo đúng quy tắc nút "Nghe", không tự phát, "Nghe chậm", audio lỗi.
- **S3.3 / `lesson-runner`** (đã có): mở lại bài đang dở thì câu đang dở làm lại từ đầu, chưa trả lời.
- **S4.2 / `sound-pair`** (đã có): cách xáo thứ tự lựa chọn và "trước khi chấm không nghe riêng từng lựa chọn" làm mẫu.
- **S9.1** (spec đã merge, code chưa có) và **S9.4** (spec đã merge, code chưa có): bảng "Từ nào của bài được tạo thẻ" của S9.1 chưa có dòng cho
  hai dạng câu này. Spec này thêm quy tắc "từ của câu = từ đáp án" (Requirement "Từ của câu là từ đáp án"); sau khi S9.1 archive nên thêm
  dòng tương ứng vào bảng đó (MODIFIED `review-cards`, ghi rõ ngoại lệ so với "mọi từ xuất hiện trong câu"). Scenario về thẻ ôn tập cần code S9.1 (và S9.4 cho câu sai) có trước.
- **E11** (nội dung HSK 1): người soạn dùng hai dạng câu này khi soạn bài.
- **S10.4, S10.8**: theo quy tắc chung câu trắc nghiệm ở trên.
- Không thêm dependency.

## Capabilities

### New Capabilities
- `word-recognition`: hai dạng câu trắc nghiệm nhận diện từ trong bài học, nghe chọn chữ và nhìn chữ chọn nghĩa: lựa chọn do người soạn
  khai báo, xáo thứ tự, chấm ngay, hiện đáp án đầy đủ; quy tắc kiểm tra nội dung; từ của câu cho thẻ ôn tập.

### Modified Capabilities
(không có)

## Impact

- `packages/shared`: thêm hai dạng câu vào schema nội dung kèm quy tắc hợp lệ; `pnpm content:check` chạy quy tắc mới.
- `apps/web`: hai component dạng bài, registry, chữ i18n, quy tắc "từ của câu" trong dịch vụ ôn tập.
- Không thêm dependency, không đổi dữ liệu IndexedDB hay file sao lưu.

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (story chỉ nêu "chọn trong các lựa chọn"):

- [x] **Lựa chọn lấy từ đâu, bao nhiêu?** → người soạn khai báo 2 đến 4 từ lựa chọn (có từ đáp án), app không tự sinh từ nhiễu; xáo thứ tự
  mỗi lần câu hiện (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu nghe chọn chữ có tự phát audio không?** → không, theo `audio-replay` (S4.4): người học bấm "Nghe"; có "Nghe chậm" (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Lựa chọn hiện gì, trước khi chấm lộ gì?** → nghe chọn chữ: lựa chọn chỉ có chữ Hán, không pinyin/nghĩa, không nghe riêng từng lựa
  chọn; nhìn chữ chọn nghĩa: đề hiện chữ Hán, không pinyin, không nút "Nghe", lựa chọn ghi mọi nghĩa của từ cách nhau "; " (ba đề xuất, chờ
  người thật xác nhận)
- [x] **Sau khi chấm hiện gì?** → khóa lựa chọn, hiện "Đáp án đúng" với chữ Hán, pinyin, nghĩa và nút "Nghe" (không tự phát); sai thì giải
  thích "Đáp án đúng: <chữ Hán> · <pinyin> · <nghĩa>". Công tắc "Hiện pinyin" không áp dụng (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nhiễu có tính là đã học (tạo thẻ ôn tập / câu sai vào ôn tập)?** → không, chỉ từ đáp án (khác câu cặp âm, nơi cả hai từ đều
  được nghe và so sánh) (ba đề xuất, chờ người thật xác nhận)
- [x] **Nội dung sai thì sao?** → kiểm tra nội dung báo lỗi chỉ rõ bài và câu, không ghi nội dung ra (như câu chọn thanh, cặp âm) (ba đề xuất,
  chờ người thật xác nhận)

Vòng duyệt 1 (finding của `qa` và `dev-lead`):

- [x] **Thứ tự lựa chọn mâu thuẫn S10.4/S10.8 (giữ thứ tự soạn)?** → giữ xáo ở S10.2 (khớp S4.2), ghi là quy tắc chung E10 mà S10.4/S10.8
  theo; thêm bảng "giữ nguyên tới khi rời câu" (bấm Nghe, chọn, chấm) và mở lại bài đang dở (S3.3) thì xáo mới vì câu làm lại từ đầu; thêm
  Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **Sau khi chấm các lựa chọn trông thế nào?** → lựa chọn là đáp án ghi "Đáp án đúng", lựa chọn sai đã chọn ghi "Đã chọn", bằng chữ không
  chỉ bằng màu (WCAG 1.4.1); Requirement mới + 3 Scenario; quy tắc chung E10 (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nhiễu đọc giống hệt đáp án (他/她 cùng tā)?** → câu nghe chọn chữ có lựa chọn khác cùng pinyin có dấu với từ đáp án (không phân
  biệt hoa/thường, dấu cách) là lỗi kiểm tra nội dung; khác thanh (妈/马) vẫn hợp lệ; thêm Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **"Hai lựa chọn hiện cùng nghĩa" là trùng chuỗi hay có chung nghĩa?** → có chung ít nhất một nghĩa (so từng nghĩa sau khi bỏ khoảng
  trắng đầu/cuối) là lỗi; thêm Scenario trùng hệt và chung một nghĩa (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ không có nghĩa tiếng Việt?** → lỗi kiểm tra nội dung khi từ đáp án (cả hai dạng) hoặc từ lựa chọn của câu nhìn chữ chọn nghĩa không
  có nghĩa; nghĩa chưa review vẫn dùng được, giữ cảnh báo như đã có (ba đề xuất, chờ người thật xác nhận)
- [x] **Dữ liệu nghiệm thu không được lọt vào lộ trình thật?** → bài mẫu chỉ có trong bản build e2e hoặc e2e thay nội dung, bản build thường
  không có; QA nghiệm thu trên bản build e2e; ghi ở mục "Nghiệm thu" (ba đề xuất, chờ người thật xác nhận)
- [x] **Scenario "2 lựa chọn và 4 lựa chọn" gộp AC1/AC2?** → tách thành Scenario AC1 (nghe chọn chữ, 2 lựa chọn) và AC2 (nhìn chữ chọn nghĩa,
  4 lựa chọn)
- [x] **"Hiện pinyin" bật/tắt có ảnh hưởng?** → thêm vào Requirement "Trước khi chấm…" câu "bất kể công tắc bật hay tắt (trước và sau khi
  chấm)", thêm 2 Scenario
- [x] **Thiếu Scenario chọn bằng bàn phím cho AC1?** → đã thêm
- [x] **"Từ của câu là từ đáp án" lệch luật S9.1 "mọi từ xuất hiện trong câu"?** → ghi rõ là ngoại lệ có chủ ý trong proposal (What Changes,
  Dependencies), giữ ghi chú chuyển thành MODIFIED `review-cards` sau khi S9.1 archive

Vòng duyệt 2 (finding của `qa` và `dev-lead`):

- [x] **Lỗi "hai lựa chọn cùng chữ Hán" chỉ áp cho nghe chọn chữ?** → áp cho cả hai dạng: câu nhìn chữ chọn nghĩa chỉ hiện chữ Hán nên từ
  nhiễu cùng chữ với đáp án (chữ đa âm 地 "de"/"dì", 行, 还) làm câu có hai đáp án; sửa bảng lỗi, proposal; thêm Scenario S10.2-AC2 "Từ nhiễu
  cùng chữ Hán với đáp án thì bị báo lỗi" (ba đề xuất, chờ người thật xác nhận)
- [x] **Quy tắc chung E10 thiếu khóa lựa chọn/bàn phím (S10.4 dẫn lại)?** → thêm quy tắc 3 trỏ Requirement "Chọn xong thì khóa lựa chọn và
  dùng được bằng bàn phím", ghi là quy tắc chung E10; viết lại quy tắc 1 "giữ nguyên khi bấm 'Nghe'/'Nghe chậm', khi chọn và khi chấm, cho
  tới khi rời câu"
- [x] **Luật "không phân biệt hoa/thường và dấu cách" của từ nhiễu đọc giống đáp án chưa có Scenario?** → thêm hai Scenario (khác chữ hoa,
  khác dấu cách)
- [x] **Scenario AC2 "Chọn đúng nghĩa" chưa nêu lựa chọn?** → ghi rõ lựa chọn "你好", "谢谢", "再见"
- [x] **"Không ghi nội dung ra" chỉ có ở một Requirement kiểm tra nội dung?** → lặp câu "MUST NOT ghi nội dung ra" ở cả bốn Requirement kiểm
  tra nội dung, và ghi câu chung trong proposal
- [x] **"Mở lại bài đang dở" chỉ có Scenario AC1?** → thêm Scenario AC2 cho câu nhìn chữ chọn nghĩa
