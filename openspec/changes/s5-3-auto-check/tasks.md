# Tasks: S5.3 Chấm tự động

Quy ước: mỗi cặp RED rồi GREEN, test đặt tên chứa ID Scenario. RED phải fail vì thiếu hành vi (không phải lỗi import). Commit `test(...)` cho RED,
`feat(...)` cho GREEN. Test nằm cạnh file, Vitest + Testing Library, trừ khi ghi khác (design D10). S5.1 và S5.2 đã có trên nhánh này.

## 1. Chuẩn bị

- [x] 1.1 Config/asset thuần (miễn test-first): thêm nhóm `speak.autoCheck` vào `assets/i18n/vi/lesson.json`, tạo `styles/tailwind/components/_auto-check.css` + `@import` ở `main.css`
  (design D7); kiểm tra: `pnpm typecheck` xanh.
- [x] 1.2 Helper test (không có hành vi sản phẩm): tạo `apps/web/src/test/speech.helpers.ts` (`FakeSpeechRecognition`, `installSpeechRecognition`, `setOnline`) theo design D10;
  kiểm tra: `pnpm typecheck` xanh.

## 2. AC1 Chỉ hiện khi có mạng và hỗ trợ

Test: `apps/web/src/app/shared/components/exercises/SpeakExercise.autocheck.test.tsx` (Vitest + Testing Library) trừ khi ghi khác.

- [x] 2.1 RED: S5.3-AC1 Có mạng và hỗ trợ thì hiện (có vùng "Chấm tự động").
- [x] 2.2 GREEN: S5.3-AC1 tạo `speech.service.ts`, `useSpeechRecognition.ts` (`isSupported`), `useOnlineStatus.ts`, `SpeakAutoCheck.tsx` (khung), nối `canAutoCheck` ở `SpeakExercise.tsx` (D1–D3, D5, D6); test 2.1 xanh.
- [x] 2.3 RED: S5.3-AC1 Không có mạng thì ẩn.
- [x] 2.4 GREEN: S5.3-AC1 `canAutoCheck` phụ thuộc `isOnline`; test 2.3 xanh. (có thể pass ngay từ 2.2; giữ làm guard)
- [x] 2.5 RED: S5.3-AC1 Trình duyệt không hỗ trợ thì ẩn (không có `SpeechRecognition` lẫn `webkitSpeechRecognition`).
- [x] 2.6 GREEN: S5.3-AC1 `createSpeechService` trả `isSupported() === false` khi không có constructor; test 2.5 xanh.
- [x] 2.7 RED: S5.3-AC1 Mất mạng giữa chừng thì ẩn (phát `offline` khi khu đang hiện); thêm `apps/web/src/app/core/hooks/useOnlineStatus.test.ts` cho subscribe/cleanup.
- [x] 2.8 GREEN: S5.3-AC1 `useOnlineStatus` dùng `useSyncExternalStore` với `online`/`offline`, gỡ listener khi unmount; test 2.7 xanh.
- [x] 2.9 RED: S5.3-AC1 Có mạng lại thì hiện lại (phát `online`).
- [x] 2.10 GREEN: S5.3-AC1 snapshot `navigator.onLine` cập nhật theo sự kiện; test 2.9 xanh. (đã làm ở 2.8 nếu pass ngay)
- [x] 2.11 RED: S5.3-AC1 Chưa ghi âm thì chưa có kết quả (không có chữ nhận được, không có thông báo "Khớp"/"không nghe được").
- [x] 2.12 GREEN: S5.3-AC1 `transcript === null` ⇒ `SpeakAutoCheck` không hiện kết quả; test 2.11 xanh.

## 3. AC2 Chữ máy nhận được và chỗ khác

Hàm thuần: `apps/web/src/app/shared/utils/speech-diff.utils.test.ts`. Hiển thị: `SpeakExercise.autocheck.test.tsx`, ghi âm bằng nút "Ghi âm"/"Dừng" với `FakeSpeechRecognition` trả kết quả.

- [x] 3.1 RED: S5.3-AC2 Nhận được đúng hết ("你好" ↔ "你好": không segment khác, `isSpeechMatch`; component hiện "你好" và "Khớp với câu đúng", không có nhãn).
- [x] 3.2 GREEN: S5.3-AC2 `speech-diff.utils.ts` (`normalizeSpeechText`, `diffSpeech`, `isSpeechMatch`), `SpeakAutoCheck` hiện chữ + thông báo khớp; `RecordCompare` thêm `onRecordStart`/`onRecordStop` và `SpeakExercise` nối
  `speech.start/stop` (D4–D6); test 3.1 xanh, test S5.1 vẫn xanh.
