# Design: S3.6 Kiểm tra vượt cấp

## Context

- `content.json`: Stage → Unit (chủ đề) → `lessonIds`; mỗi bài có `type: 'lesson' | 'test'`. Hiện chưa có bài `test` thật (E11).
- S3.1: `deriveLessonStatuses` suy trạng thái từ tập bài `completed`; bài mở khi bài liền trước xong. Đánh dấu mọi bài của chủ đề N
  `completed` thì bài đầu chủ đề N+1 tự mở, không cần đổi rule bản đồ.
- S3.5 (PR spec #77): bài kiểm tra chỉ `completed` khi đạt 80%; có tổng kết đạt/chưa đạt, làm lại, luôn bắt đầu câu 1.
- Bản đồ chỉ biết `lessonIds` của chủ đề, không biết loại bài; loại bài nằm trong từng `lessons/<id>.json`.
- Layer đích và Dependency Rule: xem `proposal.md`, CLAUDE.md §1–§2.

## Goals / Non-Goals

**Goals:** quy tắc "chủ đề nào có nút" thuần và test được; đạt thì ghi hàng loạt đúng và nguyên tử; tái dùng chạy bài và quy tắc đạt của S3.5.

**Non-Goals:** chặn URL bài khóa, điểm của chủ đề đã vượt, nội dung bài kiểm tra.

## Decisions

### D1. Route `/units/:unitId/placement-test`
Theo chuẩn RESTful của dự án (tài nguyên số nhiều, kebab-case, tên cụ thể): bài kiểm tra vượt cấp là tài nguyên con của chủ đề. Thêm vào
`pages/lesson/lesson.routes.ts`, không đổi `lessons/:lessonId` đã giao. Nêu ở Câu hỏi mở 2 để duyệt tên.

### D2. Chủ đề nào có nút (Phần 2 `ProgressService`)
`getPlacementTestLessonId(unit, statuses, lessonTypes): string | undefined`:
- Rule: chủ đề **chưa mở** = mọi bài của chủ đề có trạng thái `locked`.
- Rule: bài kiểm tra của chủ đề = bài **cuối** có `type: 'test'` trong `lessonIds` (Câu hỏi mở 6); không có → không có nút.
  Chọn bằng một hàm thuần dùng chung `findPlacementTestLessonId(lessonIds, lessonTypes)`; cả nút (D2) lẫn `finishLesson` (D4) cùng gọi hàm này.
- Rule (thận trọng): nếu có bài của chủ đề **chưa biết loại** (nạp lỗi, không có trong `lessonTypes`) thì chủ đề **không có nút**,
  tránh mở nhầm cả chủ đề khi bài cuối không đọc được.
- Trả `undefined` nghĩa là không hiện nút (đã mở/đã xong/không có bài kiểm tra).
`lessonTypes` là `Map<lessonId, LessonType>` do `useLearningPath` nạp (qua `ContentService`), nên `ProgressService` vẫn thuần và không đọc nội dung.
- Chịu lỗi từng bài: `getLessonTypes` bỏ bài nạp lỗi khỏi Map thay vì làm hỏng cả bản đồ; `ContentService.getPathMap` cũng chịu lỗi từng bài
  (bài lỗi chỉ thiếu tiêu đề, UI rơi về id). Chỉ lỗi ở `content.json` gốc mới làm bản đồ lỗi.
- *Đã cân nhắc:* thêm `type` vào `unitSchema`/`content.json` — bỏ vì đổi schema nội dung và pipeline E2; loại bài đã có trong từng bài.
  Nếu việc nạp từng bài chậm, đổi thành trường tóm tắt trong `content.json` ở story riêng (hỏi lại).

### D3. Chạy bài ở chế độ vượt cấp
- Container mới đọc `unitId` từ URL, nhờ hook tìm `lessonId` bài kiểm tra của chủ đề (D2), rồi dùng lại `useLessonRunner(lessonId, { placementUnitId })`.
  Hook, màn tổng kết, làm lại: dùng nguyên của S3.5.
- `unitId` không có, hoặc chủ đề không có bài kiểm tra: hiện thông báo "không mở được" như lỗi mở bài ở S3.2; không rơi vào bài khác.
- Chủ đề đã mở/đã xong gõ URL vào: vẫn cho làm (không có AC chặn); kết quả đạt chỉ ghi các bài chưa xong. Chặn URL là out-of-scope.

### D4. Kết thúc vượt cấp (Phần 3 `LessonService`)
`finishLesson` nhận thêm ngữ cảnh `placement?: { lessonIds: readonly string[] }`:
- Không đạt hoặc còn câu bỏ qua (rule `isComplete` của S3.5): **không ghi gì** cho các bài của chủ đề (Scenario "Chưa đạt thì chủ đề giữ nguyên khóa", "Còn câu bỏ qua thì chưa đạt").
- Chỉ ghi hàng loạt khi bài đang xong **chính là** bài kiểm tra của chủ đề, tức `findPlacementTestLessonId(placement.lessonIds, types)` (D2) trùng `lessonId` đang kết thúc.
  `finishLesson` không có sẵn `lessonTypes`: nó tự dựng `types` bằng `resolveLessonTypes(placement.lessonIds)`, mỗi bài lấy từ cache `knownTypes`
  (do `openLesson` điền), chưa có thì gọi `source.getLesson`; bài nạp lỗi bị bỏ khỏi map.
  Rủi ro nhỏ: nếu bài test cuối nạp lỗi và chưa có trong cache thì test giữa chủ đề có thể bị coi là test cuối (hiếm vì `openLesson` đã điền cache).
- Đạt: ghi `{ status: 'completed' }` cho **mọi** `lessonId` của chủ đề **trong một transaction** (`saveLessonProgressBatch` ở `ProgressStore`, thêm cho S3.6),
  giữ nguyên bài đã `completed`, bỏ `cursor` đang dở. Một bài ghi hỏng thì cả lô không ghi (không để chủ đề xong nửa vời);
  `isSaved = false` như S3.4.
- Câu sai: vẫn chuyển qua cổng của S3.5 (hành vi bài kiểm tra không đổi).
- *Đã cân nhắc:* ghi từng bài một — bỏ vì ngắt giữa chừng để lại chủ đề xong một phần, bản đồ mở sai bài.

### D5. Nút trên bản đồ
- `LearningPathStage`/đơn vị chủ đề nhận `placementTestUnitIds` từ `useLearningPath`; nút là `Link` tới route D1, nhãn chữ "Kiểm tra vượt cấp",
  focus nhìn thấy, không dùng màu làm tín hiệu duy nhất. Style BEM trong `styles/tailwind/`.
- Bài khóa trong chủ đề vẫn render không bấm được như S3.1 (Scenario "Bài khóa trong chủ đề vẫn không vào được").

## Risks / Trade-offs

- Vượt xa để lại chủ đề giữa khóa nhưng chủ đề sau mở (Câu hỏi mở 1): hệ quả trực tiếp của rule "bài mở khi bài liền trước xong".
- Mỗi lần mở bản đồ phải biết loại bài của mọi chủ đề: nạp song song bằng `Promise.all` và chỉ cho chủ đề chưa mở.
- Chưa có nội dung `test` thật nên chưa thấy nút trên app thật (xem Câu hỏi mở 4).

## Scenario → tầng test

| Scenario | Tầng | Tệp test |
|---|---|---|
| S3.6-AC1 chủ đề nào có/không có nút | `shared/services` Phần 2 (thuần) | `progress.service.test.ts` |
| S3.6-AC1 hiện nút, bài khóa vẫn không vào được | container | `LearningPathContainer.test.tsx` |
| S3.6-AC1 bấm nút vào bài kiểm tra câu 1 | container (route) | `PlacementTestContainer.test.tsx` |
| S3.6-AC2 đạt → chủ đề xong, chủ đề kế mở; vượt xa; chưa đạt; còn câu bỏ qua | `shared/services` Phần 3 + `fake-indexeddb` | `lesson.service.test.ts` |
| S3.6-AC2 chưa đạt thì làm lại | container | `PlacementTestContainer.test.tsx` (dùng chung tổng kết S3.5) |
| `saveLessonProgressBatch` nguyên tử | `core/services` | `progress-store.service.test.ts` |

e2e chưa làm được (Câu hỏi mở 4 trong `proposal.md`).
