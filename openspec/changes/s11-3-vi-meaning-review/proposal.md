# Proposal: S11.3 Review nghĩa tiếng Việt

Story **S11.3 Review nghĩa tiếng Việt · (nội dung)** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s113-review-nghĩa-tiếng-việt--nội-dung)) ·
GitHub issue [#61](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/61). Epic E11 Nội dung HSK 1.

Refs #61

## Why

Là người soạn nội dung, tôi muốn toàn bộ nghĩa tiếng Việt được review để tránh dạy sai. Hiện cả 500 từ HSK 1 đều mang nghĩa gợi ý
máy lấy từ CVDICT và chưa từ nào được đánh dấu đã review, nên mỗi lần kiểm tra nội dung đều in cảnh báo của S2.2 kèm danh sách
500 từ. Người học đang thấy nghĩa chưa ai kiểm (ví dụ nghĩa hiếm, chú thích dịch máy) trên thẻ từ, từ điển và bài tập.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Sửa nghĩa và đánh dấu đã review cho 500 từ | `content/authored/` (file nghĩa tiếng Việt, đầu vào pipeline E2) |
| Nội dung app sinh lại từ nguồn đã review | `apps/web/src/assets/content/` (pipeline sinh, không sửa tay) |
| Test chạy trên nội dung thật, giữ cho cảnh báo S2.2 không quay lại | `content/scripts/content-check/` (test cạnh file kiểm tra) |

Không đổi code app (`apps/web/src/app/`), không đổi schema nội dung, không đổi luật kiểm tra của S2.2.

## What Changes

- Cả 500 từ HSK 1 có ít nhất một nghĩa tiếng Việt và được đánh dấu đã review.
- Bước kiểm tra nội dung không còn cảnh báo của S2.2: không còn từ chưa có nghĩa, không còn từ chưa review. Story và S2.2 gọi
  bước này là "build", nhưng cảnh báo S2.2 chỉ in khi chạy kiểm tra nội dung, không in ở bước build nội dung; spec dùng chữ
  "kiểm tra nội dung".
- Nội dung app được sinh lại nên người học thấy nghĩa đã review ở mọi chỗ hiện nghĩa.
- Thêm kiểm tra tự động trên nội dung thật để lần thêm/sửa nội dung sau không làm cảnh báo quay lại mà không ai biết.

### Phần ngoại lệ không kiểm thử tự động được

Đây là story nội dung. Theo `docs/05-standards/spec-driven.md` (ngoại lệ có tên của TDD: **asset/nội dung thuần**), việc
**nghĩa có đúng không** là phán đoán của người review, không test máy nào kiểm được. Phần này không có Scenario; nó được kiểm bằng
người soạn nội dung tự review từng từ và người thật duyệt diff file nghĩa trong PR code. Spec chỉ chứa phần máy kiểm được: số từ đã
đánh dấu review, có nghĩa, không còn cảnh báo, nội dung app khớp nguồn.

**Lệch chuẩn tầng test:** mọi Scenario của story này chạy trên nội dung thật bằng test Vitest đặt cạnh code kiểm tra nội dung,
không qua giao diện. Theo `docs/05-standards/spec-driven.md` §3 thì `e2e` nghĩa là Playwright trên bản build; story này không có
Scenario nào cần trình duyệt, nên tầng test đúng là test nội dung (unit/integration trên dữ liệu thật), không phải `e2e`. Phần
người học thấy nghĩa trên màn hình đã có test của S2.2 và các màn hiện có; S11.3 không thêm test Playwright.

## Không làm (out of scope)

- Đổi luật cảnh báo của S2.2 (ví dụ nâng thành lỗi chặn build): giữ nguyên cảnh báo như S2.2 đã giao.
- Nghĩa tiếng Việt của câu, hội thoại, đoạn đọc trong bài (S11.1, S11.2, S11.4 tự soạn); S11.3 chỉ review nghĩa của 500 từ.
- Từ ngoài danh sách HSK 1 cấp 1, từ HSK 2 trở lên.
- Đổi cách hiện nghĩa trên màn hình (số nghĩa hiện, thứ tự, định dạng): giữ như các màn hiện có.
- Công cụ/màn hình hỗ trợ review trong app, quy trình review nhiều người.
- Cảnh báo khác của kiểm tra nội dung (ví dụ chữ thiếu dữ liệu nét của S2.5, audio của S11.5).

## Dependencies

- **S2.2 Nghĩa tiếng Việt** (đã có, code trong `main`): định nghĩa cảnh báo mà AC1 đòi hết. Theo S2.2 AC2: "Từ chưa có nghĩa hoặc
  chưa được review thì build báo cảnh báo, kèm danh sách các từ đó." Cảnh báo này in ra khi chạy kiểm tra nội dung, không chặn build.
  S2.2 giao trước khi dự án dùng OpenSpec nên **không có spec trong `openspec/specs/` hay `openspec/changes/archive/`**; nguồn là story
  S2.2 và code kiểm tra nội dung. S11.3 không mở rộng S2.2.
- **S2.1 Nạp danh sách từ HSK 1** (đã có): danh sách 500 từ là tập cần review.
- Không chặn và không bị chặn bởi S11.1, S11.2, S11.4, S11.5: các story đó soạn bài và audio, không đổi danh sách từ. Nếu chúng sửa
  file nghĩa (ví dụ S7.1 từng cho phép), PR nào merge sau thì giải quyết xung đột trên file đó.

## Capabilities

### New Capabilities
- `vi-meanings`: chất lượng dữ liệu nghĩa tiếng Việt của từ HSK 1 (đủ nghĩa, đã review, không còn cảnh báo S2.2, nội dung app khớp nguồn).

### Modified Capabilities

Không có.

## Impact

- `content/authored/vi-meanings.yaml`: sửa nghĩa của nhiều từ, đổi đánh dấu review của cả 500 từ.
- `apps/web/src/assets/content/`: sinh lại (đổi nghĩa trong dữ liệu từ); dung lượng gần như không đổi, không thêm mp3.
- Test hiện có tìm nghĩa cụ thể của một từ (unit, e2e) có thể phải cập nhật nếu nghĩa của từ đó đổi khi review.
- Không thêm dependency.

## Open Questions

- [x] **Tiêu chí review một nghĩa** → nghĩa đúng và thông dụng ở trình độ HSK 1 đặt đầu tiên; bỏ nghĩa hiếm, nghĩa chuyên ngành và
  chú thích dịch máy khó hiểu; chính tả tiếng Việt chuẩn; giữ chú thích ngữ pháp ngắn cho hư từ như "吧", "了". Không viết vào spec vì
  máy không kiểm được (ba đề xuất, chờ người thật xác nhận)
- [x] **Ai review và ai duyệt** → người soạn nội dung review và đánh dấu; một người thật biết tiếng Trung duyệt diff file nghĩa trong
  PR code trước khi merge (ba đề xuất, chờ người thật xác nhận)
- [x] **"Không còn cảnh báo của S2.2" có gồm cảnh báo "ID không có trong danh sách HSK" của cùng bước kiểm tra nghĩa không** → có, coi
  mọi cảnh báo của bước kiểm tra nghĩa tiếng Việt là cảnh báo S2.2; đã ghi vào bảng của Requirement đầu và Scenario thứ hai
- [x] **Giới hạn số nghĩa mỗi từ** → không giới hạn; ngoài phạm vi (đổi cách hiện nghĩa là story riêng)
- [x] (qa/dev-lead vòng 1) Scenario "bỏ đánh dấu review thì cảnh báo quay lại" nói "đúng một cảnh báo" mơ hồ vì kiểm tra nội dung còn
  cảnh báo khác → THEN chỉ đếm cảnh báo của bước kiểm tra nghĩa tiếng Việt; ghi rõ mục đích là chứng minh Scenario không cảnh báo
  không pass tầm thường
- [x] (qa/dev-lead vòng 1) Scenario "nội dung app dùng đúng nghĩa đã review" pass ngay trước khi review, không có pha RED → thêm điều
  kiện mỗi từ trong nội dung app được đánh dấu đã review (hiện là chưa, nên có RED); vẫn giữ vai trò hàng rào chống hồi quy
- [x] (qa/dev-lead vòng 1) "bước build nội dung" không khớp nơi in cảnh báo → sửa What Changes thành "bước kiểm tra nội dung", ghi
  story gọi là "build"
- [x] (qa/dev-lead vòng 1) Test-cases dùng `e2e` cho test Vitest trên nội dung, lệch `spec-driven.md` §3 → ghi lệch chuẩn trong mục
  "Phần ngoại lệ"; qa sửa nhãn tầng test trong test-cases.md