- [x] 3.3 RED: S5.3-AC2 Nhận được một chữ khác ("你好" ↔ "你号": "号" có nhãn "Khác", "你" không nhãn).
- [x] 3.4 GREEN: S5.3-AC2 ghép cặp thiếu/thừa thành `different` trong `diffSpeech`; test 3.3 xanh.
- [x] 3.5 RED: S5.3-AC2 Thiếu chữ ("你好吗" ↔ "你好": "吗" có nhãn "Thiếu").
- [x] 3.6 GREEN: S5.3-AC2 segment `missing` hiển thị chữ câu đúng kèm nhãn; test 3.5 xanh.
- [x] 3.7 RED: S5.3-AC2 Thừa chữ ("你好" ↔ "你好吗": "吗" có nhãn "Thừa").
- [x] 3.8 GREEN: S5.3-AC2 segment `extra`; test 3.7 xanh.
- [x] 3.9 RED: S5.3-AC2 Bỏ qua dấu câu và khoảng trắng ("你好！" ↔ "你 好": không tô, báo khớp; thêm ca chuẩn hoá cho `normalizeSpeechText`).
- [x] 3.10 GREEN: S5.3-AC2 `normalizeSpeechText` bỏ `[\p{P}\p{S}\s]`; test 3.9 xanh.
- [x] 3.11 RED: S5.3-AC2 Chỗ khác không chỉ báo bằng màu (nhãn "Khác"/"Thiếu"/"Thừa" là chữ trong cây truy cập, truy vấn bằng `getByText`/`toHaveTextContent`; không dựa vào class màu).
- [x] 3.12 GREEN: S5.3-AC2 `.auto-check-label` là chữ thật nằm trong span của chữ tô; test 3.11 xanh. (có thể pass ngay; giữ làm guard)
- [x] 3.13 RED: S5.3-AC2 Máy không nghe được gì (transcript `''`, và ca chỉ có dấu câu): hiện "Máy không nghe được, hãy thử lại", không có chữ tô.
- [x] 3.14 GREEN: S5.3-AC2 nhánh `normalizeSpeechText(transcript) === ''` ở `SpeakAutoCheck`; service coi `no-speech` là `''`; test 3.13 xanh (thêm ca `no-speech` ở `speech.service.test.ts`).
- [x] 3.15 RED: S5.3-AC2 Ghi lại thì kết quả mới thay kết quả cũ (lần 1 "你号", lần 2 "你好": chỉ còn kết quả lần 2; thêm ca `generation` ở `speech.service.test.ts`).
- [x] 3.16 GREEN: S5.3-AC2 `start` xóa `transcript`, `generation` bỏ kết quả lần cũ; test 3.15 xanh.
- [x] 3.17 RED: S5.3-AC2 Không tự chọn mức đánh giá (khớp hoàn toàn mà `onResult` chưa được gọi, 3 nút "Chưa đúng/Gần đúng/Đúng" còn bật và không nút nào `aria-pressed`).
- [x] 3.18 GREEN: S5.3-AC2 không nối `transcript` với `onResult`/`selectedRating` (D6); test 3.17 xanh. (pass ngay; giữ làm guard)

## 4. AC3 Không dùng được thì bài tập vẫn chạy

Test: `SpeakExercise.autocheck.test.tsx`, chọn mức bằng `onResult` giả như `SpeakExercise.test.tsx`.

- [x] 4.1 RED: S5.3-AC3 Không hỗ trợ vẫn ghi âm và tự đánh giá được (ghi âm, "Nghe bản ghi" bật, chọn "Đúng" → `onResult({ isCorrect: true })`).
- [x] 4.2 GREEN: S5.3-AC3 `handleRecordStart`/`handleRecordStop` không làm gì khi `!canAutoCheck`; test 4.1 xanh. (pass ngay; guard)
- [x] 4.3 RED: S5.3-AC3 Offline vẫn ghi âm và tự đánh giá được (chọn "Gần đúng" → `onResult` với `isCorrect: false`).
- [x] 4.4 GREEN: S5.3-AC3 offline không gọi `speech.start()`; test 4.3 xanh. (pass ngay; guard)
- [x] 4.5 RED: S5.3-AC3 Nhận diện bị lỗi giữa chừng (phát `error` mã `network`; khu ẩn, không có chữ nhận được, "Nghe bản ghi" bật, chọn mức được; thêm ca `speech.service.test.ts` reject và `useSpeechRecognition.test.ts` `hasError`).
- [x] 4.6 GREEN: S5.3-AC3 `stop()` reject ⇒ `hasError = true` ⇒ `canAutoCheck` false; lỗi `start()` cũng vào `hasError`, không throw ra UI; test 4.5 xanh.

## 5. Verify

- [x] 5.1 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và thấy pass; tự kiểm import của `speech.service`, `useSpeechRecognition`, `useOnlineStatus`, `speech-diff.utils`, `SpeakAutoCheck`, `SpeakExercise` không đi nhánh ❌ CLAUDE.md §2.
- [x] 5.2 Chạy `pnpm --filter @csk/web build` (đụng CSS/i18n) và thấy pass.
- [ ] 5.3 Thử tay trên `web-dev` (:5173) với mic thật: Chrome desktop và Safari iOS/Android nếu có, ghi lại ghi âm + nhận diện cùng lúc có chạy không (design, Rủi ro). Xung đột mic phải chỉ làm ẩn khu, không làm hỏng ghi âm.
- [x] 5.4 Xem UI: câu "nói" có khu chấm tự động ở mobile 375×812 và desktop 1280×800, sáng và tối (có chữ tô "Khác"/"Thiếu"/"Thừa"); chụp screenshot cho PR (CLAUDE.md §8).
