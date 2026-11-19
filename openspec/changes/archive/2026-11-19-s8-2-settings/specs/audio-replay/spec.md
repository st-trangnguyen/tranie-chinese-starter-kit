## MODIFIED Requirements

### Requirement: Chế độ chậm 0.75x
Hệ thống SHALL có công tắc "Nghe chậm" để phát audio ở tốc độ 0.75x. Trạng thái công tắc MUST giữ nguyên qua các câu của cùng một bài
và MUST về theo tốc độ audio mặc định trong Cài đặt mỗi lần vào màn học của một bài, kể cả mở lại chính bài vừa thoát hoặc học tiếp bài
đang dở. Bật/tắt công tắc trong bài MUST NOT đổi tốc độ mặc định trong Cài đặt.

| Công tắc "Nghe chậm" | Tốc độ phát |
|---|---|
| Tắt (khi mở bài, nếu tốc độ mặc định là "Bình thường (1x)") | 1x |
| Bật (khi mở bài, nếu tốc độ mặc định là "Chậm (0.75x)") | 0.75x |

#### Scenario: S4.4-AC2 Mặc định phát tốc độ thường
- **WHEN** tốc độ mặc định trong Cài đặt là "Bình thường (1x)", người học mở bài, chưa bật "Nghe chậm" và bấm "Nghe"
- **THEN** audio phát ở tốc độ 1x

#### Scenario: S4.4-AC2 Bật Nghe chậm thì phát 0.75x
- **WHEN** người học bật "Nghe chậm" rồi bấm "Nghe"
- **THEN** audio phát ở tốc độ 0.75x
- **AND** công tắc "Nghe chậm" cho biết đang bật

#### Scenario: S4.4-AC2 Tắt Nghe chậm thì về tốc độ thường
- **WHEN** người học đang bật "Nghe chậm" rồi tắt, sau đó bấm "Nghe"
- **THEN** audio phát ở tốc độ 1x

#### Scenario: S4.4-AC2 Nghe chậm giữ qua các câu trong bài
- **WHEN** người học bật "Nghe chậm" ở câu 1 rồi sang câu 2 và bấm "Nghe"
- **THEN** công tắc "Nghe chậm" vẫn bật
- **AND** audio phát ở tốc độ 0.75x

#### Scenario: S4.4-AC2 Mở bài mới thì về tốc độ thường
- **WHEN** tốc độ mặc định trong Cài đặt là "Bình thường (1x)", người học bật "Nghe chậm", thoát bài rồi vào lại màn học (bài khác, chính bài đó, hoặc học tiếp bài đang dở)
- **THEN** công tắc "Nghe chậm" đang tắt

#### Scenario: S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm
- **WHEN** tốc độ mặc định trong Cài đặt là "Chậm (0.75x)", người học tắt "Nghe chậm" trong một bài, thoát bài rồi vào lại màn học (bài khác, chính bài đó, hoặc học tiếp bài đang dở)
- **THEN** công tắc "Nghe chậm" đang bật
- **AND** bấm "Nghe" thì audio phát ở tốc độ 0.75x
