/**
 * Helper to resolve asset paths reliably across environments.
 * Works with both localhost and GitHub Pages with base: './'
 */
export function getAssetPath(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const base = import.meta.env.BASE_URL || '/';

  // With base './', strip leading slash so paths become relative
  if (base === './') {
    return path.startsWith('/') ? path.slice(1) : path;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
