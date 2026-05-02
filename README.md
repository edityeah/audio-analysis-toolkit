# Audio Analysis Toolkit

A web app for transcribing and analyzing audio — speaker labels, sentiment, topics, summary, and an Ask-Anything chatbot — powered by [AssemblyAI](https://www.assemblyai.com/).

🌐 Live: **https://toolkit.adityeah.in**

Every signed-in user gets **10 free minutes of transcription per 30-day window** — no credit card.

---

## ✨ What it does

- **Transcription** with timestamps across mp3, wav, m4a, mp4, flac
- **Speaker detection** (auto diarization)
- **Sentiment analysis** per utterance (positive / neutral / negative)
- **Auto-summary** of the full recording
- **Topic detection** (IAB categories)
- **Ask-Anything chat** over the transcript (powered by AssemblyAI Lemur + Claude)

Two ways to feed it audio:

- **Upload** an audio file (up to 10 min)
- **Record live** in your browser via the mic

---

## 🏗️ Architecture

```
                ┌─────────────────────────────────────┐
toolkit.adityeah│  Next.js (App Router) on Vercel     │
                │  • Landing, auth, onboarding,       │
                │    dashboard, /app analysis surface │
                └────────────┬────────────────────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        │                    │                        │
        ▼                    ▼                        ▼
   ┌─────────┐        ┌─────────────┐        ┌──────────────┐
   │  Clerk  │        │  Vercel Blob│        │ Neon Postgres│
   │ (auth)  │        │ (audio CDN) │        │ (users +     │
   │         │        │             │        │  transcripts)│
   └─────────┘        └─────┬───────┘        └──────────────┘
                            │
                            ▼  signed audio_url
                      ┌──────────────┐
                      │  AssemblyAI  │
                      │  (transcribe │
                      │   + Lemur)   │
                      └──────────────┘
```

**Stack**

- **Next.js 16** (App Router, React 19, Turbopack, Tailwind v4) — `web/`
- **Clerk** — Google SSO + email-OTP authentication
- **Neon Postgres** + **Drizzle ORM** — users, transcripts, quota tracking
- **Vercel Blob** — direct browser-to-CDN audio uploads (bypasses serverless body limits)
- **AssemblyAI** — transcription, diarization, sentiment, topics, summarization, Lemur chat

---

## 🧰 Local development

You'll need: Node 20+, a Clerk app, a Neon project, a Vercel Blob token, and an AssemblyAI API key.

```bash
cd web
npm install
```

Create `web/.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
CLERK_SECRET_KEY=sk_test_…
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
DATABASE_URL=postgresql://…@…neon.tech/neondb?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_…
ASSEMBLYAI_API_KEY=…
```

Bootstrap the DB schema in your Neon SQL editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  purpose TEXT,
  window_started_at TIMESTAMPTZ,
  seconds_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assemblyai_id TEXT NOT NULL UNIQUE,
  file_name TEXT,
  source TEXT NOT NULL,
  audio_duration_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  debited INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_assemblyai_id ON transcripts(assemblyai_id);
```

Then:

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Repo layout

```
.
├── web/             ← The Next.js app (everything user-facing)
├── legacy/          ← Original Streamlit + MCP-server prototype (no longer deployed)
├── README.md
└── .gitignore
```

---

## 📬 About

Built by **Aditya Chaudhari**.

- 🔗 Blog: https://news.adityeah.in/
- 💼 LinkedIn: https://www.linkedin.com/in/adityacbcc/
