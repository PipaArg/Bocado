export default function MesaForm({ form, setForm, mozosActivos, mesas, editando, ocupado, onSubmit, onCancelar }) {
    const isEditing = editando?.tipo === "mesa";
    return (
        <form className="adm-form" onSubmit={onSubmit}>
            <h2>{isEditing ? "Modificar mesa" : "Crear mesa"}</h2>
            <div className="adm-fields">
                <label>Número<input required type="number" min="1" step="1" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></label>
                <label>Capacidad<input required type="number" min="1" step="1" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} /></label>
                <label>Mozo asignado<select value={form.mozoId} onChange={(e) => setForm({ ...form, mozoId: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {isEditing && !mozosActivos.some((u) => String(u.id) === String(form.mozoId)) && form.mozoId && (
                        <option value={form.mozoId}>{mesas.find((m) => m.id === editando.id)?.mozoNombre || "Mozo asignado"} (asignado)</option>
                    )}
                    {mozosActivos.map((u) => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                </select></label>
            </div>
            <div className="adm-actions">
                <button className="adm-primary" disabled={ocupado}>{isEditing ? "Guardar cambios" : "Crear mesa"}</button>
                {isEditing && <button type="button" onClick={onCancelar}>Cancelar</button>}
            </div>
        </form>
    );
}