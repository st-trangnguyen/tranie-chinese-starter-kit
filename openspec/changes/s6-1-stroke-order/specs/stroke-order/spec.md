## ADDED Requirements

### Requirement: Phát animation từng nét theo đúng thứ tự
Phát animation từng nét theo đúng thứ tự.

Khi giảm chuyển động tắt, hệ thống SHALL tự phát animation một lần khi người học mở màn xem thứ tự nét của một chữ có dữ liệu nét. Trong khối animation, hệ thống SHALL hiện chữ mờ của cả chữ làm nền suốt lúc vẽ; chữ mờ nền không tính là nét đã vẽ. Hệ thống MUST NOT vẽ hai nét cùng lúc.

#### Scenario: S6.1-AC1 Chữ hiện animation và tự phát khi mở
- **WHEN** người học mở màn xem thứ tự nét của chữ "好" (có dữ liệu nét, giảm chuyển động tắt)
- **THEN** màn hiện khối animation của chữ "好"
- **AND** ngay khi mở, chưa có nét nào được vẽ (chỉ có chữ mờ nền) và animation bắt đầu phát mà không cần bấm gì

#### Scenario: S6.1-AC1 Chữ mờ nền hiện trong lúc vẽ
- **WHEN** animation của chữ "好" đang phát (giảm chuyển động tắt)
- **THEN** khối animation hiện chữ mờ của cả chữ "好" làm nền, ở mọi thời điểm từ lúc mở đến khi phát xong
- **AND** chữ mờ nền không được đếm vào số nét đã vẽ

#### Scenario: S6.1-AC1 Mỗi lúc chỉ vẽ một nét
- **WHEN** animation của chữ "好" đang phát (giảm chuyển động tắt)
- **THEN** sau mỗi bước, số nét đã được vẽ chỉ tăng đúng một nét
- **AND** ở mọi thời điểm không có hai nét cùng đang được vẽ

#### Scenario: S6.1-AC1 Nét hiện đúng thứ tự viết
- **WHEN** animation của chữ "人" phát từ đầu đến hết
- **THEN** nét phẩy được vẽ xong trước khi nét mác bắt đầu được vẽ
- **AND** khi phát xong, chữ có đủ 2 nét đã được vẽ

#### Scenario: S6.1-AC1 Số nét được vẽ bằng số nét của chữ
- **WHEN** animation của chữ "白" (5 nét) phát xong
- **THEN** đã có đúng 5 nét được vẽ

#### Scenario: S6.1-AC1 Animation chỉ tự phát một lần
- **WHEN** animation của chữ "人" đã phát xong và người học không bấm gì
- **THEN** animation không tự phát lại; chữ giữ nguyên đủ 2 nét đã được vẽ

### Requirement: Phát lại được
Phát lại được.

Hệ thống SHALL cho người học phát lại animation bằng nút "Phát lại". Khi có animation (giảm chuyển động tắt), nút MUST luôn bấm được, cả khi animation đang phát và khi đã phát xong.

#### Scenario: S6.1-AC2 Có nút Phát lại bấm được
- **WHEN** người học mở màn xem thứ tự nét của chữ "人" (có dữ liệu nét, giảm chuyển động tắt)
- **THEN** màn có nút "Phát lại"
- **AND** nút bấm được ngay, khi animation đang phát lẫn sau khi phát xong

#### Scenario: S6.1-AC2 Phát lại sau khi đã phát xong
- **WHEN** animation của chữ "人" đã phát xong và người học bấm "Phát lại"
- **THEN** ngay sau khi bấm, chưa có nét nào được vẽ (chỉ có chữ mờ nền)
- **AND** các nét được vẽ lại từ nét đầu tiên theo đúng thứ tự, xong thì có đủ 2 nét đã được vẽ

#### Scenario: S6.1-AC2 Phát lại khi đang phát
- **WHEN** animation của chữ "好" đang vẽ giữa chừng (đã vẽ ít nhất 1 nét, chưa đủ 6 nét) và người học bấm "Phát lại"
- **THEN** ngay sau khi bấm, chưa có nét nào được vẽ (chỉ có chữ mờ nền, không còn nét của lượt phát trước)
- **AND** animation vẽ lại từ nét đầu tiên, xong thì có đủ 6 nét đã được vẽ, không có nét thừa

