# Design: S6.1 Xem thứ tự nét

Động lực và phạm vi: xem `proposal.md`. Hành vi: `specs/stroke-order/spec.md`. Case nghiệm thu: `test-cases.md`.
Luật layer/dependency/service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (không phải đề xuất):

- `content:build` (S2.5) đã chép dữ liệu nét chữ có trong bài vào `apps/web/src/assets/content/strokes/<chữ>.json`
  (9 chữ: 人 你 八 十 四 好 爸 白 百). Mỗi file là JSON của hanzi-writer-data: `{ strokes: string[], medians:
  number[][][], radStrokes?: number[] }`, toạ độ hộp 1024, trục y lật (gốc ở baseline 900). Chưa có schema Zod cho
  dữ liệu này, chưa có danh sách chữ nào có dữ liệu.
- `content:check` có `outputInSyncCheck`: output trong `assets/content/` phải khớp đúng những gì `assembleContent`
  sinh ra. Thêm file output mới nghĩa là phải sinh từ `assemble.ts`, không viết tay.
- Service worker precache `**/*.{…,json,…}` (`vite.config.ts`), nên mọi file trong `content/strokes/` đã nằm trong
  precache. Request tới file **không có** trong precache khi offline thì lỗi mạng; khi online, `vite preview` và host
  tĩnh trả `index.html` (SPA fallback, HTTP 200) cho file không tồn tại. Tức là: **không thể dựa vào HTTP 404 để biết
  "chữ không có dữ liệu nét"**, cả online lẫn offline.
- Nạp nội dung đi qua `core/services/content-source.service.ts` (`FetchContentSource.load`: fetch → `safeParse` Zod →
  throw rõ nghĩa) và `shared/services/content.service.ts` (3 phần, inject `ContentSource`). Hook mẫu:
  `pages/learning-path/hooks/useLearningPath.ts` (cờ `isActive` trong effect, `hasError`).
- Hạ tầng UI dùng chung theo mẫu `core/services/audio.service.ts` + `core/hooks/useAudioPlayer.ts`; component dùng
  chung gọi `core/hooks` (vd `shared/components/ListenButton.tsx`). Test giả ở ranh giới (`FakeAudio` trong
  `useAudioPlayer.test.ts`).
- Route khai báo bằng `PageRoute[]` trong `pages/<feature>/<feature>.routes.ts`, gom ở `pages/page.routes.ts`,
  hằng `ROUTE_PATHS` ở `core/constants/app.constants.ts`; route theo RESTful (`/lessons/:lessonId`,
  `/units/:unitId/placement-test`). react-router-dom ^7.3.
- `hanzi-writer` **chưa** có trong `apps/web` (chỉ có `hanzi-writer-data` ở `content/`). Người thật đã chốt thêm nó.
- i18n: namespace theo màn trong `assets/i18n/vi/*.json`, khai báo ở `core/services/i18n.service.ts`
  (`I18N_NAMESPACES`) và `src/test/i18n.ts`. `common.json` đã có `error.title` "Có lỗi xảy ra", `error.retry` "Thử lại".
  Chưa có key "Đang tải…".

## Goals / Non-Goals

**Goals:**

- Một màn xem thứ tự nét cho đúng một chữ, đủ 4 trạng thái: đang tải, lỗi (+ Thử lại), không có dữ liệu/không hợp lệ,
  sẵn sàng (animation hoặc tĩnh đánh số).
- Phân biệt "không có dữ liệu nét" với "lỗi tải" **không cần mạng**.
- Khối animation (chữ mờ nền + nét vẽ + "Phát lại") và khối tĩnh đánh số nằm ở `shared/components/` để S6.2/S6.3
  dùng lại; thư viện vẽ bị bọc sau một adapter ở `core/services/` để test và để S6.2 thêm chấm nét.
- Số nét đã vẽ là state của app (không đọc từ DOM của thư viện), để Vitest và Playwright đếm được.

**Non-Goals:**

- Không thêm lối vào màn từ thẻ từ vựng hay bài S7.1 (proposal "Không làm").
- Không đổi schema `content.json`, bài, từ, câu; không đổi IndexedDB.
- Không chấm nét/quiz của hanzi-writer (S6.2).

