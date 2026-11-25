# Test cases: S9.1 Tạo thẻ ôn tập

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Không có màn hiện thẻ**: S9.1 không có giao diện mới, người học chỉ thấy thẻ từ S9.2 (màn ôn tập) và S9.5 (thống kê). Vì vậy
  "danh sách thẻ ôn tập" trong các case dưới được kiểm như sau:
  - **e2e**: test đọc danh sách thẻ đã lưu trong trình duyệt từ phía test (cách đọc do dev ghi trong design.md), sau khi người học
    thao tác thật trên bản build. Bản build **không** có màn ẩn, công tắc hay tham số nào để xem thẻ.
  - **QA chạy tay** không nhìn thấy thẻ trên bản build. QA chỉ kiểm phần người học thấy được (màn tổng kết, nhãn "Đã xong" trên bản
    đồ, thông báo viết xong chữ, không có thông báo lỗi) và đọc kết quả e2e / Vitest cho phần danh sách thẻ.
  - Mỗi Scenario còn được dev kiểm ở tầng thấp hơn theo `spec-driven.md` §4 (bảng "Tầng test theo Scenario" cuối file).
- **Người học mới**: trình duyệt chưa có dữ liệu của app (xoá dữ liệu trang hoặc cửa sổ ẩn danh), qua màn chào mừng, chưa học bài
  nào, chưa viết chữ nào, chưa có thẻ nào.
- **"Xong bài"**: làm hết mọi câu của bài học thường, không bấm "Bỏ qua câu này" ở câu nào, tới màn tổng kết; trên bản đồ bài đó là
  "Đã xong". "Thoát bài" = rời màn học khi chưa làm hết các câu.
- **"Từ đã học xong"** (điều kiện thứ nhất của thẻ chiều viết, theo bảng trong spec): từ **đã có thẻ chiều nghĩa** (bất kể thẻ đó có từ
  đâu: xong bài trên máy này hay nhập từ file sao lưu), **hoặc** người học **đang làm xong** một bài học thường chứa từ (trong lượt làm
  bài đó). Bài chỉ "Đã xong" nhờ kiểm tra vượt cấp mà chưa làm, hoặc bài "Đã xong" mà từ chưa có thẻ chiều nghĩa (lưu lỗi, tiến độ có từ
  trước S9.1), **không** đủ. App không lưu thẻ có từ đâu. Mặc định các case AC2 làm bài thật để có điều kiện này (vd "xong bài mẫu B").
- **Nạp sẵn** (chỉ e2e, cách nạp do dev ghi trong design.md), dùng khi case cần trạng thái không dựng được bằng thao tác thật trước S9.2:
  - "Nạp sẵn đã học xong từ X": bài mẫu chứa X ở trạng thái "Đã xong" **và** thẻ X chiều nghĩa, chiều nghe đúng như khi người học làm
    xong bài đó (trạng thái "mới" trừ khi case ghi khác, ví dụ "đã ôn một lần" = trạng thái và ngày ôn tiếp theo cụ thể, khác thẻ mới).
    Case cần thẻ chiều nghĩa mà không có bài "Đã xong" (từ đã học xong chỉ nhờ thẻ) thì dựng bằng file sao lưu (vd `the-nihao`), không
    dùng "nạp sẵn".
  - "Nạp sẵn tiến độ bài": chỉ trạng thái bài trên bản đồ (mở / đã xong), không có thẻ và chữ đã viết nào; dùng để mở sẵn bài mẫu cần
    dùng, hoặc dựng "tiến độ có từ trước S9.1".
- **Thứ tự bài mẫu**: dev xếp lộ trình mẫu sao cho bài mỗi case cần đã "Đang mở" theo thứ tự thao tác trong case; nếu không, e2e nạp
  sẵn tiến độ bài để mở bài đó (không làm bài thành "Đã xong", không tạo thẻ).
- **Dữ liệu mẫu**: các từ trong case ("你好", "谢谢", "人", "妈"/"马", "你", "好") là từ của Scenario. e2e dùng bộ bài mẫu dev cung cấp
  cùng PR code (đường dẫn và tên bài người học thấy ghi trong design.md). Trong cột Các bước, bài được gọi theo mô tả dưới đây:
  - **Bài mẫu A (你好, 谢谢)**: bài đầu tiên của lộ trình mẫu; một câu về từ "你好" và một câu về từ "谢谢".
  - **Bài mẫu A' (你好, 谢谢, có câu bỏ qua được)**: câu về "你好", câu về "谢谢", và một câu viết chữ của một chữ không có dữ liệu nét
    (nạp qua bộ bài mẫu) nên màn học hiện nút "Bỏ qua câu này" thay cho khung viết. Bài này không thể "Đã xong".
  - **Bài mẫu B (人)**: câu về từ "人", không có câu viết chữ.
  - **Bài mẫu C (viết 人)**: câu 1 là câu viết chữ "人" (từ "人") trên khung có gợi ý; sau đó còn ít nhất một câu khác về từ "人" (không
    phải câu viết). Không có từ nào khác.
  - **Bài mẫu D (cặp âm 妈/马)**: có câu cặp âm giữa "妈" và "马".
  - **Bài mẫu E (chỉ câu)**: chỉ có câu nói theo một câu, không có câu nào về một từ.
  - **Bài mẫu F (你)**: câu về từ "你". **Bài mẫu G (你, 好)**: câu về từ "你" và câu về từ "好". **Bài mẫu H (你好)**: câu về từ "你好".
  - **Bài mẫu K (không nét)**: câu chọn thanh điệu và câu gõ pinyin về một từ có một chữ không có dữ liệu nét (dev chọn chữ, ghi trong
    design.md). **Không** có câu viết chữ nào.
  - **Chủ đề mẫu KT**: có các bài học thường và bài kiểm tra cuối chủ đề; bài kiểm tra có ít nhất một từ không xuất hiện ở bài thường
    nào của chủ đề.
  - **Chủ đề mẫu VC**: chủ đề chưa mở với người học mới, có bài kiểm tra vượt cấp; gồm **bài VC1 (你好)** (các câu về từ "你好", ít nhất
    2 câu, không có câu bỏ qua được) và **bài VC2 (人)** (các câu về từ "人", không có câu viết chữ). "人" không có ở bài VC1, "你好" không
    có ở bài VC2.
