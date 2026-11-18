// Định dạng dung lượng audio (D7): số nguyên, không float.
export function formatAudioSize(bytes: number): string {
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export const toDownloadPercent: (done: number, total: number) => number = () =>
  0;
