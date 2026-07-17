// Thin, SSR-safe wrapper around localStorage. Every call is guarded so these
// helpers can be imported from Client Components without blowing up during
// the (brief) server render pass Next.js does before hydration.

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
