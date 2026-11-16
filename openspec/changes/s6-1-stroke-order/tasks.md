# Tasks: S6.1 Xem thứ tự nét

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID (`S6.1-AC1 …`, `S6.1-AC2 …`). Tên file, hàm, route: xem design.md D1–D10.

Vitest: `pnpm --filter @csk/web test:run <mẫu>`; dữ liệu nét giả `src/test/stroke.fixtures.ts`, mock `fetch` bằng
`src/test/mocks/stroke-fetch.ts`, giả hanzi-writer bằng `src/test/mocks/hanzi-writer.ts` (`vi.mock('hanzi-writer')`).
Ba file hỗ trợ này tạo ở task RED đầu tiên cần đến chúng.

## 1. Dependency `hanzi-writer` (design D11)

- [x] 1.1 Thêm `hanzi-writer` (3.x) vào `catalog` của `pnpm-workspace.yaml` và `dependencies` của `apps/web/package.json` (`catalog:`), `pnpm install` — ngoại lệ test-first: config thuần; kiểm: `pnpm install` xong, `pnpm --filter @csk/web typecheck` pass, `pnpm-lock.yaml` có `hanzi-writer`

## 2. Schema dữ liệu nét — `@csk/shared` (design D3; nền cho S6.1-AC1 "Dữ liệu nét hỏng hoặc sai cấu trúc")

- [x] 2.1 RED: test `hanCharacterSchema` (`"人"`, chữ Hán ngoài BMP như `"𠀀"` hợp lệ; `""`, `"a"`, `"abc"`, `"你好"`, `"人 "` không hợp lệ), `strokeDataSchema` (hợp lệ với dữ liệu `人.json` thật; thiếu `strokes`; `strokes` rỗng; `medians` lệch số nét; điểm median không phải cặp số) và `strokeIndexSchema` (hợp lệ; phần tử nhiều ký tự; phần tử không phải chữ Hán; trùng) — Vitest, `packages/shared/src/stroke.schema.test.ts`; kiểm: fail vì chưa có schema
- [x] 2.2 GREEN: thêm `packages/shared/src/stroke.schema.ts` (`hanCharacterSchema`, `strokeDataSchema`, `StrokeData`, `strokeIndexSchema` = mảng `hanCharacterSchema` không trùng, `StrokeIndex`), export trong `packages/shared/src/index.ts`; kiểm: test 2.1 pass

## 3. Danh sách chữ có dữ liệu nét — `content:build` (design D2; nền cho "Chữ không có dữ liệu nét khi offline")

- [x] 3.1 RED: test `assembleContent` sinh `strokes/index.json` gồm đúng các chữ có dữ liệu nét (sort, không có chữ thiếu dữ liệu) và parse được bằng `strokeIndexSchema` — Vitest, `content/scripts/content-build/assemble.test.ts`; kiểm: `pnpm --filter @csk/content test:run assemble` fail vì chưa có file
- [x] 3.2 GREEN: thêm `strokes/index.json` vào `files` trong `content/scripts/content-build/assemble.ts`; chạy `pnpm --filter @csk/content content:build` để sinh `apps/web/src/assets/content/strokes/index.json`; kiểm: test 3.1 pass, `pnpm content:check` pass (output khớp nguồn)

## 4. Nạp dữ liệu nét — `core/services` (design D4)

- [x] 4.1 RED: test `FetchContentSource.getStrokeIndex()` và `getStrokeData('人')` (đúng URL `/content/strokes/…`, encode chữ; HTTP lỗi → throw; JSON hỏng → throw; sai cấu trúc → throw "Nội dung không hợp lệ") — Vitest, mock `fetch` ở ranh giới, `apps/web/src/app/core/services/content-source.service.test.ts`; kiểm: fail vì thiếu method
- [x] 4.2 GREEN: thêm hai method vào interface `ContentSource` và `FetchContentSource` (dùng lại `load`); cập nhật các fake `ContentSource` trong test hiện có cho đủ interface; kiểm: test 4.1 pass, `pnpm --filter @csk/web typecheck` pass

## 5. Use case thứ tự nét — `shared/services/stroke-order.service.ts` (design D4)

