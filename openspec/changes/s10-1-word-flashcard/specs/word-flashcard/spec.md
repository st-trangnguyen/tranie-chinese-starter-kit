## ADDED Requirements

### Requirement: Thẻ hiện chữ Hán, pinyin, nghĩa tiếng Việt, audio, câu ví dụ
Thẻ hiện chữ Hán, pinyin, nghĩa tiếng Việt, audio, câu ví dụ. Khi tới câu thẻ từ mới trong màn học, hệ thống SHALL hiện ngay, cùng lúc,
đủ năm phần (không lật thẻ, không ẩn phần nào):

| Phần | Cách hiện |
|---|---|
| Chữ Hán | Chữ Hán của từ, cỡ lớn nhất trên thẻ |
| Pinyin | Pinyin có dấu thanh của từ |
| Nghĩa tiếng Việt | Mọi nghĩa theo thứ tự, ngăn bằng "; " |
| Audio | Nút "Nghe" và công tắc "Nghe chậm" ngay sau nút |
| Câu ví dụ | Chữ Hán, pinyin, nghĩa của câu, nút "Nghe câu ví dụ" |

#### Scenario: S10.1-AC1 Thẻ hiện đủ năm phần
- **WHEN** người học tới câu thẻ từ mới của từ "你好" (nǐ hǎo, xin chào) có câu ví dụ "你好，老师！" (Nǐ hǎo, lǎoshī!, Chào thầy/cô!)
- **THEN** thẻ hiện chữ "你好", pinyin "nǐ hǎo" và nghĩa "xin chào"
- **AND** thẻ có nút "Nghe" và công tắc "Nghe chậm" ngay sau nút
- **AND** thẻ hiện câu ví dụ "你好，老师！", pinyin "Nǐ hǎo, lǎoshī!", nghĩa "Chào thầy/cô!" và nút "Nghe câu ví dụ"

#### Scenario: S10.1-AC1 Từ có nhiều nghĩa thì hiện mọi nghĩa
- **WHEN** người học tới câu thẻ từ mới của từ "好" có ba nghĩa "tốt", "khỏe", "hay" theo thứ tự đó
- **THEN** thẻ hiện nghĩa "tốt; khỏe; hay"

### Requirement: Pinyin trên thẻ luôn hiện
Hệ thống SHALL hiện pinyin của từ và của câu ví dụ trên thẻ từ mới cả khi "Hiện pinyin" trong Cài đặt đang tắt.

#### Scenario: S10.1-AC1 Tắt Hiện pinyin vẫn thấy pinyin trên thẻ
- **WHEN** người học tắt "Hiện pinyin" trong Cài đặt rồi tới câu thẻ từ mới của từ "你好"
- **THEN** thẻ vẫn hiện pinyin "nǐ hǎo" của từ và pinyin "Nǐ hǎo, lǎoshī!" của câu ví dụ

### Requirement: Audio của thẻ phát khi bấm, không tự phát
Hệ thống SHALL phát audio của thẻ chỉ khi người học bấm nút, MUST NOT tự phát khi thẻ vừa hiện, và MUST NOT phát hai âm cùng lúc.

| Người học bấm | Âm phát |
|---|---|
| "Nghe" | Âm của từ, từ đầu; âm đang phát (nếu có) dừng |
| "Nghe câu ví dụ" | Âm của câu ví dụ, từ đầu; âm đang phát (nếu có) dừng |
| "Tiếp tục" | Âm đang phát dừng |

#### Scenario: S10.1-AC1 Thẻ vừa hiện thì chưa phát
- **WHEN** câu thẻ từ mới vừa hiện ra
- **THEN** chưa có audio nào phát

#### Scenario: S10.1-AC1 Bấm Nghe thì phát âm của từ
- **WHEN** người học bấm "Nghe" trên thẻ của từ "你好"
- **THEN** audio của từ "你好" phát một lần từ đầu

