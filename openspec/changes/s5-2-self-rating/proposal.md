# Proposal: S5.2 Tự đánh giá

Story **S5.2 Tự đánh giá · F6** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s52-tự-đánh-giá--f6)) ·
GitHub issue [#31](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/31). Bản 0.1.

Refs #31

## Why

Là người học, tôi muốn tự đánh giá phát âm của mình để ghi nhận kết quả bài. Phát âm không có đáp án máy chấm chắc chắn, nên người học
tự chọn mức. Đây là story làm dạng bài "nói" thành một câu **hoàn chỉnh** trong khung chạy bài: câu chỉ xong khi người học chọn mức, và mức
đó quyết định câu tính đúng hay sai.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "nói" (chỉ nhận props: chữ, pinyin, nghĩa, audio mẫu) gồm khối ghi âm của S5.1 và 3 nút đánh giá, đăng ký vào registry | `shared/components/exercises/` |
| Quy tắc: mức nào tính đúng, mức nào tính sai | `shared/services/` Phần 2 (thuần, kèm comment "Rule: …") |
| Nạp từ/câu của câu "nói" và đưa vào dạng bài qua props | `pages/lesson/hooks/`, `shared/services/content.service.ts` (đã có từ S4.4) |
| i18n, style BEM (mỗi mức có nhãn chữ, không chỉ màu) | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- Câu "nói" hiện chữ Hán, pinyin, nghĩa tiếng Việt, khối ghi âm và so sánh (S5.1) và 3 nút: **Chưa đúng**, **Gần đúng**, **Đúng**.
- Người học chọn mức khi nào muốn; **không bắt buộc ghi âm trước** (để không kẹt khi không có mic, xem S5.4).
- Chọn mức thì câu được chấm ngay, hiện kết quả và nút "Tiếp tục" như các dạng bài khác. Đã chọn thì không đổi được.
- Cách tính vào điểm của bài:

| Mức | Tính vào điểm |
|---|---|
| Đúng | Câu đúng |
| Gần đúng | Câu sai |
| Chưa đúng | Câu sai |

- Câu tính sai thì hiện chữ, pinyin và nghĩa của câu mẫu làm phần giải thích (như các dạng bài khác của S3.2).
- Màn tổng kết (S3.4) và bài kiểm tra (S3.5, S3.6) dùng kết quả này như các câu khác.

## Không làm (out of scope)

- Khối ghi âm → **S5.1**; chấm tự động → **S5.3**; không có mic → **S5.4**.
- Lưu mức đánh giá riêng (Chưa đúng/Gần đúng/Đúng) lâu dài hoặc thống kê theo mức: chỉ ảnh hưởng đúng/sai của câu.
- Chuyển câu sai thành thẻ ôn tập → **S9.4**.
- Dạng Đóng vai → **S10.7**.

## Dependencies

- **S5.1** (code trước): khối ghi âm và so sánh dùng trong dạng bài này.
- **S4.4**: dạng bài nhận từ/câu đã tra sẵn qua props, nút Nghe mẫu.
- **S3.2, S3.4, S3.5** (đã archive): khung chạy bài, tổng kết, bài kiểm tra tính điểm theo đúng/sai của từng câu.

## Capabilities

### New Capabilities
- `speak-rating`: câu "nói" kết thúc bằng tự đánh giá 3 mức; mức quyết định câu đúng hay sai trong điểm bài.

### Modified Capabilities
- (không có)

## Câu hỏi mở

1. **"Gần đúng" tính thế nào vào điểm?** AC2 chỉ nói "được tính vào điểm", không nói mức nào được bao nhiêu. Khung điểm hiện tại chỉ có đúng/sai
   theo câu ("Đúng 4 / 5 câu"), nên đề xuất trong spec: chỉ **Đúng** tính đúng, "Gần đúng" tính sai. Phương án khác: "Gần đúng" tính nửa câu
   (phải đổi cách hiển thị điểm và ngưỡng 80% của bài kiểm tra). BA quyết định.
2. **Có bắt buộc ghi âm trước khi chọn mức không?** Đề xuất không bắt buộc (xem What Changes). BA xác nhận.
3. **Dạng bài "nói" chỉ chạm tới một từ hay cả câu?** Nội dung cho phép cả hai (`wordId` hoặc `sentenceId`); spec coi như nhau.
4. Chưa có e2e vì nội dung Nhập môn dùng dạng "nói" chưa soạn (S7.1).

## Impact

- Code mới: dạng bài "nói" (+ test); quy tắc mức → đúng/sai (+ test).
- Code sửa: registry dạng bài, hook chạy bài (nạp từ/câu cho câu "nói"), i18n, style.
- Không đổi schema nội dung, không đổi IndexedDB, không thêm dependency.
- Tầng test: quy tắc mức → điểm ở `shared/services` Phần 2; dạng bài ở Vitest + Testing Library.
