# RoadWatch Frontend

React + Vite frontend for the RoadWatch (FixMyRoad) civic road monitoring platform.

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:8000` (see `../backend/`)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public city dashboard with condition stats |
| `/map` | Tap-a-Road map — click to find nearby roads |
| `/roads/:slNo` | Full road detail — budget, health, timeline |
| `/complaint` | AI-powered complaint submission (login required) |
| `/track` | Track complaint by ID |
| `/contractors` | Contractor accountability leaderboard |
| `/authorities` | Complaint routing authorities |
| `/authority` | Authority panel — log repairs (authority/admin) |
| `/login`, `/signup` | Authentication |

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet / react-leaflet (OpenStreetMap)
