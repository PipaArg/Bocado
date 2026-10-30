import { useState } from "react";
import Blobs from "../components/Blobs.jsx";
import useTurnos from "../hooks/useTurnos.js";
import { api, API, EP } from "../lib/api.js";
import { iso, pasado, fechaLarga, emailOk } from "../lib/format.js";
import { HOY, DIAS, ALMUERZO, CENA, TITULOS, MAX_NOTA } from "../data/reservas.js";
import css from "../styles/reservas.css?inline";

export default function Reservas() {
  const { turnos, setTurnos, error: errorCarga, recargar: cargar } = useTurnos();
  const demo = Boolean(errorCarga);
  const [lista, setLista] = useState(false);

  const [step, setStep] = useState(0);
  const [fecha, setFecha] = useState(HOY);
  const [hora, setHora] = useState("");
  const [comensales, setComensales] = useState(2);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(null);

  const telOk = !telefono.trim() || telefono.replace(/\D/g, "").length >= 8;
  const datosOk = nombre.trim().length > 1 && apellido.trim().length > 1 && emailOk(email) && telOk;

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const elegirDia = (d) => {
    setFecha(d);
    if (d === HOY && hora && pasado(hora)) setHora("");
  };
  const elegirHora = (h) => { setHora(h); setTimeout(next, 220); };

  const reset = () => {
    setStep(0); setFecha(HOY); setHora(""); setComensales(2);
    setNombre(""); setApellido(""); setEmail(""); setTelefono(""); setNota(""); setCreado(null); setError("");
  };

  const enviar = async () => {
    setSending(true); setError("");
    try {
      // 1) Se da de alta el cliente siempre (sin chequear si ya existe)
      const datosCliente = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim(), telefono: telefono.trim() || null };
      const cli = demo
          ? { id: Math.floor(Math.random() * 900 + 100), ...datosCliente }
          : await api(EP.crearCliente, { method: "POST", body: JSON.stringify(datosCliente) });
      // 2) Se crea el turno apuntando a ese cliente (TurnoRequest usa clienteId)
      const body = {
        fecha, hora, cantidadComensales: comensales,
        clienteId: cli.id,
        nota: nota.trim() || null,
      };
      const res = demo
          ? { ...body, id: Math.floor(Math.random() * 900 + 100), clienteNombre: `${cli.nombre} ${cli.apellido}` }
          : await api(EP.crearTurno, { method: "POST", body: JSON.stringify(body) });
      setCreado(res);
      setTurnos((t) => [res, ...t]);
    } catch (err) {
      setError(/fetch|network/i.test(err.message)
          ? "No se pudo conectar con el servidor. Revisá que la API esté corriendo y que CORS permita este origen."
          : err.message);
    }
    setSending(false);
  };

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
    <div className="center">
      <div className="stepper">
        <button aria-label="Menos" onClick={() => setComensales((n) => Math.max(1, n - 1))}>−</button>
        <output key={comensales}>{comensales}</output>
        <button aria-label="Más" onClick={() => setComensales((n) => Math.min(20, n + 1))}>+</button>
      </div>
      <p className="sub">{comensales === 1 ? "comensal" : "comensales"}</p>
      <button className="primary" onClick={next}>Continuar</button>
    </div>,

    /* 2 · Datos del cliente */
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (datosOk) next(); }}>
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
    <>
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
    </>,

    /* 4 · Confirmar */
    <>
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
    </>,
  ];

  return (
      <div className="bz">
        <style>{css}</style>
        <Blobs />

        <div className="shell">
          <header className="top">
            <span className="logo">bocado</span>
            <button className="pill" onClick={() => setLista(true)}>Turnos{turnos.length ? ` · ${turnos.length}` : ""}</button>
          </header>

          {demo && (
              <p className="demo">Sin conexión a {API}. Modo demo: no se guarda nada. <button onClick={cargar}>Reintentar</button></p>
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
