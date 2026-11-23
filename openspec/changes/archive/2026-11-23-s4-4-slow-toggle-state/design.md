# Design: S4.4 Công tắc "Nghe chậm" báo trạng thái không chỉ bằng màu

## Context

Lý do và phạm vi: xem `proposal.md` (Why, Layer đích, Không làm). Requirement và Scenario: `specs/audio-replay/spec.md`.

Đã quan sát trong repo (không phải đề xuất). Đường dẫn tính từ `apps/web/src/app/` trừ khi ghi rõ:

- `shared/components/SlowToggle.tsx`: `<button type="button" role="switch" aria-checked={isSlow} className="audio-slow-toggle">`, con
  duy nhất là text node `t('listen.slow')` ("Nghe chậm"). State lấy từ `useAudioSpeed()` (`shared/contexts/`). Không prop.
- `SlowToggle` được ghép trong `ToneChoiceExercise`, `SoundPairExercise`, `PinyinTypeExercise` (`shared/components/exercises/`), cạnh
  `ListenButton` trong `<div className="flex items-center gap-sm">`. Đổi `SlowToggle` là đủ cho mọi dạng bài.
- `apps/web/src/styles/tailwind/components/_audio.css`: `.audio-slow-toggle` (`inline-flex min-h-11 items-center … border-line-strong
  bg-transparent text-fg transition-colors`), `:hover` → `bg-accent-soft`, `[aria-checked="true"]` → `border-accent bg-accent-soft
  text-accent`; `@media (prefers-reduced-motion: reduce)` → `transition-none`. Ngoài ra `base/_base.css` có quy tắc giảm chuyển động
  toàn cục (`transition-duration` và `animation-duration` `0.01ms !important`).
- Mẫu icon trang trí đã có: `pages/lesson/components/LessonFeedback.tsx` (`<span aria-hidden="true">✓ </span>`),
  `pages/learning-path/components/LearningPathLessonItem.tsx` (`<span aria-hidden="true" className="learning-path-lesson-icon">`). Cả
  hai dùng ký tự, không SVG.
- Test hiện có: `shared/components/SlowToggle.test.tsx` (S4.4-AC2, `AudioSpeedProvider` + `Audio` giả);
  `pages/lesson/containers/LessonRunnerContainer.audio.test.tsx` (166 dòng, bài 4 câu thật với `tone-choice` → `sound-pair` → …, có
  helper `finishToneChoice`). `LessonRunnerContainer.test.tsx` đã 1060 dòng nên không thêm vào đó.
- `apps/web/src/styles/tailwind/tokens.test.ts`: `TEXT_PAIRS` kiểm 4.5:1 ở sáng và tối, đã có `text`/`bg`, `text`/`surface`,
  `text`/`accent-soft`, `accent`/`surface`; **chưa có** `accent`/`accent-soft`. Giá trị hiện tại: sáng `#315c50`/`#e8efea` ≈ 6.47:1, tối
  `#8cc3ae`/`#1a2c25` ≈ 7.36:1 (tính tay để ước lượng rủi ro, test mới là nguồn kiểm).
- e2e: `apps/web/e2e/E8/settings-lesson.helpers.ts` có `slowToggle(page)` (`getByRole('switch', { name: 'Nghe chậm' })`);
  `E7/intro-lessons.helpers.ts` có `answerCurrentQuestion`, `installAudioRecorder`, `listenButton`; `E8/home.helpers.ts` có
  `completeOnboarding(page, 15)` (xong thì ở `/lessons/intro-01`, câu 1). `E6/writing-practice.helpers.ts` có mẫu đo tương phản trong
  trình duyệt (đi ngược lên tổ tiên đầu tiên có nền không trong suốt) và `expectVisibleFocusRing`; `E6/s6.2-writing-practice-motion.spec.ts`
  có mẫu đọc `transition-duration`/`animation-name` và `page.emulateMedia({ reducedMotion: 'reduce' })`. Chưa có thư mục `e2e/E4/`.

## Goals / Non-Goals

