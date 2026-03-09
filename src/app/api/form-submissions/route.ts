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

    // E-Mail-Benachrichtigung senden (außer bei Formularen mit eigener Mail-Logik)
    if (submission.type !== 'schulung_unterweisung' && submission.type !== 'stundenkorrektur') {
      try {
        console.log('📧 Sende E-Mail-Benachrichtigung für Formular-Eintrag:', submission.id)
        console.log('📧 Formular-Typ:', submission.type)
        console.log('📧 Titel:', submission.title)
        
        const emailData = createFormSubmissionEmail({
          type: submission.type,
          title: submission.title,
          description: submission.description,
          submittedBy: submission.submitted_by,
          formData: submission.form_data
        })

        console.log('📧 E-Mail-Empfänger:', emailData.to)
        console.log('📧 E-Mail-Betreff:', emailData.subject)

        const emailResult = await sendEmailToMultiple(emailData)
        
        if (emailResult.success) {
          console.log('✅ E-Mail-Benachrichtigung erfolgreich gesendet')
          if (emailResult.details) {
            console.log('📊 E-Mail-Details:', {
              erfolgreich: emailResult.details.successful,
              fehlgeschlagen: emailResult.details.failed,
              fehler: emailResult.details.errors
            })
          }
        } else {
          console.error('❌ E-Mail-Benachrichtigung fehlgeschlagen:', emailResult.error)
          if (emailResult.details) {
            console.error('📊 E-Mail-Fehler-Details:', emailResult.details)
          }
          // E-Mail-Fehler nicht an Client weiterleiten, da Formular-Eintrag erfolgreich war
        }
      } catch (emailError) {
        console.error('❌ Fehler beim Senden der E-Mail-Benachrichtigung:', emailError)
        // E-Mail-Fehler nicht an Client weiterleiten, da Formular-Eintrag erfolgreich war
      }
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

// PATCH: Update einzelne Felder der Formulardaten (z.B. Bemerkungen)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, bemerkungen } = body as { id?: string; bemerkungen?: string }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Nur das Feld "bemerkungen" im JSON aktualisieren, andere Daten bleiben unverändert
    const result = await sql`
      UPDATE form_submissions
      SET form_data = jsonb_set(
        form_data::jsonb,
        '{bemerkungen}',
        to_jsonb(${bemerkungen ?? ''}),
        true
      )
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Form submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update form submission:', error)
    return NextResponse.json(
      { error: 'Failed to update form submission' },
      { status: 500 }
    )
  }
}
