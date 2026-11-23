# offline-audio Specification

## Purpose
tải trước audio của một chủ đề (hiện dung lượng), theo dõi trạng thái, và xóa audio đã tải.

## Requirements

### Requirement: Mỗi chủ đề có nút tải, hiện dung lượng
Chủ đề là một nhóm trên bản đồ lộ trình. Hệ thống SHALL hiện ngay dưới tiêu đề mỗi nhóm có audio, trước link "Kiểm tra vượt cấp"
(nếu có), một khối audio offline; khi thiếu ít nhất một audio của chủ đề, khối có nút "Tải audio (<dung lượng>)". "Audio có trên
máy" gồm audio Nhập môn lưu sẵn, audio đã tải và audio được lưu vì đã nghe.

#### Scenario: S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng
- **WHEN** người học mở màn Lộ trình có một chủ đề HSK mà audio chưa có trên máy, tổng dung lượng audio 2 516 582 byte
- **THEN** dưới tiêu đề chủ đề có nút "Tải audio (2,4 MB)"

#### Scenario: S8.4-AC1 Khối audio nằm trên link kiểm tra vượt cấp
- **WHEN** người học mở màn Lộ trình có một chủ đề HSK chưa tải audio và có link "Kiểm tra vượt cấp"
- **THEN** nút "Tải audio (<dung lượng>)" nằm sau tiêu đề chủ đề và trước link "Kiểm tra vượt cấp"

#### Scenario: S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy
- **WHEN** người học mở app lần đầu khi có mạng, chờ app lưu sẵn xong, tắt mạng rồi mở một bài của chủ đề HSK chưa tải và bấm nghe
- **THEN** khối của chủ đề hiện nút "Tải audio (<dung lượng>)" và audio không phát được

### Requirement: Trạng thái audio offline của chủ đề
Chủ đề không có audio thì không có khối (xét trước bảng). Còn lại, hệ thống SHALL hiện đúng một trạng thái, dòng đầu khớp thì dừng:

| Trạng thái | Khi nào | Hiện ra |
|---|---|---|
| Có sẵn offline | Thuộc Nhập môn, hoặc mọi audio là audio Nhập môn | "Audio có sẵn offline" |
| Đang tải | Đã bấm tải, chưa xong | "Đang tải <n>%" |
| Chưa tải | Thiếu ít nhất một audio | Nút "Tải audio (<dung lượng>)" |
| Đã tải | Đủ mọi audio | "Đã tải audio (<dung lượng>)", có thể kèm nút "Xóa audio" |

#### Scenario: S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa
- **WHEN** mọi audio của một chủ đề HSK có trên máy, có ít nhất một audio không phải audio Nhập môn, và không có chủ đề nào đang tải
- **THEN** khối của chủ đề hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio"

#### Scenario: S8.4-AC1 Thiếu một phần audio thì là chưa tải
- **WHEN** trên máy đang có 3 trong 4 file audio của một chủ đề (ví dụ do đã nghe trước đó)
- **THEN** khối của chủ đề hiện nút "Tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Đã nghe hết audio thì là đã tải
- **WHEN** người học đã nghe khi có mạng mọi audio của một chủ đề mà chưa bấm tải, chủ đề có ít nhất một audio không phải audio Nhập môn, và không có chủ đề nào đang tải
- **THEN** khối của chủ đề hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio"

### Requirement: Dung lượng hiện theo KB hoặc MB
Hệ thống MUST hiện dung lượng là tổng dung lượng mọi audio của chủ đề (1 KB = 1024 byte, 1 MB = 1024 KB):

| Tổng dung lượng | Cách hiện | Ví dụ |
|---|---|---|
| Làm tròn lên dưới 1024 KB | KB, làm tròn lên, tối thiểu 1 KB | 300 byte → "1 KB"; 1 047 552 byte → "1023 KB" |
| Làm tròn lên ra 1024 KB | "1,0 MB" | 1 048 064 byte → "1,0 MB" |
| Từ 1 MB | MB, một chữ số thập phân, làm tròn nửa lên, dấu phẩy | 1 310 720 byte → "1,3 MB" |

#### Scenario: S8.4-AC1 Dung lượng dưới 1 MB hiện theo KB
- **WHEN** tổng dung lượng audio của một chủ đề là 870 400 byte
- **THEN** nút của chủ đề đó là "Tải audio (850 KB)"

