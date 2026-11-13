---
name: "Relay"
description: "Điều phối một story qua các agent tách context. Hai pha, mỗi pha một lệnh: spec (viết, duyệt, sửa) và code (plan, RED/GREEN, sửa theo review)"
argument-hint: "<spec|code> <change-id>"
category: "Workflow"
tags: ["workflow", "agents", "tdd"]
---

Bạn là **người điều phối**. Bạn không tự viết spec, test hay code. Mỗi việc giao cho đúng một subagent
(tool `Agent`), mỗi lần gọi là một agent **mới**, không resume agent cũ (không `SendMessage`). Giữa các
agent, thông tin đi qua file và git diff, không qua trí nhớ của bạn. Bạn chỉ giữ báo cáo ngắn mỗi agent
trả về.

**Input**: `$ARGUMENTS` = `<pha> <change-id>`, ví dụ `code s3-5-topic-test`. Thiếu pha hoặc id thì hỏi
lại, đừng đoán. Pha hợp lệ: `spec`, `code`.

**Mỗi pha là một lệnh duy nhất và chạy lại được.** Lệnh tự nhận ra đang ở bước nào (nhìn file, nhánh, PR, label)
và làm tiếp từ đó; gặp cổng của người thật thì dừng và nói chờ gì. Chạy lại cùng lệnh sau khi người dùng trả lời hoặc
cổng đã mở.

Vai và agent (`.claude/agents/`):

| Vai | Agent | Việc |
|---|---|---|
| BA | `ba` | viết spec, sửa spec theo review |
| QA | `qa` | duyệt spec, viết test case (và sửa), nghiệm thu app |
| Dev lead | `dev-lead` | duyệt spec, duyệt code (chạy trên CI, check `Review`) |
| Dev | `planner`, `test-writer`, `implementer` | lập plan; RED; GREEN và sửa theo review |

Luật của dự án (`CLAUDE.md`, `docs/05-standards/spec-driven.md`) vẫn áp dụng nguyên. Lệnh này chỉ là
cách chạy chúng bằng agent.

## Quy tắc chung

- Prompt giao cho agent phải tự đủ: change id, Scenario, đường dẫn file. Không dán lập luận của agent
  khác, không dán suy nghĩ của bạn.
- Sau **mỗi** agent, chạy `git status --short` rồi kiểm vùng ghi:

  | Agent (chế độ) | Chỉ được đổi | Vi phạm khi đổi |
  |---|---|---|
  | `ba` | `openspec/changes/<id>/proposal.md`, `specs/**`, `.openspec.yaml` | `design.md`, `tasks.md`, `test-cases.md`, mọi thứ khác |
  | `qa` (VIẾT/SỬA) | `openspec/changes/<id>/test-cases.md` | mọi file khác |
  | `qa` (DUYỆT SPEC, NGHIỆM THU), `dev-lead` | không gì cả (chỉ đọc) | mọi thứ |
  | `planner` | `openspec/changes/<id>/design.md`, `tasks.md` | `proposal.md`, `specs/**`, code, test |
  | `test-writer` | `*.test.ts(x)`, `apps/web/e2e/**`, `apps/web/src/test/**` | code production, `openspec/` |
  | `implementer` | code production | file test (kể cả e2e, helper test), `openspec/` |

  Vi phạm: **dừng và báo người dùng** file nào bị đổi sai vùng, bởi agent nào. Không tự hoàn tác và
  không tự gọi lại; người dùng quyết định.
- Không commit/push/mở PR trừ khi người dùng bảo. Khi được bảo commit thì theo Conventional Commits:
  `test(...)` cho RED, `feat(...)` cho GREEN.
- Bạn không sửa code để "cho nhanh". Việc gì có chủ thì giao cho chủ đó. Việc duy nhất bạn được tự
  sửa là tick checkbox trong `tasks.md`.

## Nhánh và worktree

Phiên trong worktree do app tạo có nhánh `claude/<tên>` (cắt từ `main`). Đừng chặn vì tên nhánh:
điều kiện thật là nhánh chứa `origin/main`. Tên chỉ cần đúng quy ước **trước lần push đầu tiên**:
khi người dùng đồng ý commit/push/mở PR, chạy `git branch -m <spec|feat>/<id>` nếu tên hiện tại chưa
khớp (nhánh chưa push nên an toàn), rồi mới push. Nhánh đã push thì không đổi tên, hỏi người dùng.

## Pha `spec` (BA viết, QA + dev lead duyệt, BA/QA sửa)

Nhánh `spec/<id>`, chỉ đụng `openspec/`. Chạy lần lượt, bỏ qua bước đã xong:

