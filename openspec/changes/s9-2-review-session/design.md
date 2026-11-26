# Design: S9.2 Màn ôn tập

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/review-session/spec.md`, `specs/home-screen/spec.md`. Case nghiệm thu:
`test-cases.md`. Luật layer, dependency, service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây). Đường dẫn code tính từ
`apps/web/src/app/` nếu không ghi khác.

## Context

**Quan sát được trong repo** (`main` tại `bccf171`, code S9.1 đã merge ở PR #154, spec S9.1 đã archive ở
`openspec/changes/archive/2026-11-25-s9-1-review-cards/`, capability `openspec/specs/review-cards/`; không phải đề xuất):

- **Thẻ ôn tập (S9.1)**: `packages/shared/src/review-card.schema.ts`: `reviewCardSchema` / `ReviewCard` = `{ wordId, facet, state,
  due, stability, difficulty, elapsedDays, scheduledDays, learningSteps, reps, lapses, lastReview? }` (mirror `Card` của `ts-fsrs`,
  thời điểm epoch ms, `state` là chuỗi). `CARD_FACETS = ['meaning', 'listening', 'writing']` / `CardFacet`; `CARD_STATES = ['new',
  'learning', 'review', 'relearning']` / `CardState`; thẻ "mới" = `state === 'new'`. **Thẻ không có field `id`**: khóa là
  `reviewCardId(wordId, facet)` = `"<wordId>:<facet>"`. `ts-fsrs` khóa `6.0.0` (`pnpm-lock.yaml`, `apps/web/package.json` `catalog:`).
- **Lưu thẻ**: `core/helpers/db.helper.ts` Dexie **version 4**, bảng `cards: 'id, due'` (dòng = `ReviewCard` + `id`) và
  `writtenCharacters`. `ProgressStore` (`core/services/progress-store.interface.ts`, `DexieProgressStore` trong
  `progress-store.service.ts`, 276 dòng) có `getAllCards()` (chờ `pendingWrites`, bỏ dòng hỏng bằng `parseRows(…, reviewCardSchema)`)
  và `addNewCards(cards)` (chỉ thêm thẻ chưa có, **không bao giờ ghi đè**). **Chưa có method ghi đè một thẻ** (`upsertCard` giả định
  trong bản design cũ không tồn tại). Mọi lần ghi đi qua `enqueueWrite` để lần đọc ngay sau thấy được.
- **Sao lưu thẻ**: file `formatVersion: 2` (`progressBackupV2Schema` trong `packages/shared/src/progress-backup.schema.ts`) có
  `cards: reviewCardSchema[]` — đủ mọi field FSRS kể cả `lastReview`. `exportAll` đọc `cards` qua `reviewCardSchema`; `importAll`
  xóa bảng rồi `bulkPut` nguyên thẻ của file (ghi đè, không gộp). Test S9.1
  `shared/services/backup.service.review-cards.roundtrip.test.ts` đã kiểm thẻ đã ôn (`state: 'review'`, `stability`, `difficulty`,
  `lapses`, `lastReview`…) qua xuất → nhập giữ `toEqual` từng field, dùng `@test/backup-machine.helpers` (`createMachine`,
  `toBackupFileSource`).
- **`SrsService`** (`shared/services/srs.service.ts`, **294 dòng**, constructor `(store = progressStore, content = contentSource)`):
  Phần 1 `readAllCards`, `writeNewCards`, `readWords`…; Phần 2 `collectLessonWordIds(exercises)` (rule "từ của bài": `wordId` hoặc cả
  hai `wordIds` của câu cặp âm theo thứ tự khai báo, câu chỉ có `sentenceId` không có từ, **bỏ trùng giữ lần xuất hiện đầu**),
  `createNewCard(wordId, facet, now)` (dùng `createEmptyCard` của `ts-fsrs` + hằng `CARD_STATE_BY_FSRS_STATE` ở đầu file), và các rule
  tạo thẻ; Phần 3 `createCardsForFinishedLesson`, `recordCharacterWriting`. **Chưa có** hàm chuyển `ReviewCard` → `Card` của `ts-fsrs`
  (chỉ có chiều ngược, viết thẳng trong `createNewCard`), chưa có chấm thẻ. `ts-fsrs` hiện chỉ được import ở file này
  (`docs/03-architecture.md` §4 ghi "file duy nhất import `ts-fsrs`").
- **Helper Vitest S9.1**: `src/test/srs-lesson.helpers.ts` (`openService(lessons)`: `DexieProgressStore` trên DB tên ngẫu nhiên +
  `ContentSource` giả theo `makeSource()`), `src/test/content-service.fixtures.ts` (`makeSource`, `makeWord`, `SRS_WORD_IDS`),
  `src/test/backup-machine.helpers.ts`, `src/test/lesson-runner-cards.helpers.ts`.
- **e2e S9.1** (`apps/web/e2e/E9/`): bộ bài mẫu `e2e/fixtures/reviewCardsFixtures.ts` (validate Zod ở `e2e/E9/review-cards.content.ts`)
  với lộ trình một giai đoạn, chủ đề chính `a, b, c, aSkip, d, e, f, g, h, k`: bài A (`a-1` "你好", `a-2` "谢谢"), B ("人"), C, A'
  ("你好", "谢谢", "杯"), D (cặp âm "妈"/"马", "妈" khai báo trước); từ thêm vào `words.json` qua `withExtraWords` ("你好" pinyin
  **`nǐhǎo`**, "妈", "马"). Hai đường phục vụ: `serveReviewCardsPath(page)` (`page.route`, có mạng) và bản build e2e
  (`reviewCardsFixturePlugin.ts`, cookie `useReviewCardsFixture(context)`, chạy được offline). Helper `review-cards.helpers.ts`:
  `seedReviewProgress(page, { lessonProgress, cards, writtenCharacters })` (ghi thẳng IndexedDB rồi reload), `readReviewCards(page)`,
  `newCard(wordId, facet, due?)`, `reviewedOnceCard(wordId, facet)` (due cố định), `breakReviewWrites(page, BREAK_CARD_WRITES)` /
  `restoreReviewWrites(page)` (bọc `put`/`add` của `IDBObjectStore.prototype` theo cờ `sessionStorage`). `review-cards-backup.helpers.ts`:
  `openMachine(browser)` (một `BrowserContext` = một máy), `exportFromSettings`, `importAndOverwrite`, `closeMachines`. File sao lưu
  mẫu ở `e2e/E9/fixtures/progress-backup/*.json`. **Chưa có** helper giả lập lỗi **đọc** bảng `cards`.
- Từ thật trong `assets/content/words.json`: "谢谢" `vi: ['cảm ơn', 'cảm ơn bạn']`, "人" `vi: ['người; mọi người']`.
- **Nội dung**: `core/services/content-source.service.ts` (`ContentSource`: `getContentRoot`, `getLesson`, `getWords`, …, validate Zod).
  `shared/utils/learning-path.utils.ts` `listLessonIdsInOrder(stages)` là thứ tự bài của lộ trình. `Word` = `{ id, hanzi, pinyin, vi:
  string[], audio, … }`.
- **Pattern màn hình**: `pages/home/` (container + `hooks/useHome.ts` tạo service bằng `useMemo(() => new XService(), [])`, cờ
  `isActive` khi unmount), `pages/settings/` (thông báo lỗi `<p role="alert" key={saveErrorId}>`). Route: `<feature>.routes.ts` lazy
  (`home.routes.ts`), gom ở `pages/page.routes.ts`; URL lấy từ `ROUTE_PATHS` (`core/constants/app.constants.ts`).
- **Audio**: `shared/components/ListenButton.tsx` (`audioPath`, `label?`; `useAudioPlayer`; lỗi thì `<p role="alert">` `lesson:listen.error`;
  không tự phát). **i18n**: `I18N_NAMESPACES` (`core/services/i18n.service.ts`) và `ns` của `src/test/i18n.ts`.
- **Trang chủ** (`pages/home/containers/HomeContainer.tsx`): "Vào học" (`NextLessonCard`) → phút hôm nay → streak → `<Link
  className="home-link">` "Xem lộ trình". `styles/tailwind/base/_base.css` đã có `:focus-visible` toàn cục (outline 2px
  `--color-accent`), áp cho mọi nút/link kể cả `.btn` (`components/_button.css`), nên không cần rule focus riêng cho nút/link.
- **Fake `ProgressStore` trong test** (object literal gõ type `ProgressStore`, đủ mọi method): `shared/services/progress.service.test.ts:16`,
  `progress.service.study-time.test.ts:17`, `progress.service.streak-flow.test.ts:19`, `lesson.service.test.ts:383` và `:748`. Pattern
  hiện có cho `addNewCards`: `vi.fn(async () => undefined)` (progress/lesson) hoặc hằng `unavailable` (study-time, streak-flow).

## Goals / Non-Goals

**Goals:**

- Đặt mọi quy tắc của S9.2 (thẻ nào được hỏi, thứ tự, vị trí của từ, xếp lịch FSRS) ở Phần 2 của một service `shared/services/`, test
  bằng hàm thuần; flow "lấy phiên" và "chấm rồi lưu" ở Phần 3.
- Một quy tắc xếp lịch duy nhất (`ReviewService.scheduleCard`) để S6.3 dùng lại khi chấm thẻ chiều viết.
- Màn ôn tập giữ trạng thái phiên trong một hook, focus và thông báo đọc tự động đúng bảng focus của spec.

**Non-Goals:**

- Không đổi cấu trúc dữ liệu lưu trên máy (không Dexie version mới, không `reviewLogs`), không đổi file sao lưu.
- Không định nghĩa lại hình dạng thẻ: dùng nguyên `ReviewCard` / `reviewCardSchema` của S9.1.
- Không giới hạn số thẻ mỗi ngày (S9.3 chèn vào `selectReviewSession`, D4).

## Decisions

### D1. Đối chiếu với code S9.1 (task 1.1, đã làm)

| Cần từ S9.1 | Bản design cũ giả định | Tên / hành vi thật | S9.2 làm gì |
|---|---|---|---|
| Type + schema thẻ | `Card`, `cardSchema`, field `id` | `ReviewCard`, `reviewCardSchema` (`@csk/shared`, `review-card.schema.ts`), không có `id` | dùng `reviewCardId(card.wordId, card.facet)` làm khóa |
| Chiều thẻ | `CardFacet` | `CardFacet`, `CARD_FACETS` (đúng thứ tự nghĩa → nghe → viết) | Q3 dùng `CARD_FACETS.indexOf` |
| Trạng thái nhớ FSRS đầy đủ | field của `Card` | `state, due, stability, difficulty, elapsedDays, scheduledDays, learningSteps, reps, lapses, lastReview?` = đủ `Card` của `ts-fsrs` 6 | đủ, không cần người thật |
| Thẻ "mới" | `State.New` | `state === 'new'` | `isNewCard` |
| Đọc mọi thẻ | `getAllCards()` (có thể thiếu) | **đã có**, bỏ dòng hỏng | dùng lại, không thêm |
| Ghi đè một thẻ | `upsertCard(card)` | **không có** (`addNewCards` không ghi đè) | thêm `ProgressStore.saveCard(card)` (D3) |
| Chuyển thẻ ↔ `ts-fsrs` | có sẵn trong `SrsService` | chỉ chiều `ts-fsrs` → thẻ, viết thẳng trong `createNewCard` | tách `shared/utils/fsrs-card.utils.ts` hai chiều (D5) |
| Sao lưu thẻ | `cards` trong `exportAll`/`importAll` | đã có, đủ field, có test roundtrip | dùng lại, không sửa |
| Rule "từ của bài" | `collectContentIds(...).wordIds` | `SrsService.collectLessonWordIds(exercises)` (Phần 2) | tách sang `shared/utils/lesson-words.utils.ts`, `SrsService` ủy quyền (D6) |
| Bộ bài mẫu e2e | A, A', B, D (có thể thiếu) | đã có (`reviewCardsFixtures.ts`), thứ tự `A, B, C, A', D, …` | dùng lại; thứ tự từ vẫn "你好" → "谢谢" → "人" → "妈" → "马" (D13) |

### D2. Route và điểm vào

- `ROUTE_PATHS.reviewSession = '/review-session'`: singleton số ít như `/home`, `/settings` (một phiên ôn của người học, không phải
  collection). File `pages/review/review.routes.ts` (`{ path: 'review-session', element: ReviewSessionContainer }` lazy), thêm vào
  `pages/page.routes.ts`.
- Trang chủ: component mới `pages/home/components/ReviewEntryLink.tsx` (không props) render `<Link className="btn btn-secondary
  self-start" to={ROUTE_PATHS.reviewSession}>` chữ `home:reviewLink` = "Ôn tập"; `HomeContainer` đặt nó sau streak và **trước** "Xem lộ
  trình", luôn hiện (không phụ thuộc `useHome`). "Vào học" vẫn đứng trước "Xem lộ trình" nên test S8.1 hiện có không đổi. Không sửa
  `useHome`. Viền focus lấy từ `:focus-visible` toàn cục của `_base.css`; không thêm CSS focus cho `.btn`.
- Màn ôn tập **không** gọi `useStudyTimeRecorder` (thời gian ôn không tính, proposal "Không làm").

### D3. Truy cập dữ liệu (`core/services/progress-store.*`)

- Đọc thẻ: `getAllCards()` của S9.1, không đổi. Không dùng index `due` (S9.2 cần cả thẻ chưa đến hạn để phân biệt "chưa có thẻ" với
  "không có thẻ cần ôn"; `limit` là việc của S9.3).
- **Thêm** `saveCard(card: ReviewCard): Promise<void>` vào interface `ProgressStore` và `DexieProgressStore`: `enqueueWrite(() =>
  db.cards.put({ ...card, id: reviewCardId(card.wordId, card.facet) }))`. Một `put` nên ghi lỗi thì dòng cũ còn nguyên (Requirement "Không
  lưu được mức chấm…"); đi qua `enqueueWrite` nên `getAllCards` gọi ngay sau thấy thẻ mới. Không validate lại (thẻ đã là `ReviewCard`).
  Không đổi version Dexie. `progress-store.service.ts` lên khoảng 285 dòng, dưới 300.
- Thêm method vào interface làm các fake `ProgressStore` trong test (Context) thiếu method và vỡ typecheck: cùng commit thêm `saveCard`
  vào cả 5 fake theo đúng pattern `addNewCards` của từng file (`vi.fn(async () => undefined)` hoặc `unavailable`). Không đổi hành vi test.
- Không thêm `logReview`.

### D4. `ReviewService` (`shared/services/review.service.ts`, mới)

**Lệch proposal có lý do**: bảng layer của proposal ghi "`shared/services/srs.service.ts` (đã có từ S9.1, thêm method)". `srs.service.ts`
đã 294 dòng; phần S9.2 (khoảng 200 dòng) đẩy file quá 300 (`CLAUDE.md` §5). Giữ đúng layer `shared/services/`, tách thành service riêng
cùng domain ôn tập; `SrsService` giữ việc tạo thẻ (S9.1). Hai service không gọi nhau: phần dùng chung là pure util (D5, D6). Ghi vào mô
tả PR và `docs/03-architecture.md` (task 11.1).

Constructor `(store: ProgressStore = progressStore, content: ContentSource = contentSource)` như `SrsService`. File vượt 300 dòng thì
tách các comparator thứ tự (`compareWordPositions`, `compareSessionCards`) sang `shared/utils/review-order.utils.ts` (pure, leaf) và
giữ method Phần 2 trong service ủy quyền sang đó.

**Phần 1 (private)**: `readAllCards()` → `store.getAllCards()`; `writeCard(card)` → `store.saveCard(card)`; `readContentRoot()`,
`readLesson(id)`, `readWords()` qua `ContentSource`.

**Phần 2 (pure, public)** — mỗi method một comment `Rule: …`:

| Method | Rule |
|---|---|
| `isNewCard(card: ReviewCard): boolean` | thẻ chưa chấm lần nào (`state === 'new'`) |
| `isCardDue(card, now: number): boolean` | thẻ "mới" luôn đến hạn; thẻ đã chấm đến hạn khi `due <= now` |
| `buildWordPositions(lessons: readonly Lesson[]): ReadonlyMap<string, WordPosition>` | `lessons` theo thứ tự lộ trình; với mỗi bài `collectLessonWordIds(lesson.exercises)` (D6) cho danh sách từ theo câu đầu tiên chứa từ rồi thứ tự khai báo trong câu cặp âm (V2 + V3); vị trí = `{ lessonIndex, wordIndex }` của bài **đầu tiên** chứa từ (V1); từ không có trong bài nào thì không có trong map |
| `compareWordPositions(a: Word, b: Word, positions): number` | V1 → V3 theo `WordPosition` (`lessonIndex` rồi `wordIndex`); từ không có vị trí đứng sau (V4) và giữa chúng so `hanzi` theo **mã Unicode từng code point** (không `localeCompare`) |
| `compareSessionCards(a: ReviewItem, b: ReviewItem, positions): number` | Q1 đã chấm trước "mới"; Q2 `due` sớm trước, mọi thẻ "mới" coi như cùng hạn (không đọc `due` của thẻ "mới"); Q3 thứ tự trong `CARD_FACETS`; Q4 `compareWordPositions` |
| `selectReviewSession(cards, wordsById, positions, now): ReviewSession` | bỏ thẻ có `wordId` không có trong `wordsById`; còn lại rỗng → `{ status: 'no-cards' }`; không thẻ nào `isCardDue` → `{ status: 'none-due' }`; ngược lại `{ status: 'ready', items }` đã sort bằng `toSorted(compareSessionCards)` |
| `scheduleCard(card: ReviewCard, rating: ReviewRating, now: number): ReviewCard` | FSRS tham số mặc định, `enable_fuzz: false` (`REVIEW_SCHEDULER` của D5); `toFsrsCard(card)` → `nextFsrsCard(…, gradeOf(rating), now)` → `fromFsrsCard(card.wordId, card.facet, …)`; không mutate `card` |

Tie-break cuối của `compareSessionCards` (Q1–Q4 đều bằng, chỉ xảy ra khi hai `wordId` khác nhau cùng `hanzi` đều ngoài lộ trình) là so
`reviewCardId` theo code point, chỉ để thứ tự xác định; không phải quy tắc nghiệp vụ mới.

**Phần 3 (use case, public)**:

- `getReviewSession(now = Date.now()): Promise<ReviewSession>`: `Promise.all` đọc thẻ, lộ trình, danh sách từ; nạp các bài theo
  `listLessonIdsInOrder` bằng `Promise.allSettled` (bài nạp lỗi bị bỏ khỏi `buildWordPositions`, như `getPathMap`); rồi
  `selectReviewSession`. Đọc thẻ, lộ trình hoặc danh sách từ lỗi → `throw new Error('Không tải được thẻ ôn tập.', { cause })`.
- `reviewCard(card, rating, now = Date.now()): Promise<ReviewCard>`: `scheduleCard` rồi `writeCard`; ghi lỗi → `throw new Error('Không
  lưu được kết quả ôn tập.', { cause })`. Trả thẻ đã lưu.

S6.3 (sau) gọi `ReviewService.scheduleCard`/`reviewCard` cho thẻ chiều viết, không viết quy tắc xếp lịch thứ hai.

### D5. Chuyển thẻ ↔ `ts-fsrs` (`shared/utils/fsrs-card.utils.ts`, mới)

Pure, leaf, **file duy nhất import `ts-fsrs`** sau thay đổi này:

- `CARD_STATE_BY_FSRS_STATE` (chuyển từ `srs.service.ts`) và chiều ngược `FSRS_STATE_BY_CARD_STATE`.
- `fromFsrsCard(wordId, facet, card: Card): ReviewCard`: `Date` → epoch ms (`due`, `last_review` → `lastReview`, bỏ khi `undefined`),
  `State` → chuỗi, snake_case → camelCase. Đúng các field `createNewCard` đang ghi.
- `toFsrsCard(card: ReviewCard): Card`: chiều ngược, `lastReview` không có → `last_review: undefined`.
- `createEmptyFsrsCard(now)` bọc `createEmptyCard(new Date(now))`; `REVIEW_SCHEDULER` (`fsrs(generatorParameters({ enable_fuzz: false
  }))`) và `nextFsrsCard(card: Card, grade, now)` bọc `REVIEW_SCHEDULER.next`. Map `ReviewRating` → `Rating.Again/Hard/Good/Easy`
  (`gradeOf(rating)`) cũng ở đây, vì chỉ file này thấy enum của `ts-fsrs`.
- `SrsService.createNewCard` (S9.1) refactor để gọi `fromFsrsCard(wordId, facet, createEmptyFsrsCard(now))`, bỏ import `ts-fsrs`; test
  S9.1 giữ nguyên và phải xanh (task REFACTOR 2.5). Rule "FSRS mặc định, không ngẫu nhiên" vẫn có comment `Rule:` ở
  `ReviewService.scheduleCard`.

### D6. Vị trí của từ: nguồn "câu chứa từ"

"Câu chứa từ" = câu có từ đó theo **đúng rule "từ của bài" của S9.1** (`collectLessonWordIds`). Danh sách nó trả về đã bỏ trùng và giữ
lần xuất hiện đầu tiên, nên chỉ số trong danh sách sắp đúng V2 (câu đầu tiên chứa từ) rồi V3 (từ khai báo trước trong câu cặp âm). Một
rule cho cả "từ nào có thẻ" và "từ đứng đâu". Mọi loại bài của lộ trình đều xét (spec không loại bài kiểm tra).

Để `ReviewService` không gọi `SrsService`: chuyển thân hàm sang `shared/utils/lesson-words.utils.ts` (`collectLessonWordIds(exercises:
readonly Exercise[]): string[]`, pure); `SrsService.collectLessonWordIds` giữ nguyên chữ ký và comment `Rule:`, ủy quyền sang util (test
S9.1 `srs.service.rules.test.ts` giữ nguyên). Refactor trong task 2.6 (trước RED 3.1).

### D7. Model UI (`shared/models/review.model.ts`, mới)

```ts
export const REVIEW_RATINGS = ['again', 'hard', 'good', 'easy'] as const; // thứ tự nút: Quên, Khó, Được, Dễ
export type ReviewRating = (typeof REVIEW_RATINGS)[number];
export interface ReviewItem { cardId: string; card: ReviewCard; word: Word; } // cardId = reviewCardId(wordId, facet)
export interface WordPosition { lessonIndex: number; wordIndex: number; }
export type ReviewSession =
  | { status: 'no-cards' }
  | { status: 'none-due' }
  | { status: 'ready'; items: readonly ReviewItem[] };
export interface ReviewCounter { position: number; total: number; } // prop bộ đếm của ReviewQuestionFace
```

`ReviewRating` → `Rating` của `ts-fsrs` chỉ map trong `fsrs-card.utils.ts` (D5).

### D8. Hook `useReviewSession` (`pages/review/hooks/useReviewSession.ts`, mới)

```ts
type ReviewSessionView =
  | { status: 'loading' }
  | { status: 'load-error'; isRetrying: boolean; errorId: number }
  | { status: 'no-cards' } | { status: 'none-due' }
  | { status: 'reviewing'; item: ReviewItem; counter: ReviewCounter;
      isAnswerShown: boolean; saveErrorId: number | null }
  | { status: 'finished'; reviewedCount: number };
type ReviewFocusTarget = 'question' | 'answer' | 'status' | 'retry';
interface ReviewSessionState {
  view: ReviewSessionView;
  focusRequest: { target: ReviewFocusTarget; id: number } | null;
  revealAnswer: () => void;
  rate: (cardId: string, rating: ReviewRating) => void;
  retry: () => void;
}
```

- Tạo `ReviewService` bằng `useMemo(() => new ReviewService(), [])` như `useHome`.
- Mount: `getReviewSession(Date.now())` một lần, chốt `items` vào state (Requirement "Thẻ nào được hỏi trong phiên": không đọc lại khi
  thẻ tới hạn trong lúc ôn). Cờ `isActive` khi unmount như `useHome`.
- `revealAnswer` → `isAnswerShown = true`, `focusRequest` `answer`.
- `rate(cardId, rating)`: chặn bấm lặp bằng `useRef<string | null>` giữ `cardId` đang/đã chấm, gán **đồng bộ** trước `await`; `cardId`
  khác thẻ hiện tại hoặc đã nằm trong ref thì bỏ qua (Requirement "Tự chấm 4 mức"). Thành công → sang thẻ kế (`focusRequest`
  `question`) hoặc `finished` (`status`). Lỗi → xóa ref để chấm lại được, `saveErrorId` tăng, thẻ giữ nguyên object ban đầu (lần chấm
  lại tính từ trạng thái trước lần lỗi), **không** đổi focus (nút vừa bấm vẫn còn và giữ focus).
- `retry`: giữ `load-error` với `isRetrying: true` (nút "Thử lại" không biến mất nên focus không rơi), đọc lại với `now` mới; được thì
  `focusRequest` `question` (có thẻ) hoặc `status` (rỗng); vẫn lỗi thì `errorId` tăng và `focusRequest` `retry`.
- Focus chỉ dời sau thao tác của người học; lần mở màn đầu không dời focus.

### D9. Container và component (`pages/review/`)

- `containers/ReviewSessionContainer.tsx`: `<main>` + `<h1>` "Ôn tập"; khi `reviewing` có `<Link className="review-back-link">` "Về
  Trang chủ" ở đầu màn. Giữ 4 ref (mặt hỏi, mặt đáp án, thông báo trạng thái, nút "Thử lại"); một `useEffect` theo `focusRequest?.id`
  gọi `ref.current?.focus()` (đồng bộ DOM, không derive state).
- Số prop tính cả `ref` (React 19 truyền `ref` như prop); mọi component dưới đây ≤ 4 props (`CLAUDE.md` §7: < 5).
- `components/ReviewQuestionFace.tsx` (4 props: `item`, `counter: ReviewCounter`, `onReveal`, `ref`; `ReviewCounter = { position:
  number; total: number }` trong `review.model.ts`): `<section tabIndex={-1} aria-labelledby="<id bộ đếm> <id nội dung>">`, bộ đếm
  "Thẻ x / y" từ `counter`; nội dung theo `item.card.facet`: `meaning` →
  `word.hanzi`; `listening` → `<ListenButton audioPath={word.audio} />` (không tự phát); `writing` → `<ul>` mọi `word.vi`. Nút "Hiện đáp
  án".
- `components/ReviewAnswerFace.tsx` (2 props: `item`, `ref`): `<section tabIndex={-1} aria-labelledby>` tiêu đề "Đáp án", `hanzi`, `pinyin`
  (không đọc `usePinyinVisibility`), mọi `vi`, `<ListenButton>`. Thay mặt hỏi khi `isAnswerShown` (bộ đếm vẫn hiện).
- `components/ReviewRatingButtons.tsx` (2 props: `onRate`, `saveErrorId`): 4 `<button type="button">` theo `REVIEW_RATINGS`, chữ `review:ratings.*`;
  **không** `disabled` khi đang lưu (disabled làm rơi focus; bấm lặp đã chặn ở hook). Lỗi lưu: `<p role="alert" key={saveErrorId}>`.
- `components/ReviewSessionMessage.tsx` (2 props: `message`, `messageRef`): trạng thái rỗng/hết thẻ (`no-cards`, `none-due`,
  `finished`). Thông báo `<p role="status" tabIndex={-1} ref={messageRef}>`, liên kết "Về Trang chủ" (`btn`). "Nút" trong spec ứng với
  `Link` như "Vào học" của S8.1.
- `components/ReviewLoadError.tsx` (4 props: `onRetry`, `isRetrying`, `messageRef`, `retryRef`): lỗi tải. Thông báo `<p role="alert"
  tabIndex={-1} ref={messageRef}>` "Không tải được thẻ ôn tập."; container đặt `key={errorId}` lên component để alert render lại mỗi
  lần lỗi (giữ ≤ 4 props); nút "Thử lại" (`ref={retryRef}`, `aria-busy={isRetrying}`, không `disabled`), liên kết "Về Trang chủ".
  Container ánh xạ `focusRequest` `status` → `messageRef` của component đang hiện, `retry` → `retryRef`.
- Viền focus: nút và link dùng `:focus-visible` toàn cục của `_base.css`, `_review.css` không thêm rule focus cho chúng. Chỉ vùng
  `tabIndex={-1}` (mặt hỏi/đáp án, thông báo) thêm `.review-face:focus, .review-message:focus` có outline cùng token (focus bằng script
  không luôn bật `:focus-visible`). Không vào thứ tự Tab vì `tabIndex={-1}`.
- Không component nào import service (§2).

### D10. Chữ và style

- `assets/i18n/vi/review.json` (mới): `title` "Ôn tập", `counter` "Thẻ {{position}} / {{total}}", `showAnswer` "Hiện đáp án",
  `answerTitle` "Đáp án", `ratings.again|hard|good|easy` "Quên|Khó|Được|Dễ", `backHome` "Về Trang chủ", `noCards` "Bạn chưa có thẻ ôn tập.
  Học xong một bài để có thẻ.", `noneDue` "Không có thẻ nào cần ôn lúc này.", `finished` "Đã ôn xong {{count}} thẻ.", `loadError` "Không
  tải được thẻ ôn tập.", `retry` "Thử lại", `saveError` "Không lưu được kết quả. Hãy chấm lại.". Thông báo audio dùng lại `lesson:listen.error`
  qua `ListenButton`. `home.json` thêm `reviewLink` "Ôn tập". Thêm `review` vào `I18N_NAMESPACES` và `src/test/i18n.ts`.
- `styles/tailwind/components/_review.css` (mới, import trong `main.css`): `.review-*` hyphen-BEM, token semantic (đổi theo theme tối),
  vùng chạm ≥ 44×44 px, `prefers-reduced-motion`. JSX chỉ layout/spacing (§6).

### D11. Kiểm tra `import` (`CLAUDE.md` §2)

| File | Import | Nhánh ❌? |
|---|---|---|
| `ReviewSessionContainer` | `useReviewSession`, components, `ROUTE_PATHS`, react-router `Link` | không |
| `pages/review/components/*` (`ReviewQuestionFace`, `ReviewAnswerFace`, `ReviewRatingButtons`, `ReviewSessionMessage`, `ReviewLoadError`) | `ListenButton` (`shared/components`), `review.model`, `@csk/shared` type | không; không import service |
| `pages/home/components/ReviewEntryLink` | `ROUTE_PATHS`, react-router `Link` | không |
| `useReviewSession` | `ReviewService`, `review.model` | không |
| `review.service.ts` | `progressStore`, `contentSource` (`core/services`), `@csk/shared`, `shared/utils/{fsrs-card,lesson-words,learning-path}.utils`, `review.model` | không; không React, không Dexie, không `ts-fsrs` trực tiếp |
| `srs.service.ts` (refactor) | thêm `fsrs-card.utils`, `lesson-words.utils`; bỏ `ts-fsrs` | không |
| `shared/utils/fsrs-card.utils.ts` | `ts-fsrs`, `@csk/shared` type, `review.model` type | không; không import service |
| `shared/utils/lesson-words.utils.ts` | `@csk/shared` type | không |

### D12. Dữ liệu ngoài cần Zod

- Thẻ đọc từ IndexedDB: `reviewCardSchema` trong `getAllCards` của S9.1 (dòng hỏng bị bỏ = "thẻ đọc không được"). `saveCard` ghi
  `ReviewCard` đã có type, không cần parse.
- Nội dung (`content.json`, bài, `words.json`): schema hiện có trong `ContentSource`.
- Không có dữ liệu ngoài mới (không URL param, không localStorage, không đổi file sao lưu).

### D13. Test

| Tầng | File | Scenario |
|---|---|---|
| Vitest Phần 2 | `shared/services/review.service.schedule.test.ts` | bảng mẫu FSRS (ghi `ts-fsrs 6.0.0` khóa trong lockfile ở đầu file), tính chất lịch ôn |
| Vitest Phần 2 | `shared/services/review.service.session-rules.test.ts` | chọn thẻ, thứ tự Q1–Q4, vị trí V1–V4 |
| Vitest Phần 3 | `shared/services/review.service.review-session.test.ts` | `getReviewSession`/`reviewCard` với `DexieProgressStore` trên fake-indexeddb + `ContentSource` giả |
| Vitest Phần 3 | `shared/services/review.service.backup-roundtrip.test.ts` | xuất → nhập (`BackupService` của `createMachine`) → chấm, so với máy gốc |
| Testing Library | `pages/review/hooks/useReviewSession.test.ts` | danh sách chốt, bấm lặp; đồng hồ chỉ giả `Date` (`vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime`), không giả `setTimeout`/`setImmediate` vì fake-indexeddb dùng chúng |
| Testing Library | `pages/review/containers/ReviewSessionContainer.{faces,rating,states,focus,errors}.test.tsx` | mặt hỏi/đáp án, nút chấm, trạng thái, focus, lỗi; IndexedDB thật (fake-indexeddb) + `mockContentFetch`, `Audio` giả |
| Testing Library | `pages/home/containers/HomeContainer.review.test.tsx` | nút "Ôn tập" |
| e2e | `apps/web/e2e/E9/s9.2-*.spec.ts` + `review-session.helpers.ts` | luồng thật trên bản build |

- Helper Vitest: `src/test/review-session.fixtures.ts`: `openReviewService(lessons)` theo mẫu `openService` của
  `srs-lesson.helpers.ts` (`DexieProgressStore` DB ngẫu nhiên + `makeSource()` có `getLesson` theo bài truyền vào, `getWords` có "你好"
  `pinyin: 'nǐ hǎo'`, `vi: ['xin chào']`, "谢谢" `['cảm ơn', 'cảm ơn bạn']`, "人" `['người']`, "妈", "马"), lộ trình mẫu A → B
  (Scenario V) và A, A', B, D (`test-cases.md`); thẻ "mới" dựng bằng `fromFsrsCard(…, createEmptyFsrsCard(t))`, thẻ đã chấm dựng bằng
  `scheduleCard` (không viết tay field FSRS). Nạp thẻ có sẵn vào DB bằng `store.addNewCards` (DB trống nên không đụng rule không ghi đè).
- e2e dùng lại của S9.1: `serveReviewCardsPath` / `useReviewCardsFixture` (lộ trình mẫu; vị trí "你好" → "谢谢" (bài A) → "人" (bài B) →
  "妈" → "马" (bài D), A' đứng sau B trong fixture nhưng không đổi vị trí nào), `seedReviewProgress`, `readReviewCards`, `newCard`,
  `breakReviewWrites(page, BREAK_CARD_WRITES)` / `restoreReviewWrites` cho "lỗi lưu", `openMachine` / `exportFromSettings` /
  `importAndOverwrite` cho hai máy. Sửa seed "你好" trong `e2e/fixtures/reviewCardsFixtures.ts` từ `nǐhǎo` thành `nǐ hǎo` để khớp
  `test-cases.md` (không spec S9.1 nào kiểm pinyin này; `grep` chỉ thấy dòng seed). "人" thật có `vi` "người; mọi người" nên e2e kiểm
  chứa "người".
- e2e thêm mới trong `e2e/E9/review-session.helpers.ts`: `reviewedCardDueAt(wordId, facet, due)` (thẻ đã chấm với `due` tùy ý, các
  field FSRS lấy từ `reviewedOnceCard`), `seedRawCardRow(page, row)` (ghi một dòng sai `reviewCardSchema` cho "thẻ đọc không được"),
  `breakReviewReads(page)` / `restoreReviewReads(page)` (`page.addInitScript` bọc `getAll` và `openCursor` của `IDBObjectStore.prototype`
  khi `this.name === 'cards'`, theo cờ `sessionStorage`, mẫu `breakReviewWrites`). Bản build không có màn ẩn hay cờ. Đồng hồ: `page.clock`.
  Audio không phát được: `page.route` chặn file mp3.
- File sao lưu mẫu cho QA chạy tay (`test-cases.md`, "Dựng thẻ khi chạy tay"): `apps/web/e2e/E9/fixtures/progress-backup/on-tap-den-han.json`
  ("你好" nghĩa tới hạn từ hôm qua, "谢谢" nghĩa từ 3 ngày trước, "人" nghĩa còn 2 ngày, so với một ngày ghi trong mô tả PR), dùng luôn
  trong e2e AC1 để file chắc chắn nhập được.

## Risks / Trade-offs

- [Tách `ReviewService` khỏi `srs.service.ts` lệch chữ trong bảng layer của proposal] → cùng layer `shared/services/`, lý do giới hạn 300
  dòng; ghi trong mô tả PR, cập nhật `docs/03-architecture.md`; báo điều phối để BA chỉnh chữ proposal nếu muốn.
- [Refactor `SrsService` (S9.1) để dùng `fsrs-card.utils` và `lesson-words.utils`] → không đổi chữ ký public; test S9.1 chạy lại trong
  task refactor, phải xanh trước khi đi tiếp.
- [Đọc mọi bài của lộ trình mỗi lần mở màn] → JSON đã precache, cùng chi phí như `getPathMap`; đo nếu lộ trình lớn, chưa tối ưu.
- [`getAllCards` đọc cả bảng] → vài nghìn dòng vẫn nhẹ; S9.3 có thể đổi sang truy vấn theo index `due` khi thêm giới hạn.
- [Bảng mẫu FSRS gắn phiên bản `ts-fsrs`] → test ghi `6.0.0`; nâng phiên bản phải sửa bảng trong cùng PR (spec AC3).
- [Bấm nút chấm lặp khi React chưa render lại] → chặn bằng ref đồng bộ trong hook, không dựa vào `disabled`.
- [Focus bằng script không bật `:focus-visible` ở mọi trình duyệt] → CSS viền focus cho `:focus` của vùng `tabIndex={-1}`; nút/link
  dựa vào `:focus-visible` toàn cục.
- [Dexie có thể đọc bằng cursor thay `getAll`] → guard đọc bọc cả `getAll` và `openCursor`; test khói 10.1 xác nhận guard làm màn báo lỗi.
- [Lỗi nạp lộ trình/từ (không phải thẻ) chưa có trong spec] → hiện như lỗi tải thẻ (D4), ghi ở Open Questions.

## Migration Plan

Không migrate: không đổi Dexie version, không đổi file sao lưu. Rollback = revert PR code; thẻ đã chấm giữ trạng thái FSRS hợp lệ theo
`reviewCardSchema` của S9.1.

## Open Questions

- Lỗi nạp lộ trình hoặc danh sách từ (thẻ vẫn đọc được) hiện như "Không tải được thẻ ôn tập." + "Thử lại". Spec chỉ nói lỗi đọc thẻ;
  đổi câu thông báo không đổi cách làm hay task.
