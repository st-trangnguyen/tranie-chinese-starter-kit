# stroke-guided-writing Specification

## Purpose
viết từng nét trên khung viết có nét mờ cả chữ, báo sai ngay, gợi ý sau 3 lần sai liên tiếp.

## Requirements

### Requirement: Viết bằng ngón tay hoặc chuột trên khung viết
Viết bằng ngón tay hoặc chuột trên khung viết.

Hệ thống SHALL cho người học viết từng nét của chữ trên một khung viết bằng ngón tay (màn cảm ứng) hoặc chuột. Khung viết MUST hiện sẵn nét mờ của cả chữ để người học viết đè lên (tập tô). Hệ thống MUST hiện nét đang viết ngay khi người học di chuyển, MUST giữ lại trên khung các nét đã viết đúng, và MUST NOT làm cuộn trang khi người học viết trong khung.

#### Scenario: S6.2-AC1 Hiện khung viết có nét mờ của cả chữ
- **WHEN** người học mở luyện viết chữ "十" (có dữ liệu nét)
- **THEN** màn hiện khung viết của chữ "十" với đủ 2 nét mờ của cả chữ để viết đè lên
- **AND** chưa có nét nào được đánh dấu là đã viết

#### Scenario: S6.2-AC1 Viết bằng chuột
- **WHEN** người học nhấn giữ chuột và kéo trong khung viết
- **THEN** khung hiện nét vừa kéo

#### Scenario: S6.2-AC1 Viết bằng ngón tay
- **WHEN** người học chạm và kéo ngón tay trong khung viết trên màn cảm ứng
- **THEN** khung hiện nét vừa kéo
- **AND** trang không cuộn

#### Scenario: S6.2-AC1 Viết đúng nét thì sang nét kế
- **WHEN** người học viết đúng nét hiện tại của chữ
- **THEN** nét đó được giữ lại trên khung
- **AND** hệ thống chờ nét kế tiếp

#### Scenario: S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ
- **WHEN** người học viết đúng nét cuối cùng của chữ
- **THEN** màn báo đã viết xong chữ
- **AND** người học ở lại màn, có nút "Viết lại" và màn không ghi điểm hay tiến độ

#### Scenario: S6.2-AC1 Viết lại sau khi hoàn thành
- **WHEN** người học đã viết xong chữ và bấm "Viết lại"
- **THEN** khung viết chỉ còn nét mờ của cả chữ, không còn nét đã viết; thông báo hoàn thành biến mất và hệ thống chờ nét đầu tiên

#### Scenario: S6.2-AC1 Chạm một điểm thì bỏ qua
- **WHEN** người học chạm hoặc nhấp một điểm trong khung viết mà không kéo, hoặc kéo một nét quá ngắn để coi là một nét
- **THEN** không có thông báo viết sai nét và không có nét nào được giữ lại trên khung
- **AND** bộ đếm sai không tăng; hệ thống vẫn chờ đúng nét hiện tại

### Requirement: Màn luyện viết của một chữ
Hệ thống SHALL có màn riêng luyện viết đúng một chữ Hán mỗi lần. Hệ thống MUST NOT luyện lần lượt nhiều chữ trong cùng một màn. Màn MUST có liên kết "Xem thứ tự nét" quay về màn xem thứ tự nét của chữ đó.

#### Scenario: S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét
- **WHEN** người học đang ở màn luyện viết của chữ "人" và bấm liên kết "Xem thứ tự nét"
- **THEN** màn xem thứ tự nét của chữ "人" mở

#### Scenario: S6.2-AC1 Chữ không có dữ liệu nét
- **WHEN** màn luyện viết của một chữ không có dữ liệu nét được mở trực tiếp bằng địa chỉ trang hoặc từ lối vào của story khác (màn xem thứ tự nét không có nút "Tập viết" cho chữ này)
- **THEN** màn không hiện khung viết
- **AND** màn hiện thông báo "Chưa có dữ liệu nét cho chữ này."

### Requirement: Khung viết dùng được với bàn phím và công nghệ hỗ trợ
Hệ thống SHALL cho khung viết nhận focus bằng bàn phím, có nhãn đọc được bằng trình đọc màn hình và viền focus nhìn thấy. Vì viết là thao tác trỏ nên hệ thống MUST NOT yêu cầu bàn phím để viết nét, và MUST cho người không dùng được chuột hoặc cảm ứng xem thứ tự nét qua liên kết "Xem thứ tự nét".

#### Scenario: S6.2-AC1 Khung viết nhận focus bàn phím
- **WHEN** người học nhấn Tab trên màn luyện viết của chữ có dữ liệu nét
- **THEN** khung viết nhận focus, có viền focus nhìn thấy
- **AND** trình đọc màn hình đọc được nhãn của khung nêu chữ đang luyện viết

#### Scenario: S6.2-AC1 Đường thay thế khi không dùng được chuột hoặc cảm ứng
- **WHEN** người học chỉ dùng bàn phím trên màn luyện viết
- **THEN** người học đến được liên kết "Xem thứ tự nét" bằng Tab và mở được màn xem thứ tự nét bằng Enter

### Requirement: Viết sai nét thì báo ngay
Viết sai nét thì báo ngay.

Hệ thống SHALL báo ngay khi nét vừa viết không đúng nét kế tiếp của chữ. Với người học, nét sai gồm: sai thứ tự (viết một nét khác khi đang chờ nét hiện tại), sai hướng (đúng nét nhưng viết ngược hướng), và sai hình dạng rõ ràng (khác hẳn nét đang chờ). Hệ thống MUST xoá nét sai khỏi khung, MUST cho người học viết lại nét đó, và MUST NOT chặn hoặc kết thúc bài tập vì viết sai.

