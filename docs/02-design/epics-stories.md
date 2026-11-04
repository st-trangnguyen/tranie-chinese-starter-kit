# 02 · Design: Epic & User story

> Trạng thái: **Đã chốt** · Ngày: 2026-10-27
> Liên quan: [Roadmap](roadmap.md) · [Business flow](business-flows.md) · [Architecture](../03-architecture.md)

## Tổng quan epic

| ID | Epic | Bản | Luồng | Số story |
|---|---|---|---|---|
| E1 | Nền tảng PWA | 0.1 | F1, F8 | 4 |
| E2 | Pipeline nội dung | 0.1 | (kỹ thuật) | 5 |
| E3 | Lộ trình & chạy bài | 0.1 (+0.2) | F3, F5 | 6 |
| E4 | Bài tập Nghe & Pinyin | 0.1 | F3 | 4 |
| E5 | Luyện nói | 0.1 | F6 | 4 |
| E6 | Luyện viết | 0.1 (+0.2) | F7 | 3 |
| E7 | Nội dung Nhập môn | 0.1 | (nội dung) | 1 |
| E8 | Trang chủ & dữ liệu cá nhân | 0.1 (+0.2) | F2, F8 | 5 |
| E9 | Ôn tập SRS | 0.2 | F4 | 5 |
| E10 | Bài tập Từ vựng / Ngữ pháp / Đọc / Hội thoại | 0.2 | F3 | 9 |
| E11 | Nội dung HSK 1 | 0.2 | (nội dung) | 5 |
| | **Tổng** | | | **51** |

**Thứ tự làm:**
- 0.1: E1 → E2 → E3 → E4 → E5 → E6 → E8 → E7. E7 soạn song song từ sau E2.
- 0.2: E9 → E10 → phần 0.2 của E3/E6/E8 → E11.

**Vai trò dùng trong story:**
- **Người học**: người dùng app.
- **Người soạn nội dung**: người chạy pipeline và soạn bài (hiện tại cũng là người học).

---

# Bản 0.1

## E1. Nền tảng PWA

### S1.1 Cài app lên màn hình chính · F1
Là người học, tôi muốn cài app lên màn hình chính của điện thoại và máy tính để mở nhanh như một app thật.
- **AC1** Lighthouse báo app cài được (installable).
- **AC2** Mở từ icon thì app chạy toàn màn hình (standalone), không có thanh địa chỉ.
- **AC3** Có icon app và màn splash khi mở.

### S1.2 Mở app khi không có mạng · F8
Là người học, tôi muốn mở app và học khi không có mạng để học được ở bất cứ đâu.
- **AC1** Đã mở app ít nhất 1 lần, sau đó tắt mạng và mở lại: vẫn vào được lộ trình.
- **AC2** Học được trọn các bài của bản 0.1 khi offline, kể cả audio.

### S1.3 Chọn mục tiêu mỗi ngày khi mở lần đầu · F1
Là người học, tôi muốn chọn mục tiêu số phút học mỗi ngày ngay khi mở app lần đầu để app theo dõi tiến độ theo đúng thời gian tôi có.
- **AC1** Lần mở đầu tiên hiện màn chào mừng, sau đó cho chọn 15 / 30 / 60 phút.
- **AC2** Nếu app chưa chạy như PWA thì gợi ý cài, có nút bỏ qua.
- **AC3** Onboarding chỉ hiện một lần. Lựa chọn được lưu lại và đổi được trong Cài đặt.
- **AC4** Xong onboarding thì vào thẳng bài 1 Nhập môn.

### S1.4 Nhận bản cập nhật · (kỹ thuật)
Là người học, tôi muốn biết khi app có bản mới để luôn dùng phiên bản mới nhất.
- **AC1** Push code lên nhánh `main` thì Cloudflare Pages tự build và deploy.
- **AC2** Khi đang mở app mà có bản mới, app hiện banner "Có bản mới, tải lại". Chỉ khi người học bấm thì app mới tải lại.

## E2. Pipeline nội dung

### S2.1 Nạp danh sách từ HSK 1 · (kỹ thuật)
Là người soạn nội dung, tôi muốn nạp danh sách từ HSK 3.0 cấp 1 thành dữ liệu của app để bài học dùng đúng bộ từ chuẩn.
- **AC1** Dữ liệu có đủ 500 từ cấp 1.
- **AC2** Mọi từ đều có pinyin có dấu. Build báo lỗi nếu từ nào thiếu.

