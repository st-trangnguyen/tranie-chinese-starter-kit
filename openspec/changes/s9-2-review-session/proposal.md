# Proposal: S9.2 Màn ôn tập

Story **S9.2 Màn ôn tập · F4** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s92-màn-ôn-tập--f4)) ·
GitHub issue [#40](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/40). Bản 0.2, epic E9 Ôn tập SRS.

Refs #40

## Why

Là người học, tôi muốn ôn các thẻ đến hạn và tự chấm mức nhớ để app xếp lịch ôn hợp lý. S9.1 đã tự tạo thẻ ôn tập (chiều nghĩa, nghe,
viết) nhưng người học chưa có chỗ nào để ôn; S9.2 là màn đầu tiên người học thấy và dùng thẻ.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Quy tắc thẻ nào đến hạn, thứ tự hỏi, bỏ qua thẻ của từ không có trong app (Phần 2, pure); chấm một thẻ và tính thời điểm ôn tiếp theo theo FSRS (Phần 2, pure); use case "lấy phiên ôn" và "chấm thẻ rồi lưu" (Phần 3) | `shared/services/srs.service.ts` (đã có từ S9.1, thêm method) |
| Đọc thẻ đến hạn, ghi thẻ sau khi chấm | `core/services/` (`ProgressStore`, nơi lưu thẻ của S9.1, không đổi cấu trúc) |
| Màn ôn tập (entry lazy-load) và route | `pages/review/containers/`, `pages/review/review.routes.ts` (mới) |
| UI riêng của màn ôn tập: mặt hỏi theo chiều, mặt đáp án, 4 nút chấm, màn hết thẻ / không có thẻ | `pages/review/components/` |
| State phiên ôn (thẻ đang hỏi, đã hiện đáp án chưa, lỗi lưu), gọi service | `pages/review/hooks/` |
| Phát audio của từ | `core/hooks/` (hook audio hiện có) |
| Nút "Ôn tập" trên Trang chủ | `pages/home/components/` |
| Chữ hiển thị, style BEM | `assets/i18n/vi/review.json` (mới), `apps/web/src/styles/tailwind/` |

## What Changes

- **Màn ôn tập mới**, mở từ nút "Ôn tập" trên Trang chủ. Lúc mở màn, app lấy các thẻ đến hạn (thời điểm ôn tiếp theo đã tới; thẻ "mới"
  đến hạn ngay khi được tạo), hỏi lần lượt từng thẻ: thẻ đã chấm trước (hạn sớm hơn hỏi trước), thẻ "mới" sau (coi như cùng hạn); cùng hạn thì nghĩa → nghe → viết,
  rồi theo vị trí của từ trong lộ trình (bài đầu tiên, câu đầu tiên chứa từ). Danh sách chốt
  lúc mở màn; màn hiện "Thẻ 3 / 12". Đang hỏi thẻ thì đầu màn có liên kết "Về Trang chủ".
- **Mỗi thẻ hỏi theo chiều của nó**, cùng một cách: mặt hỏi → bấm "Hiện đáp án" → mặt đáp án → tự chấm.

  | Chiều | Mặt hỏi | Mặt đáp án |
  |---|---|---|
  | Nghĩa (nhìn chữ đoán nghĩa) | Chữ Hán của từ, không pinyin, không nghĩa | Chữ Hán, pinyin, nghĩa, nút "Nghe" |
  | Nghe (nghe chọn chữ) | Nút "Nghe" (không tự phát), không chữ, không pinyin, không nghĩa | như trên |
  | Viết (nhìn nghĩa viết chữ) | Mọi nghĩa của từ; người học viết ra giấy hoặc nhớ trong đầu | như trên |

- **Tự chấm 4 mức** "Quên" / "Khó" / "Được" / "Dễ", 4 nút chỉ hiện sau khi hiện đáp án. Bấm một nút thì lưu ngay và sang thẻ kế.
- **FSRS tính ngày ôn tiếp theo** sau mỗi lần chấm (tham số mặc định, không ngẫu nhiên). Thời điểm ôn tiếp theo có thể chỉ sau vài phút
  (bước học ngắn hạn của thẻ mới). Mức cao hơn không bao giờ cho thời điểm ôn sớm hơn mức thấp hơn. Thẻ đã chấm không còn ở trạng thái "mới". Quy tắc xếp lịch có unit test.
- **Các trạng thái của màn**: không có thẻ nào, không có thẻ đến hạn, hết thẻ của phiên, không tải được thẻ, không lưu được mức chấm.
- **Trang chủ** có thêm nút "Ôn tập" (delta `home-screen`).
- Dùng được hoàn toàn khi offline; audio chưa tải thì báo không phát được như S4.4 và vẫn hiện đáp án, chấm được.
- Bàn phím: mọi nút dùng được bằng Tab + Enter/Space, có viền focus; focus không rơi khi đổi mặt thẻ, sang thẻ kế, lưu lỗi hay "Thử lại".
  Thông báo lỗi lưu, lỗi tải, không phát được audio được trình đọc màn hình đọc tự động.

## Không làm (out of scope)

- Giới hạn 20 thẻ mới / 200 lượt ôn mỗi ngày và chỉnh trong Cài đặt → **S9.3**. Ở S9.2 mọi thẻ đến hạn đều được hỏi, kể cả thẻ "mới".
- Câu sai trong bài kiểm tra tạo thẻ hoặc đưa thẻ về ôn sớm → **S9.4**.
- Thống kê thẻ theo trạng thái, dự báo lượt ôn, số thẻ đến hạn trên Trang chủ → **S9.5**.
- Tạo thẻ, đơn vị thẻ, ba chiều → **S9.1** (không định nghĩa lại). Chấm thẻ chiều viết bằng khung viết không gợi ý → **S6.3**.
- **Lưu lịch sử từng lượt ôn** (mức đã chấm, lúc nào). Không cần cho S9.2: FSRS tính thời điểm ôn tiếp theo từ toàn bộ trạng thái nhớ
  hiện tại của thẻ (xem Dependencies S9.1), không cần lịch sử. Không đổi cấu trúc dữ liệu lưu trên máy, không đổi file sao lưu. S9.3 / S9.5 cần đếm lượt ôn thì tự quyết.
- Khung viết trên màn ôn tập cho thẻ chiều viết (chấm tự động bằng kết quả viết). Câu hỏi trắc nghiệm (chọn 1 trong nhiều chữ) cho thẻ
  chiều nghe.
- Hiện trước khoảng ngày ôn trên nút chấm (ví dụ "Dễ · 4 ngày"), hoàn tác lần chấm, phím tắt 1–4, ôn thêm thẻ chưa đến hạn, hỏi lại thẻ
  "Quên" trong cùng phiên, tách các chiều của cùng một từ ra xa nhau.
- Tính thời gian ở màn ôn tập vào số phút học hôm nay / streak (S8.1, S8.3 giữ nguyên: màn ôn tập là "màn khác", không tính).
- Tùy chỉnh tham số FSRS, tối ưu tham số theo lịch sử ôn.
- Công tắc "Hiện pinyin" (S8.2) không áp dụng cho màn ôn tập.

## Dependencies

- **S9.1** (spec PR #148, đã merge vào `main`; code chưa có): thẻ ôn tập ba chiều, trạng thái "mới", mỗi từ tối đa một thẻ mỗi chiều
  (Requirement "Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe", "Thẻ chiều viết chỉ tạo sau khi từ đã được viết theo nét",
  "Không tạo trùng thẻ chiều nghĩa và chiều nghe"); thẻ của từ không có trong nội dung app có thể tồn tại sau khi nhập file (Requirement
  "Thẻ và chữ đã viết của từ không có trong app vẫn nhập được"). S9.2 quyết định không hỏi các thẻ đó. Code S9.2 làm sau code S9.1.
  - **Trạng thái nhớ đầy đủ**: S9.2 dựa vào việc S9.1 lưu cho mỗi thẻ đủ trạng thái FSRS mà thư viện cần để chấm tiếp (độ ổn định, độ khó,
    số lần ôn, số lần quên, lần ôn gần nhất, bước học, trạng thái, hạn), và file sao lưu của S9.1 giữ đủ các trường đó. Kiến trúc đã duyệt
    (`docs/03-architecture.md`, bảng thẻ) ghi "Trạng thái FSRS", nên đây không phải đổi cấu trúc dữ liệu. Spec S9.1 chỉ ghi "trạng thái,
    ngày ôn tiếp theo"; nếu plan S9.1 lưu hẹp hơn thế thì khi đó mới cần người thật quyết. Scenario "Thẻ nhập từ file sao lưu chấm ra cùng
    kết quả như máy gốc" kiểm tra điều này.
  - **Thứ tự hỏi không dựa vào lúc tạo thẻ "mới"**, nên S9.2 không ràng buộc gì thêm lên cách S9.1 ghi thời điểm tạo thẻ.
- **S6.3** (spec đã merge ở PR #120, code chưa có): ghi mức chấm vào thẻ chiều viết của từ một chữ và để "lịch ôn thuộc S9.2 AC3". S9.2 định nghĩa một quy tắc
  xếp lịch cho mọi lần thẻ nhận một mức chấm, nên mức từ S6.3 cũng xếp lịch theo đúng quy tắc này; màn ôn tập hỏi thẻ chiều viết bằng tự
  chấm, không dùng khung viết, nên không chồng với S6.3.
- **S4.4 / S8.4**: nút "Nghe", không tự phát, báo khi audio không phát được; audio offline theo chủ đề đã tải.
- **S8.1**: Trang chủ có thêm nút "Ôn tập"; các phần cũ không đổi.
- **S9.3**: sẽ chèn giới hạn mỗi ngày vào bước "lấy thẻ đến hạn" của S9.2.
- Dependency `ts-fsrs` đã được người thật duyệt ở S9.1; S9.2 không thêm dependency.

## Capabilities

### New Capabilities
- `review-session`: màn ôn tập: lấy thẻ đến hạn, hỏi theo chiều, tự chấm 4 mức, xếp lịch ôn tiếp theo, các trạng thái rỗng / hết / lỗi.

### Modified Capabilities
- `home-screen`: thêm nút "Ôn tập" mở màn ôn tập (ADDED, các Requirement cũ không đổi).

## Open Questions

Quyết định ba đề xuất, chờ người thật xác nhận (chi tiết ở các dòng bên dưới):

1. Vào màn ôn tập bằng nút "Ôn tập" trên Trang chủ, luôn hiện.
2. Mọi chiều hỏi cùng một cách: mặt hỏi → "Hiện đáp án" → tự chấm; chiều nghe không trắc nghiệm, chiều viết không có khung viết.
3. Nội dung mặt hỏi theo từng chiều và mặt đáp án chung (bảng ở What Changes).
4. "Đến hạn" = thời điểm ôn tiếp theo đã tới; thẻ "mới" đến hạn ngay; danh sách chốt lúc mở màn.
5. Thẻ "Quên" không hỏi lại trong cùng phiên; mở lại màn thì thẻ nào đã tới hạn được hỏi.
6. Thẻ của từ không có trong nội dung app: không hỏi, không tính vào tổng, giữ nguyên thẻ.
7. FSRS tham số mặc định, không ngẫu nhiên; mức cao hơn không cho thời điểm sớm hơn; thẻ mới có bước học ngắn hạn (vài phút).
8. Không lưu lịch sử lượt ôn; không đổi dữ liệu lưu trên máy hay file sao lưu.
9. Thông báo các trạng thái rỗng / hết / lỗi tải / lỗi lưu.
10. Audio: không tự phát; không phát được thì báo như S4.4, vẫn chấm được.
11. Bàn phím và focus: Tab + Enter/Space; focus sang đáp án sau "Hiện đáp án", sang mặt hỏi của thẻ kế sau khi chấm.
12. Thời gian ở màn ôn tập chưa tính vào phút học hôm nay / streak.
13. Giữa phiên: liên kết "Về Trang chủ" ở đầu màn (cùng nút quay lại của trình duyệt), rời màn không cần xác nhận.
14. Focus ở mặt hỏi / mặt đáp án / thông báo hết thẻ: có viền focus, không nằm trong thứ tự Tab, trình đọc màn hình đọc "Đáp án …" hoặc
    "Thẻ x / y …".
15. Thứ tự: thẻ đã chấm (hạn sớm trước) rồi thẻ "mới" (coi như cùng hạn); cùng hạn thì nghĩa → nghe → viết, rồi theo vị trí của từ trong
    lộ trình.
16. Thông báo lỗi lưu, lỗi tải, không phát được audio nằm trong vùng thông báo đọc tự động.
17. Bấm nút chấm hai lần thật nhanh: chỉ lần đầu được tính, không chấm thẻ kế.
18. Focus sau "Thử lại": đọc được thì sang mặt hỏi thẻ đầu tiên; vẫn lỗi thì giữ ở "Thử lại".
19. Vị trí của từ trong lộ trình: bài đầu tiên chứa từ, rồi câu đầu tiên trong bài đó, câu cặp âm thì từ khai báo trước; từ ngoài lộ trình
    đứng sau, so theo mã Unicode.
20. Mặt hỏi chiều viết hiện mọi nghĩa của từ.

- [x] **Người học vào màn ôn tập từ đâu?** Story không nói. → nút "Ôn tập" trên Trang chủ, luôn hiện (kể cả khi chưa có thẻ, màn ôn tập
  tự báo); không hiện số thẻ đến hạn trên Trang chủ (S9.5). Delta `home-screen` (ba đề xuất, chờ người thật xác nhận)
- [x] **"Hỏi theo chiều" là hỏi thế nào? Chiều nghe "nghe chọn chữ" có phải trắc nghiệm, chiều viết có khung viết không?** → mọi chiều dùng
  một cách hỏi: mặt hỏi, bấm "Hiện đáp án", tự chấm 4 mức (AC2 áp dụng cho mọi thẻ). Trắc nghiệm hay khung viết sẽ cho kết quả đúng/sai tự
  động, chồng với tự chấm và với S6.3; cần thêm quy tắc chọn chữ nhiễu. Bảng trong Requirement "Mỗi thẻ hỏi theo chiều của nó" (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Mặt hỏi / mặt đáp án hiện gì?** → nghĩa: chữ Hán; nghe: chỉ nút "Nghe"; viết: nghĩa. Đáp án chung: chữ Hán, pinyin, mọi nghĩa của
  từ, nút "Nghe". Công tắc "Hiện pinyin" không áp dụng (mặt hỏi không có pinyin, đáp án luôn có) (ba đề xuất, chờ người thật xác nhận)
- [x] **"Thẻ đến hạn" và thứ tự hỏi?** → thẻ có thời điểm ôn tiếp theo không muộn hơn lúc mở màn; thẻ "mới" đến hạn ngay khi tạo; thứ
  tự theo bảng ở Requirement "Thứ tự hỏi các thẻ"; danh sách chốt lúc mở màn, không tự thêm thẻ vừa tới hạn trong lúc đang ôn (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ chấm "Quên" có hỏi lại ngay trong phiên?** → không; thời điểm ôn tiếp theo do FSRS tính, mở lại màn khi tới hạn thì được hỏi (ba đề
  xuất, chờ người thật xác nhận)
- [x] **Thẻ của từ không có trong nội dung app (từ file sao lưu, S9.1 để S9.2 quyết)?** → không hỏi, không tính vào "Thẻ x / y", thẻ giữ
  nguyên trạng thái và thời điểm ôn; không xóa. Thẻ đọc không được cũng bỏ qua như vậy, các thẻ khác vẫn hỏi (ba đề xuất, chờ người thật xác nhận)
- [x] **FSRS dùng tham số nào, có ngẫu nhiên?** → tham số mặc định, tắt phần ngẫu nhiên để cùng thẻ, cùng mức, cùng lúc chấm luôn cho cùng
  thời điểm (test lặp lại được). Không tùy chỉnh tham số. Hệ quả (dev-lead): tham số mặc định có bước học ngắn hạn, thẻ mới chấm "Quên"
  quay lại sau khoảng 1 phút, "Khó" khoảng 6 phút, "Được" khoảng 10 phút, chỉ "Dễ" cho số ngày; mở lại màn sau đó là được hỏi lại. Spec
  dùng chữ "thời điểm ôn tiếp theo" thay "ngày ôn tiếp theo" (trừ tên Requirement chép nguyên văn AC3) (ba đề xuất, chờ người thật xác nhận)
- [x] **Có cần lưu lịch sử từng lượt ôn (review log) ở S9.2?** → không: FSRS chỉ cần toàn bộ trạng thái nhớ hiện tại của thẻ (S9.1 lưu,
  xem Dependencies). Không thêm dữ liệu lưu trữ, không đổi file sao lưu; ghi vào "Không làm". S9.3 (đếm 200 lượt ôn mỗi ngày) và S9.5 tự quyết nếu
  cần (ba đề xuất, chờ người thật xác nhận)
- [x] **Thông báo cho các trạng thái?** → chưa có thẻ nào: "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ."; có thẻ nhưng chưa tới
  hạn: "Không có thẻ nào cần ôn lúc này."; hết thẻ của phiên: "Đã ôn xong N thẻ."; không tải được: "Không tải được thẻ ôn tập." + nút
  "Thử lại"; không lưu được mức chấm: "Không lưu được kết quả. Hãy chấm lại." và giữ thẻ, 4 nút vẫn bấm được. Mọi trạng thái kết thúc có nút
  "Về Trang chủ" (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio ở thẻ chiều nghe khi offline / chưa tải?** → nút "Nghe", không tự phát (như S4.4); không phát được thì báo không phát được
  audio, vẫn bấm "Hiện đáp án" và chấm được (ba đề xuất, chờ người thật xác nhận)
- [x] **Bàn phím cho 4 nút chấm?** → mỗi nút là một nút có chữ, Tab tới được, Enter/Space bấm được, viền focus nhìn thấy; sau "Hiện đáp án"
  focus sang đáp án (không đặt sẵn vào nút "Quên" để tránh chấm nhầm); sau khi chấm focus sang mặt hỏi của thẻ kế hoặc thông báo hết thẻ.
  Không có phím tắt 1–4 (ba đề xuất, chờ người thật xác nhận)
- [x] **Giữa phiên rời màn bằng cách nào (QA)?** → liên kết "Về Trang chủ" ở đầu màn khi đang hỏi thẻ; nút quay lại của trình duyệt cũng
  được; không hỏi xác nhận vì mỗi lần chấm đã lưu ngay. Requirement "Rời màn giữa phiên", Scenario "Thoát giữa phiên" dùng liên kết này (ba
  đề xuất, chờ người thật xác nhận)
- [x] **Vùng nhận focus (mặt đáp án, mặt hỏi) có viền focus không, trình đọc màn hình đọc gì (QA)?** → có viền focus nhìn thấy, không nằm
  trong thứ tự Tab; mặt đáp án đọc "Đáp án" rồi chữ, pinyin, nghĩa; mặt hỏi đọc "Thẻ x / y" rồi nội dung mặt hỏi; thông báo hết thẻ đọc
  chính câu đó. Cột "Trình đọc màn hình đọc" trong bảng focus (ba đề xuất, chờ người thật xác nhận)
- [x] **Thứ tự thẻ cùng hạn (QA)?** → nghĩa → nghe → viết, rồi từ đứng trước trong lộ trình học hỏi trước; bảng ưu tiên trong Requirement
  "Thứ tự hỏi các thẻ" + Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ "mới" xếp theo "lúc tạo thẻ" phụ thuộc mili giây và không có cho thẻ nhập từ file (qa + dev-lead, vòng 1)?** → bỏ "lúc tạo
  thẻ": thẻ đã chấm hỏi trước (hạn sớm hơn trước), thẻ "mới" hỏi sau và mọi thẻ "mới" coi như cùng hạn, rồi xét chiều và vị trí trong lộ
  trình. Không ràng buộc thêm lên code S9.1, không đổi cấu trúc dữ liệu. Scenario "Thẻ đã chấm hỏi trước thẻ mới", "Thẻ mới tạo ở các lần
  khác nhau vẫn xếp theo chiều rồi theo lộ trình" (ba đề xuất, chờ người thật xác nhận)
- [x] **"Từ đứng trước trong lộ trình" khi lộ trình chỉ xếp giai đoạn / nhóm / bài (qa, vòng 1)?** → vị trí của từ = bài đầu tiên trong lộ
  trình (theo thứ tự khai báo) có câu chứa từ, rồi câu đầu tiên trong bài đó chứa từ; cùng câu cặp âm thì từ khai báo trước đứng trước; từ
  không nằm trong bài nào đứng sau, so theo mã Unicode của chữ Hán. Bảng trong Requirement "Thứ tự hỏi các thẻ", Scenario "Vị trí của từ
  theo bài đầu tiên và câu đầu tiên chứa từ" (ba đề xuất, chờ người thật xác nhận)
- [x] **Mặt hỏi chiều viết hiện một nghĩa hay mọi nghĩa (qa, vòng 1)?** → mọi nghĩa của từ, giống mặt đáp án; một nghĩa sẽ làm câu hỏi mơ
  hồ hơn và phải thêm quy tắc chọn nghĩa. Scenario "Thẻ chiều viết hiện mọi nghĩa của từ" với "谢谢" (ba đề xuất, chờ người thật xác nhận)
- [x] **FSRS cần đủ trạng thái nhớ, spec S9.1 chỉ ghi "trạng thái, ngày ôn tiếp theo" (dev-lead, vòng 1)?** → ghi ở Dependencies: S9.2 dựa
  vào việc S9.1 lưu và sao lưu đủ trạng thái FSRS (kiến trúc đã duyệt ghi "Trạng thái FSRS"); thêm Scenario "Thẻ nhập từ file sao lưu chấm
  ra cùng kết quả như máy gốc". Không đổi cấu trúc dữ liệu đã duyệt
- [x] **Scenario "Chấm thì sang thẻ kế" thiếu trạng thái ban đầu (qa, vòng 1)?** → thêm "2 thẻ ở trạng thái 'mới'"
- [x] **S6.3 ghi "spec chưa merge" (dev-lead, vòng 1)?** → sửa: spec đã merge ở PR #120, code chưa có
- [x] **Bảng mẫu FSRS phụ thuộc phiên bản thư viện (dev-lead, vòng 1)?** → Scenario "Ngày ôn tiếp theo khớp FSRS" ghi bảng mẫu ứng với phiên
  bản thư viện khóa trong dự án; nâng phiên bản phải cập nhật bảng có chủ đích trong cùng thay đổi
- [x] **Thông báo lỗi lưu / không phát được audio có được đọc tự động (QA)?** → có, cả hai và thông báo lỗi tải nằm trong vùng được trình
  đọc màn hình đọc tự động, đọc lại mỗi lần lỗi (như S8.5) (ba đề xuất, chờ người thật xác nhận)
- [x] **Bấm nút chấm hai lần thật nhanh (QA)?** → chỉ lần đầu được lưu, không chấm thẻ kế; thêm Scenario "Bấm nút chấm hai lần thật nhanh
  chỉ chấm một lần" (ba đề xuất, chờ người thật xác nhận)
- [x] **Focus sau "Thử lại" ở màn lỗi tải (QA)?** → có, thêm vào bảng focus: đọc được thì mặt hỏi thẻ đầu tiên; không có thẻ để hỏi thì
  thông báo trạng thái; vẫn lỗi thì giữ ở "Thử lại". Scenario "Focus sau khi Thử lại" (ba đề xuất, chờ người thật xác nhận)
- [x] **Thời gian ôn có tính vào phút học hôm nay / streak?** → không ở S9.2: spec `daily-study-time` coi mọi màn ngoài màn bài là không
  tính; đổi sẽ sửa S8.1/S8.3, để story riêng nếu cần (ba đề xuất, chờ người thật xác nhận)

## Impact

- Code mới: `pages/review/` (container, hook, component, route), `review.json`, style BEM; method lấy phiên ôn và chấm thẻ trong `srs.service` (+ unit test xếp lịch).
- Code sửa: Trang chủ (nút "Ôn tập"), `page.routes.ts`.
- Dữ liệu người dùng: không đổi cấu trúc dữ liệu lưu trên máy, không đổi file sao lưu (chỉ cập nhật thẻ trong nơi lưu của S9.1).
- Dependency: không thêm (`ts-fsrs` đã duyệt ở S9.1).
- Tầng test: Vitest cho quy tắc đến hạn, thứ tự, bỏ qua thẻ, xếp lịch FSRS (Phần 2) và use case với `ProgressStore` giả; Testing Library cho
  hook và component màn ôn tập (mặt hỏi theo chiều, 4 nút, trạng thái, focus); e2e Playwright trên bản build: có thẻ → ôn hết → chấm →
  thẻ không còn đến hạn, và chạy offline.
