import { useEffect, useState } from "react";
import Reservas from "./pages/Reservas.jsx";
import Mozos from "./pages/Mozos.jsx";
import Administracion from "./pages/Administracion.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Reportes from "./pages/Reportes.jsx";
import css from "./styles/app.css?inline";

const leerSesion = () => {
  try {
    return JSON.parse(sessionStorage.getItem("bocado.usuario") || "null");
  } catch {
    sessionStorage.removeItem("bocado.usuario");
    return null;
  }
};

export default function App() {
  const [usuario, setUsuario] = useState(leerSesion);
  const [ruta, setRuta] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setRuta(window.location.hash);
    const onSesion = () => setUsuario(leerSesion());
    window.addEventListener("hashchange", onHash);
    window.addEventListener("bocado-sesion", onSesion);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("bocado-sesion", onSesion);
    };
  }, []);

  const esAdmin = usuario?.nivel === "ADMIN";
  const rutaProtegida = ruta === "#/admin" || ruta === "#/reportes";

  useEffect(() => {
    if (rutaProtegida && !esAdmin) {
      window.location.hash = "#/mozos";
    }
  }, [rutaProtegida, esAdmin]);

  const cerrarSesion = () => {
    sessionStorage.removeItem("bocado.usuario");
    setUsuario(null);
    window.location.hash = "#/mozos";
  };

  let pagina = <Reservas />;
  if (ruta === "#/mozos") pagina = <Mozos />;
  if (ruta === "#/admin" && esAdmin) pagina = <Administracion />;
  if (ruta === "#/reportes" && esAdmin) pagina = <Reportes />;
  if (ruta === "#/sobre-nosotros") pagina = <SobreNosotros />;

  return (
    <>
      <style>{css}</style>
      {esAdmin && (
        <nav className="app-nav" aria-label="Navegación principal">
          <a href="#/sobre-nosotros">Sobre nosotros</a>
          <a href="#/admin">Página de administración</a>
          <a href="#/">Reservas</a>
          <a href="#/reportes">Reportes</a>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </nav>
      )}
      {pagina}
    </>
  );
}
