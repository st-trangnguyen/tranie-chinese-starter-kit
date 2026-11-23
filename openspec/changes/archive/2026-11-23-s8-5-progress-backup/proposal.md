# Proposal: S8.5 Export / Import tiến độ

Story **S8.5 Export / Import tiến độ · F8** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s85-export--import-tiến-độ--f8)) ·
GitHub issue [#58](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/58). Bản 0.2, epic E8.

Refs #58

## Why

Là người học, tôi muốn chuyển tiến độ giữa điện thoại và máy tính để học trên cả hai. App lưu tiến độ trên từng máy, không có
tài khoản hay máy chủ; cách duy nhất để mang tiến độ sang máy khác là xuất ra một file rồi nhập ở máy kia (luồng F8 "Sao lưu",
[business-flows.md](../../../docs/02-design/business-flows.md#f8-offline--dữ-liệu-01-phần-tải-và-exportimport-từ-02)).

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Định dạng file sao lưu và kiểm tra file khi nhập (validate runtime, CLAUDE.md §0 mục 4) | `packages/shared` (`@csk/shared`, schema tiến độ) |
| Đọc toàn bộ / ghi đè toàn bộ dữ liệu tiến độ trong một lần ghi | `core/services/` (adapter lưu trữ tiến độ) |
| Quy tắc sao lưu: dựng nội dung file, kiểm tra file, tóm tắt cho hộp xác nhận, luồng xuất/nhập | `shared/services/` (service sao lưu, ô "backup" trong §1) |
| State luồng xuất/nhập (đang chạy, lỗi, chờ xác nhận, xong) | `pages/<feature cài đặt>/hooks/` |
| Mục "Sao lưu tiến độ" và hộp xác nhận | `pages/<feature cài đặt>/components/` (hộp xác nhận dùng chung nếu đã có ở `shared/components/`) |
| Lưu file xuống máy (tải file) | `core/` (thao tác trình duyệt có tác dụng phụ, không có business rule) |
| Nhãn, thông báo | `assets/i18n/vi/` |
| Kiểm tra xuất rồi nhập trên máy khác (luồng người dùng) | Playwright `apps/web/e2e/E8/` |

## What Changes

- Màn Cài đặt có mục "Sao lưu tiến độ" với hai nút "Xuất tiến độ" và "Nhập tiến độ".
- **Xuất**: bấm là lưu xuống máy một file JSON tên `tranie-tien-do-<năm>-<tháng>-<ngày>.json` chứa **toàn bộ tiến độ** theo cách
  người học hiểu: bài nào đã xong / đang dở (và đang dở ở câu nào), số phút học từng ngày (S8.1), mục tiêu của từng ngày (S8.3),
  mọi lựa chọn trong Cài đặt của S8.2 (mục tiêu phút mỗi ngày, tốc độ audio mặc định, hiện pinyin), đã qua màn chào mừng. Chuỗi ngày học (streak) được tính ra từ phút học và mục tiêu theo ngày
  nên có lại đúng sau khi nhập. Không gồm bản ghi âm (app không lưu) và audio đã tải (S8.4, tải lại được). Báo "Đã xuất tiến độ."
  khi app đã đưa file cho trình duyệt lưu.
- **Nhập**: chọn file, app kiểm tra file **trước** khi đụng vào dữ liệu. File lỗi (không phải JSON, không phải file tiến độ của app,
  lớn hơn 20 MB, từ bản app mới hơn, dữ liệu bên trong sai) thì báo lỗi và giữ nguyên tiến độ trên máy. File hợp lệ thì hiện hộp xác nhận (ngày
  xuất file, số bài đã xong trong file tính trên các bài có trong app, cảnh báo không hoàn tác được); "Ghi đè" thì thay toàn bộ tiến độ trên máy bằng file (không gộp),
  "Hủy" thì không đổi gì.
- Ghi đè là tất cả hoặc không gì: ghi lỗi giữa chừng thì tiến độ cũ còn nguyên.
- Xuất và nhập chạy được khi không có mạng.

## Không làm (out of scope)

- Đồng bộ tự động giữa các máy, tài khoản, lưu lên máy chủ hay dịch vụ đám mây.
- Gộp tiến độ hai máy (luồng F8 chốt: nhập là ghi đè).
- Chọn một phần để xuất/nhập (chỉ tiến độ bài, chỉ cài đặt…).
- Mã hóa hoặc đặt mật khẩu cho file.
- Sao lưu tự động theo lịch, nhắc sao lưu.
- Xuất/nhập audio đã tải (S8.4) và bản ghi âm.
- Chuyển tiến độ của bài không còn trong nội dung sang bài mới (file nhắc tới bài app không có thì vẫn nhận, bài đó không hiện ở đâu).
- Xây màn Cài đặt: thuộc S8.2. S8.5 chỉ thêm một mục vào màn đó.
- Cập nhật tab/cửa sổ khác đang mở app lúc ghi đè. Chỉ tab vừa nhập hiện ngay tiến độ mới; tab khác vẫn hiện tiến độ cũ đến khi
  tải lại, và nếu người học tiếp tục học ở tab đó thì tab đó có thể ghi lại tiến độ cũ (ví dụ vị trí câu đang dở) lên dữ liệu
  vừa nhập. Người học nên đóng các tab khác trước khi nhập.
- Biết người học đã thật sự lưu file hay đã hủy hộp lưu / bảng chia sẻ của trình duyệt (trình duyệt không báo lại cho app).

## Dependencies

- **S8.2 Cài đặt** (chặn): màn Cài đặt phải có trước khi code S8.5. Nếu S8.2 chưa code xong khi tới S8.5 thì phải chốt lại chỗ đặt
  hai nút (xem Open Questions). Mọi lựa chọn của S8.2 (mục tiêu phút, tốc độ audio mặc định, hiện pinyin) đã nằm trong spec này,
  không thuộc hợp đồng "dữ liệu tiến độ thêm sau S8.5" bên dưới.
- **S8.1 Trang chủ** (chặn; bản 0.1, PR spec #129): thêm số phút học từng ngày. PR spec S8.5 merge sau PR spec S8.1; PR code S8.5
  cắt sau khi PR code S8.1 merge. Spec này coi số phút học từng ngày là đã có.
- **S8.3 Streak** (chặn; cùng bản 0.2, PR spec #130): thêm mục tiêu của từng ngày (nâng dữ liệu riêng) và dòng "Chuỗi ngày học"
  trên Trang chủ. Thứ tự chốt: S8.3 trước S8.5 (theo thứ tự story trong E8). PR spec S8.5 merge sau PR spec S8.3; PR code S8.5 cắt
  sau khi PR code S8.3 merge. Spec này coi mục tiêu theo ngày và dòng streak là đã có.
- **Dữ liệu tiến độ thêm sau S8.5** (hợp đồng cho story khác, không kiểm ở change này): E9 Ôn tập SRS (thẻ ôn tập, lịch sử ôn) và
  mọi story khác (ngoài S8.1, S8.2, S8.3) thêm dữ liệu tiến độ chưa có trong spec này. PR spec của story đó MUST tự thêm Requirement/Scenario sao lưu cho
  dữ liệu mới (xuất ra file, nhập lại đúng, file cũ chưa có phần đó vẫn nhập được). Nếu story đó đã code xong trước khi code S8.5
  (lộ trình 0.2 xếp E9 trước phần 0.2 của E8) thì phải mở PR spec bổ sung cho S8.5 trước khi code S8.5.
- Không thêm dependency mới.

## Capabilities

### New Capabilities
- `progress-backup`: xuất toàn bộ tiến độ ra file JSON, nhập file (kiểm tra trước, báo lỗi giữ nguyên dữ liệu cũ, hỏi xác nhận rồi
  ghi đè toàn bộ), chạy offline.

### Modified Capabilities
Không có.

## Impact

- `apps/web`: thêm mục vào màn Cài đặt, service sao lưu, mở rộng adapter lưu trữ tiến độ (đọc/ghi đè toàn bộ), i18n.
- `packages/shared`: schema file sao lưu.
- `apps/web/e2e/E8/`: test xuất/nhập.
- Định dạng file sao lưu từ đây là dữ liệu người dùng giữ ngoài app: mọi thay đổi sau này phải đọc được file cũ.

## Open Questions

- [x] **Đặt hai nút ở màn nào** → màn Cài đặt (S8.2), mục "Sao lưu tiến độ"; không thêm màn mới (ba đề xuất, chờ người thật xác nhận)
- [x] **"Toàn bộ tiến độ" gồm gì** → tiến độ từng bài (đã xong, đang dở, câu đang dở), số phút học từng ngày (S8.1), mục tiêu của
  từng ngày (S8.3), mọi lựa chọn trong Cài đặt (kể cả mục tiêu phút, đã qua màn chào mừng). Streak không lưu riêng, tính lại từ dữ
  liệu trên. Không gồm bản ghi âm và audio đã tải. Cài đặt được tính vào để sang máy mới không phải chỉnh lại (ba đề xuất, chờ
  người thật xác nhận)
- [x] **Tên file** → `tranie-tien-do-<năm>-<tháng>-<ngày>.json` theo ngày trên máy lúc xuất (ba đề xuất, chờ người thật xác nhận)
- [x] **Xuất khi chưa có tiến độ** → vẫn cho xuất; file nhập vào máy khác thì máy đó về như chưa học (ba đề xuất, chờ người thật xác nhận)
- [x] **Ghi đè có xóa tiến độ máy đích mà file không có không** → có: sau khi nhập, tiến độ trên máy đúng bằng file, không gộp (luồng F8)
- [x] **Hộp xác nhận hiện gì** → ngày xuất file, số bài đã xong trong file, câu cảnh báo tiến độ hiện tại trên máy sẽ bị thay và không
  hoàn tác được; nút "Ghi đè" và "Hủy"; Esc = Hủy, focus mặc định ở "Hủy" để tránh ghi đè nhầm (ba đề xuất, chờ người thật xác nhận)
- [x] **File lỗi gồm những trường hợp nào và báo gì** → bảng trong Requirement "Nhập kiểm tra file trước khi ghi"; một phần dữ liệu sai
  thì từ chối cả file, không nhận một phần (ba đề xuất, chờ người thật xác nhận)
- [x] **File nhắc tới bài không có trong app** → vẫn hợp lệ; tiến độ của bài đó không hiện ở đâu và không ảnh hưởng mở khóa (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Ghi đè lỗi giữa chừng** → tất cả hoặc không gì; báo lỗi, tiến độ cũ còn nguyên (ba đề xuất, chờ người thật xác nhận)
- [x] **Sau khi nhập xong** → báo "Đã nhập tiến độ." và mọi màn (Trang chủ, Lộ trình, Cài đặt) hiện tiến độ mới, không cần tải lại app
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Thông báo cho trình đọc màn hình** → thông báo thành công/lỗi được đọc tự động; hai nút và hộp xác nhận dùng được bằng bàn phím
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Cam kết tương thích của file sao lưu** (định dạng dữ liệu người dùng giữ ngoài app, khó đảo ngược) → người thật đồng ý
  (2026-11-17): file có số phiên bản định dạng; app luôn nhập được file của mọi bản app cũ hơn, phần thiếu lấy mặc định; file từ bản
  app mới hơn thì từ chối, báo "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại." và giữ nguyên dữ liệu cũ.
  Spec đã có Scenario "S8.5-AC2 File từ phiên bản app mới hơn bị từ chối"; không thêm Scenario cho file bản cũ vì S8.5 là định dạng
  đầu tiên (story thêm dữ liệu sau kiểm theo hợp đồng ở Dependencies)
- [x] Vòng 1, dev-lead #1 / qa #8: Scenario "khi bản app đã có số phút đã học" test được hay không tùy thứ tự merge → S8.1 thành
  dependency chặn (PR code S8.1 merge trước PR code S8.5), bỏ chữ "khi bản app có/đã có" ở bảng và hai Scenario, bỏ phương án "S8.1
  code sau" (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 1, dev-lead #2: bảng ghi "streak" nhưng streak tính ra, không lưu; thiếu mục tiêu theo ngày; câu "loại thêm sau này MUST
  cũng có" không test được → chốt S8.3 trước S8.5 (dependency chặn); bảng thay "streak" bằng "mục tiêu của từng ngày"; thêm Scenario
  khứ hồi "Chuỗi ngày học" dựa trên mục tiêu theo ngày; hợp đồng cho E9 và story sau chuyển sang mục Dependencies của proposal
  (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 1, dev-lead #3 / qa #11: "số bài đã xong trong file" đếm thế nào → chỉ đếm bài có trong nội dung app, kể cả bài xong nhờ
  kiểm tra vượt cấp; Scenario "Bài không có trong app…" kiểm con số 1, thêm Scenario đếm bài qua kiểm tra vượt cấp (ba đề xuất,
  chờ người thật xác nhận)
- [x] Vòng 1, dev-lead #4 / qa #13: app không biết người học đã lưu hay hủy hộp lưu → "Đã xuất tiến độ." hiện khi app đã đưa file
  cho trình duyệt; hủy hộp lưu / bảng chia sẻ sau đó không phải lỗi, không có thông báo khác; ghi vào Requirement và mục Không làm
  (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 1, dev-lead #5: layer "Lưu file xuống máy" ghi `shared/utils/` (pure, leaf) → bỏ, chỉ giữ `core/`
- [x] Vòng 1, dev-lead #6: tab khác đang mở app có thể ghi lại tiến độ cũ sau khi ghi đè → đưa vào mục Không làm, kèm hành vi mong
  đợi (tab khác hiện tiến độ cũ đến khi tải lại) (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 1, dev-lead #7: chưa giới hạn kích thước file nhập → file lớn hơn 20 MB bị từ chối ngay, không đọc nội dung, báo "File này
  không phải file tiến độ của Tranie Chinese."; 20 MB dư nhiều so với tiến độ nhiều năm học (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 1, qa #9: máy B ở Scenario khứ hồi phải qua màn chào mừng, có thể đã chọn 30 phút → ghi rõ máy B qua màn chào mừng với
  mục tiêu 15 phút, máy A chọn 30 phút
- [x] Vòng 1, qa #10: không Scenario nào kiểm "Đã xuất tiến độ." được trình đọc màn hình đọc → thêm Scenario
- [x] Vòng 1, qa #12: Open Question ghi "điểm nếu có" nhưng bảng không có → bỏ "điểm nếu có" (app hiện không lưu điểm bài); điểm
  thêm sau này theo hợp đồng ở Dependencies
- [x] Vòng 1, qa #14: máy B không thể vào Cài đặt khi chưa qua màn chào mừng → mọi Scenario nhập ở máy khác ghi rõ máy đó đã qua màn
  chào mừng; spec không có câu nào dựa vào việc nhập trước khi qua màn chào mừng
- [x] Vòng 2, qa #1: Scenario đếm bài qua vượt cấp dùng "chủ đề đầu tiên", trạng thái app không tạo ra được (chủ đề đầu luôn mở,
  Nhập môn không có bài kiểm tra) → đổi sang: bài 1 đã xong, đạt kiểm tra vượt cấp của một chủ đề chưa mở có bài kiểm tra (chủ đề
  thứ k), các chủ đề giữa vẫn khóa; hộp xác nhận nêu 1 + số bài của chủ đề thứ k. Scenario khứ hồi "File có chủ đề đã qua bằng kiểm
  tra vượt cấp" viết lại cùng trạng thái, thêm kiểm các chủ đề giữa vẫn "Đã khóa" và bài đầu chủ đề thứ k+1 "Đang mở"
- [x] Vòng 2, dev-lead #2: hợp đồng "dữ liệu thêm sau S8.5" chồng với lựa chọn Cài đặt của S8.2 → bảng ghi rõ mọi lựa chọn của S8.2
  (mục tiêu phút, tốc độ audio mặc định, hiện pinyin); loại S8.1, S8.2, S8.3 khỏi hợp đồng; thêm Scenario khứ hồi "File có lựa chọn
  hiện pinyin" (ba đề xuất, chờ người thật xác nhận)
- [x] Vòng 2, qa #3: Scenario "Nhập file lỗi khi không có mạng" chưa nói file hỏng thế nào → ghi rõ file có một bài ở trạng thái không
  tồn tại
- [x] Vòng 2, dev-lead #4: chữ "đã học 12 phút hôm nay" / "0 phút" không khớp S8.1 → dùng đúng chữ S8.1 "Hôm nay: 12 / 15 phút" và
  "Hôm nay: 0 / 15 phút", ghi rõ mục tiêu 15 phút trong file
- [x] Vòng 3, dev-lead (minor): What Changes gạch "Xuất" thiếu "đã qua màn chào mừng" so với bảng Requirement → thêm vào danh sách
  nội dung file
