# Spec-driven + TDD

Mỗi story đi qua một vòng duy nhất: **Story → OpenSpec change → RED → GREEN → REFACTOR → verify → archive**.
AC của story trở thành Scenario, Scenario trở thành test chạy được, và sau khi merge, spec phản ánh
đúng hành vi đã giao.

Cấu hình OpenSpec: [`openspec/config.yaml`](../../openspec/config.yaml). Luật tóm tắt nằm ở
`CLAUDE.md` §0 và §8, file này giữ phần chi tiết.

## 1. Hai nguồn, hai vai trò

| Nguồn | Vai trò | Ai sửa |
|---|---|---|
| `docs/02-design/epics-stories.md` + GitHub Issues | **Backlog**: ý định và AC ban đầu của story | Chỉ khi đổi yêu cầu. Không sửa AC cũ sau khi story đã archive |
| `openspec/specs/` | **Hành vi đã giao**: nguồn sự thật về app đang làm gì | Chỉ qua `openspec archive` |
| `openspec/changes/<id>/` | Thay đổi **đang làm**, chờ duyệt rồi code | Trong lúc làm story |

E1 và E2 đã xong trước khi có OpenSpec nên không migrate. Áp dụng từ story kế tiếp.

## 2. Vòng làm một story

Mỗi story đi qua **ba pha, hai PR**, mỗi pha có chủ riêng. Ở pha Spec, ba vai BA/QA/Dev do **agent** đảm nhiệm và tự tranh luận; người thật duyệt cuối. QA nghiệm thu, dev giữ code, dev lead giữ cổng plan.

| Pha | Chủ | PR | Kết thúc khi |
|---|---|---|---|
| A. Spec | Agent BA + QA + Dev, rồi người thật duyệt | **PR spec** (nhánh `spec/s<epic>-<n>-<slug>`) | PR spec được review và **merge vào `main`**; change vẫn nằm ở `openspec/changes/`, chỉ có `proposal.md` + `specs/` + `test-cases.md` |
| B. Code | Dev, dev lead (plan), QA (nghiệm thu) | **PR code** (nhánh `feat/s<epic>-<n>-<slug>`, cắt từ `main` sau pha A) | plan được duyệt, QA nghiệm thu, PR code được review và merge; mọi task trong `tasks.md` đã tick |
| C. Archive | Workflow | **PR archive** tự mở sau khi PR code merge | PR archive được merge |

### Pha A: Spec (agent BA + QA + Dev, rồi người thật)

Ba agent đảm nhiệm ba vai: `spec-ba` viết spec, `spec-qa` viết `test-cases.md`, `spec-dev` chỉ duyệt; cả ba duyệt chéo ở chế độ DUYỆT (agent mới, chỉ đọc) và tranh luận qua tối đa 3 vòng. Chỗ agent không quyết được (business rule) thành `- [ ]` cho người thật. Người thật chỉ review sau khi cả ba agent đã approve. Thiết kế: `docs/04-specs/2026-11-13-agent-spec-review.md`.

| # | Bước | Lệnh / việc | Cổng |
|---|---|---|---|
| A1 | Chọn story, tạo nhánh `spec/s<epic>-<n>-<slug>` | | |
| A2 | **Propose** | `/relay spec s<epic>-<n>-<slug>`: `spec-ba` viết `proposal.md` + `specs/`, `spec-qa` soạn nháp `test-cases.md` (không `design.md`, `tasks.md`; nếu dùng `/opsx:propose` thì xoá hai file đó khỏi PR spec) | `pnpm exec openspec validate --all --strict` pass |
| A3 | **Vòng tranh luận** | Ba agent (chế độ DUYỆT) đọc spec, ra `VERDICT` + finding; `spec-ba`/`spec-qa` sửa; lặp tối đa 3 vòng. Mỗi finding để lại dấu vết `- [x] … → …` trong `## Open Questions`; câu cần người quyết để `- [ ]` | Cả ba agent `approve` |
| A4 | Mở **PR spec** và đăng verdict | Theo template, `Spec PR: N/A`, `Refs #<story>`, Screenshots `N/A`. Đăng một comment có marker `<!-- csk-spec-agents sha=… ba=approve qa=approve dev=approve -->` (xem `/relay spec`) | |
| A5 | Chuyển PR sang **ready for review** | Chỉ khi ba agent đã approve, `Open Questions` hết `- [ ]` và `test-cases.md` đã có | |
| A6 | **Người thật review và merge** | Một người trong `SPEC_APPROVERS` approve, trả lời các `- [ ]` còn lại nếu có. Không có code trong PR này | `Spec approvals` xanh |

