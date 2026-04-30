# SmartRoute AI (React + Spring Boot + MySQL + PWA)

Production-ready scaffold for a **Smart Traffic Prediction & Route Optimization PWA**:

- Frontend: **React + TypeScript + Tailwind CSS + PWA**
- Backend: **Java Spring Boot + JWT (cookie-based) + MySQL**
- Integrations (placeholders): **TomTom (routing/search/traffic), Mapbox (geocoding/directions)**
- Auth: **JWT**, **email reset link** (SMTP via Spring Mail)

UI reference: [SmartRoute AI deployed app](https://traffic-prediction-and-route-recomm.vercel.app/)

## Folder Structure

- `backend/` Spring Boot API (`/api/auth/*` implemented)
- `frontend/` React PWA
- `docker-compose.yml` MySQL for local development

## Prerequisites

- Node.js (for frontend)
- Java 17 + Maven (for backend)
- MySQL (optional if using Docker Compose)

## Setup (Local)

1. Copy env:
   - `cp .env.example .env`
2. Export env vars (zsh):
   - `set -a; source .env; set +a`
3. Start MySQL:
   - `docker compose up`
4. Backend:
   - `cd backend`
   - `mvn spring-boot:run`
5. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Frontend default:
- `http://localhost:5173`
Backend default:
- `http://localhost:8080`

If you want React to use a different backend URL, create `frontend/.env` with:
`VITE_API_URL=http://localhost:8080`

## Auth Flow (Implemented)

- `POST /api/auth/signup` -> create account
- `POST /api/auth/login` -> sets JWT cookies
- `POST /api/auth/forgot-password` -> sends reset link via SMTP
- `POST /api/auth/reset-password` -> resets password and re-authenticates
- `GET /api/auth/me` -> returns logged-in user (for protected routes)

## PWA

Frontend is configured with `vite-plugin-pwa` (offline caching + install prompt).

## Next Implementation Steps

This scaffold wires up the premium auth + protected dashboard shell. Next we should add:

- Destination autocomplete (Mapbox/TomTom proxy endpoints)
- Route recommendation + alternate routes (TomTom Routing API)
- Turn-by-turn navigation + off-route recalculation
- Alerts (accident/construction/heavy traffic) + congestion prediction
- Persist `RouteHistory` and `RecentSearches`

