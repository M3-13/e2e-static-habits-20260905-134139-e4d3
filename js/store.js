import { createInitialState } from "./state.js";

const STORAGE_KEY = "habits-tracker:v1";

const FILTERS = ["active", "archived", "all"];
const THEMES = ["light", "dark"];

function isValidDateIso(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.toISOString().slice(0, 10) === value;
}

function isValidHabit(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
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
 * Reduces a validated habit to exactly the known fields of the contract
 * ({id, name, archived, checkins}) and de-duplicates its checkins. Any unknown
 * extra field coming from LocalStorage is discarded here, not just on save.
 *
 * @param {{id: string, name: string, archived: boolean, checkins: string[]}} habit
 * @returns {{id: string, name: string, archived: boolean, checkins: string[]}}
 */
function normalizeHabit(habit) {
  return {
    id: habit.id,
    name: habit.name,
    archived: habit.archived,
    checkins: Array.from(new Set(habit.checkins)),
  };
}

/**
 * Reads and validates the persisted state from LocalStorage (key
 * `habits-tracker:v1`). The entire payload is treated as untrusted: structure
 * and field types are checked, unknown fields are discarded, and any error
 * yields a fresh initial state.
 *
 * @returns {ReturnType<createInitialState>}
 */
export function loadState() {
  const state = createInitialState();

  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return state;
  }
  if (!raw) {
    return state;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return state;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return state;
  }

  if (Array.isArray(parsed.habits)) {
    state.habits = parsed.habits.filter(isValidHabit).map(normalizeHabit);
  }

  if (
    typeof parsed.settings === "object" &&
    parsed.settings !== null &&
    !Array.isArray(parsed.settings) &&
    THEMES.includes(parsed.settings.theme)
  ) {
    state.settings.theme = parsed.settings.theme;
  }

  if (
    typeof parsed.ui === "object" &&
    parsed.ui !== null &&
    !Array.isArray(parsed.ui) &&
    FILTERS.includes(parsed.ui.filter)
  ) {
    state.ui.filter = parsed.ui.filter;
  }

  return state;
}

/**
 * Persists the state. Only the known fields are written back out, so any
 * unknown extra field is dropped here as well.
 *
 * @param {ReturnType<createInitialState>} state
 * @returns {void}
 */
export function saveState(state) {
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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    // Storage may be full or blocked (private mode) — the app keeps running in-memory.
  }
}
