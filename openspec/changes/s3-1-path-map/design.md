# Design: S3.1 Bản đồ lộ trình

## Context

- Nội dung lộ trình đã có ở `apps/web/src/assets/content/content.json` (`contentVersion` + `stages →
  units → lessonIds`, schema `contentRootSchema` trong `@csk/shared`). Tiêu đề bài nằm trong
  `lessons/<id>.json` (`lessonSchema.title`). Web app **chưa** nạp nội dung ở đâu cả.
- `ProgressStore` hiện chỉ có `getSettings` / `saveSettings`; Dexie mới có `version(1)` với bảng `settings`.
- `ProgressService` đã theo cấu trúc 3 phần (CLAUDE.md §3).
- Layer đích: xem bảng trong `proposal.md`. Dependency Rule: CLAUDE.md §2.

## Goals / Non-Goals

**Goals:**
- Một nguồn duy nhất tính trạng thái bài (Phần 2 của `ProgressService`), thuần, test không cần store.
- Dữ liệu nội dung và tiến độ đều validate bằng Zod trước khi gắn type (CLAUDE.md §0.4).
- Thêm bảng `lessonProgress` theo đúng mô hình `docs/03-architecture.md` §6.2 để S3.3/S3.4 chỉ cần thêm cột/ghi.

**Non-Goals:**
- Không ghi tiến độ (S3.3, S3.4). Không quy tắc HSK theo chủ đề (S3.5, S3.6).
- Không thiết kế lại trang chủ hay điều hướng chung.

## Decisions

### D1. Nguồn nội dung là service hạ tầng ở `core/services/content-source.service.ts`
`ContentSource` (interface) có `getContentRoot()` và `getLesson(id)`, bản cài đặt dùng `fetch` tới
`/content/...` (precache bởi service worker, S1.2) và parse bằng schema của `@csk/shared`.
`ContentService` (`shared/services/`) nhận `ContentSource` qua constructor, giống `ProgressService` nhận `ProgressStore`.
- *Vì sao:* giữ `shared/services` không gọi I/O trực tiếp, test service bằng nguồn giả; đúng ghi chú
  CLAUDE.md §2 "cần gọi server thì thêm service hạ tầng trong `core/services/`".
- *Đã cân nhắc:* `import` JSON tĩnh qua Vite — bỏ vì đưa toàn bộ nội dung vào bundle JS, mất lợi ích
  precache riêng và không validate runtime được tự nhiên.

### D2. Tiêu đề bài lấy từ `lessons/<id>.json`, nạp song song
`ContentService.getPathMap()` nạp `content.json` rồi nạp song song các file bài để lấy `title`.
- *Vì sao:* không phải đổi schema `content.json` và pipeline E2. Nhập môn chỉ 12 file nhỏ, đã precache.
- *Đã cân nhắc:* thêm `title` vào `lessonIds` trong `content.json` (đổi pipeline + schema) — để dành
  khi số bài HSK (E11) làm việc nạp từng file chậm đáng kể.

### D3. Quy tắc trạng thái: duỗi lộ trình thành danh sách thẳng
Rule ở `ProgressService` Phần 2:
`deriveLessonStatuses(stages, completedLessonIds) → Record<lessonId, LessonStatus>` với
`type LessonStatus = 'locked' | 'open' | 'completed'` (union, không `enum`).
Duỗi `stages → units → lessonIds` theo thứ tự; bài `i` là `completed` nếu có trong tập đã xong; ngược lại
`open` nếu `i = 0` hoặc bài `i-1` đã xong; còn lại `locked`.
- *Vì sao:* đúng F5 Nhập môn ("xong bài trước thì mở bài sau"), áp qua ranh giới unit/stage để không có
  ngõ cụt. Quy tắc HSK (S3.5) sẽ thay nhánh theo loại giai đoạn trong cùng method.

### D4. `lessonProgress` — Dexie `version(2)`, đọc có validate
- `db.version(2).stores({ settings: 'key', lessonProgress: 'lessonId' })`; không sửa `version(1)`.
- `@csk/shared` thêm `lessonProgressSchema = { lessonId, status: 'in-progress' | 'completed' }` theo
  §6.2 (`bestScore`, `cursor` thêm ở S3.4, S3.3).
- `ProgressStore.getAllLessonProgress(): Promise<LessonProgress[]>` — bỏ qua dòng không parse được
  (Scenario "Tiến độ lưu bị hỏng").
- `ProgressService.getCompletedLessonIds()` (Phần 3) đọc store rồi lọc `status === 'completed'`.

### D4b. Route theo chuẩn RESTful
- URL là danh từ tài nguyên, kebab-case, collection số nhiều: bản đồ lộ trình `/learning-paths`, bài
  học `/lessons/:lessonId`. Tên đủ cụ thể, tránh tên chung như `/path`.
