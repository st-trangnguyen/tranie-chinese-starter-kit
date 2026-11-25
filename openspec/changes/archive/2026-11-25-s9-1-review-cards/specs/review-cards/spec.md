## ADDED Requirements

### Requirement: Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe
Học xong một từ thì tạo thẻ theo 2 chiều: nghĩa (nhìn chữ đoán nghĩa) và nghe (nghe chọn chữ).

Hệ thống SHALL tạo cho mỗi từ đã học xong một thẻ ôn tập chiều nghĩa và một thẻ ôn tập chiều nghe, ở trạng thái "mới". Một từ được coi
là học xong khi người học tự làm hết một bài học thường chứa từ đó, không bỏ qua câu nào (bài thành "Đã xong", hoặc làm lại bài đã
"Đã xong").

#### Scenario: S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe
- **WHEN** người học chưa có thẻ nào và làm hết bài học có các câu về từ "你好" và "谢谢", không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có đúng 4 thẻ: "你好" chiều nghĩa, "你好" chiều nghe, "谢谢" chiều nghĩa, "谢谢" chiều nghe
- **AND** cả 4 thẻ ở trạng thái "mới"

#### Scenario: S9.1-AC1 Học xong bài chưa có thẻ chiều viết
- **WHEN** người học làm hết bài học có từ "人" (bài không có câu viết chữ), chưa từng viết chữ "人"
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều nghĩa và chiều nghe
- **AND** không có thẻ "人" chiều viết

### Requirement: Từ nào của bài được tạo thẻ
Hệ thống SHALL coi là đã học mọi từ xuất hiện trong các câu của bài theo bảng sau:

| Câu trong bài | Từ được tạo thẻ |
|---|---|
| Câu có một từ (chọn thanh điệu, gõ pinyin, nói theo từ, viết chữ) | Từ của câu |
| Câu cặp âm (nghe chọn một trong hai từ) | Cả hai từ của cặp |
| Câu nói theo câu (không phải một từ) | Không có |

#### Scenario: S9.1-AC1 Câu cặp âm tạo thẻ cho cả hai từ
- **WHEN** người học làm hết một bài học có câu cặp âm giữa "妈" và "马", không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có thẻ chiều nghĩa và chiều nghe cho cả "妈" và "马"

#### Scenario: S9.1-AC1 Câu nói theo câu không tạo thẻ
- **WHEN** người học làm hết một bài học chỉ có câu nói theo một câu, không có câu nào về một từ
- **THEN** danh sách thẻ ôn tập không có thẻ mới

### Requirement: Khi nào xét tạo thẻ chiều nghĩa và chiều nghe
Hệ thống SHALL chỉ xét tạo thẻ chiều nghĩa và chiều nghe theo bảng sau:

| Tình huống | Tạo thẻ? |
|---|---|
| Bài học thường vừa thành "Đã xong" (lần đầu hoặc làm lại) | Có, cho các thẻ còn thiếu |
| Thoát giữa bài, hoặc làm hết nhưng còn câu bỏ qua | Không |
| Bài kiểm tra cuối chủ đề, bài kiểm tra vượt cấp | Không (câu sai vào ôn tập là S9.4) |

#### Scenario: S9.1-AC1 Bài chưa xong không tạo thẻ
- **WHEN** người học thoát khỏi bài học khi chưa làm hết các câu, hoặc làm hết nhưng đã bỏ qua 1 câu
- **THEN** danh sách thẻ ôn tập không có thẻ mới

#### Scenario: S9.1-AC1 Bài kiểm tra không tạo thẻ
- **WHEN** người học làm hết bài kiểm tra cuối chủ đề hoặc bài kiểm tra vượt cấp, trả lời đúng mọi câu
- **THEN** danh sách thẻ ôn tập không có thẻ mới

### Requirement: Không tạo bù thẻ cho bài đã xong từ trước
Hệ thống MUST NOT tự tạo thẻ cho bài đã "Đã xong" từ trước khi có tính năng thẻ ôn tập hoặc nhờ nhập file sao lưu, khi người học chưa
làm lại bài. Người học làm lại bài đó hết, không bỏ qua câu nào, thì hệ thống SHALL tạo các thẻ còn thiếu như mọi lần xong bài.

#### Scenario: S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ
- **WHEN** trên máy bài học có từ "你好" đã "Đã xong" nhưng chưa có thẻ nào (tiến độ có từ trước khi có tính năng thẻ ôn tập, hoặc vừa
  nhập file sao lưu bản cũ), và người học mở app
