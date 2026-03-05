import Link from 'next/link'

export default function BrandschutzBeratungPdfView() {

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6 border-b border-gray-200 pb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Beratung der Unternehmensleitung im Brandschutz
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Dieser Inhalt kann über den Browser als PDF gedruckt bzw. exportiert werden.
            </p>
          </div>
          <Link
            href="/technik/brandschutz"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 shadow-sm"
          >
            ← Zurück zur Übersicht
          </Link>
        </header>

        <section className="space-y-4 text-sm leading-relaxed">
          <p>
            Im Rahmen seiner Tätigkeit sorgt der Brandschutzbeauftragte dafür, dass gesetzliche Anforderungen,
            technische Regeln und betriebliche Sicherheitsmaßnahmen im Brandschutz umgesetzt und kontinuierlich
            verbessert werden.
          </p>

          <h2 className="text-lg font-semibold mt-4">1. Beratung im vorbeugenden Brandschutz</h2>
          <p>
            Der vorbeugende Brandschutz umfasst alle Maßnahmen, die dazu dienen, Brände bereits im Vorfeld zu
            verhindern oder ihre Ausbreitung zu begrenzen. Der Brandschutzbeauftragte berät hierbei insbesondere zu:
          </p>
          <h3 className="font-semibold mt-2">Baulicher Brandschutz</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Anforderungen an Brandabschnitte, Brandwände und feuerbeständige Bauteile</li>
            <li>Gestaltung und Freihaltung von Flucht- und Rettungswegen</li>
            <li>Brandschutztechnische Anforderungen an Türen, Tore und Abschottungen</li>
            <li>Planung und Bewertung von Rauch- und Wärmeabzugsanlagen</li>
            <li>Brandschutzgerechte Nutzung von Räumen und Gebäudeteilen</li>
          </ul>
          <p className="mt-2">
            Ziel ist es sicherzustellen, dass bauliche Anlagen so gestaltet sind, dass Feuer und Rauch möglichst
            lange auf einen Bereich begrenzt bleiben und Menschen das Gebäude sicher verlassen können.
          </p>

          <h3 className="font-semibold mt-2">Anlagentechnischer Brandschutz</h3>
          <p>
            Der Brandschutzbeauftragte berät auch zu technischen Einrichtungen, beispielsweise:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Brandmeldeanlagen</li>
            <li>Sprinkler- und Löschanlagen</li>
            <li>Rauchabzugsanlagen</li>
            <li>Feuerlöscheinrichtungen</li>
            <li>Notbeleuchtung und Sicherheitsstromversorgung</li>
          </ul>
          <p className="mt-2">
            Hierbei geht es sowohl um Auswahl, Planung, Wartung als auch Funktionsfähigkeit dieser Systeme.
          </p>

          <h3 className="font-semibold mt-2">Betrieblicher Brandschutz</h3>
          <p>Darunter fallen Maßnahmen, die sich aus der Nutzung eines Gebäudes ergeben, zum Beispiel:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sichere Lagerung brennbarer Stoffe</li>
            <li>Umgang mit Gefahrstoffen</li>
            <li>Maßnahmen bei feuergefährlichen Arbeiten (z. B. Schweißen, Trennen)</li>
            <li>Einhaltung von Brandschutzordnungen</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">2. Beratung im organisatorischen Brandschutz</h2>
          <p>
            Der organisatorische Brandschutz umfasst alle organisatorischen Regelungen und Abläufe, die im Unternehmen
            eingeführt werden müssen, um im Brandfall richtig zu handeln. Der Brandschutzbeauftragte berät
            beispielsweise bei:
          </p>
          <h3 className="font-semibold mt-2">Erstellung von Brandschutzdokumenten</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Brandschutzordnung (Teil A, B und C)</li>
            <li>Alarm- und Gefahrenabwehrpläne</li>
            <li>Evakuierungspläne</li>
            <li>Feuerwehrpläne</li>
          </ul>

          <h3 className="font-semibold mt-2">Organisation des betrieblichen Brandschutzes</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Auswahl und Ausbildung von Brandschutzhelfern</li>
            <li>Festlegung von Räumungshelfern</li>
            <li>Organisation der Brandschutzunterweisungen</li>
            <li>Planung von Evakuierungsübungen</li>
          </ul>

          <h3 className="font-semibold mt-2">Schulung und Unterweisung</h3>
          <p>Der Brandschutzbeauftragte unterstützt bei der:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Durchführung von Brandschutzunterweisungen für Mitarbeiter</li>
            <li>Sensibilisierung der Beschäftigten für Brandgefahren</li>
            <li>Schulung im Umgang mit Feuerlöschern</li>
          </ul>
          <p className="mt-2">
            Ziel ist es, dass alle Mitarbeiter wissen, wie Brände verhindert werden und wie sie sich im Ernstfall
            richtig verhalten.
          </p>

          <h2 className="text-lg font-semibold mt-6">3. Beratung im abwehrenden Brandschutz</h2>
          <p>
            Der abwehrende Brandschutz bezieht sich auf Maßnahmen zur Brandbekämpfung und Gefahrenabwehr, insbesondere
            durch die Feuerwehr. Der Brandschutzbeauftragte berät in diesem Bereich unter anderem zu:
          </p>
          <h3 className="font-semibold mt-2">Vorbereitung auf den Einsatz der Feuerwehr</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Erstellung und Aktualisierung von Feuerwehrplänen</li>
            <li>Kennzeichnung von Löschwassereinrichtungen</li>
            <li>Sicherstellung von Feuerwehrzufahrten und Aufstellflächen</li>
          </ul>

          <h3 className="font-semibold mt-2">Zusammenarbeit mit externen Einsatzkräften</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Abstimmung mit der örtlichen Feuerwehr</li>
            <li>Organisation von Begehungen durch die Feuerwehr</li>
            <li>Bereitstellung wichtiger Informationen über Gefahrstoffe oder besondere Risiken</li>
          </ul>

          <h3 className="font-semibold mt-2">Unterstützung im Brandfall</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Einweisung der Feuerwehr</li>
            <li>Bereitstellung wichtiger Objektinformationen</li>
            <li>Unterstützung der Einsatzleitung</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">4. Ziel der Beratungstätigkeit</h2>
          <p>
            Die Beratung durch den Brandschutzbeauftragten verfolgt mehrere wesentliche Ziele:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vermeidung von Bränden</li>
            <li>Schutz von Menschenleben</li>
            <li>Begrenzung von Sachschäden</li>
            <li>Sicherung der Betriebsabläufe</li>
            <li>Einhaltung gesetzlicher Vorschriften</li>
          </ul>
          <p className="mt-2">
            Der Brandschutzbeauftragte fungiert dabei als fachkundiger Ansprechpartner für alle Brandschutzfragen im
            Betrieb und trägt wesentlich dazu bei, ein systematisches und wirksames Brandschutzmanagement im
            Unternehmen zu etablieren.
          </p>
        </section>
      </main>
    </div>
  )
}

