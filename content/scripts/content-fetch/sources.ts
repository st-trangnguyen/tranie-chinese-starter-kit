import type { PinnedSource } from '../lib/pinnedSource';

const KRMANIK =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/d30e97016a7f52af6437805170759031d93bbe6a/New%20HSK%20(2021)';

/** Danh sách từ HSK 3.0 (chuẩn 2021) cấp 1: 500 mục theo thứ tự chính thức, mỗi dòng một từ. */
export const HSK1_LIST: PinnedSource = {
  name: 'hsk1.list.txt',
  url: `${KRMANIK}/HSK%20List/HSK%201.txt`,
  sha256: '3081701aee20cec7b8d8c8f3f5041b667d5ed37810f1f750a708eeafbaa572a1',
  license:
    'krmanik/HSK-3.0 — danh sách từ của Hanban/CTI; pinyin + nghĩa theo CC-CEDICT (CC BY-SA 4.0)',
};

/** Bảng phồn thể · giản thể · pinyin dấu · nghĩa tiếng Anh cho từng hanzi của cấp 1. */
export const HSK1_MEANINGS: PinnedSource = {
  name: 'hsk1.meaning.tsv',
  url: `${KRMANIK}/HSK%20List%20(Meaning)/HSK%201.tsv`,
  sha256: 'db054007c7684e272ab973f06ebb8d0434927bc10a008b1981b10d4a94bc838f',
  license: HSK1_LIST.license,
};

/** CVDICT: từ điển Hán–Việt dịch từ CC-CEDICT, định dạng CEDICT. */
export const CVDICT: PinnedSource = {
  name: 'CVDICT.u8',
  url: 'https://raw.githubusercontent.com/ph0ngp/CVDICT/c379d909e308343a247e51619f7839a2060a271c/CVDICT.u8',
  sha256: '4dde4b204193efa9c192d7f7daeab1bb579c8ccd7c41ed90d1b6caee22ba0948',
  license: 'CVDICT — Phong Phan, CC BY-SA 4.0',
};
