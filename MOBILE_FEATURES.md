# MOBILE_FEATURES.md — identriq / PNG National ID Flutter Mobile Spec

> **Framework:** Flutter 3.47+ (Dart 3.13+)  
> **Source of Truth:** `Base.md`, `DESIGN.md`, `FEATURES.md` (§5)  
> **Design Platform:** Stitch AI (all mock-ups generated with `DESIGN.md` tokens)

---

## 1. Overview & Dual-Role Concept

The mobile application is a single Flutter codebase supporting two primary modes/flavors:
1. **Citizen ID Wallet** — The personal credential vault for Papua New Guinea citizens.
2. **Offline Authenticator** — The field inspection tool for police, border agents, banks, and polling officers with **zero network connectivity**.

A slim demo banner at the top allows instant switching between **Citizen Wallet** and **Verifier Scanner** modes for seamless client demonstrations.

---

## 2. Mobile Authentication & Login Flow (New)

The mobile app includes a dedicated, civic-grade authentication gateway designed for both initial identity onboarding and fast daily access.

### 2.1 First-Time Onboarding & Linking
* **Identifier Input:**
  * Option A: Enter **Mobile Number** (PNG format `+675 7xxxxxxx`)
  * Option B: Enter **Appointment Reference / QR Token** (from pre-registration Step 10)
  * Option C: Scan physical appointment receipt QR via camera
* **OTP Verification:**
  * 6-digit OTP code entry with auto-focus boxes.
  * Demo environment shows simulated OTP code in a slate chip.
  * 60-second cooldown timer for resend.
* **Security Setup:**
  * Prompt to create a 6-digit Quick Access PIN.
  * Prompt to enable Biometric Unlock (Face ID / Fingerprint via `local_auth`).

### 2.2 Returning User Login
* **Biometric-First Access:** App launch triggers native biometric prompt (Face / Fingerprint).
* **PIN Fallback:** Numeric PIN keypad if biometrics fail or are cancelled.
* **Role Switcher (Demo Mode):**
  * One-tap toggle at login header: `[ Citizen Wallet ]` ⟷ `[ Field Verifier ]`.
  * Allows demonstrating both citizen and inspector perspectives on one device.
* **Offline Authentication:**
  * Cached cryptographic token in secure storage (`flutter_secure_storage`).
  * Enables opening the app and displaying the ID card completely offline without re-authenticating to a remote server.

---

## 3. Surface 1: Citizen ID Wallet

### 3.1 Digital ID Card Viewer (Home Screen)
* **High-Fidelity Credential Card:**
  * Front side: Citizen photo, Full Name, BIOSURE/IDENTRIQ ID Number (masked by default, tap to reveal), Date of Birth, Gender, Province, National Seal watermark.
  * Tap or swipe to flip to back side: Registered address, Issuance Date, Expiry Date, Digital Signature, Barcode/Micro-QR.
* **Holographic Anti-Fraud Effect:**
  * Gyroscope/accelerometer-driven shimmer animation on the Bird-of-Paradise gold emblem (`#C9A227`) to prevent static screen captures.
* **Lifecycle Status Pill:**
  * Dynamic status indicator: `Approved & Active` (Mint green), `Validating` (Amber), `Card Dispatched` (Teal).

### 3.2 Secure QR Presenter
* **High-Contrast Fullscreen QR:**
  * Displays the citizen's signed digital identity payload.
  * **Auto-Brightness Boost:** Automatically raises device screen brightness to 100% when opened to ensure instant scanning by outdoor optical readers.
  * Offline valid: Generated from the encrypted local payload with expiration timestamp.

### 3.3 Application & Identity Tracking
* **Status Timeline:**
  * Real-time sync with backend status: `Pre-Registered` → `Biometrics Captured` → `Validation & Deduplication` → `Card Personalized` → `Delivered`.
* **Appointment Slip:**
  * View booked center, appointment date, time slot, and "What to Bring" checklist.

### 3.4 In-App Notification Center
* **Audit & Activity Log:**
  * Notifies the citizen when their ID is checked by a third-party verifier (timestamp, organization, purpose).
  * Demo mock SMS / Email announcements.

---

## 4. Surface 2: Offline Authenticator (Verifier)

### 4.1 Field Scanner
* **Fast Camera Scanner:**
  * Built using `mobile_scanner` / native camera stream.
  * High-visibility viewfinder box with contrast frame.
  * Torch/flashlight toggle for dark or rural environments.

### 4.2 Zero-Network Cryptographic Verification
* **Local Signature Check:**
  * Decodes payload using the embedded IDENTRIQ public key.
  * Validates cryptographic signature, timestamp, and tamper-evident hash.
  * Works 100% in airplane mode with **zero network requests**.

### 4.3 Arm’s-Length High-Visibility Verdict Screen
Designed for outdoor sunlight and quick inspection:
* **VALID Verdict:**
  * Rich Highland Green / Mint (`#2FD6A3`) and Gold header.
  * Large, unmistakable **VALID IDENTRIQ ID** banner.
  * Holder photograph, Full Name, masked ID number, validity expiry.
* **INVALID Verdict:**
  * High-contrast Flag Red banner.
  * Clear error explanation (e.g., `Signature Expired`, `Tampered Payload`, `Unknown Authority`).

### 4.4 Offline Audit Outbox
* Every offline scan record is stored locally in SQLite / encrypted cache.
* Top-right badge shows un-synced scan count (e.g., `4 Scans Pending Sync`).
* Automatically flushes and logs audit events to backend when connectivity is restored.

---

## 5. Stitch Screen Inventory for Mobile

Use Stitch to generate the following mobile screens (360px–390px viewport, light mode, following `DESIGN.md`):

1. **`M-01` Mobile Login & Onboarding** (Phone/Ref ID, OTP chip, Biometric toggle)
2. **`M-02` Citizen Wallet Home** (Digital ID Card front, quick actions, status chip)
3. **`M-03` Digital ID Card Back Flip** (Address, security seals, barcode)
4. **`M-04` Fullscreen Dynamic QR Presenter** (Brightness-boosted, timer)
5. **`M-05` Application Status Tracker** (Vertical step timeline)
6. **`M-06` Verifier Camera Scanner** (Camera preview, target reticle, flashlight toggle)
7. **`M-07` Arm’s-Length VALID Verdict** (Sunlight-legible green/gold, photo, details)
8. **`M-08` Arm’s-Length INVALID Verdict** (High-contrast red, warning code)
9. **`M-09` Verifier Outbox & History** (List of offline scans, sync status pill)

---

## 6. Design & Token Mapping (`DESIGN.md`)

| Design Element | Token / Spec | Mobile Application |
| :--- | :--- | :--- |
| **Primary Accent** | `#2FD6A3` (Fayda Mint-Teal) | Primary buttons, active tabs, VALID verdict glow |
| **Background / Surfaces** | `#0E2A26` (Slate-Teal), `#F7F5EF` (Warm Paper) | Dark card headers, light form content |
| **Gold Accent** | `#C9A227` (Bird-of-Paradise Gold) | Hologram shimmer, gold ID reveal moments |
| **Alert Red** | Flag Red | INVALID verdict banner, destructive actions only |
| **Typography** | Humanist Sans (Inter / Plus Jakarta) | Large header text, tabular numerals for IDs |
| **Touch Ergonomics** | $\ge 48\text{px}$ targets | Large thumb-accessible action pills |
