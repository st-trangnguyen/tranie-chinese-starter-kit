# Design: S8.2 Cài đặt

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/settings/spec.md`, `specs/audio-replay/spec.md`,
`specs/speak-rating/spec.md`, `specs/speak-no-mic/spec.md`. Case nghiệm thu: `test-cases.md`. Luật layer/dependency/service
3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau khi merge PR spec #131 và PR code S8.1 #134, không phải đề xuất):

- **Cài đặt trên máy.** Bảng Dexie `settings` là khóa–giá trị (`SettingRow { key; value: unknown }`, chỉ index `key`, version
  1–3 trong `core/helpers/db.helper.ts`). `@csk/shared` `progress.schema.ts`: `interface Settings { dailyGoalMinutes;
  hasCompletedOnboarding }`, `DEFAULT_SETTINGS`, `settingsSchema` (mỗi field `.catch` về mặc định, `z.object` bỏ khóa lạ),
  `parseSettings(raw)`. `DexieProgressStore.getSettings()` gom mọi dòng thành record rồi `parseSettings`;
  `saveSettings(settings: Settings)` ghi `Object.entries(settings)` bằng `bulkPut` — tức là **chỉ ghi các khóa được truyền vào**.
- **`ProgressService`** (`shared/services/progress.service.ts`, 203 dòng): Phần 1 `readSettings`/`writeSettings`; Phần 2
  `isValidDailyGoal`, `shouldShowOnboarding`…; Phần 3 `needsOnboarding`, `completeOnboarding` (đọc → gộp → ghi cả object),
  `getTodayStudy` (đọc settings lỗi → `DEFAULT_SETTINGS`, không throw). Store mặc định là singleton `progressStore`.
- **Tốc độ audio.** `shared/contexts/AudioSpeedContext.tsx` (`AudioSpeedProvider`, `useState(false)`) + `useAudioSpeed.ts`
  (`{ isSlow, toggleSlow }`, mặc định ngoài provider là `false`). `SlowToggle` (`role="switch"`, nhãn "Nghe chậm") và
  `ListenButton` (`play(audioPath, isSlow)`) đọc context. `LessonRunnerContainer` bọc `LessonRunner` bằng
  `<AudioSpeedProvider key={lessonId}><RecordingModeProvider key={lessonId}>`, chỉ render khi `session && phase !== 'finished'
  && exercise && content` — provider mount lại mỗi lần vào bài, mỗi lần đổi `lessonId` và sau "Làm lại".
  `PLAYBACK_RATES = { normal: 1, slow: 0.75 }` ở `core/constants/audio.constants.ts`. `RecordCompare` ("Nghe mẫu") gọi
  `play(audioPath, false)` cố định, không đọc context — đúng mục "Không làm" (luôn 1x).
- **Lỗi tốc độ phát có từ S4.4.** `core/services/audio.service.ts` `play(src, rate)` (khoảng dòng 42–45) làm theo thứ tự
  `audio.currentTime = 0; audio.playbackRate = rate; audio.src = src; audio.play()`. Gán `src` chạy thuật toán load của media
  element, đặt lại `playbackRate` về `defaultPlaybackRate` (1) — dev-lead đã kiểm trên Chromium: đặt 0.75 rồi gán `src` thì đọc
  được 1. Tức là "Nghe chậm" hiện phát 1x trên trình duyệt thật. Test không bắt được vì `FakeAudio` trong
  `audio.service.test.ts`, `useAudioPlayer.test.ts` và `fakeAudio` của `LessonRunnerContainer.audio.test.tsx` là field thường,
  không mô phỏng việc reset; `installAudioRecorder` (e2e) chưa ghi tốc độ.
- **Pinyin ở câu "nói".** `shared/components/exercises/SpeakExercise.tsx` render `<p>{target.hanzi}</p><p>{target.pinyin}</p>
  <p>{target.vi}</p>`; phần giải thích soạn qua `t('speak.explanation', { hanzi, pinyin, vi })`. Component dạng bài **đã** đọc
  context từ `shared/contexts` (`useRecordingMode`) — tiền lệ cho việc đọc tùy chọn qua context thay vì thêm prop vào
  `ExerciseProps` (4 props, hợp đồng registry). `ToneChoiceExercise`, `SoundPairExercise`, `PinyinTypeExercise` có pinyin là
  lựa chọn/đáp án/ô gõ, không đổi.
- **Màn Lộ trình** `pages/learning-path/containers/LearningPathContainer.tsx` (52 dòng) có `<Link to={ROUTE_PATHS.home}
  className="learning-path-home-link self-start">` — mẫu cho liên kết "Cài đặt". `ROUTE_PATHS` ở `core/constants/app.constants.ts`;
  bảng route gom ở `pages/page.routes.ts`, mỗi feature một `<feature>.routes.ts` lazy (mẫu `home.routes.ts`).
- **Mẫu hook trang**: `useOnboarding` (service qua `useMemo`, effect có cờ `isActive`, `null` khi đang đọc), `useHome`.
- **Onboarding** `GoalStep` dùng `<fieldset><legend>` + radio `name="daily-goal"` (mũi tên đổi lựa chọn nhờ radio gốc) và CSS
  `.goal-option`, `.goal-option.is-active`, `:focus-within` outline ở `styles/tailwind/components/_onboarding.css`.
- **i18n**: `I18N_NAMESPACES` (`core/services/i18n.service.ts`) và `src/test/i18n.ts` chưa có `settings`; chưa có file
  `assets/i18n/vi/settings.json`. PWA precache `**/*.json` nên file mới tự vào precache.
- **Test có sẵn**: Vitest + fake-indexeddb (DB mặc định `createDatabase(DB_NAME)`, test tự xoá bảng), `vi.spyOn(progressStore,
  …)` để giả lỗi store (mẫu `useLessonRunner.test.ts`), `renderWithProviders` + `LocationProbe`. Test cũ của các Scenario bị sửa:
  `AudioSpeedContext.test.tsx`, `SlowToggle.test.tsx`, `LessonRunnerContainer.test.tsx` dòng 640–680 (S4.4-AC2),
  `SpeakExercise.test.tsx`, `SpeakExercise.no-mic.test.tsx`. Test `progress.schema.test.ts` "keeps valid stored values" so
  `toEqual` cả object 2 field — sẽ phải thêm 2 field mới.
- **E2E**: `e2e/E8/home.helpers.ts` có `completeOnboarding(page, goal)`, `seedProgress(page, { settings, lessonProgress })` (ghi
  IndexedDB thô rồi reload); `e2e/E7/intro-lessons.helpers.ts` có `installAudioRecorder`/`readAudioPlays` (ghi `src`, chưa ghi
  `playbackRate`). Nội dung build hiện có 12 bài Nhập môn: `intro-01` câu 1 chọn thanh 八 ("bā"), câu 10 phân biệt cặp âm 四/十;
  `intro-02` câu 3 gõ pinyin 妈妈, câu 8 là câu "nói" `intro-02-nihao` ("你好！" / "nǐ hǎo!" / "Xin chào!").

## Goals / Non-Goals

**Goals:**

- Quy tắc hợp lệ và quy tắc "tùy chọn → trạng thái lúc vào bài" là hàm thuần ở `ProgressService` Phần 2.
- Đổi một tùy chọn chỉ ghi đúng khóa đó — không bao giờ ghi đè `hasCompletedOnboarding` hay tùy chọn khác, kể cả khi lần đọc
  trước đó lỗi và màn đang hiện mặc định.
- Màn học đọc cài đặt **mỗi lần vào bài** (không cache toàn app), để "không đọc được khi đã ở trong app" ra mặc định đúng spec.
- Không đổi phiên bản DB, không thêm dependency, không đổi hợp đồng `ExerciseProps`.
- Sửa lỗi tốc độ phát của `audio.service` (D7) trong PR này: tốc độ mặc định "Chậm" của S8.2 vô nghĩa nếu bài vẫn phát 1x.

**Non-Goals:**

- Không có `SettingsProvider` toàn app (docs/03-architecture §3.2 dự kiến `settings.context.tsx`; xem D5 vì sao không làm).
- Không áp tốc độ mặc định cho "Nghe mẫu"/"Nghe bản ghi"; không ẩn pinyin ngoài câu "nói" (proposal, "Không làm").
- Không đổi `completeOnboarding` (vẫn đọc → gộp → ghi như S1.3).

## Decisions

### D1. Dữ liệu: hai khóa mới trong bảng `settings`, schema ở `@csk/shared`

`packages/shared/src/progress.schema.ts`:

```ts
export const AUDIO_SPEED_OPTIONS = ['normal', 'slow'] as const;   // trùng khóa PLAYBACK_RATES
export const audioSpeedSchema = z.enum(AUDIO_SPEED_OPTIONS);
export type AudioSpeed = z.infer<typeof audioSpeedSchema>;

export interface Settings {
  dailyGoalMinutes: DailyGoalMinutes;
  hasCompletedOnboarding: boolean;
  defaultAudioSpeed: AudioSpeed;   // mặc định 'normal'
  isPinyinVisible: boolean;        // mặc định true
}
// settingsSchema thêm: defaultAudioSpeed: audioSpeedSchema.catch('normal'), isPinyinVisible: z.boolean().catch(true)
```

- Khóa lưu trong IndexedDB: `defaultAudioSpeed`, `isPinyinVisible` (cùng tên field). Máy cũ chưa có khóa → `.catch` ra mặc định;
  giá trị hỏng (`'fast'`, `'yes'`, số…) → mặc định **riêng field đó** (Scenario "Một tùy chọn đã lưu bị hỏng…", "Mục tiêu…
  về 15 phút", "Tùy chọn pinyin… về bật"). Không `db.version` mới (proposal Open Questions, người thật đã xác nhận).
- Kiểu string union qua `as const` + `z.enum`, không `enum` TS (CLAUDE.md §7). Boolean đặt tên `is…` (§4).
- Thay thế: lưu `defaultPlaybackRate: 0.75 | 1` — gắn số hạ tầng vào dữ liệu người dùng, khó đổi tốc độ sau; `isSlowByDefault:
  boolean` — không mở rộng được nếu thêm mức.

### D2. Ghi từng khóa: `ProgressStore.saveSettings(patch: Partial<Settings>)`

- Đổi kiểu tham số `saveSettings(settings: Settings)` thành `saveSettings(patch: Partial<Settings>)` trong interface và
  `DexieProgressStore`. Thân hàm: `Object.entries(patch)` **lọc bỏ entry có giá trị `undefined`** rồi mới `bulkPut` (không có
  entry nào thì không ghi). Lý do lọc: `Partial<Settings>` cho phép `{ dailyGoalMinutes: undefined }`; không lọc thì ghi
  `{ key, value: undefined }` đè giá trị đã lưu, lần đọc sau `.catch` ra mặc định — mất tùy chọn của người học. Doc comment:
  "Chỉ ghi các khóa có trong `patch` với giá trị khác `undefined`; khóa khác giữ nguyên." Mọi chỗ gọi cũ (truyền `Settings`
  đủ) vẫn hợp lệ; stub `ProgressStore` viết tay trong test cũ (method syntax, tham số bivariant) vẫn typecheck.
- Use case đổi tùy chọn ghi `{ [key]: value }` (D3), **không** đọc–gộp–ghi. Lý do: khi không đọc được cài đặt (màn Cài đặt
  hiện mặc định) mà lần ghi lại thành công, đọc–gộp–ghi sẽ ghi `hasCompletedOnboarding: false` và mất các tùy chọn khác; ghi
  một khóa cũng tránh hai lần đổi nhanh (TC-S8.2-AC1-11) ghi đè nhau bằng ảnh chụp cũ. IndexedDB thực hiện các transaction
  `readwrite` cùng phạm vi theo thứ tự tạo, nên lựa chọn cuối thắng.
- Thay thế: thêm method mới `saveSetting(key, value)` — trùng chức năng, thêm một method vào interface và mọi stub.

### D3. Quy tắc + use case: `ProgressService` (không tạo service mới)

Model `shared/models/settings.model.ts`:

```ts
export type LearningPreferences = Pick<Settings, 'dailyGoalMinutes' | 'defaultAudioSpeed' | 'isPinyinVisible'>;
export interface LessonPreferences { isSlowAudio: boolean; isPinyinVisible: boolean }
```

- **Phần 1**: `writeSettings(patch: Partial<Settings>)` (đổi kiểu, ủy quyền store).
- **Phần 2** (thuần, mỗi method có `Rule:`):
  - `isValidAudioSpeed(value: string): value is AudioSpeed` — Rule: tốc độ mặc định chỉ là "Bình thường (1x)" hoặc "Chậm (0.75x)".
  - `toLessonPreferences(settings: Settings): LessonPreferences` — Rule: mỗi lần vào màn học, công tắc "Nghe chậm" bật khi
    tốc độ mặc định là `'slow'`, tắt khi `'normal'`; pinyin dưới chữ Hán ở câu "nói" hiện theo `isPinyinVisible` (S8.2 AC2, AC3).
  - `isValidDailyGoal` giữ nguyên.
- **Phần 3**:
  - `getLearningPreferences(): Promise<LearningPreferences>` — đọc settings, lấy 3 field; đọc lỗi → từ `DEFAULT_SETTINGS`,
    **không throw** (Scenario "Không đọc được cài đặt thì màn Cài đặt hiện mặc định": không báo lỗi). Cùng cách với `getTodayStudy`.
  - `getLessonPreferences(): Promise<LessonPreferences>` — `toLessonPreferences(settings)`; đọc lỗi → `toLessonPreferences(
    DEFAULT_SETTINGS)` (1x, hiện pinyin), không throw.
  - `changeDailyGoal(minutes: number)`, `changeDefaultAudioSpeed(speed: string)`, `changePinyinVisibility(isVisible: boolean)`
    — kiểm rule (sai → `throw new Error('Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.')` / `'Tốc độ audio mặc định phải là
    bình thường hoặc chậm.'`), rồi `writeSettings({ <khóa>: value })`. Lỗi ghi của store đi thẳng lên hook.
- Dự kiến `progress.service.ts` ~270 dòng (< 300). Test tách file `progress.service.settings.test.ts`.
- Thay thế: `settings.service.ts` riêng — proposal chốt dùng service tiến độ/cài đặt đã có, và `completeOnboarding`/
  `getTodayStudy` cùng đọc `Settings` ở đây; tách ra sẽ có hai service cùng sở hữu một bảng.

### D4. Màn Cài đặt: route `/settings`, feature `pages/settings/`

- **Route**: `ROUTE_PATHS.settings = '/settings'`; `pages/settings/settings.routes.ts` `[{ path: 'settings', element:
  SettingsContainer }]` (lazy), gom vào `page.routes.ts` sau `learningPathRoutes`. RESTful: tài nguyên số ít "cài đặt của người
  học", tên cụ thể (không `/preferences`, `/config`).
- **Hook `pages/settings/hooks/useSettings.ts`**:

  ```ts
  export interface SettingsState {
    preferences: LearningPreferences | null;   // null khi đang đọc
    saveErrorId: number | null;                // null = không có lỗi; tăng mỗi lần lưu lỗi
    changeDailyGoal: (minutes: DailyGoalMinutes) => void;
    changeDefaultAudioSpeed: (speed: AudioSpeed) => void;
    changePinyinVisibility: (isVisible: boolean) => void;
  }
  ```

  - Mount: `service.getLearningPreferences()` (không throw) → `preferences`, đồng thời giữ `persistedRef` (giá trị đã lưu
    chắc chắn). Effect có cờ `isActive` như `useOnboarding`.
  - Đổi một field (hàm nội bộ `applyChange(key, value, save)`): cập nhật `preferences` ngay (lạc quan, radio/công tắc đổi
    tức thì), tăng `latestRequestRef[key]`, gọi `save()`.
    - Thành công: `persistedRef[key] = value`; `saveErrorId = null` (thông báo biến mất — kể cả khi lần lỗi trước ở field
      khác, TC-S8.2-AC1-17).
    - Lỗi: nếu đây vẫn là lần đổi mới nhất của field thì trả `preferences[key]` về `persistedRef[key]` (giá trị đã lưu, không
      phải giá trị hiện trước đó — đúng cả khi lỗi lặp lại: 15 → 30 lỗi → 60 lỗi vẫn về 15); `saveErrorId = (prev ?? 0) + 1`.
  - Không `useEffect` đồng bộ state; không mutate (`{ ...prev, [key]: value }`).
- **Container `pages/settings/containers/SettingsContainer.tsx`**: `<main>` cùng khung với Lộ trình; `<Link to={ROUTE_PATHS.
  learningPaths} className="settings-back-link self-start">` "Về lộ trình"; `<h1>` "Cài đặt"; đang đọc → `<p role="status">`;
  lỗi lưu → **một** `<p role="alert" key={saveErrorId} className="settings-error">` "Không lưu được cài đặt. Hãy thử lại.".
  `key` đổi ở mỗi lần lỗi nên React thay node: trình đọc màn hình đọc lại (live region mới), trên màn vẫn chỉ một thông báo
  (Scenario "Lỗi lặp lại chỉ có một thông báo"). Test kiểm "đọc lại" bằng: đúng một `role="alert"` và node sau lần lỗi thứ hai
  khác node sau lần lỗi thứ nhất.
- **Components `pages/settings/components/`** (mỗi cái 2 props: `value`, `onChange`):
  - `DailyGoalSetting` — `<fieldset><legend>Mục tiêu mỗi ngày</legend>` + 3 radio `name="daily-goal"` theo `DAILY_GOAL_OPTIONS`,
    nhãn `t('dailyGoal.option', { count })` = "15 phút"…
  - `AudioSpeedSetting` — fieldset "Tốc độ audio mặc định" + 2 radio `name="default-audio-speed"` theo `AUDIO_SPEED_OPTIONS`,
    nhãn "Bình thường (1x)", "Chậm (0.75x)".
  - `PinyinVisibilitySetting` — fieldset "Hiện pinyin" + `<input type="checkbox" role="switch" aria-labelledby={legendId}>`
    và chữ trạng thái nhìn thấy "Bật"/"Tắt" (không chỉ màu — Scenario "Mặc định hiện pinyin").
  - Radio/checkbox gốc nên Tab vào nhóm, mũi tên đổi radio, Space bật/tắt switch không cần code bàn phím riêng; focus thấy được
    bằng `:focus-within` outline như `.goal-option`. Không có nút "Lưu".
  - Ba nhóm cùng là `role="group"` có tên (fieldset + legend) để test/QA tìm "ba nhóm" theo một cách.
- **Liên kết vào**: `LearningPathContainer` thêm `<Link to={ROUTE_PATHS.settings} className="learning-path-settings-link
  self-start">` "Cài đặt" cạnh liên kết "Trang chủ" (nhóm hai liên kết trong một `<nav aria-label>` dạng `flex gap-md`).
- Thay thế: dùng lại `GoalStep` của onboarding — import chéo feature và GoalStep có nút "Tiếp tục"/gợi ý riêng onboarding.

### D5. Áp tùy chọn ở màn học: đọc mỗi lần vào bài, qua context

- **Hook trang `pages/lesson/hooks/useLessonPreferences.ts`**: `useLessonPreferences(lessonId: string): LessonPreferences |
  null`. Effect (deps `[service, lessonId]`) gọi `service.getLessonPreferences()` (không throw) rồi lưu `{ lessonId, preferences
  }`; trả `null` khi `lessonId` đã lưu khác `lessonId` hiện tại (derive khi render, không reset state trong effect). Nhờ vậy
  đổi bài ngay trên route (`/lessons/l1` → `/lessons/l2`) cũng đọc lại.
- **`LessonRunnerContainer`**: gọi `useLessonPreferences(lessonId)`; khối runner render thêm điều kiện `preferences !== null`;
  `<p role="status">` đang tải hiện khi `!hasError && (!lesson || (session-đang-chạy && preferences === null))`.
  Bọc:

  ```tsx
  <AudioSpeedProvider key={lessonId} initialIsSlow={preferences.isSlowAudio}>
    <PinyinVisibilityProvider isVisible={preferences.isPinyinVisible}>
      <RecordingModeProvider key={lessonId}>…
  ```

  Container dự kiến ~120 dòng. `PlacementTestContainer` render lại `LessonRunnerContainer` nên tự có.
- **`AudioSpeedProvider`** thêm prop tùy chọn `initialIsSlow?: boolean` (mặc định `false`) → `useState(initialIsSlow)`. Giá trị
  chỉ dùng lúc mount; provider mount lại theo `key={lessonId}`/sau "Làm lại" nên mỗi lần vào bài bắt đầu theo Cài đặt. Bật/tắt
  trong bài chỉ đổi state của provider, không gọi service nào (Scenario "Tắt Nghe chậm trong bài không đổi Cài đặt").
- **Context mới `shared/contexts/PinyinVisibilityContext.tsx`** (`PinyinVisibilityProvider({ isVisible, children })`) +
  **`shared/contexts/usePinyinVisibility.ts`** (`PinyinVisibilityContext = createContext<boolean>(true)`,
  `usePinyinVisibility(): boolean`). Mặc định ngoài provider là `true`: test component cũ và màn khác không đổi.
- **`SpeakExercise`**: `const isPinyinVisible = usePinyinVisibility();` và chỉ render `<p lang="zh-Latn-pinyin">{target.pinyin}
  </p>` khi `true`. Phần giải thích (`speak.explanation`) giữ pinyin. Không đụng `ToneChoiceExercise`, `SoundPairExercise`,
  `PinyinTypeExercise`, `RecordCompare`.
- Thay thế đã loại:
  - (a) `SettingsProvider` toàn app nạp một lần lúc mở app: màn học dùng giá trị cache, nên Scenario "Không đọc được cài đặt
    thì bài vẫn mở với tốc độ thường và hiện pinyin" (lỗi đọc xảy ra khi đã ở trong app) sẽ ra tùy chọn cũ; còn phải đồng bộ
    sau khi màn Cài đặt lưu.
  - (b) Thêm prop `isPinyinVisible` vào `ExerciseProps` — đổi hợp đồng của mọi dạng bài và registry cho một dạng; context đã
    có tiền lệ (`useRecordingMode`).
  - (c) Đọc cài đặt trong `useLessonRunner` (243 dòng) — gần ngưỡng 300 và trộn concern.

### D6. i18n và style

- `apps/web/src/assets/i18n/vi/settings.json` (namespace `settings`):

  | Khóa | Chữ |
  |---|---|
  | `title` | "Cài đặt" |
  | `backLink` | "Về lộ trình" |
  | `loading` | "Đang tải cài đặt…" |
  | `dailyGoal.label` / `dailyGoal.option` | "Mục tiêu mỗi ngày" / "{{count}} phút" |
  | `audioSpeed.label` / `audioSpeed.options.normal` / `.slow` | "Tốc độ audio mặc định" / "Bình thường (1x)" / "Chậm (0.75x)" |
  | `pinyin.label` / `pinyin.on` / `pinyin.off` | "Hiện pinyin" / "Bật" / "Tắt" |
  | `saveError` | "Không lưu được cài đặt. Hãy thử lại." |

  `learning-path.json` thêm `settingsLink: "Cài đặt"`, `linksLabel` cho `<nav>`. Thêm `settings` vào `I18N_NAMESPACES` và
  `src/test/i18n.ts`.
- `apps/web/src/styles/tailwind/components/_settings.css` (import trong `main.css`): `.settings-title`, `.settings-back-link`,
  `.settings-group`, `.settings-group-label`, `.settings-option` (+ `.is-active`, `:focus-within`), `.settings-switch`,
  `.settings-switch-state`, `.settings-error`; `_learning-path.css` thêm `.learning-path-settings-link`. Màu qua token có sẵn
  (`_dark.css` tự đổi), trong JSX chỉ class layout/spacing (CLAUDE.md §6).

### D7. Sửa thứ tự gán trong `AudioService.play` (`core/services/audio.service.ts`)

- Thứ tự mới trong `play(src, rate)`: `audio.src = src;` → `audio.currentTime = 0;` → `audio.defaultPlaybackRate = rate;` →
  `audio.playbackRate = rate;` → `audio.play()`. Gán `src` trước để thuật toán load không xoá tốc độ; đặt cả
  `defaultPlaybackRate` để lần load sau (bấm "Nghe" lại cùng element, cùng `src`) cũng không về 1x giữa chừng. Chữ ký
  `play(src, rate)`, `PLAYBACK_RATES`, `useAudioPlayer` không đổi. Hạ tầng thuần, không đổi tầng/import.
- Test: `FakeAudio` trong `audio.service.test.ts` đổi `src` thành getter/setter, setter đặt `playbackRate = defaultPlaybackRate`
  (và `currentTime = 0`) như trình duyệt; thêm field `defaultPlaybackRate = 1`. Test cũ (rate 1) không đổi kỳ vọng.
- E2E: `installAudioRecorder` ghi `playbackRate` đọc từ `this.playbackRate` **sau khi phát đã bắt đầu** (trong `then` của
  `play`, cùng chỗ ghi `duration`), không phải lúc gọi `play` — nên TC-S8.2-AC2-2, TC-S8.2-AC2-10 bắt được lỗi này trên
  Chromium thật.
- Thay thế: chỉ đổi thứ tự (`src` rồi `playbackRate`) mà không đặt `defaultPlaybackRate` — đủ cho lần phát hiện tại, nhưng
  dựa vào việc không có load nào khác chen vào; đặt cả hai không tốn gì thêm.

### Bảng import (kiểm CLAUDE.md §2, không nhánh ❌)

| File | Import | Hợp lệ |
|---|---|---|
| `pages/settings/containers/SettingsContainer.tsx` | `../hooks/useSettings`, `../components/*`, `@core/constants/app.constants`, `react-router-dom` | container → hook, components |
| `pages/settings/hooks/useSettings.ts` | `@shared/services/progress.service`, `@shared/models/settings.model`, `@csk/shared` (type) | hook → service |
| `pages/settings/components/*` | `@csk/shared` (`DAILY_GOAL_OPTIONS`, `AUDIO_SPEED_OPTIONS`, type), `react-i18next` | không service |
| `pages/lesson/hooks/useLessonPreferences.ts` | `@shared/services/progress.service`, `@shared/models/settings.model` | hook → service |
| `pages/lesson/containers/LessonRunnerContainer.tsx` | `@shared/contexts/PinyinVisibilityContext`, `../hooks/useLessonPreferences` | không gọi service trực tiếp |
| `shared/components/exercises/SpeakExercise.tsx` | `../../contexts/usePinyinVisibility` | context, không service |
| `shared/contexts/*` | `react` | không service |
| `shared/services/progress.service.ts` | `@csk/shared`, `@core/services/progress-store.service`, `@shared/models/settings.model` | không React, không Dexie |
| `core/services/progress-store.service.ts` | `@csk/shared`, `@core/helpers/db.helper` | không đổi hướng |
| `core/services/audio.service.ts` | không thêm import (chỉ đổi thứ tự gán, D7) | hạ tầng, không React |

### Dữ liệu ngoài cần Zod

| Nguồn | Schema |
|---|---|
| Bảng `settings` (IndexedDB) | `settingsSchema` qua `parseSettings` (thêm `defaultAudioSpeed`, `isPinyinVisible`, mỗi field `.catch`) |
| Giá trị từ radio/checkbox | Không phải dữ liệu ngoài (giá trị lấy từ hằng `as const`); vẫn kiểm bằng rule Phần 2 trong use case |

Không có URL param, localStorage hay JSON nội dung mới.

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Thứ tự gán `src` / tốc độ (audio giả reset tốc độ khi gán `src`) | `core/services` | `apps/web/src/app/core/services/audio.service.test.ts` |
| Schema 2 field mới, rơi về mặc định từng field | `packages/shared` | `packages/shared/src/progress.schema.test.ts` |
| Ghi từng khóa (bỏ khóa `undefined`), đọc lại sau "mở lại app", khóa hỏng | `core/services` | `apps/web/src/app/core/services/progress-store.settings.test.ts` |
| Rule + use case cài đặt | `shared/services` (Phần 2 thuần; Phần 3 + fake-indexeddb, store stub cho lỗi) | `apps/web/src/app/shared/services/progress.service.settings.test.ts` |
| `initialIsSlow` | context | `apps/web/src/app/shared/contexts/AudioSpeedContext.test.tsx` |
| Pinyin ở câu "nói" (thường, đọc to, giải thích) | component | `apps/web/src/app/shared/components/exercises/SpeakExercise.pinyin.test.tsx` |
| Pinyin vẫn hiện ở chọn thanh / cặp âm / gõ pinyin khi tắt | component | `apps/web/src/app/shared/components/exercises/PinyinHidden.otherKinds.test.tsx` |
| Màn học theo Cài đặt (Nghe chậm, pinyin, đọc lỗi) | container | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.preferences.test.tsx` |
| Liên kết "Cài đặt" trên Lộ trình, quay về | route thật | `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.settingsLink.test.tsx` |
| Màn Cài đặt: nhóm, giá trị, bàn phím, lưu, mở lại | container | `apps/web/src/app/pages/settings/containers/SettingsContainer.test.tsx` |
| Lỗi lưu, lỗi lặp lại, giá trị hỏng, không đọc được | container | `apps/web/src/app/pages/settings/containers/SettingsContainer.errors.test.tsx` |
| Luồng thật | e2e | `apps/web/e2e/E8/s8.2-settings.spec.ts`, `s8.2-settings-errors.spec.ts`, `s8.2-settings-lesson.spec.ts` |

- Vitest "đóng app rồi mở lại": `unmount()` rồi render lại (service mới đọc lại cùng DB fake-indexeddb); tầng store: hai
  `DexieProgressStore` trên cùng tên DB ngẫu nhiên.
- Vitest lỗi ghi/đọc: `vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(new Error('quota'))` /
  `vi.spyOn(progressStore, 'getSettings').mockRejectedValue(…)`; giá trị hỏng: ghi thẳng `db.settings.put({ key:
  'defaultAudioSpeed', value: 'fast' })`.
- E2E helper mới `apps/web/e2e/E8/settings.helpers.ts`:
  - `openSettingsFromPath(page)`, locator `goalRadio(page, minutes)`, `speedRadio(page, 'Bình thường (1x)' | 'Chậm (0.75x)')`,
    `pinyinSwitch(page)`, `saveErrorAlert(page)`.
  - `breakSettingsWrites(page)` / `restoreSettingsWrites(page)` / `breakSettingsReads(page)`: bọc `IDBDatabase.prototype.
    transaction` để throw `DOMException('…', 'UnknownError')` khi phạm vi có `settings` và mode tương ứng (`readwrite` cho ghi,
    `readonly` cho đọc). Cài bằng `page.evaluate` (trang hiện tại) **và** `page.addInitScript` đọc cờ từ `sessionStorage` (qua
    được reload). Đoạn script tương đương ghi vào mô tả PR cho QA (test-cases "Điều kiện đầu").
  - Giá trị hỏng: `seedProgress(page, { settings: { defaultAudioSpeed: 'fast' } })` của `home.helpers.ts`.
  - Tới câu cần thử bằng tiến độ dựng sẵn: `intro-01` hoàn thành + `intro-02` `{ status: 'in-progress', cursor: 7 }` → mở
    `intro-02` từ Lộ trình vào thẳng câu "nói" 你好！ (S3.3 nối lại câu dở); `cursor: 2` cho câu gõ pinyin; `intro-01` `cursor: 9`
    cho câu phân biệt cặp âm.
  - Tốc độ phát: mở rộng `AudioPlayRecord` trong `e2e/E7/intro-lessons.helpers.ts` thêm `playbackRate: number | null`, ghi
    `this.playbackRate` khi phát đã bắt đầu (trong `then` của `play`, cùng chỗ ghi `duration`) — đọc lúc gọi `play` sẽ không
    phản ánh tốc độ thật nếu thuật toán load còn chạy (D7). Không ghi âm được: `addInitScript` cho `navigator.mediaDevices.getUserMedia`
    reject `NotAllowedError`.

## Risks / Trade-offs

- [Màn học chờ thêm một lần đọc IndexedDB trước khi hiện câu đầu] → đọc song song với nạp bài (hai effect độc lập), thường xong
  trước nội dung; chấp nhận vài ms "Đang mở bài…".
- [Lưu lạc quan: radio đổi ngay rồi bật về khi lỗi] → spec yêu cầu "về giá trị cũ" và có thông báo `role="alert"`; trả về giá
  trị đã lưu chắc chắn (`persistedRef`) chứ không phải giá trị hiển thị trước đó.
- [Hai lần đổi nhanh cùng field, lần đầu lỗi sau khi lần sau đã gửi] → chỉ lần đổi mới nhất của field được quyền trả giá trị về
  (`latestRequestRef`); lỗi vẫn hiện thông báo.
- [Đổi kiểu `saveSettings` thành `Partial<Settings>` làm lỏng kiểu cho `completeOnboarding`] → `completeOnboarding` vẫn truyền
  object đủ; test cũ `progress.service.test.ts` (`toHaveBeenCalledWith`) giữ để khóa hành vi.
- [Test cũ so `toEqual` cả object settings] → `progress.schema.test.ts` "keeps valid stored values" và các so sánh
  `DEFAULT_SETTINGS`/`saveSettings` trong `progress.service.test.ts`, `progress-store.service.test.ts` cập nhật thêm 2 field
  trong commit GREEN của task 1.2 (kỳ vọng mới theo D1, không đổi hành vi cũ).
- [Sửa `audio.service` (D7) đổi hành vi "Nghe chậm" của S4.4 trên trình duyệt thật: trước đây phát 1x dù bật] → đúng Scenario
  S4.4-AC2 "Bật Nghe chậm thì phát 0.75x" vốn đã có; test cũ dùng rate 1 không đổi; e2e mới đọc tốc độ thật để khóa hành vi.
- [Bọc `IDBDatabase.prototype.transaction` trong e2e phụ thuộc cách Dexie mở transaction] → Dexie gọi `idbdb.transaction` cho
  mỗi thao tác ngoài transaction tường minh; test e2e kiểm cả nhánh "đọc được bình thường" sau khi `restore` để phát hiện helper
  hỏng.
- [test-cases.md mô tả bài "Bốn thanh điệu" 7 câu, không còn khớp nội dung build 12 bài] → e2e dùng `intro-01`/`intro-02` với
  cùng chữ "你好！"/"nǐ hǎo!"/"Xin chào!"; báo điều phối để QA cập nhật test-cases qua PR spec (không sửa trong PR code).

## Migration Plan

- Không đổi phiên bản DB; hai khóa mới chỉ xuất hiện khi người học đổi lần đầu. Máy cũ đọc ra mặc định (1x, hiện pinyin).
- Rollback: revert PR. Bản cũ `settingsSchema` (`z.object`) bỏ qua hai khóa lạ, đọc vẫn đúng.
- Sao lưu (S8.5) cần mang theo hai khóa mới: ghi chú trong `docs/03-architecture.md` §6.2 (task 10.1).

## Open Questions

- [x] Chữ chưa có trong spec (tiêu đề "Cài đặt", liên kết "Về lộ trình", "Bật"/"Tắt", câu đang tải) → dùng bảng D6; đổi sau chỉ
  sửa i18n và chuỗi kỳ vọng trong test. Ghi tên các nút/nhãn vào mô tả PR cho QA (task 10.5).
