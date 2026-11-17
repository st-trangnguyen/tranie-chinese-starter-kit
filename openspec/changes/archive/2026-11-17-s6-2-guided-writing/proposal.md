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
| Khung viết (nét mờ cả chữ, nét đã viết đúng, **lớp phủ gợi ý tĩnh tối thiểu tự vẽ** từ hình nét hiện tại trong dữ liệu nét đã validate) + báo sai: UI chỉ nhận props, **không gọi service** (CLAUDE.md §2); báo sự kiện đúng/sai/bỏ qua của từng nét ra ngoài qua callback; dùng lại ở S6.3 và bài tập `stroke-write` | `shared/components/exercises/` |
| Adapter bọc thư viện vẽ và chấm nét đã nêu ở docs/03-architecture.md: **thư viện so khớp nét** (đúng/sai thứ tự, hướng, hình dạng), adapter chuyển kết quả thành sự kiện đúng/sai/bỏ qua; gợi ý của thư viện chỉ là nét sáng lên rồi tự tắt nên không dùng (planner chốt vị trí đúng layer, ví dụ trong khung viết dùng chung hoặc `core/`) | `shared/components/exercises/` hoặc `core/` (design.md chốt) |
| Trạng thái luyện viết: nét hiện tại, bộ đếm sai, gợi ý, hoàn thành; **nối component với service**: nhận sự kiện từ khung viết, gọi service, trả props xuống | `pages/<feature>/hooks/` |
| Quy tắc đếm sai liên tiếp theo từng nét và khi nào hiện/ẩn gợi ý: **service thuần** nhận sự kiện đúng/sai/bỏ qua, không chứa so khớp hình học | `shared/services/` (Phần 2) |
| Nạp + validate dữ liệu nét của chữ (Zod, dùng lại schema của S6.1/S2.5) | `shared/services/` (Phần 1) |
| Nút "Tập viết" trên màn xem thứ tự nét của S6.1 | `pages/<feature của S6.1>/components/` hoặc container S6.1 |
| i18n (nhãn, thông báo), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Màn **riêng cho một chữ** (mỗi màn một chữ, như S6.1). Lối vào: nút "Tập viết" trên màn xem thứ tự nét của S6.1 (xem rồi viết, đúng mạch
  F7); màn có liên kết "Xem thứ tự nét" quay lại màn S6.1. Lối vào từ thẻ từ vựng hoặc bài học thuộc story khác.
- **Khung viết hiện sẵn nét mờ của cả chữ** để người học viết đè lên (tập tô) bằng ngón tay hoặc chuột; nét viết đúng được giữ lại trên
  khung. Hệ thống so với thứ tự, hướng và hình dạng nét đúng của chữ (việc so khớp do thư viện vẽ và chấm nét đảm nhiệm, xem Dependencies).
- Nét **sai** thì báo ngay (thông báo và nét bị xoá khỏi khung), người học viết lại nét đó. Sai nét gồm: sai thứ tự, sai hướng, sai hình dạng rõ ràng.
  Chạm một điểm hoặc nét quá ngắn thì bỏ qua, không tính là sai.
- **Sai 3 lần liên tiếp** ở cùng một nét thì hiện **gợi ý**: nét đúng hiện tại được làm nổi bật trên khung, phân biệt được với nét mờ của
  cả chữ, và **giữ nguyên đến khi người học viết đúng nét đó**. Gợi ý là một lớp phủ tĩnh tối thiểu tự vẽ trong khung viết dùng chung, lấy
  từ hình nét hiện tại trong dữ liệu nét đã validate (thư viện vẽ và chấm nét chỉ có gợi ý sáng lên rồi tự tắt, không giữ được); khi bật
  giảm chuyển động thì gợi ý tĩnh, không nháy. Quy tắc đếm (service thuần):

| Tình huống | Bộ đếm sai của nét hiện tại |
|---|---|
| Viết sai nét hiện tại | Tăng 1 |
| Chạm một điểm / nét quá ngắn | Không đổi (bỏ qua) |
| Viết đúng nét hiện tại | Về 0, chuyển sang nét kế |
| Sai lần thứ 3 liên tiếp | Hiện gợi ý nét đó |
| Sai tiếp khi gợi ý đang hiện | Gợi ý vẫn hiện, không đếm lại |

- Khi bật giảm chuyển động, mọi hiệu ứng chuyển động trên khung viết (nét đúng hiện dần, nét viết mờ dần, nhấp sáng cả chữ khi hoàn thành)
  tắt hoặc hiện tức thì.
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
- Điểm bắt đầu và mũi tên chỉ hướng trên gợi ý; gợi ý có chuyển động (gợi ý chỉ là lớp phủ tĩnh tối thiểu).
- Tự viết bộ so khớp nét (hình học, dung sai): dùng thư viện vẽ và chấm nét (xem Dependencies).

