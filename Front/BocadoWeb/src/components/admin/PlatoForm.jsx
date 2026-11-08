export default function PlatoForm({ form, setForm, categorias, editando, ocupado, onSubmit, onCancelar }) {
    const isEditing = editando?.tipo === "plato";
    return (
        <form className="adm-form" onSubmit={onSubmit}>
            <h2>{isEditing ? "Modificar plato" : "Crear plato"}</h2>
            <div className="adm-fields">
                <label>Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
                <label>Precio<input required type="number" min="0.01" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
                <label>Categoría<select required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                    <option value="">Elegir categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></label>
                <label className="adm-wide">Descripción<textarea required rows="2" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
            </div>
            <div className="adm-actions">
                <button className="adm-primary" disabled={ocupado || categorias.length === 0}>{isEditing ? "Guardar cambios" : "Crear plato"}</button>
                {isEditing && <button type="button" onClick={onCancelar}>Cancelar</button>}
            </div>
            {categorias.length === 0 && <p className="adm-help">Primero debe existir al menos una categoría.</p>}
        </form>
    );
}