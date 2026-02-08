import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all dashboard infos
export async function GET() {
  try {
    const infos = await sql`
      SELECT * FROM dashboard_infos 
      ORDER BY created_at DESC
    `
    return NextResponse.json(infos)
  } catch (error) {
    console.error('Failed to fetch dashboard infos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard infos' },
      { status: 500 }
    )
  }
}

// POST create new dashboard info
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/dashboard-infos - Starting...')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, content, timestamp, pdf_name, pdf_url, is_popup } = body
    
    console.log('Inserting into database...')
    const result = await sql`
      INSERT INTO dashboard_infos (
        title, content, timestamp, pdf_name, pdf_url, is_popup
      ) VALUES (
        ${title}, ${content}, ${timestamp}, ${pdf_name || null}, ${pdf_url || null}, ${is_popup || false}
      )
      RETURNING *
    `
    
    console.log('Insert successful:', result[0])

    try {
      const baseUrl = request.nextUrl.origin
      const snippet = typeof content === 'string' ? content : ''
      await fetch(`${baseUrl}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Aktuelle Information',
          body: snippet.length > 120 ? `${snippet.slice(0, 117)}...` : snippet,
          url: '/',
          icon: '/favicon-96x96.png'
        })
      })
    } catch (pushError) {
      console.error('Push notification failed:', pushError)
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('=== DASHBOARD INFO CREATE ERROR ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)
    console.error('DATABASE_URL set:', !!process.env.DATABASE_URL)
    return NextResponse.json(
      { 
        error: 'Failed to create dashboard info', 
        details: error instanceof Error ? error.message : String(error),
        hasDbUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    )
  }
}

// DELETE dashboard info
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminUser = searchParams.get('admin_user')
    const isAdmin = searchParams.get('is_admin') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (!isAdmin || !adminUser) {
      return NextResponse.json(
        { error: 'Admin rights required' },
        { status: 403 }
      )
    }

    const adminResult = await sql`
      SELECT is_admin
      FROM users
      WHERE display_name = ${adminUser} OR username = ${adminUser}
      LIMIT 1
    `

    if (adminResult.length === 0 || !adminResult[0].is_admin) {
      return NextResponse.json(
        { error: 'Admin rights required' },
        { status: 403 }
      )
    }

    await sql`DELETE FROM dashboard_infos WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard info' },
      { status: 500 }
    )
  }
}
