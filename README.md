# DSP Vendor Hub — pe.dspng.tech

AI-powered FinTech platform for PNG market vendors. Scan paper receipts with Gemini OCR, track your sales ledger, and get personalised business coaching in Kina.

## Features

- **Receipt OCR** — Take a photo of any handwritten or printed receipt; Gemini 1.5 Flash extracts Date, Vendor, Amount, and Items into Supabase
- **AI Business Coach** — Chat interface that injects your last 10 transactions as context into Gemini for personalised advice (e.g. "How can I save K200 this month?")
- **Sales Ledger** — Browse your full transaction history
- **Auth** — Supabase email/password auth with per-vendor Row Level Security

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) |
| AI | Google Gemini 1.5 Flash (multimodal OCR + chat) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS |
| Language | TypeScript |

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/dspng-vendor-platform.git
cd dspng-vendor-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=https://pe.dspng.tech
```

**Get your Gemini API key:** [Google AI Studio](https://aistudio.google.com/app/apikey) — free tier is sufficient for development.

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:

```bash
# Paste contents of supabase/migrations/001_initial_schema.sql
# into Supabase SQL Editor and click Run
```

3. In **Authentication → URL Configuration**, add your redirect URL:
   - `https://pe.dspng.tech/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## Project Structure

```
src/
├── actions/
│   ├── receiptScanner.ts   # Server Action: Gemini OCR → Supabase insert
│   └── businessCoach.ts    # Server Action: fetch txns → Gemini chat
├── app/
│   ├── page.tsx            # Landing page
│   ├── vendor/             # Protected dashboard (Scanner | Coach | Ledger)
│   └── auth/               # Login, Register, Callback, Logout
├── components/
│   ├── ReceiptScanner.tsx  # Camera upload + OCR result display
│   ├── BusinessCoach.tsx   # Multi-turn AI chat UI
│   └── TransactionLedger.tsx
├── lib/
│   ├── gemini.ts           # Gemini client singleton
│   └── supabase/           # Browser + server clients
├── middleware.ts            # Auth-protected route guard
└── types/index.ts          # Shared TypeScript interfaces
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

## Key Architecture Decisions

### Server Actions (not API routes)
Receipt scanning and coach chat are `"use server"` actions — no API routes needed. This keeps the `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` strictly server-side.

### Context Injection
The `askBusinessCoach` action fetches the vendor's **last 10 transactions** from Supabase before every Gemini call. This gives the model real spend data to anchor advice in actual Kina figures rather than generic tips.

### Multimodal OCR prompt
The OCR prompt is tuned for PNG market realities: K/toea currency parsing, Tok Pisin quantity words (tupela/tripela), common items (buai, aibika, kumu), and low-quality image handling.

### Row Level Security
All Supabase tables use RLS policies so vendors can only ever read/write their own data, even if the client-side anon key is exposed.

## Environment Variables Reference

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (keep secret!) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

## Roadmap

- [ ] SMS alerts via Digicel/BSP API when monthly spend hits a target
- [ ] Offline mode with PWA caching for poor connectivity areas
- [ ] Voice input in Tok Pisin using Gemini audio
- [ ] Export ledger as PDF for BSP microloan applications
- [ ] Multi-language: Tok Pisin UI strings

## License

MIT — Digital Skills PNG (DSP)