#### Scenario: S8.4-AC1 Dung lượng rất nhỏ hiện tối thiểu 1 KB
- **WHEN** tổng dung lượng audio của một chủ đề là 300 byte
- **THEN** nút của chủ đề đó là "Tải audio (1 KB)"

#### Scenario: S8.4-AC1 Dung lượng sát 1 MB hiện 1,0 MB
- **WHEN** tổng dung lượng audio của một chủ đề là 1 048 064 byte
- **THEN** nút của chủ đề đó là "Tải audio (1,0 MB)"

#### Scenario: S8.4-AC1 Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5
- **WHEN** tổng dung lượng audio của một chủ đề là 1 310 720 byte
- **THEN** nút của chủ đề đó là "Tải audio (1,3 MB)"

### Requirement: Tải audio của chủ đề về máy
Hệ thống SHALL tải mọi audio còn thiếu của chủ đề về máy khi người học bấm nút tải, kể cả chủ đề đang khóa, và giữ trạng thái khi
mở lại app. Audio đã tải MUST phát được khi không có mạng. Người học MAY tải nhiều chủ đề cùng lúc; mỗi chủ đề có tiến độ riêng.

#### Scenario: S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy
- **WHEN** người học đang có mạng bấm "Tải audio" của một chủ đề khi không có chủ đề nào khác đang tải, và chờ tải xong
- **THEN** khối của chủ đề hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio"

#### Scenario: S8.4-AC1 Tải hai chủ đề cùng lúc
- **WHEN** chủ đề A đang tải thì người học bấm "Tải audio" của chủ đề B
- **THEN** cả hai khối cùng hiện "Đang tải <n>%" với tiến độ riêng, và khi xong cả hai hiện "Đã tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Đã tải thì học offline vẫn nghe được
- **WHEN** người học đã tải audio của một chủ đề, tắt mạng rồi mở một bài của chủ đề đó và bấm nghe
- **THEN** audio phát được

#### Scenario: S8.4-AC1 Mở lại app vẫn thấy đã tải
- **WHEN** người học đã tải audio của một chủ đề rồi đóng và mở lại app
- **THEN** khối của chủ đề đó vẫn hiện "Đã tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Chủ đề đang khóa vẫn tải được
- **WHEN** người học bấm "Tải audio" của một chủ đề mà mọi bài còn khóa
- **THEN** audio của chủ đề được tải về và khối hiện "Đã tải audio (<dung lượng>)"

### Requirement: Tiến độ tải tính theo số file
Hệ thống MUST hiện "Đang tải <n>%" với n = số file của chủ đề đang có trên máy chia tổng số file của chủ đề, nhân 100, làm tròn
xuống; tính cả file đã có từ trước (đã nghe, tải lần trước). Đủ mọi file thì hiện "Đã tải audio (<dung lượng>)", không dừng ở
"Đang tải 100%".

#### Scenario: S8.4-AC1 Hiện tiến độ khi đang tải
- **WHEN** người học bấm "Tải audio" của một chủ đề có 4 file audio và đã tải xong 1 file
- **THEN** khối của chủ đề hiện "Đang tải 25%" và không có nút tải hay nút xóa

#### Scenario: S8.4-AC1 Tiến độ làm tròn xuống
- **WHEN** người học bấm "Tải audio" của một chủ đề có 3 file audio và đã tải xong 1 file
- **THEN** khối của chủ đề hiện "Đang tải 33%"

#### Scenario: S8.4-AC1 Tiến độ tính cả file đã có từ trước
- **WHEN** một chủ đề có 4 file audio, 2 file đã có trên máy, người học bấm "Tải audio" và tải xong thêm 1 file
- **THEN** khối của chủ đề hiện "Đang tải 75%"

### Requirement: Chủ đề không cần tải
Hệ thống MUST NOT hiện nút tải hay nút xóa cho chủ đề ở trạng thái "Có sẵn offline" (thuộc Nhập môn, hoặc mọi audio đều là audio
Nhập môn đã lưu sẵn từ lần mở app đầu), mà hiện "Audio có sẵn offline". Chủ đề không có audio nào MUST NOT có khối audio offline;
luật này xét trước, nên chủ đề Nhập môn không có audio cũng không có khối.

#### Scenario: S8.4-AC1 Chủ đề Nhập môn có sẵn offline
- **WHEN** người học mở màn Lộ trình
- **THEN** chủ đề thuộc giai đoạn Nhập môn hiện "Audio có sẵn offline" và không có nút tải hay nút xóa

