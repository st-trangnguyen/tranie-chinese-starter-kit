# Bổ sung QA và các cổng review vào quy trình story

Trạng thái: **chờ duyệt**. Chưa sửa workflow, agent hay tài liệu nào theo bản này.

## 1. Vì sao

Quy trình hiện tại (`docs/05-standards/spec-driven.md`) có hai khoảng trống:

1. **Spec chỉ BA viết và BA duyệt.** Không có QA, không có Dev, không có chỗ hỏi đáp.
   Spec mơ hồ lọt xuống pha code, nơi sửa tốn hơn nhiều.
2. **Không ai kiểm chứng app chạy đúng.** Test do `test-writer` viết từ chính Scenario,
   `reviewer` là AI. CI xanh chỉ nói "code khớp spec", không nói "app dùng được".
   Chưa có phản hồi chất lượng nào từ người dùng; thiết kế này là **phòng ngừa**, không chữa một bug cụ thể.
3. **Plan nằm trong PR code**, không có điểm nào để dev lead duyệt trước khi code bắt đầu.

## 2. Mục tiêu / không phải mục tiêu

Mục tiêu:
- BA, QA, Dev cùng chốt spec, có bước Q&A, rồi mới merge.
- Dev lead duyệt plan (`design.md`, `tasks.md`) trước khi code, **trong PR code hiện có**, không thêm PR.
- QA tham gia từ pha Spec (viết test case) đến pha Code (nghiệm thu trên app thật).
- Mọi cổng chặn được merge bằng check bắt buộc, không chỉ là thói quen.

Không làm:
- Không thêm PR thứ ba cho plan (bạn đã chọn). Vẫn hai PR + archive tự động.
- Chưa dựng môi trường preview deploy cho từng PR (xem §6, quyết định của mình).
- Chưa đo coverage, perf, Lighthouse tự động.

Phản mục tiêu (làm xong nhưng vẫn thất bại): QA chỉ ký cho có, hoặc cổng nặng đến mức story nhỏ
cũng mất nhiều ngày. Vì vậy story nhỏ có đường rút gọn (§5).

## 3. Các phương án đã cân nhắc

**Mục 3 (chất lượng app):** A (QA nghiệm thu ở PR code), B (bộ e2e độc lập do QA sở hữu),
C (kết hợp: QA viết test case ở pha Spec, nghiệm thu ở PR code, case lặp lại chuyển thành e2e).
**Đã chọn C.** Lý do: bắt lỗi ở cả đầu vào (spec mơ hồ) lẫn đầu ra (app thật).

**Duyệt plan:** PR plan riêng (cổng mạnh, thêm PR) hay trong PR code (ít PR hơn). **Đã chọn trong PR code.**
Đánh đổi: không chặn được việc push code sớm, chỉ chặn được merge (xem §4.2).

## 4. Quy trình mới

```
Pha A  Spec   : BA viết ─ QA viết test-cases.md ─ Dev hỏi đáp ─ draft PR → ready → 3 vai approve → merge
Pha B  Code   : draft PR chỉ có plan → lead duyệt (label plan-approved) → RED/GREEN → QA nghiệm thu → merge
Pha C  Archive: tự động như cũ
```

### 4.1 Pha A: Spec có QA và Q&A

1. BA chạy `/relay spec <id>` trên nhánh `spec/...`, mở **PR spec ở dạng draft**.
2. `proposal.md` có mục `## Open Questions` (danh sách `- [ ]`). BA, QA, Dev hỏi và trả lời ngay
   trong comment PR; mỗi câu chốt xong thì sửa spec và tick câu hỏi.
3. QA viết `openspec/changes/<id>/test-cases.md` (agent `qa-writer` soạn nháp, QA chỉnh), cùng PR spec.
4. Hết câu hỏi mở thì chuyển PR sang *ready for review*. Cần **approve của đủ ba vai: BA, QA, Dev**.
5. Chỉ sau đó merge. Check mới `Spec approvals` (required) chặn merge khi:
   - `proposal.md` còn `- [ ]` trong `Open Questions`;
   - thiếu `test-cases.md`;
   - chưa đủ approve từ mỗi nhóm BA / QA / Dev.

Định dạng `test-cases.md` (tiếng Việt, chỉ nói thứ người dùng thấy, như spec):

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S1.2-AC1-1 | S1.2-AC1 | Chức năng | Mở app, tắt mạng, mở lại | Vào được màn Lộ trình | e2e |
| TC-S1.2-AC1-2 | S1.2-AC1 | Offline | … | … | không |

- Mỗi Scenario có ít nhất một case. Cột **Loại** gồm: Chức năng, Biên, A11y, Mobile 375, Sáng/Tối, Offline.
- Cột **Tự động** là `e2e` (đưa vào Playwright, §4.3) hoặc `không` (QA chạy tay mỗi lần).

### 4.2 Pha B: Duyệt plan trong PR code

1. Dev cắt nhánh `feat/...` từ `main` (spec đã merge), chạy `/relay plan <id>`, mở **PR code ở dạng draft
   chỉ chứa `design.md` + `tasks.md`**.