## Decisions

### D1. Route: `/characters/:character?/stroke-order`

- Feature `pages/stroke-order/`, file `stroke-order.routes.ts`: `{ path: 'characters/:character?/stroke-order',
  element: StrokeOrderContainer }`, gom vào `pages/page.routes.ts` trước `errorRoutes`.
- `ROUTE_PATHS.strokeOrder = (character: string) => '/characters/' + encodeURIComponent(character) + '/stroke-order'`.
- Tài nguyên `characters` (số nhiều, định danh bằng chính chữ), `stroke-order` là tài nguyên con số ít của một chữ.
- Segment tùy chọn để có địa chỉ "không chỉ định chữ" cho Scenario "Chữ được yêu cầu rỗng":
  `/characters/stroke-order`. QA dùng hai mẫu địa chỉ này (ghi vào mô tả PR code, theo `test-cases.md`).
- Thay thế đã cân nhắc: `/stroke-order?character=好` (query param, lệch chuẩn RESTful của repo);
  `/characters/:character` (tên quá chung, S6.2 cần `/characters/:character/writing-practice` cạnh nó).

### D2. Danh sách chữ có dữ liệu nét: `content/strokes/index.json` do `content:build` sinh

- `assembleContent` thêm file `strokes/index.json` = mảng chữ (đã sort) **có** dữ liệu nét, chỉ ghi khi đã lọc
  `data !== undefined`. `outputInSyncCheck` tự giữ file này khớp với thư mục nét.
- Schema `strokeIndexSchema` (`@csk/shared`): mảng chuỗi, mỗi chuỗi đúng một ký tự Hán, không trùng.
- File nằm trong precache như mọi JSON nội dung, nên offline vẫn biết "龘" không có dữ liệu mà không cần request
  `龘.json`. Chữ không có trong danh sách → `unavailable`, **không fetch**; chữ có trong danh sách mà tải/parse lỗi →
  `error`; không tải được danh sách → `error`.
- Thay thế đã cân nhắc: (a) dựa vào HTTP 404 → sai vì SPA fallback trả 200 HTML và offline thì lỗi mạng (xem Context);
  (b) thêm `strokeCharacters` vào `content.json` → đổi `contentRootSchema` và `contentVersion`, trái "không đổi schema
  nội dung" của proposal; (c) plugin Vite sinh module ảo từ thư mục → thêm cấu hình build riêng, Vitest không có, khó
  dùng cho e2e. Phương án D2 cũng giúp e2e TC-S6.1-AC1-37 đọc danh sách chữ từ bản build.
- Đây là output mới của pipeline nội dung (vùng của S2.5). Cần dev lead đồng ý ở cổng plan (xem Open Questions).

### D3. Schema Zod dữ liệu nét: `packages/shared/src/stroke.schema.ts`

- `strokeDataSchema`: `strokes` mảng chuỗi path không rỗng (≥ 1), `medians` mảng (mỗi phần tử mảng điểm `[number,
  number]`, ≥ 1 điểm), `radStrokes` tùy chọn mảng số nguyên ≥ 0; `refine`: `medians.length === strokes.length`.
  Type `StrokeData`. Không `passthrough` (field lạ bị bỏ).
- `strokeIndexSchema` + type `StrokeIndex` (D2).
- Export từ `packages/shared/src/index.ts`. Test `packages/shared/src/stroke.schema.test.ts`.

### D4. Nạp dữ liệu: `core/services` (hạ tầng) → `shared/services` (use case)

- `core/services/content-source.service.ts`: thêm vào interface `ContentSource` và `FetchContentSource`
  `getStrokeIndex(): Promise<StrokeIndex>` (`/content/strokes/index.json`) và
  `getStrokeData(character: string): Promise<StrokeData>` (`/content/strokes/${encodeURIComponent(character)}.json`),
  dùng lại `load()` sẵn có (fetch → HTTP lỗi thì throw → `safeParse` → throw "Nội dung không hợp lệ"). JSON hỏng
  (`response.json()` throw) cũng là lỗi. Các fake `ContentSource` trong test hiện có (`content.service.test.ts`, …) phải
  thêm hai method (typecheck bắt).
