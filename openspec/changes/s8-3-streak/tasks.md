# Tasks: S8.3 Streak

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S8.3-AC1 Bỏ một ngày thì chuỗi đứt: …`); test e2e thêm ID TC. Tên file, hàm,
field: design D1–D5.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại (như S8.1).
RED cần type/method chưa có thì tạo skeleton không có hành vi trong cùng commit `test(...)` (typecheck sạch, test fail ở assertion).

Vitest: `pnpm --filter @csk/web test:run <mẫu>` (`pnpm --filter @csk/shared test:run <mẫu>` cho schema). Ngày dựng bằng
`new Date(y, m, d, h, mi)` (giờ local) + `toLocalDateKey`. Ký hiệu trong task: D0 = hôm nay, D-1 = hôm qua, D+1 = ngày mai;
"đạt" = 1200 giây (20 phút) với `goalMinutes` 15, trừ khi nêu khác.

## 1. Dữ liệu — `@csk/shared` + `core/services/progress-store.service.ts` + docs (design D1, D2)

Test: `packages/shared/src/progress.schema.test.ts` (schema), `apps/web/src/app/core/services/progress-store.daily-goal.test.ts`
(mới; store trên DB tên ngẫu nhiên `createDatabase('test-…')`, mẫu `progress-store.daily-stats.test.ts`).

- [x] 1.1 RED: S8.3-AC1 "Ngày đã qua không có mục tiêu đọc được" (tầng schema + store) — `dailyStatSchema.parse({ date, studySeconds: 1200, goalMinutes: 30 })` giữ `goalMinutes: 30`; `goalMinutes` `'abc'` / `45` / `null` → `goalMinutes` `undefined` nhưng `studySeconds` vẫn 1200 (dòng không hỏng); thiếu `goalMinutes` → `undefined`. Store: dòng thô `{ date, studySeconds: 1200, goalMinutes: 'abc' }` → `getDailyStat` trả `{ date, studySeconds: 1200, goalMinutes: undefined }`. Trong cùng commit test: thêm `getAllDailyStats`, `saveDailyGoal` vào interface `ProgressStore` (skeleton: `[]`, no-op) và stub `vi.fn(async () => [])` / `vi.fn(async () => undefined)` ở mọi object `ProgressStore` viết tay (`progress.service.test.ts` `makeStore`, `progress.service.study-time.test.ts` `unavailableStore` — stub reject như các method khác ở đó, `lesson.service.test.ts` `unreadable` và `unwritable`; rà `grep -rn ': ProgressStore = {' apps/web/src`); đổi 6 chỗ `toEqual({ date, studySeconds })` trong `progress-store.daily-stats.test.ts` sang `toMatchObject` (S8.1 không đổi hành vi, chỉ để dòng có thêm `goalMinutes` không làm test cũ fail); kiểm: `pnpm typecheck` sạch, test mới fail vì Zod bỏ field `goalMinutes`, test S8.1 vẫn pass
- [x] 1.2 GREEN: `dailyStatSchema` thêm `goalMinutes: dailyGoalMinutesSchema.optional().catch(undefined)`; comment `DailyStatRow` trong `db.helper.ts` nêu field `goalMinutes` (không thêm `db.version`); kiểm: test 1.1 pass, `pnpm --filter @csk/shared test:run progress` pass
- [x] 1.3 RED: S8.3-AC1 "Tăng mục tiêu không đổi các ngày đã qua" (tầng store: chụp mục tiêu khi ghi phút) — settings `dailyGoalMinutes: 15`; `addStudySeconds(D-1, 1200)` → dòng D-1 có `goalMinutes: 15`; đổi settings sang 30 bằng `saveSettings`, `addStudySeconds(D0, 60)` → dòng D0 `goalMinutes: 30`, dòng D-1 vẫn 15; dòng cũ `{ date, studySeconds: 'abc' }` cộng 130 → `{ studySeconds: 130, goalMinutes: <đang chọn> }`; settings hỏng → chụp 15; kiểm: fail vì dòng chưa có `goalMinutes`
- [x] 1.4 GREEN: `writeStudySeconds` mở transaction `rw` trên `dailyStats` + `settings`, đọc `parseSettings`, ghi `goalMinutes`; comment trên interface `ProgressStore.addStudySeconds` ghi rõ: store chỉ chụp giá trị mục tiêu đang chọn vào dòng, không rẽ nhánh theo mục tiêu, không quy tắc nghiệp vụ (quy tắc ở `ProgressService` Phần 2) (design D2); kiểm: test 1.3 pass, `progress-store.daily-stats.test.ts` (S8.1, gồm hai tab và ghi trước đọc) vẫn pass
- [x] 1.5 RED: S8.3-AC1 "Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi" (tầng store: đổi mục tiêu) — có dòng D0 `{ studySeconds: 1200, goalMinutes: 15 }` và D-1 `{ …, goalMinutes: 15 }`; `saveDailyGoal(D0, 30)` → `getSettings().dailyGoalMinutes` 30, dòng D0 `goalMinutes: 30` (`studySeconds` giữ 1200), dòng D-1 giữ 15; ngày chưa có dòng → không tạo dòng; dòng D0 hỏng → giữ nguyên dòng hỏng, settings vẫn đổi; gọi `addStudySeconds(D0, 60)` không await rồi `saveDailyGoal(D0, 60)` → dòng cuối `{ studySeconds: 1260, goalMinutes: 60 }`; kiểm: fail vì skeleton no-op
- [x] 1.6 GREEN: `saveDailyGoal` nối vào chuỗi `studyTimeWrites`, một transaction `rw` trên `settings` + `dailyStats` (design D2); kiểm: test 1.5 pass
- [x] 1.7 RED: S8.3-AC1 "Số phút của một ngày đã qua bị hỏng" (tầng store: đọc mọi ngày) — dòng D-2, D0 hợp lệ, D-1 `studySeconds: 'abc'`, một dòng `date: 'xyz'` → `getAllDailyStats()` trả đúng hai dòng D-2, D0 (thứ tự không quan trọng, so bằng `arrayContaining` + độ dài); kiểm: fail vì skeleton trả `[]`
- [x] 1.8 GREEN: `getAllDailyStats` (`toArray` + `safeParse` từng dòng, bỏ dòng hỏng); kiểm: test 1.7 pass
- [x] 1.9 RED: S8.3-AC2 "Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay" (tầng store: ghi trước đọc) — `addStudySeconds(D0, 120)` **không await**, ngay sau đó `await getAllDailyStats()` thấy D0 120 giây; kiểm: chạy, nếu pass ngay nhờ thứ tự transaction của Dexie thì vẫn giữ test, tạm bỏ dòng chờ chuỗi để thấy fail rồi trả lại
- [x] 1.10 GREEN: `getAllDailyStats` chờ `studyTimeWrites` trước khi đọc; kiểm: test 1.9 pass, `progress-store.service.ts` < 300 dòng
- [x] 1.11 Docs `docs/03-architecture.md`: §6.2 hàng `dailyStats` thêm `goalMinutes` (mục tiêu chụp mỗi lần ghi phút và khi đổi mục tiêu; ngày trước S8.3 không có; không đổi version Dexie); §6.3 thêm `getAllDailyStats()`, `saveDailyGoal(date, goalMinutes)` và ghi chú `addStudySeconds` chỉ chụp giá trị mục tiêu đang chọn vào dòng (không rẽ nhánh, không quy tắc nghiệp vụ; dùng mục tiêu thế nào là việc của `ProgressService` Phần 2) — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff

## 2. Quy tắc streak — `shared/utils/date.utils.ts` + `ProgressService` Phần 2 (design D3)

Test: `apps/web/src/app/shared/utils/date.utils.test.ts`, `apps/web/src/app/shared/services/progress.service.streak.test.ts`
(mới; hàm thuần, không store; `new ProgressService(store giả không dùng tới)` như `progress.service.study-time.test.ts`).
Dữ liệu là mảng `DailyStat` dựng bằng helper trong file test `day(offset, seconds, goalMinutes = 15)`; các test 2.1–2.19
luôn ghi `goalMinutes` của ngày đã qua bằng đúng mục tiêu truyền vào `countStudyStreak` (2.3 dùng 30), để các bước 2.22–2.26
không làm chúng đổi kết quả. Dòng không có mục tiêu (2.25) dựng bằng object literal, vì tham số mặc định nuốt `undefined`.
Các RED về mục tiêu (2.21, 2.23, 2.25) fail thật nhờ GREEN trước đó tối thiểu, không dùng mẹo tạm đảo. Scenario "Đổi mục tiêu
sau khi đã học, qua 0:00 streak không đổi" không có cặp ở Phần 2 (mục tiêu của ngày bằng mục tiêu đang chọn nên mọi bước
cài đặt đều cho 0, RED không thể fail thật); nó được kiểm ở store (1.5/1.6) và use case (3.11/3.12).

- [x] 2.1 RED: S8.3-AC1 "Đạt mục tiêu hôm nay thì streak tăng 1" — `previousLocalDateKey('2026-11-18')` = `'2026-11-17'`, `('2026-03-01')` = `'2026-02-28'`, `('2026-01-01')` = `'2025-12-31'`; `countStudyStreak([D-3 0 giây, D-2 đạt, D-1 đạt, D0 840 giây], D0, 15)` = 2 và với D0 900 giây = 3; kiểm: fail vì skeleton `countStudyStreak` trả 0, `previousLocalDateKey` trả chính nó
- [x] 2.2 GREEN: `previousLocalDateKey` (`date.utils.ts`); Phần 2 `isStreakDayReached` (tối thiểu: không có dòng → chưa đạt; **mọi ngày** so với `todayGoalMinutes`, chưa đọc `goalMinutes` của dòng) và `countStudyStreak` kèm `Rule:` (design D3); chưa có `resolveDayGoal`; kiểm: test 2.1 pass
- [x] 2.3 RED: S8.3-AC1 "Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua" — mục tiêu 30, D-5 không có dòng, D-4…D-1 mỗi ngày 2100 giây `goalMinutes: 30`, D0 600 giây → 4; kiểm: chạy, nếu pass ngay thì tạm trả 0 khi hôm nay chưa đạt để thấy fail rồi trả lại
- [x] 2.4 GREEN: sửa đến khi pass; kiểm: test 2.3 pass
- [x] 2.5 RED: S8.3-AC1 "Bỏ một ngày thì chuỗi đứt" — D-6…D-2 đạt, D-1 300 giây, D0 0 → 0; biến thể D-1 không có dòng → 0; kiểm: chạy, nếu pass ngay thì tạm bỏ qua ngày không có dòng khi đếm lùi để thấy fail rồi trả lại
- [x] 2.6 GREEN: sửa đến khi pass; kiểm: test 2.5 pass
- [x] 2.7 RED: S8.3-AC1 "Đếm lại sau khi chuỗi đứt" — D-7…D-3 đạt, D-2 300 giây, D-1 đạt, D0 đạt → 2; kiểm: chạy, nếu pass ngay thì tạm đếm mọi ngày đạt thay vì dừng ở ngày đứt để thấy fail rồi trả lại
- [x] 2.8 GREEN: sửa đến khi pass; kiểm: test 2.7 pass
- [x] 2.9 RED: S8.3-AC1 "Người học mới chưa có ngày nào" — `countStudyStreak([], D0, 15)` = 0; kiểm: chạy, nếu pass ngay thì tạm coi hôm qua không có dòng là đạt để thấy fail rồi trả lại
- [x] 2.10 GREEN: sửa đến khi pass; kiểm: test 2.9 pass
- [x] 2.11 RED: S8.3-AC1 "Chưa đủ trọn phút mục tiêu thì chưa tính là đạt" — D0 899 giây (14 phút 59 giây), mục tiêu 15 → 0; 900 giây → 1; ngày đã qua 899 giây `goalMinutes: 15` không đạt; kiểm: chạy, nếu pass ngay thì tạm so `studySeconds / 60` không làm tròn để thấy fail rồi trả lại
- [x] 2.12 GREEN: sửa đến khi pass (dùng `toStudyMinutes` + `isDailyGoalReached` sẵn có); kiểm: test 2.11 pass
- [x] 2.13 RED: S8.3-AC1 "Ngày mới bắt đầu sau nửa đêm theo giờ máy" — dữ liệu D-2 0, D-1 đạt, D0 đạt; `today` = D0 → 2; `today` = D+1 (không có dòng) → 2; `today` = D+2 → 0; kiểm: chạy, nếu pass ngay thì tạm luôn bắt đầu đếm từ `today` để thấy fail rồi trả lại
- [x] 2.14 GREEN: sửa đến khi pass; kiểm: test 2.13 pass
- [x] 2.15 RED: S8.3-AC1 "Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó" (Phần 2) — mục tiêu 15, D-1 1200 giây (10 + 10 phút), D0 600 giây → 1; kiểm: chạy, nếu pass ngay thì tạm cộng phút hôm nay vào hôm qua để thấy fail rồi trả lại
- [x] 2.16 GREEN: sửa đến khi pass; kiểm: test 2.15 pass
- [x] 2.17 RED: S8.3-AC1 "Số phút của một ngày đã qua bị hỏng" (Phần 2) — D-2 đạt, D-1 không có trong mảng (store đã bỏ dòng hỏng, 1.8), D0 đạt → 1; kiểm: chạy, nếu pass ngay thì tạm nhảy qua ngày thiếu để thấy fail rồi trả lại
- [x] 2.18 GREEN: sửa đến khi pass; kiểm: test 2.17 pass
- [x] 2.19 RED: S8.3-AC1 "Ngày ghi sau hôm nay không được tính" — D-2 0, D-1 đạt, D0 đạt, D+1 đạt → 2; thêm D+1 đạt khi D0 chưa đạt → bằng chuỗi tính tới D-1; kiểm: fail nếu đếm bắt đầu từ ngày mới nhất trong dữ liệu (tạm làm vậy nếu pass ngay rồi trả lại)
- [x] 2.20 GREEN: bỏ dòng `date > today`; kiểm: test 2.19 pass
- [x] 2.21 RED: S8.3-AC1 "Tăng mục tiêu không đổi các ngày đã qua" (Phần 2) — mục tiêu đang chọn 30, D-4 0, D-3…D-1 1200 giây `goalMinutes: 15`, D0 1200 giây → 3; kiểm: fail thật (2.2 so mọi ngày với 30 → 0)
- [x] 2.22 GREEN: Phần 2 `resolveDayGoal` kèm `Rule:` (bước này: trả mục tiêu đã lưu của ngày đã qua, `undefined` khi thiếu); `isStreakDayReached` cho ngày đã qua: có mục tiêu của ngày thì đạt khi đạt mục tiêu đó **hoặc** mục tiêu hôm nay (giữ hành vi 2.2, thêm mục tiêu của ngày — bước tối thiểu cho Scenario này), không có mục tiêu của ngày thì chưa đạt; hôm nay vẫn so với `todayGoalMinutes`; kiểm: test 2.21 pass, 2.1–2.20 vẫn pass
- [x] 2.23 RED: S8.3-AC1 "Hạ mục tiêu không biến ngày chưa đạt thành đạt" — mục tiêu đang chọn 15, D-3 0, D-2 và D-1 1200 giây `goalMinutes: 30`, D0 0 → 0; kiểm: fail thật (2.22 vẫn cho ngày đã qua đạt theo mục tiêu hôm nay 15 → 2)
- [x] 2.24 GREEN: ngày đã qua chỉ so với mục tiêu của ngày đó (`resolveDayGoal`), bỏ nhánh "hoặc mục tiêu hôm nay"; kiểm: test 2.23 pass, 2.21 vẫn pass
- [x] 2.25 RED: S8.3-AC1 "Ngày đã qua không có mục tiêu đọc được" (Phần 2) — mục tiêu đang chọn 15, D-2 0, D-1 `{ date, studySeconds: 1200 }` (không có `goalMinutes`), D0 1200 giây → 2; mục tiêu đang chọn 30 (truyền vào), cùng dữ liệu nhưng D-1 2100 giây, D0 1800 giây → 2; kiểm: fail thật (2.24 coi ngày không có mục tiêu là chưa đạt → 1)
- [x] 2.26 GREEN: `resolveDayGoal(dayGoalMinutes, todayGoalMinutes)` trả `todayGoalMinutes` khi mục tiêu của ngày thiếu/hỏng (`undefined` sau schema 1.2), kiểu trả `DailyGoalMinutes` (design D3); bỏ nhánh "không có mục tiêu → chưa đạt"; kiểm: test 2.25 pass, 2.1–2.24 vẫn pass, mọi rule có `Rule:`, `progress.service.ts` < 300 dòng

## 3. Use case — `ProgressService` Phần 1 + 3 (design D4)

Test: `apps/web/src/app/shared/services/progress.service.streak-flow.test.ts` (mới) —
`new ProgressService(new DexieProgressStore(createDatabase('test-…')))`, fake-indexeddb, dữ liệu ghi thẳng `db.dailyStats` /
`db.settings` hoặc qua `recordStudyTime`.

- [x] 3.1 RED: S8.3-AC1 "Người học mới chưa có ngày nào" (Phần 3) — `completeOnboarding(15)`, không học → `getStudyStreak(now)` = 0; store stub `getAllDailyStats`/`getSettings` reject → 0, không throw; kiểm: fail vì skeleton `getStudyStreak` throw/chưa có nhánh `.catch`
- [x] 3.2 GREEN: Phần 1 `readAllDailyStats`; Phần 3 `getStudyStreak(now)` (settings + mọi ngày song song, `.catch` như `getTodayStudy`, `countStudyStreak`); kiểm: test 3.1 pass
- [x] 3.3 RED: S8.3-AC1 "Mục tiêu đang chọn bị hỏng" — settings `dailyGoalMinutes: 'abc'`, D-1 không có dòng, D0 900 giây → 1; kiểm: chạy, nếu pass ngay thì tạm đọc mục tiêu thô (không qua `parseSettings`) để thấy fail rồi trả lại
- [x] 3.4 GREEN: sửa đến khi pass; kiểm: test 3.3 pass
- [x] 3.5 RED: S8.3-AC1 "Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó" (Phần 3) — mục tiêu 15, D-1 600 giây; `recordStudyTime(23:50 D-1, 00:10 D0)` → `getStudyStreak(00:15 D0)` = 1 và `getTodayStudy(00:15 D0).minutes` = 10; kiểm: chạy, nếu pass ngay thì tạm dùng ngày của `now - 1 ngày` làm `today` để thấy fail rồi trả lại
- [x] 3.6 GREEN: sửa đến khi pass; kiểm: test 3.5 pass
- [x] 3.7 RED: S8.3-AC1 "Số phút của một ngày đã qua bị hỏng" (Phần 3) — mục tiêu 15, D-2 và D0 1200 giây, D-1 `studySeconds: 'abc'` → 1, `getTodayStudy` vẫn 20 phút; kiểm: chạy, nếu pass ngay thì tạm cho `getAllDailyStats` trả dòng hỏng D-1 như 1200 giây để thấy 3 rồi trả lại
- [x] 3.8 GREEN: sửa đến khi pass; kiểm: test 3.7 pass
- [x] 3.9 RED: S8.3-AC1 "Tăng mục tiêu không đổi các ngày đã qua" (Phần 3, dữ liệu app tự ghi) — `completeOnboarding(15)`; mỗi ngày D-3, D-2, D-1 `recordStudyTime` 20 phút; ở D0 `changeDailyGoal(30, now)`, `recordStudyTime` 20 phút → `getStudyStreak` = 3, `getTodayStudy().goalMinutes` = 30; `changeDailyGoal(45)` → throw `'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.'`; kiểm: fail vì skeleton `changeDailyGoal` no-op (mục tiêu vẫn 15) — nếu pass ở phần streak thì tạm cho 1.4 chụp mục tiêu khi đọc thay vì khi ghi để thấy fail rồi trả lại
- [x] 3.10 GREEN: Phần 1 `writeDailyGoal`; Phần 3 `changeDailyGoal(minutes, now)` (`isValidDailyGoal` → throw, `writeDailyGoal(toLocalDateKey(now), minutes)`); kiểm: test 3.9 pass
- [ ] 3.11 RED: S8.3-AC1 "Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi" (Phần 3) — `completeOnboarding(15)`, D-1 không học, D0 `recordStudyTime` 20 phút, `changeDailyGoal(30, D0)` → `getStudyStreak(D0 23:59)` = 0, `getStudyStreak(D+1 00:01)` = 0; kiểm: chạy, nếu pass ngay thì tạm bỏ cập nhật dòng hôm nay trong `saveDailyGoal` (chỉ ghi settings) để thấy 1 rồi trả lại
- [ ] 3.12 GREEN: sửa đến khi pass; kiểm: test 3.11 pass
- [ ] 3.13 RED: S8.3-AC1 "Hạ mục tiêu không biến ngày chưa đạt thành đạt" (Phần 3) — `completeOnboarding(30)`, D-2 và D-1 `recordStudyTime` 20 phút, D0 `changeDailyGoal(15)` chưa học → 0; kiểm: chạy, nếu pass ngay thì tạm cho `saveDailyGoal` cập nhật mọi dòng để thấy fail rồi trả lại
- [ ] 3.14 GREEN: sửa đến khi pass; kiểm: test 3.13 pass, file test < 300 dòng (tách `progress.service.streak-goal.test.ts` nếu vượt)

## 4. Trang chủ — `useHome`, `StudyStreakStatus`, `HomeContainer` (design D5)

Test: `apps/web/src/app/pages/home/containers/HomeContainer.streak.test.tsx` và
`apps/web/src/app/pages/home/containers/HomeContainer.streakRefresh.test.tsx` (mới) — `openRoute('/home')`, giả chỉ `Date`
(`vi.useFakeTimers({ toFake: ['Date'] })`), `mockContentFetch(respondToContent)`, dữ liệu qua `home.fixtures.ts`
(`seedDailyStat(date, studySeconds, goalMinutes?)` — tham số thứ ba thêm trong commit RED 4.1, lời gọi cũ không đổi).

- [ ] 4.1 RED: S8.3-AC2 "Trang chủ hiện streak" — D-3 0, D-2, D-1, D0 đạt → `findByText('Chuỗi ngày học: 3 ngày')`, phần tử là `<p>` (không `aria-hidden`); kiểm: fail vì Trang chủ chưa có dòng streak
- [ ] 4.2 GREEN: `useHome` thêm `streakDays` (cùng effect với phút hôm nay, cùng `now`, design D5); `StudyStreakStatus`; `HomeContainer` render sau `TodayStudyStatus`; `home.json` key `streak` "Chuỗi ngày học: {{days}} ngày"; `.home-streak` trong `_home.css` (`@apply text-body text-fg`); kiểm: test 4.1 pass, `HomeContainer*.test.tsx` cũ vẫn pass
- [ ] 4.3 RED: S8.3-AC2 "Streak bằng 0 vẫn hiện" — D-2 0, D-1 300 giây, D0 180 giây → "Chuỗi ngày học: 0 ngày"; DB trống (chỉ xong onboarding) → "Chuỗi ngày học: 0 ngày"; kiểm: chạy, nếu pass ngay thì tạm ẩn dòng khi `streakDays === 0` để thấy fail rồi trả lại
- [ ] 4.4 GREEN: sửa đến khi pass; kiểm: test 4.3 pass
- [ ] 4.5 RED: S8.3-AC1 "Số phút của một ngày đã qua bị hỏng" (mức màn) — D-2, D0 1200 giây, D-1 `'abc'` → "Chuỗi ngày học: 1 ngày", "Hôm nay: 20 / 15 phút", không `role="alert"`; kiểm: chạy, nếu pass ngay thì tạm cho `getStudyStreak` throw khi gặp dòng hỏng (bỏ `.catch`) để thấy Trang chủ kẹt/không có dòng streak rồi trả lại
- [ ] 4.6 GREEN: sửa đến khi pass; kiểm: test 4.5 pass
- [ ] 4.7 RED: S8.3-AC2 "Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay" — mẫu `HomeContainer.studyFlow.test.tsx`: D-3 0, D-2, D-1 đạt, D0 780 giây (13 phút), mục tiêu 15; `/home` "Chuỗi ngày học: 2 ngày"; bấm "Vào học", trả lời hết câu trong 2 phút 10 giây (đồng hồ giả), bấm "Trang chủ" trên tổng kết → "Chuỗi ngày học: 3 ngày" không tải lại; kiểm: chạy, nếu pass ngay thì tạm bỏ chờ chuỗi ghi ở `getAllDailyStats` (1.10) để thấy fail rồi trả lại (file `HomeContainer.streak.test.tsx`)
- [ ] 4.8 GREEN: sửa đến khi pass; kiểm: test 4.7 pass
- [ ] 4.9 RED: S8.3-AC2 "Quay lại app từ nền qua ngày mới thì cập nhật" (file `HomeContainer.streakRefresh.test.tsx`, mẫu `HomeContainer.midnight.test.tsx`) — 23:59 D0, D-3 0, D-2, D-1 đạt, D0 0 → "2 ngày"; tiến `Date` tới 00:01 D+1 không đổi visibility, `settle()` → vẫn "2 ngày" (dòng "Trang chủ đang hiện liên tục qua 0:00" của bảng); `setPageVisibility(true)` rồi `setPageVisibility(false)` → "Chuỗi ngày học: 0 ngày"; kiểm: chạy, nếu pass ngay thì tạm bỏ `isPageVisible` khỏi deps effect để thấy fail rồi trả lại
- [ ] 4.10 GREEN: sửa đến khi pass; kiểm: test 4.9 pass
- [ ] 4.11 RED: S8.3-AC1 "Ngày mới bắt đầu sau nửa đêm theo giờ máy" (mức màn, `HomeContainer.streakRefresh.test.tsx`) — D-2 0, D-1, D0 đạt; `/home` lúc 23:58 D0 → "2 ngày"; sang 00:01 D+1, `router.navigate('/learning-paths')` rồi về `/home` → "2 ngày" và "Hôm nay: 0 / 15 phút"; sang 00:01 D+2, điều hướng đi rồi về → "0 ngày"; kiểm: chạy, nếu pass ngay thì tạm truyền `today` cố định lúc mount hook đầu tiên (cache theo module) để thấy fail rồi trả lại
- [ ] 4.12 GREEN: sửa đến khi pass; kiểm: test 4.11 pass, mọi file < 300 dòng, component < 5 props, effect có cleanup, deps đủ (lint sạch)

## 5. Luồng thật trên bản build — e2e Playwright (`apps/web/e2e/E8/`)

E2E viết sau nhóm 1–4 chạy trên màn đã có: RED nào pass ngay thì tạm đổi hành vi (ví dụ ẩn dòng streak, cho streak luôn 0) để
thấy fail rồi trả lại. Tên test mang ID TC và ID Scenario. Helper mới `apps/web/e2e/E8/streak.helpers.ts`: `streakText(page)`,
`expectStreak(page, days)`, `dayKey(offset)`, `reachedDay(offset, goal = 15)`, `studiedDay(offset, seconds, goal?)` (design,
mục Test); dữ liệu nạp qua `seedProgress` của `home.helpers.ts`, đồng hồ `page.clock.install` + `runFor`/`runClockUntil`,
`test.use({ timezoneId: TIMEZONE })`.

- [ ] 5.1 RED: `apps/web/e2e/E8/s8.3-streak.spec.ts`, `test.describe('S8.3 Streak')`, dữ liệu nạp sẵn — TC-S8.3-AC1-1 ("Đạt mục tiêu hôm nay thì streak tăng 1": 14 → 15 phút, rời rồi mở lại Trang chủ), TC-S8.3-AC1-2 ("Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua"), TC-S8.3-AC1-3 ("Bỏ một ngày thì chuỗi đứt"), TC-S8.3-AC1-5 ("Đếm lại sau khi chuỗi đứt"), TC-S8.3-AC1-7 ("Chưa đủ trọn phút mục tiêu thì chưa tính là đạt"), TC-S8.3-AC1-10 ("Số phút của một ngày đã qua bị hỏng"), TC-S8.3-AC1-11 ("Ngày ghi sau hôm nay không được tính"), TC-S8.3-AC1-12 ("Tăng mục tiêu không đổi các ngày đã qua"), TC-S8.3-AC1-13 ("Hạ mục tiêu không biến ngày chưa đạt thành đạt"), TC-S8.3-AC1-15 ("Mục tiêu đang chọn bị hỏng"), TC-S8.3-AC1-16 ("Ngày đã qua không có mục tiêu đọc được", hai biến thể a/b), TC-S8.3-AC2-1 ("Trang chủ hiện streak"), TC-S8.3-AC2-5 ("Streak bằng 0 vẫn hiện"); kiểm: `pnpm e2e` fail đúng lý do
- [ ] 5.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass; kiểm: `pnpm e2e` file 5.1 pass
- [ ] 5.3 RED: `apps/web/e2e/E8/s8.3-streak-clock.spec.ts` (đồng hồ giả, học thật) — TC-S8.3-AC1-6 ("Người học mới chưa có ngày nào": xóa dữ liệu, `completeOnboarding(page, 15)`, về `/home`), TC-S8.3-AC1-9 ("Ngày mới bắt đầu sau nửa đêm theo giờ máy"), TC-S8.3-AC1-14 ("Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi"), TC-S8.3-AC1-17 ("Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó": ở màn bài 23:50 → 0:10 bằng `runFor`), TC-S8.3-AC1-19 ("Tăng mục tiêu không đổi các ngày đã qua", dữ liệu app tự ghi: onboarding 15, ba ngày mỗi ngày ở màn bài 20 phút rồi làm xong bài, sang hôm nay đổi mục tiêu đang chọn bằng ghi `settings.dailyGoalMinutes` 30 qua `seedProgress`-kiểu `page.evaluate` vì chưa có S8.2), TC-S8.3-AC2-7 ("Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay": bấm "Trang chủ" trên màn tổng kết), TC-S8.3-AC2-9 ("Quay lại app từ nền qua ngày mới thì cập nhật": `setPageVisibility(page, true)`, qua 0:00, `setPageVisibility(page, false)`); kiểm: fail đúng lý do
- [ ] 5.4 GREEN: sửa đến khi pass; kiểm: test 5.3 pass
- [ ] 5.5 RED: `apps/web/e2e/E8/s8.3-streak-offline.spec.ts`, mẫu `s8.1-home-offline.spec.ts` — TC-S8.3-AC2-6 ("Streak hiện khi không có mạng"): nạp D-3 0, D-2, D-1 đạt, D0 0, mở một lần có mạng (service worker), `context.setOffline(true)`, mở lại `/` → "Chuỗi ngày học: 2 ngày"; kiểm: thấy fail (tạm ẩn dòng streak khi `navigator.onLine === false` nếu pass ngay) rồi trả lại
- [ ] 5.6 GREEN: sửa đến khi pass; kiểm: test 5.5 pass, `pnpm e2e` toàn bộ pass (gồm e2e S8.1 không đổi)

## 6. Kiểm tra, PR

- [ ] 6.1 Rà giao diện dòng streak: preview `web-dev` 375×812 và 1280×800, sáng và tối (không tràn, không cắt chữ, tương phản ≥ 4.5:1 như `.home-today-study`) — CSS đã thêm ở 4.2; kiểm: ghi nhận đã xem trong mô tả PR
- [ ] 6.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, import theo bảng ở design, file < 300 dòng — đặc biệt `progress.service.ts`, component < 5 props, không mutate); kiểm: `pnpm lint` sạch
- [ ] 6.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 6.4 Chụp screenshot cho PR: Trang chủ có "Chuỗi ngày học: 3 ngày" và "Chuỗi ngày học: 0 ngày", trước/sau (Trang chủ S8.1 không có dòng streak) — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets` `pr-<n>/home-streak-<mobile|desktop>-<light|dark>.png`, nhúng trong bảng của mô tả PR
- [ ] 6.5 Ghi vào mô tả PR code mục "Hướng dẫn QA nạp dữ liệu" (test-cases yêu cầu): DB IndexedDB `tranie-chinese`, bảng `dailyStats` (khóa `date` `YYYY-MM-DD` theo giờ máy, `studySeconds` giây, `goalMinutes` 15/30/60) và `settings` (dòng `{ key: 'dailyGoalMinutes', value }`); đoạn script dán vào Console DevTools ghi nhiều ngày một lần (ví dụ `D-3 không học · D-2 đạt · D-1 đạt · hôm nay 14 phút`), cách ghi giá trị hỏng (`studySeconds: 'abc'`, `goalMinutes: 'abc'`), cách xóa mục tiêu một ngày (ghi lại dòng không có `goalMinutes`), cách đổi mục tiêu đang chọn khi chưa có S8.2 (dòng `settings`), rồi tải lại trang; chỉnh đồng hồ hệ điều hành cho case qua 0:00; nêu rằng dòng streak chỉ tính lại khi mở/quay lại Trang chủ hoặc app quay lại từ nền; kiểm: mô tả PR có đủ các mục, chạy thử script trên preview `web-build-preview` thấy đúng TC-S8.3-AC2-1
- [ ] 6.6 Ghi vào mục Description của PR code một đoạn "Lệch câu chữ với proposal" (design D1): proposal S8.3 ghi "một lần nâng schema riêng" (hàng `core/helpers/db.helper.ts` của bảng Layer đích, cùng ý ở What Changes/Open Questions) và proposal S8.5 (`openspec/changes/s8-5-progress-backup/proposal.md` dòng ~64) ghi "nâng dữ liệu riêng", nhưng PR **không** thêm `db.version(4)`: `goalMinutes` không phải index, dòng cũ đọc ra `undefined` đúng spec, không backfill; "nâng" được thực hiện bằng mở rộng `dailyStatSchema` + cách ghi của `DexieProgressStore`; `db.helper.ts` chỉ đổi comment `DailyStatRow`. Không sửa spec trong PR code; kiểm: mô tả PR có đoạn này

## Workflow follow-up

- PR code ghi `Spec PR: #130`, References `Closes #56` khi đủ AC1–AC2, dòng `OpenSpec change: s8-3-streak`.
- S8.2 (đổi mục tiêu ở Cài đặt) **phải** gọi `ProgressService.changeDailyGoal` thay vì tự ghi `settings`, để mục tiêu của hôm
  nay được cập nhật cùng transaction (design D2, D4). Reviewer S8.2 lưu ý rủi ro đã chấp nhận (design Risks): cửa sổ tối đa
  15 giây sau 0:00 — nếu lần ghi định kỳ còn chứa phần thời gian trước 0:00 chạy **sau** khi đổi mục tiêu, dòng hôm qua chụp
  mục tiêu mới (lệch tối đa một ngày). S8.2 không cần sửa, nhưng không được làm cửa sổ này rộng hơn (ví dụ tăng chu kỳ ghi
  hoặc ghi `settings` ngoài `changeDailyGoal`).
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
