# Proposal: S10.7 Đóng vai

Story **S10.7 Đóng vai · F3, F6** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s107-đóng-vai--f3-f6)) ·
GitHub issue [#50](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/50). Bản 0.2, epic E10.

Refs #50

## Why

Là người học, tôi muốn đóng một vai trong hội thoại để luyện nói như giao tiếp thật. S10.6 cho nghe hội thoại; E5 cho luyện nói từng từ
hoặc câu rời. S10.7 ghép hai phần: trong một câu "đóng vai", hội thoại đi lần lượt từng lượt lời, app phát lời vai A, người học nói lời vai B
bằng đúng khối ghi âm, so sánh và tự đánh giá của E5.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "đóng vai" (chỉ nhận props: các lượt lời, vai của từng lượt, audio), dùng lại khối ghi âm, so sánh, chấm tự động, tự đánh giá của E5; đăng ký vào registry | `shared/components/exercises/` |
| Quy tắc hợp lệ riêng của câu đóng vai (lượt 1 vai A, có lượt B), cộng vào luật kiểm tra hội thoại của S10.6, trong kiểm tra nội dung và dựng nội dung | `packages/shared` (schema) + `content/` (pipeline nhận dạng bài mới) |
| Câu đóng vai thuộc tập câu chấm điểm của quy tắc chung S10.1; quy tắc: kết quả câu đóng vai từ mức tự đánh giá của các lượt vai B; lượt nào vào phần giải thích (Phần 2, pure, "Rule: …") | `shared/services/` (service chấm hiện có của màn học) |
| Nạp hội thoại và các câu của nó cho câu đóng vai, đưa vào dạng bài qua props | `pages/lesson/hooks/`, `shared/services/content.service.ts` |
| Schema dạng bài "đóng vai" trong nội dung (trỏ tới hội thoại của S10.6) | `packages/shared` (`@csk/shared`) |
| Phát audio lời vai A, ghi âm lời vai B; một luồng âm, dừng audio/ghi khi đi tiếp | `core/hooks/` (hook audio, ghi âm, online đã có từ E4/E5) |
| i18n, style BEM (vai ghi bằng chữ, không chỉ màu) | `assets/i18n/vi/`, `apps/web/src/styles/tailwind/` |

Không đổi dữ liệu tiến độ lưu trên máy, không đổi file sao lưu, không thêm dependency.

Có thể phải đổi hợp đồng giữa dạng bài và màn học: dạng bài "đóng vai" báo mức của từng lượt B lên màn học, hook màn học gọi service chấm
(component trong `shared/components/exercises/` không gọi service, CLAUDE.md §2). Cách làm cụ thể để `planner` quyết trong `design.md`.

## What Changes

- Dạng bài mới **"đóng vai"**: một câu trong bài, chạy một hội thoại hai vai lần lượt từng lượt lời. Người học luôn là **vai B**.
- **Nội dung**: câu đóng vai trỏ tới một hội thoại theo cấu trúc S10.6 chốt (hội thoại là nội dung riêng của chủ đề, danh sách lời theo thứ
  tự, mỗi lời là vai A hoặc B và một câu có chữ Hán, pinyin, nghĩa, audio). Mỗi lời là một lượt của câu đóng vai. Câu đóng vai và câu hội
  thoại có thể trỏ cùng một hội thoại.
- Màn ghi "Bạn đóng vai B"; mỗi lượt có nhãn vai "Vai A" hoặc "Vai B (bạn)" (nhãn "Vai A"/"Vai B" của S10.6, thêm "(bạn)" sau vai người
  học), "Lượt k / n", chữ Hán, nghĩa, pinyin theo Cài đặt.
- **Lượt vai A**: hiện lời A, nút "Nghe lời A" phát audio của câu đó; app không tự phát khi lượt hiện ra (giống các dạng nghe hiện có).
- **Lượt vai B**: hiện lời B để người học đọc, kèm đúng khối của câu "nói" E5: "Ghi âm"/"Dừng", "Nghe mẫu", "Nghe bản ghi", khu "Chấm
  tự động" (khi có mạng và trình duyệt hỗ trợ), 3 nút tự đánh giá; không có mic thì chuyển "đọc to rồi tự chấm".
- Đi lượt kế bằng nút "Lượt tiếp" (lượt B chỉ hiện nút sau khi đã chọn mức); lượt cuối có nút "Kết thúc hội thoại". Các lượt đã qua vẫn
  hiện phía trên: "Nghe lời A"/"Nghe mẫu" vẫn bấm được (cả sau khi chấm), ghi âm và tự đánh giá đã khóa.
- Một luồng âm: bấm nghe nút khác thì audio cũ dừng; bấm "Lượt tiếp"/"Kết thúc hội thoại" thì audio dừng, đang ghi thì dừng ghi, nhả micro,
  bỏ bản ghi. "Nghe lời A" và "Nghe mẫu" luôn phát 1x như "Nghe mẫu" của E5, không có công tắc "Nghe chậm".
- Kiểm tra nội dung và dựng nội dung báo lỗi câu đóng vai không hợp lệ: mọi luật kiểm tra hội thoại của S10.6 (trỏ tới hội thoại có thật, ít
  nhất 2 lời, vai chỉ A/B, lời trỏ câu có thật, câu đủ chữ/pinyin/nghĩa/audio, **giọng theo vai**: câu của lời vai A giọng nữ, vai B giọng
  nam, một câu không dùng cho cả hai vai) **cộng thêm** hai luật riêng của đóng vai: lượt 1 là vai A, có ít nhất một lượt B. Luật riêng chỉ
  áp cho câu đóng vai, không áp cho câu hội thoại trỏ cùng hội thoại.
- Audio không phát được: thông báo "Không phát được audio." như S10.6, áp cho cả "Nghe lời A" và "Nghe mẫu"; mất khi lần phát kế tiếp phát
  được hoặc khi sang lượt/câu khác.
- Nút "Nghe lời A"/"Nghe mẫu" của mỗi lượt có tên cho trình đọc màn hình kèm số lượt ("Nghe lời A, lượt 3"); chữ hiển thị giữ nguyên.
- **Chấm**: câu đóng vai là **câu chấm điểm** theo quy tắc chung của S10.1 (chưa có "Tiếp tục" khi vừa hiện, được phép trong bài kiểm tra,
  làm bài học thỏa luật "phải có câu chấm điểm"). Cả câu đóng vai tính **một câu** trong điểm bài. Đúng khi mọi lượt B được chọn "Đúng"; còn lại là sai, giải thích liệt kê các lượt
  B chưa "Đúng" (chữ, pinyin, nghĩa).
- Bản ghi chỉ giữ trong lượt đang làm; sang lượt khác hoặc rời bài là mất, không lưu vào máy (như S5.1). Thoát giữa câu đóng vai thì lần sau
  câu đó bắt đầu lại từ lượt 1.

## Không làm (out of scope)

- Chọn vai (đóng vai A) hoặc hội thoại nhiều hơn hai vai: người học luôn là vai B như AC1.
- Công tắc bật/tắt pinyin và bản dịch của S10.6 trên câu đóng vai: pinyin theo "Hiện pinyin" trong Cài đặt như câu "nói", nghĩa luôn hiện.
- Công tắc "Nghe chậm" trên câu đóng vai; tốc độ audio mặc định trong Cài đặt không áp dụng cho câu đóng vai.
- Thêm câu đóng vai vào nội dung phát hành. Bản build phát hành chưa có câu đóng vai cho tới E11. Để nghiệm thu, câu đóng vai mẫu (hội thoại
  ví dụ 4 lượt trong spec, và các biến thể cần cho Scenario) chỉ có trong **bản build kiểm thử** dùng cho e2e, theo cách repo đã làm với bài
  mẫu offline và nội dung nhiều chủ đề; QA nghiệm thu trên bản build kiểm thử đó. Người dùng bản phát hành không thấy câu mẫu này.
- Tạo hay đổi thẻ ôn tập từ câu đóng vai sai: câu đóng vai không gắn với một từ, giống câu "nói" theo câu ở S9.1/S9.4.
- Lưu mức đánh giá từng lượt hoặc nhớ lượt đang làm dở trong câu đóng vai.
- Soạn nội dung hội thoại, đóng vai cho HSK 1 → **E11**. Màn nghe hội thoại → **S10.6**.

## Dependencies

- **S10.6 Hội thoại** (change `s10-6-dialogue`, đang viết song song; **code S10.7 làm sau code S10.6**): cấu trúc nội dung hội thoại (nội dung
  riêng, danh sách lời, mỗi lời = vai A/B + một câu), luật kiểm tra hội thoại, nhãn "Vai A"/"Vai B". Câu đóng vai trỏ tới hội thoại theo cấu
  trúc này; S10.7 chỉ cộng thêm hai luật riêng và hậu tố "(bạn)".
- **S10.1 Flashcard từ mới** (change `s10-1-word-flashcard`, đang viết song song): sở hữu quy tắc chung câu chấm điểm / không chấm điểm và luật
  kiểm tra nội dung chung (delta `lesson-runner`). Câu đóng vai là câu chấm điểm theo quy tắc đó; S10.7 không mang delta `lesson-runner`. Code
  S10.7 làm sau khi quy tắc chung của S10.1 đã có. Bảng dạng câu của S10.1 chưa ghi "đóng vai"; sau khi S10.1 archive có thể mở PR spec thêm
  dòng cho khớp.
- **E5 Luyện nói** (đã archive, capability trong `openspec/specs/`): `speak-record` (S5.1, ghi âm và so sánh), `speak-rating` (S5.2, tự đánh
  giá 3 mức), `speak-auto-check` (S5.3, chấm tự động), `speak-no-mic` (S5.4, không có mic). Câu đóng vai dùng lại các hành vi đó cho từng
  lượt vai B; không đổi spec của chúng.
- **S4.4** (`audio-replay`): nghe lại không giới hạn, không tự phát khi câu hiện.
- **S8.2** (`settings`): "Hiện pinyin". Tốc độ audio mặc định không áp dụng cho câu đóng vai (luôn 1x).
- **S8.4** (`offline-audio`): audio các lượt của câu đóng vai nằm trong danh sách audio tải về của chủ đề chứa nó, nghe được khi không có mạng.
- **Pipeline nội dung** (`content/`, E2): kiểm tra nội dung và dựng nội dung phải nhận dạng bài "đóng vai" và quy tắc hợp lệ của nó.
- **S9.1, S9.4** (capability `review-cards`, `wrong-answer-review`; spec đã merge, chưa có code): câu đóng vai sai không tạo thẻ ôn tập.
  Scenario "Câu đóng vai sai trong bài kiểm tra cuối chủ đề không tạo thẻ ôn tập" chỉ làm được sau khi code S9.1/S9.4 đã vào `main`; nếu
  S10.7 code trước thì Scenario này làm sau, cùng hoặc sau PR code S9.4. Bảng dạng câu của S9.4 chưa có dòng đóng vai; sau này mở PR spec
  thêm dòng "Đóng vai | Có lượt B chưa 'Đúng' | Không có" vào bảng đó cho khớp.
- **S3.2, S3.3, S3.4** (`lesson-runner`): khung chạy bài, vị trí câu đang dở, màn tổng kết.
- **S2.x** (audio): mỗi câu của hội thoại có mp3; giọng nữ cho vai A, giọng nam cho vai B (S10.6 kiểm tra luật này).

## Capabilities

### New Capabilities
- `role-play`: câu "đóng vai" trong bài: app phát lời vai A, người học nói lời vai B bằng khối ghi âm, so sánh, tự đánh giá của E5.

### Modified Capabilities
- (không có)

## Open Questions

- [x] **App phát lời vai A tự động hay khi người học bấm?** → người học bấm "Nghe lời A"; không tự phát khi lượt hiện ra, khớp quy tắc
  "không tự phát audio khi câu vừa hiện" của S4.4 và tránh audio chen vào lúc đang ghi âm (ba đề xuất, chờ người thật xác nhận)
- [x] **Có bắt buộc nghe lời A trước khi sang lượt kế không?** → không; "Lượt tiếp" bấm được ngay, để audio lỗi không làm kẹt bài (ba đề
  xuất, chờ người thật xác nhận)
- [x] **Tự đánh giá một lần cho cả vai hay từng lượt B?** → từng lượt B, dùng nguyên khối của câu "nói" E5 (AC2); câu đóng vai đúng khi mọi
  lượt B "Đúng", ngược lại sai (cùng cách tính của S5.2: "Gần đúng" là sai) (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu đóng vai tính mấy câu trong điểm bài?** → một câu, thanh tiến độ "Câu k / n" không đổi khi đi qua các lượt (ba đề xuất, chờ người
  thật xác nhận)
- [x] **Thoát giữa câu đóng vai thì lần sau thế nào?** → học tiếp đúng câu đó (S3.3) nhưng bắt đầu lại từ lượt 1, không còn bản ghi (S5.1-AC3)
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Lời vai A và vai B hiện những gì?** → chữ Hán, nghĩa tiếng Việt, pinyin theo "Hiện pinyin" trong Cài đặt; vai ghi bằng chữ ("Vai A",
  "Vai B (bạn)") (ba đề xuất, chờ người thật xác nhận)
- [x] **Không có mic thì sao?** → lượt B chuyển "đọc to rồi tự chấm" theo S5.4, giữ cho các lượt B sau trong bài; lượt A vẫn nghe được (ba đề
  xuất, chờ người thật xác nhận)
- [x] **(Vòng 1, qa/dev-lead) Lượt đã qua "không thao tác được" mâu thuẫn S4.4 nghe lại kể cả sau khi chấm?** → đúng, sửa: thêm Requirement
  "Lượt đã qua và câu đã chấm vẫn nghe lại được" với bảng từng nút; "Nghe lời A", "Nghe mẫu" luôn bấm được; "Ghi âm", "Nghe bản ghi" không còn,
  tự đánh giá khóa; thêm Scenario nghe lại lời A khi đang ở lượt B, sau khi chấm vẫn nghe lại; viết lại Scenario "Đã chấm" nêu từng nút (ba đề
  xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Audio khi chuyển lượt và một luồng âm?** → bấm "Lượt tiếp"/"Kết thúc hội thoại" thì audio dừng; bấm nút nghe khác thì audio
  cũ dừng, audio mới phát từ đầu; thêm Requirement "Một luồng âm…" và Scenario; viết lại "Bắt đầu ghi thì lời A đang nghe lại dừng" (lời A của
  lượt 1 bấm nghe lại khi đang ở lượt 2) và thêm "mẫu lời B đang phát dừng" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Bấm "Lượt tiếp"/"Kết thúc hội thoại" khi đang ghi âm?** → dừng ghi, micro không còn được dùng, bỏ bản ghi, như S5.1 rời bài khi
  đang ghi; thêm hai Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Tốc độ phát "Nghe lời A", "Nghe mẫu"?** → luôn 1x bất kể tốc độ mặc định trong Cài đặt, như "Nghe mẫu" của E5 (câu đóng vai là
  bài nói); không có công tắc "Nghe chậm"; thêm Requirement và 3 Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Quy tắc hợp lệ nội dung đóng vai?** → ít nhất 2 lượt, lượt 1 là vai A (khớp AC1 "app phát vai A" mở đầu), có ít nhất một lượt
  B, mỗi lượt đủ chữ/pinyin/nghĩa/audio; kiểm tra nội dung và dựng nội dung báo lỗi; thêm Requirement và Scenario (ba đề xuất, chờ người thật
  xác nhận)
- [x] **(Vòng 1) Dữ liệu nghiệm thu khi bản phát hành chưa có câu đóng vai?** → câu đóng vai mẫu chỉ có trong bản build kiểm thử cho e2e (theo
  tiền lệ bài mẫu offline, nội dung nhiều chủ đề), QA nghiệm thu trên bản build đó; ghi ở "Không làm" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Scenario mở lượt 1 chưa có chữ cụ thể?** → sửa thành dòng chữ "Bạn đóng vai B"
- [x] **(Vòng 1) Scenario chấm dễ nhầm với nút tự đánh giá "Đúng"?** → sửa thành "màn báo kết quả câu là 'Đúng'/'Sai'"
- [x] **(Vòng 1) Nhãn vai khác S10.6?** → thống nhất theo S10.6: "Vai A"/"Vai B", vai người học thêm "(bạn)": "Vai B (bạn)" (sửa ở vòng 1
  bổ sung) (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Thiếu dependency S8.4 và `content/`?** → thêm vào Dependencies và Layer đích; thêm Scenario nghe lời A khi offline đã tải audio
- [x] **(Vòng 1) Có thể phải đổi hợp đồng dạng bài vì exercises không gọi service?** → ghi ở Layer đích, để `planner` quyết
- [x] **(Vòng 1) Câu đóng vai sai trong bài kiểm tra cuối chủ đề có tạo thẻ ôn tập?** → không; thêm Scenario; ghi thứ tự phụ thuộc S9.1/S9.4
  (chưa có code) ở Dependencies (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1 bổ sung, major) Nhãn vai "A"/"B (bạn)" lệch "Vai A"/"Vai B" của S10.6?** → đổi thành "Vai A"/"Vai B (bạn)" ở mọi
  Requirement, Scenario và proposal
- [x] **(Vòng 1 bổ sung, major) Câu đóng vai trỏ tới nội dung nào?** → trỏ tới hội thoại theo cấu trúc S10.6 (nội dung riêng, danh sách lời,
  mỗi lời = vai A/B + một câu); mỗi lời là một lượt. Requirement "Nội dung câu đóng vai phải hợp lệ" viết lại: áp mọi luật kiểm tra hội thoại
  của S10.6, cộng hai luật riêng (lượt 1 vai A, có lượt B); bỏ hai dòng trùng S10.6 ("ít nhất 2 lượt", "đủ chữ/pinyin/nghĩa/audio") khỏi
  bảng; thêm Scenario trỏ hội thoại không có, lượt thiếu nghĩa, và luật riêng không áp cho câu hội thoại (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1 bổ sung, minor) Câu đóng vai thuộc loại câu nào của S10.1; câu chữ lỗi kiểm tra nội dung lệch S10.6?** → câu chấm điểm; thêm
  Requirement "Câu đóng vai là câu chấm điểm" (chưa có "Tiếp tục" khi vừa hiện, được phép trong bài kiểm tra, bài học gồm câu hội thoại + câu
  đóng vai qua kiểm tra, khớp ràng buộc S11.1 trong S10.6); thêm phụ thuộc S10.1; câu chữ lỗi đổi thành "kiểm tra kết thúc không thành công
  và lỗi nêu bài và câu đó", thông báo audio đổi thành "Không phát được audio." như S10.6
- [x] **(Vòng 2, major) Chưa tính luật giọng theo vai của S10.6?** → hội thoại ví dụ ghi thành bảng bốn câu riêng (lượt 1, 3 vai A giọng nữ;
  lượt 2, 4 vai B giọng nam; "你好！" của hai vai là hai câu khác nhau); Scenario nghe ghi "giọng nữ/giọng nam"; Scenario luật riêng dùng hội
  thoại hợp lệ với mọi luật S10.6 kể cả giọng và lỗi nêu đúng luật S10.7 ("lượt 1 phải là vai A", "phải có ít nhất một lượt vai B"); thêm
  luật giọng vào What Changes và bảng quy tắc; thêm Scenario lượt vai B sai giọng báo lỗi
- [x] **(Vòng 2, minor) Lỗi audio mất khi nào, áp cho nút nào?** → thêm Requirement "Audio câu đóng vai không phát được" theo S10.6: áp cho
  "Nghe lời A" và "Nghe mẫu", mất khi lần phát kế tiếp phát được hoặc khi "Lượt tiếp"/"Kết thúc hội thoại"/"Tiếp tục"; thêm Scenario (ba đề
  xuất, chờ người thật xác nhận)
- [x] **(Vòng 2, minor) Nhiều nút cùng tên "Nghe lời A"/"Nghe mẫu"?** → tên cho trình đọc màn hình kèm số lượt ("Nghe lời A, lượt 3"), chữ
  hiển thị giữ nguyên; thêm Scenario (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 2, minor) Tên capability S9.4 sai?** → sửa thành `wrong-answer-review`; ghi việc mở PR spec sau thêm dòng "Đóng vai" vào bảng S9.4
