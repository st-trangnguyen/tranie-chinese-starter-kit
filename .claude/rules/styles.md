---
paths:
  - "**/*.css"
---

# Tailwind CSS v4

CSS-first config. **Không dùng `tailwind.config.js`** (pattern v3).
Rule về class trong JSX nằm ở CLAUDE.md §6.

## Config

```css
/* ✅ Tailwind v4 */
@import "tailwindcss";

@theme {
  --color-primary: #007bff;
}
```

## Design tokens — hai tầng

**Tier 1 — primitive (palette thô):** `--color-blue-500`, `--color-gray-900`.
**Tier 2 — semantic (cách dùng):** `--color-primary`, `--color-surface`,
`--color-text-muted`, `--color-danger` — trỏ tới Tier 1.

Component **chỉ dùng token semantic**. Đổi theme = đổi mapping Tier 2, không sửa
từng component. Token spacing, typography, breakpoint, z-index cũng khai báo
trong `@theme` và là single source of truth — **không hardcode giá trị**.

## File organization

```
src/styles/tailwind/
├── tokens/      _colors.css _spacing.css _typography.css _breakpoints.css
├── base/        _reset.css _typography.css _base.css
├── components/  _button.css _card.css _form.css _modal.css _table.css
├── layout/      _header.css _footer.css _navigation.css _sidebar.css _grid.css
├── pages/       _home.css _about.css
├── themes/      _default.css _dark.css
├── vendors/     _datepicker.css
└── main.css
```

Thứ tự trong `main.css`: tailwind → tokens → base → layout → components →
pages → themes → vendors.

## Component class với @apply

BEM gạch ngang: `.card-header-primary`, **không** `.card__header--primary`.
State: `.is-active`, `.is-open`, `.has-error`.

```css
@layer components {
  .card        { @apply bg-surface rounded-lg shadow-sm border border-subtle; }
  .card-header { @apply border-b border-subtle pb-md; }
  .card-title  { @apply text-lg font-semibold text-primary; }
  .card-primary { @apply border-primary; }
}
```

Thứ tự property trong `@apply`: positioning → box model → typography → visual →
animation. `@apply` quá dài → viết CSS thuần cho phần đó.

Layer order: `@theme` → `base` → `components` → `utilities`. Utility thắng
component (đúng chủ đích). **Không `!important`** để chen ngang thứ tự layer.

## Responsive

Mobile-first: base = mobile, prefix `md:` `lg:` để enhance. **Không dùng
`max-width` làm chiến lược chính.** Breakpoint lấy từ token, không viết số thô.
Container query khi component phụ thuộc container thay vì viewport.

## Accessibility

- Focus: `focus-visible:` với ring rõ ràng — không bỏ outline mà không thay thế.
- Contrast ≥ 4.5:1 text, ≥ 3:1 UI; kiểm tra cả dark mode.
- `.sr-only` cho nội dung chỉ screen reader đọc — không `display: none`.
- `motion-reduce:` / `@media (prefers-reduced-motion)` → giảm animation.

## Performance

- Animate `transform`/`opacity`. **Tránh animate** `width`/`height`/`top`/`left`.
- `contain: layout paint` cho component độc lập. Selector nông.
- `@apply` lặp nhiều nơi làm phình CSS — gom vào một component class dùng chung.
- `will-change` chỉ khi cần, gỡ sau khi xong.

## Formatting

Indent 2 spaces · max 120 ký tự · semicolon cuối mọi declaration.
Stylelint class pattern: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`.

---

Chi tiết: `docs/05-standards/tailwind.md` (token từng nhóm, z-index scale,
layer precedence, container queries).
