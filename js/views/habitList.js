// Habit list rendering — implemented by Ticket 2.
//
// Renders one card per habit (name, 30-day checkin grid, streaks, week
// completion and action buttons) and wires the interactions that mutate a
// single habit (toggle checkin, rename, delete, archive/unarchive). All
// state-originated strings are inserted via `el()` (textContent) — never
// innerHTML.

import { el } from "../dom.js";
import { saveState } from "../store.js";
import {
  toggleCheckin,
  renameHabit,
  deleteHabit,
  currentStreak,
  longestStreak,
  weekCompletion,
} from "../habits.js";
import { archiveHabit, unarchiveHabit } from "../archive.js";

const GRID_DAYS = 30;

let stylesInjected = false;

function ensureStyles() {
  if (stylesInjected) {
    return;
  }
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
.habit-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
@media (max-width: 639px) {
  .habit-card { padding: var(--space-3); }
}
.habit-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.habit-card-name {
  font-size: 16px;
  font-weight: var(--heading-weight);
  margin: 0;
  margin-right: auto;
  overflow-wrap: anywhere;
}
.habit-card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-0);
  flex-shrink: 0;
}
.habit-action {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: 13px;
  cursor: pointer;
  min-height: 36px;
  padding: 0 var(--space-1);
  border-radius: var(--radius-md);
}
.habit-action:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}
.habit-action:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.habit-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin-top: var(--space-1);
  font-size: 13px;
  color: var(--color-muted);
}
.check-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--space-2);
}
.check-cell {
  appearance: none;
  width: 32px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-size: 12px;
  color: var(--color-muted);
  transition: background-color 0.15s ease, transform 0.1s ease;
}
@media (min-width: 640px) {
  .check-cell { width: 40px; }
}
.check-cell:hover { border-color: var(--color-accent); }
.check-cell:active { transform: scale(0.96); }
.check-cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.check-cell.is-checked {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #ffffff;
}
.check-cell-mark {
  font-size: 16px;
  line-height: 1;
  color: #ffffff;
}
`;
  document.head.appendChild(style);
}

function toDateIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The 30 days ending today, oldest first. */
function lastThirtyDays() {
  const days = [];
  const today = new Date();
  for (let i = GRID_DAYS - 1; i >= 0; i--) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push(toDateIso(day));
  }
  return days;
}

/** Keeps the sibling empty-state in sync after a habit count change. */
function syncEmptyState(state) {
  const emptyState = document.getElementById("empty-state");
  if (emptyState) {
    emptyState.hidden = state.habits.length > 0;
  }
}

function actionButton(label, action, id, onclick) {
  return el("button", {
    class: "habit-action",
    text: label,
    title: label,
    attrs: {
      type: "button",
      "data-action": action,
      "data-id": id,
      "aria-label": label,
    },
    onclick,
  });
}

function renderCheckCell(habit, dateIso, isChecked, onToggle) {
  const dayNumber = parseInt(dateIso.slice(8, 10), 10);
  const stateLabel = isChecked ? "erledigt" : "nicht erledigt";
  return el(
    "button",
    {
      class: isChecked ? "check-cell is-checked" : "check-cell",
      attrs: {
        type: "button",
        "data-date": dateIso,
        "aria-label": `${dateIso}: ${stateLabel}`,
        "aria-pressed": isChecked ? "true" : "false",
      },
      onclick: () => onToggle(dateIso),
    },
    isChecked
      ? el("span", { class: "check-cell-mark", text: "✓" })
      : el("span", { class: "check-cell-day", text: String(dayNumber) })
  );
}

function renderHabitCard(state, habit, container) {
  const card = el("article", { class: "habit-card" });

  const header = el("div", { class: "habit-card-header" });
  header.appendChild(el("h3", { class: "habit-card-name", text: habit.name }));

  const actions = el("div", { class: "habit-card-actions" });
  actions.appendChild(
    actionButton("Umbenennen", "rename", habit.id, () => {
      const newName = window.prompt("Neuer Name:", habit.name);
      if (newName !== null) {
        renameHabit(state, habit.id, newName);
        saveState(state);
        renderHabitList(state, container);
      }
    })
  );
  actions.appendChild(
    actionButton(
      habit.archived ? "Wiederherstellen" : "Archivieren",
      habit.archived ? "unarchive" : "archive",
      habit.id,
      () => {
        if (habit.archived) {
          unarchiveHabit(state, habit.id);
        } else {
          archiveHabit(state, habit.id);
        }
        saveState(state);
        renderHabitList(state, container);
        syncEmptyState(state);
      }
    )
  );
  actions.appendChild(
    actionButton("Löschen", "delete", habit.id, () => {
      const confirmed = window.confirm(
        `Gewohnheit „${habit.name}“ wirklich löschen?`
      );
      if (confirmed) {
        deleteHabit(state, habit.id);
        saveState(state);
        renderHabitList(state, container);
        syncEmptyState(state);
      }
    })
  );
  header.appendChild(actions);
  card.appendChild(header);

  const meta = el("div", { class: "habit-card-meta" });
  meta.appendChild(
    el("span", { class: "habit-meta-item", text: `Serie: ${currentStreak(habit)}` })
  );
  meta.appendChild(
    el("span", { class: "habit-meta-item", text: `Längste: ${longestStreak(habit)}` })
  );
  meta.appendChild(
    el("span", { class: "habit-meta-item", text: `Woche: ${weekCompletion(habit)}%` })
  );
  card.appendChild(meta);

  const grid = el("div", { class: "check-grid" });
  const checked = new Set(habit.checkins);
  for (const dateIso of lastThirtyDays()) {
    grid.appendChild(
      renderCheckCell(habit, dateIso, checked.has(dateIso), (date) => {
        toggleCheckin(habit, date);
        saveState(state);
        renderHabitList(state, container);
      })
    );
  }
  card.appendChild(grid);

  return card;
}

/**
 * Renders the habit list into `container`, respecting `state.ui.filter`
 * ("active", "archived" or "all").
 */
export function renderHabitList(state, container) {
  ensureStyles();
  container.textContent = "";

  const habits = state.habits.filter((habit) => {
    if (state.ui.filter === "archived") {
      return habit.archived;
    }
    if (state.ui.filter === "all") {
      return true;
    }
    return !habit.archived; // "active"
  });

  for (const habit of habits) {
    container.appendChild(renderHabitCard(state, habit, container));
  }
}
