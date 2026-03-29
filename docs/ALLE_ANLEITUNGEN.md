# 📚 LA OLA Intranet - Komplette Anleitung

## 📋 Inhaltsverzeichnis

1. [Projekt-Übersicht](#projekt-übersicht)
2. [Erste Schritte & Setup](#erste-schritte--setup)
3. [Datenbank-Setup (Neon)](#datenbank-setup-neon)
4. [Deployment (Netlify)](#deployment-netlify)
5. [Benutzerverwaltung](#benutzerverwaltung)
6. [Rollen-System](#rollen-system)
7. [Quiz-System](#quiz-system)
8. [Schichtplan](#schichtplan)
9. [Push Notifications](#push-notifications)
10. [PDF-Upload](#pdf-upload)
11. [E-Mail-Setup](#e-mail-setup)
12. [Fehlerbehebung](#fehlerbehebung)

---

## 🏊‍♂️ Projekt-Übersicht

**LA OLA Intranet** - Ein modernes Mitarbeiter-Portal für das Freizeitbad LA OLA.

### Technologie-Stack

- **Frontend:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Datenbank:** Neon (PostgreSQL)
- **Deployment:** Netlify
- **Sprache:** TypeScript
- **File Storage:** Vercel Blob

### Haupt-Features

- ✅ Dashboard mit Übersicht
- ✅ Aufgabenverwaltung
- ✅ Dokumentenverwaltung
- ✅ Formulare
- ✅ Schulungen & Quiz-System
- ✅ Schichtplan mit PDF-Export
- ✅ Chat-System
- ✅ Benutzerverwaltung mit Rollen
- ✅ Push Notifications

---

## 🚀 Erste Schritte & Setup

### Voraussetzungen

- Node.js 18+
- npm oder yarn
- GitHub Account
- Neon Account (kostenlos)
- Netlify Account (kostenlos)
- Vercel Account (für Blob Storage, kostenlos)

### Lokale Entwicklung

#### 1. Repository klonen

```bash
git clone <your-repo-url>
cd laola-intra2
```

#### 2. Dependencies installieren

```bash
npm install
```

#### 3. Umgebungsvariablen konfigurieren

Erstellen Sie `.env.local` im Projekt-Root:

```env
# Datenbank
DATABASE_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Vercel Blob Storage (für PDF-Uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx

# E-Mail (Gmail App-Password)
EMAIL_USER=ihre-email@gmail.com
EMAIL_PASS=ihr_16_stelliges_app_password

# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMUjs8y0rLzMZ-v2s5Z2H0oS-nB_XqLfVPfGw-zHmK5DTSbJpLCw-CJkph31o7-ezSie0jKLnpR2pAxqXpbc5L0
VAPID_PRIVATE_KEY=yd7Re9R6A7-HVaA8z4yCZCz1TviHYoEko66WZiBHq9A
VAPID_SUBJECT=mailto:admin@laola.baederbook.de
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

---

## 🗄️ Datenbank-Setup (Neon)

### Schritt 1: Neon Account erstellen

1. Gehen Sie zu [neon.tech](https://neon.tech)
2. Klicken Sie auf **"Sign Up"** oder **"Get Started"**
3. Melden Sie sich mit GitHub, Google oder Email an
4. Der kostenlose Plan ist völlig ausreichend!

### Schritt 2: Neues Projekt erstellen

1. Nach dem Login klicken Sie auf **"Create Project"** oder **"New Project"**
2. Wählen Sie:
   - **Project name:** `laola-intra`
   - **Region:** Europe (Frankfurt oder nächstgelegene)
   - **PostgreSQL version:** 16 (neueste)
3. Klicken Sie auf **"Create Project"**
4. Warten Sie ~30 Sekunden

### Schritt 3: Connection String kopieren

Nach der Erstellung sehen Sie eine Connection String:

```
postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Kopieren Sie diese Connection String** - Sie brauchen sie für `.env.local` und Netlify!

### Schritt 4: Datenbank-Schema erstellen

1. Klicken Sie in Neon auf **"SQL Editor"** (links im Menü)
2. Öffnen Sie die Datei **`sql/all_sql_migrations.sql`** in Ihrem Code-Editor
3. Kopieren Sie den **kompletten Inhalt**
4. Fügen Sie ihn in den Neon SQL Editor ein
5. Klicken Sie auf **"Run"** (oder drücken Sie Cmd+Enter)
6. Warten Sie bis "Success" erscheint

Das Script erstellt:
- ✅ Alle Tabellen (Users, Tasks, Documents, Quizzes, Schichtplan, etc.)
- ✅ Indizes für Performance
- ✅ Trigger für auto-update
- ✅ Alle 8 Quizze mit 144 Fragen
- ✅ Standard-Benutzer (Christof Drost, Kirstin als Admins)

### Schritt 5: Abhängigkeiten installieren

```bash
npm install @neondatabase/serverless
```

---

## 🌐 Deployment (Netlify)

### Schritt 1: Auf GitHub pushen

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Schritt 2: Neues Projekt in Netlify erstellen

1. Gehen Sie zu [app.netlify.com](https://app.netlify.com)
2. Klicken Sie auf **"Add new site"** → **"Import an existing project"**
3. Wählen Sie **"Deploy with GitHub"**
4. Autorisieren Sie Netlify (falls noch nicht geschehen)
5. Suchen Sie Ihr Repository `laola-intra2`
6. Klicken Sie darauf

### Schritt 3: Build-Einstellungen konfigurieren

Netlify sollte automatisch erkennen:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Framework:** Next.js

Falls nicht, tragen Sie das manuell ein.

### Schritt 4: Umgebungsvariablen hinzufügen

Bevor Sie auf "Deploy" klicken:

1. Klicken Sie auf **"Add environment variables"** oder **"Show advanced"**
2. Fügen Sie alle Variablen aus `.env.local` hinzu:

```
DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
EMAIL_USER=ihre-email@gmail.com
EMAIL_PASS=ihr_16_stelliges_app_password
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMUjs8y0rLzMZ-v2s5Z2H0oS-nB_XqLfVPfGw-zHmK5DTSbJpLCw-CJkph31o7-ezSie0jKLnpR2pAxqXpbc5L0
VAPID_PRIVATE_KEY=yd7Re9R6A7-HVaA8z4yCZCz1TviHYoEko66WZiBHq9A
VAPID_SUBJECT=mailto:admin@laola.baederbook.de
NEXT_PUBLIC_APP_URL=https://ihre-domain.netlify.app
```

### Schritt 5: Deployen

1. Klicken Sie auf **"Deploy site"**
2. Warten Sie 2-5 Minuten
3. Netlify baut Ihre App und deployed sie automatisch!

### Auto-Deploy

Ab jetzt:
- Jeder `git push` zu GitHub
- Triggert automatisch einen neuen Deploy auf Netlify
- Ihre App ist immer aktuell!

---

## 👥 Benutzerverwaltung

### Admin-Konten

Folgende Benutzer haben Admin-Rechte:
- **Christof Drost** / Passwort: `12345`
- **Kirstin Kreusch** / Passwort: `kirstin123`

### Neuen Benutzer erstellen

1. Melden Sie sich als **Admin** an (Christof Drost oder Kirstin)
2. Gehen Sie zu **"Benutzerverwaltung"** in der Sidebar
3. Klicken Sie auf **"➕ Neuen Benutzer erstellen"**
4. Füllen Sie das Formular aus:
   - Benutzername
   - Anzeigename
   - Passwort (mind. 5 Zeichen)
   - **Rolle** (Dropdown):
     - Admin
     - Verwaltung
     - Technik
     - Benutzer
5. Klicken Sie auf **"Benutzer erstellen"**

### Benutzer verwalten

Die Benutzerverwaltungs-Seite zeigt:
- 📊 Alle Benutzer in einer Tabelle
- 👑 Admin-Status
- 📋 Rolle (Admin, Verwaltung, Technik, Benutzer)
- ✅ Aktiv/Deaktiviert Status
- 🕒 Letzter Login
- 📅 Erstellungsdatum

---

## 🔐 Rollen-System

### Verfügbare Rollen

1. **👑 Admin**
   - Voller Zugriff auf alle Bereiche
   - Kann Benutzer erstellen und verwalten
   - Keine zusätzlichen Passwörter erforderlich

2. **📋 Verwaltung**
   - Standard-Rechte für Verwaltungspersonal
   - Zugriff auf alle Standard-Funktionen

3. **🔧 Technik**
   - Standard-Rechte für technisches Personal
   - Zugriff auf alle Standard-Funktionen

4. **👤 Benutzer**
   - Standard-Rechte für alle anderen Mitarbeiter
   - Zugriff auf alle Standard-Funktionen

### Rollen-Badges

- **Admin**: Lila mit 👑
- **Verwaltung**: Blau mit 📋
- **Technik**: Orange mit 🔧
- **Benutzer**: Grau mit 👤

### Berechtigungen

**Nur Admins** haben Zugriff auf:
- ✅ Benutzerverwaltung
- ✅ Benutzer erstellen
- ✅ Rollen zuweisen
- ✅ Alle Bereiche ohne zusätzliche Passwörter

**Andere Rollen:**
- ✅ Zugriff auf alle Standard-Funktionen
- ✅ Formulare ausfüllen
- ✅ Dokumente ansehen
- ✅ Aufgaben verwalten
- ✅ Chat nutzen
- ❌ KEIN Zugriff auf Benutzerverwaltung

---

## 🎯 Quiz-System

### Verfügbare Quizze

Das System enthält **8 Quizze** mit insgesamt **144 Fragen**:

1. **Ultrafiltration** (12 Fragen) - Technik
2. **Wasserkreislauf im Schwimmbadbetrieb** (12 Fragen) - Technik
3. **DIN 19643 Allgemein** (21 Fragen) - Wasseraufbereitung
4. **Chemische und physikalische Eigenschaften von Wasser** (18 Fragen) - Chemie
5. **pH-Wert Grundlagen** (17 Fragen) - Chemie
6. **Herz-Kreislauf-Quiz** (18 Fragen) - Gesundheit
7. **Trainingslehre-Quiz** (22 Fragen) - Sport
8. **Sauna-Quiz** (24 Fragen) - Wellness

### Quiz spielen

1. Gehen Sie zu: **Schulungen → 🎯 Quiz** Tab
2. Wählen Sie ein Quiz aus der Übersicht
3. Klicken Sie auf **"▶️ Quiz starten"**
4. Beantworten Sie alle Fragen
5. Erhalten Sie sofortiges Feedback und Punktzahl

### Rangliste ansehen

1. Bei jedem Quiz: **Klick auf 🏆**
2. **Podium** zeigt Top 3 mit Medaillen
3. **Vollständige Tabelle** zeigt alle Teilnehmer

### Ranglisten-System

**Ranking-Kriterien:**
1. **Primär:** Höchste Punktzahl
2. **Sekundär:** Schnellste Zeit (bei Gleichstand)

**Anzeige:**
- **🥇 Platz 1:** Gold-Gradient, animiertes Pulsieren, "👑 Champion" Badge
- **🥈 Platz 2:** Silber-Gradient
- **🥉 Platz 3:** Bronze-Gradient
- **Platz 4+:** Grauer Hintergrund mit Platznummer

**Statistiken pro Teilnehmer:**
- Beste Punktzahl
- Beste Prozent
- Schnellste Zeit
- Anzahl Versuche
- Letzter Versuch

### Neues Quiz hinzufügen

1. Öffnen Sie den Neon SQL Editor
2. Kopieren Sie den Inhalt von `sql/add_[quiz-name]_quiz.sql` (falls vorhanden) oder aus `sql/all_sql_migrations.sql`
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf **"Run"**
5. Das Quiz ist sofort verfügbar!

---

## 📅 Schichtplan

### Features

- ✅ Wochen- und Monatsansicht
- ✅ Mitarbeiterverwaltung mit Farben (Rot, Braun, Schwarz, Grün, Violett, Blau, Gelb)
- ✅ Schichttypen: Frühschicht, Spätschicht, Nachtschicht, Gastro Reinigung, Sauna Reinigung
- ✅ Urlaubsanträge
- ✅ PDF-Export (nach Bereich, Tagen oder Namen)
- ✅ Feiertage und Ferientage (Rheinland-Pfalz) direkt in der Ansicht
- ✅ Klickbare Mitarbeiternamen (öffnet Bearbeitungsformular)
- ✅ Mitarbeiter deaktivieren/löschen (behält vergangene Schichten)

### PDF-Export

1. Navigieren Sie zur Monatsübersicht im Schichtplan
2. Klicken Sie auf den Button **"📄 PDF Export"**
3. Wählen Sie die gewünschte Export-Option:
   - **Bereich**: Exportiert alle Mitarbeiter eines bestimmten Bereichs
   - **Tage**: Exportiert einen bestimmten Zeitraum
   - **Namen**: Exportiert ausgewählte Mitarbeiter
4. Klicken Sie auf **"📥 PDF Exportieren"**

Das PDF enthält:
- Schichtplan-Titel mit Monat und Filterinformationen
- Tabellarische Übersicht aller Mitarbeiter und deren Schichten
- Seitennummerierung
- Professionelles Layout im Querformat (A4)

**Erforderliche Pakete:**
```bash
npm install jspdf jspdf-autotable
```

---

## 🔔 Push Notifications

### VAPID Keys generieren

Führen Sie das Skript aus, um VAPID Keys zu generieren:

```bash
node scripts/generate-vapid-keys.js
```

Dies erstellt einen Public Key und einen Private Key.

### Umgebungsvariablen konfigurieren

#### Lokale Entwicklung (.env.local)

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=IHRE_PUBLIC_KEY
VAPID_PRIVATE_KEY=IHRE_PRIVATE_KEY
VAPID_SUBJECT=mailto:admin@laola.baederbook.de
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Produktion (Netlify Environment Variables)

1. Gehen Sie zu Netlify Dashboard → Site Settings → Environment Variables
2. Fügen Sie folgende Variablen hinzu:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Public Key - kann öffentlich sein)
   - `VAPID_PRIVATE_KEY` (Private Key - **NIEMALS öffentlich machen!**)
   - `VAPID_SUBJECT` (z.B. `mailto:admin@laola.baederbook.de`)
   - `NEXT_PUBLIC_APP_URL` (Ihre Produktions-URL)

### Datenbank-Tabelle erstellen

Führen Sie das SQL-Skript in Ihrem Neon SQL Editor aus:

```sql
-- Siehe: sql/ (create_push_subscriptions_table.sql falls vorhanden)
-- Oder in sql/all_sql_migrations.sql enthalten
```

### Verwendung

**Für Benutzer:**

1. Öffnen Sie die Schichtplan-Seite
2. Klicken Sie auf den Button **"🔕 Benachrichtigungen aus"**
3. Erlauben Sie Benachrichtigungen in Ihrem Browser
4. Der Button ändert sich zu **"🔔 Benachrichtigungen an"**

**Automatische Benachrichtigungen:**

- Benachrichtigungen werden automatisch gesendet, wenn:
  - Der Schichtplan aktualisiert wird
  - Ein Admin Schichten zuweist oder ändert

### Browser-Unterstützung

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 16.4+)
- ❌ Safari (Desktop - keine Unterstützung)

---

## 📄 PDF-Upload

### Vercel Blob Storage einrichten

#### Schritt 1: Vercel Account

1. Gehen Sie zu [vercel.com/login](https://vercel.com/login)
2. Klicken Sie **"Continue with GitHub"**
3. Autorisieren Sie Vercel

#### Schritt 2: Blob Store erstellen

1. Im Vercel Dashboard klicken Sie oben auf **"Storage"**
2. Klicken Sie auf **"Create Database"** → **"Blob"**
3. Name: `laola-files`
4. Region: **Europe** (Frankfurt)
5. Klicken Sie **"Create"**

#### Schritt 3: Token kopieren

1. Nach dem Erstellen sehen Sie einen **Token**
2. Er beginnt mit: `vercel_blob_rw_...`
3. **KOPIEREN SIE DEN TOKEN SOFORT!**

Oder:
1. Gehen Sie zu **Settings** → **Tokens**
2. Klicken Sie **"Create Token"**
3. Kopieren Sie den Token

#### Schritt 4: Token hinzufügen

**Lokal (.env.local):**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**Netlify:**
1. Gehen Sie zu Netlify Dashboard
2. **Site configuration** → **Environment variables**
3. Klicken Sie **"Add a variable"**
4. **Key:** `BLOB_READ_WRITE_TOKEN`
5. **Value:** Ihr Vercel Blob Token
6. **Secret:** ✅ JA
7. Klicken Sie **"Save"**
8. Triggern Sie einen neuen Deploy

### Verwendung

PDFs können jetzt hochgeladen werden in:
- Dashboard Infos
- Dokumente
- Formulare
- Schulungen

**Wichtig:**
- PDFs werden in **Vercel Blob** gespeichert (nicht in Neon)
- Die **URL zum PDF** wird in Neon gespeichert
- PDFs sind **öffentlich** zugänglich (per URL)
- **5GB kostenlos** - völlig ausreichend!

---

## 📧 E-Mail-Setup

### Gmail App-Password einrichten

#### Schritt 1: Google-Konto vorbereiten

- Gehen Sie zu Ihrem Google-Konto: https://myaccount.google.com/
- Aktivieren Sie die 2-Faktor-Authentifizierung falls noch nicht geschehen

#### Schritt 2: App-Password erstellen

- Gehen Sie zu: https://myaccount.google.com/apppasswords
- Wählen Sie "Mail" als App aus
- Wählen Sie "Other (Custom name)" und geben Sie "Laola Intranet" ein
- Kopieren Sie das generierte 16-stellige Passwort

#### Schritt 3: Umgebungsvariablen setzen

**Für lokale Entwicklung (.env.local):**
```env
EMAIL_USER=christof.drost@gmail.com
EMAIL_PASS=ihr_16_stelliges_app_password
```

**Für Netlify Deployment:**
1. Gehen Sie zu Ihrem Netlify Dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu "Site settings" > "Environment variables"
4. Fügen Sie hinzu:
   - `EMAIL_USER` = `christof.drost@gmail.com`
   - `EMAIL_PASS` = `ihr_16_stelliges_app_password`

#### Schritt 4: Testen

- Starten Sie die Anwendung lokal: `npm run dev`
- Öffnen Sie das Feedback-Formular
- Senden Sie ein Test-Feedback
- Überprüfen Sie Ihr E-Mail-Postfach

---

## 🛠️ Fehlerbehebung

### Problem: "DATABASE_URL is not defined"

**Lösung:**
1. Gehen Sie in Netlify zu **Site settings** → **Environment variables**
2. Fügen Sie `DATABASE_URL` hinzu
3. Triggern Sie einen neuen Deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

### Problem: Build schlägt fehl

**Lösung:**
1. Schauen Sie in die Build-Logs (auf Netlify)
2. Suchen Sie nach Fehlermeldungen
3. Oft hilft: Dependencies neu installieren mit `npm install`

### Problem: "Cannot connect to database"

**Lösung:**
1. Überprüfen Sie die Connection String in Netlify
2. Stellen Sie sicher, dass Neon SQL Schema ausgeführt wurde
3. Testen Sie die Verbindung mit: Neon Dashboard → SQL Editor → `SELECT 1;`

### Problem: Quizze nicht sichtbar

**Lösung:**
1. Führen Sie `sql/all_sql_migrations.sql` im Neon SQL Editor aus
2. Prüfen Sie: `SELECT * FROM quizzes;`
3. Seite neu laden (F5)

### Problem: Push Notifications funktionieren nicht

**Lösung:**
1. Prüfen Sie, ob VAPID Keys korrekt gesetzt sind
2. Prüfen Sie, ob die Datenbank-Tabelle erstellt wurde
3. Prüfen Sie die Browser-Konsole auf Fehler
4. Stellen Sie sicher, dass HTTPS verwendet wird (erforderlich für Push Notifications)

### Problem: PDF-Upload funktioniert nicht

**Lösung:**
1. Überprüfen Sie, ob `BLOB_READ_WRITE_TOKEN` in Netlify gesetzt ist
2. Stellen Sie sicher, dass der Token korrekt ist
3. Prüfen Sie die Netlify-Logs für Fehlermeldungen

### Problem: E-Mails kommen nicht an

**Lösung:**
1. Überprüfen Sie den Spam-Ordner
2. Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist
3. Überprüfen Sie die Netlify-Logs für Fehlermeldungen
4. Verwenden Sie ein App-Password, nicht Ihr normales Gmail-Passwort

### Problem: "Role is null"

**Lösung:**
```sql
-- Setze Default-Rolle für Benutzer ohne Rolle
UPDATE users 
SET role = 'Benutzer' 
WHERE role IS NULL;
```

### Problem: Admin-Bereich nicht sichtbar

**Lösung:**
1. Prüfen Sie, ob Sie als Admin eingeloggt sind
2. Logout und erneut einloggen
3. Browser-Cache leeren (`Cmd + Shift + R` auf Mac, `Ctrl + Shift + R` auf Windows)

---

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die Browser-Konsole (F12)
2. Prüfen Sie Netlify-Deployment-Logs
3. Kontrollieren Sie Neon-Datenbank-Logs
4. Überprüfen Sie alle Umgebungsvariablen

---

## 📝 Nächste Schritte

Nach dem Setup:

1. ✅ Testen Sie alle Funktionen
2. ✅ Fügen Sie eine Custom Domain hinzu (in Netlify Settings)
3. ✅ Aktivieren Sie HTTPS (automatisch von Netlify)
4. ✅ Erstellen Sie weitere Benutzer
5. ✅ Fügen Sie Quizze hinzu
6. 🎉 Fertig!

---

## 💡 Wichtige Hinweise

### Sicherheit

- ⚠️ **VAPID_PRIVATE_KEY** sollte **NIEMALS** in Client-seitigem Code verwendet werden
- ⚠️ **VAPID_PRIVATE_KEY** sollte nur in Server-seitigen Umgebungsvariablen gespeichert werden
- ✅ **NEXT_PUBLIC_VAPID_PUBLIC_KEY** kann öffentlich sein
- 🔒 Passwörter werden aktuell im Klartext gespeichert (für Produktion sollte Hashing verwendet werden)

### Kosten

- 💰 **Neon:** Kostenlos bis 0.5 GB Storage
- 💰 **Netlify:** Kostenlos für Standard-Features
- 💰 **Vercel Blob:** 5GB kostenlos - völlig ausreichend!

### Vorteile dieser Setup

- 🚀 **Auto-Deploy:** Jeder Push = automatisches Update
- 💰 **Kostenlos:** Netlify + Neon Free Tier
- ⚡ **Schnell:** Netlify CDN weltweit
- 🔒 **Sicher:** Umgebungsvariablen geschützt
- 📊 **Monitoring:** Netlify Analytics verfügbar

---

**Erstellt am:** 2025  
**Version:** 1.0  
**Status:** ✅ Produktionsbereit

---

**Entwickelt mit ❤️ für das LA OLA Team**

