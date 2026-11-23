## ADDED Requirements

Thẻ ôn tập, ba chiều (nghĩa, nghe, viết) và trạng thái "mới" là của S9.1 "Tạo thẻ ôn tập"; spec này không định nghĩa lại cách
tạo thẻ. Giới hạn số thẻ mỗi ngày là S9.3, không thuộc spec này: mọi thẻ đến hạn đều được hỏi.

### Requirement: Lấy các thẻ đến hạn
Lấy các thẻ đến hạn, mỗi thẻ hỏi theo chiều của nó.

Khi người học mở màn ôn tập, hệ thống SHALL lấy các thẻ đến hạn (Requirement "Thẻ nào được hỏi trong phiên"), hỏi lần lượt từng thẻ
theo thứ tự ở Requirement "Thứ tự hỏi các thẻ", và hiện "Thẻ x / y" (y là số thẻ của phiên).

#### Scenario: S9.2-AC1 Chỉ hỏi thẻ đến hạn, hạn sớm hơn hỏi trước
- **WHEN** người học có thẻ "你好" chiều nghĩa tới hạn từ hôm qua, thẻ "谢谢" chiều nghĩa tới hạn từ 3 ngày trước và thẻ "人" chiều nghĩa
  còn 2 ngày nữa mới tới hạn, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 2" với thẻ "谢谢"
- **AND** sau khi chấm, màn hiện "Thẻ 2 / 2" với thẻ "你好", và trong phiên không có thẻ "人"

#### Scenario: S9.2-AC1 Thẻ mới được hỏi ngay
- **WHEN** người học vừa làm xong bài học có từ "你好", chưa ôn lần nào, rồi mở màn ôn tập
- **THEN** phiên có thẻ "你好" chiều nghĩa và thẻ "你好" chiều nghe, màn hiện "Thẻ 1 / 2"

### Requirement: Thứ tự hỏi các thẻ
Hệ thống SHALL hỏi các thẻ của phiên theo thứ tự sau, không dựa vào lúc tạo thẻ "mới":

| Ưu tiên | Quy tắc xếp |
|---|---|
| 1 | Thẻ đã chấm trước, thẻ "mới" sau |
| 2 | Thẻ đã chấm: hạn sớm hơn trước. Mọi thẻ "mới" coi như cùng hạn |
| 3 | Cùng hạn: nghĩa, rồi nghe, rồi viết |
| 4 | Cùng hạn, cùng chiều: từ đứng trước trong lộ trình trước |

#### Scenario: S9.2-AC1 Thẻ cùng hạn xếp theo chiều rồi theo lộ trình
- **WHEN** người học vừa làm xong một bài có từ "你好" rồi "谢谢" (theo thứ tự trong lộ trình), chưa ôn lần nào, rồi mở màn ôn tập
- **THEN** phiên hỏi lần lượt: "你好" chiều nghĩa, "谢谢" chiều nghĩa, "你好" chiều nghe, "谢谢" chiều nghe

#### Scenario: S9.2-AC1 Thẻ đã chấm hỏi trước thẻ mới
- **WHEN** người học có thẻ "人" chiều nghĩa đã chấm, tới hạn từ hôm qua, và thẻ "你好" chiều nghĩa ở trạng thái "mới" được tạo từ 3 ngày
  trước, rồi mở màn ôn tập
- **THEN** phiên hỏi lần lượt: "人" chiều nghĩa, "你好" chiều nghĩa

#### Scenario: S9.2-AC1 Thẻ mới tạo ở các lần khác nhau vẫn xếp theo chiều rồi theo lộ trình
- **WHEN** (unit test của quy tắc xếp thứ tự) có thẻ "谢谢" chiều nghĩa ở trạng thái "mới" tạo lúc 08:00 và thẻ "你好" chiều nghe ở trạng
  thái "mới" tạo lúc 08:00 cộng 5 mili giây, và thẻ "你好" chiều nghĩa ở trạng thái "mới" tạo hôm sau (ví dụ nhập từ file sao lưu), với
  "你好" đứng trước "谢谢" trong lộ trình
