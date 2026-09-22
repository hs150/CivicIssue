# CivicConnect — Crowdsourced Civic Issue Reporting & Resolution

A hackathon-ready full-stack prototype based on the supplied system architecture.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB/Mongoose (optional demo moe included)
- Authentication: JWT + bcrypt
- Images: Cloudinary in production, in-memory data URLs in demo mode
- Maps: Leaflet + OpenStreetMap
- Notifications: Nodemailer/email when configured
- Deployment: Vercel (frontend) + Render/Railway (backend)

## Core flow

Citizen → Report issue → Photo + location → MongoDB → Officer dashboard → Assign/update status → Citizen tracking → Resolution notification.

## Features

- Registration/login with citizen, officer and admin roles
- JWT authentication
- Civic issue reporting
- Image upload
- Interactive Leaflet map and browser geolocation
- Categories and automatic department routing
- Priority scoring
- Nearby duplicate/similar issue detection
- Public issue feed
- Issue details with status timeline
- Comments
- Upvotes
- Officer dashboard
- Officer assignment and status updates
- Resolution notes
- Email notifications when SMTP is configured
- Demo mode: the project runs without MongoDB or Cloudinary
- Responsive mobile-first UI

## 1. Run backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The API starts at `http://localhost:5000`.

If `MONGO_URI` is empty, the backend automatically runs in DEMO MODE using in-memory data.

## 2. Run frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

The frontend expects:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo accounts

When the backend starts in demo mode it creates:

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@civicconnect.demo | Demo@123 |
| Officer | officer@civicconnect.demo | Demo@123 |
| Admin | admin@civicconnect.demo | Demo@123 |

## MongoDB mode

Set `MONGO_URI` in `server/.env`.

Example:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/civicconnect
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Then restart the backend.

## Cloudinary mode

Set:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

If these are missing, demo mode stores uploaded images as temporary data URLs instead.

## Email mode

Set SMTP variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@example.com
```

Email failures do not block issue creation.

## Production checklist

Before using this beyond a hackathon:

- Use HTTPS everywhere.
- Use a strong random JWT secret.
- Add rate limiting.
- Add stricter file validation and malware scanning.
- Add request validation with a schema library.
- Add audit logs.
- Configure MongoDB backups.
- Restrict CORS to the production frontend.
- Keep Cloudinary/SMTP secrets server-side.
- Add privacy/retention policy.
- Consider PostGIS or MongoDB geospatial indexes for large-scale proximity queries.
- Consider Open311 GeoReport v2 integration for municipal interoperability.

## API overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Issues

- `GET /api/issues`
- `GET /api/issues/:id`
- `POST /api/issues`
- `PATCH /api/issues/:id`
- `POST /api/issues/:id/upvote`
- `GET /api/issues/:id/comments`
- `POST /api/issues/:id/comments`

### Officer

- `GET /api/officer/stats`
- `GET /api/officer/issues`
- `PATCH /api/officer/issues/:id`

### Health

- `GET /api/health`

## Suggested hackathon demo

1. Login as the citizen.
2. Report a pothole with a photo and map location.
3. Open the issue and show its `NEW` status.
4. Login as the officer.
5. Assign the issue and change it to `IN_PROGRESS`.
6. Add a resolution note and mark it `RESOLVED`.
7. Return to the citizen view and show the timeline.
8. Demonstrate upvotes/comments and the dashboard statistics.
