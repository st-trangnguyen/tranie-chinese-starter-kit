# Design: S8.5 Export / Import tiến độ

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/progress-backup/spec.md`. Case nghiệm thu: `test-cases.md`. Luật layer,
dependency, service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` tại `8a88004`, sau khi merge PR code S8.2 #136 và S8.3 #138; không phải đề xuất):

- **Dữ liệu tiến độ** (`core/helpers/db.helper.ts`): Dexie **version 3** (S8.2, S8.3 không đổi version), ba bảng `settings`
  (khóa `key`, mỗi tùy chọn một dòng `{ key, value }`), `lessonProgress` (khóa `lessonId`), `dailyStats` (khóa `date`). Row type để
  `unknown`, validate khi đọc. S8.3 thêm field `goalMinutes` (mục tiêu của chính ngày đó) vào dòng `dailyStats`, không phải index.
- **`ProgressStore`** (`core/services/progress-store.service.ts`, 183 dòng, singleton `progressStore`, class `DexieProgressStore`):
  `getSettings` (gộp dòng rồi `parseSettings`), `saveSettings`, `getAllLessonProgress` (dòng hỏng bị bỏ), `getLessonProgress`,
  `saveLessonProgress`, `saveLessonProgressBatch` (một transaction), `getDailyStat`, `getAllDailyStats` (S8.3, dòng hỏng bị bỏ),
  `addStudySeconds` (chụp `settings.dailyGoalMinutes` vào `goalMinutes` của dòng), `saveDailyGoal` (S8.3). Hai lần ghi thời gian/
  mục tiêu đi qua hàng đợi private `enqueueStudyTimeWrite` → chuỗi `studyTimeWrites`; `getDailyStat`/`getAllDailyStats` chờ chuỗi
  đó. Chưa có đọc/ghi toàn bộ. `docs/03-architecture.md` §6.3 dự kiến `exportAll(): Promise<Snapshot>` và `importAll(snapshot)`;
  §8 dự kiến "kiểm tra bằng zod và `schemaVersion` trước khi ghi đè"; §4 dự kiến `shared/services/backup.service`.
- **Schema** (`packages/shared/src/progress.schema.ts`, zod `^3.24`):
  - `Settings` là **interface khai báo tay** `{ dailyGoalMinutes; hasCompletedOnboarding; defaultAudioSpeed: AudioSpeed;
    isPinyinVisible: boolean }` (S8.2), `DEFAULT_SETTINGS`, `settingsSchema` khoan dung (mỗi field `.catch(mặc định)`),
    `parseSettings`. `audioSpeedSchema = z.enum(['normal', 'slow'])`, `dailyGoalMinutesSchema` (15/30/60).
  - `lessonProgressSchema` (`cursor` `.optional().catch(undefined)`), `localDateKeySchema` (chỉ regex), `dailyStatSchema`
    `{ date, studySeconds: finite ≥ 0, goalMinutes: dailyGoalMinutesSchema.optional().catch(undefined) }` (S8.3).
  - Các schema này dùng cho đọc DB, **không** dùng được cho file nhập vì spec đòi từ chối cả file khi một phần sai.
- **Service mẫu**: `ProgressService` (260 dòng, 3 phần có banner) ủy quyền thời gian học/streak cho `StudyTimeService`
  (`shared/services/study-time.service.ts`). Use case streak: `ProgressService.getStudyStreak(now)` →
  `StudyTimeService.getStudyStreak(now)` → `countStudyStreak(stats, today, settings.dailyGoalMinutes)`; ngày đã qua so với
  `resolveDayGoal(stat.goalMinutes, mục tiêu hôm nay)`, nên mất `goalMinutes` của ngày cũ thì streak đổi. Thời gian hôm nay:
  `getTodayStudy(now)` → `{ minutes, goalMinutes, isGoalReached }`. Cài đặt: `getLearningPreferences()` (không throw),
  `changeDailyGoal`, `changeDefaultAudioSpeed`, `changePinyinVisibility`. Lộ trình: `getCompletedLessonIds()`,
  `deriveLessonStatuses(stages, completedIds)`. `ContentSource` (`core/services/content-source.service.ts`, singleton
  `contentSource`, `getContentRoot()`); `listLessonIdsInOrder(stages)` ở `shared/utils/learning-path.utils.ts`; `date.utils.ts` có
  `toLocalDateKey(ms)`, `previousLocalDateKey(key)`.
- **Màn Cài đặt (S8.2)**: route `/settings` (`ROUTE_PATHS.settings`, `pages/settings/settings.routes.ts` → `settingsRoutes`),
  container `pages/settings/containers/SettingsContainer.tsx` (default export, `<main>` có liên kết "Về lộ trình" về
  `ROUTE_PATHS.learningPaths`, `h1` "Cài đặt", `role="alert"` lỗi lưu chỉ render khi có lỗi, ba component `DailyGoalSetting`,
  `AudioSpeedSetting`, `PinyinVisibilitySetting`). Hook `pages/settings/hooks/useSettings.ts` trả `{ preferences, saveErrorId,
  changeDailyGoal, changeDefaultAudioSpeed, changePinyinVisibility }`; đọc `getLearningPreferences()` **một lần** trong `useEffect`
  lúc mount, giữ `persistedRef`; **không có hàm nạp lại**. i18n `assets/i18n/vi/settings.json` (namespace `settings`), CSS
  `styles/tailwind/components/_settings.css` (đã import trong `main.css`).
- **Context tùy chọn**: `shared/contexts/AudioSpeedContext.tsx` (`AudioSpeedProvider`, `initialIsSlow`) và
  `PinyinVisibilityContext.tsx` (`PinyinVisibilityProvider`, `isVisible`) **chỉ bọc màn bài học** (`LessonRunnerContainer`), giá
  trị lấy từ `useLessonPreferences` (`getLessonPreferences()` khi mount). **Không có context tùy chọn cấp app**, nên sau khi nhập
  không có context nào phải nạp lại: lần mở bài sau đọc tùy chọn mới.
