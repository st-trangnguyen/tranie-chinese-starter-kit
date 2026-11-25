## ADDED Requirements

### Requirement: Liên kết Tra từ trên Trang chủ
Hệ thống SHALL có trên Trang chủ liên kết "Tra từ" đưa người học tới màn Tra từ (S10.9), ở mọi tình huống kể cả khi chưa học bài nào
và khi offline. Liên kết MUST tới được bằng Tab, mở được bằng Enter, có viền focus nhìn thấy được. Các phần khác của Trang chủ không đổi.

#### Scenario: S10.9-AC1 Mở màn Tra từ từ Trang chủ
- **WHEN** người học bấm "Tra từ" trên Trang chủ
- **THEN** người học vào màn Tra từ

#### Scenario: S10.9-AC1 Liên kết Tra từ hiện cả khi chưa học bài nào
- **WHEN** người học vừa xong onboarding, chưa học bài nào, và mở Trang chủ
- **THEN** Trang chủ có liên kết "Tra từ"
- **AND** vẫn có nút "Vào học" và liên kết "Xem lộ trình"

#### Scenario: S10.9-AC1 Mở màn Tra từ bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới liên kết "Tra từ" và nhấn Enter
- **THEN** liên kết có viền focus nhìn thấy được và người học vào màn Tra từ