- `shared/services/stroke-order.service.ts`, class `StrokeOrderService(source: ContentSource = contentSource)`:
  - **Phần 1** (private): `readStrokeIndex()`, `readStrokeData(character)`.
  - **Phần 2** (pure, public): `isSingleHanCharacter(input: string): boolean` — Rule: chữ được yêu cầu hợp lệ khi gồm
    đúng một ký tự (đếm theo code point, `Array.from`) và ký tự đó thuộc `\p{Script=Han}`; rỗng, "abc", "你好" đều
    không hợp lệ. `hasStrokeData(character, index): boolean` — Rule: chỉ chữ có trong danh sách nét của bản app mới
    có dữ liệu nét.
  - **Phần 3** (public): `getStrokeOrder(input: string): Promise<StrokeOrderResult>` — không hợp lệ →
    `{ status: 'unavailable' }` (không đọc gì); đọc danh sách; không có → `unavailable` (không đọc file nét); có →
    đọc file nét → `{ status: 'available', character, strokeData }`. Lỗi đọc/validate → throw
    `Error('Không tải được dữ liệu nét.', { cause })`.
- `shared/models/stroke-order.model.ts`: `StrokeOrderResult` (union theo `status`).
- Thay thế: thêm vào `ContentService` → file đã ~230 dòng, domain khác; tách service riêng giữ < 300 dòng.

### D5. Vẽ nét: adapter `core/services/stroke-writer.service.ts` bọc hanzi-writer

- Interface `StrokeWriter { animateStroke(index: number): Promise<'completed' | 'cancelled'>; clear(): void;
  destroy(): void }` và `createStrokeWriter(target: HTMLElement, character: string, strokeData: StrokeData):
  StrokeWriter`.
- Bản thật: `HanziWriter.create(target, character, { charDataLoader: (_c, onLoad) => onLoad(strokeData),
  showCharacter: false, showOutline: false, padding: 0, width, height })` — dữ liệu đã validate được đưa thẳng vào,
  hanzi-writer **không** tự fetch (không có request ngoài, offline an toàn). `animateStroke(i)` gọi
  `writer.animateStroke(i, { onComplete })` và resolve `'cancelled'` khi `onComplete` báo `canceled`. `clear()` gọi
  `hideCharacter({ duration: 0 })` (huỷ animation đang chạy). `destroy()` gỡ DOM của writer khỏi `target`.
- Chỉ adapter này import `hanzi-writer`. Vitest giả thư viện ở ranh giới bằng `vi.mock('hanzi-writer', …)` với
  `src/test/mocks/hanzi-writer.ts` (`FakeHanziWriter`: ghi các nét đang/đã được yêu cầu vẽ, `finishStroke()` để test
  điều khiển thời điểm), giống cách `useAudioPlayer.test.ts` giả `Audio`.
- Thay thế: tự viết animation SVG (stroke-dashoffset theo medians) → làm lại cái hanzi-writer đã có, S6.2 vẫn cần
  hanzi-writer để chấm nét; gọi `animateCharacter()` một lần → không đếm được nét đã vẽ và không chặn được hai nét
  chồng nhau từ phía app.

### D6. Trình tự phát: `core/hooks/useStrokeAnimation.ts`

- `useStrokeAnimation(targetRef: RefObject<HTMLDivElement | null>, character: string, strokeData: StrokeData)` →
  `{ drawnStrokeCount: number; isPlaying: boolean; replay: () => void }`.
- Effect (deps `[targetRef, character, strokeData]`): tạo writer, **tự phát một lần**, cleanup `destroy()` và vô hiệu
  lượt đang chạy. Một lượt phát: `runId += 1`, `clear()`, `drawnStrokeCount = 0`, lặp `i = 0..n-1`: `await
  animateStroke(i)`; nếu `runId` đã đổi hoặc kết quả `'cancelled'` thì dừng; ngược lại `drawnStrokeCount = i + 1`.
  Vì mỗi nét chỉ bắt đầu sau khi nét trước resolve, không bao giờ có hai nét cùng vẽ.