**Goals:** thêm tín hiệu không phụ thuộc màu (dấu tick) vào đúng một component dùng chung; giữ nguyên tên truy cập và `aria-checked`;
khoá ngưỡng tương phản bằng token test; kiểm bố cục, màu thật và chuyển động trên bản build bằng e2e.

**Non-Goals:** đổi `AudioSpeedContext`, `useAudioPlayer`, service, i18n; đổi màu token; xử lý forced colors; đổi các công tắc khác.

## Decisions

### D1. Dấu tick là `<span aria-hidden="true">✓</span>` render có điều kiện, đứng trước nhãn bọc `<span>`
`SlowToggle.tsx` (layer `shared/components/`, CLAUDE.md §1) đổi phần con của `<button>` thành:

```tsx
{isSlow && <span aria-hidden="true" className="audio-slow-toggle-icon">✓</span>}
<span className="audio-slow-toggle-label">{t('listen.slow')}</span>
```

- Hằng số ký tự đặt trong file: `const SLOW_CHECK_MARK = '✓';` (không phải chữ cần dịch, không vào i18n).
- `aria-hidden="true"` loại ký tự khỏi tên truy cập ⇒ tên vẫn đúng "Nghe chậm" (Scenario "Tên truy cập…"); `role="switch"` +
  `aria-checked` giữ nguyên ⇒ trạng thái bật/tắt không đổi. Không thêm `aria-label` (tên lấy từ nội dung như hiện nay).
- Render có điều kiện thay vì luôn render rồi ẩn bằng CSS: jsdom chạy `css: false` nên chỉ cách này kiểm được có/không dấu tick ở tầng
  component; đồng thời dấu tick xuất hiện/mất cùng một lần render ⇒ "hiện ngay, mất ngay" không phụ thuộc CSS.
- Bọc nhãn trong `.audio-slow-toggle-label` để e2e so hộp bao của dấu tick và chữ (cùng hàng) và để `whitespace-nowrap` áp đúng chữ.
- *Đã cân nhắc:* SVG nội tuyến — bỏ vì repo đang dùng ký tự `✓` cho icon trang trí (`LessonFeedback`), không cần asset hay
  `check:fonts` mới; ký tự đổi màu theo `color` nên dùng token có sẵn. Chữ "Bật" — bỏ theo `proposal.md` (Open Questions).
- Kiểm `import` (§2): `SlowToggle` vẫn chỉ import `react-i18next` và `@shared/contexts/useAudioSpeed`; không thêm import. Không nhánh ❌.
- Không có dữ liệu ngoài mới ⇒ không cần Zod.

### D2. Style trong `_audio.css` qua `@apply` (CLAUDE.md §6)
Thay đổi trong `apps/web/src/styles/tailwind/components/_audio.css`:

- `.audio-slow-toggle`: thêm `gap-xs` (khoảng cách dấu tick – chữ) vào chuỗi `@apply` hiện có; giữ `inline-flex items-center` (flex
  không xuống hàng ⇒ dấu tick và chữ cùng hàng). Không thêm class nào vào JSX ngoài hai class BEM ở D1.
- `.audio-slow-toggle-label`: `whitespace-nowrap` (chữ không tự xuống dòng ở 375px; TC-S4.4-AC3-2).
- `.audio-slow-toggle-icon`: `text-body-sm font-semibold leading-none text-accent`, và `transition-none` + `animate-none` để
  dấu tick không có hiệu ứng ở mọi thiết bị (Scenario "Không giảm chuyển động…"). Màu đặt thẳng `text-accent` thay vì kế thừa để màu
  dấu tick không chạy theo `transition-colors` của nút cha.
- Giữ nguyên rule `[aria-checked="true"]` (viền/nền/chữ màu nhấn) và khối `prefers-reduced-motion` (`transition-none` cho nút) ⇒ khi giảm
  chuyển động màu đổi ngay (Scenario "Giảm chuyển động…"). Thêm `.audio-slow-toggle-icon` vào khối đó không cần vì đã `transition-none`.
