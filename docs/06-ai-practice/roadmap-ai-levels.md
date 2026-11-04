# 06 · AI Practice: Roadmap theo AI Level

> Trạng thái: **Đã chốt** · Ngày: 2026-11-04
> Liên quan: [Roadmap](../02-design/roadmap.md) · [Epic & story](../02-design/epics-stories.md)

## Nguyên tắc

- Mỗi chặng xây app cũng là một chặng nâng level dùng AI khi phát triển.
- Mỗi level có một năng lực chính. Tool của level sau dùng sớm được, nhưng **tới level đó thì
  bắt buộc**. Level gán cho một epic là **level bắt buộc tối thiểu** khi làm epic đó.
- Bỏ **L3 Plan-first** và **L4 Isolation**.
- **L5** và **L6** mỗi level tối đa 2 epic.

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
| **L2** | **E1** Nền tảng PWA · **E2** Pipeline nội dung · **Design system** · **E3** Lộ trình & chạy bài (S3.1–3.4) · **E4** Nghe & Pinyin · **E5** Luyện nói · **E6** Luyện viết (S6.1–6.2) |

### Phase 2 · Discipline — từ cuối 0.1 sang đầu 0.2

| Level | Epic | Vì sao chọn |
|---|---|---|
| **L5** | **E7** Nội dung Nhập môn · **E8** Trang chủ & Cài đặt (S8.1–8.2) | E7 là lúc đưa `content:check` vào CI. E8 là epic cuối của 0.1, hợp để khóa chất lượng trước khi ra bản: hook chạy typecheck/lint/test, lint kiểm Dependency Rule |
| **L6** | **E9** Ôn tập SRS · **phần 0.2 của E3/E6/E8** (S3.5, S3.6, S6.3, S8.3, S8.4, S8.5) | Hai khối dày business rule nhất: FSRS, ngưỡng 80% mở khóa, streak, validate file backup. Test viết trước |

### Phase 3 · Scale — từ 0.2 tới 1.0

| Level | Epic / bản | Vì sao hợp |
|---|---|---|
| **L7** | **E10** Bài tập Từ vựng / Ngữ pháp / Đọc / Hội thoại · **E11** Nội dung HSK 1 | E10 gồm nhiều `kind` độc lập, mỗi agent làm một dạng bài. E11 chia theo chủ đề, mỗi agent soạn một chủ đề |
| **L7 → L8** | **0.3** HSK 2 | Bắt đầu giao trọn từng chủ đề cho agent |
| **L8** | **0.4** HSK 3 · **0.5** HSK 4 | Agent tự soạn nội dung từng cấp, người chỉ duyệt nghĩa tiếng Việt và ngữ pháp |
| **L6** (quay lại) | **1.0** Chia sẻ | Tài khoản, đồng bộ: vùng bảo mật, người quyết định thiết kế |
| **L8+** | AI trong app (sinh nội dung lúc học, hội thoại tự do với AI) | Ngoài MVP, xem [Brainstorm §6](../01-brainstorm.md) |

## Rủi ro

- **L2 ôm gần hết 0.1.** Phần lớn 0.1 được làm khi chưa có hàng rào tự động, nên phải tự review
  kỹ Dependency Rule cho tới khi L5 vào. Phương án giảm rủi ro: đổi E2 với E7, tức E2 sang L5
  (vì `content:check` sinh ra từ E2) và E7 về L2.
- **E10 ở L7 mà không có L4.** Các dạng bài nằm ở thư mục riêng nhưng dùng chung file registry
  theo `kind` trong `shared/components/exercises/`. Dựng sẵn registry cho đủ 9 dạng trước rồi mới
  cho các agent chạy song song.
- **Bỏ L3.** E2 (schema, audio dựng theo hash) và E3 (quy tắc mở khóa) thiếu bước thiết kế trước.
  Nên thêm mục "thiết kế trước khi code" vào `CLAUDE.md` §8.
