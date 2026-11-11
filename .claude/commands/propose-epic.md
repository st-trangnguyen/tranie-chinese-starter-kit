---
name: "Propose Epic"
description: "Propose OpenSpec changes cho một epic (hoặc một story) từ docs/02-design/epics-stories.md"
allowed-tools: Bash(openspec:*), Bash(git:*), Read, Write, Edit
category: "Workflow"
tags: ["workflow", "openspec", "epic"]
---

Tạo OpenSpec change cho epic/story người dùng chỉ định, lấy AC từ
`docs/02-design/epics-stories.md`.

**Input**: `$ARGUMENTS` — một trong các dạng:
- `3`, `E3`, `epic 3` → mọi story của epic E3.
- `S3.2` hoặc `3.2` → chỉ story S3.2.
- `3 3.1-3.2` hoặc `E3 S3.1,S3.3` → chỉ các story được liệt kê.

Không có input thì hỏi người dùng muốn epic nào (kèm bảng "Tổng quan epic").

**Quy trình**

1. Đọc `docs/02-design/epics-stories.md`, tìm đúng phần epic/story. Không tìm thấy
   thì dừng và báo lại, đừng đoán.
2. Liệt kê các story sẽ propose (ID, tên). Bỏ qua story đã có change trong
   `openspec/changes/` hoặc `openspec/changes/archive/` (báo rõ là bỏ qua).
3. Với **từng story**, theo thứ tự S<epic>.1, S<epic>.2, …:
   - Đặt change id: `s<epic>-<n>-<slug>` (slug kebab-case, ngắn, từ tên story).
   - Chạy workflow `openspec-propose` (tức `/opsx:propose <change-id>`) với:
     - Mỗi AC của story chép **nguyên văn** thành một Requirement + Scenario,
       ID `S<epic>.<n>-AC<k>`.
     - Ghi layer đích theo bảng §1 của `CLAUDE.md` vào `design.md`.
     - Gắn Scenario → tầng test theo `docs/05-standards/spec-driven.md`.
     - Story kỹ thuật/nội dung thuần (không có Scenario kiểm thử được) thì nói rõ
       thuộc nhóm ngoại lệ (docs/config/asset) trong proposal.
   - Story có AC tham chiếu story khác (vd "S8.2 AC1") thì ghi dependency vào
     `proposal.md`, không tự mở rộng scope.
4. Khi xong tất cả: in bảng `change-id | số Scenario | dependency | câu hỏi mở`,
   rồi `pnpm exec openspec validate --all --strict`.

**Ranh giới (bắt buộc)**
- Chỉ tạo artifact lập kế hoạch trong `openspec/changes/`. **Không sửa code**,
  không viết test, không bắt đầu apply.
- Chạy trên nhánh `spec/s<epic>-<n>-<slug>` (mỗi story một nhánh, một PR spec). Đây là **pha Spec**
  của CLAUDE.md §8: PR spec chỉ chứa `openspec/`, ghi `Spec PR: N/A`.
- Sau khi propose xong, **dừng chờ PR spec được review và merge vào `main`**. Chỉ khi đó dev mới
  cắt nhánh `feat/…` và `/opsx:apply` (PR code trỏ `Spec PR: #<số>`).
- Không chạy `/opsx:archive`: workflow tự mở PR archive sau khi PR code merge.
- Không rõ business rule hoặc AC mâu thuẫn thì ghi vào "câu hỏi mở", đừng tự quyết.
- Không commit trừ khi người dùng yêu cầu.
