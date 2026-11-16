# Test cases: S6.3 Viết không gợi ý

Bản nháp do `qa` soạn (bản 0.4, khớp spec sau khi chốt thẻ mức từ, Cách 1), QA người thật chỉnh khi nghiệm thu.

**Chữ thử** (đã kiểm `ls apps/web/src/assets/content/strokes/`, chỉ có 9 chữ có dữ liệu nét: 人 你 八 十 四 好 爸 白 百):
- **十** (2 nét), **人** (2 nét): chữ ngắn, dùng cho case cần viết nhanh. 十, 人, 好 đều là từ MỘT chữ có trong từ điển nội dung (đã kiểm `words.json`), nên có thẻ `X:writing`.
- **爸** (8 nét): chữ có dữ liệu nét nhưng chỉ là thành phần của từ 爸爸, không có từ một chữ 爸 (đã kiểm `words.json`), nên không có thẻ `爸:writing`. Dùng cho case "chữ không có thẻ riêng".
- **好** (6 nét): case cần sai nhiều lần, rải nhiều nét.
- **龘** (chữ Hán thật, **không** có dữ liệu nét): case chưa có khung viết. Thống nhất với S6.1/S6.2. Đã kiểm `ls apps/web/src/assets/content/strokes/`: không có 龘. Nếu S2.5 bổ sung dữ liệu nét cho 龘, đổi sang chữ khác không có trong thư mục trên.
- Mỗi lượt không gợi ý là MỘT chữ (như S6.2), nên không có case từ nhiều chữ.

**Điều kiện đầu chung:** S6.2 (khung viết có gợi ý) và S9.1 (thẻ chiều viết) đã có trên bản build. Viết bằng ngón tay/chuột là hành vi của S6.2, không kiểm ở đây. Trừ khi case ghi khác, chữ thử (十, 人, 好) là từ một chữ đã có thẻ chiều viết `X:writing`.

**Cách vào chế độ không gợi ý (dùng cho mọi case "mở ở chế độ không gợi ý"):** mở chữ ở khung có gợi ý (S6.2), viết xong
chữ, ở màn báo đã viết xong bấm "Thử viết không gợi ý". Mỗi lần bấm "Thử viết không gợi ý" ở khung có gợi ý mở một lượt mới. Ở màn báo xong của khung KHÔNG gợi ý, nút mở lượt mới cùng chữ là "Viết lại không gợi ý" (không có nút "Thử viết không gợi ý" ở đó).

**Cách quan sát mức chấm:** màn ôn tập (S9.2) chưa có, nên mức chấm KHÔNG kiểm bằng giao diện. Kiểm ở tầng service: Vitest
đọc thẻ chiều viết trong kho tiến độ (kho giả trong bộ nhớ, hoặc IndexedDB giả) sau mỗi lượt và so mức đã ghi
(Quên/Khó/Được/Dễ). Case cột Tự động = `e2e` chỉ kiểm thứ nhìn thấy trên giao diện (khung, nút, thông báo sai nét, không có
lựa chọn mức). Việc kiểm "có ghi thẻ nào không", "ghi đúng thẻ nào", "còn sau khi mở lại" là của case Vitest; case chạy tay và e2e chỉ quan sát thứ nhìn thấy (viết xong bình thường, không báo lỗi, không hộp thoại chấm, mở lại app không lỗi). Cột Tự động: `e2e` (Playwright), `Vitest` (service hoặc Testing Library), `không` (QA chạy tay).

