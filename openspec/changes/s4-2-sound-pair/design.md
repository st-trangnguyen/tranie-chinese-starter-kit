# Design: S4.2 Phân biệt cặp âm gần nhau

Spec: [proposal.md](./proposal.md), [specs/sound-pair/spec.md](./specs/sound-pair/spec.md). Không đổi spec.

## Context

Đã quan sát trong repo (sau khi S4.1 và S4.4 đã merge):

- `exerciseRegistry` (`shared/components/exercises/exercise.registry.ts`) hiện có `'tone-choice'`. `LessonRunner` tra `kind` qua
  `resolveExerciseComponent`; chưa đăng ký thì hiện "Dạng bài này chưa có" + nút Bỏ qua. Đăng ký là đủ để câu không bị bỏ qua.
- `ExerciseProps<K>`: `exercise`, `content` (`words` theo thứ tự ID của câu), `onResult`, `isLocked`. `ExerciseResult = { isCorrect, explanation? }`.
- Câu `sound-pair` trong `content.schema.ts`: `wordIds: [id, id]`, `answerWordId`; schema đã chặn đáp án ngoài cặp.
  `content.words` của câu này là hai từ theo thứ tự `wordIds`.
- `ListenButton` (`audioPath`, `label?`) và `SlowToggle` có sẵn trong `shared/components/`; `ListenButton` không bị khóa bởi `isLocked`.
  `AudioSpeedProvider` bọc sẵn trong `LessonRunnerContainer`.
- `ToneChoiceExercise.tsx` là mẫu: state cục bộ `selected`, `handleSelect` bỏ qua khi `isLocked` hoặc đã chọn, `explanation` chỉ khi sai,
  khối đáp án chỉ render sau khi chọn, CSS riêng `_tone-choice.css`.
- Chưa có hàm xáo/ngẫu nhiên nào trong `apps/web` (grep `Math.random` và `shuffle` không thấy).

Đề xuất thêm: mọi thứ dưới đây.

## Goals / Non-Goals

- Goals: dạng bài `sound-pair` chạy trong khung bài; xáo thứ tự hai lựa chọn test được; không lộ đáp án trước khi chấm.
- Non-Goals: chọn cặp/nội dung (S7.1), tạo thẻ ôn từ câu sai (S9.4), ghi âm (E5), validator danh sách cặp, đổi `LessonRunner`,
  `ExerciseProps` hay schema.

## Decisions

### 1. Layer đích và file (CLAUDE.md §1)

| Việc | Layer | File |
|---|---|---|
| Xáo hai lựa chọn (thuần, nhận nguồn ngẫu nhiên) | `shared/utils/` | tạo `pair-order.utils.ts` (+ `pair-order.utils.test.ts`) |
| Dạng bài | `shared/components/exercises/` | tạo `SoundPairExercise.tsx` (+ `.test.tsx`); sửa `exercise.registry.ts` |
| Chuỗi i18n | `assets/i18n/vi/` | sửa `lesson.json` (nhóm `soundPair`) |
| Style BEM | `apps/web/src/styles/tailwind/components/` | tạo `_sound-pair.css`; thêm `@import` vào `main.css` |
| Test khung chạy bài | `pages/lesson/components/` | sửa `LessonRunner.test.tsx` |

Không có service, hook, `core/*`, IndexedDB hay schema mới. Dữ liệu ngoài cần Zod: không thêm (từ đã qua `wordSchema`, câu đã qua `lessonSchema`).

### 2. Hàm thuần `shared/utils/pair-order.utils.ts`

- `orderPair<T>(pair: readonly [T, T], random: () => number = Math.random): readonly [T, T]`.
  Rule: `random() < 0.5` giữ nguyên thứ tự, ngược lại đảo; không mutate đầu vào (trả tuple mới).
- `shared/utils` là leaf, không import service. Nhận `random` qua tham số để test deterministic (spec-driven §5).

### 3. Component `SoundPairExercise`

`ExerciseProps<'sound-pair'>`, chỉ nhận props (CLAUDE.md §2: exercises không gọi service).

- Từ của câu: `content.words` (hai từ), đáp án = từ có `id === exercise.answerWordId`. Thiếu đủ hai từ hoặc không thấy đáp án
  thì render `null` an toàn (không throw). Các hook gọi trước early return.
