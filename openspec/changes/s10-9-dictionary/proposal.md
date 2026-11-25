# Proposal: S10.9 Tra từ

Story **S10.9 Tra từ · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s109-tra-từ--f3)) ·
GitHub issue [#52](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/52). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #52

## Why

Là người học, tôi muốn tra từ ngay trong app khi không có mạng để không phải mở app khác. App đã có sẵn danh sách 500 từ HSK 1 (chữ Hán,
pinyin, nghĩa tiếng Việt) để chạy bài học, nhưng người học chưa có chỗ nào để tìm một từ. S10.9 thêm màn Tra từ tìm trong danh sách đó, chạy
hoàn toàn trên máy.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc khớp (chữ Hán, pinyin có dấu / không dấu, nghĩa tiếng Việt theo từ trọn vẹn), quy tắc xếp thứ tự (Phần 2, pure); use case "tra từ" nạp danh sách từ rồi lọc (Phần 3) | `shared/services/content.service.ts` (đã có, thêm method; `docs/03-architecture.md` đã giao "tìm kiếm từ điển" cho service này) |
| Bỏ dấu thanh pinyin, chuẩn hóa ü / u / v khi so (nếu cần hàm mới) | `packages/shared` (`pinyin.utils`) |
| Màn Tra từ (entry lazy-load) và route mới | `pages/dictionary/containers/`, `pages/dictionary/dictionary.routes.ts` (thư mục `dictionary/` đã có trong `docs/03-architecture.md`) |
| UI riêng: ô tìm kiếm, danh sách kết quả, trạng thái gợi ý / không có kết quả / lỗi | `pages/dictionary/components/` |
| State màn (đang tải, lỗi, nội dung ô, kết quả), gọi service | `pages/dictionary/hooks/` |
| Liên kết "Tra từ" trên Trang chủ | `pages/home/components/` |
| Chữ hiển thị, style BEM | `assets/i18n/vi/dictionary.json` (mới), `apps/web/src/styles/tailwind/` |

## What Changes

- **Màn Tra từ mới**, mở từ liên kết "Tra từ" trên Trang chủ (luôn hiện). Đầu màn có tiêu đề "Tra từ", liên kết "Về Trang chủ" và ô tìm
  kiếm; kết quả cập nhật theo nội dung ô, không có nút "Tìm".
- **Tìm theo ba cách** (AC1) trong toàn bộ danh sách từ HSK 1 của app, kể cả từ thuộc bài chưa mở:

  | Cách | Quy tắc |
  |---|---|
  | Chữ Hán | Ô có chữ Hán → từ có chữ Hán chứa nguyên chuỗi đã gõ |
  | Pinyin có dấu | Ô có dấu thanh → pinyin của từ bắt đầu bằng chuỗi đã gõ, đúng cả dấu |
  | Pinyin không dấu | Ô không có dấu thanh → so sau khi bỏ dấu; "ü" = "u" = "v" |
  | Nghĩa tiếng Việt | Ô không có chữ Hán → một đoạn nghĩa (nghĩa tách tại ";", bỏ phần "[...]") chứa chuỗi đã gõ thành từ trọn vẹn, đúng dấu tiếng Việt |

  Không phân biệt hoa thường; chữ có dấu dạng dựng sẵn hay tổ hợp coi như nhau; pinyin (cả chuỗi gõ lẫn pinyin của từ) bỏ qua khoảng
  trắng, nháy, gạch nối. Một chuỗi Latin tìm cả pinyin lẫn nghĩa, gộp kết quả, mỗi từ một
  lần.
- **Kết quả**: mỗi dòng có chữ Hán, pinyin có dấu, mọi nghĩa theo thứ tự ngăn bằng "; " (như S10.1, S10.2); dòng chỉ để đọc, không
  nằm trong thứ tự Tab; dòng "<N> kết quả" ở trên; khớp trọn lên trước, còn lại theo thứ tự
  danh sách từ (pinyin A–Z); chữ hai cách đọc là hai dòng. Hiện hết kết quả, không phân trang (tối đa 500 từ).
- **Trạng thái**: ô trống → câu gợi ý; không khớp → "Không tìm thấy từ nào cho "…"."; không tải được → "Không tải được từ điển." + "Thử lại".
- **Offline** (AC2): dùng được đầy đủ khi đã mở app một lần (như S1.2).
- A11y: ô có nhãn, số kết quả và câu không có kết quả đọc qua vùng tự đọc, Tab tới được mọi thứ, khổ 375 px không cuộn ngang, không có
  chuyển động.
- **Trang chủ** có thêm liên kết "Tra từ" (delta `home-screen`).

## Không làm (out of scope)

- Màn chi tiết từ khi bấm vào kết quả, nút nghe audio, câu ví dụ, thứ tự nét trong kết quả (thẻ từ đầy đủ là S10.1; cần thì mở story riêng).
- Gõ pinyin bằng số thanh ("ni3"): không đổi số thành dấu, chuỗi có số được tìm như chuỗi không dấu nên thường không có kết quả. Cần thì mở
  story riêng (S4.3 đã có quy tắc đổi số → dấu khi gõ pinyin trong bài tập).
- Tìm nghĩa tiếng Việt không dấu ("hoc" → "học"), tìm gần đúng / sai chính tả, gợi ý khi gõ.
- Từ ngoài danh sách HSK 1 của app (toàn bộ từ điển CVDICT / CC-CEDICT), tìm câu ví dụ, tìm ngữ pháp.
- Lịch sử tra, từ yêu thích, thêm từ vào thẻ ôn tập từ màn Tra từ.
- Lối vào màn Tra từ từ màn bài học hay màn ôn tập.
- Lưu dữ liệu mới: không ghi gì vào máy, không đổi file sao lưu, không đổi nội dung.

## Dependencies

- **S2.x pipeline nội dung**: dùng danh sách từ HSK 1 đã có (chữ Hán, pinyin có dấu, nghĩa tiếng Việt); không đổi nội dung.
- **S1.2**: định nghĩa "dùng được khi offline sau khi đã mở app một lần"; danh sách từ phải có trong bộ dữ liệu app lưu sẵn để chạy offline.
- **S8.1**: Trang chủ có thêm một liên kết, các phần cũ không đổi.
- **S10.1** (thẻ từ, song song): không phụ thuộc; màn chi tiết từ / audio để story riêng.
- Các change E9 / E10 khác cũng thêm liên kết lên Trang chủ (ví dụ S9.2 "Ôn tập", S9.5 "Thống kê ôn tập"): Requirement này không ràng buộc
  vị trí tương đối giữa các liên kết.
- Không thêm dependency.

## Capabilities

### New Capabilities
- `dictionary`: màn Tra từ: tìm theo chữ Hán / pinyin có dấu hoặc không / nghĩa tiếng Việt, thứ tự kết quả, trạng thái gợi ý / không có
  kết quả / lỗi, bàn phím và trình đọc màn hình, offline.

### Modified Capabilities
- `home-screen`: thêm liên kết "Tra từ" mở màn Tra từ (ADDED, các Requirement cũ không đổi).

## Open Questions

- [x] **Tra trong danh sách nào?** → toàn bộ 500 mục HSK 1 app đã có (kể cả từ của bài chưa mở), không thêm từ điển lớn. Đủ cho AC, không
  tăng dung lượng offline (ba đề xuất, chờ người thật xác nhận)
- [x] **Màn ở đâu, vào từ đâu?** → màn riêng "Tra từ", liên kết "Tra từ" trên Trang chủ luôn hiện; đầu màn có "Về Trang chủ". Delta
  `home-screen` (ba đề xuất, chờ người thật xác nhận)
- [x] **Tìm khi gõ hay bấm nút?** → kết quả cập nhật theo nội dung ô, không có nút "Tìm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Chữ Hán khớp thế nào?** → chữ Hán của từ chứa nguyên chuỗi đã gõ ("学" → 学, 学生, 大学); ô có chữ Hán thì chỉ tìm theo chữ Hán
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Pinyin khớp thế nào, "có dấu hoặc không" nghĩa là gì?** → khớp đầu pinyin của từ; ô có ít nhất một dấu thanh → so đúng cả dấu;
  không có dấu nào → bỏ dấu khi so; "ü" = "u" = "v" khi không dấu; bỏ qua hoa thường, khoảng trắng, nháy, gạch nối. Ô trộn dấu ("xuéxi")
  so có dấu nên không khớp 学习 (xuéxí) (ba đề xuất, chờ người thật xác nhận)
- [x] **Nghĩa tiếng Việt khớp thế nào?** → một nghĩa chứa chuỗi đã gõ thành từ trọn vẹn (không khớp giữa chữ: "gái" khớp "con gái", "ái" không khớp),
  không phân biệt hoa thường, phải đúng dấu tiếng Việt ("hoc" không khớp "học"); không dấu để story riêng (ba đề xuất, chờ người thật xác
  nhận)
- [x] **Chuỗi Latin vừa là pinyin vừa là tiếng Việt ("ai")?** → tìm cả hai, gộp, mỗi từ một lần (ba đề xuất, chờ người thật xác nhận)
- [x] **Thứ tự kết quả?** → nhóm khớp trọn (chữ Hán / pinyin / một nghĩa đúng bằng chuỗi đã gõ) lên trước, còn lại theo thứ tự danh sách
  từ (pinyin A–Z) (ba đề xuất, chờ người thật xác nhận)
- [x] **Mỗi kết quả hiện gì, bấm vào làm gì?** → chữ Hán, pinyin có dấu, toàn bộ nghĩa; chỉ đọc, không mở màn chi tiết, không audio (ba đề
  xuất, chờ người thật xác nhận)
- [x] **Giới hạn số kết quả?** → không: hiện hết (tối đa 500), kèm dòng "<N> kết quả" (ba đề xuất, chờ người thật xác nhận)
- [x] **Trạng thái ô trống / không có kết quả / lỗi?** → "Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt để tra từ." / "Không tìm thấy từ nào cho
  "…"." / "Không tải được từ điển." + "Thử lại" (ba đề xuất, chờ người thật xác nhận)
- [x] **Gõ số thanh ("ni3")?** → không làm trong S10.9, ghi vào "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **Focus, trình đọc màn hình, giảm chuyển động?** → mở màn không chuyển focus (theo mẫu S9.5), Tab: "Về Trang chủ" → ô tìm kiếm; số kết
  quả và câu không có kết quả đọc qua vùng tự đọc lịch sự; không có chuyển động nên không cần xử lý giảm chuyển động (ba đề xuất, chờ người
  thật xác nhận)
- [x] **Route của màn mới?** → route RESTful, danh từ cụ thể, cùng kiểu route hiện có; plan chốt tên. Không đưa route vào spec
- [x] **Có cần lưu dữ liệu mới?** → không: chỉ đọc danh sách từ có sẵn
- [x] **(Duyệt vòng 1, major) Nhiều nghĩa hiện thế nào, có khớp S10.1 / S10.2 không?** → khớp: mọi nghĩa theo thứ tự, ngăn bằng "; ";
  sửa Scenario "Một dòng kết quả" (爱好 hiện "thích; đam mê; lấy làm thú vui; say mê; sở thích") (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, major) "Một nghĩa" và "từ trọn vẹn" nghĩa là gì với dữ liệu thật?** → so theo **đoạn nghĩa**: mỗi nghĩa tách tại
  ";" (106/500 mục có "; " bên trong một nghĩa); bỏ phần trong ngoặc vuông ("[shui2]", "[ge4]") trước khi so; ranh giới từ là mọi ký tự
  không phải chữ cái hay chữ số (khoảng trắng, dấu câu, ngoặc tròn, chữ Hán, "|"); khớp trọn = một đoạn nghĩa, bỏ dấu câu và khoảng trắng
  đầu cuối, đúng bằng chuỗi đã gõ. Hệ quả đã khóa bằng Scenario: "ai" → 爱, 哪些 ("ai?"), 谁 (khớp trọn) rồi 爱好; "thích" → 爱 và 爱好
  cùng ở nhóm khớp trọn; "shui" không ra 谁 (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, minor) Khớp trọn pinyin so có dấu hay không?** → ô không dấu so với pinyin đã bỏ dấu; ô có dấu so đúng cả dấu; ghi
  vào bảng "Thứ tự kết quả", thêm Scenario "xué" / "xuè" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, minor) Bỏ khoảng trắng / nháy / gạch nối có áp cho pinyin của từ?** → có, cả hai phía; thêm ví dụ và Scenario
  "xiaoxuesheng" → 小学生 (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, minor) Chữ có dấu dạng dựng sẵn và tổ hợp?** → coi như nhau cho pinyin và nghĩa; thêm vào bảng "Cách so chuỗi đã
  gõ" và một Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, minor) Ví dụ "nǐhao" dùng từ không có trong danh sách** → đổi sang "xuéxi" (ra 学校, không ra 学习); quy tắc ô trộn
  dấu so theo có dấu đưa vào Requirement "Quy tắc khớp chữ Hán và pinyin" kèm Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Duyệt vòng 1, minor) Dòng kết quả có nhận focus không?** → không: chỉ để đọc, không nằm trong thứ tự Tab; thêm Scenario (ba đề
  xuất, chờ người thật xác nhận)

## Impact

- Code mới: màn Tra từ (container, hook, component, route), chữ i18n, style BEM; method khớp và xếp thứ tự trong `content.service` (+ unit
  test); có thể thêm hàm bỏ dấu pinyin trong `@csk/shared`.
- Code sửa: Trang chủ (liên kết "Tra từ"), `page.routes.ts`.
- Dữ liệu người dùng: không đổi, không ghi gì. Nội dung: không đổi.
- Dependency: không thêm.
- Tầng test: Vitest cho quy tắc khớp và thứ tự (danh sách từ giả); Testing Library cho màn (trạng thái, vùng tự đọc, thứ tự Tab); e2e
  Playwright trên bản build: Trang chủ → Tra từ, offline, khổ 375.