#### Scenario: S10.1-AC1 Bấm Nghe câu ví dụ thì phát âm của câu
- **WHEN** người học bấm "Nghe câu ví dụ" trên thẻ của từ "你好"
- **THEN** audio của câu "你好，老师！" phát một lần từ đầu

#### Scenario: S10.1-AC1 Nghe lại nhiều lần
- **WHEN** người học bấm "Nghe" 3 lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** audio của từ phát đủ 3 lần
- **AND** nút "Nghe" vẫn bấm được

#### Scenario: S10.1-AC1 Bấm nút kia khi đang phát thì không chồng âm
- **WHEN** audio của từ đang phát và người học bấm "Nghe câu ví dụ"
- **THEN** audio của từ dừng và audio của câu ví dụ phát từ đầu, không có hai luồng âm cùng lúc

#### Scenario: S10.1-AC1 Sang câu kế thì dừng audio của thẻ
- **WHEN** audio của câu ví dụ đang phát và người học bấm "Tiếp tục"
- **THEN** audio của câu ví dụ dừng

#### Scenario: S10.1-AC1 Audio không phát được
- **WHEN** người học bấm "Nghe" nhưng audio không phát được
- **THEN** màn hiện thông báo không phát được audio, như ở câu nghe
- **AND** người học vẫn bấm được "Nghe" lại và bấm được "Tiếp tục"

### Requirement: Audio của thẻ từ mới thuộc audio của chủ đề
Audio của từ và audio của câu ví dụ trên mỗi thẻ từ mới SHALL thuộc audio của chủ đề chứa bài đó, kể cả khi từ hoặc câu ví dụ chỉ xuất
hiện trên thẻ: được tính vào dung lượng trên nút "Tải audio (<dung lượng>)" của chủ đề, được tải về khi người học bấm tải, và MUST phát
được khi không có mạng sau khi đã tải.

#### Scenario: S10.1-AC1 Dung lượng tải của chủ đề gồm audio của thẻ
- **WHEN** người học mở màn Lộ trình có một chủ đề HSK chưa tải audio, chủ đề có bài với thẻ từ mới của "你好" (câu ví dụ "你好，老师！"),
  và cả "你好" lẫn "你好，老师！" không xuất hiện ở câu nào khác của chủ đề
- **THEN** dung lượng trên nút "Tải audio (<dung lượng>)" của chủ đề gồm cả dung lượng audio của từ "你好" và của câu "你好，老师！"

#### Scenario: S10.1-AC1 Đã tải chủ đề thì nghe thẻ offline được
- **WHEN** người học đã tải audio của chủ đề có bài với thẻ từ mới của "你好", tắt mạng, mở bài đó, tới thẻ rồi bấm "Nghe" và sau đó bấm
  "Nghe câu ví dụ"
- **THEN** audio của từ "你好" và audio của câu "你好，老师！" đều phát được
- **AND** màn không hiện thông báo không phát được audio

### Requirement: Thẻ có công tắc Nghe chậm của bài
Thẻ SHALL hiện công tắc "Nghe chậm" ngay sau nút "Nghe" của từ, giống câu nghe (S4.4). Đây là cùng công tắc "Nghe chậm" của bài: trạng
thái giữ qua các câu trước và sau thẻ. Tốc độ MUST áp cho cả nút "Nghe" và nút "Nghe câu ví dụ".

#### Scenario: S10.1-AC1 Bật Nghe chậm thì thẻ phát 0.75x
- **WHEN** người học bật "Nghe chậm" trên thẻ rồi bấm "Nghe"
- **THEN** audio của từ phát ở tốc độ 0.75x

#### Scenario: S10.1-AC1 Bật Nghe chậm thì câu ví dụ cũng phát 0.75x
- **WHEN** người học bật "Nghe chậm" trên thẻ rồi bấm "Nghe câu ví dụ"
- **THEN** audio của câu ví dụ phát ở tốc độ 0.75x

#### Scenario: S10.1-AC1 Nghe chậm bật ở câu trước thì thẻ vẫn bật
- **WHEN** người học bật "Nghe chậm" ở câu chọn thanh điệu là câu 1, sang câu 2 là thẻ từ mới rồi bấm "Nghe"
- **THEN** công tắc "Nghe chậm" trên thẻ cho biết đang bật
- **AND** audio của từ phát ở tốc độ 0.75x

