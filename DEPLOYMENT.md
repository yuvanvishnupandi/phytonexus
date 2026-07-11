# Deployment Guide

## 1. MongoDB Atlas

Create a MongoDB Atlas database and copy the connection string. In Atlas Network Access, allow Render's outbound access. For a simple demo, you can allow `0.0.0.0/0`, but restrict it for production.

## 2. Render Backend

Create a new Render Web Service:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Python version: 3.11+

Set environment variables in Render:

```txt
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_atlas_uri
MONGODB_DB_NAME=plant_lifecycle_predictor
OPENAI_VISION_MODEL=gpt-4o-mini
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

Do not paste keys into source files. Render has a dedicated Environment tab for secrets.

After deploy, test:

```txt
https://your-render-service.onrender.com/health
```

## 3. Vercel Frontend

Import the GitHub repo into Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set environment variable:

```txt
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Deploy. The frontend will call the Render backend.

## 4. GitHub

Push the project to GitHub after confirming `.env` files are not tracked:

```bash
git status
```

The repository should contain `.env.example` files, not real secrets.