- `replay()` là event handler (không qua effect): bắt đầu lượt mới; lượt cũ tự dừng nhờ `runId`. Bấm được khi đang
  phát lẫn khi đã xong (không `disabled`).
- Hook hạ tầng (cùng loại `useAudioPlayer`), không có business logic. Nằm ở `core/hooks` chứ không ở
  `pages/stroke-order/hooks` như bảng layer của proposal gợi ý, vì `shared/components` (dùng lại ở S6.2) không được
  import hook của một feature (§2).

### D7. Giảm chuyển động: `core/hooks/useInitialReducedMotion.ts`

- `useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)`; **không** đăng ký listener — đúng
  luật "chỉ xét lúc mở màn". "Mở lại màn" = component được mount lại (điều hướng tới chữ khác hoặc tải lại trang); D8
  bảo đảm đổi chữ cũng mount lại.
- `matchMedia` không có (môi trường lạ) → `false`.

### D8. Màn: hook + container `pages/stroke-order/`

- `hooks/useStrokeOrder.ts`: `useStrokeOrder(character: string)` → `{ view: StrokeOrderView; isReducedMotion:
  boolean; retry: () => void }`, với `StrokeOrderView = { status: 'loading' } | { status: 'error' } | { status:
  'unavailable' } | { status: 'ready'; character; strokeData }` (type ở `shared/models/stroke-order.model.ts`).
  Effect gọi `StrokeOrderService.getStrokeOrder` với cờ `isActive` (mẫu `useLearningPath`); `retry` tăng
  `attempt` (dep của effect) và đặt lại `loading`. Service tạo bằng `useMemo`.
- `containers/StrokeOrderContainer.tsx` (default export, lazy): đọc `useParams().character ?? ''`, render
  component private cùng file `StrokeOrderScreen` với `key={character}` để mỗi chữ là một lần "mở màn" mới
  (state tải, snapshot giảm chuyển động, lượt tự phát đều làm lại). Cấu trúc: `<main>` + `<h1>` (key `title`), rồi
  early return theo `view.status`:
  - `loading` → `<p role="status">` "Đang tải…".
  - `error` → `<p role="alert">` `common:error.title` + `<button>` `common:error.retry` gọi `retry`.
  - `unavailable` → `<p>` "Chưa có dữ liệu nét cho chữ này.".
  - `ready` + giảm chuyển động → `<StrokeOrderStatic>`; ngược lại → `<StrokeOrderAnimation>`.
- Không hiện chữ yêu cầu ở tiêu đề khi `unavailable` (Scenario "你好" cấm hiện riêng 你/好; tiêu đề chỉ là "Thứ tự nét").

### D9. Component dùng chung `shared/components/`

- `StrokeOrderAnimation.tsx` — props `{ character, strokeData }`: `<figure>` có `role="img"`, `aria-label`
  "Thứ tự nét chữ {{character}}", `data-drawn-stroke-count={drawnStrokeCount}`; bên trong lớp chữ mờ nền
  (`StrokeGlyph` mode outline) và `div` đích của writer chồng lên (absolute, cùng kích thước, `aria-hidden`); dưới
  figure là `<button type="button">` "Phát lại" gọi `replay`.
- `StrokeOrderStatic.tsx` — props `{ character, strokeData }`: `<figure role="img">` cùng nhãn; vẽ mọi nét đậm và
  một `<text>` số `1..n` ở điểm đầu median của mỗi nét; không nút.
- `StrokeGlyph.tsx` — SVG `viewBox="0 0 1024 1024"`, vẽ các path của `strokeData` (lật trục y), prop `variant:
  'outline' | 'solid'`; S6.2 dùng lại cho khung viết.
- `shared/utils/stroke.utils.ts` (leaf, pure): `STROKE_VIEWBOX`, `STROKE_PATH_TRANSFORM`
  (`translate(0, 900) scale(1, -1)`), `strokeLabelPoint(median): { x: number; y: number }` (điểm đầu median, đổi sang
  toạ độ màn). Test `stroke.utils.test.ts`.
