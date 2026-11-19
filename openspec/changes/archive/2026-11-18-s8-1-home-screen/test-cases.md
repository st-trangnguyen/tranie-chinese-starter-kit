# Test cases: S8.1 Trang chủ

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev). Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding với mục tiêu
  15 phút, chưa xong bài nào và hôm nay chưa vào màn bài (X là 0), trừ khi case nêu khác.
- **Về Trang chủ** theo đúng đường spec đã chốt:
  - Từ màn tổng kết cuối bài hoặc bản đồ lộ trình: bấm liên kết "Trang chủ".
  - **"Rời màn bài"** khi đang làm câu (màn này không có liên kết "Trang chủ"): bấm nút Quay lại của trình duyệt, về màn đã mở bài
    (Trang chủ nếu vào bằng "Vào học"; bản đồ lộ trình nếu mở bài từ đó, rồi bấm "Trang chủ").
- **"Mở lại app"**: đóng hẳn tab/cửa sổ (hoặc app đã cài) rồi mở lại từ địa chỉ gốc của app / biểu tượng app.
- **"Mở lại màn onboarding"**: gõ địa chỉ màn onboarding vào thanh địa chỉ (địa chỉ do dev ghi trong mô tả PR code).
- **Dữ liệu tạo sẵn**: các trạng thái khó tạo bằng tay (đã học 45 phút hôm nay, hôm qua đã học 20 phút, đã xong bài từ hôm qua, đã
  xong bài ở chủ đề sau trong khi bài đầu vẫn đang mở, bài tiếp theo là bài kiểm tra cuối chủ đề, kết quả học / mục tiêu / số phút đã
  lưu không đọc được, đã xong mọi bài, hôm nay đã học 20 phút) dev ghi cách chuẩn bị trong mô tả PR code (ví dụ file sao lưu để nhập, hoặc bước sửa dữ liệu
  trong công cụ nhà phát triển của trình duyệt). Các case `e2e` tự chuẩn bị dữ liệu và tua đồng hồ, không phải chờ thật.
- **Đo thời gian khi chạy tay**: dùng đồng hồ bấm giờ, tính từ lúc vào màn bài tới lúc rời màn bài (gồm cả màn tổng kết); ở lâu hơn
  mốc yêu cầu khoảng 10 giây (ví dụ 3 phút 10 giây cho "3 phút") để không rơi vào sát ngưỡng làm tròn, trừ case Biên về làm tròn.
  Case "tăng thêm N" luôn bắt đầu từ X đã biết (0 hoặc dữ liệu tạo sẵn), không cộng thêm vào giây lẻ chưa biết.
- **"Số phút đã học hôm nay"** đọc ở dòng "Hôm nay: X / Y phút" trên Trang chủ (X).
- **Ngưỡng nhìn rõ** (CLAUDE.md §7): chữ tương phản ≥ 4.5:1 với nền; viền focus tương phản ≥ 3:1; nút và liên kết có vùng chạm ≥ 44×44 px.

