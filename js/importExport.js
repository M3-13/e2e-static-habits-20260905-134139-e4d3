import { el } from "./dom.js";

const THEMES = ["light", "dark"];
const FILTERS = ["active", "archived", "all"];
const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDateIso(value) {
  return typeof value === "string" && DATE_ISO_RE.test(value);
}

function isValidHabit(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.id !== "string" || value.id === "") {
    return false;
  }
  if (typeof value.name !== "string") {
    return false;
  }
  if (typeof value.archived !== "boolean") {
    return false;
  }
  if (!Array.isArray(value.checkins)) {
    return false;
  }
  return value.checkins.every(isValidDateIso);
}

/**
 * Validates an untrusted JSON payload before it may replace the current
 * data. Accepts only a plain object with a `habits` array whose fields match
 * the expected types. Any deviation makes the whole payload invalid.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidImport(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  if (!Array.isArray(value.habits)) {
    return false;
  }
  return value.habits.every(isValidHabit);
}

/**
 * Serializes the full data set to a JSON file and triggers a download.
 *
 * @param {ReturnType<typeof import("./state.js").createInitialState>} state
 * @returns {void}
 */
export function exportData(state) {
  const snapshot = {
    habits: state.habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      archived: habit.archived,
      checkins: Array.isArray(habit.checkins) ? habit.checkins.slice() : [],
    })),
    settings: { theme: state.settings.theme },
    ui: { filter: state.ui.filter },
  };

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = el("a", {
    attrs: { href: url, download: "habits-tracker.json" },
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Parses and validates a JSON import. If the data is invalid, the import is
 * aborted and the existing data is left untouched. If it is valid, the user
 * is asked to confirm before the data set is replaced.
 *
 * @param {string} jsonText
 * @param {ReturnType<typeof import("./state.js").createInitialState>} state
 * @returns {boolean} true when the data was replaced, false otherwise
 */
export function importData(jsonText, state) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return false;
  }

  if (!isValidImport(parsed)) {
    return false;
  }

  const count = parsed.habits.length;
  const confirmed = window.confirm(
    `${count} Gewohnheit(en) werden importiert und ersetzen den aktuellen Bestand. Fortfahren?`
  );
  if (!confirmed) {
    return false;
  }

  state.habits = parsed.habits;

  if (isPlainObject(parsed.settings) && THEMES.includes(parsed.settings.theme)) {
    state.settings.theme = parsed.settings.theme;
  }
  if (isPlainObject(parsed.ui) && FILTERS.includes(parsed.ui.filter)) {
    state.ui.filter = parsed.ui.filter;
  }

  return true;
}
