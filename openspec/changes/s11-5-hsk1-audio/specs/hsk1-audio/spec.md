## Purpose
Nội dung HSK 1 có đủ audio cho mọi từ, câu và lời hội thoại để người học luôn nghe được. S11.5 khóa độ phủ audio HSK 1 (có file, file không rỗng) bằng test; luật thiếu audio của kiểm tra nội dung thuộc S2.4, chỉ dẫn chiếu.

## ADDED Requirements

### Requirement: Kiểm tra nội dung báo không thiếu file audio nào
`content:check` báo không thiếu file audio nào. Khi chạy kiểm tra nội dung trên toàn bộ nội dung trong repo, hệ thống SHALL báo 0 audio
thiếu và kết thúc thành công.

#### Scenario: S11.5-AC1 Kiểm tra nội dung trên nội dung HSK 1 không báo thiếu audio
- **WHEN** chạy kiểm tra nội dung trên toàn bộ nội dung trong repo (Nhập môn và 15 chủ đề HSK 1)
- **THEN** kết quả không có lỗi nào về audio thiếu
- **AND** kiểm tra kết thúc thành công

### Requirement: Mọi từ, câu và lời hội thoại HSK 1 có file audio không rỗng
Mỗi từ và câu HSK 1 MUST có file audio không rỗng trong thư mục audio của nội dung đã dựng.

Giọng đọc không thuộc phạm vi kiểm của S11.5: giọng mặc định do pipeline của S2.4 quy định, giọng theo vai A/B của hội thoại do S10.6
quy định và kiểm.

#### Scenario: S11.5-AC1 Mọi từ và câu HSK 1 có file audio không rỗng
- **WHEN** đọc nội dung HSK 1 đã dựng
- **THEN** mỗi từ trong 500 từ cấp 1 và mỗi câu của các bài HSK 1 (gồm lời hội thoại, câu ví dụ ngữ pháp, câu của bài kiểm tra chủ đề và
  bài kiểm tra cuối cấp) đều có file trong thư mục audio của nội dung đã dựng
- **AND** không file audio nào rỗng (độ dài lớn hơn 0)

#### Scenario: S11.5-AC1 File audio rỗng của một câu HSK 1 thì bị nêu tên
- **WHEN** kiểm tra phủ audio trên nội dung thử có hai câu "你好" và "谢谢", cả hai có file audio nhưng file của "谢谢" rỗng
- **THEN** kết quả nêu chữ "谢谢" là có file audio rỗng
- **AND** không nêu chữ "你好"

#### Scenario: S11.5-AC1 Câu HSK 1 thiếu file audio thì bị nêu tên
- **WHEN** kiểm tra phủ audio trên nội dung thử có hai câu "你好" và "谢谢" nhưng chỉ câu "你好" có file audio
- **THEN** kết quả nêu chữ "谢谢" là thiếu file audio
- **AND** không nêu chữ "你好"
