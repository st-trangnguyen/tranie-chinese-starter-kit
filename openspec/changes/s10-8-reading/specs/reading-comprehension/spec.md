## ADDED Requirements

Ví dụ dùng trong các Scenario dưới đây (nội dung mẫu, chỉ có trên bản build dùng cho kiểm thử tự động và nghiệm thu, không có trong nội dung
phát hành):

- Đoạn văn A "我叫小明。我是学生。" gồm 6 từ theo thứ tự 我 · 叫 · 小明 · 我 · 是 · 学生 và hai dấu "。". "我" xuất hiện hai lần (vị trí 1
  và 4).
- Đoạn văn B "他高兴地说。" gồm 4 từ theo thứ tự 他 · 高兴 · 地 · 说 và một dấu "。". Người soạn chỉ định "地" là mục đọc "de".
- Dữ liệu từ, đúng như danh sách từ HSK 1 hiện có của app (mọi nghĩa nối bằng "; "):

| Từ | Pinyin | Nghĩa hiện trong ô xem |
|---|---|---|
| 我 | wǒ | tôi; mình; của tôi |
| 叫 | jiào | kêu; gọi; đặt hàng; bảo |
| 学生 | xuésheng | học sinh; trẻ đi học |
| 地 (mục "de") | de | trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa đứng trước |
| 地 (mục "dì", không dùng trong đoạn B) | dì | đất; mặt đất; ruộng; vùng |

  Các từ còn lại (是, 他, 高兴, 说) cũng lấy từ danh sách từ, Scenario không kiểm nghĩa của chúng. 小明 là tên riêng, không có trong danh sách
  từ, người soạn khai báo ngay trong câu đọc hiểu: "Xiǎo Míng", "Tiểu Minh (tên người)". Nếu danh sách từ đổi nghĩa của một từ trên, ví dụ và
  Scenario theo dữ liệu mới, không khai báo đè trong câu.
- Câu hỏi 1 (đoạn A) "Tiểu Minh là ai?" có ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ"; đáp án đúng là "Học sinh".
- Câu hỏi 2 (đoạn A) "Người nói tên là gì?" có ba lựa chọn "Tiểu Minh", "Tiểu Hồng", "Tiểu Lan"; đáp án đúng là "Tiểu Minh".
- Câu hỏi 3 (đoạn B) "Anh ấy nói như thế nào?" có ba lựa chọn "Vui vẻ", "Chậm rãi", "Tức giận"; đáp án đúng là "Vui vẻ".
- "Đoạn văn mẫu" trong Scenario là đoạn A nếu không nói khác.

### Requirement: Đoạn văn ngắn kèm câu hỏi trắc nghiệm
Đoạn văn ngắn kèm câu hỏi trắc nghiệm.

Hệ thống SHALL hiện câu đọc hiểu trong màn bài học gồm một đoạn văn bằng chữ Hán và, bên dưới, một câu hỏi trắc nghiệm bằng tiếng Việt với
đúng các lựa chọn người soạn khai báo (2 đến 4 lựa chọn). Thứ tự lựa chọn MUST được xáo ngẫu nhiên mỗi lần câu hiện (như các câu trắc
nghiệm khác của app). Mỗi câu đọc hiểu có một câu hỏi và được tính là một câu của bài.

#### Scenario: S10.8-AC1 Câu đọc hiểu hiện đoạn văn và câu hỏi
- **WHEN** người học tới câu đọc hiểu với câu hỏi 1 của nội dung mẫu
- **THEN** màn hiện đoạn văn "我叫小明。我是学生。"
- **AND** bên dưới hiện câu hỏi "Tiểu Minh là ai?" với đúng ba lựa chọn "Giáo viên", "Học sinh", "Bác sĩ" (thứ tự bất kỳ)
- **AND** chưa hiện "Đúng", "Sai", đáp án đúng hay nút "Tiếp tục"

#### Scenario: S10.8-AC1 Thứ tự lựa chọn không cố định
- **WHEN** cùng câu đọc hiểu với câu hỏi 1 của nội dung mẫu hiện ra nhiều lần
- **THEN** "Học sinh" không luôn ở cùng một vị trí

