# Tasks: S5.2 Tự đánh giá

Quy ước: mỗi cặp RED rồi GREEN, test đặt tên chứa ID Scenario. RED phải fail vì thiếu hành vi (không phải lỗi import). Commit `test(...)`
cho RED, `feat(...)` cho GREEN. Chỉ bắt đầu sau khi S5.1 đã merge vào `main`.

## 1. Chuẩn bị

- [x] 1.1 Đọc API khối ghi âm đã merge của S5.1 (tên component, props) và ghi vào PR; kiểm tra: `SpeakExercise` sẽ import đúng tên đó.
- [x] 1.2 Quy tắc mức → đúng/sai: tạo `apps/web/src/app/shared/utils/speak-rating.utils.ts` (khung `SPEAK_RATINGS`, `SpeakRating`) cùng i18n `speak.*` trong
  `assets/i18n/vi/lesson.json` và `_speak-rating.css` + `@import` ở `main.css` (config/asset thuần, không có hành vi: miễn test-first); kiểm tra:
  `pnpm typecheck` xanh.

## 2. AC1 Có 3 mức tự đánh giá

Test: `apps/web/src/app/shared/components/exercises/SpeakExercise.test.tsx` (Vitest + Testing Library) trừ khi ghi khác.

- [x] 2.1 RED: S5.2-AC1 Câu nói hiện nội dung để đọc và 3 mức (chữ Hán, pinyin, nghĩa; nút Chưa đúng/Gần đúng/Đúng; cả trường hợp `wordId` và `sentenceId`).
- [x] 2.2 GREEN: S5.2-AC1 tạo `SpeakExercise.tsx` (D3) hiện nội dung + khối S5.1 + 3 nút; test 2.1 xanh.
- [x] 2.3 RED: S5.2-AC1 Chưa chọn mức thì chưa chấm, chưa có "Tiếp tục". Test ở `pages/lesson/components/LessonRunner.test.tsx` với `exerciseRegistry` thật. (pass ngay: hành vi âm tính, giữ làm guard chống hồi quy)
- [x] 2.4 GREEN: S5.2-AC1 đăng ký `speak: SpeakExercise` ở `exercise.registry.ts`; không gọi `onResult` khi chưa chọn; test 2.3 xanh. (đăng ký registry đã làm ở 2.2; không gọi onResult khi chưa chọn vẫn đúng)
- [x] 2.5 RED: S5.2-AC1 Chọn mức mà chưa ghi âm vẫn chấm theo mức đã chọn (`SpeakExercise.test.tsx`).
- [x] 2.6 GREEN: S5.2-AC1 `handleSelect` không phụ thuộc trạng thái ghi âm; test 2.5 xanh.
- [x] 2.7 RED: S5.2-AC1 Chọn mức thì câu được chấm ngay: báo kết quả bằng chữ, có "Tiếp tục" (`LessonRunner.test.tsx`). (pass ngay: 2.6 đã gọi onResult; giữ làm guard)
- [x] 2.8 GREEN: S5.2-AC1 `onResult` ngay khi chọn; test 2.7 xanh. (đã làm ở 2.6)
- [x] 2.9 RED: S5.2-AC1 Đã chọn "Gần đúng" rồi bấm "Đúng" thì vẫn theo "Gần đúng", 3 nút bị khóa (`SpeakExercise.test.tsx`).
- [x] 2.10 GREEN: S5.2-AC1 khóa bằng state `selectedRating` và `isLocked`, 3 nút `disabled`; test 2.9 xanh.
- [x] 2.11 RED: S5.2-AC1 Mức đã chọn được báo bằng chữ ("Đã chọn" và `aria-pressed`, không chỉ màu) (`SpeakExercise.test.tsx`).
- [x] 2.12 GREEN: S5.2-AC1 `aria-pressed` + `<span>` chữ "Đã chọn" + `.is-selected`; test 2.11 xanh.
- [x] 2.13 RED: S5.2-AC1 Chọn bằng bàn phím: Tab tới "Đúng", Enter thì chấm theo "Đúng" (`SpeakExercise.test.tsx`, `userEvent`). (pass ngay: button gốc; giữ làm guard)
- [x] 2.14 GREEN: S5.2-AC1 dùng `<button type="button">` gốc, focus nhìn thấy; test 2.13 xanh. (đã đúng từ 2.2)

## 3. AC2 Mức đánh giá được tính vào điểm

- [x] 3.1 RED: S5.2-AC2 Chọn Đúng thì tính câu đúng, không hiện giải thích, tổng kết "100%" và "Sai 0 câu" (pass ngay; guard)
  (`pages/lesson/containers/LessonRunnerContainer.test.tsx`, registry thật; thêm `speak-rating.utils.test.ts` cho `isRatingCorrect('correct')`).
- [x] 3.2 GREEN: S5.2-AC2 `isRatingCorrect` trong `speak-rating.utils.ts` (comment "Rule: …") và `SpeakExercise` báo `{ isCorrect: true }`; test 3.1 xanh. (đã làm ở 2.6)
- [x] 3.3 RED: S5.2-AC2 Chọn Gần đúng thì tính câu sai, hiện chữ, pinyin, nghĩa; tổng kết "0%" và "Sai 1 câu" (pass ngay; guard)
  (`LessonRunnerContainer.test.tsx` + `speak-rating.utils.test.ts`).
- [x] 3.4 GREEN: S5.2-AC2 nhánh sai kèm `explanation` từ `t('speak.explanation', { hanzi, pinyin, vi })`; test 3.3 xanh. (đã làm ở 2.6)
- [x] 3.5 RED: S5.2-AC2 Chọn Chưa đúng thì tính câu sai, hiện giải thích; tổng kết "0%" và "Sai 1 câu" (`LessonRunnerContainer.test.tsx`). (pass ngay; guard)
- [x] 3.6 GREEN: S5.2-AC2 `isRatingCorrect('not-yet')` là false, dùng chung nhánh sai; test 3.5 xanh. (đã làm ở 2.6)
- [x] 3.7 RED: S5.2-AC2 Bài 4 câu (2 thường đúng, "Đúng", "Chưa đúng") thì "75%", "Đúng 3 / 4 câu", "Sai 1 câu" (`LessonRunnerContainer.test.tsx`). (pass ngay; guard)
- [x] 3.8 GREEN: S5.2-AC2 câu nói cộng chung qua `LessonService.submitResult`/`summarize` có sẵn; sửa nếu test lộ lỗi; test 3.7 xanh. (không cần sửa)
- [x] 3.9 RED: S5.2-AC2 Bài kiểm tra 5 câu (4 "Đúng", 1 "Gần đúng") thì 80% và được ghi nhận xong (`shared/services/lesson.service.test.ts`, dùng `isRatingCorrect`). (pass ngay; guard)
- [x] 3.10 GREEN: S5.2-AC2 kết quả câu nói tính như câu thường ở `summarize`/`isTestPassed`; sửa nếu test lộ lỗi; test 3.9 xanh. (không cần sửa)

## 4. Verify

- [x] 4.1 Chạy `pnpm typecheck && pnpm lint && pnpm test:run` và thấy pass; tự kiểm import của `SpeakExercise` không đi nhánh ❌ CLAUDE.md §2.
- [ ] 4.2 Xem UI ở `web-dev` (:5173): câu "nói" trên mobile 375×812 và desktop 1280×800, sáng và tối; chụp screenshot cho PR (CLAUDE.md §8).
