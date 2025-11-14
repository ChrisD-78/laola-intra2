import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userName: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { userName } = await params
    
    if (!userName) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL)
    
    // Delete all quiz results for this user
    const result = await sql`
      DELETE FROM quiz_results
      WHERE user_name = ${userName}
      RETURNING id
    `
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.length,
      message: `Alle Quiz-Ergebnisse von ${userName} wurden gelöscht.`
    })
  } catch (error) {
    console.error('Failed to delete quiz results:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz results' },
      { status: 500 }
    )
  }
}

