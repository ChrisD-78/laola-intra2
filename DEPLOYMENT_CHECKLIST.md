# ✅ Deployment Checkliste

## 📋 Vor dem Deployment

- [x] Code auf Neon umgestellt
- [x] API Routes erstellt
- [x] Supabase-Code entfernt
- [x] `.env.local` mit DATABASE_URL erstellt
- [ ] **SQL Schema in Neon ausgeführt** ⚠️ WICHTIG!
- [ ] **Lokal getestet** ⚠️ WICHTIG!

---

## 🗄️ Schritt 1: Neon SQL ausführen

```bash
# ODER kopieren Sie neon_database_setup.sql in den Neon SQL Editor
```

**Checkliste:**
- [ ] Zu console.neon.tech gegangen
- [ ] SQL Editor geöffnet
- [ ] `neon_database_setup.sql` kopiert
- [ ] "Explain" Modus AUSGESCHALTET
- [ ] "Run" geklickt
- [ ] "Success" gesehen

---

## 🧪 Schritt 2: Lokal testen

```bash
cd /Users/christofdrost/Desktop/laola-intra2
npm run dev
```

**Checkliste:**
- [ ] Dev-Server läuft ohne Fehler
- [ ] http://localhost:3000 geöffnet
- [ ] "Wiederkehrende Aufgaben" Seite funktioniert
- [ ] Neue Aufgabe erstellt - ERFOLGREICH ✅

---

## 📦 Schritt 3: Auf GitHub pushen

```bash
git add .
git commit -m "Migration zu Neon Database - Ready for Production"
git push origin main
```

**Checkliste:**
- [ ] Alle Dateien committed
- [ ] Push erfolgreich
- [ ] Auf GitHub.com sichtbar

---

## 🚀 Schritt 4: Netlify Deploy

### 4.1 Site erstellen
1. [ ] Zu app.netlify.com gegangen
2. [ ] "Add new site" → "Import from Git"
3. [ ] GitHub verbunden
4. [ ] Repository `laola-intra2` ausgewählt
5. [ ] Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 4.2 Environment Variables (KRITISCH!)
```
DATABASE_URL=postgresql://neondb_owner:npg_C5ADgc8HuFlY@ep-old-fog-ag85ul35-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Checkliste:**
- [ ] "Environment variables" geöffnet
- [ ] `DATABASE_URL` hinzugefügt
- [ ] Wert eingefügt (Ihre echte Connection String!)
- [ ] Gespeichert

### 4.3 Deploy starten
- [ ] "Deploy site" geklickt
- [ ] Build läuft... (3-5 Min)
- [ ] Build erfolgreich ✅
- [ ] URL erhalten: `https://_____.netlify.app`

---

## ✅ Schritt 5: Production testen

Öffnen Sie Ihre Netlify-URL:

- [ ] Seite lädt
- [ ] "Wiederkehrende Aufgaben" funktioniert
- [ ] Aufgabe erstellt - ERFOLGREICH ✅
- [ ] "Aufgaben" funktioniert
- [ ] Aufgabe erstellt - ERFOLGREICH ✅

---

## 🎉 FERTIG!

Ihre App ist jetzt live auf:
- **Hosting:** Netlify
- **Datenbank:** Neon PostgreSQL
- **Code:** GitHub

---

## 🔄 Zukünftige Updates

Workflow für Updates:

```bash
# 1. Code ändern
# 2. Lokal testen
npm run dev

# 3. Committen und pushen
git add .
git commit -m "Beschreibung der Änderung"
git push origin main

# 4. Netlify deployed AUTOMATISCH! 🎉
```

---

## 🆘 Wenn etwas schief geht:

1. **Build Error:** Schauen Sie in Netlify Build-Logs
2. **Runtime Error:** Öffnen Sie Browser-Konsole (F12)
3. **Database Error:** Prüfen Sie DATABASE_URL in Netlify Settings
4. **404 Error:** Clear cache und neu deployen

---

## 📞 Support

Bei Problemen:
1. Öffnen Sie `MIGRATION_COMPLETE.md` für Details
2. Schauen Sie in `DEPLOYMENT_GUIDE.md` für Troubleshooting
3. Oder fragen Sie einfach!

---

**Viel Erfolg beim Deployment! 🚀**
