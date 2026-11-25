## ADDED Requirements

### Requirement: Câu sắp xếp hiện nghĩa và các thẻ từ đã xáo
Hệ thống SHALL hiện câu sắp xếp câu gồm nghĩa tiếng Việt của câu, một hàng câu trả lời có nhãn "Câu trả lời" (ban đầu trống) và các thẻ từ
chữ Hán bên dưới trong vùng có nhãn "Các từ". Dãy chữ trên các thẻ bên dưới, đọc theo thứ tự ban đầu, MUST khác dãy chữ của thứ tự đúng
(câu có thẻ trùng chữ thì đổi chỗ hai thẻ cùng chữ không tính là khác). Trước khi chấm, màn MUST NOT hiện câu chữ Hán đầy đủ hay pinyin.
Dạng bài đã có nên màn chạy bài MUST NOT hiện "Bỏ qua câu này" cho câu sắp xếp câu.

#### Scenario: S10.3-AC1 Câu hiện nghĩa và các thẻ từ đã xáo
- **WHEN** câu sắp xếp có câu "我很好" (nghĩa "Tôi rất khỏe") với các thẻ "我", "很", "好"
- **THEN** màn hiện "Tôi rất khỏe", hàng câu trả lời trống và đủ ba thẻ "我", "很", "好" bên dưới
- **AND** màn không hiện câu chữ Hán đầy đủ và không hiện pinyin

#### Scenario: S10.3-AC1 Thứ tự ban đầu không trùng thứ tự đúng
- **WHEN** câu sắp xếp có các thẻ đúng thứ tự "我", "很", "好" được mở 20 lần
- **THEN** không lần nào các thẻ bên dưới hiện theo đúng thứ tự "我", "很", "好"

#### Scenario: S10.3-AC1 Câu có thẻ trùng chữ không hiện ban đầu theo dãy chữ đúng
- **WHEN** câu sắp xếp "我的朋友的书" có các thẻ đúng thứ tự "我", "的", "朋友", "的", "书" được mở 20 lần
- **THEN** không lần nào dãy chữ trên các thẻ bên dưới, đọc từ đầu, là "我", "的", "朋友", "的", "书"

#### Scenario: S10.3-AC1 Câu sắp xếp câu không còn bị bỏ qua
- **WHEN** bài có câu sắp xếp câu và người học tới câu đó
- **THEN** màn hiện nghĩa tiếng Việt, hàng câu trả lời và các thẻ từ
- **AND** màn không hiện "Bỏ qua câu này"

### Requirement: Kéo hoặc chạm để sắp xếp các từ
Kéo hoặc chạm để sắp xếp các từ. Hệ thống SHALL cho sắp xếp bằng chạm và bằng kéo:

| Thao tác | Kết quả |
|---|---|
| Chạm một thẻ bên dưới | Thẻ nối vào cuối hàng câu trả lời |
| Chạm một thẻ trong hàng | Thẻ trở về chỗ cũ bên dưới, các thẻ sau nó dồn lên |
| Kéo thẻ bên dưới thả vào hàng | Thẻ nằm ở vị trí thả, các thẻ từ đó lùi sang phải |
| Kéo thẻ trong hàng thả chỗ khác của hàng | Thẻ chuyển tới vị trí thả |
| Kéo thẻ trong hàng thả ra ngoài hàng | Thẻ trở về chỗ cũ bên dưới |

#### Scenario: S10.3-AC1 Chạm thẻ thì thẻ nối vào cuối câu
- **WHEN** người học chạm lần lượt thẻ "我" rồi thẻ "很"
- **THEN** hàng câu trả lời là "我", "很"
- **AND** bên dưới chỉ còn thẻ "好"

#### Scenario: S10.3-AC1 Chạm thẻ trong câu thì thẻ trở về bên dưới
- **WHEN** hàng câu trả lời là "我", "很", "好" và người học chạm thẻ "很" trong hàng
- **THEN** hàng câu trả lời là "我", "好"
- **AND** thẻ "很" hiện lại bên dưới

#### Scenario: S10.3-AC1 Kéo thẻ vào giữa câu
- **WHEN** hàng câu trả lời là "我", "好" và người học kéo thẻ "很" từ bên dưới thả vào giữa "我" và "好"
- **THEN** hàng câu trả lời là "我", "很", "好"

