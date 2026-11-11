## Context

Xem `proposal.md` (Why). Spec thiết kế đầy đủ: `docs/04-specs/2026-11-11-ba-qa-readable-specs.md`.
Chỉ có một capability (`learning-path`), 3 Requirement, 9 Scenario.

## Decisions

- **Đi qua change docs-only**, không sửa tay `openspec/specs/`, vì spec chỉ đổi qua archive
  (`docs/05-standards/spec-driven.md` §1).
- **Giữ nguyên ID và số Scenario** để `grep S3.1-AC` và tên test không đổi.
- **Đổi tên Requirement bằng `RENAMED` rồi `MODIFIED`** dưới tên mới, tránh archive tạo bản trùng.
- **Scenario e2e viết "mở màn Lộ trình"**, không viết "từ menu": test thật mở thẳng URL.

## Chi tiết kỹ thuật đã bỏ khỏi spec (test vẫn giữ)

| Trong spec cũ | Nằm ở đâu bây giờ |
|---|---|
| route `/learning-paths`, `/lessons/<id bài>` | `apps/web/e2e/E3/s3.1-learning-path.spec.ts`, `LearningPathContainer.test.tsx` |
| "dữ liệu tiến độ không hợp lệ" = row IndexedDB không qua Zod | `progress-store.service.test.ts` (S3.1-AC2) |
| quy tắc mở khóa Nhập môn (F5) | `docs/02-design/` và `progress.service.test.ts` |

## Risks / Trade-offs

- [Spec đã archive bị viết lại] → hành vi không đổi, ID và số Scenario giữ nguyên, kiểm bằng
  `openspec validate --all --strict` và `grep -rn "S3.1-AC" apps` ra 13 test.
- [Bỏ chi tiết làm test "mất dấu" điều kiện] → chi tiết nằm trong bảng trên và trong chính test.
