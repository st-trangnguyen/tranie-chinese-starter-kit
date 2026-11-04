## General Principles

### Core Values
- **Modern ES6+ Only**: No ES5 patterns (no `var`, use `const`/`let`)
- **Functional First**: Prefer pure functions and immutability
- **Explicit Over Implicit**: Clear intent over clever code
- **Type Safety**: Use TypeScript or JSDoc for complex code
- **Testable**: Write code that's easy to test

### JavaScript Version
- **Target**: ES2022+ features
- **Transpilation**: Babel for older browser support
- **Node.js**: v18+ LTS

---

## Modern JavaScript (ES6+)

### Template Literals

✅ **GOOD: Use template literals**
```javascript
const name = 'John';
const age = 30;

const greeting = `Hello, ${name}! You are ${age} years old.`;

const multiLine = `
  This is a multi-line string.
  No need for concatenation.
`;

// Complex expressions
const message = `User: ${firstName} ${lastName.toUpperCase()}`;
```

❌ **BAD: String concatenation**
```javascript
const greeting = 'Hello, ' + name + '! You are ' + age + ' years old.';

const multiLine = 'Line 1\n' +
  'Line 2\n' +
  'Line 3';
```

### Destructuring

✅ **GOOD: Object destructuring**
```javascript
// Basic destructuring
const { name, email, age } = user;

// With defaults
const { name, role = 'guest' } = user;

// Rename variables
const { name: userName, email: userEmail } = user;

// Nested destructuring
const { address: { city, country } } = user;

// Function parameters
function displayUser({ name, email, age = 0 }) {
  console.log(`${name} (${age})`);
}

// Rest properties
const { id, ...userWithoutId } = user;
```

✅ **GOOD: Array destructuring**
```javascript
const [first, second, ...rest] = items;

// Skip elements
const [, , third] = items;

// Swap variables
[a, b] = [b, a];

// Default values
const [x = 0, y = 0] = coordinates;
```

### Spread Operator

✅ **GOOD: Use spread for immutability**
```javascript
// Array spread
const newArray = [...oldArray, newItem];
const combined = [...array1, ...array2];
const copy = [...original];

// Object spread
const newState = { ...oldState, updated: true };
const merged = { ...defaults, ...options };
const shallowClone = { ...original }; // ⚠️ Warning: Nested objects are shared references

// Deep Cloning (Independent Copy)
const deepCopy = structuredClone(original); // Native in modern browsers & Node 18+

// Function arguments
const numbers = [1, 2, 3];
Math.max(...numbers);  // 3
```

### Arrow Functions

✅ **GOOD: Use arrow functions appropriately**
```javascript
// Concise syntax for callbacks
const names = users.map(user => user.name);
const adults = users.filter(user => user.age >= 18);

// With block body
const processUser = user => {
  const validated = validateUser(user);
  return validated ? formatUser(validated) : null;
};

// Multiple parameters
const add = (a, b) => a + b;

// Single parameter (parentheses optional)
const double = n => n * 2;

// No parameters
const generateId = () => Math.random().toString(36).substr(2, 9);

// Object return (requires parentheses)
const createUser = (name, email) => ({ name, email, id: generateId() });
```

⚠️ **AVOID: Arrow functions for methods**
```javascript
// ❌ BAD: Arrow function loses 'this' context
const obj = {
  value: 42,
  getValue: () => this.value  // 'this' is not obj
};

// ✅ GOOD: Regular method
const obj = {
  value: 42,
  getValue() {
    return this.value;  // 'this' is obj
  }
};
```

### Optional Chaining

✅ **GOOD: Safe property access**
```javascript
const city = user?.address?.city;
const firstItem = array?.[0];
const result = obj?.method?.();

// With nullish coalescing
const displayName = user?.profile?.displayName ?? user?.name ?? 'Anonymous';
```

❌ **BAD: Manual null checking**
```javascript
const city = user && user.address && user.address.city;
```

### Nullish Coalescing

✅ **GOOD: Use ?? for null/undefined checks**
```javascript
const value = userInput ?? defaultValue;
const count = data.count ?? 0;

// Different from || which treats falsy values
const port = config.port ?? 3000;  // 0 is valid
const enabled = config.enabled ?? true;  // false is valid
```

❌ **BAD: Using || for defaults**
```javascript
const port = config.port || 3000;  // 0 becomes 3000!
const enabled = config.enabled || true;  // false becomes true!
```

---

## Variable Declaration

### const vs let

✅ **GOOD: Use const by default**
```javascript
const user = { name: 'John', age: 30 };
const API_URL = 'https://api.example.com';
const items = [1, 2, 3];

// Use let only when reassignment needed
let counter = 0;
counter++;

let result;
if (condition) {
  result = calculate();
} else {
  result = defaultValue;
}
```

