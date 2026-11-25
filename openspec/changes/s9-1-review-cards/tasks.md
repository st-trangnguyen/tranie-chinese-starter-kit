# Tasks: S9.1 Tạo thẻ ôn tập

TDD bắt buộc (`docs/05-standards/spec-driven.md` §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design D1–D7), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S9.1-AC2 Viết dở không tính`). Tên file, hàm, field: design.

- RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại; GREEN ghi "không đổi code".
- RED cần type/method chưa có thì được tạo **skeleton production không có hành vi** trong cùng commit `test(...)` (typecheck sạch,
  test fail ở assertion): method trả `[]`/`false`/`undefined`, use case `async` không làm gì, schema `z.unknown()`/`z.object({}).passthrough()`.
  Task nào cho phép skeleton ghi rõ file.
- Object `ProgressStore` viết tay trong test cũ và snapshot dựng tay trong test S8.5 được bổ sung stub/field mới ở commit `test(...)`
  đầu tiên cần đến (design D10), không đổi assertion cũ.

Vitest: `pnpm --filter @csk/web test:run <mẫu>`, `pnpm --filter @csk/shared test:run <mẫu>`. E2E: `pnpm e2e -- e2e/E9/<file>`.

## 1. Chuẩn bị (không có Scenario)

- [x] 1.1 Kiểm điều kiện: `git fetch origin main`; PR spec #148 đã merge vào `origin/main` và nhánh làm việc chứa `origin/main`; nếu tên nhánh chưa phải `feat/s9-1-review-cards` thì `git branch -m feat/s9-1-review-cards` trước lần push đầu tiên; `grep` thấy `useLessonRunner`, `useLessonStrokeWrite`, `useWritingPractice`, `WritingPracticeService.lessonResultOf`, `ProgressStore.exportAll`, `progressBackupV1Schema`, Dexie `db.version(3)`; lệch thì dừng, báo điều phối; kiểm: `git cat-file -e origin/main:openspec/changes/s9-1-review-cards/proposal.md` thoát 0, `git merge-base --is-ancestor origin/main HEAD` thoát 0, `git branch --show-current` = `feat/s9-1-review-cards`
- [x] 1.2 Thêm dependency `ts-fsrs` (config thuần, miễn test-first, design D7): khóa `ts-fsrs` trong `catalog` của `pnpm-workspace.yaml`, `"ts-fsrs": "catalog:"` trong `apps/web/package.json`, `pnpm install`; kiểm: `pnpm --filter @csk/web exec node -e "import('ts-fsrs').then(m=>console.log(typeof m.createEmptyCard))"` in `function`, `pnpm typecheck` sạch

## 2. Schema thẻ và chữ đã viết — `@csk/shared` (design D2)

Test: `packages/shared/src/review-card.schema.test.ts`.

- [x] 2.1 RED: S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe" (schema) — `reviewCardSchema` nhận thẻ mới `{ wordId: '你好', facet: 'meaning', state: 'new', due, stability: 0, difficulty: 0, elapsedDays: 0, scheduledDays: 0, learningSteps: 0, reps: 0, lapses: 0 }` và thẻ `state: 'review'` có `lastReview`; từ chối `facet: 'speaking'`, `state: 'mới'`, thiếu `stability`, `due: -1`, `reps: 1.5`; `reviewCardId('你好', 'meaning')` = `'你好:meaning'`; `writtenCharacterSchema` nhận `{ character: '人' }`, từ chối `'你好'`, `'a'`. Skeleton: `review-card.schema.ts` (hằng `CARD_FACETS`, `CARD_STATES`, schema `z.object({}).passthrough()`, `reviewCardId` trả `''`), export ở `index.ts`; kiểm: fail ở assertion
- [x] 2.2 GREEN: `reviewCardSchema`, `CardFacet`, `CardState`, `ReviewCard`, `reviewCardId`, `writtenCharacterSchema` (D2); kiểm: test 2.1 pass, `pnpm --filter @csk/shared typecheck` sạch

## 3. Lưu thẻ và chữ đã viết — Dexie version 4 + `ProgressStore` (design D1, D3)

Test: `apps/web/src/app/core/services/progress-store.review-cards.test.ts` (fake-indexeddb, DB tên ngẫu nhiên, mẫu `progress-store.daily-goal.test.ts`).

- [x] 3.1 RED: S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe" (store) — `addNewCards([4 thẻ 你好/谢谢 meaning/listening])` → `getAllCards()` có đúng 4 thẻ bằng đầu vào (không có `id`); một dòng `cards` hỏng ghi thô → bị bỏ khi đọc; `addWrittenCharacter('人')` hai lần → `getWrittenCharacters()` = `['人']`; dòng chữ hỏng (`'ab'`) bị bỏ; DB version 3 có `settings`, `lessonProgress`, `dailyStats` mở bằng `createDatabase` (version 4) → dữ liệu cũ còn nguyên, hai bảng mới rỗng. Skeleton: `progress-store.interface.ts` (interface tách khỏi `progress-store.service.ts`, re-export type), 4 method no-op/`[]` trong `DexieProgressStore`, stub 4 method trong 5 object `ProgressStore` viết tay của test cũ; kiểm: `pnpm typecheck` sạch, fail ở assertion
- [x] 3.2 GREEN: `db.version(4)` + `CardRow`, `WrittenCharacterRow` (D1); `getAllCards`, `addNewCards`, `getWrittenCharacters`, `addWrittenCharacter` qua chuỗi ghi; helper `parseRows`; kiểm: test 3.1 pass, test `progress-store.*.test.ts` cũ pass, `progress-store.service.ts` < 300 dòng
- [x] 3.3 RED: S9.1-AC1 "Làm lại bài đã xong không tạo trùng thẻ" (store) — DB có thẻ `你好:meaning` `state: 'review'`, `due` T; `addNewCards([thẻ mới 你好 meaning, thẻ mới 你好 listening])` → vẫn một thẻ meaning, giữ `state: 'review'` và `due` T, có thêm listening; `addNewCards` có `bulkAdd` lỗi (spy) → reject, không thẻ nào được ghi; kiểm: chạy, nếu pass ngay nhờ 3.2 thì tạm đổi `bulkAdd` thành `bulkPut` không lọc khóa đã có để thấy fail rồi trả lại
- [x] 3.4 GREEN: lọc khóa đã có trong cùng transaction `rw` (D3); kiểm: test 3.3 pass
- [x] 3.5 REFACTOR: đổi tên `studyTimeWrites`/`enqueueStudyTimeWrite` → `pendingWrites`/`enqueueWrite` (D3), không đổi hành vi; kiểm: `pnpm --filter @csk/web test:run progress-store` pass

## 4. Quy tắc tạo thẻ — `SrsService` Phần 2 (design D4)

Test: `apps/web/src/app/shared/services/srs.service.rules.test.ts` (pure, không store). Từ dựng bằng `makeWord`/`wordOf`.

- [x] 4.1 RED: S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe" (Phần 2) — `createNewCard('你好', 'meaning', now)` → `state: 'new'`, `due` = `now`, `reps: 0`, `lapses: 0`, không có `lastReview`, qua `reviewCardSchema`; `planLessonCards` cho `['你好','谢谢']`, chưa có thẻ → đúng 4 thẻ meaning/listening `state: 'new'`, không có writing. Skeleton: `srs.service.ts` (class 3 banner, method Phần 2 trả `[]`/`false`, `createNewCard` trả object rỗng ép kiểu qua hàm dựng có field 0), `shared/models/review-card.model.ts`; kiểm: fail ở assertion
- [x] 4.2 GREEN: `createNewCard` (`ts-fsrs` `createEmptyCard`, bảng tra `State` → `CardState`), `planLessonCards` phần meaning/listening; kiểm: test 4.1 pass
- [x] 4.3 RED: S9.1-AC1 "Câu cặp âm tạo thẻ cho cả hai từ" (Phần 2) — `collectLessonWordIds([sound-pair ['妈','马'] đáp án '妈'])` = `['妈','马']`; tone-choice, pinyin-type, stroke-write, speak `wordId` → từ của câu; trùng từ giữa câu → một lần; kiểm: fail
- [x] 4.4 GREEN: `collectLessonWordIds`; kiểm: test 4.3 pass
- [x] 4.5 RED: S9.1-AC1 "Câu nói theo câu không tạo thẻ" (Phần 2) — `collectLessonWordIds([speak sentenceId])` = `[]`, `planLessonCards` với `wordIds: []` = `[]`; kiểm: chạy, nếu pass ngay nhờ 4.4 thì tạm cho speak câu trả `sentenceId` như từ để thấy fail rồi trả lại
- [x] 4.6 GREEN: sửa đến khi pass; kiểm: test 4.5 pass
- [x] 4.7 RED: S9.1-AC1 "Học xong bài chưa có thẻ chiều viết" (Phần 2) — `planLessonCards(['人'], written: ∅, stroke: {人})` → meaning + listening, không writing; `canHaveWritingCard(人, ∅, {人})` false; kiểm: chạy, nếu pass ngay thì tạm cho `planLessonCards` luôn thêm writing để thấy fail rồi trả lại
- [x] 4.8 GREEN: `charactersOf`, `canHaveWritingCard`, nhánh writing của `planLessonCards`; kiểm: test 4.7 pass
- [x] 4.9 RED: S9.1-AC2 "Từ nhiều chữ cần viết xong mọi chữ" (Phần 2) — `charactersOf('你好')` = `['你','好']`; `canHaveWritingCard(你好, {你}, {你,好})` false, `({你,好}, {你,好})` true; `planWritingCards` chữ `好`, từ `你好` có thẻ meaning, written `{你,好}` → một thẻ writing `你好`; written `{你}` → `[]`; kiểm: fail ở `planWritingCards`
- [x] 4.10 GREEN: `isWordLearned`, `planWritingCards`; kiểm: test 4.9 pass
- [x] 4.11 RED: S9.1-AC2 "Viết xong chữ của từ đã học thì tạo thẻ chiều viết" (Phần 2, TC-S9.1-AC2-25) — từ `你好` có thẻ meaning + listening, không có bài đang làm xong (`completingWordIds` rỗng), written `{你}` + vừa viết `好` → `planWritingCards` tạo `你好:writing` `state: 'new'`; `isWordLearned('你好', [thẻ meaning], ∅)` true, chỉ có thẻ listening → false; kiểm: chạy, nếu pass ngay thì tạm cho `isWordLearned` đòi cả thẻ listening để thấy fail rồi trả lại
- [x] 4.12 GREEN: sửa đến khi pass; kiểm: test 4.11 pass
- [x] 4.13 RED: S9.1-AC2 "Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết" (Phần 2) — `人` không có thẻ nào, `completingWordIds` rỗng, written `{人}` → `isWordLearned` false, `planWritingCards` `[]`; kiểm: chạy, nếu pass ngay thì tạm cho `isWordLearned` trả true để thấy fail rồi trả lại
- [x] 4.14 GREEN: sửa đến khi pass; kiểm: test 4.13 pass
- [x] 4.15 RED: S9.1-AC2 "Chữ đã viết dùng chung cho các từ" (Phần 2) — written `{你,好}`, `planLessonCards(['你','好','你好'])` (đều trong nội dung, đều có nét) → writing cho cả ba; kiểm: chạy, nếu pass ngay thì tạm cho `canHaveWritingCard` so cả từ thay vì từng chữ để thấy fail rồi trả lại
- [x] 4.16 GREEN: sửa đến khi pass; kiểm: test 4.15 pass
- [x] 4.17 RED: S9.1-AC2 "Từ có chữ không có dữ liệu nét" (Phần 2) — từ `杯`, stroke `{人,你,好}`, written `{杯}` → `canHaveWritingCard` false, `planLessonCards(['杯'])` chỉ meaning + listening; kiểm: chạy, nếu pass ngay thì tạm bỏ điều kiện dữ liệu nét để thấy fail rồi trả lại
- [x] 4.18 GREEN: sửa đến khi pass; kiểm: test 4.17 pass
- [x] 4.19 RED: S9.1-AC2 "Viết không gợi ý không tính" (Phần 2) — `人` có thẻ meaning, written ∅; `countsAsStrokeWritten({ character: '人', isGuided: false })` false; `addWrittenCharacter(∅, { 人, isGuided: false })` vẫn rỗng; `planWritingCards` với tập đó → `[]`; cùng đầu vào `isGuided: true` → tạo writing; kiểm: fail
- [x] 4.20 GREEN: `countsAsStrokeWritten`, `addWrittenCharacter`; kiểm: test 4.19 pass
- [x] 4.21 RED: S9.1-AC1 "Bài chưa xong không tạo thẻ" + "Bài kiểm tra không tạo thẻ" (Phần 2) — `isCardEligibleLesson('lesson', phiên finished không bỏ câu)` true; phiên còn `answering` → false; finished nhưng `skippedCount: 1` → false; `'test'` đúng hết → false; kiểm: fail
- [x] 4.22 GREEN: `isCardEligibleLesson` (dùng `summarizeSession`); kiểm: test 4.21 pass, mọi method Phần 2 có `// Rule:`

