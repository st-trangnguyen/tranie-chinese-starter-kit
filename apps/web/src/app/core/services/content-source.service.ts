import {
  contentRootSchema,
  lessonSchema,
  type ContentRoot,
  type Lesson,
} from '@csk/shared';

/**
 * Nguồn nội dung tĩnh (JSON do pipeline `@csk/content` sinh, precache bởi service worker).
 * Trả dữ liệu đã validate bằng schema của `@csk/shared` (CLAUDE.md §0.4).
 */
export interface ContentSource {
  getContentRoot(): Promise<ContentRoot>;
  getLesson(lessonId: string): Promise<Lesson>;
}

const CONTENT_BASE_PATH = '/content';

interface Schema<T> {
  safeParse(
    input: unknown,
  ): { success: true; data: T } | { success: false; error: Error };
}

export class FetchContentSource implements ContentSource {
  getContentRoot(): Promise<ContentRoot> {
    return this.load(`${CONTENT_BASE_PATH}/content.json`, contentRootSchema);
  }

  getLesson(lessonId: string): Promise<Lesson> {
    return this.load(
      `${CONTENT_BASE_PATH}/lessons/${encodeURIComponent(lessonId)}.json`,
      lessonSchema,
    );
  }

  private async load<T>(url: string, schema: Schema<T>): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Không tải được nội dung: ${url} (HTTP ${response.status})`,
      );
    }
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Nội dung không hợp lệ: ${url}`, {
        cause: result.error,
      });
    }
    return result.data;
  }
}

export const contentSource: ContentSource = new FetchContentSource();
