import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all employees
export async function GET() {
  try {
    // Prüfe ob user_id, role, active und birth_date Spalten existieren
    let hasUserIdColumn = false
    let hasRoleColumn = false
    let hasActiveColumn = false
    let hasEmploymentTypeColumn = false
    let hasMonthlyHoursColumn = false
    let hasBirthDateColumn = false
    
    try {
      const checkColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name IN ('user_id', 'role', 'active', 'employment_type', 'monthly_hours', 'birth_date')
      `
      hasUserIdColumn = checkColumns.some((col: any) => col.column_name === 'user_id')
      hasRoleColumn = checkColumns.some((col: any) => col.column_name === 'role')
      hasActiveColumn = checkColumns.some((col: any) => col.column_name === 'active')
      hasEmploymentTypeColumn = checkColumns.some((col: any) => col.column_name === 'employment_type')
      hasMonthlyHoursColumn = checkColumns.some((col: any) => col.column_name === 'monthly_hours')
      hasBirthDateColumn = checkColumns.some((col: any) => col.column_name === 'birth_date')
    } catch (checkError) {
      console.log('Could not check for columns, assuming they do not exist')
    }

    let employees: any[]
    
    if (hasUserIdColumn) {
      // Mit user_id und role Spalten
      employees = await sql`
        SELECT 
          se.id,
          se.user_id as "userId",
          se.first_name as "firstName",
          se.last_name as "lastName",
          se.areas,
          se.phone,
          se.email,
          se.weekly_hours as "weeklyHours",
          ${hasEmploymentTypeColumn ? sql`se.employment_type as "employmentType"` : sql`NULL as "employmentType"`},
          ${hasMonthlyHoursColumn ? sql`se.monthly_hours as "monthlyHours"` : sql`NULL as "monthlyHours"`},
          se.color,
          ${hasBirthDateColumn ? sql`se.birth_date as "birthDate"` : sql`NULL as "birthDate"`},
          ${hasActiveColumn ? sql`se.active` : sql`true as active`},
          ${hasRoleColumn ? sql`se.role` : sql`NULL as role`},
          u.display_name as "userDisplayName",
          u.username,
          u.is_admin as "userIsAdmin"
        FROM schichtplan_employees se
        LEFT JOIN users u ON se.user_id = u.id
        ORDER BY se.last_name, se.first_name
      `
    } else {
      // Ohne user_id Spalte
      employees = await sql`
        SELECT 
          se.id,
          NULL as "userId",
          se.first_name as "firstName",
          se.last_name as "lastName",
          se.areas,
          se.phone,
          se.email,
          se.weekly_hours as "weeklyHours",
          ${hasEmploymentTypeColumn ? sql`se.employment_type as "employmentType"` : sql`NULL as "employmentType"`},
          ${hasMonthlyHoursColumn ? sql`se.monthly_hours as "monthlyHours"` : sql`NULL as "monthlyHours"`},
          se.color,
          ${hasBirthDateColumn ? sql`se.birth_date as "birthDate"` : sql`NULL as "birthDate"`},
          ${hasActiveColumn ? sql`se.active` : sql`true as active`},
          NULL as role,
          NULL as "userDisplayName",
          NULL as username,
          NULL as "userIsAdmin"
        FROM schichtplan_employees se
        ORDER BY se.last_name, se.first_name
      `
    }
    
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, areas, phone, email, weeklyHours, monthlyHours, employmentType, color, birthDate, userId, role, active } = body

    // Check if columns exist
    let hasEmploymentTypeColumn = false
    let hasMonthlyHoursColumn = false
    
    try {
      const checkColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name IN ('employment_type', 'monthly_hours')
      `
      hasEmploymentTypeColumn = checkColumns.some((col: any) => col.column_name === 'employment_type')
      hasMonthlyHoursColumn = checkColumns.some((col: any) => col.column_name === 'monthly_hours')
    } catch (checkError) {
      console.log('Could not check for columns')
    }

    if (hasEmploymentTypeColumn && hasMonthlyHoursColumn) {
      const result = await sql`
        INSERT INTO schichtplan_employees (
          id, user_id, first_name, last_name, areas, phone, email, weekly_hours, monthly_hours, employment_type, color, birth_date, role, active
        ) VALUES (
          ${id}, ${userId || null}, ${firstName}, ${lastName}, ${areas}, ${phone || null}, ${email || null}, 
          ${weeklyHours || null}, ${monthlyHours || null}, ${employmentType || null}, ${color || null}, ${birthDate || null}, ${role || null}, ${active !== undefined ? active : true}
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
          monthly_hours as "monthlyHours",
          employment_type as "employmentType",
          color,
          birth_date as "birthDate",
          active,
          role
      `
      return NextResponse.json(result[0], { status: 201 })
    } else {
      // Fallback for old schema
      const result = await sql`
        INSERT INTO schichtplan_employees (
          id, user_id, first_name, last_name, areas, phone, email, weekly_hours, color, birth_date, role, active
        ) VALUES (
          ${id}, ${userId || null}, ${firstName}, ${lastName}, ${areas}, ${phone || null}, ${email || null}, 
          ${weeklyHours || null}, ${color || null}, ${birthDate || null}, ${role || null}, ${active !== undefined ? active : true}
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
          active,
          role
      `
      return NextResponse.json(result[0], { status: 201 })
    }

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
  let body: any = null
  try {
    body = await request.json()
    const { id, firstName, lastName, areas, phone, email, weeklyHours, monthlyHours, employmentType, color, birthDate, userId, role, active } = body

    // Normalize birthDate: empty string or undefined becomes null
    const normalizedBirthDate = (birthDate && typeof birthDate === 'string' && birthDate.trim() !== '') ? birthDate.trim() : null

    // Check if columns exist
    let hasEmploymentTypeColumn = false
    let hasMonthlyHoursColumn = false
    let hasBirthDateColumn = false
    
    try {
      const checkColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name IN ('employment_type', 'monthly_hours', 'birth_date')
      `
      hasEmploymentTypeColumn = checkColumns.some((col: any) => col.column_name === 'employment_type')
      hasMonthlyHoursColumn = checkColumns.some((col: any) => col.column_name === 'monthly_hours')
      hasBirthDateColumn = checkColumns.some((col: any) => col.column_name === 'birth_date')
    } catch (checkError) {
      console.log('Could not check for columns:', checkError)
    }
    
    console.log('Updating employee:', id, 'birthDate:', normalizedBirthDate, 'hasBirthDateColumn:', hasBirthDateColumn)

    if (hasEmploymentTypeColumn && hasMonthlyHoursColumn) {
      let result
      if (hasBirthDateColumn) {
        result = await sql`
          UPDATE schichtplan_employees
          SET 
            first_name = ${firstName},
            last_name = ${lastName},
            areas = ${areas},
            phone = ${phone || null},
            email = ${email || null},
            weekly_hours = ${weeklyHours || null},
            monthly_hours = ${monthlyHours || null},
            employment_type = ${employmentType || null},
            color = ${color || null},
            birth_date = ${normalizedBirthDate},
            user_id = ${userId !== undefined ? userId : null},
            role = ${role !== undefined ? role : null},
            active = ${active !== undefined ? active : true}
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
            monthly_hours as "monthlyHours",
            employment_type as "employmentType",
            color,
            birth_date as "birthDate",
            active,
            role
        `
      } else {
        result = await sql`
          UPDATE schichtplan_employees
          SET 
            first_name = ${firstName},
            last_name = ${lastName},
            areas = ${areas},
            phone = ${phone || null},
            email = ${email || null},
            weekly_hours = ${weeklyHours || null},
            monthly_hours = ${monthlyHours || null},
            employment_type = ${employmentType || null},
            color = ${color || null},
            user_id = ${userId !== undefined ? userId : null},
            role = ${role !== undefined ? role : null},
            active = ${active !== undefined ? active : true}
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
            monthly_hours as "monthlyHours",
            employment_type as "employmentType",
            color,
            NULL as "birthDate",
            active,
            role
        `
      }
      if (result.length === 0) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
      return NextResponse.json(result[0])
    } else {
      // Fallback for old schema
      let result
      if (hasBirthDateColumn) {
        result = await sql`
          UPDATE schichtplan_employees
          SET 
            first_name = ${firstName},
            last_name = ${lastName},
            areas = ${areas},
            phone = ${phone || null},
            email = ${email || null},
            weekly_hours = ${weeklyHours || null},
            color = ${color || null},
            birth_date = ${normalizedBirthDate},
            user_id = ${userId !== undefined ? userId : null},
            role = ${role !== undefined ? role : null},
            active = ${active !== undefined ? active : true}
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
            active,
            role
        `
      } else {
        result = await sql`
          UPDATE schichtplan_employees
          SET 
            first_name = ${firstName},
            last_name = ${lastName},
            areas = ${areas},
            phone = ${phone || null},
            email = ${email || null},
            weekly_hours = ${weeklyHours || null},
            color = ${color || null},
            user_id = ${userId !== undefined ? userId : null},
            role = ${role !== undefined ? role : null},
            active = ${active !== undefined ? active : true}
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
            NULL as "birthDate",
            active,
            role
        `
      }
      if (result.length === 0) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
      return NextResponse.json(result[0])
    }
  } catch (error) {
    console.error('Failed to update employee:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack, requestBody: body })
    return NextResponse.json(
      { 
        error: 'Failed to update employee', 
        details: errorMessage
      },
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

