## ADDED Requirements

Thẻ ôn tập, ba chiều (nghĩa, nghe, viết), trạng thái "mới" và quy tắc tạo thẻ khi xong bài học là của S9.1 "Tạo thẻ ôn tập"; thẻ đến
hạn, thứ tự hỏi và việc chấm thẻ là của S9.2 "Màn ôn tập". Spec này không định nghĩa lại các phần đó. "Danh sách thẻ ôn tập" là toàn bộ
thẻ đã lưu trên máy, như ở S9.1. "Làm xong bài kiểm tra" là lúc người học làm hết các câu và màn tổng kết hiện ra.

### Requirement: Câu sai trong bài kiểm tra tạo thẻ hoặc đưa thẻ về ôn sớm
Câu sai trong bài kiểm tra tạo thẻ, hoặc đưa thẻ có sẵn về trạng thái cần ôn sớm.

Khi người học làm xong bài kiểm tra cuối chủ đề, với mỗi từ của câu sai, hệ thống SHALL tạo thẻ chiều nghĩa, chiều nghe còn thiếu (trạng
thái "mới"); chiều đã có thẻ thì không tạo thêm mà đưa thẻ đó về cần ôn sớm.

#### Scenario: S9.4-AC1 Câu sai về từ chưa có thẻ thì tạo thẻ nghĩa và nghe
- **WHEN** người học chưa có thẻ nào của từ "谢谢", làm xong bài kiểm tra cuối chủ đề và chọn sai thanh điệu ở câu về từ "谢谢"
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và thẻ "谢谢" chiều nghe, cả hai ở trạng thái "mới"

#### Scenario: S9.4-AC1 Câu sai về từ đã có thẻ thì đưa thẻ về ôn sớm, không tạo thêm
- **WHEN** người học có thẻ "你好" chiều nghĩa và chiều nghe đã chấm "Được", còn 10 ngày nữa mới tới hạn, hôm nay chưa ôn thẻ nào, rồi làm
  xong bài kiểm tra cuối chủ đề và trả lời sai câu về từ "你好"
- **THEN** danh sách thẻ ôn tập vẫn chỉ có một thẻ "你好" chiều nghĩa và một thẻ "你好" chiều nghe
- **AND** mở màn ôn tập ngay sau đó thì phiên có thẻ "你好" chiều nghĩa và thẻ "你好" chiều nghe

#### Scenario: S9.4-AC1 Từ có thẻ chiều nghĩa nhưng thiếu thẻ chiều nghe
- **WHEN** người học có thẻ "你好" chiều nghĩa đã chấm, còn 10 ngày nữa mới tới hạn, chưa có thẻ "你好" chiều nghe, rồi làm xong bài kiểm tra
  cuối chủ đề và trả lời sai câu về từ "你好"
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều nghe ở trạng thái "mới"
- **AND** thẻ "你好" chiều nghĩa vẫn là một thẻ, đã đến hạn

#### Scenario: S9.4-AC1 Câu đúng không đổi thẻ
- **WHEN** người học có thẻ "你好" chiều nghĩa còn 10 ngày nữa mới tới hạn, chưa có thẻ nào của "谢谢", rồi làm xong bài kiểm tra cuối chủ đề
  và trả lời đúng mọi câu, trong đó có câu về "你好" và câu về "谢谢"
- **THEN** danh sách thẻ ôn tập không có thẻ mới và thẻ "你好" chiều nghĩa vẫn còn 10 ngày nữa mới tới hạn

### Requirement: Câu nào là câu sai và thuộc từ nào
Hệ thống SHALL coi câu là câu sai theo cách chấm của màn bài và xử lý từ theo bảng:

| Dạng câu | Câu sai khi | Từ được xử lý |
|---|---|---|
| Chọn thanh điệu | Chọn sai | Từ của câu |
| Gõ pinyin | Chấm "Sai" | Từ của câu |
| Cặp âm | Chọn sai | Cả hai từ |
| Nói theo từ | "Gần đúng", "Chưa đúng" | Từ của câu |
| Nói theo câu | "Gần đúng", "Chưa đúng" | Không có |
| Viết chữ | Không bao giờ | Không có |
| Câu bỏ qua | Không là câu sai | Không có |

