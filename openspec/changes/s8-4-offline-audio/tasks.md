# Tasks: S8.4 Tải audio offline theo chủ đề

TDD bắt buộc (docs/05-standards/spec-driven.md §5): mỗi RED chạy test và thấy fail **vì thiếu hành vi** (không phải lỗi
import/gõ sai), commit `test(...)`; mỗi GREEN code tối thiểu đúng layer (design.md), test pass, commit `feat(...)`.
Tên test chứa Scenario ID và tên Scenario (`S8.4-AC1 Thiếu một phần audio thì là chưa tải …`); test e2e thêm ID TC.
Tên file, hàm, field, route: design D1–D12. RED nào pass ngay nhờ GREEN trước thì tạm đảo đúng nhánh code liên quan để thấy
fail, rồi trả lại (như S8.1). RED cần type/method chưa có thì tạo skeleton không có hành vi trong cùng commit `test(...)`
(typecheck sạch, test fail ở assertion).

Vitest: `pnpm --filter @csk/web test:run <mẫu>`, `pnpm --filter @csk/shared test:run <mẫu>`, `pnpm --filter @csk/content
test:run <mẫu>`. Adapter giả cho Phần 3 và container: `apps/web/src/test/offline-audio.fakes.ts` (tạo ở 6.1). Cache Storage
giả: `apps/web/src/test/cache-storage.fake.ts` (tạo ở 4.1).

## 1. Schema danh sách audio — `packages/shared` (design D1)

Test: `packages/shared/src/audio-index.schema.test.ts`.

- [x] 1.1 RED: S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (tầng schema) — `audioIndexSchema` nhận index hợp lệ (2 nhóm, 1 nhóm `[]`, `precached` ⊆ `bytes`); từ chối: byte âm / không nguyên / chuỗi, path không dạng `audio/<16 hex>.mp3`, path trong `units` hoặc `precached` thiếu trong `bytes`; `INTRO_STAGE_ID === 'intro'`. Skeleton trong commit test: `audioIndexSchema` lỏng (chỉ `z.object` không ràng buộc), `idSchema`/`audioPathSchema` export từ `content.schema.ts`; kiểm: fail ở các ca từ chối
- [x] 1.2 GREEN: ràng buộc đủ + `superRefine` path phải có byte; export `audioIndexSchema`, `AudioIndex`, `INTRO_STAGE_ID` qua `index.ts`; kiểm: test 1.1 pass, `content.schema.test.ts` cũ pass

## 2. Pipeline sinh `audio-index.json` — `content/scripts` (design D2)

Test: `content/scripts/content-build/audioIndex.test.ts` (hàm thuần), `content/scripts/content-build/assemble.test.ts` (ghép).

- [x] 2.1 RED: S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (pipeline) — `lessonAudioPaths`: tone-choice/pinyin-type → audio từ, sound-pair → hai audio, speak → audio từ hoặc câu, stroke-write → không; `buildAudioIndex`: audio các bài của nhóm, không trùng, theo thứ tự bài; `bytes` lấy từ `audioBytes`, file chưa có → 0; kiểm: fail vì skeleton trả index rỗng
- [x] 2.2 GREEN: `audioIndex.ts` (`lessonAudioPaths`, `buildAudioIndex`); kiểm: test 2.1 pass
- [x] 2.3 RED: S8.4-AC1 "Mới cài app thì audio HSK chưa có trên máy" (pipeline) — `precached` chỉ gồm audio các nhóm thuộc stage `INTRO_STAGE_ID`; audio HSK dùng chung với Nhập môn có một lần; audio chỉ thuộc HSK không có; đã sort; kiểm: chạy, nếu pass ngay thì tạm lấy audio mọi stage để thấy fail rồi trả lại
- [x] 2.4 GREEN: sửa đến khi pass; kiểm: test 2.3 pass
- [x] 2.5 RED: S8.4-AC1 "Chủ đề không có audio" (pipeline) — nhóm chỉ có bài stroke-write → `units[id]` là `[]` (giữ key); `assembleContent` có `files.get('audio-index.json')` parse được bằng `audioIndexSchema`; `contentVersion` không đổi so với trước khi thêm file; `BuildInputs.audioBytes` thêm vào fixture test có sẵn; kiểm: fail vì `files` chưa có `audio-index.json`
- [x] 2.6 GREEN: `BuildInputs.audioBytes` (`inputs.ts`, `statSync`), `assembleContent` thêm `audio-index.json`, `content-audio/index.ts` ghi lại `audio-index.json` sau khi tạo mp3; chạy `pnpm --filter @csk/content content:build`, commit `apps/web/src/assets/content/audio-index.json`; kiểm: test 2.5 pass, `pnpm content:check` sạch (output khớp nguồn)

## 3. Định dạng dung lượng và phần trăm — `shared/utils/offline-audio.utils.ts` (design D7)

Test: `apps/web/src/app/shared/utils/offline-audio.utils.test.ts` — hàm thuần, bảng.

- [x] 3.1 RED: S8.4-AC1 "Dung lượng dưới 1 MB hiện theo KB" — `formatAudioSize(870_400)` = "850 KB", `(1_047_552)` = "1023 KB"; kiểm: fail vì skeleton trả ""
- [x] 3.2 GREEN: nhánh KB (`ceil(bytes / 1024)`); kiểm: test 3.1 pass
- [x] 3.3 RED: S8.4-AC1 "Dung lượng rất nhỏ hiện tối thiểu 1 KB" — `300` → "1 KB", `1` → "1 KB", `0` → "1 KB"; kiểm: fail ở `0` (hoặc tạm bỏ `max(1, …)` nếu pass ngay)
- [x] 3.4 GREEN: tối thiểu 1 KB; kiểm: test 3.3 pass
- [x] 3.5 RED: S8.4-AC1 "Dung lượng sát 1 MB hiện 1,0 MB" — `1_047_553`, `1_048_064`, `1_048_575`, `1_048_576` → "1,0 MB" (không "1024 KB"); kiểm: fail
- [x] 3.6 GREEN: nhánh MB khi KB làm tròn lên đạt 1024; kiểm: test 3.5 pass
- [x] 3.7 RED: S8.4-AC1 "Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5" — `1_310_720` → "1,3 MB", `2_516_582` → "2,4 MB", dấu phẩy thập phân; kiểm: fail nếu làm tròn xuống/`toFixed` (tạm dùng `floor` nếu pass ngay rồi trả lại)
- [x] 3.8 GREEN: `floor((20 * bytes + 1_048_576) / 2_097_152)` số nguyên; kiểm: test 3.7 pass
- [x] 3.9 RED: S8.4-AC1 "Hiện tiến độ khi đang tải" (util) — `toDownloadPercent(1, 4)` = 25, `(3, 4)` = 75; kiểm: fail vì skeleton trả 0
- [x] 3.10 GREEN: `toDownloadPercent`; kiểm: test 3.9 pass
- [x] 3.11 RED: S8.4-AC1 "Tiến độ làm tròn xuống" (util) — `(1, 3)` = 33, `(2, 3)` = 66; kiểm: chạy, nếu pass ngay thì tạm dùng `Math.round` để thấy fail rồi trả lại
- [x] 3.12 GREEN: sửa đến khi pass; kiểm: test 3.11 pass

