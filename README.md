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