## Màn Trang chủ (`home-screen`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.1-AC1-1 | S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ | Chức năng | Đã xong onboarding. Mở lại app | Thấy màn Trang chủ (tiêu đề bài tiếp theo, nút "Vào học", dòng "Hôm nay: … phút"), không ở màn học bài 1 | e2e |
| TC-S8.1-AC1-19 | S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ | Mobile 375 | Khổ 375×812. Mở Trang chủ ở hai trạng thái: còn bài tiếp theo, và đã xong mọi bài | Không có thanh cuộn ngang; tiêu đề bài dài không tràn khung; nút "Vào học" và "Xem lộ trình" có vùng chạm ≥ 44×44 px | không |
| TC-S8.1-AC1-20 | S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ | Sáng/Tối | Mở Trang chủ ở giao diện sáng rồi tối, trạng thái đã đạt mục tiêu | Ở cả hai chế độ: tiêu đề bài, nút "Vào học", "Xem lộ trình", dòng "Hôm nay: X / Y phút" và "Đã đạt mục tiêu hôm nay" đọc rõ theo ngưỡng chung | không |
| TC-S8.1-AC1-4 | S8.1-AC1 Mở màn onboarding khi đã xong | Chức năng | Đã xong onboarding. Mở lại màn onboarding | Được đưa về màn Trang chủ, không thấy bước nào của onboarding | e2e |
| TC-S8.1-AC1-21 | S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó | Chức năng | Đã xong onboarding. Mở Trang chủ, bấm "Xem lộ trình", tải lại trang | Vẫn ở màn bản đồ lộ trình, không bị đưa về Trang chủ | e2e |
| TC-S8.1-AC1-22 | S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó | Biên | Bấm "Vào học", đang ở câu thứ nhất thì tải lại trang | Vẫn ở màn học của đúng bài đó, không bị đưa về Trang chủ | không |
| TC-S8.1-AC1-2 | S8.1-AC1 Vừa xong onboarding vẫn vào bài 1 | Chức năng | Trình duyệt sạch dữ liệu. Mở app, làm hết onboarding, bấm nút ở bước cuối | Vào thẳng màn học của bài đầu tiên của lộ trình, không qua Trang chủ | e2e |
| TC-S8.1-AC1-3 | S8.1-AC1 Chưa xong onboarding thì vẫn vào onboarding | Chức năng | Trình duyệt sạch dữ liệu (chưa làm onboarding). Mở app từ địa chỉ gốc | Thấy màn onboarding, không thấy Trang chủ | e2e |
| TC-S8.1-AC1-5 | S8.1-AC1 Bấm "Vào học" thì vào bài | Chức năng | Mở Trang chủ, ghi lại tiêu đề bài đang hiện, bấm "Vào học" | Vào màn học của đúng bài có tiêu đề vừa ghi | e2e |
| TC-S8.1-AC1-6 | S8.1-AC1 Bài tiếp theo đang làm dở | Chức năng | Chưa xong bài nào. Bấm "Vào học", trả lời xong câu 1 và câu 2 tới câu thứ ba, rời màn bài (về Trang chủ), bấm "Vào học" | Vào lại đúng bài đó và đang ở câu thứ ba | e2e |
| TC-S8.1-AC1-23 | S8.1-AC1 Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở | Chức năng | Dữ liệu tạo sẵn: đã xong mọi bài thường của chủ đề đầu, bài tiếp theo là bài kiểm tra cuối chủ đề. Mở Trang chủ, bấm "Vào học", trả lời xong câu 1 và câu 2 tới câu thứ ba, rời màn bài (về Trang chủ), bấm "Vào học" | Vào bài kiểm tra cuối chủ đề đó và đang ở câu thứ nhất | e2e |
| TC-S8.1-AC1-7 | S8.1-AC1 Dùng được bằng bàn phím | A11y | Mở Trang chủ, chỉ dùng Tab để tới nút "Vào học", nhấn Enter | Khi tới nút có viền focus nhìn rõ; nhấn Enter thì vào màn học của bài đang hiện | e2e |
| TC-S8.1-AC1-8 | S8.1-AC1 Dùng được bằng bàn phím | A11y | Mở Trang chủ, dùng Tab đi qua mọi phần có thể bấm | Thứ tự focus theo thứ tự đọc trên màn; nút "Vào học" và liên kết "Xem lộ trình" đều có viền focus nhìn rõ; trình đọc màn hình đọc được tên nút "Vào học", tiêu đề bài và dòng "Hôm nay: X / Y phút" | không |
| TC-S8.1-AC1-9 | S8.1-AC1 Chưa học bài nào | Chức năng | Đã xong onboarding, chưa xong bài nào. Mở Trang chủ | Hiện tiêu đề bài đầu tiên của lộ trình (khớp bài đầu trên bản đồ lộ trình) và nút "Vào học" | e2e |
| TC-S8.1-AC1-10 | S8.1-AC1 Đã xong vài bài thì hiện bài kế tiếp | Chức năng | Làm xong bài thứ nhất và bài thứ hai, chưa làm bài thứ ba. Mở Trang chủ | Hiện tiêu đề bài thứ ba (khớp bài thứ ba trên bản đồ lộ trình, đang ở trạng thái "Đang mở") | e2e |
| TC-S8.1-AC1-11 | S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau | Chức năng | Dữ liệu tạo sẵn: đã xong mọi bài của nhóm đầu tiên. Mở Trang chủ | Hiện tiêu đề bài đầu tiên của nhóm kế tiếp (nhóm đầu không còn bài kế tiếp trong cùng giai đoạn thì là bài đầu của giai đoạn kế tiếp), khớp bản đồ lộ trình | e2e |
| TC-S8.1-AC1-12 | S8.1-AC1 Còn bài đang mở ở trước một bài đã xong | Biên | Dữ liệu tạo sẵn: đã xong một bài ở chủ đề sau, bài đầu tiên của lộ trình chưa xong. Mở Trang chủ | Hiện tiêu đề bài đầu tiên của lộ trình, không phải bài ngay sau bài đã xong | e2e |
| TC-S8.1-AC1-13 | S8.1-AC1 Đã học xong mọi bài | Chức năng | Dữ liệu tạo sẵn: đã xong mọi bài. Mở Trang chủ | Hiện "Bạn đã học xong lộ trình hiện có."; không có nút "Vào học"; dòng "Hôm nay: X / Y phút" và liên kết "Xem lộ trình" vẫn có | e2e |
| TC-S8.1-AC1-14 | S8.1-AC1 Tiến độ lưu bị hỏng | Biên | Dữ liệu tạo sẵn: kết quả học đã lưu của bài thứ nhất không đọc được. Mở Trang chủ | Trang chủ hiện bình thường, không có màn lỗi; bài tiếp theo là bài thứ nhất, có nút "Vào học" | e2e |
| TC-S8.1-AC1-15 | S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ | Chức năng | Mở Trang chủ, bấm "Xem lộ trình" | Vào màn bản đồ lộ trình | e2e |
| TC-S8.1-AC1-16 | S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ | A11y | Mở Trang chủ, dùng Tab tới "Xem lộ trình", nhấn Enter | Có viền focus nhìn rõ; vào màn bản đồ lộ trình | không |
| TC-S8.1-AC1-17 | S8.1-AC1 Mở Trang chủ khi offline | Offline | Mở app một lần (có mạng), xong onboarding, đóng app. Tắt mạng, mở lại app | Thấy Trang chủ với tiêu đề bài tiếp theo, nút "Vào học" và dòng "Hôm nay: X / Y phút" | e2e |
| TC-S8.1-AC1-18 | S8.1-AC1 Mở Trang chủ khi offline | Offline | Tiếp TC-S8.1-AC1-17, vẫn tắt mạng: bấm "Vào học", rời màn bài (về Trang chủ), bấm "Xem lộ trình", rồi bấm "Trang chủ" | Vào được màn học của bài đó; vào được bản đồ lộ trình; về được Trang chủ | không |
| TC-S8.1-AC2-1 | S8.1-AC2 Chưa học hôm nay | Chức năng | Xong onboarding với mục tiêu 30 phút, hôm nay chưa vào màn bài. Mở Trang chủ | Hiện "Hôm nay: 0 / 30 phút"; không có "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-2 | S8.1-AC2 Đã học một phần mục tiêu | Chức năng | Mục tiêu 15 phút, hôm nay chưa học. Bấm "Vào học", ở màn bài 7 phút 10 giây, rời màn bài (về Trang chủ) | Hiện "Hôm nay: 7 / 15 phút"; không có "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-3 | S8.1-AC2 Mục tiêu lưu bị hỏng | Biên | Dữ liệu tạo sẵn: mục tiêu mỗi ngày đã lưu không đọc được. Mở Trang chủ | Trang chủ hiện bình thường, dòng "Hôm nay: 0 / 15 phút" | e2e |
| TC-S8.1-AC2-4 | S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng | Chức năng | Mục tiêu 15 phút. Mở Trang chủ thấy "Hôm nay: 0 / 15 phút", bấm "Vào học", làm xong bài, trên màn tổng kết bấm "Trang chủ" sao cho từ lúc bấm "Vào học" tới lúc bấm "Trang chủ" là 2 phút 10 giây | Hiện "Hôm nay: 2 / 15 phút" ngay khi về, không cần tải lại trang | e2e |
| TC-S8.1-AC2-5 | S8.1-AC2 Vượt mục tiêu | Chức năng | Mục tiêu 30 phút, dữ liệu tạo sẵn: hôm nay đã học 45 phút. Mở Trang chủ | Hiện "Hôm nay: 45 / 30 phút" và "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-6 | S8.1-AC2 Vừa đúng mục tiêu | Biên | Mục tiêu 15 phút, dữ liệu tạo sẵn: hôm nay đã học đúng 15 phút. Mở Trang chủ | Hiện "Hôm nay: 15 / 15 phút" và "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-7 | S8.1-AC2 Vừa đúng mục tiêu | Biên | Mục tiêu 15 phút, dữ liệu tạo sẵn: hôm nay đã học 14 phút 50 giây. Mở Trang chủ | Hiện "Hôm nay: 14 / 15 phút"; không có "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-31 | S8.1-AC2 Để Trang chủ mở qua nửa đêm | Biên | Mục tiêu 15 phút, dữ liệu tạo sẵn: hôm nay đã học 20 phút. Lúc 23:59 theo giờ máy mở Trang chủ, thấy "Hôm nay: 20 / 15 phút"; để nguyên Trang chủ, không thao tác, tới 0:01 hôm sau. Rồi bấm "Xem lộ trình", trên bản đồ lộ trình bấm "Trang chủ" | Lúc 0:01, trước khi rời Trang chủ, vẫn hiện "Hôm nay: 20 / 15 phút" và "Đã đạt mục tiêu hôm nay"; sau khi quay về Trang chủ hiện "Hôm nay: 0 / 15 phút", không còn "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-32 | S8.1-AC2 Để Trang chủ mở qua nửa đêm | Biên | Như TC-S8.1-AC2-31 tới 0:01 hôm sau, rồi đóng app và mở lại app | Trước khi đóng vẫn hiện "Hôm nay: 20 / 15 phút"; mở lại thì hiện "Hôm nay: 0 / 15 phút" | không |
| TC-S8.1-AC2-33 | S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm | Biên | Mục tiêu 15 phút, dữ liệu tạo sẵn: hôm nay đã học 20 phút. Lúc 23:59 theo giờ máy mở Trang chủ, thấy "Hôm nay: 20 / 15 phút" và "Đã đạt mục tiêu hôm nay". Chuyển sang tab khác (Trang chủ bị ẩn), tới 0:01 hôm sau quay lại tab app, không bấm gì, không tải lại trang | Trang chủ hiện "Hôm nay: 0 / 15 phút", không còn "Đã đạt mục tiêu hôm nay" | e2e |
| TC-S8.1-AC2-34 | S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm | Mobile 375 | Trên iPhone thật (app đã cài lên màn hình chính), mục tiêu 15 phút. Tối trước học đủ để Trang chủ hiện "Hôm nay: X / 15 phút" với X ≥ 15 và "Đã đạt mục tiêu hôm nay"; để app ở Trang chủ, về màn hình chính hoặc khóa máy trước nửa đêm, không vuốt tắt app. Sáng hôm sau bấm biểu tượng app | Trang chủ hiện "Hôm nay: 0 / 15 phút", không có "Đã đạt mục tiêu hôm nay" | không |

