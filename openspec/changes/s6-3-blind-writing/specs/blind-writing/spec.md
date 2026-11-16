## ADDED Requirements

Điều kiện tiên quyết: khung viết, nhận nét, báo sai nét và cách xoá nét sai là của S6.2; spec này chỉ thêm chế độ không gợi ý và cách chấm. Mỗi lượt viết không gợi ý là đúng MỘT chữ Hán, như màn luyện viết của S6.2 (S6.2 cấm luyện lần lượt nhiều chữ trong một màn). Chữ không có dữ liệu nét thì không có chế độ không gợi ý (giống S6.1, S6.2). Việc chấm chỉ áp dụng ở chế độ không gợi ý; chế độ có gợi ý (S6.2) vẫn không ghi gì.

### Requirement: Khung viết không hiện nét mờ
Khung viết ở chế độ không gợi ý SHALL không có nét mờ của cả chữ, và MUST NOT làm nổi bật nét đúng, kể cả khi sai 3 lần liên tiếp trở lên ở một nét. Khác khung có gợi ý (S6.2):

| Trên khung | Có gợi ý | Không gợi ý |
|---|---|---|
| Nét mờ cả chữ | Có | Không |
| Nổi bật nét đúng sau 3 lần sai | Có | Không |
| Báo sai, xoá nét sai | Có | Có |
| Ô lưới (nếu có) | Có | Có |

#### Scenario: S6.3-AC1 Khung viết không có nét mờ của cả chữ
- **WHEN** người học mở chữ cần viết ở chế độ không gợi ý
- **THEN** khung viết không có nét mờ của chữ, không có nét nào của chữ hiện sẵn
- **AND** ô lưới hoặc đường kẻ của khung (nếu có) vẫn hiện

#### Scenario: S6.3-AC1 Sai 3 lần liên tiếp không làm nổi bật nét đúng
- **WHEN** người học viết sai 3 lần liên tiếp ở một nét, rồi sai thêm lần thứ 4 ở nét đó
- **THEN** sau mỗi lần sai, khung viết không làm nổi bật nét đúng đó và không hiện nét mờ nào

#### Scenario: S6.3-AC1 Sai nét vẫn báo ngay nhưng không hiện nét đúng
- **WHEN** người học viết một nét không đúng nét kế tiếp ở chế độ không gợi ý
- **THEN** màn hiện thông báo viết sai nét ngay sau khi thả tay hoặc nhả chuột, nét sai bị xoá khỏi khung
- **AND** khung không hiện nét đúng

### Requirement: Vào chế độ không gợi ý sau khi viết xong có gợi ý
Hệ thống SHALL hiện nút "Thử viết không gợi ý" trên màn báo đã viết xong chữ ở khung viết có gợi ý (S6.2). Bấm nút MUST mở lại cùng chữ đó ở chế độ không gợi ý. Chữ không có khung viết (thiếu dữ liệu nét) MUST NOT có nút này. Nút "Thử viết không gợi ý" chỉ có ở màn báo xong của khung CÓ gợi ý; màn báo xong của khung không gợi ý SHALL có nút "Viết lại không gợi ý" mở lượt mới cùng chữ, trống.

#### Scenario: S6.3-AC1 Có nút thử viết không gợi ý sau khi viết xong
- **WHEN** người học vừa viết xong chữ có dữ liệu nét ở khung có gợi ý
- **THEN** màn báo viết xong có nút "Thử viết không gợi ý"

#### Scenario: S6.3-AC1 Bấm nút thì vào khung không gợi ý
- **WHEN** người học bấm "Thử viết không gợi ý"
- **THEN** khung viết của cùng chữ hiện ở chế độ không gợi ý, trống, chưa có nét nào

#### Scenario: S6.3-AC1 Chữ không có dữ liệu nét thì không có chế độ không gợi ý
- **WHEN** người học mở chữ không có dữ liệu nét
- **THEN** màn không có nút "Thử viết không gợi ý" và không hiện khung viết

