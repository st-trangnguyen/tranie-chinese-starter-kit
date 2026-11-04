import { createHash } from 'node:crypto';

import type { Voice } from '@csk/shared';

/** Giọng edge-tts (S2.4 AC1): nữ mặc định, nam cho vai thứ hai trong hội thoại. */
export const VOICE_NAMES: Readonly<Record<Voice, string>> = {
  female: 'zh-CN-XiaoxiaoNeural',
  male: 'zh-CN-YunxiNeural',
};

/** Một file mp3 cần có: đọc `text` bằng `voice`, lưu ở `assets/<path>`. */
export interface AudioJob {
  path: string;
  text: string;
  voice: Voice;
}

/**
 * Rule (S2.4 AC2): tên file là hash của giọng + chữ được đọc. Nội dung không đổi thì tên không
 * đổi, nên không phải tạo lại; đổi chữ hoặc giọng thì ra file mới.
 */
export function audioJob(text: string, voice: Voice): AudioJob {
  const hash = createHash('sha1')
    .update(`${VOICE_NAMES[voice]}\n${text.normalize('NFC')}`)
    .digest('hex')
    .slice(0, 16);
  return { path: `audio/${hash}.mp3`, text, voice };
}
