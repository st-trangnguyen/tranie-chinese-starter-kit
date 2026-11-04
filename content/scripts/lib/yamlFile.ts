import { isNode, LineCounter, parseDocument, type Document } from 'yaml';
import type { ZodIssue } from 'zod';

import type { ContentIssue } from '../content-check/checkRunner';

/** File YAML đã parse, giữ lại vị trí node để báo lỗi kèm số dòng (S2.3 AC2). */
export interface YamlFile {
  /** Đường dẫn tương đối từ gốc repo. */
  file: string;
  doc: Document;
  value: unknown;
  lineOf: (path: readonly PropertyKey[]) => number | undefined;
  /** Lỗi cú pháp YAML (đã kèm số dòng). */
  syntaxIssues: ContentIssue[];
}

export function parseYamlFile(file: string, text: string): YamlFile {
  const counter = new LineCounter();
  const doc = parseDocument(text, { lineCounter: counter });

  /** Dòng của node theo path; path không tồn tại (thiếu field) thì lùi về node cha gần nhất. */
  const lineOf = (path: readonly PropertyKey[]): number | undefined => {
    const keys = path.filter(
      (key): key is string | number => typeof key !== 'symbol',
    );
    for (let depth = keys.length; depth >= 0; depth -= 1) {
      const node: unknown = doc.getIn(keys.slice(0, depth), true);
      if (isNode(node) && node.range) {
        return counter.linePos(node.range[0]).line;
      }
    }
    return undefined;
  };

  const syntaxIssues = doc.errors.map((error): ContentIssue => ({
    level: 'error',
    file,
    line: error.linePos?.[0].line,
    message: `YAML lỗi cú pháp: ${error.message.split('\n')[0]}`,
  }));

  return {
    file,
    doc,
    value: syntaxIssues.length > 0 ? undefined : doc.toJS(),
    lineOf,
    syntaxIssues,
  };
}

/** Lỗi zod → `ContentIssue` kèm số dòng của field sai trong file YAML. */
export function zodIssuesToContent(
  source: YamlFile,
  issues: readonly ZodIssue[],
  pathPrefix: readonly (string | number)[] = [],
): ContentIssue[] {
  return issues.map((issue) => {
    const path = [...pathPrefix, ...issue.path];
    const where = path.length > 0 ? `${path.join('.')}: ` : '';
    return {
      level: 'error',
      file: source.file,
      line: source.lineOf(path),
      message: `${where}${issue.message}`,
    };
  });
}
