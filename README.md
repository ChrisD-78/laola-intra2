## Supabase Setup

1) Environment:

Copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=... 
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Optional for server ops not used here
SUPABASE_SERVICE_ROLE_KEY=...
```

2) Database schema (SQL):

Create tables and storage bucket in your Supabase project using the SQL below.

```
-- accidents table
create table if not exists public.accidents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  unfalltyp text check (unfalltyp in ('mitarbeiter','gast')) not null,
  datum date not null,
  zeit text not null,
  verletzte_person text not null,
  unfallort text not null,
  unfallart text not null,
  verletzungsart text not null,
  schweregrad text not null,
  erste_hilfe text not null,
  arzt_kontakt text not null,
  zeugen text,
  beschreibung text not null,
  meldende_person text not null,
  unfallhergang text,
  gast_alter text,
  gast_kontakt text
);

-- external proofs table
create table if not exists public.external_proofs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  bezeichnung text not null,
  vorname text not null,
  nachname text not null,
  datum date not null,
  pdf_name text,
  pdf_url text
);

-- Enable RLS (public read disabled by default, inserts allowed for anon)
alter table public.accidents enable row level security;
alter table public.external_proofs enable row level security;

-- Policies: allow inserts for anon (adjust to your auth needs)
create policy if not exists "accidents insert anon" on public.accidents
  for insert to anon using (true) with check (true);

create policy if not exists "external_proofs insert anon" on public.external_proofs
  for insert to anon using (true) with check (true);

-- Storage bucket for proofs
insert into storage.buckets (id, name, public) values ('proofs','proofs', true)
on conflict (id) do nothing;

-- Public read policy for proofs bucket
create policy if not exists "Public Access" on storage.objects
  for select to public using ( bucket_id = 'proofs' );

create policy if not exists "Anon upload proofs" on storage.objects
  for insert to anon with check ( bucket_id = 'proofs' );
```

3) Deploy

Commit and push. Netlify will build and your app will start writing to Supabase.

# 🏊‍♂️ LA OLA Intranet - Mitarbeiter Portal

Ein modernes und benutzerfreundliches Intranet-Portal für Mitarbeiter des Freizeitbads LA OLA.

## 🚀 Features

- **Dashboard**: Übersicht über alle wichtigen Informationen und Aktivitäten
- **Aufgaben**: Verwaltung offener und abgeschlossener Aufgaben
- **Wiederkehrende Aufgaben**: Aufgaben, die regelmäßig anfallen
- **Dokumente**: Zentrale Verwaltung aller wichtigen Unterlagen
- **Formulare**: Digitale Formulare für verschiedene Anträge
- **Schulungen**: Verwaltung von Schulungen und Weiterbildungen

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Datenbank**: Supabase
- **Deployment**: Netlify
- **Sprache**: TypeScript

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- Netlify Account
- GitHub Account

## 🚀 Lokale Entwicklung

### 1. Repository klonen
```bash
git clone <your-repo-url>
cd laola-intra2
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Kopieren Sie `env.example` zu `.env.local` und füllen Sie die Werte aus:

```bash
cp env.example .env.local
```

Fügen Sie Ihre Supabase-Credentials hinzu:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🗄️ Supabase Setup

### 1. Projekt erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich die Project URL und anon key

### 2. Datenbank-Schema (Beispiel)
```sql
-- Aufgaben Tabelle
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wiederkehrende Aufgaben
CREATE TABLE recurring_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  next_due TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dokumente
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🌐 Netlify Deployment

### 1. GitHub Repository verbinden
1. Gehen Sie zu [netlify.com](https://netlify.com)
2. Klicken Sie auf "New site from Git"
3. Wählen Sie GitHub und Ihr Repository aus

### 2. Build-Einstellungen
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 3. Umgebungsvariablen
Fügen Sie in Netlify die gleichen Umgebungsvariablen hinzu:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📱 Verfügbare Scripts

```bash
# Entwicklung
npm run dev          # Startet den Entwicklungsserver
npm run build        # Erstellt eine Produktionsversion
npm run start        # Startet die Produktionsversion
npm run lint         # Führt ESLint aus
```

## 🎨 Anpassungen

### Farben ändern
Die Hauptfarben können in `tailwind.config.ts` angepasst werden:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#2563eb',
        600: '#1d4ed8',
        700: '#1e40af',
      }
    }
  }
}
```

### Neue Seiten hinzufügen
1. Erstellen Sie einen neuen Ordner in `src/app/`
2. Fügen Sie eine `page.tsx` Datei hinzu
3. Aktualisieren Sie die Navigation in `src/components/Navigation.tsx`

## 🔒 Sicherheit

- Alle Supabase-Operationen verwenden Row Level Security (RLS)
- Umgebungsvariablen werden nicht im Code gespeichert
- HTTPS wird in der Produktion erzwungen

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Browser-Konsole auf Fehler
2. Stellen Sie sicher, dass alle Umgebungsvariablen korrekt gesetzt sind
3. Überprüfen Sie die Supabase-Logs

## 📄 Lizenz

Dieses Projekt ist für den internen Gebrauch des Freizeitbads LA OLA bestimmt.

---

**Entwickelt mit ❤️ für das LA OLA Team**
