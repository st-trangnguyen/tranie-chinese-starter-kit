import { strokeIndexSchema } from '@csk/shared';

import { assembleContent, type BuildInputs } from './assemble';
import { parseYamlFile } from '../lib/yamlFile';

const LESSON_FILE = 'content/authored/lessons/intro/01.yaml';

const LESSON = [
  'id: intro-01',
  'type: lesson',
  'title: Thanh điệu',
  'sentences:',
  '  - id: s1',
  '    hanzi: 你好！',
  '    pinyin: nǐ hǎo!',
  '    vi: Xin chào!',
  'exercises:',
  '  - { id: e1, kind: tone-choice, wordId: 八 }',
  '  - { id: e2, kind: speak, sentenceId: s1 }',
];

const PATH = [
  'stages:',
  '  - id: st1',
  '    title: Nhập môn',
  '    units:',
  '      - id: u1',
  '        title: Thanh điệu',
  '        lessons: [intro-01]',
];

const STROKE_JSON = '{"strokes":["M 0 0 L 1 1"],"medians":[[[0,0],[1,1]]]}';

const inputs = (strokeData: BuildInputs['strokeData']): BuildInputs => ({
  hskEntries: [{ id: '八', hanzi: '八', pinyin: 'bā', en: 'eight' }],
  meanings: { 八: { vi: ['tám'], reviewed: true } },
  overrides: {},
  path: parseYamlFile('content/authored/path.yaml', PATH.join('\n')),
  lessons: [parseYamlFile(LESSON_FILE, LESSON.join('\n'))],
  strokeData,
});

describe('assembleContent — strokes/index.json', () => {
  it('S6.1-AC1: sinh strokes/index.json gồm đúng các chữ có dữ liệu nét, đã sắp xếp', () => {
    // Chữ dùng trong bài: 八 (từ), 你 好 (câu). 你 không có dữ liệu nét.
    const withStrokes = new Set(['好', '八']);

    const result = assembleContent(
      inputs((char) => (withStrokes.has(char) ? STROKE_JSON : undefined)),
    );

    const indexFile = result.files.get('strokes/index.json');
    expect(indexFile).toBeDefined();
    const index = strokeIndexSchema.parse(JSON.parse(indexFile ?? ''));
    expect(index).toEqual(['八', '好']);
    expect(index).not.toContain('你');
    expect(result.missingStrokes).toEqual(['你']);
  });

  it('S6.1-AC1: strokes/index.json là mảng rỗng khi không chữ nào có dữ liệu nét', () => {
    const result = assembleContent(inputs(() => undefined));

    const indexFile = result.files.get('strokes/index.json');
    expect(indexFile).toBeDefined();
    expect(strokeIndexSchema.parse(JSON.parse(indexFile ?? ''))).toEqual([]);
  });
});
