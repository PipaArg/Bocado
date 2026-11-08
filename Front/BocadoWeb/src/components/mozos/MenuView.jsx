import { suma, plat } from "../../lib/pedido.js";

export default function MenuView({
                                     menuCargando, menuError, recargarMenu, menu, carrito, setCat, setVista,
                                     confirmar, cancelarPedido, mesaId
                                 }) {
    const n = suma(carrito);
    return (
        <>
            <div className="body">
                <p className="sub">Elegí los platos y confirmá: se registran juntos como una sola acción.</p>
                {menuCargando && <p className="sub">Cargando categorías y platos…</p>}
                {menuError && (
                    <div className="err" role="alert">
                        <p>No se pudo cargar el menú: {menuError}</p>
                        <button className="sec" onClick={recargarMenu}>Reintentar</button>
                    </div>
                )}
                {!menuCargando && !menuError && menu.length === 0 && <p className="sub">Todavía no hay categorías cargadas.</p>}
                {!menuCargando && !menuError && menu.length > 0 && (
                    <div className="grid cats">
                        {menu.map((categoria) => {
                            const q = suma(carrito.filter((p) => p.categoriaId === categoria.id));
                            const disponibles = categoria.items.filter((item) => item.activo).length;
                            return (
                                <button key={categoria.id} className="cat" onClick={() => { setCat(categoria.id); setVista("items"); }}>
                                    {q > 0 && <i className="cnt">{q}</i>}
                                    <span className="ico">{categoria.emoji || "🍽️"}</span>
                                    <b>{categoria.nombre}</b>
                                    <small>{disponibles} disponibles</small>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            {n > 0 && mesaId && (
                <div className="foot">
                    <button className="primary" onClick={confirmar}>Confirmar · {plat(n)}</button>
                    <button className="sec" onClick={cancelarPedido}>Cancelar pedido</button>
                </div>
            )}
            {n > 0 && !mesaId && <p className="hint">TODO: conectar la API para asociar el pedido a una mesa.</p>}
        </>
    );
}