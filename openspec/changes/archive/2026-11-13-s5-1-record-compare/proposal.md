# Proposal: S5.1 Ghi âm và so sánh

Story **S5.1 Ghi âm và so sánh · F6** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s51-ghi-âm-và-so-sánh--f6)) ·
GitHub issue [#30](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/30). Bản 0.1.

Refs #30

## Why

Là người học, tôi muốn ghi âm giọng mình và nghe cạnh bản mẫu để tự nhận ra chỗ khác. App chưa có gì để ghi âm hay phát lại bản ghi.
Nội dung đã có dạng bài "nói" (`speak`, trỏ tới một từ hoặc một câu) nhưng chưa có màn cho dạng này. S5.1 là story code **đầu tiên** của E5:
làm khối "ghi âm và so sánh" (nút ghi, nút nghe mẫu, nút nghe bản ghi) và hạ tầng ghi âm, để S5.2–S5.4 và dạng Đóng vai (S10.7) dùng lại.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Ghi âm bằng micro, giữ bản ghi trong bộ nhớ, phát lại bản ghi, giải phóng khi rời (hạ tầng) | `core/services/recorder.service.ts` |
| Hook ghi âm cho component (đang ghi, đã có bản ghi, lỗi) | `core/hooks/useRecorder.ts` |
| Khối "ghi âm và so sánh" dùng chung (Ghi âm / Dừng, Nghe mẫu, Nghe bản ghi) | `shared/components/` |
| Phát bản mẫu | `core/hooks/useAudioPlayer.ts` của **S4.4** |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Khối ghi âm có nút **Ghi âm**; bấm để bắt đầu, bấm lại (nút đổi thành **Dừng**) để dừng.
- Sau khi dừng có **Nghe bản ghi**; luôn có **Nghe mẫu**. Mỗi bản một nút, nghe lại bao nhiêu lần tùy ý.
- Ghi lại lần nữa thì bản ghi mới thay bản cũ.
- Bản mẫu và bản ghi không phát chồng nhau; bắt đầu ghi thì audio đang phát dừng.
- Bản ghi chỉ nằm trong bộ nhớ khi đang làm bài. **Không lưu** vào máy; rời bài là mất.
- Kỹ thuật (không có Scenario riêng): thêm hạ tầng ghi âm; giải phóng micro và bộ nhớ của bản ghi khi dừng hoặc rời màn.

## Không làm (out of scope)

- Đăng ký dạng bài "nói" vào khung chạy bài, tự đánh giá, tính điểm → **S5.2**. S5.1 chỉ giao khối ghi âm và hạ tầng; dạng bài chưa đăng ký
  nên câu "nói" vẫn được bỏ qua (biện pháp tạm của S3.2) cho tới khi S5.2 merge.
- Chấm tự động bằng nhận diện giọng → **S5.3**.
- Mic bị chặn, không có mic, hướng dẫn cấp quyền, chế độ "đọc to rồi tự chấm" → **S5.4**. Ở S5.1, bấm Ghi âm mà không ghi được thì chỉ cần
  không làm hỏng màn.
- Lưu bản ghi lâu dài (cố ý không làm: xem AC3). Export tiến độ chưa có (**S8.5**); khi làm S8.5 phải giữ bản ghi ngoài file xuất.
- Tốc độ nghe mẫu, Nghe chậm cho bản mẫu → dùng lại của **S4.4**.

## Dependencies

- **S4.4** (code trước): bộ phát audio dùng chung, dạng bài nhận từ/câu đã tra sẵn qua props (bản mẫu lấy từ đây).
- **S3.2** (đã archive): khung chạy bài.
- **S2.3 / S2.4** (đã archive): nội dung và audio mẫu.
- **S5.2, S5.3, S5.4, S10.7** dùng lại khối này. Thứ tự code đề xuất: S5.1 → S5.2 → S5.3 → S5.4.

## Capabilities

### New Capabilities
- `speak-record`: ghi âm giọng người học, nghe lại bản ghi cạnh bản mẫu, bản ghi không được lưu.

### Modified Capabilities
- (không có)

## Câu hỏi mở

1. **Bản ghi có giữ khi sang câu "nói" kế tiếp không?** AC3 chỉ nói "rời bài". Đề xuất trong spec: mỗi câu có bản ghi riêng và bản ghi
   của câu trước không còn khi sang câu sau (đơn giản, không giữ nhiều bản trong bộ nhớ). BA xác nhận.
2. **Có giới hạn thời lượng một bản ghi không?** Chưa có AC. Đề xuất không giới hạn ở 0.1 (câu mẫu ngắn). BA xác nhận.
3. Chưa có e2e vì nội dung Nhập môn dùng dạng "nói" chưa soạn (S7.1) và trình duyệt kiểm thử không có micro thật; test ở tầng hook/component
   với micro giả.

## Impact

- Code mới: `recorder.service.ts`, `useRecorder.ts`, khối ghi âm và so sánh dùng chung (+ test).
- Code sửa: i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
- Tầng test: Vitest cạnh file (hook, component); Playwright chưa có.
