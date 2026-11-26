# Test cases: S11.1 15 chủ đề HSK 1

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Người học mới**: trình duyệt chưa có dữ liệu của app (xoá dữ liệu trang hoặc cửa sổ ẩn danh), mở app, làm xong onboarding, chưa
  học bài nào.
- **Tiến độ mở hết HSK 1**: mọi bài của giai đoạn "Nhập môn" và "HSK 1" đều "Đã xong" để mở được bài nào cũng được. e2e nạp sẵn tiến
  độ; QA chạy tay nhập một file sao lưu tiến độ có trạng thái này (mục "Sao lưu tiến độ", S8.5). Cách nạp và file mẫu do dev ghi
  trong design.md.
- **Tiến độ tới chủ đề 1 của HSK 1**: mọi bài "Nhập môn" "Đã xong", bài "Từ mới · <tên chủ đề 1>" "Đang mở", chưa làm bài nào của
  HSK 1. Nạp như trên.
- **Nhận ra dạng câu trên màn bài**: thẻ từ mới, thẻ ngữ pháp, câu hội thoại theo cách đã nghiệm thu ở S10.1, S10.5, S10.6; câu viết chữ
  theo nét là khung viết có nét mờ của một chữ và liên kết "Xem thứ tự nét" (S7.1).
- **Câu chấm điểm / không chấm điểm**: câu chấm điểm là câu mà sau khi trả lời màn hiện "Đúng" hoặc "Sai" rồi mới có "Tiếp tục" (S3.2).
  Câu không chấm điểm (thẻ từ mới, thẻ ngữ pháp, câu hội thoại) có "Tiếp tục" ngay, không bao giờ hiện "Đúng"/"Sai".
- **Lệnh kiểm tra nội dung**: lệnh chuẩn cho nội dung trong CLAUDE.md §8, chạy ở thư mục gốc repo.
- **Nội dung thử**: bộ nội dung nhỏ dev dựng riêng cho test của luật độ phủ, không phải nội dung thật của app.

**Cột Tự động**: `e2e` chỉ dành cho case đưa vào Playwright trong PR code. `không` = QA chạy tay khi nghiệm thu. Một số case `không` vẫn
được dev phủ tự động bằng test Vitest (test nội dung đã build, test luật độ phủ); đó **không phải e2e**, QA đọc kết quả test đó khi
nghiệm thu (xem "Tầng test theo Scenario" cuối file). Các Scenario "đọc nội dung đã build" được kiểm đủ 15 chủ đề × 5 bài bằng test
Vitest của dev; case chạy tay dưới đây lấy mẫu chủ đề 1, 8, 15 để kiểm cùng điều đó trên màn hình người học thấy.

**Nghiệm thu theo PR code** (PR code chia nối tiếp, xem proposal):

- PR đầu (luật độ phủ + khung giai đoạn): các case AC2 trên nội dung thử, TC-S11.1-AC2-11.
- PR giữa (thêm nhóm chủ đề): TC-S11.1-AC2-11; case AC1 chạy tay lấy mẫu trên các chủ đề đã có trong PR đó.
- PR cuối (đủ 15 chủ đề): toàn bộ file này.