## 5. Use case tạo thẻ — `SrsService` Phần 1 + 3 (design D4)

Test: `apps/web/src/app/shared/services/srs.service.lesson.test.ts`, `srs.service.writing.test.ts` — `DexieProgressStore` thật trên DB
tên ngẫu nhiên, `ContentSource` giả (`makeSource` trong `apps/web/src/test/content-service.fixtures.ts`, từ `你好` `谢谢` `人` `你` `好`
`杯`, stroke index `{人, 你, 好, 谢}`).

- [x] 5.1 RED: S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe" (Phần 3) — DB rỗng; `createCardsForFinishedLesson(bài 你好+谢谢, phiên finished không bỏ câu, now)` → `getAllCards()` đúng 4 thẻ `state: 'new'`. Skeleton: Phần 1 private + 2 use case `async` không làm gì; kiểm: fail ở assertion
- [ ] 5.2 GREEN: Phần 1 (D4), `createCardsForFinishedLesson`; kiểm: test 5.1 pass
- [ ] 5.3 RED: S9.1-AC1 "Bài chưa xong không tạo thẻ" + "Bài kiểm tra không tạo thẻ" (Phần 3) — phiên bỏ 1 câu, phiên chưa xong, bài `type: 'test'` đúng hết → không thẻ nào, và `ContentSource.getWords` không được gọi; kiểm: chạy, nếu pass ngay thì tạm bỏ bước `isCardEligibleLesson` để thấy fail rồi trả lại
- [ ] 5.4 GREEN: sửa đến khi pass; kiểm: test 5.3 pass
- [ ] 5.5 RED: S9.1-AC1 "Bài đã xong từ trước không được tạo bù thẻ" (Phần 3) — DB có `lessonProgress` bài 你好 `completed`, không thẻ; `new SrsService(store, source)` và `recordCharacterWriting({ 你, isGuided: true })` → không có thẻ `你好`; sau `createCardsForFinishedLesson(bài đó, phiên xong)` → có `你好` meaning + listening; kiểm: chạy, nếu pass ngay thì tạm cho `recordCharacterWriting` coi bài `completed` là đã học để thấy fail rồi trả lại
- [ ] 5.6 GREEN: sửa đến khi pass (không đọc `lessonProgress` trong `SrsService`); kiểm: test 5.5 pass
- [ ] 5.7 RED: S9.1-AC1 "Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ" (Phần 3) — DB có bài VC1 (你好) và VC2 (人) `completed`, không thẻ; `createCardsForFinishedLesson(VC1, phiên xong)` → chỉ `你好` meaning + listening, không có thẻ `人`; kiểm: chạy, nếu pass ngay thì tạm cho use case tạo thẻ cho mọi bài `completed` để thấy fail rồi trả lại
- [ ] 5.8 GREEN: sửa đến khi pass; kiểm: test 5.7 pass
- [ ] 5.9 RED: S9.1-AC1 "Làm lại bài đã xong không tạo trùng thẻ" (Phần 3) — DB có `你好:meaning` `state: 'review'`, `due` T, `你好:listening` mới; xong bài 你好 lần nữa → vẫn 2 thẻ, meaning giữ `state`/`due`; kiểm: chạy, nếu pass ngay thì tạm bỏ lọc thẻ đã có ở `planLessonCards` và đổi `addNewCards` sang `bulkPut` để thấy fail rồi trả lại
- [ ] 5.10 GREEN: sửa đến khi pass; kiểm: test 5.9 pass
- [ ] 5.11 RED: S9.1-AC1 "Từ đã có thẻ từ bài khác" (Phần 3) — xong bài 你 rồi bài 你+好 → 4 thẻ, một `你:meaning`, một `你:listening`; kiểm: chạy, nếu pass ngay thì như 5.9
- [ ] 5.12 GREEN: sửa đến khi pass; kiểm: test 5.11 pass
- [ ] 5.13 RED: S9.1-AC1 "Không lưu được thẻ thì bài vẫn xong" + "Thẻ còn thiếu được tạo ở lần xong bài sau" (Phần 3) — `addNewCards` reject một lần (spy) → `createCardsForFinishedLesson` reject `Error('Không tạo được thẻ ôn tập.')` có `cause`, không có thẻ; gọi lại (lần này lưu được) → có `你好` meaning + listening; kiểm: fail vì lỗi gốc lọt ra
- [ ] 5.14 GREEN: bọc lỗi đọc/ghi thành `Error` rõ nghĩa (D4); kiểm: test 5.13 pass
- [ ] 5.15 RED: S9.1-AC2 "Viết xong chữ của từ đã học thì tạo thẻ chiều viết" (Phần 3) — xong bài 人 (có meaning + listening), `recordCharacterWriting({ 人, isGuided: true })` → `getWrittenCharacters()` có `人`, có `人:writing` `state: 'new'`; kiểm: fail vì use case skeleton
- [ ] 5.16 GREEN: `recordCharacterWriting` (ghi chữ trước mọi `await`, rồi `planWritingCards`); kiểm: test 5.15 pass
- [ ] 5.17 RED: S9.1-AC2 "Viết trước rồi học xong sau" (Phần 3) — DB rỗng; viết `人` → không thẻ nào của `人`; rồi xong bài 人 → có meaning, listening, writing; kiểm: chạy, nếu pass ngay thì tạm bỏ nhánh writing của `planLessonCards` để thấy fail rồi trả lại
- [ ] 5.18 GREEN: sửa đến khi pass; kiểm: test 5.17 pass
- [ ] 5.19 RED: S9.1-AC2 "Làm hết bài có câu viết chữ thì có đủ ba chiều" (Phần 3) — DB rỗng; gọi `recordCharacterWriting({ 人 })` **không await** rồi ngay `createCardsForFinishedLesson(bài C: stroke-write 人 + tone-choice 人)` → đúng 3 thẻ `人` meaning/listening/writing; kiểm: chạy, nếu pass ngay thì tạm cho `getWrittenCharacters` không chờ chuỗi ghi để thấy fail rồi trả lại
- [ ] 5.20 GREEN: sửa đến khi pass (đọc chờ chuỗi ghi, D3); kiểm: test 5.19 pass
- [ ] 5.21 RED: S9.1-AC2 "Viết lại không tạo trùng thẻ chiều viết" (Phần 3) — DB có `人:writing` `state: 'review'`, `due` T; viết `人` lần nữa → một `人:writing`, giữ `state`/`due`; kiểm: chạy, nếu pass ngay thì như 5.9
- [ ] 5.22 GREEN: sửa đến khi pass; kiểm: test 5.21 pass
- [ ] 5.23 RED: S9.1-AC2 "Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau" (Phần 3) — có `人` meaning + listening; `addWrittenCharacter` reject một lần → `recordCharacterWriting` reject `Error('Không ghi nhận được chữ đã viết.')`, không có `人` trong chữ đã viết, không `人:writing`; xong bài 人 lần nữa → vẫn không `人:writing`; viết lại → có `人:writing`; kiểm: fail vì lỗi gốc lọt ra
- [ ] 5.24 GREEN: bọc lỗi ghi chữ (D4); kiểm: test 5.23 pass
- [ ] 5.25 RED: S9.1-AC2 "Thẻ chiều viết còn thiếu được tạo ở lần xong bài sau" (Phần 3) — có `人` meaning + listening; `addNewCards` reject một lần → `recordCharacterWriting` reject `Error('Không tạo được thẻ chiều viết.')`, `人` đã có trong chữ đã viết, không `人:writing`; xong bài 人 → có `人:writing` `state: 'new'`, vẫn một meaning và một listening; kiểm: fail
- [ ] 5.26 GREEN: bọc lỗi ghi thẻ (D4); kiểm: test 5.25 pass, `srs.service.ts` < 300 dòng, không import React/Dexie (`pnpm lint`)

