import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    // SMTP-Konfiguration
    // Für Gmail verwenden wir App-Passwords
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'christof.drost@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password' // App-Password von Gmail
      }
    })

    // E-Mail-Optionen
    const mailOptions = {
      from: process.env.EMAIL_USER || 'christof.drost@gmail.com',
      to: to,
      subject: subject,
      html: html,
      text: text
    }

    // E-Mail senden
    const info = await transporter.sendMail(mailOptions)
    
    console.log('E-Mail gesendet:', info.messageId)
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'E-Mail erfolgreich gesendet' 
    })

  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Senden der E-Mail',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 })
  }
}
