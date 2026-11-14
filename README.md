# CivicConnect — AI-Powered Civic Issue Reporting & Resolution

CivicConnect is a production-grade full-stack civic technology platform connecting citizens, municipal field officers, and administrators through a transparent, accountable issue reporting and resolution system.

Citizens report civic problems (potholes, garbage overflow, broken streetlights, water leaks) with photos, location, and voice dictation. CivicConnect leverages **Google Gemini Vision AI** for automated classification and hazard scoring, **PostgreSQL (Neon / Supabase)** for structured state tracking, and **Citizen Community Sign-Off** for proof-of-fix verification.

---

## 🌍 System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │              React 19 + Vite 7 Frontend                │
               │   (Tailwind 4, Leaflet Maps, Three.js 3D, Web Speech)  │
               └───────────────────────────┬────────────────────────────┘
                                           │  HTTPS / REST (Axios + JWT)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │             Express 5.2 Backend API (ESM)              │
               │   (State Machine Engine, Haversine Spatial Clusters)   │
               └───────┬───────────────────┬────────────────────┬───────┘
                       │                   │                    │
                       ▼                   ▼                    ▼
             ┌──────────────────┐  ┌──────────────┐   ┌─────────────────┐
             │    PostgreSQL    │  │  Cloudinary  │   │  Google Gemini  │
             │ (Neon / Supabase)│  │ (CDN Images) │   │ Vision Analysis │
             └──────────────────┘  └──────────────┘   └─────────────────┘
```

---

## 🛠 Tech Stack

### Frontend (`client/`)
- **Core**: React 19, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7.
- **Mapping & Geolocation**: Leaflet & React-Leaflet with OpenStreetMap / Satellite layers and real-time device GPS positioning (`geolocation.js`).
- **Visuals & 3D**: Three.js WebGL canvas (`CivicIntroAnimation.jsx`), GSAP micro-interactions, Lucide React icons.
- **Features**: Voice-to-text dictation (Web Speech API), interactive before-and-after resolution slider (`BeforeAfterSlider.jsx`), official audit report dossier (`OfficialAuditReport.jsx`), dark/light theme toggle.
- **Detailed Documentation**: See [`client/view.md`](client/view.md) for the complete frontend blueprint and component tree.

### Backend (`server/`)
- **Runtime & API**: Node.js (ES Modules), Express 5.2.
- **Database**: PostgreSQL with connection pooling (`pg.Pool`), transaction safety (`withTransaction`), and schema migration tracking (`_schema_migrations`). Hosted on **Neon Serverless Postgres** (or Supabase).
- **AI Vision Engine**: Google Gemini Multimodal via `@google/genai` (auto-fallback chain: `gemini-flash-lite-latest`, `gemini-flash-latest`, `gemini-2.5-flash`).
- **Authentication**: Custom JWT (`jsonwebtoken`) + `bcryptjs` password hashing (cost factor 12) with role-based access control (`citizen`, `officer`, `admin`).
- **Storage**: Cloudinary image upload stream with automatic in-memory Base64 data URL fallback.
- **Deduplication**: Haversine formula calculation (`distanceMeters`) to flag nearby duplicates within spatial thresholds.

---

## ✨ Core Workflow

1. **Citizen Reports**: Citizen snaps a photo, adds description (typing or voice dictation), and captures GPS location.
2. **AI Visual Assessment**: Google Gemini Vision inspects the photo, detects objects and hazards, classifies the category, and calculates an initial severity score.
3. **Department Routing**: Automatically assigned to the appropriate municipal department (Public Works, Sanitation, Electricity, Water).
4. **Officer Lifecycle Management**: Field officer inspects the problem on the dashboard, updates status (`NEW` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLUTION_REVIEW`).
5. **Proof-of-Fix AI Audit**: Officer uploads completion photo; Gemini Vision compares before-and-after evidence to compute a verification match score.
6. **Citizen Community Sign-Off**: Local citizens confirm or dispute the resolution directly on the public issue timeline.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- A PostgreSQL database (e.g. free cloud database on [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` (refer to `server/.env.example`):

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
PORT=5000
CLIENT_URL=http://localhost:5173

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest

# Optional Cloudinary (Falls back to base64 if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run database migrations & seed demo accounts:

```bash
# Apply SQL migrations to your PostgreSQL database
npm run migrate

# Seed demo citizen, officer, admin users and sample civic issues
npm run seed

# Verify database tables
npm run db:check

# Start development API server
npm run dev
```

The API will be live at `http://localhost:5000`.

---

### 2. Frontend Setup

In a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civicconnect.demo` | `Demo@123` | Report issues, upvote, comment, track issues |
| **Officer** | `officer@civicconnect.demo` | `Demo@123` | Officer dashboard, assign issues, upload proof-of-fix |
| **Admin** | `admin@civicconnect.demo` | `Demo@123` | System metrics, all officer controls, administrative audit |

---

## 📦 Deployment Guide

### Recommended: Vercel (Frontend) + Render / Railway (Backend)

#### 1. Deploy Frontend on Vercel:
- Import your repository on [Vercel](https://vercel.com).
- Root Directory: `client`
- Framework Preset: `Vite`
- Environment Variables:
  - `VITE_API_URL`: `https://your-backend.onrender.com/api`
- *Note: `client/vercel.json` is included for SPA route rewrites.*

#### 2. Deploy Backend on Render / Railway:
- Create a New Web Service.
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, and `CLIENT_URL`.

---

## 📁 Repository Structure

```text
civic-connect/
├── client/                     # React 19 + Vite 7 Frontend
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Heritage & panorama visuals
│   │   ├── components/         # HeroMapWidget, RecentIssuesSection, BeforeAfterSlider, etc.
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # Home, ReportIssue, Issues, IssueDetails, Dashboard, Login, Register
│   │   ├── services/           # Speech-to-text service
│   │   ├── utils/              # Geolocation & image helpers
│   │   ├── api.js              # Axios instance with JWT interceptors
│   │   ├── App.jsx             # Routes & layout shell
│   │   └── main.jsx            # React root mount
│   ├── vercel.json             # SPA routing rewrite for Vercel
│   ├── view.md                 # Detailed Frontend Architecture Blueprint
│   └── view/                   # View assets & documentation directory
│
├── server/                     # Express 5.2 API Server
│   ├── config/                 # Database helper exports
│   ├── controllers/            # Auth controller
│   ├── db/
│   │   ├── migrations/         # 001_initial_schema, 002_resolution_image, 003_citizen_verification
│   │   └── index.js            # PostgreSQL pool configuration & transaction helpers
│   ├── middleware/             # requireAuth, requireRole, errorHandler
│   ├── routes/                 # /api/auth, /api/issues, /api/officer
│   ├── services/               # aiservice.js (Gemini Vision), phaseEngine.js, storage.js, notify.js
│   ├── check-tables.mjs        # Database diagnostic utility
│   ├── migrate.js              # Production migration runner
│   ├── seedUsers.js            # Initial user seed
│   ├── server.js               # Application startup entrypoint
│   └── vercel.json             # Serverless configuration
│
└── README.md                   # Main project documentation
```

---

## 📜 License

MIT License. Built for hackathons, smart city initiatives, and open civic collaboration.
