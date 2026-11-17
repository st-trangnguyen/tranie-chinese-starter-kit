# Proposal: S8.2 Cài đặt

Story **S8.2 Cài đặt · F1, F2** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s82-cài-đặt--f1-f2)) ·
GitHub issue [#38](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/38). Bản 0.1.

Refs #38

## Why

Là người học, tôi muốn chỉnh các tùy chọn học để hợp với mình. Hiện mục tiêu phút mỗi ngày chỉ chọn được một lần ở onboarding
(S1.3 AC3 hẹn "đổi lại trong Cài đặt"), tốc độ audio luôn về 1x mỗi khi mở bài, và pinyin luôn hiện. S8.2 thêm màn Cài đặt để người
học đổi ba tùy chọn này, lựa chọn được giữ lại trên máy.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Màn Cài đặt (lazy-load), route RESTful tên cụ thể (planner đặt) | `pages/settings/containers/` + `pages/settings/settings.routes.ts` |
| Các khối chọn trên màn Cài đặt (mục tiêu, tốc độ, pinyin) | `pages/settings/components/` |
| Nạp/lưu cài đặt cho màn, trạng thái đang lưu/lỗi | `pages/settings/hooks/` |
| Quy tắc hợp lệ của từng tùy chọn, use case đổi tùy chọn (đọc, gộp, ghi) | `shared/services/` (service tiến độ/cài đặt đã có, Phần 2 + Phần 3) |
| Cung cấp tùy chọn hiện pinyin và tốc độ mặc định cho các màn học | `shared/contexts/`: tốc độ mặc định nạp vào context tốc độ audio đã có (`AudioSpeedContext.tsx`, `useAudioSpeed.ts`), không tạo context song song cho "Nghe chậm"; tùy chọn pinyin do planner chọn chỗ đặt trong `shared/contexts/` |
| Đọc/ghi cài đặt trên máy (đã có) | `core/services/` (`ProgressStore`), không đổi phiên bản DB |
| Kiểu + schema Zod của cài đặt, giá trị mặc định | `packages/shared` (`@csk/shared`) |
| Liên kết "Cài đặt" trên màn Lộ trình | `pages/learning-path/containers/` hoặc `components/` |
| Áp tốc độ mặc định khi mở bài; ẩn pinyin ở câu "nói" | `pages/lesson/containers/`, `shared/components/exercises/` (chỉ nhận props) |
| i18n (nhãn, thông báo), style BEM | `assets/i18n/vi/settings.json`, `apps/web/src/styles/tailwind/` |

## What Changes

- Màn **Cài đặt** mới, vào từ liên kết "Cài đặt" trên màn Lộ trình; màn có liên kết quay về Lộ trình. Màn có ba nhóm:

| Nhóm | Lựa chọn | Mặc định |
|---|---|---|
| "Mục tiêu mỗi ngày" | 15 / 30 / 60 phút (cùng lựa chọn với onboarding) | Lựa chọn ở onboarding, chưa có thì 15 phút |
| "Tốc độ audio mặc định" | "Bình thường (1x)" / "Chậm (0.75x)" | Bình thường (1x) |
| "Hiện pinyin" | Bật / Tắt (công tắc) | Bật |

- Chọn là **lưu ngay** (không có nút Lưu); đóng app mở lại vẫn giữ. Không lưu được thì màn báo lỗi bằng chữ và lựa chọn trở về giá trị cũ.
  Thông báo lỗi ở lại tới khi lần đổi kế tiếp lưu được. Cài đặt đã lưu không đọc được thì từng tùy chọn hỏng rơi về mặc định, tùy chọn còn
  lại giữ nguyên; không đọc được cả kho cài đặt thì màn học vẫn mở với 1x và hiện pinyin, không báo lỗi.
- **Tốc độ audio mặc định** quyết định công tắc "Nghe chậm" mỗi lần vào màn học (bài mới, mở lại chính bài đó, học tiếp bài đang dở):
  mặc định "Chậm" thì vào bài là công tắc đang bật. Bật/tắt
  "Nghe chậm" trong bài chỉ có hiệu lực trong bài đó, không đổi Cài đặt. Sửa Requirement "Chế độ chậm 0.75x" của `audio-replay`
  (trước đây luôn về tắt khi mở bài mới).
- **Hiện pinyin** tắt thì ẩn dòng pinyin đi kèm chữ Hán của nội dung cần đọc ở câu "nói" (cả chế độ "đọc to rồi tự chấm"). Pinyin là
  nội dung của câu hỏi, lựa chọn hoặc đáp án vẫn hiện, vì không có nó thì không làm được câu hoặc mất phần giải thích:

| Chỗ có pinyin | Khi tắt "Hiện pinyin" |
|---|---|
| Dòng pinyin dưới chữ Hán của từ (hoặc câu) cần nói, câu "nói" | Ẩn |
| Lựa chọn pinyin ở câu phân biệt cặp âm | Vẫn hiện |
| Ô gõ pinyin và phần so sánh ở câu gõ pinyin | Vẫn hiện |
| Đáp án kèm pinyin sau khi chọn ở câu chọn thanh | Vẫn hiện |
| Phần giải thích sau khi chấm sai (chữ, pinyin, nghĩa của câu mẫu) | Vẫn hiện |

  Sửa Requirement của `speak-rating` và `speak-no-mic` đang bắt buộc luôn hiện pinyin.
- Đổi mục tiêu ở Cài đặt không làm hiện lại onboarding.

## Không làm (out of scope)

- Trang chủ và hiển thị số phút đã học so với mục tiêu → **S8.1** (change `s8-1-home-screen`). S8.2 chỉ lưu mục tiêu.
- Liên kết "Cài đặt" trên Trang chủ hoặc thanh điều hướng dưới: thêm khi có màn đó (S8.1 hoặc story khung app).
- Giới hạn thẻ SRS mỗi ngày → **S9.3**. Bật/tắt pinyin và bản dịch trong hội thoại → story hội thoại (E11).
- Tốc độ khác 1x và 0.75x; mục tiêu khác 15/30/60 phút.
- Áp tốc độ audio mặc định cho "Nghe mẫu" và "Nghe bản ghi" ở câu "nói": hai nút này không có công tắc "Nghe chậm" và vẫn luôn phát ở 1x
  như hiện nay. Tốc độ mặc định chỉ áp cho nút "Nghe" của các câu có công tắc "Nghe chậm".
- Ẩn pinyin ở các chỗ pinyin là nội dung câu hỏi, lựa chọn hoặc đáp án (bảng trên); ẩn pinyin ở thẻ từ vựng, màn thứ tự nét, màn luyện viết
  (các màn này hiện chưa có pinyin; story thêm pinyin vào đó tự áp tùy chọn).
- Đổi hành vi S1.3 khi không đọc được cài đặt trên máy: mở app từ trang bắt đầu lúc đó vẫn hiện onboarding như hiện nay (trạng thái
  "đã xong onboarding" nằm chung kho cài đặt). Mặc định của S8.2 chỉ áp khi người học đã ở trong app rồi vào màn học/màn Cài đặt bằng
  liên kết trong app hoặc tải lại đúng trang đó.
- Đặt lại mọi cài đặt về mặc định, sao lưu/khôi phục cài đặt (story backup), đổi giao diện sáng/tối, ngôn ngữ.

## Capabilities

### New Capabilities
- `settings`: màn Cài đặt đổi mục tiêu phút mỗi ngày, tốc độ audio mặc định, bật/tắt hiện pinyin; lưu bền trên máy.

### Modified Capabilities
- `audio-replay`: Requirement "Chế độ chậm 0.75x": công tắc "Nghe chậm" lúc mở bài theo tốc độ mặc định trong Cài đặt.
- `speak-rating`: Requirement "Có 3 mức tự đánh giá…": pinyin của nội dung cần nói hiện theo tùy chọn "Hiện pinyin".
- `speak-no-mic`: Requirement "Không ghi âm được thì chuyển sang 'đọc to rồi tự chấm'": pinyin hiện theo tùy chọn "Hiện pinyin".

## Open Questions

- [x] **Lối vào màn Cài đặt** → liên kết "Cài đặt" trên màn Lộ trình (màn chính hiện có); màn Cài đặt có liên kết quay về Lộ trình. Lối vào từ Trang chủ thuộc S8.1 (Scenario "Mở Cài đặt từ màn Lộ trình") (ba đề xuất, chờ người thật xác nhận)
- [x] **Lưu ngay hay bấm Lưu?** → chọn là lưu ngay, không có nút Lưu; không lưu được thì báo "Không lưu được cài đặt. Hãy thử lại." và lựa chọn về giá trị cũ (Scenario "Không lưu được thì báo lỗi và giữ giá trị cũ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Mục tiêu chọn được những mức nào?** → đúng 15 / 30 / 60 phút như onboarding (S1.3 AC1), hiện sẵn mức đang dùng (ba đề xuất, chờ người thật xác nhận)
- [x] **"Tốc độ audio mặc định" gồm mức nào và áp vào đâu?** → hai mức "Bình thường (1x)" và "Chậm (0.75x)", trùng công tắc "Nghe chậm" đã có (S4.4); mặc định quyết định công tắc lúc vào màn học, bật/tắt trong bài không đổi Cài đặt, mỗi lần vào màn học lại theo mặc định (sửa `audio-replay`) (ba đề xuất, chờ người thật xác nhận)
- [x] **Tắt pinyin thì ẩn pinyin ở đâu?** → chỉ ẩn pinyin phụ đi kèm chữ Hán của nội dung cần đọc (câu "nói"); pinyin là câu hỏi, lựa chọn, đáp án hoặc giải thích sau khi chấm vẫn hiện (bảng trong spec `settings`; sửa `speak-rating`, `speak-no-mic`) (ba đề xuất, chờ người thật xác nhận)
- [x] **Mặc định của "Hiện pinyin"?** → Bật, để người mới học không mất pinyin khi chưa vào Cài đặt (ba đề xuất, chờ người thật xác nhận)
- [x] **Cài đặt đã lưu bị hỏng** → tùy chọn nào hỏng thì rơi về mặc định, tùy chọn còn lại giữ nguyên, không báo lỗi (khớp cách đọc cài đặt đã có của S1.3) (ba đề xuất, chờ người thật xác nhận)
- [x] **Không đọc được cả kho cài đặt (vd IndexedDB bị chặn ở chế độ riêng tư)** → màn học vẫn mở, dùng mặc định (1x, hiện pinyin), không báo lỗi; màn Cài đặt hiện giá trị mặc định; lần đổi sau nếu không lưu được thì báo lỗi như khi ghi lỗi (Scenario "Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin", "Không đọc được cài đặt thì màn Cài đặt hiện mặc định") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Mở bài mới" có gồm mở lại chính bài đó hoặc học tiếp bài đang dở (S3.3)?** → có: mỗi lần vào màn học của một bài, công tắc "Nghe chậm" bắt đầu theo tốc độ mặc định; sửa chữ hai Scenario "Mở bài mới…" của `audio-replay` (ba đề xuất, chờ người thật xác nhận)
- [x] **S5.4-AC2 "Giữ chế độ cho các câu nói sau trong bài" khi bản build chỉ có một câu "nói"** → Scenario hồi quy, S8.2 không đổi hành vi; tự động dựa vào test component S5.4 đã có, nghiệm thu tay ghi "không chạy được" tới khi có nội dung S7.1 (ba đề xuất, chờ người thật xác nhận)
- [x] **Thông báo "Không lưu được cài đặt. Hãy thử lại." tồn tại bao lâu, lỗi lặp lại thì sao?** → ở lại tới khi lần đổi kế tiếp lưu được thì biến mất; lỗi lặp lại chỉ có một thông báo trên màn và được đọc lại cho trình đọc màn hình (Scenario "Lưu được lại thì thông báo lỗi biến mất", "Lỗi lặp lại chỉ có một thông báo") (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu mở đầu Requirement "Tắt pinyin chỉ ẩn pinyin đi kèm chữ Hán" mâu thuẫn với hàng "Giải thích sau khi chấm sai"** → viết lại: chỉ ẩn pinyin dưới chữ Hán của nội dung cần đọc ở câu "nói" (trước khi chấm)
- [x] **Scenario tùy chọn hỏng chỉ phủ tốc độ** → thêm Scenario mục tiêu hỏng về 15 phút (AC1) và pinyin hỏng về bật (AC3)
- [x] **"Nghe mẫu" và "Nghe bản ghi" ở câu "nói" có theo tốc độ mặc định?** → không, vẫn luôn 1x như hiện nay (ghi trong "Không làm") (ba đề xuất, chờ người thật xác nhận)
- [x] **Không đọc được cả kho cài đặt thì "mở app" ra sao, khi trạng thái onboarding nằm chung kho?** (qa, dev-lead vòng 2) → S8.2 không đổi hành vi S1.3: mở app từ trang bắt đầu khi không đọc được cài đặt vẫn hiện onboarding (ghi trong "Không làm"); hai Scenario "Không đọc được cài đặt…" đổi WHEN thành lỗi đọc xảy ra khi người học đã ở trong app (qua màn Lộ trình) rồi vào màn học/màn Cài đặt bằng liên kết trong app hoặc tải lại đúng trang đó (ba đề xuất, chờ người thật xác nhận)
- [x] **Scenario "Không đọc được cài đặt thì màn Cài đặt hiện mặc định" thiếu bước lưu lỗi** (qa, dev-lead vòng 2) → thêm AND: chọn "30 phút" không lưu được thì báo "Không lưu được cài đặt. Hãy thử lại." và "15 phút" vẫn được chọn
- [x] **Tốc độ mặc định có tạo context mới?** (dev-lead vòng 2) → không; nạp vào `AudioSpeedContext` đã có (bảng Layer đích)
- [x] **Lưu thêm hai tùy chọn (tốc độ audio mặc định, hiện pinyin) vào dữ liệu cài đặt trên máy của người học** — đây là thay đổi dữ liệu người dùng trong IndexedDB → người thật đã xác nhận, đồng ý đề xuất: thêm hai mục vào bảng cài đặt dạng khóa–giá trị đã có, không tăng phiên bản DB, không cần migration; máy chưa có hai mục này hoặc giá trị hỏng thì dùng mặc định 1x và bật pinyin. Đã kiểm: bảng `settings` trong `core/helpers/db.helper.ts` là khóa–giá trị, chỉ index `key`, nên không cần `db.version` mới; `settingsSchema` dùng `.catch` cho từng field nên giá trị hỏng rơi về mặc định riêng từng field; `z.object` bỏ khóa lạ nên bản cũ đọc dữ liệu mới vẫn được. Thay đổi chỉ cộng thêm, đảo ngược được.

## Impact

- Code mới: màn Cài đặt (container, component, hook), route, i18n `settings`, style; context cài đặt dùng chung cho các màn học.
- Code sửa: schema + mặc định cài đặt trong `@csk/shared` (thêm hai tùy chọn); service cài đặt (quy tắc hợp lệ, use case đổi từng tùy chọn);
  màn Lộ trình (liên kết "Cài đặt"); màn học (công tắc "Nghe chậm" khởi đầu theo mặc định); câu "nói" (ẩn/hiện pinyin).
- Không thêm dependency. Không đổi phiên bản DB (xem Open Questions).
- Tầng test: Vitest cho quy tắc hợp lệ và use case lưu/đọc cài đặt (store giả, kể cả lỗi ghi và giá trị hỏng); Testing Library cho màn Cài
  đặt, công tắc "Nghe chậm" lúc mở bài, câu "nói" khi tắt pinyin; Playwright cho luồng đổi cài đặt rồi tải lại app vẫn giữ.