## Bản đồ lộ trình (`learning-path`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.1-AC1-24 | S8.1-AC1 Từ bản đồ lộ trình về Trang chủ | Chức năng | Mở Trang chủ, bấm "Xem lộ trình", trên bản đồ lộ trình bấm "Trang chủ" | Thấy màn Trang chủ | e2e |
| TC-S8.1-AC1-25 | S8.1-AC1 Từ bản đồ lộ trình về Trang chủ | A11y | Trên bản đồ lộ trình, chỉ dùng Tab tới liên kết "Trang chủ", nhấn Enter | Liên kết có viền focus nhìn rõ, trình đọc màn hình đọc được tên "Trang chủ"; nhấn Enter thì thấy Trang chủ | không |
| TC-S8.1-AC1-31 | S8.1-AC1 Từ bản đồ lộ trình về Trang chủ | Mobile 375 | Khổ 375×812. Xem bản đồ lộ trình | Liên kết "Trang chủ" nhìn thấy được, vùng chạm ≥ 44×44 px, không gây thanh cuộn ngang | không |
| TC-S8.1-AC1-32 | S8.1-AC1 Từ bản đồ lộ trình về Trang chủ | Sáng/Tối | Xem bản đồ lộ trình ở giao diện sáng rồi tối | Liên kết "Trang chủ" đọc rõ theo ngưỡng chung ở cả hai chế độ | không |

