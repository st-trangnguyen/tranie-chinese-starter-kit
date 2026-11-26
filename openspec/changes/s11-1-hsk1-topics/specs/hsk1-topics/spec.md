## Purpose

Nội dung giai đoạn HSK 1: 15 chủ đề, mỗi chủ đề 5 bài theo loại (Từ mới, Ngữ pháp, Hội thoại, Viết chữ, Kiểm tra), và lệnh kiểm tra
nội dung báo độ phủ 500 từ cấp 1 để không từ nào bị bỏ sót.

## ADDED Requirements

### Requirement: 15 chủ đề, mỗi chủ đề 5 bài
15 chủ đề, mỗi chủ đề 5 bài: Từ mới / Ngữ pháp / Hội thoại / Viết chữ / Kiểm tra. Lộ trình SHALL có giai đoạn "HSK 1" ngay sau giai
đoạn "Nhập môn", gồm đúng 15 chủ đề; mỗi chủ đề MUST có đúng 5 bài theo đúng thứ tự: Từ mới, Ngữ pháp, Hội thoại, Viết chữ, Kiểm tra.

#### Scenario: S11.1-AC1 Giai đoạn HSK 1 có 15 chủ đề, đứng sau Nhập môn
- **WHEN** đọc nội dung lộ trình đã build
- **THEN** giai đoạn ngay sau "Nhập môn" có tiêu đề "HSK 1" và có đúng 15 chủ đề

#### Scenario: S11.1-AC1 Mỗi chủ đề có 5 bài đúng thứ tự loại bài
- **WHEN** đọc nội dung đã build của từng chủ đề trong giai đoạn "HSK 1"
- **THEN** mỗi chủ đề có đúng 5 bài, lần lượt là bài Từ mới, Ngữ pháp, Hội thoại, Viết chữ, Kiểm tra

#### Scenario: S11.1-AC1 Bản đồ lộ trình hiện giai đoạn HSK 1
- **WHEN** người học đã xong onboarding và mở màn Lộ trình
- **THEN** màn hiện giai đoạn "HSK 1" sau giai đoạn "Nhập môn", với 15 chủ đề và 5 bài trong mỗi chủ đề

### Requirement: Tiêu đề chủ đề và tiêu đề bài
Mỗi chủ đề HSK 1 SHALL có tên riêng, không trùng tên chủ đề khác. Tiêu đề mỗi bài MUST có dạng "<loại bài> · <tên chủ đề>", ví dụ
"Từ mới · Chào hỏi", với loại bài là một trong "Từ mới", "Ngữ pháp", "Hội thoại", "Viết chữ", "Kiểm tra" đúng theo vị trí của bài.

#### Scenario: S11.1-AC1 Tiêu đề bài nêu loại bài và tên chủ đề
- **WHEN** đọc nội dung đã build của từng bài trong giai đoạn "HSK 1"
- **THEN** tiêu đề bài thứ k của một chủ đề là tên loại bài thứ k (Từ mới, Ngữ pháp, Hội thoại, Viết chữ, Kiểm tra), tiếp theo " · " và tên chủ đề đó

#### Scenario: S11.1-AC1 Tên 15 chủ đề không trùng nhau
- **WHEN** đọc nội dung lộ trình đã build
- **THEN** 15 tên chủ đề của giai đoạn "HSK 1" khác nhau từng đôi một

### Requirement: Mỗi loại bài có câu thuộc dạng đặc trưng
Mỗi bài HSK 1 SHALL có câu thuộc dạng đặc trưng của loại bài theo bảng. Bài có thể có thêm câu thuộc các dạng màn bài đã hỗ trợ khác.

| Loại bài | Loại theo màn bài | Câu bắt buộc |
|---|---|---|
| Từ mới | Bài học thường | Ít nhất một thẻ từ mới |
| Ngữ pháp | Bài học thường | Ít nhất một thẻ ngữ pháp |
| Hội thoại | Bài học thường | Ít nhất một câu hội thoại |
| Viết chữ | Bài học thường | Ít nhất một câu viết chữ theo nét |
| Kiểm tra | Bài kiểm tra cuối chủ đề | Chỉ câu chấm điểm |

#### Scenario: S11.1-AC1 Bài Từ mới có thẻ từ mới
- **WHEN** đọc nội dung đã build của 15 bài Từ mới
- **THEN** mỗi bài có ít nhất một thẻ từ mới

