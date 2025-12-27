-- Sauna-Quiz hinzufügen
-- Dieses Script fügt das neue Quiz "Sauna-Quiz" mit 24 Fragen zur Datenbank hinzu

DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  -- Prüfe, ob das Quiz bereits existiert
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Sauna-Quiz';
  
  -- Wenn das Quiz bereits existiert, lösche es zuerst (inkl. Fragen und Ergebnisse)
  IF existing_quiz_count > 0 THEN
    DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Sauna-Quiz');
    DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'Sauna-Quiz');
    DELETE FROM quizzes WHERE title = 'Sauna-Quiz';
  END IF;

  -- Erstelle das neue Quiz
  INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
  VALUES (
    'Sauna-Quiz',
    'Grundlagen des Saunierens: Temperatur, Wirkungen, Verhaltensregeln und gesundheitliche Aspekte',
    'Wellness',
    24,
    70,
    true,
    'System'
  ) RETURNING id INTO quiz_new_id;

  -- Füge alle Fragen hinzu
  INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
  VALUES 
    (quiz_new_id, 'Bei welcher Temperatur liegt die Raumtemperatur in einer klassischen finnischen Sauna?', 
      '40-50°C', 
      '60-70°C', 
      '80-100°C', 
      '110-120°C', 
      'C', 1),
    
    (quiz_new_id, 'Wie wirkt sich regelmäßiges Saunieren auf das Immunsystem aus?', 
      'Es schwächt das Immunsystem', 
      'Es stärkt das Immunsystem und macht widerstandsfähiger gegen Erkältungen', 
      'Es hat keinen Einfluss auf das Immunsystem', 
      'Es zerstört die weißen Blutkörperchen', 
      'B', 2),
    
    (quiz_new_id, 'Warum sollte man vor dem ersten Saunagang duschen?', 
      'Um den Körper abzukühlen', 
      'Aus hygienischen Gründen und um Schmutz und Kosmetika zu entfernen', 
      'Um die Haut zu erwärmen', 
      'Es ist nicht notwendig zu duschen', 
      'B', 3),
    
    (quiz_new_id, 'Wie lange sollte ein Saunagang für Anfänger maximal dauern?', 
      '3-5 Minuten', 
      '8-12 Minuten', 
      '20-25 Minuten', 
      '30-40 Minuten', 
      'B', 4),
    
    (quiz_new_id, 'Was bewirkt ein Aufguss in der Sauna?', 
      'Er kühlt die Sauna ab', 
      'Er erhöht kurzzeitig die gefühlte Hitze durch höhere Luftfeuchtigkeit', 
      'Er desinfiziert die Luft', 
      'Er senkt die Temperatur', 
      'B', 5),
    
    (quiz_new_id, 'Warum ist die Abkühlung nach dem Saunagang wichtig?', 
      'Um schneller zu schwitzen', 
      'Um den Kreislauf zu trainieren und die Blutgefäße zu stärken', 
      'Um Gewicht zu verlieren', 
      'Um die Muskeln zu entspannen', 
      'B', 6),
    
    (quiz_new_id, 'Wie viele Saunagänge werden für eine typische Saunasitzung empfohlen?', 
      '1 Saunagang', 
      '2-3 Saunagänge', 
      '5-6 Saunagänge', 
      'So viele wie möglich', 
      'B', 7),
    
    (quiz_new_id, 'Welche Wirkung hat die Sauna auf die Haut?', 
      'Sie trocknet die Haut dauerhaft aus', 
      'Sie fördert die Durchblutung und reinigt die Poren', 
      'Sie verursacht Hautausschlag', 
      'Sie hat keine Wirkung auf die Haut', 
      'B', 8),
    
    (quiz_new_id, 'Wo sollte man in der Sauna am besten sitzen, wenn man Anfänger ist?', 
      'Auf den unteren Bänken, wo es kühler ist', 
      'Immer ganz oben, wo es am heißesten ist', 
      'In der Mitte der Sauna', 
      'Direkt neben dem Ofen', 
      'A', 9),
    
    (quiz_new_id, 'Warum sollte man vor dem Saunagang gut abtrocknen?', 
      'Um schneller zu schwitzen', 
      'Weil trockene Haut schneller schwitzt als nasse', 
      'Um die Handtücher zu schonen', 
      'Um Bakterien zu entfernen', 
      'B', 10),
    
    (quiz_new_id, 'Was sollte man während des Saunierens trinken?', 
      'Alkohol zur Entspannung', 
      'Kaffee', 
      'Wasser oder ungesüßte Tees', 
      'Energydrinks', 
      'C', 11),
    
    (quiz_new_id, 'Welche Auswirkung hat die Sauna auf den Blutdruck?', 
      'Der Blutdruck steigt dauerhaft an', 
      'Der Blutdruck sinkt zunächst in der Wärme, steigt beim Abkühlen kurz an', 
      'Der Blutdruck bleibt immer gleich', 
      'Der Blutdruck sinkt gefährlich ab', 
      'B', 12),
    
    (quiz_new_id, 'Wann sollte man NICHT in die Sauna gehen?', 
      'Nach dem Sport', 
      'Am Abend', 
      'Bei Fieber oder akuten Infektionen', 
      'Am Wochenende', 
      'C', 13),
    
    (quiz_new_id, 'Wie wirkt sich Saunieren auf die Muskulatur aus?', 
      'Die Muskeln werden schwächer', 
      'Die Durchblutung wird gefördert und Verspannungen lösen sich', 
      'Die Muskeln verkrampfen', 
      'Es hat keine Wirkung auf die Muskeln', 
      'B', 14),
    
    (quiz_new_id, 'Was bedeutet "Sauna" im Finnischen?', 
      'Heißer Raum', 
      'Schwitzstube oder Dampfbad', 
      'Entspannung', 
      'Holzhaus', 
      'B', 15),
    
    (quiz_new_id, 'Wie sollte man sich nach dem Saunagang abkühlen?', 
      'Sofort ins eiskalte Wasser springen', 
      'Erst an der frischen Luft abkühlen, dann kalt duschen oder ins Tauchbecken', 
      'Gar nicht abkühlen', 
      'Nur mit warmem Wasser duschen', 
      'B', 16),
    
    (quiz_new_id, 'Welche Wirkung hat die Sauna auf das Herz-Kreislauf-System?', 
      'Sie belastet das Herz stark negativ', 
      'Sie trainiert die Blutgefäße und stärkt das Herz-Kreislauf-System', 
      'Sie hat keine Wirkung', 
      'Sie verursacht Herzrhythmusstörungen', 
      'B', 17),
    
    (quiz_new_id, 'Warum sollte man in der Sauna ein Handtuch unterlegen?', 
      'Um bequemer zu sitzen', 
      'Aus hygienischen Gründen - kein Schweiß soll auf das Holz gelangen', 
      'Um sich nicht zu verbrennen', 
      'Um das Holz zu schützen', 
      'B', 18),
    
    (quiz_new_id, 'Wie viel Flüssigkeit verliert man durchschnittlich bei einem Saunabesuch?', 
      '0,1-0,2 Liter', 
      '0,5-1,5 Liter', 
      '3-4 Liter', 
      '5-6 Liter', 
      'B', 19),
    
    (quiz_new_id, 'Ab welchem Alter dürfen Kinder in die Sauna?', 
      'Erst ab 16 Jahren', 
      'Erst ab 12 Jahren', 
      'Bereits als Kleinkind, aber mit kürzeren Saunagängen und niedrigerer Temperatur', 
      'Kinder dürfen gar nicht in die Sauna', 
      'C', 20),
    
    (quiz_new_id, 'Was sollte man zwischen den Saunagängen tun?', 
      'Sofort wieder in die Sauna gehen', 
      'Sport treiben', 
      'Eine Ruhepause von mindestens 15-20 Minuten einlegen', 
      'Schwer essen', 
      'C', 21),
    
    (quiz_new_id, 'Welche Wirkung hat die Sauna auf Stress?', 
      'Sie erhöht den Stress', 
      'Sie reduziert Stress und fördert die Entspannung', 
      'Sie hat keine Wirkung auf Stress', 
      'Sie verursacht Angstzustände', 
      'B', 22),
    
    (quiz_new_id, 'Was ist der Unterschied zwischen einer finnischen Sauna und einem Dampfbad?', 
      'Finnische Sauna: hohe Temperatur, niedrige Luftfeuchtigkeit; Dampfbad: niedrigere Temperatur, sehr hohe Luftfeuchtigkeit', 
      'Es gibt keinen Unterschied', 
      'Finnische Sauna ist kühler als ein Dampfbad', 
      'Im Dampfbad ist es trockener', 
      'A', 23),
    
    (quiz_new_id, 'Wie wirkt sich regelmäßiges Saunieren auf den Schlaf aus?', 
      'Es verursacht Schlaflosigkeit', 
      'Es kann die Schlafqualität verbessern und für besseren Schlaf sorgen', 
      'Es hat keine Wirkung auf den Schlaf', 
      'Es macht übermäßig müde am Tag', 
      'B', 24);

  RAISE NOTICE 'Sauna-Quiz erfolgreich erstellt mit ID: %', quiz_new_id;
END $$;

