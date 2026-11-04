/** Một mục trong danh sách HSK cấp 1 (đã lọc, lưu ở `content/data-raw/hsk1.words.json`). */
export interface HskEntry {
  /** ID dùng trong bài YAML: hanzi; chữ đa âm có mặt hai lần thì `hanzi:pinyin`. */
  id: string;
  hanzi: string;
  pinyin: string;
  /** Nghĩa tiếng Anh tham khảo cho người review nghĩa tiếng Việt. */
  en: string;
}

interface Reading {
  readonly pinyin: string;
  readonly en: string;
}

/**
 * Chữ đa âm xuất hiện hai lần trong danh sách chính thức, theo thứ tự xuất hiện. Bảng nghĩa
 * nguồn chỉ có một dòng cho mỗi hanzi nên cách đọc phải khai báo tay ở đây.
 */
export const POLYPHONE_READINGS: Readonly<Record<string, readonly Reading[]>> =
  {
    地: [
      { pinyin: 'de', en: 'structural particle before a verb or adjective' },
      { pinyin: 'dì', en: 'earth, ground, land, place' },
    ],
    干: [
      { pinyin: 'gān', en: 'dry' },
      { pinyin: 'gàn', en: 'do, work' },
    ],
    还: [
      { pinyin: 'hái', en: 'still, yet, also' },
      { pinyin: 'huán', en: 'give back, return' },
    ],
  };

const lines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

/** TSV nguồn: phồn thể, giản thể, pinyin, nghĩa tiếng Anh. Khóa theo giản thể. */
function parseMeaningTsv(tsv: string): Map<string, Reading> {
  return new Map(
    lines(tsv).map((line) => {
      const [, hanzi = '', pinyin = '', en = ''] = line.split('\t');
      return [hanzi, { pinyin: pinyin.normalize('NFC'), en: en.trim() }];
    }),
  );
}

/**
 * Ghép danh sách chính thức (thứ tự + số mục) với bảng pinyin/nghĩa. Throw khi một từ không có
 * pinyin hoặc có chữ đa âm lặp mà chưa khai báo trong `POLYPHONE_READINGS`.
 */
export function parseHskList(listText: string, meaningTsv: string): HskEntry[] {
  const meanings = parseMeaningTsv(meaningTsv);
  const hanziList = lines(listText);
  const counts = hanziList.reduce(
    (map, hanzi) => map.set(hanzi, (map.get(hanzi) ?? 0) + 1),
    new Map<string, number>(),
  );
  const occurrence = new Map<string, number>();

  return hanziList.map((hanzi) => {
    const count = counts.get(hanzi) ?? 0;
    if (count === 1) {
      const reading = meanings.get(hanzi);
      if (reading === undefined || reading.pinyin.length === 0) {
        throw new Error(`Từ "${hanzi}" không có pinyin trong bảng nguồn`);
      }
      return { id: hanzi, hanzi, ...reading };
    }
    const readings = POLYPHONE_READINGS[hanzi];
    const index = occurrence.get(hanzi) ?? 0;
    occurrence.set(hanzi, index + 1);
    const reading = readings?.[index];
    if (readings === undefined || readings.length !== count || !reading) {
      throw new Error(
        `"${hanzi}" xuất hiện ${count} lần: khai báo đủ ${count} cách đọc trong POLYPHONE_READINGS`,
      );
    }
    return { id: `${hanzi}:${reading.pinyin}`, hanzi, ...reading };
  });
}