- **Viết xong chữ**: mở luyện viết chữ đó (màn xem thứ tự nét S6.1 → nút "Tập viết") hoặc gặp câu viết chữ trong bài, viết đúng hết
  các nét tới khi màn báo đã viết xong chữ (S6.2). **Viết dở**: viết đúng nét đầu, chưa tới nét cuối.
- **Giả lập lỗi lưu**: chỉ nằm trong test (e2e chặn việc ghi dữ liệu từ phía test, cách cụ thể ghi trong design.md). Có hai mức:
  "lỗi lưu" (chặn cả ghi nhận chữ đã viết và thẻ) và "lỗi lưu thẻ" (chỉ chặn ghi thẻ, chữ đã viết vẫn ghi nhận được). QA chạy tay không
  tạo được lỗi này trên bản build, chỉ xem kết quả e2e.
- **"Không có mạng"**: mở app khi có mạng, chờ tải xong, rồi tắt mạng (chế độ ngoại tuyến của trình duyệt).
- **Máy A / máy B** (case sao lưu): hai phiên trình duyệt tách dữ liệu (e2e) hoặc hai hồ sơ trình duyệt / hai máy (chạy tay). Máy B
  là "Người học mới" trừ khi case ghi khác. "Nhập" = Cài đặt → "Sao lưu tiến độ" → "Nhập tiến độ", chọn file, rồi bấm nút trong hộp xác
  nhận như S8.5.
- **File mẫu sao lưu** (dev cung cấp cùng PR code, đường dẫn ghi trong design.md; e2e dùng cùng bộ file). Mọi file dưới là bản định dạng
  mới, đúng định dạng app, phần không nêu là hợp lệ, trừ `ban-truoc-s9-1`:
  - `the-nihao`: chỉ có thẻ "你好" chiều nghĩa và chiều nghe (trạng thái "mới"), không có chữ đã viết; tiến độ bài: bài mẫu B "Đang mở"
    (chưa xong).
  - `the-sai-chieu`: một thẻ có chiều không phải nghĩa, nghe hay viết.
  - `the-trung`: có hai thẻ "你好" chiều nghĩa.
  - `chu-trung`: chữ "你" đã viết xuất hiện hai lần.
  - `the-tu-la`: đúng hai thẻ: "你好" chiều nghĩa và một thẻ chiều nghĩa của một từ không có trong nội dung app (dev chọn từ, ghi trong
    design.md); không có chữ đã viết.
  - `chu-la`: bài mẫu H (你好) "Đã xong"; thẻ "你好" chiều nghĩa và chiều nghe; chữ đã viết gồm "你" và một chữ không có trong nội dung app
    (không có "好").
  - `chu-khong-net`: bài mẫu K (không nét) "Đã xong"; thẻ chiều nghĩa và chiều nghe (trạng thái "mới") của từ trong bài mẫu K; chữ đã
    viết gồm mọi chữ của từ đó, kể cả chữ không có dữ liệu nét; không có thẻ chiều viết nào.
  - `ban-truoc-s9-1`: file do bản app trước S9.1 xuất (bản đang chạy trên `main` trước khi merge S9.1), có bài 1 (bài mẫu A) "Đã xong",
    không có thẻ và chữ đã viết.
- **Giả lập lỗi ghi khi nhập**: chỉ nằm trong test e2e (làm hỏng việc ghi giữa chừng sau khi bấm "Ghi đè"), giống "Giả lập lỗi đọc/ghi
  tiến độ" của S8.5. QA chạy tay không tạo được, chỉ xem kết quả e2e.

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (thao tác thật trên bản build, đọc danh sách thẻ từ phía test). `không` = QA
chạy tay mỗi lần nghiệm thu, hoặc chỉ kiểm được bằng Vitest (ghi rõ trong cột Các bước).

