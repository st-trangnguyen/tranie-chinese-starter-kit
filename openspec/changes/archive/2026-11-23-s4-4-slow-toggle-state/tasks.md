# Tasks: S4.4 Công tắc "Nghe chậm" báo trạng thái không chỉ bằng màu

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi import/gõ
sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md D1–D2), test pass, commit `feat(...)`. Tên test chứa
Scenario ID và tên Scenario (vd `S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ: …`); test e2e thêm ID TC (`TC-S4.4-AC3-1: …`).
Hành vi cũ (màu nhấn, `aria-checked`, giữ qua câu, `transition-none` khi giảm chuyển động) đã có, nên RED nào pass ngay nhờ GREEN trước
thì **tạm đảo đúng nhánh liên quan** để thấy fail rồi trả lại, ghi cách đảo trong commit `test(...)`; GREEN khi đó là "không đổi code
production, test pass" (design D4). Đường dẫn tính từ `apps/web/src/app/` trừ khi ghi rõ.

Lệnh: Vitest `pnpm --filter @csk/web test:run <mẫu>`; e2e `pnpm --filter @csk/web e2e e2e/E4/<file>` (tự build +
`vite preview` :4173).

## 1. Dấu tick trong công tắc — `shared/components/SlowToggle.tsx`, `_audio.css`

Test component: `shared/components/SlowToggle.test.tsx` (Vitest + Testing Library, `AudioSpeedProvider` + `Audio` giả có sẵn).
e2e: `apps/web/e2e/E4/s4.4-slow-toggle-state.spec.ts` + helper `apps/web/e2e/E4/slow-toggle.helpers.ts` (tạo ở 1.1, tái dùng
`slowToggle` của `E8/settings-lesson.helpers.ts`, `completeOnboarding` của `E8/home.helpers.ts`).

- [x] 1.1 RED: S4.4-AC3 "Bật Nghe chậm thì hiện dấu tick trước chữ" — component: bấm công tắc ⇒ có `span[aria-hidden="true"]` text `✓` là `firstElementChild`, đứng trước phần tử chứa "Nghe chậm"; e2e TC-S4.4-AC3-1: bấm ở câu 1 `intro-01`, dời con trỏ ra ngoài ⇒ `.audio-slow-toggle-icon` hiển thị, bên trái `.audio-slow-toggle-label`, cùng hàng (khoảng dọc chồng nhau), viền/nền/chữ của công tắc bằng `--csk-accent`/`--csk-accent-soft`/`--csk-accent` và khác lúc tắt (đọc trong `toPass()`); kiểm: cả hai fail vì chưa có dấu tick
- [x] 1.2 GREEN: `SlowToggle.tsx` thêm `SLOW_CHECK_MARK`, `{isSlow && <span aria-hidden="true" className="audio-slow-toggle-icon">…}` và bọc nhãn `<span className="audio-slow-toggle-label">`; `_audio.css` thêm `gap-xs` vào `.audio-slow-toggle`, `.audio-slow-toggle-label` (`whitespace-nowrap`), `.audio-slow-toggle-icon` (`text-body-sm font-semibold leading-none text-accent transition-none animate-none`), mọi visual qua `@apply` (CLAUDE.md §6); kiểm: test 1.1 pass, test S4.4-AC2 cũ trong `SlowToggle.test.tsx` vẫn pass
- [x] 1.3 RED: S4.4-AC3 "Tắt thì không có dấu tick" — component: render mặc định ⇒ công tắc tắt, không có phần tử `aria-hidden`, `textContent` đúng "Nghe chậm"; e2e TC-S4.4-AC3-3: vào câu 1 ⇒ `aria-checked="false"`, `.audio-slow-toggle-icon` count 0; kiểm: pass ngay nhờ 1.2 ⇒ tạm render dấu tick vô điều kiện, thấy fail, trả lại
- [x] 1.4 GREEN: S4.4-AC3 "Tắt thì không có dấu tick" — render có điều kiện của 1.2 đã đủ (không đổi code nếu 1.3 pass sau khi trả lại); kiểm: test 1.3 pass
- [x] 1.5 RED: S4.4-AC3 "Bật rồi tắt thì dấu tick biến mất" — component: bấm hai lần ⇒ `aria-checked="false"`, không còn dấu tick; e2e TC-S4.4-AC3-4; kiểm: pass ngay nhờ 1.2 ⇒ tạm giữ dấu tick sau lần bật đầu (vd state cục bộ không reset), thấy fail, trả lại
- [x] 1.6 GREEN: S4.4-AC3 "Bật rồi tắt thì dấu tick biến mất" — dấu tick theo `isSlow` của context, không state riêng (không đổi code nếu đã đúng); kiểm: test 1.5 pass
- [x] 1.7 RED: S4.4-AC3 "Bật bằng bàn phím cũng hiện dấu tick" — component: `user.tab()` tới công tắc (`toHaveFocus`), `user.keyboard(' ')` ⇒ bật + có dấu tick, `' '` lần nữa ⇒ tắt + không dấu tick, `'{Enter}'` ⇒ bật + có dấu tick; e2e TC-S4.4-AC3-5: chỉ dùng Tab/Space/Enter, focus nhìn thấy (`expectVisibleFocusRing` của `E6/writing-practice.helpers.ts`); kiểm: pass ngay nhờ 1.2 ⇒ tạm đổi phần tử bọc thành `<div role="switch">` không nhận focus/phím, thấy fail, trả lại
- [x] 1.8 GREEN: S4.4-AC3 "Bật bằng bàn phím cũng hiện dấu tick" — giữ `<button type="button">` gốc (không đổi code nếu đã đúng); kiểm: test 1.7 pass
- [x] 1.9 RED: S4.4-AC3 "Tên truy cập và trạng thái cho trình đọc màn hình" — component: lúc tắt rồi lúc bật, `toHaveAccessibleName('Nghe chậm')` (khớp chính xác, không có "✓") và `aria-checked` `false` rồi `true`; e2e TC-S4.4-AC3-7: `toHaveAccessibleName('Nghe chậm')` + `aria-checked` cả hai lúc; kiểm: pass ngay nhờ 1.2 ⇒ tạm bỏ `aria-hidden` khỏi dấu tick, thấy fail ở tên lúc bật, trả lại
- [x] 1.10 GREEN: S4.4-AC3 "Tên truy cập và trạng thái cho trình đọc màn hình" — `aria-hidden="true"` trên dấu tick, không thêm `aria-label` (không đổi code nếu đã đúng); kiểm: test 1.9 pass

