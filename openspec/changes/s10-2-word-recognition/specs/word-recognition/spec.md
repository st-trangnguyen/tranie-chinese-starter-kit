## Purpose

Hai dạng câu trắc nghiệm nhận diện từ trong bài học: nghe audio rồi chọn chữ đúng, và nhìn chữ rồi chọn nghĩa đúng, chấm ngay sau khi chọn.

Ví dụ trong spec dùng các từ: "你好" (nǐ hǎo, xin chào), "谢谢" (xièxie, hai nghĩa "cảm ơn" và "cảm ơn bạn"), "再见" (zàijiàn, tạm biệt).

## ADDED Requirements

### Requirement: Dạng nghe: nghe audio rồi chọn chữ đúng
Dạng nghe: nghe audio rồi chọn chữ đúng trong các lựa chọn.

Hệ thống SHALL hiện câu nghe chọn chữ với nút "Nghe" phát âm của từ đáp án và các lựa chọn chỉ ghi chữ Hán. Nút "Nghe" MUST theo đúng
quy tắc nghe lại đã có: không tự phát, nghe lại không giới hạn, "Nghe chậm", báo khi audio không phát được.

#### Scenario: S10.2-AC1 Câu nghe chọn chữ hiện nút Nghe và các chữ lựa chọn
- **WHEN** câu nghe chọn chữ có từ đáp án "你好" và các lựa chọn "你好", "谢谢", "再见" hiện ra
- **THEN** màn có nút "Nghe" và đúng 3 lựa chọn ghi "你好", "谢谢", "再见"
- **AND** chưa có audio nào phát

#### Scenario: S10.2-AC1 Bấm Nghe phát âm của từ đáp án
- **WHEN** câu nghe chọn chữ có từ đáp án "你好" và người học bấm "Nghe"
- **THEN** audio của từ "你好" phát một lần từ đầu

#### Scenario: S10.2-AC1 Chọn đúng chữ
- **WHEN** câu nghe chọn chữ có từ đáp án "你好" và người học chọn "你好"
- **THEN** câu được chấm đúng
- **AND** màn hiện "Đáp án đúng" kèm "你好", "nǐ hǎo" và "xin chào"

#### Scenario: S10.2-AC1 Chọn sai chữ thì có giải thích
- **WHEN** câu nghe chọn chữ có từ đáp án "你好" và người học chọn "谢谢"
- **THEN** câu được chấm sai
- **AND** giải thích là "Đáp án đúng: 你好 · nǐ hǎo · xin chào"

#### Scenario: S10.2-AC1 Sau khi chấm vẫn nghe lại được
- **WHEN** câu nghe chọn chữ đã được chấm
- **THEN** nút "Nghe" vẫn bấm được và phát lại âm của từ đáp án

#### Scenario: S10.2-AC1 Câu nghe chọn chữ không còn bị bỏ qua
- **WHEN** bài có câu nghe chọn chữ
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"

### Requirement: Dạng đọc: nhìn chữ rồi chọn nghĩa đúng
Dạng đọc: nhìn chữ rồi chọn nghĩa đúng trong các lựa chọn.

Hệ thống SHALL hiện câu nhìn chữ chọn nghĩa với chữ Hán của từ đáp án và các lựa chọn ghi nghĩa tiếng Việt. Mỗi lựa chọn ghi mọi nghĩa của
từ đó theo thứ tự đã soạn, cách nhau bằng "; ".

#### Scenario: S10.2-AC2 Câu nhìn chữ chọn nghĩa hiện chữ và các nghĩa lựa chọn
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "你好" và các lựa chọn "你好", "谢谢", "再见" hiện ra
- **THEN** màn hiện chữ "你好" và đúng 3 lựa chọn ghi "xin chào", "cảm ơn; cảm ơn bạn", "tạm biệt"

#### Scenario: S10.2-AC2 Chọn đúng nghĩa
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "谢谢", lựa chọn "你好", "谢谢", "再见", và người học chọn "cảm ơn; cảm ơn bạn"
- **THEN** câu được chấm đúng
- **AND** màn hiện "Đáp án đúng" kèm "谢谢", "xièxie" và "cảm ơn; cảm ơn bạn"

#### Scenario: S10.2-AC2 Chọn sai nghĩa thì có giải thích
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "你好" và người học chọn "tạm biệt"
- **THEN** câu được chấm sai
- **AND** giải thích là "Đáp án đúng: 你好 · nǐ hǎo · xin chào"

