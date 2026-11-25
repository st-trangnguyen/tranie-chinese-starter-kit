# Test cases: S10.9 Tra từ

Bản nháp do `qa` soạn, QA người thật chỉnh khi nghiệm thu. Case xếp theo Requirement của `specs/home-screen/spec.md` và
`specs/dictionary/spec.md`. Các quyết định `ba` đề xuất trong Open Questions của proposal được dùng nguyên văn; nếu người thật chốt khác
thì sửa case tương ứng.

Mọi Scenario của story đều mang ID `S10.9-AC1` (trừ offline là `S10.9-AC2`), nên cột Scenario ghi thêm tên Scenario và số thứ tự trong ID
case chạy liên tục trong cùng một AC.

**Điều kiện đầu chung**

- Chạy trên bản build (không phải bản dev). Mỗi case bắt đầu từ trình duyệt sạch dữ liệu của app, đã xong onboarding, chưa học bài nào,
  có mạng, trừ khi case nêu khác.
- **Mở màn Tra từ** = ở Trang chủ bấm "Tra từ".
- **Gõ "X"** = đặt focus vào ô tìm kiếm có nhãn "Tra từ", xóa nội dung cũ (nếu có) rồi gõ X. Không bấm nút hay phím nào khác; kết quả
  phải tự cập nhật.
- **Gõ "X" dạng tổ hợp** = nhập X với chữ có dấu viết thành chữ gốc kèm dấu rời (ví dụ "ǐ" = "i" + dấu thanh rời, "ê" = "e" + dấu mũ rời,
  "ọ" = "o" + dấu nặng rời). e2e điền thẳng chuỗi đó vào ô; chạy tay dán chuỗi đã chuẩn bị sẵn hoặc dùng bộ gõ tiếng Việt ở bảng mã
  "Unicode tổ hợp".
- **Kết quả có A** = trong danh sách kết quả có một dòng mà chữ Hán là A (kèm pinyin nếu case ghi). **Kết quả không có A** = không dòng nào
  có chữ Hán là A (với pinyin case ghi, nếu có). **Dòng thứ n** đếm từ trên xuống trong danh sách kết quả.
- **Nghĩa của dòng** = toàn bộ nghĩa của từ, theo thứ tự, ngăn bằng "; ", so đúng từng chữ.
- **Câu gợi ý** = "Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt để tra từ." (đúng từng chữ). **Câu lỗi** = "Không tải được từ điển." (đúng
  từng chữ).
- **Giả lập lỗi tải danh sách từ**: e2e chặn việc tải danh sách từ của app; chạy tay chỉ đọc kết quả e2e (bản build không có công tắc
  nào để gây lỗi).