## 4. Hạ tầng cache và nguồn danh sách audio — `core/services` (design D4, D5)

Test: `apps/web/src/app/core/services/audio-cache.service.test.ts` (`FakeCacheStorage` + `vi.spyOn(globalThis, 'fetch')`),
`apps/web/src/app/core/services/content-source.service.test.ts`.

- [x] 4.1 RED: S8.4-AC1 "Bấm tải thì audio của chủ đề có trên máy" (adapter) — `download('audio/aaaa….mp3')` gọi `fetch('/audio/aaaa….mp3')` không header `Range`, `put` vào cache `AUDIO_CACHE_NAME`; `listCachedPaths([...])` trả path đó, không trả path khác. Commit test tạo `src/test/cache-storage.fake.ts`, `AUDIO_CACHE_NAME = 'audio-cache'` (`core/constants/audio.constants.ts`), skeleton `BrowserAudioCache` (không làm gì, trả tập rỗng); kiểm: fail ở assertion
- [x] 4.2 GREEN: `BrowserAudioCache.download`, `listCachedPaths` (một lần `caches.keys()`, so `pathname`); kiểm: test 4.1 pass
- [x] 4.3 RED: S8.4-AC2 "Xóa không làm mất audio Nhập môn" (adapter) — cache precache có khóa `/audio/bbbb….mp3?__WB_REVISION__=abc` → `listCachedPaths` có `audio/bbbb….mp3`; `remove(['audio/bbbb….mp3', 'audio/aaaa….mp3'])` chỉ xóa trong `audio-cache`, khóa precache còn nguyên; kiểm: fail (query chưa bỏ / xóa nhầm precache)
- [x] 4.4 GREEN: bỏ query khi so, `remove` chỉ mở `AUDIO_CACHE_NAME`; kiểm: test 4.3 pass
- [x] 4.5 RED: S8.4-AC1 "Mất mạng khi đang tải" (adapter) — `fetch` reject `TypeError` / trả 503 / body lỗi → `AudioDownloadError` `reason: 'network'`, cache không có file; kiểm: fail
- [x] 4.6 GREEN: phân loại lỗi mạng; kiểm: test 4.5 pass
- [x] 4.7 RED: S8.4-AC1 "Không đủ bộ nhớ" (adapter) — `FakeCache.put` ném `new DOMException('…', 'QuotaExceededError')` → `reason: 'storage-full'`; lỗi `put` khác → `'network'`; kiểm: fail
- [x] 4.8 GREEN: nhận `QuotaExceededError`; kiểm: test 4.7 pass
- [x] 4.9 RED: S8.4-AC1 "Mở lại app vẫn thấy đã tải" (adapter) — adapter mới trên cùng `FakeCacheStorage` thấy file đã tải; `storage()` trả `undefined` → `listCachedPaths` tập rỗng, `download` ném `'network'`; kiểm: chạy, nếu pass ngay thì tạm giữ tập path trong bộ nhớ instance để thấy fail rồi trả lại
- [x] 4.10 GREEN: sửa đến khi pass; kiểm: test 4.9 pass
- [x] 4.11 RED: S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (nguồn nội dung) — `FetchContentSource.getAudioIndex()` đọc `/content/audio-index.json`, trả dữ liệu đã parse; JSON sai schema → throw "Nội dung không hợp lệ"; skeleton `getAudioIndex` trong interface + stub `getAudioIndex: vi.fn(…)` vào mọi `ContentSource` viết tay (`content.service.test.ts` `makeSource`; `stroke-order.service.test.ts` dòng 17, 109, 149, 167, 184, 201; rà `grep -rn ': ContentSource' apps/web/src`); kiểm: `pnpm typecheck` sạch, fail ở assertion
- [x] 4.12 GREEN: `getAudioIndex` = `load(…, audioIndexSchema)`; kiểm: test 4.11 pass

## 5. Quy tắc — `OfflineAudioService` Phần 2 (design D6)

Test: `apps/web/src/app/shared/services/offline-audio.service.rules.test.ts` — hàm thuần trên snapshot dựng tay, không adapter.
Skeleton service + model `shared/models/offline-audio.model.ts` tạo trong commit 5.1.

