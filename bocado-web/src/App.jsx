import { useEffect, useState } from "react";

/* ───────── Config ───────── */
// Cambiá esta URL por la de tu backend (en Vite podés usar import.meta.env.VITE_API_URL)
const API = "http://localhost:8080";
const EP = {
  listarTurnos: "/api/turnos/listarTurnos",
  crearTurno: "/api/turnos/crearTurno",
  crearCliente: "/api/clientes/crearCliente",
};

const api = async (path, opts) => {
  const r = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) {
    let msg = `Error ${r.status}`;
    try { const j = await r.json(); msg = j.message || j.error || msg; } catch {}
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json();
};

/* ───────── Helpers ───────── */
const iso = (d) => d.toLocaleDateString("en-CA");
const HOY = iso(new Date());
const DIAS = Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
const slots = (from, to) => {
  const out = [];
  for (let m = from * 60; m <= to * 60; m += 60)
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
};
const ALMUERZO = slots(12, 15);
const CENA = slots(20, 23.5);
const pasado = (h) => {
  const n = new Date();
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm <= n.getHours() * 60 + n.getMinutes();
};
const fechaLarga = (f) =>
    f ? new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "";
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e.trim());

const TITULOS = ["¿Qué día y a qué hora?", "¿Cuántos van a ser?", "¿Quién reserva?", "¿Querés dejar una nota?", "Revisá y confirmá"];
const MAX_NOTA = 255;

