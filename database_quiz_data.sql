-- =====================================================
-- QUIZ DATA INSERT
-- LA OLA Intranet - Quiz-Fragen
-- =====================================================
-- Führen Sie dieses Script NACH database_quiz_system.sql aus
-- =====================================================

-- WICHTIG: Zuerst alle alten Quizze löschen
DELETE FROM quiz_results;
DELETE FROM quiz_questions;
DELETE FROM quizzes;

-- Success message für Löschung
DO $$
BEGIN
  RAISE NOTICE 'Alte Quiz-Daten wurden gelöscht';
END $$;

-- Quiz 1: Ultrafiltration
DO $$
DECLARE
  quiz1_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Ultrafiltration',
    'Grundlagen der Ultrafiltration in der Schwimmbadtechnik',
    'Technik',
    12,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz1_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was ist das grundlegende Prinzip der Ultrafiltration?', 
    'Abtrennung von Stoffen durch chemische Reaktion', 
    'Abtrennung durch Membran mit Poren im Nanometerbereich', 
    'Abtrennung durch Zentrifugalkraft', 
    'Abtrennung durch Ionenaustausch', 
    'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welcher Größenbereich wird bei der Ultrafiltration typischerweise abgetrennt?', 
    '0,01–0,1 µm', '1–10 µm', '10–100 µm', '0,0001 µm', 'A', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Stoffe werden durch Ultrafiltration zuverlässig entfernt?', 
    'Bakterien', 'Gelöste Salze', 'Chlor', 'Kohlensäure', 'A', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welches Ziel verfolgt der Einsatz der Ultrafiltration in der Schwimmbadtechnik?', 
    'Ersatz der Chlorung', 'Entfernung von Mikroorganismen und Trübstoffen', 'pH-Regulierung', 'Kalkentfernung', 'B', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Filtrationsrichtung ist typisch für Ultrafiltrationsmodule?', 
    'Cross-Flow (Querströmung)', 'Dead-End (Stirnströmung)', 'Gegenstrom', 'Rückwärtsströmung', 'A', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Maßnahme ist bei einem steigenden Transmembrandruck (TMP) erforderlich?', 
    'Reduzierung der Chlorzugabe', 'Chemische oder hydraulische Reinigung der Membran', 'Erhöhung der Temperatur', 'Senkung des pH-Wertes', 'B', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Was bedeutet der Begriff „Permeatfluss" (Flux)?', 
    'Geschwindigkeit der Rückspülung', 'Menge des durch die Membran gehenden Wassers pro Fläche und Zeit', 'Druckverlust im System', 'Salzgehalt des Permeats', 'B', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welche Reinigung wird regelmäßig zur Aufrechterhaltung der Leistung durchgeführt?', 
    'Rückspülung mit Permeatwasser', 'Spülung mit Rohwasser', 'Trocknung der Membran', 'Erhöhung des Betriebsdrucks', 'A', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welcher Vorteil entsteht durch die Ultrafiltration im Vergleich zur konventionellen Mehrschichtfiltration?', 
    'Geringerer Energieverbrauch', 'Keine Notwendigkeit zur Rückspülung', 'Höhere Rückhaltefähigkeit für Keime und Partikel', 'Günstigere Anschaffungskosten', 'C', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Wie kann eine chemische Membranreinigung durchgeführt werden?', 
    'Mit Säuren oder Laugen je nach Verschmutzungsart', 'Nur mit klarem Wasser', 'Durch Druckerhöhung', 'Durch Kühlung', 'A', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Welcher Parameter gibt Aufschluss über eine beginnende Membranverschmutzung?', 
    'pH-Wert', 'Temperatur', 'Anstieg des Transmembrandrucks', 'Chlorwert', 'C', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz1_id, 'Wie trägt die Ultrafiltration zur Hygiene-Sicherheit nach DIN 19643 bei?', 
    'Sie ersetzt die Desinfektion vollständig', 'Sie minimiert das Risiko pathogener Keime im Umwälzwasser', 'Sie reguliert den pH-Wert automatisch', 'Sie verringert die Wasserverluste beim Rückspülen', 'B', 12);
END $$;

