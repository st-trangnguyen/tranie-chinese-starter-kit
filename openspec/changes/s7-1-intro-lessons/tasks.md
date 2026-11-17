# Tasks: S7.1 Soạn 12 bài Nhập môn

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (vd `S7.1-AC1 Câu viết đang tải dữ liệu nét`). Tên file, hàm, route: design D1–D8.
RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy fail, rồi trả lại.

Vitest: `pnpm --filter @csk/content test:run <mẫu>`, `pnpm --filter @csk/web test:run <mẫu>`. Thứ tự cụm commit (PR lớn):
1 luật pipeline → 2–5 màn bài → 6 nội dung → 7 e2e → 8 kiểm tra.

## 1. Luật `content:check` cho câu viết — `content/scripts/content-build/lessons.ts` (design D2)

Test chung `content/scripts/content-build/assemble.strokeWrite.test.ts` — Vitest, `assembleContent` với đầu vào thử (mẫu
`assemble.test.ts`): từ điển thử có 爱, 爸爸, 人; `strokeData` thử có 人, **không** có 爱; một bài có câu `stroke-write`.

- [x] 1.1 RED: S7.1-AC3 "Câu viết dùng chữ không có dữ liệu nét thì kiểm tra nội dung báo lỗi" — câu viết `爱`: `lessonIssues` có issue `level: 'error'` nêu "爱" và "thiếu dữ liệu nét"; không issue nào chứa "không có trong từ điển"; `exitCodeOf(runChecks([lessonsCheck(lessonIssues)]))` là 1; kiểm: fail vì chưa có luật (chỉ có cảnh báo `missingStrokes`)
- [x] 1.2 GREEN: `lessonStrokeWriteIssues(parsed, wordsById, hasStrokeData)` nhánh thiếu nét + gắn vào `lessonIssues` trong `assembleContent`; kiểm: test 1.1 pass, `assemble.test.ts`, `lessons.test.ts` vẫn pass
- [x] 1.3 RED: S7.1-AC3 "Câu viết dùng từ nhiều chữ thì kiểm tra nội dung báo lỗi" — câu viết `爸爸`: error nêu "爸爸"; kiểm: fail
- [x] 1.4 GREEN: nhánh nhiều chữ; kiểm: test 1.3 pass
- [x] 1.5 RED: S7.1-AC3 "Câu viết rỗng thì kiểm tra nội dung báo lỗi" — `wordId: ''` và câu thiếu `wordId`: có error chứa "câu viết rỗng"; kiểm: fail (chỉ có lỗi schema chung)
- [x] 1.6 GREEN: nhánh rỗng; kiểm: test 1.5 pass
- [x] 1.7 RED: S7.1-AC3 "Câu viết không phải chữ Hán thì kiểm tra nội dung báo lỗi" — `wordId: abc`: có error của luật câu viết nêu "abc" (ngoài lỗi "không có trong từ điển"); kiểm: fail
- [x] 1.8 GREEN: nhánh không phải chữ Hán (`hanCharacterSchema`); kiểm: test 1.7 pass; câu viết `人` có nét không sinh issue nào; `pnpm content:check` trên nội dung hiện tại vẫn pass

## 2. Rule kết quả câu viết — `shared/services/writing-practice.service.ts` (design D5)

Test `apps/web/src/app/shared/services/writing-practice.service.test.ts` (thêm `describe`), Vitest thuần.

- [x] 2.1 RED: S7.1-AC1 "Viết xong chữ thì câu được tính đúng" (phần rule) — `startPractice(2)`: `mistake` → `lessonResultOf(prev, next)` là `null`; `correct` rồi `correct` → lần thứ hai trả `{ isCorrect: true }` không `explanation`; sự kiện sau khi xong → `null`; kiểm: fail vì chưa có method
- [x] 2.2 GREEN: Phần 2 `lessonResultOf` kèm comment `Rule: …`; kiểm: test 2.1 pass, file < 300 dòng
- [x] 2.3 RED: lesson-runner S7.1-AC1 "Câu viết chỉ có kết quả Đúng" (phần rule) — 4 `mistake` rồi 2 `correct`: mọi lần trước trả `null`, không lần nào `isCorrect: false`; kiểm: chạy, nếu pass ngay thì tạm cho `mistake` trả `{ isCorrect: false }` để thấy fail rồi trả lại
- [x] 2.4 GREEN: sửa đến khi pass; kiểm: test 2.3 pass

## 3. Câu viết trong màn bài — hook, container, component (design D4, D6, D7, D8)

Test chung `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.strokeWrite.test.tsx` — Vitest + Testing Library,
`vi.mock('hanzi-writer')` với `FakeHanziWriter`, helper mới `src/test/lesson-stroke-write.helpers.ts` (fetch ghép bài thử +
file nét thật, design mục Test). Bài thử: `[tone-choice 八, stroke-write 人, stroke-write 十]` hoặc theo case.

