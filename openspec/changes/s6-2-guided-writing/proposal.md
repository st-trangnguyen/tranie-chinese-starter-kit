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
| Màn riêng luyện viết một chữ (lazy-load), cùng kiểu màn S6.1; route RESTful, tên cụ thể (planner đặt) | `pages/<feature>/containers/` |
| Khung viết + hiển thị báo sai, gợi ý (UI chỉ nhận props; vẽ nét và gửi nét viết ra qua callback; dùng lại ở S6.3 và bài tập `stroke-write` của lesson runner) | `shared/components/exercises/` |
| Trạng thái luyện viết: nét hiện tại, bộ đếm sai, hoàn thành; gọi service | `pages/<feature>/hooks/` |
| Bộ so khớp nét viết với nét đúng (hướng, thứ tự, hình dạng, dung sai) và quy tắc đếm sai liên tiếp / khi nào hiện gợi ý: **service thuần**, không nằm trong component hay hook (design.md chốt chi tiết) | `shared/services/` (Phần 2) |
| Nạp + validate dữ liệu nét của chữ (Zod, dùng lại schema của S6.1/S2.5) | `shared/services/` (Phần 1) |
| i18n (nhãn, thông báo), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Màn **riêng cho một chữ** (mỗi màn một chữ, như S6.1). Lối vào: nút "Tập viết" trên màn xem thứ tự nét của S6.1 (xem rồi viết, đúng mạch
  F7); màn có liên kết "Xem thứ tự nét" quay lại màn S6.1. Lối vào từ thẻ từ vựng hoặc bài học thuộc story khác.
- Người học viết từng nét lên **khung viết** bằng ngón tay hoặc chuột; hệ thống so với thứ tự và hình dạng nét đúng của chữ.
- Nét **sai** thì báo ngay (thông báo và nét bị xoá khỏi khung), người học viết lại nét đó. Sai nét gồm: sai thứ tự, sai hướng, sai hình dạng rõ ràng.
  Chạm một điểm hoặc nét quá ngắn thì bỏ qua, không tính là sai.
- **Sai 3 lần liên tiếp** ở cùng một nét thì hiện **gợi ý** nét đó (nét đúng mờ, có điểm bắt đầu và mũi tên chỉ hướng). Quy tắc đếm:

| Tình huống | Bộ đếm sai của nét hiện tại |
|---|---|
| Viết sai nét hiện tại | Tăng 1 |
| Chạm một điểm / nét quá ngắn | Không đổi (bỏ qua) |
| Viết đúng nét hiện tại | Về 0, chuyển sang nét kế |
| Sai lần thứ 3 liên tiếp | Hiện gợi ý nét đó |
| Sai tiếp khi gợi ý đang hiện | Gợi ý vẫn hiện, không đếm lại |

- Viết đúng hết các nét thì báo hoàn thành chữ, người học ở lại màn và có nút "Viết lại". S6.2 không ghi điểm, không ghi tiến độ.
- Người không dùng được chuột hoặc cảm ứng: viết là thao tác trỏ nên không thay bằng bàn phím được; khung viết vẫn nhận focus bàn phím với nhãn
  đọc được, và người học xem thứ tự nét qua liên kết "Xem thứ tự nét" (S6.1).

## Không làm (out of scope)

- Animation thứ tự nét và nút phát lại → **S6.1**.
- Viết không gợi ý, chấm điểm và tính vào tiến độ → **S6.3**.
- Dữ liệu nét của chữ và cảnh báo thiếu dữ liệu khi build → **S2.5**.
- Nhận dạng chữ viết tay tự do (chỉ so với thứ tự nét đã biết).
- Lưu lịch sử luyện viết hoặc thống kê nét hay sai; ghi điểm hoặc tiến độ (S6.3 lo).
- Luyện lần lượt nhiều chữ của một từ: MVP mỗi màn một chữ.
- Lối vào từ thẻ từ vựng hoặc bài tập `stroke-write` trong bài học: thuộc story có màn đó (S7.1, S6.3); S6.2 chỉ dựng màn và khung viết dùng lại được.
- Viết bằng bàn phím hoặc công nghệ hỗ trợ khác: ngoài phạm vi.

## Dependencies

- **S2.5**: dữ liệu nét của các chữ trong nội dung.
- **S6.1**: màn xem thứ tự nét, schema Zod dữ liệu nét và khối hiển thị nét. S6.1 chưa merge nên **S6.2 chờ S6.1 merge** rồi mới
  cắt nhánh code; spec này viết trước được vì không đổi spec của S6.1.
