# speak-record Specification

## Purpose
ghi âm giọng người học, nghe lại bản ghi cạnh bản mẫu, bản ghi không được lưu.

## Requirements

### Requirement: Bấm để bắt đầu và dừng ghi âm
Hệ thống SHALL cho người học bấm một nút để bắt đầu ghi âm và bấm lại chính nút đó để dừng. Trong lúc ghi, màn MUST cho biết
đang ghi bằng chữ, không chỉ bằng màu.

#### Scenario: S5.1-AC1 Chưa ghi thì có nút Ghi âm
- **WHEN** một câu "nói" vừa hiện ra
- **THEN** có nút "Ghi âm"
- **AND** chưa có bản ghi nào và chưa ghi âm

#### Scenario: S5.1-AC1 Bấm Ghi âm thì bắt đầu ghi
- **WHEN** người học bấm "Ghi âm"
- **THEN** màn báo "Đang ghi âm"
- **AND** nút đổi thành "Dừng"

#### Scenario: S5.1-AC1 Bấm Dừng thì kết thúc ghi
- **WHEN** người học đang ghi âm và bấm "Dừng"
- **THEN** màn không còn báo "Đang ghi âm"
- **AND** nút đổi lại thành "Ghi âm"
- **AND** có một bản ghi để nghe lại

#### Scenario: S5.1-AC1 Ghi lại thì bản mới thay bản cũ
- **WHEN** người học đã có một bản ghi, bấm "Ghi âm" rồi "Dừng" lần nữa
- **THEN** màn chỉ có một bản ghi, là bản vừa ghi

#### Scenario: S5.1-AC1 Bắt đầu ghi thì audio đang phát dừng
- **WHEN** bản mẫu hoặc bản ghi đang phát và người học bấm "Ghi âm"
- **THEN** audio đang phát dừng
- **AND** màn bắt đầu ghi âm

#### Scenario: S5.1-AC1 Rời màn khi đang ghi thì dừng ghi
- **WHEN** người học đang ghi âm và rời bài
- **THEN** việc ghi âm dừng và micro không còn được dùng

### Requirement: Nghe lại bản ghi và bản mẫu, mỗi bản một nút
Hệ thống SHALL có hai nút riêng: "Nghe mẫu" phát bản mẫu và "Nghe bản ghi" phát giọng người học vừa ghi. Hệ thống MUST cho nghe
mỗi bản bao nhiêu lần tùy ý và MUST NOT để hai bản phát chồng lên nhau.

#### Scenario: S5.1-AC2 Chưa ghi thì chưa nghe được bản ghi
- **WHEN** người học chưa ghi âm câu này
- **THEN** có nút "Nghe mẫu" bấm được
- **AND** nút "Nghe bản ghi" không bấm được

#### Scenario: S5.1-AC2 Nghe mẫu
- **WHEN** người học bấm "Nghe mẫu"
- **THEN** bản mẫu của từ (hoặc câu) đó phát một lần từ đầu

#### Scenario: S5.1-AC2 Nghe bản ghi
- **WHEN** người học đã ghi âm và bấm "Nghe bản ghi"
- **THEN** giọng người học vừa ghi phát một lần từ đầu

#### Scenario: S5.1-AC2 Nghe cạnh nhau
- **WHEN** người học bấm "Nghe bản ghi" rồi bấm "Nghe mẫu"
- **THEN** bản ghi dừng và bản mẫu phát từ đầu
- **AND** không có hai luồng âm cùng lúc

#### Scenario: S5.1-AC2 Nghe lại nhiều lần
- **WHEN** người học bấm "Nghe bản ghi" 5 lần, mỗi lần sau khi lần trước đã phát xong
- **THEN** bản ghi phát đủ 5 lần
- **AND** nút "Nghe bản ghi" vẫn bấm được

#### Scenario: S5.1-AC2 Bản ghi không phát được
- **WHEN** người học bấm "Nghe bản ghi" nhưng bản ghi không phát được
- **THEN** màn hiện thông báo không phát được bản ghi
- **AND** người học vẫn ghi lại và nghe mẫu được

### Requirement: Bản ghi không được lưu lại sau khi rời bài
Hệ thống SHALL chỉ giữ bản ghi trong bộ nhớ khi người học đang ở câu đó và MUST xóa khi người học rời bài. Hệ thống MUST NOT lưu bản
ghi vào máy.

#### Scenario: S5.1-AC3 Rời bài rồi mở lại thì không còn bản ghi
- **WHEN** người học ghi âm một câu, thoát bài rồi mở lại bài đó
- **THEN** câu "nói" hiện ra chưa có bản ghi
- **AND** nút "Nghe bản ghi" không bấm được

#### Scenario: S5.1-AC3 Học tiếp từ câu đang dở cũng không có bản ghi
- **WHEN** người học ghi âm câu 3, thoát giữa bài rồi bấm học tiếp
- **THEN** màn hiện câu 3 chưa có bản ghi

#### Scenario: S5.1-AC3 Sang câu khác thì bản ghi của câu trước không còn
- **WHEN** người học ghi âm một câu "nói" rồi làm xong và sang câu "nói" kế
- **THEN** câu mới chưa có bản ghi
- **AND** bản ghi của câu trước không còn nghe được

#### Scenario: S5.1-AC3 Bản ghi không có trong dữ liệu lưu của máy
- **WHEN** người học ghi âm một câu rồi thoát bài
- **THEN** dữ liệu tiến độ lưu trên máy không chứa bản ghi nào
