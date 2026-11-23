# Test cases: S4.4 Công tắc "Nghe chậm" báo trạng thái không chỉ bằng màu

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Sửa a11y theo issue #139 (phát hiện ở TC-S8.2-AC2-3).

## Điều kiện đầu

- **Bản build:** chạy trên bản build (không phải bản dev), trình duyệt sạch dữ liệu của app, đã xong onboarding với mục tiêu
  "15 phút". Chưa đổi tốc độ audio mặc định ở màn Cài đặt (nếu màn Cài đặt đã có trong bản build), nên khi mở bài công tắc
  "Nghe chậm" đang tắt.
- **Bài dùng để thử:** bài đầu của lộ trình, "Thanh 1–4" (mở bằng "Vào học" ở Trang chủ, hoặc từ bản đồ lộ trình). Câu 1 (八) và
  câu 2 (白) đều là câu chọn thanh, có nút "Nghe" và công tắc "Nghe chậm". Sang câu 2: ở câu 1 chọn đáp án bất kỳ rồi bấm "Tiếp tục".
- **Thang xám:** spec quy "phân biệt được ở thang xám" về tín hiệu đo được (có/không dấu tick + tương phản dấu tick ≥ 3:1 với nền
  công tắc; tương phản tính theo độ sáng nên giữ nguyên ở thang xám). Không cần bật bộ lọc thang xám để quyết pass/fail.
- **Mốc màu lúc bật:** màu viền, nền và chữ của công tắc lúc bật trên bản build `main` **trước** change này (chụp hoặc ghi mã màu ở
  sáng và tối, con trỏ không nằm trên công tắc). Màu nhấn của app là màu chữ "Nghe chậm" lúc bật trên bản đó.
- **Giao diện sáng/tối:** chuyển giao diện của thiết bị/trình duyệt (hoặc DevTools › Rendering › "prefers-color-scheme").
- **Đo tương phản:** dùng công cụ đo tương phản (vd bộ chọn màu của DevTools, hoặc ứng dụng đo tương phản) lấy màu của dấu tick, màu
  chữ "Nghe chậm" và màu nền công tắc. Nền đo theo spec: **lúc bật** là nền nhấn nhạt của chính công tắc; **lúc tắt** là nền màn ngay
  phía sau công tắc (công tắc tắt không có nền riêng). Luôn đo khi con trỏ **không** nằm trên công tắc (dời chuột ra chỗ khác, hoặc
  dùng bàn phím để bật/tắt rồi bấm ra ngoài).
- **Giảm chuyển động:** bật "Giảm chuyển động" của hệ điều hành (macOS: Trợ năng › Màn hình › Giảm chuyển động), hoặc DevTools ›
  Rendering › "prefers-reduced-motion: reduce".
- **Trình đọc màn hình:** VoiceOver (macOS/iOS) hoặc TalkBack (Android), đọc công tắc bằng thao tác chuyển phần tử.