- [x] 5.1 RED: S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (Phần 2) — nhóm HSK 4 audio, không có trên máy → `{ status: 'not-downloaded', bytes: 2_516_582 }`; audio trùng tính một lần; kiểm: fail vì skeleton trả `null`
- [x] 5.2 GREEN: `deriveTopic` (nhánh chưa tải), `sumBytes`; kiểm: test 5.1 pass
- [x] 5.3 RED: S8.4-AC1 "Thiếu một phần audio thì là chưa tải" — 3/4 có trên máy → `not-downloaded`; kiểm: chạy, nếu pass ngay thì tạm coi "có ≥ 1 file" là đã tải để thấy fail rồi trả lại
- [x] 5.4 GREEN: `listMissingAudio`; kiểm: test 5.3 pass
- [x] 5.5 RED: S8.4-AC1 "Đã tải thì hiện dung lượng và nút xóa" — đủ 4/4, có audio không phải Nhập môn, không chủ đề nào tải → `{ status: 'downloaded', bytes, canRemove: true }`; kiểm: fail
- [x] 5.6 GREEN: nhánh đã tải, `selectRemovableAudio`, `canRemove`; kiểm: test 5.5 pass
- [x] 5.7 RED: S8.4-AC1 "Đã nghe hết audio thì là đã tải" (Phần 2) — đủ file trong đó một file là audio Nhập môn (precache), chưa từng tải → `downloaded`, `canRemove: true`; kiểm: chạy, nếu pass ngay thì tạm bỏ file precache khỏi tập "có trên máy" để thấy fail rồi trả lại
- [x] 5.8 GREEN: sửa đến khi pass; kiểm: test 5.7 pass
- [x] 5.9 RED: S8.4-AC1 "Chủ đề Nhập môn có sẵn offline" (Phần 2) — nhóm thuộc stage `intro` có audio, cache rỗng → `available-offline`; kiểm: fail
- [x] 5.10 GREEN: `isAvailableOffline` (nhánh stage), xét trước các trạng thái khác; kiểm: test 5.9 pass
- [x] 5.11 RED: S8.4-AC1 "Chủ đề HSK chỉ dùng audio Nhập môn" — nhóm HSK mọi audio ∈ `precached` → `available-offline`; kiểm: fail
- [x] 5.12 GREEN: nhánh "mọi audio là audio Nhập môn"; kiểm: test 5.11 pass
- [x] 5.13 RED: S8.4-AC1 "Chủ đề không có audio" (Phần 2) — `units[id] = []` hoặc không có key → `null`, `deriveTopics` không có key; kiểm: chạy, nếu pass ngay thì tạm trả `not-downloaded` 0 byte để thấy fail rồi trả lại
- [x] 5.14 GREEN: sửa đến khi pass; kiểm: test 5.13 pass
- [x] 5.15 RED: S8.4-AC1 "Chủ đề Nhập môn không có audio thì không có khối" (Phần 2) — nhóm stage `intro`, `[]` → `null` (không `available-offline`); kiểm: fail nếu xét Nhập môn trước (tạm đảo thứ tự nếu pass ngay)
- [x] 5.16 GREEN: luật "không có audio" xét đầu tiên; kiểm: test 5.15 pass
- [x] 5.17 RED: S8.4-AC1 "Hiện tiến độ khi đang tải" (Phần 2) — đang tải, 1/4 có → `{ status: 'downloading', percent: 25 }`; kiểm: fail
- [x] 5.18 GREEN: nhánh đang tải dùng `toDownloadPercent`; kiểm: test 5.17 pass
- [x] 5.19 RED: S8.4-AC1 "Tiến độ tính cả file đã có từ trước" (Phần 2) — đang tải, 3/4 → 75; đang tải mà đủ 4/4 → `downloaded` (không `percent: 100`); kiểm: fail ở ca đủ file (tạm bỏ điều kiện "còn thiếu" nếu pass ngay)
- [x] 5.20 GREEN: đang tải chỉ khi còn file thiếu; kiểm: test 5.19 pass
- [x] 5.21 RED: S8.4-AC2 "Chủ đề dùng chung audio vòng tròn vẫn xóa được" (Phần 2) — A={x,y}, B={y,z}, C={x,z} đủ file, không ai tải → cả ba `canRemove: true`; `selectRemovableAudio(A)` = {x,y}; kiểm: chạy, nếu pass ngay thì tạm loại audio dùng chung với chủ đề "Đã tải" để thấy fail rồi trả lại
- [x] 5.22 GREEN: sửa đến khi pass; kiểm: test 5.21 pass
- [x] 5.23 RED: S8.4-AC2 "Hai chủ đề cùng bộ audio vẫn xóa được" (Phần 2) — A, B cùng bộ, đủ file → cả hai `canRemove: true`, xóa A chọn mọi file; kiểm: như 5.21
- [x] 5.24 GREEN: sửa đến khi pass; kiểm: test 5.23 pass
- [x] 5.25 RED: S8.4-AC2 "Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải" (Phần 2) — A ⊆ B, A có audio không phải Nhập môn, không ai tải → A `canRemove: true`; kiểm: như 5.21
- [x] 5.26 GREEN: sửa đến khi pass; kiểm: test 5.25 pass
- [x] 5.27 RED: S8.4-AC2 "Audio đang được chủ đề khác tải thì tạm chưa có nút xóa" (Phần 2) — A ⊆ `precached` ∪ audio(C), C đang tải → A `canRemove: false`; C hết tải → `true`; kiểm: fail
- [x] 5.28 GREEN: `selectRemovableAudio` trừ audio của chủ đề đang tải; kiểm: test 5.27 pass
- [x] 5.29 RED: S8.4-AC2 "Xóa không làm mất audio Nhập môn" (Phần 2) — `selectRemovableAudio` không có path ∈ `precached`; kiểm: fail (tạm bỏ phép trừ nếu pass ngay)
- [x] 5.30 GREEN: trừ `precached`; kiểm: test 5.29 pass
- [x] 5.31 RED: S8.4-AC2 "Xóa không làm hỏng chủ đề khác đang tải" (Phần 2) — B đã tải, A đang tải, chung file s → xóa B không chọn s; kiểm: chạy, nếu pass ngay nhờ 5.28 thì tạm bỏ phép trừ để thấy fail rồi trả lại
- [x] 5.32 GREEN: sửa đến khi pass; kiểm: test 5.31 pass
- [x] 5.33 RED: S8.4-AC2 "Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải" (Phần 2) — A, B đã tải chung file s, không ai tải → xóa A chọn s; sau khi bỏ s khỏi tập có trên máy B là `not-downloaded`; kiểm: như 5.21
- [x] 5.34 GREEN: sửa đến khi pass; kiểm: test 5.33 pass
- [x] 5.35 RED: S8.4-AC1 "Thông báo mất khi trạng thái đổi mà không bấm gì" (Phần 2) — `pruneStaleMessages`: thông báo `shownWith: 'not-downloaded'` của A, A giờ `downloaded` → bỏ; A vẫn `not-downloaded` → giữ; thông báo của B không đổi; kiểm: fail vì skeleton giữ nguyên
- [x] 5.36 GREEN: `pruneStaleMessages`, `deriveTopics` gắn `message`; kiểm: test 5.35 pass
- [x] 5.37 RED: S8.4-AC1 "Hai chủ đề báo cùng lúc thì đọc đủ cả hai" (Phần 2) — `appendAnnouncement` giữ câu trước, câu sau `id` lớn hơn, câu trùng chữ vẫn thêm phần tử mới, quá `MAX_ANNOUNCEMENTS` (5) bỏ câu cũ nhất; kiểm: fail vì skeleton thay cả danh sách
- [x] 5.38 GREEN: `appendAnnouncement`; kiểm: test 5.37 pass, mọi rule có comment `Rule:`

## 6. Use case — `OfflineAudioService` Phần 1 + 3 (design D6)

Test: `apps/web/src/app/shared/services/offline-audio.service.download.test.ts`, `offline-audio.service.remove.test.ts` —
`new OfflineAudioService(new FakeAudioCache(…), fakeContentSourceWithIndex(index))`; ghi lại mọi snapshot qua `subscribe`.

