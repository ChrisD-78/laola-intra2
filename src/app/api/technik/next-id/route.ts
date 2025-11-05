import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

// GET - Get next available ID for a category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rubrik = searchParams.get('rubrik')

    if (!rubrik) {
      return NextResponse.json({ error: 'Rubrik parameter is required' }, { status: 400 })
    }

    // Map category to 3-letter prefix
    const prefixMap: { [key: string]: string } = {
      'Messgeräte': 'MES',
      'Wartungen': 'WAR',
      'Prüfungen': 'PRÜ',
      'Elektrische Prüfungen': 'ELE',
      'Lüftungen': 'LÜF'
    }

    const prefix = prefixMap[rubrik]
    
    if (!prefix) {
      return NextResponse.json({ error: 'Invalid rubrik' }, { status: 400 })
    }

    // Get all existing IDs with this prefix
    const result = await sql`
      SELECT id_nr 
      FROM technik_inspections 
      WHERE id_nr LIKE ${prefix + '-%'}
      ORDER BY id_nr DESC
      LIMIT 1
    `

    let nextNumber = 1
    
    if (result.length > 0) {
      // Extract the number from the last ID (e.g., "MES-005" -> 5)
      const lastId = result[0].id_nr
      const lastNumber = parseInt(lastId.split('-')[1], 10)
      nextNumber = lastNumber + 1
    }

    // Format with leading zeros (e.g., 001, 002, 099, 100)
    const nextId = `${prefix}-${String(nextNumber).padStart(3, '0')}`

    return NextResponse.json({ 
      nextId,
      prefix,
      number: nextNumber
    })
  } catch (error) {
    console.error('Error generating next ID:', error)
    return NextResponse.json({ error: 'Failed to generate next ID' }, { status: 500 })
  }
}