## Case

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S4.4-AC3-1 | S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ | Chức năng | Mở bài "Thanh 1–4", ở câu 1 bấm công tắc "Nghe chậm" | Công tắc chuyển sang bật; dấu tick hiện ngay trước chữ "Nghe chậm" (bên trái chữ, cùng một hàng). Dời con trỏ ra khỏi công tắc rồi so với mốc màu lúc bật (xem Điều kiện đầu): màu viền, màu nền và màu chữ trùng mốc; cả ba khác màu tương ứng lúc tắt | e2e |
| TC-S4.4-AC3-2 | S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ | Mobile 375 | Khổ 375×812, như TC-S4.4-AC3-1 | Dấu tick và chữ "Nghe chậm" nằm cùng một hàng trong công tắc (dấu tick không bị đẩy lên/xuống hàng riêng), chữ không bị cắt hay xuống dòng; nút "Nghe" bên cạnh không bị đẩy lệch hay che; không phải cuộn ngang | không |
| TC-S4.4-AC3-3 | S4.4-AC3 Tắt thì không có dấu tick | Chức năng | Mở bài "Thanh 1–4", nhìn công tắc ở câu 1 (chưa bấm) | Công tắc đang tắt, chỉ hiện chữ "Nghe chậm", không có dấu tick | e2e |
| TC-S4.4-AC3-4 | S4.4-AC3 Bật rồi tắt thì dấu tick biến mất | Chức năng | Ở câu 1 bấm "Nghe chậm" (thấy dấu tick), bấm lại lần nữa | Công tắc về tắt; dấu tick không còn, chỉ còn chữ "Nghe chậm" | e2e |
| TC-S4.4-AC3-5 | S4.4-AC3 Bật bằng bàn phím cũng hiện dấu tick | A11y | Ở câu 1, chỉ dùng phím Tab đưa focus tới "Nghe chậm", nhấn Space; nhấn Space lần nữa; rồi nhấn Enter | Focus nhìn thấy rõ trên công tắc. Sau Space đầu: bật, có dấu tick. Sau Space thứ hai: tắt, không dấu tick. Sau Enter: bật lại, có dấu tick | e2e |
| TC-S4.4-AC3-6 | S4.4-AC3 Dấu tick giữ qua các câu trong bài | Chức năng | Ở câu 1 bật "Nghe chậm", chọn đáp án bất kỳ, bấm "Tiếp tục" sang câu 2 | Ở câu 2 công tắc "Nghe chậm" đang bật và có dấu tick trước chữ | e2e |
| TC-S4.4-AC3-7 | S4.4-AC3 Tên truy cập và trạng thái cho trình đọc màn hình | A11y | Ở câu 1 (công tắc tắt) cho trình đọc màn hình đọc công tắc; bấm bật; cho đọc lại | Cả hai lần tên được đọc đúng là "Nghe chậm", không có thêm chữ nào (vd "dấu tick", "check", ký hiệu); lần đầu báo đang tắt, lần sau báo đang bật | e2e |
| TC-S4.4-AC3-8 | S4.4-AC3 Tên truy cập và trạng thái cho trình đọc màn hình | A11y | Như TC-S4.4-AC3-7, chạy với VoiceOver hoặc TalkBack thật | Đọc "Nghe chậm" kèm vai trò công tắc và trạng thái tắt/bật đúng; không đọc riêng dấu tick, không dừng ở dấu tick như một phần tử riêng | không |
| TC-S4.4-AC3-9 | S4.4-AC3 Phân biệt bật và tắt ở thang xám, giao diện sáng và tối | Sáng/Tối | Giao diện sáng: mở bài, nhìn công tắc ở câu 1 lúc tắt; bấm bật, dời con trỏ ra khỏi công tắc, đo tương phản dấu tick với nền công tắc (nền nhấn nhạt). Chuyển sang giao diện tối, lặp lại | Ở cả hai giao diện: lúc tắt không có dấu tick; lúc bật dấu tick hiện trước chữ "Nghe chậm" và tương phản với nền công tắc ≥ 3:1. Ghi tỷ lệ đo được | e2e |
| TC-S4.4-AC3-10 | S4.4-AC3 Tương phản của dấu tick và chữ | Sáng/Tối | Giao diện sáng: đo tương phản chữ "Nghe chậm" với nền công tắc lúc tắt; bật công tắc, đo chữ và dấu tick với nền công tắc. Chuyển sang giao diện tối, lặp lại | Ở cả hai giao diện, nền đo như Điều kiện đầu (bật: nền nhấn nhạt của công tắc; tắt: nền màn phía sau), con trỏ không nằm trên công tắc: dấu tick (lúc bật) ≥ 3:1; chữ "Nghe chậm" ≥ 4.5:1 cả lúc tắt và lúc bật. Ghi lại các tỷ lệ đo được trong ghi chú nghiệm thu | không |
| TC-S4.4-AC3-11 | S4.4-AC3 Giảm chuyển động thì dấu tick hiện ngay | A11y | Bật giảm chuyển động; mở bài, ở câu 1 bấm "Nghe chậm"; bấm lại để tắt | Lúc bật: dấu tick và màu bật hiện ngay, không trượt, mờ dần hay chuyển màu dần. Lúc tắt: dấu tick mất ngay, màu về trạng thái tắt ngay | e2e |
| TC-S4.4-AC3-12 | S4.4-AC3 Không giảm chuyển động thì dấu tick vẫn hiện ngay | Chức năng | Tắt giảm chuyển động (mặc định của thiết bị); mở bài, ở câu 1 bấm "Nghe chậm"; bấm lại để tắt | Lúc bật: dấu tick hiện ngay, không mờ dần, trượt hay phóng to. Lúc tắt: dấu tick mất ngay, cũng không có các hiệu ứng đó (màu viền/nền/chữ có thể chuyển dần như hiện nay) | e2e |