- Chữ mờ nền là lớp SVG của app (không dùng `showOutline` của hanzi-writer) để test được trong jsdom, không bị tính
  vào `drawnStrokeCount`, và dùng chung với khối tĩnh/S6.2.

### D10. i18n, style

- `assets/i18n/vi/stroke-order.json`: `title` "Thứ tự nét", `loading` "Đang tải…", `unavailable` "Chưa có dữ liệu nét
  cho chữ này.", `replay` "Phát lại", `figureLabel` "Thứ tự nét chữ {{character}}". Thêm `'stroke-order'` vào
  `I18N_NAMESPACES` và `src/test/i18n.ts`.
- `styles/tailwind/components/_stroke-order.css` (import trong `main.css`): `.stroke-order-figure`,
  `.stroke-order-outline` (màu mờ từ token, contrast ≥ 3:1 với nền cho thành phần UI), `.stroke-order-stroke`
  (màu nét đã vẽ, CSS `fill` ghi đè thuộc tính `fill` mà hanzi-writer đặt trên path), `.stroke-order-label`,
  `.stroke-order-message`; biến thể tối trong `themes/_dark.css` nếu token chưa tự đổi. JSX chỉ layout/spacing (§6).
  Khung vuông co theo chiều rộng (mobile-first, không cuộn ngang ở 375 px).

### D11. Dependency mới

- `hanzi-writer` vào `catalog` của `pnpm-workspace.yaml` (bản 3.x, có sẵn type TS) và `apps/web` `dependencies`
  (`catalog:`). Đã được người thật chốt (proposal Dependencies). Không thêm gì khác.

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `StrokeOrderContainer` | `useStrokeOrder`, `StrokeOrderAnimation`, `StrokeOrderStatic`, react-router | ✅ không chạm `shared/services` |
| `useStrokeOrder` | `StrokeOrderService`, `useInitialReducedMotion` | ✅ hooks → shared/services, core/hooks |
| `StrokeOrderService` | `ContentSource` (core/services), `@csk/shared` | ✅ không React, không Dexie |
| `content-source.service` | `@csk/shared` | ✅ |
| `StrokeOrderAnimation` | `useStrokeAnimation` (core/hooks), `StrokeGlyph`, `stroke.utils` | ✅ không gọi service trực tiếp |
| `useStrokeAnimation` | `stroke-writer.service` (core/services) | ✅ core/hooks → core/services |
| `stroke-writer.service` | `hanzi-writer`, type `StrokeData` | ✅ không React |
| `stroke.utils` | type `StrokeData` | ✅ leaf |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| `content/strokes/index.json` | `strokeIndexSchema` | `FetchContentSource.getStrokeIndex` |
| `content/strokes/<chữ>.json` | `strokeDataSchema` | `FetchContentSource.getStrokeData` |
| Tham số URL `:character` | Không cần Zod: là `string \| undefined` từ router, chỉ đi qua rule `isSingleHanCharacter` rồi so với danh sách đã validate; không gắn type nghiệp vụ | `StrokeOrderService` Phần 2 |

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Schema nét, danh sách chữ | `packages/shared` | `packages/shared/src/stroke.schema.test.ts` |
| Sinh `strokes/index.json` | content build | `content/scripts/content-build/assemble.test.ts` |
| Fetch + validate | `core/services` (mock `fetch`) | `apps/web/src/app/core/services/content-source.service.test.ts` |
| Rule chữ hợp lệ, có dữ liệu; use case | `shared/services` Phần 2/3 (fake `ContentSource`) | `apps/web/src/app/shared/services/stroke-order.service.test.ts` |
| Adapter hanzi-writer | `core/services` (fake hanzi-writer) | `apps/web/src/app/core/services/stroke-writer.service.test.ts` |
| Phát, phát lại, chữ mờ nền, thứ tự | component + fake hanzi-writer | `apps/web/src/app/shared/components/StrokeOrderAnimation.test.tsx` |
| Thứ tự nét tĩnh | component | `apps/web/src/app/shared/components/StrokeOrderStatic.test.tsx` |
| Toạ độ số thứ tự | util | `apps/web/src/app/shared/utils/stroke.utils.test.ts` |
| Màn: tải, lỗi, không có dữ liệu, một chữ, giảm chuyển động | container (mock `fetch`, fake hanzi-writer, stub `matchMedia`) | `apps/web/src/app/pages/stroke-order/containers/StrokeOrderContainer.test.tsx` (+ `.states.test.tsx` nếu > 300 dòng) |
| Luồng thật, offline | e2e | `apps/web/e2e/E6/s6.1-stroke-order.spec.ts`, `apps/web/e2e/E6/s6.1-stroke-order-offline.spec.ts` |

