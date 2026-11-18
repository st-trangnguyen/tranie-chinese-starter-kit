# Tasks: S8.1 Trang chủ

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S8.1-AC2 Làm tròn xuống phút …`). Tên file, hàm, route, field: design D1–D8.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại (như S6.2).
RED cần type/method chưa có thì tạo skeleton không có hành vi trong cùng commit `test(...)` (typecheck sạch, test fail ở assertion).

Vitest: `pnpm --filter @csk/web test:run <mẫu>` (`pnpm --filter @csk/shared test:run <mẫu>` cho schema). Đồng hồ giả:
`vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })`; mốc dựng bằng `new Date(y, m, d, h, mi, s)` (giờ local).
Ẩn/hiện trang: `setPageVisibility(hidden)` trong `src/test/visibility.helpers.ts` (tạo ở 4.1).

## 1. Bảng `dailyStats` — `@csk/shared` + `core/helpers/db.helper.ts` + `core/services/progress-store.service.ts` (design D2)

Test: `packages/shared/src/progress.schema.test.ts` (schema) và `apps/web/src/app/core/services/progress-store.daily-stats.test.ts`
(store, DB tên ngẫu nhiên như `progress-store.service.test.ts`).

- [x] 1.1 RED: S8.1-AC2 "Số phút còn sau khi mở lại app" (tầng store) — store A `addStudySeconds('2026-11-18', 540)`; store B mới trên cùng tên DB `getDailyStat('2026-11-18')` → `{ date, studySeconds: 540 }`; ngày khác → `undefined`. Skeleton trong commit test: type `DailyStat` (`{ date: string; studySeconds: number }`) ở `@csk/shared`, `ProgressStore.getDailyStat` trả `undefined`, `addStudySeconds` no-op. Thêm hai method vào interface `ProgressStore` làm hỏng typecheck ở các object `ProgressStore` viết tay trong test cũ, nên cùng commit test phải thêm stub `getDailyStat: vi.fn(async () => undefined)`, `addStudySeconds: vi.fn(async () => undefined)` vào: `apps/web/src/app/shared/services/progress.service.test.ts` (`makeStore`, dòng 16), `apps/web/src/app/shared/services/lesson.service.test.ts` dòng 383 (`unreadable`) và dòng 738 (`unwritable`) — hai chỗ sau spread `...new DexieProgressStore(...)` không chép method của class nên không tự có hai method mới; rà thêm `grep -rn ': ProgressStore = {' apps/web/src` để không sót; kiểm: `pnpm typecheck` sạch, fail ở `toEqual` (nhận `undefined`)
- [x] 1.2 GREEN: `localDateKeySchema`, `dailyStatSchema` (`studySeconds` số thực ≥ 0, hữu hạn) export từ `@csk/shared`; `db.version(3)` thêm `dailyStats: 'date'`, `DailyStatRow`; `DexieProgressStore.getDailyStat` (`safeParse`), `addStudySeconds` (đọc + cộng + `put`); kiểm: test 1.1 pass, `progress-store.service.test.ts` cũ vẫn pass
- [x] 1.3 RED: S8.1-AC2 "Thời gian học đã lưu bị hỏng" (schema + store) — `dailyStatSchema` từ chối `studySeconds` âm / chuỗi / `NaN` / ngày sai dạng; store: dòng `{ date, studySeconds: 'abc' }` → `getDailyStat` `undefined`; `addStudySeconds(date, 130)` trên dòng hỏng → `studySeconds` 130 (thay dòng hỏng, TC-S8.1-AC2-26); kiểm: fail vì cộng vào giá trị hỏng (hoặc schema còn lỏng)
- [x] 1.4 GREEN: dòng hỏng coi là 0 khi cộng; kiểm: test 1.3 pass
- [x] 1.5 RED: S8.1-AC2 "Hai tab cùng mở màn bài" (tầng store) — hai `DexieProgressStore` trên cùng tên DB, `Promise.all` 10 lần `addStudySeconds(date, 18)` xen kẽ hai store → `studySeconds` 360; kiểm: fail (mất lượt cộng vì đọc–ghi không cùng transaction)
- [x] 1.6 GREEN: `addStudySeconds` chạy trong `db.transaction('rw', db.dailyStats, …)`; kiểm: test 1.5 pass
- [x] 1.7 RED: S8.1-AC2 "Học xong quay lại Trang chủ thấy số phút tăng" (tầng store: ghi trước đọc) — gọi `addStudySeconds(date, 120)` **không await**, ngay sau đó `await getDailyStat(date)` → 120; lần ghi lỗi (stub `db.transaction` reject một lần) không chặn lần đọc sau; kiểm: fail (đọc thấy `undefined`) — nếu pass ngay nhờ thứ tự transaction của Dexie thì vẫn giữ test, tạm cho `getDailyStat` đọc qua transaction riêng mở trước để thấy fail rồi trả lại
- [x] 1.8 GREEN: chuỗi `studyTimeWrites` (design D2): `addStudySeconds` nối đồng bộ, lỗi không làm gãy chuỗi nhưng vẫn reject cho người gọi; `getDailyStat` chờ chuỗi; kiểm: test 1.7 pass, file < 300 dòng

## 2. Quy tắc — `shared/utils/date.utils.ts` + `ProgressService` Phần 2 (design D3)

Test: `apps/web/src/app/shared/utils/date.utils.test.ts`, `apps/web/src/app/shared/services/progress.service.study-time.test.ts`,
`apps/web/src/app/shared/services/progress.service.next-lesson.test.ts` — hàm thuần, không mock store.

- [x] 2.1 RED: S8.1-AC2 "Học qua nửa đêm chia cho hai ngày" (Phần 2) — `toLocalDateKey(new Date(2026, 10, 17, 23, 50))` = `'2026-11-17'`; `startOfNextLocalDay` của mốc đó = `new Date(2026, 10, 18)`; `splitStudyTimeByDay(23:50 ngày 17, 00:10 ngày 18)` = `[{ '2026-11-17', 600 }, { '2026-11-18', 600 }]`; cùng ngày → một phần; `end <= start` → `[]`; kiểm: fail vì skeleton trả `[]`
- [ ] 2.2 GREEN: `date.utils.ts` (`toLocalDateKey`, `startOfNextLocalDay`), `splitStudyTimeByDay` ở Phần 2 kèm `Rule:`; kiểm: test 2.1 pass
- [ ] 2.3 RED: S8.1-AC2 "Làm tròn xuống phút" (Phần 2) — `toStudyMinutes(470)` = 7, `toStudyMinutes(479.9)` = 7, `toStudyMinutes(480)` = 8, `toStudyMinutes(0)` = 0; kiểm: fail
- [ ] 2.4 GREEN: `toStudyMinutes` (`Math.floor`, `Rule:`); kiểm: test 2.3 pass
- [ ] 2.5 RED: S8.1-AC2 "Vừa đúng mục tiêu" (Phần 2) — `isDailyGoalReached(15, 15)` true, `(14, 15)` false, `(45, 30)` true, `(0, 30)` false; kiểm: fail
- [ ] 2.6 GREEN: `isDailyGoalReached` (`>=`, `Rule:`); kiểm: test 2.5 pass
- [ ] 2.7 RED: S8.1-AC1 "Chưa học bài nào" (Phần 2) — lộ trình 2 giai đoạn × 2 nhóm × 2 bài, chưa xong bài nào: `findNextLessonId(stages, deriveLessonStatuses(stages, ∅))` = bài đầu; kiểm: fail vì skeleton trả `undefined`
- [ ] 2.8 GREEN: `findNextLessonId` (bài `'open'` đầu tiên theo `listLessonIdsInOrder`, `Rule:`); kiểm: test 2.7 pass
- [ ] 2.9 RED: S8.1-AC1 "Đã xong vài bài thì hiện bài kế tiếp" (Phần 2) — xong bài 1, 2 → bài 3; kiểm: chạy, nếu pass ngay thì tạm trả bài đầu tiên chưa `completed` bỏ qua trạng thái để thấy fail ở 2.13 hoặc đảo điều kiện `'open'` để thấy fail rồi trả lại
- [ ] 2.10 GREEN: sửa đến khi pass; kiểm: test 2.9 pass
- [ ] 2.11 RED: S8.1-AC1 "Bài kế tiếp ở nhóm hoặc giai đoạn sau" (Phần 2) — xong mọi bài nhóm 1 → bài đầu nhóm 2; xong mọi bài giai đoạn 1 → bài đầu giai đoạn 2; kiểm: như 2.9
- [ ] 2.12 GREEN: sửa đến khi pass; kiểm: test 2.11 pass
- [ ] 2.13 RED: S8.1-AC1 "Còn bài đang mở ở trước một bài đã xong" (Phần 2) — chỉ xong một bài ở nhóm 3 → bài đầu lộ trình (không phải bài ngay sau bài đã xong, dù bài đó cũng `'open'`); kiểm: chạy, nếu pass ngay thì tạm duyệt ngược từ bài đã xong cuối để thấy fail rồi trả lại
- [ ] 2.14 GREEN: sửa đến khi pass; kiểm: test 2.13 pass
- [ ] 2.15 RED: S8.1-AC1 "Đã học xong mọi bài" (Phần 2) — xong mọi bài → `undefined`; kiểm: chạy, nếu pass ngay thì tạm trả bài cuối khi không còn bài mở để thấy fail rồi trả lại
- [ ] 2.16 GREEN: sửa đến khi pass; kiểm: test 2.15 pass, mọi rule có `Rule:`, `progress.service.ts` < 300 dòng

## 3. Use case phút học — `ProgressService` Phần 1 + 3 (design D4)

Test: `apps/web/src/app/shared/services/progress.service.study-time.test.ts` — `ProgressService(new DexieProgressStore(createDatabase('test-…')))`, fake-indexeddb.

- [ ] 3.1 RED: S8.1-AC2 "Giây lẻ được cộng dồn" — `recordStudyTime` hai đoạn 40 giây cùng ngày → `getTodayStudy(now).minutes` = 1; kiểm: fail vì skeleton `recordStudyTime` no-op, `getTodayStudy` trả 0
- [ ] 3.2 GREEN: Phần 1 `readDailyStat`, `addStudySeconds`; Phần 3 `recordStudyTime` (gọi ghi đồng bộ cho mọi phần rồi `Promise.all`), `getTodayStudy` (settings + dòng hôm nay song song, `toStudyMinutes`, `isDailyGoalReached`); model `shared/models/home.model.ts`; kiểm: test 3.1 pass
- [ ] 3.3 RED: S8.1-AC2 "Nhiều lần học trong cùng ngày được cộng" — 08:00–08:05 và 20:00–20:06 cùng ngày → 11; kiểm: chạy, nếu pass ngay thì tạm cho `addStudySeconds` ghi đè thay vì cộng để thấy fail rồi trả lại
- [ ] 3.4 GREEN: sửa đến khi pass; kiểm: test 3.3 pass
- [ ] 3.5 RED: S8.1-AC2 "Sang ngày mới đếm lại" — hôm qua ghi 20 phút, `getTodayStudy(hôm nay 09:00).minutes` = 0; dòng hôm qua vẫn 1200 giây (giữ mọi ngày); kiểm: chạy, nếu pass ngay thì tạm đọc khóa ngày cố định để thấy fail rồi trả lại
- [ ] 3.6 GREEN: sửa đến khi pass; kiểm: test 3.5 pass
- [ ] 3.7 RED: S8.1-AC2 "Học qua nửa đêm chia cho hai ngày" (Phần 3) — `recordStudyTime(23:50 ngày 17, 00:10 ngày 18)`: `getTodayStudy(ngày 17 23:59)` = 10, `getTodayStudy(ngày 18 00:15)` = 10; kiểm: chạy, nếu pass ngay thì tạm ghi cả đoạn vào ngày bắt đầu để thấy fail rồi trả lại
- [ ] 3.8 GREEN: sửa đến khi pass; kiểm: test 3.7 pass
- [ ] 3.9 RED: S8.1-AC2 "Mục tiêu lưu bị hỏng" (Phần 3) — settings `dailyGoalMinutes: 'abc'` → `goalMinutes` 15; IndexedDB không mở được (store stub reject) → `{ minutes: 0, goalMinutes: 15, isGoalReached: false }`, không throw; kiểm: fail ở nhánh store reject
- [ ] 3.10 GREEN: `.catch` trong `getTodayStudy` (settings → `DEFAULT_SETTINGS`, phút → 0); kiểm: test 3.9 pass
- [ ] 3.11 RED: S8.1-AC2 "Thời gian học đã lưu bị hỏng" (Phần 3) — dòng hôm nay hỏng → `minutes` 0; `recordStudyTime` 2 phút 10 giây sau đó → 2; kiểm: chạy, nếu pass ngay thì tạm bỏ nhánh hỏng-coi-là-0 ở 1.4 để thấy fail rồi trả lại
- [ ] 3.12 GREEN: sửa đến khi pass; kiểm: test 3.11 pass, file test < 300 dòng

## 4. Hook hạ tầng — `core/hooks/useVisibleTimeSegments.ts`, `core/hooks/usePageVisibility.ts` (design D5, D6)

Test: `apps/web/src/app/core/hooks/useVisibleTimeSegments.test.ts`, `apps/web/src/app/core/hooks/usePageVisibility.test.ts` —
`renderHook`, đồng hồ giả, `onSegment = vi.fn()`; tổng giây = tổng `(end - start) / 1000` các lần gọi.

- [ ] 4.1 RED: S8.1-AC2 "Thời gian app chạy nền không tính" (tầng hook) — hiện 1 phút, `setPageVisibility(true)`, tiến 10 phút, `setPageVisibility(false)`, tiến 1 phút, unmount → tổng 120 giây; không đoạn nào chứa khoảng ẩn; tạo `src/test/visibility.helpers.ts` và hằng `STUDY_TIME_FLUSH_INTERVAL_MS = 15_000` (`core/constants/study-time.constants.ts`) trong commit test, hook skeleton không phát gì; kiểm: fail (tổng 0)
- [ ] 4.2 GREEN: `useVisibleTimeSegments` (design D5: listener `visibilitychange` phát đoạn ngay trong listener, interval chỉ chạy khi hiện, cleanup phát đoạn mở và gỡ listener/interval); kiểm: test 4.1 pass
- [ ] 4.3 RED: S8.1-AC2 "Đóng app giữa bài chỉ mất tối đa 30 giây cuối" (tầng hook) — hiện 3 phút 40 giây, **không** unmount, không đổi visibility → tổng các đoạn đã phát ≥ 190 giây (mất < 30 giây) và lần phát cuối cách hiện tại ≤ 15 giây; kiểm: fail nếu chỉ phát lúc unmount (tạm bỏ interval nếu pass ngay rồi trả lại)
- [ ] 4.4 GREEN: interval `flushIntervalMs`; kiểm: test 4.3 pass
- [ ] 4.5 RED: S8.1-AC2 "Để app mở ở màn bài không thao tác vẫn tính" (tầng hook) — hiện 2 giờ không sự kiện nào rồi unmount → tổng 7200 giây; kiểm: chạy, nếu pass ngay thì tạm dừng interval sau N lần để thấy fail rồi trả lại
- [ ] 4.6 GREEN: sửa đến khi pass; kiểm: test 4.5 pass, effect có cleanup, deps đủ (lint sạch)
- [ ] 4.7 RED: S8.1-AC2 "Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm" (tầng hook) — `usePageVisibility()` trả `true` lúc đầu, `false` sau `setPageVisibility(true)`, `true` sau `setPageVisibility(false)`; unmount gỡ listener; kiểm: fail vì skeleton luôn `true`
- [ ] 4.8 GREEN: `usePageVisibility` bằng `useSyncExternalStore` (mẫu `useOnlineStatus`); kiểm: test 4.7 pass

## 5. Ghi thời gian ở màn bài — `pages/lesson/hooks/useStudyTimeRecorder.ts` + `LessonRunnerContainer` (design D5)

Test: `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.studyTime.test.tsx` và
`apps/web/src/app/pages/lesson/containers/PlacementTestContainer.studyTime.test.tsx` — mẫu `LessonRunnerContainer.test.tsx`
(`mockContentFetch`, registry giả, xoá `lessonProgress` và `dailyStats` ở `beforeEach`), đồng hồ giả; kết quả đọc bằng
`new ProgressService().getTodayStudy(Date.now())`.

- [ ] 5.1 RED: S8.1-AC2 "Ở màn bài được tính" — mở bài, tiến 3 phút 10 giây, unmount (rời màn bài) → `minutes` 3; kiểm: fail (0) vì container chưa ghi
- [ ] 5.2 GREEN: `useStudyTimeRecorder` (gọi `recordStudyTime`, `.catch` có comment), gọi trong `LessonRunnerContainer`; kiểm: test 5.1 pass, test container cũ vẫn pass
- [ ] 5.3 RED: S8.1-AC2 "Thoát giữa bài vẫn được tính" — trả lời câu 1, tiến 2 phút 10 giây, unmount khi chưa xong bài → tăng 2; kiểm: chạy, nếu pass ngay thì tạm chỉ ghi khi `summary` có để thấy fail rồi trả lại
- [ ] 5.4 GREEN: sửa đến khi pass; kiểm: test 5.3 pass
- [ ] 5.5 RED: S8.1-AC2 "Học lại bài đã xong vẫn được tính" — `lessonProgress` bài `completed`, mở lại, 4 phút 10 giây, unmount → tăng 4; kiểm: như 5.3 (tạm bỏ ghi khi bài đã `completed`)
- [ ] 5.6 GREEN: sửa đến khi pass; kiểm: test 5.5 pass
- [ ] 5.7 RED: S8.1-AC2 "Bài kiểm tra cuối chủ đề được tính" — bài `type: 'test'`, làm 3 phút 10 giây tới màn tổng kết, thêm 1 phút trên tổng kết, unmount → tăng 4; kiểm: như 5.3 (tạm dừng ghi khi `phase === 'finished'`)
- [ ] 5.8 GREEN: sửa đến khi pass; kiểm: test 5.7 pass
- [ ] 5.9 RED: S8.1-AC2 "Bài kiểm tra vượt cấp được tính" — `PlacementTestContainer` route `units/:unitId/placement-test`, 3 phút 10 giây tới tổng kết + 1 phút, unmount → tăng 4; kiểm: chạy, nếu pass ngay thì tạm bỏ ghi khi có `placementUnitId` để thấy fail rồi trả lại
- [ ] 5.10 GREEN: sửa đến khi pass; kiểm: test 5.9 pass
- [ ] 5.11 RED: S8.1-AC2 "Thời gian app chạy nền không tính" (mức màn) — 1 phút 10 giây, ẩn 10 phút, hiện 1 phút, unmount → tăng 2; kiểm: chạy, nếu pass ngay thì tạm truyền interval không dừng khi ẩn để thấy fail rồi trả lại
- [ ] 5.12 GREEN: sửa đến khi pass; kiểm: test 5.11 pass
- [ ] 5.13 RED: S8.1-AC2 "Hai tab cùng mở màn bài" (mức màn) — render hai `LessonRunnerContainer` cùng lúc (hai cây), 3 phút 10 giây, unmount cả hai → tăng 6. Phạm vi: chỉ kiểm hai cây trong cùng trang cùng ghi, mỗi cây tính riêng (không gộp, không chặn nhau); hai cây dùng chung singleton `progressStore` và chuỗi `studyTimeWrites` (1.8) nên **không** kiểm được tranh chấp đọc–ghi giữa hai tab — phần đó đã kiểm ở 1.5 (hai `DexieProgressStore` trên cùng tên DB) và e2e 11.3 (AC2-29, hai page cùng context). Kiểm: chạy, nếu pass ngay thì tạm cho `useStudyTimeRecorder` bỏ qua khi đã có một instance khác đang ghi (cờ cấp module) để thấy fail (tăng 3) rồi trả lại; **không** dùng cách bỏ transaction ở 1.6 (chuỗi 1.8 đã xếp các lần ghi nối tiếp nên test vẫn pass)
- [ ] 5.14 GREEN: sửa đến khi pass; kiểm: test 5.13 pass, mọi file < 300 dòng

## 6. Liên kết "Trang chủ" — `LessonSummary`, `LearningPathContainer` (design D7)

Test: `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.homeLink.test.tsx`,
`apps/web/src/app/pages/learning-path/containers/LearningPathContainer.homeLink.test.tsx` — `renderWithProviders` + `LocationProbe`.

- [ ] 6.1 RED: S8.1-AC1 "Từ màn tổng kết về Trang chủ" — làm xong bài thường và bài `test`: màn tổng kết có link "Trang chủ"; bấm → vị trí `/home`; kiểm: fail vì chưa có link
- [ ] 6.2 GREEN: `ROUTE_PATHS.home = '/home'`; `<Link>` trong `LessonSummary` (key `lesson:summary.home`); kiểm: test 6.1 pass
- [ ] 6.3 RED: S8.1-AC1 "Màn bài khi đang làm câu không có liên kết Trang chủ" — ở câu 1 và khi đang xem kết quả câu: không có link "Trang chủ"; kiểm: chạy, nếu pass ngay thì tạm đặt link ở `LessonRunnerContainer` ngoài nhánh tổng kết để thấy fail rồi trả lại
- [ ] 6.4 GREEN: link chỉ ở `LessonSummary`; kiểm: test 6.3 pass
- [ ] 6.5 RED: S8.1-AC1 "Từ bản đồ lộ trình về Trang chủ" — bản đồ có link "Trang chủ" (Tab tới được), bấm → `/home`; kiểm: fail
- [ ] 6.6 GREEN: `<Link>` trong `LearningPathContainer` (key `learning-path:homeLink`); kiểm: test 6.5 pass, `LearningPathContainer.test.tsx` cũ vẫn pass

## 7. Mở app — `StartGate`, `OnboardingContainer`, route `home` (design D1)

Test: `apps/web/src/app/pages/home/containers/HomeContainer.entry.test.tsx` — `openRoute` qua bảng route thật, settings ghi vào
IndexedDB thật (fake-indexeddb), `mockContentFetch`.

- [ ] 7.1 RED: S8.1-AC1 "Mở lại app sau onboarding thì vào Trang chủ" — đã xong onboarding, mở `/` → vị trí `/home`, có heading "Trang chủ", không có màn bài 1; kiểm: fail (vào `/lessons/intro-01`)
- [ ] 7.2 GREEN: `pages/home/home.routes.ts` (lazy, gom vào `page.routes.ts`), `HomeContainer` tối thiểu (`<main>`, `<h1>`), `assets/i18n/vi/home.json` (`title`), `'home'` vào `I18N_NAMESPACES` và `src/test/i18n.ts`; `StartGate` → `ROUTE_PATHS.home`; kiểm: test 7.1 pass
- [ ] 7.3 RED: S8.1-AC1 "Mở màn onboarding khi đã xong" — mở `/onboarding` → `/home`, không có bước nào của onboarding; kiểm: fail (vào bài 1)
- [ ] 7.4 GREEN: `OnboardingContainer` nhánh đã xong → `ROUTE_PATHS.home`; sửa kỳ vọng `OnboardingContainer.test.tsx` "never shows onboarding again once completed" sang `/home`; kiểm: test 7.3 pass
- [ ] 7.5 RED: S8.1-AC1 "Tải lại ở màn khác thì vẫn ở màn đó" — đã xong onboarding, mở thẳng `/learning-paths` và `/lessons/intro-01` → ở nguyên; kiểm: chạy, nếu pass ngay thì tạm cho `HomeContainer`/gate bắt mọi route để thấy fail rồi trả lại
- [ ] 7.6 GREEN: sửa đến khi pass; kiểm: test 7.5 pass
- [ ] 7.7 RED: S8.1-AC1 "Vừa xong onboarding vẫn vào bài 1" — chưa onboarding, mở `/`, làm hết bước, bấm nút bước cuối (cả nhánh đã cài, `useInstallPrompt` giả `isStandalone`) → `/lessons/intro-01`, không qua `/home`; kiểm: chạy, nếu pass ngay thì tạm đổi `goToFirstLesson` sang `/home` để thấy fail rồi trả lại
- [ ] 7.8 GREEN: giữ `goToFirstLesson`; kiểm: test 7.7 pass
- [ ] 7.9 RED: S8.1-AC1 "Chưa xong onboarding thì vẫn vào onboarding" — DB trống, mở `/` → `/onboarding`, không có heading "Trang chủ"; kiểm: chạy, nếu pass ngay thì tạm cho `StartGate` luôn về `/home` để thấy fail rồi trả lại
- [ ] 7.10 GREEN: sửa đến khi pass; kiểm: test 7.9 pass

## 8. Trang chủ: bài tiếp theo — `useHome`, `NextLessonCard`, `HomeContainer` (design D6)

Test: `apps/web/src/app/pages/home/containers/HomeContainer.test.tsx` — `openRoute('/home')`, lộ trình giả 2 giai đoạn qua
`mockContentFetch`, `lessonProgress` ghi thẳng IndexedDB; tách `HomeContainer.nextLesson.test.tsx` nếu > 300 dòng.

- [ ] 8.1 RED: S8.1-AC1 "Chưa học bài nào" (mức màn) — tiêu đề bài đầu + link "Vào học"; kiểm: fail vì Trang chủ chưa có nội dung
- [ ] 8.2 GREEN: `useHome` (effect bài tiếp theo, mẫu `useLearningPath`), `NextLessonCard` nhánh `available`, key `nextLesson`, `startLesson`, `loading`; kiểm: test 8.1 pass
- [ ] 8.3 RED: S8.1-AC1 "Đã xong vài bài thì hiện bài kế tiếp" (mức màn) — xong bài 1, 2 → tiêu đề bài 3; kiểm: chạy, nếu pass ngay thì tạm bỏ đọc tiến độ trong `useHome` để thấy fail rồi trả lại
- [ ] 8.4 GREEN: sửa đến khi pass; kiểm: test 8.3 pass
- [ ] 8.5 RED: S8.1-AC1 "Bài kế tiếp ở nhóm hoặc giai đoạn sau" (mức màn) — xong mọi bài nhóm 1 → tiêu đề bài đầu nhóm 2; kiểm: như 8.3
- [ ] 8.6 GREEN: sửa đến khi pass; kiểm: test 8.5 pass
- [ ] 8.7 RED: S8.1-AC1 "Còn bài đang mở ở trước một bài đã xong" (mức màn) — chỉ xong một bài ở chủ đề sau → tiêu đề bài đầu lộ trình; kiểm: như 8.3
- [ ] 8.8 GREEN: sửa đến khi pass; kiểm: test 8.7 pass
- [ ] 8.9 RED: S8.1-AC1 "Đã học xong mọi bài" (mức màn) — "Bạn đã học xong lộ trình hiện có.", không có "Vào học"; link "Xem lộ trình" và dòng "Hôm nay: …" vẫn có (dòng phút kiểm sau 9.2, ở đây chỉ link); kiểm: fail
- [ ] 8.10 GREEN: `NextLessonCard` nhánh `all-completed`, key `allCompleted`; link "Xem lộ trình" luôn render (key `learningPathLink`); kiểm: test 8.9 pass
- [ ] 8.11 RED: S8.1-AC1 "Tiến độ lưu bị hỏng" (mức màn) — dòng `lessonProgress` bài 1 `{ status: 'xyz' }` (và bài 2 `completed`) → Trang chủ hiện bình thường, bài tiếp theo là bài 1, không `role="alert"`; kiểm: chạy, nếu pass ngay thì tạm coi dòng hỏng là `completed` trong store để thấy fail rồi trả lại
- [ ] 8.12 GREEN: sửa đến khi pass; kiểm: test 8.11 pass
- [ ] 8.13 RED: S8.1-AC1 "Bấm "Vào học" thì vào bài" — bấm "Vào học" → vị trí `/lessons/<id bài tiếp theo>`, màn bài hiện tiêu đề bài đó; kiểm: fail nếu link chưa trỏ đúng bài
- [ ] 8.14 GREEN: `to={ROUTE_PATHS.lesson(lessonId)}`; kiểm: test 8.13 pass
- [ ] 8.15 RED: S8.1-AC1 "Bài tiếp theo đang làm dở" — bài 1 `in-progress`, `cursor: 2` → bấm "Vào học" → "Câu 3 / N"; kiểm: chạy, nếu pass ngay thì tạm cho `LessonService.resolveStartIndex` trả 0 để thấy fail rồi trả lại
- [ ] 8.16 GREEN: sửa đến khi pass (dựa vào `LessonService.openLesson` có sẵn); kiểm: test 8.15 pass
- [ ] 8.17 RED: S8.1-AC1 "Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở" — bài tiếp theo `type: 'test'` có `cursor: 2` → "Câu 1 / N"; kiểm: như 8.15
- [ ] 8.18 GREEN: sửa đến khi pass; kiểm: test 8.17 pass
- [ ] 8.19 RED: S8.1-AC1 "Dùng được bằng bàn phím" — chỉ `userEvent.tab()` tới link "Vào học" (thứ tự focus: "Vào học" trước "Xem lộ trình"), `{Enter}` → màn bài; kiểm: chạy, nếu pass ngay thì tạm render "Vào học" bằng phần tử không focus được để thấy fail rồi trả lại
- [ ] 8.20 GREEN: sửa đến khi pass; kiểm: test 8.19 pass (viền focus nhìn thấy kiểm ở e2e 10.1)
- [ ] 8.21 RED: S8.1-AC1 "Mở bản đồ lộ trình từ Trang chủ" — bấm "Xem lộ trình" → `/learning-paths`, heading "Lộ trình học"; kiểm: chạy, nếu pass ngay thì tạm trỏ link sai để thấy fail rồi trả lại
- [ ] 8.22 GREEN: sửa đến khi pass; kiểm: test 8.21 pass
- [ ] 8.23 RED: nhánh lỗi nạp lộ trình (design D6, không có Scenario riêng; tên test `S8.1-AC1 (D6) nạp lộ trình lỗi thì báo lỗi, vẫn có "Xem lộ trình"`) — `mockContentFetch` trả 500 cho file lộ trình → Trang chủ có `role="alert"` "Chưa tải được bài tiếp theo.", không còn `role="status"` "Đang tải…", không có "Vào học", link "Xem lộ trình" vẫn có và trỏ `/learning-paths`; kiểm: fail (kẹt ở "Đang tải…" vì skeleton chưa có nhánh lỗi)
- [ ] 8.24 GREEN: `.catch` của effect bài tiếp theo trong `useHome` đặt `hasNextLessonError` (cờ `isActive`, mẫu `useLearningPath`); `HomeContainer` hiện `<p role="alert">` key `home:loadError` thay `NextLessonCard`; kiểm: test 8.23 pass, mọi file < 300 dòng, component < 5 props

## 9. Trang chủ: phút hôm nay — `useHome`, `TodayStudyStatus` (design D6)

Test: `apps/web/src/app/pages/home/containers/HomeContainer.todayStudy.test.tsx` — `openRoute('/home')`, settings và
`dailyStats` ghi thẳng IndexedDB, đồng hồ giả.

- [ ] 9.1 RED: S8.1-AC2 "Chưa học hôm nay" — mục tiêu 30, không có dòng hôm nay → "Hôm nay: 0 / 30 phút", không có "Đã đạt mục tiêu hôm nay"; kiểm: fail
- [ ] 9.2 GREEN: effect phút hôm nay trong `useHome` (`getTodayStudy`), `TodayStudyStatus`, key `todayStudy`; kiểm: test 9.1 pass
- [ ] 9.3 RED: S8.1-AC2 "Đã học một phần mục tiêu" — mục tiêu 15, 430 giây → "Hôm nay: 7 / 15 phút"; kiểm: chạy, nếu pass ngay thì tạm hiện số giây thay vì phút để thấy fail rồi trả lại
- [ ] 9.4 GREEN: sửa đến khi pass; kiểm: test 9.3 pass
- [ ] 9.5 RED: S8.1-AC2 "Mục tiêu lưu bị hỏng" (mức màn) — settings `dailyGoalMinutes: 'abc'` → "Hôm nay: 0 / 15 phút"; kiểm: chạy, nếu pass ngay thì tạm đọc mục tiêu thô để thấy fail rồi trả lại
- [ ] 9.6 GREEN: sửa đến khi pass; kiểm: test 9.5 pass
- [ ] 9.7 RED: S8.1-AC2 "Vượt mục tiêu" — mục tiêu 30, 2700 giây → "Hôm nay: 45 / 30 phút" và "Đã đạt mục tiêu hôm nay"; kiểm: fail vì chưa có dòng đạt mục tiêu
- [ ] 9.8 GREEN: `TodayStudyStatus` dòng `goalReached` khi `isGoalReached`; kiểm: test 9.7 pass
- [ ] 9.9 RED: S8.1-AC2 "Vừa đúng mục tiêu" (mức màn) — 900 giây → "Hôm nay: 15 / 15 phút" + "Đã đạt mục tiêu hôm nay"; 890 giây → "14 / 15", không có dòng đạt; kiểm: chạy, nếu pass ngay thì tạm dùng `>` trong `isDailyGoalReached` để thấy fail rồi trả lại
- [ ] 9.10 GREEN: sửa đến khi pass; kiểm: test 9.9 pass
- [ ] 9.11 RED: S8.1-AC2 "Thời gian học đã lưu bị hỏng" (mức màn) — dòng hôm nay hỏng → Trang chủ hiện bình thường, "Hôm nay: 0 / 15 phút", không `role="alert"`; kiểm: chạy, nếu pass ngay thì tạm cho store throw khi dòng hỏng để thấy fail rồi trả lại
- [ ] 9.12 GREEN: sửa đến khi pass; kiểm: test 9.11 pass
- [ ] 9.13 RED: S8.1-AC2 "Để Trang chủ mở qua nửa đêm" — mục tiêu 15, hôm nay 1200 giây, mở `/home` lúc 23:59 → "20 / 15"; tiến tới 00:01 (không đổi visibility) → vẫn "20 / 15"; `router.navigate('/learning-paths')` rồi về `/home` → "0 / 15"; kiểm: fail ở bước quay về nếu `useHome` cache kết quả, hoặc tạm thêm interval làm mới để thấy bước "vẫn 20" fail rồi trả lại
- [ ] 9.14 GREEN: tính lại khi mount, không timer; kiểm: test 9.13 pass
- [ ] 9.15 RED: S8.1-AC2 "Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm" — như 9.13 nhưng ẩn lúc 23:59, hiện lúc 00:01, không điều hướng → "Hôm nay: 0 / 15 phút", không có "Đã đạt mục tiêu hôm nay"; kiểm: fail (vẫn 20)
- [ ] 9.16 GREEN: deps `isPageVisible` từ `usePageVisibility` trong effect phút hôm nay; kiểm: test 9.15 pass
- [ ] 9.17 RED: S8.1-AC2 "Học xong quay lại Trang chủ thấy số phút tăng" — `/home` "0 / 15", bấm "Vào học", trả lời hết câu trong 2 phút 10 giây, bấm "Trang chủ" trên tổng kết → "Hôm nay: 2 / 15 phút" không tải lại; kiểm: chạy, nếu pass ngay thì tạm bỏ chờ chuỗi ghi ở `getDailyStat` (1.8) để thấy fail rồi trả lại
- [ ] 9.18 GREEN: sửa đến khi pass; kiểm: test 9.17 pass
- [ ] 9.19 RED: S8.1-AC2 "Màn khác không tính" — mở `/home` 2 phút, `/learning-paths` 3 phút, `/onboarding`, `/characters/人/stroke-order`, `/characters/人/writing-practice` (mỗi màn 1 phút, mock nét theo `setupStrokeOrderRoute`), về `/home` → không đổi (0); kiểm: chạy, nếu pass ngay thì tạm gọi `useStudyTimeRecorder` trong `HomeContainer` để thấy fail rồi trả lại
- [ ] 9.20 GREEN: sửa đến khi pass; kiểm: test 9.19 pass, mọi file < 300 dòng
- [ ] 9.21 RED: S8.1-AC2 "Sang ngày mới đếm lại" (mức màn) — dòng hôm qua 1200 giây, không có dòng hôm nay → "Hôm nay: 0 / 15 phút"; kiểm: chạy, nếu pass ngay thì tạm đọc dòng mới nhất thay vì dòng hôm nay để thấy fail rồi trả lại
- [ ] 9.22 GREEN: sửa đến khi pass; kiểm: test 9.21 pass

## 10. Giao diện — `styles/tailwind/` (design D8)

- [ ] 10.1 `apps/web/src/styles/tailwind/components/_home.css` (import trong `main.css`): `.home-title`, `.home-next-lesson`, `.home-next-lesson-title` (tiêu đề dài xuống dòng, không tràn), `.home-today-study`, `.home-goal-reached`, `.home-link`; `.learning-path-home-link` trong `_learning-path.css`; JSX chỉ layout/spacing (§6); vùng chạm ≥ 44×44 px cho "Vào học", "Xem lộ trình", "Trang chủ" — ngoại lệ test-first: CSS thuần; kiểm: `pnpm --filter @csk/web test:run tokens` pass, preview `web-dev` 375×812 và 1280×800, sáng và tối: Trang chủ (còn bài, đã xong mọi bài, đạt mục tiêu), bản đồ lộ trình, màn tổng kết

## 11. Luồng thật, đồng hồ giả, offline — e2e Playwright (`apps/web/e2e/E8/`)

E2E viết sau nhóm 1–9 chạy trên màn đã có: RED nào pass ngay thì tạm đổi route/hành vi để thấy fail rồi trả lại. Tên test mang
ID Scenario và ID TC. Helper `apps/web/e2e/E8/home.helpers.ts`: `completeOnboarding(page, goal)`, `seedProgress(page, …)`,
`setPageVisibility(page, hidden)`, `todayStudyText(page)`. Đồng hồ `page.clock.install` + `runFor` (design, mục Test).

- [ ] 11.1 RED: `apps/web/e2e/E8/s8.1-home-screen.spec.ts`, `test.describe('S8.1 Trang chủ')` — S8.1-AC1 "Mở lại app sau onboarding thì vào Trang chủ" (TC-S8.1-AC1-1), "Mở màn onboarding khi đã xong" (AC1-4), "Tải lại ở màn khác thì vẫn ở màn đó" (AC1-21), "Vừa xong onboarding vẫn vào bài 1" (AC1-2), "Chưa xong onboarding thì vẫn vào onboarding" (AC1-3), "Bấm "Vào học" thì vào bài" (AC1-5), "Bài tiếp theo đang làm dở" (AC1-6), "Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở" (AC1-23), "Dùng được bằng bàn phím" (AC1-7: Tab tới "Vào học", `outline-style` khác `none`, Enter vào bài), "Chưa học bài nào" (AC1-9), "Đã xong vài bài thì hiện bài kế tiếp" (AC1-10), "Bài kế tiếp ở nhóm hoặc giai đoạn sau" (AC1-11), "Còn bài đang mở ở trước một bài đã xong" (AC1-12), "Đã học xong mọi bài" (AC1-13), "Tiến độ lưu bị hỏng" (AC1-14), "Mở bản đồ lộ trình từ Trang chủ" (AC1-15), "Từ bản đồ lộ trình về Trang chủ" (AC1-24), "Từ màn tổng kết về Trang chủ" (AC1-26), S8.1-AC2 "Chưa học hôm nay" (AC2-1), "Mục tiêu lưu bị hỏng" (AC2-3), "Vượt mục tiêu" (AC2-5), "Vừa đúng mục tiêu" (AC2-6, AC2-7), "Sang ngày mới đếm lại" (AC2-18), "Thời gian học đã lưu bị hỏng" (AC2-25); kiểm: `pnpm e2e` fail đúng lý do
- [ ] 11.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass; kiểm: `pnpm e2e` pass
- [ ] 11.3 RED: `apps/web/e2e/E8/s8.1-study-time.spec.ts` — S8.1-AC2 "Đã học một phần mục tiêu" (AC2-2), "Học xong quay lại Trang chủ thấy số phút tăng" (AC2-4), "Ở màn bài được tính" (AC2-8), "Thoát giữa bài vẫn được tính" (AC2-10), "Học lại bài đã xong vẫn được tính" (AC2-11), "Bài kiểm tra cuối chủ đề được tính" (AC2-9), "Bài kiểm tra vượt cấp được tính" (AC2-27), "Thời gian app chạy nền không tính" (AC2-12), "Màn khác không tính" (AC2-14), "Để app mở ở màn bài không thao tác vẫn tính" (AC2-28, `runFor` 2 giờ 10 giây), "Hai tab cùng mở màn bài" (AC2-29, hai page cùng context), "Làm tròn xuống phút" (AC2-16), "Giây lẻ được cộng dồn" (AC2-17), "Nhiều lần học trong cùng ngày được cộng" (AC2-20), "Học qua nửa đêm chia cho hai ngày" (AC2-19, `timezoneId` cố định), "Để Trang chủ mở qua nửa đêm" (AC2-31), "Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm" (AC2-33); kiểm: fail đúng lý do
- [ ] 11.4 GREEN: sửa đến khi pass; kiểm: test 11.3 pass
- [ ] 11.5 RED: `apps/web/e2e/E8/s8.1-study-time-close.spec.ts` — S8.1-AC2 "Đóng app giữa bài chỉ mất tối đa 30 giây cuối" (AC2-21 `page.close()`; AC2-30 CDP `Page.crash`, mở trang mới cùng context → X là 3), "Số phút còn sau khi mở lại app" (AC2-23); kiểm: fail đúng lý do (tạm tăng interval lên 5 phút nếu pass ngay rồi trả lại)
- [ ] 11.6 GREEN: sửa đến khi pass; kiểm: test 11.5 pass
- [ ] 11.7 RED: `apps/web/e2e/E8/s8.1-home-offline.spec.ts`, mẫu `openOnceWithServiceWorker` của `e2e/E1/s1.2-offline.spec.ts` — S8.1-AC1 "Mở Trang chủ khi offline" (TC-S8.1-AC1-17): offline mở `/` → tiêu đề bài tiếp theo, "Vào học", "Hôm nay: 0 / 15 phút"; kiểm: thấy fail (tạm loại route `home` khỏi bảng nếu pass ngay) rồi trả lại
- [ ] 11.8 GREEN: sửa đến khi pass; kiểm: test 11.7 pass
- [ ] 11.9 Cập nhật e2e cũ theo hành vi mới (proposal Impact), sửa kỳ vọng theo Scenario đã có test ở 11.1, không đổi hành vi app để giữ test cũ:
  - **Bắt buộc sửa** `apps/web/e2e/E1/s1.3-onboarding.spec.ts` dòng 18–21: `goto('/')` và `goto('/onboarding')` sau onboarding giờ → `/home` (không còn `/lessons/intro-01`); dòng 16 (sau bước cuối vẫn `/lessons/intro-01`) giữ nguyên; đổi tên test cho khớp ("onboarding một lần rồi vào thẳng bài 1, mở lại vào Trang chủ").
  - **Đã rà, dự kiến không sửa** `apps/web/e2e/E3/s3.1-learning-path.spec.ts`: chỉ chờ `/lessons/intro-01` ngay sau bấm nút bước cuối của onboarding trên DB trống (dòng 5–9, đúng Scenario "Vừa xong onboarding vẫn vào bài 1"), sau đó `goto('/learning-paths')` trực tiếp; không có `goto('/')` nào sau onboarding. Xác nhận bằng chạy file; chỉ sửa nếu fail.
  - **Rà** `apps/web/e2e/E7/intro-lessons.helpers.ts` `seedCompletedLessons` (dòng 98–152): `goto('/')` lúc DB trống → `/onboarding`, ghi `hasCompletedOnboarding` + tiến độ rồi `reload()` ở `/onboarding` → giờ chuyển `/home` (trước là `/lessons/intro-01`). Mọi chỗ gọi (`s7.1-intro-lessons.spec.ts` dòng 85, 137; `s7.1-intro-audio.spec.ts` dòng 113; `s7.1-intro-writing-content.spec.ts` dòng 65; `intro-writing.helpers.ts` dòng 166, 174; `s7.1-intro-offline.spec.ts` dòng 113 `prepareAllOpenOffline`) đều `goto` màn đích hoặc tắt mạng ngay sau đó, không kiểm URL sau `reload()`. Kiểm: các file E7 trên pass; với `s7.1-intro-offline.spec.ts` xác nhận `/home` nạp lộ trình trước khi tắt mạng không làm đổi kết quả (comment "không mở màn bài nào" giờ mới đúng). Chỉ sửa helper nếu fail.
  - Kiểm: `pnpm e2e` pass toàn bộ

## 12. Tài liệu và kiểm tra

- [ ] 12.1 Cập nhật `docs/03-architecture.md`: §3.2 cây `pages/home`, `core/hooks/useVisibleTimeSegments`, `usePageVisibility`, `pages/lesson/hooks/useStudyTimeRecorder`, `shared/utils/date.utils`; route `/home` và `/` → `/home`; §6.2 `dailyStats` khóa `date` (`YYYY-MM-DD` giờ máy), `studySeconds` (giây, số thực) thay `minutes`, giữ mọi ngày, S8.5 phải sao lưu bảng này; §6.3 `getDailyStat(date)`, `addStudySeconds(date, seconds)` thay `addMinutes` — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 12.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, dependency một chiều theo bảng import ở design, file < 300 dòng, component < 5 props, effect có cleanup, không mutate); kiểm: `pnpm lint` sạch
- [ ] 12.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 12.4 Chụp screenshot cho PR: Trang chủ (còn bài tiếp theo, đã đạt mục tiêu, đã học xong mọi bài), bản đồ lộ trình có "Trang chủ", màn tổng kết có "Trang chủ" — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets`
- [ ] 12.5 Ghi vào mô tả PR code cho QA: địa chỉ gốc `/`, Trang chủ `/home`, màn onboarding `/onboarding`; "Vào học" là liên kết trông như nút; chu kỳ ghi 15 giây; cách tạo dữ liệu sẵn (đoạn script cho DevTools ghi `settings`/`lessonProgress`/`dailyStats` với `studySeconds`, khóa ngày `YYYY-MM-DD`) cho mọi trạng thái test-cases liệt kê; lưu ý rollback Dexie version 3; kiểm: mô tả PR có đủ các mục

## Workflow follow-up

- PR code ghi `Spec PR: #129`, References `Closes #37` khi đủ AC1–AC2, dòng `OpenSpec change: s8-1-home-screen`.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
