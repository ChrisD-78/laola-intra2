import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all vacation limits
export async function GET() {
  try {
    const limits = await sql`
      SELECT 
        id,
        start_date as "startDate",
        end_date as "endDate",
        area,
        max_employees as "maxEmployees",
        created_at as "createdAt"
      FROM schichtplan_vacation_limits
      ORDER BY start_date ASC, area ASC
    `

    return NextResponse.json(limits)
  } catch (error) {
    console.error('Failed to fetch vacation limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vacation limits' },
      { status: 500 }
    )
  }
}

// POST create vacation limit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, area, maxEmployees } = body

    if (!startDate || !endDate || !area || !maxEmployees) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO schichtplan_vacation_limits (
        start_date, end_date, area, max_employees
      ) VALUES (
        ${startDate}, ${endDate}, ${area}, ${maxEmployees}
      )
      RETURNING 
        id,
        start_date as "startDate",
        end_date as "endDate",
        area,
        max_employees as "maxEmployees",
        created_at as "createdAt"
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create vacation limit:', error)
    return NextResponse.json(
      { error: 'Failed to create vacation limit' },
      { status: 500 }
    )
  }
}

// DELETE vacation limit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM schichtplan_vacation_limits
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete vacation limit:', error)
    return NextResponse.json(
      { error: 'Failed to delete vacation limit' },
      { status: 500 }
    )
  }
}

// Check if vacation request exceeds limit
export async function checkVacationLimit(
  startDate: string,
  endDate: string,
  area: string
): Promise<{ allowed: boolean; message?: string; currentCount?: number; maxCount?: number }> {
  try {
    // Finde alle relevanten Limits, die mit dem Zeitraum überlappen
    const limits = await sql`
      SELECT 
        id,
        start_date as "startDate",
        end_date as "endDate",
        area,
        max_employees as "maxEmployees"
      FROM schichtplan_vacation_limits
      WHERE area = ${area}
        AND start_date <= ${endDate}
        AND end_date >= ${startDate}
    `

    if (limits.length === 0) {
      // Keine Limits für diesen Zeitraum/Bereich
      return { allowed: true }
    }

    // Prüfe für jedes Limit, ob die maximale Anzahl erreicht ist
    for (const limit of limits) {
      // Zähle genehmigte und ausstehende Urlaubsanträge im überlappenden Zeitraum
      const overlappingRequests = await sql`
        SELECT COUNT(*) as count
        FROM schichtplan_vacation_requests vr
        INNER JOIN schichtplan_employees se ON se.id = vr.employee_id
        WHERE vr.status IN ('pending', 'approved')
          AND vr.type = 'Urlaub'
          AND se.areas @> ${JSON.stringify([area])}
          AND vr.start_date <= ${limit.endDate}
          AND vr.end_date >= ${limit.startDate}
      `

      const currentCount = parseInt(overlappingRequests[0]?.count || '0')
      
      if (currentCount >= limit.maxEmployees) {
        return {
          allowed: false,
          message: 'Zu diesem Zeitpunkt ist die maximale Urlaubsfreigabe bereits ausgeschöpft.',
          currentCount,
          maxCount: limit.maxEmployees
        }
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Failed to check vacation limit:', error)
    // Bei Fehler erlauben (fail-open)
    return { allowed: true }
  }
}
