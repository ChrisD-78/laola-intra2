import Link from 'next/link'

export default function MitwirkungGefaehrdungsbeurteilungenPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6 border-b border-gray-200 pb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mitwirkung bei Gefährdungsbeurteilungen im Brandschutz
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
            Der Brandschutzbeauftragte wirkt dabei beratend und unterstützend mit, besitzt jedoch keine alleinige
            Entscheidungs- oder Durchführungsverantwortung, da diese rechtlich beim Arbeitgeber verbleibt.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            1. Bedeutung der Gefährdungsbeurteilung im Brandschutz
          </h2>
          <p>
            Die Gefährdungsbeurteilung dient dazu, mögliche Brandentstehungs- und Brandausbreitungsrisiken im Betrieb
            frühzeitig zu erkennen. Dabei werden unter anderem folgende Fragen untersucht:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Wo können Brände entstehen?</li>
            <li>Welche brennbaren Stoffe oder Materialien sind vorhanden?</li>
            <li>Welche Zündquellen sind möglich?</li>
            <li>Welche Personen könnten gefährdet sein?</li>
            <li>Welche Schutzmaßnahmen sind erforderlich?</li>
          </ul>
          <p className="mt-2">
            Die Mitwirkung des Brandschutzbeauftragten ist besonders wichtig, weil er über spezielle Fachkenntnisse im
            Brandschutz verfügt und somit Risiken erkennen kann, die im normalen Betriebsablauf häufig übersehen
            werden.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            2. Ermittlung möglicher Brandgefährdungen
          </h2>
          <p>
            Ein wichtiger Teil der Mitwirkung besteht darin, brandgefährdende Situationen im Betrieb zu identifizieren.
            Der Brandschutzbeauftragte unterstützt dabei beispielsweise durch:
          </p>
          <h3 className="font-semibold mt-2">Analyse der Arbeitsbereiche</h3>
          <p>
            Er überprüft verschiedene Arbeitsplätze und Betriebsbereiche hinsichtlich möglicher Brandrisiken, etwa:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Produktionsbereiche</li>
            <li>Werkstätten</li>
            <li>Lagerbereiche</li>
            <li>Büros</li>
            <li>technische Betriebsräume</li>
          </ul>

          <h3 className="font-semibold mt-2">Identifikation von Zündquellen</h3>
          <p>Typische Zündquellen können sein:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>elektrische Anlagen und Geräte</li>
            <li>heiße Oberflächen von Maschinen</li>
            <li>Schweiß-, Schneid- oder Lötarbeiten</li>
            <li>offene Flammen</li>
            <li>statische Aufladung</li>
          </ul>

          <h3 className="font-semibold mt-2">Bewertung brennbarer Stoffe</h3>
          <p>Auch vorhandene Materialien werden betrachtet, zum Beispiel:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>brennbare Flüssigkeiten (Lacke, Lösungsmittel)</li>
            <li>Papier und Verpackungsmaterial</li>
            <li>Holz oder Kunststoffe</li>
            <li>Gase oder Aerosole</li>
          </ul>
          <p className="mt-2">
            Durch diese Analyse kann festgestellt werden, wo ein erhöhtes Brandrisiko besteht.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            3. Bewertung der Brandgefährdung
          </h2>
          <p>
            Nachdem mögliche Gefährdungen ermittelt wurden, erfolgt eine Bewertung der Risiken. Dabei wird unter anderem
            beurteilt:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Wahrscheinlichkeit einer Brandentstehung</li>
            <li>mögliche Ausbreitung von Feuer und Rauch</li>
            <li>Gefährdung für Beschäftigte und Besucher</li>
            <li>mögliche Sach- und Umweltschäden</li>
          </ul>
          <p className="mt-2">
            Im betrieblichen Brandschutz wird häufig zwischen verschiedenen Brandgefährdungsstufen unterschieden,
            beispielsweise:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>normale Brandgefährdung</li>
            <li>erhöhte Brandgefährdung</li>
          </ul>
          <p className="mt-2">
            Diese Einstufung beeinflusst maßgeblich, welche Schutzmaßnahmen erforderlich sind, etwa Anzahl von
            Feuerlöschern oder zusätzliche Sicherheitsmaßnahmen.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            4. Mitwirkung bei der Festlegung von Schutzmaßnahmen
          </h2>
          <p>
            Ein zentraler Bestandteil der Mitwirkung des Brandschutzbeauftragten ist die Beratung bei der Auswahl
            geeigneter Schutzmaßnahmen, um erkannte Gefährdungen zu reduzieren. Dabei können Maßnahmen aus
            verschiedenen Bereichen vorgeschlagen werden.
          </p>
          <h3 className="font-semibold mt-2">Technische Maßnahmen</h3>
          <p>Zum Beispiel:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Installation von Brandmeldeanlagen</li>
            <li>Bereitstellung von Feuerlöschern oder Löschanlagen</li>
            <li>Verbesserung der elektrischen Sicherheit</li>
            <li>Einrichtung von Rauch- und Wärmeabzugsanlagen</li>
          </ul>

          <h3 className="font-semibold mt-2">Organisatorische Maßnahmen</h3>
          <p>Dazu gehören etwa:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Einführung von Arbeitsfreigabescheinen für feuergefährliche Arbeiten</li>
            <li>klare Lagerregeln für brennbare Stoffe</li>
            <li>Festlegung von Rauchverboten</li>
            <li>Erstellung von Brandschutzordnungen</li>
          </ul>

          <h3 className="font-semibold mt-2">Personenbezogene Maßnahmen</h3>
          <p>Diese betreffen vor allem die Beschäftigten:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Unterweisung im Brandschutz</li>
            <li>Ausbildung von Brandschutzhelfern</li>
            <li>Durchführung von Evakuierungsübungen</li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            5. Dokumentation und Aktualisierung
          </h2>
          <p>
            Ein weiterer Bestandteil der Mitwirkung ist die Unterstützung bei der Dokumentation der
            Gefährdungsbeurteilung. Der Brandschutzbeauftragte kann beispielsweise:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hinweise zur brandschutztechnischen Dokumentation geben</li>
            <li>bei der Aktualisierung von Gefährdungsbeurteilungen mitwirken</li>
            <li>
              Veränderungen im Betrieb bewerten (z. B. neue Maschinen, neue Stoffe oder Umbaumaßnahmen)
            </li>
          </ul>
          <p className="mt-2">
            Gefährdungsbeurteilungen müssen regelmäßig überprüft und angepasst werden, insbesondere wenn sich
            Arbeitsbedingungen verändern.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            6. Zusammenarbeit mit anderen Fachstellen
          </h2>
          <p>
            Die Mitwirkung des Brandschutzbeauftragten erfolgt häufig in Zusammenarbeit mit anderen verantwortlichen
            Personen im Arbeitsschutz, beispielsweise:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fachkraft für Arbeitssicherheit</li>
            <li>Betriebsarzt</li>
            <li>Sicherheitsbeauftragte</li>
            <li>Unternehmensleitung</li>
            <li>externe Sachverständige</li>
          </ul>
          <p className="mt-2">
            Diese Zusammenarbeit stellt sicher, dass alle relevanten Aspekte des Arbeits- und Brandschutzes
            berücksichtigt werden.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            7. Ziel der Mitwirkung
          </h2>
          <p>
            Die Mitwirkung des Brandschutzbeauftragten bei Gefährdungsbeurteilungen verfolgt das Ziel:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Brandrisiken frühzeitig zu erkennen</li>
            <li>geeignete Schutzmaßnahmen zu entwickeln</li>
            <li>Beschäftigte vor Brandgefahren zu schützen</li>
            <li>Sachwerte und Betriebsabläufe zu sichern</li>
            <li>gesetzliche Anforderungen einzuhalten</li>
          </ul>
          <p className="mt-2">
            Dadurch trägt der Brandschutzbeauftragte wesentlich dazu bei, ein hohes Sicherheitsniveau im Betrieb zu
            gewährleisten.
          </p>
        </section>
      </main>
    </div>
  )
}

