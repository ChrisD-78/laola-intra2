# Herz-Kreislauf-Quiz hinzufügen - Anleitung

## 📋 Übersicht

Dieses Script fügt das neue Quiz "Herz-Kreislauf-Quiz" mit 18 Fragen zur Datenbank hinzu.

**Quiz-Details:**
- **Titel:** Herz-Kreislauf-Quiz
- **Kategorie:** Gesundheit
- **Anzahl Fragen:** 18
- **Bestehensgrenze:** 70%
- **Status:** Aktiv

## 🚀 Ausführung

### Schritt 1: Öffnen Sie den Neon SQL Editor

1. Gehen Sie zu: https://console.neon.tech
2. Wählen Sie Ihr Projekt aus
3. Klicken Sie auf **"SQL Editor"**

### Schritt 2: Script ausführen

1. Öffnen Sie die Datei `add_herz_kreislauf_quiz.sql`
2. Kopieren Sie den gesamten Inhalt
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf **"Run"** oder drücken Sie `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Schritt 3: Erfolg prüfen

Nach erfolgreicher Ausführung sollten Sie eine Meldung sehen:
```
NOTICE: Herz-Kreislauf-Quiz erfolgreich erstellt mit ID: [UUID]
```

## ✅ Verifizierung

Das Quiz sollte nun:
- ✅ In der Quiz-Übersicht unter "Schulungen → Quiz" erscheinen
- ✅ Im Ranking-System verfügbar sein
- ✅ Alle 18 Fragen korrekt enthalten

## 📝 Quiz-Inhalt

Das Quiz behandelt folgende Themen:
- Anatomie des Herzens (Kammern, Klappen)
- Blutkreislauf (großer und kleiner Kreislauf)
- Blutgefäße (Arterien, Venen, Kapillaren)
- Blutbestandteile (rote/weiße Blutkörperchen, Blutplättchen)
- Herzfunktion (Systole, Diastole, Puls)
- Herz-Kreislauf-Gesundheit

## 🔄 Wiederholte Ausführung

Das Script ist **idempotent** - es kann mehrfach ausgeführt werden:
- Wenn das Quiz bereits existiert, wird es zuerst gelöscht (inkl. aller Fragen und Ergebnisse)
- Dann wird es neu erstellt
- **WICHTIG:** Alle bisherigen Ergebnisse werden dabei gelöscht!

## 🐛 Fehlerbehebung

**Problem:** Script schlägt fehl
- **Lösung:** Stellen Sie sicher, dass die Tabellen `quizzes` und `quiz_questions` existieren
- Prüfen Sie die Datenbankverbindung

**Problem:** Quiz erscheint nicht in der Übersicht
- **Lösung:** Seite neu laden (F5)
- Prüfen Sie, ob `is_active = true` in der Datenbank gesetzt ist

