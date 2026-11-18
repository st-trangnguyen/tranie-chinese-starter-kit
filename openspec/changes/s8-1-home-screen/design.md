# Design: S8.1 Trang chủ

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/home-screen/spec.md`, `specs/daily-study-time/spec.md`,
`specs/learning-path/spec.md`, `specs/lesson-runner/spec.md`. Case nghiệm thu: `test-cases.md`. Luật layer/dependency/service
3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau khi merge PR spec #129, không phải đề xuất):

- Route `/` (index) là `pages/onboarding/containers/StartGate.tsx`: `useOnboarding().needsOnboarding` → `<Navigate replace>`
  tới `/onboarding` hoặc `ROUTE_PATHS.lesson(FIRST_LESSON_ID)`. `OnboardingContainer` khi đã xong (`!needsOnboarding &&
  step === 'welcome'`) cũng `Navigate` về bài 1; xong bước cuối thì `navigate(FIRST_LESSON_PATH)` (S1.3 AC4). Manifest PWA
  `start_url: '/'` (`vite.config.ts`).
- `ROUTE_PATHS` ở `core/constants/app.constants.ts` (`onboarding`, `learningPaths`, `lesson(id)`, `placementTest(unitId)`…).
  Bảng route gom ở `pages/page.routes.ts`, mỗi feature một `<feature>.routes.ts` lazy.
- `ProgressService` (`shared/services/progress.service.ts`, 127 dòng): Phần 2 có `deriveLessonStatuses(stages,
  completedIds)` (bài đầu luôn mở, bài sau mở khi bài liền trước xong), Phần 3 có `needsOnboarding`, `completeOnboarding`,
  `getCompletedLessonIds`. `ContentService.getPathMap()` trả `PathMap { stages, lessonTitles }`. `useLearningPath` gọi hai
  service song song, IndexedDB lỗi thì coi như chưa xong bài nào.
- `ProgressStore` (`core/services/progress-store.service.ts`): `DexieProgressStore` đọc qua Zod (`parseSettings` rơi về
  mặc định từng field — mục tiêu hỏng thành 15; dòng `lessonProgress` hỏng bị bỏ qua — bài đó coi là chưa xong). Singleton
  `progressStore`. `db.helper.ts` có version 1 (`settings`) và 2 (`lessonProgress`).
- Màn bài: `pages/lesson/containers/LessonRunnerContainer.tsx` chạy cả bài thường, bài kiểm tra cuối chủ đề (route
  `lessons/:lessonId`) và kiểm tra vượt cấp (`PlacementTestContainer` render lại `LessonRunnerContainer` khi biết
  `lessonId`). Màn tổng kết `LessonSummary` (3 props) nằm trong cùng container. `LessonService.openLesson` đã nối lại câu dở
  (S3.3) và cho bài `test` luôn bắt đầu từ câu 1 (S3.5) — "Vào học" chỉ cần điều hướng tới `ROUTE_PATHS.lesson(id)`.
  `useLessonRunner.ts` 243 dòng (gần ngưỡng 300).
- `core/hooks/useOnlineStatus.ts` là mẫu `useSyncExternalStore` cho sự kiện trình duyệt.
- Test: Vitest + `fake-indexeddb` (DB mặc định dùng chung, test container tự xoá bảng ở `beforeEach`); store test tạo DB tên
  ngẫu nhiên (`createDatabase('test-…')`); test route thật qua `openRoute` (`src/test/stroke-order-route.tsx`) và
  `renderWithProviders` + `LocationProbe`. E2E Playwright chỉ project `chromium` (Pixel 7), đã dùng `page.clock` (E7).
- E2E hiện mong đợi `/` → bài 1: `e2e/E1/s1.3-onboarding.spec.ts` (cả `/onboarding` → bài 1), `e2e/E3/s3.1-learning-path.spec.ts`.
- `docs/03-architecture.md` §6.2 đã dự kiến bảng `dailyStats` khóa `date` với `minutes`; §6.3 dự kiến `addMinutes(date,
  minutes)`. Người thật đã chốt (proposal, Open Questions 1): lưu theo **giây**, giữ mọi ngày, PR code sửa §6.2/§6.3.

## Goals / Non-Goals

**Goals:**

- Mọi quy tắc (chọn bài tiếp theo, chia thời gian theo ngày, làm tròn, đạt mục tiêu) là hàm thuần ở `ProgressService` Phần 2,
  test bằng bảng không cần React hay IndexedDB.
- Ghi thời gian học không phụ thuộc vào việc trang kịp chạy code lúc bị đóng: ghi định kỳ khi màn bài đang hiện, nên mất tối
  đa một chu kỳ (< 30 giây).
- Trang chủ đọc đúng số đã ghi ngay khi quay về từ màn bài (không đua với lần ghi cuối).
- Bảng `dailyStats` đủ cho S8.3 (streak) và S8.5 (sao lưu) dùng lại.

**Non-Goals:**

- Không ghi mục tiêu theo ngày (S8.3), không xuất/nhập `dailyStats` (S8.5), không đổi mục tiêu (S8.2).
- Không tính thời gian ở màn thứ tự nét / luyện viết; không phát hiện người học bỏ đi; không chống cộng trùng hai tab.
- Không thêm dependency.

## Decisions

### D1. Route: Trang chủ ở `/home`, `/` vẫn là cổng mở app

- Feature mới `pages/home/`, `home.routes.ts`: `{ path: 'home', element: HomeContainer }` (lazy), gom vào `page.routes.ts`
  sau `onboardingRoutes`. `ROUTE_PATHS.home = '/home'`.
- `StartGate` (route `/`, giữ ở `pages/onboarding/containers/`): đã xong onboarding → `<Navigate replace
  to={ROUTE_PATHS.home}>` (thay vì bài 1); chưa xong → `/onboarding` như cũ. Bấm biểu tượng app (`start_url: '/'`) → `/` →
  `/home`.
- `OnboardingContainer`: nhánh "đã xong, đang ở bước chào" → `Navigate` tới `ROUTE_PATHS.home`. **Giữ nguyên**
  `goToFirstLesson` sau bước cuối (Scenario "Vừa xong onboarding vẫn vào bài 1"). Hằng `FIRST_LESSON_ID` vẫn dùng.
- Tải lại ở `/learning-paths`, `/lessons/:id`… không đi qua `StartGate` nên ở nguyên màn đó (bảng "Mở app là vào Trang chủ").
- RESTful: `home` là tài nguyên số ít, tên cụ thể. QA dùng `/onboarding` cho "Mở lại màn onboarding" và `/` cho "địa chỉ gốc"
  (ghi vào mô tả PR, tasks 12.5).
- Thay thế: (a) render Trang chủ ngay tại `/` → `StartGate` (feature onboarding) phải import container của feature home
  (import chéo feature), hoặc dời cổng onboarding vào hook trang chủ (trộn hai concern); (b) `/dashboard` — không khớp chữ
  "Trang chủ" người học thấy.

### D2. Dữ liệu: bảng `dailyStats` (Dexie version 3), lưu giây

- `db.helper.ts`: thêm `db.version(3).stores({ settings: 'key', lessonProgress: 'lessonId', dailyStats: 'date' })`, không sửa
  version 1–2. Row type `DailyStatRow { date: string; [field: string]: unknown }` (chưa tin cậy, validate khi đọc) và
  `dailyStats: EntityTable<DailyStatRow, 'date'>` trong `AppDatabase`.
- Schema `@csk/shared` (`packages/shared/src/progress.schema.ts`):
  - `localDateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` — khóa ngày theo giờ máy `YYYY-MM-DD`.
  - `dailyStatSchema = z.object({ date: localDateKeySchema, studySeconds: z.number().finite().nonnegative() })`,
    `type DailyStat`. `studySeconds` là số thực (đơn vị giây): giữ phần lẻ dưới 1 giây giữa các lần ghi, nên "giây lẻ được
    cộng dồn" đúng tuyệt đối, không lệ thuộc chu kỳ ghi. S8.3 sẽ mở rộng schema (mục tiêu của ngày), không đổi field này.
- `ProgressStore` thêm (thay `addMinutes` dự kiến ở docs §6.3):
  - `getDailyStat(date: string): Promise<DailyStat | undefined>` — không có dòng hoặc dòng hỏng (`safeParse` lỗi) → `undefined`.
  - `addStudySeconds(date: string, seconds: number): Promise<void>` — một transaction `rw` trên `dailyStats`: đọc dòng,
    `safeParse`; hợp lệ thì cộng, hỏng hoặc không có thì coi là 0 rồi ghi `{ date, studySeconds }` (dòng hỏng bị thay —
    TC-S8.1-AC2-26). Transaction IndexedDB tuần tự hoá cả giữa hai tab, nên hai tab cộng cùng ngày không mất phần nào.
- **Thứ tự ghi trước đọc** (Trang chủ mount ngay sau khi màn bài unmount ghi phần cuối): `DexieProgressStore` giữ
  `private studyTimeWrites: Promise<void>` — `addStudySeconds` nối vào chuỗi (đồng bộ, trước mọi `await`), lỗi một lần ghi
  không làm gãy chuỗi (`.catch` chuyển thành resolve trong chuỗi, lỗi vẫn trả về cho người gọi); `getDailyStat` chờ chuỗi hiện
  tại rồi mới đọc. Singleton `progressStore` dùng chung cho mọi service nên đủ (không cần dựa vào thứ tự transaction của Dexie).
- Thay thế: lưu phút nguyên (mất phần lẻ — người thật đã loại); lưu giây nguyên (`int`) → phải mang phần dư ms giữa các lần
  ghi trong hook, phức tạp hơn mà không thêm gì; lưu từng phiên học (nhiều dòng) → đọc "hôm nay" phải cộng, S8.3 phức tạp hơn.

### D3. Quy tắc: `ProgressService` Phần 2 (thuần, mỗi method một `Rule:`)

Model `shared/models/home.model.ts`:

```ts
export interface StudyTimeShare { date: string; seconds: number }
export interface TodayStudy { minutes: number; goalMinutes: DailyGoalMinutes; isGoalReached: boolean }
export type NextLesson =
  | { status: 'available'; lessonId: string; title: string }
  | { status: 'all-completed' };
