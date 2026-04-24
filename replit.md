# Serenity Wellness Website

## Overview
A beautiful React-based wellness website featuring a modern design with smooth animations and elegant UI components.

## Tech Stack
- **Frontend Framework**: React 19.x with Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Python 3.11 + FastAPI + Uvicorn (port 8000)
- **Database**: Firebase Firestore (via firebase-admin server SDK only — no Firebase JS SDK in frontend)
- **Instagram**: Instagram Graph API v21.0 (server-side, 10-min in-memory cache)

## Backend
The Python FastAPI backend lives in `backend/main.py` and is proxied by Vite under `/api`.

Public endpoints:
- `GET /api/health` — service & integration status
- `GET /api/instagram/reels?limit=N` — latest media for `INSTAGRAM_BUSINESS_ACCOUNT_ID` via Graph API. Cached 10 min. Respects admin curation if set.
- `GET /api/config` — public site config (instagram handle, contact details, section toggles)
- `POST /api/newsletter/subscribe` `{ email, source? }` — writes to Firestore `newsletter_subscribers` collection.

Admin endpoints (Bearer token from `/api/admin/login`, HMAC-signed, 12 h TTL):
- `POST /api/admin/login` → `{ token, expires_at }`
- `GET /api/admin/me`, `GET /api/admin/metrics`
- `GET /api/admin/instagram`, `POST /api/admin/instagram/refresh`
- `GET|PUT /api/admin/instagram/curation` — pick the IG posts shown on the home grid
- `GET|DELETE /api/admin/newsletter/subscribers[/{email}]`, `GET /api/admin/newsletter/export` (CSV)
- `GET|PUT /api/admin/config`

Required environment secrets:
- `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON of a service account key) + `FIREBASE_PROJECT_ID`
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID` (long-lived Page/IG access token + numeric IG business account id)
- `ADMIN_PASSWORD` — required to enable the admin dashboard at `/admin`
- `ADMIN_TOKEN_SECRET` (optional) — extra HMAC pepper for admin tokens

## Project Structure
```
├── backend/
│   └── main.py                # FastAPI app (health, instagram, newsletter, admin)
├── src/
│   ├── components/
│   │   ├── admin/                        # Admin dashboard at /admin
│   │   │   ├── api.js                    # token + fetch helpers
│   │   │   ├── AdminLayout.jsx           # sidebar shell
│   │   │   ├── AdminLogin.jsx            # password form
│   │   │   ├── AdminOverview.jsx         # metrics + system status
│   │   │   ├── AdminInstagram.jsx        # curate which reels show on home
│   │   │   ├── AdminNewsletter.jsx       # subscribers table + CSV export
│   │   │   └── AdminSettings.jsx         # site config editor
│   │   └── wellness/
│   │       ├── AboutSection.jsx
│   │       ├── Footer.jsx                # includes NewsletterSignup pill above © bar
│   │       ├── HeroSection.jsx
│   │       ├── InstagramReelsGrid.jsx    # 2×4 brick-offset grid, server-fed
│   │       ├── MediaCarousel.jsx
│   │       ├── NewsletterSignup.jsx      # thin full-width rounded-full pill
│   │       ├── ServicesSection.jsx
│   │       └── TestimonialsMarquee.jsx
│   ├── pages/
│   │   ├── Admin.jsx                     # /admin/* router (login + tabs)
│   │   └── Home.jsx
│   ├── utils/
│   │   └── index.js
│   ├── Layout.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js   # /api → 127.0.0.1:8000 proxy
└── package.json
```

## Running the Project
The development server runs on port 5000:
```
npm run dev
```

## Building for Production
```
npm run build
```

## Features
- Responsive sidebar navigation with hover expansion
- Hero section with animated elements
- Media carousel with image/video support
- Services grid with hover effects
- Philosophy section with numbered tenet rows (01–06) and an explicit "Read the philosophy" pill that rotates a chevron and reveals the long copy on hover/focus
- Instagram reels grid: 2-column brick-offset layout, varying heights (portrait / shorter portrait), muted autoplay-loop video, type-icon (Film / Image / Carousel) in the top-right, click opens the official Instagram permalink in a new tab
- Newsletter signup: thin full-width rounded-full pill in the footer (just above the © bar), validates email, posts to backend, writes to Firestore
- Testimonials marquee with infinite scroll
- Modern footer with contact information
- **Admin dashboard at `/admin`**: password-gated, HMAC bearer-token sessions (12 h). Tabs: Overview (metrics + system status), Instagram (pick & reorder which posts appear on the homepage, refresh from IG, drag-to-reorder, max 8), Newsletter (search, remove subscribers, CSV export), Settings (site-wide config: handle, contact info, section toggles)
