# Test cases: S10.5 Thẻ ngữ pháp

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Thẻ ngữ pháp mẫu** (dùng cho mọi case trên màn bài):
- Tiêu đề "Câu tính từ với 很"
- Giải thích "Trong câu miêu tả bằng tính từ, thường đặt 很 trước tính từ."
- Cấu trúc "Chủ ngữ + 很 + Tính từ"
- Ví dụ 1: "我很好。" / "Wǒ hěn hǎo." / "Tôi khỏe."; ví dụ 2: "她很忙。" / "Tā hěn máng." / "Cô ấy bận."

**Bài mẫu trên bản build kiểm thử** (theo mục "Dữ liệu nghiệm thu" của proposal): nội dung phát hành không có thẻ ngữ pháp, nên Bài A–D
chỉ có trong bản build dành cho kiểm thử tự động (e2e dùng cùng bản build đó hoặc thay nội dung bài khi chạy). QA nghiệm thu mọi case
trên màn bài trên bản build kiểm thử này, không trên bản app người học tải về. Bài A–D nằm trong một chủ đề HSK mẫu (gọi là "chủ đề mẫu"),
audio của chủ đề mẫu chưa tải khi bắt đầu.

| Bài | Gồm | Dùng cho |
|---|---|---|
| Bài A | Bài học thường 4 câu: câu 1 thẻ ngữ pháp mẫu, câu 2–4 là câu chọn thanh điệu | Hiển thị thẻ, audio ví dụ, "Câu 1 / 4", "Câu 2 / 4", học tiếp, điểm 67% |
| Bài B | Bài học thường 3 câu: câu 1 thẻ ngữ pháp mẫu, câu 2–3 là câu chọn thanh điệu; có bài kế tiếp đang khóa | "Tiếp tục" có ngay, "Đã xong" |
| Bài C | Bài học thường 3 câu: câu 1–2 là câu chọn thanh điệu, câu 3 thẻ ngữ pháp mẫu | Thẻ là câu cuối |
| Bài D | Bài học thường 2 câu: câu 1 là câu nghe (có công tắc "Nghe chậm"), câu 2 thẻ ngữ pháp mẫu | Nghe chậm giữ qua câu |

**Điều kiện đầu chung:** bản build kiểm thử, có mạng, tiến độ trống (hoặc bài đang làm chưa có vị trí học dở), audio của chủ đề mẫu chưa
tải, giao diện sáng, khổ desktop 1280×800, tốc độ mặc định trong Cài đặt là "Bình thường (1x)", trừ khi case ghi khác. Mở bài nào thì bài
đó phải đang mở trên bản đồ lộ trình.

**Cách kiểm audio khi chạy tay:** bật loa/tai nghe, nghe trực tiếp. "Hai luồng âm cùng lúc" là nghe chồng tiếng. Tốc độ 0.75x so sánh bằng
tai với lần phát ở 1x của cùng ví dụ (chậm rõ). Case nghe tiếng để `không` vì e2e không nghe được tiếng; phần phát đúng ví dụ, đúng tốc độ,
dừng khi đổi ví dụ được kiểm bằng Testing Library trong PR code (test mang ID Scenario). Case audio lỗi và offline để `e2e` vì kiểm bằng
thông báo trên màn và trạng thái tải.

**"Chặn file audio":** e2e chặn yêu cầu tải file audio của ví dụ; chạy tay dùng chặn yêu cầu trong công cụ của trình duyệt.

**Kiểm tra nội dung:** dành cho người soạn nội dung, chạy `pnpm content:check` trên một bản sao nội dung đã sửa theo case; không có giao
diện cho người học. Các case này để `không` vì được kiểm bằng Vitest trong PR code và CI chạy kiểm tra nội dung trên mọi PR; khi nghiệm
thu, QA đối chiếu test mang ID Scenario đã pass hoặc chạy tay theo bước.