#### Scenario: S11.1-AC1 Bài Ngữ pháp có thẻ ngữ pháp
- **WHEN** đọc nội dung đã build của 15 bài Ngữ pháp
- **THEN** mỗi bài có ít nhất một thẻ ngữ pháp

#### Scenario: S11.1-AC1 Bài Hội thoại có câu hội thoại
- **WHEN** đọc nội dung đã build của 15 bài Hội thoại
- **THEN** mỗi bài có ít nhất một câu hội thoại

#### Scenario: S11.1-AC1 Bài Viết chữ có câu viết chữ theo nét
- **WHEN** đọc nội dung đã build của 15 bài Viết chữ
- **THEN** mỗi bài có ít nhất một câu viết chữ theo nét

#### Scenario: S11.1-AC1 Bài Kiểm tra là bài kiểm tra cuối chủ đề
- **WHEN** đọc nội dung đã build của 15 chủ đề HSK 1
- **THEN** bài thứ 5 của mỗi chủ đề là bài kiểm tra cuối chủ đề, chỉ gồm câu chấm điểm
- **AND** 4 bài đầu của mỗi chủ đề là bài học thường

#### Scenario: S11.1-AC1 Chủ đề HSK 1 chưa mở có nút Kiểm tra vượt cấp
- **WHEN** người học mới xong onboarding mở màn Lộ trình
- **THEN** mọi chủ đề của giai đoạn "HSK 1" đang khóa, kể cả chủ đề thứ nhất, đều hiện nút "Kiểm tra vượt cấp"

### Requirement: Bài học thường HSK 1 có câu chấm điểm
Mỗi bài Từ mới, Ngữ pháp, Hội thoại, Viết chữ của HSK 1 SHALL có ít nhất một câu chấm điểm, theo luật bài học thường của S10.1. Thẻ từ
mới, thẻ ngữ pháp và câu hội thoại là câu không chấm điểm nên không tính.

#### Scenario: S11.1-AC1 Bốn bài học thường của mỗi chủ đề có câu chấm điểm
- **WHEN** đọc nội dung đã build của các bài Từ mới, Ngữ pháp, Hội thoại, Viết chữ trong 15 chủ đề HSK 1
- **THEN** mỗi bài có ít nhất một câu chấm điểm

### Requirement: Không câu nào của bài HSK 1 phải bỏ qua
Mọi câu của 75 bài HSK 1 MUST thuộc dạng màn bài đã hỗ trợ trong bản build, để người học không gặp câu phải bỏ qua.

#### Scenario: S11.1-AC1 Mọi câu của 75 bài thuộc dạng màn bài đã hỗ trợ
- **WHEN** đọc nội dung đã build của 75 bài HSK 1
- **THEN** mọi câu thuộc dạng màn bài đã hỗ trợ trong bản build
- **AND** không bài nào có câu phải bỏ qua

### Requirement: Script kiểm tra báo phủ 100% trong 500 từ cấp 1
Script kiểm tra báo phủ 100% trong 500 từ cấp 1. Lệnh kiểm tra nội dung SHALL luôn in một dòng "Độ phủ từ HSK 1: <p>% (<số từ được
phủ>/500)", phần trăm làm tròn xuống số nguyên. Khi story hoàn tất (giai đoạn HSK 1 đủ 15 chủ đề), dòng đó MUST là "Độ phủ từ HSK 1:
100% (500/500)" và lệnh không báo thiếu độ phủ.

#### Scenario: S11.1-AC2 Nội dung thật phủ 100%
- **WHEN** chạy lệnh kiểm tra nội dung trên nội dung của repo
- **THEN** lệnh in "Độ phủ từ HSK 1: 100% (500/500)"
- **AND** lệnh không báo lỗi độ phủ và kết thúc thành công

### Requirement: Cách tính một từ được phủ
Một từ trong danh sách 500 từ cấp 1 SHALL được tính là được phủ khi và chỉ khi có thẻ từ mới của từ đó trong bài Từ mới của ít nhất
một chủ đề HSK 1. Mỗi từ MUST được đếm nhiều nhất một lần.

| Từ cấp 1 xuất hiện ở | Được phủ? |
|---|---|
| Thẻ từ mới trong bài Từ mới của một chủ đề HSK 1 | Có |
| Thẻ từ mới ở bài Từ mới của hai chủ đề trở lên | Có, đếm một lần |
| Chỉ ở dạng câu khác, bài khác của HSK 1 (câu hội thoại, câu viết, bài Kiểm tra…) | Không |
| Chỉ ở bài Nhập môn | Không |

