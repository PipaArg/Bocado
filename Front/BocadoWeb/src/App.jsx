import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./hooks/useAuth.js";
import css from "./styles/app.css?inline";

export default function App() {
  const { esAdmin, esRecepcion, cerrarSesion } = useAuth();
  const puedeRecepcion = esAdmin || esRecepcion;

  return (
      <>
        <style>{css}</style>
        {puedeRecepcion && <Navbar onCerrarSesion={cerrarSesion} />}

        {/* Outlet renderizará Reservas, Mozos, Administracion, etc., según la URL */}
        <Outlet />
      </>
  );
}