- [x] 5.1 RED: S6.1-AC1 "Chữ được yêu cầu rỗng" — `isSingleHanCharacter('')` là `false`, `getStrokeOrder('')` trả `unavailable` và không đọc nguồn — Vitest thuần + fake `ContentSource`, `apps/web/src/app/shared/services/stroke-order.service.test.ts`; kiểm: fail vì chưa có service
- [x] 5.2 GREEN: tạo `StrokeOrderService` 3 phần + `shared/models/stroke-order.model.ts` (`StrokeOrderResult`, `StrokeOrderView`), Phần 2 `isSingleHanCharacter` = `hanCharacterSchema.safeParse(input).success` (comment "Rule: …", không viết lại regex), Phần 3 `getStrokeOrder` nhánh không hợp lệ; kiểm: test 5.1 pass
- [x] 5.3 RED: S6.1-AC1 "Chữ được yêu cầu không phải chữ Hán" — `"abc"` → `unavailable`, không đọc nguồn — `stroke-order.service.test.ts`; kiểm: chạy, nếu pass ngay nhờ `hanCharacterSchema` (2.2) thì tạm cho rule chỉ kiểm chuỗi rỗng để thấy fail rồi trả lại
- [x] 5.4 GREEN: rule dùng `hanCharacterSchema` (phần chữ Hán); kiểm: test 5.3 pass
- [x] 5.5 RED: S6.1-AC1 "Chữ được yêu cầu gồm nhiều chữ" — `"你好"` → `unavailable`, không đọc file nét của 你 hay 好 — `stroke-order.service.test.ts`; kiểm: như 5.3 (tạm cho rule chỉ kiểm có chữ Hán để thấy fail rồi trả lại)
- [x] 5.6 GREEN: rule dùng `hanCharacterSchema` (phần đúng một ký tự); kiểm: test 5.5 pass
- [x] 5.7 RED: S6.1-AC1 "Chữ không có dữ liệu nét" — danh sách không có `"龘"` → `unavailable`, `getStrokeData` không được gọi; chữ `"人"` có trong danh sách → `available` với `strokeData` của 人 — `stroke-order.service.test.ts`; kiểm: fail
- [x] 5.8 GREEN: Phần 1 `readStrokeIndex`/`readStrokeData`, Phần 2 `hasStrokeData` (comment "Rule: …"), Phần 3 nhánh danh sách; kiểm: test 5.7 pass
- [x] 5.9 RED: S6.1-AC1 "Chữ không có dữ liệu nét khi offline" — fake nguồn: `getStrokeIndex` trả danh sách, mọi `getStrokeData` throw lỗi mạng; `getStrokeOrder('龘')` vẫn trả `unavailable` (không throw) — `stroke-order.service.test.ts`; kiểm: chạy, nếu pass ngay thì xác nhận test đúng bằng cách tạm đảo nhánh 5.8 cho thấy fail rồi trả lại
- [x] 5.10 GREEN: giữ thứ tự "kiểm danh sách trước, chỉ đọc file nét khi có trong danh sách"; kiểm: test 5.9 pass
- [x] 5.11 RED: S6.1-AC1 "Tải dữ liệu nét lỗi" và "Dữ liệu nét hỏng hoặc sai cấu trúc" — nguồn throw ở `getStrokeIndex` hoặc ở `getStrokeData('人')` → `getStrokeOrder` throw `Error('Không tải được dữ liệu nét.')` có `cause` — `stroke-order.service.test.ts`; kiểm: fail
- [x] 5.12 GREEN: bọc lỗi đọc trong Phần 3; kiểm: test 5.11 pass

## 6. Adapter vẽ nét — `core/services/stroke-writer.service.ts` (design D5; nền cho "Mỗi lúc chỉ vẽ một nét")

