import type { ContentSource } from '@core/services/content-source.service';
import type { PathMap } from '@shared/models/learning-path.model';

export class ContentService {
  constructor(private readonly source: ContentSource) {}

  getPathMap(): Promise<PathMap> {
    return Promise.reject(new Error(`Not implemented: ${typeof this.source}`));
  }
}
