# Design system & font: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa token màu, font và style nền của spec vào `apps/web`, kèm script cắt font chữ Hán, tập ký tự pinyin và artifact Design System để tra cứu.

**Architecture:** `apps/web/src/styles/tokens.css` là nguồn duy nhất của giá trị màu, dưới dạng biến `--csk-*` cho sáng và tối. `@theme inline` ánh xạ các biến này sang Tailwind. Test đọc trực tiếp `tokens.css` để kiểm tra độ tương phản. Font Latin tự host qua Fontsource. LXGW WenKai được cắt theo nội dung bằng một script trong `content/`.

**Tech Stack:** Tailwind CSS v4, Vite 6, Vitest, `@fontsource/quicksand`, `@fontsource/baloo-2`, `subset-font`, tsx.

**Spec:** [docs/04-specs/2026-11-04-design-system.md](2026-11-04-design-system.md)

## Global Constraints

- Mọi giá trị màu lấy đúng từ bảng §3 của spec. Không tự thêm màu.
- Chữ/nền ≥ 4.5:1. `border-strong` trên `surface` ≥ 3:1. Áp dụng cho cả sáng lẫn tối.
- Quicksand chỉ dùng độ đậm 500, 600, 700. Baloo 2 chỉ dùng 500.
- Không request nào ra `fonts.googleapis.com` hay `fonts.gstatic.com` lúc chạy.
- Theo CLAUDE.md: không `any`, không `as` lên dữ liệu ngoài, không `eslint-disable`. File < 300 dòng. Utility thuần đặt ở `shared/utils/*.utils.ts`.
- `className` trong JSX chỉ dùng utility layout/spacing. Màu và font đi qua `@apply` trong class BEM (§6 CLAUDE.md).
- Commit message không có dòng `Co-Authored-By` (theo yêu cầu người dùng). Làm trên nhánh `feat/design-system`, không làm trên `main`.

## Review Focus

1. **Hai khối dark trong `tokens.css` lệch nhau.** Khối `@media (prefers-color-scheme: dark)` và khối `[data-theme="dark"]` phải giống hệt nhau. Nếu chỉ sửa một khối, chế độ tối sẽ khác nhau tùy cách người dùng bật. Task 1 có test so sánh hai khối.
2. **Fontsource kéo theo subset thừa.** Baloo 2 có subset Devanagari rất nặng. Nếu import CSS gộp, sau này PWA sẽ precache cả những file đó. Task 2 kiểm tra trong `dist/` chỉ có các file woff2 mong đợi.
3. **Pinyin viết hoa hoặc dùng dấu kết hợp (NFD).** `Lǚ` hoặc `u + ̈ + ̌` phải được coi là hợp lệ như dạng dựng sẵn. Task 3 có test cho cả hai dạng.
4. **Chưa có nội dung.** `apps/web/src/assets/content/` đang trống. Script cắt font vẫn phải chạy và ra font chứa tập chữ giao diện cố định, không được lỗi. Task 4 có test cho trường hợp này.
5. **Chữ Hán trong JSON lồng sâu hoặc nằm trong key.** Hàm gom chữ phải duyệt mọi giá trị chuỗi ở mọi độ sâu, bỏ qua key. Task 4 có test với object lồng nhau.

---

### Task 0: Nhánh làm việc và commit spec

- [ ] **Step 1:** `git switch -c feat/design-system`
- [ ] **Step 2:** Commit spec và plan:

```bash
git add docs/04-specs/2026-11-04-design-system.md docs/04-specs/2026-11-04-design-system-plan.md
git commit -m "docs: add design system spec and plan"
```

---

### Task 1: Token màu, ánh xạ Tailwind và test độ tương phản

