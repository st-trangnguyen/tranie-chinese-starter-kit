# Design: S8.4 Tải audio offline theo chủ đề

Động lực và phạm vi: `proposal.md`. Hành vi: `specs/offline-audio/spec.md`. Case nghiệm thu: `test-cases.md`. Luật
layer/dependency/service 3 phần: `CLAUDE.md` §1–§3 (không chép lại ở đây).

## Context

Quan sát được trong repo (`main` sau khi merge PR spec #133, không phải đề xuất):

- **PWA** (`apps/web/vite.config.ts`): `VitePWA` chế độ **generateSW**, `registerType: 'prompt'`, `workbox.globPatterns:
  ['**/*.{js,css,html,woff2,svg,png,ico,json,mp3}']` → mọi mp3 (503 file, 5,9 MB, gồm 500 audio từ HSK 1 không bài nào dùng)
  đều precache. Chưa có `runtimeCaching`, chưa có cache `audio-cache`. `UpdateBanner` dùng `virtual:pwa-register/react`.
  Thư viện workbox có sẵn qua `vite-plugin-pwa`/`workbox-build` 7.4 (`workbox-range-requests`, `workbox-strategies`… chỉ là
  dependency bắc cầu, `apps/web` không khai báo trực tiếp).
- **Nội dung**: `content.json` (Stage → Unit → `lessonIds`), `lessons/*.json`, `words.json`, `sentences.json`. Audio là field
  `audio` (`audio/<16 hex>.mp3`, `audioPathSchema` private trong `packages/shared/src/content.schema.ts`) của từ và câu; bài tham
  chiếu từ/câu bằng id. Giai đoạn Nhập môn có `id: 'intro'` (`content/authored/path.yaml`), chưa có hằng nào cho id này.
  Pipeline: `content-build/assemble.ts` (`assembleContent` thuần, đầu vào `BuildInputs`, trả `files` + `audioJobs`),
  `content-audio/index.ts` tạo mp3 sau `content:build`, `content-check` so `files` với đĩa (`outputInSyncCheck`, mọi `.json`
  trong `assets/content/`) và kiểm mp3 thiếu (`audioCheck`).
- **Phát audio**: chỉ trong dạng bài (`ListenButton` → `useAudioPlayer` → `AudioService`, một `<audio>` dùng chung, URL
  `/${audioPath}`). tone-choice, pinyin-type: audio từ; sound-pair: hai từ; speak: từ hoặc câu; stroke-write: không có nút Nghe
  (helper `lessonAudioPaths` trong `e2e/E7/s7.1-intro-offline.spec.ts` đã mô tả đúng quy tắc này). Lỗi phát → "Không phát được
  audio." + nút thử lại (S7.1).
- **Bản đồ** (`pages/learning-path/`): `useLearningPath` → `{ pathMap, statuses, placementTestUnitIds, hasError }`;
  `LearningPathStage` (4 props: `title`, `units`, `renderLesson`, `placementTestUnitIds`) render `<h3>` nhóm rồi link "Kiểm tra
  vượt cấp" rồi `<ol>` bài. Màn bài không chặn bài khóa: mở `/lessons/:id` trực tiếp vẫn học được.
- **Mẫu dùng lại**: `ContentService` nhận `ContentSource` qua constructor (không phải `ProgressStore`); singleton hạ tầng
  `contentSource`, `progressStore`, `audioService` export từ file `core/services`; `useOnlineStatus` là mẫu
  `useSyncExternalStore`; context theo cặp `AudioSpeedContext.tsx` + `useAudioSpeed.ts`.
- **E2E**: Playwright chỉ `chromium` (Pixel 7), `webServer` = `pnpm build --mode e2e && vite preview` (không `--mode e2e` ở
  preview). `offlineFixturesPlugin` (`apply: 'build'`) chỉ thêm 1 JSON + 1 mp3 (`audio/_e2e/offline-silence.mp3`, S1.2 kiểm nó
  được precache). Test cần sửa nội dung (S8.1 nhiều nhóm) dùng `page.route` + `serviceWorkers: 'block'`, vì `page.route` không
  chặn request do service worker phục vụ hay do service worker gửi ra.
- `fake-indexeddb` có sẵn trong Vitest; **không** có giả lập Cache Storage. Bảy object `ContentSource` viết tay trong
  `content.service.test.ts` (`makeSource`) và `stroke-order.service.test.ts` (dòng 17, 109, 149, 167, 184, 201).

## Goals / Non-Goals

**Goals:**

- Một nguồn duy nhất cho "audio của chủ đề" và "audio Nhập môn": pipeline tính, app và cấu hình precache cùng đọc.
- Mọi quy tắc trạng thái/xóa/tiến độ/thông báo là hàm thuần ở Phần 2, test bằng bảng không cần trình duyệt.
- Việc tải sống trong một instance ngoài cây React, nên rời màn không dừng tải; React chỉ subscribe.
- Audio đã phát hay đã tải phát được offline trên cả Chromium lẫn Safari (Range → 206) mà **không thêm dependency**.
- E2E điều khiển được mạng của từng file audio (chậm, giữ, lỗi, mất mạng, đếm lượt) mà không ảnh hưởng e2e cũ.

**Non-Goals:**

- Không đổi IndexedDB, không lưu "đã bấm tải" (trạng thái suy ra từ cache — proposal).
- Không phục vụ Range cho audio Nhập môn trong precache (route precache của S1.2 giữ nguyên, xem Risks).
- Không dọn mp3 thừa sau cập nhật nội dung, không ước tính dung lượng còn trống (out of scope).

## Decisions

### D1. Danh sách audio: file `content/audio-index.json` do pipeline sinh

Schema mới `packages/shared/src/audio-index.schema.ts` (export qua `index.ts`):

```ts
export const INTRO_STAGE_ID = 'intro';
export const audioIndexSchema = z.object({
  /** unitId → audio các bài của nhóm phát, không trùng, theo thứ tự bài. Nhóm không có audio: []. */
  units: z.record(idSchema, z.array(audioPathSchema)),
  /** audio → số byte của file mp3. */
  bytes: z.record(audioPathSchema, z.number().int().nonnegative()),
  /** Audio của mọi nhóm thuộc giai đoạn INTRO_STAGE_ID: danh sách precache. */
  precached: z.array(audioPathSchema),
}).superRefine(/* mọi path trong units và precached phải có trong bytes */);
export type AudioIndex = z.infer<typeof audioIndexSchema>;
```

`idSchema`, `audioPathSchema` trong `content.schema.ts` chuyển thành export (không đổi định nghĩa). `INTRO_STAGE_ID` nằm ở
`@csk/shared` vì cả pipeline (chọn precache) và app (Rule "thuộc Nhập môn") dùng.

- Thay thế: (a) app tự gom audio từ bài + từ + câu lúc chạy → quy tắc "audio nào bài phát" lặp ở pipeline (precache) và app,
  dễ lệch; dung lượng file vẫn phải do pipeline cung cấp. (b) thêm field vào `content.json` → `contentVersion` và schema lộ
  trình đổi vì dữ liệu audio; tách file giữ `contentRootSchema` nguyên.

### D2. Pipeline sinh và kiểm `audio-index.json`

- `content/scripts/content-build/audioIndex.ts`: `lessonAudioPaths(lesson, wordById, sentenceById): string[]` (quy tắc phát
  theo `kind` như Context; stroke-write không có audio) và `buildAudioIndex(stages, lessons, wordById, sentenceById,
  audioBytes): AudioIndex` (`precached` = hợp audio các nhóm của stage `INTRO_STAGE_ID`, không trùng, đã sort).
- `BuildInputs` thêm `audioBytes: (path: string) => number | undefined` (`inputs.ts`: `statSync` trên `PATHS.assets`, không có
  file → `undefined`). File chưa có → ghi `0`; `audioCheck` sẵn có đã báo lỗi mp3 thiếu nên trạng thái commit luôn đủ byte.
- `assembleContent` thêm `['audio-index.json', json(index)]` vào `files` (không vào `contentVersion`). `outputInSyncCheck`
  tự kiểm file này vì nó là `.json` trong `assets/content/`.
- `content-audio/index.ts`: tạo mp3 xong thì gọi lại `assembleContent(readBuildInputs())` và ghi riêng `audio-index.json`
  (byte mới). Quy trình người soạn không đổi: `content:build` → `content:audio`.
- Chạy `content:build` một lần trong PR và commit `apps/web/src/assets/content/audio-index.json`.

### D3. Precache chỉ audio Nhập môn; audio còn lại cache-first có Range — giữ **generateSW**

File `apps/web/src/app/core/modules/pwa/audio-caching.config.ts` (chỉ import tương đối và `@csk/shared`, vì `vite.config.ts`
không dùng alias `@core`):

- `PRECACHE_BASE_PATTERNS = ['**/*.{js,css,html,woff2,svg,png,ico,json}']` (bỏ `mp3`).
- `listPrecachedAudioPatterns(indexJson: unknown): string[]` — parse bằng `audioIndexSchema`, trả `index.precached` (đường dẫn
  cụ thể, workbox glob khớp đúng file). Lỗi parse → throw (build dừng, báo rõ file).
- `stripRangeRequest` (plugin `requestWillFetch`): trả `new Request(request.url, { credentials: 'same-origin' })` — bỏ
  header `Range` để mạng trả **200 đầy đủ**, cache được (phần tử `<audio>` của Chromium luôn gửi `Range: bytes=0-`; 206
  không cache được).
- `toPartialResponse` (plugin `handlerWillRespond`): request có `Range` mà response là 200 → dựng 206 từ blob (`Content-Range`,
  `Content-Length`); không `Range` hoặc đã là 206 → giữ nguyên; `Range` không đọc được → giữ nguyên.
- `createAudioRuntimeCaching()` trả mục `runtimeCaching`: `urlPattern: /\/audio\/.+\.mp3$/`, `handler: 'CacheFirst'`,
  `options: { cacheName: AUDIO_CACHE_NAME, cacheableResponse: { statuses: [200] }, rangeRequests: true, plugins: [{
  requestWillFetch: stripRangeRequest, handlerWillRespond: toPartialResponse }] }`. `rangeRequests: true` (có sẵn trong
  generateSW, sinh `RangeRequestsPlugin`) cắt 206 khi **trúng cache**; `toPartialResponse` lo lần **trượt cache** đầu tiên.
- Hai hàm plugin **tự chứa** (không dùng biến ngoài, không import): workbox-build chép mã nguồn của hàm (`toString`) vào
  `sw.js`. Test gọi trực tiếp và gọi bản dựng lại từ `toString()` để chắc điều này.
- `AUDIO_CACHE_NAME = 'audio-cache'` ở `core/constants/audio.constants.ts` (adapter D4 và cấu hình dùng chung).
- `vite.config.ts`: `globPatterns: [...PRECACHE_BASE_PATTERNS, ...listPrecachedAudioPatterns(readJson('src/assets/content/
  audio-index.json')), ...(mode === 'e2e' ? [OFFLINE_FIXTURE_PATHS.audio] : [])]`, `runtimeCaching: [createAudioRuntimeCaching()]`.
  Giữ `navigateFallback`, `cleanupOutdatedCaches`, `registerType: 'prompt'`.
- Thay thế: **injectManifest** + `sw.ts` tự viết (import `workbox-precaching`, `workbox-routing`, `workbox-strategies`,
  `workbox-range-requests`) rõ ràng hơn nhưng phải khai báo 4 package làm dependency trực tiếp của `apps/web` (pnpm không cho
  import package bắc cầu) — proposal chốt không thêm dependency (CLAUDE.md §9), và phải viết lại phần prompt/skip-waiting của
  S1.4. generateSW đủ nhờ `rangeRequests` + plugin hàm.
- Hệ quả mong muốn: audio HSK đã phát khi online được lưu vào `audio-cache` (Scenario "Đã nghe hết audio thì là đã tải",
  docs/03-architecture.md §7); audio HSK chưa phát/chưa tải không có trên máy ("Mới cài app thì audio HSK chưa có trên máy").

### D4. Adapter bộ nhớ đệm: `core/services/audio-cache.service.ts`

```ts
export type AudioDownloadFailure = 'network' | 'storage-full';
export class AudioDownloadError extends Error { constructor(readonly reason: AudioDownloadFailure, options?: ErrorOptions) }
export interface AudioCache {
  /** Trong `paths`, file nào đang có ở bất kỳ cache nào (precache khớp bỏ query `__WB_REVISION__`). */
  listCachedPaths(paths: readonly string[]): Promise<ReadonlySet<string>>;
  /** fetch `/${path}` (không Range) rồi `put` vào AUDIO_CACHE_NAME. Lỗi → AudioDownloadError. */
  download(path: string): Promise<void>;
  /** Xóa khỏi AUDIO_CACHE_NAME; không bao giờ đụng precache. */
  remove(paths: readonly string[]): Promise<void>;
}
export class BrowserAudioCache implements AudioCache { constructor(private readonly storage: () => CacheStorage | undefined) }
export const audioCache: AudioCache = new BrowserAudioCache(() => globalThis.caches);
```

- `listCachedPaths`: một lần `caches.keys()` → mỗi cache `keys()` → tập `pathname` (bỏ `/` đầu, bỏ query) → giao với `paths`.
  Không có `caches` (dev không bảo mật, jsdom) → tập rỗng.
- `download`: `fetch` reject, `!response.ok`, đọc body lỗi → `'network'`; `put` ném `DOMException` tên `QuotaExceededError`
  → `'storage-full'`; lỗi `put` khác → `'network'`. Không có `caches` → `'network'`.
- Trang đang được service worker điều khiển thì `fetch` đi qua route D3 (SW cũng lưu); `put` lần hai ghi đè cùng nội dung, vô
  hại. Không dựa vào SW nên chạy được ở `web-dev` và Vitest.
- Test dùng giả lập `apps/web/src/test/cache-storage.fake.ts` (`FakeCacheStorage`, `FakeCache` trong bộ nhớ, có hook làm `put`
  ném lỗi) và `vi.spyOn(globalThis, 'fetch')` — chỉ mock ranh giới ngoài (spec-driven §5).

### D5. `ContentSource.getAudioIndex()`

`core/services/content-source.service.ts`: thêm `getAudioIndex(): Promise<AudioIndex>` = `load('/content/audio-index.json',
audioIndexSchema)`. Bảy object `ContentSource` viết tay trong test (Context) thêm stub `getAudioIndex` trong cùng commit
`test(...)` để typecheck sạch.

### D6. `OfflineAudioService` — `shared/services/offline-audio.service.ts` (3 phần)

Model `shared/models/offline-audio.model.ts`:

```ts
export type OfflineAudioMessageKind = 'needs-network' | 'download-incomplete' | 'storage-full' | 'removed';
export type OfflineAudioAnnouncementKind = 'download-started' | 'download-finished' | OfflineAudioMessageKind;
export type OfflineAudioTopic =
  | { status: 'available-offline' }
  | { status: 'downloading'; percent: number }
  | { status: 'not-downloaded'; bytes: number }
  | { status: 'downloaded'; bytes: number; canRemove: boolean };
export type OfflineAudioTopicView = OfflineAudioTopic & { message: OfflineAudioMessageKind | null };
export interface OfflineAudioMessage { kind: OfflineAudioMessageKind; shownWith: OfflineAudioTopic['status'] }
export interface OfflineAudioAnnouncement { id: number; kind: OfflineAudioAnnouncementKind; unitTitle: string }
export interface OfflineAudioSnapshot {
  index: AudioIndex | null;
  cachedPaths: ReadonlySet<string>;
  downloadingUnitIds: ReadonlySet<string>;
  messages: ReadonlyMap<string, OfflineAudioMessage>;
  announcements: readonly OfflineAudioAnnouncement[];
}
export interface OfflineAudioUnit { id: string; title: string }
```

`constructor(private readonly cache: AudioCache = audioCache, private readonly source: ContentSource = contentSource)`.
Snapshot là object bất biến; mỗi thay đổi tạo object mới rồi gọi listener (yêu cầu của `useSyncExternalStore`).

**Phần 1 — truy cập dữ liệu (private):** `readAudioIndex()` (nạp một lần, giữ promise), `readCachedPaths(paths)`,
`downloadFile(path)` (khử trùng file đang tải: `inFlight: Map<path, Promise<void>>`, hai chủ đề cần cùng file thì chờ chung
một lượt), `removeFiles(paths)`, `readSnapshot()`, `writeSnapshot(next)` (đặt snapshot + báo listener).

**Phần 2 — quy tắc (public, thuần, mỗi method một `Rule:`):**

- `isAvailableOffline(stageId, unitAudio, precached)` — Rule: thuộc stage `INTRO_STAGE_ID` hoặc mọi audio là audio Nhập môn.
- `deriveTopic(stageId, unitId, snapshot): OfflineAudioTopic | null` — Rule (bảng trạng thái, dòng đầu khớp thì dừng): không
  có audio → `null`; có sẵn offline; đang tải **và còn thiếu file** → `downloading` (đủ file thì rơi xuống `downloaded`, không
  bao giờ "Đang tải 100%"); thiếu file → `not-downloaded`; còn lại `downloaded` với `canRemove`.
- `sumBytes(paths, bytes)` — Rule: dung lượng = tổng byte các audio (không trùng) của chủ đề.
- `listMissingAudio(unitAudio, cachedPaths)` — Rule: chỉ tải file chưa có trên máy.
- `selectRemovableAudio(unitId, index, downloadingUnitIds)` — Rule (bảng xóa): audio của chủ đề trừ `precached`, trừ audio của
  mọi chủ đề đang tải; audio dùng chung với chủ đề "Đã tải" khác **vẫn bị xóa**.
- `canRemove(...)` — Rule: có ít nhất một file xóa được.
- `pruneStaleMessages(messages, topicsNow)` — Rule: thông báo mất khi trạng thái chủ đề khác `shownWith`.
- `appendAnnouncement(list, item)` — Rule: câu mới nối sau, không thay câu cũ; giữ tối đa `MAX_ANNOUNCEMENTS = 5` câu gần nhất
  (bỏ câu cũ nhất), `id` tăng dần để câu trùng chữ vẫn là phần tử mới.
- `deriveTopics(stages, snapshot): ReadonlyMap<string, OfflineAudioTopicView>` — gom `deriveTopic` + thông báo còn hiệu lực.
- `toDownloadPercent`: util thuần D7, `deriveTopic` gọi để ra `percent`. `formatAudioSize` **không** do service gọi: model giữ
  `bytes: number`, component `OfflineAudioBlock` gọi `formatAudioSize` (D9) — chữ hiển thị là việc của UI, có tiền lệ component
  import `shared/utils` (`LessonSummary.tsx`, `StrokeGlyph.tsx`).

**Phần 3 — use case (public):**

- `subscribe(listener): () => void`, `getSnapshot(): OfflineAudioSnapshot` — arrow property để tham chiếu ổn định.
- `refresh(): Promise<void>` — nạp index (lỗi → throw `Error('Không tải được danh sách audio.')`, hook nuốt: bản đồ không có
  khối), đọc `cachedPaths` cho mọi audio trong index. Path tải xong/xóa **trong lúc** đọc được gộp lại sau khi đọc (không làm
  lùi tiến độ đang chạy). Rồi `pruneStaleMessages`.
- `startDownload(unit, isOnline): Promise<void>` — không reject (lỗi thành thông báo):
  1. `unit.id` đã có trong `downloadingUnitIds` → return ngay (không mở vòng lặp thứ hai, không thêm câu đọc lần nữa);
  2. bỏ thông báo của `unit.id` (bấm nút kế tiếp);
  3. `!isOnline` → thông báo `needs-network` (`shownWith: 'not-downloaded'`) + câu đọc, dừng;
  4. thêm vào `downloadingUnitIds` + câu `download-started`;
  5. lần lượt từng file thiếu (tuần tự trong một chủ đề — tiến độ đi từng bước, e2e điều khiển được thứ tự): đã có trên máy
     (chủ đề khác vừa tải) thì bỏ qua; `downloadFile`; thêm vào `cachedPaths`, ghi snapshot;
  6. xong: bỏ khỏi `downloadingUnitIds` **trong cùng lần ghi** với file cuối + câu `download-finished`;
  7. `AudioDownloadError` → bỏ khỏi `downloadingUnitIds`, thông báo `download-incomplete` / `storage-full`
     (`shownWith: 'not-downloaded'`) + câu đọc cùng chữ; file đã tải giữ nguyên.
  Sau mỗi lần ghi: `pruneStaleMessages`. Các chủ đề tải song song, mỗi chủ đề một vòng lặp.
- `removeAudio(unit): Promise<void>` — bỏ thông báo của chủ đề; `selectRemovableAudio`; `removeFiles`; bỏ khỏi `cachedPaths`;
  thông báo `removed` + câu đọc. Adapter lỗi khi xóa (không có trong spec) → đọc lại `cachedPaths` từ cache, không thông báo.
- Không có hủy tải (out of scope). Đóng app giữa chừng: `downloadingUnitIds` chỉ trong bộ nhớ nên mở lại là "Chưa tải".

**Singleton**: `export const offlineAudioService = new OfflineAudioService();` cuối file — instance duy nhất toàn app, sống ngoài
cây React nên rời màn Lộ trình không dừng việc tải (Scenario "Rời màn…", "Quay lại màn…"). Thông báo cũng nằm trong snapshot,
nên còn khi quay lại màn (Requirement "Thông báo nằm trong khối của chủ đề").

- Thay thế: (a) provider ở `shared/contexts/` giữ state + vòng lặp tải → flow nghiệp vụ nằm trong component, phải gắn provider
  ở `App.tsx`, test flow cần React; (b) state trong `useOfflineAudio` → mất khi màn unmount (dev-lead đã nêu).
- Ước lượng ~280 dòng. Vượt 300 thì tách vòng lặp tải (bước 4–7) thành method private nhỏ hơn và chuyển type sang model; không
  tách service.

### D7. Util `shared/utils/offline-audio.utils.ts`

- `formatAudioSize(bytes): string` — số nguyên, không float: `kb = max(1, ceil(bytes / 1024))`; `kb < 1024` → `"<kb> KB"`;
  ngược lại `tenths = floor((20 * bytes + 1_048_576) / 2_097_152)` (làm tròn nửa lên tới 0,1 MB) → `"<tenths/10>,<tenths%10>
  MB"`. Bảng kiểm: 300 → "1 KB", 870 400 → "850 KB", 1 047 552 → "1023 KB", 1 047 553 / 1 048 064 / 1 048 575 / 1 048 576 →
  "1,0 MB", 1 310 720 → "1,3 MB", 2 516 582 → "2,4 MB".
- `toDownloadPercent(done, total): number` — `floor(done * 100 / total)` (nguyên): 1/4 → 25, 1/3 → 33, 2/3 → 66, 3/4 → 75.
- "KB", "MB", dấu phẩy là định dạng tiếng Việt cố định (app chỉ có `vi`), không đi qua i18n.

### D8. Context + hook

- `shared/contexts/useOfflineAudioService.ts`: `OfflineAudioServiceContext = createContext<OfflineAudioService>(
  offlineAudioService)` + `useOfflineAudioService()`. Giá trị mặc định là singleton nên **không** cần gắn provider ở `App.tsx`;
  test bọc `<OfflineAudioServiceContext value={new OfflineAudioService(fakeCache, fakeSource)}>` để không rò state giữa test.
- `pages/learning-path/hooks/useOfflineAudio.ts`: `useOfflineAudio(stages: readonly Stage[] | undefined): { topics:
  ReadonlyMap<string, OfflineAudioTopicView>; announcements: readonly OfflineAudioAnnouncement[]; download: (unit) => void;
  remove: (unit) => void }`.
  - `snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot)`; `isOnline = useOnlineStatus()`.
  - Effect mount (deps `[service]`): `service.refresh().catch(() => { /* không nạp được danh sách audio: bản đồ không có khối */
    })` — mỗi lần mở bản đồ tính lại từ cache ("Mở lại app vẫn thấy đã tải", "Đã nghe hết audio thì là đã tải").
  - `topics = useMemo(() => stages ? service.deriveTopics(stages, snapshot) : EMPTY, …)`; `download` gọi
    `service.startDownload(unit, isOnline)`; `remove` gọi `service.removeAudio(unit)`. Hook không giữ state tải.

### D9. Giao diện bản đồ

- `LearningPathStage`: thay prop `placementTestUnitIds` bằng `renderUnitActions: (unit: Unit) => ReactNode`, render ngay sau
  `<h3>` (vẫn 4 props). `LearningPathContainer` cung cấp: `<OfflineAudioBlock>` (nếu có topic) **rồi** link "Kiểm tra vượt
  cấp" (giữ nguyên `className`) — đúng thứ tự Scenario "Khối audio nằm trên link kiểm tra vượt cấp".
- `pages/learning-path/components/OfflineAudioBlock.tsx` — props `{ unitTitle, topic: OfflineAudioTopicView, onDownload,
  onRemove }` (4; `topic` là view model union, flatten thì vượt 5 props). `<div className="offline-audio flex flex-col gap-xs">`:
  - `available-offline` → `<p>` "Audio có sẵn offline".
  - Chữ dung lượng ("2,4 MB", "850 KB") = `formatAudioSize(topic.bytes)` gọi ngay trong component (import
    `@shared/utils/offline-audio.utils`, hàm thuần, không service).
  - `not-downloaded` → `<button className="btn btn-secondary offline-audio-button" aria-label="Tải audio (2,4 MB), chủ đề
    Chào hỏi">` chữ "Tải audio (2,4 MB)" (tên bắt đầu bằng chữ nhìn thấy, WCAG 2.5.3).
  - `downloading` → `<p tabIndex={-1} className="offline-audio-status">` "Đang tải 25%" (không live, không thanh chạy).
  - `downloaded` → `<p tabIndex={-1}>` "Đã tải audio (2,4 MB)" + nếu `canRemove` nút "Xóa audio", `aria-label="Xóa audio, chủ
    đề Chào hỏi"`.
  - `message` → `<p className="offline-audio-message">` câu tương ứng (không `role`, vùng đọc là D10, tránh đọc hai lần).
  - **Focus** (Requirement "Focus không rơi…", "Focus khi chủ đề tự thành đã tải"). Nguyên tắc: **chỉ khối đang giữ focus
    ngay trước commit mới được chuyển focus**; khối khác không bao giờ kéo focus, dù đổi trạng thái trong cùng commit.
    - `ownedFocusRef: RefObject<HTMLElement | null>` = phần tử **trong khối này** đang giữ focus, `null` khi focus ở ngoài khối.
    - `onFocus` trên khối (React `focusin`, nổi bọt): `ownedFocusRef.current = event.target`.
    - `onBlur` trên khối: nếu `event.relatedTarget` là `Node` nằm trong khối → giữ (focus đi giữa phần tử của khối). Ngược lại,
      nếu `event.target.isConnected` (blur thường: Tab sang khối/bài khác, bấm chuột vào vùng không focus được, chuyển cửa
      sổ) → `ownedFocusRef.current = null`. `event.target` đã bị gỡ (trình duyệt nào bắn blur khi gỡ phần tử đang focus) →
      giữ ref, để layout effect xử lý. Chuyển cửa sổ rồi quay lại: trình duyệt focus lại phần tử cũ → `onFocus` ghi lại ref.
    - `useLayoutEffect` (deps `[topic.status, canRemove]`): chỉ xử lý khi `ownedFocusRef.current` khác `null` **và** đã bị gỡ
      khỏi DOM (`!isConnected`) **và** `document.activeElement` là `body`/`null`. Khi đó focus đích `resolveFocusTarget(topic)`:
      `downloading` → dòng tiến độ; `downloaded` → nút xóa, không có thì dòng "Đã tải audio"; `not-downloaded` → nút tải; rồi
      **reset** `ownedFocusRef.current = target` (hoặc `null` nếu không có đích). Không thỏa → không làm gì.
    - Vì sao không phụ thuộc thứ tự khối: ví dụ Scenario "Nút tải đang focus biến mất vì chủ đề tự thành đã tải" — Enter ở
      "Gia đình" (ref của "Gia đình" trỏ dòng "Đang tải …%"), Tab sang nút tải của C → blur của "Gia đình" có `relatedTarget`
      ngoài khối, phần tử còn trong DOM → ref của "Gia đình" về `null`. Khi file cuối về, cùng commit gỡ dòng tiến độ của
      "Gia đình" và nút tải của C: chỉ C có ref (nút tải đã gỡ) → focus nút "Xóa audio" của C; "Gia đình" bỏ qua dù layout
      effect của nó chạy trước hay sau C.
    - Một quy tắc phủ cả bảng focus: bấm tải, tải xong, lỗi, bấm xóa, tự thành đã tải, nút xóa tạm ẩn. Người học đã Tab/bấm
      chuột ra ngoài khối → ref `null` → không kéo (Scenario "Không kéo focus…"); rời màn → khối unmount, không làm gì.
      `resolveFocusTarget(topic)` là hàm thuần cùng file. Không timer, không subscription → không cần cleanup.
- `pages/learning-path/components/OfflineAudioAnnouncer.tsx` — props `{ announcements }`.

### D10. Vùng thông báo: một vùng, xếp hàng câu

- `OfflineAudioAnnouncer` render **luôn** (kể cả khi chưa nạp) trong `LearningPathContainer`: `<div role="status"
  aria-live="polite" aria-relevant="additions" aria-label="Thông báo audio offline" className="offline-audio-announcer">`, mỗi
  câu một `<p key={id}>`. Câu mới **nối thêm**, không thay câu cũ, nên trình đọc màn hình xếp hàng đọc từng phần tử thêm vào
  (Requirement "Mỗi câu thông báo được đọc đủ"); giữ 5 câu gần nhất (D6), không dùng timer.
- `.offline-audio-announcer { @apply sr-only; }` (BEM class, §6). Câu "Đang tải <n>%" không bao giờ vào vùng này.
- Thay thế: (a) một vùng chỉ chứa câu mới nhất → câu chủ đề sau thay câu trước khi chưa đọc xong (đúng lỗi spec cấm);
  (b) vùng riêng trong mỗi khối → nhiều live region trên một màn, VoiceOver đọc không ổn định, thông báo mất khi khối đổi
  trạng thái.

### D11. i18n, style

- `assets/i18n/vi/learning-path.json` thêm `offlineAudio`: `available` "Audio có sẵn offline", `download` "Tải audio
  ({{size}})", `downloadLabel` "Tải audio ({{size}}), chủ đề {{topic}}", `downloading` "Đang tải {{percent}}%", `downloaded`
  "Đã tải audio ({{size}})", `remove` "Xóa audio", `removeLabel` "Xóa audio, chủ đề {{topic}}", `message.needs-network` "Cần có
  mạng để tải audio.", `message.download-incomplete` "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.", `message.storage-full`
  "Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại.", `message.removed` "Đã xóa audio của chủ đề
  {{topic}}.", `announce.download-started` "Đang tải audio chủ đề {{topic}}.", `announce.download-finished` "Đã tải xong audio
  chủ đề {{topic}}.", `announcerLabel` "Thông báo audio offline". Câu lỗi/xóa của vùng đọc dùng chung key `message.*`.
- `styles/tailwind/components/_offline-audio.css` (import trong `main.css`): `.offline-audio`, `.offline-audio-status`
  (`:focus-visible` outline ≥ 3:1), `.offline-audio-message`, `.offline-audio-button` (vùng chạm ≥ 44×44 px),
  `.offline-audio-announcer`. Token semantic (tự đổi theo theme tối); không `transition`/`animation` (khối không chuyển động).

### D12. Nội dung mẫu và điều khiển mạng cho e2e

- `apps/web/e2e/fixtures/offlineAudioFixtures.ts`: dữ liệu chủ đề mẫu đúng `test-cases.md` (Điều kiện đầu chung): một stage
  `e2e-hsk` "HSK mẫu" sau Nhập môn (mọi nhóm khóa, nên nhóm có bài `test` cuối như "Chào hỏi" có link "Kiểm tra vượt cấp"), bài
  `e2e-*` dùng dạng `speak` + `sentenceId` (mỗi câu một audio, nút "Nghe mẫu"), câu mẫu với audio `audio/e2e0…<n>.mp3` (16 hex),
  mp3 im lặng (frame của `buildSilentMp3`, 417 byte/frame) đệm byte 0 tới **đúng** dung lượng test-cases cần. File nhỏ hơn
  417 byte (ví dụ "Chủ đề nhỏ" tổng 300 byte) **chỉ là byte đệm, không phát được**: chỉ dùng cho test nhãn dung lượng, không
  test nào phát audio của chủ đề đó; C và "Chủ đề dùng chung Nhập
  môn" dùng audio Nhập môn thật đọc từ `audio-index.json` thật. Biến thể `intro-empty` thêm nhóm "Nhập môn không audio" vào
  stage `intro`.
- Lúc build (`offlineFixturesPlugin`, `generateBundle`): emit bài `content/lessons/e2e-*.json` và mp3 mẫu (tên mới, không đè file
  thật; bài nằm trong precache vì là `.json`, mp3 mẫu **không** vì không có trong `precached`).
- Lúc preview: plugin mới `offlineAudioNetworkPlugin()` (`apply: (_, env) => env.isPreview === true`,
  `configurePreviewServer`), cùng file fixtures; `playwright.config.ts` đổi lệnh preview thành `vite preview --mode e2e`.
  Middleware theo cookie (service worker gửi kèm cookie cùng origin, nên điều khiển được cả request do SW gửi):
  - cookie `csk-e2e-fixture=offline-audio` (hoặc `offline-audio,intro-empty`) → trả `content.json`, `sentences.json`,
    `audio-index.json` đã gộp mẫu (đọc file thật trong `dist`). Không có cookie → file thật, e2e cũ không đổi. SW precache
    lần cài đầu lấy bản gộp (precache không kiểm nội dung theo revision).
  - cookie `csk-e2e-session=<uuid>` + API `POST /__e2e/audio-network` `{ delayMs?, failPaths?, holdPaths?, isOffline? }`,
    `POST /__e2e/audio-network/release` `{ path }`, `GET /__e2e/audio-network/log` → `{ served: string[] }`. Áp cho mọi
    `/audio/*`: chậm (`setTimeout` rồi `next()`), giữ tới khi thả, lỗi (503), offline (hủy socket), ghi log lượt phục vụ.
  - `GET /__e2e/fixture/offline-audio` đặt cookie fixture rồi chuyển về `/` (QA chạy tay dùng được).
- Helper `apps/web/e2e/E8/offline-audio.helpers.ts`: `useOfflineAudioFixture(context, variant)`, `setAudioNetwork(page,
  rules)`, `releaseAudio(page, path)`, `servedAudio(page)`, `goOffline(context, page)` (= `context.setOffline(true)` +
  `isOffline` của middleware, vì không dựa vào việc `setOffline` có chặn fetch của SW), `openOnceWithServiceWorker`,
  `offlineAudioBlock(page, title)`, `announcer(page)`, giả lập hết bộ nhớ bằng `page.addInitScript` vá `Cache.prototype.put`
  ném `QuotaExceededError` cho path chỉ định. Giới hạn: nếu trang có service worker điều khiển, route CacheFirst (D3) đã `put`
  file vào `audio-cache` trong SW **trước** khi `put` của trang ném lỗi, nên file thật vẫn còn trên máy (khác máy hết bộ nhớ
  thật). Vì vậy TC-S8.4-AC1-41, -42 chạy trong context `serviceWorkers: 'block'` (`fetch` của trang đi thẳng mạng, `put` đã
  vá là lần ghi cache duy nhất); hai TC này chỉ kiểm thông báo và nút tải, không cần SW. Kiểm thêm sau lỗi: path bị vá không
  có trong `audio-cache` (`caches.match` trong trang). "Đóng app giữa chừng": `chromium.launchPersistentContext(testInfo.outputPath(
  'profile'))` đóng rồi mở lại cùng thư mục.
- Thay thế: `page.route` + `serviceWorkers: 'block'` (mẫu S8.1) — không kiểm được offline/cache của SW; thêm stage mẫu thẳng
  vào `content.json` của bản build e2e — làm hỏng e2e S8.1/S3.1/S7.1 đang dựa vào lộ trình chỉ có Nhập môn.

### Kiểm tra `import` theo §2

| File | Import | Hợp lệ |
|---|---|---|
| `LearningPathContainer`, `OfflineAudioAnnouncer`, `LearningPathStage` | hooks cùng feature, model type, i18n | ✅ không chạm `shared/services` |
| `OfflineAudioBlock` | model type, i18n, `formatAudioSize` (`shared/utils/offline-audio.utils`) | ✅ component → `shared/utils` (leaf), không chạm service |
| `useOfflineAudio` | `useOfflineAudioService` (shared/contexts), `useOnlineStatus` (core/hooks), type service | ✅ hooks → contexts/services/core hooks |
| `shared/contexts/useOfflineAudioService` | `OfflineAudioService`, `offlineAudioService` | ✅ không phải nhánh ❌ |
| `OfflineAudioService` | `AudioCache`/`audioCache`, `ContentSource`/`contentSource`, `@csk/shared`, `toDownloadPercent` (`offline-audio.utils`), model | ✅ không React, không Dexie |
| `audio-cache.service` | `AUDIO_CACHE_NAME` (core/constants) | ✅ không gọi `shared/services` |
| `content-source.service` | `audioIndexSchema` | ✅ core → `@csk/shared` |
| `offline-audio.utils` | không gì | ✅ leaf |
| `core/modules/pwa/audio-caching.config` | `@csk/shared` (schema), `../../constants/audio.constants` (tương đối) | ✅ không React, không service |
| `vite.config.ts` | `audio-caching.config`, `e2e/fixtures/*` (đã có tiền lệ) | ✅ cấu hình build |

### Zod cho dữ liệu ngoài

| Dữ liệu | Schema | Nơi parse |
|---|---|---|
| `content/audio-index.json` (app) | `audioIndexSchema` (mới) | `FetchContentSource.getAudioIndex` |
| `audio-index.json` lúc build | `audioIndexSchema` | `listPrecachedAudioPatterns` (vite.config) |
| Lộ trình, bài, từ, câu | có sẵn | `FetchContentSource` |
| Cache Storage | không parse (chỉ đọc khóa URL, body là mp3 nhị phân) | `BrowserAudioCache` |
| `navigator.onLine` | boolean của trình duyệt | `useOnlineStatus` |

### Test (tầng theo spec-driven §4)

| Nội dung | Tầng | File |
|---|---|---|
| Schema danh sách audio | `packages/shared` | `packages/shared/src/audio-index.schema.test.ts` |
| Audio theo nhóm, precache Nhập môn, byte | pipeline | `content/scripts/content-build/audioIndex.test.ts`, `assemble.test.ts` |
| KB/MB, phần trăm | `shared/utils` | `apps/web/src/app/shared/utils/offline-audio.utils.test.ts` |
| Adapter cache | `core/services` | `apps/web/src/app/core/services/audio-cache.service.test.ts` |
| `getAudioIndex` | `core/services` | `apps/web/src/app/core/services/content-source.service.test.ts` |
| Quy tắc (Phần 2) | `shared/services` | `apps/web/src/app/shared/services/offline-audio.service.rules.test.ts` |
| Tải, lỗi, thông báo (Phần 3) | `shared/services` + adapter giả | `offline-audio.service.download.test.ts` |
| Xóa, mở lại (Phần 3) | `shared/services` + adapter giả | `offline-audio.service.remove.test.ts` |
| Precache list, Range | `core/modules/pwa` | `apps/web/src/app/core/modules/pwa/audio-caching.config.test.ts` |
| Khối trên bản đồ, nhãn, thông báo, rời màn | container (route thật) | `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.offlineAudio.test.tsx`, `LearningPathContainer.offlineAudioFlow.test.tsx` |
| Focus, tên nút, vùng đọc | component + container | `apps/web/src/app/pages/learning-path/components/OfflineAudioBlock.test.tsx`, `LearningPathContainer.offlineAudioA11y.test.tsx` |
| Luồng thật, SW, offline, mạng chậm/lỗi | e2e | `apps/web/e2e/E8/s8.4-offline-audio-*.spec.ts` |

Adapter giả cho Phần 3 và container: `apps/web/src/test/offline-audio.fakes.ts` — `FakeAudioCache` (tập path trong bộ nhớ,
`download` trả promise điều khiển được: `resolveNext(path)`, `fail(path, reason)`) và `fakeContentSourceWithIndex(index)`.

## Risks / Trade-offs

- [Safari iOS không phát audio do SW trả mà thiếu 206] → `rangeRequests` cho lần trúng cache, `toPartialResponse` cho lần trượt;
  kiểm tay TC-S8.4-AC1-18, -52 trên máy thật. Audio Nhập môn trong precache vẫn đi route precache (200) như S1.2 — không đổi
  hành vi cũ; nếu QA thấy lỗi trên iOS thì mở story riêng.
- [Hàm plugin bị workbox-build chép mã nguồn, dùng biến ngoài sẽ hỏng trong `sw.js`] → test dựng lại hàm từ `toString()`;
  e2e offline phát audio xác nhận trên bản build.
- [`vite.config.ts` import `@csk/shared` (TS trong workspace) khi Vite nạp config] → kiểm bằng `pnpm --filter @csk/web build`
  ở GREEN 7.2; nếu Vite không nạp được entry `@csk/shared` thì `audio-caching.config.ts` import tương đối thẳng file
  `packages/shared/src/audio-index.schema.ts` (một nguồn schema duy nhất, không chép lại ràng buộc).
- [Cập nhật app: precache cũ chứa 503 mp3 bị `cleanupOutdatedCaches` dọn] → người dùng cũ mất audio từ không dùng (vô hại) và
  giữ audio Nhập môn qua precache mới. Audio HSK chưa có nên không ai mất audio đã tải.
- [`navigator.onLine` = true nhưng thực tế mất mạng] → `fetch` lỗi → "Tải chưa xong…" thay vì "Cần có mạng…". Chấp nhận.
- [Hai chủ đề chờ chung một file mà file đó lỗi] → cả hai dừng với thông báo riêng của mình; bấm lại thì tải lại. Chấp nhận.
- [Trình duyệt tự xóa Cache Storage khi thiếu chỗ] → trạng thái tính lại từ cache mỗi lần mở bản đồ, chủ đề về "Chưa tải".
- [Snapshot singleton rò giữa các test] → test luôn tạo `OfflineAudioService` mới qua context (D8).
- [Middleware e2e dùng chung một server cho test song song] → mọi luật theo cookie phiên; test không có cookie không bị ảnh hưởng.

## Migration Plan

- Không đổi IndexedDB. Bản deploy mới: SW mới precache ít hơn; `audio-cache` tạo khi có lần phát/tải đầu.
- Rollback: revert PR. `audio-cache` còn lại trong trình duyệt (vô hại; bản cũ precache lại mọi mp3).

## Open Questions

- [x] Xóa mà adapter lỗi (spec không nêu) → đọc lại trạng thái từ cache, không thêm câu thông báo (D6).
- [x] Câu chữ chưa có trong spec: nhãn vùng đọc "Thông báo audio offline" (D11). Đổi sau chỉ sửa i18n và chuỗi kỳ vọng trong test.
