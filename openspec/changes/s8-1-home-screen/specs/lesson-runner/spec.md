## ADDED Requirements

### Requirement: Màn tổng kết có đường về Trang chủ
Hệ thống SHALL có liên kết "Trang chủ" đưa người học về màn Trang chủ (S8.1) trên màn tổng kết cuối bài, theo bảng:

| Màn | Có liên kết "Trang chủ"? |
|---|---|
| Màn tổng kết cuối bài (bài thường, bài kiểm tra cuối chủ đề, bài kiểm tra vượt cấp) | Có |
| Màn bài khi đang làm câu | Không (bản này) |

#### Scenario: S8.1-AC1 Từ màn tổng kết về Trang chủ
- **WHEN** người học làm xong một bài, đang ở màn tổng kết và bấm "Trang chủ"
- **THEN** người học thấy màn Trang chủ

#### Scenario: S8.1-AC1 Màn bài khi đang làm câu không có liên kết Trang chủ
- **WHEN** người học đang làm câu thứ nhất của một bài
- **THEN** màn bài không có liên kết "Trang chủ"
