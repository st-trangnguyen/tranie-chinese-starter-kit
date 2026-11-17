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
| Màn riêng xem thứ tự nét của một chữ (lazy-load) | `pages/<feature>/containers/`, route theo chuẩn RESTful, tên cụ thể (planner đặt) |
| Nạp + validate dữ liệu nét của một chữ (Zod trong `@csk/shared`) | `shared/services/` (use case, đi qua lớp nạp nội dung); component/hook **không** đọc trực tiếp file JSON |
| State phát/phát lại, nhận biết giảm chuyển động | `pages/<feature>/hooks/` |
| Khối hiển thị animation + nút Phát lại + thứ tự nét tĩnh | `shared/components/` (dùng lại ở S6.2) |
| i18n (nhãn nút, thông báo), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Với một chữ Hán có dữ liệu nét, người học xem được animation **vẽ từng nét theo đúng thứ tự viết**.
- Người học **phát lại** animation bất cứ lúc nào (kể cả khi đang phát hoặc sau khi phát xong).
- Trong lúc vẽ, khối animation hiện chữ mờ của cả chữ làm nền (giống khung viết S6.2).
- Màn có trạng thái đang tải, lỗi tải (có "Thử lại"), chữ không có dữ liệu nét hoặc không hợp lệ, và vẫn xem được khi offline.
- Thêm thư viện vẽ và chấm nét làm runtime dependency của `apps/web` (S6.2/S6.3 dùng lại).

## Không làm (out of scope)

- Tập viết trên khung, báo sai nét, gợi ý → **S6.2**; viết không gợi ý → **S6.3**.
- Tạo dữ liệu nét và cảnh báo thiếu dữ liệu lúc build → **S2.5**.
- Xem lần lượt nhiều chữ của một từ: MVP mỗi màn một chữ.
- Lối vào màn (nút trên thẻ từ vựng, liên kết từ bài "Nét cơ bản và thứ tự nét" của S7.1 AC2): thuộc story có màn đó; S6.1 chỉ dựng màn.
- Tốc độ phát tùy chỉnh, tạm dừng, xem từng nét một (AC không yêu cầu).
- Tên nét, quy tắc thứ tự nét bằng chữ.

## Dependencies

- **Dependency mới (người thật chốt)**: `hanzi-writer` là runtime dependency mới của `apps/web`, đã ghi ở docs/03-architecture.md (stack "Viết chữ"). S6.1 là story thêm nó vào `apps/web/package.json`; S6.2 và S6.3 dùng lại.

- **S2.5** (code trước): tạo dữ liệu nét các chữ dùng trong nội dung.
- **Schema Zod cho dữ liệu nét** (`@csk/shared`, CLAUDE.md §0.4): S2.5 chỉ nói build lấy dữ liệu, chưa nêu schema. Đưa vào phạm vi S6.1 (S6.1 là nơi đọc dữ liệu trong app); nếu S2.5 đã làm trước thì dùng lại.

## Capabilities

### New Capabilities
- `stroke-order`: xem animation thứ tự nét của một chữ Hán và phát lại.

### Modified Capabilities
- (không có)

## Open Questions

