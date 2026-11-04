import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

/**
 * Sinh icon PWA từ logo: `pnpm --filter @csk/web icons:generate`.
 * Logo đã có nền và nội dung nằm trong vùng an toàn 80%, nên không thêm padding.
 * PNG sinh ra nằm cạnh file nguồn trong `src/assets/icons/` và được commit.
 */
const BACKGROUND = '#F6F5EF';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0,
      resizeOptions: { background: BACKGROUND },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0,
      resizeOptions: { background: BACKGROUND },
    },
  },
  images: ['src/assets/icons/app-logo.svg'],
});