2. Dev lead review. OK thì gắn label **`plan-approved`**. Chỉ người trong danh sách lead được gắn.
3. Check mới `Plan đã duyệt` (required): PR có file ngoài `openspec/` và `docs/` mà chưa có `plan-approved` thì fail.
   Sửa `design.md` sau khi đã duyệt thì workflow **gỡ label** để lead duyệt lại. Tick `tasks.md` không gỡ.
4. `/relay code <id>` **từ chối chạy** khi PR chưa có label `plan-approved`. Đây là chỗ "ok mới start code" được
   thực thi với agent; với người, cổng chặn ở merge.

Giới hạn đã biết: GitHub không chặn được việc push commit lên nhánh. Cổng này chặn **merge**, và agent tuân thủ.
Dev cố tình code trước vẫn push được, nhưng PR không merge được và lead sẽ thấy ngay trong diff.

### 4.3 Pha B: QA nghiệm thu

1. Code xong, CI xanh, PR chuyển sang ready.
2. CI build ra artifact `web-dist` cho PR. QA chạy bản đó (`pnpm --filter @csk/web preview` sau khi tải artifact,
   hoặc checkout nhánh và dùng preview `web-build-preview`).
3. QA chạy từng case trong `test-cases.md` có cột Tự động = `không`, và xem thủ công các case e2e nếu cần.
   QA ghi kết quả vào **một comment** theo mẫu (bảng `TC → Pass/Fail → ghi chú`).
4. Fail: Dev sửa trong PR, QA chạy lại case fail. Pass hết: QA gắn label **`qa-approved`**.
5. Check mới `QA sign-off` (required): PR có file ngoài `openspec/` và `docs/` mà chưa có `qa-approved` thì fail.
   Push commit mới sau khi đã ký thì gỡ label (kết quả cũ không còn đúng).
6. Case có Tự động = `e2e`: `test-writer` viết Playwright ở `apps/web/e2e/E<n>/` trong chính PR code,
   mang ID `TC-…`. QA review e2e đó như một phần nghiệm thu.

## 5. Story nhỏ

Story rất nhỏ vẫn qua đủ cổng, nhưng nhẹ: `test-cases.md` 1–3 dòng, Q&A có thể trống,
`design.md` một đoạn. Hai cổng `plan-approved` / `qa-approved` áp dụng cho PR đổi file dưới `apps/` hoặc `packages/`, **tính theo file**,
không theo dòng `Spec PR:` hay tên nhánh (hai thứ đó tự khai được nên né được cổng). PR không đổi hai thư mục đó
(spec, docs, config, workflow, archive) được miễn. Label chỉ hợp lệ khi người gắn thuộc danh sách và **không phải
tác giả PR**. (Sửa sau review độc lập, 2026-11-13.)

## 6. Quyết định của mình (cần bạn duyệt hoặc đổi)

1. **Dùng label** (`plan-approved`, `qa-approved`) làm tín hiệu duyệt thay vì approve review, vì approve review
   không phân biệt được "duyệt plan" với "duyệt code".
2. **Danh sách người được duyệt** để ở repo variables: `BA_APPROVERS`, `QA_APPROVERS`, `DEV_APPROVERS`,
   `PLAN_APPROVERS` (handle GitHub, cách nhau dấu phẩy), không hardcode trong workflow. Hiện CODEOWNERS còn trống handle BA.
3. **Chưa có preview deploy**: QA dùng artifact build của CI. Nếu QA thấy bất tiện thì nâng cấp lên preview URL
   (cần thêm dịch vụ hosting, là một quyết định riêng).
4. **Check `Review` (AI) giữ nguyên.** QA là lớp mới, không thay reviewer AI.
5. Việc cấu hình **branch protection** (đặt 3 check mới làm required) làm tay trong Settings, như hiện nay.

## 7. Các thay đổi phải làm

| File | Thay đổi |
|---|---|
| `docs/05-standards/spec-driven.md` | Cập nhật §2 (bảng pha, cổng), §3 (Open Questions, test-cases), §7 (agent mới, `/relay`) |
| `CLAUDE.md` §8 | Thêm bước Q&A, QA test case, duyệt plan, QA sign-off |
| `.github/pull_request_template.md` | Mục Checklist: plan đã duyệt, QA đã nghiệm thu; mục QA |
| `.github/CODEOWNERS` | Gán `openspec/` cho BA + QA + Dev; `design.md`, `tasks.md` cho dev lead |
| `.github/workflows/spec-approvals-workflow.yml` (mới) | Check `Spec approvals` |
| `.github/workflows/gates-workflow.yml` (mới) | Check `Plan đã duyệt`, `QA sign-off`, gỡ label khi đổi |
| `.github/workflows/ci-workflow.yml` | Upload artifact `web-dist` |
| `.claude/agents/qa-writer.md` (mới) | Soạn nháp `test-cases.md` từ Scenario |
| `.claude/agents/spec-writer.md`, `test-writer.md` | `Open Questions`; viết e2e theo `TC-` |
| `.claude/commands/relay.md` | `/relay spec` gọi `qa-writer`; `/relay code` kiểm `plan-approved` |

## 8. Việc để người làm quyết

- Mẫu comment kết quả QA chi tiết đến đâu.
- Tên chính xác của repo variable và nhãn nếu muốn đổi.
- Thứ tự làm: nên làm tài liệu + CODEOWNERS + template trước, workflow sau (tài liệu dùng được ngay cả khi
  workflow chưa xong).
