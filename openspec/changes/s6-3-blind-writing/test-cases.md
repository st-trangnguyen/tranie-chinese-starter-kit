# Test cases: S6.3 Viết không gợi ý

Bản nháp do `qa` soạn (bản 0.5, khớp spec sau khi S6.2 có nét mờ cả chữ và làm nổi bật nét đúng sau 3 lần sai), QA người thật chỉnh khi nghiệm thu.

**Chữ thử** (đã kiểm thư mục dữ liệu nét của nội dung, chỉ có 9 chữ có dữ liệu nét: 人 你 八 十 四 好 爸 白 百):
- **十** (2 nét), **人** (2 nét): chữ ngắn, dùng cho case cần viết nhanh. 十, 人, 好 đều là từ MỘT chữ có trong từ điển nội dung, nên có thẻ chiều viết riêng.
- **爸** (8 nét): chữ có dữ liệu nét nhưng chỉ là thành phần của từ 爸爸, không có từ một chữ 爸, nên không có thẻ chiều viết riêng. Dùng cho case "chữ không có thẻ chiều viết riêng".
- **好** (6 nét): case cần sai nhiều lần, rải nhiều nét.
- **龘** (chữ Hán thật, **không** có dữ liệu nét): case chưa có khung viết. Thống nhất với S6.1/S6.2. Nếu S2.5 bổ sung dữ liệu nét cho 龘, đổi sang chữ khác không có dữ liệu nét.
- Mỗi lượt không gợi ý là MỘT chữ (như S6.2), nên không có case từ nhiều chữ.

**Điều kiện đầu chung:** S6.2 (khung viết có gợi ý: nét mờ cả chữ, làm nổi bật nét đúng sau 3 lần sai) và S9.1 (thẻ chiều viết) đã có trên bản build. Viết bằng ngón tay/chuột là hành vi của S6.2, không kiểm ở đây. Mọi case của Scenario chấm mức dùng 十, 人 hoặc 好, tức chữ đang viết **là một từ một chữ có thẻ chiều viết**; case dùng 爸 thì chữ đang viết **chỉ là thành phần của từ nhiều chữ, không có thẻ chiều viết riêng**. Điều kiện này được nhắc lại ở cột Các bước của từng case.

**Cách vào chế độ không gợi ý (dùng cho mọi case "vào chế độ không gợi ý"):** mở chữ ở khung có gợi ý (S6.2), viết xong
chữ, ở màn báo đã viết xong bấm "Thử viết không gợi ý". Mỗi lần bấm nút này mở một lượt mới. Ở màn báo xong của khung KHÔNG gợi ý, nút mở lượt mới cùng chữ là "Viết lại không gợi ý" (không có nút "Thử viết không gợi ý" ở đó).

**Cách quan sát mức chấm:** màn ôn tập (S9.2) chưa có, nên mức chấm (Quên / Khó / Được / Dễ) và việc thẻ nào được ghi KHÔNG nhìn thấy trên giao diện. Case trong bảng chỉ kiểm thứ nhìn thấy (khung, nút, thông báo sai nét, màn báo xong, không có lựa chọn mức). Phần mức chấm của từng Scenario được kiểm bằng Vitest trong PR code, ghi ở mục **Ghi chú: phần kiểm bằng Vitest** bên dưới; khi nghiệm thu, QA đối chiếu test Vitest mang ID Scenario đó đã pass trên CI.

