// Định dạng dung lượng audio (D7): số nguyên, không float.
export function formatAudioSize(bytes: number): string {
  const kb = Math.max(1, Math.ceil(bytes / 1024));
  if (kb < 1024) {
    return `${kb} KB`;
  }
  // Làm tròn nửa lên tới 0,1 MB bằng số nguyên.
  const tenths = Math.floor((20 * bytes + 1_048_576) / 2_097_152);
  return `${Math.floor(tenths / 10)},${tenths % 10} MB`;
}

export const toDownloadPercent: (done: number, total: number) => number = () =>
  0;
