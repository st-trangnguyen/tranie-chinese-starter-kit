# Design: S4.3 Nghe rồi gõ pinyin

Spec: [proposal.md](./proposal.md), [specs/pinyin-type/spec.md](./specs/pinyin-type/spec.md). Không đổi spec.

## Context

Đã quan sát trong repo (nhánh này, sau khi S4.1 và S4.4 đã merge):

- `exercise.registry.ts`: đang có `'tone-choice': ToneChoiceExercise`; `LessonRunner` tra `kind` qua `resolveExerciseComponent`,
  không thấy thì hiện "Dạng bài này chưa có" + nút Bỏ qua. Đăng ký `'pinyin-type'` là đủ để câu không còn bị bỏ qua.
- `ExerciseProps<K>`: `exercise`, `content` (`words` theo thứ tự ID của câu), `onResult`, `isLocked`.
  `ExerciseResult = { isCorrect, explanation? }`; `LessonFeedback` hiện `explanation` khi sai.
- `ToneChoiceExercise.tsx` (S4.1) là mẫu để bám: chỉ nhận props, `ListenButton audioPath={word.audio}` + `SlowToggle`,
  state UI cục bộ, `useTranslation('lesson')`, CSS riêng `_tone-choice.css` import trong `main.css`.
- `exerciseSchema` đã có `kind: 'pinyin-type'` với `wordId`. Từ `爸爸` (`bàba`) đã nằm trong bài mẫu `intro-01` (câu `e5`),
  hiện đang bị bỏ qua.
- `packages/shared/src/pinyin.utils.ts` (113 dòng) đã có `numberedToToneMarks`, `pinyinKey`, `toneOfPinyin`, `Tone`,
  `countPinyinSyllables`, và (không export) `TONE_MARKS`, `applyTone`, `markVowelIndex`, `convertSyllable`.
  `numberedToToneMarks('ni3hao3')` **không** đổi được (mỗi mảnh cách nhau khoảng trắng phải là một âm tiết), nên chưa dùng được
  cho gõ liền. Chưa có bảng âm tiết, hàm tách âm tiết, tách thanh mẫu/vận mẫu, hay so sánh.
- Pinyin trong `words.json` phần lớn viết liền (proposal), có erhua (`huār`).

Đề xuất thêm: mọi thứ dưới đây.

## Goals / Non-Goals

- Goals: dạng bài `pinyin-type` chạy trong khung bài; bộ hàm thuần trong `@csk/shared` (tách âm tiết, đổi số → dấu khi gõ,
  so sánh và chỉ phần sai) dùng lại được ở S9.4 và e2e S7.1.
- Non-Goals: bàn phím pinyin riêng; tạo thẻ ôn tập từ câu sai (S9.4); đổi `LessonRunner`, `useLessonRunner`, `ExerciseProps`,
  schema nội dung, IndexedDB; thêm dependency.

## Decisions

### 1. Layer đích và file (CLAUDE.md §1)

| Việc | Layer | File |
|---|---|---|
| Bảng âm tiết hợp lệ không thanh + `splitPinyinSyllables` | `packages/shared` | tạo `pinyin.syllables.ts` (+ `.test.ts`) |
| Đổi số → dấu khi gõ (`convertTypedPinyin`) | `packages/shared` | sửa `pinyin.utils.ts` (+ `pinyin.utils.test.ts`) |
| Tách thanh mẫu/vận mẫu/thanh điệu, so sánh, chỉ phần sai (`parsePinyin`, `comparePinyin`) | `packages/shared` | tạo `pinyin.compare.ts` (+ `.test.ts`) |
| Export | `packages/shared` | sửa `index.ts` |
| Dạng bài | `shared/components/exercises/` | tạo `PinyinTypeExercise.tsx` (+ `.test.tsx`); sửa `exercise.registry.ts` |
| Chuỗi i18n | `assets/i18n/vi/` | sửa `lesson.json` (nhóm `pinyinType`) |
| Style BEM | `apps/web/src/styles/tailwind/components/` | tạo `_pinyin-type.css`; thêm `@import` vào `main.css` |
| Test chạy bài | `pages/lesson/components/` | sửa `LessonRunner.test.tsx` |

