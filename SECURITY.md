VERDICT: CHANGES_REQUESTED

## Prüfumfang

Manuell geprüft wurden der sichtbare Quelltext von `index.html`, `main.js` sowie `js/*.js` und `js/views/*.js`. Bandit, pip-audit, npm audit und semgrep sind für den Projekttyp `web-static` nicht anwendbar; daher liegen keine Scanner-Ergebnisse vor. Das Fehlen von Scanner-Output ist keine Schwachstelle. Gekürzt dargestellte Dateireste wurden nur nach ihrem sichtbaren Inhalt beurteilt.

## Kurzcheck der Security-Anforderungen

- Keine Hardcoded Secrets, Passwörter, Token oder URLs gefunden.
- Keine Nutzung von `innerHTML`, `insertAdjacentHTML` oder ähnlich HTML-interpretierenden APIs für unzuverlässige Daten; Text wird über `textContent`/`createTextNode` eingefügt.
- Keine Verwendung von `eval`, `new Function` oder `document.write`.
- Keine Netzwerkrequests, externen Ressourcen oder WebSockets erkennbar.
- LocalStorage-Ladepfad validiert Struktur, Typen und echte Kalenderdaten.
- Export/Import, Löschfunktion, Dark-Mode und rechtliche Abschnitte sind vorhanden.

## Befunde

### 1. Import validiert Kalenderdaten nicht als echte Datumswerte

- **Schweregrad:** medium
- **Betroffene Datei/Stelle:** `js/importExport.js`, Funktion `isValidDateIso`
- **Beschreibung:**  
  `DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/` erlaubt Werte wie `2024-99-99` oder `2024-02-31`. Solche Werte bestehen die Importvalidierung, werden gespeichert und an die Serien-/Wochenberechnung übergeben. JavaScripts `Date`-Konstruktor normalisiert solche Eingaben stillschweigend, was zu falschen Serien, Quoten und Chartwerten führen kann. Eine Codeausführung entsteht dadurch nicht, aber die Importvalidierung ist schwächer als die LocalStorage-Validierung in `js/store.js`.
- **Konkrete Behebung:**  
  `isValidDateIso` an die bereits vorhandene, strikte Prüfung aus `js/store.js` angleichen:
  ```js
  function isValidDateIso(value) {
    if (typeof value !== "string" || !DATE_ISO_RE.test(value)) {
      return false;
    }
    const date = new Date(value + "T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  ```

### 2. Importierte Datensätze werden nicht auf bekannte Felder normalisiert

- **Schweregrad:** low
- **Betroffene Datei/Stelle:** `js/importExport.js`, `isValidHabit` und `importData`
- **Beschreibung:**  
  `isValidHabit` akzeptiert `name` als beliebigen String, einschließlich `""` oder sehr langer Werte. `importData` übernimmt mit `state.habits = parsed.habits` die geparsten Objekte direkt. Unbekannte Zusatzfelder und nicht normalisierte Werte bleiben dadurch im Zustand erhalten. Das widerspricht dem Ansatz aus `js/store.js`, wo `normalizeHabit` unbekannte Felder verwirft. Es entsteht kein XSS, da das Rendering `textContent` nutzt, aber die App-Logik und Darstellung können durch manipulierte Importe gestört werden.
- **Konkrete Behebung:**  
  Eine gemeinsame Normalisierungsfunktion aus `js/store.js` exportieren und auch für Importe verwenden. Zusätzlich in `isValidHabit` prüfen:
  ```js
  if (typeof value.name !== "string" || value.name.trim() === "") {
    return false;
  }
  ```
  Optional die Länge auf 50 Zeichen begrenzen. Anschließend in `importData`:
  ```js
  state.habits = parsed.habits.map(normalizeHabit);
  ```

### 3. Fehlende Content Security Policy als Defense-in-Depth

- **Schweregrad:** low
- **Betroffene Datei/Stelle:** `index.html`
- **Beschreibung:**  
  Der Code verhindert derzeit XSS durch konsequentes `textContent`-Rendering. Eine CSP ist nicht vorhanden. Für eine statische App ohne externe Ressourcen wäre eine CSP eine sinnvolle Härtung gegen künftige Fehler. Sie muss so formuliert werden, dass das von der App selbst erzeugte Inline-`<style>`-Element aus `js/views/habitList.js` weiter funktioniert.
- **Konkrete Behebung:**  
  Im `<head>` ergänzen:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; base-uri 'none'; form-action 'self'"
  />
  ```
  `'unsafe-inline'` für `style-src` ist hier erforderlich, weil das Produkt zur Laufzeit ein `<style>`-Element mit `textContent` erzeugt. Skripte bleiben auf `'self'` beschränkt, da keine Inline-Skripte genutzt werden.