/* ───────── App ───────── */
export default function App() {
  const [turnos, setTurnos] = useState([]);
  const [demo, setDemo] = useState(false);
  const [lista, setLista] = useState(false);

  const [step, setStep] = useState(0);
  const [fecha, setFecha] = useState(HOY);
  const [hora, setHora] = useState("");
  const [comensales, setComensales] = useState(2);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [nota, setNota] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(null);

  const cargar = async () => {
    try { setTurnos(await api(EP.listarTurnos)); setDemo(false); }
    catch { setTurnos([]); setDemo(true); }
  };
  useEffect(() => { cargar(); }, []);

  const datosOk = nombre.trim().length > 1 && apellido.trim().length > 1 && emailOk(email);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const elegirDia = (d) => {
    setFecha(d);
    if (d === HOY && hora && pasado(hora)) setHora("");
  };
  const elegirHora = (h) => { setHora(h); setTimeout(next, 220); };

  const reset = () => {
    setStep(0); setFecha(HOY); setHora(""); setComensales(2);
    setNombre(""); setApellido(""); setEmail(""); setNota(""); setCreado(null); setError("");
  };

  const enviar = async () => {
    setSending(true); setError("");
    try {
      // 1) Se da de alta el cliente siempre (sin chequear si ya existe)
      const datosCliente = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() };
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
      </div>
      {email && !emailOk(email) && <p className="hint">Revisá el email, parece incompleto.</p>}
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
        {nota.trim() && <div><dt>Nota</dt><dd className="raw">{nota.trim()}</dd></div>}
      </dl>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="primary" disabled={sending} onClick={enviar}>{sending ? "Reservando…" : "Confirmar reserva"}</button>
    </>,
  ];

  return (
      <div className="bz">
        <style>{css}</style>
        <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />

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

/* ───────── Estilos ───────── */
const css = `
.bz{--ink:#1d1d1f;--mute:#6e6e73;--blue:#0a84ff;--glass:rgba(255,255,255,.5);--edge:rgba(255,255,255,.75);
  min-height:100vh;position:relative;overflow:hidden;color:var(--ink);
  font:16px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",system-ui,sans-serif;
  background:linear-gradient(160deg,#dfe9ff,#f3e6ff 55%,#ffe7ef);display:grid;place-items:center;padding:24px 16px}
.bz *{box-sizing:border-box}
.bz button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.bz :is(button,input,textarea):focus-visible{outline:3px solid #0a84ff80;outline-offset:2px}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.75;pointer-events:none}
.b1{width:380px;height:380px;background:#7db4ff;top:-90px;left:-70px}
.b2{width:340px;height:340px;background:#ff9fc4;bottom:-80px;right:-40px}
.b3{width:260px;height:260px;background:#8ee8c0;bottom:18%;left:12%;opacity:.55}
@media(prefers-reduced-motion:no-preference){.b1{animation:drift 18s ease-in-out infinite alternate}@keyframes drift{to{transform:translate(70px,50px)}}}
.shell{position:relative;width:100%;max-width:440px}
.top{display:flex;justify-content:space-between;align-items:center;margin:0 6px 14px}
.logo{font-weight:700;font-size:24px;letter-spacing:-.04em}
.pill{background:var(--glass)!important;backdrop-filter:blur(20px);border:1px solid var(--edge)!important;padding:7px 16px;border-radius:999px;font-size:14px;font-weight:500}
.demo{margin:0 6px 12px;font-size:13px;color:var(--mute)}.demo button{color:var(--blue);font-weight:600}
.card{position:relative;overflow:hidden;height:min(660px,calc(100vh - 130px));min-height:520px;border-radius:38px;
  background:var(--glass);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
  border:1px solid var(--edge);box-shadow:0 30px 80px -24px rgba(50,70,140,.4),inset 0 1px 0 rgba(255,255,255,.9)}
.bar{display:flex;align-items:center;gap:12px;padding:22px 22px 0}
.back{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.65)!important;font-size:24px;line-height:1;padding-bottom:3px;transition:opacity .2s}
.back:disabled{opacity:0;pointer-events:none}
.prog{flex:1;display:flex;gap:6px;margin-right:46px}
.prog i{flex:1;height:4px;border-radius:4px;background:rgba(0,0,0,.1);transition:background .4s}
.prog i.on{background:var(--ink)}
.track{display:flex;height:calc(100% - 56px);transition:transform .55s cubic-bezier(.32,.72,0,1)}
.pane{flex:0 0 100%;padding:22px 24px 26px;overflow-y:auto;visibility:hidden;transition:visibility 0s .55s;display:flex;flex-direction:column;gap:14px}
.pane.active{visibility:visible;transition:none}
.pane h2{font-size:30px;line-height:1.1;font-weight:700;letter-spacing:-.03em;margin:0 0 4px}
.sub{color:var(--mute);margin:0;text-transform:capitalize}
.group h3{font-size:13px;font-weight:600;color:var(--mute);margin:6px 0 8px}
.chips{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.chip{padding:11px 0;border-radius:14px;background:rgba(255,255,255,.6)!important;font-weight:500;font-variant-numeric:tabular-nums;transition:transform .15s,background .2s}
.chip:active{transform:scale(.95)}
.chip:disabled{opacity:.3;cursor:not-allowed}
.chip.on{background:var(--ink)!important;color:#fff}
.days{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:none;scroll-snap-type:x proximity}
.days::-webkit-scrollbar{display:none}
.day{flex:0 0 58px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;border-radius:18px;background:rgba(255,255,255,.55)!important;scroll-snap-align:start;transition:background .2s}
.day small{font-size:12px;color:var(--mute);text-transform:capitalize}
.day b{font-size:22px;font-weight:600;letter-spacing:-.02em}
.day.on{background:var(--blue)!important;color:#fff}.day.on small{color:#ffffffcc}
.center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.center .primary{margin-top:auto}
.stepper{display:flex;align-items:center;gap:22px;margin-top:auto}
.stepper button{width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.65)!important;font-size:30px;font-weight:300;transition:transform .15s}
.stepper button:active{transform:scale(.9)}
.stepper output{font-size:120px;line-height:1;font-weight:700;letter-spacing:-.06em;min-width:1.2ch;text-align:center;animation:pop .25s}
@keyframes pop{from{transform:scale(.88);opacity:.4}}
.form{flex:1;display:flex;flex-direction:column;gap:10px}
.fields{display:flex;flex-direction:column;gap:1px;border-radius:20px;overflow:hidden;background:rgba(0,0,0,.06)}
.fields input,.fields textarea{width:100%;border:0;background:rgba(255,255,255,.7);padding:16px 18px;font:inherit;font-size:17px;color:var(--ink);resize:none;display:block}
.fields input::placeholder,.fields textarea::placeholder{color:#8e8e93}
.fields input:focus,.fields textarea:focus{outline:none;background:#fff}
.hint{margin:0;font-size:13px;color:var(--mute)}.hint.right{text-align:right}
.primary{width:100%;padding:16px;border-radius:999px;background:var(--ink)!important;color:#fff!important;font-weight:600;font-size:17px;margin-top:auto;transition:transform .15s,opacity .2s}
.primary:active{transform:scale(.98)}.primary:disabled{opacity:.4;cursor:not-allowed}
.summary{margin:0;border-radius:20px;background:rgba(255,255,255,.65);padding:4px 16px}
.summary div{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #0000000f}
.summary div:last-child{border:0}
.summary dt{color:var(--mute);flex:none}.summary dd{margin:0;font-weight:600;text-align:right;text-transform:capitalize;overflow-wrap:anywhere}
.summary dd.raw{text-transform:none}
.err{margin:0;padding:10px 14px;border-radius:14px;background:rgba(255,59,48,.12);color:#b3261e;font-size:14px}
.ok{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px;text-align:center}
.ok h2{font-size:30px;letter-spacing:-.03em;margin:8px 0 0}
.ok .primary{margin-top:28px}
.ok circle{fill:#30d158;stroke:none}
.ok path{fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:draw .5s .15s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.sheet{position:absolute;inset:0;padding:24px;background:rgba(255,255,255,.78);backdrop-filter:blur(30px);overflow-y:auto;animation:up .4s cubic-bezier(.32,.72,0,1)}
@keyframes up{from{transform:translateY(100%)}}
.sheet-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sheet h2{font-size:30px;letter-spacing:-.03em;margin:0}
.sheet ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.sheet li{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.7)}
.sheet li b{font-size:20px;letter-spacing:-.02em}
.grow{flex:1;display:flex;flex-direction:column;text-transform:capitalize}
.grow small{font-size:13px;color:var(--mute)}
`;
