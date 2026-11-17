# Test cases: S8.4 Tải audio offline theo chủ đề

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/offline-audio/spec.md`.

**Điều kiện đầu chung**

- **Nội dung mẫu**: bản 0.2 chưa có chủ đề HSK thật (E11), nên mọi case tải/xóa chạy trên bản build có nội dung mẫu (bản build e2e).
  Dev ghi trong mô tả PR code tên các chủ đề mẫu, bài nào chứa audio nào, và cách mở bản build đó. Mọi audio của các chủ đề dưới đây
  nằm trong bài đang mở (trừ chủ đề khóa). Được gộp nhiều vai vào một chủ đề nếu không mâu thuẫn. Bộ nội dung mẫu cần có:
  - **Chủ đề "Chào hỏi"**: 4 file audio, tổng 2 516 582 byte (hiện "2,4 MB"); ngay sau chủ đề có link "Kiểm tra vượt cấp". Gồm
    **audio chung Chào hỏi–Gia đình** (đúng một file) và 3 audio chỉ thuộc "Chào hỏi".
  - **Chủ đề "Gia đình"** (chủ đề B): 3 file audio: **audio chung Chào hỏi–Gia đình**, **audio chung Gia đình–C** và một audio chỉ
    thuộc "Gia đình".
  - **Chủ đề C**: đúng 2 file audio: **audio chung Gia đình–C** (không thuộc "Chào hỏi") và một audio Nhập môn. Vì vậy:
    - tải "Chào hỏi" không làm C thành "Đã tải" (C vẫn thiếu audio chung Gia đình–C);
    - tải xong "Gia đình" thì C tự thành "Đã tải" (đủ hai file), QA không bấm gì ở C;
    - xóa "Gia đình" khi không chủ đề nào đang tải thì C về "Chưa tải".
  - **Chủ đề "Vòng 1", "Vòng 2", "Vòng 3"**: ba audio x, y, z không phải audio Nhập môn, không thuộc chủ đề nào khác; "Vòng 1" = x, y;
    "Vòng 2" = y, z; "Vòng 3" = x, z.
  - **Chủ đề "Đôi 1", "Đôi 2"**: đúng cùng một bộ audio (ít nhất 2 file, không phải audio Nhập môn, không thuộc chủ đề nào khác).
  - **Chủ đề KB**: 2 file audio, tổng 870 400 byte (hiện "850 KB"), không dùng chung với chủ đề nào.
  - **Chủ đề nhỏ**: tổng audio 300 byte (hiện "1 KB").
  - **Chủ đề sát 1 MB**: tổng audio 1 048 064 byte (hiện "1,0 MB").
  - **Chủ đề 1,3 MB**: tổng audio 1 310 720 byte (hiện "1,3 MB").
  - **Chủ đề khóa**: có audio, mọi bài đều đang khóa.
  - **Chủ đề không audio**: thuộc HSK, không có audio nào.
  - **Chủ đề Nhập môn không audio**: thuộc giai đoạn Nhập môn, không có audio nào.
  - **Chủ đề dùng chung Nhập môn**: một file trùng với một audio trong bài Nhập môn (cùng câu đọc, cùng giọng), cộng ít nhất một file riêng.
  - **Chủ đề chỉ Nhập môn**: thuộc HSK, mọi audio đều là audio Nhập môn.
- **Bắt đầu sạch**: trừ khi nêu khác, mỗi case bắt đầu từ app mới cài (xóa dữ liệu trang), đã mở app một lần khi có mạng và chờ app lưu
  sẵn xong (audio Nhập môn đã có trên máy), chưa tải và chưa nghe audio của chủ đề HSK nào.
- **"Mạng chậm"**: mỗi file audio về chậm (e2e làm chậm từng file; chạy tay dùng giới hạn tốc độ của trình duyệt) để thấy từng mức phần trăm.
- **"Tắt mạng"**: chế độ máy bay trên điện thoại, hoặc chế độ Offline của trình duyệt trên máy tính.
- **"Mở lại app"**: đóng hẳn tab/app rồi mở lại (không chỉ tải lại trang), trừ khi nêu khác.
- **"Vùng thông báo"**: phần trình đọc màn hình tự đọc khi trạng thái đổi. Case `e2e` kiểm chữ trong vùng thông báo; case `không` nghe
  bằng trình đọc màn hình thật.
- **Ngưỡng nhìn rõ** (CLAUDE.md §7): chữ và thông báo tương phản ≥ 4.5:1 với nền; viền focus ≥ 3:1; nút có vùng chạm ≥ 44×44 px.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (mạng, offline, mở lại app, vùng thông báo, focus chạy được trên Playwright).
`không` = QA chạy tay mỗi lần nghiệm thu (trình đọc màn hình, đo tương phản bằng mắt/công cụ, đóng app đã cài, máy thật).

## Mỗi chủ đề có nút tải, hiện dung lượng

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-1 | S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng | Chức năng | Mở màn Lộ trình, tìm chủ đề "Chào hỏi" | Ngay dưới tiêu đề "Chào hỏi" có đúng một nút "Tải audio (2,4 MB)"; chủ đề này không có "Đang tải", "Đã tải audio" hay nút "Xóa audio" | e2e |
| TC-S8.4-AC1-2 | S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng | Mobile 375 | Khổ 375×812, mở màn Lộ trình, cuộn tới "Chào hỏi" | Nút "Tải audio (2,4 MB)" hiện đủ chữ, không bị cắt, vùng chạm ≥ 44×44 px; trang không cuộn ngang | e2e |
| TC-S8.4-AC1-3 | S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng | Sáng/Tối | Mở màn Lộ trình ở giao diện sáng rồi tối, xem khối audio của "Chào hỏi" | Ở cả hai giao diện nút "Tải audio (2,4 MB)" đọc rõ (≥ 4.5:1), nhận ra được là nút | không |
| TC-S8.4-AC1-4 | S8.4-AC1 Khối audio nằm trên link kiểm tra vượt cấp | Chức năng | Mở màn Lộ trình, tìm "Chào hỏi" | Từ trên xuống: tiêu đề "Chào hỏi", rồi nút "Tải audio (2,4 MB)", rồi link "Kiểm tra vượt cấp"; nhấn Tab thì nút tải nhận focus trước link | e2e |
| TC-S8.4-AC1-5 | S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy | Offline | Bắt đầu sạch; tắt mạng; mở màn Lộ trình; mở một bài của "Chào hỏi" và bấm nghe một audio chỉ thuộc "Chào hỏi" | Khối "Chào hỏi" hiện nút "Tải audio (2,4 MB)"; audio không phát được | e2e |

## Trạng thái audio offline của chủ đề

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-6 | S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa | Chức năng | Có mạng, bấm "Tải audio (2,4 MB)" của "Chào hỏi", chờ xong | Khối hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio"; không còn nút "Tải audio" hay "Đang tải" ở chủ đề này | e2e |
| TC-S8.4-AC1-7 | S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa | Mobile 375 | Khổ 375×812, tải xong audio của "Chào hỏi" | "Đã tải audio (2,4 MB)" và nút "Xóa audio" hiện đủ, không chồng lên nhau; nút "Xóa audio" vùng chạm ≥ 44×44 px; không cuộn ngang | e2e |
| TC-S8.4-AC1-8 | S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa | Sáng/Tối | Tải xong "Chào hỏi", xem khối ở giao diện sáng rồi tối | "Đã tải audio (2,4 MB)" và nút "Xóa audio" đọc rõ ở cả hai giao diện (≥ 4.5:1) | không |
| TC-S8.4-AC1-9 | S8.4-AC1 Thiếu một phần audio thì là chưa tải | Chức năng | Có mạng, mở bài của "Chào hỏi", nghe đúng 3 trong 4 audio của chủ đề; quay về màn Lộ trình | Khối "Chào hỏi" hiện nút "Tải audio (2,4 MB)" (dung lượng vẫn là tổng của chủ đề); không hiện "Đã tải audio" | e2e |
| TC-S8.4-AC1-10 | S8.4-AC1 Đã nghe hết audio thì là đã tải | Chức năng | Bắt đầu sạch; có mạng, không bấm tải ở chủ đề nào (không chủ đề nào đang tải); mở các bài của "Chào hỏi" và nghe đủ 4 audio (có audio không phải audio Nhập môn); quay về màn Lộ trình | Khối "Chào hỏi" hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio" | e2e |

## Dung lượng hiện theo KB hoặc MB

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-11 | S8.4-AC1 Dung lượng dưới 1 MB hiện theo KB | Biên | Mở màn Lộ trình, tìm chủ đề KB | Nút là "Tải audio (850 KB)" | e2e |
| TC-S8.4-AC1-12 | S8.4-AC1 Dung lượng rất nhỏ hiện tối thiểu 1 KB | Biên | Mở màn Lộ trình, tìm chủ đề nhỏ | Nút là "Tải audio (1 KB)", không phải "0 KB" | e2e |
| TC-S8.4-AC1-13 | S8.4-AC1 Dung lượng sát 1 MB hiện 1,0 MB | Biên | Mở màn Lộ trình, tìm chủ đề sát 1 MB | Nút là "Tải audio (1,0 MB)", không phải "1024 KB" | e2e |
| TC-S8.4-AC1-14 | S8.4-AC1 Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5 | Biên | Mở màn Lộ trình, tìm chủ đề 1,3 MB | Nút là "Tải audio (1,3 MB)", không phải "1,2 MB" | e2e |

## Tải audio của chủ đề về máy

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-15 | S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy | Chức năng | Bắt đầu sạch; có mạng, không chủ đề nào khác đang tải; bấm "Tải audio (2,4 MB)" của "Chào hỏi", chờ xong | Khối hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio"; "Gia đình" và C vẫn hiện nút "Tải audio (<dung lượng>)" (vẫn thiếu audio); các chủ đề không dùng chung audio với "Chào hỏi" không đổi | e2e |
| TC-S8.4-AC1-16 | S8.4-AC1 Tải hai chủ đề cùng lúc | Chức năng | Mạng chậm; bấm "Tải audio" của "Chào hỏi"; khi khối còn "Đang tải" thì bấm "Tải audio (850 KB)" của chủ đề KB; chờ cả hai xong | Trong lúc tải, cả hai khối cùng hiện "Đang tải <n>%", mỗi khối theo số file của chính chủ đề đó ("Chào hỏi": 25/50/75%; chủ đề KB: 50%); khi xong "Chào hỏi" hiện "Đã tải audio (2,4 MB)" và chủ đề KB hiện "Đã tải audio (850 KB)" | e2e |
| TC-S8.4-AC1-17 | S8.4-AC1 Đã tải thì học offline vẫn nghe được | Offline | Tải xong "Chào hỏi"; tắt mạng; mở bài của "Chào hỏi"; bấm nghe lần lượt mọi audio | Mọi audio phát được; không hiện lỗi tải audio hay nút thử lại | e2e |
| TC-S8.4-AC1-18 | S8.4-AC1 Đã tải thì học offline vẫn nghe được | Offline | Như TC-S8.4-AC1-17 nhưng trên điện thoại thật (Safari iOS và Chrome Android) đã cài app ra màn hình chính, bật chế độ máy bay | Mọi audio của "Chào hỏi" phát được | không |
| TC-S8.4-AC1-19 | S8.4-AC1 Mở lại app vẫn thấy đã tải | Chức năng | Tải xong "Chào hỏi"; mở lại app; mở màn Lộ trình | Khối "Chào hỏi" vẫn hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio" | e2e |
| TC-S8.4-AC1-20 | S8.4-AC1 Mở lại app vẫn thấy đã tải | Offline | Tải xong "Chào hỏi"; tắt mạng; mở lại app; mở màn Lộ trình | Khối "Chào hỏi" vẫn hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio" | e2e |
| TC-S8.4-AC1-21 | S8.4-AC1 Chủ đề đang khóa vẫn tải được | Chức năng | Có mạng, chưa học bài nào; bấm "Tải audio" của chủ đề khóa, chờ xong | Khối hiện "Đã tải audio (<dung lượng của chủ đề>)" kèm nút "Xóa audio"; các bài của chủ đề vẫn hiện "Đã khóa" | e2e |

## Tiến độ tải tính theo số file

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-22 | S8.4-AC1 Hiện tiến độ khi đang tải | Chức năng | Mạng chậm, bấm "Tải audio" của "Chào hỏi" (4 file), quan sát khối đến khi xong | Xong 1 file thì khối hiện "Đang tải 25%"; suốt lúc tải không có nút "Tải audio" hay "Xóa audio" ở chủ đề này; số chỉ tăng (25%, 50%, 75%) rồi chuyển thẳng sang "Đã tải audio (2,4 MB)", không hiện "Đang tải 100%" | e2e |
| TC-S8.4-AC1-23 | S8.4-AC1 Hiện tiến độ khi đang tải | Sáng/Tối | Mạng chậm, xem "Đang tải <n>%" của "Chào hỏi" ở giao diện sáng rồi tối | Chữ tiến độ đọc rõ (≥ 4.5:1) ở cả hai giao diện | không |
| TC-S8.4-AC1-24 | S8.4-AC1 Hiện tiến độ khi đang tải | A11y | Bật "Giảm chuyển động" của hệ điều hành, mạng chậm, tải "Chào hỏi"; lặp lại khi tắt cài đặt | Ở cả hai lần tiến độ chỉ là chữ phần trăm đổi số; không có thanh chạy, vòng xoay hay hiệu ứng chuyển động | không |
| TC-S8.4-AC1-25 | S8.4-AC1 Tiến độ làm tròn xuống | Biên | Bắt đầu sạch; mạng chậm, bấm "Tải audio" của "Gia đình" (3 file, chưa có file nào trên máy) | Xong 1 file: "Đang tải 33%"; xong 2 file: "Đang tải 66%"; rồi "Đã tải audio (<dung lượng của Gia đình>)" | e2e |
| TC-S8.4-AC1-26 | S8.4-AC1 Tiến độ tính cả file đã có từ trước | Biên | Có mạng, nghe 2 trong 4 audio của "Chào hỏi"; quay về màn Lộ trình; mạng chậm, bấm "Tải audio (2,4 MB)" | Ngay khi bấm khối hiện "Đang tải 50%" (không phải 0%); xong thêm 1 file: "Đang tải 75%"; rồi "Đã tải audio (2,4 MB)" | e2e |

## Chủ đề không cần tải

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-27 | S8.4-AC1 Chủ đề Nhập môn có sẵn offline | Chức năng | Mở màn Lộ trình | Chủ đề Nhập môn có audio hiện "Audio có sẵn offline"; không có nút "Tải audio" hay "Xóa audio" ở chủ đề này | e2e |
| TC-S8.4-AC1-28 | S8.4-AC1 Chủ đề Nhập môn có sẵn offline | Offline | Bắt đầu sạch; tắt mạng; mở lại app, mở màn Lộ trình rồi mở bài Nhập môn và bấm nghe | Chủ đề Nhập môn vẫn hiện "Audio có sẵn offline"; audio Nhập môn phát được (hành vi S1.2 giữ nguyên) | e2e |
| TC-S8.4-AC1-29 | S8.4-AC1 Chủ đề Nhập môn có sẵn offline | Chức năng | Trên bản build thật (không có nội dung mẫu), mở màn Lộ trình | Chỉ thấy nhãn "Audio có sẵn offline" ở chủ đề Nhập môn có audio; không có nút "Tải audio" nào | không |
| TC-S8.4-AC1-30 | S8.4-AC1 Chủ đề Nhập môn có sẵn offline | Sáng/Tối | Xem nhãn "Audio có sẵn offline" ở giao diện sáng rồi tối, khổ 375×812 và 1280×800 | Nhãn đọc rõ (≥ 4.5:1), nằm dưới tiêu đề chủ đề; không cuộn ngang ở 375 | không |
| TC-S8.4-AC1-31 | S8.4-AC1 Chủ đề HSK chỉ dùng audio Nhập môn | Chức năng | Bắt đầu sạch; mở màn Lộ trình, tìm chủ đề chỉ Nhập môn | Chủ đề hiện "Audio có sẵn offline"; không có nút "Tải audio" hay "Xóa audio" | e2e |
| TC-S8.4-AC1-32 | S8.4-AC1 Chủ đề không có audio | Chức năng | Mở màn Lộ trình, tìm chủ đề không audio | Chủ đề không có khối audio offline: không có nút "Tải audio", "Đã tải audio", "Xóa audio" hay "Audio có sẵn offline" | e2e |
| TC-S8.4-AC1-33 | S8.4-AC1 Chủ đề Nhập môn không có audio thì không có khối | Chức năng | Mở màn Lộ trình, tìm chủ đề Nhập môn không audio | Chủ đề không có khối audio offline: không hiện "Audio có sẵn offline", không có nút "Tải audio" hay "Xóa audio"; chủ đề Nhập môn có audio vẫn hiện "Audio có sẵn offline" | e2e |

## Báo lỗi khi tải không được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-34 | S8.4-AC1 Bấm tải khi không có mạng | Offline | Tắt mạng; mở màn Lộ trình; bấm "Tải audio (2,4 MB)" của "Chào hỏi" | Trong khối "Chào hỏi" hiện "Cần có mạng để tải audio."; khối vẫn có nút "Tải audio (2,4 MB)"; không hiện "Đang tải" | e2e |
| TC-S8.4-AC1-35 | S8.4-AC1 Bấm tải khi không có mạng | A11y | Như TC-S8.4-AC1-34 | Vùng thông báo chứa đúng câu "Cần có mạng để tải audio." | e2e |
| TC-S8.4-AC1-36 | S8.4-AC1 Bấm tải khi không có mạng | Biên | Tiếp TC-S8.4-AC1-34: bật lại mạng, bấm "Tải audio (2,4 MB)", chờ xong | Câu "Cần có mạng để tải audio." mất; tải bình thường; khối hiện "Đã tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC1-37 | S8.4-AC1 Bấm tải khi không có mạng | Sáng/Tối | Như TC-S8.4-AC1-34 ở giao diện sáng rồi tối, khổ 375×812 | Câu thông báo đọc rõ (≥ 4.5:1), không che nút hay nội dung khác; không cuộn ngang | không |
| TC-S8.4-AC1-38 | S8.4-AC1 Mất mạng khi đang tải | Offline | Mạng chậm, bấm "Tải audio" của "Chào hỏi"; khi khối hiện "Đang tải 50%" thì tắt mạng | Trong khối "Chào hỏi" hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."; có lại nút "Tải audio (2,4 MB)"; vẫn tắt mạng, mở bài "Chào hỏi" và nghe: 2 audio đã tải phát được | e2e |
| TC-S8.4-AC1-39 | S8.4-AC1 Mất mạng khi đang tải | Biên | Có mạng, một file audio của "Chào hỏi" trả lỗi khi tải (Dev giả lập trong e2e), bấm "Tải audio" | Trong khối "Chào hỏi" hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."; có lại nút "Tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC1-40 | S8.4-AC1 Tải lại chỉ tải phần còn thiếu | Chức năng | Tiếp TC-S8.4-AC1-38: bật lại mạng (vẫn mạng chậm), bấm "Tải audio (2,4 MB)", chờ xong | Ngay khi bấm khối hiện "Đang tải 50%"; xong thêm 1 file: "Đang tải 75%"; rồi "Đã tải audio (2,4 MB)". Chỉ 2 file còn thiếu được tải (e2e đếm lượt tải audio; chạy tay xem trong công cụ mạng của trình duyệt) | e2e |
| TC-S8.4-AC1-41 | S8.4-AC1 Không đủ bộ nhớ | Biên | Giả lập máy hết bộ nhớ trong lúc tải (Dev giả lập trong e2e), bấm "Tải audio" của "Chào hỏi" | Trong khối "Chào hỏi" hiện "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại."; có lại nút "Tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC1-42 | S8.4-AC1 Không đủ bộ nhớ | A11y | Như TC-S8.4-AC1-41 | Vùng thông báo chứa đúng câu "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại." | e2e |
| TC-S8.4-AC1-43 | S8.4-AC1 Không đủ bộ nhớ | Biên | Trên điện thoại thật gần đầy bộ nhớ, bấm "Tải audio" của một chủ đề | Như TC-S8.4-AC1-41; app không treo; các chủ đề không dùng chung audio với chủ đề đó không đổi trạng thái | không |

## Thông báo nằm trong khối của chủ đề

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-44 | S8.4-AC1 Thông báo của mỗi chủ đề độc lập | Chức năng | Có mạng, tải xong "Gia đình"; tắt mạng; bấm "Tải audio" của "Chào hỏi" (khối hiện "Cần có mạng để tải audio."); vẫn tắt mạng, bấm "Xóa audio" của "Gia đình" | Khối "Chào hỏi" vẫn hiện "Cần có mạng để tải audio." và nút "Tải audio (2,4 MB)" (trạng thái "Chào hỏi" không đổi: trước và sau đều là chưa tải); khối "Gia đình" hiện "Đã xóa audio của chủ đề Gia đình."; mỗi câu nằm trong khối của chủ đề tương ứng | e2e |
| TC-S8.4-AC1-45 | S8.4-AC1 Thông báo mất khi bấm nút kế tiếp | Chức năng | Gây lỗi như TC-S8.4-AC1-38; bật lại mạng; bấm "Tải audio" của "Chào hỏi" | Khối không còn "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." mà hiện "Đang tải <n>%" | e2e |
| TC-S8.4-AC1-46 | S8.4-AC1 Thông báo mất khi bấm nút kế tiếp | Biên | Gây lỗi như TC-S8.4-AC1-38; không bấm gì trong khối; vào một bài rồi quay lại màn Lộ trình (app vẫn mở) | Khối "Chào hỏi" vẫn hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." kèm nút "Tải audio (2,4 MB)" | e2e |

## Thông báo mất khi trạng thái chủ đề đổi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-47 | S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì | Chức năng | Có mạng, mạng chậm; Dev cho audio chung Chào hỏi–Gia đình được tải sau cùng và trả lỗi (giả lập trong e2e); bấm "Tải audio" của "Chào hỏi"; thấy khối hiện "Đang tải 75%" (3 file riêng đã xong) rồi hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."; bỏ giả lập lỗi; không bấm gì trong khối "Chào hỏi"; bấm "Tải audio" của "Gia đình", chờ xong | Trước lỗi khối "Chào hỏi" đã hiện "Đang tải 75%". Sau khi "Gia đình" tải xong: khối "Chào hỏi" hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio" và không còn câu "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."; khối "Gia đình" hiện "Đã tải audio (<dung lượng của Gia đình>)" | e2e |
| TC-S8.4-AC1-48 | S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì | Biên | Tải xong "Chào hỏi"; bấm "Xóa audio" (khối hiện "Đã xóa audio của chủ đề Chào hỏi."); có mạng, không bấm gì trong khối, mở bài "Chào hỏi" và nghe đủ 4 audio; quay về màn Lộ trình | Khối "Chào hỏi" hiện "Đã tải audio (2,4 MB)" kèm nút "Xóa audio" và không còn câu "Đã xóa audio của chủ đề Chào hỏi." | e2e |

## Việc tải không phụ thuộc màn đang mở

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-49 | S8.4-AC1 Rời màn khi đang tải | Chức năng | Mạng chậm, bấm "Tải audio" của "Chào hỏi"; khi còn "Đang tải" thì vào một bài Nhập môn; chờ đến khi việc tải xong rồi quay lại màn Lộ trình | Khối "Chào hỏi" hiện "Đã tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC1-50 | S8.4-AC1 Quay lại màn khi việc tải còn đang chạy | Chức năng | Mạng chậm, bấm "Tải audio" của "Chào hỏi" (4 file); vào một bài Nhập môn; quay lại màn Lộ trình khi đã xong 2 file và việc tải còn chạy | Khối hiện "Đang tải 50%" (không quay về 0%, không có nút "Tải audio"); sau đó chuyển sang "Đã tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC1-51 | S8.4-AC1 Đóng app giữa chừng | Offline | Trình duyệt giữ dữ liệu giữa các lần mở (Playwright dùng hồ sơ trình duyệt bền, không xóa bộ nhớ đệm); mạng chậm, bấm "Tải audio" của "Chào hỏi"; khi khối hiện "Đang tải 50%" thì đóng trình duyệt; mở lại trình duyệt với cùng hồ sơ khi có mạng, mở màn Lộ trình; rồi tắt mạng, mở bài "Chào hỏi" và nghe | Khối "Chào hỏi" hiện nút "Tải audio (2,4 MB)" (không hiện "Đang tải"); khi offline 2 audio đã tải trước đó phát được | e2e |
| TC-S8.4-AC1-52 | S8.4-AC1 Đóng app giữa chừng | Offline | Trên điện thoại thật (Safari iOS và Chrome Android) đã cài app ra màn hình chính: mạng chậm, bấm "Tải audio" của "Chào hỏi"; khi khối hiện "Đang tải 50%" thì vuốt đóng hẳn app; mở lại app khi có mạng, mở màn Lộ trình; rồi bật chế độ máy bay, mở bài "Chào hỏi" và nghe | Khối "Chào hỏi" hiện nút "Tải audio (2,4 MB)"; khi offline các audio đã tải trước khi đóng phát được | không |

## Xóa được audio đã tải

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC2-1 | S8.4-AC2 Xóa audio đã tải | Chức năng | Tải xong "Chào hỏi"; bấm "Xóa audio" | Không có hộp hỏi xác nhận; trong khối hiện "Đã xóa audio của chủ đề Chào hỏi."; khối có lại nút "Tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC2-2 | S8.4-AC2 Xóa audio đã tải | Chức năng | Tiếp TC-S8.4-AC2-1: mở lại app, mở màn Lộ trình | Khối "Chào hỏi" vẫn là nút "Tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC2-3 | S8.4-AC2 Xóa audio đã tải | Biên | Nghe đủ 4 audio của "Chào hỏi" khi có mạng (không bấm tải) để khối thành "Đã tải audio"; bấm "Xóa audio" | Trong khối hiện "Đã xóa audio của chủ đề Chào hỏi."; khối có lại nút "Tải audio (2,4 MB)" | e2e |
| TC-S8.4-AC2-4 | S8.4-AC2 Xóa audio đã tải | Sáng/Tối | Xóa audio "Chào hỏi" ở giao diện sáng rồi tối, khổ 375×812 | Câu "Đã xóa audio của chủ đề Chào hỏi." đọc rõ (≥ 4.5:1), không che nút hay nội dung khác; không cuộn ngang | không |
| TC-S8.4-AC2-5 | S8.4-AC2 Đã xóa thì offline không còn nghe được | Offline | Tải xong "Chào hỏi"; xóa audio; tắt mạng; mở bài "Chào hỏi" và bấm nghe một audio chỉ thuộc "Chào hỏi" | Audio không phát; bài hiện giống khi audio không tải được (cùng thông báo và nút thử lại như hiện có) | e2e |
| TC-S8.4-AC2-6 | S8.4-AC2 Xóa không làm hỏng chủ đề khác đang tải | Offline | Có mạng, tải xong "Gia đình"; mạng chậm, bấm "Tải audio" của "Chào hỏi" (khối bắt đầu ở "Đang tải 25%" vì audio chung đã có); khi khối "Chào hỏi" còn "Đang tải" thì bấm "Xóa audio" của "Gia đình"; chờ "Chào hỏi" xong; tắt mạng; mở bài "Chào hỏi" và nghe audio chung Chào hỏi–Gia đình | Khối "Gia đình" hiện "Đã xóa audio của chủ đề Gia đình." và nút "Tải audio (<dung lượng của Gia đình>)"; tiến độ "Chào hỏi" không lùi; "Chào hỏi" tải xong và hiện "Đã tải audio (2,4 MB)"; audio chung phát được khi offline | e2e |
| TC-S8.4-AC2-7 | S8.4-AC2 Xóa không làm mất audio Nhập môn | Offline | Tải xong chủ đề dùng chung Nhập môn; bấm "Xóa audio" của chủ đề đó; tắt mạng; mở màn Lộ trình rồi mở bài Nhập môn chứa audio dùng chung và bấm nghe | Chủ đề Nhập môn vẫn hiện "Audio có sẵn offline"; audio dùng chung phát được trong bài Nhập môn | e2e |
| TC-S8.4-AC2-8 | S8.4-AC2 Tải lại sau khi xóa | Chức năng | Tải xong "Chào hỏi"; xóa; có mạng, bấm "Tải audio (2,4 MB)", chờ xong | Khối hiện lại "Đã tải audio (2,4 MB)" kèm nút "Xóa audio"; câu "Đã xóa audio…" không còn; tắt mạng thì audio "Chào hỏi" phát được | e2e |

## Chủ đề đã tải dùng chung audio bị xóa thì về chưa tải

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC2-9 | S8.4-AC2 Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải | Chức năng | Có mạng, tải xong "Chào hỏi" và "Gia đình" (không chủ đề nào đang tải); bấm "Xóa audio" của "Chào hỏi"; tắt mạng; mở bài "Gia đình" và nghe audio chỉ thuộc "Gia đình" | Khối "Chào hỏi" hiện "Đã xóa audio của chủ đề Chào hỏi." và nút "Tải audio (2,4 MB)"; khối "Gia đình" hiện nút "Tải audio (<dung lượng của Gia đình>)", không hiện "Đã tải audio" và không có câu "Đã xóa audio…" (không thông báo riêng, theo proposal); audio chỉ thuộc "Gia đình" phát được khi offline | e2e |
| TC-S8.4-AC2-10 | S8.4-AC2 Chủ đề dùng chung audio vòng tròn vẫn xóa được | Chức năng | Có mạng, tải xong "Vòng 1" và "Vòng 2" (khi đó "Vòng 3" tự thành "Đã tải"; nếu chưa thì tải "Vòng 3"); chờ không chủ đề nào đang tải; xem ba khối; bấm "Xóa audio" của "Vòng 1" | Trước khi xóa: cả ba khối hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio". Sau khi xóa: khối "Vòng 1" hiện "Đã xóa audio của chủ đề Vòng 1." và nút "Tải audio (<dung lượng>)"; khối "Vòng 2" và "Vòng 3" hiện nút "Tải audio (<dung lượng>)" | e2e |
| TC-S8.4-AC2-11 | S8.4-AC2 Hai chủ đề cùng bộ audio vẫn xóa được | Chức năng | Có mạng, tải xong "Đôi 1" (khi đó "Đôi 2" tự thành "Đã tải"); xem hai khối; bấm "Xóa audio" của "Đôi 1" | Trước khi xóa: cả hai khối hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio". Sau khi xóa: khối "Đôi 1" hiện "Đã xóa audio của chủ đề Đôi 1." và nút "Tải audio (<dung lượng>)"; khối "Đôi 2" hiện nút "Tải audio (<dung lượng>)" | e2e |

## Nút xóa chỉ hiện khi xóa được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC2-12 | S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải | Chức năng | Có mạng, tải xong "Đôi 2" (khi đó "Đôi 1" tự thành "Đã tải", mọi audio của "Đôi 1" dùng chung với "Đôi 2"); chờ không chủ đề nào đang tải; xem khối "Đôi 1" | Khối "Đôi 1" hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio" | e2e |
| TC-S8.4-AC2-13 | S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải | Biên | Có mạng, tải xong "Gia đình" (khi đó C tự thành "Đã tải": một audio là audio Nhập môn, audio còn lại dùng chung với "Gia đình"); chờ không chủ đề nào đang tải; xem khối C; bấm "Xóa audio" của C | Trước khi xóa: khối C hiện "Đã tải audio (<dung lượng của C>)" kèm nút "Xóa audio"; khối "Gia đình" cũng có nút "Xóa audio". Sau khi xóa: khối C hiện "Đã xóa audio của chủ đề <tên C>." và nút "Tải audio (<dung lượng của C>)"; khối "Gia đình" hiện nút "Tải audio (<dung lượng của Gia đình>)"; chủ đề Nhập môn vẫn hiện "Audio có sẵn offline" | e2e |
| TC-S8.4-AC2-14 | S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa | Chức năng | Có mạng, tải xong C (khối C có nút "Xóa audio"); mạng chậm, bấm "Tải audio" của "Gia đình"; trong lúc "Gia đình" còn "Đang tải" thì xem khối C; chờ "Gia đình" xong | Trong lúc "Gia đình" đang tải: khối C hiện "Đã tải audio (<dung lượng của C>)" và không có nút "Xóa audio". Khi "Gia đình" tải xong: khối C có nút "Xóa audio" | e2e |
| TC-S8.4-AC2-15 | S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa | Biên | Như TC-S8.4-AC2-14, nhưng trong lúc "Gia đình" còn "Đang tải" thì tắt mạng | Khối "Gia đình" hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." và nút "Tải audio"; khối C hiện "Đã tải audio (<dung lượng của C>)" kèm nút "Xóa audio" | e2e |

## Trạng thái tải đọc được bằng trình đọc màn hình

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-53 | S8.4-AC1 Nút tải có tên kèm chủ đề | A11y | Mở màn Lộ trình, kiểm tên của nút tải "Chào hỏi" (Playwright tìm nút theo tên) | Có nút với tên đúng "Tải audio (2,4 MB), chủ đề Chào hỏi"; tên bắt đầu bằng đúng chữ nhìn thấy trên nút | e2e |
| TC-S8.4-AC1-54 | S8.4-AC1 Nút tải có tên kèm chủ đề | A11y | Bật trình đọc màn hình (VoiceOver trên Safari iOS, NVDA trên Chrome), di tới nút tải của "Chào hỏi" | Nghe "Tải audio (2,4 MB), chủ đề Chào hỏi" kèm vai trò nút | không |
| TC-S8.4-AC1-55 | S8.4-AC1 Nút tải có tên kèm chủ đề | A11y | Chỉ dùng bàn phím, ở giao diện sáng rồi tối: Tab tới nút tải "Chào hỏi" | Viền focus nhìn thấy quanh nút, tương phản ≥ 3:1 với nền ở cả hai giao diện | không |
| TC-S8.4-AC2-16 | S8.4-AC2 Nút xóa có tên kèm chủ đề | A11y | Tải xong "Chào hỏi"; kiểm tên của nút xóa (Playwright tìm nút theo tên) | Có nút với tên đúng "Xóa audio, chủ đề Chào hỏi" | e2e |
| TC-S8.4-AC2-17 | S8.4-AC2 Nút xóa có tên kèm chủ đề | A11y | Tải xong "Chào hỏi"; bật trình đọc màn hình, di tới nút xóa | Nghe "Xóa audio, chủ đề Chào hỏi" kèm vai trò nút | không |
| TC-S8.4-AC2-18 | S8.4-AC2 Nút xóa có tên kèm chủ đề | A11y | Tải xong "Chào hỏi"; chỉ dùng bàn phím, ở giao diện sáng rồi tối: Tab tới nút "Xóa audio" | Viền focus nhìn thấy quanh nút, tương phản ≥ 3:1 với nền ở cả hai giao diện | không |

## Vùng thông báo đọc đổi trạng thái

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-56 | S8.4-AC1 Tải bằng bàn phím và nghe được kết quả | A11y | Mạng chậm; chỉ dùng bàn phím: Tab tới nút tải "Chào hỏi", nhấn Enter, chờ xong | Khi bắt đầu, vùng thông báo chứa "Đang tải audio chủ đề Chào hỏi."; khi xong chứa "Đã tải xong audio chủ đề Chào hỏi."; suốt lúc tải vùng thông báo không lúc nào chứa "Đang tải 25%", "Đang tải 50%" hay "Đang tải 75%" (các chữ này chỉ hiện trong khối) | e2e |
| TC-S8.4-AC1-57 | S8.4-AC1 Tải bằng bàn phím và nghe được kết quả | A11y | Bật trình đọc màn hình; mạng chậm; Tab tới nút tải "Chào hỏi", nhấn Enter, chờ xong; sau đó lần lượt gây ba lỗi: bấm tải khi tắt mạng, mất mạng giữa chừng, hết bộ nhớ (giả lập, nếu bản build cho phép) | Nghe "Đang tải audio chủ đề Chào hỏi." rồi "Đã tải xong audio chủ đề Chào hỏi."; không nghe đọc số phần trăm; mỗi lỗi nghe đúng nguyên văn câu lỗi của bảng trong spec | không |

## Mỗi câu thông báo được đọc đủ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-58 | S8.4-AC1 Hai chủ đề báo cùng lúc thì đọc đủ cả hai | A11y | Mạng chậm; bấm "Tải audio" của "Chào hỏi" rồi của "Gia đình"; Dev giữ file cuối của mỗi chủ đề và thả cho cả hai xong cách nhau dưới một giây; ghi lại mọi câu xuất hiện trong vùng thông báo từ lúc bấm đến khi cả hai xong | Cả "Đã tải xong audio chủ đề Chào hỏi." và "Đã tải xong audio chủ đề Gia đình." đều xuất hiện trong vùng thông báo, mỗi câu đúng nguyên văn; khi câu thứ hai xuất hiện, câu thứ nhất vẫn còn trong vùng thông báo (vùng chung, hoặc vùng thông báo riêng của khối chủ đề đó) | e2e |
| TC-S8.4-AC1-59 | S8.4-AC1 Hai chủ đề báo cùng lúc thì đọc đủ cả hai | A11y | Bật trình đọc màn hình (VoiceOver trên Safari iOS, NVDA trên Chrome); dùng nội dung mẫu và mạng chậm sao cho "Chào hỏi" và "Gia đình" tải xong gần như cùng lúc | Nghe đủ cả hai câu "Đã tải xong audio chủ đề Chào hỏi." và "Đã tải xong audio chủ đề Gia đình.", không câu nào bị cắt ngang hay bỏ | không |

## Focus không rơi khi nút biến mất

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-60 | S8.4-AC1 Focus khi bắt đầu và khi tải xong | A11y | Mạng chậm; Tab tới nút "Tải audio" của "Chào hỏi", nhấn Enter; không nhấn phím nào nữa cho tới khi xong | Trong lúc tải focus nằm ở dòng "Đang tải <n>%" của "Chào hỏi"; khi xong focus nằm ở nút "Xóa audio" của "Chào hỏi"; focus không lúc nào về đầu trang | e2e |
| TC-S8.4-AC1-61 | S8.4-AC1 Focus khi bắt đầu và khi tải xong | A11y | Như TC-S8.4-AC1-60, ở giao diện sáng rồi tối | Nhìn thấy focus đang ở dòng "Đang tải <n>%" rồi ở nút "Xóa audio" (viền focus ≥ 3:1) | không |
| TC-S8.4-AC1-62 | S8.4-AC1 Tải xong mà không có nút xóa thì focus tới dòng đã tải | A11y | Bắt đầu sạch; mạng chậm; Dev giữ audio chung Gia đình–C chưa về cho tới sau khi nhấn Enter trên nút tải của C, rồi thả nó về trước hai file còn lại của "Gia đình"; dùng bàn phím: Tab tới "Tải audio" của "Gia đình", nhấn Enter; Tab (hoặc Shift+Tab) tới "Tải audio" của C, nhấn Enter; không nhấn phím nào nữa; chờ C xong khi "Gia đình" còn "Đang tải" | Khi C tải xong, khối C hiện "Đã tải audio (<dung lượng của C>)" không có nút "Xóa audio"; focus nằm ở dòng "Đã tải audio (<dung lượng của C>)" của C, không về đầu trang | e2e |
| TC-S8.4-AC1-63 | S8.4-AC1 Focus khi tải lỗi | A11y | Mạng chậm; Tab tới nút "Tải audio" của "Chào hỏi", nhấn Enter; không nhấn phím nào nữa; khi khối hiện "Đang tải 50%" thì tắt mạng | Focus nằm ở nút "Tải audio (2,4 MB)" của "Chào hỏi"; vùng thông báo chứa "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." | e2e |
| TC-S8.4-AC1-64 | S8.4-AC1 Không kéo focus khi người học đã đi chỗ khác | A11y | Mạng chậm; nhấn Enter trên nút "Tải audio" của "Chào hỏi"; trước khi xong, Tab tới một bài khác trên bản đồ (ngoài khối "Chào hỏi"); chờ tải xong | Khi tải xong focus vẫn ở bài đó | e2e |
| TC-S8.4-AC2-19 | S8.4-AC2 Focus và thông báo khi xóa bằng bàn phím | A11y | Tải xong "Chào hỏi"; chỉ dùng bàn phím: Tab tới "Xóa audio" của "Chào hỏi", nhấn Enter | Focus nằm ở nút "Tải audio (2,4 MB)" của "Chào hỏi"; vùng thông báo chứa "Đã xóa audio của chủ đề Chào hỏi." | e2e |
| TC-S8.4-AC2-20 | S8.4-AC2 Focus và thông báo khi xóa bằng bàn phím | A11y | Như TC-S8.4-AC2-19 nhưng bật trình đọc màn hình | Nghe "Đã xóa audio của chủ đề Chào hỏi."; tiếp đó đọc nút đang focus là "Tải audio (2,4 MB), chủ đề Chào hỏi" | không |

## Focus khi chủ đề tự thành đã tải

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.4-AC1-65 | S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải | A11y | Bắt đầu sạch (C chỉ thiếu audio chung Gia đình–C; audio còn lại của C là audio Nhập môn); mạng chậm; Dev cho audio chung Gia đình–C về sau cùng trong các file của "Gia đình"; dùng bàn phím: Tab tới "Tải audio" của "Gia đình", nhấn Enter; Tab (hoặc Shift+Tab) tới "Tải audio" của C, không nhấn Enter; không nhấn phím nào nữa; chờ "Gia đình" tải xong (không chủ đề nào khác đang tải) | Khối C hiện "Đã tải audio (<dung lượng của C>)" kèm nút "Xóa audio"; focus nằm ở nút "Xóa audio" của C, không về đầu trang; khối "Gia đình" hiện "Đã tải audio (<dung lượng của Gia đình>)" | e2e |
| TC-S8.4-AC1-66 | S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải | Biên | Như TC-S8.4-AC1-65, nhưng Dev cho audio chung Gia đình–C về trước hai file còn lại của "Gia đình"; quan sát lúc C đổi trạng thái khi "Gia đình" còn "Đang tải" | Khi audio chung về: khối C hiện "Đã tải audio (<dung lượng của C>)" không có nút "Xóa audio" (audio của C là audio Nhập môn hoặc thuộc "Gia đình" đang tải); focus nằm ở dòng "Đã tải audio (<dung lượng của C>)" của C, không về đầu trang | e2e |
| TC-S8.4-AC1-67 | S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải | A11y | Như TC-S8.4-AC1-65, ở giao diện sáng rồi tối, bật trình đọc màn hình | Nhìn thấy viền focus (≥ 3:1) chuyển từ nút "Tải audio" sang nút "Xóa audio" của C; trình đọc màn hình đọc nút đang focus là "Xóa audio, chủ đề <tên C>" | không |

## Câu hỏi mở / chỗ khó kiểm

- **Không đủ bộ nhớ (TC-S8.4-AC1-41 đến -43)**: không làm đầy bộ nhớ thật một cách ổn định được; e2e giả lập lỗi hết bộ nhớ, máy thật chạy tay
  và có thể phải ghi "không chạy được" khi nghiệm thu.
- **Chủ đề rớt về "Chưa tải" không có thông báo riêng** (TC-S8.4-AC2-9): Scenario không nói khối "Gia đình" có câu nào không; case kiểm
  "không có câu Đã xóa audio…" theo quyết định trong `proposal.md` (mục "Người học kẹt không xóa được"). Nếu người thật đổi quyết định
  này thì sửa expected.
- **Đọc đủ hai câu (TC-S8.4-AC1-58)**: e2e chứng minh cả hai câu đều xuất hiện và câu thứ nhất chưa bị gỡ khi câu thứ hai xuất hiện;
  việc trình đọc màn hình đọc đủ thật chỉ kiểm tay (TC-S8.4-AC1-59).
- **Đóng app đã cài (TC-S8.4-AC1-52)**: chỉ kiểm tay trên máy thật; e2e (TC-S8.4-AC1-51) đóng/mở lại trình duyệt với cùng hồ sơ.
- **Nội dung mẫu**: các case nghe audio cần mọi audio của chủ đề nằm trong bài đang mở; các case TC-S8.4-AC1-47, -58, -62, -65, -66 cần Dev điều khiển
  file nào về trước/lỗi. Dev ghi rõ bài nào chứa audio nào và cách giả lập trong mô tả PR code.

## Ghi chú cho QA và Dev

- Phần Dev kiểm thêm bằng Vitest (không thay case ở trên): bảng định dạng dung lượng (2 516 582 → "2,4 MB", 870 400 → "850 KB", 300 → "1 KB",
  1 047 552 → "1023 KB", 1 047 553 và 1 048 575 → "1,0 MB", 1 048 064 → "1,0 MB", 1 048 576 → "1,0 MB", 1 310 720 → "1,3 MB"), phần trăm tiến
  độ (1/4 → 25%, 1/3 → 33%, 2/3 → 66%, 3/4 → 75%, đủ file → "Đã tải"), quy tắc trạng thái chủ đề (không audio thì không có khối, xét trước
  Nhập môn; thiếu một file là chưa tải; mọi audio là audio Nhập môn là có sẵn offline), quy tắc xóa (giữ audio Nhập môn và audio chủ đề đang
  tải cần; xóa audio dùng chung với chủ đề "Đã tải" khác) và điều kiện hiện nút xóa (vòng tròn, cùng bộ audio, audio thuộc chủ đề đang tải).
- Case trên bản build thật (TC-S8.4-AC1-29) chạy được ngay; mọi case tải/xóa khác cần bản build có nội dung mẫu.
- Đổi ở vòng 4: thêm TC-S8.4-AC1-65 đến -67 cho Scenario "Nút tải đang focus biến mất vì chủ đề tự thành đã tải"; TC-S8.4-AC1-10, -15
  ghi rõ điều kiện "không chủ đề nào đang tải"; TC-S8.4-AC1-47 cho audio chung về sau cùng và kiểm "Đang tải 75%"; TC-S8.4-AC1-58 dùng tiêu chí
  câu thứ nhất còn trong vùng thông báo; TC-S8.4-AC1-62 giữ audio chung Gia đình–C tới sau khi nhấn Enter ở C; bỏ câu hỏi mở về nhánh "bị xóa".
- Đổi so với bản trước (vòng 3): đánh số lại; fixture C chỉ dùng chung với "Gia đình" qua audio không thuộc "Chào hỏi" (tải "Chào hỏi" không
  làm C thành "Đã tải"), thêm chủ đề "Vòng 1–3", "Đôi 1–2", Nhập môn không audio, đặt tên chủ đề B là "Gia đình"; bỏ case của Scenario đã bỏ
  ("Xóa không làm hỏng chủ đề khác đã tải", "Chủ đề không có audio riêng thì không có nút xóa"); thêm case cho các Scenario mới; tách "Đóng app
  giữa chừng" thành case `e2e` (hồ sơ trình duyệt bền) và case `không` (máy thật); thêm case `e2e` focus tới dòng "Đã tải audio (…)".