## Dependencies

- **S2.5**: dữ liệu nét của các chữ trong nội dung.
- **S6.1**: màn xem thứ tự nét, schema Zod dữ liệu nét và khối hiển thị nét. S6.1 chưa merge nên **S6.2 chờ S6.1 merge** rồi mới
  cắt nhánh code; spec này viết trước được vì không đổi spec của S6.1.
- **Dependency mới `hanzi-writer`** (runtime của `apps/web`): hiện `apps/web/package.json` chưa có (repo chỉ có `hanzi-writer-data` dùng lúc
  build nội dung). Người thật đã duyệt thêm `hanzi-writer`; **S6.1 thêm vào**, S6.2 dùng lại, không thêm lần nữa (người thật chốt).

## Capabilities

### New Capabilities
- `stroke-guided-writing`: viết từng nét trên khung viết có nét mờ cả chữ, báo sai ngay, gợi ý sau 3 lần sai liên tiếp.

### Modified Capabilities
- `stroke-order` (của S6.1, chưa merge): thêm nút "Tập viết" trên màn xem thứ tự nét, mở màn luyện viết của chữ đó. Viết dưới dạng
  `## ADDED Requirements` trong `specs/stroke-order/spec.md` của change này; không đổi Requirement nào của S6.1.

## Open Questions

