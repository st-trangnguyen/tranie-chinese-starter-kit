## ADDED Requirements

### Requirement: Nút Tập viết trên màn xem thứ tự nét
Hệ thống SHALL có nút "Tập viết" trên màn xem thứ tự nét của một chữ có dữ liệu nét; bấm nút thì mở màn luyện viết của đúng chữ đó. Hệ thống MUST NOT hiện nút "Tập viết" khi chữ không có dữ liệu nét.

#### Scenario: S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét
- **WHEN** người học đang ở màn xem thứ tự nét của chữ "人" và bấm "Tập viết"
- **THEN** màn luyện viết của chữ "人" mở, chỉ có khung viết của đúng chữ đó

#### Scenario: S6.2-AC1 Nút Tập viết bấm được bằng bàn phím
- **WHEN** người học dùng Tab trên màn xem thứ tự nét của chữ "人" đến nút "Tập viết" và nhấn Enter
- **THEN** màn luyện viết của chữ "人" mở

#### Scenario: S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét
- **WHEN** người học mở màn xem thứ tự nét của một chữ không có dữ liệu nét
- **THEN** màn không hiện nút "Tập viết"
