/** Thanh mẫu, xếp dài trước ngắn. `y`, `w` được coi là thanh mẫu (xem design S4.3). */
export const PINYIN_INITIALS: readonly string[] = [
  'zh',
  'ch',
  'sh',
  'b',
  'p',
  'm',
  'f',
  'd',
  't',
  'n',
  'l',
  'g',
  'k',
  'h',
  'j',
  'q',
  'x',
  'r',
  'z',
  'c',
  's',
  'y',
  'w',
];

const SYLLABLE_GROUPS: readonly string[] = [
  'a ai an ang ao e ei en eng er o ou',
  'ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu',
  'pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu',
  'ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu',
  'fa fan fang fei fen feng fo fou fu',
  'da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo',
  'ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo',
  'na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe',
  'la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe',
  'ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo',
  'ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo',
  'ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo',
  'ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun',
  'qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun',
  'xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun',
  'zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo',
  'cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo',
  'sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo',
  'ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo',
  'za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo',
  'ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo',
  'sa sai san sang sao se sen seng si song sou su suan sui sun suo',
  'ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun',
  'wa wai wan wang wei wen weng wo wu',
];

/** Âm tiết hợp lệ không thanh; ü viết `ü`; `ju qu xu yu` viết bằng `u`. */
export const PINYIN_SYLLABLES: ReadonlySet<string> = new Set(
  SYLLABLE_GROUPS.flatMap((group) => group.split(' ')),
);

const MAX_SYLLABLE_LENGTH = 7;
const VOWELS = 'aeiouü';

function isSyllable(piece: string, next: string | undefined): boolean {
  if (PINYIN_SYLLABLES.has(piece)) {
    return true;
  }
  // Erhua: âm tiết + `r` khi sau `r` không còn nguyên âm.
  const isErhua = piece.length > 1 && piece.endsWith('r');
  const hasVowelAfter = next !== undefined && VOWELS.includes(next);
  return isErhua && !hasVowelAfter && PINYIN_SYLLABLES.has(piece.slice(0, -1));
}

function splitFrom(letters: string, start: number): string[] | null {
  if (start === letters.length) {
    return [];
  }
  const maxLength = Math.min(MAX_SYLLABLE_LENGTH, letters.length - start);
  for (let length = maxLength; length >= 1; length -= 1) {
    const piece = letters.slice(start, start + length);
    if (isSyllable(piece, letters[start + length])) {
      const rest = splitFrom(letters, start + length);
      if (rest !== null) {
        return [piece, ...rest];
      }
    }
  }
  return null;
}

/**
 * Rule: tách chuỗi chữ thường, không thanh thành âm tiết; ưu tiên khớp dài nhất ở đầu.
 * Không tách được trọn vẹn thì trả `[letters]`, không bao giờ throw.
 */
export function splitPinyinSyllables(letters: string): string[] {
  return splitFrom(letters, 0) ?? [letters];
}
