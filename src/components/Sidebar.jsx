import {
  CYCLE,
  SHIFTS,
  addDays,
  getCycleMeta,
  getNextChange,
  getRelativeLabel,
  getUpcoming,
  longDate,
  monthShort,
  shiftFor,
  shortDate,
  toISO,
  weekdayShort,
} from "../lib/schedule";
import { ShiftIcon } from "./Icons";

export default function Sidebar({
  nowState,
  selectedDate,
  today,
  anchor,
  anchorISO,
  onAnchorChange,
  onResetAnchor,
}) {
  const meta = getCycleMeta(selectedDate, anchor);
  const info = SHIFTS[meta.shift];
  const nextChange = getNextChange(selectedDate, anchor);
  const nextDay = addDays(selectedDate, 1);
  const nextDayShift = shiftFor(nextDay, anchor);
  const upcoming = getUpcoming(today, anchor, 7);
  const relative = getRelativeLabel(selectedDate, today);
  const todayISO = toISO(today);

  return (
    <aside className="sidebar" aria-label="Resumen y detalles">
      <section className={`card now-card tint-${nowState.shift}`}>
        <div className="card-head">
          <span className="eyebrow">Ahora mismo</span>
          <span
            className={`live-indicator ${nowState.working ? "is-working" : ""}`}
          >
            <span className="live-dot" />
            {nowState.working ? "En jornada" : "Fuera de jornada"}
          </span>
        </div>

        <div className="now-main">
          <div className={`now-icon shift-${nowState.shift}`}>
            <ShiftIcon shift={nowState.shift} size={26} />
          </div>
          <div>
            <h3>{nowState.title}</h3>
            <p>{nowState.detail}</p>
          </div>
        </div>
      </section>

      <section className="card detail-card">
        <div className="card-head">
          <span className="eyebrow">Día seleccionado</span>
          {relative && <span className="chip-soft">{relative}</span>}
        </div>

        <h3 className="detail-date">{longDate(selectedDate)}</h3>

        <div className={`detail-badge shift-${meta.shift}`}>
          <div className="detail-icon">
            <ShiftIcon shift={meta.shift} size={22} />
          </div>
          <div className="detail-badge-text">
            <strong>{info.label}</strong>
            <span>{info.tagline}</span>
          </div>
          <span className="detail-pos">
            {info.short} {meta.position}/{meta.total}
          </span>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Horario</dt>
            <dd>{info.hours}</dd>
          </div>
          <div>
            <dt>En el ciclo</dt>
            <dd>
              {info.short} {meta.position} de {meta.total}
            </dd>
          </div>
          <div>
            <dt>Día siguiente</dt>
            <dd>
              {SHIFTS[nextDayShift].label} · {shortDate(nextDay)}
            </dd>
          </div>
          <div>
            <dt>Próximo cambio</dt>
            <dd>
              {nextChange
                ? `${SHIFTS[nextChange.shift].label} · ${shortDate(nextChange.date)}`
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="card upcoming-card">
        <div className="card-head">
          <span className="eyebrow">Próximos 7 días</span>
          <span className="card-hint">desde hoy</span>
        </div>

        <ul className="upcoming-list">
          {upcoming.map(({ date, shift }) => {
            const iso = toISO(date);
            const isToday = iso === todayISO;

            return (
              <li key={iso} className={isToday ? "is-today" : ""}>
                <div className="up-date">
                  <span className="up-weekday">{weekdayShort(date)}</span>
                  <span className="up-day">{date.getDate()}</span>
                  <span className="up-month">{monthShort(date)}</span>
                </div>
                {isToday && <span className="up-today">Hoy</span>}
                <span className={`up-badge shift-${shift}`}>
                  <ShiftIcon shift={shift} size={13} />
                  {SHIFTS[shift].short}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card config-card">
        <div className="card-head">
          <span className="eyebrow">Ciclo y configuración</span>
        </div>

        <div className="cycle-sequence" aria-label="Orden del ciclo">
          {CYCLE.map((shift, index) => (
            <span key={`${shift}-${index}`} className={`seq shift-${shift}`}>
              <ShiftIcon shift={shift} size={13} />
              {SHIFTS[shift].short}
            </span>
          ))}
        </div>

        <p className="config-copy">
          Tu ciclo se repite cada 6 días. Indica la fecha en la que empezó tu
          primer turno de noche y el calendario se recalcula solo.
        </p>

        <label className="date-field">
          <span>Primer turno de noche</span>
          <input
            type="date"
            value={anchorISO}
            onChange={(event) => onAnchorChange(event.target.value)}
          />
        </label>

        <div className="config-actions">
          <button type="button" className="ghost-btn" onClick={onResetAnchor}>
            Volver al inicio original
          </button>
        </div>
      </section>
    </aside>
  );
}
