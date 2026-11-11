import { useCallback, useEffect, useState } from "react";
import css from "../styles/administracion.css?inline";

import { listarUsuarios } from "../services/usuarios/listarUsuarios";
import { crearUsuario } from "../services/usuarios/crearUsuario";
import { actualizarUsuario } from "../services/usuarios/actualizarUsuario";
import { listarCategoria } from "../services/categorias/listarCategoria";
import { crearCategoria } from "../services/categorias/crearCategoria";
import { actualizarCategoria } from "../services/categorias/actualizarCategoria";
import { eliminarCategoria as eliminarCategoriaService } from "../services/categorias/eliminarCategoria";
import { listarPlatos } from "../services/platos/listarPlatos";
import { crearPlato } from "../services/platos/crearPlato";
import { listarMesas } from "../services/mesas/listarMesas";
import { crearMesa } from "../services/mesas/crearMesa";
import { actualizarMesa } from "../services/mesas/actualizarMesa";
import { activarMesa } from "../services/mesas/activarMesa";
import { desactivarMesa } from "../services/mesas/desactivarMesa";
import { actualizarPlato } from "../services/platos/actualizarPlato";

const usuarioVacio = { usuario: "", nombre: "", apellido: "", clave: "", nivel: "MOZO", activo: true };
const categoriaVacia = { nombre: "", emoji: "" };
const platoVacio = { nombre: "", descripcion: "", precio: "", categoriaId: "" };
const mesaVacia = { numero: "", capacidad: "", mozoId: "" };

const obtenerDatos = () => Promise.all([
  listarUsuarios(),
  listarCategoria(),
  listarPlatos(),
  listarMesas(),
]);

