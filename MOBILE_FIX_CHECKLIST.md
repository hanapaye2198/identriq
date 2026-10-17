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

## 1c — M2: wallet depth (§5.1)

- [ ] **W5 — Share (selective disclosure)** [L] — purpose presets → which fields are shared.
- [ ] **W6 — Consent request (Allow/Deny)** [M].
- [ ] **W7 — Activity log** [M] — render `AuthEvent` history.
- [ ] **W4 — Fullscreen QR + 60s countdown** [M] — supersedes the §3 P2 "fullscreen presenter".
- [ ] **W10 — Notifications** [M] — supersedes the §3 P2 item.
- [ ] **W11 — Settings basics** [M] — language row, devices, privacy summary, reset.
- [ ] **V7 — History + filters** [M] verifier — outbox done in F1; history still open.

## 2 — P1: quick wins + spec polish

- [ ] **Resend cooldown 60s** [S] `m/link.tsx` (spec §2.1) — disable "Send code" with a countdown.
- [ ] **Masked BIOSURE ID, tap to reveal** [S–M] `components/national-id-card.tsx` + `m/wallet.tsx` (spec §3.1).
- [ ] **Lifecycle status pill** [S] `m/wallet.tsx` (spec §3.1) — mint `Approved & Active` / amber `Validating` / teal `Card Dispatched`.
- [ ] **DOB fix** [S] — gated on **D1**.
- [ ] **Portrait handling** [S] — gated on **D2**.

## 3 — P2: web-feasible spec features

- [ ] **Notification center in wallet** [M] (spec §3.4) — render the already-returned `notifications` (icon, title, time).
- [ ] **Appointment slip** [M] (spec §3.3) — expose center/date/slot + "What to Bring" via `/api/me/identity`; wallet section.
- [ ] **Province on card** [S] (spec §3.1) — add `province` to API + card prop.
- [x] **Offline snapshot on `/m/verify`** [M–L] (spec §4.4) — done with §1b `2026-10-17`: `/verify/snapshot` → `verify_lists` localStorage cache; verdicts evaluated locally (same result offline); sync = push outbox + refresh lists.
- [ ] **Fullscreen QR presenter** [M] (spec §3.2) — fullscreen white QR + Screen Wake Lock. Note: browser brightness control is not possible; fullscreen + white is the substitute.
- [ ] **Option B: appointment ref / QR-token input** [M] (spec §2.1) — link by token, then OTP to the registered mobile.
- [ ] **OTP auto-focus boxes** [S–M] (spec §2.1) — 6-cell input component.

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