#### Scenario: S9.4-AC1 Câu cặp âm sai xử lý cả hai từ
- **WHEN** người học chưa có thẻ nào của "妈" và "马", làm xong bài kiểm tra cuối chủ đề và chọn sai ở câu cặp âm giữa "妈" và "马"
- **THEN** danh sách thẻ ôn tập có thẻ chiều nghĩa và chiều nghe của cả "妈" và "马", ở trạng thái "mới"

#### Scenario: S9.4-AC1 Câu nói theo từ tự chấm Gần đúng là câu sai
- **WHEN** người học chưa có thẻ nào của "谢谢", làm xong bài kiểm tra cuối chủ đề và tự chấm "Gần đúng" ở câu nói theo từ "谢谢"
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.4-AC1 Câu nói theo câu sai không tạo thẻ
- **WHEN** người học chưa có thẻ nào, làm xong bài kiểm tra cuối chủ đề và chỉ sai một câu là câu nói theo một câu, tự chấm "Chưa đúng"
- **THEN** danh sách thẻ ôn tập không có thẻ nào

#### Scenario: S9.4-AC1 Câu bỏ qua không phải câu sai
- **WHEN** người học chưa có thẻ nào, làm xong bài kiểm tra cuối chủ đề, bỏ qua câu về từ "谢谢" (dạng bài chưa có) và trả lời đúng mọi câu
  còn lại
- **THEN** danh sách thẻ ôn tập không có thẻ nào

### Requirement: Một từ sai nhiều câu chỉ xử lý một lần
Hệ thống SHALL xử lý một từ có nhiều câu sai trong cùng một lần làm bài đúng một lần, MUST NOT tạo trùng thẻ.

#### Scenario: S9.4-AC1 Một từ sai nhiều câu chỉ có một thẻ mỗi chiều
- **WHEN** người học chưa có thẻ nào của "你好", làm xong bài kiểm tra cuối chủ đề và trả lời sai cả câu chọn thanh điệu lẫn câu gõ pinyin
  về từ "你好"
- **THEN** danh sách thẻ ôn tập có đúng một thẻ "你好" chiều nghĩa và một thẻ "你好" chiều nghe

### Requirement: Bài kiểm tra nào đưa câu sai vào ôn tập
Hệ thống SHALL xử lý câu sai theo lần làm bài như bảng:

| Lần làm bài | Xử lý câu sai |
|---|---|
| Cuối chủ đề mở từ bản đồ, làm xong (cả khi chủ đề đã qua bằng vượt cấp) | Tạo thẻ thiếu, đưa thẻ có sẵn về ôn sớm |
| Vượt cấp, làm xong (cả lần bấm "Làm lại") | Chỉ đưa thẻ có sẵn về ôn sớm |
| Thoát giữa bài kiểm tra | Không |
| Bài học thường | Không |

#### Scenario: S9.4-AC1 Đạt bài kiểm tra nhưng còn câu sai vẫn xử lý
- **WHEN** người học chưa có thẻ nào của "谢谢", làm xong bài kiểm tra cuối chủ đề 10 câu, đạt 90%, câu sai duy nhất là câu về "谢谢"
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.4-AC1 Còn câu bỏ qua vẫn xử lý câu sai
- **WHEN** người học chưa có thẻ nào của "谢谢", làm hết bài kiểm tra cuối chủ đề, bỏ qua 1 câu (dạng bài chưa có) và trả lời sai câu về "谢谢"
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe

#### Scenario: S9.4-AC1 Kiểm tra cuối chủ đề của chủ đề đã qua bằng vượt cấp vẫn tạo thẻ
- **WHEN** người học chưa có thẻ nào, đạt bài kiểm tra vượt cấp của một chủ đề chưa mở (trả lời đúng mọi câu), sau đó mở bài kiểm tra cuối
  chủ đề của chủ đề đó từ bản đồ, làm xong và trả lời sai câu về "谢谢"
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe, ở trạng thái "mới"

