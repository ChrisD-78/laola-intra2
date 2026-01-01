import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        gefahrstoffsymbole,
        info,
        bemerkung,
        sicherheitsdatenblatt_url,
        sicherheitsdatenblatt_name,
        betriebsanweisung_laola_url,
        betriebsanweisung_laola_name,
        betriebsanweisung_freibad_url,
        betriebsanweisung_freibad_name,
        wassergefaehrdungsklasse,
        verbrauch_jahresmenge,
        substitution_geprueft_ergebnis,
        created_at,
        updated_at
      FROM gefahrstoffe
      ORDER BY name ASC
    `
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch gefahrstoffe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gefahrstoffe' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      gefahrstoffsymbole,
      info,
      bemerkung,
      sicherheitsdatenblatt_url,
      sicherheitsdatenblatt_name,
      betriebsanweisung_laola_url,
      betriebsanweisung_laola_name,
      betriebsanweisung_freibad_url,
      betriebsanweisung_freibad_name,
      wassergefaehrdungsklasse,
      verbrauch_jahresmenge,
      substitution_geprueft_ergebnis
    } = body

    const result = await sql`
      INSERT INTO gefahrstoffe (
        name,
        gefahrstoffsymbole,
        info,
        bemerkung,
        sicherheitsdatenblatt_url,
        sicherheitsdatenblatt_name,
        betriebsanweisung_laola_url,
        betriebsanweisung_laola_name,
        betriebsanweisung_freibad_url,
        betriebsanweisung_freibad_name,
        wassergefaehrdungsklasse,
        verbrauch_jahresmenge,
        substitution_geprueft_ergebnis
      ) VALUES (
        ${name},
        ${gefahrstoffsymbole || null},
        ${info || null},
        ${bemerkung || null},
        ${sicherheitsdatenblatt_url || null},
        ${sicherheitsdatenblatt_name || null},
        ${betriebsanweisung_laola_url || null},
        ${betriebsanweisung_laola_name || null},
        ${betriebsanweisung_freibad_url || null},
        ${betriebsanweisung_freibad_name || null},
        ${wassergefaehrdungsklasse || null},
        ${verbrauch_jahresmenge || null},
        ${substitution_geprueft_ergebnis || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to create gefahrstoff:', error)
    return NextResponse.json(
      { error: 'Failed to create gefahrstoff' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      gefahrstoffsymbole,
      info,
      bemerkung,
      sicherheitsdatenblatt_url,
      sicherheitsdatenblatt_name,
      betriebsanweisung_laola_url,
      betriebsanweisung_laola_name,
      betriebsanweisung_freibad_url,
      betriebsanweisung_freibad_name,
      wassergefaehrdungsklasse,
      verbrauch_jahresmenge,
      substitution_geprueft_ergebnis
    } = body

    const result = await sql`
      UPDATE gefahrstoffe
      SET 
        name = ${name},
        gefahrstoffsymbole = ${gefahrstoffsymbole || null},
        info = ${info || null},
        bemerkung = ${bemerkung || null},
        sicherheitsdatenblatt_url = ${sicherheitsdatenblatt_url || null},
        sicherheitsdatenblatt_name = ${sicherheitsdatenblatt_name || null},
        betriebsanweisung_laola_url = ${betriebsanweisung_laola_url || null},
        betriebsanweisung_laola_name = ${betriebsanweisung_laola_name || null},
        betriebsanweisung_freibad_url = ${betriebsanweisung_freibad_url || null},
        betriebsanweisung_freibad_name = ${betriebsanweisung_freibad_name || null},
        wassergefaehrdungsklasse = ${wassergefaehrdungsklasse || null},
        verbrauch_jahresmenge = ${verbrauch_jahresmenge || null},
        substitution_geprueft_ergebnis = ${substitution_geprueft_ergebnis || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Gefahrstoff not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update gefahrstoff:', error)
    return NextResponse.json(
      { error: 'Failed to update gefahrstoff' },
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
      DELETE FROM gefahrstoffe
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Gefahrstoff not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete gefahrstoff:', error)
    return NextResponse.json(
      { error: 'Failed to delete gefahrstoff' },
      { status: 500 }
    )
  }
}



