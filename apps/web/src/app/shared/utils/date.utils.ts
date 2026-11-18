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

// Skeleton S8.3 (tasks 2.1): hành vi thêm ở 2.2.
/** Khóa ngày `YYYY-MM-DD` của ngày liền trước (giờ máy). */
export function previousLocalDateKey(dateKey: string): string {
  return dateKey;
}
