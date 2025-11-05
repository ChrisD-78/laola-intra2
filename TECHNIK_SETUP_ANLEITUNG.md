# Technik-Bereich Setup Anleitung

## Übersicht

Der neue **Technik-Bereich** wurde erfolgreich zu Ihrem LA OLA Intranet hinzugefügt! 🔧

## Was wurde erstellt?

### 1. **Sidebar Navigation**
- Neuer Button "Technik" mit 🔧 Icon wurde zur Sidebar hinzugefügt
- Der Button erscheint zwischen "Schulungen" und "Chat"

### 2. **Technik-Seite** (`/technik`)
Die neue Seite enthält:

#### Statistik-Übersicht (oben)
- **Überfällig** (rot) - Anzahl der überfälligen Prüfungen
- **Erledigt** (grün) - Anzahl der erledigten Prüfungen
- **Gesamtanzahl** (blau) - Gesamtzahl aller Prüfungen

#### Prüfungs-Tabelle
Spalten:
- **Rubrik** - Kategorie (z.B. Rutsche, Technikraum)
- **ID-Nr.** - Eindeutige ID (z.B. R-001)
- **Name** - Bezeichnung des Geräts/der Anlage
- **Nächste Prüfung** - Datum der nächsten fälligen Prüfung
- **Status** - Offen, Überfällig oder Erledigt
- **Details** - Button zum Öffnen des Detail-Popups

#### Detail-Popup
Beim Klick auf "Details" werden folgende Informationen angezeigt:
- Rubrik
- ID-Nr.
- Name
- Standort
- Bild (falls vorhanden)
- Letzte Prüfung
- Intervall (Täglich, Wöchentlich, Monatlich, etc.)
- Nächste Prüfung
- Bericht
- Bemerkungen
- In-/Außer-Betrieb Status
- Kontaktdaten

#### Funktionen
- ✅ **Als erledigt markieren** - Ändert den Status auf "Erledigt"
- 🗑️ **Löschen** - Entfernt die Prüfung (mit Bestätigung)
- ➕ **Neue Prüfung** - Erstellt eine neue technische Prüfung

### 3. **API-Route** (`/api/technik`)
Vollständige REST API mit:
- **GET** - Alle Prüfungen abrufen
- **POST** - Neue Prüfung erstellen
- **PATCH** - Prüfung aktualisieren (z.B. Status ändern)
- **DELETE** - Prüfung löschen

### 4. **Datenbankfunktionen** (`src/lib/db.ts`)
Neue Funktionen:
```typescript
getTechnikInspections()
createTechnikInspection()
updateTechnikInspection()
deleteTechnikInspection()
```

### 5. **SQL-Skript**
Datei: `create_technik_inspections_table.sql`

## 🚀 Datenbank Setup

