## ADDED Requirements

### Requirement: Câu hội thoại hiện đủ các lời theo thứ tự
Hệ thống SHALL hiện câu hội thoại thành ba vùng từ trên xuống, mọi lời đúng thứ tự trong hội thoại:

| Vùng | Hiện ra |
|---|---|
| Điều khiển | "Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch" |
| Các lời | Nhãn "Vai A"/"Vai B", chữ Hán, pinyin và bản dịch (theo công tắc), nút "Nghe" (tên đọc "Nghe lời <n>") |
| Cuối | "Tiếp tục" |

#### Scenario: S10.6-AC1 Câu hội thoại hiện các lời theo thứ tự
- **GIVEN** "hội thoại 3 lời" dùng trong mọi Scenario của spec này: lời 1 vai A "你好！" (nǐ hǎo!, "Xin chào!"); lời 2 vai B
  "你好！你叫什么名字？" (nǐ hǎo! nǐ jiào shénme míngzi?, "Chào bạn! Bạn tên là gì?"); lời 3 vai A "我叫王明。" (wǒ jiào Wáng Míng.,
  "Tôi tên là Vương Minh.")
- **WHEN** người học mở một bài và tới câu có hội thoại 3 lời
- **THEN** màn hiện 3 lời theo thứ tự 1, 2, 3, lời 1 và lời 3 có nhãn "Vai A", lời 2 có nhãn "Vai B"
- **AND** mỗi lời có chữ Hán và một nút "Nghe" riêng
- **AND** phía trên các lời có nút "Nghe cả bài" và ba công tắc "Nghe chậm", "Pinyin", "Bản dịch"

### Requirement: Câu hội thoại không tự phát
Khi câu hội thoại vừa hiện, hệ thống MUST NOT tự phát audio (như câu nghe, S4.4).

#### Scenario: S10.6-AC1 Câu hội thoại vừa hiện thì chưa phát
- **WHEN** câu có hội thoại 3 lời vừa hiện ra
- **THEN** chưa có audio nào phát

### Requirement: Nghe cả bài hoặc từng câu
AC1 "Nghe cả bài hoặc từng câu." Hệ thống SHALL cho nghe không giới hạn số lần, luôn chỉ một luồng âm:

| Bấm | Phát | Nút, nhãn |
|---|---|---|
| "Nghe cả bài" | Lời 1 tới lời cuối, liền nhau, hết thì dừng | Nút thành "Dừng"; lời đang phát có chữ "Đang phát" |
| "Dừng" | Dừng ngay | Nút về "Nghe cả bài" |
| "Nghe cả bài" lần nữa | Lại từ lời 1 | Như trên |
| "Nghe" của một lời | Chỉ lời đó, từ đầu; dừng phần đang phát | Lời đó "Đang phát"; nút về "Nghe cả bài" |

#### Scenario: S10.6-AC1 Nghe cả bài phát lần lượt mọi lời
- **WHEN** ở câu có hội thoại 3 lời, người học bấm "Nghe cả bài" và chờ
- **THEN** audio của lời 1, lời 2, lời 3 phát lần lượt, mỗi lời một lần
- **AND** trong lúc lời 2 phát, chỉ lời 2 có chữ "Đang phát"
- **AND** sau khi lời 3 phát xong, không còn audio nào phát, không lời nào có chữ "Đang phát" và nút hiện lại "Nghe cả bài"

#### Scenario: S10.6-AC1 Dừng khi đang nghe cả bài
- **WHEN** đang nghe cả bài ở lời 2, người học bấm "Dừng"
- **THEN** audio dừng ngay và lời 3 không phát
- **AND** nút hiện lại "Nghe cả bài"

#### Scenario: S10.6-AC1 Nghe cả bài lần nữa thì phát lại từ đầu
- **WHEN** người học đã dừng ở lời 2 rồi bấm "Nghe cả bài"
- **THEN** audio phát lại từ lời 1

#### Scenario: S10.6-AC1 Nghe từng câu
- **WHEN** ở câu có hội thoại 3 lời, người học bấm "Nghe" của lời 2
- **THEN** chỉ audio của lời 2 phát, một lần từ đầu
- **AND** lời 3 không tự phát sau đó

