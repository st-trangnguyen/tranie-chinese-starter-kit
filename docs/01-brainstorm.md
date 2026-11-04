# 01 · Brainstorm: Chinese Starter Kit

> Trạng thái: **Đã chốt** · Ngày: 2026-10-27
> Bước tiếp theo: [02 · Design](02-design/roadmap.md) → [03 · Architecture](03-architecture.md)

## 1. Mục tiêu

Xây một web app **cài được thành PWA** để học tiếng Trung **từ số 0**. App có lộ trình rõ ràng, mục tiêu cuối là **nghe, nói, đọc, viết và giao tiếp ổn**, tương đương khoảng **HSK 3–4** (2.000–3.000 từ, mất chừng 1–1,5 năm).

## 2. Người dùng

- **Trước mắt:** chính người làm app, vừa học vừa xây.
- **Sau này:** chia sẻ cho bạn bè hoặc cộng đồng. Vì vậy kiến trúc phải mở rộng được (thêm tài khoản, đồng bộ) mà không phải viết lại app.

## 3. Thói quen học (ràng buộc thiết kế)

- Học trên **điện thoại và máy tính**: ôn nhanh trên điện thoại, học bài mới và đọc dài trên máy tính. Giao diện phải responsive.
- Mỗi ngày **30–60 phút**.

## 4. Các quyết định đã chốt

| Chủ đề | Quyết định |
|---|---|
| Nguồn nội dung | **Data mở + bài soạn sẵn**: danh sách từ HSK 3.0, từ điển CC-CEDICT / CVDICT, dữ liệu nét chữ hanzi-writer-data. Bài học và hội thoại soạn trước thành file (có AI hỗ trợ khi soạn), giải thích bằng **tiếng Việt**. App chạy **offline hoàn toàn**. |
| Phạm vi MVP | **Giai đoạn Nhập môn** (thanh điệu, pinyin, nét, bộ thủ) + **HSK 3.0 cấp 1** (500 từ / 300 chữ), đủ 4 kỹ năng. Các cấp sau chỉ cần thêm file nội dung. |
| Audio | **TTS neural tạo sẵn** lúc build (edge-tts), đóng gói vào app, nghe được offline, chất lượng đồng đều. |
| Luyện nói | **Ghi âm rồi nghe so với mẫu**. Khi có mạng thì chấm thêm bằng nhận dạng giọng nói của trình duyệt (Web Speech). |
| Ôn tập | **SRS** (ôn tập ngắt quãng) dùng thuật toán **FSRS**: app tự tính lúc nào cần ôn lại từng từ, dựa trên mức độ sắp quên. |
| Kiến trúc tổng thể | **PWA tĩnh, local-first**: không có backend, tiến độ học lưu trên máy. Lớp lưu trữ được tách riêng để sau này gắn đồng bộ. |
| Ngôn ngữ giao diện | Tiếng Việt. |

## 5. Lộ trình học (khung)

**Giai đoạn 0: Nhập môn Pinyin & chữ Hán (2–3 tuần, khoảng 12 bài)**
- 4 thanh điệu và thanh nhẹ, 21 thanh mẫu, khoảng 36 vận mẫu, quy tắc biến điệu (3-3, 不, 一).
- Nét cơ bản, quy tắc thứ tự nét, khoảng 30 bộ thủ phổ biến.
- Bài tập: nghe chọn thanh, phân biệt cặp âm gần nhau, nghe gõ pinyin, đọc theo mẫu và ghi âm.

**Giai đoạn 1: HSK 1 (khoảng 10–12 tuần)**
- Khoảng 15 **chủ đề** (chào hỏi, giới thiệu, gia đình, số đếm, ngày giờ, ăn uống, mua sắm, đi lại…).
- Mỗi chủ đề có 5 **bài**, mỗi bài 10–15 phút:
  1. **Từ mới**: chữ Hán, pinyin, nghĩa tiếng Việt, audio, câu ví dụ.
  2. **Ngữ pháp**: 1–2 mẫu câu giải thích bằng tiếng Việt, bài tập sắp xếp câu và điền chỗ trống.
  3. **Hội thoại**: nghe hiểu, đóng vai, shadowing.
  4. **Viết chữ**: tập viết theo nét có hướng dẫn, sau đó viết không gợi ý.
  5. **Ôn tập & kiểm tra**: trộn cả 4 kỹ năng. Đạt từ 80% trở lên thì mở chủ đề tiếp theo.

**Buổi học mỗi ngày:** ôn SRS các thẻ đến hạn → bài mới tiếp theo trên lộ trình → luyện tự do nếu còn thời gian.

Các cấp HSK 2–4 dùng lại cấu trúc chủ đề và bài như trên.

## 6. Ngoài phạm vi MVP

- Tài khoản, đăng nhập, đồng bộ giữa các thiết bị (để dành cho bản 1.0).
- Nội dung HSK 2–4.
- Sinh nội dung bằng AI trong lúc dùng app, hội thoại tự do với AI.
- Bài test xếp lớp cho người đã biết tiếng Trung.

## 7. Giả định

- Trình duyệt chính là Chrome (Android, desktop) và Safari (iOS). Chấm phát âm tự động chỉ chạy được trên những trình duyệt có Web Speech.
- Dữ liệu mở được dùng đúng theo giấy phép của từng nguồn, kèm file LICENSE trong `content/data-raw/`.