## 6. Hook màn bài — `useLessonRunner`, `useLessonStrokeWrite` (design D5)

Test: `apps/web/src/app/pages/lesson/hooks/useLessonRunner.reviewCards.test.ts`, `useLessonStrokeWrite.reviewCards.test.ts`,
`apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.reviewCards.test.tsx` — `mockContentFetch`, đọc kết quả qua
`progressStore.getAllCards()` / `getWrittenCharacters()`, `beforeEach` xoá năm bảng.

- [ ] 6.1 RED: S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe" (hook) — `renderHook(useLessonRunner('a'))`, bài có câu 你好 và 谢谢, trả lời hết, `continueLesson` tới `finished` → `waitFor` 4 thẻ `state: 'new'`; kiểm: fail vì hook chưa gọi `SrsService`
- [ ] 6.2 GREEN: `useLessonRunner` gọi `createCardsForFinishedLesson` sau `finishLesson` trong `saveQueueRef`, nuốt lỗi (D5); kiểm: test 6.1 pass, test `useLessonRunner.test.ts` cũ pass
- [ ] 6.3 RED: S9.1-AC1 "Bài chưa xong không tạo thẻ" (hook) — trả lời 1 câu rồi unmount → không thẻ; bài có câu `skipExercise` rồi hết bài → không thẻ; kiểm: chạy, nếu pass ngay thì tạm gọi use case với `type: 'lesson'` bỏ qua kiểm phiên để thấy fail rồi trả lại
- [ ] 6.4 GREEN: sửa đến khi pass; kiểm: test 6.3 pass
- [ ] 6.5 RED: S9.1-AC1 "Bài kiểm tra không tạo thẻ" + "Bài được mở nhờ kiểm tra vượt cấp không tạo thẻ" (hook) — bài `type: 'test'` đúng hết → không thẻ; `useLessonRunner(testId, { placementUnitId })` đạt → các bài của chủ đề `completed`, không thẻ; kiểm: chạy, nếu pass ngay thì tạm truyền `'lesson'` làm loại bài để thấy fail rồi trả lại
- [ ] 6.6 GREEN: sửa đến khi pass; kiểm: test 6.5 pass
- [ ] 6.7 RED: S9.1-AC1 "Không lưu được thẻ thì bài vẫn xong" (container) — `vi.spyOn(DexieProgressStore.prototype, 'addNewCards').mockRejectedValueOnce(…)`; `LessonRunnerContainer` làm hết bài 你好 → màn tổng kết hiện, `queryByRole('alert')` không có, `progressStore.getLessonProgress` `completed`, không thẻ `你好`; kiểm: chạy, nếu pass ngay thì tạm cho lỗi tạo thẻ đặt `setUnsavedLessonId` để thấy fail rồi trả lại
- [ ] 6.8 GREEN: sửa đến khi pass (lỗi tạo thẻ không đổi `isSaved`); kiểm: test 6.7 pass
- [ ] 6.9 RED: S9.1-AC1 "Thẻ còn thiếu được tạo ở lần xong bài sau" (hook) — tiếp 6.7: mở lại bài, làm hết (lưu được) → có `你好` meaning + listening; kiểm: chạy, nếu pass ngay thì tạm cho hook bỏ qua tạo thẻ khi bài đã `completed` để thấy fail rồi trả lại
- [ ] 6.10 GREEN: sửa đến khi pass; kiểm: test 6.9 pass
- [ ] 6.11 RED: S9.1-AC2 "Viết xong ở câu viết trong bài cũng tính" (hook) — DB có `人` meaning + listening; `useLessonStrokeWrite('e1', '人', onResult)` nạp xong, gửi `'correct'` đủ số nét → `onResult` một lần `{ isCorrect: true }`, `getWrittenCharacters()` có `人`, có `人:writing`; gửi `'correct'` thiếu một nét → không ghi gì; kiểm: fail vì hook chưa gọi `SrsService`
- [ ] 6.12 GREEN: `useLessonStrokeWrite` gọi `recordCharacterWriting` khi `lessonResult` khác `null`, nuốt lỗi (D5); kiểm: test 6.11 pass, test `useLessonStrokeWrite.test.ts` và `LessonRunnerContainer.strokeWrite*.test.tsx` cũ pass
- [ ] 6.13 RED: S9.1-AC2 "Làm hết bài có câu viết chữ thì có đủ ba chiều" (container) — DB rỗng; `LessonRunnerContainer` bài C (stroke-write 人, tone-choice 人), viết đủ nét, trả lời câu còn lại, tới tổng kết → đúng 3 thẻ `人` `state: 'new'`; kiểm: chạy, nếu pass ngay thì tạm bỏ lời gọi ở `useLessonStrokeWrite` để thấy fail rồi trả lại
- [ ] 6.14 GREEN: sửa đến khi pass; kiểm: test 6.13 pass
- [ ] 6.15 RED: quyết định design D5 "Ghi 'Đã xong' lỗi vẫn tạo thẻ" (người thật xác nhận 2026-11-25; bảo vệ S9.1-AC1 "Xong bài học thì tạo thẻ nghĩa và nghe") (hook, `useLessonRunner.reviewCards.test.ts`) — `vi.spyOn(DexieProgressStore.prototype, 'saveLessonProgress')` reject khi ghi `completed`; `renderHook(useLessonRunner('a'))` làm hết bài 你好 + 谢谢 → `isSaved` `false` và `waitFor` 4 thẻ `state: 'new'`; kiểm: chạy, nếu pass ngay nhờ 6.2 thì tạm chỉ tạo thẻ khi `outcome.isSaved` để thấy fail rồi trả lại
- [ ] 6.16 GREEN: sửa đến khi pass (tạo thẻ không phụ thuộc kết quả `finishLesson`, D5); kiểm: test 6.15 pass, test 6.1–6.10 vẫn pass