-- Quiz 2: Wasserkreislauf im Schwimmbadbetrieb
DO $$
DECLARE
  quiz2_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Wasserkreislauf im Schwimmbadbetrieb',
    'Funktionsweise und Komponenten des Wasserkreislaufs',
    'Technik',
    12,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz2_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Welches ist die richtige Reihenfolge im Wasserkreislauf eines Schwimmbeckens?', 
    'Becken → Filter → Chlorung → Ausgleichsbehälter → Becken', 
    'Becken → Ausgleichsbehälter → Pumpe → Filter → Desinfektion → Becken', 
    'Becken → Pumpe → Filter → Ausgleichsbehälter → Becken', 
    'Becken → Chlorung → Filter → Pumpe → Becken', 
    'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Welche Funktion hat der Ausgleichsbehälter im Wasserkreislauf?', 
    'Dient der Chloraufbereitung', 'Regelt den Wasserstand im Becken bei Schwimmbewegungen', 'Erwärmt das Wasser', 'Entfernt Feststoffe', 'B', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Wie gelangt das Wasser im Überlaufbecken in den Wasserkreislauf zurück?', 
    'Über Skimmer', 'Über den Bodenablauf', 'Über die Überlaufrinne in den Ausgleichsbehälter', 'Direkt zur Pumpe', 'C', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Welche Aufgabe hat die Umwälzpumpe im Kreislauf?', 
    'Hält die Temperatur konstant', 'Bewegt das Wasser durch die Aufbereitungsstufen', 'Desinfiziert das Wasser', 'Entfernt Trübstoffe', 'B', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Was passiert im Filter des Wasserkreislaufs?', 
    'Chemische Desinfektion', 'Entfernung von gelösten Stoffen', 'Entfernung von Schwebstoffen und Partikeln', 'Regelung des pH-Wertes', 'C', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Wie gelangt das gereinigte Wasser zurück ins Becken?', 
    'Über Einströmdüsen', 'Über den Bodenablauf', 'Über die Überlaufrinne', 'Über den Ausgleichsbehälter', 'A', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Was versteht man unter dem Begriff „Umwälzzeit"?', 
    'Zeit, die das Wasser für eine Filterdurchströmung benötigt', 
    'Zeit, bis das gesamte Beckenvolumen einmal aufbereitet wurde', 
    'Zeit zwischen zwei Rückspülungen', 
    'Zeit, bis das Chlor vollständig reagiert', 
    'B', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Welche Umwälzzeit gilt typischerweise für ein Schwimmerbecken?', 
    '1 Stunde', '2 Stunden', '4 Stunden', '8 Stunden', 'C', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Warum wird dem Kreislauf Frischwasser zugeführt?', 
    'Um Kalk zu entfernen', 'Um organische Stoffe und gelöste Salze zu verdünnen', 'Um die Temperatur zu senken', 'Um die Leitfähigkeit zu erhöhen', 'B', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Was ist eine häufige Folge eines zu geringen Wasserdurchsatzes im Kreislauf?', 
    'Übermäßige Erwärmung', 'Schlechte Durchströmung und Desinfektion', 'Zu niedriger pH-Wert', 'Überchlorierung', 'B', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Was passiert, wenn die Rückspülung des Filters im Wasserkreislauf zu selten durchgeführt wird?', 
    'Der Filter reinigt besser', 'Der Druckverlust sinkt', 'Die Filtration wird schlechter, der Druck steigt', 'Es wird weniger Wasser benötigt', 'C', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz2_id, 'Welches Hauptziel verfolgt der gesamte Wasserkreislauf im Schwimmbad?', 
    'Ästhetik des Wassers', 'Minimierung des Energieverbrauchs', 'Sicherstellung hygienisch einwandfreien, klaren und angenehmen Wassers', 'Erhöhung der Wassertemperatur', 'C', 12);
END $$;

