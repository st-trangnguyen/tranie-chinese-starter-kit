# Design: S9.1 Tạo thẻ ôn tập

## Context

Động cơ và phạm vi: `proposal.md` (Why, What Changes, Không làm). Hành vi: `specs/review-cards`, `specs/stroke-guided-writing`,
`specs/progress-backup`. Cách QA kiểm: `test-cases.md`.

Hiện trạng đã quan sát trong repo (nhánh cắt từ `main` sau PR spec #148):

- IndexedDB qua Dexie, `core/helpers/db.helper.ts` có version 1–3 với ba bảng `settings`, `lessonProgress`, `dailyStats`. Chưa có
  bảng thẻ. `docs/03-architecture.md` §6.2 đã định bảng `cards` khóa `"wordId:facet"`, index `due`.
- `core/services/progress-store.service.ts` (256 dòng): interface `ProgressStore` + `DexieProgressStore`. Có chuỗi ghi trong tab
  `studyTimeWrites` + `enqueueStudyTimeWrite` (đọc chờ ghi, `importAll` xếp hàng sau ghi); `exportAll`/`importAll` đọc/ghi ba bảng
  trong một transaction. JSDoc đã ghi "thêm bảng `cards` phải thêm vào `exportAll`, `importAll` và schema file".
- `shared/services/` có 3 phần với banner; service nhận `ProgressStore` và `ContentSource` qua constructor có mặc định singleton
  (`BackupService`, `LessonService`). Chưa có `srs.service.ts`. `LessonService` có cổng `WrongAnswerSink` (no-op) cho S9.4.
- Từ trong nội dung: `Word.id` (hiện trùng chữ Hán, ví dụ `'人'`, nhưng không được dựa vào đó), `Word.hanzi`. Câu tham chiếu từ qua
  `wordId` (tone-choice, pinyin-type, stroke-write, speak) hoặc `wordIds` (sound-pair); speak câu dùng `sentenceId`.
  `ContentService.collectContentIds` đã có rule lấy ID.
- Danh sách chữ có dữ liệu nét: `ContentSource.getStrokeIndex()`; rule `StrokeOrderService.hasStrokeData`.
- Màn bài: `useLessonRunner` chạy `LessonService.finishLesson` đúng một lần khi phiên `finished`, trong hàng đợi `saveQueueRef`.
  `summarizeSession(...).isComplete` của bài thường = đã hết câu và không bỏ qua câu nào. Kiểm tra vượt cấp chạy bài `type: 'test'`
  cùng container (`placementUnitId`).
- Câu viết trong bài: `useLessonStrokeWrite` giữ lượt viết trong `practiceRef`, gọi `WritingPracticeService.lessonResultOf`
  (chỉ khác `null` đúng một lần lúc vừa xong chữ). Màn luyện viết: `useWritingPractice` cập nhật lượt viết bằng updater của
  `setPractice`, chưa ghi gì.
- Sao lưu: `packages/shared/src/progress-backup.schema.ts` (`PROGRESS_BACKUP_FORMAT_VERSION = 1`, `progressBackupV1Schema`
  chặt, không `.catch`), `BackupService.checkBackupText` phân loại `not-backup` · `newer-version` · `corrupted` · `valid`. File mẫu
  e2e S8.5 `apps/web/e2e/E8/fixtures/progress-backup/ban-moi-hon.json` đang dùng `formatVersion: 2` làm "bản mới hơn".
- e2e: thay nội dung bằng `page.route` + `serviceWorkers: 'block'` (`serveBackupPath`), đọc/ghi IndexedDB thô bằng `page.evaluate`
  (`home.helpers.ts`, `intro-lessons.helpers.ts`), làm hỏng ghi một bảng bằng guard `IDBObjectStore.prototype.put/add`
  (`backup.helpers.ts` `breakLessonProgressWrites`). Mở bài trực tiếp bằng URL `/lessons/:lessonId` (màn bài không chặn bài khóa).
- e2e offline có service worker (S8.4 D12): `vite.config.ts` thêm `offlineFixturesPlugin()` (build, emit bài `e2e-*` vào
  `content/lessons/`) và `offlineAudioNetworkPlugin()` (`vite preview`, trả `content.json`… gộp mẫu khi có cookie
  `csk-e2e-fixture=offline-audio`) chỉ khi `mode === 'e2e'`; `playwright.config.ts` chạy `pnpm build --mode e2e` +
  `vite preview --mode e2e`. File trong `e2e/fixtures/` được `vite.config.ts` nạp tĩnh nên chỉ `import type` từ `@csk/shared`.
  `openOnceWithServiceWorker` (E8) chờ service worker điều khiển trang.
- `ts-fsrs` chưa có trong `apps/web/package.json` (đã được duyệt thêm, proposal Dependencies).

## Goals / Non-Goals

**Goals:**

- Một nơi giữ mọi quy tắc tạo thẻ: `SrsService` Phần 2 (pure), hai use case Phần 3 gọi từ ba hook.
- Thẻ lưu đủ trạng thái FSRS để S9.2 chấm tiếp mà không đổi cấu trúc dữ liệu (proposal S9.2 Dependencies ràng buộc điều này).
- Một lần nâng Dexie (version 4) gồm cả hai bảng mới; một lần nâng định dạng file sao lưu (version 2), vẫn đọc version 1.
- Lỗi lưu thẻ / chữ đã viết không đổi gì người học thấy.

**Non-Goals:**

- Không lưu nguồn gốc thẻ, thời điểm tạo, lịch sử ôn (`reviewLogs` thuộc S9.2+ nếu cần).
- Không thêm `getDueCards`/`upsertCard` (S9.2), không thêm màn, chuỗi i18n hay CSS.
- Không có bước tạo bù khi mở app hay sau khi nhập (spec "Không tạo bù thẻ"): không có code nào chạy lúc khởi động.

## Decisions

### D1. Bảng IndexedDB mới, Dexie version 4 (`core/helpers/db.helper.ts`)

```ts
db.version(4).stores({
  settings: 'key',
  lessonProgress: 'lessonId',
  dailyStats: 'date',
  cards: 'id, due',             // id = `${wordId}:${facet}`; index `due` cho S9.2
  writtenCharacters: 'character',
});
```

- Row type (chưa tin cậy, validate khi đọc): `CardRow { id: string; [field: string]: unknown }`,
  `WrittenCharacterRow { character: string; [field: string]: unknown }`. `AppDatabase` thêm `cards`, `writtenCharacters`.
- Hai bảng mới, không đụng dữ liệu cũ, nên không cần hàm `upgrade`. Không sửa version 1–3.
- `writtenCharacters` chỉ lưu chữ (một dòng mỗi chữ Hán đã viết xong trên khung có gợi ý), không lưu nguồn hay thời điểm: spec chỉ cần
  "đã viết ít nhất một lần".
- Thay thế đã cân nhắc: khóa chính kép `[wordId+facet]` (không cần field `id`). Không chọn vì kiến trúc đã định `"wordId:facet"` và
  S9.2+ cần một `cardId` chuỗi đơn cho log/tham chiếu.

### D2. Schema Zod thẻ và chữ đã viết (`packages/shared/src/review-card.schema.ts`, mới; export ở `index.ts`)

```ts
export const CARD_FACETS = ['meaning', 'listening', 'writing'] as const;   // nghĩa · nghe · viết
export type CardFacet = (typeof CARD_FACETS)[number];
export const CARD_STATES = ['new', 'learning', 'review', 'relearning'] as const; // 'new' = "mới"
export type CardState = (typeof CARD_STATES)[number];

export const reviewCardSchema = z.object({
  wordId: idSchema,                                   // từ lạ (không có trong nội dung) vẫn hợp lệ
  facet: z.enum(CARD_FACETS),
  state: z.enum(CARD_STATES),
  due: z.number().int().nonnegative(),                // epoch ms
  stability: z.number().finite().nonnegative(),
  difficulty: z.number().finite().nonnegative(),
  elapsedDays: z.number().finite().nonnegative(),
  scheduledDays: z.number().finite().nonnegative(),
  learningSteps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  lastReview: z.number().int().nonnegative().optional(), // epoch ms, thẻ mới không có
});
export type ReviewCard = z.infer<typeof reviewCardSchema>;

/** Khóa thẻ trong DB và khóa so trùng trong file: `${wordId}:${facet}`. */
export const reviewCardId = (wordId: string, facet: CardFacet): string => `${wordId}:${facet}`;

export const writtenCharacterSchema = z.object({ character: hanCharacterSchema }); // dòng DB
```

- `reviewCardId` không escape `wordId` (`${wordId}:${facet}`). Rủi ro trùng khóa không đáng kể: ID từ là từ tiếng Trung, `facet`
  là một trong ba giá trị cố định, nên hai cặp khác nhau chỉ trùng khi `wordId` chứa `:` + tên facet, điều nội dung không có.
- Field mirror `Card` của `ts-fsrs` (đổi snake_case → camelCase, `Date` → epoch ms, `State` số → chuỗi) để S9.2 đổi hai chiều không
  mất gì. Không import `ts-fsrs` trong `@csk/shared` (dependency chỉ ở `apps/web`, chỉ dùng trong `srs.service`).
- Một schema dùng cho cả DB và file: thẻ thiếu một field FSRS thì không chấm tiếp được, nên dòng DB hỏng bị bỏ cả dòng (như
  `lessonProgress` hỏng), file có thẻ sai thì cả file `corrupted`. Không có bản khoan dung `.catch` từng field.
- `idSchema` cần export từ `content.schema.ts` (hiện đã `export const idSchema`), import nội bộ trong package.
- Thay thế: `due` dạng chuỗi ISO cho file dễ đọc. Không chọn: app dùng `now: number` khắp nơi, index Dexie trên số so sánh đúng thứ
  tự, và một biểu diễn cho cả DB lẫn file thì `exportAll` không phải đổi kiểu.

### D3. `ProgressStore` (`core/services/progress-store.service.ts` + file interface mới)

File hiện 256 dòng; thêm method sẽ vượt 300 (`CLAUDE.md` §5). Tách interface `ProgressStore` (kèm JSDoc hợp đồng) sang
`core/services/progress-store.interface.ts`; `progress-store.service.ts` `export type { ProgressStore } from './progress-store.interface'`
để mọi import hiện có không đổi. Thêm helper private `parseRows(rows, schema)` thay ba khối `flatMap(safeParse)` lặp lại.

Method mới:

| Method | Hành vi |
|---|---|
| `getAllCards(): Promise<ReviewCard[]>` | `await this.studyTimeWrites`; mọi dòng `cards` qua `reviewCardSchema.safeParse`, dòng hỏng bị bỏ |
| `addNewCards(cards: readonly ReviewCard[]): Promise<void>` | Nối vào chuỗi ghi. Một transaction `rw` trên `cards`: đọc khóa đã có của các `reviewCardId`, `bulkAdd` chỉ thẻ chưa có (thêm `id`). Thẻ đã có không bị ghi đè (giữ trạng thái và lịch ôn kể cả khi hai tab cùng tạo). Rỗng thì không mở transaction. Lỗi thì reject, không thẻ nào được ghi |
| `getWrittenCharacters(): Promise<string[]>` | `await this.studyTimeWrites`; dòng qua `writtenCharacterSchema`, hỏng bị bỏ |
| `addWrittenCharacter(character: string): Promise<void>` | Nối vào chuỗi ghi; `put({ character })` (viết lại không tạo dòng mới) |

- Đổi tên chuỗi ghi `studyTimeWrites`/`enqueueStudyTimeWrite` thành `pendingWrites`/`enqueueWrite` (REFACTOR, không đổi hành vi) vì
  giờ chuỗi dùng cho mọi lần ghi cần đọc thấy ngay: chữ vừa viết ở câu viết trong bài phải được thấy khi bài kết thúc vài giây sau
  (spec "Câu viết trong bài tính ngay trong lượt làm bài"), và `exportAll` thấy thẻ vừa tạo.
- Bên trong transaction Dexie (`exportAll` năm bảng, transaction `rw` của `addNewCards`, `writeSnapshot`) phải đọc bảng thô
  (`db.cards.toArray()`, `bulkGet`…) rồi qua `parseRows` như `exportAll` hiện làm; **không** gọi method public `getAllCards`,
  `getWrittenCharacters` hay method nào `await this.pendingWrites`. Chờ promise ngoài Dexie trong transaction làm transaction tự
  commit sớm, và chờ chuỗi ghi từ bên trong một lần ghi đang nằm trong chuỗi đó thì deadlock.
- `exportAll`/`importAll`: transaction gồm năm bảng. `ProgressSnapshot` thêm `cards: ReviewCard[]` và `writtenCharacters: string[]`.
  `writeSnapshot` `clear()` cả năm bảng rồi ghi (`cards` thêm `id`); lỗi giữa chừng thì Dexie abort, cả năm bảng giữ nguyên.
- "Không ghi đè thẻ đã có" ở `addNewCards` là ràng buộc toàn vẹn dữ liệu (như khóa duy nhất), không phải quy tắc nghiệp vụ: quyết
  định tạo thẻ nào vẫn ở `SrsService` Phần 2.
- Thay thế: `putCards` ghi đè. Không chọn: hai tab cùng xong một bài, hoặc S9.2 vừa chấm thẻ lúc tab kia tạo thẻ, sẽ đặt lại lịch ôn,
  trái spec "thẻ đã có SHALL giữ nguyên trạng thái và lịch ôn".

### D4. `SrsService` (`shared/services/srs.service.ts`, mới)

`constructor(store: ProgressStore = progressStore, content: ContentSource = contentSource)`. Import `ts-fsrs` chỉ ở file này.

**Phần 1 — truy cập dữ liệu (private):** `readAllCards`, `writeNewCards`, `readWrittenCharacters`, `writeWrittenCharacter`
(qua `ProgressStore`), `readWords` (`content.getWords()`), `readStrokeCharacters` (`content.getStrokeIndex()`).

**Phần 2 — quy tắc nghiệp vụ (public, pure, mỗi method có `// Rule:`):**

| Method | Rule |
|---|---|
| `isCardEligibleLesson(lessonType: Lesson['type'], session: LessonSession): boolean` | Chỉ bài `type: 'lesson'` kết thúc không bỏ câu nào (`summarizeSession(session, 'lesson').isComplete`). Bài `test` (cuối chủ đề, vượt cấp) luôn `false` |
| `collectLessonWordIds(exercises: readonly Exercise[]): string[]` | Bảng "Từ nào của bài được tạo thẻ": `wordId` của câu một từ, cả hai `wordIds` của câu cặp âm, câu `speak` có `sentenceId` không có từ. Bỏ trùng, giữ thứ tự |
| `charactersOf(hanzi: string): string[]` | Chữ Hán của từ (lọc bằng `hanCharacterSchema`, bỏ trùng) |
| `countsAsStrokeWritten(writing: CharacterWriting): boolean` | Chỉ lần viết xong trên khung có gợi ý (`isGuided: true`) |
| `isWordLearned(wordId, cards, completingWordIds: ReadonlySet<string>): boolean` | Bảng "Từ đã học xong cho thẻ chiều viết": có thẻ `meaning` của từ, hoặc từ thuộc bài đang làm xong |
| `canHaveWritingCard(word: Word, writtenCharacters: ReadonlySet<string>, strokeCharacters: ReadonlySet<string>): boolean` | Mọi chữ của từ có dữ liệu nét **và** đã viết xong |
| `createNewCard(wordId, facet, now: number): ReviewCard` | Thẻ "mới" từ `createEmptyCard(new Date(now))` của `ts-fsrs`, đổi sang `ReviewCard` (D2) |
| `planLessonCards(input: LessonCardPlanInput): ReviewCard[]` | Thẻ còn thiếu cho bài vừa xong: `meaning` + `listening` mọi từ của bài; `writing` cho từ của bài có trong nội dung và `canHaveWritingCard`. Bỏ thẻ đã có (`reviewCardId`) |
| `planWritingCards(input: WritingCardPlanInput): ReviewCard[]` | Sau một lần viết: thẻ `writing` còn thiếu cho các từ trong nội dung chứa chữ vừa viết, `isWordLearned` (không có bài đang làm xong) và `canHaveWritingCard` |
| `addWrittenCharacter(written: ReadonlySet<string>, writing: CharacterWriting): ReadonlySet<string>` | Tập chữ đã viết sau lần viết; lần viết không gợi ý không đổi tập (dùng cho Scenario "Viết không gợi ý không tính" ở tầng quy tắc) |

Type mới ở `shared/models/review-card.model.ts`: `CharacterWriting { character: string; isGuided: boolean }`,
`LessonCardPlanInput { wordIds; wordsById: ReadonlyMap<string, Word>; cards; writtenCharacters; strokeCharacters; now }`,
`WritingCardPlanInput { character; words: readonly Word[]; cards; writtenCharacters; strokeCharacters; now }`.

**Phần 3 — use case (public):**

- `createCardsForFinishedLesson(lesson: Lesson, session: LessonSession, now = Date.now()): Promise<void>`
  1. `isCardEligibleLesson` sai thì trả về, không đọc/ghi gì.
  2. Đọc song song thẻ, chữ đã viết, từ, danh sách chữ có nét (Phần 1).
  3. `planLessonCards` → `writeNewCards` (một transaction cho cả bài). Đọc hoặc ghi lỗi: `throw new Error('Không tạo được thẻ ôn tập.', { cause })`.
- `recordCharacterWriting(writing: CharacterWriting, now = Date.now()): Promise<void>`
  1. `countsAsStrokeWritten` sai thì trả về (không ghi, không tạo thẻ).
  2. `writeWrittenCharacter` **trước mọi `await` khác** để lần ghi vào chuỗi của store ngay khi gọi. Lỗi:
     `throw new Error('Không ghi nhận được chữ đã viết.', { cause })`; chưa ghi nhận thì không xét thẻ (lần viết lỗi không được tính).
  3. Đọc thẻ, chữ đã viết, từ, danh sách chữ có nét → `planWritingCards` → `writeNewCards`. Lỗi:
     `throw new Error('Không tạo được thẻ chiều viết.', { cause })` (chữ đã được ghi nhận, thẻ tạo ở lần viết hoặc xong bài sau).
- Hai use case không nuốt lỗi; hook nuốt (D5), vì spec cấm báo lỗi cho người học còn test use case cần thấy lỗi.
- Không có use case nào chạy lúc mở app, nhập file hay đánh dấu vượt cấp: đó là cách đáp ứng "Không tạo bù" và "Bài được mở nhờ kiểm
  tra vượt cấp không tạo thẻ".
- Thay thế đã cân nhắc: gọi tạo thẻ bên trong `LessonService.finishLesson` qua một cổng kiểu `WrongAnswerSink`. Không chọn: kiến trúc
  §5 ghi `useLessonRunner` gọi `SrsService` để tạo thẻ, proposal đặt việc gọi ở hook; và lỗi tạo thẻ không được ảnh hưởng `isSaved`
  của tổng kết, tách khỏi `finishLesson` thì không phải phân biệt hai loại lỗi trong một kết quả.

### D5. Nối vào ba hook (không đổi giao diện, props hay chữ)

- **`pages/lesson/hooks/useLessonRunner.ts`**: `srsService = useMemo(() => new SrsService(), [])`. Trong effect kết thúc bài, sau
  bước `finishLesson` (và `setUnsavedLessonId`), cùng hàng đợi `saveQueueRef`:
  `.then(() => srsService.createCardsForFinishedLesson(openedLesson, latest)).catch(() => undefined)`.
  `openedLesson = current?.lesson ?? null` thêm vào dependency của effect (cờ `finishedLessonIdRef` vẫn chặn chạy hai lần). Tạo thẻ
  chạy bất kể ghi tiến độ bài thành công hay không (kể cả khi `finishLesson` trả `isSaved: false` hoặc reject; đã chốt ở Open
  Questions, người thật xác nhận 2026-11-25) và không đổi `isSaved` (spec "Không lưu được thẻ thì bài vẫn xong").
- **`pages/lesson/hooks/useLessonStrokeWrite.ts`**: thêm `srsService`. Trong `recordStrokeAttempt`, khi `lessonResult` khác `null`
  (vừa xong chữ), gọi `srsService.recordCharacterWriting({ character, isGuided: true }).catch(() => undefined)` rồi `onResult`.
  `character` vào dependency của `useCallback` (đổi chữ = đổi câu, khung dựng lại theo `exerciseId`).
- **`pages/writing-practice/hooks/useWritingPractice.ts`**: chuyển sang `practiceRef` gán đồng bộ (mẫu `useLessonStrokeWrite`) để
  thấy lượt trước/sau trong handler, không đặt side effect trong updater của `setState`. Dòng đầu tiên của effect nạp chữ (chạy khi
  `character` đổi và khi `retry` tăng `attempt`) là `practiceRef.current = null`, giống `useLessonStrokeWrite` (dòng 39–40), để nét
  của chữ mới không bị so với lượt viết của chữ trước trong lúc chữ mới đang nạp; ref `null` thì handler bỏ qua nét. `restart` và
  lúc nạp xong gán lại ref.
  Khi `writingPracticeService.hasJustCompleted(previous, next)` thì gọi `recordCharacterWriting({ character: view.character,
  isGuided: true }).catch(() => undefined)`. Viết lại rồi xong lần nữa thì gọi lần nữa (idempotent).
- **`WritingPracticeService`** thêm Phần 2 `hasJustCompleted(previous, next): boolean` (Rule: lượt viết vừa chuyển sang xong chữ);
  `lessonResultOf` dùng lại rule này (REFACTOR, test S7.1 hiện có giữ nguyên).
- Thay thế: effect theo dõi `practice.isComplete` để ghi nhận. Không chọn: `.claude/rules/react.md` (side effect thuộc event handler),
  và StrictMode chạy effect hai lần.

### D6. File sao lưu version 2 (`packages/shared/src/progress-backup.schema.ts`, `shared/services/backup.service.ts`)

- `PROGRESS_BACKUP_FORMAT_VERSION = 2`. `progressBackupV1Schema` giữ nguyên nhưng `formatVersion: z.literal(1)` (thôi trỏ hằng số).
- `progressBackupV2Schema = progressBackupV1Schema.extend({ formatVersion: z.literal(2), cards: z.array(reviewCardSchema)
  .refine(không trùng reviewCardId), writtenCharacters: z.array(hanCharacterSchema).refine(không trùng) })`.
  Thẻ sai chiều / thiếu field, thẻ trùng, chữ trùng → `corrupted`. Thẻ của `wordId` lạ, chữ không có trong nội dung hoặc không có dữ
  liệu nét → hợp lệ, giữ nguyên (không đối chiếu nội dung).
- `ProgressBackupFile` = hình dạng version 2. `checkBackupText`: vỏ → `formatVersion > 2` thì `newer-version` → `1` thì parse V1 rồi
  Phần 2 `upgradeV1File(v1)` (Rule: file trước S9.1 nhập như không có thẻ và chữ đã viết: `cards: []`, `writtenCharacters: []`,
  `formatVersion: 2`) → còn lại parse V2. Không qua → `corrupted`. `buildBackupFile`, `inspectImportFile` đưa thêm hai field vào
  snapshot. Bản xem trước (`ImportPreview`) không đổi (spec: hộp xác nhận không thêm số thẻ).
- Vì ghi đè cả năm bảng (D3), nhập file version 1 xóa hết thẻ và chữ đã viết trên máy (spec "Nhập file sao lưu bản cũ").
- File mẫu S8.5 `ban-moi-hon.json` đổi `formatVersion` thành `3` (asset); test S8.5 dùng `2` làm "bản mới hơn" đổi thành
  `PROGRESS_BACKUP_FORMAT_VERSION + 1`.
- Thay thế: một schema với `cards`/`writtenCharacters` `.optional()` không tăng version. Không chọn: kiến trúc §6.3 yêu cầu đổi hình
  dạng file thì tăng version, và app cũ (version 1) gặp file mới phải báo "bản mới hơn" thay vì nhập mất thẻ.

### D7. Dependency `ts-fsrs`

- Thêm vào `catalog` của `pnpm-workspace.yaml` (bản ổn định mới nhất khi cài, ghi trong PR) và `apps/web/package.json`
  `"ts-fsrs": "catalog:"`. Chỉ `srs.service.ts` import (`createEmptyCard`, `State`). Đổi `State` (enum số của thư viện) sang
  `CardState` bằng bảng tra `Record`, không khai báo `enum` mới (`CLAUDE.md` §7).
- Task cài đặt là config thuần, miễn test-first; `createNewCard` có test ở Phần 2.

### D8. Kiểm tra `import` (`CLAUDE.md` §2)

| File | Import mới | Nhánh ❌? |
|---|---|---|
| `shared/services/srs.service.ts` | `@csk/shared`, `ts-fsrs`, `@core/services/progress-store.service`, `@core/services/content-source.service`, `@shared/models/*`, `@shared/utils/lesson-session.utils` | Không (không React, không Dexie, không UI) |
| `shared/services/backup.service.ts` | thêm type từ `@csk/shared` | Không |
| `core/services/progress-store.*` | `@csk/shared`, `@core/helpers/db.helper` | Không (không gọi `shared/services`) |
| `pages/lesson/hooks/*`, `pages/writing-practice/hooks/*` | `@shared/services/srs.service` | Không (hook → shared/services là chiều đúng) |
| `pages/*/containers`, `components`, `shared/components/exercises` | không đổi import | — |

`no-restricted-imports` trong `eslint.config.mjs` đã phủ các nhánh này; `pnpm lint` là bằng chứng.

### D9. Dữ liệu ngoài cần Zod (`CLAUDE.md` §0.4)

| Nguồn | Schema |
|---|---|
| Dòng `cards` đọc từ IndexedDB | `reviewCardSchema` (`safeParse`, hỏng thì bỏ dòng) |
| Dòng `writtenCharacters` từ IndexedDB | `writtenCharacterSchema` |
| File sao lưu | vỏ → `progressBackupV1Schema` hoặc `progressBackupV2Schema` |
| Từ, danh sách chữ có nét | đã validate trong `FetchContentSource` (`wordSchema`, `strokeIndexSchema`) |
| Kết quả `ts-fsrs` | dữ liệu trong bộ nhớ của thư viện có type, không phải dữ liệu ngoài; đổi sang `ReviewCard` có type tường minh |

Không có `as ReviewCard`; e2e đọc DB trả `unknown` rồi kiểm bằng `expect`.

### D10. Test

Tầng theo `docs/05-standards/spec-driven.md` §4 và bảng cuối `test-cases.md`. Tên test chứa ID và tên Scenario.

| File test | Tầng | Phủ |
|---|---|---|
| `packages/shared/src/review-card.schema.test.ts` | schema | `reviewCardSchema`, `reviewCardId`, `writtenCharacterSchema` |
| `packages/shared/src/progress-backup.schema.test.ts` (sửa) | schema | V1 literal 1, V2: thẻ sai, trùng, chữ trùng, từ lạ |
| `apps/web/src/app/core/services/progress-store.review-cards.test.ts` | store (fake-indexeddb, DB tên ngẫu nhiên) | 4 method mới, nâng v3 → v4 giữ dữ liệu, dòng hỏng bị bỏ, `addNewCards` không ghi đè |
| `apps/web/src/app/core/services/progress-store.backup.test.ts` (sửa) | store | `exportAll`/`importAll` năm bảng, lỗi giữa chừng giữ thẻ |
| `apps/web/src/app/shared/services/srs.service.rules.test.ts` | Phần 2, pure | các rule D4 |
| `apps/web/src/app/shared/services/srs.service.lesson.test.ts` | Phần 3 + `DexieProgressStore` thật + `ContentSource` giả | `createCardsForFinishedLesson` |
| `apps/web/src/app/shared/services/srs.service.writing.test.ts` | Phần 3 | `recordCharacterWriting` |
| `apps/web/src/app/shared/services/backup.service.review-cards.test.ts` | Phần 2 + 3 (máy A/B, `backup-machine.helpers.ts`) | xuất/nhập thẻ, file cũ, trùng, lạ |
| `apps/web/src/app/shared/services/backup.service.review-fixtures.test.ts` | guard file mẫu | mỗi file mẫu E9 ra đúng kết quả kiểm |
| `apps/web/src/app/pages/lesson/hooks/useLessonRunner.reviewCards.test.ts` | hook (`renderHook`, `mockContentFetch`) | gọi tạo thẻ đúng lúc, bài test/vượt cấp không tạo |
| `apps/web/src/app/pages/lesson/hooks/useLessonStrokeWrite.reviewCards.test.ts` | hook | câu viết ghi nhận chữ |
| `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.reviewCards.test.tsx` | container | lưu thẻ lỗi: tổng kết hiện, không `alert` |
| `apps/web/src/app/pages/writing-practice/containers/WritingPracticeContainer.reviewCards.test.tsx` | container | ghi nhận chữ, S6.2 không đổi giao diện, lưu lỗi không báo |
| `apps/web/src/app/shared/services/writing-practice.service.test.ts` (sửa) | Phần 2 | `hasJustCompleted` |

- Hook/container test đọc kết quả qua `progressStore.getAllCards()` / `getWrittenCharacters()` (singleton trên fake-indexeddb), xoá
  năm bảng trong `beforeEach`. Lỗi lưu: `vi.spyOn(DexieProgressStore.prototype, 'addNewCards' | 'addWrittenCharacter')
  .mockRejectedValueOnce(...)` (ranh giới IndexedDB, mẫu S8.5 spy `importAll`).
- Năm object `ProgressStore` viết tay trong test cũ (`progress.service.test.ts`, `progress.service.study-time.test.ts`,
  `progress.service.streak-flow.test.ts`, `lesson.service.test.ts` ×2) thêm stub 4 method mới; snapshot dựng tay trong test S8.5
  thêm `cards: []`, `writtenCharacters: []`. Sửa trong commit `test(...)` đầu tiên cần đến (typecheck sạch).

**e2e** (`apps/web/e2e/E9/`, Playwright trên bản build):

- `review-cards.content.ts`: lộ trình mẫu (`content.json`), bài mẫu, từ thêm. Lesson ID và tên bài người học thấy:

  | Bài mẫu (`test-cases.md`) | `lessonId` | Tiêu đề | Câu |
  |---|---|---|---|
  | A (你好, 谢谢) — bài 1 của lộ trình | `s91-a` | Bài mẫu A | pinyin-type `你好`, pinyin-type `谢谢` (từ nhiều âm tiết dùng pinyin-type như `intro-02`) |
  | A' (có câu bỏ qua được) | `s91-a-skip` | Bài mẫu A' | như A + stroke-write `杯` (không có dữ liệu nét → nút "Bỏ qua câu này") |
  | B (人) | `s91-b` | Bài mẫu B | tone-choice `人`, pinyin-type `人` |
  | C (viết 人) | `s91-c` | Bài mẫu C | stroke-write `人`, tone-choice `人` |
  | D (cặp âm 妈/马) | `s91-d` | Bài mẫu D | sound-pair `['妈','马']`, đáp án `妈` |
  | E (chỉ câu) | `s91-e` | Bài mẫu E | speak `sentenceId: 'intro-02-nihao'` |
  | F (你), G (你, 好), H (你好) | `s91-f`, `s91-g`, `s91-h` | Bài mẫu F/G/H | tone-choice `你`, `好`; pinyin-type `你好` |
  | K (không nét) | `s91-k` | Bài mẫu K | tone-choice + pinyin-type `杯` (chữ `杯` không có trong `strokes/index.json`) |
  | Chủ đề KT | `s91-kt-1`, `s91-kt-test` (`type: 'test'`, có từ `八` không có ở `s91-kt-1`) | Bài KT 1 / Kiểm tra KT | |
  | Chủ đề VC | `s91-vc1` (pinyin-type `你好` ×2), `s91-vc2` (人), `s91-vc-test` (`type: 'test'`) | Bài VC1 / VC2 / Kiểm tra VC | chủ đề cuối, chưa mở |

  Từ không có trong `words.json` thật (`你好`, `妈`, `马`) được thêm vào bản `words.json` phục vụ trong test, dùng lại `audio` của một từ
  thật (đúng `audioPathSchema`). Từ lạ cho `the-tu-la`: `wordId` `'龘龘'`; chữ lạ cho `chu-la`: `'龘'` (không có trong nội dung).
  Dữ liệu nằm ở `apps/web/e2e/fixtures/reviewCardsFixtures.ts` (D12), `review-cards.content.ts` re-export và validate bằng Zod.
- `review-cards.helpers.ts`: `serveReviewCardsPath(page)` (`page.route` cho `content.json`, `lessons/s91-*.json`, `words.json`;
  cần `serviceWorkers: 'block'`, mẫu `serveBackupPath`; dùng cho mọi spec E9 **trừ** spec offline);
  `useReviewCardsFixture(context)` (đặt cookie `csk-e2e-fixture=review-cards` trước lần mở trang đầu, mẫu
  `useOfflineAudioFixture`; chỉ spec offline, D12); `readReviewCards(page)` và `readWrittenCharacters(page)` (`page.evaluate`
  mở `indexedDB.open('tranie-chinese')` không chỉ version, `getAll` bảng, trả mảng sắp theo `id`; mẫu `home.helpers.ts`);
  `seedReviewProgress(page, { lessonProgress?, cards?, writtenCharacters? })` (sau khi app đã mở một lần để Dexie tạo version 4, ghi
  thô rồi `reload`; thẻ "đã ôn một lần" = `state: 'review'`, `due`/`lastReview` cố định); `breakReviewWrites(page, tables)` /
  `restoreReviewWrites(page)` (guard `put`/`add` theo `this.name`, cờ trong `sessionStorage`, mẫu `breakLessonProgressWrites`):
  "lỗi lưu" = `['cards', 'writtenCharacters']`, "lỗi lưu thẻ" = `['cards']`. "Lỗi ghi khi nhập" dùng lại
  `breakLessonProgressWrites` (transaction năm bảng abort). Viết chữ: dùng lại `writeCharacter`/`drawMedian` (`E6`, `E7` helpers).
- File mẫu sao lưu `apps/web/e2e/E9/fixtures/progress-backup/`: `the-nihao.json`, `the-sai-chieu.json`, `the-trung.json`,
  `chu-trung.json`, `the-tu-la.json`, `chu-la.json`, `chu-khong-net.json` (version 2) và `ban-truoc-s9-1.json` (version 1, như bản
  `main` trước S9.1 xuất, `s91-a` completed). Nội dung đúng mô tả `test-cases.md`.
- Spec file: `s9.1-review-cards-lesson.spec.ts`, `s9.1-review-cards-placement.spec.ts`, `s9.1-review-cards-writing.spec.ts`,
  `s9.1-review-cards-errors.spec.ts`, `s9.1-review-cards-offline.spec.ts`, `s9.1-review-cards-backup.spec.ts`,
  `s9.1-review-cards-backup-reject.spec.ts` (mỗi file < 300 dòng). Hồi quy S8.5: thêm kiểm "danh sách thẻ máy B rỗng" vào
  TC-S8.5-AC1-20 trong `e2e/E8/s8.5-roundtrip.spec.ts`.
- Offline (`s9.1-review-cards-offline.spec.ts`): **không** `serviceWorkers: 'block'`, không `serveReviewCardsPath`. Nội dung mẫu
  có trong bản build e2e và được service worker precache cùng code (D12); `context.setOffline(true)` sau khi service worker đã
  điều khiển trang.

### D11. Tài liệu

`docs/03-architecture.md`: §4 dòng `srs.service` (rule + use case S9.1), §6.2 bảng `cards` (field D2, Dexie version 4) và bảng mới
`writtenCharacters`, §6.3 method store mới + `ProgressSnapshot` + file version 2, §5 ví dụ hook gọi `SrsService`. Docs thuần, miễn
test-first.

### D12. Nội dung mẫu E9 trong bản build e2e (spec offline)

Quyết định của người thật (2026-11-25), thay cho "nội dung mẫu do `page.route` phục vụ khi offline". Bằng chứng (lần chạy task
9.2): với `serviceWorkers: 'block'` + `setOffline(true)`, bấm vào bài thì `GET /assets/LessonRunnerContainer-*.js` lỗi
`net::ERR_INTERNET_DISCONNECTED` → "Failed to fetch dynamically imported module" → app hiện "Có lỗi xảy ra". Không có service worker
thì chunk lazy-load không tải được khi offline; `page.route` chỉ thay được nội dung, không thay được code. Vì vậy spec offline cho
service worker chạy, và nội dung mẫu phải nằm trong thứ service worker precache. Theo mẫu S8.4 D12 (build + preview, cookie):

- **Dữ liệu** `apps/web/e2e/fixtures/reviewCardsFixtures.ts` (mới, chuyển từ `e2e/E9/review-cards.content.ts`, không đổi giá trị):
  `REVIEW_LESSON_IDS`, `REVIEW_LESSON_TITLES`, `REVIEW_UNIT_TITLES`, hằng chữ/từ lạ, `REVIEW_LESSONS: readonly Lesson[]`,
  `REVIEW_CONTENT_ROOT: ContentRoot`, `withExtraWords(realWords)` (pure, không Zod), `REVIEW_CARDS_FIXTURE = 'review-cards'`.
  Chỉ `import type` từ `@csk/shared` (file bị `vite.config.ts` nạp trong Node). `e2e/E9/review-cards.content.ts` còn lại: re-export
  + validate bằng Zod lúc nạp module (`lessonSchema.array()`, `contentRootSchema`, `wordSchema.array()` cho kết quả `withExtraWords`)
  để dữ liệu sai làm e2e fail sớm; import của các spec E9 không đổi.
- **Build** `apps/web/e2e/fixtures/reviewCardsFixturePlugin.ts` (mới) `reviewCardsBuildPlugin()` (`apply: 'build'`,
  `generateBundle`): emit `content/lessons/s91-*.json` (dùng `lessonFilePath`). Là `.json` nên vào precache
  (`PRECACHE_BASE_PATTERNS`). Không đè file thật (tên `s91-*` mới).
- **Preview** cùng file, `reviewCardsPreviewPlugin()` (`apply: (_, env) => env.isPreview === true`, `configurePreviewServer`):
  middleware theo cookie `csk-e2e-fixture` có cờ `review-cards` → `/content/content.json` trả `REVIEW_CONTENT_ROOT` (thay hẳn, như
  `serveReviewCardsPath`); `/content/words.json` trả `withExtraWords(words.json thật trong outDir)` (validate tối thiểu
  `{ id, audio }` bằng `zod`, mẫu `offlineAudioContent.ts`). Không có cờ → `next()`, e2e cũ không đổi. Service worker gửi kèm
  cookie cùng origin nên precache lần cài đầu lấy bản mẫu. `GET /__e2e/fixture/review-cards` đặt cookie rồi chuyển về `/` (QA chạy
  tay trên bản build e2e). Đọc cookie/pathname/gửi JSON: export lại helper sẵn có của `offlineAudioNetworkPlugin.ts` (`readCookies`,
  `pathnameOf`, `sendJson`), không đổi hành vi S8.4. Cờ `offline-audio` và `review-cards` độc lập (mỗi middleware chỉ xét cờ của mình).
- **`apps/web/vite.config.ts`** (sửa): thêm `mode === 'e2e' && reviewCardsBuildPlugin()` và `mode === 'e2e' && reviewCardsPreviewPlugin()`
  cạnh hai plugin S8.4. `playwright.config.ts` không đổi (đã `--mode e2e`).
- **Không vào bản production**: hai plugin chỉ được thêm khi `mode === 'e2e'`; `pnpm --filter @csk/web build` (mode `production`)
  không có `dist/content/lessons/s91-*.json`, không có middleware (preview thường không nạp plugin). Kiểm ở task 9.3.
- **Quan hệ với `serveReviewCardsPath`**: hai đường cùng một nguồn dữ liệu (`reviewCardsFixtures.ts`) nên nội dung giống hệt. Spec
  E9 có mạng (lesson, placement, writing, errors, backup, backup-reject) giữ `serveReviewCardsPath` + `serviceWorkers: 'block'`
  (không cần cài service worker, chạy nhanh, đã ổn ở task 9.1). Chỉ spec offline dùng `useReviewCardsFixture`. Bài `s91-*` có trong
  mọi bản build e2e nhưng không nằm trên lộ trình khi không có cookie, nên spec E1–E8 không thấy.
- **Spec offline**: mỗi context gọi `useReviewCardsFixture(context)` trước `page.goto` đầu tiên, rồi `openOnceWithServiceWorker`
  (E8 `offline-audio.helpers.ts`) để service worker điều khiển trang trước onboarding/nạp tiến độ; sau đó mới `setOffline(true)`.
  Không có `audioNetwork`: S9.1 offline không phát audio.

## Risks / Trade-offs

- [`ts-fsrs` đổi field `Card` giữa các bản (ví dụ `learning_steps` có từ v5, `elapsed_days` bị đánh dấu deprecated)] → ghim bản
  trong catalog; test `createNewCard` kiểm từng field; S9.2 đọc cùng type `ReviewCard` nên lệch sẽ lộ ở typecheck.
- [Hai tab cùng tạo thẻ] → `addNewCards` chỉ thêm thẻ chưa có trong cùng transaction (D3).
- [Chữ vừa viết ở câu viết cuối bài chưa ghi xong khi bài kết thúc] → `recordCharacterWriting` ghi chữ trước mọi `await`, đọc ở
  `createCardsForFinishedLesson` chờ chuỗi ghi của store (D3).
- [Nạp `words.json`/`strokes/index.json` lỗi lúc xong bài] → không tạo thẻ, không báo; thẻ tạo ở lần xong bài sau (cùng hành vi
  "lưu thẻ lỗi"). Bản thật đọc từ precache nên offline vẫn chạy.
- [e2e offline: không có service worker thì chunk lazy-load (`LessonRunnerContainer-*.js`) không tải được khi offline; `page.route`
  chỉ thay được nội dung] → đã xảy ra ở task 9.2; người thật chốt phương án dự phòng (2026-11-25): D12, spec offline cho service
  worker precache cả code lẫn nội dung mẫu.
- [Nội dung mẫu E9 lọt vào bản production] → plugin chỉ thêm khi `mode === 'e2e'`; task 9.3 kiểm bản build thường không có
  `content/lessons/s91-*.json`.
- [`setOffline(true)` có thể không chặn fetch do service worker gửi, offline "giả"] → mọi thứ spec offline cần (code, `content.json`,
  `words.json`, bài `s91-*`, `strokes`) đều được precache nên service worker trả từ cache, không ra mạng; S9.1 không phát audio nên
  không cần `goOffline` của S8.4.
- [Hai đường phục vụ nội dung mẫu (cookie và `page.route`) lệch nhau] → cùng một module dữ liệu `reviewCardsFixtures.ts` (D12).
- [Đổi version file làm hỏng file mẫu và test S8.5] → `ban-moi-hon.json` lên 3, test dùng hằng + 1 (D6); `hop-le-*` (version 1)
  vẫn hợp lệ nhờ nhánh V1.
- [Tiến độ trước S9.1 không có thẻ] → đúng spec ("Không tạo bù"), ghi trong mô tả PR cho QA.

## Migration Plan

- Dexie version 4 chỉ thêm bảng; người học cập nhật app giữ nguyên `settings`, `lessonProgress`, `dailyStats` (store test nâng v3 →
  v4, TC-S9.1-AC1-32 chạy tay).
- Không có bước chuyển dữ liệu. Rollback: bản app cũ mở DB version 4 sẽ lỗi `VersionError` của Dexie (giống mọi lần nâng version
  trước); app là PWA, rollback = deploy lại bản mới hơn. File sao lưu version 2 ở app cũ báo "bản mới hơn".

## Open Questions

- [x] Tạo thẻ khi ghi "Đã xong" của bài bị lỗi (tổng kết báo chưa lưu)? → vẫn tạo thẻ (người thật xác nhận 2026-11-25). Lý do:
  người học đã làm hết bài; thẻ và tiến độ bài là hai lần ghi độc lập. Áp dụng ở D5 (`useLessonRunner`), khóa bằng task 6.15–6.16.
- [x] e2e offline: nội dung mẫu phục vụ thế nào khi `page.route` + `serviceWorkers: 'block'` không chạy được offline (chunk
  lazy-load lỗi)? → phương án dự phòng: phát nội dung mẫu E9 vào bản build `--mode e2e` theo mẫu `offlineFixturesPlugin` (S8.4 D12),
  spec offline bỏ `serviceWorkers: 'block'` để service worker precache cả code lẫn nội dung (người thật xác nhận 2026-11-25). Áp dụng
  ở D12, task 9.2–9.3.
