# Proposal: S4.3 Nghe rồi gõ pinyin

Story **S4.3 Nghe rồi gõ pinyin · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s43-nghe-rồi-gõ-pinyin--f3)) ·
GitHub issue [#28](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/28). Bản 0.1.

Refs #28

## Why

Là người học, tôi muốn nghe rồi gõ pinyin để nhớ cách ghi âm. Nội dung đã có dạng bài "gõ pinyin" (`pinyin-type`, trỏ tới một từ) nhưng app
chưa có màn cho dạng này. Bộ công cụ pinyin hiện có đã đổi được `ni3` → `nǐ` nhưng chưa tách âm tiết, chưa chấm, chưa chỉ chỗ sai. Pinyin trong
nội dung phần lớn **viết liền** (`bàba`, `duìbuqǐ`; chỉ 48/500 từ có khoảng trắng), nên app phải tự tách âm tiết.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "gõ pinyin" (chỉ nhận props) + đăng ký vào registry | `shared/components/exercises/` |
| Đổi số → dấu, tách âm tiết (bảng âm tiết hợp lệ), tách thanh mẫu/vận mẫu/thanh điệu, so sánh và chỉ phần sai | `packages/shared` `pinyin.utils.ts` (thuần) |
| Nghe, nghe lại, nghe chậm | nút dùng chung của S4.4 (`core/hooks`) |
| i18n, style BEM (phần sai có nhãn chữ, không chỉ màu) | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Câu "gõ pinyin" hiện nút Nghe, ô nhập pinyin và nút "Kiểm tra" (Enter cũng chấm).
- **Gõ kiểu số** thì ô tự đổi thành dấu: `ni3` → `nǐ`, `lv4`/`lu:4` → `lǜ`, số 5 hoặc không số là thanh nhẹ.
- **Chấp nhận cả kiểu số và kiểu dấu**, gõ liền hoặc cách âm tiết, không phân biệt hoa/thường. Với 爸爸 (`bàba`): `ba4ba`, `ba4ba5`, `ba4 ba`, `bàba` đều đúng.
- Gõ sai: chấm sai, **tô từng phần sai** của từng âm tiết — thanh mẫu, vận mẫu, thanh điệu — mỗi phần có nhãn chữ; hiện pinyin đúng.
  Âm tiết thiếu hoặc thừa tính sai cả ba phần.

## Không làm (out of scope)

- Nút Nghe, Nghe chậm → **S4.4**.
- Bàn phím pinyin riêng trên màn hình.
- Tạo thẻ ôn tập từ câu sai → **S9.4**.

## Dependencies

- **S4.4** (code trước): nút Nghe dùng chung, dạng bài nhận từ đã tra sẵn qua props.
- **S4.1**: hàm lấy thanh điệu từ pinyin có dấu (dùng lại; nếu S4.1 chưa merge thì S4.3 thêm).
- **S3.2** (đã archive): khung chạy bài. **S2.1** (đã archive): bộ công cụ pinyin, ký tự pinyin hợp lệ.

## Capabilities

### New Capabilities
- `pinyin-type`: nghe rồi gõ pinyin, tự đổi số thành dấu, chấm cả hai kiểu gõ, tô chỗ sai.

### Modified Capabilities
- (không có)

## Quyết định đã chốt (2026-11-12)

1. Nhận gõ liền và gõ cách âm tiết; app tự tách âm tiết theo bảng âm tiết pinyin hợp lệ.
2. Thanh nhẹ nhận cả số 5 và không số.
3. `v` và `u:` thay cho ü.
4. Âm tiết thiếu hoặc thừa tính sai cả ba phần; luôn hiện pinyin đúng khi sai.
5. Tô mọi phần sai, mỗi phần có nhãn chữ "Thanh mẫu", "Vận mẫu", "Thanh điệu".

## Câu hỏi mở

1. Chưa có e2e vì nội dung Nhập môn dùng dạng này chưa soạn (S7.1).

## Impact

- Code mới: dạng bài gõ pinyin (+ test); trong `pinyin.utils.ts` thêm tách âm tiết, tách thành phần, so sánh (+ test).
- Code sửa: registry, i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency. Story lớn nhất của E4.