### S2.2 Nghĩa tiếng Việt · (kỹ thuật)
Là người soạn nội dung, tôi muốn mỗi từ có nghĩa tiếng Việt lấy từ CVDICT và được review để người học hiểu đúng nghĩa.
- **AC1** Mỗi từ có ít nhất một nghĩa tiếng Việt.
- **AC2** Từ chưa có nghĩa hoặc chưa được review thì build báo cảnh báo, kèm danh sách các từ đó.

### S2.3 Soạn bài bằng YAML · (kỹ thuật)
Là người soạn nội dung, tôi muốn soạn bài bằng file YAML và được báo lỗi rõ ràng để sửa nhanh.
- **AC1** Build kiểm tra từng file bài theo schema chung.
- **AC2** Sai schema thì báo lỗi kèm tên file và số dòng.
- **AC3** Bài tham chiếu tới một từ không có trong từ điển thì báo lỗi kèm tên file và số dòng.

### S2.4 Tạo audio TTS · (kỹ thuật)
Là người soạn nội dung, tôi muốn audio cho mọi từ và câu được tạo tự động để không phải tự thu âm.
- **AC1** Mỗi từ và câu có một file mp3 tạo bằng edge-tts (giọng nữ XiaoxiaoNeural, giọng nam YunxiNeural cho vai thứ hai trong hội thoại).
- **AC2** Tên file theo hash của nội dung. Nội dung không đổi thì không tạo lại.

### S2.5 Dữ liệu nét chữ · (kỹ thuật)
Là người soạn nội dung, tôi muốn dữ liệu nét chữ chỉ gồm những chữ có dùng trong bài để app nhẹ.
- **AC1** Build chỉ lấy dữ liệu hanzi-writer cho những chữ xuất hiện trong nội dung.
- **AC2** Chữ nào không có dữ liệu nét thì build báo cảnh báo.

## E3. Lộ trình & chạy bài

### S3.1 Bản đồ lộ trình · F5
Là người học, tôi muốn xem bản đồ lộ trình để biết mình đang ở đâu và tiếp theo học gì.
- **AC1** Hiện các giai đoạn và bài theo thứ tự.
- **AC2** Mỗi bài có một trong ba trạng thái: khóa / đang mở / đã xong.
- **AC3** Bấm vào bài khóa thì không vào được.

### S3.2 Chạy bài · F3
Là người học, tôi muốn làm lần lượt từng câu trong bài và biết ngay mình đúng hay sai để sửa kịp thời.
- **AC1** Các câu hiện lần lượt, có thanh tiến độ.
- **AC2** Mỗi câu chấm ngay sau khi trả lời.
- **AC3** Trả lời sai thì hiện giải thích trước khi sang câu sau.

### S3.3 Học tiếp từ câu đang dở · F3
Là người học, tôi muốn thoát giữa chừng mà không mất tiến độ để học tiếp lúc khác.
- **AC1** Thoát giữa bài thì vị trí câu hiện tại được lưu.
- **AC2** Mở lại bài thì học tiếp từ câu đó.

### S3.4 Tổng kết bài và mở khóa · F3, F5
Là người học, tôi muốn xem kết quả cuối bài để biết mình làm tốt tới đâu.
- **AC1** Màn tổng kết hiện điểm, thời gian, số câu sai.
- **AC2** Xong một bài thì bài kế tiếp mở (theo quy tắc mở khóa của Nhập môn).

## E4. Bài tập Nghe & Pinyin

### S4.1 Nghe chọn thanh · F3
Là người học, tôi muốn nghe một âm rồi chọn thanh điệu để luyện tai phân biệt thanh.
- **AC1** Có 5 lựa chọn: thanh 1, 2, 3, 4 và thanh nhẹ.
- **AC2** Chọn xong thì hiện đáp án đúng kèm pinyin có dấu.

### S4.2 Phân biệt cặp âm gần nhau · F3
Là người học, tôi muốn phân biệt các cặp âm dễ nhầm để phát âm và nghe chuẩn.
- **AC1** Có các cặp như zh/z, q/ch, an/ang, ü/u.
- **AC2** Nghe một âm, chọn đúng âm trong cặp, sau đó nghe lại được cả hai âm để so sánh.

