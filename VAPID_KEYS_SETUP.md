# VAPID Keys Setup für Push Notifications

## Schritt 1: VAPID Keys generieren

Führen Sie das Skript aus, um VAPID Keys zu generieren:

```bash
node generate-vapid-keys.js
```

Dies erstellt einen **Public Key** und einen **Private Key**.

## Schritt 2: Keys in Netlify konfigurieren

1. Gehen Sie zu Ihrem **Netlify Dashboard**
2. Wählen Sie Ihre Site aus
3. Gehen Sie zu **Site Settings** → **Environment Variables**
4. Fügen Sie folgende **Environment Variables** hinzu:

### Erforderliche Variablen:

| Variable Name | Wert | Beschreibung |
|--------------|------|--------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `BMUjs8y0rLzMZ-v2s5Z2H0oS-nB_XqLfVPfGw-zHmK5DTSbJpLCw-CJkph31o7-ezSie0jKLnpR2pAxqXpbc5L0` | Public Key (kann öffentlich sein) |
| `VAPID_PRIVATE_KEY` | `yd7Re9R6A7-HVaA8z4yCZCz1TviHYoEko66WZiBHq9A` | Private Key (**NIEMALS öffentlich!**) |
| `VAPID_SUBJECT` | `mailto:admin@laola.baederbook.de` | E-Mail-Adresse oder URI |

### Wichtig:

- ⚠️ **VAPID_PRIVATE_KEY** sollte **NIEMALS** in Client-seitigem Code verwendet werden
- ✅ **NEXT_PUBLIC_VAPID_PUBLIC_KEY** kann öffentlich sein (wird im Client verwendet)
- 🔒 Der **Private Key** wird nur Server-seitig verwendet

## Schritt 3: Site neu deployen

Nach dem Hinzufügen der Environment Variables:

1. Gehen Sie zu **Deploys** in Netlify
2. Klicken Sie auf **Trigger deploy** → **Clear cache and deploy site**
3. Warten Sie, bis der Deploy abgeschlossen ist

## Schritt 4: Testen

1. Öffnen Sie die Schichtplan-Seite
2. Klicken Sie auf "🔕 Benachrichtigungen aus"
3. Erlauben Sie Benachrichtigungen in Ihrem Browser
4. Der Button sollte sich zu "🔔 Benachrichtigungen an" ändern

## Fehlerbehebung

### "VAPID Keys sind nicht konfiguriert"

- Prüfen Sie, ob alle drei Environment Variables in Netlify gesetzt sind
- Stellen Sie sicher, dass die Site nach dem Hinzufügen der Variablen neu deployed wurde
- Prüfen Sie die Netlify Build Logs auf Fehler

### "Service Worker konnte nicht initialisiert werden"

- Stellen Sie sicher, dass die Seite über **HTTPS** läuft (erforderlich für Push Notifications)
- Prüfen Sie die Browser-Konsole (F12) für detaillierte Fehlermeldungen
- Stellen Sie sicher, dass `/sw.js` erreichbar ist

### "Push-Benachrichtigungen nicht erlaubt"

- Prüfen Sie die Browser-Einstellungen für Benachrichtigungen
- Erlauben Sie Benachrichtigungen für die Domain
- Einige Browser blockieren Benachrichtigungen, wenn die Seite nicht im Fokus ist

## Beispiel-Keys (nur für Entwicklung)

**WICHTIG:** Diese Keys sind nur Beispiele. Generieren Sie immer neue Keys für Produktion!

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMUjs8y0rLzMZ-v2s5Z2H0oS-nB_XqLfVPfGw-zHmK5DTSbJpLCw-CJkph31o7-ezSie0jKLnpR2pAxqXpbc5L0
VAPID_PRIVATE_KEY=yd7Re9R6A7-HVaA8z4yCZCz1TviHYoEko66WZiBHq9A
VAPID_SUBJECT=mailto:admin@laola.baederbook.de
```

## Weitere Informationen

- [Web Push Protocol](https://tools.ietf.org/html/rfc8291)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

