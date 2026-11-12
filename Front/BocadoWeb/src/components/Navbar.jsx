import { NavLink } from "react-router-dom";

export default function Navbar({ onCerrarSesion }) {
    return (
        <nav className="app-nav" aria-label="Navegación principal">
            <NavLink to="/sobre-nosotros">Sobre nosotros</NavLink>

            <NavLink to="/admin">Página de administración</NavLink>

            {/* El atributo "end" asegura que solo se marque como activa
                cuando la ruta es exactamente "/" y no sus derivadas */}
            <NavLink to="/" end>Reservas</NavLink>

            <NavLink to="/recepcion">Recepción</NavLink>

            <NavLink to="/reportes">Reportes</NavLink>

            <button onClick={onCerrarSesion}>Cerrar sesión</button>
        </nav>
    );
}