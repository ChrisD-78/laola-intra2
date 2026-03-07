'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  ChatPinnwandEntryRecord,
  ChatPinnwandEventRecord,
  createChatPinnwandEntry,
  createChatPinnwandEvent,
  createChatPinnwandRegistration,
  getChatPinnwandEntries,
  getChatPinnwandEvents,
  getChatPinnwandRegistrations,
} from '@/lib/db'

type PinnwandCategory = 'event' | 'team' | 'projekt' | 'feier' | 'sonstiges'
type PinnwandFilter = 'all' | PinnwandCategory

interface PinnwandEntry {
  id: string
  title: string
  date?: string
  category: PinnwandCategory
  imageUrl?: string | null
  imageName?: string | null
  createdBy?: string
}

interface PinnwandEvent {
  id: string
  title: string
  event_date: string
  createdBy?: string
}

interface EventRegistration {
  id: string
  event_id: string
  participant_name: string
  kleidergroesse?: string
  created_by: string
}

const CATEGORY_LABEL: Record<PinnwandCategory, string> = {
  event: 'Event',
  team: 'Teamtreffen',
  projekt: 'Projekt',
  feier: 'Feier',
  sonstiges: 'Sonstiges',
}

const CATEGORY_EMOJI: Record<PinnwandCategory, string> = {
  event: '🎪',
  team: '👥',
  projekt: '🚀',
  feier: '🎉',
  sonstiges: '✨',
}

