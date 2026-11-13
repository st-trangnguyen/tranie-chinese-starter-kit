## ADDED Requirements

### Requirement: Khung viết không hiện nét mờ
Khung viết ở chế độ không gợi ý SHALL không hiện nét mờ của chữ. Hệ thống MUST NOT hiện gợi ý nét trong chế độ này, kể cả khi người học sai nhiều lần liên tiếp ở một nét.

#### Scenario: S6.3-AC1 Khung viết trống, không có nét mờ
- **WHEN** người học mở chữ cần viết ở chế độ không gợi ý
- **THEN** khung viết hiện trống, không có nét mờ của chữ

#### Scenario: S6.3-AC1 Sai nhiều lần liên tiếp vẫn không hiện gợi ý nét
- **WHEN** người học viết sai 3 lần liên tiếp ở một nét
- **THEN** khung viết không hiện gợi ý nét đó

#### Scenario: S6.3-AC1 Viết được bằng ngón tay hoặc chuột
- **WHEN** người học viết một nét lên khung viết
- **THEN** nét hiện ra theo đường người học vẽ

### Requirement: Kết quả viết được dùng để chấm thẻ SRS chiều viết
Hệ thống SHALL quy kết quả viết thành một mức chấm (Quên / Khó / Được / Dễ) và dùng mức đó để chấm thẻ SRS chiều viết của chữ vừa viết. Người học MUST NOT phải tự chọn mức.

| Kết quả viết | Mức chấm |
|---|---|
| Viết xong, không sai nét nào | Dễ |
| Viết xong, sai 1 nét | Được |
| Viết xong, sai 2 nét | Được |
| Viết xong, sai 3 nét | Khó |
| Viết xong, sai nhiều hơn 3 nét | Khó |
| Bỏ dở, rời chữ khi chưa viết xong | Quên |

#### Scenario: S6.3-AC2 Viết đúng hết thì chấm Dễ
- **WHEN** người học viết xong chữ mà không sai nét nào
- **THEN** thẻ chiều viết của chữ đó được chấm "Dễ"

#### Scenario: S6.3-AC2 Sai 1 đến 2 nét thì chấm Được
- **WHEN** người học viết xong chữ với 1 hoặc 2 lần sai nét
- **THEN** thẻ chiều viết của chữ đó được chấm "Được"

#### Scenario: S6.3-AC2 Sai từ 3 nét thì chấm Khó
- **WHEN** người học viết xong chữ với từ 3 lần sai nét trở lên
- **THEN** thẻ chiều viết của chữ đó được chấm "Khó"

#### Scenario: S6.3-AC2 Bỏ dở thì chấm Quên
- **WHEN** người học rời chữ khi chưa viết xong
- **THEN** thẻ chiều viết của chữ đó được chấm "Quên"

#### Scenario: S6.3-AC2 Người học không phải chọn mức
- **WHEN** người học viết xong chữ
- **THEN** màn không hiện lựa chọn Quên / Khó / Được / Dễ để người học bấm
