/**
 * Khung chạy kiểm tra nội dung (`content:check`). Mỗi story của E2 thêm một `ContentCheck`
 * vào danh sách trong `index.ts`; khung này lo phần gom lỗi, in ra và quyết định exit code.
 */

export type IssueLevel = 'error' | 'warning';

export interface ContentIssue {
  level: IssueLevel;
  /** Đường dẫn tương đối từ gốc repo, để bấm mở được trong terminal. */
  file: string;
  /** Số dòng (bắt đầu từ 1), nếu xác định được. */
  line?: number;
  message: string;
}

export interface ContentCheck {
  name: string;
  run: () => ContentIssue[] | Promise<ContentIssue[]>;
}

export interface CheckReport {
  issues: ContentIssue[];
  errorCount: number;
  warningCount: number;
}

export function formatIssue(issue: ContentIssue): string {
  const location =
    issue.line === undefined ? issue.file : `${issue.file}:${issue.line}`;
  return `${location}  ${issue.level}  ${issue.message}`;
}

export async function runChecks(
  checks: readonly ContentCheck[],
): Promise<CheckReport> {
  const results = await Promise.all(checks.map((check) => check.run()));
  const issues = results.flat();
  return {
    issues,
    errorCount: issues.filter((issue) => issue.level === 'error').length,
    warningCount: issues.filter((issue) => issue.level === 'warning').length,
  };
}

/** Rule: chỉ lỗi mới làm `content:check` thất bại; cảnh báo chỉ in ra. */
export function exitCodeOf(report: CheckReport): number {
  return report.errorCount > 0 ? 1 : 0;
}
