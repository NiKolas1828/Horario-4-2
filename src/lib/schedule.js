/**
 * Lógica del ciclo 4×2.
 *
 * El ciclo completo dura 6 días y, empezando por la primera noche, es:
 *   noche · noche · descanso · descanso · día · día
 *
 * La fecha "ancla" es el día en el que empieza el primer turno de noche.
 */

export const CYCLE = ["night", "night", "rest", "rest", "day", "day"];

export const SHIFTS = {
  day: {
    id: "day",
    label: "Turno de día",
    short: "Día",
    hours: "06:00 – 18:00",
    tagline: "12 horas de jornada diurna",
  },
  night: {
    id: "night",
    label: "Turno de noche",
    short: "Noche",
    hours: "18:00 – 06:00",
    tagline: "12 horas de jornada nocturna",
  },
  rest: {
    id: "rest",
    label: "Descanso",
    short: "Libre",
    hours: "Sin jornada",
    tagline: "Día libre para desconectar",
  },
};

const MS_DAY = 86_400_000;

const LONG_DATE = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const LONG_DATE_NO_YEAR = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const MONTH_YEAR = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

const WEEKDAY_SHORT = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const MONTH_SHORT = new Intl.DateTimeFormat("es-ES", { month: "short" });

function clean(value) {
  return value.replace(/\.$/, "");
}

export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date, amount) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

/** Diferencia en días entre `a` y `b` (a - b), sin problemas de horario ni DST. */
export function diffDays(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / MS_DAY);
}

export function cycleIndex(date, anchor) {
  return ((diffDays(date, anchor) % CYCLE.length) + CYCLE.length) % CYCLE.length;
}

export function shiftFor(date, anchor) {
  return CYCLE[cycleIndex(date, anchor)];
}

export function getCycleMeta(date, anchor) {
  const index = cycleIndex(date, anchor);
  return {
    shift: CYCLE[index],
    index,
    position: (index % 2) + 1,
    total: 2,
  };
}

/** Devuelve las celdas del mes, empezando en lunes. */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const start = addDays(first, -offset);

  return Array.from({ length: rows * 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, inMonth: date.getMonth() === month };
  });
}

export function getMonthStats(year, month, anchor) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const counts = { day: 0, night: 0, rest: 0 };

  for (let day = 1; day <= daysInMonth; day += 1) {
    counts[shiftFor(new Date(year, month, day), anchor)] += 1;
  }

  return {
    ...counts,
    hours: (counts.day + counts.night) * 12,
    daysInMonth,
  };
}

/** Primer día posterior a `date` en el que cambia el turno. */
export function getNextChange(date, anchor) {
  const current = shiftFor(date, anchor);

  for (let i = 1; i <= CYCLE.length; i += 1) {
    const nextDate = addDays(date, i);
    const nextShift = shiftFor(nextDate, anchor);
    if (nextShift !== current) {
      return { date: nextDate, shift: nextShift };
    }
  }

  return null;
}

export function getUpcoming(from, anchor, count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(from, i);
    return { date, shift: shiftFor(date, anchor) };
  });
}

function nextWorkStart(now, anchor) {
  const today = startOfDay(now);

  for (let i = 0; i <= 7; i += 1) {
    const date = addDays(today, i);
    const shift = shiftFor(date, anchor);
    if (shift === "rest") continue;

    const hour = shift === "day" ? 6 : 18;
    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
    );

    if (start > now) {
      return { date, shift, hour };
    }
  }

  return null;
}

function relativeDayLabel(date, today) {
  const diff = diffDays(date, today);
  if (diff === 0) return "hoy";
  if (diff === 1) return "mañana";
  return `el ${LONG_DATE_NO_YEAR.format(date).replace(",", "")}`;
}

/**
 * Estado del momento actual. Tiene en cuenta que el turno de noche
 * empieza un día a las 18:00 y termina al día siguiente a las 06:00.
 */
export function getNowState(now, anchor) {
  const today = startOfDay(now);
  const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const todayShift = shiftFor(today, anchor);
  const yesterdayShift = shiftFor(addDays(today, -1), anchor);

  // Noche empezada ayer y todavía en curso (00:00 – 06:00).
  if (hour < 6 && yesterdayShift === "night") {
    return {
      shift: "night",
      working: true,
      title: "Turno de noche en curso",
      detail: "Termina hoy a las 06:00",
    };
  }

  // Turno de día en curso.
  if (todayShift === "day" && hour >= 6 && hour < 18) {
    return {
      shift: "day",
      working: true,
      title: "Turno de día en curso",
      detail: "Termina hoy a las 18:00",
    };
  }

  // Noche de hoy ya empezada.
  if (todayShift === "night" && hour >= 18) {
    return {
      shift: "night",
      working: true,
      title: "Turno de noche en curso",
      detail: "Termina mañana a las 06:00",
    };
  }

  const next = nextWorkStart(now, anchor);
  const nextDetail = next
    ? `Próximo turno: ${next.shift === "day" ? "día" : "noche"}, ${relativeDayLabel(next.date, today)} a las ${String(next.hour).padStart(2, "0")}:00`
    : "";

  if (todayShift === "rest") {
    return {
      shift: "rest",
      working: false,
      title: "Día de descanso",
      detail: nextDetail,
    };
  }

  if (todayShift === "day") {
    return {
      shift: "day",
      working: false,
      title: hour < 6 ? "Hoy tienes turno de día" : "Turno de día finalizado",
      detail: nextDetail,
    };
  }

  return {
    shift: "night",
    working: false,
    title: "Hoy tienes turno de noche",
    detail: nextDetail,
  };
}

export function getRelativeLabel(date, today) {
  const diff = diffDays(date, today);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  if (diff > 1 && diff <= 6) return `En ${diff} días`;
  if (diff < -1 && diff >= -6) return `Hace ${Math.abs(diff)} días`;
  return null;
}

export function monthLabel(date) {
  return capitalize(MONTH_YEAR.format(date));
}

export function longDate(date) {
  return capitalize(LONG_DATE.format(date));
}

export function shortDate(date) {
  return clean(SHORT_DATE.format(date));
}

export function weekdayShort(date) {
  return clean(WEEKDAY_SHORT.format(date));
}

export function monthShort(date) {
  return clean(MONTH_SHORT.format(date));
}
