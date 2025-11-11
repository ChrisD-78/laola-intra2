import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET leaderboard for quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { id } = await params

    const leaderboard = await sql`
      SELECT 
        user_name,
        MAX(score) as best_score,
        MAX(percentage) as best_percentage,
        COUNT(*) as attempts,
        MIN(time_taken_seconds) as fastest_time,
        MAX(completed_at) as last_attempt
      FROM quiz_results
      WHERE quiz_id = ${id}
      GROUP BY user_name
      ORDER BY best_score DESC, fastest_time ASC
      LIMIT 50
    `

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