### Pha B: Code (dev)

| # | Bước | Lệnh / việc | Cổng |
|---|---|---|---|
| B1 | Cắt nhánh `feat/s<epic>-<n>-<slug>` từ `main` đã có spec | | PR spec đã merge |
| B1a | **Plan** | `/relay plan <id>`: tạo `design.md` (cách làm, layer, file) và `tasks.md` (cặp RED/GREEN cho mỗi Scenario). Mở **PR code ở dạng draft chỉ chứa hai file này**. Spec sai/thiếu thì dừng, mở PR spec fix | `openspec validate --all --strict` pass |
| B1b | **Duyệt plan** | Dev lead review `design.md` + `tasks.md` rồi gắn label `plan-approved`. Chỉ người trong `PLAN_APPROVERS` được tính. Sửa `design.md` sau đó thì label bị gỡ và phải duyệt lại; chỉ tick `tasks.md` thì không | `Plan đã duyệt` xanh; **chưa có label thì chưa viết code** (`/relay code` từ chối chạy) |
| B2 | **RED** | Viết test cho một Scenario, chạy, thấy fail đúng lý do. Commit `test(...)` | Phải có output fail |
| B3 | **GREEN** | `/opsx:apply`: code tối thiểu, đúng layer (CLAUDE.md §1–§3). Commit `feat(...)` | Test pass |
| B4 | **REFACTOR** | Dọn code, giữ xanh | |
| B5 | **Verify** | `pnpm typecheck && pnpm lint && pnpm test:run` (+ `content:check`, `e2e` theo CLAUDE.md §8) | Toàn bộ pass |
| B6 | Chuyển **PR code** sang ready | Theo template, ghi `Spec PR: #<số PR spec>`. `Closes #<story>` nếu xong mọi AC, ngược lại `Refs #<story>` | `Spec PR đã merge` (bên dưới) xanh |
| B6a | **QA nghiệm thu** | QA chạy `test-cases.md` trên artifact `web-dist` của CI: tải về, giải nén vào `apps/web/dist`, chạy `pnpm --filter @csk/web exec vite preview --port 4173`. Kết quả ghi trong **một comment** (bảng `TC \| Pass/Fail \| Ghi chú`). Case Fail: Dev sửa trong PR, QA chạy lại case đó. Pass hết thì gắn label `qa-approved` (chỉ `QA_APPROVERS`). Push code mới thì label bị gỡ | `QA sign-off` xanh |

Lặp B2–B4 cho từng Scenario, không viết hết test rồi mới code. Case của `test-cases.md` có cột
Tự động = `e2e` do `test-writer` viết ở `apps/web/e2e/E<n>/`, tên test mang ID `TC-…`. **Không archive trong PR code.**

### Pha C: Archive (tự động)

Khi PR code merge vào `main`, workflow `archive-spec-workflow.yml` lấy id change từ dòng
`OpenSpec change:` của PR, và nếu mọi task đã tick thì chạy `openspec archive`, `openspec validate
--all --strict`, rồi mở PR `docs(openspec): archive <id>`. Còn task chưa tick nghĩa là story làm nhiều
PR code, workflow bỏ qua và chờ PR cuối. Cần chạy lại thủ công thì dùng `workflow_dispatch` với id change.

PR archive chỉ đổi `openspec/`, cần review nhanh rồi merge. Nếu PR archive không tự chạy CI thì
cấu hình secret `ARCHIVE_PR_TOKEN` (PR tạo bằng `GITHUB_TOKEN` không kích hoạt workflow khác).

