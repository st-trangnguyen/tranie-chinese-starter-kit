import type { FakeHanziWriter } from '@test/mocks/hanzi-writer';

/** Helper dùng chung cho test `createStrokeQuiz` (S6.2 D4). */

export const SVG_NS = 'http://www.w3.org/2000/svg';

export interface Stage {
  svg: SVGSVGElement;
  host: SVGGElement;
}

/** `<svg viewBox="0 0 1024 1024">` chứa `<g>` host rỗng, như khung viết (D6). */
export function createStage(): Stage {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  const host = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(host);
  document.body.appendChild(svg);
  return { svg, host };
}

/** Chờ quiz kích hoạt: thư viện bắt đầu quiz ở microtask sau `quiz()`. */
export async function flushQuizStart(): Promise<void> {
  await Promise.resolve();
}

export function ownSvgOf(host: SVGGElement): Element {
  const ownSvg = host.querySelector(':scope > svg.writing-pad-writer');
  if (!ownSvg) {
    throw new Error('Host chưa có svg.writing-pad-writer');
  }
  return ownSvg;
}

export function countCalls(writer: FakeHanziWriter, method: string): number {
  return writer.calls.filter((call) => call.method === method).length;
}
