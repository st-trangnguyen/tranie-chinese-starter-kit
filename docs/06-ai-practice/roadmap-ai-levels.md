# 06 · AI Practice: Roadmap theo AI Level

> Trạng thái: **Đã chốt** · Ngày: 2026-11-04
> Liên quan: [Roadmap](../02-design/roadmap.md) · [Epic & story](../02-design/epics-stories.md)

## Nguyên tắc

- Mỗi chặng xây app cũng là một chặng nâng level dùng AI khi phát triển.
- Mỗi level có một năng lực chính. Tool của level sau dùng sớm được, nhưng **tới level đó thì
  bắt buộc**. Level gán cho một epic là **level bắt buộc tối thiểu** khi làm epic đó.
- Dùng L1, L2, L5, L6, L8. **Bỏ L3 Plan-first, L4 Isolation, L7 Parallel.**
- Cách phân bổ:
  1. **Level chỉ tăng, theo đúng thứ tự làm** trong [roadmap](../02-design/roadmap.md)
     (E1 → E2 → E3 → E4 → E5 → E6 → E8 → E7 → E9 → …), vì không luyện được L8 khi hàng rào
     của level trước chưa có.
  2. **Mỗi level nhận epic có bản chất khớp nhất** với năng lực của nó.
  3. **Mỗi level chỉ cần đủ số lần lặp để đạt tiêu chí ra trường** (khoảng 4–8 story). Mọi thứ
     sau đó dồn sang **L8** để có nhiều thời gian trải nghiệm nhất.

## Thang level đang dùng

| Phase | Level | Năng lực | Giảm effort |
|---|---|---|---|
| 1 · Foundation | L1 Basic setup | Sẵn sàng từ ngày đầu | 25% |
| 1 · Foundation | L2 Advanced setup | Môi trường được kiểm soát | 35% |
| 2 · Discipline | L5 Enforcement | Các check không bao giờ quên | 50% |
| 2 · Discipline | L6 Spec + TDD | Spec định nghĩa thế nào là xong | 60% |
| 3 · Scale | L8 Autonomous | Agent giao việc, người quyết định | 70% |
| — | L8+ Beyond | Chân trời, chưa là level | — |

## Map vào roadmap

| Level | Epic | Story | Vì sao khớp | Tiêu chí ra trường |
|---|---|---|---|---|
| **L1** ✅ | Monorepo, CLAUDE.md, rules | — | Đã xong | Agent đọc được chuẩn dự án ngay ngày đầu |
| **L2** | **E1** Nền tảng PWA · **Design system** | 4 | Thuần cấu hình môi trường: build, PWA, design token, preview | Agent tự chạy, tự xem preview, không phải hỏi quyền lặt vặt |
| **L5** | **E2** Pipeline nội dung | 5 | Mọi AC của E2 là kiểm tra: sai schema báo lỗi kèm file và dòng, thiếu nghĩa cảnh báo, thiếu dữ liệu nét cảnh báo | `content:check`, lint Dependency Rule, typecheck, test chạy trong hook và CI |
| **L6** | **E3** Lộ trình & chạy bài (S3.1–3.4) · **E4** Nghe & Pinyin | 8 | Business rule đầu tiên: khóa/mở/xong, chấm điểm, mở khóa; đổi `ni3` → `nǐ`, tô chỗ sai theo thanh mẫu / vận mẫu / thanh điệu | Mẫu spec → test viết trước → service 3 phần, đã lặp qua 2 epic để L8 dùng lại |
| **L8** | **E5** Luyện nói · **E6** Luyện viết (S6.1–6.2) · **E8** Trang chủ & Cài đặt (S8.1–8.2) · **E7** Nội dung Nhập môn | 9 | Hết bản 0.1: agent nhận trọn từng epic, bạn duyệt PR | — |
| **L8** | Toàn bộ **0.2**: **E9** SRS · **E10** Bài tập · phần 0.2 của E3/E6/E8 (S3.5, S3.6, S6.3, S8.3, S8.4, S8.5) · **E11** Nội dung HSK 1 | 25 | Tính năng theo mẫu spec + test của L6; nội dung theo `content:check` của L5 | — |
| **L8** | **0.3** HSK 2 · **0.4** HSK 3 · **0.5** HSK 4 | chưa tách | Lặp lại cách làm của E11 cho từng cấp; bạn duyệt nghĩa tiếng Việt và ngữ pháp | — |
| **L6** (quay lại) | **1.0** Chia sẻ | chưa tách | Tài khoản, đồng bộ: vùng bảo mật, người quyết định thiết kế | — |
| **L8+** | AI trong app (sinh nội dung lúc học, hội thoại tự do với AI) | — | Ngoài MVP, xem [Brainstorm §6](../01-brainstorm.md) | — |

**Tỷ trọng:** L2 4 story · L5 5 · L6 8 · L8 34 (khoảng 67% của 51 story) + 3 bản HSK 2–4.

## Cách làm ở L8

- Agent nhận **trọn một epic mỗi lần**, làm tuần tự (không có L7 nên không chạy song song).
- Brief cho agent gồm: AC lấy nguyên văn từ `epics-stories.md`, phạm vi file được sửa, và định
  nghĩa xong = CI xanh + business rule có test viết trước theo mẫu của L6.
- Bạn chỉ quyết định: trả lời khi agent bị kẹt, duyệt PR, duyệt nội dung.

## Rủi ro

- **L8 chỉ an toàn khi hàng rào đã chắc.** Tiêu chí ra trường của L5 (CI) và L6 (mẫu spec +
  test) là điều kiện bắt buộc trước khi sang E5. Thiếu cái nào thì phải review tay mọi thứ, thực
  chất vẫn đang làm L2.
- **Nội dung soạn tuần tự sẽ chậm.** E11 (15 chủ đề) và HSK 2–4 soạn lần lượt từng chủ đề. Nếu
  quá chậm, có thể bật L7 riêng cho phần nội dung: file YAML mỗi chủ đề tách rời nên gần như không
  conflict.
- **Bỏ L3.** E2 (schema, audio dựng theo hash) và E3 (quy tắc mở khóa) thiếu bước thiết kế trước.
  Nên thêm mục "thiết kế trước khi code" vào `CLAUDE.md` §8.