#### Scenario: S10.6-AC1 Nghe một câu nhiều lần
- **WHEN** người học bấm "Nghe" của lời 3 năm lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** audio của lời 3 phát đủ năm lần

#### Scenario: S10.6-AC1 Bấm nghe một câu khi đang nghe cả bài
- **WHEN** đang nghe cả bài ở lời 1, người học bấm "Nghe" của lời 3
- **THEN** audio của lời 1 dừng và audio của lời 3 phát từ đầu, không có hai luồng âm cùng lúc
- **AND** sau khi lời 3 phát xong, không lời nào phát tiếp
- **AND** nút hiện lại "Nghe cả bài"

### Requirement: Hội thoại có công tắc Nghe chậm
Câu hội thoại SHALL có công tắc "Nghe chậm" ngay sau nút "Nghe cả bài", cùng trạng thái với công tắc "Nghe chậm" của cả bài (giữ qua các câu,
về mặc định theo Cài đặt khi mở bài, S4.4, S8.2). Khi công tắc bật, cả "Nghe cả bài" và nút "Nghe" của từng lời MUST phát ở tốc độ 0.75x.

#### Scenario: S10.6-AC1 Bật Nghe chậm ở câu hội thoại thì phát 0.75x
- **WHEN** ở câu có hội thoại 3 lời, người học bật "Nghe chậm" rồi bấm "Nghe cả bài"
- **THEN** mọi lời phát ở tốc độ 0.75x
- **AND** công tắc "Nghe chậm" có dấu tick

#### Scenario: S10.6-AC1 Nghe chậm áp dụng cho nút Nghe của một lời
- **WHEN** công tắc "Nghe chậm" đang bật, người học bấm "Nghe" của lời 2
- **THEN** audio của lời 2 phát ở tốc độ 0.75x

#### Scenario: S10.6-AC1 Nghe chậm bật ở câu trước giữ sang câu hội thoại
- **WHEN** tốc độ mặc định trong Cài đặt là "Bình thường (1x)", người học bật "Nghe chậm" ở một câu nghe, bấm "Tiếp tục" tới câu có hội thoại 3
  lời rồi bấm "Nghe cả bài"
- **THEN** công tắc "Nghe chậm" của câu hội thoại có dấu tick
- **AND** mọi lời phát ở tốc độ 0.75x

### Requirement: Lời đang phát được cuộn vào khung nhìn
Khi lời đang phát nằm ngoài khung nhìn, hệ thống SHALL cuộn màn tới lời đó; người học bật giảm chuyển động thì MUST cuộn ngay, không có
hiệu ứng trượt.

#### Scenario: S10.6-AC1 Lời đang phát được cuộn vào khung nhìn
- **WHEN** ở khổ 375×812, câu hội thoại có lời cuối nằm ngoài khung nhìn, người học bấm "Nghe cả bài" và chờ tới lời cuối
- **THEN** lời cuối nằm trong khung nhìn khi nó đang phát

#### Scenario: S10.6-AC1 Giảm chuyển động thì cuộn không có hiệu ứng
- **WHEN** người học bật giảm chuyển động, câu hội thoại có lời cuối nằm ngoài khung nhìn, và nghe cả bài tới lời cuối
- **THEN** màn cuộn tới lời cuối ngay, không có hiệu ứng trượt

### Requirement: Sang câu khác hoặc rời bài thì dừng audio hội thoại
Hệ thống SHALL dừng mọi audio của hội thoại khi người học bấm "Tiếp tục" sang câu kế hoặc rời màn bài.

#### Scenario: S10.6-AC1 Bấm Tiếp tục khi đang nghe cả bài
- **WHEN** đang nghe cả bài ở lời 1, người học bấm "Tiếp tục"
- **THEN** audio dừng, lời 2 và lời 3 không phát
- **AND** câu kế hiện ra

#### Scenario: S10.6-AC1 Rời màn bài khi đang nghe cả bài
- **WHEN** đang nghe cả bài ở lời 1, người học rời màn bài (về Lộ trình)
- **THEN** audio dừng, lời 2 và lời 3 không phát