### S4.3 Nghe rồi gõ pinyin · F3
Là người học, tôi muốn nghe rồi gõ pinyin để nhớ cách ghi âm.
- **AC1** Gõ kiểu số (`ni3`) thì tự đổi thành dấu (`nǐ`).
- **AC2** Chấp nhận cả kiểu gõ số và kiểu gõ có dấu.
- **AC3** Sai thì tô chỗ sai (thanh mẫu, vận mẫu hoặc thanh điệu).

### S4.4 Nghe lại và nghe chậm · F3
Là người học, tôi muốn nghe lại nhiều lần và nghe chậm để nghe rõ.
- **AC1** Nghe lại không giới hạn số lần.
- **AC2** Có chế độ chậm 0.75x.

## E5. Luyện nói

### S5.1 Ghi âm và so sánh · F6
Là người học, tôi muốn ghi âm giọng mình và nghe cạnh bản mẫu để tự nhận ra chỗ khác.
- **AC1** Bấm để bắt đầu và dừng ghi âm.
- **AC2** Nghe lại bản ghi và bản mẫu, mỗi bản một nút.
- **AC3** Bản ghi không được lưu lại sau khi rời bài.

### S5.2 Tự đánh giá · F6
Là người học, tôi muốn tự đánh giá phát âm của mình để ghi nhận kết quả bài.
- **AC1** Có 3 mức: Chưa đúng / Gần đúng / Đúng.
- **AC2** Mức đánh giá được tính vào điểm của bài.

### S5.3 Chấm tự động · F6
Là người học, tôi muốn app chấm phát âm khi có thể để có thêm góc nhìn khách quan.
- **AC1** Chỉ hiện khi có mạng và trình duyệt hỗ trợ Web Speech (`zh-CN`).
- **AC2** Hiện chữ mà máy nhận được, tô màu chỗ khác với câu đúng.
- **AC3** Không hỗ trợ thì ẩn phần chấm tự động, bài tập vẫn dùng bình thường.

### S5.4 Khi không có mic · F6
Là người học, tôi muốn vẫn luyện được khi không có mic hoặc mic bị chặn để không bị kẹt bài.
- **AC1** Hiện hướng dẫn cách cấp quyền mic.
- **AC2** Bài tập chuyển sang dạng "đọc to rồi tự chấm".

## E6. Luyện viết

### S6.1 Xem thứ tự nét · F7
Là người học, tôi muốn xem animation thứ tự nét để biết cách viết đúng.
- **AC1** Phát animation từng nét theo đúng thứ tự.
- **AC2** Phát lại được.

### S6.2 Viết theo nét có gợi ý · F7
Là người học, tôi muốn tập viết từng nét có hướng dẫn để nhớ cách viết.
- **AC1** Viết bằng ngón tay hoặc chuột trên khung viết.
- **AC2** Viết sai nét thì báo ngay.
- **AC3** Sai 3 lần liên tiếp ở một nét thì hiện gợi ý nét đó.

## E7. Nội dung Nhập môn

### S7.1 Soạn 12 bài Nhập môn · (nội dung)
Là người soạn nội dung, tôi muốn có đủ 12 bài Nhập môn để người học nắm pinyin và chữ Hán cơ bản.
- **AC1** Mỗi bài có audio và ít nhất 2 dạng bài tập.
- **AC2** Danh sách bài:
  1. Thanh 1–4
  2. Thanh nhẹ và biến điệu (3-3, 不, 一)
  3. Vận mẫu đơn
  4. Thanh mẫu b p m f d t n l
  5. Thanh mẫu g k h j q x
  6. Thanh mẫu zh ch sh r z c s
  7. Vận mẫu kép
  8. Vận mẫu mũi
  9. Quy tắc viết pinyin
  10. Nét cơ bản và thứ tự nét
  11. 30 bộ thủ phổ biến
  12. Ôn tổng hợp + câu chào đầu tiên
- **AC3** `content:check` chạy qua mà không có lỗi.

## E8. Trang chủ & dữ liệu cá nhân

### S8.1 Trang chủ · F2
Là người học, tôi muốn mở app là thấy ngay hôm nay cần học gì để bắt đầu nhanh.
- **AC1** Hiện bài tiếp theo, bấm vào là vào bài.
- **AC2** Hiện số phút đã học hôm nay so với mục tiêu.

### S8.2 Cài đặt · F1, F2
Là người học, tôi muốn chỉnh các tùy chọn học để hợp với mình.
- **AC1** Đổi được mục tiêu phút mỗi ngày.
- **AC2** Chỉnh được tốc độ audio mặc định.
- **AC3** Bật/tắt hiện pinyin.

