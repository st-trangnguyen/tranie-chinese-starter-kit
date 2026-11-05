# Claude Frontend Standards

Bộ rule cho Claude Code, chuyển thể từ 7 tài liệu standard của team.
Dành cho stack React + TypeScript + Tailwind v4.

## Cấu trúc

```
CLAUDE.md                  ← nạp mọi phiên: architecture, luật tối cao, naming, class JSX
.claude/rules/
├── typescript.md          paths: **/*.{ts,tsx}   ← TypeScript + JavaScript
├── react.md               paths: **/*.tsx        ← React + markup/a11y
└── styles.md              paths: **/*.css        ← Tailwind v4
docs/05-standards/         ← 7 tài liệu gốc, đọc khi cần chi tiết
docs/05-standards/spec-driven.md  ← quy trình OpenSpec + TDD cho mỗi story
openspec/config.yaml       ← rule cho artifact và hướng dẫn TDD khi `/opsx:apply`
```

**Cách nạp:** `CLAUDE.md` vào context mọi phiên. Rule có `paths` chỉ nạp khi
Claude dùng Read/Write/Edit lên file khớp glob. Sửa `UserCard.tsx` → nạp
`typescript.md` + `react.md`. Sửa `_button.css` → chỉ nạp `styles.md`.

`docs/05-standards/` không tự nạp. Rule trỏ tới chúng, Claude tự mở khi cần.

## Cài đặt

```bash
cp CLAUDE.md /path/to/your-repo/
cp -r .claude /path/to/your-repo/
cp -r docs/05-standards /path/to/your-repo/docs/
```

Commit vào git để cả team dùng chung. Nếu repo đã có `CLAUDE.md`, merge thủ công.

## Kiểm tra

Trong Claude Code:

```
/context      # xem file nào đã nạp ở mục "Memory files"
/memory       # mở và sửa các file memory
```

Rule có `paths` **không hiện ở `/context` lúc khởi động** vì chúng nạp theo nhu
cầu. Để test: bảo Claude đọc một file `.tsx`, dòng `Loaded` kèm đường dẫn rule
sẽ hiện ra.

## Vì sao dùng rules chứ không phải skills

Skill chỉ nạp khi Claude tự thấy liên quan tới prompt — là suy đoán, có thể trượt.
Rule có `paths` nạp theo glob, cơ học, không trượt. Coding standard là ràng buộc
phải có mặt mỗi lần động vào file, nên nó thuộc về rules.

Skill vẫn hợp cho quy trình nhiều bước bạn gọi khi cần (ví dụ "tạo feature mới
end-to-end"), không phải cho standard về cách viết code.

## Vì sao chia theo đuôi file, không theo chủ đề

7 tài liệu gốc chia theo chủ đề cho người đọc. `paths` khớp theo file có thật
trong repo. Trong project React thuần không có file `.html` hay `.js` nào để
khớp, nên:

- **js.md** gộp vào `typescript.md` — rule JS áp dụng cho `.ts`/`.tsx`.
- **html.md** gộp vào `react.md` thành mục "Markup & accessibility trong JSX"
  (`class`→`className`, `for`→`htmlFor`). Phần boilerplate, meta SEO, CSP,
  resource hints không dùng trong React — giữ ở `docs/05-standards/html.md`.
- **css-sass.md** bỏ khỏi rules vì project dùng Tailwind. Tài liệu vẫn nằm
  trong `docs/05-standards/` nếu sau này cần.

## Tránh trùng lặp

`.tsx` nạp **cả** `typescript.md` lẫn `react.md`. Nội dung trùng sẽ tốn context
hai lần và dễ sinh mâu thuẫn. Vì vậy naming convention chỉ nằm ở `CLAUDE.md` §4,
rule về class trong JSX chỉ nằm ở `CLAUDE.md` §6 — hai rule kia không nhắc lại.

Khi thêm rule mới, giữ nguyên tắc này: mỗi thông tin ở đúng một chỗ.

## Một mâu thuẫn trong tài liệu gốc — đã xử lý

`architecture.md` quy định `core/ | pages/ | shared/` (layer-based), còn
`react.md` mô tả `app/ | features/ | shared/` (feature-based). Hai cách không
tương thích. Tôi lấy `architecture.md` làm chuẩn; phần folder structure của
`react.md` bị bỏ, các rule React còn lại giữ nguyên.

Muốn đảo lại thì sửa `CLAUDE.md` §1–§2.

## Giới hạn cần biết

- `CLAUDE.md` nên dưới 200 dòng — dài hơn làm giảm mức tuân thủ. File hiện tại
  khoảng 180 dòng.
- Rule nạp theo `paths` có giới hạn 40.000 ký tự mỗi file (context 200K). Vượt
  quá Claude chỉ nhận phần đầu. Các rule ở đây đều dưới 8KB.
- `@import` trong CLAUDE.md giúp tổ chức nhưng **không** giảm chi phí context.
- Rule là context, không phải cưỡng chế. Thứ bắt buộc phải chạy đúng thời điểm
  (ví dụ chặn commit khi test fail) thì viết `PreToolUse` hook, không viết rule.

## Bảo trì

- Standard đổi → sửa rule **và** file trong `docs/05-standards/`.
- Thêm loại file mới (`.test.tsx`, `.mdx`) → cân nhắc rule riêng với `paths`
  tương ứng.
- Rule nào Claude hay quên → nâng lên `CLAUDE.md`. Rule nào chỉ dùng trong ngữ
  cảnh hẹp → đẩy xuống rule có `paths`.
- Chạy `/doctor prompt-audit` định kỳ để tìm nội dung lỗi thời hoặc mâu thuẫn
  giữa các file.