- [x] 3.1 RED: S7.1-AC1 "Câu viết hiện khung viết của đúng chữ" — tới câu viết 人: figure "Khung viết chữ 人", `.stroke-order-outline path` đủ 2 path, `data-completed-stroke-count="0"`; không có "Dạng bài này chưa có." và không có nút "Bỏ qua câu này"; tạo helper `lesson-stroke-write.helpers.ts` cùng commit; kiểm: fail vì màn hiện nhánh dạng chưa hỗ trợ
- [x] 3.2 GREEN: model `LessonStrokeWriteView` + trường optional `LessonRunnerView.strokeWrite?` (design D6, không thêm prop cho `LessonRunner`), `useLessonStrokeWrite(exerciseId, character, onResult)` (service tạo bằng `useMemo(() => new WritingPracticeService(), [])`, nạp + `startPractice`, effect deps `[writingPracticeService, exerciseId, character, attempt]`), container truyền `strokeWriteExerciseId`/`strokeWriteCharacter` (primitive), `LessonRunner` rẽ nhánh `stroke-write` (`<LessonStrokeWrite key={exercise.id}>`; thiếu `view.strokeWrite` thì hiện như đang tải, design D4), `LessonStrokeWrite` nhánh `ready` với `StrokeWritingPad key={exerciseId}`; kiểm: test 3.1 pass, `LessonRunner.test.tsx` cũ pass và typecheck **không sửa file test**
- [x] 3.3 RED: S7.1-AC1 "Khung viết trong bài nhận focus bàn phím" — `userEvent.tab()` tới figure, `document.activeElement` là figure, tên đọc được chứa "人"; kiểm: chạy, nếu pass ngay (khung S6.2 sẵn `tabIndex`) thì tạm bọc khung bằng phần tử `inert` để thấy fail rồi trả lại
- [x] 3.4 GREEN: sửa đến khi pass; kiểm: test 3.3 pass
- [x] 3.5 RED: S7.1-AC1 "Viết sai nét trong câu viết chưa kết thúc câu" — câu 十, `emitMistake` (đường dài): alert "Sai nét. Viết lại nét này."; không "Đúng", không "Sai", không nút "Tiếp tục"; kiểm: fail vì chưa nối `recordStrokeAttempt`/thông báo
- [x] 3.6 GREEN: `recordStrokeAttempt` ổn định trong hook, alert `key={mistakeSerial}` trong `LessonStrokeWrite`; kiểm: test 3.5 pass
- [x] 3.7 RED: S7.1-AC1 "Viết xong chữ thì câu được tính đúng" — (a) container: câu 十: 1 `emitMistake` rồi 2 `emitCorrectStroke` → "Đúng" + "Tiếp tục"; bấm "Tiếp tục" → câu kế, "Câu k+1 / n"; (b) hook `apps/web/src/app/pages/lesson/hooks/useLessonStrokeWrite.test.ts` (`renderHook`, `mockStrokeFetch`, `onResult = vi.fn()`): với 十, gọi `recordStrokeAttempt` `correct` hai lần **trong cùng một `act`** → `onResult` `toHaveBeenCalledTimes(1)` với `{ isCorrect: true }`; gọi thêm `correct`/`mistake` → vẫn 1 lần; `recordStrokeAttempt` giữ cùng tham chiếu qua `rerender`; `rerender` sang `exerciseId` khác cùng chữ 十 → nạp lại, `practice.completedStrokeCount` 0; kiểm: fail vì chưa gọi `onResult`
- [x] 3.8 GREEN: hook gọi `onResult` khi `lessonResultOf` khác `null` (handler, không effect), `practiceRef.current = next` gán đồng bộ trong handler (design D6); kiểm: test 3.7 (a) và (b) pass
- [ ] 3.9 RED: lesson-runner S7.1-AC1 "Câu viết chỉ có kết quả Đúng" — câu 十: 4 `emitMistake` rồi 2 `emitCorrectStroke` → "Đúng" + "Tiếp tục", không "Sai", không giải thích; kiểm: chạy, nếu pass ngay thì tạm cho hook báo `{ isCorrect: false }` khi sai để thấy fail rồi trả lại
- [ ] 3.10 GREEN: sửa đến khi pass; kiểm: test 3.9 pass
- [ ] 3.11 RED: S7.1-AC1 "Câu viết đã Đúng thì khung bị khóa" — sau "Đúng" `emitMistake` và `emitCorrectStroke`: không alert sai, `data-completed-stroke-count` vẫn 2, vẫn "Đúng" + "Tiếp tục"; không có nút "Viết lại"; kiểm: chạy, nếu pass ngay thì tạm bỏ nhánh `isComplete` của `recordStrokeAttempt` để thấy fail rồi trả lại
- [ ] 3.12 GREEN: sửa đến khi pass (không render `WritingPracticeFeedback`); kiểm: test 3.11 pass
- [ ] 3.13 RED: S7.1-AC2 "Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét" — trước khi viết có link "Xem thứ tự nét"; viết xong 人 → không còn link, có "Tiếp tục"; kiểm: fail vì chưa có link
- [ ] 3.14 GREEN: link `ROUTE_PATHS.strokeOrder(character)` khi `!isAnswered && !practice.isComplete`, dùng lại key `writing-practice:strokeOrderLink` (design D8); kiểm: test 3.13 pass
- [ ] 3.15 RED: S7.1-AC1 "Làm hết bài có câu viết thì bài Đã xong" (mức màn) — bài `[tone-choice, stroke-write 人, stroke-write 十]` làm hết: "Bạn đã làm xong các câu của bài này.", "Đúng k / 3 câu" tính 2 câu viết là đúng; IndexedDB `lessonProgress` của bài có `status: 'completed'`; kiểm: chạy, nếu pass ngay thì tạm cho câu viết gọi `onSkip` thay `onResult` để thấy fail rồi trả lại
- [ ] 3.16 GREEN: sửa đến khi pass; kiểm: test 3.15 pass, file test < 300 dòng (tách nếu cần)

