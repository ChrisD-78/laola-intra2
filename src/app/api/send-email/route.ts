import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    // Überprüfe Umgebungsvariablen
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    console.log('📧 E-Mail-Versand gestartet')
    console.log('📧 EMAIL_USER gesetzt:', !!emailUser)
    console.log('📧 EMAIL_PASS gesetzt:', !!emailPass)
    console.log('📧 EMAIL_USER Wert:', emailUser ? `${emailUser.substring(0, 3)}***@${emailUser.split('@')[1]}` : 'NICHT GESETZT')
    console.log('📧 An:', to)
    console.log('📧 Betreff:', subject)

    if (!emailUser || !emailPass) {
      console.error('❌ Umgebungsvariablen fehlen:', { emailUser: !!emailUser, emailPass: !!emailPass })
      return NextResponse.json({ 
        success: false, 
        error: 'E-Mail-Konfiguration fehlt',
        details: 'EMAIL_USER oder EMAIL_PASS nicht gesetzt'
      }, { status: 500 })
    }

    // SMTP-Konfiguration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    // Verbindung testen
    try {
      await transporter.verify()
      console.log('✅ SMTP-Verbindung erfolgreich')
    } catch (verifyError) {
      console.error('❌ SMTP-Verbindung fehlgeschlagen:', verifyError)
      return NextResponse.json({ 
        success: false, 
        error: 'SMTP-Verbindung fehlgeschlagen',
        details: verifyError instanceof Error ? verifyError.message : 'Unbekannter SMTP-Fehler'
      }, { status: 500 })
    }

    // E-Mail-Optionen
    const mailOptions = {
      from: emailUser,
      to: to,
      subject: subject,
      html: html,
      text: text
    }

    // E-Mail senden
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ E-Mail erfolgreich gesendet:', info.messageId)
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'E-Mail erfolgreich gesendet' 
    })

  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error)
    
    // Detaillierte Fehlerbehandlung
    let errorMessage = 'Unbekannter Fehler'
    let errorDetails = 'Keine Details verfügbar'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || error.message
    }
    
    // Spezifische Fehlermeldungen für häufige Probleme
    if (errorMessage.includes('Invalid login')) {
      errorMessage = 'Ungültige Anmeldedaten - App-Password prüfen'
    } else if (errorMessage.includes('Less secure app access')) {
      errorMessage = 'App-Password erforderlich - 2FA aktivieren'
    } else if (errorMessage.includes('ENOTFOUND')) {
      errorMessage = 'Netzwerkfehler - Internetverbindung prüfen'
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 })
  }
}
// Force redeploy for API routes