### Requirement: Kiểm tra vượt cấp không tạo thẻ mới
Hệ thống MUST NOT tạo thẻ mới từ câu sai của bài kiểm tra vượt cấp (mở bằng nút "Kiểm tra vượt cấp", hoặc bằng nút "Làm lại" trên màn tổng
kết của bài kiểm tra vượt cấp chưa đạt), vì từ của chủ đề chưa mở là từ người
học chưa học; thẻ có sẵn của từ sai vẫn được đưa về ôn sớm.

#### Scenario: S9.4-AC1 Kiểm tra vượt cấp không tạo thẻ mới
- **WHEN** người học chưa có thẻ nào của "谢谢", bấm "Kiểm tra vượt cấp" của một chủ đề chưa mở, làm xong và trả lời sai câu về "谢谢"
- **THEN** danh sách thẻ ôn tập không có thẻ nào của "谢谢"

#### Scenario: S9.4-AC1 Kiểm tra vượt cấp đưa thẻ có sẵn về ôn sớm
- **WHEN** người học có thẻ "你" chiều nghĩa và chiều nghe (từ bài học của chủ đề trước) còn 10 ngày nữa mới tới hạn, bấm "Kiểm tra vượt cấp"
  của một chủ đề chưa mở, làm xong và trả lời sai câu về "你"
- **THEN** thẻ "你" chiều nghĩa và chiều nghe đã đến hạn
- **AND** danh sách thẻ ôn tập không có thêm thẻ nào

#### Scenario: S9.4-AC1 Làm lại kiểm tra vượt cấp chưa đạt vẫn không tạo thẻ mới
- **WHEN** người học chưa có thẻ nào của "谢谢", chưa đạt bài kiểm tra vượt cấp của một chủ đề chưa mở, bấm "Làm lại" trên màn tổng kết, làm
  xong lần làm lại và trả lời sai câu về "谢谢"
- **THEN** danh sách thẻ ôn tập không có thẻ nào của "谢谢"

### Requirement: Chỉ xử lý khi làm xong bài kiểm tra
Hệ thống SHALL chỉ xử lý câu sai khi người học làm hết các câu và màn tổng kết hiện ra, và MUST NOT xử lý câu sai của bài học thường.
Quy tắc này chỉ cho câu sai:

| Việc trong bài kiểm tra | Làm xong bài | Thoát giữa bài |
|---|---|---|
| Xử lý câu sai | Có | Không |
| Ghi chữ viết xong ở câu viết | Có, lúc viết xong | Có, lúc viết xong |

#### Scenario: S9.4-AC1 Thoát giữa bài kiểm tra không xử lý câu sai
- **WHEN** người học chưa có thẻ nào của "谢谢", trả lời sai câu về "谢谢" ở câu 2 của bài kiểm tra cuối chủ đề rồi thoát trước khi làm hết bài
- **THEN** danh sách thẻ ôn tập không có thẻ nào của "谢谢"

#### Scenario: S9.4-AC1 Câu sai trong bài học thường không đưa thẻ về ôn sớm
- **WHEN** người học có thẻ "你好" chiều nghĩa còn 10 ngày nữa mới tới hạn, làm lại bài học thường có từ "你好" và trả lời sai câu về "你好"
- **THEN** thẻ "你好" chiều nghĩa vẫn còn 10 ngày nữa mới tới hạn

### Requirement: Mỗi lần làm bài xử lý câu sai của chính lần đó
Hệ thống SHALL xử lý ở mỗi lần làm bài kiểm tra chỉ các câu sai của lần đó; câu đã sai ở lần trước mà lần này đúng MUST NOT được xử lý lại.

#### Scenario: S9.4-AC1 Làm lại chỉ xử lý câu sai của lần đó
- **WHEN** ở lần làm thứ nhất bài kiểm tra cuối chủ đề người học sai câu về "谢谢" (nên đã có thẻ "谢谢" chiều nghĩa và chiều nghe), chấm "Dễ"
  cả hai thẻ đó trên màn ôn tập, rồi làm lại bài kiểm tra, trả lời đúng câu về "谢谢" và sai câu về "人" (chưa có thẻ)
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều nghĩa và chiều nghe ở trạng thái "mới"
- **AND** thẻ "谢谢" chiều nghĩa và chiều nghe giữ nguyên thời điểm ôn tiếp theo đã có sau khi chấm "Dễ"