- **"Không cuộn ngang"**: e2e kiểm chiều rộng nội dung trang không lớn hơn khổ màn; chạy tay vuốt ngang không dịch được nội dung.
- **"Viền focus nhìn thấy được"**: quanh thành phần đang focus có viền phân biệt rõ với nền, ở cả giao diện sáng và tối.
- **Tắt mạng**: e2e đặt trình duyệt offline; chạy tay dùng chế độ máy bay hoặc tắt Wi-Fi.
- Dữ liệu mẫu lấy từ danh sách 500 từ HSK 1 hiện có của app (đã đối chiếu từng case):
  - 爱 ài, nghĩa "yêu; thích; tình cảm; có khuynh hướng (làm gì đó); có xu hướng (xảy ra)"
  - 爱好 àihào, nghĩa "thích; đam mê; lấy làm thú vui; say mê; sở thích"
  - 谁 shéi, nghĩa "ai; cũng đọc là [shui2]"
  - 哪些 nǎxiē, nghĩa "những cái nào?; ai?; gì?"
  - 女 nǚ, nghĩa "nữ; phụ nữ; con gái"
  - 地 de (nghĩa "trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa đứng trước") và 地 dì (nghĩa "đất; mặt
    đất; ruộng; vùng")
  - 学 xué, 学生 xuésheng, 学习 xuéxí, 学校 xuéxiào, 大学 dàxué, 大学生 dàxuéshēng, 小学生 xiǎo xuésheng
  - 你 nǐ, 你们 nǐmen, 年 nián, 您 nín, 水 shuǐ, 睡 shuì

  Nếu nội dung đổi thì cập nhật case.

## Trang chủ: liên kết Tra từ (`home-screen`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-1 | S10.9-AC1 Mở màn Tra từ từ Trang chủ | Chức năng | Mở Trang chủ, bấm "Tra từ" | Vào màn Tra từ: có tiêu đề "Tra từ" và ô tìm kiếm | e2e |
| TC-S10.9-AC1-2 | S10.9-AC1 Liên kết Tra từ hiện cả khi chưa học bài nào | Chức năng | Vừa xong onboarding, chưa học bài nào, mở Trang chủ | Trang chủ có liên kết "Tra từ", nút "Vào học" và liên kết "Xem lộ trình" | e2e |
| TC-S10.9-AC1-3 | S10.9-AC1 Mở màn Tra từ bằng bàn phím | A11y | Ở Trang chủ chỉ dùng bàn phím: nhấn Tab đến khi focus ở "Tra từ", nhấn Enter | Khi focus ở "Tra từ" có viền focus nhìn thấy được; sau Enter vào màn Tra từ | e2e |
| TC-S10.9-AC1-4 | S10.9-AC1 Mở màn Tra từ bằng bàn phím | Sáng/Tối | Chuyển giao diện tối, ở Trang chủ Tab tới "Tra từ"; lặp lại ở giao diện sáng | Ở cả hai giao diện, viền focus quanh "Tra từ" nhìn thấy được | không |
| TC-S10.9-AC1-5 | S10.9-AC1 Liên kết Tra từ hiện cả khi chưa học bài nào | Offline | Đã mở app một lần và xong onboarding; tắt mạng, mở lại app | Trang chủ vẫn có liên kết "Tra từ"; bấm vào thì vào màn Tra từ | không |

## Màn Tra từ: tìm theo ba cách (`dictionary`)

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-6 | S10.9-AC1 Tìm theo chữ Hán | Chức năng | Mở màn Tra từ, gõ "学" | Kết quả có 学, 学生, 学习 và 大学 (dù chưa học bài nào chứa các từ này) | e2e |
| TC-S10.9-AC1-7 | S10.9-AC1 Tìm theo pinyin có dấu | Chức năng | Mở màn Tra từ, gõ "nǐ" | Kết quả có 你 (nǐ) và 你们 (nǐmen) | e2e |
| TC-S10.9-AC1-8 | S10.9-AC1 Tìm theo pinyin không dấu | Chức năng | Mở màn Tra từ, gõ "ni" | Kết quả có 你, 你们, 年 và 您 | e2e |
| TC-S10.9-AC1-9 | S10.9-AC1 Tìm theo nghĩa tiếng Việt | Chức năng | Mở màn Tra từ, gõ "yêu" | Kết quả có 爱; nghĩa của dòng đó là "yêu; thích; tình cảm; có khuynh hướng (làm gì đó); có xu hướng (xảy ra)" | e2e |
| TC-S10.9-AC1-10 | S10.9-AC1 Một chuỗi khớp cả pinyin lẫn nghĩa | Chức năng | Mở màn Tra từ, gõ "ai" | Kết quả có 爱 (ài), 爱好 (àihào), 谁 (shéi) và 哪些 (nǎxiē); mỗi từ trong bốn từ này chỉ có đúng một dòng | e2e |

## Quy tắc khớp chữ Hán và pinyin

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-11 | S10.9-AC1 Ô có chữ Hán chỉ tìm theo chữ Hán | Chức năng | Mở màn Tra từ, gõ "学" | Mọi dòng kết quả đều có chữ Hán chứa "学"; không có dòng nào chỉ khớp vì nghĩa hay pinyin | e2e |
| TC-S10.9-AC1-12 | S10.9-AC1 Pinyin có dấu phải đúng dấu, khớp từ đầu pinyin | Chức năng | Mở màn Tra từ, gõ "nǐ" | Kết quả không có 年 (nián), không có 您 (nín); pinyin của mọi dòng đều bắt đầu bằng "nǐ" | e2e |
| TC-S10.9-AC1-13 | S10.9-AC1 Ô trộn có dấu và không dấu so theo có dấu | Chức năng | Mở màn Tra từ, gõ "xuéxi" | Kết quả có 学校 (xuéxiào); kết quả không có 学习 (xuéxí) | e2e |
| TC-S10.9-AC1-14 | S10.9-AC1 Ô trộn có dấu và không dấu so theo có dấu | Biên | Mở màn Tra từ, gõ "xuexi" (không dấu nào), rồi gõ "xué" | "xuexi": kết quả có cả 学习 và 学校. "xué": kết quả có 学, 学生, 学习, 学校; không có 大学 và 小学生 (pinyin không bắt đầu bằng "xué") | không |

## Quy tắc khớp nghĩa tiếng Việt

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-15 | S10.9-AC1 Nghĩa tiếng Việt khớp theo từ trọn vẹn và đúng dấu | Chức năng | Mở màn Tra từ, gõ "học sinh", rồi gõ "hoc" | "học sinh": kết quả có 学生. "hoc": kết quả không có 学 (màn hiện `Không tìm thấy từ nào cho "hoc".`) | e2e |
| TC-S10.9-AC1-16 | S10.9-AC1 Nghĩa tiếng Việt khớp theo từ trọn vẹn và đúng dấu | Biên | Mở màn Tra từ, lần lượt gõ "Yêu" và "YÊU" | Cả hai lần kết quả có 爱 (nghĩa không phân biệt hoa thường) | không |
| TC-S10.9-AC1-17 | S10.9-AC1 Đoạn nghĩa tách theo dấu chấm phẩy | Chức năng | Mở màn Tra từ, gõ "đam mê" | Kết quả có 爱好 | e2e |
| TC-S10.9-AC1-18 | S10.9-AC1 Bỏ qua phần trong ngoặc vuông khi so nghĩa | Chức năng | Mở màn Tra từ, gõ "shui" | Kết quả có 水 (shuǐ) và 睡 (shuì); kết quả không có 谁 | e2e |
| TC-S10.9-AC1-19 | S10.9-AC1 Không khớp giữa chữ | Chức năng | Mở màn Tra từ, gõ "ái", rồi gõ "gái" | "ái": kết quả không có 女. "gái": kết quả có 女 | e2e |
| TC-S10.9-AC1-20 | S10.9-AC1 Dấu câu là ranh giới từ | Chức năng | Mở màn Tra từ, gõ "ai" | Kết quả có 哪些 (nǎxiē) | e2e |
| TC-S10.9-AC1-21 | S10.9-AC1 Đoạn nghĩa đúng bằng chuỗi đã gõ là khớp trọn | Chức năng | Mở màn Tra từ, gõ "thích" | Dòng 1 là 爱, dòng 2 là 爱好; cả hai đứng trước mọi từ chỉ khớp một phần (ví dụ 菜, 好, 说 nằm sau) | e2e |

## Ô tìm kiếm và cách so chuỗi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-22 | S10.9-AC1 Kết quả đổi khi gõ thêm | Chức năng | Mở màn Tra từ, gõ "学", rồi gõ thêm "生" ngay sau thành "学生", không bấm gì khác | Sau "学" có 学习; sau "学生" kết quả tự đổi: có 学生 và 大学生, không còn 学习. Màn không có nút "Tìm" | e2e |
| TC-S10.9-AC1-23 | S10.9-AC1 Dạng dựng sẵn và dạng tổ hợp như nhau | Chức năng | Mở màn Tra từ, gõ "nǐ" dạng tổ hợp; rồi gõ "yêu" dạng tổ hợp | "nǐ" tổ hợp: kết quả có 你 và 你们, giống hệt khi gõ "nǐ" dạng dựng sẵn. "yêu" tổ hợp: kết quả có 爱, giống hệt khi gõ "yêu" dạng dựng sẵn | e2e |
| TC-S10.9-AC1-24 | S10.9-AC1 Dạng dựng sẵn và dạng tổ hợp như nhau | Biên | Mở màn Tra từ, gõ "học sinh" dạng tổ hợp ("ọ" = "o" + dấu nặng rời), rồi gõ "NǏMEN" dạng tổ hợp | "học sinh" tổ hợp: kết quả có 学生, danh sách giống hệt khi gõ dạng dựng sẵn. "NǏMEN" tổ hợp: kết quả có 你们 | không |
| TC-S10.9-AC1-25 | S10.9-AC1 Bỏ khoảng trắng đầu cuối | Biên | Mở màn Tra từ, gõ "学", ghi lại danh sách; xóa ô, gõ "  学  " (hai dấu cách mỗi bên) | Danh sách kết quả và dòng số kết quả giống hệt lần gõ "学" | không |
| TC-S10.9-AC1-26 | S10.9-AC1 Pinyin không phân biệt hoa thường, khoảng trắng | Chức năng | Mở màn Tra từ, lần lượt gõ "ni men", "NǏMEN", "nǐmen" | Cả ba lần kết quả đều có 你们 | e2e |
| TC-S10.9-AC1-27 | S10.9-AC1 Pinyin không phân biệt hoa thường, khoảng trắng | Biên | Mở màn Tra từ, lần lượt gõ "xue-sheng", "xue'sheng", "XUESHENG" | Cả ba lần kết quả đều có 学生 | không |
| TC-S10.9-AC1-28 | S10.9-AC1 Pinyin không dấu với ü | Chức năng | Mở màn Tra từ, lần lượt gõ "nu", "nv", "nü" | Cả ba lần kết quả đều có 女 (nǚ) | e2e |
| TC-S10.9-AC1-29 | S10.9-AC1 Pinyin của từ có khoảng trắng | Chức năng | Mở màn Tra từ, gõ "xiaoxuesheng" | Kết quả có 小学生 (xiǎo xuésheng) | e2e |

## Dòng kết quả và thứ tự

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-30 | S10.9-AC1 Một dòng kết quả | Chức năng | Mở màn Tra từ, gõ "爱好" | Phía trên danh sách hiện "1 kết quả"; có đúng một dòng, hiện "爱好", "àihào" và nghĩa "thích; đam mê; lấy làm thú vui; say mê; sở thích" | e2e |
| TC-S10.9-AC1-31 | S10.9-AC1 Một dòng kết quả | Biên | Gõ "爱好", bấm chuột (hoặc chạm) vào dòng kết quả | Không mở màn khác, vẫn ở màn Tra từ với nguyên nội dung ô và kết quả | không |
| TC-S10.9-AC1-32 | S10.9-AC1 Chữ có hai cách đọc hiện hai dòng | Chức năng | Mở màn Tra từ, gõ "地" | Có đúng hai dòng có chữ Hán đúng bằng 地: dòng pinyin "de" có nghĩa "trợ từ kết cấu: dùng trước động từ hoặc tính từ, liên kết với trạng ngữ bổ nghĩa đứng trước"; dòng pinyin "dì" có nghĩa "đất; mặt đất; ruộng; vùng" | e2e |
| TC-S10.9-AC1-33 | S10.9-AC1 Từ khớp trọn lên đầu | Chức năng | Mở màn Tra từ, gõ "学" | Dòng 1 là 学; các dòng sau theo thứ tự danh sách từ: 大学, 大学生, 放学, 教学楼, 上学, 同学, 小学, 小学生, 学生, 学习, 学校, 学院, 中学, 中学生 (tổng "15 kết quả") | e2e |
| TC-S10.9-AC1-34 | S10.9-AC1 Khớp trọn theo pinyin và theo nghĩa | Chức năng | Mở màn Tra từ, gõ "ai" | Dòng 1 là 爱, dòng 2 là 哪些, dòng 3 là 谁, dòng 4 là 爱好 | e2e |
| TC-S10.9-AC1-35 | S10.9-AC1 Khớp trọn pinyin có dấu phải đúng dấu | Chức năng | Mở màn Tra từ, gõ "xué", rồi gõ "xuè" | "xué": dòng 1 là 学 (xué). "xuè": kết quả không có 学 (màn hiện `Không tìm thấy từ nào cho "xuè".`) | e2e |

## Trạng thái ô trống, không có kết quả, lỗi

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-36 | S10.9-AC1 Vừa mở màn Tra từ | Chức năng | Mở màn Tra từ, không gõ gì | Có tiêu đề "Tra từ", ô tìm kiếm trống và câu gợi ý; không có dòng kết quả, không có dòng "… kết quả" | e2e |
| TC-S10.9-AC1-37 | S10.9-AC1 Vừa mở màn Tra từ | Biên | Mở màn Tra từ, gõ ba dấu cách | Vẫn hiện câu gợi ý; không có dòng kết quả, không có dòng số kết quả, không có câu "Không tìm thấy…" | không |
| TC-S10.9-AC1-38 | S10.9-AC1 Không có từ nào khớp | Chức năng | Mở màn Tra từ, gõ "xyzw" | Hiện `Không tìm thấy từ nào cho "xyzw".` (đúng từng chữ); không có dòng kết quả, không có dòng số kết quả | e2e |
| TC-S10.9-AC1-39 | S10.9-AC1 Không có từ nào khớp | Biên | Mở màn Tra từ, gõ "  xyzw  " (dấu cách đầu và cuối) | Hiện `Không tìm thấy từ nào cho "xyzw".`, trong ngoặc kép không có dấu cách thừa | không |
| TC-S10.9-AC1-40 | S10.9-AC1 Xóa hết nội dung ô | Chức năng | Mở màn Tra từ, gõ "学", rồi xóa hết nội dung ô bằng Backspace | Danh sách kết quả và dòng số kết quả biến mất; hiện lại câu gợi ý | e2e |
| TC-S10.9-AC1-41 | S10.9-AC1 Lỗi tải danh sách từ và thử lại | Chức năng | Giả lập lỗi tải danh sách từ, mở màn Tra từ; bỏ giả lập lỗi, bấm "Thử lại", gõ "学" | Lúc lỗi: hiện câu lỗi và nút "Thử lại". Sau "Thử lại": hiện ô tìm kiếm trống và câu gợi ý; gõ "学" thì kết quả có 学 | e2e |
| TC-S10.9-AC1-42 | S10.9-AC1 Lỗi tải danh sách từ và thử lại | A11y | Như TC-S10.9-AC1-41, bật trình đọc màn hình (hoặc đọc kết quả e2e) | Câu lỗi được trình đọc màn hình tự đọc khi xuất hiện, không cần di focus tới; nút "Thử lại" tới được bằng Tab và bấm được bằng Enter | không |

## Bàn phím, trình đọc màn hình, khổ hẹp

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC1-43 | S10.9-AC1 Về Trang chủ | Chức năng | Mở màn Tra từ, bấm "Về Trang chủ" | Về Trang chủ | e2e |
| TC-S10.9-AC1-44 | S10.9-AC1 Thứ tự Tab trên màn Tra từ | A11y | Mở màn Tra từ (không bấm gì trên màn), nhấn Tab hai lần | Mở màn focus không tự nhảy vào ô; Tab 1: focus ở "Về Trang chủ"; Tab 2: focus ở ô tìm kiếm, ô có nhãn "Tra từ"; cả hai lần có viền focus nhìn thấy được | e2e |
| TC-S10.9-AC1-45 | S10.9-AC1 Dòng kết quả không nhận focus | A11y | Mở màn Tra từ, gõ "学" (15 dòng kết quả), rồi nhấn Tab liên tục từ ô tìm kiếm cho đến khi focus quay lại "Về Trang chủ" hoặc rời khỏi trang | Không lần Tab nào dừng ở một dòng kết quả; nội dung ô và kết quả không đổi | e2e |
| TC-S10.9-AC1-46 | S10.9-AC1 Thứ tự Tab trên màn Tra từ | Sáng/Tối | Ở giao diện tối, mở màn Tra từ, Tab qua "Về Trang chủ" và ô tìm kiếm; gõ "ai"; lặp lại ở giao diện sáng | Ở cả hai giao diện: viền focus nhìn thấy được; chữ Hán, pinyin, nghĩa trong kết quả đọc rõ trên nền | không |
| TC-S10.9-AC1-47 | S10.9-AC1 Số kết quả được trình đọc màn hình đọc | A11y | Mở màn Tra từ, gõ "爱好" | Vùng trình đọc màn hình tự đọc (đọc lịch sự, không ngắt lời) chứa "1 kết quả" | e2e |
| TC-S10.9-AC1-48 | S10.9-AC1 Số kết quả được trình đọc màn hình đọc | A11y | Bật trình đọc màn hình (VoiceOver / TalkBack / NVDA), mở màn Tra từ, gõ "爱好", rồi đổi thành "xyzw" | Trình đọc màn hình tự đọc "1 kết quả", rồi đọc `Không tìm thấy từ nào cho "xyzw".` mà không cần rời ô; kết quả được đọc là một danh sách; chữ Hán, pinyin, nghĩa phân biệt được không chỉ nhờ màu | không |
| TC-S10.9-AC1-49 | S10.9-AC1 Khổ 375 px không cuộn ngang | Mobile 375 | Khổ 375 × 812, mở màn Tra từ, gõ "ni" | Trang không có thanh cuộn ngang | e2e |
| TC-S10.9-AC1-50 | S10.9-AC1 Khổ 375 px không cuộn ngang | Mobile 375 | Khổ 375 × 812, mở màn Tra từ, gõ "你" (nghĩa dài, có câu chú thích về Đài Loan) | Nghĩa dài tự xuống dòng, đọc được hết; không cuộn ngang; khi gõ và khi kết quả đổi không có hiệu ứng chuyển động | không |

## Offline

| ID | Scenario | Loại | Các bước | Kết quả mong đợi | Tự động |
|---|---|---|---|---|---|
| TC-S10.9-AC2-1 | S10.9-AC2 Tra từ khi offline | Offline | Mở app một lần, xong onboarding; tắt mạng, mở lại app, mở màn Tra từ; lần lượt gõ "学", "ni", "yêu" | Màn Tra từ mở được, không hiện câu lỗi. "学": có 学, 学生, 学习. "ni": có 你. "yêu": có 爱 | e2e |
| TC-S10.9-AC2-2 | S10.9-AC2 Tra từ khi offline | Offline | Trên điện thoại thật đã cài app: mở app một lần, xong onboarding, bật chế độ máy bay, mở lại app, mở màn Tra từ, gõ "ai" | Bốn dòng đầu lần lượt là 爱, 哪些, 谁, 爱好, giống khi có mạng | không |