---

# Bản 0.2

## E9. Ôn tập SRS

### S9.1 Tạo thẻ ôn tập · F4
Là người học, tôi muốn từ mới tự thành thẻ ôn tập để không phải tự tạo.
- **AC1** Học xong một từ thì tạo thẻ theo 2 chiều: nghĩa (nhìn chữ đoán nghĩa) và nghe (nghe chọn chữ).
- **AC2** Thẻ chiều viết (nhìn nghĩa viết chữ) chỉ được tạo sau khi từ đó đã được viết theo nét ít nhất 1 lần.

### S9.2 Màn ôn tập · F4
Là người học, tôi muốn ôn các thẻ đến hạn và tự chấm mức nhớ để app xếp lịch ôn hợp lý.
- **AC1** Lấy các thẻ đến hạn, mỗi thẻ hỏi theo chiều của nó.
- **AC2** Tự chấm 4 mức: Quên / Khó / Được / Dễ.
- **AC3** FSRS tính ngày ôn tiếp theo. Phần xếp lịch có unit test.

### S9.3 Giới hạn mỗi ngày · F4
Là người học, tôi muốn giới hạn số thẻ mỗi ngày để không bị quá tải.
- **AC1** Mặc định tối đa 20 thẻ mới và 200 lượt ôn mỗi ngày.
- **AC2** Chỉnh được trong Cài đặt.

### S9.4 Câu sai vào SRS · F4, F5
Là người học, tôi muốn các câu làm sai trong bài kiểm tra được đưa vào ôn tập để khắc phục điểm yếu.
- **AC1** Câu sai trong bài kiểm tra tạo thẻ, hoặc đưa thẻ có sẵn về trạng thái cần ôn sớm.

### S9.5 Thống kê ôn tập · F4
Là người học, tôi muốn xem thống kê ôn tập để biết tiến bộ của mình.
- **AC1** Hiện số thẻ theo từng trạng thái (mới / đang học / đã nhớ).
- **AC2** Dự báo số lượt ôn mỗi ngày trong 7 ngày tới.

## E10. Bài tập Từ vựng / Ngữ pháp / Đọc / Hội thoại

### S10.1 Flashcard từ mới · F3
Là người học, tôi muốn xem thẻ từ mới đầy đủ thông tin để học từ.
- **AC1** Thẻ hiện chữ Hán, pinyin, nghĩa tiếng Việt, audio, câu ví dụ.

### S10.2 Nghe chọn chữ / Nhìn chữ chọn nghĩa · F3
Là người học, tôi muốn luyện nhận diện từ qua nghe và đọc để nhớ từ.
- **AC1** Dạng nghe: nghe audio rồi chọn chữ đúng trong các lựa chọn.
- **AC2** Dạng đọc: nhìn chữ rồi chọn nghĩa đúng trong các lựa chọn.

### S10.3 Sắp xếp câu · F3
Là người học, tôi muốn sắp xếp các từ thành câu đúng để nắm trật tự câu.
- **AC1** Kéo hoặc chạm để sắp xếp các từ.
- **AC2** Chấm theo đáp án. Sai thì hiện câu đúng.

### S10.4 Điền chỗ trống · F3
Là người học, tôi muốn điền từ còn thiếu trong câu để luyện dùng từ và ngữ pháp.
- **AC1** Chọn hoặc gõ từ vào chỗ trống, chấm ngay.

### S10.5 Thẻ ngữ pháp · F3
Là người học, tôi muốn đọc giải thích ngữ pháp bằng tiếng Việt để hiểu cách dùng.
- **AC1** Thẻ có giải thích tiếng Việt, cấu trúc câu và ví dụ có audio.

### S10.6 Hội thoại · F3
Là người học, tôi muốn nghe hội thoại theo cách linh hoạt để luyện nghe hiểu.
- **AC1** Nghe cả bài hoặc từng câu.
- **AC2** Bật/tắt pinyin và bản dịch tiếng Việt.

### S10.7 Đóng vai · F3, F6
Là người học, tôi muốn đóng một vai trong hội thoại để luyện nói như giao tiếp thật.
- **AC1** App phát lời vai A, người học ghi âm lời vai B.
- **AC2** Dùng lại phần ghi âm, so sánh và đánh giá của E5.

