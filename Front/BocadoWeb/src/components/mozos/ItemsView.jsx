import { suma, plat } from "../../lib/pedido.js";

export default function ItemsView({
                                      setVista, categoriaActual, carrito, sumar, restar, abrirNota,
                                      mesaId, confirmar, volver
                                  }) {
    const n = suma(carrito);
    if (!categoriaActual) {
        return (
            <div className="body menu-items">
                <p className="sub">La categoría seleccionada ya no está disponible.</p>
                <button className="primary" onClick={() => setVista("menu")}>Volver al menú</button>
            </div>
        );
    }
    return (
        <>
            <div className="body">
                {categoriaActual.items.map((plato) => {
                    const id = String(plato.id);
                    const linea = carrito.find((p) => p.id === id);
                    const c = linea?.cant ?? 0;
                    const desactivado = !plato.activo;
                    return (
                        <div key={id} className={"item" + (c ? " on" : "") + (desactivado ? " off" : "")}>
                            <button className="add" disabled={desactivado} onClick={() => sumar(plato)}>
                                {plato.nombre}
                                {plato.descripcion && <small className="menu-description">{plato.descripcion}</small>}
                                {desactivado && <small>No disponible</small>}
                                {linea?.nota && <small className="nota">“{linea.nota}”</small>}
                            </button>
                            {c > 0 && (
                                <div className="qty">
                                    <button className="note" aria-label="Agregar nota" onClick={() => abrirNota(id)}>✎</button>
                                    <button aria-label="Quitar uno" onClick={() => restar(id)}>−</button>
                                    <b>{c}</b>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="foot">
                {n > 0 && mesaId
                    ? <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                    : <button className="primary" onClick={() => setVista(mesaId ? "mesa" : "menu")}>{mesaId ? "Volver a la mesa" : "Volver al menú"}</button>}
                {n > 0 && !mesaId && <p className="hint">TODO: conectar la API para guardar pedidos de mesa.</p>}
                <button className="sec" onClick={volver}>Otra categoría</button>
            </div>
        </>
    );
}