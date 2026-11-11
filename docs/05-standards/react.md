## General Principles

### Core Values
- **Function Components Only**: No class components in new code
- **Rules of React**: Components and hooks must be pure; props and state are immutable
- **Composition Over Configuration**: Small components composed together, not god components with 20 props
- **Derive, Don't Sync**: Compute values during render instead of mirroring them into state
- **Server State Is Not Client State**: Use a query library for API data, local state for UI state

### React Version
- **Target**: React 19+
- **Language**: TypeScript 5.4+ in strict mode
- **Build**: Vite (SPA) or Next.js (SSR/RSC)

---

## Project Structure

### Feature-Based Organization

✅ **GOOD: Organize by feature, not by type**
```
src/
├── app/                    # App shell, providers, router
│   ├── App.tsx
│   ├── providers.tsx
│   └── routes.tsx
├── features/               # Business features
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserList.tsx
│   │   │   └── UserCard.tsx
│   │   ├── hooks/
│   │   │   └── useUsers.ts
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── index.ts        # Public API of the feature
│   └── orders/
├── shared/                 # Cross-feature building blocks
│   ├── components/         # Button, Modal, Input
│   ├── hooks/              # useDebounce, useMediaQuery
│   └── utils/
└── main.tsx
```

❌ **BAD: Organize by file type**
```
src/
├── components/    # 80 components from every feature
├── hooks/
├── utils/
└── types/
```

### File Rules
- One exported component per file; small private helper components are fine
- Features expose a public API through `index.ts`; never deep-import across features
- Keep files under 300 lines; extract child components and hooks when larger
- Co-locate tests: `UserList.tsx` + `UserList.test.tsx`

---

## Naming Conventions

```
UserList.tsx          # Component files: PascalCase
useUsers.ts           # Hook files: camelCase with use prefix
date.utils.ts         # Utility files: kebab-case + .utils.ts (xem CLAUDE.md §4)
types.ts              # Shared types for the feature
UserList.test.tsx     # Tests
```

```typescript
// Components: PascalCase
export function UserList() {}

// Hooks: camelCase, must start with use
export function useUsers() {}

// Event handler props: on prefix
interface Props {
  onSelect: (user: User) => void;
  onClose: () => void;
}

// Event handler implementations: handle prefix
function handleSelect(user: User) {}

// Booleans: is/has/can prefix
const isOpen = true;
const hasError = false;

// Constants: SCREAMING_SNAKE_CASE
const MAX_PAGE_SIZE = 50;
```

---

## Components

### Function Components

✅ **GOOD: Named function declaration, typed props**
```tsx
interface UserCardProps {
  user: User;
  compact?: boolean;
  onSelect: (user: User) => void;
}

export function UserCard({ user, compact = false, onSelect }: UserCardProps) {
  return (
    <article onClick={() => onSelect(user)}>
      <h3>{user.name}</h3>
      {!compact && <p>{user.email}</p>}
    </article>
  );
}
```

❌ **BAD: React.FC and class components**
```tsx
// React.FC adds nothing and complicates generics
const UserCard: React.FC<UserCardProps> = ({ user }) => { /* ... */ };

// No class components in new code
class UserCard extends React.Component<UserCardProps> { /* ... */ }
```

### Keep Components Pure

✅ **GOOD: Same props in, same JSX out**
```tsx
export function PriceTag({ amountInCents }: { amountInCents: number }) {
  const display = `$${(amountInCents / 100).toFixed(2)}`;
  return <span>{display}</span>;
}
```

❌ **BAD: Side effects or mutation during render**
```tsx
let renderCount = 0;

export function PriceTag({ amountInCents }: { amountInCents: number }) {
  renderCount++;                          // Mutation during render
  localStorage.setItem('seen', 'true');   // Side effect during render
  return <span>{amountInCents / 100}</span>;
}
```

### Composition Patterns

✅ **GOOD: children and slots over boolean props**
```tsx
// Compound layout via children
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
};

// Usage
<Card>
  <Card.Header><h2>Title</h2></Card.Header>
  <Card.Body><p>Content</p></Card.Body>
</Card>
```

❌ **BAD: God component with configuration flags**
```tsx
<Card
  title="Title"
  showHeader
  showFooter={false}
  headerVariant="large"
  bodyContent={<p>Content</p>}
  withBorder
/>
```

---

## Props

### Typing & Destructuring