#### Scenario: S8.4-AC1 Chủ đề HSK chỉ dùng audio Nhập môn
- **WHEN** người học mới cài app và mở màn Lộ trình có một chủ đề HSK mà mọi audio đều là audio Nhập môn
- **THEN** chủ đề đó hiện "Audio có sẵn offline" và không có nút tải hay nút xóa

#### Scenario: S8.4-AC1 Chủ đề không có audio
- **WHEN** một chủ đề HSK không có audio nào
- **THEN** chủ đề đó không có khối audio offline

#### Scenario: S8.4-AC1 Chủ đề Nhập môn không có audio thì không có khối
- **WHEN** người học mở màn Lộ trình có một chủ đề thuộc giai đoạn Nhập môn không có audio nào
- **THEN** chủ đề đó không có khối audio offline và không hiện "Audio có sẵn offline"

### Requirement: Báo lỗi khi tải không được
Hệ thống MUST báo lỗi khi không tải được audio của chủ đề, giữ file đã tải xong, rồi hiện lại nút "Tải audio (<dung lượng>)";
bấm lại thì chỉ tải file còn thiếu.

| Tình huống | Thông báo |
|---|---|
| Bấm tải khi không có mạng | "Cần có mạng để tải audio." |
| Mất mạng hoặc một file lỗi khi đang tải | "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." |
| Máy hết bộ nhớ | "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại." |

#### Scenario: S8.4-AC1 Bấm tải khi không có mạng
- **WHEN** người học đang không có mạng và bấm "Tải audio" của một chủ đề
- **THEN** khối của chủ đề hiện "Cần có mạng để tải audio." và vẫn có nút "Tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Mất mạng khi đang tải
- **WHEN** người học bấm "Tải audio" của một chủ đề có 4 file, tải xong 2 file thì mất mạng
- **THEN** khối của chủ đề hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.", có lại nút "Tải audio (<dung lượng>)" và 2 file đã tải vẫn phát được khi offline

#### Scenario: S8.4-AC1 Tải lại chỉ tải phần còn thiếu
- **WHEN** chủ đề có 4 file, 2 file đã tải ở lần trước, người học có mạng trở lại và bấm "Tải audio"
- **THEN** chỉ 2 file còn thiếu được tải và khối hiện "Đã tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Không đủ bộ nhớ
- **WHEN** máy báo hết bộ nhớ trong lúc tải audio của một chủ đề
- **THEN** khối của chủ đề hiện "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại." và có lại nút "Tải audio (<dung lượng>)"

### Requirement: Thông báo nằm trong khối của chủ đề
Hệ thống MUST hiện thông báo lỗi và "Đã xóa audio của chủ đề <tên chủ đề>." trong khối của chính chủ đề đó, và MUST giữ thông báo
đến khi người học bấm nút kế tiếp trong khối đó, kể cả khi rời màn Lộ trình rồi quay lại khi app còn mở. Thông báo của chủ đề
này MUST NOT thay hay xóa thông báo của chủ đề khác khi trạng thái chủ đề kia không đổi.

#### Scenario: S8.4-AC1 Thông báo của mỗi chủ đề độc lập
- **WHEN** khối của chủ đề A đang hiện "Cần có mạng để tải audio." thì người học xóa audio của chủ đề B
- **THEN** khối của chủ đề A vẫn hiện "Cần có mạng để tải audio." và khối của chủ đề B hiện "Đã xóa audio của chủ đề <tên chủ đề B>."

#### Scenario: S8.4-AC1 Thông báo mất khi bấm nút kế tiếp
- **WHEN** khối của một chủ đề đang hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.", người học có mạng trở lại và bấm "Tải audio" của chủ đề đó
- **THEN** khối của chủ đề không còn hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." mà hiện "Đang tải <n>%"

### Requirement: Thông báo mất khi trạng thái chủ đề đổi
Khi trạng thái của chủ đề đổi sang khác với lúc thông báo hiện mà người học không bấm gì trong khối (ví dụ nghe đủ audio, hoặc
chủ đề khác tải xong audio dùng chung), hệ thống MUST bỏ thông báo của khối đó.

#### Scenario: S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì
- **WHEN** khối của chủ đề A đang hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." vì còn thiếu một audio, audio đó cũng thuộc chủ đề B, và người học tải xong chủ đề B
- **THEN** khối của chủ đề A hiện "Đã tải audio (<dung lượng>)" và không còn hiện "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."

