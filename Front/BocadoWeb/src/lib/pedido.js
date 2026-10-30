export const suma = (items) => items.reduce((s, p) => s + p.cant, 0);

// El pedido total se calcula sumando todas las acciones del historial
export const pedidoDe = (m) => {
  const mp = new Map();
  m.hist.forEach((h) => h.items.forEach((i) => {
    const k = i.id + "|" + (i.nota || "");
    const e = mp.get(k);
    mp.set(k, e ? { ...e, cant: e.cant + i.cant } : { ...i });
  }));
  return [...mp.values()];
};

export const cantidad = (m) => suma(pedidoDe(m));
export const plat = (n) => `${n} ${n === 1 ? "plato" : "platos"}`;
