# QA và các cổng review: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm QA, bước Q&A cho spec, cổng duyệt plan của dev lead và cổng nghiệm thu QA vào quy trình story, chặn được merge bằng check bắt buộc.

**Architecture:** Tài liệu chuẩn (`spec-driven.md`, `CLAUDE.md`) cập nhật trước, rồi agent và `/relay`, rồi 2 workflow GitHub mới đọc trạng thái bằng `gh api` (cùng kiểu `spec-gate-workflow.yml`, không checkout code từ nhánh PR). Tín hiệu duyệt là label `plan-approved` / `qa-approved`, chỉ hợp lệ khi người gắn nằm trong danh sách ở repo variables.

**Tech Stack:** GitHub Actions (bash + `gh` + `jq`), tài liệu Markdown, OpenSpec CLI, `.claude/agents` + `.claude/commands`.

**Spec:** [docs/04-specs/2026-11-13-qa-review-workflow.md](../../04-specs/2026-11-13-qa-review-workflow.md)

**TDD:** Toàn bộ là docs, config, workflow: thuộc ngoại lệ có tên của CLAUDE.md §0.7. PR ghi `Spec PR: N/A`, Screenshots `N/A`. Phần logic bash được kiểm bằng chạy tay trên dữ liệu mẫu (nêu trong từng task) và `actionlint`.

## Global Constraints

- Tên check (job `name:`) đúng nguyên văn: `Spec approvals`, `Plan đã duyệt`, `QA sign-off`.
- Tên label: `plan-approved`, `qa-approved`.
- Repo variables (handle GitHub, cách nhau dấu phẩy): `BA_APPROVERS`, `QA_APPROVERS`, `DEV_APPROVERS`, `PLAN_APPROVERS`. Không hardcode handle trong workflow.
- Đường dẫn: `openspec/changes/<id>/test-cases.md`; mục `## Open Questions` trong `proposal.md`; ID case `TC-S<epic>.<n>-AC<k>-<m>`.
- PR không cần cổng plan/QA: nhánh `spec/*`, hoặc dòng `Spec PR: N/A` (cùng luật với `spec-gate-workflow.yml`). Job vẫn chạy và pass để check bắt buộc không treo pending.
- Workflow chỉ dùng `gh api` và payload sự kiện, không checkout hay chạy code từ nhánh PR.
- Workflow GitHub **không** thêm dependency mới vào repo; chỉ dùng action `actions/upload-artifact@v4` (đã cùng họ với `actions/checkout@v4` đang dùng).
- Tài liệu viết tiếng Việt, giữ heading cấu trúc OpenSpec tiếng Anh. Không dùng `Co-Authored-By` trong commit (memory của người dùng).

## Review Focus

Các tình huống thiết kế ngụ ý nhưng dễ bị bỏ sót, mỗi dòng có bước kiểm ở task nêu trong ngoặc:

1. PR docs thuần / `Spec PR: N/A` / PR archive phải pass cả 3 check, không treo pending (Task 5, 6).
2. Label do chính tác giả PR hoặc người ngoài danh sách gắn **không** được tính là duyệt (Task 6).
3. Push code sau `qa-approved` gỡ label; sửa `design.md` sau `plan-approved` gỡ label; chỉ tick `tasks.md` thì **không** gỡ (Task 6).
4. Review `APPROVED` sau đó bị `CHANGES_REQUESTED` hoặc dismiss: lấy review **mới nhất** của mỗi người (Task 5).
5. Change đang dở từ trước (chưa có `test-cases.md`) và PR `spec/<id>-fix` không được fail oan: chỉ đòi `test-cases.md` khi PR **thêm mới** `proposal.md` (Task 5).

## File Structure