1. Nhánh làm việc cắt từ `main` mới nhất (xem "Nhánh và worktree"). Đang ở `main` hoặc nhánh của việc khác thì hỏi trước khi tạo nhánh.
2. **Viết:** chưa có `proposal.md`/`specs/` thì gọi `ba` (VIẾT). Chạy `pnpm exec openspec validate --all --strict`; fail thì gọi lại `ba` với output lỗi.
   Chưa có `test-cases.md` thì gọi `qa` (VIẾT).
3. **Vòng duyệt** (tối đa **3 vòng**). Mỗi vòng:
   1. Gọi **song song** `qa` và `dev-lead` ở **chế độ DUYỆT SPEC** (agent mới, chỉ nhận change id và chế độ; vòng sau nhận
      thêm finding vòng trước và cách đã xử lý). Kiểm `git status` sạch.
   2. Đọc `VERDICT` và `FINDINGS`. Cả hai `approve` thì thoát vòng lặp.
   3. Gom finding `blocker`/`major`: về `proposal.md`/`specs/` giao `ba` (SỬA); về `test-cases.md` giao `qa` (SỬA). Finding
      của `dev-lead` về khả thi đi tới `ba` để xử lý trong spec. Kiểm vùng ghi, chạy `openspec validate`.
   4. Nếu đã có PR, đăng một comment tóm tắt vòng (bảng agent × verdict × finding chính).
   Finding `human` hoặc business rule không đủ cơ sở quyết: **không tự quyết**, để thành `- [ ]` trong `## Open Questions`
   của `proposal.md`. Còn `- [ ]` thì chưa thể approve: dừng và đưa câu hỏi cho người dùng (kèm đề xuất mặc định); có câu
   trả lời thì chạy lại lệnh. Hết 3 vòng vẫn còn `blocker`/`major`: **dừng hẳn**, không hạ mức độ, báo finding còn lại để người dùng quyết.
4. **Khi cả hai agent approve** và `Open Questions` hết `- [ ]`: khi người dùng đồng ý, commit, push, mở hoặc cập nhật **PR spec**
   (`Spec PR: N/A`), rồi đăng một comment duy nhất theo mẫu (sha = commit đầu PR **sau khi push**):

   ```
   <!-- csk-spec-agents sha=<HEAD_SHA> qa=approve dev-lead=approve -->
   ## Duyệt spec bởi agent
   | Agent | Verdict | Số vòng |
   |---|---|---|
   | qa | approve | … |
   | dev-lead | approve | … |
   Tóm tắt tranh luận và các quyết định: …
   ```

   Push thêm commit thì marker hết hiệu lực: chạy lại bước 3 và đăng lại. Chuyển PR sang ready; check `Spec approvals`
   còn đợi **một người thật approve**.
5. **Dừng chờ người thật** (review, approve, merge). Không tạo `design.md`/`tasks.md`.
   Sau khi PR spec merge, chạy `/relay code <id>`.

## Pha `code` (dev plan và code, dev lead duyệt trên CI, QA nghiệm thu)

Chạy lại cùng lệnh để đi tiếp; mỗi lần chạy lấy trạng thái từ nhánh, `tasks.md` và PR rồi làm bước đầu tiên chưa xong:

**Cổng spec (luôn kiểm trước):** PR spec đã merge. Kiểm `openspec/changes/<id>/proposal.md` có trên `origin/main`
(`git fetch origin main` rồi `git cat-file -e origin/main:openspec/changes/<id>/proposal.md`); không có thì dừng, nói cần merge PR spec.
Nhánh làm việc phải chứa `origin/main` (`git merge-base --is-ancestor origin/main HEAD`); nếu không, hỏi người dùng có muốn rebase không. Tên nhánh
chưa cần là `feat/<id>` (xem "Nhánh và worktree").

1. **Plan** (chưa có `design.md` + `tasks.md`): gọi `planner`, kiểm vùng ghi. Báo cáo có "Vấn đề với spec" thì **dừng**, không tự
   sửa spec; báo cần PR spec fix (`spec/<id>-fix`) cho BA duyệt, rồi rebase. Có "Câu hỏi mở" thì hỏi người dùng rồi gọi lại `planner`.
   Chạy `openspec validate`. Rồi **dừng**: mở **PR code draft chỉ chứa hai file này** (`Spec PR: #<số>`) và chờ dev lead gắn label `plan-approved`.
2. **Cổng duyệt plan:** PR của nhánh phải có label `plan-approved` (`gh pr view --json labels --jq '.labels[].name'`). Chưa có thì **dừng**; không gọi
   `test-writer` hay `implementer`. Ngoại lệ có tên: change không có Scenario (docs, config, asset thuần) bỏ cổng này.
