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
| Quy tắc quy số lần sai nét + bỏ dở thành mức chấm (Quên / Khó / Được / Dễ): pure, Phần 2 | `shared/services/srs.service.ts` (S9.1, hoặc `writing.service.ts` nếu S9.1 chưa có) |
| State phiên viết không gợi ý (đếm lần sai, bỏ dở), gọi service; truyền callback xuống khung | `pages/<feature>/hooks/` |
| Chế độ "không gợi ý" của khung viết (không nét mờ cả chữ, không làm nổi bật nét đúng) | `shared/components/exercises/` (dạng bài viết của S6.2, chỉ nhận props và callback từ hook, không gọi service) |
| Ghi mức chấm vào thẻ SRS chiều viết của từ một chữ (key `wordId:writing`, S9.1) | qua `ProgressStore` (thẻ do S9.1 định nghĩa) |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Khung viết có chế độ **không gợi ý**, khác khung có gợi ý (S6.2) ở hai điểm: không có nét mờ của cả chữ (S6.2 hiện sẵn nét mờ cả chữ để
  viết đè; ô lưới/đường kẻ nếu có vẫn hiện), và không làm nổi bật nét đúng sau 3 lần sai liên tiếp ở một nét (S6.2 AC3). Viết sai nét vẫn báo
  ngay như S6.2 AC2, không hiện nét đúng.
- Điểm vào: nút "Thử viết không gợi ý" trên màn báo đã viết xong ở khung có gợi ý (S6.2). Không phụ thuộc màn ôn tập S9.2.
- Khi viết xong (hoặc bỏ dở), kết quả quy thành một mức chấm; người học không tự chọn mức. Mỗi lượt là đúng MỘT chữ Hán (S6.2 cấm luyện nhiều chữ trong một màn).
  Lịch ôn thuộc S9.2 AC3. Mỗi lượt mở chỉ chấm một lần.
- **Đơn vị thẻ (người thật chốt: Cách 1)**: thẻ chiều viết ở S9.1 giữ mức TỪ (key `wordId:facet`, S9.1 AC2 không đổi). S6.3 chỉ ghi mức khi chữ vừa viết
  chính là một từ MỘT chữ có thẻ `X:writing` với `wordId` = chính chữ đó. Nếu chữ chỉ là thành phần của từ nhiều chữ (ví dụ 爸 trong 爸爸), hoặc chưa có thẻ,
  kết quả không ghi vào đâu, không tạo thẻ, màn báo xong bình thường. **Hệ quả**: từ nhiều chữ chưa được S6.3 chấm cho tới khi S9.1 hoặc story khác
  định nghĩa việc gom các chữ vào thẻ từ.
- Việc chấm chỉ áp dụng ở chế độ không gợi ý; chế độ có gợi ý (S6.2) vẫn không ghi gì.
- Màn báo xong của chế độ không gợi ý có nút "Viết lại không gợi ý" (mở lượt mới cùng chữ); nút "Thử viết không gợi ý" chỉ có ở màn báo xong của khung CÓ gợi ý.
- Bảng quy mức (đơn vị là LẦN sai nét, một nét sai 2 lần tính 2):

| Kết quả viết | Mức chấm |
|---|---|
| Viết xong, 0 lần sai nét | Dễ |
| Viết xong, 1 đến 2 lần sai nét | Được |
| Viết xong, từ 3 lần sai nét trở lên | Khó |
| Bỏ dở (đã thả ít nhất một nét, không tính chạm một điểm hoặc nét quá ngắn, rồi đổi chữ hoặc thoát màn) | Quên |

## Không làm (out of scope)

- Khung viết, nhận nét, báo sai nét, gợi ý sau 3 lần sai → **S6.2** (S6.3 chỉ bỏ nét mờ cả chữ và việc làm nổi bật nét đúng). Animation thứ tự nét → **S6.1**.
- Tạo thẻ SRS chiều viết và điều kiện tạo thẻ → **S9.1**. Màn ôn tập, lịch ôn FSRS → **S9.2**. Không mở rộng sang E9.
- Cho người học tự đổi mức chấm sau khi viết; màn tự chấm 4 mức là S9.2 AC2.
- Chấm khi đóng tab hoặc tắt app.
- Chấm từ nhiều chữ, gom các chữ vào thẻ từ, hoặc gom lượt viết nhiều chữ thành một lượt: S6.2 chỉ luyện một chữ mỗi màn; chữ là thành phần của từ nhiều chữ không được chấm vào thẻ từ ở S6.3 (việc của S9.1 hoặc story khác).
- Thống kê, streak, giới hạn thẻ mỗi ngày.

## Dependencies

- **S6.2** (chặn): khung viết và cách tính nét sai; S6.3 thêm chế độ không gợi ý. Chưa có trong `main`.
- **S9.1** (chặn phần chấm): thẻ chiều viết mức từ (key `wordId:facet`) và `srs.service`; S6.3 chỉ ghi mức vào thẻ `X:writing` của từ một chữ X khi chữ vừa viết chính là X; không yêu cầu S9.1 đổi sang thẻ mức chữ. Chưa có trong `main`.
- **S9.2** không chặn: chỉ dùng mức đã ghi để xếp lịch; S6.3 không cần màn ôn tập.

## Capabilities

### New Capabilities
- `blind-writing`: khung viết không gợi ý và quy kết quả viết thành mức chấm thẻ SRS chiều viết.

### Modified Capabilities
- (không có)

## Open Questions

