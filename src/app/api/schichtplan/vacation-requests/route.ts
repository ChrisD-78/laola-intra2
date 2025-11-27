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

