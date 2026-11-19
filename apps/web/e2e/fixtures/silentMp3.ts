/*
 * MP3 im lặng cho nội dung mẫu e2e. MPEG-1 Layer III, 128 kbps, 44.1 kHz, stereo, không padding:
 * mỗi frame 417 byte; frame có side info toàn 0 giải mã thành im lặng.
 */
const MP3_FRAME_HEADER = [0xff, 0xfb, 0x90, 0x00];
export const MP3_FRAME_BYTES = 417;

/**
 * File đúng `totalBytes` byte: đủ frame im lặng vừa khít, phần dư (< 417 byte) là byte 0.
 * Dưới 417 byte thì chỉ có byte đệm, không phát được (chỉ dùng để kiểm nhãn dung lượng).
 */
export const buildSilentMp3 = (totalBytes: number): Uint8Array => {
  const bytes = new Uint8Array(totalBytes);
  const frameCount = Math.floor(totalBytes / MP3_FRAME_BYTES);
  for (let frame = 0; frame < frameCount; frame += 1) {
    bytes.set(MP3_FRAME_HEADER, frame * MP3_FRAME_BYTES);
  }
  return bytes;
};
