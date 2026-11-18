## ADDED Requirements

### Requirement: Có màn Cài đặt
Hệ thống SHALL có màn "Cài đặt" mở được từ liên kết "Cài đặt" trên màn Lộ trình. Màn Cài đặt MUST có ba nhóm "Mục tiêu mỗi ngày",
"Tốc độ audio mặc định" và "Hiện pinyin", mỗi nhóm có nhãn đọc được, hiện sẵn giá trị đang dùng, và MUST có liên kết quay về màn Lộ trình.
Mọi lựa chọn trên màn MUST thao tác được bằng bàn phím.

#### Scenario: S8.2-AC1 Mở Cài đặt từ màn Lộ trình
- **WHEN** người học bấm liên kết "Cài đặt" trên màn Lộ trình
- **THEN** người học vào màn Cài đặt
- **AND** màn có ba nhóm "Mục tiêu mỗi ngày", "Tốc độ audio mặc định" và "Hiện pinyin"

#### Scenario: S8.2-AC1 Quay về Lộ trình
- **WHEN** người học đang ở màn Cài đặt và bấm liên kết quay về Lộ trình
- **THEN** người học về màn Lộ trình

#### Scenario: S8.2-AC1 Đổi lựa chọn bằng bàn phím
- **WHEN** người học chỉ dùng phím Tab, phím mũi tên và phím Space trên màn Cài đặt
- **THEN** người học chọn được mức mục tiêu, mức tốc độ và bật/tắt được "Hiện pinyin"
- **AND** ô đang có focus nhìn thấy được

### Requirement: Đổi được mục tiêu phút mỗi ngày
Hệ thống SHALL cho người học đổi mục tiêu phút mỗi ngày trên màn Cài đặt, chọn một trong ba mức giống onboarding. Lựa chọn MUST được lưu
ngay khi chọn và giữ lại khi đóng rồi mở lại app. Đổi mục tiêu MUST NOT làm hiện lại onboarding.

| Mức | Nhãn |
|---|---|
| 15 | "15 phút" |
| 30 | "30 phút" |
| 60 | "60 phút" |

#### Scenario: S8.2-AC1 Hiện mục tiêu đã chọn ở onboarding
- **WHEN** người học đã chọn "30 phút" ở onboarding rồi mở màn Cài đặt
- **THEN** nhóm "Mục tiêu mỗi ngày" có ba lựa chọn "15 phút", "30 phút", "60 phút"
- **AND** "30 phút" đang được chọn

#### Scenario: S8.2-AC1 Đổi mục tiêu thì giữ sau khi mở lại app
- **WHEN** người học chọn "60 phút" trên màn Cài đặt, đóng app rồi mở lại màn Cài đặt
- **THEN** "60 phút" đang được chọn

#### Scenario: S8.2-AC1 Đổi mục tiêu không hiện lại onboarding
- **WHEN** người học đã xong onboarding, đổi mục tiêu trên màn Cài đặt rồi mở lại app
- **THEN** app không hiện màn chào mừng của onboarding

### Requirement: Chỉnh được tốc độ audio mặc định
Hệ thống SHALL cho người học chọn tốc độ audio mặc định trên màn Cài đặt. Lựa chọn MUST được lưu ngay khi chọn, giữ lại khi đóng rồi mở lại
app, và MUST quyết định trạng thái công tắc "Nghe chậm" mỗi khi mở một bài:

| Tốc độ audio mặc định | Công tắc "Nghe chậm" khi mở bài | Bấm "Nghe" phát ở |
|---|---|---|
| "Bình thường (1x)" (mặc định ban đầu) | Tắt | 1x |
| "Chậm (0.75x)" | Bật | 0.75x |

Bật/tắt "Nghe chậm" trong một bài MUST NOT đổi tốc độ audio mặc định trong Cài đặt.

#### Scenario: S8.2-AC2 Mặc định ban đầu là tốc độ thường
- **WHEN** người học chưa từng đổi tốc độ và mở màn Cài đặt
- **THEN** "Bình thường (1x)" đang được chọn

#### Scenario: S8.2-AC2 Chọn Chậm thì mở bài là phát chậm
- **WHEN** người học chọn "Chậm (0.75x)" trên màn Cài đặt, mở một bài rồi bấm "Nghe"
- **THEN** công tắc "Nghe chậm" đang bật
- **AND** audio phát ở tốc độ 0.75x

