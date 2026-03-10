# SQL-Skripte / Datenbank

Alle SQL-Dateien des LA OLA Intranet sind hier gebündelt.

## Hauptdatei (empfohlen)

- **`all_sql_migrations.sql`** – Enthält die konsolidierten Migrationen für das Projekt.  
  In Neon: SQL Editor öffnen, Inhalt dieser Datei einfügen und ausführen.

## Einzelne Migrationen (optional)

Diese Skripte können bei Bedarf einzeln ausgeführt werden (z. B. wenn eine Tabelle oder Spalte später ergänzt wurde):

| Datei | Beschreibung |
|-------|--------------|
| `create_gefahrstoffe_table.sql` | Tabelle `gefahrstoffe` anlegen |
| `add_hersteller_to_gefahrstoffe.sql` | Spalte `hersteller` in `gefahrstoffe` ergänzen |
| `create_vacation_limits_table.sql` | Tabelle `schichtplan_vacation_limits` (Urlaubslimits) anlegen |
| `add_birth_date_to_employees.sql` | Spalte `birth_date` in `schichtplan_employees` ergänzen |
| `update_user_roles.sql` | Einmaliges Update von Benutzerrollen (Beispiel) |

**Hinweis:** Viele dieser Änderungen sind bereits in `all_sql_migrations.sql` enthalten. Einzeldateien nur nutzen, wenn Sie gezielt nachziehen oder die Hauptdatei bereits ausgeführt wurde.
