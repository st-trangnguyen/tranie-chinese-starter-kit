import type { Word } from '@csk/shared';

export const buildWord = (
  id: string,
  hanzi: string,
  pinyin: string,
  vi: string,
): Word => ({
  id,
  hanzi,
  pinyin,
  vi: [vi],
  viReviewed: true,
  hsk: 1,
  audio: `audio/${id.padEnd(16, '0')}.mp3`,
});

export const si = buildWord('w-si', '四', 'sì', 'bốn');
export const shi = buildWord('w-shi', '十', 'shì', 'mười');
