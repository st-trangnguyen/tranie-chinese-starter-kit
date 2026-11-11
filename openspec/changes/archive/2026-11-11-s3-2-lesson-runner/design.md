# Design: S3.2 Chạy bài

## Context

- Nội dung bài (`lessons/<id>.json`) đã có schema `lessonSchema` (`exercises[]`, mỗi câu có `id` duy nhất
  trong bài, `kind` phân biệt). `ContentSource.getLesson(id)` đã có từ S3.1 (validate bằng Zod); chưa
  có use case nào ở `shared/services` gọi nó.
- `shared/components/exercises/` đang **rỗng**: chưa có dạng bài tập nào, chưa có registry.
- `docs/03-architecture.md` §6.3 đã chốt hợp đồng: component nhận `{ exercise, onResult }`; runner chỉ
  làm việc qua `exercise.registry.ts`. Chưa chốt hình dạng `ExerciseResult`.
- "Câu" trong story = một `Exercise` của bài.
- Layer đích: xem `proposal.md`. Dependency Rule: CLAUDE.md §2.

## Goals / Non-Goals

**Goals:**
- Một nguồn duy nhất cho quy tắc phiên làm bài (Phần 2 `LessonService`), thuần, test không cần React.
- Hợp đồng `ExerciseResult` đủ để S3.4 (điểm, câu sai) và E9 (SRS) mở rộng mà không đổi chữ ký.
- Runner không biết bên trong từng dạng bài; thêm dạng mới chỉ cần đăng ký.

**Non-Goals:**
- Không lưu gì xuống IndexedDB (S3.3, S3.4). Không viết dạng bài nào. Không chấm điểm tổng.

## Decisions

### D1. Phiên làm bài là state thuần, quy tắc ở `LessonService` Phần 2
```ts
type LessonSession = {
  exerciseIds: string[];                       // thứ tự câu
  currentIndex: number;
  phase: 'answering' | 'feedback' | 'finished';
  lastResult: ExerciseResult | null;           // có khi phase = 'feedback'
};
```
Rule thuần (mỗi cái kèm comment "Rule: …"):
- `startSession(exercises)` → `currentIndex = 0`, `phase = 'answering'`.
- `submitResult(session, result)` chỉ hợp lệ khi `phase = 'answering'` → `phase = 'feedback'`, lưu `lastResult`.
  Gọi sai pha thì trả nguyên session (bỏ qua, không throw) vì chấm hai lần do bấm đúp là chuyện thường.
- `advance(session)` chỉ hợp lệ khi `phase = 'feedback'` → câu kế, hoặc `'finished'` nếu đã là câu cuối.
- `shouldShowExplanation(result)` = `!result.isCorrect && result.explanation !== undefined`.
- Tên `phase` là union, không `enum` (CLAUDE.md §7).
- *Vì sao:* "chấm xong mới được sang câu" và "sai thì phải xem giải thích" là quy tắc nghiệp vụ → không nằm
  trong component/hook (CLAUDE.md §0.2). Hook chỉ giữ `LessonSession` trong `useState` và gọi rule.
- S3.3 sẽ thêm tham số `startIndex` cho `startSession`; S3.4 thêm bộ đếm điểm/thời gian vào session.

### D2. `LessonService` 3 phần, nạp bài qua `ContentService`
- Phần 1: nhận `ContentService` qua constructor, `private readLesson(id)`.
- Phần 3: `openLesson(lessonId): Promise<{ lesson: Lesson; session: LessonSession }>`; bài không có hoặc sai
  schema thì throw `Error` rõ nghĩa (lấy từ `ContentSource`) → hook hiện thông báo lỗi (Scenario "Không mở được bài").
- `ContentService.getLesson(id)` thêm vào Phần 3 của `ContentService`, chỉ ủy quyền `ContentSource.getLesson`.
- *Đã cân nhắc:* hook gọi thẳng `ContentService` rồi tự dựng session — bỏ vì để lộ quy tắc "bắt đầu từ câu 1" ra hook.

### D3. `ExerciseResult { isCorrect: boolean; explanation?: string }`; giải thích do component dạng bài sinh ra
- Component dạng bài biết đáp án đúng nên tự soạn giải thích (vd tone-choice: "八 đọc bā, thanh 1")
  từ `Word`/`Sentence` mà nó đã có. Runner chỉ hiện `explanation` khi sai (rule ở D1).
- Không đổi `exerciseSchema` ở S3.2.
- *Đã cân nhắc:* thêm `explanation` vào schema nội dung của từng `kind` — bỏ vì giải thích phần lớn suy ra
  được từ từ/câu (pinyin, nghĩa), nhập tay cho từng câu là thừa và phải sửa pipeline E2. Hỏi lại ở Câu hỏi mở 2.

### D4. Registry theo `kind`, runner nhận registry qua props
- `exercise.types.ts`: `ExerciseResult`, `ExerciseProps<K extends ExerciseKind>` đúng như architecture §6.3.
- `exercise.registry.ts`: `ExerciseRegistry = Partial<{ [K in ExerciseKind]: ComponentType<ExerciseProps<K>> }>`;
  export `exerciseRegistry` thật (rỗng lúc này).
- `LessonRunner` (component trình bày) nhận `registry` qua props; `LessonRunnerContainer` truyền `exerciseRegistry` thật.
  Test truyền registry giả (dạng bài giả bấm "đúng"/"sai") → không phải mock module, không phụ thuộc E4–E6.
- `kind` chưa đăng ký: runner hiện thông báo "Dạng bài này chưa có" kèm nút "Bỏ qua câu này" để không kẹt
  (biện pháp tạm cho tới khi E4–E6 xong; đã đưa vào spec thành Requirement riêng với ID `S3.2-X1`, ngoài AC của story).