### Requirement: Đưa thẻ có sẵn về cần ôn sớm
Hệ thống SHALL đưa thẻ có sẵn về cần ôn sớm theo bảng ("lúc xong bài" là lúc màn tổng kết hiện):

| Thẻ trước đó | Sau khi xong bài |
|---|---|
| "Mới" | Giữ nguyên (đã đến hạn ngay) |
| Đã chấm, chưa tới hạn | Đến hạn ngay: thời điểm ôn tiếp theo là lúc xong bài |
| Đã chấm, đã đến hạn | Giữ nguyên hạn cũ |

#### Scenario: S9.4-AC1 Thẻ chưa tới hạn được đưa về đến hạn ngay
- **WHEN** người học có thẻ "你好" chiều nghĩa đã chấm, còn 10 ngày nữa mới tới hạn, hôm nay chưa ôn thẻ nào, làm xong bài kiểm tra cuối chủ đề
  có câu sai về "你好", rồi mở màn ôn tập
- **THEN** phiên có thẻ "你好" chiều nghĩa
- **AND** thẻ không ở trạng thái "mới"

#### Scenario: S9.4-AC1 Thẻ mới giữ nguyên trạng thái mới
- **WHEN** người học có thẻ "你好" chiều nghĩa và chiều nghe ở trạng thái "mới", làm xong bài kiểm tra cuối chủ đề có câu sai về "你好"
- **THEN** hai thẻ đó vẫn ở trạng thái "mới" và danh sách thẻ ôn tập không có thêm thẻ nào

#### Scenario: S9.4-AC1 Thẻ đã quá hạn giữ nguyên hạn cũ
- **WHEN** người học có thẻ "你好" chiều nghĩa đã chấm, tới hạn từ 3 ngày trước, làm xong bài kiểm tra cuối chủ đề có câu sai về "你好"
- **THEN** thời điểm ôn tiếp theo của thẻ "你好" chiều nghĩa vẫn là 3 ngày trước

### Requirement: Thẻ có sẵn đọc không được thì giữ nguyên
Khi thẻ có sẵn của một từ bị sai là thẻ đã lưu nhưng đọc không được (như "Thẻ bị bỏ qua" của S9.2), hệ thống SHALL coi chiều đó là đã có thẻ:
MUST NOT tạo thẻ mới đè lên, MUST NOT đổi thẻ đó, MUST NOT hiện thông báo lỗi; các chiều và các từ khác của lần làm bài vẫn được xử lý.

| Thẻ có sẵn của chiều đó | Xử lý |
|---|---|
| Đọc được | Theo Requirement "Đưa thẻ có sẵn về cần ôn sớm" |
| Đọc không được | Giữ nguyên, không tạo đè, không báo lỗi |

#### Scenario: S9.4-AC1 Thẻ có sẵn đọc không được thì giữ nguyên, phần khác vẫn xử lý
- **WHEN** (kiểm ở tầng use case) người học có thẻ "你好" chiều nghĩa đã lưu nhưng đọc không được, chưa có thẻ "你好" chiều nghe, chưa có thẻ
  nào của "谢谢", làm xong bài kiểm tra cuối chủ đề và trả lời sai câu về "你好" và câu về "谢谢"
- **THEN** thẻ "你好" chiều nghĩa đã lưu giữ nguyên, không có thẻ "你好" chiều nghĩa thứ hai
- **AND** danh sách thẻ ôn tập có thẻ "你好" chiều nghe, thẻ "谢谢" chiều nghĩa và chiều nghe, ở trạng thái "mới"
- **AND** màn tổng kết hiện bình thường, không có thông báo lỗi

### Requirement: Đưa thẻ về ôn sớm không phải một lần chấm
Việc đưa thẻ về ôn sớm MUST NOT được tính là một lần chấm: chỉ thời điểm ôn tiếp theo đổi, trạng thái và mức nhớ của thẻ giữ nguyên. Lịch ôn
sau đó SHALL do lần người học tự chấm trên màn ôn tập tính như S9.2.