### Requirement: Kết quả viết được dùng để chấm thẻ SRS chiều viết
Hệ thống SHALL quy kết quả viết thành một mức chấm, đơn vị đếm là LẦN sai nét (S6.2 AC2); người học MUST NOT phải tự chọn mức ở màn viết.

| Kết quả viết | Mức chấm |
|---|---|
| Viết xong, 0 lần sai nét | Dễ |
| Viết xong, 1 đến 2 lần sai nét | Được |
| Viết xong, từ 3 lần sai nét trở lên | Khó |
| Bỏ dở (đã thả ít nhất một nét, không tính chạm một điểm hoặc nét quá ngắn, rồi rời chữ chưa xong) | Quên |

#### Scenario: S6.3-AC2 Viết đúng hết thì chấm Dễ
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong chữ ở chế độ không gợi ý với 0 lần sai nét
- **THEN** mức chấm ghi vào thẻ chiều viết của từ một chữ đó là "Dễ"

#### Scenario: S6.3-AC2 Sai 1 đến 2 lần thì chấm Được
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong chữ ở chế độ không gợi ý với 1 lần sai nét, hoặc với 2 lần sai nét
- **THEN** mức chấm ghi vào thẻ chiều viết của từ một chữ đó là "Được" trong cả hai trường hợp

#### Scenario: S6.3-AC2 Một nét sai hai lần tính hai lần
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết sai cùng một nét 2 lần rồi viết đúng và viết xong chữ, không sai nét nào khác
- **THEN** mức chấm ghi vào thẻ là "Được"
- **AND** nếu nét đó sai 3 lần rồi viết xong chữ thì mức chấm ghi vào thẻ là "Khó"

#### Scenario: S6.3-AC2 Sai từ 3 lần thì chấm Khó
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong chữ ở chế độ không gợi ý với đúng 3 lần sai nét, hoặc với nhiều hơn 3 lần
- **THEN** mức chấm ghi vào thẻ chiều viết của từ một chữ đó là "Khó" trong cả hai trường hợp

### Requirement: Thẻ nhận mức chấm là thẻ của từ một chữ
Thẻ chiều viết ở S9.1 ở mức TỪ. Hệ thống SHALL chỉ ghi mức vào thẻ chiều viết của từ X khi chữ vừa viết chính là một từ MỘT chữ X có thẻ đó. Hệ thống MUST NOT ghi vào thẻ nào, và MUST NOT tạo thẻ, khi chữ chỉ là thành phần của từ nhiều chữ (ví dụ 爸 trong 爸爸) hoặc chưa có thẻ; màn báo xong bình thường. Từ nhiều chữ chưa được S6.3 chấm cho tới khi S9.1 hoặc story khác định nghĩa việc gom chữ vào thẻ từ.

#### Scenario: S6.3-AC2 Chữ không có thẻ chiều viết riêng thì bỏ qua
- **WHEN** người học viết xong ở chế độ không gợi ý một chữ không có thẻ chiều viết riêng (chưa có thẻ, hoặc chỉ là thành phần của từ nhiều chữ, ví dụ 爸 trong 爸爸)
- **THEN** kết quả không được ghi vào thẻ nào, kể cả thẻ của từ nhiều chữ chứa chữ đó, và không tạo thẻ mới (lần viết này không tính là lần viết đầu của S9.1)
- **AND** màn báo viết xong như bình thường

#### Scenario: S6.3-AC2 Từ một chữ có thẻ thì ghi đúng thẻ của từ đó
- **WHEN** người học viết xong chữ "好" ở chế độ không gợi ý, và "好" là một từ một chữ có thẻ chiều viết
- **THEN** mức chấm được ghi vào thẻ chiều viết của từ "好", không ghi vào thẻ nào khác

#### Scenario: S6.3-AC2 Màn báo xong của khung có gợi ý không chấm
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong chữ ở khung có gợi ý (S6.2) rồi thoát màn
- **THEN** không có mức chấm nào được ghi vào thẻ

