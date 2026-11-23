# Design: S7.1 Soạn 12 bài Nhập môn

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/intro-lessons/spec.md`, `specs/lesson-runner/spec.md`. Case nghiệm thu:
`test-cases.md`. Luật layer/dependency/service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau S6.2, commit `613b91d`), không phải đề xuất:

- **Nội dung**: `content/authored/path.yaml` có stage `intro` "Nhập môn", một unit `intro-pronunciation` "Phát âm" chứa
  `[intro-01]`. File bài duy nhất `content/authored/lessons/intro/01-thanh-dieu.yaml` (`id: intro-01`, title "Bốn thanh
  điệu"), có đủ 5 dạng, gồm `e7 { kind: stroke-write, wordId: 人 }`. `FIRST_LESSON_ID = 'intro-01'`
  (`core/constants/app.constants.ts`) là bài vào sau onboarding.
- **Schema**: `exerciseSchema` (`packages/shared/src/content.schema.ts`) đã có 5 kind, kể cả `stroke-write { wordId }`. Không
  cần đổi schema.
- **Pipeline** (`content/scripts/`): `assembleContent(inputs)` (`content-build/assemble.ts`) ghép mọi thứ không đụng đĩa;
  rule theo từng bài nằm ở `content-build/lessons.ts` (mẫu: `lessonToneChoiceIssues(parsed, wordsById)` đọc dữ liệu thô của
  `exercises`, trả `ContentIssue` mức `error` kèm `file:line`), gom vào `lessonIssues` → `lessonsCheck` trong
  `content-check/index.ts`. `inputs.strokeData(char)` trả `undefined` khi `hanzi-writer-data` không có chữ; chữ thiếu nét
  hiện chỉ là **cảnh báo** (`strokesCheck`, S2.5). `content:audio` cần mạng (edge-tts); `font:subset` cắt font theo JSON nội
  dung + `UI_HANZI`. Đã có 500 mp3 cho 500 từ HSK 1; mp3 câu sinh theo hash.
- **Màn bài** (`pages/lesson/`): `LessonRunnerContainer` → `useLessonRunner(lessonId)` (`LessonService`, `ContentService`)
  → `LessonRunner` tra component bằng `resolveExerciseComponent(registry, exercise)`; không có component thì hiện
  `lesson:unsupported.message` "Dạng bài này chưa có." + nút "Bỏ qua câu này" (`onSkip` → `LessonService.skip`). Hợp đồng
  dạng bài `ExerciseProps<K>` = `{ exercise, content, onResult, isLocked }` (4 props); `exerciseRegistry` có 4 kind, chưa có
  `stroke-write`. `ContentService.getExerciseContents` đã nạp `words` cho mọi `wordId`, nên câu `stroke-write` có
  `content.words[0]` (chữ cần viết là `word.hanzi`).
- **Làm tiếp (S3.3/S3.4)**: `useLessonRunner` lưu `cursor` mỗi khi đổi câu; `openLesson` mở lại ở `cursor` với phiên mới
  (`correctCount` 0, `startedAt` = lúc mở). Vì vậy rời bài bằng một liên kết rồi quay lại bằng nút back là "mở lại bài ở câu
  đang dở": tổng kết và thời gian tính từ câu đó, đúng Requirement "Quay lại bài thì tổng kết tính từ câu viết đó" mà
  không cần code mới.
- **S6.1/S6.2**: `StrokeOrderService.getStrokeOrder` (`unavailable` | `available { character, strokeData }`, throw khi tải
  lỗi/hỏng), `WritingPracticeService` (Phần 2 `startPractice`, `recordStrokeAttempt` bỏ mọi sự kiện sau khi xong chữ; Phần 3
  `loadCharacter`), `useWritingPractice` (mẫu nạp có cờ `isActive` + `attempt` cho Thử lại), `StrokeWritingPad`
  (`shared/components/exercises`, 4 props `{ character, strokeData, practice, onStrokeAttempt }`, `figure tabIndex=0`
  `aria-label` "Khung viết chữ {{character}}", chấm nét qua `core/hooks/useStrokeQuiz`), `WritingPracticeFeedback` (có nút
  "Viết lại" — màn bài không được có). `ROUTE_PATHS.strokeOrder(character)`; màn S6.1 có nút "Tập viết".
- **Test**: `src/test/mocks/content-fetch.ts` (`mockContentFetch`, tùy chọn `words`), `src/test/mocks/stroke-fetch.ts`
  (`mockStrokeFetch(overrides)` phục vụ file nét thật), `src/test/mocks/hanzi-writer.ts` (`FakeHanziWriter`,
  `emitCorrectStroke`, `emitMistake`), `src/test/stroke-order-route.tsx` (`openRoute(path)` qua bảng route thật, có `router`),
  FakeAudio theo mẫu `ListenButton.test.tsx`. E2E: `e2e/E6/writing-practice.helpers.ts` (`drawMedian`, `readBuiltStrokes`),
  `openOnceWithServiceWorker` trong `e2e/E1/s1.2-offline.spec.ts`, chặn file nét bằng `page.route` + `serviceWorkers: 'block'`
  (`e2e/E6/s6.1-stroke-order.spec.ts`). E2E đang tìm "Bốn thanh điệu": `e2e/E1/s1.2-offline.spec.ts`,
  `e2e/E3/s3.1-learning-path.spec.ts`. ID/tiêu đề unit `intro-pronunciation` "Phát âm" không được test hay e2e nào tham chiếu:
  ba test có chuỗi "Phát âm" (`content-source.service.test.ts`, `content.service.test.ts`, `LearningPathContainer.test.tsx`)
  dùng fixture riêng `{ id: 'intro-a', title: 'Phát âm' }`, không đọc `content.json` thật. E2E đọc nội dung đã build bằng
  `readFileSync` + schema của `@csk/shared` (`e2e/E6/s6.1-stroke-order-offline.spec.ts`); `AudioService`
  (`core/services/audio.service.ts`) dùng lại một `HTMLAudioElement`, lỗi phát hiện "Không phát được audio.".

## Goals / Non-Goals

**Goals:**

- Câu viết chạy trong màn bài với state, dữ liệu nét và trạng thái tải ở hook của feature `lesson`, khung viết S6.2 dùng
  nguyên qua props.
- Luật mới của `content:check` cho câu viết ở mức lỗi, theo đúng mẫu rule từng bài của pipeline.
- Các Scenario "đọc nội dung đã build" kiểm bằng Vitest đọc thẳng output build (đã validate Zod), không qua giao diện.
- 12 bài YAML theo danh sách AC2; output sinh lại bằng pipeline (không sửa tay).

**Non-Goals:**

- Không đổi `exerciseSchema`, `LessonService` Phần 3, luật làm tiếp S3.4, màn S6.1/S6.2.
- Không thêm bảng/field IndexedDB, không chuyển đổi tiến độ của bài mẫu cũ (proposal, Open Questions).
- Không biến các điều kiện riêng của giai đoạn Nhập môn (≥ 2 dạng, bài 2 không hỏi biến điệu) thành luật `content:check`
  chung: chúng là test của nội dung, không phải luật cho mọi bài sau này.

## Decisions

### D1. Nội dung: 12 file YAML, ID `intro-01` … `intro-12`

- `content/authored/lessons/intro/NN-<slug>.yaml`, `NN` = 01…12, `id: intro-NN`, `type: lesson`, `title` nguyên văn danh
  sách AC2 (ký tự "–" U+2013 ở "Thanh 1–4"). Giữ `intro-01` (đổi title, đổi tên file thành `01-thanh-1-4.yaml`) để
  `FIRST_LESSON_ID` và e2e onboarding không đổi.
- `path.yaml`: stage `intro` "Nhập môn", **một** unit `id: intro-basics`, `title: "Pinyin và chữ Hán cơ bản"` (thay
  `intro-pronunciation` "Phát âm"; người thật đã chốt) chứa `[intro-01 … intro-12]` đúng thứ tự. Không test/e2e nào phải sửa vì
  đổi unit (xem Context); test 6.1 và e2e 7.2 kiểm thêm ID/tiêu đề này.
- Mỗi bài: ≥ 2 kind khác nhau, ≥ 1 câu `tone-choice`/`sound-pair`/`pinyin-type` (nút "Nghe"); chỉ dùng từ có trong từ điển
  HSK 1; câu nói theo mẫu khai báo ở `sentences` của bài.
- Bài 2: câu `tone-choice`/`pinyin-type` không dùng từ có "不", "一" hay hai âm tiết thanh 3 liền nhau; có ≥ 1 câu `speak`
  dùng từ/câu có biến điệu (vd `不是`, `一起`, `你好`).
- Bài 10: câu `stroke-write` cho `人` và `十` (+ dạng khác). Bài 11: câu `stroke-write` cho bộ thủ tự đứng được thành chữ HSK 1
  (vd `口`, `女`, `日`, `人`) + dạng khác. Không viết `氵`, `扌`, `亻`.
- Sinh lại: `pnpm --filter @csk/content content:build`, `content:audio` (cần mạng, cho mp3 câu mới),
  `font:subset` (chữ Hán mới trong câu). Nghĩa thiếu → `vi-meanings.yaml` (cảnh báo không chặn); chữ đa âm đọc sai →
  `tts-overrides.yaml`.
- Người soạn tự chọn câu cụ thể (proposal, "Số câu tối thiểu"); design không chốt danh sách từ.

### D2. Luật `content:check` cho câu viết: `lessonStrokeWriteIssues` trong `content-build/lessons.ts`

- Chữ ký: `lessonStrokeWriteIssues(parsed: ParsedLesson, wordsById: ReadonlyMap<string, Word>, hasStrokeData: (char:
  string) => boolean): ContentIssue[]`. Đọc dữ liệu thô `exercises` như `lessonToneChoiceIssues` (bài còn lỗi schema vẫn
  được báo). Với mỗi câu `kind: stroke-write`:

  | Điều kiện (theo thứ tự, dừng ở điều đầu tiên đúng) | Message (level `error`, `line` = dòng `wordId`, hoặc dòng câu khi thiếu) |
  |---|---|
  | `wordId` không phải chuỗi hoặc rỗng sau `trim` | `Bài "<bài>", câu "<câu>": câu viết rỗng, cần đúng một chữ Hán` |
  | Văn bản cần viết (`wordsById.get(id)?.hanzi ?? id`) không phải đúng một ký tự, nhưng toàn chữ Hán | `… câu viết "<văn bản>" có nhiều hơn một chữ, câu viết chỉ nhận một chữ Hán` |
  | Không phải một chữ Hán (`hanCharacterSchema` không khớp) | `… câu viết "<văn bản>" không phải chữ Hán` |
  | `!hasStrokeData(chữ)` | `… chữ "<chữ>" thiếu dữ liệu nét, câu viết cần chữ có dữ liệu nét` |

  Từ ngoài từ điển vẫn do `lessonRefIssues` báo riêng ("không có trong từ điển"); với "爱" có trong từ điển chỉ có lỗi thiếu nét.
- Gắn vào `assembleContent`: `lessonIssues` thêm `parsedLessons.flatMap(p => lessonStrokeWriteIssues(p, wordById, (c) =>
  inputs.strokeData(c) !== undefined))`. Lỗi đi qua `lessonsCheck` → `content:check` exit 1; vì có lỗi bài nên
  `outputInSyncCheck` bị bỏ như hiện tại. `strokesCheck` (cảnh báo chung) giữ nguyên.
- Vì sao ở pipeline thay vì `lessonSchema` (`@csk/shared`): rule cần từ điển và dữ liệu nét, schema chỉ thấy một bài.

### D3. Kiểm nội dung đã build: Vitest đọc output trong `apps/web/src/assets/`

- File `content/scripts/content-check/introLessons.test.ts` (+ `introLessons.writing.test.ts` nếu > 300 dòng). Helper đọc
  trong file test: `content.json`, `lessons/<id>.json`, `words.json`, `sentences.json`, `strokes/index.json` từ
  `PATHS.contentOut`, parse bằng `contentRootSchema`, `lessonSchema`, `wordSchema.array()`, `sentenceSchema.array()`,
  `strokeIndexSchema` (Zod, CLAUDE.md §0.4); audio kiểm bằng `statSync(join(PATHS.assets, word.audio)).size > 0`.
- Hằng trong test: `INTRO_LESSON_TITLES` (12 tiêu đề nguyên văn), `SUPPORTED_KINDS` (5 kind), `LISTEN_KINDS`
  (`tone-choice`, `sound-pair`, `pinyin-type`), `AUDIO_KINDS` = `LISTEN_KINDS` + `speak`.
- Biến điệu bài 2: từ có "不"/"一" theo `hanzi`; hai âm tiết thanh 3 liền nhau theo `parsePinyin(word.pinyin)` của
  `@csk/shared` (tone 3 ở hai âm tiết kề nhau).
- Vì sao Vitest ở `@csk/content` mà không phải web: output và `PATHS` thuộc pipeline; `pnpm test:run` của monorepo chạy cả
  project `content`, CI đã chạy.

### D4. Câu viết trong màn bài: nhánh riêng trong `LessonRunner`, không qua hợp đồng registry

- Hợp đồng registry (`ExerciseProps`, 4 props, `shared/components/exercises` không gọi service) không mang được dữ liệu nét,
  trạng thái tải và lượt viết (quy tắc lượt viết ở `WritingPracticeService` Phần 2, exercises không được import). Đã cân nhắc:
  (a) thêm prop thứ 5 cho riêng `stroke-write` — vượt ngưỡng props §7 và làm type registry phức tạp; (b) nhét lượt viết +
  callback vào `ExerciseContent` — trộn dữ liệu với hành vi; (c) context riêng — không phải cross-cutting. Chọn: `LessonRunner`
  rẽ nhánh `exercise.kind === 'stroke-write'` **trước** khi tra registry và render `LessonStrokeWrite` (feature component),
  bên trong dùng nguyên `StrokeWritingPad`. Nhánh "Dạng bài này chưa có." chỉ còn cho kind không có trong registry và không
  phải `stroke-write`. `exerciseRegistry` không đổi.
- `view.strokeWrite` không có (chưa truyền, vd test `LessonRunner` cũ hay `LessonRunner.kinds.test.tsx`) mà
  `exercise.kind === 'stroke-write'`: `LessonRunner` render như trạng thái đang tải (`<p role="status">` "Đang tải…", không
  khung, không link, không nút bỏ qua), **không** rơi vào "Dạng bài này chưa có.".
- Lệch tài liệu: `docs/03-architecture.md` §6.3 nói runner "chỉ làm việc qua `exercise.registry.ts`"; task 8.2 sửa đoạn đó, ghi
  ngoại lệ `stroke-write` (nhánh riêng, dữ liệu nét từ `useLessonStrokeWrite`). Mô tả PR code nêu chỗ lệch này (task 8.9).
- Lệch với bảng "Layer đích" của proposal (ghi "đăng ký vào registry"): ý của dòng đó (khung S6.2 chỉ nhận props, dữ liệu nét
  từ hook feature) được giữ; spec không nêu registry nên không đổi hành vi. Ghi trong báo cáo plan.

### D5. Quy tắc kết quả câu viết: `WritingPracticeService` Phần 2

- Thêm `lessonResultOf(previous: WritingPracticeState, next: WritingPracticeState): ExerciseResult | null` — comment
  `Rule: trong màn bài, câu viết chỉ có kết quả "Đúng", đúng một lần lúc vừa xong chữ; viết sai nét không cho kết quả`.
  Trả `{ isCorrect: true }` khi `!previous.isComplete && next.isComplete`, ngược lại `null`. Không `explanation`.
- Khóa sau "Đúng": `recordStrokeAttempt` đã trả nguyên state khi `isComplete` (S6.2) và quiz hanzi-writer tự kết thúc khi xong
  chữ, nên vẽ thêm không thêm nét/không báo sai. Không đổi code, chỉ có test.
- Không ghi thẻ ôn tập: hook không nhận store nào ngoài luồng `submitResult` có sẵn.

### D6. Hook: `pages/lesson/hooks/useLessonStrokeWrite.ts`

- `useLessonStrokeWrite(exerciseId: string | null, character: string | null, onResult: (r: ExerciseResult) => void):
  LessonStrokeWriteView | null`. Tham số là primitive (không nhận object tạo mới mỗi render). `exerciseId` hoặc `character`
  null (câu không phải câu viết) → trả `null`, không nạp gì. Hook gọi ở top level của container mọi lúc.
- State gắn với `exerciseId` (mẫu `opened.lessonId === lessonId` của `useLessonRunner`): state lưu kèm `exerciseId` đã nạp, khác
  `exerciseId` hiện tại thì coi như `loading`, nên đổi câu không lẫn state cũ.
- Service tạo theo đúng mẫu `useWritingPractice`: `const writingPracticeService = useMemo(() => new WritingPracticeService(),
  [])` (gọi `service.…` bên dưới là instance này).
- Effect nạp theo mẫu `useWritingPractice` (cờ `isActive`, cleanup đặt `isActive = false`): `writingPracticeService
  .loadCharacter(character)` → `ready` + `startPractice(n)`, `unavailable`, lỗi → `error`. **Dependency của effect:
  `[writingPracticeService, exerciseId, character, attempt]`**. Có `exerciseId` nên hai câu viết liền nhau cùng chữ
  vẫn nạp và `startPractice` lại. `retry()` đặt `loading` và tăng `attempt`.
- `recordStrokeAttempt` ổn định (`useCallback(…, [writingPracticeService, onResult])`; `onResult` = `submitResult` đã ổn định của `useLessonRunner`), để
  không tạo lại writer của `StrokeWritingPad`:
  - `practiceRef` giữ lượt viết mới nhất, **gán đồng bộ trong handler**: `const prev = practiceRef.current; if (!prev)
    return; const next = service.recordStrokeAttempt(prev, r); practiceRef.current = next; setPractice(next);`. Không đồng bộ
    ref bằng effect (hai sự kiện liền nhau trước khi render vẫn tính từ lượt mới nhất). Khi nạp xong/đổi câu, chỗ đặt
    `ready` cũng gán `practiceRef.current = startPractice(n)` cùng lúc `setPractice`.
  - `service.lessonResultOf(prev, next)` khác `null` thì gọi `onResult(result)` — gọi trong handler, không qua effect. Kết
    quả: `onResult` được gọi **đúng một lần** mỗi câu (test 3.7).
- Model `LessonStrokeWriteView` ở `shared/models/lesson-session.model.ts`: `{ exerciseId: string; character: string; view:
  StrokeOrderView; practice: WritingPracticeState | null; retry: () => void; recordStrokeAttempt: (r: StrokeAttemptResult)
  => void }`.
- `LessonRunnerView` thêm trường **optional** `strokeWrite?: LessonStrokeWriteView | null` (phương án a của review). Lý do: 8
  chỗ dựng `view={{ exercise, content, current, total, feedback }}` trong `LessonRunner.test.tsx` vẫn typecheck, implementer
  không phải sửa test; không thêm prop thứ 5 cho `LessonRunner` (giữ < 5 props, §7). Khi trường vắng mặt: xem D4.

### D7. Container và component

- `LessonRunnerContainer`: khi `exercise?.kind === 'stroke-write'` và có `content.words[0]` thì `strokeWriteExerciseId =
  exercise.id`, `strokeWriteCharacter = words[0].hanzi`, ngược lại cả hai `null` (string/null, không dựng object); gọi
  `useLessonStrokeWrite(strokeWriteExerciseId, strokeWriteCharacter, submitResult)`, truyền vào `view.strokeWrite`.
  `submitResult` của `useLessonRunner` đã ổn định.
- `LessonRunner` render `<LessonStrokeWrite key={exercise.id} …>` (remount khi đổi câu, kể cả cùng chữ).
- `pages/lesson/components/LessonStrokeWrite.tsx` — props `{ strokeWrite: LessonStrokeWriteView; isAnswered: boolean;
  onSkip: () => void }`, theo `strokeWrite.view.status` (bảng Requirement "Trạng thái câu viết khi tải dữ liệu nét"):
  - `loading` → `<p role="status">` `writing-practice:loading` "Đang tải…"; không khung, không liên kết, không nút bỏ qua.
  - `error` → `<p role="alert">` `common:error.title` + nút `common:error.retry` (gọi `retry`) + nút `lesson:skip`.
  - `unavailable` → `<p>` `writing-practice:unavailable` + nút `lesson:skip`.
  - `ready` → `<StrokeWritingPad key={exerciseId} …>`; thông báo sai `<p role="alert" key={practice.mistakeSerial}>`
    `writing-practice:mistake` khi `lastAttempt === 'mistake' && !isComplete`; liên kết
    `<Link to={ROUTE_PATHS.strokeOrder(character)}>` `writing-practice:strokeOrderLink` (có sẵn, "Xem thứ tự nét") chỉ khi `!isAnswered &&
    !practice.isComplete`. Không có "Viết lại".
- `LessonRunner`: `isAnswered = feedback !== null`; "Đúng" + "Tiếp tục" đi qua `LessonFeedback` có sẵn (kết quả không có
  giải thích nên `shouldShowExplanation` trả false). Thanh tiến độ, `onContinue` không đổi.
- Quay lại từ màn thứ tự nét: liên kết là điều hướng push thường; back của trình duyệt mount lại `LessonRunnerContainer` →
  `openLesson` ở `cursor` đã lưu (Context). Khung trống vì lượt viết mới. Không thêm code.

### D8. i18n, style

- `assets/i18n/vi/lesson.json`: thêm `skip` "Bỏ qua câu này" (chuyển từ `unsupported.skip`, `LessonRunner` dùng `skip` cho
  cả hai nhánh); **không** thêm key cho liên kết (dùng lại `writing-practice:strokeOrderLink`); sửa `finishedWithSkipped` thành "Bạn đã bỏ qua {{count}}
  câu, bài chưa hoàn thành." (không nêu lý do). `unsupported.message` giữ cho nhánh dạng chưa hỗ trợ.
- Dùng lại `writing-practice:loading|unavailable|mistake|padLabel|strokeOrderLink` và `common:error.*` (cùng câu chữ S6.1/S6.2).
  `LessonStrokeWrite` dùng `useTranslation(['lesson', 'writing-practice', 'common'])`.
- `styles/tailwind/components/_lesson.css`: `.lesson-stroke-write-link` (chữ ≥ 4.5:1, vùng chạm ≥ 44×44 px),
  `.lesson-stroke-write-message`; khung dùng `.writing-pad` có sẵn. JSX chỉ layout/spacing (§6).

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `LessonRunnerContainer` | `useLessonRunner`, `useLessonStrokeWrite`, `LessonRunner` | ✅ container → hooks, components |
| `useLessonStrokeWrite` | `WritingPracticeService`, model | ✅ hooks → shared/services |
| `WritingPracticeService` (sửa) | type `ExerciseResult` (`shared/models`) | ✅ không React, không Dexie |
| `LessonRunner`, `LessonStrokeWrite` | `StrokeWritingPad`, `ROUTE_PATHS`, react-router `Link`, model type | ✅ không `shared/services` |
| `StrokeWritingPad` | không đổi | ✅ |
| `content-build/lessons.ts` (sửa) | `hanCharacterSchema`, type `Word` (`@csk/shared`) | ✅ pipeline, ngoài app |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| JSON bài, từ, câu, lộ trình (app) | `lessonSchema`, `wordSchema`, `sentenceSchema`, `contentRootSchema` | `FetchContentSource`, có sẵn |
| File nét (app) | `strokeIndexSchema`, `strokeDataSchema` | `FetchContentSource`, có sẵn |
| Output build đọc trong test nội dung | các schema trên | helper trong `introLessons.test.ts` (D3) |
| `wordId` của câu viết trong YAML (pipeline) | `hanCharacterSchema` | `lessonStrokeWriteIssues` (D2) |
| IndexedDB nạp sẵn trong e2e | không parse ở test; app đọc qua `lessonProgressSchema` có sẵn | — |

Không có schema mới.

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Luật câu viết của `content:check` (爱 thiếu nét, 爸爸, rỗng, abc) | pipeline, Vitest với đầu vào thử | `content/scripts/content-build/assemble.strokeWrite.test.ts` |
| Nội dung đã build: 12 bài, dạng bài, audio, bài 2, bài 10–11, câu viết có nét | Vitest đọc output | `content/scripts/content-check/introLessons.test.ts` (+ `.writing.test.ts`) |
| Rule kết quả câu viết | `shared/services` Phần 2 | `apps/web/src/app/shared/services/writing-practice.service.test.ts` |
| Câu viết trong màn bài: khung, focus, sai nét, Đúng, khóa, liên kết, trạng thái tải, bỏ qua | container + fake hanzi-writer | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.strokeWrite.test.tsx`, `.strokeWriteLoad.test.tsx` |
| Hook câu viết: `onResult` đúng một lần, handler ổn định, nạp lại theo `exerciseId` | hook, `renderHook` | `apps/web/src/app/pages/lesson/hooks/useLessonStrokeWrite.test.ts` |
| Lối vào màn thứ tự nét, back, tổng kết từ câu viết | qua bảng route thật (`openRoute`) | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.strokeOrderLink.test.tsx` |
| Nút Nghe phát đúng từ/câu | container + registry thật + FakeAudio | `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.audio.test.tsx` |
| Thông báo cuối bài không nêu lý do | container | trong `.strokeWriteLoad.test.tsx` |
| Luồng thật: lộ trình, onboarding, đi hết 12 bài, câu viết, offline | e2e | `apps/web/e2e/E7/s7.1-intro-lessons.spec.ts`, `s7.1-intro-writing.spec.ts`, `s7.1-intro-offline.spec.ts` |
| Audio có mạng (TC-S7.1-AC1-5, -8), câu viết qua giao diện (TC-S7.1-AC2-1, -2, TC-S7.1-AC3-5) | e2e | `apps/web/e2e/E7/s7.1-intro-audio.spec.ts`, `s7.1-intro-writing-content.spec.ts` |
| Hồi quy màn bài S3.2-AC2 (TC-S3.2-AC2-1 → -4) | e2e | `apps/web/e2e/E7/s7.1-lesson-runner.spec.ts` |

- Fetch giả trong Vitest: helper mới `src/test/lesson-stroke-write.helpers.ts` ghép `mockContentFetch` (bài thử + `words`
  riêng có `hanzi` 人/十 và `audio` khác nhau) với `mockStrokeFetch(overrides)` cho URL `/content/strokes/…`; trạng thái
  "không có dữ liệu nét" dựng bằng từ có `hanzi` không nằm trong `strokes/index.json` thật (vd 龘) — đây là cách cho
  TC-S7.1-AC1-29, -30 và TC-S3.2-X1 mà test-cases giao cho Dev. "Đang tải" dùng override trả `Promise` chưa resolve; "tải
  lỗi" dùng override 500 cho `人.json`.
- E2E nạp sẵn tiến độ (cho "Tiến độ tới bài 10", "mở hết 12 bài"): helper `e2e/E7/intro-lessons.helpers.ts`
  `seedCompletedLessons(page, lessonIds)` — mở app một lần (app tạo DB `tranie-chinese` v2), `page.evaluate` mở
  `indexedDB.open('tranie-chinese')` không truyền version, `put` vào `settings` `{ key: 'hasCompletedOnboarding', value:
  true }` và vào `lessonProgress` `{ lessonId, status: 'completed' }`, rồi `reload`. QA chạy tay theo test-cases (làm lần lượt).
- E2E làm câu: `answerCurrentQuestion(page)` theo dạng nhìn thấy trên màn (chọn đáp án đầu, gõ pinyin bất kỳ rồi "Kiểm tra",
  câu nói chuyển chế độ đọc to khi không có micro rồi chọn mức, câu viết vẽ từng nét bằng `drawMedian` +
  `readBuiltStrokes` của `e2e/E6/writing-practice.helpers.ts`). Trả lời sai vẫn hợp lệ: bài thường hoàn thành khi không có câu
  bỏ qua.
- E2E làm chậm/chặn file nét: `test.use({ serviceWorkers: 'block' })` + `page.route` như S6.1 (page.route không chặn được
  request do service worker phục vụ). QA chạy tay: DevTools → Network → "Block request URL" `/content/strokes/人.json`, tick
  "Bypass for network" ở Application → Service workers.
- E2E đọc nội dung đã build (biết đáp án đúng, chữ của câu viết, audio của từng câu): helper `readBuiltLesson(id)`,
  `readBuiltWords()`, `readBuiltSentences()` trong `e2e/E7/intro-lessons.helpers.ts`, `readFileSync` file trong
  `apps/web/src/assets/content/` + `lessonSchema`, `wordSchema.array()`, `sentenceSchema.array()` (mẫu
  `e2e/E6/s6.1-stroke-order-offline.spec.ts`; Zod theo §0.4). Đáp án đúng câu `tone-choice` = thanh của `word.pinyin` qua
  `parsePinyin`.
- E2E ghi audio đã phát (TC-S7.1-AC1-5, -8): `page.addInitScript` bọc `HTMLMediaElement.prototype.play` ghi `{ src }` vào
  `window.__playedAudio` và nghe `loadedmetadata` ghi `duration`. Mỗi lần bấm "Nghe"/"Nghe mẫu": có bản ghi mới, `src` kết thúc
  bằng `audio` của từ/câu mà câu bài tập đó hỏi (theo thứ tự câu trong `readBuiltLesson`), `duration > 0`, không hiện "Không
  phát được audio.".
- **TC-S7.1-AC1-8 chốt: phủ cả hai tầng.** Tầng chính là component (task 5.9, theo Ghi chú của test-cases); thêm e2e (task
  7.16) vì cột Tự động ghi `e2e` và chi phí thấp nhờ bộ ghi audio trên: ở bài 1 bấm "Nghe", trả lời, bấm "Tiếp tục" ngay khi
  audio còn phát, bấm "Nghe" ở câu kế → bản ghi cuối là audio của từ câu kế (không phải câu trước), phần tử audio của lần phát
  trước không còn phát (`AudioService` dùng một phần tử nên đổi `src`). Phần "tai người nghe đúng từ" vẫn là TC-S7.1-AC1-7 chạy
  tay. Ghi vào mô tả PR cho QA (task 8.9).
- Offline câu viết (TC-S7.1-AC5-6): nạp sẵn tiến độ mở hết 12 bài bằng `seedCompletedLessons` **không** mở bài 10, 11 khi có
  mạng, rồi `context.setOffline(true)`.

## Risks / Trade-offs

- [PR code lớn: 12 file nội dung + nhiều mp3 + code màn bài] → tasks chia cụm commit: luật pipeline → màn bài → nội dung → e2e.
- [`content:audio` cần mạng, edge-tts có thể lỗi] → chạy lại được (theo hash); `content:check` báo audio thiếu.
- [Font subset thiếu chữ mới] → chạy `font:subset` sau `content:build`; screenshot kiểm chữ hiện bằng font Khải.
- [Precache tăng dung lượng] → mp3 câu nhỏ; `MAX_PRECACHE_FILE_BYTES` 5 MB theo file, không đổi.
- [Máy dev có tiến độ bài mẫu `intro-01` thấy "Thanh 1–4" Đã xong] → chấp nhận (proposal).
- [Lỗ của luật làm tiếp: câu đã bỏ qua trước câu viết không còn tính sau khi quay lại] → đã chấp nhận ở proposal (phương án a).
- [E2E đi hết 12 bài chậm] → tách test theo bài (`test.describe.parallel` mỗi bài một test với tiến độ nạp sẵn), không một
  test dài.
- [Câu viết lệch nhánh registry (D4)] → test "mọi kind của `exerciseSchema` không hiện 'Dạng bài này chưa có.'" giữ chỗ
  cho kind mới sau này.

## Migration Plan

- Không đổi schema IndexedDB. Nội dung sinh lại bằng pipeline. Rollback: revert PR code (nội dung, màn bài, luật check).

## Open Questions

- [x] ID và tiêu đề của unit duy nhất trong giai đoạn Nhập môn → `intro-basics` "Pinyin và chữ Hán cơ bản" (người thật chốt,
  thay `intro-pronunciation` "Phát âm"). Ghi ở D1, task 6.1, 6.14, 7.2. Không test/e2e cũ nào tham chiếu unit cũ.
