// Skript zum Generieren von VAPID Keys für Web Push Notifications
// Führen Sie aus mit: node generate-vapid-keys.js

const webpush = require('web-push');

console.log('🔑 Generiere VAPID Keys für Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys erfolgreich generiert!\n');
console.log('📋 Fügen Sie diese in Ihre .env.local Datei ein:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:admin@laola.baederbook.de\n');
console.log('⚠️  WICHTIG: Die VAPID_PRIVATE_KEY sollte NIEMALS öffentlich gemacht werden!');
console.log('⚠️  Fügen Sie sie nur in Server-seitige Umgebungsvariablen ein (z.B. Netlify Environment Variables)\n');