## AC1: 15 chủ đề, mỗi chủ đề 5 bài

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.1-AC1-1 | S11.1-AC1 Giai đoạn HSK 1 có 15 chủ đề, đứng sau Nhập môn | Chức năng | Người học mới; mở màn Lộ trình, cuộn qua hết giai đoạn "Nhập môn"; đếm số chủ đề của giai đoạn kế tiếp | Giai đoạn ngay sau "Nhập môn" có tiêu đề "HSK 1", không có giai đoạn nào nằm giữa; giai đoạn đó có đúng 15 chủ đề | không |
| TC-S11.1-AC1-2 | S11.1-AC1 Mỗi chủ đề có 5 bài đúng thứ tự loại bài | Chức năng | Như TC-S11.1-AC1-1; với từng chủ đề của "HSK 1", ghi tiêu đề các bài theo thứ tự trên bản đồ | Chủ đề nào cũng có đúng 5 bài; tiêu đề lần lượt bắt đầu bằng "Từ mới", "Ngữ pháp", "Hội thoại", "Viết chữ", "Kiểm tra" | không |
| TC-S11.1-AC1-3 | S11.1-AC1 Bản đồ lộ trình hiện giai đoạn HSK 1 | Chức năng | Người học mới; mở màn Lộ trình | Màn hiện giai đoạn "HSK 1" sau giai đoạn "Nhập môn"; "HSK 1" có 15 chủ đề, mỗi chủ đề có 5 bài | e2e |
| TC-S11.1-AC1-4 | S11.1-AC1 Bản đồ lộ trình hiện giai đoạn HSK 1 | Mobile 375 | Khổ 375×812; người học mới; mở màn Lộ trình, cuộn tới chủ đề có tên dài nhất của "HSK 1" | Tiêu đề giai đoạn, tên chủ đề và tiêu đề 5 bài hiện đủ chữ (xuống dòng được, không bị che hay cắt mất phần tên chủ đề); trang không cuộn ngang; nút "Kiểm tra vượt cấp" và nút "Tải audio (<dung lượng>)" nằm trọn trong màn | không |
| TC-S11.1-AC1-5 | S11.1-AC1 Bản đồ lộ trình hiện giai đoạn HSK 1 | Offline | Chạy trên bản build (có service worker). Tiến độ mở hết HSK 1, đang có mạng; ở màn Lộ trình bấm "Tải audio (<dung lượng>)" của chủ đề 1 "HSK 1", chờ khối hiện "Đã tải audio (<dung lượng>)". Tắt mạng (chế độ máy bay hoặc Offline trong công cụ trình duyệt). Mở "Từ mới · <tên chủ đề 1>", bấm nghe ở một thẻ từ mới; mở "Hội thoại · <tên chủ đề 1>", bấm nghe ở một câu hội thoại | Vẫn mở được hai bài khi không có mạng; audio của thẻ từ mới và của câu hội thoại phát được, không hiện báo lỗi audio | không |
| TC-S11.1-AC1-6 | S11.1-AC1 Tiêu đề bài nêu loại bài và tên chủ đề | Chức năng | Như TC-S11.1-AC1-2; với từng chủ đề, so tên chủ đề với tiêu đề 5 bài của nó | Bài thứ k có tiêu đề đúng "<loại bài thứ k> · <tên chủ đề>" (Từ mới, Ngữ pháp, Hội thoại, Viết chữ, Kiểm tra), so khớp từng ký tự: một khoảng trắng mỗi bên dấu "·", tên chủ đề giống hệt tên chủ đề trên bản đồ | không |
| TC-S11.1-AC1-7 | S11.1-AC1 Tên 15 chủ đề không trùng nhau | Chức năng | Như TC-S11.1-AC1-1; ghi lại 15 tên chủ đề của "HSK 1" | 15 tên khác nhau từng đôi một (so khớp nguyên văn) | không |
| TC-S11.1-AC1-8 | S11.1-AC1 Bài Từ mới có thẻ từ mới | Chức năng | Tiến độ mở hết HSK 1; mở bài Từ mới của chủ đề 1, 8 và 15, đi qua mọi câu | Mỗi bài có ít nhất một thẻ từ mới | không |
| TC-S11.1-AC1-9 | S11.1-AC1 Bài Ngữ pháp có thẻ ngữ pháp | Chức năng | Tiến độ mở hết HSK 1; mở bài Ngữ pháp của chủ đề 1, 8 và 15, đi qua mọi câu | Mỗi bài có ít nhất một thẻ ngữ pháp | không |
| TC-S11.1-AC1-10 | S11.1-AC1 Bài Hội thoại có câu hội thoại | Chức năng | Tiến độ mở hết HSK 1; mở bài Hội thoại của chủ đề 1, 8 và 15, đi qua mọi câu | Mỗi bài có ít nhất một câu hội thoại | không |
| TC-S11.1-AC1-11 | S11.1-AC1 Bài Viết chữ có câu viết chữ theo nét | Chức năng | Tiến độ mở hết HSK 1; mở bài Viết chữ của chủ đề 1, 8 và 15, đi qua mọi câu | Mỗi bài có ít nhất một câu viết chữ theo nét (khung viết có nét mờ của một chữ) | không |
| TC-S11.1-AC1-12 | S11.1-AC1 Bài Kiểm tra là bài kiểm tra cuối chủ đề | Chức năng | Tiến độ tới chủ đề 1 của HSK 1; làm hết 4 bài đầu của chủ đề 1 rồi mở bài "Kiểm tra · <tên chủ đề 1>", trả lời đúng mọi câu | Không câu nào là câu không chấm điểm (thẻ từ mới, thẻ ngữ pháp, câu hội thoại; tức câu có "Tiếp tục" ngay, không có "Đúng"/"Sai"); cuối bài hiện kết quả của bài kiểm tra cuối chủ đề (điểm, đạt từ 80%, S3.5); trên bản đồ bài kiểm tra "Đã xong" và "Từ mới · <tên chủ đề 2>" "Đang mở" | e2e |
| TC-S11.1-AC1-13 | S11.1-AC1 Bài Kiểm tra là bài kiểm tra cuối chủ đề | Chức năng | Tiến độ tới chủ đề 1 của HSK 1; mở bài "Từ mới · <tên chủ đề 1>", trả lời sai mọi câu có thể trả lời sai; câu viết chữ thì viết xong; làm hết bài | Bài kết thúc như bài học thường (không có ngưỡng 80%): trên bản đồ bài đó "Đã xong" và "Ngữ pháp · <tên chủ đề 1>" "Đang mở". Lặp lại với 3 bài còn lại của chủ đề 1: kết quả tương tự, sau bài Viết chữ thì bài Kiểm tra "Đang mở" | không |
| TC-S11.1-AC1-14 | S11.1-AC1 Chủ đề HSK 1 chưa mở có nút Kiểm tra vượt cấp | Chức năng | Người học mới; mở màn Lộ trình, cuộn qua cả 15 chủ đề của "HSK 1" | Cả 15 chủ đề đang khóa, kể cả chủ đề thứ nhất, và chủ đề nào cũng hiện nút "Kiểm tra vượt cấp" | e2e |
| TC-S11.1-AC1-15 | S11.1-AC1 Chủ đề HSK 1 chưa mở có nút Kiểm tra vượt cấp | A11y | Như TC-S11.1-AC1-14, chỉ dùng bàn phím: nhấn Tab tới nút "Kiểm tra vượt cấp" của chủ đề thứ nhất rồi của chủ đề thứ hai; bật trình đọc màn hình (VoiceOver hoặc NVDA) | Nút nhận focus bằng Tab, có viền focus nhìn thấy; trình đọc màn hình đọc "Kiểm tra vượt cấp" và phân biệt được nút thuộc chủ đề nào (như S3.6 đã nghiệm thu) | không |
| TC-S11.1-AC1-16 | S11.1-AC1 Bốn bài học thường của mỗi chủ đề có câu chấm điểm | Chức năng | Tiến độ mở hết HSK 1; mở 4 bài Từ mới, Ngữ pháp, Hội thoại, Viết chữ của chủ đề 1, 8 và 15, đi qua mọi câu | Mỗi bài trong 12 bài có ít nhất một câu chấm điểm (sau khi trả lời màn hiện "Đúng" hoặc "Sai"); thẻ từ mới, thẻ ngữ pháp, câu hội thoại không được tính | không |
| TC-S11.1-AC1-17 | S11.1-AC1 Mọi câu của 75 bài thuộc dạng màn bài đã hỗ trợ | Chức năng | Tiến độ mở hết HSK 1; mở đủ 5 bài của chủ đề 1, 8 và 15 (có thể gộp khi chạy TC-S11.1-AC1-8…11, 16), đi qua mọi câu tới cuối bài | Không câu nào hiện "Bỏ qua câu này"; cuối mỗi bài không có thông báo đã bỏ qua câu hay bài chưa hoàn thành (S3.2). Đủ 75 bài do test Vitest nội dung của dev kiểm (không phải e2e) | không |