| File | Việc |
|---|---|
| `docs/05-standards/spec-driven.md` (sửa) | Nguồn chuẩn: pha A/B mới, `test-cases.md`, cổng, cấu hình repo |
| `CLAUDE.md` (sửa §8) | Bản tóm tắt luật |
| `.github/pull_request_template.md`, `.github/CODEOWNERS` (sửa) | Checklist, người review theo vai |
| `.claude/agents/qa-writer.md` (mới), `spec-writer.md`, `test-writer.md` (sửa) | Soạn test case, Open Questions, e2e theo `TC-` |
| `.claude/commands/relay.md`, `openspec/config.yaml` (sửa) | Điều phối mới, rule proposal |
| `.github/workflows/spec-approvals-workflow.yml` (mới) | Check `Spec approvals` |
| `.github/workflows/gates-workflow.yml` (mới) | Check `Plan đã duyệt`, `QA sign-off`, gỡ label khi push |
| `.github/workflows/ci-workflow.yml` (sửa) | Upload artifact `web-dist` |

---

### Task 1: Tài liệu chuẩn `spec-driven.md` và `CLAUDE.md` §8

**Files:**
- Modify: `docs/05-standards/spec-driven.md` (§2 bảng pha + pha A/B + "Cổng spec", §3, §7)
- Modify: `CLAUDE.md` (§8 Pha A, Pha B, bước 8)

**Interfaces:**
- Produces: tên check/label/variable/đường dẫn đúng như "Global Constraints"; mọi task sau trỏ về các tên này, không đặt tên khác.

- [ ] **Step 1: Pha A trong `spec-driven.md` §2.** Thay bảng bước A1–A3 bằng: A1 tạo nhánh; A2 `/relay spec` (gồm `qa-writer`); A3 mở **PR spec draft**, Q&A trong comment, QA hoàn thiện `test-cases.md`; A4 chuyển ready khi `Open Questions` hết `- [ ]`; A5 đủ approve BA + QA + Dev rồi merge. Cổng: check `Spec approvals`. Chép nguyên mô tả §4.1 của bản thiết kế, gồm bảng mẫu `test-cases.md` (cột ID, Scenario, Loại, Các bước, Kết quả mong đợi, Tự động).
- [ ] **Step 2: Pha B trong §2.** Thêm B1b "Duyệt plan": PR code mở **draft chỉ chứa `design.md` + `tasks.md`**, dev lead gắn `plan-approved` (chỉ `PLAN_APPROVERS`), sửa `design.md` sau đó gỡ label, tick `tasks.md` không gỡ. Thêm B6a "QA nghiệm thu": QA chạy `test-cases.md` trên artifact `web-dist` (lệnh: tải artifact giải nén vào `apps/web/dist` rồi `pnpm --filter @csk/web exec vite preview --port 4173`), ghi kết quả trong **một comment** (bảng `TC | Pass/Fail | Ghi chú`), gắn `qa-approved`; push code mới gỡ label. Case có Tự động = `e2e` do `test-writer` viết ở `apps/web/e2e/E<n>/` mang ID `TC-…`.
- [ ] **Step 3: Mục "Cổng" và "Cấu hình repo".** Mở rộng "Cổng spec" thành 4 cổng, mỗi cổng một dòng: `Spec PR đã merge` (có sẵn), `Spec approvals`, `Plan đã duyệt`, `QA sign-off` (điều kiện fail của từng cái theo Global Constraints). Thêm mục **Cấu hình repo (làm tay)**: tạo 2 label, đặt 4 variables, đặt 3 check mới làm required trong branch protection của `main`, nêu giới hạn "GitHub không chặn push; cổng chặn merge" và "một người nằm trong nhiều danh sách vẫn đủ nhiều vai". Câu lệnh tạo label: `gh label create plan-approved --color 0E8A16` và `gh label create qa-approved --color 1D76DB`.
- [ ] **Step 4: §3 và §7.** §3 thêm đoạn "Open Questions trong proposal" và "Viết `test-cases.md`" (QA đọc/viết, chỉ thứ người học thấy, mỗi Scenario ≥ 1 case, các loại: Chức năng, Biên, A11y, Mobile 375, Sáng/Tối, Offline). §7 thêm hàng `qa-writer` (pha A, ghi `test-cases.md`) vào bảng agent và nêu `/relay code` từ chối chạy khi chưa có `plan-approved`.
- [ ] **Step 5: `CLAUDE.md` §8.** Trong Pha A thêm Q&A + `test-cases.md` + 3 vai approve; trong Pha B thêm bước "mở PR code draft chỉ có plan, chờ `plan-approved`" trước RED, và bước "QA nghiệm thu, `qa-approved`" trước khi merge. Bảng lệnh kiểm tra không đổi.
- [ ] **Step 6: Verify.** Run: `grep -n "plan-approved\|qa-approved\|Spec approvals\|QA sign-off\|test-cases.md" docs/05-standards/spec-driven.md CLAUDE.md`. Expected: mỗi từ khóa xuất hiện ở cả hai file (trừ phần cấu hình repo chỉ cần ở `spec-driven.md`).
- [ ] **Step 7: Commit** `docs(standards): thêm QA, Q&A spec, cổng duyệt plan và nghiệm thu vào quy trình story` (chỉ khi người dùng bảo commit).