export default function Administracion() {
  const [seccion, setSeccion] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [usuarioForm, setUsuarioForm] = useState(usuarioVacio);
  const [categoriaForm, setCategoriaForm] = useState(categoriaVacia);
  const [platoForm, setPlatoForm] = useState(platoVacio);
  const [mesaForm, setMesaForm] = useState(mesaVacia);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const mozosActivos = usuarios.filter((u) => u.nivel === "MOZO" && u.activo);

  const cargar = useCallback(async () => {
    try {
      const [listaUsuarios, listaCategorias, listaPlatos, listaMesas] = await obtenerDatos();
      setUsuarios(listaUsuarios);
      setCategorias(listaCategorias);
      setPlatos(listaPlatos);
      setMesas(listaMesas);
    } catch (err) {
      throw new Error(`No se pudieron cargar los datos: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    obtenerDatos().then(([listaUsuarios, listaCategorias, listaPlatos, listaMesas]) => {
      if (!vigente) return;
      setUsuarios(listaUsuarios);
      setCategorias(listaCategorias);
      setPlatos(listaPlatos);
      setMesas(listaMesas);
    }).catch((err) => {
      if (vigente) setError(`No se pudieron cargar los datos: ${err.message}`);
    }).finally(() => {
      if (vigente) setCargando(false);
    });
    return () => { vigente = false; };
  }, []);

  const ejecutar = async (accion, mensaje) => {
    setOcupado(true);
    setError("");
    setAviso("");
    try {
      await accion();
      setAviso(mensaje);
      setEditando(null);
      setUsuarioForm(usuarioVacio);
      setCategoriaForm(categoriaVacia);
      setPlatoForm(platoVacio);
      setMesaForm(mesaVacia);
      try {
        await cargar();
      } catch (err) {
        setError(`${mensaje} No se pudo actualizar la lista: ${err.message}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const guardarUsuario = (event) => {
    event.preventDefault();
    const editId = editando?.tipo === "usuario" ? editando.id : null;
    const body = { ...usuarioForm };
    if (editId && !body.clave) delete body.clave;
    if (!editId) delete body.activo;

    const accion = editId
        ? () => actualizarUsuario(editId, body)
        : () => crearUsuario(body);

    ejecutar(accion, editId ? "Usuario actualizado." : "Usuario creado.");
  };

  const guardarCategoria = (event) => {
    event.preventDefault();
    const editId = editando?.tipo === "categoria" ? editando.id : null;
    const accion = editId
        ? () => actualizarCategoria(editId, categoriaForm)
        : () => crearCategoria(categoriaForm);

    ejecutar(accion, editId ? "Categoría actualizada." : "Categoría creada.");
  };

  const guardarPlato = (event) => {
    event.preventDefault();
    const editId = editando?.tipo === "plato" ? editando.id : null;
    const body = {
      ...platoForm,
      precio: Number(platoForm.precio),
      categoriaId: Number(platoForm.categoriaId),
    };

    const accion = editId
        ? () =>  actualizarPlato(editId, body)
        : () => crearPlato(body);

    ejecutar(accion, editId ? "Plato actualizado." : "Plato creado.");
  };

  const guardarMesa = (event) => {
    event.preventDefault();
    const editId = editando?.tipo === "mesa" ? editando.id : null;
    const body = {
      numero: Number(mesaForm.numero),
      capacidad: Number(mesaForm.capacidad),
      mozoId: mesaForm.mozoId ? Number(mesaForm.mozoId) : null,
    };

    const accion = editId
        ? () => actualizarMesa(editId, body)
        : () => crearMesa(body);

    ejecutar(accion, editId ? "Mesa actualizada." : "Mesa creada.");
  };

  const editarUsuario = (u) => {
    setEditando({ tipo: "usuario", id: u.id });
    setUsuarioForm({ usuario: u.usuario, nombre: u.nombre, apellido: u.apellido, clave: "", nivel: u.nivel, activo: u.activo });
  };
  const editarPlato = (p) => {
    setEditando({ tipo: "plato", id: p.id });
    setPlatoForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio,
      categoriaId: p.categoriaId,
    });
  };
  const editarCategoria = (c) => {
    setEditando({ tipo: "categoria", id: c.id });
    setCategoriaForm({ nombre: c.nombre, emoji: c.emoji || "" });
  };
  const editarMesa = (m) => {
    setEditando({ tipo: "mesa", id: m.id });
    setMesaForm({ numero: m.numero, capacidad: m.capacidad, mozoId: m.mozoId || "" });
  };
  const cancelarEdicion = () => {
    setEditando(null);
    setUsuarioForm(usuarioVacio);
    setCategoriaForm(categoriaVacia);
    setPlatoForm(platoVacio);
    setMesaForm(mesaVacia);
  };

  const cambiarEstadoUsuario = (u) => ejecutar(() => actualizarUsuario(u.id, {
    usuario: u.usuario, nombre: u.nombre, apellido: u.apellido, nivel: u.nivel, activo: !u.activo
  }), `Usuario ${u.activo ? "desactivado" : "activado"}.`);

  const cambiarEstadoMesa = (m) => {
    const accion = m.activa ? () => desactivarMesa(m.id) : () => activarMesa(m.id);
    ejecutar(accion, `Mesa ${m.activa ? "desactivada" : "activada"}.`);
  };

  const eliminarCategoria = (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    ejecutar(() => eliminarCategoriaService(categoria.id), "Categoría eliminada.");
  };

  const formUsuario = () => (
      <form className="adm-form" onSubmit={guardarUsuario}>
        <h2>{editando?.tipo === "usuario" ? "Modificar usuario" : "Crear usuario"}</h2>
        <div className="adm-fields">
          <label>Usuario<input required maxLength="50" value={usuarioForm.usuario} onChange={(e) => setUsuarioForm({ ...usuarioForm, usuario: e.target.value })} /></label>
          <label>Nombre<input required maxLength="100" value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })} /></label>
          <label>Apellido<input required maxLength="100" value={usuarioForm.apellido} onChange={(e) => setUsuarioForm({ ...usuarioForm, apellido: e.target.value })} /></label>
          <label>{editando?.tipo === "usuario" ? "Nueva contraseña (opcional)" : "Contraseña"}
            <input type="password" required={editando?.tipo !== "usuario"} minLength="8" maxLength="72" autoComplete="new-password" value={usuarioForm.clave} onChange={(e) => setUsuarioForm({ ...usuarioForm, clave: e.target.value })} />
          </label>
          <label>Nivel<select value={usuarioForm.nivel} onChange={(e) => setUsuarioForm({ ...usuarioForm, nivel: e.target.value })}>
            <option value="MOZO">Mozo</option><option value="RECEPCIONISTA">Recepcionista</option><option value="GERENTE">Dueño / gerente</option><option value="ADMIN">Admin</option>
          </select></label>
          {editando?.tipo === "usuario" && <label className="adm-check"><input type="checkbox" checked={usuarioForm.activo} onChange={(e) => setUsuarioForm({ ...usuarioForm, activo: e.target.checked })} /> Usuario activo</label>}
        </div>
        <div className="adm-actions"><button className="adm-primary" disabled={ocupado}>{editando?.tipo === "usuario" ? "Guardar cambios" : "Crear usuario"}</button>
          {editando?.tipo === "usuario" && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}</div>
      </form>
  );

  const formCategoria = () => (
      <form className="adm-form" onSubmit={guardarCategoria}>
        <h2>{editando?.tipo === "categoria" ? "Modificar categoría" : "Crear categoría"}</h2>
        <div className="adm-fields">
          <label>Nombre<input required maxLength="100" value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} /></label>
          <label>Emoji (opcional)<input maxLength="20" value={categoriaForm.emoji} onChange={(e) => setCategoriaForm({ ...categoriaForm, emoji: e.target.value })} placeholder="🍽️" /></label>
        </div>
        <div className="adm-actions"><button className="adm-primary" disabled={ocupado}>{editando?.tipo === "categoria" ? "Guardar cambios" : "Crear categoría"}</button>
          {editando?.tipo === "categoria" && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}</div>
      </form>
  );

  const formPlato = () => (
      <form className="adm-form" onSubmit={guardarPlato}>
        <h2>{editando?.tipo === "plato" ? "Modificar plato" : "Crear plato"}</h2>
        <div className="adm-fields">
          <label>Nombre<input required value={platoForm.nombre} onChange={(e) => setPlatoForm({ ...platoForm, nombre: e.target.value })} /></label>
          <label>Precio<input required type="number" min="0.01" step="0.01" value={platoForm.precio} onChange={(e) => setPlatoForm({ ...platoForm, precio: e.target.value })} /></label>
          <label>Categoría<select required value={platoForm.categoriaId} onChange={(e) => setPlatoForm({ ...platoForm, categoriaId: e.target.value })}>
            <option value="">Elegir categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select></label>
          <label className="adm-wide">Descripción<textarea required rows="2" value={platoForm.descripcion} onChange={(e) => setPlatoForm({ ...platoForm, descripcion: e.target.value })} /></label>
        </div>
        <div className="adm-actions"><button className="adm-primary" disabled={ocupado || categorias.length === 0}>{editando?.tipo === "plato" ? "Guardar cambios" : "Crear plato"}</button>
          {editando?.tipo === "plato" && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}</div>
        {categorias.length === 0 && <p className="adm-help">Primero debe existir al menos una categoría.</p>}
      </form>
  );

  const formMesa = () => (
      <form className="adm-form" onSubmit={guardarMesa}>
        <h2>{editando?.tipo === "mesa" ? "Modificar mesa" : "Crear mesa"}</h2>
        <div className="adm-fields">
          <label>Número<input required type="number" min="1" step="1" value={mesaForm.numero} onChange={(e) => setMesaForm({ ...mesaForm, numero: e.target.value })} /></label>
          <label>Capacidad<input required type="number" min="1" step="1" value={mesaForm.capacidad} onChange={(e) => setMesaForm({ ...mesaForm, capacidad: e.target.value })} /></label>
          <label>Mozo asignado<select value={mesaForm.mozoId} onChange={(e) => setMesaForm({ ...mesaForm, mozoId: e.target.value })}>
            <option value="">Sin asignar</option>
            {editando?.tipo === "mesa" && !mozosActivos.some((u) => String(u.id) === String(mesaForm.mozoId)) && mesaForm.mozoId && (
                <option value={mesaForm.mozoId}>{mesas.find((m) => m.id === editando.id)?.mozoNombre || "Mozo asignado"} (asignado)</option>
            )}
            {mozosActivos.map((u) => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
          </select></label>
        </div>
        <div className="adm-actions"><button className="adm-primary" disabled={ocupado}>{editando?.tipo === "mesa" ? "Guardar cambios" : "Crear mesa"}</button>
          {editando?.tipo === "mesa" && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}</div>
      </form>
  );

  return (
      <main className="adm">
        <style>{css}</style>
        <div className="adm-wrap">
          <header className="adm-header">
            <div><p className="adm-brand">bocado <span>administración</span></p><h1>Panel de administración</h1></div>
          </header>
          <section className="adm-panel">
            <div className="adm-tabs" role="tablist" aria-label="Administrar">
              <button role="tab" aria-selected={seccion === "usuarios"} className={seccion === "usuarios" ? "on" : ""} onClick={() => { cancelarEdicion(); setSeccion("usuarios"); }}>Usuarios</button>
              <button role="tab" aria-selected={seccion === "categorias"} className={seccion === "categorias" ? "on" : ""} onClick={() => { cancelarEdicion(); setSeccion("categorias"); }}>Categorías</button>
              <button role="tab" aria-selected={seccion === "platos"} className={seccion === "platos" ? "on" : ""} onClick={() => { cancelarEdicion(); setSeccion("platos"); }}>Platos</button>
              <button role="tab" aria-selected={seccion === "mesas"} className={seccion === "mesas" ? "on" : ""} onClick={() => { cancelarEdicion(); setSeccion("mesas"); }}>Mesas</button>
            </div>
            {error && <p className="adm-message error" role="alert">{error}</p>}
            {aviso && <p className="adm-message success" role="status">{aviso}</p>}
            {cargando ? <p className="adm-message">Cargando datos…</p> : (
                <div className="adm-content">
                  {seccion === "usuarios" && <>
                    {formUsuario()}
                    <section className="adm-list"><h2>Usuarios registrados <span>{usuarios.length}</span></h2>
                      {usuarios.length === 0 ? <p className="adm-help">Todavía no hay usuarios.</p> : usuarios.map((u) => (
                          <article className="adm-row" key={u.id}>
                            <div className="adm-primary-info"><b>{u.nombre} {u.apellido}</b><small>@{u.usuario} · {u.nivel}</small></div>
                            <span className={`adm-status ${u.activo ? "active" : ""}`}>{u.activo ? "Activo" : "Inactivo"}</span>
                            <button onClick={() => editarUsuario(u)}>Editar</button>
                            <button disabled={ocupado} onClick={() => cambiarEstadoUsuario(u)}>{u.activo ? "Desactivar" : "Activar"}</button>
                          </article>
                      ))}
                    </section>
                  </>}
                  {seccion === "categorias" && <>
                    {formCategoria()}
                    <section className="adm-list"><h2>Categorías <span>{categorias.length}</span></h2>
                      {categorias.length === 0 ? <p className="adm-help">Todavía no hay categorías.</p> : categorias.map((c) => (
                          <article className="adm-row" key={c.id}>
                            <div className="adm-primary-info"><b>{c.emoji ? `${c.emoji} ` : ""}{c.nombre}</b></div>
                            <button onClick={() => editarCategoria(c)}>Editar</button>
                            <button disabled={ocupado} onClick={() => eliminarCategoria(c)}>Eliminar</button>
                          </article>
                      ))}
                    </section>
                  </>}
                  {seccion === "platos" && <>
                    {formPlato()}
                    <section className="adm-list"><h2>Platos <span>{platos.length}</span></h2>
                      {platos.length === 0 ? <p className="adm-help">Todavía no hay platos.</p> : platos.map((p) => (
                          <article className="adm-row" key={p.id}>
                            <div className="adm-primary-info"><b>{p.nombre}</b><small>{p.categoriaNombre} · ${Number(p.precio).toLocaleString("es-AR")}</small></div>
                            <span className={`adm-status ${p.activo ? "active" : ""}`}>{p.activo ? "Activo" : "Inactivo"}</span>
                            <button onClick={() => editarPlato(p)}>Editar</button>
                          </article>
                      ))}
                    </section>
                  </>}
                  {seccion === "mesas" && <>
                    {formMesa()}
                    <section className="adm-list"><h2>Mesas <span>{mesas.length}</span></h2>
                      {mesas.length === 0 ? <p className="adm-help">Todavía no hay mesas.</p> : mesas.map((m) => (
                          <article className="adm-row" key={m.id}>
                            <div className="adm-primary-info"><b>Mesa {m.numero}</b><small>Capacidad: {m.capacidad} personas · {m.mozoNombre ? `Mozo: ${m.mozoNombre}` : "Sin mozo asignado"}</small></div>
                            <span className={`adm-status ${m.activa ? "active" : ""}`}>{m.activa ? "Activa" : "Inactiva"}</span>
                            <button onClick={() => editarMesa(m)}>Editar</button>
                            <button disabled={ocupado} onClick={() => cambiarEstadoMesa(m)}>{m.activa ? "Desactivar" : "Activar"}</button>
                          </article>
                      ))}
                    </section>
                  </>}
                </div>
            )}
          </section>
        </div>
      </main>
  );
}