## Màn bài và màn tổng kết (`lesson-runner`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.1-AC1-26 | S8.1-AC1 Từ màn tổng kết về Trang chủ | Chức năng | Bấm "Vào học", làm xong bài, trên màn tổng kết bấm "Trang chủ" | Thấy màn Trang chủ | e2e |
| TC-S8.1-AC1-27 | S8.1-AC1 Từ màn tổng kết về Trang chủ | Biên | Dữ liệu tạo sẵn: mở được bài kiểm tra cuối chủ đề và bài kiểm tra vượt cấp. Làm xong từng bài kiểm tra, trên màn tổng kết của mỗi bài bấm "Trang chủ" | Màn tổng kết của cả hai loại bài kiểm tra đều có "Trang chủ"; bấm thì thấy Trang chủ | không |
| TC-S8.1-AC1-28 | S8.1-AC1 Từ màn tổng kết về Trang chủ | Mobile 375 | Khổ 375×812. Làm xong một bài, xem màn tổng kết | Liên kết "Trang chủ" nhìn thấy được, vùng chạm ≥ 44×44 px, không gây thanh cuộn ngang | không |
| TC-S8.1-AC1-29 | S8.1-AC1 Từ màn tổng kết về Trang chủ | Sáng/Tối | Xem màn tổng kết cuối bài ở giao diện sáng rồi tối | Liên kết "Trang chủ" đọc rõ theo ngưỡng chung ở cả hai chế độ | không |
| TC-S8.1-AC1-30 | S8.1-AC1 Màn bài khi đang làm câu không có liên kết Trang chủ | Chức năng | Bấm "Vào học", đang ở câu thứ nhất | Màn bài không có liên kết "Trang chủ" | không |

