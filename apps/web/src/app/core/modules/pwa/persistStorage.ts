/**
 * Xin trình duyệt không tự xóa IndexedDB khi thiếu dung lượng (03-architecture §7).
 * Trả về true nếu dữ liệu đã được giữ lâu dài.
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage?.persist) {
    return false;
  }
  if (await navigator.storage.persisted()) {
    return true;
  }
  return navigator.storage.persist();
};
