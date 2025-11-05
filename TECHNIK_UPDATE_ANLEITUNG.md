# Technik-Bereich Update - PDF-Upload & Rubriken

## 🎉 Neue Features

Der Technik-Bereich wurde mit wichtigen neuen Funktionen erweitert!

### ✨ Was wurde hinzugefügt:

#### 1. **Feste Rubrik-Kategorien**
Statt freier Texteingabe gibt es jetzt ein Dropdown-Menü mit folgenden Rubriken:
- 📊 **Messgeräte**
- 🔧 **Wartungen**
- ✅ **Prüfungen**
- ⚡ **Elektrische Prüfungen**
- 💨 **Lüftungen**

#### 2. **PDF-Upload für Bilder**
- Statt nur einer URL kann jetzt ein **PDF hochgeladen** werden
- Das PDF wird **zentral oben mittig** in der Detailansicht angezeigt
- Anzeige als eingebettetes PDF mit Vorschau (500px Höhe)
- Link zum Öffnen im neuen Tab
- Dateiname wird gespeichert und angezeigt

#### 3. **PDF-Upload für Berichte**
- Berichte werden jetzt als **PDF hochgeladen** (statt nur Text)
- Das Bericht-PDF wird in der Detailansicht angezeigt (400px Höhe)
- Link zum Öffnen im neuen Tab
- Dateiname wird gespeichert und angezeigt

#### 4. **Verbesserte Detailansicht**
- **Bild-PDF**: Zentral oben, große Vorschau (500px)
- **Details**: Übersichtlich in zwei Spalten
- **Bericht-PDF**: Unterhalb der Details mit Vorschau
- Beide PDFs können direkt in der Ansicht betrachtet werden
- Links zum Öffnen in einem neuen Tab

## 🗃️ Datenbank-Update

### Wenn Sie die Tabelle NEU erstellen:

Führen Sie das **aktualisierte** SQL-Skript aus:
```sql
-- In Neon SQL Editor ausführen
-- Datei: create_technik_inspections_table.sql
```

### Wenn Sie die Tabelle BEREITS haben:

Führen Sie das **Update-Skript** aus:
```sql
-- In Neon SQL Editor ausführen
-- Datei: update_technik_inspections_table.sql
```

Dieses Skript:
- ✅ Fügt neue Felder hinzu: `bild_name`, `bericht_url`, `bericht_name`
- ✅ Migriert alte Text-Berichte zu Bemerkungen
- ✅ Aktualisiert die Tabelle ohne Datenverlust

## 📊 Neue Datenbank-Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| bild_url | TEXT | URL zum Bild-PDF |
| bild_name | VARCHAR(255) | Dateiname des Bild-PDFs |
| bericht_url | TEXT | URL zum Bericht-PDF |
| bericht_name | VARCHAR(255) | Dateiname des Bericht-PDFs |

## 🎯 Verwendung

### Neue Prüfung mit PDFs erstellen:

1. Klicken Sie auf **"+ Neue Prüfung"**
2. Wählen Sie eine **Rubrik** aus dem Dropdown:
   - Messgeräte
   - Wartungen
   - Prüfungen
   - Elektrische Prüfungen
   - Lüftungen
3. Füllen Sie die Pflichtfelder aus
4. **Bild hochladen**: Klicken Sie auf "Datei auswählen" bei "Bild (PDF)"
5. **Bericht hochladen**: Klicken Sie auf "Datei auswählen" bei "Bericht (PDF)"
6. Klicken Sie auf **"Prüfung anlegen"**

### Upload-Prozess:
- Das System zeigt "Wird hochgeladen..." während des Uploads
- Beide PDFs werden zu Vercel Blob hochgeladen
- Nach erfolgreichem Upload wird die Prüfung gespeichert

### Detailansicht:
1. Klicken Sie auf **"Details"** in der Tabelle
2. **Bild-PDF**: Wird zentral oben mit 500px Höhe angezeigt
3. **Details**: Alle Informationen übersichtlich dargestellt
4. **Bericht-PDF**: Wird unterhalb mit 400px Höhe angezeigt
5. Beide PDFs haben einen **"PDF in neuem Tab öffnen"** Link

## 🔄 Migration von alten Daten

