# Netlify E-Mail-Konfiguration

## Problem: E-Mail-Versand funktioniert nicht

### Schritt 1: Netlify Environment Variables setzen

1. **Netlify Dashboard öffnen**
   - Gehen Sie zu: https://app.netlify.com/
   - Wählen Sie Ihr Projekt "laola-intra2" aus

2. **Environment Variables hinzufügen**
   - Klicken Sie auf "Site settings"
   - Wählen Sie "Environment variables" im linken Menü
   - Klicken Sie auf "Add variable"

3. **Folgende Variablen hinzufügen:**
   ```
   EMAIL_USER = christof.drost@gmail.com
   EMAIL_PASS = [Ihr 16-stelliges Gmail App-Password]
   ```

### Schritt 2: Gmail App-Password erstellen

1. **Google-Konto vorbereiten**
   - Gehen Sie zu: https://myaccount.google.com/
   - Aktivieren Sie die 2-Faktor-Authentifizierung (falls noch nicht geschehen)

2. **App-Password generieren**
   - Gehen Sie zu: https://myaccount.google.com/apppasswords
   - Wählen Sie "Mail" als App
   - Wählen Sie "Other (Custom name)" und geben Sie "Laola Intranet" ein
   - Kopieren Sie das 16-stellige Passwort (z.B. "abcd efgh ijkl mnop")

3. **App-Password in Netlify eintragen**
   - Fügen Sie das App-Password als `EMAIL_PASS` in Netlify ein
   - **Wichtig:** Verwenden Sie das App-Password, nicht Ihr normales Gmail-Passwort

### Schritt 3: Deployment neu starten

1. **Redeploy auslösen**
   - Gehen Sie zu "Deploys" in Ihrem Netlify-Dashboard
   - Klicken Sie auf "Trigger deploy" → "Deploy site"

2. **Oder Code-Push**
   ```bash
   git commit --allow-empty -m "Trigger redeploy for email config"
   git push origin main
   ```

### Schritt 4: Logs überprüfen

1. **Function Logs anzeigen**
   - Gehen Sie zu "Functions" in Ihrem Netlify-Dashboard
   - Klicken Sie auf "send-email"
   - Überprüfen Sie die Logs auf Fehlermeldungen

2. **Häufige Fehlermeldungen:**
   - `E-Mail-Konfiguration fehlt` → Environment Variables nicht gesetzt
   - `SMTP-Verbindung fehlgeschlagen` → App-Password falsch oder 2FA nicht aktiviert
   - `Invalid login` → App-Password falsch eingegeben

### Schritt 5: Test durchführen

1. **Feedback-Formular öffnen**
   - Gehen Sie zu Ihrer Website
   - Öffnen Sie das Feedback-Formular
   - Senden Sie ein Test-Feedback

2. **E-Mail überprüfen**
   - Überprüfen Sie Ihr E-Mail-Postfach (christof.drost@landau.de)
   - Schauen Sie auch im Spam-Ordner nach

## Troubleshooting

### Problem: "E-Mail-Konfiguration fehlt"
**Lösung:** Environment Variables in Netlify setzen

### Problem: "SMTP-Verbindung fehlgeschlagen"
**Lösung:** 
- App-Password korrekt eingegeben?
- 2-Faktor-Authentifizierung aktiviert?
- Gmail-Konto nicht gesperrt?

### Problem: "Invalid login"
**Lösung:**
- App-Password neu generieren
- Keine Leerzeichen im App-Password
- Normales Gmail-Passwort funktioniert nicht

### Problem: E-Mails kommen nicht an
**Lösung:**
- Spam-Ordner überprüfen
- E-Mail-Adresse korrekt?
- Netlify-Logs auf Fehler prüfen

## Support

Bei weiteren Problemen:
1. Netlify Function Logs überprüfen
2. Browser Developer Tools → Console prüfen
3. Gmail-Konto-Einstellungen überprüfen