- **THEN** danh sách thẻ ôn tập vẫn không có thẻ nào
- **AND** khi người học làm lại bài đó hết, không bỏ qua câu nào, danh sách thẻ ôn tập có thẻ "你好" chiều nghĩa và chiều nghe

### Requirement: Bài được đánh dấu xong nhờ kiểm tra vượt cấp
Hệ thống SHALL xét tạo thẻ chiều nghĩa và chiều nghe cho bài được đánh dấu "Đã xong" nhờ kiểm tra vượt cấp theo bảng sau:

| Tình huống | Tạo thẻ? |
|---|---|
| Người học chưa làm bài đó | Không |
| Người học mở bài đó ra làm hết, không bỏ qua câu nào | Có, cho các từ của đúng bài vừa làm (như làm lại bài đã xong) |

#### Scenario: S9.1-AC1 Bài được mở nhờ kiểm tra vượt cấp không tạo thẻ
- **WHEN** người học qua bài kiểm tra vượt cấp và các bài của chủ đề được đánh dấu "Đã xong" mà người học chưa làm bài nào
- **THEN** danh sách thẻ ôn tập không có thẻ cho các từ của những bài đó

#### Scenario: S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ
- **WHEN** các bài của một chủ đề được đánh dấu "Đã xong" nhờ kiểm tra vượt cấp, người học chưa có thẻ nào, rồi mở một bài trong đó có từ
  "你好" và làm hết, không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều nghĩa và chiều nghe ở trạng thái "mới"
- **AND** không có thẻ cho các từ chỉ có ở những bài khác của chủ đề đó

### Requirement: Không tạo trùng thẻ chiều nghĩa và chiều nghe
Hệ thống MUST NOT tạo thẻ trùng: mỗi từ có tối đa một thẻ cho mỗi chiều; thẻ đã có SHALL giữ nguyên trạng thái và lịch ôn.

#### Scenario: S9.1-AC1 Làm lại bài đã xong không tạo trùng thẻ
- **WHEN** người học đã có thẻ "你好" chiều nghĩa và chiều nghe từ lần xong bài trước, đã ôn thẻ chiều nghĩa một lần, rồi làm lại và xong bài đó
- **THEN** danh sách thẻ ôn tập vẫn chỉ có một thẻ "你好" chiều nghĩa và một thẻ "你好" chiều nghe
- **AND** thẻ "你好" chiều nghĩa giữ nguyên trạng thái và ngày ôn tiếp theo như trước khi làm lại bài

#### Scenario: S9.1-AC1 Từ đã có thẻ từ bài khác
- **WHEN** người học đã có thẻ "你" chiều nghĩa và chiều nghe từ bài thứ nhất, rồi xong bài thứ hai cũng có từ "你" và từ "好"
- **THEN** danh sách thẻ ôn tập có thêm thẻ chiều nghĩa và chiều nghe cho "好"
- **AND** vẫn chỉ có một thẻ "你" chiều nghĩa và một thẻ "你" chiều nghe

### Requirement: Không lưu được thẻ thì bài vẫn xong
Hệ thống SHALL vẫn ghi bài là "Đã xong" và hiện màn tổng kết như bình thường khi không lưu được thẻ ôn tập, MUST NOT hiện thông báo lỗi cho
người học, và MUST tạo các thẻ còn thiếu ở lần kế tiếp người học xong bài đó.

#### Scenario: S9.1-AC1 Không lưu được thẻ thì bài vẫn xong
- **WHEN** người học làm hết bài học có từ "你好" nhưng lưu thẻ ôn tập bị lỗi
- **THEN** màn tổng kết bài hiện bình thường, không có thông báo lỗi, và trên bản đồ bài đó là "Đã xong"
- **AND** danh sách thẻ ôn tập không có thẻ "你好"

#### Scenario: S9.1-AC1 Thẻ còn thiếu được tạo ở lần xong bài sau
- **WHEN** lần trước lưu thẻ bị lỗi, người học làm lại và xong bài có từ "你好", lần này lưu được
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều nghĩa và chiều nghe

### Requirement: Thẻ chiều viết chỉ tạo sau khi từ đã được viết theo nét
Thẻ chiều viết (nhìn nghĩa viết chữ) chỉ được tạo sau khi từ đó đã được viết theo nét ít nhất 1 lần.