#### Scenario: S9.4-AC1 Đưa thẻ về ôn sớm không phải một lần chấm
- **WHEN** (kiểm ở tầng quy tắc) thẻ "你好" chiều nghĩa đã chấm, còn 10 ngày nữa mới tới hạn, được đưa về ôn sớm vì câu sai
- **THEN** mọi thông tin của thẻ giữ nguyên trừ thời điểm ôn tiếp theo, bằng lúc làm xong bài

### Requirement: Thẻ chiều viết khi câu sai tạo thẻ chiều nghĩa
Thẻ chiều nghĩa tạo từ câu sai SHALL làm từ thành "đã học xong" cho thẻ chiều viết như mọi thẻ chiều nghĩa (S9.1). Hệ thống SHALL:

| Tình huống của từ bị sai | Thẻ chiều viết |
|---|---|
| Câu sai tạo được thẻ chiều nghĩa, mọi chữ của từ đã viết xong trên khung có gợi ý | Tạo ngay, "mới" |
| Câu sai tạo được thẻ chiều nghĩa, chưa viết xong đủ chữ | Tạo sau theo quy tắc S9.1 |

#### Scenario: S9.4-AC1 Đã viết xong chữ thì câu sai tạo đủ ba chiều
- **WHEN** người học chưa có thẻ nào của "人", đã viết xong chữ "人" trên màn luyện viết, rồi làm xong bài kiểm tra cuối chủ đề có câu sai về "人"
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết, cả ba ở trạng thái "mới"

#### Scenario: S9.4-AC1 Thẻ nghĩa từ câu sai rồi viết xong chữ thì có thẻ chiều viết
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe chỉ nhờ câu sai trong bài kiểm tra cuối chủ đề, chưa từng viết chữ "人", rồi viết xong
  chữ "人" trên màn luyện viết
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"

#### Scenario: S9.4-AC1 Thẻ nghĩa từ câu sai rồi xong bài có câu viết thì không mất thẻ chiều viết
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe chỉ nhờ câu sai trong bài kiểm tra cuối chủ đề, chưa từng viết chữ "人", rồi làm hết
  bài học có câu viết chữ "人", viết đúng hết các nét, không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"
- **AND** vẫn chỉ có một thẻ "人" chiều nghĩa và một thẻ "人" chiều nghe, giữ nguyên trạng thái và thời điểm ôn tiếp theo

### Requirement: Câu sai không tạo được thẻ chiều nghĩa thì không tạo thẻ chiều viết
Hệ thống MUST NOT tạo thẻ chiều viết từ câu sai trong hai trường hợp sau; thẻ chiều viết khi đó tạo theo quy tắc S9.1:

| Tình huống của từ bị sai | Thẻ chiều viết |
|---|---|
| Câu sai cần tạo thẻ chiều nghĩa nhưng lưu thẻ đó lỗi | Không tạo (từ chưa "đã học xong" theo S9.1) |
| Đã có thẻ chiều nghĩa từ trước, thiếu thẻ chiều viết, mọi chữ đã viết xong từ trước lần làm bài này, lần này không viết chữ nào của từ | Không tạo bù ở S9.4 |

#### Scenario: S9.4-AC1 Lưu thẻ chiều nghĩa lỗi thì không tạo thẻ chiều viết
- **WHEN** (kiểm ở tầng use case) người học chưa có thẻ nào của "人", đã viết xong chữ "人" trên màn luyện viết, làm xong bài kiểm tra cuối chủ
  đề có câu sai về "人"; lưu thẻ "人" chiều nghĩa bị lỗi
- **THEN** danh sách thẻ ôn tập không có thẻ "人" chiều nghĩa và không có thẻ "人" chiều viết
- **AND** màn tổng kết hiện bình thường, không có thông báo lỗi

