# PDF Export - Paketinstallation

## Erforderliche Pakete

Um die PDF-Export-Funktion zu nutzen, müssen folgende NPM-Pakete installiert werden:

```bash
npm install jspdf jspdf-autotable
```

oder

```bash
yarn add jspdf jspdf-autotable
```

## Paketbeschreibung

- **jspdf**: JavaScript-Bibliothek zur PDF-Erstellung im Browser
- **jspdf-autotable**: Plugin für jsPDF zum Erstellen von Tabellen in PDFs

## Nach der Installation

Nach der Installation werden keine weiteren Konfigurationsschritte benötigt. Die PDF-Export-Funktion sollte sofort funktionieren.

## Verwendung

1. Navigieren Sie zur Monatsübersicht im Schichtplan
2. Klicken Sie auf den Button "📄 PDF Export"
3. Wählen Sie die gewünschte Export-Option:
   - **Bereich**: Exportiert alle Mitarbeiter eines bestimmten Bereichs
   - **Tage**: Exportiert einen bestimmten Zeitraum
   - **Namen**: Exportiert ausgewählte Mitarbeiter
4. Klicken Sie auf "📥 PDF Exportieren"

Das PDF wird automatisch heruntergeladen und enthält:
- Schichtplan-Titel mit Monat und Filterinformationen
- Tabellarische Übersicht aller Mitarbeiter und deren Schichten
- Seitennummerierung
- Professionelles Layout im Querformat (A4)

