import Blobs from "../components/Blobs.jsx";
import css from "../styles/sobre-nosotros.css?inline";

const equipo = [
  { nombre: "Macarena Molina", legajo: "Legajo: pendiente", color: "lavanda" },
  { nombre: "Alexis Gandara", legajo: "Legajo: pendiente", color: "durazno" },
  { nombre: "Joaquin Lardizabal", legajo: "Legajo: pendiente", color: "menta" },
  { nombre: "Nicolas Piquero", legajo: "Legajo: pendiente", color: "rosa" },
  { nombre: "Gonzalo Eseiza", legajo: "Legajo: pendiente", color: "cielo" },
];

function FotoPlaceholder({ color, nombre }) {
  return (
    <div className={`about-photo ${color}`} role="img" aria-label={`Foto placeholder de ${nombre}`}>
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <circle cx="120" cy="120" r="120" fill="currentColor" opacity=".13" />
        <path d="M37 239c5-48 38-75 83-75s78 27 83 75" fill="currentColor" opacity=".76" />
        <circle cx="120" cy="91" r="46" fill="currentColor" opacity=".76" />
      </svg>
      <span>Foto</span>
    </div>
  );
}

export default function SobreNosotros() {
  return (
    <main className="about">
      <style>{css}</style>
      <Blobs />
      <div className="about-wrap">
        <header className="about-header">
          <a className="about-brand" href="/">bocado</a>
          <nav aria-label="Navegación">
            <a href="/">Reservas</a>
            <a href="/admin">Administración</a>
          </nav>
        </header>

        <section className="about-intro">
          <p className="about-eyebrow">Nuestro equipo</p>
          <h1>Sobre Bocado</h1>
          <p>
            Somos el equipo detrás de Bocado. Muy pronto vamos a contarte más sobre
            nuestra historia, nuestra propuesta y las personas que hacen posible este proyecto.
          </p>
        </section>

        <section className="about-team" aria-label="Integrantes del equipo">
          {equipo.map((persona, index) => (
            <article className="about-member" key={persona.color}>
              <FotoPlaceholder color={persona.color} nombre={persona.nombre} />
              <h2>{persona.nombre}</h2>
              <p>{persona.legajo}</p>
              <span className="about-index">{String(index + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