- [x] 6.1 RED: S8.4-AC1 "Bấm tải thì audio của chủ đề có trên máy" (Phần 3) — `refresh()`, `startDownload(chaoHoi, true)`, thả lần lượt 4 file → snapshot cuối: chủ đề `downloaded`; vùng đọc có `download-started` rồi `download-finished` với tên chủ đề. Commit test tạo `src/test/offline-audio.fakes.ts`; kiểm: fail vì skeleton không tải
- [x] 6.2 GREEN: Phần 1 (`readAudioIndex`, `readCachedPaths`, `downloadFile`, `readSnapshot`/`writeSnapshot`), `subscribe`/`getSnapshot`, `refresh`, `startDownload` (bước 2, 4–6); singleton `offlineAudioService`; kiểm: test 6.1 pass
- [x] 6.3 RED: S8.4-AC1 "Hiện tiến độ khi đang tải" (Phần 3) — sau file 1: `downloading` 25; không snapshot nào có `percent: 100`; file cuối và hết "đang tải" cùng một snapshot; kiểm: fail nếu bỏ "đang tải" ở lần ghi riêng (tạm tách nếu pass ngay rồi trả lại)
- [x] 6.4 GREEN: sửa đến khi pass; kiểm: test 6.3 pass
- [x] 6.5 RED: S8.4-AC1 "Tải lại chỉ tải phần còn thiếu" (Phần 3) — 2/4 đã có → `FakeAudioCache.download` được gọi đúng 2 lần với 2 path thiếu; snapshot đầu tiên sau bấm là 50; kiểm: chạy, nếu pass ngay thì tạm tải mọi file để thấy fail rồi trả lại
- [x] 6.6 GREEN: sửa đến khi pass; kiểm: test 6.5 pass
- [x] 6.7 RED: S8.4-AC1 "Tải hai chủ đề cùng lúc" (Phần 3) — A rồi B đang tải song song, mỗi chủ đề `percent` riêng; file dùng chung chỉ `download` một lần (`inFlight`); cả hai xong `downloaded`; gọi `startDownload(A, true)` lần hai khi A đang tải → return ngay: mỗi file của A vẫn chỉ `download` một lần, `announcements` chỉ có một câu `download-started` của A; kiểm: fail (gọi hai lần)
- [x] 6.8 GREEN: `inFlight` trong `downloadFile`, bỏ qua file đã có, bước 1 (chủ đề đã đang tải thì return sớm); kiểm: test 6.7 pass
- [x] 6.9 RED: S8.4-AC1 "Bấm tải khi không có mạng" (Phần 3) — `startDownload(unit, false)` → không gọi `download`, thông báo `needs-network`, câu đọc `needs-network`, chủ đề vẫn `not-downloaded`; kiểm: fail
- [x] 6.10 GREEN: bước 3; kiểm: test 6.9 pass
- [x] 6.11 RED: S8.4-AC1 "Mất mạng khi đang tải" (Phần 3) — 4 file, xong 2, file 3 `fail('network')` → hết đang tải, thông báo + câu đọc `download-incomplete`, 2 file vẫn trong cache, chủ đề `not-downloaded`; `startDownload` không reject; kiểm: fail
- [x] 6.12 GREEN: bước 7 (nhánh `network`); kiểm: test 6.11 pass
- [x] 6.13 RED: S8.4-AC1 "Không đủ bộ nhớ" (Phần 3) — `fail('storage-full')` → thông báo + câu đọc `storage-full`; kiểm: fail
- [x] 6.14 GREEN: bước 7 (nhánh `storage-full`); kiểm: test 6.13 pass
- [x] 6.15 RED: S8.4-AC1 "Thông báo mất khi bấm nút kế tiếp" (Phần 3) — A có `download-incomplete`, `startDownload(A, true)` → snapshot ngay sau đó không còn thông báo của A, A `downloading`; kiểm: fail
- [x] 6.16 GREEN: bước 2; kiểm: test 6.15 pass
- [x] 6.17 RED: S8.4-AC1 "Thông báo của mỗi chủ đề độc lập" (Phần 3) — A `needs-network`, `removeAudio(B)` → thông báo A còn, B có `removed` (skeleton `removeAudio` no-op); kiểm: fail ở B
- [x] 6.18 GREEN: `removeAudio` (Phần 1 `removeFiles`, thông báo + câu đọc `removed`); kiểm: test 6.17 pass
- [x] 6.19 RED: S8.4-AC1 "Thông báo mất khi trạng thái đổi mà không bấm gì" (Phần 3) — A lỗi khi còn thiếu file s (s cũng thuộc B), tải B xong → A `downloaded`, không còn thông báo của A; kiểm: chạy, nếu pass ngay thì tạm bỏ gọi `pruneStaleMessages` sau ghi để thấy fail rồi trả lại
- [x] 6.20 GREEN: gọi `pruneStaleMessages` sau mỗi lần ghi; kiểm: test 6.19 pass
- [x] 6.21 RED: S8.4-AC2 "Xóa audio đã tải" (Phần 3) — chủ đề đã tải, `removeAudio` → `FakeAudioCache.remove` nhận đúng tập xóa được, chủ đề `not-downloaded`, thông báo + câu đọc `removed`; kiểm: chạy, nếu pass ngay thì tạm xóa cả audio Nhập môn để thấy fail ở 6.25 rồi trả lại
- [x] 6.22 GREEN: sửa đến khi pass; kiểm: test 6.21 pass
- [x] 6.23 RED: S8.4-AC2 "Xóa không làm hỏng chủ đề khác đang tải" (Phần 3) — B đã tải, A đang tải đã có file chung s, `removeAudio(B)` giữa chừng → s còn trong cache, A tải xong `downloaded`, tiến độ A không lùi; kiểm: chạy, nếu pass ngay thì tạm truyền `downloadingUnitIds` rỗng cho `selectRemovableAudio` để thấy fail rồi trả lại
- [x] 6.24 GREEN: sửa đến khi pass; kiểm: test 6.23 pass
- [x] 6.25 RED: S8.4-AC2 "Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải" (Phần 3) — A, B đã tải chung s, `removeAudio(A)` → B `not-downloaded`, B không có thông báo, file chỉ thuộc B còn trong cache; kiểm: như 6.21
- [x] 6.26 GREEN: sửa đến khi pass; kiểm: test 6.25 pass
- [x] 6.27 RED: S8.4-AC2 "Tải lại sau khi xóa" (Phần 3) — xóa rồi `startDownload` → `downloaded`, thông báo `removed` mất; kiểm: chạy, nếu pass ngay thì tạm giữ `cachedPaths` cũ sau xóa để thấy fail rồi trả lại
- [x] 6.28 GREEN: sửa đến khi pass; kiểm: test 6.27 pass
- [x] 6.29 RED: S8.4-AC1 "Quay lại màn khi việc tải còn đang chạy" (Phần 3) — bỏ mọi listener giữa chừng, thả 2/4 file, `getSnapshot` → 50; gọi `refresh()` trong lúc tải (cache giả đọc chậm hơn một lượt `download`) → không lùi dưới 50; kiểm: fail ở `refresh` (ghi đè tập đọc được)
- [x] 6.30 GREEN: `refresh` gộp path tải/xóa trong lúc đọc; kiểm: test 6.29 pass
- [x] 6.31 RED: S8.4-AC1 "Mở lại app vẫn thấy đã tải" (Phần 3) — tải xong bằng service 1; service 2 mới trên cùng `FakeAudioCache` → `refresh` → `downloaded`; kiểm: chạy, nếu pass ngay thì tạm bỏ đọc cache trong `refresh` để thấy fail rồi trả lại
- [x] 6.32 GREEN: sửa đến khi pass; kiểm: test 6.31 pass
- [x] 6.33 RED: S8.4-AC1 "Đóng app giữa chừng" (Phần 3) — service 1 tải 2/4 rồi bỏ; service 2 mới → `not-downloaded` (không `downloading`), 2 file vẫn trong cache; kiểm: như 6.31
- [x] 6.34 GREEN: sửa đến khi pass; kiểm: test 6.33 pass, `offline-audio.service.ts` < 300 dòng, đủ 3 banner theo CLAUDE.md §3

## 7. Service worker: precache Nhập môn, audio cache-first có Range — `core/modules/pwa` + `vite.config.ts` (design D3)

