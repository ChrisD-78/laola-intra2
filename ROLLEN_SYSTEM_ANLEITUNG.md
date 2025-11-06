# 👥 Rollen-System - Anleitung & Setup

## ✅ Was wurde implementiert?

Ein vollständiges Rollen-Management-System mit 4 verschiedenen Benutzer-Rollen:

### 🎯 Verfügbare Rollen:

1. **👑 Admin**
   - Voller Zugriff auf alle Bereiche
   - Kann Benutzer erstellen und verwalten
   - Keine zusätzlichen Passwörter erforderlich
   - **Standard-Admins:** Christof Drost, Kirstin Kreusch

2. **📋 Verwaltung**
   - Standard-Rechte für Verwaltungspersonal
   - Zugriff auf alle Standard-Funktionen

3. **🔧 Technik**
   - Standard-Rechte für technisches Personal
   - Zugriff auf alle Standard-Funktionen

4. **👤 Benutzer**
   - Standard-Rechte für alle anderen Mitarbeiter
   - Zugriff auf alle Standard-Funktionen

---

## 📋 Setup-Schritte

### 1️⃣ Datenbank-Migration durchführen

**WICHTIG:** Sie müssen das Migrations-Script in Ihrer Neon-Datenbank ausführen!

```bash
# In Neon SQL Editor:
1. Öffnen Sie https://console.neon.tech
2. Wählen Sie Ihr Projekt
3. Gehen Sie zu "SQL Editor"
4. Kopieren Sie den Inhalt von database_roles_migration.sql
5. Führen Sie das Script aus
```

**Das Script:**
- ✅ Fügt `role` Spalte zur `users` Tabelle hinzu
- ✅ Migriert bestehende Daten (Admin/Benutzer)
- ✅ Erstellt Index für Performance
- ✅ Behält `is_admin` für Kompatibilität

### 2️⃣ Code deployen

```bash
git add .
git commit -m "Rollen-System implementiert: Admin, Verwaltung, Technik, Benutzer"
git push
```

### 3️⃣ Warten auf Deployment

- Netlify startet automatisch das Deployment
- Warten Sie 2-5 Minuten
- Überprüfen Sie: https://app.netlify.com

### 4️⃣ Neu anmelden (WICHTIG!)

**Sie MÜSSEN sich neu anmelden**, damit das Rollen-System funktioniert:

1. **Abmelden** aus der App
2. **Browser-Cache leeren**: `Cmd + Shift + R` (Mac) oder `Ctrl + Shift + R` (Windows)
3. **Neu anmelden** mit Admin-Konto

---

## 🚀 Verwendung

### Neuen Benutzer mit Rolle erstellen

1. Melden Sie sich als **Admin** an (Christof Drost oder Kirstin)
2. Gehen Sie zu **"Benutzerverwaltung"** in der Sidebar
3. Klicken Sie auf **"➕ Neuen Benutzer erstellen"**
4. Füllen Sie das Formular aus:
   - Benutzername
   - Anzeigename
   - Passwort (mind. 5 Zeichen)
   - **Rolle** (Dropdown):
     - Admin
     - Verwaltung
     - Technik
     - Benutzer
5. Klicken Sie auf **"Benutzer erstellen"**

### Rollen-Übersicht anzeigen

Die Benutzerverwaltung zeigt für jeden Benutzer:
- 👑 **Admin** - Lila Badge
- 📋 **Verwaltung** - Blauer Badge
- 🔧 **Technik** - Oranger Badge
- 👤 **Benutzer** - Grauer Badge

---

## 🔒 Berechtigungen

### Admin-Rechte

**Nur Admins** haben Zugriff auf:
- ✅ Benutzerverwaltung
- ✅ Benutzer erstellen
- ✅ Rollen zuweisen
- ✅ Alle Bereiche ohne zusätzliche Passwörter

### Andere Rollen

**Verwaltung, Technik, Benutzer:**
- ✅ Zugriff auf alle Standard-Funktionen
- ✅ Formulare ausfüllen
- ✅ Dokumente ansehen
- ✅ Aufgaben verwalten
- ✅ Chat nutzen
- ❌ KEIN Zugriff auf Benutzerverwaltung

---

## 📁 Geänderte Dateien

### Datenbank
- `database_roles_migration.sql` - Migrations-Script

### API-Endpunkte
- `src/app/api/auth/login/route.ts` - Login mit Rollen
- `src/app/api/users/route.ts` - Benutzer mit Rollen abrufen
- `src/app/api/users/create/route.ts` - Benutzer mit Rolle erstellen

