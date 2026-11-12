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

Mỗi story đi qua **ba pha, hai PR**, mỗi pha có chủ riêng. BA giữ spec, dev giữ code, không ai phải
chờ ai báo lại.

| Pha | Chủ | PR | Kết thúc khi |
|---|---|---|---|
| A. Spec | BA | **PR spec** (nhánh `spec/s<epic>-<n>-<slug>`) | PR spec được review và **merge vào `main`**; change vẫn nằm ở `openspec/changes/`, chỉ có `proposal.md` + `specs/` |
| B. Code | Dev | **PR code** (nhánh `feat/s<epic>-<n>-<slug>`, cắt từ `main` sau pha A) | PR code được review và merge; mọi task trong `tasks.md` đã tick |
| C. Archive | Workflow | **PR archive** tự mở sau khi PR code merge | PR archive được merge |

### Pha A: Spec (BA)

| # | Bước | Lệnh / việc | Cổng |
|---|---|---|---|
| A1 | Chọn story, tạo nhánh `spec/s<epic>-<n>-<slug>` | | |
| A2 | **Propose** | `/relay spec s<epic>-<n>-<slug>`: chỉ `proposal.md` và `specs/` (không `design.md`, `tasks.md`; nếu dùng `/opsx:propose` thì xoá hai file đó khỏi PR spec) | `pnpm exec openspec validate --all --strict` pass |
| A3 | Mở **PR spec** | Theo template, `Spec PR: N/A`, `Refs #<story>`, Screenshots `N/A` | **Review và merge**; không có code trong PR này |

### Pha B: Code (dev)

| # | Bước | Lệnh / việc | Cổng |
|---|---|---|---|
| B1 | Cắt nhánh `feat/s<epic>-<n>-<slug>` từ `main` đã có spec | | PR spec đã merge |
| B1a | **Plan** | `/relay plan <id>`: tạo `design.md` (cách làm, layer, file) và `tasks.md` (cặp RED/GREEN cho mỗi Scenario). Đi cùng PR code. Spec sai/thiếu thì dừng, mở PR spec fix | `openspec validate --all --strict` pass |
| B2 | **RED** | Viết test cho một Scenario, chạy, thấy fail đúng lý do. Commit `test(...)` | Phải có output fail |
| B3 | **GREEN** | `/opsx:apply`: code tối thiểu, đúng layer (CLAUDE.md §1–§3). Commit `feat(...)` | Test pass |
| B4 | **REFACTOR** | Dọn code, giữ xanh | |
| B5 | **Verify** | `pnpm typecheck && pnpm lint && pnpm test:run` (+ `content:check`, `e2e` theo CLAUDE.md §8) | Toàn bộ pass |
| B6 | Mở **PR code** | Theo template, ghi `Spec PR: #<số PR spec>`. `Closes #<story>` nếu xong mọi AC, ngược lại `Refs #<story>` | Cổng spec (bên dưới) xanh |

Lặp B2–B4 cho từng Scenario, không viết hết test rồi mới code. **Không archive trong PR code.**

### Pha C: Archive (tự động)

Khi PR code merge vào `main`, workflow `archive-spec-workflow.yml` lấy id change từ dòng
`OpenSpec change:` của PR, và nếu mọi task đã tick thì chạy `openspec archive`, `openspec validate
--all --strict`, rồi mở PR `docs(openspec): archive <id>`. Còn task chưa tick nghĩa là story làm nhiều
PR code, workflow bỏ qua và chờ PR cuối. Cần chạy lại thủ công thì dùng `workflow_dispatch` với id change.

PR archive chỉ đổi `openspec/`, cần review nhanh rồi merge. Nếu PR archive không tự chạy CI thì
cấu hình secret `ARCHIVE_PR_TOKEN` (PR tạo bằng `GITHUB_TOKEN` không kích hoạt workflow khác).

### Cổng spec

PR code **bắt buộc** có dòng `Spec PR: #<số>` ở mục References, và PR đó phải ở trạng thái **merged**.
Check `Spec PR đã merge` (`spec-gate-workflow.yml`) fail nếu thiếu dòng, số PR sai, hoặc PR spec chưa
merge. PR ghi `Closes #<story>` (PR cuối của story) còn phải có dòng `OpenSpec change:` và mọi task
trong `tasks.md` đã tick, nếu không workflow archive sẽ bỏ qua change; PR một phần dùng `Refs #<story>`.
Khi PR spec merge, workflow tự chạy lại check cho các PR code đang chờ. Dùng `Spec PR: N/A`
cho PR không có spec đi kèm (docs, config, asset thuần) và cho chính PR spec và PR archive.

PR spec chỉ merge được sau khi được duyệt, nên "merged" đồng nghĩa "đã review". Để cổng chặn thật,
repo cần bật branch protection cho `main`: bắt buộc approval, và đặt check `Spec PR đã merge` làm required.
Phần này cấu hình trong Settings, không nằm trong file.

### Spec sai hoặc thiếu khi đang code

Dev không sửa spec trong PR code. Mở PR spec mới (`spec/s<epic>-<n>-<slug>-fix`) cho BA duyệt, merge,
rồi rebase nhánh code. PR code trỏ lại số PR spec mới nhất trong dòng `Spec PR:` nếu thay đổi đó là
điều kiện để code.

CODEOWNERS nên gán `openspec/` cho BA và phần còn lại cho dev, để mỗi PR tự xin đúng người review.

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
| `spec-writer` | A | `proposal.md`, `specs/` trong `openspec/changes/<id>/` | change id, Scenario, kết quả validate |
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
  nên check "Review" đặt được làm required. Cần secret `ANTHROPIC_API_KEY`.
- **Vòng review:** `blocker`/`major` đi qua tối đa 2 vòng sửa; từ lần review thứ 3 CI chỉ comment, không
  fail. Finding loại `spec` dừng ngay: agent soạn patch spec ở nhánh `spec/<id>-fix`, BA duyệt qua PR
  spec. Hết 2 vòng mà còn `blocker`/`major` thì dừng hẳn và báo người dùng, không tự chạy vòng 3,
  không hạ mức độ finding.
- **Sửa theo feedback:** sau khi mở PR, phiên gắn PR (`bind_pr`, `set_monitor`); có review comment
  hoặc CI đỏ thì app đánh thức agent chạy `/relay fix <id>` (subagent mới cho mỗi việc). Phiên mới vẫn
  chạy được: trạng thái nằm ở nhánh, `tasks.md` và comment PR.
- `/relay` dừng trước khi commit/mở PR; người dùng quyết.
