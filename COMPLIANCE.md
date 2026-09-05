VERDICT: CHANGES_REQUESTED

## 1. DSGVO / Datenschutz

**Befund:** Die App arbeitet rein clientseitig und speichert ausschließlich im LocalStorage. Es gibt keine Netzwerkrequests, keine Serverübertragung, keine Logs und keine Cookies/Tracking-Skripte. Die Verwendung von LocalStorage ist funktional unbedingt erforderlich und fällt damit unter die gesetzliche Ausnahme des § 25 TDDG, sodass kein Consent-Banner erforderlich ist. Die vorhandene Datenschutzerklärung beschreibt Zweck, lokale Speicherung und Löschung zutreffend.

| # | Schweregrad | Befund | Konkrete Abhilfe |
|---|---|---|---|
| 1 | mittel | Die Datenschutzerklärung nennt keinen konkreten Verantwortlichen mit ladungsfähiger Anschrift und Kontaktmöglichkeit. Im Abschnitt „1. Verantwortliche Stelle“ bleibt nur die Formulierung „der Betreiber dieser Anwendung“. | In `js/privacy.js` in `renderLegalSections()` den Block „1. Verantwortliche Stelle“ um Name, Anschrift, E-Mail-Adresse (und ggf. Vertretungsberechtigten) des Anbieters ergänzen. Diese Angaben müssen identisch mit dem Impressum sein. |
| 2 | mittel | Die Betroffenenrechte sind unvollständig dargestellt. Erwähnt werden nur Löschung und Export. Die DSGVO verlangt zusätzlich Informationen über Auskunft, Berichtigung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und das Beschwerderecht bei einer Aufsichtsbehörde. | In `js/privacy.js` im Abschnitt „5. Deine Rechte“ die übrigen Betroffenenrechte ergänzen. Da alle Daten lokal liegen, kann dabei formuliert werden, dass diese Rechte durch die Nutzerin bzw. den Nutzer selbst ausgeübt werden und ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde besteht. |
| 3 | niedrig | Beim JSON-Import werden validierte Habits unverändert übernommen (`state.habits = parsed.habits`). Unbekannte Zusatzfelder werden erst beim nächsten Speichern durch `saveState()` entfernt, verbleiben aber kurzfristig im Speicher. | In `js/importExport.js` die übernommenen Habits mit derselben Normalisierungslogik wie in `js/store.js` bereinigen, z. B. eine gemeinsam genutzte `normalizeHabit`-Funktion exportieren und in `importData()` anwenden. Dadurch werden unbekannte Zusatzfelder sofort verworfen. |

**Positiv:**
- Keine Netzwerkrequests, kein `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`.
- Keine personenbezogenen Daten in Logs oder Plaintext-Ausgaben.
- LocalStorage-Daten werden vollständig validiert, unbekannte Felder verworfen, ungültige Daten führen zu einem sicheren Ausgangszustand.
- Nutzerdaten werden ausschließlich mittels `textContent` bzw. `createTextNode` ins DOM eingefügt; kein `innerHTML` für unzuverlässige Zeichenketten.
- Die Löschfunktion entfernt sämtliche gespeicherten Daten dauerhaft.

---

## 2. EU Cyber Resilience Act (CRA)

**Befund:** Das Produkt besteht aus rein statischen HTML-, CSS- und JavaScript-Dateien ohne externe Abhängigkeiten, ohne Build-Prozess und ohne serverseitige Komponente. Dadurch ist ein SBOM praktisch trivial, und die Angriffsfläche ist gering. Die vorhandene Eingabevalidierung, die Ablehnung von `eval`/`new Function`/`document.write` und die ausschließliche Verwendung von `textContent` entsprechen einem defensiven Sicherheitsansatz.

| # | Schweregrad | Befund | Konkrete Abhilfe |
|---|---|---|---|
| 1 | niedrig | Es fehlt eine dokumentierte Sicherheits-/Aktualisierungsbeschreibung im Produktcode. Für ein Produkt mit digitalen Elementen sind dokumentierte Sicherheitseigenschaften und eine Aussage zur Update-/Patch-Fähigkeit sinnvoll bzw. nach CRA erwartbar. | In `README.md` oder einer neuen Datei `SECURITY.md` ergänzen: Scope des Produkts, Sicherheitsannahmen (rein lokal, keine Serverkommunikation), SBOM (Liste der enthaltenen Dateien, keine externen Abhängigkeiten), Meldeprozess für Schwachstellen und Aussage, dass Updates über das Deployment der statischen Dateien ausgeliefert werden. Diese Dokumentation muss bei einem echten Inverkehrbringen dem Stand des CRA entsprechen. |

**Positiv:**
- Keine externen Abhängigkeiten, kein Build-Artefakt, keine nachgeladenen Ressourcen.
- Validierung aller Import- und LocalStorage-Daten als unzuverlässige Eingaben.
- Kein evaluierender Code auf Nutzereingaben.

---

## 3. EU AI Act

**Befund:** Keine KI-Funktion vorhanden. Der AI Act ist auf diese Anwendung nicht anwendbar.

**Positiv:**
- Keine automatisierten Entscheidungsfindungen, kein Profiling, keine generative KI.

---

## 4. Pflichttexte und UI

**Befund:** Datenschutzerklärung und Impressum sind als eigene Abschnitte vorhanden und über die dauerhaft sichtbaren Footer-Links erreichbar. Ein Cookie-/Consent-Banner ist nicht erforderlich, da LocalStorage für die Kernfunktion unbedingt erforderlich ist und keine Cookies gesetzt werden.

