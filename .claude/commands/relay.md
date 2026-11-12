---
name: "Relay"
description: "Điều phối một story qua các agent tách context: spec, test (RED), implement (GREEN); review chạy trên CI"
argument-hint: "<spec|plan|code|fix> <change-id>"
category: "Workflow"
tags: ["workflow", "agents", "tdd"]
---

Bạn là **người điều phối**. Bạn không tự viết spec, test hay code. Mỗi việc giao cho đúng một subagent
(tool `Agent`), mỗi lần gọi là một agent **mới**, không resume agent cũ (không `SendMessage`). Giữa các
agent, thông tin đi qua file và git diff, không qua trí nhớ của bạn. Bạn chỉ giữ báo cáo ngắn mỗi agent
trả về.

**Input**: `$ARGUMENTS` = `<pha> <change-id>`, ví dụ `code s3-5-topic-test`. Thiếu pha hoặc id thì hỏi
lại, đừng đoán. Pha hợp lệ: `spec`, `plan`, `code`, `fix`.

Thứ tự và chủ: `spec` (BA, PR spec) → merge → `plan` → `code` (dev, cùng một PR code). `plan` tạo
`design.md` và `tasks.md` ở nhánh `feat/<id>`; hai file này không thuộc PR spec.

Luật của dự án (`CLAUDE.md`, `docs/05-standards/spec-driven.md`) vẫn áp dụng nguyên. Lệnh này chỉ là
cách chạy chúng bằng agent.

## Quy tắc chung

- Prompt giao cho agent phải tự đủ: change id, Scenario, đường dẫn file. Không dán lập luận của agent
  khác, không dán suy nghĩ của bạn.
- Sau **mỗi** agent, chạy `git status --short` rồi kiểm vùng ghi:

  | Agent | Chỉ được đổi | Vi phạm khi đổi |
  |---|---|---|
  | `spec-writer` | `openspec/changes/<id>/proposal.md`, `specs/**`, `.openspec.yaml` | `design.md`, `tasks.md`, mọi thứ khác |
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

## Pha `spec`

1. Xác nhận nhánh làm việc cắt từ `main` mới nhất (xem "Nhánh và worktree"); tên `spec/<id>` đặt
   trước lần push đầu. Nếu đang ở `main` hoặc nhánh của việc khác, hỏi người dùng trước khi tạo nhánh.
2. Gọi `spec-writer` với story/id. Kiểm vùng ghi.
3. Nếu có "Câu hỏi mở": dừng, đưa câu hỏi cho người dùng, rồi gọi lại `spec-writer` với câu trả lời.
4. Chạy `pnpm exec openspec validate --all --strict`. Fail thì gọi lại `spec-writer` với output lỗi.
5. **Dừng.** Báo: spec (`proposal.md` + `specs/`) đã sẵn sàng, mở PR spec (`Spec PR: N/A`), chờ BA
   review và merge, sau đó dev chạy `/relay plan` rồi `/relay code`. Không tạo `design.md`/`tasks.md`.

## Pha `plan`

1. **Cổng spec:** PR spec phải đã merge. Kiểm `openspec/changes/<id>/specs` có trên `origin/main`
   (`git fetch origin main` rồi `git cat-file -e origin/main:openspec/changes/<id>/proposal.md`).
   Không có thì dừng và nói cần merge PR spec trước. Nhánh làm việc phải chứa `origin/main`
   (`git merge-base --is-ancestor origin/main HEAD`); nếu không, hỏi người dùng có muốn rebase không.
   Tên nhánh chưa cần là `feat/<id>` (xem "Nhánh và worktree").
2. Gọi `planner` với change id. Kiểm vùng ghi.
3. Nếu báo cáo có "Vấn đề với spec": **dừng**, không tự sửa spec. Báo cần mở PR spec fix
   (`spec/<id>-fix`) cho BA duyệt (spec-driven §2), rồi rebase nhánh này.
4. Nếu có "Câu hỏi mở": đưa cho người dùng, rồi gọi lại `planner` với câu trả lời.
5. Chạy `pnpm exec openspec validate --all --strict`. Fail thì gọi lại `planner` với output lỗi.
6. **Dừng.** Báo: `design.md` và `tasks.md` đã sẵn sàng (số task, layer đích, file dự kiến), người dùng
   xem lại rồi chạy `/relay code`. Hai file này đi cùng PR code.

## Pha `code`

