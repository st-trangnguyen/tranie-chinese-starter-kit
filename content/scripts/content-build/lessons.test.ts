import { lessonRefIssues, parseLesson } from './lessons';
import { parseYamlFile } from '../lib/yamlFile';

const FILE = 'content/authored/lessons/intro/01.yaml';

const parse = (lines: readonly string[]) =>
  parseLesson(parseYamlFile(FILE, lines.join('\n')));

const VALID = [
  'id: intro-01', // 1
  'type: lesson', // 2
  'title: Thanh điệu', // 3
  'sentences:', // 4
  '  - id: s1', // 5
  '    hanzi: 你好！', // 6
  '    pinyin: nǐ hǎo!', // 7
  '    vi: Xin chào!', // 8
  'exercises:', // 9
  '  - { id: e1, kind: tone-choice, wordId: 八 }', // 10
  '  - { id: e2, kind: speak, sentenceId: s1 }', // 11
];

describe('parseLesson', () => {
  it('should accept a lesson that matches the schema', () => {
    const parsed = parse(VALID);

    expect(parsed.issues).toEqual([]);
    expect(parsed.lesson?.exercises).toHaveLength(2);
    expect(parsed.sentences[0]?.voice).toBe('female');
  });

  it('should report a schema error with file and line', () => {
    const lines = VALID.with(9, '  - { id: e1, kind: tone-choice }');

    const parsed = parse(lines);

    expect(parsed.lesson).toBeUndefined();
    expect(parsed.issues).toEqual([
      expect.objectContaining({ level: 'error', file: FILE, line: 10 }),
    ]);
  });

  it('should report an invalid sentence pinyin at its line', () => {
    const parsed = parse(VALID.with(6, '    pinyin: ni3 hao3'));

    expect(parsed.issues).toEqual([
      expect.objectContaining({ file: FILE, line: 7 }),
    ]);
  });

  it('should report unknown top-level fields', () => {
    const parsed = parse([...VALID, 'titel: Sai']);

    expect(parsed.issues[0]).toMatchObject({ line: 12 });
    expect(parsed.issues[0]?.message).toContain('titel');
  });
});

describe('lessonRefIssues', () => {
  it('should report a word missing from the dictionary with file and line', () => {
    const parsed = parse(VALID);

    const issues = lessonRefIssues(parsed, new Set(['人']), new Set(['s1']));

    expect(issues).toEqual([
      {
        level: 'error',
        file: FILE,
        line: 10,
        message: 'Từ "八" không có trong từ điển',
      },
    ]);
  });

  it('should still report a missing word when the lesson has schema errors', () => {
    const parsed = parse(VALID.with(10, '  - { id: e2, kind: speak }'));

    const issues = lessonRefIssues(parsed, new Set(), new Set());

    expect(parsed.lesson).toBeUndefined();
    expect(issues).toEqual([expect.objectContaining({ line: 10 })]);
  });

  it('should report an undeclared sentence', () => {
    const issues = lessonRefIssues(parse(VALID), new Set(['八']), new Set());

    expect(issues[0]).toMatchObject({ line: 11 });
  });
});
