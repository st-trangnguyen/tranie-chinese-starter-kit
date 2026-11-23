import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { contrastRatio } from '@shared/utils/color.utils';

// Đọc bằng fs: với `css: false` trong vitest.config, import `?raw` trả về chuỗi rỗng.
const readCss = (path: string): string =>
  readFileSync(join(__dirname, path), 'utf8');

const COLORS_CSS = readCss('tokens/_colors.css');
const SPACING_CSS = readCss('tokens/_spacing.css');
const DARK_CSS = readCss('themes/_dark.css');

const LIGHT_SELECTOR = ':root';
const DARK_MEDIA_SELECTOR = ":root:not([data-theme='light'])";
const DARK_ATTR_SELECTOR = ":root[data-theme='dark']";

/** Lấy các biến `--csk-*` trong khối đầu tiên có selector đúng bằng `selector`. */
function parseCssVars(css: string, selector: string): Record<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const block = blocks.find(
    ([, head]) => head?.trim().replaceAll('"', "'") === selector,
  );
  if (!block?.[2]) {
    throw new Error(`Không thấy khối "${selector}"`);
  }
  const entries = [...block[2].matchAll(/--csk-([\w-]+)\s*:\s*([^;]+);/g)].map(
    ([, name, value]) => [name ?? '', (value ?? '').trim()] as const,
  );
  return Object.fromEntries(entries);
}

function token(vars: Record<string, string>, name: string): string {
  const value = vars[name];
  if (!value) {
    throw new Error(`Thiếu token --csk-${name}`);
  }
  return value;
}

const light = parseCssVars(COLORS_CSS, LIGHT_SELECTOR);
const darkMedia = parseCssVars(DARK_CSS, DARK_MEDIA_SELECTOR);
const darkAttr = parseCssVars(DARK_CSS, DARK_ATTR_SELECTOR);

const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text-muted', 'bg'],
  ['text-muted', 'surface'],
  ['on-accent', 'accent'],
  ['accent', 'surface'],
  ['text', 'accent-soft'],
  ['success-text', 'success-soft'],
  ['danger-text', 'danger-soft'],
  ['warning-text', 'warning-soft'],
  ['danger', 'surface'],
  ['text-muted', 'sunken'],
  // Pinyin tô màu có thể nằm trên nền trang, thẻ, đáp án đang chọn và vùng lõm.
  ...[1, 2, 3, 4, 5].flatMap((tone) => [
    [`tone-${tone}`, 'bg'] as const,
    [`tone-${tone}`, 'surface'] as const,
    [`tone-${tone}`, 'accent-soft'] as const,
    [`tone-${tone}`, 'sunken'] as const,
  ]),
];

/** Tên Tailwind `--color-<name>` → tên token `--csk-*` theo khối `@theme inline` của `_colors.css`. */
function themeColorSource(name: string): string {
  const match = COLORS_CSS.match(
    new RegExp(`--color-${name}\\s*:\\s*var\\(--csk-([\\w-]+)\\)\\s*;`),
  );
  if (!match?.[1]) {
    throw new Error(`Thiếu token --color-${name}`);
  }
  return match[1];
}

// S6.2 khung viết: nét gợi ý (`fg`) trên nét mờ (`line-strong`), nét đúng (`accent`) và nét mờ
// trên nền khung (`surface`). Đồ hoạ không phải chữ → ngưỡng 3:1 (WCAG 1.4.11).
const WRITING_PAD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['fg', 'line-strong'],
  ['accent', 'surface'],
  ['line-strong', 'surface'],
];

// S4.4-AC3 công tắc "Nghe chậm": lúc bật dấu tick và chữ (`text-accent`) nằm trên nền công tắc
// (`bg-accent-soft`); lúc tắt chữ (`text-fg`) nằm trên nền màn phía sau (`bg` hoặc `surface`, công
// tắc tắt không có nền riêng). Dấu tick là thành phần UI không phải chữ → 3:1 (WCAG 1.4.11); chữ
// → 4.5:1 (WCAG 1.4.3). Cột: màu trước (tên Tailwind `--color-*`), màu nền, ngưỡng tối thiểu, vai trò.
const SLOW_TOGGLE_CHECK_MARK_ROLE = 'check mark (on)';
const SLOW_TOGGLE_PAIRS: ReadonlyArray<
  readonly [string, string, number, string]
