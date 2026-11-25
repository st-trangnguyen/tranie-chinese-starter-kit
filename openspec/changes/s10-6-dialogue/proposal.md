# Proposal: S10.6 Hội thoại

Story **S10.6 Hội thoại · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s106-hội-thoại--f3)) ·
GitHub issue [#49](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/49). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #49

## Why

Là người học, tôi muốn nghe hội thoại theo cách linh hoạt để luyện nghe hiểu. Mỗi chủ đề HSK 1 có một bài "Hội thoại" (S11.1), nhưng màn
bài hiện chỉ có các dạng bài nghe/nói/viết theo từ hoặc câu lẻ. S10.6 thêm dạng bài "hội thoại": nhiều lời của hai vai, nghe cả bài hoặc
từng lời, bật/tắt pinyin và bản dịch. S10.7 Đóng vai dựng tiếp trên dạng bài này.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Schema nội dung cho dạng bài hội thoại (các lời, vai, câu của mỗi lời) | `packages/shared` (`@csk/shared`, `content.schema.ts`) |
| Component câu hội thoại (danh sách lời, nút nghe, hai công tắc), đăng ký vào registry theo dạng bài | `shared/components/exercises/` |
| Phát audio từng lời và phát lần lượt cả bài, dừng, một luồng âm, tốc độ "Nghe chậm" | `core/hooks/` (hook audio hiện có, mở rộng nếu cần) |
| Câu hội thoại thuộc tập câu không chấm điểm của quy tắc chung S10.1 (Phần 2) | `shared/services/` (service chấm/tiến độ của màn bài hiện có) |
| Luật kiểm tra hội thoại (số lời, vai, câu trỏ tới, đủ pinyin/nghĩa/audio, giọng của câu khớp vai) | `packages/shared` (schema Zod) + kiểm tra nội dung của pipeline |
| Giữ lựa chọn "Pinyin"/"Bản dịch" qua các câu hội thoại trong một lần mở bài | `pages/lesson/hooks/` (state của màn bài) |
| Pipeline nội dung đọc và kiểm tra bài hội thoại, tạo audio cho câu của từng lời | `content/` (scripts) |
| Chữ hiển thị, style BEM | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

Planner xác nhận tên file/hook cụ thể theo code hiện có.

## What Changes

- **Dạng bài mới "hội thoại"** trong màn bài: hàng điều khiển ("Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch"), rồi mọi lời theo thứ
  tự, mỗi lời có nhãn "Vai A"/"Vai B", chữ Hán, pinyin, bản dịch (theo công tắc) và nút "Nghe" riêng, cuối cùng "Tiếp tục". Không tự phát
  khi câu hiện ra (như S4.4).
- **Cấu trúc nội dung hội thoại (dùng chung với S10.7)**: hội thoại là nội dung riêng của chủ đề, gồm danh sách lời theo thứ tự; mỗi lời là
  một vai (A hoặc B) và một câu của nội dung (chữ Hán, pinyin, nghĩa tiếng Việt, audio). Câu hội thoại (S10.6) và câu đóng vai (S10.7) đều
  trỏ tới một hội thoại; nhiều câu có thể trỏ cùng một hội thoại. S10.7 theo cấu trúc này.
- **Nghe cả bài hoặc từng câu (AC1)**: nút "Nghe cả bài" phát lần lượt mọi lời, đổi thành "Dừng" trong lúc phát; lời đang phát có chữ
  "Đang phát" và được cuộn vào khung nhìn (giảm chuyển động thì cuộn ngay). Nút "Nghe" của một lời chỉ phát lời đó; bấm khi đang phát thì
  dừng phần đang phát. Luôn chỉ một luồng âm. Câu hội thoại có công tắc "Nghe chậm" riêng trên câu (ngay sau "Nghe cả bài", cùng trạng
  thái với công tắc của cả bài như thẻ từ mới S10.1). Sang câu kế hoặc rời bài thì dừng.
- **Bật/tắt pinyin và bản dịch (AC2)**: hai công tắc "Pinyin" (mặc định bật) và "Bản dịch" (mặc định tắt) trên câu hội thoại, áp dụng cho
  mọi lời cùng lúc, giữ qua các câu hội thoại còn lại của lần học bài đó, mở lại bài thì về mặc định. Không đổi và không phụ thuộc công tắc
  "Hiện pinyin" của Cài đặt.
- **Câu không chấm điểm**: câu hội thoại thêm vào tập câu không chấm điểm của quy tắc chung S10.1 ("Tiếp tục" ngay, không "Đúng"/"Sai",
  vẫn đếm trong "Câu k / n", bấm "Tiếp tục" là đã làm, không tính vào điểm). Không định nghĩa lại cách tính điểm, không mang delta
  `lesson-runner`: quy tắc chung và luật kiểm tra nội dung chung (bài kiểm tra không có câu không chấm điểm, bài học phải có câu chấm điểm)
  nằm trong delta `lesson-runner` của change `s10-1-word-flashcard`.
- **Kiểm tra nội dung hội thoại**: báo lỗi và không ghi nội dung khi câu trỏ tới hội thoại không có, hội thoại dưới 2 lời, vai khác A/B, lời
  trỏ tới câu không có, câu của lời thiếu pinyin/nghĩa/audio, câu của lời vai A không phải giọng nữ hoặc câu của lời vai B không phải giọng
  nam (S2.x). Cùng một chữ Hán dùng cho cả hai vai thì soạn thành hai câu riêng, mỗi câu một giọng.
- Audio không phát được (ví dụ offline khi chưa tải audio chủ đề): thông báo "Không phát được audio.", vẫn đọc, bật/tắt, đi tiếp được;
  thông báo mất khi lần phát sau của câu hội thoại đó phát được hoặc khi bấm "Tiếp tục" sang câu kế.
- Bàn phím và trình đọc màn hình: Tab theo thứ tự hàng điều khiển → nút "Nghe" của từng lời → "Tiếp tục", Enter/Space, viền focus; focus
  giữ ở nút "Nghe cả bài"/"Dừng" khi nút đổi chữ; công tắc có dấu tick và trạng thái đọc được (như "Nghe chậm"); chữ "Đang phát" không đọc
  tự động.

## Không làm (out of scope)

- Đóng vai: app phát vai A, người học ghi âm vai B, so sánh và đánh giá → **S10.7**. S10.6 không có ghi âm, không chọn vai.
- Soạn nội dung hội thoại HSK 1 cho 15 chủ đề → **S11.1**; audio đầy đủ → **S11.5**. S10.6 chỉ cần pipeline nhận được bài hội thoại và tạo
  audio cho câu của từng lời (đủ cho nội dung mẫu và test).
- Câu hỏi nghe hiểu sau hội thoại, chấm điểm hội thoại.
- Chạm vào từ để xem pinyin/nghĩa → **S10.8**. Tra từ → **S10.9**.
- Hội thoại nhiều hơn hai vai; tên nhân vật thay cho nhãn "Vai A"/"Vai B"; ảnh minh họa; tiêu đề/tình huống của hội thoại.
- Đổi quy tắc chung câu không chấm điểm hoặc luật kiểm tra nội dung chung của S10.1.
- Thêm câu hội thoại vào nội dung phát hành (12 bài Nhập môn không đổi; nội dung HSK 1 là S11.1).
- Lặp lại cả bài tự động, khoảng nghỉ chỉnh được giữa các lời, nhảy tới lời bất kỳ trong khi nghe cả bài (ngoài việc bấm "Nghe" của lời đó).
- Lưu lựa chọn "Pinyin"/"Bản dịch" lâu dài hoặc thêm vào màn Cài đặt; đổi quy tắc công tắc "Hiện pinyin" của Cài đặt (S8.2 giữ nguyên).
- Tạo thẻ ôn tập (S9.1) từ câu hội thoại.

## Dependencies

- **S4.4** (`audio-replay`): nút "Nghe", không tự phát, một luồng âm, thông báo không phát được, công tắc "Nghe chậm" (dấu tick). S10.6 dùng
  lại cùng hành vi cho từng lời và cho "Nghe cả bài".
- **S8.2** (`settings`): tốc độ audio mặc định áp dụng cho hội thoại. Công tắc "Hiện pinyin" của Cài đặt chỉ ẩn pinyin ở câu "nói"; S10.6
  không đổi Requirement đó.
- **S8.4** (`offline-audio`): audio hội thoại thuộc danh sách audio của chủ đề nên tải/xóa cùng chủ đề.
- **S3.2–S3.4** (`lesson-runner`): câu hội thoại là một câu trong bài, đi qua thanh tiến độ, "Tiếp tục", ghi nhớ vị trí, màn tổng kết.
- **S10.1 Flashcard từ mới** (change `s10-1-word-flashcard`, đang viết song song): sở hữu quy tắc chung câu chấm điểm / không chấm điểm và
  luật kiểm tra nội dung chung, viết trong delta `lesson-runner` của S10.1. S10.6 chỉ thêm câu hội thoại vào tập câu không chấm điểm (viết
  trong `dialogue`, như S10.5). **Code S10.6 làm sau code S10.1** (PR code S10.1 mang Scenario `S10.1-AC1` của quy tắc chung). PR spec S10.6
  merge sau hoặc cùng lúc PR spec S10.1. Bảng dạng câu trong `lesson-runner` của S10.1 chỉ ghi thẻ từ mới; sau khi S10.1 archive có thể mở PR spec thêm dòng "câu hội thoại"
  cho khớp.
- **S11.1 Nội dung HSK 1**: bài "Hội thoại" của mỗi chủ đề phải có ít nhất một câu chấm điểm kèm câu hội thoại (ví dụ câu đóng vai S10.7,
  nói theo một lời, nghe chọn chữ S10.2), vì luật S10.1 chặn bài học chỉ gồm câu không chấm điểm.
- **Pipeline nội dung (E2)**: S2.x đã định giọng nữ cho vai thứ nhất, giọng nam cho vai thứ hai trong hội thoại. Audio tạo theo giọng khai
  trên câu; S10.6 thêm luật kiểm tra "câu của lời vai A giọng nữ, vai B giọng nam", không đổi cách pipeline chọn giọng.
- **S10.7 Đóng vai** (change `s10-7-role-play`) dùng cấu trúc nội dung hội thoại S10.6 chốt ở trên (danh sách lời, vai A/B, mỗi lời một
  câu) và nhãn "Vai A"/"Vai B" (S10.7 thêm "(bạn)" sau vai người học). Code S10.7 làm sau code S10.6.
- Không thêm dependency.

## Capabilities

### New Capabilities
- `dialogue`: câu hội thoại trong màn bài: hiện các lời, nghe cả bài hoặc từng lời, bật/tắt pinyin và bản dịch, audio lỗi, bàn phím.

### Modified Capabilities
- Không có. `lesson-runner` không đổi trong change này: quy tắc chung câu không chấm điểm do `s10-1-word-flashcard` mang; S10.6 ghi việc câu
  hội thoại thuộc tập đó trong `dialogue`.

## Dữ liệu nghiệm thu

Nội dung phát hành không có câu hội thoại nào. Bài mẫu có hội thoại 3 lời (và bài có hai câu hội thoại liền nhau, bài kiểm tra/bài chỉ gồm
câu hội thoại cho luật kiểm tra) chỉ có trong bản build dành cho kiểm thử tự động, không xuất hiện trong bản app người học tải về; QA nghiệm
thu S10.6 trên bản build kiểm thử đó (như S10.1).

## Open Questions

- [x] **Hội thoại nằm ở đâu, người học gặp nó thế nào?** → là một câu (dạng bài) trong màn bài, như các dạng bài khác; bài "Hội thoại" của
  chủ đề (S11.1) gồm câu dạng này (ba đề xuất, chờ người thật xác nhận)
- [x] **Mỗi lời hiện gì, vai đặt tên thế nào?** → hai vai, nhãn "Vai A"/"Vai B"; mỗi lời: chữ Hán, pinyin, bản dịch, nút "Nghe" (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Có tự phát khi câu hiện ra không?** → không, như S4.4 (ba đề xuất, chờ người thật xác nhận)
- [x] **"Nghe cả bài" chạy thế nào: dừng, phát lại, đánh dấu lời đang phát, bấm nghe một lời giữa chừng?** → bảng trong Requirement "Nghe cả
  bài hoặc từng câu": phát liền các lời, nút đổi "Dừng", chữ "Đang phát", phát lại từ lời 1, bấm "Nghe" một lời thì dừng chuỗi và chỉ phát
  lời đó; không lặp (ba đề xuất, chờ người thật xác nhận)
- [x] **Lời đang phát ngoài khung nhìn trên điện thoại?** → cuộn tới lời đó; giảm chuyển động thì cuộn ngay không hiệu ứng (ba đề xuất, chờ
  người thật xác nhận)
- [x] **"Nghe chậm" có áp dụng cho hội thoại?** → có, câu hội thoại có công tắc "Nghe chậm" ngay sau "Nghe cả bài", cùng trạng thái với cả
  bài (ba đề xuất, chờ người thật xác nhận)
- [x] **Mặc định pinyin và bản dịch?** → "Pinyin" bật, "Bản dịch" tắt (mục tiêu luyện nghe hiểu: nghe trước, xem dịch khi cần) (ba đề xuất,
  chờ người thật xác nhận)
- [x] **Công tắc pinyin của hội thoại có theo "Hiện pinyin" trong Cài đặt?** → không, độc lập: Requirement S8.2 chỉ ẩn pinyin ở câu "nói",
  nối hai công tắc sẽ phải sửa `settings` (và chồng với các story E10 khác đang viết song song). Đổi hai công tắc của hội thoại không đổi Cài
  đặt (ba đề xuất, chờ người thật xác nhận)
- [x] **Lựa chọn pinyin/bản dịch giữ tới khi nào?** → qua các câu hội thoại còn lại trong cùng lần mở bài; rời màn bài rồi mở lại thì về mặc
  định; không lưu lâu dài (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu hội thoại chấm thế nào, tính điểm ra sao?** → không chấm, "Tiếp tục" có ngay (không bắt nghe hết), là câu không chấm điểm theo
  quy tắc chung S10.1: không tính vào điểm (sửa ở vòng 1, xem dưới) (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio một lời không phát được khi đang nghe cả bài?** → thông báo "Không phát được audio." (đọc tự động), dừng chuỗi, vẫn dùng được
  mọi thứ khác (ba đề xuất, chờ người thật xác nhận)
- [x] **Bàn phím, focus khi nút đổi chữ, trình đọc màn hình?** → Tab + Enter/Space, viền focus, focus giữ ở nút "Nghe cả bài"/"Dừng"; mỗi lời
  đọc vai, chữ Hán, rồi pinyin/bản dịch nếu đang hiện; chữ "Đang phát" không đọc tự động để không chồng lên audio (ba đề xuất, chờ người thật
  xác nhận)

- [x] **(Vòng 1, F1) "Tính là câu đúng" mâu thuẫn S10.1/S10.5 và làm bài kiểm tra dễ đạt 80%?** → bỏ luật đó; câu hội thoại là câu không
  chấm điểm theo quy tắc chung S10.1, không tính vào điểm, "Đúng x / y", "Sai n"; Scenario tổng kết sửa thành "50%", "Đúng 1 / 2 câu"
- [x] **(Vòng 1, F2a) Bài kiểm tra có câu hội thoại?** → lỗi kiểm tra nội dung theo luật chung S10.1; thêm Scenario trong Requirement "Câu
  hội thoại là câu không chấm điểm"
- [x] **(Vòng 1, F2b) Bài "Hội thoại" của S11.1 chỉ gồm câu hội thoại bị luật "bài học phải có câu chấm điểm" chặn?** → giữ nguyên luật
  S10.1; ràng buộc nội dung cho S11.1: bài "Hội thoại" phải có ít nhất một câu chấm điểm kèm câu hội thoại (câu đóng vai S10.7, nói theo một
  lời, nghe chọn chữ); ghi trong Dependencies. Không cần đổi luật S10.1 (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F2c) Luật kiểm tra nội dung hội thoại?** → Requirement mới: câu trỏ hội thoại có thật, ít nhất 2 lời, vai chỉ A/B, lời trỏ
  câu có thật, câu đủ chữ/pinyin/nghĩa/audio; lỗi thì dựng nội dung không ghi ra. Không bắt lời 1 là vai A hay phải có cả hai vai (đó là luật
  riêng của đóng vai S10.7) (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F3) Delta `lesson-runner` ADDED chồng với "Mỗi câu chấm ngay sau khi trả lời"?** → bỏ hẳn delta `lesson-runner` của S10.6;
  S10.1 mang delta chung (MODIFIED giới hạn "chấm ngay" vào câu chấm điểm); S10.6 viết trong `dialogue` như S10.5; ghi phụ thuộc S10.1
- [x] **(Vòng 1, F4) Cấu trúc nội dung dùng chung với S10.7?** → hội thoại là nội dung riêng (danh sách lời, mỗi lời = vai A/B + một câu),
  câu hội thoại và câu đóng vai trỏ tới nó; ghi trong What Changes (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F5) Công tắc "Nghe chậm" có trên câu hội thoại không?** → có, ngay sau "Nghe cả bài", cùng trạng thái với cả bài, như thẻ từ
  mới S10.1; thêm vào bảng thành phần và Scenario (bật trên câu, áp cho "Nghe" từng lời, giữ từ câu trước) (ba đề xuất, chờ người thật xác
  nhận)
- [x] **(Vòng 1, F6) "Đang phát" không đọc tự động chỉ nằm ở Open Questions?** → thêm MUST NOT vào Requirement trình đọc màn hình và Scenario
  "Chữ Đang phát không được đọc tự động"
- [x] **(Vòng 1, F7) Nhãn vai lệch S10.7?** → thống nhất "Vai A"/"Vai B"; S10.7 thêm "(bạn)" sau vai người học (ba đề xuất, chờ người thật
  xác nhận)
- [x] **(Vòng 1, F8) Pinyin: S10.6 công tắc riêng, S10.7 theo Cài đặt, S10.1/S10.5 luôn hiện?** → giữ khác nhau có lý do: AC2 của S10.6 đòi
  bật/tắt pinyin ngay trên câu nên có công tắc riêng; AC của S10.1/S10.5 đòi thẻ hiện pinyin nên luôn hiện; S10.7 không có AC về pinyin nên
  theo Cài đặt như câu "nói" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F9) Rời màn bài khi đang nghe cả bài?** → thêm Scenario: audio dừng, lời sau không phát
- [x] **(Vòng 1, F10) Thông báo audio lỗi mất khi nào; bấm "Nghe" một lời lỗi?** → mất khi lần phát sau của câu đó phát được hoặc khi sang
  câu khác, như S4.4; thêm hai Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F11) Bố cục, thứ tự focus?** → chốt bố cục ba vùng (hàng điều khiển, danh sách lời, "Tiếp tục") và thứ tự Tab "Nghe cả
  bài", "Nghe chậm", "Pinyin", "Bản dịch", "Nghe lời 1…n", "Tiếp tục"; thêm Scenario thứ tự Tab (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, F12) Dữ liệu nghiệm thu?** → bài mẫu chỉ trong bản build kiểm thử tự động, không vào nội dung phát hành; mục "Dữ liệu nghiệm
  thu"

- [x] **(Vòng 2, F1) Giọng đọc theo vai: câu vai B quên khai giọng nam vẫn qua và phát giọng nữ?** → chọn phương án (a): luật kiểm tra nội
  dung "câu của lời vai A phải giọng nữ, câu của lời vai B phải giọng nam", thêm dòng vào bảng và Scenario (sai giọng báo lỗi; một câu được
  trỏ từ cả hai vai báo lỗi; cùng chữ Hán hai câu riêng thì qua). Không đổi pipeline chọn giọng. Sửa dòng Layer thành "tạo audio cho câu
  của từng lời" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 2, F2) "PR code đầu tiên trong hai story làm phần chung"?** → bỏ phương án đó; code S10.6 làm sau code S10.1 (PR S10.1 mang
  Scenario `S10.1-AC1` của quy tắc chung); PR spec S10.6 merge sau hoặc cùng PR spec S10.1
- [x] **(Vòng 2, F3) Thông báo lỗi mất khi sang câu khác viện dẫn S4.4 nhưng `audio-replay` không quy định?** → bỏ viện dẫn S4.4, quy định
  trực tiếp trong `dialogue` và thêm Scenario "Sang câu kế thì thông báo lỗi không còn" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 2, F4) Hội thoại cấp chủ đề trỏ tới câu ở bài nào, audio vào danh sách tải thế nào?** → chi tiết kỹ thuật, để `planner` quyết
  trong design.md (gom audio hiện đi theo từng bài); spec chỉ giữ hành vi người học thấy: audio hội thoại tải/xóa cùng chủ đề (S8.4)

## Impact

- Code mới: component câu hội thoại + style BEM + chuỗi i18n; dạng bài mới trong schema nội dung và registry.
- Code sửa: hook audio (phát lần lượt, dừng), tập câu không chấm điểm (thêm câu hội thoại), state màn bài (hai công tắc), pipeline nội dung
  (đọc và kiểm tra hội thoại, kiểm tra giọng theo vai, tạo audio cho câu của từng lời, đưa vào danh sách audio chủ đề).
- Dữ liệu người dùng: không đổi cấu trúc dữ liệu lưu trên máy, không đổi file sao lưu.
- Dependency: không thêm.
- Tầng test: Vitest cho schema, luật kiểm tra hội thoại và tập câu không chấm điểm; Testing Library cho component và hook (thứ tự phát, dừng, công tắc, focus);
  e2e Playwright trên bản build cho luồng nghe cả bài, bật bản dịch, Tiếp tục, và offline đã tải audio.