- **THEN** thứ tự là: "你好" chiều nghĩa, "谢谢" chiều nghĩa, "你好" chiều nghe

### Requirement: Vị trí của từ trong lộ trình
Hệ thống SHALL so vị trí hai từ trong lộ trình theo bảng sau, từ trên xuống, dừng ở dòng phân biệt được:

| Thứ tự so | Từ đứng trước |
|---|---|
| 1 | Bài đầu tiên chứa từ đứng trước (thứ tự khai báo lộ trình) |
| 2 | Trong bài đó, câu đầu tiên chứa từ đứng trước |
| 3 | Cùng câu cặp âm: từ khai báo trước |
| 4 | Từ không có trong bài nào đứng sau; giữa chúng so mã Unicode chữ Hán |

#### Scenario: S9.2-AC1 Vị trí của từ theo bài đầu tiên và câu đầu tiên chứa từ
- **WHEN** (unit test của quy tắc xếp thứ tự) lộ trình có bài A rồi bài B; bài A có câu 1 chứa "人" và câu 2 chứa "你好"; bài B có câu chứa
  "你好" và câu cặp âm "妈" / "马" (khai báo "妈" trước); các thẻ chiều nghĩa của "你好", "人", "妈", "马" đều ở trạng thái "mới"
- **THEN** thứ tự là: "人", "你好", "妈", "马"

### Requirement: Thẻ nào được hỏi trong phiên
Hệ thống SHALL chốt danh sách thẻ của phiên lúc mở màn ôn tập theo bảng sau:

| Thẻ | Được hỏi? |
|---|---|
| Thẻ "mới" (chưa chấm lần nào) | Có, đến hạn ngay khi tạo |
| Đã chấm, thời điểm ôn tiếp theo đã tới lúc mở màn | Có |
| Đã chấm, thời điểm ôn tiếp theo sau lúc mở màn | Không |
| Tới hạn trong lúc đang ôn, kể cả thẻ vừa chấm "Quên" | Không, hỏi ở lần mở màn sau |

#### Scenario: S9.2-AC1 Danh sách chốt lúc mở màn
- **WHEN** phiên có 2 thẻ, người học chấm "Quên" thẻ thứ nhất rồi ở lại màn đủ lâu để thẻ đó tới hạn lại trước khi chấm thẻ thứ hai
- **THEN** sau khi chấm thẻ thứ hai, màn báo hết thẻ của phiên, thẻ thứ nhất không được hỏi lại trong phiên này
- **AND** khi người học mở lại màn ôn tập, thẻ thứ nhất được hỏi

### Requirement: Thẻ bị bỏ qua
Hệ thống MUST NOT hỏi thẻ của từ không có trong nội dung app (ví dụ đến từ file sao lưu) và thẻ đọc không được; các thẻ đó SHALL giữ
nguyên, không tính vào tổng "Thẻ x / y", không làm hiện thông báo lỗi, và các thẻ khác vẫn được hỏi.

#### Scenario: S9.2-AC1 Thẻ của từ không có trong app không được hỏi
- **WHEN** người học có thẻ "你好" chiều nghĩa ở trạng thái "mới" và một thẻ chiều nghĩa ở trạng thái "mới" của một từ không có trong nội
  dung app (đến từ file sao lưu), rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 1" với thẻ "你好"
- **AND** sau phiên, thẻ của từ không có trong app vẫn còn, giữ nguyên trạng thái "mới"

#### Scenario: S9.2-AC1 Thẻ đọc không được thì bỏ qua thẻ đó
- **WHEN** người học có thẻ "你好" chiều nghĩa và thẻ "谢谢" chiều nghĩa cùng đến hạn, nhưng thẻ "谢谢" đã lưu không đọc được, rồi mở màn ôn tập
- **THEN** màn hiện "Thẻ 1 / 1" với thẻ "你好", không có thông báo lỗi

### Requirement: Mỗi thẻ hỏi theo chiều của nó
Hệ thống SHALL hiện mặt hỏi theo chiều của thẻ kèm nút "Hiện đáp án", và MUST NOT hiện phần người học cần nhớ:

| Chiều | Mặt hỏi hiện | Mặt hỏi không hiện |
|---|---|---|
| Nghĩa (nhìn chữ đoán nghĩa) | Chữ Hán của từ | Pinyin, nghĩa |
| Nghe (nghe chọn chữ) | Nút "Nghe" phát âm của từ | Chữ Hán, pinyin, nghĩa |
| Viết (nhìn nghĩa viết chữ) | Mọi nghĩa của từ | Chữ Hán, pinyin |

#### Scenario: S9.2-AC1 Thẻ chiều nghĩa hiện chữ, giấu nghĩa
- **WHEN** màn ôn tập đang hỏi thẻ "你好" (nǐ hǎo, xin chào) chiều nghĩa
- **THEN** mặt hỏi hiện "你好" và nút "Hiện đáp án"
- **AND** mặt hỏi không hiện "nǐ hǎo" và "xin chào"

#### Scenario: S9.2-AC1 Thẻ chiều nghe chỉ có nút Nghe
- **WHEN** màn ôn tập đang hỏi thẻ "你好" chiều nghe
- **THEN** mặt hỏi có nút "Nghe" và nút "Hiện đáp án", chưa có âm thanh nào phát
- **AND** mặt hỏi không hiện "你好", "nǐ hǎo" và "xin chào"
- **AND** bấm "Nghe" thì phát âm của từ "你好"

#### Scenario: S9.2-AC1 Thẻ chiều viết hiện nghĩa, giấu chữ
- **WHEN** màn ôn tập đang hỏi thẻ "人" (rén, người) chiều viết
- **THEN** mặt hỏi hiện "người" và nút "Hiện đáp án"
- **AND** mặt hỏi không hiện "人" và "rén", không có khung viết

#### Scenario: S9.2-AC1 Thẻ chiều viết hiện mọi nghĩa của từ
- **WHEN** màn ôn tập đang hỏi thẻ "谢谢" (xièxie, hai nghĩa "cảm ơn" và "cảm ơn bạn") chiều viết
- **THEN** mặt hỏi hiện cả "cảm ơn" và "cảm ơn bạn"
- **AND** mặt hỏi không hiện "谢谢" và "xièxie"

### Requirement: Mặt đáp án chung cho ba chiều
Bấm "Hiện đáp án" thì hệ thống SHALL hiện chữ Hán, pinyin, mọi nghĩa của từ và nút "Nghe", với mọi chiều. Âm thanh MUST NOT tự phát khi
thẻ hay mặt đáp án vừa hiện. Công tắc "Hiện pinyin" trong Cài đặt không áp dụng cho màn ôn tập.

#### Scenario: S9.2-AC1 Hiện đáp án
- **WHEN** màn ôn tập đang hỏi thẻ "你好" theo chiều bất kỳ (nghĩa, nghe hoặc viết) và người học bấm "Hiện đáp án"
- **THEN** màn hiện "你好", "nǐ hǎo", "xin chào" và nút "Nghe", chưa có âm thanh nào phát
- **AND** nút "Hiện đáp án" không còn

#### Scenario: S9.2-AC1 Tắt Hiện pinyin không đổi màn ôn tập
- **WHEN** người học đã tắt "Hiện pinyin" trong Cài đặt, ôn thẻ "你好" chiều nghĩa và bấm "Hiện đáp án"
- **THEN** mặt đáp án vẫn hiện "nǐ hǎo"

### Requirement: Audio không phát được vẫn ôn tiếp được
Khi bấm "Nghe" mà âm thanh không phát được (ví dụ offline và audio chưa tải), hệ thống SHALL hiện thông báo không phát được audio như ở câu
nghe trong bài (S4.4), thông báo SHALL nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện, và người học MUST vẫn bấm được
"Hiện đáp án", "Nghe" lại và chấm thẻ.

#### Scenario: S9.2-AC1 Thẻ chiều nghe khi audio không phát được
- **WHEN** màn ôn tập đang hỏi thẻ chiều nghe và người học bấm "Nghe" nhưng âm thanh không phát được
- **THEN** màn hiện thông báo không phát được audio, nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện
- **AND** người học bấm "Hiện đáp án" rồi chấm "Khó" được, màn sang thẻ kế