❌ **BAD: Using var**
```javascript
var name = 'John';  // NEVER use var
var count = 0;      // Use const or let
```

### Naming Conventions

```javascript
// Variables & functions: camelCase
const userName = 'John';
function calculateTotal() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const API_URL = 'https://api.example.com';

// Classes: PascalCase
class UserService {}
class PaymentProcessor {}

// Private properties: prefix with _
class User {
  _privateData = null;
  
  _privateMethod() {}
}

// Boolean variables: is/has prefix
const isActive = true;
const hasPermission = false;
const canEdit = true;

// Arrays: plural names
const users = [];
const items = [];

// Single item: singular
const user = users[0];
```

---

## Functions

### Function Declaration vs Expression

```javascript
// ✅ GOOD: Function declaration (hoisted)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD: Arrow function for simple expressions
const double = n => n * 2;
const add = (a, b) => a + b;

// ✅ GOOD: Named function expression
const factorial = function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
};

// ❌ AVOID: Anonymous function expressions (hard to debug)
const calc = function(x) {
  return x * 2;
};
```

### Pure Functions

✅ **GOOD: Pure functions (no side effects)**
```javascript
// Pure: same input = same output, no side effects
function add(a, b) {
  return a + b;
}

function calculateDiscount(price, discountPercent) {
  return price * (1 - discountPercent / 100);
}

// Pure: returns new object
function updateUser(user, updates) {
  return { ...user, ...updates };
}
```

❌ **BAD: Impure functions**
```javascript
let total = 0;

// Impure: modifies external state
function addToTotal(amount) {
  total += amount;
  return total;
}

// Impure: mutates input
function updateUser(user, updates) {
  user.name = updates.name;  // Mutation!
  return user;
}
```

### Default Parameters

✅ **GOOD: Use default parameters**
```javascript
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

function createUser(name, role = 'user', active = true) {
  return { name, role, active };
}

// Complex defaults
function processData(data, options = {}) {
  const {
    limit = 10,
    offset = 0,
    sortBy = 'date'
  } = options;
  
  // Process...
}
```

### Rest Parameters

✅ **GOOD: Use rest for variable arguments**
```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4);  // 10

function logMessage(level, ...messages) {
  console[level](...messages);
}

logMessage('info', 'User logged in:', userName);
```

### Function Composition

✅ **GOOD: Compose small functions**
```javascript
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

// Small, focused functions
const trim = str => str.trim();
const lowercase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '-');

// Compose them
const slugify = pipe(trim, lowercase, removeSpaces);

slugify('  Hello World  ');  // 'hello-world'
```

---

## Objects & Arrays

### Object Shorthand

✅ **GOOD: Use object shorthand**
```javascript
const name = 'John';
const age = 30;

// Shorthand property
const user = { name, age };

// Shorthand method
const obj = {
  // Instead of: getValue: function() { ... }
  getValue() {
    return this.value;
  },
  
  // Computed property name
  [dynamicKey]: 'value'
};
```

### Object Methods

✅ **GOOD: Use modern object methods**
```javascript
// Object.entries - iterate key-value pairs
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Object.keys - get keys
const keys = Object.keys(user);

// Object.values - get values
const values = Object.values(user);

// Object.fromEntries - create object from entries
const obj = Object.fromEntries([['name', 'John'], ['age', 30]]);

// Object.assign - shallow copy/merge
const merged = Object.assign({}, defaults, options);

// Better: spread operator
const merged = { ...defaults, ...options };
```

### Array Methods

✅ **GOOD: Use modern array methods**
```javascript
const users = [
  { name: 'John', age: 30, active: true },
  { name: 'Jane', age: 25, active: false },
  { name: 'Bob', age: 35, active: true }
];

// map - transform items
const names = users.map(user => user.name);

// filter - select items
const activeUsers = users.filter(user => user.active);

// find - find first match
const john = users.find(user => user.name === 'John');

// findIndex - find index
const index = users.findIndex(user => user.name === 'John');

// some - test if any match
const hasInactive = users.some(user => !user.active);

// every - test if all match
const allActive = users.every(user => user.active);

// reduce - accumulate
const totalAge = users.reduce((sum, user) => sum + user.age, 0);

// includes - check if contains
const numbers = [1, 2, 3];
numbers.includes(2);  // true

// flat - flatten nested arrays
const nested = [[1, 2], [3, 4], [5, 6]];
nested.flat();  // [1, 2, 3, 4, 5, 6]

// flatMap - map then flatten
users.flatMap(user => user.tags);
```

### Immutable Updates