#### Scenario: S10.3-AC1 Kéo để đổi chỗ trong câu
- **WHEN** hàng câu trả lời là "很", "我", "好" và người học kéo thẻ "很" thả vào sau "我"
- **THEN** hàng câu trả lời là "我", "很", "好"

#### Scenario: S10.3-AC1 Kéo thẻ ra ngoài câu thì thẻ trở về bên dưới
- **WHEN** hàng câu trả lời là "我", "很" và người học kéo thẻ "很" thả ra ngoài hàng câu trả lời
- **THEN** hàng câu trả lời là "我"
- **AND** thẻ "很" hiện lại bên dưới

### Requirement: Vị trí thẻ khi thả đè lên một thẻ trong hàng
Khi người học kéo một thẻ thả vào hàng câu trả lời, hệ thống SHALL đặt thẻ theo chỗ thả:

| Chỗ thả | Kết quả |
|---|---|
| Nửa trái một thẻ trong hàng | Thẻ được đặt ngay trước thẻ bị đè |
| Nửa phải một thẻ trong hàng | Thẻ được đặt ngay sau thẻ bị đè |
| Chỗ trống của hàng, sau thẻ cuối | Thẻ được đặt cuối hàng |

#### Scenario: S10.3-AC1 Thả đè lên nửa trái một thẻ thì đặt trước thẻ đó
- **WHEN** hàng câu trả lời là "我", "好" và người học kéo thẻ "很" từ bên dưới thả đè lên nửa trái thẻ "我"
- **THEN** hàng câu trả lời là "很", "我", "好"

#### Scenario: S10.3-AC1 Thả đè lên nửa phải một thẻ thì đặt sau thẻ đó
- **WHEN** hàng câu trả lời là "我", "好" và người học kéo thẻ "很" từ bên dưới thả đè lên nửa phải thẻ "我"
- **THEN** hàng câu trả lời là "我", "很", "好"

### Requirement: Sắp xếp được bằng bàn phím và trình đọc màn hình
Hệ thống SHALL cho mỗi thẻ là một nút có tên là chữ trên thẻ; Enter hoặc Space trên thẻ MUST cho kết quả như chạm.
Khi thiết bị bật giảm chuyển động, thẻ SHALL đổi chỗ ngay, không có hiệu ứng di chuyển.

#### Scenario: S10.3-AC1 Sắp xếp bằng bàn phím
- **WHEN** người học chỉ dùng phím Tab để tới thẻ "我" rồi nhấn Enter, tới thẻ "很" rồi nhấn Space
- **THEN** hàng câu trả lời là "我", "很"
- **AND** thẻ đang được chọn bằng bàn phím có viền nhìn thấy

#### Scenario: S10.3-AC1 Thẻ có tên đọc được cho trình đọc màn hình
- **WHEN** câu sắp xếp hiện ra
- **THEN** mỗi thẻ là một nút có tên là chữ trên thẻ
- **AND** hàng câu trả lời có nhãn "Câu trả lời"
- **AND** vùng thẻ bên dưới có nhãn "Các từ"

#### Scenario: S10.3-AC1 Giảm chuyển động thì thẻ đổi chỗ ngay
- **WHEN** thiết bị bật giảm chuyển động và người học chạm thẻ "我"
- **THEN** thẻ "我" hiện ngay trong hàng câu trả lời, không có hiệu ứng di chuyển

### Requirement: Focus sau khi chuyển thẻ bằng bàn phím
Sau khi thẻ chuyển vùng bằng Enter/Space, hệ thống MUST chuyển focus theo bảng, không để focus rơi về đầu trang.

| Thẻ vừa chuyển | Focus tới |
|---|---|
| Vào hàng, bên dưới còn thẻ | Thẻ bên dưới ngay sau nó, không có thì ngay trước |
| Vào hàng, bên dưới hết thẻ | Nút "Kiểm tra" |
| Về bên dưới, hàng còn thẻ | Thẻ trong hàng ngay sau nó, không có thì ngay trước |
| Về bên dưới, hàng trống | Thẻ đầu tiên bên dưới |

#### Scenario: S10.3-AC1 Focus sau khi đưa thẻ vào câu bằng bàn phím
- **WHEN** bên dưới là "好", "我", "很", hàng câu trả lời trống và người học nhấn Enter trên thẻ "我"
- **THEN** focus nằm trên thẻ "很" bên dưới