-- Quiz 3: DIN 19643 Allgemein
DO $$
DECLARE
  quiz3_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'DIN 19643 Allgemein',
    'Grundlagen der Schwimmbadwasserpflege nach DIN 19643',
    'Technik',
    21,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz3_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist bei einer Überschreitung des pH-Wertes über 7,8 zu tun?', 
    'Mehr Chlor zudosieren', 'pH-Wert mit Säure senken', 'Wasser aufheizen', 'Filter rückspülen', 'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welche Wirkung hat ein zu hoher pH-Wert auf die Desinfektionswirkung von Chlor?', 
    'Keine Auswirkung', 'Desinfektionswirkung steigt', 'Desinfektionswirkung sinkt', 'Chlor wird stabiler', 'C', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welcher freie Chlorwert ist für Schwimmerbecken nach DIN 19643 gefordert?', 
    '0,1–0,3 mg/l', '0,3–0,6 mg/l', '0,3–0,6 mg/l', '0,6–1,0 mg/l', 'B', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist zu tun, wenn der freie Chlorwert unter 0,3 mg/l liegt?', 
    'Bad schließen', 'Chlorzugabe erhöhen', 'Filter rückspülen', 'pH-Wert erhöhen', 'B', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Wie hoch darf der gebundene Chlorwert maximal sein?', 
    '0,1 mg/l', '0,2 mg/l', '0,3 mg/l', '0,5 mg/l', 'B', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was bedeutet ein zu hoher gebundener Chlorwert?', 
    'Zu wenig Filtration', 'Zu viel Frischwasser', 'Zu viele organische Belastungen', 'Zu wenig pH-Regulierung', 'C', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welche Maßnahme hilft, wenn gebundenes Chlor regelmäßig zu hoch ist?', 
    'Frischwasserzufuhr erhöhen', 'pH-Wert senken', 'Chlorzufuhr drosseln', 'Filterlaufzeit verkürzen', 'A', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was geschieht bei zu niedrigem Redoxpotenzial (unter 750 mV)?', 
    'Gute Desinfektionswirkung', 'Unzureichende Desinfektion', 'Überchlorierung', 'Zu hoher pH-Wert', 'B', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was kann ein zu niedriger pH-Wert (< 6,8) verursachen?', 
    'Kalkablagerungen', 'Korrosion an metallischen Teilen', 'Schlechte Desinfektion', 'Trübung', 'B', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welche Wirkung hat zu hoher pH-Wert auf Trübungen?', 
    'Keine', 'Sie nehmen ab', 'Sie nehmen zu', 'Wasser wird klarer', 'C', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist bei zu hohem Nitratwert zu prüfen?', 
    'Frischwasseranteil', 'Filtergeschwindigkeit', 'Chlorpumpe', 'Wassertemperatur', 'A', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist der Zweck der Aktivkohlefiltration in DIN 19643-4?', 
    'Entfernung von Bakterien', 'Entfernung von Chloraminen und organischen Stoffen', 'Entfernung von Kalk', 'Erhöhung des pH-Wertes', 'B', 12);

  -- Frage 13
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welcher Parameter zeigt die Wirksamkeit der Desinfektion am besten an?', 
    'pH-Wert', 'Redoxpotenzial', 'Temperatur', 'Leitfähigkeit', 'B', 13);

  -- Frage 14
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Wie hoch sollte das Redoxpotenzial idealerweise sein?', 
    '650–700 mV', '700–750 mV', '750–780 mV', '800–850 mV', 'C', 14);

  -- Frage 15
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was zeigt ein hoher TOC-Wert (Total Organic Carbon) an?', 
    'Geringe organische Belastung', 'Hohe organische Belastung', 'Zu viel Chlor', 'Zu wenig Frischwasser', 'B', 15);

  -- Frage 16
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welche Maßnahme ist bei dauerhaft hoher TOC-Belastung sinnvoll?', 
    'Erhöhung der Rückspülintervalle', 'Verringerung des Frischwasseranteils', 'Häufigere Filterrückspülung und Frischwasserzufuhr', 'Reduktion der Chlorzugabe', 'C', 16);

  -- Frage 17
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist der Sollwert für Trübung (NTU)?', 
    '< 0,5 NTU', '< 1,0 NTU', '< 2,0 NTU', '< 5,0 NTU', 'A', 17);

  -- Frage 18
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was kann eine zu hohe Trübung verursachen?', 
    'Übermäßiger Chlorverbrauch', 'Geringere Sichttiefe, Hygienerisiko', 'pH-Schwankungen', 'Sinkende Temperatur', 'B', 18);

  -- Frage 19
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Welche Ursache kann eine plötzliche Chlorwert-Schwankung haben?', 
    'Leck in der Chlorleitung', 'Falscher pH-Wert', 'Schwankender Badebetrieb', 'Alle genannten', 'D', 19);

  -- Frage 20
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist bei Überschreitung des gebundenen Chlorwerts (> 0,2 mg/l) vorgeschrieben?', 
    'Filter sofort rückspülen', 'Frischwasseranteil erhöhen', 'Chloranlage abschalten', 'Badebetrieb beenden', 'B', 20);

  -- Frage 21
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz3_id, 'Was ist das Ziel der DIN 19643 insgesamt?', 
    'Energieeinsparung', 'Einhaltung der chemischen Gleichgewichte', 'Sicherstellung hygienisch einwandfreien Beckenwassers', 'Reduktion von Betriebskosten', 'C', 21);
