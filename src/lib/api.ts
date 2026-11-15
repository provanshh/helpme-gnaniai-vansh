const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

/** Prefer same-origin `/api` (Vite proxy); fall back to env base URL. */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (configured) return `${configured}${p}`;
  return p;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
}
