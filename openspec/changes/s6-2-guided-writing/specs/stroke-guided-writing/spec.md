## ADDED Requirements

### Requirement: Viết bằng ngón tay hoặc chuột trên khung viết
Hệ thống SHALL cho người học viết từng nét của chữ trên một khung viết bằng ngón tay (màn cảm ứng) hoặc chuột. Hệ thống MUST hiện nét đang viết ngay khi người học di chuyển, và MUST NOT làm cuộn trang khi người học viết trong khung.

#### Scenario: S6.2-AC1 Hiện khung viết cho chữ có dữ liệu nét
- **WHEN** người học mở luyện viết một chữ có dữ liệu nét
- **THEN** màn hiện khung viết trống của chữ đó

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

#### Scenario: S6.2-AC1 Chữ không có dữ liệu nét
- **WHEN** người học mở luyện viết một chữ không có dữ liệu nét
- **THEN** màn không hiện khung viết
- **AND** màn báo chữ này chưa có hướng dẫn viết

### Requirement: Viết sai nét thì báo ngay
Hệ thống SHALL báo ngay khi nét vừa viết không đúng nét kế tiếp của chữ. Hệ thống MUST xoá nét sai khỏi khung, MUST cho người học viết lại nét đó, và MUST NOT chặn hoặc kết thúc bài tập vì viết sai.

#### Scenario: S6.2-AC2 Báo ngay khi viết sai nét
- **WHEN** người học viết một nét không đúng nét kế tiếp
- **THEN** màn hiện thông báo viết sai nét ngay sau khi thả tay hoặc nhả chuột

#### Scenario: S6.2-AC2 Nét sai bị xoá và được viết lại
- **WHEN** người học viết sai một nét
- **THEN** nét sai biến mất khỏi khung
- **AND** người học viết lại được nét đó

#### Scenario: S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình
- **WHEN** màn hiện thông báo viết sai nét
- **THEN** thông báo được đọc cho trình đọc màn hình và focus không bị mất khỏi khung viết

#### Scenario: S6.2-AC2 Viết đúng thì thông báo sai biến mất
- **WHEN** người học vừa viết sai rồi viết đúng nét đó
- **THEN** thông báo viết sai không còn hiện

### Requirement: Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó
Hệ thống SHALL hiện gợi ý nét hiện tại khi người học viết sai nét đó 3 lần liên tiếp. Hệ thống MUST đếm riêng từng nét, MUST đếm lại từ 0 khi người học viết đúng, và MUST NOT hiện gợi ý khi mới sai dưới 3 lần.

#### Scenario: S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý
- **WHEN** người học viết sai cùng một nét 2 lần liên tiếp
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý
- **WHEN** người học viết sai cùng một nét 3 lần liên tiếp
- **THEN** màn hiện gợi ý chỉ vị trí và hướng của nét đó trên khung

#### Scenario: S6.2-AC3 Viết đúng xen giữa thì đếm lại
- **WHEN** người học viết sai một nét 2 lần, viết đúng nét đó, rồi viết sai nét kế 2 lần
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Sang nét khác thì đếm lại từ 0
- **WHEN** người học viết đúng nét hiện tại sau 2 lần sai, rồi sai nét kế 1 lần
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai
- **WHEN** gợi ý đang hiện và người học viết sai nét đó thêm một lần
- **THEN** gợi ý vẫn hiện

#### Scenario: S6.2-AC3 Viết đúng thì gợi ý ẩn
- **WHEN** gợi ý đang hiện và người học viết đúng nét đó
- **THEN** gợi ý biến mất
- **AND** hệ thống chờ nét kế tiếp

#### Scenario: S6.2-AC3 Gợi ý không phụ thuộc chuyển động
- **WHEN** người học bật giảm chuyển động và gợi ý hiện
- **THEN** gợi ý hiện tĩnh, không nháy hay chạy animation
