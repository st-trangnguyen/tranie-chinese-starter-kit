# Design: S3.4 Tổng kết bài và mở khóa

## Context

- S3.2: `LessonSession { exerciseIds, currentIndex, phase, lastResult, skippedCount }`; hết câu cuối thì `phase = 'finished'`
  và `LessonFinished` hiện thông báo tạm. Quy tắc nằm ở `LessonService` Phần 2.
- S3.1: `ProgressService.deriveLessonStatuses` suy trạng thái bản đồ từ tập bài `completed`; quy tắc Nhập môn
  "xong bài trước thì mở bài sau" đã có, kể cả qua ranh giới nhóm/giai đoạn. Bản đồ chỉ cần dòng `lessonProgress`
  có `status: 'completed'`.
- S3.3 (PR spec #75) thêm `ProgressStore.saveLessonProgress` và rule `nextProgress` (giữ `completed`, ghi `cursor`).
- Layer đích và Dependency Rule: xem `proposal.md`, CLAUDE.md §1–§2.

## Goals / Non-Goals

**Goals:** tổng kết tính đúng và thuần (test không cần React/IndexedDB); ghi "đã xong" đúng điều kiện;
các Scenario S3.2 hiện có (thông báo đã làm xong, focus, bỏ qua câu) không đổi.

**Non-Goals:** ngưỡng điểm, `bestScore`, SRS, nút đi tiếp, đồng hồ tạm dừng.

## Decisions

### D1. Phiên làm bài thêm bộ đếm và mốc thời gian
```ts
interface LessonSession {
  // …S3.2
  correctCount: number;
  wrongCount: number;
  startedAt: number;      // ms epoch, lúc câu đầu của lượt này hiện
  finishedAt: number | null;
}
```
- `submitResult` tăng `correctCount` hoặc `wrongCount` (chỉ khi `phase = 'answering'`, nên bấm đúp không đếm đôi).
- `startSession(exercises, startIndex, now)` và `advance/skip(session, now)` nhận **`now` là tham số** (số ms) để quy tắc
  thuần, test không phải mock đồng hồ; hook truyền `Date.now()`. Khi sang `finished` thì ghi `finishedAt = now`.
- Lượt làm tiếp (S3.3) khởi tạo bộ đếm bằng 0 và `startedAt` = lúc mở: khớp giả định Câu hỏi mở 1 của `proposal.md`.
- *Đã cân nhắc:* lưu `correctCount`/`wrongCount` xuống IndexedDB qua lần thoát — bỏ vì đổi scope S3.3 và chưa có AC.

### D2. Quy tắc ở `LessonService` Phần 2 (kèm "Rule: …")
- `summarize(session): LessonSummary` với
  `LessonSummary { scorePercent: number; correctCount; answeredCount; wrongCount; skippedCount; elapsedSeconds: number; isComplete: boolean }`.
  - `answeredCount = correctCount + wrongCount`.
  - Rule: `scorePercent = answeredCount === 0 ? 0 : Math.round(correctCount * 100 / answeredCount)` (số nguyên, không float tiền tệ).
  - Rule: `elapsedSeconds = Math.max(0, Math.round((finishedAt - startedAt) / 1000))`.
  - Rule: `isComplete = phase === 'finished' && skippedCount === 0` (Nhập môn không có ngưỡng điểm).
- Hàm chỉ hợp lệ khi `phase = 'finished'`; gọi sớm thì throw `Error` rõ nghĩa (lỗi lập trình, không tới UI).

### D3. Use case kết thúc bài (Phần 3)
`finishLesson(lessonId, session): Promise<LessonSummary & { isSaved: boolean }>`:
1. `summarize(session)`.
2. Nếu `isComplete`: ghi `{ lessonId, status: 'completed' }` không có `cursor` (qua `nextProgress`/`saveLessonProgress` của S3.3, giữ biện
   pháp `S3.3-X1`); không hạ bài đã `completed`.
3. Nếu không hoàn thành (còn câu bỏ qua): không ghi `completed`, để nguyên dòng tiến độ.
4. Ghi lỗi thì `isSaved = false` (không throw) → UI hiện "Chưa lưu được kết quả bài này".
- Tổng kết được trả về dù ghi lỗi (Scenario "Ghi tiến độ lỗi").
- *Đã cân nhắc:* đặt ghi "đã xong" ở `ProgressService` — bỏ vì `LessonService` đã giữ store và quy tắc phiên; hook vẫn gọi một service.
  Nếu sau này `ProgressService` cần dùng chung thì tách rule `isLessonComplete` ra, không đổi hành vi.

### D4. Hook và màn tổng kết
- `useLessonRunner` gọi `finishLesson` **một lần** khi `phase` chuyển sang `finished` (effect có cờ chống chạy đôi và cleanup,
  CLAUDE.md §7), giữ `summary` và `isSaved` trong state, gắn với `lessonId` như S3.2.
- `LessonSummary` (component) thay `LessonFinished`: tiêu đề giữ chữ `finished`/`finishedWithSkipped` của S3.2 (focus vào tiêu
  đề như cũ), dưới là danh sách `dl` gồm Điểm / Thời gian / Số câu sai; thông báo `role="alert"` khi `isSaved = false`.
- Thời gian dùng `formatDuration(seconds)` ở `shared/utils/duration.utils.ts` → `m:ss` (`125 → "2:05"`, `9 → "0:09"`).
- i18n `lesson.json` thêm: `summary.score`, `summary.correct`, `summary.time`, `summary.wrong`, `summary.notSaved`.

### D5. Bản đồ không đổi
Bản đồ đọc lại tiến độ khi mở màn; dòng `completed` làm `deriveLessonStatuses` mở bài kế (S3.1). Scenario `S3.4-AC2` kiểm bằng cách
chạy `finishLesson` rồi gọi lại `getCompletedLessonIds` + `deriveLessonStatuses`, không cần mock bản đồ.

## Risks / Trade-offs

- Đồng hồ hệ thống bị chỉnh giữa chừng: `Math.max(0, …)` chặn thời gian âm.
- Tổng kết cho lượt làm tiếp chỉ gồm câu của lượt đó (Câu hỏi mở 1): người học có thể thấy "Đúng 2 / 3" cho bài 5 câu. Chờ BA.
- `finishLesson` chạy trong effect: đổi bài giữa chừng phải huỷ kết quả cũ (cleanup) để tổng kết bài cũ không đè bài mới.

## Scenario → tầng test

| Scenario | Tầng | Tệp test |
|---|---|---|
| S3.4-AC1 điểm, làm tròn, 0%/100%, câu bỏ qua, làm tiếp | `shared/services` Phần 2 (thuần) | `lesson.service.test.ts` |
| S3.4-AC1 thời gian `2:05`, `0:09` | `shared/utils` | `duration.utils.test.ts` |
| S3.4-AC1 hiện đúng chữ trên màn, chưa hết bài thì chưa có | container | `LessonRunnerContainer.test.tsx` |
| S3.4-AC1 Ghi tiến độ lỗi | `shared/services` Phần 3 + container | `lesson.service.test.ts`, `LessonRunnerContainer.test.tsx` |
| S3.4-AC2 xong → mở, điểm thấp, cuối nhóm, bỏ qua, thoát giữa chừng, làm lại, mở lại câu 1 | `shared/services` Phần 3 + `fake-indexeddb` | `lesson.service.test.ts` |

e2e chưa làm được (Câu hỏi mở 5 trong `proposal.md`).