### Requirement: Việc tải không phụ thuộc màn đang mở
Hệ thống SHALL tiếp tục tải audio của chủ đề khi người học rời màn Lộ trình mà app vẫn mở, và MUST hiện trạng thái hiện tại khi
người học quay lại. Đóng app giữa chừng thì các file đã tải được giữ.

#### Scenario: S8.4-AC1 Rời màn khi đang tải
- **WHEN** người học bấm "Tải audio" của một chủ đề, vào một bài rồi quay lại màn Lộ trình sau khi việc tải đã xong
- **THEN** khối của chủ đề hiện "Đã tải audio (<dung lượng>)"

#### Scenario: S8.4-AC1 Quay lại màn khi việc tải còn đang chạy
- **WHEN** người học bấm "Tải audio" của một chủ đề có 4 file, vào một bài rồi quay lại màn Lộ trình khi đã tải xong 2 file và việc tải còn chạy
- **THEN** khối của chủ đề hiện "Đang tải 50%"

#### Scenario: S8.4-AC1 Đóng app giữa chừng
- **WHEN** người học đóng app khi audio của chủ đề mới tải được một phần rồi mở lại app
- **THEN** khối của chủ đề hiện nút "Tải audio (<dung lượng>)" và các file đã tải trước đó vẫn phát được khi offline

### Requirement: Xóa được audio đã tải
Hệ thống SHALL cho người học xóa audio của một chủ đề "Đã tải" bằng nút "Xóa audio", không hỏi xác nhận. Sau khi xóa, chủ đề MUST
về "Chưa tải" và khối hiện "Đã xóa audio của chủ đề <tên chủ đề>.". Khi xóa chủ đề A:

| Audio của chủ đề A | Sau khi xóa A |
|---|---|
| Là audio Nhập môn | Giữ lại |
| Thuộc một chủ đề khác đang "Đang tải" | Giữ lại |
| Mọi audio còn lại (kể cả dùng chung với chủ đề "Đã tải" khác) | Bị xóa |

#### Scenario: S8.4-AC2 Xóa audio đã tải
- **WHEN** người học bấm "Xóa audio" của một chủ đề đã tải
- **THEN** khối của chủ đề hiện "Đã xóa audio của chủ đề <tên chủ đề>." và có lại nút "Tải audio (<dung lượng>)"

#### Scenario: S8.4-AC2 Đã xóa thì offline không còn nghe được
- **WHEN** người học xóa audio của một chủ đề, tắt mạng rồi mở một bài của chủ đề đó và bấm nghe một audio chỉ thuộc chủ đề đó
- **THEN** audio không phát được và bài hiện như khi audio không tải được

#### Scenario: S8.4-AC2 Xóa không làm hỏng chủ đề khác đang tải
- **WHEN** chủ đề A đang tải, chủ đề B đã tải và dùng chung với A một audio mà A đã tải xong, người học xóa audio của chủ đề B
- **THEN** chủ đề A tải xong và hiện "Đã tải audio (<dung lượng>)", audio dùng chung vẫn phát được khi offline

#### Scenario: S8.4-AC2 Xóa không làm mất audio Nhập môn
- **WHEN** một chủ đề HSK dùng chung một audio với Nhập môn, người học xóa audio của chủ đề HSK đó rồi tắt mạng
- **THEN** chủ đề Nhập môn vẫn hiện "Audio có sẵn offline" và audio dùng chung vẫn phát được trong bài Nhập môn

#### Scenario: S8.4-AC2 Tải lại sau khi xóa
- **WHEN** người học đã xóa audio của một chủ đề rồi bấm "Tải audio" của chủ đề đó khi có mạng
- **THEN** khối của chủ đề hiện lại "Đã tải audio (<dung lượng>)"

### Requirement: Chủ đề đã tải dùng chung audio bị xóa thì về chưa tải
Chủ đề khác đang "Đã tải" mà mất audio dùng chung vì người học xóa chủ đề A thì hệ thống MUST đưa chủ đề đó về "Chưa tải" (hiện
lại nút "Tải audio (<dung lượng>)"). Nhờ vậy dùng chung audio không làm chủ đề nào mất nút xóa.

#### Scenario: S8.4-AC2 Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải
- **WHEN** chủ đề A và chủ đề B đều đã tải và dùng chung một audio, không chủ đề nào đang tải, người học xóa audio của chủ đề A
- **THEN** khối của chủ đề A hiện "Đã xóa audio của chủ đề <tên chủ đề A>." và nút "Tải audio (<dung lượng>)", khối của chủ đề B hiện nút "Tải audio (<dung lượng>)", và audio chỉ thuộc B vẫn phát được khi offline

