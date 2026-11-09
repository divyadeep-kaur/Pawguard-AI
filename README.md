# 🐾 PawGuard AI

Help stray animals faster: scan a photo for AI first-aid guidance, file a geo-tagged rescue report, follow cases on a live map, and adopt rescued animals.

## Run it

```bash
python3 backend/app.py        # or: npm start
# open http://localhost:3000
```

No dependencies to install (Python 3 standard library only). The map and fonts load from public CDNs and degrade gracefully when offline.

### Enable real AI (optional)

```bash
export GEMINI_API_KEY="your-key"     # optional: GEMINI_MODEL (default gemini-2.5-flash)
python3 backend/app.py
```

Without a key, the scanner and chatbot run in **demo mode** and say so in the UI. Scanner results in demo mode are samples, not analysis of your photo.

## Deploy on Vercel (or any static host)

`vercel.json` serves `public/`. Vercel can't run the Python server, so the site detects that `/api` is missing and switches to **demo mode** automatically: seeded sample reports from `public/data/`, with anything a visitor adds saved in their own browser only. For real shared data and live AI, host `backend/app.py` on a Python-capable host (Render, Railway, Fly.io) or port the API to serverless functions plus a database.

## Features
- **AI scan**: upload or take a photo, get species, likely condition, severity and first-aid steps.
- **Rescue reports**: validated form with GPS capture; live queue with filters.
- **Live map**: Leaflet map coloured by urgency, linked with the queue.
- **Impact dashboard**: all figures computed from stored reports.
- **Adoption**: pet profiles and adoption requests saved to the backend.
- **Assistant**: first-aid and adoption chatbot.

## Layout
```
public/    index.html, style.css, app.js   (static site, no build step)
backend/   app.py + services/              (REST API, JSON file storage)
backend/src/data/*.json                    seed data (runtime copies *_active.json are git-ignored)
```

## API
`GET /api/rescue-reports` · `POST /api/rescue-reports` · `PUT /api/rescue-reports/:id` · `GET /api/analytics` · `POST /api/adoption/requests` · `POST /api/scan-animal` · `POST /api/chat` · `GET /api/health`

*AI output is guidance only and not a substitute for a veterinarian. In India, the animal helpline is 1962 (availability varies by state).*
