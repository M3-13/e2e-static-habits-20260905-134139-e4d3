import { loadState, saveState } from "./js/store.js";
import { createHabit } from "./js/habits.js";
import { renderHabitList } from "./js/views/habitList.js";
import { renderChart } from "./js/views/chart.js";
import { initTheme, toggleTheme } from "./js/theme.js";
import { applyFilter } from "./js/archive.js";
import { exportData, importData } from "./js/importExport.js";
import { deleteAllData, renderLegalSections } from "./js/privacy.js";

let state = loadState();

const form = document.getElementById("create-form");
const nameInput = document.getElementById("habit-name");
const habitList = document.getElementById("habit-list");
const emptyState = document.getElementById("empty-state");
const chart = document.getElementById("chart");
const importFile = document.getElementById("import-file");

/**
 * Re-renders every view from the single source of truth (`state`).
 * The empty state is shown whenever there are no habits.
 */
function render() {
  renderHabitList(state, habitList);

  if (emptyState) {
    emptyState.hidden = state.habits.length > 0;
  }

  if (chart && state.habits.length > 0) {
    renderChart(state.habits[0], chart);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  createHabit(state, name);
  saveState(state);
  nameInput.value = "";
  render();
});

document.addEventListener("click", (event) => {
  const filterEl = event.target.closest("[data-filter]");
  if (filterEl) {
    const filter = filterEl.getAttribute("data-filter");
    applyFilter(state, filter);
    saveState(state);
    render();
    return;
  }

  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) {
    return;
  }
  const action = actionEl.getAttribute("data-action");

  switch (action) {
    case "toggle-theme":
      toggleTheme(state);
      saveState(state);
      break;
    case "focus-create":
      nameInput.focus();
      break;
    case "export":
      exportData(state);
      break;
    case "import":
      if (importFile) {
        importFile.click();
      }
      break;
    case "delete-all":
      deleteAllData();
      state = loadState();
      render();
      break;
    default:
      break;
  }
});

if (importFile) {
  importFile.addEventListener("change", () => {
    const file = importFile.files && importFile.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const ok = importData(text, state);
      if (ok) {
        saveState(state);
        render();
      }
    };
    reader.onerror = () => {
      importFile.value = "";
    };
    reader.readAsText(file);
    importFile.value = "";
  });
}

// Initial render: theme, legal sections, list, empty state and chart.
initTheme(state);
renderLegalSections();
render();
