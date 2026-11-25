## ADDED Requirements

### Requirement: Thẻ ngữ pháp là câu không chấm điểm
Yêu cầu này khai báo thẻ ngữ pháp là câu không chấm điểm theo yêu cầu "Câu chấm điểm và câu không chấm điểm" (S10.1). Thẻ ngữ pháp SHALL
được xếp vào tập câu không chấm điểm, nên mọi quy tắc và luật kiểm tra nội dung của câu không chấm điểm áp nguyên cho thẻ ngữ pháp. Yêu cầu
này chỉ thêm một dạng vào tập đó, không đổi quy tắc.

#### Scenario: S10.5-AC1 Thẻ ngữ pháp có Tiếp tục ngay
- **WHEN** thẻ ngữ pháp hiện ra ở câu 1 của bài 3 câu và người học chưa bấm gì
- **THEN** màn có nút "Tiếp tục" bấm được
- **AND** màn không hiện thông báo "Đúng", "Sai" hay phần giải thích đáp án (phần hiện khi trả lời sai ở câu chấm điểm, S3.2)
- **AND** phần giải thích ngữ pháp dưới nhãn "Giải thích" của thẻ vẫn hiện

#### Scenario: S10.5-AC1 Thẻ ngữ pháp có trong Câu k / n
- **WHEN** người học bấm "Tiếp tục" ở thẻ ngữ pháp là câu 1 của bài 4 câu
- **THEN** màn hiện câu 2 với "Câu 2 / 4"

#### Scenario: S10.5-AC1 Bài có thẻ ngữ pháp thành Đã xong
- **WHEN** người học làm hết bài học thường gồm 1 thẻ ngữ pháp và 2 câu chọn thanh điệu, không bấm "Bỏ qua câu này" lần nào
- **THEN** màn tổng kết không báo có câu bị bỏ qua
- **AND** trên bản đồ lộ trình bài đó là "Đã xong"

#### Scenario: S10.5-AC1 Điểm không tính thẻ ngữ pháp
- **WHEN** người học làm hết bài 4 câu gồm 1 thẻ ngữ pháp và 3 câu chấm điểm, trả lời đúng 2 và sai 1 câu chấm điểm
- **THEN** màn tổng kết hiện điểm "67%", "Đúng 2 / 3 câu" và "Sai 1 câu"

#### Scenario: S10.5-AC1 Bài kiểm tra có thẻ ngữ pháp thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài kiểm tra cuối chủ đề có một thẻ ngữ pháp
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó

#### Scenario: S10.5-AC1 Bài chỉ gồm thẻ ngữ pháp và thẻ từ mới thì báo lỗi
- **WHEN** chạy kiểm tra nội dung trên một bài học thường gồm 1 thẻ ngữ pháp và 1 thẻ từ mới, không có câu chấm điểm nào
- **THEN** kiểm tra kết thúc không thành công và lỗi nêu bài đó