### Các cổng

| Check (bắt buộc) | Áp dụng cho | Fail khi |
|---|---|---|
| `Spec approvals` | PR spec (nhánh `spec/*`) | PR còn draft; `proposal.md` còn `- [ ]` trong `## Open Questions`; PR thêm `proposal.md` mới mà thiếu `test-cases.md`; thiếu verdict `approve` của cả ba agent BA / QA / Dev trong comment có marker đúng **commit đầu hiện tại** (comment của OWNER/MEMBER/COLLABORATOR, mới nhất); thiếu approve của một người trong `SPEC_APPROVERS` (cũng chỉ tính trên commit đầu hiện tại; tác giả PR được tính nếu nằm trong danh sách, vì GitHub không cho tự approve) |
| `Spec PR đã merge` | PR code | Thiếu dòng `Spec PR:`, số PR sai, hoặc PR spec chưa merge (chi tiết bên dưới) |
| `Plan đã duyệt` | PR đổi file dưới `apps/` hoặc `packages/` | Chưa có label `plan-approved`, hoặc người gắn không thuộc `PLAN_APPROVERS`, hoặc chính là tác giả PR |
| `QA sign-off` | PR đổi file dưới `apps/` hoặc `packages/` | PR còn draft, chưa có label `qa-approved`, hoặc người gắn không thuộc `QA_APPROVERS`, hoặc chính là tác giả PR |

**Phạm vi của `Plan đã duyệt` và `QA sign-off` tính theo FILE đổi, không theo tên nhánh hay dòng `Spec PR:`**
(hai thứ đó tự khai được). PR không đổi file nào dưới `apps/` hoặc `packages/` (PR spec, PR archive, docs, config,
workflow) được miễn: job vẫn chạy và pass để check bắt buộc không treo pending. PR có đổi `apps/` hoặc `packages/`
luôn cần cả hai cổng, kể cả khi ghi `Spec PR: N/A`. Hệ quả: PR chỉ đổi asset nằm trong `apps/` (ví dụ font) cũng
cần dev lead và QA duyệt.

**Spec PR đã merge.** PR code **bắt buộc** có dòng `Spec PR: #<số>` ở mục References, và PR đó phải ở trạng
thái **merged**. Check `Spec PR đã merge` (`spec-gate-workflow.yml`) fail nếu thiếu dòng, số PR sai, hoặc PR
spec chưa merge. PR ghi `Closes #<story>` (PR cuối của story) còn phải có dòng `OpenSpec change:` và mọi task
trong `tasks.md` đã tick, nếu không workflow archive sẽ bỏ qua change; PR một phần dùng `Refs #<story>`.
Khi PR spec merge, workflow tự chạy lại check cho các PR code đang chờ. Dùng `Spec PR: N/A`
cho PR không có spec đi kèm (docs, config, asset thuần) và cho chính PR spec và PR archive.

**Giới hạn đã biết.** GitHub không chặn được việc push commit lên nhánh. Các cổng chặn **merge**; agent
(`/relay code`) tuân thủ cổng plan. Dev cố tình code trước vẫn push được nhưng PR không merge được. Một người nằm
trong nhiều danh sách vẫn được tính đủ nhiều vai.

**Cấu hình repo (làm tay, không nằm trong file):**

1. Tạo label: `gh label create plan-approved --color 0E8A16` và `gh label create qa-approved --color 1D76DB`.
2. Đặt repo variables (Settings → Secrets and variables → Actions → Variables), giá trị là handle GitHub cách nhau
   dấu phẩy: `SPEC_APPROVERS` (người thật duyệt spec), `QA_APPROVERS`, `PLAN_APPROVERS`. (`BA_APPROVERS`, `DEV_APPROVERS` không còn dùng.) Giới hạn: verdict của agent là comment do tài khoản của người chạy `/relay spec` đăng, nên cổng chỉ chắc chắn rằng quy trình đã chạy, không chứng minh agent thật sự duyệt; vì thế người thật vẫn bắt buộc approve.
