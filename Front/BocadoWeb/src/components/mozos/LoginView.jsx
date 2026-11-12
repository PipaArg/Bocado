export default function LoginView({ usuario, setUsuario, clave, setClave, err, login }) {
    return (
        <form className="login" onSubmit={login}>
            <h1 className="big">bocado</h1>
            <p className="sub">Acceso</p>
            <div className="fields">
                <input name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" aria-label="Usuario" />
                <input name="clave" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Contraseña" type="password" autoComplete="current-password" aria-label="Contraseña" />
            </div>
            <p className="hint">Ingresá con tu usuario y contraseña.</p>
            {err && <p className="err" role="alert">{err}</p>}
            <button className="primary">Login</button>
        </form>
    );
}