✅ **GOOD: Immutable array operations**
```javascript
// Add item
const newArray = [...oldArray, newItem];
const prepend = [newItem, ...oldArray];

// Remove item
const filtered = array.filter(item => item.id !== removeId);

// Update item
const updated = array.map(item =>
  item.id === targetId
    ? { ...item, updated: true }
    : item
);

// Replace item at index
const replaced = [
  ...array.slice(0, index),
  newItem,
  ...array.slice(index + 1)
];
```

❌ **BAD: Mutating arrays**
```javascript
array.push(item);        // Use [...array, item]
array.splice(index, 1);  // Use filter or slice
array[index] = newItem;  // Use map or slice
```

---

## Module System

### ES Modules

✅ **GOOD: Use ES modules**
```javascript
// Named exports
export const API_URL = 'https://api.example.com';
export function fetchUser(id) { /* ... */ }
export class UserService { /* ... */ }

// Named imports
import { API_URL, fetchUser, UserService } from './user-service.js';

// Import all
import * as UserAPI from './user-service.js';

// Rename imports
import { fetchUser as getUser } from './user-service.js';
```

✅ **GOOD: Default exports (use sparingly)**
```javascript
// Default export
export default class App { /* ... */ }

// Default import (any name)
import App from './App.js';
import MyApp from './App.js';  // Same thing
```

❌ **BAD: CommonJS (avoid in modern code)**
```javascript
const fs = require('fs');
module.exports = MyClass;
```

### Barrel Exports

✅ **GOOD: Organize exports**
```javascript
// components/index.js
export { Button } from './Button.js';
export { Card } from './Card.js';
export { Modal } from './Modal.js';

// Usage
import { Button, Card, Modal } from './components/index.js';
```

### Import Order

```javascript
// 1. Node/framework imports
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import axios from 'axios';
import dayjs from 'dayjs';

// 3. Internal absolute imports
import { API_URL } from '@/config';
import { fetchUser } from '@/services/user';

// 4. Internal relative imports
import { Button } from '../../components/Button';
import { formatDate } from '../utils';

// 5. CSS/Styles
import './styles.css';
```

---

## Asynchronous Code

### Async/Await

✅ **GOOD: Use async/await**
```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Multiple concurrent requests
async function fetchData() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return { users, posts, comments };
}

// Sequential when needed
async function processUsers() {
  const users = await fetchUsers();
  const enrichedUsers = await enrichUserData(users);
  return enrichedUsers;
}
```

❌ **BAD: Promise chains**
```javascript
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => user)
    .catch(error => console.error(error));
}
```

❌ **BAD: Incorrect Async Iteration**
```javascript
// ❌ BAD: forEach does NOT wait for promises
users.forEach(async user => {
  await saveUser(user);
});
// Loop finishes before async operations complete!

// ❌ BAD: map returns array of Promises, not values
const users = ids.map(async id => {
  return await fetchUser(id);
});
// users is [Promise, Promise], not [User, User]!

// ✅ GOOD: Use Promise.all with map for parallelism
const users = await Promise.all(ids.map(id => fetchUser(id)));

// ✅ GOOD: Use for...of for sequential execution
for (const user of users) {
  await saveUser(user);
}
```

### Promise Patterns

```javascript
// Promise.all - wait for all (fails if any fails)
const results = await Promise.all([promise1, promise2, promise3]);

// Promise.allSettled - wait for all (never fails)
const results = await Promise.allSettled([promise1, promise2, promise3]);
results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log(result.value);
  } else {
    console.error(result.reason);
  }
});

// Promise.race - first to complete
const fastest = await Promise.race([promise1, promise2]);

// Promise.any - first to succeed
const first = await Promise.any([promise1, promise2]);
```

### Retry Logic

✅ **GOOD: Implement retry with exponential backoff**
```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && i < retries - 1) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Error Handling

### Try-Catch

✅ **GOOD: Specific error handling**
```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError('User not found');
      }
      if (response.status === 403) {
        throw new UnauthorizedError('Access denied');
      }
      throw new ApiError('Failed to fetch user', response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Handle not found
      return null;
    }
    if (error instanceof NetworkError) {
      // Handle network error
      throw new Error('Network connection failed. Please try again.');
    }
    
    // Log unexpected errors
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

### Custom Error Classes

✅ **GOOD: Create custom error types**
```javascript
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Usage
if (!user) {
  throw new NotFoundError('User not found');
}

if (!email.includes('@')) {
  throw new ValidationError('Invalid email format', 'email');
}
```

### Error Boundaries (Patterns)

```javascript
// Global error handler
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // Report to error tracking service
  reportError(event.reason);
});

// Function wrapper for error handling
function withErrorHandler(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      // Handle or rethrow
      throw error;
    }
  };
}

const safeFetchUser = withErrorHandler(fetchUser);
```

---

## Security Best Practices

