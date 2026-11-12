import { useEffect, useState } from "react";
import Reservas from "./pages/Reservas.jsx";
import Mozos from "./pages/Mozos.jsx";
import Administracion from "./pages/Administracion.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Reportes from "./pages/Reportes.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./hooks/useAuth.js";
import css from "./styles/app.css?inline";

export default function App() {
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const [ruta, setRuta] = useState(() => window.location.hash); //permite guardar un dato dentro del componente y actualizarlo

  useEffect(() => {//detecta cambios en la URL
    const onHash = () => setRuta(window.location.hash);//Cuando se ejecuta, consulta la ruta actual del navegador y actualiza el estado ruta
    window.addEventListener("hashchange", onHash);//se dispara cuando cambia el fragmento # de la URL.
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const rutaProtegida = ruta === "#/admin" || ruta === "#/reportes"; //si un usuario sin permisos entra en #/reportes, la aplicación termina redirigiéndolo a #/mozos.

  useEffect(() => {
    if (rutaProtegida && !esAdmin) {
      window.location.hash = "#/mozos";
    }
  }, [rutaProtegida, esAdmin]);


  const renderPagina = () => {//elegir qué component mostrar
    switch (ruta) {
      case "#/mozos":
        return <Mozos />;
      case "#/admin":
        return esAdmin ? <Administracion /> : <Mozos />;
      case "#/reportes":
        return esAdmin ? <Reportes /> : <Mozos />;
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
        {esAdmin && <Navbar onCerrarSesion={cerrarSesion} />}
        {renderPagina()}
      </>
  );
}