3. Điền handle thật vào `.github/CODEOWNERS` (BA, QA, Dev, dev lead).
4. Branch protection của `main`: bắt buộc approval và đặt `Spec PR đã merge`, `Spec approvals`,
   `Plan đã duyệt`, `QA sign-off`, `Review` làm required. Bật **Require review from Code Owners** và
   **Dismiss stale pull request approvals**.
5. CODEOWNERS gán `/.github/` cho dev lead: PR đổi workflow chạy workflow của chính nó, nên không có bước này thì
   một PR có thể sửa cổng thành luôn xanh.
6. Repo chỉ có một người thì không ai thỏa "khác tác giả": hai cổng label sẽ không pass với PR của người đó. Khi chạy
   thử, dùng tài khoản thứ hai, hoặc chưa đặt hai check này làm required.
7. PR archive do `GITHUB_TOKEN` tạo không kích hoạt workflow, nên các check required treo pending nếu thiếu
   secret `ARCHIVE_PR_TOKEN` (xem Pha C).

### Spec sai hoặc thiếu khi đang code

Dev không sửa spec trong PR code. Mở PR spec mới (`spec/s<epic>-<n>-<slug>-fix`) cho BA duyệt, merge,
rồi rebase nhánh code. PR code trỏ lại số PR spec mới nhất trong dòng `Spec PR:` nếu thay đổi đó là
điều kiện để code.

CODEOWNERS gán `openspec/` cho BA + QA + Dev, `test-cases.md` cho QA, `design.md` và `tasks.md` cho dev lead,
phần còn lại cho dev, để mỗi PR tự xin đúng người review.

## 3. Viết spec

Chép AC của story **nguyên văn** thành một Requirement. Mỗi AC có ít nhất một Scenario, tên Scenario
bắt đầu bằng ID `S<epic>.<n>-AC<k>`.

```markdown
## ADDED Requirements

### Requirement: Mở app khi không có mạng
Hệ thống SHALL cho vào lộ trình khi đã mở app ít nhất một lần và hiện không có mạng.

#### Scenario: S1.2-AC1 Mở lại app khi offline
- **WHEN** người học đã mở app một lần, tắt mạng rồi mở lại
- **THEN** app vào được màn lộ trình
```

Quy tắc:
- Scenario không kiểm tra tự động được thì **viết lại Scenario**, đừng bỏ qua test.
- Heading cấu trúc và `SHALL`/`MUST` giữ tiếng Anh, nội dung tiếng Việt.
- Proposal ghi layer đích theo CLAUDE.md §1 và những gì **không** làm.

### Open Questions trong proposal

`proposal.md` có mục `## Open Questions`: mỗi chỗ mơ hồ là một dòng `- [ ]`. Agent duyệt hỏi, `spec-ba` trả
lời và sửa spec rồi đổi thành `- [x] <câu hỏi> → <xử lý>`; câu cần người quyết để `- [ ]` cho người thật trả lời trong comment PR. Không có câu hỏi thì ghi một dòng `Không có.`
(không dùng `- [ ]`). Còn `- [ ]` thì check `Spec approvals` fail.

### Viết `test-cases.md`

`openspec/changes/<id>/test-cases.md` do `spec-qa` soạn (agent QA), `spec-ba`/`spec-dev` duyệt, QA người thật chỉnh khi nghiệm thu, nằm trong PR spec. Chỉ dùng
thứ người học nhìn thấy, cùng luật với spec. Mỗi Scenario có ít nhất một case.

```markdown
| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S1.2-AC1-1 | S1.2-AC1 | Chức năng | Mở app, tắt mạng, mở lại | Vào được màn Lộ trình | e2e |
| TC-S1.2-AC1-2 | S1.2-AC1 | Offline | … | … | không |
```