## 7. Màn luyện viết — `useWritingPractice` (design D5)

Test: `apps/web/src/app/pages/writing-practice/containers/WritingPracticeContainer.reviewCards.test.tsx` (mẫu
`WritingPracticeContainer.test.tsx`, `@test/mocks/hanzi-writer`), `apps/web/src/app/shared/services/writing-practice.service.test.ts`.

- [ ] 7.1 RED: S9.1-AC2 "Viết xong chữ của từ đã học thì tạo thẻ chiều viết" (Phần 2 + container) — `hasJustCompleted(chưa xong, xong)` true, `(xong, xong)` false, `(chưa, chưa)` false; DB có `人` meaning + listening; mở `/characters/人/writing-practice`, viết đúng hết nét → thông báo xong chữ, `getWrittenCharacters()` có `人`, có `人:writing`. Skeleton: `hasJustCompleted` trả `false`; kiểm: fail
- [ ] 7.2 GREEN: `WritingPracticeService.hasJustCompleted` (`lessonResultOf` dùng lại); `useWritingPractice` sang `practiceRef` (đầu effect nạp chữ đặt `practiceRef.current = null`, chạy lại khi `character` đổi và khi `retry`) và gọi `recordCharacterWriting` (D5); kiểm: test 7.1 pass, test `WritingPracticeContainer*.test.tsx`, `writing-practice.service.test.ts` cũ pass
- [ ] 7.3 RED: S6.2-AC1 "Viết đúng hết các nét thì hoàn thành chữ" (container, delta `stroke-guided-writing`) — viết xong `十` → màn báo xong chữ, có nút "Viết lại", không có chữ điểm/phần trăm/"đã lưu"; `getWrittenCharacters()` = `['十']`; bấm "Viết lại", viết xong lần nữa → vẫn `['十']`, giao diện như lần đầu; kiểm: chạy, nếu pass ngay nhờ 7.2 thì tạm bỏ lời gọi ghi nhận để thấy fail rồi trả lại
- [ ] 7.4 GREEN: sửa đến khi pass (`restart` gán lại `practiceRef`); kiểm: test 7.3 pass
- [ ] 7.5 RED: S9.1-AC2 "Viết dở không tính" (container) — DB có `人` meaning + listening; viết đúng nét đầu rồi unmount → `getWrittenCharacters()` rỗng, không `人:writing`; kiểm: chạy, nếu pass ngay thì tạm gọi ghi nhận ở mỗi nét đúng để thấy fail rồi trả lại
- [ ] 7.6 GREEN: sửa đến khi pass; kiểm: test 7.5 pass
- [ ] 7.7 RED: S9.1-AC2 "Viết xong chữ vẫn báo xong khi không lưu được" (container) — `addWrittenCharacter` reject (spy) → thông báo xong chữ hiện, nút "Viết lại" dùng được, không `alert`, không `人:writing`; kiểm: chạy, nếu pass ngay thì tạm bỏ `.catch` ở hook để thấy lỗi lọt (unhandled rejection làm test fail) rồi trả lại
- [ ] 7.8 GREEN: sửa đến khi pass; kiểm: test 7.7 pass, `useWritingPractice.ts` < 300 dòng