END $$;

-- Quiz 4: Chemische und physikalische Eigenschaften von Wasser
DO $$
DECLARE
  quiz4_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Chemische und physikalische Eigenschaften von Wasser',
    'Grundlegende Eigenschaften von Wasser in der Schwimmbadtechnik',
    'Chemie',
    18,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz4_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Wie lautet die chemische Formel von Wasser?', 
    'HO₂', 'H₂O', 'OH₂', 'H₃O', 'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche geometrische Struktur hat das Wassermolekül?', 
    'Linear', 'Tetraedrisch', 'Gewinkelt', 'Planar', 'C', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche Aggregatzustände kann Wasser annehmen?', 
    'Fest, flüssig, gasförmig', 'Nur flüssig', 'Flüssig und gasförmig', 'Nur fest und flüssig', 'A', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Bei welcher Temperatur siedet reines Wasser auf Meereshöhe?', 
    '50 °C', '90 °C', '100 °C', '110 °C', 'C', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Bei welcher Temperatur gefriert reines Wasser unter Normaldruck?', 
    '0 °C', '–10 °C', '5 °C', '32 °C', 'A', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Warum ist Eis leichter als flüssiges Wasser?', 
    'Geringere Dichte durch Wasserstoffbrücken', 'Höherer Druck', 'Dichtere Molekülpackung', 'Wegen gelöster Luftblasen', 'A', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche Dichte hat Wasser bei 4 °C?', 
    '1,00 g/cm³', '0,90 g/cm³', '1,10 g/cm³', '0,99 g/cm³', 'A', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche Polarität besitzt das Wassermolekül?', 
    'Unpolar', 'Polar', 'Neutral', 'Dipolfrei', 'B', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche der folgenden Substanzen löst sich am besten in Wasser?', 
    'Öl', 'Benzin', 'Kochsalz', 'Wachs', 'C', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Was beschreibt der pH-Wert von Wasser?', 
    'Temperatur', 'Härtegrad', 'Konzentration der H⁺-Ionen', 'Leitfähigkeit', 'C', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Wie lautet der pH-Wert von reinem Wasser bei 25 °C?', 
    '0', '7', '10', '14', 'B', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche Aussage zur spezifischen Wärmekapazität von Wasser ist richtig?', 
    'Wasser erwärmt sich sehr schnell', 'Wasser hat eine sehr hohe Wärmekapazität', 'Wasser speichert kaum Wärme', 'Wasser verliert Wärme sofort', 'B', 12);

  -- Frage 13
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Was ist die Ursache für die hohe Siedetemperatur von Wasser im Vergleich zu ähnlichen Molekülen?', 
    'Große Molekülmasse', 'Wasserstoffbrückenbindungen', 'Elektronenkonfiguration', 'Ionische Struktur', 'B', 13);

  -- Frage 14
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Wie nennt man Wasser, das viele Calcium- und Magnesiumionen enthält?', 
    'Destilliertes Wasser', 'Weiches Wasser', 'Hartes Wasser', 'Leitungsfreies Wasser', 'C', 14);

  -- Frage 15
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche physikalische Eigenschaft ermöglicht Kapillarwirkung?', 
    'Dichte', 'Oberflächenspannung', 'Siedepunkt', 'Leitfähigkeit', 'B', 15);

  -- Frage 16
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Was passiert mit dem Volumen von Wasser beim Gefrieren?', 
    'Es bleibt gleich', 'Es nimmt ab', 'Es nimmt zu', 'Es verdampft', 'C', 16);

  -- Frage 17
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Warum ist Wasser ein gutes Lösungsmittel für viele Stoffe?', 
    'Wegen seiner unpolaren Struktur', 'Wegen seiner hohen Dichte', 'Wegen seiner Polarität', 'Wegen seiner Farbe', 'C', 17);

  -- Frage 18
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz4_id, 'Welche physikalische Größe beschreibt die Wärmemenge, die benötigt wird, um 1 g Wasser um 1 °C zu erwärmen?', 
    'Schmelzwärme', 'Wärmekapazität', 'Verdampfungswärme', 'Siedepunkt', 'B', 18);
END $$;

-- Quiz 5: pH-Wert Grundlagen
DO $$
DECLARE
  quiz5_id UUID;
