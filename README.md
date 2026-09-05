# Habit-Tracker

Ein rein statischer, clientseitiger Habit-Tracker. Gewohnheiten anlegen, täglich
abhaken, Serien und Wochenquote verfolgen und die letzten acht Wochen als
Balkendiagramm betrachten. Alle Daten bleiben ausschließlich lokal im Browser
(LocalStorage) – es werden keine Daten an einen Server übertragen und keine
externen Ressourcen geladen.

## Tech-Stack

- HTML, CSS, Vanilla-JavaScript (ES2020+, ES-Module)
- Kein Framework, kein Build-Schritt
- Speicherung: LocalStorage
- Diagramm: Canvas 2D
- Projekttyp: `web-static`

## Installation

Keine Installation nötig – es gibt keine Abhängigkeiten. Einfach das
Repository klonen.

## Starten (Entwicklung)

Da es sich um eine rein statische App handelt, werden die Dateien über einen
einfachen HTTP-Server ausgeliefert (ein direkter `file://`-Aufruf blockiert
ES-Module und LocalStorage):

```bash
python -m http.server 8000
```

Anschließend im Browser öffnen: <http://localhost:8000>

Ein Build-Schritt existiert nicht; die Dateien im Repository sind direkt das
auslieferbare Produkt.

## Bedienung

- **Gewohnheit anlegen**: Namen ins Eingabefeld oben eintippen und „Anlegen“
  drücken. Beim ersten Start führt eine sichtbare Schaltfläche („Erste
  Gewohnheit anlegen“) direkt zum Eingabefeld.
- **Tägliches Abhaken**: Im 30-Tage-Raster einer Gewohnheit einen Tag anklicken,
  um das Häkchen zu setzen oder wieder zu entfernen.
- **Filter**: „Aktiv“, „Archiviert“ oder „Alle“ im Kopfbereich auswählen.
- **Dark Mode**: Über den Schalter im Kopfbereich umschalten; die Auswahl bleibt
  nach einem Neuladen erhalten.
- **Export / Import**: Den gesamten Datenbestand als JSON-Datei herunterladen
  bzw. eine solche Datei validiert wieder einlesen.
- **Alle Daten löschen**: Alle gespeicherten Daten dauerhaft aus dem LocalStorage
  entfernen.
- **Datenschutz / Impressum**: Über die dauerhaft sichtbaren Links im Footer
  erreichbar.

## Features

- Gewohnheiten anlegen, umbenennen, archivieren und löschen
- 30-Tage-Häkchenraster mit täglichen Check-Ins
- Aktuelle und längste Serie sowie Wochenquote
- Wochen-Balkendiagramm (letzte acht Wochen) auf Canvas
- Archiv-Filter (Aktiv / Archiviert / Alle)
- Persistenter Dark Mode
- JSON-Export und validierter Import
- Vollständig lokale Speicherung – keine Netzwerkrequests
