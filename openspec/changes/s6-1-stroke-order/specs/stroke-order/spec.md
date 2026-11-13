## ADDED Requirements

### Requirement: Phát animation từng nét theo đúng thứ tự
Hệ thống SHALL phát animation vẽ từng nét của chữ Hán theo đúng thứ tự viết. Hệ thống MUST NOT vẽ hai nét cùng lúc.

#### Scenario: S6.1-AC1 Chữ hiện animation thứ tự nét
- **WHEN** người học mở màn xem thứ tự nét của một chữ có dữ liệu nét
- **THEN** màn hiện khối animation của chữ đó
- **AND** các nét được vẽ lần lượt, mỗi lúc một nét

#### Scenario: S6.1-AC1 Nét hiện đúng thứ tự viết
- **WHEN** animation của chữ "人" phát từ đầu đến hết
- **THEN** nét phẩy được vẽ trước, nét mác được vẽ sau
- **AND** khi phát xong, chữ hiện đủ 2 nét

#### Scenario: S6.1-AC1 Số nét được vẽ bằng số nét của chữ
- **WHEN** animation của một chữ có 4 nét phát xong
- **THEN** đã có đúng 4 nét được vẽ

### Requirement: Phát lại được
Hệ thống SHALL cho người học phát lại animation thứ tự nét bằng nút "Phát lại", khi đang phát và khi đã phát xong.

#### Scenario: S6.1-AC2 Có nút Phát lại
- **WHEN** người học mở màn xem thứ tự nét của một chữ có dữ liệu nét
- **THEN** màn có nút "Phát lại"

#### Scenario: S6.1-AC2 Phát lại sau khi đã phát xong
- **WHEN** animation đã phát xong và người học bấm "Phát lại"
- **THEN** chữ được xóa và animation phát lại từ nét đầu tiên
- **AND** các nét vẫn được vẽ theo đúng thứ tự

#### Scenario: S6.1-AC2 Phát lại khi đang phát
- **WHEN** animation đang vẽ giữa chừng và người học bấm "Phát lại"
- **THEN** animation bắt đầu lại từ nét đầu tiên
- **AND** không còn nét của lượt phát trước

#### Scenario: S6.1-AC2 Phát lại nhiều lần
- **WHEN** người học bấm "Phát lại" liên tiếp 3 lần, mỗi lần chờ phát xong
- **THEN** cả 3 lần animation phát đủ các nét theo đúng thứ tự
