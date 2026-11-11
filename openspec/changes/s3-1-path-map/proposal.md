# Proposal: S3.1 Bản đồ lộ trình

Story **S3.1 Bản đồ lộ trình · F5** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s31-bản-đồ-lộ-trình--f5)) ·
GitHub issue [#22](https://github.com/st-trangnguyen/chinese-starter-kit/issues/22).

Refs #22

## Why

Là người học, tôi muốn xem bản đồ lộ trình để biết mình đang ở đâu và tiếp theo học gì. Hiện app chỉ
có onboarding và route bài giữ chỗ (`/lessons/:lessonId`), chưa có màn nào cho thấy toàn bộ lộ trình
và bài nào đã mở. Đây là story đầu của E3, các story chạy bài (S3.2–S3.4) dựa vào nó.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Màn bản đồ lộ trình (lazy-load) + route `/learning-paths` | `pages/learning-path/containers/`, `pages/learning-path/learning-path.routes.ts` |
| UI giai đoạn / nhóm / bài | `pages/learning-path/components/` |
| State + lifecycle của màn | `pages/learning-path/hooks/` |
| Nạp `content.json` + tiêu đề bài | `shared/services/content.service.ts` (mới) qua nguồn nội dung ở `core/services/` (mới) |
| Quy tắc trạng thái bài (khóa / đang mở / đã xong) | `shared/services/progress.service.ts` Phần 2 |
| Đọc tiến độ bài từ IndexedDB | `core/services/progress-store.service.ts` + `core/helpers/db.helper.ts` (bảng `lessonProgress`) |
| Schema Zod `LessonProgress` | `packages/shared` (`progress.schema.ts`) |
| Route constant `/learning-paths` | `core/constants/app.constants.ts` |
| Style BEM của màn | `apps/web/src/styles/tailwind/` |

## What Changes

- Thêm màn **bản đồ lộ trình** ở route `/learning-paths`: hiện các giai đoạn (Stage), nhóm (Unit) và bài theo
  đúng thứ tự trong `content.json`, mỗi bài kèm tiêu đề và nhãn trạng thái.
- Thêm quy tắc trạng thái bài cho giai đoạn **Nhập môn** (F5): bài đầu tiên đang mở; bài sau mở khi bài
  liền trước đã xong; bài có tiến độ "đã xong" hiện là đã xong; còn lại khóa.
- Bài khóa không phải là liên kết: bấm vào không chuyển màn. Bài đang mở / đã xong dẫn tới `/lessons/:id`.
- Thêm bảng Dexie `lessonProgress` (schema version 2) và phương thức **đọc** tiến độ bài trong
  `ProgressStore`, validate bằng Zod khi đọc. Ghi tiến độ thuộc S3.3/S3.4.
- Thêm `ContentService` nạp và validate `content.json` + `lessons/<id>.json`.
- **Chuẩn hoá route theo RESTful**: đổi route bài học `/lesson/:lessonId` → `/lessons/:lessonId`
  (collection số nhiều). Onboarding và `StartGate` (S1.3 AC4) vẫn đưa vào bài đầu, chỉ đổi URL thành
  `/lessons/intro-01`. Không giữ redirect từ URL cũ (app chưa phát hành rộng, chưa có link ngoài).

## Không làm (out of scope)

- Ghi trạng thái "đã xong" khi học xong bài → **S3.4** (S3.1 chỉ đọc; "đã xong" được kiểm tra bằng dữ liệu seed).
- Lưu / đọc cursor câu đang dở → **S3.3**.
- Quy tắc mở khóa HSK theo chủ đề, kiểm tra cuối chủ đề, vượt cấp → **S3.5, S3.6** (0.2).
- Trang chủ và lối vào bản đồ từ trang chủ → **S8.1**. `StartGate` vẫn đưa người học vào bài đầu (S1.3 AC4).
- Chặn truy cập bài khóa bằng URL trực tiếp (`/lessons/<id>` gõ tay) — xem Câu hỏi mở trong `design.md`.
- Soạn thêm bài Nhập môn → **S7.1** (hiện chỉ có `intro-01`).

## Dependencies

- **S3.4 AC2** là nơi duy nhất tạo trạng thái "đã xong" trong app thật. Trước S3.4, người học chỉ thấy
  bài 1 đang mở và các bài sau khóa.
- **S7.1** cung cấp đủ 12 bài Nhập môn. Với nội dung hiện tại (1 bài) màn vẫn đúng; test bài khóa dùng dữ liệu giả.
- **S8.1** sẽ thêm lối vào bản đồ từ trang chủ.

## Capabilities

### New Capabilities
- `learning-path`: Bản đồ lộ trình — hiển thị giai đoạn, nhóm, bài theo thứ tự; trạng thái từng bài
  (khóa / đang mở / đã xong) theo quy tắc mở khóa; điều hướng từ bản đồ vào bài.

### Modified Capabilities
- (không có — `openspec/specs/` chưa có capability nào)

## Impact

- Code mới: `pages/learning-path/**`, `shared/services/content.service.ts`, nguồn nội dung trong `core/services/`,
  i18n namespace `learning-path`, CSS BEM cho bản đồ.
- Code sửa: `progress.service.ts` (thêm rule + use case), `progress-store.service.ts` (đọc
  `lessonProgress`), `db.helper.ts` (Dexie `version(2)`, không sửa version 1), `progress.schema.ts`,
  `pages/page.routes.ts`, `app.constants.ts`, `pages/lesson/lesson.routes.ts` (`lessons/:lessonId`).
- Test cũ phải sửa theo URL mới: `OnboardingContainer.test.tsx`, `e2e/E1/s1.2-offline.spec.ts`,
  `e2e/E1/s1.3-onboarding.spec.ts`.
- Docs: `docs/03-architecture.md` (tên thư mục `pages/learning-path`, i18n `learning-path`).
- Dữ liệu: IndexedDB lên version 2, thêm bảng rỗng — người dùng cũ không mất `settings`.
- Không thêm dependency mới.
