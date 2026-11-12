# Design: S4.1 Nghe chọn thanh

Spec: [proposal.md](./proposal.md), [specs/tone-choice/spec.md](./specs/tone-choice/spec.md). Không đổi spec.

## Context

Đã quan sát trong repo (nhánh này, sau khi S4.4 đã merge):

- `exercise.registry.ts`: `exerciseRegistry` đang rỗng; `LessonRunner` tra `kind` qua `resolveExerciseComponent`,
  không thấy thì hiện "Dạng bài này chưa có" + nút Bỏ qua. Đăng ký vào registry là đủ để câu không còn bị bỏ qua.
- `ExerciseProps<K>` (`exercise.types.ts`): `exercise`, `content` (`words` theo thứ tự ID của câu), `onResult`,
  `isLocked`. `ExerciseResult = { isCorrect, explanation? }`; `explanation` do dạng bài soạn, `LessonFeedback` hiện khi sai.
- S4.4 đã có `ListenButton` (`audioPath`) và `SlowToggle` trong `shared/components/`; `AudioSpeedProvider`
  bọc sẵn trong `LessonRunnerContainer`. Chưa nơi nào dùng `SlowToggle`.
- `packages/shared/src/pinyin.utils.ts` đã có `TONE_MARKS` (không export), `isToneMarkedPinyin`, `pinyinKey`.
  Chưa có hàm lấy thanh hay đếm âm tiết.
- `lessonSchema` (`content.schema.ts`) chỉ biết `wordId`, không biết pinyin của từ. Kiểm tra tham chiếu từ nằm ở
  `content/scripts/content-build/lessons.ts` (`lessonRefIssues`, nhận tập ID từ) và được gom vào `lessonIssues`
  trong `assemble.ts`; có issue `level: 'error'` thì `content-build/index.ts` không ghi output.

Đề xuất thêm: mọi thứ dưới đây.

## Goals / Non-Goals

- Goals: dạng bài `tone-choice` chạy trong khung bài; hàm thuần lấy thanh dùng lại được ở S4.3; kiểm tra nội dung từ một âm tiết.
- Non-Goals: tạo thẻ ôn tập từ câu sai (S9.4); đổi `LessonRunner`, `useLessonRunner`, hợp đồng `ExerciseProps`.

## Decisions

### 1. Layer đích và file (CLAUDE.md §1)

| Việc | Layer | File |
|---|---|---|
| `toneOfPinyin`, `countPinyinSyllables`, kiểu `Tone` | `packages/shared` | sửa `pinyin.utils.ts`, `index.ts` (export); test `pinyin.utils.test.ts` |
| Rule nội dung: từ của câu `tone-choice` một âm tiết | `content/scripts/content-build` | sửa `lessons.ts` (thêm `lessonToneChoiceIssues`) và `assemble.ts` (gom vào `lessonIssues`); test `lessons.test.ts` |
| Dạng bài | `shared/components/exercises/` | tạo `ToneChoiceExercise.tsx` (+ `.test.tsx`); sửa `exercise.registry.ts` |
| Chuỗi i18n | `assets/i18n/vi/` | sửa `lesson.json` (nhóm `toneChoice`) |
| Style BEM | `apps/web/src/styles/tailwind/components/` | tạo `_tone-choice.css`; thêm `@import` vào `main.css` |

Không có service mới, không đụng `core/services`, IndexedDB, hook trang. Lệch với proposal: proposal ghi rule kiểm tra ở
`content.schema.ts`, nhưng schema bài không có pinyin của từ (chỉ `wordId`), nên rule phải ở bước build, nơi đã có từ điển,
cùng chỗ với `lessonRefIssues`. Hành vi cho người soạn giữ nguyên (báo lỗi chỉ rõ bài và câu, không ghi output).

### 2. Hàm thuần trong `@csk/shared`

- `export type Tone = 1 | 2 | 3 | 4 | 5` (5 = thanh nhẹ).
- `toneOfPinyin(pinyin: string): Tone`. Rule: chuẩn hóa NFC, tìm nguyên âm có dấu thanh (tra ngược `TONE_MARKS`) → thanh 1-4;
  không có dấu → 5. Dành cho một âm tiết.
- `countPinyinSyllables(pinyin: string): number`. Rule: tách theo khoảng trắng, `'`, `-`; mỗi mảnh đếm số cụm nguyên âm
  liền nhau (`aeiouü` và dạng có dấu); `bàba` = 2, `nǐ` = 1, `xiān` = 1, `huār` = 1. Không dùng độ dài chữ Hán để đếm vì
  âm tiết có thể có erhua.
- Cả hai pure, không import mới; `shared/utils` và `core` không liên quan.

Phương án khác: đếm số chữ Hán của `hanzi`. Loại vì lệch với khái niệm âm tiết ở erhua và vì spec nói theo âm tiết.

### 3. Component `ToneChoiceExercise`

`ExerciseProps<'tone-choice'>`, chỉ nhận props (CLAUDE.md §2: exercises không gọi service).

