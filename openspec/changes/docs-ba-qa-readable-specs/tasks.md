## 1. Áp dụng spec đã duyệt

- [ ] 1.1 Chạy `pnpm exec openspec validate docs-ba-qa-readable-specs --strict`; kết quả pass.
- [ ] 1.2 Chạy `pnpm typecheck && pnpm lint && pnpm test:run`; pass (không đụng code).
- [ ] 1.3 Kiểm `grep -rn "S3.1-AC" apps | wc -l`; ra 13 như trước.

## Workflow follow-up

- Mở PR review trước, archive sau review rồi commit lên cùng PR.
- Sau `/opsx:archive`: `grep -nE "F5|/learning-paths|/lessons/" openspec/specs/learning-path/spec.md` không có kết quả; `pnpm exec openspec validate --all --strict` pass.
