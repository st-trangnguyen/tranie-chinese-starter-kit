## ADDED Requirements

Hội thoại ví dụ dùng trong các Scenario (4 lượt, bốn câu riêng, hợp lệ với mọi luật hội thoại của S10.6 kể cả luật giọng theo vai):

| Lượt | Vai | Chữ Hán | Giọng của câu |
|---|---|---|---|
| 1 | A | "你好！" | Nữ |
| 2 | B | "你好！" (câu khác với lượt 1) | Nam |
| 3 | A | "你叫什么名字？" | Nữ |
| 4 | B | "我叫小明。" | Nam |

### Requirement: App phát lời vai A, người học ghi âm lời vai B
Hệ thống SHALL chạy câu "đóng vai" theo từng lượt lời của hội thoại hai vai, mỗi lúc thêm một lượt; người học MUST luôn là vai B.
Audio MUST NOT tự phát khi lượt hiện ra.

| Lượt | Màn hiện | Đi tiếp khi nào |
|---|---|---|
| Vai A | Lời A, nút "Nghe lời A" | "Lượt tiếp" bấm được ngay |
| Vai B (bạn) | Lời B, khối nói của E5 | "Lượt tiếp" hiện sau khi chọn mức |
| Lượt cuối | Như trên | Nút "Kết thúc hội thoại" thay "Lượt tiếp" |

#### Scenario: S10.7-AC1 Câu đóng vai mở ra ở lượt 1
- **WHEN** câu "đóng vai" với hội thoại ví dụ vừa hiện ra
- **THEN** màn hiện dòng chữ "Bạn đóng vai B"
- **AND** màn hiện lượt 1 với nhãn vai "Vai A", "Lượt 1 / 4", chữ "你好！" và nghĩa tiếng Việt
- **AND** chưa hiện lượt 2, 3, 4

#### Scenario: S10.7-AC1 Lượt vai A có nút nghe, không có ghi âm
- **WHEN** màn đang ở lượt 1 (vai A)
- **THEN** có nút "Nghe lời A" và nút "Lượt tiếp" bấm được
- **AND** không có nút "Ghi âm" và không có ba nút "Chưa đúng", "Gần đúng", "Đúng"

#### Scenario: S10.7-AC1 Lượt vai A không tự phát
- **WHEN** lượt 1 (vai A) vừa hiện ra và người học chưa bấm gì
- **THEN** không có audio nào đang phát

#### Scenario: S10.7-AC1 Bấm Nghe lời A thì phát lời A
- **WHEN** người học bấm "Nghe lời A" ở lượt 1
- **THEN** audio của câu "你好！" của lượt 1 (giọng nữ) phát một lần từ đầu

#### Scenario: S10.7-AC1 Nghe lời A nhiều lần
- **WHEN** người học bấm "Nghe lời A" 3 lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** lời A phát đủ 3 lần
- **AND** nút "Nghe lời A" vẫn bấm được

#### Scenario: S10.7-AC1 Lời A không phát được
- **WHEN** người học bấm "Nghe lời A" nhưng audio không phát được
- **THEN** màn hiện thông báo "Không phát được audio."
- **AND** nút "Lượt tiếp" vẫn bấm được

#### Scenario: S10.7-AC2 Mẫu lời B không phát được
- **WHEN** ở lượt 2, người học bấm "Nghe mẫu" nhưng audio không phát được
- **THEN** màn hiện thông báo "Không phát được audio."
- **AND** nút "Ghi âm" và ba nút tự đánh giá vẫn bấm được

#### Scenario: S10.7-AC1 Thông báo lỗi audio mất khi lần phát sau phát được
- **WHEN** ở lượt 2, màn đang hiện "Không phát được audio." vì "Nghe mẫu", người học bấm "Nghe lời A" của lượt 1 và audio đó phát được
- **THEN** thông báo "Không phát được audio." không còn trên màn

#### Scenario: S10.7-AC1 Sang lượt khác thì thông báo lỗi audio không còn
- **WHEN** ở lượt 1, màn đang hiện "Không phát được audio." vì "Nghe lời A", người học bấm "Lượt tiếp"
- **THEN** màn hiện lượt 2 và thông báo "Không phát được audio." không còn trên màn

