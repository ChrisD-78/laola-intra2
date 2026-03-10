# Skripte

Hilfsskripte für Setup und Tests (aus Projektroot ausführen: `node scripts/...`).

| Datei | Beschreibung |
|-------|--------------|
| **generate-vapid-keys.js** | Erzeugt VAPID-Keys für Push-Benachrichtigungen. Ausführen: `node scripts/generate-vapid-keys.js` |
| **test-email.js** | E-Mail-Versand testen (Konfiguration ggf. anpassen). Ausführen: `node scripts/test-email.js` |
| **test-form-submission.html** | Lokales Test-HTML für Formular-Einreichungen (im Browser öffnen) |
| **test-stundenkorrektur.html** | Lokales Test-HTML für Stundenkorrektur (im Browser öffnen) |

Diese Dateien werden nicht ins Deployment (Netlify) eingebunden.
