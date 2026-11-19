/**
 * Độ trễ trước khi thu hồi URL blob của file sao lưu. Một số trình duyệt (Safari iOS, Chrome Android)
 * đọc blob bất đồng bộ sau `click()`; thu hồi quá sớm làm file tải xuống rỗng hoặc hỏng.
 */
export const REVOKE_OBJECT_URL_DELAY_MS = 40_000;
