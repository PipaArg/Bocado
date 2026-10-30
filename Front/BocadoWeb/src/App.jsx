import { useEffect, useState } from "react";
import Reservas from "./pages/Reservas.jsx";
import Mozos from "./pages/Mozos.jsx";

// Router mínimo por hash: "/" = reservas (clientes), "#/mozos" = app de mozos.
// Si más adelante sumás react-router, reemplazá esto por <Routes>.
const rutaActual = () => (window.location.hash === "#/mozos" ? "mozos" : "reservas");

export default function App() {
  const [ruta, setRuta] = useState(rutaActual);
  useEffect(() => {
    const onHash = () => setRuta(rutaActual());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return ruta === "mozos" ? <Mozos /> : <Reservas />;
}
