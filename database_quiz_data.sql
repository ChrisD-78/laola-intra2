-- =====================================================
-- QUIZ DATA INSERT
-- LA OLA Intranet - Quiz-Fragen
-- =====================================================
-- Führen Sie dieses Script NACH database_quiz_system.sql aus
-- =====================================================

-- Quiz 1: DIN 19643 Allgemein
INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
VALUES (
  'DIN 19643 Allgemein',
  'Grundlagen der Schwimmbadwasserpflege nach DIN 19643',
  'Technik',
  20,
  70,
  true,
  'System'
) RETURNING id;

-- Speichere die Quiz-ID (wird in den nächsten Inserts verwendet)
-- Hinweis: In der Praxis müssen Sie die generierte UUID hier einfügen oder ein Skript verwenden

-- Temporäre Variable für Quiz 1
DO $$
DECLARE
  quiz1_id UUID;
BEGIN
  -- Hole die ID des gerade erstellten Quiz
  SELECT id INTO quiz1_id FROM quizzes WHERE title = 'DIN 19643 Allgemein' ORDER BY created_at DESC LIMIT 1;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist bei einer Überschreitung des pH-Wertes über 7,8 zu tun?', 
    'Mehr Chlor zudosieren', 'pH-Wert mit Säure senken', 'Wasser aufheizen', 'Filter rückspülen', 'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Wirkung hat ein zu hoher pH-Wert auf die Desinfektionswirkung von Chlor?', 
    'Keine Auswirkung', 'Desinfektionswirkung steigt', 'Desinfektionswirkung sinkt', 'Chlor wird stabiler', 'C', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welcher freie Chlorwert ist für Schwimmerbecken nach DIN 19643 gefordert?', 
    '0,1–0,3 mg/l', '0,3–0,6 mg/l', '0,3–0,6 mg/l', '0,6–1,0 mg/l', 'B', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist zu tun, wenn der freie Chlorwert unter 0,3 mg/l liegt?', 
    'Bad schließen', 'Chlorzugabe erhöhen', 'Filter rückspülen', 'pH-Wert erhöhen', 'B', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Wie hoch darf der gebundene Chlorwert maximal sein?', 
    '0,1 mg/l', '0,2 mg/l', '0,3 mg/l', '0,5 mg/l', 'B', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was bedeutet ein zu hoher gebundener Chlorwert?', 
    'Zu wenig Filtration', 'Zu viel Frischwasser', 'Zu viele organische Belastungen', 'Zu wenig pH-Regulierung', 'C', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Maßnahme hilft, wenn gebundenes Chlor regelmäßig zu hoch ist?', 
    'Frischwasserzufuhr erhöhen', 'pH-Wert senken', 'Chlorzufuhr drosseln', 'Filterlaufzeit verkürzen', 'A', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was geschieht bei zu niedrigem Redoxpotenzial (unter 750 mV)?', 
    'Gute Desinfektionswirkung', 'Unzureichende Desinfektion', 'Überchlorierung', 'Zu hoher pH-Wert', 'B', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was kann ein zu niedriger pH-Wert (< 6,8) verursachen?', 
    'Kalkablagerungen', 'Korrosion an metallischen Teilen', 'Schlechte Desinfektion', 'Trübung', 'B', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Wirkung hat zu hoher pH-Wert auf Trübungen?', 
    'Keine', 'Sie nehmen ab', 'Sie nehmen zu', 'Wasser wird klarer', 'C', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist bei zu hohem Nitratwert zu prüfen?', 
    'Frischwasseranteil', 'Filtergeschwindigkeit', 'Chlorpumpe', 'Wassertemperatur', 'A', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist der Zweck der Aktivkohlefiltration in DIN 19643-4?', 
    'Entfernung von Bakterien', 'Entfernung von Chloraminen und organischen Stoffen', 'Entfernung von Kalk', 'Erhöhung des pH-Wertes', 'B', 12);

  -- Frage 13
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welcher Parameter zeigt die Wirksamkeit der Desinfektion am besten an?', 
    'pH-Wert', 'Redoxpotenzial', 'Temperatur', 'Leitfähigkeit', 'B', 13);

  -- Frage 14
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Wie hoch sollte das Redoxpotenzial idealerweise sein?', 
    '650–700 mV', '700–750 mV', '750–780 mV', '800–850 mV', 'C', 14);

  -- Frage 15
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was zeigt ein hoher TOC-Wert (Total Organic Carbon) an?', 
    'Geringe organische Belastung', 'Hohe organische Belastung', 'Zu viel Chlor', 'Zu wenig Frischwasser', 'B', 15);

  -- Frage 16
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Maßnahme ist bei dauerhaft hoher TOC-Belastung sinnvoll?', 
    'Erhöhung der Rückspülintervalle', 'Verringerung des Frischwasseranteils', 'Häufigere Filterrückspülung und Frischwasserzufuhr', 'Reduktion der Chlorzugabe', 'C', 16);

  -- Frage 17
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist der Sollwert für Trübung (NTU)?', 
    '< 0,5 NTU', '< 1,0 NTU', '< 2,0 NTU', '< 5,0 NTU', 'A', 17);

  -- Frage 18
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was kann eine zu hohe Trübung verursachen?', 
    'Übermäßiger Chlorverbrauch', 'Geringere Sichttiefe, Hygienerisiko', 'pH-Schwankungen', 'Sinkende Temperatur', 'B', 18);

  -- Frage 19
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Ursache kann eine plötzliche Chlorwert-Schwankung haben?', 
    'Leck in der Chlorleitung', 'Falscher pH-Wert', 'Schwankender Badebetrieb', 'Alle genannten', 'D', 19);

  -- Frage 20
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist bei Überschreitung des gebundenen Chlorwerts (> 0,2 mg/l) vorgeschrieben?', 
    'Filter sofort rückspülen', 'Frischwasseranteil erhöhen', 'Chloranlage abschalten', 'Badebetrieb beenden', 'B', 20);

  -- Frage 21
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist das Ziel der DIN 19643 insgesamt?', 
    'Energieeinsparung', 'Einhaltung der chemischen Gleichgewichte', 'Sicherstellung hygienisch einwandfreien Beckenwassers', 'Reduktion von Betriebskosten', 'C', 21);

  -- Aktualisiere total_questions
  UPDATE quizzes SET total_questions = 21 WHERE id = quiz1_id;
END $$;

-- Quiz 2: Ultrafiltration
DO $$
DECLARE
  quiz2_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Ultrafiltration',
    'Grundlagen der Ultrafiltration in der Schwimmbadtechnik',
    'Technik',
    1,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz2_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Was ist das grundlegende Prinzip der Ultrafiltration?', 
    'Abtrennung von Stoffen durch chemische Reaktion', 
    'Abtrennung durch Membran mit Poren im Nanometerbereich', 
    'Abtrennung durch Zentrifugalkraft', 
    'Abtrennung durch Ionenaustausch', 
    'B', 1);
END $$;

-- Überprüfung
SELECT 
  q.title,
  q.total_questions,
  q.category,
  COUNT(qq.id) as eingefuegte_fragen
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.total_questions, q.category
ORDER BY q.created_at;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Quiz-Daten erfolgreich eingefügt!';
  RAISE NOTICE 'Quiz 1: DIN 19643 Allgemein (21 Fragen)';
  RAISE NOTICE 'Quiz 2: Ultrafiltration (1 Frage)';
  RAISE NOTICE '==============================================';
END $$;

