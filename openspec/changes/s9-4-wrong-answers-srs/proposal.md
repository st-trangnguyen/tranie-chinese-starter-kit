# Proposal: S9.4 Câu sai vào SRS

Story **S9.4 Câu sai vào SRS · F4, F5** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s94-câu-sai-vào-srs--f4-f5)) ·
GitHub issue [#42](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/42). Bản 0.2, epic E9 Ôn tập SRS.

Refs #42

## Why

Là người học, tôi muốn các câu làm sai trong bài kiểm tra được đưa vào ôn tập để khắc phục điểm yếu. S3.5 đã chuyển danh sách câu sai của
bài kiểm tra sang "phần ôn tập" nhưng chưa có gì nhận (việc tạo thẻ để dành cho S9.4); S9.1 tạo thẻ khi xong bài học, S9.2 hỏi thẻ đến hạn.
S9.4 nối hai phần: từ người học vừa làm sai trong bài kiểm tra có thẻ, hoặc thẻ có sẵn được hỏi lại ngay ở lần ôn kế tiếp.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc: câu sai nào thuộc từ nào, chiều nào; loại bài kiểm tra nào được tạo thẻ; đưa thẻ có sẵn về đến hạn (Phần 2, pure); use case "xử lý câu sai của một lần làm bài kiểm tra", gồm xét thẻ chiều viết như S9.1 (Phần 3) | `shared/services/srs.service.ts` (có từ S9.1, thêm method) |
| Nối cổng nhận câu sai của bài kiểm tra (S3.5) vào use case trên; truyền loại lần làm bài (cuối chủ đề hay vượt cấp); lỗi lưu thẻ không còn làm màn tổng kết báo lỗi | `shared/services/lesson.service.ts`, `pages/lesson/hooks/` (hook màn học hiện có) |
| Đọc/ghi thẻ | `core/services/` (`ProgressStore`, nơi lưu thẻ của S9.1, không đổi cấu trúc) |

Không có màn, component, chữ hiển thị hay style mới; không đổi dữ liệu lưu trên máy, không đổi file sao lưu. Người học thấy kết quả ở màn ôn
tập (S9.2).

## What Changes

- **Câu sai của bài kiểm tra cuối chủ đề** (đạt hay chưa đạt, lần đầu hay làm lại): với mỗi từ của câu sai, thẻ chiều nghĩa và chiều nghe
  chưa có thì tạo ở trạng thái "mới", đã có thì đưa về cần ôn sớm. Xử lý lúc làm xong bài (màn tổng kết hiện); thoát giữa bài thì không.
  Quy tắc này chỉ cho câu sai; chữ viết xong ở câu viết được ghi ngay lúc viết xong (xem "Thẻ chiều viết").
- **"Câu sai" và "từ của câu"** theo đúng cách chấm hiện có: chọn sai thanh, gõ pinyin sai, chọn sai âm ở câu cặp âm (cả hai từ của cặp), tự
  chấm "Gần đúng"/"Chưa đúng" ở câu nói theo từ. Câu nói theo một câu không gắn với từ nên không tạo hay đổi thẻ (như S9.1). Câu viết chữ
  không bao giờ sai; câu bỏ qua không phải câu sai.
- **"Cần ôn sớm"** = thời điểm ôn tiếp theo kéo về lúc làm xong bài (đến hạn ngay), mức nhớ và trạng thái giữ nguyên; không tính là một lần
  chấm. Thẻ "mới" và thẻ đã quá hạn giữ nguyên. Lịch ôn sau đó do lần người học tự chấm trên màn ôn tập tính (S9.2).
- **Kiểm tra vượt cấp** (mở bằng nút "Kiểm tra vượt cấp", kể cả lần bấm "Làm lại" trên màn tổng kết khi chưa đạt): câu sai chỉ đưa thẻ có
  sẵn về ôn sớm, **không tạo thẻ mới**. Lý do: các từ của chủ đề chưa mở là từ người học chưa
  học; S9.1 đã chốt không tạo thẻ cho từ chưa học (bài được đánh dấu xong nhờ vượt cấp không tạo thẻ). Chưa đạt thì người học sẽ học chủ đề
  đó và có thẻ theo S9.1; đạt thì người học mở bài nào ra làm hết là có thẻ của bài đó (S9.1). Từ đã học ở chủ đề trước mà làm sai trong
  bài vượt cấp thì vẫn được đưa về ôn sớm.
- **Thẻ chiều viết** (ràng buộc của S9.1): giữ định nghĩa của S9.1 "từ đã học xong = đã có thẻ chiều nghĩa, bất kể tạo từ đâu"; không lưu
  nguồn gốc thẻ. Thẻ chiều nghĩa tạo từ câu sai làm từ thành "đã học xong": nếu mọi chữ của từ đã được viết xong trên khung có gợi ý thì tạo
  thẻ chiều viết ngay; chưa thì tạo khi viết xong chữ cuối hoặc khi xong bài học chứa từ (quy tắc S9.1, nên không có trường hợp xong bài mà mất
  thẻ chiều viết). Câu sai không đưa thẻ chiều viết có sẵn về ôn sớm (không dạng câu kiểm tra nào kiểm việc viết). Chữ viết xong ở câu viết
  của bài kiểm tra, dù bài đạt hay chưa, được ghi là chữ đã viết xong như viết trên màn luyện viết (giữ cho các lần sau) và được tính trước
  khi xử lý câu sai của cùng lần; thẻ chiều viết tạo theo quy tắc S9.1 khi từ đã học xong (từ đã có thẻ chiều nghĩa thì tạo ngay lúc viết
  xong, có hay không câu sai). Chữ được ghi ngay lúc viết xong, kể cả khi sau đó thoát giữa bài. Từ đã có thẻ chiều nghĩa, thiếu thẻ chiều viết
  do lưu lỗi lần trước, viết xong lại một chữ của từ ở câu viết của bài kiểm tra thì thẻ chiều viết được tạo bù ngay (khôi phục của S9.1). Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết. Từ đã có thẻ chiều nghĩa từ trước mà thiếu thẻ chiều
  viết, mọi chữ đã viết xong từ trước lần làm bài này và lần này không viết chữ nào của từ, thì câu sai không tạo bù (bù theo S9.1); bài kiểm
  tra không phải "bài chứa từ" theo nghĩa S9.1.
- **Thẻ có sẵn đọc không được** (như "Thẻ bị bỏ qua" của S9.2): coi là đã có, giữ nguyên, không tạo đè, không báo lỗi; phần còn lại vẫn xử lý.
- **Kiểm tra cuối chủ đề của chủ đề đã qua bằng vượt cấp** (mở từ bản đồ sau khi chủ đề "Đã xong"): xử lý như mọi bài kiểm tra cuối chủ đề,
  câu sai tạo thẻ còn thiếu. Tiến độ đã lưu không phân biệt bài người học tự làm xong với bài được đánh dấu xong nhờ vượt cấp (S9.1), và
  S9.4 không thêm dữ liệu để phân biệt.
- **Lưu thẻ được một phần**: màn tổng kết như thường, không báo lỗi; thẻ đã lưu được vẫn còn; thẻ còn thiếu tạo bù ở lần sau, không trùng.
- **Lưu thẻ lỗi**: màn tổng kết và kết quả bài kiểm tra (đạt, mở chủ đề) như bình thường, không báo lỗi (như S9.1); câu sai của lần đó
  không được xử lý lại.

## Không làm (out of scope)

- Câu sai trong bài học thường: không tạo thêm hay đưa thẻ về ôn sớm (bài học tạo thẻ theo S9.1 khi xong bài).
- Tạo thẻ mới từ câu sai của kiểm tra vượt cấp (xem lý do ở trên).
- Thẻ cho câu (sentence), thẻ "câu hỏi" riêng (hỏi lại đúng câu đã sai), chiều thẻ mới. Thẻ vẫn chỉ có ba chiều của S9.1.
- Đưa thẻ chiều viết về ôn sớm; tự chấm thẻ thay người học (ghi như chấm "Quên").
- Lưu nguồn gốc thẻ (tạo từ bài học hay từ câu sai) trong dữ liệu hoặc file sao lưu; đổi cấu trúc dữ liệu lưu trên máy; đổi file sao lưu.
- Thông báo trên màn tổng kết kiểu "Đã thêm N thẻ vào ôn tập", nút "Ôn ngay" từ màn tổng kết.
- Xử lý lại câu sai của lần làm bài mà lưu thẻ bị lỗi; xử lý câu sai của bài kiểm tra làm trước khi có tính năng này.
- Giới hạn mỗi ngày (S9.3), thống kê (S9.5).

## Dependencies

- **S9.1** (spec PR #148 đã merge, code chưa có): thẻ ba chiều, trạng thái "mới", mỗi từ tối đa một thẻ mỗi chiều, "Từ đã học xong cho thẻ
  chiều viết" (đã có thẻ chiều nghĩa, bất kể nguồn) và "Khi nào tạo thẻ chiều viết". S9.4 giữ nguyên định nghĩa đó, đúng ràng buộc ở mục
  Dependencies của S9.1. Ba chỗ trong spec S9.1 cần đọc cùng spec này, sửa câu chữ sau khi S9.1 archive (không đổi hành vi S9.1):
  - Bảng "Khi nào xét tạo thẻ chiều nghĩa và chiều nghe", dòng "Bài kiểm tra cuối chủ đề, bài kiểm tra vượt cấp → Không (câu sai vào ôn
    tập là S9.4)": "Không" là không tạo thẻ cho việc làm xong bài kiểm tra; câu sai tạo thẻ theo S9.4.
  - Bảng "Khi nào tạo thẻ chiều viết", dòng "Đã viết xong mọi chữ của từ, chưa học xong từ → tạo khi người học làm xong bài chứa từ": thêm
    "hoặc khi câu sai trong bài kiểm tra cuối chủ đề tạo thẻ chiều nghĩa" (Requirement "Thẻ chiều viết khi câu sai tạo thẻ chiều nghĩa").
  - Requirement "Câu viết trong bài tính ngay trong lượt làm bài" ("khi bài đó thành 'Đã xong'"): thêm "Ở bài kiểm tra, dù đạt hay chưa
    đạt (bài chưa đạt không thành 'Đã xong'), chữ viết xong ở câu viết được ghi là chữ đã viết xong như viết trên màn luyện viết" (Requirement
    "Câu viết trong bài kiểm tra tính trước khi xử lý câu sai" và "Thẻ chiều viết khi viết chữ trong bài kiểm tra" của spec này). Không đổi hành vi của bài học thường.
  Code S9.4 làm sau code S9.1.