#### Scenario: S10.3-AC1 Đưa thẻ cuối vào câu thì focus tới nút Kiểm tra
- **WHEN** hàng câu trả lời là "我", "很", bên dưới chỉ còn "好" và người học nhấn Enter trên thẻ "好"
- **THEN** focus nằm trên nút "Kiểm tra"

#### Scenario: S10.3-AC1 Focus sau khi trả thẻ về bằng bàn phím
- **WHEN** hàng câu trả lời là "我", "很", "好" và người học nhấn Enter trên thẻ "很" trong hàng
- **THEN** focus nằm trên thẻ "好" trong hàng

#### Scenario: S10.3-AC1 Trả thẻ cuối khỏi hàng thì focus tới thẻ đầu bên dưới
- **WHEN** hàng câu trả lời chỉ có "我" và người học nhấn Enter trên thẻ "我" trong hàng
- **THEN** focus nằm trên thẻ đầu tiên bên dưới

### Requirement: Báo cho trình đọc màn hình khi thẻ chuyển vùng
Khi một thẻ chuyển vùng (chạm, kéo hay bàn phím), hệ thống SHALL báo cho trình đọc màn hình "Đã thêm <chữ> vào câu" khi thẻ vào hàng
câu trả lời và "Đã bỏ <chữ> khỏi câu" khi thẻ về bên dưới.

#### Scenario: S10.3-AC1 Thẻ vào câu thì trình đọc màn hình được báo
- **WHEN** người học nhấn Enter trên thẻ "很" bên dưới
- **THEN** trình đọc màn hình được thông báo "Đã thêm 很 vào câu"

#### Scenario: S10.3-AC1 Thẻ về bên dưới thì trình đọc màn hình được báo
- **WHEN** hàng câu trả lời là "我", "很", "好" và người học nhấn Enter trên thẻ "很" trong hàng
- **THEN** trình đọc màn hình được thông báo "Đã bỏ 很 khỏi câu"

### Requirement: Chỉ chấm khi mọi thẻ đã vào câu và người học bấm Kiểm tra
Hệ thống SHALL chỉ cho bấm "Kiểm tra" khi mọi thẻ đã nằm trong hàng câu trả lời, và SHALL NOT tự chấm khi người học đặt thẻ cuối cùng.

#### Scenario: S10.3-AC2 Còn thẻ chưa đặt thì chưa chấm được
- **WHEN** câu có ba thẻ và hàng câu trả lời mới có hai thẻ
- **THEN** nút "Kiểm tra" không bấm được
- **AND** màn không hiện "Đúng" hay "Sai"

#### Scenario: S10.3-AC2 Đặt đủ thẻ thì chưa tự chấm
- **WHEN** người học đặt thẻ cuối cùng vào hàng câu trả lời
- **THEN** nút "Kiểm tra" bấm được
- **AND** màn không hiện "Đúng" hay "Sai" cho tới khi người học bấm "Kiểm tra"

### Requirement: Chấm theo đáp án. Sai thì hiện câu đúng
Chấm theo đáp án. Sai thì hiện câu đúng. Hệ thống SHALL chấm theo thứ tự đáp án người soạn ghi (hai thẻ cùng chữ đổi chỗ vẫn đúng), rồi
MUST khóa các thẻ và hiện:

| Kết quả | Màn hiện |
|---|---|
| Đúng | "Đúng", câu đúng (chữ Hán có dấu câu + pinyin), "Tiếp tục" |
| Sai | "Sai", câu đúng (chữ Hán có dấu câu + pinyin), giải thích "Đáp án đúng: <câu chữ Hán>", "Tiếp tục"; hàng giữ cách người học đã sắp |

#### Scenario: S10.3-AC2 Sắp đúng thì được chấm đúng
- **WHEN** câu là "我很好，谢谢！" (pinyin "wǒ hěn hǎo, xièxie!"), người học sắp "我", "很", "好", "谢谢" rồi bấm "Kiểm tra"
- **THEN** câu được chấm đúng
- **AND** màn hiện "我很好，谢谢！" kèm pinyin "wǒ hěn hǎo, xièxie!"

#### Scenario: S10.3-AC2 Sắp sai thì hiện câu đúng
- **WHEN** câu là "我很好，谢谢！", người học sắp "很", "我", "好", "谢谢" rồi bấm "Kiểm tra"
- **THEN** câu được chấm sai
- **AND** màn hiện "我很好，谢谢！" kèm pinyin "wǒ hěn hǎo, xièxie!"
- **AND** giải thích là "Đáp án đúng: 我很好，谢谢！"
- **AND** hàng câu trả lời vẫn là "很", "我", "好", "谢谢"

