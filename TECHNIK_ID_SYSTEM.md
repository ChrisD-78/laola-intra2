# Technik-Bereich: Eindeutiges ID-System

## 🔢 Automatische ID-Generierung

Der Technik-Bereich verfügt nun über ein **automatisches ID-System** mit eindeutigen IDs basierend auf der gewählten Rubrik.

## 📋 ID-Format

Die ID-Nr. setzt sich zusammen aus:
- **3 Buchstaben** (Präfix basierend auf der Rubrik)
- **Bindestrich** (-)
- **3 Ziffern** (fortlaufende Nummer mit führenden Nullen)

### Rubrik-Präfixe:

| Rubrik | Präfix | Beispiel-IDs |
|--------|--------|--------------|
| Messgeräte | **MES** | MES-001, MES-002, MES-003 |
| Wartungen | **WAR** | WAR-001, WAR-002, WAR-003 |
| Prüfungen | **PRÜ** | PRÜ-001, PRÜ-002, PRÜ-003 |
| Elektrische Prüfungen | **ELE** | ELE-001, ELE-002, ELE-003 |
| Lüftungen | **LÜF** | LÜF-001, LÜF-002, LÜF-003 |

## ✨ Funktionsweise

### 1. Automatische Generierung
- Beim Öffnen des Formulars wird automatisch die nächste verfügbare ID für die gewählte Rubrik geladen
- Die ID wird in Echtzeit angezeigt
- Das ID-Feld ist **read-only** (nicht editierbar)

### 2. Rubrik-Änderung
- Wenn Sie die Rubrik im Formular ändern, wird automatisch eine neue passende ID generiert
- Beispiel: 
  - Wählen Sie "Messgeräte" → ID: MES-001
  - Ändern Sie zu "Wartungen" → ID: WAR-001

### 3. Eindeutige IDs
- Jede ID kann nur **einmal** vergeben werden
- Die Datenbank verhindert Duplikate durch einen UNIQUE Constraint
- Bei Konflikten wird automatisch die nächste verfügbare ID generiert

## 🗃️ Datenbank-Setup

### Schritt 1: UNIQUE Constraint hinzufügen
Führen Sie das SQL-Skript aus:
```sql
-- In Neon SQL Editor ausführen
-- Datei: add_unique_constraint_id_nr.sql
```

Das Skript:
- ✅ Fügt UNIQUE Constraint hinzu
- ✅ Erstellt Index für Performance
- ✅ Stellt sicher, dass jede ID nur einmal existiert

### Schritt 2: Testen
Nach der Ausführung können Sie testen:
```sql
-- Versuchen Sie, eine doppelte ID einzufügen (sollte fehlschlagen)
INSERT INTO technik_inspections (id_nr, rubrik, name, standort, letzte_pruefung, interval, naechste_pruefung)
VALUES ('MES-001', 'Messgeräte', 'Test', 'Test', '2025-01-01', 'Jährlich', '2026-01-01');
```

## 🎯 Verwendung

### Neue Prüfung erstellen:

1. **Formular öffnen**
   - Klicken Sie auf "+ Neue Prüfung"

2. **Rubrik wählen**
   - Wählen Sie eine Rubrik aus dem Dropdown
   - Die ID wird **automatisch** generiert (z.B. MES-001)
   - Das Format wird unterhalb des Feldes angezeigt

3. **ID wird angezeigt**
   - Das ID-Feld ist grau hinterlegt (read-only)
   - Sie sehen die nächste verfügbare ID für diese Rubrik
   - Beispiel: "MES-005" bedeutet, es gibt bereits MES-001 bis MES-004

4. **Formular ausfüllen**
   - Füllen Sie die restlichen Felder aus
   - Die ID bleibt fest und ändert sich nur, wenn Sie die Rubrik ändern

5. **Speichern**
   - Klicken Sie auf "Prüfung anlegen"
   - Die ID wird mit der Prüfung gespeichert
   - Bei Duplikaten (sehr selten) wird eine neue ID generiert

## 🔍 Beispiel-Szenarien

### Szenario 1: Erste Prüfung einer Rubrik
```
Rubrik: Messgeräte
Generierte ID: MES-001
Status: ✅ Erfolgreich
```

### Szenario 2: Weitere Prüfung derselben Rubrik
```
Rubrik: Messgeräte (existierende: MES-001, MES-002)
Generierte ID: MES-003
Status: ✅ Erfolgreich
```

### Szenario 3: Rubrik wechseln während der Eingabe
```
Schritt 1: Rubrik "Messgeräte" → ID: MES-004
Schritt 2: Rubrik ändern zu "Wartungen" → ID: WAR-001
Schritt 3: Zurück zu "Messgeräte" → ID: MES-004
Status: ✅ ID passt sich automatisch an
```

### Szenario 4: Konflikt (sehr selten)
```
User A erstellt: MES-005
User B versucht gleichzeitig: MES-005
Ergebnis: User B erhält Fehlermeldung
Aktion: Automatisch neue ID MES-006 wird geladen
Status: ✅ Konflikt aufgelöst
```

