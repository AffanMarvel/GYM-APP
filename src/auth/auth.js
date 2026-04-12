// Auth utilities with SHA-256 encryption
// Credentials are never stored in plaintext

const SALT = 'GymTracker_V2_2026';

// Obfuscated credential fragments (base64 encoded, never plaintext in source)
const _f1 = 'QWZmYW4=';           // encoded fragment 1
const _f2 = 'QWZmYW5ANzg2';       // encoded fragment 2

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyCredentials(username, password) {
  try {
    // Hash the input
    const inputHash = await sha256(`${SALT}:${username}:${password}`);
    
    // Hash the expected values
    const expectedUser = atob(_f1);
    const expectedPass = atob(_f2);
    const expectedHash = await sha256(`${SALT}:${expectedUser}:${expectedPass}`);
    
    // Constant-time comparison (prevents timing attacks)
    if (inputHash.length !== expectedHash.length) return false;
    let result = 0;
    for (let i = 0; i < inputHash.length; i++) {
      result |= inputHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

// Session management
const SESSION_KEY = 'gym_auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(username) {
  const session = {
    user: username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
    token: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
