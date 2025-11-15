import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET detailed quiz results
// For regular users: only their own results
// For admins: all results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get('user_name')
    const isAdmin = searchParams.get('is_admin') === 'true'

    // Get quiz details
    const quiz = await sql`
      SELECT id, title, total_questions, passing_score
      FROM quizzes
      WHERE id = ${id}
      LIMIT 1
    `

    if (quiz.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz nicht gefunden' },
        { status: 404 }
      )
    }

    // Get all questions with options
    const questions = await sql`
      SELECT 
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        question_order
      FROM quiz_questions
      WHERE quiz_id = ${id}
      ORDER BY question_order ASC
    `

    // Get results based on user role
    let results
    if (isAdmin) {
      // Admins see all results
      results = await sql`
        SELECT 
          id,
          user_name,
          score,
          total_questions,
          percentage,
          time_taken_seconds,
          completed_at,
          user_answers
        FROM quiz_results
        WHERE quiz_id = ${id}
        ORDER BY completed_at DESC
      `
    } else {
      // Regular users see only their own results
      if (!userName) {
        return NextResponse.json(
          { success: false, error: 'Benutzername erforderlich' },
          { status: 400 }
        )
      }
      results = await sql`
        SELECT 
          id,
          user_name,
          score,
          total_questions,
          percentage,
          time_taken_seconds,
          completed_at,
          user_answers
        FROM quiz_results
        WHERE quiz_id = ${id} AND user_name = ${userName}
        ORDER BY completed_at DESC
      `
    }

    // Enrich results with question details
    const enrichedResults = results.map((result: any) => {
      const userAnswers = result.user_answers || []
      
      // Create a map of user answers by question_id for quick lookup
      const userAnswersMap = new Map()
      userAnswers.forEach((answer: any) => {
        userAnswersMap.set(answer.question_id, answer)
      })

      // Process ALL questions, not just the ones in user_answers
      // This ensures we show all questions, even if some weren't answered
      const detailedAnswers = questions.map((question: any) => {
        const userAnswer = userAnswersMap.get(question.id)
        
        // If no answer was given, treat it as incorrect
        const userAnswerValue = userAnswer?.user_answer || ''
        const isCorrect = userAnswerValue === question.correct_answer && userAnswerValue !== ''
        
        return {
          question_id: question.id,
          question_text: question.question_text,
          question_order: question.question_order,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          user_answer: userAnswerValue,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          user_answer_text: userAnswerValue ? (question[`option_${userAnswerValue.toLowerCase()}` as keyof typeof question] || '') : 'Keine Antwort',
          correct_answer_text: question[`option_${question.correct_answer.toLowerCase()}` as keyof typeof question] || ''
        }
      })

      // Calculate correct/wrong counts based on actual data
      const correctCount = detailedAnswers.filter((a: any) => a.is_correct).length
      const wrongCount = detailedAnswers.filter((a: any) => !a.is_correct).length

      return {
        id: result.id,
        user_name: result.user_name,
        score: Number(result.score || 0),
        total_questions: Number(result.total_questions || 0),
        percentage: Number(result.percentage || 0),
        time_taken_seconds: result.time_taken_seconds ? Number(result.time_taken_seconds) : null,
        completed_at: result.completed_at,
        answers: detailedAnswers,
        wrong_answers: detailedAnswers.filter((a: any) => !a.is_correct),
        correct_answers: detailedAnswers.filter((a: any) => a.is_correct),
        // Debug info
        _debug: {
          total_questions_in_quiz: questions.length,
          total_answers_in_result: detailedAnswers.length,
          correct_count: correctCount,
          wrong_count: wrongCount,
          score_from_db: result.score
        }
      }
    })

    return NextResponse.json({
      success: true,
      quiz: quiz[0],
      results: enrichedResults
    })
  } catch (error) {
    console.error('Failed to fetch quiz results:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Ergebnisse' },
      { status: 500 }
    )
  }
}

