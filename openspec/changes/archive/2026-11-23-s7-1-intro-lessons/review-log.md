# Review log: S7.1 Soạn 12 bài Nhập môn

Biên bản phản biện spec giữa `ba`, `qa` và `dev-lead` (`/relay spec`). Dấu vết từng quyết định nằm ở `## Open Questions`
của `proposal.md`.

## Đợt 1 (2026-11-16)

**Người thật chốt trước vòng duyệt:** gộp bài tập viết chữ vào S7.1 (dạng viết trong màn bài, câu viết ở bài 10–11, lối
vào màn thứ tự nét / luyện viết như S6.1/S6.2 đã ghi). S7.1 phụ thuộc S6.1 và S6.2 code xong trước.

| Vòng | Agent | Verdict | Finding chính |
|---|---|---|---|
| 1 | qa | block | [major] Scenario dùng "人", "十" nhưng nội dung không đòi hai chữ này; thiếu trạng thái đang tải / lỗi tải dữ liệu nét của câu viết; chưa rõ "Viết lại" và khóa khung sau "Đúng" |
| 1 | dev-lead | block | [major] quay lại từ màn thứ tự nét làm tổng kết chỉ tính từ câu đó (luật S3.4); Scenario "龘" pass giả vì chữ ngoài từ điển; thiếu delta `lesson-runner` cho Requirement bỏ qua câu; biến điệu ở bài 2 bị chấm sai theo pinyin từ điển |
| 2 | qa | block | [major] "爱" thực ra có dữ liệu nét (mọi chữ HSK 1 đều có), Scenario kiểm tra nội dung sai điều kiện đầu; [minor] case "không có dữ liệu nét" không dựng được bằng e2e, liên kết "Xem thứ tự nét" sau "Đúng" |
| 2 | dev-lead | block | [major] như qa về "爱"; [minor] hệ quả phương án (a), layer dữ liệu nét qua props |
| 3 | qa | approve | [minor] câu chữ Requirement lối vào chưa khớp luật ẩn liên kết sau "Đúng"; thứ tự ID test-cases |
| 3 | dev-lead | approve | [minor] như qa |

Các minor vòng 3 đã sửa (chỉ câu chữ, không đổi Scenario).

**`ba` đề xuất, chờ người thật xác nhận:** câu viết chỉ có kết quả "Đúng", khung khóa, không "Viết lại", ẩn "Xem thứ tự
nét" sau "Đúng"; ba trạng thái tải dữ liệu nét như S6.1, có "Bỏ qua câu này" (bài chưa hoàn thành); quay lại bài giữ luật
làm tiếp S3.4 (phương án a); bài 2 luyện biến điệu chỉ bằng nói theo mẫu, gõ pinyin chấm theo thanh gốc; bài 11 chỉ viết
bộ thủ tự đứng thành chữ HSK 1; câu viết chỉ làm bằng chuột/cảm ứng; bài 1 "Thanh 1–4" thay bài mẫu, chấp nhận tiến độ cũ.

**Phụ thuộc:** S7.1 cần S6.1 và S6.2 code xong và merge trước.
