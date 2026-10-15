import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Reportes from './Reportes.jsx'

// Mientras no haya login ni roles, la consola del encargado
// se abre con la direccion  http://localhost:5173/#encargado
const esEncargado = window.location.hash === '#encargado'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {esEncargado ? <Reportes /> : <App />}
  </StrictMode>,
)
