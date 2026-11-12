# Proposal: S4.1 Nghe chọn thanh

Story **S4.1 Nghe chọn thanh · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s41-nghe-chọn-thanh--f3)) ·
GitHub issue [#26](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/26). Bản 0.1.

Refs #26

## Why

Là người học, tôi muốn nghe một âm rồi chọn thanh điệu để luyện tai phân biệt thanh. Nội dung đã có dạng bài "nghe chọn thanh"
(`tone-choice`, trỏ tới một từ) nhưng app chưa có màn cho dạng này, nên câu đang bị bỏ qua (biện pháp tạm của S3.2).

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "nghe chọn thanh" (chỉ nhận props) + đăng ký vào registry | `shared/components/exercises/` |
| Lấy thanh điệu từ pinyin có dấu (thuần, dùng lại ở S4.3) | `packages/shared` `pinyin.utils.ts` |
| Kiểm tra nội dung: từ của câu chọn thanh phải một âm tiết | `packages/shared` `content.schema.ts` (chạy trong `content:check`) |
| Nghe, nghe lại, nghe chậm | nút dùng chung của S4.4 (`core/hooks`) |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Câu "nghe chọn thanh" hiện nút Nghe và **5 lựa chọn** theo thứ tự: thanh 1, thanh 2, thanh 3, thanh 4, thanh nhẹ.
- Thanh đúng suy từ pinyin có dấu của từ; pinyin không có dấu là **thanh nhẹ**.
- Chọn xong: chấm đúng/sai, hiện **thanh đúng kèm pinyin có dấu** ("Đáp án đúng: thanh 3 · nǐ"), khóa lựa chọn.
- Kiểm tra nội dung báo lỗi khi câu chọn thanh dùng từ **nhiều âm tiết**.

## Không làm (out of scope)

- Nút Nghe, Nghe chậm → **S4.4**.
- Nội dung câu chọn thanh của 12 bài Nhập môn → **S7.1**.
- Tạo thẻ ôn tập từ câu sai → **S9.4**.

## Dependencies

- **S4.4** (code trước): nút Nghe dùng chung, dạng bài nhận từ đã tra sẵn qua props.
- **S3.2** (đã archive): khung chạy bài, chấm và giải thích khi sai.
- **S2.1** (đã archive): pinyin trong nội dung luôn viết bằng dấu.

## Capabilities

### New Capabilities
- `tone-choice`: dạng bài nghe một âm rồi chọn thanh điệu.

### Modified Capabilities
- (không có)

## Quyết định đã chốt (2026-11-12)

1. Câu chọn thanh chỉ dùng từ một âm tiết; nhiều âm tiết thì kiểm tra nội dung báo lỗi.
2. Pinyin không có dấu là thanh nhẹ.
3. Giải thích khi sai: "Đáp án đúng: thanh 3 · nǐ".

## Câu hỏi mở

1. Chưa có e2e vì nội dung Nhập môn dùng dạng này chưa soạn (S7.1).

## Impact

- Code mới: dạng bài chọn thanh, hàm lấy thanh điệu (+ test), rule kiểm tra một âm tiết (+ test).
- Code sửa: registry, schema bài (thêm rule), i18n, style.
- Không đổi IndexedDB, không thêm dependency. Bài mẫu hiện có (八, 白, 百) đều một âm tiết, không vỡ `content:check`.
