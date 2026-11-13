# Tasks: S5.1 Ghi âm và so sánh

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail đúng lý do (thiếu hành vi, không phải lỗi import), commit `test(...)`;
mỗi GREEN code tối thiểu đúng layer, test pass, commit `feat(...)`. Tên test chứa Scenario ID. Chỉ code sau khi PR spec đã merge.
Test dùng `MediaRecorder`/`getUserMedia`/`URL.createObjectURL`/`Audio` giả ở ranh giới. Đường dẫn tính từ `apps/web/src/`.

## 1. Hạ tầng ghi âm — `core/services/recorder.service.ts`

- [x] 1.1 RED: test S5.1-AC1 "Bấm Dừng thì kết thúc ghi" (start rồi stop trả một URL bản ghi) và S5.1-AC1 "Ghi lại thì bản mới thay bản cũ" (stop lần hai thu hồi URL cũ, chỉ còn URL mới) — Vitest thuần với micro giả, `app/core/services/recorder.service.test.ts`; kiểm: fail vì chưa có tệp
- [x] 1.2 GREEN: thêm `RecorderService` (`start`, `stop`, `discard`) + `createRecorderService()`; kiểm: test 1.1 pass
- [x] 1.3 RED (xanh sẵn: `discard` đã được thêm ở 1.2 theo design D1): test S5.1-AC1 "Rời màn khi đang ghi thì dừng ghi" (`discard` khi đang ghi: recorder dừng, mọi track `stop()`, URL thu hồi; gọi hai lần không lỗi) và S5.1-AC3 "Sang câu khác thì bản ghi của câu trước không còn" ở tầng service (`discard` thu hồi URL) — `recorder.service.test.ts`; kiểm: fail
- [x] 1.4 GREEN (không cần code mới): hoàn thiện `discard` và tắt track ở cả `stop`; kiểm: test 1.3 pass

## 2. Hook — `core/hooks/useRecorder.ts` và `useAudioPlayer.playUrl`

- [x] 2.1 RED: test S5.1-AC1 "Chưa ghi thì có nút Ghi âm" (state đầu: `isRecording = false`, `recordingUrl = null`), "Bấm Ghi âm thì bắt đầu ghi" (`isRecording = true`) và "Bấm Dừng thì kết thúc ghi" (`isRecording = false`, có `recordingUrl`) — Vitest + `renderHook`, `app/core/hooks/useRecorder.test.ts`; kiểm: fail vì chưa có hook
- [x] 2.2 GREEN: thêm `useRecorder` (`isRecording`, `recordingUrl`, `hasError`, `start`, `stop`, cờ `isMounted`); kiểm: test 2.1 pass
- [x] 2.3 RED: test S5.1-AC1 "Ghi lại thì bản mới thay bản cũ" (`recordingUrl` đổi sang URL mới), "Bắt đầu ghi thì audio đang phát dừng" (audio giả đang phát, `start` gọi → luồng dừng) và "Rời màn khi đang ghi thì dừng ghi" (unmount → track tắt, không `setState` sau unmount) — `useRecorder.test.ts`; kiểm: fail
- [x] 2.4 GREEN: thêm `audioService.stop()` trong `start` và cleanup `discard()` khi unmount; kiểm: test 2.3 pass
- [x] 2.5 RED: test S5.1-AC2 "Nghe bản ghi" (`playUrl(url)` phát đúng `src` blob một lần từ đầu), "Nghe cạnh nhau" (`play` mẫu sau `playUrl` → luồng bản ghi nhận `'interrupted'`, chỉ một element) và "Nghe lại nhiều lần" (5 lần `playUrl`, mỗi lần sau khi lần trước `ended`, đủ 5 lần phát, vẫn gọi được) — `app/core/hooks/useAudioPlayer.test.ts` (thêm ca vào tệp có sẵn); kiểm: fail vì chưa có `playUrl`
- [x] 2.6 GREEN: tách `start(src, rate)` nội bộ và thêm `playUrl` trong `useAudioPlayer`; kiểm: test 2.5 pass và các test S4.4 cũ vẫn xanh
- [x] 2.7 RED (xanh sẵn: `playUrl` dùng chung nhánh lỗi với `play` từ 2.6): test S5.1-AC2 "Bản ghi không phát được" (`playUrl` bị từ chối → `hasError = true`, `play` mẫu vẫn chạy, ghi lại được) — `useAudioPlayer.test.ts`; kiểm: fail
- [x] 2.8 GREEN (không cần code mới): dùng nhánh lỗi sẵn có cho `playUrl`; kiểm: test 2.7 pass

## 3. Khối dùng chung — `shared/components/RecordCompare.tsx`

