# LA OLA · Saunawelt · Aufgussplan-System

Drei eigenständige HTML-Seiten — kein Backend nötig, alle Daten im Browser-localStorage.

## Dateien

| Datei | Zweck |
|---|---|
| `admin.html` | Verwaltung: Wochenplan, Saunaevents, Saunen, Werbung, Daten |
| `display.html` | TV-Bildschirm im Saunabereich (Hochformat 9:16) |
| `gaeste.html` | Mobile Gäste-Ansicht (Smartphone) |

## Funktionsumfang

### Wochenplan
- Pro Wochentag (Mo–So) eigener Aufgussplan
- "Heute" automatisch markiert
- Plan zwischen Tagen kopieren
- Tag leeren in einem Klick

### Saunaevents
- Datum-spezifisch (z.B. „Lange Saunanacht" am 15.06.2026)
- Überschreibt automatisch den Wochenplan an diesem Tag
- TV wechselt im Event-Modus zu warm-orangenen Akzenten
- Gäste-Seite zeigt Event-Banner + Liste kommender Events

### Werbung (Scheduler) ✨ NEU
- **Mehrere Werbe-Slots** mit individuellen Zeitfenstern
- **Drei Quellen-Typen:**
  - 📁 Datei-Upload (Bild oder Video, Drag & Drop, Base64 → localStorage)
  - 🔗 Externe URL (Bild-/Video-Link)
  - ▶ YouTube (stumm, Endlosschleife)
- **Drei Schedule-Modi:**
  - Immer aktiv
  - Einmaliger Zeitraum (von-bis Datum + Uhrzeit)
  - Wöchentlich wiederkehrend (Wochentag-Pick + Uhrzeit-Range)
- **Priorität (1–10):** höchste gewinnt; gleiche Priorität rotiert automatisch
- **Anzeigedauer pro Slot** für Rotation einstellbar
- **Live-Status** auf Admin-Seite: „Läuft jetzt", „Ab DD.MM.YYYY", „Wöchentlich Mo, Fr"
- **Now-Playing-Banner** zeigt, was aktuell auf dem TV läuft
- **Speicherbelegung** wird live angezeigt
- TV-Display crossfadet zwischen Slots ohne Flackern

### Saunen
- Verwaltbar (Name, Temperatur)
- Werden in Aufguss-Dropdowns automatisch übernommen

### Daten
- JSON-Export / Import (inkl. eingebetteter Werbe-Dateien)
- Reset-Knopf
- Read-only-Vorschau der aktuellen Datenstruktur

## Datenstruktur (vorbereitet für Neon-Postgres)

```jsonc
{
  "version": 2,
  "saunas": { "finn": { "name": "...", "temp": "..." } },
  "schedules": {
    "mon": [{ "time": "11:00", "sauna": "finn", "type": "...", "scent": "..." }]
  },
  "events": [
    { "id": "ev_...", "title": "...", "date": "2026-06-15", "note": "...", "aufguesse": [...] }
  ],
  "adSlots": [
    {
      "id": "ad_...",
      "title": "Sommer-Spezial",
      "enabled": true,
      "priority": 7,
      "source": {
        "kind": "file",
        "dataUrl": "data:image/jpeg;base64,...",
        "fileName": "banner.jpg",
        "fileSize": 184320,
        "mime": "image/jpeg",
        "url": ""
      },
      "schedule": {
        "mode": "weekly",
        "startAt": "",
        "endAt": "",
        "weekly": {
          "days": ["fri","sat"],
          "fromTime": "18:00",
          "toTime": "22:00"
        }
      },
      "displayDuration": 30,
      "createdAt": "2026-05-02T08:00:00.000Z"
    }
  ]
}
```

### Mapping zu Neon-Postgres

| Tabelle | Felder |
|---|---|
| `saunas` | `key, name, temp` |
| `schedules` | `id, day_key, time, sauna_key, type, scent, position` |
| `events` | `id, title, date, note, created_at` |
| `event_aufguesse` | `id, event_id, time, sauna_key, type, scent, position` |
| `ad_slots` | `id, title, enabled, priority, source_kind, source_url, source_mime, schedule_mode, start_at, end_at, weekly_days, weekly_from, weekly_to, display_duration, created_at` |
| `ad_files` | `id, ad_slot_id, file_name, file_size, mime_type, blob_url` (S3/R2-Link statt Base64) |

Die JSON-Schlüssel entsprechen 1:1 den späteren Spaltennamen — Migration ist später nur ein JSON-Loop pro Datensatz.

## Bedienung

1. `admin.html` im Browser öffnen
2. Aufgüsse, Events, Werbung pflegen — alles speichert automatisch
3. `display.html` auf dem TV starten (Hochformat 9:16)
4. `gaeste.html` per QR-Code an Gäste teilen

Die drei Seiten teilen sich denselben localStorage-Schlüssel `laola_sauna_data`. Änderungen im Admin-Tab werden auf den anderen Tabs automatisch übernommen.

## Hinweise zum Browser-Limit

LocalStorage erlaubt ~5–10 MB pro Domain. Für viele oder lange Videos reicht das nicht — dann besser:
- Externe URL nutzen (Datei liegt auf einem Webserver)
- YouTube-Variante verwenden
- Später: Neon-Datenbank mit S3/R2 für Blob-Storage

## Technik

- Reines HTML/CSS/JS, keine Frameworks
- Schriften: Cormorant Garamond (Display) + Outfit (UI), via Google Fonts
- Responsiv (Mobile-Breakpoints)
- TV-Layout vh/vw-basiert für 9:16-Hochformat
