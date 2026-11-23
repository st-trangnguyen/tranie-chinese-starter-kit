## ADDED Requirements

### Requirement: Nút Ôn tập trên Trang chủ
Hệ thống SHALL có trên Trang chủ nút "Ôn tập" đưa người học tới màn ôn tập (S9.2), ở mọi tình huống kể cả khi chưa có thẻ ôn tập nào
và khi offline. Nút MUST tới được bằng Tab, bấm được bằng Enter, có viền focus nhìn thấy được. Các phần khác của Trang chủ không đổi.

#### Scenario: S9.2-AC1 Mở màn ôn tập từ Trang chủ
- **WHEN** người học bấm "Ôn tập" trên Trang chủ
- **THEN** người học vào màn ôn tập

#### Scenario: S9.2-AC1 Nút Ôn tập hiện cả khi chưa có thẻ
- **WHEN** người học vừa xong onboarding, chưa có thẻ ôn tập nào, và mở Trang chủ
- **THEN** Trang chủ có nút "Ôn tập"
- **AND** vẫn có nút "Vào học" và liên kết "Xem lộ trình"

#### Scenario: S9.2-AC1 Mở màn ôn tập từ Trang chủ bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới nút "Ôn tập" và nhấn Enter
- **THEN** nút có viền focus nhìn thấy được và người học vào màn ôn tập