### Requirement: Khi nào chấm và chấm mấy lần
Hệ thống SHALL chấm đúng một lần cho mỗi lượt mở một chữ ở chế độ không gợi ý, khi viết xong hoặc bỏ dở, và chỉ ghi khi chữ là từ một chữ có thẻ chiều viết. Hệ thống MUST NOT chấm khi đóng tab, tắt app, hoặc rời khi chưa thả nét nào (chạm một điểm, nét quá ngắn không tính là nét). Mỗi lần mở lại cùng chữ, kể cả bằng nút "Viết lại không gợi ý", là lượt mới.

#### Scenario: S6.3-AC2 Bỏ dở thì chấm Quên
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học đã thả ít nhất một nét (đúng hoặc sai) rồi đổi sang chữ khác hoặc thoát màn viết khi chưa viết xong
- **THEN** mức chấm ghi vào thẻ chiều viết của từ một chữ đó là "Quên"

#### Scenario: S6.3-AC2 Bỏ dở chữ không có thẻ chiều viết riêng thì không ghi gì
- **GIVEN** chữ đang viết chỉ là thành phần của từ nhiều chữ (ví dụ 爸 trong 爸爸) hoặc chưa có thẻ chiều viết
- **WHEN** người học đã thả ít nhất một nét rồi thoát màn viết khi chưa viết xong
- **THEN** không có mức chấm nào được ghi vào thẻ nào và không tạo thẻ mới

#### Scenario: S6.3-AC2 Rời khi chưa viết nét nào thì không chấm
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học mở chữ ở chế độ không gợi ý rồi thoát màn mà chưa thả nét nào
- **THEN** thẻ chiều viết của từ một chữ đó không bị ghi mức chấm mới

#### Scenario: S6.3-AC2 Chạm một điểm hoặc nét quá ngắn không tính là đã viết nét
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học chỉ chạm hoặc nhấp một điểm, hoặc kéo một nét quá ngắn để coi là một nét, rồi thoát màn viết
- **THEN** thẻ chiều viết của từ một chữ đó không bị ghi mức chấm mới (không chấm "Quên")

#### Scenario: S6.3-AC2 Đóng tab hoặc tắt app khi đang viết thì không chấm
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học đang viết dở rồi đóng tab hoặc tắt app
- **THEN** thẻ chiều viết của từ một chữ đó không bị ghi mức chấm mới

#### Scenario: S6.3-AC2 Mỗi lượt chấm đúng một lần
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong chữ rồi thoát màn viết
- **THEN** thẻ chỉ nhận một mức chấm của lượt đó, không bị chấm thêm "Quên" khi thoát

#### Scenario: S6.3-AC2 Viết lại cùng chữ là lượt mới
- **GIVEN** "好" là một từ một chữ có thẻ chiều viết
- **WHEN** người học viết xong "好" ở chế độ không gợi ý với mức "Khó", rồi bấm "Viết lại không gợi ý" ở màn báo xong
- **THEN** khung viết của "好" hiện lại ở chế độ không gợi ý, trống, chưa có nét nào
- **AND** khi người học viết xong lượt này với 0 lần sai, thẻ nhận đúng một mức chấm mới là "Dễ" của lượt sau, mức "Khó" của lượt trước không bị cộng dồn

#### Scenario: S6.3-AC2 Mức chấm ghi được khi offline và còn sau khi mở lại app
- **GIVEN** chữ đang viết là một từ một chữ có thẻ chiều viết
- **WHEN** người học đang offline viết xong chữ đó ở chế độ không gợi ý với mức "Được", rồi đóng và mở lại app
- **THEN** thẻ chiều viết của từ một chữ đó vẫn mang mức "Được" của lần viết đó

#### Scenario: S6.3-AC2 Màn viết không hiện lựa chọn mức
- **WHEN** người học viết xong chữ ở màn viết không gợi ý
- **THEN** màn viết không hiện lựa chọn Quên / Khó / Được / Dễ để người học bấm
