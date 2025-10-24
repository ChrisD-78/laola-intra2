import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { createFormSubmissionEmail, sendEmailToMultiple } from '@/lib/emailService'

const sql = neon(process.env.DATABASE_URL!)

// GET all form submissions
export async function GET() {
  try {
    const submissions = await sql`
      SELECT * FROM form_submissions 
      ORDER BY submitted_at DESC
    `
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Failed to fetch form submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

// POST create new form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, status, form_data, submitted_by } = body

    const result = await sql`
      INSERT INTO form_submissions (
        type, title, description, status, form_data, submitted_by
      ) VALUES (
        ${type}, ${title}, ${description || null}, ${status || 'Eingegangen'}, 
        ${JSON.stringify(form_data)}, ${submitted_by}
      )
      RETURNING *
    `

    const submission = result[0]

    // E-Mail-Benachrichtigung senden
    try {
      console.log('📧 Sende E-Mail-Benachrichtigung für Formular-Eintrag:', submission.id)
      
      const emailData = createFormSubmissionEmail({
        type: submission.type,
        title: submission.title,
        description: submission.description,
        submittedBy: submission.submitted_by,
        formData: submission.form_data
      })

      const emailResult = await sendEmailToMultiple(emailData)
      
      if (emailResult.success) {
        console.log('✅ E-Mail-Benachrichtigung erfolgreich gesendet')
      } else {
        console.error('❌ E-Mail-Benachrichtigung fehlgeschlagen:', emailResult.error)
        // E-Mail-Fehler nicht an Client weiterleiten, da Formular-Eintrag erfolgreich war
      }
    } catch (emailError) {
      console.error('❌ Fehler beim Senden der E-Mail-Benachrichtigung:', emailError)
      // E-Mail-Fehler nicht an Client weiterleiten, da Formular-Eintrag erfolgreich war
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Failed to create form submission:', error)
    return NextResponse.json(
      { error: 'Failed to create form submission' },
      { status: 500 }
    )
  }
}

// DELETE form submission
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM form_submissions WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete form submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    )
  }
}