#### Scenario: S10.2-AC2 Sau khi chấm có nút Nghe nhưng không tự phát
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "你好" đã được chấm
- **THEN** màn có nút "Nghe" và chưa có audio nào phát
- **AND** bấm "Nghe" thì phát âm của từ "你好"

#### Scenario: S10.2-AC2 Câu nhìn chữ chọn nghĩa không còn bị bỏ qua
- **WHEN** bài có câu nhìn chữ chọn nghĩa
- **THEN** màn chạy bài hiện câu đó, không đánh dấu "bỏ qua vì dạng bài chưa có"

### Requirement: Trước khi chấm không lộ đáp án, sau khi chấm hiện đáp án đầy đủ
Hệ thống SHALL hiện và giấu theo bảng sau, bất kể công tắc "Hiện pinyin" trong Cài đặt đang bật hay tắt (cả trước và sau khi chấm). Âm
thanh MUST NOT tự phát khi câu vừa hiện hoặc khi kết quả vừa hiện.

| Dạng câu | Trước khi chấm không hiện | Sau khi chấm hiện |
|---|---|---|
| Nghe chọn chữ | Pinyin, nghĩa; nút nghe riêng từng lựa chọn | "Đáp án đúng": chữ Hán, pinyin, mọi nghĩa; nút "Nghe" |
| Nhìn chữ chọn nghĩa | Pinyin; nút "Nghe" | "Đáp án đúng": chữ Hán, pinyin, mọi nghĩa; nút "Nghe" |

#### Scenario: S10.2-AC1 Tắt "Hiện pinyin" vẫn hiện pinyin trong đáp án sau khi chấm
- **WHEN** công tắc "Hiện pinyin" trong Cài đặt đang tắt và người học chọn "谢谢" ở câu nghe chọn chữ có từ đáp án "你好"
- **THEN** màn hiện "Đáp án đúng" kèm "你好", "nǐ hǎo" và "xin chào"

#### Scenario: S10.2-AC2 Bật "Hiện pinyin" vẫn không lộ pinyin trước khi chấm
- **WHEN** công tắc "Hiện pinyin" trong Cài đặt đang bật và câu nhìn chữ chọn nghĩa có từ đáp án "你好" vừa hiện
- **THEN** màn không hiện "nǐ hǎo"

#### Scenario: S10.2-AC1 Chưa chọn thì chưa lộ đáp án
- **WHEN** câu nghe chọn chữ có từ đáp án "你好" vừa hiện và người học chưa chọn
- **THEN** màn không hiện "nǐ hǎo", "xin chào" hay pinyin, nghĩa của các lựa chọn khác
- **AND** chỉ có một nút nghe, không có nút nghe riêng cho từng lựa chọn

#### Scenario: S10.2-AC2 Chưa chọn thì chưa lộ pinyin
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "你好" vừa hiện và người học chưa chọn
- **THEN** màn không hiện "nǐ hǎo"
- **AND** không có nút "Nghe" và chưa có audio nào phát

### Requirement: Lựa chọn do người soạn khai báo
Với cả hai dạng câu, hệ thống SHALL hiện đúng các từ lựa chọn người soạn khai báo cho câu, từ 2 đến 4 lựa chọn, trong đó có từ đáp án.

#### Scenario: S10.2-AC1 Câu nghe chọn chữ có 2 lựa chọn
- **WHEN** bài có một câu nghe chọn chữ khai báo 2 lựa chọn
- **THEN** câu đó hiện đúng 2 lựa chọn

#### Scenario: S10.2-AC2 Câu nhìn chữ chọn nghĩa có 4 lựa chọn
- **WHEN** bài có một câu nhìn chữ chọn nghĩa khai báo 4 lựa chọn
- **THEN** câu đó hiện đúng 4 lựa chọn

### Requirement: Thứ tự lựa chọn xáo khi câu hiện và giữ nguyên tới khi rời câu
Thứ tự lựa chọn SHALL được xáo ngẫu nhiên mỗi lần câu hiện và MUST giữ nguyên cho tới khi người học rời câu đó:

| Tình huống | Thứ tự lựa chọn |
|---|---|
| Câu vừa hiện (đến câu đó trong bài) | Xáo mới |
| Bấm "Nghe", "Nghe chậm", chọn, câu được chấm | Giữ nguyên như lúc câu hiện |
| Mở lại bài đang dở ở câu này (câu làm lại từ đầu) | Xáo mới |
| Học lại bài, hoặc gặp câu này ở lần học khác | Xáo mới |

