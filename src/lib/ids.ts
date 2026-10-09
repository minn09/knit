/** UUID v4 en el cliente para que dos dispositivos offline no choquen al sincronizar. */
export function newId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}