- [x] 6.1 RED: test `createStrokeWriter` với fake hanzi-writer, đích là một `<g>` trong `<svg viewBox="0 0 1024 1024">`: tạo writer trên đúng `<g>` đó với `width: 1024`, `height: 1024`, `padding: 0`, dữ liệu được truyền vào (`charDataLoader`, không tự fetch, `showCharacter`/`showOutline` tắt); `animateStroke(i)` resolve `'completed'` khi nét xong, `'cancelled'` khi bị huỷ; `clear()` gọi `hideCharacter({ duration: 0 })`; `destroy()` gọi `hideCharacter({ duration: 0 })` **trước** rồi gỡ mọi con của `<g>` (chính `<g>` và `<svg>` vẫn còn, `width`/`height` của `<svg>` không đổi) — Vitest, `apps/web/src/app/core/services/stroke-writer.service.test.ts`, tạo `src/test/mocks/hanzi-writer.ts` (`FakeHanziWriter` + `finishStroke()`); kiểm: fail vì chưa có adapter
- [x] 6.2 GREEN: viết adapter (chỉ file này import `hanzi-writer`; type dữ liệu chữ là `import type { CharacterJson } from 'hanzi-writer'`); kiểm: test 6.1 pass, `pnpm --filter @csk/web lint` không báo vi phạm §2

## 7. Khối animation + Phát lại — `shared/components/StrokeOrderAnimation.tsx` + `core/hooks/useStrokeAnimation.ts` (design D6, D9)

Test chung file `apps/web/src/app/shared/components/StrokeOrderAnimation.test.tsx` — Vitest + Testing Library, fake hanzi-writer điều khiển thời điểm từng nét, đếm nét qua `data-drawn-stroke-count` của figure. Tạo `src/test/stroke.fixtures.ts` ở 7.1.

- [x] 7.1 RED: S6.1-AC1 "Chữ hiện animation và tự phát khi mở" — render với 好: có figure tên "Thứ tự nét chữ 好"; ngay khi mount `data-drawn-stroke-count="0"` và nét 1 đã được yêu cầu vẽ mà không cần bấm; kiểm: fail vì chưa có component
- [x] 7.2 GREEN: `useStrokeAnimation` (`targetRef: RefObject<SVGGElement | null>`, tự phát một lần trong effect, cleanup `destroy`) + `StrokeOrderAnimation` (figure, `<g ref>` đích writer trong `<svg viewBox="0 0 1024 1024">`); tạo `assets/i18n/vi/stroke-order.json` (key `figureLabel`), thêm `'stroke-order'` vào `I18N_NAMESPACES` và `src/test/i18n.ts`; kiểm: test 7.1 pass
- [x] 7.3 RED: S6.1-AC1 "Chữ mờ nền hiện trong lúc vẽ" — lớp chữ mờ có đủ 6 path của 好 ngay khi mở, giữa chừng và khi xong; số nét đã vẽ ngay khi mở là 0, khi xong là 6 (không cộng lớp mờ); `<g>` đích writer nằm trong cùng `<svg>` với lớp mờ, sau các path mờ — kiểm: fail
- [x] 7.4 GREEN: `shared/components/StrokeGlyph.tsx` (variant `outline`, render `children` sau nhóm path) + `shared/utils/stroke.utils.ts` (`STROKE_VIEWBOX`, `STROKE_PATH_TRANSFORM`), `StrokeOrderAnimation` đặt `<g ref>` làm `children` của `StrokeGlyph`; kiểm: test 7.3 pass
- [x] 7.5 RED: S6.1-AC1 "Mỗi lúc chỉ vẽ một nét" — với 好, sau mỗi `finishStroke()` số nét tăng đúng 1 (1…6) và fake không bao giờ có hơn một nét đang vẽ — kiểm: fail
- [x] 7.6 GREEN: vòng lặp tuần tự `await animateStroke(i)` rồi tăng `drawnStrokeCount`; kiểm: test 7.5 pass
- [x] 7.7 RED: S6.1-AC1 "Nét hiện đúng thứ tự viết" — với 人, nét 0 (phẩy) xong trước khi nét 1 (mác) được yêu cầu; xong có 2 nét — kiểm: chạy, nếu pass ngay thì tạm đảo thứ tự lặp để thấy fail rồi trả lại
- [x] 7.8 GREEN: thứ tự theo chỉ số nét của dữ liệu; kiểm: test 7.7 pass
- [x] 7.9 RED: S6.1-AC1 "Số nét được vẽ bằng số nét của chữ" — 白 phát xong có đúng 5 nét, không có lần gọi vẽ nét thứ 6 — kiểm: fail nếu vòng lặp chưa dừng đúng, nếu pass ngay thì xác nhận bằng cách tạm đổi giới hạn vòng lặp
- [x] 7.10 GREEN: dừng đúng ở `strokes.length`; kiểm: test 7.9 pass
- [x] 7.11 RED: S6.1-AC1 "Animation chỉ tự phát một lần" — 人 phát xong, chạy hết timer giả/re-render: không có lượt phát mới, vẫn 2 nét — kiểm: fail nếu effect phát lại, nếu pass ngay thì tạm thêm dep sai để thấy fail rồi trả lại
- [x] 7.12 GREEN: effect chỉ phụ thuộc writer/dữ liệu; kiểm: test 7.11 pass
- [x] 7.13 RED: S6.1-AC2 "Có nút Phát lại bấm được" — có `button` tên "Phát lại", không `disabled`, cả khi đang phát và sau khi xong — kiểm: fail vì chưa có nút
- [x] 7.14 GREEN: nút `type="button"`, key `replay` trong `stroke-order.json`; kiểm: test 7.13 pass
- [x] 7.15 RED: S6.1-AC2 "Phát lại sau khi đã phát xong" — 人 xong, bấm "Phát lại": ngay sau bấm số nét 0 và lớp mờ vẫn còn; vẽ lại từ nét 0 rồi nét 1, xong có 2 nét — kiểm: fail
- [x] 7.16 GREEN: `replay()` (event handler): `runId` mới, `clear()`, đặt 0, phát lại; kiểm: test 7.15 pass
- [x] 7.17 RED: S6.1-AC2 "Phát lại khi đang phát" — 好 đang ở nét thứ 3, bấm "Phát lại": ngay sau bấm 0 nét; `finishStroke()` của lượt cũ không làm tăng số nét; lượt mới vẽ từ nét 0, xong có đúng 6 nét — kiểm: fail
- [x] 7.18 GREEN: bỏ kết quả của lượt cũ theo `runId`/`'cancelled'`; kiểm: test 7.17 pass
- [x] 7.19 RED: S6.1-AC2 "Phát lại nhiều lần" — 人, bấm "Phát lại" 3 lần, mỗi lần chờ xong: cả 3 lần thứ tự nét 0 rồi 1, xong 2 nét — kiểm: chạy, nếu pass ngay thì tạm bỏ `clear()` để thấy fail rồi trả lại
- [x] 7.20 GREEN: sửa đến khi pass; kiểm: test 7.19 pass, file test < 300 dòng (tách `StrokeOrderAnimation.replay.test.tsx` nếu vượt)