## 4. Trạng thái tải câu viết và bỏ qua — `LessonStrokeWrite` + `lesson.json` (design D7, D8)

Test chung `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.strokeWriteLoad.test.tsx` — cùng helper, override
`mockStrokeFetch` cho `人.json`.

- [ ] 4.1 RED: S7.1-AC1 "Câu viết đang tải dữ liệu nét" — override trả `Promise` chưa resolve: status "Đang tải…"; không figure, không link "Xem thứ tự nét", không "Tiếp tục"; kiểm: fail vì nhánh `loading` chưa render
- [ ] 4.2 GREEN: nhánh `loading`; kiểm: test 4.1 pass
- [ ] 4.3 RED: S7.1-AC1 "Câu viết tải dữ liệu nét lỗi" — override 500 (và JSON hỏng): alert "Có lỗi xảy ra", nút "Thử lại", nút "Bỏ qua câu này"; không figure, không link, không "Chưa có dữ liệu nét cho chữ này."; kiểm: fail
- [ ] 4.4 GREEN: nhánh `error`; thêm key `lesson:skip`, `LessonRunner` nhánh dạng chưa hỗ trợ chuyển sang `skip`; kiểm: test 4.3 pass, test S3.2-X1 cũ vẫn pass
- [ ] 4.5 RED: S7.1-AC1 "Câu viết thử lại sau khi tải lỗi" — lỗi lần đầu, thay mock bằng bản thành công, bấm "Thử lại": hết alert, có figure "Khung viết chữ 人" và link "Xem thứ tự nét"; kiểm: fail vì chưa nối `retry`
- [ ] 4.6 GREEN: `retry` trong hook (`attempt`), nối nút; kiểm: test 4.5 pass
- [ ] 4.7 RED: S7.1-AC1 "Câu viết tải lỗi rồi bỏ qua" — bài 3 câu, câu 2 là câu viết lỗi: "Bỏ qua câu này" → "Câu 3 / 3"; làm câu 3 → cuối bài "Bạn đã bỏ qua 1 câu, bài chưa hoàn thành."; IndexedDB không `completed`; kiểm: fail vì chưa nối `onSkip`/câu chữ cũ
- [ ] 4.8 GREEN: nút bỏ qua gọi `onSkip`; sửa `finishedWithSkipped` (design D8); kiểm: test 4.7 pass
- [ ] 4.9 RED: S7.1-AC1 "Câu viết gặp chữ không có dữ liệu nét khi chạy app" — câu viết có `hanzi` 龘 (không có trong `strokes/index.json` thật): "Chưa có dữ liệu nét cho chữ này.", không figure, không link, có "Bỏ qua câu này"; bỏ qua → câu kế; cuối bài báo bỏ qua 1 câu và chưa hoàn thành; kiểm: fail vì nhánh `unavailable` chưa render
- [ ] 4.10 GREEN: nhánh `unavailable`; kiểm: test 4.9 pass
- [ ] 4.11 RED: lesson-runner S7.1-AC1 "Bỏ qua câu viết thiếu dữ liệu nét thì bài chưa hoàn thành" — câu 1 làm, câu 2 (龘) bỏ qua, câu 3 làm: tiêu đề cuối bài báo bỏ qua 1 câu, chưa hoàn thành, **không** chứa "dạng bài chưa có"; kiểm: chạy, nếu pass ngay nhờ 4.8 thì tạm trả câu chữ cũ để thấy fail rồi trả lại
- [ ] 4.12 GREEN: sửa đến khi pass; kiểm: test 4.11 pass
- [ ] 4.13 RED: S7.1-AC1 "Mọi câu thuộc dạng đã hỗ trợ" (phần màn bài) — với `exerciseRegistry` thật, mỗi kind trong `exerciseSchema.options` render qua `LessonRunner` không hiện "Dạng bài này chưa có."; file `apps/web/src/app/pages/lesson/components/LessonRunner.kinds.test.tsx`; kiểm: chạy, nếu pass ngay nhờ 3.2 thì tạm bỏ nhánh `stroke-write` để thấy fail rồi trả lại
- [ ] 4.14 GREEN: sửa đến khi pass; kiểm: test 4.13 pass

