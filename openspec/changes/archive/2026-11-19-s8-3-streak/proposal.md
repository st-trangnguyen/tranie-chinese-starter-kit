# Proposal: S8.3 Streak

Story **S8.3 Streak · F2** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s83-streak--f2)) ·
GitHub issue [#56](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/56). Bản 0.2, epic E8.

Refs #56

## Why

Là người học, tôi muốn thấy chuỗi ngày học liên tục để có động lực học đều. Người học đã chọn mục tiêu số phút mỗi ngày
(S1.3) và sẽ thấy số phút hôm nay so với mục tiêu trên trang chủ (S8.1), nhưng chưa thấy mình đã giữ được nhịp học bao
nhiêu ngày liền. Streak (chuỗi ngày học) đếm số ngày liên tiếp người học đạt mục tiêu.

## Phụ thuộc

- **S8.1 Trang chủ** (change `s8-1-home-screen`): có **PR spec #129** (nhánh `spec/s8-1-home-screen`, **chưa merge**), chưa
  có trên `main`. S8.3 dùng hai capability của S8.1:
  - `home-screen`: màn Trang chủ để hiện streak (AC2), và Requirement "Hiện số phút đã học hôm nay so với mục tiêu"
    (mục tiêu đã lưu không đọc được thì dùng 15 phút).
  - `daily-study-time`: các Requirement "Thời gian ở màn bài được tính là thời gian học", "Màn bài còn hiện thì thời gian
    được tính hết", "Làm tròn xuống phút", "Mỗi ngày đếm lại từ 0", "Đóng app giữa bài chỉ mất tối đa 30 giây cuối" (gồm
    Scenario "S8.1-AC2 Thời gian học đã lưu bị hỏng").
