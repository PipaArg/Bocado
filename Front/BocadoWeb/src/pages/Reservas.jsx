import { useState } from "react";
import Blobs from "../components/Blobs.jsx";
import useTurnos from "../hooks/useTurnos.js";
import { useReservaForm } from "../hooks/useReservaForm.js";
import { iso, pasado, fechaLarga, emailOk } from "../lib/format.js";
import { HOY, DIAS, ALMUERZO, CENA, TITULOS, MAX_NOTA } from "../constants/reservas.js";
import css from "../styles/reservas.css?inline";

export default function Reservas() {
  const { turnos, setTurnos, error: errorCarga, recargar: cargar } = useTurnos();
  const demo = Boolean(errorCarga);
  const [lista, setLista] = useState(false);

  const {
    step, fecha, hora, comensales, setComensales,
    nombre, setNombre, apellido, setApellido, email, setEmail, telefono, setTelefono, nota, setNota,
    sending, error, creado,
    telOk, datosOk,
    next, back, elegirDia, elegirHora, reset, enviar
  } = useReservaForm(turnos, setTurnos, demo);

  const Pasos = [
    /* 0 · Fecha y hora */
    <>
      <div className="days" role="listbox" aria-label="Día">
        {DIAS.map((d) => {
          const v = iso(d);
          return (
              <button key={v} role="option" aria-selected={fecha === v} className={"day" + (fecha === v ? " on" : "")} onClick={() => elegirDia(v)}>
                <small>{d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</small>
                <b>{d.getDate()}</b>
              </button>
          );
        })}
      </div>
      <p className="sub">{fechaLarga(fecha)}</p>
      {[["Almuerzo", ALMUERZO], ["Cena", CENA]].map(([t, hs]) => (
          <div key={t} className="group">
            <h3>{t}</h3>
            <div className="chips">
              {hs.map((h) => (
                  <button key={h} disabled={fecha === HOY && pasado(h)} className={"chip" + (hora === h ? " on" : "")} onClick={() => elegirHora(h)}>{h}</button>
              ))}
            </div>
          </div>
      ))}
    </>,

    /* 1 · Comensales */
    <div className="center" key="step-1">
      <div className="stepper">
        <button aria-label="Menos" onClick={() => setComensales((n) => Math.max(1, n - 1))}>−</button>
        <output>{comensales}</output>
        <button aria-label="Más" onClick={() => setComensales((n) => Math.min(20, n + 1))}>+</button>
      </div>
      <p className="sub">{comensales === 1 ? "comensal" : "comensales"}</p>
      <button className="primary" onClick={next}>Continuar</button>
    </div>,

    /* 2 · Datos del cliente */
    <form className="form" key="step-2" onSubmit={(e) => { e.preventDefault(); if (datosOk) next(); }}>
      <div className="fields">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" autoComplete="given-name" aria-label="Nombre" />
        <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" autoComplete="family-name" aria-label="Apellido" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" aria-label="Email" />
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono (opcional)" type="tel" inputMode="tel" autoComplete="tel" aria-label="Teléfono" />
      </div>
      {email && !emailOk(email) && <p className="hint">Revisá el email, parece incompleto.</p>}
      {!telOk && <p className="hint">Revisá el teléfono, parece incompleto.</p>}
      <button className="primary" disabled={!datosOk}>Continuar</button>
    </form>,

    /* 3 · Nota */
    <div key="step-3">
      <div className="fields">
        <textarea
            value={nota}
            maxLength={MAX_NOTA}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Alergias, un cumpleaños, una mesa tranquila…"
            aria-label="Nota"
            rows={6}
        />
      </div>
      <p className="hint right">{nota.length}/{MAX_NOTA}</p>
      <button className="primary" onClick={next}>{nota.trim() ? "Continuar" : "Omitir"}</button>
    </div>,

    /* 4 · Confirmar */
    <div key="step-4">
      <dl className="summary">
        <div><dt>Día</dt><dd>{fechaLarga(fecha)}</dd></div>
        <div><dt>Hora</dt><dd>{hora}</dd></div>
        <div><dt>Mesa para</dt><dd>{comensales}</dd></div>
        <div><dt>Nombre</dt><dd>{nombre.trim()} {apellido.trim()}</dd></div>
        <div><dt>Email</dt><dd className="raw">{email.trim()}</dd></div>
        {telefono.trim() && <div><dt>Teléfono</dt><dd className="raw">{telefono.trim()}</dd></div>}
        {nota.trim() && <div><dt>Nota</dt><dd className="raw">{nota.trim()}</dd></div>}
      </dl>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="primary" disabled={sending} onClick={enviar}>{sending ? "Reservando…" : "Confirmar reserva"}</button>
    </div>,
  ];

  return (
      <div className="bz">
        <style>{css}</style>
        <Blobs />

        <div className="shell">
          <header className="top">
            <span className="logo">bocado</span>
            <div className="top-actions">
              <a className="pill about-link" href="#/sobre-nosotros">Sobre nosotros</a>
              <button className="pill" onClick={() => setLista(true)}>Turnos{turnos.length ? ` · ${turnos.length}` : ""}</button>
            </div>
          </header>

          {demo && (
              <p className="demo">Sin conexión al servidor. Modo demo: no se guarda nada. <button onClick={cargar}>Reintentar</button></p>
          )}

          <section className="card" aria-live="polite">
            {creado ? (
                <div className="ok">
                  <svg viewBox="0 0 52 52" width="84" height="84"><circle cx="26" cy="26" r="24" /><path d="M15 27l8 8 14-16" /></svg>
                  <h2>Turno #{creado.id} reservado</h2>
                  <p className="sub">{fechaLarga(creado.fecha)} · {String(creado.hora).slice(0, 5)} · {creado.cantidadComensales} {creado.cantidadComensales === 1 ? "persona" : "personas"}</p>
                  <button className="primary" onClick={reset}>Hacer otra reserva</button>
                </div>
            ) : (
                <>
                  <div className="bar">
                    <button className="back" onClick={back} disabled={step === 0} aria-label="Volver">‹</button>
                    <div className="prog">
                      {TITULOS.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}
                    </div>
                  </div>
                  <div className="track" style={{ transform: `translateX(-${step * 100}%)` }}>
                    {Pasos.map((p, i) => (
                        <div key={i} className={"pane" + (i === step ? " active" : "")}>
                          <h2>{TITULOS[i]}</h2>
                          {p}
                        </div>
                    ))}
                  </div>
                </>
            )}

            {lista && (
                <div className="sheet">
                  <div className="sheet-h"><h2>Turnos</h2><button className="pill" onClick={() => setLista(false)}>Cerrar</button></div>
                  {turnos.length === 0 ? <p className="sub">Todavía no hay turnos cargados.</p> : (
                      <ul>
                        {turnos.map((t) => (
                            <li key={t.id}>
                              <b>{String(t.hora).slice(0, 5)}</b>
                              <span className="grow">{fechaLarga(t.fecha)}<small>{t.clienteNombre ?? "Sin cliente"} · {t.cantidadComensales}</small></span>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>
            )}
          </section>
        </div>
      </div>
  );
}