## Tầng kiểm đề xuất

Cột Tự động chỉ phân `e2e` / `không` theo `spec-driven.md` §3. Bảng dưới gợi ý tầng test tự động cho dev (planner chốt trong
`design.md`); QA vẫn chạy tay các case `không` trên bản build mỗi lần nghiệm thu.

| Scenario | Tầng tự động đề xuất | Case QA chạy tay |
|---|---|---|
| Bật Nghe chậm thì hiện dấu tick trước chữ | component (Testing Library: có dấu tick, đứng trước chữ) + e2e | TC-…-2 (Mobile 375) |
| Tắt thì không có dấu tick | component + e2e | |
| Bật rồi tắt thì dấu tick biến mất | component + e2e | |
| Bật bằng bàn phím cũng hiện dấu tick | component (bàn phím) + e2e | |
| Dấu tick giữ qua các câu trong bài | component (màn học, hai câu) + e2e | |
| Tên truy cập và trạng thái cho trình đọc màn hình | component (tên "Nghe chậm" đúng chính xác, trạng thái bật/tắt) + e2e | TC-…-8 (trình đọc màn hình thật) |
| Bật Nghe chậm thì hiện dấu tick trước chữ (giữ màu nhấn) | e2e đọc màu viền/nền/chữ lúc bật, con trỏ ngoài công tắc, so với token màu nhấn | |
| Phân biệt bật và tắt ở thang xám, giao diện sáng và tối | component (có/không dấu tick) + unit token (dấu tick với nền lúc bật ≥ 3:1, sáng và tối) + e2e TC-…-9 | |
| Tương phản của dấu tick và chữ | unit (tính tỷ lệ tương phản từ màu token sáng và tối của dấu tick, chữ, nền công tắc) | TC-…-10 (đo trên bản build) |
| Không giảm chuyển động thì dấu tick vẫn hiện ngay | e2e (không giả lập giảm chuyển động, kiểm dấu tick không có hiệu ứng chuyển tiếp/animation) | |
| Giảm chuyển động thì dấu tick hiện ngay | e2e (giả lập giảm chuyển động, kiểm không có hiệu ứng chuyển tiếp) | |

**Ghi chú cho planner (token test):** `tokens.test.ts` hiện chưa có cặp `accent` / `accent-soft` (màu chữ và dấu tick lúc bật trên nền
nhấn nhạt). Cần thêm cặp này, ở cả sáng và tối: ngưỡng 4.5:1 (chữ, đồng thời phủ 3:1 của dấu tick). Lúc tắt, chữ đo với nền màn học
thật phía sau công tắc (`bg` hoặc `surface`, tùy màn học đặt công tắc trên nền nào); cặp `text`/`bg`, `text`/`surface` đã có, planner
xác nhận màu chữ lúc tắt đúng là token đó. Nếu dấu tick dùng màu khác `accent` thì thêm cặp riêng của nó với `accent-soft` (3:1).