**Ngoài phạm vi:** A11y và Sáng/Tối chỉ ghi cho AC1 (có yêu cầu hiển thị: khung, nét mờ, làm nổi bật nét, thông báo sai, nút). AC2 không có yêu cầu hiển thị nào ngoài "không hiện lựa chọn mức" nên chỉ có một case A11y cho điều đó; không bịa thêm.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.3-AC1-1 | S6.3-AC1 Khung viết không có nét mờ của cả chữ | Chức năng | Mở 十 ở khung có gợi ý, thấy nét mờ cả chữ; viết xong, bấm "Thử viết không gợi ý" | Khung viết không gợi ý không có nét mờ của 十, không có nét nào của chữ hiện sẵn. Nếu khung có ô lưới hoặc đường kẻ thì vẫn hiện | e2e |
| TC-S6.3-AC1-2 | S6.3-AC1 Khung viết không có nét mờ của cả chữ | Sáng/Tối | Làm lại TC-S6.3-AC1-1 ở giao diện sáng rồi tối | Cả hai giao diện: không có nét mờ của chữ (kể cả viền rất nhạt); ô lưới/đường kẻ nếu có vẫn nhìn rõ | không |
| TC-S6.3-AC1-3 | S6.3-AC1 Khung viết không có nét mờ của cả chữ | Mobile 375 | Ở khổ 375, vào chế độ không gợi ý cho 好 | Không có nét mờ của chữ; ô lưới/đường kẻ nếu có vẫn hiện; khung vừa màn hình, không cuộn ngang | không |
| TC-S6.3-AC1-4 | S6.3-AC1 Sai 3 lần liên tiếp không làm nổi bật nét đúng | Chức năng | Vào chế độ không gợi ý cho 十. Viết sai liên tiếp 3 lần ở nét đầu, rồi sai thêm lần thứ 4 ở nét đó | Sau mỗi lần sai (lần 1 đến lần 4): thông báo sai nét hiện, khung không làm nổi bật nét đúng và không hiện nét mờ nào. (Đối chiếu: ở khung có gợi ý, sau lần sai thứ 3 nét đúng được làm nổi bật) | e2e |
| TC-S6.3-AC1-5 | S6.3-AC1 Sai 3 lần liên tiếp không làm nổi bật nét đúng | Biên | Vào chế độ không gợi ý cho 好. Sai 3 lần liên tiếp ở nét đầu, viết đúng nét đầu, rồi sai 3 lần liên tiếp ở nét thứ hai | Ở cả hai nét, sau lần sai thứ 3 khung không làm nổi bật nét đúng, không hiện nét mờ nào | không |
| TC-S6.3-AC1-6 | S6.3-AC1 Sai nét vẫn báo ngay nhưng không hiện nét đúng | Chức năng | Vào chế độ không gợi ý cho 十. Viết một nét không đúng nét kế tiếp, thả tay/nhả chuột | Thông báo viết sai nét hiện ngay sau khi thả; nét sai bị xoá khỏi khung; khung không hiện nét đúng | e2e |
| TC-S6.3-AC1-7 | S6.3-AC1 Sai nét vẫn báo ngay nhưng không hiện nét đúng | Sáng/Tối | Làm lại TC-S6.3-AC1-6 ở giao diện sáng rồi tối | Thông báo sai nét đọc rõ ở cả hai giao diện; khung không hiện nét đúng | không |
| TC-S6.3-AC1-8 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | Chức năng | Mở 人 ở khung có gợi ý, viết xong cả 2 nét | Màn báo viết xong có nút "Thử viết không gợi ý" | e2e |
| TC-S6.3-AC1-9 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | A11y | Ở màn báo viết xong của 人 (khung có gợi ý), dùng phím Tab tới nút "Thử viết không gợi ý", bấm Enter | Nút nhận focus, focus nhìn thấy, có nhãn đọc được; Enter mở khung không gợi ý của 人 | không |
| TC-S6.3-AC1-10 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | Mobile 375 | Làm lại TC-S6.3-AC1-8 ở khổ 375 | Nút hiện đủ trong màn, bấm được, không cuộn ngang | không |
| TC-S6.3-AC1-11 | S6.3-AC1 Bấm nút thì vào khung không gợi ý | Chức năng | Ở màn báo viết xong của 人 (khung có gợi ý), bấm "Thử viết không gợi ý" | Khung viết của 人 hiện ở chế độ không gợi ý: trống, chưa có nét nào, không có nét mờ | e2e |
| TC-S6.3-AC1-12 | S6.3-AC1 Chữ không có dữ liệu nét thì không có chế độ không gợi ý | Chức năng | Mở chữ 龘 (không có dữ liệu nét) | Màn không có khung viết và không có nút "Thử viết không gợi ý" | e2e |
| TC-S6.3-AC2-1 | S6.3-AC2 Viết đúng hết thì chấm Dễ | Chức năng | 十 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 十, viết đúng cả 2 nét, không sai lần nào | Màn báo viết xong hiện bình thường, không có lựa chọn mức; mức "Dễ" kiểm theo Ghi chú | e2e |
| TC-S6.3-AC2-2 | S6.3-AC2 Sai 1 đến 2 lần thì chấm Được | Chức năng | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, sai 1 lần rồi viết xong; làm lại một lượt mới với 2 lần sai ở 2 nét khác nhau rồi viết xong | Mỗi lần sai đều báo ngay; cả hai lượt kết thúc ở màn báo viết xong, không có lựa chọn mức; mức "Được" kiểm theo Ghi chú | không |
| TC-S6.3-AC2-3 | S6.3-AC2 Một nét sai hai lần tính hai lần | Biên | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, sai cùng nét đầu 2 lần, viết đúng nét đó rồi viết xong, không sai nét nào khác | Mỗi lần sai đều báo ngay; màn báo viết xong bình thường; mức "Được" (và trường hợp sai 3 lần cùng nét là "Khó") kiểm theo Ghi chú | không |
| TC-S6.3-AC2-4 | S6.3-AC2 Sai từ 3 lần thì chấm Khó | Chức năng | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, sai đúng 3 lần (ở 3 nét khác nhau) rồi viết đúng cho xong | Mỗi lần sai đều báo ngay; màn báo viết xong, không có lựa chọn mức; mức "Khó" kiểm theo Ghi chú | e2e |
| TC-S6.3-AC2-5 | S6.3-AC2 Chữ không có thẻ chiều viết riêng thì bỏ qua | Chức năng | 爸 chỉ là thành phần của từ 爸爸, không có thẻ chiều viết riêng. Mở 爸 ở khung có gợi ý, viết xong, bấm "Thử viết không gợi ý", viết xong 8 nét | Màn báo viết xong hiện bình thường, không báo lỗi, không hộp thoại chấm; việc không ghi thẻ nào kiểm theo Ghi chú | e2e |
| TC-S6.3-AC2-6 | S6.3-AC2 Từ một chữ có thẻ thì ghi đúng thẻ của từ đó | Chức năng | 好 là từ một chữ có thẻ chiều viết; từ 你好 cũng có trong nội dung. Vào chế độ không gợi ý cho 好, viết xong không sai | Màn báo viết xong bình thường; việc chỉ thẻ của từ 好 được ghi kiểm theo Ghi chú | không |
| TC-S6.3-AC2-7 | S6.3-AC2 Màn báo xong của khung có gợi ý không chấm | Chức năng | 人 là từ một chữ có thẻ chiều viết. Viết xong 人 ở khung có gợi ý, rồi thoát màn | Thoát bình thường, không có hộp thoại hay lựa chọn mức nào hiện ra; việc không ghi mức kiểm theo Ghi chú | không |
| TC-S6.3-AC2-8 | S6.3-AC2 Bỏ dở thì chấm Quên | Chức năng | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, viết 2 nét đúng rồi bấm đổi sang chữ khác | Chuyển chữ bình thường, không có hộp thoại hay lựa chọn mức nào hiện ra; mức "Quên" kiểm theo Ghi chú | e2e |
| TC-S6.3-AC2-9 | S6.3-AC2 Bỏ dở chữ không có thẻ chiều viết riêng thì không ghi gì | Chức năng | 爸 chỉ là thành phần của từ 爸爸, không có thẻ chiều viết riêng. Vào chế độ không gợi ý cho 爸, viết 1 nét rồi thoát màn viết | Thoát bình thường, không báo lỗi, không hộp thoại chấm; việc không ghi thẻ nào, không tạo thẻ kiểm theo Ghi chú | không |
| TC-S6.3-AC2-10 | S6.3-AC2 Rời khi chưa viết nét nào thì không chấm | Biên | 十 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 十, thoát màn khi chưa thả nét nào | Thoát bình thường, không hộp thoại chấm; việc không ghi mức kiểm theo Ghi chú | không |
| TC-S6.3-AC2-11 | S6.3-AC2 Chạm một điểm hoặc nét quá ngắn không tính là đã viết nét | Biên | 十 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 十; chạm một điểm rồi thả; kéo một nét rất ngắn rồi thả; thoát màn | Hai lần chạm không bị coi là nét (không báo sai nét, khung không giữ nét nào); thoát bình thường; việc không chấm "Quên" kiểm theo Ghi chú | không |
| TC-S6.3-AC2-12 | S6.3-AC2 Đóng tab hoặc tắt app khi đang viết thì không chấm | Biên | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, viết 2 nét, đóng tab; mở lại app và mở lại 好 | App mở lại bình thường, không báo lỗi, không hộp thoại chấm; 好 mở được như thường; việc không ghi mức kiểm theo Ghi chú | không |
| TC-S6.3-AC2-13 | S6.3-AC2 Mỗi lượt chấm đúng một lần | Biên | 十 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 十, viết xong không sai, rồi thoát màn viết | Thoát bình thường, không hộp thoại chấm; việc thẻ chỉ nhận một mức "Dễ" (không thêm "Quên") kiểm theo Ghi chú | không |
| TC-S6.3-AC2-14 | S6.3-AC2 Viết lại cùng chữ là lượt mới | Chức năng | 好 là từ một chữ có thẻ chiều viết. Vào chế độ không gợi ý cho 好, sai 3 lần rồi viết xong; ở màn báo xong bấm "Viết lại không gợi ý"; viết xong lượt mới không sai | Màn báo xong có nút "Viết lại không gợi ý" và không có nút "Thử viết không gợi ý"; bấm thì khung không gợi ý của 好 hiện trống, chưa có nét nào, không có nét mờ; lượt mới viết xong ra màn báo xong bình thường; mức "Khó" rồi "Dễ" kiểm theo Ghi chú | e2e |
| TC-S6.3-AC2-15 | S6.3-AC2 Mức chấm ghi được khi offline và còn sau khi mở lại app | Offline | 好 là từ một chữ có thẻ chiều viết. Tắt mạng, vào chế độ không gợi ý cho 好, sai 1 lần rồi viết xong; đóng và mở lại app (vẫn offline) | Viết xong bình thường khi offline, màn báo viết xong, không báo lỗi; mở lại app không báo lỗi; mức "Được" còn sau khi mở lại kiểm theo Ghi chú | không |
| TC-S6.3-AC2-16 | S6.3-AC2 Màn viết không hiện lựa chọn mức | Chức năng | Vào chế độ không gợi ý cho 人, viết xong cả 2 nét | Màn không hiện nút hay lựa chọn Quên / Khó / Được / Dễ để bấm | e2e |
| TC-S6.3-AC2-17 | S6.3-AC2 Màn viết không hiện lựa chọn mức | A11y | Viết xong 人 ở chế độ không gợi ý, duyệt toàn màn bằng phím Tab | Không có điều khiển chọn mức nào nhận focus; focus nhìn thấy ở các nút còn lại | không |

