# 📧 E-Mail-Konfiguration für Feedback-Formular

## 🎯 Problem
Das Feedback-Formular sendet keine E-Mails, weil die E-Mail-Konfiguration auf Netlify fehlt.

---

## ✅ Lösung: Gmail App-Password einrichten

### Schritt 1: Google Account 2FA aktivieren

1. Gehen Sie zu: https://myaccount.google.com/security
2. Klicken Sie auf **"2-Step Verification"** (2-Faktor-Authentifizierung)
3. **Aktivieren Sie 2FA**, falls noch nicht aktiviert
4. Folgen Sie den Anweisungen (SMS oder Authenticator App)

---

### Schritt 2: App-Password erstellen

1. Gehen Sie zu: https://myaccount.google.com/apppasswords
2. Falls gefragt: Melden Sie sich an
3. Klicken Sie auf **"Select app"**
   - Wählen Sie **"Mail"** oder **"Other (Custom name)"**
   - Name: `Laola Intranet`
4. Klicken Sie auf **"Select device"**
   - Wählen Sie **"Other (Custom name)"**
   - Name: `Netlify Server`
5. Klicken Sie auf **"Generate"**
6. **⚠️ WICHTIG:** Kopieren Sie das **16-stellige Passwort** (z.B. `abcd efgh ijkl mnop`)
   - Sie sehen dieses Passwort NUR EINMAL!
   - Notieren Sie es sicher!

---

### Schritt 3: Environment Variables auf Netlify setzen

1. Gehen Sie zu Netlify: https://app.netlify.com/
2. Wählen Sie Ihre **laola-intra2** Site
3. Gehen Sie zu **Site configuration** → **Environment variables**
4. Klicken Sie auf **"Add a variable"**

#### Variable 1: EMAIL_USER
- **Key:** `EMAIL_USER`
- **Value:** Ihre Gmail-Adresse (z.B. `christof.drost@gmail.com`) - WICHTIG: Dies ist die Absender-Adresse!
- **Scopes:** Alle Scopes auswählen (Production, Deploy Previews, Branch deploys)
- Klicken Sie auf **"Create variable"**

#### Variable 2: EMAIL_PASS
- **Key:** `EMAIL_PASS`
- **Value:** Das 16-stellige App-Password (z.B. `abcdefghijklmnop` OHNE Leerzeichen!)
- **Scopes:** Alle Scopes auswählen
- Klicken Sie auf **"Create variable"**

---

### Schritt 4: Netlify neu deployen

Option A - Automatisch:
```bash
git commit --allow-empty -m "Trigger Netlify rebuild for email config"
git push origin main
```

Option B - Manuell:
1. In Netlify → **Deploys** → **Trigger deploy** → **Deploy site**

---

## 🧪 Testen

Nach dem Deployment (ca. 3-5 Minuten):

1. Öffnen Sie Ihre Live-Site auf Netlify
2. Gehen Sie zu **Formulare**
3. Klicken Sie auf **"Feedback geben"**
4. Füllen Sie das Formular aus
5. Klicken Sie auf **"Feedback senden"**
6. ✅ Sie sollten eine E-Mail an `christof.drost@landau.de` erhalten!

---

## 🔍 Fehlersuche

### Wenn keine E-Mail ankommt:

1. **Netlify Logs prüfen:**
   - Netlify → **Deploys** → Neuestes Deployment → **Function logs**
   - Suchen Sie nach `📧 E-Mail` oder Fehler-Meldungen

2. **Spam-Ordner prüfen:**
   - Prüfen Sie Ihren Gmail Spam-Ordner

3. **Environment Variables prüfen:**
   - Netlify → **Site configuration** → **Environment variables**
   - Beide müssen vorhanden sein: `EMAIL_USER` und `EMAIL_PASS`

4. **App-Password prüfen:**
   - Kein normales Gmail-Passwort verwenden
   - Das 16-stellige App-Password OHNE Leerzeichen eingeben
   - Beispiel: `abcdefghijklmnop` statt `abcd efgh ijkl mnop`

---

## ⚠️ Wichtige Hinweise

1. **Sicherheit:**
   - Teilen Sie Ihr App-Password NIEMALS öffentlich
   - Committen Sie es NICHT in Git
   - Nur in Netlify Environment Variables speichern

2. **Gmail-Limits:**
   - Gmail erlaubt ~500 E-Mails pro Tag
   - Bei Überschreitung: 24h Sperre

3. **Empfänger-Adresse:**
   - Aktuell konfiguriert: `christof.drost@landau.de`
   - Zum Ändern: `src/lib/emailService.ts` Zeile 188 und 457

---

## ✅ Fertig!

Nach der Einrichtung funktioniert das Feedback-Formular vollständig:
- ✅ E-Mails werden an Ihre Gmail-Adresse gesendet
- ✅ Schönes HTML-Format
- ✅ Alle Feedback-Daten enthalten
- ✅ Automatische Bestätigung im Frontend

---

**Fragen? Prüfen Sie die Netlify Function Logs für Details!**