- **Trang chủ (S8.1/S8.3)**: `useHome` đọc tiến độ, "Hôm nay: X / Y phút" và "Chuỗi ngày học: N ngày" khi mount. `useLearningPath`
  đọc `getCompletedLessonIds` khi mount. Không cache toàn app: đi tới màn đó sau khi ghi đè là thấy dữ liệu mới.
- **Kiểm tra vượt cấp** (S3.6) ghi mọi bài của chủ đề là `completed` qua `saveLessonProgressBatch`, nên "bài xong nhờ vượt cấp"
  đã là dòng `completed` bình thường trong `lessonProgress`.
- **Không có hộp thoại nào** trong app; jsdom (Vitest) **không** có `HTMLDialogElement.showModal`, cũng không có
  `URL.createObjectURL`. Vùng thông báo đang dùng `role="status"` (UpdateBanner, RecordCompare) và `role="alert"`.
- **Test Vitest**: `fake-indexeddb`; store test tạo DB tên ngẫu nhiên (`progress-store.daily-goal.test.ts`,
  `progress-store.daily-stats.test.ts`); test `SettingsContainer*.test.tsx` dùng `renderWithProviders(<SettingsContainer />,
  { route: '/settings' })` hoặc `openRoute('/settings')` (`@test/stroke-order-route`, bảng route thật), `clearDatabase()` chỉ xoá
  `settings` và `lessonProgress`. **Năm** object `ProgressStore` viết tay sẽ hỏng typecheck khi interface thêm method:
  `shared/services/progress.service.test.ts:16`, `progress.service.study-time.test.ts:17`,
  `progress.service.streak-flow.test.ts:19`, `lesson.service.test.ts:383`, `lesson.service.test.ts:742`.
- **Test e2e** (`apps/web/e2e/E8/`): `home.helpers.ts` (`seedProgress` ghi thô ba bảng rồi reload, `completeOnboarding(page, goal)`,
  `TIMEZONE`, `NOW` = 2026-11-18 10:00 +07, `TODAY`, `YESTERDAY`, `expectTodayMinutes`); `settings.helpers.ts`
  (`openSettingsFromPath`, `expectSettingsScreen`, `goalRadio`, `pinyinSwitch`, `speedRadio`, `breakSettingsReads`,
  `breakSettingsWrites`: bọc method của `IDBObjectStore.prototype` theo tên bảng + cờ `sessionStorage`, chạy cả sau reload);
  `streak.helpers.ts` (`expectStreak`, `dayKey`, `studiedDay`, `reachedDay`); `multi-unit-path.helpers.ts` (`serveMultiUnitPath`
  thay `content.json` qua `page.route`, cần `serviceWorkers: 'block'`); `e2e/E1/s1.2-offline.spec.ts` có mẫu
  `openOnceWithServiceWorker` + `context.setOffline(true)`.

## Goals / Non-Goals

**Goals:**

- Định dạng file sao lưu có phiên bản, kiểm tra **chặt** (một phần sai là từ chối cả file) bằng Zod ở `@csk/shared`, tách khỏi
  schema đọc DB khoan dung nhưng dùng chung một nguồn field.
- Ghi đè là một transaction IndexedDB trên mọi bảng tiến độ: lỗi giữa chừng thì trình duyệt tự hoàn tác.
- Mọi quy tắc sao lưu (tên file, phân loại file lỗi, giới hạn kích thước, đếm bài đã xong) là hàm thuần ở `BackupService`
  Phần 2, test bằng bảng không cần IndexedDB.
- Mỗi tùy chọn Cài đặt (kể cả tùy chọn thêm sau) tự vào file sao lưu; thiếu schema cho field mới là lỗi typecheck.

**Non-Goals:**

- Không sửa hành vi màn Cài đặt (S8.2) hay streak (S8.3); chỉ thêm hàm nạp lại tùy chọn vào `useSettings` (D6).
- Không đổi version Dexie, không thêm bảng.
- Không thêm dependency (không dùng thư viện lưu file hay hộp thoại).
- Không đồng bộ tab khác (proposal, Không làm).

## Decisions

### D1. Dựa trên code S8.2, S8.3 đã merge

