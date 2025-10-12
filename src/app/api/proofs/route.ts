import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all external proofs
export async function GET() {
  try {
    const proofs = await sql`
      SELECT * FROM external_proofs 
      ORDER BY created_at DESC
    `
    return NextResponse.json(proofs)
  } catch (error) {
    console.error('Failed to fetch proofs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proofs' },
      { status: 500 }
    )
  }
}

// POST create new proof
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bezeichnung, vorname, nachname, datum, pdf_name, pdf_url } = body

    const result = await sql`
      INSERT INTO external_proofs (
        bezeichnung, vorname, nachname, datum, pdf_name, pdf_url
      ) VALUES (
        ${bezeichnung}, ${vorname}, ${nachname}, ${datum}, ${pdf_name || null}, ${pdf_url || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create proof:', error)
    return NextResponse.json(
      { error: 'Failed to create proof' },
      { status: 500 }
    )
  }
}

// DELETE proof
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM external_proofs WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete proof:', error)
    return NextResponse.json(
      { error: 'Failed to delete proof' },
      { status: 500 }
    )
  }
}
