# MOBILE_FIX_CHECKLIST.md — identriq mobile work queue

> Working checklist from the 2026-10-17 mobile review (spec: `MOBILE_FEATURES.md`).
> Finding refs (F1–F10) point at the review; § refs are spec sections.
> 2026-10-17: new target adopted — `FEATURES_mobile_section.md` (replaces FEATURES.md §5/§7; ~24 screens W1–W15 / V1–V9). Phasing: P0 → M1 (story-critical §5.4) → M2 (wallet depth).
> Rules: nothing starts until confirmed; no commits/staging (AGENTS.md §4.1); soft-delete only; shell via `rtk`.

**Legend** — **P0** demo-critical bug · **P1** quick win · **P2** feature (web-feasible) · **P3** stretch · **[S/M/L]** rough size

---

## 0 — Decisions needed first (gate the starred items)

- [x] **D1 — DOB off-by-one fix** (F7) `2026-10-17`: robust `formatCardDate` in `m/wallet.tsx` + `admin/issuance.tsx` (plain `YYYY-MM-DD` → calendar date via UTC; full timestamps → `Pacific/Port_Moresby`); MRZ digits in `national-id-card-back.tsx` aligned (reversible).
- [x] **D2 — Portrait placeholder** (F8): neutral silhouette is the card's default (`public/images/portrait-placeholder.svg`) + `onError` fallback on the img.
- [x] **D3 — `/verify/offline` snapshot exposure** (F4): kept as-is (demo); trade-off documented in `VerifyController::offline`.
- [x] **D4 — Unlink revoke** (F5): `POST /api/mobile/unlink` (auth:sanctum) revokes the token; wallet fires it best-effort on Unlink; covered by test.

## 1 — P0: bugs in shipped code

> Status `2026-10-17`: all P0 code-complete + verified — `MobileApiTest` 10 passed / 35 assertions, scoped `vp check` clean. Browser E2E pending a manually populated citizen (DB cleared on purpose).

- [x] **F1 — Repair mobile outbox + offline verify** [M] `resources/js/pages/m/verifier.tsx` — done `2026-10-17`: scans append to `verify_outbox` and sync pushes them; offline = no crash, honest notice, nothing falsely queued; badge updates.
- [x] **F3 — Harden OTP endpoints** [S] `routes/api.php`, `app/Http/Controllers/MobileController.php` — done: `throttle:10,1` on both routes + single-use OTP (`cache()->forget` on link); tests: 429 after 10 attempts, reuse → 422.
- [x] **F6 — Wallet offline state** [S] `resources/js/pages/m/wallet.tsx` — done: `loadError` + Retry card; all three fetches catch; no more eternal skeleton.
- [x] **F9 — `link.tsx` side effect during render** [S] `resources/js/pages/m/link.tsx` — done: navigation moved into `useEffect`.
- [x] **F10 — Verifier `sync()` error handling** [S] — done (folded into F1): try/catch + inline feedback; outbox cleared only on confirmed sync.
- [x] **F4 follow-through** [S–M] — closed: D3 = keep as-is (demo trade-off).
- [x] **F5 follow-through** [S] — done with D4.

## 1b — M1: story-critical (§5.4 — makes the new spec's demo story real)

> Status `2026-10-17`: M1 code-complete + verified — 4 new tests (suite green); scoped `vp check` clean; `tsc` clean except the pre-existing generated `RedirectController.ts`. ⚠️ The new migration is written but **not run on the dev DB** — human step: `rtk php artisan migrate` (until then `report-lost` returns 500).

- [x] **Credential status + suspend** [M] backend — done `2026-10-17`: `suspended_at`/`revoked_at` migration `2026_10_17_000005` (written, not run) + derived `credentialState()`; `POST /api/mobile/report-lost` (idempotent + notification); `check()` returns `{valid, state, reason}`; `snapshot()` exposes per-credential `state` + `issued_at`.
- [x] **Trust/revocation staleness** [M] — done: snapshot `generated_at` drives the verifier strip; V8 rules `<24h` green · `24–72h` amber · `>72h` red ("treat VALID as unconfirmed") + labeled demo controls (0h / 30h / 80h / Real / Reset device).
- [x] **Purpose picker** [S] V3 — done: chips on `/m/verify`; purpose + reason flow through the outbox → sync → `AuthEvent` metadata.
- [x] **Wallet: status chip + suspended banner + Report lost/stolen** [M] W3/W9 — done: Active/Suspended/Revoked/Pending chip; red banner + replacement stub; inline two-step confirm → optimistic flip.
- [x] **Verifier: INVALID variants** [M] V6 — done: Tampered / Not issued (unknown · pending · failed) / Revoked / Suspended / Expired QR; verdicts are local-first from cached lists (same outcome offline).
- [x] **Seeds** [S] §5.3 — done (code only, never executed): 13th citizen Thomas Bani (+6757000013, pre-revoked, `delivered_at` null); scaffolding test updated (13 registrants, 1 revoked).
- [x] **`DEMO.md` mobile script** [S] — added (§6).
- [ ] **Human step before the demo** — run the migration + repopulate one citizen on the dev DB (agent never runs seeders/migrations there).