```tsx
// ✅ GOOD: Destructure in the signature, defaults inline
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Forwarding Native Props

```tsx
// ✅ GOOD: Extend native element props (React 19: ref is a regular prop)
interface InputProps extends React.ComponentPropsWithRef<'input'> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} {...rest} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

### Rules
- Props are read-only; never mutate them
- Five or more props is a smell; group related values into an object or split the component
- Avoid passing entire objects when one field is used: `userName={user.name}` beats `user={user}` for dumb components
- Avoid prop drilling deeper than 2 levels; use composition or context instead

---

## Hooks

### Rules of Hooks

- Call hooks only at the top level: never in conditions, loops, or after early returns
- Call hooks only from components or other hooks
- Every hook file starts with `use` and returns a stable, documented shape

### Custom Hooks

✅ **GOOD: Extract reusable logic into custom hooks**
```tsx
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  return { isOpen, open, close, toggle };
}
```

❌ **BAD: Conditional hook calls**
```tsx
function Profile({ userId }: { userId?: string }) {
  if (!userId) return null;          // Early return before hooks
  const user = useUser(userId);      // Hook order now varies between renders
  return <p>{user.name}</p>;
}
```

### useRef

```tsx
// ✅ GOOD: Refs for DOM nodes and mutable values that don't drive rendering
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}

// ❌ BAD: Ref as state (UI won't update)
const countRef = useRef(0);
const increment = () => { countRef.current++; };  // Renders nothing new
```

---

## State Management

### Local State First

```tsx
// ✅ GOOD: useState for simple component state
const [isOpen, setIsOpen] = useState(false);
const [query, setQuery] = useState('');

// ✅ GOOD: Functional updates when next state depends on previous
setCount(c => c + 1);

// ✅ GOOD: useReducer when transitions are interdependent
type Action =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

function cartReducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add':
      return [...state, action.item];
    case 'remove':
      return state.filter(item => item.id !== action.id);
    case 'clear':
      return [];
  }
}

const [items, dispatch] = useReducer(cartReducer, []);
```

### Derive, Don't Sync

✅ **GOOD: Compute during render**
```tsx
function Cart({ items }: { items: CartItem[] }) {
  // Derived on every render: always correct, no syncing
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const isEmpty = items.length === 0;

  return isEmpty ? <EmptyCart /> : <CartSummary total={total} />;
}
```

❌ **BAD: Mirroring derived data into state**
```tsx
function Cart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));  // Extra render, can desync
  }, [items]);
}
```

### Immutable Updates

```tsx
// ✅ GOOD
setUsers(users => [...users, newUser]);
setUser(user => ({ ...user, name: 'John' }));
setItems(items => items.filter(item => item.id !== removeId));

// ❌ BAD: Mutation never triggers a render
users.push(newUser);
user.name = 'John';
setUsers(users);
```

### Context

```tsx
// ✅ GOOD: Context for stable, app-wide values (theme, auth, locale)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
```

- Context is for low-frequency updates; rapidly changing values cause app-wide re-renders
- For complex shared client state, use Zustand or Jotai before reaching for Redux
- Never put server data in context or global stores; that is the query library's job

---

## Effects Discipline

### You Might Not Need an Effect

Effects are an escape hatch for synchronizing with external systems (network, DOM APIs, subscriptions, timers). Most other uses are wrong.

❌ **BAD: Effects for things that aren't external systems**
```tsx
// Transforming data: derive during render instead
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Handling user events: do it in the event handler instead
useEffect(() => {
  if (submitted) {
    api.submit(form);
  }
}, [submitted]);
```

✅ **GOOD: Effect for a real external system**
```tsx
useEffect(() => {
  const socket = createSocket(roomId);
  socket.connect();

  return () => socket.disconnect();  // Always clean up
}, [roomId]);
```

### Effect Rules
- Every effect with a subscription, timer, or listener returns a cleanup function
- Dependency arrays are exhaustive; never silence `react-hooks/exhaustive-deps`
- If you need to "run only once" logic that fights the lint rule, the logic probably belongs outside React or in an event handler
- One effect per concern; don't merge unrelated synchronizations

---

## JSX Conventions

### Conditional Rendering

```tsx
// ✅ GOOD: Ternary for either/or
{isLoading ? <Spinner /> : <UserList users={users} />}

// ✅ GOOD: && for optional rendering with boolean guards
{error && <ErrorBanner message={error} />}

// ⚠️ TRAP: && with numbers renders 0
{items.length && <List items={items} />}      // Renders "0" when empty!
{items.length > 0 && <List items={items} />}  // ✅ Correct

// ✅ GOOD: Early return for whole-component branches
if (!user) {
  return <LoginPrompt />;
}
return <Profile user={user} />;
```

