# Proposal: S6.1 Xem thứ tự nét

Story **S6.1 Xem thứ tự nét · F7** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s61-xem-thứ-tự-nét--f7)) ·
GitHub issue [#34](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/34). Bản 0.1.

Refs #34

## Why

Là người học, tôi muốn xem animation thứ tự nét để biết cách viết đúng. Đây là bước đầu của luồng luyện viết (F7): xem cách viết, rồi
tập viết theo nét (S6.2).

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Nạp dữ liệu nét của một chữ (từ dữ liệu build, S2.5) | `shared/services/` (use case) hoặc `core/services/` nếu chỉ là hạ tầng nạp file; planner quyết |
| State phát/phát lại animation | `pages/<feature>/hooks/` |
| Khối hiển thị animation + nút Phát lại | `shared/components/` (dùng lại ở S6.2) hoặc `pages/<feature>/components/` |
| i18n (nhãn nút), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Với một chữ Hán có dữ liệu nét, người học xem được animation **vẽ từng nét theo đúng thứ tự viết**.
- Người học **phát lại** animation bất cứ lúc nào (kể cả khi đang phát hoặc sau khi phát xong).

## Không làm (out of scope)

- Tập viết trên khung, báo sai nét, gợi ý → **S6.2**; viết không gợi ý → **S6.3**.
- Tạo dữ liệu nét và cảnh báo thiếu dữ liệu lúc build → **S2.5**.
- Tốc độ phát tùy chỉnh, tạm dừng, xem từng nét một (AC không yêu cầu).
- Tên nét, quy tắc thứ tự nét bằng chữ.

## Dependencies

- **S2.5** (code trước): dữ liệu nét chữ của các chữ dùng trong nội dung.
- Màn chứa animation: xem Câu hỏi mở 1.

## Capabilities

### New Capabilities
- `stroke-order`: xem animation thứ tự nét của một chữ Hán và phát lại.

### Modified Capabilities
- (không có)

## Open Questions

- [ ] **Màn chứa animation**: AC không nói animation nằm ở đâu (thẻ từ vựng, màn riêng "Luyện viết", hay phần dạng bài viết của S6.2). BA chỉ định; Scenario hiện viết theo "màn xem thứ tự nét của một chữ".
- [ ] **Tự phát hay bấm mới phát**: khi mở màn, animation tự phát ngay hay chờ bấm? Đề xuất tự phát một lần khi mở.
- [ ] **Chữ không có dữ liệu nét** (S2.5-AC2 chỉ cảnh báo lúc build): người học thấy gì? Đề xuất không hiện khối animation và hiện thông báo ngắn.
- [ ] **Từ nhiều chữ**: chọn chữ nào để xem, hay xem lần lượt từng chữ? Chưa nêu trong AC.
- [ ] **Tôn trọng giảm chuyển động** (`prefers-reduced-motion`): đề xuất hiện thứ tự nét tĩnh có đánh số thay vì animation. BA xác nhận.

## Impact

- Code mới: khối animation thứ tự nét và nút Phát lại (+ test).
- Có thể thêm dependency hanzi-writer vào web (đã nằm trong kế hoạch S2.5); planner xác nhận.
- Không đổi schema nội dung, không đổi IndexedDB.
- Tầng test: Vitest + Testing Library với dữ liệu nét giả; e2e cho thao tác Phát lại nếu màn đã được chọn.
