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
    let hasActiveColumn = false
    let hasUserIdColumn = false
    let hasRoleColumn = false
    
    try {
      const checkColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name IN ('employment_type', 'monthly_hours', 'birth_date', 'active', 'user_id', 'role')
      `
      hasEmploymentTypeColumn = checkColumns.some((col: any) => col.column_name === 'employment_type')
      hasMonthlyHoursColumn = checkColumns.some((col: any) => col.column_name === 'monthly_hours')
      hasBirthDateColumn = checkColumns.some((col: any) => col.column_name === 'birth_date')
      hasActiveColumn = checkColumns.some((col: any) => col.column_name === 'active')
      hasUserIdColumn = checkColumns.some((col: any) => col.column_name === 'user_id')
      hasRoleColumn = checkColumns.some((col: any) => col.column_name === 'role')
    } catch (checkError) {
      console.log('Could not check for columns:', checkError)
    }
    
    console.log('Updating employee:', id, 'birthDate:', normalizedBirthDate, 'hasBirthDateColumn:', hasBirthDateColumn, 'hasActiveColumn:', hasActiveColumn)

    // Build base SET clause
    const baseSetFields = [
      sql`first_name = ${firstName}`,
      sql`last_name = ${lastName}`,
      sql`areas = ${areas}`,
      sql`phone = ${phone || null}`,
      sql`email = ${email || null}`,
      sql`weekly_hours = ${weeklyHours || null}`,
      sql`color = ${color || null}`
    ]
    
    if (hasEmploymentTypeColumn && hasMonthlyHoursColumn) {
      baseSetFields.push(sql`monthly_hours = ${monthlyHours || null}`)
      baseSetFields.push(sql`employment_type = ${employmentType || null}`)
    }
    
    if (hasBirthDateColumn) {
      baseSetFields.push(sql`birth_date = ${normalizedBirthDate}`)
    }
    
    if (hasUserIdColumn) {
      baseSetFields.push(sql`user_id = ${userId !== undefined ? userId : null}`)
    }
    
    if (hasRoleColumn) {
      baseSetFields.push(sql`role = ${role !== undefined ? role : null}`)
    }
    
    if (hasActiveColumn) {
      baseSetFields.push(sql`active = ${active !== undefined ? active : true}`)
    }
    
    // Build RETURNING clause
    const returningFields = [
      sql`id`,
      sql`first_name as "firstName"`,
      sql`last_name as "lastName"`,
      sql`areas`,
      sql`phone`,
      sql`email`,
      sql`weekly_hours as "weeklyHours"`,
      sql`color`
    ]
    
    if (hasEmploymentTypeColumn && hasMonthlyHoursColumn) {
      returningFields.push(sql`monthly_hours as "monthlyHours"`)
      returningFields.push(sql`employment_type as "employmentType"`)
    } else {
      returningFields.push(sql`NULL as "monthlyHours"`)
      returningFields.push(sql`NULL as "employmentType"`)
    }
    
    if (hasBirthDateColumn) {
      returningFields.push(sql`birth_date as "birthDate"`)
    } else {
      returningFields.push(sql`NULL as "birthDate"`)
    }
    
    if (hasUserIdColumn) {
      returningFields.push(sql`user_id as "userId"`)
    } else {
      returningFields.push(sql`NULL as "userId"`)
    }
    
    if (hasRoleColumn) {
      returningFields.push(sql`role`)
    } else {
      returningFields.push(sql`NULL as role`)
    }
    
    if (hasActiveColumn) {
      returningFields.push(sql`active`)
    } else {
      returningFields.push(sql`true as active`)
    }
    
    // Execute UPDATE
    const result = await sql`
      UPDATE schichtplan_employees
      SET ${sql.join(baseSetFields, sql`, `)}
      WHERE id = ${id}
      RETURNING ${sql.join(returningFields, sql`, `)}
    `
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    return NextResponse.json(result[0])
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

