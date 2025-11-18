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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
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
      status
    } = body

    const result = await sql`
      UPDATE technik_inspections
      SET 
        rubrik = ${rubrik},
        id_nr = ${id_nr},
        name = ${name},
        standort = ${standort},
        bild_url = ${bild_url || null},
        bild_name = ${bild_name || null},
        letzte_pruefung = ${letzte_pruefung},
        interval = ${interval},
        naechste_pruefung = ${naechste_pruefung},
        bericht_url = ${bericht_url || null},
        bericht_name = ${bericht_name || null},
        bemerkungen = ${bemerkungen || null},
        in_betrieb = ${in_betrieb !== undefined ? in_betrieb : true},
        kontaktdaten = ${kontaktdaten || null},
        status = ${status || 'Offen'},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to update inspection' },
      { status: 500 }
    )
  }
}

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
      DELETE FROM technik_inspections
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to delete inspection' },
      { status: 500 }
    )
  }
}

