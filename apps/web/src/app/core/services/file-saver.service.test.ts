import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { REVOKE_OBJECT_URL_DELAY_MS } from '@core/constants/backup.constants';

import { AnchorFileSaver, type FileSaver } from './file-saver.service';

const BLOB_URL = 'blob:http://localhost/tranie-backup';
const FILE_NAME = 'tranie-tien-do-2026-11-17.json';

interface ClickRecord {
  download: string;
  href: string;
  isInDocument: boolean;
}

describe('AnchorFileSaver', () => {
  let createdBlobs: Blob[];
  let revokedUrls: string[];
  let clicks: ClickRecord[];
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.useFakeTimers();
    createdBlobs = [];
    revokedUrls = [];
    clicks = [];
    URL.createObjectURL = (blob: Blob | MediaSource): string => {
      if (blob instanceof Blob) {
        createdBlobs.push(blob);
      }
      return BLOB_URL;
    };
    URL.revokeObjectURL = (url: string): void => {
      revokedUrls.push(url);
    };
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push({
        download: this.download,
        href: this.getAttribute('href') ?? '',
        isInDocument: document.body.contains(this),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('S8.5-AC1 Báo đã xuất ngay khi trình duyệt nhận file', async () => {
    const saver: FileSaver = new AnchorFileSaver();

    const result: unknown = saver.save(FILE_NAME, '{}', 'application/json');

    // Trả về đồng bộ: không chờ người học lưu xong.
    expect(result).toBeUndefined();

    // Trình duyệt nhận đúng một file tải xuống với đúng tên và nội dung.
    expect(clicks).toEqual([
      { download: FILE_NAME, href: BLOB_URL, isInDocument: true },
    ]);
    expect(createdBlobs).toHaveLength(1);
    expect(createdBlobs[0]?.type).toBe('application/json');
    expect(await createdBlobs[0]?.text()).toBe('{}');

    // Thẻ tạm đã gỡ khỏi trang sau khi trả về.
    expect(document.body.querySelector('a[download]')).toBeNull();

    // URL blob chưa thu hồi trước khi hết độ trễ, đã thu hồi sau đó.
    vi.advanceTimersByTime(REVOKE_OBJECT_URL_DELAY_MS - 1);
    expect(revokedUrls).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(revokedUrls).toEqual([BLOB_URL]);
  });
});