- [x] 3.1 RED: test S5.1-AC1 "Chưa ghi thì có nút Ghi âm", "Bấm Ghi âm thì bắt đầu ghi" (thấy "Đang ghi âm", nút đổi "Dừng") và "Bấm Dừng thì kết thúc ghi" (hết "Đang ghi âm", nút lại "Ghi âm", "Nghe bản ghi" bấm được) — Vitest + Testing Library `renderWithProviders`, `app/shared/components/RecordCompare.test.tsx`; kiểm: fail vì chưa có component
- [x] 3.2 GREEN: thêm `RecordCompare` (nút ghi/dừng, `role="status"`), nhóm `record` trong `assets/i18n/vi/lesson.json`, `styles/tailwind/components/_record.css` + import trong `main.css`; kiểm: test 3.1 pass
- [x] 3.3 RED (xanh sẵn: hành vi đã có từ `useRecorder` 2.4, RED thật nằm ở 2.3): test S5.1-AC1 "Ghi lại thì bản mới thay bản cũ" (chỉ một bản ghi: nghe phát URL mới), "Bắt đầu ghi thì audio đang phát dừng" (đang phát mẫu hoặc bản ghi, bấm Ghi âm → dừng, `isRecording`) và "Rời màn khi đang ghi thì dừng ghi" (unmount → micro nhả) — `RecordCompare.test.tsx`; kiểm: fail
- [x] 3.4 GREEN (không cần code mới): nối `player.stop()` + `recorder.start()`, dùng chung một `useAudioPlayer`; kiểm: test 3.3 pass
- [x] 3.5 RED (xanh sẵn: nút "Nghe mẫu" đã được thêm sớm ở 3.2): test S5.1-AC2 "Chưa ghi thì chưa nghe được bản ghi" ("Nghe mẫu" bấm được, "Nghe bản ghi" `disabled`), "Nghe mẫu" (phát `audioPath` một lần từ đầu), "Nghe bản ghi", "Nghe cạnh nhau" và "Nghe lại nhiều lần" (5 lần, nút vẫn bấm được) — `RecordCompare.test.tsx`; kiểm: fail
- [x] 3.6 GREEN (không cần code mới): thêm "Nghe mẫu" / "Nghe bản ghi" (`disabled` khi chưa có bản ghi hoặc đang ghi); kiểm: test 3.5 pass
- [x] 3.7 RED: test S5.1-AC2 "Bản ghi không phát được" (thấy thông báo "Không phát được bản ghi.", vẫn bấm được Ghi âm và Nghe mẫu) — `RecordCompare.test.tsx`; kiểm: fail
- [x] 3.8 GREEN: hiện `<p role="alert">` khi `hasError`; kiểm: test 3.7 pass
- [x] 3.9 RED (xanh sẵn: `useRecorder.start` đã bắt lỗi từ 2.2; giữ làm ca hồi quy) (kỹ thuật, không có Scenario; ghi rõ trong tên test): bấm Ghi âm mà micro không dùng được thì màn không hỏng (không throw, vẫn bấm được các nút, chưa có thông báo hướng dẫn: thuộc S5.4) — `RecordCompare.test.tsx`; kiểm: fail
- [x] 3.10 GREEN (không cần code mới): bắt lỗi trong `useRecorder.start` đặt `hasError`, không ném ra UI; kiểm: test 3.9 pass

## 4. Bản ghi không được lưu — AC3

- [x] 4.1 RED (xanh sẵn nhờ cleanup D2): test S5.1-AC3 "Rời bài rồi mở lại thì không còn bản ghi" và "Học tiếp từ câu đang dở cũng không có bản ghi" (ghi âm, unmount, mount lại: chưa có bản ghi, "Nghe bản ghi" `disabled`) và "Sang câu khác thì bản ghi của câu trước không còn" (đổi `key`: câu mới chưa có bản ghi, URL cũ đã thu hồi) — `RecordCompare.test.tsx`; kiểm: fail hoặc, nếu đã xanh từ nhóm 1–3 thì ghi rõ "xanh sẵn nhờ cleanup D2" và vẫn commit test
- [x] 4.2 GREEN (không cần code mới): chỉ sửa nếu 4.1 đỏ; thường không cần code mới; kiểm: test 4.1 pass
- [x] 4.3 RED (xanh sẵn: bản ghi chỉ ở bộ nhớ): test S5.1-AC3 "Bản ghi không có trong dữ liệu lưu của máy" (ghi âm rồi unmount; đọc mọi bảng của `createDatabase()` bằng `fake-indexeddb` và `localStorage`: không chứa Blob hay URL `blob:`) — `RecordCompare.test.tsx`; kiểm: fail hoặc xanh sẵn (ghi rõ)
- [x] 4.4 GREEN (không cần code mới): chỉ sửa nếu 4.3 đỏ; kiểm: test 4.3 pass

## 5. Refactor và kiểm chứng

- [x] 5.1 REFACTOR khi đã xanh; self-review theo CLAUDE.md §0, §2, §6 (class JSX chỉ layout), §7 (focus, ≥44px, `prefers-reduced-motion`); file < 300 dòng
- [x] 5.2 Verify: `pnpm typecheck && pnpm lint && pnpm test:run`, rồi `pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts` (có đổi CSS). Không cần `content:check`, chưa có e2e (nội dung dạng "nói" chưa soạn: S7.1)
- [x] 5.3 Tick toàn bộ task; PR ghi `Spec PR: #95`, `Refs #30` (S5.1 làm xong mọi AC nhưng dạng bài chưa gắn vào bài học: chốt `Closes`/`Refs` theo BA)
