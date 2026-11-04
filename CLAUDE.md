# Engineering Standards — Frontend (React + TypeScript + Tailwind v4)

Rule trong file này áp dụng cho **mọi task**, kể cả task nhỏ, kể cả khi người
dùng không nhắc tới. Rule theo loại file nằm trong `.claude/rules/` và tự nạp
khi bạn đọc/sửa file khớp.

---

## 0. Luật tối cao

1. **Dependency Rule đi một chiều**:
   `container → pages/<feature>/hooks → shared/services → core/services`.
   Không ngoại lệ.
2. **Business logic không nằm trong component hay hook.** Nó nằm trong
   `shared/services/` — lớp quy tắc nghiệp vụ (§3).
3. **Không `any`.** Dùng `unknown` + type guard, hoặc type cụ thể.
4. **Dữ liệu từ ngoài (JSON nội dung, IndexedDB, file backup import, localStorage,
   URL params) phải validate runtime** bằng Zod (schema trong `@csk/shared`) trước
   khi gắn type. Không `as Lesson`.
5. **Không hardcode secret.** Không `dangerouslySetInnerHTML` với dữ liệu người dùng.
6. **Không lách rule bằng comment**: không `eslint-disable`, không `@ts-ignore`,
   không silence `react-hooks/exhaustive-deps`. Lint cản = thiết kế sai, sửa thiết kế.

Nếu yêu cầu buộc phá rule trên: **dừng, nói rõ rule nào bị phá và tại sao, đề
xuất cách đúng**, rồi mới hỏi người dùng có muốn làm ngoại lệ không.

---

## 1. "Đoạn code này đặt ở đâu?"

Trả lời câu hỏi này trước khi viết dòng nào. Đường dẫn tính từ
`apps/web/src/app/`. Kiến trúc đầy đủ: `docs/03-architecture.md`.

| Code này làm gì? | Đặt ở đâu |
|---|---|
| Entry point của một màn hình (lazy-load) | `pages/<feature>/containers/` |
| Route của feature (`PageRoute[]`) | `pages/<feature>/<feature>.routes.ts` |
| UI riêng của một feature | `pages/<feature>/components/` |
| State + lifecycle của feature, gọi service | `pages/<feature>/hooks/` |
| UI dùng chung, layout, partials | `shared/components/` |
| Dạng bài tập + registry theo `kind` | `shared/components/exercises/` |
| Quy tắc nghiệp vụ + use case (content, progress, srs, backup) | `shared/services/` |
| Hạ tầng: IndexedDB (`ProgressStore`), audio, speech, i18n | `core/services/` |
| Schema + migration Dexie | `core/helpers/db.helper.ts` |
| Hook hạ tầng dùng chung (audio, ghi âm, online) | `core/hooks/` |
| PWA, router tùy biến | `core/modules/` |
| Cross-cutting React Context (settings…) | `shared/contexts/` |
| Pure utility (format, parse, calculate) | `shared/utils/` |
| Type riêng của UI | `shared/models/` |
| Schema Zod nội dung/tiến độ, `pinyin.utils` | `packages/shared` (`@csk/shared`) |
| App-wide constants | `core/constants/` |
| Design token (màu, spacing, chữ), font, style nền, CSS component BEM | `apps/web/src/styles/tailwind/` (spec: `docs/04-specs/2026-11-04-design-system.md`) |

Không tìm được ô phù hợp = chưa hiểu rõ yêu cầu. Hỏi lại, đừng đoán.

---

## 2. Dependency Rules

```
pages/<feature>/containers → pages/<feature>/hooks → shared/services → core/services
          ↘                         ↘                      ↘
   pages/<feature>/components   core/hooks          @csk/shared, shared/utils
   shared/components
```

```
❌ shared/services, core/services → React / router     # service phải chạy được ngoài React
❌ shared/services → Dexie / IndexedDB trực tiếp         # chỉ đi qua ProgressStore
❌ core/services   → shared/services                     # ngược chiều
❌ containers, components → shared/services trực tiếp   # bỏ qua hook = loading/error không nhất quán
❌ shared/components/exercises → service bất kỳ         # chỉ nhận props; audio/ghi âm qua core/hooks
❌ shared/utils    → services                            # utils là leaf node, tránh circular
```

Trước khi thêm `import`, kiểm tra nó không nằm ở nhánh ❌. Nếu có, bạn đang đặt
code sai layer — di chuyển code, đừng thêm import.

Chưa có HTTP API, nên **không có `api.service` và không dùng axios**. Khi nào cần
gọi server thì thêm một service hạ tầng trong `core/services/` và cập nhật mục này.

---

## 3. Cấu trúc bắt buộc của `shared/services/*.service.ts`

Service dạng class, giữ một instance `ProgressStore` (inject qua constructor).
3 phần, đúng thứ tự, mỗi phần có comment banner:

```ts
// ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
// Đọc/ghi qua ProgressStore hoặc nạp JSON nội dung. private. KHÔNG business logic.

// ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────
// Pure. public. Không đụng store, không import React.
// Mỗi method = một rule nghiệp vụ, kèm comment "Rule: …".

// ── PHẦN 3 — USE CASES ───────────────────────────────
// Điều phối Phần 1 + Phần 2 thành flow. public (hook gọi trực tiếp).
// Throw Error với message rõ nghĩa khi rule bị vi phạm.
```

