# Proposal: S5.3 Chấm tự động

Story **S5.3 Chấm tự động · F6** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s53-chấm-tự-động--f6)) ·
GitHub issue [#32](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/32). Bản 0.1.

Refs #32

## Why

Là người học, tôi muốn app chấm phát âm khi có thể để có thêm góc nhìn khách quan. Tự nghe lại dễ bỏ sót chỗ sai. Trình duyệt có nhận
diện giọng nói (Web Speech, tiếng Trung `zh-CN`) nên app cho biết máy nghe được chữ gì và chỗ nào khác câu đúng. Chỉ là **tham khảo**: người
học vẫn tự chọn mức ở S5.2.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Nhận diện giọng nói `zh-CN` qua Web Speech (hạ tầng, có/không hỗ trợ) | `core/services/speech.service.ts` |
| Hook nhận diện cho component (hỗ trợ không, đang nghe, kết quả, lỗi) | `core/hooks/useSpeechRecognition.ts` |
| Trạng thái có mạng | `core/hooks/` (hook online đã có theo bảng §1; nếu chưa có thì thêm) |
| So sánh chữ nhận được với câu đúng, chỉ chỗ khác (thuần) | `shared/utils/` (leaf, `speech-diff.utils.ts`) |
| Khu "Chấm tự động" trong dạng bài "nói" | `shared/components/exercises/` (chỉ nhận props) |
| i18n, style BEM (chỗ khác có nhãn chữ, không chỉ màu) | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Khu **Chấm tự động** trong câu "nói" chỉ hiện khi **có mạng và trình duyệt hỗ trợ** nhận diện giọng nói `zh-CN`.
- Máy nhận diện **cùng lúc với ghi âm** (cùng một lần bấm Ghi âm / Dừng của S5.1). Dừng xong, khu này hiện **chữ máy nhận được**.
- Chữ nhận được so với câu đúng theo từng chữ Hán: chữ giống thì để nguyên, chữ **khác, thừa hoặc thiếu** thì tô màu **và** có nhãn chữ.
  Dấu câu và khoảng trắng bị bỏ qua khi so sánh.
- Kết quả chỉ để tham khảo: **không tự chọn mức** tự đánh giá thay người học.
- Không hỗ trợ, đang offline, hoặc nhận diện lỗi thì ẩn khu này; ghi âm, nghe lại, tự đánh giá vẫn dùng bình thường.

## Không làm (out of scope)

- Chấm điểm số hay tự quyết đúng/sai cho câu (chỉ S5.2 làm).
- Chấm thanh điệu, ngữ điệu; chỉ so chữ nhận được.
- Dùng dịch vụ nhận diện riêng hay gửi bản ghi lên server (chỉ Web Speech của trình duyệt).
- Mic bị chặn, không có mic → **S5.4**.
- Chữ giản thể/phồn thể: chỉ so chữ như nhận được.

## Dependencies

- **S5.1** (code trước): khối ghi âm; nhận diện chạy cùng lần ghi.
- **S5.2**: dạng bài "nói" chứa khu này.
- **S3.2** (đã archive): khung chạy bài.
- **E1** (đã xong): trạng thái có mạng/offline.

## Capabilities

### New Capabilities
- `speak-auto-check`: hiện chữ máy nhận được, tô chỗ khác với câu đúng; ẩn khi không hỗ trợ hoặc không có mạng.

### Modified Capabilities
- (không có)

## Câu hỏi mở

1. **Rủi ro kỹ thuật**: ghi âm (MediaRecorder) và nhận diện giọng (Web Speech) dùng chung micro cùng lúc, một số trình duyệt (nhất là
   Safari trên iOS) không cho. Nếu thử nghiệm thật cho thấy xung đột, đề xuất xem như "không hỗ trợ" và ẩn khu chấm tự động
   (đã đúng AC3). Dev xác nhận ở bước plan; nếu phải đổi cách làm thì mở PR spec fix.
2. **Bỏ dấu câu và khoảng trắng khi so sánh** là đề xuất của spec (AC không nói). BA xác nhận.
3. **Máy không nghe được gì** (không ra chữ): đề xuất báo "Máy không nghe được, hãy thử lại" thay vì coi là sai toàn bộ. BA xác nhận.
4. Chưa có e2e: Playwright không có micro và Web Speech thật; test với `speech.service` giả.

## Impact

- Code mới: `speech.service.ts`, `useSpeechRecognition.ts`, `speech-diff.utils.ts` (+ test), khu "Chấm tự động".
- Code sửa: dạng bài "nói", i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
- Tầng test: so sánh chữ ở Vitest (hàm thuần); hiện/ẩn theo mạng và hỗ trợ ở Vitest + Testing Library.
