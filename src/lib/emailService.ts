interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

export const sendEmail = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 E-Mail wird gesendet...')
    console.log('An:', emailData.to)
    console.log('Betreff:', emailData.subject)
    
    // Echte API für E-Mail-Versand
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(emailData)
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ E-Mail erfolgreich gesendet!', result.messageId)
      return { success: true }
    } else {
      console.error('❌ E-Mail-Versand fehlgeschlagen:', result.error)
      return { 
        success: false, 
        error: result.error || 'Unbekannter Fehler beim E-Mail-Versand'
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error)
    return { 
      success: false, 
      error: 'Netzwerkfehler - Bitte versuchen Sie es erneut'
    }
  }
}

export const createFeedbackEmail = (feedbackData: {
  kategorie: string
  betroffenerBereich: string
  prioritaet: string
  titel: string
  beschreibung: string
  vorschlag: string
  meldendePerson: string
  kontakt: string
}) => {
  const currentDate = new Date().toLocaleString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const priorityColor = {
    'Niedrig': '#10B981',
    'Mittel': '#F59E0B', 
    'Hoch': '#EF4444',
    'Kritisch': '#DC2626'
  }[feedbackData.prioritaet] || '#6B7280'

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Neues Feedback - Laola Intranet</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
        .field-value { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #667eea; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Neues Feedback eingegangen</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Laola Intranet System</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>⚠️ Wichtige Information:</strong><br>
            Ein neues Feedback wurde über das Laola Intranet System eingereicht und erfordert Ihre Aufmerksamkeit.
          </div>

          <div class="field">
            <span class="field-label">📋 Kategorie</span>
            <div class="field-value">${feedbackData.kategorie}</div>
          </div>

          <div class="field">
            <span class="field-label">🏢 Betroffener Bereich</span>
            <div class="field-value">${feedbackData.betroffenerBereich || 'Nicht angegeben'}</div>
          </div>

          <div class="field">
            <span class="field-label">⚡ Priorität</span>
            <div class="field-value">
              <span class="priority-badge" style="background-color: ${priorityColor}">
                ${feedbackData.prioritaet || 'Nicht angegeben'}
              </span>
            </div>
          </div>

          <div class="field">
            <span class="field-label">👤 Meldende Person</span>
            <div class="field-value">${feedbackData.meldendePerson}</div>
          </div>

          <div class="field">
            <span class="field-label">📞 Kontakt</span>
            <div class="field-value">${feedbackData.kontakt || 'Nicht angegeben'}</div>
          </div>

          <div class="field">
            <span class="field-label">📌 Titel</span>
            <div class="field-value"><strong>${feedbackData.titel}</strong></div>
          </div>

          <div class="field">
            <span class="field-label">📝 Beschreibung</span>
            <div class="field-value">${feedbackData.beschreibung.replace(/\n/g, '<br>')}</div>
          </div>

          ${feedbackData.vorschlag ? `
          <div class="field">
            <span class="field-label">💡 Lösungsvorschlag / Verbesserungsvorschlag</span>
            <div class="field-value">${feedbackData.vorschlag.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          <div class="field">
            <span class="field-label">🕒 Eingegangen am</span>
            <div class="field-value">${currentDate}</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Laola Intranet System</strong></p>
          <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
            System generiert am ${new Date().toISOString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Neues Feedback - Laola Intranet System
=====================================

Wichtige Information: Ein neues Feedback wurde über das Laola Intranet System eingereicht.

KATEGORIE: ${feedbackData.kategorie}
BETROFFENER BEREICH: ${feedbackData.betroffenerBereich || 'Nicht angegeben'}
PRIORITÄT: ${feedbackData.prioritaet || 'Nicht angegeben'}
MELDENDE PERSON: ${feedbackData.meldendePerson}
KONTAKT: ${feedbackData.kontakt || 'Nicht angegeben'}

TITEL: ${feedbackData.titel}

BESCHREIBUNG:
${feedbackData.beschreibung}

${feedbackData.vorschlag ? `LÖSUNGSVORSCHLAG / VERBESSERUNGSVORSCHLAG:
${feedbackData.vorschlag}

` : ''}EINGEGANGEN AM: ${currentDate}

---
Laola Intranet System
Diese E-Mail wurde automatisch generiert.
  `

  return {
    to: 'christof.drost@gmail.com',
    subject: `[Laola Intranet] Neues Feedback: ${feedbackData.titel} - ${feedbackData.kategorie}`,
    html,
    text
  }
}