#### Scenario: S10.7-AC1 Đã tải audio của chủ đề thì nghe lời A khi không có mạng
- **WHEN** audio của chủ đề chứa câu đóng vai đã được tải về máy, thiết bị không có mạng, người học bấm "Nghe lời A" ở lượt 1
- **THEN** audio của câu "你好！" phát được

#### Scenario: S10.7-AC1 Sang lượt vai B
- **WHEN** người học bấm "Lượt tiếp" ở lượt 1
- **THEN** màn hiện lượt 2 với nhãn vai "Vai B (bạn)", "Lượt 2 / 4", chữ "你好！" và nghĩa tiếng Việt
- **AND** lượt 1 vẫn hiện phía trên và không còn nút "Lượt tiếp"
- **AND** có nút "Ghi âm" và ba nút "Chưa đúng", "Gần đúng", "Đúng"

#### Scenario: S10.7-AC1 Lượt vai B chưa chọn mức thì chưa đi tiếp
- **WHEN** màn đang ở lượt 2 (vai B) và người học chưa chọn mức
- **THEN** không có nút "Lượt tiếp"

#### Scenario: S10.7-AC1 Chọn mức ở lượt vai B thì đi tiếp được
- **WHEN** ở lượt 2 (vai B), người học chọn "Đúng"
- **THEN** màn cho biết đã chọn "Đúng" bằng chữ
- **AND** có nút "Lượt tiếp"
- **AND** màn chưa báo kết quả của cả câu và chưa có nút "Tiếp tục" của bài

#### Scenario: S10.7-AC1 Lượt cuối có nút Kết thúc hội thoại
- **WHEN** người học đi tới lượt 4 (vai B, lượt cuối) và chọn một mức
- **THEN** có nút "Kết thúc hội thoại", không có nút "Lượt tiếp"

#### Scenario: S10.7-AC1 Lượt cuối là vai A
- **WHEN** hội thoại có 3 lượt A, B, A và người học đi tới lượt 3
- **THEN** có nút "Nghe lời A" và nút "Kết thúc hội thoại" bấm được ngay

#### Scenario: S10.7-AC1 Thanh tiến độ của bài không đổi khi đi qua các lượt
- **WHEN** câu đóng vai là câu 2 của một bài 5 câu và người học đi từ lượt 1 tới lượt 4
- **THEN** thanh tiến độ của bài vẫn cho biết "Câu 2 / 5"

#### Scenario: S10.7-AC1 Lượt mới nhận focus
- **WHEN** người học bấm "Lượt tiếp" bằng bàn phím
- **THEN** focus bàn phím nằm ở dòng "Lượt k / n" của lượt mới
- **AND** trình đọc màn hình đọc được vai và lời của lượt mới

### Requirement: Mỗi lượt ghi rõ vai và lời
Hệ thống SHALL ghi cho mỗi lượt nhãn vai bằng chữ ("Vai A" hoặc "Vai B (bạn)": cùng nhãn "Vai A"/"Vai B" của câu hội thoại S10.6, thêm "(bạn)"
sau vai người học) và số lượt ("Lượt k / n"), không chỉ bằng màu, cùng chữ Hán và nghĩa tiếng Việt của lời. Pinyin MUST hiện khi "Hiện pinyin" trong Cài đặt
đang bật và MUST NOT hiện khi tắt. Các lượt đã qua MUST vẫn hiện phía trên lượt đang làm.

#### Scenario: S10.7-AC1 Tắt pinyin thì lời không có pinyin
- **WHEN** "Hiện pinyin" trong Cài đặt đang tắt và câu "đóng vai" hiện ra
- **THEN** mỗi lượt hiện chữ Hán và nghĩa tiếng Việt, không hiện pinyin

#### Scenario: S10.7-AC1 Bật pinyin thì lời có pinyin
- **WHEN** "Hiện pinyin" trong Cài đặt đang bật và câu "đóng vai" hiện ra
- **THEN** mỗi lượt hiện chữ Hán, pinyin và nghĩa tiếng Việt