Hệ thống SHALL tạo thẻ ôn tập chiều viết, ở trạng thái "mới", cho một từ khi cả hai điều kiện đúng: từ đã học xong (định nghĩa ở
Requirement "Từ đã học xong cho thẻ chiều viết") và mỗi chữ Hán của từ đã được viết xong (viết đúng hết các nét) ít nhất một lần trên
khung viết có gợi ý, ở màn luyện viết hoặc câu viết trong bài.

#### Scenario: S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết
- **WHEN** người học đã làm xong bài học có từ "人" (nên đã có thẻ "人" chiều nghĩa và chiều nghe), mở luyện viết chữ "人" và viết đúng hết các nét
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"

### Requirement: Từ đã học xong cho thẻ chiều viết
Hệ thống SHALL coi một từ là đã học xong (điều kiện thứ nhất của thẻ chiều viết) theo bảng sau:

| Tình huống của từ | Đã học xong? |
|---|---|
| Đã có thẻ chiều nghĩa | Có |
| Đang làm xong bài học thường chứa từ | Có |
| Chỉ ở bài được đánh dấu xong nhờ vượt cấp, chưa làm | Không |
| Bài chứa từ đã xong, chưa có thẻ chiều nghĩa (lưu lỗi, tiến độ cũ) | Không, tới lần xong bài sau |

#### Scenario: S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết
- **WHEN** bài có từ "人" chỉ được đánh dấu "Đã xong" nhờ kiểm tra vượt cấp, người học chưa làm bài đó, rồi luyện viết xong chữ "人"
- **THEN** danh sách thẻ ôn tập không có thẻ nào của "人"

### Requirement: Câu viết trong bài tính ngay trong lượt làm bài
Hệ thống SHALL tính lần viết xong chữ ở câu viết trong bài cho thẻ chiều viết ngay khi bài đó thành "Đã xong" trong cùng lượt làm bài.

#### Scenario: S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều
- **WHEN** người học mới, chưa có thẻ nào, chưa từng viết chữ nào, làm hết bài học có câu viết chữ "人" (từ "人"), viết đúng hết các nét ở câu
  đó và không bỏ qua câu nào
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết, cả ba ở trạng thái "mới"

### Requirement: Khi nào tạo thẻ chiều viết
Hệ thống SHALL tạo thẻ chiều viết lúc điều kiện thứ hai trong hai điều kiện (học xong từ, viết xong mọi chữ của từ) trở thành đúng:

| Tình huống | Thẻ chiều viết |
|---|---|
| Từ đã học xong, chưa viết xong đủ mọi chữ của từ | Chưa tạo |
| Từ đã học xong, vừa viết xong chữ cuối cùng còn thiếu của từ | Tạo ngay lúc viết xong |
| Đã viết xong mọi chữ của từ, chưa học xong từ | Chưa tạo; tạo khi người học làm xong bài chứa từ |

#### Scenario: S9.1-AC2 Viết xong ở câu viết trong bài cũng tính
- **WHEN** người học đã làm xong bài học có từ "人" (nên đã có thẻ "人" chiều nghĩa và chiều nghe), gặp câu viết chữ "人" trong một bài khác và
  viết đúng hết các nét
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết

#### Scenario: S9.1-AC2 Viết trước rồi học xong sau
- **WHEN** người học viết xong chữ "人" trên màn luyện viết khi chưa có thẻ nào của "人", rồi sau đó xong một bài học có từ "人"
- **THEN** ngay sau khi viết xong, danh sách thẻ ôn tập chưa có thẻ nào của "人"
- **AND** sau khi xong bài, danh sách thẻ ôn tập có thẻ "人" chiều nghĩa, chiều nghe và chiều viết

#### Scenario: S9.1-AC2 Từ nhiều chữ cần viết xong mọi chữ
- **WHEN** người học đã làm xong bài học có từ "你好" (nên đã có thẻ "你好" chiều nghĩa và chiều nghe), viết xong chữ "你" nhưng chưa viết chữ "好"
- **THEN** danh sách thẻ ôn tập không có thẻ "你好" chiều viết
- **AND** khi người học viết xong chữ "好" ở một lần sau, danh sách thẻ ôn tập có thẻ "你好" chiều viết

### Requirement: Lần viết nào được tính là đã viết theo nét
Hệ thống SHALL ghi nhận lần viết xong cho từng chữ, dùng chung cho mọi từ chứa chữ đó, và chỉ tính lần viết theo bảng sau:

