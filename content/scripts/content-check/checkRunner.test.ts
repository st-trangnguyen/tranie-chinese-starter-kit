import {
  exitCodeOf,
  formatIssue,
  runChecks,
  type ContentCheck,
} from './checkRunner';

const passing: ContentCheck = { name: 'passing', run: () => [] };
const warns: ContentCheck = {
  name: 'warns',
  run: () => [
    { level: 'warning', file: 'content/a.yaml', message: 'chưa review' },
  ],
};
const fails: ContentCheck = {
  name: 'fails',
  run: async () => [
    { level: 'error', file: 'content/b.yaml', line: 3, message: 'sai schema' },
  ],
};

describe('runChecks', () => {
  it('should collect issues from every check when some checks are async', async () => {
    const report = await runChecks([passing, warns, fails]);

    expect(report.issues).toHaveLength(2);
    expect(report.errorCount).toBe(1);
    expect(report.warningCount).toBe(1);
  });

  it('should return an empty report when there are no checks', async () => {
    const report = await runChecks([]);

    expect(report).toEqual({ issues: [], errorCount: 0, warningCount: 0 });
  });
});

describe('exitCodeOf', () => {
  it('should return 1 when there is an error', async () => {
    expect(exitCodeOf(await runChecks([fails]))).toBe(1);
  });

  it('should return 0 when there are only warnings', async () => {
    expect(exitCodeOf(await runChecks([warns]))).toBe(0);
  });
});

describe('formatIssue', () => {
  it('should print file:line when the line is known', () => {
    expect(
      formatIssue({
        level: 'error',
        file: 'content/b.yaml',
        line: 3,
        message: 'sai',
      }),
    ).toBe('content/b.yaml:3  error  sai');
  });

  it('should print only the file when the line is unknown', () => {
    expect(
      formatIssue({
        level: 'warning',
        file: 'content/a.yaml',
        message: 'thiếu',
      }),
    ).toBe('content/a.yaml  warning  thiếu');
  });
});
