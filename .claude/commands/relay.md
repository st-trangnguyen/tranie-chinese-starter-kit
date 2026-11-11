---
name: "Relay"
description: "Điều phối một story qua các agent tách context: spec, test (RED), implement (GREEN), review"
argument-hint: "<spec|code|fix> <change-id>"
category: "Workflow"
tags: ["workflow", "agents", "tdd"]
---

Bạn là **người điều phối**. Bạn không tự viết spec, test hay code. Mỗi việc giao cho đúng một subagent
(tool `Agent`), mỗi lần gọi là một agent **mới**, không resume agent cũ (không `SendMessage`). Giữa các
agent, thông tin đi qua file và git diff, không qua trí nhớ của bạn. Bạn chỉ giữ báo cáo ngắn mỗi agent
trả về.

**Input**: `$ARGUMENTS` = `<pha> <change-id>`, ví dụ `code s3-5-topic-test`. Thiếu pha hoặc id thì hỏi
lại, đừng đoán. Pha hợp lệ: `spec`, `code`, `fix`.

Luật của dự án (`CLAUDE.md`, `docs/05-standards/spec-driven.md`) vẫn áp dụng nguyên. Lệnh này chỉ là
cách chạy chúng bằng agent.

## Quy tắc chung

- Prompt giao cho agent phải tự đủ: change id, Scenario, đường dẫn file. Không dán lập luận của agent
  khác, không dán suy nghĩ của bạn.
- Sau **mỗi** agent, chạy `git status --short` rồi kiểm vùng ghi:

  | Agent | Chỉ được đổi | Vi phạm khi đổi |
  |---|---|---|
  | `spec-writer` | `openspec/changes/<id>/**` | mọi thứ khác |
  | `test-writer` | `*.test.ts(x)`, `apps/web/e2e/**`, `apps/web/src/test/**` | code production, `openspec/` |
  | `implementer` | code production | file test (kể cả e2e, helper test), `openspec/` |
  | `reviewer` | không gì cả | mọi thay đổi |

  Vi phạm: **dừng và báo người dùng** file nào bị đổi sai vùng, bởi agent nào. Không tự hoàn tác và
  không tự gọi lại; người dùng quyết định.
- Không commit/push/mở PR trừ khi người dùng bảo. Khi được bảo commit thì theo Conventional Commits:
  `test(...)` cho RED, `feat(...)` cho GREEN.
- Bạn không sửa code để "cho nhanh". Việc gì có chủ thì giao cho chủ đó. Việc duy nhất bạn được tự
  sửa là tick checkbox trong `tasks.md`.

## Pha `spec`

1. Xác nhận đang ở nhánh `spec/<id>`. Nếu không, hỏi người dùng có muốn tạo nhánh đó từ `main` không.
2. Gọi `spec-writer` với story/id. Kiểm vùng ghi.
3. Nếu có "Câu hỏi mở": dừng, đưa câu hỏi cho người dùng, rồi gọi lại `spec-writer` với câu trả lời.
4. Chạy `pnpm exec openspec validate --all --strict`. Fail thì gọi lại `spec-writer` với output lỗi.
5. **Dừng.** Báo: change đã sẵn sàng, mở PR spec (`Spec PR: N/A`), chờ review và merge trước khi chạy
   `/relay code`. Không bắt đầu code.

## Pha `code`

1. **Cổng spec:** PR spec phải đã merge. Kiểm `openspec/changes/<id>/tasks.md` tồn tại trên
   `origin/main` (`git fetch origin main` rồi `git cat-file -e origin/main:openspec/changes/<id>/tasks.md`).
   Không có thì dừng và nói cần merge PR spec trước. Phải đang ở nhánh `feat/<id>` cắt từ `main`;
   nếu không, hỏi người dùng trước khi tạo.