Dữ liệu nét giả cho Vitest: `src/test/stroke.fixtures.ts` (人 2 nét, 白 5 nét, 好 6 nét, path/median tối giản hợp lệ
theo `strokeDataSchema`) và helper `mockStrokeFetch` (trả `index.json` + file nét, tuỳ chọn lỗi HTTP/JSON hỏng/sai
cấu trúc/treo), theo mẫu `src/test/mocks/content-fetch.ts`.

E2E: Playwright `test.describe('S6.1 Xem thứ tự nét')`, mỗi test mang ID AC; chỉ kiểm trạng thái ổn định
(`data-drawn-stroke-count` cuối, nút, thông báo) bằng `expect.poll`. Giảm chuyển động bằng
`page.emulateMedia({ reducedMotion })`. Case chặn/làm chậm/thay phản hồi dùng `page.route` với
`serviceWorkers: 'block'` (route của page không chặn được request do service worker phục vụ). Offline theo mẫu
`e2e/E1/s1.2-offline.spec.ts` (`openOnceWithServiceWorker` → `context.setOffline(true)`); danh sách chữ đọc từ
`/content/strokes/index.json` của bản build, số nét từ file nét tương ứng.

## Risks / Trade-offs

- [hanzi-writer và lớp chữ mờ nền của app lệch vị trí] → cả hai dùng hộp 1024 với `padding: 0` và cùng kích thước
  phần tử; QA xác nhận TC-S6.1-AC1-5/6; nếu lệch, cho writer render vào cùng `<svg>` (hanzi-writer nhận phần tử `svg`).
- [hanzi-writer không resolve `onComplete` khi bị huỷ bởi `hideCharacter`] → lượt cũ vẫn bị bỏ nhờ `runId`; adapter
  test khẳng định lượt mới không bị chặn bởi promise treo của lượt cũ.
- [Fake hanzi-writer làm test xanh trong khi thư viện thật khác] → e2e trên bản build chạy thư viện thật cho số nét
  cuối, phát lại, phát lại dồn dập (TC-S6.1-AC2-11, 12).
- [`page.route` không chặn request qua service worker] → các e2e lỗi/tải chậm/dữ liệu hỏng chạy với
  `serviceWorkers: 'block'`; e2e offline thì không block.
- [Danh sách `strokes/index.json` lệch thư mục nét] → sinh cùng một chỗ trong `assembleContent`; `content:check`
  (`outputInSyncCheck`) chặn ở hook và CI.
- [Số thứ tự chồng nhau ở chữ nhiều nét trên 375 px] → đặt số ở điểm đầu median, cỡ chữ theo viewBox; QA
  TC-S6.1-AC1-33.
- [Bundle tăng do hanzi-writer] → chỉ import trong adapter, đi theo chunk lazy của màn.

## Migration Plan

- Không đổi dữ liệu người dùng. Bản mới thêm `content/strokes/index.json` vào precache; app cũ không đọc file này.
- Rollback: revert PR (bỏ route, dependency, file index); không có migration ngược.

## Open Questions

- Dev lead xác nhận ở cổng plan: thêm output `content/strokes/index.json` vào `content:build` (D2) — chạm pipeline
  nội dung của S2.5 nhưng không đổi schema hay dữ liệu hiện có. Nếu không đồng ý thì phương án thay là D2(c) (module
  ảo), task nhóm 2 đổi theo.
- Tiêu đề màn "Thứ tự nét" (`h1`) là chữ giao diện chưa có trong spec; đổi chữ không ảnh hưởng thiết kế.