### Requirement: Nút nghe của mỗi lượt có tên kèm số lượt
Vì nhiều lượt cùng có nút "Nghe lời A" hoặc "Nghe mẫu", tên trình đọc màn hình đọc cho mỗi nút đó SHALL kèm số lượt (ví dụ "Nghe lời A,
lượt 3"); chữ hiển thị trên nút MUST giữ nguyên "Nghe lời A"/"Nghe mẫu".

#### Scenario: S10.7-AC1 Nút nghe của mỗi lượt được đọc kèm số lượt
- **WHEN** câu đóng vai với hội thoại ví dụ đã được chấm
- **THEN** trình đọc màn hình đọc bốn nút nghe là "Nghe lời A, lượt 1", "Nghe mẫu, lượt 2", "Nghe lời A, lượt 3", "Nghe mẫu, lượt 4"
- **AND** chữ hiển thị trên các nút vẫn là "Nghe lời A" và "Nghe mẫu"

### Requirement: Lượt đã qua và câu đã chấm vẫn nghe lại được
Ở lượt đã qua và sau khi chấm, hệ thống SHALL giữ nút nghe bấm được (S4.4) và MUST khóa các nút còn lại.

| Nút | Lượt đã qua, hoặc đã chấm |
|---|---|
| "Nghe lời A", "Nghe mẫu" | Bấm được |
| "Ghi âm", "Nghe bản ghi" | Không còn |
| Tự đánh giá | Khóa, vẫn hiện mức đã chọn |
| "Lượt tiếp", "Kết thúc hội thoại" | Không còn |

#### Scenario: S10.7-AC1 Nghe lại lời A của lượt trước khi đang ở lượt B
- **WHEN** màn đang ở lượt 2 (vai B) và người học bấm "Nghe lời A" của lượt 1
- **THEN** audio của câu "你好！" của lượt 1 (giọng nữ) phát một lần từ đầu
- **AND** lượt 2 vẫn là lượt đang làm

#### Scenario: S10.7-AC1 Lượt B đã qua chỉ còn nghe mẫu
- **WHEN** người học đã chọn mức ở lượt 2 và đã sang lượt 3
- **THEN** lượt 2 có nút "Nghe mẫu" bấm được và phát câu "你好！" của lượt 2 (giọng nam)
- **AND** lượt 2 không có nút "Ghi âm", không có nút "Nghe bản ghi"
- **AND** ba nút tự đánh giá của lượt 2 không bấm được và vẫn cho biết mức đã chọn bằng chữ

#### Scenario: S10.7-AC1 Sau khi chấm vẫn nghe lại được
- **WHEN** câu đóng vai đã được chấm
- **THEN** người học bấm được "Nghe lời A" của lượt 1, lượt 3 và "Nghe mẫu" của lượt 2, lượt 4, mỗi nút phát đúng lời của lượt đó

#### Scenario: S10.7-AC1 Đã chấm thì không đổi được
- **WHEN** câu đóng vai đã được chấm
- **THEN** không lượt nào còn nút "Ghi âm" hay "Nghe bản ghi"
- **AND** ba nút tự đánh giá của mọi lượt B không bấm được
- **AND** không còn nút "Lượt tiếp" hay "Kết thúc hội thoại"
- **AND** kết quả câu vẫn như lúc chấm

### Requirement: Một luồng âm, dừng audio và ghi âm khi đi tiếp
Hệ thống SHALL chỉ phát một audio mỗi lúc. "Đi tiếp" là "Lượt tiếp" hoặc "Kết thúc hội thoại".

| Đang | Bấm | Kết quả |
|---|---|---|
| Phát audio | Nút nghe khác | Audio cũ dừng, audio mới phát |
| Phát audio | "Ghi âm" | Audio dừng, bắt đầu ghi |
| Phát audio | Đi tiếp | Audio dừng |
| Ghi âm | Đi tiếp | Ghi dừng, nhả micro, bỏ bản ghi (như S5.1) |

#### Scenario: S10.7-AC1 Bấm nghe khi audio khác đang phát
- **WHEN** ở lượt 2, "Nghe mẫu" đang phát và người học bấm "Nghe lời A" của lượt 1
- **THEN** audio "Nghe mẫu" dừng và lời A của lượt 1 phát từ đầu, không có hai luồng âm cùng lúc

#### Scenario: S10.7-AC1 Bấm Lượt tiếp khi lời A đang phát thì audio dừng
- **WHEN** lời A của lượt 1 đang phát và người học bấm "Lượt tiếp"
- **THEN** audio dừng và màn hiện lượt 2
- **AND** không có audio nào đang phát

#### Scenario: S10.7-AC1 Bấm Kết thúc hội thoại khi audio đang phát thì audio dừng
- **WHEN** ở lượt 4 đã chọn mức, "Nghe mẫu" đang phát và người học bấm "Kết thúc hội thoại"
- **THEN** audio dừng và màn báo kết quả câu

#### Scenario: S10.7-AC2 Bấm Lượt tiếp khi đang ghi âm thì dừng ghi và bỏ bản ghi
- **WHEN** ở lượt 2, người học đã chọn mức, đang ghi âm và bấm "Lượt tiếp"
- **THEN** việc ghi âm dừng và micro không còn được dùng
- **AND** màn hiện lượt 3, lượt 2 không có nút "Nghe bản ghi"

#### Scenario: S10.7-AC2 Bấm Kết thúc hội thoại khi đang ghi âm thì dừng ghi
- **WHEN** ở lượt 4, người học đã chọn mức, đang ghi âm và bấm "Kết thúc hội thoại"
- **THEN** việc ghi âm dừng và micro không còn được dùng
- **AND** màn báo kết quả câu

### Requirement: Audio câu đóng vai không phát được
Như S10.6, khi audio của "Nghe lời A" hoặc "Nghe mẫu" không phát được, hệ thống SHALL hiện "Không phát được audio." trong vùng thông
báo trình đọc màn hình tự đọc; người học MUST vẫn thao tác tiếp được. Thông báo MUST mất khi lần phát kế tiếp phát được, hoặc khi bấm
"Lượt tiếp", "Kết thúc hội thoại" hay "Tiếp tục".

#### Scenario: S10.7-AC1 Kết thúc hội thoại thì thông báo lỗi audio không còn
- **WHEN** ở lượt 4 đã chọn mức, màn đang hiện "Không phát được audio." vì "Nghe mẫu", người học bấm "Kết thúc hội thoại"
- **THEN** màn báo kết quả câu và thông báo "Không phát được audio." không còn trên màn

### Requirement: Audio câu đóng vai phát ở tốc độ thường
Hệ thống SHALL phát "Nghe lời A" và "Nghe mẫu" của câu đóng vai ở tốc độ 1x, bất kể tốc độ audio mặc định trong Cài đặt, như "Nghe mẫu" của câu
"nói" (E5). Câu đóng vai MUST NOT có công tắc "Nghe chậm".

#### Scenario: S10.7-AC1 Tốc độ mặc định Chậm vẫn phát lời A ở 1x
- **WHEN** tốc độ audio mặc định trong Cài đặt là "Chậm (0.75x)" và người học bấm "Nghe lời A" ở lượt 1
- **THEN** lời A phát ở tốc độ 1x

#### Scenario: S10.7-AC2 Tốc độ mặc định Chậm vẫn phát mẫu lời B ở 1x
- **WHEN** tốc độ audio mặc định trong Cài đặt là "Chậm (0.75x)" và người học bấm "Nghe mẫu" ở lượt 2
- **THEN** lời B phát ở tốc độ 1x

#### Scenario: S10.7-AC1 Câu đóng vai không có công tắc Nghe chậm
- **WHEN** câu "đóng vai" hiện ra
- **THEN** màn không có công tắc "Nghe chậm"

### Requirement: Câu đóng vai được chấm như một câu của bài
Hệ thống SHALL chấm câu "đóng vai" khi bấm "Kết thúc hội thoại", MUST tính nó là **một câu** trong điểm bài, báo kết quả cả câu và hiện
nút "Tiếp tục".

| Các lượt B | Kết quả câu | Giải thích |
|---|---|---|
| Đều "Đúng" | Đúng | Không |
| Có lượt chưa "Đúng" | Sai | Chữ, pinyin, nghĩa các lượt B chưa "Đúng", theo thứ tự |

#### Scenario: S10.7-AC1 Mọi lượt B Đúng thì câu đúng
- **WHEN** người học chọn "Đúng" ở lượt 2 và lượt 4 rồi bấm "Kết thúc hội thoại"
- **THEN** màn báo kết quả câu là "Đúng" và hiện nút "Tiếp tục", không hiện giải thích

#### Scenario: S10.7-AC1 Một lượt B chưa Đúng thì câu sai
- **WHEN** người học chọn "Đúng" ở lượt 2, "Gần đúng" ở lượt 4 rồi bấm "Kết thúc hội thoại"
- **THEN** màn báo kết quả câu là "Sai" và hiện nút "Tiếp tục"
- **AND** giải thích hiện chữ, pinyin, nghĩa của lời lượt 4 "我叫小明。", không hiện lời lượt 2

#### Scenario: S10.7-AC1 Giải thích luôn có pinyin
- **WHEN** "Hiện pinyin" trong Cài đặt đang tắt và câu đóng vai được chấm sai
- **THEN** giải thích vẫn hiện pinyin của các lượt B không được chọn "Đúng"

#### Scenario: S10.7-AC1 Câu đóng vai cộng chung với các câu khác
- **WHEN** một bài có 2 câu: câu 1 trả lời đúng, câu 2 là câu đóng vai có một lượt B chọn "Chưa đúng"
- **THEN** màn tổng kết hiện điểm "50%", "Đúng 1 / 2 câu" và "Sai 1 câu"

#### Scenario: S10.7-AC1 Câu đóng vai sai trong bài kiểm tra cuối chủ đề không tạo thẻ ôn tập
- **WHEN** người học chưa có thẻ ôn tập nào, làm xong bài kiểm tra cuối chủ đề có một câu đóng vai bị chấm sai và mọi câu khác đúng
- **THEN** danh sách thẻ ôn tập không có thẻ nào

### Requirement: Thoát giữa câu đóng vai thì làm lại từ lượt đầu
Hệ thống SHALL, khi người học thoát bài lúc đang ở giữa câu "đóng vai" rồi học tiếp, mở lại đúng câu đó và MUST bắt đầu lại từ lượt 1, không còn
mức đã chọn và không còn bản ghi nào của lần trước.

#### Scenario: S10.7-AC1 Thoát giữa câu đóng vai rồi học tiếp
- **WHEN** câu đóng vai là câu 3 của bài, người học đã chọn mức ở lượt 2 và đang ở lượt 3 thì thoát bài, rồi mở lại bài và học tiếp
- **THEN** màn hiện câu 3 ở lượt 1, chưa có lượt nào khác
- **AND** chưa có bản ghi nào và chưa có mức nào được chọn

### Requirement: Dùng lại phần ghi âm, so sánh và đánh giá của E5
Hệ thống SHALL cho mỗi lượt vai B các hành vi của câu "nói" ở E5, lời B là câu cần nói. Bản ghi MUST mất khi sang lượt khác hoặc rời bài
và MUST NOT được lưu vào máy.

| Phần của E5 | Ở lượt vai B |
|---|---|
| Ghi âm, so sánh (S5.1) | "Ghi âm"/"Dừng", "Nghe mẫu" (lời B), "Nghe bản ghi" |
| Tự đánh giá (S5.2) | Ba mức, không bắt buộc ghi âm |
| Chấm tự động (S5.3) | Khi có mạng và trình duyệt hỗ trợ |
| Không có mic (S5.4) | "Đọc to rồi tự chấm", giữ cho các lượt B sau trong bài |

#### Scenario: S10.7-AC2 Ghi âm lời vai B
- **WHEN** ở lượt 2 (vai B), người học bấm "Ghi âm"
- **THEN** màn báo "Đang ghi âm" và nút đổi thành "Dừng"

#### Scenario: S10.7-AC2 Dừng ghi thì nghe lại được bản ghi
- **WHEN** ở lượt 2, người học đang ghi âm và bấm "Dừng"
- **THEN** nút đổi lại thành "Ghi âm"
- **AND** nút "Nghe bản ghi" bấm được và phát giọng người học vừa ghi

#### Scenario: S10.7-AC2 Nghe mẫu lời vai B
- **WHEN** ở lượt 2, người học bấm "Nghe mẫu"
- **THEN** audio của câu "你好！" của lượt 2 (giọng nam) phát một lần từ đầu

#### Scenario: S10.7-AC2 Chưa ghi thì chưa nghe được bản ghi
- **WHEN** lượt 2 vừa hiện ra
- **THEN** nút "Nghe mẫu" bấm được và nút "Nghe bản ghi" không bấm được

#### Scenario: S10.7-AC2 Bắt đầu ghi thì lời A đang nghe lại dừng
- **WHEN** ở lượt 2 (vai B), người học bấm "Nghe lời A" của lượt 1 và trong lúc lời A đang phát thì bấm "Ghi âm"
- **THEN** lời A dừng
- **AND** màn bắt đầu ghi âm

#### Scenario: S10.7-AC2 Bắt đầu ghi thì mẫu lời B đang phát dừng
- **WHEN** ở lượt 2, "Nghe mẫu" đang phát và người học bấm "Ghi âm"
- **THEN** audio mẫu dừng
- **AND** màn bắt đầu ghi âm

#### Scenario: S10.7-AC2 Sang lượt khác thì bản ghi của lượt trước không còn
- **WHEN** người học ghi âm ở lượt 2, chọn mức, bấm "Lượt tiếp" qua lượt 3 rồi tới lượt 4
- **THEN** lượt 4 chưa có bản ghi và nút "Nghe bản ghi" không bấm được
- **AND** lượt 2 không còn nút "Nghe bản ghi"

#### Scenario: S10.7-AC2 Bản ghi không có trong dữ liệu lưu của máy
- **WHEN** người học ghi âm ở một lượt vai B rồi thoát bài
- **THEN** dữ liệu tiến độ lưu trên máy không chứa bản ghi nào

#### Scenario: S10.7-AC2 Tự chấm mà không ghi âm
- **WHEN** ở lượt 2, người học chưa ghi âm và chọn "Gần đúng"
- **THEN** màn cho biết đã chọn "Gần đúng" bằng chữ
- **AND** ba nút đánh giá của lượt 2 không bấm được nữa

#### Scenario: S10.7-AC2 Có mạng và hỗ trợ thì có chấm tự động
- **WHEN** lượt vai B hiện ra, thiết bị có mạng và trình duyệt hỗ trợ nhận diện giọng nói tiếng Trung
- **THEN** lượt đó có khu "Chấm tự động"

#### Scenario: S10.7-AC2 Không có mạng thì không có chấm tự động
- **WHEN** lượt vai B hiện ra khi thiết bị không có mạng
- **THEN** lượt đó không có khu "Chấm tự động"
- **AND** người học vẫn ghi âm, nghe lại và chọn mức được

#### Scenario: S10.7-AC2 Chấm tự động so với lời vai B
- **WHEN** ở lượt 4 (lời B "我叫小明。"), người học ghi âm xong và máy nhận được "我叫小名"
- **THEN** khu "Chấm tự động" hiện "我叫小名", chữ "名" tô màu có nhãn "Khác"
- **AND** chưa có mức nào được chọn thay người học

#### Scenario: S10.7-AC2 Không có mic thì lượt B đọc to rồi tự chấm
- **WHEN** ở lượt 2, người học bấm "Ghi âm" nhưng quyền micro bị chặn
- **THEN** màn hiện hướng dẫn cấp quyền micro
- **AND** lượt 2 không còn nút "Ghi âm", "Nghe bản ghi" và khu "Chấm tự động", vẫn có "Nghe mẫu" và ba nút tự đánh giá

#### Scenario: S10.7-AC2 Chế độ đọc to giữ cho lượt B sau, lượt A vẫn nghe được
- **WHEN** lượt 2 đã ở chế độ "đọc to rồi tự chấm", người học chọn mức và đi tới lượt 3 rồi lượt 4
- **THEN** lượt 3 (vai A) có nút "Nghe lời A" bấm được
- **AND** lượt 4 ở chế độ "đọc to rồi tự chấm" và có nút "Thử lại ghi âm"

### Requirement: Nội dung câu đóng vai phải hợp lệ
Câu đóng vai SHALL trỏ tới một hội thoại cùng cấu trúc của S10.6 (mỗi lời là một lượt). Kiểm tra nội dung MUST áp mọi quy tắc hội
thoại của S10.6 cộng hai quy tắc riêng dưới đây; vi phạm thì lỗi nêu bài và câu, dựng nội dung MUST NOT ghi nội dung ra.

| Quy tắc | Nguồn | Ví dụ vi phạm |
|---|---|---|
| Mọi quy tắc hội thoại của S10.6, kể cả giọng | S10.6 | Lượt vai B giọng nữ |
| Lượt 1 là vai A | S10.7 | Lượt 1 vai B |
| Có ít nhất một lượt vai B | S10.7 | Hai lượt đều vai A |

#### Scenario: S10.7-AC1 Câu đóng vai trỏ tới hội thoại không có thì báo lỗi
- **WHEN** người soạn tạo câu đóng vai trỏ tới một hội thoại không có trong nội dung, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.7-AC1 Lượt của câu đóng vai thiếu nghĩa thì báo lỗi
- **WHEN** người soạn tạo câu đóng vai bằng một hội thoại có câu của lượt 2 thiếu nghĩa tiếng Việt, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.7-AC1 Lượt của câu đóng vai sai giọng thì báo lỗi
- **WHEN** người soạn tạo câu đóng vai bằng hội thoại ví dụ nhưng câu của lượt 2 (vai B) khai giọng nữ, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó

#### Scenario: S10.7-AC1 Lượt 1 là vai B thì báo lỗi
- **WHEN** người soạn tạo câu đóng vai trỏ tới hội thoại 2 lượt: lượt 1 vai B (câu giọng nam), lượt 2 vai A (câu khác, giọng nữ), hợp lệ với
  mọi luật hội thoại của S10.6, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó
- **AND** lỗi cho biết lượt 1 của câu đóng vai phải là vai A

#### Scenario: S10.7-AC1 Không có lượt vai B thì báo lỗi
- **WHEN** người soạn tạo câu đóng vai trỏ tới hội thoại 2 lượt đều vai A (hai câu riêng, đều giọng nữ), hợp lệ với mọi luật hội thoại của
  S10.6, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài và câu đó
- **AND** lỗi cho biết câu đóng vai phải có ít nhất một lượt vai B

#### Scenario: S10.7-AC1 Quy tắc riêng của đóng vai không áp cho câu hội thoại
- **WHEN** một bài học có câu hội thoại (S10.6) trỏ tới hội thoại 2 lời đều vai A (hai câu riêng, đều giọng nữ, hợp lệ với mọi luật hội thoại
  của S10.6) và một câu chấm điểm khác, không có câu đóng vai nào trỏ tới hội thoại đó, rồi người soạn chạy kiểm tra nội dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó

#### Scenario: S10.7-AC1 Nội dung lỗi thì dựng nội dung không ghi ra
- **WHEN** nội dung có một câu đóng vai vi phạm quy tắc và người soạn dựng nội dung
- **THEN** dựng nội dung báo lỗi và không ghi nội dung ra

#### Scenario: S10.7-AC1 Hội thoại ví dụ là hợp lệ
- **WHEN** người soạn tạo câu đóng vai bằng hội thoại ví dụ 4 lượt và chạy kiểm tra nội dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó

### Requirement: Câu đóng vai là câu chấm điểm
Câu đóng vai SHALL là câu chấm điểm theo quy tắc chung câu chấm điểm / không chấm điểm của màn bài (S10.1): khi câu vừa hiện chưa có nút
"Tiếp tục" của bài, có kết quả sau khi bấm "Kết thúc hội thoại", tính vào điểm và số câu. Vì vậy câu đóng vai MUST được phép trong bài kiểm
tra, và một bài học có câu đóng vai thỏa luật "bài học phải có câu chấm điểm" của S10.1.

#### Scenario: S10.7-AC1 Câu đóng vai vừa hiện chưa có Tiếp tục
- **WHEN** câu "đóng vai" với hội thoại ví dụ vừa hiện ra
- **THEN** không có nút "Tiếp tục" của bài

#### Scenario: S10.7-AC1 Bài kiểm tra có câu đóng vai thì qua kiểm tra nội dung
- **WHEN** người soạn tạo bài kiểm tra cuối chủ đề gồm một câu đóng vai bằng hội thoại ví dụ và các câu chấm điểm khác, rồi chạy kiểm tra nội
  dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó

#### Scenario: S10.7-AC1 Bài học gồm câu hội thoại và câu đóng vai thì qua kiểm tra nội dung
- **WHEN** người soạn tạo bài học chỉ gồm một câu hội thoại (S10.6) và một câu đóng vai, cả hai trỏ tới hội thoại ví dụ, rồi chạy kiểm tra
  nội dung
- **THEN** kiểm tra không báo lỗi nào cho bài đó