## 8. Sao lưu thẻ và chữ đã viết — schema v2, store, `BackupService` (design D3, D6)

Test: `packages/shared/src/progress-backup.schema.test.ts`, `apps/web/src/app/core/services/progress-store.backup.test.ts`,
`apps/web/src/app/shared/services/backup.service.review-cards.test.ts` (máy A/B qua `apps/web/src/test/backup-machine.helpers.ts`).

- [ ] 8.1 Asset (miễn test-first, kiểm ở 8.22): `apps/web/e2e/E8/fixtures/progress-backup/ban-moi-hon.json` `formatVersion` 2 → 3; tạo `apps/web/e2e/E9/fixtures/progress-backup/` gồm `the-nihao.json`, `the-sai-chieu.json`, `the-trung.json`, `chu-trung.json`, `the-tu-la.json` (`龘龘`), `chu-la.json` (`你`, `龘`), `chu-khong-net.json` (`杯`), `ban-truoc-s9-1.json` (version 1, `s91-a` completed) theo `test-cases.md` và design D10; kiểm: `ls` đủ 8 file, mỗi file là JSON đọc được (`node -e "JSON.parse(...)"`)
- [ ] 8.2 RED: S9.1-AC1 (bổ sung) "File có thẻ sai bị từ chối cả file" (schema + Phần 2) — `progressBackupV2Schema` từ chối thẻ `facet: 'speaking'`, thẻ thiếu `due`; `checkBackupText` file v2 có thẻ đó → `corrupted`; file v2 hợp lệ → `valid`; `formatVersion: PROGRESS_BACKUP_FORMAT_VERSION + 1` → `newer-version`; test S8.5 cũ dùng `2` làm "mới hơn" đổi sang hằng + 1. Skeleton: `progressBackupV2Schema` = V1 `.passthrough()`, `ProgressSnapshot` thêm `cards`, `writtenCharacters` (sửa snapshot dựng tay trong test S8.5); kiểm: fail ở assertion
- [ ] 8.3 GREEN: `PROGRESS_BACKUP_FORMAT_VERSION = 2`, V1 `formatVersion: z.literal(1)`, `progressBackupV2Schema`, `ProgressBackupFile` v2, `checkBackupText` nhánh V1/V2 (D6); kiểm: test 8.2 pass, test S8.5 cũ (`backup.service*.test.ts`, `progress-backup.schema.test.ts`) pass
- [ ] 8.4 RED: S9.1-AC1 (bổ sung) "File có hai thẻ trùng bị từ chối cả file" (schema + Phần 2) — v2 có hai thẻ `你好:meaning` (khác `state`) → `corrupted`; `你好:meaning` + `你好:listening` → `valid`; kiểm: fail
- [ ] 8.5 GREEN: `refine` không trùng `reviewCardId`; kiểm: test 8.4 pass
- [ ] 8.6 RED: S9.1-AC2 (bổ sung) "File có chữ đã viết trùng bị từ chối cả file" (schema + Phần 2) — `writtenCharacters: ['你','你']` → `corrupted`; `['你','好']` → `valid`; `['ab']` → `corrupted`; kiểm: fail
- [ ] 8.7 GREEN: `refine` không trùng chữ; kiểm: test 8.6 pass
- [ ] 8.8 RED: S9.1-AC1 (bổ sung) "Nhập file sao lưu bản cũ" (Phần 2 + 3) — file v1 hợp lệ (`s91-a` completed) → `checkBackupText` `valid`, `file.cards` `[]`, `file.writtenCharacters` `[]`; máy B có thẻ `谢谢` meaning + listening và chữ `人`; `inspectImportFile` + `importProgress` → `getAllCards()` rỗng, `getWrittenCharacters()` rỗng, `s91-a` completed; kiểm: fail vì skeleton chưa có `upgradeV1File` / `importAll` chưa xoá bảng mới
- [ ] 8.9 GREEN: `upgradeV1File` (Phần 2, `Rule:`); `exportAll`/`importAll` năm bảng (D3); `buildBackupFile`, `inspectImportFile` mang hai field; kiểm: test 8.8 pass
- [ ] 8.10 RED: S9.1-AC1 (bổ sung) "Xuất rồi nhập ở máy khác vẫn còn thẻ" (Phần 3) — A: `你好:meaning` `state: 'review'` có `due`/`lastReview`/`stability` khác thẻ mới, `你好:listening` mới; `exportProgress` → nội dung có đúng 2 thẻ với đủ field; B (chưa có thẻ) nhập → `getAllCards()` bằng của A; kiểm: chạy, nếu pass ngay nhờ 8.9 thì tạm bỏ `cards` khỏi `buildBackupFile` để thấy fail rồi trả lại
- [ ] 8.11 GREEN: sửa đến khi pass; kiểm: test 8.10 pass
- [ ] 8.12 RED: S9.1-AC2 (bổ sung) "Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết" (Phần 3) — A: `人:writing`, chữ đã viết `人`, `你`; xuất, B nhập → B có `人:writing`, chữ `人`, `你`; B `createCardsForFinishedLesson(bài 你好)` rồi `recordCharacterWriting({ 好 })` → có `你好:writing`; kiểm: chạy, nếu pass ngay thì tạm bỏ `writtenCharacters` khỏi `exportAll` để thấy fail rồi trả lại
- [ ] 8.13 GREEN: sửa đến khi pass; kiểm: test 8.12 pass
- [ ] 8.14 RED: S9.1-AC1 (bổ sung) "Nhập ghi đè thẻ trên máy" (store + Phần 3) — B có `谢谢` meaning + listening; nhập snapshot chỉ có `你好` meaning + listening → `getAllCards()` chỉ 2 thẻ `你好`; kiểm: chạy, nếu pass ngay thì tạm bỏ `cards.clear()` trong `writeSnapshot` để thấy fail rồi trả lại
- [ ] 8.15 GREEN: sửa đến khi pass; kiểm: test 8.14 pass
- [ ] 8.16 RED: S9.1-AC1 (bổ sung) "Ghi lỗi giữa chừng thì giữ nguyên thẻ" (store) — B có `谢谢` meaning + listening và chữ `人`; `vi.spyOn(db.cards, 'bulkPut' | 'bulkAdd').mockRejectedValueOnce` → `importAll` reject; thẻ `谢谢`, chữ `人`, `lessonProgress`, settings còn nguyên; lỗi ở `lessonProgress` cũng giữ thẻ; kiểm: chạy, nếu pass ngay thì tạm ghi bảng `cards` ngoài transaction để thấy fail rồi trả lại
- [ ] 8.17 GREEN: sửa đến khi pass (năm bảng trong một transaction); kiểm: test 8.16 pass
- [ ] 8.18 RED: S9.1-AC1 (bổ sung) "Hủy nhập thì thẻ không đổi" (Phần 3) — B có `谢谢` meaning + listening; `inspectImportFile(file chỉ có 你好)` → `valid`, không gọi `importProgress` → `getAllCards()` vẫn 2 thẻ `谢谢`; kiểm: chạy, nếu pass ngay thì tạm cho `inspectImportFile` gọi `writeSnapshot` để thấy fail rồi trả lại
- [ ] 8.19 GREEN: sửa đến khi pass (bước kiểm không ghi gì); kiểm: test 8.18 pass
- [ ] 8.20 RED: S9.1-AC1 (bổ sung) "Thẻ của từ không có trong app vẫn nhập được" + S9.1-AC2 (bổ sung) "Chữ đã viết không có trong app không tạo thẻ" + "Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ" (Phần 3) — nhập file có `你好:meaning` và `龘龘:meaning` → `valid`, B có đúng 2 thẻ như file; nhập file `chu-la` (bài 你好 completed, `你好` meaning + listening, chữ `你`, `龘`) → không có `你好:writing`; nhập `chu-khong-net` (bài 杯 completed, `杯` meaning + listening, chữ `杯`) → đúng 2 thẻ; sau đó `createCardsForFinishedLesson(bài 杯)` → vẫn 2 thẻ, `getWrittenCharacters()` còn `杯`, xuất lại có `杯` và `龘龘:meaning`; kiểm: chạy, nếu pass ngay thì tạm cho `checkBackupText` lọc thẻ có `wordId` không có trong nội dung để thấy fail rồi trả lại
- [ ] 8.21 GREEN: sửa đến khi pass (không đối chiếu nội dung khi nhập, D6); kiểm: test 8.20 pass, `backup.service.ts` < 300 dòng
- [ ] 8.22 Test bảo vệ file mẫu (kiểm asset 8.1, không phải Scenario mới): `apps/web/src/app/shared/services/backup.service.review-fixtures.test.ts` đọc file ở `e2e/E9/fixtures/progress-backup/` bằng `node:fs`, `checkBackupText` → `the-nihao`, `the-tu-la`, `chu-la`, `chu-khong-net`, `ban-truoc-s9-1` `valid`; `the-sai-chieu`, `the-trung`, `chu-trung` `corrupted`; thêm kỳ vọng `ban-moi-hon` (version 3) `newer-version` trong `backup.service.fixtures.test.ts`; kiểm: test pass
- [ ] 8.23 Hồi quy S8.5 (Requirement "File xuất chứa toàn bộ tiến độ" sửa bảng): S8.5-AC1 "Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ", "File có lựa chọn hiện pinyin", "File có số phút đã học từng ngày", "File có chủ đề đã qua bằng kiểm tra vượt cấp" — test hiện có trong `backup.service.export.test.ts`, `backup.service.import.test.ts` chạy lại không sửa assertion; kiểm: `pnpm --filter @csk/web test:run backup.service` pass

