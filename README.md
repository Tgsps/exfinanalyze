# ExFinAnalyze

> AI-driven financial document intelligence. From document to decision, in minutes.

ExFinAnalyze extracts, analyzes and validates financial documents with AI — then coaches your junior team through every decision. Built for accountants, not engineers.

---

## Features

- **Template-free Document Extraction** — Drop any PDF, contract, or Excel file. Every field extracted with confidence scores and source citations.
- **AI Shadow Reviewer** — Real-time ASC 842 / ASC 606 coaching alongside junior employees.
- **Month-End Close Dashboard** — Variance analysis, anomaly detection, and AI-generated MD&A drafts.

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS
- **Database** — Supabase (Postgres)
- **Fonts** — Fraunces, DM Sans, JetBrains Mono

## Getting Started

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/exfinanalyze.git
cd exfinanalyze

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Add your Supabase URL and anon key to .env

# 4. Run
npm run dev
```

## Supabase Setup

Run this SQL in your Supabase project → SQL Editor:

```sql
CREATE TABLE public.waitlist (
  id          BIGSERIAL PRIMARY KEY,
  position    BIGINT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL,
  company     TEXT,
  size        TEXT NOT NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX waitlist_email_idx ON public.waitlist (LOWER(email));

CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := (SELECT COUNT(*) FROM public.waitlist) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_position_trigger
BEFORE INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION set_waitlist_position();

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_anon_insert" ON public.waitlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_select" ON public.waitlist FOR SELECT TO anon USING (true);
```

## Admin Panel

Visit `/#admin` to view all signups and export CSV.

## Project Structure

```
exfinanalyze/
├── src/
│   ├── main.jsx          # Entry point
│   ├── LandingPage.jsx   # Landing page + waitlist (Supabase)
│   ├── Prototype.jsx     # Interactive app prototype
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

## Deploy

```bash
npm run build
# Deploy dist/ to Vercel or Netlify
```

---

Built with Claude · Powered by Supabase
