import { REVOKE_OBJECT_URL_DELAY_MS } from '@core/constants/backup.constants';

/** Hạ tầng lưu file xuống máy: đưa nội dung cho trình duyệt tải xuống. */
export interface FileSaver {
  save(fileName: string, content: string, mimeType: string): void;
}

/** Lưu file bằng thẻ `<a download>`; trả về ngay khi trình duyệt đã nhận file. */
export class AnchorFileSaver implements FileSaver {
  save(fileName: string, content: string, mimeType: string): void {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, REVOKE_OBJECT_URL_DELAY_MS);
  }
}

export const fileSaver: FileSaver = new AnchorFileSaver();
