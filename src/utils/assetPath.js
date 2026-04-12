/**
 * Helper to resolve asset paths reliably across different environments (local, GitHub Pages, etc.)
 * Prepends the base URL if it's missing and ensures leading slashes are handled.
 */
export function getAssetPath(path) {
  if (!path) return '';
  
  // If it's already a full URL or a relative path without leading slash, leave it
  if (path.startsWith('http') || path.startsWith('data:') || !path.startsWith('/')) {
    return path;
  }

  // Get the base URL from Vite (e.g., "/" or "/gym-tracker-v2/")
  const base = import.meta.env.BASE_URL || '/';
  
  // Remove trailing slash from base if it exists, and leading slash from path
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}
