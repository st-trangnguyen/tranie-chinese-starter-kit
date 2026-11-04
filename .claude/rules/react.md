---
paths:
  - "**/*.tsx"
---

# React & Markup

React 19+. Naming xem CLAUDE.md §4, class trong JSX xem CLAUDE.md §6.

## Core

- **Chỉ function component.** Không viết class component mới.
- **Component và hook phải pure**: không side effect khi render, không mutate
  props/state.
- **Composition over configuration**: component nhỏ ghép lại, không god component.
- **Derive, don't sync**: tính giá trị khi render, đừng mirror vào state.
- **Server state ≠ client state**: data API dùng query library, state UI dùng `useState`.

## Component

```tsx
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  function handleClick() { onSelect(user); }
  return <button className="user-card" onClick={handleClick}>{user.name}</button>;
}
```

- Một exported component / file. Helper nhỏ, private thì ở cùng file được.
- Props read-only, **không bao giờ mutate**.
- ≥ 5 props là smell → gom thành object hoặc tách component.
- Component dumb nhận field cụ thể (`userName={user.name}`), không cả object.
- Prop drilling > 2 cấp → composition (`children`) hoặc context.
- Forward native props → extend `ComponentPropsWithoutRef<'button'>`.

## Hooks

- Gọi hook **chỉ ở top level**: không trong if, loop, hay sau early return.
- Hook là cầu nối React ↔ service: quyết định **khi nào** gọi service, không
  chứa business logic (logic nằm ở `shared/services` Phần 2).

```ts
export function useBookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getBookingsForUser(user)                    // use case từ shared/services
      .then(data => { if (!cancelled) setBookings(data); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [user.id]);

  return { bookings, isLoading };
}
```

## State

```tsx
// ❌ state thừa + effect sync
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// ✅ tính khi render
const fullName = `${first} ${last}`;
```

- **Local state first.** Nâng lên chỉ khi thực sự được chia sẻ.
- Update immutable: `setItems(prev => [...prev, item])`, không `push`.
- Context cho thứ ít thay đổi (theme, locale, auth user), không thay thế state
  management cho data đổi liên tục.

## Effects

Trước khi viết `useEffect`, hỏi: *có thực sự cần không?* Không cần effect để
transform data cho render, handle user event, hay reset state theo prop (dùng `key`).

- Có subscription / timer / listener → **phải return cleanup**.
- Dependency array đầy đủ. **Không silence `exhaustive-deps`.** Nếu phải "chạy
  một lần" mà lint cản → logic đó thuộc event handler hoặc nằm ngoài React.
- Một effect một concern.

## JSX

```tsx
{isLoading && <Spinner />}                                 // hiện/ẩn
{user ? <Profile user={user} /> : <LoginPrompt />}         // hai nhánh
{users.map(u => <UserCard key={u.id} user={u} />)}         // key = id ổn định
```

Nhiều nhánh → early return. Không viết logic phức tạp inline trong JSX — tách ra
biến hoặc function phía trên `return`. **Không dùng index làm `key`** khi list có
thể reorder/insert/delete.

## Markup & accessibility trong JSX

JSX render ra HTML — rule a11y giữ nguyên, chỉ khác `class` → `className`,
`for` → `htmlFor`.

**Semantic**
- Dùng `header` `nav` `main` `aside` `section` `article` `footer` `figure` `time`
  thay `div`/`span` chung chung.
- `<button>` cho hành động, `<a href>` cho điều hướng. **Không bao giờ**
  `<div onClick>`.
- Một `<h1>` mỗi trang, không nhảy cấp heading. Heading theo cấu trúc nội dung,
  không theo cỡ chữ.

**Bàn phím**
- Mọi control thao tác được bằng Tab/Enter/Space.
- Focus indicator phải nhìn thấy — không bỏ outline mà không thay thế.
- Không `tabIndex` dương. Chỉ `0` và `-1`.
- Modal/dropdown: trap focus khi mở, trả focus về trigger khi đóng, `Esc` để đóng.

**ARIA**
- Rule đầu tiên của ARIA: **không dùng ARIA nếu element semantic đã làm được**.
- Không đổi role của element semantic.
- Icon-only button bắt buộc `aria-label`. Icon trang trí → `aria-hidden="true"`.
- Nội dung động quan trọng → `aria-live="polite"`.

**Ảnh & form**
- `alt` mô tả nội dung/chức năng, không bắt đầu bằng "Hình ảnh của". Ảnh trang
  trí → `alt=""` (có thuộc tính, để rỗng).
- Mọi input có `<label htmlFor>` gắn đúng `id`. **Placeholder không thay label.**
- Nhóm liên quan → `<fieldset>` + `<legend>`.
- Lỗi: `aria-invalid` + `aria-describedby` trỏ tới message.
- `type` đúng (`email`, `tel`, `number`) + `autoComplete` phù hợp.
- Ảnh: `width`/`height` để tránh CLS, `loading="lazy"` dưới fold.

**Màu**: contrast ≥ 4.5:1 (text), ≥ 3:1 (UI). Không dùng **chỉ** màu để truyền
thông tin — kèm icon hoặc chữ.

## Data fetching

Dùng query library (TanStack Query / SWR) cho server state: cache, dedupe, retry,
invalidation. Không tự viết lại loading/error/cache cho từng màn hình.

```ts
useQuery({ queryKey: ['bookings', user.id], queryFn: () => getBookingsForUser(user) });
```

`queryFn` gọi **use case trong `shared/services`**, không gọi thẳng `core/services`.
Mutation xong phải invalidate query liên quan.

## Performance

**Đo trước, tối ưu sau** (React DevTools Profiler). Không rải `useMemo`/
`useCallback` theo cảm tính.

- Lazy load mọi route.
- List > ~100 dòng → virtualize (TanStack Virtual).
- Giữ state thấp nhất có thể trong cây.
- Truyền `children` để tránh re-render subtree tĩnh.

## Error handling

Error boundary ở mức route/feature, có fallback UI và nút retry. Lỗi async không
bị boundary bắt — xử lý trong hook/query và hiện state lỗi rõ ràng.

## Testing

Vitest + Testing Library + MSW + user-event.

- Test hành vi người dùng, không test implementation detail.
- Query ưu tiên: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (cuối).
- Mock network bằng MSW, không mock `fetch` thủ công.
- Custom hook có logic phức tạp → `renderHook`.

---

Chi tiết: `docs/05-standards/react.md`, `docs/05-standards/html.md`.