Không có service mới, không đụng `core/services`, IndexedDB, hook trang, `shared/services`. Lệch với proposal (chỉ nói
"`pinyin.utils.ts`"): `pinyin.utils.ts` đã 113 dòng, thêm bảng âm tiết và so sánh sẽ vượt 300 dòng (CLAUDE.md §5), nên tách
thành ba file cạnh nhau trong `@csk/shared`; vẫn là pure util, cùng layer. `pinyin.compare.ts` và `pinyin.syllables.ts` theo
mẫu `pinyin.charset.ts` đã có.

### 2. Bảng âm tiết và tách âm tiết (`pinyin.syllables.ts`)

- `PINYIN_INITIALS`: `zh ch sh b p m f d t n l g k h j q x r z c s y w` (xếp dài trước ngắn). Quyết định: `y`, `w` được coi là
  thanh mẫu (chính tả pinyin không coi vậy, nhưng người học thấy `ya`/`wa` là âm đầu khác nhau; xem Câu hỏi mở 1).
- `PINYIN_SYLLABLES: ReadonlySet<string>`: các âm tiết hợp lệ **không thanh**, ü viết `ü` (`lü`, `nü`, `lüe`, `nüe`); `ju qu xu yu`
  viết bằng `u`. Gồm cả âm tiết không thanh mẫu (`a`, `o`, `e`, `er`, `an`...). Khai báo thành chuỗi cách nhau khoảng trắng, theo nhóm thanh mẫu, rồi
  `new Set(...split(' '))` để dễ đọc và đối chiếu bảng chuẩn.
- `splitPinyinSyllables(letters: string): string[]`: nhận chuỗi **chữ thường, không thanh** (ü đã chuẩn hóa), trả danh sách âm tiết.
  Rule: quy hoạch động đủ chuỗi; ưu tiên khớp dài nhất ở đầu (`fangan` → `fang`+`an`); mỗi âm tiết có thể kèm hậu tố erhua `r`
  khi sau `r` không còn nguyên âm (`huar` → một âm tiết `huar`, `bar` ok, `shiren` → `shi`+`ren`). Không tách được trọn vẹn
  thì trả `[letters]` (một mảnh) để các bước sau không bao giờ ném lỗi trên chuỗi người học gõ bậy.
- Dữ liệu ngoài cần Zod: không. Bảng là hằng trong code; pinyin người gõ không phải "dữ liệu ngoài" cần gắn type, chỉ là
  string đi qua hàm thuần.

### 3. Đổi số → dấu khi gõ (`convertTypedPinyin` trong `pinyin.utils.ts`)

`convertTypedPinyin(input: string): string`, pure, chạy mỗi lần `onChange` trên toàn chuỗi (idempotent: chuỗi đã đổi đưa vào
lần nữa không đổi gì thêm).

Rule: đi từ trái sang phải; mỗi chữ số `1–5` đứng ngay sau một đoạn chữ cái liền nhau (chữ, `ü`, `v`, `u:`, đã có dấu cũng tính)
thì:
1. lấy đoạn chữ cái đó (từ ký tự sau dấu cách/số trước tới ngay trước số), bỏ dấu để tách bằng `splitPinyinSyllables`;
2. áp thanh lên **âm tiết cuối** của đoạn bằng `applyTone` (dùng lại, giữ nguyên rule đặt dấu), số 5 → không dấu;
3. `v`/`u:` → `ü` trong đoạn; sau `j q x y` thì `ü` → `u` (`jv4` = `jù`);
4. bỏ chữ số khỏi kết quả.

Giữ nguyên ký tự khi: số ở đầu chuỗi hoặc sau khoảng trắng/số khác (không có đoạn chữ phía trước); đoạn không tách được thành
âm tiết hợp lệ; âm tiết cuối đã có dấu (không đổi dấu đã có). Chưa gõ số thì không đổi gì (kể cả `v`), vì chưa biết người học
gõ xong chưa. `applyTone`, `markVowelIndex` giữ private, chỉ thêm hàm export mới trong cùng file.

