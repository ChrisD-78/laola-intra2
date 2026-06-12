import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic } from '@/lib/anthropicMessages'
import { logAgentEvent } from '@/lib/agentUsage'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export type MarketingChannel = 'press' | 'instagram' | 'linkedin'

const BRAND_PROMPT = `Du bist der Marketing-Assistent des Freizeitbads LA OLA in Landau in der Pfalz (Betreiber: Stadtholding Landau in der Pfalz GmbH).

Marke und Tonalität (LA OLA Brand):
- Claim: „LA OLA – Das Freizeitbad“. Markenzeichen: die blaue Welle mit lachendem Gesicht, Farben Dunkelblau/Blau/Schwarz/Weiß, Wasser- und Wellen-Motive.
- Themenwelt: Erlebnisbecken, Rutschen, Sauna- und Wellnessbereich, Außenbecken, Kurse (z. B. Schwimmkurse, Aqua-Fitness), Familienangebote, Events und Aktionen.
- Tonalität: freundlich, einladend, regional verwurzelt (Landau, Pfalz, Südliche Weinstraße), professionell aber nahbar. Wasser-/Wellen-Wortspiele sind willkommen, aber dosiert.
- Zielgruppen: Familien mit Kindern, Sauna-/Wellness-Gäste, Sportschwimmer, Schulen und Vereine aus der Region.
- Schreibe ausschließlich auf Deutsch. Erfinde keine Fakten, Preise, Daten oder Öffnungszeiten, die nicht in den Angaben stehen. Fehlen wichtige Angaben, kennzeichne sie im Text als Platzhalter in eckigen Klammern, z. B. [Datum einsetzen].`

const CHANNEL_PROMPTS: Record<MarketingChannel, string> = {
  press: `Erstelle eine professionelle PRESSEMITTEILUNG mit genau dieser Struktur (als reiner Text, keine Markdown-Zeichen wie ** oder #):

PRESSEMITTEILUNG
[Schlagzeile – prägnant, max. 12 Wörter]
[Unterzeile – ein ergänzender Satz]

Landau in der Pfalz, [Datum]. [Lead-Absatz: Wer, Was, Wann, Wo, Warum in 2–3 Sätzen]

[2–4 Absätze Haupttext mit Details]

[Ein Zitat einer verantwortlichen Person, falls in den Angaben genannt – sonst Platzhalter „[Zitat von … einsetzen]“]

Über das LA OLA
Das LA OLA ist das Freizeitbad der Stadtholding Landau in der Pfalz GmbH und bietet Erlebnisbecken, Rutschen, einen großzügigen Sauna- und Wellnessbereich sowie Kurse und Veranstaltungen für die ganze Familie.

Pressekontakt
[Kontaktdaten]`,
  instagram: `Erstelle einen INSTAGRAM-BEITRAG für den Account des LA OLA:

- Zeile 1: starker Hook (kurz, neugierig machend – diese Zeile wird auch als Überschrift auf der Bildkachel verwendet).
- Danach 2–4 kurze Absätze, locker und einladend, passende Emojis dosiert einsetzen (Wasser 🌊💦, Sonne, Sauna 🧖 etc.).
- Klare Handlungsaufforderung (z. B. Link in Bio, Tickets, vorbeikommen).
- Am Ende ein Hashtag-Block mit 10–15 Hashtags, immer dabei: #LAOLA #Landau #Freizeitbad #Pfalz – plus themenspezifische Hashtags.
- Gesamtlänge unter 2.000 Zeichen. Reiner Text, keine Markdown-Zeichen.
- Ganz am Ende, in einer eigenen Zeile: „Bildidee: …“ mit einem konkreten Foto-/Motivvorschlag im LA OLA Look (blaue Welle, Wasser, Menschen mit Spaß).`,
  linkedin: `Erstelle einen LINKEDIN-BEITRAG für die Unternehmensseite des LA OLA / der Stadtholding Landau:

- Professionell, aber persönlich und nahbar – LinkedIn-Ton, kein Werbeflyer.
- Zeile 1: aufmerksamkeitsstarker Einstieg (ohne Clickbait).
- 3–5 kurze Absätze; gerne eine kompakte Aufzählung mit • wenn es passt.
- Mehrwert betonen: regionale Bedeutung, Team, Qualität, Innovation, Gesundheit/Freizeitwert.
- Dezente Emojis sind erlaubt (max. 3–4 im ganzen Beitrag).
- Klare Handlungsaufforderung am Ende.
- Abschluss: 3–5 passende Hashtags (z. B. #LAOLA #Landau #Freizeitbad plus Thema).
- Reiner Text, keine Markdown-Zeichen.`,
}

const CHANNEL_MAX_TOKENS: Record<MarketingChannel, number> = {
  press: 1600,
  instagram: 900,
  linkedin: 900,
}

/** Marketing-Agent: Pressemitteilung, Instagram- oder LinkedIn-Beitrag im LA OLA Stil. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const channel = body.channel as MarketingChannel
    if (!['press', 'instagram', 'linkedin'].includes(channel)) {
      return NextResponse.json({ error: 'Unbekannter Kanal.' }, { status: 400 })
    }

    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 300) : ''
    const details = typeof body.details === 'string' ? body.details.trim().slice(0, 4000) : ''
    const date = typeof body.date === 'string' ? body.date.trim().slice(0, 100) : ''
    const audience = typeof body.audience === 'string' ? body.audience.trim().slice(0, 200) : ''
    const tone = typeof body.tone === 'string' ? body.tone.trim().slice(0, 100) : ''
    const cta = typeof body.cta === 'string' ? body.cta.trim().slice(0, 300) : ''
    const contact = typeof body.contact === 'string' ? body.contact.trim().slice(0, 400) : ''
    const previousText =
      typeof body.previousText === 'string' ? body.previousText.trim().slice(0, 6000) : ''
    const feedback = typeof body.feedback === 'string' ? body.feedback.trim().slice(0, 1000) : ''

    if (!topic) {
      return NextResponse.json({ error: 'Bitte Thema/Anlass angeben.' }, { status: 400 })
    }

    const system = `${BRAND_PROMPT}\n\n### Aufgabe\n${CHANNEL_PROMPTS[channel]}\n\nGib NUR den fertigen Beitrag/Text zurück – keine Erklärungen davor oder danach.`

    const lines = [
      `Thema/Anlass: ${topic}`,
      details && `Wichtige Informationen/Stichpunkte:\n${details}`,
      date && `Datum/Zeitraum: ${date}`,
      audience && `Zielgruppe: ${audience}`,
      tone && `Gewünschte Tonalität: ${tone}`,
      cta && `Handlungsaufforderung/Ziel: ${cta}`,
      channel === 'press' && contact && `Pressekontakt: ${contact}`,
    ].filter(Boolean)

    let userMsg = `Erstelle den Beitrag mit folgenden Angaben:\n\n${lines.join('\n\n')}`
    if (previousText && feedback) {
      userMsg = `Hier ist der bisherige Entwurf:\n---\n${previousText}\n---\n\nÜberarbeite ihn nach diesem Feedback: ${feedback}\n\nUrsprüngliche Angaben:\n${lines.join('\n')}`
    }

    const text = await completeAnthropic({
      system,
      messages: [{ role: 'user', content: userMsg }],
      max_tokens: CHANNEL_MAX_TOKENS[channel],
    })

    await logAgentEvent('marketing')

    return NextResponse.json({ text: text.trim(), channel })
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err }, { status: 503 })
    }
    console.error('POST /api/agent/marketing', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