- Không thêm/đổi token màu. Cặp đo: lúc bật dấu tick và chữ là `accent` trên `accent-soft`; lúc tắt chữ là `text` trên nền màn phía
  sau (`bg` hoặc `surface`, cả hai cặp đã có trong `tokens.test.ts`).

### D3. Tầng test theo Scenario (spec-driven §4)

| Scenario (S4.4-AC3) | Tầng | File |
|---|---|---|
| Bật Nghe chậm thì hiện dấu tick trước chữ | component + e2e (cùng hàng, màu nhấn) | `SlowToggle.test.tsx`; `e2e/E4/s4.4-slow-toggle-state.spec.ts` (TC-1) |
| Tắt thì không có dấu tick | component + e2e | `SlowToggle.test.tsx`; e2e TC-3 |
| Bật rồi tắt thì dấu tick biến mất | component + e2e | `SlowToggle.test.tsx`; e2e TC-4 |
| Bật bằng bàn phím cũng hiện dấu tick | component + e2e (focus nhìn thấy) | `SlowToggle.test.tsx`; e2e TC-5 |
| Dấu tick giữ qua các câu trong bài | container + e2e | `LessonRunnerContainer.audio.test.tsx`; e2e TC-6 |
| Tên truy cập và trạng thái cho trình đọc màn hình | component + e2e | `SlowToggle.test.tsx`; e2e TC-7 |
| Phân biệt bật và tắt ở thang xám, giao diện sáng và tối | unit token + e2e | `tokens.test.ts`; `e2e/E4/s4.4-slow-toggle-visual.spec.ts` (TC-9) |
| Tương phản của dấu tick và chữ | unit token + e2e | `tokens.test.ts`; `s4.4-slow-toggle-visual.spec.ts` (đo phần tự động của TC-10) |
| Không giảm chuyển động thì dấu tick vẫn hiện ngay | e2e | `s4.4-slow-toggle-visual.spec.ts` (TC-12) |
| Giảm chuyển động thì dấu tick hiện ngay | e2e | `s4.4-slow-toggle-visual.spec.ts` (TC-11) |

Chi tiết kiểm:
- **Component** (Testing Library, `css: false`): dấu tick = `toggle.querySelector('[aria-hidden="true"]')` có text `✓` và là
  `firstElementChild` của công tắc, đứng trước phần tử chứa "Nghe chậm"; tắt ⇒ không có phần tử `aria-hidden`, `textContent` đúng
  "Nghe chậm"; tên: `toHaveAccessibleName('Nghe chậm')` (so khớp chính xác) ở cả hai trạng thái, `aria-checked` `false`/`true`. Bàn
  phím: `user.tab()` tới công tắc (`toHaveFocus`), `user.keyboard(' ')` và `'{Enter}'`.
- **Token** (`tokens.test.ts`): thêm bảng riêng `SLOW_TOGGLE_PAIRS` và một `it.each` trong `describe.each(THEMES)` (sáng + tối), tên
  test chứa `S4.4-AC3`: dấu tick `accent`/`accent-soft` ≥ 3:1; chữ lúc bật `accent`/`accent-soft` ≥ 4.5:1; chữ lúc tắt `text`/`bg` và
  `text`/`surface` ≥ 4.5:1. Không nhét vào `TEXT_PAIRS` chung để `grep S4.4-AC3` tìm được và ngưỡng 3:1 của dấu tick được nêu rõ.
