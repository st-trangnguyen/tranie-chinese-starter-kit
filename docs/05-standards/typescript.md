## General Principles

### Core Values
- **Type Safety First**: Leverage TypeScript's type system fully
- **Explicit Over Implicit**: Prefer explicit types over inference for public APIs
- **Strict Mode**: Always use strict TypeScript configuration
- **Avoid `any`**: Use `unknown` or specific types instead
- **Progressive Enhancement**: Add types incrementally to JavaScript code

### TypeScript Version
- **Target**: TypeScript 5.0+
- **JS Target**: ES2022+
- **Module**: ESNext

---

## Type Annotations

### Basic Types

```typescript
// Primitive types
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Arrays
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ['a', 'b', 'c'];

// Tuple - fixed length array with specific types
const coordinate: [number, number] = [10, 20];
const user: [string, number] = ['John', 30];

// Object
const person: {
  name: string;
  age: number;
  email?: string;  // Optional property
} = {
  name: 'John',
  age: 30
};

// Function
const add: (a: number, b: number) => number = (a, b) => a + b;

// Union types
let value: string | number;
value = 'hello';
value = 42;

// Literal types
let direction: 'north' | 'south' | 'east' | 'west';
direction = 'north';

// ❌ BAD: Using any
const data: any = fetchData();  // Don't do this!

// ✅ GOOD: Use unknown
const data: unknown = fetchData();
if (typeof data === 'string') {
  console.log(data.toUpperCase());
}
```

### Function Types

```typescript
// ✅ GOOD: Annotate parameters and return type
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'Hello'}, ${name}!`;
}

// Default parameters (type inferred from default)
function createUser(name: string, role = 'user') {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

// Void return type
function logMessage(message: string): void {
  console.log(message);
}

// Never return type (throws or infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}

// Function overloads
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: string | number): string {
  return typeof value === 'string' ? value : value.toString();
}
```

### Async Functions

```typescript
// ✅ GOOD: Return type is Promise<T>
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  // ⚠️ CRITICAL: Validate external data at runtime!
  // See "Boundary Safety" section for Zod/Valibot usage
  return UserSchema.parse(data); 
}

