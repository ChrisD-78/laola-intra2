import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET all quizzes
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const quizzes = await sql`
      SELECT 
        q.*,
        COALESCE(COUNT(qr.id), 0) as total_attempts,
        COALESCE(AVG(qr.percentage), 0) as avg_score
      FROM quizzes q
      LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
      WHERE q.is_active = true
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `

    return NextResponse.json(quizzes || [])
  } catch (error) {
    console.error('Failed to fetch quizzes:', error)
    // Return empty array instead of error to prevent crashes
    return NextResponse.json([])
  }
}

