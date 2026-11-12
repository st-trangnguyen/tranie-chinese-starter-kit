import { comparePinyin, parsePinyin } from './pinyin.compare';

describe('comparePinyin().isCorrect', () => {
  it('S4.3-AC2: gõ kiểu số đúng thì được chấm đúng', () => {
    expect(comparePinyin('ni3', 'nǐ').isCorrect).toBe(true);
    expect(comparePinyin('Ni3', 'nǐ').isCorrect).toBe(true);
  });

  it('S4.3-AC2: gõ kiểu dấu đúng thì được chấm đúng', () => {
    expect(comparePinyin('nǐ', 'nǐ').isCorrect).toBe(true);
  });

  it('S4.3-AC2: gõ liền hay cách âm tiết đều đúng', () => {
    for (const typed of ['ba4ba', 'ba4ba5', 'ba4 ba', 'bàba']) {
      expect(comparePinyin(typed, 'bàba').isCorrect).toBe(true);
    }
  });

  it('S4.3-AC2: hoa thường và khoảng trắng thừa không ảnh hưởng', () => {
    for (const typed of ['  Ni3  Hao3 ', 'ni3hao3', 'nǐhǎo', 'nǐ hǎo']) {
      expect(comparePinyin(typed, 'nǐ hǎo').isCorrect).toBe(true);
    }
  });

  it('S4.3-AC2: thiếu âm tiết thì sai', () => {
    expect(comparePinyin('ni3', 'nǐ hǎo').isCorrect).toBe(false);
  });

  it('S4.3-AC2: chuỗi trống thì sai', () => {
    expect(comparePinyin('', 'nǐ').isCorrect).toBe(false);
    expect(comparePinyin('   ', 'nǐ').isCorrect).toBe(false);
  });

  it('S4.3-AC2: cách tách âm tiết khác vẫn đúng', () => {
    expect(comparePinyin('fan1gan1', 'fāngān').isCorrect).toBe(true);
  });
});

describe('parsePinyin', () => {
  it('S4.3-AC3: tách thanh mẫu, vận mẫu, thanh điệu của một âm tiết', () => {
    expect(parsePinyin('shì')).toEqual([
      { initial: 'sh', final: 'i', tone: 4 },
    ]);
  });
});

describe('comparePinyin().syllables', () => {
  function wrongFlags(typed: string, expected: string): boolean[][] {
    return comparePinyin(typed, expected).syllables.map((s) => [
      s.isInitialWrong,
      s.isFinalWrong,
      s.isToneWrong,
    ]);
  }

  it('S4.3-AC3: sai thanh mẫu thì chỉ isInitialWrong', () => {
    const result = comparePinyin('si4', 'shì');
    expect(result.isCorrect).toBe(false);
    expect(wrongFlags('si4', 'shì')).toEqual([[true, false, false]]);
  });

  it('S4.3-AC3: sai vận mẫu thì chỉ isFinalWrong', () => {
    expect(wrongFlags('na3', 'nǐ')).toEqual([[false, true, false]]);
  });

  it('S4.3-AC3: sai thanh điệu thì chỉ isToneWrong', () => {
    expect(wrongFlags('ma2', 'mā')).toEqual([[false, false, true]]);
  });

  it('S4.3-AC3: sai nhiều phần thì tô hết các phần sai', () => {
    expect(wrongFlags('na2', 'mā')).toEqual([[true, false, true]]);
  });

  it('S4.3-AC3: từ nhiều âm tiết thì tô theo từng âm tiết', () => {
    expect(wrongFlags('ni3hao2', 'nǐ hǎo')).toEqual([
      [false, false, false],
      [false, false, true],
    ]);
  });

  it('S4.3-AC3: thiếu âm tiết thì âm tiết thiếu bị tô sai cả ba phần', () => {
    const { syllables } = comparePinyin('ni3', 'nǐ hǎo');
    expect(syllables).toHaveLength(2);
    expect(syllables[1]?.typed).toBeNull();
    expect(wrongFlags('ni3', 'nǐ hǎo')[1]).toEqual([true, true, true]);
  });

  it('S4.3-AC3: gõ thừa âm tiết thì âm tiết thừa bị tô sai cả ba phần', () => {
    const { syllables } = comparePinyin('ni3hao3', 'nǐ');
    expect(syllables).toHaveLength(2);
    expect(syllables[1]?.expected).toBeNull();
    expect(wrongFlags('ni3hao3', 'nǐ')[1]).toEqual([true, true, true]);
  });
});