#### Scenario: S10.3-AC2 Từ lặp lại đổi chỗ cho nhau vẫn đúng
- **WHEN** câu có hai thẻ cùng chữ "的" và người học sắp đúng thứ tự chữ nhưng đặt hai thẻ "的" đổi chỗ cho nhau
- **THEN** câu được chấm đúng

#### Scenario: S10.3-AC2 Chấm xong thì khóa các thẻ
- **WHEN** câu đã được chấm
- **THEN** chạm, kéo hay nhấn phím trên các thẻ không đổi hàng câu trả lời và không đổi kết quả

### Requirement: Câu sắp xếp sai trong bài kiểm tra không tạo thẻ ôn tập
Hệ thống SHALL tính câu sắp xếp sai là câu sai trên màn tổng kết như mọi dạng câu, và SHALL NOT tạo hay đổi thẻ ôn tập vì câu sắp xếp sai
(câu không gắn với một từ, như câu nói theo câu).

#### Scenario: S10.3-AC2 Câu sắp xếp sai tính vào số câu sai
- **WHEN** người học làm xong bài kiểm tra cuối chủ đề và chỉ sai một câu là câu sắp xếp câu
- **THEN** màn tổng kết hiện "Sai 1 câu"

#### Scenario: S10.3-AC2 Câu sắp xếp sai không tạo thẻ ôn tập
- **WHEN** người học chưa có thẻ ôn tập nào, làm xong bài kiểm tra cuối chủ đề và chỉ sai một câu là câu sắp xếp câu
- **THEN** danh sách thẻ ôn tập không có thẻ nào

### Requirement: Học xong bài có câu sắp xếp không tạo thẻ ôn tập cho câu đó
Khi một bài học thường thành "Đã xong", hệ thống SHALL NOT tạo thẻ ôn tập cho câu sắp xếp câu (câu không gắn với một từ, như câu nói theo
câu); các câu khác của bài vẫn tạo thẻ như trước.

| Câu trong bài | Từ được tạo thẻ |
|---|---|
| Sắp xếp câu | Không có |

#### Scenario: S10.3-AC2 Học xong bài thường chỉ có câu sắp xếp thì không tạo thẻ
- **WHEN** người học chưa có thẻ ôn tập nào và làm hết một bài học thường chỉ có câu sắp xếp câu, không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập không có thẻ nào

### Requirement: Nội dung câu sắp xếp phải ghép được thành câu
Kiểm tra nội dung và dựng nội dung SHALL báo lỗi chỉ rõ bài và câu khi câu sắp xếp vi phạm một trong các quy tắc dưới đây; khi có lỗi,
dựng nội dung MUST NOT ghi nội dung ra.

| Quy tắc | Ví dụ lỗi |
|---|---|
| Có ít nhất 2 thẻ từ | Câu "好" chỉ có thẻ "好" |
| Các thẻ ghép theo thứ tự ghi, bỏ qua dấu câu, đúng bằng câu tham chiếu | Câu "我很好，谢谢！" với các thẻ "我", "好", "谢谢" (thiếu "很") |
| Các thẻ không giống hệt nhau hết (để xáo được khác thứ tự đúng) | Câu "谢谢" với hai thẻ "谢", "谢" |

#### Scenario: S10.3-AC2 Thẻ không ghép thành câu thì kiểm tra nội dung báo lỗi
- **WHEN** người soạn tạo câu sắp xếp cho câu "我很好，谢谢！" với các thẻ "我", "好", "谢谢" và chạy kiểm tra nội dung rồi dựng nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** dựng nội dung báo cùng lỗi và nội dung không được ghi ra

#### Scenario: S10.3-AC2 Chỉ một thẻ thì kiểm tra nội dung báo lỗi
- **WHEN** người soạn tạo câu sắp xếp chỉ có một thẻ và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.3-AC2 Các thẻ giống hệt nhau thì kiểm tra nội dung báo lỗi
- **WHEN** người soạn tạo câu sắp xếp cho câu "谢谢" với hai thẻ "谢", "谢" và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.3-AC2 Nội dung hợp lệ thì qua kiểm tra
- **WHEN** người soạn tạo câu sắp xếp cho câu "我很好，谢谢！" với các thẻ "我", "很", "好", "谢谢" và chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung không báo lỗi cho câu đó