## 5. Lối vào thứ tự nét, quay lại, audio (design D7, mục Test)

Test chung `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.strokeOrderLink.test.tsx` — `openRoute('/lessons/l1')`
qua bảng route thật (`src/test/stroke-order-route.tsx`), `LocationProbe` hoặc heading màn S6.1, `router.navigate(-1)` cho back.

- [ ] 5.1 RED: S7.1-AC2 "Từ câu viết mở màn xem thứ tự nét" — bấm link "Xem thứ tự nét" ở câu viết 人: vị trí `/characters/%E4%BA%BA/stroke-order`, figure "Thứ tự nét chữ 人", link "Tập viết"; kiểm: chạy, nếu pass ngay nhờ 3.14 thì tạm đổi đích link để thấy fail rồi trả lại
- [ ] 5.2 GREEN: sửa đến khi pass; kiểm: test 5.1 pass
- [ ] 5.3 RED: S7.1-AC2 "Liên kết Xem thứ tự nét dùng được bằng bàn phím" — Tab tới link (đi qua khung viết), `{Enter}` → màn thứ tự nét của 人; kiểm: chạy, nếu pass ngay thì tạm đổi link thành `<span>` để thấy fail rồi trả lại
- [ ] 5.4 GREEN: sửa đến khi pass; kiểm: test 5.3 pass
- [ ] 5.5 RED: S7.1-AC2 "Quay lại bài từ màn thứ tự nét" — bài 3 câu, làm câu 1, tới câu viết 2 vẽ 1 nét đúng, bấm link, `router.navigate(-1)`: "Câu 2 / 3", figure 人 `data-completed-stroke-count="0"`; kiểm: chạy, nếu pass ngay (luật làm tiếp S3.3) thì tạm bỏ lưu `cursor` khi đổi câu để thấy fail rồi trả lại
- [ ] 5.6 GREEN: sửa đến khi pass (không thêm code nếu luật làm tiếp đã đủ); kiểm: test 5.5 pass
- [ ] 5.7 RED: S7.1-AC2 "Quay lại bài thì tổng kết chỉ tính từ câu viết đó" — bài 5 câu, đúng câu 1, 2; câu 3 câu viết: bấm link, back, rồi đúng câu 3, 4, 5: "Đúng 3 / 3 câu", "Sai 0 câu"; thời gian: `vi.setSystemTime` +120 s trước khi bấm link, +60 s trước khi xong → hiện thời gian 1 phút (không phải 3 phút); kiểm: chạy, nếu pass ngay thì tạm giữ `startedAt` cũ khi mở lại bài để thấy fail rồi trả lại
- [ ] 5.8 GREEN: sửa đến khi pass; kiểm: test 5.7 pass
- [ ] 5.9 RED: S7.1-AC1 "Nút Nghe phát đúng từ hoặc câu đang hiện" — `apps/web/src/app/pages/lesson/containers/LessonRunnerContainer.audio.test.tsx`, registry thật, FakeAudio (mẫu `ListenButton.test.tsx`), từ thử có `audio` khác nhau: ở câu `tone-choice`, `sound-pair`, `pinyin-type` bấm "Nghe" → `src` là audio của đúng từ câu đó hỏi; câu `speak` bấm "Nghe mẫu" → audio của câu; sau "Tiếp tục" bấm "Nghe" ở câu mới → không phải audio câu trước; kiểm: chạy, nếu pass ngay (hành vi S4.4) thì tạm bỏ `key={exercise.id}` và truyền `content` của câu trước để thấy fail rồi trả lại
- [ ] 5.10 GREEN: sửa đến khi pass; kiểm: test 5.9 pass

## 6. Soạn 12 bài và sinh nội dung — `content/authored/` (design D1, D3)

Test chung `content/scripts/content-check/introLessons.test.ts` (+ `introLessons.writing.test.ts` khi > 300 dòng) — Vitest
đọc output build trong `apps/web/src/assets/` qua `PATHS`, parse Zod. Viết các RED 6.1–6.13 trên nội dung hiện có (1 bài mẫu)
nên fail vì thiếu nội dung; GREEN là soạn YAML + sinh lại (task 6.14–6.16).

