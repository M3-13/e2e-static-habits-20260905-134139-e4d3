// Weekly bar chart rendering — implemented by Ticket 3.
//
// `renderChart(habit, canvas)` draws a bar chart of the last eight weeks onto a
// canvas element. The weekly fulfillment (number of check-ins out of 7 days) is
// computed here from `habit.checkins` (ISO date strings "YYYY-MM-DD"). Colors
// are read live from the CSS custom properties in `styles.css`, so the chart
// follows the current theme (light / dark) automatically.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS_TO_SHOW = 8;
const DAYS_PER_WEEK = 7;

/** Returns the Monday 00:00 (local) that starts the week containing `date`. */
function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday === 0
  d.setDate(d.getDate() - offset);
  return d;
}

/**
 * Parses an ISO date string "YYYY-MM-DD" into a local Date, or null when the
 * string is malformed or does not describe a real calendar day.
 */
function parseIso(dateIso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

function formatLabel(start) {
  return `${start.getDate()}.${start.getMonth() + 1}.`;
}

/**
 * Aggregates the check-ins into `WEEKS_TO_SHOW` buckets ending with the current
 * week. Returns an array (oldest -> newest) of
 * `{ start: Date, label: string, count: number }`.
 */
function computeWeeks(checkins) {
  const today = startOfWeek(new Date());
  const starts = [];
  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    starts.push(new Date(today.getTime() - i * WEEK_MS));
  }

  const counts = starts.map(() => 0);

  for (const iso of checkins) {
    const d = parseIso(iso);
    if (!d) {
      continue;
    }
    const start = startOfWeek(d).getTime();
    for (let i = 0; i < starts.length; i++) {
      if (starts[i].getTime() === start) {
        counts[i]++;
        break;
      }
    }
  }

  return starts.map((start, i) => ({
    start,
    label: formatLabel(start),
    count: counts[i],
  }));
}

function readColors(canvas) {
  const css = getComputedStyle(canvas);
  const get = (name) => css.getPropertyValue(name).trim() || undefined;
  return {
    fg: get("--color-fg"),
    muted: get("--color-muted"),
    accent: get("--color-accent"),
    border: get("--color-border"),
  };
}

/**
 * Draws the weekly bar chart for `habit` onto `canvas`.
 *
 * @param {{ checkins?: string[] }} habit
 * @param {HTMLCanvasElement} canvas
 */
export function renderChart(habit, canvas) {
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const checkins = habit && Array.isArray(habit.checkins) ? habit.checkins : [];
  const weeks = computeWeeks(checkins);

  const cssWidth = canvas.clientWidth || 300;
  const cssHeight = canvas.clientHeight || 160;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const colors = readColors(canvas);
  const fg = colors.fg || "#1a1d1f";
  const muted = colors.muted || "#6b7280";
  const accent = colors.accent || "#3e7b4f";
  const border = colors.border || "#e4e6e9";

  const padTop = 12;
  const padRight = 8;
  const padBottom = 28;
  const padLeft = 34;

  const plotW = cssWidth - padLeft - padRight;
  const plotH = cssHeight - padTop - padBottom;

  ctx.font = '11px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;

  // Y axis + horizontal gridlines at 0 / 50 / 100 %.
  const yTicks = [0, 0.5, 1];
  ctx.textAlign = "right";
  for (const ratio of yTicks) {
    const y = padTop + plotH - ratio * plotH;
    ctx.strokeStyle = border;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(cssWidth - padRight, y);
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.fillText(`${Math.round(ratio * 100)}%`, padLeft - 6, y);
  }

  // Bars + week labels.
  const slotW = plotW / WEEKS_TO_SHOW;
  const barW = Math.max(4, slotW * 0.55);

  ctx.textAlign = "center";
  weeks.forEach((week, i) => {
    const centerX = padLeft + slotW * i + slotW / 2;
    const ratio = Math.min(1, week.count / DAYS_PER_WEEK);
    const barH = ratio * plotH;
    const barX = centerX - barW / 2;
    const barY = padTop + plotH - barH;

    if (barH > 0) {
      ctx.fillStyle = accent;
      ctx.fillRect(barX, barY, barW, barH);
    }

    // Percentage above each bar.
    const pct = Math.round(ratio * 100);
    ctx.fillStyle = week.count > 0 ? accent : muted;
    ctx.fillText(`${pct}%`, centerX, barY - 8);

    // Week label (Monday of that week) below the axis.
    ctx.fillStyle = muted;
    ctx.fillText(week.label, centerX, padTop + plotH + 12);
  });
}
