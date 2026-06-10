# Stalker IPTV to M3U Converter

A web application to convert Stalker IPTV portal subscriptions to M3U playlist format.

## Project Structure

- `frontend/` - React + Vite frontend application
- `backend/` - FastAPI Python backend with SQLite database
- `api/` - Vercel serverless function adapter

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## Vercel Deployment

This project is configured for deployment on Vercel.

### Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

### Deployment Steps

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Environment Variables (Optional):**
   - The backend uses SQLite for data storage
   - In Vercel serverless environment, the database is stored in `/tmp/app.db`
   - **Note:** Data in `/tmp` is not persistent across deployments. For production use, consider:
     - Using Vercel Postgres
     - Using an external database service (Supabase, PlanetScale, etc.)
     - Implementing a cloud storage solution

### Database Considerations

The current implementation uses SQLite with the following behavior:
- **Local development:** Persistent storage in `backend/data/db/app.db`
- **Vercel deployment:** Temporary storage in `/tmp/app.db` (cleared on redeployment)

For production deployment with persistent data, you should:
1. Set up Vercel Postgres or another cloud database
2. Modify `backend/main.py` to use the cloud database connection
3. Update the database helper functions accordingly

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/data` - RPC endpoint for backend functions

### Frontend Configuration

The frontend is configured to:
- Build from the `frontend/` directory
- Output to `frontend/dist/`
- Serve static files via Vercel

## Features

- Save and manage IPTV portal subscriptions
- Test portal connections
- Convert Stalker portal playlists to M3U format
- Sort channels by category
- Modern React UI with Tailwind CSS

## License

MIT
