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
-- ── Table ──────────────────────────────────────────────────────────
CREATE TABLE public.waitlist (
  id          BIGSERIAL PRIMARY KEY,
  position    BIGINT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role        TEXT NOT NULL,
  company     TEXT,
  size        TEXT NOT NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX waitlist_email_idx ON public.waitlist (LOWER(email));
CREATE INDEX waitlist_position_idx ON public.waitlist (position);

-- ── Position: use a sequence (no race condition) ───────────────────
CREATE SEQUENCE IF NOT EXISTS waitlist_position_seq START 1;

CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := nextval('waitlist_position_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_position_trigger
BEFORE INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION set_waitlist_position();

-- ── Row Level Security ─────────────────────────────────────────────
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anon: insert only (no PII read)
CREATE POLICY "anon_insert" ON public.waitlist
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated admin: full read + delete
CREATE POLICY "admin_select" ON public.waitlist
  FOR SELECT TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "admin_delete" ON public.waitlist
  FOR DELETE TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ── Public count RPC (no PII exposed) ─────────────────────────────
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*) FROM public.waitlist;
$$;
GRANT EXECUTE ON FUNCTION get_waitlist_count() TO anon;
```

### Set admin role on a user
After creating an admin account in Supabase Auth, run:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@email.com';
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
