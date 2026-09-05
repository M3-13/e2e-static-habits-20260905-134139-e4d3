// Habit domain logic — implemented by Ticket 2.
// These signatures are part of the shared sprint contract.

export function createHabit(state, name) {}

export function renameHabit(state, id, name) {}

export function deleteHabit(state, id) {}

export function toggleCheckin(habit, dateIso) {}

export function currentStreak(habit) {}

export function longestStreak(habit) {}

export function weekCompletion(habit) {}
