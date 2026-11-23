# Proposal: S9.1 Tạo thẻ ôn tập

Story **S9.1 Tạo thẻ ôn tập · F4** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s91-tạo-thẻ-ôn-tập--f4)) ·
GitHub issue [#39](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/39). Bản 0.2, epic E9 Ôn tập SRS.

Refs #39

## Why

Là người học, tôi muốn từ mới tự thành thẻ ôn tập để không phải tự tạo. Đây là bước đầu của E9: chưa có thẻ thì màn ôn tập (S9.2),
giới hạn mỗi ngày (S9.3), câu sai vào ôn tập (S9.4), thống kê (S9.5) và việc chấm thẻ chiều viết (S6.3) đều không có gì để làm.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc tạo thẻ: từ nào của bài được tạo thẻ, chiều nào, khi nào đủ điều kiện tạo thẻ chiều viết, không tạo trùng (Phần 2, pure); use case "xong bài thì tạo thẻ" và "viết xong chữ thì xét thẻ chiều viết" (Phần 3) | `shared/services/srs.service.ts` (mới) |
| Đọc/ghi thẻ ôn tập và ghi nhận chữ đã viết theo nét | `core/services/` (`ProgressStore`) + `core/helpers/db.helper.ts` (nơi lưu mới trong IndexedDB) |
| Schema Zod của thẻ và của bản ghi chữ đã viết (đọc từ IndexedDB phải validate) | `packages/shared` (`@csk/shared`) |
| Gọi use case khi bài vừa thành "Đã xong" | `pages/lesson/hooks/` (hook màn học hiện có) |
| Gọi use case khi viết xong chữ trên khung có gợi ý (màn luyện viết và câu viết trong bài) | `pages/writing-practice/hooks/`, `pages/lesson/hooks/` |
| Đưa thẻ và chữ đã viết vào file sao lưu, nhập lại (phiên bản định dạng file mới, vẫn đọc file cũ) | `shared/services/backup.service.ts`, `core/services/` (`ProgressStore`), schema file sao lưu trong `packages/shared` |

Không có màn hay component mới: S9.1 không có giao diện riêng, người học thấy thẻ ở màn ôn tập (S9.2) và thống kê (S9.5). Mục "Sao lưu
tiến độ" trong Cài đặt giữ nguyên giao diện, chỉ có thêm dữ liệu trong file.

## What Changes

- **Xong một bài học thường** (bài thành "Đã xong" theo S3.4) thì mọi từ xuất hiện trong các câu của bài có thẻ ôn tập **chiều nghĩa**
  (nhìn chữ đoán nghĩa) và **chiều nghe** (nghe chọn chữ). Từ đã có thẻ chiều đó thì giữ nguyên thẻ cũ, không tạo thêm, không đặt lại lịch ôn.
- **Thẻ chiều viết** (nhìn nghĩa viết chữ) của một từ chỉ được tạo khi cả hai điều kiện đúng: từ đã học xong **và** mỗi chữ Hán
  của từ đã được viết xong ít nhất một lần trên khung viết có gợi ý (màn luyện viết S6.2 hoặc câu viết trong bài). Điều kiện nào đúng sau thì
  lúc đó tạo thẻ. Viết dở (chưa đủ nét) không tính. "Từ đã học xong" cho thẻ chiều viết nghĩa là từ **đã có thẻ chiều nghĩa**, hoặc người
  học đang làm xong một bài học thường chứa từ. Ở S9.1 thẻ chiều nghĩa chỉ sinh ra khi làm xong bài học thường, nên bài chỉ được đánh dấu xong
  nhờ vượt cấp (chưa làm) không tính. Không lưu thêm nguồn gốc của thẻ.
- **Màn luyện viết (S6.2)**: giao diện và thông báo không đổi; lần viết xong chữ trên khung có gợi ý giờ được ghi nhận (sửa dòng "màn không ghi
  điểm hay tiến độ" của capability `stroke-guided-writing`).
- Thẻ mới tạo ở trạng thái "mới". Mỗi từ có tối đa một thẻ cho mỗi chiều.
- Bài đã được đánh dấu "Đã xong" nhờ kiểm tra vượt cấp: không tạo thẻ lúc đánh dấu; người học mở bài đó ra và làm hết (không bỏ qua câu
  nào) thì tạo thẻ cho các từ của đúng bài đó, như làm lại một bài đã xong.
- **Sao lưu (yêu cầu bổ sung theo quyết định người thật 2026-11-23, không thuộc văn bản AC):** file "Xuất tiến độ" (S8.5) chứa cả thẻ ôn
  tập (kèm trạng thái, ngày ôn tiếp theo) và chữ đã viết xong trên khung có gợi ý; nhập lại file thì có lại đúng thẻ và chữ đã viết. File
  xuất trước S9.1 vẫn nhập được; vì nhập là ghi đè toàn bộ nên sau khi nhập file đó máy không còn thẻ và chữ đã viết nào. File có hai thẻ
  cùng từ và chiều, hoặc một chữ đã viết lặp lại, bị từ chối là file hỏng; thẻ hoặc chữ của từ không có trong nội dung app vẫn nhận, không
  ảnh hưởng thẻ khác.
- **Không tạo bù**: bài đã "Đã xong" từ trước khi có tính năng thẻ (hoặc sau khi nhập file bản cũ) không tự có thẻ; người học làm lại bài thì có.

## Không làm (out of scope)

- Màn ôn tập, hỏi thẻ theo chiều, tự chấm 4 mức, tính ngày ôn tiếp theo → **S9.2**.
- Giới hạn thẻ mới / lượt ôn mỗi ngày → **S9.3**.
- Câu sai trong bài kiểm tra tạo thẻ hoặc đưa thẻ về ôn sớm → **S9.4**. S9.1 không tạo thẻ khi làm bài kiểm tra cuối chủ đề hay kiểm tra vượt cấp.
- Phân biệt thẻ tạo khi xong bài với thẻ tạo từ câu sai (S9.4), hay lưu nguồn gốc của thẻ trong dữ liệu và file sao lưu. Nếu S9.4 cần
  phân biệt thì S9.4 tự quyết cách đánh dấu (xem Dependencies).
- Thống kê thẻ theo trạng thái, dự báo lượt ôn → **S9.5**.
- Chấm thẻ chiều viết bằng kết quả viết không gợi ý → **S6.3** (S9.1 chỉ tạo thẻ). Viết không gợi ý không được tính là "đã viết theo nét".
- Tạo thẻ cho câu (sentence), tự tạo hoặc xóa thẻ bằng tay, chiều thẻ khác ba chiều trên.
- Tạo thẻ cho các bài được đánh dấu xong nhờ kiểm tra vượt cấp (S3.6) mà người học chưa làm.
- **Tạo bù thẻ cho tiến độ có từ trước S9.1** (bài đã xong, chữ đã viết ở S6.2 lúc app chưa ghi nhận) và cho bài "Đã xong" sau khi nhập file
  sao lưu bản cũ. Lý do: tiến độ bài đã lưu không phân biệt bài người học tự làm xong với bài được đánh dấu xong nhờ vượt cấp, nên tạo bù sẽ
  tạo thẻ cho từ người học chưa học. Hệ quả cho người học: các từ của những bài đó chưa có thẻ cho tới khi người học làm lại bài; chữ đã viết
  trước S9.1 phải viết lại một lần để có thẻ chiều viết.
- Đổi giao diện mục "Sao lưu tiến độ", hộp xác nhận nhập (không thêm số thẻ vào bản xem trước), hay gộp thẻ khi nhập (nhập vẫn ghi đè
  toàn bộ như S8.5). Sao lưu lịch sử các lượt ôn và giới hạn thẻ mỗi ngày trong Cài đặt thuộc S9.2/S9.3.

## Dependencies

- **S3.2 / S3.4** (đã có): bài học thường thành "Đã xong" khi làm hết các câu không bỏ qua câu nào; đó là thời điểm "học xong từ".
- **S6.2** (đã có): khung viết có gợi ý và thông báo viết xong chữ; hiện S6.2 không ghi gì, S9.1 thêm việc ghi nhận chữ đã viết xong.
- **S6.3** (chưa merge): dùng thẻ chiều viết mức từ do S9.1 tạo; S9.1 không đổi quyết định đơn vị thẻ của S6.3. Câu "chế độ có gợi ý
  (S6.2) vẫn không ghi gì" ở đầu `openspec/changes/s6-3-blind-writing/specs/blind-writing/spec.md` mâu thuẫn với delta `stroke-guided-writing`
  của S9.1 (lần viết xong có gợi ý được ghi nhận); câu đó phải sửa khi S6.3 cập nhật spec hoặc archive, sau khi S9.1 merge.
- **S7.1** (code đã merge, spec chờ archive): câu viết chữ trong bài. S7.1 cấm câu viết ghi mức chấm vào thẻ ôn tập; S9.1 chỉ tạo thẻ, không
  chấm, nên không mâu thuẫn.
- **S9.4** (sau): ở S9.1 "từ đã học xong" cho thẻ chiều viết = từ đã có thẻ chiều nghĩa (hoặc đang làm xong bài học thường chứa từ). Nếu
  S9.4 tạo thẻ chiều nghĩa từ câu sai, S9.4 phải giữ định nghĩa này: hoặc chấp nhận thẻ đó cũng làm từ thành "đã học xong", hoặc tự quyết
  cách đánh dấu thẻ của mình (kể cả trong file sao lưu) và sửa Requirement "Từ đã học xong cho thẻ chiều viết". Đồng thời S9.4 không được để
  từ có thẻ chiều nghĩa từ câu sai rồi xong bài mà mất thẻ chiều viết.
- **S9.2** (sau): thẻ của từ không có trong nội dung app (đến từ file sao lưu) vẫn nằm trong máy; màn ôn tập tự quyết có hỏi các thẻ đó hay không.
- **S8.5** (đã có): hợp đồng sao lưu ở docs/03-architecture.md yêu cầu bảng dữ liệu người dùng mới phải vào file sao lưu. S9.1 sửa
  capability `progress-backup`: thêm thẻ ôn tập và chữ đã viết vào file, tăng phiên bản định dạng file, vẫn nhập được file bản cũ.
- **Dependency mới `ts-fsrs`** (người thật đã duyệt 2026-11-23): thêm vào `apps/web`, chỉ dùng trong `srs.service`.

## Capabilities

### New Capabilities
- `review-cards`: tự tạo thẻ ôn tập chiều nghĩa và nghe khi học xong từ, thẻ chiều viết khi từ đã được viết theo nét.

### Modified Capabilities
- `progress-backup`: file sao lưu chứa thêm thẻ ôn tập và chữ đã viết; nhập lại có lại đúng hai loại dữ liệu này; file bản cũ vẫn nhập được;
  file có thẻ hoặc chữ đã viết trùng bị từ chối.
- `stroke-guided-writing`: lần viết xong chữ trên khung có gợi ý được ghi nhận cho thẻ chiều viết (sửa một dòng của Scenario "Viết đúng hết
  các nét thì hoàn thành chữ"); giao diện và thông báo người học thấy không đổi.
  Hành vi màn học (S3.2/S3.4) người học nhìn thấy không đổi.

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (chi tiết ở các dòng bên dưới):

1. Nhập file sao lưu bản cũ: nhận như file hợp lệ, ghi đè nên máy không còn thẻ và chữ đã viết.
2. e2e S9.1: thao tác thật, test đọc danh sách thẻ đã lưu từ phía test, không thêm màn hay nút debug.
3. Bài được đánh dấu xong nhờ vượt cấp, người học làm hết: tạo thẻ cho từ của đúng bài đó.
4. "Học xong từ" = bài học thường chứa từ thành "Đã xong" (kể cả làm lại); bài kiểm tra không tạo thẻ.
5. Từ của bài = mọi từ trong câu, kể cả cả hai từ của câu cặp âm; câu nói theo câu không tạo thẻ.
6. Thẻ đã có: giữ nguyên, không tạo trùng, không đặt lại lịch ôn.
7. "Viết theo nét" = viết xong hết nét trên khung có gợi ý; từ nhiều chữ cần mọi chữ, có thể khác lần.
8. Viết trước khi học xong: vẫn ghi nhận; thẻ chiều viết tạo khi điều kiện sau cùng đúng.
9. Chữ không có dữ liệu nét: không có thẻ chiều viết, vẫn có thẻ nghĩa và nghe.
10. Lưu thẻ lỗi: bài vẫn xong, không báo lỗi, thẻ thiếu tạo ở lần xong bài hoặc viết xong kế tiếp.
11. "Từ đã học xong" cho thẻ chiều viết = từ đã có thẻ chiều nghĩa, hoặc đang làm xong bài học thường chứa từ; không lưu nguồn gốc thẻ (vòng 2).
12. Không tạo bù thẻ cho tiến độ có từ trước S9.1 hoặc sau khi nhập file bản cũ.
13. File sao lưu có thẻ/chữ đã viết trùng thì từ chối cả file; của từ/chữ không có trong app (hoặc không có dữ liệu nét) thì nhận.
14. Không có giao diện mới ở S9.1.

- [x] **Thêm dependency `ts-fsrs`?** S9.1 cần thẻ mới mang trạng thái lịch ôn ban đầu đúng chuẩn FSRS để S9.2 dùng; docs/03-architecture.md đã chọn `ts-fsrs` nhưng `package.json` chưa có. → thêm dependency `ts-fsrs` vào `apps/web` ngay ở S9.1, chỉ dùng trong `srs.service` (người thật xác nhận 2026-11-23)
- [x] **Lưu dữ liệu mới trong trình duyệt**: nơi lưu thẻ ôn tập (mỗi từ một thẻ cho mỗi chiều, đã có trong kiến trúc) và nơi lưu "chữ đã viết xong trên khung có gợi ý" (chưa có trong kiến trúc) đều đổi cấu trúc dữ liệu lưu trên máy; khó đảo ngược. → đồng ý một lần nâng cấu trúc dữ liệu gồm cả hai (người thật xác nhận 2026-11-23)
- [x] **Sao lưu thẻ và chữ đã viết ở S9.1 hay story riêng?** Hợp đồng sao lưu bắt buộc bảng mới vào file sao lưu (đổi hình dạng file, tăng phiên bản định dạng). → làm luôn trong S9.1: file sao lưu (S8.5) phải chứa thẻ và chữ đã viết; xuất rồi nhập không mất thẻ. Viết thành Requirement sửa capability `progress-backup` (MODIFIED "File xuất chứa toàn bộ tiến độ" + ADDED), Scenario ghi rõ là yêu cầu bổ sung (người thật xác nhận 2026-11-23)
- [x] **File sao lưu xuất trước S9.1 (không có thẻ) nhập vào bản mới thì sao?** → vẫn nhập được như file hợp lệ; nhập là ghi đè toàn bộ nên sau khi nhập máy không còn thẻ và chữ đã viết nào; hộp xác nhận không đổi (Scenario "Nhập file sao lưu bản cũ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Có e2e cho S9.1 không, khi chưa có màn hiện thẻ?** (QA: Impact ghi "chưa e2e" nhưng test-cases.md đề xuất e2e) → có e2e Playwright trên bản build: người học thao tác thật (xong bài, viết chữ, xuất/nhập file), test đọc danh sách thẻ đã lưu trong trình duyệt từ phía test; riêng phần sao lưu kiểm thêm bằng nội dung file đã xuất. Cách đọc dữ liệu từ phía test do `planner` ghi trong design.md, không thêm màn hay nút debug vào app (ba đề xuất, chờ người thật xác nhận)
- [x] **Bài được đánh dấu xong nhờ kiểm tra vượt cấp, người học mở ra làm hết thì có tạo thẻ không?** (QA) → có, cho các từ của đúng bài vừa làm, như làm lại một bài đã xong; các bài khác của chủ đề vẫn không có thẻ (dòng mới trong bảng "Khi nào xét tạo thẻ", Scenario "Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Học xong một từ" là lúc nào?** → khi bài học thường chứa từ đó thành "Đã xong" (S3.4); làm lại bài đã xong cũng xét lại (chỉ tạo thẻ còn thiếu). Bài kiểm tra và bài được mở nhờ kiểm tra vượt cấp không tạo thẻ (Scenario "Xong bài học thì tạo thẻ nghĩa và nghe", "Bài kiểm tra không tạo thẻ", "Bài chưa xong không tạo thẻ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nào của bài là "từ đã học"?** → mọi từ xuất hiện trong câu của bài, kể cả từ còn lại trong câu cặp âm; câu nói theo câu (sentence) không tạo thẻ (bảng trong Requirement AC1) (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ đã có thì sao?** → giữ nguyên thẻ cũ, không tạo trùng, không đặt lại lịch ôn (Scenario "Làm lại bài đã xong không tạo trùng thẻ", "Từ đã có thẻ từ bài khác") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Viết theo nét ít nhất 1 lần" là gì?** → viết xong hết các nét của chữ trên khung có gợi ý (màn luyện viết hoặc câu viết trong bài); viết dở hoặc viết không gợi ý (S6.3) không tính; từ nhiều chữ cần mỗi chữ đã viết xong, có thể ở các lần khác nhau (Scenario "Viết dở không tính", "Từ nhiều chữ cần viết xong mọi chữ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Viết trước khi học xong từ?** → lần viết vẫn được ghi nhận; thẻ chiều viết tạo khi từ được học xong. Học xong trước rồi viết sau thì tạo lúc viết xong chữ cuối (bảng trong Requirement AC2) (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ không có dữ liệu nét** → không viết được nên từ chứa chữ đó không có thẻ chiều viết; vẫn có thẻ nghĩa và nghe (Scenario "Từ có chữ không có dữ liệu nét") (ba đề xuất, chờ người thật xác nhận)
- [x] **Không lưu được thẻ thì sao?** → bài vẫn "Đã xong", màn tổng kết vẫn hiện, không báo lỗi; thẻ còn thiếu được tạo ở lần xong bài kế tiếp (Scenario "Không lưu được thẻ thì bài vẫn xong") (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) "Từ đã học xong" cho AC2 là gì?** AC1 nói "bài Đã xong" còn Scenario AC2 dùng "đã có thẻ nghĩa và nghe". → một định nghĩa (đã đơn giản hóa ở vòng 2, xem dòng bên dưới): từ đã có thẻ chiều nghĩa, hoặc đang làm xong bài học thường chứa từ; bài chỉ được đánh dấu xong nhờ vượt cấp, bài xong nhưng lưu thẻ lỗi và tiến độ trước S9.1 không tính vì chưa có thẻ chiều nghĩa. Bảng trong Requirement "Từ đã học xong cho thẻ chiều viết", điều kiện đầu các Scenario AC2 viết lại thành "đã làm xong bài học có từ … (nên đã có thẻ … chiều nghĩa và chiều nghe)", thêm Scenario "Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) Tiến độ có từ trước S9.1 và nhập file sao lưu bản cũ có bài "Đã xong": tạo bù thẻ không?** → không tạo bù; làm lại bài thì có thẻ, chữ viết trước S9.1 phải viết lại. Lý do: tiến độ bài không phân biệt bài tự làm với bài được đánh dấu nhờ vượt cấp. Ghi vào "Không làm" kèm hệ quả, Requirement mới "Không tạo bù thẻ cho bài đã xong từ trước", dòng mới trong bảng "Lần viết nào được tính", Scenario "Bài đã xong từ trước không được tạo bù thẻ" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) File sao lưu có thẻ trùng từ và chiều, hoặc thẻ/chữ đã viết của từ không có trong app?** → trùng (thẻ hoặc chữ đã viết) thì từ chối cả file là file hỏng, như S8.5 từ chối bài trùng; từ hoặc chữ không có trong app thì nhận, giữ như trong file, không ảnh hưởng thẻ khác, như S8.5 nhận bài không có trong app (Requirement "File có thẻ hoặc chữ đã viết trùng bị từ chối" và "Thẻ và chữ đã viết của từ không có trong app vẫn nhập được", 4 Scenario) (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) Bảng "Lần viết nào được tính" có thao tác "viết lại" khi viết dở, mà nút "Viết lại" chỉ hiện sau khi viết xong** → sửa thành "Viết dở (chưa đủ nét) rồi thoát màn luyện viết hoặc thoát bài"
- [x] **(dev-lead, vòng 1) Proposal nói S6.2 không đổi nhưng spec S6.2 ghi "màn không ghi điểm hay tiến độ"** → thêm delta `stroke-guided-writing` (MODIFIED), chép nguyên Requirement "Viết bằng ngón tay hoặc chuột trên khung viết", chỉ sửa dòng AND thành "màn không ghi điểm; lần viết xong được ghi nhận cho việc tạo thẻ ôn tập chiều viết (S9.1)"; chuyển vào Modified Capabilities
- [x] **(QA, vòng 1) Scenario "Viết không gợi ý không tính" có điều kiện không dựng được trên app thật** (S6.3 chỉ mở chế độ không gợi ý sau khi đã viết xong có gợi ý) → ghi rõ trong Scenario là kiểm ở tầng quy tắc
- [x] **(QA, vòng 1) Không lưu được thẻ chiều viết thì khi nào tạo lại?** → ở lần kế tiếp người học viết xong một chữ của từ trên khung có gợi ý hoặc làm xong bài chứa từ, nếu lúc đó đủ hai điều kiện; lần viết lưu lỗi không được tính. Thêm 2 Scenario khôi phục (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA, vòng 1) Tên nội bộ trong proposal** → bỏ tên bảng, khóa, tên hàm khỏi proposal; chỉ giữ đường dẫn layer theo CLAUDE.md §1, tên kỹ thuật để design.md
- [x] **(dev-lead, vòng 1) Thiếu dependency S7.1** → thêm vào Dependencies: S7.1 cấm câu viết ghi mức chấm vào thẻ; S9.1 chỉ tạo thẻ, không chấm
- [x] **(dev-lead, vòng 1) Thiếu Scenario đường đi chính có câu viết trong bài** → thêm "Làm hết bài có câu viết chữ thì có đủ ba chiều" trong Requirement mới "Câu viết trong bài tính ngay trong lượt làm bài" (thẻ chiều viết tạo lúc bài thành "Đã xong" trong cùng lượt)
- [x] **(QA + dev-lead, vòng 2, major) Bảng "Từ đã học xong" phân biệt thẻ nghĩa tạo khi xong bài với thẻ từ câu sai (S9.4)** → phải lưu thêm nguồn gốc thẻ (schema khó đảo ngược), sao lưu mất nguồn gốc, và lỗ hổng: thẻ nghĩa do S9.4 tạo trước rồi xong bài thì không bao giờ có thẻ chiều viết. Theo đề xuất của hai reviewer: "từ đã học xong" = từ đã có thẻ chiều nghĩa (bất kể nguồn) hoặc đang làm xong bài học thường chứa từ; bỏ dòng S9.4 khỏi bảng, giữ dòng "bài được đánh dấu xong nhờ vượt cấp, chưa làm → không"; ràng buộc cho S9.4 ghi ở Dependencies, việc phân biệt nguồn gốc ghi ở "Không làm". Không thêm dữ liệu lưu trữ (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA + dev-lead, vòng 2, minor) Spec S6.3 ghi "chế độ có gợi ý (S6.2) vẫn không ghi gì", mâu thuẫn với delta `stroke-guided-writing`** → ghi ở Dependencies mục S6.3: câu đó cần sửa khi S6.3 cập nhật spec hoặc archive; S9.1 không sửa change của S6.3
- [x] **(QA + dev-lead, vòng 2, minor) "Chữ đã viết không có dữ liệu nét" trong file sao lưu chưa có Scenario** → thêm Scenario "Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ" trong `progress-backup`
- [x] **(QA + dev-lead, vòng 2, minor) Khó thấy các quyết định chờ người thật** → gom thành danh sách đánh số ở đầu mục này
- [x] **Người học có thấy gì ở S9.1 không?** → không có giao diện mới; thẻ được kiểm bằng test của danh sách thẻ, người học thấy ở S9.2/S9.5 (ba đề xuất, chờ người thật xác nhận)

## Impact

- Code mới: `srs.service` (+ test), schema Zod thẻ và chữ đã viết, nơi lưu mới trong IndexedDB qua `ProgressStore`.
- Code sửa: hook màn học (gọi tạo thẻ khi bài thành "Đã xong"), hook luyện viết và câu viết trong bài (ghi nhận chữ viết xong);
  sao lưu (`backup.service`, `ProgressStore`, schema file sao lưu bản mới, vẫn đọc bản cũ).
- Dữ liệu người dùng: một lần nâng cấu trúc dữ liệu lưu trên máy (thẻ ôn tập + chữ đã viết xong), đã được người thật duyệt. File sao lưu: tăng phiên bản định
  dạng; app cũ gặp file mới thì báo "bản mới hơn" như S8.5 đã có.
- Dependency: `ts-fsrs` trong `apps/web` (đã duyệt).
- Tầng test: Vitest cho quy tắc tạo thẻ (Phần 2), use case với `ProgressStore` giả, schema file sao lưu bản mới và bản cũ; Testing Library cho
  hook màn học / luyện viết. **e2e** Playwright trên bản build cho các Scenario của S9.1: thao tác thật của người học, test đọc danh sách thẻ
  đã lưu từ phía test (không có màn hiện thẻ tới S9.2); Scenario sao lưu xuất file, nhập ở trình duyệt sạch rồi đọc lại danh sách thẻ.
