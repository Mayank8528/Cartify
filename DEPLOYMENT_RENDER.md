Render deployment guide

This repo is configured to deploy frontend and backend separately on Render.

Backend (web service)
- Service name: choose `cartify-backend` (or your preferred name)
- Environment: Node
- Build command: `npm install`
- Start command: `npm run start`
- Health check path: `/health` (returns DB connection state)
- Set these environment variables in Render Dashboard -> Environment:
  - `MONGO_URI` (required)
  - `JWT_SECRET`
  - `PAYPAL_CLIENT_ID`, `PAYPAL_APP_SECRET`, `PAYPAL_API_URL`
  - `NODE_ENV=production`

Frontend (static site)
- Static site name: `cartify-frontend`
- Branch: `main` (or your deploy branch)
- Build command: `cd frontend && npm ci && npm run build`
- Publish directory: `frontend/build`
- Set env var `REACT_APP_API_URL` to your backend public URL (e.g. `https://cartify-backend.onrender.com`) if you want the frontend to call the backend directly.

Notes
- The frontend reads `REACT_APP_API_URL` at build time; set it via Render's static site env vars before triggering a deploy.
- The backend exposes `/health` for health checks and will retry DB connection on startup (development). In production Render will restart failed services automatically.
- For security, configure your MongoDB Atlas IP access and use Render's secrets to store `MONGO_URI` instead of committing it.

Quick local test

1. Start backend locally:
```bash
cd backend
npm run server
```

2. Start frontend locally (uses proxy for API during dev):
```bash
cd frontend
npm start
```

If you want, I can also create a GitHub Actions workflow to automatically set Render environment variables and trigger deploys — would you like that?