#### Scenario: S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app
- **WHEN** người học chọn "Chậm (0.75x)", đóng app rồi mở lại màn Cài đặt
- **THEN** "Chậm (0.75x)" đang được chọn

#### Scenario: S8.2-AC2 Tắt Nghe chậm trong bài không đổi Cài đặt
- **WHEN** tốc độ mặc định là "Chậm (0.75x)", người học tắt "Nghe chậm" trong một bài rồi mở màn Cài đặt
- **THEN** "Chậm (0.75x)" vẫn đang được chọn

### Requirement: Bật/tắt hiện pinyin
Hệ thống SHALL có công tắc "Hiện pinyin" trên màn Cài đặt, mặc định bật. Lựa chọn MUST được lưu ngay khi đổi và giữ lại khi đóng rồi mở lại
app. Khi tắt, câu "nói" MUST NOT hiện pinyin dưới chữ Hán của nội dung cần đọc.

#### Scenario: S8.2-AC3 Mặc định hiện pinyin
- **WHEN** người học chưa từng đổi "Hiện pinyin" và mở màn Cài đặt
- **THEN** công tắc "Hiện pinyin" đang bật và cho biết trạng thái bằng chữ hoặc nhãn đọc được, không chỉ bằng màu

#### Scenario: S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin
- **WHEN** người học tắt "Hiện pinyin" rồi mở một bài có câu "nói" với từ "你好" (nǐ hǎo, xin chào)
- **THEN** câu "nói" hiện chữ "你好" và nghĩa "xin chào"
- **AND** câu "nói" không hiện "nǐ hǎo"

#### Scenario: S8.2-AC3 Bật lại pinyin thì câu nói hiện pinyin
- **WHEN** người học đã tắt "Hiện pinyin", bật lại rồi mở một bài có câu "nói" với từ "你好"
- **THEN** câu "nói" hiện "你好", "nǐ hǎo" và "xin chào"

#### Scenario: S8.2-AC3 Tùy chọn pinyin giữ sau khi mở lại app
- **WHEN** người học tắt "Hiện pinyin", đóng app rồi mở lại màn Cài đặt
- **THEN** công tắc "Hiện pinyin" đang tắt

### Requirement: Tắt pinyin chỉ ẩn pinyin đi kèm chữ Hán
Khi "Hiện pinyin" tắt, hệ thống SHALL chỉ ẩn pinyin dưới chữ Hán của nội dung cần đọc ở câu "nói" (trước khi chấm); pinyin là lựa chọn,
ô gõ, đáp án, hoặc nằm trong phần giải thích sau khi chấm sai MUST vẫn hiện:

| Chỗ có pinyin | Khi tắt |
|---|---|
| Dưới chữ Hán cần nói, câu "nói" | Ẩn |
| Lựa chọn, câu phân biệt cặp âm | Hiện |
| Ô gõ và phần so sánh, câu gõ pinyin | Hiện |
| Đáp án sau khi chọn, câu chọn thanh | Hiện |
| Giải thích sau khi chấm sai | Hiện |

#### Scenario: S8.2-AC3 Tắt pinyin vẫn giữ pinyin của lựa chọn và đáp án
- **WHEN** người học tắt "Hiện pinyin" rồi làm câu phân biệt cặp âm và câu chọn thanh
- **THEN** câu phân biệt cặp âm vẫn có hai lựa chọn ghi pinyin
- **AND** câu chọn thanh, sau khi chọn, vẫn hiện thanh đúng kèm pinyin có dấu

#### Scenario: S8.2-AC3 Tắt pinyin vẫn gõ pinyin được
- **WHEN** người học tắt "Hiện pinyin" rồi làm câu gõ pinyin và gõ "ni3"
- **THEN** ô gõ hiện "nǐ"
- **AND** sau khi kiểm tra, phần so sánh vẫn hiện pinyin

#### Scenario: S8.2-AC3 Tắt pinyin vẫn hiện pinyin trong giải thích khi sai
- **WHEN** người học tắt "Hiện pinyin" và chọn "Chưa đúng" ở một câu "nói"
- **THEN** phần giải thích hiện chữ, pinyin và nghĩa của câu mẫu

### Requirement: Cài đặt được lưu an toàn
Hệ thống SHALL báo bằng chữ khi không lưu được một lựa chọn và MUST đưa lựa chọn đó về giá trị trước khi đổi. Thông báo lỗi MUST ở lại trên
màn cho tới khi một lần đổi kế tiếp lưu được thì biến mất; lỗi lặp lại MUST chỉ có một thông báo trên màn và MUST được đọc lại cho trình
đọc màn hình.

