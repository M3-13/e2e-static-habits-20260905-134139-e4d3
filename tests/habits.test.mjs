import test from "node:test";
import assert from "node:assert/strict";
import {
  createHabit,
  renameHabit,
  deleteHabit,
  toggleCheckin,
  currentStreak,
  longestStreak,
  weekCompletion,
} from "../js/habits.js";

/** Local date string (YYYY-MM-DD) offset by `offset` days from today. */
function dateOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function freshState() {
  return { habits: [] };
}

test("createHabit trims the name, defaults archived and empty checkins", () => {
  const state = freshState();
  const habit = createHabit(state, "  Trinken  ");
  assert.equal(habit.name, "Trinken");
  assert.equal(habit.archived, false);
  assert.deepEqual(habit.checkins, []);
  assert.equal(typeof habit.id, "string");
  assert.ok(habit.id.length > 0);
  assert.equal(state.habits.length, 1);
});

test("createHabit rejects an empty name", () => {
  const state = freshState();
  assert.throws(() => createHabit(state, "   "));
  assert.throws(() => createHabit(state, ""));
});

test("createHabit caps the name at 50 characters", () => {
  const state = freshState();
  const habit = createHabit(state, "x".repeat(80));
  assert.equal(habit.name.length, 50);
});

test("renameHabit renames, trims, and ignores empty or unknown ids", () => {
  const state = freshState();
  const habit = createHabit(state, "Sport");
  renameHabit(state, habit.id, "  Lesen  ");
  assert.equal(habit.name, "Lesen");
  renameHabit(state, habit.id, "   ");
  assert.equal(habit.name, "Lesen");
  renameHabit(state, "nope", "Anders");
  assert.equal(habit.name, "Lesen");
});

test("deleteHabit removes the habit and ignores unknown ids", () => {
  const state = freshState();
  const habit = createHabit(state, "Sport");
  deleteHabit(state, habit.id);
  assert.equal(state.habits.length, 0);
  deleteHabit(state, "nope");
  assert.equal(state.habits.length, 0);
});

test("toggleCheckin adds then removes a date", () => {
  const habit = { id: "h", name: "X", archived: false, checkins: [] };
  const date = dateOffset(0);
  toggleCheckin(habit, date);
  assert.deepEqual(habit.checkins, [date]);
  toggleCheckin(habit, date);
  assert.deepEqual(habit.checkins, []);
});

test("currentStreak counts consecutive days ending today", () => {
  const habit = { checkins: [dateOffset(0), dateOffset(-1), dateOffset(-2)] };
  assert.equal(currentStreak(habit), 3);
});

test("currentStreak tolerates an un-checked today", () => {
  const habit = { checkins: [dateOffset(-1), dateOffset(-2)] };
  assert.equal(currentStreak(habit), 2);
});

test("currentStreak stops at the first gap", () => {
  const habit = { checkins: [dateOffset(0), dateOffset(-1), dateOffset(-3)] };
  assert.equal(currentStreak(habit), 2);
});

test("longestStreak finds the longest run across gaps", () => {
  const habit = {
    checkins: [
      dateOffset(0),
      dateOffset(-5),
      dateOffset(-6),
      dateOffset(-7),
      dateOffset(-8),
    ],
  };
  assert.equal(longestStreak(habit), 4);
});

test("longestStreak is zero for no checkins", () => {
  assert.equal(longestStreak({ checkins: [] }), 0);
});

test("weekCompletion matches checked days so far this week", () => {
  const today = new Date();
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const elapsed = daysSinceMonday + 1;

  const habit = { checkins: [dateOffset(0)] };
  assert.equal(weekCompletion(habit), Math.round((1 / elapsed) * 100));

  const full = {
    checkins: Array.from({ length: elapsed }, (_, i) => dateOffset(-i)),
  };
  assert.equal(weekCompletion(full), 100);
});
