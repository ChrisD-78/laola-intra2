'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface LeaderboardEntry {
  user_name: string
  best_score: number
  best_percentage: number
  attempts: number
  fastest_time: number
  last_attempt: string
}

interface QuizLeaderboardProps {
  quizId: string
  quizTitle: string
  totalQuestions: number
}

export default function QuizLeaderboard({ quizId, quizTitle, totalQuestions }: QuizLeaderboardProps) {
  const { isAdmin } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ userName: string; userDisplayName: string } | null>(null)

  useEffect(() => {
    if (quizId) {
      loadLeaderboard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/leaderboard`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      const data = await response.json()
      setLeaderboard(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')} min`
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
      await loadLeaderboard()
      setShowDeleteConfirm(null)
      alert(`Alle Quiz-Ergebnisse von ${userName} wurden erfolgreich gelöscht.`)
    } catch (error) {
      console.error('Failed to delete quiz results:', error)
      alert('Fehler beim Löschen der Quiz-Ergebnisse.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Lade Rangliste...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">🏆 Rangliste</h3>
        <p className="text-white/90">{quizTitle}</p>
        <p className="text-sm text-white/70 mt-1">
          Insgesamt {totalQuestions} Fragen • {leaderboard.length} Teilnehmer
        </p>
      </div>

      {/* Podium für Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Platz 2 */}
          <div className="flex flex-col items-center pt-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 flex items-center justify-center text-3xl mb-2 shadow-lg">
              🥈
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">{leaderboard[1].user_name}</p>
              <p className="text-2xl font-bold text-gray-700">{leaderboard[1].best_score}/{totalQuestions}</p>
              <p className="text-xs text-gray-500">{Number(leaderboard[1].best_percentage || 0).toFixed(0)}%</p>
            </div>
          </div>

          {/* Platz 1 */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl mb-2 shadow-2xl animate-pulse">
              🥇
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">{leaderboard[0].user_name}</p>
              <p className="text-3xl font-bold text-yellow-600">{leaderboard[0].best_score}/{totalQuestions}</p>
              <p className="text-xs text-gray-500">{Number(leaderboard[0].best_percentage || 0).toFixed(0)}%</p>
              <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                👑 Champion
              </span>
            </div>
          </div>

          {/* Platz 3 */}
          <div className="flex flex-col items-center pt-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-3xl mb-2 shadow-lg">
              🥉
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">{leaderboard[2].user_name}</p>
              <p className="text-2xl font-bold text-orange-600">{leaderboard[2].best_score}/{totalQuestions}</p>
              <p className="text-xs text-gray-500">{Number(leaderboard[2].best_percentage || 0).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Vollständige Rangliste */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Alle Teilnehmer</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beste Punktzahl</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prozent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schnellste Zeit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versuche</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    Noch keine Teilnehmer. Sei der Erste!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, index) => {
                  const rank = index + 1
                  const bestPercentage = Number(entry.best_percentage || 0)
                  const isPassed = bestPercentage >= 70

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankColor(rank)}`}>
                          {rank <= 3 ? getMedalIcon(rank) : rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.user_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {entry.best_score} / {totalQuestions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPassed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bestPercentage.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(entry.fastest_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.attempts}x
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  )
}

