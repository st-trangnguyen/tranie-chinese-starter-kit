# Test cases: S9.4 Câu sai vào SRS

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/wrong-answer-review/spec.md`. Mọi
Scenario của spec mang ID `S9.4-AC1`, nên cột Scenario ghi thêm tên Scenario. Case thêm ở vòng sau lấy số tiếp theo (TC-…-56 trở đi) để giữ ID cũ, nên số
trong một mục có thể không liền nhau.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev), có code S9.1 và S9.2. Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong màn
  chào mừng, chưa học bài nào, chưa viết chữ nào, chưa có thẻ ôn tập nào, có mạng, trừ khi case nêu khác.
- **Không có giao diện mới**: S9.4 không thêm màn, nút hay chữ. Người học chỉ thấy kết quả ở màn ôn tập (S9.2). Vì vậy:
  - **e2e**: thao tác thật trên bản build, rồi **đọc thẻ từ phía test** (như S9.1/S9.2: danh sách thẻ đã lưu, mỗi thẻ có từ, chiều, trạng
    thái, thời điểm ôn tiếp theo). Bản build **không** có màn ẩn, công tắc hay tham số nào để nạp hoặc xem thẻ.
  - **QA chạy tay** không xem được danh sách thẻ. QA kiểm phần người học thấy: màn tổng kết, nhãn trên bản đồ, không có thông báo lỗi,
    và thẻ nào có trong phiên ôn tập (màn ôn tập hiện "Thẻ 1 / N", từng thẻ hiện từ của nó). Phần còn lại QA đọc kết quả e2e / Vitest.
- **Thẻ** viết là `"<từ>" <chiều>`, ví dụ `"你好" nghĩa`. "Mới" = chưa chấm lần nào (S9.1). "Đã chấm" = không còn "mới".
- **Nạp sẵn** (chỉ e2e, cách nạp thuộc phần test của PR code, như S9.1/S9.2):
  - "Nạp sẵn thẻ": đặt sẵn thẻ với trạng thái và thời điểm ôn tiếp theo cụ thể ("còn 10 ngày nữa mới tới hạn", "tới hạn từ 3 ngày trước").
    Thẻ nạp sẵn "đã chấm" có lần chấm gần nhất trước hôm nay, nên **hôm nay chưa ôn thẻ nào** (giới hạn mỗi ngày của S9.3 chưa dùng tới),
    trừ khi case nêu khác.
  - "Nạp sẵn tiến độ bài": chỉ trạng thái bài trên bản đồ (mở / đã xong), không có thẻ và chữ đã viết nào; dùng để mở bài kiểm tra cuối
    chủ đề mẫu mà không làm các bài học thường (nên không có thẻ nào từ S9.1).
- **Đồng hồ cố định / tua đồng hồ** (chỉ e2e): test giữ đồng hồ trình duyệt ở thời điểm biết trước. **"Lúc xong bài"** = thời điểm đồng
  hồ khi người học trả lời câu cuối và màn tổng kết hiện. "Đến hạn" = thời điểm ôn tiếp theo không muộn hơn hiện tại.
- **Dựng trạng thái khi chạy tay**: thẻ "mới" dựng bằng xong bài học thật (S9.1); thẻ "đã chấm, chưa tới hạn" dựng bằng mở màn ôn tập và
  chấm "Dễ" (hạn từ 1 ngày trở lên, S9.2). Trạng thái cần ngày cụ thể (10 ngày, quá hạn 3 ngày) QA không dựng được, chỉ đọc kết quả e2e.
- **Giả lập lỗi** (chỉ e2e / Vitest): "lỗi lưu thẻ" = test chặn mọi lần ghi thẻ ôn tập, kết quả bài vẫn ghi được; "lỗi lưu thẻ một phần"
  = test chỉ chặn việc ghi các thẻ được nêu (theo từ và chiều), các thẻ khác ghi được; "lỗi lưu tiến độ" = test chặn việc ghi kết quả bài
  (như S3.4); "thẻ đọc không được" (chỉ Vitest, lưu trữ giả) = thẻ đã lưu nhưng dữ liệu hỏng, như "Thẻ bị bỏ qua" của S9.2. QA chạy tay
  không tạo được, chỉ đọc kết quả e2e / Vitest.
- **"Không có mạng"**: mở app khi có mạng, chờ tải xong (gồm bài kiểm tra cần dùng), rồi bật chế độ Offline của trình duyệt (máy tính)
  hoặc chế độ máy bay (điện thoại).
- **Dữ liệu mẫu** (dev cung cấp cùng PR code, tên người học thấy ghi trong design.md; e2e dùng đúng bộ này). Từ: "你好", "谢谢", "人",
  "妈" / "马", "你", "好". Bài học thường mẫu dùng lại của S9.1: **bài mẫu H (你好)** và **bài mẫu C (viết 人)** (câu 1 là câu viết chữ
  "人" trên khung có gợi ý, sau đó ít nhất một câu khác về "人"). Thêm **bài mẫu R (人, không viết)**: bài học thường **chỉ có từ "人"**
  (không có từ nào khác), **không** có câu viết chữ "人" (dùng để kiểm chữ đã viết ở bài kiểm tra được giữ cho lần sau).
  - **Chủ đề mẫu KT4**, bài kiểm tra cuối chủ đề **bài T** (10 câu, sai 1 câu = 90%, sai 2 câu = 80%, sai 3 câu = 70%):

    | Câu | Dạng | Từ |
    |---|---|---|
    | T1 | Chọn thanh điệu | "你好" |
    | T2 | Chọn thanh điệu | "谢谢" |
    | T3 | Gõ pinyin | "你好" |
    | T4 | Cặp âm | "妈" và "马" |
    | T5 | Nói theo từ | "谢谢" |
    | T6 | Nói theo một câu | (không gắn từ) |
    | T7 | Chọn thanh điệu | "人" |
    | T8 | Chọn thanh điệu | "你" |
    | T9 | Gõ pinyin | "人" |
    | T10 | Chọn thanh điệu | "好" |

  - **Bài T-BQ**: như bài T, thêm câu T11 về "谢谢" ở dạng bài chưa có (màn học hiện nút "Bỏ qua câu này"). Dùng ở chủ đề mẫu KT4b
    (giống KT4, chỉ khác bài kiểm tra).
  - **Bài T-V**: như bài T, chỉ thay câu T10 bằng câu viết chữ "人" trên khung có gợi ý (10 câu, cách tính % như bài T; câu viết không bao
    giờ sai). Dùng ở chủ đề mẫu KT4c (giống KT4, chỉ khác bài kiểm tra). Ở bài T-V, câu về "人" là T7, T9 (chọn thanh điệu, gõ
    pinyin) và T10 (viết); sai T1, T2, T8 = 70% chưa đạt mà không sai câu nào về "人".
  - **Bài T-VĐ**: như bài T, chỉ thay câu T1 bằng câu viết chữ "人" trên khung có gợi ý (câu viết đứng **đầu** bài, để viết xong chữ
    rồi thoát giữa bài được; ở bài T-V câu viết là câu cuối nên viết xong là hết bài). Dùng ở chủ đề mẫu KT4d (giống KT4, chỉ khác bài
    kiểm tra).
  - **Chủ đề mẫu VC4**: chủ đề chưa mở, đứng sau chủ đề đang học, có nút "Kiểm tra vượt cấp"; **bài V** 5 câu (sai 1 câu = 80% đạt, sai
    2 câu = 60% chưa đạt): V1 chọn thanh điệu "谢谢", V2 chọn thanh điệu "你", V3 gõ pinyin "你", V4 và V5 về từ khác do dev chọn
    (không phải "谢谢", "你").
- **"Làm xong bài kiểm tra"** = trả lời hết các câu tới khi màn tổng kết hiện. **"Sai Tn"** = chọn / gõ đáp án sai ở câu Tn (ở câu nói:
  tự chấm "Chưa đúng" trừ khi case ghi "Gần đúng"); các câu không nêu trả lời đúng (câu nói tự chấm "Đúng"). **"Thoát giữa bài"** = rời màn
  học khi chưa làm hết các câu. **"Viết dở"** = ở câu viết, viết đúng nét 1 của chữ "人" (chữ có 2 nét) rồi thoát, chưa viết nét 2.
- **"Viết xong chữ"**: mở luyện viết chữ (màn xem thứ tự nét S6.1 → nút "Tập viết"), viết đúng hết các nét tới khi màn báo đã viết xong
  (S6.2).

**Cột Tự động**: `e2e` = đưa vào Playwright trong PR code (thao tác thật trên bản build, có thể nạp sẵn, cố định đồng hồ, giả lập lỗi,
đọc thẻ từ phía test). `không` = QA chạy tay mỗi lần nghiệm thu, hoặc chỉ kiểm được bằng Vitest (ghi rõ trong cột Các bước).

## Câu sai trong bài kiểm tra tạo thẻ hoặc đưa thẻ về ôn sớm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-1 | S9.4-AC1 Câu sai về từ chưa có thẻ thì tạo thẻ nghĩa và nghe | Chức năng | Nạp sẵn tiến độ bài mở bài T (chưa có thẻ nào); làm xong bài T, sai T2 | Màn tổng kết hiện "Bạn đã đạt", "Sai 1 câu"; danh sách thẻ có đúng 2 thẻ: "谢谢" nghĩa và "谢谢" nghe, cả hai "mới"; không có thẻ chiều viết | e2e |
| TC-S9.4-AC1-2 | S9.4-AC1 Câu sai về từ đã có thẻ thì đưa thẻ về ôn sớm, không tạo thêm | Chức năng | Nạp sẵn thẻ "你好" nghĩa và "你好" nghe đã chấm "Được", còn 10 ngày nữa mới tới hạn, hôm nay chưa ôn thẻ nào; nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1; mở màn ôn tập | Danh sách thẻ vẫn chỉ có một "你好" nghĩa và một "你好" nghe (tổng 2 thẻ); cả hai đến hạn; màn ôn tập hiện "Thẻ 1 / 2", phiên có "你好" nghĩa và "你好" nghe | e2e |
| TC-S9.4-AC1-3 | S9.4-AC1 Từ có thẻ chiều nghĩa nhưng thiếu thẻ chiều nghe | Chức năng | Nạp sẵn chỉ thẻ "你好" nghĩa đã chấm, còn 10 ngày nữa mới tới hạn (không có "你好" nghe); nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1 | Danh sách thẻ có "你好" nghe "mới"; vẫn một thẻ "你好" nghĩa, trạng thái đã chấm như lúc nạp, đã đến hạn; tổng 2 thẻ | e2e |
| TC-S9.4-AC1-4 | S9.4-AC1 Câu đúng không đổi thẻ | Chức năng | Nạp sẵn thẻ "你好" nghĩa còn 10 ngày nữa mới tới hạn (chưa có thẻ "谢谢"); nạp sẵn tiến độ mở bài T; làm xong bài T, đúng mọi câu | Màn tổng kết hiện "100%", "Bạn đã đạt"; danh sách thẻ chỉ có "你好" nghĩa, thời điểm ôn tiếp theo như lúc nạp (còn 10 ngày) | e2e |

## Câu nào là câu sai và thuộc từ nào

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-5 | S9.4-AC1 Câu cặp âm sai xử lý cả hai từ | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, sai T4 (chọn sai ở câu cặp âm "妈"/"马") | Danh sách thẻ có đúng 4 thẻ: "妈" nghĩa, "妈" nghe, "马" nghĩa, "马" nghe, cả bốn "mới" | e2e |
| TC-S9.4-AC1-6 | S9.4-AC1 Câu nói theo từ tự chấm Gần đúng là câu sai | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, ở T5 tự chấm "Gần đúng", mọi câu khác đúng | Danh sách thẻ có đúng 2 thẻ "谢谢" nghĩa và "谢谢" nghe, "mới" | e2e |
| TC-S9.4-AC1-7 | S9.4-AC1 Câu nói theo từ tự chấm Gần đúng là câu sai | Biên | Như TC-S9.4-AC1-6 nhưng T5 tự chấm "Chưa đúng" | Như TC-S9.4-AC1-6 | e2e |
| TC-S9.4-AC1-8 | S9.4-AC1 Câu nói theo câu sai không tạo thẻ | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T6 (tự chấm "Chưa đúng") | Màn tổng kết hiện "Sai 1 câu"; danh sách thẻ rỗng | e2e |
| TC-S9.4-AC1-9 | S9.4-AC1 Câu nói theo câu sai không tạo thẻ | Biên | Như TC-S9.4-AC1-8 nhưng T6 tự chấm "Gần đúng" | Danh sách thẻ rỗng | e2e |
| TC-S9.4-AC1-10 | S9.4-AC1 Câu bỏ qua không phải câu sai | Chức năng | Nạp sẵn tiến độ mở bài T-BQ; làm hết bài, bấm "Bỏ qua câu này" ở T11 (về "谢谢"), mọi câu còn lại đúng | Màn tổng kết hiện thông báo đã bỏ qua 1 câu, "Sai 0 câu"; danh sách thẻ rỗng | e2e |
| TC-S9.4-AC1-11 | Bảng "Câu nào là câu sai": Gõ pinyin chấm "Sai" | Biên | Nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T9 (gõ pinyin sai cho "人") | Danh sách thẻ có đúng 2 thẻ "人" nghĩa và "人" nghe, "mới" | e2e |

## Một từ sai nhiều câu chỉ xử lý một lần

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-12 | S9.4-AC1 Một từ sai nhiều câu chỉ có một thẻ mỗi chiều | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1 (chọn thanh "你好") và T3 (gõ pinyin "你好") | Danh sách thẻ có đúng 2 thẻ: một "你好" nghĩa và một "你好" nghe, "mới" | e2e |
| TC-S9.4-AC1-13 | S9.4-AC1 Một từ sai nhiều câu chỉ có một thẻ mỗi chiều | Biên | Nạp sẵn thẻ "谢谢" nghĩa và "谢谢" nghe đã chấm, còn 10 ngày nữa mới tới hạn; nạp sẵn tiến độ mở bài T; cố định đồng hồ; làm xong bài T, sai T2 và T5 (cùng từ "谢谢") | Vẫn đúng 2 thẻ "谢谢"; cả hai có thời điểm ôn tiếp theo bằng lúc xong bài, trạng thái đã chấm như lúc nạp | e2e |

## Bài kiểm tra nào đưa câu sai vào ôn tập

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-14 | S9.4-AC1 Đạt bài kiểm tra nhưng còn câu sai vẫn xử lý | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T2 | Màn tổng kết hiện "90%", "Bạn đã đạt", không có nút "Làm lại"; danh sách thẻ có "谢谢" nghĩa và "谢谢" nghe | e2e |
| TC-S9.4-AC1-15 | Bảng "Bài kiểm tra nào…": cuối chủ đề chưa đạt | Biên | Nạp sẵn tiến độ mở bài T; làm xong bài T, sai T2, T7, T8 | Màn tổng kết hiện "70%", "Chưa đạt, cần từ 80%" và nút "Làm lại"; danh sách thẻ có đúng 6 thẻ: nghĩa và nghe của "谢谢", "人", "你", cả sáu "mới" | e2e |
| TC-S9.4-AC1-16 | S9.4-AC1 Còn câu bỏ qua vẫn xử lý câu sai | Chức năng | Nạp sẵn tiến độ mở bài T-BQ; làm hết bài, bỏ qua T11, sai T2 | Màn tổng kết hiện thông báo đã bỏ qua 1 câu và chưa đạt; danh sách thẻ có "谢谢" nghĩa và "谢谢" nghe | e2e |
| TC-S9.4-AC1-17 | S9.4-AC1 Kiểm tra cuối chủ đề của chủ đề đã qua bằng vượt cấp vẫn tạo thẻ | Chức năng | Chưa có thẻ nào; bấm "Kiểm tra vượt cấp" của chủ đề mẫu VC4, làm xong bài V, đúng mọi câu (màn tổng kết "Bạn đã đạt"); về bản đồ, mở bài kiểm tra cuối chủ đề của VC4 từ bản đồ, làm xong, chỉ sai V1 (câu về "谢谢") | Sau lần vượt cấp: danh sách thẻ rỗng. Sau lần mở từ bản đồ: danh sách thẻ có đúng 2 thẻ "谢谢" nghĩa và "谢谢" nghe, cả hai "mới" | e2e |

## Kiểm tra vượt cấp không tạo thẻ mới

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-18 | S9.4-AC1 Kiểm tra vượt cấp không tạo thẻ mới | Chức năng | Chưa có thẻ nào; trên bản đồ bấm "Kiểm tra vượt cấp" của chủ đề mẫu VC4; làm xong bài V, chỉ sai V1 ("谢谢") | Màn tổng kết hiện "80%", "Bạn đã đạt"; chủ đề VC4 "Đã xong"; danh sách thẻ rỗng (không có thẻ "谢谢") | e2e |
| TC-S9.4-AC1-19 | S9.4-AC1 Kiểm tra vượt cấp không tạo thẻ mới | Biên | Như TC-S9.4-AC1-18 nhưng sai V1 và V2 (chưa đạt) | Màn tổng kết hiện "Chưa đạt, cần từ 80%"; chủ đề VC4 vẫn khóa; danh sách thẻ rỗng | e2e |
| TC-S9.4-AC1-20 | S9.4-AC1 Kiểm tra vượt cấp đưa thẻ có sẵn về ôn sớm | Chức năng | Nạp sẵn thẻ "你" nghĩa và "你" nghe đã chấm, còn 10 ngày nữa mới tới hạn; cố định đồng hồ; bấm "Kiểm tra vượt cấp" của VC4; làm xong bài V, chỉ sai V2 ("你"); mở màn ôn tập | Vẫn đúng 2 thẻ (không thêm thẻ nào); "你" nghĩa và "你" nghe có thời điểm ôn tiếp theo bằng lúc xong bài; màn ôn tập hiện "Thẻ 1 / 2" với hai thẻ "你" | e2e |
| TC-S9.4-AC1-21 | S9.4-AC1 Kiểm tra vượt cấp đưa thẻ có sẵn về ôn sớm | Biên | Nạp sẵn chỉ thẻ "你" nghĩa đã chấm, còn 10 ngày nữa mới tới hạn (không có "你" nghe); bấm "Kiểm tra vượt cấp" của VC4; làm xong bài V, sai V2 và V1 | Vẫn đúng 1 thẻ: "你" nghĩa, đã đến hạn; không có thẻ "你" nghe, không có thẻ "谢谢" | e2e |
| TC-S9.4-AC1-22 | S9.4-AC1 Làm lại kiểm tra vượt cấp chưa đạt vẫn không tạo thẻ mới | Chức năng | Tiếp TC-S9.4-AC1-19 (chưa đạt, danh sách thẻ rỗng); bấm "Làm lại" trên màn tổng kết; làm xong lần làm lại, chỉ sai V1 ("谢谢") | Màn tổng kết lần làm lại hiện "80%", "Bạn đã đạt"; chủ đề VC4 "Đã xong"; danh sách thẻ rỗng (không có thẻ "谢谢") | e2e |
| TC-S9.4-AC1-23 | S9.4-AC1 Làm lại kiểm tra vượt cấp chưa đạt vẫn không tạo thẻ mới | Biên | Như TC-S9.4-AC1-22 nhưng lần làm lại sai V1 và V2 (vẫn chưa đạt) | Màn tổng kết hiện "Chưa đạt, cần từ 80%" và nút "Làm lại"; chủ đề VC4 vẫn khóa; danh sách thẻ rỗng | e2e |

## Chỉ xử lý khi làm xong bài kiểm tra

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-24 | S9.4-AC1 Thoát giữa bài kiểm tra không xử lý câu sai | Chức năng | Nạp sẵn tiến độ mở bài T; trả lời đúng T1, sai T2 (câu về "谢谢", câu 2), rồi thoát giữa bài ở câu 3 | Danh sách thẻ rỗng (không có thẻ "谢谢") | e2e |
| TC-S9.4-AC1-25 | S9.4-AC1 Thoát giữa bài kiểm tra không xử lý câu sai | Biên | Tiếp TC-S9.4-AC1-24: mở lại bài T (bắt đầu lại từ câu 1, S3.5), làm xong, đúng mọi câu | Màn tổng kết hiện "100%"; danh sách thẻ rỗng (câu sai của lần đã thoát không được xử lý) | e2e |
| TC-S9.4-AC1-26 | S9.4-AC1 Câu sai trong bài học thường không đưa thẻ về ôn sớm | Chức năng | Nạp sẵn tiến độ bài mẫu H (你好) "Đã xong" và thẻ "你好" nghĩa đã chấm, còn 10 ngày nữa mới tới hạn; mở lại bài mẫu H, sai câu về "你好", làm hết bài | Màn tổng kết bài học hiện; thẻ "你好" nghĩa vẫn còn 10 ngày nữa mới tới hạn, trạng thái như lúc nạp | e2e |

## Mỗi lần làm bài xử lý câu sai của chính lần đó

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-27 | S9.4-AC1 Làm lại chỉ xử lý câu sai của lần đó | Chức năng | Nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T2 (có "谢谢" nghĩa, nghe "mới"); mở màn ôn tập, chấm "Dễ" cả hai thẻ "谢谢"; ghi lại thời điểm ôn tiếp theo của hai thẻ; về bản đồ, mở lại bài T, làm xong, chỉ sai T7 ("人") | Có "人" nghĩa và "人" nghe "mới"; "谢谢" nghĩa và nghe giữ nguyên thời điểm ôn tiếp theo đã ghi sau khi chấm "Dễ"; tổng 4 thẻ | e2e |
| TC-S9.4-AC1-28 | S9.4-AC1 Làm lại chỉ xử lý câu sai của lần đó | Chức năng | QA chạy tay trên bản build, làm hết case trong cùng một ngày. Nếu bản build đã có S9.3: trước khi bắt đầu, đặt giới hạn thẻ mới và lượt ôn mỗi ngày trong Cài đặt đủ lớn (lớn hơn tổng số thẻ của chủ đề đầu cộng 4), để không lần mở màn ôn tập nào trong case chạm giới hạn. Học thật chủ đề đầu tiên của app tới khi mở bài kiểm tra cuối chủ đề (có thẻ "mới" theo S9.1); mở màn ôn tập, chấm "Dễ" mọi thẻ tới khi hết phiên; làm bài kiểm tra, trả lời sai đúng một câu về một từ X, còn lại đúng (câu viết chữ, nếu có, viết đúng hết các nét). X là từ của một câu chọn thanh điệu hoặc gõ pinyin, không xuất hiện ở câu cặp âm nào của bài (ghi lại X); mở màn ôn tập; chấm "Dễ" hết; làm lại bài kiểm tra từ bản đồ, đúng mọi câu; mở màn ôn tập | Lần mở ôn tập thứ hai: phiên có thẻ nghĩa và nghe của X; ngoài ra chỉ có thể có thẻ chiều viết "mới" của từ có câu viết chữ trong bài kiểm tra mà trước đó chưa có thẻ chiều viết (S9.1); không có thẻ nào khác. Lần mở thứ ba: màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ" (S9.2; X không bị đưa lại) | không |

## Đưa thẻ có sẵn về cần ôn sớm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-29 | S9.4-AC1 Thẻ chưa tới hạn được đưa về đến hạn ngay | Chức năng | Nạp sẵn thẻ "你好" nghĩa đã chấm, còn 10 ngày nữa mới tới hạn, hôm nay chưa ôn thẻ nào; cố định đồng hồ; nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1; mở màn ôn tập | Phiên có "你好" nghĩa, hỏi trước "你好" nghe "mới" vừa tạo (thẻ đã chấm hỏi trước thẻ mới, S9.2); đọc thẻ: "你好" nghĩa không "mới", thời điểm ôn tiếp theo bằng lúc xong bài | e2e |
| TC-S9.4-AC1-30 | S9.4-AC1 Thẻ mới giữ nguyên trạng thái mới | Chức năng | Nạp sẵn thẻ "你好" nghĩa và "你好" nghe "mới"; nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1 | Mọi thông tin của hai thẻ giống lúc nạp (cả hai vẫn "mới"); tổng vẫn 2 thẻ | e2e |
| TC-S9.4-AC1-31 | S9.4-AC1 Thẻ đã quá hạn giữ nguyên hạn cũ | Chức năng | Nạp sẵn thẻ "你好" nghĩa đã chấm, tới hạn từ 3 ngày trước; nạp sẵn tiến độ mở bài T; làm xong bài T, sai T1 | Thời điểm ôn tiếp theo của "你好" nghĩa vẫn là 3 ngày trước (không đổi về lúc xong bài); trạng thái như lúc nạp | e2e |

## Thẻ có sẵn đọc không được thì giữ nguyên

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-32 | S9.4-AC1 Thẻ có sẵn đọc không được thì giữ nguyên, phần khác vẫn xử lý | Chức năng | Chỉ kiểm tầng use case (Vitest, lưu trữ giả) + hook màn học (Testing Library). Đầu vào: thẻ "你好" nghĩa đã lưu nhưng đọc không được; không có "你好" nghe; không có thẻ nào của "谢谢"; câu sai về "你好" và về "谢谢" ở bài kiểm tra cuối chủ đề | Thẻ "你好" nghĩa đã lưu giữ nguyên như trước, không có thẻ "你好" nghĩa thứ hai; danh sách thẻ có thêm "你好" nghe, "谢谢" nghĩa, "谢谢" nghe, cả ba "mới"; màn tổng kết hiện bình thường, không có thông báo lỗi. QA đọc kết quả Vitest | không |

## Đưa thẻ về ôn sớm không phải một lần chấm

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-33 | S9.4-AC1 Đưa thẻ về ôn sớm không phải một lần chấm | Chức năng | Chỉ kiểm tầng quy tắc (Vitest). Đầu vào: thẻ "你好" nghĩa đã chấm, còn 10 ngày nữa mới tới hạn; lúc xong bài T0 | Thẻ trả về giống hệt thẻ vào ở mọi thông tin (trạng thái, mức nhớ, số lần chấm, lần chấm gần nhất…), chỉ khác thời điểm ôn tiếp theo = T0. QA đọc kết quả Vitest | không |
| TC-S9.4-AC1-34 | S9.4-AC1 Đưa thẻ về ôn sớm không phải một lần chấm | Biên | Như TC-S9.4-AC1-2 (e2e); đọc thẻ "你好" nghĩa trước và sau khi làm xong bài T | Mọi thông tin của thẻ giống trước khi làm bài, trừ thời điểm ôn tiếp theo | e2e |

## Thẻ chiều viết khi câu sai tạo thẻ chiều nghĩa

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-35 | S9.4-AC1 Đã viết xong chữ thì câu sai tạo đủ ba chiều | Chức năng | Chưa có thẻ nào; viết xong chữ "人" trên màn luyện viết (chưa có thẻ "人", theo S9.1); nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T7 | Danh sách thẻ có đúng 3 thẻ: "人" nghĩa, nghe, viết, cả ba "mới" | e2e |
| TC-S9.4-AC1-36 | S9.4-AC1 Thẻ nghĩa từ câu sai rồi viết xong chữ thì có thẻ chiều viết | Chức năng | Chưa có thẻ nào, chưa viết chữ nào; nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T7; kiểm danh sách thẻ; rồi viết xong chữ "人" trên màn luyện viết | Sau bài T: có "人" nghĩa, nghe, không có "人" viết. Sau khi viết: có thêm "人" viết "mới"; màn báo đã viết xong chữ như S6.2, không có thông báo mới | e2e |
| TC-S9.4-AC1-37 | S9.4-AC1 Thẻ nghĩa từ câu sai rồi xong bài có câu viết thì không mất thẻ chiều viết | Chức năng | Chưa có thẻ nào; nạp sẵn tiến độ mở bài T; làm xong bài T, chỉ sai T7; đọc thẻ "人" nghĩa và nghe; nạp sẵn tiến độ mở bài mẫu C (viết 人); làm hết bài mẫu C, viết đúng hết các nét ở câu viết, không bỏ qua câu nào | Có "人" viết "mới"; vẫn một "人" nghĩa và một "人" nghe, trạng thái và thời điểm ôn tiếp theo như trước khi làm bài mẫu C; tổng 3 thẻ | e2e |

## Câu sai không tạo được thẻ chiều nghĩa thì không tạo thẻ chiều viết

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-38 | S9.4-AC1 Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết | Chức năng | Chỉ kiểm tầng use case (Vitest, lưu trữ giả) + hook màn học (Testing Library). Đầu vào: chưa có thẻ nào của "人"; chữ "人" đã viết xong trên màn luyện viết; câu sai về "人" ở bài kiểm tra cuối chủ đề; ghi thẻ "人" nghĩa bị lỗi | Danh sách thẻ không có "人" nghĩa và không có "人" viết; màn tổng kết hiện bình thường, không có thông báo lỗi. QA đọc kết quả Vitest | không |
| TC-S9.4-AC1-39 | S9.4-AC1 Thẻ chiều viết còn thiếu từ trước không được câu sai tạo bù | Chức năng | Nạp sẵn thẻ "人" nghĩa và "人" nghe đã chấm, còn 10 ngày nữa mới tới hạn; giả lập lỗi lưu thẻ một phần: chỉ chặn thẻ "人" viết; viết xong chữ "人" trên màn luyện viết (thẻ "人" viết không lưu được); bỏ giả lập lỗi; cố định đồng hồ; nạp sẵn tiến độ mở bài T (không có câu viết chữ nào, nên lần làm bài này không viết chữ nào của "人"; chữ "人" đã viết xong từ trước lần làm bài này); làm xong bài T, chỉ sai T7 | Danh sách thẻ không có "人" viết; tổng 2 thẻ; "人" nghĩa và "人" nghe có thời điểm ôn tiếp theo bằng lúc xong bài (đã đến hạn) | e2e |

## Câu viết trong bài kiểm tra tính trước khi xử lý câu sai

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-40 | S9.4-AC1 Viết chữ ở câu viết của bài kiểm tra chưa đạt rồi sai câu về từ đó thì có đủ ba chiều | Chức năng | Chưa có thẻ nào, chưa viết chữ nào; nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở câu viết chữ "人" (T10), sai T7 (chọn thanh điệu "人"), T2 và T8 | Màn tổng kết hiện "70%", "Chưa đạt, cần từ 80%"; danh sách thẻ có "人" nghĩa, "人" nghe, "人" viết, cả ba "mới"; có "谢谢" và "你" mỗi từ nghĩa và nghe, không có thẻ viết; tổng 7 thẻ | e2e |
| TC-S9.4-AC1-41 | S9.4-AC1 Viết chữ ở câu viết của bài kiểm tra chưa đạt rồi sai câu về từ đó thì có đủ ba chiều | Biên | Như TC-S9.4-AC1-40 nhưng chỉ sai T7 (bài đạt) | Màn tổng kết hiện "90%", "Bạn đã đạt"; danh sách thẻ có đúng 3 thẻ: "人" nghĩa, nghe, viết, cả ba "mới" | e2e |
| TC-S9.4-AC1-42 | S9.4-AC1 Viết chữ ở bài kiểm tra chưa đạt mà không sai câu về từ đó thì chữ vẫn được ghi | Biên | Chưa có thẻ nào, chưa viết chữ nào; nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở T10, đúng mọi câu khác (bài đạt); kiểm danh sách thẻ; nạp sẵn tiến độ mở bài mẫu R; làm hết bài mẫu R, không bỏ qua câu nào | Màn tổng kết bài T-V hiện "100%", "Bạn đã đạt"; ngay sau bài T-V danh sách thẻ rỗng (làm xong bài kiểm tra không làm "人" thành đã học xong). Sau bài mẫu R: có "人" nghĩa, "人" nghe, "人" viết, cả ba "mới" (chữ viết ở bài kiểm tra được giữ) | e2e |
| TC-S9.4-AC1-56 | S9.4-AC1 Viết chữ ở bài kiểm tra chưa đạt mà không sai câu về từ đó thì chữ vẫn được ghi | Chức năng | Chưa có thẻ nào, chưa viết chữ nào; nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở T10, sai T1, T2, T8, đúng T7 và T9 (về "人"); kiểm danh sách thẻ; nạp sẵn tiến độ mở bài mẫu R; làm hết bài mẫu R, không bỏ qua câu nào | Màn tổng kết bài T-V hiện "70%", "Chưa đạt, cần từ 80%"; ngay sau bài T-V: có nghĩa và nghe của "你好", "谢谢", "你" (6 thẻ, "mới"), không có thẻ nào của "人". Sau bài mẫu R: có "人" nghĩa, "人" nghe, "人" viết, cả ba "mới" | e2e |
| TC-S9.4-AC1-61 | S9.4-AC1 Viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì chữ vẫn được ghi | Chức năng | Chưa có thẻ nào, chưa viết chữ nào; nạp sẵn tiến độ mở bài T-VĐ; viết đúng hết các nét ở câu 1 (viết chữ "人") tới khi câu hiện "Đúng", bấm "Tiếp tục"; sang câu 2, thoát giữa bài; kiểm danh sách thẻ; nạp sẵn tiến độ mở bài mẫu R; làm hết bài mẫu R, không bỏ qua câu nào | Ngay sau khi thoát bài T-VĐ: danh sách thẻ rỗng (không có thẻ nào của "人"). Sau bài mẫu R: có "人" nghĩa, "人" nghe, "人" viết, cả ba "mới"; tổng 3 thẻ | e2e |
| TC-S9.4-AC1-62 | S9.4-AC1 Viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì chữ vẫn được ghi | Biên | Như TC-S9.4-AC1-61 nhưng ở câu 1 viết dở rồi thoát (câu chưa hiện "Đúng"); rồi làm hết bài mẫu R, không bỏ qua câu nào | Ngay sau khi thoát: danh sách thẻ rỗng. Sau bài mẫu R: có "人" nghĩa và "人" nghe "mới", **không** có "人" viết (viết dở không được ghi, S9.1); tổng 2 thẻ | e2e |
| TC-S9.4-AC1-63 | S9.4-AC1 Viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì chữ vẫn được ghi | Biên | Như TC-S9.4-AC1-61 nhưng sau khi câu 1 hiện "Đúng" và bấm "Tiếp tục", sai câu 2 ("谢谢") rồi thoát giữa bài ở câu 3; rồi làm hết bài mẫu R | Ngay sau khi thoát: danh sách thẻ rỗng (câu sai về "谢谢" không được xử lý, chữ "人" không làm "人" thành đã học xong). Sau bài mẫu R: đúng 3 thẻ "人" nghĩa, nghe, viết "mới"; không có thẻ "谢谢" | e2e |
| TC-S9.4-AC1-57 | S9.4-AC1 Viết chữ ở bài kiểm tra chưa đạt mà không sai câu về từ đó thì chữ vẫn được ghi | Biên | Như TC-S9.4-AC1-56 tới hết bài T-V; đóng hẳn tab, mở lại app; rồi làm hết bài mẫu R | Sau khi mở lại app vẫn không có thẻ nào của "人"; sau bài mẫu R có "人" viết "mới" (chữ đã viết được giữ qua lần mở app) | e2e |

## Thẻ chiều viết khi viết chữ trong bài kiểm tra

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-58 | S9.4-AC1 Đã có thẻ nghĩa, viết chữ ở bài kiểm tra chưa đạt, không sai câu về từ đó thì có thẻ chiều viết | Chức năng | Nạp sẵn thẻ "人" nghĩa và "人" nghe "mới" (không có "人" viết, chưa viết chữ nào); nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở T10, sai T1, T2, T8, đúng T7 và T9 | Màn tổng kết hiện "70%", "Chưa đạt, cần từ 80%"; có "人" viết "mới"; "人" nghĩa và "人" nghe mỗi chiều một thẻ, giống lúc nạp; có nghĩa và nghe của "你好", "谢谢", "你"; tổng 9 thẻ | e2e |
| TC-S9.4-AC1-59 | S9.4-AC1 Đã có thẻ nghĩa, viết chữ ở bài kiểm tra chưa đạt, không sai câu về từ đó thì có thẻ chiều viết | Biên | Như TC-S9.4-AC1-58 nhưng đúng mọi câu (bài đạt) | Màn tổng kết hiện "100%", "Bạn đã đạt"; đúng 3 thẻ: "人" viết "mới", "人" nghĩa và "人" nghe giống lúc nạp | e2e |
| TC-S9.4-AC1-60 | S9.4-AC1 Đã có thẻ nghĩa, viết chữ ở bài kiểm tra chưa đạt và sai câu về từ đó thì có thẻ chiều viết | Chức năng | Nạp sẵn thẻ "人" nghĩa và "人" nghe đã chấm, còn 10 ngày nữa mới tới hạn (không có "人" viết, chưa viết chữ nào); cố định đồng hồ; nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở T10, sai T7 (chọn thanh điệu "人"), T2 và T8 | Màn tổng kết hiện "70%", "Chưa đạt, cần từ 80%"; có "人" viết "mới"; "人" nghĩa và "人" nghe mỗi chiều vẫn một thẻ, trạng thái đã chấm như lúc nạp, thời điểm ôn tiếp theo bằng lúc xong bài; có nghĩa và nghe "mới" của "谢谢", "你"; tổng 7 thẻ | e2e |
| TC-S9.4-AC1-70 | S9.4-AC1 Kiểm tra vượt cấp, viết chữ và sai câu về từ chưa có thẻ thì không có thẻ chiều viết | Chức năng | Chỉ kiểm tầng use case (Vitest, lưu trữ giả). Đầu vào: chưa có thẻ nào của "人", chưa từng viết chữ "人"; lần làm bài là kiểm tra vượt cấp, làm xong; câu viết chữ "人" viết đúng hết các nét; câu chọn thanh điệu về "人" sai | Danh sách thẻ không có thẻ nào của "人" (không nghĩa, không nghe, không viết). QA đọc kết quả Vitest | không |
| TC-S9.4-AC1-64 | S9.4-AC1 Đã có thẻ nghĩa, viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì có thẻ chiều viết | Chức năng | Nạp sẵn thẻ "人" nghĩa và "人" nghe "mới" (không có "人" viết, chưa viết chữ nào); nạp sẵn tiến độ mở bài T-VĐ; viết đúng hết các nét ở câu 1 tới khi câu hiện "Đúng", bấm "Tiếp tục"; sang câu 2, thoát giữa bài | Có "人" viết "mới"; "人" nghĩa và "人" nghe mỗi chiều một thẻ, mọi thông tin giống lúc nạp; tổng 3 thẻ; câu 1 chỉ hiện "Đúng" như mọi câu viết trong bài, không có thông báo mới | e2e |
| TC-S9.4-AC1-65 | S9.4-AC1 Đã có thẻ nghĩa, viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì có thẻ chiều viết | Biên | Nạp sẵn thẻ "人" nghĩa và "人" nghe đã chấm, còn 10 ngày nữa mới tới hạn (không có "人" viết, chưa viết chữ nào); nạp sẵn tiến độ mở bài T-VĐ; viết đúng hết các nét ở câu 1 tới khi câu hiện "Đúng", bấm "Tiếp tục"; sai câu 2 ("谢谢"), thoát giữa bài ở câu 3 | Có "人" viết "mới"; "人" nghĩa và "人" nghe vẫn còn 10 ngày nữa mới tới hạn, trạng thái như lúc nạp; không có thẻ "谢谢"; tổng 3 thẻ | e2e |
| TC-S9.4-AC1-66 | S9.4-AC1 Đã có thẻ nghĩa, viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì có thẻ chiều viết | Biên | Như TC-S9.4-AC1-64 nhưng ở câu 1 viết dở rồi thoát | Không có "人" viết; "人" nghĩa và "人" nghe giống lúc nạp; tổng 2 thẻ | e2e |

## Viết lại chữ ở bài kiểm tra tạo bù thẻ chiều viết còn thiếu

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-67 | S9.4-AC1 Thẻ chiều viết còn thiếu được tạo bù khi viết lại chữ ở bài kiểm tra | Chức năng | Nạp sẵn thẻ "人" nghĩa và "人" nghe đã chấm, còn 10 ngày nữa mới tới hạn; giả lập lỗi lưu thẻ một phần: chỉ chặn thẻ "人" viết; viết xong chữ "人" trên màn luyện viết (thẻ "人" viết không lưu được); bỏ giả lập lỗi; kiểm danh sách thẻ; nạp sẵn tiến độ mở bài T-V; làm xong bài T-V, viết đúng hết các nét ở T10, đúng mọi câu | Trước bài T-V: không có "人" viết, tổng 2 thẻ. Sau bài T-V: màn tổng kết hiện "100%", "Bạn đã đạt"; có "人" viết "mới"; vẫn một "人" nghĩa và một "人" nghe, trạng thái và thời điểm ôn tiếp theo như lúc nạp (còn 10 ngày); tổng 3 thẻ | e2e |
| TC-S9.4-AC1-68 | S9.4-AC1 Thẻ chiều viết còn thiếu được tạo bù khi viết lại chữ ở bài kiểm tra | Biên | Như TC-S9.4-AC1-67 tới hết bước bỏ giả lập lỗi; cố định đồng hồ; làm xong bài T-V, viết đúng hết các nét ở T10, chỉ sai T7 (chọn thanh điệu "人") | Màn tổng kết hiện "90%", "Bạn đã đạt"; có "人" viết "mới" (khác TC-S9.4-AC1-39: lần này có viết lại chữ); "人" nghĩa và "人" nghe mỗi chiều một thẻ, thời điểm ôn tiếp theo bằng lúc xong bài; tổng 3 thẻ | e2e |
| TC-S9.4-AC1-69 | S9.4-AC1 Thẻ chiều viết còn thiếu được tạo bù khi viết lại chữ ở bài kiểm tra | Biên | Như TC-S9.4-AC1-67 tới hết bước bỏ giả lập lỗi; nạp sẵn tiến độ mở bài T-VĐ; viết đúng hết các nét ở câu 1 tới khi câu hiện "Đúng", bấm "Tiếp tục"; sang câu 2, thoát giữa bài | Có "人" viết "mới" (tạo ngay lúc viết xong, không chờ xong bài); "人" nghĩa và "人" nghe giống lúc nạp; tổng 3 thẻ | e2e |

## Câu sai không đổi thẻ chiều viết có sẵn

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-43 | S9.4-AC1 Thẻ chiều viết có sẵn không bị đưa về ôn sớm | Chức năng | Nạp sẵn thẻ "人" nghĩa, nghe, viết đã chấm, còn 10 ngày nữa mới tới hạn; nạp sẵn tiến độ mở bài T; làm xong bài T, sai T7; mở màn ôn tập | "人" nghĩa và "人" nghe đã đến hạn; "人" viết vẫn còn 10 ngày nữa mới tới hạn; màn ôn tập hiện "Thẻ 1 / 2", không có thẻ "人" viết | e2e |

## Không lưu được thẻ thì màn tổng kết vẫn bình thường

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-44 | S9.4-AC1 Lưu thẻ lỗi thì bài kiểm tra vẫn ghi kết quả | Chức năng | Nạp sẵn tiến độ mở bài T; giả lập lỗi lưu thẻ; làm xong bài T, sai T2 và T8 | Màn tổng kết hiện "80%", "Bạn đã đạt", thời gian, "Sai 2 câu"; không có thông báo lỗi nào (kể cả "Chưa lưu được kết quả bài này"); về bản đồ: bài kiểm tra "Đã xong", chủ đề tiếp theo mở; danh sách thẻ không có thẻ "谢谢" hay "你" | e2e |
| TC-S9.4-AC1-45 | S9.4-AC1 Lưu thẻ lỗi thì bài kiểm tra vẫn ghi kết quả | Biên | Như TC-S9.4-AC1-44; sau đó bỏ giả lập lỗi, đóng hẳn tab rồi mở lại app | Bài kiểm tra vẫn "Đã xong", chủ đề tiếp theo vẫn mở; danh sách thẻ vẫn không có thẻ "谢谢" hay "你" (không xử lý lại khi mở app) | e2e |
| TC-S9.4-AC1-46 | S9.4-AC1 Lần làm lại sau lưu được thì có thẻ | Chức năng | Tiếp TC-S9.4-AC1-44 (lỗi lưu thẻ, chưa có thẻ); bỏ giả lập lỗi; mở lại bài T từ bản đồ, làm xong, chỉ sai T2 | Có "谢谢" nghĩa và "谢谢" nghe "mới"; không có thẻ "你" (câu sai T8 của lần trước không được xử lý lại) | e2e |

## Lưu thẻ được một phần thì giữ phần đã lưu

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-47 | S9.4-AC1 Lưu được chiều nghĩa mà lỗi chiều nghe thì giữ thẻ chiều nghĩa | Chức năng | Chưa có thẻ nào; nạp sẵn tiến độ mở bài T; giả lập lỗi lưu thẻ một phần: chỉ chặn thẻ "谢谢" nghe; làm xong bài T, chỉ sai T2 (câu về "谢谢") | Màn tổng kết hiện "90%", "Bạn đã đạt", thời gian, "Sai 1 câu", không có thông báo lỗi nào; danh sách thẻ có đúng 1 thẻ: "谢谢" nghĩa "mới"; không có "谢谢" nghe | e2e |
| TC-S9.4-AC1-48 | S9.4-AC1 Lưu được thẻ của từ này mà lỗi ở từ khác thì giữ thẻ đã lưu | Chức năng | Chưa có thẻ nào; nạp sẵn tiến độ mở bài T; giả lập lỗi lưu thẻ một phần: chặn mọi thẻ của "人"; làm xong bài T, chỉ sai T2 ("谢谢") và T7 ("人") | Màn tổng kết hiện "80%", "Bạn đã đạt", "Sai 2 câu", không có thông báo lỗi nào; danh sách thẻ có đúng 2 thẻ "谢谢" nghĩa và "谢谢" nghe, "mới"; không có thẻ nào của "人" | e2e |
| TC-S9.4-AC1-49 | S9.4-AC1 Lần sau tạo bù thẻ còn thiếu, không tạo trùng | Chức năng | Tiếp TC-S9.4-AC1-47 (chỉ có "谢谢" nghĩa "mới"); bỏ giả lập lỗi; mở lại bài T từ bản đồ, làm xong, chỉ sai T2 | Danh sách thẻ có đúng 2 thẻ: một "谢谢" nghĩa và một "谢谢" nghe; "谢谢" nghe "mới"; "谢谢" nghĩa vẫn "mới" (thẻ mới giữ nguyên trạng thái mới) | e2e |
| TC-S9.4-AC1-50 | Bảng "Lưu thẻ được một phần": thẻ có sẵn lưu lỗi giữ hạn cũ | Biên | Nạp sẵn thẻ "你好" nghĩa và "你好" nghe đã chấm, còn 10 ngày nữa mới tới hạn; nạp sẵn tiến độ mở bài T; giả lập lỗi lưu thẻ một phần: chỉ chặn thẻ "你好" nghe; cố định đồng hồ; làm xong bài T, chỉ sai T1 | Màn tổng kết hiện "90%", "Bạn đã đạt", không có thông báo lỗi nào; tổng 2 thẻ; "你好" nghĩa có thời điểm ôn tiếp theo bằng lúc xong bài; "你好" nghe vẫn còn 10 ngày nữa mới tới hạn | e2e |

## Offline

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-51 | S9.4-AC1 Câu sai về từ chưa có thẻ thì tạo thẻ nghĩa và nghe | Offline | Nạp sẵn tiến độ mở bài T; mở bài T khi có mạng; tắt mạng; làm xong bài T, chỉ sai T2; mở màn ôn tập (vẫn không có mạng) | Màn tổng kết hiện bình thường, không có thông báo lỗi; có "谢谢" nghĩa và nghe "mới"; màn ôn tập hiện "Thẻ 1 / 2" với hai thẻ "谢谢" | e2e |
| TC-S9.4-AC1-52 | S9.4-AC1 Câu sai về từ đã có thẻ thì đưa thẻ về ôn sớm, không tạo thêm | Offline | QA chạy tay trên bản build, điện thoại thật hoặc khổ 375×812: như TC-S9.4-AC1-28 (cùng điều kiện giới hạn S9.3, cùng ngày) tới bước chấm "Dễ" hết phiên đầu (có mạng); tắt mạng; làm bài kiểm tra cuối chủ đề, sai đúng một câu về một từ X đã có thẻ, còn lại đúng (câu viết chữ, nếu có, viết đúng hết các nét). X là từ của một câu chọn thanh điệu hoặc gõ pinyin, không xuất hiện ở câu cặp âm nào của bài; mở màn ôn tập | Màn tổng kết hiện đủ điểm, thời gian, số câu sai, không có thông báo lỗi; phiên ôn tập có thẻ nghĩa và nghe của X, ngoài ra chỉ có thể có thẻ chiều viết "mới" như TC-S9.4-AC1-28; không có thẻ nào khác | không |

## Hồi quy

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S9.4-AC1-53 | Hồi quy S3.4-AC1 Ghi tiến độ lỗi (trên bài kiểm tra) | Chức năng | Nạp sẵn tiến độ mở bài T; giả lập lỗi lưu tiến độ (ghi kết quả bài lỗi, ghi thẻ được); làm xong bài T, sai T2 | Màn tổng kết vẫn hiện điểm, thời gian, số câu sai và thông báo "Chưa lưu được kết quả bài này" như S3.4 (S9.4 chỉ bỏ thông báo cho lỗi lưu thẻ) | e2e |
| TC-S9.4-AC1-54 | Hồi quy S3.5-AC2 màn tổng kết bài kiểm tra | Chức năng | QA chạy tay trên bản build, khổ 375×812 và 1280×800, giao diện sáng và tối: làm bài kiểm tra cuối chủ đề có 1 câu sai (đạt) rồi làm lại có đủ câu sai để chưa đạt | Ở cả 4 tổ hợp, màn tổng kết giống trước S9.4: "Bạn đã đạt" / "Chưa đạt, cần từ 80%" và nút "Làm lại", điểm, thời gian, số câu sai, đường về Trang chủ; không có chữ hay nút mới (không có "Đã thêm N thẻ", không có "Ôn ngay"); không có thông báo lỗi | không |
| TC-S9.4-AC1-55 | Hồi quy S3.6-AC2 kết quả kiểm tra vượt cấp | Chức năng | QA chạy tay trên bản build: bấm "Kiểm tra vượt cấp" của một chủ đề chưa mở, làm xong có 1 câu sai mà vẫn đạt | Màn tổng kết và bản đồ như S3.6: chủ đề đó "Đã xong", chủ đề kế mở; không có thông báo mới hay lỗi | không |

Hồi quy S9.1: chạy lại TC-S9.1-AC1-9, -10, -11 (`openspec/changes/s9-1-review-cards/test-cases.md`, hoặc bản archive) trên bản build S9.4:
các case đó trả lời đúng mọi câu nên kết quả không đổi (không tạo thẻ). Case S9.1 nào làm bài kiểm tra có câu sai, hoặc
viết chữ ở câu viết của bài kiểm tra, thì kết quả mong đợi đổi theo spec này.

## Tầng test theo Scenario (dev kiểm thêm, theo `spec-driven.md` §4)

| Scenario | Tầng thấp nhất | Ghi chú |
|---|---|---|
| Câu sai về từ chưa có thẻ…, đã có thẻ…, thiếu thẻ chiều nghe, Câu đúng không đổi thẻ | Vitest quy tắc (hàm thuần) + use case với dữ liệu thật trên trình duyệt giả | Tạo chiều còn thiếu, đưa chiều có sẵn về ôn sớm |
| Bảng "Câu nào là câu sai": cặp âm, nói theo từ, nói theo câu, câu bỏ qua, gõ pinyin, viết chữ | Vitest quy tắc | Câu sai → danh sách từ; câu viết không bao giờ sai |
| Một từ sai nhiều câu | Vitest quy tắc + use case | Không trùng thẻ |
| Bảng "Bài kiểm tra nào…", Kiểm tra vượt cấp không tạo thẻ mới / đưa thẻ có sẵn về sớm, Làm lại kiểm tra vượt cấp chưa đạt | Vitest quy tắc + Testing Library hook màn học | Hook truyền đúng loại lần làm bài (cuối chủ đề / vượt cấp), lần "Làm lại" giữ loại vượt cấp |
| Thoát giữa bài, Bài học thường, Làm lại chỉ xử lý câu sai của lần đó | Testing Library hook màn học + Vitest use case | Chỉ xử lý khi màn tổng kết hiện, chỉ câu sai của lần đó |
| Đưa thẻ có sẵn về cần ôn sớm (mới / chưa tới hạn / quá hạn), không phải một lần chấm | Vitest quy tắc | Chỉ đổi thời điểm ôn tiếp theo |
| Thẻ có sẵn đọc không được thì giữ nguyên | Vitest use case (lưu trữ giả có thẻ hỏng) + Testing Library hook màn học | Không tạo đè, chiều và từ khác vẫn có thẻ, không thông báo lỗi |
| Thẻ chiều viết khi câu sai tạo thẻ chiều nghĩa, Thẻ chiều viết có sẵn không bị đưa về sớm | Vitest quy tắc thẻ chiều viết (S9.1) + use case | Định nghĩa "đã học xong" = có thẻ chiều nghĩa |
| Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết, Thẻ chiều viết còn thiếu từ trước không được tạo bù | Vitest use case (lưu trữ giả lỗi từng thẻ) + e2e | Chỉ thẻ chiều nghĩa vừa lưu được làm từ thành "đã học xong"; không tạo bù chỉ khi lần làm bài không viết chữ nào của từ |
| Câu viết trong bài kiểm tra tính trước khi xử lý câu sai | Vitest use case + Testing Library hook màn học + e2e | Đạt hay chưa đạt, kể cả thoát giữa bài, đều ghi chữ ngay lúc viết xong, giữ cho lần sau; viết dở không ghi; làm xong bài kiểm tra không làm từ thành "đã học xong" |
| Thẻ chiều viết khi viết chữ trong bài kiểm tra | Vitest quy tắc thẻ chiều viết (S9.1) + use case + Testing Library hook màn học + e2e | Chưa có thẻ chiều nghĩa thì chỉ tạo thẻ chiều viết khi câu sai ở bài cuối chủ đề làm xong lưu được thẻ chiều nghĩa; vượt cấp có câu sai vẫn không có thẻ nào (TC-S9.4-AC1-70, chỉ use case vì bài vượt cấp mẫu không có câu viết). Đã có thẻ chiều nghĩa thì tạo thẻ chiều viết ngay lúc viết xong, dù có hay không câu sai, kể cả thoát giữa bài; câu sai cùng lần vẫn đưa thẻ nghĩa, nghe về ôn sớm (chỉ khi xong bài) |
| Viết lại chữ ở bài kiểm tra tạo bù thẻ chiều viết còn thiếu | Vitest use case (lưu trữ giả lỗi thẻ chiều viết) + e2e | Quy tắc khôi phục của S9.1; khác "không được câu sai tạo bù" ở chỗ lần làm bài có viết xong lại chữ |
| Lưu thẻ lỗi, Lần làm lại sau lưu được | Testing Library hook màn học (lưu thẻ lỗi) + Vitest use case | Không hiện "Chưa lưu được kết quả bài này" cho lỗi thẻ; lỗi tiến độ vẫn hiện (TC-S9.4-AC1-53) |
| Lưu thẻ được một phần (giữ chiều nghĩa, giữ thẻ từ khác, tạo bù không trùng, thẻ có sẵn lưu lỗi giữ hạn cũ) | Vitest use case với lưu trữ giả lỗi từng thẻ + e2e | Kiểm theo danh sách thẻ và màn tổng kết; cách ghi (từng thẻ hay gộp) do dev chọn |

Không có case A11y riêng: S9.4 không thêm hay đổi giao diện; TC-S9.4-AC1-54 kiểm màn tổng kết không đổi ở Mobile 375 và Sáng/Tối.