#### Scenario: S9.4-AC1 Thẻ chiều viết còn thiếu từ trước không được câu sai tạo bù
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe, chưa có thẻ "人" chiều viết dù đã viết xong chữ "人" (lần lưu trước bị lỗi), làm xong
  bài kiểm tra cuối chủ đề không có câu viết chữ "人" và trả lời sai câu về "人"
- **THEN** danh sách thẻ ôn tập không có thẻ "人" chiều viết
- **AND** thẻ "人" chiều nghĩa và chiều nghe đã đến hạn

### Requirement: Câu viết trong bài kiểm tra tính trước khi xử lý câu sai
Chữ viết xong ở câu viết của bài kiểm tra, dù bài đạt hay chưa, SHALL được ghi là chữ đã viết xong như trên màn luyện viết (S9.1), giữ cho
các lần sau, và tính trước khi xử lý câu sai cùng lần. Chữ được ghi ngay lúc viết xong, không chờ làm xong bài: thoát giữa bài sau khi đã viết
xong chữ thì chữ đó vẫn được ghi; viết dở rồi thoát thì không (S9.1). Làm xong bài kiểm tra MUST NOT làm từ thành "đã học xong"; chỉ câu sai tạo thẻ chiều
nghĩa mới làm vậy.

#### Scenario: S9.4-AC1 Viết chữ ở câu viết của bài kiểm tra chưa đạt rồi sai câu về từ đó thì có đủ ba chiều
- **WHEN** người học chưa có thẻ nào của "人", chưa từng viết chữ "人", làm xong bài kiểm tra cuối chủ đề, viết đúng hết các nét ở câu viết chữ
  "人", trả lời sai câu chọn thanh điệu về "人", và bài chưa đạt
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết, cả ba ở trạng thái "mới"

#### Scenario: S9.4-AC1 Viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì chữ vẫn được ghi
- **WHEN** người học chưa có thẻ nào của "人", chưa từng viết chữ "人", viết đúng hết các nét ở câu viết chữ "人" của bài kiểm tra cuối chủ đề,
  rồi thoát trước khi làm hết bài; sau đó làm hết bài học có từ "人" mà không có câu viết chữ "人", không bỏ qua câu nào
- **THEN** ngay sau khi thoát bài kiểm tra, danh sách thẻ ôn tập không có thẻ nào của "人"
- **AND** sau khi xong bài học, danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết

#### Scenario: S9.4-AC1 Viết chữ ở bài kiểm tra chưa đạt mà không sai câu về từ đó thì chữ vẫn được ghi
- **WHEN** người học chưa có thẻ nào của "人", chưa từng viết chữ "人", làm xong bài kiểm tra cuối chủ đề, viết đúng hết các nét ở câu viết chữ
  "人", trả lời đúng mọi câu về "人", bài chưa đạt; sau đó làm hết bài học có từ "人" mà không có câu viết chữ "人", không bỏ qua câu nào
- **THEN** ngay sau bài kiểm tra, danh sách thẻ ôn tập không có thẻ nào của "人"
- **AND** sau khi xong bài học, danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết

### Requirement: Thẻ chiều viết khi viết chữ trong bài kiểm tra
Hệ thống SHALL tạo thẻ chiều viết cho từ có chữ viết xong ở câu viết của bài kiểm tra (đạt hay chưa, kể cả thoát giữa bài) chỉ khi từ
đã học xong (S9.1):

| Từ | Thẻ viết |
|---|---|
| Chưa có thẻ chiều nghĩa, viết xong mọi chữ, câu sai lưu được thẻ chiều nghĩa (cuối chủ đề, làm xong) | Tạo, "mới" |
| Chưa có thẻ chiều nghĩa, viết xong mọi chữ, không câu sai nào lưu được thẻ đó (không sai, vượt cấp, thoát giữa bài) | Chưa tạo (theo S9.1) |
| Có thẻ chiều nghĩa, viết xong chữ cuối | Tạo ngay |

#### Scenario: S9.4-AC1 Kiểm tra vượt cấp, viết chữ và sai câu về từ chưa có thẻ thì không có thẻ chiều viết
- **WHEN** (kiểm ở tầng use case) người học chưa có thẻ nào của "人", chưa từng viết chữ "人", làm xong bài kiểm tra vượt cấp, viết đúng hết
  các nét ở câu viết chữ "人", trả lời sai câu chọn thanh điệu về "人"