### Requirement: Tự chấm 4 mức
Tự chấm 4 mức: Quên / Khó / Được / Dễ.

Sau khi hiện đáp án, hệ thống SHALL hiện 4 nút chấm theo thứ tự "Quên", "Khó", "Được", "Dễ", mỗi nút có chữ (không chỉ phân biệt bằng
màu). 4 nút MUST NOT hiện trước khi người học bấm "Hiện đáp án". Bấm một nút thì hệ thống SHALL lưu mức chấm cho thẻ đó ngay rồi sang thẻ
kế; mỗi thẻ chỉ được chấm một lần trong phiên: lần bấm nút chấm thứ hai trên cùng thẻ (kể cả bấm hai lần thật nhanh) MUST NOT lưu thêm
mức chấm và MUST NOT chấm thẻ kế.

#### Scenario: S9.2-AC2 Chưa hiện đáp án thì chưa chấm được
- **WHEN** màn ôn tập đang ở mặt hỏi của một thẻ
- **THEN** màn không có nút "Quên", "Khó", "Được", "Dễ"

#### Scenario: S9.2-AC2 Hiện đáp án thì có 4 nút chấm
- **WHEN** người học bấm "Hiện đáp án"
- **THEN** màn có đúng 4 nút theo thứ tự "Quên", "Khó", "Được", "Dễ"

#### Scenario: S9.2-AC2 Chấm thì sang thẻ kế
- **WHEN** phiên có 2 thẻ ở trạng thái "mới", người học đang ở thẻ thứ nhất, bấm "Hiện đáp án" rồi bấm "Được"
- **THEN** màn hiện "Thẻ 2 / 2" ở mặt hỏi của thẻ thứ hai
- **AND** thẻ thứ nhất không còn ở trạng thái "mới" và có thời điểm ôn tiếp theo mới

#### Scenario: S9.2-AC2 Bấm nút chấm hai lần thật nhanh chỉ chấm một lần
- **WHEN** phiên có 3 thẻ ở trạng thái "mới", người học hiện đáp án thẻ thứ nhất rồi bấm "Được" hai lần liên tiếp thật nhanh
- **THEN** màn hiện "Thẻ 2 / 3" ở mặt hỏi của thẻ thứ hai
- **AND** thẻ thứ hai vẫn ở trạng thái "mới"

#### Scenario: S9.2-AC2 Thoát giữa phiên giữ các thẻ đã chấm
- **WHEN** phiên có 3 thẻ đến hạn, người học chấm thẻ thứ nhất "Dễ" rồi bấm "Về Trang chủ" ở đầu màn ôn tập, sau đó bấm "Ôn tập" trước
  thời điểm ôn tiếp theo của thẻ đó
- **THEN** màn hiện "Thẻ 1 / 2", phiên chỉ có hai thẻ chưa chấm

### Requirement: Rời màn giữa phiên
Trong lúc đang hỏi thẻ (mặt hỏi hay mặt đáp án), hệ thống SHALL hiện liên kết "Về Trang chủ" ở đầu màn ôn tập, tới được bằng Tab và bấm được
bằng Enter. Bấm liên kết, hoặc dùng nút quay lại của trình duyệt, thì người học rời màn không cần xác nhận; thẻ đã chấm giữ mức chấm, thẻ
chưa chấm giữ nguyên.

#### Scenario: S9.2-AC2 Rời màn giữa phiên bằng Về Trang chủ
- **WHEN** màn ôn tập đang ở mặt hỏi của thẻ thứ nhất trong phiên 2 thẻ và người học bấm "Về Trang chủ"
- **THEN** người học vào màn Trang chủ, không có hộp thoại xác nhận
- **AND** cả hai thẻ giữ nguyên trạng thái như trước khi mở màn

### Requirement: Chấm được bằng bàn phím
Hệ thống SHALL cho thao tác cả màn ôn tập chỉ bằng bàn phím: "Nghe", "Hiện đáp án", 4 nút chấm và các nút ở trạng thái kết thúc đều tới được
bằng Tab, bấm được bằng Enter hoặc Space, có viền focus nhìn thấy được. Focus MUST NOT rơi khi nút đang có focus biến mất
(Requirement "Focus khi màn đổi").

