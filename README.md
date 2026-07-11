<div align="center">
  <img src="assets/PhytoNexus.gif" alt="PhytoNexus" width="470" style="border-radius:12px"/>
</div>

<br />

<div align="center">
<p>The Intelligent Botanical Diagnostic & Encyclopedia System — featuring image diagnostics, conversational AI, and the world's largest open botanical database.</p>
<br />

<a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-8B5CF6?style=flat-square&labelColor=1F2937" /></a>
&nbsp;
<a href="https://github.com/yuvanvishnupandi/phytonexus/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/yuvanvishnupandi/phytonexus?style=flat-square&color=F59E0B&labelColor=1F2937&label=Stars" /></a>
&nbsp;
<a href="https://github.com/yuvanvishnupandi/phytonexus/commits/main"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/yuvanvishnupandi/phytonexus?style=flat-square&color=22C55E&labelColor=1F2937&label=Last%20Commit" /></a>

</div>

---

<div align="center">

<table>
  <tr>
    <td><img src="assets/home.jpeg" width="400" style="border-radius:8px"/></td>
    <td><img src="assets/dashboard.png" width="400" style="border-radius:8px"/></td>
  </tr>
  <tr>
    <td><img src="assets/login.jpeg" width="400" style="border-radius:8px"/></td>
    <td><img src="assets/img1.jpeg" width="400" style="border-radius:8px"/></td>
  </tr>
  <tr>
    <td><img src="assets/img11.jpeg" width="400" style="border-radius:8px"/></td>
    <td><img src="assets/img12.jpeg" width="400" style="border-radius:8px"/></td>
  </tr>
</table>

</div>

---

## What you get

<div align="center">
<img src="assets/readme12.png" alt="PhytoNexus — overview" width="100%" />
</div>

<details>
<summary><b>See all features</b></summary>

<table>
<tr>
<td width="50%" valign="top">

#### 🤖 Multi-Agent AI Diagnostics

- **Vision Analysis** — Upload any plant photo for instant, high-accuracy disease and health diagnosis.
- **Agentic Debate Engine** — Multiple LLM agents debate the symptoms in real-time on your screen to reach an absolute consensus.
- **Treatment Synthesis** — Generates an actionable recovery plan for your specific plant.
- **Real-Time Terminal** — Watch the AI agents think, process, and debate live.

</td>
<td width="50%" valign="top">

#### 🌿 Botanical Encyclopedia

- **Global Database** — Access millions of records securely hooked into GBIF and Wikipedia.
- **Robust Searching** — Search by common name or scientific name.
- **Rich Media** — Instantly pulls massive high-res image galleries.
- **Taxonomy** — View exact Kingdom, Phylum, Order, Family, Genus, and Species metadata.

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### 💬 FloraAI Chatbot

- **Context-Aware** — A dedicated chatbot that remembers your diagnostic history and provides tailored advice.
- **Streaming Responses** — Instant, token-by-token streaming for a snappy, native feel.
- **Markdown & Code** — Fully supports rendering tables, lists, and formatted treatment regimens.

</td>
<td width="50%" valign="top">

#### 🔐 Secure & Modern Platform

- **JWT Authentication** — Fast, secure login and registration system.
- **Responsive PWA Design** — Looks stunning on Desktop, Tablet, and Mobile with zero scrollbar cutoffs.
- **Beautiful UI** — Designed with a premium, organic color palette, smooth gradients, and micro-animations.

</td>
</tr>
</table>

</details>

<br />

## Get started

```bash
git clone https://github.com/yuvanvishnupandi/phytonexus.git
cd phytonexus
```

