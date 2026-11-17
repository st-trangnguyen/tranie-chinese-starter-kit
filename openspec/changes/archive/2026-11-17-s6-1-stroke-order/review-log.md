# Review log: S6.1 Xem thứ tự nét

Biên bản phản biện spec giữa `ba`, `qa` và `dev-lead` (`/relay spec`). Dấu vết từng quyết định nằm ở `## Open Questions`
của `proposal.md`.

## Đợt 1 (PR #118, trước 2026-11-16)

Hai vòng duyệt và một vòng xác nhận: `qa` approve, `dev-lead` approve. Các finding (THEN đo được, chữ thử 4 nét không có dữ
liệu, schema Zod, AC chép nguyên văn) đã xử lý, ghi trong Open Questions.

## Đợt 2 (2026-11-16, sau review của người thật)

Rebase lên `main` (a140dde). Người thật review PR và chốt hai quyết định.

| Vòng | Agent | Verdict | Finding chính |
|---|---|---|---|
| 1 | qa | block | [major] "chưa có nét nào hiện" hiểu hai cách (chữ mờ nền); [minor] chữ không hợp lệ, cột Tự động `Vitest`, thiếu case offline, thiếu review-log |
| 1 | dev-lead | block | [human] `hanzi-writer` chưa có trong `apps/web`; [major] thiếu trạng thái đang tải/lỗi tải, chữ từ địa chỉ không hợp lệ, offline; [minor] giảm chuyển động đổi giữa chừng |
| 2 | qa | approve | [minor] Open Questions còn chữ cũ; danh sách 9 chữ cố định trong Scenario offline; thứ tự TC-AC1-37..39 |
| 2 | dev-lead | approve | [minor] danh sách 9 chữ cố định; nhãn "Đang tải…" là key i18n mới; thứ tự TC |

**Người thật chốt:** thêm `hanzi-writer` làm runtime dependency mới của `apps/web` (S6.1 thêm, S6.2/S6.3 dùng lại); khối
animation hiện chữ mờ nền, chữ mờ không tính là nét đã vẽ.

**`ba` đề xuất, chờ người thật xác nhận:** "Đang tải…" khi tải; "Có lỗi xảy ra" + "Thử lại" khi tải lỗi/dữ liệu hỏng; chữ
rỗng, không phải chữ Hán hoặc nhiều chữ dùng chung thông báo "Chưa có dữ liệu nét cho chữ này."; mọi chữ có dữ liệu nét
xem được offline, chữ không có dữ liệu khi offline hiện thông báo không có dữ liệu; giảm chuyển động chỉ xét lúc mở màn.

**Minor còn lại (không chặn):** các finding minor của vòng 2 ở bảng trên.
