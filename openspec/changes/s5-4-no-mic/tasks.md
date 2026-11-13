# Tasks: S5.4 Khi không có mic

Quy ước: mỗi cặp RED rồi GREEN, test đặt tên chứa ID Scenario. RED phải fail vì thiếu hành vi (không phải lỗi import). Commit `test(...)` cho RED,
`feat(...)` cho GREEN. Test nằm cạnh file, Vitest + Testing Library, trừ khi ghi khác (design D10). S5.1, S5.2, S5.3 đã có trên nhánh này.

## 1. Chuẩn bị

- [x] 1.1 Config/asset thuần (miễn test-first): thêm `record.retry`, `record.retryRecording`, `record.readAloud`, `record.guidance.*` vào `assets/i18n/vi/lesson.json`, tạo
  `styles/tailwind/components/_record-guidance.css` + `@import` ở `main.css` (design D7); kiểm tra: `pnpm typecheck` xanh.
- [x] 1.2 Helper test (không có hành vi sản phẩm): thêm `rejectGetUserMedia(name)` và `grantMicrophone()` vào `apps/web/src/test/record-compare.helpers.ts` (design D10); kiểm tra: `pnpm typecheck` xanh.

## 2. AC1 Hiện hướng dẫn cấp quyền mic khi không ghi âm được

Test: `apps/web/src/app/shared/components/exercises/SpeakExercise.no-mic.test.tsx` (Vitest + Testing Library, qua `exerciseRegistry.speak`, bọc `RecordingModeProvider`) trừ khi ghi khác.

- [x] 2.1 RED: S5.4-AC1 Ghi âm bình thường thì không hiện hướng dẫn (bấm "Ghi âm" với mic giả hoạt động: không có `role="alert"` hướng dẫn, nút "Dừng" hiện). (pass ngay: hành vi âm tính, giữ làm guard)
- [x] 2.2 GREEN: S5.4-AC1 không đổi hành vi ghi âm khi `start()` thành công; test 2.1 xanh, test S5.1 vẫn xanh.
- [x] 2.3 RED: S5.4-AC1 Quyền micro bị chặn (`getUserMedia` reject `NotAllowedError`: hướng dẫn cấp quyền + nút "Thử lại"). Thêm ca phân loại `NotAllowedError`/`SecurityError` ⇒ `blocked` ở
  `core/services/recorder.service.test.ts` và `failureReason` ở `core/hooks/useRecorder.test.ts`.
- [x] 2.4 GREEN: S5.4-AC1 `RecorderError` + `classifyFailure` + `isSupported` (D1), `useRecorder` trả `failureReason`, `start` trả reason (D2), `RecordGuidance.tsx` (D5),
  `RecordCompare` hiện `RecordGuidance` khi `failureReason !== null` và gọi `enterReadAloud()` (D3, D4: tạo `RecordingModeContext.tsx` + `useRecordingMode.ts`); test 2.3 xanh.
- [x] 2.5 RED: S5.4-AC1 Không tìm thấy micro (`NotFoundError`: hướng dẫn kiểm tra micro + nút "Thử lại"; thêm ca `no-device` ở `recorder.service.test.ts`, gồm lỗi lạ ⇒ `no-device`).
- [x] 2.6 GREEN: S5.4-AC1 nhánh `no-device` ở `classifyFailure` và `RecordGuidance`; test 2.5 xanh.
- [x] 2.7 RED: S5.4-AC1 Trình trình duyệt không hỗ trợ ghi âm (không có `mediaDevices` hoặc `MediaRecorder`: báo không ghi âm được, không có nút "Thử lại"; thêm ca `isSupported() === false` ⇒ `unsupported` ở `recorder.service.test.ts`).
- [x] 2.8 GREEN: S5.4-AC1 `start()` kiểm `isSupported()` trước, `createRecorderService` định nghĩa `isSupported` thật, `RecordGuidance` ẩn "Thử lại" khi `unsupported`; test 2.7 xanh.
- [x] 2.9 RED: S5.4-AC1 Cấp quyền rồi thử lại thì ghi âm được (blocked → `grantMicrophone()` → bấm "Thử lại": hướng dẫn biến mất, có nút "Ghi âm", focus nằm trong câu, mic không bị giữ mở; thêm ca `checkAvailability`
  nhả stream và không tạo `MediaRecorder` ở `recorder.service.test.ts`, ca `retry` ở `useRecorder.test.ts`).