// Error handling
async function getUserData(id: string): Promise<User | null> {
  try {
    return await fetchUser(id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

---

## Interfaces vs Types

### When to Use Interfaces

✅ **GOOD: Use interfaces for object shapes**
```typescript
// Object structures
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  readonly createdAt: Date;
}

// Interface extension
interface Admin extends User {
  permissions: string[];
  role: 'admin' | 'superadmin';
}

// Multiple interface extension
interface Employee extends User, HasSalary {
  department: string;
}

// Declaration merging (interfaces can be extended across files)
interface Window {
  customProperty: string;
}

// Later in another file
interface Window {
  anotherProperty: number;
}
```

### When to Use Types

✅ **GOOD: Use types for unions, intersections, and complex types**
```typescript
// Union types
type Status = 'pending' | 'approved' | 'rejected';
type ID = string | number;

// Intersection types
type AdminUser = User & {
  permissions: string[];
};

// Tuple types
type Coordinate = [number, number];

// Function types
type EventHandler = (event: Event) => void;

// Mapped types
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;
```

### General Guidelines

```typescript
// ✅ GOOD: Interface for object shapes
interface Product {
  id: string;
  name: string;
  price: number;
}

// ✅ GOOD: Type for unions
type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer';

// ✅ GOOD: Type for intersections
type AuthenticatedUser = User & { token: string };

// ✅ GOOD: Interface for public API
interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

// Prefer interfaces for extensibility
interface Config {
  apiUrl: string;
}

// Others can extend
interface ExtendedConfig extends Config {
  timeout: number;
}
```

---

## Generic Types

> **Naming Convention**: Generics must be descriptive unless completely trivial (like `T` in a map function).  
> Use `TValue`, `TResponse`, `TItem` instead of just `T`, `U`, `V` for complex types.

### Basic Generics

```typescript
// ✅ GOOD: Generic function
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const firstNumber = getFirstItem([1, 2, 3]);  // number | undefined
const firstName = getFirstItem(['a', 'b']);   // string | undefined

// Multiple type parameters
function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}

// Generic with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
const userName = getProperty(user, 'name');  // string
const userAge = getProperty(user, 'age');    // number

// Generic with default type
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}
```

### Generic Interfaces

```typescript
// Generic interface
interface Response<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: string;
  name: string;
}

// Usage
const userResponse: Response<User> = {
  data: { id: '1', name: 'John' },
  status: 200,
  message: 'Success'
};

const usersResponse: Response<User[]> = {
  data: [{ id: '1', name: 'John' }],
  status: 200,
  message: 'Success'
};

// Generic interface with constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Generic Classes

```typescript
class DataStore<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  get(index: number): T | undefined {
    return this.items[index];
  }
  
  getAll(): T[] {
    return [...this.items];
  }
}

const userStore = new DataStore<User>();
userStore.add({ id: '1', name: 'John', email: 'john@example.com' });

// Generic with constraints
class Collection<T extends { id: string }> {
  private items = new Map<string, T>();
  
  add(item: T): void {
    this.items.set(item.id, item);
  }
  
  get(id: string): T | undefined {
    return this.items.get(id);
  }
}
```

---

## Utility Types

### Built-in Utility Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age?: number;
}

// Partial - make all properties optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; password?: string; age?: number; }

// Required - make all properties required
type RequiredUser = Required<User>;
// { id: string; name: string; email: string; password: string; age: number; }

// Readonly - make all properties readonly
type ReadonlyUser = Readonly<User>;
// { readonly id: string; readonly name: string; ... }

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;
// { id: string; name: string; email: string; age?: number; }

// Record - create type with specific keys and value type
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
// { [key: string]: 'admin' | 'user' | 'guest' }

// Parameters - extract function parameter types
function createUser(name: string, age: number) {
  return { name, age };
}
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number]

// ReturnType - extract function return type
type CreateUserReturn = ReturnType<typeof createUser>;
// { name: string; age: number; }

// Awaited - unwrap Promise type
type UserPromise = Promise<User>;
type UnwrappedUser = Awaited<UserPromise>;
// User

// NonNullable - remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string

// Extract - extract types from union
type Status = 'pending' | 'approved' | 'rejected' | 'cancelled';
type ActiveStatus = Extract<Status, 'pending' | 'approved'>;
// 'pending' | 'approved'

// Exclude - exclude types from union
type InactiveStatus = Exclude<Status, 'pending' | 'approved'>;
// 'rejected' | 'cancelled'
```

### Custom Utility Types

```typescript
// Deep Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Nullable
type Nullable<T> = T | null;

// Optional by keys
type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Example usage
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

type FlexibleConfig = OptionalBy<Config, 'timeout' | 'retries'>;
// { apiUrl: string; timeout?: number; retries?: number; }
```

---

## Type Guards & Narrowing

### typeof Guards

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    return value.toUpperCase();
  } else {
    // TypeScript knows value is number here
    return value.toFixed(2);
  }
}
```

### instanceof Guards

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    // TypeScript knows error is ApiError here
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    console.log(`Error: ${error.message}`);
  }
}
```

### Custom Type Guards

```typescript
// ✅ GOOD: User-defined type guard
interface User {
  id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return 'permissions' in user;
}

function handleUser(user: User | Admin) {
  if (isAdmin(user)) {
    // TypeScript knows user is Admin here
    console.log(user.permissions);
  } else {
    // TypeScript knows user is User here
    console.log(user.name);
  }
}

// Type guard for null checking
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

const users: (User | null)[] = [user1, null, user2];
const validUsers = users.filter(isNotNull);  // User[]
```

### Discriminated Unions

```typescript
// ✅ GOOD: Use discriminated unions for state management
interface LoadingState {
  status: 'loading';
}

interface SuccessState<T> {
  status: 'success';
  data: T;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    
    case 'success':
      // TypeScript knows state.data exists here
      return `Data: ${JSON.stringify(state.data)}`;
    
    case 'error':
      // TypeScript knows state.error exists here
      return `Error: ${state.error}`;
  }
}
```

### Assertion Functions

```typescript
// ✅ GOOD: Assertion function
function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is not defined');
  }
}

// Usage
function processUser(user: User | null) {
  assertIsDefined(user);
  // TypeScript knows user is User here (not null)
  console.log(user.name);
}
```

---

## Boundary Safety

