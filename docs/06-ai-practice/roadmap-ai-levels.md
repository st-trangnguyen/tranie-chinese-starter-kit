# 06 · AI Practice: Roadmap theo AI Level

> Trạng thái: **Đã chốt** · Ngày: 2026-11-04
> Liên quan: [Roadmap](../02-design/roadmap.md) · [Epic & story](../02-design/epics-stories.md)

## Nguyên tắc

- Mỗi chặng xây app cũng là một chặng nâng level dùng AI khi phát triển.
- Mỗi level có một năng lực chính. Tool của level sau dùng sớm được, nhưng **tới level đó thì
  bắt buộc**. Level gán cho một epic là **level bắt buộc tối thiểu** khi làm epic đó.
- Bỏ **L3 Plan-first** và **L4 Isolation**.
- **L5, L6, L7 mỗi level 1 epic**, chỉ để dựng nền. Dồn phần còn lại sang **L8** để luyện nhiều
  nhất ở level này.

## Thang level đang dùng

| Phase | Level | Năng lực | Giảm effort |
|---|---|---|---|
| 1 · Foundation | L1 Basic setup | Sẵn sàng từ ngày đầu | 25% |
| 1 · Foundation | L2 Advanced setup | Môi trường được kiểm soát | 35% |
| 2 · Discipline | L5 Enforcement | Các check không bao giờ quên | 50% |
| 2 · Discipline | L6 Spec + TDD | Spec định nghĩa thế nào là xong | 60% |
| 3 · Scale | L7 Parallel | Làm nhiều hơn, chất lượng giữ nguyên | 65% |
| 3 · Scale | L8 Autonomous | Agent giao việc, người quyết định | 70% |
| — | L8+ Beyond | Chân trời, chưa là level | — |

## Map vào roadmap

### Phase 1 · Foundation — phần lớn bản 0.1

| Level | Epic / tính năng |
|---|---|
| **L1** ✅ | Dựng monorepo, CLAUDE.md, rules |
| **L2** | **E1** Nền tảng PWA · **E2** Pipeline nội dung · **Design system** · **E3** Lộ trình & chạy bài (S3.1–3.4) · **E4** Nghe & Pinyin · **E5** Luyện nói · **E6** Luyện viết (S6.1–6.2) · **E8** Trang chủ & Cài đặt (S8.1–8.2) |

### Phase 2 · Discipline — cuối 0.1, đầu 0.2

| Level | Epic | Kết quả phải để lại cho L8 |
|---|---|---|
| **L5** | **E7** Nội dung Nhập môn | CI chặn được mọi vi phạm Dependency Rule và lỗi nội dung (`content:check`, lint, typecheck, test) |
| **L6** | **E9** Ôn tập SRS | Mẫu spec + test cho business rule (FSRS, test viết trước) để agent L8 làm theo |

### Phase 3 · Scale — từ 0.2 tới 1.0

| Level | Epic / bản | Ghi chú |
|---|---|---|
| **L7** | **E10** Bài tập Từ vựng / Ngữ pháp / Đọc / Hội thoại | Dựng sẵn registry 9 `kind`, mỗi agent làm một dạng bài. Để lại cách chia việc song song đã chạy thử |
| **L8** | **Phần 0.2 của E3/E6/E8** (S3.5, S3.6, S6.3, S8.3, S8.4, S8.5) | Tính năng app: agent tự làm theo mẫu spec + test của E9, người duyệt PR |
| **L8** | **E11** Nội dung HSK 1 | Nội dung: agent soạn từng chủ đề, người duyệt nghĩa tiếng Việt và ngữ pháp |
| **L8** | **0.3** HSK 2 · **0.4** HSK 3 · **0.5** HSK 4 | Lặp lại cách làm của E11 cho từng cấp |
| **L6** (quay lại) | **1.0** Chia sẻ | Tài khoản, đồng bộ: vùng bảo mật, người quyết định thiết kế |
| **L8+** | AI trong app (sinh nội dung lúc học, hội thoại tự do với AI) | Ngoài MVP, xem [Brainstorm §6](../01-brainstorm.md) |

## Rủi ro

- **L8 chỉ an toàn khi hàng rào đã chắc.** L5, L6, L7 mỗi level chỉ có 1 epic, nên kết quả để lại
  của E7, E9, E10 (cột bên trên) là điều kiện bắt buộc trước khi sang L8. Thiếu cái nào thì phải
  review tay mọi thứ, thực chất vẫn đang làm L2.
- **L2 ôm gần hết 0.1.** Phần lớn 0.1 được làm khi chưa có hàng rào tự động, nên phải tự review
  kỹ Dependency Rule cho tới khi L5 vào ở E7.
- **Bỏ L3.** E2 (schema, audio dựng theo hash) và E3 (quy tắc mở khóa) thiếu bước thiết kế trước.
  Nên thêm mục "thiết kế trước khi code" vào `CLAUDE.md` §8.