```

- `findNextLessonId(stages, statuses): string | undefined` — Rule: bài tiếp theo là bài đầu tiên theo thứ tự lộ trình đang
  "Đang mở" (`'open'`); không còn bài mở (đã xong mọi bài) thì `undefined`. Dùng `listLessonIdsInOrder` sẵn có; trạng thái từ
  `deriveLessonStatuses` (cùng nguồn với bản đồ lộ trình, nên "khớp bản đồ lộ trình" của QA đúng theo cấu tạo).
- `splitStudyTimeByDay(startMs, endMs): StudyTimeShare[]` — Rule: mỗi phần thời gian tính vào ngày (giờ máy) nó diễn ra; qua
  0 giờ thì cắt tại 0 giờ. `endMs <= startMs` (đồng hồ máy bị chỉnh lùi) → `[]`. Ranh giới ngày dùng util thuần
  `shared/utils/date.utils.ts`: `toLocalDateKey(ms): string` (`YYYY-MM-DD` theo `getFullYear/getMonth/getDate`) và
  `startOfNextLocalDay(ms): number` (`new Date(y, m, d + 1)` — đúng cả ngày đổi giờ mùa hè).
- `toStudyMinutes(seconds): number` — Rule: số phút hiện là tổng giây trong ngày làm tròn xuống (`Math.floor(seconds / 60)`).
- `isDailyGoalReached(minutes, goalMinutes): boolean` — Rule: đạt khi `minutes >= goalMinutes`.

### D4. Use case: `ProgressService` Phần 3

- Phần 1 thêm `private readDailyStat(date)`, `private addStudySeconds(date, seconds)` (ủy quyền store).
- `recordStudyTime(startMs: number, endMs: number): Promise<void>` — `splitStudyTimeByDay`, gọi `addStudySeconds` cho từng
  phần **đồng bộ** (map rồi `Promise.all`, không `await` trước khi xếp hàng) để thứ tự ghi trước đọc của D2 giữ được.
- `getTodayStudy(now: number = Date.now()): Promise<TodayStudy>` — đọc settings và `getDailyStat(toLocalDateKey(now))` song
  song; không có dòng / dòng hỏng → 0 giây; `minutes = toStudyMinutes`, `goalMinutes = settings.dailyGoalMinutes` (hỏng → 15
  nhờ `parseSettings`), `isGoalReached`. Không mở được IndexedDB (chế độ riêng tư): settings → `DEFAULT_SETTINGS`, phút → 0
  (`.catch` trong use case, Trang chủ vẫn hiện bình thường); không throw.
- File `progress.service.ts` dự kiến ~200 dòng (< 300). Test tách file theo concern (mục Test).
- Thay thế: service mới `study-time.service.ts` — proposal chốt dùng service tiến độ hiện có, và mục tiêu nằm ở settings của
  `ProgressService`; tách sẽ phải gọi chéo hai service cho một use case.

### D5. Ghi thời gian ở màn bài

- **Hook hạ tầng `core/hooks/useVisibleTimeSegments.ts`** (timer + sự kiện trình duyệt, không nghiệp vụ):
  `useVisibleTimeSegments(onSegment: (startMs: number, endMs: number) => void, flushIntervalMs: number): void`.
  - Một effect (deps `[onSegment, flushIntervalMs]`) giữ `segmentStart: number | null` trong closure:
    - mount: trang đang hiện (`document.visibilityState === 'visible'`) → `segmentStart = Date.now()`, bật interval.
    - mỗi `flushIntervalMs`: phát `[segmentStart, now]`, `segmentStart = now`.
    - `visibilitychange` → `hidden`: phát `[segmentStart, now]` **ngay trong listener** (thời điểm lấy lúc sự kiện, không chờ
      React render), `segmentStart = null`, tắt interval; → `visible`: `segmentStart = now`, bật interval.
    - cleanup (rời màn): phát phần đang mở nếu có, gỡ listener, tắt interval.
  - Listener trực tiếp thay vì `useSyncExternalStore` + effect: effect cleanup của React có thể chạy trễ khi tab vào nền, làm
    thời gian nền bị tính (Scenario "Thời gian app chạy nền không tính").
- **Hằng** `STUDY_TIME_FLUSH_INTERVAL_MS = 15_000` trong `core/constants/study-time.constants.ts` (hằng hạ tầng app). 15 giây
  (một nửa ngưỡng 30 giây của spec) để còn lề cho độ trễ timer và transaction ghi: đóng app bất kỳ cách nào chỉ mất phần sau
  lần ghi cuối, < 15 giây + độ trễ ghi.
- **Hook trang `pages/lesson/hooks/useStudyTimeRecorder.ts`**: `useStudyTimeRecorder(): void` — `service = useMemo(() => new
  ProgressService())`, `onSegment = useCallback((s, e) => { service.recordStudyTime(s, e).catch(() => { /* không ghi được
  thời gian thì bỏ qua, không chặn bài */ }) }, [service])`, gọi `useVisibleTimeSegments(onSegment,
  STUDY_TIME_FLUSH_INTERVAL_MS)`. Comment trong `catch` nêu lý do, theo mẫu `useLearningPath`.
- **Gắn vào** `LessonRunnerContainer` (một dòng `useStudyTimeRecorder()` ở đầu component). Container này phủ bài thường, học
  lại bài đã xong, bài kiểm tra cuối chủ đề, kiểm tra vượt cấp (qua `PlacementTestContainer`) và màn tổng kết của chúng; màn
  khác (Trang chủ, lộ trình, onboarding, thứ tự nét, luyện viết) không gọi hook nên không tính. Không đặt trong
  `useLessonRunner` (243 dòng, concern khác).
- Thay thế: (a) ghi một lần lúc rời màn / `pagehide` → đóng đột ngột mất cả phiên; (b) ghi mỗi giây → quá nhiều transaction;
  (c) đo bằng `performance.now()` → không biết ranh giới ngày theo giờ máy.

### D6. Trang chủ: hook + container + component

- `pages/home/hooks/useHome.ts`: `useHome(): { nextLesson: NextLesson | null; todayStudy: TodayStudy | null;
  hasNextLessonError: boolean }` (`null` = đang nạp).
  - Effect bài tiếp theo (mount): `Promise.all([contentService.getPathMap(), progressService.getCompletedLessonIds()
    .catch(() => new Set())])` như `useLearningPath`, rồi `deriveLessonStatuses` + `findNextLessonId` → `NextLesson` (tiêu đề
    từ `pathMap.lessonTitles`). `getPathMap` lỗi → `hasNextLessonError` (`.catch` + cờ `isActive`, mẫu `useLearningPath`);
    `HomeContainer` hiện `<p role="alert">` `home:loadError` thay `NextLessonCard`, dòng phút hôm nay và link "Xem lộ trình"
    vẫn hiện. Nhánh này không có Scenario riêng trong spec nhưng là code production, nên có cặp RED/GREEN riêng (tasks 8.23–8.24)
    theo §0.7.
  - Effect phút hôm nay: deps `[progressService, isPageVisible]` với `isPageVisible` từ `core/hooks/usePageVisibility.ts`
    (`useSyncExternalStore` trên `visibilitychange`, mẫu `useOnlineStatus`). Khi `isPageVisible` → `getTodayStudy()` (không throw, D4); cờ
    `isActive` như `useLearningPath` để kết quả cũ không ghi đè.
    Kết quả: tính lại khi Trang chủ mount (mở app, quay về từ màn khác — route đổi thì container mount lại) và khi hiện lại
    sau khi bị ẩn; không có timer nên không tự đổi khi đang hiện qua nửa đêm (đúng Scenario "Để Trang chủ mở qua nửa đêm").
- `pages/home/containers/HomeContainer.tsx` (default export, lazy): `<main className="mx-auto flex min-h-screen max-w-md
  flex-col gap-xl p-xl">`, `<h1>` `home:title` "Trang chủ", `<NextLessonCard>`, `<TodayStudyStatus>`, `<Link
  to={ROUTE_PATHS.learningPaths}>` `home:learningPathLink` "Xem lộ trình" (mọi trạng thái). Đang nạp → `<p role="status">`.
- `pages/home/components/NextLessonCard.tsx` — props `{ nextLesson: NextLesson }`: `available` → `<section>` có `<h2>`
  `home:nextLesson` "Bài tiếp theo", tiêu đề bài, `<Link className="btn btn-primary" to={ROUTE_PATHS.lesson(id)}>` "Vào học"
  (liên kết điều hướng trông như nút, vùng chạm ≥ 44×44 px, mẫu nút "Tập viết" S6.2 D8; test truy vấn `getByRole('link',
  { name: 'Vào học' })`); `all-completed` → `<p>` "Bạn đã học xong lộ trình hiện có.", không có "Vào học".
- `pages/home/components/TodayStudyStatus.tsx` — props `{ todayStudy: TodayStudy }`: `<p>` `home:todayStudy` "Hôm nay:
  {{minutes}} / {{goalMinutes}} phút"; `isGoalReached` → thêm `<p>` `home:goalReached` "Đã đạt mục tiêu hôm nay" (chữ, không
  chỉ màu).
- Focus nhìn thấy dùng `:focus-visible` chung (`base/_base.css`).

### D7. Liên kết "Trang chủ"

- `LearningPathContainer`: `<Link to={ROUTE_PATHS.home} className="learning-path-home-link">` key `learning-path:homeLink`
  "Trang chủ", đặt ngay trên `<h1>` (đầu thứ tự Tab, thấy được ở 375 px).
- `LessonSummary`: thêm `<Link to={ROUTE_PATHS.home} className="btn btn-ghost">` key `lesson:summary.home` "Trang chủ",
  sau nút "Làm lại"/cảnh báo. Không thêm prop (vẫn 3). `LessonRunner` (đang làm câu) không có liên kết.
- Liên kết dùng `ROUTE_PATHS`, không import chéo feature `pages/home`.

### D8. i18n, style

- `assets/i18n/vi/home.json`: `title` "Trang chủ", `nextLesson` "Bài tiếp theo", `startLesson` "Vào học", `allCompleted`
  "Bạn đã học xong lộ trình hiện có.", `todayStudy` "Hôm nay: {{minutes}} / {{goalMinutes}} phút", `goalReached` "Đã đạt mục
  tiêu hôm nay", `learningPathLink` "Xem lộ trình", `loading` "Đang tải…", `loadError` "Chưa tải được bài tiếp theo.". Thêm
  `'home'` vào `I18N_NAMESPACES` (`core/services/i18n.service.ts`) và `src/test/i18n.ts`. `learning-path.json` thêm
  `homeLink`; `lesson.json` thêm `summary.home`.
- `styles/tailwind/components/_home.css` (import trong `main.css`): `.home-title`, `.home-next-lesson`,
  `.home-next-lesson-title`, `.home-today-study`, `.home-goal-reached`, `.home-link`; `.learning-path-home-link` vào
  `_learning-path.css`. JSX chỉ layout/spacing (§6); visual qua `@apply` token semantic (tự đổi theo theme tối).

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `HomeContainer`, `NextLessonCard`, `TodayStudyStatus` | `useHome`, model type, `ROUTE_PATHS`, react-router | ✅ không chạm `shared/services` |
| `useHome` | `ContentService`, `ProgressService`, `usePageVisibility` | ✅ hooks → shared/services, core/hooks |
| `useStudyTimeRecorder` | `ProgressService`, `useVisibleTimeSegments`, `STUDY_TIME_FLUSH_INTERVAL_MS` | ✅ |
| `LessonRunnerContainer` (sửa) | `useStudyTimeRecorder` (hook cùng feature) | ✅ không gọi service trực tiếp |
| `LessonSummary`, `LearningPathContainer`, `StartGate`, `OnboardingContainer` (sửa) | `ROUTE_PATHS` | ✅ không import `pages/home` |
| `ProgressService` | `ProgressStore`, `@csk/shared`, `learning-path.utils`, `date.utils` | ✅ không React, không Dexie |
| `DexieProgressStore` | `dailyStatSchema`, `db.helper` | ✅ core/services → `@csk/shared` |
| `useVisibleTimeSegments`, `usePageVisibility` | chỉ React + DOM | ✅ core/hooks không gọi service |
| `date.utils` | không gì | ✅ leaf |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| Dòng `dailyStats` (IndexedDB) | `dailyStatSchema` (mới) | `DexieProgressStore.getDailyStat`, `addStudySeconds` |
| `settings` (mục tiêu) | `settingsSchema` / `parseSettings` | có sẵn |
| `lessonProgress` | `lessonProgressSchema` | có sẵn |
| Lộ trình, tiêu đề bài | `contentRootSchema`/`lessonSchema` qua `ContentService` | có sẵn |

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Schema `dailyStats` | `packages/shared` | `packages/shared/src/progress.schema.test.ts` |
| Ngày theo giờ máy | `shared/utils` | `apps/web/src/app/shared/utils/date.utils.test.ts` |
| Bài tiếp theo (Phần 2) | `shared/services` | `apps/web/src/app/shared/services/progress.service.next-lesson.test.ts` |
| Chia ngày, làm tròn, đạt mục tiêu, ghi/đọc phút (Phần 2 + 3) | `shared/services` + fake-indexeddb | `apps/web/src/app/shared/services/progress.service.study-time.test.ts` |
| Bảng `dailyStats`, hai tab, ghi trước đọc, dòng hỏng | `core/services` | `apps/web/src/app/core/services/progress-store.daily-stats.test.ts` |
| Đoạn thời gian hiện (interval, ẩn/hiện, rời màn) | `core/hooks` | `apps/web/src/app/core/hooks/useVisibleTimeSegments.test.ts`, `usePageVisibility.test.ts` |
| Màn bài ghi thời gian | container | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.studyTime.test.tsx`, `PlacementTestContainer.studyTime.test.tsx` |
| Liên kết "Trang chủ" trên màn tổng kết | container | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.homeLink.test.tsx` |
| Liên kết "Trang chủ" trên lộ trình | container | `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.homeLink.test.tsx` |
| Mở app / onboarding → Trang chủ | route thật | `apps/web/src/app/pages/home/containers/HomeContainer.entry.test.tsx` |
| Trang chủ: bài tiếp theo, lỗi nạp lộ trình, phút hôm nay, liên kết | route thật | `apps/web/src/app/pages/home/containers/HomeContainer.test.tsx`, `HomeContainer.todayStudy.test.tsx` |
| Luồng thật, đồng hồ giả, đóng app, hai tab, offline | e2e | `apps/web/e2e/E8/s8.1-home-screen.spec.ts`, `s8.1-study-time.spec.ts`, `s8.1-study-time-close.spec.ts`, `s8.1-home-offline.spec.ts` |

- Vitest đồng hồ: `vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })` (không giả `setTimeout`/
  `setImmediate` để fake-indexeddb vẫn chạy). Mốc thời gian dựng bằng `new Date(y, m, d, h, mi, s)` (giờ local) nên test không
  phụ thuộc múi giờ máy CI.
- Ẩn/hiện trang trong Vitest và Playwright: helper `setPageVisibility(hidden: boolean)` định nghĩa lại getter
  `document.visibilityState`/`document.hidden` rồi phát `visibilitychange` (`src/test/visibility.helpers.ts`,
  `e2e/E8/home.helpers.ts`). Chromium headless không tự ẩn tab.
- E2E dữ liệu tạo sẵn: `e2e/E8/home.helpers.ts` `seedProgress(page, { settings, lessonProgress, dailyStats })` ghi IndexedDB
  bằng API thô trong `page.evaluate` sau khi app đã mở DB (version 3), rồi `page.reload()`. Đồng hồ: `page.clock.install({
  time })` + `page.clock.runFor(ms)` (**không** `fastForward`, vì nó chỉ chạy mỗi timer tối đa một lần, interval ghi định kỳ sẽ
  không lặp). Test qua nửa đêm đặt `test.use({ timezoneId: 'Asia/Ho_Chi_Minh' })` và dựng mốc theo múi giờ đó. Đóng tab:
  `page.close()` rồi mở trang mới cùng context; buộc thoát: CDP `Page.crash` (không chạy `pagehide`/`visibilitychange`).

## Risks / Trade-offs

- [Trình duyệt giảm tần suất timer ở tab nền] → interval chỉ chạy khi trang hiện; lúc ẩn đã ghi và dừng.
- [Máy ngủ mà không phát `visibilitychange`] → lần tick sau sẽ tính cả khoảng ngủ. Hiếm trên mobile (khóa màn hình phát
  `hidden`); chấp nhận, nằm trong out-of-scope "không phát hiện người học bỏ đi".
- [Người học chỉnh đồng hồ máy lùi] → `splitStudyTimeByDay` bỏ đoạn `end <= start`; chỉnh tới thì đoạn đó bị tính. Chấp nhận.
- [Ghi phần cuối lúc rời màn chưa xong khi Trang chủ đọc] → chuỗi `studyTimeWrites` trong store (D2); test ở tầng store và
  container ("Học xong quay lại Trang chủ thấy số phút tăng").
- [Hai tab cùng ghi] → mỗi lần cộng là một transaction `rw`; test hai `DexieProgressStore` trên cùng tên DB.
- [Đổi `/` → `/home` làm hỏng e2e cũ] → task 11.9: sửa `s1.3-onboarding.spec.ts` (dòng 18–21); rà `s3.1-learning-path.spec.ts`
  (dự kiến không đổi) và helper `seedCompletedLessons` của E7 (`reload()` giờ vào `/home`) trong PR code.
- [Sao lưu S8.5 chưa có `dailyStats`] → S8.5 đã coi số phút từng ngày là dữ liệu cần sao lưu (proposal S8.5); không làm ở đây.

## Migration Plan

- Dexie version 3 chỉ thêm bảng, dữ liệu `settings`/`lessonProgress` giữ nguyên; người dùng cũ mở app lần đầu sau cập nhật
  vào `/home` với 0 phút hôm nay.
- Rollback: revert PR. Bảng `dailyStats` còn lại trong IndexedDB của người dùng (Dexie không hạ version); bản cũ mở DB
  version 3 vẫn đọc được hai bảng cũ. Nếu cần bản rollback phải khai báo lại version 3 — ghi chú trong mô tả PR.

## Open Questions

- [x] Câu chữ chưa có trong spec: tiêu đề màn, nhãn "Bài tiếp theo", câu đang tải/lỗi nạp lộ trình → dùng các câu ở D8. Đổi
  câu sau này chỉ đổi file i18n và chuỗi kỳ vọng trong test.
- [x] "Vào học" là liên kết điều hướng (`<a>` trông như nút) chứ không phải `<button>` (rule a11y: điều hướng dùng `<a href>`)
  → QA tìm theo tên "Vào học"; ghi vào mô tả PR (tasks 12.5).