## 1c — M2: wallet depth (§5.1) — ✅ DONE `2026-10-17` (M2a–M2d shipped; human migration + seed step pending)

> Goal: run the §5.4 story exactly as written — wallet W5 share → scoped QR → verifier shows only the shared fields; W6 consent approved from a real `/verify/online` request; W7 shows both checks + the consent. Plus W4 / W10 / W11 and verifier V7.
> ⚠️ Human step unchanged and now doubly required: `rtk php artisan migrate` (runs M1 `000005` + M2 `000006`). The agent never runs it.

**Decisions — ✅ accepted as-is (user go given `2026-10-17`)**

- **D5 — selective disclosure format** [S]: the scope rides the QR / paste code (`<token>|share=name,over18,…`); `check()` + `syncOutbox()` accept it, filter the response (name · ID masked vs full · DOB vs "over 18" · address · photo) and record `fields` in `AuthEvent.metadata`. HMAC stays simulated. Alt: wallet-side preview only — rejected (theater).
- **D6 — consent origin** [S]: real beat — `/verify/online` gains "Request consent" after lookup (verifier name + purpose, 2-min expiry), wallet shows the incoming request (Allow / Deny + countdown), online page polls status. Wallet demo-control fallback button for rehearsal. Alt: wallet-only simulation.
- **D7 — navigation** [S]: keep the 2-tab `/m` shell; wallet gets an internal segmented nav (Home · Share · Activity · Settings, W3 quick actions), verifier gets Scan · History (V7). Alt: restructure to the spec's 4-tabs-per-app — rejected (churn, breaks M1 stability).
- **D8 — activity source** [S]: `AuthEvent` (same as audit §3.4); filters **All / Shared** (valid + consent allowed) **/ Denied** (invalid + consent denied). No new table.

**Batches**

- [x] **M2a — backend** [M–L] — migration `2026_10_17_000006_create_consent_requests_table.php` (written, not run; soft deletes) + `ConsentRequest` model; routes (auth:sanctum): `GET /api/mobile/consent/pending`, `POST /api/mobile/consent/{id}/decide`, `GET /api/mobile/activity`, `GET + DELETE /api/mobile/devices`; scope param on `qrPayload` / `qrSvg` / `check` / `syncOutbox`; public `/verify/online` consent create + status poll (throttled; same demo trade-off as D3). Tests: pending → allow → activity row; deny; expiry; devices; scoped check + metadata `fields`; scope whitelist validation. — ✅ `2026-10-17`: shipped as planned; QR sig now covers the scope (`token|issued_at|share`); `ShareScope` whitelist lives in `app/Support/ShareScope.php`. Evidence: scoped 25/25, full suite 83/83 (413 assertions).
- [x] **M2b — wallet UI (§5.1)** [L] — W3 quick actions row; W4 fullscreen presenter (scoped QR, 60 s countdown + refresh, masked ID, "Works offline", Wake Lock guarded); W5 purpose presets (Bank · Police · Telco · Clinic · Custom) + field toggles (Name / Photo / DOB **or** Over-18 / ID masked-vs-full / Address) with "verifier will see" summary; W7 activity view + filters; W10 notifications via header bell (unread dot); W11 settings (language rows, linked devices + remove, privacy summary, local demo reset). Wallet reads move onto the Redux Toolkit `api` slice (RTK Query endpoints + bearer header in `prepareHeaders`) while these paths are being touched — per AGENTS.md §2. — ✅ `2026-10-17`: shipped as planned — 6 wallet components (`resources/js/components/wallet/`: `share-scope`, `datetime`, `share-presenter`, `share-view`, `activity-view`, `settings-view`), `wallet.tsx` rewrite (segmented nav Home·Share·Activity·Settings + header bell + consent/credential banners), `verify/online.tsx` consent panel (D6, 3 s poll) , `csrf.ts` + meta tag, `link.tsx` resets API cache on a fresh link. All wallet reads now via the Redux Toolkit `api` slice (11 endpoints / 9 tagTypes). Unrelated generated-code tsc skew fixed: `laravel/wayfinder` v0.1.21 → v0.1.23 (`composer.lock` only) + regenerated actions/routes. Evidence: `types:check` clean (twice, incl. post-build) · `vp build` pass · scoped 25/25 (139 assertions) · full suite 87/87 (478 assertions) · Pint clean.
- [x] **M2c — verifier V7** [M] — `verify_history` localStorage log (every verdict incl. not-issued / tampered; `synced` flips on outbox sync) + Scan · History segmented nav + filters (All / Valid / Invalid / Pending-sync); Reset device clears it. Stays local-first (offline-first exception, documented in code). — ✅ `2026-10-17`: shipped as planned — share code parsed client-side (`<token>|share=…` sanitized against `SHARE_FIELDS` before it can reach sync), scoped verdict (name · full-vs-masked ID only when shared; "Shared by holder: …" chips), outbox `fields` recorded for valid verdicts only, history capped at 50 entries, sync flips unsynced → `synced`, Reset device clears lists + outbox + history. Evidence: `types:check` clean · scoped `vp check` clean (all 12 M2 files; M2b-file formatting debt — incl. `verify/online.tsx`, which my first scoped runs mis-pathed — fixed by scoped `--fix`) · `vp build` pass · scoped 25/25 (139 assertions) · full suite 88/88 (493 assertions).
- [x] **M2d — story + docs** [S] — DEMO.md §6 extended to the full §5.4 beats; close superseded §3 items (fullscreen presenter, notification center); full suite + scoped `vp check` + `types:check`; evidence report + proposed commit messages (never commit). — ✅ `2026-10-17`: `DEMO.md` §6 rewritten as the 7-beat rehearsal loop (scoped Bank share → offline scoped verdict → report-lost → staleness → sync → `/verify/online` consent → activity/history) — `DEMO.md` is git-ignored (`.gitignore:47`), so it stays a local presenter doc; §3 superseded items closed (notification center → W10 bell panel · fullscreen presenter → W4 `share-presenter`). Evidence: full suite 88/88 (493 assertions) · scoped `vp check` clean (12 M2 files + `DEMO.md` + this checklist) · `types:check` clean. Evidence report + proposed commit messages delivered in-session as text only — nothing staged or committed (AGENTS.md §4.1).
- [ ] **Out of scope for M2**: W2 app lock, W8 in-app status, V1 pairing, V9 verifier settings, language-switcher logic, haptics, camera, Ed25519.