- **THEN** danh sách thẻ ôn tập không có thẻ nào của "人", kể cả thẻ "人" chiều viết

#### Scenario: S9.4-AC1 Đã có thẻ nghĩa, viết chữ ở bài kiểm tra chưa đạt, không sai câu về từ đó thì có thẻ chiều viết
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe (từ bài học), chưa có thẻ "人" chiều viết, chưa từng viết chữ "人", làm xong bài kiểm tra
  cuối chủ đề, viết đúng hết các nét ở câu viết chữ "人", trả lời đúng mọi câu về "人", và bài chưa đạt
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"

#### Scenario: S9.4-AC1 Đã có thẻ nghĩa, viết chữ ở bài kiểm tra chưa đạt và sai câu về từ đó thì có thẻ chiều viết
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe đã chấm, còn 10 ngày nữa mới tới hạn, chưa có thẻ "人" chiều viết, chưa từng viết chữ
  "人", làm xong bài kiểm tra cuối chủ đề, viết đúng hết các nét ở câu viết chữ "人", trả lời sai câu chọn thanh điệu về "人", và bài chưa đạt
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"
- **AND** thẻ "人" chiều nghĩa và chiều nghe đã đến hạn, mỗi chiều vẫn một thẻ

#### Scenario: S9.4-AC1 Đã có thẻ nghĩa, viết xong chữ ở bài kiểm tra rồi thoát giữa bài thì có thẻ chiều viết
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe (từ bài học), chưa có thẻ "人" chiều viết, chưa từng viết chữ "人", viết đúng hết các
  nét ở câu viết chữ "人" của bài kiểm tra cuối chủ đề, rồi thoát trước khi làm hết bài
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"
- **AND** thẻ "人" chiều nghĩa và chiều nghe giữ nguyên trạng thái và thời điểm ôn tiếp theo

### Requirement: Viết lại chữ ở bài kiểm tra tạo bù thẻ chiều viết còn thiếu
Từ đã có thẻ chiều nghĩa mà thiếu thẻ chiều viết (lưu lỗi lần trước) SHALL có thẻ chiều viết "mới" ngay lúc người học viết xong lại một chữ
của từ ở câu viết của bài kiểm tra, có hay không câu sai về từ (quy tắc khôi phục của S9.1).

#### Scenario: S9.4-AC1 Thẻ chiều viết còn thiếu được tạo bù khi viết lại chữ ở bài kiểm tra
- **WHEN** người học có thẻ "人" chiều nghĩa và chiều nghe, chưa có thẻ "人" chiều viết dù đã viết xong chữ "人" trên màn luyện viết (lưu thẻ
  chiều viết lần trước bị lỗi), làm xong bài kiểm tra cuối chủ đề, viết đúng hết các nét ở câu viết chữ "人", trả lời đúng mọi câu về "人"
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"
- **AND** vẫn chỉ có một thẻ "人" chiều nghĩa và một thẻ "人" chiều nghe, giữ nguyên trạng thái và thời điểm ôn tiếp theo

### Requirement: Câu sai không đổi thẻ chiều viết có sẵn
Hệ thống MUST NOT tạo thêm hay đưa về ôn sớm thẻ chiều viết có sẵn vì câu sai; thẻ đó giữ nguyên trạng thái và thời điểm ôn tiếp theo.

#### Scenario: S9.4-AC1 Thẻ chiều viết có sẵn không bị đưa về ôn sớm
- **WHEN** người học có thẻ "人" chiều nghĩa, chiều nghe và chiều viết đã chấm, còn 10 ngày nữa mới tới hạn, làm xong bài kiểm tra cuối chủ đề có
  câu sai về "人"
- **THEN** thẻ "人" chiều nghĩa và chiều nghe đã đến hạn
- **AND** thẻ "人" chiều viết vẫn còn 10 ngày nữa mới tới hạn

