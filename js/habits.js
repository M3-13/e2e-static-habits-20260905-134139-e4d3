// Habit domain logic — implemented by Ticket 2.
// These signatures are part of the shared sprint contract.

const MAX_NAME_LENGTH = 50;

function generateId() {
  if (typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    "habit-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Trims the name and caps it at MAX_NAME_LENGTH. Returns "" for non-string
 * or empty-after-trim input so callers can validate cheaply.
 */
function normalizeName(name) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  return trimmed.slice(0, MAX_NAME_LENGTH);
}

/** Local date (YYYY-MM-DD) of a Date instance — used for both checkins and the grid. */
function toDateIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days since the Unix epoch for a YYYY-MM-DD string (UTC, DST-safe). */
function toDayNumber(dateIso) {
  const parts = dateIso.split("-").map(Number);
  return Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000;
}

/**
 * Creates a new habit and pushes it onto `state.habits`.
 * The name is trimmed and limited to 50 characters; an empty name throws.
 *
 * @returns {object} the newly created habit
 */
export function createHabit(state, name) {
  const normalized = normalizeName(name);
  if (!normalized) {
    throw new Error("Gewohnheitsname darf nicht leer sein.");
  }
  const habit = {
    id: generateId(),
    name: normalized,
    archived: false,
    checkins: [],
  };
  state.habits.push(habit);
  return habit;
}

/**
 * Renames the habit with the given id. No-op for an empty name or unknown id.
 */
export function renameHabit(state, id, name) {
  const normalized = normalizeName(name);
  if (!normalized) {
    return;
  }
  const habit = state.habits.find((h) => h.id === id);
  if (!habit) {
    return;
  }
  habit.name = normalized;
}

/**
 * Removes the habit with the given id from the state. No-op if not found.
 */
export function deleteHabit(state, id) {
  const index = state.habits.findIndex((h) => h.id === id);
  if (index === -1) {
    return;
  }
  state.habits.splice(index, 1);
}

/**
 * Toggles a checkin: adds the date if absent, removes it if present.
 */
export function toggleCheckin(habit, dateIso) {
  if (!Array.isArray(habit.checkins)) {
    habit.checkins = [];
  }
  const index = habit.checkins.indexOf(dateIso);
  if (index === -1) {
    habit.checkins.push(dateIso);
  } else {
    habit.checkins.splice(index, 1);
  }
}

/**
 * Consecutive checked days ending today (or yesterday, if today is not yet
 * checked, so an unfinished today does not break the streak).
 */
export function currentStreak(habit) {
  const checkins = new Set(habit.checkins);
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!checkins.has(toDateIso(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (checkins.has(toDateIso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Longest run of consecutive checked days across the whole checkin history.
 */
export function longestStreak(habit) {
  if (!habit.checkins || habit.checkins.length === 0) {
    return 0;
  }
  const days = [...new Set(habit.checkins)].map(toDayNumber).sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] + 1) {
      run += 1;
      if (run > longest) {
        longest = run;
      }
    } else {
      run = 1;
    }
  }
  return longest;
}

/**
 * Completion percentage (0–100) of the current week (Monday start): checked
 * days so far this week divided by the days elapsed this week.
 */
export function weekCompletion(habit) {
  const checkins = new Set(habit.checkins);
  const today = new Date();
  const daysSinceMonday = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - daysSinceMonday
  );

  const elapsed = daysSinceMonday + 1; // Monday .. today inclusive
  if (elapsed === 0) {
    return 0;
  }

  let checked = 0;
  for (let i = 0; i < elapsed; i++) {
    const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    if (checkins.has(toDateIso(day))) {
      checked += 1;
    }
  }
  return Math.round((checked / elapsed) * 100);
}
