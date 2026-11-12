# Proposal: S4.4 Nghe lại và nghe chậm

Story **S4.4 Nghe lại và nghe chậm · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s44-nghe-lại-và-nghe-chậm--f3)) ·
GitHub issue [#29](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/29). Bản 0.1.

Refs #29

## Why

Là người học, tôi muốn nghe lại nhiều lần và nghe chậm để nghe rõ. App chưa phát được audio nào, và màn chạy bài chưa biết
từ (pinyin, file audio) của từng câu. S4.4 là story code **đầu tiên** của E4: làm bộ phát audio dùng chung (nút Nghe, nghe lại,
nghe chậm) và cho mỗi câu biết từ/câu nó dùng, để S4.1–S4.3 và các dạng bài nghe sau (E5, E10) dùng lại.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Phát mp3, đổi tốc độ, dừng khi rời màn (hạ tầng) | `core/services/audio.service.ts` |
| Hook phát audio cho component (đang phát, lỗi, tốc độ) | `core/hooks/useAudioPlayer.ts` |
| Nút "Nghe" và công tắc "Nghe chậm" dùng chung | `shared/components/` |
| Hằng số tốc độ (1x, 0.75x) | `core/constants/` |
| Nạp `words.json`, `sentences.json` (validate Zod) và gắn từ/câu vào từng câu của bài | `shared/services/content.service.ts` |
| Truyền từ/câu đã tra sẵn cho dạng bài qua props | `shared/components/exercises/exercise.types.ts`, `pages/lesson/hooks/` |
| i18n, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Nút **Nghe** phát audio của từ/câu; bấm bao nhiêu lần cũng được, kể cả sau khi câu đã chấm.
- Bấm Nghe khi đang phát thì **phát lại từ đầu**, không chồng hai luồng âm. Sang câu khác thì audio đang phát dừng.
- Công tắc **Nghe chậm** đổi tốc độ sang 0.75x; tắt thì về 1x. Trạng thái giữ **suốt một bài**, mở bài mới về 1x.
- Audio **không tự phát** khi câu hiện; người học bấm Nghe.
- Audio không phát được: hiện thông báo, màn vẫn dùng được.
- Kỹ thuật (không có Scenario riêng): màn chạy bài nạp từ/câu theo ID của câu và đưa vào dạng bài qua props, vì dạng bài chỉ nhận props
  (CLAUDE.md §2). Đổi hợp đồng dạng bài của S3.2.

## Không làm (out of scope)

- Lưu tốc độ nghe lâu dài, tùy chọn tự phát → **S8.2** (Cài đặt).
- Tốc độ khác 1x và 0.75x.
- Tải audio offline → **S8.4**.
- Ghi âm và phát bản ghi → **E5**.
- Đăng ký dạng bài nào vào khung chạy bài → **S4.1, S4.2, S4.3**.

## Dependencies

- **S3.2** (đã archive): khung chạy bài, hợp đồng dạng bài (đổi để nhận từ/câu đã tra).
- **S2.3 / S2.4** (đã archive): `words.json`, `sentences.json`, file mp3.
- **S4.1, S4.2, S4.3** code sau S4.4. Thứ tự code đã chốt: S4.4 → S4.1 → S4.2 → S4.3.

## Capabilities

### New Capabilities
- `audio-replay`: nghe, nghe lại không giới hạn và nghe chậm 0.75x cho câu nghe.

### Modified Capabilities
- (không có)

## Quyết định đã chốt (2026-11-12)

1. Không tự phát khi câu hiện (iOS Safari chặn phát khi chưa có thao tác người dùng).
2. "Nghe chậm" giữ suốt một bài; mở bài mới về 1x. Lưu lâu dài để S8.2.
3. Bấm Nghe khi đang phát thì phát lại từ đầu.
4. Chữ trên nút: "Nghe", "Nghe chậm".
5. Dạng bài nhận từ/câu đã tra sẵn qua props; màn chạy bài lo việc nạp.

## Câu hỏi mở

1. Chưa có e2e vì nội dung Nhập môn dùng dạng bài nghe chưa soạn (S7.1); test ở tầng hook/component.

## Impact

- Code mới: `audio.service.ts`, `useAudioPlayer.ts`, nút Nghe/Nghe chậm dùng chung, hằng số tốc độ.
- Code sửa: `content.service.ts` (nạp từ/câu), hợp đồng dạng bài, hook chạy bài, i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