**Open sub-questions (defaults apply unless vetoed)**

- W5 preset defaults = the minimum: Bank · name + over-18 + masked ID; Police · name + DOB + full ID; Telco · name + masked ID; Clinic · name + DOB; Custom · free toggles.
- Consent expiry 2 min · wallet pending poll every 5 s · verifier poll every 3 s.
- W4 entry from Home defaults to the minimal scope (name + over-18 + masked ID; photo is the placeholder silhouette).

## 2 — P1: quick wins + spec polish — ✅ DONE `2026-10-17` (browser E2E still pending the human migration)

- [x] **Resend cooldown 60s** [S] `m/link.tsx` (spec §2.1) — ✅ `2026-10-17`: "Send code" disables while in flight and shows "Resend in Ns" for 60 s after a successful send; an unknown number stays retryable (no cooldown); a dead network shows a plain-language error instead of an unhandled rejection.
- [x] **Masked BIOSURE ID, tap to reveal** [S–M] `components/national-id-card.tsx` + `m/wallet.tsx` (spec §3.1) — ✅ `2026-10-17`: card front + back MRZ render `•••• 4821` until the holder taps the badge itself ("Tap to reveal / Tap to hide" hint); the card flip moved to an explicit caption button under the card (the reveal target cannot nest inside the old whole-card flip button); admin issuance keeps the static full-ID badge (`onIdNumberClick` opt-in).
- [x] **Lifecycle status pill** [S] `m/wallet.tsx` (spec §3.1) — ✅ `2026-10-17`: mint `Approved & Active` · amber `Validating` (identity pending) · teal `Card Dispatched` (registrant `issued`, i.e. personalized → not yet delivered); red Suspended / Revoked / Failed + grey Not issued preserved.
- [x] **DOB fix** [S] — ✅ closed by **D1** (§1): `formatCardDate` (wallet + admin issuance) + PNG-Moresby MRZ dates; duplicate row, no separate work.
- [x] **Portrait handling** [S] — ✅ closed by **D2** (§1): neutral-silhouette default + `onError` fallback; duplicate row, no separate work.

> P1 evidence: `types:check` clean · scoped `vp check` clean on the 3 touched files (formatted + linted) · `vp build` pass (wallet 43.72 kB · link 2.68 kB) · full suite 88/88 (493 assertions). No backend touched.

## 3 — P2: web-feasible spec features