## 8. Thứ tự nét tĩnh — `shared/components/StrokeOrderStatic.tsx` + `core/hooks/useInitialReducedMotion.ts` (design D7, D9)

- [x] 8.1 RED: S6.1-AC1 "Giảm chuyển động hiện thứ tự nét tĩnh" (mức component) — render 白: ngay lập tức có 5 nét đậm và số 1…5 theo thứ tự nét, số đặt ở điểm đầu median; không có nút "Phát lại", fake hanzi-writer không được tạo — Vitest + Testing Library, `apps/web/src/app/shared/components/StrokeOrderStatic.test.tsx`; và `strokeLabelPoint` — `apps/web/src/app/shared/utils/stroke.utils.test.ts`; kiểm: fail vì chưa có component/hàm
- [x] 8.2 GREEN: `StrokeOrderStatic` (dùng `StrokeGlyph` variant `solid` + `<text>` số truyền qua `children`), `strokeLabelPoint`; kiểm: test 8.1 pass
- [x] 8.3 RED: `useInitialReducedMotion` đọc `matchMedia('(prefers-reduced-motion: reduce)')` một lần lúc mount, đổi media sau đó không đổi giá trị, thiếu `matchMedia` thì `false` — Vitest `renderHook`, stub `matchMedia`, `apps/web/src/app/core/hooks/useInitialReducedMotion.test.ts`; kiểm: fail vì chưa có hook
- [x] 8.4 GREEN: viết hook (`useState` initializer, không listener); kiểm: test 8.3 pass

## 9. Màn xem thứ tự nét — `pages/stroke-order/` (design D1, D8)

Test chung `apps/web/src/app/pages/stroke-order/containers/StrokeOrderContainer.test.tsx` — Vitest + Testing Library, `MemoryRouter` + route `characters/:character?/stroke-order` thật từ `stroke-order.routes.ts`, mock `fetch` bằng `src/test/mocks/stroke-fetch.ts` (tạo ở 9.1), fake hanzi-writer, stub `matchMedia`. Tách `StrokeOrderContainer.states.test.tsx` nếu > 300 dòng.