### Schritt 1: Neon SQL Editor öffnen
1. Gehen Sie zu [Neon Console](https://console.neon.tech)
2. Wählen Sie Ihr Projekt aus
3. Öffnen Sie den SQL Editor

### Schritt 2: SQL-Skript ausführen
1. Öffnen Sie die Datei `create_technik_inspections_table.sql`
2. Kopieren Sie den gesamten Inhalt
3. Fügen Sie ihn in den Neon SQL Editor ein
4. Klicken Sie auf "Run" oder drücken Sie `Cmd/Ctrl + Enter`

### Schritt 3: Verifizierung
Nach der Ausführung sollten Sie folgende Erfolgsmeldungen sehen:
```
==============================================
Technik Inspections Table Created!
Table: technik_inspections
Ready to store technical inspection data
==============================================
```

## 📊 Tabellen-Struktur

Die `technik_inspections` Tabelle enthält:

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel (automatisch generiert) |
| rubrik | VARCHAR(100) | Kategorie der Prüfung |
| id_nr | VARCHAR(100) | ID-Nummer des Geräts |
| name | VARCHAR(255) | Name/Bezeichnung |
| standort | VARCHAR(255) | Standort des Geräts |
| bild_url | TEXT | URL zum Bild (optional) |
| letzte_pruefung | VARCHAR(100) | Datum der letzten Prüfung |
| interval | VARCHAR(50) | Prüfintervall |
| naechste_pruefung | VARCHAR(100) | Datum der nächsten Prüfung |
| bericht | TEXT | Prüfungsbericht (optional) |
| bemerkungen | TEXT | Zusätzliche Bemerkungen (optional) |
| in_betrieb | BOOLEAN | In/Außer Betrieb (Standard: true) |
| kontaktdaten | TEXT | Kontaktinformationen (optional) |
| status | VARCHAR(50) | Status: Offen/Überfällig/Erledigt |
| created_at | TIMESTAMP | Erstellungsdatum |
| updated_at | TIMESTAMP | Aktualisierungsdatum |

### Indizes für Performance
- `idx_technik_inspections_status` - Schnelle Filterung nach Status
- `idx_technik_inspections_naechste_pruefung` - Sortierung nach Prüfungsdatum
- `idx_technik_inspections_rubrik` - Filterung nach Rubrik

## 🎯 Verwendung

### Neue Prüfung erstellen
1. Klicken Sie auf "Technik" in der Sidebar
2. Klicken Sie auf "+ Neue Prüfung"
3. Füllen Sie das Formular aus:
   - **Pflichtfelder**: Rubrik, ID-Nr., Name, Standort, Letzte Prüfung, Intervall, Nächste Prüfung
   - **Optional**: Bild-URL, Kontaktdaten, Bericht, Bemerkungen
4. Setzen Sie den Status "In Betrieb" falls zutreffend
5. Klicken Sie auf "Prüfung anlegen"

### Prüfungs-Intervalle
Folgende Intervalle sind verfügbar:
- Täglich
- Wöchentlich
- Monatlich
- Vierteljährlich
- Halbjährlich
- Jährlich
- 2 Jahre
- 3 Jahre

### Status-Automatik
Der Status wird automatisch berechnet:
- **Überfällig** 🚨 - Wenn das Datum der nächsten Prüfung überschritten ist
- **Offen** - Wenn die Prüfung noch aussteht
- **Erledigt** ✅ - Wenn die Prüfung als erledigt markiert wurde

### Details anzeigen
1. Klicken Sie in der Tabelle auf "Details"
2. Das Popup zeigt alle Informationen an
3. Sie können die Prüfung als erledigt markieren oder löschen

## 🎨 Design

Das Design ist konsistent mit dem Rest des Intranets:
- Gradient-Header (Blau zu Lila)
- Moderne Statistik-Karten mit Icons
- Übersichtliche Tabelle mit Hover-Effekten
- Responsive Design für Mobile und Desktop
- Überfällige Prüfungen werden rot hervorgehoben

## ⚙️ Technische Details

### Dateien erstellt/geändert:
1. `src/components/Sidebar.tsx` - Technik-Button hinzugefügt
2. `src/app/technik/page.tsx` - Neue Seite erstellt
3. `src/app/api/technik/route.ts` - API-Route erstellt
4. `src/lib/db.ts` - Datenbankfunktionen hinzugefügt
5. `create_technik_inspections_table.sql` - SQL-Skript erstellt

### Abhängigkeiten:
- Verwendet bestehende Neon Database Connection
- Nutzt Next.js 14 App Router
- React Hooks (useState, useEffect)
- Tailwind CSS für Styling

## 🐛 Troubleshooting

### "Failed to fetch inspections"
- Überprüfen Sie, ob die Datenbank-Tabelle erstellt wurde
- Prüfen Sie die DATABASE_URL in Ihrer `.env.local`

### "Failed to create inspection"
- Stellen Sie sicher, dass alle Pflichtfelder ausgefüllt sind
- Überprüfen Sie die Browser-Konsole für detaillierte Fehler

### Tabelle existiert nicht
- Führen Sie das SQL-Skript `create_technik_inspections_table.sql` aus
- Stellen Sie sicher, dass die `update_updated_at_column()` Funktion existiert (aus dem Haupt-Setup-Skript)

## 📝 Nächste Schritte

1. **Datenbank einrichten** - SQL-Skript ausführen
2. **Erste Prüfung erstellen** - Testen Sie die Funktionalität
3. **Bilder hinzufügen** - Laden Sie Bilder auf einen Server/CDN und verwenden Sie die URLs
4. **Benachrichtigungen** (optional) - Erweitern Sie das System um E-Mail-Benachrichtigungen bei überfälligen Prüfungen

## ✅ Fertig!

Der Technik-Bereich ist jetzt vollständig integriert und einsatzbereit! 🎉

Bei Fragen oder Problemen können Sie die Implementierung in den oben genannten Dateien überprüfen.