- Điều kiện chặn của proposal đã thoả: `main` có merge PR code S8.2 (#136) và S8.3 (#138), cùng S8.1. Nhánh
  `feat/s8-5-progress-backup` cắt từ `main` ≥ `8a88004`. tasks 1.1 chỉ kiểm lại điều này, không chặn.
- Tên thật dùng trong change này (thay cho tên dự kiến của bản nháp):

  | Thứ | Tên thật |
  |---|---|
  | Route Cài đặt | `ROUTE_PATHS.settings` = `/settings` (`settingsRoutes`) |
  | Container | `pages/settings/containers/SettingsContainer.tsx` (default export) |
  | Hook cài đặt | `pages/settings/hooks/useSettings.ts` → `useSettings()`; S8.5 thêm `reloadPreferences` (D6) |
  | Field cài đặt | `Settings.dailyGoalMinutes`, `hasCompletedOnboarding`, `defaultAudioSpeed` (`'normal' \| 'slow'`), `isPinyinVisible` |
  | Context tùy chọn cấp app | Không có (provider chỉ bọc màn bài học, đọc khi mount) → không cần nạp lại |
  | Mục tiêu theo ngày | `DailyStat.goalMinutes?: DailyGoalMinutes` trong bảng `dailyStats` (`dailyStatSchema`) |
  | Use case streak | `ProgressService.getStudyStreak(now)` (→ `StudyTimeService.getStudyStreak`) |
  | Phút học hôm nay | `ProgressService.getTodayStudy(now)` |
  | Namespace i18n | `settings` (`assets/i18n/vi/settings.json`) |
  | Dexie | version 3, ba bảng `settings`, `lessonProgress`, `dailyStats` |

- Điều chỉnh so với bản nháp: (a) `onImported` không nạp lại context cấp app (không có), chỉ gọi `reloadPreferences` mới của
  `useSettings`; (b) `importAll` đi qua hàng đợi `enqueueStudyTimeWrite` có sẵn (không tự nối `studyTimeWrites`) để xếp hàng cùng
  `addStudySeconds` và `saveDailyGoal` của S8.3; (c) `goalMinutes` của ngày vào schema chặt của file (D2); (d) stub thêm ở 5 object
  `ProgressStore` viết tay (không phải 4); (e) e2e giả lập lỗi theo mẫu guard `IDBObjectStore.prototype` của `settings.helpers.ts`.

### D2. Định dạng file sao lưu (`@csk/shared`, file mới `packages/shared/src/progress-backup.schema.ts`)

```jsonc
{
  "format": "tranie-chinese-progress",   // dấu nhận file của app
  "formatVersion": 1,
  "exportedOn": "2026-11-17",             // ngày giờ máy lúc xuất, cùng ngày trong tên file
  "settings": {
    "dailyGoalMinutes": 30,
    "hasCompletedOnboarding": true,
    "defaultAudioSpeed": "slow",
    "isPinyinVisible": false
  },
  "lessonProgress": [{ "lessonId": "intro-03", "status": "in-progress", "cursor": 3 }],
  "dailyStats": [{ "date": "2026-11-17", "studySeconds": 720, "goalMinutes": 15 }]
}
```

- Hằng: `PROGRESS_BACKUP_FORMAT = 'tranie-chinese-progress'`, `PROGRESS_BACKUP_FORMAT_VERSION = 1`.
- Schema:
  - `progressBackupEnvelopeSchema = z.object({ format: z.literal(PROGRESS_BACKUP_FORMAT), formatVersion: z.number() })` —
    chỉ để phân loại (D4).
  - `progressBackupV1Schema`: `format`, `formatVersion: z.literal(1)`, `exportedOn: localDateKeySchema` + refine là ngày có thật,
    `settings: settingsStrictSchema`, `lessonProgress: z.array(lessonProgressStrictSchema)` + refine không trùng `lessonId`,
    `dailyStats: z.array(dailyStatStrictSchema)` + refine không trùng `date`. **Không** `.catch` ở đâu: một field sai là cả file
    sai. Key thừa bị bỏ (mặc định của `z.object`). `lessonId` chỉ cần chuỗi khác rỗng: bài không có trong app vẫn hợp lệ (spec).
    `dailyStats[].date` dùng `localDateKeySchema` như DB (không refine ngày có thật) để file vừa xuất luôn nhập lại được.
  - Type: `ProgressSnapshot = { settings: Settings; lessonProgress: LessonProgress[]; dailyStats: DailyStat[] }`,
    `ProgressBackupFile = ProgressSnapshot & { format; formatVersion; exportedOn }`.
- **Một nguồn field** (sửa `progress.schema.ts`, refactor không đổi hành vi đọc DB):
  - Settings: `settingsFieldSchemas = { dailyGoalMinutes: dailyGoalMinutesSchema, hasCompletedOnboarding: z.boolean(),
    defaultAudioSpeed: audioSpeedSchema, isPinyinVisible: z.boolean() } satisfies { [K in keyof Settings]: z.ZodType<Settings[K]> }`
    → `Settings` (interface S8.2 giữ nguyên) thêm field mà quên schema là lỗi typecheck. `settingsStrictSchema =
    z.object(settingsFieldSchemas)`; `settingsSchema` (đọc DB) = mỗi field `settingsFieldSchemas.<k>.catch(DEFAULT_SETTINGS.<k>)`;
    cả hai `satisfies z.ZodType<Settings, z.ZodTypeDef, unknown>` (input `unknown` vì `.catch` nhận mọi đầu vào; `z.ZodType<Settings>`
    mặc định input = output nên bản khoan dung không thỏa) → thiếu field ở một trong hai là lỗi typecheck. `settingsFieldSchemas`,
    `settingsStrictSchema`, `lessonProgressStrictSchema`, `dailyStatStrictSchema` export qua `packages/shared/src/index.ts`.
  - `lessonProgressStrictSchema` (`cursor: z.number().int().min(0).optional()`); `lessonProgressSchema` =
    `lessonProgressStrictSchema.extend({ cursor: lessonProgressStrictSchema.shape.cursor.catch(undefined) })`.
  - `dailyStatStrictSchema` (`goalMinutes: dailyGoalMinutesSchema.optional()`: dòng ngày trước S8.3 không có field này vẫn hợp lệ,
    nhưng `goalMinutes: 45` là file hỏng); `dailyStatSchema` = `.extend({ goalMinutes: dailyStatStrictSchema.shape.goalMinutes
    .catch(undefined) })`.
- Tương thích (proposal, Open Questions "Cam kết tương thích"): bản sau thêm `progressBackupV2Schema`, phần mới `.default(…)`
  để file v1 vẫn nhập được; nhánh theo `formatVersion` ở `BackupService.checkBackupText`. Không có file cũ hơn v1, nên chưa có
  nhánh nâng cấp.
- Thay thế: (a) dùng lại `settingsSchema`/`dailyStatSchema` khoan dung → file có mục tiêu 45 thành 15 thay vì bị từ chối, sai
  spec. (b) `schemaVersion` = version Dexie → đổi index Dexie (không đổi dữ liệu) cũng làm file cũ "khác bản"; tách số phiên bản
  định dạng file khỏi DB.

### D3. `ProgressStore.exportAll` / `importAll` (`core/services/progress-store.service.ts`)

- Interface thêm (tên theo `docs/03-architecture.md` §6.3):
  - `exportAll(): Promise<ProgressSnapshot>` — `await this.studyTimeWrites` (như `getAllDailyStats`) rồi đọc ba bảng trong **một**
    transaction `'r'`. Dữ liệu đúng như app đang thấy: settings qua `parseSettings`, dòng `lessonProgress`/`dailyStats` qua
    `lessonProgressSchema`/`dailyStatSchema` (dòng hỏng bị bỏ, `goalMinutes` hỏng thành không có), nên file xuất luôn qua được
    schema chặt. Lỗi IndexedDB (mở DB, transaction, đọc bảng) → reject.
  - `importAll(snapshot: ProgressSnapshot): Promise<void>` — `return this.enqueueStudyTimeWrite(() => this.writeSnapshot(s))`
    (xếp hàng sau mọi lần ghi phút/mục tiêu đang chờ trong tab; lần đọc sau chờ được nó). `writeSnapshot` (private): một
    transaction `'rw'` trên `settings`, `lessonProgress`, `dailyStats`: `clear()` cả ba, `bulkPut` dòng settings
    (`Object.entries` như `saveSettings`), `bulkPut` tiến độ bài, `bulkPut` thống kê ngày (giữ nguyên `goalMinutes` của từng ngày).
    Bất kỳ bước nào lỗi → Dexie abort → dữ liệu cũ còn nguyên (spec "Ghi lỗi giữa chừng"). Không gộp: dòng máy đích không có
    trong file bị xoá ("Ghi đè xóa số phút học mà file không có").
- Thêm bảng sau này (E9 `cards`, `reviewLogs`) phải thêm vào cả hai method và vào schema file (hợp đồng ở proposal,
  Dependencies). Ghi chú này vào JSDoc của interface.
- File ước ~235 dòng (< 300). Năm object `ProgressStore` viết tay (Context) thêm stub hai method trong cùng commit RED đầu tiên
  đụng interface (tasks 3.1).

### D4. `BackupService` (`shared/services/backup.service.ts`, mới)

`constructor(store: ProgressStore = progressStore, content: ContentSource = contentSource, saver: FileSaver = fileSaver)`.

- **Phần 1 — Truy cập dữ liệu** (private): `readSnapshot()` → `store.exportAll()`; `writeSnapshot(s)` → `store.importAll(s)`;
  `readKnownLessonIds()` → `content.getContentRoot()` + `listLessonIdsInOrder(root.stages)` → `Set`; `saveFile(name, text)` →
  `saver.save(name, text, 'application/json')`.
- **Phần 2 — Quy tắc** (public, pure, mỗi method có `Rule:`):
  - `buildBackupFileName(now: number): string` → `tranie-tien-do-${toLocalDateKey(now)}.json`.
  - `buildBackupFile(snapshot, now): ProgressBackupFile` (gắn `format`, `formatVersion`, `exportedOn`), `serializeBackupFile`
    (`JSON.stringify(file, null, 2)`: người học mở bằng trình soạn thảo đọc được).
  - `isBackupFileTooLarge(bytes: number): boolean` → `bytes > MAX_BACKUP_FILE_BYTES` (`20_000_000`,
    `core/constants/backup.constants.ts`). Chọn 20 × 10⁶ byte: file mà máy hiện "lớn hơn 20 MB" theo cả đơn vị thập phân
    (macOS) lẫn nhị phân (Windows) đều vượt ngưỡng này; file đúng 20 000 000 byte vẫn được đọc.
  - `checkBackupText(text: string): BackupCheck` — phân loại theo thứ tự, trả union có tên, không throw:
    | Bước | Điều kiện | Kết quả |
    |---|---|---|
    | 1 | `text.trim() === ''` hoặc `JSON.parse` lỗi | `{ status: 'rejected', reason: 'not-backup' }` |
    | 2 | Không qua `progressBackupEnvelopeSchema` (thiếu/sai `format`, `formatVersion` không phải số) | `not-backup` |
    | 3 | `formatVersion > PROGRESS_BACKUP_FORMAT_VERSION` | `newer-version` |
    | 4 | Không qua `progressBackupV1Schema` (kể cả `formatVersion` < 1 hoặc không nguyên) | `corrupted` |
    | 5 | Hợp lệ | `{ status: 'valid', file }` |
  - `countCompletedLessons(lessonProgress, knownLessonIds): number` — đếm dòng `completed` có `lessonId` trong nội dung app
    (bài vượt cấp đã là `completed`, xem Context; bài lạ không đếm).
- **Phần 3 — Use case**:
  - `exportProgress(now = Date.now()): Promise<void>` — `readSnapshot` → `buildBackupFile` → `serializeBackupFile` →
    `saveFile`. Đọc lỗi thì throw `Error('Không đọc được tiến độ để xuất.', { cause })` **trước** `saveFile` (không có file nào
    được lưu).
    Không ghi gì vào store (spec "Xuất không làm đổi tiến độ").
  - `inspectImportFile(file: BackupFileSource): Promise<ImportInspection>` với `BackupFileSource = { size: number; text():
    Promise<string> }` (`File` thỏa mãn; test truyền object thường). Quá lớn → `rejected/not-backup` **không** gọi `text()`;
    `text()` reject → `rejected/not-backup` (không throw); rồi `checkBackupText`; hợp lệ thì `readKnownLessonIds` +
    `countCompletedLessons` →
    `{ status: 'valid', snapshot, preview: { exportedOn, completedLessonCount } }`. Không ghi gì (spec "tiến độ trên máy chưa đổi
    khi hộp đang mở"). **Nạp nội dung app lỗi** (`readKnownLessonIds` reject) → throw `Error('Không đọc được nội dung app để đếm
    bài đã xong.', { cause })`; hook báo `importFailed` và không mở hộp (quyết định của dev, Open Questions).
  - `importProgress(snapshot): Promise<void>` → `writeSnapshot(snapshot)`; `importAll` reject thì throw
    `Error('Không ghi được tiến độ đã nhập.', { cause })` (giống phía xuất), hook báo `importFailed`.
- Type kết quả (`BackupCheck`, `ImportInspection`, `ImportPreview`, `BackupRejectReason = 'not-backup' | 'corrupted' |
  'newer-version'`, `BackupFileSource`) ở `shared/models/progress-backup.model.ts`.
- `MAX_BACKUP_FILE_BYTES` và `REVOKE_OBJECT_URL_DELAY_MS` (D5) cùng ở `core/constants/backup.constants.ts`.
- Thay thế: (a) để `ProgressService` làm luôn → file đã 260 dòng, và §1 có ô "backup" riêng. (b) Đọc file (`file.text()`) trong
  hook → hook biết luật 20 MB và thứ tự kiểm tra; giữ trong service để test không cần React.

### D5. Lưu file xuống máy: `FileSaver` (`core/services/file-saver.service.ts`, mới)

- `interface FileSaver { save(fileName: string, content: string, mimeType: string): void }`; `AnchorFileSaver`: `Blob` →
  `URL.createObjectURL` → `<a download={fileName}>` gắn vào `document.body`, `click()`, gỡ thẻ, `revokeObjectURL` sau
  `setTimeout(…, REVOKE_OBJECT_URL_DELAY_MS)` (= 40 000 ms, `core/constants/backup.constants.ts`): Safari iOS, Chrome Android đọc
  blob bất đồng bộ sau `click()`, thu hồi ngay (`0`) có thể làm file tải về rỗng hoặc hỏng (finding minor của dev-lead, đã duyệt).
  Test chạy timer giả: chưa thu hồi ở `REVOKE_OBJECT_URL_DELAY_MS - 1`, thu hồi ở mốc đó. Đồng bộ, không chờ người học lưu (spec "Báo đã xuất khi file đã đưa cho trình duyệt"): `save` trả về là
  hook báo "Đã xuất tiến độ."; hủy hộp lưu sau đó app không biết và không báo gì. Singleton `fileSaver`.
- Đặt ở `core/services` vì là adapter trình duyệt có tác dụng phụ, không có luật nghiệp vụ (proposal, Layer đích); service
  `shared` gọi qua interface nên test thay bằng fake.
- Thay thế: Web Share API / File System Access API → không có ở mọi trình duyệt mục tiêu, cần nhánh dự phòng; anchor `download`
  chạy được trên Chrome Android và Safari iOS ≥ 13 (iOS hiện bảng lưu/chia sẻ, TC-S8.5-AC1-7, -9 kiểm tay).

### D6. Hook `useProgressBackup` (`pages/settings/hooks/useProgressBackup.ts`, mới) + `useSettings.reloadPreferences`

- `useProgressBackup(onImported: () => void): ProgressBackupView` — `BackupService` qua `useMemo`. Trả:
  - `phase: ProgressBackupPhase` (`'idle' | 'exporting' | 'checking' | 'confirming' | 'importing'`), `preview: ImportPreview | null`,
    `message: BackupMessage | null` với `BackupMessage = { tone: 'success' | 'error'; key: BackupMessageKey }`,
    `BackupMessageKey = 'exported' | 'exportFailed' | 'notBackup' | 'corrupted' | 'newerVersion' | 'imported' | 'importFailed'`.
  - Handler: `exportProgress()`, `selectFile(file: File | undefined)`, `confirmImport()`, `cancelImport()`.
  - Type `ProgressBackupView`, `ProgressBackupPhase`, `BackupMessage`, `BackupMessageKey` ở `shared/models/progress-backup.model.ts`.
  - Map lý do từ chối → khóa thông báo: hằng `REJECT_MESSAGE_KEYS: Record<BackupRejectReason, BackupMessageKey>` trong hook.
- Luồng: mỗi thao tác mới xoá `message` cũ; đang ở pha khác `idle` thì bỏ qua lần bấm (không double-submit, không `disabled`
  để nút vẫn giữ focus). Pha đọc đồng bộ qua `phaseRef` (đổi cùng lúc với state qua `changePhase`) để chặn lần bấm lặp trước khi
  state kịp render; `cancelImport`/`confirmImport` chỉ chạy ở pha `confirming`. `selectFile(undefined)` (đóng hộp chọn file) → không đổi gì. `rejected` → message lỗi theo `reason`,
  không mở hộp. `inspectImportFile` throw (nạp nội dung lỗi) → `importFailed`, không mở hộp. `valid` → `phase: 'confirming'`, giữ
  `snapshot` trong `useRef` (không render), `preview` trong state. `cancelImport` → xoá snapshot/preview, `idle`, không message.
  `confirmImport` → xoá preview (hộp đóng) → `importing` → thành công: message `imported`, gọi `onImported()` (khi còn mount); lỗi:
  `importFailed`. Export: thành công `exported`, lỗi `exportFailed`. Mọi promise kiểm `isActiveRef` (effect cleanup) trước khi
  `setState`.
- **`useSettings` thêm `reloadPreferences: () => void`** (S8.2 chưa có hàm nạp lại): state `loadId` (số), effect nạp
  `getLearningPreferences()` phụ thuộc `[service, loadId]`; `reloadPreferences = useCallback(() => setLoadId((n) => n + 1), [])`
  (tham chiếu ổn định, nên `useProgressBackup` nhận nó làm `onImported` mà `confirmImport` không đổi mỗi render; effect cleanup
  `isActive` như hiện có; không thêm effect đồng bộ state). Nạp xong ghi `persistedRef` và `preferences`. Không đổi hành vi hiện có
  của S8.2 (test S8.2 cũ vẫn pass).
- `SettingsContainer` gọi `useProgressBackup(reloadPreferences)`. Trang chủ, Lộ trình, màn bài học đọc lại khi mount nên không cần
  làm gì (spec "Màn khác hiện tiến độ mới không cần tải lại"; Context: không có context cấp app).
- Tính năng nằm trong feature `settings` (spec: mục trong màn Cài đặt), không tạo feature `pages/backup/`.

### D7. Component trong màn Cài đặt

- `pages/settings/components/ProgressBackupSection.tsx` — prop duy nhất `backup: ProgressBackupView` (gom state + handler, giữ
  < 5 props). `<section aria-labelledby>` (role `region`) tiêu đề "Sao lưu tiến độ" (`h2`); hai `<button type="button">`
  "Xuất tiến độ", "Nhập tiến độ" (Enter/Space mặc định của button); `<input type="file" hidden>` qua `ref`, nút Nhập gọi
  `input.click()`; `onChange` lấy `files?.[0]` rồi đặt `value = ''` (chọn lại cùng file vẫn có `change`). **Không** đặt `accept`:
  Android hay báo file `.json` là `application/octet-stream` nên `accept` làm ẩn chính file sao lưu, và người học vẫn phải chọn
  được file ảnh để thấy thông báo lỗi (TC-S8.5-AC2-1).
  - Hai vùng thông báo luôn có trong DOM **bên trong section**: `<p role="status">` (thành công) và `<p role="alert">` (lỗi), chữ
    đổi theo `message` (spec "Thông báo … được trình đọc màn hình đọc"). Test truy vấn trong `region` "Sao lưu tiến độ" để không lẫn
    với `role="alert"` lỗi lưu cài đặt của S8.2. Lỗi có class `.backup-message.has-error` và tiền tố chữ "Lỗi:" (i18n
    `backup.errorPrefix`, ghép `"{prefix} {thông báo}"`; không chỉ dựa vào màu, TC-S8.5-AC2-12).
  - Vì vùng `role="alert"` của mục sao lưu **luôn có trong DOM**, các test S8.2 cũ đếm/tìm `alert` trên cả màn đã được giới hạn ra
    ngoài region "Sao lưu tiến độ" (xem D10), không đổi hành vi S8.2.
  - Focus trả về nút "Nhập tiến độ" (ref) khi hộp xác nhận đóng (Hủy, Esc, Ghi đè): `useEffect` theo `isDialogOpen` (`phase ===
    'confirming' && preview !== null`) với `wasDialogOpenRef`, chuyển từ mở sang đóng thì `focus()`.
- `pages/settings/components/ImportConfirmDialog.tsx` — props `preview`, `onConfirm`, `onCancel`. Tự làm, **không** dùng
  `<dialog>.showModal()` (jsdom không có, nên không test được focus ở Vitest): `<div role="dialog" aria-modal="true"
  aria-labelledby aria-describedby>` trên lớp phủ; `useEffect` focus nút "Hủy" lúc mở; `onKeyDown`: `Escape` → `onCancel`, `Tab`/
  `Shift+Tab` ở nút cuối/đầu thì vòng lại (chỉ hai nút "Hủy", "Ghi đè"; "Hủy" đứng trước "Ghi đè" trong DOM). Nội dung: tiêu đề "Nhập tiến độ từ file?" (quyết định của
  dev, Open Questions), "File xuất ngày {{date}}, có {{count}} bài đã xong.", câu cảnh báo nguyên văn spec. Ngày hiện `dd/mm/yyyy`
  bằng `formatLocalDateKey` mới ở `shared/utils/date.utils.ts` (tách chuỗi khóa ngày, không qua `Date` để không lệch múi giờ).
  - Nằm ở `pages/settings/components/` vì `shared/components/` chưa có hộp xác nhận dùng chung (proposal, Layer đích). Story sau
    cần thì nâng lên `shared/components/`.
- `SettingsContainer`: render `<ProgressBackupSection backup={…} />` cuối `<main>`, **ngoài** nhánh `preferences === null` (mục sao
  lưu không phụ thuộc việc nạp tùy chọn xong). File vẫn < 100 dòng.
- Style: `apps/web/src/styles/tailwind/components/_progress-backup.css` (BEM `.backup-section`, `.backup-section-title`,
  `.backup-message` + `.has-error`, `.confirm-dialog-overlay`, `.confirm-dialog`, `.confirm-dialog-title`,
  `.confirm-dialog-warning`; hàng nút của hộp chỉ dùng class layout, không có class BEM riêng), import trong `main.css` cạnh
  `_settings.css`; JSX chỉ layout/spacing (`CLAUDE.md` §6). Lớp phủ `fixed inset-0 z-50` trong CSS; hộp trên mobile: `max-h-full` +
  `overflow-y-auto` trong hộp (TC-S8.5-AC3-3). Màu chữ/nền/viền theo token sáng/tối (`bg-surface`, `border-line`, `text-fg`,
  `text-danger-text`); riêng lớp phủ dùng token mới `bg-scrim` (`--csk-scrim`, sáng/tối, thêm vào design system §3).
- i18n: thêm vào `assets/i18n/vi/settings.json` nhóm `backup.*`: `title`, `export`, `import`, `errorPrefix` ("Lỗi:"),
  `messages.<BackupMessageKey>` (`messages.exported`, `exportFailed`, `notBackup`, `corrupted`, `newerVersion`, `imported`,
  `importFailed`; component tra khóa `backup.messages.<key>` theo `message.key`), `confirm.title`, `confirm.summary`, `confirm.warning`,
  `confirm.overwrite` ("Ghi đè"), `confirm.cancel` ("Hủy"). Chuỗi thông báo chép nguyên văn spec;
  `exportFailed` = "Không xuất được tiến độ. Hãy thử lại." (spec "Không đọc được tiến độ thì báo lỗi").

### D8. Kiểm tra `import` (Dependency Rule `CLAUDE.md` §2)

| File | Import | Nhánh |
|---|---|---|
| `progress-backup.schema.ts` | `zod`, `./progress.schema` | ✅ package shared |
| `backup.service.ts` | `@csk/shared`, `@core/services/progress-store.service`, `content-source.service`, `file-saver.service`, `@core/constants/backup.constants`, `@shared/utils/*`, `@shared/models/*` | ✅ shared/services → core/services, utils, models; không React, không Dexie |
| `progress-store.service.ts` | `@csk/shared`, `@core/helpers/db.helper` | ✅ core, không import shared/services |
| `file-saver.service.ts` | DOM API, `@core/constants/backup.constants` | ✅ không React |
| `useProgressBackup.ts`, `useSettings.ts` | `react`, `@csk/shared` (type), `@shared/services/*`, `@shared/models/*` | ✅ hook → shared/services |
| `ProgressBackupSection.tsx`, `ImportConfirmDialog.tsx` | `react`, `react-i18next`, `@shared/models/*`, `@shared/utils/date.utils`, component cùng feature | ✅ không import service |
| `SettingsContainer.tsx` | `../hooks/useProgressBackup`, `../hooks/useSettings`, `../components/*` | ✅ container → hook |

### D9. Dữ liệu ngoài cần Zod

| Nguồn | Schema | Ở đâu |
|---|---|---|
| File người học chọn | `progressBackupEnvelopeSchema`, `progressBackupV1Schema` (chặt) | `BackupService.checkBackupText` |
| IndexedDB lúc xuất | `parseSettings`, `lessonProgressSchema`, `dailyStatSchema` (khoan dung, có sẵn) | `DexieProgressStore.exportAll` |
| `content.json` (đếm bài) | `ContentSource` đã validate | có sẵn |

### D10. Test

- Tầng (spec-driven §4): schema → `packages/shared/src/progress-backup.schema.test.ts`; store →
  `core/services/progress-store.backup.test.ts` (DB tên ngẫu nhiên, mẫu `progress-store.daily-goal.test.ts`); `FileSaver` →
  `core/services/file-saver.service.test.ts` (stub `URL.createObjectURL`/`revokeObjectURL` vì jsdom không có); Phần 2 →
  `shared/services/backup.service.test.ts` (pure); Phần 3 → `shared/services/backup.service.export.test.ts`,
  `backup.service.import.test.ts` (`DexieProgressStore` thật trên hai DB tên ngẫu nhiên = máy A, máy B; `ContentSource` fake;
  `FileSaver` fake ghi nhận lần gọi; kiểm Trang chủ/streak bằng `new ProgressService(storeB).getTodayStudy(now)` /
  `getStudyStreak(now)`; dựng chung ở helper `apps/web/src/test/backup-machine.helpers.ts`: `ROOT` lộ trình 4 chủ đề,
  `createMachine()` → `Machine` (store Dexie DB ngẫu nhiên + `BackupService` + fake saver ghi `SavedFile`), `NOW`,
  `toBackupFileSource(content)`); UI → `pages/settings/containers/SettingsContainer.backup*.test.tsx` (`renderWithProviders` route
  `/settings` hoặc `openRoute` khi cần sang màn khác; `beforeEach` xoá **cả ba** bảng, khác `clearDatabase` của S8.2;
  `vi.spyOn(fileSaver, 'save')` — ranh giới trình duyệt; file chọn bằng `userEvent.upload` với `new File([...])`; lỗi xuất/ghi
  đè bằng `vi.spyOn(DexieProgressStore.prototype, 'exportAll' | 'importAll')`, lỗi nạp nội dung bằng
  `vi.spyOn(contentSource, 'getContentRoot')`); e2e → `apps/web/e2e/E8/s8.5-*.spec.ts`.
- **Test S8.2 cũ và vùng alert luôn có sẵn** (D7): mục sao lưu luôn render một `role="alert"` (rỗng khi không có lỗi), nên truy
  vấn `alert` toàn màn của S8.2 bị lẫn. Đã giới hạn ra ngoài region "Sao lưu tiến độ" (không lọc theo chữ):
  - Unit: helper `apps/web/src/test/settings-alert.helpers.ts` (`queryAllSettingsAlerts`, `querySettingsAlert`,
    `getSettingsAlert`, `findSettingsAlert`), dùng trong `SettingsContainer.errors.test.tsx`, `SettingsContainer.corrupt.test.tsx`.
  - E2E: `alertsOutsideBackup(page)` trong `apps/web/e2e/E8/settings.helpers.ts` (xpath loại alert có tổ tiên mang
    `aria-label`/`aria-labelledby` của region); `saveErrorAlert` dùng nó; `s8.2-settings-errors.spec.ts` đổi
    `page.getByRole('alert')` → `alertsOutsideBackup(page)`.
- **File mẫu** (test-cases: "đường dẫn ghi trong design.md"): `apps/web/e2e/E8/fixtures/progress-backup/`. Mọi file hợp lệ có
  đủ bốn field `settings` (`dailyGoalMinutes`, `hasCompletedOnboarding: true`, `defaultAudioSpeed: "normal"`,
  `isPinyinVisible: true`):
  `hop-le-5-bai.json` (xuất 2026-11-17, `intro-01`…`intro-05` completed, mục tiêu 15), `hop-le-3-bai-15-phut.json`
  (`intro-01`…`03`, mục tiêu 15, `dailyStats: []`), `bai-la.json` (`intro-01` + `khong-co-bai-nay` completed),
  `trang-thai-sai.json` (`intro-02`, `03` completed, `intro-04` `status: "skipped"`), `muc-tieu-45.json` (`dailyGoalMinutes: 45`),
  `rong.json` (0 byte), `json-noi-khac.json` (`{"name":"abc"}`), `ban-moi-hon.json` (`formatVersion: 2`), `anh.png` (PNG 1×1).
  `vuot-cap` và file > 20 MB không commit: e2e tạo trong test (test-cases). Test Vitest `backup.service.fixtures.test.ts` chạy
  `checkBackupText` trên từng file mẫu để file mẫu không lệch khỏi schema khi schema đổi.
- **Nạp tiến độ cho e2e**: `seedProgress` (`home.helpers.ts`) — ghi `settings`, `lessonProgress`, `dailyStats` thô (dòng ngày
  có `goalMinutes` qua `reachedDay`/`studiedDay` của `streak.helpers.ts`). Trạng thái vượt cấp: helper `serveBackupPath(page)` trong
  `e2e/E8/backup.helpers.ts` thay `content.json` (mẫu `serveMultiUnitPath`) bằng lộ trình 4 chủ đề A (`intro-01`,`02`), B
  (`03`,`04`), C (`05`,`06`, bài cuối đổi `type: 'test'`), D (`07`,`08`); máy A `seedProgress` bài 1 + `intro-05`, `06` completed
  (k = 3, N = 2; B khóa, bài đầu D mở); cả hai máy dùng cùng helper.
- **Hai máy**: hai `browser.newContext({ timezoneId: TIMEZONE })` (IndexedDB tách biệt). Xuất: `page.waitForEvent('download')` →
  `suggestedFilename()`, `download.path()` đọc nội dung; nhập: `page.locator('input[type=file]').setInputFiles(path | { name,
  mimeType, buffer })`. Ngày: `page.clock.install({ time: new Date('2026-11-17T10:00:00+07:00') })` cho case tên file; case streak
  dùng `NOW`/`dayKey` của S8.3.
- **Giả lập lỗi đọc/ghi** (test-cases: cách nằm hoàn toàn trong test e2e, bản build không có công tắc). Theo mẫu guard
  `IDBObjectStore.prototype` + cờ `sessionStorage` của `settings.helpers.ts` (bọc ở mức object store vì Dexie có thể dùng
  transaction mở sẵn):
  - Đọc lỗi (TC-S8.5-AC1-13): sau khi màn Cài đặt hiện, gọi `breakSettingsReads(page)` có sẵn → `exportAll` đọc bảng `settings`
    lỗi → reject.
  - Ghi lỗi giữa chừng (TC-S8.5-AC3-13): helper mới `breakLessonProgressWrites(page)` trong `backup.helpers.ts` (cùng mẫu guard,
    bảng `lessonProgress`, method `put`/`add`), bật khi hộp xác nhận đang mở → transaction đã `clear()` ba bảng và ghi settings thì
    abort; kiểm dữ liệu cũ còn.
  - Tầng store: `vi.spyOn(db.lessonProgress, 'bulkPut').mockRejectedValueOnce(…)` trong `importAll`.
- **Offline** (mẫu `e2e/E1/s1.2-offline.spec.ts`, `s8.3-streak-offline.spec.ts`): `openOnceWithServiceWorker` (bản riêng trong
  `backup.helpers.ts`) → `context.setOffline(true)` → mở màn Cài đặt.
- Helper e2e thực tế ở `apps/web/e2e/E8/backup.helpers.ts`: hằng chuỗi UI (`BACKUP_SECTION_TITLE`, thông báo, `CONFIRM_WARNING`…),
  `fixturePath`, `backupFileName`, `backupSection`, `exportButton`, `importButton`, `backupStatus`, `backupAlert`,
  `importConfirmDialog`, `overwriteButton`, `cancelButton`, `importFile`, `exportProgress`, `openOnceWithServiceWorker`,
  `readDownloadText`, `expectInLiveRegion`, `serveBackupPath`, `breakLessonProgressWrites`. Đồng hồ: phần lớn case dùng `NOW` của
  `home.helpers.ts`; case tên file (`s8.5-export.spec.ts`) dùng mốc 2026-11-17.

## Risks / Trade-offs

- [Thêm `reloadPreferences` vào hook của S8.2] → thay đổi nhỏ, có test riêng (tasks 7.19); test S8.2 cũ phải vẫn pass.
- [Tab khác đang mở ghi đè lại dữ liệu cũ sau khi nhập] → proposal đã đưa vào Không làm; không xử lý.
- [Màn bài học đang mở ở tab này khi nhập] → không xảy ra: mục sao lưu chỉ ở màn Cài đặt, màn bài đã unmount (phần thời gian cuối
  ghi qua hàng đợi, `importAll` xếp sau nó).
- [File lớn gần 20 MB làm `JSON.parse` chậm trên điện thoại yếu] → chấp nhận; tiến độ thật chỉ vài trăm KB.
- [Hộp xác nhận tự làm, không `inert` phần nền] → bẫy Tab bằng `onKeyDown` + `aria-modal`; trình đọc màn hình vẫn có thể đi
  ra nền bằng phím riêng của nó. Chấp nhận cho hộp hai nút; nâng lên `<dialog>` khi môi trường test hỗ trợ.
- [`exportAll` bỏ dòng hỏng] → file xuất không mang theo dòng hỏng; khớp những gì người học đang thấy trên màn, không mất gì
  người học nhìn thấy được.
- [Thêm method vào `ProgressStore` làm hỏng typecheck 5 test viết tay] → stub trong commit RED đầu tiên (tasks 3.1).

## Migration Plan

- Không đổi version Dexie (vẫn 3), không nâng dữ liệu. Định dạng file bắt đầu ở `formatVersion: 1`.
- Rollback: revert PR code; file đã xuất vẫn là JSON đọc được, bản sau nhập lại được.
- PR code cập nhật `docs/03-architecture.md` §4 (`backup.service`), §6.3 (`exportAll`/`importAll`, `ProgressSnapshot`,
  `FileSaver`), §8 (`formatVersion` thay `schemaVersion`), và mô tả PR ghi đường dẫn file mẫu cho QA.

## Open Questions

Hai điểm spec không nêu; dev đã chọn mặc định dưới đây và code theo đó. **Quyết định của dev, chờ người thật xác nhận** (đổi chữ
hoặc đổi nhánh không đổi cấu trúc):

- [x] Tiêu đề hộp xác nhận → "Nhập tiến độ từ file?" (`backup.confirm.title`).
- [x] Nạp nội dung app (`content.json`) lỗi lúc đếm bài cho hộp xác nhận → báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ
  nguyên." (`importFailed`, `role="alert"`) và không mở hộp, không ghi gì (D4, D6; nội dung được precache nên gần như không xảy
  ra). Có kiểm trong tasks 7.7.
