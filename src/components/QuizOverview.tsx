'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import QuizPlayer from './QuizPlayer'
import QuizLeaderboard from './QuizLeaderboard'
import QuizResultsView from './QuizResultsView'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  total_questions: number
  passing_score: number
  total_attempts: number
  avg_score: number
}

interface QuizOverviewProps {
  onBack?: () => void
}

interface GlobalLeaderboardEntry {
  user_name: string
  total_score: number
  total_questions: number
  percentage: number
  total_attempts: number
}

export default function QuizOverview({ onBack }: QuizOverviewProps) {
  const { currentUser, isAdmin } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showQuizPlayer, setShowQuizPlayer] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState<Quiz | null>(null)
  const [showResultsView, setShowResultsView] = useState<Quiz | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percentage: number } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ userName: string; userDisplayName: string } | null>(null)

  // Helper function to safely format percentage
  const formatPercentage = (value: any): string => {
    try {
      const num = Number(value || 0)
      return isNaN(num) ? '0' : num.toFixed(0)
    } catch {
      return '0'
    }
  }

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (mounted) {
        await loadQuizzes()
        await loadGlobalLeaderboard()
      }
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz')
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes')
      }
      const data = await response.json()
      setQuizzes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const loadGlobalLeaderboard = async () => {
    try {
      const response = await fetch('/api/quiz/leaderboard/global')
      if (!response.ok) {
        throw new Error('Failed to fetch global leaderboard')
      }
      const data = await response.json()
      setGlobalLeaderboard(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load global leaderboard:', error)
      setGlobalLeaderboard([])
    }
  }

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowQuizPlayer(true)
    setQuizResult(null)
  }

  const handleQuizComplete = (score: number, total: number, percentage: number) => {
    setQuizResult({ score, total, percentage })
    setShowQuizPlayer(false)
    loadQuizzes() // Reload to update stats
    loadGlobalLeaderboard() // Reload global leaderboard
  }

  const handleShowLeaderboard = (quiz: Quiz) => {
    setShowLeaderboard(quiz)
  }

  const handleShowResults = (quiz: Quiz) => {
    setShowResultsView(quiz)
  }

  const handleDeleteUserResults = async (userName: string) => {
    try {
      const response = await fetch(`/api/quiz/results/${encodeURIComponent(userName)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete quiz results')
      }
      
      // Reload leaderboard after deletion
      await loadGlobalLeaderboard()
      await loadQuizzes()
      setShowDeleteConfirm(null)
      alert(`Alle Quiz-Ergebnisse von ${userName} wurden erfolgreich gelöscht.`)
    } catch (error) {
      console.error('Failed to delete quiz results:', error)
      alert('Fehler beim Löschen der Quiz-Ergebnisse.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Lade Quizze...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Button */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-white flex items-center gap-2"
          >
            ← Zurück
          </button>
        )}
        <div className={onBack ? 'ml-32' : ''}>
          <h2 className="text-3xl font-bold mb-2">🎯 Quiz-Bereich</h2>
          <p className="text-white/90">
            Teste dein Wissen und sammle Punkte! Vergleiche dich mit deinen Kollegen in der Rangliste.
          </p>
        </div>
      </div>

      {/* Globale Rangliste mit Siegertreppe */}
      {globalLeaderboard.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1">🏆 Hall of Fame</h3>
            <p className="text-white/90">Die besten Quiz-Teilnehmer im Überblick</p>
          </div>

          {/* Siegertreppe - Top 3 */}
          {globalLeaderboard && globalLeaderboard.length >= 3 && globalLeaderboard[0] && globalLeaderboard[1] && globalLeaderboard[2] && (
            <div className="p-6 bg-gradient-to-b from-yellow-50 to-white">
              <div className="flex justify-center items-end gap-4 max-w-2xl mx-auto">
                {/* Platz 2 - Links */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-3xl sm:text-4xl mb-2 shadow-lg ring-4 ring-gray-200">
                    🥈
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{globalLeaderboard[1].user_name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-700">{globalLeaderboard[1].total_score}/{globalLeaderboard[1].total_questions}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(globalLeaderboard[1].percentage)}%</p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-xl h-24 sm:h-32 flex items-center justify-center shadow-lg">
                    <span className="text-4xl sm:text-5xl font-bold text-white">2</span>
                  </div>
                </div>

                {/* Platz 1 - Mitte (höher) */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center text-4xl sm:text-5xl mb-2 shadow-2xl ring-4 ring-yellow-300 animate-pulse">
                    🥇
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-gray-900 text-base sm:text-lg">{globalLeaderboard[0].user_name}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{globalLeaderboard[0].total_score}/{globalLeaderboard[0].total_questions}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(globalLeaderboard[0].percentage)}%</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      👑 Champion
                    </span>
                  </div>
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-xl h-32 sm:h-40 flex items-center justify-center shadow-2xl">
                    <span className="text-5xl sm:text-6xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* Platz 3 - Rechts */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl sm:text-4xl mb-2 shadow-lg ring-4 ring-orange-200">
                    🥉
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{globalLeaderboard[2].user_name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{globalLeaderboard[2].total_score}/{globalLeaderboard[2].total_questions}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(globalLeaderboard[2].percentage)}%</p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-xl h-20 sm:h-28 flex items-center justify-center shadow-lg">
                    <span className="text-4xl sm:text-5xl font-bold text-white">3</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vollständige Rangliste */}
          {globalLeaderboard.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">📊 Alle Teilnehmer</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punkte</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prozent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versuche</th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {globalLeaderboard.map((entry, index) => {
                      const rank = index + 1
                      const getMedalIcon = (r: number) => {
                        switch (r) {
                          case 1: return '🥇'
                          case 2: return '🥈'
                          case 3: return '🥉'
                          default: return r
                        }
                      }
                      const getRankColor = (r: number) => {
                        switch (r) {
                          case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                          case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                          case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                          default: return 'bg-gray-100 text-gray-700'
                        }
                      }

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankColor(rank)}`}>
                              {rank <= 3 ? getMedalIcon(rank) : rank}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.user_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {entry.total_score} / {entry.total_questions}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.percentage >= 70
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {formatPercentage(entry.percentage)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {entry.total_attempts}x
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => setShowDeleteConfirm({ userName: entry.user_name, userDisplayName: entry.user_name })}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-1"
                                title="Alle Quiz-Ergebnisse dieses Benutzers löschen"
                              >
                                🗑️ Löschen
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz-Ergebnisse löschen?</h3>
              <p className="text-gray-600">
                Möchten Sie wirklich <strong>alle Quiz-Ergebnisse</strong> von{' '}
                <strong className="text-red-600">{showDeleteConfirm.userDisplayName}</strong> löschen?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDeleteUserResults(showDeleteConfirm.userName)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                🗑️ Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Result Popup */}
      {quizResult && (
        <div className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {quizResult.percentage >= 70 ? '🎉' : '📚'}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {quizResult.percentage >= 70 ? 'Bestanden!' : 'Nicht bestanden'}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              Du hast <span className="font-bold text-blue-600">{quizResult.score}</span> von{' '}
              <span className="font-bold">{quizResult.total}</span> Fragen richtig beantwortet
            </p>
            <div className="text-3xl font-bold mb-4">
              <span className={quizResult.percentage >= 70 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(quizResult.percentage)}%
              </span>
            </div>
            <button
              onClick={() => setQuizResult(null)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      )}

      {/* Available Quizzes */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📝 Verfügbare Quizze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{quiz.title}</h3>
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-white/90 text-sm">{quiz.description}</p>
            </div>

            {/* Quiz Info */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Fragen</p>
                  <p className="text-2xl font-bold text-blue-900">{quiz.total_questions}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Bestehen</p>
                  <p className="text-2xl font-bold text-green-900">{quiz.passing_score}%</p>
                </div>
              </div>

              {/* Stats */}
              {quiz.total_attempts > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Durchschnitt:</span>
                    <span className="font-semibold text-gray-900">
                      {(() => {
                        try {
                          const score = Number(quiz.avg_score || 0)
                          return isNaN(score) ? '0' : score.toFixed(0)
                        } catch {
                          return '0'
                        }
                      })()}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Teilnahmen:</span>
                    <span className="font-semibold text-gray-900">{quiz.total_attempts || 0}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ▶️ Quiz starten
                </button>
                <button
                  onClick={() => handleShowResults(quiz)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Ergebnisse anzeigen"
                >
                  📊
                </button>
                <button
                  onClick={() => handleShowLeaderboard(quiz)}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="Rangliste anzeigen"
                >
                  🏆
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Quizze verfügbar</h3>
            <p className="text-gray-600">Quizze werden in Kürze hinzugefügt.</p>
          </div>
        )}
      </div>

      {/* Quiz Player Modal */}
      {showQuizPlayer && selectedQuiz && (
        <QuizPlayer
          quizId={selectedQuiz.id}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuizPlayer(false)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowLeaderboard(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Rangliste</h3>
              <button
                onClick={() => setShowLeaderboard(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <QuizLeaderboard
                quizId={showLeaderboard.id}
                quizTitle={showLeaderboard.title}
                totalQuestions={showLeaderboard.total_questions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results View Modal */}
      {showResultsView && (
        <QuizResultsView
          quizId={showResultsView.id}
          quizTitle={showResultsView.title}
          onClose={() => setShowResultsView(null)}
        />
      )}
    </div>
  )
}

