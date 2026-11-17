import { assembleContent, type BuildInputs } from './assemble';
import { exitCodeOf, runChecks } from '../content-check/checkRunner';
import { lessonsCheck } from '../content-check/checks';
import { parseYamlFile } from '../lib/yamlFile';

const LESSON_FILE = 'content/authored/lessons/intro/01.yaml';

/** Dòng YAML của câu viết `e2`, để mỗi Scenario thay giá trị `wordId` (hoặc bỏ hẳn). */
const strokeWriteLine = (wordIdYaml: string): string =>
  `  - { id: e2, kind: stroke-write${wordIdYaml === '' ? '' : `, wordId: ${wordIdYaml}`} }`;

const lessonYaml = (exerciseLine: string): string =>
  [
    'id: intro-01',
    'type: lesson',
    'title: Thanh điệu',
    'exercises:',
    '  - { id: e1, kind: tone-choice, wordId: 人 }',
    exerciseLine,
  ].join('\n');

const PATH = [
  'stages:',
  '  - id: st1',
  '    title: Nhập môn',
  '    units:',
  '      - id: u1',
  '        title: Thanh điệu',
  '        lessons: [intro-01]',
].join('\n');

const STROKE_JSON = '{"strokes":["M 0 0 L 1 1"],"medians":[[[0,0],[1,1]]]}';

/** Dữ liệu nét thử: chỉ có 人. Không có 爱, 爸. */
const CHARS_WITH_STROKES = new Set(['人']);
const strokeData: BuildInputs['strokeData'] = (char) =>
  CHARS_WITH_STROKES.has(char) ? STROKE_JSON : undefined;

/** Từ điển thử: 爱, 爸爸, 人 (đều có trong HSK 1). */
const inputsWithStrokeWrite = (wordIdYaml: string): BuildInputs => ({
  hskEntries: [
    { id: '爱', hanzi: '爱', pinyin: 'ài', en: 'love' },
    { id: '爸爸', hanzi: '爸爸', pinyin: 'bàba', en: 'father' },
    { id: '人', hanzi: '人', pinyin: 'rén', en: 'person' },
  ],
  meanings: {
    爱: { vi: ['yêu'], reviewed: true },
    爸爸: { vi: ['bố'], reviewed: true },
    人: { vi: ['người'], reviewed: true },
  },
  overrides: {},
  path: parseYamlFile('content/authored/path.yaml', PATH),
  lessons: [
    parseYamlFile(LESSON_FILE, lessonYaml(strokeWriteLine(wordIdYaml))),
  ],
  strokeData,
});

describe('assembleContent — luật câu viết (stroke-write)', () => {
  it('S7.1-AC3 Câu viết dùng chữ không có dữ liệu nét thì kiểm tra nội dung báo lỗi', async () => {
    const { lessonIssues } = assembleContent(inputsWithStrokeWrite('爱'));

    const strokeIssue = lessonIssues.find(
      (issue) =>
        issue.message.includes('爱') &&
        issue.message.includes('thiếu dữ liệu nét'),
    );
    expect(strokeIssue).toBeDefined();
    expect(strokeIssue?.level).toBe('error');
    expect(
      lessonIssues.some((issue) =>
        issue.message.includes('không có trong từ điển'),
      ),
    ).toBe(false);

    const report = await runChecks([lessonsCheck(lessonIssues)]);
    expect(exitCodeOf(report)).toBe(1);
  });

  it('S7.1-AC3 Câu viết dùng từ nhiều chữ thì kiểm tra nội dung báo lỗi', async () => {
    const { lessonIssues } = assembleContent(inputsWithStrokeWrite('爸爸'));

    const multiCharIssue = lessonIssues.find(
      (issue) =>
        issue.message.includes('"爸爸"') &&
        issue.message.includes('nhiều hơn một chữ'),
    );
    expect(multiCharIssue).toBeDefined();
    expect(multiCharIssue?.level).toBe('error');
    expect(multiCharIssue?.message).toContain('một chữ Hán');

    const report = await runChecks([lessonsCheck(lessonIssues)]);
    expect(exitCodeOf(report)).toBe(1);
  });

  it.each([
    { label: "wordId: ''", wordIdYaml: "''" },
    { label: 'thiếu wordId', wordIdYaml: '' },
  ])(
    'S7.1-AC3 Câu viết rỗng thì kiểm tra nội dung báo lỗi ($label)',
    async ({ wordIdYaml }) => {
      const { lessonIssues } = assembleContent(
        inputsWithStrokeWrite(wordIdYaml),
      );

      const emptyIssue = lessonIssues.find((issue) =>
        issue.message.includes('câu viết rỗng'),
      );
      expect(emptyIssue).toBeDefined();
      expect(emptyIssue?.level).toBe('error');
      expect(emptyIssue?.message).toContain('"e2"');

      const report = await runChecks([lessonsCheck(lessonIssues)]);
      expect(exitCodeOf(report)).toBe(1);
    },
  );

  it('S7.1-AC3 Câu viết không phải chữ Hán thì kiểm tra nội dung báo lỗi', async () => {
    const { lessonIssues } = assembleContent(inputsWithStrokeWrite('abc'));

    const notHanIssue = lessonIssues.find(
      (issue) =>
        issue.message.includes('câu viết "abc"') &&
        issue.message.includes('không phải chữ Hán'),
    );
    expect(notHanIssue).toBeDefined();
    expect(notHanIssue?.level).toBe('error');
    expect(notHanIssue?.message).toContain('"e2"');
    expect(
      lessonIssues.some((issue) => issue.message.includes('nhiều hơn một chữ')),
    ).toBe(false);

    const report = await runChecks([lessonsCheck(lessonIssues)]);
    expect(exitCodeOf(report)).toBe(1);
  });
});