- [x] Bảng quy mức chấm → 0 lần sai = Dễ, 1-2 = Được, từ 3 = Khó, bỏ dở = Quên; đơn vị là lần sai nét, nhất quán với S6.2 AC2 (ba đề xuất, chờ người thật xác nhận)
- [x] Chữ không có thẻ chiều viết riêng (chưa có thẻ, hoặc chỉ là thành phần của từ nhiều chữ) → bỏ qua, không tạo thẻ, màn báo bình thường; lần viết không gợi ý không tính là "lần viết đầu" của S9.1 AC2, vì nút vào chế độ này chỉ hiện sau khi đã viết xong có gợi ý (ba đề xuất, chờ người thật xác nhận)
- [x] Sai nét trong chế độ không gợi ý → vẫn báo ngay như S6.2 AC2, xoá nét sai, không hiện nét đúng (ba đề xuất, chờ người thật xác nhận)
- [x] Từ nhiều chữ (finding vòng 2, mâu thuẫn S6.2) → chốt mỗi lượt không gợi ý là MỘT chữ; bỏ Scenario từ nhiều chữ; chỉ chấm khi chữ là từ một chữ có thẻ chiều viết (xem dòng "Đơn vị thẻ" bên dưới, người thật chốt Cách 1) (ba đề xuất, chờ người thật xác nhận)
- [x] Điểm vào chế độ không gợi ý → nút "Thử viết không gợi ý" sau khi viết xong có gợi ý; không phụ thuộc S9.2 (ba đề xuất, chờ người thật xác nhận)
- [x] "Rời chữ" (bỏ dở) → chỉ tính khi đổi chữ hoặc thoát màn và đã thả ít nhất một nét; đóng tab/tắt app và rời khi chưa thả nét nào (bấm nhầm) không chấm gì (ba đề xuất, chờ người thật xác nhận)
- [x] Phạm vi "chấm thẻ" → ghi mức vào thẻ, lịch ôn thuộc S9.2 AC3; mỗi lượt mở chấm đúng một lần, viết lại cùng chữ là lượt mới (ba đề xuất, chờ người thật xác nhận)
- [x] Scenario "viết bằng ngón tay hoặc chuột" → đã xoá, là hành vi của S6.2 AC1; ghi thành điều kiện tiên quyết (ba xử lý theo finding)
- [x] Đơn vị thẻ chiều viết (mức chữ hay mức từ) → thẻ giữ mức TỪ, S9.1 AC2 không đổi; S6.3 chỉ chấm khi chữ viết là từ một chữ có thẻ `X:writing`; chữ trong từ nhiều chữ không ghi vào đâu; từ nhiều chữ chưa được chấm tới khi S9.1 hoặc story khác định nghĩa việc gom (người thật chốt: Cách 1)
- [x] Màn báo xong của chế độ không gợi ý có nút không → có nút "Viết lại không gợi ý" (mở lượt mới cùng chữ); nút "Thử viết không gợi ý" chỉ có ở màn báo xong của khung có gợi ý (ba đề xuất, chờ người thật xác nhận)
- [x] Chế độ có gợi ý có chấm không → không, chỉ chế độ không gợi ý chấm (ba xử lý theo finding)
- [x] [major] AC1 "không hiện nét mờ" vô nghĩa khi S6.2 cũ có khung trống; S6.2 nay hiện nét mờ cả chữ và làm nổi bật nét đúng sau 3 lần sai (người thật chốt ở S6.2) → viết lại Requirement AC1: chế độ không gợi ý không có nét mờ cả chữ và không làm nổi bật nét đúng sau 3 lần sai, thêm bảng so sánh hai chế độ; bỏ "điểm bắt đầu", "mũi tên", "vị trí, hướng"; đổi tên Scenario AC1 (ba xử lý theo finding)
- [x] [minor] Scenario "Bỏ dở thì chấm Quên" thiếu điều kiện từ một chữ có thẻ chiều viết → thêm GIVEN "chữ đang viết là một từ một chữ có thẻ chiều viết" cho mọi Scenario chấm mức; thêm Scenario "Bỏ dở chữ không có thẻ chiều viết riêng thì không ghi gì" (ba xử lý theo finding)
- [x] [minor] Hai Scenario viết lại cùng chữ trùng ý → gộp thành "S6.3-AC2 Viết lại cùng chữ là lượt mới" (bấm "Viết lại không gợi ý", khung trống, chấm riêng đúng một lần, thẻ nhận mức lượt sau, không cộng dồn) (ba xử lý theo finding)
- [x] Thứ tự làm: S6.3 cần S6.2 và S9.1 mà cả hai chưa có trong `main`. Chọn (a) code S6.2 + S9.1 trước rồi mới code S6.3, hoặc (b) tách S6.3 thành phần khung viết (phụ thuộc S6.2) và phần chấm SRS (đợi S9.1)? (đề xuất: (a), giữ S6.3 một change, chặn bởi S6.2 và S9.1) → chọn (a): code S6.2 + S9.1 trước, S6.3 giữ một change (người thật chốt)

## Impact

- Code mới: chế độ không gợi ý của khung viết, quy tắc quy mức chấm (+ test).
- Code sửa: dạng bài viết (S6.2), service viết/SRS, i18n, style.
- Không đổi schema nội dung; ghi vào thẻ SRS theo schema của S9.1; không thêm dependency.
- Tầng test: Vitest cho quy tắc quy mức chấm (bảng nhiều trường hợp); Vitest + Testing Library cho khung viết.
