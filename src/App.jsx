import { useEffect, useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import Sidebar from "./components/Sidebar";
import { CalendarIcon } from "./components/Icons";
import {
  SHIFTS,
  capitalize,
  getNowState,
  parseISO,
  startOfDay,
  startOfMonth,
  toISO,
} from "./lib/schedule";

const DEFAULT_ANCHOR = "2026-10-31";
const STORAGE_KEY = "mi-turno-4x2-anchor";

const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const HEADER_DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function readAnchor() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)
      ? stored
      : DEFAULT_ANCHOR;
  } catch {
    return DEFAULT_ANCHOR;
  }
}

export default function App() {
  const [anchorISO, setAnchorISO] = useState(readAnchor);
  const [now, setNow] = useState(() => new Date());
  const [selectedISO, setSelectedISO] = useState(() => toISO(new Date()));
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, anchorISO);
    } catch {
      // Si el navegador bloquea localStorage, la app sigue funcionando.
    }
  }, [anchorISO]);

  const anchor = useMemo(() => parseISO(anchorISO), [anchorISO]);
  const today = useMemo(() => startOfDay(now), [now]);
  const todayISO = toISO(today);
  const nowState = useMemo(() => getNowState(now, anchor), [now, anchor]);
  const selectedDate = useMemo(() => parseISO(selectedISO), [selectedISO]);

  function handleSelect(date) {
    setSelectedISO(toISO(date));
    if (
      date.getMonth() !== viewDate.getMonth() ||
      date.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(startOfMonth(date));
    }
  }

  function goToToday() {
    setSelectedISO(todayISO);
    setViewDate(startOfMonth(today));
  }

  function changeMonth(offset) {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  }

  function handleAnchorChange(iso) {
    if (!iso) return;
    setAnchorISO(iso);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <CalendarIcon size={25} />
          </div>
          <div className="brand-text">
            <h1>
              Mi Turno <span className="brand-badge">4×2</span>
            </h1>
            <p>Calendario de turnos rotativos</p>
          </div>
        </div>

        <div className="now-block">
          <div
            className={`status-pill shift-${nowState.shift} ${nowState.working ? "is-live" : ""}`}
          >
            <span className="dot" />
            {SHIFTS[nowState.shift].label}
          </div>
          <div className="now-time">
            <span className="clock">{TIME_FORMAT.format(now)}</span>
            <span className="now-date">
              {capitalize(HEADER_DATE_FORMAT.format(now))}
            </span>
          </div>
        </div>
      </header>

      <main className="layout">
        <Calendar
          viewDate={viewDate}
          selectedISO={selectedISO}
          todayISO={todayISO}
          anchor={anchor}
          filter={filter}
          onFilterChange={setFilter}
          onSelect={handleSelect}
          onPrev={() => changeMonth(-1)}
          onNext={() => changeMonth(1)}
          onToday={goToToday}
        />

        <Sidebar
          nowState={nowState}
          selectedDate={selectedDate}
          today={today}
          anchor={anchor}
          anchorISO={anchorISO}
          onAnchorChange={handleAnchorChange}
          onResetAnchor={() => setAnchorISO(DEFAULT_ANCHOR)}
        />
      </main>

      <footer className="footer">
        <span>Ciclo 4×2 · 2 días · 2 noches · 2 descansos</span>
        <span>Hecho para no volver a dudar del turno.</span>
      </footer>
    </div>
  );
}