- [x] 2.10 GREEN: S5.4-AC1 `RecorderService.checkAvailability()` (D1), `useRecorder.retry` (D2), `RecordCompare` nối "Thử lại" ⇒ `leaveReadAloud()` + focus về nút "Ghi âm" (D4); test 2.9 xanh.
- [x] 2.11 RED: S5.4-AC1 Thử lại mà vẫn bị chặn (`getUserMedia` vẫn reject: vẫn hiện hướng dẫn cấp quyền, không có nút "Ghi âm").
- [x] 2.12 GREEN: S5.4-AC1 `retry` đặt `failureReason` theo lỗi mới, `RecordCompare` giữ `isReadAloud`; test 2.11 xanh. (có thể pass ngay từ 2.10; giữ làm guard)
- [x] 2.13 RED: S5.4-AC1 Hướng dẫn đọc được bằng trình đọc màn hình (hướng dẫn có `role="alert"`, đọc được qua `getByRole('alert')`, và `document.activeElement` nằm trong câu, không phải `body`).
- [x] 2.14 GREEN: S5.4-AC1 `RecordGuidance` là `<section role="alert" tabIndex={-1}>` và được focus khi mount (D4); test 2.13 xanh.

## 3. AC2 Không ghi âm được thì chuyển sang "đọc to rồi tự chấm"

Test: `SpeakExercise.no-mic.test.tsx` (mô phỏng runner bằng `rerender` với `key` mới cho câu kế), trừ khi ghi khác.

