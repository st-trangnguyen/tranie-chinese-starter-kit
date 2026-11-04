import type { Plugin } from 'vite';

/**
 * S1.2 AC2: chỉ khi build `--mode e2e`, thêm một file nội dung và một file audio mẫu vào
 * bản build để e2e kiểm được precache khi chưa có nội dung thật (E2/E7). Bản build thường
 * không có các file này.
 */
export const OFFLINE_FIXTURE_PATHS = {
  content: 'content/_e2e/offline-lesson.json',
  audio: 'audio/_e2e/offline-silence.mp3',
} as const;

// MPEG-1 Layer III, 128 kbps, 44.1 kHz, stereo, không padding: mỗi frame 417 byte.
const MP3_FRAME_HEADER = [0xff, 0xfb, 0x90, 0x00];
const MP3_FRAME_BYTES = 417;
const MP3_FRAME_COUNT = 40;

/** Frame có side info toàn 0 giải mã thành im lặng: ~1 giây audio hợp lệ. */
const buildSilentMp3 = (): Uint8Array => {
  const bytes = new Uint8Array(MP3_FRAME_BYTES * MP3_FRAME_COUNT);
  for (let frame = 0; frame < MP3_FRAME_COUNT; frame += 1) {
    bytes.set(MP3_FRAME_HEADER, frame * MP3_FRAME_BYTES);
  }
  return bytes;
};

const OFFLINE_LESSON = {
  id: 'e2e-offline',
  title: 'Bài mẫu offline',
  audio: `/${OFFLINE_FIXTURE_PATHS.audio}`,
};

export const offlineFixturesPlugin = (): Plugin => ({
  name: 'csk-e2e-offline-fixtures',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: OFFLINE_FIXTURE_PATHS.content,
      source: JSON.stringify(OFFLINE_LESSON),
    });
    this.emitFile({
      type: 'asset',
      fileName: OFFLINE_FIXTURE_PATHS.audio,
      source: buildSilentMp3(),
    });
  },
});