## AC1: Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.1-AC1-1 | S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢) | Màn tổng kết hiện; danh sách thẻ có đúng 4 thẻ: "你好" nghĩa, "你好" nghe, "谢谢" nghĩa, "谢谢" nghe; cả 4 ở trạng thái "mới" | e2e |
| TC-S9.1-AC1-2 | S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe | Offline | Người học mới; mở app, tắt mạng; xong bài mẫu A (你好, 谢谢) | Như TC-S9.1-AC1-1: đúng 4 thẻ ở trạng thái "mới", không có thông báo lỗi | e2e |
| TC-S9.1-AC1-3 | S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe | Chức năng | QA chạy tay trên bản build: người học mới, xong một bài học thật bất kỳ | Màn tổng kết hiện như trước S9.1, không có thông báo nào mới; trên bản đồ bài đó là "Đã xong" (phần thẻ xem kết quả TC-S9.1-AC1-1) | không |
| TC-S9.1-AC1-4 | S9.1-AC1 Học xong bài chưa có thẻ chiều viết | Chức năng | Người học mới (chưa từng viết "人"); xong bài mẫu B (人) | Có thẻ "人" nghĩa và "人" nghe; không có thẻ "人" chiều viết | e2e |
| TC-S9.1-AC1-5 | S9.1-AC1 Câu cặp âm tạo thẻ cho cả hai từ | Chức năng | Người học mới; xong bài mẫu D (câu cặp âm "妈"/"马" có đáp án là một trong hai từ) | Có thẻ nghĩa và nghe cho cả "妈" và "马" (4 thẻ), kể cả từ không phải đáp án | e2e |
| TC-S9.1-AC1-6 | S9.1-AC1 Câu nói theo câu không tạo thẻ | Chức năng | Người học mới; xong bài mẫu E (chỉ câu nói theo câu) | Màn tổng kết hiện; danh sách thẻ vẫn rỗng | e2e |
| TC-S9.1-AC1-7 | S9.1-AC1 Bài chưa xong không tạo thẻ | Chức năng | Người học mới; mở bài mẫu A (你好, 谢谢), làm 1 câu rồi thoát bài | Danh sách thẻ vẫn rỗng | e2e |
| TC-S9.1-AC1-8 | S9.1-AC1 Bài chưa xong không tạo thẻ | Biên | Người học mới; mở bài mẫu A' (你好, 谢谢, có câu bỏ qua được); trả lời câu về "你好" và câu về "谢谢", ở câu viết không hiện khung viết bấm "Bỏ qua câu này", làm tới cuối bài | Màn báo đã bỏ qua 1 câu và bài chưa hoàn thành; bài không thành "Đã xong"; danh sách thẻ vẫn rỗng (kể cả thẻ "你好", "谢谢" của câu đã trả lời) | e2e |
| TC-S9.1-AC1-9 | S9.1-AC1 Bài kiểm tra không tạo thẻ | Chức năng | Người học mới; xong mọi bài học thường của chủ đề mẫu KT để mở bài kiểm tra cuối chủ đề; ghi lại danh sách thẻ trước khi làm bài kiểm tra; làm hết bài kiểm tra, trả lời đúng mọi câu | Danh sách thẻ giống hệt lúc trước khi làm bài kiểm tra (cùng số thẻ, cùng từ, chiều, trạng thái); không có thẻ cho từ chỉ có trong bài kiểm tra | e2e |
| TC-S9.1-AC1-10 | S9.1-AC1 Bài kiểm tra không tạo thẻ | Chức năng | Người học mới; làm bài kiểm tra vượt cấp của chủ đề mẫu VC, trả lời đúng mọi câu | Danh sách thẻ vẫn rỗng | e2e |
| TC-S9.1-AC1-11 | S9.1-AC1 Bài được mở nhờ kiểm tra vượt cấp không tạo thẻ | Chức năng | Người học mới; làm và đạt bài kiểm tra vượt cấp của chủ đề mẫu VC; trên bản đồ mọi bài của chủ đề đó là "Đã xong", người học chưa làm bài nào trong đó | Danh sách thẻ rỗng: không có thẻ cho "你好", "人" hay từ nào khác của chủ đề mẫu VC | e2e |
| TC-S9.1-AC1-12 | S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ | Chức năng | Tiếp TC-S9.1-AC1-11 (chưa có thẻ nào): mở bài VC1 (你好) (đang "Đã xong") và làm hết, không bỏ qua câu nào | Màn tổng kết hiện; có thẻ "你好" nghĩa và "你好" nghe, trạng thái "mới"; không có thẻ "人" (chỉ có ở bài VC2) | e2e |
| TC-S9.1-AC1-13 | S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ | Biên | Như TC-S9.1-AC1-11, rồi mở bài VC1 (你好), làm 1 câu rồi thoát bài | Bài VC1 vẫn "Đã xong" trên bản đồ; danh sách thẻ vẫn rỗng | e2e |
| TC-S9.1-AC1-14 | S9.1-AC1 Làm lại bài đã xong không tạo trùng thẻ | Chức năng | Nạp sẵn đã học xong từ "你好" qua bài mẫu H (你好), với thẻ "你好" nghĩa đã ôn một lần và thẻ "你好" nghe trạng thái "mới". Làm lại và xong bài mẫu H | Vẫn chỉ có một thẻ "你好" nghĩa và một thẻ "你好" nghe; thẻ "你好" nghĩa giữ nguyên trạng thái và ngày ôn tiếp theo như lúc nạp; thẻ "你好" nghe vẫn "mới" | e2e |
| TC-S9.1-AC1-15 | S9.1-AC1 Từ đã có thẻ từ bài khác | Chức năng | Người học mới; xong bài mẫu F (你); rồi xong bài mẫu G (你, 好) | Có thêm thẻ "好" nghĩa và "好" nghe; vẫn chỉ có một thẻ "你" nghĩa và một thẻ "你" nghe (tổng 4 thẻ) | e2e |
| TC-S9.1-AC1-16 | S9.1-AC1 Không lưu được thẻ thì bài vẫn xong | Chức năng | Người học mới; giả lập lỗi lưu thẻ; xong bài mẫu H (你好) | Màn tổng kết hiện bình thường, không có thông báo lỗi nào; trên bản đồ bài mẫu H là "Đã xong"; danh sách thẻ không có thẻ "你好" | e2e |
| TC-S9.1-AC1-17 | S9.1-AC1 Thẻ còn thiếu được tạo ở lần xong bài sau | Chức năng | Tiếp TC-S9.1-AC1-16: bỏ giả lập lỗi; làm lại và xong bài mẫu H (你好) | Có thẻ "你好" nghĩa và "你好" nghe, trạng thái "mới" | e2e |
| TC-S9.1-AC1-30 | S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ | Chức năng | Nạp sẵn tiến độ bài: bài mẫu A (你好, 谢谢) "Đã xong", không có thẻ và chữ đã viết nào (như tiến độ có từ trước S9.1). Mở app, vào bản đồ; kiểm danh sách thẻ; rồi làm lại bài mẫu A hết, không bỏ qua câu nào | Sau khi mở app: bài mẫu A vẫn "Đã xong", danh sách thẻ rỗng. Sau khi làm lại: có đúng 4 thẻ "你好"/"谢谢" chiều nghĩa và nghe, trạng thái "mới" | e2e |
| TC-S9.1-AC1-31 | S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ | Chức năng | Người học mới; nhập file `ban-truoc-s9-1`, bấm "Ghi đè"; tải lại app; kiểm danh sách thẻ; rồi làm lại bài mẫu A (你好, 谢谢) hết, không bỏ qua câu nào | Sau khi nhập và tải lại: bài mẫu A "Đã xong", danh sách thẻ rỗng. Sau khi làm lại: có đúng 4 thẻ "你好"/"谢谢" chiều nghĩa và nghe, trạng thái "mới" | e2e |
| TC-S9.1-AC1-32 | S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ | Chức năng | QA chạy tay: trên cùng trình duyệt và cùng địa chỉ, dùng bản app trước S9.1 xong ít nhất 1 bài; rồi mở bản build S9.1 (app cập nhật), vào bản đồ | Bài đã xong trước đó vẫn "Đã xong", không mất tiến độ, không có thông báo lỗi hay thông báo mới (phần "không có thẻ" xem kết quả TC-S9.1-AC1-30) | không |