### Requirement: Audio hội thoại không phát được
Khi audio của một lời không phát được (ví dụ offline mà audio của chủ đề chưa tải về máy), hệ thống SHALL hiện thông báo
"Không phát được audio." trong vùng thông báo được trình đọc màn hình đọc tự động và dừng phần đang phát (không phát tiếp các lời sau).
Người học MUST vẫn đọc được các lời, bật/tắt được các công tắc, bấm "Nghe" lại được và bấm "Tiếp tục" được. Thông báo MUST mất đi khi lần
phát kế tiếp của câu hội thoại đó phát được, hoặc khi người học bấm "Tiếp tục" sang câu kế.

#### Scenario: S10.6-AC1 Một lời không phát được khi nghe cả bài
- **WHEN** đang nghe cả bài, audio của lời 2 không phát được
- **THEN** màn hiện "Không phát được audio."
- **AND** lời 3 không phát và nút hiện lại "Nghe cả bài"
- **AND** người học vẫn bấm được "Nghe" của lời 1 và bấm được "Tiếp tục"

#### Scenario: S10.6-AC1 Bấm Nghe một lời không phát được
- **WHEN** ở câu có hội thoại 3 lời, audio của lời 2 không phát được, người học bấm "Nghe" của lời 2
- **THEN** màn hiện "Không phát được audio."
- **AND** không lời nào có chữ "Đang phát" và nút "Nghe cả bài" vẫn bấm được

#### Scenario: S10.6-AC1 Thông báo lỗi mất khi lần phát sau phát được
- **WHEN** màn đang hiện "Không phát được audio." vì lời 2, người học bấm "Nghe" của lời 1 và audio của lời 1 phát được
- **THEN** thông báo "Không phát được audio." không còn trên màn

#### Scenario: S10.6-AC1 Sang câu kế thì thông báo lỗi không còn
- **WHEN** màn đang hiện "Không phát được audio." vì lời 2, người học bấm "Tiếp tục"
- **THEN** câu kế hiện ra và thông báo "Không phát được audio." không còn trên màn

#### Scenario: S10.6-AC1 Offline đã tải audio của chủ đề thì nghe được hội thoại
- **WHEN** người học đã tải audio của chủ đề chứa bài hội thoại (S8.4), tắt mạng, mở bài và bấm "Nghe cả bài"
- **THEN** audio của cả 3 lời phát, không có thông báo lỗi

### Requirement: Bật/tắt pinyin và bản dịch tiếng Việt
AC2 "Bật/tắt pinyin và bản dịch tiếng Việt." Hệ thống SHALL có trên câu hội thoại hai công tắc, mỗi công tắc ẩn/hiện phần đó ở mọi lời
cùng lúc, không làm dừng audio:

| Công tắc | Mặc định khi mở bài | Giữ tới khi nào |
|---|---|---|
| "Pinyin" | Bật | Các câu hội thoại còn lại của bài, tới khi rời màn bài |
| "Bản dịch" | Tắt | Như trên |

#### Scenario: S10.6-AC2 Mặc định hiện pinyin, ẩn bản dịch
- **WHEN** người học mở bài và tới câu có hội thoại 3 lời
- **THEN** lời 2 hiện "你好！你叫什么名字？" và "nǐ hǎo! nǐ jiào shénme míngzi?"
- **AND** không lời nào hiện bản dịch, lời 2 không hiện "Chào bạn! Bạn tên là gì?"
- **AND** công tắc "Pinyin" có dấu tick, công tắc "Bản dịch" không có dấu tick

#### Scenario: S10.6-AC2 Bật bản dịch thì mọi lời hiện bản dịch
- **WHEN** ở câu có hội thoại 3 lời, người học bật "Bản dịch"
- **THEN** lời 1 hiện "Xin chào!", lời 2 hiện "Chào bạn! Bạn tên là gì?", lời 3 hiện "Tôi tên là Vương Minh."
- **AND** công tắc "Bản dịch" có dấu tick

#### Scenario: S10.6-AC2 Tắt bản dịch thì bản dịch biến mất
- **WHEN** người học đã bật "Bản dịch" rồi tắt
- **THEN** không lời nào hiện bản dịch và công tắc "Bản dịch" không có dấu tick

#### Scenario: S10.6-AC2 Tắt pinyin thì mọi lời không hiện pinyin
- **WHEN** ở câu có hội thoại 3 lời, người học tắt "Pinyin"
- **THEN** không lời nào hiện pinyin, lời 3 vẫn hiện "我叫王明。"
- **AND** công tắc "Pinyin" không có dấu tick