#### Scenario: S8.4-AC2 Chủ đề dùng chung audio vòng tròn vẫn xóa được
- **WHEN** chủ đề A có audio x, y; chủ đề B có audio y, z; chủ đề C có audio x, z; cả ba đã tải và không chủ đề nào đang tải
- **THEN** cả ba khối đều có nút "Xóa audio", và bấm "Xóa audio" của chủ đề A thì cả A, B, C đều hiện nút "Tải audio (<dung lượng>)"

#### Scenario: S8.4-AC2 Hai chủ đề cùng bộ audio vẫn xóa được
- **WHEN** chủ đề A và chủ đề B có đúng cùng một bộ audio, cả hai đã tải và không chủ đề nào đang tải
- **THEN** cả hai khối đều có nút "Xóa audio", và bấm "Xóa audio" của chủ đề A thì cả A và B đều hiện nút "Tải audio (<dung lượng>)"

### Requirement: Nút xóa chỉ hiện khi xóa được
Hệ thống MUST hiện nút "Xóa audio" cho mọi chủ đề "Đã tải" có ít nhất một audio xóa được theo bảng xóa. Chủ đề "Đã tải" mà mọi
audio đều là audio Nhập môn hoặc thuộc một chủ đề đang tải thì hiện "Đã tải audio (<dung lượng>)" không có nút xóa; khi các chủ
đề đó tải xong hoặc dừng vì lỗi, nút "Xóa audio" MUST hiện.

#### Scenario: S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải
- **WHEN** chủ đề A đã tải, mọi audio của A đều dùng chung với chủ đề B đã tải, có ít nhất một audio không phải audio Nhập môn, và không chủ đề nào đang tải
- **THEN** khối của chủ đề A hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio"

#### Scenario: S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa
- **WHEN** chủ đề A đã tải, mọi audio của A đều là audio Nhập môn hoặc cũng thuộc chủ đề C đang tải, và có ít nhất một audio không phải audio Nhập môn
- **THEN** khối của chủ đề A hiện "Đã tải audio (<dung lượng>)" không có nút "Xóa audio", và khi chủ đề C tải xong thì khối của chủ đề A có nút "Xóa audio"

### Requirement: Trạng thái tải đọc được bằng trình đọc màn hình
Hệ thống MUST cho nút tải và nút xóa một tên đọc được bắt đầu bằng chữ nhìn thấy trên nút rồi tới tên chủ đề, thao tác được bằng
bàn phím. Tiến độ tải hiện bằng chữ, không có hiệu ứng chuyển động.

#### Scenario: S8.4-AC1 Nút tải có tên kèm chủ đề
- **WHEN** trình đọc màn hình đọc nút tải của chủ đề "Chào hỏi" có tổng dung lượng audio 2,4 MB
- **THEN** tên của nút là "Tải audio (2,4 MB), chủ đề Chào hỏi" (bắt đầu bằng đúng chữ nhìn thấy trên nút)

#### Scenario: S8.4-AC2 Nút xóa có tên kèm chủ đề
- **WHEN** trình đọc màn hình đọc nút xóa của chủ đề "Chào hỏi" đã tải
- **THEN** tên của nút là "Xóa audio, chủ đề Chào hỏi"

### Requirement: Vùng thông báo đọc đổi trạng thái
Hệ thống MUST đọc qua vùng thông báo đúng các câu sau, và MUST NOT đọc "Đang tải <n>%" (chữ này chỉ hiện trên màn):

| Sự kiện | Vùng thông báo đọc |
|---|---|
| Bắt đầu tải | "Đang tải audio chủ đề <tên chủ đề>." |
| Tải xong | "Đã tải xong audio chủ đề <tên chủ đề>." |
| Xóa xong | "Đã xóa audio của chủ đề <tên chủ đề>." |
| Lỗi | Đúng câu lỗi của Requirement "Báo lỗi khi tải không được" |

#### Scenario: S8.4-AC1 Tải bằng bàn phím và nghe được kết quả
- **WHEN** người học dùng phím Tab tới nút tải của chủ đề "Chào hỏi", nhấn Enter và chờ tải xong
- **THEN** vùng thông báo đọc "Đang tải audio chủ đề Chào hỏi." khi bắt đầu, rồi "Đã tải xong audio chủ đề Chào hỏi." khi xong, và không đọc "Đang tải <n>%"