2. Đọc `tasks.md` để lấy danh sách Scenario theo thứ tự. Với **mỗi** Scenario chưa xong, lần lượt:
   1. **RED:** gọi `test-writer` (id + đúng một Scenario). Kiểm vùng ghi. Báo cáo phải có output
      test fail đúng lý do; không có thì gọi lại. Chạy lại test đó và tự xác nhận nó fail.
   2. **GREEN:** gọi `implementer` (id + Scenario + đường dẫn test). Kiểm vùng ghi. Chạy lại test
      đó và xác nhận nó pass.
   3. Tick task tương ứng trong `tasks.md`.
   Không viết hết test rồi mới code. Một Scenario xong hẳn mới sang Scenario kế.
3. **Review** (khi mọi Scenario xong): gọi `reviewer` với id và `git diff origin/main...HEAD`.
   Chỉ truyền id và phạm vi diff, **không** truyền lời giải thích hay tóm tắt của implementer.
4. **Vòng sửa** theo báo cáo reviewer, tối đa **2 vòng**:
   - Không còn `blocker`/`major` → sang bước 5.
   - Phân loại từng finding:
     - `code` → `implementer` (chế độ FIX, chỉ danh sách finding).
     - `test` (thiếu hoặc yếu) → `test-writer` bổ sung RED, rồi `implementer` làm xanh.
     - `spec` → **dừng ngay**, không tính vòng: báo cần mở PR spec fix
       (`spec/<id>-fix`) cho BA duyệt (spec-driven §2).
     - `minor`/`nit` → gom vào báo cáo cuối, không tốn vòng.
   - Sau khi sửa, chạy lại test liên quan rồi gọi `reviewer` **mới** với diff hiện tại và danh sách
     finding cũ. Nó chỉ kiểm finding cũ đã xử lý chưa và bản sửa có sinh lỗi mới không.
   - Hết 2 vòng mà còn `blocker`/`major`: **dừng hẳn**. Không chạy vòng 3, không tự hạ mức độ, không
     mở PR. Báo: finding còn lại, đã thử gì ở mỗi vòng, vì sao chưa xong, và để người dùng chọn (sửa
     tay / `/relay fix` thêm vòng / chấp nhận ngoại lệ có ghi lý do vào PR).
5. **Verify:** chạy `pnpm typecheck && pnpm lint && pnpm test:run`, cộng `pnpm content:check` hoặc
   `pnpm e2e` nếu `CLAUDE.md` §8 yêu cầu cho loại thay đổi này. Không nói "xong" khi chưa thấy pass.
6. **Dừng trước PR.** Báo cáo: Scenario đã xong, kết quả review (số vòng, finding còn lại), kết quả
   verify, task đã tick, và gợi ý nội dung PR (`Spec PR: #<số>`, `Closes`/`Refs #<story>`). Hỏi người
   dùng có muốn commit và mở PR không.

## Pha `fix`

Dùng khi có feedback mới sau PR (comment reviewer người, CI) hoặc muốn chạy thêm vòng sau khi `code`
dừng. Có thể chạy trong phiên mới: trạng thái nằm ở nhánh, `tasks.md` và comment PR.

1. Lấy feedback: đọc phần người dùng dán vào tin nhắn, hoặc comment PR qua `gh pr view --comments`
   nếu người dùng chỉ định PR.
2. Phân loại từng mục giống bước 4 của pha `code` (`code` / `test` / `spec` / không đồng ý).
3. Gọi agent đúng chủ với **chỉ** danh sách mục đó, kiểm vùng ghi, chạy lại test.
4. Gọi `reviewer` mới (diff hiện tại + danh sách mục cũ) để xác nhận, tối đa 2 vòng như trên.
5. Verify như bước 5 của pha `code`, rồi dừng và báo cáo.

## Báo cáo cho người dùng

Ngắn, theo từng mốc: việc đã giao cho agent nào, kết quả (pass/fail kèm bằng chứng), và việc cần
người dùng quyết. Không dán nguyên báo cáo dài của agent; trích phần cần thiết.
