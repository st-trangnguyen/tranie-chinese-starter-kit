const HAN = /\p{Script=Han}/u;

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

/**
 * Gom mọi chữ Hán trong giá trị chuỗi (ở mọi độ sâu, bỏ qua key) thành một chuỗi
 * không trùng lặp, sắp theo code point — đầu vào cho việc cắt font.
 */
export function collectHanzi(values: readonly unknown[]): string {
  const hanzi = collectStrings(values)
    .flatMap((text) => [...text])
    .filter((char) => HAN.test(char));
  return [...new Set(hanzi)].sort().join('');
}