## AC2: Thẻ chiều viết chỉ tạo sau khi từ đã được viết theo nét

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.1-AC2-1 | S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết | Chức năng | Người học mới; xong bài mẫu B (人) (có thẻ "人" nghĩa và nghe); mở luyện viết chữ "人", viết đúng hết các nét | Màn báo đã viết xong chữ; danh sách thẻ có thẻ "人" chiều viết, trạng thái "mới" | e2e |
| TC-S9.1-AC2-2 | S9.1-AC2 Viết xong ở câu viết trong bài cũng tính | Chức năng | Người học mới; xong bài mẫu B (人); mở bài mẫu C (viết 人), ở câu 1 viết đúng hết các nét chữ "人"; thoát bài ngay sau câu đó (bài mẫu C chưa xong) | Có thẻ "人" chiều viết, trạng thái "mới", ngay sau câu viết, không cần xong bài mẫu C | e2e |
| TC-S9.1-AC2-3 | S9.1-AC2 Viết trước rồi học xong sau | Chức năng | Người học mới; mở luyện viết chữ "人", viết xong; kiểm danh sách thẻ; rồi xong bài mẫu B (人) | Sau khi viết xong: chưa có thẻ nào của "人". Sau khi xong bài: có thẻ "人" nghĩa, nghe và chiều viết | e2e |
| TC-S9.1-AC2-4 | S9.1-AC2 Từ nhiều chữ cần viết xong mọi chữ | Chức năng | Người học mới; xong bài mẫu H (你好); luyện viết xong chữ "你"; kiểm danh sách thẻ; tải lại app, luyện viết xong chữ "好" | Sau chữ "你": không có thẻ "你好" chiều viết. Sau chữ "好" (lần mở app sau): có thẻ "你好" chiều viết, "mới" | e2e |
| TC-S9.1-AC2-5 | S9.1-AC2 Chữ đã viết dùng chung cho các từ | Chức năng | Người học mới; luyện viết xong chữ "你", rồi chữ "好"; rồi xong bài mẫu H (你好) | Có thẻ "你好" chiều viết (cùng thẻ "你好" nghĩa và nghe) | e2e |
| TC-S9.1-AC2-6 | S9.1-AC2 Chữ đã viết dùng chung cho các từ | Biên | Tiếp TC-S9.1-AC2-5: xong bài mẫu G (你, 好), không viết thêm chữ nào | Có thẻ chiều viết cho cả "你" và "好" (lần viết trước được dùng lại cho từ khác) | e2e |
| TC-S9.1-AC2-7 | S9.1-AC2 Viết dở không tính | Chức năng | Người học mới; xong bài mẫu B (人); mở luyện viết chữ "人", viết đúng nét đầu rồi thoát màn luyện viết | Không có thẻ "人" chiều viết | e2e |
| TC-S9.1-AC2-8 | S9.1-AC2 Viết dở không tính | Biên | Người học mới; xong bài mẫu B (人); mở bài mẫu C (viết 人), ở câu viết chữ "人" viết đúng nét đầu rồi thoát bài; rồi mở luyện viết chữ "人", viết đúng nét đầu rồi thoát màn luyện viết | Sau cả hai lần viết dở: không có thẻ "人" chiều viết (hai lần viết dở cộng lại không thành viết xong) | e2e |
| TC-S9.1-AC2-9 | S9.1-AC2 Viết không gợi ý không tính | Chức năng | Chỉ kiểm tầng quy tắc (Vitest), theo chính Scenario: không dựng được trên app thật. Đầu vào quy tắc tạo thẻ: từ "人" đã học xong, chữ "人" chưa có lần viết xong nào trên khung có gợi ý, có một lần viết xong chữ "人" ở chế độ không gợi ý | Quy tắc cho kết quả: không có thẻ "人" chiều viết. QA đọc kết quả Vitest, không chạy trên bản build | không |
| TC-S9.1-AC2-10 | S9.1-AC2 Viết lại không tạo trùng thẻ chiều viết | Chức năng | Nạp sẵn đã học xong từ "人" qua bài mẫu B (人), chữ "人" đã viết, và thẻ "人" chiều viết đã ôn một lần (trạng thái và ngày ôn tiếp theo cụ thể, khác thẻ mới); luyện viết xong chữ "人" thêm một lần | Vẫn chỉ có một thẻ "人" chiều viết, giữ nguyên trạng thái và ngày ôn tiếp theo như lúc nạp | e2e |
| TC-S9.1-AC2-11 | S9.1-AC2 Từ có chữ không có dữ liệu nét | Chức năng | Người học mới; xong bài mẫu K (không nét) (câu chọn thanh điệu và gõ pinyin, không có câu viết) | Có thẻ nghĩa và nghe của từ đó; không có thẻ chiều viết của từ đó | e2e |
| TC-S9.1-AC2-12 | S9.1-AC2 Viết xong chữ vẫn báo xong khi không lưu được | Chức năng | Người học mới; xong bài mẫu B (人); giả lập lỗi lưu; luyện viết xong chữ "人" | Màn báo đã viết xong chữ như bình thường, nút "Viết lại" vẫn dùng được, không có thông báo lỗi; không có thẻ "人" chiều viết | e2e |
| TC-S9.1-AC2-13 | S9.1-AC2 Viết xong chữ vẫn báo xong khi không lưu được | Chức năng | QA chạy tay trên bản build: luyện viết xong chữ "人" và một câu viết chữ trong một bài thật | Thông báo viết xong chữ và các nút sau khi viết xong giống trước S9.1, không có thông báo nào mới (phần thẻ xem kết quả e2e) | không |
| TC-S9.1-AC2-16 | S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết | Chức năng | Người học mới; làm và đạt bài kiểm tra vượt cấp của chủ đề mẫu VC (bài VC2 (人) thành "Đã xong", chưa làm); mở luyện viết chữ "人", viết đúng hết các nét | Màn báo đã viết xong chữ; danh sách thẻ không có thẻ nào của "人" (không nghĩa, không nghe, không viết) | e2e |
| TC-S9.1-AC2-17 | S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết | Biên | Tiếp TC-S9.1-AC2-16: mở bài VC2 (人) và làm hết, không bỏ qua câu nào | Có thẻ "人" chiều nghĩa, chiều nghe và chiều viết, cả ba "mới" (chữ "人" viết ở bước trước được tính khi từ trở thành đã học xong) | e2e |
| TC-S9.1-AC2-18 | S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều | Chức năng | Người học mới; xong bài mẫu C (viết 人): ở câu viết chữ "人" viết đúng hết các nét, làm hết các câu còn lại, không bỏ qua câu nào | Màn tổng kết hiện; danh sách thẻ có đúng 3 thẻ: "人" nghĩa, "人" nghe, "人" viết, cả ba "mới" | e2e |
| TC-S9.1-AC2-19 | S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều | Offline | Như TC-S9.1-AC2-18 nhưng mở app rồi tắt mạng trước khi vào bài | Như TC-S9.1-AC2-18; không có thông báo lỗi | e2e |
| TC-S9.1-AC2-20 | S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau | Chức năng | Tiếp TC-S9.1-AC2-12: bỏ giả lập lỗi; luyện viết xong chữ "人" thêm một lần | Có thẻ "人" chiều viết, trạng thái "mới" | e2e |
| TC-S9.1-AC2-21 | S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau | Biên | Tiếp TC-S9.1-AC2-12 (lần viết lỗi lưu, chưa viết lại): bỏ giả lập lỗi; làm lại và xong bài mẫu B (人), không viết chữ "人" thêm lần nào | Không có thẻ "人" chiều viết (lần viết không lưu được không được tính) | e2e |
| TC-S9.1-AC2-22 | S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần xong bài sau | Chức năng | Người học mới; xong bài mẫu B (人); giả lập lỗi lưu thẻ (chữ đã viết vẫn ghi nhận được); luyện viết xong chữ "人"; kiểm danh sách thẻ; bỏ giả lập; làm lại và xong bài mẫu B, không viết thêm | Sau khi viết: không có thẻ "人" chiều viết, không có thông báo lỗi. Sau khi xong bài lần hai: có thẻ "人" chiều viết, "mới"; vẫn chỉ một thẻ "人" nghĩa và một thẻ "人" nghe | e2e |
| TC-S9.1-AC2-25 | S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết | Biên | Chỉ kiểm tầng quy tắc (Vitest), theo dòng "Đã có thẻ chiều nghĩa → Có" của bảng "Từ đã học xong" trong spec. Đầu vào quy tắc tạo thẻ: từ "你好" đã có thẻ chiều nghĩa và chiều nghe (vd có từ file sao lưu), không có bài nào chứa "你好" "Đã xong" và không đang làm bài nào; chữ "你" đã viết xong trên khung có gợi ý; vừa viết xong chữ "好" trên khung có gợi ý | Quy tắc cho kết quả: tạo thẻ "你好" chiều viết, trạng thái "mới" (có thẻ chiều nghĩa là đủ điều kiện thứ nhất, không cần bài "Đã xong"). QA đọc kết quả Vitest | không |