#### Scenario: S9.2-AC2 Ôn một thẻ chỉ bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới "Hiện đáp án" và nhấn Enter, rồi Tab tới nút "Khó" và nhấn Space
- **THEN** mỗi nút có viền focus nhìn thấy được khi được focus
- **AND** thẻ được chấm "Khó" và màn sang thẻ kế

### Requirement: Focus khi màn đổi
Khi nút đang có focus biến mất, hệ thống SHALL chuyển focus theo bảng sau:

| Lúc | Focus ở | Trình đọc màn hình đọc |
|---|---|---|
| Vừa "Hiện đáp án" | Mặt đáp án | "Đáp án", rồi chữ, pinyin, nghĩa |
| Vừa chấm, còn thẻ | Mặt hỏi thẻ kế | "Thẻ x / y", rồi mặt hỏi |
| Vừa chấm, hết thẻ | Thông báo hết thẻ | "Đã ôn xong N thẻ." |

Vùng nhận focus (mặt đáp án, mặt hỏi, thông báo) SHALL có viền focus nhìn thấy được, nhưng MUST NOT nằm trong thứ tự Tab.

#### Scenario: S9.2-AC2 Focus không rơi khi đổi mặt thẻ
- **WHEN** người học nhấn Enter ở "Hiện đáp án"
- **THEN** focus nằm ở mặt đáp án, không ở nút "Quên" hay nút chấm nào khác; mặt đáp án có viền focus nhìn thấy được và có tên đọc
  được "Đáp án"
- **AND** khi người học chấm bằng bàn phím và còn thẻ, focus nằm ở mặt hỏi của thẻ kế, có viền focus nhìn thấy được và tên đọc được bắt
  đầu bằng "Thẻ 2 / 2"

### Requirement: Focus khi lưu lỗi hoặc thử lại
Khi lưu lỗi hoặc người học bấm "Thử lại" ở màn lỗi tải, hệ thống SHALL đặt focus theo bảng sau:

| Lúc | Focus ở | Trình đọc màn hình đọc |
|---|---|---|
| Chấm nhưng lưu lỗi | Nút chấm vừa bấm | "Không lưu được kết quả. Hãy chấm lại." |
| "Thử lại", đọc được thẻ | Mặt hỏi thẻ đầu tiên | "Thẻ 1 / y", rồi mặt hỏi |
| "Thử lại", không thẻ nào để hỏi | Thông báo trạng thái | Câu thông báo đó |
| "Thử lại", vẫn lỗi | Nút "Thử lại" | "Không tải được thẻ ôn tập." |

#### Scenario: S9.2-AC1 Focus sau khi Thử lại
- **WHEN** màn ôn tập đang hiện "Không tải được thẻ ôn tập.", người học nhấn Enter ở "Thử lại" và lần này đọc được 2 thẻ đến hạn
- **THEN** focus nằm ở mặt hỏi của thẻ đầu tiên, tên đọc được bắt đầu bằng "Thẻ 1 / 2"
- **AND** nếu lần thử lại vẫn lỗi thì focus ở nút "Thử lại" và "Không tải được thẻ ôn tập." nằm trong vùng được trình đọc màn hình đọc tự
  động khi xuất hiện

### Requirement: Không lưu được mức chấm thì chấm lại được
Khi không lưu được mức chấm, hệ thống SHALL ở lại thẻ đó, hiện "Không lưu được kết quả. Hãy chấm lại." trong vùng được trình đọc màn hình
đọc tự động khi xuất hiện (đọc lại ở mỗi lần lỗi) và giữ 4 nút chấm bấm được; thẻ MUST giữ nguyên trạng thái và thời điểm ôn tiếp theo
như trước lần chấm lỗi.

