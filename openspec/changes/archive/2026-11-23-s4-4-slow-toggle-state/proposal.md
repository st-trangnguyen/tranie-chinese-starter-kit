# Proposal: S4.4 Công tắc "Nghe chậm" báo trạng thái không chỉ bằng màu

Story **S4.4 Nghe lại + chế độ chậm** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md), issue gốc
[#29](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/29), change đã archive
`openspec/changes/archive/2026-11-13-s4-4-audio-replay/`) · sửa accessibility theo GitHub issue
[#139](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/139).

Refs #139

## Why

Công tắc "Nghe chậm" ở màn học hiện chỉ khác nhau giữa bật và tắt ở màu viền, màu nền và màu chữ; chữ luôn là "Nghe chậm". QA phát
hiện khi nghiệm thu S8.2 (PR #136, case TC-S8.2-AC2-3) rằng ở thang xám khác biệt rất nhẹ: người mù màu hoặc dùng màn hình tương phản
thấp khó biết chế độ chậm đang bật. Chưa đạt WCAG 2.1 SC 1.4.1 (không dùng màu làm cách duy nhất truyền đạt thông tin). Trình đọc màn
hình đã ổn vì công tắc đã báo trạng thái bật/tắt.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dấu tick trước chữ khi công tắc bật, ẩn với trình đọc màn hình | `shared/components/SlowToggle.tsx` (UI dùng chung) |
| Style dấu tick, giữ màu bật/tắt hiện có, giảm chuyển động | `apps/web/src/styles/tailwind/components/_audio.css` (BEM qua `@apply`, CLAUDE.md §6) |

Không đụng context tốc độ audio, service hay hook.

## What Changes

- Khi "Nghe chậm" bật, công tắc hiện **dấu tick** ngay trước chữ "Nghe chậm"; khi tắt thì không có. Dấu tick không được trình đọc màn hình
  đọc, nên tên của công tắc vẫn là "Nghe chậm" và trạng thái vẫn báo bằng bật/tắt như hiện nay.
- Giữ khác biệt màu hiện có giữa bật và tắt (lúc bật viền, nền và chữ đổi sang màu nhấn).
- Dấu tick đạt tương phản ≥ 3:1 với nền công tắc, chữ ≥ 4.5:1, ở cả giao diện sáng và tối. Dấu tick hiện/ẩn ngay, không có hiệu ứng.
- Thêm hai Requirement mới vào capability `audio-replay` (Scenario `S4.4-AC3`): "Công tắc 'Nghe chậm' cho biết trạng thái không chỉ
  bằng màu" và "Dấu tick 'Nghe chậm' dễ thấy ở thang xám, giao diện sáng và tối".

## Không làm (out of scope)

- Không đổi tốc độ phát (1x / 0.75x), cách bật/tắt, việc giữ trạng thái qua các câu hay trạng thái lúc mở bài (Requirement
  "Chế độ chậm 0.75x" giữ nguyên, kể cả phần S8.2 đang sửa).
- Không thêm chữ trạng thái "Bật" (phương án 2 của issue #139 không chọn).
- Không đổi nhãn "Nghe chậm", vị trí công tắc, nút "Nghe" hay các nút audio khác ("Nghe mẫu", "Nghe bản ghi").
- Không rà soát các công tắc khác trong app (vd "Hiện pinyin" ở màn Cài đặt); nếu cần thì mở issue riêng.

## Capabilities

### New Capabilities
Không có.

### Modified Capabilities
- `audio-replay`: thêm Requirement "Công tắc 'Nghe chậm' cho biết trạng thái không chỉ bằng màu" và "Dấu tick 'Nghe chậm' dễ thấy ở
  thang xám, giao diện sáng và tối" (ADDED, không sửa Requirement "Chế độ chậm 0.75x").

## Open Questions

- [x] **AC lấy từ đâu và mang ID nào?** Story S4.4 trong `docs/02-design/epics-stories.md` ban đầu chỉ có AC1, AC2 → lấy từ mục "Tiêu chí chấp nhận" của issue #139, Scenario mang ID `S4.4-AC3`; dòng AC3 đã được thêm vào story S4.4 trong PR spec này (người thật đã xác nhận)
- [x] **Dấu tick hay chữ "Bật"?** → dấu tick trước chữ, ẩn với trình đọc màn hình; bỏ cụm "(hoặc chữ "Bật")" khỏi AC khi chép (người dùng đã chọn khi giao việc; ba đề xuất, chờ người thật xác nhận)
- [x] **MODIFIED "Chế độ chậm 0.75x" hay ADDED Requirement riêng?** → ADDED Requirement riêng. Change `s8-2-settings` đang mở cũng MODIFIED Requirement "Chế độ chậm 0.75x"; nếu change này cũng MODIFIED thì change archive sau sẽ ghi đè nội dung của change kia. Requirement riêng không đụng chữ cũ và archive theo thứ tự nào cũng đúng. Bốn tiêu chí của issue chia vào hai Requirement (dấu tick + tên truy cập; thang xám + tương phản + giảm chuyển động) vì validate strict giới hạn độ dài Requirement; chữ tiêu chí giữ nguyên (ba đề xuất, chờ người thật xác nhận)
- [x] **Dấu tick có hiệu ứng xuất hiện không?** → không; hiện/ẩn ngay ở mọi thiết bị, nên tự đáp ứng giảm chuyển động; khi giảm chuyển động thì cũng không chuyển màu dần như hiện nay (Scenario "Giảm chuyển động thì dấu tick hiện ngay") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Ở thang xám" kiểm tra thế nào?** → quy về tín hiệu đo được: lúc bật dấu tick hiện trước chữ và đạt tương phản ≥ 3:1 với nền công tắc (tương phản tính theo độ sáng nên không đổi ở thang xám), lúc tắt không có dấu tick; ở cả sáng và tối (Scenario "Phân biệt bật và tắt ở thang xám…"; sửa theo finding QA/dev-lead vì "nhìn thấy được" không đo được) (ba đề xuất, chờ người thật xác nhận)
- [x] **Tương phản đo với nền nào?** → nền của chính công tắc: lúc bật là nền nhấn nhạt, lúc tắt là nền màn phía sau (công tắc tắt không có nền riêng); đo khi con trỏ không nằm trên công tắc; ở cả giao diện sáng và tối (Requirement thêm "so với nền công tắc", theo finding) (ba đề xuất, chờ người thật xác nhận)
- [x] **"Màu nhấn hiện có lúc bật được giữ" kiểm thế nào?** → thêm vào Scenario "Bật Nghe chậm thì hiện dấu tick trước chữ": viền, nền và chữ của công tắc vẫn đổi sang màu nhấn như hiện nay (theo finding)
- [x] **Dấu tick và chữ có thể xuống hàng ở màn hẹp không?** → không; Scenario "Bật Nghe chậm…" yêu cầu dấu tick và chữ nằm cùng một hàng, làm chỗ dựa cho case Mobile 375 (theo finding) (ba đề xuất, chờ người thật xác nhận)
- [x] **"Hiện/ẩn ngay, không có hiệu ứng" khi không giảm chuyển động có Scenario không?** → thêm Scenario "Không giảm chuyển động thì dấu tick vẫn hiện ngay"; giữ cam kết ở mọi thiết bị (theo finding) (ba đề xuất, chờ người thật xác nhận)
- [x] **Tên Requirement "dễ thấy ở mọi chế độ hiển thị" hứa quá phạm vi (forced colors)?** → đổi thành "… ở thang xám, giao diện sáng và tối"; chế độ màu cưỡng bức (forced colors) không nằm trong change này (theo finding)
- [x] **AC3 chưa có trong `docs/02-design/epics-stories.md`** → đã thêm dòng AC3 vào story S4.4 trong `epics-stories.md` ngay trong PR spec này (tóm tắt tiêu chí của issue #139 theo hai Requirement ADDED: dấu tick trước chữ khi bật, không chỉ đổi màu; tên truy cập giữ "Nghe chậm"; phân biệt được ở thang xám, sáng và tối), để tài liệu story và spec khớp nhau (người thật đã xác nhận)
- [x] **Có Scenario cho công tắc bật sẵn khi vào bài theo tốc độ mặc định trong Cài đặt (S8.2)?** → không thêm; dấu tick đi theo trạng thái bật của công tắc, bất kể bật do người học hay do mặc định. Scenario "Dấu tick giữ qua các câu trong bài" phủ trường hợp công tắc đã bật sẵn khi câu hiện, không phụ thuộc tiến độ code của S8.2 (ba đề xuất, chờ người thật xác nhận)

## Impact

- Code sửa: `SlowToggle.tsx` (thêm dấu tick ẩn với trình đọc màn hình khi bật), `_audio.css` (style dấu tick, giảm chuyển động).
- Không thêm dependency (dấu tick dùng ký tự hoặc SVG nội tuyến; planner chọn). Không đổi dữ liệu người dùng.
- Tầng test: Testing Library cho có/không dấu tick, tên truy cập, trạng thái, bàn phím, giữ qua câu; Vitest/token test cho ngưỡng tương
  phản ở sáng và tối; Playwright (tùy planner) cho giảm chuyển động và hiển thị ở giao diện tối.
