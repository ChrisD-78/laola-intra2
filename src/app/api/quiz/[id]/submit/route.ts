import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// POST submit quiz results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { id } = await params
    const body = await request.json()
    const { user_name, answers, time_taken_seconds } = body

    // Get correct answers
    const questions = await sql`
      SELECT id, correct_answer
      FROM quiz_questions
      WHERE quiz_id = ${id}
      ORDER BY question_order ASC
    `

    // Calculate score and prepare detailed answers
    let correctCount = 0
    const detailedAnswers = questions.map((question, index) => {
      const userAnswer = answers[index] || ''
      const isCorrect = userAnswer === question.correct_answer
      if (isCorrect) {
        correctCount++
      }
      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect
      }
    })

    const totalQuestions = questions.length
    const percentage = (correctCount / totalQuestions) * 100

    // Save result with detailed answers
    const userAnswersJson = JSON.stringify(detailedAnswers)
    const result = await sql`
      INSERT INTO quiz_results (
        quiz_id,
        user_name,
        score,
        total_questions,
        percentage,
        time_taken_seconds,
        user_answers
      ) VALUES (
        ${id},
        ${user_name},
        ${correctCount},
        ${totalQuestions},
        ${percentage},
        ${time_taken_seconds || null},
        ${userAnswersJson}::jsonb
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      result: {
        score: correctCount,
        total: totalQuestions,
        percentage: percentage,
        passed: percentage >= 70
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}