## 2. Giữ qua các câu — `pages/lesson/containers`

Test: `pages/lesson/containers/LessonRunnerContainer.audio.test.tsx` (bài 4 câu thật, helper `finishToneChoice`; không thêm vào
`LessonRunnerContainer.test.tsx` đã 1060 dòng). e2e: `apps/web/e2e/E4/s4.4-slow-toggle-state.spec.ts`.

- [x] 2.1 RED: S4.4-AC3 "Dấu tick giữ qua các câu trong bài" — container: bật ở câu 1 (chọn thanh), `finishToneChoice` sang câu 2 (cặp âm) ⇒ công tắc `aria-checked="true"` và có dấu tick `✓`; e2e TC-S4.4-AC3-6: bật ở câu 1, `answerCurrentQuestion` sang câu 2 ⇒ còn dấu tick; kiểm: pass ngay nhờ 1.2 ⇒ tạm render dấu tick theo state cục bộ khởi tạo `false` (mất khi remount), thấy fail, trả lại
- [x] 2.2 GREEN: S4.4-AC3 "Dấu tick giữ qua các câu trong bài" — dấu tick đọc `isSlow` từ `AudioSpeedProvider` (không đổi code nếu đã đúng); kiểm: test 2.1 pass, test S4.4-AC2 và S7.1-AC1 cũ vẫn pass

## 3. Thang xám, tương phản, chuyển động — token + e2e

Token: `apps/web/src/styles/tailwind/tokens.test.ts` (Vitest). e2e: `apps/web/e2e/E4/s4.4-slow-toggle-visual.spec.ts` (helper
`readContrastOnBackground`, `readMotionStyle` trong `slow-toggle.helpers.ts`, theo mẫu `E6/writing-practice.helpers.ts` và
`E6/s6.2-writing-practice-motion.spec.ts`).

