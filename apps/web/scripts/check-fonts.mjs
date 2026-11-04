// Kiểm tra font sau `vite build` (spec §8, plan Task 2):
// - không tải font từ Google Fonts lúc chạy (app phải chạy offline);
// - không kéo theo subset thừa (Devanagari, Cyrillic…) mà PWA sẽ precache;
// - có đủ font tự host: Quicksand, Baloo 2, LXGW WenKai đã cắt.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const REMOTE_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const FORBIDDEN_SUBSETS = [
  'devanagari',
  'cyrillic',
  'greek',
  'math',
  'symbols',
];
const REQUIRED_FONTS = ['quicksand', 'baloo-2', 'lxgw-wenkai.subset'];

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

let files = [];
try {
  files = listFiles(DIST);
} catch {
  fail('Chưa có apps/web/dist. Chạy `pnpm --filter @csk/web build` trước.');
}

const fontFiles = files.filter((file) => file.endsWith('.woff2'));
const textFiles = files.filter((file) => /\.(css|js|html)$/.test(file));

const remoteHits = textFiles.flatMap((file) => {
  const text = readFileSync(file, 'utf8');
  return REMOTE_FONT_HOSTS.filter((host) => text.includes(host)).map(
    (host) => `${relative(DIST, file)} gọi tới ${host}`,
  );
});

const extraSubsets = fontFiles.flatMap((file) => {
  const name = relative(DIST, file).toLowerCase();
  const subset = FORBIDDEN_SUBSETS.find((s) => name.includes(s));
  return subset ? [`${name} là subset ${subset}, không cần dùng`] : [];
});

// Nhiều @font-face cùng family + weight mà thiếu unicode-range thì trình duyệt chỉ dùng khối
// cuối cho mọi ký tự (vd. chỉ latin-ext, mất chữ Latin cơ bản). Font tách subset phải có range.
const SUBSET_FAMILIES = ['Quicksand', 'Baloo 2'];
const missingRanges = files
  .filter((file) => file.endsWith('.css'))
  .flatMap(
    (file) => readFileSync(file, 'utf8').match(/@font-face\s*\{[^}]*\}/g) ?? [],
  )
  .filter(
    (rule) =>
      SUBSET_FAMILIES.some((family) => rule.includes(family)) &&
      !rule.includes('unicode-range'),
  )
  .map((rule) => `@font-face thiếu unicode-range: ${rule.slice(0, 90)}…`);

const missingFonts = REQUIRED_FONTS.filter(
  (font) => !fontFiles.some((file) => file.toLowerCase().includes(font)),
).map((font) => `Không thấy file woff2 nào của ${font}`);

const problems = [
  ...remoteHits,
  ...extraSubsets,
  ...missingRanges,
  ...missingFonts,
];
if (problems.length > 0) {
  fail(`check:fonts thất bại:\n- ${problems.join('\n- ')}`);
}

const totalKb =
  fontFiles.reduce((sum, file) => sum + statSync(file).size, 0) / 1024;
process.stdout.write(
  `check:fonts OK — ${fontFiles.length} file woff2, tổng ${totalKb.toFixed(0)} KB\n`,
);