### Requirement: Mỗi câu thông báo được đọc đủ
Hệ thống MUST đọc đủ từng câu của vùng thông báo, kể cả khi nhiều chủ đề đổi trạng thái gần như cùng lúc; câu của chủ đề này
MUST NOT bị câu của chủ đề khác thay mất trước khi được đọc.

#### Scenario: S8.4-AC1 Hai chủ đề báo cùng lúc thì đọc đủ cả hai
- **WHEN** chủ đề "Chào hỏi" và chủ đề "Gia đình" đang tải cùng lúc và tải xong cách nhau dưới một giây
- **THEN** vùng thông báo đọc cả "Đã tải xong audio chủ đề Chào hỏi." và "Đã tải xong audio chủ đề Gia đình.", không câu nào bị bỏ

### Requirement: Focus không rơi khi nút biến mất
Khi nút đang được focus biến mất, hệ thống MUST chuyển focus trong khối của chính chủ đề đó. Người học đã chuyển focus đi hoặc rời
màn thì MUST NOT kéo focus về.

| Khi | Focus tới |
|---|---|
| Bấm "Tải audio" | Dòng "Đang tải <n>%" |
| Tải xong | Nút "Xóa audio", không có thì dòng "Đã tải audio (…)" |
| Tải lỗi | Nút "Tải audio" |
| Bấm "Xóa audio" | Nút "Tải audio" |

#### Scenario: S8.4-AC1 Focus khi bắt đầu và khi tải xong
- **WHEN** người học nhấn Enter trên nút "Tải audio" của một chủ đề và không di chuyển focus cho tới khi tải xong
- **THEN** focus nằm ở dòng "Đang tải <n>%" của chủ đề trong lúc tải, rồi ở nút "Xóa audio" của chủ đề khi tải xong

#### Scenario: S8.4-AC1 Tải xong mà không có nút xóa thì focus tới dòng đã tải
- **WHEN** mọi audio của chủ đề A là audio Nhập môn hoặc cũng thuộc chủ đề C, có ít nhất một audio không phải audio Nhập môn, người học nhấn Enter trên nút "Tải audio" của chủ đề C rồi của chủ đề A, không di chuyển focus, và A tải xong khi C còn đang tải
- **THEN** khối của chủ đề A không có nút "Xóa audio" và focus nằm ở dòng "Đã tải audio (<dung lượng>)" của chủ đề A

#### Scenario: S8.4-AC1 Focus khi tải lỗi
- **WHEN** người học nhấn Enter trên nút "Tải audio" của một chủ đề, không di chuyển focus, và việc tải lỗi vì mất mạng
- **THEN** focus nằm ở nút "Tải audio" của chủ đề và vùng thông báo đọc "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại."

#### Scenario: S8.4-AC1 Không kéo focus khi người học đã đi chỗ khác
- **WHEN** người học bấm "Tải audio" của một chủ đề rồi chuyển focus tới một bài khác trên bản đồ trước khi tải xong
- **THEN** khi tải xong, focus vẫn ở bài đó

#### Scenario: S8.4-AC2 Focus và thông báo khi xóa bằng bàn phím
- **WHEN** người học dùng phím Tab tới nút "Xóa audio" của chủ đề "Chào hỏi" và nhấn Enter
- **THEN** focus nằm ở nút "Tải audio" của chủ đề "Chào hỏi" và vùng thông báo đọc "Đã xóa audio của chủ đề Chào hỏi."

### Requirement: Focus khi chủ đề tự thành đã tải
Khi nút "Tải audio" đang được focus biến mất mà người học không bấm gì (chủ đề tự thành "Đã tải", ví dụ chủ đề khác tải xong
audio dùng chung), hệ thống MUST chuyển focus như khi tải xong: tới nút "Xóa audio" của chủ đề, không có thì tới dòng "Đã tải
audio (…)" của chủ đề.

#### Scenario: S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải
- **WHEN** chủ đề A chỉ còn thiếu audio cũng thuộc chủ đề B, chủ đề A có ít nhất một audio không phải audio Nhập môn, người học nhấn Enter trên nút "Tải audio" của chủ đề B rồi dùng phím Tab tới nút "Tải audio" của chủ đề A mà không nhấn, và chủ đề B tải xong khi không có chủ đề nào khác đang tải
- **THEN** khối của chủ đề A hiện "Đã tải audio (<dung lượng>)" kèm nút "Xóa audio" và focus nằm ở nút "Xóa audio" của chủ đề A
