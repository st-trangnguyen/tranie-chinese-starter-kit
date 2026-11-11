# Spec dễ đọc cho BA/QA

Ngày: 2026-11-11 · Trạng thái: chờ duyệt

## 1. Vấn đề và mục tiêu

Spec OpenSpec (`openspec/specs/`) là tài liệu BA/QA cần đọc để biết app *làm gì*. Hiện nó trộn hành
vi nghiệp vụ với chi tiết cài đặt (route, "dữ liệu tiến độ không hợp lệ", mã F5), nên người không đọc
code phải tự lọc.

**Thành công khi:**
- BA/QA đọc Requirement và Scenario mà không cần hiểu kỹ thuật.
- Dev vẫn test được từng Scenario, tên test vẫn chứa ID `S<epic>.<n>-AC<k>`.
- `pnpm exec openspec validate --all --strict` vẫn qua.

**Ngoài phạm vi:** lint tự động từ khoá kỹ thuật, xuất spec ra HTML/doc (có thể làm sau nếu
"khó truy cập" thành vấn đề thật).

## 2. Thiết kế

Giữ nguyên cấu trúc OpenSpec (Requirement/Scenario, ID, `SHALL`/`MUST` tiếng Anh). Chỉ đổi **luật
viết** và viết lại spec hiện có làm mẫu.

### 2.1 Luật mới cho `rules.specs` trong `openspec/config.yaml`

1. Requirement và Scenario chỉ dùng thuật ngữ người dùng nhìn thấy: màn hình, nút, nhãn, kết quả.
   Không ghi route, tên field/store/hàm, mã nội bộ (F5…), tên thư viện.
2. Quy tắc có nhiều trường hợp thì trình bày bằng bảng trong Requirement, không rải thành câu dài.
3. Chi tiết kỹ thuật để ở `design.md` hoặc trong test. Gặp backtick trong Scenario thì tự hỏi:
   BA/QA có cần biết điều này không?

### 2.2 `docs/05-standards/spec-driven.md` §3

Thêm đoạn "Viết cho BA/QA": cặp ví dụ trước/sau (mục 3) và checklist tự kiểm 4 dòng:
- Có route, tên field, tên store, tên hàm, mã nội bộ trong Requirement/Scenario không?
- Quy tắc nhiều trường hợp đã thành bảng chưa?
- Người không đọc code có hiểu WHEN/THEN không?
- Chi tiết bị bỏ đã nằm trong `design.md` hoặc test chưa?

### 2.3 Viết lại `openspec/specs/learning-path/spec.md`

Làm mẫu theo luật mới. Số Scenario và ID giữ nguyên nên test hiện có không đổi. Spec đã archive
thường chỉ sửa qua `openspec archive`, nên việc này đi qua một change docs-only
(`/opsx:propose`), không sửa tay.

## 3. Ví dụ trước/sau

Requirement chứa quy tắc nghiệp vụ, từ văn xuôi dài sang bảng:

```markdown
### Requirement: Mỗi bài có đúng một trạng thái
Hệ thống SHALL hiện cho mỗi bài một trong ba trạng thái, bằng chữ chứ không chỉ bằng màu:

| Trạng thái | Nhãn hiện ra | Khi nào |
|---|---|---|
| Đã xong | "Đã xong" | Người học đã hoàn thành bài |
| Đang mở | "Đang mở" | Bài đầu tiên của lộ trình, hoặc bài ngay sau một bài đã xong |
| Khóa | "Đã khóa" | Các bài còn lại |
```

Scenario bỏ chi tiết kỹ thuật:

| Trước | Sau |
|---|---|
| THEN app chuyển tới route `/lessons/<id bài>` | THEN người học vào màn học của bài đó |
| WHEN dữ liệu tiến độ đã lưu không hợp lệ | WHEN bài chưa có kết quả học nào đáng tin cậy |
| WHEN mở route `/learning-paths` | WHEN người học mở Lộ trình từ menu |

Route, Zod, IndexedDB chuyển sang `design.md` và nằm trong chính test.

## 4. Kiểm chứng

- `pnpm exec openspec validate --all --strict` qua sau khi viết lại.
- `grep -r "S3.1-AC" apps/web` vẫn ra đủ test như trước (ID không đổi).
- Chạy `pnpm typecheck && pnpm lint && pnpm test:run` để chắc không đụng code.

## 5. Rủi ro

- Viết lại spec đã archive là ngoại lệ so với quy trình. Giảm bằng cách đi qua một change docs-only
  và giữ nguyên ID, số Scenario.
- Bỏ chi tiết khỏi Scenario có thể làm test "mất dấu" điều kiện kỹ thuật. Giảm bằng cách chuyển
  chi tiết đó sang `design.md` thay vì xoá.
