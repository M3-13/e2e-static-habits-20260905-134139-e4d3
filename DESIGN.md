# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Minimalistisch-ruhige Produktivitäts-Oberfläche im Linear/Stripe-Stil: warmes Off-White, dunkles Blaugrau als Textfarbe und ein gedämpftes Grün als Erfolgs-Akzent, ergänzt um einen konsequenten Dark Mode.

## Colors

- `--color-bg`: **#FAFAF7**
- `--color-fg`: **#1A1D1F**
- `--color-accent`: **#3E7B4F**
- `--color-accent_hover`: **#356B44**
- `--color-success`: **#2E9E5B**
- `--color-danger`: **#C0392B**
- `--color-border`: **#E4E6E9**
- `--color-muted`: **#6B7280**
- `--color-bg_dark`: **#111315**
- `--color-fg_dark`: **#EDEFF1**
- `--color-border_dark`: **#2A2E33**
- `--color-muted_dark`: **#9BA1A6**

## Typography

- `font_family`: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `heading_weight`: 600
- `body_weight`: 400

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär: bg=accent, Text #FFFFFF, padding 12px 20px, radius md (10px), min-height 44px, font-weight 600, font-size 15px; hover: bg=accent_hover; active: bg 8% dunkler + scale 0.98; disabled: opacity 0.45, kein Pointer; Fokus: 2px Outline accent, 2px Offset. Sekundär: bg transparent, 1px border border, Text fg; hover: bg fg bei 6% Deckkraft. Ghost: bg transparent, Text accent; hover: bg accent bei 8% Deckkraft. Danger: bg danger, Text #FFFFFF, hover 8% dunkler. Icon-Button: 44×44px, radius md, zentriert, gleiche Fokusregeln.

### HabitCard

bg=bg (Dark: bg_dark), 1px border border (Dark: border_dark), radius lg (16px), padding 16px 24px (mobile: 16px), vertikaler Abstand zwischen Karten 12px; dezenter Schatten 0 1px 2px rgba(0,0,0,0.04); Kopfzeile mit Name (heading_weight, 16px) links und Aktions-Icons (Umbenennen, Archivieren, Löschen) rechts; Metadaten (Serie, Quote) als 13px muted darunter.

### CheckCell

30-Tage-Rasterzelle: Breite 32px (mobile) / 40px (ab 640px), Höhe 40px, radius sm (6px), border 1px border; leer: bg transparent; gesetzt: bg=success, weißes Häkchen (SVG-Pfad, 16px); hover: border accent; active: scale 0.96; Fokus: 2px Outline accent; Touch-Target ≥ 40px; jede Zelle mit aria-label und role=button/checkbox.

### Input

padding 10px 14px, radius md (10px), border 1px border, bg transparent, Text fg, placeholder muted, font-size 15px, min-height 44px; Fokus: border accent + 2px Ring accent bei 20% Deckkraft; ungültiger Zustand: border danger.

### Toggle

Dark-Mode-Schalter: Breite 52px, Höhe 32px, radius pill, Track border 1px border, Knauf 24px mit 4px Abstand; inaktiv: Track bg transparent, Knauf muted; aktiv: Track bg=accent, Knauf #FFFFFF; Fokus: 2px Outline accent; Label daneben 14px fg.

### FilterPills

Segment-Kontrolle mit drei Optionen (Aktiv, Archiviert, Alle): Container border 1px border, radius pill, padding 4px, bg transparent; aktive Option bg=fg bei 8% Deckkraft, Text fg, font-weight 600; inaktive Option Text muted, hover bg fg bei 4% Deckkraft; min-height 44px.

### Modal

Bestätigungsdialog: Overlay rgba(0,0,0,0.45), zentriert, Dialog bg=bg (Dark: bg_dark), radius lg (16px), max-width 420px, padding 24px, border 1px border; Titel 18px heading_weight, Text 14px muted, Aktionen rechtsbündig (Sekundär + Danger/Primär); Fokus im Dialog gefangen, ESC schließt.

### CanvasChart

Balkendiagramm letzte 8 Wochen: responsive Canvas, Höhe 160px, Breite 100% des Containers; Hintergrund transparent (übernimmt bg/bg_dark); 8 Balken gleichmäßig verteilt, Balkenbreite ca. 16px, Abstand ca. 20px; Farbe accent, Füllstand anteilig zur Wochenquote, 100% als voller Balken; dezente horizontale Rasterlinien in muted bei 20% Deckkraft; Wochenbeschriftung 11px muted unter den Balken, Prozentwerte 11px muted über den Balken; Leerzustand: zentrierte Hinweiszeile 13px muted.

### EmptyState

Aufgeräumter Leerzustand: zentriert im Container, max-width 380px, Icon 48px in muted, Titel 20px heading_weight, Text 14px muted, Abstand 12px, primärer CTA-Button 'Erste Gewohnheit anlegen'; darunter Datenschutzhinweis 'Alle Daten bleiben lokal in deinem Browser (LocalStorage).' als 12px muted.

## Layout Principles

- Container max-width 760px, margin 0 auto, padding 0 16px (mobile) und 0 24px (ab 640px).
- Breakpoints: 640px für Tablet/Desktop-Anpassungen; darunter einspaltige, mobil optimierte Ansicht.
- Sticky Header mit App-Titel links sowie Dark-Mode-Toggle und Filter rechts; darunter beginnt der Inhalt mit 24px Abstand.
- 30-Tage-Raster als flex-wrap mit gap 6px; jede Zelle hat feste Breite und bleibt auch bei schmalen Viewports bedienbar.
- Vertikaler Abstand zwischen Sektionen 24px, zwischen Karten 12px; Aktionen und Formulare sitzen rechtsbündig bzw. prominent über dem Inhalt.
- Footer dauerhaft mit Links zu Datenschutzerklärung, Impressum und Daten löschen, Text 13px muted.