- [x] **Màn chứa animation** → màn riêng cho một chữ, dùng lại được ở S6.2; lối vào từ thẻ từ vựng hoặc bài Nhập môn S7.1 AC2 thuộc story khác (ba đề xuất, chờ người thật xác nhận)
- [x] **Tự phát hay bấm mới phát** → tự phát một lần khi mở, không tự lặp (Scenario "Chữ hiện animation và tự phát khi mở", "Animation chỉ tự phát một lần") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ không có dữ liệu nét** → không hiện khối animation, ẩn nút "Phát lại", hiện "Chưa có dữ liệu nét cho chữ này." (ba đề xuất, chờ người thật xác nhận)
- [x] **Từ nhiều chữ** → MVP một chữ mỗi màn, không xem lần lượt (ghi vào "Không làm") (ba đề xuất, chờ người thật xác nhận)
- [x] **Giảm chuyển động** → hiện thứ tự nét tĩnh có đánh số, ẩn nút "Phát lại" (không còn gì để phát lại) (ba đề xuất, chờ người thật xác nhận)
- [x] **THEN đo được (finding 2)** → viết lại theo thời điểm xác định ("ngay sau khi bấm chưa có nét nào hiện", "sau mỗi bước tăng đúng một nét") để dựng test trên dữ liệu nét giả
- [x] **Chữ 4 nét không có dữ liệu (finding 3)** → đổi sang "白" (5 nét, có trong `strokes/`)
- [x] **Zod cho dữ liệu nét (finding 4)** → đưa schema vào phạm vi S6.1 (xem Dependencies)
- [x] **hanzi-writer (finding 5)** → ~~không phải dependency mới~~ (sai, đã sửa): thêm `hanzi-writer` làm runtime dependency mới của `apps/web`; S6.1 thêm, S6.2/S6.3 dùng lại. Tên thư viện chỉ ở Dependencies/Impact, không vào `specs/` (người thật chốt)
- [x] **Chữ mờ nền trong animation** → khối animation hiện chữ mờ của cả chữ làm nền trong lúc vẽ (giống S6.2); chữ mờ không tính là nét đã vẽ; THEN "chưa có nét nào hiện" đổi thành "chưa có nét nào được vẽ (chỉ có chữ mờ nền)", cả ở Phát lại; giảm chuyển động giữ nét tĩnh đánh số (người thật chốt)
- [x] **Đang tải / lỗi tải dữ liệu nét (vòng duyệt, finding 1)** → đang tải hiện "Đang tải…"; lỗi tải (không tải được, dữ liệu hỏng, sai cấu trúc) hiện "Có lỗi xảy ra" + nút "Thử lại" (dùng lại nhãn lỗi chung đã có), khác với "Chưa có dữ liệu nét cho chữ này."; Requirement "Đang tải dữ liệu nét" và "Lỗi tải dữ liệu nét" (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ không hợp lệ từ địa chỉ (vòng duyệt, finding 2)** → rỗng, không phải chữ Hán ("abc"), nhiều chữ ("你好") đều hiện cùng thông báo "Chưa có dữ liệu nét cho chữ này.", không hiện khối animation, không có "Phát lại"; bảng trong Requirement "Chữ chưa có dữ liệu nét hoặc không hợp lệ" (ba đề xuất, chờ người thật xác nhận)
- [x] **Offline (vòng duyệt, finding 3)** → thêm Requirement "Xem thứ tự nét khi không có mạng": đã mở app một lần, mất mạng, chữ "人" vẫn phát đủ 2 nét (khớp docs/03 §7 precache và S1.2-AC2) (ba đề xuất, chờ người thật xác nhận)
- [x] **Giảm chuyển động đổi giữa chừng (vòng duyệt, finding 4)** → chỉ xét lúc mở màn; đổi cài đặt khi đang ở màn thì giữ nguyên cho tới khi mở lại màn; thêm Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **Offline mà mở chữ chưa có dữ liệu nét, ví dụ "龘" (qa, test-cases)** → hiện "Chưa có dữ liệu nét cho chữ này." như khi online, không hiện "Có lỗi xảy ra"/"Thử lại"; thêm Scenario "Chữ không có dữ liệu nét khi offline" (ba đề xuất, chờ người thật xác nhận)
- [x] **Phạm vi offline "các chữ có trong bài" chưa khớp dữ liệu build (qa, test-cases)** → đổi thành "mọi chữ có dữ liệu nét trong bản app đang dùng" (hiện là 人, 你, 八, 十, 四, 好, 爸, 白, 百, đều từ nội dung S2.5); thêm Scenario "Mọi chữ có dữ liệu nét đều xem được khi offline" (ba đề xuất, chờ người thật xác nhận)
- [x] **ID AC1 cho Requirement mở rộng (vòng duyệt, finding 5)** → giữ ID `S6.1-AC<k>` theo quy ước bắt buộc; các Scenario mở rộng (một chữ, không có dữ liệu/không hợp lệ, đang tải/lỗi, offline, giảm chuyển động) đều là cách hiện animation nên gắn AC1; chỉ thao tác phát lại gắn AC2
- [x] **AC chép nguyên văn, nút luôn bấm được (finding 6)** → câu đầu mỗi Requirement là AC nguyên văn; phần mở rộng ở câu riêng

## Impact

- Code mới: màn xem thứ tự nét (đang tải, lỗi + thử lại, không có dữ liệu), khối animation có chữ mờ nền + nút Phát lại + thứ tự nét tĩnh, schema Zod dữ liệu nét (+ test).
- **Dependency mới**: thêm `hanzi-writer` vào `apps/web` (runtime), theo docs/03-architecture.md; S6.2/S6.3 dùng lại.
- Offline: dữ liệu nét của mọi chữ có trong bản build phải nằm trong precache (docs/03 §7, S1.2-AC2); khi offline phải phân biệt được "chữ không có dữ liệu nét" với "lỗi tải" mà không cần mạng.
- Không đổi schema nội dung, không đổi IndexedDB.
- Tầng test: Vitest + Testing Library với dữ liệu nét giả; e2e cho thao tác Phát lại và xem offline.
