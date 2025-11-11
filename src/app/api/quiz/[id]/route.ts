import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET quiz with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { id } = await params

    // Get quiz details
    const quiz = await sql`
      SELECT * FROM quizzes WHERE id = ${id} AND is_active = true LIMIT 1
    `

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get questions
    const questions = await sql`
      SELECT 
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        question_order
      FROM quiz_questions
      WHERE quiz_id = ${id}
      ORDER BY question_order ASC
    `

    return NextResponse.json({
      quiz: quiz[0],
      questions: questions
    })
  } catch (error) {
    console.error('Failed to fetch quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