### Requirement: Thẻ từ mới là câu không chấm điểm
Thẻ từ mới SHALL là câu không chấm điểm theo yêu cầu "Câu chấm điểm và câu không chấm điểm" của màn học: được đếm trong "Câu k / n",
được ghi nhớ khi thoát giữa bài, và bấm "Tiếp tục" ở thẻ là đã làm xong câu đó. "Tiếp tục ngay" và "không tính vào điểm" được kiểm bằng
Scenario S10.1-AC1 của màn học, không lặp lại ở đây.

#### Scenario: S10.1-AC1 Thẻ được đếm trong thanh tiến độ
- **WHEN** người học mở bài có 3 câu, câu 1 là thẻ từ mới, rồi bấm "Tiếp tục" ở thẻ
- **THEN** ở thẻ thanh tiến độ cho biết "Câu 1 / 3"
- **AND** sau khi bấm "Tiếp tục" màn hiện câu 2 với "Câu 2 / 3"

#### Scenario: S10.1-AC1 Thoát ở thẻ thì mở lại vào đúng thẻ đó
- **WHEN** người học đang ở câu 2 của bài 3 câu, câu 2 là thẻ từ mới, thoát bài rồi mở lại bài
- **THEN** màn hiện thẻ từ mới đó với "Câu 2 / 3"

#### Scenario: S10.1-AC1 Làm hết bài có thẻ thì bài thành Đã xong
- **WHEN** người học làm hết bài học thường gồm 1 thẻ từ mới và 2 câu chọn thanh điệu, không bỏ qua câu nào, rồi về Lộ trình
- **THEN** bài đó có nhãn "Đã xong" trên Lộ trình
- **AND** bài kế tiếp là "Đang mở"

### Requirement: Từ của thẻ từ mới được tạo thẻ ôn tập, câu ví dụ thì không
Khi bài học thường có thẻ từ mới thành "Đã xong" (theo điều kiện tạo thẻ ôn tập của S9.1), hệ thống SHALL coi từ của thẻ là từ đã học và
tạo thẻ ôn tập chiều nghĩa và chiều nghe cho từ đó như từ của câu có một từ. Câu ví dụ trên thẻ MUST NOT tạo thẻ ôn tập, kể cả cho các từ
khác có trong câu ví dụ.

| Phần của thẻ từ mới | Tạo thẻ ôn tập? |
|---|---|
| Từ của thẻ | Có, chiều nghĩa và chiều nghe |
| Câu ví dụ và các từ khác trong câu ví dụ | Không |

#### Scenario: S10.1-AC1 Xong bài có thẻ thì từ của thẻ có thẻ ôn tập
- **WHEN** người học chưa có thẻ ôn tập nào và làm hết bài học thường gồm thẻ từ mới của "你好" (câu ví dụ "你好，老师！") và câu chọn thanh
  điệu của "谢谢", không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có đúng 4 thẻ: "你好" chiều nghĩa, "你好" chiều nghe, "谢谢" chiều nghĩa, "谢谢" chiều nghe
- **AND** không có thẻ nào của "老师"

#### Scenario: S10.1-AC1 Thoát ở thẻ thì chưa tạo thẻ ôn tập
- **WHEN** người học chưa có thẻ ôn tập nào, bấm "Tiếp tục" ở thẻ từ mới của "你好" là câu 1 rồi thoát bài ở câu 2
- **THEN** danh sách thẻ ôn tập không có thẻ mới

### Requirement: Thẻ từ mới dùng được bằng bàn phím, trình đọc màn hình và trên điện thoại
Hệ thống SHALL cho người học thao tác mọi điều khiển của thẻ ("Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục") bằng bàn phím, có viền
focus nhìn thấy. Từ dòng "Câu k / n" (nơi focus đặt khi sang câu mới), phím Tab đi qua các điều khiển của thẻ đúng thứ tự "Nghe", "Nghe
chậm", "Nghe câu ví dụ", "Tiếp tục". Chữ Hán
của từ và của câu ví dụ MUST được trình đọc màn hình đọc theo tiếng Trung. Ở khổ màn rộng 375 px thẻ MUST NOT làm màn cuộn ngang. Thẻ không
có hiệu ứng chuyển động.