- [ ] 6.1 RED: S7.1-AC2 "Lộ trình có đủ 12 bài Nhập môn đúng thứ tự" (phần nội dung) — `content.json`: stage đầu "Nhập môn", đúng một unit (`id` `intro-basics`, `title` "Pinyin và chữ Hán cơ bản", design D1), 12 lessonIds; title các bài khớp `INTRO_LESSON_TITLES` từng ký tự; kiểm: fail (1 bài)
- [ ] 6.2 RED: S7.1-AC2 "Không còn bài mẫu cũ" — không bài nào title "Bốn thanh điệu"; kiểm: fail
- [ ] 6.3 RED: S7.1-AC1 "Mỗi bài có ít nhất 2 dạng bài tập" — mỗi bài ≥ 2 kind khác nhau; kiểm: fail (thiếu bài)
- [ ] 6.4 RED: S7.1-AC1 "Mỗi bài có câu nghe" (phần nội dung) — mỗi bài ≥ 1 câu thuộc `LISTEN_KINDS`; kiểm: fail
- [ ] 6.5 RED: S7.1-AC1 "Mọi câu thuộc dạng đã hỗ trợ" (phần nội dung) — mọi kind ∈ `SUPPORTED_KINDS`; kiểm: fail (thiếu bài)
- [ ] 6.6 RED: S7.1-AC1 "Mọi từ và câu của bài đều có audio" — mọi từ/câu mà câu `AUDIO_KINDS` dùng có file mp3 trong `apps/web/src/assets/` kích thước > 0; kiểm: fail
- [ ] 6.7 RED: S7.1-AC1 "Bài 2 không hỏi từ có biến điệu trong câu chọn thanh và gõ pinyin" — `intro-02`: không câu `tone-choice`/`pinyin-type` có từ chứa 不, 一, hoặc hai âm tiết thanh 3 liền nhau (`parsePinyin`); kiểm: fail vì chưa có `intro-02`
- [ ] 6.8 RED: S7.1-AC1 "Bài 2 có câu nói theo mẫu với từ có biến điệu" — `intro-02` có ≥ 1 câu `speak` dùng từ/câu có 不, 一, hoặc hai thanh 3 liền nhau; kiểm: fail
- [ ] 6.9 RED: S7.1-AC2 "Bài "Nét cơ bản và thứ tự nét" có câu viết" — `intro-10` có câu viết 人 và câu viết 十 (theo `word.hanzi`); kiểm: fail
- [ ] 6.10 RED: S7.1-AC2 "Bài "30 bộ thủ phổ biến" có câu viết" — `intro-11` có ≥ 1 câu `stroke-write`; kiểm: fail
- [ ] 6.11 RED: S7.1-AC2 "Câu viết của bài "30 bộ thủ phổ biến" là chữ trong từ điển" — mỗi câu viết `intro-11` trỏ tới từ trong `words.json` (HSK 1), `hanzi` một chữ, có trong `strokes/index.json`; kiểm: fail
- [ ] 6.12 RED: S7.1-AC3 "Mọi câu viết của 12 bài có dữ liệu nét" — mọi câu viết của 12 bài: `hanCharacterSchema` khớp `word.hanzi`, chữ có trong `strokes/index.json` và có file `strokes/<chữ>.json`; kiểm: fail (bài mẫu có 1 câu viết nhưng chưa đủ 12 bài — assertion số bài đứng trước)
- [ ] 6.13 Commit các RED 6.1–6.12 một lần `test(content): …`, ghi output fail
- [ ] 6.14 GREEN (nội dung): soạn 12 file `content/authored/lessons/intro/NN-<slug>.yaml` theo D1 (đổi `01-thanh-dieu.yaml` → `01-thanh-1-4.yaml`), sửa `path.yaml` (một unit `intro-basics` "Pinyin và chữ Hán cơ bản" thay `intro-pronunciation` "Phát âm", 12 bài), thêm nghĩa/override TTS nếu cần; chạy `pnpm --filter @csk/content content:build`; kiểm: không lỗi build
- [ ] 6.15 GREEN (audio + font): `pnpm --filter @csk/content content:audio` (cần mạng) và `pnpm --filter @csk/content font:subset`; kiểm: không còn audio thiếu, font có chữ mới
- [ ] 6.16 GREEN: kiểm: test 6.1–6.12 pass
- [ ] 6.17 RED/GREEN: S7.1-AC3 "Kiểm tra nội dung chạy qua" và "Nội dung đã build khớp file soạn" — RED: sau 6.14 sửa một YAML (vd thêm câu) mà chưa build lại, `pnpm content:check` exit 1 với "Output chưa khớp nguồn"; hoàn tác; GREEN: `pnpm content:check` exit 0, 0 lỗi (cảnh báo nghĩa chưa review được phép) — ngoại lệ test-first: lệnh kiểm tra của pipeline là test; kiểm: ghi output thật

## 7. Luồng thật, offline — e2e Playwright (`apps/web/e2e/E7/`)

Helper `apps/web/e2e/E7/intro-lessons.helpers.ts`: `INTRO_LESSON_TITLES`, `seedCompletedLessons(page, lessonIds)`,
`answerCurrentQuestion(page)` (design mục Test). E2E viết sau nhóm 3–6 chạy trên màn đã có: RED nào pass ngay thì tạm đổi
nội dung/hành vi để thấy fail rồi trả lại. Tên test mang ID Scenario và ID TC. `test.describe('S7.1 Soạn 12 bài Nhập môn')`.

