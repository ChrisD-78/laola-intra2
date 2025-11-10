'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import QuizPlayer from './QuizPlayer'
import QuizLeaderboard from './QuizLeaderboard'

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

export default function QuizOverview() {
  const { currentUser } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showQuizPlayer, setShowQuizPlayer] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState<Quiz | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percentage: number } | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz')
      const data = await response.json()
      setQuizzes(data)
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoading(false)
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
  }

  const handleShowLeaderboard = (quiz: Quiz) => {
    setShowLeaderboard(quiz)
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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🎯 Quiz-Bereich</h2>
        <p className="text-white/90">
          Teste dein Wissen und sammle Punkte! Vergleiche dich mit deinen Kollegen in der Rangliste.
        </p>
      </div>

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
                {quizResult.percentage.toFixed(0)}%
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
                      {quiz.avg_score ? quiz.avg_score.toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Teilnahmen:</span>
                    <span className="font-semibold text-gray-900">{quiz.total_attempts}</span>
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
    </div>
  )
}

