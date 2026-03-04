import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET alle Betriebsanweisungen Maschinen
export async function GET() {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        hersteller,
        standort,
        anlage,
        bemerkung,
        pdf_url,
        pdf_name,
        created_at,
        updated_at
      FROM technik_betriebsanweisungen_maschinen
      ORDER BY name ASC
    `
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch betriebsanweisungen maschinen:', error)
    return NextResponse.json(
      { error: 'Failed to fetch betriebsanweisungen maschinen' },
      { status: 500 }
    )
  }
}

// POST neue Betriebsanweisung Maschine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, hersteller, standort, anlage, bemerkung, pdf_url, pdf_name } = body

    const result = await sql`
      INSERT INTO technik_betriebsanweisungen_maschinen (
        name,
        hersteller,
        standort,
        anlage,
        bemerkung,
        pdf_url,
        pdf_name
      ) VALUES (
        ${name},
        ${hersteller || null},
        ${standort || null},
        ${anlage || null},
        ${bemerkung || null},
        ${pdf_url || null},
        ${pdf_name || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to create betriebsanweisung maschine:', error)
    return NextResponse.json(
      { error: 'Failed to create betriebsanweisung maschine' },
      { status: 500 }
    )
  }
}

// PATCH Betriebsanweisung Maschine aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, hersteller, standort, anlage, bemerkung, pdf_url, pdf_name } = body

    const result = await sql`
      UPDATE technik_betriebsanweisungen_maschinen
      SET
        name = ${name},
        hersteller = ${hersteller || null},
        standort = ${standort || null},
        anlage = ${anlage || null},
        bemerkung = ${bemerkung || null},
        pdf_url = ${pdf_url || null},
        pdf_name = ${pdf_name || null},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Betriebsanweisung Maschine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update betriebsanweisung maschine:', error)
    return NextResponse.json(
      { error: 'Failed to update betriebsanweisung maschine' },
      { status: 500 }
    )
  }
}

// DELETE Betriebsanweisung Maschine
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM technik_betriebsanweisungen_maschinen
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Betriebsanweisung Maschine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete betriebsanweisung maschine:', error)
    return NextResponse.json(
      { error: 'Failed to delete betriebsanweisung maschine' },
      { status: 500 }
    )
  }
}

