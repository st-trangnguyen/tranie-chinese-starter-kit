// subset-font không kèm type. Chỉ khai báo phần API mà font-subset dùng.
declare module 'subset-font' {
  interface SubsetFontOptions {
    targetFormat?: 'sfnt' | 'woff' | 'woff2' | 'truetype';
  }

  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
