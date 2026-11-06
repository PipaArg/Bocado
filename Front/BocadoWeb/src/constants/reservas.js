import { iso, slots } from "../lib/format.js";

export const HOY = iso(new Date());
export const DIAS = Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
export const ALMUERZO = slots(12, 15);
export const CENA = slots(20, 23.5);
export const TITULOS = ["¿Qué día y a qué hora?", "¿Cuántos van a ser?", "¿Quién reserva?", "¿Querés dejar una nota?", "Revisá y confirmá"];
export const MAX_NOTA = 255;
