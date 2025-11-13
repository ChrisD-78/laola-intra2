# Meeting-Protokoll Setup Anleitung

## 🎙️ Übersicht

Die Meeting-Protokoll-Funktion ermöglicht es Admins, Meetings per Sprachaufnahme aufzunehmen und automatisch in professionelle Protokolle umzuwandeln.

## ✨ Features

- 🎙️ **Audio-Aufnahme** direkt im Browser
- ⏸️ **Pause/Resume** Funktion während der Aufnahme
- 🤖 **Automatische Transkription** mit OpenAI Whisper
- 📝 **KI-Formatierung** mit GPT-4 in strukturiertes Protokoll:
  - Titel und Datum
  - Teilnehmer
  - Zusammenfassung
  - Besprochene Themen
  - Aufgaben & Nächste Schritte
  - Vollständige Transkription
- 📋 **Copy-to-Clipboard** Funktion
- 💾 **Download als .txt** Datei
- 🔒 **Nur für Admins** verfügbar

## 🔧 Setup

### 1. OpenAI API Key erhalten

1. Gehen Sie zu [OpenAI Platform](https://platform.openai.com/)
2. Registrieren Sie sich oder melden Sie sich an
3. Navigieren Sie zu **API Keys**
4. Klicken Sie auf **Create new secret key**
5. Kopieren Sie den API-Schlüssel (beginnt mit `sk-...`)

### 2. Umgebungsvariable setzen

Fügen Sie in Ihrer `.env.local` Datei hinzu:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Wichtig:** Ersetzen Sie `sk-your-actual-openai-api-key-here` mit Ihrem echten API-Schlüssel!

### 3. Deployment

#### Netlify:

1. Gehen Sie zu **Netlify Dashboard** → Ihr Projekt
2. **Site settings** → **Environment variables**
3. Fügen Sie hinzu:
   - Key: `OPENAI_API_KEY`
   - Value: Ihr OpenAI API-Schlüssel
4. **Save** klicken
5. **Deploys** → **Trigger deploy** → **Clear cache and deploy**

#### Lokal testen:

```bash
npm run dev
```

Öffnen Sie: `http://localhost:3000/meeting-protokoll`

## 📱 Verwendung

### Als Admin:

1. **Sidebar öffnen** → **Administration** → **Meeting-Protokoll** 🎙️
2. **Mikrofon-Zugriff erlauben** (Browser fragt beim ersten Mal)
3. **Aufnahme starten** (roter Knopf)
4. **Meeting aufnehmen** (sprechen Sie normal)
5. Optional: **Pause** ⏸️ während der Aufnahme
6. **Stopp** ⏹️ wenn fertig
7. **"Jetzt transkribieren & formatieren"** klicken
8. **Warten** (1-2 Minuten - KI verarbeitet)
9. **Protokoll ansehen, kopieren oder downloaden**

### Protokoll teilen:

- **📋 Kopieren** → In E-Mail-Programm einfügen
- **💾 Download** → Als .txt Datei speichern
- **🔄 Neue Aufnahme** → Neues Meeting starten

## 💰 Kosten

OpenAI API Kosten (Stand: 2024):
- **Whisper** (Transkription): ~$0.006 pro Minute Audio
- **GPT-4o-mini** (Formatierung): ~$0.0001 - $0.001 pro Protokoll

**Beispiel:** 30-Minuten Meeting = ca. $0.18 - $0.20

## 🔒 Sicherheit

- ✅ Nur Admins haben Zugriff
- ✅ Audio wird NICHT gespeichert (nur im Browser-RAM)
- ✅ Transkription über sichere OpenAI API
- ✅ API-Schlüssel nur serverseitig verwendet

## 🛠️ Technische Details

### Browser-Kompatibilität:
- ✅ Chrome/Edge (empfohlen)
- ✅ Firefox
- ✅ Safari (macOS/iOS)

### Audio-Format:
- Format: WebM mit Opus Codec
- Qualität: Optimal für Sprache

### API-Limits:
- Max. Audio-Länge: 25 MB (ca. 2-3 Stunden)
- Verarbeitungszeit: 5 Minuten (siehe route.ts)

## 🐛 Troubleshooting

### "Mikrofon-Zugriff verweigert"
- Browser-Einstellungen → Mikrofon-Berechtigung erlauben
- HTTPS erforderlich (Netlify bietet dies automatisch)

### "OpenAI API-Schlüssel nicht konfiguriert"
- Prüfen Sie `.env.local` (lokal) oder Netlify Environment Variables
- API-Schlüssel muss mit `sk-` beginnen

### "Transkription fehlgeschlagen"
- Prüfen Sie OpenAI API Credits: [platform.openai.com/usage](https://platform.openai.com/usage)
- Audio zu leise? Sprechen Sie näher am Mikrofon
- Netzwerkprobleme? Versuchen Sie es erneut

### Audio ist zu lang
- Teilen Sie lange Meetings in mehrere kürzere Aufnahmen auf
- Empfohlen: Max. 60 Minuten pro Aufnahme

## 📞 Support

Bei Fragen zur Einrichtung oder Nutzung, kontaktieren Sie Ihren Administrator.

---

**Entwickelt für LA OLA Intranet** 🏊‍♂️