## S6.2 sửa đổi: viết xong chữ được ghi nhận (capability `stroke-guided-writing`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.2-AC1-33 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Chức năng | Người học mới; mở luyện viết chữ "人", viết đúng hết các nét | Màn báo đã viết xong chữ; người học ở lại màn; có nút "Viết lại"; không có điểm, phần trăm hay thông báo "đã lưu" nào hiện ra; bấm "Viết lại" thì khung chỉ còn nét mờ như S6.2 | e2e |
| TC-S6.2-AC1-34 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Chức năng | QA chạy tay trên bản build S9.1, khổ 375×812 và 1280×800, giao diện sáng và tối: luyện viết xong chữ "十" | Màn báo xong, nút "Viết lại" và bố cục giống trước S9.1 ở cả 4 tổ hợp; không có điểm hay thông báo mới | không |

Hồi quy: chạy lại TC-S6.2-AC1-11, -12, -13, -15 của S6.2 (`openspec/changes/archive/2026-11-17-s6-2-guided-writing/test-cases.md`) trên
bản build S9.1, kết quả như case gốc. Các Scenario S6.2 khác trong Requirement được chép lại không đổi văn bản.

## Sao lưu thẻ và chữ đã viết (yêu cầu bổ sung, sửa capability `progress-backup`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.1-AC1-18 | S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ | Chức năng | Máy A nạp sẵn đã học xong từ "你好" qua bài mẫu H (你好), với thẻ "你好" nghĩa đã ôn một lần và thẻ "你好" nghe trạng thái "mới"; bấm "Xuất tiến độ". Máy B (Người học mới, chưa có thẻ): nhập file đó, bấm "Ghi đè" | Máy B báo "Đã nhập tiến độ."; danh sách thẻ máy B có đúng 2 thẻ: "你好" nghĩa với trạng thái và ngày ôn tiếp theo như lúc nạp ở máy A, "你好" nghe trạng thái "mới" | e2e |
| TC-S9.1-AC1-19 | S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ | Chức năng | Như TC-S9.1-AC1-18, mở file vừa xuất ở máy A | File có đúng 2 thẻ "你好" (chiều nghĩa, chiều nghe), mỗi thẻ có trạng thái và ngày ôn tiếp theo như lúc nạp | e2e |
| TC-S9.1-AC1-20 | S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ | Chức năng | Máy A Người học mới, xong bài mẫu A (你好, 谢谢) (thẻ tạo bằng thao tác thật), bấm "Xuất tiến độ"; máy B nhập, bấm "Ghi đè" | Danh sách thẻ máy B có đúng 4 thẻ "你好"/"谢谢" chiều nghĩa và nghe, trạng thái "mới" | e2e |
| TC-S9.1-AC1-21 | S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ | Offline | Như TC-S9.1-AC1-20 nhưng cả máy A và máy B đều không có mạng khi xuất và nhập | Kết quả như TC-S9.1-AC1-20; không có thông báo lỗi | e2e |
| TC-S9.1-AC1-22 | S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ | Chức năng | QA chạy tay trên bản build: máy A xong một bài học thật, bấm "Xuất tiến độ"; máy B nhập file đó | Mục "Sao lưu tiến độ", hộp xác nhận nhập (không có thêm số thẻ) và các thông báo giống S8.5, không có gì mới; máy B báo "Đã nhập tiến độ." và bài đó "Đã xong" (phần thẻ xem kết quả e2e) | không |
| TC-S9.1-AC1-23 | S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢) (có thẻ "谢谢" nghĩa và nghe); nhập file `the-nihao`, bấm "Ghi đè" | Báo "Đã nhập tiến độ."; danh sách thẻ chỉ có "你好" nghĩa và "你好" nghe; không còn thẻ "谢谢" | e2e |
| TC-S9.1-AC1-24 | S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy | Biên | Người học mới; xong bài mẫu B (人), luyện viết xong chữ "人" (có thẻ "人" chiều viết); nhập file `the-nihao`, bấm "Ghi đè"; kiểm danh sách thẻ; rồi xong bài mẫu B (đang mở theo file) | Ngay sau khi nhập: không còn thẻ nào của "人". Sau khi xong bài mẫu B: có thẻ "人" nghĩa và nghe, không có thẻ "人" chiều viết (chữ "人" đã viết trên máy không còn sau khi nhập) | e2e |
| TC-S9.1-AC1-25 | S9.1-AC1 (bổ sung) Hủy nhập thì thẻ không đổi | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢); ghi lại danh sách thẻ; chọn file `the-nihao`, ở hộp xác nhận bấm "Hủy" | Không có thông báo đã nhập; danh sách thẻ giống hệt lúc trước (4 thẻ "你好"/"谢谢" nghĩa và nghe) | e2e |
| TC-S9.1-AC1-26 | S9.1-AC1 (bổ sung) Ghi lỗi giữa chừng thì giữ nguyên thẻ | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢); ghi lại danh sách thẻ; giả lập lỗi ghi khi nhập; chọn file `the-nihao`, bấm "Ghi đè" | Màn báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên."; danh sách thẻ giống hệt lúc trước; bài mẫu A vẫn "Đã xong" | e2e |
| TC-S9.1-AC1-27 | S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢); ghi lại danh sách thẻ; chọn file `the-sai-chieu` | Màn báo "File tiến độ bị hỏng, không nhập được."; không có hộp xác nhận; màn Lộ trình vẫn như trước (bài mẫu A "Đã xong"); danh sách thẻ giống hệt lúc trước | e2e |
| TC-S9.1-AC1-28 | S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ | Chức năng | Người học mới; xong bài mẫu B (人) (có thẻ "人" nghĩa và nghe); chọn file `ban-truoc-s9-1` | Hộp xác nhận hiện như S8.5 (nhập được, không báo file hỏng hay bản mới hơn); bấm "Ghi đè" thì báo "Đã nhập tiến độ."; màn Lộ trình hiện bài 1 (bài mẫu A) "Đã xong"; danh sách thẻ rỗng | e2e |
| TC-S9.1-AC1-29 | S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ | Chức năng | QA chạy tay: trước khi deploy S9.1, xuất một file thật từ bản app hiện tại (có ít nhất 1 bài "Đã xong"); trên bản build S9.1 nhập file đó, bấm "Ghi đè" | Báo "Đã nhập tiến độ."; màn Lộ trình hiện đúng các bài "Đã xong" như trong file; không có thông báo lỗi | không |
| TC-S9.1-AC1-33 | S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢); ghi lại danh sách thẻ; chọn file `the-trung` | Màn báo "File tiến độ bị hỏng, không nhập được."; không có hộp xác nhận; màn Lộ trình vẫn như trước; danh sách thẻ giống hệt lúc trước (vẫn có "谢谢" nghĩa và nghe) | e2e |
| TC-S9.1-AC1-34 | S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được | Chức năng | Người học mới; nhập file `the-tu-la`, bấm "Ghi đè" | Báo "Đã nhập tiến độ."; danh sách thẻ có đúng 2 thẻ như trong file ("你好" nghĩa và thẻ của từ không có trong app), trạng thái và ngày ôn tiếp theo như trong file; app không báo lỗi khi mở Trang chủ và màn Lộ trình | e2e |
| TC-S9.1-AC1-35 | S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được | Biên | Tiếp TC-S9.1-AC1-34: tải lại app, bấm "Xuất tiến độ", mở file vừa xuất | File vẫn có đúng 2 thẻ như file `the-tu-la`, kể cả thẻ của từ không có trong app | e2e |
| TC-S9.1-AC2-14 | S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết | Chức năng | Máy A Người học mới, nạp sẵn tiến độ bài để bài mẫu H (你好) "Đang mở" (chưa xong); xong bài mẫu B (人), luyện viết xong chữ "人" (có thẻ "人" chiều viết), luyện viết xong chữ "你", không viết chữ "好"; bấm "Xuất tiến độ". Máy B: nhập file, bấm "Ghi đè"; kiểm danh sách thẻ; xong bài mẫu H (đang mở theo file); kiểm danh sách thẻ; rồi luyện viết xong chữ "好" | Ngay sau khi nhập: có thẻ "人" chiều viết. Sau khi xong bài mẫu H: có thẻ "你好" nghĩa và nghe, chưa có thẻ "你好" chiều viết. Sau khi viết xong "好": có thẻ "你好" chiều viết (chữ "你" viết ở máy A vẫn được tính) | e2e |
| TC-S9.1-AC2-15 | S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết | Chức năng | Như phần máy A của TC-S9.1-AC2-14; mở file vừa xuất | File có thẻ "人" chiều viết; có chữ "人" và chữ "你" là đã viết xong; không có chữ "好" | e2e |
| TC-S9.1-AC2-23 | S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file | Chức năng | Người học mới; xong bài mẫu A (你好, 谢谢); ghi lại danh sách thẻ; chọn file `chu-trung` | Màn báo "File tiến độ bị hỏng, không nhập được."; không có hộp xác nhận; màn Lộ trình vẫn như trước; danh sách thẻ giống hệt lúc trước | e2e |
| TC-S9.1-AC2-24 | S9.1-AC2 (bổ sung) Chữ đã viết không có trong app không tạo thẻ | Chức năng | Người học mới; nhập file `chu-la`, bấm "Ghi đè" | Báo "Đã nhập tiến độ."; bài mẫu H (你好) "Đã xong"; danh sách thẻ có đúng thẻ "你好" nghĩa và nghe như trong file, không có thẻ "你好" chiều viết, không có thẻ nào khác | e2e |
| TC-S9.1-AC2-26 | S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ | Chức năng | Người học mới; nhập file `chu-khong-net`, bấm "Ghi đè" | Báo "Đã nhập tiến độ."; bài mẫu K (không nét) "Đã xong"; danh sách thẻ có đúng 2 thẻ: chiều nghĩa và chiều nghe của từ trong bài mẫu K, trạng thái và ngày ôn tiếp theo như trong file; không có thẻ chiều viết của từ đó, không có thẻ nào khác | e2e |
| TC-S9.1-AC2-27 | S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ | Biên | Tiếp TC-S9.1-AC2-26: tải lại app; làm lại và xong bài mẫu K, không bỏ qua câu nào; kiểm danh sách thẻ; bấm "Xuất tiến độ", mở file vừa xuất | Sau khi xong bài lần hai: vẫn chỉ 2 thẻ nghĩa và nghe của từ đó, không có thẻ chiều viết, không có thông báo lỗi. File vừa xuất vẫn có mọi chữ của từ là đã viết, kể cả chữ không có dữ liệu nét (giữ như trong file nhập) | e2e |