- ID: `TC-<ID Scenario>-<số thứ tự>`.
- **Loại:** Chức năng, Biên, A11y, Mobile 375, Sáng/Tối, Offline.
- **Tự động:** `e2e` (case lặp lại và quan trọng, đưa vào Playwright trong PR code) hoặc `không` (QA chạy tay
  mỗi lần nghiệm thu).
- Story nhỏ: 1–3 dòng là đủ.

### Viết cho BA/QA

Spec là tài liệu BA/QA đọc để biết app *làm gì*. Chỉ dùng thứ người học nhìn thấy: màn hình, nút,
nhãn, kết quả. Route, tên field/store/hàm, mã nội bộ, tên thư viện để ở `design.md` hoặc trong test.

Quy tắc có nhiều trường hợp thì viết thành bảng, câu mở đầu vẫn chứa `SHALL`/`MUST`:

```markdown
### Requirement: Mỗi bài có đúng một trạng thái
Hệ thống SHALL hiện cho mỗi bài một trong ba trạng thái, bằng chữ chứ không chỉ bằng màu:

| Trạng thái | Nhãn hiện ra | Khi nào |
|---|---|---|
| Đã xong | "Đã xong" | Người học đã hoàn thành bài |
| Đang mở | "Đang mở" | Bài đầu tiên của lộ trình, hoặc bài ngay sau một bài đã xong |
| Khóa | "Đã khóa" | Các bài còn lại |
```

| Trước | Sau |
|---|---|
| THEN app chuyển tới route `/lessons/<id bài>` | THEN người học vào màn học của bài đó |
| WHEN dữ liệu tiến độ đã lưu không hợp lệ | WHEN kết quả học đã lưu của một bài không đọc được |
| WHEN mở route `/learning-paths` | WHEN người học mở màn Lộ trình |

Tự kiểm trước khi gửi duyệt:
- Requirement/Scenario còn route, tên field, tên store, tên hàm hay mã nội bộ không?
- Quy tắc nhiều trường hợp đã thành bảng chưa?
- Người không đọc code có hiểu WHEN/THEN không?
- Chi tiết đã bỏ có nằm trong `design.md` hoặc test chưa?

## 4. Scenario → tầng test

Chọn tầng thấp nhất kiểm tra được hành vi. Test đặt **cạnh file nguồn** (`*.test.ts(x)`), trừ e2e.

| Scenario nói về | Tầng | Công cụ | Vị trí |
|---|---|---|---|
| Quy tắc nghiệp vụ (mở khóa, chấm điểm, SRS) | `shared/services` Phần 2 | Vitest, hàm thuần, không mock store | `*.service.test.ts` |
| Flow nhiều bước, đọc/ghi tiến độ | `shared/services` Phần 3 | Vitest + `fake-indexeddb` (đã có trong `src/test/setup.ts`) | `*.service.test.ts` |
| Hook, component | `pages/<feature>/…`, `core/hooks` | Vitest + Testing Library (`src/test/render.tsx`) | cạnh file |
| Schema nội dung / tiến độ | `packages/shared` | Vitest | `*.schema.test.ts` |
| Luồng người dùng, PWA, offline | e2e | Playwright | `apps/web/e2e/E<n>/s<n.m>-<slug>.spec.ts` |

Đặt tên test chứa ID để tìm bằng `grep`:

```ts
it('S1.2-AC1: vào được lộ trình khi offline', () => { … });
```

Playwright theo mẫu hiện có: `test.describe('S1.3 …')`, mỗi test mang ID AC.

## 5. TDD: RED rồi mới GREEN

Luật: **không viết code production khi chưa có test fail cho Scenario.**

1. **RED.** Viết một test cho một Scenario. Chạy. Test phải **fail** vì hành vi chưa có, không phải vì
   lỗi import hay gõ sai. Nếu test pass ngay là test sai, sửa test.
2. **GREEN.** Viết code tối thiểu cho test pass. Không thêm hành vi chưa có test.
3. **REFACTOR.** Chỉ sau khi xanh. Không thêm hành vi mới.

Không phải mock: ưu tiên code thật. Chỉ mock ranh giới ngoài (audio, speech). Test phải kiểm tra hành vi,
không kiểm tra mock.