### Requirement: Thứ tự lựa chọn giữ nguyên tới khi rời câu
Thứ tự lựa chọn của câu đọc hiểu SHALL theo quy tắc thứ tự lựa chọn chung của S10.2: xáo khi câu hiện, giữ nguyên tới khi rời câu; mở lại
bài đang dở hoặc học lại thì xáo mới.

| Tình huống | Thứ tự lựa chọn |
|---|---|
| Câu vừa hiện (đến câu đó trong bài) | Xáo mới |
| Chạm từ, đổi từ, đóng ô xem nghĩa, chọn, câu được chấm | Giữ nguyên như lúc câu hiện |
| Mở lại bài đang dở ở câu này (câu làm lại từ đầu) | Xáo mới |
| Học lại bài, hoặc gặp câu này ở lần học khác | Xáo mới |

#### Scenario: S10.8-AC1 Chạm từ và chấm không đổi thứ tự lựa chọn
- **WHEN** câu hỏi 1 hiện ra, người học chạm từ "学生", đóng ô xem nghĩa, rồi chọn một lựa chọn
- **THEN** sau khi chạm từ, sau khi đóng ô và sau khi câu được chấm, ba lựa chọn vẫn ở đúng vị trí như lúc câu vừa hiện

#### Scenario: S10.8-AC1 Mở lại bài đang dở thì thứ tự xáo mới
- **WHEN** người học đang ở câu hỏi 1 (chưa trả lời) thì thoát bài, rồi mở lại bài
- **THEN** màn hiện lại câu đó ở trạng thái chưa trả lời, đủ ba lựa chọn
- **AND** thứ tự lựa chọn được xáo mới như lúc câu hiện lần đầu

#### Scenario: S10.8-AC1 Hai câu hỏi về cùng một đoạn văn
- **WHEN** bài chỉ gồm hai câu đọc hiểu liền nhau dùng chung đoạn văn mẫu (câu hỏi 1 rồi câu hỏi 2), người học trả lời đúng câu thứ nhất
  ("Học sinh") và sai câu thứ hai (chọn "Tiểu Hồng")
- **THEN** cả hai câu đều hiện đoạn văn "我叫小明。我是学生。"
- **AND** thanh tiến độ tính hai câu riêng ("Câu 1 / 2", "Câu 2 / 2")
- **AND** màn tổng kết hiện "Sai 1 câu"

#### Scenario: S10.8-AC1 Câu đọc hiểu không bị bỏ qua
- **WHEN** bài có câu đọc hiểu
- **THEN** màn bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có" và không hiện "Bỏ qua câu này"

### Requirement: Đoạn văn không hiện pinyin
Hệ thống MUST NOT hiện dòng pinyin dưới chữ của đoạn văn trong câu đọc hiểu, bất kể công tắc "Hiện pinyin" bật hay tắt; pinyin chỉ xem
được bằng cách chạm vào từ.

#### Scenario: S10.8-AC1 Đoạn văn không có pinyin dù công tắc bật
- **WHEN** công tắc "Hiện pinyin" đang bật và người học tới câu đọc hiểu của nội dung mẫu
- **THEN** đoạn văn không hiện pinyin của từ nào (vd không có "xuésheng", "jiào")

### Requirement: Chọn một lựa chọn thì chấm ngay
Hệ thống SHALL chấm ngay khi người học chọn một lựa chọn, theo luồng chung của màn bài (báo "Đúng"/"Sai", khóa lựa chọn, nút "Tiếp tục"):

| Chọn | Kết quả | Giải thích |
|---|---|---|
| Đúng | "Đúng" | Không có |
| Sai | "Sai" | "Đáp án đúng: <lựa chọn đúng>" |

#### Scenario: S10.8-AC1 Chọn xong thì khóa lựa chọn
- **WHEN** người học đã chọn một lựa chọn và câu đang hiện kết quả
- **THEN** các lựa chọn bị khóa, bấm lựa chọn khác không đổi kết quả