Test: `apps/web/src/app/core/modules/pwa/audio-caching.config.test.ts` (hàm thuần; `Request`/`Response` của môi trường test).

- [x] 7.1 RED: S8.4-AC1 "Mới cài app thì audio HSK chưa có trên máy" (tầng cấu hình) — `PRECACHE_BASE_PATTERNS` không khớp `mp3`; `listPrecachedAudioPatterns(index)` = đúng `index.precached`; JSON sai → throw; kiểm: fail vì skeleton trả `[]`/còn `mp3`
- [x] 7.2 GREEN: `audio-caching.config.ts` + `vite.config.ts` dùng (`globPatterns` = gốc + audio Nhập môn + `OFFLINE_FIXTURE_PATHS.audio` khi `mode === 'e2e'`); kiểm: test 7.1 pass, `pnpm --filter @csk/web build` thành công và `dist/sw.js` chứa một audio trong `precached`, không chứa một audio từ ngoài `precached` (grep)
- [x] 7.3 RED: S8.4-AC1 "Đã nghe hết audio thì là đã tải" (tầng cấu hình) — `stripRangeRequest({ request })` với `Range: bytes=0-` → request cùng URL, không `Range`; bản dựng lại từ `new Function(\`return (${fn.toString()})\`)()` cho cùng kết quả (hàm tự chứa); kiểm: fail
- [x] 7.4 GREEN: `stripRangeRequest`; kiểm: test 7.3 pass
- [x] 7.5 RED: S8.4-AC1 "Đã tải thì học offline vẫn nghe được" (tầng cấu hình) — `toPartialResponse`: 200 body 1000 byte + `Range: bytes=0-` → 206, `Content-Range: bytes 0-999/1000`; `bytes=100-199` → 100 byte; không `Range` hoặc response 206 → giữ nguyên; `Range` hỏng → giữ nguyên; bản dựng lại từ `toString()` cũng đúng; `createAudioRuntimeCaching()` có `CacheFirst`, `cacheName: 'audio-cache'`, `statuses: [200]`, `rangeRequests: true`, hai plugin; kiểm: fail
- [x] 7.6 GREEN: `toPartialResponse`, `createAudioRuntimeCaching`, `vite.config.ts` thêm `runtimeCaching`; kiểm: test 7.5 pass, build thành công, `dist/sw.js` có route `audio-cache`

## 8. Giao diện bản đồ — context, hook, component, container (design D8–D11)

Test: `apps/web/src/app/pages/learning-path/containers/LearningPathContainer.offlineAudio.test.tsx` (nhãn, trạng thái),
`LearningPathContainer.offlineAudioFlow.test.tsx` (tải/xóa/thông báo/rời màn, route thật), `LearningPathContainer.offlineAudioA11y.test.tsx`
(tên nút, vùng đọc, focus mức màn), `apps/web/src/app/pages/learning-path/components/OfflineAudioBlock.test.tsx` (focus). Render
container bọc `<OfflineAudioServiceContext value={new OfflineAudioService(fakeCache, fakeSource)}>`, `fetch` giả nội dung như
`LearningPathContainer.test.tsx` (lộ trình có nhóm Nhập môn + nhóm HSK "Chào hỏi" 4 file 2 516 582 byte).