#### Scenario: S10.6-AC2 Bật lại pinyin
- **WHEN** người học đã tắt "Pinyin" rồi bật lại
- **THEN** lời 3 hiện "wǒ jiào Wáng Míng."

#### Scenario: S10.6-AC2 Bật tắt khi đang nghe cả bài không làm dừng audio
- **WHEN** đang nghe cả bài ở lời 1, người học bật "Bản dịch"
- **THEN** bản dịch hiện ở mọi lời
- **AND** audio vẫn phát tiếp lời 2 và lời 3

#### Scenario: S10.6-AC2 Lựa chọn giữ cho câu hội thoại kế trong cùng bài
- **WHEN** trong bài có hai câu hội thoại liền nhau, ở câu thứ nhất người học tắt "Pinyin", bật "Bản dịch" rồi bấm "Tiếp tục"
- **THEN** câu hội thoại thứ hai không hiện pinyin và hiện bản dịch

#### Scenario: S10.6-AC2 Mở lại bài thì về mặc định
- **WHEN** người học đã tắt "Pinyin" và bật "Bản dịch" ở câu hội thoại, rời màn bài rồi mở lại bài đó
- **THEN** câu hội thoại hiện pinyin và không hiện bản dịch

### Requirement: Công tắc của hội thoại độc lập với Cài đặt
Đổi công tắc "Pinyin"/"Bản dịch" của câu hội thoại MUST NOT đổi công tắc "Hiện pinyin" trong Cài đặt (S8.2), và công tắc "Hiện pinyin"
trong Cài đặt MUST NOT đổi mặc định của công tắc "Pinyin" ở câu hội thoại.

#### Scenario: S10.6-AC2 Công tắc của hội thoại không đổi Cài đặt
- **WHEN** công tắc "Hiện pinyin" trong Cài đặt đang bật, người học tắt "Pinyin" ở câu hội thoại rồi mở màn Cài đặt
- **THEN** công tắc "Hiện pinyin" trong Cài đặt vẫn bật

#### Scenario: S10.6-AC2 Cài đặt tắt pinyin không đổi mặc định của hội thoại
- **WHEN** người học tắt "Hiện pinyin" trong Cài đặt rồi mở bài tới câu có hội thoại 3 lời
- **THEN** công tắc "Pinyin" của câu hội thoại có dấu tick và các lời hiện pinyin

### Requirement: Câu hội thoại là câu không chấm điểm
Câu hội thoại SHALL là câu không chấm điểm theo quy tắc chung của màn bài (S10.1): "Tiếp tục" có ngay, không cần nghe trước, không có
"Đúng", "Sai" hay giải thích; vẫn đếm trong "Câu k / n", được ghi nhớ vị trí; bấm "Tiếp tục" là đã làm, không phải bỏ qua; MUST NOT tính
vào điểm, "Đúng x / y câu", "Sai n câu".

#### Scenario: S10.6-AC1 Câu hội thoại có Tiếp tục ngay, không có Đúng Sai
- **WHEN** câu có hội thoại 3 lời vừa hiện ra và người học chưa bấm gì
- **THEN** màn có nút "Tiếp tục" bấm được
- **AND** màn không hiện "Đúng", "Sai" hay giải thích

#### Scenario: S10.6-AC1 Câu hội thoại không tính vào điểm
- **WHEN** người học làm hết bài 3 câu gồm một câu hội thoại (bấm "Tiếp tục" mà không nghe), một câu trả lời đúng và một câu trả lời sai
- **THEN** màn tổng kết hiện "50%", "Đúng 1 / 2 câu" và "Sai 1 câu"
- **AND** màn báo đã làm xong các câu của bài, không báo có câu bị bỏ qua

#### Scenario: S10.6-AC1 Thoát ở câu hội thoại rồi mở lại bài
- **WHEN** người học đang ở câu hội thoại là câu 2 của bài, rời màn bài rồi mở lại bài đó
- **THEN** bài mở ở câu hội thoại đó, thanh tiến độ hiện "Câu 2 / 3"

