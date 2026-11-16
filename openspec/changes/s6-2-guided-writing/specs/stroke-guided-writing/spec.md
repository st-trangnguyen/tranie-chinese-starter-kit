## ADDED Requirements

### Requirement: Viết bằng ngón tay hoặc chuột trên khung viết
Viết bằng ngón tay hoặc chuột trên khung viết.

Hệ thống SHALL cho người học viết từng nét của chữ trên một khung viết bằng ngón tay (màn cảm ứng) hoặc chuột. Hệ thống MUST hiện nét đang viết ngay khi người học di chuyển, và MUST NOT làm cuộn trang khi người học viết trong khung.

#### Scenario: S6.2-AC1 Hiện khung viết cho chữ có dữ liệu nét
- **WHEN** người học mở luyện viết một chữ có dữ liệu nét
- **THEN** màn hiện khung viết trống của chữ đó

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
- **THEN** khung viết trống, thông báo hoàn thành biến mất và hệ thống chờ nét đầu tiên

#### Scenario: S6.2-AC1 Chạm một điểm thì bỏ qua
- **WHEN** người học chạm hoặc nhấp một điểm trong khung viết mà không kéo, hoặc kéo một nét quá ngắn để coi là một nét
- **THEN** không có thông báo viết sai nét và không có nét nào được giữ lại trên khung
- **AND** bộ đếm sai không tăng; hệ thống vẫn chờ đúng nét hiện tại

### Requirement: Màn luyện viết của một chữ
Hệ thống SHALL có màn riêng luyện viết đúng một chữ Hán mỗi lần, vào được từ nút "Tập viết" trên màn xem thứ tự nét của chữ đó. Hệ thống MUST NOT luyện lần lượt nhiều chữ trong cùng một màn. Màn MUST có liên kết "Xem thứ tự nét" quay về màn xem thứ tự nét của chữ đó.

#### Scenario: S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét
- **WHEN** người học đang ở màn xem thứ tự nét của chữ "人" và bấm "Tập viết"
- **THEN** màn luyện viết của chữ "人" mở, chỉ có khung viết của đúng chữ đó
- **AND** màn có liên kết "Xem thứ tự nét" về màn xem thứ tự nét của chữ "人"

#### Scenario: S6.2-AC1 Chữ không có dữ liệu nét
- **WHEN** người học mở luyện viết một chữ không có dữ liệu nét
- **THEN** màn không hiện khung viết
- **AND** màn hiện thông báo "Chưa có hướng dẫn viết cho chữ này."

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

#### Scenario: S6.2-AC2 Viết đúng thì thông báo sai biến mất
- **WHEN** người học vừa viết sai rồi viết đúng nét đó
- **THEN** thông báo viết sai không còn hiện

### Requirement: Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó
Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó.

Hệ thống SHALL hiện gợi ý nét hiện tại khi người học viết sai nét đó 3 lần liên tiếp. Gợi ý là nét đúng hiện mờ trên khung, có điểm bắt đầu và mũi tên chỉ hướng viết. Hệ thống MUST đếm riêng từng nét, MUST đếm lại từ 0 khi người học viết đúng, MUST NOT tính chạm một điểm hoặc nét quá ngắn là sai, và MUST NOT hiện gợi ý khi mới sai dưới 3 lần.

#### Scenario: S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý
- **WHEN** người học viết sai cùng một nét 2 lần liên tiếp
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý
- **WHEN** người học viết sai cùng một nét 3 lần liên tiếp
- **THEN** màn hiện nét đúng mờ trên khung, kèm điểm bắt đầu và mũi tên chỉ hướng viết của nét đó

#### Scenario: S6.2-AC3 Viết đúng xen giữa thì đếm lại
- **WHEN** người học viết sai một nét 2 lần, viết đúng nét đó, rồi viết sai nét kế 2 lần
- **THEN** màn chưa hiện gợi ý

#### Scenario: S6.2-AC3 Nét kế sai 3 lần thì gợi ý nét kế
- **WHEN** người học viết sai một nét 2 lần, viết đúng nét đó, rồi viết sai nét kế 3 lần
- **THEN** màn hiện gợi ý của nét kế (không phải gợi ý nét trước)

#### Scenario: S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai
- **WHEN** người học viết sai một nét 2 lần, rồi chạm một điểm trong khung, rồi viết sai nét đó thêm 1 lần
- **THEN** màn hiện gợi ý ở lần sai thứ 3 (lần chạm một điểm không được đếm, cũng không làm đếm lại)

#### Scenario: S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai
- **WHEN** gợi ý đang hiện và người học viết sai nét đó thêm một lần
- **THEN** gợi ý vẫn hiện

#### Scenario: S6.2-AC3 Viết đúng thì gợi ý ẩn
- **WHEN** gợi ý đang hiện và người học viết đúng nét đó
- **THEN** gợi ý biến mất
- **AND** hệ thống chờ nét kế tiếp

#### Scenario: S6.2-AC3 Gợi ý không phụ thuộc chuyển động
- **WHEN** người học bật giảm chuyển động và gợi ý hiện
- **THEN** gợi ý hiện tĩnh, không nháy hay chạy animation
