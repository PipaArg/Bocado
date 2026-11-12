import { useEffect, useState } from "react";
import Reservas from "./pages/Reservas.jsx";
import Mozos from "./pages/Mozos.jsx";
import Administracion from "./pages/Administracion.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Reportes from "./pages/Reportes.jsx";
import Recepcion from "./pages/Recepcion.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./hooks/useAuth.js";
import css from "./styles/app.css?inline";

export default function App() {
  const { usuario, esAdmin, esRecepcion, cerrarSesion } = useAuth();
  const puedeRecepcion = esAdmin || esRecepcion;
  const [ruta, setRuta] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setRuta(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const rutaProtegida = ruta === "#/admin" || ruta === "#/reportes";

  useEffect(() => {
    if (rutaProtegida && !esAdmin) {
      window.location.hash = "#/mozos";
    }
  }, [rutaProtegida, esAdmin]);


  // Recepcion: solo recepcionista o admin
  useEffect(() => {
    if (ruta === "#/recepcion" && !puedeRecepcion) {
      window.location.hash = "#/mozos";
    }
  }, [ruta, puedeRecepcion]);

  const renderPagina = () => {
    switch (ruta) {
      case "#/mozos":
        return <Mozos />;
      case "#/admin":
        return esAdmin ? <Administracion /> : <Mozos />;
      case "#/reportes":
        return esAdmin ? <Reportes /> : <Mozos />;
      case "#/recepcion":
        return puedeRecepcion ? <Recepcion /> : <Mozos />;
      case "#/sobre-nosotros":
        return <SobreNosotros />;
      case "#/":
      default:
        return <Reservas />;
    }
  };

  return (
    <>
      <style>{css}</style>
      {puedeRecepcion && <Navbar onCerrarSesion={cerrarSesion} />}
      {renderPagina()}
    </>
  );
}