### Schema Validation
External data (API responses, LocalStorage, URL params, WebSockets) is essentially `unknown`. "Lying" to the compiler by casting (`as User`) creates runtime bombs.

**Rule**: All external data must be validated at runtime before being typed.

**Recommended Libraries**:
- **Zod**: Feature-rich, ecosystem standard
- **Valibot**: Tree-shakeable, smaller bundle size

```typescript
import { z } from 'zod';

// Define schema (Single Source of Truth)
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional()
});

// Infer type from schema
type User = z.infer<typeof UserSchema>;

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const rawData = await response.json();
  
  // ✅ GOOD: Parses and throws error if invalid
  // Returns strongly typed 'User'
  return UserSchema.parse(rawData);
}
```

### Safe Parsers
For cases where you want to handle errors gracefully without try/catch blocks:

```typescript
const result = UserSchema.safeParse(rawData);

if (!result.success) {
  console.error("Validation failed:", result.error);
  return null;
}
return result.data;
```

---

## Advanced Types

### Mapped Types

```typescript
// Make all properties optional
type Optional<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties readonly
type Immutable<T> = {
  readonly [P in keyof T]: T[P];
};

// Add prefix to keys
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

interface User {
  name: string;
  age: number;
}

type PrefixedUser = Prefixed<User, 'user_'>;
// { user_name: string; user_age: number; }

// Filter properties by type
type FilterByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface Mixed {
  id: string;
  name: string;
  age: number;
  count: number;
}

type StringProps = FilterByType<Mixed, string>;
// { id: string; name: string; }
```

### Conditional Types

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Type inference in conditional types
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type Resolved = Unwrap<Promise<string>>;  // string
type NotPromise = Unwrap<number>;         // number

// Distributed conditional types
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumber = string | number;
type ArrayType = ToArray<StringOrNumber>;  // string[] | number[]
```

### Template Literal Types

```typescript
// String manipulation in types
type Greeting = `Hello ${string}`;

const greet1: Greeting = 'Hello World';  // ✅
const greet2: Greeting = 'Hi World';     // ❌

// Advanced template literals
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<'click'>;  // 'onClick'
type HoverEvent = EventName<'hover'>;  // 'onHover'

// Combine with mapped types
type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Data {
  name: string;
  age: number;
}

type Handlers = EventHandlers<Data>;
// {
//   onName: (value: string) => void;
//   onAge: (value: number) => void;
// }
```

### Branded Types (Nominal Typing)

In strict domains (Fintech, E-commerce), treating all strings as equal is dangerous. Branded types prevent accidental mixing of similar primitives (e.g., passing a `ProductId` to a function expecting `UserId`).

```typescript
// Define branded types
type Brand<K, T> = K & { __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type Email = Brand<string, 'Email'>;

// Usage
function sendEmail(userId: UserId, email: Email) { 
  /* ... */ 
}

const uId = "123" as UserId;       // Requires casting at boundary
const pId = "456" as ProductId;
const email = "bob@example.com" as Email;

sendEmail(uId, email);   // ✅ OK
// sendEmail(pId, email); // ❌ Error: ProductId is not UserId
// sendEmail(uId, "bob"); // ❌ Error: string is not Email
```

---

## Framework-Specific Patterns

### React with TypeScript

#### Component Props

```typescript
import React from 'react';

// ✅ GOOD: Functional component with explicit props (Preferred over React.FC)
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  onClick,
  children,
  disabled = false,
  className = ''
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ✅ GOOD: Component with generic props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export function List<T extends { id: string }>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

#### Hooks

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ GOOD: Typed hooks
function useCounter(initialValue = 0) {
  const [count, setCount] = useState<number>(initialValue);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);
  
  return { count, increment, decrement };
}

// ✅ GOOD: useRef with types
function InputComponent() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return <input ref={inputRef} />;
}

// ✅ GOOD: Custom hook with generics
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

#### Context

```typescript
import { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ✅ GOOD: Typed context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    // Login logic
    const user = await api.login(email, password);
    setUser(user);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Vue.js with TypeScript

```typescript
// ✅ GOOD: Vue 3 Composition API with TypeScript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// Props
interface Props {
  userId: string;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
});

// Emits
interface Emits {
  (e: 'update', user: User): void;
  (e: 'delete', id: string): void;
}

const emit = defineEmits<Emits>();

