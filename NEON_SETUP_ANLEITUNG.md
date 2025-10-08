# 🚀 Neon Database Setup - Komplette Anleitung

## Schritt 1: Neon Account erstellen

1. Gehen Sie zu [neon.tech](https://neon.tech)
2. Klicken Sie auf **"Sign Up"** oder **"Get Started"**
3. Melden Sie sich mit GitHub, Google oder Email an
4. Der kostenlose Plan ist völlig ausreichend!

---

## Schritt 2: Neues Projekt erstellen

1. Nach dem Login klicken Sie auf **"Create Project"** oder **"New Project"**
2. Wählen Sie:
   - **Project name:** `laola-intra`
   - **Region:** Europe (Frankfurt oder nächstgelegene)
   - **PostgreSQL version:** 16 (neueste)
3. Klicken Sie auf **"Create Project"**
4. Warten Sie ~30 Sekunden

---

## Schritt 3: Connection String kopieren

Nach der Erstellung sehen Sie eine Connection String wie:
```
postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

1. **Kopieren Sie diese Connection String**
2. Speichern Sie sie sicher (Sie brauchen sie gleich!)

---

## Schritt 4: Datenbank-Schema erstellen

1. Klicken Sie in Neon auf **"SQL Editor"** (links im Menü)
2. Öffnen Sie die Datei **`neon_database_setup.sql`** in Ihrem Code-Editor
3. Kopieren Sie den **kompletten Inhalt**
4. Fügen Sie ihn in den Neon SQL Editor ein
5. Klicken Sie auf **"Run"** (oder drücken Sie Cmd+Enter)
6. Warten Sie bis "Success" erscheint

Sie sollten sehen:
```
NOTICE:  Neon Database Setup Complete!
NOTICE:  All tables created successfully
```

---

## Schritt 5: Abhängigkeiten installieren

Im Terminal:

```bash
npm install @neondatabase/serverless
```

---

## Schritt 6: Umgebungsvariablen konfigurieren

1. Erstellen Sie eine neue Datei `.env.local` im Projekt-Root:

```bash
# Im Projekt-Ordner
touch .env.local
```

2. Öffnen Sie `.env.local` und fügen Sie ein:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Ersetzen Sie die Connection String mit Ihrer echten von Schritt 3!**

---

## Schritt 7: Code aktualisieren

Die Dateien sind bereits vorbereitet:
- ✅ `src/lib/neon.ts` - Neon-Verbindung
- ✅ `neon_database_setup.sql` - Datenbank-Schema

**ABER:** Die `src/lib/db.ts` muss noch angepasst werden!

Sagen Sie mir Bescheid, wenn Sie bis hierher gekommen sind, dann passe ich den Code an!

---

## Schritt 8: Testen

Nach der Code-Anpassung:

```bash
# Dev-Server neu starten
npm run dev
```

Dann testen Sie die "Wiederkehrende Aufgaben" Seite!

---

## ✅ Vorteile von Neon

- 🚀 **Schneller** als Supabase für reine Datenbankoperationen
- 💰 **Kostenlos** bis 0.5 GB Storage
- 🌍 **Serverless** - automatisches Scaling
- 🔧 **Einfacher** - nur PostgreSQL, keine RLS-Policies nötig
- ⚡ **Auto-Suspend** - spart Ressourcen wenn nicht genutzt

---

## 🆘 Probleme?

### Problem: "Cannot find module '@neondatabase/serverless'"
**Lösung:**
```bash
npm install @neondatabase/serverless
```

### Problem: "Invalid connection string"
**Lösung:** 
- Überprüfen Sie die `.env.local` Datei
- Stellen Sie sicher, dass die Connection String vollständig ist
- Format: `postgresql://user:pass@host/db?sslmode=require`

### Problem: "Database does not exist"
**Lösung:**
- Führen Sie `neon_database_setup.sql` im Neon SQL Editor aus

---

## 📝 Nächste Schritte

1. ✅ Führen Sie Schritte 1-6 aus
2. ✅ Sagen Sie mir Bescheid
3. ✅ Ich passe den Code an
4. ✅ Sie testen die App
5. 🎉 Fertig!
