<div align="center">

# 🪴 PhytoNexus

**The Intelligent Botanical Diagnostic & Encyclopedia System**

A self-hosted, multi-agent AI travel planner for your plants — featuring image diagnostics, conversational AI, and the world's largest open botanical database.

<br />

<a href="https://github.com/yuvanvishnupandi/phytonexus"><img alt="Demo" src="https://img.shields.io/badge/Demo-try-111827?style=for-the-badge" /></a>
&nbsp;
<a href="https://github.com/yuvanvishnupandi/phytonexus"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" /></a>
&nbsp;
<a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-6B7280?style=flat-square" /></a>

</div>

---

<div align="center">

<!-- Screenshot Banner -->
<img src="assets/readme12.png" alt="PhytoNexus Overview" width="100%" />

</div>

<br />

<div align="center">
  <!-- Screenshots -->
  <a href="#"><img src="assets/home.jpeg" alt="Home Screen" width="49%" /></a>
  <a href="#"><img src="assets/dashboard.png" alt="Multi-Agent Diagnostics" width="49%" /></a>
  <a href="#"><img src="assets/login.jpeg" alt="Login Portal" width="49%" /></a>
  <a href="#"><img src="assets/img1.jpeg" alt="Features Preview" width="49%" /></a>
</div>

---

## System Architecture

```mermaid
graph TD
    subgraph Frontend [React / Vite Frontend]
        UI[User Interface]
        State[Zustand State Management]
        AuthUI[JWT Auth Context]
    end

    subgraph Backend [Node.js / Express Backend]
        API[Express REST API]
        Auth[Auth Middleware]
        AgentOrch[Multi-Agent Orchestrator]
    end

    subgraph AI_Services [AI & External APIs]
        Vision[Gemini 1.5 Vision]
        Chat[Gemini 1.5 Flash]
        Debate[LLM Debate Engine]
        Wiki[Wikipedia API]
        GBIF[GBIF Global Database API]
    end

    subgraph Database [Data Layer]
        Mongo[(MongoDB)]
    end

    UI -->|HTTP/REST| API
    UI -->|WebSockets| AgentOrch
    API --> Auth
    Auth --> Mongo
    AgentOrch --> Vision
    AgentOrch --> Debate
    UI --> Wiki
    UI --> GBIF
```

---

## What you get

<details open>
<summary><b>See all features</b></summary>

<table>
<tr>
<td width="50%" valign="top">

#### 🤖 Multi-Agent AI Diagnostics

- **Vision Analysis** — Upload any plant photo for instant, high-accuracy disease and health diagnosis.
- **Agentic Debate Engine** — Multiple LLM agents debate the symptoms in real-time on your screen to reach an absolute consensus.
- **Treatment Synthesis** — Generates a beautifully formatted, actionable recovery plan for your specific plant.
- **Real-Time Terminal** — Watch the AI agents think, process, and debate live.

</td>
<td width="50%" valign="top">

#### 🌿 Botanical Encyclopedia

- **Global Database** — Access millions of records securely hooked into GBIF and Wikipedia.
- **Robust Searching** — Search by common name (e.g. "Oak Tree") or scientific name.
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

## Tech stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)

</div>

Frontend built on Vite + React. Styling via TailwindCSS. State management with React Hooks. Backend powered by Node.js/Express with MongoDB. AI capabilities orchestrated using Google's Gemini Models. Botanical data aggregated from GBIF and Wikipedia APIs.

<br />

## Get started

### 1. Clone the repository
```bash
git clone https://github.com/yuvanvishnupandi/phytonexus.git
cd phytonexus
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend server:
```bash
npm start
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

Open `http://localhost:5173` to explore PhytoNexus.

<br />

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Set the Framework Preset to `Vite`.
4. Set the Root Directory to `frontend`.
5. Add the `VITE_API_URL` environment variable pointing to your deployed backend.
6. Deploy!

### Backend (Render / Heroku)
1. Create a new Web Service on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
7. Deploy!

---

## License

PhytoNexus is licensed under the MIT License.
