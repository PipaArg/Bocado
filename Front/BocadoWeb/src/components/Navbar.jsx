export default function Navbar({ onCerrarSesion }) {
    return (
        <nav className="app-nav" aria-label="Navegación principal">
            <a href="#/sobre-nosotros">Sobre nosotros</a>
            <a href="#/admin">Página de administración</a>
            <a href="#/">Reservas</a>
            <a href="#/reportes">Reportes</a>
            <button onClick={onCerrarSesion}>Cerrar sesión</button>
        </nav>
    );
}