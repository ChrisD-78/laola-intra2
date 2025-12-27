-- Trainingslehre-Quiz hinzufügen
-- Dieses Script fügt das neue Quiz "Trainingslehre-Quiz" mit 22 Fragen zur Datenbank hinzu

DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  -- Prüfe, ob das Quiz bereits existiert
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Trainingslehre-Quiz';
  
  -- Wenn das Quiz bereits existiert, lösche es zuerst (inkl. Fragen und Ergebnisse)
  IF existing_quiz_count > 0 THEN
    DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Trainingslehre-Quiz');
    DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Trainingslehre-Quiz');
    DELETE FROM quizzes WHERE title = 'Trainingslehre-Quiz';
  END IF;

  -- Erstelle das neue Quiz
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Trainingslehre-Quiz',
    'Grundlagen der Trainingslehre: Trainingsprinzipien, motorische Fähigkeiten und Trainingsmethoden',
    'Sport',
    22,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz_new_id;

  -- Füge alle Fragen hinzu
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES 
    (quiz_new_id, 'Was versteht man unter dem Prinzip der Superkompensation?', 
      'Das Training wird ständig schwieriger', 
      'Nach einer Belastung steigt die Leistungsfähigkeit über das Ausgangsniveau', 
      'Man trainiert jeden Tag zur gleichen Zeit', 
      'Man trainiert mit immer weniger Gewicht', 
      'B', 1),
    
    (quiz_new_id, 'Welche motorische Fähigkeit wird beim Dauerlauf hauptsächlich trainiert?', 
      'Kraft', 
      'Schnelligkeit', 
      'Ausdauer', 
      'Beweglichkeit', 
      'C', 2),
    
    (quiz_new_id, 'Was bedeutet das Trainingsprinzip der "progressiven Belastung"?', 
      'Man trainiert immer gleich intensiv', 
      'Die Trainingsbelastung wird allmählich gesteigert', 
      'Man macht nach jedem Training eine Woche Pause', 
      'Man trainiert nur eine Muskelgruppe', 
      'B', 3),
    
    (quiz_new_id, 'Wie nennt man die Fähigkeit, Kraft über einen längeren Zeitraum aufrechtzuerhalten?', 
      'Maximalkraft', 
      'Schnellkraft', 
      'Kraftausdauer', 
      'Reaktivkraft', 
      'C', 4),
    
    (quiz_new_id, 'Was versteht man unter anaerober Ausdauer?', 
      'Ausdauer ohne ausreichende Sauerstoffversorgung', 
      'Ausdauer mit viel Sauerstoff', 
      'Ausdauer im Wasser', 
      'Ausdauer an der frischen Luft', 
      'A', 5),
    
    (quiz_new_id, 'Wie lange sollte eine Trainingseinheit mindestens dauern, um die Ausdauer zu verbessern?', 
      '5-10 Minuten', 
      '10-15 Minuten', 
      '20-30 Minuten', 
      '60-90 Minuten', 
      'C', 6),
    
    (quiz_new_id, 'Was ist Maximalkraft?', 
      'Die Kraft bei schnellen Bewegungen', 
      'Die höchstmögliche Kraft, die ein Muskel aufbringen kann', 
      'Die Kraft bei langen Belastungen', 
      'Die Kraft beim Dehnen', 
      'B', 7),
    
    (quiz_new_id, 'Welche Trainingsmethode eignet sich am besten für den Muskelaufbau?', 
      'Ausdauertraining mit niedriger Intensität', 
      'Krafttraining mit hohen Gewichten und wenigen Wiederholungen', 
      'Stretching', 
      'Koordinationstraining', 
      'B', 8),
    
    (quiz_new_id, 'Was bedeutet der Begriff "Laktat"?', 
      'Ein Vitamin im Blut', 
      'Milchsäure, die bei intensiver Belastung entsteht', 
      'Ein Hormon', 
      'Eine Art von Protein', 
      'B', 9),
    
    (quiz_new_id, 'Wie viele Tage Pause sollten nach einem intensiven Krafttraining mindestens eingelegt werden?', 
      'Keine Pause nötig', 
      '1-2 Tage', 
      '5-7 Tage', 
      '2 Wochen', 
      'B', 10),
    
    (quiz_new_id, 'Was trainiert man beim Seilspringen hauptsächlich?', 
      'Nur die Beine', 
      'Ausdauer und Koordination', 
      'Nur die Arme', 
      'Nur die Beweglichkeit', 
      'B', 11),
    
    (quiz_new_id, 'Was ist Schnellkraft?', 
      'Die Kraft bei langen Belastungen', 
      'Die Fähigkeit, in kürzester Zeit eine hohe Kraft zu entwickeln', 
      'Die maximale Kraft eines Muskels', 
      'Die Kraft beim langsamen Laufen', 
      'B', 12),
    
    (quiz_new_id, 'Wann sollte man sich am besten dehnen?', 
      'Nur vor dem Training', 
      'Niemals', 
      'Nach dem Aufwärmen oder nach dem Training', 
      'Nur morgens nach dem Aufstehen', 
      'C', 13),
    
    (quiz_new_id, 'Was versteht man unter dem Begriff "Übertraining"?', 
      'Besonders effektives Training', 
      'Zu viel Training ohne ausreichende Erholung', 
      'Training mit zu leichten Gewichten', 
      'Training nur eines Körperteils', 
      'B', 14),
    
    (quiz_new_id, 'Welche Trainingsform verbessert die Beweglichkeit am effektivsten?', 
      'Krafttraining', 
      'Ausdauertraining', 
      'Dehnübungen (Stretching)', 
      'Schnelligkeitstraining', 
      'C', 15),
    
    (quiz_new_id, 'Was ist die aerobe Schwelle?', 
      'Die Belastungsgrenze, bei der noch genug Sauerstoff vorhanden ist', 
      'Die höchste Herzfrequenz', 
      'Die niedrigste Trainingsintensität', 
      'Die Grenze zur Erschöpfung', 
      'A', 16),
    
    (quiz_new_id, 'Wie oft pro Woche sollten Erwachsene mindestens Sport treiben?', 
      '1-mal pro Woche', 
      '2-3-mal pro Woche', 
      '7-mal pro Woche', 
      'Jeden zweiten Tag intensiv', 
      'B', 17),
    
    (quiz_new_id, 'Was ist ein Wiederholungsmaximum (1RM)?', 
      'Die Anzahl der Trainingstage pro Woche', 
      'Das maximale Gewicht, das man einmal bewegen kann', 
      'Die Anzahl der Sätze pro Übung', 
      'Die Trainingsdauer in Minuten', 
      'B', 18),
    
    (quiz_new_id, 'Welche Aussage zum Aufwärmen ist richtig?', 
      'Aufwärmen ist unnötig', 
      'Aufwärmen bereitet den Körper auf die Belastung vor und senkt das Verletzungsrisiko', 
      'Aufwärmen schwächt die Leistung', 
      'Nur Profisportler müssen sich aufwärmen', 
      'B', 19),
    
    (quiz_new_id, 'Was trainiert man durch Intervalltraining?', 
      'Nur Beweglichkeit', 
      'Ausdauer und Schnelligkeit wechselnd', 
      'Nur Maximalkraft', 
      'Nur Koordination', 
      'B', 20),
    
    (quiz_new_id, 'Welcher Nährstoff ist besonders wichtig für den Muskelaufbau?', 
      'Vitamine', 
      'Proteine (Eiweiß)', 
      'Wasser', 
      'Mineralstoffe', 
      'B', 21),
    
    (quiz_new_id, 'Was ist der Unterschied zwischen statischem und dynamischem Krafttraining?', 
      'Statisch: Muskel spannt ohne Bewegung; Dynamisch: Muskel bewegt sich', 
      'Statisch: schnelle Bewegungen; Dynamisch: langsame Bewegungen', 
      'Statisch: mit Geräten; Dynamisch: ohne Geräte', 
      'Es gibt keinen Unterschied', 
      'A', 22);

  RAISE NOTICE 'Trainingslehre-Quiz erfolgreich erstellt mit ID: %', quiz_new_id;
END $$;

