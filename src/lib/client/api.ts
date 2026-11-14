/** Thin fetch wrapper for the portal API. Always sends the session cookie. */
export interface ApiResult<T = any> {
  success: boolean;
  error?: string;
  [k: string]: any;
  data?: T;
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { success: false, error: 'No internet connection. Check your mobile data or Wi-Fi and try again.' };
  }
  // A very slow connection is cut after 25 seconds so the button does not spin for ever.
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 25_000) : null;
  try {
    const res = await fetch(path, {
      signal: ctrl?.signal,
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: json.error || `Request failed (${res.status})`, ...json };
    return { success: true, ...json };
  } catch (e: any) {
    if (e?.name === 'AbortError') return { success: false, error: 'Your internet connection is slow. Please try again.' };
    return { success: false, error: 'Could not reach the portal server. It may be restarting – please try again in a minute.' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
