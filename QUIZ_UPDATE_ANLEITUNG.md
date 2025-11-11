# Quiz Update: DIN 19643 Allgemein

## Was wird gemacht?
Das alte "DIN 19643 Allgemein" Quiz wird durch ein neues Quiz mit 21 komplett neuen Fragen ersetzt.

## Alte Daten
- **Alte Fragen:** 8 Fragen
- **Alte Ergebnisse:** Werden gelöscht

## Neue Daten
- **Neue Fragen:** 21 Fragen
- **Kategorie:** Wasseraufbereitung
- **Bestehens-Score:** 70%
- **Zeit:** 30 Minuten

## So führen Sie das Update aus:

### Auf Netlify (Production):

1. **Öffnen Sie Netlify Dashboard:**
   - Gehen Sie zu: https://app.netlify.com
   - Wählen Sie Ihr "laola-intra2" Projekt

2. **Öffnen Sie die Neon Console:**
   - Gehen Sie zu: https://console.neon.tech
   - Wählen Sie Ihr Projekt
   - Klicken Sie auf "SQL Editor"

3. **Führen Sie das SQL-Script aus:**
   - Kopieren Sie den gesamten Inhalt von `database_quiz_update_din19643.sql`
   - Fügen Sie ihn in den SQL Editor ein
   - Klicken Sie auf "Run"

4. **Prüfen Sie das Ergebnis:**
   - Sie sollten sehen: "21 rows inserted"
   - Das alte Quiz wurde gelöscht
   - Das neue Quiz mit 21 Fragen ist aktiv

## Was passiert:

### Schritt 1: Alte Daten löschen
```sql
-- Löscht alle Ergebnisse des alten Quiz
DELETE FROM quiz_results WHERE quiz_id = ...

-- Löscht alle Fragen des alten Quiz
DELETE FROM quiz_questions WHERE quiz_id = ...

-- Löscht das alte Quiz
DELETE FROM quizzes WHERE title = 'DIN 19643 Allgemein'
```

### Schritt 2: Neues Quiz erstellen
```sql
-- Erstellt neues Quiz mit 21 Fragen
INSERT INTO quizzes ...
INSERT INTO quiz_questions ... (21x)
```

## Nach dem Update:

### Auf der Website:
1. Gehen Sie zu: Schulungen → Quiz
2. Sie sollten sehen:
   - **DIN 19643 Allgemein** mit **21 Fragen**
   - Alte Ranglisten-Einträge sind gelöscht
   - Neue Fragen sind verfügbar

### Die 21 neuen Fragen behandeln:
1. pH-Wert Management (Fragen 1-2, 9-10)
2. Chlor-Werte (Fragen 3-7, 19-20)
3. Redoxpotenzial (Fragen 8, 13-14)
4. Wasserqualität (Fragen 11, 15-18)
5. Aktivkohlefiltration (Frage 12)
6. Ziel der DIN 19643 (Frage 21)

## Wichtig:
⚠️ **Alle alten Quiz-Ergebnisse für "DIN 19643 Allgemein" werden gelöscht!**
⚠️ **Die Rangliste für dieses Quiz beginnt bei 0.**

## Bei Problemen:

Falls etwas schief geht, können Sie das alte Quiz nicht wiederherstellen.
Die Daten sind in der `database_quiz_data.sql` Datei gesichert.

---

**Erstellt:** $(date)
**Anzahl neue Fragen:** 21
**Bestehens-Score:** 70%

