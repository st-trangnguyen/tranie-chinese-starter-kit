# Test cases: S9.2 Màn ôn tập

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/review-session/spec.md` và
`specs/home-screen/spec.md`.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev). Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, chưa có thẻ ôn
  tập nào, có mạng, trừ khi case nêu khác.
- **Thẻ** viết là `"<từ>" <chiều>`, ví dụ `"你好" nghĩa`. Trạng thái "mới" = chưa chấm lần nào (S9.1). Từ mẫu: "你好" (nǐ hǎo, xin
  chào), "谢谢" (xièxie, hai nghĩa "cảm ơn" và "cảm ơn bạn"), "人" (rén, người), "妈" / "马".
- **Lộ trình mẫu** (bộ bài mẫu của S9.1, dev cung cấp cùng PR code; e2e cần đúng thứ tự này): bài mẫu A (câu về "你好" rồi câu về "谢谢")
  là bài đầu tiên; sau đó bài mẫu A' (lại có "你好", "谢谢"), bài mẫu B ("人"), bài mẫu D (câu cặp âm "妈" / "马", khai báo "妈" trước, là
  câu đầu tiên chứa hai từ này). Vị trí trong lộ trình (Requirement "Vị trí của từ trong lộ trình"): "你好" → "谢谢" → "人" → "妈" → "马".
  Bài thật của app: bài 1 là bài đầu tiên của lộ trình.
- **Nạp sẵn thẻ** (chỉ e2e, giống "nạp sẵn" của S9.1, cách nạp thuộc phần test của PR code): đặt sẵn các thẻ với trạng thái và thời điểm
  ôn tiếp theo cụ thể, ví dụ "tới hạn từ hôm qua", "còn 2 ngày nữa mới tới hạn". "Đã chấm" = thẻ không còn "mới" (có trạng thái nhớ do
  FSRS tính). Lúc tạo thẻ "mới" không ảnh hưởng thứ tự hỏi; case nào cố ý đặt lúc tạo khác nhau thì ghi rõ. Bản build **không** có màn
  ẩn, công tắc hay tham số nào để nạp hoặc xem thẻ.
- **Dựng thẻ khi chạy tay**: thẻ "mới" dựng bằng thao tác thật (xong bài có từ đó, S9.1; thẻ chiều viết: viết xong chữ theo nét). Trạng
  thái cần đồng hồ (tới hạn từ hôm qua, còn 2 ngày) dựng bằng file sao lưu mẫu dev cung cấp cùng PR code (kèm ngày cần đặt đồng hồ máy),
  nhập qua Cài đặt → "Sao lưu tiến độ" → "Nhập tiến độ" → "Ghi đè" như S8.5. Không đặt được đồng hồ thì QA chỉ đọc kết quả e2e.
- **Tua đồng hồ** (chỉ e2e): test điều khiển đồng hồ của trình duyệt để đi tới một thời điểm, không chờ thật. QA chạy tay không tua được,
  case cần tua đánh `e2e` và QA đọc kết quả.
- **Đọc thẻ từ phía test** (chỉ e2e, như S9.1): kiểm trạng thái và thời điểm ôn tiếp theo của thẻ đã lưu. Người học không thấy hai thứ
  này; QA chạy tay chỉ kiểm hành vi nhìn thấy (thẻ có/không có trong phiên ở lần mở sau).
- **Thứ tự hỏi** (Requirement "Thứ tự hỏi các thẻ"), xét lần lượt, dừng ở quy tắc phân biệt được:
  - **Q1**: thẻ đã chấm trước, thẻ "mới" sau.
  - **Q2**: giữa các thẻ đã chấm, hạn sớm hơn trước; mọi thẻ "mới" coi như cùng hạn (không xét lúc tạo).
  - **Q3**: cùng hạn thì nghĩa → nghe → viết.
  - **Q4**: cùng hạn, cùng chiều thì từ đứng trước trong lộ trình trước, theo Requirement "Vị trí của từ trong lộ trình": **V1** bài đầu
    tiên chứa từ; **V2** câu đầu tiên chứa từ trong bài đó; **V3** cùng câu cặp âm thì từ khai báo trước; **V4** từ không có trong bài nào
    đứng sau, giữa chúng so mã Unicode.

  Thẻ liệt kê trong case theo đúng thứ tự hỏi; "thẻ thứ nhất" là thẻ hỏi đầu tiên. Case nào phụ thuộc thứ tự thì ghi quy tắc quyết định
  trong ngoặc, ví dụ "(Q3)", để khi Fail quy đúng nguyên nhân.
- **Bước học ngắn** (Requirement "Tính chất của lịch ôn"): thẻ "mới" chấm "Quên" / "Khó" / "Được" quay lại sau khoảng 1 / 6 / 10 phút,
  chỉ "Dễ" cho từ 1 ngày trở lên. Case cần thẻ "không còn trong phiên khi mở lại ngay" dùng "Dễ", hoặc mở lại trước khi bước học hết.
- **"Phiên có N thẻ"**: khi mở màn ôn tập, màn hiện "Thẻ 1 / N".
- **"Chấm X"** = bấm "Hiện đáp án" rồi bấm nút X ("Quên", "Khó", "Được" hoặc "Dễ").
- **"Rời màn giữa phiên"** = bấm liên kết "Về Trang chủ" ở đầu màn ôn tập (Requirement "Rời màn giữa phiên"), trừ khi case nêu nút quay
  lại của trình duyệt.
- **Giả lập lỗi** (chỉ e2e): "lỗi đọc thẻ" (mở màn ôn tập hoặc bấm "Thử lại" thì đọc thẻ bị lỗi), "thẻ đọc không được" (một thẻ đã lưu bị
  hỏng, các thẻ khác đọc được), "lỗi lưu" (lần lưu mức chấm kế tiếp bị lỗi). QA chạy tay không tạo được, chỉ đọc kết quả e2e.
- **"Audio không phát được"**: tắt mạng, từ mẫu có audio chưa có trên máy (chưa tải chủ đề theo S8.4, chưa nghe lần nào); e2e có thể chặn
  file audio đó thay cho tắt mạng.
- **"Không có âm thanh nào phát"**: e2e kiểm không có audio nào bắt đầu phát; chạy tay nghe bằng loa/tai nghe đã bật.
- **"Được đọc tự động"**: thông báo nằm trong vùng mà trình đọc màn hình tự đọc khi nội dung xuất hiện. e2e kiểm qua cây trợ năng của
  trình duyệt (vùng thông báo tự đọc chứa đúng câu đó, và câu xuất hiện lại ở mỗi lần lỗi); chạy tay bằng VoiceOver hoặc NVDA: nghe được câu
  đó mà không phải di chuyển tới nó.
- **"Tên đọc được"** của phần tử đang có focus: thứ trình đọc màn hình đọc khi focus vào đó. e2e kiểm qua cây trợ năng; chạy tay nghe bằng
  VoiceOver hoặc NVDA.
- **"Không nằm trong thứ tự Tab"**: nhấn Tab / Shift+Tab đi hết một vòng các phần tử của màn, focus không lần nào dừng ở vùng đó.
- **"Tắt mạng"**: chế độ Offline của trình duyệt trên máy tính, chế độ máy bay trên điện thoại. **"Mở lại app"**: đóng hẳn tab/app rồi
  mở lại từ địa chỉ gốc.
- **Ngưỡng nhìn rõ** (CLAUDE.md §7): chữ tương phản ≥ 4.5:1 với nền; viền focus ≥ 3:1; nút có vùng chạm ≥ 44×44 px.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (thao tác thật trên bản build, có thể nạp sẵn thẻ, tua đồng hồ, giả lập lỗi,
đọc thẻ từ phía test). `không` = QA chạy tay mỗi lần nghiệm thu (nhìn tương phản, trình duyệt di động thật, nghe, trình đọc màn hình),
hoặc chỉ kiểm được bằng Vitest (ghi rõ trong cột Các bước).

**ID**: giữ nguyên ID của vòng trước; case thêm ở vòng 2 lấy số kế tiếp (TC-S9.2-AC1-41…, TC-S9.2-AC3-8…) và đặt trong mục của Requirement
tương ứng, nên số thứ tự trong một bảng có thể không liền nhau.

## Nút Ôn tập trên Trang chủ (`home-screen`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-1 | S9.2-AC1 Mở màn ôn tập từ Trang chủ | Chức năng | Nạp sẵn thẻ `"你好" nghĩa` "mới". Mở Trang chủ, bấm "Ôn tập" | Vào màn ôn tập, hiện "Thẻ 1 / 1" | e2e |
| TC-S9.2-AC1-2 | S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ | Chức năng | Trình duyệt sạch, xong onboarding, chưa học bài nào. Mở Trang chủ | Có nút "Ôn tập"; vẫn có nút "Vào học" và liên kết "Xem lộ trình"; các phần khác của Trang chủ như S8.1 | e2e |
| TC-S9.2-AC1-3 | S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ | Offline | Đã mở app một lần khi có mạng; tắt mạng; mở lại app, vào Trang chủ, bấm "Ôn tập" | Trang chủ có nút "Ôn tập"; bấm vào thì vào màn ôn tập (hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."), không có lỗi mạng | e2e |
| TC-S9.2-AC1-4 | S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím | A11y | Mở Trang chủ, chỉ dùng bàn phím: Tab tới "Ôn tập", nhấn Enter | Nút "Ôn tập" có viền focus nhìn thấy được khi được focus; nhấn Enter thì vào màn ôn tập | e2e |
| TC-S9.2-AC1-5 | S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ | Mobile 375 | Khổ 375×812, mở Trang chủ | Nút "Ôn tập", "Vào học" và liên kết "Xem lộ trình" hiện đủ chữ, không chồng nhau; nút "Ôn tập" vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.2-AC1-6 | S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím | Sáng/Tối | Mở Trang chủ ở giao diện sáng rồi tối; Tab tới "Ôn tập" | Ở cả hai giao diện nút "Ôn tập" đọc rõ (≥ 4.5:1), nhận ra là nút; viền focus nhìn thấy (≥ 3:1) | không |

## Lấy các thẻ đến hạn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-7 | S9.2-AC1 Chỉ hỏi thẻ đến hạn, hạn sớm hơn hỏi trước | Chức năng | Nạp sẵn: `"你好" nghĩa` tới hạn từ hôm qua, `"谢谢" nghĩa` tới hạn từ 3 ngày trước, `"人" nghĩa` còn 2 ngày nữa mới tới hạn (cả ba đã chấm trước đó). Mở màn ôn tập; chấm "Được"; chấm "Được" | Mở màn: "Thẻ 1 / 2", mặt hỏi hiện "谢谢". Sau lần chấm thứ nhất: "Thẻ 2 / 2", mặt hỏi hiện "你好". Sau lần chấm thứ hai: "Đã ôn xong 2 thẻ."; trong phiên không lần nào hiện "人" | e2e |
| TC-S9.2-AC1-8 | S9.2-AC1 Chỉ hỏi thẻ đến hạn, hạn sớm hơn hỏi trước | Chức năng | QA chạy tay: đặt đồng hồ máy theo ngày ghi kèm file mẫu, nhập file mẫu có ba thẻ như TC-S9.2-AC1-7; mở màn ôn tập, ôn hết | Như TC-S9.2-AC1-7 | không |
| TC-S9.2-AC1-9 | S9.2-AC1 Thẻ mới được hỏi ngay | Chức năng | Trình duyệt sạch; xong bài mẫu H (chỉ có từ "你好") của S9.1, chưa ôn lần nào; về Trang chủ, bấm "Ôn tập"; ôn hết phiên | Mở màn: "Thẻ 1 / 2", thẻ thứ nhất là `"你好" nghĩa` (mặt hỏi hiện "你好"). Sau khi chấm: "Thẻ 2 / 2", thẻ `"你好" nghe` (mặt hỏi chỉ có nút "Nghe" và "Hiện đáp án"; bấm "Hiện đáp án" thì hiện "你好"). Thứ tự dựa vào: hai thẻ đều "mới" nên cùng hạn (Q2), nghĩa trước nghe (Q3). Thiếu thẻ hay "Không có thẻ nào cần ôn lúc này." = lỗi "thẻ mới đến hạn ngay"; đủ 2 thẻ nhưng nghe trước = lỗi Q3 | e2e |
| TC-S9.2-AC1-10 | S9.2-AC1 Thẻ mới được hỏi ngay | Chức năng | QA chạy tay trên bản build: trình duyệt sạch, xong bài 1 thật của lộ trình; khi làm bài ghi lại chữ Hán của từ ở từng câu theo thứ tự; mở màn ôn tập ngay | Màn hiện "Thẻ 1 / y" với y = 2 × số từ khác nhau được tạo thẻ (S9.1: mỗi từ một thẻ nghĩa, một thẻ nghe; từ lặp ở nhiều câu chỉ tính một lần); không có "Không có thẻ nào cần ôn lúc này.". Thẻ thứ nhất là chiều nghĩa (mặt hỏi hiện chữ Hán) của từ ở câu đầu tiên của bài (mọi thẻ "mới" cùng hạn Q2 → nghĩa trước Q3 → câu đầu tiên chứa từ V2) | không |

## Thứ tự hỏi các thẻ

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-11 | S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình | Chức năng | Trình duyệt sạch; xong bài mẫu A (câu về "你好" rồi câu về "谢谢"), chưa ôn lần nào; bấm "Ôn tập". Ở mỗi thẻ: ghi mặt hỏi, bấm "Hiện đáp án", ghi chữ Hán ở mặt đáp án, bấm "Được" | "Thẻ 1 / 4". Thứ tự: (1) mặt hỏi "你好" → `"你好" nghĩa`; (2) mặt hỏi "谢谢" → `"谢谢" nghĩa`; (3) mặt hỏi chỉ có nút "Nghe", đáp án "你好" → `"你好" nghe`; (4) mặt hỏi chỉ có nút "Nghe", đáp án "谢谢" → `"谢谢" nghe`. Cuối: "Đã ôn xong 4 thẻ." Thứ tự dựa vào: cả 4 thẻ "mới" nên cùng hạn (Q2), dù lúc tạo có thể lệch nhau vài mili giây; nghĩa trước nghe (Q3); trong mỗi chiều "你好" trước "谢谢" vì câu về "你好" đứng trước trong bài A (Q4, V2). Nghe xen giữa nghĩa = lỗi Q3; "谢谢" trước "你好" trong cùng chiều = lỗi Q4 | e2e |
| TC-S9.2-AC1-12 | S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình | Biên | Nạp sẵn thẻ đã chấm: `"人" viết`, `"人" nghe`, `"人" nghĩa` cùng tới hạn đúng một thời điểm hôm qua; `"谢谢" nghe` tới hạn từ 2 ngày trước. Mở màn ôn tập; ôn hết như TC-S9.2-AC1-11 | "Thẻ 1 / 4". Thứ tự: `"谢谢" nghe` (hạn sớm nhất, dù là chiều nghe: Q2), rồi `"人" nghĩa` (mặt hỏi "人"), `"人" nghe` (chỉ nút "Nghe"), `"人" viết` (mặt hỏi "người") (cùng hạn: Q3) | e2e |
| TC-S9.2-AC1-13 | S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình | Chức năng | QA chạy tay: trình duyệt sạch, xong bài 1 thật của lộ trình; khi làm bài ghi chữ Hán của từ ở từng câu theo thứ tự; mở màn ôn tập, ôn hết (chấm "Dễ"), ghi chiều và chữ Hán của từng thẻ (mặt hỏi có chữ Hán = nghĩa, chỉ nút "Nghe" = nghe; chữ đọc ở mặt đáp án) | Mọi thẻ chiều nghĩa được hỏi trước mọi thẻ chiều nghe (Q3). Trong mỗi chiều, các từ theo thứ tự **câu đầu tiên** chứa từ trong bài (V2): từ xuất hiện lại ở câu sau, kể cả trong câu cặp âm, giữ vị trí lần xuất hiện đầu tiên, không bị hỏi hai lần | không |
| TC-S9.2-AC1-41 | S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới | Chức năng | Nạp sẵn: `"人" nghĩa` đã chấm, tới hạn từ hôm qua; `"你好" nghĩa` "mới", tạo từ 3 ngày trước. Mở màn ôn tập; chấm "Được"; chấm "Được" | "Thẻ 1 / 2" mặt hỏi "人"; sau lần chấm thứ nhất "Thẻ 2 / 2" mặt hỏi "你好"; cuối "Đã ôn xong 2 thẻ." Dựa vào Q1: "你好" đứng trước "人" trong lộ trình và được tạo trước hạn của "人", nên "你好" hỏi trước = lỗi Q1 (xếp theo lúc tạo hoặc theo lộ trình) | e2e |
| TC-S9.2-AC1-42 | S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới | Biên | Nạp sẵn: `"人" viết` đã chấm, tới hạn từ 1 phút trước; `"你好" nghĩa` "mới". Mở màn ôn tập | "Thẻ 1 / 2" mặt hỏi "người" (`"人" viết`), rồi `"你好" nghĩa`. Q1 xét trước Q3: chiều viết đã chấm vẫn hỏi trước chiều nghĩa "mới" | e2e |
| TC-S9.2-AC1-43 | S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới | Biên | Bước học ngắn. Nạp sẵn `"你好" nghĩa` và `"人" nghĩa`, cả hai "mới". Mở màn ôn tập; chấm "Quên" thẻ "你好"; bấm "Về Trang chủ"; bấm "Ôn tập" ngay; bấm "Về Trang chủ"; tua đồng hồ tới thời điểm ôn tiếp theo vừa tính cho `"你好" nghĩa` (đọc từ phía test, khoảng 1 phút sau lúc chấm); bấm "Ôn tập" | Lần mở ngay: "Thẻ 1 / 1" mặt hỏi "人" (thẻ "你好" chưa tới hạn). Sau khi tua: "Thẻ 1 / 2" mặt hỏi "你好" (đã chấm, Q1), rồi "人" ("mới") | e2e |
| TC-S9.2-AC1-44 | S9.2-AC1 Thẻ mới tạo ở các lần khác nhau vẫn xếp theo chiều rồi theo lộ trình | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: `"谢谢" nghĩa` "mới" tạo lúc 08:00; `"你好" nghe` "mới" tạo lúc 08:00 + 5 ms; `"你好" nghĩa` "mới" tạo hôm sau; "你好" đứng trước "谢谢" trong lộ trình | Thứ tự: `"你好" nghĩa`, `"谢谢" nghĩa`, `"你好" nghe` (Q2: lúc tạo không tính; Q3; Q4). QA đọc kết quả Vitest | không |
| TC-S9.2-AC1-49 | S9.2-AC1 Thẻ mới tạo ở các lần khác nhau vẫn xếp theo chiều rồi theo lộ trình | Biên | Nạp sẵn ba thẻ "mới" với lúc tạo như TC-S9.2-AC1-44 (`"你好" nghĩa` tạo hôm sau, như nhập từ file sao lưu). Mở màn ôn tập; ôn hết, ghi mặt hỏi | "Thẻ 1 / 3". Thứ tự: mặt hỏi "你好" (nghĩa), mặt hỏi "谢谢" (nghĩa), mặt hỏi chỉ nút "Nghe" với đáp án "你好". `"谢谢" nghĩa` đứng đầu = lỗi Q2 (xếp theo lúc tạo) | e2e |

## Vị trí của từ trong lộ trình

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-45 | S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: lộ trình có bài A rồi bài B; bài A câu 1 chứa "人", câu 2 chứa "你好"; bài B có câu chứa "你好" và câu cặp âm "妈" / "马" (khai báo "妈" trước); thẻ chiều nghĩa "mới" của "你好", "人", "妈", "马" | Thứ tự: "人", "你好", "妈", "马". QA đọc kết quả Vitest | không |
| TC-S9.2-AC1-46 | S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ | Biên | Nạp sẵn thẻ chiều nghĩa "mới" của "马", "妈", "人", "谢谢", "你好", lúc tạo lần lượt cách nhau 1 phút theo đúng thứ tự đó ("马" tạo sớm nhất). Mở màn ôn tập; ôn hết, ghi mặt hỏi từng thẻ | "Thẻ 1 / 5". Thứ tự mặt hỏi: "你好", "谢谢", "人", "妈", "马". Dựa vào: lúc tạo không tính (Q2); bài A đứng trước B, D (V1) dù "你好", "谢谢" có cả ở bài A'; "你好" trước "谢谢" (V2); "妈" trước "马" (cùng câu cặp âm, khai báo trước: V3). Thứ tự theo lúc tạo ("马" trước) = lỗi Q2; "妈"/"马" đảo = lỗi V3 | e2e |
| TC-S9.2-AC1-47 | S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ | Biên | Chỉ kiểm tầng quy tắc (Vitest). Như TC-S9.2-AC1-45, thêm thẻ chiều nghĩa "mới" của hai từ có trong nội dung app nhưng không nằm trong bài nào: "我" (U+6211) và "他" (U+4ED6) | Thứ tự: "人", "你好", "妈", "马", "他", "我" (từ không trong bài nào đứng sau, so mã Unicode: V4). QA đọc kết quả Vitest | không |
| TC-S9.2-AC1-48 | S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ | Biên | QA chạy tay, chỉ khi dev ghi trong PR code một cặp bài thật P (trước) và Q (sau) có chung một từ W, trong Q từ W không ở câu đầu tiên. Trình duyệt sạch; xong P rồi Q, chưa ôn; mở màn ôn tập, ôn các thẻ chiều nghĩa (chấm "Dễ"), ghi mặt hỏi | W được hỏi theo vị trí của nó trong bài P (bài đầu tiên chứa W, V1), không theo vị trí trong Q; mọi từ chỉ có ở Q hỏi sau mọi từ của P. Không có cặp bài như vậy: ghi "không chạy được", dựa vào TC-S9.2-AC1-46 | không |

## Thẻ nào được hỏi trong phiên

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-14 | S9.2-AC1 Danh sách chốt lúc mở màn | Chức năng | Nạp sẵn hai thẻ "mới" `"你好" nghĩa` và `"谢谢" nghĩa`. Mở màn ôn tập ("Thẻ 1 / 2", thẻ "你好"); chấm "Quên"; tua đồng hồ qua thời điểm ôn tiếp theo vừa tính cho `"你好" nghĩa` (đọc từ phía test); chấm "Được" thẻ "谢谢" | Sau lần chấm thứ hai: "Đã ôn xong 2 thẻ."; thẻ "你好" không được hỏi lại, tổng vẫn là 2 | e2e |
| TC-S9.2-AC1-15 | S9.2-AC1 Danh sách chốt lúc mở màn | Chức năng | Tiếp TC-S9.2-AC1-14: bấm "Về Trang chủ", bấm "Ôn tập" | Phiên mới hiện "Thẻ 1 / 1" với thẻ "你好" (thẻ đã chấm "Quên"); không có thẻ "谢谢" | e2e |

## Thẻ bị bỏ qua

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-16 | S9.2-AC1 Thẻ của từ không có trong app không được hỏi | Chức năng | Trình duyệt sạch; nhập file `the-tu-la` của S9.1 (`"你好" nghĩa` "mới" và một thẻ chiều nghĩa "mới" của từ không có trong app), bấm "Ghi đè"; mở màn ôn tập; chấm "Được" | Mở màn: "Thẻ 1 / 1", mặt hỏi hiện "你好"; không có thông báo lỗi. Sau khi chấm: "Đã ôn xong 1 thẻ."; đọc thẻ từ phía test: thẻ của từ không có trong app vẫn còn, vẫn "mới", thời điểm ôn tiếp theo như trong file | e2e |
| TC-S9.2-AC1-17 | S9.2-AC1 Thẻ của từ không có trong app không được hỏi | Biên | Tiếp TC-S9.2-AC1-16: Cài đặt → "Sao lưu tiến độ" → "Xuất tiến độ", mở file vừa xuất | File vẫn có thẻ của từ không có trong app, trạng thái "mới" như trong file `the-tu-la` | e2e |
| TC-S9.2-AC1-18 | S9.2-AC1 Thẻ của từ không có trong app không được hỏi | Biên | Trình duyệt sạch; nhập file mẫu chỉ có một thẻ chiều nghĩa "mới" của từ không có trong app (dev cung cấp cùng PR code); mở màn ôn tập | Màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." và nút "Về Trang chủ" (bảng của Requirement "Màn ôn tập khi không có thẻ để hỏi": chỉ có thẻ bị bỏ qua) | e2e |
| TC-S9.2-AC1-19 | S9.2-AC1 Thẻ đọc không được thì bỏ qua thẻ đó | Chức năng | Nạp sẵn `"你好" nghĩa` và `"谢谢" nghĩa` cùng đến hạn; giả lập thẻ `"谢谢" nghĩa` đọc không được. Mở màn ôn tập | "Thẻ 1 / 1", mặt hỏi hiện "你好"; không có thông báo lỗi nào (không có "Không tải được thẻ ôn tập.") | e2e |

## Mỗi thẻ hỏi theo chiều của nó

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-20 | S9.2-AC1 Thẻ chiều nghĩa hiện chữ, giấu nghĩa | Chức năng | Nạp sẵn `"你好" nghĩa` "mới". Mở màn ôn tập | Mặt hỏi hiện "你好" và nút "Hiện đáp án"; trên màn không có "nǐ hǎo" và "xin chào"; không có nút chấm | e2e |
| TC-S9.2-AC1-21 | S9.2-AC1 Thẻ chiều nghe chỉ có nút Nghe | Chức năng | Nạp sẵn `"你好" nghe` "mới". Mở màn ôn tập, chờ 2 giây; rồi bấm "Nghe" | Trước khi bấm: có nút "Nghe" và "Hiện đáp án", không có âm thanh nào phát; trên màn không có "你好", "nǐ hǎo", "xin chào". Bấm "Nghe": phát âm của từ "你好" | e2e |
| TC-S9.2-AC1-22 | S9.2-AC1 Thẻ chiều nghe chỉ có nút Nghe | Chức năng | QA chạy tay, bật loa: ôn một thẻ chiều nghe (dựng bằng xong một bài thật); bấm "Nghe" hai lần | Không tự phát khi thẻ hiện; mỗi lần bấm nghe được đúng từ của thẻ (đối chiếu chữ Hán ở mặt đáp án), không bị cắt | không |
| TC-S9.2-AC1-23 | S9.2-AC1 Thẻ chiều viết hiện nghĩa, giấu chữ | Chức năng | Nạp sẵn `"人" viết` "mới". Mở màn ôn tập | Mặt hỏi hiện "người" và nút "Hiện đáp án"; trên màn không có "人", "rén"; không có khung viết | e2e |
| TC-S9.2-AC1-50 | S9.2-AC1 Thẻ chiều viết hiện mọi nghĩa của từ | Chức năng | Nạp sẵn `"谢谢" viết` "mới" ("谢谢" có hai nghĩa). Mở màn ôn tập | Mặt hỏi hiện cả "cảm ơn" và "cảm ơn bạn" cùng nút "Hiện đáp án"; trên màn không có "谢谢" và "xièxie"; không có khung viết | e2e |

## Mặt đáp án chung cho ba chiều

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-24 | S9.2-AC1 Hiện đáp án | Chức năng | Chạy 3 lần, mỗi lần nạp sẵn một thẻ "mới": `"你好" nghĩa`, `"你好" nghe`, `"你好" viết`. Mở màn ôn tập, bấm "Hiện đáp án" | Cả ba lần: màn hiện "你好", "nǐ hǎo", "xin chào" và nút "Nghe"; không có âm thanh nào phát; nút "Hiện đáp án" không còn | e2e |
| TC-S9.2-AC1-25 | S9.2-AC1 Hiện đáp án | Biên | Nạp sẵn `"谢谢" nghĩa` "mới" ("谢谢" có hai nghĩa). Mở màn ôn tập, bấm "Hiện đáp án" | Mặt đáp án hiện "谢谢", "xièxie", cả "cảm ơn" và "cảm ơn bạn" | e2e |
| TC-S9.2-AC1-26 | S9.2-AC1 Tắt Hiện pinyin không đổi màn ôn tập | Chức năng | Cài đặt: tắt "Hiện pinyin". Nạp sẵn `"你好" nghĩa` "mới"; mở màn ôn tập, bấm "Hiện đáp án" | Mặt đáp án vẫn hiện "nǐ hǎo" | e2e |

## Audio không phát được vẫn ôn tiếp được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-27 | S9.2-AC1 Thẻ chiều nghe khi audio không phát được | Offline | Nạp sẵn hai thẻ "mới": `"你好" nghe` (audio chưa có trên máy), rồi `"人" nghe`. Audio không phát được. Mở màn ôn tập; bấm "Nghe"; bấm "Nghe" lần nữa; bấm "Hiện đáp án"; bấm "Khó" | Sau mỗi lần bấm "Nghe": hiện thông báo không phát được audio (cùng câu như câu nghe trong bài S4.4), được đọc tự động; nút "Nghe" vẫn bấm được. "Hiện đáp án" bấm được; chấm "Khó" thì màn hiện "Thẻ 2 / 2" | e2e |
| TC-S9.2-AC1-28 | S9.2-AC1 Thẻ chiều nghe khi audio không phát được | A11y | Như TC-S9.2-AC1-27, chạy tay với VoiceOver hoặc NVDA | Thông báo không phát được audio được đọc lên ngay khi xuất hiện mà không phải di chuyển tới nó; chữ thông báo tương phản ≥ 4.5:1 | không |

## Màn ôn tập khi không có thẻ để hỏi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-29 | S9.2-AC1 Chưa có thẻ nào | Chức năng | Trình duyệt sạch, xong onboarding, chưa học bài nào. Bấm "Ôn tập" | Màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." và nút "Về Trang chủ"; không có "Thẻ x / y", "Hiện đáp án" hay nút chấm; bấm "Về Trang chủ" thì vào Trang chủ | e2e |
| TC-S9.2-AC1-30 | S9.2-AC1 Không có thẻ đến hạn | Chức năng | Nạp sẵn `"你好" nghĩa` còn 1 ngày nữa mới tới hạn và `"人" nghĩa` còn 2 ngày nữa. Mở màn ôn tập | Màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"; không có "Thẻ x / y" | e2e |
| TC-S9.2-AC1-31 | S9.2-AC1 Không có thẻ đến hạn | Biên | Trình duyệt sạch; xong bài mẫu H (你好); mở màn ôn tập, chấm "Dễ" cả hai thẻ; bấm "Về Trang chủ", bấm "Ôn tập" | Màn hiện "Không có thẻ nào cần ôn lúc này." (không phải "Bạn chưa có thẻ ôn tập…") | e2e |
| TC-S9.2-AC1-32 | S9.2-AC1 Chưa có thẻ nào | Mobile 375 | Khổ 375×812, xem lần lượt màn "Bạn chưa có thẻ ôn tập…", "Không có thẻ nào cần ôn lúc này.", "Đã ôn xong N thẻ.", "Không tải được thẻ ôn tập." (đọc ảnh chụp e2e cho màn lỗi) | Thông báo hiện đủ chữ, xuống dòng, không bị cắt; nút "Về Trang chủ", "Thử lại" vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.2-AC1-33 | S9.2-AC1 Chưa có thẻ nào | Sáng/Tối | Như TC-S9.2-AC1-32 ở giao diện sáng rồi tối; Tab tới từng nút | Thông báo và nút đọc rõ (≥ 4.5:1) ở cả hai giao diện; viền focus của nút nhìn thấy (≥ 3:1) | không |

## Không tải được thẻ thì thử lại được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-34 | S9.2-AC1 Không tải được thẻ | Chức năng | Nạp sẵn `"谢谢" nghĩa` tới hạn từ 3 ngày trước và `"你好" nghĩa` tới hạn từ hôm qua; giả lập lỗi đọc thẻ. Mở màn ôn tập | Màn hiện "Không tải được thẻ ôn tập." (được đọc tự động) cùng nút "Thử lại" và "Về Trang chủ"; không có "Thẻ x / y" | e2e |
| TC-S9.2-AC1-35 | S9.2-AC1 Không tải được thẻ | Chức năng | Tiếp TC-S9.2-AC1-34: bỏ giả lập lỗi; bấm "Thử lại" | Màn hiện "Thẻ 1 / 2" với thẻ "谢谢" (thẻ đến hạn đầu tiên) | e2e |
| TC-S9.2-AC1-36 | S9.2-AC1 Không tải được thẻ | Biên | Như TC-S9.2-AC1-34 nhưng giữ giả lập lỗi; bấm "Thử lại"; rồi bấm "Về Trang chủ" | Sau "Thử lại": vẫn hiện "Không tải được thẻ ôn tập." và hai nút. Bấm "Về Trang chủ": vào Trang chủ | e2e |

## Focus khi lưu lỗi hoặc thử lại

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC1-37 | S9.2-AC1 Focus sau khi Thử lại | A11y | Như TC-S9.2-AC1-34 (2 thẻ đến hạn, lỗi đọc thẻ). Chỉ dùng bàn phím: bỏ giả lập lỗi; Tab tới "Thử lại", nhấn Enter | Focus ở mặt hỏi của thẻ "谢谢"; tên đọc được bắt đầu bằng "Thẻ 1 / 2"; vùng mặt hỏi có viền focus nhìn thấy được và không nằm trong thứ tự Tab | e2e |
| TC-S9.2-AC1-38 | S9.2-AC1 Focus sau khi Thử lại | A11y | Như TC-S9.2-AC1-34, giữ giả lập lỗi. Chỉ dùng bàn phím: Tab tới "Thử lại", nhấn Enter | Focus vẫn ở nút "Thử lại" (không về đầu trang); "Không tải được thẻ ôn tập." được đọc tự động lại sau lần thử này | e2e |
| TC-S9.2-AC1-39 | S9.2-AC1 Focus sau khi Thử lại | Biên | Nạp sẵn `"你好" nghĩa` còn 1 ngày nữa mới tới hạn; giả lập lỗi đọc thẻ; mở màn ôn tập. Bỏ giả lập lỗi; Tab tới "Thử lại", nhấn Enter | Màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"; focus ở thông báo đó, tên đọc được là "Không có thẻ nào cần ôn lúc này." (dòng "Thử lại, không thẻ nào để hỏi" của bảng focus) | e2e |
| TC-S9.2-AC1-40 | S9.2-AC1 Focus sau khi Thử lại | A11y | Như TC-S9.2-AC1-37 và -38, chạy tay với VoiceOver hoặc NVDA (QA đọc ảnh/clip e2e nếu không tạo được lỗi đọc thẻ trên máy thật: ghi "không chạy được" kèm lý do) | Thử lại đọc được: trình đọc đọc "Thẻ 1 / 2" rồi mặt hỏi "谢谢". Thử lại vẫn lỗi: trình đọc đọc "Không tải được thẻ ôn tập." | không |

## Tự chấm 4 mức

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-1 | S9.2-AC2 Chưa hiện đáp án thì chưa chấm được | Chức năng | Nạp sẵn một thẻ mỗi chiều (`"你好" nghĩa`, `"你好" nghe`, `"人" viết`), cả ba "mới". Mở màn ôn tập; ở mặt hỏi mỗi thẻ, kiểm các nút; rồi chấm "Được" để sang thẻ kế | Ở mặt hỏi của cả ba thẻ: không có nút "Quên", "Khó", "Được", "Dễ" | e2e |
| TC-S9.2-AC2-2 | S9.2-AC2 Hiện đáp án thì có 4 nút chấm | Chức năng | Nạp sẵn `"你好" nghĩa` "mới". Mở màn ôn tập, bấm "Hiện đáp án" | Có đúng 4 nút chấm theo thứ tự "Quên", "Khó", "Được", "Dễ" (trên xuống / trái sang phải, và theo thứ tự Tab); mỗi nút có chữ | e2e |
| TC-S9.2-AC2-3 | S9.2-AC2 Hiện đáp án thì có 4 nút chấm | Mobile 375 | Khổ 375×812; ôn `"谢谢" nghĩa` và `"谢谢" viết` (mặt hỏi chiều viết hiện mọi nghĩa của "谢谢"); ở mặt hỏi rồi mặt đáp án | Liên kết "Về Trang chủ", "Thẻ x / y", chữ Hán, pinyin, mọi nghĩa, nút "Nghe", "Hiện đáp án" và 4 nút chấm hiện đủ chữ, không chồng nhau, không bị cắt; mỗi nút và liên kết vùng chạm ≥ 44×44 px; không cuộn ngang | không |
| TC-S9.2-AC2-4 | S9.2-AC2 Hiện đáp án thì có 4 nút chấm | Sáng/Tối | Ở giao diện sáng rồi tối: xem mặt hỏi, mặt đáp án và 4 nút chấm; Tab qua từng nút và liên kết "Về Trang chủ"; nhấn Enter ở "Hiện đáp án" (focus sang mặt đáp án), chấm bằng bàn phím (focus sang mặt hỏi thẻ kế) | Ở cả hai giao diện: chữ Hán, pinyin, nghĩa, "Thẻ x / y", liên kết và chữ trên mọi nút đọc rõ (≥ 4.5:1); 4 nút phân biệt được bằng chữ (không chỉ bằng màu); viền focus của nút, liên kết, mặt đáp án, mặt hỏi nhìn thấy (≥ 3:1) | không |
| TC-S9.2-AC2-5 | S9.2-AC2 Chấm thì sang thẻ kế | Chức năng | Nạp sẵn hai thẻ "mới" `"你好" nghĩa` và `"谢谢" nghĩa`. Mở màn ôn tập; chấm "Được" | Màn hiện "Thẻ 2 / 2", mặt hỏi của "谢谢" (chưa có đáp án, chưa có nút chấm). Đọc thẻ từ phía test: `"你好" nghĩa` không còn "mới", có thời điểm ôn tiếp theo mới, sau lúc chấm (bước học ngắn: khoảng 10 phút sau). "你好" hỏi trước "谢谢" theo Q4 | e2e |

## Bấm nút chấm hai lần

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-6 | S9.2-AC2 Bấm nút chấm hai lần thật nhanh chỉ chấm một lần | Chức năng | Đồng hồ cố định. Nạp sẵn ba thẻ "mới" `"你好" nghĩa`, `"谢谢" nghĩa`, `"人" nghĩa`. Mở màn ôn tập; bấm "Hiện đáp án"; bấm "Được" hai lần liên tiếp thật nhanh (nhấp đúp) | Màn hiện "Thẻ 2 / 3" ở mặt hỏi của "谢谢" (chưa có đáp án; thứ tự "你好" → "谢谢" → "人" theo Q4). Đọc thẻ từ phía test: `"谢谢" nghĩa` vẫn "mới"; `"你好" nghĩa` có trạng thái và thời điểm ôn tiếp theo giống hệt khi chấm "Được" một lần từ "mới" cùng lúc đó (so với lần chạy đối chứng bấm một lần) | e2e |
| TC-S9.2-AC2-7 | S9.2-AC2 Bấm nút chấm hai lần thật nhanh chỉ chấm một lần | Biên | Như TC-S9.2-AC2-6, nhưng chỉ dùng bàn phím: Tab tới "Được", nhấn Enter hai lần thật nhanh | Màn hiện "Thẻ 2 / 3" ở mặt hỏi của "谢谢", không sang mặt đáp án; `"谢谢" nghĩa` vẫn "mới" | e2e |

## Thoát và rời màn giữa phiên

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-8 | S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm | Chức năng | Nạp sẵn ba thẻ "mới" `"你好" nghĩa`, `"谢谢" nghĩa`, `"人" nghĩa`. Mở màn ôn tập ("Thẻ 1 / 3"); chấm "Dễ" thẻ "你好"; bấm "Về Trang chủ" ở đầu màn; bấm "Ôn tập" lại ngay | "Thẻ 1 / 2" với thẻ "谢谢"; phiên chỉ có "谢谢" và "人", không có "你好" | e2e |
| TC-S9.2-AC2-9 | S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm | Biên | Như TC-S9.2-AC2-8 nhưng sau khi chấm thẻ thứ nhất thì mở lại app (thay cho "Về Trang chủ"), vào Trang chủ, bấm "Ôn tập" | "Thẻ 1 / 2" như TC-S9.2-AC2-8 (mức chấm còn sau khi đóng app) | e2e |
| TC-S9.2-AC2-10 | S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm | Chức năng | QA chạy tay: xong một bài thật có ít nhất 2 từ; mở màn ôn tập, ghi lại y; chấm "Dễ" một thẻ; bấm "Về Trang chủ", bấm "Ôn tập" lại ngay | Màn hiện "Thẻ 1 / (y − 1)" | không |
| TC-S9.2-AC2-11 | S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ | Chức năng | Nạp sẵn hai thẻ "mới" `"你好" nghĩa`, `"谢谢" nghĩa`. Mở màn ôn tập (mặt hỏi thẻ thứ nhất); bấm "Về Trang chủ"; rồi bấm "Ôn tập" | Bấm "Về Trang chủ": vào Trang chủ ngay, không có hộp thoại xác nhận. Đọc thẻ từ phía test: cả hai thẻ vẫn "mới", thời điểm ôn tiếp theo như lúc nạp. Bấm "Ôn tập": "Thẻ 1 / 2" với thẻ "你好" | e2e |
| TC-S9.2-AC2-12 | S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ | Biên | Như TC-S9.2-AC2-11 nhưng bấm "Hiện đáp án" trước rồi mới bấm "Về Trang chủ" (đang ở mặt đáp án) | Liên kết "Về Trang chủ" có ở mặt đáp án; bấm vào thì vào Trang chủ, không hộp thoại; cả hai thẻ vẫn "mới" | e2e |
| TC-S9.2-AC2-13 | S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ | Biên | Nạp sẵn ba thẻ "mới". Mở Trang chủ, bấm "Ôn tập"; chấm "Dễ" thẻ thứ nhất; bấm nút quay lại của trình duyệt; bấm "Ôn tập" | Nút quay lại: rời màn ôn tập, không hộp thoại xác nhận. Bấm "Ôn tập": "Thẻ 1 / 2" (thẻ đã chấm giữ mức chấm, hai thẻ còn lại giữ nguyên) | e2e |
| TC-S9.2-AC2-14 | S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ | A11y | Nạp sẵn hai thẻ "mới". Mở màn ôn tập; chỉ dùng bàn phím: Tab tới liên kết "Về Trang chủ", nhấn Enter | Liên kết tới được bằng Tab, có viền focus nhìn thấy được; Enter đưa người học vào Trang chủ, không hộp thoại | e2e |

## Chấm được bằng bàn phím

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-15 | S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím | A11y | Nạp sẵn hai thẻ "mới". Mở màn ôn tập, chỉ dùng bàn phím: Tab tới "Hiện đáp án", nhấn Enter; Tab tới "Khó", nhấn Space | Mỗi nút có viền focus nhìn thấy khi được focus; thẻ thứ nhất được chấm "Khó" (đọc từ phía test: không còn "mới"); màn hiện "Thẻ 2 / 2" | e2e |
| TC-S9.2-AC2-16 | S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím | A11y | Nạp sẵn `"你好" nghe` "mới" và `"人" nghe` "mới" (`"你好" nghe` hỏi trước theo Q4). Chỉ dùng bàn phím: Tab tới "Nghe", nhấn Enter; Tab tới "Hiện đáp án", nhấn Space; Tab tới "Nghe" ở mặt đáp án, nhấn Space; Tab tới "Dễ", nhấn Enter | "Nghe" phát âm ở cả hai lần; Space bấm được "Hiện đáp án"; Enter bấm được "Dễ"; mọi nút có viền focus nhìn thấy | e2e |
| TC-S9.2-AC2-17 | S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím | A11y | Chỉ dùng bàn phím, ở từng trạng thái kết thúc ("Đã ôn xong N thẻ.", "Bạn chưa có thẻ ôn tập…", "Không có thẻ nào cần ôn lúc này.", "Không tải được thẻ ôn tập."): Tab tới từng nút, nhấn Enter; lặp lại với Space | "Về Trang chủ" và "Thử lại" tới được bằng Tab, có viền focus, bấm được bằng Enter và bằng Space | e2e |

## Focus khi màn đổi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-18 | S9.2-AC2 Focus không rơi khi đổi mặt thẻ | A11y | Nạp sẵn hai thẻ "mới" `"你好" nghĩa`, `"谢谢" nghĩa`. Mở màn ôn tập; Tab tới "Hiện đáp án", nhấn Enter; ghi phần tử có focus; Tab tới "Được", nhấn Enter; ghi phần tử có focus | Sau "Hiện đáp án": focus ở mặt đáp án (không ở "Quên" hay nút chấm nào, không về đầu trang), có viền focus nhìn thấy được, tên đọc được bắt đầu bằng "Đáp án" rồi "你好", "nǐ hǎo", "xin chào". Sau khi chấm: focus ở mặt hỏi của "谢谢", có viền focus, tên đọc được bắt đầu bằng "Thẻ 2 / 2" rồi "谢谢". Mặt đáp án và mặt hỏi không nằm trong thứ tự Tab | e2e |
| TC-S9.2-AC2-19 | S9.2-AC2 Focus không rơi khi đổi mặt thẻ | Biên | Nạp sẵn một thẻ "mới". Bằng bàn phím: hiện đáp án, chấm "Được" | Focus ở thông báo "Đã ôn xong 1 thẻ." (không về đầu trang), có viền focus, tên đọc được là "Đã ôn xong 1 thẻ.", không nằm trong thứ tự Tab (dòng "Vừa chấm, hết thẻ" của bảng focus) | e2e |
| TC-S9.2-AC2-20 | S9.2-AC2 Focus không rơi khi đổi mặt thẻ | A11y | Như TC-S9.2-AC2-18 rồi chấm tiếp thẻ cuối, chạy tay với VoiceOver hoặc NVDA | Sau "Hiện đáp án" trình đọc đọc "Đáp án", rồi "你好", pinyin, nghĩa; sau khi chấm đọc "Thẻ 2 / 2" rồi "谢谢"; hết thẻ đọc "Đã ôn xong 2 thẻ." | không |

## Không lưu được mức chấm thì chấm lại được

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-21 | S9.2-AC2 Lưu lỗi thì ở lại thẻ | Chức năng | Nạp sẵn hai thẻ "mới" `"你好" nghĩa` và `"谢谢" nghĩa`. Mở màn ôn tập; giả lập lỗi lưu; chỉ dùng bàn phím: hiện đáp án, Tab tới "Được", nhấn Enter | Màn vẫn ở "Thẻ 1 / 2", thẻ "你好", hiện "Không lưu được kết quả. Hãy chấm lại." (được đọc tự động) và 4 nút chấm bấm được; focus ở nút "Được" (có viền focus). Đọc thẻ từ phía test: `"你好" nghĩa` vẫn "mới", thời điểm ôn tiếp theo không đổi | e2e |
| TC-S9.2-AC2-22 | S9.2-AC2 Lưu lỗi thì ở lại thẻ | Chức năng | Tiếp TC-S9.2-AC2-21: bỏ giả lập lỗi; bấm "Được" lần nữa | Màn hiện "Thẻ 2 / 2" ở mặt hỏi của "谢谢"; `"你好" nghĩa` không còn "mới" | e2e |
| TC-S9.2-AC2-23 | S9.2-AC2 Lưu lỗi thì ở lại thẻ | Biên | Như TC-S9.2-AC2-21, giữ giả lập lỗi; bấm "Khó" (lỗi lần hai) | Vẫn ở thẻ "你好"; "Không lưu được kết quả. Hãy chấm lại." được đọc tự động lại ở lần lỗi này; focus ở nút "Khó"; `"你好" nghĩa` vẫn "mới" | e2e |
| TC-S9.2-AC2-24 | S9.2-AC2 Lưu lỗi thì ở lại thẻ | A11y | Như TC-S9.2-AC2-21 và -23, chạy tay với VoiceOver hoặc NVDA (QA đọc kết quả e2e nếu không tạo được lỗi lưu trên máy thật: ghi "không chạy được" kèm lý do) | Mỗi lần lỗi trình đọc đọc "Không lưu được kết quả. Hãy chấm lại." mà không phải di chuyển tới thông báo | không |

## Hết thẻ của phiên

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-25 | S9.2-AC2 Hết thẻ của phiên | Chức năng | Nạp sẵn hai thẻ "mới". Mở màn ôn tập; chấm "Được" thẻ thứ nhất, "Khó" thẻ thứ hai; bấm "Về Trang chủ" | Sau lần chấm thứ hai: màn hiện "Đã ôn xong 2 thẻ." và nút "Về Trang chủ", không còn "Hiện đáp án" hay nút chấm. Bấm "Về Trang chủ": vào Trang chủ | e2e |
| TC-S9.2-AC2-26 | S9.2-AC2 Hết thẻ của phiên | Biên | Nạp sẵn đúng một thẻ "mới"; ôn hết | Màn hiện "Đã ôn xong 1 thẻ." (N đúng bằng số thẻ của phiên) | e2e |

## Ôn tập dùng được khi offline

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC2-27 | S9.2-AC2 Ôn và chấm khi offline | Offline | Nạp sẵn `"你好" nghĩa` đến hạn; đã mở app một lần khi có mạng. Tắt mạng; vào Trang chủ, bấm "Ôn tập"; chấm "Dễ"; mở lại app (vẫn tắt mạng); bấm "Ôn tập" | Khi offline: màn hiện "Thẻ 1 / 1" với "你好", "Hiện đáp án" và 4 nút dùng được, sau khi chấm hiện "Đã ôn xong 1 thẻ.", không có lỗi mạng. Sau khi mở lại: "Không có thẻ nào cần ôn lúc này." (`"你好" nghĩa` không còn trong phiên) | e2e |
| TC-S9.2-AC2-28 | S9.2-AC2 Ôn và chấm khi offline | Offline | QA chạy tay trên điện thoại thật (app đã mở một lần khi có mạng, có thẻ từ một bài đã xong): bật chế độ máy bay; mở app, ôn hết phiên, chấm mọi thẻ "Dễ" (mức khác của thẻ "mới" có bước học vài phút); đóng hẳn app, mở lại ngay, bấm "Ôn tập" | Ôn và chấm được khi offline; sau khi mở lại, các thẻ vừa chấm không còn trong phiên | không |

## FSRS tính ngày ôn tiếp theo và tính chất của lịch ôn

Tên Requirement và Scenario "Ngày ôn tiếp theo khớp FSRS" chép nguyên văn AC3; các case kiểm **thời điểm** ôn tiếp theo (có thể chỉ vài
phút sau, xem "Bước học ngắn").

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.2-AC3-1 | S9.2-AC3 Ngày ôn tiếp theo khớp FSRS | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario. Thẻ "mới" và thẻ đã chấm "Được" một lần, mỗi thẻ chấm lần lượt "Quên", "Khó", "Được", "Dễ" tại một thời điểm cố định; chạy hai lần | Trạng thái và thời điểm ôn tiếp theo của cả 8 trường hợp khớp bảng giá trị mẫu (dev ghi bảng trong test, tính bằng FSRS tham số mặc định, không ngẫu nhiên, với đúng phiên bản thư viện FSRS đang khóa trong dự án; test ghi rõ phiên bản đó). Lần chạy thứ hai cho đúng cùng kết quả. PR nào nâng phiên bản thư viện thì bảng mẫu phải được cập nhật trong cùng PR và nêu lý do (đọc diff). QA đọc kết quả Vitest | không |
| TC-S9.2-AC3-2 | S9.2-AC3 Mức cao hơn không cho ngày ôn sớm hơn | Chức năng | Chỉ kiểm tầng quy tắc (Vitest). Thẻ "mới" và thẻ đã ôn nhiều lần (ít nhất 3 lần), cùng thời điểm chấm, mỗi mức chấm từ cùng trạng thái ban đầu | Thời điểm ôn tiếp theo "Quên" ≤ "Khó" ≤ "Được" ≤ "Dễ" ở cả hai thẻ; mọi thời điểm đều sau thời điểm chấm; mọi thẻ sau khi chấm không còn "mới". QA đọc kết quả Vitest | không |
| TC-S9.2-AC3-9 | S9.2-AC3 Mức cao hơn không cho ngày ôn sớm hơn | Biên | Chỉ kiểm tầng quy tắc (Vitest), dòng "Bước học ngắn" của Requirement "Tính chất của lịch ôn": thẻ "mới", cùng thời điểm chấm, chấm lần lượt từng mức | Thời điểm ôn tiếp theo: "Quên" khoảng 1 phút, "Khó" khoảng 6 phút, "Được" khoảng 10 phút sau lúc chấm (khớp bảng mẫu TC-S9.2-AC3-1); "Dễ" từ 1 ngày trở lên. QA đọc kết quả Vitest | không |
| TC-S9.2-AC3-3 | S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay | Chức năng | Nạp sẵn `"你好" nghĩa` "mới" và `"谢谢" nghĩa` "mới". Mở màn ôn tập; chấm "Dễ" thẻ "你好"; bấm "Về Trang chủ", bấm "Ôn tập" lại ngay | Phiên mới: "Thẻ 1 / 1" với "谢谢"; không có thẻ "你好" | e2e |
| TC-S9.2-AC3-4 | S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay | Chức năng | Tiếp TC-S9.2-AC3-3: bấm "Về Trang chủ"; tua đồng hồ tới đúng thời điểm ôn tiếp theo đã tính cho `"你好" nghĩa` (đọc từ phía test); bấm "Ôn tập" | Phiên có thẻ "你好" (mặt hỏi hiện "你好") | e2e |
| TC-S9.2-AC3-5 | S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay | Biên | Như TC-S9.2-AC3-4 nhưng tua tới 1 phút trước thời điểm ôn tiếp theo đó | Phiên không có thẻ "你好" | e2e |
| TC-S9.2-AC3-6 | S9.2-AC3 Chấm Quên thì thẻ quay lại sớm hơn chấm Dễ | Chức năng | Nạp sẵn `"你好" nghĩa` "mới" và `"谢谢" nghĩa` "mới". Trong cùng một phiên chấm "Quên" cho "你好" và "Dễ" cho "谢谢"; đọc thẻ từ phía test | Thời điểm ôn tiếp theo của `"你好" nghĩa` sớm hơn của `"谢谢" nghĩa`; cả hai không còn "mới" | e2e |
| TC-S9.2-AC3-7 | S9.2-AC3 Chấm Quên thì thẻ quay lại sớm hơn chấm Dễ | Chức năng | Tiếp TC-S9.2-AC3-6: tua đồng hồ tới thời điểm ôn tiếp theo của `"你好" nghĩa`; bấm "Ôn tập" | Phiên có "你好", không có "谢谢" ("Thẻ 1 / 1") | e2e |
| TC-S9.2-AC3-8 | S9.2-AC3 Thẻ nhập từ file sao lưu chấm ra cùng kết quả như máy gốc | Chức năng | Hai trình duyệt sạch A và B (hai hồ sơ riêng). Ở A: nạp sẵn `"你好" nghĩa` "mới"; mở màn ôn tập, chấm "Được"; tua đồng hồ tới thời điểm ôn tiếp theo của thẻ (đọc từ phía test), mở lại màn, chấm "Quên"; tua tiếp tới thời điểm ôn tiếp theo, mở lại màn, chấm "Được". Ở A: Cài đặt → "Sao lưu tiến độ" → "Xuất tiến độ". Ở B: "Nhập tiến độ" file đó, "Ghi đè". Đặt đồng hồ của A và B về cùng một thời điểm T (sau thời điểm ôn tiếp theo của thẻ); ở cả hai mở màn ôn tập, chấm "Khó" thẻ "你好"; đọc thẻ từ phía test ở cả hai | Trước khi chấm "Khó", B hiện "Thẻ 1 / 1" mặt hỏi "你好". Sau khi chấm: `"你好" nghĩa` ở B có cùng trạng thái và cùng thời điểm ôn tiếp theo như ở A. Khác nhau = file sao lưu hoặc nơi lưu thiếu một phần trạng thái nhớ (xem Dependencies của proposal) | e2e |

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| AC1: Chỉ hỏi thẻ đến hạn…, Thẻ mới được hỏi ngay, Thẻ cùng hạn xếp theo chiều rồi theo lộ trình, Thẻ đã chấm hỏi trước thẻ mới, Thẻ mới tạo ở các lần khác nhau…, Vị trí của từ theo bài đầu tiên…, Danh sách chốt lúc mở màn, Thẻ của từ không có trong app…, Thẻ đọc không được… | Vitest quy tắc chọn và xếp thẻ, vị trí của từ trong lộ trình (hàm thuần) + use case "lấy phiên ôn" với dữ liệu thật trên trình duyệt giả | Đến hạn = thời điểm ôn tiếp theo không muộn hơn lúc mở màn; thứ tự Q1 → Q4, V1 → V4, không dùng lúc tạo thẻ "mới"; bỏ qua thẻ của từ lạ và thẻ hỏng, giữ nguyên thẻ |
| AC1: bốn Scenario chiều nghĩa / nghe / viết (kể cả mọi nghĩa của từ), Hiện đáp án, Tắt Hiện pinyin… | Testing Library component mặt hỏi / mặt đáp án | Phần bị giấu không có trong màn; không tự phát audio |
| AC1: Thẻ chiều nghe khi audio không phát được | Testing Library (hook audio báo lỗi) | Thông báo trong vùng đọc tự động; vẫn hiện đáp án, chấm được |
| AC2: Chưa hiện đáp án…, Hiện đáp án thì có 4 nút…, Chấm thì sang thẻ kế, Bấm nút chấm hai lần…, Thoát giữa phiên…, Rời màn giữa phiên…, Hết thẻ của phiên | Testing Library hook + component màn ôn tập; Vitest use case "chấm thẻ rồi lưu" | Chấm một lần mỗi thẻ (bấm lần hai không lưu, không chấm thẻ kế); lưu ngay; rời màn không hộp thoại |
| AC2: Ôn một thẻ chỉ bằng bàn phím, Focus không rơi…; AC1: Focus sau khi Thử lại | Testing Library (focus và tên đọc được sau đổi mặt / sang thẻ kế / hết thẻ / thử lại) | Vùng nhận focus không nằm trong thứ tự Tab |
| AC2: Lưu lỗi thì ở lại thẻ; AC1: Không tải được thẻ | Testing Library hook (store giả báo lỗi) + Vitest use case | Thẻ giữ nguyên khi lưu lỗi; thông báo đọc lại mỗi lần lỗi |
| AC1: Chưa có thẻ nào, Không có thẻ đến hạn | Vitest quy tắc phân loại trạng thái rỗng + Testing Library | Chỉ có thẻ bị bỏ qua = "chưa có thẻ" |
| AC2: Ôn và chấm khi offline | e2e | |
| AC3: Ngày ôn tiếp theo khớp FSRS, Mức cao hơn không cho ngày ôn sớm hơn | Vitest quy tắc xếp lịch (hàm thuần) | Chỉ kiểm ở tầng này; bảng giá trị mẫu cố định theo phiên bản thư viện đang khóa, không ngẫu nhiên; có bước học ngắn |
| AC3: Thẻ nhập từ file sao lưu chấm ra cùng kết quả như máy gốc | Vitest (xuất → nhập → chấm, so trạng thái nhớ) + e2e hai trình duyệt | Đủ trạng thái nhớ qua file sao lưu |
| AC3: Chấm Dễ…, Chấm Quên… | Vitest use case + e2e có tua đồng hồ | |