---

### Task 2: PR template và CODEOWNERS

**Files:**
- Modify: `.github/pull_request_template.md`
- Modify: `.github/CODEOWNERS`

**Interfaces:**
- Consumes: tên label/check từ Task 1.

- [ ] **Step 1: Template, mục Requirement** thêm hai ô:
  `- [ ] Plan đã được dev lead duyệt (label \`plan-approved\`), hoặc \`N/A\` nếu PR không có spec.` và `- [ ] QA đã nghiệm thu theo \`test-cases.md\` (label \`qa-approved\`), hoặc \`N/A\` nếu PR không có spec.`
- [ ] **Step 2: Template, mục mới `#### QA`** sau `#### Screenshots`: dòng placeholder `> Link comment kết quả QA, hoặc N/A` (placeholder này dev xóa khi gửi, theo CLAUDE.md §8).
- [ ] **Step 3: CODEOWNERS.** Giữ dòng mặc định `* @st-trangnguyen`. Thay các dòng comment cũ bằng khối có chú thích: `/openspec/` gán đủ `@<ba-handle> @<qa-handle> @<dev-handle>` (comment, kèm hướng dẫn "điền handle thật rồi bỏ dấu #"), `/openspec/changes/*/design.md` và `/tasks.md` gán `@<dev-lead-handle>`, `/openspec/changes/*/test-cases.md` gán `@<qa-handle>`. Ghi chú: dòng sau thắng dòng trước, nên đặt các dòng cụ thể ở dưới.
- [ ] **Step 4: Verify.** Run: `grep -c "plan-approved\|qa-approved" .github/pull_request_template.md`. Expected: `2` hoặc hơn.
- [ ] **Step 5: Commit** `docs(github): thêm checklist QA/plan vào PR template và CODEOWNERS theo vai` (khi được bảo).

---

### Task 3: Agent và `openspec/config.yaml`

**Files:**
- Create: `.claude/agents/qa-writer.md`
- Modify: `.claude/agents/spec-writer.md`, `.claude/agents/test-writer.md`
- Modify: `openspec/config.yaml`

**Interfaces:**
- Produces: agent `qa-writer` (tools `Read, Grep, Glob, Write, Edit, Bash`, `model: inherit`) ghi **chỉ** `openspec/changes/<id>/test-cases.md`; báo cáo gồm số case, Scenario chưa có case, câu hỏi mở. `/relay` (Task 4) gọi nó theo tên này.