#### Scenario: S10.8-AC1 Chọn được bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới lựa chọn "Học sinh" ở câu hỏi 1 và nhấn Enter
- **THEN** câu được chấm "Đúng"

### Requirement: Sau khi chấm, lựa chọn được gắn nhãn bằng chữ
Sau khi chấm, các lựa chọn SHALL có nhãn chữ theo bảng nhãn chung của câu trắc nghiệm E10 (S10.2). Nhãn MUST đọc được, kể cả với trình đọc
màn hình, không chỉ phân biệt bằng màu:

| Lựa chọn | Nhãn sau khi chấm |
|---|---|
| Lựa chọn là đáp án (dù người học chọn nó hay không) | "Đáp án đúng" |
| Lựa chọn người học đã chọn, và sai | "Đã chọn" |
| Lựa chọn khác | Không có nhãn |

#### Scenario: S10.8-AC1 Chọn đúng
- **WHEN** người học chọn "Học sinh" ở câu hỏi 1
- **THEN** màn hiện ngay "Đúng" và nút "Tiếp tục"
- **AND** lựa chọn "Học sinh" có nhãn "Đáp án đúng"
- **AND** không lựa chọn nào có nhãn "Đã chọn"; "Giáo viên" và "Bác sĩ" không có nhãn
- **AND** không hiện giải thích

#### Scenario: S10.8-AC1 Chọn sai thì hiện đáp án đúng và giải thích
- **WHEN** người học chọn "Giáo viên" ở câu hỏi 1
- **THEN** màn hiện ngay "Sai" và nút "Tiếp tục"
- **AND** lựa chọn "Học sinh" có nhãn "Đáp án đúng"
- **AND** lựa chọn "Giáo viên" có nhãn "Đã chọn"
- **AND** lựa chọn "Bác sĩ" không có nhãn
- **AND** giải thích là "Đáp án đúng: Học sinh"

### Requirement: Chạm vào một từ để xem pinyin và nghĩa
Chạm vào một từ để xem pinyin và nghĩa.

Hệ thống SHALL cho mỗi từ trong đoạn văn bấm được bằng chạm hoặc chuột. Bấm một từ SHALL mở ô xem nghĩa hiện chữ Hán, pinyin có dấu và
**mọi** nghĩa tiếng Việt của từ đó theo thứ tự đã soạn, cách nhau bằng "; " (như câu nhìn chữ chọn nghĩa và màn Tra từ), kể cả khi công tắc
"Hiện pinyin" tắt. Dấu câu MUST NOT bấm được.

#### Scenario: S10.8-AC2 Chạm một từ thì hiện pinyin và nghĩa
- **WHEN** người học chạm từ "学生" trong đoạn văn mẫu
- **THEN** màn hiện ô xem nghĩa có "学生", "xuésheng" và "học sinh; trẻ đi học"
- **AND** từ "学生" được đánh dấu đang chọn

#### Scenario: S10.8-AC2 Từ nhiều nghĩa hiện mọi nghĩa
- **WHEN** người học chạm từ "叫" trong đoạn văn mẫu
- **THEN** ô xem nghĩa hiện "叫", "jiào" và "kêu; gọi; đặt hàng; bảo"

#### Scenario: S10.8-AC2 Tên riêng hiện pinyin và nghĩa khai báo trong câu
- **WHEN** người học chạm từ "小明" trong đoạn văn mẫu
- **THEN** ô xem nghĩa hiện "小明", "Xiǎo Míng" và "Tiểu Minh (tên người)"

#### Scenario: S10.8-AC2 Tắt "Hiện pinyin" vẫn xem được pinyin khi chạm
- **WHEN** người học tắt "Hiện pinyin" rồi chạm từ "学生" trong câu đọc hiểu
- **THEN** ô xem nghĩa vẫn hiện "xuésheng"

### Requirement: Ô xem nghĩa dùng được bằng bàn phím và trình đọc màn hình
Hệ thống SHALL cho bấm từ bằng bàn phím (Tab tới từ rồi Enter/Space). Mở ô MUST NOT chuyển focus khỏi từ vừa bấm, và nội dung ô (chữ Hán,
pinyin, nghĩa) MUST được trình đọc màn hình đọc lên mỗi khi ô mở hoặc đổi sang từ khác.