- [x] **Đếm lại khi đúng / đếm riêng từng nét?** → bộ đếm thuộc nét hiện tại; viết đúng thì sang nét kế và nét kế bắt đầu từ 0, nên "liên tiếp" nghĩa là không có nét đúng xen giữa (Scenario "Bộ đếm sai tính riêng từng nét") (ba đề xuất, chờ người thật xác nhận)
- [x] **Gợi ý giữ đến khi nào?** → giữ đến khi viết đúng nét đó; sai tiếp thì gợi ý vẫn hiện, không đếm lại (Scenario "Gợi ý vẫn hiện nếu tiếp tục sai") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thế nào là "sai nét" và ai so khớp?** → sai thứ tự, sai hướng, sai hình dạng rõ ràng đều là sai; việc so khớp (kể cả dung sai) do thư viện vẽ và chấm nét đã nêu ở docs/03-architecture.md đảm nhiệm, bọc qua adapter; quy tắc đếm sai liên tiếp và hiện/ẩn gợi ý là service thuần ở `shared/services/` (Phần 2) nhận sự kiện đúng/sai; hook nối khung viết với service (Scenario "Viết ngược hướng thì sai", "Viết nét của một nét khác thì sai"; bảng Layer đích) (người thật chốt)
- [x] **Chạm một điểm / nét quá ngắn?** → bỏ qua, không tính sai, không tăng bộ đếm, không hiện thông báo (Scenario "Chạm một điểm thì bỏ qua") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ không có dữ liệu nét** → ẩn khung viết, hiện đúng câu của S6.1 "Chưa có dữ liệu nét cho chữ này." (cùng quyết định S6.1) (ba đề xuất, chờ người thật xác nhận)
- [x] **Khung viết trống hay có nét mờ?** → khung hiện sẵn nét mờ của cả chữ để viết đè lên (tập tô); nét viết đúng được giữ lại trên khung (Scenario "Hiện khung viết có nét mờ của cả chữ", "Viết đúng nét thì sang nét kế", "Viết lại sau khi hoàn thành") (người thật chốt)
- [x] **Cách hiện gợi ý** → thư viện vẽ và chấm nét chỉ có gợi ý sáng lên rồi tự tắt, không giữ được và không tĩnh, nên dùng **một lớp phủ gợi ý tĩnh tối thiểu, tự vẽ** từ hình nét hiện tại trong dữ liệu nét đã validate, đặt trong khung viết dùng chung; nét đúng hiện tại được làm nổi bật, phân biệt được với nét mờ cả chữ, giữ đến khi viết đúng; tĩnh khi bật giảm chuyển động; bỏ điểm bắt đầu và mũi tên chỉ hướng; service quyết định khi nào hiện lớp phủ (Scenario "Sai 3 lần liên tiếp thì hiện gợi ý", "Viết đúng thì gợi ý ẩn", "Gợi ý không phụ thuộc chuyển động") (người thật chốt)
- [x] **Điểm vào luyện viết** → màn riêng một chữ như S6.1, vào từ nút "Tập viết" trên màn S6.1; lối vào từ thẻ từ vựng và bài tập `stroke-write` thuộc story khác, dùng lại khung viết (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nhiều chữ** → MVP một chữ mỗi màn, không luyện lần lượt (ba đề xuất, chờ người thật xác nhận)
- [x] **Viết xong chữ thì sao** → ở lại màn, báo hoàn thành, có nút "Viết lại"; không tự đi tiếp bài, không ghi điểm hay tiến độ (S6.3 lo) (ba đề xuất, chờ người thật xác nhận)
- [x] **Bàn phím / công nghệ hỗ trợ** → khung viết nhận focus bàn phím, có nhãn đọc được và viền focus nhìn thấy; viết là thao tác trỏ, đường thay thế là xem thứ tự nét và gợi ý qua S6.1 (ba đề xuất, chờ người thật xác nhận)
- [x] **Thứ tự S6.1/S6.2 và thư viện nét** → S6.2 chờ S6.1 merge; `hanzi-writer` là runtime dependency **mới** của `apps/web` (chưa có trong `package.json`, chỉ có `hanzi-writer-data` lúc build), người thật đã duyệt, S6.1 thêm, S6.2 dùng lại (xem Dependencies) (người thật chốt)
- [x] **Finding: Scenario "Viết đúng xen giữa thì đếm lại" trùng với "Nét kế sai 3 lần thì gợi ý nét kế"** (viết đúng đã sang nét kế nên bộ đếm nét cũ không dùng lại) → gộp thành một Scenario "Bộ đếm sai tính riêng từng nét", giữ nguyên quy tắc
- [x] **Finding: nút "Tập viết" thêm hành vi cho capability `stroke-order` nhưng Capabilities ghi không sửa capability nào** → thêm delta `specs/stroke-order/spec.md` (`## ADDED Requirements` "Nút Tập viết trên màn xem thứ tự nét"); chuyển Scenario "Vào luyện viết từ màn xem thứ tự nét" sang đó; bên `stroke-guided-writing` chỉ còn Scenario "Màn luyện viết có liên kết về thứ tự nét"; cập nhật Capabilities và Impact
- [x] **Nút "Tập viết" khi chữ không có dữ liệu nét** → không hiện nút (khớp S6.1 ẩn khối animation và nút "Phát lại") (Scenario "Không có nút Tập viết khi chữ không có dữ liệu nét") (ba đề xuất, chờ người thật xác nhận)
- [x] **Finding: thông báo thiếu dữ liệu nét lệch S6.1** → dùng đúng câu S6.1 "Chưa có dữ liệu nét cho chữ này." (Scenario "Chữ không có dữ liệu nét")
- [x] **Finding a11y: lần sai liên tiếp có cùng nội dung có được đọc lại không?** → có; thêm Scenario "Lần sai liên tiếp sau cũng được đọc lại"
- [x] **Finding: Scenario "Chữ không có dữ liệu nét" không có lối vào trên giao diện** (nút "Tập viết" bị ẩn với chữ đó) → ghi rõ điều kiện đầu: màn được mở trực tiếp bằng địa chỉ trang hoặc từ lối vào của story khác
- [x] **Finding: giảm chuyển động chỉ áp cho gợi ý** → thêm Requirement "Khung viết tôn trọng giảm chuyển động" và Scenario "Giảm chuyển động trên khung viết": khi bật giảm chuyển động, nét đúng hiện dần, nét viết mờ dần, nhấp sáng khi hoàn thành đều tắt hoặc hiện tức thì (ba đề xuất, chờ người thật xác nhận)
- [x] **Finding: thư viện chấm cả nét ngắn từ 2 điểm** → giữ spec ("nét quá ngắn" bỏ qua); ngưỡng độ dài để planner đặt ở design.md, adapter lọc trước khi chấm

## Impact

- Code mới: màn luyện viết, khung viết, adapter bọc thư viện vẽ và chấm nét, hook luyện viết, service quy tắc đếm sai và gợi ý (+ test).
- Capability sửa: `stroke-order` (thêm Requirement nút "Tập viết"). Code sửa: i18n, style; thêm nút "Tập viết" vào màn S6.1 (sau khi S6.1
  merge); dùng lại khối hiển thị nét và schema Zod của S6.1.
- Dependency: dùng `hanzi-writer` (runtime dependency mới của `apps/web`, người thật đã duyệt, do S6.1 thêm); PR của S6.2 không đổi
  `package.json` (người thật chốt).
- Không đổi schema nội dung, không đổi IndexedDB.
- Tầng test: Vitest cho service quy tắc đếm sai và gợi ý; Testing Library cho khung viết, hook và màn với adapter thư viện giả (phát sự kiện
  đúng/sai/bỏ qua). Chưa e2e vì vẽ bằng cử chỉ khó ổn định.
