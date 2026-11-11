# Spec dễ đọc cho BA/QA: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec OpenSpec chỉ nói hành vi người dùng thấy, để BA/QA đọc được mà không cần hiểu kỹ thuật.

**Architecture:** Chỉ đổi luật viết (`openspec/config.yaml`, `spec-driven.md`), rồi viết lại spec `learning-path` làm mẫu qua một OpenSpec change docs-only. Không đụng code, ID và số Scenario giữ nguyên nên test hiện có không đổi.

**Tech Stack:** OpenSpec CLI (`pnpm exec openspec`), markdown, YAML.

**Spec:** [2026-11-11-ba-qa-readable-specs.md](2026-11-11-ba-qa-readable-specs.md)

## Global Constraints

- Heading cấu trúc (`Requirement`, `Scenario`, `WHEN`/`THEN`) và `SHALL`/`MUST` giữ tiếng Anh, nội dung tiếng Việt.
- ID Scenario `S3.1-AC1`, `S3.1-AC2`, `S3.1-AC3` và tổng 9 Scenario (2 + 5 + 2) giữ nguyên.
- `pnpm exec openspec validate --all --strict` phải qua.
- Commit không kèm dòng `Co-Authored-By` (memory `no-coauthor-trailer`). Nhánh `docs/ba-qa-readable-specs`.
- Task 1 và 3 là docs/config thuần nên miễn RED/GREEN (CLAUDE.md §8, `spec-driven.md` §5). Không có code production.
- Mở PR review **trước**, archive **sau** review rồi commit lên cùng PR (memory `pr-before-archive`).

## Review Focus

1. Requirement có bảng: bảng không làm `validate --strict` fail (câu mở đầu vẫn chứa `SHALL`, bảng đứng sau).
2. Đổi tên Requirement thứ hai: phải dùng `RENAMED` rồi `MODIFIED`, nếu không archive tạo requirement trùng.
3. Scenario e2e "mở bản đồ": test thật mở thẳng URL, nên WHEN viết "mở màn Lộ trình", **không** viết "từ menu" (sai với test, và là hành vi chưa có).
4. Bỏ chi tiết kỹ thuật không được làm mất điều kiện: scenario "dữ liệu hỏng" vẫn phải còn, chỉ đổi cách nói.
5. `grep -rn "S3.1-AC" apps` vẫn ra đủ 12 test như trước.

---

### Task 1: Luật viết cho BA/QA

**Files:**
- Modify: `openspec/config.yaml` (khối `rules.specs`)
- Modify: `docs/05-standards/spec-driven.md` (§3 "Viết spec", thêm mục con cuối §3)

**Interfaces:**
- Produces: ba luật trong `rules.specs` mà `/opsx:propose` đọc ở Task 2; đoạn "Viết cho BA/QA" mà Task 2 dùng làm tham chiếu.

- [ ] **Step 1: Tạo nhánh** `git checkout -b docs/ba-qa-readable-specs`.
- [ ] **Step 2: Thêm 3 luật vào `rules.specs`** trong `openspec/config.yaml`, giữ nguyên 3 luật cũ, văn phong tiếng Việt như file:
  - Requirement/Scenario chỉ dùng thuật ngữ người dùng thấy (màn hình, nút, nhãn, kết quả); không route, tên field/store/hàm, mã nội bộ (F5…), tên thư viện.
  - Quy tắc nhiều trường hợp trình bày bằng bảng trong Requirement; câu mở đầu vẫn chứa `SHALL`/`MUST`.
  - Chi tiết kỹ thuật để ở `design.md` hoặc trong test; gặp backtick trong Scenario thì hỏi BA/QA có cần biết không.
- [ ] **Step 3: Thêm mục con "Viết cho BA/QA" cuối §3** của `spec-driven.md`: bảng trước/sau của mục 3 trong spec thiết kế (ví dụ Requirement dạng bảng + 3 cặp Scenario) và checklist tự kiểm 4 dòng của mục 2.2.
- [ ] **Step 4: Kiểm tra** — chạy `pnpm exec openspec validate --all --strict`. Expected: pass. Chạy `grep -n "BA/QA" openspec/config.yaml docs/05-standards/spec-driven.md`. Expected: có khớp ở cả hai file.
- [ ] **Step 5: Commit** — `git add openspec/config.yaml docs/05-standards/spec-driven.md`, `git commit -m "docs(standards): viết spec cho BA/QA đọc được"`.