#### Scenario: S10.8-AC2 Xem nghĩa bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới từ "学生" và nhấn Enter
- **THEN** ô xem nghĩa hiện "学生", "xuésheng" và "học sinh; trẻ đi học"
- **AND** focus vẫn ở từ "学生"

#### Scenario: S10.8-AC2 Trình đọc màn hình đọc nội dung ô
- **WHEN** người học chạm từ "学生", rồi chạm từ "叫"
- **THEN** vùng thông báo cho trình đọc màn hình lần lượt chứa "学生", "xuésheng", "học sinh; trẻ đi học" rồi "叫", "jiào", "kêu; gọi; đặt hàng; bảo"

#### Scenario: S10.8-AC2 Dấu câu không bấm được
- **WHEN** người học dùng Tab đi qua các từ của đoạn văn mẫu
- **THEN** focus lần lượt qua 6 từ 我, 叫, 小明, 我, 是, 学生 và không dừng ở dấu "。"

### Requirement: Mở, đổi và đóng ô xem nghĩa
Hệ thống SHALL mở, đổi, đóng ô xem nghĩa theo bảng sau. Mỗi lần xuất hiện của một chữ trong đoạn là một từ riêng:

| Người học làm | Kết quả |
|---|---|
| Bấm từ khác, kể cả cùng chữ ở vị trí khác | Ô hiện từ vừa bấm, chỉ từ đó được đánh dấu |
| Bấm lại chính từ đang chọn (cùng vị trí) | Ô đóng, không từ nào được đánh dấu |
| Bấm "Đóng" hoặc nhấn Escape | Ô đóng, focus về lại từ vừa xem |
| Bấm "Tiếp tục" sang câu kế | Ô đóng |

#### Scenario: S10.8-AC2 Chạm từ khác thì ô đổi sang từ mới
- **WHEN** ô xem nghĩa đang hiện "学生" và người học chạm từ "叫"
- **THEN** ô hiện "jiào" và "kêu; gọi; đặt hàng; bảo", không còn "xuésheng"
- **AND** chỉ "叫" được đánh dấu đang chọn

#### Scenario: S10.8-AC2 Chạm lần xuất hiện khác của cùng chữ thì dấu chọn chuyển theo
- **WHEN** ô xem nghĩa đang hiện "我" của vị trí 1 và người học chạm "我" ở vị trí 4
- **THEN** ô xem nghĩa vẫn mở, hiện "我", "wǒ" và "tôi; mình; của tôi"
- **AND** chỉ "我" ở vị trí 4 được đánh dấu đang chọn

#### Scenario: S10.8-AC2 Chạm lại từ đang chọn thì đóng ô
- **WHEN** ô xem nghĩa đang hiện "学生" và người học chạm lại "学生"
- **THEN** ô xem nghĩa đóng và không từ nào được đánh dấu

#### Scenario: S10.8-AC2 Đóng ô bằng nút Đóng hoặc Escape
- **WHEN** ô xem nghĩa đang hiện "学生" và người học bấm "Đóng" (lần khác: nhấn Escape)
- **THEN** ô xem nghĩa đóng
- **AND** focus nằm ở từ "学生"

#### Scenario: S10.8-AC2 Sang câu kế thì ô đóng
- **WHEN** ô xem nghĩa đang mở và người học đã trả lời rồi bấm "Tiếp tục"
- **THEN** câu kế hiện ra không có ô xem nghĩa

### Requirement: Ô xem nghĩa tôn trọng giảm chuyển động
Ô xem nghĩa MUST hiện và ẩn không có hiệu ứng chuyển động khi người học bật giảm chuyển động.

#### Scenario: S10.8-AC2 Giảm chuyển động thì ô không có hiệu ứng
- **WHEN** thiết bị bật giảm chuyển động và người học chạm từ "学生"
- **THEN** ô xem nghĩa hiện ngay, không có hiệu ứng chuyển động

