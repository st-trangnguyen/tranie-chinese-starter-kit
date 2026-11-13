# Design: S5.2 Tự đánh giá

Xem [proposal.md](./proposal.md) (lý do, phạm vi) và [specs/speak-rating/spec.md](./specs/speak-rating/spec.md) (hành vi).
Kiến trúc: [CLAUDE.md](../../../CLAUDE.md) §1–§3, [docs/03-architecture.md](../../../docs/03-architecture.md) §6.3.

## Context

Quan sát được trong code hiện tại:

- Schema nội dung đã có `kind: 'speak'` với `wordId` **hoặc** `sentenceId` (đúng một, `content.schema.ts`).
- `ContentService.getExerciseContents` + `collectContentIds` đã nạp từ/câu cho mọi câu, kể cả `speak` (đọc `wordId` và `sentenceId`).
  `useLessonRunner` đã trả `contents`, `LessonRunner` đã truyền `content` vào dạng bài. **Không cần sửa hook hay `ContentService`**
  (proposal "Impact" nói có sửa hook: thực tế không cần).
- `exerciseRegistry` (`exercise.registry.ts`) chưa có `speak`, nên câu "nói" đang rơi vào nhánh "bỏ qua" của `LessonRunner`.
- Hợp đồng dạng bài: `ExerciseProps<K>` = `exercise`, `content`, `onResult({ isCorrect, explanation? })`, `isLocked`. Khung chạy bài tự hiện
  `LessonFeedback` (kết quả bằng chữ, giải thích khi sai, nút "Tiếp tục") khi nhận `onResult`; điểm/tổng kết/ngưỡng 80% của bài kiểm tra
  đã dựa trên `isCorrect` (`LessonService.summarize`, `isTestPassed`). Vì vậy mọi Scenario AC2 về tổng kết chỉ cần dạng bài báo đúng
  `isCorrect`.
- Mẫu bám theo: `SoundPairExercise` (chọn một lần, khóa bằng state cục bộ + `isLocked`, giải thích soạn bằng `t(...)` từ từ/câu),
  `pair-order.utils.ts` và `lesson-session.utils.ts` (quy tắc thuần nằm ở `shared/utils/`, dạng bài import được).
- `Word.vi` là `string[]`, `Sentence.vi` là `string`; `Word.hanzi/pinyin`, `Sentence.hanzi/pinyin` cùng tên.
- **S5.1 chưa được code** (chỉ có proposal/spec). Khối "ghi âm và so sánh" và `core/hooks/useRecorder` là đề xuất của S5.1, chưa tồn tại.

## Goals / Non-Goals

- Goal: dạng bài `speak` đăng ký vào registry; chọn 1 trong 3 mức thì chấm ngay, khóa, báo đúng/sai theo bảng trong spec.
- Goal: dùng lại nguyên khối ghi âm của S5.1 (không tự viết ghi âm trong S5.2).
- Non-Goal: lưu mức đánh giá, đổi `ExerciseResult`, đổi schema nội dung, đổi IndexedDB, thêm dependency.

## Decisions

### D1. Layer đích

| Phần | Layer | File |
|---|---|---|
| Dạng bài "nói" | `shared/components/exercises/` | `SpeakExercise.tsx` (mới), đăng ký ở `exercise.registry.ts` (sửa) |
| Quy tắc mức → đúng/sai | `shared/utils/` | `speak-rating.utils.ts` (mới) |
| i18n | `assets/i18n/vi/` | `lesson.json` (sửa: khóa `speak.*`) |
| Style BEM | `apps/web/src/styles/tailwind/` | `components/_speak-rating.css` (mới) + `@import` trong `main.css` |

Không đụng `pages/lesson/hooks`, `shared/services`, `core/*`, `packages/shared`.

### D2. Quy tắc nằm ở `shared/utils`, không ở `shared/services` Phần 2 (lệch với proposal)

Proposal đặt quy tắc ở `shared/services` Phần 2. Nhưng dạng bài trong `shared/components/exercises/` **không được import service**
(CLAUDE.md §2, nhánh ❌ `exercises → service`, có lint `no-restricted-imports`), mà "mức nào đúng" phải được gọi ngay trong dạng bài để
tạo `ExerciseResult`. Phương án đã cân:

- (a) Quy tắc trong `LessonService` Phần 2, dạng bài báo mức lên qua `onResult`, service đổi sang đúng/sai: phải mở rộng `ExerciseResult`
  và `submitResult`, đụng hợp đồng mọi dạng bài. Loại.
- (b) **Chọn**: hàm thuần `isRatingCorrect(rating)` trong `shared/utils/speak-rating.utils.ts`, theo tiền lệ `lesson-session.utils.ts`
  (quy tắc chấm điểm thuần đặt ở utils) và `pair-order.utils.ts` (dạng bài đã import utils). Có comment "Rule: …", test là hàm thuần.
  Đây là chỉnh layer của proposal, không đổi hành vi spec.

```ts
export const SPEAK_RATINGS = ['not-yet', 'close', 'correct'] as const;
export type SpeakRating = (typeof SPEAK_RATINGS)[number];
// Rule: chỉ "correct" tính câu đúng; "close" và "not-yet" tính câu sai.
export const isRatingCorrect = (rating: SpeakRating): boolean => rating === 'correct';
```

### D3. `SpeakExercise` (chỉ nhận props)

