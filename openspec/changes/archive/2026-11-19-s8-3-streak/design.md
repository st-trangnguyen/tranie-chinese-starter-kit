# Design: S8.3 Streak

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/study-streak/spec.md`. Case nghiệm thu: `test-cases.md`. Luật
layer/dependency/service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau khi merge PR code S8.1 #134 và PR spec S8.3 #130, không phải đề xuất):

- `@csk/shared` (`packages/shared/src/progress.schema.ts`): `dailyGoalMinutesSchema` (15 | 30 | 60), `settingsSchema`
  (`dailyGoalMinutes` hỏng → `.catch(15)`), `localDateKeySchema` (`YYYY-MM-DD`), `dailyStatSchema = { date, studySeconds }`
  (`studySeconds` số thực ≥ 0, hữu hạn). Zod `object` mặc định bỏ field lạ, nên dòng có thêm field vẫn parse được.
- `core/helpers/db.helper.ts`: Dexie version 1–3; `dailyStats: 'date'` (version 3), `DailyStatRow { date; [field]: unknown }`.
- `core/services/progress-store.service.ts` (116 dòng): `DexieProgressStore.getDailyStat(date)` chờ chuỗi
  `studyTimeWrites` rồi đọc + `safeParse` (hỏng → `undefined`); `addStudySeconds(date, seconds)` nối đồng bộ vào chuỗi,
  `writeStudySeconds` đọc + cộng + `put` trong một transaction `rw` trên `dailyStats` (dòng hỏng coi là 0 và bị thay). Không
  có method đọc nhiều ngày, không có method đổi mục tiêu riêng (`saveSettings` ghi cả object).
- `shared/services/progress.service.ts` (203 dòng): Phần 2 có `toStudyMinutes` (`Math.floor`), `isDailyGoalReached`
  (`>=`), `splitStudyTimeByDay`; Phần 3 có `completeOnboarding` (cách duy nhất đặt mục tiêu hiện nay), `recordStudyTime`
  (xếp mọi lần ghi đồng bộ để giữ thứ tự ghi trước đọc), `getTodayStudy(now)` (không throw: settings lỗi → mặc định, dòng
  lỗi → 0).
- `shared/utils/date.utils.ts`: `toLocalDateKey(ms)`, `startOfNextLocalDay(ms)`. Chưa có hàm lùi một ngày theo khóa.
- `pages/home/hooks/useHome.ts` (84 dòng): effect phút hôm nay deps `[progressService, isPageVisible]` (`usePageVisibility`),
  chạy khi mount và mỗi lần trang hiện lại, cờ `isActive`, không timer. `HomeContainer` render `TodayStudyStatus` khi
  `todayStudy !== null`, rồi link "Xem lộ trình". i18n `assets/i18n/vi/home.json`; CSS `styles/tailwind/components/_home.css`.
- Chưa có màn đổi mục tiêu (S8.2 chưa có code). Spec S8.2 (chưa merge code) dự kiến "use case đổi từng tùy chọn" ở service
  tiến độ/cài đặt.
- Test hiện có dùng lại được: `home.fixtures.ts` (`seedGoal`, `seedDailyStat(date, studySeconds)`, `seedProgress`,
  `respondToContent`), `HomeContainer.midnight.test.tsx` (giả `Date`, `setPageVisibility`), `HomeContainer.studyFlow.test.tsx`
  (học thật qua màn bài rồi về Trang chủ), `progress-store.daily-stats.test.ts` (DB tên ngẫu nhiên). E2E:
  `e2e/E8/home.helpers.ts` (`seedProgress` ghi dòng thô bất kỳ field, `runClockUntil`, `setPageVisibility`,
  `completeOnboarding`, `finishLesson`, `TIMEZONE`), mẫu offline `e2e/E8/s8.1-home-offline.spec.ts`.
- Sau khi merge `main` có code S8.2 (`openspec/changes/s8-2-settings`, màn Cài đặt) vào nhánh: `ProgressStore.saveSettings(patch:
  Partial<Settings>)` chỉ ghi các khóa trong `patch` (`bulkPut`); `ProgressService` có `changeDefaultAudioSpeed`,
  `changePinyinVisibility` và màn Cài đặt (`pages/settings/hooks/useSettings.ts`) gọi `changeDailyGoal`. Test S8.2
  (`progress.service.settings.test.ts`, `SettingsContainer.errors.test.tsx`, `SettingsContainer.corrupt.test.tsx`) spy/mock
  `saveSettings` khi đổi mục tiêu, có test hoãn lần ghi bằng deferred. Các điều chỉnh do merge này: D2, D4 (mục "Sau merge S8.2").
- Test S8.1 so dòng `dailyStats` bằng `toEqual({ date, studySeconds })` (6 chỗ trong `progress-store.daily-stats.test.ts`);
  object `ProgressStore` viết tay ở `progress.service.test.ts` (`makeStore`), `progress.service.study-time.test.ts`
  (`unavailableStore`), `lesson.service.test.ts` (`unreadable`, `unwritable`).

## Goals / Non-Goals

**Goals:**

- Quy tắc streak (ngày đạt, mục tiêu dùng để so, mục tiêu thay thế, đếm lùi, bỏ ngày sau hôm nay) là hàm thuần ở Phần 2 của
  service tiến độ (sau merge S8.2: `StudyTimeService`, `ProgressService` ủy quyền, D4), test bằng bảng dữ liệu không cần
  IndexedDB.
- Mục tiêu của từng ngày được ghi đúng lúc (mỗi lần ghi phút, mỗi lần đổi mục tiêu) mà không phá thứ tự ghi trước đọc và
  tính nguyên tử giữa hai tab mà S8.1 đã có.
- Trang chủ tính lại streak đúng các lúc spec liệt kê, cùng nhịp với dòng phút hôm nay.

**Non-Goals:**

- Không làm màn đổi mục tiêu (S8.2); chỉ cung cấp use case `changeDailyGoal` để S8.2 gọi (sau merge, màn Cài đặt S8.2 gọi
  đúng use case này).
- Không điền mục tiêu cho các ngày ghi trước bản S8.3 (spec: các ngày đó so với mục tiêu hôm nay).
- Không thêm dependency, không thêm Dexie version (D1).

## Decisions

### D1. Dữ liệu: field `goalMinutes` trong dòng `dailyStats`, không thêm Dexie version

- `@csk/shared`: `dailyStatSchema` thêm `goalMinutes: dailyGoalMinutesSchema.optional().catch(undefined)`. Mục tiêu thiếu
  hoặc hỏng (không phải 15/30/60, sai kiểu) thành `undefined` mà **không** làm hỏng cả dòng, nên số phút hôm nay vẫn đọc được
  (S8.1 không đổi) và ngày đã qua rơi vào mục tiêu thay thế (D3). `studySeconds` hỏng vẫn làm cả dòng hỏng như S8.1 (ngày đó
  coi là 0 phút, chưa đạt: đúng bảng "Ngày không có số phút dùng được").
- **Không thêm `db.version(4)`**: Dexie chỉ cần version mới khi đổi bảng hoặc index; `goalMinutes` không phải index, dòng cũ
  không có field này đọc ra `undefined` đúng như spec muốn (ngày ghi trước bản S8.3 không có mục tiêu). Không có `upgrade` vì
  spec cấm điền mục tiêu cho ngày cũ. `db.helper.ts` chỉ sửa comment của `DailyStatRow` (field `goalMinutes`).
  "Lần nâng dữ liệu riêng" trong proposal được thực hiện bằng việc mở rộng schema Zod + cách ghi (D2), không cần bước
  migrate. Thay thế: version 4 rỗng — không thêm gì, mà làm bản rollback (khai báo tới version 3) gặp lỗi version khi mở DB.
- Lệch câu chữ với proposal (giữ quyết định kỹ thuật, không sửa spec): proposal S8.3 ghi "một lần nâng schema riêng" ở hàng
  `core/helpers/db.helper.ts` của bảng Layer đích (và "lần nâng dữ liệu trên máy riêng" ở What Changes/Open Questions);
  proposal S8.5 (`openspec/changes/s8-5-progress-backup/proposal.md`, mục phụ thuộc S8.3, dòng ~64) cũng nói "nâng dữ liệu
  riêng". Code không có `db.version(4)`; mục Description của PR code ghi rõ chỗ lệch này (tasks 6.6) để người duyệt không đi
  tìm version Dexie mới.
- Thay thế khác: bảng riêng `dailyGoals` khóa `date` → hai bảng phải ghi cùng transaction ở mọi đường ghi, đọc streak phải
  join; S8.5 sao lưu thêm một bảng. Lưu lịch sử đổi mục tiêu (dòng thời gian) → suy mục tiêu "lúc ngày kết thúc" phải tìm
  theo khoảng, phức tạp hơn mà spec không cần.

### D2. `ProgressStore`: ghi mục tiêu kèm phút, đổi mục tiêu, đọc mọi ngày

- `addStudySeconds(date, seconds)` (giữ chữ ký): `writeStudySeconds` mở transaction `rw` trên **`dailyStats` + `settings`**,
  đọc dòng ngày + `parseSettings` của bảng `settings`, rồi `put({ date, studySeconds: current + seconds, goalMinutes:
  settings.dailyGoalMinutes })`. Mục tiêu đọc trong cùng transaction với lần ghi phút, nên đổi mục tiêu ở tab khác không xen
  được giữa đọc và ghi.
  - Vì sao ở store chứ không truyền mục tiêu từ service: `recordStudyTime` phải xếp lần ghi vào chuỗi `studyTimeWrites`
    **đồng bộ** (S8.1 D2/D4) để Trang chủ mount ngay sau màn bài đọc thấy phần cuối. Nếu service `await readSettings()` trước
    khi gọi store thì lần đọc của Trang chủ có thể chạy trước lần ghi (đua; test S8.1 "Học xong quay lại Trang chủ thấy số phút
    tăng" sẽ bắt). Store không quyết định gì: **chỉ chụp giá trị mục tiêu đang chọn** (`settings.dailyGoalMinutes` sau
    `parseSettings`) vào dòng, không rẽ nhánh theo mục tiêu, không so phút với mục tiêu, không quy tắc nghiệp vụ; quy tắc dùng
    mục tiêu đó thế nào nằm ở Phần 2 (D3). Câu này được ghi nguyên ý ở comment interface `ProgressStore.addStudySeconds`
    (tasks 1.4) và `docs/03-architecture.md` §6.3 (tasks 1.11).
  - Thay thế: store nhận callback cập nhật từ service (`updateDailyStat(date, updater)`) → rule ở service nhưng API store
    phức tạp hơn và vẫn phải đọc `settings` trong store; truyền `Promise<goal>` vào store → khó đọc, khó test.
- `saveDailyGoal(date: string, goalMinutes: DailyGoalMinutes): Promise<void>` (mới): nối vào chuỗi `studyTimeWrites` như
  `addStudySeconds`; đổi settings `dailyGoalMinutes` và, nếu dòng `date` parse được, `put({ ...dòng, goalMinutes })` (thứ tự hiện
  tại: mục "Sau merge S8.2" bên dưới); không có dòng hoặc dòng hỏng thì không tạo/không sửa dòng (lần ghi phút sau sẽ chụp
  mục tiêu mới; ngày không có phút nào thì chưa đạt dù mục tiêu nào).
  - Bản kế hoạch ban đầu: **một** transaction `rw` trên `settings` + `dailyStats` (settings và mục tiêu hôm nay đổi cùng lúc
    hoặc không đổi gì).
  - **Sau merge S8.2:** hai bước, không còn một transaction chung. Thứ tự (đảo sau duyệt lại plan, tasks 6.8/6.9; bản
    6.7 ghi settings trước):
    (1) Một transaction `rw` **chỉ** trên `dailyStats`: `get(date)` + `dailyStatSchema.safeParse`, parse được thì `put({
    ...dòng, goalMinutes })`; không có dòng hoặc dòng hỏng thì không tạo/không sửa.
    (2) `await this.saveSettings({ dailyGoalMinutes: goalMinutes })` — một cửa ghi settings của S8.2.
    Bước (1) lỗi thì reject và **không** gọi (2). Không nuốt lỗi ở bước nào. Cả hai bước nằm trong cùng một mục của chuỗi
    `studyTimeWrites`, nên thứ tự với `addStudySeconds` và các lần đọc `getDailyStat`/`getAllDailyStats` trong tab không đổi.
  - Lý do hai bước: test S8.2 spy/mock `saveSettings` khi đổi mục tiêu (lỗi ghi, dữ liệu hỏng, hoãn ghi bằng deferred); ghi
    settings bằng `put` riêng trong transaction thì các test đó không thấy lần ghi. Gọi `saveSettings` (một `await` không thuộc
    Dexie) bên trong transaction thì transaction tự commit sớm (IndexedDB đóng transaction khi không còn request chờ), nên
    không gộp được hai việc vào một transaction mà vẫn đi qua `saveSettings`.
  - Lý do thứ tự dòng ngày trước, settings sau: màn Cài đặt S8.2 (`pages/settings/hooks/useSettings.ts`, `applyChange`) khi
    `changeDailyGoal` reject thì đưa lựa chọn về giá trị cũ và báo "Không lưu được cài đặt" (Requirement lỗi lưu của S8.2:
    "MUST đưa lựa chọn đó về giá trị trước khi đổi"). Mục tiêu đang chọn là `settings.dailyGoalMinutes`, nên settings phải là
    bước ghi **cuối**: promise reject ⇔ settings giữ giá trị cũ ⇔ màn đúng khi về giá trị cũ. Thứ tự cũ (settings trước) để
    lọt trường hợp settings đã đổi mà (2) lỗi → màn về cũ nhưng DB giữ mục tiêu mới, lần mở lại Cài đặt hiện mục tiêu mới.
  - Phân tích lỗi theo thứ tự mới:
    - (1) lỗi: reject trước khi đụng settings. Settings và dòng ngày không đổi (transaction rollback). Màn Cài đặt về cũ, khớp
      DB. Streak không đổi.
    - (2) lỗi: reject, settings giữ cũ, màn về cũ, khớp. Dòng hôm nay đã mang mục tiêu mới (không được lưu). Không ảnh hưởng
      khi còn là hôm nay: hôm nay luôn so với mục tiêu đang chọn (D3), và lần ghi phút kế tiếp (≤ 15 giây khi đang học) chụp lại
      mục tiêu cũ. Rủi ro còn lại: qua 0:00 trước lần ghi phút kế tiếp thì ngày đó thành ngày đã qua mang mục tiêu không được
      lưu (lệch tối đa một ngày, chỉ khi ghi settings lỗi). Ghi ở Risks.
    - Hai tab: lần ghi phút ở tab khác xen giữa (1) và (2) đọc settings cũ nên chụp lại mục tiêu cũ vào dòng hôm nay; sau (2)
      settings mới. Hôm nay vẫn so với mục tiêu đang chọn (D3), lần ghi phút kế tiếp chụp mục tiêu mới; lệch chỉ khi qua 0:00
      trong cửa sổ đó (cùng loại với rủi ro 0:00 ở Risks).
- `getAllDailyStats(): Promise<DailyStat[]>` (mới): chờ chuỗi `studyTimeWrites` (như `getDailyStat`, để học xong về Trang chủ
  thấy streak mới), `toArray()`, `safeParse` từng dòng, dòng hỏng bị bỏ (= ngày không có phút dùng được → chưa đạt). Số dòng
  tăng một mỗi ngày học (vài trăm dòng mỗi năm), đọc cả bảng là đủ; thay thế: đọc theo khoảng `where('date').below(...)`
  dừng ở ngày đầu tiên chưa đạt → phải đọc nhiều lần hoặc đoán độ dài, không cần ở quy mô này.
- Interface `ProgressStore` thêm hai method; các object `ProgressStore` viết tay trong test cũ cần stub (tasks 1.1).
- `progress-store.service.ts` dự kiến ~160 dòng (< 300).

### D3. Quy tắc: Phần 2 của service tiến độ (thuần, mỗi method một `Rule:`)

Sau merge S8.2 các rule dưới đây nằm ở `StudyTimeService` Phần 2 (D4); chữ ký và nội dung không đổi.

- `shared/utils/date.utils.ts`: `previousLocalDateKey(dateKey: string): string` — tách `YYYY-MM-DD`, `new Date(y, m - 1,
  d - 1)` rồi `toLocalDateKey` (đúng qua đầu tháng, đầu năm, ngày đổi giờ). Leaf, không import gì.
- `resolveDayGoal(dayGoalMinutes: DailyGoalMinutes | undefined, todayGoalMinutes: DailyGoalMinutes): DailyGoalMinutes` —
  Rule: ngày đã qua so với mục tiêu đã lưu của ngày đó; thiếu hoặc hỏng thì so với mục tiêu dùng để so của hôm nay
  (Requirement "Mục tiêu bị thiếu hoặc hỏng").
- `isStreakDayReached(stat: DailyStat | undefined, isToday: boolean, todayGoalMinutes): boolean` — Rule: không có dòng → chưa
  đạt; hôm nay so với mục tiêu đang chọn (bỏ qua `goalMinutes` của dòng hôm nay); ngày đã qua so với `resolveDayGoal`; đạt khi
  `isDailyGoalReached(toStudyMinutes(stat.studySeconds), goal)` (đúng con số Trang chủ hiện, làm tròn xuống).
- `countStudyStreak(stats: readonly DailyStat[], today: string, todayGoalMinutes: DailyGoalMinutes): number` — Rule: bảng
  "Streak tăng theo ngày đạt mục tiêu": dựng `Map` theo `date`, bỏ dòng có `date > today` (so chuỗi `YYYY-MM-DD`); bắt đầu từ
  hôm nay nếu hôm nay đạt, ngược lại từ hôm qua; đếm lùi bằng `previousLocalDateKey` tới ngày đầu tiên chưa đạt. Vòng lặp dừng
  chắc chắn vì số ngày có dòng là hữu hạn.
- Không đọc store, không `Date.now()` (nhận `today` từ Phần 3), nên mọi Scenario AC1 kiểm được bằng bảng thuần.
- Chữ ký trên là trạng thái cuối. Theo TDD, `resolveDayGoal` được dựng dần qua các cặp RED/GREEN của tasks 2.21–2.26 (mục
  tiêu của ngày đã qua → bỏ so với mục tiêu hôm nay → nhánh thiếu/hỏng), để mỗi RED fail thật.

### D4. Use case: `ProgressService` Phần 1 + 3 (sau merge S8.2: tách `StudyTimeService`, xem cuối mục)

- Phần 1 thêm `private readAllDailyStats()`, `private writeDailyGoal(date, goalMinutes)` (ủy quyền store).
- `getStudyStreak(now: number = Date.now()): Promise<number>` — đọc settings (`.catch` → `DEFAULT_SETTINGS`) và
  `readAllDailyStats()` (`.catch` → `[]`) song song; `countStudyStreak(stats, toLocalDateKey(now), settings.dailyGoalMinutes)`.
  Không throw (cùng hợp đồng với `getTodayStudy`): IndexedDB không mở được thì streak 0, Trang chủ vẫn hiện.
- `changeDailyGoal(minutes: number, now: number = Date.now()): Promise<void>` — `isValidDailyGoal` sai thì throw
  `'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.'` (cùng câu với `completeOnboarding`); hợp lệ thì
  `writeDailyGoal(toLocalDateKey(now), minutes)`. Đây là use case "đổi mục tiêu" mà proposal yêu cầu, cũng là use case duy nhất
  màn Cài đặt S8.2 gọi (`useSettings.changeDailyGoal` → `service.changeDailyGoal(minutes)`); sau merge chỉ còn một
  `changeDailyGoal` (bản này) trong `ProgressService`. Scenario "Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi" và
  "Tăng mục tiêu không đổi các ngày đã qua" kiểm nó ở tầng service.
- `completeOnboarding` giữ nguyên: onboarding chạy trước mọi màn bài nên chưa có dòng `dailyStats` nào để cập nhật; lần ghi phút
  đầu tiên sẽ chụp mục tiêu vừa chọn (TC-S8.3-AC1-19).
- `recordStudyTime` không đổi code (mục tiêu được chụp trong store, D2).
- `progress.service.ts` dự kiến ~265 dòng (< 300). Nếu vượt khi GREEN/REFACTOR thì theo thứ tự: (1) rút gọn comment/JSDoc
  trùng lặp (ví dụ JSDoc lặp lại câu `Rule:`); (2) nếu vẫn vượt, tách phần streak theo pattern tách service có sẵn trong repo
  (rà `shared/services/` lúc đó, ghi pattern đã theo vào mô tả PR). Ba rule streak vẫn là method public riêng ở Phần 2, mỗi
  method một `Rule:` (CLAUDE.md §3); **không** gom thành helper private trong Phần 2, **không** dời rule sang `shared/utils`
  (rule nghiệp vụ thuộc service).
- Thay thế (bản kế hoạch ban đầu loại): service mới `streak.service.ts` chỉ cho streak → phải đọc settings và `dailyStats`
  lần nữa và dùng lại `toStudyMinutes`/`isDailyGoalReached` của `ProgressService` (gọi chéo service); proposal chốt "service
  tiến độ hiện có".
- **Sau merge S8.2 (trạng thái hiện tại của code):** `progress.service.ts` vượt 300 dòng (S8.2 thêm tùy chọn audio/pinyin +
  S8.3), bước (2) ở trên được áp dụng: tách `shared/services/study-time.service.ts` — `StudyTimeService`, 3 phần, nhận
  `ProgressStore` qua constructor (mặc định `progressStore`).
  - Phần 1: `readSettings`, `readDailyStat`, `readAllDailyStats`, `addStudySeconds` (private, ủy quyền store).
  - Phần 2: toàn bộ rule phút học S8.1 + streak S8.3: `splitStudyTimeByDay`, `toStudyMinutes`, `isDailyGoalReached`,
    `resolveDayGoal`, `isStreakDayReached`, `countStudyStreak` (mỗi method một `Rule:`).
  - Phần 3: `recordStudyTime`, `getTodayStudy`, `getStudyStreak` (hợp đồng không đổi: không throw, xếp lần ghi đồng bộ).
  - `ProgressService` tạo `new StudyTimeService(store)` trong constructor (cùng instance store, nên chuỗi `studyTimeWrites`
    vẫn là một) và ủy quyền các method mà hook/test gọi: `splitStudyTimeByDay`, `toStudyMinutes`, `isDailyGoalReached`,
    `countStudyStreak`, `recordStudyTime`, `getTodayStudy`, `getStudyStreak`. API công khai `ProgressService` với `useHome`,
    `useLessonRunner`… không đổi. `changeDailyGoal`, `isValidDailyGoal`, `writeDailyGoal` ở lại `ProgressService` (chung luồng
    cài đặt/onboarding với S8.2).
  - Pattern theo repo: `WritingPracticeService` ủy quyền `StrokeOrderService` (`writing-practice.service.ts`).
  - Vì sao khác lựa chọn bị loại ở trên: gom **cả** phút học S8.1 lẫn streak S8.3 vào một service, nên streak dùng
    `toStudyMinutes`/`isDailyGoalReached` ngay trong cùng class (không gọi chéo) và `getStudyStreak` vẫn đọc settings +
    `dailyStats` một lần. `StudyTimeService` không import `ProgressService` (một chiều).

### D5. Trang chủ: `useHome` + `StudyStreakStatus`

- `useHome` thêm `streakDays: number | null` vào `HomeState` (`null` = đang nạp). Effect phút hôm nay (deps
  `[progressService, isPageVisible]`) đổi thành `const now = Date.now(); Promise.all([getTodayStudy(now),
  getStudyStreak(now)])` rồi set cả hai state trong cùng nhánh `isActive`. Cùng một `now` nên dòng phút và streak không lệch
  ngày; hai use case không throw nên không cần `.catch`.
  - Kết quả theo bảng "Lúc streak trên Trang chủ được tính lại": mount (mở app, quay về từ màn khác → container mount lại) và
    trang hiện lại (`usePageVisibility`) thì tính lại; không timer nên hiện liên tục qua 0:00 thì giữ số cũ.
  - Thay thế: effect riêng cho streak → hai lần đọc settings lệch thời điểm, hai cờ `isActive`; không có lợi.
- `pages/home/components/StudyStreakStatus.tsx` — props `{ streakDays: number }`: `<p className="home-streak">`
  `t('streak', { days: streakDays })` → "Chuỗi ngày học: N ngày". Dùng biến `days`, **không** dùng `count` (tránh i18next tìm
  key số nhiều `streak_other`). Chữ thường trong `<p>`, không icon, không `aria-hidden`, không animation → trình đọc màn hình đọc
  nguyên câu, không cần xử lý giảm chuyển động.
- `HomeContainer`: render `{streakDays !== null && <StudyStreakStatus streakDays={streakDays} />}` ngay sau
  `TodayStudyStatus`, trước link "Xem lộ trình" (đọc theo thứ tự: bài tiếp theo → phút hôm nay → streak → lộ trình). Không đổi
  phần khác của Trang chủ.
- i18n `assets/i18n/vi/home.json` thêm `"streak": "Chuỗi ngày học: {{days}} ngày"`.
- CSS `_home.css` thêm `.home-streak { @apply text-body text-fg; }` (token semantic, tự đổi theme tối, tương phản như
  `.home-today-study`). JSX chỉ layout/spacing (§6).
- Offline: dữ liệu ở IndexedDB, Trang chủ đã nằm trong precache (S8.1 TC offline) nên không cần thêm gì cho PWA.

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `HomeContainer`, `StudyStreakStatus` | `useHome`, react-i18next | ✅ không chạm `shared/services` |
| `useHome` | `ProgressService`, `ContentService`, `usePageVisibility` | ✅ hooks → shared/services, core/hooks |
| `ProgressService` | `ProgressStore`, `StudyTimeService`, `@csk/shared`, `date.utils`, `learning-path.utils` | ✅ không React, không Dexie; shared/services → shared/services cùng tầng, một chiều |
| `StudyTimeService` | `ProgressStore`, `@csk/shared`, `date.utils`, `home.model` (type) | ✅ không React, không Dexie, không import `ProgressService` |
| `DexieProgressStore` | `dailyStatSchema`, `parseSettings`, `DailyGoalMinutes` (`@csk/shared`), `db.helper` | ✅ core/services → `@csk/shared` |
| `date.utils` | không gì | ✅ leaf |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| Dòng `dailyStats` (IndexedDB), gồm `goalMinutes` | `dailyStatSchema` (mở rộng, `goalMinutes` `.optional().catch(undefined)`) | `DexieProgressStore.getDailyStat`, `getAllDailyStats`, `writeStudySeconds`, `saveDailyGoal` |
| `settings` (mục tiêu đang chọn) | `parseSettings` | có sẵn; thêm lần đọc trong `writeStudySeconds` |

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Schema `goalMinutes` | `packages/shared` | `packages/shared/src/progress.schema.test.ts` |
| Lùi một ngày theo khóa | `shared/utils` | `apps/web/src/app/shared/utils/date.utils.test.ts` |
| Chụp mục tiêu khi ghi phút, đổi mục tiêu, đọc mọi ngày | `core/services` | `apps/web/src/app/core/services/progress-store.daily-goal.test.ts` (mới, DB tên ngẫu nhiên) |
| Quy tắc streak (Phần 2) | `shared/services` | `apps/web/src/app/shared/services/progress.service.streak.test.ts` (mới, hàm thuần) ; sau merge S8.2 gọi qua `ProgressService` ủy quyền sang `StudyTimeService`, file test giữ nguyên) |
| Use case streak, đổi mục tiêu (Phần 3) | `shared/services` + fake-indexeddb | `apps/web/src/app/shared/services/progress.service.streak-flow.test.ts` (mới) |
| Trang chủ hiện streak, tính lại | route thật | `apps/web/src/app/pages/home/containers/HomeContainer.streak.test.tsx`, `HomeContainer.streakRefresh.test.tsx` (mới) |
| Luồng thật trên bản build | e2e | `apps/web/e2e/E8/s8.3-streak.spec.ts`, `s8.3-streak-clock.spec.ts`, `s8.3-streak-offline.spec.ts` + helper `e2e/E8/streak.helpers.ts` |

- Ngày trong Vitest dựng bằng `new Date(y, m, d, h, mi)` (giờ local) + `toLocalDateKey`, không viết cứng chuỗi ngày phụ thuộc
  múi giờ. Container test giả chỉ `Date` (`vi.useFakeTimers({ toFake: ['Date'] })`) như `HomeContainer.midnight.test.tsx`.
- `home.fixtures.ts`: `seedDailyStat(date, studySeconds, goalMinutes?: unknown)` — tham số thứ ba tùy chọn, ghi `goalMinutes`
  khi có (kể cả giá trị hỏng); lời gọi cũ không đổi.
- E2E: `streak.helpers.ts` có `streakText(page)` (`getByText(/^Chuỗi ngày học: \d+ ngày$/)`), `expectStreak(page, days)`,
  `dayKey(offset)` (khóa ngày tương đối với `NOW` theo `TIMEZONE` của `home.helpers.ts`), `reachedDay(offset, goal = 15)` →
  `{ date, studySeconds: 20 * 60, goalMinutes: goal }`. Dữ liệu nạp qua `seedProgress` sẵn có. Đồng hồ `page.clock.install`
  + `runFor`/`runClockUntil` như S8.1 (không `fastForward`), `test.use({ timezoneId: TIMEZONE })`.

## Risks / Trade-offs

- [Store đọc `settings` khi ghi phút: việc "chụp mục tiêu" nằm ở core] → store chỉ chụp giá trị mục tiêu đang chọn, không rẽ
  nhánh, không quy tắc nghiệp vụ; ghi rõ ở comment interface `ProgressStore.addStudySeconds` và docs §6.3 (tasks 1.4, 1.11);
  mọi quyết định dùng mục tiêu ở Phần 2. Đổi lại giữ được thứ tự ghi trước đọc và
  tính nguyên tử giữa hai tab (D2).
- [Đổi mục tiêu ngay sau 0:00 trong khi lần ghi định kỳ còn chứa vài giây của hôm qua] → dòng hôm qua có thể được chụp mục tiêu
  mới (cửa sổ ≤ 15 giây, chu kỳ ghi S8.1). Chấp nhận: hiếm, lệch tối đa một ngày, và chỉ khi đổi mục tiêu đúng trong cửa sổ đó.
  Ghi vào "Workflow follow-up" của tasks để reviewer S8.2 (màn đổi mục tiêu) biết.
- [Dòng `goalMinutes` hợp lệ của **hôm nay** khác mục tiêu đang chọn (QA sửa tay settings)] → hôm nay luôn so với mục tiêu đang
  chọn (spec), dòng hôm nay chỉ dùng khi nó đã thành ngày đã qua; lần ghi phút kế tiếp chụp lại.
- [Đồng hồ máy chỉnh lùi để lại ngày sau hôm nay] → bỏ qua trong `countStudyStreak`; dòng đó vẫn nằm trong DB và sẽ được tính
  khi đồng hồ tới ngày đó (đúng: lúc ấy nó là hôm nay/ngày đã qua).
- [`progress.service.ts` gần 300 dòng] → ước lượng ~265; theo dõi ở REFACTOR (tasks 6.2). Sau merge S8.2 đã vượt và đã tách
  `StudyTimeService` (D4, tasks 6.7); hiện `progress.service.ts` ~260 dòng, `study-time.service.ts` ~160 dòng.
- [Sau merge S8.2, `saveDailyGoal` không còn một transaction chung settings + `dailyStats`] → thứ tự: dòng ngày trước,
  `saveSettings` sau (D2). Màn Cài đặt S8.2: promise reject ⇔ settings giữ cũ, nên lựa chọn về giá trị cũ luôn khớp DB
  (Requirement lỗi lưu S8.2). Streak: dòng ngày lỗi thì không gì đổi; settings lỗi thì dòng hôm nay đã mang mục tiêu không được
  lưu, chỉ ảnh hưởng streak khi qua 0:00 trước lần ghi phút kế tiếp (lệch tối đa một ngày). Chấp nhận để giữ một cửa ghi settings
  (`saveSettings`) mà test S8.2 dựa vào. Test: tasks 6.8/6.9.
- [Test S8.1 so cả dòng bằng `toEqual`] → đổi sang `toMatchObject` ở commit RED đầu tiên (tasks 1.1); hành vi S8.1 không đổi.
- [S8.5 sao lưu] → `goalMinutes` là field mới của `dailyStats`; S8.5 sao lưu cả dòng nên tự có. Ghi ở docs §6.2.

## Migration Plan

- Không đổi version Dexie. Người dùng cũ: dòng `dailyStats` trước bản này không có `goalMinutes` → so với mục tiêu hôm nay
  (spec). Từ lần ghi phút đầu tiên sau cập nhật, dòng hôm nay có mục tiêu.
- Rollback: revert PR. Bản S8.1 đọc `dailyStats` bằng schema cũ, Zod bỏ field `goalMinutes` → không lỗi; lần ghi của S8.1 ghi
  `{ date, studySeconds }` (mất `goalMinutes` của ngày đó). Không cần bước dọn dữ liệu.
- QA nạp dữ liệu: hướng dẫn DevTools trong mô tả PR code (tasks 6.5).

## Open Questions

- [x] Dòng streak đặt ở đâu trên Trang chủ? → ngay sau dòng "Hôm nay: X / Y phút", trước "Xem lộ trình" (D5); spec chỉ yêu cầu
  "trên Trang chủ", đổi chỗ sau này chỉ đổi JSX.
- [x] Có cần thêm Dexie version cho mục tiêu theo ngày không? → Không (D1): field không index, không backfill. Câu "lần nâng
  schema/dữ liệu riêng" trong proposal S8.3 (hàng `core/helpers/db.helper.ts`) và proposal S8.5 (dòng ~64) được thực hiện bằng
  mở rộng schema Zod + cách ghi, không đổi hành vi; chỗ lệch câu chữ ghi trong Description của PR code (tasks 6.6), không sửa spec.
