# Proposal: S8.4 Tải audio offline theo chủ đề

Story **S8.4 Tải audio offline theo chủ đề · F8** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s84-tải-audio-offline-theo-chủ-đề--f8)) ·
GitHub issue [#57](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/57). Bản 0.2.

Refs #57

## Why

Là người học, tôi muốn tải trước audio của một chủ đề để học offline. Bản 0.1 lưu sẵn (precache) toàn bộ audio Nhập môn khi
mở app lần đầu (S1.2). Từ bản 0.2, audio HSK 1 (15 chủ đề, E11) quá nhiều để lưu sẵn hết; theo docs/03-architecture.md §7, audio
HSK chỉ được lưu khi đã phát một lần, hoặc khi người học bấm tải cả chủ đề. S8.4 thêm nút tải audio của từng chủ đề (hiện dung
lượng) và nút xóa audio đã tải, để người học chủ động chuẩn bị trước khi mất mạng và giải phóng bộ nhớ khi cần (luồng F8).

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Khối "audio offline" của mỗi chủ đề (nhóm) trên bản đồ lộ trình: nhãn trạng thái, nút tải (kèm dung lượng), tiến độ, nút xóa, thông báo, focus | `pages/learning-path/components/` |
| Tác vụ tải + tiến độ + thông báo của từng chủ đề: sống **ngoài cây React của màn** (một instance dùng chung toàn app cho phép subscribe, hoặc provider ở `shared/contexts/`), để việc tải tiếp tục khi màn Lộ trình unmount. Cách cụ thể do `design.md` chốt | `shared/services/` (hoặc `shared/contexts/`) |
| Hook của màn Lộ trình: chỉ subscribe trạng thái và gọi use case tải/xóa, không giữ state tải | `pages/learning-path/hooks/` (+ `core/hooks/useOnlineStatus`) |
| Quy tắc nghiệp vụ: audio nào thuộc chủ đề, tổng dung lượng, % tiến độ, chủ đề ở trạng thái nào, file nào được xóa (giữ audio Nhập môn và audio chủ đề đang tải cần), chủ đề nào có nút xóa | `shared/services/` (service mới, 3 phần, CLAUDE.md §3) |
| Định dạng dung lượng (KB/MB) và phần trăm | `shared/utils/` |
| Hạ tầng lưu/đọc/xóa file audio trong bộ nhớ đệm của trình duyệt (kể cả kiểm audio Nhập môn đã lưu sẵn) | `core/services/` (adapter mới) |
| Chiến lược cache: chỉ lưu sẵn audio Nhập môn, audio HSK cache-first theo yêu cầu | cấu hình PWA (`vite.config.ts`) + `core/modules/pwa` |
| Danh sách audio và dung lượng từng file theo chủ đề, danh sách audio Nhập môn để lưu sẵn | pipeline `content/scripts` + schema Zod `@csk/shared` |
| i18n (nhãn, thông báo), style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

## What Changes

- "Chủ đề" trong change này là một **nhóm** trên bản đồ lộ trình. Trên màn **Lộ trình**, mỗi chủ đề có audio HSK hiện một khối
  audio offline ngay dưới tiêu đề nhóm, trước link "Kiểm tra vượt cấp", với nút **"Tải audio (<dung lượng>)"**. Dung lượng là
  tổng dung lượng audio của chủ đề, hiện theo KB/MB.
- Bấm nút thì tải mọi audio còn thiếu của chủ đề về máy, hiện **"Đang tải <n>%"** (theo số file, tính trên tổng file của chủ
  đề, làm tròn xuống). Tải được nhiều chủ đề cùng lúc. Xong thì hiện **"Đã tải audio (<dung lượng>)"** và nút
  **"Xóa audio"**. Đã tải thì tắt mạng vẫn phát được mọi audio của chủ đề.
- Bấm **"Xóa audio"** thì audio của chủ đề bị xóa khỏi máy, chủ đề quay về nút "Tải audio". Chỉ giữ audio Nhập môn và audio
  mà một chủ đề đang tải cần; chủ đề khác đã tải mà mất audio dùng chung thì cũng về "Tải audio". Nhờ vậy chủ đề đã tải nào cũng
  xóa được, trừ lúc mọi audio của nó đang được một chủ đề khác tải.
- Chủ đề Nhập môn (audio đã lưu sẵn từ S1.2), và chủ đề chỉ dùng audio Nhập môn, hiện nhãn **"Audio có sẵn offline"**, không
  có nút tải hay xóa.
- Lỗi khi tải (mất mạng, hết bộ nhớ, lỗi tải file) hiện thông báo rõ trong khối của chủ đề, giữ phần đã tải, người học bấm tải
  lại được.
- Bắt đầu tải, tải xong, xóa xong và lỗi được đọc cho trình đọc màn hình; focus không rơi về đầu trang khi nút biến mất; khối
  không có hiệu ứng chuyển động.

## Không làm (out of scope)

- Lưu sẵn audio Nhập môn và học offline bản 0.1 → **S1.2** (không đổi).
- Nội dung và audio HSK 1 thật của 15 chủ đề → **E11**. Trước E11, chỉ kiểm thử bằng nội dung mẫu.
- Hủy giữa chừng khi đang tải; tải tất cả chủ đề bằng một nút; tự tải chủ đề kế tiếp.
- Màn quản lý bộ nhớ riêng hoặc mục trong Cài đặt (S8.2 không đổi).
- Hành vi khi phát audio chưa tải lúc offline (nút thử lại, docs/03-architecture.md §8) → giữ nguyên.
- Tải dữ liệu nét chữ hay JSON nội dung theo chủ đề (đã lưu sẵn toàn bộ, S1.2).
- Dọn audio cũ không còn dùng sau khi app cập nhật nội dung.
- Chuyển audio sang kho lưu trữ ngoài (docs/03-architecture.md, rủi ro HSK 3–4).

## Dependencies

- **S1.2** (đã xong): precache khung app, nội dung, audio Nhập môn. S8.4 thu hẹp precache audio về **chỉ Nhập môn**; hành vi S1.2
  không đổi vì nội dung 0.1 chỉ có Nhập môn.
- **S3.1** (đã xong): bản đồ lộ trình hiện chủ đề (nhóm) trong từng giai đoạn; khối audio offline gắn vào tiêu đề chủ đề.
- **E11**: chưa có chủ đề HSK thật, nên trên app thật hiện tại chỉ thấy nhãn "Audio có sẵn offline" của Nhập môn. Kiểm thử phần
  tải/xóa bằng nội dung mẫu. Fixture e2e hiện tại (S1.2) chỉ thêm 1 bài + 1 mp3, không có giai đoạn/chủ đề HSK, nên **cần mở
  rộng fixture e2e để thêm giai đoạn/chủ đề mẫu vào lộ trình** (kèm audio dùng chung giữa hai chủ đề và với Nhập môn).
- Không thêm dependency.

## Capabilities

### New Capabilities
- `offline-audio`: tải trước audio của một chủ đề (hiện dung lượng), theo dõi trạng thái, và xóa audio đã tải.

### Modified Capabilities
- (không có) Khối audio offline nằm trên bản đồ lộ trình nhưng không đổi Requirement nào của `learning-path`.

## Open Questions

- [x] **Nút tải đặt ở đâu?** Chưa có màn Cài đặt hay màn chủ đề riêng → đặt trên màn Lộ trình, ngay dưới tiêu đề mỗi chủ đề (Requirement "Mỗi chủ đề có nút tải, hiện dung lượng") (ba đề xuất, chờ người thật xác nhận)
- [x] **"Mỗi chủ đề" có gồm Nhập môn không?** Audio Nhập môn đã lưu sẵn từ lần mở đầu (S1.2) nên nút tải vô nghĩa → chủ đề Nhập môn hiện nhãn "Audio có sẵn offline", không có nút tải/xóa; chủ đề không có audio nào thì không hiện khối (bảng trạng thái, Scenario "Chủ đề Nhập môn có sẵn offline", "Chủ đề không có audio") (ba đề xuất, chờ người thật xác nhận)
- [x] **Chủ đề đang khóa có tải được không?** → có; tải không phụ thuộc trạng thái học, để người học chuẩn bị trước (Scenario "Chủ đề đang khóa vẫn tải được") (ba đề xuất, chờ người thật xác nhận)
- [x] **Dung lượng hiện thế nào?** → tổng dung lượng mọi audio của chủ đề; dưới 1 MB hiện KB làm tròn lên, từ 1 MB hiện MB một chữ số thập phân, dấu phẩy thập phân; 1 KB = 1024 byte, 1 MB = 1024 KB (bảng trong Requirement) (ba đề xuất, chờ người thật xác nhận)
- [x] **Biên KB/MB** (qa, dev-lead): 1 048 575 byte hay 1 048 064 byte làm tròn lên ra "1024 KB" → làm tròn lên mà đạt 1024 KB thì hiện "1,0 MB"; MB làm tròn nửa lên (1 310 720 byte = 1,25 MB → "1,3 MB") (bảng dung lượng, Scenario "Dung lượng sát 1 MB hiện 1,0 MB", "Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5") (ba đề xuất, chờ người thật xác nhận)
- [x] **Cách tính %** (qa, dev-lead): làm tròn và tải lại sau lỗi → n = số file của chủ đề đang có trên máy / tổng số file của chủ đề × 100, làm tròn xuống, tính cả file có từ trước; đủ file thì hiện "Đã tải", không dừng ở 100% (bảng trong Requirement "Tải audio của chủ đề về máy", Scenario "Tiến độ làm tròn xuống", "Tiến độ tính cả file đã có từ trước") (ba đề xuất, chờ người thật xác nhận)
- [x] **Tải đồng thời** (qa, dev-lead): đang tải A mà bấm tải B → tải song song, mỗi khối có % riêng; xóa B khi A đang tải giữ file A cần (thêm dòng "dùng chung với chủ đề đang tải" vào bảng xóa) (Scenario "Tải hai chủ đề cùng lúc", "Xóa không làm hỏng chủ đề khác đang tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Mâu thuẫn xóa khi mọi audio của chủ đề đều dùng chung** (dev-lead) → giữ định nghĩa "đã tải = đủ file trên máy" (để khớp "Đã nghe hết audio thì là đã tải" và "Mở lại app vẫn thấy đã tải", không cần lưu thêm dữ liệu). Chủ đề mà mọi audio là audio Nhập môn hiện "Audio có sẵn offline"; nút xóa chỉ hiện khi xóa được ít nhất một file, nên "sau khi xóa quay về Chưa tải" luôn đúng. Luật xóa đã đổi ở vòng 2, xem mục "Người học kẹt không xóa được" (ba đề xuất, chờ người thật xác nhận)
- [x] **Thuật ngữ "chủ đề"** (dev-lead): spec `learning-path` gọi là "nhóm" → thêm câu "chủ đề là một nhóm trên bản đồ lộ trình"; khối audio nằm sau tiêu đề nhóm, trước link "Kiểm tra vượt cấp" (Scenario "Khối audio nằm trên link kiểm tra vượt cấp") (ba đề xuất, chờ người thật xác nhận)
- [x] **Trạng thái của một chủ đề** → bốn trạng thái theo thứ tự ưu tiên: có sẵn offline, đang tải (kèm %), chưa tải, đã tải (nút "Xóa audio" chỉ hiện khi xóa được ít nhất một file); "đã tải" nghĩa là mọi audio của chủ đề đang có trên máy (kể cả audio Nhập môn lưu sẵn và audio được lưu vì đã phát); thiếu dù một file thì là "chưa tải" (bảng trạng thái, Scenario "Thiếu một phần audio thì là chưa tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Mở lại app thì trạng thái còn không?** → còn; trạng thái tính lại từ audio đang có trên máy mỗi lần mở bản đồ (Scenario "Mở lại app vẫn thấy đã tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Xóa có hỏi xác nhận không?** → không; xóa đảo ngược được bằng cách tải lại, sau khi xóa có thông báo "Đã xóa audio của chủ đề <tên>." (Scenario "Xóa audio đã tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thông báo lỗi/đã xóa hiện ở đâu, bao lâu** (qa) → trong khối của chính chủ đề, giữ đến khi người học bấm nút kế tiếp trong khối đó (kể cả rời màn rồi quay lại khi app còn mở); mỗi khối độc lập, không đè nhau (Requirement "Báo lỗi khi tải không được", Scenario "Thông báo của mỗi chủ đề độc lập", "Thông báo mất khi bấm nút kế tiếp") (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio dùng chung giữa các chủ đề khi xóa** (cùng câu đọc, cùng giọng thì cùng một file) → xóa chủ đề A giữ audio Nhập môn và audio mà chủ đề "Đang tải" cần; audio dùng chung với chủ đề "Đã tải" khác **bị xóa** và chủ đề đó về "Chưa tải" (đổi ở vòng 2) (Scenario "Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải", "Xóa không làm hỏng chủ đề khác đang tải", "Xóa không làm mất audio Nhập môn") (ba đề xuất, chờ người thật xác nhận)
- [x] **Bấm tải khi đang offline** → không tải, hiện "Cần có mạng để tải audio."; nút vẫn bấm được để tránh nút bị vô hiệu không rõ lý do (Scenario "Bấm tải khi không có mạng") (ba đề xuất, chờ người thật xác nhận)
- [x] **Mất mạng hoặc lỗi giữa chừng** → dừng, giữ các file đã tải, hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.", chủ đề quay về nút "Tải audio"; bấm lại thì tải nốt (Scenario "Mất mạng khi đang tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Hết bộ nhớ** (docs/03-architecture.md §8 đã nêu) → dừng, hiện "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại." (Scenario "Không đủ bộ nhớ") (ba đề xuất, chờ người thật xác nhận)
- [x] **Rời màn Lộ trình khi đang tải** → việc tải tiếp tục khi app còn mở; quay lại bản đồ thấy trạng thái hiện tại, kể cả "Đang tải <n>%" với n hiện tại. Đóng app giữa chừng thì phần đã tải được giữ, mở lại chủ đề hiện "Tải audio" (Scenario "Rời màn khi đang tải", "Quay lại màn khi việc tải còn đang chạy", "Đóng app giữa chừng") (ba đề xuất, chờ người thật xác nhận)
- [x] **Layer của state tải** (dev-lead): hook learning-path mất state khi màn unmount → tác vụ tải + tiến độ + thông báo sống ngoài cây React của màn (instance dùng chung toàn app có subscribe trong `shared/services`, gọi adapter cache ở `core/services`; hoặc provider ở `shared/contexts/`); hook learning-path chỉ subscribe và gọi use case. Cách cụ thể do `design.md` chốt (bảng Layer đích)
- [x] **Bảng Layer có dòng "đo dung lượng còn trống"** (dev-lead) nhưng không Scenario nào cần → bỏ; hết bộ nhớ được phát hiện khi ghi file lỗi (Scenario "Không đủ bộ nhớ")
- [x] **Hủy khi đang tải, tải tất cả chủ đề** → ngoài phạm vi; khi đang tải không hiện nút xóa (out of scope) (ba đề xuất, chờ người thật xác nhận)
- [x] **A11y và giảm chuyển động** → nút có tên đọc được kèm tên chủ đề; đổi trạng thái và lỗi được đọc qua vùng thông báo; tiến độ là chữ phần trăm, không có thanh chạy hay hiệu ứng, nên không phụ thuộc cài đặt giảm chuyển động (Requirement "Trạng thái tải đọc được bằng trình đọc màn hình") (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu đọc qua vùng thông báo và đích focus** (qa) → bắt đầu tải đọc "Đang tải audio chủ đề <tên chủ đề>.", tải xong "Đã tải xong audio chủ đề <tên chủ đề>.", xóa "Đã xóa audio của chủ đề <tên chủ đề>.", lỗi đọc đúng câu lỗi; "Đang tải <n>%" chỉ hiện, không đọc. Focus: bấm tải → dòng "Đang tải <n>%"; tải xong → nút "Xóa audio" (không có thì dòng "Đã tải audio (…)"); lỗi → nút "Tải audio"; bấm xóa → nút "Tải audio"; người học đã đi chỗ khác thì không kéo focus (Scenario "Tải bằng bàn phím và nghe được kết quả", "Focus khi bắt đầu và khi tải xong", "Focus khi tải lỗi", "Không kéo focus khi người học đã đi chỗ khác", "Focus và thông báo khi xóa bằng bàn phím") (ba đề xuất, chờ người thật xác nhận)
- [x] **Precache đang lưu mọi mp3** (cấu hình S1.2) nên audio HSK sau này cũng bị lưu sẵn, mâu thuẫn docs/03-architecture.md §7 → S8.4 thu hẹp lưu sẵn về audio Nhập môn, audio còn lại lưu theo yêu cầu; hành vi S1.2 giữ nguyên. Scenario "Xóa không làm mất audio Nhập môn" chứng minh audio Nhập môn vẫn lưu sẵn; Scenario "Mới cài app thì audio HSK chưa có trên máy" chứng minh audio HSK không còn bị lưu sẵn (ba đề xuất, chờ người thật xác nhận)
- [x] **Chưa có chủ đề HSK thật (E11)** → kiểm thử tải/xóa bằng nội dung mẫu trong bản build e2e; fixture S1.2 chỉ có 1 bài + 1 mp3 nên phải mở rộng để thêm giai đoạn/chủ đề mẫu vào lộ trình (Dependencies, Impact) (ba đề xuất, chờ người thật xác nhận)
- [x] **Người học kẹt không xóa được** (qa vòng 2, major): luật cũ giữ mọi file dùng chung với chủ đề "Đã tải" khác, nên A={x,y}, B={y,z}, C={x,z} đều đã tải thì không chủ đề nào có nút xóa; hai chủ đề cùng bộ audio cũng kẹt; chủ đề chưa từng bấm tải cũng chặn xóa chủ đề kia → chọn hướng (a): xóa A thì xóa mọi audio của A trừ audio Nhập môn và audio mà chủ đề đang tải cần; chủ đề "Đã tải" dùng chung rớt về "Chưa tải", không thông báo riêng (người học thấy ngay nút "Tải audio" của chủ đề đó trên cùng màn). Không cần lưu thêm dữ liệu, IndexedDB không đổi. Không chọn (b) (thông báo kể tên chủ đề bị ảnh hưởng, thêm câu và trường hợp liệt kê dài) và (c) (chỉ bảo vệ chủ đề đã bấm tải, phải lưu thêm dữ liệu) (bảng xóa, Requirement "Nút xóa chỉ hiện khi xóa được", Scenario "Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải", "Chủ đề dùng chung audio vòng tròn vẫn xóa được", "Hai chủ đề cùng bộ audio vẫn xóa được", "Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Còn trường hợp không có nút xóa** (qa vòng 2): chủ đề "Đã tải" mà mọi audio là audio Nhập môn hoặc thuộc chủ đề đang tải → đã biết và chấp nhận: chỉ tạm thời, nút "Xóa audio" hiện khi chủ đề kia tải xong hoặc dừng vì lỗi; tải xong mà không có nút xóa thì focus tới dòng "Đã tải audio (…)" (Scenario "Audio đang được chủ đề khác tải thì tạm chưa có nút xóa", "Tải xong mà không có nút xóa thì focus tới dòng đã tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Thông báo cạnh trạng thái mâu thuẫn** (qa vòng 2): trạng thái đổi mà không bấm gì (nghe đủ audio, chủ đề khác tải xong file dùng chung) → thông báo của khối mất khi trạng thái chủ đề khác với lúc thông báo hiện (Requirement "Thông báo mất khi trạng thái chủ đề đổi", Scenario "Thông báo mất khi trạng thái đổi mà không bấm gì"). Vòng 3 (dev-lead/qa): bỏ ví dụ "bị xóa theo luật xóa" vì khối chỉ có thông báo khi chủ đề "Chưa tải", mà xóa chủ đề khác không đưa chủ đề "Chưa tải" sang trạng thái khác (ba đề xuất, chờ người thật xác nhận)
- [x] **Chủ đề Nhập môn không có audio khớp hai luật** (qa vòng 2) → luật "không có audio thì không có khối" xét trước, thành dòng đầu bảng trạng thái (Scenario "Chủ đề Nhập môn không có audio thì không có khối") (ba đề xuất, chờ người thật xác nhận)
- [x] **Hai chủ đề báo cùng lúc đè nhau trong vùng thông báo** (qa vòng 2) → mỗi câu phải được đọc đủ, không bị câu chủ đề khác thay mất; cách làm (xếp hàng câu, nhiều vùng thông báo…) do `design.md` chốt (Requirement "Vùng thông báo đọc đổi trạng thái", Scenario "Hai chủ đề báo cùng lúc thì đọc đủ cả hai") (ba đề xuất, chờ người thật xác nhận)
- [x] **Nút "Tải audio" đang focus biến mất mà người học không bấm gì** (vòng 3): chủ đề tự thành "Đã tải" khi chủ đề khác tải xong audio dùng chung → focus đi như "Tải xong": tới nút "Xóa audio", không có thì dòng "Đã tải audio (…)" (Requirement mới "Focus khi chủ đề tự thành đã tải", tách khỏi bảng focus để Requirement không quá dài, Scenario "Nút tải đang focus biến mất vì chủ đề tự thành đã tải") (ba đề xuất, chờ người thật xác nhận)
- [x] **Điều kiện Scenario "Tải xong mà không có nút xóa thì focus tới dòng đã tải" lệch Requirement "Nút xóa chỉ hiện khi xóa được"** (vòng 3) → WHEN ghi "mọi audio của chủ đề A là audio Nhập môn hoặc cũng thuộc chủ đề C, có ít nhất một audio không phải audio Nhập môn"
- [x] **Scenario khẳng định nút "Xóa audio" thiếu điều kiện "không có chủ đề nào đang tải"** (vòng 3) → thêm điều kiện vào "Đã nghe hết audio thì là đã tải" (kèm "có ít nhất một audio không phải audio Nhập môn") và "Bấm tải thì audio của chủ đề có trên máy"
- [x] **Rủi ro kỹ thuật phát audio từ cache** (dev-lead): phần tử audio gửi header Range → phản hồi 206, chiến lược cache-first mặc định không cache 206; có thể buộc đổi cách sinh service worker (đụng cấu hình PWA S1.2) → không đổi hành vi spec; ghi vào Impact để `design.md` xử lý (cache bản đầy đủ, phục vụ Range từ cache, kiểm trên Safari iOS)

## Impact

- Code mới: service quy tắc audio offline (+ test), nơi giữ tác vụ tải dùng chung toàn app (ngoài cây React của màn), adapter bộ
  nhớ đệm audio trong `core/services/` (+ test), util định dạng dung lượng, hook và component khối audio offline trên bản đồ,
  e2e `apps/web/e2e/E8/`.
- Code sửa: cấu hình PWA (precache chỉ audio Nhập môn, audio còn lại cache-first), pipeline nội dung và schema nội dung (thêm
  dung lượng từng file audio, danh sách audio theo chủ đề), `LearningPathStage.tsx` (khối audio sau tiêu đề nhóm, trước link
  "Kiểm tra vượt cấp"), i18n, style.
- **Fixture e2e**: mở rộng `apps/web/e2e/fixtures/offlineFixturesPlugin.ts` (hiện chỉ 1 bài + 1 mp3) để thêm giai đoạn/chủ đề
  HSK mẫu vào lộ trình, có audio dùng chung giữa hai chủ đề và với Nhập môn.
- **Precache theo danh sách từ nội dung**: audio đặt tên theo hash, nằm phẳng trong `assets/audio/`, nên không thu hẹp precache
  bằng glob thư mục được; danh sách audio Nhập môn phải do pipeline nội dung sinh ra. File HSK dùng chung với Nhập môn nằm trong
  precache, nên khi tính trạng thái chủ đề phải xét cả precache lẫn cache audio theo yêu cầu.
- **Rủi ro phát audio từ cache**: phần tử audio gửi header Range → 206; cache-first mặc định không cache 206. Có thể phải đổi
  cách sinh service worker (generateSW → injectManifest), đụng cấu hình PWA của S1.2; cần cache bản 200 đầy đủ, trả Range từ
  cache, và kiểm trên Safari iOS.
- Không đổi IndexedDB (trạng thái suy ra từ audio đang có trên máy, không lưu riêng). Không thêm dependency.
