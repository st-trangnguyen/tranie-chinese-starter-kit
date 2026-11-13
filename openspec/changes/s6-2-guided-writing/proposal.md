# Proposal: S6.2 Viết theo nét có gợi ý

Story **S6.2 Viết theo nét có gợi ý · F7** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s62-viết-theo-nét-có-gợi-ý--f7)) ·
GitHub issue [#35](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/35). Bản 0.1.

Refs #35

## Why

Là người học, tôi muốn tập viết từng nét có hướng dẫn để nhớ cách viết. Sau khi xem thứ tự nét (S6.1), người học tự viết
lại chữ trên khung viết, được báo ngay khi sai nét và được gợi ý khi sai nhiều lần liên tiếp để không bị kẹt.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Khung viết và hiển thị báo sai, gợi ý nét (UI, chỉ nhận props) | `shared/components/` (dùng chung với S6.1/S6.3) |
| Trạng thái luyện viết: nét hiện tại, đếm lần sai liên tiếp | `pages/<feature>/hooks/` gọi service |
| Quy tắc đếm sai liên tiếp và khi nào hiện gợi ý (thuần) | `shared/services/` (Phần 2) |
| Nạp dữ liệu nét của chữ (từ S2.5) | `shared/services/` (Phần 1) |
| i18n (nhãn, thông báo), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Người học viết từng nét lên **khung viết** bằng ngón tay hoặc chuột; hệ thống so với thứ tự và hình dạng nét đúng của chữ.
- Nét **sai** thì báo ngay (thông báo và nét bị xoá khỏi khung), người học viết lại nét đó.
- **Sai 3 lần liên tiếp** ở cùng một nét thì hiện **gợi ý** nét đó (chỉ vị trí và hướng nét đúng). Quy tắc đếm:

| Tình huống | Bộ đếm sai của nét hiện tại |
|---|---|
| Viết sai nét hiện tại | Tăng 1 |
| Viết đúng nét hiện tại | Về 0, chuyển sang nét kế |
| Sai lần thứ 3 liên tiếp | Hiện gợi ý nét đó |
| Sang nét mới | Bắt đầu đếm lại từ 0 |

- Viết đúng hết các nét thì báo hoàn thành chữ.

## Không làm (out of scope)

- Animation thứ tự nét và nút phát lại → **S6.1**.
- Viết không gợi ý, chấm điểm và tính vào tiến độ → **S6.3**.
- Dữ liệu nét của chữ và cảnh báo thiếu dữ liệu khi build → **S2.5**.
- Nhận dạng chữ viết tay tự do (chỉ so với thứ tự nét đã biết).
- Lưu lịch sử luyện viết hoặc thống kê nét hay sai.

## Dependencies

- **S2.5**: dữ liệu nét của các chữ trong nội dung.
- **S6.1**: màn xem thứ tự nét; S6.2 dùng lại cách hiển thị nét.

## Capabilities

### New Capabilities
- `stroke-guided-writing`: viết từng nét trên khung viết, báo sai ngay, gợi ý sau 3 lần sai liên tiếp.

### Modified Capabilities
- (không có)

## Open Questions

- [ ] **Đếm lại khi đúng?** Đề xuất: viết đúng thì bộ đếm về 0 ("liên tiếp" nghĩa là không có nét đúng xen giữa). BA xác nhận.
- [ ] **Sang nét khác?** Đề xuất: bộ đếm tính riêng cho từng nét, sang nét mới đếm lại từ 0 (vì chỉ sang nét mới khi viết đúng nét trước). BA xác nhận.
- [ ] **Sau khi hiện gợi ý** gợi ý giữ đến khi người học viết đúng nét đó; nếu vẫn sai thì tiếp tục hiện, không đếm lại. Đề xuất như vậy, BA xác nhận.
- [ ] **Thế nào là "sai nét"**: đề xuất sai khi nét viết không khớp nét kế tiếp đúng (hướng hoặc hình dạng, có dung sai). Mức dung sai cần BA/Dev chốt; spec không cố định số.
- [ ] **Chữ không có dữ liệu nét** (S2.5 chỉ cảnh báo lúc build): đề xuất ẩn khung viết và báo chữ này chưa có hướng dẫn viết. BA xác nhận.
- [ ] **Cách hiện gợi ý**: đề xuất hiện nét đúng mờ trên khung, nháy nhẹ; tôn trọng giảm chuyển động. BA duyệt.

## Impact

- Code mới: khung viết, hook luyện viết, service quy tắc đếm sai (+ test).
- Code sửa: i18n, style; có thể dùng chung thành phần hiển thị nét với S6.1.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency (thư viện nét chữ đã có từ S2.5/S6.1).
- Tầng test: Vitest cho quy tắc đếm; Testing Library cho khung viết với bộ so nét giả. Chưa e2e vì vẽ bằng cử chỉ khó ổn định.
