export type DiffKind = 'same' | 'different' | 'missing' | 'extra';

export interface DiffSegment {
  kind: DiffKind;
  char: string;
}

// Rule: bỏ khoảng trắng và dấu câu/ký hiệu, giữ nguyên chữ (không đổi giản/phồn).
export function normalizeSpeechText(text: string): string {
  return text.replace(/[\p{P}\p{S}\s]/gu, '');
}

function buildLcsTable(a: string[], b: string[]): number[][] {
  const table = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

// Rule: ghép từng cặp (thiếu, thừa) trong đoạn lệch thành `different` (chữ máy nghe được),
// phần dư là `missing` (chữ câu đúng) hoặc `extra` (chữ máy nghe thêm).
function resolveGap(missing: string[], extra: string[]): DiffSegment[] {
  const pairCount = Math.min(missing.length, extra.length);
  const paired = extra
    .slice(0, pairCount)
    .map((char): DiffSegment => ({ kind: 'different', char }));
  const leftoverMissing = missing
    .slice(pairCount)
    .map((char): DiffSegment => ({ kind: 'missing', char }));
  const leftoverExtra = extra
    .slice(pairCount)
    .map((char): DiffSegment => ({ kind: 'extra', char }));
  return [...paired, ...leftoverMissing, ...leftoverExtra];
}

// Rule: căn hai chuỗi đã chuẩn hoá theo ký tự bằng LCS; ký tự trong LCS là `same`.
export function diffSpeech(expected: string, heard: string): DiffSegment[] {
  const a = Array.from(normalizeSpeechText(expected));
  const b = Array.from(normalizeSpeechText(heard));
  const table = buildLcsTable(a, b);
  const segments: DiffSegment[] = [];
  let missing: string[] = [];
  let extra: string[] = [];
  let i = 0;
  let j = 0;

  function flushGap(): void {
    segments.push(...resolveGap(missing, extra));
    missing = [];
    extra = [];
  }

  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flushGap();
      segments.push({ kind: 'same', char: a[i] });
      i += 1;
      j += 1;
    } else if (
      j >= b.length ||
      (i < a.length && table[i + 1][j] >= table[i][j + 1])
    ) {
      missing = [...missing, a[i]];
      i += 1;
    } else {
      extra = [...extra, b[j]];
      j += 1;
    }
  }
  flushGap();
  return segments;
}

// Rule: khớp khi mọi segment là `same`.
export function isSpeechMatch(segments: DiffSegment[]): boolean {
  return segments.every((segment) => segment.kind === 'same');
}