#### Scenario: S10.1-AC1 Thứ tự Tab trên thẻ
- **WHEN** người học bấm "Tiếp tục" ở câu trước để tới thẻ từ mới, rồi nhấn Tab nhiều lần
- **THEN** focus đi lần lượt qua "Nghe", "Nghe chậm", "Nghe câu ví dụ", "Tiếp tục"

#### Scenario: S10.1-AC1 Dùng thẻ chỉ bằng bàn phím
- **WHEN** ở thẻ từ mới, người học dùng phím Tab đưa focus lần lượt tới "Nghe", "Nghe chậm", "Nghe câu ví dụ" rồi "Tiếp tục" và nhấn
  Enter (hoặc Space ở công tắc) ở mỗi điều khiển
- **THEN** "Nghe" phát âm của từ, "Nghe chậm" đổi trạng thái công tắc, "Nghe câu ví dụ" phát âm của câu ví dụ, "Tiếp tục" chuyển sang câu kế

#### Scenario: S10.1-AC1 Tên nút cho trình đọc màn hình
- **WHEN** trình đọc màn hình đọc các nút trên thẻ từ mới
- **THEN** tên các điều khiển lần lượt là "Nghe", "Nghe chậm", "Nghe câu ví dụ" và "Tiếp tục"
- **AND** trạng thái bật/tắt của "Nghe chậm" được báo cho trình đọc màn hình

#### Scenario: S10.1-AC1 Chữ Hán được đánh dấu là tiếng Trung
- **WHEN** thẻ từ mới của từ "你好" hiện ra
- **THEN** chữ "你好" và câu ví dụ "你好，老师！" được đánh dấu ngôn ngữ tiếng Trung cho trình đọc màn hình
- **AND** nghĩa tiếng Việt không bị đánh dấu là tiếng Trung

#### Scenario: S10.1-AC1 Khổ 375 px không cuộn ngang
- **WHEN** người học mở thẻ từ mới có câu ví dụ dài 20 chữ Hán trên màn rộng 375 px
- **THEN** màn không cuộn ngang và đọc được đủ câu ví dụ

### Requirement: Kiểm tra nội dung chặn thẻ trỏ sai từ hoặc câu ví dụ
Kiểm tra nội dung SHALL báo lỗi nêu bài và câu, và kết thúc không thành công, khi một thẻ từ mới:

| Trường hợp | Kết quả |
|---|---|
| Trỏ tới từ không có trong nội dung | Lỗi |
| Không có câu ví dụ, hoặc trỏ tới câu không có | Lỗi |
| Câu ví dụ không chứa chữ Hán của từ | Lỗi |
| Từ và câu ví dụ có, câu chứa chữ Hán của từ | Không lỗi |

#### Scenario: S10.1-AC1 Câu ví dụ không chứa từ thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có thẻ từ mới của từ "谢谢" với câu ví dụ "你好，老师！"
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.1-AC1 Thẻ thiếu câu ví dụ thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có thẻ từ mới không có câu ví dụ
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.1-AC1 Thẻ trỏ tới từ hoặc câu không có thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài có thẻ từ mới trỏ tới từ không có trong nội dung, và trên một bài có thẻ trỏ tới câu ví dụ
  không có trong nội dung
- **THEN** kiểm tra kết thúc không thành công và báo lỗi cho từng bài

#### Scenario: S10.1-AC1 Thẻ hợp lệ thì qua
- **WHEN** chạy kiểm tra nội dung trên một bài học gồm thẻ từ mới của "你好" với câu ví dụ "你好，老师！" và một câu chọn thanh
- **THEN** kiểm tra không báo lỗi nào cho bài đó
