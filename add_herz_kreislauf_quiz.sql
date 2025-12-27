-- Herz-Kreislauf-Quiz hinzufügen
-- Dieses Script fügt das neue Quiz "Herz-Kreislauf-Quiz" mit 18 Fragen zur Datenbank hinzu

DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  -- Prüfe, ob das Quiz bereits existiert
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Herz-Kreislauf-Quiz';
  
  -- Wenn das Quiz bereits existiert, lösche es zuerst (inkl. Fragen und Ergebnisse)
  IF existing_quiz_count > 0 THEN
    DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Herz-Kreislauf-Quiz');
    DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Herz-Kreislauf-Quiz');
    DELETE FROM quizzes WHERE title = 'Herz-Kreislauf-Quiz';
  END IF;

  -- Erstelle das neue Quiz
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Herz-Kreislauf-Quiz',
    'Grundlagen des Herz-Kreislauf-Systems und der Blutversorgung',
    'Gesundheit',
    18,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz_new_id;

  -- Füge alle Fragen hinzu
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES 
    (quiz_new_id, 'Aus wie vielen Kammern besteht das menschliche Herz?', 
      '2 Kammern', 
      '3 Kammern', 
      '4 Kammern', 
      '5 Kammern', 
      'C', 1),
    
    (quiz_new_id, 'Welche Blutgefäße führen sauerstoffreiches Blut vom Herzen weg?', 
      'Venen', 
      'Arterien', 
      'Kapillaren', 
      'Lymphgefäße', 
      'B', 2),
    
    (quiz_new_id, 'Wie nennt man die Phase, in der sich das Herz zusammenzieht?', 
      'Diastole', 
      'Systole', 
      'Bradykardie', 
      'Tachykardie', 
      'B', 3),
    
    (quiz_new_id, 'In welcher Herzkammer beginnt der große Blutkreislauf (Körperkreislauf)?', 
      'Rechter Vorhof', 
      'Rechte Kammer', 
      'Linker Vorhof', 
      'Linke Kammer', 
      'D', 4),
    
    (quiz_new_id, 'Welche Aufgabe haben die Herzklappen?', 
      'Sie pumpen das Blut durch den Körper', 
      'Sie verhindern einen Rückfluss des Blutes', 
      'Sie produzieren rote Blutkörperchen', 
      'Sie regulieren den Blutdruck', 
      'B', 5),
    
    (quiz_new_id, 'Wo findet der Gasaustausch zwischen Blut und Luft statt?', 
      'Im Herzen', 
      'In den Lungenbläschen (Alveolen)', 
      'In den Arterien', 
      'In der Leber', 
      'B', 6),
    
    (quiz_new_id, 'Was transportieren die roten Blutkörperchen (Erythrozyten) hauptsächlich?', 
      'Nährstoffe', 
      'Sauerstoff', 
      'Hormone', 
      'Vitamine', 
      'B', 7),
    
    (quiz_new_id, 'Wie viele Liter Blut hat ein erwachsener Mensch durchschnittlich?', 
      '2-3 Liter', 
      '5-6 Liter', 
      '8-9 Liter', 
      '10-12 Liter', 
      'B', 8),
    
    (quiz_new_id, 'Was ist der Ruhepuls eines gesunden Erwachsenen?', 
      '30-40 Schläge pro Minute', 
      '60-80 Schläge pro Minute', 
      '100-120 Schläge pro Minute', 
      '140-160 Schläge pro Minute', 
      'B', 9),
    
    (quiz_new_id, 'Welches Blutgefäß bringt sauerstoffarmes Blut zurück zum Herzen?', 
      'Vene', 
      'Arterie', 
      'Aorta', 
      'Bronchie', 
      'A', 10),
    
    (quiz_new_id, 'Wie heißt die größte Arterie im menschlichen Körper?', 
      'Lungenarterie', 
      'Aorta', 
      'Halsschlagader', 
      'Oberschenkelarterie', 
      'B', 11),
    
    (quiz_new_id, 'Welche Aufgabe hat das Blut NICHT?', 
      'Sauerstofftransport', 
      'Wärmeregulierung', 
      'Verdauung von Nahrung', 
      'Abwehr von Krankheitserregern', 
      'C', 12),
    
    (quiz_new_id, 'Was sind Kapillaren?', 
      'Große Blutgefäße', 
      'Herzklappen', 
      'Feinste, haardünne Blutgefäße', 
      'Teile des Herzens', 
      'C', 13),
    
    (quiz_new_id, 'Was passiert im kleinen Blutkreislauf (Lungenkreislauf)?', 
      'Das Blut versorgt die Muskeln mit Sauerstoff', 
      'Das Blut wird in der Lunge mit Sauerstoff angereichert', 
      'Das Blut fließt durch die Nieren', 
      'Das Blut versorgt das Gehirn', 
      'B', 14),
    
    (quiz_new_id, 'Welche Zellen sind für die Blutgerinnung wichtig?', 
      'Rote Blutkörperchen', 
      'Weiße Blutkörperchen', 
      'Blutplättchen (Thrombozyten)', 
      'Nervenzellen', 
      'C', 15),
    
    (quiz_new_id, 'Was ist die Hauptaufgabe der weißen Blutkörperchen?', 
      'Sauerstofftransport', 
      'Abwehr von Krankheitserregern', 
      'Blutgerinnung', 
      'Wärmetransport', 
      'B', 16),
    
    (quiz_new_id, 'Welcher Faktor erhöht das Risiko für Herz-Kreislauf-Erkrankungen NICHT?', 
      'Rauchen', 
      'Bewegungsmangel', 
      'Ungesunde Ernährung', 
      'Regelmäßiger Sport', 
      'D', 17),
    
    (quiz_new_id, 'Was misst man mit einem EKG (Elektrokardiogramm)?', 
      'Den Blutdruck', 
      'Die Blutzuckerwerte', 
      'Die elektrische Aktivität des Herzens', 
      'Die Anzahl der Blutkörperchen', 
      'C', 18);

  RAISE NOTICE 'Herz-Kreislauf-Quiz erfolgreich erstellt mit ID: %', quiz_new_id;
END $$;

