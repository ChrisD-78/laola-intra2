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

// E-Mail an mehrere Empfänger senden
export const sendEmailToMultiple = async (emailData: Omit<EmailData, 'to'> & { to: string[] }): Promise<{ success: boolean; error?: string; details?: any }> => {
  try {
    console.log('📧 E-Mails werden an mehrere Empfänger gesendet...')
    console.log('An:', emailData.to.join(', '))
    console.log('Betreff:', emailData.subject)
    
    const results = []
    const errors = []
    
    // E-Mails sequenziell senden für bessere Fehlerbehandlung
    for (const recipient of emailData.to) {
      console.log(`📧 Sende E-Mail an: ${recipient}`)
      
      try {
        const result = await sendEmail({
          ...emailData,
          to: recipient
        })
        
        results.push({ recipient, ...result })
        
        if (result.success) {
          console.log(`✅ E-Mail an ${recipient} erfolgreich gesendet`)
        } else {
          console.error(`❌ E-Mail an ${recipient} fehlgeschlagen:`, result.error)
          errors.push({ recipient, error: result.error })
        }
      } catch (error) {
        console.error(`❌ Fehler beim Senden an ${recipient}:`, error)
        errors.push({ recipient, error: error instanceof Error ? error.message : 'Unbekannter Fehler' })
        results.push({ recipient, success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' })
      }
    }
    
    const successfulCount = results.filter(result => result.success).length
    const failedCount = results.filter(result => !result.success).length
    
    console.log(`📊 E-Mail-Status: ${successfulCount} erfolgreich, ${failedCount} fehlgeschlagen`)
    
    if (successfulCount > 0) {
      console.log('✅ Mindestens eine E-Mail wurde erfolgreich gesendet')
      return { 
        success: true, 
        details: {
          successful: successfulCount,
          failed: failedCount,
          errors: errors
        }
      }
    } else {
      console.error('❌ Alle E-Mails fehlgeschlagen')
      return { 
        success: false, 
        error: 'Alle E-Mails konnten nicht gesendet werden',
        details: {
          successful: successfulCount,
          failed: failedCount,
          errors: errors
        }
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mails:', error)
    return { 
      success: false, 
      error: 'Netzwerkfehler - Bitte versuchen Sie es erneut',
      details: { error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
    }
  }
}

export const createFeedbackEmail = (feedbackData: {
  kategorie: string
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

  // Bestimme E-Mail-Empfänger basierend auf Kategorie
  const getEmailRecipient = (kategorie: string): string => {
    switch (kategorie) {
      case 'Stunden Korrektur':
        return 'christof.drost@landau.de, kirstin.kreusch@landau.de'
      default:
        return 'christof.drost@landau.de, kirstin.kreusch@landau.de'
    }
  }

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
    to: getEmailRecipient(feedbackData.kategorie),
    subject: `[Laola Intranet] Neues Feedback: ${feedbackData.titel} - ${feedbackData.kategorie}`,
    html,
    text
  }
}

// Generische E-Mail-Funktion für alle Formular-Einträge
export const createFormSubmissionEmail = (formData: {
  type: string
  title: string
  description?: string
  submittedBy: string
  formData: Record<string, unknown>
}) => {
  const currentDate = new Date().toLocaleString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // E-Mail-Empfänger basierend auf Formular-Typ
  const getEmailRecipients = (type: string): string[] => {
    switch (type.toLowerCase()) {
      case 'wassermessung':
      case 'rutschenkontrolle':
      case 'stoermeldung':
      case 'kassenabrechnung':
      case 'feedback':
        return ['christof.drost@landau.de', 'christof.drost@gmail.com', 'kirstin.kreusch@landau.de']
      case 'stundenkorrektur':
        return ['christof.drost@landau.de', 'kirstin.kreusch@landau.de']
      case 'arbeitsunfall':
      case 'unfall':
        return ['christof.drost@gmail.com', 'christof.drost@landau.de', 'kirstin.kreusch@landau.de']
      default:
        return ['christof.drost@landau.de', 'christof.drost@gmail.com', 'kirstin.kreusch@landau.de']
    }
  }

  // Formular-Typ Labels
  const getFormTypeLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'wassermessung': return '💧 Wassermessung'
      case 'rutschenkontrolle': return '🎢 Rutschenkontrolle'
      case 'stoermeldung': return '⚠️ Störmeldung'
      case 'kassenabrechnung': return '💰 Kassenabrechnung'
      case 'arbeitsunfall': return '🚨 Arbeitsunfall'
      case 'unfall': return '🚨 Unfall'
      case 'feedback': return '📝 Feedback'
      case 'stundenkorrektur': return '⏰ Stundenkorrektur'
      default: return `📋 ${type}`
    }
  }

  // Formular-spezifische Farbe
  const getFormTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'wassermessung': return '#3B82F6'
      case 'rutschenkontrolle': return '#10B981'
      case 'stoermeldung': return '#F59E0B'
      case 'kassenabrechnung': return '#8B5CF6'
      case 'arbeitsunfall': return '#DC2626'
      case 'unfall': return '#DC2626'
      case 'feedback': return '#6366F1'
      case 'stundenkorrektur': return '#7C3AED'
      default: return '#6B7280'
    }
  }

  const recipients = getEmailRecipients(formData.type)
  const formTypeLabel = getFormTypeLabel(formData.type)
  const formTypeColor = getFormTypeColor(formData.type)

  // Formular-Daten in lesbare Form bringen
  const formatFormData = (data: Record<string, unknown>): string => {
    return Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        return `<div class="field">
          <span class="field-label">${label}</span>
          <div class="field-value">${String(value).replace(/\n/g, '<br>')}</div>
        </div>`
      }).join('')
  }

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Neuer Formular-Eintrag - Laola Intranet</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, ${formTypeColor} 0%, ${formTypeColor}dd 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
        .field-value { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid ${formTypeColor}; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .type-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: white; font-size: 13px; font-weight: bold; background-color: ${formTypeColor}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${formTypeLabel} eingegangen</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Laola Intranet System</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>📋 Neue Formular-Eintragung:</strong><br>
            Ein neuer Eintrag wurde über das Laola Intranet System eingereicht.
          </div>

          <div class="field">
            <span class="field-label">📋 Formular-Typ</span>
            <div class="field-value">
              <span class="type-badge">${formTypeLabel}</span>
            </div>
          </div>

          <div class="field">
            <span class="field-label">👤 Eingereicht von</span>
            <div class="field-value">${formData.submittedBy}</div>
          </div>

          <div class="field">
            <span class="field-label">📌 Titel</span>
            <div class="field-value"><strong>${formData.title}</strong></div>
          </div>

          ${formData.description ? `
          <div class="field">
            <span class="field-label">📝 Beschreibung</span>
            <div class="field-value">${formData.description.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          <div class="field">
            <span class="field-label">📊 Formular-Daten</span>
            <div class="field-value">
              ${formatFormData(formData.formData)}
            </div>
          </div>

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
Neuer Formular-Eintrag - Laola Intranet System
=============================================

Formular-Typ: ${formTypeLabel}
Eingereicht von: ${formData.submittedBy}
Titel: ${formData.title}

${formData.description ? `Beschreibung:
${formData.description}

` : ''}Formular-Daten:
${Object.entries(formData.formData)
  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Eingegangen am: ${currentDate}

---
Laola Intranet System
Diese E-Mail wurde automatisch generiert.
  `

  return {
    to: recipients,
    subject: `[Laola Intranet] ${formTypeLabel}: ${formData.title}`,
    html,
    text
  }
}

export const createAccidentEmail = (accidentData: {
  unfalltyp: string
  datum: string
  zeit: string
  verletztePerson: string
  unfallort: string
  unfallart: string
  verletzungsart: string
  schweregrad: string
  ersteHilfe: string
  arztKontakt: string
  zeugen: string
  beschreibung: string
  meldendePerson: string
  unfallhergang?: string
  gastAlter?: string
  gastKontakt?: string
}) => {
  const currentDate = new Date().toLocaleString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const severityColor = {
    'Leicht': '#10B981',
    'Mittel': '#F59E0B',
    'Schwer': '#EF4444',
    'Lebensbedrohlich': '#DC2626'
  }[accidentData.schweregrad] || '#6B7280'

  const unfallTypLabel = accidentData.unfalltyp === 'mitarbeiter' ? '👷 Mitarbeiter-Unfall' : '👤 Gast-Unfall'
  const unfallTypColor = accidentData.unfalltyp === 'mitarbeiter' ? '#DC2626' : '#F59E0B'

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🚨 Arbeitsunfall-Meldung - Laola Intranet</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
        .alert-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 30px; border-radius: 6px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #3B82F6; }
        .severity-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: white; font-size: 13px; font-weight: bold; }
        .type-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: white; font-size: 13px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .section { margin: 25px 0; padding: 20px; background: #F9FAFB; border-radius: 6px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1F2937; margin-bottom: 15px; border-bottom: 2px solid #DC2626; padding-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 ARBEITSUNFALL-MELDUNG</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">LA OLA Freizeitbad - Sofortmeldung</p>
        </div>
        
        <div class="alert-box">
          <strong style="color: #DC2626; font-size: 16px;">⚠️ WICHTIG - SOFORTIGE AUFMERKSAMKEIT ERFORDERLICH!</strong><br>
          <p style="margin: 10px 0 0 0;">
            Eine Arbeitsunfall-Meldung wurde über das LA OLA Intranet System eingereicht.<br>
            Bitte überprüfen Sie die Details und leiten Sie erforderliche Maßnahmen ein.
          </p>
        </div>

        <div class="content">
          <!-- Unfall-Typ und Schweregrad -->
          <div class="section">
            <div class="field">
              <span class="field-label">🏷️ Unfalltyp</span>
              <div class="field-value">
                <span class="type-badge" style="background-color: ${unfallTypColor}">
                  ${unfallTypLabel}
                </span>
              </div>
            </div>

            <div class="field">
              <span class="field-label">⚠️ Schweregrad</span>
              <div class="field-value">
                <span class="severity-badge" style="background-color: ${severityColor}">
                  ${accidentData.schweregrad}
                </span>
              </div>
            </div>
          </div>

          <!-- Zeitpunkt -->
          <div class="section">
            <div class="section-title">📅 Zeitpunkt des Unfalls</div>
            <div class="field">
              <span class="field-label">Datum</span>
              <div class="field-value">${new Date(accidentData.datum).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="field">
              <span class="field-label">Uhrzeit</span>
              <div class="field-value">${accidentData.zeit} Uhr</div>
            </div>
          </div>

          <!-- Betroffene Person -->
          <div class="section">
            <div class="section-title">👤 Betroffene Person</div>
            <div class="field">
              <span class="field-label">Name / Gast-Identifikation</span>
              <div class="field-value"><strong>${accidentData.verletztePerson}</strong></div>
            </div>
            ${accidentData.gastAlter ? `
            <div class="field">
              <span class="field-label">Alter (Gast)</span>
              <div class="field-value">${accidentData.gastAlter}</div>
            </div>
            ` : ''}
            ${accidentData.gastKontakt ? `
            <div class="field">
              <span class="field-label">Kontakt (Gast)</span>
              <div class="field-value">${accidentData.gastKontakt}</div>
            </div>
            ` : ''}
          </div>

          <!-- Unfalldetails -->
          <div class="section">
            <div class="section-title">📍 Unfalldetails</div>
            <div class="field">
              <span class="field-label">Unfallort</span>
              <div class="field-value">${accidentData.unfallort}</div>
            </div>
            <div class="field">
              <span class="field-label">Unfallart</span>
              <div class="field-value">${accidentData.unfallart}</div>
            </div>
            <div class="field">
              <span class="field-label">Verletzungsart</span>
              <div class="field-value">${accidentData.verletzungsart}</div>
            </div>
          </div>

          <!-- Beschreibung -->
          <div class="section">
            <div class="section-title">📝 Unfallbeschreibung</div>
            <div class="field-value" style="white-space: pre-wrap;">${accidentData.beschreibung}</div>
          </div>

          ${accidentData.unfallhergang ? `
          <div class="section">
            <div class="section-title">🔄 Unfallhergang (Mitarbeiter)</div>
            <div class="field-value" style="white-space: pre-wrap;">${accidentData.unfallhergang}</div>
          </div>
          ` : ''}

          <!-- Maßnahmen -->
          <div class="section">
            <div class="section-title">🏥 Ergriffene Maßnahmen</div>
            <div class="field">
              <span class="field-label">Erste Hilfe</span>
              <div class="field-value">${accidentData.ersteHilfe}</div>
            </div>
            <div class="field">
              <span class="field-label">Ärztlicher Kontakt / Krankenhaus</span>
              <div class="field-value">${accidentData.arztKontakt}</div>
            </div>
            ${accidentData.zeugen ? `
            <div class="field">
              <span class="field-label">Zeugen</span>
              <div class="field-value">${accidentData.zeugen}</div>
            </div>
            ` : ''}
          </div>

          <!-- Meldende Person -->
          <div class="section">
            <div class="section-title">👨‍💼 Meldende Person</div>
            <div class="field">
              <span class="field-label">Name</span>
              <div class="field-value"><strong>${accidentData.meldendePerson}</strong></div>
            </div>
            <div class="field">
              <span class="field-label">Meldung eingegangen am</span>
              <div class="field-value">${currentDate}</div>
            </div>
          </div>

          <div style="background: #FEF2F2; padding: 15px; border-radius: 6px; border-left: 4px solid #DC2626; margin-top: 25px;">
            <strong style="color: #DC2626;">⏰ Nächste Schritte:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #991B1B;">
              <li>Berufsgenossenschaft informieren (bei Mitarbeiter-Unfällen)</li>
              <li>Unfallbericht dokumentieren</li>
              <li>Ggf. Sicherheitsmaßnahmen überprüfen und anpassen</li>
              <li>Follow-up mit betroffenem Mitarbeiter/Gast</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>LA OLA Intranet System</strong></p>
          <p>Diese E-Mail wurde automatisch generiert. Bei Rückfragen kontaktieren Sie bitte ${accidentData.meldendePerson}.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
            System generiert am ${new Date().toISOString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
🚨 ARBEITSUNFALL-MELDUNG - LA OLA Freizeitbad
=============================================

⚠️ WICHTIG - SOFORTIGE AUFMERKSAMKEIT ERFORDERLICH!

Eine Arbeitsunfall-Meldung wurde über das LA OLA Intranet System eingereicht.

UNFALLTYP: ${accidentData.unfalltyp === 'mitarbeiter' ? 'Mitarbeiter-Unfall' : 'Gast-Unfall'}
SCHWEREGRAD: ${accidentData.schweregrad}

ZEITPUNKT DES UNFALLS:
Datum: ${new Date(accidentData.datum).toLocaleDateString('de-DE')}
Uhrzeit: ${accidentData.zeit} Uhr

BETROFFENE PERSON:
Name: ${accidentData.verletztePerson}
${accidentData.gastAlter ? `Alter: ${accidentData.gastAlter}` : ''}
${accidentData.gastKontakt ? `Kontakt: ${accidentData.gastKontakt}` : ''}

UNFALLDETAILS:
Unfallort: ${accidentData.unfallort}
Unfallart: ${accidentData.unfallart}
Verletzungsart: ${accidentData.verletzungsart}

UNFALLBESCHREIBUNG:
${accidentData.beschreibung}

${accidentData.unfallhergang ? `UNFALLHERGANG (Mitarbeiter):
${accidentData.unfallhergang}
` : ''}

ERGRIFFENE MASSNAHMEN:
Erste Hilfe: ${accidentData.ersteHilfe}
Ärztlicher Kontakt: ${accidentData.arztKontakt}
${accidentData.zeugen ? `Zeugen: ${accidentData.zeugen}` : ''}

MELDENDE PERSON: ${accidentData.meldendePerson}
MELDUNG EINGEGANGEN AM: ${currentDate}

---
LA OLA Intranet System
Diese E-Mail wurde automatisch generiert.
  `

  return {
    to: 'christof.drost@landau.de, kirstin.kreusch@landau.de',
    subject: `🚨 [Unfallmeldung] ${accidentData.unfalltyp === 'mitarbeiter' ? 'Mitarbeiter' : 'Gast'}: ${accidentData.verletztePerson} - ${accidentData.schweregrad}`,
    html,
    text
  }
}

export const createHoursCorrectionEmail = (correctionData: {
  name: string
  datum: string
  uhrzeitVon: string
  uhrzeitBis: string
  grund: string
}) => {
  const currentDate = new Date().toLocaleString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>⏰ Stundenkorrektur - Laola Intranet</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
        .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 30px; border-radius: 6px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #7C3AED; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .section { margin: 25px 0; padding: 20px; background: #F9FAFB; border-radius: 6px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1F2937; margin-bottom: 15px; border-bottom: 2px solid #7C3AED; padding-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ STUNDENKORREKTUR</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">LA OLA Freizeitbad - Stundenanpassung</p>
        </div>
        
        <div class="alert-box">
          <strong style="color: #92400E; font-size: 16px;">📋 Neue Stundenkorrektur eingegangen</strong><br>
          <p style="margin: 10px 0 0 0;">
            Eine Stundenkorrektur wurde über das LA OLA Intranet System eingereicht.<br>
            Bitte überprüfen Sie die Angaben und nehmen Sie die Korrektur vor.
          </p>
        </div>

        <div class="content">
          <!-- Mitarbeiter -->
          <div class="section">
            <div class="section-title">👤 Mitarbeiter</div>
            <div class="field">
              <span class="field-label">Name</span>
              <div class="field-value"><strong>${correctionData.name}</strong></div>
            </div>
          </div>

          <!-- Zeitpunkt -->
          <div class="section">
            <div class="section-title">📅 Datum und Zeitraum</div>
            <div class="field">
              <span class="field-label">Datum</span>
              <div class="field-value">${new Date(correctionData.datum).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="field">
              <span class="field-label">Uhrzeit von</span>
              <div class="field-value">${correctionData.uhrzeitVon} Uhr</div>
            </div>
            <div class="field">
              <span class="field-label">Uhrzeit bis</span>
              <div class="field-value">${correctionData.uhrzeitBis} Uhr</div>
            </div>
          </div>

          <!-- Grund -->
          <div class="section">
            <div class="section-title">📝 Grund der Korrektur</div>
            <div class="field-value" style="white-space: pre-wrap;">${correctionData.grund}</div>
          </div>

          <!-- Eingangsdatum -->
          <div class="section">
            <div class="section-title">🕒 Antrag</div>
            <div class="field">
              <span class="field-label">Eingereicht von</span>
              <div class="field-value"><strong>${correctionData.name}</strong></div>
            </div>
            <div class="field">
              <span class="field-label">Eingegangen am</span>
              <div class="field-value">${currentDate}</div>
            </div>
          </div>

          <div style="background: #EDE9FE; padding: 15px; border-radius: 6px; border-left: 4px solid #7C3AED; margin-top: 25px;">
            <strong style="color: #5B21B6;">⏰ Nächste Schritte:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #6B21A8;">
              <li>Stundenkorrektur im Zeiterfassungssystem durchführen</li>
              <li>Mitarbeiter über Bestätigung informieren</li>
              <li>Ggf. Dokumentation anpassen</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>LA OLA Intranet System</strong></p>
          <p>Diese E-Mail wurde automatisch generiert. Bei Rückfragen kontaktieren Sie bitte ${correctionData.name}.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
            System generiert am ${new Date().toISOString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
⏰ STUNDENKORREKTUR - LA OLA Freizeitbad
========================================

📋 Neue Stundenkorrektur eingegangen

Eine Stundenkorrektur wurde über das LA OLA Intranet System eingereicht.

MITARBEITER:
Name: ${correctionData.name}

DATUM UND ZEITRAUM:
Datum: ${new Date(correctionData.datum).toLocaleDateString('de-DE')}
Uhrzeit von: ${correctionData.uhrzeitVon} Uhr
Uhrzeit bis: ${correctionData.uhrzeitBis} Uhr

GRUND DER KORREKTUR:
${correctionData.grund}

EINGEREICHT VON: ${correctionData.name}
EINGEGANGEN AM: ${currentDate}

---
LA OLA Intranet System
Diese E-Mail wurde automatisch generiert.
  `

  return {
    to: 'christof.drost@landau.de, kirstin.kreusch@landau.de',
    subject: `⏰ [STUNDENKORREKTUR] ${correctionData.name} - ${new Date(correctionData.datum).toLocaleDateString('de-DE')}`,
    html,
    text
  }
}