`core/services/` là hạ tầng (adapter IndexedDB, audio, Web Speech, i18n), không
chứa quy tắc nghiệp vụ và không cần chia 3 phần.

Khi debug: đọc/ghi sai dữ liệu → Phần 1. Quy tắc (mở khóa, chấm điểm, SRS) sai →
Phần 2. Flow sai thứ tự → Phần 3.

Pattern của dự án: `docs/03-architecture.md` §5. Ví dụ 3 phần gốc (bản dùng axios,
chỉ tham khảo cấu trúc): `docs/05-standards/architecture.md`.

---

## 4. Naming (nguồn duy nhất — các rule khác không lặp lại)

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component file / component | PascalCase | `UserList.tsx`, `function UserList()` |
| Hook file / hook | camelCase, prefix `use` | `useUsers.ts` |
| Service file | `<domain>.service.ts` | `booking.service.ts` |
| Util file | camelCase | `formatDate.ts` |
| Biến, function | camelCase | `userName`, `calculateTotal()` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Boolean | prefix `is` / `has` / `can` | `isOpen`, `hasError` |
| Array | số nhiều | `users`, `items` |
| Event handler prop | prefix `on` | `onSelect`, `onClose` |
| Event handler impl | prefix `handle` | `handleSelect` |
| CSS class | hyphen-BEM | `.card-header-primary` |

---

## 5. Formatting & imports

- Indent 2 spaces, không tab. Semicolon luôn có. Single quote (JSX dùng double).
- Trailing comma multi-line. Max 100 ký tự.
- Thứ tự import: **third-party → internal absolute (`@/`) → relative → styles**.
- `import type { … }` cho type-only import.
- File < 300 dòng. Vượt → tách.

---

## 6. Class trong JSX: chỉ layout & spacing

Tailwind v4. Trong `className` **chỉ được dùng utility về layout và spacing**:
`flex` `grid` `block` `hidden` · `flex-col` `flex-1` `grow` · `grid-cols-*`
`col-span-*` · `gap-*` · `p-*` `m-*` · `w-*` `h-*` `min-*` `max-*` ·
`relative` `absolute` `sticky` · `top-*` `inset-*` · `overflow-*` ·
`container` `mx-auto` · `space-x-*` · `order-*` · `items-*` `justify-*` `self-*`
— kèm biến thể responsive (`md:grid-cols-2`).

Mọi thứ visual — `bg-*` `text-*` `font-*` `leading-*` `border-*` `rounded-*`
`shadow-*` `opacity-*` `transition-*` `ring-*` — **phải vào file CSS qua `@apply`**
trong một BEM class.

```tsx
// ✅
<div className="card flex flex-col gap-md p-lg">
  <h3 className="card-title">Title</h3>
</div>

// ❌ utility soup
<div className="bg-white rounded-lg shadow-md text-gray-900 flex flex-col gap-4 p-6">
```

BEM dùng dấu gạch ngang, **không phải BEM truyền thống**:
`.card-header-primary`, không `.card__header--primary`. State: `.is-active`,
`.has-error`.

---

## 7. Chất lượng mặc định

- **TypeScript strict**: không `any`, không `@ts-ignore`, không `enum`.
- **Accessibility WCAG 2.1 AA**: semantic element, thao tác được bằng bàn phím,
  focus nhìn thấy, label gắn với input, contrast ≥ 4.5:1, tôn trọng
  `prefers-reduced-motion`.
- **Mobile-first**: viết cho mobile trước, enhance bằng `md:` `lg:`.
- **Immutability**: không mutate props, state, hay tham số đầu vào.
- **Effect discipline**: có subscription/timer/listener thì phải cleanup;
  dependency array đầy đủ; derive khi render thay vì sync bằng effect.
- **Tiền tệ không dùng float**: tính bằng integer (cents) hoặc decimal library.
- Component < 5 props, prop drilling < 2 cấp.

---

## 8. Quy trình làm task

1. Xác định layer đích theo bảng §1, **nói ra trước khi code**.
2. Tìm code tương tự đã có trong repo và theo đúng pattern đó — nhất quán với
   codebase hiện tại quan trọng hơn áp dụng máy móc ví dụ trong tài liệu.
3. Viết code. Diff nhỏ, một concern một chỗ.
4. Self-review theo §0, §2, §7.
5. Chạy typecheck / lint / test. **Không nói "đã xong" khi chưa chạy và chưa
   thấy kết quả pass.**

---

## 9. Khi nào hỏi lại thay vì tự quyết

- Yêu cầu buộc phá rule §0 hoặc §2.
- Không rõ business rule (ai được xem gì, điều kiện hợp lệ là gì).
- Repo đang theo kiến trúc khác tài liệu này.
- Phải thêm dependency mới.

---

Tài liệu chi tiết: `docs/05-standards/`. Đọc khi cần giải thích "tại sao" hoặc tra
phần tài liệu gốc chưa được tóm vào rule.