- **Tiền đề S8.3 lấy từ S8.1** (S8.3 không tự định nghĩa; nếu S8.1 đổi thì S8.3 đổi theo):
  1. Có thời gian học riêng cho từng ngày, và thời gian của các ngày đã qua được giữ lại (không chỉ hôm nay). Đã chốt ở Open
     Questions của S8.1 (người thật đồng ý 2026-11-17): lưu ở bảng thống kê theo ngày (docs/03-architecture.md §6.2), khóa là
     ngày theo giờ máy, giữ mọi ngày, lưu theo giây.
  2. Cái gì được tính là thời gian học (Requirement "Thời gian ở màn bài được tính là thời gian học" và "Màn bài còn hiện thì
     thời gian được tính hết"): chỉ thời gian ở màn bài, gồm bài kiểm tra cuối chủ đề, bài kiểm tra vượt cấp và màn tổng kết;
     không tính lúc app bị ẩn hay chạy nền, hay ở màn khác; mở màn bài ở hai tab cùng hiện thì mỗi tab cộng riêng.
  3. Số phút một ngày = tổng thời gian trong ngày cộng dồn theo giây, làm tròn xuống phút, đúng con số Trang chủ hiện
     (Requirement "Làm tròn xuống phút").
  4. "Một ngày" theo đồng hồ máy, từ 0:00 đến hết 23:59; mỗi phần thời gian tính vào ngày nó diễn ra, học qua nửa đêm thì phần
     trước 0:00 tính cho hôm trước, phần từ 0:00 trở đi tính cho hôm sau (Requirement "Mỗi ngày đếm lại từ 0").
  5. Đóng app lúc đang ở màn bài, bất kỳ cách nào, thì mất tối đa 30 giây cuối; thời gian đã lưu không đọc được thì coi là 0
     (Requirement "Đóng app giữa bài chỉ mất tối đa 30 giây cuối").
  6. Mục tiêu đang chọn không đọc được thì dùng 15 phút (Requirement "Hiện số phút đã học hôm nay so với mục tiêu").
- **Mục tiêu của từng ngày do S8.3 lưu** (người thật chốt, Open Questions): spec S8.1 không lưu mục tiêu theo ngày và không
  phải đổi. S8.3 thêm mục tiêu vào dữ liệu phút học theo ngày bằng một lần nâng dữ liệu trên máy riêng. Từ bản S8.3, **mỗi
  lần ghi hoặc tạo bản ghi phút học của hôm nay thì ghi luôn mục tiêu đang chọn vào bản ghi đó**, và ngoài ra cập nhật mục
  tiêu của bản ghi hôm nay mỗi lần mục tiêu đổi; nhờ vậy mọi ngày ghi từ bản S8.3 đều có mục tiêu, kể cả khi người học không
  đổi mục tiêu. Việc này sửa phần code ghi phút học do S8.1 thêm, không đổi spec S8.1. Chỉ các ngày được ghi trước bản S8.3
  (giữa bản S8.1 và bản S8.3) không có mục tiêu, được so với mục tiêu của hôm nay (ngoại lệ ở Requirement "Mục tiêu bị
  thiếu hoặc hỏng").
- **Thứ tự merge**: PR spec S8.3 chỉ được merge **sau** PR spec S8.1 (#129). Nếu #129 còn đổi trước khi merge, rà lại mọi
  câu dẫn tới S8.1 trong change này (tên Requirement ở trên, sáu tiền đề) cho khớp bản đã merge. PR code S8.3 cắt sau khi PR code S8.1 merge.
- **Đổi mục tiêu**: hiện chỉ chọn được ở onboarding (S1.3, một lần); chỗ đổi lại trong Cài đặt là S8.2 AC1, chưa có spec.
  S8.3 **không** phụ thuộc cứng S8.2: quy tắc "đổi mục tiêu" (Requirement "Mục tiêu dùng để so cho từng ngày") được kiểm
  bằng dữ liệu mục tiêu đặt sẵn, không cần màn Cài đặt. Khi S8.2 có, người học đổi mục tiêu qua đó và quy tắc này áp dụng.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc streak: ngày nào là "đạt mục tiêu", mục tiêu dùng để so, đếm chuỗi ngày liên tiếp | `shared/services/` (service tiến độ hiện có, Phần 2: pure) |
| Use case đọc phút học theo ngày + mục tiêu rồi tính streak | `shared/services/` (Phần 3) |
| Đọc phút học theo ngày (dữ liệu S8.1 thêm); đọc/ghi mục tiêu của từng ngày | `core/services/` (adapter tiến độ); schema Zod ở `@csk/shared` |
| Lần nâng schema thêm mục tiêu theo ngày (S8.3 sở hữu) | `core/helpers/db.helper.ts` |
| Ghi mục tiêu đang chọn vào bản ghi phút học của hôm nay mỗi lần ghi/tạo bản ghi đó (sửa code ghi phút do S8.1 thêm, không đổi spec S8.1), và cập nhật lại mỗi lần mục tiêu đổi | `shared/services/` (use case ghi phút học + use case đổi mục tiêu) |
| State streak của trang chủ, tính lại khi mở/quay lại Trang chủ và khi app quay lại từ nền | `pages/home/hooks/` (feature trang chủ của S8.1) |
| Dòng hiện streak trên trang chủ | `pages/home/components/` |
| Nhãn giao diện | `assets/i18n/vi/home.json` |
| Kiểm tra streak trên trang chủ với dữ liệu và đồng hồ cố định | Vitest (quy tắc) + Playwright `apps/web/e2e/E8/` |

## What Changes

- **Quy tắc streak**: một ngày "đạt mục tiêu" khi số phút học của ngày đó đạt ít nhất mục tiêu dùng để so của ngày đó. Streak
  là số ngày đạt mục tiêu liên tiếp, tính lùi từ hôm nay (nếu hôm nay đã đạt) hoặc từ hôm qua (nếu hôm nay chưa đạt). Một
  ngày đã qua không đạt thì chuỗi đứt, về 0.
- **Mục tiêu của một ngày** = mục tiêu đang chọn lúc ngày đó kết thúc, để kết quả trong ngày giữ nguyên sau 0:00 và đổi
  mục tiêu không sửa quá khứ. S8.3 lưu mục tiêu cho từng ngày (thêm vào dữ liệu phút học theo ngày của S8.1 bằng một lần
  nâng dữ liệu riêng): mỗi lần ghi hoặc tạo bản ghi phút học của hôm nay thì ghi luôn mục tiêu đang chọn vào bản ghi đó, và
  cập nhật lại mục tiêu của hôm nay mỗi lần mục tiêu đổi.
- **Dữ liệu hỏng, đồng hồ máy nhảy**: phút của một ngày không đọc được thì coi là 0; mục tiêu của ngày đã qua không có hoặc
  không đọc được thì so với mục tiêu của hôm nay; ngày ghi sau hôm nay bị bỏ qua.
- **Trang chủ hiện streak**: dòng chữ "Chuỗi ngày học: N ngày", luôn hiện kể cả khi N = 0. Tính lại khi mở/quay lại Trang chủ
  và khi app quay lại từ nền. Dữ liệu ở trên máy nên streak hiện được khi offline.

## Capabilities

### New Capabilities
- `study-streak`: quy tắc đếm chuỗi ngày đạt mục tiêu và cách streak hiện trên trang chủ.

### Modified Capabilities
- Không có. (`home-screen` và `daily-study-time` của S8.1 chưa có trong `openspec/specs/`; streak ghi ở capability riêng.)

## Không làm (out of scope)

- Thiết kế lại trang chủ: chỉ thêm một dòng streak vào trang chủ của S8.1.
- Cách tính phút học (cái gì được tính, làm tròn, ranh giới ngày, buổi học vắt qua 0:00): thuộc S8.1 `daily-study-time`.
- Màn đổi mục tiêu (S8.2 AC1); S8.3 chỉ nêu streak xử lý thế nào khi mục tiêu đổi.
- Ngày nghỉ / "đóng băng" streak, kỷ lục streak dài nhất, lịch sử theo lịch, huy hiệu, thông báo nhắc học, hiệu ứng ăn mừng.
- Streak trên màn khác ngoài trang chủ.
- Tự cập nhật streak đúng lúc 0:00 khi Trang chủ đang hiện liên tục.

## Impact

- Thêm một dòng trên trang chủ của S8.1; không đổi hành vi khác của trang chủ.
- Thêm mục tiêu của từng ngày vào số phút học theo ngày mà S8.1 thêm, bằng một lần nâng dữ liệu trên máy riêng của S8.3;
  spec S8.1 không đổi, nhưng code ghi phút học do S8.1 thêm được sửa để ghi kèm mục tiêu đang chọn. Dữ liệu cũ giữ nguyên;
  chỉ các ngày ghi trước bản S8.3 không có mục tiêu (xem Open Questions).

## Open Questions

- [x] Lưu mục tiêu của từng ngày cạnh số phút học theo ngày là thay đổi dữ liệu trên máy (schema IndexedDB, khó đảo ngược). Hai lựa chọn: (a) S8.1 ghi mục tiêu đang chọn vào bản ghi của ngày ngay từ đầu, trong cùng lần nâng schema thêm bảng theo ngày, và cập nhật bản ghi hôm nay mỗi lần đổi mục tiêu; mọi ngày đều có mục tiêu, hàng "không có mục tiêu" chỉ xảy ra khi dữ liệu hỏng. (b) S8.3 thêm mục tiêu theo ngày bằng một lần nâng schema riêng; các ngày ghi giữa bản S8.1 và S8.3 không có mục tiêu và được so với mục tiêu của hôm nay (ngoại lệ đã ghi trong Requirement "Mục tiêu bị thiếu hoặc hỏng"). → (b) S8.3 thêm mục tiêu theo ngày bằng một lần nâng schema riêng; từ bản S8.3, mỗi lần ghi hoặc tạo bản ghi phút học của hôm nay thì ghi luôn mục tiêu đang chọn vào bản ghi đó, và cập nhật lại mục tiêu của bản ghi hôm nay mỗi lần đổi mục tiêu (sửa code ghi phút do S8.1 thêm; spec S8.1 không phải đổi); chỉ các ngày ghi trước bản S8.3 (giữa bản S8.1 và S8.3) không có mục tiêu và được so với mục tiêu của hôm nay (ngoại lệ trong Requirement "Mục tiêu bị thiếu hoặc hỏng") (người thật chốt)
- [x] Finding dev-lead vòng 3: chỉ ghi mục tiêu khi mục tiêu đổi thì ngày giữ nguyên mục tiêu sau bản S8.3 không có mục tiêu, nâng lên 30 sẽ so các ngày cũ với 30 và mâu thuẫn Scenario "Tăng mục tiêu không đổi các ngày đã qua" → Sửa cách lưu trong lựa chọn (b): mỗi lần ghi/tạo bản ghi phút học của hôm nay đều ghi kèm mục tiêu đang chọn; sửa mục Phụ thuộc, What Changes, Layer đích, Impact và câu (b); không thêm Scenario
- [x] Tiền đề lấy từ S8.1 lệch với bản S8.1 mới (học qua nửa đêm, màn tính giờ, hai tab, mất tối đa 30 giây, lưu theo giây) → Cập nhật sáu tiền đề và danh sách Requirement S8.1 trong mục Phụ thuộc, dẫn theo tên Requirement S8.1, không định nghĩa lại; học qua nửa đêm đổi từ "tính vào ngày được ghi nhận" thành chia cho hai ngày
- [x] Phụ thuộc S8.1 mô tả sai thực tế (S8.1 chưa có PR spec) → Sửa mục Phụ thuộc: trỏ tới từng Requirement theo tên; liệt kê sáu tiền đề lấy từ S8.1; PR spec S8.3 chỉ merge sau PR spec S8.1 và rà lại các câu dẫn khi đó
- [x] Mục tiêu "tại lần ghi phút cuối cùng" làm kết quả đổi qua 0:00 khi đổi mục tiêu sau lần học cuối → Mục tiêu của một ngày = mục tiêu đang chọn lúc ngày đó kết thúc; thêm Scenario đổi mục tiêu sau khi học, qua 0:00 streak không đổi (ba đề xuất, chờ người thật xác nhận)
- [x] Fallback "ngày cũ không có mục tiêu thì dùng mục tiêu hiện tại" mâu thuẫn Requirement "đổi mục tiêu không tạo/mất ngày đạt" → Requirement "Mục tiêu dùng để so cho từng ngày" trỏ tới ngoại lệ duy nhất ở Requirement "Mục tiêu bị thiếu hoặc hỏng" (ngày đã qua không có mục tiêu đọc được thì so với mục tiêu của hôm nay), kèm Scenario; cách lưu theo lựa chọn (b) người thật chốt ở câu phía trên (ba đề xuất, chờ người thật xác nhận)
- [x] Số phút của một ngày đã qua không đọc được thì sao? → Coi là 0 phút, ngày đó chưa đạt (khớp S8.1: phút hỏng coi là 0), Trang chủ vẫn hiện bình thường; thêm hàng bảng + Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] Mục tiêu bị hỏng thì sao? → Mục tiêu đang chọn hỏng: dùng 15 phút như Trang chủ S8.1; mục tiêu của ngày đã qua thiếu/hỏng: dùng mục tiêu dùng để so của hôm nay; thêm hai hàng bảng + hai Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] Hạ mục tiêu có biến ngày cũ chưa đạt thành đạt không? → Không; thêm Scenario 30 → 15 với các ngày cũ học 20 phút, streak là 0 (ba đề xuất, chờ người thật xác nhận)
- [x] Trang chủ đang mở mà qua 0:00 hoặc app quay lại từ nền thì streak có cập nhật không? → Tính lại khi mở/quay lại Trang chủ và khi app quay lại từ nền; đang hiện liên tục qua 0:00 thì giữ số cũ đến lần tính lại kế tiếp; thêm bảng + Scenario quay lại từ nền (ba đề xuất, chờ người thật xác nhận)
- [x] Đồng hồ máy nhảy (đổi múi giờ, chỉnh lùi) để lại ngày ghi sau hôm nay, và buổi học vắt qua 0:00 thì sao? → Ngày ghi sau hôm nay bị bỏ qua, chỉ đếm lùi từ hôm nay (thêm hàng bảng + Scenario); buổi học vắt qua 0:00 theo quy tắc S8.1 (Requirement "Mỗi ngày đếm lại từ 0"): mỗi phần thời gian tính vào ngày nó diễn ra, học qua nửa đêm thì chia cho hai ngày, streak so từng ngày với đúng con số đó; thêm Scenario học qua nửa đêm (ba đề xuất, chờ người thật xác nhận; cập nhật theo bản S8.1 mới)
- [x] ID Scenario trùng (nhiều Scenario cùng `S8.3-AC1`) → Giữ nguyên: `docs/05-standards/spec-driven.md` §3 chỉ quy định tên Scenario bắt đầu bằng `S<epic>.<n>-AC<k>`, spec đã archive (S5.3, S5.4) cũng dùng chung ID theo AC; phân biệt bằng phần tên sau ID, test case có số thứ tự riêng
- [x] Đổi mục tiêu cần S8.2 (chưa có spec)? → Không phụ thuộc cứng: quy tắc đổi mục tiêu kiểm bằng dữ liệu đặt sẵn; khi S8.2 có thì người học đổi qua đó; ghi trong mục Phụ thuộc
- [x] QA chạy tay cần dữ liệu nhiều ngày thì nạp thế nào? → Dev ghi hướng dẫn sửa dữ liệu trên máy bằng DevTools của trình duyệt (thêm số phút và mục tiêu cho từng ngày, chỉnh đồng hồ máy) trong mô tả PR code; không thêm màn hay công cụ nạp dữ liệu trong app (ba đề xuất, chờ người thật xác nhận)
- [x] Bỏ một ngày thì streak thế nào? → Một ngày đã qua không đạt mục tiêu (kể cả ngày không mở app) thì chuỗi đứt; streak đếm lại từ ngày đạt kế tiếp (ba đề xuất, chờ người thật xác nhận)
- [x] Hôm nay chưa đạt mục tiêu thì streak hiện thế nào? → Hiện chuỗi tính đến hôm qua (không về 0 trong ngày); đạt mục tiêu hôm nay thì cộng 1 ngay khi người học về trang chủ (ba đề xuất, chờ người thật xác nhận)
- [x] Ranh giới ngày theo múi giờ nào? → Theo giờ trên máy, từ 0:00 đến 23:59, giống cách S8.1 chia phút học theo ngày (ba đề xuất, chờ người thật xác nhận)
- [x] "Đạt mục tiêu" là bằng hay vượt? So số phút làm tròn hay số giây? → Số phút đã học của ngày (làm tròn xuống như trang chủ hiện) lớn hơn hoặc bằng mục tiêu, để con số người học thấy khớp với streak (ba đề xuất, chờ người thật xác nhận)
- [x] Streak hiện ra sao, 0 ngày thì có hiện không? → Dòng chữ "Chuỗi ngày học: N ngày", luôn hiện kể cả N = 0; chỉ chữ và số, không hiệu ứng chuyển động nên không cần xử lý giảm chuyển động (ba đề xuất, chờ người thật xác nhận)
- [x] Những ngày trước khi app bắt đầu ghi phút học (trước S8.1) có tính không? → Không có dữ liệu thì coi như chưa đạt; người học mới hoặc vừa cập nhật app bắt đầu từ 0 (ba đề xuất, chờ người thật xác nhận)
- [x] S8.1 đã có PR spec #129 (chưa merge); Requirement S8.1 đổi tên, bảng thời gian theo ngày đã được người thật chốt → Mục Phụ thuộc ghi S8.1 là PR spec #129, PR spec S8.3 merge sau #129; đổi dẫn chiếu "Không mất thời gian đã học khi đóng app" thành "Đóng app giữa bài chỉ mất tối đa 30 giây cuối"; tiền đề 1 ghi đã chốt (bảng thống kê theo ngày, khóa ngày theo giờ máy, giữ mọi ngày, lưu theo giây); tiền đề 5 sửa "đóng đột ngột" thành "đóng app lúc đang ở màn bài, bất kỳ cách nào" và tiền đề 2 thêm "app bị ẩn" cho khớp #129; không đổi hành vi S8.3, không đổi Scenario
