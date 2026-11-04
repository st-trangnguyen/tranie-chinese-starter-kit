---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript & JavaScript

TypeScript 5+, `strict: true`, ES2022. Rule JavaScript bên dưới áp dụng cho
`.ts`/`.tsx` vì TypeScript là JavaScript. Naming xem CLAUDE.md §4.

## Luật cứng

1. **Không `any`.** `unknown` + narrowing, hoặc type cụ thể.
2. **Không `enum`.** Union type hoặc object `as const`.
3. **Không `as` để ép type dữ liệu ngoài.** Validate runtime trước.
4. **Không `@ts-ignore`** trừ khi có comment giải thích và link issue của lib.
5. **Exported function phải có return type tường minh.** Bên trong để inference lo.
6. **Không hạ flag trong `tsconfig.json` để code chạy.** Sửa code.

## Interface vs type

```ts
interface Product { id: string; name: string; price: number; }  // object shape
interface ApiClient { get<T>(url: string): Promise<T>; }         // public API

type PaymentMethod = 'credit_card' | 'paypal';                   // union
type AuthenticatedUser = User & { token: string };               // intersection
```

Object shape → `interface`. Union / intersection / mapped / conditional → `type`.

## Thay enum

```ts
// ❌ enum Direction { Up, Down }

type Direction = 'Up' | 'Down';                      // chỉ cần type

const Direction = { UP: 'UP', DOWN: 'DOWN' } as const;  // cần cả value
type Direction = typeof Direction[keyof typeof Direction];
```

## Boundary safety — bắt buộc

Mọi dữ liệu từ API, localStorage, URL params, WebSocket, postMessage đều là
`unknown`. Cast là quả bom runtime.

```ts
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;   // schema là single source of truth

async function fetchUser(id: string): Promise<User> {
  const res = await api.get(`/users/${id}`);
  return UserSchema.parse(res.data);      // throw nếu sai shape
}

const result = UserSchema.safeParse(raw); // khi cần xử lý lỗi mềm
if (!result.success) return null;
```

Schema dùng chung đặt ở `shared/validators/`. Type suy ra từ schema, không khai
báo song song hai nơi.

## Type guards

```ts
if (typeof value === 'string') { … }
if (err instanceof HttpError) { … }

function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null && 'id' in v;
}

type Result<T> =                          // discriminated union cho state
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

## Immutability

```ts
interface Config { readonly apiUrl: string; }
const ROLES = ['admin', 'user'] as const;
function process(items: readonly Item[]) { … }   // không mutate tham số

// ❌ function addItem(cart, item) { cart.items.push(item); return cart; }
// ✅
function addItem(cart: Cart, item: Item): Cart {
  return { ...cart, items: [...cart.items, item] };
}
```

Dùng `map`/`filter`/`reduce`/`find` thay vòng `for` có side effect.
`toSorted`/`toReversed`/`with` thay vì mutate array.

## Biến & function

- `const` mặc định, `let` khi thực sự reassign. **Không `var`.**
- `?.` và `??` (không dùng `||` cho giá trị hợp lệ là `0` hoặc `''`).
- Template literal thay nối chuỗi.
- Pure function ở `shared/utils` và `shared/services` Phần 2.

## Async

```ts
async function loadUser(id: string): Promise<User> {
  try {
    return await fetchUser(id);
  } catch (error) {
    throw new AppError('Không tải được thông tin người dùng', { cause: error });
  }
}
```

- `async/await` thay chuỗi `.then()`.
- Tác vụ độc lập chạy song song bằng `Promise.all`, không `await` tuần tự.
- Không để floating promise. Không `catch {}` nuốt lỗi.
- Retry có backoff cho lỗi mạng; không retry 4xx.

## Error handling

- Ném `Error` hoặc subclass, không ném string.
- Custom error class cho từng loại lỗi nghiệp vụ: `ValidationError`,
  `NotFoundError`, `HttpError` — có `name`, `message` rõ nghĩa, `cause`.
- `try/catch` chỉ bọc đoạn thực sự có thể lỗi.
- Message hướng tới người dùng phải nói được *chuyện gì xảy ra và làm gì tiếp*.

## Security

| Rule | Chi tiết |
|---|---|
| XSS | Không `dangerouslySetInnerHTML` với dữ liệu người dùng. Buộc phải render HTML → DOMPurify.sanitize |
| CSRF | Gửi CSRF token trong header cho mọi request thay đổi state |
| Secrets | Không hardcode key/token. Dùng env var, `.env` trong `.gitignore` |
| Input | Validate ở biên. Sanitize filename để chặn path traversal |
| Link | `target="_blank"` luôn kèm `rel="noopener noreferrer"` |

## Tiền tệ

JS number là IEEE 754: `0.1 + 0.2 !== 0.3`.

```ts
const priceInCents = 1099;
const total = priceInCents * 3;                   // 3297
const display = `$${(total / 100).toFixed(2)}`;   // $32.97
// ❌ const total = 10.99 * 3;
```

Tính toán phức tạp → decimal.js / currency.js. Không bao giờ float cho tiền.

## Performance

`debounce` cho input/search, `throttle` cho scroll/resize. Memoize hàm nặng có
input lặp lại. Dynamic `import()` cho module nặng ít dùng. **Không tối ưu khi
chưa đo.**

## tsconfig tối thiểu

`strict` · `noUnusedLocals` · `noUnusedParameters` · `noImplicitReturns` ·
`noFallthroughCasesInSwitch` · `noUncheckedIndexedAccess` · `noImplicitOverride` ·
`noPropertyAccessFromIndexSignature` · `isolatedModules` ·
`forceConsistentCasingInFileNames`. Path alias `@/*` → `./src/*`.

## Testing

Vitest. Tên test: `should [expected behavior] when [condition]`.
Arrange–Act–Assert. Mock ở ranh giới (network, time, random), không mock nội bộ module.

---

Chi tiết: `docs/05-standards/typescript.md` (mapped types, conditional types,
branded types), `docs/05-standards/javascript.md` (composition, retry, memoization).
