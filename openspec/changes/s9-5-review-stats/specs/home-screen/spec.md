## ADDED Requirements

### Requirement: Liên kết Thống kê ôn tập trên Trang chủ
Hệ thống SHALL có trên Trang chủ liên kết "Thống kê ôn tập", đặt ngay sau nút "Ôn tập" (S9.2), đưa người học tới màn Thống kê ôn tập
(S9.5), ở mọi tình huống kể cả khi chưa có thẻ ôn tập nào và khi offline. Liên kết MUST tới được bằng Tab, mở được bằng Enter, có viền
focus nhìn thấy được. Các phần khác của Trang chủ không đổi; Trang chủ không hiện số thẻ đến hạn.

#### Scenario: S9.5-AC1 Mở màn Thống kê ôn tập từ Trang chủ
- **WHEN** người học bấm "Thống kê ôn tập" trên Trang chủ
- **THEN** người học vào màn Thống kê ôn tập

#### Scenario: S9.5-AC1 Liên kết Thống kê ôn tập hiện cả khi chưa có thẻ
- **WHEN** người học vừa xong onboarding, chưa có thẻ ôn tập nào, và mở Trang chủ
- **THEN** Trang chủ có liên kết "Thống kê ôn tập"
- **AND** vẫn có nút "Vào học", nút "Ôn tập" và liên kết "Xem lộ trình"

#### Scenario: S9.5-AC1 Mở màn Thống kê ôn tập bằng bàn phím
- **WHEN** người học chỉ dùng bàn phím, Tab tới liên kết "Thống kê ôn tập" và nhấn Enter
- **THEN** liên kết có viền focus nhìn thấy được và người học vào màn Thống kê ôn tập
