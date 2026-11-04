# 04 · Spec: Design system & font

> Trạng thái: **Chờ duyệt** · Ngày: 2026-11-04
> Liên quan: [Brainstorm](../01-brainstorm.md) · [Architecture](../03-architecture.md) · [Roadmap](../02-design/roadmap.md)

## 1. Mục tiêu

Chốt nền giao diện **trước khi làm E1**: màu, font, cỡ chữ, khoảng cách, bo góc và trạng thái
của các component cơ bản. Kết quả gồm:

1. Một **artifact Design System** (Claude Design) để xem và tra cứu, có bản xem trực tiếp
   ở chế độ sáng và tối.
2. **Token và font chạy được trong `apps/web`**: Tailwind v4, chạy offline trong PWA.

Tiêu chí xong:
- Artifact hiển thị đúng cả 3 loại chữ (tiếng Việt, pinyin, chữ Hán) ở 2 chế độ màu.
- App build ra có font tự host, chạy được khi offline.
- Typecheck, lint và test đều pass.

## 2. Các quyết định đã chốt

| Chủ đề | Quyết định | Lý do |
|---|---|---|
| Phong cách | **A · Bàn học**: tĩnh, tập trung, chữ Hán là nhân vật chính | Học 30–60 phút mỗi ngày, cần ít gây mỏi mắt |
| Bảng màu | **Personal Jade Palette**: nền ngà, chữ mực, màu nhấn xanh ngọc, điểm vàng | Người dùng chọn (§3) |
| Chữ Hán cỡ lớn | **Khải thư (LXGW WenKai)** trên thẻ từ, đáp án và phần tập viết | Gần nét viết tay, dễ nhận ra thứ tự nét |
| Chữ Hán cỡ nhỏ | **Font hệ thống** (PingFang SC, Noto Sans CJK SC, Microsoft YaHei) | Không tốn dung lượng, nét chuẩn khi có `lang="zh-CN"` |
| Font giao diện | **Quicksand**, chữ chính tối thiểu độ đậm 500 | Mềm, thân thiện. Ở độ đậm 400 nét quá mảnh trên điện thoại |
| Font pinyin | **Baloo 2** | Quicksand thiếu ǖ ǘ ǚ ǜ. Baloo 2 có đủ và cũng bo tròn |
| Cách đưa font vào app | Tự host Quicksand và Baloo 2, cắt LXGW WenKai theo nội dung, chữ Hán cỡ nhỏ dùng font hệ thống | Nhẹ nhất mà vẫn chạy offline hoàn toàn |

**Kết quả kiểm tra bảng mã font (2026-11-04)**, với tập ký tự `āáǎàǐǒǔǖǘǚǜüǕǗǙǛệữ`:

| Font | Ký tự thiếu |
|---|---|
| Baloo 2, Noto Sans | không thiếu |
| Quicksand, Lexend | ǖǘǚǜǕǗǙǛ |
| Nunito, Mulish | ǐǒ và ǖǘǚǜǕǗǙǛ |
| Be Vietnam Pro, Varela Round | ǎǐǒǔ và ǖǘǚǜǕǗǙǛ |

## 3. Token màu

Mỗi token có giá trị sáng và tối. Chế độ tối áp dụng theo `prefers-color-scheme`, trừ khi có
`[data-theme="light"]`. Có `[data-theme="dark"]` thì luôn dùng chế độ tối.

Bảng màu gốc: **Personal Jade Palette** do người dùng cung cấp (2026-11-04):

| Tên | Hex | Vai trò trong hệ thống |
|---|---|---|
| Forest | `#315C50` | `accent` (sáng) |
| Sage | `#91A99A` | `disabled`, trang trí. **Không dùng cho chữ** (2.3:1) |
| Mist | `#DCE6DE` | `success-soft`, rãnh thanh tiến độ |
| Ivory | `#F6F5EF` | `bg` (sáng) |
| Paper | `#FFFFFF` | `surface` (sáng), `on-accent` |
| Ink | `#252D29` | `text` (sáng) |
| Gold | `#BEA16A` | `warning`, `highlight` (streak, thành tích). **Không dùng cho chữ** (2.3:1) |
| Muted | `#858C86` | `border-strong` (sáng). Chữ phụ dùng bản đậm hơn `#5E6660` vì Muted chỉ đạt 3.2:1 |
| Border | `#E5E7E0` | `border` (sáng) |