- [x] 9.1 RED: S6.1-AC1 "Màn chỉ hiện một chữ" — mở `/characters/好/stroke-order`: đúng một figure "Thứ tự nét chữ 好", không có figure/nút chuyển chữ khác — kiểm: fail vì chưa có route/màn
- [x] 9.2 GREEN: `ROUTE_PATHS.strokeOrder`, `stroke-order.routes.ts` (gom vào `page.routes.ts` trước `errorRoutes`), `useStrokeOrder`, `StrokeOrderContainer` (+ `StrokeOrderScreen` private, `key={character}`), key `title` trong `stroke-order.json`; kiểm: test 9.1 pass
- [x] 9.3 RED: S6.1-AC1 "Đang tải dữ liệu nét" — `fetch` file nét của 人 treo: thấy "Đang tải…", không có figure, không có nút "Phát lại" — kiểm: fail
- [x] 9.4 GREEN: nhánh `loading` (`role="status"`, key `loading`); kiểm: test 9.3 pass
- [x] 9.5 RED: S6.1-AC1 "Chữ không có dữ liệu nét" — mở 龘: thấy "Chưa có dữ liệu nét cho chữ này.", không figure, không "Phát lại", không "Có lỗi xảy ra" — kiểm: fail
- [x] 9.6 GREEN: nhánh `unavailable` (key `unavailable`); kiểm: test 9.5 pass
- [ ] 9.7 RED: S6.1-AC1 "Chữ được yêu cầu rỗng" — mở `/characters/stroke-order`: thông báo không có dữ liệu, không figure, không "Phát lại", không có request nét nào — kiểm: fail nếu route không khớp (rơi vào NotFound)
- [ ] 9.8 GREEN: segment tùy chọn `:character?`, `useParams().character ?? ''`; kiểm: test 9.7 pass
- [ ] 9.9 RED: S6.1-AC1 "Chữ được yêu cầu không phải chữ Hán" — mở `/characters/abc/stroke-order`: thông báo không có dữ liệu, không figure, không "Phát lại" — kiểm: chạy, nếu pass ngay nhờ 5.4 thì xác nhận bằng cách tạm cho container bỏ qua `unavailable` rồi trả lại
- [ ] 9.10 GREEN: sửa đến khi pass; kiểm: test 9.9 pass
- [ ] 9.11 RED: S6.1-AC1 "Chữ được yêu cầu gồm nhiều chữ" — mở `/characters/你好/stroke-order` (URL encode): thông báo không có dữ liệu, không figure, không "Phát lại", không có text/figure riêng của 你 hay 好 — kiểm: như 9.9
- [ ] 9.12 GREEN: tiêu đề không chèn chữ yêu cầu; kiểm: test 9.11 pass
- [ ] 9.13 RED: S6.1-AC1 "Tải dữ liệu nét lỗi" — `fetch` file nét của 人 trả HTTP 500 (và một case lỗi mạng): thấy "Có lỗi xảy ra" và nút "Thử lại"; không figure, không "Phát lại", không "Chưa có dữ liệu nét cho chữ này." — kiểm: fail
- [ ] 9.14 GREEN: nhánh `error` (`role="alert"`, `common:error.title`, nút `common:error.retry`); kiểm: test 9.13 pass
- [ ] 9.15 RED: S6.1-AC1 "Dữ liệu nét hỏng hoặc sai cấu trúc" — file nét của 人 là chuỗi không phải JSON, rồi JSON thiếu `strokes`: cả hai thấy "Có lỗi xảy ra" + "Thử lại", không figure, không "Phát lại" — kiểm: chạy, nếu pass ngay nhờ 4.2/5.12 thì xác nhận bằng cách tạm nuốt lỗi validate rồi trả lại
- [ ] 9.16 GREEN: sửa đến khi pass; kiểm: test 9.15 pass
- [ ] 9.17 RED: S6.1-AC1 "Thử lại sau khi tải lỗi" — lần 1 HTTP 500, bấm "Thử lại", lần 2 thành công: lỗi biến mất, có figure 人 và nút "Phát lại", tự phát và đạt 2 nét; thêm case lần 2 vẫn lỗi thì vẫn thấy "Có lỗi xảy ra" (TC-S6.1-AC1-28) — kiểm: fail
- [ ] 9.18 GREEN: `retry()` trong `useStrokeOrder` (tăng `attempt`, về `loading`); kiểm: test 9.17 pass
- [ ] 9.19 RED: S6.1-AC1 "Giảm chuyển động hiện thứ tự nét tĩnh" (mức màn) — stub `matchMedia` reduce, mở 白: thấy số 1…5, không có nút "Phát lại", hanzi-writer không được tạo — kiểm: fail
- [ ] 9.20 GREEN: `useStrokeOrder` trả `isReducedMotion` từ `useInitialReducedMotion`; container chọn `StrokeOrderStatic`/`StrokeOrderAnimation`; kiểm: test 9.19 pass
- [ ] 9.21 RED: S6.1-AC1 "Đổi giảm chuyển động khi đang ở màn" — mở 人 (reduce tắt), đổi stub sang reduce và phát sự kiện `change`: vẫn có figure animation + "Phát lại"; unmount rồi mở lại 人: hiện tĩnh 1…2, không "Phát lại"; thêm case điều hướng 人 → 龘 → 人 trong cùng router cho thấy mỗi lần đổi chữ là mở màn mới — kiểm: chạy, nếu pass ngay thì tạm thêm listener `change` vào hook để thấy fail rồi trả lại
- [ ] 9.22 GREEN: sửa đến khi pass; kiểm: test 9.21 pass

