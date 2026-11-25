## MODIFIED Requirements

### Requirement: Viết bằng ngón tay hoặc chuột trên khung viết
Viết bằng ngón tay hoặc chuột trên khung viết.

Hệ thống SHALL cho người học viết từng nét của chữ trên một khung viết bằng ngón tay (màn cảm ứng) hoặc chuột. Khung viết MUST hiện sẵn nét mờ của cả chữ để người học viết đè lên (tập tô). Hệ thống MUST hiện nét đang viết ngay khi người học di chuyển, MUST giữ lại trên khung các nét đã viết đúng, và MUST NOT làm cuộn trang khi người học viết trong khung.

#### Scenario: S6.2-AC1 Hiện khung viết có nét mờ của cả chữ
- **WHEN** người học mở luyện viết chữ "十" (có dữ liệu nét)
- **THEN** màn hiện khung viết của chữ "十" với đủ 2 nét mờ của cả chữ để viết đè lên
- **AND** chưa có nét nào được đánh dấu là đã viết

#### Scenario: S6.2-AC1 Viết bằng chuột
- **WHEN** người học nhấn giữ chuột và kéo trong khung viết
- **THEN** khung hiện nét vừa kéo

#### Scenario: S6.2-AC1 Viết bằng ngón tay
- **WHEN** người học chạm và kéo ngón tay trong khung viết trên màn cảm ứng
- **THEN** khung hiện nét vừa kéo
- **AND** trang không cuộn

#### Scenario: S6.2-AC1 Viết đúng nét thì sang nét kế
- **WHEN** người học viết đúng nét hiện tại của chữ
- **THEN** nét đó được giữ lại trên khung
- **AND** hệ thống chờ nét kế tiếp

#### Scenario: S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ
- **WHEN** người học viết đúng nét cuối cùng của chữ
- **THEN** màn báo đã viết xong chữ
- **AND** người học ở lại màn, có nút "Viết lại" và màn không ghi điểm; lần viết xong được ghi nhận cho việc tạo thẻ ôn tập chiều viết (S9.1)

#### Scenario: S6.2-AC1 Viết lại sau khi hoàn thành
- **WHEN** người học đã viết xong chữ và bấm "Viết lại"
- **THEN** khung viết chỉ còn nét mờ của cả chữ, không còn nét đã viết; thông báo hoàn thành biến mất và hệ thống chờ nét đầu tiên

#### Scenario: S6.2-AC1 Chạm một điểm thì bỏ qua
- **WHEN** người học chạm hoặc nhấp một điểm trong khung viết mà không kéo, hoặc kéo một nét quá ngắn để coi là một nét
- **THEN** không có thông báo viết sai nét và không có nét nào được giữ lại trên khung
- **AND** bộ đếm sai không tăng; hệ thống vẫn chờ đúng nét hiện tại