Các token còn lại và toàn bộ chế độ tối được suy ra từ bảng gốc, cùng sắc độ ngọc và mực.

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `bg` | `#F6F5EF` | `#141A17` | nền trang |
| `surface` | `#FFFFFF` | `#1C2420` | thẻ, ô nhập |
| `sunken` | `#EEEDE5` | `#0F1411` | vùng lõm, nền nút bị vô hiệu |
| `border` | `#E5E7E0` | `#2C3631` | viền mảnh |
| `border-strong` | `#858C86` | `#6E7972` | viền ô nhập, nút phụ (đạt 3:1 cho thành phần giao diện) |
| `text` | `#252D29` | `#ECEEE6` | chữ chính |
| `text-muted` | `#5E6660` | `#A3ADA6` | chữ phụ, placeholder |
| `disabled` | `#91A99A` | `#56605A` | chữ của control bị vô hiệu |
| `accent` | `#315C50` | `#8CC3AE` | nút chính, focus, tiến độ |
| `accent-hover` | `#264A40` | `#A5D3C1` | hover nút chính |
| `accent-soft` | `#E8EFEA` | `#1A2C25` | đáp án đang chọn, nút tròn biểu tượng, vòng focus |
| `on-accent` | `#FFFFFF` | `#141A17` | chữ trên nút chính |
| `highlight` | `#BEA16A` | `#D6BC86` | streak, huy hiệu (chỉ trang trí) |
| `success` / `success-soft` / `success-text` | `#315C50` / `#DCE6DE` / `#1F4238` | `#8CC3AE` / `#1F3A30` / `#A9DCC5` | đáp án đúng |
| `danger` / `danger-soft` / `danger-text` | `#B23B2C` / `#F8E3DE` / `#8A2A1E` | `#F08A7A` / `#43221C` / `#FFC2B8` | đáp án sai, nút nguy hiểm |
| `warning` / `warning-soft` / `warning-text` | `#BEA16A` / `#F4ECD9` / `#6B5020` | `#D6BC86` / `#382D17` / `#E9D3A3` | offline, cảnh báo |
| `tone-1` | `#B23B2C` | `#F08A7A` | thanh 1 · đỏ gạch |
| `tone-2` | `#8A5C0E` | `#E2B45C` | thanh 2 · vàng đất |
| `tone-3` | `#2C6491` | `#86B8E6` | thanh 3 · xanh lam |
| `tone-4` | `#7A4789` | `#C49AD6` | thanh 4 · tím mận |
| `tone-5` | `#646B66` | `#A0A8A2` | thanh nhẹ · xám |

Quy tắc:
- Mọi cặp chữ/nền dùng cho chữ phải đạt độ tương phản **≥ 4.5:1**, có test tự động kiểm tra (§8).
  Màu thanh điệu được kiểm tra trên `bg`, `surface`, `accent-soft` (đáp án đang chọn) và `sunken`.
  `tone-2` sáng đổi từ `#93630F` sang `#8A5C0E` (2026-11-04) vì bản cũ chỉ đạt 4.46:1 trên
  `accent-soft`. Thấp nhất hiện là 4.66:1 (`tone-5` trên `sunken`) ở chế độ sáng và 6.02:1 ở
  chế độ tối. Viền ô nhập (`border-strong` trên `surface`) đạt 3.45:1 ở chế độ sáng và 3.51:1 ở
  chế độ tối (WCAG 1.4.11 yêu cầu ≥ 3:1). `disabled` không cần đạt ngưỡng theo WCAG.
- **Màu thanh điệu không có màu xanh lá**, để không trùng với `accent` và `success` (đều là ngọc).
- **Phản hồi đúng/sai không bao giờ chỉ là màu chữ.** Luôn là dải nền `*-soft`, kèm biểu tượng
  ✓/✗ và chữ. Pinyin bên trong dải phản hồi dùng `*-text`, không tô theo thanh. Lý do: thanh 1
  trùng màu với `danger`.
- Đáp án "đang chọn" (`accent-soft`) và "đúng" (`success-soft`) cùng tông ngọc. Phân biệt bằng
  biểu tượng ✓ và việc trạng thái "đúng" chỉ xuất hiện sau khi bấm Kiểm tra.
