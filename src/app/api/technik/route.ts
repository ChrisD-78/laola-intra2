import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

// GET - Fetch all inspections
export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM technik_inspections
      ORDER BY naechste_pruefung ASC
    `
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching inspections:', error)
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 })
  }
}

// POST - Create new inspection
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

    // Check if ID already exists
    const existingId = await sql`
      SELECT id_nr FROM technik_inspections WHERE id_nr = ${id_nr}
    `

    if (existingId.length > 0) {
      return NextResponse.json({ 
        error: 'ID-Nr. already exists',
        message: 'Diese ID-Nr. wird bereits verwendet. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.' 
      }, { status: 409 })
    }

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
      )
      VALUES (
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

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating inspection:', error)
    return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 })
  }
}

// PATCH - Update inspection
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Build dynamic update query
    const updateFields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      updateFields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)

    const query = `
      UPDATE technik_inspections
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await sql(query, values)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating inspection:', error)
    return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 })
  }
}

// DELETE - Delete inspection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM technik_inspections
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Inspection deleted successfully', data: result[0] })
  } catch (error) {
    console.error('Error deleting inspection:', error)
    return NextResponse.json({ error: 'Failed to delete inspection' }, { status: 500 })
  }
}

