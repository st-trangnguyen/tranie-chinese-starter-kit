# Design: S6.2 Viết theo nét có gợi ý

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/stroke-guided-writing/spec.md`, `specs/stroke-order/spec.md`.
Case nghiệm thu: `test-cases.md`. Luật layer/dependency/service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau S6.1, không phải đề xuất):

- `hanzi-writer` 3.7.3 đã là dependency của `apps/web` (S6.1 D11). File duy nhất import nó là
  `core/services/stroke-writer.service.ts` (`createStrokeWriter`: vẽ animation vào một `<g>`; `charDataLoader` nhận dữ liệu
  đã validate, không fetch). Giả thư viện trong Vitest bằng `src/test/mocks/hanzi-writer.ts` (`FakeHanziWriter`, chỉ có
  `animateStroke`/`hideCharacter`/`showCharacter`).
- Nạp dữ liệu nét: `shared/services/stroke-order.service.ts` (`StrokeOrderService.getStrokeOrder(input)` →
  `unavailable` | `available { character, strokeData }`, throw `'Không tải được dữ liệu nét.'`), rule chữ hợp lệ qua
  `hanCharacterSchema`, tra `strokes/index.json` trước khi tải file nét (đúng cả khi offline). Type
  `StrokeOrderView` (loading/error/unavailable/ready) ở `shared/models/stroke-order.model.ts`.
- Màn S6.1: `pages/stroke-order/` (route `characters/:character?/stroke-order`, `ROUTE_PATHS.strokeOrder(character)`),
  container đổi `key={character}` để mỗi chữ là một lần mở màn; nhánh `ready` render `StrokeOrderAnimation` hoặc
  `StrokeOrderStatic`.
- Khối dùng chung: `shared/components/StrokeGlyph.tsx` (`<svg viewBox="0 0 1024 1024">`, variant `outline` = lớp chữ mờ
  `.stroke-order-outline`, `children` render ngoài nhóm transform), `shared/utils/stroke.utils.ts`
  (`STROKE_VIEWBOX`, `STROKE_PATH_TRANSFORM`). `core/hooks/useInitialReducedMotion.ts` chốt giảm chuyển động lúc mount.
- Test màn qua bảng route thật: `src/test/stroke-order-route.tsx` (`openRoute`, `setupStrokeOrderRoute`,
  `stubReducedMotion`), `src/test/mocks/stroke-fetch.ts`, fixtures `src/test/stroke.fixtures.ts` (人, 白, 好; chưa có 十).
  E2E: `apps/web/e2e/E6/` (`stroke-order.helpers.ts`), Playwright chỉ một project `chromium` giả lập Pixel 7 (có cảm ứng).
- Mã nguồn `hanzi-writer` 3.7.3 (đã đọc `dist/index.esm.js`), các điểm quyết định thiết kế:
  - `writer.quiz({ onCorrectStroke, onMistake, onComplete, … })` chấm từng nét. Nét **một điểm** bị bỏ trước khi chấm
    (không callback). Nét **từ 2 điểm** đều được chấm (nét rất ngắn thành `onMistake`).
  - Gợi ý có sẵn (`showHintAfterMisses`) dùng `highlightStroke`: sáng lên rồi tự tắt — không dùng được (proposal).
    `markStrokeCorrectAfterMisses` mặc định `false`; `acceptBackwardsStrokes` mặc định `false`.
  - Hiệu ứng có thời lượng: `strokeFadeDuration` (nét đúng hiện dần, 400 ms), `drawingFadeDuration` (nét người viết mờ dần,
    300 ms, chạy cho mọi nét kể cả nét sai), `highlightOnComplete` (nhấp sáng cả chữ).
  - Nghe sự kiện **chuột/chạm** (`mousedown`/`touchstart`/`mousemove`/`touchmove` trên nút đích, `mouseup`/`touchend`
    trên `document`, không gỡ được), gọi `preventDefault()` trên start/move khi đang quiz.
  - Toạ độ con trỏ: nếu nút đích có `createSVGPoint` (chỉ `<svg>`) thì đổi qua `getScreenCTM().inverse()` của chính nút đó;
    nếu không (vd `<g>`) thì lấy **pixel** trừ góc `getBoundingClientRect()`. Positioner coi điểm là đơn vị của
    `width/height` đã truyền (1024).
  - Sự kiện chỉ tới nút đích khi con trỏ trúng phần đã tô (SVG hit-testing): vùng trống của khung không nhận `mousedown`.
  - Vòng đời bất đồng bộ: constructor gắn listener lên nút đích **ngay** (`_setupListeners`); `setCharacter` và `quiz()`
    chạy trong `.then` của `_withDataPromise` (renderer mount và `_quiz` được tạo ở microtask sau). `cancelQuiz()` gọi
    trước khi `quiz()` resolve không làm gì (`_quiz` chưa có), và quiz vẫn bắt đầu sau đó.
  - Nét người viết (`UserStrokeRenderer`) là `path` có `stroke-linejoin="round"` trong nhóm của thư viện, bị gỡ khỏi DOM
    sau `drawingFadeDuration`; nét chữ của thư viện dùng `stroke-linejoin="miter"`.
  - `App.tsx` bọc `<StrictMode>`: ở dev, effect chạy → cleanup → chạy lại trên cùng nút DOM.

## Goals / Non-Goals

**Goals:**

- Một khung viết dùng chung (`shared/components/exercises/`) chỉ nhận props, phát sự kiện `correct | mistake | ignored`,
  vẽ nét mờ cả chữ và lớp phủ gợi ý tĩnh; dùng lại được ở S6.3 và bài `stroke-write`.
- Quy tắc đếm sai liên tiếp, hiện/ẩn gợi ý, hoàn thành là hàm thuần của service, test bằng bảng mà không cần thư viện.
- Trạng thái nét (số nét đã viết đúng, nét đang gợi ý) là state của app, đọc được qua thuộc tính `data-*` để Vitest và
  Playwright kiểm, không đọc DOM của thư viện.
- Toạ độ viết khớp đúng lớp chữ mờ ở mọi kích thước khung (375 px đến desktop).

**Non-Goals:**

- Không chế độ "không gợi ý", không chấm điểm hay ghi tiến độ (S6.3). Không đăng ký `stroke-write` vào
  `exerciseRegistry` (story có bài đó lo).
- Không đổi schema nội dung, `strokes/index.json`, IndexedDB, `package.json`.
- Không tự viết bộ so khớp nét.

## Decisions

### D1. Route: `/characters/:character/writing-practice`

- Feature `pages/writing-practice/`, `writing-practice.routes.ts`: `{ path: 'characters/:character/writing-practice',
  element: WritingPracticeContainer }` (lazy), gom vào `pages/page.routes.ts` cạnh `strokeOrderRoutes`, trước `errorRoutes`.
- `ROUTE_PATHS.writingPractice = (character: string) => '/characters/' + encodeURIComponent(character) +
  '/writing-practice'` trong `core/constants/app.constants.ts`.
- RESTful: tài nguyên `characters` định danh bằng chính chữ (như S6.1, đã dự kiến tên này ở S6.1 D1),
  `writing-practice` là tài nguyên con số ít. Segment `:character` **bắt buộc**: spec không có Scenario "không chỉ định chữ"
  cho màn này; thiếu chữ thì rơi vào NotFound sẵn có.
- Hai màn trỏ nhau chỉ qua `ROUTE_PATHS`, không import chéo feature.
- Thay thế: `/writing-practice?character=人` (query, lệch chuẩn RESTful); `/characters/:character/practice` (chung chung).

### D2. Nạp chữ: dùng lại `StrokeOrderService`

- `shared/services/writing-practice.service.ts`, class `WritingPracticeService(strokeOrder: StrokeOrderService = new
  StrokeOrderService())`. Phần 1 private `readCharacter(input)` = `this.strokeOrder.getStrokeOrder(input)`; Phần 3
  `loadCharacter(input): Promise<StrokeOrderResult>`. Mọi rule chữ hợp lệ / có dữ liệu / lỗi tải giữ nguyên một chỗ
  (S6.1), nên "Chữ không có dữ liệu nét" (kể cả `abc`, offline) và câu "Chưa có dữ liệu nét cho chữ này." khớp S6.1.
- Thay thế: hook gọi thẳng `StrokeOrderService` → hook gọi hai service, khó theo dõi; chép logic nạp → hai nguồn rule.

### D3. Quy tắc luyện viết: `WritingPracticeService` Phần 2 (thuần, mỗi method một `Rule:`)

- Model `shared/models/writing-practice.model.ts`:
  - `StrokeAttemptResult = 'correct' | 'mistake' | 'ignored'`.
  - `WritingPracticeState = { strokeCount: number; completedStrokeCount: number; mistakeCount: number;
    isHintVisible: boolean; isComplete: boolean; lastAttempt: 'correct' | 'mistake' | null; mistakeSerial: number }`.
    `completedStrokeCount` cũng là chỉ số nét hiện tại; `mistakeCount` là số lần sai liên tiếp của nét hiện tại;
    `mistakeSerial` tăng mỗi lần sai, không bao giờ về 0 trong một lượt (dùng làm `key` thông báo, D7).
- Theo pattern `lesson.service.ts` (quan sát được: `startSession`, `submitResult`, `advance`, `skip` là chuyển trạng thái
  thuần ở Phần 2, mỗi method một comment `Rule: …`), **mọi** quy tắc đếm và chuyển trạng thái nằm ở Phần 2 (pure, public,
  không mutate, trả object mới). Mỗi method một comment `Rule: …`:
  - `HINT_AFTER_MISTAKES = 3` (hằng của module service, là quy tắc nghiệp vụ, không phải hằng app).
  - `shouldShowHint(mistakeCount): boolean` — Rule: sai từ 3 lần liên tiếp ở nét hiện tại thì hiện gợi ý; sai tiếp khi gợi
    ý đang hiện thì gợi ý vẫn hiện, không đếm lại (`>= HINT_AFTER_MISTAKES`).
  - `isCharacterComplete(completedStrokeCount, strokeCount): boolean` — Rule: viết đúng hết các nét là xong chữ.
  - `startPractice(strokeCount): WritingPracticeState` — Rule: một lượt viết bắt đầu ở nét đầu, bộ đếm sai 0, chưa gợi ý,
    chưa có thông báo (mọi giá trị về 0/`false`/`null`).
  - `nextAfterMistake(state): WritingPracticeState` — Rule: viết sai nét hiện tại thì bộ đếm sai tăng 1, báo sai, gợi ý
    theo `shouldShowHint`: `mistakeCount + 1`, `mistakeSerial + 1`, `lastAttempt = 'mistake'`, `isHintVisible`.
  - `nextAfterCorrect(state): WritingPracticeState` — Rule: viết đúng nét hiện tại thì bộ đếm về 0, gợi ý ẩn, sang nét kế;
    hết nét thì xong chữ: `completedStrokeCount + 1`, `mistakeCount = 0`, `isHintVisible = false`, `lastAttempt =
    'correct'`, `isComplete = isCharacterComplete(...)`.
  - `recordStrokeAttempt(state, result): WritingPracticeState` — Rule: chạm một điểm/nét quá ngắn (`ignored`) không đổi gì
    (bộ đếm, gợi ý, thông báo đang có); mọi sự kiện sau khi xong chữ bị bỏ qua. Ghép các rule trên:

    | `result` | Kết quả |
    |---|---|
    | bất kỳ, khi `isComplete` | trả nguyên `state` |
    | `ignored` | trả nguyên `state` |
    | `mistake` | `nextAfterMistake(state)` |
    | `correct` | `nextAfterCorrect(state)` |

- Phần 3 chỉ có use case cần dữ liệu: `loadCharacter(input)` (D2). Hook gọi trực tiếp các method Phần 2 (`startPractice`,
  `recordStrokeAttempt`) vì chúng là public và thuần — giống `pages/lesson/hooks/useLessonRunner.ts` gọi
  `service.startSession`/`service.submitResult`.
- Service không biết thư viện, không biết hình học; nó tin thứ tự sự kiện từ adapter (thư viện chỉ sang nét kế khi chấm
  đúng, nên `completedStrokeCount` của app và chỉ số nét của thư viện đi cùng nhau).
- Thay thế: đặt bộ đếm trong hook (vi phạm §0.2); dùng `showHintAfterMisses` của thư viện (gợi ý tự tắt, proposal loại).

### D4. Adapter chấm nét: `createStrokeQuiz` trong `core/services/stroke-writer.service.ts`

- Giữ một file duy nhất import `hanzi-writer` (docs/03 §4). Thêm:

  ```ts
  export type StrokeAttemptEvent = 'correct' | 'mistake' | 'ignored';
  export interface StrokeQuizOptions { isReducedMotion: boolean; onAttempt: (event: StrokeAttemptEvent) => void }
  export interface StrokeQuiz { destroy(): void }
  export function createStrokeQuiz(host: SVGGElement, character: string, strokeData: StrokeData,
    options: StrokeQuizOptions): StrokeQuiz
  ```

  (`core/services` không import `shared/models`, nên type sự kiện khai báo ở adapter; `StrokeAttemptResult` của model là
  cùng union, hook truyền thẳng — TypeScript kiểm tương thích cấu trúc.)
- **Mỗi lần gọi có đích riêng do adapter tạo.** React chỉ render một `<g className="writing-pad-writer-host">` rỗng
  (host) trong `<svg viewBox="0 0 1024 1024">` của `StrokeGlyph`. Mỗi lần `createStrokeQuiz` adapter tạo một element mới
  `<svg x="0" y="0" width="1024" height="1024" class="writing-pad-writer">` chứa sẵn con đầu tiên `<rect x="0" y="0"
  width="1024" height="1024" fill="transparent" data-writing-hit-area>`, append vào host, rồi mới tạo writer trên **chính
  `<svg>` đó**. Lý do:
  - `<svg>` (không phải `<g>` như S6.1) có `createSVGPoint`, nên hanzi-writer đổi toạ độ con trỏ qua `getScreenCTM()` của
    chính nó ra đơn vị hộp 1024 ở mọi kích thước khung; với `<g>` nó dùng pixel thô và nét lệch/chấm sai khi khung khác
    1024 px. `RenderTarget.init` ghi `width/height` = 1024 trùng giá trị sẵn có, vô hại.
  - `rect` trong suốt nằm dưới các lớp của thư viện để nhấn ở vùng trống trong khung cũng tới được nút đích.
  - Listener `mousedown`/`touchstart`/`move` thư viện gắn trong constructor nằm trên `<svg>` riêng này, nên khi `destroy()`
    gỡ element thì listener và mọi thứ renderer mount muộn đi cùng nút đã gỡ; writer cũ không bao giờ dùng chung nút với
    writer mới (StrictMode chạy effect hai lần, "Viết lại" đổi `key`).
- Tạo writer: `HanziWriter.create(ownSvg, character, { … })` với `charDataLoader` (dữ liệu đã validate),
  `showCharacter: false`, `showOutline: false` (nét mờ là lớp của app), `width/height: 1024`, `padding: 0`. Rồi `writer.quiz({ showHintAfterMisses: false, markStrokeCorrectAfterMisses:
  false, acceptBackwardsStrokes: false, highlightOnComplete: !isReducedMotion, strokeFadeDuration: isReducedMotion ? 0 :
  400, drawingFadeDuration: isReducedMotion ? 0 : 300, onCorrectStroke, onMistake })`.
- Ánh xạ sự kiện (mọi callback đi qua một hàm `emit(event)`; `emit` không làm gì khi `isDestroyed`, xem `destroy()`):
  - `onCorrectStroke` → `'correct'` (không bao giờ hạ thành `ignored`).
  - `onMistake(data)` → `'ignored'` nếu độ dài đường `data.drawnPath.points` (tổng đoạn thẳng, đơn vị hộp 1024)
    `< MIN_STROKE_LENGTH`, ngược lại `'mistake'` (gồm sai thứ tự, sai hướng — `isBackwards` — và sai hình dạng).
  - Nét một điểm: thư viện không callback → không có sự kiện, tương đương `ignored`.
  - `onComplete` của thư viện **không** dùng: service tự suy ra hoàn thành (D3), tránh hai nguồn sự thật.
- `MIN_STROKE_LENGTH = 30` (đơn vị hộp 1024, ≈ 3 % cạnh khung; khung 280 px ≈ 8 px). Hằng private của adapter, có comment
  nêu Scenario "Chạm một điểm thì bỏ qua". QA dùng ngưỡng này cho TC-S6.2-AC1-18.
- Vòng đời và `destroy()` (Context: `quiz()` chỉ bắt đầu ở microtask sau, `cancelQuiz()` trước đó không có tác dụng):
  - Biến đóng `isDestroyed = false`. `void writer.quiz({...}).then(() => { if (isDestroyed) writer.cancelQuiz(); })` —
    quiz resolve sau khi đã destroy thì bị huỷ ngay.
  - Không thêm `.catch`: promise của `quiz()` chỉ reject khi nạp dữ liệu nét lỗi, mà `charDataLoader` gọi `onLoad`
    đồng bộ với dữ liệu đã validate (D2), nên không có nhánh reject. Bám đúng pattern quan sát được ở adapter S6.1
    (`void writer.hideCharacter(...)`, `void writer.animateStroke(...)` trong `stroke-writer.service.ts`, không
    `.catch`). Không dùng `.catch(() => undefined)` vì nó sẽ nuốt lỗi lập trình nếu sau này đổi cách nạp dữ liệu; khi
    đó lỗi phải lộ ra (unhandled rejection), không bị che.
  - `destroy()`: `isDestroyed = true`, `writer.cancelQuiz()`, `ownSvg.remove()` (chỉ gỡ element của lần gọi này; host và
    element của lần gọi khác không bị đụng). Gọi `destroy()` lần hai không lỗi.
  - Kết quả: sau `destroy()` không có `onAttempt` nào nữa, và host chỉ chứa `<svg>` của writer hiện tại.
- Thay thế: (a) đích `<g>` + truyền `width/height` pixel đo bằng `ResizeObserver` → nét thư viện co theo pixel trong khi lớp
  mờ co theo viewBox, lệch nhau; (b) `rendererOverride.createRenderTarget` tự viết → dựa vào API nội bộ không công khai;
  (c) chặn nét ngắn trước khi chấm bằng cách giữ lại `mousedown` rồi phát lại → phải giả lập `TouchEvent`, dễ vỡ trên iOS;
  (d) React render sẵn một `<svg>` đích dùng chung, `destroy()` = `cancelQuiz()` + `replaceChildren()` → writer bị destroy
  trước khi quiz bắt đầu (StrictMode) vẫn mount và quiz trên cùng nút với writer mới, mỗi nét gọi `onAttempt` hai lần.

### D5. Hook hạ tầng: `core/hooks/useStrokeQuiz.ts`

- `useStrokeQuiz(hostRef: RefObject<SVGGElement | null>, character: string, strokeData: StrokeData,
  onAttempt: (event: StrokeAttemptEvent) => void): void`.
- Effect (deps `[hostRef, character, strokeData, onAttempt, isReducedMotion]`): host null thì không làm gì;
  `createStrokeQuiz(host, ...)`, cleanup `destroy()`. An toàn với StrictMode (effect → cleanup → effect): lần đầu bị
  destroy trước khi quiz bắt đầu, element của nó bị gỡ, event của nó bị bỏ (D4). `isReducedMotion` từ
  `useInitialReducedMotion()` (chốt lúc mount). `onAttempt` phải ổn định (hook trang dùng `useCallback`, D7) nên writer
  không bị tạo lại khi re-render.
- Ở `core/hooks` (cùng lý do S6.1 D6): `shared/components/exercises` chỉ được gọi `core/hooks`, không gọi service.

### D6. Khung viết: `shared/components/exercises/StrokeWritingPad.tsx`

- Props (4): `{ character: string; strokeData: StrokeData; practice: WritingPracticeState; onStrokeAttempt:
  (result: StrokeAttemptResult) => void }`.
- Cấu trúc: `<figure tabIndex={0} aria-label={t('padLabel', { character })} className="writing-pad …"
  data-completed-stroke-count={practice.completedStrokeCount} data-hint-stroke-index={hint ?? undefined}>` chứa
  `StrokeGlyph variant="outline"` với `children` theo thứ tự:
  1. Lớp gợi ý (chỉ khi `practice.isHintVisible`): `<g transform={STROKE_PATH_TRANSFORM} className="writing-pad-hint">
     <path d={strokeData.strokes[practice.completedStrokeCount]} /></g>` — đúng **một** path, nét hiện tại.
  2. `<g ref={hostRef} className="writing-pad-writer-host" />` (host D4, trên cùng; React không render con nào vào đây,
     adapter append `svg.writing-pad-writer` của writer hiện tại).
- `hint = practice.isHintVisible && !practice.isComplete ? practice.completedStrokeCount : null` (derive khi render).
- Focus: `figure` nhận Tab; viền focus dùng `:focus-visible` chung (`base/_base.css`). hanzi-writer `preventDefault`
  `mousedown` nên thao tác viết không làm mất focus đang có. Phím không làm gì (không handler bàn phím).
- Không gọi service; gọi `useStrokeQuiz` (core/hooks).
- `figure` có role `figure` + tên từ `aria-label`; svg bên trong `aria-hidden` (StrokeGlyph sẵn có).

### D7. Màn: hook + container `pages/writing-practice/`

- `hooks/useWritingPractice.ts`: `useWritingPractice(character)` → `{ view: StrokeOrderView; practice:
  WritingPracticeState | null; padKey: number; retry; recordStrokeAttempt; restart }`.
  - Effect nạp theo mẫu `useStrokeOrder` (cờ `isActive`, `attempt` cho Thử lại); khi `ready` đặt `practice =
    service.startPractice(strokeData.strokes.length)` trong cùng `.then` (không effect đồng bộ thứ hai).
  - `recordStrokeAttempt = useCallback((r) => setPractice(prev => prev && service.recordStrokeAttempt(prev, r)),
    [service])` — ổn định, dùng làm `onAttempt` (D5).
  - `restart()` (event handler): `practice = startPractice(n)`, `padKey + 1` → container đổi `key` của khung, writer mới,
    khung chỉ còn nét mờ, listener cũ đi cùng nút cũ.
- `containers/WritingPracticeContainer.tsx` (default export, lazy): `useParams().character ?? ''`, component private
  `WritingPracticeScreen key={character}`. `<main>` + `<h1>` `title`, liên kết "Xem thứ tự nét"
  (`<Link to={ROUTE_PATHS.strokeOrder(character)}>`, đặt **trên** khung để không bị che ở 375 px), rồi theo `view.status`:
  `loading` → `<p role="status">`; `error` → `<p role="alert">` `common:error.title` + nút `common:error.retry`;
  `unavailable` → `<p>` `unavailable` (không khung); `ready` → `<StrokeWritingPad key={padKey} …>` +
  `<WritingPracticeFeedback>`.
  Liên kết "Xem thứ tự nét" hiện ở mọi trạng thái (đường thay thế bàn phím; với chữ không hợp lệ nó dẫn về màn S6.1 cũng
  báo không có dữ liệu).
- `components/WritingPracticeFeedback.tsx` — props `{ character, practice, onRestart }`:
  - `practice.isComplete` → `<p role="status">` `complete` + `<button type="button">` `restart` ("Viết lại").
  - ngược lại `practice.lastAttempt === 'mistake'` → `<p role="alert" key={practice.mistakeSerial}>` `mistake`. Đổi
    `key` mỗi lần sai làm React gắn nút alert **mới**, nên trình đọc màn hình đọc lại dù cùng nội dung (Scenario "Lần sai
    liên tiếp sau cũng được đọc lại"); Vitest kiểm được bằng "nút alert sau ≠ nút alert trước".
  - `lastAttempt === 'correct'` hoặc `null` → không có thông báo sai.
  - **Chạm một điểm / nét quá ngắn không thêm và không xoá thông báo sai đang có**: `ignored` trả nguyên `state` (D3),
    nên sau một lần sai rồi chạm một điểm, alert sai cũ (cùng `mistakeSerial`, cùng nút DOM) vẫn còn; không có alert mới.
  - Không đặt focus vào thông báo (focus ở lại khung).
- Màn không ghi điểm/tiến độ: hook không nhận `ProgressStore`, service không có phần ghi.

### D8. Nút "Tập viết" trên màn S6.1

- `pages/stroke-order/containers/StrokeOrderContainer.tsx`, nhánh `ready` (cả animation và tĩnh): thêm
  `<Link to={ROUTE_PATHS.writingPractice(view.character)} className="btn btn-primary self-center">` key
  `stroke-order:writingPractice` "Tập viết". Nhánh `unavailable`/`error`/`loading` không có (Scenario "Không có nút Tập viết").
- Là liên kết điều hướng (Enter mở, Space không cần). Test truy vấn `getByRole('link', { name: 'Tập viết' })`; giao diện
  trông như nút (`.btn`), vùng chạm ≥ 44×44 px.
- Container S6.1 đang ~80 dòng; nếu nhánh `ready` dài thêm thì tách `StrokeOrderReady` private cùng file.

### D9. i18n, style

- `assets/i18n/vi/writing-practice.json` (chốt ở Open Questions): `title` "Tập viết", `padLabel` "Khung viết chữ
  {{character}}", `mistake` "Sai nét. Viết lại nét này.", `complete` "Đã viết xong chữ {{character}}.", `restart`
  "Viết lại", `strokeOrderLink` "Xem thứ tự nét", `loading` "Đang tải…", `unavailable` "Chưa có dữ liệu nét cho chữ này."
  Thêm `'writing-practice'` vào `I18N_NAMESPACES` (`core/services/i18n.service.ts`) và `src/test/i18n.ts`.
  `stroke-order.json` thêm `writingPractice` "Tập viết".
- `styles/tailwind/components/_writing-practice.css` (import trong `main.css`), JSX chỉ layout/spacing (§6):
  - `.writing-pad`: khung vuông như `.stroke-order-figure`, `touch-action: none` (trang không cuộn khi viết trong khung),
    `user-select: none`, `cursor: crosshair`.
  - Nét mờ cả chữ: dùng lại `.stroke-order-outline` của `StrokeGlyph` (token `line-strong`, ≥ 3:1 với `surface`) — tên token
    QA cần: **`--color-line-strong`**.
  - `.writing-pad-writer path { stroke: var(--color-accent) }` — nét đúng và nét đang viết; chỉ đổi `stroke` như S6.1 D10.
  - `.writing-pad-hint path`: `fill: var(--color-fg)` + `stroke: var(--color-fg)`, `stroke-width` dày (đậm hơn nét mờ, khác
    không chỉ ở màu); `fg` vs `line-strong` ≈ 4:1 (sáng) / ≈ 3,9:1 (tối). Không `transition`/`animation` (tĩnh luôn, kể cả
    khi không giảm chuyển động).
  - `.writing-practice-message`, `.writing-practice-link`: chữ ≥ 4.5:1, vùng chạm ≥ 44×44 px.
  - Biến thể tối tự đổi qua token semantic; tỉ lệ contrast thêm vào `tokens.test.ts` (dùng `color.utils`).

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `WritingPracticeContainer`, `WritingPracticeFeedback` | `useWritingPractice`, `StrokeWritingPad`, `ROUTE_PATHS`, react-router | ✅ không chạm `shared/services` |
| `useWritingPractice` | `WritingPracticeService`, model | ✅ hooks → shared/services |
| `WritingPracticeService` | `StrokeOrderService`, model | ✅ không React, không Dexie |
| `StrokeWritingPad` (exercises) | `useStrokeQuiz` (core/hooks), `StrokeGlyph`, `stroke.utils`, model type | ✅ không service nào |
| `useStrokeQuiz` | `stroke-writer.service` (core/services), `useInitialReducedMotion` | ✅ core/hooks → core/services |
| `stroke-writer.service` | `hanzi-writer`, type `StrokeData` (`@csk/shared`) | ✅ không React, không shared/* |
| `StrokeOrderContainer` (sửa) | `ROUTE_PATHS` | ✅ không import `pages/writing-practice` |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| Tham số URL `:character` | `hanCharacterSchema` (qua `StrokeOrderService.isSingleHanCharacter`) | D2, có sẵn |
| `content/strokes/index.json`, `content/strokes/<chữ>.json` | `strokeIndexSchema`, `strokeDataSchema` | `FetchContentSource`, có sẵn |
| Callback của hanzi-writer | không cần: dữ liệu trong bộ nhớ của thư viện đã có type, không phải nguồn ngoài | — |

Không có schema mới.

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Quy tắc đếm, gợi ý, hoàn thành; nạp chữ | `shared/services` Phần 2/3 | `apps/web/src/app/shared/services/writing-practice.service.test.ts` |
| Adapter chấm nét (đích svg riêng, vùng nhận, option, ánh xạ sự kiện, ngưỡng, destroy trước khi quiz bắt đầu) | `core/services` + fake hanzi-writer | `apps/web/src/app/core/services/stroke-quiz.service.test.ts` (test của `createStrokeQuiz`, tách khỏi test S6.1 để < 300 dòng) |
| Khung viết: nét mờ, focus, gợi ý, giảm chuyển động | component + fake | `apps/web/src/app/shared/components/exercises/StrokeWritingPad.test.tsx` |
| Màn: liên kết, không dữ liệu, thông báo sai, hoàn thành, Viết lại | container qua route thật | `apps/web/src/app/pages/writing-practice/containers/WritingPracticeContainer.test.tsx` (+ `.feedback.test.tsx` nếu > 300 dòng) |
| Nút "Tập viết" | container S6.1 | `apps/web/src/app/pages/stroke-order/containers/StrokeOrderContainer.writing.test.tsx` |
| Luồng thật, mobile, offline, bàn phím | e2e | `apps/web/e2e/E6/s6.2-writing-practice.spec.ts`, `s6.2-writing-practice-offline.spec.ts` |
| Thư viện thật chấm nét vẽ (đúng, ngược hướng, nét khác, chạm, gợi ý, cảm ứng) | e2e | `apps/web/e2e/E6/s6.2-writing-practice-drawing.spec.ts` |

- Fake: mở rộng `src/test/mocks/hanzi-writer.ts` với `quiz(options)`, `cancelQuiz()` (ghi vào `calls`), và điều khiển
  `emitCorrectStroke()`, `emitMistake({ points, isBackwards })` gọi callback đã đăng ký. Fake bám vòng đời thư viện thật
  (Context): `quiz()` trả `Promise`, quiz chỉ **kích hoạt trong microtask** sau đó (trước đó `emit*` không gọi callback và
  `cancelQuiz()` không có tác dụng); `cancelQuiz()` sau khi kích hoạt thì `emit*` không gọi callback nữa. Test chờ quiz
  kích hoạt bằng `await` một microtask (hoặc `await act(async () => {})` ở tầng component). Container/khung kiểm qua
  `data-completed-stroke-count`, `data-hint-stroke-index`, `.writing-pad-hint path`, `.stroke-order-outline path`.
- Fixture `STROKE_DATA_SHI` (十, 2 nét) thêm vào `src/test/stroke.fixtures.ts` từ file nét thật.
- E2E vẽ bằng thư viện thật: helper `drawMedian(page, pad, median, { reverse })` trong `e2e/E6/writing-practice.helpers.ts`
  đọc median từ `/content/strokes/<chữ>.json` của bản build, đổi sang toạ độ màn (`x / 1024 * width`,
  `(900 - y) / 1024 * height` theo box của svg ngoài), kéo bằng `page.mouse` có `steps`. Cảm ứng dùng CDP
  `Input.dispatchTouchEvent` (project chỉ có chromium) và so `window.scrollY` trước/sau trên trang được kéo dài. Đây là
  kiểm bổ sung cho các case test-cases đánh `không`; QA vẫn chạy tay.

## Risks / Trade-offs

- [Toạ độ con trỏ lệch nét mờ] → đích là `<svg>` lồng có `createSVGPoint` (D4); e2e vẽ theo median ở khổ Pixel 7 và
  desktop (TC-S6.2-AC1-2 cùng file) phải được chấm đúng.
- [Nét ngắn ≥ 30 đơn vị vẫn bị tính sai; nét ngắn mà thư viện chấm đúng (chấm/điểm của chữ) vẫn được nhận] → chủ ý: không
  hạ nét đúng thành bỏ qua; ngưỡng ghi ở D4 cho QA.
- [Listener `mouseup`/`touchend` trên `document` của thư viện không gỡ được] → sau `cancelQuiz` chúng không làm gì;
  mỗi writer có `<svg>` riêng bị gỡ khi destroy nên listener trên nút đi cùng nút. Tích luỹ hai listener rỗng mỗi lần tạo
  writer (StrictMode dev, "Viết lại"), chấp nhận.
- [Writer bị destroy trước khi quiz bắt đầu (StrictMode, đổi chữ/`key` nhanh) vẫn bắt đầu quiz sau đó] → `<svg>` riêng đã
  gỡ khỏi DOM nên không nhận con trỏ; `.then` của `quiz()` gọi `cancelQuiz()` khi `isDestroyed`; `emit` bỏ mọi sự kiện sau
  destroy (D4). Adapter test 2.11 kiểm đúng thứ tự này với fake bất đồng bộ.
- [Fake hanzi-writer làm Vitest xanh khi thư viện thật khác] → file e2e `drawing` chạy thư viện thật cho đúng/sai/chạm/gợi ý.
- [Màu nét đúng (`accent`) và gợi ý (`fg`) gần nhau ở theme sáng] → gợi ý khác thêm ở độ dày và vị trí (chỉ nét chưa
  viết); QA TC-S6.2-AC3-4; chỉnh token trong task CSS nếu không đạt.
- [Thư viện nhấp sáng cả chữ khi xong dù đã tắt] → `highlightOnComplete: false` khi giảm chuyển động, adapter test kiểm option.
- [Bundle] → chunk lazy của màn, thư viện đã có từ S6.1.

## Migration Plan

- Không đổi dữ liệu người dùng hay nội dung. Rollback: revert PR (route, màn, nút "Tập viết").

## Open Questions

- [x] Câu chữ giao diện chưa có trong spec: tiêu đề, nhãn khung, thông báo sai, thông báo xong → dùng các câu ở D9
  ("Tập viết", "Khung viết chữ {{character}}", "Sai nét. Viết lại nét này.", "Đã viết xong chữ {{character}}."). Đổi câu
  sau này chỉ đổi file i18n và chuỗi kỳ vọng trong test, không đổi cấu trúc plan.
