import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        rubrik,
        id_nr,
        name,
        standort,
        bild_url,
        bild_name,
        letzte_pruefung,
        interval,
        naechste_pruefung,
        bericht_url,
        bericht_name,
        bemerkungen,
        in_betrieb,
        kontaktdaten,
        status,
        created_at,
        updated_at
      FROM technik_inspections
      ORDER BY naechste_pruefung ASC, created_at DESC
    `
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch technik inspections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      rubrik,
      id_nr,
      name,
      standort,
      bild_url,
      bild_name,
      letzte_pruefung,
      interval,
      naechste_pruefung,
      bericht_url,
      bericht_name,
      bemerkungen,
      in_betrieb,
      kontaktdaten,
      status
    } = body

    const result = await sql`
      INSERT INTO technik_inspections (
        rubrik,
        id_nr,
        name,
        standort,
        bild_url,
        bild_name,
        letzte_pruefung,
        interval,
        naechste_pruefung,
        bericht_url,
        bericht_name,
        bemerkungen,
        in_betrieb,
        kontaktdaten,
        status
      ) VALUES (
        ${rubrik},
        ${id_nr},
        ${name},
        ${standort},
        ${bild_url || null},
        ${bild_name || null},
        ${letzte_pruefung},
        ${interval},
        ${naechste_pruefung},
        ${bericht_url || null},
        ${bericht_name || null},
        ${bemerkungen || null},
        ${in_betrieb !== undefined ? in_betrieb : true},
        ${kontaktdaten || null},
        ${status || 'Offen'}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to create technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    )
  }
}

