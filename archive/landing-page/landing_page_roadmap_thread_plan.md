# Implementation Plan: Landing Page Interactive Roadmap Thread

## 1. Executive Summary & Objective
Transform the existing scroll-driven document convergence animation on the landing page (`/` in [resources/js/pages/welcome.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/Ma%27am%20Hannah/identriq/resources/js/pages/welcome.tsx)) into a **Sovereign National Identity Roadmap Thread**. 

The new experience will be an engaging, interactive journey featuring a glowing animated spine/thread that guides citizens, staff, and government officials step-by-step through the complete Papua New Guinea IDENTRIQ lifecycle—from initial online pre-registration to biometric capture, ABIS deduplication, card laser personalization, and offline field verification.

---

## 2. Visual & Architectural Concept

### The "Sovereign Roadmap Thread"
```
[Start: Online Pre-Reg] 
        │
        ▼ (Glowing Civic Blue Pulse Thread)
[● Milestone 1: 10-Minute Digital Pre-Registration]
        │ ── Step details, mobile OTP mock, document scan upload
        ▼
[● Milestone 2: Biometric Capture & Desk Check-In]
        │ ── Center booking, QR fast-track pass, 10-print & iris scanner
        ▼
[● Milestone 3: Automated ABIS Deduplication & Zero-Trust KYC]
        │ ── Real-time biometric matching, civil registry cross-check
        ▼
[● Milestone 4: Smart Card Personalization & Chip Encoding]
        │ ── Laser engraving, National Gold BioSure ID (PNG-2026-XXXXXX)
        ▼
[● Milestone 5: Multi-Channel Possession & Everyday Utility]
        │ ── Post PNG dispatch, offline QR auth (zero-signal), banking KYC
```

### Visual Experience & Micro-Interactions
1. **Continuous SVG Connecting Thread**: A central vertical line with animated glowing SVG energy pulses that progress as the citizen scrolls down the thread.
2. **Step Number Badges with Status Beads**: Each milestone features an illuminated numbered node (`01`, `02`, `03`, `04`, `05`) that lights up in Civic Blue `#0052CC` with a subtle pulse when scrolled into view.
3. **Interactive Mini-Simulators on Alternate Sides (Desktop Zig-Zag)**:
   - **Milestone 1**: Interactive 6-digit OTP & mobile pass preview.
   - **Milestone 2**: Station queue simulation with interactive ICAO photo & fingerprint scanner.
   - **Milestone 3**: ABIS deduplication engine visualization with 99.8% match confidence meter.
   - **Milestone 4**: Holographic 3D tiltable BioSure smart card with gold national crest.
   - **Milestone 5**: Offline QR verification turnstile with instant green "AUTHENTICATED" badge.
4. **Actionable Call-to-Actions Along the Thread**:
   - Direct jump to *"Start Pre-Registration →"* at Milestone 1.
   - Direct jump to *"Find Nearest Center →"* at Milestone 2.
   - Direct jump to *"Track Application Status →"* at Milestone 5.

---

## 3. Detailed Milestone Specifications

| Step # | Milestone Title | Plain-Language Instructions | Interactive Visual Component |
| :---: | :--- | :--- | :--- |
| **01** | **Online Pre-Registration & Verification** | Complete personal demographics and upload civil certificates from any smartphone or computer in under 10 minutes. No photocopies or printing required. | Interactive OTP input card and upload preview chip showing real-time validation. |
| **02** | **Accredited Center Appointment & Biometrics** | Choose your nearest provincial enrollment station and pick a 30-minute arrival slot. Arrive with your QR fast-track booking pass for live 10-print fingerprint and high-res facial capture. | Calendar slot selector mock + simulated biometric hardware sensor reading. |
| **03** | **Zero-Trust ABIS Deduplication** | Automated Biometric Identification System cross-references national biometric enclaves to prevent identity duplication or fraud, guaranteeing each citizen exactly one sovereign ID. | ABIS matching algorithm visualizer with 1:N deduplication clearance meter. |
| **04** | **Laser Personalization & Cryptographic Keys** | Once approved, your BioSure ID number (`PNG-2026-XXXXXX`) is laser-engraved onto a tamper-resistant ISO 7816 smart card with an embedded cryptographic zero-trust chip. | Digital smart card mockup with reflective gold crest and encrypted QR token. |
| **05** | **Field Verification & Lifetime Civic Access** | Collect your card at the counter or receive via Post PNG Express. Authenticate offline at police checkpoints, ward councils, or commercial banks (e.g., BSP) without internet connectivity. | Offline QR verification scanner demonstrating instant offline cryptographic signature match. |

---

## 4. Technical Implementation Steps

### Phase 1: Core Roadmap Thread Component
- Create `resources/js/components/landing-roadmap-thread.tsx`:
  - Scroll observer hook tracking viewport scroll percentage through the section.
  - Responsive SVG path generating a fluid vertical thread with smooth bends and glowing particle animation.
  - Alternating layout (Left text / Right visual on desktop; stacked on mobile).

### Phase 2: Milestone Interactive Cards
- Build 5 dedicated micro-demonstration cards for each phase:
  1. `PreRegDemoCard`: Interactive SMS OTP & document preview.
  2. `BiometricDeskDemoCard`: Live sensor simulation and station appointment pass.
  3. `AbisEngineDemoCard`: Real-time cryptographic deduplication simulation.
  4. `BioSureCardDemoCard`: Interactive physical smart card with metallic sheen.
  5. `OfflineVerifierDemoCard`: Turnstile authentication demonstration.

### Phase 3: Integration into `welcome.tsx`
- Replace `DocumentConvergenceStage` in [resources/js/pages/welcome.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/Ma%27am%20Hannah/identriq/resources/js/pages/welcome.tsx) with the new `LandingRoadmapThread`.
- Connect navigation links:
  - Header *"Enrollment Process"* anchor smoothly jumps to the roadmap.
  - Action buttons inside the roadmap route to `/prereg`, `/centers`, and `/track`.

### Phase 4: Performance, Accessibility & Design Tokens
- Strict adherence to `DESIGN.md`:
  - Civic Blue `#0052CC` (`rgb(0, 82, 204)`)
  - Sovereign Navy `#0B192C` (`rgb(11, 25, 44)`)
  - National Gold `#C9A227` (`rgb(201, 162, 39)`)
- WCAG 2.2 AA contrast compliance on all labels.
- `prefers-reduced-motion` media query support (disables particle scroll animations and displays static glowing thread).
- Touch target sizing ≥ 44px on all interactive elements.

---

## 5. Verification & Testing Strategy
1. **Compilation Validation**:
   - Run `rtk pnpm build` to verify zero TypeScript errors or asset bundle bloat.
2. **Feature & Regression Tests**:
   - Run `rtk php artisan test` to confirm all 69 backend and Inertia routing tests pass.
3. **Responsive Visual Testing**:
   - Validate layout on mobile (375px), tablet (768px), and desktop (1280px+).