- Tô màu thanh điệu bật/tắt được trong Cài đặt, mặc định bật. Cài đặt này **làm cùng màn hình
  Cài đặt**, không thuộc spec này. Spec này chỉ đặt sẵn class `.pinyin.is-plain` để tắt màu.

## 4. Font và thang cỡ chữ

### 4.1 Font stack

| Token | Stack |
|---|---|
| `font-ui` | `'Quicksand', ui-rounded, system-ui, sans-serif` |
| `font-pinyin` | `'Baloo 2', 'Quicksand', system-ui, sans-serif` |
| `font-hanzi` | `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif` |
| `font-hanzi-display` | `'LXGW WenKai', 'Kaiti SC', 'STKaiti', 'KaiTi', <font-hanzi>` |

- `:lang(zh)` tự áp `font-hanzi`. Mọi chữ Hán phải nằm trong phần tử có `lang="zh-CN"`, nếu không
  máy cài tiếng Nhật có thể hiện nét kiểu Nhật.
- Pinyin nằm trong phần tử có `lang="zh-Latn-pinyin"` và class `.pinyin`.

### 4.2 Thang cỡ chữ

| Token | Cỡ (px) / giãn dòng | Độ đậm | Dùng cho |
|---|---|---|---|
| `caption` | 12 / 1.4 | 600 | nhãn, số tiến độ |
| `body-sm` | 14 / 1.6 | 500 | chữ phụ, giải thích ngữ pháp |
| `body` | 16 / 1.65 | 500 | chữ chính |
| `title-sm` | 18 / 1.4 | 700 | tiêu đề thẻ |
| `title` | 22 / 1.35 | 700 | tiêu đề màn hình |
| `title-lg` | 28 / 1.25 | 700 | tiêu đề lớn (onboarding, kết quả) |
| `pinyin` | 18 / 1.3 | 500 | pinyin dưới chữ Hán |
| `hanzi-inline` | 1.15em / 1.8 | 400 | chữ Hán trong câu |
| `hanzi-md` | 32 / 1.2 | 400 | đáp án trắc nghiệm |
| `hanzi-lg` | 56 / 1.1 | 400 | thẻ từ |
| `hanzi-xl` | 96 / 1 | 400 | tập viết, trong ô 田字格 |

Quicksand chỉ dùng các độ đậm 500, 600, 700.

## 5. Khoảng cách, bo góc, chuyển động

