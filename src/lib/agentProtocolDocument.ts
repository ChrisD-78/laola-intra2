export const PROTOCOL_LOGO_PATH = '/stadtholding-logo.png'
export const PROTOCOL_LA_OLA_LOGO_PATH = '/la-ola-logo.png'

const LA_OLA_DEPARTMENTS = new Set(['la ola betrieb', 'la ola schichtführung'])

export type ProtocolHeaderMode = 'none' | 'stadtholding' | 'la-ola-stadtholding'

/** Abteilung normalisieren (Bindestrich, Leerzeichen). */
function normalizeDepartment(dept: string): string {
  return dept
    .trim()
    .toLowerCase()
    .replace(/\s*[–—-]\s*/g, ' ')
    .replace(/\s+/g, ' ')
}

/** Kopfzeilen-Logos je nach Abteilung. */
export function getProtocolHeaderMode(department: string): ProtocolHeaderMode {
  const normalized = normalizeDepartment(department)
  if (normalized.startsWith('bäderbook') || normalized.startsWith('baederbook')) {
    return 'none'
  }
  if (LA_OLA_DEPARTMENTS.has(normalized)) {
    return 'la-ola-stadtholding'
  }
  return 'stadtholding'
}

/** Logo als Data-URL für selbstständige HTML-Dateien und E-Mails. */
export async function fetchLogoDataUrl(path: string): Promise<string> {
  const res = await fetch(path)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Logo konnte nicht geladen werden: ${path}`))
    reader.readAsDataURL(blob)
  })
}

/** Alle Protokoll-Logos in HTML durch eingebettete Data-URLs ersetzen. */
export async function embedProtocolLogos(html: string): Promise<string> {
  let result = html
  const paths = [PROTOCOL_LOGO_PATH]
  if (result.includes(PROTOCOL_LA_OLA_LOGO_PATH)) {
    paths.unshift(PROTOCOL_LA_OLA_LOGO_PATH)
  }
  for (const path of paths) {
    if (result.includes(path)) {
      const dataUrl = await fetchLogoDataUrl(path)
      result = result.split(path).join(dataUrl)
    }
  }
  return result
}

export type ProtocolDocumentOptions = {
  department?: string
  stadtholdingLogoSrc?: string
  laOlaLogoSrc?: string
}

function buildProtocolHeader(
  mode: ProtocolHeaderMode,
  stadtholdingSrc: string,
  laOlaSrc: string,
): string {
  if (mode === 'none') return ''

  const logoRow =
    mode === 'la-ola-stadtholding'
      ? `
    <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;margin-bottom:0.65rem">
      <img
        src="${laOlaSrc}"
        alt="LA OLA – Das Freizeitbad"
        style="display:block;height:56px;width:auto;max-width:min(240px,46vw);object-fit:contain"
      />
      <img
        src="${stadtholdingSrc}"
        alt="Stadtholding Landau"
        width="88"
        height="80"
        style="display:block;max-width:88px;height:auto"
      />
    </div>`
      : `
    <img
      src="${stadtholdingSrc}"
      alt="Stadtholding Landau"
      width="88"
      height="80"
      style="display:block;margin:0 auto 0.65rem;max-width:88px;height:auto"
    />`

  const subtitle =
    mode === 'la-ola-stadtholding'
      ? `<p style="margin:0.35rem 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-weight:600">
        LA OLA · Stadtholding Landau
      </p>`
      : `<p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;font-weight:600">
        Stadtholding Landau
      </p>`

  return `
  <header style="text-align:center;margin-bottom:1.75rem;padding-bottom:1.25rem;border-bottom:2px solid #e5e7eb">
    ${logoRow}
    ${subtitle}
  </header>`
}

/**
 * Umschließt KI-Protokollinhalt mit Logo-Kopfzeile und dezentem Layout.
 * Bäderbook: ohne Logo · LA OLA: beide Logos · sonst: Stadtholding.
 */
export function wrapProtocolDocument(
  bodyHtml: string,
  options: ProtocolDocumentOptions = {},
): string {
  const body = bodyHtml.trim()
  if (!body) return ''

  const mode = options.department ? getProtocolHeaderMode(options.department) : 'stadtholding'
  const stadtholdingSrc = options.stadtholdingLogoSrc ?? PROTOCOL_LOGO_PATH
  const laOlaSrc = options.laOlaLogoSrc ?? PROTOCOL_LA_OLA_LOGO_PATH
  const header = buildProtocolHeader(mode, stadtholdingSrc, laOlaSrc)

  return `
<div class="laola-protocol" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827;line-height:1.6;max-width:720px;margin:0 auto">
  ${header}
  <div class="laola-protocol-body" style="font-size:14px">
    ${body}
  </div>
</div>`.trim()
}

/** Vollständiges HTML-Dokument für Download oder E-Mail-Anhang. */
export function buildProtocolHtmlFile(documentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Besprechungsprotokoll</title>
  <style>
    body { margin: 0; padding: 2rem 1.25rem; background: #f9fafb; }
    .laola-protocol { background: #fff; padding: 2rem 2.25rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .laola-protocol h4 { color: #1e3a8a; font-size: 1rem; margin: 1.35rem 0 0.5rem; font-weight: 600; }
    .laola-protocol p { margin: 0.5rem 0; }
    .laola-protocol ul { margin: 0.5rem 0 0.75rem; padding-left: 1.35rem; }
    .laola-protocol li { margin: 0.25rem 0; }
  </style>
</head>
<body>
${documentHtml}
</body>
</html>`
}
