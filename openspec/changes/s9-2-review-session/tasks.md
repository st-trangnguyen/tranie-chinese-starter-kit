# Tasks: S9.2 Màn ôn tập

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới`). Tên file, hàm, field, route: design D1–D13.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại, ghi rõ trong commit.
RED cần type/method/route chưa có thì được tạo skeleton không có hành vi trong cùng commit `test(...)` (typecheck sạch, test fail ở
assertion). REFACTOR không thêm hành vi, chỉ làm khi đang xanh, commit `refactor(...)`.

Vitest: `pnpm --filter @csk/web test:run <mẫu>`. E2E: `pnpm e2e -- e2e/E9/<file>.spec.ts`. Đường dẫn Vitest tính từ
`apps/web/src/app/` nếu không ghi khác.

## 1. Điều kiện trước khi code (design D1)

- [x] 1.1 Đối chiếu design/tasks với code S9.1 đã merge (`main` `bccf171`): tên thật `ReviewCard`/`reviewCardSchema`/`reviewCardId`/`CardFacet`/`CARD_FACETS`, `state: 'new'`; `getAllCards` đã có (bỏ task thêm); chưa có ghi đè một thẻ → thêm `saveCard` (D3); trạng thái nhớ FSRS đủ field và file sao lưu v2 giữ đủ (test roundtrip S9.1 đã kiểm); chưa có chuyển thẻ → `ts-fsrs` → `fsrs-card.utils.ts` (D5); rule "từ của bài" = `SrsService.collectLessonWordIds` → tách util (D6); `srs.service.ts` 294 dòng → `ReviewService` riêng (D4); bộ bài mẫu và helper e2e S9.1 dùng lại được (D13); kiểm: `grep -n "ts-fsrs" apps/web/package.json` và `grep -n "reviewCardSchema" packages/shared/src/progress-backup.schema.ts` có kết quả

## 2. Xếp lịch FSRS — `ReviewService` Phần 2 (design D4, D5, D7)

- [ ] 2.1 RED: viết test fail cho `S9.2-AC3 Ngày ôn tiếp theo khớp FSRS` — Vitest Phần 2, `shared/services/review.service.schedule.test.ts`: thẻ "mới" và thẻ đã chấm "Được" một lần, mỗi thẻ × 4 mức tại thời điểm cố định, so bảng mẫu (`state` + `due`) ghi `ts-fsrs 6.0.0` (khóa trong `pnpm-lock.yaml`) ở đầu file; chạy hai lần cho cùng kết quả; skeleton `ReviewService.scheduleCard`, `REVIEW_RATINGS`/`ReviewRating` (`shared/models/review.model.ts`) cho typecheck; kiểm: test fail vì `scheduleCard` chưa có hành vi
- [ ] 2.2 GREEN: implement `S9.2-AC3 Ngày ôn tiếp theo khớp FSRS` — `shared/utils/fsrs-card.utils.ts` (`toFsrsCard`, `fromFsrsCard`, `createEmptyFsrsCard`, `REVIEW_SCHEDULER` `enable_fuzz: false`, `nextFsrsCard`, `gradeOf`), `ReviewService.scheduleCard` (comment `Rule:`, không mutate thẻ); kiểm: 2.1 pass
- [ ] 2.3 RED: viết test fail cho `S9.2-AC3 Mức cao hơn không cho ngày ôn sớm hơn` — Vitest Phần 2, cùng file 2.1: thẻ "mới" và thẻ đã ôn ≥ 3 lần, cùng thời điểm, "Quên" ≤ "Khó" ≤ "Được" ≤ "Dễ", mọi `due` sau lúc chấm, `state` khác `'new'`, bước học ngắn (~1 / ~6 / ~10 phút, "Dễ" ≥ 1 ngày); pass ngay thì tạm đảo thứ tự `gradeOf` để thấy fail; kiểm: thấy fail
- [ ] 2.4 GREEN: implement `S9.2-AC3 Mức cao hơn không cho ngày ôn sớm hơn` — sửa `scheduleCard`/`gradeOf` nếu cần, trả lại phần đã đảo; kiểm: 2.1 và 2.3 pass
- [ ] 2.5 REFACTOR (design D5): chuyển `CARD_STATE_BY_FSRS_STATE` sang `fsrs-card.utils.ts`, `SrsService.createNewCard` gọi `fromFsrsCard(wordId, facet, createEmptyFsrsCard(now))`, `srs.service.ts` bỏ import `ts-fsrs`; kiểm: `pnpm --filter @csk/web test:run srs.service review.service backup.service` pass, `grep -rln "from 'ts-fsrs'" apps/web/src` chỉ ra `fsrs-card.utils.ts`
- [ ] 2.6 REFACTOR (design D6): chuyển thân `collectLessonWordIds` sang `shared/utils/lesson-words.utils.ts`, `SrsService.collectLessonWordIds` giữ chữ ký và comment `Rule:`, ủy quyền sang util; kiểm: `pnpm --filter @csk/web test:run srs.service` pass

## 3. Thứ tự hỏi và vị trí của từ — `ReviewService` Phần 2 (design D4, D6)

- [ ] 3.1 RED: viết test fail cho `S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới` — Vitest Phần 2, `shared/services/review.service.session-rules.test.ts` (fixture `src/test/review-session.fixtures.ts`, thẻ đã chấm dựng bằng `scheduleCard`, thẻ "mới" bằng `fromFsrsCard(createEmptyFsrsCard)`): "人" nghĩa đã chấm tới hạn hôm qua, "你好" nghĩa "mới" tạo 3 ngày trước → `selectReviewSession` cho "人", "你好"; kiểm: fail vì `selectReviewSession`/`compareSessionCards` chưa có hành vi
- [ ] 3.2 GREEN: implement `S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới` — `ReviewItem`/`ReviewSession`/`WordPosition` trong `review.model.ts`, `isNewCard`, `isCardDue`, `compareSessionCards` (Q1, Q2), `selectReviewSession` (chỉ phần sort + lọc đến hạn, `cardId = reviewCardId(...)`); kiểm: 3.1 pass
- [ ] 3.3 RED: viết test fail cho `S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình` — Vitest Phần 2, cùng file: thẻ "mới" "你好"/"谢谢" chiều nghĩa và nghe, "你好" trước "谢谢" trong lộ trình → "你好" nghĩa, "谢谢" nghĩa, "你好" nghe, "谢谢" nghe; kiểm: thấy fail
- [ ] 3.4 GREEN: implement `S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình` — Q3 theo `CARD_FACETS`, Q4 qua `buildWordPositions` (dùng `collectLessonWordIds` của `lesson-words.utils.ts`) + `compareWordPositions` (V1); kiểm: 3.1, 3.3 pass
- [ ] 3.5 RED: viết test fail cho `S9.2-AC1 Thẻ mới tạo ở các lần khác nhau vẫn xếp theo chiều rồi theo lộ trình` — Vitest Phần 2, cùng file: "谢谢" nghĩa tạo 08:00, "你好" nghe 08:00 + 5 ms, "你好" nghĩa tạo hôm sau → "你好" nghĩa, "谢谢" nghĩa, "你好" nghe; pass ngay thì tạm cho Q2 so `due` của thẻ "mới" để thấy fail; kiểm: thấy fail
- [ ] 3.6 GREEN: implement `S9.2-AC1 Thẻ mới tạo ở các lần khác nhau vẫn xếp theo chiều rồi theo lộ trình` — Q2 không đọc `due` của thẻ "mới", trả lại phần đã đảo; kiểm: 3.1–3.5 pass
- [ ] 3.7 RED: viết test fail cho `S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ` — Vitest Phần 2, cùng file: bài A (câu 1 "人", câu 2 "你好"), bài B ("你好", câu cặp âm "妈"/"马") → "人", "你好", "妈", "马"; thêm ca V4 (từ ngoài lộ trình đứng sau, so code point `hanzi`); kiểm: thấy fail
- [ ] 3.8 GREEN: implement `S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ` — `buildWordPositions` giữ bài đầu tiên (V1), `wordIndex` theo danh sách `collectLessonWordIds` (V2, V3), `compareWordPositions` V4 code point, tie-break `cardId`; tách comparator sang `shared/utils/review-order.utils.ts` nếu `review.service.ts` > 300 dòng; kiểm: cả file `review.service.session-rules.test.ts` pass

## 4. Lấy phiên và chấm thẻ — `ReviewService` Phần 3 (design D3, D4)

Test Phần 3 dùng `openReviewService(lessons)` của `src/test/review-session.fixtures.ts` (`DexieProgressStore` trên fake-indexeddb +
`ContentSource` giả); thẻ có sẵn nạp bằng `store.addNewCards`.

- [ ] 4.1 RED: viết test fail cho `S9.2-AC1 Chỉ hỏi thẻ đến hạn, hạn sớm hơn hỏi trước` — Vitest Phần 3, `shared/services/review.service.review-session.test.ts`: "你好" tới hạn hôm qua, "谢谢" 3 ngày trước, "人" còn 2 ngày → `getReviewSession(now)` cho `ready` "谢谢", "你好"; kiểm: fail vì `getReviewSession` chưa có hành vi
- [ ] 4.2 GREEN: implement `S9.2-AC1 Chỉ hỏi thẻ đến hạn, hạn sớm hơn hỏi trước` — Phần 1 `readAllCards` (`getAllCards` của S9.1), `readContentRoot`, `readLesson`, `readWords`; `getReviewSession` (bài theo `listLessonIdsInOrder` + `Promise.allSettled`; lỗi đọc thẻ/lộ trình/từ → `Error('Không tải được thẻ ôn tập.')`); kiểm: 4.1 pass
- [ ] 4.3 RED: viết test fail cho `S9.2-AC1 Thẻ mới được hỏi ngay` — Vitest Phần 3, cùng file: tạo thẻ bằng `new SrsService(store, source).createCardsForFinishedLesson(lesson, finishedSession(...))` (S9.1) cho bài có "你好" rồi `getReviewSession` → "你好" nghĩa, "你好" nghe (2 thẻ); pass ngay thì tạm cho `isCardDue` coi thẻ "mới" theo `due > now` để thấy fail; kiểm: thấy fail
- [ ] 4.4 GREEN: implement `S9.2-AC1 Thẻ mới được hỏi ngay` — thẻ "mới" luôn đến hạn, trả lại phần đã đảo; kiểm: 4.1, 4.3 pass
- [ ] 4.5 RED: viết test fail cho `S9.2-AC1 Thẻ của từ không có trong app không được hỏi` — Vitest Phần 3, cùng file: "你好" nghĩa "mới" + thẻ "mới" của từ không có trong `getWords` → `ready` chỉ "你好"; sau `reviewCard` thẻ "你好", thẻ lạ trong store vẫn y nguyên; skeleton `ProgressStore.saveCard` (interface + `DexieProgressStore`) + `ReviewService.reviewCard`; cùng commit thêm `saveCard` vào 5 fake `ProgressStore` trong test theo pattern `addNewCards` của từng file (design D3): `shared/services/progress.service.test.ts:16`, `lesson.service.test.ts:383` và `:748` dùng `vi.fn(async () => undefined)`, `progress.service.study-time.test.ts:17` và `progress.service.streak-flow.test.ts:19` dùng `unavailable`; kiểm: `pnpm typecheck` sạch, test mới thấy fail
- [ ] 4.6 GREEN: implement `S9.2-AC1 Thẻ của từ không có trong app không được hỏi` — `selectReviewSession` bỏ thẻ có `wordId` ngoài `wordsById`; `ProgressStore.saveCard` (interface + `DexieProgressStore`: `enqueueWrite` + `cards.put({ ...card, id: reviewCardId(...) })`); `writeCard`, `reviewCard` (`scheduleCard` + `writeCard`, lỗi ghi → `Error('Không lưu được kết quả ôn tập.')`); kiểm: 4.1–4.5 pass, `pnpm typecheck` sạch, `pnpm --filter @csk/web test:run progress-store progress.service lesson.service` pass
- [ ] 4.7 RED: viết test fail cho `S9.2-AC1 Thẻ đọc không được thì bỏ qua thẻ đó` — Vitest Phần 3, cùng file: dòng "谢谢" nghĩa thiếu `stability` ghi thẳng vào bảng `cards` (DB của store) → `ready` chỉ "你好", không throw; `getAllCards` của S9.1 đã bỏ dòng hỏng nên sẽ pass ngay: tạm đổi `getAllCards` sang `reviewCardSchema.parse` từng dòng để thấy fail; kiểm: thấy fail
- [ ] 4.8 GREEN: implement `S9.2-AC1 Thẻ đọc không được thì bỏ qua thẻ đó` — trả lại `getAllCards` như S9.1 (không thêm code); kiểm: 4.1–4.7 pass
- [ ] 4.9 RED: viết test fail cho `S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay` — Vitest Phần 3, cùng file: `reviewCard("你好" nghĩa "mới", 'easy', T)` rồi `getReviewSession(T)` → `none-due`; `getReviewSession(due)` có thẻ, `getReviewSession(due - 1 phút)` không; kiểm: thấy fail (hoặc đảo tạm `due <= now` thành `<` để thấy fail)
- [ ] 4.10 GREEN: implement `S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay` — chỉnh `isCardDue`/`reviewCard` nếu cần, trả lại phần đã đảo; kiểm: 4.9 pass
- [ ] 4.11 RED: viết test fail cho `S9.2-AC3 Chấm Quên thì thẻ quay lại sớm hơn chấm Dễ` — Vitest Phần 3, cùng file: hai thẻ "mới", "Quên" cho "你好", "Dễ" cho "谢谢" → `due` "你好" < `due` "谢谢", cả hai `state` khác `'new'` khi đọc lại bằng `getAllCards`; đảo tạm `gradeOf` nếu pass ngay; kiểm: thấy fail
- [ ] 4.12 GREEN: implement `S9.2-AC3 Chấm Quên thì thẻ quay lại sớm hơn chấm Dễ` — trả lại phần đã đảo, sửa nếu cần; kiểm: cả file `review.service.review-session.test.ts` pass
- [ ] 4.13 RED: viết test fail cho `S9.2-AC3 Thẻ nhập từ file sao lưu chấm ra cùng kết quả như máy gốc` — Vitest Phần 3, `shared/services/review.service.backup-roundtrip.test.ts`: hai máy `createMachine()` (`@test/backup-machine.helpers`), `ReviewService(machine.store, source giả)`; máy A chấm "Được", "Quên", "Được" ở các thời điểm khác nhau; `exportProgress` → B `inspectImportFile` + `importProgress` → chấm "Khó" cùng thời điểm ở cả hai → thẻ bằng nhau mọi field (`toEqual`); S9.1 đã sao lưu đủ field nên dễ pass ngay: tạm bỏ `lastReview` (hoặc `learningSteps`) trong `fromFsrsCard` để thấy fail; kiểm: thấy fail
- [ ] 4.14 GREEN: implement `S9.2-AC3 Thẻ nhập từ file sao lưu chấm ra cùng kết quả như máy gốc` — trả lại phần đã đảo; không sửa schema sao lưu trong PR này (lệch thì dừng, báo điều phối); kiểm: 4.13 pass

## 5. Nút "Ôn tập" trên Trang chủ (design D2)

- [ ] 5.1 RED: viết test fail cho `S9.2-AC1 Mở màn ôn tập từ Trang chủ` — Testing Library, `pages/home/containers/HomeContainer.review.test.tsx`: bấm link "Ôn tập" → pathname `/review-session` (route thật qua `@test/stroke-order-route` `openRoute` hoặc `LocationProbe`); kiểm: fail vì chưa có nút
- [ ] 5.2 GREEN: implement `S9.2-AC1 Mở màn ôn tập từ Trang chủ` — `ROUTE_PATHS.reviewSession`, `pages/review/review.routes.ts` + `containers/ReviewSessionContainer.tsx` (khung `<main>` + `<h1>` "Ôn tập"), thêm vào `page.routes.ts`; `assets/i18n/vi/review.json`, `home.json` `reviewLink`, đăng ký `review` ở `I18N_NAMESPACES` và `src/test/i18n.ts`; `pages/home/components/ReviewEntryLink.tsx` đặt trong `HomeContainer` trước "Xem lộ trình"; kiểm: 5.1 pass, test Trang chủ cũ vẫn pass
- [ ] 5.3 RED: viết test fail cho `S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ` — Testing Library, cùng file: DB sạch, xong onboarding, nạp lộ trình lỗi lẫn bình thường → có "Ôn tập", "Vào học", "Xem lộ trình"; pass ngay thì tạm bọc nút trong điều kiện `nextLesson !== null` để thấy fail; kiểm: thấy fail
- [ ] 5.4 GREEN: implement `S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ` — nút không phụ thuộc `useHome`, trả lại phần đã đảo; kiểm: 5.3 pass
- [ ] 5.5 RED: viết test fail cho `S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím` — Testing Library, cùng file: `user.tab()` tới "Ôn tập" (sau "Vào học", trước "Xem lộ trình"), `{Enter}` → `/review-session`; viền focus kiểm ở e2e 10.2; đảo tạm thứ tự nếu pass ngay; kiểm: thấy fail
- [ ] 5.6 GREEN: implement `S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím` — `ReviewEntryLink` là `Link` thật nên vào thứ tự Tab; viền focus dùng `:focus-visible` toàn cục của `_base.css`, không thêm CSS focus cho `.btn`; trả lại phần đã đảo; kiểm: `pnpm --filter @csk/web test:run pages/home` pass

## 6. Mặt hỏi và mặt đáp án (design D8, D9, D10)

Test Testing Library của nhóm 6–8 render `ReviewSessionContainer` ở `/review-session` với IndexedDB thật (fake-indexeddb, nạp thẻ qua
`DexieProgressStore.addNewCards`), `mockContentFetch` phục vụ lộ trình mẫu, `Audio` giả ở ranh giới như `ListenButton.test.tsx`.

- [ ] 6.1 RED: viết test fail cho `S9.2-AC1 Thẻ chiều nghĩa hiện chữ, giấu nghĩa` — Testing Library, `pages/review/containers/ReviewSessionContainer.faces.test.tsx`: mặt hỏi có "你好", nút "Hiện đáp án", không có "nǐ hǎo", "xin chào"; kiểm: fail vì container chưa có phiên
- [ ] 6.2 GREEN: implement `S9.2-AC1 Thẻ chiều nghĩa hiện chữ, giấu nghĩa` — `pages/review/hooks/useReviewSession.ts` (nạp phiên lúc mount, view `loading`/`reviewing`), `components/ReviewQuestionFace.tsx` (props `item`, `counter`, `onReveal`, `ref`; `ReviewCounter` trong `review.model.ts`; bộ đếm "Thẻ x / y", chiều nghĩa), `_review.css` + import `main.css`; kiểm: 6.1 pass
- [ ] 6.3 RED: viết test fail cho `S9.2-AC1 Thẻ chiều nghe chỉ có nút Nghe` — Testing Library, cùng file: có "Nghe" và "Hiện đáp án", `Audio.play` chưa gọi, không có "你好"/"nǐ hǎo"/"xin chào"; bấm "Nghe" → phát đúng `word.audio`; kiểm: thấy fail
- [ ] 6.4 GREEN: implement `S9.2-AC1 Thẻ chiều nghe chỉ có nút Nghe` — nhánh `listening` dùng `ListenButton`; kiểm: 6.1, 6.3 pass
- [ ] 6.5 RED: viết test fail cho `S9.2-AC1 Thẻ chiều viết hiện nghĩa, giấu chữ` — Testing Library, cùng file: "人" chiều viết → có "người", không "人"/"rén", không khung viết; kiểm: thấy fail
- [ ] 6.6 GREEN: implement `S9.2-AC1 Thẻ chiều viết hiện nghĩa, giấu chữ` — nhánh `writing` hiện `word.vi`; kiểm: 6.5 pass
- [ ] 6.7 RED: viết test fail cho `S9.2-AC1 Thẻ chiều viết hiện mọi nghĩa của từ` — Testing Library, cùng file: "谢谢" chiều viết → có "cảm ơn" và "cảm ơn bạn", không "谢谢"/"xièxie"; pass ngay thì tạm chỉ hiện `vi[0]` để thấy fail; kiểm: thấy fail
- [ ] 6.8 GREEN: implement `S9.2-AC1 Thẻ chiều viết hiện mọi nghĩa của từ` — `<ul>` mọi `vi`, trả lại phần đã đảo; kiểm: 6.5, 6.7 pass
- [ ] 6.9 RED: viết test fail cho `S9.2-AC1 Hiện đáp án` — Testing Library, cùng file, lặp cho ba chiều: bấm "Hiện đáp án" → "你好", "nǐ hǎo", "xin chào", nút "Nghe", `Audio.play` chưa gọi, không còn "Hiện đáp án"; kiểm: thấy fail
- [ ] 6.10 GREEN: implement `S9.2-AC1 Hiện đáp án` — `revealAnswer` trong hook, `components/ReviewAnswerFace.tsx` thay mặt hỏi; kiểm: 6.1–6.9 pass
- [ ] 6.11 RED: viết test fail cho `S9.2-AC1 Tắt Hiện pinyin không đổi màn ôn tập` — Testing Library, cùng file: lưu `isPinyinVisible: false` rồi mở màn, hiện đáp án → vẫn có "nǐ hǎo"; pass ngay thì tạm cho `ReviewAnswerFace` đọc `usePinyinVisibility` trong `PinyinVisibilityProvider` để thấy fail; kiểm: thấy fail
- [ ] 6.12 GREEN: implement `S9.2-AC1 Tắt Hiện pinyin không đổi màn ôn tập` — mặt đáp án luôn hiện pinyin, trả lại phần đã đảo; kiểm: 6.11 pass

## 7. Chấm, phiên và trạng thái kết thúc (design D8, D9)

- [ ] 7.1 RED: viết test fail cho `S9.2-AC2 Chưa hiện đáp án thì chưa chấm được` — Testing Library, `pages/review/containers/ReviewSessionContainer.rating.test.tsx`: mặt hỏi không có nút "Quên"/"Khó"/"Được"/"Dễ"; tạm render `ReviewRatingButtons` luôn để thấy fail nếu pass ngay; kiểm: thấy fail
- [ ] 7.2 GREEN: implement `S9.2-AC2 Chưa hiện đáp án thì chưa chấm được` — `components/ReviewRatingButtons.tsx` chỉ render khi `isAnswerShown`; kiểm: 7.1 pass
- [ ] 7.3 RED: viết test fail cho `S9.2-AC2 Hiện đáp án thì có 4 nút chấm` — Testing Library, cùng file: sau "Hiện đáp án" có đúng 4 nút theo thứ tự "Quên", "Khó", "Được", "Dễ"; kiểm: thấy fail
- [ ] 7.4 GREEN: implement `S9.2-AC2 Hiện đáp án thì có 4 nút chấm` — 4 nút theo `REVIEW_RATINGS`, chữ `review:ratings.*`; kiểm: 7.1, 7.3 pass
- [ ] 7.5 RED: viết test fail cho `S9.2-AC2 Chấm thì sang thẻ kế` — Testing Library, cùng file: 2 thẻ "mới", "Hiện đáp án" + "Được" → "Thẻ 2 / 2" mặt hỏi thẻ hai; đọc store (`getAllCards`): thẻ một `state` khác `'new'`, có `due` mới; kiểm: thấy fail
- [ ] 7.6 GREEN: implement `S9.2-AC2 Chấm thì sang thẻ kế` — `rate(cardId, rating)` trong hook gọi `reviewCard`, sang thẻ kế; kiểm: 7.5 pass
- [ ] 7.7 RED: viết test fail cho `S9.2-AC2 Bấm nút chấm hai lần thật nhanh chỉ chấm một lần` — Testing Library hook, `pages/review/hooks/useReviewSession.test.ts`: 3 thẻ "mới", gọi `rate(items[0].cardId, 'good')` hai lần liên tiếp trước khi promise đầu xong (và `user.dblClick` "Được" ở container) → "Thẻ 2 / 3", thẻ hai vẫn `state: 'new'` trong store; kiểm: thấy fail
- [ ] 7.8 GREEN: implement `S9.2-AC2 Bấm nút chấm hai lần thật nhanh chỉ chấm một lần` — ref `cardId` đang/đã chấm gán đồng bộ trước `await`, bỏ qua `cardId` khác thẻ hiện tại; kiểm: 7.5, 7.7 pass
- [ ] 7.9 RED: viết test fail cho `S9.2-AC1 Danh sách chốt lúc mở màn` — Testing Library hook, cùng file 7.7, chỉ giả `Date`: `vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime` (không giả `setTimeout`/`setImmediate` vì fake-indexeddb sẽ treo), `vi.useRealTimers()` trong `afterEach`: 2 thẻ, chấm "Quên" thẻ một, tua qua `due` mới của nó, chấm thẻ hai → view `finished`, thẻ một không hỏi lại; unmount + mount lại → thẻ một có trong phiên; tạm cho hook đọc lại phiên sau mỗi lần chấm để thấy fail nếu pass ngay; kiểm: thấy fail
- [ ] 7.10 GREEN: implement `S9.2-AC1 Danh sách chốt lúc mở màn` — `items` chốt lúc mount, không đọc lại; view `finished` khi hết; trả lại phần đã đảo; kiểm: 7.9 pass
- [ ] 7.11 RED: viết test fail cho `S9.2-AC2 Hết thẻ của phiên` — Testing Library, `pages/review/containers/ReviewSessionContainer.states.test.tsx`: 2 thẻ chấm hết → "Đã ôn xong 2 thẻ." + "Về Trang chủ"; bấm → `/home`; kiểm: thấy fail
- [ ] 7.12 GREEN: implement `S9.2-AC2 Hết thẻ của phiên` — `components/ReviewSessionMessage.tsx` (2 props `message`, `messageRef`; `<p role="status" tabIndex={-1}>`, link "Về Trang chủ"), dùng cho `finished` (rồi `no-cards`, `none-due` ở 7.14, 7.16); kiểm: 7.11 pass
- [ ] 7.13 RED: viết test fail cho `S9.2-AC1 Chưa có thẻ nào` — Testing Library, cùng file 7.11: DB không có thẻ, và DB chỉ có thẻ của từ lạ → "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." + "Về Trang chủ"; kiểm: thấy fail
- [ ] 7.14 GREEN: implement `S9.2-AC1 Chưa có thẻ nào` — `selectReviewSession` trả `no-cards` khi không còn thẻ được hỏi; view `no-cards`; kiểm: 7.13 pass
- [ ] 7.15 RED: viết test fail cho `S9.2-AC1 Không có thẻ đến hạn` — Testing Library, cùng file: mọi thẻ còn ≥ 1 ngày → "Không có thẻ nào cần ôn lúc này." + "Về Trang chủ"; kiểm: thấy fail
- [ ] 7.16 GREEN: implement `S9.2-AC1 Không có thẻ đến hạn` — `none-due` trong `selectReviewSession` + view; kiểm: 7.13, 7.15 pass
- [ ] 7.17 RED: viết test fail cho `S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ` — Testing Library, `ReviewSessionContainer.rating.test.tsx`: phiên 2 thẻ, ở mặt hỏi thẻ một bấm link "Về Trang chủ" đầu màn → `/home`, không có `dialog`; hai thẻ trong store y như trước; link tới được bằng Tab, Enter mở; kiểm: thấy fail
- [ ] 7.18 GREEN: implement `S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ` — `Link` `review-back-link` đầu màn khi `reviewing`; kiểm: 7.17 pass
- [ ] 7.19 RED: viết test fail cho `S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm` — Testing Library, cùng file: 3 thẻ đến hạn, chấm "Dễ" thẻ một, "Về Trang chủ", mở lại `/review-session` → "Thẻ 1 / 2", không có thẻ một; kiểm: fail (hoặc đảo tạm việc lưu ngay thành lưu khi hết phiên để thấy fail)
- [ ] 7.20 GREEN: implement `S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm` — trả lại phần đã đảo; kiểm: cả `ReviewSessionContainer.rating.test.tsx`, `.states.test.tsx`, `useReviewSession.test.ts` pass
- [ ] 7.21 RED: viết test fail cho `S9.2-AC1 Thẻ chiều nghe khi audio không phát được` — Testing Library, `ReviewSessionContainer.faces.test.tsx`: `Audio.play` reject → `role="alert"` "Không phát được audio."; vẫn bấm "Hiện đáp án" rồi "Khó" được, sang thẻ kế; kiểm: thấy fail
- [ ] 7.22 GREEN: implement `S9.2-AC1 Thẻ chiều nghe khi audio không phát được` — sửa nếu cần (lỗi audio không chặn "Hiện đáp án"/chấm); kiểm: cả file `ReviewSessionContainer.faces.test.tsx` pass

## 8. Lỗi, focus và bàn phím (design D8, D9)

- [ ] 8.1 RED: viết test fail cho `S9.2-AC2 Lưu lỗi thì ở lại thẻ` — Testing Library, `pages/review/containers/ReviewSessionContainer.errors.test.tsx` (`vi.spyOn(DexieProgressStore.prototype, 'saveCard')` reject một lần): bấm "Được" → vẫn "你好", `role="alert"` "Không lưu được kết quả. Hãy chấm lại.", 4 nút còn, focus ở "Được", thẻ trong store vẫn `state: 'new'`; lỗi lần hai thông báo được render lại (đổi `key`); bấm "Được" lần nữa lưu được → sang thẻ kế; kiểm: thấy fail
- [ ] 8.2 GREEN: implement `S9.2-AC2 Lưu lỗi thì ở lại thẻ` — nhánh lỗi của `rate` (xóa ref, `saveErrorId`), thông báo `role="alert" key={saveErrorId}`, nút không `disabled`; kiểm: 8.1 pass
- [ ] 8.3 RED: viết test fail cho `S9.2-AC1 Không tải được thẻ` — Testing Library, cùng file: `vi.spyOn(DexieProgressStore.prototype, 'getAllCards')` reject → `role="alert"` "Không tải được thẻ ôn tập.", nút "Thử lại", "Về Trang chủ"; bấm "Thử lại" lần này đọc được → mặt hỏi thẻ đến hạn đầu tiên; kiểm: thấy fail
- [ ] 8.4 GREEN: implement `S9.2-AC1 Không tải được thẻ` — view `load-error` + `retry` trong hook; `components/ReviewLoadError.tsx` (4 props `onRetry`, `isRetrying`, `messageRef`, `retryRef`; `<p role="alert" tabIndex={-1}>`, nút "Thử lại" không `disabled`, link "Về Trang chủ"), container đặt `key={errorId}` lên component; kiểm: 8.3 pass
- [ ] 8.5 RED: viết test fail cho `S9.2-AC1 Focus sau khi Thử lại` — Testing Library, `pages/review/containers/ReviewSessionContainer.focus.test.tsx`: Enter ở "Thử lại", đọc được 2 thẻ → `document.activeElement` là mặt hỏi, tên truy cập bắt đầu "Thẻ 1 / 2"; vẫn lỗi → focus ở "Thử lại", alert render lại; chỉ có thẻ chưa đến hạn → focus ở thông báo; kiểm: thấy fail
- [ ] 8.6 GREEN: implement `S9.2-AC1 Focus sau khi Thử lại` — `focusRequest` trong hook, ref + `useEffect` theo `focusRequest.id` trong container, `isRetrying` giữ nút "Thử lại"; kiểm: 8.5 pass
- [ ] 8.7 RED: viết test fail cho `S9.2-AC2 Focus không rơi khi đổi mặt thẻ` — Testing Library, cùng file 8.5: Enter ở "Hiện đáp án" → focus ở mặt đáp án (tên "Đáp án…", không phải nút chấm); chấm bằng bàn phím còn thẻ → focus ở mặt hỏi, tên bắt đầu "Thẻ 2 / 2"; hết thẻ → focus ở "Đã ôn xong N thẻ."; vùng `tabIndex=-1` (không trong thứ tự Tab); kiểm: thấy fail
- [ ] 8.8 GREEN: implement `S9.2-AC2 Focus không rơi khi đổi mặt thẻ` — `aria-labelledby` cho mặt hỏi/đáp án, `focusRequest` `answer`/`question`/`status`, CSS viền focus `:focus` chỉ cho vùng `tabIndex={-1}` (`.review-face`, `.review-message`) trong `_review.css`; kiểm: 8.5, 8.7 pass
- [ ] 8.9 RED: viết test fail cho `S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím` — Testing Library, cùng file: chỉ `user.tab()`/`{Enter}`/`{ }` tới "Hiện đáp án" (Enter) rồi "Khó" (Space) → thẻ chấm "Khó" trong store, sang thẻ kế; viền focus kiểm ở e2e 10.4; đảo tạm (ví dụ `tabIndex=-1` trên nút "Khó") nếu pass ngay; kiểm: thấy fail
- [ ] 8.10 GREEN: implement `S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím` — trả lại phần đã đảo; nút/link của màn dựa vào `:focus-visible` toàn cục của `_base.css`, `_review.css` không thêm rule focus cho nút/link; kiểm: `pnpm --filter @csk/web test:run pages/review` pass

## 9. Offline (design D2, D13)

- [ ] 9.1 RED: viết test fail cho `S9.2-AC2 Ôn và chấm khi offline` (TC-S9.2-AC2-27, tên test chứa ID TC) — e2e Playwright, `apps/web/e2e/E9/s9.2-review-offline.spec.ts` (bản build e2e, `useReviewCardsFixture(context)` trước `page.goto` đầu, mở app một lần khi có mạng, `seedReviewProgress` với `newCard('你好', 'meaning')` đến hạn), theo đúng các bước của TC: `context.setOffline(true)`; vào Trang chủ, bấm "Ôn tập" → "Thẻ 1 / 1" với "你好" và "Hiện đáp án"; hiện đáp án, 4 nút dùng được, chấm "Dễ" → "Đã ôn xong 1 thẻ.", không có lỗi mạng; đóng trang, mở lại app (vẫn offline), vào Trang chủ, bấm "Ôn tập" → "Không có thẻ nào cần ôn lúc này."; thấy fail ở bước offline nếu chunk/`review.json` chưa precache, còn pass ngay thì ghi rõ trong commit hành vi đã có nhờ precache hiện có (miễn đảo vì là cấu hình build); kiểm: chạy và ghi kết quả
- [ ] 9.2 GREEN: implement `S9.2-AC2 Ôn và chấm khi offline` — bảo đảm chunk màn ôn tập và `i18n/vi/review.json` nằm trong precache (`PRECACHE_BASE_PATTERNS` trong `vite.config.ts` nếu thiếu); kiểm: 9.1 pass, `pnpm --filter @csk/web build` pass

## 10. E2E luồng người dùng (integration, theo cột Tự động `e2e` của test-cases.md)

- [ ] 10.1 Fixture và helper e2e (design D13): dùng lại bộ bài mẫu và helper S9.1 (`serveReviewCardsPath`, `useReviewCardsFixture`, `seedReviewProgress`, `readReviewCards`, `newCard`, `breakReviewWrites(page, BREAK_CARD_WRITES)`, `openMachine`, `exportFromSettings`, `importAndOverwrite`); sửa seed "你好" trong `e2e/fixtures/reviewCardsFixtures.ts` thành `pinyin: 'nǐ hǎo'`; thêm `e2e/E9/review-session.helpers.ts` (`reviewedCardDueAt`, `seedRawCardRow`, `breakReviewReads`/`restoreReviewReads` bọc `getAll` + `openCursor` của store `cards`); thêm file sao lưu mẫu cho QA `e2e/E9/fixtures/progress-backup/on-tap-den-han.json` (ngày đặt đồng hồ ghi trong mô tả PR); kiểm: test khói mở `/review-session` với thẻ nạp sẵn thấy "Thẻ 1 / 1", `breakReviewReads` làm màn hiện "Không tải được thẻ ôn tập.", e2e S9.1 (`pnpm e2e -- e2e/E9/s9.1-`) vẫn pass
- [ ] 10.2 `apps/web/e2e/E9/s9.2-home-review-entry.spec.ts`: TC-S9.2-AC1-1…4 (mở từ Trang chủ, nút hiện khi chưa có thẻ, offline, bàn phím + viền focus `outline` khác `none`); kiểm: pass
- [ ] 10.3 `apps/web/e2e/E9/s9.2-review-session.spec.ts`: TC-S9.2-AC1-7, 9, 11, 12, 14–19, 41–43, 46, 49 (chọn thẻ, thứ tự, chốt phiên, bỏ qua thẻ; AC1 dùng `on-tap-den-han.json` qua `importAndOverwrite` ít nhất một case) và AC2-5…14, 25, 26 (chấm, bấm hai lần, rời/thoát, hết thẻ); tách file nếu > 300 dòng; kiểm: pass
- [ ] 10.4 `apps/web/e2e/E9/s9.2-review-faces.spec.ts` + `s9.2-review-a11y.spec.ts`: TC-S9.2-AC1-20, 21, 23, 24–27, 50 (mặt hỏi/đáp án, không tự phát audio, pinyin, audio chặn bằng `page.route`), AC2-1, 2, 15–19 (bàn phím, focus, tên đọc được qua `getByRole`/cây trợ năng, viền focus); kiểm: pass
- [ ] 10.5 `apps/web/e2e/E9/s9.2-review-errors.spec.ts`: TC-S9.2-AC1-29–31, 34–39 (rỗng, lỗi tải bằng `breakReviewReads`, thử lại, focus, thẻ đọc không được bằng `seedRawCardRow`), AC2-21–23 (lưu lỗi bằng `breakReviewWrites`, thông báo đọc lại); kiểm: pass
- [ ] 10.6 `apps/web/e2e/E9/s9.2-review-schedule.spec.ts`: TC-S9.2-AC3-3…7 (`page.clock`), AC3-8 (hai máy `openMachine`, xuất/nhập qua Cài đặt bằng `exportFromSettings`/`importAndOverwrite`, so `readReviewCards`); kiểm: pass

## 11. Tài liệu và kiểm tra cuối

- [ ] 11.1 Docs thuần (miễn test-first): cập nhật `docs/03-architecture.md` (cây thư mục `pages/review/`, route `/review-session`; §4 thêm `review.service` (S9.2: Phần 1/2/3 như design D4), sửa dòng `srs.service` "file duy nhất import `ts-fsrs`" thành `shared/utils/fsrs-card.utils.ts`; §6.3 thêm `saveCard`, bỏ dòng "S9.2 (chưa có)"); kiểm: `grep -n "review-session\|saveCard\|fsrs-card.utils" docs/03-architecture.md` có kết quả
- [ ] 11.2 Self-review theo `CLAUDE.md` §0, §2, §7: `ts-fsrs` chỉ import trong `fsrs-card.utils.ts`; component không import service; `ReviewService` không import `SrsService`; không `any`/`eslint-disable`; file < 300 dòng (`srs.service.ts`, `review.service.ts`, `progress-store.service.ts`); kiểm: `grep -rln "from 'ts-fsrs'" apps/web/src` chỉ ra `fsrs-card.utils.ts`, `wc -l` các file trên < 300
- [ ] 11.3 Kiểm tra toàn bộ: `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check`, `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`, `pnpm e2e`; kiểm: tất cả pass, ghi kết quả thật vào mô tả PR
- [ ] 11.4 Screenshot màn ôn tập (mặt hỏi, mặt đáp án, hết thẻ) và Trang chủ có nút "Ôn tập" ở 375×812 và 1280×800, sáng và tối, đẩy lên nhánh `pr-assets`; kiểm: ảnh nhúng trong mô tả PR theo `.github/pull_request_template.md`

## Workflow follow-up

- PR code ghi `Spec PR: #149`, `Refs #40` hoặc `Closes #40` khi mọi AC xong; mô tả PR ghi lệch so với proposal (`ReviewService` tách
  khỏi `srs.service.ts`, design D4) và ngày đặt đồng hồ cho file sao lưu mẫu; không archive trong PR code.
- Archive tự động bằng `archive-spec-workflow.yml` sau khi merge.