- [x] 8.1 RED: S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (container) — dưới `<h3>` "Chào hỏi" có nút hiện chữ "Tải audio (2,4 MB)", không có "Đang tải", "Đã tải audio", "Xóa audio". Skeleton trong commit test: `shared/contexts/useOfflineAudioService.ts`, `useOfflineAudio` trả map rỗng; kiểm: fail vì không có nút
- [x] 8.2 GREEN: `useOfflineAudio` (snapshot, `refresh` lúc mount, `deriveTopics`), `OfflineAudioBlock` (nhánh chưa tải, chữ dung lượng = `formatAudioSize(topic.bytes)` gọi trong component), `LearningPathStage` đổi sang `renderUnitActions`, `LearningPathContainer` cung cấp khối + link vượt cấp, i18n `offlineAudio.*` (D11); kiểm: test 8.1 pass, `LearningPathContainer.test.tsx` và `.homeLink.test.tsx` cũ pass
- [x] 8.3 RED: S8.4-AC1 "Khối audio nằm trên link kiểm tra vượt cấp" (container) — nhóm khóa có bài `test`: thứ tự DOM `<h3>` → nút tải → link "Kiểm tra vượt cấp" (`compareDocumentPosition`); Tab tới nút tải trước link; kiểm: chạy, nếu pass ngay thì tạm render khối sau link để thấy fail rồi trả lại
- [x] 8.4 GREEN: sửa đến khi pass; kiểm: test 8.3 pass
- [x] 8.5 RED: S8.4-AC1 "Chủ đề Nhập môn có sẵn offline" (container) — nhóm Nhập môn có audio hiện "Audio có sẵn offline", không nút tải/xóa; kiểm: fail
- [x] 8.6 GREEN: nhánh `available-offline` trong `OfflineAudioBlock`; kiểm: test 8.5 pass
- [x] 8.7 RED: S8.4-AC1 "Chủ đề không có audio" (container) — nhóm HSK `[]` không có khối (không "Tải audio", "Đã tải audio", "Xóa audio", "Audio có sẵn offline"); kiểm: chạy, nếu pass ngay thì tạm render khối rỗng có chữ để thấy fail rồi trả lại
- [x] 8.8 GREEN: sửa đến khi pass; kiểm: test 8.7 pass
- [x] 8.9 RED: S8.4-AC1 "Chủ đề Nhập môn không có audio thì không có khối" (container) — nhóm Nhập môn `[]` không khối, nhóm Nhập môn có audio vẫn "Audio có sẵn offline"; kiểm: như 8.7
- [x] 8.10 GREEN: sửa đến khi pass; kiểm: test 8.9 pass
- [x] 8.11 RED: S8.4-AC1 "Đã tải thì hiện dung lượng và nút xóa" (container) — cache giả đủ file → "Đã tải audio (2,4 MB)" + nút "Xóa audio"; kiểm: fail
- [x] 8.12 GREEN: nhánh `downloaded` (dòng + nút xóa khi `canRemove`); kiểm: test 8.11 pass
- [x] 8.13 RED: S8.4-AC1 "Hiện tiến độ khi đang tải" (container) — bấm nút, thả 1/4 → "Đang tải 25%", không nút tải hay xóa; kiểm: fail
- [x] 8.14 GREEN: nhánh `downloading`, `download` của hook gọi `startDownload(unit, isOnline)`; kiểm: test 8.13 pass
- [x] 8.15 RED: S8.4-AC1 "Chủ đề đang khóa vẫn tải được" (container) — nhóm mọi bài "Đã khóa", bấm tải, thả hết → "Đã tải audio (…)", bài vẫn "Đã khóa"; kiểm: chạy, nếu pass ngay thì tạm ẩn khối ở nhóm khóa để thấy fail rồi trả lại
- [x] 8.16 GREEN: sửa đến khi pass; kiểm: test 8.15 pass
- [x] 8.17 RED: S8.4-AC1 "Bấm tải khi không có mạng" (container) — `navigator.onLine` false (spy getter + sự kiện `offline`), bấm → trong khối "Cần có mạng để tải audio.", vẫn nút "Tải audio (2,4 MB)"; kiểm: fail
- [x] 8.18 GREEN: hiện `message` trong khối; kiểm: test 8.17 pass
- [x] 8.19 RED: S8.4-AC1 "Mất mạng khi đang tải" (container) — xong 2/4, file 3 lỗi mạng → khối có "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." + nút tải; kiểm: chạy, nếu pass ngay thì tạm bỏ key `download-incomplete` để thấy fail rồi trả lại
- [x] 8.20 GREEN: sửa đến khi pass; kiểm: test 8.19 pass
- [x] 8.21 RED: S8.4-AC1 "Không đủ bộ nhớ" (container) — lỗi `storage-full` → khối có câu hết bộ nhớ + nút tải; kiểm: như 8.19
- [x] 8.22 GREEN: sửa đến khi pass; kiểm: test 8.21 pass
- [x] 8.23 RED: S8.4-AC1 "Thông báo của mỗi chủ đề độc lập" (container) — A "Cần có mạng…", xóa B → `within(khối A)` vẫn câu đó, `within(khối B)` "Đã xóa audio của chủ đề <B>.", câu không nằm sai khối; kiểm: fail (nút xóa chưa nối `remove`)
- [x] 8.24 GREEN: `remove` của hook, nút "Xóa audio" gọi `onRemove`; kiểm: test 8.23 pass
- [x] 8.25 RED: S8.4-AC1 "Rời màn khi đang tải" (container, route thật `/learning-paths` ↔ `/lessons/:id` qua `MemoryRouter`) — bấm tải, đi sang bài (khối unmount), thả hết file, quay lại → "Đã tải audio (2,4 MB)"; kiểm: chạy, nếu pass ngay thì tạm giữ state tải trong hook để thấy fail rồi trả lại
- [x] 8.26 GREEN: sửa đến khi pass; kiểm: test 8.25 pass
- [x] 8.27 RED: S8.4-AC1 "Quay lại màn khi việc tải còn đang chạy" (container) — như 8.25 nhưng quay lại khi xong 2/4 → "Đang tải 50%", không nút tải; thả nốt → "Đã tải audio (2,4 MB)"; kiểm: như 8.25
- [x] 8.28 GREEN: sửa đến khi pass; kiểm: test 8.27 pass
- [x] 8.29 RED: S8.4-AC2 "Xóa audio đã tải" (container) — bấm "Xóa audio" (không hộp xác nhận) → "Đã xóa audio của chủ đề Chào hỏi." + nút "Tải audio (2,4 MB)"; kiểm: chạy, nếu pass ngay nhờ 8.24 thì tạm bỏ `message` nhánh `removed` để thấy fail rồi trả lại
- [x] 8.30 GREEN: sửa đến khi pass; kiểm: test 8.29 pass
- [x] 8.31 RED: S8.4-AC1 "Nút tải có tên kèm chủ đề" (`.offlineAudioA11y`) — `getByRole('button', { name: 'Tải audio (2,4 MB), chủ đề Chào hỏi' })`, tên bắt đầu bằng `textContent` của nút; kiểm: fail vì chưa có `aria-label`
- [x] 8.32 GREEN: `aria-label` `downloadLabel`; kiểm: test 8.31 pass
- [x] 8.33 RED: S8.4-AC2 "Nút xóa có tên kèm chủ đề" — `getByRole('button', { name: 'Xóa audio, chủ đề Chào hỏi' })`; kiểm: fail
- [x] 8.34 GREEN: `aria-label` `removeLabel`; kiểm: test 8.33 pass
- [x] 8.35 RED: S8.4-AC1 "Tải bằng bàn phím và nghe được kết quả" — `user.tab()` tới nút tải, `{Enter}`; vùng `getByRole('status', { name: 'Thông báo audio offline' })` có "Đang tải audio chủ đề Chào hỏi.", thả hết → có "Đã tải xong audio chủ đề Chào hỏi."; ghi `textContent` của vùng sau mỗi lần thả: không lần nào chứa "Đang tải 25%"/"50%"/"75%"; kiểm: fail vì chưa có vùng
- [x] 8.36 GREEN: `OfflineAudioAnnouncer` (D10) trong `LearningPathContainer`, i18n `announce.*`; kiểm: test 8.35 pass
- [x] 8.37 RED: S8.4-AC1 "Hai chủ đề báo cùng lúc thì đọc đủ cả hai" — "Chào hỏi" và "Gia đình" tải, thả file cuối của hai chủ đề liên tiếp → vùng chứa cả hai câu "Đã tải xong…", câu thứ nhất vẫn còn khi câu thứ hai xuất hiện (hai phần tử `<p>`); kiểm: chạy, nếu pass ngay thì tạm render chỉ câu mới nhất để thấy fail rồi trả lại
- [x] 8.38 GREEN: sửa đến khi pass; kiểm: test 8.37 pass
- [x] 8.39 RED: S8.4-AC1 "Focus khi bắt đầu và khi tải xong" (`OfflineAudioBlock.test.tsx`, rerender theo topic) — focus nút tải, đổi topic sang `downloading` (nút bị gỡ) → `document.activeElement` là dòng "Đang tải …%"; sang `downloaded` có `canRemove` → nút "Xóa audio"; kiểm: fail (focus rơi về `body`)
- [x] 8.40 GREEN: `ownedFocusRef` + `onFocus`, `useLayoutEffect` (ref khác `null`, đã gỡ, `activeElement` là `body`; reset ref sau khi chuyển), `resolveFocusTarget`, `tabIndex={-1}` cho hai dòng chữ (design D9); kiểm: test 8.39 pass
- [x] 8.41 RED: S8.4-AC1 "Tải xong mà không có nút xóa thì focus tới dòng đã tải" — focus ở dòng tiến độ, sang `downloaded` `canRemove: false` → dòng "Đã tải audio (…)"; kiểm: chạy, nếu pass ngay thì tạm luôn nhắm nút xóa để thấy fail rồi trả lại
- [x] 8.42 GREEN: sửa đến khi pass; kiểm: test 8.41 pass
- [x] 8.43 RED: S8.4-AC1 "Focus khi tải lỗi" — focus dòng tiến độ, sang `not-downloaded` + `message: 'download-incomplete'` → nút "Tải audio"; (mức màn trong `.offlineAudioA11y`: vùng đọc có câu lỗi); kiểm: chạy, nếu pass ngay thì tạm bỏ nhánh `not-downloaded` của `resolveFocusTarget` để thấy fail rồi trả lại
- [x] 8.44 GREEN: sửa đến khi pass; kiểm: test 8.43 pass
- [x] 8.45 RED: S8.4-AC1 "Không kéo focus khi người học đã đi chỗ khác" (`.offlineAudioA11y`) — (a) bấm tải, focus một link bài khác trên bản đồ, thả hết file → focus vẫn ở link bài; (b) bấm tải, rồi bấm chuột (`user.click`) vào vùng chữ không focus được ngoài khối (focus về `body`), thả hết file → focus vẫn ở `body`, không bị kéo về khối "Chào hỏi"; kiểm: fail ở (b) vì ref chưa bị xóa khi focus rời khối
- [x] 8.46 GREEN: `onBlur` trên khối xóa `ownedFocusRef` khi `relatedTarget` không nằm trong khối và `event.target` còn trong DOM (design D9); kiểm: test 8.45 pass, 8.39–8.44 vẫn pass
- [x] 8.47 RED: S8.4-AC2 "Focus và thông báo khi xóa bằng bàn phím" (`.offlineAudioA11y`) — Tab tới "Xóa audio", `{Enter}` → focus nút "Tải audio (2,4 MB)" của "Chào hỏi", vùng đọc có "Đã xóa audio của chủ đề Chào hỏi."; kiểm: chạy, nếu pass ngay thì tạm bỏ câu `removed` khỏi vùng đọc để thấy fail rồi trả lại
- [x] 8.48 GREEN: sửa đến khi pass; kiểm: test 8.47 pass
- [x] 8.49 RED: S8.4-AC1 "Nút tải đang focus biến mất vì chủ đề tự thành đã tải" (`.offlineAudioA11y`) — C chỉ thiếu file s của "Gia đình"; Enter ở "Gia đình", Tab (hoặc Shift+Tab) tới nút tải của C (không Enter); thả hết file "Gia đình", s về cuối (không ai khác tải) → C "Đã tải audio (…)" + "Xóa audio", focus ở nút "Xóa audio" của C. Chạy **hai thứ tự khối** bằng `it.each`: C đứng trước "Gia đình" và "Gia đình" đứng trước C trên bản đồ (hai fixture lộ trình), cùng kỳ vọng; kiểm: chạy, nếu pass ngay nhờ 8.46 thì tạm bỏ `onBlur` xóa ref để thấy fail ở thứ tự "Gia đình" trước C (focus bị kéo về "Xóa audio" của "Gia đình") rồi trả lại
- [x] 8.50 GREEN: sửa đến khi pass; kiểm: test 8.49 pass ở cả hai thứ tự, mọi file < 300 dòng, component < 5 props, effect có cleanup

