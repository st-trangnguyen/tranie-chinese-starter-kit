# Proposal: S6.3 Viết không gợi ý

Story **S6.3 Viết không gợi ý · F7, F4** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s63-viết-không-gợi-ý--f7-f4)) ·
GitHub issue [#55](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/55). Bản 0.2.

Refs #55

## Why

Là người học, tôi muốn viết chữ không có gợi ý để kiểm tra mình nhớ thật hay chưa. Viết theo nét mờ (S6.2) chỉ là tập chép; muốn biết
mình nhớ chữ hay chưa thì phải viết từ trí nhớ, và kết quả đó cho app biết lúc nào nên ôn lại chữ.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc quy kết quả viết thành mức chấm SRS (Quên / Khó / Được / Dễ) | `shared/services/` (service viết/SRS) |
| State phiên viết không gợi ý, gọi service | `pages/<feature>/hooks/` |
| Chế độ "không gợi ý" của khung viết (ẩn nét mờ) | `shared/components/exercises/` (dạng bài viết của S6.2, chỉ nhận props) |
| Ghi mức chấm vào thẻ SRS | qua `ProgressStore` (thẻ do S9.1 định nghĩa) |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Khung viết có chế độ **không gợi ý**: không hiện nét mờ của chữ, không hiện gợi ý nét sau lần sai liên tiếp (S6.2 AC3).
  Người học viết từng nét từ trí nhớ.
- Khi viết xong chữ, kết quả được quy thành một mức chấm trong 4 mức SRS (Quên / Khó / Được / Dễ) và dùng để chấm thẻ SRS chiều
  viết của chữ/từ đó. Người học không phải tự chọn mức.
- Đề xuất cách quy (BA duyệt, xem Câu hỏi mở 1):

| Kết quả viết | Mức chấm |
|---|---|
| Viết xong, không sai nét nào | Dễ |
| Viết xong, sai 1 đến 2 nét | Được |
| Viết xong, sai từ 3 nét trở lên | Khó |
| Bỏ dở (rời chữ khi chưa viết xong) | Quên |

## Không làm (out of scope)

- Khung viết, nhận nét, báo sai nét, gợi ý sau 3 lần sai → **S6.2**. Animation thứ tự nét → **S6.1**.
- Tạo thẻ SRS chiều viết và điều kiện tạo thẻ → **S9.1**. Màn ôn tập, lịch ôn FSRS → **S9.2**. Không mở rộng sang E9.
- Cho người học tự đổi mức chấm sau khi viết.
- Thống kê, streak, giới hạn thẻ mỗi ngày.

## Dependencies

- **S6.2** (code trước): khung viết và cách tính nét sai; S6.3 thêm chế độ không gợi ý.
- **S9.1**: định nghĩa thẻ chiều viết; S6.3 chỉ chấm thẻ đã có.
- **S9.2**: màn ôn tập nơi người học gặp chữ cần viết không gợi ý.

## Capabilities

### New Capabilities
- `blind-writing`: khung viết không gợi ý và quy kết quả viết thành mức chấm thẻ SRS chiều viết.

### Modified Capabilities
- (không có)

## Open Questions

- [ ] Cách quy kết quả viết thành mức chấm SRS (bảng trên, ngưỡng 0 / 1-2 / từ 3 nét sai, "bỏ dở" = Quên) là đề xuất. BA duyệt.
- [ ] Thẻ chiều viết do S9.1 định nghĩa; nếu chữ chưa có thẻ chiều viết (chưa qua điều kiện S9.1 AC2) thì kết quả viết có bị bỏ qua không? Đề xuất: bỏ qua, không tạo thẻ.
- [ ] Trong chế độ không gợi ý, viết sai nét vẫn báo ngay như S6.2 AC2? Đề xuất: vẫn báo sai, chỉ bỏ nét mờ và gợi ý nét.
- [ ] Từ nhiều chữ: chấm một mức cho cả từ (lấy mức thấp nhất của các chữ) hay từng chữ? Đề xuất: một mức cho cả từ, lấy mức thấp nhất.
- [ ] Người học có vào chế độ không gợi ý từ đâu ngoài màn ôn tập (S9.2) không (ví dụ từ bài Viết chữ)? Spec này chỉ nêu hành vi của khung, không quy định điểm vào.

## Impact

- Code mới: chế độ không gợi ý của khung viết, quy tắc quy mức chấm (+ test).
- Code sửa: dạng bài viết (S6.2), service viết/SRS, i18n, style.
- Không đổi schema nội dung; ghi vào thẻ SRS theo schema của S9.1; không thêm dependency.
- Tầng test: Vitest cho quy tắc quy mức chấm (bảng nhiều trường hợp); Vitest + Testing Library cho khung viết.