#### Scenario: S6.2-AC2 Báo ngay khi viết sai nét
- **WHEN** người học viết một nét không đúng nét kế tiếp
- **THEN** màn hiện thông báo viết sai nét ngay sau khi thả tay hoặc nhả chuột

#### Scenario: S6.2-AC2 Viết ngược hướng thì sai
- **WHEN** chữ "十" đang chờ nét ngang (viết từ trái sang phải) và người học viết nét ngang từ phải sang trái
- **THEN** màn hiện thông báo viết sai nét

#### Scenario: S6.2-AC2 Viết nét của một nét khác thì sai
- **WHEN** chữ "十" đang chờ nét ngang và người học viết nét sổ dọc (nét thứ hai)
- **THEN** màn hiện thông báo viết sai nét
- **AND** nét sổ dọc không được giữ lại trên khung

#### Scenario: S6.2-AC2 Nét sai bị xoá và được viết lại
- **WHEN** người học viết sai một nét
- **THEN** nét sai biến mất khỏi khung
- **AND** người học viết lại được nét đó

#### Scenario: S6.2-AC2 Thông báo sai đọc được bằng trình đọc màn hình
- **WHEN** màn hiện thông báo viết sai nét
- **THEN** thông báo được đọc cho trình đọc màn hình và focus không bị mất khỏi khung viết

#### Scenario: S6.2-AC2 Lần sai liên tiếp sau cũng được đọc lại
- **WHEN** người học viết sai cùng một nét 2 lần liên tiếp (thông báo sai có cùng nội dung)
- **THEN** trình đọc màn hình đọc thông báo viết sai nét ở cả lần sai thứ nhất và lần sai thứ hai

#### Scenario: S6.2-AC2 Viết đúng thì thông báo sai biến mất
- **WHEN** người học vừa viết sai rồi viết đúng nét đó
- **THEN** thông báo viết sai không còn hiện

### Requirement: Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó
Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó.

Hệ thống SHALL hiện gợi ý nét hiện tại khi người học viết sai nét đó 3 lần liên tiếp. Gợi ý là nét đúng hiện tại được làm nổi bật trên khung, phân biệt được với nét mờ của cả chữ, và MUST giữ nguyên đến khi người học viết đúng nét đó. Hệ thống MUST đếm riêng từng nét, MUST đếm lại từ 0 khi người học viết đúng, MUST NOT tính chạm một điểm hoặc nét quá ngắn là sai, và MUST NOT hiện gợi ý khi mới sai dưới 3 lần.

#### Scenario: S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý
- **WHEN** người học viết sai cùng một nét 2 lần liên tiếp
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý
- **WHEN** người học viết sai cùng một nét 3 lần liên tiếp
- **THEN** nét đúng hiện tại được làm nổi bật trên khung, phân biệt được với nét mờ của cả chữ
- **AND** các nét khác của chữ không được làm nổi bật

#### Scenario: S6.2-AC3 Bộ đếm sai tính riêng từng nét
- **WHEN** người học viết sai một nét 2 lần, viết đúng nét đó, rồi viết sai nét kế
- **THEN** sau lần sai thứ 2 của nét kế màn chưa hiện gợi ý (2 lần sai của nét trước không cộng dồn)
- **AND** sau lần sai thứ 3 của nét kế màn hiện gợi ý của nét kế, không phải nét trước

#### Scenario: S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai
- **WHEN** người học viết sai một nét 2 lần, rồi chạm một điểm trong khung, rồi viết sai nét đó thêm 1 lần
- **THEN** màn hiện gợi ý ở lần sai thứ 3 (lần chạm một điểm không được đếm, cũng không làm đếm lại)

#### Scenario: S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai
- **WHEN** gợi ý đang hiện và người học viết sai nét đó thêm một lần
- **THEN** gợi ý vẫn hiện

#### Scenario: S6.2-AC3 Viết đúng thì gợi ý ẩn
- **WHEN** gợi ý đang hiện và người học viết đúng nét đó
- **THEN** nét vừa viết đúng được giữ lại trên khung và không còn được làm nổi bật như gợi ý
- **AND** hệ thống chờ nét kế tiếp

#### Scenario: S6.2-AC3 Gợi ý không phụ thuộc chuyển động
- **WHEN** người học bật giảm chuyển động và gợi ý hiện
- **THEN** nét gợi ý được làm nổi bật tĩnh, không nháy hay chạy animation
- **AND** gợi ý vẫn phân biệt được với nét mờ của cả chữ

### Requirement: Khung viết tôn trọng giảm chuyển động
Hệ thống SHALL tắt hoặc hiện tức thì mọi hiệu ứng chuyển động trên khung viết (nét đúng hiện dần, nét viết mờ dần, nhấp sáng cả chữ khi hoàn thành) khi người học bật giảm chuyển động.

#### Scenario: S6.2-AC1 Giảm chuyển động trên khung viết
- **WHEN** người học bật giảm chuyển động, viết đúng một nét, viết sai một nét rồi viết xong chữ
- **THEN** nét đúng hiện ngay trên khung, không hiện dần
- **AND** nét sai biến mất ngay, không mờ dần, và khi hoàn thành chữ không có nhấp sáng cả chữ