## 9. Style — `styles/tailwind/` (design D11)

- [x] 9.1 `apps/web/src/styles/tailwind/components/_offline-audio.css` (import trong `main.css`): `.offline-audio`, `.offline-audio-status` (focus nhìn thấy ≥ 3:1), `.offline-audio-message`, `.offline-audio-button` (vùng chạm ≥ 44×44 px, chữ dài xuống dòng), `.offline-audio-announcer` (`@apply sr-only`); token semantic, không `transition`/`animation`; JSX chỉ layout/spacing (§6) — ngoại lệ test-first: CSS thuần; kiểm: `pnpm --filter @csk/web test:run tokens` pass, preview `web-dev` 375×812 và 1280×800, sáng và tối: khối chưa tải, đang tải, đã tải, có thông báo, có sẵn offline

## 10. Nội dung mẫu và điều khiển mạng cho e2e (design D12)

Hạ tầng test (không phải code production, không cần RED): làm trước nhóm 11.

- [x] 10.1 `apps/web/e2e/fixtures/offlineAudioFixtures.ts`: chủ đề mẫu đúng `test-cases.md` (Điều kiện đầu chung; dung lượng chính xác từng byte; C và "Chủ đề dùng chung Nhập môn" dùng audio Nhập môn thật), biến thể `intro-empty`; `offlineFixturesPlugin` emit bài `e2e-*` và mp3 mẫu lúc build; `offlineAudioNetworkPlugin()` (preview middleware theo cookie: nội dung gộp, `/__e2e/audio-network`, `release`, `log`, `/__e2e/fixture/offline-audio`); `vite.config.ts` thêm plugin khi `mode === 'e2e'`; `playwright.config.ts` preview `--mode e2e`; kiểm: `pnpm e2e` toàn bộ e2e cũ (E1, E3, E6, E7, E8) vẫn pass, đặc biệt `e2e/E1/s1.2-offline.spec.ts` (mp3 mẫu S1.2 vẫn precache) và `e2e/E7/s7.1-intro-offline.spec.ts` (audio Nhập môn vẫn offline)
- [x] 10.2 `apps/web/e2e/E8/offline-audio.helpers.ts` (D12: `useOfflineAudioFixture`, `setAudioNetwork`, `releaseAudio`, `servedAudio`, `goOffline`, `openOnceWithServiceWorker`, `offlineAudioBlock`, `announcer`, giả lập hết bộ nhớ, mở lesson khóa bằng URL); kiểm: một test khói tạm thời thấy stage "HSK mẫu" và log lượt phục vụ audio, xóa test khói trước commit

## 11. Luồng thật, service worker, offline — e2e Playwright (`apps/web/e2e/E8/`)

E2E viết sau nhóm 1–10 chạy trên màn đã có: RED nào pass ngay thì tạm đổi hành vi (ví dụ thêm lại `mp3` vào `globPatterns`, bỏ
plugin Range, giữ state tải trong hook) để thấy fail rồi trả lại. `test.describe('S8.4 …')`, mỗi test mang ID Scenario và TC.