#### Scenario: S10.2-AC1 Thứ tự lựa chọn câu nghe chọn chữ không cố định
- **WHEN** cùng một câu nghe chọn chữ có 3 lựa chọn hiện ra nhiều lần
- **THEN** đáp án không luôn ở cùng một vị trí

#### Scenario: S10.2-AC2 Thứ tự lựa chọn câu nhìn chữ chọn nghĩa không cố định
- **WHEN** cùng một câu nhìn chữ chọn nghĩa có 3 lựa chọn hiện ra nhiều lần
- **THEN** đáp án không luôn ở cùng một vị trí

#### Scenario: S10.2-AC1 Thứ tự giữ nguyên khi bấm Nghe và sau khi chấm
- **WHEN** câu nghe chọn chữ có 3 lựa chọn hiện ra, người học bấm "Nghe" rồi chọn một lựa chọn
- **THEN** sau khi bấm "Nghe" và sau khi câu được chấm, ba lựa chọn vẫn ở đúng vị trí như lúc câu vừa hiện

#### Scenario: S10.2-AC2 Thứ tự giữ nguyên sau khi chấm
- **WHEN** câu nhìn chữ chọn nghĩa có 3 lựa chọn hiện ra và người học chọn một lựa chọn
- **THEN** sau khi câu được chấm, ba lựa chọn vẫn ở đúng vị trí như lúc câu vừa hiện

#### Scenario: S10.2-AC1 Mở lại bài đang dở thì câu hiện như mới
- **WHEN** người học đang ở câu nghe chọn chữ (chưa trả lời) thì thoát bài, rồi mở lại bài
- **THEN** màn hiện lại câu đó ở trạng thái chưa trả lời, đủ các lựa chọn đã khai báo
- **AND** thứ tự lựa chọn được xáo mới như lúc câu hiện lần đầu

#### Scenario: S10.2-AC2 Mở lại bài đang dở thì câu nhìn chữ chọn nghĩa hiện như mới
- **WHEN** người học đang ở câu nhìn chữ chọn nghĩa (chưa trả lời) thì thoát bài, rồi mở lại bài
- **THEN** màn hiện lại câu đó ở trạng thái chưa trả lời, đủ các lựa chọn đã khai báo
- **AND** thứ tự lựa chọn được xáo mới như lúc câu hiện lần đầu

### Requirement: Chọn xong thì khóa lựa chọn và dùng được bằng bàn phím
Hệ thống SHALL chấm ngay khi người học chọn một lựa chọn và MUST khóa các lựa chọn sau khi chấm. Mỗi lựa chọn MUST chọn được bằng bàn phím.
Đây là quy tắc chung cho câu trắc nghiệm của E10.

#### Scenario: S10.2-AC1 Chọn xong thì khóa lựa chọn
- **WHEN** người học đã chọn một lựa chọn ở câu nghe chọn chữ
- **THEN** các lựa chọn bị khóa, bấm thêm không đổi kết quả

#### Scenario: S10.2-AC2 Chọn xong thì khóa lựa chọn
- **WHEN** người học đã chọn một lựa chọn ở câu nhìn chữ chọn nghĩa
- **THEN** các lựa chọn bị khóa, bấm thêm không đổi kết quả

#### Scenario: S10.2-AC1 Chọn bằng bàn phím
- **WHEN** người học dùng phím Tab tới lựa chọn "你好" ở câu nghe chọn chữ có từ đáp án "你好" rồi nhấn Enter
- **THEN** câu được chấm đúng

#### Scenario: S10.2-AC2 Chọn bằng bàn phím
- **WHEN** người học dùng phím Tab tới lựa chọn "xin chào" ở câu nhìn chữ chọn nghĩa có từ đáp án "你好" rồi nhấn Enter
- **THEN** câu được chấm đúng

### Requirement: Sau khi chấm, lựa chọn được đánh dấu bằng chữ
Sau khi chấm, hệ thống SHALL đánh dấu các lựa chọn theo bảng sau. Mỗi dấu MUST có nhãn chữ đọc được (kể cả với trình đọc màn hình), không
chỉ phân biệt bằng màu. Đây là quy tắc chung cho câu trắc nghiệm của E10.

| Lựa chọn | Nhãn sau khi chấm |
|---|---|
| Lựa chọn là đáp án (dù người học chọn nó hay không) | "Đáp án đúng" |
| Lựa chọn người học đã chọn, và sai | "Đã chọn" |
| Lựa chọn khác | Không có nhãn |

