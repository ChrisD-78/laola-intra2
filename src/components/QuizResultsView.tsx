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
                              {result.wrong_answers.length} falsch
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ✓ {selectedResult.correct_answers.length} richtig
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        ✗ {selectedResult.wrong_answers.length} falsch
                      </span>
                    </div>
                  </div>

                  {/* Falsch beantwortete Fragen */}
                  {selectedResult.wrong_answers.length > 0 && (
                    <div className="mb-6">
                      <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 rounded">
                        <h4 className="text-lg font-bold text-red-700 flex items-center gap-2">
                          ❌ Falsch beantwortete Fragen ({selectedResult.wrong_answers.length})
                        </h4>
                        <p className="text-sm text-red-600 mt-1">
                          Diese Fragen aus dem Quiz <strong>"{quizTitle}"</strong> wurden falsch beantwortet und sollten für eine Nachschulung wiederholt werden.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {selectedResult.wrong_answers.map((answer, index) => (
                          <div
                            key={answer.question_id}
                            className="border-2 border-red-200 bg-red-50 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm">
                                    {answer.question_order}
                                  </span>
                                  <span className="text-sm font-medium text-gray-600">
                                    Frage {answer.question_order} aus "{quizTitle}"
                                  </span>
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-3">
                                  {answer.question_text}
                                </h5>
                              </div>
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

                            {/* Erklärung */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">❌ Ihre Antwort:</span>
                                <span className="text-gray-700">{answer.user_answer_text || 'Keine Antwort'}</span>
                              </div>
                              <div className="flex items-start gap-2 mt-2">
                                <span className="text-green-600 font-bold">✓ Richtige Antwort:</span>
                                <span className="text-gray-700">{answer.correct_answer_text}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