#### Scenario: S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ
- **WHEN** mục tiêu đang là "15 phút", người học chọn "30 phút" nhưng app không lưu được
- **THEN** màn hiện thông báo "Không lưu được cài đặt. Hãy thử lại." và thông báo được đọc cho trình đọc màn hình
- **AND** "15 phút" đang được chọn

#### Scenario: S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ
- **WHEN** tốc độ mặc định đang là "Bình thường (1x)", người học chọn "Chậm (0.75x)" nhưng app không lưu được
- **THEN** màn hiện thông báo "Không lưu được cài đặt. Hãy thử lại."
- **AND** "Bình thường (1x)" đang được chọn

#### Scenario: S8.2-AC3 Không lưu được pinyin thì công tắc về trạng thái cũ
- **WHEN** "Hiện pinyin" đang bật, người học tắt nhưng app không lưu được
- **THEN** màn hiện thông báo "Không lưu được cài đặt. Hãy thử lại."
- **AND** công tắc "Hiện pinyin" đang bật

#### Scenario: S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất
- **WHEN** màn đang hiện "Không lưu được cài đặt. Hãy thử lại." và người học chọn "30 phút", lần này app lưu được
- **THEN** màn không còn thông báo "Không lưu được cài đặt. Hãy thử lại."
- **AND** "30 phút" đang được chọn

#### Scenario: S8.2-AC1 Lỗi lặp lại chỉ có một thông báo
- **WHEN** người học chọn "30 phút" rồi chọn "60 phút", cả hai lần app đều không lưu được
- **THEN** màn chỉ có một thông báo "Không lưu được cài đặt. Hãy thử lại."
- **AND** thông báo được đọc lại cho trình đọc màn hình sau lần lỗi thứ hai

### Requirement: Cài đặt đọc không được thì dùng mặc định
Khi cài đặt đã lưu không đọc được, hệ thống SHALL dùng mặc định (15 phút, "Bình thường (1x)", bật pinyin) và MUST NOT báo lỗi. Tùy chọn nào hỏng thì chỉ tùy chọn đó về mặc định. Không đọc được cả cài đặt khi người học đã ở trong app thì màn học và màn Cài đặt dùng mặc định; mở app từ trang bắt đầu lúc đó vẫn như S1.3.

#### Scenario: S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định
- **WHEN** mục tiêu đã lưu là "60 phút", "Hiện pinyin" đã lưu là tắt, còn tốc độ mặc định đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** "Bình thường (1x)" đang được chọn
- **AND** "60 phút" đang được chọn và công tắc "Hiện pinyin" đang tắt
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC1 Mục tiêu đã lưu bị hỏng thì về 15 phút
- **WHEN** tốc độ mặc định đã lưu là "Chậm (0.75x)", còn mục tiêu đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** "15 phút" đang được chọn
- **AND** "Chậm (0.75x)" đang được chọn
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC3 Tùy chọn pinyin đã lưu bị hỏng thì về bật
- **WHEN** mục tiêu đã lưu là "30 phút", còn "Hiện pinyin" đã lưu không đọc được, và người học mở màn Cài đặt
- **THEN** công tắc "Hiện pinyin" đang bật
- **AND** "30 phút" đang được chọn
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin
- **WHEN** người học đang ở màn Lộ trình thì app không còn đọc được cài đặt trên máy, rồi người học mở một bài có câu "nói" với từ "你好" bằng liên kết trong app hoặc tải lại đúng trang bài đó (không đi qua trang bắt đầu)
- **THEN** bài mở bình thường, công tắc "Nghe chậm" đang tắt
- **AND** câu "nói" hiện "你好", "nǐ hǎo" và "xin chào"
- **AND** màn không hiện thông báo lỗi

#### Scenario: S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định
- **WHEN** người học đang ở màn Lộ trình thì app không còn đọc được cài đặt trên máy, rồi người học mở màn Cài đặt bằng liên kết "Cài đặt" hoặc tải lại đúng trang Cài đặt (không đi qua trang bắt đầu)
- **THEN** "15 phút", "Bình thường (1x)" đang được chọn và công tắc "Hiện pinyin" đang bật
- **AND** màn không hiện thông báo lỗi
- **AND** khi người học chọn "30 phút" mà không lưu được, màn báo "Không lưu được cài đặt. Hãy thử lại." và "15 phút" vẫn đang được chọn
