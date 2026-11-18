# Test cases: S8.3 Streak

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Cần S8.1 đã merge** trên bản build: có Trang chủ và dòng số phút đã học hôm nay so với mục tiêu. **Không cần S8.2**:
  mọi tình huống đổi mục tiêu được kiểm bằng dữ liệu mục tiêu đặt sẵn (TC-S8.3-AC1-19 đổi mục tiêu đang chọn qua màn Cài đặt
  nếu S8.2 đã có, nếu chưa thì sửa mục tiêu đang chọn trong dữ liệu), không bắt buộc qua màn Cài đặt.
- **Nạp dữ liệu nhiều ngày (chạy tay)**: không chờ thật từng ngày. Làm theo hướng dẫn trong **mô tả PR code**: dùng DevTools của
  trình duyệt để sửa dữ liệu trên máy của app (thêm số phút học và mục tiêu cho từng ngày, xóa mục tiêu của một ngày, ghi giá trị
  không đọc được vào số phút hoặc mục tiêu), rồi tải lại trang. Tình huống cần giờ cụ thể (23:58, qua 0:00, ngày kế tiếp) thì chỉnh
  đồng hồ hệ điều hành. Nếu mô tả PR code chưa có hướng dẫn này thì ghi "không chạy được: thiếu hướng dẫn nạp dữ liệu" và báo dev.
- **e2e** dùng cùng dữ liệu đó, nạp sẵn trước khi mở Trang chủ, kèm đồng hồ giả lập của trình duyệt.
- **"Ngày"** tính theo giờ trên máy, 0:00 đến 23:59.
- **"Đạt" một ngày** = số phút đã học của ngày đó (làm tròn xuống như Trang chủ hiện) lớn hơn hoặc bằng mục tiêu dùng để so của
  ngày đó. Ngày không có phút học nào là ngày chưa đạt.
- **Ký hiệu chuỗi ngày** trong các bước: liệt kê từ cũ đến mới, ví dụ `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 10 phút`
  (D-1 là hôm qua, D+1 là ngày mai). Ngày sớm nhất trong dữ liệu luôn là "không học" để chuỗi có điểm dừng rõ ràng; trước đó
  không có dữ liệu. Mỗi ngày "đạt" học 20 phút với mục tiêu của ngày đó 15 phút, trừ khi nêu khác. "Mục tiêu đang chọn" là mục
  tiêu hiện tại của người học; nếu không nêu thì mục tiêu đang chọn và mục tiêu của mọi ngày đều là 15 phút.
- Mỗi case bắt đầu từ app đã xong onboarding, có mạng, trừ khi nêu khác.
- **Dòng streak** luôn có dạng đúng chữ "Chuỗi ngày học: N ngày". Kết quả mong đợi so nguyên văn dòng này.
- **Ngưỡng nhìn rõ** (CLAUDE.md §7): chữ dòng streak tương phản ≥ 4.5:1 với nền ở cả chế độ sáng và tối.

