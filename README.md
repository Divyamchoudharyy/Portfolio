# Divyam Choudhary — AI Engineering Portfolio

A monochrome, responsive portfolio built with React and Vite. ORBIT is the flagship project, with Locust Watch and Drug Discovery AI supporting the wider AI engineering story. The site includes a Groq-powered portfolio assistant backed by lightweight BM25 retrieval over curated profile and project notes. Retrieval prioritizes the latest standalone question, preserves previous context only for clear follow-ups, and formats Markdown responses safely in the React UI.

## Run the frontend locally

Requirements: Node.js 20+

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). The visual portfolio works in Vite dev mode. To test the `/api/ask` serverless function locally, use Vercel's development server as described below.

## Configure the AI assistant

1. Create a Groq API key in the [Groq Console](https://console.groq.com/keys).
2. Copy `.env.example` to `.env.local`.
3. Add your key:

```env
GROQ_API_KEY=your_groq_api_key_here
# Optional: the default is openai/gpt-oss-120b
GROQ_MODEL=openai/gpt-oss-120b
```

Keep `.env.local` private. It is excluded from Git. Never put the Groq key in a `VITE_` variable or frontend code.

## Test the full app locally (including the API)

Vercel's local development server runs both Vite assets and the `/api/ask` function:

```bash
npx vercel dev
```

When prompted, link the local folder to a Vercel project or choose a local development setup. Make sure `.env.local` contains `GROQ_API_KEY` before testing the assistant.

## Production build

```bash
npm run build
npm run preview
```

The static frontend is generated in `dist/`. The `/api/ask` endpoint is deployed as a Vercel Node.js Function.

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: **Vite** (Vercel should detect it automatically).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. In Vercel → Project → Settings → Environment Variables, add `GROQ_API_KEY`. Optionally add `GROQ_MODEL`.
7. Redeploy after setting environment variables.

Vercel automatically detects the `api/ask.js` serverless function. No Groq key is exposed to the browser.

## AI assistant architecture

```text
Browser chat
    ↓ POST /api/ask
Vercel Function
    ↓
BM25 retrieval over curated portfolio notes
    ↓
Groq Chat Completions API (streaming)
    ↓
Server-sent event stream back to the browser
```

The assistant is intentionally constrained to the supplied portfolio notes. It should state when a requested detail is not present rather than inventing an achievement or project capability. Before promoting the endpoint publicly, add a shared rate limiter (for example, Upstash Redis) and usage monitoring; request validation alone is not a distributed abuse or cost-control layer.

## Update portfolio content

- Profile links, email and location: `src/App.jsx` → `PROFILE`.
- Project descriptions, links and metrics: `src/App.jsx` → `projects`.
- Skills: `src/App.jsx` → `skillGroups`.
- Assistant knowledge base and retrieval: `api/ask.js` → `KNOWLEDGE` and `retrieve()`.

ORBIT is included as the flagship project independently of the current résumé PDF. Add it to the résumé once its project entry is updated.