- [x] 3.1 RED: S5.4-AC2 Chuyển chế độ khi không ghi âm được (lời nhắc đọc to; không còn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động", kể cả khi online + có `SpeechRecognition` giả).
- [x] 3.2 GREEN: S5.4-AC2 `RecordCompare` render nhánh đọc to (chỉ "Nghe mẫu" + lời nhắc `role="status"`), `SpeakExercise` thêm `!isReadAloud` vào `canAutoCheck` (D4, D6); test 3.1 xanh.
- [x] 3.3 RED: S5.4-AC2 Vẫn nghe mẫu và thấy chữ để đọc (nút "Nghe mẫu" bấm được và phát `audio` của từ; có chữ Hán, pinyin, nghĩa; cả `wordId` và `sentenceId`).
- [x] 3.4 GREEN: S5.4-AC2 giữ "Nghe mẫu" và khối chữ ở nhánh đọc to; test 3.3 xanh. (có thể pass ngay từ 3.2; giữ làm guard)
- [x] 3.5 RED: S5.4-AC2 Vẫn tự đánh giá và tính điểm (chế độ đọc to, chọn "Đúng" ⇒ `onResult({ isCorrect: true })`).
- [x] 3.6 GREEN: S5.4-AC2 `handleSelect` không phụ thuộc chế độ (D6); test 3.5 xanh. (pass ngay; guard)
- [x] 3.7 RED: S5.4-AC2 Chọn Chưa đúng thì tính sai như thường (`onResult` với `isCorrect: false` và `explanation` chứa chữ, pinyin, nghĩa; thêm kiểm ở `pages/lesson/components/LessonRunner.test.tsx` với
  `exerciseRegistry` thật: báo sai và hiện đáp án, có "Tiếp tục", không chặn câu kế).
- [x] 3.8 GREEN: S5.4-AC2 không đổi `explanation` ở chế độ đọc to; test 3.7 xanh. (pass ngay; guard)
- [x] 3.9 RED: S5.4-AC2 Giữ chế độ cho các câu nói sau trong bài (câu 1 thất bại, `rerender` câu 2 với `key` khác: không có "Ghi âm", có lời nhắc và nút "Thử lại ghi âm"; thêm `RecordingModeContext.test.tsx`:
  `enterReadAloud`/`leaveReadAloud`, mặc định no-op khi thiếu provider).
- [x] 3.10 GREEN: S5.4-AC2 `RecordingModeProvider` giữ `isReadAloud` (D3), `RecordCompare` hiện "Thử lại ghi âm" khi `isReadAloud && failureReason === null` (D4); test 3.9 xanh.
- [x] 3.11 RED: S5.4-AC2 Thử lại ghi âm thì quay về chế độ ghi âm (bấm "Thử lại ghi âm" với mic cấp lại: hiện "Ghi âm" và "Nghe bản ghi", mất lời nhắc, focus nằm trong câu; ca mic vẫn hỏng thì hiện hướng dẫn trong câu hiện tại).
- [x] 3.12 GREEN: S5.4-AC2 nút "Thử lại ghi âm" gọi `retry()`, `null` ⇒ `leaveReadAloud()` + focus "Ghi âm"; lỗi ⇒ `RecordGuidance` (D4); test 3.11 xanh.
- [x] 3.13 RED: S5.4-AC2 Mở bài mới thì kiểm tra lại mic (đã ở chế độ đọc to; unmount rồi render lại với `RecordingModeProvider` có `key` khác và mic hoạt động: có nút "Ghi âm", không có lời nhắc;
  thêm kiểm `LessonRunnerContainer.test.tsx` rằng provider được bọc theo `key={lessonId}` nếu test hiện có dựng được câu "nói"; nếu không, ghi rõ ở PR).
- [x] 3.14 GREEN: S5.4-AC2 bọc `<RecordingModeProvider key={lessonId}>` cạnh `AudioSpeedProvider` ở `LessonRunnerContainer.tsx` (D3); test 3.13 xanh.

## 4. Cập nhật test S5.1 bị đổi hành vi

- [x] 4.1 Sửa ca "kỹ thuật, không có Scenario: micro không dùng được…" ở `RecordCompare.record.test.tsx`: mic bị chặn không làm hỏng màn, "Nghe mẫu" vẫn bấm được, hướng dẫn hiện (thay cho "các nút vẫn bấm được"
  vì "Ghi âm"/"Nghe bản ghi" nay bị ẩn theo S5.4-AC2). Đi cùng commit GREEN của 2.4.

## 5. Verify

- [x] 5.1 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và thấy pass; tự kiểm import của `recorder.service`, `useRecorder`, `RecordingModeContext`, `useRecordingMode`, `RecordCompare`, `RecordGuidance`,
  `SpeakExercise`, `LessonRunnerContainer` không đi nhánh ❌ CLAUDE.md §2.
- [x] 5.2 Chạy `pnpm --filter @csk/web build` (đụng CSS/i18n) và thấy pass.
- [ ] 5.3 Thử tay trên `web-dev` (:5173) với trình duyệt thật: chặn quyền micro rồi cấp lại và bấm "Thử lại"; rút/không có micro; trình duyệt không hỗ trợ nếu có; bàn phím + trình đọc màn hình (focus không về `body`).
  Đã thử (web-dev, quyền mic bị chặn): hướng dẫn cấp quyền, nút "Thử lại" và "đọc to rồi tự chọn mức" hiện đúng; focus vào khung hướng dẫn, không về `body`; sáng/tối đều ổn. **Chưa thử**: cấp lại quyền rồi Thử lại, máy không có mic, trình duyệt không hỗ trợ, trình đọc màn hình.
  Ghi kết quả vào PR (design, Rủi ro).
- [x] 5.4 Xem UI: câu "nói" có hướng dẫn (3 lý do) và chế độ đọc to ở mobile 375×812 và desktop 1280×800, sáng và tối; chụp screenshot cho PR (CLAUDE.md §8).
