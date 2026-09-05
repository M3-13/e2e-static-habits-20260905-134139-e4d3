// Privacy, legal sections and data deletion — implemented by Ticket 7.

import { el } from "./dom.js";

// Mirrors the storage key used by store.js. Both modules must agree on it so
// that "delete all data" really removes every habit, check-in and setting.
const STORAGE_KEY = "habits-tracker:v1";

/**
 * Fills the `#privacy` and `#imprint` sections with the Datenschutzerklärung
 * and the Impressum. The content is built entirely with `el()`/`textContent`,
 * never `innerHTML`, so nothing here can execute markup.
 *
 * @returns {void}
 */
export function renderLegalSections() {
  fillSection("privacy", "Datenschutzerklärung", [
    {
      title: "1. Verantwortliche Stelle",
      paragraphs: [
        "Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist der Betreiber dieser Anwendung. Da die Anwendung ausschließlich lokal im Browser des Nutzers ausgeführt wird, findet keine Auftragsverarbeitung durch einen externen Dienst statt.",
      ],
    },
    {
      title: "2. Lokale Datenspeicherung",
      paragraphs: [
        "Diese App speichert alle Daten ausschließlich lokal in deinem Browser (LocalStorage). Es werden keine Daten an einen Server übertragen und keine externen Ressourcen geladen. Deine Daten verlassen dein Gerät zu keinem Zeitpunkt.",
      ],
    },
    {
      title: "3. Verarbeitete Daten",
      paragraphs: [
        "Gespeichert werden die von dir angelegten Gewohnheiten (Name, Archivstatus), deine Check-Ins (Daten, an denen du eine Gewohnheit abgehakt hast) sowie deine Einstellungen (z. B. der gewählte Farbmodus und der aktive Filter).",
      ],
    },
    {
      title: "4. Zweck der Verarbeitung",
      paragraphs: [
        "Die Daten dienen ausschließlich dem Zweck des persönlichen Gewohnheits-Trackings, einschließlich der Berechnung von Serien und Wochenübersichten. Eine Auswertung zu anderen Zwecken findet nicht statt.",
      ],
    },
    {
      title: "5. Deine Rechte",
      paragraphs: [
        "Da alle Daten lokal bei dir liegen, hast du jederzeit die volle Kontrolle. Über die Funktion „Alle Daten löschen“ kannst du sämtliche gespeicherten Daten dauerhaft entfernen. Du kannst deine Daten außerdem jederzeit über die Export-Funktion sichern.",
      ],
    },
    {
      title: "6. Datenlöschung",
      paragraphs: [
        "Ein Löschvorgang entfernt Gewohnheiten, Check-Ins und Einstellungen unwiderruflich aus dem LocalStorage deines Browsers. Ein Wiederherstellen ist nach dem Löschen nicht möglich.",
      ],
    },
  ]);

  fillSection("imprint", "Impressum", [
    {
      title: "Angaben",
      paragraphs: [
        "Diese Anwendung ist ein rein lokales Werkzeug und wird nicht im Rahmen eines geschäftsmäßigen Tele- oder Mediendienstes betrieben. Es besteht daher keine Impressumspflicht im Sinne des § 5 Digitale-Dienste-Gesetz (DDG).",
        "Dennoch gilt: Verantwortlich für den Inhalt dieser Anwendung ist ihr Betreiber bzw. Herausgeber des Quellcodes.",
      ],
    },
    {
      title: "Haftung für Inhalte",
      paragraphs: [
        "Die Inhalte dieser Anwendung wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität wird jedoch keine Gewähr übernommen.",
      ],
    },
    {
      title: "Haftung für Links",
      paragraphs: [
        "Diese Anwendung enthält keine externen Links und lädt keine externen Ressourcen. Es werden keine Verbindungen zu Drittinhalten aufgebaut.",
      ],
    },
  ]);
}

/**
 * Rebuilds a legal section (`#privacy` or `#imprint`) from a heading and a
 * list of content blocks. All text is inserted via `textContent`.
 *
 * @param {string} id
 * @param {string} heading
 * @param {Array<{title?: string, paragraphs: string[]}>} blocks
 * @returns {void}
 */
function fillSection(id, heading, blocks) {
  const section = document.getElementById(id);
  if (!section) {
    return;
  }

  section.replaceChildren();
  section.appendChild(el("h2", { class: "section-title", text: heading }));

  for (const block of blocks) {
    if (block.title) {
      section.appendChild(el("h3", { class: "legal-heading", text: block.title }));
    }
    for (const paragraph of block.paragraphs) {
      section.appendChild(el("p", { class: "legal-text", text: paragraph }));
    }
  }
}

/**
 * Permanently removes all stored data (habits, check-ins and settings) from
 * LocalStorage after a short confirmation. The caller (main.js) reloads the
 * state and re-renders, which returns the app to its empty state.
 *
 * @returns {void}
 */
export function deleteAllData() {
  const confirmed = window.confirm(
    "Möchtest du wirklich alle gespeicherten Daten (Gewohnheiten, Check-Ins und Einstellungen) dauerhaft löschen? Dies kann nicht rückgängig gemacht werden."
  );

  if (!confirmed) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Storage may be unavailable (private mode) — nothing further to remove.
  }
}
