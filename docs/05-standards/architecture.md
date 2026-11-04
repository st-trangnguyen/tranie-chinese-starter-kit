## Mục tiêu của tài liệu

Nếu bạn là thành viên mới của team hoặc đang bắt đầu một feature mới, bài viết này giúp bạn hiểu:

- Source code được tổ chức như thế nào
- Trách nhiệm của từng khu vực trong dự án
- Đoạn code nên đặt ở đâu
- Những nguyên tắc cần tuân thủ khi phát triển feature mới

Mục tiêu của tài liệu này là giúp mọi người có chung một cách suy nghĩ khi làm việc trên codebase.

---

## Tại sao chúng ta cần Architecture?

Khi project còn nhỏ, đặt code theo cảm tính vẫn chạy được. Khi codebase lớn lên, sự thiếu nhất quán tích lũy dần và bắt đầu gây ra các vấn đề thực tế - không phải lúc một mà từ từ, cho đến khi việc thay đổi một chỗ phá vỡ nhiều chỗ khác mà không ai ngờ tới.

Những dấu hiệu thường gặp thường gặp:

- **Logic bị nhân bản.** Cùng một rule "chỉ admin mới thấy bài draft" xuất hiện trong 3 component khác nhau. Khi rule thay đổi, ai đó sửa 2 chỗ và bỏ sót 1.
- **Component phình to.** Một component vừa gọi API, vừa tính toán, vừa format data, vừa render UI. Không ai dám sửa vì không biết sửa một chỗ sẽ ảnh hưởng đến đâu.
- **Không biết đặt code ở đâu.** Người mới vào đoán - hoặc đặt vào component gần nhất vì tiện. Codebase dần trở thành mỗi người một style.
- **Không test được.** Business logic nằm trong component, muốn test phải render cả UI, mock cả React, setup cả DOM.

Architecture của team giải quyết bằng cách trả lời một câu hỏi một cách nhất quán: **"Đoạn code này thuộc về đâu?"**

---

## Nền tảng lý thuyết

Lấy cảm hứng từ **Clean Architecture** (Robert C. Martin, 2017) - tổ chức code thành các layer đồng tâm, trong đó business logic nằm ở core và hoàn toàn độc lập với framework, UI, hay HTTP client.

Ba nguyên tắc gốc chúng ta giữ nguyên:

**Dependency Rule** - dependency chỉ đi một chiều, từ ngoài vào trong. Layer trong không biết sự tồn tại của layer ngoài. Component biết Hook, Hook biết Service - nhưng Service không biết Hook hay Component.

**Business logic độc lập** - rule nghiệp vụ không phụ thuộc vào React, axios, hay bất kỳ external concern nào. Logic "chỉ admin mới thấy bài draft" phải đúng dù UI là React, Vue, hay CLI.

**Separation of concerns** - mỗi layer có một trách nhiệm duy nhất. Không có layer nào làm việc thay cho layer khác.

> Lý thuyết đầy đủ: [Clean Architecture](../articles/clean-architecture-in-frontend)

---

## Chúng ta custom lại gì so với gốc?

Clean Architecture gốc khuyến nghị tách Repository thành class riêng với interface và DI container đầy đủ. Với nhu cầu sử dụng cho đến hiện tại, chúng ta **không làm vậy**.

Thay vào đó, mỗi `*.service.ts` gộp 3 concerns vào một file và tổ chức theo 3 phần rõ ràng theo thứ tự cố định. Đây là quyết định có chủ ý, không phải đơn giản hóa tùy tiện.

| | Repository pattern đầy đủ | Cách team làm |
|---|---|---|
| **File count** | Interface file + Class file + DI config | 1 service file |
| **Boilerplate** | Cao - phải khai báo interface, inject qua constructor | Thấp - gọi trực tiếp |
| **Onboarding** | Cần hiểu DI trước khi đọc được flow | Đọc một file từ trên xuống là hiểu |
| **Testability** | Inject mock qua DI | Import và override function trực tiếp |
| **Phù hợp khi** | Team lớn, nhiều platform share cùng domain | Team 3–5 người, single platform |

Chúng ta vẫn đạt được separation of concerns và testability - chỉ là ít file hơn, ít ceremony hơn.

---
## Folder Structure

Project được tổ chức theo 3 top-level folder, mỗi folder có trách nhiệm rõ ràng và không overlap nhau:

