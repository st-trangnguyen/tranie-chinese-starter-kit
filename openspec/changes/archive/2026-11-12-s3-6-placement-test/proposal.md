# Proposal: S3.6 Kiểm tra vượt cấp

Story **S3.6 Kiểm tra vượt cấp · F5** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s36-kiểm-tra-vượt-cấp--f5)) ·
GitHub issue [#54](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/54). Bản 0.2.

Refs #54

## Why

Là người học, tôi muốn bỏ qua chủ đề mình đã biết để không mất thời gian. Hiện chủ đề chưa mở chỉ mở khi học xong bài
trước (S3.1, S3.4), người đã biết nội dung vẫn phải đi hết. S3.6 cho làm bài kiểm tra của một chủ đề chưa mở; đạt từ
80% (ngưỡng của S3.5) thì chủ đề đó được đánh dấu xong và chủ đề tiếp theo mở.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Route của feature: vào bài kiểm tra vượt cấp của một chủ đề | `pages/lesson/lesson.routes.ts` |
| Nút "Kiểm tra vượt cấp" trên chủ đề chưa mở | `pages/learning-path/components/` |
| Chủ đề nào có nút, bài kiểm tra của chủ đề nào (suy từ lộ trình + trạng thái) | `shared/services/progress.service.ts` Phần 2 (+ `shared/utils/learning-path.utils.ts` cho phần duyệt cấu trúc) |
| Kết thúc bài vượt cấp: đạt thì ghi mọi bài của chủ đề "đã xong" | `shared/services/lesson.service.ts` Phần 3 (ghi qua `ProgressStore`) |
| Nối route với màn chạy bài ở chế độ vượt cấp | `pages/lesson/containers/`, `hooks/` |
| i18n, style BEM của nút | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Chủ đề **chưa mở** (mọi bài còn khóa) và **có bài kiểm tra** thì hiện nút "Kiểm tra vượt cấp" trên bản đồ.
- Bấm nút vào bài kiểm tra của chủ đề đó, chạy như bài kiểm tra S3.5 (bắt đầu câu 1, làm lại được).
- Đạt từ 80% trở lên: **mọi bài** của chủ đề được ghi "Đã xong", chủ đề kế tiếp mở.
- Chưa đạt: chủ đề giữ nguyên khóa; người học làm lại được.
- Chủ đề đã mở hoặc đã xong, hoặc chủ đề không có bài kiểm tra: không có nút.
- Bấm bài khóa trong chủ đề vẫn không vào được (S3.1-AC3 không đổi).

## Không làm (out of scope)

- Ngưỡng 80%, màn tổng kết đạt/chưa đạt, nút làm lại, chuyển câu sai sang ôn tập → đã thuộc **S3.5**, S3.6 dùng lại.
- Tạo thẻ SRS từ câu sai → **S9.4**.
- Nội dung bài kiểm tra từng chủ đề → **E11**.
- Chặn vào bài khóa bằng cách gõ URL `/lessons/:lessonId` (câu hỏi mở từ S3.2).
- Nút ra khỏi màn tổng kết (như Câu hỏi mở 4 của S3.4).

## Dependencies

- **S3.5** (PR spec #77): bài kiểm tra, ngưỡng 80%, làm lại, bài kiểm tra bắt đầu từ câu 1. Code S3.6 apply sau code S3.5.
- **S3.4** (PR spec #76) → `finishLesson`; **S3.3** (#75) → `saveLessonProgress`.
- **S3.1** (đã archive): bản đồ, `deriveLessonStatuses` (không đổi).
- **E11**: có bài `type: test` thật mới thấy nút trên app, nên chưa có e2e (Câu hỏi mở 4). Nhập môn không có bài kiểm tra nên không có nút.

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `learning-path`: nút "Kiểm tra vượt cấp" trên chủ đề chưa mở, và đạt thì chủ đề được đánh dấu xong, chủ đề kế mở.

## Câu hỏi mở

1. **Vượt cấp nhảy xa:** AC chỉ nói "chủ đề chưa mở". Giả định cho phép **mọi** chủ đề chưa mở, kể cả xa phía sau. Hệ quả: vượt chủ đề 5
   khi đang học chủ đề 3 thì chủ đề 4 vẫn khóa, chủ đề 5 "Đã xong", chủ đề 6 mở. BA xác nhận, hay chỉ cho chủ đề kế tiếp?
2. **Route:** giả định `/units/:unitId/placement-test` (tài nguyên số nhiều, kebab-case, đủ cụ thể theo chuẩn RESTful của dự án). Dev/BA duyệt tên.
3. **Điểm của chủ đề đã vượt:** các bài thường của chủ đề được đánh dấu xong mà không có điểm. Có cần ghi điểm kiểm tra để hiện sau không? Giả định: không (cùng lý do bỏ `bestScore` ở S3.4).
4. Chưa có e2e vì chưa có nội dung bài kiểm tra thật (E11).
5. Câu chữ nút ("Kiểm tra vượt cấp") đã chép từ AC; BA duyệt chữ trên màn tổng kết khi đạt ("Bạn đã đạt" của S3.5 đủ chưa, hay cần nói rõ "chủ đề đã được bỏ qua")?
6. Chủ đề có nhiều hơn một bài `type: test`: giả định dùng bài kiểm tra **cuối** của chủ đề. Nội dung E11 xác nhận.

## Impact

- Code mới: route/hook cho chế độ vượt cấp, `LearningPathUnitSkipButton` (tên tạm) trong `pages/learning-path/components/`.
- Code sửa: `progress.service.ts` (+ `learning-path.utils.ts`), `lesson.service.ts` (+ test), `useLearningPath.ts`, `LearningPathStage.tsx`, i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB schema/version, không thêm dependency.
