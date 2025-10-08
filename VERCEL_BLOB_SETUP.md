# 📦 Vercel Blob Storage Setup für PDF-Upload

## Was ist Vercel Blob?

Vercel Blob ist ein File-Storage-Service der:
- ✅ **Kostenlos** ist (bis 5GB)
- ✅ **Einfach** zu integrieren ist
- ✅ **Auf Netlify** funktioniert (nicht nur auf Vercel!)
- ✅ **Automatisch** CDN-optimiert ist

---

## 🚀 Schritt 1: Vercel Account erstellen

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf **"Sign Up"**
3. Melden Sie sich mit GitHub an
4. Sie müssen **KEIN** Projekt auf Vercel deployen!

---

## 🔑 Schritt 2: Blob Token erstellen

1. Gehen Sie zu Ihrem Vercel Dashboard
2. Klicken Sie auf Ihr **Profil-Icon** (oben rechts)
3. Wählen Sie **"Settings"** oder **"Account Settings"**
4. Klicken Sie links auf **"Storage"** oder **"Blob"**
5. Falls noch kein Store existiert:
   - Klicken Sie auf **"Create Store"** oder **"New Store"**
   - Name: `laola-intra-files`
   - Region: Europe (Frankfurt oder Amsterdam)
6. Klicken Sie auf **"Create"**

### Token generieren:

1. Im Blob Store klicken Sie auf **"Settings"** oder **"Tokens"**
2. Klicken Sie auf **"Create Token"** oder **"Generate Token"**
3. Name: `netlify-production`
4. Klicken Sie auf **"Create"**
5. **KOPIEREN SIE DEN TOKEN SOFORT!** (wird nur einmal angezeigt)

Der Token sieht aus wie:
```
vercel_blob_rw_xxxxxxxxxxxxx_yyyyyyyyyyyyyyy
```

---

## 🔧 Schritt 3: Token in .env.local hinzufügen

Öffnen Sie `.env.local` und fügen Sie hinzu:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx_yyyyyyyyyyyyyyy
```

**Ersetzen Sie mit Ihrem echten Token!**

---

## 🌐 Schritt 4: Token in Netlify hinzufügen

1. Gehen Sie zu Netlify
2. Ihr Projekt → **Site configuration** → **Environment variables**
3. Klicken Sie **"Add a variable"**
4. **Key:** `BLOB_READ_WRITE_TOKEN`
5. **Value:** Ihr Vercel Blob Token
6. **Secret:** ✅ JA (anklicken)
7. Klicken Sie **"Save"**

---

## 🧪 Schritt 5: Testen

### Lokal testen:

```bash
npm run dev
```

1. Öffnen Sie http://localhost:3000
2. Gehen Sie zum **Dashboard**
3. Klicken Sie **"Neue Information"**
4. Füllen Sie das Formular aus
5. **Laden Sie ein PDF hoch**
6. Speichern Sie
7. Das PDF sollte jetzt hochgeladen werden! ✅

### Auf Netlify testen:

Nach dem nächsten Deploy:
1. Öffnen Sie Ihre Netlify-URL
2. Gehen Sie zum Dashboard
3. Laden Sie ein PDF hoch
4. Es sollte funktionieren! ✅

---

## 📊 Was funktioniert jetzt:

| Feature | Status |
|---------|--------|
| Dashboard Infos (ohne PDF) | ✅ Funktioniert |
| **PDF-Upload** | ✅ **NEU - Mit Vercel Blob!** |
| PDF-Anzeige | ✅ Funktioniert |
| PDF-Löschen | ⚠️ Noch nicht implementiert |

---

## 💰 Kosten

**Vercel Blob Free Tier:**
- ✅ 5 GB Storage
- ✅ 100 GB Bandwidth / Monat
- ✅ Völlig ausreichend für Ihr Projekt!

Wenn Sie mehr brauchen: ~$0.15/GB extra

---

## 🔄 Alternative Storage-Lösungen

Falls Sie Vercel Blob nicht verwenden möchten:

1. **Cloudflare R2** - Komplett kostenlos (10GB)
2. **AWS S3** - Pay-as-you-go
3. **Uploadthing** - Einfach, aber teurer

---

## 🆘 Troubleshooting

### Problem: "Failed to upload PDF"
**Lösung:**
- Prüfen Sie ob `BLOB_READ_WRITE_TOKEN` gesetzt ist
- In `.env.local` (lokal)
- In Netlify Environment Variables (production)

### Problem: "Invalid token"
**Lösung:**
- Generieren Sie einen neuen Token in Vercel
- Ersetzen Sie den alten Token in `.env.local` und Netlify

### Problem: "Store not found"
**Lösung:**
- Erstellen Sie einen Blob Store in Vercel Dashboard

---

**Erstellen Sie jetzt den Vercel Account und Blob Token!** 🚀