BEGIN
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'pH-Wert Grundlagen',
    'Alles Wichtige rund um den pH-Wert in der Wasserchemie',
    'Chemie',
    17,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz5_id;

  -- Frage 1
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Wofür steht die Abkürzung „pH"?', 
    'Potenz der Härte', 'Potenz des Wasserstoffs', 'Protonenhäufigkeit', 'Phasen-Harmonie', 'B', 1);

  -- Frage 2
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welcher pH-Wert gilt als neutral?', 
    '0', '5', '7', '10', 'C', 2);

  -- Frage 3
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was bedeutet ein pH-Wert kleiner als 7?', 
    'Basisch', 'Neutral', 'Sauer', 'Laugenhaltig', 'C', 3);

  -- Frage 4
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was bedeutet ein pH-Wert größer als 7?', 
    'Sauer', 'Neutral', 'Basisch', 'Oxidierend', 'C', 4);

  -- Frage 5
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Wie berechnet man den pH-Wert?', 
    'pH = log [H⁺]', 'pH = –log [H⁺]', 'pH = 10 × [H⁺]', 'pH = [H⁺] / log', 'B', 5);

  -- Frage 6
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was beschreibt der pH-Wert?', 
    'Die Temperatur der Lösung', 'Die Konzentration der Hydroxidionen', 'Die Konzentration der Wasserstoffionen (H⁺)', 'Die Dichte der Flüssigkeit', 'C', 6);

  -- Frage 7
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welchen pH-Wert hat destilliertes Wasser bei 25 °C?', 
    '0', '5', '7', '10', 'C', 7);

  -- Frage 8
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welcher pH-Wert ist typisch für Natronlauge?', 
    '1', '5', '9', '13', 'D', 8);

  -- Frage 9
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was gilt für starke Säuren im Vergleich zu schwachen Säuren?', 
    'Sie haben denselben pH-Wert', 'Sie haben einen höheren pH-Wert', 'Sie haben einen niedrigeren pH-Wert', 'Sie sind neutral', 'C', 9);

  -- Frage 10
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Wie nennt man eine Lösung mit pH = 0?', 
    'Sehr schwache Säure', 'Sehr starke Säure', 'Neutral', 'Starke Base', 'B', 10);

  -- Frage 11
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welches Ion bestimmt den pH-Wert einer Lösung hauptsächlich?', 
    'Na⁺', 'OH⁻', 'H⁺', 'Cl⁻', 'C', 11);

  -- Frage 12
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was beschreibt der pOH-Wert?', 
    'Die Konzentration von Wasser', 'Die Konzentration der Hydroxidionen (OH⁻)', 'Die Konzentration von H₂O', 'Die Dichte', 'B', 12);

  -- Frage 13
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Wie hängen pH- und pOH-Wert bei 25 °C zusammen?', 
    'pH + pOH = 7', 'pH × pOH = 7', 'pH + pOH = 14', 'pH – pOH = 0', 'C', 13);

  -- Frage 14
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welchen pH-Wert hat eine 0,1 M Salzsäure-Lösung (HCl)?', 
    '0', '1', '7', '14', 'B', 14);

  -- Frage 15
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Welche Farbe zeigt Phenolphthalein in basischer Lösung?', 
    'Farblos', 'Rot', 'Rosa', 'Gelb', 'C', 15);

  -- Frage 16
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Was passiert mit dem pH-Wert, wenn eine Säure verdünnt wird?', 
    'Er sinkt', 'Er bleibt gleich', 'Er steigt', 'Er wird unendlich groß', 'C', 16);

  -- Frage 17
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES (quiz5_id, 'Wie nennt man eine Lösung, die den pH-Wert trotz Zugabe von Säuren oder Basen weitgehend konstant hält?', 
    'Neutralisator', 'Indikator', 'Pufferlösung', 'Elektrolyt', 'C', 17);
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
  RAISE NOTICE 'Quiz 1: Ultrafiltration (12 Fragen)';
  RAISE NOTICE 'Quiz 2: Wasserkreislauf im Schwimmbadbetrieb (12 Fragen)';
  RAISE NOTICE 'Quiz 3: DIN 19643 Allgemein (21 Fragen)';
  RAISE NOTICE 'Quiz 4: Chemische und physikalische Eigenschaften von Wasser (18 Fragen)';
  RAISE NOTICE 'Quiz 5: pH-Wert Grundlagen (17 Fragen)';
  RAISE NOTICE 'Gesamt: 80 Fragen in 5 Quizzen';
  RAISE NOTICE '==============================================';
END $$;
