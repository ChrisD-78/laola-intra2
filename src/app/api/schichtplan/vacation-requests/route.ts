import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all vacation requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')

    let requests
    if (status) {
      requests = await sql`
        SELECT 
          id,
          employee_id as "employeeId",
          employee_name as "employeeName",
          start_date as "startDate",
          end_date as "endDate",
          type,
          status,
          requested_at as "requestedAt",
          reviewed_at as "reviewedAt",
          reviewed_by as "reviewedBy"
        FROM schichtplan_vacation_requests
        WHERE status = ${status}
        ORDER BY requested_at DESC
      `
    } else if (employeeId) {
      requests = await sql`
        SELECT 
          id,
          employee_id as "employeeId",
          employee_name as "employeeName",
          start_date as "startDate",
          end_date as "endDate",
          type,
          status,
          requested_at as "requestedAt",
          reviewed_at as "reviewedAt",
          reviewed_by as "reviewedBy"
        FROM schichtplan_vacation_requests
        WHERE employee_id = ${employeeId}
        ORDER BY requested_at DESC
      `
    } else {
      requests = await sql`
        SELECT 
          id,
          employee_id as "employeeId",
          employee_name as "employeeName",
          start_date as "startDate",
          end_date as "endDate",
          type,
          status,
          requested_at as "requestedAt",
          reviewed_at as "reviewedAt",
          reviewed_by as "reviewedBy"
        FROM schichtplan_vacation_requests
        ORDER BY requested_at DESC
      `
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Failed to fetch vacation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vacation requests' },
      { status: 500 }
    )
  }
}

// POST create vacation request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, employeeId, employeeName, startDate, endDate, type } = body

    // Prüfe Urlaubslimit nur für Urlaubsanträge
    if (type === 'Urlaub') {
      // Hole den Bereich des Mitarbeiters
      const employee = await sql`
        SELECT areas
        FROM schichtplan_employees
        WHERE id = ${employeeId}
        LIMIT 1
      `

      if (employee.length > 0 && employee[0].areas && Array.isArray(employee[0].areas) && employee[0].areas.length > 0) {
        const employeeAreas = employee[0].areas

        // Prüfe für jeden Bereich des Mitarbeiters
        for (const area of employeeAreas) {
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

          if (limits.length > 0) {
            // Prüfe für jedes Limit, ob die maximale Anzahl erreicht ist
            for (const limit of limits) {
              // Zähle genehmigte und ausstehende Urlaubsanträge im überlappenden Zeitraum für diesen Bereich
              const overlappingRequests = await sql`
                SELECT COUNT(*)::int as count
                FROM schichtplan_vacation_requests vr
                INNER JOIN schichtplan_employees se ON se.id = vr.employee_id
                WHERE vr.status IN ('pending', 'approved')
                  AND vr.type = 'Urlaub'
                  AND se.areas @> ${JSON.stringify([area])}
                  AND vr.start_date <= ${limit.endDate}
                  AND vr.end_date >= ${limit.startDate}
              `

              const currentCount = overlappingRequests[0]?.count || 0
              
              if (currentCount >= limit.maxEmployees) {
                return NextResponse.json(
                  { 
                    error: 'Zu diesem Zeitpunkt ist die maximale Urlaubsfreigabe bereits ausgeschöpft.',
                    limitExceeded: true,
                    area: area,
                    currentCount: currentCount,
                    maxCount: limit.maxEmployees
                  },
                  { status: 400 }
                )
              }
            }
          }
        }
      }
    }

    const result = await sql`
      INSERT INTO schichtplan_vacation_requests (
        id, employee_id, employee_name, start_date, end_date, type
      ) VALUES (
        ${id}, ${employeeId}, ${employeeName}, ${startDate}, ${endDate}, ${type}
      )
      RETURNING 
        id,
        employee_id as "employeeId",
        employee_name as "employeeName",
        start_date as "startDate",
        end_date as "endDate",
        type,
        status,
        requested_at as "requestedAt",
        reviewed_at as "reviewedAt",
        reviewed_by as "reviewedBy"
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create vacation request:', error)
    return NextResponse.json(
      { error: 'Failed to create vacation request' },
      { status: 500 }
    )
  }
}

// PUT update vacation request (for approval/rejection)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, reviewedBy } = body

    const result = await sql`
      UPDATE schichtplan_vacation_requests
      SET 
        status = ${status},
        reviewed_at = NOW(),
        reviewed_by = ${reviewedBy || null}
      WHERE id = ${id}
      RETURNING 
        id,
        employee_id as "employeeId",
        employee_name as "employeeName",
        start_date as "startDate",
        end_date as "endDate",
        type,
        status,
        requested_at as "requestedAt",
        reviewed_at as "reviewedAt",
        reviewed_by as "reviewedBy"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Vacation request not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update vacation request:', error)
    return NextResponse.json(
      { error: 'Failed to update vacation request' },
      { status: 500 }
    )
  }
}

