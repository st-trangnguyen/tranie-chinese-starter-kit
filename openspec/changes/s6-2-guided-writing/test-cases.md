# Test cases: S6.2 Viết theo nét có gợi ý

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu.

**Điều kiện đầu chung**

- **Cách mở màn luyện viết**: "Mở luyện viết chữ X" nghĩa là mở màn xem thứ tự nét của chữ X (S6.1) rồi bấm nút "Tập viết".
  Đây là lối vào duy nhất của S6.2; lối vào từ thẻ từ vựng hoặc bài học thuộc story khác nên không kiểm ở đây. Cần S6.1 đã merge và
  có nút "Tập viết" trên bản build.
- **Dữ liệu mẫu có dữ liệu nét**: 十 (2 nét: nét ngang từ trái sang phải trước, nét sổ dọc từ trên xuống sau), 人 (2 nét: phẩy trước, mác sau),
  你 (7 nét). Đã kiểm thư mục dữ liệu nét hiện có các chữ 人 你 八 十 四 好 爸 白 百.
- **Chữ không có dữ liệu nét**: 龘 (không có trong thư mục dữ liệu nét; cùng chữ mẫu với spec S6.1). Đây là dữ liệu mẫu tạm: nếu S2.5
  bổ sung dữ liệu cho 龘 thì đổi sang một chữ khác vẫn chưa có.
- **Nét sai** ở các case dưới là nét viết rõ ràng không khớp nét kế tiếp (không sát ngưỡng dung sai), gồm ba kiểu: nét của nét khác
  (vẽ nét sổ dọc khi 十 đang chờ nét ngang), ngược hướng (vẽ nét ngang từ phải sang trái), hoặc hình dạng khác hẳn (vẽ vòng tròn).
- Mỗi case bắt đầu từ trạng thái vừa mở luyện viết chữ đó, chưa viết nét nào, trừ khi nêu khác.
- **Ngưỡng nhìn rõ** (CLAUDE.md §7, áp cho mọi case "đọc rõ" dưới đây): chữ và thông báo tương phản ≥ 4.5:1; nét viết, nét gợi ý,
  điểm bắt đầu, mũi tên và viền focus tương phản ≥ 3:1 với nền; nút và liên kết có vùng chạm ≥ 44×44 px.