- [x] 11.1 RED: `s8.4-offline-audio-labels.spec.ts` — S8.4-AC1 "Chủ đề chưa tải có nút tải kèm dung lượng" (TC-S8.4-AC1-1, -2: 375×812 vùng chạm ≥ 44×44, không cuộn ngang), "Khối audio nằm trên link kiểm tra vượt cấp" (AC1-4), "Dung lượng dưới 1 MB hiện theo KB" (AC1-11), "Dung lượng rất nhỏ hiện tối thiểu 1 KB" (AC1-12), "Dung lượng sát 1 MB hiện 1,0 MB" (AC1-13), "Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5" (AC1-14), "Chủ đề Nhập môn có sẵn offline" (AC1-27), "Chủ đề HSK chỉ dùng audio Nhập môn" (AC1-31), "Chủ đề không có audio" (AC1-32), "Chủ đề Nhập môn không có audio thì không có khối" (AC1-33, biến thể `intro-empty`), "Nút tải có tên kèm chủ đề" (AC1-53); kiểm: `pnpm e2e` fail đúng lý do
- [x] 11.2 GREEN: sửa code (không sửa kỳ vọng) đến khi pass; kiểm: test 11.1 pass
- [x] 11.3 RED: `s8.4-offline-audio-download.spec.ts` — S8.4-AC1 "Đã tải thì hiện dung lượng và nút xóa" (AC1-6, -7), "Thiếu một phần audio thì là chưa tải" (AC1-9), "Đã nghe hết audio thì là đã tải" (AC1-10: phát qua SW được lưu vào `audio-cache`), "Bấm tải thì audio của chủ đề có trên máy" (AC1-15), "Tải hai chủ đề cùng lúc" (AC1-16), "Mở lại app vẫn thấy đã tải" (AC1-19, -20), "Chủ đề đang khóa vẫn tải được" (AC1-21), "Hiện tiến độ khi đang tải" (AC1-22), "Tiến độ làm tròn xuống" (AC1-25), "Tiến độ tính cả file đã có từ trước" (AC1-26), "Rời màn khi đang tải" (AC1-49), "Quay lại màn khi việc tải còn đang chạy" (AC1-50); kiểm: fail đúng lý do
- [x] 11.4 GREEN: sửa đến khi pass; kiểm: test 11.3 pass
- [x] 11.5 RED: `s8.4-offline-audio-offline.spec.ts` (mẫu `openOnceWithServiceWorker` của S1.2) — S8.4-AC1 "Mới cài app thì audio HSK chưa có trên máy" (AC1-5), "Đã tải thì học offline vẫn nghe được" (AC1-17), "Chủ đề Nhập môn có sẵn offline" (AC1-28), "Đóng app giữa chừng" (AC1-51, `launchPersistentContext`), S8.4-AC2 "Đã xóa thì offline không còn nghe được" (AC2-5), "Xóa không làm mất audio Nhập môn" (AC2-7); kiểm: fail đúng lý do (tạm thêm lại `mp3` vào `globPatterns` cho AC1-5 nếu pass ngay)
- [x] 11.6 GREEN: sửa đến khi pass; kiểm: test 11.5 pass
- [x] 11.7 RED: `s8.4-offline-audio-errors.spec.ts` — S8.4-AC1 "Bấm tải khi không có mạng" (AC1-34, -35, -36), "Mất mạng khi đang tải" (AC1-38, -39), "Tải lại chỉ tải phần còn thiếu" (AC1-40, đếm bằng `servedAudio`), "Không đủ bộ nhớ" (AC1-41, -42; context `serviceWorkers: 'block'` + vá `Cache.prototype.put`, kiểm path bị vá không có trong `audio-cache` — design D12), "Thông báo của mỗi chủ đề độc lập" (AC1-44), "Thông báo mất khi bấm nút kế tiếp" (AC1-45, -46), "Thông báo mất khi trạng thái đổi mà không bấm gì" (AC1-47, -48); kiểm: fail đúng lý do
- [x] 11.8 GREEN: sửa đến khi pass; kiểm: test 11.7 pass
- [x] 11.9 RED: `s8.4-offline-audio-remove.spec.ts` — S8.4-AC2 "Xóa audio đã tải" (AC2-1, -2, -3), "Xóa không làm hỏng chủ đề khác đang tải" (AC2-6), "Tải lại sau khi xóa" (AC2-8), "Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải" (AC2-9), "Chủ đề dùng chung audio vòng tròn vẫn xóa được" (AC2-10), "Hai chủ đề cùng bộ audio vẫn xóa được" (AC2-11), "Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải" (AC2-12, -13), "Audio đang được chủ đề khác tải thì tạm chưa có nút xóa" (AC2-14, -15), "Nút xóa có tên kèm chủ đề" (AC2-16); kiểm: fail đúng lý do
- [x] 11.10 GREEN: sửa đến khi pass; kiểm: test 11.9 pass
- [x] 11.11 RED: `s8.4-offline-audio-a11y.spec.ts` — S8.4-AC1 "Tải bằng bàn phím và nghe được kết quả" (AC1-56), "Hai chủ đề báo cùng lúc thì đọc đủ cả hai" (AC1-58, `holdPaths` + `release` cách nhau < 1 giây), "Focus khi bắt đầu và khi tải xong" (AC1-60), "Tải xong mà không có nút xóa thì focus tới dòng đã tải" (AC1-62), "Focus khi tải lỗi" (AC1-63), "Không kéo focus khi người học đã đi chỗ khác" (AC1-64), "Nút tải đang focus biến mất vì chủ đề tự thành đã tải" (AC1-65, -66), S8.4-AC2 "Focus và thông báo khi xóa bằng bàn phím" (AC2-19); kiểm: fail đúng lý do
- [x] 11.12 GREEN: sửa đến khi pass; kiểm: test 11.11 pass

## 12. Tài liệu và kiểm tra

- [ ] 12.1 Cập nhật `docs/03-architecture.md`: §3.2 cây (`core/services/audio-cache.service.ts`, `core/modules/pwa/audio-caching.config.ts`, `shared/services/offline-audio.service.ts`, `shared/contexts/useOfflineAudioService.ts`, `pages/learning-path/hooks/useOfflineAudio.ts`, `shared/utils/offline-audio.utils.ts`); §6.1 file `content/audio-index.json` (units, bytes, precached); §7 precache audio Nhập môn theo `precached` do pipeline sinh, `audio-cache` cache-first bỏ `Range` khi tải từ mạng và trả 206 từ cache; §8 hết bộ nhớ khi tải audio → thông báo trong khối chủ đề — ngoại lệ test-first: docs thuần; kiểm: đọc lại diff
- [ ] 12.2 Refactor + self-review theo CLAUDE.md §0, §2, §7 (không `any`, không `eslint-disable`, import theo bảng ở design, file < 300 dòng, component < 5 props, effect có cleanup, không mutate snapshot); kiểm: `pnpm lint` sạch
- [ ] 12.3 Chạy `pnpm typecheck && pnpm lint && pnpm test:run && pnpm content:check && pnpm --filter @csk/web build && pnpm --filter @csk/web check:fonts && pnpm e2e`, ghi kết quả thật; kiểm: toàn bộ pass
- [ ] 12.4 Chụp screenshot cho PR (bản build e2e có nội dung mẫu): bản đồ có khối chưa tải, đang tải, đã tải + xóa, có thông báo lỗi, "Audio có sẵn offline" — mobile 375×812 và desktop 1280×800, sáng và tối; kiểm: có file ảnh trên nhánh `pr-assets`
- [ ] 12.5 Ghi vào mô tả PR code cho QA: cách mở bản build có nội dung mẫu (`pnpm --filter @csk/web build --mode e2e` rồi `vite preview --mode e2e`, mở `/__e2e/fixture/offline-audio`), tên các chủ đề mẫu, bài nào chứa audio nào (bài khóa mở bằng URL `/lessons/<id>`), cách làm chậm/giữ/lỗi từng file (API `/__e2e/audio-network`) và giả lập hết bộ nhớ; ghi chú Safari iOS (TC-S8.4-AC1-18, -52) là kiểm tay; kiểm: mô tả PR có đủ các mục

## Workflow follow-up

- PR code ghi `Spec PR: #133`, References `Closes #57` khi đủ AC1–AC2, dòng `OpenSpec change: s8-4-offline-audio`.
- Archive tự động sau khi merge (`archive-spec-workflow.yml`), không archive trong PR code.