```
src/
├── core/        ← logic, state, config - không phụ thuộc vào page cụ thể nào
├── pages/       ← entry point của từng route/màn hình
└── shared/      ← UI components, hooks, utils dùng chung toàn app
```

### `core/` - Application Core

Đây là nơi chứa toàn bộ logic của ứng dụng. Không có JSX render ở đây - chỉ có data, state, config, và business rules.

```
core/
├── services/    ← HTTP calls + business logic + use cases
├── store/       ← global state (Zustand, Redux, hoặc tương đương)
├── contexts/    ← React Context cho cross-cutting concerns (auth, theme, locale)
├── router/      ← route definitions, route guards
├── layouts/     ← layout components (AppLayout, AuthLayout...)
└── constants/   ← app-wide constants, enums, config values
```

`core/services/` là layer quan trọng nhất - được giải thích chi tiết ở mục [Cấu trúc một Service file](../articles/tong-quan-kien-truc-frontend#cau-truc-mot-service-file) bên dưới.

### `pages/` - Entry Points

Mỗi page là entry point của một route. Page chứa component gốc của màn hình đó - nhận data từ hook, compose các component lại, không chứa business logic.

```
pages/
├── users/
│   └── UserPage.tsx
└── bookings/
    └── BookingPage.tsx
```

Page component nên mỏng - nếu một page file chứa số lượng dòng lớn, đó là dấu hiệu logic đang bị đặt sai chỗ.

### `shared/` - Shared Resources

Những thứ không thuộc về một page hay một domain cụ thể - dùng được ở nhiều nơi mà không cần biết context.

```
shared/
├── components/  ← UI primitives: Button, Modal, Input, Table...
├── hooks/       ← reusable stateful logic không gắn với domain
├── utils/       ← pure utility functions (format, parse, calculate)
├── types/       ← TypeScript interfaces và domain types
└── validators/  ← validation schemas (Zod, Yup...) dùng chung
```

---

## Layer Structure và Mapping vào Folder

Clean Architecture layer map vào folder structure như sau:
![image](/files/2026/06/16/1781605479407-2058c17370f85989.webp){max-width=800px}


Dependency flow theo một chiều duy nhất:

```
pages/  →  shared/hooks  →  core/services  →  core/services/api.service
       ↘                 ↘
        shared/components  shared/utils / shared/types
```

---

## Vai trò của từng layer

### `pages/` - Render và Compose

Page nhận data từ hook, truyền xuống component, không làm gì khác. Nếu page cần hiển thị danh sách booking, nó gọi `useBookingList()` rồi truyền kết quả cho `<BookingTable />`. Logic lọc, sắp xếp, validate — không có gì ở đây.

```tsx
// pages/bookings/BookingPage.tsx
function BookingPage() {
  const { bookings, isLoading } = useBookingList(); // từ shared/hooks

  if (isLoading) return <PageSpinner />;
  return <BookingTable bookings={bookings} />;      // từ shared/components
}
```

### `shared/hooks/` - Stateful Logic

Hook là cầu nối giữa React lifecycle và service layer. Hook quyết định *khi nào* gọi service (on mount, on dependency change, on user action) - nhưng không quyết định service làm gì bên trong.

```ts
// shared/hooks/useBookingList.ts
function useBookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBookingsForUser(user)         // gọi use case từ core/services
      .then(setBookings)
      .finally(() => setIsLoading(false));
  }, [user.id]);

  return { bookings, isLoading };
}
```

### `shared/components/` - UI Primitives

Component nhận data qua props, render ra JSX. Không biết data đến từ đâu. Các component trong `shared/components/` là generic - không gắn với domain booking, user, hay building cụ thể nào.

### `core/services/` - Business + Data Layer

Nơi chứa toàn bộ business logic và data fetching. Framework-free hoàn toàn. Được tổ chức thành 3 phần cố định (xem mục tiếp theo).

### `core/store/` - Global State

Chứa state cần chia sẻ giữa nhiều page hoặc không thể truyền qua props (auth state, notification queue, cart...). Store không chứa business logic - logic vẫn nằm trong service, store chỉ lưu kết quả.

### `core/contexts/` - Cross-cutting Concerns

React Context cho những thứ cần inject sâu vào cây component mà không muốn prop drilling: theme, locale, auth user hiện tại. Khác với store ở chỗ Context thường đi kèm với Provider pattern và phù hợp với những thứ ít thay đổi.

---

## Cấu trúc một Service file

Mỗi `*.service.ts` trong `core/services/` (trừ `api.service.ts`) gồm **3 phần theo thứ tự cố định**. Thứ tự này không tùy tiện: đọc từ trên xuống = từ "gần infrastructure" đến "gần business".

```ts
// core/services/booking.service.ts

import api from './api.service';
import { isAdmin } from './user.service';
import type { Booking, BookingRaw, User, CreateBookingPayload } from '@/shared/types';

// ─────────────────────────────────────────────────────────────────────
// PHẦN 1 - HTTP CALLS
//
// - Gọi API, nhận raw response
// - Map raw response → domain type
// - Không export (bên ngoài gọi qua Use Cases ở Phần 3)
// - Không chứa business logic
// ─────────────────────────────────────────────────────────────────────

function toBooking(raw: BookingRaw): Booking {
  return {
    id: raw.id,
    roomId: raw.room_id,
    userId: raw.user_id,
    status: raw.status,
    startTime: new Date(raw.start_time),
    endTime: new Date(raw.end_time),
  };
}

async function fetchBookings(): Promise<Booking[]> {
  const res = await api.get('/bookings');
  return res.data.map(toBooking);
}

async function fetchBookingById(id: string): Promise<Booking> {
  const res = await api.get(`/bookings/${id}`);
  return toBooking(res.data);
}

async function createBookingRequest(payload: CreateBookingPayload): Promise<Booking> {
  const res = await api.post('/bookings', payload);
  return toBooking(res.data);
}

async function cancelBookingRequest(id: string): Promise<Booking> {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return toBooking(res.data);
}

// ─────────────────────────────────────────────────────────────────────
// PHẦN 2 - BUSINESS LOGIC
//
// - Pure functions: cùng input luôn cho cùng output
// - Không import api, không import React
// - Export để có thể test riêng lẻ
// - Mỗi function = một rule nghiệp vụ rõ ràng
// ─────────────────────────────────────────────────────────────────────

export function filterBookingsByUser(bookings: Booking[], user: User): Booking[] {
  // Rule: admin thấy tất cả booking; user thường chỉ thấy booking của mình
  if (isAdmin(user)) return bookings;
  return bookings.filter(b => b.userId === user.id);
}

export function canCancelBooking(booking: Booking, user: User): boolean {
  // Rule: chỉ được cancel booking của chính mình (hoặc admin)
  // Booking đã cancelled hoặc đã qua rồi thì không cancel được nữa
  if (booking.status === 'cancelled') return false;
  if (booking.endTime < new Date()) return false;
  return booking.userId === user.id || isAdmin(user);
}

export function isUpcoming(booking: Booking): boolean {
  return booking.startTime > new Date();
}

export function hasConflict(newBooking: CreateBookingPayload, existing: Booking[]): boolean {
  // Rule: không được đặt phòng trùng giờ với booking đã có của cùng phòng
  return existing.some(
    b =>
      b.roomId === newBooking.roomId &&
      b.status !== 'cancelled' &&
      newBooking.startTime < b.endTime &&
      newBooking.endTime > b.startTime
  );
}

// ─────────────────────────────────────────────────────────────────────
// PHẦN 3 - USE CASES
//
// - Orchestrate HTTP calls + business logic thành flow hoàn chỉnh
// - Export vì Hook sẽ gọi trực tiếp
// - Mỗi use case = một tác vụ cụ thể của người dùng
// - Throw Error có message rõ nghĩa khi business rule bị vi phạm
// ─────────────────────────────────────────────────────────────────────

export async function getBookingsForUser(user: User): Promise<Booking[]> {
  const all = await fetchBookings();
  return filterBookingsByUser(all, user);
}

export async function cancelBooking(bookingId: string, currentUser: User): Promise<Booking> {
  const booking = await fetchBookingById(bookingId);

  if (!canCancelBooking(booking, currentUser)) {
    throw new Error('Booking này không thể huỷ — đã kết thúc, đã huỷ, hoặc bạn không có quyền.');
  }

  return cancelBookingRequest(bookingId);
}

export async function createBooking(
  payload: CreateBookingPayload,
  currentUser: User
): Promise<Booking> {
  // Validate input trước khi gọi API
  if (payload.startTime >= payload.endTime) {
    throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc.');
  }

  // Kiểm tra conflict với booking hiện có
  const existing = await fetchBookings();
  if (hasConflict(payload, existing)) {
    throw new Error('Phòng đã được đặt trong khoảng thời gian này.');
  }

  return createBookingRequest({ ...payload, userId: currentUser.id });
}
```

Lý do 3 phần quan trọng: khi debug, bạn biết ngay cần đọc phần nào. API trả về sai data? Phần 1. Logic filter sai? Phần 2. Flow không đúng thứ tự? Phần 3.

---

## Data Flow - Trace một feature end-to-end

Ví dụ: **"User mở trang Bookings, thấy danh sách booking của mình"**

```
[1] pages/bookings/BookingPage.tsx mount
         ↓
[2] shared/hooks/useBookingList.ts khởi động
         ↓
[3] core/services/booking.service.ts — getBookingsForUser() (Use Case)
         ↓
[4] core/services/booking.service.ts — fetchBookings() (HTTP Call)
         ↓
[5] core/services/booking.service.ts — filterBookingsByUser() (Business Logic)
         ↓
[6] Hook nhận kết quả → set state
         ↓
[7] BookingPage re-render → truyền data xuống shared/components/BookingTable
```

Mỗi bước chỉ biết đúng thứ nó cần biết:

- `BookingPage` không biết có rule phân quyền tồn tại.
- `useBookingList` không biết endpoint API là gì.
- `filterBookingsByUser` không biết React hay axios là gì.
- `fetchBookings` không biết ai sẽ dùng data nó trả về.

---

## Dependency Rules

```
✅ pages/          →  shared/hooks
✅ pages/          →  shared/components
✅ shared/hooks    →  core/services
✅ shared/hooks    →  shared/utils
✅ core/services   →  core/services/api.service
✅ core/services   →  shared/utils
✅ core/services   →  shared/types
✅ core/services   →  core/constants

❌ core/services   →  React  (useState, useEffect, useRouter...)
❌ core/services   →  axios  trực tiếp (phải qua api.service)
❌ shared/hooks    →  core/services/api.service  trực tiếp (phải qua service)
❌ shared/utils    →  core/services  (utils là leaf node)
❌ pages/          →  core/services  trực tiếp (phải qua shared/hooks)
```

### Tại sao mỗi rule này tồn tại?

**`core/services` không được import React** - Service chạy độc lập với React environment. Vi phạm rule này khiến service không test được trong Node.js và gắn chặt business logic vào một framework cụ thể.

**`core/services` không được import axios trực tiếp** - `api.service.ts` là nơi duy nhất cấu hình auth header, base URL, error interceptor. Import axios trực tiếp ở chỗ khác nghĩa là bypass toàn bộ cấu hình đó.

**`shared/hooks` không được gọi `api.service` trực tiếp** - Hook bỏ qua service = business logic và HTTP call bị trộn lẫn vào hook. Khi hook khác cần cùng logic, phải copy hoặc bỏ sót.

**`pages/` không được gọi `core/services` trực tiếp** - Page bỏ qua hook = không có chỗ tập trung quản lý loading/error state. Mỗi page tự xử lý riêng, không nhất quán.

**`shared/utils` không được import `core/services`** - Utils phải là leaf node, không có dependency ngược lên. Vi phạm rule này tạo ra circular dependency và khiến utils không còn portable nữa.

---

## Bảng phân biệt nhanh

| Code này làm gì? | Đặt ở đâu |
|---|---|
| Entry point của một route/màn hình | `pages/<feature>/` |
| Render JSX, UI primitives | `shared/components/` |
| React state + lifecycle, tái dùng nhiều nơi | `shared/hooks/` |
| Gọi API, map raw response → domain type | `core/services/` — Phần 1 |
| Rule nghiệp vụ, điều kiện phân quyền | `core/services/` — Phần 2 |
| Kết hợp HTTP + rule thành một flow | `core/services/` — Phần 3 |
| Global state (auth, notification...) | `core/store/` |
| Cross-cutting React Context | `core/contexts/` |
| Route definitions, route guards | `core/router/` |
| Pure utility (format, parse, calculate) | `shared/utils/` |
| Validation schema (Zod, Yup...) | `shared/validators/` |
| TypeScript interface, domain type | `shared/types/` |
| App-wide constants, enums | `core/constants/` |

---

## Tham khảo

Các tài liệu liên quan:

- [Clean Architecture In Frontend](../articles/clean-architecture-in-frontend)
- Frontend Code Placement Guide