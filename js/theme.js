// Dark mode theme handling — implemented by Ticket 4.

import { saveState } from "./store.js";

const THEME_ATTRIBUTE = "data-theme";
const THEME_TOGGLE_ID = "theme-toggle";

/**
 * Applies a theme to the document root. The color scheme itself is switched
 * purely through the CSS variables behind the `[data-theme="dark"]` selector,
 * so setting the attribute on `<html>` is the whole visual switch.
 *
 * @param {"light"|"dark"} theme
 * @returns {void}
 */
function applyTheme(theme) {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

/**
 * Keeps the switch control's `aria-checked` state in sync with the active
 * theme so the knob position and the screen-reader state follow the actual
 * color scheme.
 *
 * @param {"light"|"dark"} theme
 * @returns {void}
 */
function syncToggle(theme) {
  const toggle = document.getElementById(THEME_TOGGLE_ID);
  if (toggle) {
    toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }
}

/**
 * Applies the persisted theme from `state.settings.theme` on load.
 *
 * @param {{ settings: { theme: string } }} state
 * @returns {void}
 */
export function initTheme(state) {
  const theme = state.settings.theme === "dark" ? "dark" : "light";
  applyTheme(theme);
  syncToggle(theme);
}

/**
 * Flips the theme between `light` and `dark`, updates the state and persists
 * the choice so it survives a reload.
 *
 * @param {{ settings: { theme: string } }} state
 * @returns {void}
 */
export function toggleTheme(state) {
  const next = state.settings.theme === "dark" ? "light" : "dark";
  state.settings.theme = next;
  applyTheme(next);
  syncToggle(next);
  saveState(state);
}
