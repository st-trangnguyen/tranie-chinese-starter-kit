import { strokeDataSchema, type StrokeData } from '@csk/shared';

import hao from '@assets/content/strokes/好.json';
import ren from '@assets/content/strokes/人.json';
import bai from '@assets/content/strokes/白.json';
import shi from '@assets/content/strokes/十.json';

/**
 * Dữ liệu nét thật do `content:build` sinh (S6.1). Validate qua schema như app, không ép kiểu.
 * 好: 6 nét · 人: 2 nét · 白: 5 nét · 十: 2 nét.
 */
export const STROKE_DATA_HAO: StrokeData = strokeDataSchema.parse(hao);
export const STROKE_DATA_REN: StrokeData = strokeDataSchema.parse(ren);
export const STROKE_DATA_BAI: StrokeData = strokeDataSchema.parse(bai);
export const STROKE_DATA_SHI: StrokeData = strokeDataSchema.parse(shi);
