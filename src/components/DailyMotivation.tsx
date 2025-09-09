'use client'

import { useState, useEffect } from 'react'

const DailyMotivation = () => {
  const [quote, setQuote] = useState('')

  const motivationalQuotes = [
    {
      quote: "Jeder Tag ist eine neue Chance, etwas Besonderes zu bewirken. Macht LA OLA zu einem Ort der Freude!",
      author: "LA OLA Team"
    },
    {
      quote: "Ihr seid das Herzstück von LA OLA. Eure positive Energie macht den Unterschied!",
      author: "LA OLA Team"
    },
    {
      quote: "Gemeinsam schaffen wir das Unmögliche möglich. Heute wird ein fantastischer Tag!",
      author: "LA OLA Team"
    },
    {
      quote: "Wie das Wasser im Pool - fließt auch unsere positive Energie weiter. Verbreitet Freude!",
      author: "LA OLA Team"
    },
    {
      quote: "Kleine Schritte führen zu großen Erfolgen. Jede Aufgabe ist ein Schritt zum Erfolg!",
      author: "LA OLA Team"
    },
    {
      quote: "Nach dem Regen kommt der Sonnenschein. Nach der Arbeit kommt die Freude!",
      author: "LA OLA Team"
    },
    {
      quote: "Ihr seid die Champions des Kundenservices. Macht jeden Tag zu einem Gewinner-Tag!",
      author: "LA OLA Team"
    },
    {
      quote: "Der Morgen gehört denjenigen, die ihn mit Freude begrüßen. Seid diese Menschen!",
      author: "LA OLA Team"
    },
    {
      quote: "Macht Musik mit eurer Arbeit - sie wird zur Melodie des Erfolgs!",
      author: "LA OLA Team"
    },
    {
      quote: "Leuchtet so hell wie die Sterne - ihr seid unersetzlich für LA OLA!",
      author: "LA OLA Team"
    },
    {
      quote: "Magie passiert, wenn Menschen mit Herz bei der Sache sind. Ihr seid magisch!",
      author: "LA OLA Team"
    },
    {
      quote: "Willkommen im Zirkus des Spaßes - ihr seid die Stars der Show!",
      author: "LA OLA Team"
    },
    {
      quote: "Wellen der Freude breiten sich von euch aus. Seid die Quelle der Freude!",
      author: "LA OLA Team"
    },
    {
      quote: "Malt jeden Tag mit den schönsten Farben der Freundlichkeit!",
      author: "LA OLA Team"
    },
    {
      quote: "Startet durch wie Raketen - nichts kann euch aufhalten!",
      author: "LA OLA Team"
    },
    {
      quote: "Ihr seid der Regenbogen, der LA OLA zum Leuchten bringt!",
      author: "LA OLA Team"
    },
    {
      quote: "Jeder Tag ist eine neue Show - ihr seid die Hauptdarsteller!",
      author: "LA OLA Team"
    },
    {
      quote: "Diamanten entstehen unter Druck - ihr seid unzerbrechlich!",
      author: "LA OLA Team"
    },
    {
      quote: "Blüht auf und verbreitet euren Duft der Freundlichkeit!",
      author: "LA OLA Team"
    },
    {
      quote: "Willkommen im größten Abenteuer - dem LA OLA Alltag!",
      author: "LA OLA Team"
    },
    {
      quote: "Eure Begeisterung ist ansteckend. Verbreitet sie weiter!",
      author: "LA OLA Team"
    },
    {
      quote: "Jeder Moment ist eine Gelegenheit, jemandem ein Lächeln zu schenken!",
      author: "LA OLA Team"
    },
    {
      quote: "Ihr seid die Architekten der Freude bei LA OLA!",
      author: "LA OLA Team"
    },
    {
      quote: "Heute ist der perfekte Tag, um jemandem zu helfen!",
      author: "LA OLA Team"
    },
    {
      quote: "Eure positive Einstellung macht LA OLA zu einem besonderen Ort!",
      author: "LA OLA Team"
    },
    {
      quote: "Jeder Tag ist ein Geschenk - macht das Beste daraus!",
      author: "LA OLA Team"
    },
    {
      quote: "Ihr seid die Helden des Alltags bei LA OLA!",
      author: "LA OLA Team"
    },
    {
      quote: "Gemeinsam sind wir unschlagbar. Das ist das LA OLA Geheimnis!",
      author: "LA OLA Team"
    },
    {
      quote: "Eure Freundlichkeit macht den Unterschied. Bleibt so wunderbar!",
      author: "LA OLA Team"
    }
  ]

  useEffect(() => {
    // Berechne den Index basierend auf dem aktuellen Datum
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    
    // Verwende den Tag des Jahres, um den Spruch zu wählen
    const quoteIndex = dayOfYear % motivationalQuotes.length
    setQuote(motivationalQuotes[quoteIndex].quote)
  }, [])

  if (!quote) return null

  return (
    <div className="mt-6 p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
      <div className="text-center">
        <div className="mb-3">
          <span className="text-2xl">💫</span>
          <span className="text-lg text-white/90 ml-2">Spruch des Tages</span>
          <span className="text-2xl ml-2">💫</span>
        </div>
        <blockquote className="text-xl text-white font-medium italic leading-relaxed mb-3">
          &quot;{quote}&quot;
        </blockquote>
      </div>
    </div>
  )
}

export default DailyMotivation