## 📊 ID-Übersicht in der Tabelle

Die Tabelle zeigt alle Prüfungen mit ihren IDs:

| Rubrik | ID-Nr. | Name |
|--------|--------|------|
| Messgeräte | MES-001 | Chlor-Messgerät Pool 1 |
| Messgeräte | MES-002 | pH-Meter Becken 2 |
| Wartungen | WAR-001 | Filterpumpe Hauptbecken |
| Elektrische Prüfungen | ELE-001 | Notstromgenerator |
| Lüftungen | LÜF-001 | Lüftungsanlage Umkleide |

Sie können leicht erkennen:
- Welche Rubrik die Prüfung betrifft
- Die fortlaufende Nummer innerhalb der Rubrik
- Wie viele Prüfungen pro Rubrik existieren

## ⚙️ Technische Details

### API-Endpunkte

#### 1. Nächste verfügbare ID abrufen
```
GET /api/technik/next-id?rubrik=Messgeräte

Response:
{
  "nextId": "MES-005",
  "prefix": "MES",
  "number": 5
}
```

#### 2. Prüfung erstellen (mit Duplikat-Check)
```
POST /api/technik
Body: { id_nr: "MES-001", ... }

Success (201):
{ id: "...", id_nr: "MES-001", ... }

Conflict (409):
{ 
  error: "ID-Nr. already exists",
  message: "Diese ID-Nr. wird bereits verwendet..." 
}
```

### Datenbankstruktur

```sql
-- UNIQUE Constraint
ALTER TABLE technik_inspections 
ADD CONSTRAINT technik_inspections_id_nr_unique UNIQUE (id_nr);

-- Index für Performance
CREATE INDEX idx_technik_inspections_id_nr 
ON technik_inspections (id_nr);
```

### Frontend-Logik

```typescript
// Automatische ID-Generierung beim Öffnen/Rubrik-Änderung
useEffect(() => {
  const fetchNextId = async () => {
    const response = await fetch(`/api/technik/next-id?rubrik=${rubrik}`)
    const data = await response.json()
    setFormData(prev => ({ ...prev, id_nr: data.nextId }))
  }
  if (showAddForm) fetchNextId()
}, [formData.rubrik, showAddForm])
```

## ✅ Vorteile des Systems

1. **🚀 Automatisch**: Keine manuelle ID-Eingabe erforderlich
2. **✅ Eindeutig**: Duplikate werden verhindert
3. **📊 Strukturiert**: Klare Zuordnung zu Rubriken
4. **🔍 Übersichtlich**: Leicht zu erkennen und zu sortieren
5. **🛡️ Sicher**: Datenbank-Constraints verhindern Fehler
6. **⚡ Schnell**: Automatische Generierung in Echtzeit
7. **👥 Mehrbenutzer-sicher**: Konflikte werden aufgelöst

## 🐛 Troubleshooting

### ID wird nicht generiert
- **Ursache**: API-Endpunkt nicht erreichbar
- **Lösung**: Überprüfen Sie, ob die Anwendung läuft und `/api/technik/next-id` funktioniert

### "ID already exists" Fehler
- **Ursache**: Gleichzeitige Erstellung durch mehrere Benutzer (selten)
- **Lösung**: Wird automatisch aufgelöst - neue ID wird geladen

### UNIQUE Constraint Fehler in der Datenbank
- **Ursache**: UNIQUE Constraint wurde noch nicht hinzugefügt
- **Lösung**: Führen Sie `add_unique_constraint_id_nr.sql` aus

### ID-Format stimmt nicht
- **Ursache**: Falsche Rubrik-Zuordnung
- **Lösung**: Überprüfen Sie die `prefixMap` in `/api/technik/next-id/route.ts`

## 📈 Zukünftige Erweiterungen

Mögliche zukünftige Features:
- 📊 Statistiken pro Rubrik-Präfix
- 🔍 Suche nach ID-Bereichen
- 📋 Export mit ID-Sortierung
- 🏷️ Benutzerdefinierte Präfixe (optional)

## 📝 Migration bestehender Daten

Falls Sie bereits Prüfungen mit manuellen IDs haben:

### Option 1: Behalten der bestehenden IDs
```sql
-- IDs werden beibehalten, neue Prüfungen bekommen automatische IDs
-- Keine Aktion erforderlich
```

### Option 2: Umbenennung bestehender IDs
```sql
-- Beispiel: Alle IDs in das neue Format konvertieren
UPDATE technik_inspections 
SET id_nr = CONCAT('MES-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 3, '0'))
WHERE rubrik = 'Messgeräte';
```

## ✨ Zusammenfassung

Das neue ID-System bietet:
- ✅ Automatische Generierung
- ✅ Eindeutige IDs
- ✅ Strukturierte Kategorisierung
- ✅ Benutzerfreundliche Oberfläche
- ✅ Konfliktvermeidung
- ✅ Professionelle Dokumentation

**Viel Erfolg mit dem verbesserten Technik-Bereich!** 🔧✨