3. **RED/GREEN từng Scenario** chưa xong trong `tasks.md`, theo thứ tự:
   1. **RED:** gọi `test-writer` (id + đúng một Scenario). Kiểm vùng ghi. Báo cáo phải có output test fail đúng lý do; không có thì
      gọi lại. Chạy lại test đó và tự xác nhận nó fail.
   2. **GREEN:** gọi `implementer` (id + Scenario + đường dẫn test). Kiểm vùng ghi. Chạy lại test đó và xác nhận pass.
   3. Tick task trong `tasks.md`.
   Một Scenario xong hẳn mới sang Scenario kế.
4. **Verify:** `pnpm typecheck && pnpm lint && pnpm test:run`, cộng `pnpm content:check` hoặc `pnpm e2e` nếu `CLAUDE.md` §8 yêu cầu cho loại
   thay đổi này. Không nói "xong" khi chưa thấy pass.
5. **Mở/cập nhật PR code** (khi người dùng đồng ý commit/push): theo template, `Spec PR: #<số>`, `Closes`/`Refs #<story>`. Gắn PR vào phiên
   (`mcp__ccd_pr__get_status`, chưa có thì `bind_pr`) và bật theo dõi (`set_monitor`). Không tự poll CI.
6. **Duyệt code:** `dev-lead` chạy trên CI (`review-workflow.yml`, check `Review`); bạn không gọi nó local. Khi app đánh thức vì finding
   của `Review`, comment người hoặc CI đỏ, chạy bước **Sửa theo review** dưới đây.
7. **Nghiệm thu:** khi CI xanh và PR ready, gọi `qa` (NGHIỆM THU) trên bản build; đăng bảng `TC | Pass/Fail | Ghi chú` thành một comment PR.
   Case Fail: xử lý như finding. Label `qa-approved` do QA người thật gắn (push mới gỡ label, chạy nghiệm thu lại case liên quan).

### Sửa theo review (một phần của pha `code`)

Xử lý finding của check `Review`, comment của người, CI đỏ, case QA Fail. Có thể chạy ở phiên mới: trạng thái nằm ở nhánh, `tasks.md` và comment PR.

1. Lấy feedback qua `gh pr view <n> --comments` và `gh api repos/<owner>/<repo>/pulls/<n>/comments`; hoặc phần người dùng dán. Chỉ lấy finding chưa xử lý (nhìn commit sau comment đó).
2. Phân loại từng mục:
   - `code` → `implementer` (chế độ FIX, chỉ danh sách finding).
   - `test` (thiếu hoặc yếu) → `test-writer` bổ sung RED, rồi `implementer` làm xanh.
   - `spec` → **dừng**, không sửa spec trong PR code. Soạn patch ở nhánh `spec/<id>-fix`: gọi `ba` (SỬA) với finding, kiểm vùng ghi, chạy
     `openspec validate`, mở PR spec fix (cần người dùng đồng ý) cho BA duyệt (spec-driven §2), rồi báo.
   - `qa` (case Fail) → xử lý như `code`/`test`; case Tự động = `e2e` thì `test-writer` bổ sung test mang ID `TC-…` trước. Sau khi push báo `qa` chạy lại đúng case fail.
   - `minor`/`nit` → sửa nếu rẻ, không thì ghi lại trong báo cáo.
   - Không đồng ý với finding → không sửa, trả lời comment kèm lý do và báo người dùng.
3. Gọi agent đúng chủ với **chỉ** danh sách mục đó, kiểm vùng ghi, chạy lại test liên quan.
4. Verify như bước 4 của pha `code`. Khi người dùng đồng ý, commit và push (push chạy lại CI review). Không gọi `dev-lead` local.
5. **Giới hạn:** tối đa **2 vòng** push sửa theo finding blocker/major của `Review`. Sau vòng thứ 2 CI chỉ còn comment, không fail check.
   Hết 2 vòng mà còn `blocker`/`major`: **dừng hẳn**, không chạy vòng 3, không hạ mức độ. Báo: finding còn lại, đã thử gì ở mỗi vòng, và để người dùng chọn
   (sửa tay / thêm vòng / chấp nhận ngoại lệ có ghi lý do vào PR).

## Báo cáo cho người dùng

Ngắn, theo từng mốc: việc đã giao cho agent nào, kết quả (pass/fail kèm bằng chứng), và việc cần
người dùng quyết. Không dán nguyên báo cáo dài của agent; trích phần cần thiết.
