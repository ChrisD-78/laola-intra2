import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    // Globale Rangliste über alle Quizze hinweg
    const query = `
      WITH user_quiz_stats AS (
        SELECT 
          user_name,
          quiz_id,
          MAX(score) as best_score,
          COUNT(*) as quiz_attempts
        FROM quiz_results
        GROUP BY user_name, quiz_id
      ),
      user_totals AS (
        SELECT 
          uqs.user_name,
          SUM(uqs.best_score) as total_score,
          SUM(q.total_questions) as total_questions,
          SUM(uqs.quiz_attempts) as total_attempts
        FROM user_quiz_stats uqs
        JOIN quizzes q ON uqs.quiz_id = q.id
        GROUP BY uqs.user_name
      )
      SELECT 
        user_name,
        total_score,
        total_questions,
        ROUND((total_score::decimal / NULLIF(total_questions, 0)) * 100, 2) as percentage,
        total_attempts
      FROM user_totals
      WHERE total_questions > 0
      ORDER BY percentage DESC, total_score DESC, total_attempts ASC
      LIMIT 50
    `

    const result = await sql(query)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch global leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch global leaderboard' }, { status: 500 })
  }
}

