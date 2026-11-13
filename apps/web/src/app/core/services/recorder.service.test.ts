import { describe, expect, it, vi } from 'vitest';

import {
  createRecorderService,
  RecorderService,
  type RecorderDeps,
} from './recorder.service';

class FakeTrack {
  stop = vi.fn();
}

class FakeStream {
  tracks = [new FakeTrack(), new FakeTrack()];
  getTracks(): FakeTrack[] {
    return this.tracks;
  }
}

class FakeRecorder {
  mimeType = 'audio/webm';
  state: 'inactive' | 'recording' = 'inactive';
  private listeners = new Map<string, Array<(event: Event) => void>>();

  constructor(private readonly chunkText: string) {}

  addEventListener(type: string, listener: (event: Event) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  removeEventListener(type: string, listener: (event: Event) => void): void {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((item) => item !== listener),
    );
  }

  start(): void {
    this.state = 'recording';
  }

  stop(): void {
    this.state = 'inactive';
    const data = new Blob([this.chunkText], { type: this.mimeType });
    this.emit(
      'dataavailable',
      Object.assign(new Event('dataavailable'), { data }),
    );
    this.emit('stop', new Event('stop'));
  }

  private emit(type: string, event: Event): void {
    (this.listeners.get(type) ?? []).forEach((listener) => listener(event));
  }
}

function setup(): {
  service: RecorderService;
  deps: RecorderDeps;
  createObjectUrl: ReturnType<typeof vi.fn>;
  blobs: Blob[];
  revokeObjectUrl: ReturnType<typeof vi.fn>;
  streams: FakeStream[];
} {
  const streams: FakeStream[] = [];
  let counter = 0;
  const blobs: Blob[] = [];
  const createObjectUrl = vi.fn((blob: Blob) => {
    blobs.push(blob);
    return `blob:fake-${++counter}`;
  });
  const revokeObjectUrl = vi.fn();
  const deps: RecorderDeps = {
    getUserMedia: () => {
      const stream = new FakeStream();
      streams.push(stream);
      return Promise.resolve(stream as unknown as MediaStream);
    },
    createRecorder: () => new FakeRecorder('voice') as unknown as MediaRecorder,
    createObjectUrl,
    revokeObjectUrl,
  };
  return {
    service: new RecorderService(deps),
    deps,
    createObjectUrl,
    blobs,
    revokeObjectUrl,
    streams,
  };
}

describe('RecorderService', () => {
  it('S5.1-AC1: bấm Dừng thì kết thúc ghi và trả một URL bản ghi', async () => {
    const { service, createObjectUrl, blobs, streams } = setup();

    await service.start();
    const url = await service.stop();

    expect(url).toBe('blob:fake-1');
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(blobs[0]).toBeInstanceOf(Blob);
    expect(blobs[0]?.size).toBeGreaterThan(0);
    // micro không còn được dùng sau khi dừng
    streams[0]?.tracks.forEach((track) =>
      expect(track.stop).toHaveBeenCalled(),
    );
  });

  it('S5.1-AC1: ghi lại thì bản mới thay bản cũ (thu hồi URL cũ, chỉ còn URL mới)', async () => {
    const { service, revokeObjectUrl } = setup();

    await service.start();
    const first = await service.stop();
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    await service.start();
    const second = await service.stop();

    expect(second).not.toBe(first);
    expect(revokeObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith(first);
    expect(revokeObjectUrl).not.toHaveBeenCalledWith(second);
  });

  it('S5.1-AC1: discard khi đang ghi thì dừng recorder, dừng mọi track và thu hồi URL', async () => {
    const { service, deps, revokeObjectUrl, streams } = setup();
    const recorders: FakeRecorder[] = [];
    const createRecorder = deps.createRecorder;
    const spiedService = new RecorderService({
      ...deps,
      createRecorder: (stream) => {
        const recorder = createRecorder(stream);
        recorders.push(recorder as unknown as FakeRecorder);
        return recorder;
      },
    });
    expect(service).toBeInstanceOf(RecorderService);

    await spiedService.start();
    expect(recorders[0]?.state).toBe('recording');

    spiedService.discard();

    expect(recorders[0]?.state).toBe('inactive');
    expect(streams[0]?.tracks).toHaveLength(2);
    streams[0]?.tracks.forEach((track) =>
      expect(track.stop).toHaveBeenCalled(),
    );
    // chưa có bản ghi hoàn tất nên không có URL nào để thu hồi
    expect(revokeObjectUrl).not.toHaveBeenCalled();
  });

  it('S5.1-AC1: discard khi getUserMedia còn pending thì khi stream về mọi track bị dừng và không tạo/khởi động recorder', async () => {
    const stream = new FakeStream();
    let resolveStream: (value: MediaStream) => void = () => {};
    const createRecorder = vi.fn(
      () => new FakeRecorder('voice') as unknown as MediaRecorder,
    );
    const service = new RecorderService({
      getUserMedia: () =>
        new Promise<MediaStream>((resolve) => {
          resolveStream = resolve;
        }),
      createRecorder,
      createObjectUrl: vi.fn(() => 'blob:fake-1'),
      revokeObjectUrl: vi.fn(),
    });
    const startSpy = vi.spyOn(FakeRecorder.prototype, 'start');

    const startPromise = service.start();
    service.discard();
    resolveStream(stream as unknown as MediaStream);
    await startPromise.catch(() => undefined);

    stream.tracks.forEach((track) => expect(track.stop).toHaveBeenCalled());
    expect(startSpy).not.toHaveBeenCalled();
    expect(createRecorder).not.toHaveBeenCalled();
    startSpy.mockRestore();
  });

  it('S5.1-AC1: discard gọi hai lần không lỗi và không thu hồi URL hai lần', async () => {
    const { service, revokeObjectUrl } = setup();

    await service.start();
    const url = await service.stop();

    expect(() => {
      service.discard();
      service.discard();
    }).not.toThrow();
    expect(revokeObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith(url);
  });

  it('S5.1-AC1: discard khi chưa ghi gì không lỗi', () => {
    const { service, revokeObjectUrl } = setup();

    expect(() => service.discard()).not.toThrow();
    expect(revokeObjectUrl).not.toHaveBeenCalled();
  });

  it('S5.1-AC3: sang câu khác (discard) thì bản ghi của câu trước bị thu hồi', async () => {
    const { service, revokeObjectUrl } = setup();

    await service.start();
    const previousUrl = await service.stop();
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    service.discard();

    expect(revokeObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith(previousUrl);
  });

  it('S5.1-AC1: createRecorderService dựng được service thật', () => {
    expect(createRecorderService()).toBeInstanceOf(RecorderService);
  });
});