- Đích nói: `content.words[0]` hoặc `content.sentences[0]` (đúng một có mặt); thiếu cả hai thì `return null` (như các dạng bài khác).
  Chuẩn hóa thành `{ hanzi, pinyin, vi: string, audio }` (`vi` của từ = `word.vi.join(', ')`).
- Hiện chữ Hán, pinyin, nghĩa; dưới đó là khối ghi âm của S5.1 (nhận `audio` mẫu); dưới nữa là
  `role="group"` với `aria-label` chứa 3 nút theo thứ tự "Chưa đúng", "Gần đúng", "Đúng".
- State cục bộ `selectedRating: SpeakRating | null`. `handleSelect(rating)`: nếu đã chọn hoặc `isLocked` thì thoát; set state;
  `onResult(isRatingCorrect(rating) ? { isCorrect: true } : { isCorrect: false, explanation: t('speak.explanation', {...}) })`.
  Không `onResult` khi chưa chọn, nên chưa có kết quả và chưa có "Tiếp tục" (do `LessonFeedback` của khung).
- Giải thích câu sai = chữ, pinyin, nghĩa của đích, một chuỗi i18n `speak.explanation` với `{{hanzi}} {{pinyin}} {{vi}}`.
- Khóa: sau khi chọn, cả 3 nút `disabled`; nút đã chọn có `aria-pressed="true"`, **và** hiện thêm chữ "Đã chọn" nhìn thấy
  (nhãn nút "Gần đúng" giữ nguyên để truy vấn theo tên; chữ "Đã chọn" nằm trong `<span>` riêng, có `.is-selected` cho màu). Không chỉ màu.
- Bàn phím: dùng `<button type="button">` gốc, Tab + Enter/Space chạy mặc định; focus nhìn thấy trong CSS.
- Không cần ràng buộc ghi âm: khối S5.1 độc lập, `SpeakExercise` không đọc trạng thái ghi âm.

### D4. Khối ghi âm của S5.1

`SpeakExercise` import component dùng chung của S5.1 trong `shared/components/` (tên và props do S5.1 chốt; xem Câu hỏi mở 1).
Component này tự dùng `core/hooks/useRecorder` và `useAudioPlayer`, nên `exercises/ → core/hooks` đúng nhánh ✅ §2 (không đụng service).
Trong test S5.2, mock biên ngoài (micro/audio) như S5.1, không mock chính `SpeakExercise`.

### D5. Registry và import

`exerciseRegistry['speak'] = SpeakExercise`. Kiểm tra import mới: `SpeakExercise` → `react`, `react-i18next`, `./exercise.types`,
`../../utils/speak-rating.utils`, khối S5.1 (`shared/components`). Không import service, Dexie, router. `speak-rating.utils` là leaf, không import gì.

### D6. Dữ liệu ngoài và Zod

Không có dữ liệu ngoài mới. `exercise` và nội dung đã được Zod validate khi nạp (`lessonSchema`). Không thêm schema.

### D7. i18n và style

- `lesson.json`: `speak.groupLabel` ("Tự đánh giá phát âm"), `speak.rating.notYet` / `close` / `correct`, `speak.selected` ("Đã chọn"),
  `speak.explanation`. Tiếng Việt, theo chuẩn khóa hiện có (`soundPair.*`).
- `_speak-rating.css`: `.speak-rating-option` (min-h-11, border, bg, `@apply`), `.is-selected`, `:focus-visible`, `:disabled`,
  `prefers-reduced-motion`, theo mẫu `_sound-pair.css`. Trong JSX chỉ dùng layout/spacing (CLAUDE.md §6).

### D8. Tầng test (spec-driven §4)

| Scenario | Tầng | File |
|---|---|---|
| AC1 (nội dung, 3 nút, chọn mà chưa ghi âm, khóa, báo bằng chữ, bàn phím) | Component, Vitest + Testing Library | `SpeakExercise.test.tsx` |
| AC1 chưa chọn thì chưa chấm / chọn thì chấm ngay có "Tiếp tục" | Component qua khung chạy bài với registry thật | `LessonRunner.test.tsx` |
| AC2 mỗi mức → đúng/sai | Hàm thuần | `speak-rating.utils.test.ts` + `SpeakExercise.test.tsx` (giải thích) |
| AC2 tổng kết (100%, 0%, 75%) | Container với registry thật | `LessonRunnerContainer.test.tsx` |
| AC2 bài kiểm tra 80% | `shared/services` Phần 2/3 | `lesson.service.test.ts` |

Không có e2e (nội dung dùng "nói" chưa soạn, S7.1).

## Risks / Trade-offs

- [S5.1 chưa code nên tên/props khối ghi âm chưa biết] → S5.2 chỉ bắt đầu code sau khi S5.1 merge; task 1.1 đọc API thật của S5.1.
- [Quy tắc ở utils thay vì services lệch proposal] → ghi rõ ở D2; hành vi spec không đổi.
- ["Gần đúng" tính sai] → đã chốt trong spec; nếu BA đổi thành nửa điểm sẽ phải đổi mô hình điểm (ngoài phạm vi).
- [Hiển thị "Đã chọn" làm thay đổi tên truy cập của nút] → để `aria-pressed` mang trạng thái, chữ "Đã chọn" nằm ngoài tên nút (`aria-hidden` không dùng, đặt ngoài `<button>`).

## Open Questions

1. Tên file và props chính xác của khối ghi âm S5.1 (chốt khi S5.1 merge; không đổi cách làm).
