export const PLAYBACK_RATES = { normal: 1, slow: 0.75 } as const;

export const AUDIO_BASE_PATH = '/';

/** Cache Storage riêng cho audio người học chủ động tải (S8.4); khác cache precache của Workbox. */
export const AUDIO_CACHE_NAME = 'audio-cache';