- **e2e** (Playwright trên bản build, project Pixel 7; các case sáng/tối dùng `page.emulateMedia({ colorScheme })`):
  - Mở bài bằng `completeOnboarding(page, 15)` (đáp xuống câu 1 của `intro-01`, công tắc tắt). Sang câu 2 bằng `answerCurrentQuestion`
    (đã gồm bấm "Tiếp tục").
  - Đo màu/tương phản khi con trỏ không nằm trên công tắc: sau khi bấm thì `page.mouse.move(0, 0)` (hoặc bật bằng bàn phím rồi bấm ra
    ngoài), đọc lại trong `expect(...).toPass()` vì nút có `transition-colors` (mẫu `expectVisibleFocusRing`).
  - Màu nhấn (TC-1): `getComputedStyle` của công tắc — `borderTopColor`, `backgroundColor`, `color` — bằng giá trị đã resolve của
    `--csk-accent`, `--csk-accent-soft`, `--csk-accent` trên `:root`, và khác các giá trị lúc tắt.
  - Cùng hàng (TC-1): hộp bao `.audio-slow-toggle-icon` nằm bên trái `.audio-slow-toggle-label` và khoảng dọc của hai hộp chồng nhau
    (tâm dọc của dấu tick nằm trong hộp chữ).
  - Tương phản (TC-9/TC-10): tính trong trình duyệt theo mẫu `readFocusRing` — màu dấu tick/chữ so với nền của tổ tiên gần nhất có
    `backgroundColor` alpha > 0 (lúc bật là chính công tắc, lúc tắt là nền màn phía sau). Dấu tick ≥ 3, chữ ≥ 4.5, sáng và tối.
  - Chuyển động (TC-11/TC-12): dấu tick hiển thị ngay sau click (không chờ), `animation-name` = `none`, `transition-duration` tối đa
    ≤ `0.00001s`, `opacity` = `1`, `transform` = `none`. TC-11 thêm `page.emulateMedia({ reducedMotion: 'reduce' })` và kiểm
    `transition-duration` của công tắc ≤ `0.00001s` (ngưỡng như `MAX_STATIC_TRANSITION_SECONDS` của S6.2).
  - Helper chung: `apps/web/e2e/E4/slow-toggle.helpers.ts` (`slowToggleIcon`, `slowToggleLabel`, `readSlowToggleColors`,
    `readContrastOnBackground`, `readMotionStyle`). Tái dùng `slowToggle` của `E8/settings-lesson.helpers.ts`; không chép lại.
  - Không tự động: TC-2 (Mobile 375, mắt), TC-8 (trình đọc màn hình thật), TC-10 phần ghi tỷ lệ trong nghiệm thu — QA chạy tay.

### D4. Thứ tự TDD
Hành vi hiện có (màu nhấn, `aria-checked`, giữ trạng thái qua câu, `transition-none` khi giảm chuyển động) đã đúng, phần thiếu chỉ là
dấu tick. Vì vậy GREEN đầu tiên (Scenario "Bật…") làm gần hết thay đổi; RED của các Scenario sau sẽ pass ngay. Theo quy ước đã dùng ở
các change trước: RED nào pass ngay thì **tạm đảo đúng nhánh liên quan** (vd luôn render dấu tick, bỏ `aria-hidden`, đổi `text-accent`
sang token kém tương phản, thêm `transition-opacity` cho dấu tick) để thấy test fail vì đúng hành vi đó, rồi trả lại; ghi lý do trong
commit `test(...)`. GREEN tương ứng khi đó là "không đổi code production, test pass" và vẫn được tick.

## Risks / Trade-offs

- [Font UI không có glyph `✓`, trình duyệt lấy font dự phòng nên nét hơi khác] → chấp nhận như `LessonFeedback`; kích thước cố định
  `text-body-sm leading-none` nên không đổi chiều cao nút (min-h-11 giữ nguyên).
- [Công tắc rộng thêm ~1em khi bật, đẩy hàng `ListenButton` + `SlowToggle` ở 375px] → `whitespace-nowrap` + `gap-xs`; e2e chạy ở Pixel 7
  (412px) và QA chạy TC-2 ở 375×812. Nếu tràn thì là lỗi layout, sửa trong CSS, không đổi spec.
- [Đo màu e2e lệch do hover hoặc đang chuyển màu] → dời con trỏ ra ngoài và đọc lại trong `toPass()`.
- [Token test pass ngay vì màu đã đạt] → tạm đổi token để thấy fail (D4); test giữ vai trò khoá hồi quy.

## Migration Plan

Không đổi dữ liệu, schema hay token. Rollback = revert PR.