#### Scenario: S6.1-AC2 Phát lại nhiều lần
- **WHEN** người học bấm "Phát lại" 3 lần liên tiếp trên chữ "人", mỗi lần chờ phát xong rồi mới bấm
- **THEN** cả 3 lần animation vẽ đủ 2 nét theo đúng thứ tự

### Requirement: Màn xem thứ tự nét của một chữ
Hệ thống SHALL có màn riêng xem thứ tự nét của đúng một chữ Hán mỗi lần. Hệ thống MUST NOT xem lần lượt nhiều chữ trong cùng một màn.

#### Scenario: S6.1-AC1 Màn chỉ hiện một chữ
- **WHEN** người học mở màn xem thứ tự nét của chữ "好"
- **THEN** màn chỉ hiện khối animation của chữ "好", không hiện chữ nào khác để xem lần lượt

### Requirement: Chữ chưa có dữ liệu nét hoặc không hợp lệ
Hệ thống SHALL hiện thông báo "Chưa có dữ liệu nét cho chữ này." thay cho animation khi chữ được yêu cầu không hợp lệ hoặc không có dữ liệu nét. Hệ thống MUST NOT hiện khối animation và MUST ẩn nút "Phát lại" trong trường hợp này.

| Chữ được yêu cầu | Ví dụ |
|---|---|
| Chữ Hán không có dữ liệu nét | "龘" |
| Rỗng | "" |
| Không phải chữ Hán | "abc" |
| Nhiều hơn một chữ | "你好" |

#### Scenario: S6.1-AC1 Chữ không có dữ liệu nét
- **WHEN** người học mở màn xem thứ tự nét của một chữ không có dữ liệu nét (ví dụ "龘")
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện khối animation và không hiện nút "Phát lại"

#### Scenario: S6.1-AC1 Chữ được yêu cầu rỗng
- **WHEN** người học mở màn xem thứ tự nét mà không có chữ nào được chỉ định
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện khối animation và không hiện nút "Phát lại"

#### Scenario: S6.1-AC1 Chữ được yêu cầu không phải chữ Hán
- **WHEN** người học mở màn xem thứ tự nét của "abc"
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện khối animation và không hiện nút "Phát lại"

#### Scenario: S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ
- **WHEN** người học mở màn xem thứ tự nét của "你好"
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện khối animation, không hiện nút "Phát lại" và không hiện riêng chữ "你" hay "好"

### Requirement: Đang tải dữ liệu nét
Trong lúc đang tải dữ liệu nét, hệ thống SHALL hiện "Đang tải…" và MUST NOT hiện khối animation hay nút "Phát lại".

#### Scenario: S6.1-AC1 Đang tải dữ liệu nét
- **WHEN** người học mở màn xem thứ tự nét của chữ "人" và dữ liệu nét chưa tải xong
- **THEN** màn hiện "Đang tải…"
- **AND** màn không hiện khối animation, không hiện nút "Phát lại"

### Requirement: Lỗi tải dữ liệu nét
Khi tải dữ liệu nét lỗi (không tải được, dữ liệu hỏng hoặc sai cấu trúc), hệ thống SHALL hiện thông báo "Có lỗi xảy ra" kèm nút "Thử lại", và MUST NOT hiện khối animation, nút "Phát lại" hay thông báo "Chưa có dữ liệu nét cho chữ này.".

#### Scenario: S6.1-AC1 Tải dữ liệu nét lỗi
- **WHEN** người học mở màn xem thứ tự nét của chữ "人" và việc tải dữ liệu nét thất bại
- **THEN** màn hiện thông báo "Có lỗi xảy ra" và nút "Thử lại"
- **AND** màn không hiện khối animation, không hiện nút "Phát lại", không hiện "Chưa có dữ liệu nét cho chữ này."