---

### Task 2: Propose change viết lại `learning-path`

**Files:**
- Create: `openspec/changes/docs-ba-qa-readable-specs/` (qua `/opsx:propose docs-ba-qa-readable-specs`): `proposal.md`, `design.md`, `tasks.md`, `specs/learning-path/spec.md`

**Interfaces:**
- Consumes: luật mới của Task 1 (chính change này phải tuân theo).
- Produces: delta spec mà Task 3 archive vào `openspec/specs/learning-path/spec.md`.

- [ ] **Step 1: Chạy `/opsx:propose docs-ba-qa-readable-specs`.** Proposal: nêu lý do (BA/QA khó đọc), layer đích "không có code, chỉ docs/spec", ngoài phạm vi (không đổi hành vi, không đổi test, không lint tự động). Không có issue story nên bỏ dòng `Refs #`.
- [ ] **Step 2: Viết delta `specs/learning-path/spec.md`** theo bảng quyết định sau. Mọi Requirement dùng `MODIFIED` (chép **toàn bộ** khối, kể cả Scenario không đổi); Requirement thứ hai thêm `RENAMED` (`FROM` tên cũ `TO` `Mỗi bài có đúng một trạng thái`) trước `MODIFIED`.

  | Requirement | Đổi gì |
  |---|---|
  | Hiện các giai đoạn và bài theo thứ tự | Chỉ Scenario e2e: WHEN "người học đã xong onboarding và mở màn Lộ trình" (bỏ route `/learning-paths`); phần còn lại giữ |
  | Mỗi bài có đúng một trạng thái | Thân Requirement: câu mở đầu `SHALL hiện cho mỗi bài một trong ba trạng thái, bằng chữ chứ không chỉ bằng màu:` + bảng 3 dòng (Đã xong / Đang mở / Khóa với nhãn "Đã xong", "Đang mở", "Đã khóa"); bỏ mã F5. Scenario "Tiến độ lưu bị hỏng…" đổi tên thành `S3.1-AC2 Bài có kết quả học không đọc được`, WHEN "kết quả học đã lưu của một bài không đọc được", THEN giữ nguyên |
  | Bấm vào bài khóa thì không vào được | Chỉ Scenario "Bấm bài đang mở": THEN "người học vào màn học của bài đó" (bỏ route `/lessons/<id bài>`) |

- [ ] **Step 3: Viết `design.md`** ghi chi tiết đã bỏ khỏi spec nhưng test còn giữ: route `/learning-paths`, `/lessons/<id>`, trạng thái lưu hỏng là "row IndexedDB không qua Zod". Chạy `pnpm exec openspec validate docs-ba-qa-readable-specs --strict`. Expected: pass.
- [ ] **Step 4: Commit** — `git add openspec/changes/docs-ba-qa-readable-specs`, `git commit -m "docs(openspec): propose docs-ba-qa-readable-specs"`.
- [ ] **Step 5: DỪNG, chờ người dùng duyệt proposal/spec/tasks** (CLAUDE.md §8 bước 2) trước khi sang Task 3.

---

### Task 3: Verify, PR, archive

**Files:**
- Modify (qua archive): `openspec/specs/learning-path/spec.md`
- Move: `openspec/changes/docs-ba-qa-readable-specs/` → `openspec/changes/archive/`

**Interfaces:**
- Consumes: change đã duyệt ở Task 2.

- [ ] **Step 1: Kiểm tra không đụng code** — `pnpm typecheck && pnpm lint && pnpm test:run`. Expected: pass; `grep -rn "S3.1-AC" apps | wc -l` ra 12 như trước.
- [ ] **Step 2: Mở PR** theo `.github/pull_request_template.md`; mục Screenshots ghi `N/A` (không liên quan UI), xoá dòng placeholder `> …`. Chờ review.
- [ ] **Step 3: Sau review, `/opsx:archive`.** Kiểm tra `openspec/specs/learning-path/spec.md` đã có bảng trạng thái, không còn `F5`, `/learning-paths`, `/lessons/<id`: `grep -nE "F5|/learning-paths|/lessons/" openspec/specs/learning-path/spec.md`. Expected: không có kết quả.
- [ ] **Step 4: `pnpm exec openspec validate --all --strict`.** Expected: pass.
- [ ] **Step 5: Commit lên cùng PR** — `git add openspec`, `git commit -m "docs(openspec): archive docs-ba-qa-readable-specs"`, rồi push.
