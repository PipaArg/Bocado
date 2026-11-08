export default function CategoriaForm({ form, setForm, editando, ocupado, onSubmit, onCancelar }) {
    const isEditing = editando?.tipo === "categoria";
    return (
        <form className="adm-form" onSubmit={onSubmit}>
            <h2>{isEditing ? "Modificar categoría" : "Crear categoría"}</h2>
            <div className="adm-fields">
                <label>Nombre<input required maxLength="100" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
                <label>Emoji (opcional)<input maxLength="20" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🍽️" /></label>
            </div>
            <div className="adm-actions">
                <button className="adm-primary" disabled={ocupado}>{isEditing ? "Guardar cambios" : "Crear categoría"}</button>
                {isEditing && <button type="button" onClick={onCancelar}>Cancelar</button>}
            </div>
        </form>
    );
}