- [x] **Notification center in wallet** [M] (spec §3.4) — ✅ `2026-10-17` (M2b, W10): header bell + unread dot opens a panel rendering the returned `notifications` (title, body, time; up to 8; read-state via `wallet_notifications_seen_at`).
- [x] **Appointment slip** [M] (spec §3.3) — ✅ `2026-10-17`: `/api/me/identity` gains an `appointment` object (center · center_location · center_province · slot_at ISO · reference · status; latest by `created_at`, via eager-loaded `appointments.center`); new `resources/js/components/wallet/appointment-slip.tsx` renders after the quick actions — center + address, slot as `Fri, 24 Oct 2026 · 09:30` in `Pacific/Port_Moresby`, client-side "What to Bring" checklist, appointment-code footer.
- [x] **Province on card** [S] (spec §3.1) — ✅ `2026-10-17`: `NationalIdCard` gains a `province` prop (default `CENTRAL PROVINCE`) + a `PROVINCE:` row under sex/nationality; wallet passes `card.province ?? '—'`, admin issuance passes `item.registrant.demographic?.province ?? '—'` (the API already carried `province`/`photo_url` from M2). The landing 3D card renders via the same default, so it needed no edit — its file stays untouched.
- [x] **Offline snapshot on `/m/verify`** [M–L] (spec §4.4) — done with §1b `2026-10-17`: `/verify/snapshot` → `verify_lists` localStorage cache; verdicts evaluated locally (same result offline); sync = push outbox + refresh lists.
- [x] **Fullscreen QR presenter** [M] (spec §3.2) — ✅ `2026-10-17` (M2b, W4): fullscreen white QR in `share-presenter.tsx` — 60 s countdown + refresh, masked ID, "Works offline", Wake Lock guarded. Browser brightness control is still not possible; fullscreen + white remains the substitute.
- [x] **Option B: appointment ref / QR-token input** [M] (spec §2.1) — ✅ `2026-10-17`: `/api/mobile/otp` + `/api/mobile/link` accept `token` (`required_without:mobile`); the token resolves the registrant through `Appointment.qr_token` — pasted QR URLs and wallet `<token>|share=…` codes are normalized to the bare token. The OTP still goes to the registered mobile (single-use; same `otp:{mobile}` key for both flows) and `otp()` now returns a masked `mobile_hint` ("+675 ••• 013"). `m/link.tsx` gains a Mobile number / Appointment code toggle. Tests: token→otp→link happy path, pasted QR URL, unknown-token 404, `mobile_hint` shape.
- [x] **OTP auto-focus boxes** [S–M] (spec §2.1) — ✅ `2026-10-17`: the 6-digit code uses the existing shadcn `InputOTP` (3+3 groups, `size-11` slots, digits-only pattern, focus auto-advances per keypress); no auto-submit by design — `Enter` submits through the wrapping `<form>`. Error copy: "Too many attempts — wait a minute and try again." (429) · "We couldn't find that appointment code." (token 404) · "Unknown mobile number." (mobile 404).

> P2 evidence `2026-10-17`: `types:check` clean · scoped `vp check` clean (6 files) · `vp build` pass (`link` chunk 4.41 kB) · full suite **91/91 (547 assertions)** — incl. 2 new token-flow tests + the extended `identity` structure (`province`, `photo_url`, `appointment.*`). Browser E2E still pending the human migration + a repopulated citizen.

## 4 — P3: stretch / native-grade (big lifts)

- [ ] **Zero-network cryptographic verification** [L] (spec §4.2) — Ed25519 sign server-side, verify client-side via WebCrypto with an embedded public key; signed payload with expiry in QR. Replaces the token-lookup model. (F2)
- [ ] **Camera scanner** [M–L] (spec §4.1) — `BarcodeDetector` API (Chrome/Android only) + `getUserMedia` viewfinder; note the Safari/iOS support gap.
- [ ] **Holographic shimmer** [M] (spec §3.1) — DeviceOrientation-driven sheen, graceful fallback to none.
- [ ] **Biometric / PIN unlock** [M–L] (spec §2.1/§2.2) — WebAuthn platform authenticator + 6-digit local PIN gate.
- [ ] **IndexedDB outbox** [M] (spec §4.4) — replaces localStorage if you want the SQLite-style store.

## 5 — Docs

- [ ] **Merge `FEATURES_mobile_section.md`** into `FEATURES.md` §5/§7 (+ §6 seeds + `DEMO.md` mobile script) [S] — pending explicit confirm; also resolve the Expo vs Flutter naming conflict with `MOBILE_FEATURES.md`.
- [ ] **Status appendix in `MOBILE_FEATURES.md`** [S] — map every claim → ✅/⚠️/❌ with "web demo" notes, so the doc stops over-claiming.
- [ ] **Reality note** [S] — one line: spec targets Flutter; current `/m` is the web demo.

## 6 — Verification protocol (every item)

1. `rtk pnpm lint` + `php -l` on touched files.
2. Playwright pass on the affected `/m` flow (393×852), console clean.
3. Extend `tests/Feature/MobileApiTest.php` / `VerifyFlowTest.php` where behavior changed.
4. Evidence screenshots → `%TEMP%\opencode\`; report back before any commit (never commit).