- Thư viện nét chữ (đã nêu trong docs/03-architecture.md) chưa có trong `apps/web/package.json`; S6.1 hoặc S2.5 là story thêm vào trước,
  S6.2 dùng lại. Không phải dependency mới ngoài kiến trúc.

## Capabilities

### New Capabilities
- `stroke-guided-writing`: viết từng nét trên khung viết, báo sai ngay, gợi ý sau 3 lần sai liên tiếp.

### Modified Capabilities
- (không có)

## Open Questions

- [x] **Đếm lại khi đúng?** → viết đúng thì bộ đếm về 0; "liên tiếp" nghĩa là không có nét đúng xen giữa (Scenario "Viết đúng xen giữa thì đếm lại") (ba đề xuất, chờ người thật xác nhận)
- [x] **Đếm riêng từng nét?** → có; bộ đếm thuộc nét hiện tại, sang nét kế thì bắt đầu từ 0 (Scenario "Nét kế sai 3 lần thì gợi ý nét kế") (ba đề xuất, chờ người thật xác nhận)
- [x] **Gợi ý giữ đến khi nào?** → giữ đến khi viết đúng nét đó; sai tiếp thì gợi ý vẫn hiện, không đếm lại (Scenario "Gợi ý vẫn hiện nếu tiếp tục sai") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thế nào là "sai nét"?** → sai thứ tự (viết nét sau khi đang chờ nét trước), sai hướng, sai hình dạng rõ ràng đều là sai; con số dung sai để design.md, không đưa vào spec (Scenario "Viết ngược hướng thì sai", "Viết nét của một nét khác thì sai") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chạm một điểm / nét quá ngắn?** → bỏ qua, không tính sai, không tăng bộ đếm, không hiện thông báo (Scenario "Chạm một điểm thì bỏ qua") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ không có dữ liệu nét** → ẩn khung viết, hiện "Chưa có hướng dẫn viết cho chữ này." (cùng quyết định S6.1: ẩn khối và thông báo) (ba đề xuất, chờ người thật xác nhận)
- [x] **Cách hiện gợi ý** → nét đúng mờ trên khung, có điểm bắt đầu và mũi tên chỉ hướng; hiện tĩnh khi bật giảm chuyển động, không nháy (ba đề xuất, chờ người thật xác nhận)
- [x] **Điểm vào luyện viết** → màn riêng một chữ như S6.1, vào từ nút "Tập viết" trên màn S6.1; lối vào từ thẻ từ vựng và bài tập `stroke-write` thuộc story khác, dùng lại khung viết (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nhiều chữ** → MVP một chữ mỗi màn, không luyện lần lượt (ba đề xuất, chờ người thật xác nhận)
- [x] **Viết xong chữ thì sao** → ở lại màn, báo hoàn thành, có nút "Viết lại"; không tự đi tiếp bài, không ghi điểm hay tiến độ (S6.3 lo) (ba đề xuất, chờ người thật xác nhận)
- [x] **Bàn phím / công nghệ hỗ trợ** → khung viết nhận focus bàn phím, có nhãn đọc được và viền focus nhìn thấy; viết là thao tác trỏ, đường thay thế là xem thứ tự nét và gợi ý qua S6.1 (ba đề xuất, chờ người thật xác nhận)
- [x] **Thứ tự S6.1/S6.2 và thư viện nét** → S6.2 chờ S6.1 merge; thư viện nét chữ đã có trong kiến trúc nên không phải dependency mới (xem Dependencies)

## Impact

- Code mới: màn luyện viết, khung viết, hook luyện viết, service so khớp nét + quy tắc đếm sai (+ test).
- Code sửa: i18n, style; thêm nút "Tập viết" vào màn S6.1 (sau khi S6.1 merge); dùng lại khối hiển thị nét và schema Zod của S6.1.
- Thư viện nét chữ thuộc stack đã nêu trong docs/03-architecture.md, sẽ có trong `apps/web` khi S6.1/S2.5 merge; S6.2 không thêm dependency mới.
- Không đổi schema nội dung, không đổi IndexedDB.
- Tầng test: Vitest cho service so khớp nét và quy tắc đếm; Testing Library cho khung viết với bộ so nét giả. Chưa e2e vì vẽ bằng cử chỉ khó ổn định.