### Lists & Keys

```tsx
// ✅ GOOD: Stable unique key from the data
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ❌ BAD: Index as key for dynamic lists (breaks state & animations on reorder)
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

### Formatting

```tsx
// ✅ GOOD: One prop per line when more than 2 props
<UserCard
  user={user}
  compact
  onSelect={handleSelect}
/>

// ✅ GOOD: Self-close childless elements
<Spinner />

// ✅ GOOD: Fragments over wrapper divs
<>
  <Header />
  <Main />
</>
```

- Double quotes in JSX attributes, single quotes in TypeScript
- Extract JSX into a child component rather than nesting ternaries two levels deep
- No inline object/array literals as props on memoized children

---

## Data Fetching

### Use a Query Library

✅ **GOOD: TanStack Query for server state**
```tsx
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60_000
  });
}

export function UserList() {
  const { data: users, isPending, isError } = useUsers();

  if (isPending) return <Spinner />;
  if (isError) return <ErrorBanner message="Failed to load users." />;

  return (
    <ul>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </ul>
  );
}
```

❌ **BAD: Hand-rolled fetch effects**
```tsx
// No caching, no deduping, race conditions, no retries
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(setUsers);
}, []);
```

### Mutations

```tsx
// ✅ GOOD: Mutation with cache invalidation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}
```

- Validate all API responses at the boundary with Zod (see TypeScript Conventions, Boundary Safety)
- Query keys are arrays that include all variables: `['users', { page, filter }]`

---

## Performance

### Measure First

- Profile with React DevTools before optimizing; don't memoize speculatively
- With React Compiler enabled, manual `useMemo`/`useCallback`/`memo` is mostly unnecessary; write plain code and let the compiler optimize

### Manual Memoization (when not using the compiler)

```tsx
// ✅ GOOD: Memoize expensive computation
const sorted = useMemo(
  () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);

// ✅ GOOD: Stable callbacks passed to memoized children
const handleSelect = useCallback((user: User) => {
  setSelected(user);
}, []);

const UserCard = memo(function UserCard({ user, onSelect }: UserCardProps) {
  return <article onClick={() => onSelect(user)}>{user.name}</article>;
});
```

### Code Splitting

```tsx
// ✅ GOOD: Lazy load routes and heavy components
const Settings = lazy(() => import('./features/settings/Settings'));

<Suspense fallback={<PageSkeleton />}>
  <Settings />
</Suspense>
```

### Checklist
- Lazy load every route; keep the initial bundle to shell + first screen
- Virtualize lists over ~100 rows (TanStack Virtual)
- Keep state as low in the tree as possible; lift it only when actually shared
- Pass `children` through to avoid re-rendering static subtrees

---

## Error Handling

### Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong.</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Wrap each feature region, not just the app root
<ErrorBoundary FallbackComponent={Fallback} onError={reportError}>
  <UserDashboard />
</ErrorBoundary>
```

- One boundary per route or major feature region so one failure doesn't blank the page
- Report boundary errors to the monitoring service
- Async/event-handler errors don't hit boundaries; handle them where they occur and surface via state

---

## Testing Standards

### Testing Library Philosophy

Test what the user sees and does, not implementation details.

✅ **GOOD: Query by role and accessible name**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit credentials when form is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'secret123'
    });
  });

  it('should show error when email is invalid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email/i);
  });
});
```

❌ **BAD: Testing implementation details**
```tsx
expect(wrapper.state('isValid')).toBe(false);          // Internal state
expect(container.querySelector('.error-text')).toBeTruthy();  // CSS classes
```

### Mocking the Network

```tsx
// ✅ GOOD: Mock at the network boundary with MSW
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/users', () =>
    HttpResponse.json([{ id: '1', name: 'John', email: 'j@x.com' }])
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Rules
- Stack: Vitest + Testing Library + MSW + user-event
- Test names follow: should [expected behavior] when [condition]
- Prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (last resort)
- Custom hooks with nontrivial logic get their own tests via `renderHook`

---

## Configuration

### ESLint

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "settings": {
    "react": { "version": "detect" }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn"
  }
}
```

### Vite + React Compiler

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]]
      }
    })
  ]
});
```

---

## References

- [Rules of React (official)](https://react.dev/reference/rules)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)