- [ ] 7.1 (test-writer) Cập nhật e2e cũ tìm "Bốn thanh điệu": `e2e/E1/s1.2-offline.spec.ts`, `e2e/E3/s3.1-learning-path.spec.ts` → "Thanh 1–4". Đổi unit sang `intro-basics` không cần sửa test nào: không test/e2e nào tham chiếu `intro-pronunciation`; chuỗi "Phát âm" trong `content-source.service.test.ts`, `content.service.test.ts`, `LearningPathContainer.test.tsx` là fixture riêng (`intro-a`), giữ nguyên; kiểm: `grep -rn "intro-pronunciation" apps content/scripts` rỗng, hai file e2e pass
- [ ] 7.2 RED: `apps/web/e2e/E7/s7.1-intro-lessons.spec.ts` — S7.1-AC2 "Lộ trình có đủ 12 bài Nhập môn đúng thứ tự" (một heading nhóm "Pinyin và chữ Hán cơ bản", 12 link đúng thứ tự), "Không còn bài mẫu cũ", "Tiêu đề trên màn bài khớp lộ trình" (tiến độ nạp sẵn mở hết, mở từng bài, `h1` = tiêu đề lộ trình); S7.1-AC4 "Xong onboarding vào thẳng bài "Thanh 1–4"" (`h1` "Thanh 1–4", "Câu 1 / n"), "Bài 1 đang mở trên lộ trình" (1 "Đang mở", 11 "Đã khóa"); S7.1-AC1 "Mỗi bài có câu nghe" (mỗi bài gặp ≥ 1 nút "Nghe"); kiểm: `pnpm e2e` fail đúng lý do nếu chạy trên nội dung cũ (tạm checkout `path.yaml` cũ nếu pass ngay)
- [ ] 7.3 GREEN: sửa code/nội dung (không sửa kỳ vọng) đến khi pass; kiểm: test 7.2 pass
- [ ] 7.4 RED: trong `s7.1-intro-lessons.spec.ts` — S7.1-AC1 "Không bài nào có câu phải bỏ qua" (TC-S7.1-AC1-2): mỗi bài một test, tiến độ nạp sẵn tới bài đó, `answerCurrentQuestion` tới hết bài: không lúc nào có "Dạng bài này chưa có." hay "Bỏ qua câu này", cuối bài "Bạn đã làm xong các câu của bài này."; sau đó bấm "Tiếp tục", mở Lộ trình và kiểm bài N "Đã xong", bài N+1 "Đang mở" (bài 12: kiểm đủ 12 bài đều "Đã xong", TC-S7.1-AC1-2); bài 10 đồng thời phủ S7.1-AC1 "Làm hết bài có câu viết thì bài Đã xong" và assertion chữ: khi đi qua bài 10 ghi `aria-label` mọi figure "Khung viết chữ …" → có "人" và "十"; bài 11 → danh sách chữ khung viết khớp từng câu `stroke-write` của `readBuiltLesson('intro-11')` (theo `word.hanzi`), ≥ 1 chữ; kiểm: fail đúng lý do (tạm bỏ nhánh `stroke-write` nếu pass ngay)
- [ ] 7.5 GREEN: sửa đến khi pass; kiểm: test 7.4 pass
- [ ] 7.6 RED: `apps/web/e2e/E7/s7.1-intro-writing.spec.ts` (tiến độ nạp tới bài 10) — S7.1-AC1 "Câu viết hiện khung viết của đúng chữ", "Khung viết trong bài nhận focus bàn phím" (`outline-style` khác `none`), "Viết sai nét trong câu viết chưa kết thúc câu" (vẽ sổ khi chờ ngang ở 十), "Viết xong chữ thì câu được tính đúng", "Câu viết đã Đúng thì khung bị khóa" (vẽ thêm: không alert, vẫn 2 nét), lesson-runner "Câu viết chỉ có kết quả Đúng"; S7.1-AC2 "Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét", "Từ câu viết mở màn xem thứ tự nét", "Từ bài vào luyện viết qua màn thứ tự nét" (bấm "Tập viết" → "Khung viết chữ 人" ở màn luyện viết), "Quay lại bài từ màn thứ tự nét" (`page.goBack()`: "Câu k / n", 0 nét), "Liên kết Xem thứ tự nét dùng được bằng bàn phím", "Quay lại bài thì tổng kết chỉ tính từ câu viết đó" (`page.clock`, TC-S7.1-AC2-10); kiểm: fail đúng lý do
- [ ] 7.7 GREEN: sửa đến khi pass; kiểm: test 7.6 pass
- [ ] 7.8 RED: trong `s7.1-intro-writing.spec.ts`, `test.use({ serviceWorkers: 'block' })` + `page.route` — S7.1-AC1 "Câu viết đang tải dữ liệu nét" (TC-S7.1-AC1-24: `page.route` giữ request `人.json` chưa trả, kiểm "Đang tải…", không figure/link/"Tiếp tục"; rồi `route.continue()` → figure "Khung viết chữ 人" hiện, "Đang tải…" mất), "Câu viết tải dữ liệu nét lỗi", "Câu viết thử lại sau khi tải lỗi" (`unroute` rồi "Thử lại"), "Câu viết tải lỗi rồi bỏ qua" (TC-S7.1-AC1-28: cuối bài báo bỏ qua đúng số câu đã bỏ, chưa hoàn thành, không báo đã làm xong; rồi mở Lộ trình, kiểm bài 10 không có nhãn "Đã xong"); kiểm: fail đúng lý do
- [ ] 7.9 GREEN: sửa đến khi pass; kiểm: test 7.8 pass
- [ ] 7.10 RED: `apps/web/e2e/E7/s7.1-intro-offline.spec.ts` (mẫu `openOnceWithServiceWorker`) — S7.1-AC5 "Offline mở được cả 12 bài" (tiến độ nạp sẵn, offline, mỗi bài đúng `h1` + "Câu 1 / n", không "Không mở được bài học."), "Offline phát được mọi audio của 12 bài" (offline `fetch` + `decodeAudioData` mọi mp3 mà câu có "Nghe"/"Nghe mẫu" của 12 bài dùng, độ dài > 0; và bấm "Nghe" ở câu đầu mỗi bài không hiện "Không phát được audio."), "Offline làm hết bài thì bài xong và bài kế mở" (bài 1), "Offline làm được câu viết" (TC-S7.1-AC5-6: không mở bài 10, 11 khi có mạng; offline mọi câu viết có khung đúng chữ, không "Có lỗi xảy ra"/"Chưa có dữ liệu nét cho chữ này."); kiểm: fail đúng lý do (tạm loại `json`/`mp3` khỏi `globPatterns` nếu pass ngay) rồi trả lại
- [ ] 7.11 GREEN: sửa đến khi pass; kiểm: test 7.10 pass

