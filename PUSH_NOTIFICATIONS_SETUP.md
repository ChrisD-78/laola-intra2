# Web Push Notifications Setup für Schichtplan

## Übersicht

Diese Anleitung erklärt, wie Sie Web Push Notifications für den Schichtplan einrichten.

## 1. VAPID Keys generieren

Führen Sie das Skript aus, um VAPID Keys zu generieren:

```bash
node generate-vapid-keys.js
```

Dies erstellt einen Public Key und einen Private Key.

## 2. Umgebungsvariablen konfigurieren

### Lokale Entwicklung (.env.local)

Fügen Sie die generierten Keys in Ihre `.env.local` Datei ein:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=IHRE_PUBLIC_KEY
VAPID_PRIVATE_KEY=IHRE_PRIVATE_KEY
VAPID_SUBJECT=mailto:admin@laola.baederbook.de
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Produktion (Netlify Environment Variables)

1. Gehen Sie zu Netlify Dashboard → Site Settings → Environment Variables
2. Fügen Sie folgende Variablen hinzu:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Public Key - kann öffentlich sein)
   - `VAPID_PRIVATE_KEY` (Private Key - **NIEMALS öffentlich machen!**)
   - `VAPID_SUBJECT` (z.B. `mailto:admin@laola.baederbook.de`)
   - `NEXT_PUBLIC_APP_URL` (Ihre Produktions-URL, z.B. `https://laola.baederbook.de`)

## 3. Datenbank-Tabelle erstellen

Führen Sie das SQL-Skript in Ihrem Neon SQL Editor aus:

```sql
-- Siehe: create_push_subscriptions_table.sql
```

## 4. Service Worker registrieren

Der Service Worker (`/public/sw.js`) wird automatisch registriert, wenn ein Benutzer Push-Benachrichtigungen aktiviert.

## 5. Verwendung

### Für Benutzer:

1. Öffnen Sie die Schichtplan-Seite
2. Klicken Sie auf den Button "🔕 Benachrichtigungen aus"
3. Erlauben Sie Benachrichtigungen in Ihrem Browser
4. Der Button ändert sich zu "🔔 Benachrichtigungen an"

### Automatische Benachrichtigungen:

- Benachrichtigungen werden automatisch gesendet, wenn:
  - Der Schichtplan aktualisiert wird (POST oder PUT auf `/api/schichtplan/schedules`)
  - Ein Admin Schichten zuweist oder ändert

### Manuelle Benachrichtigungen senden:

Sie können auch manuell Benachrichtigungen senden über die API:

```bash
POST /api/push/send
{
  "title": "Titel",
  "body": "Nachricht",
  "icon": "/favicon-96x96.png",
  "url": "/schichtplan",
  "userId": "optional-user-id"
}
```

## 6. Browser-Unterstützung

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 16.4+)
- ❌ Safari (Desktop - keine Unterstützung)

## 7. Fehlerbehebung

### Benachrichtigungen funktionieren nicht:

1. Prüfen Sie, ob VAPID Keys korrekt gesetzt sind
2. Prüfen Sie, ob die Datenbank-Tabelle erstellt wurde
3. Prüfen Sie die Browser-Konsole auf Fehler
4. Stellen Sie sicher, dass HTTPS verwendet wird (erforderlich für Push Notifications)

### Service Worker wird nicht registriert:

1. Prüfen Sie, ob `/public/sw.js` existiert
2. Prüfen Sie die Browser-Konsole auf Fehler
3. Stellen Sie sicher, dass die Seite über HTTPS läuft

## 8. Sicherheit

- ⚠️ **WICHTIG**: Die `VAPID_PRIVATE_KEY` sollte **NIEMALS** in Client-seitigem Code verwendet werden
- ⚠️ Die `VAPID_PRIVATE_KEY` sollte nur in Server-seitigen Umgebungsvariablen gespeichert werden
- ✅ Die `NEXT_PUBLIC_VAPID_PUBLIC_KEY` kann öffentlich sein