**Ngoài phạm vi:** A11y và Sáng/Tối chỉ ghi cho AC1 (có yêu cầu hiển thị: khung trống, nét mờ). AC2 không có yêu cầu hiển thị nào
ngoài "không hiện lựa chọn mức" nên chỉ có một case A11y cho điều đó; không bịa thêm.

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.3-AC1-1 | S6.3-AC1 Khung viết trống, không có nét mờ | Chức năng | Vào chế độ không gợi ý cho chữ 十 (theo cách vào ở trên) | Khung viết không có nét mờ nào của 十. Nếu khung có ô lưới hoặc đường kẻ thì vẫn hiện | e2e |
| TC-S6.3-AC1-2 | S6.3-AC1 Khung viết trống, không có nét mờ | Sáng/Tối | Làm lại TC-S6.3-AC1-1 ở giao diện sáng rồi tối | Cả hai giao diện: không có nét mờ của chữ (kể cả viền rất nhạt); ô lưới/đường kẻ nếu có vẫn nhìn rõ | không |
| TC-S6.3-AC1-3 | S6.3-AC1 Khung viết trống, không có nét mờ | Mobile 375 | Ở khổ 375, vào chế độ không gợi ý cho chữ 好 | Không có nét mờ của chữ; ô lưới/đường kẻ nếu có vẫn hiện; khung vừa màn hình, không cuộn ngang | không |
| TC-S6.3-AC1-4 | S6.3-AC1 Sai nhiều lần liên tiếp vẫn không hiện gợi ý nét | Chức năng | Vào chế độ không gợi ý cho 十. Viết sai liên tiếp 3 lần ở nét đầu | Sau lần sai thứ 3, khung không hiện gợi ý nét đó | e2e |
| TC-S6.3-AC1-5 | S6.3-AC1 Sai nhiều lần liên tiếp vẫn không hiện gợi ý nét | Biên | Vào chế độ không gợi ý cho 十. Viết sai 5 lần liên tiếp ở nét đầu | Từ lần sai thứ 3 trở đi khung đều không hiện gợi ý nét | không |
| TC-S6.3-AC1-6 | S6.3-AC1 Sai nét vẫn báo ngay nhưng không hiện nét đúng | Chức năng | Vào chế độ không gợi ý cho 十. Viết một nét không đúng nét kế tiếp, thả tay/nhả chuột | Thông báo viết sai nét hiện ngay; nét sai bị xoá khỏi khung; khung không hiện nét đúng hay vị trí, hướng của nét đó | e2e |
| TC-S6.3-AC1-7 | S6.3-AC1 Sai nét vẫn báo ngay nhưng không hiện nét đúng | Sáng/Tối | Làm lại TC-S6.3-AC1-6 ở giao diện sáng rồi tối | Thông báo sai nét đọc rõ ở cả hai giao diện; khung không hiện nét đúng | không |
| TC-S6.3-AC1-8 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | Chức năng | Mở 人 ở khung có gợi ý, viết xong cả 2 nét | Màn báo viết xong có nút "Thử viết không gợi ý" | e2e |
| TC-S6.3-AC1-9 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | A11y | Ở màn báo viết xong của 人, dùng phím Tab tới nút "Thử viết không gợi ý", bấm Enter | Nút nhận focus, focus nhìn thấy, có nhãn đọc được; Enter mở khung không gợi ý của 人 | không |
| TC-S6.3-AC1-10 | S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong | Mobile 375 | Làm lại TC-S6.3-AC1-8 ở khổ 375 | Nút hiện đủ trong màn, bấm được, không cuộn ngang | không |
| TC-S6.3-AC1-11 | S6.3-AC1 Bấm nút thì vào khung không gợi ý | Chức năng | Ở màn báo viết xong của 人, bấm "Thử viết không gợi ý" | Khung viết của 人 hiện trống, chưa có nét nào, không có nét mờ | e2e |
| TC-S6.3-AC1-12 | S6.3-AC1 Chữ không có dữ liệu nét thì không có chế độ không gợi ý | Chức năng | Mở chữ 龘 (không có dữ liệu nét) | Màn không có khung viết và không có nút "Thử viết không gợi ý" | e2e |
| TC-S6.3-AC2-1 | S6.3-AC2 Viết đúng hết thì chấm Dễ | Chức năng | Vitest: viết xong 十 ở chế độ không gợi ý, 2 nét đúng, 0 lần sai | Thẻ `十:writing` nhận đúng một mức "Dễ" | Vitest |
| TC-S6.3-AC2-2 | S6.3-AC2 Viết đúng hết thì chấm Dễ | Chức năng (giao diện) | Như TC-S6.3-AC2-1 trên bản build | Viết xong, màn báo viết xong hiện bình thường, không có lựa chọn mức | e2e |
| TC-S6.3-AC2-3 | S6.3-AC2 Sai 1 đến 2 lần thì chấm Được | Chức năng | Vitest bảng trường hợp: viết xong 好 với 1 lần sai nét; viết xong 好 với 2 lần sai nét | Cả hai trường hợp thẻ `好:writing` nhận "Được" | Vitest |
| TC-S6.3-AC2-4 | S6.3-AC2 Một nét sai hai lần tính hai lần | Biên | Vitest bảng trường hợp: (a) 好 sai cùng một nét 2 lần rồi viết đúng, xong chữ; (b) cùng một nét sai 3 lần rồi viết đúng, xong chữ | (a) "Được"; (b) "Khó" | Vitest |
| TC-S6.3-AC2-5 | S6.3-AC2 Sai từ 3 lần thì chấm Khó | Biên | Vitest bảng trường hợp: viết xong 好 với đúng 3 lần sai nét (rải ở 3 nét khác nhau); viết xong với 5 lần sai nét | Cả hai trường hợp thẻ `好:writing` nhận "Khó" | Vitest |
| TC-S6.3-AC2-6 | S6.3-AC2 Sai từ 3 lần thì chấm Khó | Chức năng (giao diện) | Trên bản build: vào chế độ không gợi ý cho 好, sai đúng 3 lần rồi viết đúng cho xong | Mỗi lần sai đều báo ngay; viết xong màn báo viết xong, không có lựa chọn mức | e2e |
| TC-S6.3-AC2-7 | S6.3-AC2 Chữ không có thẻ chiều viết riêng thì bỏ qua | Biên | Vitest bảng trường hợp: (a) 爸 chỉ là thành phần của từ 爸爸, kho có thẻ `爸爸:writing` nhưng không có `爸:writing`; viết xong 爸 ở chế độ không gợi ý; (b) chữ 十 khi kho chưa có thẻ chiều viết nào; viết xong ở chế độ không gợi ý | Cả hai trường hợp: không thẻ nào bị ghi (kể cả `爸爸:writing`), không tạo thẻ mới, thẻ chiều viết không được tạo từ lần viết đó (không tính là lần viết đầu của S9.1) | Vitest |
| TC-S6.3-AC2-8 | S6.3-AC2 Chữ không có thẻ chiều viết riêng thì bỏ qua | Chức năng (giao diện) | Trên bản build: mở 爸 ở khung có gợi ý, viết xong, bấm "Thử viết không gợi ý", viết xong 8 nét ở chế độ không gợi ý | Màn báo viết xong hiện bình thường, không báo lỗi, không hộp thoại chấm | e2e |
| TC-S6.3-AC2-9 | S6.3-AC2 Từ một chữ có thẻ thì ghi đúng thẻ của từ đó | Chức năng | Vitest: kho có thẻ `好:writing` và thẻ của từ chứa 好 (ví dụ `你好:writing`); viết xong 好 ở chế độ không gợi ý với 0 lần sai | Thẻ `好:writing` nhận "Dễ"; mọi thẻ khác (kể cả `你好:writing`) không đổi, không thẻ mới | Vitest |
| TC-S6.3-AC2-10 | S6.3-AC2 Viết lại cùng chữ là lượt mới khi bấm nút ở màn báo xong không gợi ý | Chức năng (giao diện) | Trên bản build: viết xong 人 ở chế độ không gợi ý; ở màn báo xong tìm nút, bấm "Viết lại không gợi ý" | Màn báo xong có nút "Viết lại không gợi ý" và không có nút "Thử viết không gợi ý"; bấm thì khung không gợi ý của 人 hiện trống, chưa có nét nào, không có nét mờ | e2e |
| TC-S6.3-AC2-11 | S6.3-AC2 Viết lại cùng chữ là lượt mới khi bấm nút ở màn báo xong không gợi ý | Chức năng | Vitest: viết xong 人 ở chế độ không gợi ý với 1 lần sai; mô phỏng bấm "Viết lại không gợi ý"; viết xong lượt mới với 0 lần sai | Hai lượt, mỗi lượt đúng một lần ghi vào `人:writing`: "Được" rồi "Dễ"; số lần sai lượt trước không cộng sang | Vitest |
| TC-S6.3-AC2-12 | S6.3-AC2 Màn báo xong của khung có gợi ý không chấm | Chức năng | Vitest: viết xong 好 ở khung có gợi ý (S6.2), rồi thoát màn | Không có mức chấm nào được ghi vào `好:writing` (kho không bị ghi) | Vitest |
| TC-S6.3-AC2-13 | S6.3-AC2 Màn báo xong của khung có gợi ý không chấm | Chức năng (giao diện) | Trên bản build: viết xong 人 ở khung có gợi ý, rồi thoát màn | Thoát bình thường, không có hộp thoại hay lựa chọn mức nào hiện ra | không |
| TC-S6.3-AC2-14 | S6.3-AC2 Bỏ dở thì chấm Quên | Chức năng | Vitest: mở 好 ở chế độ không gợi ý, thả 2 nét đúng rồi đổi sang chữ khác; lặp lại với thoát màn viết; lặp lại với trường hợp mới thả 1 nét sai rồi rời | Cả ba trường hợp thẻ `好:writing` nhận đúng một mức "Quên" | Vitest |
| TC-S6.3-AC2-15 | S6.3-AC2 Bỏ dở thì chấm Quên | Chức năng (giao diện) | Trên bản build: vào chế độ không gợi ý cho 好, viết 2 nét đúng rồi bấm đổi sang chữ khác | Chuyển chữ bình thường, không có hộp thoại hay lựa chọn mức nào hiện ra | e2e |
| TC-S6.3-AC2-16 | S6.3-AC2 Rời khi chưa viết nét nào thì không chấm | Biên | Vitest: mở 十 ở chế độ không gợi ý, thoát màn chưa thả nét nào; lặp lại với đổi sang chữ khác; lặp lại với đã bắt đầu chạm khung nhưng chưa thả | Thẻ `十:writing` không có mức chấm mới (kho không bị ghi) | Vitest |
| TC-S6.3-AC2-17 | S6.3-AC2 Chạm một điểm hoặc nét quá ngắn không tính là đã viết nét | Biên | Vitest bảng trường hợp: mở 十 ở chế độ không gợi ý; (a) chạm/nhấp một điểm rồi thả, thoát màn; (b) kéo một nét quá ngắn (dưới ngưỡng coi là một nét theo S6.2 AC3) rồi thả, đổi sang chữ khác | Cả hai trường hợp thẻ `十:writing` không có mức chấm mới, đặc biệt không có "Quên" (kho không bị ghi) | Vitest |
| TC-S6.3-AC2-18 | S6.3-AC2 Chạm một điểm hoặc nét quá ngắn không tính là đã viết nét | Biên | Vitest: mở 十, chạm một điểm rồi thả, sau đó thả thêm 1 nét hợp lệ rồi thoát màn | Thẻ nhận đúng một mức "Quên" (chỉ nét hợp lệ mới tính là đã thả nét; điểm chạm trước đó không làm đổi kết quả) | Vitest |
| TC-S6.3-AC2-19 | S6.3-AC2 Đóng tab hoặc tắt app khi đang viết thì không chấm | Biên | Vitest: mở 好 ở chế độ không gợi ý, thả 2 nét, mô phỏng sự kiện đóng trang | Kho thẻ không bị ghi (thẻ `好:writing` không có mức chấm mới) | Vitest |
| TC-S6.3-AC2-20 | S6.3-AC2 Đóng tab hoặc tắt app khi đang viết thì không chấm | Biên | QA chạy tay trên bản build: mở 好 ở chế độ không gợi ý, thả 2 nét, đóng tab, rồi mở lại app và mở lại 好 | App mở lại bình thường, không báo lỗi, không hộp thoại chấm; 好 mở được như thường | không |
| TC-S6.3-AC2-21 | S6.3-AC2 Mỗi lượt chấm đúng một lần | Biên | Vitest: viết xong 十 (không sai nét nào) rồi thoát màn viết; đếm số lần ghi vào thẻ | Thẻ `十:writing` nhận đúng một mức "Dễ", không có thêm lần ghi "Quên" khi thoát | Vitest |
| TC-S6.3-AC2-22 | S6.3-AC2 Viết lại cùng chữ là lượt mới | Biên | Vitest: viết xong 好 với 3 lần sai (Khó); mở lại 好 ở chế độ không gợi ý (lượt mới, theo cách vào của từng màn) và viết xong với 0 lần sai | Hai lượt có hai mức riêng: lượt đầu "Khó", lượt sau "Dễ"; thẻ cuối cùng mang "Dễ"; số lần sai lượt trước không cộng sang lượt sau | Vitest |
| TC-S6.3-AC2-23 | S6.3-AC2 Mức chấm ghi được khi offline và còn sau khi mở lại app | Offline | Vitest: kho IndexedDB giả, ghi mức "Được" cho `好:writing` rồi đóng và mở lại kho, đọc thẻ | Thẻ `好:writing` vẫn mang mức "Được" của lần viết đó | Vitest |
| TC-S6.3-AC2-24 | S6.3-AC2 Mức chấm ghi được khi offline và còn sau khi mở lại app | Offline | Trên bản build: tắt mạng, vào chế độ không gợi ý cho 好, sai 1 lần rồi viết xong; đóng và mở lại app (vẫn offline) | Viết xong bình thường khi offline, màn báo viết xong, không báo lỗi; mở lại app không báo lỗi | không |
| TC-S6.3-AC2-25 | S6.3-AC2 Màn viết không hiện lựa chọn mức | Chức năng | Vào chế độ không gợi ý cho 人, viết xong cả 2 nét | Màn không hiện nút hay lựa chọn Quên / Khó / Được / Dễ để bấm | e2e |
| TC-S6.3-AC2-26 | S6.3-AC2 Màn viết không hiện lựa chọn mức | A11y | Viết xong 人 ở chế độ không gợi ý, duyệt toàn màn bằng phím Tab | Không có điều khiển chọn mức nào nhận focus; focus nhìn thấy ở các nút còn lại | không |

## Câu hỏi mở (cho `ba`)

- Không có Scenario nào thiếu case. Một điểm cần xác nhận khi nghiệm thu: thông báo viết sai nét, "Thử viết không gợi ý" và "Viết lại không gợi ý" dùng nhãn tiếng Việt
  đúng như spec; nhãn thông báo sai nét do S6.2 quyết nên case chỉ kiểm có hiện, không kiểm câu chữ.