**Cột Tự động**: `e2e` = Playwright (không cần vẽ cử chỉ: mở màn, focus, Tab/Enter, offline); `Vitest` = chạy ở Vitest/Testing Library với
bộ so nét giả (case vẽ nét; vẽ bằng cử chỉ khó ổn định trên Playwright, xem "Tầng test" trong proposal), QA vẫn chạy tay khi nghiệm thu;
`không` = chỉ chạy tay (mắt nhìn, thiết bị thật, trình đọc màn hình).

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S6.2-AC1-1 | S6.2-AC1 Hiện khung viết cho chữ có dữ liệu nét | Chức năng | Mở luyện viết chữ 十 | Màn hiện khung viết trống, chưa có nét nào trên khung | e2e |
| TC-S6.2-AC1-2 | S6.2-AC1 Hiện khung viết cho chữ có dữ liệu nét | Mobile 375 | Khổ 375×812, mở luyện viết chữ 你 | Khung viết nằm gọn trong màn hình, không cuộn ngang, cạnh ngắn nhất của khung ≥ 240 px để viết bằng ngón tay | e2e |
| TC-S6.2-AC1-3 | S6.2-AC1 Hiện khung viết cho chữ có dữ liệu nét | Sáng/Tối | Mở luyện viết chữ 十 ở giao diện sáng rồi tối, viết đúng nét ngang | Viền khung và nét viết tương phản ≥ 3:1 với nền ở cả hai giao diện | không |
| TC-S6.2-AC1-4 | S6.2-AC1 Viết bằng chuột | Chức năng | Nhấn giữ chuột trong khung, kéo ngang từ trái sang phải, chưa nhả | Nét hiện ra theo đường chuột ngay khi kéo, không đợi nhả chuột | Vitest |
| TC-S6.2-AC1-5 | S6.2-AC1 Viết bằng chuột | Biên | Nhấn giữ chuột trong khung, kéo ra ngoài rìa khung rồi nhả | Nét không kẹt ở trạng thái đang viết; lần nhấn kế tiếp trong khung vẫn viết được bình thường | không |
| TC-S6.2-AC1-6 | S6.2-AC1 Viết bằng ngón tay | Chức năng | Trên màn cảm ứng (hoặc giả lập cảm ứng 375×812), chạm và kéo ngón tay trong khung viết | Nét hiện ra theo ngón tay ngay khi kéo | Vitest |
| TC-S6.2-AC1-7 | S6.2-AC1 Viết bằng ngón tay | Mobile 375 | Trên trang đủ dài để cuộn được, kéo ngón tay dọc từ trên xuống dưới trong khung viết | Trang không cuộn khi viết trong khung; kéo ngoài khung thì trang vẫn cuộn bình thường | không |
| TC-S6.2-AC1-8 | S6.2-AC1 Viết đúng nét thì sang nét kế | Chức năng | Mở chữ 十, viết nét ngang rõ ràng từ trái sang phải | Nét ngang được giữ lại trên khung; không có thông báo sai; chưa báo hoàn thành; viết tiếp nét sổ được | Vitest |
| TC-S6.2-AC1-9 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Chức năng | Mở chữ 十, viết đúng nét ngang rồi nét sổ dọc từ trên xuống | Sau nét cuối màn báo đã viết xong chữ; cả hai nét còn trên khung; màn không chuyển sang màn khác; có nút "Viết lại"; không có điểm hay tiến độ nào hiện ra | Vitest |
| TC-S6.2-AC1-10 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Biên | Mở chữ 你 (7 nét), viết đúng lần lượt 7 nét | Chỉ báo hoàn thành sau nét thứ 7, không báo sớm ở nét nào trước đó | Vitest |
| TC-S6.2-AC1-11 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Biên | Sau khi đã báo hoàn thành chữ 十, viết thêm một nét trong khung | Không phát sinh thông báo sai hay gợi ý; màn vẫn ở trạng thái đã xong, không lỗi | Vitest |
| TC-S6.2-AC1-12 | S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ | Sáng/Tối, A11y | Hoàn thành chữ 十 ở giao diện sáng rồi tối | Thông báo hoàn thành và nút "Viết lại" đọc rõ (chữ ≥ 4.5:1, vùng chạm nút ≥ 44×44 px); trình đọc màn hình đọc được thông báo hoàn thành | không |
| TC-S6.2-AC1-13 | S6.2-AC1 Viết lại sau khi hoàn thành | Chức năng | Hoàn thành chữ 十, bấm "Viết lại" | Khung viết trống (cả hai nét biến mất), thông báo hoàn thành biến mất, nút "Viết lại" không còn; viết đúng nét ngang được nhận như nét đầu | Vitest |
| TC-S6.2-AC1-14 | S6.2-AC1 Viết lại sau khi hoàn thành | Biên | Sai 2 lần ở nét sổ của 十, hoàn thành chữ, bấm "Viết lại", sai nét ngang 1 lần | Chưa hiện gợi ý (bộ đếm sai bắt đầu lại từ 0 sau "Viết lại") | Vitest |
| TC-S6.2-AC1-15 | S6.2-AC1 Chạm một điểm thì bỏ qua | Chức năng | Mở chữ 十, chạm (hoặc nhấp chuột) một điểm trong khung rồi nhả, không kéo | Không có thông báo viết sai nét; không có nét nào được giữ lại trên khung; chữ vẫn chờ nét ngang | Vitest |
| TC-S6.2-AC1-16 | S6.2-AC1 Chạm một điểm thì bỏ qua | Biên | Mở chữ 十, kéo một nét rất ngắn (vài px) rồi nhả | Không có thông báo viết sai nét; không có nét nào được giữ lại; chữ vẫn chờ nét ngang | Vitest |
| TC-S6.2-AC1-17 | S6.2-AC1 Chạm một điểm thì bỏ qua | Biên | Mở chữ 十, chạm một điểm 5 lần liên tiếp rồi viết đúng nét ngang | Không có thông báo, không hiện gợi ý; nét ngang đúng vẫn được nhận | Vitest |
| TC-S6.2-VIEW-1 | S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét | Chức năng | Mở màn xem thứ tự nét của chữ 人, bấm "Tập viết" | Màn luyện viết của 人 mở, chỉ có một khung viết của chữ 人; có liên kết "Xem thứ tự nét" | e2e |
| TC-S6.2-VIEW-2 | S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét | Chức năng | Từ màn luyện viết chữ 人, bấm liên kết "Xem thứ tự nét" | Về đúng màn xem thứ tự nét của chữ 人 (không phải chữ khác); bấm "Tập viết" lần nữa thì vào lại, khung trống | e2e |
| TC-S6.2-VIEW-3 | S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét | Mobile 375 | Khổ 375×812, mở luyện viết chữ 人 | Nút "Tập viết" và liên kết "Xem thứ tự nét" có vùng chạm ≥ 44×44 px, không bị khung viết che; không cuộn ngang | e2e |
| TC-S6.2-VIEW-4 | S6.2-AC1 Chữ không có dữ liệu nét | Chức năng | Mở luyện viết chữ 龘 (từ màn xem thứ tự nét của 龘) | Không hiện khung viết; hiện thông báo "Chưa có hướng dẫn viết cho chữ này."; liên kết "Xem thứ tự nét" vẫn dùng được | e2e |
| TC-S6.2-VIEW-5 | S6.2-AC1 Chữ không có dữ liệu nét | Offline | Mở app một lần, tắt mạng, mở luyện viết chữ 十 rồi chữ 龘 | 十 vẫn hiện khung viết và viết được; 龘 vẫn hiện "Chưa có hướng dẫn viết cho chữ này." | e2e |
| TC-S6.2-KBD-1 | S6.2-AC1 Khung viết nhận focus bàn phím | A11y | Mở luyện viết chữ 十, nhấn Tab cho đến khi vào khung viết | Khung viết nhận focus; viền focus nhìn thấy (tương phản ≥ 3:1 với nền) ở cả giao diện sáng và tối | e2e |
| TC-S6.2-KBD-2 | S6.2-AC1 Khung viết nhận focus bàn phím | A11y | Bật trình đọc màn hình, đưa focus vào khung viết của chữ 十 | Trình đọc màn hình đọc nhãn của khung, trong đó có nêu chữ 十 | không |
| TC-S6.2-KBD-3 | S6.2-AC1 Khung viết nhận focus bàn phím | Biên | Đưa focus vào khung viết, nhấn các phím chữ, số, Space, Enter, mũi tên | Không có nét nào được tạo, không thông báo sai, không gợi ý, trang không lỗi (viết không cần bàn phím) | e2e |
| TC-S6.2-KBD-4 | S6.2-AC1 Đường thay thế khi không dùng được chuột hoặc cảm ứng | A11y | Chỉ dùng bàn phím trên màn luyện viết chữ 人: Tab đến liên kết "Xem thứ tự nét", nhấn Enter | Liên kết nhận focus bằng Tab (có viền focus); Enter mở màn xem thứ tự nét của chữ 人 | e2e |
| TC-S6.2-AC2-1 | S6.2-AC2 Báo ngay khi viết sai nét | Chức năng | Mở chữ 十, vẽ vòng tròn (hình dạng khác hẳn nét ngang), nhả chuột | Ngay sau khi nhả, màn hiện thông báo viết sai nét; trong lúc đang kéo chưa có thông báo | Vitest |
| TC-S6.2-AC2-2 | S6.2-AC2 Báo ngay khi viết sai nét | Sáng/Tối | Gây thông báo viết sai nét ở giao diện sáng rồi tối | Thông báo là chữ (không chỉ phân biệt bằng màu), tương phản chữ ≥ 4.5:1 ở cả hai giao diện | không |
| TC-S6.2-AC2-3 | S6.2-AC2 Viết ngược hướng thì sai | Chức năng | Mở chữ 十 (đang chờ nét ngang), vẽ nét ngang từ phải sang trái, nhả | Màn hiện thông báo viết sai nét; nét vừa vẽ bị xoá; chữ vẫn chờ nét ngang | Vitest |
| TC-S6.2-AC2-4 | S6.2-AC2 Viết ngược hướng thì sai | Biên | Mở chữ 十, vẽ nét sổ dọc từ dưới lên trên (ngược hướng) ở nét thứ hai: trước đó viết đúng nét ngang | Màn hiện thông báo viết sai nét; nét sổ ngược bị xoá; chữ vẫn chờ nét sổ | Vitest |
| TC-S6.2-AC2-5 | S6.2-AC2 Viết nét của một nét khác thì sai | Chức năng | Mở chữ 十 (đang chờ nét ngang), vẽ nét sổ dọc từ trên xuống, nhả | Màn hiện thông báo viết sai nét; nét sổ dọc không được giữ lại trên khung; chữ vẫn chờ nét ngang | Vitest |
| TC-S6.2-AC2-6 | S6.2-AC2 Nét sai bị xoá và được viết lại | Chức năng | Mở chữ 十, vẽ nét sai, nhả; sau đó viết nét ngang đúng | Nét sai biến mất khỏi khung ngay sau khi nhả; nét ngang đúng được nhận, chữ sang nét kế | Vitest |
| TC-S6.2-AC2-7 | S6.2-AC2 Nét sai bị xoá và được viết lại | Biên | Viết sai 5 lần liên tiếp ở nét đầu của chữ 十 | Bài không bị chặn hay kết thúc; sau mỗi lần sai vẫn viết lại được; khung không còn nét sai nào tồn đọng | Vitest |
| TC-S6.2-AC2-8 | S6.2-AC2 Nét sai bị xoá và được viết lại | Mobile 375 | Trên màn cảm ứng 375, viết sai một nét bằng ngón tay rồi viết lại đúng | Nét sai bị xoá, viết lại đúng được nhận, trang không cuộn | không |
| TC-S6.2-AC2-9 | S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình | A11y | Bật trình đọc màn hình, viết sai một nét, nhả | Trình đọc màn hình đọc thông báo viết sai nét mà không cần di chuyển focus | không |
| TC-S6.2-AC2-10 | S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình | A11y | Dùng Tab đưa focus vào khung viết (thấy viền focus), viết sai một nét bằng chuột hoặc ngón tay | Khi thông báo hiện, focus vẫn ở khung viết, viền focus vẫn nhìn thấy | Vitest |
| TC-S6.2-AC2-11 | S6.2-AC2 Viết đúng thì thông báo sai biến mất | Chức năng | Viết sai nét ngang của 十 (thấy thông báo), rồi viết đúng nét ngang | Thông báo viết sai không còn hiện | Vitest |
| TC-S6.2-AC3-1 | S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý | Chức năng | Mở chữ 十, viết sai nét đầu đúng 2 lần liên tiếp | Mỗi lần sai có thông báo sai; màn chưa hiện gợi ý (không có nét mờ, điểm bắt đầu, mũi tên) | Vitest |
| TC-S6.2-AC3-2 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Chức năng | Mở chữ 十, viết sai nét đầu đúng 3 lần liên tiếp | Sau lần sai thứ 3, khung hiện nét ngang đúng dạng mờ, có điểm bắt đầu ở đầu bên trái và mũi tên chỉ sang phải; không hiện gợi ý ở lần sai thứ 1 và 2 | Vitest |
| TC-S6.2-AC3-3 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Mobile 375 | Trên màn cảm ứng 375, sai 3 lần liên tiếp ở nét đầu của 你 | Gợi ý nằm gọn trong khung, nét gợi ý và điểm bắt đầu và mũi tên nhìn rõ (≥ 3:1 với nền), không che hết nét đã viết đúng | không |
| TC-S6.2-AC3-4 | S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý | Sáng/Tối | Gây gợi ý ở giao diện sáng rồi tối | Nét gợi ý, điểm bắt đầu, mũi tên tương phản ≥ 3:1 với nền ở cả hai giao diện, và phân biệt được với nét người học viết (mờ hơn, không phải chỉ khác màu) | không |
| TC-S6.2-AC3-5 | S6.2-AC3 Viết đúng xen giữa thì đếm lại | Chức năng | Mở chữ 十: sai nét ngang 2 lần, viết đúng nét ngang, rồi sai nét sổ 2 lần | Không hiện gợi ý ở bất kỳ bước nào | Vitest |
| TC-S6.2-AC3-6 | S6.2-AC3 Nét kế sai 3 lần thì gợi ý nét kế | Chức năng | Mở chữ 十: sai nét ngang 2 lần, viết đúng nét ngang, rồi sai nét sổ 3 lần | Sau lần sai thứ 3 của nét sổ, hiện gợi ý của nét sổ dọc (nét mờ thẳng đứng, điểm bắt đầu ở đầu trên, mũi tên chỉ xuống), không phải gợi ý nét ngang; không hiện gợi ý trước lần sai thứ 3 của nét sổ | Vitest |
| TC-S6.2-AC3-7 | S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai | Chức năng | Mở chữ 十: sai nét ngang 2 lần, chạm một điểm trong khung, rồi sai nét ngang thêm 1 lần | Lần chạm một điểm không có thông báo và chưa hiện gợi ý; gợi ý hiện ở lần sai thứ 3 | Vitest |
| TC-S6.2-AC3-8 | S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai | Biên | Mở chữ 十: sai nét ngang 1 lần, chạm một điểm 3 lần, rồi sai thêm 1 lần | Chưa hiện gợi ý (mới sai 2 lần, các lần chạm không được đếm) | Vitest |
| TC-S6.2-AC3-9 | S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai | Chức năng | Mở chữ 十, sai nét đầu 3 lần (gợi ý hiện), sai thêm 1 lần | Gợi ý vẫn hiện sau lần sai thứ 4, không nháy tắt rồi hiện lại | Vitest |
| TC-S6.2-AC3-10 | S6.2-AC3 Viết đúng thì gợi ý ẩn | Chức năng | Mở chữ 十, sai nét ngang 3 lần (gợi ý hiện), rồi viết đúng nét ngang | Gợi ý biến mất; nét ngang được giữ; chờ nét sổ, không hiện gợi ý cho nét sổ | Vitest |
| TC-S6.2-AC3-11 | S6.2-AC3 Gợi ý không phụ thuộc chuyển động | A11y | Bật giảm chuyển động của hệ điều hành, sai nét đầu 3 lần | Gợi ý (nét mờ, điểm bắt đầu, mũi tên) hiện tĩnh, không nháy, không chạy animation | Vitest |
| TC-S6.2-AC3-12 | S6.2-AC3 Gợi ý không phụ thuộc chuyển động | Chức năng | Tắt giảm chuyển động, sai nét đầu 3 lần | Gợi ý vẫn hiện đủ ba phần (nét mờ, điểm bắt đầu, mũi tên) và vẫn nhìn rõ; spec không yêu cầu chuyển động khi tắt giảm chuyển động | không |

## Phạm vi và ghi chú cho QA

- Chưa có case cho ngưỡng dung sai của "sai nét": spec để con số dung sai cho design.md, nên các case dùng nét sai rõ ràng.
  Khi design.md chốt ngưỡng thì Dev thêm test ở Vitest, QA bổ sung case sát ngưỡng.
- Chạm một điểm / nét quá ngắn: spec đã chốt là bỏ qua (không thông báo, không nét giữ lại, không tăng bộ đếm). "Quá ngắn" chưa có con số
  nên TC-S6.2-AC1-16 chỉ dùng nét vài px; ngưỡng thật do design.md.
- Chữ 十 và 人 có 2 nét, 你 có 7 nét, theo dữ liệu nét hiện có; nếu dữ liệu đổi, QA đổi chữ mẫu.
- Nút "Tập viết" trên màn S6.1 do S6.2 thêm sau khi S6.1 merge; nghiệm thu S6.2 cần bản build có cả hai.
- Case Vitest dùng bộ so nét giả nên không chứng minh bộ so nét thật nhận đúng nét vẽ tay; QA chạy tay một số case vẽ (AC1-4, AC1-6, AC2-3, AC3-2)
  trên bản build thật khi nghiệm thu.