- [ ] **Step 1: `qa-writer.md`** theo cùng khung frontmatter + mục "Việc của bạn / Cách làm / Ranh giới / Báo cáo" như `spec-writer.md`. Đầu vào: change id. Cách làm: đọc `proposal.md` và `specs/**`, mỗi Scenario sinh ≥ 1 case chức năng, cộng case biên, a11y (bàn phím, nhãn), Mobile 375, Sáng/Tối, Offline khi hợp; đánh `e2e` cho case lặp lại và quan trọng, `không` cho phần còn lại; ID `TC-<ScenarioID>-<m>`. Ranh giới: chỉ ghi `test-cases.md`, nội dung chỉ thứ người học thấy (cùng luật `spec-driven.md` §3), không đoán business rule (ghi "Câu hỏi mở"). Nêu rõ: đây là **bản nháp** để QA chỉnh.
- [ ] **Step 2: `spec-writer.md`.** Thêm vào bước 6: `proposal.md` có mục `## Open Questions` (danh sách `- [ ]`; không có câu hỏi thì ghi một dòng `Không có.`, không dùng `- [ ]`), và chuyển các mơ hồ trong "Câu hỏi mở" của báo cáo thành item ở mục này. Ranh giới giữ nguyên: `spec-writer` không ghi `test-cases.md`, chỉ `qa-writer` ghi file đó.
- [ ] **Step 3: `test-writer.md`.** Thêm vào bước 4: với Scenario có case `e2e` trong `test-cases.md`, test e2e đặt tên chứa ID case, ví dụ `test('TC-S1.2-AC1-1: …')`, trong `apps/web/e2e/E<n>/`.
- [ ] **Step 4: `openspec/config.yaml`.** Thêm vào `rules.proposal`: `Include a "## Open Questions" section: "- [ ]" items for unresolved questions, or the single line "Không có." when none.`
- [ ] **Step 5: Verify OpenSpec không phản đối.** Tạo thư mục tạm bằng `pnpm exec openspec new change "tmp-qa-check"`, thêm vào `proposal.md` mục `## Open Questions` với một `- [ ]` và tạo `test-cases.md` rỗng cạnh nó, chạy `pnpm exec openspec validate --all --strict --no-interactive`. Expected: không có lỗi nào nhắc tới `Open Questions` hoặc `test-cases.md` (lỗi khác của change tạm, như thiếu spec, được phép). Xóa `openspec/changes/tmp-qa-check` sau đó và xác nhận `git status` sạch phần openspec.
- [ ] **Step 6: Commit** `feat(agents): thêm qa-writer, Open Questions cho spec-writer, e2e theo TC- cho test-writer` (khi được bảo).

---

### Task 4: Lệnh `/relay`

**Files:**
- Modify: `.claude/commands/relay.md`

**Interfaces:**
- Consumes: agent `qa-writer` (Task 3); label `plan-approved` (Task 1).

- [ ] **Step 1: Bảng vùng ghi** thêm hàng `qa-writer`: chỉ đổi `openspec/changes/<id>/test-cases.md`; vi phạm khi đổi bất kỳ file nào khác. Cập nhật hàng `spec-writer`: vi phạm thêm khi đổi `test-cases.md`.
- [ ] **Step 2: Pha `spec`.** Sau bước 2 (gọi `spec-writer`), thêm bước gọi `qa-writer`, kiểm vùng ghi. Bước 3 gộp: "Câu hỏi mở" của cả hai agent. Bước 5 đổi thông điệp dừng: mở **PR spec ở dạng draft**, Q&A trong comment, QA chỉnh `test-cases.md`, hết `- [ ]` thì chuyển ready, cần approve BA + QA + Dev.
- [ ] **Step 3: Pha `plan`, bước 6.** Báo: mở **PR code ở dạng draft chỉ chứa `design.md` + `tasks.md`**, chờ dev lead gắn `plan-approved`, rồi mới `/relay code`.
- [ ] **Step 4: Pha `code`, bước 1 (cổng).** Thêm điều kiện: PR của nhánh hiện tại có label `plan-approved`. Cách kiểm: `gh pr view --json labels --jq '.labels[].name'` có `plan-approved`; chưa có PR hoặc chưa có label thì **dừng** và nói cần mở PR draft + chờ lead duyệt. Ngoại lệ có tên: change đánh dấu docs/config/asset thuần (không có Scenario) bỏ cổng này.
- [ ] **Step 5: Pha `code`, bước 4 và pha `fix`.** Bước 4 (dừng trước PR) thêm: nhắc PR chuyển *ready* khi CI xanh và báo QA nghiệm thu. Pha `fix` thêm loại feedback `qa` (case Fail trong comment QA) → xử lý như `code`/`test`, rồi báo QA chạy lại đúng case fail.
- [ ] **Step 6: Verify.** Run: `grep -n "qa-writer\|plan-approved\|test-cases" .claude/commands/relay.md`. Expected: có cả 3 từ khóa, ở các pha `spec`, `plan`, `code`.
- [ ] **Step 7: Commit** `feat(relay): thêm qa-writer, PR draft và cổng plan-approved` (khi được bảo).

