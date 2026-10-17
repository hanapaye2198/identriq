## 5. Mobile platform (IN SCOPE — one Expo codebase, two flavors)

Stack: Expo (React Native, TypeScript) sharing design tokens + validation logic with web. API: same Laravel backend via token auth (Sanctum). Offline-first: secure local store (credential payload + signed QR), sync-later outbox, same guarantees as §4.1.
Visual language: follow DESIGN.md (Civic Blue / Navy / canvas, Inter, no dark mode). Credential card render is the same component as web §3.2.
Demo honesty: biometrics are stubs, QR payload signing is simulated, every screen carries the demo chip (slate) — no claim of real government service.

### 5.0 Mobile global rules (both apps)

- Navigation: bottom tab bar (max 4), primary action in the bottom third, one-handed reach.
- Targets ≥ 44px; body ≥ 16px; captions ≥ 12px; large-text setting respected; contrast ≥ 4.5:1.
- Every data screen has loading (skeleton), empty, error (plain language + retry), and offline states. Offline banner is slim and informational, never blocking. Outbox count badge in the header when > 0.
- Language switcher present (English active; Tok Pisin / Hiri Motu "coming soon").
- Motion: only functional (QR countdown, verdict reveal). Respect reduced-motion. Light haptic on VALID, double haptic on INVALID.
- Screen privacy: QR and ID number screens block screenshots where the OS allows; blur in app switcher.
- Priority tags: **P1** = must be in the demo, **P2** = build if time, **P3** = slide only.

### 5.1 IDENTRIQ ID wallet app (holder)

Tabs: **Home · Share · Activity · Settings**.

| # | Screen | Pri | What it contains / does |
|---|---|---|---|
| W1 | Link identity | P1 | Enter reference number or scan appointment QR → OTP (6 boxes, code shown in slate demo chip, 60s resend) → success. Decline/invalid → plain-language error. |
| W2 | App lock setup | P1 | Create 6-digit PIN, enable biometric unlock (stub). Explains why in one sentence. |
| W3 | Home | P1 | Digital ID card (front, tap to flip to back), status chip (Active / Suspended / Pending), three quick actions: Show QR · Share · Activity. If application not yet issued: status timeline summary + "View progress". |
| W4 | Show QR | P1 | Full-screen QR, brightness boosted, **60-second validity countdown** + refresh, "Works offline" badge, masked ID number below. Explains that screenshots expire. |
| W5 | Share ID (selective) | P1 | Pick purpose preset (Bank · Police · Telco · Clinic · Custom) → toggles per field (name, photo, date of birth or "over 18" only, address, ID number masked/full) → "Show QR". Defaults to the minimum for the preset. |
| W6 | Consent request | P1 | Incoming online verification (§4.2): verifier name, purpose, fields requested, expiry timer, **Allow / Deny**. Result logged to Activity. |
| W7 | Activity log | P1 | Chronological list: who checked, when, purpose, fields shared, offline/online, result. Filter (All / Shared / Denied). Row → detail. Same data as audit (§3.4). |
| W8 | Application status | P1 | Mobile version of `/track`: timeline (registered → validating → approved/failed → personalized → delivered), appointment card with QR and center, reschedule/cancel (pre-capture), rework upload if rejected. |
| W9 | Report lost / stolen | P1 | Confirm with PIN → credential **suspended** instantly; Home shows red "Suspended" banner; "Request replacement" button. Verifier must show INVALID after next sync (see §5.2). |
| W10 | Notifications | P1 | Same mock SMS/email center as web: appointment confirmed, status changes, consent requests, security alerts. |
| W11 | Settings & security | P1 | App lock, linked devices (list + remove), language, text size, privacy summary, about/demo reset. |
| W12 | Virtual ID | P2 | Generate a masked, rotating alias to share instead of the real ID number; regenerate; shows last 4 only. |
| W13 | Help & scam safety | P2 | "We will never ask for your PIN or OTP", how to verify a real request, contact center, FAQ. |
| W14 | Update details request | P2 | Pick field (address, name spelling), upload evidence, submits to staff queue, shows in status tracker. |
| W15 | Feature-phone fallback (SMS/USSD) | P3 | One mock screen/slide: dial code → registration status, retrieve ID number by SMS. Slide only; confirm need with client first. |

### 5.2 Offline Authenticator app (verifier)

Tabs: **Scan · History · Sync · Settings**.

| # | Screen | Pri | What it contains / does |
|---|---|---|---|
| V1 | Pair device | P1 | Enter enrolment code from admin (§3.3), name the device, success. Seeded in demo. |
| V2 | Scan home | P1 | Big Scan button, current purpose chip, status strip: trust list age · revocation list age · outbox count. |
| V3 | Purpose picker | P1 | Bank onboarding · Police check · Telco SIM · Clinic · Other. Sets what the verdict reveals. Recorded with each check. |
| V4 | Scan | P1 | Camera frame, torch, manual token entry fallback. No network call. |
| V5 | Verdict — VALID | P1 | Arm's-length legible: large VALID, photo, name, masked ID (and only fields the purpose needs), time, "Checked offline". Light haptic. |
| V6 | Verdict — INVALID | P1 | Variants with plain reason: Revoked / Suspended · Expired QR · Not issued by IDENTRIQ · Tampered. Red, unmistakable. Double haptic. |
| V7 | History + outbox | P1 | Past checks with result and purpose; pending-sync items badge; auto-push when online; manual "Sync now". |
| V8 | Sync status | P1 | Trust list updated, revocation list updated, outbox. Rules: < 24h green; 24–72h amber "revocations may be missing"; > 72h red "cannot confirm revocations — treat VALID as unconfirmed". |
| V9 | Settings | P2 | Device name, language, text size, demo reset. |

### 5.3 Shared

Design tokens mirror web (DESIGN.md). Push notifications stubbed (same mock center as web). Demo seeds: one linked identity (active card), one second identity in "pending", one verifier device pairing, one pre-made revocation event.

### 5.4 Demo story for mobile (rehearse this)

1. Wallet W3 → W5 pick "Bank" → W4 show QR.
2. Authenticator: airplane mode on → V3 Bank → V4 scan → V5 VALID (offline).
3. Wallet W9: report lost → W3 shows Suspended.
4. Authenticator V8 still green-but-stale → scan again → still VALID until sync (show the amber warning rule) → turn network on → sync → V6 INVALID "Suspended".
5. Wallet W7 shows both checks in Activity; W6 shows an online consent request being approved.

## 7. Screen inventory — mobile additions (replace the Mobile line)

Mobile (~24): Wallet W1–W14 (+ W15 slide) · Authenticator V1–V9 · Global: offline banner, empty/error/skeleton states, demo chip.
