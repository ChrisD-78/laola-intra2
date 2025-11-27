import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all employees
export async function GET() {
  try {
    const employees = await sql`
      SELECT 
        se.id,
        se.user_id as "userId",
        se.first_name as "firstName",
        se.last_name as "lastName",
        se.areas,
        se.phone,
        se.email,
        se.weekly_hours as "weeklyHours",
        se.color,
        se.birth_date as "birthDate",
        se.role,
        u.display_name as "userDisplayName",
        u.username,
        u.is_admin as "userIsAdmin"
      FROM schichtplan_employees se
      LEFT JOIN users u ON se.user_id = u.id
      ORDER BY se.last_name, se.first_name
    `
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, areas, phone, email, weeklyHours, color, birthDate, userId, role } = body

    const result = await sql`
      INSERT INTO schichtplan_employees (
        id, user_id, first_name, last_name, areas, phone, email, weekly_hours, color, birth_date, role
      ) VALUES (
        ${id}, ${userId || null}, ${firstName}, ${lastName}, ${areas}, ${phone || null}, ${email || null}, 
        ${weeklyHours || null}, ${color || null}, ${birthDate || null}, ${role || null}
      )
      RETURNING 
        id,
        user_id as "userId",
        first_name as "firstName",
        last_name as "lastName",
        areas,
        phone,
        email,
        weekly_hours as "weeklyHours",
        color,
        birth_date as "birthDate",
        role
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

// PUT update employee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, areas, phone, email, weeklyHours, color, birthDate, userId, role } = body

    const result = await sql`
      UPDATE schichtplan_employees
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        areas = ${areas},
        phone = ${phone || null},
        email = ${email || null},
        weekly_hours = ${weeklyHours || null},
        color = ${color || null},
        birth_date = ${birthDate || null},
        user_id = ${userId !== undefined ? userId : null},
        role = ${role !== undefined ? role : null}
      WHERE id = ${id}
      RETURNING 
        id,
        user_id as "userId",
        first_name as "firstName",
        last_name as "lastName",
        areas,
        phone,
        email,
        weekly_hours as "weeklyHours",
        color,
        birth_date as "birthDate",
        role
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE employee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM schichtplan_employees WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}

