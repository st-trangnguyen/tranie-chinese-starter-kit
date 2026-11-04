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

| # | Bước | Lệnh / việc | Cổng |
|---|---|---|---|
| 1 | Chọn story, tạo nhánh `feat/s<epic>-<n>-<slug>` | | |
| 2 | **Propose** | `/opsx:propose s<epic>-<n>-<slug>` | **Người dùng duyệt** proposal, spec, tasks |
| 3 | **RED** | Viết test cho một Scenario, chạy, thấy fail đúng lý do. Commit `test(...)` | Phải có output fail |
| 4 | **GREEN** | `/opsx:apply`: code tối thiểu, đúng layer (CLAUDE.md §1–§3). Commit `feat(...)` | Test pass |
| 5 | **REFACTOR** | Dọn code, giữ xanh | |
| 6 | **Verify** | `pnpm typecheck && pnpm lint && pnpm test:run` (+ `content:check`, `e2e` theo CLAUDE.md §8) | Toàn bộ pass |
| 7 | **Archive** | `/opsx:archive`, rồi `pnpm exec openspec validate --all --strict` | Spec hợp lệ |
| 8 | PR | Theo template. `Closes #<story>` nếu xong mọi AC, ngược lại `Refs #<story>` | |

Lặp bước 3–5 cho từng Scenario, không viết hết test rồi mới code.

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
