/** Khóa ngày `YYYY-MM-DD` theo giờ máy. */
export function toLocalDateKey(ms: number): string {
  const date = new Date(ms);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Mốc 0 giờ (giờ máy) của ngày kế tiếp. */
export function startOfNextLocalDay(ms: number): number {
  const date = new Date(ms);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  ).getTime();
}

/** Khóa ngày `YYYY-MM-DD` của ngày liền trước (giờ máy). */
export function previousLocalDateKey(dateKey: string): string {
  const [year = 0, month = 1, day = 1] = dateKey.split('-').map(Number);
  return toLocalDateKey(new Date(year, month - 1, day - 1).getTime());
}

/** Khóa ngày `YYYY-MM-DD` hiện cho người học dạng `dd/mm/yyyy`. */
export function formatLocalDateKey(dateKey: string): string {
  return dateKey;
}
