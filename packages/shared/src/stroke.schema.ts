import { z } from 'zod';

/**
 * Đúng một ký tự (đếm theo code point) thuộc chữ Hán (S6.1 D3).
 * Một nguồn duy nhất cho rule này: phần tử danh sách nét và tham số URL đều dùng.
 */
export const hanCharacterSchema = z.string().regex(/^\p{Script=Han}$/u);

const medianPointSchema = z.tuple([z.number(), z.number()]);

/** Dữ liệu nét một chữ (định dạng hanzi-writer). Số `medians` phải bằng số nét. */
export const strokeDataSchema = z
  .object({
    strokes: z.array(z.string().min(1)).min(1),
    medians: z.array(z.array(medianPointSchema).min(1)),
    radStrokes: z.array(z.number().int().min(0)).optional(),
  })
  .refine((data) => data.medians.length === data.strokes.length, {
    message: 'Số medians phải bằng số nét',
    path: ['medians'],
  });
export type StrokeData = z.infer<typeof strokeDataSchema>;

/** Danh sách chữ có dữ liệu nét trong bản app (`strokes/index.json`), không trùng. */
export const strokeIndexSchema = z
  .array(hanCharacterSchema)
  .refine((characters) => new Set(characters).size === characters.length, {
    message: 'Danh sách chữ có dữ liệu nét bị trùng',
  });
export type StrokeIndex = z.infer<typeof strokeIndexSchema>;
