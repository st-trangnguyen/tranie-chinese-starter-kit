## MODIFIED Requirements

### Requirement: File xuất chứa toàn bộ tiến độ
File xuất SHALL chứa các loại tiến độ theo bảng dưới; nhập lại file đó MUST cho lại đúng các loại tiến độ này.

| Loại tiến độ | Có trong file |
|---|---|
| Bài đã xong, đang dở, câu đang dở (kể cả qua kiểm tra vượt cấp) | Có |
| Mọi lựa chọn trong Cài đặt: mục tiêu phút mỗi ngày, tốc độ audio mặc định, hiện pinyin; đã qua màn chào mừng | Có |
| Số phút đã học từng ngày | Có |
| Mục tiêu của từng ngày | Có |
| Thẻ ôn tập: từ, chiều (nghĩa, nghe, viết), trạng thái, ngày ôn tiếp theo (S9.1) | Có |
| Chữ đã viết xong trên khung có gợi ý (S9.1) | Có |
| Bản ghi âm, audio đã tải | Không |

#### Scenario: S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ
- **WHEN** ở máy A người học đã xong bài 1 và bài 2, đang dở bài 3 ở câu 4, chọn mục tiêu 30 phút mỗi ngày, rồi bấm "Xuất tiến độ"
- **AND** ở máy B người học vừa qua màn chào mừng với mục tiêu 15 phút mỗi ngày, chưa học bài nào, rồi vào Cài đặt nhập file đó
  và bấm "Ghi đè"
- **THEN** ở máy B màn Lộ trình hiện bài 1, bài 2 "Đã xong", mở bài 3 thì làm tiếp từ câu 4
- **AND** màn Cài đặt của máy B hiện mục tiêu 30 phút mỗi ngày

#### Scenario: S8.5-AC1 File có lựa chọn hiện pinyin
- **WHEN** ở máy A người học tắt "hiện pinyin" trong Cài đặt rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng) "hiện pinyin" đang bật, người học nhập file đó và bấm "Ghi đè"
- **THEN** màn Cài đặt của máy B hiện "hiện pinyin" đang tắt

#### Scenario: S8.5-AC1 File có số phút đã học từng ngày
- **WHEN** ở máy A mục tiêu là 15 phút mỗi ngày, hôm nay người học đã học 12 phút, xuất file rồi nhập file đó ở máy B (đã qua màn
  chào mừng) trong cùng ngày
- **THEN** Trang chủ của máy B hiện "Hôm nay: 12 / 15 phút"

#### Scenario: S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp
- **WHEN** ở máy A người học đã xong bài 1, rồi đạt bài kiểm tra vượt cấp của một chủ đề chưa mở có bài kiểm tra (chủ đề thứ k),
  các chủ đề ở giữa vẫn "Đã khóa"; người học xuất file rồi nhập file đó ở máy B (đã qua màn chào mừng)
- **THEN** màn Lộ trình của máy B hiện bài 1 "Đã xong", mọi bài của chủ đề thứ k "Đã xong" và bài đầu của chủ đề thứ k+1 "Đang mở"
- **AND** các chủ đề ở giữa vẫn "Đã khóa"

## ADDED Requirements

### Requirement: Sao lưu rồi nhập lại không mất thẻ ôn tập và chữ đã viết
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1 (không thuộc văn bản AC1, AC2 của story): file sao lưu (S8.5) phải
chứa thẻ và chữ đã viết; export rồi import không mất thẻ.

Sau khi người học xuất file rồi nhập file đó và bấm "Ghi đè", hệ thống SHALL có lại đúng các thẻ ôn tập trong file (cùng từ, chiều, trạng
thái, ngày ôn tiếp theo) và đúng các chữ đã viết xong trên khung có gợi ý.

#### Scenario: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ
- **WHEN** ở máy A người học có thẻ "你好" chiều nghĩa đã ôn một lần (có trạng thái và ngày ôn tiếp theo khác thẻ mới) và thẻ "你好" chiều
  nghe ở trạng thái "mới", rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng, chưa có thẻ nào) người học nhập file đó và bấm "Ghi đè"
- **THEN** danh sách thẻ ôn tập của máy B có đúng hai thẻ: "你好" chiều nghĩa với trạng thái và ngày ôn tiếp theo như ở máy A, và "你好"
  chiều nghe ở trạng thái "mới"

#### Scenario: S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết
- **WHEN** ở máy A người học có thẻ "人" chiều viết và đã viết xong chữ "你" (chưa viết chữ "好") trên khung có gợi ý, rồi bấm "Xuất tiến độ"
- **AND** ở máy B (đã qua màn chào mừng) người học nhập file đó, bấm "Ghi đè", xong một bài học có từ "你好", rồi luyện viết xong chữ "好"
- **THEN** danh sách thẻ ôn tập của máy B có thẻ "人" chiều viết
- **AND** có thẻ "你好" chiều viết (chữ "你" đã viết ở máy A vẫn được tính)