Falls Sie bereits Prüfungen mit Text-Berichten haben:
- Das Update-Skript migriert diese automatisch zu "Bemerkungen"
- Sie können dann neue Bericht-PDFs hochladen

## ⚙️ Technische Details

### Geänderte Dateien:
1. ✅ `src/app/technik/page.tsx` - Rubrik-Dropdown, PDF-Uploads, PDF-Anzeige
2. ✅ `src/app/api/technik/route.ts` - Neue Felder in API
3. ✅ `src/lib/db.ts` - Type-Definitionen aktualisiert
4. ✅ `create_technik_inspections_table.sql` - Tabellen-Schema aktualisiert
5. ✅ `update_technik_inspections_table.sql` - Migration für bestehende Tabellen

### PDF-Upload:
- Nutzt bestehende `/api/upload/pdf` Route
- Speichert auf Vercel Blob Storage
- Unterstützt nur PDF-Dateien (`.pdf`)
- Automatische eindeutige Dateinamen (Random Suffix)

### PDF-Anzeige:
- Verwendet `<iframe>` für eingebettete Vorschau
- Responsive Design
- Fallback für Browser ohne PDF-Support
- Link zum Öffnen im neuen Tab

## 📝 Beispiel-Workflow

### Beispiel: Messgerät prüfen
1. **Neue Prüfung erstellen**
   - Rubrik: "Messgeräte"
   - ID-Nr: "M-001"
   - Name: "Chlor-Messgerät Pool 1"
   - Standort: "Technikraum Nord"

2. **PDFs hochladen**
   - Bild: Foto des Messgeräts als PDF
   - Bericht: Prüfprotokoll als PDF

3. **Intervall setzen**
   - Letzte Prüfung: 01.01.2025
   - Intervall: Jährlich
   - Nächste Prüfung: 01.01.2026

4. **Speichern & Prüfen**
   - System lädt PDFs hoch
   - Prüfung wird gespeichert
   - In Tabelle sichtbar

5. **Details anzeigen**
   - Klick auf "Details"
   - Bild-PDF wird oben angezeigt
   - Alle Details sichtbar
   - Bericht-PDF wird unten angezeigt

## ✅ Vorteile der neuen Funktionen

### Rubrik-Dropdown:
- ✅ Konsistente Kategorisierung
- ✅ Keine Tippfehler
- ✅ Bessere Filterung möglich
- ✅ Übersichtliche Organisation

### PDF-Upload:
- ✅ Professionelle Dokumentation
- ✅ Original-Dokumente direkt verfügbar
- ✅ Sichere Speicherung auf Vercel Blob
- ✅ Direkte Vorschau in der Anwendung
- ✅ Keine externen Links notwendig

### Zentrale Anzeige:
- ✅ Alle Informationen auf einen Blick
- ✅ Professionelle Darstellung
- ✅ Einfache Navigation
- ✅ Schneller Zugriff auf Dokumente

## 🐛 Troubleshooting

### "Failed to upload PDF"
- Stellen Sie sicher, dass `BLOB_READ_WRITE_TOKEN` in `.env.local` gesetzt ist
- Überprüfen Sie die Vercel Blob Konfiguration

### PDF wird nicht angezeigt
- Einige Browser blockieren eingebettete PDFs - nutzen Sie den "In neuem Tab öffnen" Link
- Stellen Sie sicher, dass die PDF-URL öffentlich zugänglich ist

### Alte Tabelle aktualisieren
- Führen Sie `update_technik_inspections_table.sql` aus
- Überprüfen Sie mit: `SELECT * FROM information_schema.columns WHERE table_name = 'technik_inspections'`

## 🚀 Deployment

Nach dem Git Push:
1. Vercel deployt automatisch
2. Datenbank-Update muss manuell in Neon ausgeführt werden
3. Testen Sie die PDF-Upload-Funktion
4. Erstellen Sie Ihre erste Prüfung mit PDFs!

## 📞 Support

Bei Fragen oder Problemen:
- Überprüfen Sie die Browser-Konsole für Fehler
- Stellen Sie sicher, dass alle SQL-Skripte ausgeführt wurden
- Testen Sie den PDF-Upload mit einer kleinen Test-PDF

---

**Viel Erfolg mit dem verbesserten Technik-Bereich!** 🔧✨

