# E-Mail-Setup für Laola Intranet

## Gmail App-Password einrichten

### 1. Google-Konto vorbereiten
- Gehen Sie zu Ihrem Google-Konto: https://myaccount.google.com/
- Aktivieren Sie die 2-Faktor-Authentifizierung falls noch nicht geschehen

### 2. App-Password erstellen
- Gehen Sie zu: https://myaccount.google.com/apppasswords
- Wählen Sie "Mail" als App aus
- Wählen Sie "Other (Custom name)" und geben Sie "Laola Intranet" ein
- Kopieren Sie das generierte 16-stellige Passwort

### 3. Umgebungsvariablen setzen

#### Für lokale Entwicklung:
Erstellen Sie eine `.env.local` Datei im Projektverzeichnis:
```bash
EMAIL_USER=christof.drost@gmail.com
EMAIL_PASS=ihr_16_stelliges_app_password
```

#### Für Netlify Deployment:
1. Gehen Sie zu Ihrem Netlify Dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu "Site settings" > "Environment variables"
4. Fügen Sie hinzu:
   - `EMAIL_USER` = `christof.drost@gmail.com`
   - `EMAIL_PASS` = `ihr_16_stelliges_app_password`

### 4. Testen
- Starten Sie die Anwendung lokal: `npm run dev`
- Öffnen Sie das Feedback-Formular
- Senden Sie ein Test-Feedback
- Überprüfen Sie Ihr E-Mail-Postfach

## Fehlerbehebung

### "Invalid login" Fehler
- Stellen Sie sicher, dass das App-Password korrekt ist
- Überprüfen Sie, dass 2FA aktiviert ist
- Verwenden Sie das App-Password, nicht Ihr normales Gmail-Passwort

### "Less secure app access" Fehler
- Verwenden Sie App-Passwords, nicht "Less secure app access"
- App-Passwords sind sicherer und werden von Google empfohlen

### E-Mails kommen nicht an
- Überprüfen Sie den Spam-Ordner
- Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist
- Überprüfen Sie die Netlify-Logs für Fehlermeldungen
