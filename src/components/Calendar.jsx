import { useMemo } from "react";
import {
  SHIFTS,
  buildMonthGrid,
  getMonthStats,
  monthLabel,
  shiftFor,
  toISO,
} from "../lib/schedule";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ShiftIcon,
} from "./Icons";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FILTERS = [
  { id: "day", label: "Días" },
  { id: "night", label: "Noches" },
  { id: "rest", label: "Libres" },
];

export default function Calendar({
  viewDate,
  selectedISO,
  todayISO,
  anchor,
  filter,
  onFilterChange,
  onSelect,
  onPrev,
  onNext,
  onToday,
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const stats = useMemo(
    () => getMonthStats(year, month, anchor),
    [year, month, anchor],
  );

  return (
    <section className="card calendar-card" aria-label="Calendario de turnos">
      <div className="calendar-toolbar">
        <div>
          <p className="eyebrow">Calendario</p>
          <h2 className="month-title">{monthLabel(viewDate)}</h2>
        </div>

        <div className="toolbar-actions">
          {filter && (
            <button
              type="button"
              className="clear-filter"
              onClick={() => onFilterChange(null)}
            >
              Quitar filtro
            </button>
          )}
          <div className="month-nav">
            <button
              type="button"
              className="icon-btn"
              onClick={onPrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="today-btn" onClick={onToday}>
              Hoy
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={onNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="stats" role="group" aria-label="Resumen del mes">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`stat shift-${id} ${filter === id ? "is-active" : ""}`}
            onClick={() => onFilterChange(filter === id ? null : id)}
            aria-pressed={filter === id}
            title={`Resaltar ${label.toLowerCase()} en el calendario`}
          >
            <span className="stat-dot" />
            <span className="stat-label">{label}</span>
            <strong>{stats[id]}</strong>
          </button>
        ))}

        <div className="stat hours" title="Horas de trabajo en el mes">
          <Clock size={15} />
          <span className="stat-label">Horas</span>
          <strong>{stats.hours} h</strong>
        </div>
      </div>

      <p className="stats-hint">
        Toca Días, Noches o Libres para resaltarlos en el calendario.
      </p>

      <div className="weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div
        className="days-grid"
        role="grid"
        aria-label={`Turnos de ${monthLabel(viewDate)}`}
      >
        {cells.map(({ date, inMonth }) => {
          const iso = toISO(date);
          const shift = shiftFor(date, anchor);
          const info = SHIFTS[shift];
          const isToday = iso === todayISO;
          const isSelected = iso === selectedISO;
          const isDimmed = Boolean(filter && filter !== shift);

          const className = [
            "day",
            `shift-${shift}`,
            inMonth ? "" : "is-outside",
            isToday ? "is-today" : "",
            isSelected ? "is-selected" : "",
            isDimmed ? "is-dimmed" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={className}
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={`${date.getDate()} de ${monthLabel(date)}, ${info.label}${isToday ? ", hoy" : ""}`}
            >
              <span className="day-num">{date.getDate()}</span>
              <span className={`day-tag shift-${shift}`}>
                <span className="tag-dot" />
                <span className="tag-text">{info.short}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="calendar-note">
        <ShiftIcon shift="night" size={14} />
        <span>
          El turno de noche empieza el día marcado a las 18:00 y termina al día
          siguiente a las 06:00.
        </span>
      </p>
    </section>
  );
}
