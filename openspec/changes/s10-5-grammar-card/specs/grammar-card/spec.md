## ADDED Requirements

### Requirement: Thẻ có giải thích tiếng Việt, cấu trúc câu và ví dụ có audio
Thẻ có giải thích tiếng Việt, cấu trúc câu và ví dụ có audio. Khi một câu của bài là thẻ ngữ pháp, màn bài SHALL hiện đủ các phần sau:

| Phần | Nhãn | Nội dung |
|---|---|---|
| Tiêu đề | (không nhãn) | Tên điểm ngữ pháp |
| Giải thích | "Giải thích" | Giải thích tiếng Việt |
| Cấu trúc | "Cấu trúc" | Cấu trúc câu |
| Ví dụ | "Ví dụ" | Theo thứ tự soạn; mỗi ví dụ có chữ Hán, pinyin, nghĩa tiếng Việt, một nút nghe |

#### Scenario: S10.5-AC1 Thẻ hiện giải thích, cấu trúc và ví dụ
- **WHEN** người học mở một bài có câu 1 là thẻ ngữ pháp "Câu tính từ với 很" (giải thích "Trong câu miêu tả bằng tính từ, thường đặt 很
  trước tính từ.", cấu trúc "Chủ ngữ + 很 + Tính từ", ví dụ "我很好。" rồi "她很忙。")
- **THEN** màn hiện tiêu đề "Câu tính từ với 很"
- **AND** dưới nhãn "Giải thích" có "Trong câu miêu tả bằng tính từ, thường đặt 很 trước tính từ."
- **AND** dưới nhãn "Cấu trúc" có "Chủ ngữ + 很 + Tính từ"
- **AND** dưới nhãn "Ví dụ" có hai ví dụ theo thứ tự: "我很好。", "Wǒ hěn hǎo.", "Tôi khỏe." rồi "她很忙。", "Tā hěn máng.", "Cô ấy bận."
- **AND** mỗi ví dụ có một nút nghe

#### Scenario: S10.5-AC1 Nút nghe có tên đọc được theo từng ví dụ
- **WHEN** trình đọc màn hình đọc thẻ ngữ pháp có hai ví dụ
- **THEN** hai nút nghe có tên lần lượt "Nghe ví dụ 1" và "Nghe ví dụ 2"

#### Scenario: S10.5-AC1 Thẻ đọc được trên màn hình 375px
- **WHEN** người học mở thẻ ngữ pháp "Câu tính từ với 很" trên màn hình rộng 375px
- **THEN** giải thích, cấu trúc và mọi ví dụ hiện đủ, xuống dòng trong khung
- **AND** trang không có thanh cuộn ngang

### Requirement: Pinyin của ví dụ luôn hiện
Pinyin của ví dụ trên thẻ ngữ pháp MUST luôn hiện, kể cả khi cài đặt "Hiện pinyin" đang tắt (cài đặt đó chỉ ẩn pinyin ở câu nói).

#### Scenario: S10.5-AC1 Tắt "Hiện pinyin" thì ví dụ vẫn có pinyin
- **WHEN** người học tắt "Hiện pinyin" trong Cài đặt rồi mở bài có thẻ ngữ pháp với ví dụ "我很好。"
- **THEN** ví dụ "我很好。" vẫn hiện "Wǒ hěn hǎo."

### Requirement: Nghe audio của ví dụ
Mỗi ví dụ SHALL có nút nghe phát audio của câu ví dụ đó, nghe lại bao nhiêu lần tùy ý. Audio MUST NOT tự phát khi thẻ hiện. Mỗi lúc chỉ
một luồng âm: bấm nút nghe khi đang có ví dụ phát thì ví dụ đó dừng và ví dụ vừa bấm phát từ đầu; bấm "Tiếp tục" thì audio dừng.

#### Scenario: S10.5-AC1 Thẻ vừa hiện thì chưa phát audio
- **WHEN** thẻ ngữ pháp vừa hiện ra
- **THEN** chưa có audio nào phát

#### Scenario: S10.5-AC1 Bấm nghe thì phát audio của đúng ví dụ
- **WHEN** người học bấm "Nghe ví dụ 2" ở thẻ có ví dụ "我很好。" rồi "她很忙。"
- **THEN** audio của câu "她很忙。" phát một lần từ đầu

#### Scenario: S10.5-AC1 Nghe lại nhiều lần
- **WHEN** người học bấm "Nghe ví dụ 1" 5 lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** audio của ví dụ 1 phát đủ 5 lần
- **AND** nút "Nghe ví dụ 1" vẫn bấm được

#### Scenario: S10.5-AC1 Bấm lại khi đang phát thì phát lại từ đầu
- **WHEN** audio của ví dụ 1 đang phát và người học bấm "Nghe ví dụ 1"
- **THEN** audio của ví dụ 1 phát lại từ đầu, không có hai luồng âm cùng lúc

#### Scenario: S10.5-AC1 Bấm ví dụ khác thì ví dụ đang phát dừng
- **WHEN** audio của ví dụ 1 đang phát và người học bấm "Nghe ví dụ 2"
- **THEN** audio của ví dụ 1 dừng và audio của ví dụ 2 phát từ đầu
- **AND** không có hai luồng âm cùng lúc

#### Scenario: S10.5-AC1 Sang câu kế thì dừng audio ví dụ
- **WHEN** audio của một ví dụ đang phát và người học bấm "Tiếp tục"
- **THEN** audio của ví dụ đó dừng

### Requirement: Audio ví dụ theo tốc độ Nghe chậm của bài
Audio ví dụ SHALL phát theo trạng thái công tắc "Nghe chậm" đang dùng trong bài (giữ qua các câu; khi vào bài theo tốc độ mặc định trong
Cài đặt). Thẻ ngữ pháp MUST NOT có công tắc "Nghe chậm" riêng.

#### Scenario: S10.5-AC1 Ví dụ phát chậm khi đã bật Nghe chậm ở câu trước
- **WHEN** người học bật "Nghe chậm" ở câu 1 (câu nghe), sang câu 2 là thẻ ngữ pháp rồi bấm "Nghe ví dụ 1"
- **THEN** audio của ví dụ 1 phát ở tốc độ 0.75x

#### Scenario: S10.5-AC1 Mở bài với tốc độ mặc định Chậm
- **WHEN** tốc độ mặc định trong Cài đặt là "Chậm (0.75x)", người học mở bài có câu 1 là thẻ ngữ pháp và bấm "Nghe ví dụ 1"
- **THEN** audio của ví dụ 1 phát ở tốc độ 0.75x

#### Scenario: S10.5-AC1 Mở bài với tốc độ mặc định Bình thường
- **WHEN** tốc độ mặc định trong Cài đặt là "Bình thường (1x)", người học mở bài có câu 1 là thẻ ngữ pháp và bấm "Nghe ví dụ 1"
- **THEN** audio của ví dụ 1 phát ở tốc độ 1x
- **AND** thẻ không có công tắc "Nghe chậm"

### Requirement: Audio ví dụ không phát được
Khi audio của một ví dụ không phát được, màn SHALL hiện thông báo "Không phát được audio." như ở câu nghe, và người học MUST vẫn bấm
nghe lại và bấm "Tiếp tục" được.

#### Scenario: S10.5-AC1 Audio ví dụ không phát được
- **WHEN** người học bấm "Nghe ví dụ 1" nhưng audio không phát được
- **THEN** màn hiện thông báo "Không phát được audio." như ở câu nghe
- **AND** nút "Nghe ví dụ 1" vẫn bấm lại được và nút "Tiếp tục" vẫn bấm được

### Requirement: Audio ví dụ thuộc audio của chủ đề
Audio của mọi câu ví dụ trên thẻ ngữ pháp SHALL thuộc audio của chủ đề chứa bài đó: được tính vào dung lượng trên nút "Tải audio
(<dung lượng>)", được tải về khi người học bấm tải, và MUST phát được khi không có mạng sau khi đã tải.

#### Scenario: S10.5-AC1 Dung lượng tải của chủ đề gồm audio ví dụ
- **WHEN** người học mở màn Lộ trình có một chủ đề HSK chưa tải audio, chủ đề có bài với thẻ ngữ pháp có ví dụ "我很好。" rồi "她很忙。"
- **THEN** dung lượng trên nút "Tải audio (<dung lượng>)" của chủ đề gồm cả dung lượng audio của hai câu ví dụ

#### Scenario: S10.5-AC1 Đã tải chủ đề thì nghe ví dụ offline được
- **WHEN** người học đã tải audio của chủ đề có bài với thẻ ngữ pháp, tắt mạng, mở bài đó và bấm "Nghe ví dụ 2" ở thẻ ngữ pháp
- **THEN** audio của câu "她很忙。" phát được, không hiện thông báo "Không phát được audio."

### Requirement: Dùng thẻ ngữ pháp bằng bàn phím
Mọi nút của thẻ ngữ pháp SHALL thao tác được bằng phím Tab và Enter, mỗi nút có viền focus nhìn thấy.

#### Scenario: S10.5-AC1 Dùng bàn phím đi qua thẻ
- **WHEN** người học chỉ dùng phím Tab và Enter trên thẻ ngữ pháp có hai ví dụ
- **THEN** người học lần lượt tới được "Nghe ví dụ 1", "Nghe ví dụ 2" và "Tiếp tục", mỗi nút có viền focus nhìn thấy
- **AND** nhấn Enter ở "Tiếp tục" thì sang câu kế

### Requirement: Kiểm tra nội dung chặn thẻ ngữ pháp thiếu dữ liệu
Kiểm tra nội dung SHALL kết thúc không thành công và báo lỗi nêu bài và câu bị lỗi khi một thẻ ngữ pháp không đủ dữ liệu để hiện:

| Trường hợp | Kết quả |
|---|---|
| Thẻ trỏ tới điểm ngữ pháp không có | Lỗi |
| Điểm ngữ pháp thiếu tiêu đề, giải thích hoặc cấu trúc | Lỗi |
| Điểm ngữ pháp không có ví dụ | Lỗi |
| Ví dụ trỏ tới câu không có | Lỗi |
| Đủ các phần, có ít nhất một ví dụ | Không lỗi |

#### Scenario: S10.5-AC1 Nội dung đủ thì kiểm tra chạy qua
- **WHEN** chạy kiểm tra nội dung trên nội dung có một bài với thẻ ngữ pháp "Câu tính từ với 很" đủ tiêu đề, giải thích, cấu trúc và hai ví dụ
- **THEN** kiểm tra kết thúc thành công và không báo lỗi nào về thẻ ngữ pháp

#### Scenario: S10.5-AC1 Điểm ngữ pháp không có ví dụ thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp mà điểm ngữ pháp không có ví dụ nào
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó

#### Scenario: S10.5-AC1 Điểm ngữ pháp thiếu tiêu đề thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp mà điểm ngữ pháp để trống tiêu đề
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó

#### Scenario: S10.5-AC1 Điểm ngữ pháp thiếu giải thích thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp mà điểm ngữ pháp để trống giải thích tiếng Việt
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó

#### Scenario: S10.5-AC1 Điểm ngữ pháp thiếu cấu trúc thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp mà điểm ngữ pháp để trống cấu trúc câu
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó

#### Scenario: S10.5-AC1 Thẻ trỏ tới điểm ngữ pháp không có thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp trỏ tới một điểm ngữ pháp không tồn tại
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó

#### Scenario: S10.5-AC1 Ví dụ trỏ tới câu không có thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên nội dung có thẻ ngữ pháp mà một ví dụ của điểm ngữ pháp trỏ tới câu không có trong danh sách câu
- **THEN** kiểm tra kết thúc không thành công
- **AND** lỗi nêu bài và câu của thẻ ngữ pháp đó