## Phút học mỗi ngày (`daily-study-time`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.1-AC2-8 | S8.1-AC2 Ở màn bài được tính | Chức năng | Hôm nay chưa học. Bấm "Vào học", ở màn bài 3 phút 10 giây, rời màn bài (về Trang chủ) | X là 3 | e2e |
| TC-S8.1-AC2-10 | S8.1-AC2 Thoát giữa bài vẫn được tính | Chức năng | Hôm nay chưa học (X là 0). Bấm "Vào học", ở màn bài 2 phút 10 giây, chưa làm xong bài thì rời màn bài (về Trang chủ) | X là 2 | e2e |
| TC-S8.1-AC2-11 | S8.1-AC2 Học lại bài đã xong vẫn được tính | Chức năng | Dữ liệu tạo sẵn: bài thứ nhất đã xong từ hôm qua, hôm nay chưa vào màn bài (X là 0). Mở bản đồ lộ trình, mở lại bài thứ nhất, ở màn bài 4 phút 10 giây, rời màn bài, trên bản đồ lộ trình bấm "Trang chủ" | X là 4 | e2e |
| TC-S8.1-AC2-9 | S8.1-AC2 Bài kiểm tra cuối chủ đề được tính | Chức năng | Dữ liệu tạo sẵn: bài tiếp theo là bài kiểm tra cuối chủ đề, hôm nay chưa vào màn bài (X là 0). Bấm "Vào học", làm bài kiểm tra 3 phút 10 giây tới màn tổng kết, ở màn tổng kết thêm 1 phút 10 giây, bấm "Trang chủ" | X là 4 | e2e |
| TC-S8.1-AC2-27 | S8.1-AC2 Bài kiểm tra vượt cấp được tính | Chức năng | Dữ liệu tạo sẵn: mở được bài kiểm tra vượt cấp (S3.6), hôm nay chưa vào màn bài (X là 0). Mở bài kiểm tra vượt cấp, làm 3 phút 10 giây tới màn tổng kết, ở màn tổng kết thêm 1 phút 10 giây, bấm "Trang chủ" | X là 4 | e2e |
| TC-S8.1-AC2-12 | S8.1-AC2 Thời gian app chạy nền không tính | Chức năng | Hôm nay chưa học (X là 0). Vào màn bài 1 phút 10 giây, chuyển sang tab/app khác 10 phút, quay lại màn bài thêm 1 phút, rời màn bài (về Trang chủ) | X là 2 (không phải 12) | e2e |
| TC-S8.1-AC2-13 | S8.1-AC2 Thời gian app chạy nền không tính | Mobile 375 | Trên điện thoại thật, mở app trong trình duyệt của điện thoại, hôm nay chưa học (X là 0): vào màn bài 1 phút 10 giây, khóa màn hình 5 phút, mở khóa, ở màn bài thêm 1 phút, rời màn bài bằng nút Quay lại | X là 2 | không |
| TC-S8.1-AC2-14 | S8.1-AC2 Màn khác không tính | Chức năng | Hôm nay chưa học (X là 0). Chỉ ở Trang chủ và bản đồ lộ trình tổng 5 phút, không vào màn bài nào, trên bản đồ lộ trình bấm "Trang chủ" | X là 0 | e2e |
| TC-S8.1-AC2-15 | S8.1-AC2 Màn khác không tính | Biên | Hôm nay chưa học (X là 0). Ở màn xem thứ tự nét 2 phút rồi màn luyện viết 2 phút, về Trang chủ | X là 0 | không |
| TC-S8.1-AC2-28 | S8.1-AC2 Để app mở ở màn bài không thao tác vẫn tính | Biên | Hôm nay chưa học (X là 0), trước 21 giờ để không qua nửa đêm. Vào màn bài, không thao tác gì trong 2 giờ 0 phút 10 giây, màn bài vẫn hiện suốt thời gian đó (máy không tự khóa màn hình), rồi rời màn bài (về Trang chủ) | X là 120 | e2e |
| TC-S8.1-AC2-29 | S8.1-AC2 Hai tab cùng mở màn bài | Biên | Hôm nay chưa học (X là 0). Mở app ở hai cửa sổ trình duyệt đặt cạnh nhau, cả hai cùng hiện trên màn hình. Ở cả hai cửa sổ bấm "Vào học", ở đó 3 phút 10 giây, rồi rời màn bài ở cả hai cửa sổ. Tải lại Trang chủ | X là 6 | e2e |
| TC-S8.1-AC2-16 | S8.1-AC2 Làm tròn xuống phút | Biên | Hôm nay chưa học. Ở màn bài 7 phút 50 giây, rời màn bài (về Trang chủ) | X là 7 (không phải 8) | e2e |
| TC-S8.1-AC2-17 | S8.1-AC2 Giây lẻ được cộng dồn | Biên | Hôm nay chưa học. Vào màn bài 40 giây, rời màn bài (về Trang chủ; X là 0); vào màn bài lần nữa 40 giây, rời màn bài | Sau lần hai X là 1 | e2e |
| TC-S8.1-AC2-18 | S8.1-AC2 Sang ngày mới đếm lại | Chức năng | Dữ liệu tạo sẵn: hôm qua đã học 20 phút, hôm nay chưa vào màn bài. Mở Trang chủ | X là 0 | e2e |
| TC-S8.1-AC2-20 | S8.1-AC2 Nhiều lần học trong cùng ngày được cộng | Chức năng | Hôm nay chưa học. Ở màn bài 5 phút 10 giây, rời màn bài (về Trang chủ), đóng app. Mấy giờ sau (cùng ngày) mở lại, ở màn bài 6 phút 10 giây, rời màn bài | X là 11 | e2e |
| TC-S8.1-AC2-19 | S8.1-AC2 Học qua nửa đêm chia cho hai ngày | Biên | Ngày trước nửa đêm chưa vào màn bài, ngày sau cũng chưa. Vào màn bài lúc 23:57:50 theo giờ máy, ở liên tục tới 00:02:10 ngày hôm sau, rời màn bài (về Trang chủ) | X của ngày mới là 2 (không phải 4); ngày trước được tính 2 phút (không xem được trên Trang chủ, kiểm ở tầng dưới) | e2e |
| TC-S8.1-AC2-21 | S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối | Chức năng | Hôm nay chưa học. Vào màn bài 3 phút 40 giây rồi đóng tab (hoặc cửa sổ trình duyệt) đang mở màn bài, không về Trang chủ. Mở lại app | Vào Trang chủ, X là 3 (không phải 0 hay 2) | e2e |
| TC-S8.1-AC2-30 | S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối | Biên | Hôm nay chưa học. Vào màn bài 3 phút 40 giây rồi buộc thoát trình duyệt (tắt cưỡng bức cả trình duyệt, không đóng từng tab). Mở lại app | Vào Trang chủ, X là 3 (không phải 0 hay 2) | e2e |
| TC-S8.1-AC2-22 | S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối | Mobile 375 | Trên điện thoại thật (app đã cài), hôm nay chưa học: vào màn bài 3 phút 40 giây, vuốt đóng app khỏi danh sách app đang chạy. Mở lại app | Vào Trang chủ, X là 3 | không |
| TC-S8.1-AC2-23 | S8.1-AC2 Số phút còn sau khi mở lại app | Chức năng | Hôm nay chưa học. Ở màn bài 9 phút 10 giây, rời màn bài (về Trang chủ) thấy X là 9. Đóng app, mở lại trong cùng ngày | Trang chủ vẫn hiện X là 9 | e2e |
| TC-S8.1-AC2-24 | S8.1-AC2 Số phút còn sau khi mở lại app | Offline | Như TC-S8.1-AC2-23 nhưng tắt mạng trước khi vào màn bài và giữ tắt mạng khi mở lại app | Trang chủ vẫn hiện X là 9 | không |
| TC-S8.1-AC2-25 | S8.1-AC2 Thời gian học đã lưu bị hỏng | Biên | Dữ liệu tạo sẵn: số phút học đã lưu của hôm nay không đọc được. Mở Trang chủ | Trang chủ hiện bình thường, không có màn lỗi; X là 0 | e2e |
| TC-S8.1-AC2-26 | S8.1-AC2 Thời gian học đã lưu bị hỏng | Biên | Tiếp TC-S8.1-AC2-25: bấm "Vào học", ở màn bài 2 phút 10 giây, rời màn bài (về Trang chủ) | X là 2 (học tiếp vẫn được ghi nhận) | không |

