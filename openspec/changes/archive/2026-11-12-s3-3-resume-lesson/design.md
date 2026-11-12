# Design: S3.3 Học tiếp từ câu đang dở

## Context

- S3.2 đã có `LessonService` (3 phần) với `startSession(exercises)` luôn bắt đầu ở câu 0, và `useLessonRunner`
  giữ `LessonSession` trong `useState`. Chưa có gì ghi xuống IndexedDB.
- Bảng `lessonProgress` (khoá `lessonId`) đã có từ S3.1; `lessonProgressSchema` hiện là
  `{ lessonId, status: 'in-progress' | 'completed' }`, chú thích sẵn "`cursor` (S3.3) thêm khi tới story đó".
  `ProgressStore` mới chỉ có `getAllLessonProgress` (dòng hỏng bị bỏ qua).
- Bản đồ (`getCompletedLessonIds`) chỉ đếm `status === 'completed'`, nên dòng `in-progress` không đổi trạng thái bài.
- Layer đích và Dependency Rule: xem `proposal.md`, CLAUDE.md §1–§2.

## Goals / Non-Goals

**Goals:**
- Vị trí lưu bền qua đóng app/tải lại, đọc lại phải validate (CLAUDE.md §0.4).
- Quy tắc "vị trí nào hợp lệ" nằm ở `LessonService` Phần 2, thuần, test không cần IndexedDB.
- Lưu lỗi không chặn học.

**Non-Goals:** lưu điểm/thời gian/đáp án (S3.4), đồng bộ thiết bị, nút thoát.

## Decisions

### D1. Lưu `cursor` = chỉ số câu (0-based) trong dòng `lessonProgress`
```ts
export const lessonProgressSchema = z.object({
  lessonId: z.string().trim().min(1),
  status: z.enum(LESSON_PROGRESS_STATUSES),
  cursor: z.number().int().min(0).optional().catch(undefined),
});
```
- `.catch(undefined)` để `cursor` hỏng chỉ mất vị trí, không làm cả dòng bị bỏ (vì bỏ dòng sẽ làm mất `status: completed`
  và khoá lại bài, trái Scenario S3.3-X2).
- Không thêm bảng, không thêm `db.version`: `LessonProgressRow` đã cho trường mở rộng.
- *Đã cân nhắc:* lưu `exerciseId` thay chỉ số — bỏ vì khi bài đổi nội dung id cũ vẫn có thể khớp sai chỗ; chỉ số + kiểm
  khoảng hợp lệ đơn giản hơn. Đổi thứ tự câu mà giữ nguyên số câu sẽ mở sai chỗ: chấp nhận (nội dung bài ít đổi), hỏi lại nếu cần.

### D2. `ProgressStore` thêm hai method
- `getLessonProgress(lessonId): Promise<LessonProgress | undefined>` — validate Zod, dòng hỏng → `undefined`.
- `saveLessonProgress(progress: LessonProgress): Promise<void>` — `put` theo `lessonId`.
- Hạ tầng thuần, không chứa quy tắc (CLAUDE.md §3).

### D3. Quy tắc ở `LessonService` Phần 2 (kèm "Rule: …")
- `resolveStartIndex(savedCursor: number | undefined, exerciseCount: number): number` — hợp lệ khi là số nguyên trong
  `[0, exerciseCount)`, ngược lại 0. Rule: vị trí không dùng được thì về câu đầu.
- `nextProgress(existing: LessonProgress | undefined, lessonId: string, cursor: number): LessonProgress` — Rule: giữ
  `status: 'completed'` nếu đã xong, ngược lại `'in-progress'`; ghi `cursor`.
- `startSession(exercises, startIndex = 0)` nhận thêm vị trí bắt đầu (S3.2 đã báo trước), kẹp trong khoảng hợp lệ.
- Phiên mới mở ở `phase: 'answering'` (đáp án chưa chấm không lưu → làm lại từ đầu câu).

### D4. Use case (Phần 3) và lúc lưu
- `LessonService` nhận `ProgressStore` qua constructor (mặc định `progressStore`), Phần 1 thêm `readCursor`, `writeCursor`.
- `openLesson(lessonId)` nạp bài, đọc tiến độ, `startSession(lesson.exercises, resolveStartIndex(...))`. **Đọc tiến độ lỗi
  thì coi như không có vị trí** (không throw) → Scenario "không đọc được thì về câu 1".
- `saveCursor(lessonId, session)` — Phần 3, ghi `nextProgress(...)`. Khi `phase === 'finished'`: bỏ `cursor` (giữ `status`
  nếu đã xong, ngược lại xoá vị trí) → Scenario S3.3-X1.
- **Lúc lưu:** hook gọi `saveCursor` khi `currentIndex` hoặc `phase = 'finished'` đổi (sau `advance`/`skip`), không dựa
  vào sự kiện đóng trang (`beforeunload`/`visibilitychange` không đáng tin, đặc biệt trên mobile). Hệ quả: thoát khi đang
  xem kết quả câu k vẫn lưu k (đã lưu từ lúc vào câu k) — khớp Scenario "Thoát khi đang xem kết quả".
- Ghi lỗi: `catch` ở hook, nuốt lỗi (không throw ra UI) → Scenario "Không lưu được thì vẫn học tiếp". Không ghi log chứa dữ liệu học.
- Ghi bất đồng bộ nhưng tuần tự theo thứ tự câu: hook không chặn chuyển câu chờ ghi xong.
- *Đã cân nhắc:* lưu cả khi đổi câu lẫn khi chấm xong — bỏ, đáp án chưa chấm không phục hồi được và S3.4 mới cần.

### D5. Vì sao không đụng bản đồ
Bản đồ chỉ đếm `completed` (S3.1) nên `in-progress` + `cursor` không đổi nhãn "Đang mở". Quy tắc ở D3 (`nextProgress`
giữ `completed`) là thứ bảo vệ Scenario S3.3-X2.

## Risks / Trade-offs

- Mở bài trước khi `openLesson` xong đọc tiến độ: hook đã gắn bài với `lessonId` (S3.2), đổi bài không lẫn vị trí cũ.
- Hai tab cùng mở một bài ghi đè nhau: chấp nhận, vị trí cuối cùng thắng.

## Scenario → tầng test

| Scenario | Tầng | Tệp test |
|---|---|---|
| S3.3-AC1 (thoát sau khi sang câu / bỏ qua / mỗi bài riêng / không lưu được) | `shared/services` Phần 3 + `fake-indexeddb`; hook | `lesson.service.test.ts`, `useLessonRunner.test.ts` |
| S3.3-AC1 Thoát khi đang xem kết quả | hook | `useLessonRunner.test.ts` |
| S3.3-AC2 (mở lại đúng câu, bài mới, hỏng, vượt số câu) | `shared/services` Phần 2 (thuần) + Phần 3 | `lesson.service.test.ts` |
| S3.3-AC2 Câu đang dở làm lại từ đầu câu, thanh tiến độ | container | `LessonRunnerContainer.test.tsx` |
| S3.3-X1 Làm xong câu cuối | `shared/services` Phần 3 | `lesson.service.test.ts` |
| S3.3-X2 Bài đã xong vẫn đã xong | `shared/services` Phần 2 + Phần 3 | `lesson.service.test.ts` |
| Schema `cursor` hỏng không làm mất dòng | `packages/shared` | `progress.schema.test.ts` |
| `getLessonProgress` / `saveLessonProgress` | `core/services` | `progress-store.service.test.ts` |

e2e (Playwright) chưa làm được: xem Câu hỏi mở 1 trong `proposal.md`.
