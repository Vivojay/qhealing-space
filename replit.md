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

Endpoints:
- `GET /api/health` — service & integration status
- `GET /api/instagram/reels?limit=N` — latest media for `INSTAGRAM_BUSINESS_ACCOUNT_ID` via Graph API. Cached 10 min.
- `POST /api/newsletter/subscribe` `{ email, source? }` — writes to Firestore `newsletter_subscribers` collection.

Required environment secrets:
- `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON of a service account key) + `FIREBASE_PROJECT_ID`
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID` (long-lived Page/IG access token + numeric IG business account id)

## Project Structure
```
├── backend/
│   └── main.py                # FastAPI app (health, instagram, newsletter)
├── src/
│   ├── components/
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
