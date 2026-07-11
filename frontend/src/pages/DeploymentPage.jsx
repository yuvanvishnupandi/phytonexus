import { Cloud, Database, KeyRound, Server } from "lucide-react";

const items = [
  ["Render backend", "Deploy the FastAPI service from the backend folder using uvicorn and Render environment variables.", Server],
  ["Vercel frontend", "Deploy the React app from the frontend folder and set VITE_API_BASE_URL to the Render URL.", Cloud],
  ["MongoDB Atlas", "Store analysis reports in a cloud collection without saving image files locally.", Database],
  ["Secrets", "Keep OpenAI and MongoDB credentials in environment variables only. Never commit .env files.", KeyRound]
];

export default function DeploymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-clay">Deployment</p>
        <h1 className="mt-1 text-3xl font-semibold">Render + Vercel ready</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The project is structured for a real client-server deployment with separate frontend and backend services.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {items.map(([title, body, Icon]) => (
          <article key={title} className="rounded-lg border border-line bg-panel p-5 shadow-sm">
            <Icon size={24} className="mb-4 text-sage" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-panel p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Required environment variables</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-surface p-4 text-sm text-muted">
{`OPENAI_API_KEY=your_key
OPENAI_VISION_MODEL=gpt-4o-mini
MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=plant_lifecycle_predictor
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173`}
        </pre>
      </section>
    </div>
  );
}
