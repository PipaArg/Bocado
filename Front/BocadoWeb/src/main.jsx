import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Reservas from "./pages/Reservas.jsx";
import Mozos from "./pages/Mozos.jsx";
import Administracion from "./pages/Administracion.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Reportes from "./pages/Reportes.jsx";
import Recepcion from "./pages/Recepcion.jsx";
import { useAuth } from "./hooks/useAuth.js";


// Componente para proteger rutas de Administrador
const RutaAdmin = ({ children }) => {
    const { esAdmin } = useAuth();
    if (!esAdmin) return <Navigate to="/mozos" replace />;
    return children;
};

// Componente para proteger rutas de Recepción
const RutaRecepcion = ({ children }) => {
    const { esAdmin, esRecepcion } = useAuth();
    if (!esAdmin && !esRecepcion) return <Navigate to="/mozos" replace />;
    return children;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true, // Ruta por defecto "/"
                element: <Reservas />,
            },
            {
                path: "mozos",
                element: <Mozos />,
            },
            {
                path: "sobre-nosotros",
                element: <SobreNosotros />,
            },
            {
                path: "admin",
                element: (
                    <RutaAdmin>
                        <Administracion />
                    </RutaAdmin>
                ),
            },
            {
                path: "reportes",
                element: (
                    <RutaAdmin>
                        <Reportes />
                    </RutaAdmin>
                ),
            },
            {
                path: "recepcion",
                element: (
                    <RutaRecepcion>
                        <Recepcion />
                    </RutaRecepcion>
                ),
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);