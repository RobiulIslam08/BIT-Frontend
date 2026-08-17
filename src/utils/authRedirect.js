// ============================================
// BIT SOFTWARE — Post-auth redirect helper
// ============================================
// Resolves where to send the user after login/register.
// Priority: location.state.from → ?redirect= → role default.

const AUTH_PREFIX = '/auth';
const ADMIN_PREFIX = '/dashboard';

/**
 * Only allow same-origin relative paths (no open redirects / auth loops).
 */
export function isSafeInternalPath(path) {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (
    path === AUTH_PREFIX ||
    path.startsWith(`${AUTH_PREFIX}/`) ||
    path.startsWith(`${AUTH_PREFIX}?`) ||
    path.startsWith(`${AUTH_PREFIX}#`)
  ) {
    return false;
  }
  return true;
}

export function isAdminOnlyPath(path) {
  if (!path || typeof path !== 'string') return false;
  return (
    path === ADMIN_PREFIX ||
    path.startsWith(`${ADMIN_PREFIX}/`) ||
    path.startsWith(`${ADMIN_PREFIX}?`) ||
    path.startsWith(`${ADMIN_PREFIX}#`)
  );
}

function defaultPathForRole(userRole) {
  return userRole === 'admin' ? ADMIN_PREFIX : '/';
}

function canAccessPath(path, userRole) {
  if (!isSafeInternalPath(path)) return false;
  if (userRole !== 'admin' && isAdminOnlyPath(path)) return false;
  return true;
}

export function locationToPath(loc) {
  if (!loc) return null;
  if (typeof loc === 'string') return loc;
  if (!loc.pathname) return null;
  return `${loc.pathname}${loc.search || ''}${loc.hash || ''}`;
}

/**
 * @param {{ location?: { state?: { from?: unknown }, search?: string }, userRole?: string }} opts
 * @returns {string}
 */
export function getPostAuthRedirect({ location, userRole } = {}) {
  const fromPath = locationToPath(location?.state?.from);
  if (canAccessPath(fromPath, userRole)) return fromPath;

  const queryRedirect = new URLSearchParams(location?.search || '').get('redirect');
  if (canAccessPath(queryRedirect, userRole)) return queryRedirect;

  return defaultPathForRole(userRole);
}