#### Scenario: S9.2-AC2 Lưu lỗi thì ở lại thẻ
- **WHEN** người học bấm "Được" ở thẻ "你好" chiều nghĩa (trạng thái "mới") nhưng lưu bị lỗi
- **THEN** màn vẫn ở thẻ "你好", hiện "Không lưu được kết quả. Hãy chấm lại." và 4 nút chấm
- **AND** "Không lưu được kết quả. Hãy chấm lại." nằm trong vùng được trình đọc màn hình đọc tự động khi xuất hiện, focus ở nút "Được"
- **AND** thẻ "你好" chiều nghĩa vẫn ở trạng thái "mới"
- **AND** khi người học bấm "Được" lần nữa và lần này lưu được, màn sang thẻ kế

### Requirement: Màn ôn tập khi không có thẻ để hỏi
Khi phiên không có thẻ nào, hệ thống SHALL hiện một thông báo theo bảng sau, kèm nút "Về Trang chủ":

| Tình huống | Thông báo |
|---|---|
| Không có thẻ được hỏi nào (chưa có thẻ, hoặc chỉ có thẻ bị bỏ qua) | "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." |
| Có thẻ được hỏi nhưng chưa thẻ nào tới hạn | "Không có thẻ nào cần ôn lúc này." |

#### Scenario: S9.2-AC1 Chưa có thẻ nào
- **WHEN** người học chưa có thẻ ôn tập nào và mở màn ôn tập
- **THEN** màn hiện "Bạn chưa có thẻ ôn tập. Học xong một bài để có thẻ." và nút "Về Trang chủ"

#### Scenario: S9.2-AC1 Không có thẻ đến hạn
- **WHEN** người học có thẻ nhưng thẻ nào cũng còn ít nhất 1 ngày nữa mới tới hạn, và mở màn ôn tập
- **THEN** màn hiện "Không có thẻ nào cần ôn lúc này." và nút "Về Trang chủ"

### Requirement: Hết thẻ của phiên
Khi người học đã chấm hết N thẻ của phiên, hệ thống SHALL hiện "Đã ôn xong N thẻ." kèm nút "Về Trang chủ".

#### Scenario: S9.2-AC2 Hết thẻ của phiên
- **WHEN** phiên có 2 thẻ và người học đã chấm cả hai
- **THEN** màn hiện "Đã ôn xong 2 thẻ." và nút "Về Trang chủ"
- **AND** bấm "Về Trang chủ" thì người học vào màn Trang chủ

### Requirement: Không tải được thẻ thì thử lại được
Khi đọc thẻ ôn tập bị lỗi, hệ thống SHALL hiện "Không tải được thẻ ôn tập." trong vùng được trình đọc màn hình đọc tự động khi xuất hiện,
kèm nút "Thử lại" và "Về Trang chủ".

#### Scenario: S9.2-AC1 Không tải được thẻ
- **WHEN** người học mở màn ôn tập nhưng đọc thẻ ôn tập bị lỗi
- **THEN** màn hiện "Không tải được thẻ ôn tập." cùng nút "Thử lại" và "Về Trang chủ"
- **AND** khi người học bấm "Thử lại" và lần này đọc được, màn hiện thẻ đến hạn đầu tiên

### Requirement: Ôn tập dùng được khi offline
Hệ thống SHALL cho mở màn ôn tập, hiện thẻ, hiện đáp án và chấm thẻ khi không có mạng, với điều kiện người học đã mở app ít nhất một lần
(như S1.2). Mức chấm khi offline MUST còn sau khi đóng rồi mở lại app.

#### Scenario: S9.2-AC2 Ôn và chấm khi offline
- **WHEN** người học đã mở app một lần, có thẻ "你好" chiều nghĩa đến hạn, tắt mạng, mở màn ôn tập, chấm thẻ đó "Dễ", rồi đóng và mở lại app
  và mở lại màn ôn tập
- **THEN** màn ôn tập hiện thẻ và chấm được khi offline
- **AND** sau khi mở lại, thẻ "你好" chiều nghĩa không còn trong phiên (chưa tới thời điểm ôn tiếp theo)

### Requirement: FSRS tính ngày ôn tiếp theo
FSRS tính ngày ôn tiếp theo. Phần xếp lịch có unit test.

