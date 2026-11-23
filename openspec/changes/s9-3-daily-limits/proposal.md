# Proposal: S9.3 Giới hạn mỗi ngày

Story **S9.3 Giới hạn mỗi ngày · F4** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s93-giới-hạn-mỗi-ngày--f4)) ·
GitHub issue [#41](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/41). Bản 0.2, epic E9 Ôn tập SRS.

Refs #41

## Why

Là người học, tôi muốn giới hạn số thẻ mỗi ngày để không bị quá tải. S9.2 hỏi mọi thẻ đến hạn: học xong vài bài là có hàng chục thẻ "mới"
cùng lúc (mỗi từ hai đến ba thẻ), và sau vài ngày nghỉ số thẻ đến hạn dồn lại. S9.3 chặn số thẻ mới và số lượt ôn mỗi ngày, mặc định 20 và
200, chỉnh được trong Cài đặt.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc chọn thẻ trong giới hạn còn lại, cách đếm thẻ mới / lượt ôn, "hôm nay" theo giờ máy (Phần 2, pure); use case "lấy phiên ôn" đọc giới hạn + số đã chấm hôm nay, "chấm thẻ rồi lưu" ghi số đếm cùng lúc với thẻ (Phần 3) | `shared/services/srs.service.ts` (đã có từ S9.1/S9.2, sửa method) |
| Đọc/ghi số thẻ mới và lượt ôn đã chấm theo ngày; hai khóa cài đặt mới | `core/services/` (`ProgressStore`), `core/helpers/db.helper.ts` nếu plan cần |
| Schema Zod của hai khóa cài đặt, số đếm theo ngày, file sao lưu (phiên bản định dạng mới) | `packages/shared` (`@csk/shared`) |
| Giá trị mặc định 20 / 200 và các mức cho phép | `packages/shared` (`@csk/shared`), cạnh mặc định cài đặt hiện có, vì schema Zod cần các mức và `packages/shared` không import được `core/constants/`; `core/constants/` chỉ tham chiếu lại nếu cần |
| Hai nhóm "Thẻ mới mỗi ngày", "Lượt ôn mỗi ngày" trên màn Cài đặt | `pages/settings/components/`, `pages/settings/hooks/` |
| Thông báo "Đã đạt giới hạn ôn tập hôm nay…" trên màn ôn tập | `pages/review/components/`, `pages/review/hooks/` |
| Đưa giới hạn và số đếm theo ngày vào file sao lưu, nhập lại (đọc được file cũ) | `shared/services/backup.service.ts`, `core/services/` |
| Chữ hiển thị, style BEM | `assets/i18n/vi/settings.json`, `assets/i18n/vi/review.json`, `apps/web/src/styles/tailwind/` |

## What Changes

- **Giới hạn mỗi ngày** khi chốt phiên ôn (S9.2): tối đa (giới hạn thẻ mới − số thẻ mới đã chấm hôm nay) thẻ "mới" và tối đa (giới hạn lượt
  ôn − số lượt ôn hôm nay) thẻ đã chấm. Hai loại tính riêng. Thẻ được chọn là các thẻ đứng trước theo thứ tự hỏi của S9.2. Thẻ bị giữ lại
  không đổi gì, xét lại ở lần mở màn sau.
- **Cách đếm**: lần chấm đã lưu trên màn ôn tập của thẻ đang "mới" = 1 thẻ mới; của thẻ đã chấm trước đó (kể cả thẻ quay lại sau bước học
  ngắn trong cùng ngày) = 1 lượt ôn. Lưu lỗi không tính; viết không gợi ý (S6.3) không tính.
- **"Hôm nay"** theo đồng hồ máy, 0 giờ tới 23 giờ 59, như S8.1; mỗi lần chấm tính vào ngày nó được lưu.
- **Cài đặt** có thêm hai nhóm chọn một mức: "Thẻ mới mỗi ngày" (0 / 10 / 20 / 30 / 50 thẻ, mặc định 20) và "Lượt ôn mỗi ngày" (50 / 100 /
  200 / 500 lượt, mặc định 200). Lưu ngay, lỗi lưu và giá trị hỏng xử lý như các tùy chọn S8.2. Đổi giữa ngày không xóa số đã chấm hôm nay.
- **Màn ôn tập** báo "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." khi phiên rỗng vì giới
  hạn, và thêm câu đó sau "Đã ôn xong N thẻ." khi có thẻ bị giữ lại.
- **Sao lưu** (S8.5): file chứa hai giới hạn và số thẻ mới / lượt ôn đã chấm từng ngày, ghi phiên bản định dạng cao hơn file của S9.1; file
  cũ (trước S9.1, và từ S9.1 tới trước S9.3) vẫn nhập được (giới hạn về mặc định, số đã chấm là 0). Thiếu số đếm của một ngày thì coi 0;
  số đếm sai thì từ chối cả file.
- **Ghi cùng bản ghi ngày**: chấm thẻ không đổi số phút học, mục tiêu, streak; ghi phút học không xóa số đã chấm.

## Không làm (out of scope)

- Câu sai trong bài kiểm tra vào ôn tập → **S9.4**. Thống kê, dự báo lượt ôn, số thẻ đến hạn trên Trang chủ → **S9.5**.
- Nhập số tùy ý cho giới hạn (chỉ chọn trong các mức cố định), giới hạn riêng theo chiều thẻ, giới hạn theo thời gian ôn.
- Nút "Ôn thêm hôm nay" vượt giới hạn trên màn ôn tập; liên kết từ màn ôn tập sang Cài đặt (thông báo chỉ nói bằng chữ).
- Đổi thứ tự hỏi, quy tắc đến hạn, xếp lịch FSRS của S9.2; giới hạn với thẻ quay lại sau bước học ngắn được đếm như lượt ôn, không miễn.
- Lưu lịch sử từng lượt ôn (mức, lúc nào): S9.3 chỉ cần hai con số mỗi ngày.
- Giới hạn áp cho viết không gợi ý (S6.3) hay việc tạo thẻ (S9.1).

## Dependencies

- **S9.2** (spec PR #149 đã merge, code chưa có): S9.3 sửa các Requirement "Thẻ nào được hỏi trong phiên", "Màn ôn tập khi không có thẻ để
  hỏi", "Hết thẻ của phiên", "Focus khi màn đổi" của capability `review-session` (MODIFIED) và dùng lại "Thứ tự hỏi các thẻ", "Tự chấm 4
  mức", "Không lưu được mức chấm thì chấm lại được". Capability `review-session` chưa nằm trong `openspec/specs/` (S9.2 chưa archive): change
  S9.2 phải archive trước change này. Code S9.3 làm sau code S9.2.
- **S9.1** (spec PR #148 đã merge): trạng thái "mới" của thẻ, "Thẻ bị bỏ qua" (S9.2). S9.1 cũng sửa `progress-backup` (MODIFIED "File xuất
  chứa toàn bộ tiến độ") và tăng phiên bản định dạng file; S9.3 chỉ ADDED Requirement trong `progress-backup` để không đụng cùng
  Requirement đó, và tăng phiên bản định dạng thêm một lần.
- **Việc theo sau**: bảng trong "File xuất chứa toàn bộ tiến độ" (S9.1 MODIFIED) chưa liệt kê giới hạn ôn tập và số đã chấm từng ngày.
  S9.1 archive trước change này thì S9.3 thêm MODIFIED Requirement đó (bổ sung hai dòng) trước khi archive; nếu không thì mở PR spec cập
  nhật bảng sau khi S9.1 archive. Nội dung bắt buộc đã nằm ở ADDED "Sao lưu giữ giới hạn ôn tập và số đã chấm từng ngày".
- **S8.1 / S8.3**: định nghĩa ngày theo giờ máy (Requirement "Mỗi ngày đếm lại từ 0") dùng lại nguyên.
- **S8.2**: màn Cài đặt, thông báo "Không lưu được cài đặt. Hãy thử lại.", tùy chọn hỏng về mặc định riêng tùy chọn đó.
- **S8.5**: hợp đồng sao lưu mọi khóa cài đặt và dữ liệu từng ngày; file sai một phần bị từ chối cả file.
- **S6.3**: mức chấm từ viết không gợi ý không tính vào giới hạn.
- Không thêm dependency.

## Capabilities

### New Capabilities
(không có)

### Modified Capabilities
- `review-session`: áp giới hạn thẻ mới / lượt ôn mỗi ngày khi chốt phiên, cách đếm, thông báo khi chạm giới hạn (ADDED + MODIFIED 4
  Requirement của S9.2).
- `settings`: thêm hai nhóm "Thẻ mới mỗi ngày", "Lượt ôn mỗi ngày" (ADDED); MODIFIED "Có màn Cài đặt" (năm nhóm) và "Cài đặt đọc không được
  thì dùng mặc định" (thêm mặc định 20 / 200).
- `progress-backup`: file sao lưu chứa giới hạn và số đã chấm từng ngày, phiên bản định dạng mới, file cũ (trước S9.1 và bản S9.1) vẫn
  nhập được, thiếu số đếm coi 0, giá trị sai bị từ chối (ADDED).

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (chi tiết ở các dòng bên dưới):

1. Thẻ mới và lượt ôn là hai giới hạn riêng; lần chấm đầu của thẻ "mới" chỉ tính thẻ mới, không tính lượt ôn.
2. Mọi lần chấm thẻ đã chấm trước đó đều là 1 lượt ôn, kể cả thẻ quay lại sau bước học ngắn trong cùng ngày.
3. Chỉ đếm lần chấm đã lưu trên màn ôn tập; viết không gợi ý (S6.3) không tính.
4. Giới hạn áp lúc chốt phiên; khi nhiều hơn giới hạn thì lấy các thẻ đứng trước theo thứ tự hỏi của S9.2.
5. "Hôm nay" theo giờ máy như S8.1; phiên qua nửa đêm giữ nguyên danh sách, mỗi lần chấm tính vào ngày lưu.
6. Cài đặt chọn trong mức cố định: thẻ mới 0 / 10 / 20 / 30 / 50, lượt ôn 50 / 100 / 200 / 500.
7. Đổi giới hạn giữa ngày: không xóa số đã chấm, áp ở lần mở màn ôn tập kế tiếp; hạ dưới số đã chấm thì không lấy thêm, không báo lỗi.
8. Thông báo chạm giới hạn: "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." (phiên rỗng, và
   sau "Đã ôn xong N thẻ." khi có thẻ bị giữ lại).
9. File sao lưu cũ (trước S9.1 và bản S9.1) nhập được, giới hạn về 20 / 200, số đã chấm là 0.
10. File xuất từ S9.3 tăng phiên bản định dạng; app bản trước S9.3 gặp file này thì báo "File này được tạo từ phiên bản app mới hơn…".
11. Thẻ bị bỏ qua (S9.2) bị loại trước khi áp giới hạn, không chiếm chỗ, không làm hiện câu giới hạn.
12. Chấm thẻ không đổi phút học / mục tiêu / streak; ngày chỉ ôn tập không tính là ngày học.
13. File thiếu số đếm của một ngày thì coi 0 và nhận file; số đếm có nhưng sai thì từ chối cả file.

- [x] **Lưu số thẻ mới và số lượt ôn đã chấm mỗi ngày ở đâu?** → thêm hai số đếm "thẻ mới đã chấm" và "lượt ôn đã chấm" vào bản ghi
  từng ngày có sẵn của S8.1, không thêm bảng, không đổi khóa hay index; ghi cùng một lần lưu với thẻ (lưu lỗi thì không đổi cả hai); thiếu
  hoặc hỏng thì coi là 0; có trong file sao lưu, file cũ vẫn đọc được (người thật xác nhận 2026-11-23)
- [x] **Hai giới hạn có vào file sao lưu không, và file chứa giới hạn sai thì từ chối cả file?** → có, vào file sao lưu như mọi khóa cài
  đặt (S8.5); giá trị ngoài các mức cho phép thì từ chối cả file; file cũ thiếu khóa thì về 20 / 200 (người thật xác nhận 2026-11-23)
- [x] **Lượt ôn có tính thẻ mới không?** → không: hai giới hạn riêng, lần chấm đầu của thẻ "mới" là 1 thẻ mới, không phải lượt ôn; phiên
  tối đa 20 + 200 thẻ theo mặc định. Requirement "Giới hạn thẻ mới và lượt ôn mỗi ngày", "Cách đếm thẻ mới và lượt ôn trong ngày" (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Thẻ chấm lại sau bước học ngắn có tính lượt ôn không?** → có: mọi lần chấm thẻ đã chấm trước đó là 1 lượt ôn, quy tắc đơn giản, đếm
  được, và 200 đủ rộng cho bước học ngắn của 20 thẻ mới (ba đề xuất, chờ người thật xác nhận)
- [x] **Mức chấm từ viết không gợi ý (S6.3) có tính vào giới hạn không?** → không: giới hạn là của màn ôn tập; viết không gợi ý do người học
  chủ động mở (ba đề xuất, chờ người thật xác nhận)
- [x] **Khi đến hạn nhiều hơn giới hạn thì chọn thẻ nào?** → các thẻ đứng trước theo thứ tự hỏi của S9.2 (thẻ đã chấm: hạn sớm hơn trước;
  thẻ "mới": nghĩa → nghe → viết, rồi theo lộ trình); thẻ bị giữ lại không đổi trạng thái hay hạn (ba đề xuất, chờ người thật xác nhận)
- [x] **"Mỗi ngày" theo múi giờ / mốc nào?** → giờ máy, 0 giờ tới 23 giờ 59, giống S8.1 "Mỗi ngày đếm lại từ 0" và S8.3; mỗi lần chấm tính
  vào ngày nó được lưu; phiên mở trước nửa đêm giữ nguyên danh sách (S9.2 "Danh sách chốt lúc mở màn") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chỉnh giới hạn bằng cách nào, giá trị cho phép?** → chọn một mức trong danh sách cố định, cùng kiểu với "Mục tiêu mỗi ngày" của
  S8.2 (Tab, mũi tên, Space): "Thẻ mới mỗi ngày" 0 / 10 / 20 / 30 / 50 thẻ, "Lượt ôn mỗi ngày" 50 / 100 / 200 / 500 lượt. Có mức 0 thẻ
  mới để chỉ ôn thẻ cũ. Không có ô nhập số nên không cần quy tắc số sai (ba đề xuất, chờ người thật xác nhận)
- [x] **Đổi giới hạn giữa ngày thì sao?** → không xóa số đã chấm hôm nay; áp ở lần mở màn ôn tập kế tiếp; tăng thì được thêm phần chênh,
  hạ dưới số đã chấm thì không lấy thêm loại đó và không báo lỗi (ba đề xuất, chờ người thật xác nhận)
- [x] **Màn ôn tập báo gì khi chạm giới hạn mà vẫn còn thẻ đến hạn?** → "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể
  tăng giới hạn trong Cài đặt." khi phiên rỗng vì giới hạn (xét sau hai thông báo rỗng của S9.2), và thêm ngay sau "Đã ôn xong N thẻ." khi
  có thẻ bị giữ lại. Không hiện số thẻ bị giữ lại, không có liên kết sang Cài đặt (ba đề xuất, chờ người thật xác nhận)
- [x] **Trình đọc màn hình đọc câu giới hạn ở cuối phiên?** → câu đó nằm trong cùng thông báo hết thẻ nhận focus, được đọc sau "Đã ôn xong N
  thẻ." (theo bảng focus S9.2, MODIFIED "Focus khi màn đổi")
- [x] **Số đã chấm hôm nay hoặc giới hạn đọc không được?** → số đếm coi là 0, giới hạn về 20 / 200, không báo lỗi; theo mẫu S8.1 (dòng ngày
  hỏng coi là 0) và S8.2 (tùy chọn hỏng về mặc định riêng tùy chọn đó)
- [x] **Lưu lỗi có bị đếm không?** → không; lưu lỗi thì thẻ và số đếm đều không đổi (theo S9.2 "Không lưu được mức chấm thì chấm lại được")
- [x] **Không lưu được giới hạn trong Cài đặt?** → báo "Không lưu được cài đặt. Hãy thử lại." và giữ giá trị cũ, như S8.2 "Cài đặt được lưu
  an toàn"
- [x] **File sao lưu xuất trước S9.3?** → nhập được, giới hạn về 20 / 200, số đã chấm mọi ngày là 0; theo mẫu S9.1 "File sao lưu xuất trước
  khi có thẻ vẫn nhập được" (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1, major) Hai loại file cũ (trước S9.1 và bản S9.1), S9.3 có tăng phiên bản định dạng file không?** → cả hai loại
  đều nhập được, giới hạn về 20 / 200, số đã chấm là 0 ("File sao lưu chưa có giới hạn ôn tập vẫn nhập được", thêm Scenario file
  bản trước S9.1 và file bản S9.1 cho số đã chấm). Tăng phiên bản định dạng (Requirement mới "File sao lưu từ S9.3 có phiên bản định dạng
  mới"): app bản trước S9.3 gặp file S9.3 thì báo "File này được
  tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại." (S8.5) thay vì nhập mà âm thầm bỏ giới hạn và số đã chấm; cùng cách S9.1 đã
  chốt (ba đề xuất, chờ người thật xác nhận)
- [x] **(qa + dev-lead, vòng 1, major) Giới hạn và "Thẻ bị bỏ qua" của S9.2 xét theo thứ tự nào?** → thẻ bị bỏ qua bị loại trước khi áp
  giới hạn: không chiếm chỗ, không tính là thẻ bị giữ lại, không làm hiện câu giới hạn. Requirement mới "Thẻ bị bỏ qua không tính vào giới hạn"
  với Scenario "Thẻ bị bỏ qua không chiếm chỗ trong giới hạn" (22 + 2 → "Thẻ 1 / 20"), "Chỉ thẻ bị bỏ qua vượt giới hạn thì không hiện
  câu giới hạn" (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1, minor) Số đếm ôn tập và số phút học cùng nằm trong bản ghi ngày, ghi chồng nhau thì sao?** → Requirement mới
  "Số đã chấm và số phút học không ảnh hưởng nhau" (bảng): chấm thẻ không đổi phút học, mục tiêu của ngày, streak; ghi phút học không xóa số đã chấm; ngày chỉ có chấm
  thẻ như ngày không học phút nào. Thêm Scenario "Ôn tập không làm đổi số phút học và streak", "Học thêm phút không làm mất số đã chấm hôm
  nay", "Ngày chỉ ôn tập không tính là ngày học" (ba đề xuất, chờ người thật xác nhận)
- [x] **(dev-lead, vòng 1, minor) Mặc định 20 / 200 và các mức đặt ở đâu?** → `packages/shared` cạnh mặc định cài đặt hiện có (schema Zod
  cần các mức; `packages/shared` không import được `core/constants/`); sửa bảng Layer đích
- [x] **(dev-lead, vòng 1, minor) Bảng "File xuất chứa toàn bộ tiến độ" của S9.1 thiếu giới hạn và số đếm?** → ghi việc theo sau ở mục
  Dependencies: MODIFIED trong change này nếu S9.1 archive trước, không thì PR spec riêng sau khi S9.1 archive
- [x] **(qa, vòng 1, minor) File thiếu số đếm khác file có số đếm sai?** → thiếu thì coi 0 và nhận file; có nhưng âm, có phần lẻ, không phải
  số thì từ chối cả file. Bảng trong "File có giới hạn hoặc số đã chấm sai bị từ chối", thêm Scenario phần lẻ, không phải số, ngày thiếu số
  thẻ mới (ba đề xuất, chờ người thật xác nhận)
- [x] **(qa, vòng 1, minor) Một số Scenario chưa nói không có thẻ đã chấm đến hạn** → thêm "không có thẻ đã chấm nào đến hạn" vào WHEN của
  "Sang ngày mới được thêm thẻ mới", "Lưu lỗi thì không đếm", "Số đã chấm hôm nay bị hỏng thì coi là 0", "Cài đặt không đọc được thì dùng
  giới hạn mặc định", "Tăng giới hạn giữa ngày thì được thêm thẻ"
- [x] **(qa, vòng 1, minor) "Cài đặt không đọc được thì dùng giới hạn mặc định" không nói cách mở màn** → viết như S8.2: đang ở màn Lộ trình
  thì app không còn đọc được cài đặt, rồi mở màn ôn tập bằng liên kết hoặc tải lại đúng trang ôn tập (không đi qua trang bắt đầu)
- [x] **Scenario "Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay" (QA): "Ghi đè" thay toàn bộ thẻ máy B, vậy 10 thẻ "mới" phải ở
  đâu?** → viết lại Scenario: máy A còn ít nhất 10 thẻ "mới" và không có thẻ đã chấm nào đến hạn khi xuất, nên các thẻ đó nằm trong file;
  máy B mở màn ôn tập trước khi thẻ nào trong file tới hạn
- [x] **Hạ "Lượt ôn mỗi ngày" xuống dưới số lượt đã chấm hôm nay (QA)?** → giống thẻ mới: không lấy thêm thẻ đã chấm, không báo lỗi, màn
  hiện câu giới hạn khi phiên rỗng; Requirement "Đổi giới hạn giữa ngày" ghi rõ bảng áp cho cả hai loại, thêm Scenario "Hạ giới hạn lượt
  ôn dưới số lượt đã chấm hôm nay"
- [x] **Chọn "0 thẻ" thẻ mới khi chỉ có thẻ "mới" đến hạn thì màn báo gì (QA)?** → câu giới hạn "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn
  thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt.", không phải "Bạn chưa có thẻ…": người học có thẻ đến hạn, chỉ bị giới hạn chặn;
  theo đúng bảng "Màn ôn tập khi không có thẻ để hỏi" (thêm ghi chú vào dòng đó và Scenario "Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn")

## Impact

- Code sửa: `srs.service` (chốt phiên theo giới hạn, đếm khi chấm, + unit test), màn ôn tập (thông báo giới hạn), màn Cài đặt (hai nhóm),
  `ProgressStore`, schema cài đặt / dữ liệu ngày / file sao lưu (phiên bản định dạng mới), `backup.service`, i18n `settings.json`, `review.json`.
- Dữ liệu người dùng: hai khóa cài đặt mới; số thẻ mới và lượt ôn đã chấm theo ngày (hai số đếm trong bản ghi từng ngày của S8.1); file sao lưu có
  thêm các giá trị đó và tăng phiên bản định dạng; app bản trước S9.3 gặp file mới thì báo "bản mới hơn" như S8.5.
- Dependency: không thêm.
- Tầng test: Vitest cho quy tắc chốt phiên theo giới hạn, quy tắc đếm, ngày theo giờ máy (Phần 2) và use case với `ProgressStore` giả; Vitest
  cho schema và sao lưu / nhập lại; Testing Library cho màn Cài đặt (hai nhóm, lưu lỗi, mặc định) và màn ôn tập (thông báo giới hạn, focus);
  e2e Playwright: 25 thẻ mới → phiên 20 thẻ → chạm giới hạn → tăng giới hạn trong Cài đặt → được thêm thẻ.
