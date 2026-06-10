/** Browser-Spracherkennung (Chrome, Edge, Safari teilweise). */
export type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionResultEvent = {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      0: { transcript: string }
    }
  }
}

export function getBrowserSpeechRecognition():
  | (new () => BrowserSpeechRecognition)
  | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/** Finalen und Zwischentext aus einem Erkennungs-Event lesen. */
export function readSpeechResults(event: SpeechRecognitionResultEvent): {
  finalText: string
  interimText: string
} {
  let finalText = ''
  let interimText = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const part = event.results[i][0].transcript
    if (event.results[i].isFinal) finalText += part
    else interimText += part
  }

  return { finalText: finalText.trim(), interimText: interimText.trim() }
}
