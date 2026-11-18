/**
 * Đặt trạng thái hiển thị của trang và phát `visibilitychange` trên `document`.
 * `setPageVisibility(true)` = trang bị ẩn (app vào nền); `false` = hiện lại.
 */
export function setPageVisibility(hidden: boolean): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: hidden ? 'hidden' : 'visible',
  });
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}
