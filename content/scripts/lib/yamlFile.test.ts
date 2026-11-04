import { z } from 'zod';

import { parseYamlFile, zodIssuesToContent } from './yamlFile';

const TEXT = [
  'id: intro-01', // 1
  'exercises:', // 2
  '  - id: e1', // 3
  '    kind: tone-choice', // 4
  '  - id: e2', // 5
  '    kind: speak', // 6
].join('\n');

describe('parseYamlFile', () => {
  it('should return the line of a nested node', () => {
    const source = parseYamlFile('a.yaml', TEXT);

    expect(source.lineOf(['exercises', 1, 'kind'])).toBe(6);
  });

  it('should fall back to the closest parent when the field is missing', () => {
    const source = parseYamlFile('a.yaml', TEXT);

    expect(source.lineOf(['exercises', 1, 'wordId'])).toBe(5);
  });

  it('should report syntax errors with a line and no value', () => {
    const source = parseYamlFile('a.yaml', 'id: a\nexercises: [\n');

    expect(source.value).toBeUndefined();
    expect(source.syntaxIssues[0]?.line).toBeGreaterThan(0);
  });
});

describe('zodIssuesToContent', () => {
  it('should map a zod issue path to file and line', () => {
    const source = parseYamlFile('a.yaml', TEXT);
    const schema = z.object({
      exercises: z.array(z.object({ kind: z.literal('tone-choice') })),
    });
    const result = schema.safeParse(source.value);

    const issues = zodIssuesToContent(source, result.error?.issues ?? []);

    expect(issues).toEqual([
      expect.objectContaining({ file: 'a.yaml', line: 6, level: 'error' }),
    ]);
  });
});