- `ExerciseProps` có thêm `isLocked` (true sau khi chấm) để dạng bài khóa đáp án; runner truyền theo `feedback !== null`.
- `LessonRunner` nhận `view` (exercise, current, total, feedback) + `registry` + `handlers`; `LessonFeedbackView`/`LessonRunnerView` nằm ở `shared/models/lesson-session.model.ts`.
- Component dạng bài **chỉ nhận props**; audio/ghi âm lấy qua `core/hooks` (architecture §3, CLAUDE.md §2).
- Component dạng bài gắn `key={exercise.id}` để chuyển câu thì state nội bộ reset.

### D5. Màn `pages/lesson`
- `LessonRunnerContainer` lấy `lessonId` từ URL, gọi `useLessonRunner(lessonId)` → `{ lesson, session, isLoading, error, submit, next }`.
- Component: `LessonProgressBar` (`role="progressbar"`, `aria-valuenow/max`, kèm chữ "Câu k / n"),
  `LessonFeedback` (vùng `role="status"` hiện Đúng/Sai + giải thích + nút "Tiếp tục"), `LessonFinished` (tạm).
- Khi chuyển sang pha `feedback`, chuyển focus tới nút "Tiếp tục"; `role="status"` để trình đọc màn hình đọc kết quả.
- Kết quả đúng/sai báo bằng **chữ + biểu tượng**, không chỉ bằng màu (WCAG 2.1 AA).
- Style: BEM trong `apps/web/src/styles/tailwind/` (`.lesson-feedback`, `.lesson-feedback.is-incorrect`,
  `.lesson-progress`…), JSX chỉ layout/spacing (CLAUDE.md §6); tôn trọng `prefers-reduced-motion`.
- Xoá `LessonPlaceholder` + i18n `placeholder.*`.

### D6. Scenario → tầng test (docs/05-standards/spec-driven.md §4)

| Scenario | Tầng | File test |
|---|---|---|
| S3.2-AC1 mở ở câu 1 / sang câu kế / hết câu | `shared/services` Phần 2 (thuần) | `lesson.service.test.ts` |
| S3.2-AC1 thanh tiến độ "Câu k / n" | component | `LessonRunnerContainer.test.tsx` (registry giả) |
| S3.2-AC1 không mở được bài | `shared/services` Phần 3 (nguồn giả) + component | `lesson.service.test.ts`, `LessonRunnerContainer.test.tsx` |
| S3.2-AC2 đúng/sai báo ngay, chưa trả lời thì chưa có kết quả | Phần 2 + component | `lesson.service.test.ts`, `LessonRunnerContainer.test.tsx` |
| S3.2-AC3 giải thích khi sai, chưa sang câu sau, đúng thì không có | Phần 2 + component | `lesson.service.test.ts`, `LessonRunnerContainer.test.tsx` |
| Hợp đồng registry (kind đã đăng ký → component đó) | component | `LessonRunner.test.tsx` |

Chưa có e2e cho S3.2: bài thật `intro-01` cần dạng bài từ E4–E6 mới chạy trọn. E2E của chạy bài thuộc story
đầu tiên đăng ký dạng bài (S4.1) hoặc làm ở S3.4 khi cả luồng có điểm cuối.

## Risks / Trade-offs

- [Giải thích sinh ở component làm mỗi dạng bài phải tự soạn] → chấp nhận; nhất quán với "component biết đáp án".
  Nếu muốn lời giải tay thì thêm field schema ở story sau (Câu hỏi mở 2).
- [Bấm đúp / trả lời lặp] → rule `submitResult` bỏ qua khi không ở pha `answering`; có test.
- [Bài `intro-01` trong app thật chưa chạy trọn trước E4–E6] → hiển thị tạm theo Câu hỏi mở 1.

## Migration Plan

Không có dữ liệu cần migrate. Đổi route container trong cùng route cũ `/lessons/:lessonId`, không đổi URL.

## Open Questions

1. **`kind` chưa có component** (toàn bộ 5 `kind` của `intro-01` ở thời điểm S3.2): hiện "Dạng bài này
   chưa có" + nút "Bỏ qua câu này" (đề xuất, để người học/QA đi hết bài), hay chỉ báo lỗi và dừng? Có
   đưa hành vi này vào spec (thêm Scenario) hay coi là tạm thời?
2. **Giải thích khi sai** lấy từ đâu: component tự sinh từ từ/câu (đề xuất, D3) hay người soạn viết tay
   `explanation` trong YAML/JSON cho từng câu (đổi schema + pipeline E2)?
3. **Trả lời đúng có cần bấm "Tiếp tục"** không? F3 vẽ "đúng → thẳng câu kế"; AC2 chỉ yêu cầu "chấm ngay".
   Đề xuất: đúng cũng hiện "Đúng" + "Tiếp tục" để cùng một luồng (đang viết trong spec); phương án khác là
   tự chuyển sau ~1 giây (cần thêm quy tắc thời gian, khó cho người dùng bàn phím/trình đọc màn hình).
4. **Màn khi hết câu cuối** trước S3.4: thông báo tạm "Bạn đã làm xong các câu" + nút về Lộ trình. Có
   chấp nhận tạm thời không? Và có cần nút thoát/quay về Lộ trình giữa bài (AC chưa nói; liên quan S3.3)?
5. **Gõ thẳng URL `/lessons/<id bài khóa>`** (câu hỏi mở 1 của S3.1): có chặn không? Đề xuất: không chặn
   ở S3.2; làm cùng S3.4 khi mở khóa có người ghi, vì cần đọc tiến độ.
