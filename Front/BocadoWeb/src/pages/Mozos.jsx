import { useState } from "react";
import Blobs from "../components/Blobs.jsx";
import { useMozos } from "../hooks/useMozos.js";
import { ESTADO, EVENTOS, NOTAS } from "../constants/mozos.js";
import css from "../styles/mozos.css?inline";

// Subcomponentes de vistas
import LoginView from "../components/mozos/LoginView.jsx";
import MesasView from "../components/mozos/MesasView.jsx";
import MesaView from "../components/mozos/MesaView.jsx";
import MenuView from "../components/mozos/MenuView.jsx";
import ItemsView from "../components/mozos/ItemsView.jsx";

export default function Mozos() {
  const mozosState = useMozos();
  const {
    mozo, offline, vista, setVista, sheet, setSheet,
    usuario, setUsuario, clave, setClave, err, login, salir,
    dni, dq, setDq, dev, setDev, dh, setDh, guardarDatos,
    notaId, dn, setDn, guardarNota, carrito, mias, pendientes
  } = mozosState;

  const categoriaActual = mozosState.menu.find((categoria) => String(categoria.id) === String(mozosState.cat));
  const titulo = vista === "mesas" ? (mozo ? `Hola, ${mozo.nombre}` : "Turnos") : vista === "mesa" ? `Mesa ${mozosState.mesa?.num}` : vista === "menu" ? "Agregar platos" : categoriaActual?.nombre ?? "Platos";

  return (
      <div className="bz">
        <style>{css}</style>
        <Blobs />
        <div className="shell">
          <header className="top">
            <span className="logo">bocado <em>mozos</em></span>
            {mozo && (
                <button className="avatar" onClick={() => setSheet("perfil")} aria-label="Perfil">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
                </button>
            )}
          </header>

          <section className="card">
            {vista !== "login" && offline && (
                <div className="net off" role="status">Sin conexión con la API.</div>
            )}
            {vista !== "login" && (
                <div className="bar">
                  <button className="back" onClick={mozosState.volver} aria-label="Volver" style={{ visibility: vista === "mesas" && mozo ? "hidden" : "visible" }}>‹</button>
                  <h1 className="title">{titulo}</h1>
                  {vista === "mesa" && <span className={"badge " + ESTADO[mozosState.est(mozosState.mesa)].cls}>{ESTADO[mozosState.est(mozosState.mesa)].label}</span>}
                </div>
            )}
            <div className="view" key={vista + (mozosState.cat ?? "")}>
              {vista === "login" && <LoginView usuario={usuario} setUsuario={setUsuario} clave={clave} setClave={setClave} err={err} login={login} />}
              {vista === "mesas" && <MesasView {...mozosState} />}
              {vista === "mesa" && <MesaView {...mozosState} />}
              {vista === "menu" && <MenuView {...mozosState} />}
              {vista === "items" && <ItemsView {...mozosState} />}
            </div>

            {sheet === "perfil" && (
                <div className="sheet perfil">
                  <span className="avatar big-av">
                    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
                  </span>
                  <h2>{mozo.nombre}</h2>
                  <p className="sub">@{mozo.usuario} · {mozo.nivel}</p>
                  <div className="stats">
                    <span className="chip gris">{mias.length} mesas</span>
                    <span className="chip reservada">{pendientes} reservas pendientes</span>
                  </div>
                  <button className="primary" onClick={salir}>Cerrar sesión</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cerrar</button>
                </div>
            )}

            {sheet === "nota" && (
                <div className="sheet">
                  <h2>Nota del plato</h2>
                  <p className="sub">{carrito.find((p) => p.id === notaId)?.nombre}</p>
                  <div className="fields">
                    <input value={dn} onChange={(e) => setDn(e.target.value)} placeholder="Ej: sin cebolla" maxLength={80} aria-label="Nota" />
                  </div>
                  <div className="chips-row">
                    {NOTAS.map((n) => (
                        <button key={n} className={"cb" + (dn.includes(n.toLowerCase()) || dn === n ? " on" : "")} onClick={() => setDn(dn ? (dn.toLowerCase().includes(n.toLowerCase()) ? dn : `${dn}, ${n.toLowerCase()}`) : n)}>{n}</button>
                    ))}
                  </div>
                  <button className="primary" onClick={guardarNota}>Guardar nota</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cancelar</button>
                </div>
            )}

            {(sheet === "datos" || sheet === "abrir") && mozosState.mesa && (
                <div className="sheet">
                  <h2>{sheet === "abrir" ? `Abrir mesa ${mozosState.mesa.num}` : "Datos de la mesa"}</h2>
                  <div className="fields">
                    <input value={dq} onChange={(e) => setDq(e.target.value)} placeholder="¿A nombre de quién?" aria-label="Quién" />
                    <input value={dev} onChange={(e) => setDev(e.target.value)} placeholder="Evento (opcional)" aria-label="Evento" />
                    <label><span>Hora de inicio</span><input type="time" value={dh} onChange={(e) => setDh(e.target.value)} /></label>
                  </div>
                  <div className="chips-row">
                    {EVENTOS.map((ev) => {
                      const v = ev === "Sin evento" ? "" : ev;
                      return <button key={ev} className={"cb" + (dev === v ? " on" : "")} onClick={() => setDev(v)}>{ev}</button>;
                    })}
                  </div>
                  <button className="primary" onClick={guardarDatos}>{sheet === "abrir" ? "Abrir mesa" : "Guardar"}</button>
                  <button className="sec" onClick={() => setSheet(null)}>Cancelar</button>
                </div>
            )}
          </section>
        </div>
      </div>
  );
}