### Requirement: Xem nghĩa không ảnh hưởng chấm
Hệ thống SHALL cho xem nghĩa cả trước và sau khi trả lời câu hỏi, trong bài học lẫn bài kiểm tra. Xem nghĩa MUST NOT chấm câu, đổi kết quả
"Đúng"/"Sai" hay mở khóa lựa chọn.

#### Scenario: S10.8-AC2 Xem nghĩa không đổi kết quả
- **WHEN** người học chọn "Giáo viên" ở câu hỏi 1 (bị chấm "Sai") rồi chạm từ "学生"
- **THEN** ô xem nghĩa hiện "学生", "xuésheng" và "học sinh; trẻ đi học"
- **AND** màn vẫn hiện "Sai", giải thích "Đáp án đúng: Học sinh" và các lựa chọn vẫn bị khóa

#### Scenario: S10.8-AC2 Chạm từ trước khi trả lời không chấm câu
- **WHEN** người học chạm từ "学生" khi chưa chọn lựa chọn nào
- **THEN** màn không hiện "Đúng", "Sai" hay nút "Tiếp tục"

### Requirement: Dữ liệu từ của đoạn văn
Mỗi từ trong đoạn văn SHALL lấy dữ liệu theo đúng một nguồn:

| Từ | Dữ liệu chữ Hán, pinyin, nghĩa lấy từ |
|---|---|
| Có trong danh sách từ HSK 1 của app | Đúng một mục của danh sách từ do người soạn chỉ định. Chữ có nhiều cách đọc là nhiều mục riêng (vd 地 "de" và 地 "dì"); ô hiện cách đọc và nghĩa của mục được chỉ định, không hiện mục kia |
| Không có trong danh sách (tên riêng…) | Pinyin và nghĩa người soạn khai báo ngay trong câu đọc hiểu |

#### Scenario: S10.8-AC2 Chữ nhiều cách đọc chỉ hiện mục được chỉ định
- **WHEN** người học tới câu hỏi 3 (đoạn B "他高兴地说。", "地" chỉ định mục "de") và chạm từ "地"
- **THEN** ô xem nghĩa hiện "地", "de" và "trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa đứng trước"
- **AND** ô không hiện "dì" và không hiện "đất; mặt đất; ruộng; vùng"

### Requirement: Kiểm tra nội dung chặn từ sai nguồn dữ liệu
Hệ thống SHALL để kiểm tra nội dung báo lỗi, chỉ rõ bài và câu, và MUST NOT ghi nội dung ra khi nguồn dữ liệu của một từ trong đoạn văn sai:

| Quy tắc | Ví dụ vi phạm |
|---|---|
| Mỗi từ có trong danh sách từ, hoặc có pinyin và nghĩa khai báo trong câu | "小红" không có trong danh sách, không khai báo |
| Từ có trong danh sách từ MUST NOT được khai báo pinyin hay nghĩa riêng trong câu | "学生" khai báo thêm "xuéshēng", "sinh viên" |

#### Scenario: S10.8-AC2 Từ trong đoạn thiếu dữ liệu thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có từ "小红" trong đoạn, "小红" không có trong danh sách từ và câu không khai báo pinyin, nghĩa cho
  từ đó, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

#### Scenario: S10.8-AC2 Từ có trong danh sách mà khai báo riêng thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có từ "学生" trong đoạn và khai báo riêng pinyin "xuéshēng", nghĩa "sinh viên" cho từ đó trong câu, rồi
  chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Kiểm tra nội dung chặn chữ nhiều cách đọc chỉ định sai mục
Hệ thống SHALL để kiểm tra nội dung báo lỗi, chỉ rõ bài và câu, và MUST NOT ghi nội dung ra khi chữ có nhiều mục trong danh sách từ:

| Quy tắc | Ví dụ vi phạm |
|---|---|
| Phải chỉ định một mục | "地" không nói là "de" hay "dì" |
| Mục được chỉ định phải có trong danh sách từ | "地" chỉ định mục đọc "da" (danh sách chỉ có "de" và "dì") |

#### Scenario: S10.8-AC2 Chữ nhiều cách đọc không chỉ định mục thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có từ "地" trong đoạn mà không chỉ định mục "de" hay "dì", rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

