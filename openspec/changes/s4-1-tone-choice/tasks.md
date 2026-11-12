# Tasks: S4.1 Nghe chọn thanh

Cặp RED/GREEN theo từng Scenario. Test đặt tên chứa ID (`S4.1-AC<k>`) để grep. Commit RED là `test(...)`, GREEN là `feat(...)`.
Tầng test theo [spec-driven.md](../../../docs/05-standards/spec-driven.md) §4.

## 1. AC1: Hiện đúng 5 lựa chọn

- [x] RED: viết test cho `S4.1-AC1 Hiện đúng 5 lựa chọn`. Tầng component (Vitest + Testing Library), file
  `apps/web/src/app/shared/components/exercises/ToneChoiceExercise.test.tsx`: render với từ `bā`, kiểm 5 nút đúng thứ tự
  (Thanh 1, 2, 3, 4, Thanh nhẹ) và có nút "Nghe".
- [x] GREEN: tạo `ToneChoiceExercise.tsx` (ListenButton, SlowToggle, 5 nút), thêm `toneChoice.*` vào
  `apps/web/src/assets/i18n/vi/lesson.json`, tạo `apps/web/src/styles/tailwind/components/_tone-choice.css` và `@import` trong `main.css`.

## 2. AC1: Chưa chọn thì chưa lộ đáp án

- [x] RED (không có RED thật: test pass ngay vì chưa có khối đáp án; giữ làm test chống hồi quy): viết test cho `S4.1-AC1 Chưa chọn thì chưa lộ đáp án`. Tầng component, file `ToneChoiceExercise.test.tsx`:
  trước khi chọn không có chữ "Thanh đúng" và không có pinyin của từ trong DOM.
- [x] GREEN (không cần code mới): khối đáp án chỉ render khi `selectedTone !== null`.

## 3. AC1: Từ không có dấu là thanh nhẹ

- [x] RED: viết test cho `S4.1-AC1 Từ không có dấu là thanh nhẹ`. Hai tầng: (a) `packages/shared/src/pinyin.utils.test.ts`
  cho `toneOfPinyin` (`ma` → 5, `bā`/`bái`/`bǎi`/`bà` → 1..4); (b) component, `ToneChoiceExercise.test.tsx`: từ `ma`, chọn
  "Thanh nhẹ" thì `onResult` nhận `isCorrect: true`.
- [x] GREEN: thêm `Tone` và `toneOfPinyin` vào `pinyin.utils.ts`, export ở `packages/shared/src/index.ts`; component chấm
  bằng `toneOfPinyin(word.pinyin)`.

## 4. AC1: Nội dung dùng từ nhiều âm tiết thì bị báo lỗi

- [x] RED: viết test cho `S4.1-AC1 Nội dung dùng từ nhiều âm tiết thì bị báo lỗi`. Hai tầng: (a) `pinyin.utils.test.ts` cho
  `countPinyinSyllables` (`bàba` 2, `nǐ` 1, `xiān` 1, `huār` 1, `nǐ hǎo` 2); (b) `content/scripts/content-build/lessons.test.ts`
  cho `lessonToneChoiceIssues`: bài có câu `tone-choice` dùng từ pinyin `bàba` → issue `level: 'error'` có file, dòng của `wordId`,
  message nêu bài và câu; từ một âm tiết thì không có issue; kiểm thêm trong test `assembleContent` rằng lỗi này nằm trong
  `lessonIssues` (nên `content-build` không ghi output).
- [x] GREEN: thêm `countPinyinSyllables` vào `pinyin.utils.ts` + export; thêm `lessonToneChoiceIssues` vào `lessons.ts`; gọi
  trong `assemble.ts` (đưa `wordById` lên trước `lessonIssues`).

## 5. AC2: Chọn đúng thì hiện đáp án và pinyin

- [x] RED: viết test cho `S4.1-AC2 Chọn đúng thì hiện đáp án và pinyin`. Tầng component, `ToneChoiceExercise.test.tsx`:
  từ `nǐ`, chọn "Thanh 3" → `onResult({ isCorrect: true })` và màn hiện "Thanh 3" kèm "nǐ".
- [x] GREEN: hoàn thiện khối đáp án và `handleSelect` trong `ToneChoiceExercise.tsx`.

## 6. AC2: Chọn sai thì vẫn hiện đáp án đúng

- [x] RED: viết test cho `S4.1-AC2 Chọn sai thì vẫn hiện đáp án đúng`. Tầng component, `ToneChoiceExercise.test.tsx`:
  từ `nǐ`, chọn "Thanh 1" → `onResult` nhận `isCorrect: false`, `explanation: 'Đáp án đúng: thanh 3 · nǐ'`; màn hiện "Thanh 3" kèm "nǐ".
- [x] GREEN: soạn `explanation` từ `toneChoice.tones.*` và `toneChoice.explanation` khi chọn sai.

## 7. AC2: Mỗi thanh đều nhận đúng

- [x] RED (không có RED thật: test pass ngay vì task 3 và 6 đã chấm đúng; giữ làm test chống hồi quy): viết test cho `S4.1-AC2 Mỗi thanh đều nhận đúng`. Tầng component, `ToneChoiceExercise.test.tsx` (`it.each` năm từ
  `bā`, `bái`, `bǎi`, `bà`, `ma`): chọn đúng thanh thì `isCorrect: true`.
- [x] GREEN (không cần code mới): không cần code mới nếu task 4 và 6 đã đúng; nếu test fail thì sửa `toneOfPinyin` hoặc `TONE_OPTIONS` tới khi xanh.

## 8. AC2: Chọn xong thì khóa lựa chọn

- [x] RED: viết test cho `S4.1-AC2 Chọn xong thì khóa lựa chọn`. Tầng component, `ToneChoiceExercise.test.tsx`: chọn
  một thanh, các nút `disabled`, bấm thêm nút khác thì `onResult` vẫn chỉ được gọi một lần; render với `isLocked` thì bấm không gọi `onResult`.
- [x] GREEN: `handleSelect` bỏ qua khi đã chọn hoặc `isLocked`; nút `disabled` sau khi chọn.

## 9. AC2: Câu chọn thanh không còn bị bỏ qua

- [x] RED: viết test cho `S4.1-AC2 Câu chọn thanh không còn bị bỏ qua`. Tầng component, thêm vào
  `apps/web/src/app/pages/lesson/components/LessonRunner.test.tsx`: render `LessonRunner` với `exerciseRegistry` thật và một
  câu `tone-choice` → có 5 lựa chọn, không có chữ "Dạng bài này chưa có" và nút "Bỏ qua câu này".
- [x] GREEN: đăng ký `'tone-choice': ToneChoiceExercise` trong `exercise.registry.ts`.

## 10. REFACTOR

- [x] Dọn khi đã xanh: file < 300 dòng, không lặp, tự review theo CLAUDE.md §0, §2, §6, §7 (không `any`, không utility visual
  trong `className`, focus nhìn thấy, 44px).

## 11. Verify

- [x] Chạy `pnpm typecheck && pnpm lint && pnpm test:run`, xem kết quả thật.
- [x] Chạy `pnpm content:check` (đụng rule nội dung; 3 câu `tone-choice` của `intro-01` phải vẫn pass).
- [x] Chạy `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` (có CSS mới) và `pnpm e2e` (chạy bài); xem UI ở
  preview `web-dev` cả sáng/tối, mobile/desktop để chụp screenshot cho PR.
- [ ] Tick hết task; PR ghi `Spec PR: #<số>` và `Refs #26` hoặc `Closes #26` khi đủ AC. Không archive trong PR này.