### XSS Prevention

✅ **GOOD: Sanitize user input**
```javascript
import DOMPurify from 'dompurify';

// Sanitize HTML
function renderUserContent(html) {
  return DOMPurify.sanitize(html);
}

// Escape user input
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Use textContent instead of innerHTML
element.textContent = userInput;  // Safe
// element.innerHTML = userInput;  // Dangerous!
```

❌ **DANGEROUS: Direct HTML insertion**
```javascript
element.innerHTML = userInput;  // XSS vulnerability!
```

### CSRF Protection

✅ **GOOD: Include CSRF tokens**
```javascript
async function updateUser(data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

### Environment Variables

✅ **GOOD: Never commit secrets**
```javascript
// .env (add to .gitignore!)
API_KEY=your_secret_key
API_URL=https://api.example.com

// Access via process.env
const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;
```

❌ **BAD: Hardcoded secrets**
```javascript
const apiKey = 'sk_live_abc123';  // NEVER DO THIS!
```

### Input Validation

✅ **GOOD: Validate all inputs**
```javascript
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateAge(age) {
  const numAge = parseInt(age, 10);
  return Number.isInteger(numAge) && numAge >= 0 && numAge <= 150;
}

function sanitizeFilename(filename) {
  // Remove path traversal attempts
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// Validate before processing
if (!validateEmail(email)) {
  throw new ValidationError('Invalid email format');
}
```

---

## Performance Optimization

### Debounce & Throttle

```javascript
// Debounce - wait for action to stop
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage: search input
const debouncedSearch = debounce(searchUsers, 300);
input.addEventListener('input', e => debouncedSearch(e.target.value));

// Throttle - limit execution rate
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage: scroll event
const throttledScroll = throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);
```

### Memoization

```javascript
// Simple memoization
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveCalculation = memoize((n) => {
  // Complex computation
  return result;
});
```

### Lazy Loading

```javascript
// Dynamic imports
async function loadModule() {
  const module = await import('./heavy-module.js');
  module.initialize();
}

// Load on interaction
button.addEventListener('click', async () => {
  const { modal } = await import('./modal.js');
  modal.show();
});
```

---

## Data Integrity Best Practices

### Financial Math
⚠️ **CRITICAL: Avoid Native Floating Point Math for Currency**
JavaScript numbers are IEEE 754 floats. `0.1 + 0.2 !== 0.3` (it's `0.30000000000000004`).

✅ **GOOD: Use Integer Math (Cents) or Libraries**
```javascript
// Integer Math (work in cents)
const priceInCents = 1099; // $10.99
const quantity = 3;
const total = priceInCents * quantity; // 3297 cents
const display = `$${(total / 100).toFixed(2)}`; // $32.97

// Or use a library like currency.js / decimal.js for complex calculations
```

❌ **BAD: Direct Floating Point Math**
```javascript
const price = 10.99;
const quantity = 3;
// floating point error risk
const total = price * quantity; 
```

---

## Testing Standards

### Unit Tests

✅ **GOOD: Clear test structure**
```javascript
describe('calculateTotal', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  it('should sum item prices correctly', () => {
    const items = [
      { price: 10 },
      { price: 20 },
      { price: 30 }
    ];
    expect(calculateTotal(items)).toBe(60);
  });
  
  it('should handle decimal prices', () => {
    const items = [
      { price: 10.99 },
      { price: 5.50 }
    ];
    expect(calculateTotal(items)).toBeCloseTo(16.49);
  });
  
  it('should throw error for invalid input', () => {
    expect(() => calculateTotal(null)).toThrow();
  });
});
```

### Test Naming

```javascript
// Pattern: should [expected behavior] when [condition]
it('should return user when ID exists', async () => {});
it('should throw error when user not found', async () => {});
it('should validate email format before saving', () => {});
```

### Mocking

```javascript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'John' })
  })
);

// Test
it('should fetch user data', async () => {
  const user = await fetchUser(1);
  
  expect(fetch).toHaveBeenCalledWith('/api/users/1');
  expect(user).toEqual({ id: 1, name: 'John' });
});
```

---

## Code Formatting

### General Rules

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Max 100 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double for JSX
- **Trailing Commas**: Use in multi-line structures

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### ESLint Configuration

```json
{
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  },
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Comments

```javascript
/**
 * Calculates the total price of items in cart
 * @param {Array<{price: number}>} items - Array of items with prices
 * @returns {number} Total price
 */
function calculateTotal(items) {
  // Use reduce for summing prices
  return items.reduce((sum, item) => sum + item.price, 0);
}

// TODO: Add discount calculation
// FIXME: Handle negative prices
// NOTE: This function is called on every render
```

---

## References

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
- [JavaScript.info](https://javascript.info/)