Mỗi lần một thẻ nhận một mức chấm (ở màn ôn tập, hoặc từ viết không gợi ý S6.3), hệ thống SHALL tính trạng thái và thời điểm ôn tiếp theo
bằng FSRS tham số mặc định, không yếu tố ngẫu nhiên, từ toàn bộ trạng thái nhớ hiện tại của thẻ, mức chấm và thời điểm chấm, rồi lưu
lại toàn bộ trạng thái nhớ mới. Quy tắc xếp lịch MUST có unit test.

#### Scenario: S9.2-AC3 Ngày ôn tiếp theo khớp FSRS
- **WHEN** (unit test của quy tắc xếp lịch) một thẻ "mới" và một thẻ đã chấm "Được" một lần được chấm lần lượt bằng mỗi mức "Quên", "Khó",
  "Được", "Dễ" tại một thời điểm cố định
- **THEN** trạng thái và thời điểm ôn tiếp theo của mỗi trường hợp khớp bảng giá trị mẫu tính bằng FSRS tham số mặc định, với đúng phiên
  bản thư viện FSRS đang khóa trong dự án; nâng phiên bản thư viện thì bảng mẫu phải được cập nhật có chủ đích trong cùng thay đổi
- **AND** chạy lại với cùng đầu vào cho đúng cùng kết quả

#### Scenario: S9.2-AC3 Thẻ nhập từ file sao lưu chấm ra cùng kết quả như máy gốc
- **WHEN** ở máy A thẻ "你好" chiều nghĩa đã được chấm 3 lần ("Được", "Quên", "Được") ở các thời điểm khác nhau, người học xuất file sao lưu,
  nhập file đó vào máy B, rồi ở cả hai máy chấm thẻ đó "Khó" tại cùng một thời điểm
- **THEN** thẻ "你好" chiều nghĩa ở máy B có cùng trạng thái và cùng thời điểm ôn tiếp theo như ở máy A

### Requirement: Tính chất của lịch ôn
Lịch ôn do FSRS tính SHALL thỏa bảng sau (thời điểm ôn tiếp theo, cùng thẻ, cùng lúc chấm):

| Tính chất | Yêu cầu |
|---|---|
| Lặp lại được | Cùng mức thì cùng kết quả |
| Thứ tự mức | "Quên" ≤ "Khó" ≤ "Được" ≤ "Dễ" |
| Sau lúc chấm | Luôn sau thời điểm chấm |
| Trạng thái | Không còn "mới" |
| Bước học ngắn | Thẻ "mới": "Quên" ~1, "Khó" ~6, "Được" ~10 phút; "Dễ" ≥ 1 ngày |

#### Scenario: S9.2-AC3 Mức cao hơn không cho ngày ôn sớm hơn
- **WHEN** (unit test của quy tắc xếp lịch) cùng một thẻ, cùng thời điểm chấm, được chấm lần lượt bằng "Quên", "Khó", "Được", "Dễ" (mỗi lần
  từ cùng trạng thái ban đầu), với thẻ "mới" và với thẻ đã ôn nhiều lần
- **THEN** thời điểm ôn tiếp theo của "Quên" ≤ "Khó" ≤ "Được" ≤ "Dễ", và mọi thời điểm đều sau thời điểm chấm

#### Scenario: S9.2-AC3 Chấm Dễ thì thẻ chưa đến hạn lại ngay
- **WHEN** người học chấm "Dễ" cho thẻ "你好" chiều nghĩa ở trạng thái "mới", rời màn rồi mở lại màn ôn tập ngay
- **THEN** thẻ "你好" chiều nghĩa không có trong phiên
- **AND** khi đồng hồ tới thời điểm ôn tiếp theo đã tính cho thẻ đó và người học mở màn ôn tập, thẻ "你好" chiều nghĩa được hỏi

#### Scenario: S9.2-AC3 Chấm Quên thì thẻ quay lại sớm hơn chấm Dễ
- **WHEN** người học có hai thẻ "mới" "你好" chiều nghĩa và "谢谢" chiều nghĩa, chấm "Quên" cho "你好" và "Dễ" cho "谢谢" trong cùng một phiên
- **THEN** thời điểm ôn tiếp theo của "你好" chiều nghĩa sớm hơn của "谢谢" chiều nghĩa
- **AND** cả hai thẻ không còn ở trạng thái "mới"
