# Tasks: S4.3 Nghe rồi gõ pinyin

TDD bắt buộc ([spec-driven.md](../../../docs/05-standards/spec-driven.md) §5): mỗi RED chạy test và thấy fail đúng lý do (thiếu hành vi,
không phải lỗi import), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer, commit `feat(...)`. Tên test chứa Scenario ID
(`S4.3-AC<k>`). Chỉ viết code sau khi PR spec đã merge. Mock chỉ ở ranh giới (`Audio` giả); không mock hàm pinyin của ta.
Tầng test theo spec-driven §4. Đường dẫn component tính từ `apps/web/src/app/`; util từ `packages/shared/src/`.

## 1. Tách âm tiết — `packages/shared` (kỹ thuật, nền cho AC1–AC3)

- [x] 1.1 RED: test `splitPinyinSyllables` — Vitest thuần, `pinyin.syllables.test.ts`: `nihao` → `ni`,`hao`; `baba` → `ba`,`ba`;
  `duibuqi` → `dui`,`bu`,`qi`; `huar` → một âm tiết; `lüe`/`nü`/`ju` hợp lệ; `fangan` → `fang`,`an`; chuỗi không tách được trả một mảnh
  và không throw; mọi pinyin trong `apps/web/src/assets/content/words.json` (đọc bằng `node:fs`, parse bằng `wordSchema`) tách ra
  đúng `countPinyinSyllables` âm tiết; kiểm: fail vì chưa có tệp
- [x] 1.2 GREEN: tạo `pinyin.syllables.ts` (`PINYIN_INITIALS`, `PINYIN_SYLLABLES`, `splitPinyinSyllables`); kiểm: test 1.1 pass

## 2. AC1: Gõ kiểu số thì tự đổi thành dấu — `packages/shared`

- [x] 2.1 RED: test cho `convertTypedPinyin` — Vitest thuần, `pinyin.utils.test.ts`: S4.3-AC1 "Gõ ni3 thì hiện nǐ",
  S4.3-AC1 "Gõ liền nhiều âm tiết thì đổi từng âm tiết" (`ni3hao3` → `nǐhǎo`, `ni3 hao3` → `nǐ hǎo`), S4.3-AC1 "Gõ v thay cho ü"
  (`lv4`, `lu:4` → `lǜ`; `jv4` → `jù`), S4.3-AC1 "Số 5 là thanh nhẹ" (`ma5` → `ma`), S4.3-AC1 "Số đứng sai chỗ thì giữ nguyên"
  (`3`, `3ni`, `ni 3`, `xyz3` giữ nguyên); thêm: chạy lại trên kết quả không đổi gì thêm; kiểm: fail vì chưa có hàm
- [x] 2.2 GREEN: thêm `convertTypedPinyin` vào `pinyin.utils.ts` (dùng `splitPinyinSyllables`, `applyTone`) và export ở `index.ts`;
  kiểm: test 2.1 pass

## 3. AC2: Chấm đúng cả kiểu số và kiểu dấu — `packages/shared`

- [x] 3.1 RED: test cho `comparePinyin(...).isCorrect` — Vitest thuần, `pinyin.compare.test.ts`: S4.3-AC2 "Gõ kiểu số đúng thì được
  chấm đúng" (`nǐ` ← `ni3`, `Ni3`), S4.3-AC2 "Gõ kiểu dấu đúng thì được chấm đúng" (`nǐ` ← `nǐ`), S4.3-AC2 "Gõ liền hay cách âm tiết
  đều đúng" (`bàba` ← `ba4ba`, `ba4ba5`, `ba4 ba`, `bàba`), S4.3-AC2 "Hoa thường và khoảng trắng thừa không ảnh hưởng"
  (`nǐ hǎo` ← `  Ni3  Hao3 `, `ni3hao3`, `nǐhǎo`); thêm: `ni3` với đáp án `nǐ hǎo` là sai, chuỗi trống là sai, cách tách khác
  (`fan1gan1` ← `fāngān`) vẫn đúng; kiểm: fail vì chưa có tệp
