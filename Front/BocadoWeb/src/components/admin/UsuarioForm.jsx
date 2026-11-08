export default function UsuarioForm({ form, setForm, editando, ocupado, onSubmit, onCancelar }) {
    const isEditing = editando?.tipo === "usuario";
    return (
        <form className="adm-form" onSubmit={onSubmit}>
            <h2>{isEditing ? "Modificar usuario" : "Crear usuario"}</h2>
            <div className="adm-fields">
                <label>Usuario<input required maxLength="50" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} /></label>
                <label>Nombre<input required maxLength="100" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
                <label>Apellido<input required maxLength="100" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} /></label>
                <label>{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                    <input type="password" required={!isEditing} minLength="8" maxLength="72" autoComplete="new-password" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} />
                </label>
                <label>Nivel<select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
                    <option value="MOZO">Mozo</option><option value="RECEPCIONISTA">Recepcionista</option><option value="GERENTE">Dueño / gerente</option><option value="ADMIN">Admin</option>
                </select></label>
                {isEditing && <label className="adm-check"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Usuario activo</label>}
            </div>
            <div className="adm-actions">
                <button className="adm-primary" disabled={ocupado}>{isEditing ? "Guardar cambios" : "Crear usuario"}</button>
                {isEditing && <button type="button" onClick={onCancelar}>Cancelar</button>}
            </div>
        </form>
    );
}