#### Scenario: S10.8-AC2 Chỉ định mục không có trong danh sách thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có từ "地" chỉ định mục đọc "da" (danh sách từ chỉ có mục "de" và "dì"), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Kiểm tra nội dung chặn đoạn văn không có từ
Hệ thống SHALL để kiểm tra nội dung báo lỗi, chỉ rõ bài và câu, và MUST NOT ghi nội dung ra khi đoạn văn của câu đọc hiểu trống hoặc chỉ gồm
dấu câu.

#### Scenario: S10.8-AC1 Đoạn văn không có từ thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có đoạn văn để trống (lần khác: chỉ gồm dấu "。"), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Kiểm tra nội dung chặn câu hỏi không hợp lệ
Hệ thống SHALL để kiểm tra nội dung báo lỗi, chỉ rõ bài và câu, và MUST NOT ghi nội dung ra khi câu hỏi của câu đọc hiểu vi phạm. So trùng
lựa chọn bỏ khoảng trắng đầu/cuối và không phân biệt hoa thường.

| Quy tắc | Ví dụ vi phạm |
|---|---|
| Đúng một đáp án đúng | Không có, hoặc có hai lựa chọn đúng |
| Từ 2 đến 4 lựa chọn | 1 hoặc 5 lựa chọn |
| Lựa chọn không trùng nhau | "Học sinh" và " học sinh" |
| Câu hỏi không rỗng | Câu hỏi trống hoặc chỉ có khoảng trắng |

#### Scenario: S10.8-AC1 Câu hỏi không có đúng một đáp án thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có hai lựa chọn được đánh dấu đúng (lần khác: không lựa chọn nào đúng), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

#### Scenario: S10.8-AC1 Số lựa chọn ngoài 2 đến 4 thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có 1 lựa chọn (lần khác: 5 lựa chọn), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.8-AC1 Lựa chọn trùng nhau thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có hai lựa chọn "Học sinh" và " học sinh", rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.8-AC1 Câu hỏi để trống thì bị báo lỗi
- **WHEN** người soạn tạo câu đọc hiểu có câu hỏi để trống (lần khác: chỉ có khoảng trắng), rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Học xong bài có câu đọc hiểu không tạo thẻ cho từ trong đoạn
Câu đọc hiểu không gắn với một từ, nên làm hết bài học có câu đọc hiểu MUST NOT tạo thẻ ôn tập cho từ trong đoạn văn (như câu nói theo một
câu); từ ở các câu khác của bài vẫn theo quy tắc tạo thẻ hiện có. Scenario dưới đây cần chức năng thẻ ôn tập (S9.1) đã có trên app.

#### Scenario: S10.8-AC1 Học xong bài chỉ có câu đọc hiểu không tạo thẻ
- **WHEN** người học chưa có thẻ nào và làm hết một bài học chỉ gồm hai câu đọc hiểu của nội dung mẫu
- **THEN** danh sách thẻ ôn tập không có thẻ nào

### Requirement: Câu đọc hiểu sai trong bài kiểm tra không tạo hay đổi thẻ ôn tập
Hệ thống SHALL tính câu đọc hiểu vào điểm và số câu sai của bài kiểm tra như mọi câu khác. Làm sai câu đọc hiểu MUST NOT tạo thẻ mới hay đưa
thẻ có sẵn về cần ôn sớm. Scenario dưới đây cần chức năng câu sai vào ôn tập (S9.4) đã có trên app.

#### Scenario: S10.8-AC1 Sai câu đọc hiểu trong bài kiểm tra
- **WHEN** người học đã có thẻ ôn tập của "学生" (chưa tới hạn), làm bài kiểm tra cuối chủ đề có một câu đọc hiểu với đoạn văn mẫu, chọn sai
  câu đó và làm đúng mọi câu còn lại
- **THEN** màn tổng kết hiện "Sai 1 câu"
- **AND** sau bài, số thẻ ôn tập không đổi và thẻ "学生" vẫn chưa tới hạn, thời điểm ôn không đổi