| Lần viết | Tính là đã viết? |
|---|---|
| Viết đúng hết các nét trên khung có gợi ý (màn luyện viết hoặc câu viết trong bài) | Có |
| Viết dở (chưa đủ nét) rồi thoát màn luyện viết hoặc thoát bài | Không |
| Viết xong ở chế độ không gợi ý (S6.3) | Không |
| Viết xong trước khi có tính năng thẻ ôn tập | Không (app chưa ghi nhận; viết lại một lần) |

#### Scenario: S9.1-AC2 Chữ đã viết dùng chung cho các từ
- **WHEN** người học đã viết xong chữ "你" và chữ "好" trên màn luyện viết, rồi xong một bài học có từ "你好"
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều viết

#### Scenario: S9.1-AC2 Viết dở không tính
- **WHEN** người học đã làm xong bài học có từ "人" (nên đã có thẻ "人" chiều nghĩa và chiều nghe), viết đúng nét đầu của chữ "人" rồi thoát
  màn luyện viết
- **THEN** danh sách thẻ ôn tập không có thẻ "人" chiều viết

#### Scenario: S9.1-AC2 Viết không gợi ý không tính
- **WHEN** (kiểm ở tầng quy tắc, không dựng được trên app thật vì theo S6.3 chế độ không gợi ý chỉ mở sau khi đã viết xong có gợi ý) từ "人"
  đã học xong, chữ "人" chưa có lần viết xong nào trên khung có gợi ý, và có một lần viết xong chữ "人" ở chế độ không gợi ý
- **THEN** quy tắc tạo thẻ cho kết quả: không có thẻ "人" chiều viết

### Requirement: Không tạo trùng hoặc tạo sai thẻ chiều viết
Hệ thống MUST NOT tạo thêm thẻ chiều viết cho từ đã có thẻ chiều viết (thẻ cũ giữ nguyên trạng thái và lịch ôn), và MUST NOT tạo thẻ chiều
viết cho từ có chữ không có dữ liệu nét.

#### Scenario: S9.1-AC2 Viết lại không tạo trùng thẻ chiều viết
- **WHEN** người học đã có thẻ "人" chiều viết và viết xong chữ "人" thêm một lần
- **THEN** danh sách thẻ ôn tập vẫn chỉ có một thẻ "人" chiều viết, giữ nguyên trạng thái và ngày ôn tiếp theo

#### Scenario: S9.1-AC2 Từ có chữ không có dữ liệu nét
- **WHEN** người học xong một bài học có một từ mà một chữ của từ không có dữ liệu nét
- **THEN** danh sách thẻ ôn tập có thẻ chiều nghĩa và chiều nghe của từ đó
- **AND** không có thẻ chiều viết của từ đó

### Requirement: Không lưu được thẻ chiều viết thì vẫn báo viết xong
Hệ thống SHALL vẫn báo đã viết xong chữ như bình thường khi không lưu được lần viết hoặc thẻ chiều viết, và MUST NOT hiện thông báo lỗi.
Thẻ chiều viết còn thiếu MUST được tạo ở lần kế tiếp có một trong hai việc sau, nếu lúc đó đủ hai điều kiện: người học viết xong một chữ
của từ trên khung có gợi ý, hoặc người học làm xong một bài học chứa từ. Lần viết không lưu được thì không được tính; người học cần viết
xong chữ đó thêm một lần.

#### Scenario: S9.1-AC2 Viết xong chữ vẫn báo xong khi không lưu được
- **WHEN** người học đã làm xong bài học có từ "人" (nên đã có thẻ "人" chiều nghĩa và chiều nghe), viết xong chữ "人" nhưng lưu bị lỗi
- **THEN** màn vẫn báo đã viết xong chữ như bình thường, không có thông báo lỗi
- **AND** danh sách thẻ ôn tập không có thẻ "人" chiều viết

#### Scenario: S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau
- **WHEN** lần viết xong chữ "人" trước bị lỗi lưu, người học (đã có thẻ "人" chiều nghĩa và chiều nghe) viết xong chữ "人" thêm một lần và lần
  này lưu được
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"

#### Scenario: S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần xong bài sau
- **WHEN** chữ "人" đã được ghi nhận viết xong, từ "人" đã có thẻ chiều nghĩa và chiều nghe, nhưng lưu thẻ "人" chiều viết bị lỗi; sau đó người
  học làm lại và xong bài học có từ "人", lần này lưu được
- **THEN** danh sách thẻ ôn tập có thẻ "人" chiều viết ở trạng thái "mới"
