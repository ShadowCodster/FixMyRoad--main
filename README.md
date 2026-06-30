# FixMyRoad (RoadWatch)

RoadWatch is a civic road-monitoring platform for Bengaluru's BBMP road network. Citizens can tap a road on a map to see its health, budget, and repair history, file AI-assisted pothole/damage complaints with photo evidence, and track complaint resolution. Authorities get a panel to log repairs, and a public leaderboard tracks contractor accountability.

## Features

- **Tap-a-Road map** — Leaflet/OpenStreetMap view; tap any road to see its details
- **Road health score** — live-computed from complaints, repair history, and budget usage
- **Budget trail** — sanctioned vs. released vs. spent, with anomaly flags
- **Repair timeline** — built / repaired / complaint events per road
- **AI-powered complaints** — upload a photo, a YOLO model detects potholes/cracks, assigns severity, SLA, and routes to the right authority
- **Complaint tracking** — track status by complaint ID
- **Contractor leaderboard** — accountability based on complaint volume
- **Authority panel** — authenticated authorities/admins log repairs
- **Auth** — citizen / authority / admin roles with JWT login

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, React Router, Leaflet / react-leaflet |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT auth (python-jose, passlib) |
| ML | Ultralytics YOLO (pothole/crack detection), Pillow |
| Database | PostgreSQL (`backend/data/`) |

## Project Structure

```
FixMyRoad--main/
├── backend/            FastAPI app, ML model, database scripts
│   ├── app/
│   │   ├── core/       config, db connection, security, auth deps
│   │   ├── models/     SQLAlchemy models (road, complaint, user, ...)
│   │   ├── routers/    API routes (auth, roads, complaints, ...)
│   │   ├── schemas/    Pydantic schemas
│   │   ├── services/   business logic
│   │   └── ml/         YOLO analyzer + bundled weights
│   ├── data/           schema.sql, CSV source data, loader script
│   ├── main.py         FastAPI entrypoint
│   └── requirements.txt
├── frontend/           React + Vite app
│   ├── src/
│   └── package.json
└── API_GUIDE_for_frontend.md   Full API reference
```

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** (local or remote instance)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/ShadowCodster/FixMyRoad--main.git
cd FixMyRoad--main
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see `backend/.env` for the format expected):

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/roadwatch
JWT_SECRET_KEY=change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Set up the database (see `backend/data/README.md` for full detail):

```bash
psql -U postgres -c "CREATE DATABASE roadwatch;"
psql -U postgres -d roadwatch -f backend/data/schema.sql
python backend/data/load_roads.py --db roadwatch --user postgres --password yourpassword
```

Run the API:

```bash
uvicorn main:app --reload
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:5173`.

## Downloading dependencies

Everything needed to install dependencies is already declared in the repo:

- **Python packages** → `backend/requirements.txt` — install with `pip install -r backend/requirements.txt`
- **Node packages** → `frontend/package.json` (+ `frontend/package-lock.json`) — install with `npm install` inside `frontend/`

A combined, copy-pasteable list of every package is in [`DEPENDENCIES.md`](./DEPENDENCIES.md), in case you want to install everything manually or in a fresh environment.

## API Reference

See [`API_GUIDE_for_frontend.md`](./API_GUIDE_for_frontend.md) for the full endpoint reference (auth, roads, complaints, authorities, contractors, dashboard, AI analysis).

## License

No license specified — check with the repository owner before reuse.
