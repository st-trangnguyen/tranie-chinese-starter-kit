# audio-replay Specification

## Purpose
nghe, nghe lại không giới hạn và nghe chậm 0.75x cho câu nghe.

## Requirements

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
Hệ thống SHALL có công tắc "Nghe chậm" để phát audio ở tốc độ 0.75x.

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

### Requirement: Tốc độ Nghe chậm qua các câu và khi mở bài
Trạng thái công tắc "Nghe chậm" MUST giữ nguyên qua các câu của cùng một bài
và MUST về theo tốc độ audio mặc định trong Cài đặt mỗi lần vào màn học của một bài, kể cả mở lại chính bài vừa thoát hoặc học tiếp bài
đang dở. Bật/tắt công tắc trong bài MUST NOT đổi tốc độ mặc định trong Cài đặt.

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