#### Scenario: S11.1-AC2 Từ có thẻ từ mới ở hai chủ đề chỉ đếm một lần
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử mà 500 từ đều có thẻ từ mới trong bài Từ mới, trong đó từ "你" có ở hai chủ đề
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 100% (500/500)"

#### Scenario: S11.1-AC2 Từ chỉ có ngoài bài Từ mới không được tính
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử mà 499 từ có thẻ từ mới trong bài Từ mới, còn từ "爱" chỉ có trong một câu viết chữ của bài Viết chữ
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)"
- **AND** báo thiếu độ phủ nêu từ "爱"

#### Scenario: S11.1-AC2 Từ chỉ có ở bài Nhập môn không được tính
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử mà 499 từ có thẻ từ mới trong bài Từ mới HSK 1, còn từ "好" chỉ có trong bài Nhập môn
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)"
- **AND** báo thiếu độ phủ nêu từ "好"

### Requirement: Từ phân biệt theo chữ Hán và pinyin
Mỗi mục của danh sách 500 từ cấp 1 SHALL là một từ riêng, phân biệt theo chữ Hán và pinyin. Một chữ Hán có hai mục (ví dụ 地 đọc "de"
và "dì") là hai từ; thẻ từ mới của mục này MUST NOT phủ mục kia.

#### Scenario: S11.1-AC2 Chữ Hán có hai mục được tính riêng theo pinyin
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử mà mọi từ có thẻ từ mới trừ "地 (de)", còn "地 (dì)" có thẻ từ mới
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 99% (499/500)"
- **AND** báo thiếu độ phủ nêu "地 (de)"

### Requirement: Thiếu từ thì báo kèm danh sách
Khi còn từ cấp 1 chưa được phủ, lệnh kiểm tra nội dung SHALL báo thiếu độ phủ, nêu số từ thiếu và danh sách đủ các từ đó. Mỗi từ ghi
bằng chữ Hán; chữ Hán có nhiều mục trong danh sách 500 từ thì ghi kèm pinyin trong ngoặc, ví dụ "地 (de)". Dòng độ phủ vẫn được in;
phần trăm làm tròn xuống nên chưa đủ 500 từ thì không bao giờ hiện "100%".

#### Scenario: S11.1-AC2 Danh sách thiếu ghi pinyin cho chữ Hán có nhiều mục
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử mà mọi từ có thẻ từ mới trừ "地 (de)" và "爱"
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 99% (498/500)"
- **AND** báo thiếu độ phủ nêu 2 từ là "地 (de)" và "爱"

### Requirement: Mức báo thiếu từ theo số chủ đề
Mức báo thiếu độ phủ MUST theo số chủ đề của giai đoạn HSK 1, để nội dung được thêm dần từng nhóm chủ đề mà lệnh vẫn chạy qua:

| Giai đoạn HSK 1 có | Thiếu từ thì báo | Lệnh kết thúc (khi không có lỗi khác) |
|---|---|---|
| Chưa có giai đoạn, hoặc dưới 15 chủ đề | Cảnh báo | Thành công |
| Đủ 15 chủ đề | Lỗi | Không thành công |
| Đủ 15 chủ đề và phủ đủ 500 từ | Không báo | Thành công |

#### Scenario: S11.1-AC2 Đủ 15 chủ đề mà thiếu hai từ thì báo lỗi nêu đủ hai từ
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử có giai đoạn HSK 1 đủ 15 chủ đề, mọi từ có thẻ từ mới trừ "爱" và "八"
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 99% (498/500)"
- **AND** lệnh báo lỗi nêu 2 từ chưa được phủ là "爱" và "八", và kết thúc không thành công

#### Scenario: S11.1-AC2 Dưới 15 chủ đề mà thiếu từ thì chỉ cảnh báo
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử có giai đoạn HSK 1 gồm 3 chủ đề, bài Từ mới của 3 chủ đề đó có thẻ từ mới của 60 từ cấp 1
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 12% (60/500)"
- **AND** lệnh báo cảnh báo nêu 440 từ chưa được phủ, không báo lỗi độ phủ, và kết thúc thành công

#### Scenario: S11.1-AC2 Chưa có bài HSK 1 nào thì độ phủ 0% và chỉ cảnh báo
- **WHEN** chạy kiểm tra độ phủ trên nội dung thử chỉ có bài Nhập môn
- **THEN** dòng độ phủ là "Độ phủ từ HSK 1: 0% (0/500)"
- **AND** lệnh báo cảnh báo 500 từ chưa được phủ và kết thúc thành công
