# content/data-raw — nguồn dữ liệu mở

File trong thư mục này là **bản đã lọc** do `pnpm --filter @csk/content content:fetch` sinh ra.
Không sửa tay: sửa nghĩa trong `content/authored/vi-meanings.yaml`, cách đọc chữ đa âm trong
`content/scripts/content-fetch/hskList.ts` (`POLYPHONE_READINGS`).

File gốc tải về nằm ở `.cache/` (không commit). URL ghim theo commit và SHA-256 ở
`content/scripts/content-fetch/sources.ts`; nguồn đổi thì `content:fetch` dừng lại báo lỗi.

| File | Nguồn | License |
|---|---|---|
| `hsk1.words.json` | Danh sách HSK 3.0 (chuẩn 2021) cấp 1 — 500 mục, thứ tự chính thức — từ [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0) (`New HSK (2021)`). Pinyin + nghĩa tiếng Anh theo CC-CEDICT | Danh sách từ: chuẩn công bố của Bộ Giáo dục TQ; pinyin/nghĩa: CC BY-SA 4.0 |
| `cvdict.hsk1.json` | Nghĩa tiếng Việt gợi ý cho từng từ, lọc từ [CVDICT](https://github.com/ph0ngp/CVDICT) (Phong Phan) | CC BY-SA 4.0 |
| `fonts/` | LXGW WenKai (xem `fonts/LICENSE`) | SIL OFL 1.1 |

Dữ liệu nét chữ lấy từ package npm [`hanzi-writer-data`](https://github.com/chanind/hanzi-writer-data)
(Arphic Public License, dựa trên Make Me a Hanzi), không lưu ở đây.

**Lưu ý danh sách HSK 1:** 500 mục nhưng 497 chữ khác nhau — 地 (de/dì), 干 (gān/gàn), 还
(hái/huán) mỗi chữ có hai mục theo hai cách đọc. Hai mục này có ID dạng `hanzi:pinyin`
(`地:de`, `地:dì`); mọi từ khác có ID là chính hanzi.
