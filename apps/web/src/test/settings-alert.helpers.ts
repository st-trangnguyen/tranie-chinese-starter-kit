import { screen, waitFor } from '@testing-library/react';

/** Tên region của mục "Sao lưu tiến độ" (S8.5, design D7). */
const BACKUP_REGION_NAME = 'Sao lưu tiến độ';

/**
 * Mọi `role="alert"` trên màn Cài đặt **ngoài** mục "Sao lưu tiến độ".
 * Mục sao lưu luôn render sẵn một vùng alert (rỗng khi không có lỗi) cho trình
 * đọc màn hình; vùng đó không phải thông báo lỗi lưu cài đặt của S8.2.
 */
export const queryAllSettingsAlerts = (): HTMLElement[] => {
  const backupRegion = screen.queryByRole('region', {
    name: BACKUP_REGION_NAME,
  });
  return screen
    .queryAllByRole('alert')
    .filter((alert) => !backupRegion?.contains(alert));
};

/**
 * Alert lỗi lưu cài đặt (ngoài mục sao lưu), hoặc `null` nếu không có.
 * Throw nếu có nhiều hơn một, giống `screen.queryByRole`.
 */
export const querySettingsAlert = (): HTMLElement | null => {
  const alerts = queryAllSettingsAlerts();
  if (alerts.length > 1) {
    throw new Error(
      `Có ${alerts.length} alert ngoài mục "${BACKUP_REGION_NAME}", chỉ được có một.`,
    );
  }
  return alerts[0] ?? null;
};

/** Như `querySettingsAlert` nhưng throw khi không có. */
export const getSettingsAlert = (): HTMLElement => {
  const alert = querySettingsAlert();
  if (alert === null) {
    throw new Error(`Không có alert nào ngoài mục "${BACKUP_REGION_NAME}".`);
  }
  return alert;
};

/** Chờ đến khi có đúng một alert lỗi lưu cài đặt (ngoài mục sao lưu). */
export const findSettingsAlert = (): Promise<HTMLElement> =>
  waitFor(getSettingsAlert);