**Files:**
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/app/shared/utils/color.utils.ts`
- Create: `apps/web/src/app/shared/utils/color.utils.test.ts`
- Create: `apps/web/src/styles/tokens.test.ts`
- Modify: `apps/web/src/index.css`

**Interfaces:**
- Produces: `contrastRatio(foreground: string, background: string): number`. Nhận hex `#RRGGBB`, trả tỉ lệ WCAG 2.1. Hex sai định dạng thì throw `Error`.
- Produces: `parseCssVars(css: string, selector: string): Record<string, string>`. Trả về các biến `--csk-*` trong khối đầu tiên khớp đúng `selector`, key bỏ tiền tố `--csk-`.
- Produces: biến CSS `--csk-<token>` cho mọi token ở §3 spec (`bg`, `surface`, `sunken`, `border`, `border-strong`, `text`, `text-muted`, `disabled`, `accent`, `accent-hover`, `accent-soft`, `on-accent`, `highlight`, `success`, `success-soft`, `success-text`, `danger`, `danger-soft`, `danger-text`, `warning`, `warning-soft`, `warning-text`, `tone-1`…`tone-5`).
- Produces: tên trong Tailwind (`@theme inline`). Màu: `bg`, `surface`, `sunken`, `line`, `line-strong`, `fg`, `fg-muted`, `disabled`, `accent`, `accent-hover`, `accent-soft`, `on-accent`, `highlight`, `success*`, `danger*`, `warning*`, `tone-1`…`tone-5`. Đổi `border` → `line` và `text` → `fg` để tránh class `border-border`, `text-text`. Spacing `xs` 4px … `3xl` 48px. Radius `sm` 6px, `md` 8px, `lg` 12px, `full`. Cỡ chữ theo §4.2 (`--text-caption` kèm `--text-caption--line-height`…). Font `--font-ui`, `--font-pinyin`, `--font-hanzi`, `--font-hanzi-display` theo §4.1. Thời gian chuyển động `--duration-fast: 150ms`, `--duration-base: 250ms`, `--ease-standard: cubic-bezier(.2,.7,.2,1)`.

- [ ] **Step 1: Viết test cho `contrastRatio`** trong `color.utils.test.ts`:
  - `contrastRatio('#000000', '#FFFFFF')` ≈ 21, `toBeCloseTo(21, 1)`.
  - `contrastRatio('#FFFFFF', '#FFFFFF')` = 1.
  - Không phụ thuộc thứ tự: `contrastRatio('#315C50', '#FFFFFF') === contrastRatio('#FFFFFF', '#315C50')`, ≈ 7.56 (`toBeCloseTo(7.56, 2)`).
  - `contrastRatio('red', '#FFFFFF')` throw.
- [ ] **Step 2:** `pnpm --filter @csk/web exec vitest run src/app/shared/utils/color.utils.test.ts`, mong đợi FAIL (chưa có module).
- [ ] **Step 3: Viết `contrastRatio`** theo công thức relative luminance của WCAG 2.1 (ngưỡng tuyến tính 0.03928).
- [ ] **Step 4:** Chạy lại test, mong đợi PASS.
- [ ] **Step 5: Viết `tokens.css`** theo cấu trúc sau, giá trị lấy từ §3 spec:

```css
:root { color-scheme: light; --csk-bg: #F6F5EF; /* …mọi token sáng */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { color-scheme: dark; /* …mọi token tối */ }
}
:root[data-theme='dark'] { color-scheme: dark; /* …giống hệt khối trên */ }
@theme inline { --color-bg: var(--csk-bg); /* …ánh xạ, spacing, radius, text, font, motion */ }
```

  Đặt `parseCssVars` ngay trong `tokens.test.ts`. Hàm chỉ dùng cho test, không đưa vào `src/app`.
- [ ] **Step 6: Viết `tokens.test.ts`**. Đọc file bằng `readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')`, rồi kiểm tra:
  - `light = parseCssVars(css, ':root')`, `darkMedia = parseCssVars(css, ':root:not([data-theme=\'light\'])')`, `darkAttr = parseCssVars(css, ':root[data-theme=\'dark\']')`.
  - `expect(darkMedia).toEqual(darkAttr)` (Review Focus 1).
  - `expect(Object.keys(darkAttr).sort()).toEqual(Object.keys(light).sort())`: không token nào chỉ có ở một chế độ.
  - `it.each` qua `['light', 'dark']` × các cặp chữ/nền: `text|bg`, `text|surface`, `text-muted|bg`, `text-muted|surface`, `on-accent|accent`, `accent|surface`, `text|accent-soft`, `success-text|success-soft`, `danger-text|danger-soft`, `warning-text|warning-soft`, `danger|surface`, `tone-1..5|bg`, `tone-1..5|surface`. Mỗi cặp `≥ 4.5`.
  - `border-strong|surface ≥ 3` ở cả hai chế độ.
  - `light.bg === '#F6F5EF'`, `light.accent === '#315C50'`, `light.text === '#252D29'`: bảng màu Jade không bị đổi nhầm.
