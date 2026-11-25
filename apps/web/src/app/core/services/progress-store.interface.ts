import type {
  DailyGoalMinutes,
  DailyStat,
  LessonProgress,
  ProgressSnapshot,
  ReviewCard,
  Settings,
} from '@csk/shared';

/**
 * Cổng duy nhất đọc/ghi dữ liệu người dùng (03-architecture §6.3).
 * Các method khác thêm vào khi tới epic cần.
 */
export interface ProgressStore {
  getSettings(): Promise<Settings>;
  /** Chỉ ghi các khóa có trong `patch` với giá trị khác `undefined`; khóa khác giữ nguyên. */
  saveSettings(patch: Partial<Settings>): Promise<void>;
  /** Mọi tiến độ bài hợp lệ; dòng hỏng bị bỏ qua (S3.1 AC2). */
  getAllLessonProgress(): Promise<LessonProgress[]>;
  /** Tiến độ một bài; không có dòng hoặc dòng hỏng thì `undefined` (S3.3). */
  getLessonProgress(lessonId: string): Promise<LessonProgress | undefined>;
  /** Ghi đè dòng cùng `lessonId`, không đụng bài khác. */
  saveLessonProgress(progress: LessonProgress): Promise<void>;
  /** Ghi mọi dòng trong một transaction: một dòng lỗi thì không dòng nào được ghi (S3.6). */
  saveLessonProgressBatch(rows: LessonProgress[]): Promise<void>;
  /** Thống kê học của một ngày (`YYYY-MM-DD`); chưa có thì `undefined` (S8.1). */
  getDailyStat(date: string): Promise<DailyStat | undefined>;
  /**
   * Cộng dồn số giây đã học vào ngày `date` (S8.1) và chụp mục tiêu đang chọn
   * (`settings.dailyGoalMinutes`) vào `goalMinutes` của dòng (S8.3, design D2).
   * Store chỉ chụp giá trị mục tiêu đang chọn vào dòng: không rẽ nhánh theo mục tiêu, không so
   * phút với mục tiêu, không quy tắc nghiệp vụ (quy tắc nằm ở `StudyTimeService` Phần 2).
   */
  addStudySeconds(date: string, seconds: number): Promise<void>;
  /** Mọi thống kê ngày hợp lệ; dòng hỏng bị bỏ qua (S8.3). */
  getAllDailyStats(): Promise<DailyStat[]>;
  /**
   * Đổi mục tiêu của ngày `date` rồi mục tiêu đang chọn (qua `saveSettings`) (S8.3).
   * Ghi dòng ngày lỗi thì settings không đổi. Ghi settings lỗi thì settings giữ giá trị cũ
   * (dòng ngày có thể đã mang mục tiêu mới; lần ghi phút kế tiếp chụp lại mục tiêu đang chọn).
   */
  saveDailyGoal(date: string, goalMinutes: DailyGoalMinutes): Promise<void>;
  /**
   * Toàn bộ tiến độ trên máy, đọc trong một transaction (S8.5, design D3): chờ mọi lần ghi
   * phút/mục tiêu đang chờ trong tab, rồi đọc đúng như app đang thấy (settings qua
   * `parseSettings`, dòng `lessonProgress`/`dailyStats` hỏng bị bỏ, `goalMinutes` hỏng thành
   * không có). Không ghi gì. Lỗi IndexedDB thì reject.
   * Thêm bảng dữ liệu người dùng (E9 `cards`, `reviewLogs`…) phải thêm vào cả `exportAll`,
   * `importAll` và schema file sao lưu.
   */
  exportAll(): Promise<ProgressSnapshot>;
  /**
   * Ghi đè toàn bộ tiến độ bằng `snapshot` (S8.5, design D3): xếp hàng sau mọi lần ghi
   * phút/mục tiêu đang chờ, rồi trong một transaction xóa cả ba bảng (`settings`,
   * `lessonProgress`, `dailyStats`) và ghi dữ liệu của snapshot (giữ `goalMinutes` từng ngày).
   * Không gộp: dòng trên máy không có trong snapshot bị xóa. Bất kỳ bước nào lỗi thì reject
   * và dữ liệu cũ còn nguyên.
   * Thêm bảng dữ liệu người dùng phải thêm vào cả `exportAll`, `importAll` và schema file.
   */
  importAll(snapshot: ProgressSnapshot): Promise<void>;
  /** Mọi thẻ ôn tập hợp lệ; dòng hỏng bị bỏ qua (S9.1). */
  getAllCards(): Promise<ReviewCard[]>;
  /**
   * Thêm các thẻ chưa có (khóa `reviewCardId(wordId, facet)`) trong một transaction (S9.1, design D3).
   * Thẻ đã có giữ nguyên trạng thái và lịch ôn. Lỗi thì reject, không thẻ nào được ghi.
   */
  addNewCards(cards: readonly ReviewCard[]): Promise<void>;
  /** Mọi chữ Hán đã viết xong (có gợi ý) hợp lệ; dòng hỏng bị bỏ qua (S9.1). */
  getWrittenCharacters(): Promise<string[]>;
  /** Ghi nhận chữ đã viết xong; viết lại không tạo dòng mới (S9.1). */
  addWrittenCharacter(character: string): Promise<void>;
}