> = [
  ['accent', 'accent-soft', 3, SLOW_TOGGLE_CHECK_MARK_ROLE],
  ['accent', 'accent-soft', 4.5, 'label (on)'],
  ['fg', 'bg', 4.5, 'label (off, on page background)'],
  ['fg', 'surface', 4.5, 'label (off, on card surface)'],
];
const SLOW_TOGGLE_CHECK_MARK_PAIRS = SLOW_TOGGLE_PAIRS.filter(
  ([, , , role]) => role === SLOW_TOGGLE_CHECK_MARK_ROLE,
);

const THEMES = [
  ['light', light],
  ['dark', darkAttr],
] as const;

describe('tokens.css', () => {
  it('should define the same dark values when dark comes from the media query or data-theme', () => {
    expect(darkMedia).toEqual(darkAttr);
  });

  it('should define every token when switching between light and dark', () => {
    expect(Object.keys(darkAttr).sort()).toEqual(Object.keys(light).sort());
  });

  it('should keep the Jade palette when reading the light anchors', () => {
    expect(token(light, 'bg').toUpperCase()).toBe('#F6F5EF');
    expect(token(light, 'accent').toUpperCase()).toBe('#315C50');
    expect(token(light, 'text').toUpperCase()).toBe('#252D29');
  });

  it('should drive transition utilities when motion tokens are defined', () => {
    // Tailwind 4 không có namespace --duration-*: `duration-fast` không tồn tại, nên token chuyển
    // động phải đi qua giá trị mặc định của `transition-*`.
    expect(SPACING_CSS).toMatch(
      /--default-transition-duration:\s*var\(--duration-fast\);/,
    );
    expect(SPACING_CSS).toMatch(
      /--default-transition-timing-function:\s*var\(--ease-standard\);/,
    );
  });

  it('should keep container widths when max-w-* would otherwise resolve to named spacing', () => {
    expect(SPACING_CSS).toMatch(/--spacing-md:\s*0\.75rem;/);
    expect(SPACING_CSS).toMatch(/--max-width-md:\s*28rem;/);
  });

  describe.each(THEMES)('%s theme', (_name, vars) => {
    it.each(TEXT_PAIRS)('should reach 4.5:1 when %s sits on %s', (fg, bg) => {
      expect(
        contrastRatio(token(vars, fg), token(vars, bg)),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it('should reach 3:1 when an input border sits on surface', () => {
      expect(
        contrastRatio(token(vars, 'border-strong'), token(vars, 'surface')),
      ).toBeGreaterThanOrEqual(3);
    });

    it.each(WRITING_PAD_PAIRS)(
      'S6.2 writing pad (hint, correct and outline strokes): should reach 3:1 when %s sits on %s',
      (fg, bg) => {
        expect(
          contrastRatio(
            token(vars, themeColorSource(fg)),
            token(vars, themeColorSource(bg)),
          ),
        ).toBeGreaterThanOrEqual(3);
      },
    );

    it.each(SLOW_TOGGLE_CHECK_MARK_PAIRS)(
      'S4.4-AC3 Phân biệt bật và tắt ở thang xám, giao diện sáng và tối: %s on %s should reach %s:1 (%s)',
      (fg, bg, minRatio) => {
        expect(
          contrastRatio(
            token(vars, themeColorSource(fg)),
            token(vars, themeColorSource(bg)),
          ),
        ).toBeGreaterThanOrEqual(minRatio);
      },
    );

    it.each(SLOW_TOGGLE_PAIRS)(
      'S4.4-AC3 Tương phản của dấu tick và chữ: %s on %s should reach %s:1 (%s)',
      (fg, bg, minRatio) => {
        expect(
          contrastRatio(
            token(vars, themeColorSource(fg)),
            token(vars, themeColorSource(bg)),
          ),
        ).toBeGreaterThanOrEqual(minRatio);
      },
    );
  });
});