### S10.8 Đọc hiểu · F3
Là người học, tôi muốn đọc đoạn văn ngắn và trả lời câu hỏi để luyện đọc.
- **AC1** Đoạn văn ngắn kèm câu hỏi trắc nghiệm.
- **AC2** Chạm vào một từ để xem pinyin và nghĩa.

### S10.9 Tra từ · F3
Là người học, tôi muốn tra từ ngay trong app khi không có mạng để không phải mở app khác.
- **AC1** Tìm được theo chữ Hán, pinyin (có dấu hoặc không) hoặc nghĩa tiếng Việt.
- **AC2** Chạy offline.

## Phần 0.2 của E3, E6, E8

### S3.5 Kiểm tra cuối chủ đề · F5
Là người học, tôi muốn làm bài kiểm tra cuối mỗi chủ đề để chắc mình đã nắm trước khi đi tiếp.
- **AC1** Đạt từ 80% trở lên thì mở chủ đề tiếp theo.
- **AC2** Không đạt thì làm lại được. Các câu sai được đưa vào SRS (S9.4).

### S3.6 Kiểm tra vượt cấp · F5
Là người học, tôi muốn bỏ qua chủ đề mình đã biết để không mất thời gian.
- **AC1** Chủ đề chưa mở có nút "Kiểm tra vượt cấp".
- **AC2** Đạt từ 80% trở lên thì chủ đề đó được đánh dấu đã xong và chủ đề tiếp theo mở.

### S6.3 Viết không gợi ý · F7, F4
Là người học, tôi muốn viết chữ không có gợi ý để kiểm tra mình nhớ thật hay chưa.
- **AC1** Khung viết không hiện nét mờ.
- **AC2** Kết quả được dùng để chấm thẻ SRS chiều viết.

### S8.3 Streak · F2
Là người học, tôi muốn thấy chuỗi ngày học liên tục để có động lực học đều.
- **AC1** Ngày nào số phút học đạt mục tiêu thì streak tăng 1.
- **AC2** Streak hiện trên trang chủ.

### S8.4 Tải audio offline theo chủ đề · F8
Là người học, tôi muốn tải trước audio của một chủ đề để học offline.
- **AC1** Mỗi chủ đề có nút tải, hiện dung lượng.
- **AC2** Xóa được audio đã tải.

### S8.5 Export / Import tiến độ · F8
Là người học, tôi muốn chuyển tiến độ giữa điện thoại và máy tính để học trên cả hai.
- **AC1** Export ra một file JSON chứa toàn bộ tiến độ.
- **AC2** Import kiểm tra file hợp lệ trước. File lỗi thì báo lỗi và giữ nguyên dữ liệu cũ.
- **AC3** File hợp lệ thì hỏi xác nhận rồi ghi đè toàn bộ tiến độ.

## E11. Nội dung HSK 1

### S11.1 15 chủ đề HSK 1 · (nội dung)
Là người soạn nội dung, tôi muốn có 15 chủ đề × 5 bài phủ đủ từ vựng HSK 1 để người học không bỏ sót từ nào.
- **AC1** 15 chủ đề, mỗi chủ đề 5 bài: Từ mới / Ngữ pháp / Hội thoại / Viết chữ / Kiểm tra.
- **AC2** Script kiểm tra báo phủ 100% trong 500 từ cấp 1.

### S11.2 Ngữ pháp HSK 1 · (nội dung)
Là người soạn nội dung, tôi muốn các điểm ngữ pháp cấp 1 theo HSK 3.0 được phân bổ vào các chủ đề để học dần.
- **AC1** Mọi điểm ngữ pháp cấp 1 đều xuất hiện trong ít nhất một bài Ngữ pháp.

### S11.3 Review nghĩa tiếng Việt · (nội dung)
Là người soạn nội dung, tôi muốn toàn bộ nghĩa tiếng Việt được review để tránh dạy sai.
- **AC1** Cả 500 từ đều được đánh dấu đã review. Build không còn cảnh báo của S2.2.

### S11.4 Kiểm tra cuối cấp · (nội dung)
Là người học, tôi muốn làm bài kiểm tra cuối HSK 1 để biết mình đã đạt cấp độ này chưa.
- **AC1** Bài kiểm tra gồm đủ 4 kỹ năng nghe, nói, đọc, viết.

### S11.5 Audio HSK 1 đầy đủ · (nội dung)
Là người soạn nội dung, tôi muốn mọi từ, câu và hội thoại đều có audio để người học luôn nghe được.
- **AC1** `content:check` báo không thiếu file audio nào.