Các task dưới đây phủ case có cột Tự động `e2e` trong `test-cases.md` còn thiếu. Mỗi test tên mang ID Scenario + ID TC. Helper
đọc nội dung đã build: `readBuiltLesson`, `readBuiltWords`, `readBuiltSentences`, bộ ghi audio `installAudioRecorder(page)` trong
`intro-lessons.helpers.ts` (design mục Test).

- [ ] 7.12 RED (test-writer): `apps/web/e2e/E7/s7.1-lesson-runner.spec.ts` — S3.2-AC2 "Trả lời đúng được báo ngay" (TC-S3.2-AC2-1: bài "Thanh 1–4", câu `tone-choice` đầu tiên, chọn đáp án đúng tính từ `readBuiltLesson('intro-01')` + `parsePinyin` → "Đúng" + "Tiếp tục", "Câu k / n" không đổi), "Trả lời sai được báo ngay" (TC-S3.2-AC2-2: chọn thanh khác → "Sai" + "Tiếp tục", tiến độ không đổi), "Trả lời xong thì không trả lời lại được" (TC-S3.2-AC2-3: sau "Đúng" bấm đáp án khác → vẫn "Đúng"; "Tiếp tục" rồi câu kế các đáp án bấm được), "Chưa trả lời thì chưa có kết quả" (TC-S3.2-AC2-4: câu đầu bài 1 và câu viết 人 của bài 10 (tiến độ nạp sẵn) chưa thao tác → không "Đúng", "Sai", "Tiếp tục"); kiểm: chạy, nếu pass ngay (hành vi S3.2) thì tạm bỏ khóa đáp án/hiện kết quả sớm để thấy fail rồi trả lại
- [ ] 7.13 GREEN: sửa đến khi pass (không sửa kỳ vọng); kiểm: test 7.12 pass
- [ ] 7.14 RED (test-writer): `apps/web/e2e/E7/s7.1-intro-audio.spec.ts` — S7.1-AC1 "Mọi từ và câu của bài đều có audio" (TC-S7.1-AC1-5: có mạng, tiến độ nạp sẵn mở hết 12 bài, `installAudioRecorder`; mỗi bài đi hết các câu bằng `answerCurrentQuestion`, ở mọi câu có "Nghe"/"Nghe mẫu" bấm nút đó → có bản ghi mới với `duration > 0`, không hiện "Không phát được audio."; mỗi bài một test); kiểm: fail đúng lý do (tạm đổi `audio` một từ trong output thành file không có nếu pass ngay) rồi trả lại
- [ ] 7.15 GREEN: sửa đến khi pass; kiểm: test 7.14 pass
- [ ] 7.16 RED (test-writer): trong `s7.1-intro-audio.spec.ts` — S7.1-AC1 "Nút Nghe phát đúng từ hoặc câu đang hiện" (TC-S7.1-AC1-8): trong TC-S7.1-AC1-5 thêm assertion `src` mỗi lần phát kết thúc bằng `audio` của từ/câu mà câu đó hỏi (theo thứ tự câu của `readBuiltLesson`); thêm test bài 1: bấm "Nghe", trả lời, bấm "Tiếp tục" ngay khi audio còn phát, bấm "Nghe" ở câu kế → bản ghi cuối là audio của từ câu kế, không phải câu trước; kiểm: chạy, nếu pass ngay (S4.4) thì tạm bỏ `key={exercise.id}` ở `LessonRunner` để thấy fail rồi trả lại
- [ ] 7.17 GREEN: sửa đến khi pass; kiểm: test 7.16 pass
- [ ] 7.18 RED (test-writer): `apps/web/e2e/E7/s7.1-intro-writing-content.spec.ts` (tiến độ nạp sẵn mở hết 12 bài, đi bằng `answerCurrentQuestion`) — S7.1-AC2 "Bài "Nét cơ bản và thứ tự nét" có câu viết" (TC-S7.1-AC2-1: đi qua bài 10, tập `aria-label` figure khung viết chứa "Khung viết chữ 人" và "Khung viết chữ 十"), "Bài "30 bộ thủ phổ biến" có câu viết" (TC-S7.1-AC2-2: bài 11 gặp ≥ 1 khung viết, ghi chữ từng câu, khớp `readBuiltLesson('intro-11')`); S7.1-AC3 "Mọi câu viết của 12 bài có dữ liệu nét" (TC-S7.1-AC3-5: đi qua mọi câu viết của 12 bài, mỗi câu có figure "Khung viết chữ X" với X đúng một chữ Hán (`hanCharacterSchema`), không lúc nào có "Chưa có dữ liệu nét cho chữ này."); kiểm: fail đúng lý do (tạm bỏ nhánh `stroke-write` nếu pass ngay) rồi trả lại
- [ ] 7.19 GREEN: sửa đến khi pass; kiểm: test 7.18 pass

