# Tasks: S8.5 Export / Import tiến độ

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S8.5-AC2 File rỗng bị từ chối`). Tên file, hàm, field, route: design D1–D10.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại (như S8.1).
RED cần type/method chưa có thì tạo skeleton không có hành vi trong cùng commit `test(...)` (typecheck sạch, test fail ở assertion).

Vitest: `pnpm --filter @csk/web test:run <mẫu>` (`pnpm --filter @csk/shared test:run <mẫu>` cho schema). E2E:
`pnpm e2e -- e2e/E8/s8.5-<…>.spec.ts`. Tên thật của S8.2/S8.3 (route, hook, field, use case streak): bảng ở design D1.

## 1. Kiểm điều kiện và file mẫu (design D1, D10)

- [x] 1.1 Kiểm điều kiện đã thoả (không chặn): nhánh `feat/s8-5-progress-backup` cắt từ `main` ≥ `8a88004` có merge PR code S8.2 (#136) và S8.3 (#138); `grep` thấy đủ tên ở bảng design D1 (`ROUTE_PATHS.settings`, `SettingsContainer`, `useSettings`, `Settings.defaultAudioSpeed`/`isPinyinVisible`, `dailyStatSchema.goalMinutes`, `ProgressService.getStudyStreak`, `ProgressStore.getAllDailyStats`/`saveDailyGoal`, Dexie version 3); lệch thì dừng, báo điều phối; kiểm: `git log --oneline main | grep -E '#136|#138'` có hai dòng
- [x] 1.2 File mẫu ở `apps/web/e2e/E8/fixtures/progress-backup/` (asset thuần, miễn test-first; được kiểm ở 2.13): `hop-le-5-bai.json`, `hop-le-3-bai-15-phut.json`, `bai-la.json`, `trang-thai-sai.json`, `muc-tieu-45.json`, `rong.json` (0 byte), `json-noi-khac.json`, `ban-moi-hon.json`, `anh.png` theo nội dung design D10 (file hợp lệ có đủ 4 field `settings`, dòng `dailyStats` có `goalMinutes`); kiểm: `ls` đủ 9 file, `rong.json` 0 byte

## 2. Kiểm tra file nhập — `@csk/shared` schema + `BackupService.checkBackupText` (design D2, D4)

Test: `packages/shared/src/progress-backup.schema.test.ts` (schema), `apps/web/src/app/shared/services/backup.service.test.ts`
(Phần 2, pure, không store).

- [x] 2.1 RED: S8.5-AC2 "File không phải JSON bị từ chối" (Phần 2) — `checkBackupText` với `'abc'`, `'{'`, chuỗi byte PNG đọc thành text → `{ status: 'rejected', reason: 'not-backup' }`. Skeleton trong commit test: `backup.service.ts` (class rỗng 3 banner, `checkBackupText` trả `{ status: 'valid' … }` giả), `shared/models/progress-backup.model.ts` (type `BackupCheck`, `BackupRejectReason`, `ImportPreview`, `ImportInspection`); kiểm: fail ở assertion
- [x] 2.2 GREEN: bước 1 bảng D4 (`JSON.parse` trong `try`, lỗi → `not-backup`); kiểm: test 2.1 pass
- [x] 2.3 RED: S8.5-AC2 "File rỗng bị từ chối" (Phần 2) — `''`, `'   \n'` → `not-backup`; kiểm: chạy, nếu pass ngay nhờ 2.2 (`JSON.parse('')` throw) thì tạm cho chuỗi rỗng trả `valid` để thấy fail rồi trả lại
- [x] 2.4 GREEN: kiểm `text.trim() === ''` trước `JSON.parse`; kiểm: test 2.3 pass
- [x] 2.5 RED: S8.5-AC2 "File JSON của nơi khác bị từ chối" (schema + Phần 2) — `progressBackupEnvelopeSchema` từ chối `{"name":"abc"}`, `[]`, `null`, `42`, `format` sai chữ, thiếu `formatVersion`; `checkBackupText` của các chuỗi đó → `not-backup`. Skeleton: hằng `PROGRESS_BACKUP_FORMAT`, `PROGRESS_BACKUP_FORMAT_VERSION`, schema envelope `z.unknown()`, export từ `packages/shared/src/index.ts`; kiểm: fail
- [x] 2.6 GREEN: `progressBackupEnvelopeSchema` (D2), bước 2 bảng D4; kiểm: test 2.5 pass
- [x] 2.7 RED: S8.5-AC2 "File từ phiên bản app mới hơn bị từ chối" (Phần 2) — `{ format, formatVersion: 2, settings: "rác" }` → `newer-version` (không phải `corrupted`); `formatVersion: 1` thân rác → không phải `newer-version`; kiểm: fail
- [x] 2.8 GREEN: bước 3 bảng D4; kiểm: test 2.7 pass
- [x] 2.9 RED: S8.5-AC2 "File có một phần dữ liệu sai bị từ chối cả file" (schema + Phần 2) — `progressBackupV1Schema`: `intro-02`, `intro-03` completed hợp lệ + `intro-04` `status: 'skipped'` → lỗi; thêm `cursor: -1`, `studySeconds: -5`, `goalMinutes: 45` trong `dailyStats`, `defaultAudioSpeed: 'fast'`, thiếu `isPinyinVisible`, trùng `lessonId`, trùng `date`, `exportedOn: '2026-13-45'`, thiếu `settings` → lỗi; file v1 đủ hợp lệ (cả `lessonId` lạ, dòng `dailyStats` không có `goalMinutes`) → qua; `checkBackupText` file có `intro-04` sai → `corrupted`. Skeleton: `progressBackupV1Schema` = `z.object({}).passthrough()`; kiểm: fail
- [x] 2.10 GREEN: `progressBackupV1Schema` chặt, `ProgressSnapshot`, `ProgressBackupFile`; refactor `progress.schema.ts` (D2): `settingsFieldSchemas` (4 field, `satisfies` theo `Settings`) → `settingsStrictSchema` + `settingsSchema` khoan dung dựng từ cùng nguồn, `lessonProgressStrictSchema` + `lessonProgressSchema` (`.extend` `cursor` `.catch`), `dailyStatStrictSchema` + `dailyStatSchema` (`.extend` `goalMinutes` `.catch`); bước 4–5 bảng D4; kiểm: test 2.9 pass, test schema cũ trong `packages/shared` và `progress-store.*.test.ts` vẫn pass (refactor không đổi hành vi đọc DB), `pnpm typecheck` sạch
- [x] 2.11 RED: S8.5-AC2 "File có mục tiêu phút không hợp lệ bị từ chối" (schema + Phần 2) — file v1 có `dailyGoalMinutes: 45` → `checkBackupText` `corrupted`; đồng thời `parseSettings({ dailyGoalMinutes: 45 })` vẫn ra 15 (đọc DB vẫn khoan dung); kiểm: chạy, nếu pass ngay nhờ 2.10 thì tạm thêm `.catch(15)` vào field mục tiêu của bản strict để thấy fail rồi trả lại
- [x] 2.12 GREEN: sửa đến khi pass; kiểm: test 2.11 pass — GREEN không đổi code: 2.10 đã đáp ứng, RED 2.11 chứng minh bằng tạm đảo `.catch(15)`
- [x] 2.13 Test bảo vệ file mẫu (kiểm asset 1.2, không phải Scenario mới): `apps/web/src/app/shared/services/backup.service.fixtures.test.ts` đọc từng file ở `e2e/E8/fixtures/progress-backup/` bằng `node:fs`, `checkBackupText` → `hop-le-*`, `bai-la` `valid`; `trang-thai-sai`, `muc-tieu-45` `corrupted`; `rong`, `json-noi-khac`, `anh.png` `not-backup`; `ban-moi-hon` `newer-version`; kiểm: test pass

## 3. Đọc/ghi toàn bộ — `ProgressStore.exportAll` / `importAll` (design D3)

Test: `apps/web/src/app/core/services/progress-store.backup.test.ts` (DB tên ngẫu nhiên, mẫu `progress-store.daily-goal.test.ts`).

- [x] 3.1 RED: S8.5-AC3 "Ghi đè xóa số phút học mà file không có" (store) — DB có `intro-01`…`06` completed, mục tiêu 60, `dailyStats` hôm nay `{ studySeconds: 1200, goalMinutes: 60 }`; `importAll({ settings: mục tiêu 15 + 3 field còn lại, lessonProgress: 01–03 completed, dailyStats: [] })` → `getDailyStat(hôm nay)` `undefined`, `getAllDailyStats()` rỗng, `getAllLessonProgress` đúng 3 dòng, `getSettings().dailyGoalMinutes` 15. Skeleton: thêm `exportAll`, `importAll` vào interface (JSDoc hợp đồng bảng mới, D3), `DexieProgressStore` no-op / snapshot rỗng; cùng commit thêm stub hai method vào 5 object `ProgressStore` viết tay (`progress.service.test.ts:16`, `progress.service.study-time.test.ts:17`, `progress.service.streak-flow.test.ts:19`, `lesson.service.test.ts:383`, `:742`; rà `grep -rn ': ProgressStore = {' apps/web/src`); kiểm: `pnpm typecheck` sạch, fail ở assertion
- [x] 3.2 GREEN: `importAll` — qua `enqueueStudyTimeWrite` có sẵn, private `writeSnapshot`: transaction `'rw'` ba bảng, `clear()` cả ba rồi `bulkPut` (giữ `goalMinutes` từng ngày); kiểm: test 3.1 pass, test `progress-store.daily-goal`/`daily-stats` cũ vẫn pass
- [x] 3.3 RED: S8.5-AC3 "Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ" (store) — DB có `intro-01` completed, mục tiêu 30, một dòng `dailyStats`; `vi.spyOn(db.lessonProgress, 'bulkPut').mockRejectedValueOnce(new Error('ghi lỗi'))`; `importAll(file 5 bài, mục tiêu 15)` reject; sau đó settings mục tiêu 30, chỉ `intro-01`, dòng `dailyStats` còn nguyên; kiểm: chạy, nếu pass ngay nhờ 3.2 thì tạm tách `clear()` ra ngoài transaction để thấy fail rồi trả lại
- [x] 3.4 GREEN: sửa đến khi pass (mọi bước trong một transaction); kiểm: test 3.3 pass — GREEN không đổi code: 3.2 đã đáp ứng, RED 3.3 chứng minh bằng tạm tách `clear()`
- [x] 3.5 RED: S8.5-AC1 "Xuất không làm đổi tiến độ" (store) — DB có `intro-01` completed, `intro-02` in-progress `cursor: 2`, settings đủ 4 field (`defaultAudioSpeed: 'slow'`, `isPinyinVisible: false`), hai dòng `dailyStats` (một có `goalMinutes: 15`, một không có) + một dòng `lessonProgress` hỏng; `exportAll()` trả đúng dữ liệu hợp lệ (dòng hỏng bị bỏ, `goalMinutes` giữ nguyên); đọc thô ba bảng trước/sau `exportAll` bằng nhau (kể cả dòng hỏng còn trong DB); kiểm: fail vì skeleton trả snapshot rỗng
- [x] 3.6 GREEN: `exportAll` — `await this.studyTimeWrites`, transaction `'r'` ba bảng, `parseSettings` + `lessonProgressSchema`/`dailyStatSchema` `safeParse` từng dòng; kiểm: test 3.5 pass, `progress-store.service.ts` < 300 dòng

## 4. Quy tắc xuất và đếm bài — `BackupService` Phần 2 (design D4)

Test: `apps/web/src/app/shared/services/backup.service.test.ts` (pure).

- [x] 4.1 RED: S8.5-AC1 "Bấm Xuất tiến độ thì lưu được file" (Phần 2) — `buildBackupFileName(new Date(2026, 10, 17, 23, 59).getTime())` = `'tranie-tien-do-2026-11-17.json'`, 00:01 ngày 18 → `…-2026-11-18.json`; `serializeBackupFile(buildBackupFile(snapshot, now))` là JSON đọc được, có `format`, `formatVersion: 1`, `exportedOn: '2026-11-17'`, và `checkBackupText` của nó → `valid` với snapshot bằng đầu vào; kiểm: fail vì skeleton
- [x] 4.2 GREEN: `buildBackupFileName`, `buildBackupFile`, `serializeBackupFile` (kèm `Rule:`); kiểm: test 4.1 pass
- [x] 4.3 RED: S8.5-AC3 "Số bài đã xong gồm bài qua bằng kiểm tra vượt cấp" (Phần 2) — lộ trình 4 chủ đề (D10), `lessonProgress` = `intro-01`, `intro-05`, `intro-06` completed + `intro-02` in-progress → `countCompletedLessons` = 3 (1 + N, N = 2); kiểm: fail vì skeleton trả 0
- [x] 4.4 GREEN: `countCompletedLessons` (chỉ `completed` có trong `knownLessonIds`, `Rule:`); kiểm: test 4.3 pass
- [x] 4.5 RED: S8.5-AC3 "Bài không có trong app không ảnh hưởng lộ trình" (Phần 2) — `intro-01` + `khong-co-bai-nay` completed → `countCompletedLessons` = 1; `ProgressService.deriveLessonStatuses(stages, {intro-01, khong-co-bai-nay})` → `intro-01` completed, `intro-02` open, còn lại locked, không có khóa `khong-co-bai-nay`; kiểm: chạy, nếu pass ngay thì tạm bỏ điều kiện `knownLessonIds` để thấy fail rồi trả lại
- [x] 4.6 GREEN: sửa đến khi pass; kiểm: test 4.5 pass, mọi method Phần 2 có `Rule:` — GREEN không đổi code: 4.4 đã đáp ứng, RED 4.5 chứng minh bằng tạm bỏ `knownLessonIds`

## 5. Lưu file xuống máy — `core/services/file-saver.service.ts` (design D5)

Test: `apps/web/src/app/core/services/file-saver.service.test.ts` (stub `URL.createObjectURL`/`revokeObjectURL`, spy `HTMLAnchorElement.prototype.click`).

- [x] 5.1 RED: S8.5-AC1 "Báo đã xuất ngay khi trình duyệt nhận file" (core) — `fileSaver.save('tranie-tien-do-2026-11-17.json', '{}', 'application/json')` trả về đồng bộ (không phải Promise); anchor được click đúng một lần với `download` = tên file, `href` = URL blob; anchor đã gỡ khỏi `document.body` sau khi trả về; `revokeObjectURL` gọi sau khi chạy timer (`vi.useFakeTimers`). Skeleton: interface `FileSaver`, `AnchorFileSaver.save` no-op, singleton; kiểm: fail
- [x] 5.2 GREEN: `AnchorFileSaver` (D5); kiểm: test 5.1 pass

## 6. Use case xuất/nhập — `BackupService` Phần 1 + 3 (design D4)

Test: `apps/web/src/app/shared/services/backup.service.export.test.ts`, `backup.service.import.test.ts` — `DexieProgressStore`
thật trên DB tên ngẫu nhiên (máy A, máy B là hai DB), `ContentSource` fake (lộ trình D10), `FileSaver` fake ghi nhận
`{ fileName, content }`. Nhập dùng object `{ size, text }` dựng từ nội dung đã xuất.

- [x] 6.1 RED: S8.5-AC1 "Chưa học gì vẫn xuất được" (Phần 3) — DB chỉ có settings onboarding; `exportProgress(new Date(2026, 10, 17, 10).getTime())` → fake saver được gọi một lần, tên `tranie-tien-do-2026-11-17.json`, nội dung `checkBackupText` → `valid` với `lessonProgress: []`, `dailyStats: []`; kiểm: fail vì skeleton no-op
- [x] 6.2 GREEN: Phần 1 (`readSnapshot`, `saveFile`), `exportProgress`; constructor 3 tham số mặc định singleton; kiểm: test 6.1 pass
- [x] 6.3 RED: S8.5-AC1 "Không đọc được tiến độ thì báo lỗi" (Phần 3) — store có `exportAll` reject → `exportProgress` reject với `Error` message rõ nghĩa, fake saver **không** được gọi; kiểm: chạy, nếu pass ngay thì tạm gọi `saveFile` với snapshot rỗng khi đọc lỗi để thấy fail rồi trả lại
- [x] 6.4 GREEN: bọc lỗi đọc thành `Error('Không đọc được tiến độ để xuất.')` trước `saveFile`; kiểm: test 6.3 pass
- [x] 6.5 RED: S8.5-AC1 "Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ" (Phần 3) — A: `intro-01`, `02` completed, `intro-03` in-progress `cursor: 3`, `completeOnboarding(30)`, `changeDefaultAudioSpeed('slow')`; `exportProgress`; B: `completeOnboarding(15)`, chưa học; `inspectImportFile` nội dung đã xuất → `valid`, `preview.completedLessonCount` 2; `importProgress(snapshot)` → B: `ProgressService(B).getCompletedLessonIds()` = {01, 02}, `storeB.getLessonProgress('intro-03').cursor` 3, `getLearningPreferences()` = `{ dailyGoalMinutes: 30, defaultAudioSpeed: 'slow', … }`; kiểm: fail vì skeleton `inspectImportFile` trả `rejected`
- [x] 6.6 GREEN: Phần 1 (`writeSnapshot`, `readKnownLessonIds`), `inspectImportFile` (đọc text, `checkBackupText`, preview), `importProgress`; kiểm: test 6.5 pass
- [x] 6.7 RED: S8.5-AC1 "File có lựa chọn hiện pinyin" (Phần 3) — A `changePinyinVisibility(false)`, B mặc định (`isPinyinVisible: true`); xuất A, nhập B → `ProgressService(B).getLearningPreferences().isPinyinVisible` `false`; kiểm: chạy, nếu pass ngay thì tạm cho `writeSnapshot` bỏ khóa `isPinyinVisible` khi ghi settings để thấy fail rồi trả lại
- [x] 6.8 GREEN: sửa đến khi pass; kiểm: test 6.7 pass — GREEN không đổi code: 3.2 + 6.6 đã đáp ứng, RED 6.7 chứng minh bằng tạm bỏ khóa `isPinyinVisible`
- [x] 6.9 RED: S8.5-AC1 "File có số phút đã học từng ngày" (Phần 3) — A mục tiêu 15, `storeA.addStudySeconds(hôm nay, 720)`; B mục tiêu 30; xuất A, nhập B cùng ngày → `ProgressService(B).getTodayStudy(now)` = `{ minutes: 12, goalMinutes: 15 }`; kiểm: chạy, nếu pass ngay thì tạm bỏ `dailyStats` khỏi `exportAll` để thấy fail rồi trả lại
- [x] 6.10 GREEN: sửa đến khi pass; kiểm: test 6.9 pass — GREEN không đổi code: 3.2 + 3.6 + 6.6 đã đáp ứng, RED 6.9 chứng minh bằng tạm bỏ `dailyStats` khỏi `exportAll`
- [x] 6.11 RED: S8.5-AC1 "File có chủ đề đã qua bằng kiểm tra vượt cấp" (Phần 3) — lộ trình 4 chủ đề; A `intro-01`, `05`, `06` completed; xuất A, nhập B → `deriveLessonStatuses` của B: 01, 05, 06 completed, 07 open, 03, 04 locked; kiểm: chạy, nếu pass ngay thì tạm lọc `lessonProgress` chỉ giữ bài liền mạch từ đầu khi xuất để thấy fail rồi trả lại
- [x] 6.12 GREEN: sửa đến khi pass; kiểm: test 6.11 pass — GREEN không đổi code: RED 6.11 chứng minh bằng tạm lọc `lessonProgress` liền mạch trong `exportAll`
- [x] 6.13 RED: S8.5-AC1 "Chuỗi ngày học giữ đúng nhờ mục tiêu của từng ngày" (Phần 3) — A: mục tiêu 15, `addStudySeconds(hôm qua, 1200)` (dòng hôm qua `goalMinutes: 15`), rồi `changeDailyGoal(30, now)` hôm nay, chưa học hôm nay; `ProgressService(A).getStudyStreak(now)` = 1; xuất A, nhập B (mục tiêu 15) cùng ngày → `ProgressService(B).getStudyStreak(now)` = 1 và `getLearningPreferences().dailyGoalMinutes` 30; kiểm: chạy, nếu pass ngay thì tạm cho `exportAll` bỏ `goalMinutes` khỏi dòng ngày để thấy fail (B ra 0 vì hôm qua so với 30) rồi trả lại
- [x] 6.14 GREEN: sửa đến khi pass (`exportAll`/`writeSnapshot` giữ `goalMinutes`, `dailyStatStrictSchema` có `goalMinutes` optional, D2, D3); kiểm: test 6.13 pass — GREEN không đổi code: RED 6.13 chứng minh bằng tạm bỏ `goalMinutes` khỏi `exportAll`
- [x] 6.15 RED: S8.5-AC2 "File lớn hơn 20 MB bị từ chối" (Phần 2 + 3) — `isBackupFileTooLarge(20_000_001)` true, `(20_000_000)` false, `(0)` false; `inspectImportFile({ size: 20_000_001, text: vi.fn() })` → `rejected/not-backup` và `text` **không** được gọi; B không đổi; kiểm: fail
- [x] 6.16 GREEN: `MAX_BACKUP_FILE_BYTES` (`core/constants/backup.constants.ts`), `isBackupFileTooLarge` (`Rule:`), kiểm kích thước trước `text()`; `text()` reject → `not-backup`; kiểm: test 6.15 pass
- [x] 6.17 RED: S8.5-AC3 "Ghi đè thì tiến độ đúng bằng file" (Phần 3) — B: `intro-01`…`06` completed, mục tiêu 60; nhập `hop-le-3-bai-15-phut` → `getCompletedLessonIds` = {01, 02, 03}, `deriveLessonStatuses`: 04 open, 05, 06 locked; `getLearningPreferences().dailyGoalMinutes` 15; kiểm: chạy, nếu pass ngay thì tạm cho `importAll` bỏ `clear()` (gộp) để thấy fail rồi trả lại
- [ ] 6.18 GREEN: sửa đến khi pass; kiểm: test 6.17 pass, `backup.service.ts` < 300 dòng, không import React/Dexie (`pnpm lint`)

## 7. Mục "Sao lưu tiến độ" trong Cài đặt — hook + component (design D6, D7)

Test: `apps/web/src/app/pages/settings/containers/SettingsContainer.backup.test.tsx` (mục, xuất, thông báo),
`SettingsContainer.backupImport.test.tsx` (chọn file, lỗi), `SettingsContainer.backupDialog.test.tsx` (hộp xác nhận, bàn phím),
`SettingsContainer.backupNavigation.test.tsx` (sang Lộ trình) — `renderWithProviders(<SettingsContainer />, { route: '/settings' })`,
`openRoute('/settings')` khi cần sang màn khác (mẫu `SettingsContainer.test.tsx`), `mockContentFetch`; `beforeEach` xoá cả ba bảng
(`settings`, `lessonProgress`, `dailyStats`); truy vấn thông báo trong `getByRole('region', { name: 'Sao lưu tiến độ' })` (D7);
`vi.spyOn(fileSaver, 'save')`, `userEvent.upload(input, new File([...], 'x.json'))`. Util: `apps/web/src/app/shared/utils/date.utils.test.ts`.
Test S8.2 cũ (`SettingsContainer*.test.tsx`) phải vẫn pass sau mỗi GREEN.

- [ ] 7.1 RED: S8.5-AC1 "Màn Cài đặt có mục Sao lưu tiến độ" — mở `/settings` → `heading` "Sao lưu tiến độ", `button` "Xuất tiến độ", `button` "Nhập tiến độ"; kiểm: fail vì chưa có mục
- [ ] 7.2 GREEN: `ProgressBackupSection` (`section` region + tiêu đề + hai nút, chưa nối hành vi), `useProgressBackup` skeleton, type view ở `shared/models/progress-backup.model.ts`, nhóm `backup.*` trong `settings.json`, render cuối `<main>` của `SettingsContainer` ngoài nhánh `preferences === null`, `_progress-backup.css` + import `main.css` cạnh `_settings.css`; kiểm: test 7.1 pass
- [ ] 7.3 RED: S8.5-AC1 "Hai nút dùng được bằng bàn phím" — `userEvent.tab()` tới "Xuất tiến độ" (`toHaveFocus`), `keyboard('{Enter}')` → `fileSaver.save` được gọi với tên `tranie-tien-do-<hôm nay>.json`; `tab()` tiếp → "Nhập tiến độ" có focus; kiểm: fail vì nút chưa nối `exportProgress`
- [ ] 7.4 GREEN: `useProgressBackup.exportProgress` (pha `exporting`, bỏ qua bấm lặp), nút gọi handler; kiểm: test 7.3 pass
- [ ] 7.5 RED: S8.5-AC1 "Thông báo xuất được đọc cho trình đọc màn hình" — trước khi bấm đã có `role="status"` rỗng; bấm "Xuất tiến độ" → `getByRole('status')` có chữ "Đã xuất tiến độ."; `fileSaver.save` throw → `getByRole('alert')` "Không xuất được tiến độ. Hãy thử lại."; kiểm: fail
- [ ] 7.6 GREEN: hai vùng thông báo luôn render, `message` `exported`/`exportFailed`; kiểm: test 7.5 pass
- [ ] 7.7 RED: S8.5-AC2 "Thông báo lỗi được đọc cho trình đọc màn hình" — DB `intro-01` completed; upload `anh.png` → `getByRole('alert')` "File này không phải file tiến độ của Tranie Chinese." (vùng có sẵn trước khi chọn), không có `role="dialog"`, DB vẫn chỉ `intro-01`; upload `trang-thai-sai` → "File tiến độ bị hỏng, không nhập được."; `ban-moi-hon` → chữ phiên bản mới hơn; với `hop-le-5-bai` khi `vi.spyOn(contentSource, 'getContentRoot').mockRejectedValueOnce(…)` → `alert` "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên.", không `dialog` (quyết định của dev, design Open Questions); kiểm: fail vì chưa nối `selectFile`
- [ ] 7.8 GREEN: input file ẩn (không `accept`, reset `value`), `selectFile` → `inspectImportFile`, map `reason` → `notBackup`/`corrupted`/`newerVersion`, throw (nạp nội dung lỗi) → `importFailed`, tiền tố chữ lỗi; `inspectImportFile` bọc lỗi `readKnownLessonIds` thành `Error` rõ nghĩa (D4); kiểm: test 7.7 pass
- [ ] 7.9 RED: S8.5-AC2 "Đóng hộp chọn file thì không có gì xảy ra" — có thông báo cũ từ lần xuất; bấm "Nhập tiến độ" (spy `HTMLInputElement.prototype.click` thấy được gọi) rồi `fireEvent.change(input, { target: { files: [] } })` → không `alert` có chữ, không `dialog`, DB không đổi; kiểm: chạy, nếu pass ngay thì tạm cho `selectFile(undefined)` đặt `notBackup` để thấy fail rồi trả lại
- [ ] 7.10 GREEN: `selectFile(undefined)` không làm gì; kiểm: test 7.9 pass
- [ ] 7.11 RED: S8.5-AC3 "File hợp lệ thì hiện hộp xác nhận" — `formatLocalDateKey('2026-11-17')` = `'17/11/2026'`; DB `intro-01` completed; upload `hop-le-5-bai` → `getByRole('dialog', { name: 'Nhập tiến độ từ file?' })` có "17/11/2026", "5 bài đã xong", câu cảnh báo nguyên văn spec, nút "Ghi đè", "Hủy"; khi hộp đang mở DB vẫn chỉ `intro-01`; kiểm: fail vì chưa có hộp
- [ ] 7.12 GREEN: `formatLocalDateKey` (`date.utils.ts`), `ImportConfirmDialog` (D7), pha `confirming`, giữ snapshot trong `useRef`; kiểm: test 7.11 pass
- [ ] 7.13 RED: S8.5-AC3 "Hủy thì không đổi gì" — mở hộp với `hop-le-5-bai`, bấm "Hủy" → không còn `dialog`, `status`/`alert` rỗng, DB chỉ `intro-01`; kiểm: fail vì "Hủy" chưa nối
- [ ] 7.14 GREEN: `cancelImport`; kiểm: test 7.13 pass
- [ ] 7.15 RED: S8.5-AC3 "Esc thì như Hủy" — hộp mở, `keyboard('{Escape}')` → hộp đóng, không thông báo, DB không đổi; kiểm: fail
- [ ] 7.16 GREEN: `onKeyDown` `Escape` → `onCancel`; kiểm: test 7.15 pass
- [ ] 7.17 RED: S8.5-AC3 "Hộp xác nhận dùng được bằng bàn phím" — hộp vừa mở: "Hủy" có focus; `tab()` → "Ghi đè"; `tab()` → "Hủy" (không ra nền); `tab({ shift: true })` từ "Hủy" → "Ghi đè"; Enter ở "Hủy" → hộp đóng, focus ở "Nhập tiến độ"; kiểm: fail
- [ ] 7.18 GREEN: focus "Hủy" khi mở, vòng Tab, trả focus về nút Nhập (ref) khi đóng; kiểm: test 7.17 pass
- [ ] 7.19 RED: S8.5-AC3 "Thông báo thành công được đọc cho trình đọc màn hình" — DB mục tiêu 60, "Hiện pinyin" bật; hộp mở với `hop-le-5-bai` (mục tiêu 15), bấm "Ghi đè" → `status` trong region "Đã nhập tiến độ.", focus ở "Nhập tiến độ", radio "15 phút" trong nhóm "Mục tiêu mỗi ngày" được chọn mà không remount (nạp lại qua `useSettings.reloadPreferences`); `DexieProgressStore.prototype.importAll` reject (spy) → `alert` "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên.", radio "60 phút" vẫn chọn; kiểm: fail
- [ ] 7.20 GREEN: `confirmImport` (pha `importing`, `imported`/`importFailed`); `useSettings` thêm `reloadPreferences` (state `loadId` trong dependency của effect nạp, D6); `SettingsContainer` gọi `useProgressBackup(reloadPreferences)` (không có context cấp app phải nạp lại, design D1); kiểm: test 7.19 pass, test S8.2 cũ vẫn pass
- [ ] 7.21 RED: S8.5-AC3 "Màn khác hiện tiến độ mới không cần tải lại" — `openRoute('/settings')`, DB `intro-01` completed; nhập `hop-le-5-bai`, "Ghi đè", bấm liên kết "Về lộ trình" → `intro-01`…`05` "Đã xong", `intro-06` "Đang mở"; kiểm: chạy, nếu pass ngay (Lộ trình đọc lại khi mount) thì tạm cho `confirmImport` không gọi `importProgress` để thấy fail rồi trả lại
- [ ] 7.22 GREEN: sửa đến khi pass; kiểm: test 7.21 pass, mỗi file < 300 dòng, component < 5 props, JSX chỉ class layout/spacing

## 8. Luồng người dùng — Playwright `apps/web/e2e/E8/` (design D10)

Helper `apps/web/e2e/E8/backup.helpers.ts`: `backupSection`, `exportProgress` (chờ `download`), `importFile` (`setInputFiles`),
`fixturePath(name)`, `serveBackupPath` (4 chủ đề), `breakLessonProgressWrites` (mẫu guard `IDBObjectStore.prototype` của
`settings.helpers.ts`, D10); dùng lại `seedProgress`, `completeOnboarding`, `TIMEZONE`, `NOW`, `expectTodayMinutes` (`home.helpers.ts`),
`openSettingsFromPath`, `goalRadio`, `pinyinSwitch`, `breakSettingsReads` (`settings.helpers.ts`), `expectStreak`, `dayKey`,
`reachedDay` (`streak.helpers.ts`). Mỗi file < 300 dòng.

- [ ] 8.1 RED: S8.5-AC1 "Xuất khi không có mạng" — `s8.5-backup-offline.spec.ts`: `openOnceWithServiceWorker` (mẫu `e2e/E1/s1.2-offline.spec.ts`), onboarding, `setOffline(true)`, `openSettingsFromPath`, bấm "Xuất tiến độ" → có `download` tên đúng, `status` "Đã xuất tiến độ." (TC-S8.5-AC1-12); kiểm: chạy, nếu pass ngay (không có nhánh mạng) thì tạm cho `exportProgress` gọi `fetch` một URL nội bộ trước khi xuất để thấy test bắt được phụ thuộc mạng, rồi trả lại
- [ ] 8.2 GREEN: sửa đến khi pass (chunk `/settings` và chuỗi i18n có trong precache); kiểm: test 8.1 pass
- [ ] 8.3 RED: S8.5-AC2 "Nhập file lỗi khi không có mạng" — cùng file; offline, `intro-01` completed, nhập `trang-thai-sai.json` → `alert` "File tiến độ bị hỏng, không nhập được.", không `dialog`, Lộ trình vẫn `intro-01` "Đã xong" (TC-S8.5-AC2-8); kiểm: như 8.1 (tạm `fetch` trong `inspectImportFile`)
- [ ] 8.4 GREEN: sửa đến khi pass; kiểm: test 8.3 pass
- [ ] 8.5 RED: S8.5-AC3 "Nhập khi không có mạng" — cùng file; offline, `intro-01` completed, nhập `hop-le-5-bai.json`, "Ghi đè" → `status` "Đã nhập tiến độ.", Lộ trình `intro-01`…`05` "Đã xong" (TC-S8.5-AC3-14); kiểm: như 8.1 (tạm `fetch` trong `importProgress`)
- [ ] 8.6 GREEN: sửa đến khi pass; kiểm: test 8.5 pass
- [ ] 8.7 Test e2e nghiệm thu (hành vi đã có test RED ở tầng dưới; commit `test(e2e)`) `s8.5-backup-section.spec.ts`: TC-S8.5-AC1-1, AC1-4, AC1-15, AC2-11, AC3-8, AC3-16; kiểm: `pnpm e2e` file này pass
- [ ] 8.8 Test e2e nghiệm thu `s8.5-export.spec.ts` (đồng hồ 2026-11-17, `TIMEZONE`): TC-S8.5-AC1-6 (tên file, nội dung JSON đọc được), AC1-8, AC1-10 (bài 2 làm tiếp đúng câu), AC1-11, AC1-13 (`breakSettingsReads` sau khi màn Cài đặt hiện: không có `download`, `alert` "Không xuất được tiến độ. Hãy thử lại."); kiểm: file này pass
- [ ] 8.9 Test e2e nghiệm thu `s8.5-roundtrip.spec.ts` (hai `browser.newContext()`): TC-S8.5-AC1-16, AC1-19, AC1-20 (`serveBackupPath`, `serviceWorkers: 'block'`), AC1-21 (`expectStreak(page, 1)` trên Trang chủ cả hai máy, dữ liệu `reachedDay`/`dayKey`), AC1-22 (`pinyinSwitch` tắt ở máy B), AC3-5 (hộp nêu 1 + N); kiểm: file này pass
- [ ] 8.10 Test e2e nghiệm thu `s8.5-import-reject.spec.ts`: TC-S8.5-AC2-1, AC2-2, AC2-3, AC2-4 (buffer 21 000 000 byte tạo trong test), AC2-5, AC2-6, AC2-7; kiểm: file này pass
- [ ] 8.11 Test e2e nghiệm thu `s8.5-import-confirm.spec.ts`: TC-S8.5-AC3-1, AC3-6, AC3-7, AC3-10, AC3-12, AC3-13 (`breakLessonProgressWrites` khi hộp đang mở; Lộ trình chỉ bài 1, `goalRadio` không đổi), AC3-17, AC3-18; kiểm: file này pass

## 9. Tài liệu (docs thuần, miễn test-first)

- [ ] 9.1 `docs/03-architecture.md`: §4 `backup.service` (Phần 2/3 chính), §6.3 `exportAll`/`importAll` + `ProgressSnapshot` + `FileSaver`, §8 "File import lỗi" dùng `format` + `formatVersion` (thay `schemaVersion`), ghi hợp đồng bảng mới phải vào sao lưu; kiểm: đọc lại khớp code (tên hàm, file)
- [ ] 9.2 Mô tả PR code: đường dẫn file mẫu (`apps/web/e2e/E8/fixtures/progress-backup/`), cách tạo trạng thái vượt cấp tay, giới hạn 20 000 000 byte, case chạy tay (cột "không" trong `test-cases.md`); screenshot màn Cài đặt có mục và hộp xác nhận ở 375×812 và 1280×800, sáng/tối (`CLAUDE.md` §8 Pull request); kiểm: PR có đủ mục theo template

## 10. Kiểm tra cuối

- [ ] 10.1 `pnpm typecheck && pnpm lint && pnpm test:run` pass; `pnpm content:check` pass (không đổi nội dung nhưng hook chạy)
- [ ] 10.2 `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` pass; `pnpm e2e` pass (toàn bộ, gồm E1/E3/E8 cũ)
- [ ] 10.3 Self-review theo `CLAUDE.md` §0, §2 (bảng D8), §7: không `any`/`as` dữ liệu ngoài, mọi dữ liệu file qua Zod, service không import React/Dexie, mỗi file < 300 dòng; kiểm: `grep -rn " as \| any" ` trên file mới không có kết quả cho dữ liệu ngoài

## Workflow follow-up

- Archive tự động sau khi PR code merge (`archive-spec-workflow.yml`), không archive trong PR code.
- PR code ghi `Spec PR: #132` và `Closes #58` nếu mọi AC xong.
