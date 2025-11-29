'use client'

// Push Notification Service
export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker wird nicht unterstützt')
      return false
    }

    if (!('PushManager' in window)) {
      console.log('Push Manager wird nicht unterstützt')
      return false
    }

    try {
      // Service Worker registrieren
      console.log('Registriere Service Worker...')
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('✅ Service Worker registriert:', this.registration.scope)

      // Warte bis Service Worker aktiv ist
      if (this.registration.installing) {
        await new Promise<void>((resolve) => {
          this.registration!.installing!.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              resolve()
            }
          })
        })
      } else if (this.registration.waiting) {
        await new Promise<void>((resolve) => {
          this.registration!.waiting!.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              resolve()
            }
          })
        })
      }

      // Prüfe ob bereits eine Subscription existiert
      this.subscription = await this.registration.pushManager.getSubscription()
      if (this.subscription) {
        console.log('✅ Bestehende Subscription gefunden')
      } else {
        console.log('Keine bestehende Subscription gefunden')
      }
      
      return true
    } catch (error) {
      console.error('Fehler bei Service Worker Registrierung:', error)
      if (error instanceof Error) {
        console.error('Fehlerdetails:', error.message, error.stack)
      }
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    return await Notification.requestPermission()
  }

  async subscribe(userId?: string): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.initialize()
      if (!initialized) {
        console.error('Service Worker konnte nicht initialisiert werden')
        return false
      }
    }

    if (!this.registration) {
      console.error('Service Worker Registration nicht verfügbar')
      return false
    }

    try {
      // Prüfe ob bereits subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('Bereits subscribed, aktualisiere...')
        this.subscription = existingSubscription
        // Aktualisiere auf Server
        const subscribeResponse = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: {
              endpoint: this.subscription.endpoint,
              keys: {
                p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
                auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
              }
            },
            userId: userId,
            userAgent: navigator.userAgent
          })
        })
        return subscribeResponse.ok
      }

      // Prüfe Berechtigung
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        console.log('Push-Benachrichtigungen nicht erlaubt. Permission:', permission)
        return false
      }

      // Hole VAPID Public Key
      const response = await fetch('/api/push/vapid-public-key')
      if (!response.ok) {
        console.error('Fehler beim Abrufen des VAPID Public Keys:', response.status)
        return false
      }
      
      const data = await response.json()
      const publicKey = data.publicKey

      if (!publicKey) {
        console.error('VAPID Public Key nicht verfügbar')
        return false
      }

      console.log('Erstelle Push Subscription...')
      // Erstelle Subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      })

      console.log('Subscription erstellt, sende an Server...')
      // Sende Subscription an Server
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: this.subscription.endpoint,
            keys: {
              p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
              auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
            }
          },
          userId: userId,
          userAgent: navigator.userAgent
        })
      })

      if (subscribeResponse.ok) {
        console.log('✅ Push Subscription erfolgreich gespeichert')
        return true
      } else {
        const errorData = await subscribeResponse.json().catch(() => ({}))
        console.error('Fehler beim Speichern der Subscription:', subscribeResponse.status, errorData)
        return false
      }
    } catch (error) {
      console.error('Fehler bei Push Subscription:', error)
      return false
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      // Prüfe ob Subscription existiert
      if (!this.registration) {
        const initialized = await this.initialize()
        if (!initialized) {
          return true // Kein Service Worker = bereits deaktiviert
        }
      }

      if (!this.registration) {
        return true
      }

      // Hole aktuelle Subscription
      const currentSubscription = await this.registration.pushManager.getSubscription()
      
      if (!currentSubscription) {
        this.subscription = null
        return true // Bereits deaktiviert
      }

      console.log('Entferne Push Subscription...')
      await currentSubscription.unsubscribe()

      // Entferne von Server
      const unsubscribeResponse = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: currentSubscription.endpoint
        })
      })

      if (unsubscribeResponse.ok) {
        console.log('✅ Push Subscription erfolgreich entfernt')
      } else {
        console.warn('Fehler beim Entfernen von Server:', unsubscribeResponse.status)
      }

      this.subscription = null
      return true
    } catch (error) {
      console.error('Fehler beim Unsubscribe:', error)
      return false
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    this.subscription = await this.registration.pushManager.getSubscription()
    return this.subscription !== null
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