### Frontend
- `src/components/AuthProvider.tsx` - Rollen-Support
- `src/app/admin/users/page.tsx` - Rollen-Dropdown & Anzeige

---

## 🎨 UI-Features

### Rollen-Dropdown im Formular
- Übersichtliche Auswahl aller 4 Rollen
- Hilftext mit Erklärung
- Standardmäßig "Benutzer" ausgewählt

### Rollen-Badges in Tabelle
- **Admin**: Lila mit 👑
- **Verwaltung**: Blau mit 📋
- **Technik**: Orange mit 🔧
- **Benutzer**: Grau mit 👤

### Info-Box
- Erklärt alle 4 Rollen
- Zeigt aktuelle Administratoren
- Responsive Grid-Layout

---

## 🔍 Datenbank-Struktur

```sql
users Table:
- id (UUID)
- username (VARCHAR)
- password (VARCHAR)
- display_name (VARCHAR)
- role (VARCHAR) ← NEU!
- is_admin (BOOLEAN) ← Beibehalten für Kompatibilität
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (VARCHAR)
- last_login (TIMESTAMP)
```

---

## 🧪 Testen

### Test 1: Admin-Login mit neuer Rolle
1. Login als Christof Drost oder Kirstin
2. Browser-Konsole öffnen (F12)
3. Sollte zeigen: `Role: Admin`

### Test 2: Benutzer mit verschiedenen Rollen erstellen
1. Öffnen Sie Benutzerverwaltung
2. Erstellen Sie Test-Benutzer mit verschiedenen Rollen
3. Überprüfen Sie Badges in der Tabelle

### Test 3: Nicht-Admin Login
1. Login als normaler Benutzer
2. Benutzerverwaltung sollte NICHT sichtbar sein

---

## 🛠️ Fehlerbehebung

### Problem: Role wird nicht angezeigt
**Lösung**: 
1. Führen Sie `database_roles_migration.sql` aus
2. Logout und neu einloggen
3. Browser-Cache leeren

### Problem: "Role is null"
**Lösung**:
```sql
-- Setze Default-Rolle für Benutzer ohne Rolle
UPDATE users 
SET role = 'Benutzer' 
WHERE role IS NULL;
```

### Problem: Alte Session zeigt keine Rolle
**Lösung**:
1. Komplett ausloggen
2. localStorage leeren (Browser DevTools)
3. Hard-Reload (`Cmd + Shift + R`)
4. Neu einloggen

---

## 📊 Migrations-Details

### Was passiert bei der Migration?

1. **Neue Spalte**: `role VARCHAR(50)` wird hinzugefügt
2. **Daten-Migration**: 
   - `is_admin = true` → `role = 'Admin'`
   - `is_admin = false` → `role = 'Benutzer'`
3. **Index**: Performance-Index für `role`
4. **Kompatibilität**: `is_admin` bleibt erhalten

### Rückwärts-Kompatibilität

Das System ist rückwärts-kompatibel:
- `is_admin` wird weiterhin gesetzt/gelesen
- `role = 'Admin'` setzt automatisch `is_admin = true`
- Bestehende Checks auf `is_admin` funktionieren weiter

---

## ✨ Zukünftige Erweiterungen

Mögliche zusätzliche Features:
- 🔐 Rollen-basierte Zugriffsrechte pro Bereich
- 📋 Rollen-spezifische Dashboards
- 🔧 Technik-spezifische Formulare/Bereiche
- 📊 Verwaltungs-Reports nur für Verwaltung
- 👥 Rollen-Gruppen und Hierarchien
- 📝 Audit-Log für Rollen-Änderungen

---

## 📞 Wichtige Hinweise

### Admin-Rolle
- Nur Admins können neue Benutzer erstellen
- Admins haben vollen Zugriff OHNE zusätzliche Passwörter
- Christof Drost und Kirstin Kreusch sind Standard-Admins

### Andere Rollen
- Verwaltung, Technik und Benutzer haben gleiche Basis-Rechte
- Unterscheidung für zukünftige rollenspezifische Features
- Keine zusätzlichen Einschränkungen im Moment

### Sicherheit
- Rollen werden in JWT/Session gespeichert
- Bei jedem Request wird Rolle aus Datenbank geladen
- Admin-Checks erfolgen auf Server-Seite

---

**Erstellt am:** 6. November 2025  
**Version:** 2.0  
**Status:** ✅ Bereit nach Datenbank-Migration