- [x] 3.2 GREEN: tạo `pinyin.compare.ts` với `comparePinyin` (so `pinyinKey` sau `convertTypedPinyin`, `v`/`u:` → `ü`), export ở
  `index.ts`; kiểm: test 3.1 pass

## 4. AC3: Gõ sai thì chỉ ra phần sai — `packages/shared`

- [x] 4.1 RED: test cho `parsePinyin` và `comparePinyin(...).syllables` — Vitest thuần, `pinyin.compare.test.ts`: S4.3-AC3 "Sai thanh mẫu"
  (`shì` ← `si4`: chỉ `isInitialWrong`), S4.3-AC3 "Sai vận mẫu" (`nǐ` ← `na3`: chỉ `isFinalWrong`), S4.3-AC3 "Sai thanh điệu"
  (`mā` ← `ma2`: chỉ `isToneWrong`), S4.3-AC3 "Sai nhiều phần thì tô hết các phần sai" (`mā` ← `na2`: initial và tone sai, final không),
  S4.3-AC3 "Từ nhiều âm tiết thì tô theo từng âm tiết" (`nǐ hǎo` ← `ni3hao2`: chỉ âm tiết 2 có `isToneWrong`), S4.3-AC3 "Thiếu âm tiết
  thì âm tiết thiếu bị tô sai" (`nǐ hǎo` ← `ni3`: âm tiết 2 `typed: null`, cả ba cờ `true`); thêm: gõ thừa âm tiết cả ba cờ `true`,
  `parsePinyin('shì')` → `{ initial: 'sh', final: 'i', tone: 4 }`; kiểm: fail
- [x] 4.2 GREEN: thêm `parsePinyin` và nhánh sai của `comparePinyin` vào `pinyin.compare.ts`, export ở `index.ts`; kiểm: test 4.1 pass

## 5. Dạng bài trong component — `shared/components/exercises`, i18n

Test: `shared/components/exercises/PinyinTypeExercise.test.tsx` (Vitest + Testing Library, `renderWithProviders`, bọc `AudioSpeedProvider`,
`Audio` giả, `userEvent`).

