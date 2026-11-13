# Spec: Agent BA / QA / Dev tranh luận spec, người thật duyệt cuối

> Trạng thái: **Đề xuất** · Ngày: 2026-11-13
> Liên quan: [spec-driven.md](../05-standards/spec-driven.md) · [QA review workflow](2026-11-13-qa-review-workflow.md)

## 1. Vấn đề

Pha Spec yêu cầu approve của ba người (BA, QA, Dev). Với đội nhỏ, ba vai thường là một người, nên cổng không có tác
dụng phản biện thật, và người duyệt phải đọc spec thô, đầy chỗ mơ hồ. Muốn: ba vai do agent đảm nhiệm, tranh luận
với nhau để dọn chỗ mơ hồ, và người thật chỉ xem bản đã qua phản biện.

## 2. Thiết kế

Ba agent, mỗi vai một agent (`.claude/agents/`). Mỗi agent có chế độ ghi và chế độ **DUYỆT** (chỉ đọc, agent mới
mỗi vòng, context sạch). Duyệt chéo: agent không duyệt bản mình vừa viết trong cùng ngữ cảnh.

| Agent | Chế độ VIẾT / SỬA | Chế độ DUYỆT (trọng tâm) |
|---|---|---|
| `spec-ba` (BA) | `proposal.md`, `specs/` | AC nguyên văn, Scenario đủ, ngôn ngữ BA/QA, mâu thuẫn spec cũ; `test-cases.md` có khớp spec |
| `spec-qa` (QA) | `test-cases.md` | Scenario kiểm tra được, độ phủ case, kết quả mong đợi cụ thể (tìm lỗi trong `specs/`) |
| `spec-dev` (Dev) | (không viết) | khả thi trong kiến trúc, layer, dependency, trùng/mâu thuẫn code |

**Vòng tranh luận** (`/relay spec`, tối đa 3 vòng): ba agent chạy song song ở chế độ DUYỆT → mỗi người ra
`VERDICT: approve|block` + finding (`blocker`/`major`/`minor`/`human`) → `spec-ba` và `spec-qa` sửa theo finding →
agent DUYỆT mới kiểm lại chỉ phần đã nêu. Finding được ghi vết trong `## Open Questions` của `proposal.md`.

**Chỗ phải dồn lên người thật:** business rule mà story và spec không đủ cơ sở quyết (`human`), và trường hợp hết 3 vòng
vẫn bất đồng. Chúng ở lại dạng `- [ ]`; cổng không cho merge khi còn `- [ ]`.

**Ghi nhận verdict (quyết định):** một comment PR có marker
`<!-- csk-spec-agents sha=<commit> ba=approve qa=approve dev=approve -->`, do `/relay spec` đăng sau khi push. Không dùng
tài khoản bot hay label.

**Cổng `Spec approvals`** đổi thành: PR không draft · hết `- [ ]` · có `test-cases.md` · marker đúng commit đầu, đủ ba
`approve`, từ OWNER/MEMBER/COLLABORATOR · **một** người trong `SPEC_APPROVERS` approve (commit đầu hiện tại). Cổng chạy
lại khi có comment mới hoặc bị sửa/xoá: run `issue_comment` chỉ chạy lại check `pull_request` mới nhất của đúng commit đầu (check của run `issue_comment` gắn vào nhánh mặc định, không hiện trên PR). `BA_APPROVERS`, `DEV_APPROVERS` bị bỏ.

## 3. Giới hạn đã biết

- Marker là comment do tài khoản người chạy đăng, nên cổng chỉ chứng minh quy trình đã chạy trên đúng commit, không
  chứng minh agent thật sự duyệt. Đó là lý do người thật vẫn bắt buộc approve.
- Ba agent cùng một mô hình dễ đồng thuận quá nhanh. Giảm bằng vai đối lập trong prompt (QA tìm lỗi, Dev tìm rủi ro),
  context sạch cho từng vòng, và finding phải chỉ ra đoạn spec cụ thể.
- Repo chỉ có một người: tác giả PR được tính là người thật đã duyệt nếu nằm trong `SPEC_APPROVERS` (GitHub không cho
  tự approve), nên cổng người thật khi đó chỉ mang tính hình thức.
- Chạy local qua `/relay spec` (không có CI chạy agent), nên cần người dùng chạy lại khi có commit mới.

## 4. Thay đổi

`.claude/agents/spec-{ba,qa,dev}.md` (gộp `spec-writer` và `qa-writer` cũ, thêm chế độ sửa theo finding và DUYỆT),
`.claude/commands/relay.md` (pha `spec`), `.github/workflows/spec-approvals-workflow.yml`, `spec-driven.md`,
`CLAUDE.md` §8.

**Sau khi merge, làm tay:** đặt repo variable `SPEC_APPROVERS`; cập nhật required check nếu cần.

**Chưa kiểm:** workflow chỉ được kiểm cú pháp YAML/bash và logic đọc marker trên dữ liệu mẫu, chưa chạy trên GitHub
thật; chưa chạy thử vòng tranh luận trên một story thật.
