// ============================================
// BIT SOFTWARE — First-party visitor tracker
// ============================================
// Sends page views, heartbeats, and leave events to /api/v1/activity/*.
// Skips /dashboard/* so admin panel browsing is not logged as a visit.
// Failures are swallowed — this must never affect login, checkout, or GA4.

import {
  trackActivityEvent,
  trackActivityHeartbeat,
  trackActivityLeave,
  trackActivityPageView,
} from '@/api/activityApi';

const VISITOR_KEY = 'bit_visitor_id';
const SESSION_KEY = 'bit_session_id';
const HEARTBEAT_MS = 20000;

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function shouldSkip(path) {
  const pathname = String(path || '').split('?')[0];
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

function ids() {
  return {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
  };
}

/**
 * Subscribe to SPA navigations + tab close. Returns an unsubscribe function.
 */
export function startVisitorTracking(router) {
  let lastPath = '';
  let heartbeatTimer = null;

  const sendPageView = (location) => {
    const path = `${location.pathname}${location.search || ''}`;
    if (path === lastPath) return;
    lastPath = path;
    if (shouldSkip(path)) return;

    trackActivityPageView({
      ...ids(),
      path,
      title: typeof document !== 'undefined' ? document.title : '',
      language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    });
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const beat = () => {
    const path = `${window.location.pathname}${window.location.search || ''}`;
    if (shouldSkip(path)) return;
    if (document.visibilityState !== 'visible') return;
    trackActivityHeartbeat(ids());
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
  };

  sendPageView(window.location);
  startHeartbeat();

  const unsubscribe = router.subscribe((state) => {
    if (state.navigation.state === 'idle') {
      sendPageView(state.location);
    }
  });

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      startHeartbeat();
      beat();
    } else {
      stopHeartbeat();
    }
  };

  const onPageHide = () => {
    const path = `${window.location.pathname}${window.location.search || ''}`;
    if (shouldSkip(path)) return;
    trackActivityLeave({ sessionId: getSessionId() });
  };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);

  return () => {
    unsubscribe();
    stopHeartbeat();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
  };
}

/** Fire-and-forget custom event (e.g. WhatsApp click). Safe if tracker is not running. */
export function trackVisitorEvent(type) {
  try {
    const path = `${window.location.pathname}${window.location.search || ''}`;
    if (shouldSkip(path)) return;
    trackActivityEvent({ ...ids(), type, path });
  } catch {
    // ignore
  }
}
