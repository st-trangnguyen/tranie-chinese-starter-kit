# Test cases: S9.3 Giới hạn mỗi ngày

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/review-session/spec.md`,
`specs/settings/spec.md` và `specs/progress-backup/spec.md`. Hai câu hỏi về dữ liệu trong Open Questions của proposal đã được người thật
chốt (2026-11-23) đúng như đề xuất của `ba`: số thẻ mới / lượt ôn đã chấm nằm trong bản ghi từng ngày có sẵn; hai giới hạn vào file sao
lưu, giá trị sai thì từ chối cả file, file cũ về "20 thẻ" / "200 lượt". Các case dưới đây viết theo quyết định đã chốt.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev). Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, chưa có thẻ ôn
  tập nào, **chưa từng chỉnh giới hạn** (Cài đặt đang là "20 thẻ" và "200 lượt"), hôm nay chưa chấm thẻ nào, có mạng, trừ khi case nêu
  khác.
- **Dùng lại quy ước của S9.2** (`openspec/changes/s9-2-review-session/test-cases.md`, mục "Điều kiện đầu chung"): cách viết thẻ
  `"<từ>" <chiều>`, "mới", "đã chấm", **Nạp sẵn thẻ**, **Tua đồng hồ**, **Đọc thẻ từ phía test**, thứ tự hỏi **Q1–Q4 / V1–V4**, "Bước
  học ngắn", "Phiên có N thẻ" (màn hiện "Thẻ 1 / N"), "Chấm X", "Giả lập lỗi" ("lỗi lưu"), "Được đọc tự động", "Tên đọc được", "Không
  nằm trong thứ tự Tab", "Tắt mạng", "Mở lại app", "Ngưỡng nhìn rõ".
- **Câu giới hạn** = "Đã đạt giới hạn ôn tập hôm nay. Vẫn còn thẻ đến hạn; bạn có thể tăng giới hạn trong Cài đặt." (đúng từng chữ).
- **"N thẻ mới" khi nạp sẵn** (chỉ e2e): N thẻ "mới" của N từ khác nhau có trong app, cùng chiều nghĩa trừ khi case ghi khác, nên thứ
  tự hỏi giữa chúng theo lộ trình (Q4). "M thẻ đã chấm đến hạn": M thẻ đã chấm với thời điểm ôn tiếp theo khác nhau, tất cả trước lúc mở
  màn; thứ tự hỏi theo hạn (Q2).
- **Nạp sẵn số đã chấm** (chỉ e2e, cùng cách với nạp sẵn thẻ; cách nạp thuộc phần test của PR code): đặt sẵn số thẻ mới và số lượt ôn
  đã chấm của một ngày cụ thể (hôm nay, hôm qua). Khi case ghi "hôm nay đã chấm K thẻ mới", test nạp thêm K thẻ đã chấm tương ứng ở trạng
  thái đã chấm, **còn ít nhất 1 ngày nữa mới tới hạn**, để dữ liệu khớp thực tế và K thẻ đó không vào phiên.
- **Đọc số đã chấm từ phía test** (chỉ e2e, như "Đọc thẻ từ phía test"): kiểm số thẻ mới và số lượt ôn đã lưu của một ngày. Người học
  không thấy hai số này trên màn nào; QA chạy tay chỉ kiểm hành vi nhìn thấy ("Thẻ 1 / N", câu giới hạn ở lần mở sau).
- **Đồng hồ**: e2e cố định đồng hồ ở 10:00 trong ngày, trừ case nêu giờ khác (để không vô tình qua nửa đêm). QA chạy tay không chạy
  case cần giờ cụ thể (00:05, 23:58), chỉ đọc kết quả e2e.
- **Giả lập** (chỉ e2e, cách giả lập thuộc phần test của PR code, bản build không có công tắc hay màn ẩn nào):
  - "số đã chấm hôm nay hỏng": số thẻ mới / lượt ôn đã lưu của hôm nay không đọc được.
  - "giới hạn đã lưu hỏng": giá trị đã lưu của "Thẻ mới mỗi ngày" (hoặc "Lượt ôn mỗi ngày") không đọc được, các cài đặt khác đọc được.
  - "cài đặt không đọc được": như "Không đọc được cài đặt" của S8.2 (tạo lỗi khi đang ở màn Lộ trình, không đi qua trang bắt đầu).
  - "không lưu được cài đặt": như S8.2, lần ghi cài đặt kế tiếp bị lỗi.
  - "lỗi lưu": như S9.2, lần lưu mức chấm kế tiếp bị lỗi.
- **Dựng dữ liệu khi chạy tay**: thẻ "mới" và số đã chấm dựng bằng file sao lưu mẫu (dev cung cấp cùng PR code, đường dẫn ghi trong
  design.md, kèm ngày cần đặt đồng hồ máy nếu file có thẻ đã chấm), nhập qua Cài đặt → "Sao lưu tiến độ" → "Nhập tiến độ" → "Ghi đè".
  Số đã chấm hôm nay dựng bằng chấm thật trên màn ôn tập (chấm "Dễ" để thẻ không quay lại trong ngày).
- **File mẫu** (dev cung cấp cùng PR code; e2e dùng cùng bộ file). Phần không nêu là hợp lệ, đúng định dạng mới:
  - `moi-25`: 25 thẻ chiều nghĩa "mới" của 25 từ có trong app, không có thẻ đã chấm, không có số đã chấm.
  - `cham-60`: 60 thẻ đã chấm, tới hạn từ ngày ghi kèm file trở về trước; không có thẻ "mới".
  - `ban-truoc-s9-3`: **file bản S9.1**, do bản app từ S9.1 tới trước S9.3 xuất (bản trên `main` sau code S9.1, trước khi merge code
    S9.3): có thẻ, chưa có giới hạn và số đã chấm. Có 25 thẻ chiều nghĩa "mới" của 25 từ có trong app, không có thẻ đã chấm nào.
  - `ban-truoc-s9-1`: **file bản trước S9.1**, do bản app trước S9.1 xuất: chưa có thẻ ôn tập, có ít nhất một bài đã học xong và số phút
    học của vài ngày.
  - `moi-22-bo-qua-2`: 22 thẻ chiều nghĩa "mới" của 22 từ có trong app và 2 thẻ chiều nghĩa "mới" của từ không có trong nội dung app (như
    file `the-tu-la` của S9.1); không có thẻ đã chấm.
  - `moi-20-bo-qua-2`: như `moi-22-bo-qua-2` nhưng 20 thẻ "mới" của từ có trong app.
  - `so-chu`: một ngày có số lượt ôn đã chấm là chữ "ba".
  - `thieu-so-moi`: 25 thẻ chiều nghĩa "mới", không có thẻ đã chấm; ngày ghi kèm file có số lượt ôn đã chấm (5) nhưng không có số thẻ mới
    đã chấm. Chạy với đồng hồ (e2e) hoặc đồng hồ máy (chạy tay) ở đúng ngày ghi kèm file.
  - `gioi-han-25`: giới hạn thẻ mới là 25 (không thuộc các mức của Cài đặt).
  - `luot-150`: giới hạn lượt ôn là 150 (không thuộc các mức của Cài đặt).
  - `luot-am`: một ngày có số lượt ôn đã chấm là -3.
  - `so-le`: một ngày có số thẻ mới đã chấm là 2.5.
  - `D-2 đạt · D-1 chỉ ôn · hôm nay 0 phút`: dữ liệu ngày nạp như S8.3 (mục tiêu 15 phút): hôm kia đạt mục tiêu, hôm qua 0 phút nhưng đã
    chấm 5 thẻ mới, hôm nay 0 phút (chỉ e2e).
- **Dòng streak** đọc nguyên văn "Chuỗi ngày học: N ngày" (S8.3); **số phút hôm nay** đọc ở dòng "Hôm nay: X / Y phút" (S8.1).
- **Máy A / máy B**: như S8.5, hai phiên trình duyệt tách dữ liệu (e2e) hoặc hai hồ sơ trình duyệt / hai máy (chạy tay).

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (thao tác thật trên bản build, có thể nạp sẵn thẻ và số đã chấm, tua đồng
hồ, giả lập, đọc thẻ và số đã chấm từ phía test). `không` = QA chạy tay mỗi lần nghiệm thu, hoặc chỉ kiểm được bằng Vitest (ghi rõ
trong cột Các bước).

## Màn ôn tập (`review-session`)

### Giới hạn thẻ mới và lượt ôn mỗi ngày

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-1 | S9.3-AC1 Mặc định tối đa 20 thẻ mới | Chức năng | Nạp sẵn 25 thẻ mới, không có thẻ đã chấm. Mở màn ôn tập; chấm "Dễ" cả 20 thẻ, ghi mặt hỏi từng thẻ; đọc thẻ từ phía test | Mở màn: "Thẻ 1 / 20". 20 thẻ được hỏi là 20 thẻ đứng trước theo thứ tự hỏi (Q4). 5 thẻ còn lại là 5 thẻ đứng sau cùng, vẫn "mới", thời điểm ôn tiếp theo như lúc nạp | e2e |
| TC-S9.3-AC1-2 | S9.3-AC1 Mặc định tối đa 20 thẻ mới | Chức năng | QA chạy tay: nhập `moi-25`, bấm "Ghi đè"; mở màn ôn tập | Màn hiện "Thẻ 1 / 20" | không |
| TC-S9.3-AC1-3 | S9.3-AC1 Mặc định tối đa 20 thẻ mới | Biên | Nạp sẵn đúng 20 thẻ mới. Mở màn ôn tập; chấm "Dễ" hết | Mở màn: "Thẻ 1 / 20". Cuối: "Đã ôn xong 20 thẻ." và **không** có câu giới hạn (không thẻ nào bị giữ lại) | e2e |
| TC-S9.3-AC1-4 | S9.3-AC1 Thẻ mới và lượt ôn tính riêng | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: mặc định, hôm nay chưa chấm, 210 thẻ đã chấm đến hạn và 30 thẻ "mới" | Phiên 220 thẻ: 200 thẻ đã chấm có hạn sớm nhất (theo hạn), rồi 20 thẻ "mới" đứng trước theo thứ tự hỏi. QA đọc kết quả Vitest | không |
| TC-S9.3-AC1-5 | S9.3-AC1 Thẻ mới và lượt ôn tính riêng | Biên | Cài đặt: chọn "10 thẻ" và "50 lượt". Nạp sẵn 55 thẻ đã chấm đến hạn và 15 thẻ mới. Mở màn ôn tập; chấm "Dễ" lần lượt, test ghi thẻ ở từng vị trí (đọc thẻ từ phía test) | "Thẻ 1 / 60". Thẻ 1–50 là 50 thẻ đã chấm có hạn sớm nhất (Q1, Q2); thẻ 51–60 là thẻ "mới". Tổng 55 + 15 mà phiên 60 = hai giới hạn tính riêng; phiên 50 = lỗi "thẻ mới tính vào lượt ôn" | e2e |
| TC-S9.3-AC1-6 | S9.3-AC1 Số đã chấm trong ngày cộng dồn qua nhiều lần mở màn | Chức năng | Nạp sẵn 25 thẻ mới. Mở màn ôn tập; chấm "Dễ" 12 thẻ đầu; bấm "Về Trang chủ"; bấm "Ôn tập" ngay | Lần mở thứ hai: "Thẻ 1 / 8". Đọc số đã chấm từ phía test: hôm nay 12 thẻ mới, 0 lượt ôn | e2e |
| TC-S9.3-AC1-7 | S9.3-AC1 Số đã chấm trong ngày cộng dồn qua nhiều lần mở màn | Biên | Như TC-S9.3-AC1-6, nhưng sau khi chấm 12 thẻ thì mở lại app (thay cho "Về Trang chủ"), vào Trang chủ, bấm "Ôn tập" | "Thẻ 1 / 8" (số đã chấm còn sau khi đóng app) | e2e |
| TC-S9.3-AC1-8 | S9.3-AC1 Số đã chấm trong ngày cộng dồn qua nhiều lần mở màn | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; mở màn ôn tập, chấm "Dễ" 12 thẻ; bấm "Về Trang chủ", bấm "Ôn tập"; chấm "Dễ" hết 8 thẻ; bấm "Về Trang chủ", bấm "Ôn tập" | Lần mở thứ hai: "Thẻ 1 / 8". Hết phiên thứ hai: "Đã ôn xong 8 thẻ." rồi câu giới hạn. Lần mở thứ ba: màn hiện câu giới hạn và nút "Về Trang chủ" | không |

### Thẻ bị bỏ qua không tính vào giới hạn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-52 | S9.3-AC1 Thẻ bị bỏ qua không chiếm chỗ trong giới hạn | Chức năng | Nhập `moi-22-bo-qua-2`, bấm "Ghi đè" (không có thẻ đã chấm nào đến hạn). Mở màn ôn tập; chấm "Dễ" hết; đọc thẻ từ phía test | Mở màn: "Thẻ 1 / 20" (không phải "Thẻ 1 / 18"); không có thông báo lỗi. Cuối: "Đã ôn xong 20 thẻ." rồi câu giới hạn. 2 thẻ của từ không có trong app vẫn "mới", thời điểm ôn tiếp theo như trong file; 2 thẻ "mới" còn lại của từ có trong app vẫn "mới" | e2e |
| TC-S9.3-AC1-53 | S9.3-AC1 Thẻ bị bỏ qua không chiếm chỗ trong giới hạn | Chức năng | QA chạy tay: nhập `moi-22-bo-qua-2`, "Ghi đè"; bấm "Ôn tập"; chấm "Dễ" hết | Mở màn: "Thẻ 1 / 20". Cuối: "Đã ôn xong 20 thẻ." rồi câu giới hạn | không |
| TC-S9.3-AC1-54 | S9.3-AC1 Chỉ thẻ bị bỏ qua vượt giới hạn thì không hiện câu giới hạn | Chức năng | Nhập `moi-20-bo-qua-2`, "Ghi đè". Mở màn ôn tập; chấm "Dễ" hết | Mở màn: "Thẻ 1 / 20". Cuối: "Đã ôn xong 20 thẻ." và nút "Về Trang chủ"; **không** có câu giới hạn | e2e |
| TC-S9.3-AC1-55 | S9.3-AC1 Chỉ thẻ bị bỏ qua vượt giới hạn thì không hiện câu giới hạn | Biên | Tiếp TC-S9.3-AC1-54: bấm "Về Trang chủ"; bấm "Ôn tập" | Màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ" (20 thẻ vừa chấm "Dễ" chưa tới hạn, chỉ còn thẻ bị bỏ qua); **không** có câu giới hạn | e2e |

### Thẻ nào được lấy khi vượt giới hạn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-9 | S9.3-AC1 Mặc định tối đa 200 lượt ôn | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: 230 thẻ đã chấm đến hạn, hạn khác nhau, không có thẻ "mới" | Phiên 200 thẻ, là 200 thẻ có hạn sớm nhất. QA đọc kết quả Vitest | không |
| TC-S9.3-AC1-10 | S9.3-AC1 Mặc định tối đa 200 lượt ôn | Biên | Cài đặt: chọn "50 lượt". Nạp sẵn 53 thẻ đã chấm đến hạn, hạn khác nhau. Mở màn ôn tập; chấm "Dễ" hết; đọc thẻ từ phía test | "Thẻ 1 / 50". 50 thẻ được hỏi là 50 thẻ hạn sớm nhất; 3 thẻ hạn muộn nhất không được hỏi, trạng thái và thời điểm ôn tiếp theo giữ nguyên như lúc nạp. Cuối: "Đã ôn xong 50 thẻ." rồi câu giới hạn | e2e |
| TC-S9.3-AC1-11 | S9.3-AC1 Mặc định tối đa 200 lượt ôn | Biên | Tiếp TC-S9.3-AC1-10: tua đồng hồ sang 00:05 ngày hôm sau; bấm "Ôn tập" | Phiên có 3 thẻ bị giữ lại hôm trước ("Thẻ 1 / 3"), xét lại ở lần mở sau | e2e |

### Cách đếm thẻ mới và lượt ôn trong ngày

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-12 | S9.3-AC1 Chấm lại sau bước học ngắn tính là lượt ôn | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: `"你好" nghĩa` "mới" chấm "Quên", tới hạn lại cùng ngày, chấm "Được" | Hôm nay 1 thẻ mới và 1 lượt ôn. QA đọc kết quả Vitest | không |
| TC-S9.3-AC1-13 | S9.3-AC1 Chấm lại sau bước học ngắn tính là lượt ôn | Chức năng | Nạp sẵn `"你好" nghĩa` "mới". Mở màn ôn tập; chấm "Quên"; bấm "Về Trang chủ"; tua đồng hồ tới thời điểm ôn tiếp theo của `"你好" nghĩa` (đọc từ phía test, khoảng 1 phút sau); bấm "Ôn tập"; chấm "Được"; đọc số đã chấm từ phía test | Lần mở thứ hai: "Thẻ 1 / 1" mặt hỏi "你好". Sau lần chấm thứ hai: hôm nay 1 thẻ mới, 1 lượt ôn | e2e |
| TC-S9.3-AC1-14 | S9.3-AC1 Chấm lại sau bước học ngắn tính là lượt ôn | Biên | Cài đặt: chọn "50 lượt". Nạp sẵn số đã chấm hôm nay: 0 thẻ mới, 50 lượt ôn; nạp `"你好" nghĩa` "mới". Mở màn ôn tập; chấm "Quên"; bấm "Về Trang chủ"; tua tới thời điểm ôn tiếp theo của thẻ; bấm "Ôn tập" | Lần mở đầu: "Thẻ 1 / 1" (thẻ "mới" không dùng lượt ôn). Lần mở sau khi tua: màn hiện câu giới hạn và nút "Về Trang chủ" (thẻ quay lại sau bước học ngắn là lượt ôn, đã hết 50 lượt); không có "Thẻ x / y" | e2e |
| TC-S9.3-AC1-15 | S9.3-AC1 Lưu lỗi thì không đếm | Chức năng | Nạp sẵn: hôm nay đã chấm 19 thẻ mới; 3 thẻ mới đến hạn; không có thẻ đã chấm nào đến hạn. Mở màn ôn tập; giả lập lỗi lưu; bấm "Hiện đáp án", bấm "Được"; bấm "Về Trang chủ"; bỏ giả lập; bấm "Ôn tập" | Lần mở đầu: "Thẻ 1 / 1". Sau khi bấm "Được": "Không lưu được kết quả. Hãy chấm lại." (S9.2). Lần mở lại: "Thẻ 1 / 1". Đọc số đã chấm từ phía test: hôm nay vẫn 19 thẻ mới | e2e |
| TC-S9.3-AC1-16 | S9.3-AC1 Lưu lỗi thì không đếm | Biên | Tiếp TC-S9.3-AC1-15: chấm "Được" (lưu được); bấm "Về Trang chủ"; bấm "Ôn tập" | Sau khi chấm: "Đã ôn xong 1 thẻ." rồi câu giới hạn. Lần mở lại: câu giới hạn và nút "Về Trang chủ"; số thẻ mới hôm nay là 20 | e2e |
| TC-S9.3-AC1-17 | S9.3-AC1 Viết không gợi ý không tính vào giới hạn | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: `"人" viết` "mới" nhận một mức chấm từ viết không gợi ý | Hôm nay 0 thẻ mới, 0 lượt ôn. QA đọc kết quả Vitest | không |
| TC-S9.3-AC1-18 | S9.3-AC1 Viết không gợi ý không tính vào giới hạn | Biên | Cần code S6.3 đã có trên bản build (chưa có: ghi "không chạy được", dựa vào TC-S9.3-AC1-17). Nạp sẵn: đã học xong từ "人" (có `"人" viết` "mới") và 25 thẻ mới khác. Không có thẻ đã chấm nào đến hạn. Mở luyện viết "人", viết xong ở khung có gợi ý, bấm "Thử viết không gợi ý", viết đúng mọi nét, không sai lần nào (nhận mức Dễ, để `"人" viết` không tới hạn lại trong ngày); đọc số đã chấm từ phía test; mở màn ôn tập | Số đã chấm hôm nay: 0 thẻ mới, 0 lượt ôn. Màn ôn tập hiện "Thẻ 1 / 20", 20 thẻ được hỏi đều là thẻ "mới" (giới hạn 20 còn nguyên) | e2e |

### Mỗi ngày đếm lại từ 0

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-19 | S9.3-AC1 Sang ngày mới được thêm thẻ mới | Chức năng | Nạp sẵn: hôm qua đã chấm 20 thẻ mới (20 thẻ đó còn ít nhất 1 ngày nữa mới tới hạn); 10 thẻ mới đến hạn; không có thẻ đã chấm nào đến hạn. Đồng hồ ở 00:05 hôm nay; mở màn ôn tập | "Thẻ 1 / 10" | e2e |
| TC-S9.3-AC1-20 | S9.3-AC1 Sang ngày mới được thêm thẻ mới | Biên | Nạp sẵn: ngày D đã chấm 20 thẻ mới (20 thẻ đó còn ít nhất 2 ngày nữa mới tới hạn); 10 thẻ mới đến hạn; không có thẻ đã chấm nào đến hạn. Đồng hồ ở 23:59 ngày D; mở màn ôn tập; bấm "Về Trang chủ"; tua tới 00:00 ngày D + 1; bấm "Ôn tập" | Lần mở lúc 23:59: câu giới hạn và nút "Về Trang chủ". Lần mở lúc 00:00: "Thẻ 1 / 10" (ranh giới ngày đúng 0 giờ theo đồng hồ máy) | e2e |
| TC-S9.3-AC1-21 | S9.3-AC1 Phiên qua nửa đêm tính mỗi lần chấm vào ngày của nó | Chức năng | Nạp sẵn 30 thẻ mới, không có số đã chấm ngày nào. Đồng hồ 23:58; mở màn ôn tập; chấm "Dễ" 2 thẻ; tua đồng hồ tới 00:00:30 ngày kế; chấm "Dễ" 3 thẻ; ghi "Thẻ x / y"; bấm "Về Trang chủ"; bấm "Ôn tập"; đọc số đã chấm từ phía test | Mở màn: "Thẻ 1 / 20". Sau 5 lần chấm: "Thẻ 6 / 20" (danh sách không đổi khi qua nửa đêm). Lần mở lại: "Thẻ 1 / 17". Số đã chấm: ngày trước 2 thẻ mới, ngày sau 3 thẻ mới | e2e |

### Số đã chấm và số phút học không ảnh hưởng nhau

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-56 | S9.3-AC1 Ôn tập không làm đổi số phút học và streak | Chức năng | Mục tiêu 15 phút. Nạp như S8.3 `D-2 đạt · D-1 đạt · hôm nay 7 phút` (Trang chủ hiện "Hôm nay: 7 / 15 phút", "Chuỗi ngày học: 2 ngày"); nạp sẵn 3 thẻ mới. Từ Trang chủ bấm "Ôn tập"; chấm "Được" 3 thẻ; bấm "Về Trang chủ" | Trang chủ vẫn "Hôm nay: 7 / 15 phút" và "Chuỗi ngày học: 2 ngày"; không hiện "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S9.3-AC1-57 | S9.3-AC1 Ôn tập không làm đổi số phút học và streak | Biên | Như TC-S9.3-AC1-56 nhưng ở lại màn ôn tập 10 phút (tua đồng hồ) trước khi chấm thẻ cuối, rồi bấm "Về Trang chủ" | Trang chủ vẫn "Hôm nay: 7 / 15 phút" (thời gian ở màn ôn tập và các lần chấm không cộng vào phút học), "Chuỗi ngày học: 2 ngày" | e2e |
| TC-S9.3-AC1-58 | S9.3-AC1 Học thêm phút không làm mất số đã chấm hôm nay | Chức năng | Nạp sẵn 25 thẻ mới, không có thẻ đã chấm nào đến hạn. Mở màn ôn tập; chấm "Dễ" 12 thẻ đầu; bấm "Về Trang chủ"; bấm "Vào học", ở màn bài 2 phút (tua đồng hồ); về Trang chủ; bấm "Ôn tập"; đọc số đã chấm từ phía test | Trang chủ trước khi ôn lại: số phút hôm nay tăng thêm 2 so với trước khi vào bài. Màn ôn tập: "Thẻ 1 / 8". Số đã chấm hôm nay vẫn 12 thẻ mới | e2e |
| TC-S9.3-AC1-59 | S9.3-AC1 Học thêm phút không làm mất số đã chấm hôm nay | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; bấm "Ôn tập", chấm "Dễ" 12 thẻ; về Trang chủ, bấm "Vào học", học khoảng 2 phút; về Trang chủ; bấm "Ôn tập" | "Thẻ 1 / 8" | không |
| TC-S9.3-AC1-60 | S9.3-AC1 Ngày chỉ ôn tập không tính là ngày học | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: hôm qua 0 phút nhưng đã chấm 5 thẻ, hôm kia đạt mục tiêu, hôm nay chưa học | Hôm qua 0 phút, không tính là ngày đạt mục tiêu; streak 0. QA đọc kết quả Vitest | không |
| TC-S9.3-AC1-61 | S9.3-AC1 Ngày chỉ ôn tập không tính là ngày học | Chức năng | Mục tiêu 15 phút. Nạp `D-2 đạt · D-1 chỉ ôn · hôm nay 0 phút` (hôm qua 0 phút, 5 thẻ mới đã chấm). Mở Trang chủ | "Chuỗi ngày học: 0 ngày"; "Hôm nay: 0 / 15 phút" | e2e |

### Số đã chấm hôm nay đọc không được thì coi là 0

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-22 | S9.3-AC1 Số đã chấm hôm nay bị hỏng thì coi là 0 | Chức năng | Nạp sẵn 25 thẻ mới, không có thẻ đã chấm nào đến hạn, và số đã chấm hôm nay là 20 thẻ mới; giả lập "số đã chấm hôm nay hỏng". Mở màn ôn tập | "Thẻ 1 / 20" (số hỏng coi là 0, không phải 20); không có thông báo lỗi nào, không có "Không tải được thẻ ôn tập." | e2e |
| TC-S9.3-AC1-23 | S9.3-AC1 Số đã chấm hôm nay bị hỏng thì coi là 0 | Biên | Tiếp TC-S9.3-AC1-22: chấm "Dễ" 3 thẻ; bấm "Về Trang chủ"; bấm "Ôn tập" | "Thẻ 1 / 17": lần chấm sau đó vẫn được đếm (từ 0), không báo lỗi | e2e |
| TC-S9.3-AC1-24 | S9.3-AC1 Cài đặt không đọc được thì dùng giới hạn mặc định | Chức năng | Cài đặt: chọn "10 thẻ". Nạp sẵn 25 thẻ mới, không có thẻ đã chấm nào đến hạn; hôm nay chưa chấm thẻ nào. Mở màn Lộ trình; giả lập "cài đặt không đọc được"; mở màn ôn tập bằng liên kết trong app (về Trang chủ, bấm "Ôn tập"), không đi qua trang bắt đầu | "Thẻ 1 / 20"; không có thông báo lỗi | e2e |
| TC-S9.3-AC1-64 | S9.3-AC1 Cài đặt không đọc được thì dùng giới hạn mặc định | Chức năng | Như TC-S9.3-AC1-24, nhưng sau khi giả lập ở màn Lộ trình thì mở thẳng trang ôn tập và tải lại đúng trang đó (không đi qua trang bắt đầu) | "Thẻ 1 / 20"; không có thông báo lỗi | e2e |
| TC-S9.3-AC1-25 | S9.3-AC1 Cài đặt không đọc được thì dùng giới hạn mặc định | Biên | Cài đặt: chọn "10 thẻ" và "50 lượt". Nạp sẵn 25 thẻ mới, không có thẻ đã chấm nào đến hạn. Giả lập "giới hạn đã lưu hỏng" chỉ cho "Thẻ mới mỗi ngày"; mở lại app, bấm "Ôn tập" | "Thẻ 1 / 20" (chỉ giới hạn hỏng về mặc định); không có thông báo lỗi | e2e |

### Thẻ nào được hỏi trong phiên (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-26 | S9.3-AC1 Thẻ vượt giới hạn không được hỏi trong phiên | Chức năng | Nạp sẵn: hôm nay đã chấm 18 thẻ mới; 5 thẻ mới chiều nghĩa ("你好", "谢谢", "人", "妈", "马") và `"人" nghe` đã chấm, tới hạn từ hôm qua. Mở màn ôn tập; chấm "Dễ" hết, ghi mặt hỏi; đọc thẻ từ phía test | "Thẻ 1 / 3": (1) `"人" nghe` (mặt hỏi chỉ có nút "Nghe", Q1), (2) mặt hỏi "你好", (3) mặt hỏi "谢谢" (Q4). Cuối: "Đã ôn xong 3 thẻ." rồi câu giới hạn. Thẻ "人", "妈", "马" chiều nghĩa vẫn "mới", thời điểm ôn tiếp theo như lúc nạp | e2e |
| TC-S9.2-AC1-14 | S9.2-AC1 Danh sách chốt lúc mở màn | Chức năng (hồi quy) | Chạy lại case gốc của S9.2 trên bản build S9.3 | Như case gốc | e2e |
| TC-S9.2-AC1-15 | S9.2-AC1 Danh sách chốt lúc mở màn | Chức năng (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc; thẻ "你好" quay lại sau "Quên" được hỏi (1 lượt ôn, dưới giới hạn 200) | e2e |

### Màn ôn tập khi không có thẻ để hỏi (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-27 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | Chức năng | Nạp sẵn: hôm nay đã chấm 20 thẻ mới; 5 thẻ mới đến hạn; không có thẻ đã chấm nào đến hạn. Mở màn ôn tập; đọc thẻ từ phía test | Màn hiện câu giới hạn và nút "Về Trang chủ"; không có "Thẻ x / y", "Hiện đáp án", "Không có thẻ nào cần ôn lúc này." hay "Bạn chưa có thẻ ôn tập…". 5 thẻ vẫn "mới". Bấm "Về Trang chủ" thì vào Trang chủ | e2e |
| TC-S9.3-AC1-28 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | Biên | Cài đặt: chọn "50 lượt". Nạp sẵn: hôm nay đã chấm 50 lượt ôn; 1 thẻ đã chấm đến hạn; không có thẻ "mới". Mở màn ôn tập | Câu giới hạn và nút "Về Trang chủ" (giới hạn lượt ôn hết cũng báo cùng câu) | e2e |
| TC-S9.3-AC1-29 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | A11y | Như TC-S9.3-AC1-27. Chỉ dùng bàn phím: Tab tới "Về Trang chủ", nhấn Enter; lặp lại với Space | "Về Trang chủ" tới được bằng Tab, có viền focus nhìn thấy được; Enter và Space đều đưa vào Trang chủ | e2e |
| TC-S9.3-AC1-30 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | A11y | Như TC-S9.3-AC1-29, chạy tay với VoiceOver hoặc NVDA (dựng bằng TC-S9.3-AC1-8 tới lần mở thứ ba) | Đi tới thông báo bằng phím đọc của trình đọc màn hình thì nghe đủ câu giới hạn; nút đọc là "Về Trang chủ" | không |
| TC-S9.3-AC1-31 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | Mobile 375 | Khổ 375×812; xem màn câu giới hạn (phiên rỗng) và màn "Đã ôn xong N thẻ." kèm câu giới hạn (dựng bằng TC-S9.3-AC1-8) | Câu giới hạn hiện đủ chữ, xuống dòng, không bị cắt hay chồng lên "Đã ôn xong N thẻ."; nút "Về Trang chủ" vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.3-AC1-32 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | Sáng/Tối | Như TC-S9.3-AC1-31 ở giao diện sáng rồi tối; Tab tới "Về Trang chủ" | Ở cả hai giao diện: câu giới hạn, "Đã ôn xong N thẻ." và nút đọc rõ (≥ 4.5:1); viền focus của nút nhìn thấy (≥ 3:1) | không |
| TC-S9.3-AC1-33 | S9.3-AC1 Hết giới hạn mà vẫn còn thẻ đến hạn | Offline | Đã mở app một lần khi có mạng. Nạp sẵn như TC-S9.3-AC1-27. Tắt mạng; vào Trang chủ, bấm "Ôn tập" | Màn hiện câu giới hạn và nút "Về Trang chủ"; không có lỗi mạng | e2e |
| TC-S9.3-AC1-34 | S9.3-AC1 Hết giới hạn và không còn thẻ đến hạn | Chức năng | Nạp sẵn: hôm nay đã chấm 20 thẻ mới (20 thẻ đó còn ít nhất 1 ngày nữa mới tới hạn); không thẻ nào đến hạn. Mở màn ôn tập | "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"; **không** có câu giới hạn | e2e |
| TC-S9.3-AC1-35 | S9.3-AC1 Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn | Chức năng | Cài đặt: chọn "0 thẻ" ở "Thẻ mới mỗi ngày". Nạp sẵn 5 thẻ mới, không có thẻ đã chấm nào đến hạn; hôm nay chưa chấm thẻ nào. Mở màn ôn tập; đọc thẻ từ phía test | Màn hiện câu giới hạn và nút "Về Trang chủ"; **không** có "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ.", "Không có thẻ nào cần ôn lúc này." hay "Thẻ x / y". 5 thẻ vẫn "mới", thời điểm ôn tiếp theo như lúc nạp | e2e |
| TC-S9.3-AC1-49 | S9.3-AC1 Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; Cài đặt chọn "0 thẻ"; về Trang chủ, bấm "Ôn tập" | Như TC-S9.3-AC1-35 (câu giới hạn, không phải "Bạn chưa có thẻ ôn tập…") | không |
| TC-S9.3-AC1-50 | S9.3-AC1 Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn | Biên | Cài đặt: chọn "0 thẻ". Không có thẻ ôn tập nào. Mở màn ôn tập | "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." và nút "Về Trang chủ"; **không** có câu giới hạn (bảng xét từ trên xuống: không có thẻ nào thì dòng đầu thắng) | e2e |
| TC-S9.2-AC1-29 | S9.2-AC1 Chưa có thẻ nào | Chức năng (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc; không có câu giới hạn | e2e |
| TC-S9.2-AC1-30 | S9.2-AC1 Không có thẻ đến hạn | Chức năng (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc; không có câu giới hạn | e2e |
| TC-S9.2-AC1-31 | S9.2-AC1 Không có thẻ đến hạn | Biên (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc | e2e |
| TC-S9.2-AC1-18 | S9.2-AC1 Thẻ của từ không có trong app không được hỏi | Biên (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc ("Bạn chưa có thẻ ôn tập…", không phải câu giới hạn) | e2e |

### Hết thẻ của phiên (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-36 | S9.3-AC1 Hết phiên khi còn thẻ bị giới hạn | Chức năng | Nạp sẵn 25 thẻ mới. Mở màn ôn tập; chấm hết 20 thẻ (xen "Được", "Khó", "Dễ") | Màn hiện "Đã ôn xong 20 thẻ.", ngay sau đó câu giới hạn, và nút "Về Trang chủ"; không còn "Hiện đáp án" hay nút chấm | e2e |
| TC-S9.3-AC1-37 | S9.3-AC1 Hết phiên khi còn thẻ bị giới hạn | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; mở màn ôn tập, chấm "Dễ" hết 20 thẻ | Như TC-S9.3-AC1-36 | không |
| TC-S9.3-AC1-38 | S9.3-AC1 Hết phiên khi còn thẻ bị giới hạn | Biên | Nạp sẵn 25 thẻ mới. Mở màn ôn tập; chấm "Dễ" 10 thẻ; bấm "Về Trang chủ"; bấm "Ôn tập"; chấm "Dễ" hết | Lần mở thứ hai: "Thẻ 1 / 10". Cuối: "Đã ôn xong 10 thẻ." rồi câu giới hạn (N là số thẻ của phiên này, không phải của cả ngày) | e2e |
| TC-S9.3-AC1-39 | S9.3-AC1 Hết phiên khi không thẻ nào bị giới hạn | Chức năng | Nạp sẵn 3 thẻ mới. Mở màn ôn tập; chấm hết 3 thẻ | "Đã ôn xong 3 thẻ." và nút "Về Trang chủ"; không có câu giới hạn | e2e |
| TC-S9.2-AC2-25 | S9.2-AC2 Hết thẻ của phiên | Chức năng (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc; không có câu giới hạn | e2e |
| TC-S9.2-AC2-26 | S9.2-AC2 Hết thẻ của phiên | Biên (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc | e2e |

### Focus khi màn đổi (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC1-40 | S9.3-AC1 Focus ở thông báo hết thẻ có câu giới hạn | A11y | Nạp sẵn: hôm nay đã chấm 19 thẻ mới; 2 thẻ mới đến hạn. Mở màn ôn tập ("Thẻ 1 / 1"); chỉ dùng bàn phím: Tab tới "Hiện đáp án", Enter; Tab tới "Được", Enter; rồi Tab / Shift+Tab đi hết một vòng | Focus ở thông báo hết thẻ (không về đầu trang), có viền focus nhìn thấy được; tên đọc được bắt đầu bằng "Đã ôn xong 1 thẻ." và có câu giới hạn; vùng thông báo không nằm trong thứ tự Tab | e2e |
| TC-S9.3-AC1-41 | S9.3-AC1 Focus ở thông báo hết thẻ có câu giới hạn | A11y | Như TC-S9.3-AC1-40, chạy tay với VoiceOver hoặc NVDA (dựng bằng TC-S9.3-AC1-8, chấm thẻ cuối của phiên thứ hai bằng bàn phím) | Trình đọc đọc "Đã ôn xong 8 thẻ." rồi đọc tiếp câu giới hạn, không phải di chuyển tới thông báo | không |
| TC-S9.3-AC1-42 | S9.3-AC1 Focus ở thông báo hết thẻ có câu giới hạn | Sáng/Tối | Như TC-S9.3-AC1-40 ở giao diện sáng rồi tối (QA chạy tay dựng bằng TC-S9.3-AC1-8) | Viền focus quanh thông báo hết thẻ nhìn thấy (≥ 3:1) ở cả hai giao diện | không |
| TC-S9.2-AC2-18 | S9.2-AC2 Focus không rơi khi đổi mặt thẻ | A11y (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc | e2e |
| TC-S9.2-AC2-19 | S9.2-AC2 Focus không rơi khi đổi mặt thẻ | Biên (hồi quy) | Chạy lại case gốc của S9.2 | Như case gốc; tên đọc được là đúng "Đã ôn xong 1 thẻ.", không có câu giới hạn | e2e |

## Cài đặt (`settings`)

### Chỉnh giới hạn ôn tập trong Cài đặt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-1 | S9.3-AC2 Mặc định 20 thẻ mới và 200 lượt ôn | Chức năng | Mở màn Cài đặt | Nhóm "Thẻ mới mỗi ngày" có đúng các mức "0 thẻ", "10 thẻ", "20 thẻ", "30 thẻ", "50 thẻ" theo thứ tự đó, "20 thẻ" đang được chọn. Nhóm "Lượt ôn mỗi ngày" có đúng "50 lượt", "100 lượt", "200 lượt", "500 lượt", "200 lượt" đang được chọn. Mỗi nhóm chỉ chọn được một mức | e2e |
| TC-S9.3-AC2-2 | S9.3-AC2 Mặc định 20 thẻ mới và 200 lượt ôn | A11y | Mở màn Cài đặt với VoiceOver hoặc NVDA, đi qua hai nhóm mới | Mỗi nhóm đọc đúng nhãn "Thẻ mới mỗi ngày" / "Lượt ôn mỗi ngày"; mỗi mức đọc được tên ("20 thẻ", "200 lượt"…) và trạng thái đang chọn / không chọn | không |
| TC-S9.3-AC2-3 | S9.3-AC2 Mặc định 20 thẻ mới và 200 lượt ôn | Mobile 375 | Khổ 375×812, mở màn Cài đặt, cuộn qua năm nhóm | Hai nhóm mới hiện đủ nhãn và mọi mức, không bị cắt, không chồng nhau; mỗi mức vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.3-AC2-4 | S9.3-AC2 Mặc định 20 thẻ mới và 200 lượt ôn | Sáng/Tối | Mở màn Cài đặt ở giao diện sáng rồi tối; xem hai nhóm mới | Nhãn nhóm, nhãn mức và mức đang chọn đọc rõ (≥ 4.5:1) ở cả hai giao diện; mức đang chọn phân biệt được không chỉ bằng màu | không |
| TC-S9.3-AC2-5 | S9.3-AC2 Đổi số thẻ mới mỗi ngày thì màn ôn tập theo | Chức năng | Cài đặt: chọn "10 thẻ". Nạp sẵn 25 thẻ mới, không có thẻ đã chấm. Mở màn ôn tập | "Thẻ 1 / 10" | e2e |
| TC-S9.3-AC2-6 | S9.3-AC2 Đổi số thẻ mới mỗi ngày thì màn ôn tập theo | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; Cài đặt chọn "10 thẻ"; về Trang chủ, bấm "Ôn tập" | "Thẻ 1 / 10" | không |
| TC-S9.3-AC2-7 | S9.3-AC2 Đổi số thẻ mới mỗi ngày thì màn ôn tập theo | Biên | Cài đặt: chọn "50 thẻ". Nạp sẵn 25 thẻ mới. Mở màn ôn tập; chấm hết | "Thẻ 1 / 25"; cuối "Đã ôn xong 25 thẻ." không có câu giới hạn | e2e |
| TC-S9.3-AC2-8 | S9.3-AC2 Đổi số lượt ôn mỗi ngày thì màn ôn tập theo | Chức năng | Cài đặt: chọn "50 lượt". Nạp sẵn 60 thẻ đã chấm đến hạn, không có thẻ "mới". Mở màn ôn tập | "Thẻ 1 / 50" | e2e |
| TC-S9.3-AC2-9 | S9.3-AC2 Đổi số lượt ôn mỗi ngày thì màn ôn tập theo | Chức năng | QA chạy tay: đặt đồng hồ máy theo ngày ghi kèm `cham-60`, nhập file, "Ghi đè"; Cài đặt chọn "50 lượt"; bấm "Ôn tập" | "Thẻ 1 / 50" | không |
| TC-S9.3-AC2-10 | S9.3-AC2 Chọn 0 thẻ mới thì chỉ ôn thẻ đã chấm | Chức năng | Cài đặt: chọn "0 thẻ". Nạp sẵn 2 thẻ đã chấm đến hạn (`"人" nghĩa`, `"谢谢" nghĩa`) và 5 thẻ mới. Mở màn ôn tập; chấm "Dễ" hết, ghi mặt hỏi | "Thẻ 1 / 2"; mặt hỏi lần lượt là hai thẻ đã chấm, không có thẻ "mới" nào. Cuối: "Đã ôn xong 2 thẻ." rồi câu giới hạn (thẻ "mới" bị giữ lại vì giới hạn) | e2e |
| TC-S9.3-AC2-11 | S9.3-AC2 Giới hạn giữ sau khi mở lại app | Chức năng | Cài đặt: chọn "30 thẻ" và "100 lượt" (không bấm nút nào khác); mở lại app; vào Cài đặt | "30 thẻ" và "100 lượt" đang được chọn | e2e |
| TC-S9.3-AC2-12 | S9.3-AC2 Giới hạn giữ sau khi mở lại app | Offline | Đã mở app một lần khi có mạng; tắt mạng; vào Cài đặt chọn "30 thẻ"; mở lại app (vẫn tắt mạng), vào Cài đặt | "30 thẻ" đang được chọn; không có thông báo lỗi hay lỗi mạng | e2e |
| TC-S9.3-AC2-13 | S9.3-AC2 Giới hạn giữ sau khi mở lại app | Biên | Cài đặt: chọn lần lượt "10 thẻ", "50 thẻ", "0 thẻ", "30 thẻ" thật nhanh; mở lại app, vào Cài đặt | "30 thẻ" (lựa chọn cuối) đang được chọn | e2e |
| TC-S9.3-AC2-14 | S9.3-AC2 Không lưu được giới hạn thì giữ giá trị cũ | Chức năng | "Thẻ mới mỗi ngày" đang là "20 thẻ"; giả lập "không lưu được cài đặt"; chọn "30 thẻ" | Màn hiện "Không lưu được cài đặt. Hãy thử lại." (được đọc tự động); "20 thẻ" đang được chọn | e2e |
| TC-S9.3-AC2-15 | S9.3-AC2 Không lưu được giới hạn thì giữ giá trị cũ | Biên | Tiếp TC-S9.3-AC2-14 (vẫn giữ giả lập): chọn "100 lượt" ở "Lượt ôn mỗi ngày"; bỏ giả lập; nạp sẵn 25 thẻ mới; mở màn ôn tập | Sau khi chọn "100 lượt": vẫn "Không lưu được cài đặt. Hãy thử lại.", "200 lượt" đang được chọn. Màn ôn tập: "Thẻ 1 / 20" (giới hạn cũ còn hiệu lực) | e2e |
| TC-S9.3-AC2-16 | S9.3-AC2 Không lưu được giới hạn thì giữ giá trị cũ | A11y | Như TC-S9.3-AC2-14, chạy tay với VoiceOver hoặc NVDA (không tạo được lỗi lưu trên máy thật: ghi "không chạy được", đọc kết quả e2e) | Trình đọc tự đọc "Không lưu được cài đặt. Hãy thử lại." mà không phải di chuyển tới thông báo | không |

### Đổi giới hạn giữa ngày

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-17 | S9.3-AC2 Tăng giới hạn giữa ngày thì được thêm thẻ | Chức năng | Nạp sẵn 35 thẻ mới, không có thẻ đã chấm nào đến hạn. Mở màn ôn tập; chấm "Dễ" hết 20 thẻ (thấy câu giới hạn); bấm "Về Trang chủ"; vào Cài đặt chọn "30 thẻ"; bấm "Ôn tập" | "Thẻ 1 / 10" | e2e |
| TC-S9.3-AC2-18 | S9.3-AC2 Tăng giới hạn giữa ngày thì được thêm thẻ | Chức năng | QA chạy tay: nhập `moi-25` (không có thẻ đã chấm), "Ghi đè"; ôn hết 20 thẻ (chấm "Dễ", để không thẻ nào tới hạn lại trong ngày); Cài đặt chọn "30 thẻ"; bấm "Ôn tập" | "Thẻ 1 / 5" (còn 5 thẻ "mới", dưới phần chênh 10) | không |
| TC-S9.3-AC2-19 | S9.3-AC2 Hạ giới hạn dưới số đã chấm hôm nay | Chức năng | Nạp sẵn: hôm nay đã chấm 15 thẻ mới; 5 thẻ mới đến hạn, không có thẻ đã chấm nào đến hạn. Cài đặt chọn "10 thẻ"; mở màn ôn tập; bấm "Về Trang chủ"; Cài đặt chọn "20 thẻ"; bấm "Ôn tập" | Lần mở đầu: câu giới hạn và nút "Về Trang chủ", không có thông báo lỗi. Lần mở sau khi chọn lại "20 thẻ": "Thẻ 1 / 5" (số đã chấm 15 không bị xóa khi đổi giới hạn) | e2e |
| TC-S9.3-AC2-20 | S9.3-AC2 Hạ giới hạn dưới số đã chấm hôm nay | Biên | Nạp sẵn: hôm nay đã chấm 10 thẻ mới; 5 thẻ mới đến hạn. Cài đặt chọn "10 thẻ" (bằng đúng số đã chấm); mở màn ôn tập | Câu giới hạn (dòng "Bằng hoặc nhỏ hơn" của bảng) | e2e |
| TC-S9.3-AC2-21 | S9.3-AC2 Hạ giới hạn lượt ôn dưới số lượt đã chấm hôm nay | Chức năng | "Lượt ôn mỗi ngày" đang là "200 lượt". Nạp sẵn: hôm nay đã chấm 120 lượt ôn; 30 thẻ đã chấm đến hạn, không có thẻ "mới" nào đến hạn. Cài đặt chọn "100 lượt"; mở màn ôn tập; bấm "Về Trang chủ"; Cài đặt chọn "200 lượt"; bấm "Ôn tập" | Lần mở đầu: câu giới hạn và nút "Về Trang chủ", không có thông báo lỗi, không có "Thẻ x / y". Lần mở sau khi chọn lại "200 lượt": "Thẻ 1 / 30" (số lượt đã chấm 120 không bị xóa khi đổi giới hạn; 200 − 120 = 80 ≥ 30) | e2e |
| TC-S9.3-AC2-35 | S9.3-AC2 Hạ giới hạn lượt ôn dưới số lượt đã chấm hôm nay | Biên | Cài đặt chọn "50 lượt". Nạp sẵn: hôm nay đã chấm 120 lượt ôn, 0 thẻ mới; 3 thẻ đã chấm đến hạn và 2 thẻ mới. Mở màn ôn tập; chấm "Dễ" hết | "Thẻ 1 / 2", chỉ hai thẻ "mới" (giới hạn lượt ôn đã vượt, giới hạn thẻ mới còn nguyên, mỗi loại xét riêng); không có thông báo lỗi. Cuối: "Đã ôn xong 2 thẻ." rồi câu giới hạn (3 thẻ đã chấm bị giữ lại) | e2e |

### Có màn Cài đặt (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.2-AC1-24 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Chức năng (hồi quy, kết quả mới) | Thay TC-S8.2-AC1-1: ở màn Lộ trình bấm liên kết "Cài đặt" | Vào màn Cài đặt; có năm nhóm có nhãn "Mục tiêu mỗi ngày", "Tốc độ audio mặc định", "Hiện pinyin", "Thẻ mới mỗi ngày", "Lượt ôn mỗi ngày", mỗi nhóm hiện sẵn giá trị đang dùng; mục "Sao lưu tiến độ" vẫn có | e2e |
| TC-S8.2-AC1-2 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Mobile 375 (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc, với năm nhóm thay cho ba | không |
| TC-S8.2-AC1-4 | S8.2-AC1 Mở Cài đặt từ màn Lộ trình | Offline (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | không |
| TC-S8.2-AC1-5 | S8.2-AC1 Quay về Lộ trình | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | e2e |
| TC-S8.2-AC1-6 | S8.2-AC1 Đổi lựa chọn bằng bàn phím | A11y (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | e2e |
| TC-S8.2-AC1-7 | S8.2-AC1 Đổi lựa chọn bằng bàn phím | A11y (hồi quy) | Chạy lại case gốc của S8.2, Tab qua cả hai nhóm mới | Như case gốc, kể cả ở hai nhóm "Thẻ mới mỗi ngày", "Lượt ôn mỗi ngày" | không |
| TC-S9.3-AC2-22 | S9.3-AC2 Chọn giới hạn ôn tập bằng bàn phím | A11y | Ở màn Cài đặt chỉ dùng Tab, phím mũi tên và Space: chọn "30 thẻ" ở "Thẻ mới mỗi ngày", chọn "500 lượt" ở "Lượt ôn mỗi ngày"; mở lại app, vào Cài đặt | Chọn được cả hai; ô đang có focus có viền focus nhìn thấy được ở mỗi bước; sau khi mở lại "30 thẻ" và "500 lượt" đang được chọn | e2e |
| TC-S9.3-AC2-23 | S9.3-AC2 Chọn giới hạn ôn tập bằng bàn phím | Sáng/Tối | Ở giao diện sáng rồi tối, Tab qua hai nhóm mới | Viền focus nhìn thấy (≥ 3:1) ở mọi mức trong cả hai giao diện | không |

### Cài đặt đọc không được thì dùng mặc định (MODIFIED)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-24 | S9.3-AC2 Giới hạn đã lưu bị hỏng thì chỉ giới hạn đó về mặc định | Chức năng | Cài đặt: chọn "30 phút", "100 lượt", "10 thẻ"; giả lập "giới hạn đã lưu hỏng" cho "Thẻ mới mỗi ngày"; mở lại app, vào Cài đặt | "20 thẻ", "100 lượt" và "30 phút" đang được chọn; màn không hiện thông báo lỗi | e2e |
| TC-S9.3-AC2-25 | S9.3-AC2 Giới hạn đã lưu bị hỏng thì chỉ giới hạn đó về mặc định | Biên | Như TC-S9.3-AC2-24 nhưng chỉ "Lượt ôn mỗi ngày" hỏng (đã chọn "10 thẻ", "50 lượt") | "10 thẻ" và "200 lượt" đang được chọn; không có thông báo lỗi | e2e |
| TC-S8.2-AC1-25 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Chức năng | Cài đặt: chọn "60 phút", "10 thẻ", "500 lượt"; về Lộ trình; giả lập "cài đặt không đọc được"; bấm "Cài đặt" | "15 phút", "Bình thường (1x)", "Hiện pinyin" bật, "20 thẻ", "200 lượt" đang được chọn; không có thông báo lỗi (mặc định mới của Requirement) | e2e |
| TC-S8.2-AC2-9 | S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định | Chức năng (hồi quy) | Chạy lại case gốc của S8.2; trước đó chọn thêm "30 thẻ" | Như case gốc; "30 thẻ" vẫn đang được chọn | e2e |
| TC-S8.2-AC1-20 | S8.2-AC1 Mục tiêu đã lưu bị hỏng thì về 15 phút | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | không |
| TC-S8.2-AC3-15 | S8.2-AC3 Tùy chọn pinyin đã lưu bị hỏng thì về bật | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | không |
| TC-S8.2-AC2-12 | S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | e2e |
| TC-S8.2-AC1-21 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc; thêm "20 thẻ", "200 lượt" đang được chọn (như TC-S8.2-AC1-25) | e2e |
| TC-S8.2-AC1-22 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Chức năng (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc | e2e |
| TC-S8.2-AC1-23 | S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định | Biên (hồi quy) | Chạy lại case gốc của S8.2 | Như case gốc; thêm "20 thẻ", "200 lượt" | e2e |

## Sao lưu (`progress-backup`)

Theo quyết định đã chốt (số đã chấm theo ngày và hai giới hạn nằm trong file sao lưu; giá trị sai từ chối cả file; file cũ về "20 thẻ" /
"200 lượt").

### Sao lưu giữ giới hạn ôn tập và số đã chấm từng ngày

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-26 | S9.3-AC2 (bổ sung) Xuất rồi nhập ở máy khác giữ giới hạn | Chức năng | Máy A: Cài đặt chọn "10 thẻ" và "100 lượt", bấm "Xuất tiến độ". Máy B (đang "20 thẻ", "200 lượt"): nhập file đó, bấm "Ghi đè"; xem Cài đặt | Máy B báo "Đã nhập tiến độ."; Cài đặt máy B hiện "10 thẻ" và "100 lượt" đang được chọn | e2e |
| TC-S9.3-AC2-27 | S9.3-AC2 (bổ sung) Xuất rồi nhập ở máy khác giữ giới hạn | Chức năng | QA chạy tay như TC-S9.3-AC2-26 trên hai hồ sơ trình duyệt (hoặc máy tính và điện thoại) | Như TC-S9.3-AC2-26 | không |
| TC-S9.3-AC2-28 | S9.3-AC2 (bổ sung) Xuất rồi nhập ở máy khác giữ giới hạn | Biên | Máy B (đang "20 thẻ", "200 lượt") bấm "Xuất tiến độ" (file B). Làm TC-S9.3-AC2-26. Máy B nhập file B, "Ghi đè"; xem Cài đặt | Cài đặt máy B về "20 thẻ" và "200 lượt" (ghi đè toàn bộ, không giữ giá trị trên máy) | e2e |
| TC-S9.3-AC1-43 | S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay | Chức năng | Máy A (giới hạn "20 thẻ"): nạp sẵn 25 thẻ mới, không có thẻ đã chấm; mở màn ôn tập, chấm "Dễ" 15 thẻ (15 thẻ này còn nhiều ngày mới tới hạn); bấm "Về Trang chủ"; trước khi xuất kiểm máy A còn 10 thẻ "mới" và không có thẻ đã chấm nào đến hạn (đọc thẻ từ phía test); bấm "Xuất tiến độ". Máy B (đã qua màn chào mừng, hôm nay chưa chấm thẻ nào, có thẻ riêng của máy B): cùng ngày, cùng giờ ở 10:00, nhập file đó, "Ghi đè"; mở màn ôn tập ngay; đọc thẻ từ phía test | Máy B: "Đã nhập tiến độ."; màn ôn tập hiện "Thẻ 1 / 5"; 5 thẻ được hỏi là 5 thẻ "mới" của file đứng trước theo thứ tự hỏi (10 thẻ "mới" đến từ file, còn 20 − 15 = 5); thẻ riêng của máy B không còn | e2e |
| TC-S9.3-AC1-51 | S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay | Chức năng | QA chạy tay trên hai hồ sơ trình duyệt: hồ sơ A nhập `moi-25`, "Ghi đè"; mở màn ôn tập, chấm "Dễ" 15 thẻ; về Trang chủ; Cài đặt → "Xuất tiến độ". Hồ sơ B (hôm nay chưa chấm thẻ nào) cùng ngày nhập file đó, "Ghi đè"; bấm "Ôn tập" | Hồ sơ B: "Thẻ 1 / 5" | không |
| TC-S9.3-AC1-44 | S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay | Biên | Như TC-S9.3-AC1-43 nhưng máy B nhập file vào 00:05 ngày hôm sau | Máy B: "Thẻ 1 / 10" (15 thẻ mới của file thuộc hôm qua) | e2e |
| TC-S9.3-AC1-45 | S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay | Biên | Máy B: nạp sẵn 25 thẻ mới, chấm "Dễ" hết 20 (thấy câu giới hạn). Máy A: nhập `moi-25` (không có số đã chấm), bấm "Xuất tiến độ". Máy B: cùng ngày nhập file đó, "Ghi đè"; mở màn ôn tập | Máy B: "Thẻ 1 / 20" (số đã chấm hôm nay của máy B không còn sau khi ghi đè) | e2e |
| TC-S9.3-AC1-46 | S9.3-AC1 (bổ sung) Xuất rồi nhập trong ngày giữ số thẻ mới đã chấm hôm nay | Offline | Như TC-S9.3-AC1-43 nhưng máy B tắt mạng (đã mở app một lần khi có mạng) trước khi nhập và mở màn ôn tập | Máy B: "Đã nhập tiến độ."; "Thẻ 1 / 5"; không có lỗi mạng | e2e |

### File sao lưu chưa có giới hạn ôn tập vẫn nhập được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-29 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản S9.1 thì giới hạn về mặc định | Chức năng | Cài đặt: chọn "50 thẻ" và "500 lượt". Nhập `ban-truoc-s9-3` (file bản S9.1), bấm "Ghi đè"; xem Cài đặt | Màn báo "Đã nhập tiến độ."; Cài đặt hiện "20 thẻ" và "200 lượt" đang được chọn | e2e |
| TC-S9.3-AC2-30 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản S9.1 thì giới hạn về mặc định | Biên | Cài đặt: chọn "0 thẻ" và "50 lượt". Nhập `ban-truoc-s9-3`, "Ghi đè"; mở màn ôn tập | "Thẻ 1 / 20" (giới hạn mặc định có hiệu lực ở màn ôn tập, không chỉ hiện trong Cài đặt) | e2e |
| TC-S9.3-AC2-31 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản S9.1 thì giới hạn về mặc định | Chức năng | QA chạy tay: trước khi deploy S9.3, trên bản đang chạy (đã có code S9.1) xuất một file có thẻ; sau khi deploy, trên trình duyệt khác chọn "50 thẻ", nhập file đó, "Ghi đè" | "Đã nhập tiến độ."; Cài đặt "20 thẻ", "200 lượt"; màn ôn tập mở được, không có thông báo lỗi | không |
| TC-S9.3-AC1-62 | S9.3-AC1 (bổ sung) Nhập file sao lưu bản S9.1 thì số đã chấm hôm nay là 0 | Chức năng | Giới hạn "20 thẻ". Nạp sẵn 25 thẻ mới; mở màn ôn tập, chấm "Dễ" hết 20 thẻ (thấy câu giới hạn), bấm "Về Trang chủ". Cùng ngày: nhập `ban-truoc-s9-3` (25 thẻ "mới", không có thẻ đã chấm), "Ghi đè"; mở màn ôn tập; đọc số đã chấm từ phía test | Màn báo "Đã nhập tiến độ."; màn ôn tập hiện "Thẻ 1 / 20"; số đã chấm hôm nay: 0 thẻ mới, 0 lượt ôn | e2e |
| TC-S9.3-AC1-63 | S9.3-AC1 (bổ sung) Nhập file sao lưu bản S9.1 thì số đã chấm hôm nay là 0 | Chức năng | QA chạy tay: nhập `moi-25`, "Ghi đè"; bấm "Ôn tập", chấm "Dễ" hết 20 thẻ; về Trang chủ; Cài đặt → "Nhập tiến độ", chọn `ban-truoc-s9-3`, "Ghi đè"; bấm "Ôn tập" | "Thẻ 1 / 20" | không |
| TC-S9.3-AC2-36 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản trước S9.1 thì giới hạn về mặc định | Chức năng | Cài đặt: chọn "50 thẻ" và "500 lượt". Nhập `ban-truoc-s9-1` (file bản trước S9.1, chưa có thẻ ôn tập), bấm "Ghi đè"; xem Cài đặt | Màn báo "Đã nhập tiến độ."; Cài đặt hiện "20 thẻ" và "200 lượt" đang được chọn | e2e |
| TC-S9.3-AC2-37 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản trước S9.1 thì giới hạn về mặc định | Biên | Nạp sẵn 25 thẻ mới; mở màn ôn tập, chấm "Dễ" 5 thẻ. Nhập `ban-truoc-s9-1`, "Ghi đè"; đọc số đã chấm từ phía test | Màn báo "Đã nhập tiến độ."; số thẻ mới và số lượt ôn đã chấm của mọi ngày là 0 (5 thẻ chấm hôm nay trên máy không còn) | e2e |
| TC-S9.3-AC2-38 | S9.3-AC2 (bổ sung) Nhập file sao lưu bản trước S9.1 thì giới hạn về mặc định | Chức năng | QA chạy tay: chọn "50 thẻ"; Cài đặt → "Nhập tiến độ", chọn `ban-truoc-s9-1`, "Ghi đè"; xem Cài đặt | "Đã nhập tiến độ."; "20 thẻ", "200 lượt" đang được chọn | không |

### File sao lưu từ S9.3 có phiên bản định dạng mới

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-39 | S9.3-AC2 (bổ sung) File xuất từ S9.3 ghi phiên bản định dạng cao hơn file bản S9.1 | Chức năng | Chỉ kiểm tầng định dạng file (Vitest), theo chính Scenario: xuất ở bản S9.3, so phiên bản định dạng với file bản S9.1 (`ban-truoc-s9-3`) | Phiên bản định dạng của file S9.3 cao hơn của file bản S9.1. QA đọc kết quả Vitest | không |
| TC-S9.3-AC2-40 | S9.3-AC2 (bổ sung) File xuất từ S9.3 ghi phiên bản định dạng cao hơn file bản S9.1 | Biên | QA chạy tay: ở bản S9.3 bấm "Xuất tiến độ"; mở bản app trước S9.3 (bản đang chạy trước khi deploy S9.3, hoặc build từ `main` trước khi merge code S9.3) ở trình duyệt khác, nhập file đó. Không chạy được bản cũ thì ghi "không chạy được", dựa vào TC-S9.3-AC2-39 | Bản cũ báo "File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại."; không hiện hộp xác nhận, tiến độ trên bản cũ không đổi | không |

### File có giới hạn hoặc số đã chấm sai bị từ chối

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.3-AC2-32 | S9.3-AC2 (bổ sung) File có giới hạn thẻ mới không hợp lệ bị từ chối | Chức năng | Cài đặt đang "20 thẻ". Bấm "Nhập tiến độ", chọn `gioi-han-25` | Màn báo "File tiến độ bị hỏng, không nhập được."; không hiện hộp xác nhận; Cài đặt vẫn "20 thẻ" | e2e |
| TC-S9.3-AC2-33 | S9.3-AC2 (bổ sung) File có giới hạn thẻ mới không hợp lệ bị từ chối | Biên | Cài đặt đang "100 lượt". Chọn `luot-150` | Như TC-S9.3-AC2-32; Cài đặt vẫn "100 lượt" | e2e |
| TC-S9.3-AC2-34 | S9.3-AC2 (bổ sung) File có giới hạn thẻ mới không hợp lệ bị từ chối | A11y | Bật VoiceOver hoặc NVDA; nhập `gioi-han-25` | Trình đọc tự đọc "File tiến độ bị hỏng, không nhập được." | không |
| TC-S9.3-AC1-47 | S9.3-AC1 (bổ sung) File có số lượt ôn âm bị từ chối | Chức năng | Nạp sẵn 25 thẻ mới; mở màn ôn tập, chấm "Dễ" 5 thẻ, bấm "Về Trang chủ". Cài đặt → "Nhập tiến độ", chọn `luot-am`; bấm "Ôn tập" | Màn báo "File tiến độ bị hỏng, không nhập được.", không hiện hộp xác nhận; màn ôn tập vẫn "Thẻ 1 / 15" (thẻ và số đã chấm không đổi); Lộ trình, Cài đặt không đổi | e2e |
| TC-S9.3-AC1-48 | S9.3-AC1 (bổ sung) File có số thẻ mới có phần lẻ bị từ chối | Chức năng | Như TC-S9.3-AC1-47 nhưng chọn `so-le` (một ngày có số thẻ mới đã chấm 2.5) | Như TC-S9.3-AC1-47: "File tiến độ bị hỏng, không nhập được.", không hiện hộp xác nhận; màn ôn tập vẫn "Thẻ 1 / 15" | e2e |
| TC-S9.3-AC1-65 | S9.3-AC1 (bổ sung) File có số lượt ôn không phải số bị từ chối | Chức năng | Như TC-S9.3-AC1-47 nhưng chọn `so-chu` (một ngày có số lượt ôn đã chấm là chữ "ba") | Như TC-S9.3-AC1-47: "File tiến độ bị hỏng, không nhập được.", không hiện hộp xác nhận; màn ôn tập vẫn "Thẻ 1 / 15" | e2e |
| TC-S9.3-AC1-66 | S9.3-AC1 (bổ sung) File có số lượt ôn không phải số bị từ chối | Chức năng | QA chạy tay: Cài đặt → "Nhập tiến độ", lần lượt chọn `luot-am`, `so-le`, `so-chu` | Mỗi lần: "File tiến độ bị hỏng, không nhập được.", không hiện hộp xác nhận; Cài đặt không đổi | không |
| TC-S9.3-AC1-67 | S9.3-AC1 (bổ sung) Ngày thiếu số thẻ mới đã chấm thì coi là 0 | Chức năng | Giới hạn "20 thẻ"; đồng hồ ở ngày ghi kèm `thieu-so-moi`. Nhập `thieu-so-moi`, "Ghi đè"; mở màn ôn tập; đọc số đã chấm từ phía test | Màn báo "Đã nhập tiến độ." (không phải "File tiến độ bị hỏng…") trước khi mở màn ôn tập; màn ôn tập hiện "Thẻ 1 / 20"; số đã chấm hôm nay: 0 thẻ mới, 5 lượt ôn | e2e |
| TC-S9.3-AC1-68 | S9.3-AC1 (bổ sung) Ngày thiếu số thẻ mới đã chấm thì coi là 0 | Chức năng | QA chạy tay: đặt đồng hồ máy về ngày ghi kèm `thieu-so-moi`; nhập file, "Ghi đè"; bấm "Ôn tập" | "Đã nhập tiến độ."; "Thẻ 1 / 20" | không |

### Hồi quy S8.5

Không có Requirement S8.5 nào được sửa (chỉ ADDED), nhưng hình dạng file sao lưu đổi. Chạy lại case gốc của S8.5
(`openspec/changes/archive/2026-11-23-s8-5-progress-backup/test-cases.md`) trên bản build S9.3:

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC1-16 | S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ | Chức năng (hồi quy) | Chạy lại case gốc | Như case gốc | e2e |
| TC-S8.5-AC1-19 | S8.5-AC1 File có số phút đã học từng ngày | Chức năng (hồi quy) | Chạy lại case gốc | Như case gốc (số phút của từng ngày không bị ảnh hưởng bởi số đã chấm thêm vào cùng ngày) | e2e |
| TC-S8.5-AC2-7 | S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối | Biên (hồi quy) | Chạy lại case gốc | Như case gốc | e2e |
| TC-S8.5-AC3-10 | S8.5-AC3 Ghi đè thì tiến độ đúng bằng file | Chức năng (hồi quy) | Chạy lại case gốc (file `hop-le-3-bai-15-phut` là file cũ, không có giới hạn) | Như case gốc; thêm: Cài đặt "20 thẻ", "200 lượt" | e2e |
| TC-S8.5-AC3-12 | S8.5-AC3 Ghi đè xóa số phút học mà file không có | Chức năng (hồi quy) | Chạy lại case gốc | Như case gốc | e2e |

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| S9.3-AC1: Mặc định tối đa 20 thẻ mới, Thẻ mới và lượt ôn tính riêng, Mặc định tối đa 200 lượt ôn, Thẻ vượt giới hạn không được hỏi | Vitest quy tắc chốt phiên theo giới hạn (hàm thuần) + use case "lấy phiên ôn" với store giả | Hai giới hạn tính riêng; lấy thẻ đứng trước theo Q1–Q4; không dưới 0; thẻ bị giữ lại không đổi |
| S9.3-AC1: Chấm lại sau bước học ngắn…, Lưu lỗi thì không đếm, Viết không gợi ý không tính… | Vitest quy tắc đếm + use case "chấm thẻ rồi lưu" | Đếm cùng một lần lưu với thẻ; lưu lỗi không đổi cả hai |
| S9.3-AC1: Số đã chấm cộng dồn…, Sang ngày mới…, Phiên qua nửa đêm… | Vitest "hôm nay" theo giờ máy + e2e có tua đồng hồ | Mỗi lần chấm tính vào ngày lưu; danh sách phiên không đổi |
| S9.3-AC1: Thẻ bị bỏ qua không chiếm chỗ…, Chỉ thẻ bị bỏ qua vượt giới hạn… | Vitest quy tắc chốt phiên (loại thẻ bị bỏ qua trước khi áp giới hạn) + e2e | Thẻ bị bỏ qua không tính là thẻ bị giữ lại |
| S9.3-AC1: Ôn tập không làm đổi số phút học…, Học thêm phút…, Ngày chỉ ôn tập… | Vitest use case ghi bản ghi ngày (chấm thẻ / ghi phút) + quy tắc streak S8.3 | Hai loại số trong cùng bản ghi ngày không ghi đè nhau |
| S9.3-AC1: Số đã chấm hỏng…, Cài đặt không đọc được… | Vitest use case (store giả trả dữ liệu hỏng) | Không báo lỗi |
| S9.3-AC1: Hết giới hạn…, Chọn 0 thẻ mới khi chỉ có thẻ "mới" đến hạn, Hết phiên…, Focus ở thông báo hết thẻ có câu giới hạn | Vitest phân loại trạng thái rỗng + Testing Library màn ôn tập | Thứ tự xét bảng: chưa có thẻ → chưa tới hạn → hết giới hạn; giới hạn 0 thẻ mới có thẻ "mới" đến hạn là "hết giới hạn" |
| S9.3-AC2: hai nhóm Cài đặt, lưu lỗi, mặc định, hỏng, bàn phím | Testing Library màn Cài đặt + Vitest schema cài đặt | Chỉ các mức cố định |
| S9.3-AC2: Đổi giới hạn giữa ngày (tăng, hạ thẻ mới, hạ lượt ôn) | Vitest use case "lấy phiên ôn" + e2e | Bảng "Lớn hơn / Bằng hoặc nhỏ hơn" áp riêng cho từng loại |
| S9.3 (bổ sung) sao lưu | Vitest schema file sao lưu + xuất → nhập (file bản trước S9.1, bản S9.1, bản S9.3) + phiên bản định dạng; e2e hai trình duyệt | File cũ nhập được; thiếu số đếm coi 0; giá trị sai (âm, lẻ, không phải số, ngoài mức) từ chối cả file |
