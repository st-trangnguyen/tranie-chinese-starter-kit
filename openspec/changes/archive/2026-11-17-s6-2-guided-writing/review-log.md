# Review log: S6.2 Viết theo nét có gợi ý

Biên bản phản biện spec giữa `ba`, `qa` và `dev-lead` (`/relay spec`). Dấu vết từng quyết định nằm ở `## Open Questions`
của `proposal.md`.

## Đợt 1 (PR #119, trước 2026-11-16)

Hai vòng: `qa` approve, `dev-lead` approve.

## Đợt 2 (2026-11-16, sau review của người thật)

Rebase lên `main` (a140dde).

| Vòng | Agent | Verdict | Finding chính |
|---|---|---|---|
| 1 | người thật | — | [major] khung có gợi ý trống làm AC1 của S6.3 vô nghĩa; [major] bộ so khớp nét tự viết lệch docs/03; [minor] Scenario đếm lại trùng, thiếu delta `stroke-order` cho nút "Tập viết", thông báo thiếu dữ liệu lệch S6.1, thông báo sai lặp lại không được đọc lại |
| 2 | qa | block | [major] gợi ý giữ nguyên và tĩnh không làm được với gợi ý của thư viện khi cấm tự vẽ lớp phủ; [minor] lối vào chữ không có dữ liệu, ngưỡng nét mờ, nét "vài px" |
| 2 | dev-lead | block | [blocker] như trên, đã kiểm mã nguồn `hanzi-writer` 3.7.3 (`highlightStroke` sáng lên rồi tắt); [major] dependency lệch S6.1 trên origin; [minor] nét ngắn 2 điểm, hiệu ứng chuyển động khác của thư viện |
| 3 | qa | approve | [minor] câu "tĩnh khi bật giảm chuyển động" nên là "luôn tĩnh"; tiêu chí "màu nhấn"; thứ tự TC-AC1-31/32 |
| 3 | dev-lead | approve | không có |

**Người thật chốt:** khung có gợi ý hiện nét mờ của cả chữ; gợi ý sau 3 lần sai làm nổi bật nét đúng (bỏ điểm bắt đầu và
mũi tên); so khớp nét do `hanzi-writer` qua adapter (runtime dependency mới, S6.1 thêm), quy tắc đếm sai và hiện/ẩn gợi ý là
service thuần; gợi ý là lớp phủ tĩnh tối thiểu tự vẽ từ dữ liệu nét đã validate, giữ đến khi viết đúng.

**`ba` đề xuất, chờ người thật xác nhận:** màn xem thứ tự nét của chữ không có dữ liệu nét không hiện nút "Tập viết"; khi bật
giảm chuyển động các hiệu ứng trên khung viết tắt hoặc hiện tức thì.

**Phụ thuộc:** S6.2 cần PR spec S6.1 (bản thêm `hanzi-writer`) merge trước.

**Minor còn lại (không chặn):** các finding minor của vòng 3 ở bảng trên.
