## ADDED Requirements

### Requirement: Phát animation từng nét theo đúng thứ tự
Phát animation từng nét theo đúng thứ tự.

Khi giảm chuyển động tắt, hệ thống SHALL tự phát animation một lần khi người học mở màn xem thứ tự nét của một chữ có dữ liệu nét. Hệ thống MUST NOT vẽ hai nét cùng lúc.

#### Scenario: S6.1-AC1 Chữ hiện animation và tự phát khi mở
- **WHEN** người học mở màn xem thứ tự nét của chữ "好" (có dữ liệu nét, giảm chuyển động tắt)
- **THEN** màn hiện khối animation của chữ "好"
- **AND** ngay khi mở, chưa có nét nào hiện và animation bắt đầu phát mà không cần bấm gì

#### Scenario: S6.1-AC1 Mỗi lúc chỉ vẽ một nét
- **WHEN** animation của chữ "好" đang phát (giảm chuyển động tắt)
- **THEN** sau mỗi bước, số nét đã hiện chỉ tăng đúng một nét
- **AND** ở mọi thời điểm không có hai nét cùng đang được vẽ

#### Scenario: S6.1-AC1 Nét hiện đúng thứ tự viết
- **WHEN** animation của chữ "人" phát từ đầu đến hết
- **THEN** nét phẩy hiện xong trước khi nét mác bắt đầu được vẽ
- **AND** khi phát xong, chữ hiện đủ 2 nét

#### Scenario: S6.1-AC1 Số nét được vẽ bằng số nét của chữ
- **WHEN** animation của chữ "白" (5 nét) phát xong
- **THEN** đã có đúng 5 nét được vẽ

#### Scenario: S6.1-AC1 Animation chỉ tự phát một lần
- **WHEN** animation của chữ "人" đã phát xong và người học không bấm gì
- **THEN** animation không tự phát lại; chữ giữ nguyên đủ 2 nét

### Requirement: Phát lại được
Phát lại được.

Hệ thống SHALL cho người học phát lại animation bằng nút "Phát lại". Khi có animation (giảm chuyển động tắt), nút MUST luôn bấm được, cả khi animation đang phát và khi đã phát xong.

#### Scenario: S6.1-AC2 Có nút Phát lại bấm được
- **WHEN** người học mở màn xem thứ tự nét của chữ "人" (có dữ liệu nét, giảm chuyển động tắt)
- **THEN** màn có nút "Phát lại"
- **AND** nút bấm được ngay, khi animation đang phát lẫn sau khi phát xong

#### Scenario: S6.1-AC2 Phát lại sau khi đã phát xong
- **WHEN** animation của chữ "人" đã phát xong và người học bấm "Phát lại"
- **THEN** ngay sau khi bấm, chưa có nét nào hiện
- **AND** các nét được vẽ lại từ nét đầu tiên theo đúng thứ tự, xong thì hiện đủ 2 nét

#### Scenario: S6.1-AC2 Phát lại khi đang phát
- **WHEN** animation của chữ "好" đang vẽ giữa chừng (đã hiện ít nhất 1 nét, chưa đủ 6 nét) và người học bấm "Phát lại"
- **THEN** ngay sau khi bấm, chưa có nét nào hiện (không còn nét của lượt phát trước)
- **AND** animation vẽ lại từ nét đầu tiên, xong thì hiện đủ 6 nét, không có nét thừa

#### Scenario: S6.1-AC2 Phát lại nhiều lần
- **WHEN** người học bấm "Phát lại" 3 lần liên tiếp trên chữ "人", mỗi lần chờ phát xong rồi mới bấm
- **THEN** cả 3 lần animation phát đủ 2 nét theo đúng thứ tự

### Requirement: Màn xem thứ tự nét của một chữ
Hệ thống SHALL có màn riêng xem thứ tự nét của đúng một chữ Hán mỗi lần. Hệ thống MUST NOT xem lần lượt nhiều chữ trong cùng một màn.

#### Scenario: S6.1-AC1 Màn chỉ hiện một chữ
- **WHEN** người học mở màn xem thứ tự nét của chữ "好"
- **THEN** màn chỉ hiện khối animation của chữ "好", không hiện chữ nào khác để xem lần lượt

### Requirement: Chữ chưa có dữ liệu nét
Hệ thống SHALL hiện thông báo thay cho animation khi chữ không có dữ liệu nét. Hệ thống MUST NOT hiện khối animation và MUST ẩn nút "Phát lại" trong trường hợp này.

#### Scenario: S6.1-AC1 Chữ không có dữ liệu nét
- **WHEN** người học mở màn xem thứ tự nét của một chữ không có dữ liệu nét (ví dụ "龘")
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện khối animation và không hiện nút "Phát lại"

### Requirement: Giảm chuyển động
Khi người học bật giảm chuyển động của thiết bị, hệ thống SHALL hiện thứ tự nét tĩnh có đánh số thay cho animation. Hệ thống MUST ẩn nút "Phát lại" trong trường hợp này.

#### Scenario: S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh
- **WHEN** người học bật giảm chuyển động và mở màn xem thứ tự nét của chữ "白" (5 nét)
- **THEN** màn hiện đủ 5 nét ngay lập tức, mỗi nét có số thứ tự từ 1 đến 5 đúng thứ tự viết
- **AND** không có animation chạy và không có nút "Phát lại"
