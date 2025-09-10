type Handler = (payload?: any) => void;

const listeners = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => off(event, handler);
}

export function off(event: string, handler: Handler) {
  listeners.get(event)?.delete(handler);
}

export function emit(event: string, payload?: any) {
  const set = listeners.get(event);
  if (!set) return;
  for (const h of set) {
    try { h(payload); } catch { /* no-op */ }
  }
}

