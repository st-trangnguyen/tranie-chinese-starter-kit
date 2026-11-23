# Proposal: S9.5 Thống kê ôn tập

Story **S9.5 Thống kê ôn tập · F4** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s95-thống-kê-ôn-tập--f4)) ·
GitHub issue [#43](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/43). Bản 0.2, epic E9 Ôn tập SRS.

Refs #43

## Why

Là người học, tôi muốn xem thống kê ôn tập để biết tiến bộ của mình. S9.1–S9.3 tạo thẻ, cho ôn và giới hạn mỗi ngày, nhưng người học
không biết mình có bao nhiêu thẻ đã nhớ, bao nhiêu thẻ còn đang học, và những ngày tới phải ôn bao nhiêu. S9.5 thêm một màn chỉ đọc trả lời
hai câu đó.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc xếp một thẻ vào nhóm "Mới" / "Đang học" / "Đã nhớ"; quy tắc dự báo 7 ngày (ngày nào, thẻ nào được đếm, ngày theo giờ máy) (Phần 2, pure); use case "lấy thống kê ôn tập" đọc thẻ rồi tính (Phần 3) | `shared/services/srs.service.ts` (đã có từ S9.1/S9.2, thêm method) |
| Đọc toàn bộ thẻ ôn tập (đã có từ S9.2, không đổi cấu trúc) | `core/services/` (`ProgressStore`) |
| Màn Thống kê ôn tập (entry lazy-load) và route mới | `pages/review-stats/containers/`, `pages/review-stats/review-stats.routes.ts` (tên thư mục/route do plan chốt) |
| UI riêng: ba nhóm thẻ, bảng dự báo, trạng thái rỗng / lỗi | `pages/review-stats/components/` |
| State màn (đang tải, lỗi, số liệu), gọi service | `pages/review-stats/hooks/` |
| Liên kết "Thống kê ôn tập" trên Trang chủ | `pages/home/components/` |
| Định dạng nhãn ngày ("Thứ Tư 25/11") | `shared/utils/` (util ngày hiện có nếu có) |
| Chữ hiển thị, style BEM | `assets/i18n/vi/` (file mới hoặc `review.json`), `apps/web/src/styles/tailwind/` |

## What Changes

- **Màn Thống kê ôn tập mới**, mở từ liên kết "Thống kê ôn tập" trên Trang chủ (ngay sau nút "Ôn tập" của S9.2, luôn hiện). Màn chỉ đọc,
  số liệu tính một lần lúc mở màn; đầu màn có liên kết "Về Trang chủ".
- **Số thẻ theo ba nhóm** (AC1), đếm theo thẻ (mỗi chiều của một từ là một thẻ, như "Thẻ x / y" của S9.2):

  | Nhóm | Thẻ thuộc nhóm |
  |---|---|
  | Mới | Chưa chấm lần nào |
  | Đang học | Đã chấm, đang trong bước học ngắn: thẻ mới chưa qua bước học, hoặc thẻ đã nhớ vừa chấm "Quên" và đang học lại |
  | Đã nhớ | Đã qua bước học ngắn, lịch ôn tính theo ngày |

  Thẻ bị bỏ qua của S9.2 (từ không có trong app, thẻ đọc không được) không được đếm.
- **Dự báo 7 ngày** (AC2): bảng 7 dòng, từ "Hôm nay", "Ngày mai", rồi 5 ngày sau ghi thứ và ngày/tháng. Mỗi dòng là số thẻ đã chấm có thời
  điểm ôn tiếp theo rơi vào ngày đó theo giờ máy (0 giờ tới 23 giờ 59, như S8.1); thẻ quá hạn tính vào "Hôm nay". Không tính thẻ "mới"
  (chú thích ngay dưới bảng). Không áp giới hạn mỗi ngày của S9.3, không mô phỏng kết quả chấm.
- **Trạng thái**: chưa có thẻ nào (cùng thông báo như màn ôn tập S9.2), không tải được (nút "Thử lại").
- Dùng được khi offline. Bảng dự báo là bảng thật có tiêu đề cột, đọc được bằng trình đọc màn hình; số liệu có nhãn chữ, không chỉ màu;
  không có biểu đồ hay hiệu ứng chuyển động; khổ 375 px không cuộn ngang.
- **Trang chủ** có thêm liên kết "Thống kê ôn tập" (delta `home-screen`).

## Không làm (out of scope)

- **Số thẻ đến hạn trên Trang chủ** (S9.2, S9.3 ghi "→ S9.5"): không thuộc AC của S9.5, Trang chủ chỉ thêm liên kết. Cần thì mở story
  riêng.
- Biểu đồ (cột, đường) và thư viện biểu đồ; bảng dự báo là bảng chữ và số.
- Dự báo thẻ "mới", dự báo sau khi áp giới hạn mỗi ngày (S9.3), dự báo xa hơn 7 ngày, mô phỏng lịch sau các lần chấm.
- Lịch sử ôn (số lượt đã ôn mỗi ngày trong quá khứ, tỉ lệ nhớ, streak ôn tập), thống kê theo chiều thẻ hay theo bài / chủ đề, danh sách
  từng thẻ trong một nhóm.
- **Lưu dữ liệu mới**: mọi số liệu tính từ thẻ đã lưu (trạng thái nhớ, thời điểm ôn tiếp theo). Không đổi cấu trúc dữ liệu lưu trên máy,
  không đổi file sao lưu. Số thẻ mới / lượt ôn đã chấm hôm nay của S9.3 không hiện trên màn này.
- Liên kết sang màn thống kê từ màn ôn tập; số liệu tự cập nhật khi màn đang mở (qua nửa đêm, thẻ tới hạn).

## Dependencies

- **S9.1** (spec PR #148 đã merge, code chưa có): thẻ ba chiều, trạng thái "mới", mỗi từ tối đa một thẻ mỗi chiều; thẻ của từ không có
  trong app sau khi nhập file.
- **S9.2** (spec PR #149 đã merge, code chưa có): dùng lại Requirement "Thẻ bị bỏ qua" (thẻ không đếm), "Màn ôn tập khi không có thẻ để hỏi"
  (cùng câu thông báo chưa có thẻ), "Tính chất của lịch ôn" (bước học ngắn: thẻ mới chấm "Quên" / "Khó" / "Được" còn ở bước học, "Dễ" ≥ 1
  ngày), "FSRS tính ngày ôn tiếp theo" (trạng thái nhớ đầy đủ được lưu). Nhóm "Đang học" / "Đã nhớ" đọc từ trạng thái nhớ mà S9.2 lưu
  sau mỗi lần chấm. Code S9.5 làm sau code S9.2. Không MODIFIED Requirement nào của `review-session`.
- **S9.3** (spec PR #151 đã merge): giới hạn mỗi ngày không áp vào dự báo; "hôm nay" theo giờ máy dùng cùng định nghĩa.
- **S9.4** (spec PR #152, chưa merge): thẻ "đưa về cần ôn sớm" giữ trạng thái, thời điểm ôn tiếp theo kéo về lúc làm xong bài, nên được
  đếm vào "Hôm nay" theo quy tắc chung; S9.5 không phụ thuộc S9.4.
- **S8.1**: Trang chủ có thêm một liên kết, các phần cũ không đổi; định nghĩa ngày theo giờ máy.
- Không thêm dependency.

## Capabilities

### New Capabilities
- `review-stats`: màn Thống kê ôn tập: số thẻ theo ba nhóm, dự báo lượt ôn 7 ngày, trạng thái rỗng / lỗi, offline, đọc được bằng trình đọc
  màn hình.

### Modified Capabilities
- `home-screen`: thêm liên kết "Thống kê ôn tập" mở màn thống kê (ADDED, các Requirement cũ không đổi).

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (chi tiết ở các dòng bên dưới):

1. Vào màn Thống kê ôn tập bằng liên kết "Thống kê ôn tập" trên Trang chủ, luôn hiện; không thêm số thẻ đến hạn lên Trang chủ.
2. Ba nhóm: "Mới" = chưa chấm; "Đang học" = còn trong bước học ngắn (kể cả học lại sau "Quên"); "Đã nhớ" = đã qua bước học ngắn.
3. Đếm theo thẻ (mỗi chiều một thẻ), không theo từ; thẻ bị bỏ qua của S9.2 không đếm.
4. Dự báo 7 dòng gồm "Hôm nay" và 6 ngày sau; thẻ quá hạn tính vào "Hôm nay".
5. Dự báo chỉ đếm thẻ đã chấm, không tính thẻ "mới", có chú thích "Không tính thẻ mới."; không áp giới hạn mỗi ngày của S9.3.
6. Bảng chữ và số, không biểu đồ.
7. Nhãn ngày: "Hôm nay", "Ngày mai", rồi "Thứ Tư 25/11" (thứ + ngày/tháng, không thêm số 0 ở đầu, không năm: "Thứ Sáu 1/1", không
   "01/01").
8. Chưa có thẻ: cùng câu với màn ôn tập "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."; lỗi: "Không tải được thống kê ôn tập." +
   "Thử lại".
9. Màn chỉ có một liên kết "Về Trang chủ" (ở đầu màn) ở mọi trạng thái; trạng thái chưa có thẻ và lỗi không thêm nút/liên kết "Về Trang
   chủ" thứ hai cạnh thông báo (khác màn ôn tập S9.2 có nút cạnh thông báo).

- [x] **Màn thống kê đặt ở đâu, vào từ đâu?** → màn riêng "Thống kê ôn tập", mở từ liên kết "Thống kê ôn tập" trên Trang chủ, đặt ngay sau
  nút "Ôn tập", luôn hiện (kể cả khi chưa có thẻ, offline). Đầu màn có liên kết "Về Trang chủ". Không thêm lối vào từ màn ôn tập. Delta
  `home-screen` (ba đề xuất, chờ người thật xác nhận)
- [x] **Số thẻ đến hạn trên Trang chủ (S9.2 và S9.3 để cho S9.5)?** → không làm: không nằm trong AC1/AC2 của S9.5; Trang chủ chỉ thêm liên
  kết. Ghi vào "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **"Mới / đang học / đã nhớ" ánh xạ từ trạng thái nhớ của thẻ thế nào?** → "Mới": chưa chấm lần nào; "Đang học": đã chấm nhưng còn
  trong bước học ngắn, gồm thẻ mới chưa qua bước học và thẻ đã nhớ chấm "Quên" đang học lại; "Đã nhớ": đã qua bước học ngắn. Đo được bằng
  bước học của S9.2 "Tính chất của lịch ôn" (thẻ mới chấm "Được" → "Đang học", chấm "Dễ" → "Đã nhớ"). Bảng trong Requirement "Hiện số thẻ
  theo từng trạng thái" (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ "Đã nhớ" bị kéo về ôn sớm (S9.4) hoặc đang quá hạn thuộc nhóm nào?** → vẫn "Đã nhớ": nhóm theo trạng thái nhớ, không theo hạn
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Đếm theo thẻ hay theo từ?** → theo thẻ, mỗi chiều một thẻ, khớp "Thẻ x / y" của màn ôn tập; một từ có thể ở hai nhóm khác nhau
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ bị bỏ qua (từ không có trong app, thẻ đọc không được) có đếm không?** → không, ở cả ba nhóm và trong dự báo, không báo lỗi;
  khớp S9.2 "Thẻ bị bỏ qua" (màn ôn tập không bao giờ hỏi các thẻ đó) (ba đề xuất, chờ người thật xác nhận)
- [x] **7 ngày tới có gồm hôm nay không, thẻ quá hạn tính vào đâu?** → 7 dòng: hôm nay và 6 ngày kế tiếp; thẻ đã chấm có thời điểm ôn tiếp
  theo trước hoặc trong hôm nay (kể cả quá hạn nhiều ngày, kể cả bước học ngắn còn vài phút) tính vào "Hôm nay"; thời điểm sau ngày thứ 7
  không hiện (ba đề xuất, chờ người thật xác nhận)
- [x] **Dự báo có tính thẻ "mới" không, có áp giới hạn 20 / 200 của S9.3 không?** → không tính thẻ "mới" (chưa có thời điểm ôn, và đã tách
  riêng ở AC1 nhóm "Mới"); có câu "Không tính thẻ mới." ngay dưới bảng. Không áp giới hạn: dự báo là số thẻ tới hạn, không phải số thẻ màn
  ôn tập sẽ lấy; áp giới hạn phải mô phỏng thẻ dồn sang ngày sau. Không mô phỏng kết quả chấm (ba đề xuất, chờ người thật xác nhận)
- [x] **Biểu đồ hay bảng, có thêm thư viện biểu đồ?** → bảng 7 dòng hai cột "Ngày" / "Số lượt ôn", không biểu đồ, không thêm dependency;
  bảng đọc được bằng trình đọc màn hình sẵn (ba đề xuất, chờ người thật xác nhận)
- [x] **Nhãn ngày trong bảng?** → "Hôm nay", "Ngày mai", rồi thứ + ngày/tháng theo giờ máy ("Thứ Tư 25/11", "Chủ nhật 29/11") (ba đề xuất,
  chờ người thật xác nhận)
- [x] **(QA) Ngày/tháng một chữ số viết "Thứ Sáu 1/1" hay "01/01"?** → "Thứ Sáu 1/1": số không thêm 0 ở đầu, không có năm. Bảng ví dụ trong
  Requirement "Nhãn ngày trong bảng dự báo" + Scenario "Nhãn ngày một chữ số và sang năm mới" (28/12 → "Thứ Sáu 1/1") (ba
  đề xuất, chờ người thật xác nhận)
- [x] **Trạng thái rỗng và lỗi đọc?** → không có thẻ được đếm nào: "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." (cùng câu S9.2),
  không hiện nhóm và bảng; có thẻ nhưng chưa thẻ nào đã chấm: hiện nhóm và bảng 7 dòng số 0; đọc thẻ lỗi: "Không tải được thống kê ôn
  tập." trong vùng đọc tự động + "Thử lại" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA) Ở trạng thái chưa có thẻ và lỗi, "Về Trang chủ" là một liên kết (đầu màn) hay hai?** → một: chỉ liên kết "Về Trang chủ" ở đầu
  màn, có ở mọi trạng thái; không thêm "Về Trang chủ" thứ hai cạnh thông báo. Scenario "Chưa có thẻ nào" và "Không tải được thống kê" kiểm
  "đúng một liên kết" (ba đề xuất, chờ người thật xác nhận)
- [x] **(QA) Focus khi mở màn, khi câu lỗi hiện, sau "Thử lại" thành công / vẫn lỗi?** → theo mẫu bảng focus của S9.2: mở màn không chuyển
  focus, Tab đầu tiên tới "Về Trang chủ"; câu lỗi lúc mở màn đọc qua vùng đọc tự động, không kéo focus; "Thử lại" đọc được → focus tiêu đề
  chính "Thống kê ôn tập" (hoặc thông báo chưa có thẻ nếu không thẻ nào được đếm); vẫn lỗi → focus ở "Thử lại", câu lỗi đọc lại. Vùng nhận
  focus không nằm trong thứ tự Tab. Requirement "Focus khi mở màn Thống kê ôn tập", "Focus sau khi Thử lại"
- [x] **Số liệu cập nhật khi nào?** → tính một lần lúc mở màn (như S9.2 chốt danh sách lúc mở màn); mở lại màn thì tính lại
- [x] **Có cần lưu dữ liệu mới?** → không: ba nhóm và dự báo tính từ trạng thái nhớ và thời điểm ôn tiếp theo mà S9.1/S9.2 đã lưu; không đổi
  cấu trúc dữ liệu, không đổi file sao lưu
- [x] **A11y, mobile, sáng/tối, chuyển động?** → tiêu đề màn "Thống kê ôn tập"; mỗi nhóm có nhãn chữ cạnh số; bảng có tên "Dự báo lượt ôn 7
  ngày tới" và tiêu đề cột; liên kết dùng được bằng Tab + Enter, có viền focus; khổ 375 px không cuộn ngang; không có hiệu ứng chuyển động
  nên không cần xử lý giảm chuyển động; sáng/tối theo design system (QA kiểm contrast tay)
- [x] **Route của màn mới?** → route RESTful, danh từ cụ thể, cùng kiểu các route hiện có (`learning-paths`, `settings`); đề xuất
  `review-statistics`, plan chốt tên cuối cùng. Không đưa route vào spec
- [x] **Offline?** → mở được và đúng số liệu khi offline, như S9.2 "Ôn tập dùng được khi offline" (dữ liệu đều trên máy)

## Impact

- Code mới: màn Thống kê ôn tập (container, hook, component, route), chữ i18n, style BEM; method xếp nhóm và dự báo trong `srs.service`
  (+ unit test).
- Code sửa: Trang chủ (liên kết "Thống kê ôn tập"), `page.routes.ts`.
- Dữ liệu người dùng: không đổi cấu trúc dữ liệu lưu trên máy, không đổi file sao lưu, không ghi gì.
- Dependency: không thêm.
- Tầng test: Vitest cho xếp nhóm và dự báo (Phần 2, giờ cố định), use case với `ProgressStore` giả (thẻ bị bỏ qua, lỗi đọc); Testing Library
  cho màn (bảng, nhãn, trạng thái, focus); e2e Playwright trên bản build: Trang chủ → Thống kê ôn tập, offline, khổ 375.
