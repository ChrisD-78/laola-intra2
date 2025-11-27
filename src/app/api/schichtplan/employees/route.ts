import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all employees
export async function GET() {
  try {
    const employees = await sql`
      SELECT 
        id,
        first_name as "firstName",
        last_name as "lastName",
        areas,
        phone,
        email,
        weekly_hours as "weeklyHours",
        color,
        birth_date as "birthDate"
      FROM schichtplan_employees
      ORDER BY last_name, first_name
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
    const { id, firstName, lastName, areas, phone, email, weeklyHours, color, birthDate } = body

    const result = await sql`
      INSERT INTO schichtplan_employees (
        id, first_name, last_name, areas, phone, email, weekly_hours, color, birth_date
      ) VALUES (
        ${id}, ${firstName}, ${lastName}, ${areas}, ${phone || null}, ${email || null}, 
        ${weeklyHours || null}, ${color || null}, ${birthDate || null}
      )
      RETURNING 
        id,
        first_name as "firstName",
        last_name as "lastName",
        areas,
        phone,
        email,
        weekly_hours as "weeklyHours",
        color,
        birth_date as "birthDate"
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
    const { id, firstName, lastName, areas, phone, email, weeklyHours, color, birthDate } = body

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
        birth_date = ${birthDate || null}
      WHERE id = ${id}
      RETURNING 
        id,
        first_name as "firstName",
        last_name as "lastName",
        areas,
        phone,
        email,
        weekly_hours as "weeklyHours",
        color,
        birth_date as "birthDate"
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

