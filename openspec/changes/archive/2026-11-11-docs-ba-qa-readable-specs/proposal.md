## Why

Spec hiện tại trộn hành vi nghiệp vụ với chi tiết cài đặt (route, "dữ liệu tiến độ không hợp lệ",
mã F5), nên BA/QA phải tự lọc mới biết app làm gì. Luật viết mới (`openspec/config.yaml`,
`docs/05-standards/spec-driven.md` §3) đã được thêm; change này áp dụng luật đó cho spec duy nhất
đang có làm mẫu.

Không thuộc story nào trong backlog, nên không có issue để `Refs`. Thiết kế:
`docs/04-specs/2026-11-11-ba-qa-readable-specs.md`.

## What Changes

- Viết lại cách nói của `learning-path`: bỏ route và mã nội bộ khỏi Requirement/Scenario.
- Quy tắc trạng thái bài (khóa / đang mở / đã xong) chuyển từ đoạn văn dài sang bảng.
- Đổi tên một Requirement cho đúng nội dung: "Mỗi bài có đúng một trạng thái".
- Giữ nguyên hành vi, 9 Scenario và ID `S3.1-AC1..3`, nên không test nào đổi.

## Layer đích

Không có code. Chỉ docs/spec: `openspec/specs/learning-path/spec.md` (qua archive).

## Capabilities

### New Capabilities

Không có.

### Modified Capabilities

- `learning-path`: đổi cách diễn đạt Requirement/Scenario cho BA/QA đọc; hành vi không đổi.

## Ngoài phạm vi

- Đổi hành vi app hoặc test.
- Lint tự động từ khoá kỹ thuật, xuất spec ra HTML/doc.

## Impact

Chỉ `openspec/specs/learning-path/spec.md`. `grep -rn "S3.1-AC" apps` vẫn ra 13 test như trước.
