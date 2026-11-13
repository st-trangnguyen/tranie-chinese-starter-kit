# Tasks: S4.2 Phân biệt cặp âm gần nhau

Cặp RED/GREEN theo từng Scenario. Test đặt tên chứa ID (`S4.2-AC<k>`) để grep. Commit RED là `test(...)`, GREEN là `feat(...)`.
Tầng test theo [spec-driven.md](../../../docs/05-standards/spec-driven.md) §4. Test component nằm ở
`apps/web/src/app/shared/components/exercises/SoundPairExercise.test.tsx` (gọi tắt "file test dạng bài"), bọc `AudioSpeedProvider` như
`ToneChoiceExercise.test.tsx`.

## 1. AC1: Câu cặp âm có đúng 2 lựa chọn

- [x] RED: viết test cho `S4.2-AC1 Câu cặp âm có đúng 2 lựa chọn`. Tầng component, file test dạng bài: render với cặp `sì`/`shì`;
  nhóm lựa chọn có đúng 2 nút ghi pinyin của hai từ và có nút "Nghe".
- [x] GREEN: tạo `SoundPairExercise.tsx` (ListenButton, SlowToggle, 2 nút), thêm `soundPair.*` vào
  `apps/web/src/assets/i18n/vi/lesson.json`, tạo `apps/web/src/styles/tailwind/components/_sound-pair.css` và `@import` trong `main.css`.

## 2. AC1: Mỗi loại cặp đều chấm được

- [x] RED: viết test cho `S4.2-AC1 Mỗi loại cặp đều chấm được`. Tầng component, file test dạng bài (`it.each` bốn cặp
  `zhǐ/zǐ`, `qī/chī`, `fàn/fàng`, `nǚ/nǔ`): chọn đúng đáp án thì `onResult` nhận `isCorrect: true` ở cả bốn. (Có thể pass ngay sau task 1 và 3; ghi rõ nếu không có RED thật, giữ làm test chống hồi quy.)
- [x] GREEN: chấm theo `word.id === answerWordId` trong `handleSelect` (làm cùng task 4; không cần code riêng theo loại cặp).

## 3. AC1: Thứ tự lựa chọn không cố định

- [x] RED: viết test cho `S4.2-AC1 Thứ tự lựa chọn không cố định`. Hai tầng: (a) util, file
  `apps/web/src/app/shared/utils/pair-order.utils.test.ts`: `orderPair` với `random` trả 0 giữ nguyên, trả 0.9 đảo, không mutate đầu vào;
  (b) component, file test dạng bài: `vi.spyOn(Math, 'random')` trả `0` rồi `0.9`, mount lại cùng câu, đáp án ở trước rồi ở sau.
- [x] GREEN: tạo `apps/web/src/app/shared/utils/pair-order.utils.ts` (`orderPair`); component xáo một lần bằng `useState(() => orderPair(...))`.

## 4. AC2: Chọn đúng âm

- [x] RED (pass ngay vì task 2 đã làm `handleSelect`; giữ làm test chống hồi quy): viết test cho `S4.2-AC2 Chọn đúng âm`. Tầng component, file test dạng bài: câu có đáp án `sì` trong cặp `sì/shì`, chọn "sì"
  → `onResult({ isCorrect: true })`, không có `explanation`.
- [x] GREEN (không cần code mới; khối trạng thái đúng/sai làm ở task 5, 7, 8): hoàn thiện `handleSelect` và khối trạng thái đúng/sai trong `SoundPairExercise.tsx`.

## 5. AC2: Chọn sai âm

- [x] RED: viết test cho `S4.2-AC2 Chọn sai âm`. Tầng component, file test dạng bài: cùng câu, chọn "shì" → `onResult` nhận
  `isCorrect: false`, `explanation: 'Đáp án đúng: sì'`.
- [x] GREEN: soạn `explanation` từ `soundPair.explanation` khi chọn sai.

## 6. AC2: Trước khi chấm không nghe riêng từng lựa chọn

- [x] RED (pass ngay, giữ làm test chống hồi quy): viết test cho `S4.2-AC2 Trước khi chấm không nghe riêng từng lựa chọn`. Tầng component, file test dạng bài: chưa chọn thì
  chỉ có một nút nghe tên "Nghe" (không có "Nghe sì"/"Nghe shì"), và hai nút lựa chọn không chứa nút nghe con. (Có thể pass ngay; giữ làm test chống hồi quy.)
- [x] GREEN (không cần code mới nếu task 1 đúng): nút nghe riêng từng âm chỉ render khi `selectedWordId !== null`.

## 7. AC2: Sau khi chấm nghe lại được cả hai âm

- [x] RED: viết test cho `S4.2-AC2 Sau khi chấm nghe lại được cả hai âm`. Tầng component, file test dạng bài, dùng `Audio` giả ở ranh giới
  như test S4.4/S4.1: chọn xong thì có nút "Nghe sì" và "Nghe shì"; bấm mỗi nút nhiều lần phát đúng `src` của từ tương ứng mỗi lần.
- [x] GREEN: khối so sánh với hai `ListenButton label={t('soundPair.listenWord', …)}` hiện sau khi chọn.

## 8. AC2: Chọn xong thì khóa lựa chọn

- [x] RED: viết test cho `S4.2-AC2 Chọn xong thì khóa lựa chọn`. Tầng component, file test dạng bài: chọn một lựa chọn, cả hai nút `disabled`,
  bấm lựa chọn kia `onResult` vẫn chỉ được gọi một lần; render với `isLocked` thì bấm không gọi `onResult`.
- [x] GREEN: `handleSelect` bỏ qua khi đã chọn hoặc `isLocked`; nút `disabled` sau khi chọn.

## 9. AC2: Câu cặp âm không còn bị bỏ qua

- [x] RED: viết test cho `S4.2-AC2 Câu cặp âm không còn bị bỏ qua`. Tầng component, thêm vào
  `apps/web/src/app/pages/lesson/components/LessonRunner.test.tsx`: render `LessonRunner` với `exerciseRegistry` thật và một câu
  `sound-pair` → có 2 lựa chọn, không có "Dạng bài này chưa có" và nút "Bỏ qua câu này".
- [x] GREEN: đăng ký `'sound-pair': SoundPairExercise` trong `apps/web/src/app/shared/components/exercises/exercise.registry.ts`.

## 10. REFACTOR

- [x] Dọn khi đã xanh: file < 300 dòng, không lặp, tự review theo CLAUDE.md §0, §2, §6, §7 (không `any`, không utility visual trong
  `className`, focus nhìn thấy, 44px, không `useEffect` đồng bộ).

## 11. Verify

- [x] Chạy `pnpm typecheck && pnpm lint && pnpm test:run`, xem kết quả thật.
- [x] Chạy `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` (có CSS mới) và `pnpm e2e` (chắc không vỡ luồng cũ); xem UI ở
  preview `web-dev` cả sáng/tối, mobile/desktop để chụp screenshot cho PR. Không cần `content:check` (không đụng nội dung).
- [x] Tick hết task; PR ghi `Spec PR: #<số>` và `Closes #27` (hoặc `Refs #27` nếu thiếu AC). Không archive trong PR này.
