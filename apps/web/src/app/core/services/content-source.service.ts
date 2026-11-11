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

export class FetchContentSource implements ContentSource {
  async getContentRoot(): Promise<ContentRoot> {
    return contentRootSchema.parse(
      await this.fetchJson(`${CONTENT_BASE_PATH}/content.json`),
    );
  }

  async getLesson(lessonId: string): Promise<Lesson> {
    return lessonSchema.parse(
      await this.fetchJson(
        `${CONTENT_BASE_PATH}/lessons/${encodeURIComponent(lessonId)}.json`,
      ),
    );
  }

  private async fetchJson(url: string): Promise<unknown> {
    const response = await fetch(url);
    const body: unknown = await response.json();
    return body;
  }
}

export const contentSource: ContentSource = new FetchContentSource();