1. **Cổng kế hoạch:** PR spec đã merge (như pha `plan`) **và** `openspec/changes/<id>/tasks.md` +
   `design.md` đã có ở nhánh hiện tại. Thiếu thì dừng và bảo chạy `/relay plan <id>` trước. Nhánh làm việc
   phải chứa `origin/main` (như pha `plan`).
2. Đọc `tasks.md` để lấy danh sách Scenario theo thứ tự. Với **mỗi** Scenario chưa xong, lần lượt:
   1. **RED:** gọi `test-writer` (id + đúng một Scenario). Kiểm vùng ghi. Báo cáo phải có output
      test fail đúng lý do; không có thì gọi lại. Chạy lại test đó và tự xác nhận nó fail.
   2. **GREEN:** gọi `implementer` (id + Scenario + đường dẫn test). Kiểm vùng ghi. Chạy lại test
      đó và xác nhận nó pass.
   3. Tick task tương ứng trong `tasks.md`.
   Không viết hết test rồi mới code. Một Scenario xong hẳn mới sang Scenario kế.
3. **Verify:** chạy `pnpm typecheck && pnpm lint && pnpm test:run`, cộng `pnpm content:check` hoặc
   `pnpm e2e` nếu `CLAUDE.md` §8 yêu cầu cho loại thay đổi này. Không nói "xong" khi chưa thấy pass.
4. **Dừng trước PR.** Review không chạy ở đây: CI (`.github/workflows/review-workflow.yml`) review
   độc lập sau khi PR mở. Báo cáo: Scenario đã xong, kết quả verify, task đã tick, và gợi ý nội dung
   PR (`Spec PR: #<số>`, `Closes`/`Refs #<story>`). Hỏi người dùng có muốn commit và mở PR không.
5. **Sau khi mở PR:** gắn PR vào phiên (`mcp__ccd_pr__get_status`, chưa có thì `bind_pr`) và bật theo
   dõi (`set_monitor`) để app đánh thức bạn khi CI review có comment mới hoặc CI đỏ. Mỗi lần được
   đánh thức, chạy pha `fix`. Không tự poll CI.

## Pha `fix`

Xử lý feedback sau PR: finding của CI review (check "Review"), comment của người, CI đỏ. Có thể chạy
trong phiên mới: trạng thái nằm ở nhánh, `tasks.md` và comment PR.

1. Lấy feedback: inline comment và tóm tắt của CI review qua `gh pr view <n> --comments` và
   `gh api repos/<owner>/<repo>/pulls/<n>/comments`; hoặc phần người dùng dán vào tin nhắn. Chỉ lấy
   finding chưa được xử lý (nhìn commit sau comment đó).
2. Phân loại từng mục:
   - `code` → `implementer` (chế độ FIX, chỉ danh sách finding).
   - `test` (thiếu hoặc yếu) → `test-writer` bổ sung RED, rồi `implementer` làm xanh.
   - `spec` → **dừng**, không sửa spec trong PR code. Soạn patch spec ở nhánh `spec/<id>-fix` cho
     BA duyệt (spec-driven §2): gọi `spec-writer` với finding, kiểm vùng ghi, chạy
     `pnpm exec openspec validate --all --strict`, mở PR spec fix (cần người dùng đồng ý), rồi báo.
   - `minor`/`nit` → sửa nếu rẻ, không thì ghi lại trong báo cáo.
   - Không đồng ý với finding → không sửa, trả lời comment kèm lý do và báo người dùng.
3. Gọi agent đúng chủ với **chỉ** danh sách mục đó, kiểm vùng ghi, chạy lại test liên quan.
4. Verify như bước 3 của pha `code`. Khi người dùng đồng ý, commit và push; push sẽ chạy lại CI
   review. Không gọi reviewer local.
5. **Giới hạn:** tối đa **2 vòng** push sửa theo finding blocker/major của CI review. CI review sau
   vòng thứ 2 chỉ còn comment, không fail check. Hết 2 vòng mà vẫn còn `blocker`/`major`: **dừng hẳn**,
   không chạy vòng 3, không tự hạ mức độ. Báo: finding còn lại, đã thử gì ở mỗi vòng, và để người
   dùng chọn (sửa tay / thêm vòng / chấp nhận ngoại lệ có ghi lý do vào PR).

## Báo cáo cho người dùng

Ngắn, theo từng mốc: việc đã giao cho agent nào, kết quả (pass/fail kèm bằng chứng), và việc cần
người dùng quyết. Không dán nguyên báo cáo dài của agent; trích phần cần thiết.
