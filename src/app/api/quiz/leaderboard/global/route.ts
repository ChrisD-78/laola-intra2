import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    
    // Check if quiz_results table has any data
    const hasResults = await sql`SELECT COUNT(*) as count FROM quiz_results LIMIT 1`
    
    if (!hasResults || hasResults.length === 0 || hasResults[0].count === 0) {
      // No results yet, return empty array
      return NextResponse.json([])
    }
    
    // Globale Rangliste über alle Quizze hinweg
    const result = await sql`
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
    
    return NextResponse.json(result || [])
  } catch (error) {
    console.error('Failed to fetch global leaderboard:', error)
    // Return empty array instead of error to prevent crashes
    return NextResponse.json([])
  }
}

