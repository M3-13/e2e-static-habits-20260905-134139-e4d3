// Archiving, unarchiving and filtering — implemented by Ticket 5.

import { saveState } from "./store.js";
import { renderHabitList } from "./views/habitList.js";

const FILTERS = ["active", "archived", "all"];

function findHabit(state, id) {
  return state.habits.find((habit) => habit.id === id);
}

/**
 * Marks the habit with `id` as archived and persists the state.
 *
 * @param {ReturnType<import("./state.js").createInitialState>} state
 * @param {string} id
 * @returns {void}
 */
export function archiveHabit(state, id) {
  const habit = findHabit(state, id);
  if (!habit) {
    return;
  }
  habit.archived = true;
  saveState(state);
}

/**
 * Restores the habit with `id` (clears its archived flag) and persists the
 * state.
 *
 * @param {ReturnType<import("./state.js").createInitialState>} state
 * @param {string} id
 * @returns {void}
 */
export function unarchiveHabit(state, id) {
  const habit = findHabit(state, id);
  if (!habit) {
    return;
  }
  habit.archived = false;
  saveState(state);
}

/**
 * Sets the active view filter to one of `"active"`, `"archived"` or `"all"`
 * and re-renders the habit list so only the matching habits are shown.
 * Invalid values are ignored.
 *
 * @param {ReturnType<import("./state.js").createInitialState>} state
 * @param {string} filter
 * @returns {void}
 */
export function applyFilter(state, filter) {
  if (!FILTERS.includes(filter)) {
    return;
  }
  state.ui.filter = filter;

  const container = document.getElementById("habit-list");
  if (container) {
    renderHabitList(state, container);
  }
}