Bảng kiểm của spec: `ni3`→`nǐ`, `ni3hao3`→`nǐhǎo`, `ni3 hao3`→`nǐ hǎo`, `lv4`→`lǜ`, `ma5`→`ma`, `3`→`3`.

### 4. Tách thành phần và so sánh (`pinyin.compare.ts`)

```ts
export interface PinyinSyllable { initial: string; final: string; tone: Tone }
export interface PinyinSyllableDiff {
  expected: PinyinSyllable | null;   // null: người học gõ thừa
  typed: PinyinSyllable | null;      // null: người học gõ thiếu
  isInitialWrong: boolean; isFinalWrong: boolean; isToneWrong: boolean;
}
export interface PinyinComparison { isCorrect: boolean; syllables: PinyinSyllableDiff[] }
export function parsePinyin(text: string): PinyinSyllable[]
export function comparePinyin(typed: string, expected: string): PinyinComparison
```

- `parsePinyin` (Rule: chuẩn hóa như bước 3 của `convertTypedPinyin`; NFC, chữ thường, `trim`; tách theo khoảng trắng/`'`/`-`;
  mỗi mảnh đổi số → dấu bằng `convertTypedPinyin`, rồi bỏ dấu ghi lại thanh bằng `toneOfPinyin` theo từng âm tiết sau
  `splitPinyinSyllables`; tách `initial` = tiền tố dài nhất trong `PINYIN_INITIALS`, `final` = phần còn lại (kèm `r` erhua).
  Không bao giờ ném lỗi; mảnh lạ thành một âm tiết với `initial`/`final` suy từ cùng quy tắc.
- `comparePinyin`:
  - Rule đúng/sai: `isCorrect` khi `pinyinKey(convertTypedPinyin(typed))` (thêm `v`/`u:` → `ü`) bằng `pinyinKey(expected)`.
    So bằng khóa chuỗi, không bằng danh sách âm tiết, để một cách tách khác nhau không làm đáp án đúng thành sai
    (`fan1gan1` và `fāngān`). Thanh nhẹ đúng cả khi gõ 5 hay không số vì số 5 bị bỏ khi đổi. Khoảng trắng thừa, hoa/thường đã
    do `pinyinKey` xử lý. Chuỗi trống sau `trim` không đúng.
  - Rule chỉ chỗ sai: khi sai, `parsePinyin` cả hai, ghép theo vị trí; mỗi cặp so `initial`, `final`, `tone`
    riêng; âm tiết chỉ có ở một bên (thiếu hoặc thừa) có cả ba cờ `true`. Khi đúng, `syllables` là danh sách của đáp án
    với ba cờ `false`.
- Tách khỏi nhau: `comparePinyin` chạy được ngoài React, không biết i18n hay UI.

### 5. Component `PinyinTypeExercise`

`ExerciseProps<'pinyin-type'>`, chỉ nhận props (CLAUDE.md §2: exercises không gọi service).

- Từ của câu: `content.words[0]`; thiếu thì `return null`, không throw.
- Bố cục: `ListenButton audioPath={word.audio}` + `SlowToggle`, rồi `<form onSubmit>` (Enter và nút đều chấm) với `<label>`
  gắn `<input type="text">` (`autoComplete="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `lang="zh-Latn-pinyin"`) và
  `button type="submit"` "Kiểm tra".
- State UI cục bộ: `value: string`, `result: PinyinComparison | null`. Không dùng `useEffect`.
- `handleChange`: `setValue(convertTypedPinyin(event.target.value))`. Rủi ro con trỏ nhảy cuối ô khi sửa giữa chuỗi: chấp nhận
  (đổi chỉ xảy ra ngay sau khi gõ số, thường ở cuối).
- `handleSubmit(event)`: `preventDefault`; thoát nếu `isLocked` hoặc `result !== null` hoặc `value.trim() === ''` (ô trống:
  chưa chấm, ô vẫn nhập được, không gọi `onResult`); ngược lại `comparePinyin(value, word.pinyin)`, `setResult`,
  `onResult({ isCorrect, explanation })`. `explanation` chỉ khi sai: `t('pinyinType.explanation', { pinyin: word.pinyin })` →
  "Đáp án đúng: nǐ hǎo".
- Sau khi chấm: input `disabled` (khóa), nút Kiểm tra `disabled`. Trước khi chấm không render pinyin đúng ở bất kỳ chỗ nào
  (kể cả `aria-label`, `title`, `placeholder`).
- Khối kết quả (chỉ khi `result !== null`): "Pinyin đúng" + `word.pinyin`. Khi sai, thêm danh sách theo từng âm tiết
  (`<ol>`, mỗi `<li>` một âm tiết, thứ tự theo `result.syllables`) liệt kê **chỉ các phần sai**; mỗi phần sai là
  `<li class="pinyin-type-part is-wrong">` chứa nhãn chữ `pinyinType.parts.initial|final|tone` ("Thanh mẫu", "Vận mẫu",
  "Thanh điệu") và giá trị người học đã gõ cho phần đó (rỗng/thiếu thì "—"). Phần đúng không render nhãn, nên "chỉ thanh mẫu
  tô sai" kiểm được bằng việc chỉ có nhãn "Thanh mẫu". Phần sai phân biệt bằng nhãn chữ và viền, không chỉ màu (WCAG).
  Khối có `role="status"`/`aria-live="polite"` để đọc kết quả.
- Trong JSX chỉ dùng utility layout/spacing (`flex flex-col gap-*`); phần sai thể hiện bằng `.is-wrong` trong CSS (CLAUDE.md §6).

Import kiểm tra: `react`, `react-i18next`, `@csk/shared`, `../ListenButton`, `../SlowToggle`, `./exercise.types`. Không import
`shared/services`, `core/services`, Dexie. Không nhánh ❌ nào.

### 6. Đăng ký registry

Thêm `'pinyin-type': PinyinTypeExercise` vào `exerciseRegistry`. Không đổi `resolveExerciseComponent`.

### 7. i18n và style

`lesson.json` thêm `pinyinType`: `inputLabel` ("Gõ pinyin của âm vừa nghe"), `check` ("Kiểm tra"), `answerLabel` ("Pinyin đúng"),
`parts.initial|final|tone` ("Thanh mẫu", "Vận mẫu", "Thanh điệu"), `missing` ("—"), `explanation` ("Đáp án đúng: {{pinyin}}"),
`wrongListLabel` ("Phần gõ sai"). `_pinyin-type.css`: `.pinyin-type-form`, `.pinyin-type-input` (+ `:focus-visible`, `:disabled`),
`.pinyin-type-submit`, `.pinyin-type-answer` (+ `.is-correct`/`.is-incorrect`), `.pinyin-type-syllables`, `.pinyin-type-part`
(+ `.is-wrong`), nút cao tối thiểu 44px, `prefers-reduced-motion`; token màu/spacing có sẵn.

## Risks / Trade-offs

- Tách âm tiết bằng bảng có thể bỏ sót âm tiết hiếm hoặc tách mơ hồ (`fangan`). → Test đối chiếu mọi pinyin trong
  `apps/web/src/assets/content/words.json` (số âm tiết tách ra bằng `countPinyinSyllables`; không rơi vào nhánh "không tách được");
  đúng/sai quyết định bằng so khóa nên tách mơ hồ không làm đáp án đúng bị chấm sai.
- Đổi số → dấu theo từng ký tự có thể nhảy con trỏ (mục 5). Chấp nhận; e2e chưa có (S7.1).
- Hai nguồn "thanh": `toneOfPinyin` đã có, dùng lại; không thêm `Tone` mới.
- Không có e2e vì chưa có nội dung Nhập môn dùng dạng này (proposal, câu hỏi mở 1); bài mẫu `intro-01` đã có câu `pinyin-type`
  nhưng e2e hiện tại không đi qua. → Chạy `pnpm e2e` ở task verify để chắc không vỡ luồng cũ.

## Migration Plan

Không đổi IndexedDB hay schema lưu. Rollback = revert PR. Câu `pinyin-type` đang bị bỏ qua sẽ chạy bình thường sau khi merge.