### Requirement: Kiểm tra nội dung chặn câu hội thoại sai chỗ
Theo luật chung của S10.1, kiểm tra nội dung MUST báo lỗi nêu bài khi bài kiểm tra có câu hội thoại, hoặc bài học chỉ gồm câu không chấm
điểm (kể cả chỉ gồm câu hội thoại).

#### Scenario: S10.6-AC1 Bài kiểm tra có câu hội thoại thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối chủ đề có một câu hội thoại
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó

#### Scenario: S10.6-AC1 Bài chỉ gồm câu hội thoại thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài học thường chỉ gồm 2 câu hội thoại
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó

#### Scenario: S10.6-AC1 Bài có câu hội thoại và câu chấm điểm thì qua
- **WHEN** chạy kiểm tra nội dung trên một bài học thường gồm 1 câu hội thoại hợp lệ và 1 câu chọn thanh điệu
- **THEN** kiểm tra không báo lỗi nào cho bài đó

### Requirement: Kiểm tra nội dung chặn hội thoại không hợp lệ
Hội thoại gồm các lời theo thứ tự, mỗi lời là một vai và một câu. Kiểm tra nội dung SHALL báo lỗi nêu bài và câu, và dựng nội dung MUST
NOT ghi nội dung ra, khi vi phạm:

| Quy tắc | Ví dụ vi phạm |
|---|---|
| Câu hội thoại trỏ tới hội thoại có thật | Hội thoại không có |
| Ít nhất 2 lời | Không lời nào; một lời |
| Vai chỉ A hoặc B | Lời 3 vai "C" |
| Lời trỏ tới câu có thật | Lời 2 trỏ câu không có |
| Câu có chữ Hán, pinyin, nghĩa, audio | Lời 2 thiếu nghĩa |

#### Scenario: S10.6-AC1 Câu hội thoại trỏ tới hội thoại không có thì báo lỗi
- **WHEN** người soạn tạo câu hội thoại trỏ tới một hội thoại không có trong nội dung, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Hội thoại ít hơn 2 lời thì báo lỗi
- **WHEN** người soạn tạo câu hội thoại có hội thoại chỉ một lời (lần khác: không lời nào), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Lời có vai khác A và B thì báo lỗi
- **WHEN** người soạn tạo hội thoại có lời 3 vai "C" cho một câu hội thoại, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Lời trỏ tới câu không có thì báo lỗi
- **WHEN** người soạn tạo hội thoại có lời 2 trỏ tới một câu không có trong nội dung, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Câu của lời thiếu pinyin, nghĩa hoặc audio thì báo lỗi
- **WHEN** người soạn tạo hội thoại có câu của lời 2 thiếu nghĩa tiếng Việt (lần khác: thiếu pinyin; lần khác: thiếu audio), rồi chạy kiểm
  tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Nội dung lỗi thì dựng nội dung không ghi ra
- **WHEN** nội dung có một câu hội thoại vi phạm quy tắc và người soạn dựng nội dung
- **THEN** dựng nội dung báo lỗi và không ghi nội dung ra

#### Scenario: S10.6-AC1 Hội thoại 3 lời là hợp lệ
- **WHEN** người soạn tạo câu hội thoại bằng hội thoại 3 lời (câu của lời 1 và lời 3 giọng nữ, câu của lời 2 giọng nam)
  trong một bài học có thêm một câu chấm điểm, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó

### Requirement: Kiểm tra nội dung chặn câu sai giọng theo vai
Theo S2.x (giọng nữ cho vai thứ nhất, giọng nam cho vai thứ hai), kiểm tra nội dung SHALL báo lỗi nêu bài và câu, và dựng nội dung MUST
NOT ghi nội dung ra, khi câu của một lời vai A không phải giọng nữ hoặc câu của một lời vai B không phải giọng nam. Một câu được cả lời vai
A và lời vai B dùng là vi phạm. Cùng một chữ Hán nói bởi cả hai vai thì soạn thành hai câu riêng, mỗi câu một giọng.

