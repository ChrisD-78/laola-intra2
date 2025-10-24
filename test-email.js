// Test-Script für E-Mail-Funktionalität
// Führen Sie aus mit: node test-email.js

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Teste E-Mail-Konfiguration...');
  
  // Umgebungsvariablen prüfen
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 EMAIL_USER:', emailUser ? '✅ Gesetzt' : '❌ Nicht gesetzt');
  console.log('📧 EMAIL_PASS:', emailPass ? '✅ Gesetzt' : '❌ Nicht gesetzt');
  
  if (!emailUser || !emailPass) {
    console.error('❌ Umgebungsvariablen fehlen!');
    console.log('💡 Setzen Sie EMAIL_USER und EMAIL_PASS in Ihrer .env.local Datei');
    return;
  }
  
  // SMTP-Konfiguration
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
  
  try {
    // Verbindung testen
    console.log('🔗 Teste SMTP-Verbindung...');
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich!');
    
    // Test-E-Mail senden
    console.log('📧 Sende Test-E-Mail...');
    const info = await transporter.sendMail({
      from: emailUser,
      to: 'christof.drost@landau.de',
      subject: '🧪 Test-E-Mail von Laola Intranet',
      html: `
        <h2>Test-E-Mail</h2>
        <p>Diese E-Mail wurde automatisch vom Laola Intranet System gesendet.</p>
        <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-DE')}</p>
        <p><strong>Status:</strong> ✅ E-Mail-Konfiguration funktioniert!</p>
      `,
      text: `
Test-E-Mail von Laola Intranet
==============================

Diese E-Mail wurde automatisch vom Laola Intranet System gesendet.

Zeitstempel: ${new Date().toLocaleString('de-DE')}
Status: ✅ E-Mail-Konfiguration funktioniert!
      `
    });
    
    console.log('✅ Test-E-Mail erfolgreich gesendet!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 An: christof.drost@landau.de');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Test-E-Mail:', error.message);
    
    // Spezifische Fehlermeldungen
    if (error.message.includes('Invalid login')) {
      console.error('💡 Lösung: App-Password prüfen - verwenden Sie das 16-stellige App-Password, nicht Ihr normales Gmail-Passwort');
    } else if (error.message.includes('Less secure app access')) {
      console.error('💡 Lösung: 2-Faktor-Authentifizierung aktivieren und App-Password erstellen');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Lösung: Internetverbindung prüfen');
    }
  }
}

// Führe Test aus
testEmail().catch(console.error);
