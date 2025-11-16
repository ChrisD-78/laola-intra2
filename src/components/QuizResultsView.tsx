'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface AnswerDetail {
  question_id: string
  question_text: string
  question_order: number
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  user_answer_text: string
  correct_answer_text: string
}

interface QuizResult {
  id: string
  user_name: string
  score: number
  total_questions: number
  percentage: number
  time_taken_seconds: number | null
  completed_at: string
  answers: AnswerDetail[]
  wrong_answers: AnswerDetail[]
  correct_answers: AnswerDetail[]
}

interface QuizResultsViewProps {
  quizId: string
  quizTitle: string
  onClose: () => void
}

export default function QuizResultsView({ quizId, quizTitle, onClose }: QuizResultsViewProps) {
  const { currentUser, isAdmin } = useAuth()
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    loadResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  const loadResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/quiz/${quizId}/results?user_name=${encodeURIComponent(currentUser || '')}&is_admin=${isAdmin}`
      )

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Ergebnisse')
      }

      const data = await response.json()

      if (data.success && data.results) {
        // Debug: Log the results to see what we're getting
        console.log('Quiz Results loaded:', data.results)
        data.results.forEach((result: any, index: number) => {
          console.log(`Result ${index}:`, {
            user_name: result.user_name,
            score: result.score,
            total_questions: result.total_questions,
            wrong_answers_count: result.wrong_answers?.length || 0,
            correct_answers_count: result.correct_answers?.length || 0,
            wrong_answers: result.wrong_answers
          })
        })
        
        setResults(data.results)
        // Wenn nur ein Ergebnis vorhanden ist, automatisch auswählen
        if (data.results.length === 1) {
          setSelectedResult(data.results[0])
        }
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Ergebnisse')
      }
    } catch (err) {
      console.error('Failed to load results:', err)
      setError('Fehler beim Laden der Ergebnisse')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')} min`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOptionLabel = (option: string) => {
    return option || '-'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Ergebnisse...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fehler</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={loadResults}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📊 Quiz-Ergebnisse</h2>
              <p className="text-white/90 text-sm mt-1">{quizTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Ergebnisse gefunden</h3>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'Für dieses Quiz wurden noch keine Ergebnisse gespeichert.'
                  : 'Sie haben dieses Quiz noch nicht absolviert.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ergebnis-Liste (nur wenn mehrere Ergebnisse vorhanden oder Admin) */}
              {(results.length > 1 || isAdmin) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isAdmin ? 'Alle Ergebnisse' : 'Ihre Versuche'}
                  </h3>
                  <div className="space-y-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedResult?.id === result.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {isAdmin ? result.user_name : 'Ihr Versuch'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatDate(result.completed_at)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              Number(result.percentage || 0) >= 70 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.score} / {result.total_questions} ({Number(result.percentage || 0).toFixed(0)}%)
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(() => {
                                // Berechne falsch beantwortete Fragen: total - score
                                const wrongCount = (result.total_questions || 0) - (result.score || 0)
                                return wrongCount > 0 ? `${wrongCount} falsch` : '0 falsch'
                              })()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Detaillierte Ansicht */}
              {selectedResult && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  {/* Quiz-Info Badge */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                      <span className="text-lg">📝</span>
                      <span className="font-semibold">{quizTitle}</span>
                    </div>
                  </div>

                  {/* Ergebnis-Übersicht */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {isAdmin ? `Ergebnis von ${selectedResult.user_name}` : 'Ihr Ergebnis'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Abgeschlossen am {formatDate(selectedResult.completed_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          Number(selectedResult.percentage || 0) >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(selectedResult.percentage || 0).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedResult.score} / {selectedResult.total_questions} richtig
                        </div>
                        {selectedResult.time_taken_seconds && (
                          <div className="text-xs text-gray-500 mt-1">
                            ⏱️ {formatTime(selectedResult.time_taken_seconds)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status-Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        Number(selectedResult.percentage || 0) >= 70
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {Number(selectedResult.percentage || 0) >= 70 ? '✅ Bestanden' : '❌ Nicht bestanden'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ {selectedResult.score || 0} richtig
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        ✗ {(() => {
                          // Berechne falsch beantwortete Fragen: total - score
                          const wrongCount = (selectedResult.total_questions || 0) - (selectedResult.score || 0)
                          return wrongCount
                        })()} falsch
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        📊 {selectedResult.score || 0} / {selectedResult.total_questions || 0} Punkte
                      </span>
                    </div>
                  </div>

                  {/* Falsch beantwortete Fragen */}
                  {(() => {
                    // Berechne falsch beantwortete Fragen korrekt
                    const wrongCount = (selectedResult.total_questions || 0) - (selectedResult.score || 0)
                    const allAnswers = selectedResult.answers || []
                    const wrongAnswersFromAPI = selectedResult.wrong_answers || []
                    
                    // Identifiziere falsch beantwortete Fragen
                    // Wir wissen: score = Anzahl richtiger Antworten, wrongCount = total - score
                    // Wir müssen die wrongCount Fragen finden, die falsch sind
                    
                    // Sortiere alle Antworten nach question_order
                    const sortedAnswers = [...allAnswers].sort((a: any, b: any) => a.question_order - b.question_order)
                    
                    // Finde Fragen, die definitiv falsch sind (explizit is_correct === false oder Antworten stimmen nicht überein)
                    const definitelyWrong = sortedAnswers.filter((answer: any) => {
                      // Explizit als falsch markiert
                      if (answer.is_correct === false || 
                          answer.is_correct === 'false' || 
                          answer.is_correct === 0) {
                        return true
                      }
                      
                      // Antworten stimmen nicht überein (und es wurde eine Antwort gegeben)
                      if (answer.user_answer && 
                          answer.correct_answer && 
                          answer.user_answer !== answer.correct_answer) {
                        return true
                      }
                      
                      // Keine Antwort gegeben
                      if (!answer.user_answer || answer.user_answer === '') {
                        return true
                      }
                      
                      return false
                    })
                    
                    // Wenn wir genau wrongCount falsche Fragen haben, verwende diese
                    // Wenn wir mehr haben, nimm die ersten wrongCount (priorisiere explizit falsche)
                    // Wenn wir weniger haben, müssen wir weitere finden
                    let finalWrongAnswers: any[] = []
                    
                    if (definitelyWrong.length >= wrongCount) {
                      // Sortiere: explizit falsche zuerst, dann nach question_order
                      finalWrongAnswers = definitelyWrong
                        .sort((a: any, b: any) => {
                          const aExplicit = a.is_correct === false || a.is_correct === 'false'
                          const bExplicit = b.is_correct === false || b.is_correct === 'false'
                          if (aExplicit && !bExplicit) return -1
                          if (!aExplicit && bExplicit) return 1
                          return a.question_order - b.question_order
                        })
                        .slice(0, wrongCount)
                    } else {
                      // Wenn wir weniger haben, füge die hinzu, die wahrscheinlich falsch sind
                      // (nicht explizit richtig markiert)
                      const probablyWrong = sortedAnswers.filter((answer: any) => {
                        const isInDefinitelyWrong = definitelyWrong.some((w: any) => w.question_id === answer.question_id)
                        const isExplicitlyCorrect = answer.is_correct === true || 
                                                   answer.is_correct === 'true' || 
                                                   answer.is_correct === 1
                        return !isInDefinitelyWrong && !isExplicitlyCorrect
                      })
                      
                      finalWrongAnswers = [...definitelyWrong, ...probablyWrong]
                        .sort((a: any, b: any) => a.question_order - b.question_order)
                        .slice(0, wrongCount)
                    }
                    
                    // Debug logging
                    console.log('Selected Result Debug:', {
                      score: selectedResult.score,
                      total_questions: selectedResult.total_questions,
                      wrong_count_calculated: wrongCount,
                      all_answers_length: allAnswers.length,
                      wrong_answers_from_api_length: wrongAnswersFromAPI.length,
                      wrong_answers_filtered_length: finalWrongAnswers.length,
                      final_wrong_answers_length: finalWrongAnswers.length,
                      wrong_answers_filtered: finalWrongAnswers.map((a: any) => ({
                        question_order: a.question_order,
                        is_correct: a.is_correct,
                        user_answer: a.user_answer,
                        correct_answer: a.correct_answer,
                        answers_match: a.user_answer === a.correct_answer
                      }))
                    })
                    
                    return wrongCount > 0 ? (
                      <div className="mb-6">
                        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                          <h4 className="text-xl font-bold text-red-800 flex items-center gap-2 mb-2">
                            ❌ FALSCH BEANTWORTETE FRAGEN ({wrongCount})
                          </h4>
                          <p className="text-sm text-red-700 mb-3">
                            Diese <strong>{wrongCount} Frage(n)</strong> aus dem Quiz <strong>"{quizTitle}"</strong> wurden falsch beantwortet und sollten für eine Nachschulung wiederholt werden.
                          </p>
                          {/* Schnellübersicht: Welche Fragen wurden falsch beantwortet */}
                          {finalWrongAnswers.length > 0 ? (
                            <div className="bg-white rounded-lg p-3 border border-red-300">
                              <p className="text-xs font-semibold text-red-800 mb-2">Fragen-Nummern der falsch beantworteten Fragen:</p>
                              <div className="flex flex-wrap gap-2">
                                {finalWrongAnswers.map((answer: any) => (
                                  <span
                                    key={answer.question_id}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm"
                                    title={`Frage ${answer.question_order}: ${answer.user_answer || 'Keine Antwort'} (richtig: ${answer.correct_answer})`}
                                  >
                                    {answer.question_order}
                                  </span>
                                ))}
                              </div>
                              {finalWrongAnswers.length === 0 && wrongCount > 0 && (
                                <p className="text-xs text-red-600 mt-2">
                                  ⚠️ Die falsch beantworteten Fragen konnten nicht identifiziert werden. Erwartet: {wrongCount} Frage(n)
                                </p>
                              )}
                            </div>
                          ) : wrongCount > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
                              <p className="text-xs text-yellow-800">
                                ⚠️ Es wurden {wrongCount} falsch beantwortete Frage(n) erwartet, aber die Details konnten nicht geladen werden.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Detaillierte Ansicht jeder falsch beantworteten Frage */}
                        {finalWrongAnswers.length > 0 ? (
                          <div className="space-y-6">
                            {finalWrongAnswers.map((answer: any, index: number) => (
                          <div
                            key={answer.question_id}
                            className="border-4 border-red-400 bg-red-50 rounded-xl p-6 shadow-lg"
                          >
                            {/* Frage-Header - sehr prominent */}
                            <div className="mb-4 pb-4 border-b-2 border-red-300">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white font-bold text-lg shadow-md">
                                  {answer.question_order}
                                </span>
                                <div>
                                  <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                    Frage {answer.question_order} - FALSCH BEANTWORTET
                                  </span>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Quiz: {quizTitle}
                                  </p>
                                </div>
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 mt-3 leading-relaxed">
                                {answer.question_text}
                              </h5>
                            </div>

                            {/* Antwortoptionen */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {['A', 'B', 'C', 'D'].map((option) => {
                                const optionText = answer[`option_${option.toLowerCase()}` as keyof AnswerDetail] as string
                                const isUserAnswer = answer.user_answer === option
                                const isCorrectAnswer = answer.correct_answer === option

                                return (
                                  <div
                                    key={option}
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrectAnswer
                                        ? 'border-green-500 bg-green-50'
                                        : isUserAnswer
                                        ? 'border-red-500 bg-red-100'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className={`font-bold ${
                                        isCorrectAnswer
                                          ? 'text-green-700'
                                          : isUserAnswer
                                          ? 'text-red-700'
                                          : 'text-gray-600'
                                      }`}>
                                        {option}:
                                      </span>
                                      <span className={`text-sm ${
                                        isCorrectAnswer
                                          ? 'text-green-900 font-medium'
                                          : isUserAnswer
                                          ? 'text-red-900 font-medium'
                                          : 'text-gray-700'
                                      }`}>
                                        {getOptionLabel(optionText)}
                                      </span>
                                      {isCorrectAnswer && (
                                        <span className="ml-auto text-green-600 font-bold">✓</span>
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <span className="ml-auto text-red-600 font-bold">✗</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Erklärung - sehr prominent */}
                            <div className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-red-100 border-2 border-red-400 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">❌</span>
                                    <span className="text-red-800 font-bold text-sm uppercase">Ihre Antwort (FALSCH)</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold">
                                      {answer.user_answer}
                                    </span>
                                    <span className="text-gray-900 font-semibold">{answer.user_answer_text || 'Keine Antwort'}</span>
                                  </div>
                                </div>
                                <div className="p-3 bg-green-100 border-2 border-green-400 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">✓</span>
                                    <span className="text-green-800 font-bold text-sm uppercase">Richtige Antwort</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">
                                      {answer.correct_answer}
                                    </span>
                                    <span className="text-gray-900 font-semibold">{answer.correct_answer_text}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                            <p className="text-yellow-800 font-semibold">
                              ⚠️ Die falsch beantworteten Fragen konnten nicht geladen werden. Bitte versuchen Sie es erneut.
                            </p>
                            <p className="text-xs text-yellow-700 mt-2">
                              Erwartet: {wrongCount} falsch beantwortete Frage(n)
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">
                          ✅ Alle Fragen wurden korrekt beantwortet! Keine Nachschulung erforderlich.
                        </p>
                      </div>
                    )
                  })()}

                  {/* Richtig beantwortete Fragen (optional, kompakt) */}
                  {selectedResult.correct_answers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                        ✅ Richtig beantwortete Fragen ({selectedResult.correct_answers.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedResult.correct_answers.map((answer) => (
                          <div
                            key={answer.question_id}
                            className="border-2 border-green-200 bg-green-50 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold text-xs">
                                {answer.question_order}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {answer.question_text}
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  Ihre Antwort: {answer.user_answer_text}
                                </p>
                              </div>
                              <span className="text-green-600 font-bold">✓</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hinweis für Nachschulung */}
                  {selectedResult.wrong_answers.length > 0 && (
                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📚</span>
                        <div>
                          <h5 className="font-semibold text-blue-900 mb-1">Nachschulung empfohlen</h5>
                          <p className="text-sm text-blue-700">
                            Sie haben {selectedResult.wrong_answers.length} Frage(n) falsch beantwortet. 
                            Bitte wiederholen Sie die entsprechenden Themenbereiche.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wenn nur ein Ergebnis vorhanden, automatisch anzeigen */}
              {results.length === 1 && !selectedResult && (
                <div className="text-center py-8">
                  <button
                    onClick={() => setSelectedResult(results[0])}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Ergebnisse anzeigen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