## 8. Giao diện, tài liệu và kiểm tra

- [ ] 8.1 `apps/web/src/styles/tailwind/components/_lesson.css`: `.lesson-stroke-write-link`, `.lesson-stroke-write-message` (design D8), JSX chỉ layout/spacing (§6) — ngoại lệ test-first: CSS thuần; kiểm: preview `web-dev` 375×812 và 1280×800, sáng và tối: câu viết (mới, sai nét, Đúng), đang tải, lỗi, không có dữ liệu nét; vùng chạm link ≥ 44×44 px
- [ ] 8.2 Cập nhật `docs/03-architecture.md`: §6.3 sửa câu "Lesson runner … chỉ làm việc qua `exercise.registry.ts`" thành có ngoại lệ `stroke-write` (nhánh riêng trong `LessonRunner`, dữ liệu nét/lượt viết từ `useLessonStrokeWrite`, lý do: hợp đồng `ExerciseProps` không mang được trạng thái tải, design D4); `useLessonStrokeWrite`, `LessonStrokeWrite`, luật `lessonStrokeWriteIssues`, giai đoạn Nhập môn 12 bài — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 8.3 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, dependency một chiều, file < 300 dòng, component < 5 props, effect có cleanup, không mutate); kiểm: `pnpm lint` sạch
- [ ] 8.4 Chạy `pnpm typecheck && pnpm lint && pnpm test:run`; kiểm: pass, ghi output thật
- [ ] 8.5 Chạy `pnpm content:check`; kiểm: 0 lỗi
- [ ] 8.6 Chạy `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`; kiểm: pass
- [ ] 8.7 Chạy `pnpm e2e`; kiểm: toàn bộ pass (gồm E1, E3, E6, E7: `s7.1-intro-lessons`, `-writing`, `-offline`, `-audio`, `-writing-content`, `s7.1-lesson-runner`)
- [ ] 8.8 Screenshot cho PR: màn Lộ trình 12 bài, màn bài câu viết 人 (mới, sai nét, Đúng), đang tải, lỗi tải — mobile 375×812 và desktop 1280×800, sáng và tối; commit vào `pr-assets/pr-<n>/`; kiểm: ảnh nhúng trong bảng mục Screenshots
- [ ] 8.9 Ghi vào mô tả PR code cho QA: cách nạp tiến độ e2e (`seedCompletedLessons`), cách chặn file nét khi chạy tay (DevTools block `/content/strokes/人.json` + Bypass for network), danh sách câu viết của bài 10–11, nhóm Nhập môn mới `intro-basics` "Pinyin và chữ Hán cơ bản"; TC-S7.1-AC1-29/-30, TC-S3.2-X1 phủ ở Vitest (`LessonRunnerContainer.strokeWriteLoad.test.tsx`); TC-S7.1-AC1-8 phủ ở component (`LessonRunnerContainer.audio.test.tsx`, task 5.9) và e2e (`s7.1-intro-audio.spec.ts`, task 7.16), TC-S7.1-AC1-7 vẫn chạy tay; chỗ lệch tài liệu: câu viết đi nhánh riêng trong `LessonRunner` thay vì đăng ký registry (proposal bảng Layer đích, `docs/03-architecture.md` §6.3 đã sửa ở 8.2); kiểm: mô tả PR có đủ mục

## Workflow follow-up

- PR code ghi `Spec PR: #123`, References `Closes #36` khi đủ AC1–AC5, dòng `OpenSpec change: s7-1-intro-lessons`.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
