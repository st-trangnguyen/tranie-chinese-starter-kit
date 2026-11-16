# Review log: S6.3 Viết không gợi ý

Biên bản phản biện spec giữa `ba`, `qa` và `dev-lead` (`/relay spec`). Dấu vết từng quyết định nằm ở `## Open Questions`
của `proposal.md`.

## Đợt 1 (PR #120, trước 2026-11-16)

Bốn vòng (3 vòng + 1 vòng bổ sung): `qa` approve, `dev-lead` approve. Người thật chốt đơn vị thẻ (Cách 1) và thứ tự làm (a).

## Đợt 2 (2026-11-16, sau review của người thật)

Rebase lên `main` (a140dde). Người thật chốt cho S6.2: khung có gợi ý hiện nét mờ của cả chữ, sai 3 lần thì làm nổi bật
nét đúng; so khớp nét do `hanzi-writer`, quy tắc đếm là service thuần.

| Vòng | Agent | Verdict | Finding chính |
|---|---|---|---|
| 1 | người thật | — | [major] AC1 "không hiện nét mờ" vô nghĩa khi khung có gợi ý vốn trống; [minor] "Bỏ dở thì chấm Quên" thiếu điều kiện thẻ; hai Scenario "Viết lại" trùng |
| 2 | qa | approve | [minor] thiếu case A11y cho nút "Viết lại không gợi ý"; Scenario bỏ dở chữ không có thẻ nên có "đổi sang chữ khác" |
| 2 | dev-lead | approve | [minor] Dependencies nên ghi rõ cần S6.2 bản mới và `hanzi-writer` do S6.1 thêm |

**Xử lý:** `ba` viết lại AC1 (không nét mờ cả chữ, không làm nổi bật nét đúng, bảng so sánh hai chế độ), thêm điều kiện
"từ một chữ có thẻ chiều viết" cho mọi Scenario chấm mức, gộp Scenario "Viết lại". `qa` chuyển phần Vitest sang Ghi chú,
cột Tự động chỉ còn `e2e`/`không`.

**Minor còn lại (không chặn):** các finding minor của vòng 2 ở bảng trên.