- [ ] **Step 7:** Chạy `pnpm --filter @csk/web exec vitest run src/styles`, mong đợi PASS. Nếu một cặp fail thì spec sai: dừng lại và báo, không tự đổi màu.
- [ ] **Step 8:** Sửa `index.css`: `@import 'tailwindcss';` rồi `@import './styles/tokens.css';`.
- [ ] **Step 9:** `pnpm --filter @csk/web build`, mong đợi build thành công. `grep -o 'csk-accent' apps/web/dist/assets/*.css` có kết quả.
- [ ] **Step 10:** Commit `feat(web): add Jade design tokens and contrast tests`.

---

### Task 2: Font Latin tự host và style nền

**Files:**
- Modify: `pnpm-workspace.yaml` (catalog), `apps/web/package.json`
- Create: `apps/web/src/styles/fonts.css`
- Create: `apps/web/src/styles/base.css`
- Modify: `apps/web/src/index.css`, `apps/web/src/index.html`
- Create: `apps/web/scripts/check-fonts.mjs`
- Modify: `docs/03-architecture.md` (§3.2: thêm `src/styles/`), `CLAUDE.md` (§1: thêm dòng "Token, font, style nền → `apps/web/src/styles/`")

**Interfaces:**
- Consumes: biến `--csk-*` và token Tailwind từ Task 1.
- Produces: class `.pinyin`, `.pinyin.is-plain`, `.tone-1`…`.tone-5`. Selector `:lang(zh)` áp `font-hanzi`. `@font-face` tên `'LXGW WenKai'` trỏ tới `/fonts/lxgw-wenkai.subset.woff2` (file do Task 4 tạo).

- [ ] **Step 1:** Thêm vào catalog `'@fontsource/quicksand': ^5.2.0` và `'@fontsource/baloo-2': ^5.2.0`. Thêm cả hai vào `dependencies` của `@csk/web` với `catalog:`. Chạy `pnpm install`.
- [ ] **Step 2:** Xem `node_modules/@fontsource/quicksand/` có các file CSS theo subset riêng hay không (ví dụ `vietnamese-500.css`).
  - Nếu có, `fonts.css` chỉ import: Quicksand `latin`, `latin-ext`, `vietnamese` × 500/600/700; Baloo 2 `latin`, `latin-ext` × 500.
  - Nếu không có, tự viết `@font-face` trỏ vào `@fontsource/<pkg>/files/<name>-<subset>-<weight>-normal.woff2`, copy `unicode-range` từ CSS gốc của Fontsource.
  - Thêm `@font-face` cho `'LXGW WenKai'`, `font-display: swap`, src `url('/fonts/lxgw-wenkai.subset.woff2') format('woff2')`.
- [ ] **Step 3:** Viết `base.css`:
  - `body`: nền `bg`, chữ `fg`, `font-ui`, cỡ `body`, độ đậm 500.
  - `:lang(zh)`: áp `font-hanzi`.
  - `.pinyin`: áp `font-pinyin`, độ đậm 500. `.tone-N`: màu `tone-N`. `.pinyin.is-plain .tone-N`: màu `fg`.
  - `:focus-visible`: viền ngoài 2px màu `accent`, cách 2px.
  - `@media (prefers-reduced-motion: reduce)`: đặt `*, *::before, *::after` về `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important`.
  - Màu viết bằng `@apply` hoặc `var(--color-*)`, không viết hex trực tiếp.