// State
const user = ref<User | null>(null);
const loading = ref<boolean>(false);

// Computed
const displayName = computed(() => {
  return user.value?.name ?? 'Unknown';
});

// Methods
async function fetchUser() {
  loading.value = true;
  try {
    user.value = await api.getUser(props.userId);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUser();
});
</script>
```

### Angular with TypeScript

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ GOOD: Typed component
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();
  
  selectedUser: User | null = null;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }
  
  onSelectUser(user: User): void {
    this.selectedUser = user;
    this.userSelected.emit(user);
  }
}

// ✅ GOOD: Typed service
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com';
  
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }
  
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }
  
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }
}
```

---

## Best Practices

### Avoid `any`

❌ **BAD: Using any**
```typescript
function processData(data: any) {
  return data.value;
}
```

✅ **GOOD: Use unknown**
```typescript
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error('Invalid data');
}
```

### Use `const` Assertions

```typescript
// ✅ GOOD: Literal types with const assertion
const Colors = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff'
} as const;

type Color = typeof Colors[keyof typeof Colors];
// '#ff0000' | '#00ff00' | '#0000ff'

// Arrays
const directions = ['north', 'south', 'east', 'west'] as const;
type Direction = typeof directions[number];
// 'north' | 'south' | 'east' | 'west'
```

### Prefer Type Inference

```typescript
// ✅ GOOD: Let TypeScript infer when obvious
const name = 'John';  // string
const age = 30;       // number
const items = [1, 2, 3];  // number[]

// ✅ GOOD: Explicit for function signatures
function getUser(id: string): User {
  // ...
}

// ✅ GOOD: Explicit for complex types
const config: AppConfig = {
  apiUrl: process.env.API_URL,
  timeout: 5000
};
```

### Use Index Signatures Carefully

```typescript
// ⚠️ AVOID: Too permissive
interface Config {
  [key: string]: any;
}

// ✅ BETTER: Specific known properties + index
interface Config {
  apiUrl: string;
  timeout: number;
  [key: string]: string | number;  // Additional props
}

// ✅ BEST: Use Record for dynamic keys
type Config = {
  apiUrl: string;
  timeout: number;
} & Record<string, unknown>;
```

### Readonly for Immutability

```typescript
// ✅ GOOD: Readonly properties
interface User {
  readonly id: string;
  name: string;
  readonly createdAt: Date;
}

// ✅ GOOD: Readonly arrays
function processItems(items: readonly string[]) {
  // items.push('new');  // ❌ Error!
  const copy = [...items];  // ✅ OK
}

// ✅ GOOD: ReadonlyArray
function sum(numbers: ReadonlyArray<number>): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### Avoid Enums
TypeScript Enums add runtime code and have nominal typing issues.

❌ **BAD: Enums**
```typescript
enum Direction {
  Up,
  Down
}
```

✅ **GOOD: Union Types or POJO as const**
```typescript
// Union Type (zero runtime cost)
type Direction = 'Up' | 'Down';

// POJO with as const (for values + types)
const Direction = {
  UP: 'UP',
  DOWN: 'DOWN'
} as const;

type Direction = typeof Direction[keyof typeof Direction];
```

### Import Organization
Sort imports to prevent circular dependency issues and improve readability.

1. **Third-party packages** (React, lodash)
2. **Internal Aliased paths** (@/components, @/utils)
3. **Relative paths** (./utils, ../types)
4. **Style imports**

**Tip**: Use Type-Only imports to help bundlers effectively tree-shake.

```typescript
import { useEffect } from 'react';              // Library
import { User } from '@/types';                 // Internal Absolute
import { formatName } from './utils';           // Relative

import type { ButtonProps } from './Button';    // Type-only (Explicit)
```

---

## Configuration

### tsconfig.json (Strict)

```json
{
  "compilerOptions": {
    // Language and Environment
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    
    // Modules
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    
    // Emit
    "noEmit": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    // Interop Constraints
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    // Type Checking - STRICT
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    
    // Completeness
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  }
}
```

### Type-only Imports

```typescript
// ✅ GOOD: Use type-only imports for types
import type { User } from './types';
import type { FC } from 'react';

// ✅ GOOD: Mixed imports
import { useState, type Dispatch, type SetStateAction } from 'react';
```

---

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [Total TypeScript](https://www.totaltypescript.com/)