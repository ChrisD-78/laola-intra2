# 🚀 PDF-Upload in 5 Minuten einrichten

## Schritt 1: Vercel Blob Token holen (2 Min)

### 1.1 Vercel Account
1. Gehen Sie zu [vercel.com/login](https://vercel.com/login)
2. Klicken Sie **"Continue with GitHub"**
3. Autorisieren Sie Vercel

### 1.2 Blob Store erstellen
1. Im Vercel Dashboard klicken Sie oben auf **"Storage"**
2. Klicken Sie auf **"Create Database"** → **"Blob"**
3. Name: `laola-files`
4. Region: **Europe** (Frankfurt)
5. Klicken Sie **"Create"**

### 1.3 Token kopieren
1. Nach dem Erstellen sehen Sie einen **Token**
2. Er beginnt mit: `vercel_blob_rw_...`
3. **KOPIEREN SIE DEN TOKEN SOFORT!**
4. Speichern Sie ihn in Ihrem Editor

Oder:
1. Gehen Sie zu **Settings** → **Tokens**
2. Klicken Sie **"Create Token"**
3. Kopieren Sie den Token

---

## Schritt 2: Token lokal hinzufügen (30 Sek)

Im Terminal:

```bash
cd /Users/christofdrost/Desktop/laola-intra2

echo "" >> .env.local
echo "# Vercel Blob Storage for PDF uploads" >> .env.local
echo "BLOB_READ_WRITE_TOKEN=IHR_TOKEN_HIER" >> .env.local
```

**ODER** öffnen Sie `.env.local` und fügen Sie hinzu:

```env
# Vercel Blob Storage for PDF uploads
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

---

## Schritt 3: Testen (1 Min)

```bash
# Dev-Server starten
npm run dev
```

1. Öffnen Sie http://localhost:3000
2. Gehen Sie zum **Dashboard**
3. Klicken Sie **"Neue Information"**
4. Laden Sie ein **PDF** hoch
5. Speichern Sie
6. **Es sollte funktionieren!** ✅

---

## Schritt 4: Auf GitHub pushen (30 Sek)

```bash
git add .
git commit -m "✅ PDF-Upload mit Vercel Blob implementiert"
git push origin main
```

Netlify deployed automatisch!

---

## Schritt 5: Token in Netlify hinzufügen (1 Min)

1. Gehen Sie zu Netlify
2. **Site configuration** → **Environment variables**
3. Klicken Sie **"Add a variable"**
4. **Key:** `BLOB_READ_WRITE_TOKEN`
5. **Value:** Ihr Vercel Blob Token
6. **Secret:** ✅ JA
7. Klicken Sie **"Save"**
8. Triggern Sie einen neuen Deploy

---

## ✅ FERTIG!

PDFs werden jetzt hochgeladen und gespeichert!

### Was funktioniert:
- ✅ Dashboard Infos erstellen
- ✅ **PDF hochladen** (NEU!)
- ✅ PDF anzeigen/herunterladen
- ✅ Infos löschen

---

## 💡 Wichtig zu wissen:

- PDFs werden in **Vercel Blob** gespeichert (nicht in Neon)
- Die **URL zum PDF** wird in Neon gespeichert
- PDFs sind **öffentlich** zugänglich (per URL)
- **5GB kostenlos** - völlig ausreichend!

---

**Starten Sie mit Schritt 1 und arbeiten Sie sich durch!** 🚀

Nach ~5 Minuten funktioniert der PDF-Upload! 🎉
