/** Hạ tầng lưu file xuống máy: đưa nội dung cho trình duyệt tải xuống. */
export interface FileSaver {
  save(fileName: string, content: string, mimeType: string): void;
}

/** Lưu file bằng thẻ `<a download>`; trả về ngay khi trình duyệt đã nhận file. */
export class AnchorFileSaver implements FileSaver {
  save(): void {
    // Skeleton RED (task 5.1): hành vi thêm ở GREEN 5.2.
  }
}

export const fileSaver: FileSaver = new AnchorFileSaver();