**Ngoại lệ không cần test trước** (ghi rõ trong task): sửa docs thuần, config thuần, asset thuần.
Sửa lỗi vẫn phải có test tái hiện lỗi trước khi sửa.

## 6. Change nhỏ

Story rất nhỏ vẫn dùng vòng này nhưng tối giản: proposal một đoạn, một Scenario, một cặp RED/GREEN.
Không bỏ qua bước propose.

## 7. Chạy bằng agent: `/relay`

Lệnh `/relay <spec|plan|code|fix> <change-id>` chạy các pha trên bằng subagent tách context. Luật không đổi,
chỉ có thêm cách chạy. Phiên chính là **người điều phối**: không tự viết spec/test/code, mỗi lần giao
việc là một agent mới, thông tin đi qua file và git diff.

| Agent (`.claude/agents/`) | Pha | Được ghi | Trả về |
|---|---|---|---|
| `spec-ba` | A | `proposal.md`, `specs/` trong `openspec/changes/<id>/` (chế độ VIẾT/SỬA); chế độ DUYỆT: không gì cả | change id, Scenario, kết quả validate; hoặc `VERDICT` + finding |
| `spec-qa` | A | `test-cases.md` (bản nháp cho QA chỉnh; chế độ DUYỆT: không gì cả) | số case, Scenario chưa có case, câu hỏi mở; hoặc `VERDICT` + finding |
| `spec-dev` | A | không gì cả (chỉ DUYỆT) | `VERDICT: approve\|block` + finding (`blocker`/`major`/`minor`/`human`) |
| `planner` | B1a | `design.md`, `tasks.md` (không sửa spec) | số task, layer, file dự kiến, vấn đề với spec |
| `test-writer` | B2 (RED) | file test | test + output fail đúng lý do |
| `implementer` | B3–B4 (GREEN, REFACTOR), sửa finding | code production, không file test | file đã đổi + output pass |
| `reviewer` | trên CI sau khi PR mở (check "Review") | không gì cả | inline comment theo finding + độ phủ Scenario |

Tách `test-writer` khỏi `implementer` để người viết code không sửa test cho dễ pass. `reviewer` không
nhận lời giải thích của `implementer`, chỉ nhận diff, spec và `CLAUDE.md`.

- **Vùng ghi:** subagent không giới hạn được đường dẫn bằng cấu hình, nên sau mỗi agent điều phối
  kiểm `git status`. Agent ghi sai vùng thì điều phối dừng và báo người dùng.
- **Review trên CI:** `.github/workflows/review-workflow.yml` chạy `reviewer` mỗi lần push vào PR có
  đổi ngoài `openspec/` và `docs/`. Finding thành inline comment; job fail khi còn `blocker`/`major`,
  nên check "Review" đặt được làm required. Cần secret `CLAUDE_CODE_OAUTH_TOKEN` (từ `claude setup-token`).
- **Vòng review:** `blocker`/`major` đi qua tối đa 2 vòng sửa; từ lần review thứ 3 CI chỉ comment, không
  fail. Finding loại `spec` dừng ngay: agent soạn patch spec ở nhánh `spec/<id>-fix`, BA duyệt qua PR
  spec. Hết 2 vòng mà còn `blocker`/`major` thì dừng hẳn và báo người dùng, không tự chạy vòng 3,
  không hạ mức độ finding.
- **Sửa theo feedback:** sau khi mở PR, phiên gắn PR (`bind_pr`, `set_monitor`); có review comment
  hoặc CI đỏ thì app đánh thức agent chạy `/relay fix <id>` (subagent mới cho mỗi việc). Phiên mới vẫn
  chạy được: trạng thái nằm ở nhánh, `tasks.md` và comment PR.
- **Cổng plan:** `/relay code` từ chối chạy khi PR của nhánh chưa có label `plan-approved` (trừ change không có
  Scenario: docs, config, asset thuần).
- `/relay` dừng trước khi commit/mở PR; người dùng quyết.