Configure your MongoDB database and environment variables, then start the FastAPI backend and Vite frontend (see [Local Setup](#local-setup) below).

<br />

## Tech stack

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)

</div>

Frontend built on Vite + React. Styling via TailwindCSS. State management with React Context. Backend powered by Python/FastAPI with MongoDB (Motor). AI capabilities orchestrated using Google's Gemini and advanced LLM debate pipelines. Botanical data aggregated from GBIF and Wikipedia APIs.

<br />

<h2 id="architecture">🏛️ Overall system architecture</h2>

The application follows a modern decoupled architecture consisting of the React presentation layer, FastAPI backend, LLM services, and MongoDB database. Each component operates independently and communicates through REST APIs.

```mermaid
graph TD

subgraph Client["Client Layer"]
WebApp[React Web App]
end

subgraph Server["Application Layer"]
API[FastAPI Server]
AUTH[JWT Authentication]
end

subgraph AI["AI Service Engine"]
ORCH[Multi-Agent Orchestrator]
VISION[Vision Agent]
DEBATE[Debate Engine]
FLORA[FloraAI Chatbot]
end

subgraph Database["Database Layer"]
MYSQL[(MongoDB Atlas)]
end

WebApp --> API

API --> AUTH
API --> MYSQL
API --> ORCH

ORCH --> VISION
ORCH --> DEBATE
ORCH --> FLORA

VISION --> GeminiAPI[Gemini API]
DEBATE --> LLM_APIs[Gemini / External APIs]
```

<br />

## 🔄 Diagnostic processing workflow

The following sequence diagram illustrates how a plant image is processed from submission to full diagnosis.

```mermaid
sequenceDiagram

actor User
participant Frontend
participant Backend
participant AI
participant Database

User->>Frontend: Upload plant photo
Frontend->>Backend: Send image data
Backend->>AI: Trigger diagnostics pipeline
AI->>AI: Vision Agent analyzes symptoms
AI->>AI: Debate Agents discuss findings
AI->>AI: Reach diagnostic consensus
AI-->>Backend: Return treatment plan
Backend->>Database: Save diagnosis history
Backend-->>Frontend: Stream results to UI
Frontend-->>User: Display plant health report
```

<br />

## 🔄 Core data flow

1. User uploads a plant image or searches the encyclopedia.
2. The React frontend forwards the request to the FastAPI backend.
3. The Vision Agent extracts visual symptoms and health indicators.
4. The Debate Engine cross-references findings and agrees on the disease.
5. The processed diagnosis is stored in MongoDB.
6. The user receives a comprehensive, formatted treatment plan.

<br />

<h2 id="multi-agent-ai-engine">🧠 Multi-agent AI engine</h2>

The AI service is designed as a collection of specialized agents. Each agent performs a dedicated task, allowing the system to process reports in a structured manner.

<details>
<summary><b>See all agents</b></summary>

<br />

- **Vision Agent**
  - Extracts symptoms and plant species directly from uploaded photos.

- **Debate Engine**
  - Multiple LLMs converse to eliminate false positives and finalize a diagnosis.

- **Treatment Synthesizer**
  - Converts the debated consensus into a clear, step-by-step recovery guide.

- **FloraAI Assistant**
  - Answers user queries regarding plant care and historical diagnostics.

</details>

<br />

<h2 id="local-setup">🚀 Local setup</h2>

### Prerequisites

- Node.js 18 or later
- Python 3.9 or later
- MongoDB Atlas account

### Clone repository

```bash
git clone https://github.com/yuvanvishnupandi/phytonexus.git
cd phytonexus
```

<details>
<summary><b>Backend setup</b></summary>

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

</details>

<details>
<summary><b>Frontend setup</b></summary>

```bash
cd frontend
npm install
npm run dev
```

</details>

<br />

<h2 id="environment-variables">Environment variables</h2>
<details>
<summary><b>Full reference</b></summary>

<br />

> Template based on the services in use — confirm exact variable names against your `.env.example` files before deploying.

| Variable | Description | Where |
|----------|-------------|-------|
| `MONGODB_URI` | MongoDB connection string | `backend/.env` |
| `GEMINI_API_KEY` | Google Gemini API key for the Vision Agent | `backend/.env` |
| `CORS_ORIGINS` | Allowed frontend origins (e.g. `http://localhost:5173`) | `backend/.env` |
| `VITE_API_BASE_URL` | Base URL the frontend uses to call the backend API | `frontend/.env` |

</details>

<br />

## Data & storage

- **Database** — MongoDB Atlas
- **Uploads** — Plant images processed securely
- **Hosting** — frontend on Vercel, backend on Render

<br />

## License

PhytoNexus is [MIT licensed](LICENSE).