- **Khoảng cách**, bước 4px: `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `2xl` 32 · `3xl` 48.
  Tailwind sinh ra `gap-md`, `p-lg`… như ví dụ trong CLAUDE.md.
- **Bo góc**: `sm` 6 · `md` 8 (nút, ô nhập) · `lg` 12 (thẻ, đáp án) · `full` (công tắc, nút tròn).
- **Chuyển động**: `fast` 150ms, `base` 250ms, easing `cubic-bezier(.2,.7,.2,1)`. Mọi
  transition và animation tắt khi máy bật `prefers-reduced-motion: reduce`.
- **Focus**: viền ngoài 2px màu `accent`, cách phần tử 2px, chỉ hiện với `:focus-visible`.
  Ô nhập đang nhập có thêm vòng sáng 3px màu `accent-soft`.

## 6. Component trong artifact

Mỗi component có bản xem trực tiếp ở chế độ sáng và tối, kèm tên class BEM dùng trong code (§6 CLAUDE.md).

| Component | Class | Trạng thái |
|---|---|---|
| Nút | `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-danger` | thường, hover, focus, vô hiệu |
| Nút tròn biểu tượng | `.btn-icon` | thường, đang phát / đang ghi |
| Ô nhập | `.field`, `.field-label`, `.field-input`, `.field-hint` | thường, đang nhập, `.has-error`, vô hiệu |
| Đáp án trắc nghiệm | `.choice` | thường, `.is-selected`, `.is-correct`, `.is-wrong` |
| Dải phản hồi | `.feedback` + `.feedback-success` / `.feedback-error` / `.feedback-warning` | — |
| Công tắc | `.switch` (`role="switch"`) | bật, tắt, focus |
| Pinyin | `.pinyin`, `.tone-1`…`.tone-5` | có màu, `.is-plain` |
| Thẻ từ | `.word-card` | — |
| Ô 田字格 | `.hanzi-grid` | — |
| Thanh tiến độ | `.progress-bar` | — |
| Dòng bài học | `.lesson-row` | `.is-locked`, `.is-current`, `.is-done` |
| Thanh điều hướng dưới (điện thoại) | `.bottom-nav` | mục `.is-active` |

Quy tắc dùng:
- Mỗi màn hình có **tối đa một** `.btn-primary`.
- `.btn-danger` chỉ có viền đỏ, không tô nền đỏ.
- Chữ trong ô nhập luôn là 16px để iOS không tự phóng to màn hình khi chạm vào ô.

## 7. Đưa vào code

### 7.1 File và vị trí

| File | Vai trò |
|---|---|
| `apps/web/src/styles/tokens.css` | Biến CSS `--csk-*` cho sáng và tối, `@theme inline` ánh xạ sang Tailwind (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`, `--text-*`) |
| `apps/web/src/styles/fonts.css` | `@font-face` cho LXGW WenKai (bản đã cắt) và import Fontsource (chỉ các subset cần dùng) |
| `apps/web/src/styles/base.css` | `body`, `:lang(zh)`, `.pinyin`, focus, reduced-motion |
| `apps/web/src/index.css` | `@import 'tailwindcss'` rồi import 3 file trên |
| `apps/web/src/index.html` | thêm `<meta name="theme-color">` cho sáng và tối |
| `content/data-raw/fonts/LXGWWenKai-Regular.ttf` + `LICENSE` (OFL 1.1) | font gốc v1.530 (~26 MB). **Không commit** (`.gitignore`): `font:subset` tự tải từ release GitHub và kiểm tra SHA-256 ghim trong `sourceFont.ts`. Chỉ `LICENSE` nằm trong git |
| `content/scripts/font-subset.ts` | gom mọi chữ Hán trong `apps/web/src/assets/content/*.json` cùng một tập chữ cố định cho giao diện, rồi cắt font ra `apps/web/src/assets/fonts/lxgw-wenkai.subset.woff2` |
| `packages/shared/src/pinyin.charset.ts` | `PINYIN_CHARSET`: tập ký tự pinyin hợp lệ (đã xác nhận Baloo 2 có đủ, §2) |

CSS component (§6) **không làm trong spec này**. Mỗi component viết CSS khi được dùng lần đầu ở
tính năng, theo artifact. Spec này chỉ làm token, font và style nền.

### 7.2 Dependency mới (đã được đồng ý)

| Package | Nơi dùng | Vì sao |
|---|---|---|
| `@fontsource/quicksand` | `apps/web` | woff2 tự host, có subset `vietnamese`, `latin`, `latin-ext` |
| `@fontsource/baloo-2` | `apps/web` | woff2 tự host cho pinyin, có subset `latin`, `latin-ext` |
| `subset-font` | `content` | cắt font bằng HarfBuzz WASM, không cần Python |

Cả 3 khai báo trong pnpm catalog.

### 7.3 PWA

vite-plugin-pwa chưa được cài. Khi làm E1, `globPatterns` phải gồm `**/*.woff2` để font được
precache. Spec này ghi lại yêu cầu đó, không cài PWA.

## 8. Kiểm tra

| Kiểm tra | Ở đâu |
|---|---|
| Mọi cặp chữ/nền ở §3 đạt ≥ 4.5:1 cả sáng lẫn tối | unit test đọc token từ một nguồn TS dùng chung với CSS, hoặc parse `tokens.css` |
| Mọi pinyin trong nội dung chỉ chứa ký tự thuộc `PINYIN_CHARSET` | `content-check` |
| Mọi chữ Hán trong nội dung có trong file font đã cắt | **Để sau, làm cùng E7.** Cần thêm dependency đọc bảng mã font. LXGW WenKai đã phủ toàn bộ chữ HSK |
| Font tự host được tải, không có request ra Google Fonts | xem tab Network khi chạy `pnpm --filter @csk/web dev` |
| `typecheck`, `lint`, `test:run` pass | CI |

## 9. Ngoài phạm vi

- Màn hình Cài đặt và việc lưu trạng thái bật/tắt màu thanh điệu.
- Cài vite-plugin-pwa (thuộc E1).
- React component (`Button`, `WordCard`…). Mỗi component làm khi tính năng cần.
- Font chữ Hán kiểu Tống hoặc font chữ Hán cỡ nhỏ tự host.