- [ ] **Step 4:** `index.css` import theo thứ tự `tailwindcss` → `tokens` → `fonts` → `base`. Thêm vào `index.html`: `<meta name="theme-color" content="#F6F5EF" media="(prefers-color-scheme: light)">` và bản `#141A17` cho dark.
- [ ] **Step 5: Viết `check-fonts.mjs`** (Node, không dependency). Script đọc `apps/web/dist`:
  - Fail (exit 1) nếu bất kỳ file `.css`, `.js` hay `.html` nào chứa `fonts.googleapis.com` hoặc `fonts.gstatic.com`.
  - Fail nếu có file `.woff2` mà tên chứa `devanagari`, `cyrillic`, `greek` hoặc `math` (Review Focus 2).
  - Fail nếu không có file `.woff2` nào chứa `quicksand` hoặc không có file nào chứa `baloo-2`.

  Thêm script `"check:fonts": "node scripts/check-fonts.mjs"` vào `apps/web/package.json`.
- [ ] **Step 6:** `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`, mong đợi exit 0.
- [ ] **Step 7:** `pnpm lint && pnpm typecheck`, mong đợi pass.
- [ ] **Step 8:** Cập nhật 2 tài liệu như mục Files, rồi commit `feat(web): self-host Quicksand and Baloo 2, add base styles`.

---

### Task 3: Tập ký tự pinyin

**Files:**
- Create: `packages/shared/src/pinyin.charset.ts`
- Create: `packages/shared/src/pinyin.charset.test.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: `PINYIN_CHARSET: ReadonlySet<string>`. Gồm a–z, A–Z, các nguyên âm có dấu thanh `āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü` cùng dạng viết hoa, khoảng trắng, `'`, `-`, và dấu câu `, . ? ! ; :`. Đây là tập ký tự đã xác nhận Baloo 2 có đủ (§2 spec).
- Produces: `findUnsupportedPinyinChars(text: string): string[]`. Chuẩn hóa NFC trước khi so, trả về danh sách ký tự không thuộc tập, không trùng lặp, giữ thứ tự xuất hiện. Hàm sẽ được `content-check` (E2) gọi.

- [ ] **Step 1: Viết test:**
  - `findUnsupportedPinyinChars('nǐ hǎo, lǜsè. Lǚyóu!')` → `[]`.
  - `findUnsupportedPinyinChars('Ǚ Ǜ Ā')` → `[]`.
  - Dạng NFD: `findUnsupportedPinyinChars('lǚ')` → `[]` (Review Focus 3).
  - `findUnsupportedPinyinChars('nǐ hǎo 你')` → `['你']`.
  - `findUnsupportedPinyinChars('ê ŋ ê')` → `['ê', 'ŋ']`.
- [ ] **Step 2:** `pnpm --filter @csk/shared test:run`, mong đợi FAIL.
- [ ] **Step 3:** Viết code, export từ `index.ts`.
- [ ] **Step 4:** Chạy lại, mong đợi PASS.
- [ ] **Step 5:** Commit `feat(shared): add pinyin charset check`.

---

### Task 4: Script cắt LXGW WenKai theo nội dung

**Files:**
- Create: `content/data-raw/fonts/LXGWWenKai-Regular.ttf`, `content/data-raw/fonts/LICENSE` (OFL 1.1, lấy từ release chính thức của `lxgw/LxgwWenKai` trên GitHub)
- Create: `content/scripts/font-subset/collectHanzi.ts`
- Create: `content/scripts/font-subset/collectHanzi.test.ts`
- Create: `content/scripts/font-subset/uiHanzi.ts`
- Create: `content/scripts/font-subset/index.ts`
- Modify: `pnpm-workspace.yaml` (catalog `subset-font: ^2.4.0`), `content/package.json`
- Output: `apps/web/src/assets/fonts/lxgw-wenkai.subset.woff2` (được commit, giống JSON nội dung)

**Interfaces:**
- Consumes: không có.
- Produces: `collectHanzi(values: readonly unknown[]): string`. Duyệt đệ quy mọi giá trị chuỗi trong mảng và object lồng nhau, bỏ qua key. Giữ ký tự thuộc `\p{Script=Han}`, trả chuỗi không trùng lặp, sắp theo code point.
- Produces: `UI_HANZI: string`. Chữ Hán dùng cố định trong giao diện: `中文汉字拼音你好学习`. Hiện chưa có chuỗi i18n tiếng Trung nào.
- Produces: lệnh `pnpm --filter @csk/content font:subset`.

