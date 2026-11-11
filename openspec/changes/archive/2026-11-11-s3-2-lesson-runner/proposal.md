# Proposal: S3.2 Chạy bài

Story **S3.2 Chạy bài · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s32-chạy-bài--f3)) ·
GitHub issue [#23](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/23).

Refs #23

## Why

Là người học, tôi muốn làm lần lượt từng câu trong bài và biết ngay mình đúng hay sai để sửa kịp
thời. Hiện bấm vào một bài trên bản đồ (S3.1) chỉ tới màn giữ chỗ `LessonPlaceholder`. S3.2 thay
nó bằng khung chạy bài: hiện từng câu, chấm ngay, giải thích khi sai. Các dạng bài tập cụ thể
(E4–E6, E10) cắm vào khung này qua registry, nên S3.2 không tự viết dạng bài nào.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Màn chạy bài (lazy-load), thay `LessonPlaceholder`, giữ route `/lessons/:lessonId` | `pages/lesson/containers/`, `pages/lesson/lesson.routes.ts` |
| UI thanh tiến độ, khung kết quả đúng/sai + giải thích, màn "đã hết câu" | `pages/lesson/components/` |
| State + lifecycle của phiên làm bài, gọi service | `pages/lesson/hooks/` (`useLessonRunner`) |
| Quy tắc phiên làm bài (câu hiện tại, chấm xong chưa, sang câu kế, hết bài) | `shared/services/lesson.service.ts` Phần 2 (mới) |
| Nạp một bài từ nội dung (`getLesson`) | `shared/services/content.service.ts` Phần 3, qua `ContentSource` sẵn có |
| Hợp đồng dạng bài tập: `ExerciseProps`, `ExerciseResult`, registry theo `kind` | `shared/components/exercises/` (`exercise.registry.ts`, `exercise.types.ts`) |
| i18n namespace `lesson` (nhãn nút, thông báo) | `assets/i18n/vi/lesson.json` |
| Style BEM của khung chạy bài | `apps/web/src/styles/tailwind/` |

## What Changes

- Màn **chạy bài** thay màn giữ chỗ: nạp bài theo ID, hiện lần lượt từng câu, có thanh tiến độ.
- Mỗi câu chấm ngay sau khi người học trả lời; hiện kết quả đúng/sai.
- Trả lời sai thì hiện giải thích và chỉ sang câu sau khi người học bấm "Tiếp tục".
- Đặt hợp đồng dạng bài tập theo `docs/03-architecture.md` §6.3: component nhận `exercise` và `onResult`,
  báo về `ExerciseResult { isCorrect, explanation? }`. Registry map `kind` → component; ban đầu **rỗng**,
  E4–E6 đăng ký dần.
- Thêm `ContentService.getLesson(id)`; `LessonService` giữ quy tắc phiên làm bài.
- Hết câu cuối thì hiện thông báo "đã làm xong các câu" tạm thời, chờ S3.4 thay bằng màn tổng kết.

## Không làm (out of scope)

- Lưu / học tiếp từ câu đang dở → **S3.3** (S3.2 luôn bắt đầu từ câu 1, không ghi gì xuống IndexedDB).
- Điểm, thời gian, số câu sai, màn tổng kết, ghi "đã xong", mở khóa bài kế → **S3.4**.
- Mọi dạng bài tập cụ thể → **E4, E5, E6, E10**. Khung kiểm bằng dạng bài giả trong test.
- Thêm trường giải thích vào schema nội dung. Giải thích do component dạng bài sinh ra (xem `design.md` D3).
- Chặn vào bài khóa bằng cách gõ URL trực tiếp (câu hỏi mở từ S3.1, xem Câu hỏi mở bên dưới).
- Nút thoát bài, điều hướng quay về bản đồ → chưa có trong AC; hỏi ở Câu hỏi mở.

## Dependencies

- **S3.1** (đã archive): bản đồ dẫn tới `/lessons/:lessonId`; `ContentSource.getLesson` đã có.
- **E4–E6**: cung cấp dạng bài tập thật. Trước đó bài `intro-01` trong app thật chưa chạy trọn được
  (mọi `kind` chưa đăng ký) → e2e cho S3.2 chưa làm được, xem Câu hỏi mở 1.
- **S3.3, S3.4** dùng chung phiên làm bài của S3.2: S3.3 thêm vị trí bắt đầu, S3.4 thêm điểm/thời gian.

## Capabilities

### New Capabilities
- `lesson-runner`: Chạy một bài — hiện lần lượt từng câu với thanh tiến độ, chấm ngay sau khi trả lời,
  giải thích khi sai trước khi sang câu sau.

### Modified Capabilities
- (không có)

## Impact

- Code mới: `shared/services/lesson.service.ts`, `shared/components/exercises/exercise.registry.ts` +
  `exercise.types.ts`, `pages/lesson/{components,hooks}/**`, `LessonRunnerContainer`.
- Code sửa: `content.service.ts` (thêm `getLesson`), `pages/lesson/lesson.routes.ts`, `assets/i18n/vi/lesson.json`.
- Code xoá: `LessonPlaceholder` (và test/i18n `placeholder.*` của nó).
- Test cũ phải sửa: `e2e/E1/s1.2-offline.spec.ts`, `e2e/E1/s1.3-onboarding.spec.ts`,
  `OnboardingContainer.test.tsx` nếu đang chờ chữ của màn giữ chỗ (kiểm trong RED 0.1).
- Docs: `docs/03-architecture.md` (hợp đồng `ExerciseResult`, vai trò registry).
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