#### Scenario: S10.6-AC1 Câu của lời vai B không phải giọng nam thì báo lỗi
- **WHEN** người soạn tạo hội thoại 3 lời nhưng câu của lời 2 (vai B) khai giọng nữ, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Câu của lời vai A không phải giọng nữ thì báo lỗi
- **WHEN** người soạn tạo hội thoại 3 lời nhưng câu của lời 1 (vai A) khai giọng nam, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Một câu dùng cho cả hai vai thì báo lỗi
- **WHEN** người soạn tạo hội thoại có lời 1 (vai A) và lời 2 (vai B) cùng trỏ tới một câu "你好！", rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.6-AC1 Cùng chữ Hán soạn hai câu riêng cho hai vai thì qua
- **WHEN** người soạn tạo hội thoại có lời 1 (vai A) trỏ câu "你好！" giọng nữ và lời 2 (vai B) trỏ một câu khác cũng là "你好！" giọng nam,
  trong một bài học có thêm một câu chấm điểm, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó

### Requirement: Câu hội thoại dùng được bằng bàn phím
Hệ thống SHALL cho mọi nút và công tắc của câu hội thoại tới được bằng Tab theo thứ tự: "Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch",
nút "Nghe" của lời 1 tới lời cuối, rồi "Tiếp tục"; bấm được bằng Enter hoặc Space, có viền focus nhìn thấy. Khi nút "Nghe cả bài" đổi thành
"Dừng" và ngược lại, focus MUST giữ nguyên ở nút đó.

#### Scenario: S10.6-AC1 Thứ tự Tab của câu hội thoại
- **WHEN** câu có hội thoại 3 lời vừa hiện và người học bấm Tab lần lượt từ nút "Nghe cả bài"
- **THEN** focus đi qua "Nghe cả bài", "Nghe chậm", "Pinyin", "Bản dịch", "Nghe lời 1", "Nghe lời 2", "Nghe lời 3", "Tiếp tục" theo thứ tự
  đó, mỗi lần có viền focus nhìn thấy

#### Scenario: S10.6-AC1 Nghe cả bài bằng bàn phím
- **WHEN** người học dùng Tab tới "Nghe cả bài" và bấm Enter
- **THEN** hội thoại bắt đầu phát từ lời 1, nút đổi thành "Dừng" và vẫn giữ focus
- **AND** bấm Space thì audio dừng, nút trở lại "Nghe cả bài" và vẫn giữ focus

#### Scenario: S10.6-AC2 Bật bản dịch bằng bàn phím
- **WHEN** người học dùng Tab tới công tắc "Bản dịch" và bấm Space
- **THEN** mọi lời hiện bản dịch, công tắc có dấu tick và được đọc là đang bật

### Requirement: Câu hội thoại đọc được bằng trình đọc màn hình
Hệ thống SHALL cho trình đọc màn hình đọc mỗi lời theo thứ tự vai, chữ Hán, rồi pinyin và bản dịch nếu đang hiện. Công tắc "Pinyin" và
"Bản dịch" MUST cho biết trạng thái bằng dấu tick trước chữ, không chỉ bằng màu, và đọc được là bật hay tắt (như "Nghe chậm", S4.4). Chữ
"Đang phát" MUST NOT được trình đọc màn hình đọc tự động khi lời đổi, để không chồng lên audio; người học vẫn đọc được nó khi di chuyển tới
lời đó.

#### Scenario: S10.6-AC2 Công tắc có dấu tick và trạng thái đọc được
- **WHEN** câu có hội thoại 3 lời vừa hiện ra
- **THEN** công tắc "Pinyin" có dấu tick trước chữ và được đọc là đang bật
- **AND** công tắc "Bản dịch" không có dấu tick và được đọc là đang tắt

#### Scenario: S10.6-AC2 Lời đọc theo thứ tự vai, chữ, pinyin, bản dịch
- **WHEN** ở câu có hội thoại 3 lời, người học bật "Bản dịch"
- **THEN** trình đọc màn hình đọc lời 1 theo thứ tự "Vai A", "你好！", "nǐ hǎo!", "Xin chào!"

#### Scenario: S10.6-AC1 Chữ Đang phát không được đọc tự động
- **WHEN** đang nghe cả bài và lời 2 bắt đầu phát
- **THEN** chữ "Đang phát" của lời 2 không nằm trong vùng thông báo được trình đọc màn hình đọc tự động
- **AND** di chuyển trình đọc màn hình tới lời 2 thì nghe được "Đang phát"