## 9. Luồng người dùng — Playwright `apps/web/e2e/E9/` (design D10)

Hành vi đã có test RED ở tầng dưới (nhóm 2–8); commit `test(e2e)`. Helper `apps/web/e2e/E9/review-cards.content.ts` (lộ trình, bài
`s91-*`, từ thêm) và `review-cards.helpers.ts` (`serveReviewCardsPath`, `readReviewCards`, `readWrittenCharacters`,
`seedReviewProgress`, `breakReviewWrites`, `restoreReviewWrites`); dùng lại `completeOnboarding` (E7), `writeCharacter`/`drawMedian`
(E6/E7), helper sao lưu (`backup.helpers.ts`). Mọi context `serviceWorkers: 'block'`. Mỗi file < 300 dòng.

- [ ] 9.1 Helper + nội dung mẫu (test code): `review-cards.content.ts`, `review-cards.helpers.ts`; kiểm: một test khói trong `s9.1-review-cards-lesson.spec.ts` mở `/lessons/s91-a` thấy tiêu đề "Bài mẫu A", `readReviewCards` trả `[]`
- [ ] 9.2 RED: offline trước (rủi ro design) `s9.1-review-cards-offline.spec.ts`: TC-S9.1-AC1-2, TC-S9.1-AC2-19, TC-S9.1-AC1-21 (`context.setOffline(true)` sau khi app mở); kiểm: hành vi đã có từ nhóm 6 nên tạm bỏ lời gọi `createCardsForFinishedLesson` ở `useLessonRunner`, build, thấy fail vì danh sách thẻ rỗng (không phải vì nội dung mẫu không tải được), rồi trả lại; nếu fail vì nội dung mẫu không tải được khi offline thì dừng, báo điều phối (design Risks)
- [ ] 9.3 GREEN: offline pass (không đổi code production, hoặc theo phương án dự phòng sau khi điều phối cập nhật tasks); kiểm: `pnpm e2e -- e2e/E9/s9.1-review-cards-offline.spec.ts` pass
- [ ] 9.4 Test e2e nghiệm thu `s9.1-review-cards-lesson.spec.ts`: TC-S9.1-AC1-1, AC1-4, AC1-5, AC1-6, AC1-7, AC1-8, AC1-14, AC1-15, AC1-30; kiểm: file này pass
- [ ] 9.5 Test e2e nghiệm thu `s9.1-review-cards-placement.spec.ts`: TC-S9.1-AC1-9, AC1-10, AC1-11, AC1-12, AC1-13, TC-S9.1-AC2-16, AC2-17; kiểm: file này pass
- [ ] 9.6 Test e2e nghiệm thu `s9.1-review-cards-writing.spec.ts`: TC-S9.1-AC2-1, AC2-2, AC2-3, AC2-4, AC2-5, AC2-6, AC2-7, AC2-8, AC2-10, AC2-11, AC2-18, TC-S6.2-AC1-33; kiểm: file này pass
- [ ] 9.7 Test e2e nghiệm thu `s9.1-review-cards-errors.spec.ts`: TC-S9.1-AC1-16, AC1-17 ("lỗi lưu thẻ"), TC-S9.1-AC2-12, AC2-20, AC2-21 ("lỗi lưu"), AC2-22 ("lỗi lưu thẻ"); kiểm: file này pass
- [ ] 9.8 Test e2e nghiệm thu `s9.1-review-cards-backup.spec.ts` (hai `browser.newContext()` cho máy A/B): TC-S9.1-AC1-18, AC1-19, AC1-20, AC1-23, AC1-24, AC1-25, AC1-26 (`breakLessonProgressWrites`), AC1-28, AC1-31, AC1-34, AC1-35, TC-S9.1-AC2-14, AC2-15, AC2-24, AC2-26, AC2-27; kiểm: file này pass
- [ ] 9.9 Test e2e nghiệm thu `s9.1-review-cards-backup-reject.spec.ts`: TC-S9.1-AC1-27, AC1-33, TC-S9.1-AC2-23; kiểm: file này pass
- [ ] 9.10 Hồi quy S8.5: TC-S8.5-AC1-20 trong `e2e/E8/s8.5-roundtrip.spec.ts` thêm kiểm `readReviewCards` máy B rỗng; TC-S8.5-AC1-16, AC1-19, AC1-22 chạy lại không đổi; kiểm: `pnpm e2e -- e2e/E8/s8.5-roundtrip.spec.ts e2e/E8/s8.5-import-reject.spec.ts` pass (gồm `ban-moi-hon` version 3)

