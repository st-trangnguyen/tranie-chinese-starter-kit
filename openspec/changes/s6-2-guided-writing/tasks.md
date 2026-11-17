# Tasks: S6.2 Viết theo nét có gợi ý

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý …`). Tên file, hàm, route: design D1–D9.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại (như S6.1).

Vitest: `pnpm --filter @csk/web test:run <mẫu>`. Giả hanzi-writer bằng `src/test/mocks/hanzi-writer.ts` (mở rộng ở 2.1),
dữ liệu nét `src/test/stroke.fixtures.ts` (thêm `STROKE_DATA_SHI` ở 1.1), màn qua `src/test/stroke-order-route.tsx`.

## 1. Quy tắc luyện viết — `shared/services/writing-practice.service.ts` (design D2, D3)

Test chung `apps/web/src/app/shared/services/writing-practice.service.test.ts` — Vitest thuần, không mock thư viện; chuỗi
sự kiện `correct | mistake | ignored` đưa qua `recordStrokeAttempt` bắt đầu từ `startPractice(2)` (十) hoặc `startPractice(7)` (你).

- [x] 1.1 RED: S6.2-AC3 "Sai dưới 3 lần thì chưa gợi ý" — 2 lần `mistake`: `mistakeCount` 2, `isHintVisible` false; thêm `STROKE_DATA_SHI` vào `src/test/stroke.fixtures.ts`. Để test fail ở assertion chứ không ở import, tạo skeleton không có hành vi trong cùng commit `test(...)`: `shared/models/writing-practice.model.ts` (`StrokeAttemptResult`, `WritingPracticeState`), `shared/services/writing-practice.service.ts` có đủ 3 banner, Phần 2 `startPractice(strokeCount)` trả state ban đầu (mọi giá trị 0/`false`/`null`, comment `Rule:` lượt bắt đầu ở nét đầu) và `recordStrokeAttempt(state, result)` trả nguyên `state`; kiểm: typecheck sạch, test chạy và fail ở `expect(mistakeCount).toBe(2)` (nhận 0)
- [x] 1.2 GREEN: Phần 2 `nextAfterMistake(state)` (comment `Rule: …`, design D3) **chỉ** tăng `mistakeCount` và `mistakeSerial` 1, gán `lastAttempt = 'mistake'`, giữ `isHintVisible` là `false` (chưa có `HINT_AFTER_MISTAKES`/`shouldShowHint`); `recordStrokeAttempt` nhánh `mistake` gọi `nextAfterMistake`; Phần 3 chưa có method nào; kiểm: test 1.1 pass
- [x] 1.3 RED: S6.2-AC3 "Sai 3 lần liên tiếp thì hiện gợi ý" — 3 lần `mistake`: `isHintVisible` true, `completedStrokeCount` 0 (gợi ý thuộc nét hiện tại); lần 1 và 2 false; kiểm: fail ở `isHintVisible` (nhận `false`) vì 1.2 chưa có quy tắc gợi ý
- [x] 1.4 GREEN: Phần 2 thêm `HINT_AFTER_MISTAKES = 3` và `shouldShowHint(mistakeCount)` (comment `Rule: …`, `>= HINT_AFTER_MISTAKES`, design D3), gắn vào `nextAfterMistake`: `isHintVisible = shouldShowHint(mistakeCount + 1)`; kiểm: test 1.3 và 1.1 pass
- [x] 1.5 RED: S6.2-AC1 "Viết đúng nét thì sang nét kế" — `correct` từ đầu: `completedStrokeCount` 1, `isComplete` false, `lastAttempt` `'correct'`; không mutate state đầu vào; kiểm: fail vì chưa có nhánh `correct`
- [x] 1.6 GREEN: Phần 2 `nextAfterCorrect(state)` (comment `Rule: …`: tăng `completedStrokeCount`, về 0 `mistakeCount`, ẩn gợi ý, `lastAttempt = 'correct'`), `recordStrokeAttempt` nhánh `correct` gọi nó; kiểm: test 1.5 pass
- [x] 1.7 RED: S6.2-AC1 "Viết đúng hết các nét thì hoàn thành chữ" — `startPractice(2)` + 2 `correct` → `isComplete` true; `startPractice(7)` chỉ `isComplete` sau `correct` thứ 7 (TC-S6.2-AC1-12); sau khi xong mọi sự kiện trả nguyên state (TC-S6.2-AC1-13); kiểm: fail
- [x] 1.8 GREEN: Phần 2 `isCharacterComplete` (comment `Rule: …`) dùng trong `nextAfterCorrect`; `recordStrokeAttempt` (Phần 2) trả nguyên `state` khi `isComplete`, comment `Rule:` mọi sự kiện sau khi xong chữ bị bỏ qua; kiểm: test 1.7 pass
- [x] 1.9 RED: S6.2-AC3 "Bộ đếm sai tính riêng từng nét" — `mistake`×2, `correct`, `mistake`×2 → chưa gợi ý; thêm `mistake` → gợi ý, `completedStrokeCount` 1 (gợi ý nét kế); kiểm: chạy, nếu pass ngay thì tạm bỏ reset `mistakeCount` ở 1.6 để thấy fail rồi trả lại
- [x] 1.10 GREEN: sửa đến khi pass; kiểm: test 1.9 pass
- [x] 1.11 RED: S6.2-AC3 "Chạm một điểm không tính vào bộ đếm sai" — `mistake`×2, `ignored`, `mistake` → gợi ý ở lần sai thứ 3; `mistake`, `ignored`×3, `mistake` → chưa gợi ý (TC-S6.2-AC3-7); `ignored` trả nguyên state (cùng tham chiếu); `mistake` rồi `ignored` → `lastAttempt` vẫn `'mistake'`, `mistakeSerial` không đổi (chạm một điểm không thêm, không xoá thông báo sai đang có, design D7); kiểm: fail vì chưa có nhánh `ignored`
- [x] 1.12 GREEN: `recordStrokeAttempt` (Phần 2) nhánh `ignored` trả nguyên `state`, bổ sung vào comment `Rule:` của method (chạm một điểm/nét quá ngắn không đổi bộ đếm, gợi ý, thông báo); kiểm: test 1.11 pass
- [x] 1.13 RED: S6.2-AC3 "Gợi ý vẫn hiện nếu tiếp tục sai" — `mistake`×4 và ×6: `isHintVisible` vẫn true, `completedStrokeCount` 0; kiểm: chạy, nếu pass ngay thì tạm cho `shouldShowHint` chỉ đúng khi `=== 3` để thấy fail rồi trả lại
- [x] 1.14 GREEN: giữ `shouldShowHint` là `>= HINT_AFTER_MISTAKES`; kiểm: test 1.13 pass
- [x] 1.15 RED: S6.2-AC3 "Viết đúng thì gợi ý ẩn" — `mistake`×3, `correct` → `isHintVisible` false, `completedStrokeCount` 1, `mistakeCount` 0; kiểm: chạy, nếu pass ngay thì tạm bỏ dòng ẩn gợi ý ở 1.6 để thấy fail rồi trả lại
- [x] 1.16 GREEN: sửa đến khi pass; kiểm: test 1.15 pass, file < 300 dòng; mọi quy tắc đếm/gợi ý/hoàn thành nằm ở Phần 2 kèm `Rule:`, Phần 3 chưa có method (chỉ thêm `loadCharacter` ở 4.2)

## 2. Adapter chấm nét — `createStrokeQuiz` trong `core/services/stroke-writer.service.ts` (design D4)

Test chung `apps/web/src/app/core/services/stroke-quiz.service.test.ts` — Vitest, `vi.mock('hanzi-writer')` với fake mở rộng;
host là `<g>` trong `<svg viewBox="0 0 1024 1024">`; test `await` một microtask sau `createStrokeQuiz` trước khi `emit*`.

- [x] 2.1 RED: S6.2-AC1 "Viết bằng chuột" và "Viết bằng ngón tay" (phần adapter) — `createStrokeQuiz(host)` append vào host `<g>` một `svg.writing-pad-writer` riêng (`x/y 0`, `width/height 1024`) và tạo writer trên đúng `<svg>` đó với `width/height 1024`, `padding 0`, `showCharacter`/`showOutline` false, `charDataLoader` (không fetch); con đầu tiên của đích là `rect[data-writing-hit-area]` 1024×1024 `fill="transparent"`; gọi `quiz` với `showHintAfterMisses: false`, `markStrokeCorrectAfterMisses: false`, `acceptBackwardsStrokes: false`; `destroy()` (sau khi quiz đã kích hoạt) gọi `cancelQuiz` và gỡ `<svg>` riêng khỏi host — mở rộng `src/test/mocks/hanzi-writer.ts` (`quiz`, `cancelQuiz`, `emitCorrectStroke`, `emitMistake({ points, isBackwards })`) bám vòng đời thư viện thật: `quiz()` trả `Promise`, quiz chỉ kích hoạt trong microtask sau đó, trước khi kích hoạt `emit*` không gọi callback và `cancelQuiz()` không có tác dụng (design, mục Test); kiểm: fail vì chưa có `createStrokeQuiz`
- [x] 2.2 GREEN: viết `createStrokeQuiz` (vẫn là file duy nhất import `hanzi-writer`); kiểm: test 2.1 pass, test S6.1 `stroke-writer.service.test.ts` vẫn pass
- [x] 2.3 RED: S6.2-AC1 "Chạm một điểm thì bỏ qua" (phần adapter) — `emitMistake` với đường dài < `MIN_STROKE_LENGTH` (2 điểm cách 5 đơn vị) → `onAttempt('ignored')`; đúng ngưỡng 30 → `'mistake'`; `emitCorrectStroke` với đường ngắn vẫn `'correct'`; kiểm: fail vì chưa lọc độ dài
- [x] 2.4 GREEN: hằng `MIN_STROKE_LENGTH = 30` + tính độ dài đường trong adapter, `onCorrectStroke` → `'correct'`; kiểm: test 2.3 pass
- [x] 2.5 RED: S6.2-AC2 "Viết ngược hướng thì sai" (phần adapter) — `emitMistake({ isBackwards: true, points dài })` → `'mistake'`; option `acceptBackwardsStrokes` là false; kiểm: chạy, nếu pass ngay thì tạm đặt `acceptBackwardsStrokes: true` và nhánh bỏ qua `isBackwards` để thấy fail rồi trả lại
- [x] 2.6 GREEN: sửa đến khi pass; kiểm: test 2.5 pass
- [x] 2.7 RED: S6.2-AC2 "Viết nét của một nét khác thì sai" (phần adapter) — `emitMistake({ isBackwards: false, points dài })` → đúng một `'mistake'`, không `'correct'`; kiểm: chạy, nếu pass ngay thì tạm ánh xạ mọi `onMistake` thành `'ignored'` để thấy fail rồi trả lại
- [x] 2.8 GREEN: sửa đến khi pass; kiểm: test 2.7 pass
- [x] 2.9 RED: S6.2-AC1 "Giảm chuyển động trên khung viết" (phần adapter) — `isReducedMotion: true` → `quiz` nhận `strokeFadeDuration: 0`, `drawingFadeDuration: 0`, `highlightOnComplete: false`; `false` → 400, 300, `true`; kiểm: fail vì chưa truyền option theo giảm chuyển động
- [x] 2.10 GREEN: chọn option theo `isReducedMotion`; kiểm: test 2.9 pass, `pnpm --filter @csk/web lint` không báo vi phạm §2
- [x] 2.11 RED: S6.2-AC1 "Viết bằng chuột" (phần adapter: destroy trước khi quiz bắt đầu, như StrictMode effect → cleanup → effect) — trên cùng host: `createStrokeQuiz` lần 1, `destroy()` ngay (chưa qua microtask), `createStrokeQuiz` lần 2, rồi `await` microtask: writer 1 nhận `cancelQuiz` sau khi `quiz()` resolve; `emitCorrectStroke`/`emitMistake` trên writer 1 không gọi `onAttempt` của lần 1; mỗi `emit*` trên writer 2 gọi `onAttempt` đúng **một** lần; host chỉ có đúng một con là `<svg>` của writer 2; `destroy()` gọi hai lần không lỗi; kiểm: fail vì writer 1 vẫn quiz và phát sự kiện sau destroy (hoặc host còn con của writer 1)
- [x] 2.12 GREEN: cờ `isDestroyed` trong closure, `emit` bỏ sự kiện khi `isDestroyed`, `.then` của `quiz()` gọi `cancelQuiz()` khi `isDestroyed`, `destroy()` = `isDestroyed = true` + `cancelQuiz()` + `ownSvg.remove()` (design D4); kiểm: test 2.11 pass, test 2.1–2.9 vẫn pass

## 3. Khung viết — `shared/components/exercises/StrokeWritingPad.tsx` + `core/hooks/useStrokeQuiz.ts` (design D5, D6)

Test chung `apps/web/src/app/shared/components/exercises/StrokeWritingPad.test.tsx` — Vitest + Testing Library, fake hanzi-writer,
`stubReducedMotion`; `practice` dựng bằng `WritingPracticeService` thật.

- [x] 3.1 RED: S6.2-AC1 "Hiện khung viết có nét mờ của cả chữ" — render 十: figure tên "Khung viết chữ 十"; lớp `.stroke-order-outline` có đủ 2 path; `data-completed-stroke-count="0"`; không có `.writing-pad-hint`; writer được tạo trên `svg.writing-pad-writer` nằm trong host `g.writing-pad-writer-host` của cùng `<svg>` với lớp mờ, sau các path mờ; kiểm: fail vì chưa có component
- [x] 3.2 GREEN: `useStrokeQuiz` (effect tạo/huỷ quiz, `useInitialReducedMotion`), `StrokeWritingPad` (figure, `StrokeGlyph` outline, host `<g ref>`); tạo `assets/i18n/vi/writing-practice.json` (key `padLabel`), thêm `'writing-practice'` vào `I18N_NAMESPACES` và `src/test/i18n.ts`; kiểm: test 3.1 pass
- [x] 3.3 RED: S6.2-AC1 "Khung viết nhận focus bàn phím" — `userEvent.tab()` đưa focus vào figure; tên đọc được chứa "十"; nhấn chữ/số/Space/Enter/mũi tên không phát sự kiện nào, `onStrokeAttempt` không được gọi (TC-S6.2-AC1-25); kiểm: fail vì figure chưa nhận focus
- [x] 3.4 GREEN: `tabIndex={0}` trên figure, không handler bàn phím; kiểm: test 3.3 pass
- [x] 3.5 RED: S6.2-AC3 "Gợi ý không phụ thuộc chuyển động" (mức khung) — `practice` có gợi ý ở nét 0 của 十, `stubReducedMotion(true)` và `(false)`: có đúng một `.writing-pad-hint path` với `d` = nét 0, không có `<animate>`/`<animateTransform>`, nằm ngoài nhóm `.stroke-order-outline`; `data-hint-stroke-index="0"`; kiểm: fail vì chưa có lớp gợi ý
- [x] 3.6 GREEN: lớp gợi ý derive từ `practice` (D6); kiểm: test 3.5 pass
- [x] 3.7 RED: nền, không phủ Scenario (tên test kỹ thuật, không mang Scenario ID: `StrokeWritingPad nối sự kiện quiz tới onStrokeAttempt`; Scenario "Báo ngay khi viết sai nét" phủ ở 4.5) — sự kiện từ fake (`emitCorrectStroke`, `emitMistake`) tới `onStrokeAttempt` đúng giá trị; re-render với `onStrokeAttempt` ổn định không tạo writer mới; unmount gọi `cancelQuiz` và gỡ `svg.writing-pad-writer`; render trong `<StrictMode>` thì mỗi `emit*` của writer hiện tại gọi `onStrokeAttempt` đúng một lần và host chỉ có một `svg.writing-pad-writer`; kiểm: fail nếu hook chưa nối callback
- [x] 3.8 GREEN: nối `onAttempt` trong `useStrokeQuiz`, deps đủ; kiểm: test 3.7 pass, file test < 300 dòng

## 4. Màn luyện viết — `pages/writing-practice/` (design D1, D7)

Test chung `apps/web/src/app/pages/writing-practice/containers/WritingPracticeContainer.test.tsx` — Vitest + Testing Library,
`openRoute('/characters/十/writing-practice')` qua bảng route thật, `setupStrokeOrderRoute()`, fake hanzi-writer phát sự kiện.
Tách `WritingPracticeContainer.feedback.test.tsx` nếu > 300 dòng.

- [x] 4.1 RED: S6.2-AC1 "Màn luyện viết có liên kết về thứ tự nét" — mở 人: có link "Xem thứ tự nét", bấm thì vị trí là `/characters/%E4%BA%BA/stroke-order` và màn S6.1 của 人 hiện (`LocationProbe` hoặc figure "Thứ tự nét chữ 人"); chỉ có một khung viết; kiểm: fail vì chưa có route/màn
- [x] 4.2 GREEN: `ROUTE_PATHS.writingPractice`, `writing-practice.routes.ts` (gom vào `page.routes.ts`), Phần 1 `readCharacter` + Phần 3 `loadCharacter` của `WritingPracticeService` (ủy quyền `StrokeOrderService`) dùng trong `useWritingPractice`, `WritingPracticeContainer` (+ `WritingPracticeScreen key={character}`), key `title`, `strokeOrderLink`, `loading`; kiểm: test 4.1 pass
- [x] 4.3 RED: S6.2-AC1 "Chữ không có dữ liệu nét" — mở `/characters/龘/writing-practice`: "Chưa có dữ liệu nét cho chữ này.", không có figure khung viết, hanzi-writer không được tạo, link "Xem thứ tự nét" vẫn có; kiểm: fail
- [x] 4.4 GREEN: nhánh `unavailable` (+ `loading`, `error` với "Thử lại" theo mẫu S6.1); kiểm: test 4.3 pass
- [x] 4.5 RED: S6.2-AC2 "Báo ngay khi viết sai nét" — `emitMistake` (đường dài): alert "Sai nét. Viết lại nét này." hiện; trước sự kiện không có alert; `data-completed-stroke-count` vẫn 0; kiểm: fail vì chưa có phản hồi
- [x] 4.6 GREEN: `useWritingPractice` giữ `practice`, `recordStrokeAttempt` (`useCallback`), `components/WritingPracticeFeedback.tsx` nhánh `mistake` (`role="alert"`), key `mistake`; kiểm: test 4.5 pass
- [x] 4.7 RED: S6.2-AC2 "Nét sai bị xoá và được viết lại" — sau `emitMistake` chưa có nét nào được giữ (`data-completed-stroke-count="0"`), quiz vẫn chạy (không `cancelQuiz`, không màn kết thúc); `emitCorrectStroke` sau đó → 1; sai 5 lần liên tiếp vẫn viết tiếp được (TC-S6.2-AC2-7); kiểm: chạy, nếu pass ngay thì tạm cho hook huỷ quiz khi sai để thấy fail rồi trả lại
- [x] 4.8 GREEN: sửa đến khi pass; kiểm: test 4.7 pass
- [x] 4.9 RED: S6.2-AC2 "Thông báo sai đọc được bằng trình đọc màn hình" — đưa focus vào khung bằng Tab, `emitMistake`: thông báo có `role="alert"`, `document.activeElement` vẫn là figure khung viết; kiểm: chạy, nếu pass ngay thì tạm đặt focus vào thông báo để thấy fail rồi trả lại
- [x] 4.10 GREEN: không chuyển focus khi hiện thông báo; kiểm: test 4.9 pass
- [x] 4.11 RED: S6.2-AC2 "Lần sai liên tiếp sau cũng được đọc lại" — 2 lần `emitMistake`: nút alert sau lần 2 là nút DOM mới (`not.toBe` nút sau lần 1), nội dung giống nhau; kiểm: fail vì alert được giữ nguyên nút
- [x] 4.12 GREEN: `key={practice.mistakeSerial}` trên alert (D7); kiểm: test 4.11 pass
- [x] 4.13 RED: S6.2-AC2 "Viết đúng thì thông báo sai biến mất" — `emitMistake` rồi `emitCorrectStroke`: không còn alert sai; kiểm: chạy, nếu pass ngay thì tạm hiện alert khi `mistakeSerial > 0` để thấy fail rồi trả lại
- [x] 4.14 GREEN: thông báo chỉ khi `lastAttempt === 'mistake'`; kiểm: test 4.13 pass
- [x] 4.15 RED: S6.2-AC3 "Sai 3 lần liên tiếp thì hiện gợi ý" (mức màn) — 十 đã `emitCorrectStroke` nét ngang, rồi 3 lần `emitMistake`: đúng một `.writing-pad-hint path` với `d` = nét sổ, `data-hint-stroke-index="1"`; sau 2 lần chưa có; kiểm: fail nếu container chưa truyền `practice` xuống khung
- [x] 4.16 GREEN: truyền `practice` vào `StrokeWritingPad`; kiểm: test 4.15 pass
- [x] 4.17 RED: S6.2-AC1 "Viết đúng hết các nét thì hoàn thành chữ" (mức màn) — 十: 2 lần `emitCorrectStroke` → status "Đã viết xong chữ 十.", nút "Viết lại", vị trí vẫn `/characters/十/writing-practice`; `fetch` không có request nào ngoài file nét và IndexedDB không có bản ghi tiến độ nào (không ghi điểm/tiến độ); kiểm: fail vì chưa có nhánh hoàn thành
- [x] 4.18 GREEN: `WritingPracticeFeedback` nhánh `isComplete` (`role="status"`, key `complete`, nút `restart`); kiểm: test 4.17 pass
- [x] 4.19 RED: S6.2-AC1 "Viết lại sau khi hoàn thành" — hoàn thành 十, bấm "Viết lại": không còn status hoàn thành, `data-completed-stroke-count="0"`, writer cũ bị `cancelQuiz`, một writer mới được tạo; 2 lần `emitMistake` ở nét sổ trước khi xong rồi "Viết lại" + 1 `emitMistake` → chưa có gợi ý (TC-S6.2-AC1-16); kiểm: fail vì chưa có `restart`
- [x] 4.20 GREEN: `restart()` trong `useWritingPractice` (`startPractice`, `padKey + 1`), `key={padKey}` trên khung; kiểm: test 4.19 pass
- [x] 4.21 RED: S6.2-AC3 "Viết đúng thì gợi ý ẩn" (mức màn) — 3 `emitMistake` rồi `emitCorrectStroke`: không còn `.writing-pad-hint`, `data-completed-stroke-count="1"`, không có `data-hint-stroke-index`; kiểm: chạy, nếu pass ngay thì tạm cho khung giữ gợi ý theo chỉ số cũ để thấy fail rồi trả lại
- [x] 4.22 GREEN: sửa đến khi pass; kiểm: test 4.21 pass, mọi file < 300 dòng

## 5. Nút "Tập viết" trên màn S6.1 — `pages/stroke-order/containers/StrokeOrderContainer.tsx` (design D8)

Test chung `apps/web/src/app/pages/stroke-order/containers/StrokeOrderContainer.writing.test.tsx` — Vitest + Testing Library qua
route thật, `setupStrokeOrderRoute()`.

- [x] 5.1 RED: S6.2-AC1 "Vào luyện viết từ màn xem thứ tự nét" — mở `/characters/人/stroke-order`, bấm link "Tập viết": màn luyện viết của 人 mở với đúng một figure "Khung viết chữ 人"; cũng đúng khi giảm chuyển động (khối tĩnh); kiểm: fail vì chưa có nút
- [x] 5.2 GREEN: `<Link to={ROUTE_PATHS.writingPractice(view.character)}>` trong nhánh `ready`, key `stroke-order:writingPractice`; kiểm: test 5.1 pass, test S6.1 hiện có vẫn pass
- [x] 5.3 RED: S6.2-AC1 "Nút Tập viết bấm được bằng bàn phím" — `userEvent.tab()` đến "Tập viết", `{Enter}` → màn luyện viết của 人; kiểm: chạy, nếu pass ngay thì tạm đổi link thành phần tử không focus được để thấy fail rồi trả lại
- [x] 5.4 GREEN: sửa đến khi pass; kiểm: test 5.3 pass
- [x] 5.5 RED: S6.2-AC1 "Không có nút Tập viết khi chữ không có dữ liệu nét" — mở 龘: không có link/nút "Tập viết"; cũng không có khi đang tải và khi lỗi tải; kiểm: chạy, nếu pass ngay thì tạm render nút ở mọi trạng thái để thấy fail rồi trả lại
- [x] 5.6 GREEN: nút chỉ ở nhánh `ready`; kiểm: test 5.5 pass

## 6. Giao diện — `styles/tailwind/` (design D9)

- [x] 6.1 `apps/web/src/styles/tailwind/components/_writing-practice.css` (import trong `main.css`): `.writing-pad` (khung vuông, `touch-action: none`, `user-select: none`), `.writing-pad-writer path { stroke: var(--color-accent) }` (chỉ `stroke`), `.writing-pad-hint path` (fill + stroke `fg`, dày, không `transition`/`animation`), `.writing-practice-message`, `.writing-practice-link`; JSX chỉ layout/spacing (§6); thêm vào `tokens.test.ts` các cặp contrast: `fg`/`line-strong` ≥ 3:1, `accent`/`surface` ≥ 3:1, `line-strong`/`surface` ≥ 3:1, cả sáng và tối — ngoại lệ test-first: CSS thuần (assertion contrast chỉ khẳng định token có sẵn); kiểm: `pnpm --filter @csk/web test:run tokens` pass, xem preview `web-dev` 375×812 và 1280×800, sáng và tối: nét mờ, nét đúng, gợi ý, thông báo sai, hoàn thành, nút "Tập viết", link "Xem thứ tự nét" (vùng chạm ≥ 44×44 px)

## 7. Luồng thật, bàn phím, mobile, offline — e2e Playwright (`apps/web/e2e/E6/`)

E2E viết sau nhóm 4–5 chạy trên màn đã có: RED nào pass ngay thì tạm đổi route/hành vi để thấy fail rồi trả lại. Tên test
mang ID Scenario và ID TC. `test.describe('S6.2 Viết theo nét có gợi ý')`.

- [x] 7.1 RED: `apps/web/e2e/E6/s6.2-writing-practice.spec.ts`, các case `e2e` của test-cases: S6.2-AC1 "Hiện khung viết có nét mờ của cả chữ" (TC-S6.2-AC1-1: 2 path mờ của 十, `data-completed-stroke-count="0"`; TC-S6.2-AC1-2: 375×812 với 你, 7 path mờ, cạnh khung ≥ 240 px, không cuộn ngang), "Màn luyện viết có liên kết về thứ tự nét" (AC1-20, AC1-21 vùng chạm ≥ 44×44 px), "Chữ không có dữ liệu nét" (AC1-22, 龘 mở trực tiếp), "Khung viết nhận focus bàn phím" (AC1-23: Tab vào khung, `outline-style` khác `none`; AC1-25: phím không tạo nét, không thông báo), "Đường thay thế khi không dùng được chuột hoặc cảm ứng" (AC1-26), "Vào luyện viết từ màn xem thứ tự nét" (AC1-27, AC1-28), "Nút Tập viết bấm được bằng bàn phím" (AC1-29), "Không có nút Tập viết khi chữ không có dữ liệu nét" (AC1-30); kiểm: `pnpm e2e` fail đúng lý do
- [x] 7.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass; kiểm: `pnpm e2e` pass
- [x] 7.3 RED: S6.2-AC1 "Hiện khung viết có nét mờ của cả chữ" khi offline (TC-S6.2-AC1-4) — `apps/web/e2e/E6/s6.2-writing-practice-offline.spec.ts`, mẫu `openOnceWithServiceWorker` của `e2e/E1/s1.2-offline.spec.ts`: offline mở luyện viết 人, 2 path mờ, không "Chưa có dữ liệu nét cho chữ này."; kiểm: thấy fail (tạm loại route khỏi bảng nếu pass ngay) rồi trả lại
- [x] 7.4 GREEN: sửa đến khi pass; kiểm: test 7.3 pass
- [x] 7.5 RED: thư viện thật chấm nét vẽ — `apps/web/e2e/E6/s6.2-writing-practice-drawing.spec.ts` + helper `e2e/E6/writing-practice.helpers.ts` (`drawMedian` theo median của `/content/strokes/<chữ>.json` bản build, `page.mouse` có `steps`): S6.2-AC1 "Viết bằng chuột" (đang kéo đã có path nét người viết trong `svg.writing-pad-writer`), "Viết đúng nét thì sang nét kế" và "Viết đúng hết các nét thì hoàn thành chữ" (十 ngang rồi sổ → 1 rồi 2, "Đã viết xong chữ 十."), "Chạm một điểm thì bỏ qua" (nhấp một điểm: không alert, vẫn 0), S6.2-AC2 "Viết ngược hướng thì sai" (ngang phải → trái: alert, vẫn 0), "Nét sai bị xoá và được viết lại" (không giảm chuyển động: sau nét sai đợi quá `drawingFadeDuration` 300 ms — `expect.poll` tới 1 s — rồi kiểm trong `svg.writing-pad-writer` không còn path nét người viết nhìn thấy: `path[stroke-linejoin="round"]` của `UserStrokeRenderer` đã bị gỡ hoặc `opacity` 0, design Context; `data-completed-stroke-count` vẫn 0; viết đúng nét ngang sau đó → 1), "Viết nét của một nét khác thì sai" (sổ khi chờ ngang: alert, vẫn 0), S6.2-AC3 "Sai 3 lần liên tiếp thì hiện gợi ý" (3 nét ngược: `data-hint-stroke-index="0"`); chạy cả khổ Pixel 7 và 1280×800; kiểm: fail đúng lý do (vd toạ độ lệch nếu đích là `<g>`)
- [x] 7.6 GREEN: sửa adapter/khung (không sửa kỳ vọng) đến khi pass; kiểm: test 7.5 pass
- [ ] 7.7 RED: S6.2-AC1 "Viết bằng ngón tay" — trong `s6.2-writing-practice-drawing.spec.ts`: kéo dài trang (`min-height` qua `page.evaluate`), cuộn để khung nằm giữa, kéo cảm ứng nét ngang của 十 trong khung bằng CDP `Input.dispatchTouchEvent`: `window.scrollY` không đổi và nét được nhận (`data-completed-stroke-count="1"`); `touch-action` của khung là `none`; kiểm: fail đúng lý do
- [ ] 7.8 GREEN: sửa đến khi pass (CSS `touch-action`, đích nhận `touchstart`); kiểm: test 7.7 pass
- [ ] 7.9 RED: S6.2-AC1 "Giảm chuyển động trên khung viết" và S6.2-AC3 "Gợi ý không phụ thuộc chuyển động" — trong `s6.2-writing-practice-drawing.spec.ts`, `page.emulateMedia({ reducedMotion: 'reduce' })`: ngay sau khi nhả nét ngang đúng, path nét đúng của thư viện đã `opacity` 1 (không hiện dần); sau nét sai không còn path nét người viết hiện ra; sau 3 lần sai `.writing-pad-hint path` có `animation-name`/`transition-duration` là `none`/`0s` và vẫn còn sau 2 s; kiểm: fail đúng lý do
- [ ] 7.10 GREEN: sửa đến khi pass; kiểm: test 7.9 pass

## 8. Tài liệu và kiểm tra

- [ ] 8.1 Cập nhật `docs/03-architecture.md`: cây `pages/writing-practice`, route `/characters/:character/writing-practice`, `createStrokeQuiz` + `useStrokeQuiz`, `StrokeWritingPad` trong `shared/components/exercises`, `writing-practice.service`, i18n `writing-practice.json` — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 8.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, dependency một chiều, file < 300 dòng, component < 5 props, effect có cleanup, không mutate state); kiểm: `pnpm lint` sạch
- [ ] 8.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 8.4 Chụp screenshot cho PR: màn luyện viết 十 (mới mở, sau một lần sai, đang gợi ý, đã xong), 龘, màn S6.1 có nút "Tập viết" — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets`
- [ ] 8.5 Ghi vào mô tả PR code cho QA: mẫu địa chỉ `/characters/<chữ>/writing-practice` (vd 龘 cho TC-S6.2-AC1-22), ngưỡng nét quá ngắn `MIN_STROKE_LENGTH = 30` đơn vị hộp 1024 (≈ 3 % cạnh khung) cho TC-S6.2-AC1-18, token nét mờ `--color-line-strong`, và cho TC-S6.2-AC3-6/AC3-7: chạm một điểm không thêm và không xoá thông báo sai đang có (sau lần sai, alert sai cũ vẫn hiện khi chạm; "không có thông báo" nghĩa là không có alert mới); kiểm: mô tả PR có đủ bốn mục

## Workflow follow-up

- PR code ghi `Spec PR: #119`, References `Closes #35` khi đủ AC1–AC3, dòng `OpenSpec change: s6-2-guided-writing`.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
