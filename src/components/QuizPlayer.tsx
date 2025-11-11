'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  question_order: number
}

interface Quiz {
  id: string
  title: string
  description: string
  total_questions: number
  passing_score: number
}

interface QuizPlayerProps {
  quizId: string
  onComplete: (score: number, total: number, percentage: number) => void
  onClose: () => void
}

export default function QuizPlayer({ quizId, onComplete, onClose }: QuizPlayerProps) {
  const { currentUser } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }
      const data = await response.json()
      if (data.quiz && data.questions) {
        setQuiz(data.quiz)
        setQuestions(data.questions)
        setSelectedAnswers(new Array(data.questions.length).fill(''))
      } else {
        throw new Error('Invalid quiz data')
      }
    } catch (error) {
      console.error('Failed to load quiz:', error)
      alert('Quiz konnte nicht geladen werden. Bitte versuchen Sie es erneut.')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: currentUser || 'Gast',
          answers: selectedAnswers,
          time_taken_seconds: timeTaken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data = await response.json()
      
      if (data.success && data.result) {
        setShowResult(true)
        // Safely call onComplete with validated data
        onComplete(
          data.result.score || 0,
          data.result.total || questions.length,
          data.result.percentage || 0
        )
      } else {
        throw new Error('Invalid response data')
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Fehler beim Speichern der Ergebnisse. Bitte versuchen Sie es erneut.')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Quiz wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return null
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const allAnswered = selectedAnswers.every(a => a !== '')

  if (showResult) {
    return null // Ergebnis wird vom Parent-Component behandelt
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
              <p className="text-white/80 text-sm mt-1">
                Frage {currentQuestion + 1} von {questions.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQ.question_text}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = currentQ[`option_${option.toLowerCase()}` as keyof Question] as string
              const isSelected = selectedAnswers[currentQuestion] === option

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {optionText}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Zurück
            </button>

            <div className="text-sm text-gray-600">
              {selectedAnswers.filter(a => a !== '').length} / {questions.length} beantwortet
            </div>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestion]}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quiz abschließen ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

