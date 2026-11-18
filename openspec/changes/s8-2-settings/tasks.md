# Tasks: S8.2 Cài đặt

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ`). Tên file, hàm, route,
field, chữ: design D1–D6.
RED cần type/method/file chưa có thì tạo skeleton **không có hành vi** trong cùng commit `test(...)` (method `throw new
Error('Chưa làm')` hoặc trả hằng mặc định cũ; typecheck sạch, test fail ở assertion).
RED nào pass ngay (hành vi cũ đã đúng, hoặc nhờ GREEN trước) thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại;
ghi cách đảo trong commit `test(...)`.
Scenario cũ không đổi hành vi (Requirement bị MODIFIED nhưng Scenario giữ nguyên) có test sẵn: một task "Hồi quy" chạy lại
test đó, không có cặp RED/GREEN.

Vitest: `pnpm --filter @csk/web test:run <mẫu>` (`pnpm --filter @csk/shared test:run <mẫu>` cho schema). DB: `createDatabase(
DB_NAME)` dùng chung, xoá bảng `settings`/`lessonProgress` ở `beforeEach`; giả lỗi: `vi.spyOn(progressStore, 'saveSettings' |
'getSettings')`; "đóng app rồi mở lại": `unmount()` rồi render lại.

## 0. Hạ tầng audio — `core/services/audio.service.ts` (design D7)

Làm trước mọi task kiểm tốc độ phát (5.1, 5.3, 5.5, 5.7, 9.7). Test: `apps/web/src/app/core/services/audio.service.test.ts` (sửa
`FakeAudio` có sẵn, thêm case).

- [x] 0.1 RED: S4.4-AC2 "Bật Nghe chậm thì phát 0.75x" (tầng `core/services`, lỗi có từ S4.4) — `FakeAudio` thêm `defaultPlaybackRate = 1`, `src` thành getter/setter: setter đặt `playbackRate = this.defaultPlaybackRate` và `currentTime = 0` như thuật toán load của trình duyệt; case mới `service.play('/audio/….mp3', PLAYBACK_RATES.slow)` → lúc `play()` được gọi (ghi trong `FakeAudio.play`) và sau đó `audio.playbackRate` là `0.75`; gọi `play` lần hai cùng `src` với `0.75` → vẫn `0.75`; rồi `play(…, 1)` → `1`; case S4.4-AC1 cũ (rate 1) giữ kỳ vọng; kiểm: fail vì đọc được `1` thay vì `0.75` (code hiện gán `playbackRate` trước `src`)
- [x] 0.2 GREEN: `AudioService.play` gán `audio.src = src` trước, rồi `currentTime = 0`, `defaultPlaybackRate = rate`, `playbackRate = rate`, rồi `play()`; kiểm: test 0.1 pass, `audio.service.test.ts`, `useAudioPlayer.test.ts`, `LessonRunnerContainer.audio.test.tsx`, `SlowToggle.test.tsx` cũ pass

## 1. Dữ liệu — `@csk/shared` + `core/services/progress-store.service.ts` (design D1, D2)

Test: `packages/shared/src/progress.schema.test.ts` (schema), `apps/web/src/app/core/services/progress-store.settings.test.ts`
(store, DB tên ngẫu nhiên `createDatabase('test-…')` như `progress-store.service.test.ts`).

- [x] 1.1 RED: S8.2-AC2 "Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định" (schema) — `parseSettings({})` có `defaultAudioSpeed: 'normal'`, `isPinyinVisible: true`; `parseSettings({ dailyGoalMinutes: 60, isPinyinVisible: false, defaultAudioSpeed: 'fast', hasCompletedOnboarding: true })` → `defaultAudioSpeed: 'normal'`, các field khác giữ; `'slow'` hợp lệ giữ nguyên; test chỉ dùng `toEqual` nên không cần skeleton; kiểm: fail vì kết quả thiếu hai field
- [x] 1.2 GREEN: `AUDIO_SPEED_OPTIONS`, `audioSpeedSchema`, `type AudioSpeed`; `Settings`, `DEFAULT_SETTINGS`, `settingsSchema` thêm `defaultAudioSpeed` (`.catch('normal')`), `isPinyinVisible` (`.catch(true)`); export từ `@csk/shared`; cập nhật kỳ vọng cũ so cả object (`progress.schema.test.ts` "keeps valid stored values", `progress-store.service.test.ts` dòng 25, `progress.service.test.ts` `toHaveBeenCalledWith` dòng 203) thêm hai field mặc định; kiểm: test 1.1 pass, `pnpm typecheck` sạch, test cũ pass
- [x] 1.3 RED: S8.2-AC1 "Mục tiêu đã lưu bị hỏng thì về 15 phút" (schema) — `{ dailyGoalMinutes: 'abc' | 45, defaultAudioSpeed: 'slow' }` → `15` và `'slow'`; kiểm: chạy, nếu pass ngay (`.catch` của mục tiêu có từ S1.3) thì tạm bỏ `.catch` của `dailyGoalMinutes` để thấy fail rồi trả lại
- [x] 1.4 GREEN: sửa đến khi pass; kiểm: test 1.3 pass
- [x] 1.5 RED: S8.2-AC3 "Tùy chọn pinyin đã lưu bị hỏng thì về bật" (schema) — `{ dailyGoalMinutes: 30, isPinyinVisible: 'yes' | 0 | null }` → `true` và `30`; kiểm: chạy, nếu pass ngay nhờ 1.2 thì tạm đổi `.catch(true)` thành `.catch(false)` để thấy fail rồi trả lại
- [x] 1.6 GREEN: sửa đến khi pass; kiểm: test 1.5 pass
- [x] 1.7 RED: S8.2-AC1 "Đổi mục tiêu không hiện lại onboarding" (tầng store: ghi một khóa) — DB có `{ hasCompletedOnboarding: true, dailyGoalMinutes: 30, defaultAudioSpeed: 'slow', isPinyinVisible: false }`; store A `saveSettings({ dailyGoalMinutes: 60 })`; store B mới cùng tên DB `getSettings()` → `60`, `hasCompletedOnboarding: true`, `'slow'`, `false`; case khóa `undefined`: store A `saveSettings({ dailyGoalMinutes: 15, isPinyinVisible: undefined })` → store B đọc `15` và `isPinyinVisible: false` (không bị ghi đè thành mặc định `true`), bảng `settings` không có dòng `value: undefined`; kiểm: case khóa `undefined` fail (thân hiện tại ghi `{ key: 'isPinyinVisible', value: undefined }`); case một khóa nếu pass ngay (thân `saveSettings` đã chỉ ghi khóa được truyền) thì tạm cho `saveSettings` ghi `{ ...DEFAULT_SETTINGS, ...patch }` để thấy fail rồi trả lại
- [x] 1.8 GREEN: `saveSettings(patch: Partial<Settings>)` trong interface `ProgressStore` và `DexieProgressStore`; thân lọc bỏ entry có giá trị `undefined` trước `bulkPut` (không còn entry thì không ghi); doc comment "chỉ ghi các khóa có trong `patch` với giá trị khác `undefined`"; kiểm: test 1.7 pass, `pnpm typecheck` sạch (stub viết tay trong `lesson.service.test.ts`, `progress.service*.test.ts` không phải sửa)

## 2. Quy tắc + use case — `ProgressService` Phần 1–3, `shared/models/settings.model.ts` (design D3)

Test: `apps/web/src/app/shared/services/progress.service.settings.test.ts` — Phần 2 hàm thuần; Phần 3 `new ProgressService(new
DexieProgressStore(createDatabase('test-…')))` (fake-indexeddb), store stub reject cho nhánh lỗi.

- [x] 2.1 RED: S8.2-AC1 "Đổi mục tiêu không hiện lại onboarding" (Phần 3) — DB đã xong onboarding, mục tiêu 30: `changeDailyGoal(60)` → `needsOnboarding()` `false`, `getLearningPreferences().dailyGoalMinutes` `60`; `changeDailyGoal(45)` reject `'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.'` và không ghi; store stub `getSettings` reject + `saveSettings` spy: `changeDailyGoal(30)` gọi `saveSettings` đúng `{ dailyGoalMinutes: 30 }` (không kèm `hasCompletedOnboarding`); skeleton model `LearningPreferences`, `LessonPreferences` và các method `throw new Error('Chưa làm')`; kiểm: fail vì skeleton throw
- [x] 2.2 GREEN: Phần 1 `writeSettings(patch)`; Phần 3 `changeDailyGoal` (rule `isValidDailyGoal`, ghi một khóa), `getLearningPreferences` (đọc lỗi → `DEFAULT_SETTINGS`, không throw); kiểm: test 2.1 pass, `progress.service.test.ts` cũ pass
- [x] 2.3 RED: S8.2-AC2 "Tốc độ mặc định giữ sau khi mở lại app" (Phần 2 + 3) — `isValidAudioSpeed` bảng: `'normal'`, `'slow'` true; `'fast'`, `''`, `'0.75'` false; `changeDefaultAudioSpeed('slow')` rồi service mới trên store mới cùng tên DB → `defaultAudioSpeed: 'slow'`; `changeDefaultAudioSpeed('fast')` reject `'Tốc độ audio mặc định phải là bình thường hoặc chậm.'`; kiểm: fail vì skeleton
- [x] 2.4 GREEN: `isValidAudioSpeed` (Phần 2, `Rule:`), `changeDefaultAudioSpeed` (Phần 3); kiểm: test 2.3 pass
- [x] 2.5 RED: S8.2-AC3 "Tùy chọn pinyin giữ sau khi mở lại app" (Phần 3) — `changePinyinVisibility(false)` rồi service/store mới → `isPinyinVisible: false`; bật lại → `true`; kiểm: fail vì skeleton
- [x] 2.6 GREEN: `changePinyinVisibility`; kiểm: test 2.5 pass
- [x] 2.7 RED: S8.2-AC2 "Chọn Chậm thì mở bài là phát chậm" (Phần 2 + 3) — `toLessonPreferences` bảng: `'normal'` → `isSlowAudio: false`, `'slow'` → `true`; `isPinyinVisible` truyền nguyên; sau `changeDefaultAudioSpeed('slow')` thì `getLessonPreferences()` → `{ isSlowAudio: true, isPinyinVisible: true }`; kiểm: fail vì skeleton
- [x] 2.8 GREEN: `toLessonPreferences` (Phần 2, `Rule:`), `getLessonPreferences` (Phần 3); kiểm: test 2.7 pass
- [x] 2.9 RED: S8.2-AC2 "Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin" (Phần 3) — store stub `getSettings` reject: `getLessonPreferences()` → `{ isSlowAudio: false, isPinyinVisible: true }`, `getLearningPreferences()` → `{ 15, 'normal', true }`, cả hai không reject; kiểm: fail ở `getLessonPreferences` (chưa `.catch`)
- [x] 2.10 GREEN: `.catch` → `toLessonPreferences(DEFAULT_SETTINGS)`; kiểm: test 2.9 pass, mọi rule mới có `Rule:`, `progress.service.ts` < 300 dòng

## 3. Context — `shared/contexts/` (design D5)

Test: `apps/web/src/app/shared/contexts/AudioSpeedContext.test.tsx` (thêm case), `apps/web/src/app/shared/contexts/PinyinVisibilityContext.test.tsx`.

- [x] 3.1 RED: S8.2-AC2 "Mở bài mới thì theo tốc độ mặc định Chậm" (tầng context) — `<AudioSpeedProvider initialIsSlow>`: `isSlow` true; `toggleSlow` → false; render lại provider với `key` khác → true lại; không truyền prop → false (S4.4 cũ); skeleton: prop khai báo nhưng chưa dùng; kiểm: fail ở `isSlow` true
- [x] 3.2 GREEN: `useState(initialIsSlow)`, mặc định `false`; kiểm: test 3.1 pass, `AudioSpeedContext.test.tsx` và `SlowToggle.test.tsx` cũ pass
- [x] 3.3 RED: S8.2-AC3 "Tắt pinyin thì câu nói không hiện pinyin" (tầng context) — `usePinyinVisibility()` ngoài provider `true`; trong `<PinyinVisibilityProvider isVisible={false}>` → `false`; skeleton hai file, hook luôn trả `true`; kiểm: fail ở case `false`
- [x] 3.4 GREEN: `PinyinVisibilityContext = createContext<boolean>(true)`, provider truyền `isVisible`; kiểm: test 3.3 pass

## 4. Pinyin ở dạng bài — `shared/components/exercises/` (design D5)

Test: `apps/web/src/app/shared/components/exercises/SpeakExercise.pinyin.test.tsx` (mẫu render của `SpeakExercise.test.tsx`,
helper mic bị chặn của `SpeakExercise.no-mic.test.tsx`), `apps/web/src/app/shared/components/exercises/PinyinHidden.otherKinds.test.tsx`.

- [x] 4.1 RED: S8.2-AC3 "Câu nói khi tắt pinyin" (speak-rating) — `PinyinVisibilityProvider isVisible={false}`, câu "nói" theo `wordId` và theo `sentenceId`: hiện chữ Hán và nghĩa, `queryByText(pinyin)` null, có ba nút "Chưa đúng", "Gần đúng", "Đúng"; kiểm: fail vì pinyin vẫn hiện
- [x] 4.2 GREEN: `SpeakExercise` đọc `usePinyinVisibility()`, chỉ render dòng pinyin khi `true` (thêm `lang="zh-Latn-pinyin"`); kiểm: test 4.1 pass
- [x] 4.3 RED: S5.2-AC1 "Câu nói hiện nội dung để đọc và 3 mức" (speak-rating, Scenario sửa: "Hiện pinyin" đang bật) — trong provider `isVisible` true: hiện chữ Hán, pinyin, nghĩa và ba nút; kiểm: chạy, nếu pass ngay thì tạm luôn ẩn pinyin để thấy fail rồi trả lại
- [x] 4.4 GREEN: sửa đến khi pass; kiểm: test 4.3 pass, `SpeakExercise.test.tsx` cũ (không provider → mặc định hiện) pass
- [x] 4.5 RED: S8.2-AC3 "Đọc to rồi tự chấm khi tắt pinyin" (speak-no-mic) — mic bị chặn, bấm "Ghi âm" → chế độ đọc to; provider `false`: hiện chữ Hán và nghĩa, không pinyin; "Nghe mẫu" bấm được; kiểm: chạy, nếu pass ngay nhờ 4.2 thì tạm chỉ ẩn pinyin khi `!isReadAloud` để thấy fail rồi trả lại
- [x] 4.6 GREEN: sửa đến khi pass; kiểm: test 4.5 pass
- [x] 4.7 RED: S5.4-AC2 "Vẫn nghe mẫu và thấy chữ để đọc" (speak-no-mic, Scenario sửa: "Hiện pinyin" đang bật) — provider `true`, chế độ đọc to: "Nghe mẫu" bấm được, hiện chữ Hán, pinyin, nghĩa; kiểm: chạy, nếu pass ngay thì tạm ẩn pinyin khi `isReadAloud` để thấy fail rồi trả lại
- [x] 4.8 GREEN: sửa đến khi pass; kiểm: test 4.7 pass
- [x] 4.9 RED: S8.2-AC3 "Tắt pinyin vẫn hiện pinyin trong giải thích khi sai" (tầng component) — provider `false`, bấm "Chưa đúng" → `onResult` nhận `explanation` chứa chữ Hán, pinyin và nghĩa; kiểm: chạy, nếu pass ngay thì tạm bỏ pinyin khỏi `explanation` khi tắt để thấy fail rồi trả lại
- [x] 4.10 GREEN: sửa đến khi pass; kiểm: test 4.9 pass
- [x] 4.11 RED: S8.2-AC3 "Tắt pinyin vẫn giữ pinyin của lựa chọn và đáp án" (tầng component) — provider `false`: `SoundPairExercise` (四/十) có hai lựa chọn ghi "sì", "shí"; `ToneChoiceExercise` (八) sau khi chọn hiện thanh đúng kèm "bā"; kiểm: chạy, nếu pass ngay (hai component không đọc context) thì tạm cho chúng ẩn pinyin theo `usePinyinVisibility()` để thấy fail rồi trả lại
- [x] 4.12 GREEN: không đổi `SoundPairExercise`, `ToneChoiceExercise`; kiểm: test 4.11 pass
- [x] 4.13 RED: S8.2-AC3 "Tắt pinyin vẫn gõ pinyin được" (tầng component) — provider `false`: `PinyinTypeExercise` gõ "ni3" → ô gõ hiện "nǐ"; sau "Kiểm tra" phần so sánh hiện pinyin; kiểm: như 4.11
- [x] 4.14 GREEN: không đổi `PinyinTypeExercise`; kiểm: test 4.13 pass
- [x] 4.15 Hồi quy speak-rating và speak-no-mic (Scenario giữ nguyên): S5.2-AC1 "Chưa chọn mức thì chưa chấm", "Chọn mức mà chưa ghi âm", "Chọn mức thì câu được chấm ngay", "Đã chọn thì không đổi được", "Mức đã chọn được báo bằng chữ", "Chọn bằng bàn phím"; S5.4-AC2 "Chuyển chế độ khi không ghi âm được", "Vẫn tự đánh giá và tính điểm", "Chọn Chưa đúng thì tính sai như thường", "Giữ chế độ cho các câu nói sau trong bài", "Thử lại ghi âm thì quay về chế độ ghi âm", "Mở bài mới thì kiểm tra lại mic"; kiểm: `pnpm --filter @csk/web test:run SpeakExercise` pass, không sửa kỳ vọng cũ

## 5. Màn học theo Cài đặt — `pages/lesson/hooks/useLessonPreferences.ts` + `LessonRunnerContainer` (design D5)

Test: `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.preferences.test.tsx` — mẫu `LessonRunnerContainer.audio.test.tsx`
(`mockContentFetch`, `fakeAudio`), settings ghi thẳng bằng `new DexieProgressStore(db).saveSettings(…)`.

- [x] 5.1 RED: S8.2-AC2 "Chọn Chậm thì mở bài là phát chậm" (container) — settings `defaultAudioSpeed: 'slow'`: mở bài → công tắc "Nghe chậm" `aria-checked="true"` ở câu 1; bấm "Nghe" → `playbackRate` 0.75 (`fakeAudio` của test này là field thường; tốc độ thật trên trình duyệt khóa ở 0.1 và e2e 9.7); skeleton `useLessonPreferences` trả hằng `{ isSlowAudio: false, isPinyinVisible: true }`; kiểm: fail ở `aria-checked`
- [x] 5.2 GREEN: `useLessonPreferences(lessonId)` (gọi `getLessonPreferences`, lưu `{ lessonId, preferences }`, derive `null` khi khác bài); container chỉ render runner khi có `preferences`, truyền `initialIsSlow`; kiểm: test 5.1 pass, `LessonRunnerContainer*.test.tsx` và `PlacementTestContainer*.test.tsx` cũ pass
- [x] 5.3 RED: S8.2-AC2 "Mở bài mới thì theo tốc độ mặc định Chậm" (audio-replay, container) — settings `'slow'`: tắt "Nghe chậm" rồi (a) unmount và mở lại chính bài, (b) lưu tiến độ `cursor: 1` rồi mở lại (học tiếp ở câu 2), (c) bấm liên kết sang bài khác trên cùng route (mẫu test dòng 654 `LessonRunnerContainer.test.tsx`) → công tắc bật, "Nghe" phát 0.75; kiểm: fail ở nhánh (c) nếu hook chưa đọc lại theo `lessonId` (nếu pass ngay thì tạm cho effect chỉ chạy một lần để thấy fail rồi trả lại)
- [x] 5.4 GREEN: sửa đến khi pass (effect deps `[service, lessonId]`); kiểm: test 5.3 pass
- [x] 5.5 RED: S4.4-AC2 "Mở bài mới thì về tốc độ thường" (audio-replay, Scenario sửa) — settings `'normal'`: bật "Nghe chậm" rồi ba nhánh (a)(b)(c) như 5.3 → công tắc tắt; kiểm: chạy, nếu pass ngay thì tạm truyền `initialIsSlow={true}` để thấy fail rồi trả lại
- [x] 5.6 GREEN: sửa đến khi pass; kiểm: test 5.5 pass, test dòng 654 cũ pass
- [x] 5.7 RED: S4.4-AC2 "Mặc định phát tốc độ thường" (audio-replay, Scenario sửa) — settings `'normal'` (và DB trống): công tắc tắt, "Nghe" phát 1x; kiểm: như 5.5
- [x] 5.8 GREEN: sửa đến khi pass; kiểm: test 5.7 pass
- [x] 5.9 RED: S8.2-AC2 "Tắt Nghe chậm trong bài không đổi Cài đặt" (container) — settings `'slow'`, tắt "Nghe chậm" trong bài → `getSettings()` của store vẫn `'slow'`, spy `saveSettings` không được gọi; kiểm: chạy, nếu pass ngay thì tạm cho `AudioSpeedProvider.toggleSlow` ghi `progressStore.saveSettings({ defaultAudioSpeed })` để thấy fail rồi trả lại (không commit thay đổi tạm)
- [x] 5.10 GREEN: sửa đến khi pass; kiểm: test 5.9 pass
- [x] 5.11 RED: S8.2-AC3 "Tắt pinyin thì câu nói không hiện pinyin" (container) — settings `isPinyinVisible: false`, bài có câu "nói" 你好 (`sentenceOf('s-nihao')`): hiện "你好" và nghĩa, không "nǐ hǎo"; kiểm: fail vì container chưa bọc `PinyinVisibilityProvider`
- [x] 5.12 GREEN: bọc `<PinyinVisibilityProvider isVisible={preferences.isPinyinVisible}>`; kiểm: test 5.11 pass
- [x] 5.13 RED: S8.2-AC3 "Bật lại pinyin thì câu nói hiện pinyin" (container) — settings tắt rồi `changePinyinVisibility(true)` qua `ProgressService`, mở bài → hiện "你好", "nǐ hǎo", nghĩa; kiểm: chạy, nếu pass ngay thì tạm truyền `isVisible={false}` cố định để thấy fail rồi trả lại
- [x] 5.14 GREEN: sửa đến khi pass; kiểm: test 5.13 pass
- [x] 5.15 RED: S8.2-AC3 "Tắt pinyin vẫn hiện pinyin trong giải thích khi sai" (container) — settings tắt, ở câu "nói" bấm "Chưa đúng" → phần giải thích của runner hiện chữ, pinyin, nghĩa; kiểm: như 4.9
- [x] 5.16 GREEN: sửa đến khi pass; kiểm: test 5.15 pass
- [x] 5.17 RED: S8.2-AC2 "Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin" (container) — DB có `'slow'` + tắt pinyin nhưng `vi.spyOn(progressStore, 'getSettings').mockRejectedValue(…)`: bài mở, công tắc tắt, câu "nói" hiện "你好", "nǐ hǎo", nghĩa, không có `role="alert"`; kiểm: chạy, nếu pass ngay nhờ 2.10 thì tạm cho hook giữ `null` khi lỗi để thấy fail (bài kẹt "Đang mở bài…") rồi trả lại
- [x] 5.18 GREEN: sửa đến khi pass; kiểm: test 5.17 pass, `LessonRunnerContainer.tsx` < 300 dòng
- [x] 5.19 Hồi quy audio-replay (Scenario giữ nguyên): S4.4-AC2 "Bật Nghe chậm thì phát 0.75x", "Tắt Nghe chậm thì về tốc độ thường", "Nghe chậm giữ qua các câu trong bài"; kiểm: `pnpm --filter @csk/web test:run SlowToggle AudioSpeedContext LessonRunnerContainer` pass, không sửa kỳ vọng cũ

## 6. Route + liên kết từ Lộ trình — `pages/settings/settings.routes.ts`, `LearningPathContainer` (design D4, D6)

Test: `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.settingsLink.test.tsx` — router bộ nhớ dựng từ
`pageRoutes` thật (mẫu `src/test/stroke-order-route.tsx`), fetch nội dung giả như `LearningPathContainer.homeLink.test.tsx`.

- [x] 6.1 RED: S8.2-AC1 "Mở Cài đặt từ màn Lộ trình" — ở `/learning-paths` bấm liên kết "Cài đặt" → heading "Cài đặt"; có ba `role="group"` tên "Mục tiêu mỗi ngày", "Tốc độ audio mặc định", "Hiện pinyin", mỗi nhóm có một lựa chọn đang chọn/bật; tạo `settings.json` (D6) và thêm namespace vào `src/test/i18n.ts` trong commit test; kiểm: fail vì chưa có liên kết
- [x] 6.2 GREEN: `ROUTE_PATHS.settings`, `settings.routes.ts` (lazy), gom vào `page.routes.ts`; liên kết "Cài đặt" trong `<nav>` trên Lộ trình; `I18N_NAMESPACES` thêm `settings`; `SettingsContainer` + `useSettings` (nạp `getLearningPreferences`) + ba component (D4); kiểm: test 6.1 pass, `LearningPathContainer*.test.tsx` cũ pass
- [x] 6.3 RED: S8.2-AC1 "Quay về Lộ trình" — ở `/settings` bấm "Về lộ trình" → heading "Lộ trình học", URL `/learning-paths`; kiểm: chạy, nếu pass ngay nhờ 6.2 thì tạm trỏ liên kết về `ROUTE_PATHS.home` để thấy fail rồi trả lại
- [x] 6.4 GREEN: sửa đến khi pass; kiểm: test 6.3 pass

## 7. Màn Cài đặt: giá trị, lưu, bàn phím — `pages/settings/` (design D4)

Test: `apps/web/src/app/pages/settings/containers/SettingsContainer.test.tsx` — `renderWithProviders(<SettingsContainer />, { route: '/settings' })`,
DB mặc định fake-indexeddb.

- [x] 7.1 RED: S8.2-AC1 "Hiện mục tiêu đã chọn ở onboarding" — DB mục tiêu 30 (ghi qua `completeOnboarding(30)`): nhóm "Mục tiêu mỗi ngày" có đúng ba radio "15 phút", "30 phút", "60 phút", "30 phút" checked; kiểm: chạy, nếu pass ngay nhờ 6.2 thì tạm cho hook bỏ qua giá trị đọc được (luôn mặc định) để thấy fail rồi trả lại
- [x] 7.2 GREEN: sửa đến khi pass; kiểm: test 7.1 pass
- [x] 7.3 RED: S8.2-AC2 "Mặc định ban đầu là tốc độ thường" — DB trống: nhóm "Tốc độ audio mặc định" có hai radio "Bình thường (1x)", "Chậm (0.75x)", "Bình thường (1x)" checked; kiểm: như 7.1
- [x] 7.4 GREEN: sửa đến khi pass; kiểm: test 7.3 pass
- [x] 7.5 RED: S8.2-AC3 "Mặc định hiện pinyin" — DB trống: `getByRole('switch', { name: 'Hiện pinyin' })` checked và chữ "Bật" nhìn thấy trong nhóm; tắt → chữ "Tắt"; kiểm: fail nếu chưa có chữ trạng thái
- [x] 7.6 GREEN: `PinyinVisibilitySetting` chữ "Bật"/"Tắt" theo giá trị; kiểm: test 7.5 pass
- [x] 7.7 RED: S8.2-AC1 "Đổi mục tiêu thì giữ sau khi mở lại app" — chọn "60 phút" → checked ngay; không có nút "Lưu"; `unmount()` rồi render lại → "60 phút" checked; kiểm: fail vì `changeDailyGoal` của hook chưa làm (skeleton no-op)
- [x] 7.8 GREEN: `useSettings.applyChange` (lạc quan, gọi `changeDailyGoal`, cập nhật `persistedRef` khi xong); kiểm: test 7.7 pass
- [x] 7.9 RED: S8.2-AC2 "Tốc độ mặc định giữ sau khi mở lại app" — chọn "Chậm (0.75x)", render lại → checked; kiểm: fail vì skeleton
- [x] 7.10 GREEN: `changeDefaultAudioSpeed` qua `applyChange`; kiểm: test 7.9 pass
- [x] 7.11 RED: S8.2-AC3 "Tùy chọn pinyin giữ sau khi mở lại app" — tắt "Hiện pinyin", render lại → không checked; kiểm: fail vì skeleton
- [x] 7.12 GREEN: `changePinyinVisibility` qua `applyChange`; kiểm: test 7.11 pass
- [ ] 7.13 RED: S8.2-AC1 "Đổi mục tiêu không hiện lại onboarding" (route thật như nhóm 6) — đã xong onboarding, ở `/settings` chọn "60 phút", mở `/` → URL `/home`, không có heading/nút "Bắt đầu" của onboarding; kiểm: chạy, nếu pass ngay nhờ 1.8/2.2 thì tạm cho `changeDailyGoal` ghi `{ ...DEFAULT_SETTINGS, dailyGoalMinutes }` để thấy fail rồi trả lại
- [ ] 7.14 GREEN: sửa đến khi pass; kiểm: test 7.13 pass
- [ ] 7.15 RED: S8.2-AC1 "Đổi lựa chọn bằng bàn phím" — chỉ `user.tab()`, `user.keyboard('{ArrowDown}')`, `user.keyboard(' ')`: Tab tới nhóm mục tiêu, mũi tên chọn "60 phút"; Tab tới nhóm tốc độ, mũi tên chọn "Chậm (0.75x)"; Tab tới công tắc, Space tắt; `document.activeElement` đúng ô ở mỗi bước; kết quả lưu như 7.7–7.11 (viền focus nhìn thấy kiểm ở e2e 9.3); kiểm: chạy, nếu pass ngay (radio/checkbox gốc) thì tạm thêm `tabIndex={-1}` cho công tắc để thấy fail rồi trả lại
- [ ] 7.16 GREEN: sửa đến khi pass; style `_settings.css` (`.settings-option:focus-within`, `.settings-switch:focus-visible` outline như `.goal-option`), import trong `main.css`; kiểm: test 7.15 pass, `pnpm lint` sạch (không utility visual trong JSX)

## 8. Màn Cài đặt: lỗi lưu, giá trị hỏng, không đọc được — `pages/settings/hooks/useSettings.ts` (design D4)

Test: `apps/web/src/app/pages/settings/containers/SettingsContainer.errors.test.tsx`. Lỗi ghi: `vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(new Error('quota'))`;
giá trị hỏng: `db.settings.put({ key, value })` thô.

- [ ] 8.1 RED: S8.2-AC1 "Không lưu được thì báo lỗi và giữ giá trị cũ" — mục tiêu 15, ghi lỗi, chọn "30 phút" → `findByRole('alert')` có "Không lưu được cài đặt. Hãy thử lại."; "15 phút" checked; kiểm: fail vì hook chưa bắt lỗi
- [ ] 8.2 GREEN: `applyChange` bắt lỗi: trả field về `persistedRef`, `saveErrorId` tăng; container render một `<p role="alert" key={saveErrorId}>`; kiểm: test 8.1 pass
- [ ] 8.3 RED: S8.2-AC2 "Không lưu được tốc độ thì giữ tốc độ cũ" — tốc độ 1x, ghi lỗi, chọn "Chậm (0.75x)" → thông báo; "Bình thường (1x)" checked; kiểm: chạy, nếu pass ngay nhờ 8.2 thì tạm chỉ trả về cho field mục tiêu để thấy fail rồi trả lại
- [ ] 8.4 GREEN: sửa đến khi pass; kiểm: test 8.3 pass
- [ ] 8.5 RED: S8.2-AC3 "Không lưu được pinyin thì công tắc về trạng thái cũ" — pinyin bật, ghi lỗi, tắt → thông báo; công tắc checked; kiểm: như 8.3
- [ ] 8.6 GREEN: sửa đến khi pass; kiểm: test 8.5 pass
- [ ] 8.7 RED: S8.2-AC1 "Lưu được lại thì thông báo lỗi biến mất" — sau 8.1 (thông báo đang hiện), chọn lại "30 phút" lần này lưu được → `queryByRole('alert')` null, "30 phút" checked; thêm nhánh TC-S8.2-AC1-17: lỗi ở mục tiêu, rồi đổi tốc độ lưu được → thông báo biến mất, "15 phút" và "Chậm (0.75x)" checked; kiểm: fail vì lỗi chưa được xoá khi lưu thành công
- [ ] 8.8 GREEN: thành công thì `saveErrorId = null`; kiểm: test 8.7 pass
- [ ] 8.9 RED: S8.2-AC1 "Lỗi lặp lại chỉ có một thông báo" — ghi lỗi hai lần: chọn "30 phút" rồi "60 phút" → `getAllByRole('alert')` dài 1; node alert sau lần 2 `not.toBe` node sau lần 1 (live region mới, được đọc lại); "15 phút" checked (về giá trị đã lưu, không về "30 phút"); kiểm: fail nếu revert về giá trị hiện trước đó hoặc node không đổi (tạm bỏ `key` nếu pass ngay rồi trả lại)
- [ ] 8.10 GREEN: sửa đến khi pass (`persistedRef`, `key={saveErrorId}`); kiểm: test 8.9 pass
- [ ] 8.11 RED: S8.2-AC1 "Đổi mục tiêu thì giữ sau khi mở lại app" (biên TC-S8.2-AC1-11, đổi nhanh) — `saveSettings` lần 1 (60) chờ một promise tự điều khiển rồi reject, lần 2 (30) thành công trước: sau cả hai, "30 phút" checked, có thông báo lỗi; render lại → "30 phút"; kiểm: fail nếu lỗi của lần cũ trả giá trị về (tạm bỏ kiểm `latestRequestRef` nếu pass ngay rồi trả lại)
- [ ] 8.12 GREEN: `latestRequestRef[key]` — chỉ lần đổi mới nhất của field được trả giá trị về; kiểm: test 8.11 pass
- [ ] 8.13 RED: S8.2-AC2 "Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định" (container) — thô: mục tiêu 60, pinyin `false`, tốc độ `'fast'` → "Bình thường (1x)", "60 phút" checked, công tắc tắt, không `role="alert"`; kiểm: chạy, nếu pass ngay nhờ nhóm 1 thì tạm cho `getLearningPreferences` trả `DEFAULT_SETTINGS` khi có field hỏng để thấy fail rồi trả lại
- [ ] 8.14 GREEN: sửa đến khi pass; kiểm: test 8.13 pass
- [ ] 8.15 RED: S8.2-AC1 "Mục tiêu đã lưu bị hỏng thì về 15 phút" (container) — thô: tốc độ `'slow'`, mục tiêu `'abc'` → "15 phút", "Chậm (0.75x)" checked, không alert; kiểm: như 8.13
- [ ] 8.16 GREEN: sửa đến khi pass; kiểm: test 8.15 pass
- [ ] 8.17 RED: S8.2-AC3 "Tùy chọn pinyin đã lưu bị hỏng thì về bật" (container) — thô: mục tiêu 30, pinyin `'yes'` → công tắc bật, "30 phút" checked, không alert; kiểm: như 8.13
- [ ] 8.18 GREEN: sửa đến khi pass; kiểm: test 8.17 pass
- [ ] 8.19 RED: S8.2-AC1 "Không đọc được cài đặt thì màn Cài đặt hiện mặc định" (container) — DB có 60/`'slow'`/tắt nhưng `getSettings` reject: "15 phút", "Bình thường (1x)" checked, công tắc bật, không alert; rồi `saveSettings` reject, chọn "30 phút" → thông báo lỗi, "15 phút" checked; kiểm: chạy, nếu pass ngay nhờ 2.2 thì tạm cho hook giữ `null` khi đọc lỗi để thấy fail (kẹt "Đang tải cài đặt…") rồi trả lại
- [ ] 8.20 GREEN: sửa đến khi pass; kiểm: test 8.19 pass, `useSettings.ts` và `SettingsContainer.tsx` < 300 dòng, mỗi component < 5 props

## 9. E2E — `apps/web/e2e/E8/` (design mục Test)

E2E viết sau nhóm 1–8, chạy trên màn đã có: RED nào pass ngay thì tạm đổi route/hành vi để thấy fail rồi trả lại. Tên test mang ID
Scenario và ID TC. `test.describe('S8.2 Cài đặt')`. Nội dung build thật: câu "nói" 你好！ là câu 8 của `intro-02` (tới bằng `seedProgress`
`intro-01` xong + `intro-02` `cursor: 7`), gõ pinyin `intro-02` `cursor: 2`, cặp âm `intro-01` `cursor: 9`.

- [ ] 9.1 RED: tạo `apps/web/e2e/E8/settings.helpers.ts` (`openSettingsFromPath`, locator nhóm/radio/switch/alert, `breakSettingsWrites`, `restoreSettingsWrites`, `breakSettingsReads` — `page.evaluate` + `addInitScript` đọc cờ `sessionStorage`), mở rộng `AudioPlayRecord` của `e2e/E7/intro-lessons.helpers.ts` thêm `playbackRate: number | null`, ghi `this.playbackRate` trong `then` của `play` (khi phát đã bắt đầu, cùng chỗ ghi `duration`), không ghi lúc gọi `play` (design D7); viết `apps/web/e2e/E8/s8.2-settings.spec.ts`: TC-S8.2-AC1-1 "Mở Cài đặt từ màn Lộ trình", TC-S8.2-AC1-5 "Quay về Lộ trình", TC-S8.2-AC1-9 "Hiện mục tiêu đã chọn ở onboarding" (`completeOnboarding(page, 30)`), TC-S8.2-AC1-10 "Đổi mục tiêu thì giữ sau khi mở lại app" (`reload`, không có nút "Lưu"), TC-S8.2-AC1-12 "Đổi mục tiêu không hiện lại onboarding" (`goto('/')` sau reload → `/home`), TC-S8.2-AC2-1 "Mặc định ban đầu là tốc độ thường", TC-S8.2-AC2-4 "Tốc độ mặc định giữ sau khi mở lại app", TC-S8.2-AC3-1 "Mặc định hiện pinyin", TC-S8.2-AC3-6 "Tùy chọn pinyin giữ sau khi mở lại app", TC-S8.2-AC2-9 "Một tùy chọn đã lưu bị hỏng…" (`seedProgress` tốc độ `'fast'`); kiểm: `pnpm e2e` fail đúng lý do (tạm bỏ route `settings` nếu pass ngay rồi trả lại)
- [ ] 9.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass; kiểm: `pnpm e2e e2e/E8/s8.2-settings.spec.ts` pass
- [ ] 9.3 RED: thêm vào `s8.2-settings.spec.ts` TC-S8.2-AC1-6 "Đổi lựa chọn bằng bàn phím" — chỉ `keyboard.press('Tab' | 'ArrowDown' | 'Space')`: "60 phút", "Chậm (0.75x)" checked, công tắc tắt; mỗi bước ô có focus có `outline-style` khác `none` (mẫu S8.1 AC1-7); kiểm: thấy fail (tạm `outline: none` cho `.settings-switch` nếu pass ngay) rồi trả lại
- [ ] 9.4 GREEN: sửa đến khi pass; kiểm: test 9.3 pass
- [ ] 9.5 RED: `apps/web/e2e/E8/s8.2-settings-errors.spec.ts` — TC-S8.2-AC1-13 "Không lưu được thì báo lỗi và giữ giá trị cũ", TC-S8.2-AC1-15 "Lưu được lại thì thông báo lỗi biến mất" (`restoreSettingsWrites`, chọn lại, reload vẫn "30 phút"), TC-S8.2-AC1-18 "Lỗi lặp lại chỉ có một thông báo" (`getByRole('alert')` `toHaveCount(1)`), TC-S8.2-AC2-7 "Không lưu được tốc độ thì giữ tốc độ cũ", TC-S8.2-AC3-10 "Không lưu được pinyin thì công tắc về trạng thái cũ", TC-S8.2-AC1-21 + TC-S8.2-AC1-22 "Không đọc được cài đặt thì màn Cài đặt hiện mặc định" (đã chọn 60/Chậm/tắt; ở Lộ trình `breakSettingsReads`; bấm "Cài đặt" → mặc định, không alert; `breakSettingsWrites`, chọn "30 phút" → thông báo, "15 phút"; thêm bước tải lại `/settings` → vẫn màn Cài đặt, mặc định), TC-S8.2-AC2-12 "Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin" (đã chọn Chậm + tắt pinyin; `seedProgress` `intro-01` `{ status: 'completed' }` **không có `cursor`** + `intro-02` `{ status: 'in-progress', cursor: 7 }`; ở Lộ trình `breakSettingsReads`; mở `intro-01` từ Lộ trình — bài đã xong vẫn là liên kết (`LearningPathLessonItem` chỉ chặn `locked`) và `LessonService.openLesson` → `resolveStartIndex(undefined, n)` = 0 nên mở ở câu 1 (chọn thanh 八), không phải màn kết quả — kiểm đang ở câu 1 rồi công tắc "Nghe chậm" tắt; về Lộ trình mở `intro-02` → vào thẳng câu 8 "nói", hiện "你好！", "nǐ hǎo!", "Xin chào!", không alert; tải lại trang bài → vẫn màn học (không onboarding), như cũ; nếu e2e cho thấy bài đã xong không mở ở câu 1 thì đổi `intro-01` thành `{ status: 'in-progress', cursor: 0 }` thay vì sửa kỳ vọng, ghi lại trong commit); kiểm: fail đúng lý do
- [ ] 9.6 GREEN: sửa đến khi pass; kiểm: test 9.5 pass
- [ ] 9.7 RED: `apps/web/e2e/E8/s8.2-settings-lesson.spec.ts` — TC-S8.2-AC2-2 "Chọn Chậm thì mở bài là phát chậm" (`playbackRate` 0.75 đọc sau khi phát đã bắt đầu; trước 0.2 thì đọc được 1 — kiểm bằng cách tạm đảo thứ tự gán trong `audio.service` nếu 0.2 đã xong), TC-S8.2-AC2-5 "Tắt Nghe chậm trong bài không đổi Cài đặt", TC-S8.2-AC2-10 "Mở bài mới thì theo tốc độ mặc định Chậm" (mở lại chính bài ở câu 1; thêm nhánh học tiếp ở câu 2 và nhánh bài khác `intro-01` → `intro-02` vì build có 12 bài), TC-S4.4-AC2-1 "Mặc định phát tốc độ thường", TC-S4.4-AC2-5 "Mở bài mới thì về tốc độ thường", TC-S8.2-AC3-3 "Tắt pinyin thì câu nói không hiện pinyin", TC-S8.2-AC3-12 "Câu nói khi tắt pinyin", TC-S8.2-AC3-5 "Bật lại pinyin thì câu nói hiện pinyin", TC-S5.2-AC1-1 "Câu nói hiện nội dung để đọc và 3 mức", TC-S8.2-AC3-7 "Tắt pinyin vẫn giữ pinyin của lựa chọn và đáp án" ("bā"; "sì"/"shí"), TC-S8.2-AC3-8 "Tắt pinyin vẫn gõ pinyin được", TC-S8.2-AC3-9 "Tắt pinyin vẫn hiện pinyin trong giải thích khi sai", TC-S8.2-AC3-14 "Đọc to rồi tự chấm khi tắt pinyin" và TC-S5.4-AC2-2 "Vẫn nghe mẫu và thấy chữ để đọc" (`getUserMedia` reject `NotAllowedError` qua `addInitScript`); kiểm: fail đúng lý do
- [ ] 9.8 GREEN: sửa đến khi pass; kiểm: test 9.7 pass
- [ ] 9.9 Rà e2e cũ bị ảnh hưởng bởi liên kết mới trên Lộ trình và bởi việc màn học chờ đọc cài đặt: `e2e/E3/s3.1-learning-path.spec.ts`, `e2e/E8/s8.1-home-*.spec.ts` (liên kết "Trang chủ" giờ nằm trong `<nav>`), `e2e/E7/*` (dùng `installAudioRecorder`); chỉ sửa kỳ vọng nếu fail vì cấu trúc mới, không đổi hành vi app; kiểm: `pnpm e2e` pass toàn bộ

## 10. Tài liệu và kiểm tra

- [ ] 10.1 Cập nhật `docs/03-architecture.md` — ngoại lệ test-first: docs thuần: §3.2 cây `pages/settings` (`settings.routes.ts` `/settings`, `SettingsContainer`, `components/DailyGoalSetting · AudioSpeedSetting · PinyinVisibilitySetting`, `hooks/useSettings`), `pages/lesson/hooks/useLessonPreferences`, thay `contexts/settings.context.tsx` bằng `AudioSpeedContext` (nhận `initialIsSlow`) + `PinyinVisibilityContext`, `shared/models/settings.model`; dòng `test/render.tsx` bỏ `SettingsProvider`; §6.2 bảng `settings` liệt kê khóa `dailyGoalMinutes`, `hasCompletedOnboarding`, `defaultAudioSpeed` (`'normal' | 'slow'`), `isPinyinVisible`, S8.5 phải sao lưu đủ; §6.3 `saveSettings(patch)` chỉ ghi khóa được truyền; kiểm: đọc lại diff
- [ ] 10.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `enum`, không `eslint-disable`, import theo bảng ở design, file < 300 dòng, component < 5 props, effect có cleanup, không mutate, class JSX chỉ layout/spacing); kiểm: `pnpm lint` sạch
- [ ] 10.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 10.4 Chụp screenshot cho PR: màn Cài đặt (mặc định; đã đổi; đang có thông báo lỗi), màn Lộ trình có liên kết "Cài đặt", câu "nói" khi tắt pinyin, câu đầu bài với "Nghe chậm" bật sẵn — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets`
- [ ] 10.5 Ghi vào mô tả PR code cho QA: route `/settings`; tên liên kết "Cài đặt", "Về lộ trình", chữ trạng thái "Bật"/"Tắt"; nội dung build có 12 bài (câu "nói" 你好！ là câu 8 / 13 của bài 2, khác "Điều kiện đầu" của `test-cases.md`); đoạn script DevTools để làm lỗi ghi / lỗi đọc bảng `settings` (cùng cách `settings.helpers.ts`) và để ghi giá trị hỏng (`defaultAudioSpeed: 'fast'`, `dailyGoalMinutes: 'abc'`, `isPinyinVisible: 'yes'`); cách đọc tốc độ phát thực tế (`document.querySelector('audio')`/`playbackRate` trong DevTools, hoặc breakpoint ở `audio.service`); kiểm: mô tả PR có đủ các mục

## Workflow follow-up

- PR code ghi `Spec PR: #131`, References `Closes #38` khi đủ AC1–AC3, dòng `OpenSpec change: s8-2-settings`.
- Báo điều phối: `test-cases.md` "Điều kiện đầu" mô tả bài "Bốn thanh điệu" 7 câu, không khớp nội dung build 12 bài — QA cập nhật qua PR spec, không sửa trong PR code.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