- Thứ tự: `const [ordered] = useState(() => orderPair([words[0], words[1]]))` chỉ khi đủ hai từ; xáo **một lần** khi mount, giữ qua re-render
  (đổi `isLocked`, chọn xong không làm nút nhảy). `LessonRunner` remount dạng bài theo `key={exercise.id}` nên mỗi lần câu hiện
  là một lần xáo. Không `useEffect` để đồng bộ.
- Trước khi chấm: `ListenButton audioPath={answerWord.audio}` (nhãn mặc định "Nghe") + `SlowToggle`, rồi hai nút lựa chọn ghi `word.pinyin`
  trong `role="group"` có nhãn. Hai nút lựa chọn **không** có nút nghe riêng, `aria-label`/`title` chỉ là pinyin (không thêm gợi ý).
- State UI: `selectedWordId: string | null`. `handleSelect(word)`: bỏ qua nếu `isLocked` hoặc đã chọn; set; đúng khi `word.id === answerWord.id` →
  `onResult({ isCorrect: true })`; sai → `onResult({ isCorrect: false, explanation: t('soundPair.explanation', { pinyin: answerWord.pinyin }) })`
  = "Đáp án đúng: sì". Hai nút `disabled` sau khi chọn; nút chọn gắn `.is-correct`/`.is-incorrect` và không chỉ dựa vào màu (có khối chữ).
- Sau khi chọn (`selectedWordId !== null`): hiện khối so sánh gồm hai `ListenButton` theo thứ tự đã xáo, `audioPath={word.audio}`,
  `label={t('soundPair.listenWord', { pinyin: word.pinyin })}` → "Nghe sì", "Nghe shì". Nút nghe nằm ngoài `isLocked`, bấm bao nhiêu lần cũng được
  (hành vi có sẵn của `ListenButton`). Nút nghe câu hỏi vẫn còn.
- Trong test, cả ba nút nghe có tên khác nhau ("Nghe", "Nghe sì", "Nghe shì") nên truy vấn theo tên chính xác không nhập nhằng với nút lựa chọn "sì"/"shì".

Import kiểm tra: `react`, `react-i18next`, `@shared/utils/pair-order.utils`, `../ListenButton`, `../SlowToggle`, kiểu từ `@csk/shared`.
Không `shared/services`, `core/services`; `ListenButton` tự dùng `core/hooks` (cho phép). Không nhánh ❌ nào.

### 4. Đăng ký registry

Thêm `'sound-pair': SoundPairExercise` vào `exerciseRegistry`. Không đổi `resolveExerciseComponent`.

### 5. i18n và style

`lesson.json` thêm `soundPair`: `groupLabel` ("Chọn âm vừa nghe"), `listenWord` ("Nghe {{pinyin}}"), `answerLabel` ("Âm đúng"),
`explanation` ("Đáp án đúng: {{pinyin}}"). `_sound-pair.css`: `.sound-pair-option` (+ `.is-correct`, `.is-incorrect`, `:disabled`,
`:focus-visible`), `.sound-pair-compare`; token có sẵn, cao tối thiểu 44px, `prefers-reduced-motion`. JSX chỉ dùng layout/spacing (CLAUDE.md §6);
theo mẫu `_tone-choice.css`.

## Risks / Trade-offs

- Test "thứ tự không cố định" phụ thuộc ngẫu nhiên. → Ở util test với `random` giả cho cả hai nhánh; ở component test `vi.spyOn(Math, 'random')`
  trả `0` rồi `0.9`, mount lại, kiểm vị trí đáp án đổi. Không dùng ngẫu nhiên thật trong test.
- Bài mẫu hiện dùng cặp 四/十 (nghe thanh là đoán được): thuộc S7.1, không sửa nội dung ở đây.
- Chưa có e2e vì nội dung Nhập môn dùng dạng này chưa soạn (proposal, câu hỏi mở 1). → Chạy `pnpm e2e` ở task verify để chắc không vỡ luồng cũ.

## Migration Plan

Không đổi IndexedDB hay schema lưu. Rollback = revert PR. Câu `sound-pair` đang bị bỏ qua sẽ chạy bình thường sau khi merge.
