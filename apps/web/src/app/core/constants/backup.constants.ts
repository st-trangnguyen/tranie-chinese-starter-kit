/**
 * Độ trễ trước khi thu hồi URL blob của file sao lưu. Một số trình duyệt (Safari iOS, Chrome Android)
 * đọc blob bất đồng bộ sau `click()`; thu hồi quá sớm làm file tải xuống rỗng hoặc hỏng.
 */
export const REVOKE_OBJECT_URL_DELAY_MS = 40_000;

/**
 * Kích thước tối đa (byte) của file sao lưu được đọc khi nhập. 20 × 10⁶ byte: file máy hiện "lớn hơn
 * 20 MB" theo cả đơn vị thập phân lẫn nhị phân đều vượt ngưỡng; file đúng 20 000 000 byte vẫn được đọc.
 */
export const MAX_BACKUP_FILE_BYTES = 20_000_000;