### Requirement: Nhập ghi đè toàn bộ thẻ ôn tập và chữ đã viết
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1. Nhập MUST ghi đè toàn bộ như S8.5, tất cả hoặc không gì: thẻ và chữ đã
viết trên máy mà file không có SHALL không còn sau khi nhập; "Hủy", file lỗi hoặc ghi lỗi giữa chừng thì thẻ trên máy không đổi.

#### Scenario: S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học nhập file chỉ có thẻ "你好" chiều nghĩa và chiều nghe rồi bấm "Ghi đè"
- **THEN** danh sách thẻ ôn tập chỉ có thẻ "你好" chiều nghĩa và chiều nghe, không còn thẻ "谢谢"

#### Scenario: S9.1-AC1 (bổ sung) Hủy nhập thì thẻ không đổi
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file hợp lệ chỉ có thẻ "你好" rồi bấm "Hủy"
- **THEN** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC1 (bổ sung) Ghi lỗi giữa chừng thì giữ nguyên thẻ
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học bấm "Ghi đè" với file hợp lệ có thẻ "你好", nhưng việc ghi bị lỗi giữa chừng
- **THEN** màn báo "Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên."
- **AND** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file
- **WHEN** người học chọn file tiến độ đúng định dạng app nhưng một thẻ trong file có chiều không phải nghĩa, nghe hay viết
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ, thẻ ôn tập trên máy không đổi

### Requirement: File sao lưu xuất trước khi có thẻ vẫn nhập được
Yêu cầu bổ sung từ quyết định người thật ngày 2026-11-23 cho S9.1. Hệ thống SHALL nhận file sao lưu do bản app trước S9.1 xuất (không có
thẻ ôn tập và chữ đã viết) như file hợp lệ: hiện hộp xác nhận như S8.5; bấm "Ghi đè" thì tiến độ đúng bằng file, và vì ghi đè toàn bộ nên
máy không còn thẻ ôn tập và chữ đã viết nào.

#### Scenario: S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file tiến độ do bản app trước S9.1 xuất, có bài 1 "Đã xong", rồi
  bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ." và màn Lộ trình hiện bài 1 "Đã xong"
- **AND** danh sách thẻ ôn tập rỗng

### Requirement: File có thẻ hoặc chữ đã viết trùng bị từ chối
Yêu cầu bổ sung cho S9.1, như S8.5 từ chối bài trùng. File đúng định dạng app có hai thẻ cùng từ và cùng chiều, hoặc một chữ đã viết
xuất hiện hai lần, SHALL bị từ chối cả file với thông báo "File tiến độ bị hỏng, không nhập được."; tiến độ và thẻ trên máy MUST NOT đổi.

#### Scenario: S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file
- **WHEN** máy có thẻ "谢谢" chiều nghĩa và chiều nghe; người học chọn file tiến độ đúng định dạng app có hai thẻ "你好" chiều nghĩa
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được."
- **AND** danh sách thẻ ôn tập vẫn chỉ có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file
- **WHEN** người học chọn file tiến độ đúng định dạng app có chữ "你" đã viết xuất hiện hai lần
- **THEN** màn báo "File tiến độ bị hỏng, không nhập được." và tiến độ, thẻ ôn tập trên máy không đổi

### Requirement: Thẻ và chữ đã viết của từ không có trong app vẫn nhập được
Yêu cầu bổ sung cho S9.1, như S8.5 nhận bài không có trong app. Thẻ của từ không có trong nội dung app, và chữ đã viết không có trong
nội dung app hoặc không có dữ liệu nét, SHALL được nhận và giữ như trong file; chúng MUST NOT làm đổi hay tạo thêm thẻ nào khác.

#### Scenario: S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được
- **WHEN** người học chọn file có thẻ "你好" chiều nghĩa và một thẻ chiều nghĩa của một từ không có trong nội dung app, rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập có đúng hai thẻ đó, như trong file

#### Scenario: S9.1-AC2 (bổ sung) Chữ đã viết không có trong app không tạo thẻ
- **WHEN** người học chọn file có bài học chứa từ "你好" "Đã xong", thẻ "你好" chiều nghĩa và chiều nghe, chữ đã viết gồm "你" và một chữ không
  có trong nội dung app (không có "好"), rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập không có thẻ "你好" chiều viết

#### Scenario: S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ
- **WHEN** người học chọn file có bài học chứa một từ "Đã xong", thẻ chiều nghĩa và chiều nghe của từ đó, và chữ đã viết gồm mọi chữ của từ,
  trong đó có một chữ không có dữ liệu nét, rồi bấm "Ghi đè"
- **THEN** màn báo "Đã nhập tiến độ."
- **AND** danh sách thẻ ôn tập có đúng thẻ chiều nghĩa và chiều nghe của từ đó như trong file, không có thẻ chiều viết của từ đó