## Ghi chú: phần kiểm bằng Vitest

Mức chấm và việc ghi thẻ không nhìn thấy trên giao diện, nên dev kiểm bằng Vitest (quy tắc quy mức ở tầng service, luồng phiên viết ở hook, kho tiến độ giả) trong PR code, tên test mang ID Scenario. QA khi nghiệm thu đối chiếu các test này đã pass trên CI. Trừ khi ghi khác, chữ là từ một chữ có thẻ chiều viết.

| Scenario | Vitest kiểm |
|---|---|
| S6.3-AC2 Viết đúng hết thì chấm Dễ | Viết xong 十, 0 lần sai: thẻ chiều viết của 十 nhận đúng một mức "Dễ" |
| S6.3-AC2 Sai 1 đến 2 lần thì chấm Được | Bảng trường hợp: 好 viết xong với 1 lần sai; với 2 lần sai: cả hai nhận "Được" |
| S6.3-AC2 Một nét sai hai lần tính hai lần | (a) cùng một nét sai 2 lần rồi đúng, xong chữ: "Được"; (b) cùng một nét sai 3 lần rồi đúng, xong chữ: "Khó" |
| S6.3-AC2 Sai từ 3 lần thì chấm Khó | Bảng trường hợp: đúng 3 lần sai (rải 3 nét); 5 lần sai: cả hai nhận "Khó" |
| S6.3-AC2 Chữ không có thẻ chiều viết riêng thì bỏ qua | (a) 爸, kho có thẻ chiều viết của từ 爸爸 nhưng không có của 爸; (b) 十 khi kho chưa có thẻ chiều viết nào. Viết xong: không thẻ nào bị ghi (kể cả thẻ của 爸爸), không tạo thẻ mới (không tính là lần viết đầu của S9.1) |
| S6.3-AC2 Từ một chữ có thẻ thì ghi đúng thẻ của từ đó | Kho có thẻ chiều viết của 好 và của 你好; viết xong 好, 0 lần sai: thẻ của 好 nhận "Dễ", thẻ của 你好 và mọi thẻ khác không đổi, không thẻ mới |
| S6.3-AC2 Màn báo xong của khung có gợi ý không chấm | Viết xong 好 ở khung có gợi ý rồi thoát: kho không bị ghi |
| S6.3-AC2 Bỏ dở thì chấm Quên | Thả 2 nét đúng rồi đổi chữ; thả 2 nét đúng rồi thoát màn; mới thả 1 nét sai rồi rời: cả ba nhận đúng một mức "Quên" |
| S6.3-AC2 Bỏ dở chữ không có thẻ chiều viết riêng thì không ghi gì | (a) 爸 (chỉ có thẻ của 爸爸); (b) 十 khi chưa có thẻ. Thả 1 nét rồi thoát màn: không thẻ nào bị ghi (kể cả thẻ của 爸爸), không tạo thẻ mới |
| S6.3-AC2 Rời khi chưa viết nét nào thì không chấm | Thoát màn chưa thả nét; đổi chữ chưa thả nét; đã chạm khung nhưng chưa thả rồi rời: kho không bị ghi |
| S6.3-AC2 Chạm một điểm hoặc nét quá ngắn không tính là đã viết nét | (a) chạm một điểm rồi thoát; (b) nét dưới ngưỡng coi là nét rồi đổi chữ: kho không bị ghi, không có "Quên". (c) chạm một điểm rồi thả thêm 1 nét hợp lệ, thoát: đúng một mức "Quên" |
| S6.3-AC2 Đóng tab hoặc tắt app khi đang viết thì không chấm | Thả 2 nét, mô phỏng đóng trang: kho không bị ghi |
| S6.3-AC2 Mỗi lượt chấm đúng một lần | Viết xong 十 không sai rồi thoát: đúng một lần ghi "Dễ", không ghi thêm "Quên" |
| S6.3-AC2 Viết lại cùng chữ là lượt mới | Viết xong 好 với 3 lần sai ("Khó"), mô phỏng bấm "Viết lại không gợi ý", viết xong 0 lần sai: mỗi lượt ghi đúng một lần, "Khó" rồi "Dễ"; số lần sai lượt trước không cộng sang lượt sau; thẻ cuối mang "Dễ" |
| S6.3-AC2 Mức chấm ghi được khi offline và còn sau khi mở lại app | Kho IndexedDB giả: ghi "Được" cho thẻ chiều viết của 好, đóng và mở lại kho, đọc thẻ: vẫn mang "Được" |

## Câu hỏi mở (cho `ba`)

- Không có Scenario nào thiếu case. Một điểm cần xác nhận khi nghiệm thu: thông báo viết sai nét, "Thử viết không gợi ý" và "Viết lại không gợi ý" dùng nhãn tiếng Việt
  đúng như spec; nhãn thông báo sai nét do S6.2 quyết nên case chỉ kiểm có hiện, không kiểm câu chữ.