**Ngoài phạm vi:** thẻ ôn tập, ẩn pinyin theo cài đặt, công tắc "Nghe chậm" riêng trên thẻ thuộc "Không làm". Quy tắc chung của câu không
chấm điểm (S10.1) được kiểm ở S10.1; ở đây chỉ kiểm thẻ ngữ pháp theo các Scenario của delta `lesson-runner` S10.5.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.5-AC1-1 | S10.5-AC1 Thẻ hiện giải thích, cấu trúc và ví dụ | Chức năng | Mở Bài A | Câu 1 hiện tiêu đề "Câu tính từ với 很"; dưới nhãn "Giải thích" có "Trong câu miêu tả bằng tính từ, thường đặt 很 trước tính từ."; dưới nhãn "Cấu trúc" có "Chủ ngữ + 很 + Tính từ"; dưới nhãn "Ví dụ" có đúng hai ví dụ theo thứ tự: "我很好。", "Wǒ hěn hǎo.", "Tôi khỏe." rồi "她很忙。", "Tā hěn máng.", "Cô ấy bận."; mỗi ví dụ có một nút nghe | e2e |
| TC-S10.5-AC1-2 | S10.5-AC1 Thẻ hiện giải thích, cấu trúc và ví dụ | Sáng/Tối | Mở Bài A ở giao diện sáng, rồi chuyển giao diện tối | Ở cả hai giao diện: tiêu đề, ba nhãn, giải thích, cấu trúc, chữ Hán, pinyin, nghĩa và nút nghe đều đọc rõ (không có chữ chìm vào nền), không phần nào bị mất | không |
| TC-S10.5-AC1-3 | S10.5-AC1 Nút nghe có tên đọc được theo từng ví dụ | A11y | Mở Bài A, bật trình đọc màn hình (VoiceOver hoặc NVDA), di chuyển lần lượt qua các nút của thẻ | Nút nghe của ví dụ 1 được đọc là "Nghe ví dụ 1", của ví dụ 2 là "Nghe ví dụ 2"; không nút nào bị đọc thành tên trống hoặc chỉ "nút" | không |
| TC-S10.5-AC1-4 | S10.5-AC1 Thẻ đọc được trên màn hình 375px | Mobile 375 | Ở khổ 375×812, mở Bài A; cuộn dọc hết thẻ; làm lại ở giao diện tối | Giải thích, cấu trúc và cả hai ví dụ hiện đủ, chữ dài xuống dòng trong khung, không bị cắt; trang không có thanh cuộn ngang; nút nghe và "Tiếp tục" không bị che. Giống nhau ở sáng và tối | không |
| TC-S10.5-AC1-5 | S10.5-AC1 Tắt "Hiện pinyin" thì ví dụ vẫn có pinyin | Chức năng | Vào Cài đặt, tắt "Hiện pinyin"; mở Bài A | Ví dụ "我很好。" vẫn hiện "Wǒ hěn hǎo."; ví dụ "她很忙。" vẫn hiện "Tā hěn máng." | không |
| TC-S10.5-AC1-6 | S10.5-AC1 Thẻ vừa hiện thì chưa phát audio | Chức năng | Bật loa, mở Bài A, chờ 5 giây không bấm gì | Không có audio nào phát | không |
| TC-S10.5-AC1-7 | S10.5-AC1 Thẻ vừa hiện thì chưa phát audio | Biên | Bật loa, mở Bài C, trả lời câu 1 và câu 2, bấm "Tiếp tục" để tới thẻ ở câu 3; chờ 5 giây | Thẻ hiện, không có audio nào phát (kể cả audio của câu trước) | không |
| TC-S10.5-AC1-8 | S10.5-AC1 Bấm nghe thì phát audio của đúng ví dụ | Chức năng | Mở Bài A, bấm "Nghe ví dụ 2", nghe hết | Nghe được câu "她很忙。" phát một lần từ đầu, không phải "我很好。" | không |
| TC-S10.5-AC1-9 | S10.5-AC1 Nghe lại nhiều lần | Biên | Mở Bài A, bấm "Nghe ví dụ 1"; chờ phát xong rồi bấm lại; lặp đủ 5 lần | Ví dụ 1 phát đủ 5 lần; sau lần thứ 5 nút "Nghe ví dụ 1" vẫn bấm được (không bị mờ, không bị khóa) | không |
| TC-S10.5-AC1-10 | S10.5-AC1 Bấm lại khi đang phát thì phát lại từ đầu | Biên | Mở Bài A, bấm "Nghe ví dụ 1"; khi đang phát giữa chừng, bấm "Nghe ví dụ 1" lần nữa | Ví dụ 1 phát lại từ đầu; không nghe hai tiếng chồng nhau | không |
| TC-S10.5-AC1-11 | S10.5-AC1 Bấm ví dụ khác thì ví dụ đang phát dừng | Chức năng | Mở Bài A, bấm "Nghe ví dụ 1"; khi đang phát giữa chừng, bấm "Nghe ví dụ 2" | Ví dụ 1 dừng ngay; ví dụ 2 phát từ đầu; không nghe hai tiếng chồng nhau | không |
| TC-S10.5-AC1-12 | S10.5-AC1 Sang câu kế thì dừng audio ví dụ | Chức năng | Mở Bài A, bấm "Nghe ví dụ 1"; khi đang phát giữa chừng, bấm "Tiếp tục" | Audio ví dụ 1 dừng ngay; màn hiện câu 2 | không |
| TC-S10.5-AC1-13 | S10.5-AC1 Ví dụ phát chậm khi đã bật Nghe chậm ở câu trước | Chức năng | Tốc độ mặc định "Bình thường (1x)". Mở Bài D, ở câu 1 bật "Nghe chậm", trả lời câu 1 và sang câu 2 (thẻ ngữ pháp); bấm "Nghe ví dụ 1" | Ví dụ 1 phát ở tốc độ 0.75x (chậm rõ so với TC-S10.5-AC1-15) | không |
| TC-S10.5-AC1-14 | S10.5-AC1 Mở bài với tốc độ mặc định Chậm | Chức năng | Vào Cài đặt, chọn tốc độ mặc định "Chậm (0.75x)"; mở Bài A; bấm "Nghe ví dụ 1" | Ví dụ 1 phát ở tốc độ 0.75x | không |
| TC-S10.5-AC1-15 | S10.5-AC1 Mở bài với tốc độ mặc định Bình thường | Chức năng | Vào Cài đặt, chọn tốc độ mặc định "Bình thường (1x)"; mở Bài A; bấm "Nghe ví dụ 1" | Ví dụ 1 phát ở tốc độ 1x; trên thẻ không có công tắc "Nghe chậm" | không |
| TC-S10.5-AC1-16 | S10.5-AC1 Audio ví dụ không phát được | Chức năng | Mở Bài A; chặn file audio của ví dụ 1; bấm "Nghe ví dụ 1"; bấm "Nghe ví dụ 1" lần nữa; bấm "Tiếp tục" | Sau lần bấm đầu, màn hiện thông báo "Không phát được audio." (đúng chữ đang dùng ở câu nghe); lần bấm thứ hai vẫn nhận (nút không bị khóa); bấm "Tiếp tục" thì sang câu 2 với "Câu 2 / 4" | e2e |
| TC-S10.5-AC1-17 | S10.5-AC1 Thẻ ngữ pháp có Tiếp tục ngay | Chức năng | Mở Bài B (3 câu), không bấm gì trên thẻ ở câu 1 | Nút "Tiếp tục" có ngay và bấm được; màn không hiện thông báo "Đúng", "Sai" hay phần giải thích đáp án (phần hiện khi trả lời sai ở câu chấm điểm); phần giải thích ngữ pháp dưới nhãn "Giải thích" ("Trong câu miêu tả bằng tính từ, thường đặt 很 trước tính từ.") vẫn hiện | e2e |
| TC-S10.5-AC1-18 | S10.5-AC1 Thẻ ngữ pháp có trong Câu k / n | Chức năng | Mở Bài A (4 câu), bấm "Tiếp tục" ở thẻ ở câu 1 | Màn hiện câu 2 với "Câu 2 / 4" | e2e |
| TC-S10.5-AC1-19 | S10.5-AC1 Dùng bàn phím đi qua thẻ | A11y | Mở Bài A, chỉ dùng phím Tab (và Shift+Tab nếu lỡ qua) để đi qua thẻ, rồi nhấn Enter ở "Tiếp tục". Làm lại ở giao diện tối | Lần lượt tới được "Nghe ví dụ 1", "Nghe ví dụ 2" rồi "Tiếp tục" theo thứ tự đó; mỗi nút khi được focus có viền focus nhìn thấy rõ ở cả sáng và tối; Enter ở "Tiếp tục" thì sang câu 2 | không |
| TC-S10.5-AC1-20 | S10.5-AC1 Dùng bàn phím đi qua thẻ | A11y | Mở Bài A, Tab tới "Nghe ví dụ 1", nhấn Enter | Ví dụ 1 phát (nút nghe dùng được bằng bàn phím) | không |
| TC-S10.5-AC1-21 | S10.5-AC1 Thẻ ngữ pháp có trong Câu k / n | Biên | Mở Bài A | Khi đang ở thẻ, thanh tiến độ hiện "Câu 1 / 4" (thẻ được đếm là một câu) | e2e |
| TC-S10.5-AC1-22 | S10.5-AC1 Bài có thẻ ngữ pháp thành Đã xong | Chức năng | Mở Bài B, bấm "Tiếp tục" ở thẻ, trả lời câu 2 và câu 3 (chọn thanh điệu, không bấm "Bỏ qua câu này" lần nào) tới màn tổng kết; về bản đồ lộ trình | Màn tổng kết không báo có câu bị bỏ qua; trên bản đồ lộ trình Bài B là "Đã xong", bài kế tiếp là "Đang mở" | e2e |
| TC-S10.5-AC1-23 | S10.5-AC1 Thẻ ngữ pháp có trong Câu k / n | Biên | Mở Bài A, bấm "Tiếp tục" ở thẻ; ở câu 2 thoát bài về lộ trình; mở lại Bài A | Màn hiện câu 2 với "Câu 2 / 4", không quay lại thẻ ở câu 1 (thẻ đã làm được ghi nhớ như mọi câu) | e2e |
| TC-S10.5-AC1-24 | S10.5-AC1 Điểm không tính thẻ ngữ pháp | Chức năng | Mở Bài A, bấm "Tiếp tục" ở thẻ, trả lời đúng câu 2 và câu 3, sai câu 4; tới màn tổng kết | Màn tổng kết hiện điểm "67%", "Đúng 2 / 3 câu" và "Sai 1 câu" | e2e |
| TC-S10.5-AC1-25 | S10.5-AC1 Điểm không tính thẻ ngữ pháp | Biên | Mở Bài C, trả lời đúng câu 1 và câu 2; ở thẻ (câu 3) bấm "Tiếp tục" | Sang màn tổng kết với điểm "100%", "Đúng 2 / 2 câu", "Sai 0 câu" | không |
| TC-S10.5-AC1-26 | S10.5-AC1 Bài kiểm tra có thẻ ngữ pháp thì báo lỗi | Chức năng | Trên bản sao nội dung, thêm một thẻ ngữ pháp mẫu (dữ liệu thẻ đầy đủ) vào một bài kiểm tra cuối chủ đề; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài kiểm tra đó | không |
| TC-S10.5-AC1-27 | S10.5-AC1 Bài chỉ gồm thẻ ngữ pháp và thẻ từ mới thì báo lỗi | Chức năng | Trên bản sao nội dung, tạo một bài học thường chỉ gồm 1 thẻ ngữ pháp mẫu và 1 thẻ từ mới (dữ liệu hai thẻ đầy đủ), không có câu chấm điểm nào; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài đó | không |
| TC-S10.5-AC1-28 | S10.5-AC1 Nội dung đủ thì kiểm tra chạy qua | Biên | Trên bản sao nội dung có Bài B (1 thẻ ngữ pháp mẫu và 2 câu chọn thanh điệu, dữ liệu đầy đủ); chạy kiểm tra nội dung | Không có lỗi nào nêu Bài B (bài học thường có câu chấm điểm kèm thẻ ngữ pháp là hợp lệ) | không |
| TC-S10.5-AC1-29 | S10.5-AC1 Nội dung đủ thì kiểm tra chạy qua | Chức năng | Chạy kiểm tra nội dung trên nội dung có một bài với thẻ ngữ pháp mẫu đủ tiêu đề, giải thích, cấu trúc và hai ví dụ (các phần khác của nội dung hợp lệ) | Kiểm tra kết thúc thành công; không có lỗi nào về thẻ ngữ pháp | không |
| TC-S10.5-AC1-30 | S10.5-AC1 Điểm ngữ pháp không có ví dụ thì báo lỗi | Chức năng | Trên bản sao nội dung, xóa cả hai ví dụ của điểm ngữ pháp "Câu tính từ với 很"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp dùng điểm ngữ pháp đó | không |
| TC-S10.5-AC1-31 | S10.5-AC1 Điểm ngữ pháp thiếu giải thích thì báo lỗi | Chức năng | Trên bản sao nội dung, để trống giải thích tiếng Việt của điểm ngữ pháp "Câu tính từ với 很"; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp đó | không |
| TC-S10.5-AC1-32 | S10.5-AC1 Điểm ngữ pháp thiếu tiêu đề thì báo lỗi | Chức năng | Trên bản sao nội dung, để trống tiêu đề của điểm ngữ pháp "Câu tính từ với 很" (các phần khác giữ nguyên); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp đó | không |
| TC-S10.5-AC1-33 | S10.5-AC1 Thẻ trỏ tới điểm ngữ pháp không có thì báo lỗi | Chức năng | Trên bản sao nội dung, cho thẻ ngữ pháp của một bài trỏ tới một điểm ngữ pháp không tồn tại; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp đó | không |
| TC-S10.5-AC1-34 | S10.5-AC1 Ví dụ trỏ tới câu không có thì báo lỗi | Chức năng | Trên bản sao nội dung, cho ví dụ 2 của điểm ngữ pháp "Câu tính từ với 很" trỏ tới một câu không có trong danh sách câu; chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp đó | không |
| TC-S10.5-AC1-35 | S10.5-AC1 Điểm ngữ pháp thiếu cấu trúc thì báo lỗi | Chức năng | Trên bản sao nội dung, để trống cấu trúc câu của điểm ngữ pháp "Câu tính từ với 很" (các phần khác giữ nguyên); chạy kiểm tra nội dung | Kiểm tra kết thúc không thành công; lỗi nêu bài và câu của thẻ ngữ pháp đó | không |
| TC-S10.5-AC1-36 | S10.5-AC1 Dung lượng tải của chủ đề gồm audio ví dụ | Chức năng | Mở màn Lộ trình, tìm chủ đề mẫu (chưa tải audio) | Khối của chủ đề mẫu có nút "Tải audio (<dung lượng>)"; dung lượng bằng tổng dung lượng mọi audio của chủ đề mẫu kể cả audio hai câu ví dụ "我很好。" và "她很忙。", làm tròn và ghi như S8.4 (e2e đối chiếu với tổng dung lượng file audio của chủ đề trong bản build kiểm thử; chạy tay đối chiếu với con số QA tính từ danh sách file audio của chủ đề) | e2e |
| TC-S10.5-AC1-37 | S10.5-AC1 Đã tải chủ đề thì nghe ví dụ offline được | Offline | Mở màn Lộ trình, bấm "Tải audio (<dung lượng>)" của chủ đề mẫu, chờ tới "Đã tải audio (<dung lượng>)"; tắt mạng; mở Bài A; bấm "Nghe ví dụ 2" | Audio của câu "她很忙。" phát được; không hiện thông báo "Không phát được audio." | e2e |
| TC-S10.5-AC1-38 | S10.5-AC1 Đã tải chủ đề thì nghe ví dụ offline được | Biên | Tiếp TC-S10.5-AC1-37, vẫn tắt mạng, chưa từng bấm nghe ví dụ 1 lúc có mạng: bấm "Nghe ví dụ 1" | Audio của câu "我很好。" phát được; không hiện thông báo "Không phát được audio." (audio ví dụ có trên máy nhờ tải chủ đề, không phải nhờ đã nghe trước đó) | e2e |
