# 🚀 Deployment Guide - LA OLA Intranet

## Übersicht: GitHub → Netlify → Neon

```
Lokaler Code → GitHub Repository → Netlify (Auto-Deploy) → Neon Database
```

---

## ✅ Schritt 1: Auf GitHub pushen

### 1.1 Änderungen committen

Im Terminal:

```bash
# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Migration zu Neon Database und Code-Updates"

# Auf GitHub pushen
git push origin main
```

---

## ✅ Schritt 2: Neon Datenbank einrichten

### 2.1 SQL Schema ausführen

1. Gehen Sie zu [console.neon.tech](https://console.neon.tech)
2. Öffnen Sie Ihr Projekt `laola-intra`
3. Klicken Sie auf **SQL Editor**
4. Kopieren Sie den Inhalt von `neon_database_setup.sql`
5. Fügen Sie ihn ein und klicken Sie auf **Run**
6. Warten Sie auf "Success"

### 2.2 Connection String kopieren

Im Neon Dashboard finden Sie die Connection String:
```
postgresql://neondb_owner:***@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Kopieren Sie diese - Sie brauchen sie gleich für Netlify!**

---

## ✅ Schritt 3: Netlify einrichten

### 3.1 Neues Projekt erstellen

1. Gehen Sie zu [app.netlify.com](https://app.netlify.com)
2. Klicken Sie auf **"Add new site"** → **"Import an existing project"**
3. Wählen Sie **"Deploy with GitHub"**
4. Autorisieren Sie Netlify (falls noch nicht geschehen)
5. Suchen Sie Ihr Repository `laola-intra2`
6. Klicken Sie darauf

### 3.2 Build-Einstellungen konfigurieren

Netlify sollte automatisch erkennen:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Framework:** Next.js

Falls nicht, tragen Sie das manuell ein.

### 3.3 Umgebungsvariablen hinzufügen (WICHTIG!)

Bevor Sie auf "Deploy" klicken:

1. Klicken Sie auf **"Add environment variables"** oder **"Show advanced"**
2. Fügen Sie hinzu:

```
DATABASE_URL = postgresql://neondb_owner:***@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

**Verwenden Sie Ihre echte Neon Connection String!**

### 3.4 Deployen

1. Klicken Sie auf **"Deploy site"**
2. Warten Sie 2-5 Minuten
3. Netlify baut Ihre App und deployed sie automatisch!

---

## ✅ Schritt 4: Testen

1. Nach dem Deploy erhalten Sie eine URL wie: `https://your-site-name.netlify.app`
2. Öffnen Sie die URL
3. Gehen Sie zu **"Wiederkehrende Aufgaben"**
4. Versuchen Sie eine Aufgabe zu erstellen
5. 🎉 Es sollte funktionieren!

---

## 🔄 Auto-Deploy eingerichtet!

Ab jetzt:
- Jeder `git push` zu GitHub
- Triggert automatisch einen neuen Deploy auf Netlify
- Ihre App ist immer aktuell!

---

## 🆘 Troubleshooting

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

---

## 📝 Nächste Schritte nach dem Deployment

1. ✅ Testen Sie alle Funktionen
2. ✅ Fügen Sie eine Custom Domain hinzu (in Netlify Settings)
3. ✅ Aktivieren Sie HTTPS (automatisch von Netlify)
4. 🎉 Fertig!

---

## 💡 Vorteile dieser Setup

- 🚀 **Auto-Deploy:** Jeder Push = automatisches Update
- 💰 **Kostenlos:** Netlify + Neon Free Tier
- ⚡ **Schnell:** Netlify CDN weltweit
- 🔒 **Sicher:** Umgebungsvariablen geschützt
- 📊 **Monitoring:** Netlify Analytics verfügbar
