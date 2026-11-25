# Test cases: S9.5 Thống kê ôn tập

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/home-screen/spec.md` và
`specs/review-stats/spec.md`. Các quyết định `ba` đề xuất trong Open Questions của proposal được dùng nguyên văn; nếu người thật chốt khác
thì sửa case tương ứng.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev). Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, chưa có thẻ ôn
  tập nào, Cài đặt giới hạn mặc định ("20 thẻ", "200 lượt"), có mạng, trừ khi case nêu khác.
- **Dùng lại quy ước của S9.2** (`openspec/changes/s9-2-review-session/test-cases.md`, mục "Điều kiện đầu chung"): cách viết thẻ
  `"<từ>" <chiều>`, "mới", "đã chấm", **Nạp sẵn thẻ**, **Tua đồng hồ**, **Đọc thẻ từ phía test**, "Bước học ngắn", "Chấm X",
  "Giả lập lỗi" ("lỗi đọc thẻ", "thẻ đọc không được"), "Được đọc tự động", "Tên đọc được", "Tắt mạng", "Mở lại app", "Ngưỡng nhìn rõ".
- **Ba nhóm** viết "Mới" a / "Đang học" b / "Đã nhớ" c = trên màn, nhãn chữ của nhóm đi cùng số đó, theo đúng thứ tự Mới → Đang học →
  Đã nhớ.
- **Thẻ ở nhóm khi nạp sẵn** (chỉ e2e): "thẻ Đang học" = thẻ đã chấm còn trong bước học ngắn (như thẻ "mới" vừa chấm "Được"); "thẻ Đã
  nhớ" = thẻ đã qua bước học ngắn (như thẻ "mới" vừa chấm "Dễ"). Khi case ghi "thẻ đã chấm, ôn tiếp theo lúc T" mà không nêu nhóm, test
  dùng thẻ Đã nhớ. Chỉ thẻ của từ có trong app, trừ khi case ghi khác.
- **Đồng hồ**: e2e cố định đồng hồ ở **10:00 Thứ Hai 23/11/2026**, trừ case nêu giờ khác. "Hôm nay" = 23/11, 7 dòng của bảng là 23/11 →
  29/11. QA chạy tay không chạy case cần giờ cụ thể, chỉ đọc kết quả e2e.
- **"Bảng dự báo"** = bảng "Dự báo lượt ôn 7 ngày tới". Ghi kết quả dạng "Hôm nay" 2, "Thứ Tư 25/11" 1, … nghĩa là cột "Số lượt ôn" của
  dòng có nhãn đó; "các dòng còn lại 0".
- **Mở màn thống kê** = ở Trang chủ bấm "Thống kê ôn tập", trừ khi case nêu cách khác.
- **Câu chưa có thẻ** = "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." (đúng từng chữ). **Câu lỗi** = "Không tải được thống kê ôn
  tập." (đúng từng chữ).
- **"Không cuộn ngang"**: e2e kiểm chiều rộng nội dung trang không lớn hơn khổ màn; chạy tay vuốt ngang không dịch được nội dung.
- **Dựng dữ liệu khi chạy tay**: thẻ "mới" dựng bằng thao tác thật (xong bài có từ đó, S9.1); nhóm "Đang học" / "Đã nhớ" dựng bằng chấm
  thật trên màn ôn tập ("Được" / "Dễ"). Trạng thái cần đồng hồ (quá hạn, ôn tiếp theo ngày cụ thể) dựng bằng file sao lưu mẫu dev cung cấp
  cùng PR code (kèm ngày cần đặt đồng hồ máy), nhập qua Cài đặt → "Sao lưu tiến độ" → "Nhập tiến độ" → "Ghi đè" như S8.5. Bản build
  **không** có màn ẩn, công tắc hay tham số nào để nạp hoặc xem thẻ.
- **File mẫu** (dev cung cấp cùng PR code; e2e có thể dùng cùng bộ):
  - `thong-ke-3-nhom`: 3 thẻ "mới", 2 thẻ Đang học, 4 thẻ Đã nhớ, với thời điểm ôn tiếp theo trải trong 7 ngày kể từ ngày ghi kèm file;
    dev ghi kèm bảng kết quả mong đợi (ba nhóm và 7 dòng) khi đặt đồng hồ máy đúng ngày đó.
  - `thong-ke-bo-qua`: 1 thẻ `"你好" nghĩa` "mới", 1 thẻ "mới" của từ không có trong app, 1 thẻ Đã nhớ của từ không có trong app tới hạn
    hôm nay.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (thao tác thật trên bản build, có thể nạp sẵn thẻ, tua/cố định đồng hồ, giả
lập lỗi, đọc thẻ từ phía test). `không` = QA chạy tay mỗi lần nghiệm thu (nhìn tương phản, trình đọc màn hình, trình duyệt di động thật),
hoặc chỉ kiểm được bằng Vitest (ghi rõ trong cột Các bước).

## Trang chủ (`home-screen`)

### Liên kết Thống kê ôn tập trên Trang chủ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-1 | S9.5-AC1 Mở màn Thống kê ôn tập từ Trang chủ | Chức năng | Nạp sẵn `"你好" nghĩa` "mới". Mở Trang chủ, bấm "Thống kê ôn tập" | Vào màn có tiêu đề "Thống kê ôn tập", hiện "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0 và bảng dự báo | e2e |
| TC-S9.5-AC1-2 | S9.5-AC1 Mở màn Thống kê ôn tập từ Trang chủ | Chức năng | QA chạy tay: xong bài 1; về Trang chủ, bấm "Thống kê ôn tập" | Vào màn "Thống kê ôn tập"; ba nhóm và bảng dự báo hiện ra, "Mới" lớn hơn 0 | không |
| TC-S9.5-AC1-3 | S9.5-AC1 Liên kết Thống kê ôn tập hiện cả khi chưa có thẻ | Chức năng | Trình duyệt sạch, làm xong onboarding, chưa học bài nào. Mở Trang chủ | Có liên kết "Thống kê ôn tập" đứng ngay sau nút "Ôn tập"; vẫn có nút "Vào học", nút "Ôn tập", liên kết "Xem lộ trình"; Trang chủ **không** hiện số thẻ đến hạn ở đâu cả | e2e |
| TC-S9.5-AC1-4 | S9.5-AC1 Liên kết Thống kê ôn tập hiện cả khi chưa có thẻ | Offline | Đã mở app một lần khi có mạng, chưa có thẻ. Tắt mạng; mở lại app, vào Trang chủ | Trang chủ có liên kết "Thống kê ôn tập"; bấm vào thì vào màn thống kê hiện câu chưa có thẻ, không có lỗi mạng | e2e |
| TC-S9.5-AC1-5 | S9.5-AC1 Mở màn Thống kê ôn tập bằng bàn phím | A11y | Mở Trang chủ, chỉ dùng bàn phím: Tab tới "Thống kê ôn tập", nhấn Enter | Focus tới liên kết ngay sau nút "Ôn tập" (thứ tự Tab theo thứ tự trên màn); liên kết có viền focus nhìn thấy được; Enter đưa vào màn "Thống kê ôn tập" | e2e |
| TC-S9.5-AC1-6 | S9.5-AC1 Mở màn Thống kê ôn tập bằng bàn phím | A11y | Như TC-S9.5-AC1-5, chạy tay với VoiceOver hoặc NVDA | Tên đọc được của liên kết là "Thống kê ôn tập" và được đọc là liên kết | không |
| TC-S9.5-AC1-7 | S9.5-AC1 Liên kết Thống kê ôn tập hiện cả khi chưa có thẻ | Mobile 375 | Khổ 375×812, mở Trang chủ | "Vào học", "Ôn tập", "Thống kê ôn tập", "Xem lộ trình" hiện đủ chữ, không chồng nhau; "Thống kê ôn tập" vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.5-AC1-8 | S9.5-AC1 Mở màn Thống kê ôn tập bằng bàn phím | Sáng/Tối | Mở Trang chủ ở giao diện sáng rồi tối; Tab tới "Thống kê ôn tập" | Ở cả hai giao diện liên kết đọc rõ (≥ 4.5:1), nhận ra là liên kết; viền focus nhìn thấy (≥ 3:1) | không |

### Hồi quy Trang chủ (S8.1, S9.2)

Trang chủ thêm một liên kết; chạy lại case gốc trên bản build S9.5 (`openspec/changes/archive/2026-11-18-s8-1-home-screen/test-cases.md`,
`openspec/changes/s9-2-review-session/test-cases.md`, hoặc bản archive của S9.2 nếu đã archive):

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.1-AC1-8 | S8.1-AC1 Dùng được bằng bàn phím | A11y (hồi quy) | Chạy lại case gốc | Như case gốc; thứ tự Tab có thêm "Thống kê ôn tập" ngay sau "Ôn tập", vẫn theo thứ tự đọc trên màn | e2e |
| TC-S8.1-AC1-15 | S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ | Chức năng (hồi quy) | Chạy lại case gốc | Như case gốc | e2e |
| TC-S8.1-AC1-19 | S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ | Mobile 375 (hồi quy) | Chạy lại case gốc | Như case gốc; liên kết mới không đẩy phần cũ ra ngoài khổ, không cuộn ngang | không |
| TC-S8.1-AC1-20 | S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ | Sáng/Tối (hồi quy) | Chạy lại case gốc | Như case gốc | không |
| TC-S9.2-AC1-2 | S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ | Chức năng (hồi quy) | Chạy lại case gốc | Như case gốc; có thêm "Thống kê ôn tập" | e2e |
| TC-S9.2-AC1-4 | S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím | A11y (hồi quy) | Chạy lại case gốc | Như case gốc | e2e |

## Màn Thống kê ôn tập (`review-stats`)

### Hiện số thẻ theo từng trạng thái

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-9 | S9.5-AC1 Ba nhóm theo trạng thái thẻ | Chức năng | Nạp sẵn 6 thẻ "mới" của 6 từ có trong app. Mở màn ôn tập; chấm "Được" thẻ 1, chấm "Dễ" thẻ 2 và thẻ 3; bấm "Về Trang chủ"; mở màn thống kê | "Mới" 3 / "Đang học" 1 / "Đã nhớ" 2, đúng thứ tự đó | e2e |
| TC-S9.5-AC1-10 | S9.5-AC1 Ba nhóm theo trạng thái thẻ | Chức năng | QA chạy tay: xong bài 1, mở màn thống kê, ghi số "Mới" = N. Về Trang chủ, bấm "Ôn tập"; chấm "Được" 1 thẻ, chấm "Dễ" 2 thẻ; bấm "Về Trang chủ"; mở màn thống kê | "Mới" N − 3 / "Đang học" 1 / "Đã nhớ" 2 | không |
| TC-S9.5-AC1-11 | S9.5-AC1 Ba nhóm theo trạng thái thẻ | Biên | Chỉ kiểm tầng quy tắc (Vitest): thẻ "mới" chấm "Quên", "Khó", "Được", "Dễ" (mỗi mức một thẻ) | "Quên", "Khó", "Được" → "Đang học"; "Dễ" → "Đã nhớ" (khớp bước học ngắn của S9.2). QA đọc kết quả Vitest | không |
| TC-S9.5-AC1-12 | S9.5-AC1 Thẻ đã nhớ chấm Quên thì về Đang học | Chức năng | Nạp sẵn `"你好" nghĩa` là thẻ Đã nhớ, tới hạn từ hôm qua. Mở màn thống kê (ghi lại); về Trang chủ, bấm "Ôn tập", chấm "Quên"; bấm "Về Trang chủ"; mở màn thống kê | Lần đầu: "Mới" 0 / "Đang học" 0 / "Đã nhớ" 1. Lần sau: "Mới" 0 / "Đang học" 1 / "Đã nhớ" 0 | e2e |
| TC-S9.5-AC1-13 | S9.5-AC1 Thẻ đã nhớ chấm Quên thì về Đang học | Chức năng | QA chạy tay: nhập file mẫu dev cung cấp có `"你好" nghĩa` Đã nhớ đã tới hạn (đặt đồng hồ máy theo file), "Ghi đè"; làm như TC-S9.5-AC1-12 | Như TC-S9.5-AC1-12 | không |
| TC-S9.5-AC1-14 | S9.5-AC1 Thẻ đã nhớ quá hạn vẫn ở nhóm Đã nhớ | Chức năng | Nạp sẵn 1 thẻ Đã nhớ (đã chấm "Dễ") có thời điểm ôn tiếp theo 10:00 Thứ Sáu 20/11 (quá hạn 3 ngày). Mở màn thống kê | "Mới" 0 / "Đang học" 0 / "Đã nhớ" 1; bảng dự báo "Hôm nay" 1 | e2e |

### Đếm theo thẻ, không theo từ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-15 | S9.5-AC1 Đếm theo thẻ, không theo từ | Chức năng | Nạp sẵn chỉ ba thẻ của "你好": `"你好" nghĩa` Đã nhớ, `"你好" nghe` Đang học, `"你好" viết` "mới". Mở màn thống kê | "Mới" 1 / "Đang học" 1 / "Đã nhớ" 1 (tổng 3, không phải 1) | e2e |

### Thẻ bị bỏ qua không được đếm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-16 | S9.5-AC1 Thẻ bị bỏ qua không được đếm | Chức năng | Nạp sẵn `"你好" nghĩa` "mới", một thẻ "mới" của từ không có trong app; giả lập một thẻ đọc không được. Mở màn thống kê | "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0; không có câu lỗi hay thông báo lỗi nào | e2e |
| TC-S9.5-AC1-17 | S9.5-AC1 Thẻ bị bỏ qua không được đếm | Biên | Nạp sẵn `"你好" nghĩa` "mới" và một thẻ Đã nhớ của từ không có trong app, ôn tiếp theo 15:00 hôm nay. Mở màn thống kê | "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0; bảng dự báo cả 7 dòng 0 (thẻ bị bỏ qua cũng không vào dự báo) | e2e |
| TC-S9.5-AC1-18 | S9.5-AC1 Thẻ bị bỏ qua không được đếm | Chức năng | QA chạy tay: đặt đồng hồ máy theo file, nhập `thong-ke-bo-qua`, "Ghi đè"; mở màn thống kê | "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0; bảng 7 dòng 0; không có thông báo lỗi | không |

### Dự báo số lượt ôn mỗi ngày trong 7 ngày tới

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-1 | S9.5-AC2 Bảng 7 dòng với nhãn ngày | Chức năng | Đồng hồ 10:00 Thứ Hai 23/11. Nạp sẵn 1 thẻ Đã nhớ ôn tiếp theo sau 30 ngày. Mở màn thống kê | Bảng "Dự báo lượt ôn 7 ngày tới", cột "Ngày" và "Số lượt ôn", đúng 7 dòng theo thứ tự "Hôm nay", "Ngày mai", "Thứ Tư 25/11", "Thứ Năm 26/11", "Thứ Sáu 27/11", "Thứ Bảy 28/11", "Chủ nhật 29/11"; ngay dưới bảng có câu "Không tính thẻ mới." | e2e |
| TC-S9.5-AC2-3 | S9.5-AC2 Bảng 7 dòng với nhãn ngày | Chức năng | QA chạy tay: có ít nhất một thẻ (xong bài 1); mở màn thống kê, đối chiếu với lịch của máy | Dòng 1 "Hôm nay", dòng 2 "Ngày mai", dòng 3–7 đúng thứ và ngày/tháng của 5 ngày kế tiếp theo lịch máy, viết như "Thứ Tư 25/11" (không thêm số 0, không có năm); có câu "Không tính thẻ mới." ngay dưới bảng | không |

### Nhãn ngày trong bảng dự báo

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-2 | S9.5-AC2 Nhãn ngày một chữ số và sang năm mới | Biên | Đồng hồ 10:00 Thứ Hai 28/12/2026 (qua tháng và qua năm). Nạp sẵn như TC-S9.5-AC2-1. Mở màn thống kê | 7 dòng đúng từng chữ, theo thứ tự: "Hôm nay", "Ngày mai", "Thứ Tư 30/12", "Thứ Năm 31/12", "Thứ Sáu 1/1", "Thứ Bảy 2/1", "Chủ nhật 3/1"; **không** có "01/01", "02/01", "03/01" hay năm ("2027") ở nhãn nào | e2e |

### Thẻ nào được đếm vào ngày nào

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-4 | S9.5-AC2 Mỗi thẻ đếm vào ngày ôn tiếp theo | Chức năng | Đồng hồ 10:00 Thứ Hai 23/11. Nạp sẵn 4 thẻ đã chấm, ôn tiếp theo: 15:00 hôm nay (2 thẻ), 08:00 Thứ Tư 25/11, 23:59 Chủ nhật 29/11. Mở màn thống kê | "Hôm nay" 2, "Ngày mai" 0, "Thứ Tư 25/11" 1, "Thứ Năm 26/11" 0, "Thứ Sáu 27/11" 0, "Thứ Bảy 28/11" 0, "Chủ nhật 29/11" 1 | e2e |
| TC-S9.5-AC2-5 | S9.5-AC2 Mỗi thẻ đếm vào ngày ôn tiếp theo | Biên | Như TC-S9.5-AC2-4 nhưng thẻ 15:00 hôm nay là thẻ Đang học (bước học ngắn), các thẻ khác Đã nhớ | Kết quả như TC-S9.5-AC2-4 (thẻ Đang học cũng được đếm theo thời điểm ôn tiếp theo) | e2e |
| TC-S9.5-AC2-6 | S9.5-AC2 Mỗi thẻ đếm vào ngày ôn tiếp theo | Chức năng | QA chạy tay: đặt đồng hồ máy theo file, nhập `thong-ke-3-nhom`, "Ghi đè"; mở màn thống kê | Ba nhóm và 7 dòng khớp bảng kết quả dev ghi kèm file | không |
| TC-S9.5-AC2-7 | S9.5-AC2 Thẻ quá hạn đếm vào Hôm nay | Chức năng | Đồng hồ 10:00 Thứ Hai 23/11. Nạp sẵn 2 thẻ đã chấm, ôn tiếp theo 08:00 Thứ Sáu 20/11 và 09:00 hôm nay. Mở màn thống kê | "Hôm nay" 2; các dòng còn lại 0 | e2e |
| TC-S9.5-AC2-8 | S9.5-AC2 Thẻ quá hạn đếm vào Hôm nay | Biên | Đồng hồ 10:00 Thứ Hai 23/11. Nạp sẵn 1 thẻ đã chấm, ôn tiếp theo 08:00 ngày 23/10 (quá hạn 1 tháng) | "Hôm nay" 1 | e2e |
| TC-S9.5-AC2-9 | S9.5-AC2 Ranh giới nửa đêm theo giờ máy | Biên | Đồng hồ 23:55 Thứ Hai 23/11. Nạp sẵn 2 thẻ đã chấm, ôn tiếp theo 23:59 Thứ Hai 23/11 và 00:05 Thứ Ba 24/11. Mở màn thống kê | "Hôm nay" 1, "Ngày mai" 1, các dòng còn lại 0 | e2e |
| TC-S9.5-AC2-10 | S9.5-AC2 Ranh giới nửa đêm theo giờ máy | Biên | Đồng hồ 00:05 Thứ Ba 24/11. Nạp sẵn 2 thẻ đã chấm, ôn tiếp theo 23:59 Thứ Hai 23/11 và 00:00 Thứ Ba 24/11. Mở màn thống kê | "Hôm nay" 2 (thẻ của hôm qua là quá hạn); dòng 2 là "Ngày mai" = 25/11 và dòng 3 là "Thứ Năm 26/11" | e2e |
| TC-S9.5-AC2-11 | S9.5-AC2 Thẻ ôn sau 7 ngày không được đếm | Biên | Đồng hồ 10:00 Thứ Hai 23/11. Nạp sẵn chỉ 1 thẻ đã chấm, ôn tiếp theo 00:00 Thứ Hai 30/11. Mở màn thống kê | Cả 7 dòng 0; "Đã nhớ" 1 (thẻ vẫn được đếm ở nhóm) | e2e |
| TC-S9.5-AC2-12 | S9.5-AC2 Thẻ mới không được đếm trong dự báo | Chức năng | Nạp sẵn 5 thẻ "mới", không có thẻ đã chấm. Mở màn thống kê | "Mới" 5 / "Đang học" 0 / "Đã nhớ" 0; bảng hiện đủ 7 dòng, cả 7 dòng 0; có câu "Không tính thẻ mới."; **không** hiện câu chưa có thẻ | e2e |
| TC-S9.5-AC2-13 | S9.5-AC2 Thẻ mới không được đếm trong dự báo | Chức năng | QA chạy tay: trình duyệt sạch, xong bài 1, chưa ôn lần nào; mở màn thống kê | "Đang học" 0, "Đã nhớ" 0, "Mới" lớn hơn 0; 7 dòng của bảng đều 0 | không |

### Dự báo không áp giới hạn mỗi ngày

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-14 | S9.5-AC2 Không áp giới hạn mỗi ngày | Chức năng | Cài đặt "Lượt ôn mỗi ngày" là "200 lượt". Nạp sẵn 201 thẻ đã chấm, ôn tiếp theo trong hôm nay (trước hoặc sau 10:00). Mở màn thống kê | "Hôm nay" 201 | e2e |
| TC-S9.5-AC2-15 | S9.5-AC2 Không áp giới hạn mỗi ngày | Biên | Cài đặt "Lượt ôn mỗi ngày" chọn mức nhỏ nhất có; "Thẻ mới mỗi ngày" chọn "0 thẻ". Nạp sẵn như TC-S9.5-AC2-14 và 5 thẻ "mới". Mở màn thống kê | "Hôm nay" 201; "Mới" 5 (giới hạn không đổi nhóm hay dự báo) | e2e |

### Số liệu tính lúc mở màn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-19 | S9.5-AC1 Mở lại màn sau khi ôn thì số liệu mới | Chức năng | Nạp sẵn 1 thẻ "mới". Mở màn thống kê; bấm "Về Trang chủ"; bấm "Ôn tập", chấm "Dễ"; bấm "Về Trang chủ"; mở màn thống kê | Lần đầu: "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0. Lần sau: "Mới" 0 / "Đang học" 0 / "Đã nhớ" 1 | e2e |
| TC-S9.5-AC1-20 | S9.5-AC1 Mở lại màn sau khi ôn thì số liệu mới | Chức năng | QA chạy tay: xong bài 1; mở màn thống kê, ghi ba số; về Trang chủ, "Ôn tập", chấm "Dễ" 1 thẻ; về Trang chủ, mở màn thống kê | "Mới" giảm 1, "Đã nhớ" tăng 1, "Đang học" không đổi | không |
| TC-S9.5-AC1-21 | S9.5-AC1 Mở lại màn sau khi ôn thì số liệu mới | Biên | Đồng hồ 23:58 Thứ Hai 23/11. Nạp sẵn 1 thẻ đã chấm ôn tiếp theo 08:00 Thứ Ba 24/11. Mở màn thống kê; tua đồng hồ qua 00:05 Thứ Ba 24/11, để màn mở; rồi bấm "Về Trang chủ" và mở lại màn thống kê | Khi màn đang mở: số liệu và nhãn không đổi ("Hôm nay" 0, "Ngày mai" 1). Sau khi mở lại: "Hôm nay" 1, dòng 3 là "Thứ Năm 26/11" | e2e |
| TC-S9.5-AC1-22 | S9.5-AC1 Mở lại màn sau khi ôn thì số liệu mới | Biên | Nạp sẵn 1 thẻ "mới", 1 thẻ Đang học, 1 thẻ Đã nhớ quá hạn. Đọc thẻ từ phía test; mở màn thống kê; bấm "Về Trang chủ"; đọc thẻ từ phía test lần nữa | Trạng thái và thời điểm ôn tiếp theo của cả 3 thẻ không đổi (màn chỉ đọc) | e2e |

### Màn Thống kê ôn tập khi chưa có thẻ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-23 | S9.5-AC1 Chưa có thẻ nào | Chức năng | Trình duyệt sạch, xong onboarding, chưa học bài nào. Mở màn thống kê | Tiêu đề "Thống kê ôn tập"; câu chưa có thẻ; **đúng một** liên kết "Về Trang chủ", ở đầu màn (không có liên kết hay nút "Về Trang chủ" thứ hai cạnh câu); **không** có nhãn "Mới", "Đang học", "Đã nhớ", không có bảng dự báo, không có câu "Không tính thẻ mới." | e2e |
| TC-S9.5-AC1-24 | S9.5-AC1 Chưa có thẻ nào | Biên | Chỉ có thẻ bị bỏ qua: nạp sẵn 1 thẻ "mới" của từ không có trong app; giả lập 1 thẻ đọc không được. Mở màn thống kê | Như TC-S9.5-AC1-23 (câu chưa có thẻ), không có câu lỗi | e2e |
| TC-S9.5-AC1-25 | S9.5-AC1 Chưa có thẻ nào | Chức năng | QA chạy tay: trình duyệt sạch, xong onboarding; mở màn thống kê; bấm "Về Trang chủ" | Như TC-S9.5-AC1-23; bấm "Về Trang chủ" thì vào Trang chủ | không |

### Không tải được thống kê thì thử lại được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-26 | S9.5-AC1 Không tải được thống kê | Chức năng | Nạp sẵn 1 thẻ "mới"; giả lập lỗi đọc thẻ. Mở màn thống kê | Câu lỗi hiện và được đọc tự động; có nút "Thử lại"; **đúng một** liên kết "Về Trang chủ", ở đầu màn (không có "Về Trang chủ" thứ hai cạnh câu lỗi); không có ba nhóm, bảng dự báo hay câu chưa có thẻ | e2e |
| TC-S9.5-AC1-27 | S9.5-AC1 Không tải được thống kê | A11y | Như TC-S9.5-AC1-26, chạy tay với VoiceOver hoặc NVDA (QA dựng lỗi theo cách dev ghi trong design.md; không dựng được thì đọc kết quả e2e và ghi "không chạy được") | Nghe được câu lỗi mà không phải di chuyển tới nó; Tab tới "Thử lại" có viền focus, tên đọc được "Thử lại" | không |
| TC-S9.5-AC1-28 | S9.5-AC1 Thử lại sau lỗi | Chức năng | Như TC-S9.5-AC1-26; bỏ giả lập lỗi; bấm "Thử lại" | Hiện "Mới" 1 / "Đang học" 0 / "Đã nhớ" 0 và bảng dự báo 7 dòng; câu lỗi và nút "Thử lại" không còn | e2e |
| TC-S9.5-AC1-29 | S9.5-AC1 Thử lại sau lỗi | Biên | Như TC-S9.5-AC1-26, giữ giả lập lỗi; bấm "Thử lại"; rồi bấm "Về Trang chủ" | Sau "Thử lại": vẫn câu lỗi (được đọc tự động lại), "Thử lại" và đúng một "Về Trang chủ" ở đầu màn. Bấm "Về Trang chủ": vào Trang chủ | e2e |
| TC-S9.5-AC1-30 | S9.5-AC1 Thử lại sau lỗi | A11y | Như TC-S9.5-AC1-28 nhưng chỉ dùng bàn phím: Tab tới "Thử lại", nhấn Enter | "Thử lại" có viền focus; Enter cho kết quả như TC-S9.5-AC1-28 | e2e |

### Rời màn Thống kê ôn tập

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-31 | S9.5-AC1 Về Trang chủ từ màn Thống kê ôn tập | Chức năng | Nạp sẵn 1 thẻ "mới". Mở màn thống kê; bấm "Về Trang chủ" ở đầu màn | Vào Trang chủ | e2e |
| TC-S9.5-AC1-32 | S9.5-AC1 Về Trang chủ từ màn Thống kê ôn tập | Biên | Mở màn thống kê ở ba trạng thái: có số liệu, chưa có thẻ, lỗi (giả lập) | Ở cả ba trạng thái: tiêu đề "Thống kê ôn tập" và **đúng một** liên kết hoặc nút có chữ "Về Trang chủ" trên màn, nằm ở đầu màn; bấm vào thì vào Trang chủ | e2e |

### Focus khi mở màn Thống kê ôn tập

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-38 | S9.5-AC1 Focus khi mở màn | A11y | Nạp sẵn 1 thẻ "mới"; giả lập lỗi đọc thẻ. Ở Trang chủ chỉ dùng bàn phím: Tab tới "Thống kê ôn tập", nhấn Enter; rồi nhấn Tab, nhấn Tab lần nữa | Câu lỗi được đọc tự động; ngay sau khi màn mở, focus không nằm ở câu lỗi, tiêu đề hay vùng nào khác của màn. Tab lần đầu: focus ở "Về Trang chủ"; Tab lần hai: focus ở "Thử lại"; cả hai có viền focus nhìn thấy được | e2e |
| TC-S9.5-AC1-39 | S9.5-AC1 Focus khi mở màn | Biên | Như TC-S9.5-AC1-38 nhưng ở hai trạng thái còn lại: (a) nạp sẵn 1 thẻ "mới", không lỗi; (b) chưa có thẻ nào | Ở cả (a) và (b): ngay sau khi màn mở, focus không nằm ở vùng nào của màn (không ở tiêu đề, ba nhóm, bảng, câu chưa có thẻ); Tab lần đầu: focus ở "Về Trang chủ" | e2e |
| TC-S9.5-AC1-40 | S9.5-AC1 Focus khi mở màn | A11y | Như TC-S9.5-AC1-38, chạy tay với VoiceOver hoặc NVDA (dựng lỗi theo cách dev ghi trong design.md; không dựng được thì đọc kết quả e2e và ghi "không chạy được") | Nghe câu lỗi ngay khi màn mở mà không di chuyển con trỏ đọc; Tab lần đầu nghe "Về Trang chủ, liên kết", lần hai nghe "Thử lại, nút" | không |

### Focus sau khi Thử lại

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC1-41 | S9.5-AC1 Focus sau khi Thử lại thành công | A11y | Nạp sẵn 1 thẻ Đã nhớ; giả lập lỗi đọc thẻ; mở màn thống kê. Bỏ giả lập lỗi; chỉ dùng bàn phím Tab tới "Thử lại", nhấn Enter; rồi nhấn Tab / Shift+Tab đi hết một vòng | Sau Enter: ba nhóm và bảng hiện; focus ở tiêu đề chính "Thống kê ôn tập" (không ở đầu trang, không mất focus), có viền focus nhìn thấy được. Khi Tab / Shift+Tab đi hết vòng, focus không bao giờ dừng lại ở tiêu đề | e2e |
| TC-S9.5-AC1-42 | S9.5-AC1 Focus sau khi Thử lại mà chưa có thẻ | A11y | Chưa có thẻ nào; giả lập lỗi đọc thẻ; mở màn thống kê. Bỏ giả lập lỗi; Tab tới "Thử lại", nhấn Enter; rồi Tab / Shift+Tab đi hết một vòng | Sau Enter: hiện câu chưa có thẻ; focus ở câu đó, có viền focus nhìn thấy được, tên đọc được đúng là "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."; khi Tab đi hết vòng, focus không dừng lại ở câu đó | e2e |
| TC-S9.5-AC1-43 | S9.5-AC1 Focus khi Thử lại vẫn lỗi | A11y | Nạp sẵn 1 thẻ "mới"; giả lập lỗi đọc thẻ, giữ lỗi; mở màn thống kê. Tab tới "Thử lại", nhấn Enter | Focus vẫn ở nút "Thử lại" (có viền focus); câu lỗi được đọc tự động lại lần nữa | e2e |
| TC-S9.5-AC1-44 | S9.5-AC1 Focus sau khi Thử lại thành công | A11y | Chạy tay với VoiceOver hoặc NVDA ba lần như TC-S9.5-AC1-41, -42, -43 (dựng lỗi theo design.md; không dựng được thì đọc kết quả e2e và ghi "không chạy được") | Thành công có thẻ: nghe "Thống kê ôn tập" (tiêu đề). Thành công chưa có thẻ: nghe câu chưa có thẻ. Vẫn lỗi: nghe lại câu lỗi | không |
| TC-S9.5-AC1-45 | S9.5-AC1 Focus sau khi Thử lại thành công | Sáng/Tối | Như TC-S9.5-AC1-41 và -42, ở giao diện sáng rồi tối | Viền focus quanh tiêu đề "Thống kê ôn tập" và quanh câu chưa có thẻ nhìn thấy được, ≥ 3:1 với nền ở cả hai giao diện | không |

### Thống kê ôn tập dùng được khi offline

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-16 | S9.5-AC2 Xem thống kê khi offline | Offline | Đã mở app một lần khi có mạng. Nạp sẵn 1 thẻ "mới" và 1 thẻ Đã nhớ ôn tiếp theo 08:00 Thứ Tư 25/11. Tắt mạng; mở lại app, vào Trang chủ, bấm "Thống kê ôn tập" | "Mới" 1 / "Đang học" 0 / "Đã nhớ" 1; bảng 7 dòng, "Thứ Tư 25/11" 1, các dòng khác 0; không có lỗi mạng | e2e |
| TC-S9.5-AC2-17 | S9.5-AC2 Xem thống kê khi offline | Offline | QA chạy tay trên điện thoại thật đã cài app: xong bài 1, chấm "Dễ" 1 thẻ khi có mạng. Bật chế độ máy bay, đóng hẳn app, mở lại, bấm "Thống kê ôn tập" | Màn hiện ba nhóm ("Đã nhớ" 1) và bảng 7 dòng; không có lỗi mạng | không |

### Đọc và dùng được màn Thống kê ôn tập

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.5-AC2-18 | S9.5-AC2 Bảng dự báo đọc được bằng trình đọc màn hình | A11y | Nạp sẵn 1 thẻ mỗi nhóm. Mở màn thống kê; kiểm qua cây trợ năng | Tiêu đề chính (cấp cao nhất) là "Thống kê ôn tập"; có bảng tên "Dự báo lượt ôn 7 ngày tới", 2 tiêu đề cột "Ngày", "Số lượt ôn", 7 dòng dữ liệu; mỗi số của ba nhóm gắn với nhãn "Mới", "Đang học", "Đã nhớ" | e2e |
| TC-S9.5-AC2-19 | S9.5-AC2 Bảng dự báo đọc được bằng trình đọc màn hình | A11y | Như TC-S9.5-AC2-18, chạy tay với VoiceOver (Safari) hoặc NVDA (Firefox/Chrome): đi theo tiêu đề, rồi vào bảng và di chuyển từng ô bằng phím điều hướng bảng | Nghe tiêu đề "Thống kê ôn tập"; khi vào bảng nghe tên "Dự báo lượt ôn 7 ngày tới" và số dòng/cột; mỗi ô số được đọc kèm tiêu đề cột "Số lượt ôn" và nhãn ngày của dòng; mỗi số nhóm được đọc cùng nhãn nhóm (không đọc số trơ trọi) | không |
| TC-S9.5-AC2-20 | S9.5-AC2 Bảng dự báo đọc được bằng trình đọc màn hình | A11y | Mở màn thống kê có số liệu; xem trên màn hình; bật "giảm chuyển động" và tắt, mở lại | Mỗi số nhóm có nhãn chữ cạnh bên, không phân biệt chỉ bằng màu; không có biểu đồ; không có hiệu ứng chuyển động khi mở màn hay khi hiện số | không |
| TC-S9.5-AC1-33 | S9.5-AC1 Dùng màn Thống kê ôn tập bằng bàn phím | A11y | Nạp sẵn 1 thẻ "mới". Mở màn thống kê; chỉ dùng bàn phím: Tab tới "Về Trang chủ", nhấn Enter | "Về Trang chủ" tới được bằng Tab, có viền focus nhìn thấy được; Enter đưa vào Trang chủ | e2e |
| TC-S9.5-AC1-34 | S9.5-AC1 Dùng màn Thống kê ôn tập bằng bàn phím | A11y | Ở màn thống kê có số liệu, nhấn Tab / Shift+Tab đi hết một vòng | Mọi liên kết, nút tới được và có viền focus; thứ tự focus theo thứ tự trên màn; focus không kẹt | không |
| TC-S9.5-AC1-35 | S9.5-AC1 Khổ 375 px không cuộn ngang | Mobile 375 | Khổ 375×812. Nạp sẵn thẻ ở cả ba nhóm, trong đó 201 thẻ Đã nhớ ôn tiếp theo hôm nay (số 3 chữ số), và đồng hồ ở ngày có nhãn dài nhất ("Chủ nhật …" ở một dòng). Mở màn thống kê, cuộn dọc tới cuối | Không cuộn ngang; thấy đủ ba nhóm, 7 dòng của bảng và câu "Không tính thẻ mới." khi cuộn dọc | e2e |
| TC-S9.5-AC1-36 | S9.5-AC1 Khổ 375 px không cuộn ngang | Mobile 375 | QA chạy tay trên điện thoại thật (hoặc khổ 375×812): xem màn thống kê ở ba trạng thái có số liệu, chưa có thẻ, lỗi (đọc ảnh chụp e2e cho màn lỗi) | Chữ và số hiện đủ, không bị cắt hay chồng; nhãn ngày không bị xuống dòng làm lệch số; "Về Trang chủ", "Thử lại" vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.5-AC1-37 | S9.5-AC1 Dùng màn Thống kê ôn tập bằng bàn phím | Sáng/Tối | Màn thống kê có số liệu, chưa có thẻ, lỗi; mỗi trạng thái ở giao diện sáng rồi tối; Tab qua các liên kết/nút | Ở cả hai giao diện: tiêu đề, nhãn nhóm, số, tiêu đề cột, nhãn ngày, câu "Không tính thẻ mới.", câu chưa có thẻ, câu lỗi đọc rõ (≥ 4.5:1); đường kẻ/nền phân dòng bảng nhìn thấy; viền focus ≥ 3:1 | không |

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| S9.5-AC1: Ba nhóm theo trạng thái thẻ, Thẻ đã nhớ chấm Quên…, Thẻ đã nhớ quá hạn…, Đếm theo thẻ | Vitest quy tắc xếp nhóm (hàm thuần) | Theo trạng thái nhớ, không theo hạn; mỗi chiều một thẻ |
| S9.5-AC1: Thẻ bị bỏ qua không được đếm, Chưa có thẻ nào (chỉ thẻ bị bỏ qua) | Vitest use case "lấy thống kê ôn tập" với store giả | Không đếm ở nhóm và dự báo; không throw |
| S9.5-AC2: Bảng 7 dòng, Mỗi thẻ đếm vào ngày…, Quá hạn…, Ranh giới nửa đêm, Sau 7 ngày, Thẻ mới, Không áp giới hạn | Vitest quy tắc dự báo (giờ cố định, truyền "bây giờ") + util nhãn ngày | Ngày theo giờ máy như S8.1; qua tháng/năm; nhãn không thêm số 0, không năm ("Thứ Sáu 1/1") |
| S9.5-AC1: Mở lại màn sau khi ôn…, số liệu không tự đổi, màn chỉ đọc | Testing Library (hook tính một lần lúc mở) + e2e | Không ghi store khi mở màn |
| S9.5-AC1: Không tải được, Thử lại | Vitest use case (store giả ném lỗi) + Testing Library màn | Vùng đọc tự động |
| S9.5-AC1: Focus khi mở màn, Focus sau khi Thử lại (thành công, chưa có thẻ, vẫn lỗi) | Testing Library màn + e2e | Không đặt focus khi mở; sau Thử lại focus theo bảng của spec, vùng nhận focus ngoài thứ tự Tab |
| S9.5-AC1/AC2: A11y, bàn phím, 375, offline; `home-screen` liên kết | Testing Library (role table, columnheader, heading) + e2e | Offline và 375 chỉ e2e |
