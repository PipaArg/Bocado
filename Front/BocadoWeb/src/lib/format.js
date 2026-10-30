export const iso = (d) => d.toLocaleDateString("en-CA");

export const slots = (from, to) => {
  const out = [];
  for (let m = from * 60; m <= to * 60; m += 60)
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
};

export const pasado = (h) => {
  const n = new Date();
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm <= n.getHours() * 60 + n.getMinutes();
};

export const fechaLarga = (f) =>
  f ? new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "";

export const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e.trim());

// Acepta un timestamp (ms) o un "HH:MM"; devuelve siempre formato 24 h (21:00)
export const fmtHora = (v) => {
  const d = new Date();
  if (typeof v === "string") { const [h, m] = v.split(":").map(Number); d.setHours(h, m, 0, 0); } else d.setTime(v);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
};