| # | Schweregrad | Befund | Konkrete Abhilfe |
|---|---|---|---|
| 1 | hoch | Das Impressum enthält keine identitätsstiftenden Angaben. Es wird lediglich behauptet, es bestehe keine Impressumspflicht nach § 5 DDG. Sofern die Anwendung öffentlich erreichbar und geschäftsmäßig im Sinne des DDG ist, müssen Name, Anschrift und Kontaktmöglichkeit leicht erkennbar, unmittelbar erreichbar und ständig verfügbar sein. Der derzeitige Text wäre in diesem Fall unzureichend. | In `js/privacy.js` im Abschnitt „Impressum“ konkrete Anbieterangaben ergänzen: Name, Anschrift, E-Mail-Adresse, ggf. Vertretungsberechtigter. Falls tatsächlich keine Impressumspflicht bestehen sollte, muss dies belastbar begründet und durch eine eindeutige Identität des Herausgebers ergänzt werden. |
| 2 | niedrig | Die Datenschutzerklärung erwähnt nicht ausdrücklich die Rechtsgrundlage für die Nutzung von LocalStorage. Für die Nutzerfreundlichkeit und Rechtssicherheit kann die Ausnahme nach § 25 TDDG benannt werden. | In `js/privacy.js` im Abschnitt „2. Lokale Datenspeicherung“ einen Satz ergänzen, z. B.: „Die Speicherung im LocalStorage ist für die Bereitstellung der App technisch erforderlich; eine Einwilligung ist dafür nicht notwendig (§ 25 TDDG).“ |

**Positiv:**
- Footer-Links zu Datenschutz und Impressum sind von der Anwendung aus erreichbar.
- Ein Consent-Banner ist nicht erforderlich.
- Export- und Import-Funktionen sind vorhanden und weisen Bestätigungen auf.

---

## 5. Barrierefreiheit (WCAG / BITV / EAA)

**Befund:** Die Anwendung verwendet überwiegend semantisch sinnvolles HTML, Fokusindikatoren und ARIA-Attribute. Es bestehen jedoch Lücken bei der Zugänglichkeit wesentlicher Inhalte und bei sichtbaren Formularbeschriftungen.

| # | Schweregrad | Befund | Konkrete Abhilfe |
|---|---|---|---|
| 1 | mittel | Das Balkendiagramm ist ein `<canvas>` mit `aria-label`, vermittelt aber die konkreten Wochenwerte nicht an Screenreader oder andere assistive Technologien. Die Wochenübersicht ist damit für blinde Nutzer inhaltlich nicht zugänglich. | In `main.js` bzw. `js/views/chart.js` eine textuelle Alternative bereitstellen, z. B. unterhalb des Canvas eine versteckte oder sichtbare Liste/Tabelle mit den acht Wochen, Zeitraum und Prozentwert. Alternativ das Canvas durch eine zugängliche SVG-/HTML-Tabelle ersetzen, die die Daten als Text enthält. |
| 2 | mittel | Das Eingabefeld „Neue Gewohnheit…“ besitzt kein sichtbares `<label>`. Der Platzhalter ist kein Ersatz für eine Beschriftung, da er bei Eingabe verschwindet und für manche Nutzergruppen nicht ausreicht. | In `index.html` dem Formular ein sichtbares `<label for="habit-name">Neue Gewohnheit</label>` hinzufügen und das `aria-label`-Attribut des Inputs entfernen oder belassen, sofern doppelte Beschriftung vermieden wird. |
| 3 | niedrig | Bei leerem Namen wird beim Absenden lediglich der Fokus gesetzt; es gibt keine sichtbare Fehlermeldung oder textliche Rückmeldung. | In `main.js` im Submit-Handler bei leerem Namen eine sichtbare Fehlermeldung ergänzen, z. B. ein Element mit `role="alert"` neben dem Eingabefeld, das auf den leeren Namen hinweist und das Formularfeld klar als fehlerhaft kennzeichnet. |
| 4 | niedrig | Die Farbkontraste wurden nicht abschließend geprüft. Insbesondere `--color-muted` auf dunklem Hintergrund muss ausreichend sein. | In `styles.css` sicherstellen, dass alle Textfarben (z. B. `--color-muted`, `--color-fg`, `--color-accent`) mindestens ein Kontrastverhältnis von 4,5:1 gegenüber dem jeweiligen Hintergrund aufweisen. |

**Positiv:**
- Semantische HTML5-Elemente (`header`, `main`, `footer`, `section`, `article`).
- `role="group"`, `aria-pressed`, `role="switch"`, `aria-checked`, `aria-label` an interaktiven Elementen.
- Fokusindikatoren für Tastaturbedienung vorhanden.
- Dynamische Inhalte werden über `textContent` erzeugt und sind dadurch nicht ausführbar.

---

## Fazit

Die Anwendung weist keine fundamentalen datenschutzrechtlichen oder sicherheitstechnischen Verstöße auf. Es findet keine unzulässige Datenübertragung statt, personenbezogene Daten werden nicht protokolliert, und der defensive Umgang mit unzuverlässigen Eingaben ist vorbildlich umgesetzt. Die vorhandenen Mängel betreffen vor allem die inhaltliche Unvollständigkeit des Impressums und der Datenschutzerklärung sowie die Barrierefreiheit des Diagramms und der Formularbeschriftung. Diese Punkte sind durch gezielte Anpassungen behebbar und rechtfertigen daher keine Blockierung, aber Änderungen vor einer Marktfreigabe.