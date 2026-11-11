export default function Navbar({ onCerrarSesion }) {
    const rutaActual = window.location.hash || "#/";

    return (
        <nav className="app-nav" aria-label="Navegación principal">
            <a href="#/sobre-nosotros" aria-current={rutaActual === "#/sobre-nosotros" ? "page" : undefined}>Sobre nosotros</a>
            <a href="#/admin" aria-current={rutaActual === "#/admin" ? "page" : undefined}>Página de administración</a>
            <a href="#/" aria-current={rutaActual === "#/" ? "page" : undefined}>Reservas</a>
            <a href="#/reportes" aria-current={rutaActual === "#/reportes" ? "page" : undefined}>Reportes</a>
            <button onClick={onCerrarSesion}>Cerrar sesión</button>
        </nav>
    );
}