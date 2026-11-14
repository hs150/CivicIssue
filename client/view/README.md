# CivicConnect View Directory (`client/view/`)

This directory contains the architectural documentation, design specifications, and visual blueprints for the **CivicConnect** frontend application.

### Contents:
- **`view.md`** (also mirrored at `client/view.md`): The comprehensive master blueprint detailing:
  - High-level architecture & tech stack (React 19, Vite 7, Tailwind CSS v4, Leaflet, Three.js, GSAP, Web Speech API).
  - Program execution flow & global Context lifecycles (`AuthContext`, `ThemeContext`, `ToastContext`).
  - Exhaustive 18-component feature catalog detailing layout roles, user interaction controls, and state management.
  - Page-by-page visual breakdown across all 8 routes.
  - End-to-end user interaction walkthroughs:
    - **Citizen Journey**: Intake, live camera capture, Gemini Vision AI suggestions, bilingual voice dictation, GPS pinning, duplicate prevention, optimistic upvoting, before/after proof slider inspection, and dispute arbitration.
    - **Municipal Field Officer Journey**: Command center telemetry, automated nearest-neighbor TSP route optimizer, phase transitions, proof-of-fix photo upload, and multimodal AI verification.
    - **Municipal Administrator / Auditor Journey**: Official Resolution Certificate generation and tamper-proof anti-corruption audit trails.
  - Monochrome design language and semantic urgency color system.
