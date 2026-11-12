# Proposal: S4.2 Phân biệt cặp âm gần nhau

Story **S4.2 Phân biệt cặp âm gần nhau · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s42-phân-biệt-cặp-âm-gần-nhau--f3)) ·
GitHub issue [#27](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/27). Bản 0.1.

Refs #27

## Why

Là người học, tôi muốn phân biệt các cặp âm dễ nhầm để phát âm và nghe chuẩn. Nội dung đã có dạng bài "cặp âm" (`sound-pair`: hai từ,
một đáp án nằm trong cặp) nhưng app chưa có màn cho dạng này, nên câu đang bị bỏ qua.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "cặp âm" (chỉ nhận props) + đăng ký vào registry | `shared/components/exercises/` |
| Xáo thứ tự hai lựa chọn (thuần, nhận nguồn ngẫu nhiên để test được) | `shared/utils/` |
| Nghe âm câu hỏi, nghe từng âm sau khi chấm | nút dùng chung của S4.4 (`core/hooks`) |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Câu cặp âm hiện nút Nghe (âm của đáp án) và **2 lựa chọn** ghi pinyin của hai từ, **thứ tự xáo ngẫu nhiên** mỗi lần câu hiện.
- **Trước khi chấm** chỉ nghe được âm câu hỏi, không nghe riêng từng lựa chọn (nghe so sánh sẽ lộ đáp án).
- Chọn xong: chấm đúng/sai, khóa lựa chọn, rồi mở nút **nghe từng âm** trong cặp để so sánh.
- Màn dùng chung cho mọi loại cặp (phụ âm đầu, vận mẫu, nguyên âm); app không giới hạn danh sách cặp.

## Không làm (out of scope)

- Chọn cặp nào cho bài, nội dung 12 bài Nhập môn → **S7.1**. Danh sách "zh/z, q/ch, an/ang, ü/u" là yêu cầu cho nội dung,
  không có kiểm tra nội dung riêng cho danh sách này.
- Nút Nghe, Nghe chậm → **S4.4**.
- Tạo thẻ ôn tập từ câu sai → **S9.4**; ghi âm so sánh → **E5**.

## Dependencies

- **S4.4** (code trước): nút Nghe dùng chung, dạng bài nhận từ đã tra sẵn qua props.
- **S3.2** (đã archive): khung chạy bài. Schema đã chặn đáp án nằm ngoài cặp.
- **S7.1** (ghi chú cho người soạn): bài mẫu hiện dùng cặp 四/十 (`sì`/`shí`), khác cả phụ âm đầu lẫn thanh nên nghe thanh là đoán được.
  Nên đổi sang cặp chỉ khác một phần (vd `sì`/`shì`). Không sửa nội dung trong story này.

## Capabilities

### New Capabilities
- `sound-pair`: nghe một âm, chọn đúng âm trong cặp, rồi nghe lại cả hai để so sánh.

### Modified Capabilities
- (không có)

## Quyết định đã chốt (2026-11-12)

1. Trước khi chấm chỉ nghe âm câu hỏi; sau khi chấm mới nghe được từng âm trong cặp.
2. App xáo thứ tự hai lựa chọn mỗi lần câu hiện.
3. "zh/z, q/ch, an/ang, ü/u" là ví dụ cho nội dung, không có validator riêng.
4. Chữ nút nghe từng âm: "Nghe <pinyin>" (vd "Nghe sì").

## Câu hỏi mở

1. Chưa có e2e vì nội dung Nhập môn dùng dạng này chưa soạn (S7.1).

## Impact

- Code mới: dạng bài cặp âm (+ test), hàm xáo hai lựa chọn (+ test).
- Code sửa: registry, i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
