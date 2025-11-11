-- Update DIN 19643 Allgemein Quiz
-- Entfernt altes Quiz und fügt neues mit 21 Fragen ein

-- 1. Lösche alle Ergebnisse für das alte DIN 19643 Allgemein Quiz
DELETE FROM quiz_results 
WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'DIN 19643 Allgemein');

-- 2. Lösche alle Fragen für das alte Quiz
DELETE FROM quiz_questions 
WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'DIN 19643 Allgemein');

-- 3. Lösche das alte Quiz selbst
DELETE FROM quizzes 
WHERE title = 'DIN 19643 Allgemein';

-- 4. Erstelle das neue DIN 19643 Allgemein Quiz
INSERT INTO quizzes (id, title, description, category, total_questions, passing_score, time_limit_minutes, is_active, created_at)
VALUES (
  'din19643-allgemein',
  'DIN 19643 Allgemein',
  'Grundlegendes Wissen zu DIN 19643 - pH-Wert, Chlor, Wasserqualität und hygienische Standards',
  'Wasseraufbereitung',
  21,
  70,
  30,
  true,
  NOW()
);

-- 5. Füge die 21 neuen Fragen ein
INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES

-- Frage 1
('din19643-allgemein',
'Was ist bei einer Überschreitung des pH-Wertes über 7,8 zu tun?',
'Mehr Chlor zudosieren',
'pH-Wert mit Säure senken',
'Wasser aufheizen',
'Filter rückspülen',
'B',
1),

-- Frage 2
('din19643-allgemein',
'Welche Wirkung hat ein zu hoher pH-Wert auf die Desinfektionswirkung von Chlor?',
'Keine Auswirkung',
'Desinfektionswirkung steigt',
'Desinfektionswirkung sinkt',
'Chlor wird stabiler',
'C',
2),

-- Frage 3
('din19643-allgemein',
'Welcher freie Chlorwert ist für Schwimmerbecken nach DIN 19643 gefordert?',
'0,1–0,3 mg/l',
'0,3–0,6 mg/l',
'0,4–0,8 mg/l',
'0,6–1,0 mg/l',
'B',
3),

-- Frage 4
('din19643-allgemein',
'Was ist zu tun, wenn der freie Chlorwert unter 0,3 mg/l liegt?',
'Bad schließen',
'Chlorzugabe erhöhen',
'Filter rückspülen',
'pH-Wert erhöhen',
'B',
4),

-- Frage 5
('din19643-allgemein',
'Wie hoch darf der gebundene Chlorwert maximal sein?',
'0,1 mg/l',
'0,2 mg/l',
'0,3 mg/l',
'0,5 mg/l',
'B',
5),

-- Frage 6
('din19643-allgemein',
'Was bedeutet ein zu hoher gebundener Chlorwert?',
'Zu wenig Filtration',
'Zu viel Frischwasser',
'Zu viele organische Belastungen',
'Zu wenig pH-Regulierung',
'C',
6),

-- Frage 7
('din19643-allgemein',
'Welche Maßnahme hilft, wenn gebundenes Chlor regelmäßig zu hoch ist?',
'Aktivkohlezugabe erhöhen',
'pH-Wert senken',
'Chlorzufuhr drosseln',
'Filterlaufzeit verkürzen',
'A',
7),

-- Frage 8
('din19643-allgemein',
'Was geschieht bei zu niedrigem Redoxpotenzial (unter 750 mV)?',
'Gute Desinfektionswirkung',
'Unzureichende Desinfektion',
'Überchlorierung',
'Zu hoher pH-Wert',
'B',
8),

-- Frage 9
('din19643-allgemein',
'Was kann ein zu niedriger pH-Wert (< 6,8) verursachen?',
'Kalkablagerungen',
'Korrosion an metallischen Teilen',
'Schlechte Desinfektion',
'Trübung',
'B',
9),

-- Frage 10
('din19643-allgemein',
'Welche Wirkung hat zu hoher pH-Wert auf Trübungen?',
'Keine',
'Sie nehmen ab',
'Sie nehmen zu',
'Wasser wird klarer',
'C',
10),

-- Frage 11
('din19643-allgemein',
'Was ist bei zu hohem Nitratwert zu prüfen?',
'Frischwasseranteil',
'Filtergeschwindigkeit',
'Chlorpumpe',
'Wassertemperatur',
'A',
11),

-- Frage 12
('din19643-allgemein',
'Was ist der Zweck der Aktivkohlefiltration in DIN 19643-4?',
'Entfernung von Bakterien',
'Entfernung von Chloraminen und organischen Stoffen',
'Entfernung von Kalk',
'Erhöhung des pH-Wertes',
'B',
12),

-- Frage 13
('din19643-allgemein',
'Welcher Parameter zeigt die Wirksamkeit der Desinfektion am besten an?',
'pH-Wert',
'Redoxpotenzial',
'Temperatur',
'Leitfähigkeit',
'B',
13),

-- Frage 14
('din19643-allgemein',
'Wie hoch sollte das Redoxpotenzial idealerweise sein?',
'650–700 mV',
'700–750 mV',
'750–780 mV',
'800–850 mV',
'C',
14),

-- Frage 15
('din19643-allgemein',
'Was zeigt ein hoher TOC-Wert (Total Organic Carbon) an?',
'Geringe organische Belastung',
'Hohe organische Belastung',
'Zu viel Chlor',
'Zu wenig Frischwasser',
'B',
15),

-- Frage 16
('din19643-allgemein',
'Welche Maßnahme ist bei dauerhaft hoher TOC-Belastung sinnvoll?',
'Erhöhung der Rückspülintervalle',
'Verringerung des Frischwasseranteils',
'Häufigere Filterrückspülung und Frischwasserzufuhr',
'Reduktion der Chlorzugabe',
'C',
16),

-- Frage 17
('din19643-allgemein',
'Was ist der Sollwert für Trübung (NTU)?',
'< 0,5 NTU',
'< 1,0 NTU',
'< 2,0 NTU',
'< 5,0 NTU',
'A',
17),

-- Frage 18
('din19643-allgemein',
'Was kann eine zu hohe Trübung verursachen?',
'Übermäßiger Chlorverbrauch',
'Geringere Sichttiefe, Hygienerisiko',
'pH-Schwankungen',
'Sinkende Temperatur',
'B',
18),

-- Frage 19
('din19643-allgemein',
'Welche Ursache kann eine plötzliche Chlorwert-Schwankung haben?',
'Leck in der Chlorleitung',
'Falscher pH-Wert',
'Schwankender Badebetrieb',
'Alle genannten',
'D',
19),

-- Frage 20
('din19643-allgemein',
'Was ist bei Überschreitung des gebundenen Chlorwerts (> 0,2 mg/l) vorgeschrieben?',
'Filter sofort rückspülen',
'Frischwasseranteil erhöhen',
'Chloranlage abschalten',
'Badebetrieb beenden',
'B',
20),

-- Frage 21
('din19643-allgemein',
'Was ist das Ziel der DIN 19643 insgesamt?',
'Energieeinsparung',
'Einhaltung der chemischen Gleichgewichte',
'Sicherstellung hygienisch einwandfreien Beckenwassers',
'Reduktion von Betriebskosten',
'C',
21);

-- Fertig!
-- Das Quiz "DIN 19643 Allgemein" wurde aktualisiert mit 21 neuen Fragen.