## AC2: Script kiểm tra báo phủ 100% trong 500 từ cấp 1

Các case "Dev chạy … trên nội dung thử" là test Vitest của luật độ phủ (không phải e2e); QA đọc kết quả test (tên test chứa ID Scenario)
khi nghiệm thu.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S11.1-AC2-1 | S11.1-AC2 Nội dung thật phủ 100% | Chức năng | Trên nhánh của PR code cuối (đủ 15 chủ đề), chạy lệnh kiểm tra nội dung | Output có đúng dòng "Độ phủ từ HSK 1: 100% (500/500)"; không có lỗi hay cảnh báo thiếu độ phủ; lệnh kết thúc thành công (CI cũng chạy lệnh này trên mọi PR) | không |
| TC-S11.1-AC2-2 | S11.1-AC2 Từ có thẻ từ mới ở hai chủ đề chỉ đếm một lần | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử: 500 từ đều có thẻ từ mới trong bài Từ mới, "你" có ở hai chủ đề | Dòng độ phủ là "Độ phủ từ HSK 1: 100% (500/500)" (không phải 501) | không |
| TC-S11.1-AC2-3 | S11.1-AC2 Từ chỉ có ngoài bài Từ mới không được tính | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử: 499 từ có thẻ từ mới trong bài Từ mới, "爱" chỉ có trong một câu viết chữ của bài Viết chữ | Dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)"; báo thiếu độ phủ nêu "爱" | không |
| TC-S11.1-AC2-4 | S11.1-AC2 Từ chỉ có ở bài Nhập môn không được tính | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử: 499 từ có thẻ từ mới trong bài Từ mới HSK 1, "好" chỉ có trong bài Nhập môn | Dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)"; báo thiếu độ phủ nêu "好" | không |
| TC-S11.1-AC2-5 | S11.1-AC2 Chữ Hán có hai mục được tính riêng theo pinyin | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử: mọi từ có thẻ từ mới trừ "地 (de)"; "地 (dì)" có thẻ từ mới | Dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)" (thẻ "地 (dì)" không phủ "地 (de)"); báo thiếu độ phủ nêu "地 (de)" | không |
| TC-S11.1-AC2-6 | S11.1-AC2 Danh sách thiếu ghi pinyin cho chữ Hán có nhiều mục | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử: mọi từ có thẻ từ mới trừ "地 (de)" và "爱" | Dòng độ phủ là "Độ phủ từ HSK 1: 99% (498/500)"; báo thiếu độ phủ nêu 2 từ, ghi đúng "地 (de)" (có pinyin) và "爱" (chỉ chữ Hán, không kèm pinyin) | không |
| TC-S11.1-AC2-7 | S11.1-AC2 Đủ 15 chủ đề mà thiếu hai từ thì báo lỗi nêu đủ hai từ | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử có giai đoạn HSK 1 đủ 15 chủ đề, mọi từ có thẻ từ mới trừ "爱" và "八" | Dòng độ phủ là "Độ phủ từ HSK 1: 99% (498/500)" (làm tròn xuống, không hiện "100%"); có lỗi (không phải cảnh báo) nêu 2 từ chưa được phủ là "爱" và "八"; lệnh kết thúc không thành công | không |
| TC-S11.1-AC2-8 | S11.1-AC2 Đủ 15 chủ đề mà thiếu hai từ thì báo lỗi nêu đủ hai từ | Biên | QA chạy tay trên nhánh PR code cuối (đủ 15 chủ đề), bản sao repo không commit: bỏ thẻ từ mới của "爱" và "八" khỏi mọi bài Từ mới HSK 1 có hai từ này, chạy lệnh kiểm tra nội dung | Output có dòng "Độ phủ từ HSK 1: 99% (498/500)"; có một lỗi độ phủ nêu số từ thiếu là 2 và đủ "爱", "八"; lệnh kết thúc không thành công. Hoàn tác thay đổi sau khi chạy | không |
| TC-S11.1-AC2-9 | S11.1-AC2 Dưới 15 chủ đề mà thiếu từ thì chỉ cảnh báo | Chức năng | Dev chạy kiểm tra độ phủ trên nội dung thử có giai đoạn HSK 1 gồm 3 chủ đề, bài Từ mới của 3 chủ đề đó có thẻ từ mới của 60 từ cấp 1 | Dòng độ phủ là "Độ phủ từ HSK 1: 12% (60/500)"; có cảnh báo nêu 440 từ chưa được phủ; không có lỗi độ phủ; lệnh kết thúc thành công | không |
| TC-S11.1-AC2-10 | S11.1-AC2 Chưa có bài HSK 1 nào thì độ phủ 0% và chỉ cảnh báo | Biên | Dev chạy kiểm tra độ phủ trên nội dung thử chỉ có bài Nhập môn | Dòng độ phủ là "Độ phủ từ HSK 1: 0% (0/500)"; có cảnh báo 500 từ chưa được phủ; không có lỗi độ phủ; lệnh kết thúc thành công | không |
| TC-S11.1-AC2-11 | S11.1-AC2 Dưới 15 chủ đề mà thiếu từ thì chỉ cảnh báo | Biên | QA chạy tay trên nhánh PR code đầu hoặc giữa (nội dung thật, giai đoạn HSK 1 chưa đủ 15 chủ đề), chạy lệnh kiểm tra nội dung | Output có dòng "Độ phủ từ HSK 1: <p>% (<n>/500)" với n < 500 và p không phải 100; có cảnh báo thiếu độ phủ kèm danh sách từ thiếu; không có lỗi độ phủ; lệnh kết thúc thành công (nếu không có lỗi khác) | không |

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| AC1: Giai đoạn HSK 1 có 15 chủ đề…, Mỗi chủ đề có 5 bài…, Tiêu đề bài…, Tên 15 chủ đề…, Bài Từ mới/Ngữ pháp/Hội thoại/Viết chữ có…, Bài Kiểm tra là bài kiểm tra cuối chủ đề, Bốn bài học thường… có câu chấm điểm, Mọi câu của 75 bài thuộc dạng màn bài đã hỗ trợ | Vitest trên nội dung đã build (không phải e2e) | Kiểm đủ 15 chủ đề × 5 bài, không lấy mẫu như case chạy tay; bật ở PR code cuối |
| AC1: Bản đồ lộ trình hiện giai đoạn HSK 1, Chủ đề HSK 1 chưa mở có nút Kiểm tra vượt cấp, Bài Kiểm tra là bài kiểm tra cuối chủ đề (luồng chủ đề 1) | Playwright trên bản build (e2e) | TC-S11.1-AC1-3, TC-S11.1-AC1-12, TC-S11.1-AC1-14 |
| AC2: mọi Scenario dùng nội dung thử | Vitest cạnh luật độ phủ của lệnh kiểm tra nội dung (không phải e2e) | Tên test chứa ID Scenario; QA đọc kết quả test khi nghiệm thu TC-S11.1-AC2-2…7, 9, 10 |
| AC2: Nội dung thật phủ 100% | Lệnh kiểm tra nội dung trong CI | TC-S11.1-AC2-1 |

Không có case Sáng/Tối: S11.1 không đổi giao diện (màn Lộ trình, màn bài dùng nguyên như đã nghiệm thu). TC-S11.1-AC1-4 kiểm màn Lộ
trình với tên chủ đề mới ở khổ 375; TC-S11.1-AC1-5 kiểm audio một chủ đề HSK 1 thật khi offline qua nút tải audio đã có (S8.4);
TC-S11.1-AC1-15 kiểm nút "Kiểm tra vượt cấp" trên chủ đề HSK 1 bằng bàn phím.
