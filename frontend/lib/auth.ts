// Static dashboard credentials — demo only
export const DEMO_USERNAME = 'admin';
export const DEMO_PASSWORD = 'admin@123';

const AUTH_KEY = '_ra_auth';

export function login(username: string, password: string): boolean {
  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    try { sessionStorage.setItem(AUTH_KEY, '1'); } catch {}
    return true;
  }
  return false;
}

export function logout(): void {
  try { sessionStorage.removeItem(AUTH_KEY); } catch {}
}

export function isAuthenticated(): boolean {
  try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch { return false; }
}