export default function PinnwandPage() {
  const { currentUser, isAdmin } = useAuth()

  const [entries, setEntries] = useState<PinnwandEntry[]>([])
  const [events, setEvents] = useState<PinnwandEvent[]>([])
  const [registrationsByEventId, setRegistrationsByEventId] = useState<Record<string, EventRegistration[]>>({})
  const [filter, setFilter] = useState<PinnwandFilter>('all')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCategory, setNewCategory] = useState<PinnwandCategory>('event')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [previewEntry, setPreviewEntry] = useState<PinnwandEntry | null>(null)

  // Event anlegen (nur Admin)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  // Anmeldung für Event (jeder Mitarbeiter)
  const [registerEvent, setRegisterEvent] = useState<PinnwandEvent | null>(null)
  const [regName, setRegName] = useState('')
  const [regKleidergroesse, setRegKleidergroesse] = useState('')
  const [isSavingReg, setIsSavingReg] = useState(false)

  const visibleEntries =
    filter === 'all' ? entries : entries.filter((e) => e.category === filter)

  useEffect(() => {
    const load = async () => {
      try {
        const [rows, eventRows] = await Promise.all([
          getChatPinnwandEntries(),
          getChatPinnwandEvents(),
        ])

        if (rows && rows.length > 0) {
          const mapped: PinnwandEntry[] = rows.map((row: ChatPinnwandEntryRecord) => ({
            id: row.id as string,
            title: row.title,
            date: row.date || undefined,
            category: (row.category as PinnwandCategory) || 'event',
            imageUrl: row.image_url || undefined,
            imageName: row.image_name || undefined,
            createdBy: row.created_by,
          }))
          setEntries(mapped)
        }

        if (eventRows && eventRows.length > 0) {
          const evList: PinnwandEvent[] = eventRows.map((e: ChatPinnwandEventRecord) => ({
            id: e.id as string,
            title: e.title,
            event_date: e.event_date,
            createdBy: e.created_by,
          }))
          setEvents(evList)

          const regs: Record<string, EventRegistration[]> = {}
          await Promise.all(
            evList.map(async (ev) => {
              const list = await getChatPinnwandRegistrations(ev.id)
              regs[ev.id] = list.map((r: { id?: string; event_id: string; participant_name: string; kleidergroesse?: string; created_by: string }) => ({
                id: r.id as string,
                event_id: r.event_id,
                participant_name: r.participant_name,
                kleidergroesse: r.kleidergroesse,
                created_by: r.created_by,
              }))
            })
          )
          setRegistrationsByEventId(regs)
        }
      } catch (e) {
        console.warn('Pinnwand: Einträge/Events konnten nicht geladen werden', e)
      }
    }
    load()
  }, [])

  const handleImageSelected = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setSelectedImageFile(file)
    setImageFileName(file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setImagePreview(ev.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    const title = newTitle.trim() || 'Teamfoto'
    const date = newDate || undefined
    const createdBy = currentUser || 'Unbekannt'

    setIsSaving(true)

    try {
      let imageUrl: string | undefined
      let imageName: string | undefined

      if (selectedImageFile) {
        const formData = new FormData()
        formData.append('file', selectedImageFile)

        const uploadResponse = await fetch('/api/upload/chat-image', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Bild-Upload fehlgeschlagen')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.publicUrl
        imageName = uploadData.name
      }

      const created: ChatPinnwandEntryRecord = await createChatPinnwandEntry({
        title,
        date,
        category: newCategory,
        image_url: imageUrl,
        image_name: imageName,
        created_by: createdBy,
      })

      const newEntry: PinnwandEntry = {
        id: created.id as string,
        title: created.title,
        date: created.date || undefined,
        category: (created.category as PinnwandCategory) || newCategory,
        imageUrl: created.image_url || imageUrl,
        imageName: created.image_name || imageName,
        createdBy: created.created_by || createdBy,
      }

      setEntries((prev) => [newEntry, ...prev])
      resetAddModal()
    } catch (error) {
      console.error('Pinnwand: Eintrag konnte nicht gespeichert werden', error)
      alert('Der Pinnwand-Eintrag konnte nicht gespeichert werden. Bitte später erneut versuchen.')
      setIsSaving(false)
    }
  }

  const resetAddModal = () => {
    setIsAddOpen(false)
    setSelectedImageFile(null)
    setImagePreview(null)
    setImageFileName(null)
    setNewTitle('')
    setNewDate('')
    setNewCategory('event')
    setIsSaving(false)
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSavingEvent || !eventTitle.trim() || !eventDate) return
    setIsSavingEvent(true)
    try {
      const created = await createChatPinnwandEvent({
        title: eventTitle.trim(),
        event_date: eventDate,
        created_by: currentUser || 'Admin',
      })
      setEvents((prev) => [
        ...prev,
        { id: created.id as string, title: created.title, event_date: created.event_date, createdBy: created.created_by },
      ])
      setRegistrationsByEventId((prev) => ({ ...prev, [created.id as string]: [] }))
      setIsCreateEventOpen(false)
      setEventTitle('')
      setEventDate('')
    } catch (err) {
      console.error('Event konnte nicht erstellt werden', err)
      alert('Event konnte nicht erstellt werden. Bitte später erneut versuchen.')
    } finally {
      setIsSavingEvent(false)
    }
  }

  const openRegisterModal = (event: PinnwandEvent) => {
    setRegisterEvent(event)
    setRegName(currentUser || '')
    setRegKleidergroesse('')
  }

  const resetRegisterModal = () => {
    setRegisterEvent(null)
    setRegName('')
    setRegKleidergroesse('')
    setIsSavingReg(false)
  }

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerEvent || isSavingReg || !regName.trim()) return
    setIsSavingReg(true)
    try {
      await createChatPinnwandRegistration({
        event_id: registerEvent.id,
        participant_name: regName.trim(),
        kleidergroesse: regKleidergroesse.trim() || undefined,
        created_by: currentUser || 'Unbekannt',
      })
      setRegistrationsByEventId((prev) => ({
        ...prev,
        [registerEvent.id]: [
          ...(prev[registerEvent.id] || []),
          {
            id: '',
            event_id: registerEvent.id,
            participant_name: regName.trim(),
            kleidergroesse: regKleidergroesse.trim() || undefined,
            created_by: currentUser || 'Unbekannt',
          },
        ],
      }))
      resetRegisterModal()
    } catch (err) {
      console.error('Anmeldung fehlgeschlagen', err)
      alert('Anmeldung konnte nicht gespeichert werden. Bitte später erneut versuchen.')
    } finally {
      setIsSavingReg(false)
    }
  }

  const formatDate = (value?: string) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return value
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl px-4 py-4 sm:px-8 sm:py-6 text-white mb-2 sm:mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-1">
                Chat &amp; Team
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                Pinnwand
              </h1>
              <p className="text-sm sm:text-base text-white/90 max-w-xl">
                Ein Ort für gemeinsame Momente im Team. Teilen Sie Fotos von
                Events, Projekten und besonderen Augenblicken.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Einträge
                </p>
                <p className="text-2xl sm:text-3xl font-semibold">
                  {entries.length}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Link
                  href="/chat"
                  className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  ← Zurück zum Chat
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-200 transition-colors"
                >
                  <span>📌</span>
                  <span>Foto pinnen</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsCreateEventOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-green-950 shadow-sm hover:bg-green-300 transition-colors"
                  >
                    <span>📅</span>
                    <span>Event anlegen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter-Leiste */}
        <div className="bg-white rounded-lg shadow-sm px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 whitespace-nowrap">
            Filter
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Alle
            </button>
            {(['event', 'team', 'projekt', 'feier', 'sonstiges'] as PinnwandCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs sm:text-sm font-medium transition-colors ${
                    filter === cat
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{CATEGORY_EMOJI[cat]}</span>
                  {CATEGORY_LABEL[cat]}
                </button>
              )
            )}
          </div>
        </div>

        {/* Pinnwand */}
        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl shadow-sm px-3 py-4 sm:px-5 sm:py-6">
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Begrüßungs-Notiz */}
            <div className="h-full rounded-xl bg-yellow-50 shadow-sm border border-yellow-100 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-700 mb-2">
                  Willkommen
                </p>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  👋 Hallo Team!
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Diese Pinnwand ist für alle schönen Momente im LA OLA und
                  Freibad Landau. Pinnen Sie Fotos von Veranstaltungen,
                  Teamevents oder besonderen Augenblicken.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-yellow-500 px-3 py-1.5 text-xs sm:text-sm font-semibold text-yellow-950 shadow-sm hover:bg-yellow-400 transition-colors"
              >
                📸 Jetzt ein Foto pinnen
              </button>
            </div>

            {/* Event-Karten (Anmeldungen) */}
            {events.map((ev) => {
              const regs = registrationsByEventId[ev.id] || []
              return (
                <div
                  key={ev.id}
                  className="h-full rounded-xl bg-white shadow-sm border border-green-100 p-4 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{ev.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
                      📅 Event
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{formatDate(ev.event_date)}</p>
                  <p className="text-xs text-gray-600 mb-3">
                    {regs.length} Anmeldung{regs.length !== 1 ? 'en' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => openRegisterModal(ev)}
                    className="mt-auto inline-flex items-center justify-center rounded-lg bg-green-500 px-3 py-1.5 text-xs sm:text-sm font-semibold text-green-950 shadow-sm hover:bg-green-400 transition-colors"
                  >
                    Jetzt anmelden
                  </button>
                </div>
              )
            })}

            {/* Einträge */}
            {visibleEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => entry.imageUrl && setPreviewEntry(entry)}
                className="group h-full overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 text-left flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="relative">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="h-40 w-full object-cover sm:h-44"
                    />
                  ) : (
                    <div className="h-40 sm:h-44 w-full flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-400">
                      <span className="text-2xl">🖼️</span>
                      <span className="text-xs">Foto folgt</span>
                    </div>
                  )}
                  {entry.imageUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="hidden group-hover:inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow">
                        Vergrößern
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {entry.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {CATEGORY_EMOJI[entry.category]} {CATEGORY_LABEL[entry.category]}
                    </span>
                  </div>
                  {entry.date && (
                    <p className="mt-1 text-xs text-gray-500">{formatDate(entry.date)}</p>
                  )}
                </div>
              </button>
            ))}

            {/* Hinzufügen-Kachel */}
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="h-full rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 flex flex-col items-center justify-center gap-2 text-amber-800 text-xs sm:text-sm font-medium transition-all"
            >
              <span className="text-2xl">➕</span>
              <span>Neuen Moment anpinnen</span>
            </button>
          </div>
        </div>

        {/* Add-Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 sm:py-10">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Foto pinnen
                </h2>
                <button
                  type="button"
                  onClick={resetAddModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddEntry} className="px-4 py-4 sm:px-6 sm:py-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Titel / Veranstaltung
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="z.B. Sommerfest 2025"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                      Kategorie
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PinnwandCategory)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="event">🎪 Event</option>
                      <option value="team">👥 Teamtreffen</option>
                      <option value="projekt">🚀 Projekt</option>
                      <option value="feier">🎉 Feier</option>
                      <option value="sonstiges">✨ Sonstiges</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Foto (optional)
                  </label>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center text-xs sm:text-sm transition-colors ${
                      imagePreview
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageSelected(file)
                      }}
                    />
                    <span className="mb-1 text-xl">
                      {imagePreview ? '✅' : '📷'}
                    </span>
                    <span className="font-medium">
                      {imagePreview
                        ? imageFileName || 'Bild ausgewählt'
                        : 'Bild auswählen oder hier ablegen'}
                    </span>
                    <span className="mt-1 text-[11px] text-gray-400">
                      JPG, PNG oder WEBP
                    </span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetAddModal}
                    className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <span>📌</span>
                    <span>
                      {isSaving ? 'Wird gespeichert…' : 'An die Pinnwand pinnen'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event anlegen (nur Admin) */}
        {isCreateEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 sm:py-10">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Event anlegen
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateEventOpen(false)
                    setEventTitle('')
                    setEventDate('')
                  }}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateEvent} className="px-4 py-4 sm:px-6 sm:py-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Event
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="z.B. Sommerfest 2026"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateEventOpen(false)
                      setEventTitle('')
                      setEventDate('')
                    }}
                    className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEvent || !eventTitle.trim() || !eventDate}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingEvent ? 'Wird erstellt…' : 'Event anlegen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Anmeldung für Event (Datum, Event, Name, Kleidergröße) */}
        {registerEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 sm:py-10">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Anmeldung für Event
                </h2>
                <button
                  type="button"
                  onClick={resetRegisterModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitRegistration} className="px-4 py-4 sm:px-6 sm:py-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Datum
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatDate(registerEvent.event_date)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Event
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={registerEvent.title}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ihr Name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Kleidergröße (optional)
                  </label>
                  <input
                    type="text"
                    value={regKleidergroesse}
                    onChange={(e) => setRegKleidergroesse(e.target.value)}
                    placeholder="z.B. M, L, 42"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetRegisterModal}
                    className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReg || !regName.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingReg ? 'Wird gesendet…' : 'Anmelden'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bild-Vorschau */}
        {previewEntry && previewEntry.imageUrl && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6 sm:py-10">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black/90 shadow-2xl">
              <div className="relative flex items-center justify-between px-4 py-3 sm:px-6">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {previewEntry.title}
                  </h3>
                  {previewEntry.date && (
                    <p className="text-[11px] sm:text-xs text-gray-300">
                      {formatDate(previewEntry.date)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewEntry(null)}
                  className="rounded-full bg-white/10 p-1.5 text-gray-200 hover:bg-white/20 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="bg-black">
                <img
                  src={previewEntry.imageUrl}
                  alt={previewEntry.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

