# Proposal: S5.4 Khi không có mic

Story **S5.4 Khi không có mic · F6** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s54-khi-không-có-mic--f6)) ·
GitHub issue [#33](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/33). Bản 0.1.

Refs #33

## Why

Là người học, tôi muốn vẫn luyện được khi không có mic hoặc mic bị chặn để không bị kẹt bài. Câu "nói" mà người học không ghi âm được
thì không được chặn cả bài (CLAUDE.md và roadmap: app dùng được offline, không điều kiện cứng về thiết bị). Story này nói rõ phải làm gì khi
ghi âm không dùng được: chỉ cách cấp quyền và chuyển sang "đọc to rồi tự chấm".

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Phân loại lý do không ghi âm được: bị chặn quyền, không có mic, trình duyệt không hỗ trợ (hạ tầng) | `core/services/recorder.service.ts` (của S5.1) |
| Hook báo trạng thái mic và "Thử lại" | `core/hooks/useRecorder.ts` (của S5.1) |
| Khu hướng dẫn cấp quyền và chế độ "đọc to rồi tự chấm" trong dạng bài "nói" | `shared/components/exercises/` (chỉ nhận props) |
| i18n (nội dung hướng dẫn), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Khi ghi âm không dùng được, câu "nói" hiện **hướng dẫn** theo từng lý do:

| Lý do | Hướng dẫn |
|---|---|
| Quyền micro bị chặn | Các bước cấp quyền micro cho trang trong trình duyệt, rồi bấm "Thử lại" |
| Không tìm thấy micro | Kiểm tra đã cắm/bật micro, rồi bấm "Thử lại" |
| Trình duyệt không hỗ trợ ghi âm | Báo không ghi âm được trên trình duyệt này, gợi ý dùng trình duyệt khác |

- Câu "nói" chuyển sang chế độ **"đọc to rồi tự chấm"**: ẩn nút Ghi âm, Nghe bản ghi và khu Chấm tự động; còn **Nghe mẫu**, chữ để đọc
  và 3 nút tự đánh giá (S5.2), tính điểm như bình thường.
- Chế độ này giữ cho các câu "nói" còn lại của bài cho tới khi người học bấm **Thử lại** và ghi âm được.
- Không bao giờ chặn người học sang câu kế vì mic.

## Không làm (out of scope)

- Ghi âm, nghe bản ghi, tự đánh giá → **S5.1, S5.2**; chấm tự động → **S5.3**.
- Hướng dẫn riêng cho từng trình duyệt/hệ điều hành (hướng dẫn chung, một bộ chữ).
- Ghi nhớ lựa chọn "không dùng mic" qua các bài hoặc lưu vào cài đặt → **S8.2**.
- Kiểm tra mic trước khi vào bài.

## Dependencies

- **S5.1** (code trước): hạ tầng ghi âm và khối ghi âm; S5.4 bổ sung các trạng thái lỗi.
- **S5.2**: dạng bài "nói" và 3 mức tự đánh giá (chế độ "đọc to" dùng lại).
- **S5.3**: khu Chấm tự động (bị ẩn khi không có bản ghi).

## Capabilities

### New Capabilities
- `speak-no-mic`: hướng dẫn cấp quyền mic và chế độ "đọc to rồi tự chấm" khi không ghi âm được.

### Modified Capabilities
- (không có)

## Câu hỏi mở

1. **Phạm vi chế độ "đọc to rồi tự chấm"**: đề xuất giữ cả bài và có nút "Thử lại". Phương án khác: kiểm tra lại mic ở mỗi câu "nói". BA xác nhận.
2. **Nội dung hướng dẫn cấp quyền** (từng bước) cần BA duyệt câu chữ; spec chỉ cố định các ý chính trong bảng trên.
3. **Hai nguồn "mic bị chặn"**: người học từ chối ngay hộp xin quyền lần đầu, và quyền đã bị chặn từ trước. Đề xuất xử lý như nhau.
4. Chưa có e2e vì không giả được micro ổn định trên mọi trình duyệt; test với `recorder.service` giả trả các lỗi tương ứng.

## Impact

- Code mới: khu hướng dẫn mic và chế độ "đọc to rồi tự chấm" (+ test).
- Code sửa: `recorder.service.ts`, `useRecorder.ts` (phân loại lỗi), dạng bài "nói", i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
- Tầng test: Vitest + Testing Library cho hook và component, với dịch vụ ghi âm giả.
