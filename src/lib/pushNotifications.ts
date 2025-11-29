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
      console.log('❌ Service Worker wird nicht unterstützt')
      return false
    }

    if (!('PushManager' in window)) {
      console.log('❌ Push Manager wird nicht unterstützt')
      return false
    }

    try {
      // Prüfe ob bereits ein Service Worker registriert ist
      const existingRegistrations = await navigator.serviceWorker.getRegistrations()
      console.log('Gefundene Service Worker Registrierungen:', existingRegistrations.length)

      // Entferne alte/fehlerhafte Registrierungen
      for (const registration of existingRegistrations) {
        if (registration.scope !== window.location.origin + '/') {
          console.log('Entferne alte Service Worker Registrierung:', registration.scope)
          await registration.unregister()
        } else {
          // Verwende bestehende Registrierung
          this.registration = registration
          console.log('✅ Verwende bestehende Service Worker Registrierung')
        }
      }

      // Registriere neuen Service Worker falls noch nicht vorhanden
      if (!this.registration) {
        console.log('Registriere neuen Service Worker...')
        
        // Prüfe zuerst ob sw.js erreichbar ist
        try {
          const swCheck = await fetch('/sw.js', { method: 'HEAD' })
          if (!swCheck.ok) {
            console.error('❌ sw.js Datei nicht gefunden (Status:', swCheck.status, ')')
            return false
          }
          console.log('✅ sw.js Datei ist erreichbar')
        } catch (fetchError) {
          console.error('❌ Fehler beim Prüfen von sw.js:', fetchError)
          return false
        }
        
        try {
          // Versuche Service Worker zu registrieren
          this.registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          console.log('✅ Service Worker registriert:', this.registration.scope)
          console.log('Service Worker State:', this.registration.active?.state || this.registration.installing?.state || this.registration.waiting?.state)
        } catch (registerError) {
          console.error('❌ Fehler bei Service Worker Registrierung:', registerError)
          if (registerError instanceof Error) {
            console.error('Fehlerdetails:', registerError.message)
            console.error('Stack:', registerError.stack)
            
            // Zusätzliche Diagnose
            if (registerError.message.includes('MIME')) {
              console.error('❌ MIME-Type Problem: sw.js muss als application/javascript serviert werden')
            }
            if (registerError.message.includes('scope')) {
              console.error('❌ Scope Problem: Service Worker Scope muss innerhalb der Seite liegen')
            }
            if (registerError.message.includes('network')) {
              console.error('❌ Network Problem: sw.js konnte nicht geladen werden')
            }
          }
          return false
        }
      }

      // Warte bis Service Worker aktiv ist (mit besserer Fehlerbehandlung)
      try {
        if (this.registration.installing) {
          console.log('Service Worker wird installiert...')
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn('⚠️ Service Worker Installation Timeout - verwende aktiven Worker falls verfügbar')
              // Prüfe ob bereits ein aktiver Worker existiert
              if (this.registration?.active) {
                resolve()
              } else {
                reject(new Error('Service Worker Installation Timeout'))
              }
            }, 10000) // 10 Sekunden Timeout

            const worker = this.registration.installing
            if (!worker) {
              clearTimeout(timeout)
              resolve()
              return
            }

            worker.addEventListener('statechange', function() {
              console.log('Service Worker State:', this.state)
              if (this.state === 'activated' || this.state === 'activating') {
                clearTimeout(timeout)
                resolve()
              } else if (this.state === 'redundant') {
                clearTimeout(timeout)
                // Prüfe ob bereits ein aktiver Worker existiert
                if (this.registration?.active) {
                  resolve()
                } else {
                  reject(new Error('Service Worker wurde redundant'))
                }
              }
            })
            
            // Fallback: Prüfe nach 2 Sekunden ob Worker bereits aktiv ist
            setTimeout(() => {
              if (this.registration?.active) {
                clearTimeout(timeout)
                resolve()
              }
            }, 2000)
          })
          console.log('✅ Service Worker installiert und aktiviert')
        } else if (this.registration.waiting) {
          console.log('Service Worker wartet auf Aktivierung...')
          // Versuche zu aktivieren
          try {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          } catch (msgError) {
            console.warn('Konnte SKIP_WAITING nicht senden:', msgError)
          }
          
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn('⚠️ Service Worker Aktivierung Timeout')
              if (this.registration?.active) {
                resolve()
              } else {
                reject(new Error('Service Worker Aktivierung Timeout'))
              }
            }, 10000)

            const worker = this.registration.waiting
            if (!worker) {
              clearTimeout(timeout)
              resolve()
              return
            }

            worker.addEventListener('statechange', function() {
              console.log('Service Worker State:', this.state)
              if (this.state === 'activated' || this.state === 'activating') {
                clearTimeout(timeout)
                resolve()
              } else if (this.state === 'redundant') {
                clearTimeout(timeout)
                if (this.registration?.active) {
                  resolve()
                } else {
                  reject(new Error('Service Worker wurde redundant'))
                }
              }
            })
          })
          console.log('✅ Service Worker aktiviert')
        } else if (this.registration.active) {
          console.log('✅ Service Worker ist bereits aktiv')
        } else {
          console.warn('⚠️ Service Worker hat keinen aktiven, installierenden oder wartenden Zustand')
          // Versuche trotzdem fortzufahren
        }
      } catch (activationError) {
        console.error('Fehler beim Aktivieren des Service Workers:', activationError)
        // Prüfe ob trotzdem ein aktiver Worker existiert
        if (this.registration?.active) {
          console.log('✅ Verwende bestehenden aktiven Service Worker')
        } else {
          throw activationError
        }
      }

      // Prüfe ob bereits eine Subscription existiert
      try {
        this.subscription = await this.registration.pushManager.getSubscription()
        if (this.subscription) {
          console.log('✅ Bestehende Subscription gefunden')
        } else {
          console.log('Keine bestehende Subscription gefunden')
        }
      } catch (subscriptionError) {
        console.error('Fehler beim Abrufen der Subscription:', subscriptionError)
        // Nicht kritisch, weiter machen
      }
      
      return true
    } catch (error) {
      console.error('❌ Fehler bei Service Worker Initialisierung:', error)
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