- [x] 5.1 RED: S4.3-AC1 ở tầng component: gõ `ni3` → ô hiện `nǐ` ("Gõ ni3 thì hiện nǐ"); gõ `ni3hao3` → `nǐhǎo` ("Gõ liền nhiều âm
  tiết thì đổi từng âm tiết"); gõ `lv4` → `lǜ` ("Gõ v thay cho ü"); gõ `ma5` → `ma` ("Số 5 là thanh nhẹ"); gõ `3` → ô giữ `3`
  ("Số đứng sai chỗ thì giữ nguyên"); kiểm: fail vì chưa có component
- [x] 5.2 GREEN: tạo `PinyinTypeExercise.tsx` (ListenButton, SlowToggle, form + input có label, `handleChange` dùng `convertTypedPinyin`,
  nút "Kiểm tra"), thêm `pinyinType.*` vào `assets/i18n/vi/lesson.json`; kiểm: test 5.1 pass
- [x] 5.3 RED: S4.3-AC2 ở tầng component: từ `nǐ` gõ `ni3` rồi bấm "Kiểm tra" → `onResult({ isCorrect: true })` ("Gõ kiểu số đúng thì
  được chấm đúng"); gõ `nǐ` ("Gõ kiểu dấu đúng thì được chấm đúng"); từ `bàba` gõ `ba4ba`, `ba4ba5`, `ba4 ba`, mỗi lần một câu
  ("Gõ liền hay cách âm tiết đều đúng"); từ `nǐ hǎo` gõ `  Ni3  Hao3 ` rồi Enter ("Hoa thường và khoảng trắng thừa không ảnh hưởng");
  bấm "Kiểm tra" khi ô trống → `onResult` không được gọi và ô còn nhập được ("Ô trống thì chưa chấm"); sau khi chấm ô `disabled`,
  nút "Kiểm tra" `disabled`, `onResult` chỉ gọi một lần, render với `isLocked` thì bấm không gọi `onResult` ("Chấm xong thì khóa ô nhập");
  trước khi chấm không có pinyin đúng trong DOM; kiểm: fail
- [x] 5.4 GREEN: `handleSubmit` (Enter + nút), chấm bằng `comparePinyin`, khóa sau khi chấm, bỏ qua khi trống/khóa, khối "Pinyin đúng";
  kiểm: test 5.3 pass
- [x] 5.5 RED: S4.3-AC3 ở tầng component: từ `shì` gõ `si4` → `onResult` nhận `isCorrect: false` và chỉ nhãn "Thanh mẫu" xuất hiện
  ("Sai thanh mẫu"); `nǐ` + `na3` → chỉ "Vận mẫu"; `mā` + `ma2` → chỉ "Thanh điệu"; `mā` + `na2` → "Thanh mẫu" và "Thanh điệu", không có
  "Vận mẫu" ("Sai nhiều phần thì tô hết các phần sai"); `nǐ hǎo` + `ni3hao2` → chỉ nhãn "Thanh điệu" trong mục âm tiết thứ hai
  ("Từ nhiều âm tiết thì tô theo từng âm tiết"); `nǐ hǎo` + `ni3` → mục âm tiết thứ hai có đủ ba nhãn ("Thiếu âm tiết thì âm tiết
  thiếu bị tô sai"); mọi trường hợp sai: mỗi phần sai có nhãn chữ, `explanation: 'Đáp án đúng: <pinyin>'` và màn hiện pinyin đúng
  ("Phần sai có nhãn chữ và có đáp án đúng"); kiểm: fail
- [x] 5.6 GREEN: render danh sách phần sai theo `result.syllables` (`.pinyin-type-part.is-wrong` + nhãn `pinyinType.parts.*`), soạn
  `explanation` khi sai; kiểm: test 5.5 pass

## 6. Đăng ký vào khung chạy bài — `shared/components/exercises`

- [x] 6.1 RED: S4.3-AC2 "Câu gõ pinyin không còn bị bỏ qua" — Vitest + Testing Library, thêm vào
  `pages/lesson/components/LessonRunner.test.tsx`: render `LessonRunner` với `exerciseRegistry` thật và một câu `pinyin-type` → có ô nhập
  và nút "Kiểm tra", không có "Dạng bài này chưa có" và nút "Bỏ qua câu này"; kiểm: fail
- [x] 6.2 GREEN: đăng ký `'pinyin-type': PinyinTypeExercise` trong `shared/components/exercises/exercise.registry.ts`; kiểm: test 6.1 pass

## 7. Style (ngoại lệ test-first: CSS thuần theo CLAUDE.md §0.7)

- [x] 7.1 Tạo `apps/web/src/styles/tailwind/components/_pinyin-type.css` + `@import` trong `main.css`: `.pinyin-type-input`, `-submit`,
  `-answer`, `-part` (+ `.is-wrong`), cao tối thiểu 44px, focus nhìn thấy, `prefers-reduced-motion`; chỉ dùng token có sẵn. Không đổi hành vi;
  kiểm bằng `pnpm test:run` (`tokens.test.ts`) và mắt trên preview `web-dev`

## 8. Kiểm tra và hoàn tất

- [x] 8.1 REFACTOR khi đã xanh: file < 300 dòng (nhất là `pinyin.utils.ts`), không lặp, self-review theo CLAUDE.md §0, §2 (exercises
  không import service), §6 (không utility visual trong `className`), §7 (label gắn input, nhãn chữ cho phần sai, focus, 44px,
  `prefers-reduced-motion`)
- [x] 8.2 Verify: `pnpm typecheck && pnpm lint && pnpm test:run`
- [x] 8.3 Verify: `pnpm content:check` (không đổi nội dung, chạy để chắc không vỡ) và `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts`
  (có CSS mới), `pnpm e2e` (bài mẫu `intro-01` vẫn chạy được)
- [x] 8.4 Xem UI ở preview `web-dev` cả sáng/tối, mobile (375×812)/desktop (1280×800) để chụp screenshot cho PR; tick hết task; PR ghi
  `Spec PR: #<số>` và `Refs #28` hoặc `Closes #28` khi đủ AC. Không archive trong PR này