**Cột Tự động**: `e2e` = Playwright trên bản build, dữ liệu nạp sẵn và đồng hồ cố định. `không` = QA chạy tay (trình đọc màn
hình, mắt nhìn, khổ màn, đồng hồ hoặc thiết bị thật).

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.3-AC1-1 | S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1 | Chức năng | Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 14 phút`. Mở Trang chủ, đọc dòng streak. Sửa dữ liệu hôm nay thành 15 phút, rời rồi mở lại Trang chủ | Trước: dòng phút hôm nay 14 phút, "Chuỗi ngày học: 2 ngày". Sau: dòng phút hôm nay 15 phút, "Chuỗi ngày học: 3 ngày" | e2e |
| TC-S8.3-AC1-2 | S8.3-AC1 Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua | Chức năng | Mục tiêu đang chọn và mục tiêu mọi ngày 30 phút. Nạp `D-5 không học · D-4, D-3, D-2, D-1 mỗi ngày 35 phút · hôm nay 10 phút`. Mở Trang chủ | "Chuỗi ngày học: 4 ngày" (không về 0 dù hôm nay chưa đạt) | e2e |
| TC-S8.3-AC1-3 | S8.3-AC1 Bỏ một ngày thì chuỗi đứt | Chức năng | Nạp `D-7 không học · D-6…D-2 đạt (5 ngày) · D-1 học 5 phút · hôm nay 0 phút`. Mở Trang chủ | "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC1-4 | S8.3-AC1 Bỏ một ngày thì chuỗi đứt | Biên | Như TC-S8.3-AC1-3 nhưng D-1 **không có phút học nào** (không mở app ngày đó) | "Chuỗi ngày học: 0 ngày" | không |
| TC-S8.3-AC1-5 | S8.3-AC1 Đếm lại sau khi chuỗi đứt | Chức năng | Nạp `D-8 không học · D-7…D-3 đạt (5 ngày) · D-2 học 5 phút · D-1 đạt · hôm nay đạt`. Mở Trang chủ | "Chuỗi ngày học: 2 ngày" (không cộng 5 ngày trước ngày bị đứt) | e2e |
| TC-S8.3-AC1-6 | S8.3-AC1 Người học mới chưa có ngày nào | Chức năng | Xóa dữ liệu trang (bắt đầu như người dùng mới), làm xong onboarding chọn mục tiêu 15 phút, không học gì, xem Trang chủ | "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC1-7 | S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt | Biên | Nạp `D-1 không học · hôm nay 14 phút 59 giây`. Mở Trang chủ | Dòng phút hôm nay hiện 14 phút; "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC1-8 | S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt | Biên | Như TC-S8.3-AC1-7 nhưng hôm nay đúng 15 phút 0 giây | Dòng phút hôm nay hiện 15 phút; "Chuỗi ngày học: 1 ngày" (bằng mục tiêu là đạt) | không |
| TC-S8.3-AC1-9 | S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy | Biên | Đồng hồ máy 23:58. Nạp `D-2 không học · D-1 đạt · hôm nay đạt`. Mở Trang chủ, thấy "Chuỗi ngày học: 2 ngày". Đợi đồng hồ qua 0:00 (không học thêm), rời rồi quay lại Trang chủ. Sau đó chỉnh đồng hồ máy sang ngày kế tiếp nữa (ngày vừa sang không học), mở lại Trang chủ | Sau 0:00: vẫn "Chuỗi ngày học: 2 ngày", dòng phút hôm nay về 0 phút. Sang ngày kế tiếp nữa: "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC1-10 | S8.3-AC1 Số phút của một ngày đã qua bị hỏng | Biên | Nạp `D-3 không học · D-2 20 phút · D-1 20 phút · hôm nay 20 phút`, rồi ghi giá trị không đọc được vào số phút của D-1. Mở Trang chủ | "Chuỗi ngày học: 1 ngày"; Trang chủ vẫn hiện bình thường (dòng phút hôm nay 20 phút, không có màn lỗi, các phần khác của Trang chủ vẫn hiện) | e2e |
| TC-S8.3-AC1-11 | S8.3-AC1 Ngày ghi sau hôm nay không được tính | Biên | Nạp `D-2 không học · D-1 20 phút · hôm nay 20 phút · D+1 20 phút` (giống đồng hồ máy từng bị chỉnh lùi). Mở Trang chủ | "Chuỗi ngày học: 2 ngày"; dòng phút hôm nay 20 phút | e2e |
| TC-S8.3-AC1-12 | S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua | Chức năng | Mục tiêu đang chọn 30 phút (vừa đổi từ 15 hôm nay). Nạp `D-4 không học · D-3, D-2, D-1 mỗi ngày 20 phút, mục tiêu của ngày 15 · hôm nay 20 phút`. Mở Trang chủ | Dòng phút hôm nay 20 so với mục tiêu 30; "Chuỗi ngày học: 3 ngày" (ba ngày cũ vẫn đạt, hôm nay chưa đạt mục tiêu 30) | e2e |
| TC-S8.3-AC1-13 | S8.3-AC1 Hạ mục tiêu không biến ngày chưa đạt thành đạt | Chức năng | Mục tiêu đang chọn 15 phút (vừa đổi từ 30 hôm nay). Nạp `D-3 không học · D-2, D-1 mỗi ngày 20 phút, mục tiêu của ngày 30 · hôm nay 0 phút`. Mở Trang chủ | "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC1-14 | S8.3-AC1 Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi | Biên | Đồng hồ máy 23:58. Mục tiêu đang chọn 30 phút (đổi từ 15 sau khi đã học xong hôm nay; mục tiêu của hôm nay là 30 (đã cập nhật khi đổi)). Nạp `D-1 không học · hôm nay 20 phút`. Mở Trang chủ, thấy "Chuỗi ngày học: 0 ngày". Đợi đồng hồ qua 0:00 (không học thêm), rời rồi quay lại Trang chủ | Trước và sau 0:00 đều "Chuỗi ngày học: 0 ngày" (không thành 1 ngày) | e2e |
| TC-S8.3-AC1-15 | S8.3-AC1 Mục tiêu đang chọn bị hỏng | Biên | Ghi giá trị không đọc được vào mục tiêu đang chọn. Nạp `D-1 không học · hôm nay 15 phút`. Mở Trang chủ | Dòng phút hôm nay so với mục tiêu 15 phút (như S8.1); "Chuỗi ngày học: 1 ngày" | e2e |
| TC-S8.3-AC1-16 | S8.3-AC1 Ngày đã qua không có mục tiêu đọc được | Biên | Mục tiêu đang chọn 15 phút. Nạp `D-2 không học · D-1 20 phút · hôm nay 20 phút`. Chạy hai lần: (a) ghi giá trị không đọc được vào mục tiêu của D-1; (b) xóa mục tiêu của D-1 (giữ số phút). Mỗi lần mở Trang chủ | Cả (a) và (b): "Chuỗi ngày học: 2 ngày" (D-1 được so với 15 phút) | e2e |
| TC-S8.3-AC1-17 | S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó | Chức năng | Đồng hồ máy 23:50. Nạp `D-1 không học · hôm nay 10 phút` (ngày này sẽ thành "hôm qua" sau 0:00). Vào một bài, **ở màn bài liên tục** (màn bài luôn hiện, không chuyển tab, không khóa màn hình) tới 0:10 ngày hôm sau, rời màn bài, mở Trang chủ | Dòng phút hôm nay 10 phút (chỉ phần từ 0:00); "Chuỗi ngày học: 1 ngày" (hôm qua 10 + 10 = 20 phút, đạt; hôm nay 10 phút, chưa đạt) | e2e |
| TC-S8.3-AC1-18 | S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó | Biên | Đồng hồ máy 23:50. Nạp `D-2 không học · D-1 đạt · hôm nay 10 phút`. Ở màn bài liên tục như TC-S8.3-AC1-17 tới 0:10 ngày hôm sau, rời màn bài, mở Trang chủ | Dòng phút hôm nay 10 phút; "Chuỗi ngày học: 2 ngày". Nếu thấy "1 ngày" hoặc dòng phút hôm nay 20 phút (cả buổi tính cho hôm nay) hay 0 phút (cả buổi tính cho hôm qua) là Fail | không |
| TC-S8.3-AC1-19 | S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua | Chức năng | Không nạp dữ liệu bằng tay. Đồng hồ máy ở ngày D-3: xóa dữ liệu trang, làm xong onboarding chọn mục tiêu 15 phút. Ở mỗi ngày D-3, D-2, D-1: vào một bài, ở màn bài liên tục 20 phút rồi làm xong bài (e2e: đồng hồ giả lập chạy thời gian tới; chạy tay: đổi ngày hệ điều hành giữa các ngày, không đổi giờ trong lúc học). Chưa từng đổi mục tiêu trong ba ngày này. Sang hôm nay (chưa học), mở Trang chủ, đọc dòng streak. Đổi mục tiêu đang chọn lên 30 phút (qua màn Cài đặt nếu S8.2 đã có, nếu chưa thì sửa mục tiêu đang chọn trong dữ liệu theo mô tả PR code), mở lại Trang chủ | Trước khi đổi: "Chuỗi ngày học: 3 ngày". Sau khi đổi: dòng phút hôm nay 0 so với mục tiêu 30; vẫn "Chuỗi ngày học: 3 ngày" (ba ngày app tự ghi vẫn so với 15 phút) | e2e |
| TC-S8.3-AC2-1 | S8.3-AC2 Trang chủ hiện streak | Chức năng | Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay đạt`. Mở Trang chủ | Hiện đúng chữ "Chuỗi ngày học: 3 ngày" | e2e |
| TC-S8.3-AC2-2 | S8.3-AC2 Trang chủ hiện streak | A11y | Như TC-S8.3-AC2-1. Bật trình đọc màn hình (VoiceOver hoặc NVDA), duyệt Trang chủ bằng bàn phím/cử chỉ đọc | Trình đọc màn hình đọc được "Chuỗi ngày học: 3 ngày" (số và chữ, không chỉ biểu tượng hay màu) | không |
| TC-S8.3-AC2-3 | S8.3-AC2 Trang chủ hiện streak | Mobile 375 | Như TC-S8.3-AC2-1 ở khổ 375×812 | Dòng "Chuỗi ngày học: 3 ngày" hiện đủ, không bị cắt chữ, không tràn ngang trang; các phần khác của Trang chủ vẫn như S8.1 | không |
| TC-S8.3-AC2-4 | S8.3-AC2 Trang chủ hiện streak | Sáng/Tối | Như TC-S8.3-AC2-1, xem ở chế độ sáng rồi chế độ tối; bật thêm giảm chuyển động của hệ điều hành rồi tải lại | Dòng streak đọc rõ (tương phản ≥ 4.5:1) ở cả hai chế độ; dòng streak không có hiệu ứng chuyển động (đếm số, nhảy, nháy) dù có hay không bật giảm chuyển động | không |
| TC-S8.3-AC2-5 | S8.3-AC2 Streak bằng 0 vẫn hiện | Chức năng | Nạp `D-2 không học · D-1 học 5 phút · hôm nay 3 phút`. Mở Trang chủ | Hiện "Chuỗi ngày học: 0 ngày" (dòng không bị ẩn) | e2e |
| TC-S8.3-AC2-6 | S8.3-AC2 Streak hiện khi không có mạng | Offline | Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 0 phút`. Mở app một lần khi có mạng, đóng app, tắt mạng, mở lại app vào Trang chủ | Hiện "Chuỗi ngày học: 2 ngày" | e2e |
| TC-S8.3-AC2-7 | S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay | Chức năng | Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 13 phút`. Mở Trang chủ, thấy "Chuỗi ngày học: 2 ngày". Vào một bài, **học thật** ít nhất 2 phút rồi làm xong bài, bấm "Trang chủ" trên màn tổng kết (không tải lại trang, không đóng app) | Dòng phút hôm nay ≥ 15 phút; "Chuỗi ngày học: 3 ngày" | e2e |
| TC-S8.3-AC2-8 | S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay | Biên | Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 13 phút`. Vào một bài, học dưới 2 phút rồi làm xong bài (tổng hôm nay phải dừng **dưới 15 phút**), bấm "Trang chủ" trên màn tổng kết | Dòng phút hôm nay < 15 phút; vẫn "Chuỗi ngày học: 2 ngày" | không |
| TC-S8.3-AC2-9 | S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật | Chức năng | Đồng hồ máy 23:58. Nạp `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 0 phút`. Mở Trang chủ, thấy "Chuỗi ngày học: 2 ngày". Chuyển sang tab khác, đợi đồng hồ qua 0:00, quay lại tab app (không bấm gì, không tải lại) | "Chuỗi ngày học: 0 ngày" | e2e |
| TC-S8.3-AC2-10 | S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật | Mobile 375 | Trên điện thoại thật (app đã cài lên màn hình chính), dữ liệu như TC-S8.3-AC2-9, đồng hồ máy 23:58, đang ở Trang chủ. Khóa màn hình, đợi qua 0:00, mở khóa quay lại app | "Chuỗi ngày học: 0 ngày" | không |
| TC-S8.3-AC2-11 | S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật | Biên | Dữ liệu như TC-S8.3-AC2-9, đồng hồ máy 23:58. Để Trang chủ hiện liên tục ở tab đang xem (không chuyển tab, không rời màn) cho tới khi qua 0:00. Sau đó chuyển tab khác rồi quay lại | Trong lúc hiện liên tục qua 0:00: vẫn "Chuỗi ngày học: 2 ngày". Sau khi quay lại tab: "Chuỗi ngày học: 0 ngày" | không |

## Ghi chú

- Quy tắc đếm (bảng hôm nay/hôm qua, ≥ mục tiêu, làm tròn xuống phút, ngày không có dữ liệu, ngày sau hôm nay, mục tiêu theo ngày,
  mục tiêu thiếu/hỏng) dev kiểm thêm bằng Vitest ở tầng quy tắc nghiệp vụ, theo đúng các Scenario S8.3-AC1; các case trên chỉ kiểm
  hành vi người học thấy trên bản build.
- Mục tiêu theo ngày (người thật đã chốt): mục tiêu nằm trong bản ghi phút học của từng ngày. Từ bản S8.3, mỗi lần app ghi hoặc
  tạo bản ghi phút học của hôm nay thì ghi luôn mục tiêu đang chọn, và cập nhật mục tiêu của hôm nay mỗi lần đổi mục tiêu. Ngày
  ghi trước bản S8.3 có thể không có mục tiêu và được so với mục tiêu hôm nay; TC-S8.3-AC1-16 (b) (xóa mục tiêu của D-1) mô phỏng
  loại ngày này. TC-S8.3-AC1-12 đến -16 nạp mục tiêu theo ngày bằng tay; TC-S8.3-AC1-19 kiểm cùng quy tắc trên bản ghi do app tự
  ghi. Dev ghi cách nạp mục tiêu theo ngày (vị trí trong dữ liệu, ví dụ một bản ghi) trong mô tả PR code.
- Dev kiểm thêm bằng Vitest: mỗi lần ghi phút học vào một ngày thì bản ghi của ngày đó lưu kèm mục tiêu đang chọn lúc ghi; đổi
  mục tiêu thì mục tiêu của hôm nay được cập nhật, các ngày đã qua giữ nguyên.
- TC-S8.3-AC1-1 kiểm quy tắc bằng dữ liệu nạp sẵn; TC-S8.3-AC2-7 kiểm cùng tình huống qua việc học thật ở màn bài.
- Case cần qua 0:00 (TC-S8.3-AC1-9, -14, -17, -18, TC-S8.3-AC2-9 đến -11) chạy tay bằng cách đổi giờ hệ điều hành; e2e dùng đồng hồ giả lập
  của trình duyệt.
- TC-S8.3-AC1-17 và -18 cần S8.1 đã chia buổi học vắt qua 0:00 cho hai ngày (Requirement "Mỗi ngày đếm lại từ 0"). Chạy tay:
  ở màn bài thật đủ 20 phút qua 0:00 (không chỉnh đồng hồ giữa chừng, vì nhảy giờ không phải thời gian học thật). Các case qua
  0:00 khác (TC-S8.3-AC1-9, -14, TC-S8.3-AC2-9 đến -11) không học trong lúc qua 0:00 nên không đổi theo quy tắc này.