#### Scenario: S10.2-AC1 Chọn sai thì đáp án và lựa chọn đã chọn đều có nhãn
- **WHEN** câu nghe chọn chữ có từ đáp án "你好", lựa chọn "你好", "谢谢", "再见", và người học chọn "谢谢"
- **THEN** lựa chọn "你好" có nhãn "Đáp án đúng"
- **AND** lựa chọn "谢谢" có nhãn "Đã chọn"
- **AND** lựa chọn "再见" không có nhãn

#### Scenario: S10.2-AC1 Chọn đúng thì chỉ lựa chọn đó có nhãn
- **WHEN** câu nghe chọn chữ có từ đáp án "你好", lựa chọn "你好", "谢谢", "再见", và người học chọn "你好"
- **THEN** lựa chọn "你好" có nhãn "Đáp án đúng"
- **AND** không lựa chọn nào có nhãn "Đã chọn"

#### Scenario: S10.2-AC2 Chọn sai nghĩa thì đáp án và lựa chọn đã chọn đều có nhãn
- **WHEN** câu nhìn chữ chọn nghĩa có từ đáp án "你好", lựa chọn "你好", "谢谢", "再见", và người học chọn "tạm biệt"
- **THEN** lựa chọn "xin chào" có nhãn "Đáp án đúng"
- **AND** lựa chọn "tạm biệt" có nhãn "Đã chọn"

### Requirement: Nội dung sai thì kiểm tra nội dung báo lỗi
Khi chạy kiểm tra nội dung, hệ thống SHALL báo lỗi chỉ rõ bài và câu, và MUST NOT ghi nội dung ra, nếu một câu của hai dạng này rơi vào
một trường hợp lỗi:

| Dạng câu | Trường hợp lỗi |
|---|---|
| Cả hai | Từ đáp án không nằm trong các lựa chọn |
| Cả hai | Ít hơn 2 hoặc nhiều hơn 4 lựa chọn |
| Cả hai | Một từ lặp lại trong các lựa chọn |
| Cả hai | Hai lựa chọn khác nhau nhưng cùng chữ Hán (chữ đa âm, ví dụ 地 đọc "de" và 地 đọc "dì") |

#### Scenario: S10.2-AC1 Đáp án không nằm trong lựa chọn thì bị báo lỗi
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án "你好" và lựa chọn "谢谢", "再见" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

#### Scenario: S10.2-AC1 Số lựa chọn ngoài khoảng 2 đến 4 thì bị báo lỗi
- **WHEN** người soạn tạo một câu nghe chọn chữ chỉ có 1 lựa chọn, hoặc có 5 lựa chọn, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC1 Lựa chọn trùng nhau thì bị báo lỗi
- **WHEN** người soạn tạo câu nghe chọn chữ có một từ lặp lại trong lựa chọn, hoặc hai từ khác nhau cùng chữ Hán, rồi chạy kiểm tra nội
  dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC2 Từ nhiễu cùng chữ Hán với đáp án thì bị báo lỗi
- **WHEN** người soạn tạo câu nhìn chữ chọn nghĩa có đáp án là từ "地" đọc "dì" và lựa chọn gồm từ đó cùng từ "地" đọc "de", rồi chạy kiểm
  tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai
- **AND** nội dung không được ghi ra

### Requirement: Câu nghe chọn chữ không có từ nhiễu đọc giống đáp án
Kiểm tra nội dung SHALL báo lỗi chỉ rõ bài và câu, và MUST NOT ghi nội dung ra, khi một lựa chọn khác của câu nghe chọn chữ đọc giống từ
đáp án: cùng pinyin có dấu, không phân biệt chữ hoa/thường và dấu cách. Khác thanh điệu thì hợp lệ.

#### Scenario: S10.2-AC1 Từ nhiễu đọc giống hệt đáp án thì bị báo lỗi
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án "他" (tā) và lựa chọn "他", "她" (tā) rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC1 Từ nhiễu khác thanh điệu với đáp án thì hợp lệ
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án "妈" (mā) và lựa chọn "妈", "马" (mǎ) rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung không báo lỗi cho câu đó

#### Scenario: S10.2-AC1 Từ nhiễu chỉ khác chữ hoa/thường ở pinyin vẫn bị coi là đọc giống
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án pinyin "tā" và một lựa chọn khác có pinyin "Tā" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC1 Từ nhiễu chỉ khác dấu cách ở pinyin vẫn bị coi là đọc giống
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án pinyin "nǐ hǎo" và một lựa chọn khác có pinyin "nǐhǎo" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