## 10. Tài liệu (docs thuần, miễn test-first)

- [ ] 10.1 `docs/03-architecture.md` theo design D11 (§4 `srs.service`, §6.2 bảng `cards` field + Dexie version 4 + bảng `writtenCharacters`, §6.3 method store mới, `ProgressSnapshot`, file sao lưu version 2 đọc được version 1); kiểm: đọc lại khớp tên trong code
- [ ] 10.2 Mô tả PR code: `Spec PR: #148`, `Refs #39` hoặc `Closes #39`; đường dẫn bài mẫu (`apps/web/e2e/E9/review-cards.content.ts`) và file mẫu (`apps/web/e2e/E9/fixtures/progress-backup/`), cách e2e đọc/nạp/làm hỏng ghi thẻ, case chạy tay (cột "không" của `test-cases.md`), ghi chú "không tạo bù thẻ cho tiến độ trước S9.1"; Screenshots `N/A` (không đổi giao diện); kiểm: PR đủ mục theo `.github/pull_request_template.md`

## 11. Kiểm tra cuối

- [ ] 11.1 `pnpm typecheck && pnpm lint && pnpm test:run` pass; `pnpm content:check` pass (không đổi nội dung, hook chạy)
- [ ] 11.2 `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` pass; `pnpm e2e` pass toàn bộ (E1–E9); fail có sẵn trên `main` ghi rõ trong PR
- [ ] 11.3 Self-review theo `CLAUDE.md` §0, §2 (bảng design D8), §7: không `any`, không `as` cho dữ liệu ngoài, không `enum` mới, `ts-fsrs` chỉ import ở `srs.service.ts` (`grep -rn "ts-fsrs" apps/web/src` chỉ một file), service không import React/Dexie, mỗi file < 300 dòng; kiểm: lệnh `grep` và `wc -l` trên file mới/sửa

## Workflow follow-up

- Archive tự động sau khi PR code merge (`archive-spec-workflow.yml`), không archive trong PR code.
- Sau khi S9.1 merge: S6.3 phải sửa câu "chế độ có gợi ý (S6.2) vẫn không ghi gì" trong spec của nó (proposal Dependencies).