---

### Task 5: Workflow `Spec approvals`

**Files:**
- Create: `.github/workflows/spec-approvals-workflow.yml`

**Interfaces:**
- Produces: check tên `Spec approvals`. Cấu trúc theo `spec-gate-workflow.yml` (comment đầu file nêu quy trình, `permissions: contents: read, pull-requests: read`, bước bash `set -euo pipefail`, `GH_TOKEN: ${{ github.token }}`).

Trigger: `pull_request` (`opened, synchronize, reopened, edited, ready_for_review, converted_to_draft`) và `pull_request_review` (`submitted, dismissed`). Concurrency theo số PR, `cancel-in-progress: true`. Số PR lấy từ `github.event.pull_request.number` ở cả hai sự kiện. Env: `BA_APPROVERS`, `QA_APPROVERS`, `DEV_APPROVERS` lấy từ `vars.*`.

- [ ] **Step 1: Khung job `Spec approvals`.** Nếu `HEAD_REF` không bắt đầu bằng `spec/` thì in "không phải PR spec" và `exit 0`. Nếu `github.event.pull_request.draft == true` thì `::error::` "PR spec đang draft, chuyển ready khi hết Open Questions" và `exit 1`.
- [ ] **Step 2: Tìm các change bị đụng.** `gh api repos/$REPO/pulls/$PR/files --paginate --jq '.[] | [.status,.filename] | @tsv'`, lọc đường dẫn `openspec/changes/<id>/…` (bỏ `archive/`). Với mỗi `<id>` kiểm:
  - Mở `proposal.md` ở `HEAD_SHA` bằng `gh api repos/$REPO/contents/openspec/changes/$id/proposal.md?ref=$HEAD_SHA -H "Accept: application/vnd.github.raw"`. Đếm item chưa tick trong mục `Open Questions` bằng đúng lệnh: `awk '/^##[[:space:]]+Open Questions/{s=1;next} /^##[[:space:]]/{s=0} s && /^[[:space:]]*- \[ \]/{n++} END{print n+0}'`. Lớn hơn 0 thì fail kèm số câu hỏi. Không có proposal (PR chỉ sửa `specs/`, và proposal có sẵn trên `main`) thì vẫn đọc được qua `ref=$HEAD_SHA`.
  - Chỉ khi `proposal.md` có trạng thái `added` trong danh sách file của PR: đòi `test-cases.md` tồn tại ở `HEAD_SHA` (HTTP 200), thiếu thì fail. (Review Focus #5: change cũ không bị fail oan.)
- [ ] **Step 3: Đếm approve.** Lấy `gh api repos/$REPO/pulls/$PR/reviews --paginate`, giữ review **mới nhất theo từng `user.login`** (`group_by(.user.login) | map(max_by(.submitted_at))`, bỏ state `COMMENTED`), lấy những người có `state == "APPROVED"`. Với mỗi vai trong `BA`, `QA`, `DEV`: biến rỗng thì fail "chưa cấu hình repo variable `<tên>`"; không có approver nằm trong danh sách (so khớp không phân biệt hoa thường) thì fail "thiếu approve của <vai>". In bảng vai nào đã/chưa.
- [ ] **Step 4: Verify bằng dữ liệu mẫu.** Lưu 3 file mẫu (có `- [ ]` dưới Open Questions; chỉ `Không có.`; không có mục) vào scratchpad và chạy đúng lệnh `awk` ở Step 2. Expected: `1`, `0`, `0`. Chạy `jq` của Step 3 trên JSON mẫu có 2 review của một người (`APPROVED` rồi `CHANGES_REQUESTED`). Expected: người đó không nằm trong danh sách approver.
- [ ] **Step 5: Lint.** Run: `actionlint .github/workflows/spec-approvals-workflow.yml` (nếu chưa có: `brew install actionlint`, công cụ dev, không thêm vào repo). Expected: không có lỗi. Không có `actionlint` thì `python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" .github/workflows/spec-approvals-workflow.yml` và nói rõ trong báo cáo là chỉ kiểm cú pháp.
- [ ] **Step 6: Commit** `ci: thêm check Spec approvals (3 vai, Open Questions, test-cases.md)` (khi được bảo).

---

### Task 6: Workflow `Plan đã duyệt` và `QA sign-off`

**Files:**
- Create: `.github/workflows/gates-workflow.yml`

**Interfaces:**
- Produces: 2 check `Plan đã duyệt`, `QA sign-off`. Permissions: `contents: read`, `pull-requests: write`, `issues: write`. Trigger `pull_request`: `opened, edited, synchronize, reopened, labeled, unlabeled, ready_for_review`. Concurrency theo số PR, `cancel-in-progress: false` (không để một lần chạy bị huỷ giữa lúc gỡ label).

Ba job: `invalidate` (chỉ khi `github.event.action == 'synchronize'`), rồi `plan-gate` và `qa-gate` với `needs: invalidate` và `if: ${{ !cancelled() && (needs.invalidate.result == 'success' || needs.invalidate.result == 'skipped') }}`, để gate đọc label **sau** khi đã gỡ.

- [ ] **Step 1: Đoạn bash dùng chung** (lặp lại trong từng job, mỗi job độc lập): lấy `HEAD_REF`, `PR_BODY`; nếu `HEAD_REF == spec/*` hoặc dòng `Spec PR:` chứa `N/A` (cùng `grep -iE '^[[:space:]-]*Spec PR:'` như `spec-gate-workflow.yml`) thì in lý do và `exit 0`. Danh sách file PR: `gh api repos/$REPO/pulls/$PR/files --paginate --jq '.[].filename'`; nếu mọi file đều bắt đầu bằng `openspec/` hoặc `docs/` thì `exit 0` (PR chỉ docs/spec, cùng luật `review-workflow.yml`).
- [ ] **Step 2: Job `plan-gate`** (`name: Plan đã duyệt`). Sau Step 1: lấy label hiện tại `gh api repos/$REPO/issues/$PR/labels --jq '.[].name'`. Thiếu `plan-approved` thì fail "PR chưa được dev lead duyệt plan". Có label thì lấy người gắn gần nhất: `gh api repos/$REPO/issues/$PR/events --paginate --jq '[.[] | select(.event=="labeled" and .label.name=="plan-approved")] | last | .actor.login'`. Người đó không nằm trong `vars.PLAN_APPROVERS` (không phân biệt hoa thường) hoặc biến rỗng thì fail, nêu rõ lý do. (Review Focus #2.)
- [ ] **Step 3: Job `qa-gate`** (`name: QA sign-off`). Giống Step 2 với `qa-approved` và `vars.QA_APPROVERS`; thêm: PR đang draft (`github.event.pull_request.draft`) thì fail "chuyển PR sang ready trước khi QA nghiệm thu".
- [ ] **Step 4: Job `invalidate`.** `before=${{ github.event.before }}`, `after=${{ github.event.after }}`; `files=$(gh api repos/$REPO/compare/$before...$after --jq '.files[].filename' || echo __error__)`. Với lỗi (force-push làm mất `before`) coi là **có đổi** (an toàn hơn). Quy tắc:
  - có file khớp `openspec/changes/*/design.md` → `gh api -X DELETE repos/$REPO/issues/$PR/labels/plan-approved` (bỏ qua 404);
  - có file **ngoài** `openspec/` và `docs/` → gỡ `qa-approved` tương tự;
  - chỉ `tasks.md` (hoặc file docs/spec khác) → không gỡ gì. (Review Focus #3.)
- [ ] **Step 5: Verify bằng dữ liệu mẫu.** Với danh sách file mẫu, chạy riêng các hàm phân loại của Step 1 và Step 4 trong shell: (a) chỉ `openspec/changes/x/tasks.md` → không gỡ label nào; (b) `openspec/changes/x/design.md` → gỡ plan; (c) `apps/web/src/a.ts` → gỡ qa; (d) `docs/a.md` + `openspec/…` → `exit 0` ở Step 1 (PR docs thuần). Ghi kết quả 4 trường hợp vào báo cáo.
- [ ] **Step 6: Lint.** Như Task 5 Step 5, trên `gates-workflow.yml`. Expected: không lỗi (đặc biệt không có cảnh báo expression/`needs`).
- [ ] **Step 7: Commit** `ci: thêm check Plan đã duyệt, QA sign-off và gỡ label khi push` (khi được bảo).

---

### Task 7: Artifact build trong CI

**Files:**
- Modify: `.github/workflows/ci-workflow.yml`

- [ ] **Step 1: Xác định thư mục build.** Run: `grep -n "outDir\|\"preview\"" apps/web/vite.config.* apps/web/package.json`. Expected: tìm ra thư mục (mặc định `apps/web/dist`) và script `preview`. Dùng đúng đường dẫn tìm được ở bước sau; nếu khác `apps/web/dist` thì cập nhật cả Task 1 Step 2.
- [ ] **Step 2: Thêm bước cuối job `check`**, chỉ khi `github.event_name == 'pull_request'`: `actions/upload-artifact@v4` với `name: web-dist`, `path: apps/web/dist`, `retention-days: 14`, `if-no-files-found: error`.
- [ ] **Step 3: Lint** `actionlint .github/workflows/ci-workflow.yml` (hoặc kiểm cú pháp YAML như Task 5). Expected: không lỗi.
- [ ] **Step 4: Commit** `ci: upload artifact web-dist cho QA nghiệm thu` (khi được bảo).

---

### Task 8: Kiểm tra tổng thể và bàn giao cấu hình tay

**Files:** không sửa file nào (trừ sửa lỗi phát hiện).

- [ ] **Step 1: Nhất quán tên.** Run: `grep -rn "plan-approved\|qa-approved\|Spec approvals\|QA sign-off\|Plan đã duyệt" docs/05-standards CLAUDE.md .github .claude`. Expected: mọi nơi dùng đúng nguyên văn tên trong "Global Constraints"; không có biến thể (`plan_approved`, `QA signoff`…).
- [ ] **Step 2: Bộ kiểm chuẩn.** Run: `pnpm exec openspec validate --all --strict --no-interactive && pnpm typecheck && pnpm lint && pnpm test:run`. Expected: pass (thay đổi không đụng code, kiểm để chắc không vỡ gì).
- [ ] **Step 3: Đối chiếu bản thiết kế.** Đọc lại `docs/04-specs/2026-11-13-qa-review-workflow.md` §7, tích từng dòng bảng "Các thay đổi phải làm" với file đã sửa; thiếu dòng nào thì làm bù.
- [ ] **Step 4: Bàn giao việc làm tay cho người dùng** (không tự chạy, vì đổi cài đặt repo): tạo 2 label, đặt 4 variables, điền handle thật vào CODEOWNERS, đặt 3 check mới làm required, rồi **thử trên 3 PR giả**: (1) PR spec draft có `- [ ]` → `Spec approvals` fail; (2) PR code với `plan-approved` do chính tác giả gắn → `Plan đã duyệt` fail; (3) PR code đã `qa-approved` rồi push thêm → label bị gỡ, `QA sign-off` fail. Ghi các bước này thành checklist trong báo cáo cuối.
- [ ] **Step 5: Mở PR** theo template: `Spec PR: N/A`, `OpenSpec change: N/A`, Screenshots `N/A`, chỉ tick các ô đã kiểm (khi được bảo).
