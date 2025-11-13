# Meeting-Protokoll Debugging Guide

## 🔍 Fehlersuche

### Problem: "Fehler bei der Verarbeitung der Aufnahme"

#### 1. OpenAI API-Key überprüfen

**Symptom:** Fehler direkt nach "Jetzt transkribieren"

**Lösung:**
1. Gehen Sie zu **Netlify Dashboard**
2. **Site settings** → **Environment variables**
3. Prüfen Sie, ob `OPENAI_API_KEY` existiert
4. Key sollte mit `sk-proj-` oder `sk-` beginnen
5. Falls nicht vorhanden oder falsch:
   - Neuen Key erstellen: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Variable in Netlify setzen
   - **Trigger deploy** → **Clear cache and deploy**

#### 2. Netlify Function Logs prüfen

**So sehen Sie die Logs:**

1. **Netlify Dashboard** → Ihr Projekt
2. **Deploys** → Aktuelles Deployment anklicken
3. **Functions** Tab
4. **transcribe** Function anklicken
5. **Logs** ansehen

**Suchen Sie nach:**
- ✅ `OpenAI API key found` → Key ist vorhanden
- ❌ `OpenAI API key not configured` → Key fehlt
- ❌ `Incorrect API key` → Key ungültig
- ❌ `insufficient_quota` → Kein OpenAI Guthaben
- ✅ `Transcription completed` → Whisper hat funktioniert
- ✅ `Protocol validated successfully` → Alles OK

#### 3. Browser Console prüfen

**Chrome/Firefox:**
- F12 drücken → **Console** Tab

**Suchen Sie nach:**
```
Preparing audio for transcription...
Audio blob size: XXX bytes
Sending to API...
Response received: 200 (oder Fehlernummer)
```

**Häufige Fehlercodes:**
- `401`: API-Key ungültig
- `402`: Kein OpenAI Guthaben
- `429`: Zu viele Anfragen (Rate Limit)
- `500`: Server-Fehler (siehe Netlify Logs)
- `504`: Timeout (Aufnahme zu lang)

#### 4. OpenAI Guthaben prüfen

1. Gehen Sie zu [platform.openai.com/usage](https://platform.openai.com/usage)
2. Prüfen Sie Ihr Guthaben
3. Falls leer: **Billing** → **Add payment method**

**Kosten:**
- Test (2 Min): ~$0.01
- Normales Meeting (30 Min): ~$0.20

#### 5. Audio-Größe prüfen

**Maximum:** 25 MB

Wenn Ihre Aufnahme zu groß ist:
- Kürzere Aufnahmen machen (max. 60 Minuten)
- In mehrere kürzere Meetings aufteilen

---

## 🧪 Test-Aufnahme

**Minimal-Test (funktioniert API?):**

1. **Meeting-Protokoll** öffnen
2. **Aufnahme starten** 🎙️
3. **10 Sekunden sprechen**: "Dies ist ein Test. Heute haben wir über das Projekt gesprochen."
4. **Stoppen** ⏹️
5. **Transkribieren** klicken

**Erwartetes Ergebnis:**
- Nach 30-60 Sekunden: Protokoll erscheint
- Titel wie "Projekt-Besprechung" oder ähnlich
- Transkription sollte Ihren Text enthalten

**Falls das funktioniert:** API ist OK, Problem war bei längerer Aufnahme
**Falls das nicht funktioniert:** Prüfen Sie OpenAI API-Key (siehe oben)

---

## 🔧 Häufige Probleme & Lösungen

### "OpenAI API-Schlüssel nicht konfiguriert"

**Ursache:** Environment Variable fehlt

**Lösung:**
```bash
# In Netlify:
1. Site settings → Environment variables
2. Add variable:
   Key: OPENAI_API_KEY
   Value: sk-proj-...IhrSchlüssel...
3. Save → Trigger deploy
```

### "OpenAI API-Guthaben aufgebraucht"

**Ursache:** Kein Guthaben auf OpenAI Account

**Lösung:**
1. [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
2. Add payment method
3. Optional: Usage Limit setzen ($5-10 für den Start)

### "Zeitüberschreitung bei der Verarbeitung"

**Ursache:** Aufnahme zu lang oder langsame API

**Lösung:**
- Aufnahmen unter 60 Minuten halten
- Bei langen Meetings: In 2-3 Teile aufteilen
- Zu anderer Tageszeit versuchen (OpenAI kann ausgelastet sein)

### "Mikrofon-Zugriff verweigert"

**Ursache:** Browser-Berechtigung fehlt

**Lösung Chrome:**
1. Adressleiste → 🔒 Schloss-Symbol
2. **Mikrofon** → **Zulassen**
3. Seite neu laden

**Lösung Firefox:**
1. Adressleiste → 🔒 Schloss-Symbol  
2. **Berechtigungen** → **Mikrofon zugreifen**
3. Seite neu laden

### "Audio-Datei zu groß"

**Ursache:** Aufnahme > 25 MB

**Lösung:**
- Kürzere Meetings (max. 90 Minuten bei guter Qualität)
- Oder: Meeting in 2 Teile aufteilen

---

## 📊 Erwartete Verarbeitungszeiten

| Aufnahme-Länge | Transkription | Formatierung | Gesamt |
|----------------|---------------|--------------|--------|
| 1 Minute       | ~5 Sek        | ~5 Sek       | ~15 Sek|
| 5 Minuten      | ~15 Sek       | ~10 Sek      | ~30 Sek|
| 15 Minuten     | ~30 Sek       | ~15 Sek      | ~60 Sek|
| 30 Minuten     | ~60 Sek       | ~20 Sek      | ~90 Sek|
| 60 Minuten     | ~120 Sek      | ~30 Sek      | ~180 Sek|

**Hinweis:** Zeiten können variieren je nach OpenAI Auslastung

---

## 📞 Support Checklist

Wenn Sie den Admin kontaktieren, geben Sie bitte an:

- [ ] Aufnahme-Länge (Minuten)
- [ ] Audio-Größe (MB) - sichtbar in Browser Console
- [ ] Fehlermeldung (Screenshot)
- [ ] Browser (Chrome/Firefox/Safari + Version)
- [ ] Gerät (PC/Mac/Tablet)
- [ ] Zeitpunkt des Fehlers
- [ ] Netlify Function Logs (falls Admin-Zugriff)

---

## 🎯 Quick Fix Checklist

Versuchen Sie der Reihe nach:

1. [ ] Browser neu laden (Strg+F5 / Cmd+Shift+R)
2. [ ] Anderen Browser testen
3. [ ] Kürzere Test-Aufnahme (10 Sekunden)
4. [ ] OpenAI API-Key in Netlify prüfen
5. [ ] OpenAI Guthaben prüfen
6. [ ] Netlify Function Logs ansehen
7. [ ] 1 Stunde warten (falls Rate Limit)

---

**Entwickelt für LA OLA Intranet** 🏊‍♂️