### Requirement: Không lưu được thẻ thì màn tổng kết vẫn bình thường
Hệ thống SHALL vẫn hiện màn tổng kết bài kiểm tra đầy đủ (điểm, thời gian, số câu sai, đạt hay chưa đạt) và ghi kết quả bài như bình thường
khi không lưu được thẻ ôn tập từ câu sai, và MUST NOT hiện thông báo lỗi cho việc đó (kể cả "Chưa lưu được kết quả bài này"). Câu sai của
lần làm bài đó không được xử lý lại sau; lần làm bài kế tiếp xử lý câu sai của chính lần đó.

#### Scenario: S9.4-AC1 Lưu thẻ lỗi thì bài kiểm tra vẫn ghi kết quả
- **WHEN** người học làm xong bài kiểm tra cuối chủ đề, đạt 80%, có câu sai về "谢谢" (chưa có thẻ) nhưng lưu thẻ ôn tập bị lỗi
- **THEN** màn tổng kết hiện "Bạn đã đạt", điểm, thời gian, số câu sai, không có thông báo lỗi
- **AND** trên bản đồ bài kiểm tra là "Đã xong" và chủ đề tiếp theo mở
- **AND** danh sách thẻ ôn tập không có thẻ "谢谢"

#### Scenario: S9.4-AC1 Lần làm lại sau lưu được thì có thẻ
- **WHEN** lần làm bài kiểm tra trước lưu thẻ bị lỗi, người học làm lại bài kiểm tra đó, lại sai câu về "谢谢", lần này lưu được
- **THEN** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe

### Requirement: Lưu thẻ được một phần thì giữ phần đã lưu
Khi chỉ lưu được một phần thẻ từ câu sai của một lần làm bài, hệ thống SHALL hiện màn tổng kết như thường, MUST NOT hiện thông báo lỗi; các
thẻ đã lưu được vẫn có trong danh sách thẻ ôn tập; thẻ còn thiếu SHALL được tạo bù ở lần sau câu sai (hoặc xong bài học, S9.1) xét tới từ
đó, không trùng.

| Thẻ | Lưu được | Lưu lỗi |
|---|---|---|
| Chưa có | Có thẻ "mới" | Không có thẻ |
| Có sẵn | Đưa về ôn sớm | Giữ hạn cũ |

#### Scenario: S9.4-AC1 Lưu được chiều nghĩa mà lỗi chiều nghe thì giữ thẻ chiều nghĩa
- **WHEN** người học chưa có thẻ nào của "谢谢", làm xong bài kiểm tra cuối chủ đề và trả lời sai câu về "谢谢"; lưu thẻ "谢谢" chiều nghĩa được
  nhưng lưu thẻ "谢谢" chiều nghe bị lỗi
- **THEN** màn tổng kết hiện bình thường, không có thông báo lỗi
- **AND** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa ở trạng thái "mới" và không có thẻ "谢谢" chiều nghe

#### Scenario: S9.4-AC1 Lưu được thẻ của từ này mà lỗi ở từ khác thì giữ thẻ đã lưu
- **WHEN** người học chưa có thẻ nào, làm xong bài kiểm tra cuối chủ đề và trả lời sai câu về "谢谢" và câu về "人"; lưu thẻ của "谢谢" được
  nhưng lưu thẻ của "人" bị lỗi
- **THEN** màn tổng kết hiện bình thường, không có thông báo lỗi
- **AND** danh sách thẻ ôn tập có thẻ "谢谢" chiều nghĩa và chiều nghe, không có thẻ nào của "人"

#### Scenario: S9.4-AC1 Lần sau tạo bù thẻ còn thiếu, không tạo trùng
- **WHEN** lần làm bài kiểm tra trước chỉ lưu được thẻ "谢谢" chiều nghĩa (lưu chiều nghe bị lỗi), người học làm lại bài kiểm tra đó, lại sai câu
  về "谢谢", lần này lưu được
- **THEN** danh sách thẻ ôn tập có đúng một thẻ "谢谢" chiều nghĩa và một thẻ "谢谢" chiều nghe
- **AND** thẻ "谢谢" chiều nghe ở trạng thái "mới"
