// Weekly bar chart rendering — implemented by Ticket 3.
//
// `renderChart(habit, canvas)` draws a bar chart of the last eight weeks onto a
// canvas element. The weekly fulfillment (number of check-ins out of 7 days) is
// computed here from `habit.checkins` (ISO date strings "YYYY-MM-DD"). Colors
// are read live from the CSS custom properties in `styles.css`, so the chart
// follows the current theme (light / dark) automatically.
//
// Geometry follows DESIGN.md "CanvasChart": 8 evenly distributed bars with a
// bar width of ~16px and a gap of ~20px, accent fill proportional to the weekly
// quota, faint horizontal gridlines (muted @ 20%), 11px muted week + percent
// labels and a 13px muted empty-state hint.

const WEEKS_TO_SHOW = 8;
const DAYS_PER_WEEK = 7;

const BAR_WIDTH = 16;
const BAR_GAP = 20;

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
 *
 * Week starts are advanced with calendar arithmetic (`setDate`), not fixed
 * millisecond offsets, so a DST transition cannot shift a generated week start
 * off its local Monday 00:00.
 */
function computeWeeks(checkins) {
  const today = startOfWeek(new Date());
  const starts = [];
  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    const s = new Date(today.getTime());
    s.setDate(s.getDate() - 7 * i);
    starts.push(s);
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
  };
}

/** Converts a "#rrggbb" hex string to `rgba(r, g, b, alpha)`; passthrough otherwise. */
function withAlpha(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) {
    return hex;
  }
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const muted = colors.muted || "#6b7280";
  const accent = colors.accent || "#3e7b4f";

  ctx.font = '11px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;

  const padTop = 12;
  const padRight = 8;
  const padBottom = 28;
  const padLeft = 34;

  const plotW = cssWidth - padLeft - padRight;
  const plotH = cssHeight - padTop - padBottom;

  // Empty state: centered 13px muted hint instead of an empty chart.
  const totalCheckins = weeks.reduce((sum, w) => sum + w.count, 0);
  if (totalCheckins === 0) {
    ctx.font = '13px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = muted;
    ctx.textAlign = "center";
    ctx.fillText("Noch keine Einträge", cssWidth / 2, cssHeight / 2);
    return;
  }

  // 8 evenly distributed bars, ~16px wide with ~20px gap, centered.
  let barWidth = BAR_WIDTH;
  let barGap = BAR_GAP;
  let chartW = WEEKS_TO_SHOW * barWidth + (WEEKS_TO_SHOW - 1) * barGap;
  if (chartW > plotW) {
    const scale = plotW / chartW;
    barWidth = Math.max(2, Math.floor(barWidth * scale));
    barGap = Math.floor(barGap * scale);
    chartW = WEEKS_TO_SHOW * barWidth + (WEEKS_TO_SHOW - 1) * barGap;
  }
  const pitch = barWidth + barGap;
  const offsetX = padLeft + (plotW - chartW) / 2;

  // Y axis + faint horizontal gridlines (muted @ 20%) at 0 / 50 / 100 %.
  const gridColor = withAlpha(muted, 0.2);
  ctx.textAlign = "right";
  for (const ratio of [0, 0.5, 1]) {
    const y = padTop + plotH - ratio * plotH;
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(cssWidth - padRight, y);
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.fillText(`${Math.round(ratio * 100)}%`, padLeft - 6, y);
  }

  // Bars, percent labels and week labels.
  ctx.textAlign = "center";
  weeks.forEach((week, i) => {
    const centerX = offsetX + pitch * i + barWidth / 2;
    const ratio = Math.min(1, week.count / DAYS_PER_WEEK);
    const barH = ratio * plotH;
    const barX = centerX - barWidth / 2;
    const barY = padTop + plotH - barH;

    if (barH > 0) {
      ctx.fillStyle = accent;
      ctx.fillRect(barX, barY, barWidth, barH);
    }

    // Percentage above each bar.
    if (week.count > 0) {
      ctx.fillStyle = muted;
      ctx.fillText(`${Math.round(ratio * 100)}%`, centerX, barY - 8);
    }

    // Week label (Monday of that week) below the axis.
    ctx.fillStyle = muted;
    ctx.fillText(week.label, centerX, padTop + plotH + 12);
  });
}
