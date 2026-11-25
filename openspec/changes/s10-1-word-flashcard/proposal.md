# Proposal: S10.1 Flashcard từ mới

Story **S10.1 Flashcard từ mới · F3** ([docs/02-design/epics-stories.md](../../../docs/02-design/epics-stories.md#s101-flashcard-từ-mới--f3)) ·
GitHub issue [#44](https://github.com/st-trangnguyen/tranie-chinese-starter-kit/issues/44). Bản 0.2, epic E10 Bài tập Từ vựng / Ngữ pháp /
Đọc / Hội thoại.

Refs #44

## Why

Là người học, tôi muốn xem thẻ từ mới đầy đủ thông tin để học từ. Bài 0.1 chỉ có dạng bài luyện (nghe, gõ pinyin, nói, viết), chưa có chỗ
giới thiệu một từ mới trước khi luyện. Nội dung HSK 1 (E11) cần dạng này để mở đầu mỗi nhóm từ.

## Layer đích (CLAUDE.md §1)

| Việc | Layer |
|---|---|
| Dạng bài "thẻ từ mới" trong nội dung bài: từ nào, câu ví dụ nào; luật kiểm tra (câu ví dụ có chứa từ, bài không chỉ có thẻ, bài kiểm tra không có thẻ) | `packages/shared` (`@csk/shared`, schema Zod nội dung) + kiểm tra nội dung của pipeline |
| Quy tắc thẻ không chấm điểm, không tính vào điểm và số câu sai của màn tổng kết (Phần 2) | `shared/services/` (service nội dung/bài học hiện có) |
| Giao diện thẻ: chữ Hán, pinyin, nghĩa, nút nghe từ và câu ví dụ | `shared/components/exercises/` (đăng ký dạng mới trong registry theo dạng bài) |
| Phát audio từ và câu ví dụ | `core/hooks/` (hook audio hiện có), không gọi service từ component |
| Đưa thẻ vào luồng câu của màn học (hiện "Tiếp tục" ngay, không chấm) | `pages/lesson/hooks/`, `pages/lesson/components/` |
| Chữ hiện trên thẻ (nhãn nút, thông báo) | `core/services/` (i18n) |
| Audio của từ và câu ví dụ trên thẻ thuộc audio của chủ đề (tải offline, S8.4) | pipeline build nội dung (danh sách audio của chủ đề) |

Không có màn mới, không có route mới: thẻ là một câu trong màn học hiện có.

## What Changes

- **Dạng bài mới "Thẻ từ mới"** trong màn học: một câu của bài hiện một thẻ gồm chữ Hán, pinyin có dấu thanh, nghĩa tiếng Việt (mọi nghĩa của
  từ), nút "Nghe" phát audio của từ, và một câu ví dụ (chữ Hán, pinyin, nghĩa tiếng Việt) có nút "Nghe câu ví dụ".
- Thẻ hiện đủ thông tin ngay khi mở, không lật, không có câu hỏi. Không tự phát audio (cùng luật S4.4).
- **Quy tắc chung "câu chấm điểm / câu không chấm điểm" của màn học** (S10.1 sở hữu, S10.5 thẻ ngữ pháp và S10.6 hội thoại chỉ thêm
  dạng câu vào tập "không chấm điểm"): câu không chấm điểm có "Tiếp tục" ngay, không bao giờ "Đúng"/"Sai"; vẫn đếm trong "Câu k / n",
  vẫn ghi nhớ vị trí học dở, bấm "Tiếp tục" là đã làm xong câu (không phải bỏ qua, bài vẫn "Đã xong"); không tính vào điểm, "Đúng x / y
  câu", "Sai n câu". Lần làm không có câu chấm điểm nào được trả lời thì màn tổng kết không hiện điểm.
- Thẻ từ mới là câu không chấm điểm. Tập dạng câu không chấm điểm là tập mở theo khai báo; mọi dạng câu khác (kể cả dạng chấm điểm mới
  của E10) là câu chấm điểm mà không cần sửa lại quy tắc của màn học.
- Không lưu được kết quả thì màn tổng kết vẫn theo luật "không có câu chấm điểm nào thì không hiện điểm" (ngoại lệ của yêu cầu lưu lỗi).
- **Audio của thẻ thuộc audio của chủ đề** (S8.4): audio từ và audio câu ví dụ được tính vào dung lượng tải, tải cùng chủ đề, phát offline
  sau khi tải.
- Pinyin trên thẻ **luôn hiện**, kể cả khi "Hiện pinyin" trong Cài đặt đang tắt (Cài đặt chỉ ẩn pinyin ở câu "nói", S8.2).
- Thẻ có công tắc "Nghe chậm" ngay sau nút "Nghe" (như câu nghe, S4.4), cùng trạng thái với công tắc của cả bài, áp cho cả "Nghe" và
  "Nghe câu ví dụ".
- Học xong bài có thẻ: từ của thẻ có thẻ ôn tập chiều nghĩa và chiều nghe (S9.1); câu ví dụ không tạo thẻ.
- **Kiểm tra nội dung** từ chối: thẻ trỏ tới từ hoặc câu ví dụ không có; câu ví dụ không chứa chữ Hán của từ; bài kiểm tra có câu không
  chấm điểm; bài học không có câu chấm điểm nào (hai luật sau là luật chung, S10.1 sở hữu).

## Capabilities

### New Capabilities

- `word-flashcard`: thẻ từ mới trong màn học (nội dung thẻ, audio, không chấm điểm, luật kiểm tra nội dung).

### Modified Capabilities

- `lesson-runner`: thêm quy tắc chung "Câu chấm điểm và câu không chấm điểm" và luật kiểm tra nội dung cho câu không chấm điểm; giới hạn
  "Mỗi câu chấm ngay sau khi trả lời" (và Scenario S3.2-AC2 "Chưa trả lời thì chưa có kết quả") vào câu chấm điểm; màn tổng kết chỉ tính
  câu chấm điểm; yêu cầu "Không lưu được kết quả thì báo trên màn tổng kết" thêm ngoại lệ lần làm không có câu chấm điểm. Tiền lệ: yêu cầu "Câu viết chữ chỉ có kết quả Đúng".
- `offline-audio` (S8.4) không đổi văn bản: luật "audio của chủ đề" vẫn vậy; việc audio của thẻ thuộc audio của chủ đề viết trong
  `word-flashcard` (cùng cách S10.5 làm với thẻ ngữ pháp).
- `settings` (Hiện pinyin) không đổi văn bản: luật S8.2 vốn chỉ áp cho câu "nói"; việc thẻ luôn hiện pinyin viết trong `word-flashcard`.

## Không làm (out of scope)

- Lật thẻ, ẩn nghĩa để tự đoán, tự chấm "nhớ/quên" trên thẻ → ôn tập SRS (E9).
- Nghe chọn chữ / nhìn chữ chọn nghĩa → **S10.2**. Tra từ → **S10.9**. Thẻ ngữ pháp → **S10.5**.
- Nhiều câu ví dụ trên một thẻ, hình minh họa, thứ tự nét, nút ghi âm trên thẻ.
- Soạn thẻ từ mới cho nội dung HSK 1 → **E11**. Không thêm thẻ vào 12 bài Nhập môn.
- Đổi giao diện công tắc "Nghe chậm" hay thông báo lỗi audio đã có.
- Đánh dấu nghĩa chưa được review trên thẻ.

## Dependencies

- **S9.1** (thẻ ôn tập): trạng thái **spec đã merge, code chưa có**, change `s9-1-review-cards` chưa archive. Bảng "Từ nào của bài được
  tạo thẻ" của S9.1 chưa có dòng thẻ từ mới; S10.1 viết luật "từ của thẻ có thẻ ôn tập, câu ví dụ thì không" trong `word-flashcard`. Thứ
  tự: Scenario tạo thẻ ôn tập của S10.1 chỉ kiểm được sau khi code S9.1 xong; sau khi S9.1 archive, cần một PR spec thêm dòng "Thẻ từ
  mới → Từ của thẻ" vào bảng đó cho khớp.
- **S8.4** (đã có): tải audio theo chủ đề. Danh sách audio của chủ đề hiện chỉ gồm audio của các dạng bài đã có, nên S10.1 phải thêm
  audio của từ và câu ví dụ trên thẻ từ mới vào danh sách đó (như S10.5 với thẻ ngữ pháp).
- **S10.5, S10.6**: dùng quy tắc chung câu không chấm điểm của S10.1 (thêm dạng câu vào tập, không định nghĩa lại cách tính điểm).
- **S10.2–S10.9**: cùng thêm dạng bài vào màn học; không phụ thuộc thứ tự làm. Dạng chấm điểm mới (S10.2, S10.3, S10.4, S10.7, S10.8)
  tự thuộc "câu chấm điểm", không cần sửa `lesson-runner`.

## Dữ liệu nghiệm thu

Nội dung phát hành không có bài nào chứa thẻ từ mới (12 bài Nhập môn không đổi, E11 mới soạn). Bài mẫu có thẻ từ mới chỉ có trong bản
build dành cho kiểm thử tự động, không xuất hiện trong bản app người học tải về; QA nghiệm thu S10.1 trên bản build kiểm thử đó.

## Open Questions

- [x] **Thẻ nằm ở đâu, tự hiện hay mở bằng nút?** → là một câu trong màn học, người soạn đặt vào danh sách câu của bài; hiện khi tới lượt như
  mọi câu (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ có lật (mặt trước chữ, mặt sau nghĩa) không?** → không: hiện đủ năm thông tin ngay, đơn giản nhất và đúng văn bản AC "thẻ hiện…"
  (ba đề xuất, chờ người thật xác nhận)
- [x] **Thẻ có chấm điểm và tính vào tổng kết không?** → không chấm; "Tiếp tục" có ngay; vẫn đếm trong "Câu k / n", không tính vào điểm,
  "Đúng x / y câu", "Sai n câu" (ba đề xuất, chờ người thật xác nhận)
- [x] **Bài chỉ có thẻ, hoặc bài kiểm tra có thẻ thì điểm tính sao?** → kiểm tra nội dung từ chối cả hai trường hợp, nên màn tổng kết không
  bao giờ gặp bài không có câu chấm điểm (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio có tự phát khi thẻ hiện?** → không, theo luật S4.4; có hai nút "Nghe" (từ) và "Nghe câu ví dụ"; bấm nút này khi nút kia đang
  phát thì âm trước dừng; dùng công tắc "Nghe chậm" của bài (ba đề xuất, chờ người thật xác nhận)
- [x] **Tắt "Hiện pinyin" thì thẻ có ẩn pinyin?** → không: AC bắt buộc thẻ hiện pinyin; luật S8.2 chỉ áp cho câu "nói" (ba đề xuất, chờ người
  thật xác nhận)
- [x] **Từ có nhiều nghĩa?** → hiện mọi nghĩa theo thứ tự trong nội dung, ngăn bằng "; " (ba đề xuất, chờ người thật xác nhận)
- [x] **Câu ví dụ lấy ở đâu, thiếu thì sao?** → người soạn chọn đúng một câu cho mỗi thẻ; thiếu câu ví dụ hoặc câu không chứa từ thì kiểm tra
  nội dung báo lỗi, app không phải xử lý thẻ thiếu câu (ba đề xuất, chờ người thật xác nhận)
- [x] **Audio không phát được?** → hiện thông báo không phát được audio như câu nghe (S4.4), "Tiếp tục" vẫn bấm được (ba đề xuất, chờ người
  thật xác nhận)
- [x] **A11y, mobile, giảm chuyển động?** → nút có tên rõ ("Nghe", "Nghe câu ví dụ"), thao tác được bằng bàn phím; trình đọc màn hình đọc chữ
  Hán và câu ví dụ theo tiếng Trung; khổ 375 px không cuộn ngang; thẻ không có hiệu ứng chuyển động (không lật) nên không cần xử lý giảm
  chuyển động (ba đề xuất, chờ người thật xác nhận)

- [x] **(Vòng 1, qa/dev-lead) Spec lesson-runner bắt mọi câu chấm ngay, "Chưa trả lời thì chưa có Tiếp tục", mâu thuẫn với thẻ có "Tiếp
  tục" ngay?** → thêm delta `lesson-runner`: MODIFIED giới hạn yêu cầu chấm ngay và Scenario S3.2-AC2 vào câu chấm điểm, ADDED yêu cầu
  "Câu chấm điểm và câu không chấm điểm"; sửa mục Modified Capabilities
- [x] **(Vòng 1) Mô hình câu không chấm điểm của E10 không thống nhất (S10.6 tính hội thoại là câu đúng, S10.1/S10.5 loại khỏi điểm)?** →
  chốt một mô hình: câu không chấm điểm **không tính** vào điểm, "Đúng x / y", "Sai n" (khớp S10.1 và S10.5; tính là "đúng" sẽ thổi phồng
  điểm bằng câu người học không làm gì). Tập dạng câu không chấm điểm định nghĩa theo dạng người học thấy, S10.1 có thẻ từ mới; S10.5 thêm
  thẻ ngữ pháp, S10.6 thêm câu hội thoại và bỏ luật "tính là câu đúng". Luật kiểm tra nội dung "bài kiểm tra không có câu không chấm điểm",
  "bài học phải có ít nhất một câu chấm điểm" do S10.1 sở hữu trong `lesson-runner`. Câu viết chữ vẫn là câu chấm điểm (chỉ có kết quả
  Đúng), không đổi (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Mở lại bài đang dở mà các câu còn lại đều không chấm điểm thì điểm tính sao (0 / 0)?** → màn tổng kết không hiện điểm và
  "Đúng x / y câu", vẫn hiện thời gian và "Sai 0 câu"; bài vẫn "Đã xong" (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Từ của thẻ từ mới có tạo thẻ ôn tập S9.1 không, câu ví dụ thì sao?** → từ của thẻ có thẻ chiều nghĩa và chiều nghe như câu
  có một từ; câu ví dụ và từ khác trong câu ví dụ không tạo thẻ; viết thành Requirement trong `word-flashcard`; S9.1 spec đã merge, code
  chưa có, bảng của S9.1 cần thêm dòng sau khi S9.1 archive (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 1) Thẻ có công tắc "Nghe chậm" không, vị trí Tab?** → có, ngay sau nút "Nghe" như câu nghe; cùng trạng thái với công tắc của
  bài; áp cho cả "Nghe" và "Nghe câu ví dụ"; thứ tự Tab từ dòng "Câu k / n": "Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục" (ba đề xuất,
  chờ người thật xác nhận)
- [x] **(Vòng 1) Scenario Nghe chậm chỉ kiểm nút "Nghe"?** → thêm Scenario "Nghe câu ví dụ" phát 0.75x và Scenario trạng thái bật giữ từ
  câu trước sang thẻ
- [x] **(Vòng 1) Làm hết bài có thẻ thì bài có "Đã xong" không (cơ chế bỏ qua làm bài chưa xong)?** → có; bấm "Tiếp tục" ở thẻ là làm xong
  câu, không phải bỏ qua; thêm Scenario "Đã xong" trên Lộ trình và Scenario không báo câu bị bỏ qua
- [x] **(Vòng 1) Bài mẫu có thẻ để nghiệm thu lấy ở đâu khi không thêm thẻ vào 12 bài Nhập môn?** → chỉ có trong bản build kiểm thử, không
  vào nội dung phát hành; QA nghiệm thu trên bản build đó (mục "Dữ liệu nghiệm thu")
- [x] **(Vòng 2, qa/dev-lead) Bảng câu chấm điểm là danh sách đóng 5 dạng, dạng chấm điểm mới của E10 không thuộc loại nào; dòng câu
  không chấm điểm cũng cũ đi khi S10.5/S10.6 thêm dạng?** → sửa: tập không chấm điểm mở theo khai báo ("thẻ từ mới và các dạng câu mà một
  yêu cầu khác của màn học khai báo là câu không chấm điểm"); câu chấm điểm là "mọi dạng câu còn lại", 5 dạng hiện có chỉ là ví dụ
- [x] **(Vòng 2) Audio của từ và câu ví dụ trên thẻ có thuộc audio của chủ đề để tải offline (S8.4) không?** → có: tính vào dung lượng
  "Tải audio (<dung lượng>)", tải cùng chủ đề, phát offline sau khi tải, kể cả từ/câu chỉ xuất hiện trên thẻ; thêm Requirement + 2
  Scenario trong `word-flashcard`, thêm S8.4 vào Dependencies và Impact (ba đề xuất, chờ người thật xác nhận)
- [x] **(Vòng 2) Yêu cầu "Không lưu được kết quả" đòi hiện đầy đủ điểm, xung đột với luật không hiện điểm khi không có câu chấm điểm?** →
  đưa yêu cầu đó vào MODIFIED với ngoại lệ: luật không hiện điểm được ưu tiên; thêm Scenario lưu lỗi khi lần làm chỉ có thẻ (ba đề xuất,
  chờ người thật xác nhận)
- [x] **(Vòng 2) Scenario "Tiếp tục ngay" và "không tính vào điểm" trùng giữa `lesson-runner` và `word-flashcard`?** → bỏ bản ở
  `word-flashcard`, giữ câu tham chiếu tới Scenario của màn học trong yêu cầu "Thẻ từ mới là câu không chấm điểm"

## Impact

- Code mới: dạng bài thẻ từ mới (schema, component trong registry bài tập, chữ i18n, style BEM), luật kiểm tra nội dung.
- Code sửa: luồng câu của màn học (câu không chấm điểm), tính điểm tổng kết bỏ qua thẻ (cả khi lưu lỗi), danh sách audio của chủ đề
  thêm audio từ và câu ví dụ của thẻ (S8.4: dung lượng tải của chủ đề có thẻ tăng).
- Dữ liệu người dùng: không đổi dữ liệu lưu trên máy, không đổi file sao lưu.
- Dependency: không thêm.