- **S9.2** (spec PR #149 đã merge, code chưa có): "đến hạn", thứ tự hỏi, tự chấm và xếp lịch FSRS. Thẻ được đưa về ôn sớm có thời điểm ôn
  tiếp theo bằng lúc làm xong bài nên nằm trong nhóm "thẻ đã chấm" theo hạn của S9.2. Việc đưa về ôn sớm không phải một lần chấm nên không
  đi qua quy tắc xếp lịch của S9.2. Các Scenario "mở màn ôn tập thì phiên có thẻ…" cần màn ôn tập của S9.2; code S9.4 làm sau code S9.2,
  hoặc kiểm bằng "thẻ đã đến hạn" nếu S9.2 chưa có.
- **S9.3** (spec PR #151, chưa merge): S9.3 chỉ đếm lần chấm trên màn ôn tập. Do đó: tạo thẻ hay đưa thẻ về ôn sớm lúc làm xong bài kiểm tra
  **không** tính vào giới hạn; thẻ tạo từ câu sai là thẻ "mới", khi được chấm trên màn ôn tập thì tính vào giới hạn thẻ mới; thẻ được đưa
  về ôn sớm là thẻ đã chấm, khi được chấm thì tính 1 lượt ôn, và có thể bị giữ lại sang hôm sau nếu đã đạt giới hạn. Nếu S9.3 merge với
  cách đếm khác thì cập nhật mục này.
- **S3.5** (đã có): Requirement "Câu sai trong bài kiểm tra được chuyển sang ôn tập" của `lesson-runner` (chuyển câu sai lúc lần làm bài kết
  thúc, không chuyển câu đúng hay câu bỏ qua, mỗi lần làm chỉ chuyển câu sai của lần đó). S9.4 là bên nhận; không sửa Requirement đó.
- **S3.6** (đã có): kiểm tra vượt cấp mở từ nút "Kiểm tra vượt cấp", dùng bài kiểm tra của chủ đề; chưa đạt thì màn tổng kết có nút
  "Làm lại" (S3.6-AC2). S9.4 phân biệt hai loại lần làm bài theo cách mở: lần mở bằng "Kiểm tra vượt cấp" và các lần "Làm lại" nối tiếp từ
  màn tổng kết của nó là vượt cấp; lần mở bài kiểm tra cuối chủ đề từ bản đồ là cuối chủ đề.
- **S3.2, E4, E5** (đã có): cách chấm đúng/sai từng dạng câu; S5.2 "Gần đúng" và "Chưa đúng" tính là câu sai; S7.1 câu viết chỉ có "Đúng".
- **S8.5 / sao lưu**: không đổi; thẻ do S9.4 tạo hay đổi hạn là thẻ bình thường, đã nằm trong file sao lưu của S9.1.
- Không thêm dependency.

## Capabilities

### New Capabilities
- `wrong-answer-review`: câu sai trong bài kiểm tra cuối chủ đề tạo thẻ chiều nghĩa và nghe còn thiếu hoặc đưa thẻ có sẵn về đến hạn ngay;
  kiểm tra vượt cấp chỉ đưa thẻ có sẵn về sớm; thẻ chiều viết theo định nghĩa của S9.1; lưu lỗi không làm hỏng màn tổng kết.

### Modified Capabilities
(không có; `lesson-runner`, `review-cards`, `review-session` giữ nguyên, xem Dependencies)

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (chi tiết ở các dòng bên dưới):

1. Câu sai về một từ ảnh hưởng thẻ chiều nghĩa và chiều nghe của từ đó (tạo nếu thiếu, đưa về ôn sớm nếu có), không đụng thẻ chiều viết có sẵn.
2. Câu cặp âm sai: cả hai từ của cặp; câu nói theo một câu: không tạo hay đổi thẻ; "Gần đúng" ở câu nói là câu sai.
3. "Cần ôn sớm" = đến hạn ngay lúc làm xong bài, mức nhớ giữ nguyên, không tính là một lần chấm; thẻ "mới" và thẻ quá hạn giữ nguyên.
4. Kiểm tra vượt cấp: chỉ đưa thẻ có sẵn về ôn sớm, không tạo thẻ mới.
5. Chỉ xử lý khi làm xong bài kiểm tra (tới màn tổng kết), cả khi đạt; thoát giữa bài thì không; câu sai trong bài học thường không xử lý.
6. Thẻ chiều nghĩa từ câu sai làm từ thành "đã học xong" cho thẻ chiều viết (giữ định nghĩa S9.1); đủ chữ đã viết thì tạo thẻ chiều viết ngay.
7. Lưu thẻ lỗi: màn tổng kết và kết quả bài như bình thường, không báo lỗi; câu sai của lần đó không xử lý lại.
8. Không thông báo trên màn tổng kết về thẻ vừa tạo / đưa về ôn sớm.
9. Kiểm tra cuối chủ đề mở từ bản đồ của chủ đề đã qua bằng vượt cấp: câu sai tạo thẻ còn thiếu như mọi bài kiểm tra cuối chủ đề.
10. Lưu thẻ được một phần: màn tổng kết như thường, không báo lỗi, thẻ đã lưu vẫn còn; thẻ thiếu tạo bù ở lần sau.
11. "Làm lại" trên màn tổng kết kiểm tra vượt cấp chưa đạt vẫn là kiểm tra vượt cấp: không tạo thẻ mới.
12. Thẻ có sẵn đọc không được: giữ nguyên, không tạo đè, không báo lỗi; chiều và từ khác vẫn xử lý.
13. Chữ viết xong ở câu viết của bài kiểm tra, dù đạt hay chưa đạt, được ghi là chữ đã viết xong như trên màn luyện viết (giữ cho lần sau)
    và tính trước khi xử lý câu sai cùng lần; thẻ chiều viết theo quy tắc S9.1 (từ đã có thẻ chiều nghĩa thì tạo ngay lúc viết xong).
14. Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết; từ đã có thẻ chiều nghĩa từ trước mà thiếu thẻ chiều viết, mọi chữ đã viết xong
    từ trước lần làm bài này và lần này không viết chữ nào của từ, thì câu sai không tạo bù (bù theo S9.1).
15. Chữ viết xong ở câu viết của bài kiểm tra được ghi ngay lúc viết xong, kể cả khi sau đó thoát giữa bài; "chỉ xử lý khi làm xong bài"
    chỉ áp dụng cho câu sai.

- [x] **Câu sai tạo thẻ chiều nào?** Dạng câu kiểm tra (thanh điệu, pinyin, cặp âm, nói) không trùng chiều nào trong ba chiều của S9.1. → câu
  sai về một từ = từ đó cần ôn: thẻ chiều nghĩa và chiều nghe (cặp thẻ cơ bản S9.1 tạo cho mọi từ đã học), không phân theo dạng câu. Thẻ
  chiều viết có sẵn không bị đưa về ôn sớm vì không dạng câu kiểm tra nào kiểm việc viết (Requirement "Câu sai trong bài kiểm tra tạo thẻ
  hoặc đưa thẻ về ôn sớm", Scenario "Thẻ chiều viết có sẵn không bị đưa về ôn sớm") (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu sai là gì cho từng dạng câu, câu không gắn với từ thì sao?** → bảng trong Requirement "Câu nào là câu sai và thuộc từ nào": dùng
  đúng cách chấm hiện có; cặp âm xử lý cả hai từ (như S9.1 tạo thẻ cho cả hai); nói theo một câu không tạo thẻ (như S9.1, không có thẻ
  câu); "Gần đúng" là câu sai (S5.2); câu viết không bao giờ sai; câu bỏ qua không phải câu sai (S3.5). Một từ sai nhiều câu xử lý một lần (ba
  đề xuất, chờ người thật xác nhận)
- [x] **"Trạng thái cần ôn sớm" đo thế nào: đến hạn ngay hay ghi như chấm "Quên"?** → đến hạn ngay: thời điểm ôn tiếp theo = lúc làm xong bài,
  mức nhớ giữ nguyên, không phải một lần chấm. Không chọn "ghi như chấm Quên" vì: thẻ đã quá hạn hoặc đang ở bước học ngắn sẽ bị đẩy hạn
  lùi lại (Quên cho hạn sau vài phút), thẻ "mới" sẽ mất trạng thái "mới" (lách giới hạn thẻ mới của S9.3), và app tự chấm thay người học trong
  khi S9.2 để người học tự chấm. Thẻ "mới" giữ nguyên (đã đến hạn ngay); thẻ đã đến hạn giữ nguyên hạn cũ (không lùi). Requirement "Đưa thẻ
  có sẵn về cần ôn sớm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu sai trong kiểm tra vượt cấp có tạo thẻ không?** → không tạo thẻ mới, chỉ đưa thẻ có sẵn về ôn sớm. Lý do ở What Changes: từ của
  chủ đề chưa mở là từ chưa học, S9.1 không tạo thẻ cho từ chưa học; tạo thẻ sẽ dồn thẻ của cả chủ đề người học chưa học khi chưa đạt. Hệ
  quả: đạt vượt cấp mà còn câu sai về từ chưa có thẻ thì từ đó chưa có thẻ cho tới khi người học làm bài chứa từ (ba đề xuất, chờ người
  thật xác nhận)
- [x] **Khi nào xử lý câu sai, đạt rồi có xử lý không, thoát giữa bài?** → lúc làm xong bài (màn tổng kết hiện), đạt hay chưa đạt, lần đầu hay
  làm lại, kể cả còn câu bỏ qua, đúng như S3.5 đã chuyển câu sai; thoát giữa bài không xử lý (bài kiểm tra luôn làm lại từ câu 1). Câu sai
  trong bài học thường không xử lý (story nói "bài kiểm tra") (ba đề xuất, chờ người thật xác nhận)
- [x] **Ràng buộc S9.1 về "từ đã học xong" cho thẻ chiều viết** → giữ định nghĩa S9.1 (đã có thẻ chiều nghĩa, bất kể nguồn); không lưu nguồn
  gốc thẻ nên không đổi dữ liệu hay file sao lưu. Hệ quả nhất quán với S9.1 "tạo lúc điều kiện thứ hai đúng": câu sai tạo thẻ chiều nghĩa mà
  mọi chữ đã viết xong thì tạo thẻ chiều viết ngay. Từ có thẻ chiều nghĩa nhờ câu sai, sau đó xong bài học có câu viết chữ thì có thẻ chiều
  viết theo quy tắc S9.1 (Scenario "Thẻ nghĩa từ câu sai rồi xong bài có câu viết thì không mất thẻ chiều viết"). Ba chỗ trong spec
  S9.1 cần sửa câu chữ sau khi S9.1 archive, ghi ở Dependencies (ba đề xuất, chờ người thật xác nhận)
- [x] **Lưu thẻ lỗi thì sao?** Hiện màn tổng kết báo "Chưa lưu được kết quả bài này" nếu bên nhận câu sai báo lỗi. → không báo lỗi, màn tổng
  kết và kết quả bài như bình thường, như S9.1 (lưu thẻ lỗi khi xong bài không báo); câu sai của lần đó không xử lý lại vì không lưu danh
  sách câu sai để thử lại (Requirement "Không lưu được thẻ thì màn tổng kết vẫn bình thường") (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA) Chủ đề đã qua bằng vượt cấp, người học mở bài kiểm tra cuối chủ đề từ bản đồ rồi làm sai: tạo thẻ hay chỉ đưa thẻ có sẵn về
  sớm?** Tiến độ đã lưu không phân biệt bài tự làm xong với bài xong nhờ vượt cấp (S9.1 đã ghi), nên xếp lần làm này vào dòng "vượt cấp" cần
  lưu dữ liệu mới; S9.4 chọn cách không cần dữ liệu mới. → giữ theo bảng, tạo thẻ còn thiếu. Lý do: người học tự mở lại bài kiểm tra của chủ
  đề đã qua, chỉ từ làm sai mới có thẻ (không dồn thẻ cả chủ đề như khi vượt cấp chưa đạt), và khớp S9.1 (bài xong nhờ vượt cấp, người học
  mở ra làm hết thì có thẻ). Thêm vào dòng bảng của Requirement "Bài kiểm tra nào đưa câu sai vào ôn tập" và Scenario "Kiểm tra cuối chủ đề
  của chủ đề đã qua bằng vượt cấp vẫn tạo thẻ" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA) Lưu thẻ chỉ thành công một phần: tất cả hoặc không gì, hay giữ phần đã lưu?** → giữ phần đã lưu, không hoàn lại, không báo lỗi;
  thẻ lưu lỗi không thử lại ở lần đó, lần làm bài kiểm tra sau sai lại câu về từ đó (hoặc xong bài học chứa từ, S9.1) tạo bù, không trùng. Lý
  do: mỗi thẻ đã lưu là thẻ hợp lệ, người học không mất gì; khớp S9.1 (thẻ thiếu tạo ở lần sau). Requirement "Lưu thẻ được một phần thì giữ
  phần đã lưu", 3 Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **Có báo cho người học "đã thêm N thẻ vào ôn tập" không?** → không ở S9.4: không có màn hay chữ mới, giữ màn tổng kết S3.4/S3.5 nguyên
  vẹn; ghi ở "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Có cần lưu dữ liệu mới hay đổi file sao lưu?** → không: thẻ tạo từ câu sai giống hệt thẻ S9.1, đưa về ôn sớm chỉ đổi thời điểm ôn tiếp
  theo đã có; không lưu nguồn gốc thẻ, không lưu danh sách câu sai
- [x] **Có tính vào giới hạn mỗi ngày (S9.3) không?** S9.3 chưa merge. → không tính lúc làm xong bài kiểm tra; khi thẻ được chấm trên màn ôn tập
  thì đếm theo cách đếm của S9.3 (thẻ "mới" là thẻ mới, thẻ đã chấm là lượt ôn). Ghi ở Dependencies, không viết Scenario phụ thuộc S9.3
- [x] **Capability mới hay sửa `review-cards`?** `review-cards` (S9.1) chưa archive nên chưa sửa được bằng delta. → capability mới
  `wrong-answer-review`, không phụ thuộc thứ tự archive; các chỗ cần đọc cùng spec S9.1 ghi ở Dependencies

- [x] **(QA, vòng 1) Lần làm bằng nút "Làm lại" trên màn tổng kết kiểm tra vượt cấp chưa đạt thuộc loại nào?** → vẫn là kiểm tra vượt cấp
  (chủ đề vẫn khóa, từ chưa học): chỉ đưa thẻ có sẵn về ôn sớm. Thêm dòng bảng "Bài kiểm tra nào đưa câu sai vào ôn tập", Scenario "Làm lại
  kiểm tra vượt cấp chưa đạt vẫn không tạo thẻ mới", sửa Dependencies S3.6 (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) Thẻ có sẵn của từ bị sai là thẻ đọc không được (S9.2 "Thẻ bị bỏ qua")?** → coi là đã có: giữ nguyên, không tạo đè (tránh
  mất dữ liệu), không báo lỗi; chiều và từ khác vẫn xử lý. Requirement "Thẻ có sẵn đọc không được thì giữ nguyên", Scenario tầng use case (ba
  đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) Câu viết chữ "人" và câu sai về "人" trong cùng lần làm bài kiểm tra (S9.1 chỉ tính lần viết khi bài "thành Đã xong")?** →
  lần viết xong ở câu viết của bài kiểm tra được tính trước khi xử lý câu sai cùng lần, dù đạt hay chưa đạt, nên tạo đủ ba chiều. Thêm đoạn vào
  Requirement "Thẻ chiều viết khi câu sai tạo thẻ chiều nghĩa", Scenario "Viết chữ ở câu viết của bài kiểm tra chưa đạt…", ghi câu chữ S9.1 cần
  sửa ở Dependencies (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1) Requirement lưu một phần đang chốt cách ghi (từng thẻ, không hoàn lại)** → viết lại theo hành vi: màn tổng kết như
  thường, không báo lỗi, thẻ đã lưu vẫn còn, thẻ thiếu tạo bù lần sau, không trùng. Cách ghi (từng thẻ hay gộp) để planner chọn, miễn khớp
  Scenario
- [x] **(dev-lead, vòng 1) Thẻ chiều nghĩa lưu lỗi thì có tạo thẻ chiều viết không?** → không (từ chưa "đã học xong" theo S9.1). Dòng bảng +
  Scenario "Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết" (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1) Từ đã có thẻ chiều nghĩa, thiếu thẻ chiều viết, mọi chữ đã viết, rồi sai câu trong bài kiểm tra: tạo bù chiều viết?**
  → không tạo bù ở S9.4, bù theo quy tắc S9.1; bài kiểm tra không phải "bài chứa từ" theo nghĩa S9.1. Dòng bảng + Scenario "Thẻ chiều viết còn
  thiếu từ trước không được câu sai tạo bù" (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1) Impact thiếu test cũ phải đổi** → thêm dòng về test S3.5-AC2 `lesson.service.test.ts:1148`; `isSaved` chỉ phản ánh
  việc ghi tiến độ
- [x] **(dev-lead, vòng 1) Scenario đưa thẻ về ôn sớm rồi mở màn ôn tập phụ thuộc giới hạn S9.3** → thêm điều kiện "hôm nay chưa ôn thẻ nào"
  vào hai Scenario
- [x] **(QA, vòng 2) Lần viết ở câu viết của bài kiểm tra chưa đạt được tính khi nào; "tính" là ghi lại hay chỉ dùng trong lần đó; (a) từ đã có
  thẻ chiều nghĩa, viết chữ, không sai câu về từ; (b) như (a) nhưng có câu sai?** → không theo gợi ý "chỉ tính khi câu sai cùng lần tạo thẻ
  chiều nghĩa" vì một quy tắc chung đơn giản hơn và khớp S9.1 (viết trên màn luyện viết được ghi dù từ chưa học): chữ viết xong ở câu viết
  của bài kiểm tra, dù đạt hay chưa, được ghi là chữ đã viết xong (giữ cho các lần sau), tính trước khi xử lý câu sai cùng lần; thẻ chiều viết
  tạo theo bảng S9.1. (a) và (b): có thẻ chiều viết, tạo ngay lúc viết xong vì từ đã học xong (S9.1); (b) thêm thẻ nghĩa và nghe về ôn sớm.
  Dòng "không tạo bù" chỉ áp dụng khi mọi chữ đã viết xong từ trước lần làm bài này và lần này không viết chữ nào của từ. Requirement "Câu
  viết trong bài kiểm tra tính trước khi xử lý câu sai" viết lại, Requirement mới "Thẻ chiều viết khi viết chữ trong bài kiểm tra" kèm bảng, thêm 3 Scenario (a), (b), và "chữ vẫn được ghi" khi không sai câu;
  sửa dòng bảng "không tạo bù", What Changes, Dependencies S9.1 (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 2) Dependencies S9.1 ghi "Hai chỗ" nhưng liệt kê ba** → sửa thành "Ba chỗ" ở Dependencies và Open Questions
- [x] **(QA, vòng 3) Viết xong chữ ở câu viết của bài kiểm tra rồi thoát giữa bài: chữ có được ghi là đã viết xong không?** → có, ghi ngay
  lúc viết xong, không chờ làm xong bài (như màn luyện viết; S9.1 chỉ loại "viết dở rồi thoát"). Hai việc tách nhau: "Chỉ xử lý khi làm xong
  bài kiểm tra" chỉ áp dụng cho câu sai. Thêm bảng vào Requirement đó, câu "ghi ngay lúc viết xong" vào Requirement "Câu viết trong bài kiểm
  tra tính trước khi xử lý câu sai", câu "kể cả thoát giữa bài" vào Requirement "Thẻ chiều viết khi viết chữ trong bài kiểm tra", Scenario
  "Viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì chữ vẫn được ghi" và "Đã có thẻ nghĩa, viết xong chữ ở bài kiểm tra rồi thoát giữa
  bài thì có thẻ chiều viết" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 3) Đã có thẻ nghĩa, chữ đã viết xong từ trước, thẻ chiều viết thiếu do lưu lỗi; lần này viết lại chữ ở câu viết của bài
  kiểm tra: có tạo thẻ chiều viết không?** → có, tạo ngay lúc viết xong: hệ quả của quy tắc khôi phục S9.1 ("viết xong một chữ của từ trên
  khung có gợi ý") cộng quy tắc câu viết của bài kiểm tra ghi như màn luyện viết. Khớp dòng "không tạo bù" (chỉ khi lần này không viết chữ
  nào của từ). Thêm Requirement "Viết lại chữ ở bài kiểm tra tạo bù thẻ chiều viết còn thiếu", Scenario "Thẻ chiều viết còn thiếu
  được tạo bù khi viết lại chữ ở bài kiểm tra"
- [x] **(dev-lead + QA, vòng 4) Bảng "Thẻ chiều viết khi viết chữ trong bài kiểm tra": dòng "có câu sai về từ → Tạo" theo chữ bao cả thoát
  giữa bài và kiểm tra vượt cấp, mâu thuẫn "Chỉ xử lý khi làm xong bài kiểm tra", "Kiểm tra vượt cấp không tạo thẻ mới" và định nghĩa "đã học
  xong" của S9.1** → sửa câu chữ, không đổi quy tắc: dòng 1 thành "câu sai lưu được thẻ chiều nghĩa (cuối chủ đề, làm xong)", dòng 2 thành
  "không câu sai nào lưu được thẻ đó (không sai, vượt cấp, thoát giữa bài) → chưa tạo (theo S9.1)"; câu mở đầu Requirement nói rõ thẻ chiều
  viết chỉ tạo khi từ đã học xong (S9.1). Rút gọn câu chữ để Requirement dưới 500 ký tự (validate strict). Thêm Scenario tầng use case "Kiểm tra vượt cấp, viết chữ và
  sai câu về từ chưa có thẻ thì không có thẻ chiều viết"

## Impact

- Code sửa: `srs.service` (thêm quy tắc và use case xử lý câu sai), `lesson.service` (nối cổng câu sai, truyền loại lần làm bài, lỗi cổng không
  còn làm màn tổng kết báo lỗi), hook màn học (truyền loại lần làm bài: cuối chủ đề hay vượt cấp, giữ loại vượt cấp qua nút "Làm lại").
- Test cũ phải đổi: S3.5-AC2 về lỗi cổng câu sai (`apps/web/src/app/shared/services/lesson.service.test.ts:1148` "should report isSaved false
  when the review sink fails"): lỗi cổng câu sai không còn làm `isSaved` false; `isSaved` chỉ còn phản ánh việc ghi tiến độ.
- Không có màn, component, chữ, style mới. Không đổi dữ liệu lưu trên máy, không đổi file sao lưu. Không thêm dependency.
- Tầng test: Vitest cho quy tắc (câu sai → từ, loại bài, đưa về ôn sớm, thẻ chiều viết) và use case với `ProgressStore` giả; Testing Library
  cho hook màn học (lỗi lưu thẻ không hiện thông báo lỗi); e2e Playwright trên bản build: làm bài kiểm tra cuối chủ đề sai một câu → mở màn
  ôn tập thấy thẻ của từ đó (khi code S9.2 đã có).
