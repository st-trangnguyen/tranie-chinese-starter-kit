# 02 · Design: Roadmap

> Trạng thái: **Đã chốt** · Ngày: 2026-10-27
> Liên quan: [Business flow](business-flows.md) · [Epic & story](epics-stories.md) · [AI Level](../06-ai-practice/roadmap-ai-levels.md)

## Nguyên tắc

Chia thành các bản phát hành nhỏ để **người làm app học được ngay trong lúc app vẫn đang được xây**. Học hết giai đoạn Nhập môn mất khoảng 2–3 tuần, nên bản HSK 1 cần làm xong trước khi người học hết Nhập môn.

## Các bản phát hành

| Bản | Tên | Người học dùng được gì | Tiêu chí xong | Epic |
|---|---|---|---|---|
| **0.1** | Nhập môn | Cài PWA, xem lộ trình, học 12 bài Pinyin/nét/bộ thủ: nghe chọn thanh, phân biệt âm, gõ pinyin, ghi âm so với mẫu, xem thứ tự nét. Tiến độ lưu trên máy. **Chưa có SRS.** | Học hết giai đoạn Nhập môn trên điện thoại, kể cả khi offline | E1–E8 |
| **0.2** | HSK 1 hoàn chỉnh | Ôn SRS hằng ngày (FSRS), đủ 5 dạng bài (từ mới, ngữ pháp, hội thoại, viết chữ, kiểm tra mở khóa), 15 chủ đề, kiểm tra cuối cấp, tải offline theo chủ đề, streak, export/import tiến độ | Xong HSK 1 (500 từ), SRS xếp lịch đúng, chuyển tiến độ giữa điện thoại và máy tính bằng file | E9–E11 + phần 0.2 của E3, E6, E8 |
| **0.3** | HSK 2 | Thêm nội dung HSK 2, bài nghe và đọc dài hơn, hội thoại theo tình huống | Xong HSK 2 | Tách epic khi tới lượt |
| **0.4** | HSK 3 | Tương tự, cho HSK 3 | Xong HSK 3 | Tách epic khi tới lượt |
| **0.5** | HSK 4 | Tương tự, cho HSK 4 | Đạt mục tiêu giao tiếp ổn | Tách epic khi tới lượt |
| **1.0** | Chia sẻ | Tài khoản, đồng bộ nhiều thiết bị, mời người khác dùng | Có ít nhất một người khác học được trên app | Tách epic khi tới lượt |

## Thứ tự làm

- **0.1:** E1 → E2 → E3 → E4 → E5 → E6 → E8 → E7. E7 (soạn nội dung) chạy song song từ sau E2.
- **0.2:** E9 → E10 → phần 0.2 của E3, E6, E8 → E11.

## Ghi chú

- Bản 0.2 gộp toàn bộ HSK 1 (ra một lần cho cả 15 chủ đề) thay vì chia đôi.
- SRS chưa có ở 0.1 vì giai đoạn Nhập môn chủ yếu luyện thanh điệu và phát âm, lượng cần nhớ còn ít. Để SRS sang 0.2 giúp 0.1 ra sớm hơn.
- Nếu đến HSK 4 audio quá nặng để lưu trong git thì chuyển audio sang Cloudflare R2 (xem [Architecture](../03-architecture.md)).