## 10. Giao diện — `styles/tailwind/` (design D10)

- [ ] 10.1 `apps/web/src/styles/tailwind/components/_stroke-order.css` (BEM gạch ngang: `.stroke-order-figure`, `-outline`, `-stroke` (path tĩnh của app, `fill`), `-writer` (chỉ `.stroke-order-writer path { stroke: var(--color-…); }`, **không** đụng `fill`, `stroke-width`, `stroke-dasharray`/`dashoffset`, `clip-path` của hanzi-writer), `-label`, `-message`), import trong `main.css`, biến thể tối trong `themes/_dark.css` (màu `stroke` đổi theo theme); JSX chỉ layout/spacing (§6); contrast ≥ 4.5:1 cho chữ, ≥ 3:1 cho nét/lớp mờ; focus thấy rõ trên "Phát lại"/"Thử lại" — ngoại lệ test-first: CSS thuần; kiểm: `pnpm --filter @csk/web test:run tokens` pass, xem preview `web-dev` ở 375×812 và 1280×800, sáng và tối, với 好 (nét hiện dần theo animation, không tô khối tức thì; nét trùng khít chữ mờ khi đổi kích thước cửa sổ), 白 (giảm chuyển động), 龘, lỗi tải

## 11. Luồng thật và offline — e2e Playwright (`apps/web/e2e/E6/`)

E2E viết sau nhóm 9 sẽ chạy trên màn đã có: với mỗi RED, nếu pass ngay thì tạm đổi route/hành vi để thấy fail rồi trả lại (như S3.1). Chỉ kiểm trạng thái ổn định bằng `expect.poll` trên `data-drawn-stroke-count`, mỗi `expect.poll` chờ số nét có `timeout: strokePollTimeout(strokeCount)` (`5_000 + strokeCount * 1_000` ms, design "Test") vì hanzi-writer thật vẽ mỗi nét ~0,3–0,7 s. Case chặn/làm chậm/thay phản hồi dùng `test.use({ serviceWorkers: 'block' })` + `page.route`.

