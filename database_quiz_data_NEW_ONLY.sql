-- =====================================================
-- NEUE QUIZZE HINZUFÜGEN (ohne alte Daten zu löschen)
-- LA OLA Intranet - Nur Quiz 4 & 5
-- =====================================================
-- Dieses Script fügt NUR die 2 neuen Chemie-Quizze hinzu
-- ALLE bestehenden Quizze und Ergebnisse bleiben erhalten!
-- =====================================================

-- Quiz 4: Chemische und physikalische Eigenschaften von Wasser
DO $$
DECLARE
  quiz4_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  -- Prüfen, ob Quiz bereits existiert
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Chemische und physikalische Eigenschaften von Wasser';
  
  IF existing_quiz_count = 0 THEN
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

    RAISE NOTICE '✅ Quiz 4 erfolgreich hinzugefügt: Chemische und physikalische Eigenschaften von Wasser (18 Fragen)';
  ELSE
    RAISE NOTICE '⚠️  Quiz 4 existiert bereits und wurde übersprungen';
  END IF;
END $$;

-- Quiz 5: pH-Wert Grundlagen
DO $$
DECLARE
  quiz5_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  -- Prüfen, ob Quiz bereits existiert
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'pH-Wert Grundlagen';
  
  IF existing_quiz_count = 0 THEN
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

    RAISE NOTICE '✅ Quiz 5 erfolgreich hinzugefügt: pH-Wert Grundlagen (17 Fragen)';
  ELSE
    RAISE NOTICE '⚠️  Quiz 5 existiert bereits und wurde übersprungen';
  END IF;
END $$;

-- Überprüfung aller Quizze
SELECT 
  q.title,
  q.category,
  q.total_questions,
  COUNT(qq.id) as eingefuegte_fragen,
  q.created_at
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.category, q.total_questions, q.created_at
ORDER BY q.created_at;

-- Success message
DO $$
DECLARE
  total_quizzes INTEGER;
  total_questions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_quizzes FROM quizzes;
  SELECT COUNT(*) INTO total_questions FROM quiz_questions;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Neue Quiz-Daten erfolgreich hinzugefügt!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Aktuelle Statistik:';
  RAISE NOTICE '   Gesamt Quizze: %', total_quizzes;
  RAISE NOTICE '   Gesamt Fragen: %', total_questions;
  RAISE NOTICE '';
  RAISE NOTICE '⭐ Neu hinzugefügt:';
  RAISE NOTICE '   - Chemische und physikalische Eigenschaften von Wasser (18 Fragen)';
  RAISE NOTICE '   - pH-Wert Grundlagen (17 Fragen)';
  RAISE NOTICE '';
  RAISE NOTICE '💾 WICHTIG: Alle bestehenden Quiz-Ergebnisse wurden erhalten!';
  RAISE NOTICE '==============================================';
END $$;