- `ROUTE_PATHS` là nguồn duy nhất của URL: `learningPaths: '/learning-paths'`,
  `lesson: (id) => '/lessons/${id}'`. Code và test unit/component dùng `ROUTE_PATHS`; e2e ghi URL
  dạng chuỗi nên sửa tay.
- *Đã cân nhắc:* phân cấp `/stages/:stageId/lessons/:lessonId` — bỏ vì `lessonId` đã duy nhất toàn cục,
  URL dài hơn mà không thêm thông tin. Giữ `/lesson/:id` — bỏ vì lệch chuẩn với route mới.

### D5. Màn `pages/learning-path`
- `learning-path.routes.ts`: `{ path: 'learning-paths', element: LearningPathContainer }`; `ROUTE_PATHS.learningPaths = '/learning-paths'`.
- `useLearningPath` gọi `ContentService.getPathMap()` và `ProgressService.getCompletedLessonIds()`, rồi
  `ProgressService.deriveLessonStatuses(...)`; trả `{ stages, statuses, isLoading, error }`.
- Component: `LearningPathStage` (giai đoạn + nhóm), `LearningPathLessonItem` (một bài). Bài `open`/`completed` là
  `<Link>` tới `ROUTE_PATHS.lesson(id)`; bài `locked` là phần tử không tương tác với
  `aria-disabled="true"` và nhãn "Đã khóa" — không có handler nên bấm không chuyển màn (AC3).
- Nhãn trạng thái là chữ (i18n namespace `learning-path`), kèm biểu tượng trang trí `aria-hidden` (WCAG: không chỉ dùng màu).
- Style: BEM trong `apps/web/src/styles/tailwind/` (`.learning-path-lesson`, `.learning-path-lesson.is-locked`…), JSX chỉ layout/spacing (CLAUDE.md §6).

### D6. Scenario → tầng test (docs/05-standards/spec-driven.md §4)

| Scenario | Tầng | File test |
|---|---|---|
| S3.1-AC1 thứ tự giai đoạn/nhóm/bài | `shared/services` Phần 3 (nguồn giả) + component | `content.service.test.ts`, `LearningPathContainer.test.tsx` |
| S3.1-AC1 mở bản đồ trong app thật | e2e | `apps/web/e2e/E3/s3.1-learning-path.spec.ts` |
| S3.1-AC2 chưa học / xong bài trước / qua nhóm | `shared/services` Phần 2 (thuần) | `progress.service.test.ts` |
| S3.1-AC2 nhãn trạng thái | component | `LearningPathContainer.test.tsx` |
| S3.1-AC2 tiến độ hỏng | `core/services` + `fake-indexeddb` | `progress-store.service.test.ts` |
| S3.1-AC3 bấm bài khóa / bài đang mở | component + `LocationProbe` | `LearningPathContainer.test.tsx` |

Test component mock ở ranh giới ngoài (`fetch` nội dung) và dùng `fake-indexeddb` cho tiến độ, không mock service.
AC3 "bài khóa" không e2e được với nội dung thật hiện tại (chỉ 1 bài, luôn mở) nên kiểm ở tầng component.

## Risks / Trade-offs

- [Nạp từng file bài để lấy tiêu đề chậm khi lộ trình lớn] → đủ cho Nhập môn; xem lại ở E11 (D2).
- [Nâng IndexedDB lên version 2 trên máy người dùng đã có dữ liệu] → chỉ thêm bảng; test mở DB v1 có
  `settings` rồi nâng v2, `settings` còn nguyên.
- [Trước S3.4 không có cách tạo "đã xong" trong app thật] → chấp nhận; AC2 kiểm bằng dữ liệu seed.

## Migration Plan

Dexie tự nâng schema khi mở DB. Rollback bằng revert commit **không** tự hạ được DB: Dexie từ chối mở
DB có version cao hơn version khai báo. Chấp nhận vì app chưa phát hành rộng; ghi chú trong PR.

## Open Questions

1. **Gõ thẳng URL `/lessons/<id bài khóa>`** có phải chặn không? AC3 chỉ nói "bấm vào". Đề xuất: để
   S3.2 (màn chạy bài thật) quyết, vì `LessonPlaceholder` sẽ bị thay. Không ảnh hưởng spec/tasks của S3.1.
2. **Lối vào bản đồ** trước khi có trang chủ (S8.1): hiện chỉ vào được bằng URL `/learning-paths`. Có cần thêm
   tạm một liên kết "Lộ trình" ở màn bài giữ chỗ không? Đề xuất: không, chờ S8.1.