- [ ] 11.1 RED: `apps/web/e2e/E6/s6.1-stroke-order.spec.ts`, `test.describe('S6.1 Xem thứ tự nét')`, các test online theo cột `e2e` của test-cases: S6.1-AC1 "Chữ hiện animation và tự phát khi mở" (TC-AC1-2), "Số nét được vẽ bằng số nét của chữ" (AC1-10, 11), "Animation chỉ tự phát một lần" (AC1-12), "Màn chỉ hiện một chữ" (AC1-14), "Chữ không có dữ liệu nét" (AC1-15), "Chữ được yêu cầu rỗng" (AC1-18), "…không phải chữ Hán" (AC1-19), "…gồm nhiều chữ" (AC1-20), "Đang tải dữ liệu nét" (AC1-21), "Tải dữ liệu nét lỗi" (AC1-22), "Dữ liệu nét hỏng hoặc sai cấu trúc" (AC1-25, 26), "Thử lại sau khi tải lỗi" (AC1-27), "Giảm chuyển động hiện thứ tự nét tĩnh" (AC1-31, `emulateMedia`), "Đổi giảm chuyển động khi đang ở màn" (AC1-35); S6.1-AC2 "Có nút Phát lại bấm được" (AC2-1, 5), "Phát lại sau khi đã phát xong" (AC2-9), "Phát lại khi đang phát" (AC2-11, 12), "Phát lại nhiều lần" (AC2-13); kiểm: `pnpm e2e` fail đúng lý do
- [ ] 11.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass, đặc biệt adapter hanzi-writer thật (huỷ lượt cũ, đếm nét); kiểm: `pnpm e2e` pass
- [ ] 11.3 RED: S6.1-AC1 "Xem animation khi offline" (TC-AC1-29) — `apps/web/e2e/E6/s6.1-stroke-order-offline.spec.ts`, mẫu `openOnceWithServiceWorker` của `e2e/E1/s1.2-offline.spec.ts`, không mở màn nét trước khi tắt mạng; 人 phát đủ 2 nét, không "Có lỗi xảy ra"/"Chưa có dữ liệu nét cho chữ này."; kiểm: thấy fail (tạm loại `strokes/` khỏi precache nếu pass ngay) rồi trả lại
- [ ] 11.4 GREEN: bảo đảm `content/strokes/*.json` và `index.json` trong precache (glob hiện có); kiểm: test 11.3 pass
- [ ] 11.5 RED: S6.1-AC1 "Mọi chữ có dữ liệu nét đều xem được khi offline" (TC-AC1-37) — trong `s6.1-stroke-order-offline.spec.ts`: lúc nạp file đọc `apps/web/src/assets/content/strokes/index.json` và parse bằng `strokeIndexSchema`, sinh **một test cho mỗi chữ** (tên chứa ID và chữ); một test chặn lệch: `/content/strokes/index.json` của bản build (qua `request`) bằng đúng danh sách đó; mỗi test chữ đọc số nét từ file nét của bản build **trước** khi tắt mạng (qua `request`, không qua trang), rồi offline mở chữ đó, `expect.poll` `data-drawn-stroke-count` bằng số nét với `timeout: strokePollTimeout(số nét)`; kiểm: thấy fail như 11.3 rồi trả lại
- [ ] 11.6 GREEN: sửa đến khi pass; kiểm: test 11.5 pass
- [ ] 11.7 RED: S6.1-AC1 "Chữ không có dữ liệu nét khi offline" (TC-AC1-38) — offline mở 龘: "Chưa có dữ liệu nét cho chữ này.", không "Có lỗi xảy ra", không "Thử lại", không figure, không "Phát lại"; kiểm: thấy fail (tạm cho service fetch file nét trước khi xét danh sách nếu pass ngay) rồi trả lại
- [ ] 11.8 GREEN: sửa đến khi pass; kiểm: test 11.7 pass

## 12. Tài liệu và kiểm tra

- [ ] 12.1 Cập nhật `docs/03-architecture.md`: cây `pages/stroke-order`, `strokes/index.json` trong danh sách output nội dung, adapter `stroke-writer.service` + `useStrokeAnimation`, i18n `stroke-order.json`, route `/characters/:character?/stroke-order` — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 12.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, dependency một chiều, file < 300 dòng, component < 5 props, effect có cleanup); kiểm: `pnpm lint` sạch
- [ ] 12.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 12.4 Chụp screenshot cho PR: màn 好 (đang/đã phát), 白 giảm chuyển động, 龘, lỗi tải — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets`
- [ ] 12.5 Ghi vào mô tả PR code cho QA: địa chỉ mẫu `/characters/<chữ>/stroke-order`, địa chỉ không chỉ định chữ `/characters/stroke-order`, mẫu URL tải dữ liệu nét `/content/strokes/<chữ>.json` và `/content/strokes/index.json` (theo `test-cases.md` Ghi chú); kiểm: mô tả PR có đủ ba mục

## Workflow follow-up

- PR code ghi `Spec PR: #118`, References `Closes #34` khi đủ AC1–AC2.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
