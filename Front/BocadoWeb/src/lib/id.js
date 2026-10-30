// Id local para entradas del historial (el original usaba nid() pero nunca se definía)
export const nid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