- Từ của câu: `content.words[0]`; thiếu thì render rỗng an toàn (không throw).
- Hiện `ListenButton audioPath={word.audio}` và `SlowToggle`, rồi 5 nút theo thứ tự `[1, 2, 3, 4, 5]` (hằng `TONE_OPTIONS`
  trong file). Tên hiển thị "Thanh 1".."Thanh 4", "Thanh nhẹ" lấy từ i18n.
- State cục bộ UI: `selectedTone: Tone | null`. Chọn: nếu `isLocked` hoặc đã có `selectedTone` thì bỏ qua (khóa);
  ngược lại set, tính `correctTone = toneOfPinyin(word.pinyin)`, gọi `onResult({ isCorrect, explanation })`.
  `explanation` = `t('toneChoice.explanation', { tone: <thanh đúng viết thường>, pinyin: word.pinyin })` →
  "Đáp án đúng: thanh 3 · nǐ". Chỉ truyền khi sai (đúng thì bỏ field).
- Sau khi chọn (`selectedTone !== null`) hiện khối đáp án: "Thanh 3" + pinyin có dấu của từ; các nút `disabled` (khóa).
  Trước khi chọn không render pinyin và thanh đúng ở bất kỳ chỗ nào (kể cả `aria-label`, `title`).
- Nút là `button type="button"` trong `role="group"` có nhãn; trạng thái đúng/sai của nút dùng `.is-correct`/`.is-incorrect`
  và không chỉ dựa vào màu (có chữ trong khối đáp án).
- Không dùng `useEffect` để đồng bộ; không `any`.

Import kiểm tra: `react`, `react-i18next`, `@csk/shared`, `../ListenButton`, `../SlowToggle`. `ListenButton` nằm
`shared/components` (cho phép), tự dùng `core/hooks`; không import `shared/services` hay `core/services`. Không nhánh ❌ nào.

### 4. Đăng ký registry

`exerciseRegistry = { 'tone-choice': ToneChoiceExercise }` trong `exercise.registry.ts`. S4.2, S4.3 thêm key của chúng sau.
Không đổi `resolveExerciseComponent`.

### 5. Rule kiểm tra nội dung

`lessonToneChoiceIssues(parsed, wordsById): ContentIssue[]` trong `lessons.ts`, cạnh `lessonRefIssues`: với mỗi exercise
`kind === 'tone-choice'` (đọc từ dữ liệu thô như `referencesOf`) có từ trong từ điển mà
`countPinyinSyllables(word.pinyin) > 1` → `{ level: 'error', file, line: lineOf(['exercises', i, 'wordId']),
message: 'Câu "<id>" của bài "<lessonId>": từ "<wordId>" (<pinyin>) có nhiều hơn một âm tiết, câu chọn thanh chỉ dùng từ một âm tiết' }`.
`assemble.ts` truyền `Map<id, Word>` (đã có `wordById`, chuyển lên trước `lessonIssues`) và spread kết quả vào `lessonIssues`.
Lỗi `level: 'error'` đã làm `content-build` không ghi output (hành vi có sẵn), nên không cần code thêm cho "không được ghi ra".
Từ không có trong từ điển bỏ qua ở rule này vì `lessonRefIssues` đã báo.

Dữ liệu ngoài cần Zod: không thêm. Word đã qua `wordSchema` ở build và ở nạp (`content.service`).

### 6. i18n và style

`lesson.json` thêm `toneChoice`: `groupLabel`, `options.1..5` ("Thanh 1".."Thanh nhẹ"), `answerLabel` ("Thanh đúng"),
`tones.1..5` (viết thường: "thanh 1".."thanh nhẹ"), `explanation` ("Đáp án đúng: {{tone}} · {{pinyin}}").
`_tone-choice.css`: `.tone-choice-options`, `.tone-choice-option` (+ `.is-correct`, `.is-incorrect`, `:disabled`),
`.tone-choice-answer`; token màu/spacing có sẵn, cao tối thiểu 44px, `prefers-reduced-motion`. Trong JSX chỉ dùng
`flex flex-col gap-*` v.v. (CLAUDE.md §6).

## Risks / Trade-offs

- Đếm âm tiết bằng cụm nguyên âm có thể sai với pinyin hiếm (vd hai nguyên âm khác thanh liền nhau). → Test các mẫu trong
  `words.json`; nếu `content:check` báo nhầm trên nội dung S7.1, mở spec fix.
- Hiển thị hai nút phát (Nghe, Nghe chậm) ở cả câu sai lẫn đúng: giữ khả dụng sau khi khóa theo S4.4. → Không khóa `ListenButton`.
- Chưa có e2e vì chưa có nội dung Nhập môn dùng dạng này (proposal, câu hỏi mở 1); bài mẫu `intro-01` đã có 3 câu
  `tone-choice` nhưng e2e hiện tại không đi qua. → Chạy `pnpm e2e` ở task verify để chắc không vỡ luồng cũ.

## Migration Plan

Không đổi IndexedDB hay schema lưu. Rollback = revert PR. Câu `tone-choice` đang bị bỏ qua sẽ chạy bình thường sau khi merge.