- [x] 3.1 RED: S4.4-AC3 "Phân biệt bật và tắt ở thang xám, giao diện sáng và tối" — token: `SLOW_TOGGLE_PAIRS` dấu tick `accent`/`accent-soft` ≥ 3:1 trong `describe.each(THEMES)`; e2e TC-S4.4-AC3-9 với `emulateMedia({ colorScheme })` `light` rồi `dark`: tắt ⇒ không dấu tick; bật + dời con trỏ ⇒ dấu tick trước chữ, tương phản dấu tick với nền tổ tiên gần nhất có nền (chính công tắc) ≥ 3; kiểm: token pass ngay ⇒ tạm đổi `--csk-accent-soft` tối thành màu gần `--csk-accent`, thấy fail, trả lại; e2e pass ngay nhờ 1.2 ⇒ tạm đổi `.audio-slow-toggle-icon` sang `text-accent-soft`, thấy fail, trả lại
- [x] 3.2 GREEN: S4.4-AC3 "Phân biệt bật và tắt ở thang xám, giao diện sáng và tối" — `.audio-slow-toggle-icon` dùng `text-accent` (không đổi token); kiểm: test 3.1 pass
- [x] 3.3 RED: S4.4-AC3 "Tương phản của dấu tick và chữ" — token: `SLOW_TOGGLE_PAIRS` chữ lúc bật `accent`/`accent-soft` ≥ 4.5:1, chữ lúc tắt `text`/`bg` và `text`/`surface` ≥ 4.5:1, sáng và tối; e2e (phần tự động của TC-S4.4-AC3-10), sáng và tối, con trỏ ngoài công tắc: chữ "Nghe chậm" ≥ 4.5 lúc tắt (nền màn phía sau) và lúc bật (nền công tắc), dấu tick ≥ 3 lúc bật; kiểm: pass ngay ⇒ tạm đổi `--csk-accent` sáng thành màu nhạt (vd `#9fb8b0`), thấy fail cả token và e2e, trả lại
- [x] 3.4 GREEN: S4.4-AC3 "Tương phản của dấu tick và chữ" — giữ token hiện có, xác nhận chữ lúc tắt là `text-fg` trên nền màn thật (không đổi code nếu đã đúng); kiểm: test 3.3 pass
- [x] 3.5 RED: S4.4-AC3 "Không giảm chuyển động thì dấu tick vẫn hiện ngay" — e2e TC-S4.4-AC3-12 (không emulate giảm chuyển động): bật ⇒ dấu tick hiển thị ngay, `animation-name` `none`, `transition-duration` tối đa ≤ `0.00001s`, `opacity` `1`, `transform` `none`; tắt ⇒ dấu tick count 0 ngay; kiểm: pass ngay nhờ 1.2 ⇒ tạm thêm `transition-opacity duration-300` cho `.audio-slow-toggle-icon`, thấy fail, trả lại
- [x] 3.6 GREEN: S4.4-AC3 "Không giảm chuyển động thì dấu tick vẫn hiện ngay" — `.audio-slow-toggle-icon` có `transition-none animate-none`, render có điều kiện (không đổi code nếu đã đúng); kiểm: test 3.5 pass
- [x] 3.7 RED: S4.4-AC3 "Giảm chuyển động thì dấu tick hiện ngay" — e2e TC-S4.4-AC3-11 với `emulateMedia({ reducedMotion: 'reduce' })` trước khi mở bài: bật ⇒ dấu tick hiển thị ngay, kiểu chuyển động như 3.5, và `transition-duration` của công tắc ≤ `0.00001s` (màu đổi ngay); tắt ⇒ dấu tick mất ngay; kiểm: pass ngay ⇒ tạm thêm `animation` (vd `animate-pulse`) cho dấu tick trong khối `prefers-reduced-motion`, thấy fail, trả lại
- [x] 3.8 GREEN: S4.4-AC3 "Giảm chuyển động thì dấu tick hiện ngay" — giữ khối `prefers-reduced-motion` hiện có của `_audio.css` (không đổi code nếu đã đúng); kiểm: test 3.7 pass

## 4. Kiểm tra và hoàn tất

- [x] 4.1 REFACTOR khi đã xanh; self-review CLAUDE.md §0, §2 (`SlowToggle` không thêm import), §6 (JSX chỉ có class BEM, visual qua `@apply`), §7 (a11y: `role="switch"`, focus nhìn thấy, `prefers-reduced-motion`; file < 300 dòng, kể cả hai file e2e); kiểm: `git diff` không có utility visual trong JSX
- [x] 4.2 Verify: `pnpm typecheck && pnpm lint && pnpm test:run` pass
- [x] 4.3 Verify build: `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` pass (đụng CSS, thêm ký tự `✓`)
- [x] 4.4 Verify e2e: `pnpm e2e` pass (gồm `e2e/E4/` mới và `e2e/E8/s8.2-settings-lesson*.spec.ts` dùng chung công tắc)
- [x] 4.5 Screenshot PR: preview `web-build-preview`, bài `intro-01` câu 1, công tắc bật (con trỏ ngoài công tắc), khổ mobile 375×812 và desktop 1280×800, mỗi khổ sáng và tối, kèm trước/sau (trước = `main`); commit vào nhánh `pr-assets` ở `pr-<số PR>/slow-toggle-<mobile|desktop>-<light|dark>.png` (bản trước thêm hậu tố `-before`), nhúng bảng Mobile/Desktop × Sáng/Tối trong PR; kiểm: 8 ảnh hiện trong mô tả PR, ở 375px dấu tick và chữ cùng hàng, không cuộn ngang
- [x] 4.6 Tick mọi task; PR ghi `Spec PR: #140` và `Closes #139`; kiểm: `openspec validate --all --strict` pass

## Workflow follow-up

- QA nghiệm thu `test-cases.md` trên bản build, gồm các case chạy tay TC-S4.4-AC3-2, TC-S4.4-AC3-8, TC-S4.4-AC3-10 (check `QA sign-off`).
- Archive tự động sau khi PR code merge (`archive-spec-workflow.yml`), không archive trong PR code.