### Hồi quy các Scenario S8.5 được sửa

Requirement "File xuất chứa toàn bộ tiến độ" được sửa (thêm hai dòng thẻ và chữ đã viết vào bảng); văn bản các Scenario S8.5 không đổi.
Chạy lại case gốc của S8.5 (`openspec/changes/archive/2026-11-23-s8-5-progress-backup/test-cases.md`) trên bản build S9.1:

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S8.5-AC1-16 | S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ | Chức năng | Chạy lại case gốc | Như case gốc | e2e |
| TC-S8.5-AC1-19 | S8.5-AC1 File có số phút đã học từng ngày | Chức năng | Chạy lại case gốc | Như case gốc | e2e |
| TC-S8.5-AC1-20 | S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp | Chức năng | Chạy lại case gốc | Như case gốc; thêm: danh sách thẻ máy B rỗng (qua kiểm tra vượt cấp không tạo thẻ) | e2e |
| TC-S8.5-AC1-22 | S8.5-AC1 File có lựa chọn hiện pinyin | Chức năng | Chạy lại case gốc | Như case gốc | e2e |

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| AC1: Xong bài học thì tạo thẻ…, Học xong bài chưa có thẻ chiều viết, Câu cặp âm…, Câu nói theo câu… | Vitest quy tắc tạo thẻ (hàm thuần) + use case với dữ liệu thật trên trình duyệt giả | Từ nào của bài được tạo thẻ, chiều nào |
| AC1: Bài chưa xong…, Bài kiểm tra…, Bài được mở nhờ kiểm tra vượt cấp…, Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp…, Bài đã xong từ trước không được tạo bù thẻ | Vitest + Testing Library hook màn học; Vitest use case (mở app với tiến độ bài "Đã xong" không thẻ) | Chỉ gọi tạo thẻ khi bài học thường thành "Đã xong" do làm hết bài, chỉ cho từ của bài vừa làm; không có bước tạo bù khi mở app hay sau khi nhập |
| AC1: Làm lại bài đã xong…, Từ đã có thẻ từ bài khác | Vitest use case | Thẻ cũ giữ nguyên trạng thái, ngày ôn |
| AC1: Không lưu được thẻ…, Thẻ còn thiếu… | Vitest + Testing Library hook màn học (lưu bị lỗi) | Màn tổng kết vẫn hiện, không lỗi |
| AC2: Viết xong chữ…, Viết xong ở câu viết trong bài…, Làm hết bài có câu viết chữ…, Viết dở… | Vitest + Testing Library hook luyện viết và hook màn học | Chỉ ghi nhận khi viết xong hết nét; câu viết trong bài tính trong cùng lượt |
| AC2: Viết trước rồi học xong sau, Từ nhiều chữ…, Chữ đã viết dùng chung…, Từ có chữ không có dữ liệu nét, Bài được mở nhờ kiểm tra vượt cấp không đủ…, Viết không gợi ý… | Vitest quy tắc tạo thẻ chiều viết | Hai điều kiện; "từ đã học xong" = đã có thẻ chiều nghĩa (bất kể nguồn, kể cả từ file sao lưu, TC-S9.1-AC2-25) hoặc đang làm xong bài học thường chứa từ; bài chỉ "Đã xong" nhờ vượt cấp hoặc "Đã xong" mà chưa có thẻ chiều nghĩa thì không đủ. "Viết không gợi ý" chỉ kiểm ở tầng này |
| AC2: Viết xong chữ vẫn báo xong khi không lưu được, Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau / lần xong bài sau | Vitest + Testing Library hook luyện viết (lưu bị lỗi) + Vitest use case | Không có thông báo lỗi; lần viết lưu lỗi không tính |
| S6.2: Viết đúng hết các nét thì hoàn thành chữ (sửa đổi) | Testing Library màn luyện viết | Giao diện không đổi, có ghi nhận lần viết |
| Sao lưu (bổ sung): xuất/nhập thẻ và chữ đã viết, ghi đè, hủy, ghi lỗi, thẻ sai chiều, thẻ trùng, chữ đã viết trùng, thẻ/chữ không có trong app, chữ không có dữ liệu nét, file bản cũ | Vitest schema file sao lưu (bản mới và bản cũ) + use case sao lưu với `ProgressStore` giả | Tất cả hoặc không gì; file bản cũ hợp lệ |

Không có case A11y riêng: S9.1 không thêm hay đổi giao diện (kể cả mục "Sao lưu tiến độ"); TC-S9.1-AC1-3, TC-S9.1-AC1-32, TC-S9.1-AC2-13,
TC-S9.1-AC1-22 và TC-S6.2-AC1-34 (gồm Mobile 375 và Sáng/Tối của màn luyện viết) kiểm màn cũ không đổi.
