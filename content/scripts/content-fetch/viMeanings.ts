import { Document, isMap, parseDocument } from 'yaml';

import type { CvdictMatch } from './cvdict';
import type { HskEntry } from './hskList';

const HEADER = [
  ' Nghĩa tiếng Việt của từ HSK (S2.2). Khởi tạo từ CVDICT bởi `content:fetch`.',
  ' Review xong một từ thì sửa nghĩa nếu cần và đặt `reviewed: true`.',
  ' `content:fetch` chỉ thêm từ còn thiếu, không ghi đè dòng đã có.',
].join('\n');

/**
 * Thêm vào `vi-meanings.yaml` các từ chưa có (nghĩa gợi ý từ CVDICT, `reviewed: false`),
 * giữ nguyên dòng và comment người soạn đã sửa. Trả về nội dung file mới.
 */
export function mergeViMeanings(
  existingYaml: string,
  words: readonly HskEntry[],
  matches: ReadonlyMap<string, CvdictMatch | undefined>,
): string {
  const parsed = parseDocument(existingYaml);
  const doc = isMap(parsed.contents) ? parsed : new Document({});
  if (doc !== parsed) {
    doc.commentBefore = HEADER;
  }
  words
    .filter((word) => !doc.has(word.id))
    .forEach((word) => {
      const node = doc.createNode({
        vi: matches.get(word.id)?.vi ?? [],
        reviewed: false,
      });
      node.flow = true;
      doc.set(word.id, node);
    });
  return doc.toString({ lineWidth: 0 });
}