- [ ] **Step 1: Viết test cho `collectHanzi`:**
  - `collectHanzi([])` → `''` (Review Focus 4).
  - `collectHanzi([{ a: '你好', b: [{ c: '好学' }] }, '中文 nǐ'])` → `'中你好学文'` sắp theo code point. Viết kỳ vọng bằng `[...'中你好学文'].sort().join('')` (Review Focus 5).
  - `collectHanzi([{ '汉': 'x' }])` → `''`: key bị bỏ qua.
  - `collectHanzi([42, null, true, '。，'])` → `''`: không phải chuỗi thì bỏ qua, dấu câu tiếng Trung không tính.
- [ ] **Step 2:** `pnpm --filter @csk/content test:run`, mong đợi FAIL.
- [ ] **Step 3:** Viết `collectHanzi`. Mọi giá trị đều là `unknown`, thu hẹp kiểu bằng `typeof` và `Array.isArray`, không dùng `as`.
- [ ] **Step 4:** Chạy lại, mong đợi PASS.
- [ ] **Step 5: Viết `index.ts`:**
  - Đọc mọi `*.json` trong `apps/web/src/assets/content/` bằng `JSON.parse`, ra `unknown`.
  - `text = UI_HANZI + collectHanzi(parsed)`.
  - `subsetFont(readFileSync(ttf), text, { targetFormat: 'woff2' })`, ghi ra `apps/web/src/assets/fonts/lxgw-wenkai.subset.woff2`.
  - In ra số chữ và kích thước file (KB).

  Thêm `"font:subset": "tsx scripts/font-subset/index.ts"` vào `content/package.json`, thêm `subset-font` vào `devDependencies` với `catalog:`.
- [ ] **Step 6:** Tải font và LICENSE vào `content/data-raw/fonts/`, chạy `pnpm install && pnpm --filter @csk/content font:subset`. Mong đợi ra file woff2 < 100 KB, vì chưa có nội dung nên chỉ có 10 chữ của `UI_HANZI`.
- [ ] **Step 7:** `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`. Mong đợi `dist/fonts/lxgw-wenkai.subset.woff2` tồn tại, exit 0.
- [ ] **Step 8:** Ghi vào `docs/03-architecture.md` (sơ đồ pipeline): `font-subset` chạy sau `content-build`.
- [ ] **Step 9:** Commit `feat(content): subset LXGW WenKai from content`.

**Lưu ý:** spec §8 yêu cầu báo lỗi khi font gốc thiếu chữ. `subset-font` không cho biết chữ nào bị thiếu, và muốn đọc bảng mã font thì phải thêm dependency (ví dụ `fontkit`), vốn chưa được đồng ý. LXGW WenKai phủ hơn 20.000 chữ Hán, gồm toàn bộ chữ HSK, nên **bước kiểm tra này để lại đến khi có nội dung HSK 1 (E7)**. Plan này không làm.

---

### Task 5: Artifact Design System

Đây không phải code mà là artifact Claude Design. Làm sau Task 1–4 để giá trị trong artifact khớp với code.

- [ ] **Step 1:** Tạo artifact từ type Design System (`type_url` https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd), title `Chinese Starter Kit`, rồi làm theo hướng dẫn mà type đó trả về.
- [ ] **Step 2:** Đưa vào artifact:
  - README: hướng A, bảng Jade, lý do chọn font, quy tắc dùng màu.
  - Token: màu sáng và tối từ `tokens.css`, thang cỡ chữ, khoảng cách, bo góc, chuyển động.
  - Font: Quicksand và Baloo 2 lấy từ Google Fonts (artifact chỉ cho tải font từ đó), LXGW WenKai dùng font Khải của hệ thống làm dự phòng.
  - Component có bản xem trực tiếp theo bảng §6 spec, kèm tên class BEM.
- [ ] **Step 3:** Xem bản xem trước một lần ở cả sáng và tối, sửa nếu có lỗi, rồi publish. Gửi link cho người dùng.

---

### Task 6: Kiểm tra toàn bộ

- [ ] `pnpm typecheck && pnpm lint && pnpm test:run`, cả 3 đều pass.
- [ ] `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`, exit 0.
- [ ] `pnpm dev`, mở trang ở trình duyệt. Tab Network chỉ có font tải từ localhost. Khi bật chế độ tối của hệ điều hành, nền chuyển sang `#141A17`.
