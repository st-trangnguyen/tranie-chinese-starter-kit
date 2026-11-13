## ADDED Requirements

### Requirement: Nghe lại không giới hạn số lần
Hệ thống SHALL cho người học nghe audio của câu bao nhiêu lần tùy ý, kể cả sau khi câu đã được chấm. Hệ thống MUST NOT đặt giới hạn
số lần nghe và MUST NOT tự phát audio khi câu vừa hiện.

#### Scenario: S4.4-AC1 Câu vừa hiện thì chưa phát
- **WHEN** một câu nghe vừa hiện ra
- **THEN** chưa có audio nào phát
- **AND** có nút "Nghe"

#### Scenario: S4.4-AC1 Bấm Nghe thì phát âm của câu
- **WHEN** người học bấm "Nghe" ở một câu nghe
- **THEN** audio của từ (hoặc câu) trong câu đó phát một lần từ đầu

#### Scenario: S4.4-AC1 Nghe lại nhiều lần
- **WHEN** người học bấm "Nghe" 10 lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** audio phát đủ 10 lần
- **AND** nút "Nghe" vẫn bấm được

#### Scenario: S4.4-AC1 Nghe lại sau khi đã chấm
- **WHEN** câu đã được chấm và đang hiện kết quả
- **THEN** nút "Nghe" vẫn bấm được và phát lại audio

#### Scenario: S4.4-AC1 Bấm khi đang phát thì phát lại từ đầu
- **WHEN** audio đang phát và người học bấm "Nghe"
- **THEN** audio phát lại từ đầu, không có hai luồng âm cùng lúc

#### Scenario: S4.4-AC1 Sang câu khác thì dừng audio
- **WHEN** audio đang phát và người học sang câu kế
- **THEN** audio của câu trước dừng

#### Scenario: S4.4-AC1 Audio không phát được
- **WHEN** người học bấm "Nghe" nhưng audio không phát được
- **THEN** màn hiện thông báo không phát được audio
- **AND** người học vẫn trả lời được câu và bấm "Nghe" lại được

### Requirement: Chế độ chậm 0.75x
Hệ thống SHALL có công tắc "Nghe chậm" để phát audio ở tốc độ 0.75x. Trạng thái công tắc MUST giữ nguyên qua các câu của cùng một bài
và MUST về tắt khi mở một bài mới.

| Công tắc "Nghe chậm" | Tốc độ phát |
|---|---|
| Tắt (mặc định khi mở bài) | 1x |
| Bật | 0.75x |

#### Scenario: S4.4-AC2 Mặc định phát tốc độ thường
- **WHEN** người học mở bài, chưa bật "Nghe chậm" và bấm "Nghe"
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
- **WHEN** người học bật "Nghe chậm", thoát bài rồi mở một bài khác
- **THEN** công tắc "Nghe chậm" đang tắt