## Ghi chú

- Tổng 66 case; 46 `e2e`. Các case `e2e` có mốc thời gian dùng đồng hồ giả của Playwright, không chờ thật; case chạy tay thì chờ thật.
- ID giữ nguyên từ bản trước để đối chiếu finding; case mới đánh số tiếp (AC1-21…32, AC2-27…34), nên trong bảng ID không theo thứ tự.
  Vòng 2: ba case đóng app (AC2-21 đóng tab/cửa sổ, AC2-30 buộc thoát trình duyệt, AC2-22 vuốt tắt trên máy thật) cùng gắn vào
  Scenario "Đóng app giữa bài chỉ mất tối đa 30 giây cuối", mỗi case một cách đóng, cùng kỳ vọng X là 3. AC1-28/29 chỉ còn màn tổng
  kết; phần bản đồ lộ trình tách sang AC1-31/32.
  TC-S8.1-AC2-9 đổi nội dung: thay case "màn tổng kết được tính" bằng case bài kiểm tra cuối chủ đề (Scenario mới đã bao phần màn tổng kết).
- TC-S8.1-AC1-22, AC2-26 và TC-S8.1-AC1-18 kiểm điều Requirement đã nêu (bảng "tải lại ở màn bài"; dữ liệu hỏng thì vẫn học tiếp
  được; offline vào bài như S1.2) nhưng không có Scenario riêng. QA người thật có thể bỏ nếu thấy thừa.
- Chạy tay khó hoặc không làm được: TC-S8.1-AC2-28 (chờ thật 2 giờ, chỉ dựa vào e2e), TC-S8.1-AC2-19 (phải đổi giờ máy sang gần nửa
  đêm; phần "ngày trước 2 phút" không hiện trên giao diện vì lịch sử ngoài phạm vi, chỉ kiểm được ở test tầng service), TC-S8.1-AC2-30
  (e2e phải giả lập trang bị sập, không có sự kiện đóng trang), TC-S8.1-AC2-31/-32/-33 (chạy tay phải đổi giờ máy sang 23:59; AC2-33 e2e giả lập tab bị ẩn rồi hiện lại bằng đồng hồ giả),
  TC-S8.1-AC2-13/-22/-34 (máy thật; AC2-34 cần chờ qua đêm).
- e2e S1.3 và S3.1 cũ (mở app thì vào bài 1) phải đổi theo TC-S8.1-AC1-1 trong PR code (đã nêu ở Impact của proposal).