#### Scenario: S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc
- **WHEN** người học mở màn xem thứ tự nét của chữ "人" và dữ liệu nét nhận được bị hỏng hoặc sai cấu trúc
- **THEN** màn hiện thông báo "Có lỗi xảy ra" và nút "Thử lại"
- **AND** màn không hiện khối animation và không hiện nút "Phát lại"

#### Scenario: S6.1-AC1 Thử lại sau khi tải lỗi
- **WHEN** màn của chữ "人" đang hiện "Có lỗi xảy ra", người học bấm "Thử lại" và lần tải này thành công (giảm chuyển động tắt)
- **THEN** thông báo lỗi biến mất, màn hiện khối animation của chữ "人" và nút "Phát lại"
- **AND** animation tự phát và vẽ đủ 2 nét

### Requirement: Xem thứ tự nét khi không có mạng
Khi người học đã mở app ít nhất một lần, hệ thống SHALL vẫn hiện được animation thứ tự nét của mọi chữ có dữ liệu nét trong bản app đang dùng khi không có mạng. Với chữ không có dữ liệu nét hoặc không hợp lệ, khi không có mạng hệ thống SHALL hiện "Chưa có dữ liệu nét cho chữ này." giống như khi có mạng, và MUST NOT hiện "Có lỗi xảy ra".

#### Scenario: S6.1-AC1 Xem animation khi offline
- **WHEN** người học đã mở app ít nhất một lần, sau đó mất mạng và mở màn xem thứ tự nét của chữ "人" (giảm chuyển động tắt)
- **THEN** màn hiện khối animation của chữ "人" và animation phát đủ 2 nét
- **AND** màn không hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này."

#### Scenario: S6.1-AC1 Mọi chữ có dữ liệu nét đều xem được khi offline
- **WHEN** người học đã mở app ít nhất một lần, sau đó mất mạng và lần lượt mở màn xem thứ tự nét của từng chữ có dữ liệu nét trong bản app: "人", "你", "八", "十", "四", "好", "爸", "白", "百" (giảm chuyển động tắt)
- **THEN** với mỗi chữ, màn hiện khối animation và animation phát đủ số nét của chữ đó
- **AND** không chữ nào hiện "Có lỗi xảy ra" hay "Chưa có dữ liệu nét cho chữ này."

#### Scenario: S6.1-AC1 Chữ không có dữ liệu nét khi offline
- **WHEN** người học đã mở app ít nhất một lần, sau đó mất mạng và mở màn xem thứ tự nét của chữ "龘" (không có dữ liệu nét)
- **THEN** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."
- **AND** màn không hiện "Có lỗi xảy ra", không hiện nút "Thử lại", không hiện khối animation và không hiện nút "Phát lại"

### Requirement: Giảm chuyển động
Khi người học bật giảm chuyển động của thiết bị, hệ thống SHALL hiện thứ tự nét tĩnh có đánh số thay cho animation. Hệ thống MUST ẩn nút "Phát lại" trong trường hợp này. Cài đặt giảm chuyển động chỉ được xét lúc mở màn; đổi cài đặt trong lúc đang ở màn thì màn giữ nguyên cách hiện cho tới khi người học mở lại màn.

#### Scenario: S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh
- **WHEN** người học bật giảm chuyển động và mở màn xem thứ tự nét của chữ "白" (5 nét)
- **THEN** màn hiện đủ 5 nét ngay lập tức, mỗi nét có số thứ tự từ 1 đến 5 đúng thứ tự viết
- **AND** không có animation chạy và không có nút "Phát lại"

#### Scenario: S6.1-AC1 Đổi giảm chuyển động khi đang ở màn
- **WHEN** người học đang ở màn xem thứ tự nét của chữ "人" với giảm chuyển động tắt, rồi bật giảm chuyển động mà không rời màn
- **THEN** màn vẫn giữ khối animation và nút "Phát lại" như lúc mở
- **AND** khi người học mở lại màn của chữ "人", màn hiện thứ tự nét tĩnh có đánh số và không có nút "Phát lại"
