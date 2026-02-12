import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Empfänger und Nachricht sind erforderlich' },
        { status: 400 }
      )
    }

    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        {
          error: 'E-Mail-Konfiguration fehlt',
          details: 'EMAIL_USER oder EMAIL_PASS nicht gesetzt'
        },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    await transporter.verify()

    const mailOptions = {
      from: emailUser,
      to,
      subject: subject || 'Nachricht von E-Mail Assistent',
      text: message,
      html: message.replace(/\n/g, '<br>')
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `E-Mail erfolgreich an ${to} gesendet`
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim E-Mail-Versand'
    return NextResponse.json(
      { error: 'Fehler beim E-Mail-Versand: ' + message },
      { status: 500 }
    )
  }
}