### Requirement: Câu nhìn chữ chọn nghĩa không có hai lựa chọn chung nghĩa
Kiểm tra nội dung SHALL báo lỗi chỉ rõ bài và câu, và MUST NOT ghi nội dung ra, khi hai lựa chọn của câu nhìn chữ chọn nghĩa có chung ít nhất một nghĩa, so từng nghĩa
sau khi bỏ khoảng trắng đầu/cuối.

#### Scenario: S10.2-AC2 Hai lựa chọn trùng hệt nghĩa thì bị báo lỗi
- **WHEN** người soạn tạo câu nhìn chữ chọn nghĩa có hai từ khác nhau cùng chỉ có nghĩa "cảm ơn" rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC2 Hai lựa chọn có chung một nghĩa thì bị báo lỗi
- **WHEN** người soạn tạo câu nhìn chữ chọn nghĩa có lựa chọn "谢谢" (nghĩa "cảm ơn", "cảm ơn bạn") và một từ khác có nghĩa "cảm ơn " (có
  dấu cách cuối) rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

### Requirement: Từ dùng trong câu phải có nghĩa tiếng Việt
Kiểm tra nội dung SHALL báo lỗi chỉ rõ bài và câu, và MUST NOT ghi nội dung ra, khi:

| Dạng câu | Từ không có nghĩa tiếng Việt nào |
|---|---|
| Cả hai | Từ đáp án |
| Nhìn chữ chọn nghĩa | Bất kỳ từ lựa chọn nào |

Nghĩa chưa được người soạn review vẫn dùng được; kiểm tra nội dung giữ cảnh báo nghĩa chưa review như đã có, không thành lỗi.

#### Scenario: S10.2-AC1 Từ đáp án không có nghĩa thì bị báo lỗi
- **WHEN** người soạn tạo câu nghe chọn chữ có đáp án là một từ không có nghĩa tiếng Việt nào rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC2 Từ lựa chọn không có nghĩa thì bị báo lỗi
- **WHEN** người soạn tạo câu nhìn chữ chọn nghĩa có đáp án "你好" và một từ lựa chọn khác không có nghĩa tiếng Việt nào rồi chạy kiểm tra
  nội dung
- **THEN** kiểm tra nội dung báo lỗi chỉ rõ bài và câu sai

#### Scenario: S10.2-AC2 Nghĩa chưa review không làm câu bị lỗi
- **WHEN** người soạn tạo câu nhìn chữ chọn nghĩa hợp lệ, trong đó một từ lựa chọn có nghĩa chưa được review, rồi chạy kiểm tra nội dung
- **THEN** kiểm tra nội dung không báo lỗi cho câu đó
- **AND** vẫn có cảnh báo nghĩa chưa review của từ đó

### Requirement: Từ của câu là từ đáp án
Với hai dạng câu này, hệ thống SHALL coi chỉ từ đáp án là từ của câu khi tạo thẻ ôn tập lúc học xong bài và khi đưa câu sai trong bài kiểm
tra vào ôn tập. Các từ lựa chọn khác MUST NOT được tính là đã học hay làm sai.

| Câu trong bài | Từ của câu |
|---|---|
| Câu nghe chọn chữ | Từ đáp án |
| Câu nhìn chữ chọn nghĩa | Từ đáp án |

#### Scenario: S10.2-AC1 Xong bài có câu nghe chọn chữ chỉ tạo thẻ cho từ đáp án
- **WHEN** người học chưa có thẻ nào và làm hết một bài học chỉ có một câu nghe chọn chữ, đáp án "你好", lựa chọn "你好", "谢谢", "再见"
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều nghĩa và chiều nghe
- **AND** không có thẻ nào của "谢谢" hay "再见"

#### Scenario: S10.2-AC2 Câu nhìn chữ chọn nghĩa sai trong bài kiểm tra chỉ đưa từ đáp án vào ôn tập
- **WHEN** người học chưa có thẻ nào, làm xong bài kiểm tra cuối chủ đề chỉ có một câu nhìn chữ chọn nghĩa và chọn sai câu đó (đáp án "你好", lựa chọn
  "你好", "谢谢", "再见")
- **THEN** danh sách thẻ ôn tập có thẻ "你好" chiều nghĩa và chiều nghe
- **AND** không có thẻ nào của "谢谢" hay "再见"
