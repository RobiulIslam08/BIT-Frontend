// ============================================
// BIT SOFTWARE — Domain registrar presets
// ============================================

export const REGISTRAR_OTHER_ID = 'other';
export const REGISTRAR_OTHER_LOGO = '/registrars/other.png';

/** Popular registrar presets shown in Add/Edit Domain. */
export const REGISTRAR_PRESETS = [
  {
    id: 'bit',
    label: 'BIT',
    logoSrc: '/bit-logo.png',
    color: '#0ea5e9',
  },
  {
    id: 'godaddy',
    label: 'GoDaddy',
    logoSrc: '/registrars/godaddy.svg',
    color: '#1BDB6A',
  },
  {
    id: 'namecheap',
    label: 'Namecheap',
    logoSrc: '/registrars/namecheap.svg',
    color: '#DE4922',
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare',
    logoSrc: '/registrars/cloudflare.svg',
    color: '#F6821F',
  },
  {
    id: 'hostinger',
    label: 'Hostinger',
    logoSrc: '/registrars/hostinger.svg',
    color: '#673DE6',
  },
  {
    id: 'porkbun',
    label: 'Porkbun',
    logoSrc: '/registrars/porkbun.png',
    color: '#E85D04',
  },
];

export function normalizeRegistrar(name) {
  return String(name ?? '').trim();
}

/**
 * Match a stored registrar string to a preset (case-insensitive).
 * Unknown values map to Other with the custom name preserved.
 */
export function matchRegistrarPreset(name) {
  const normalized = normalizeRegistrar(name);
  if (!normalized) {
    return { id: 'bit', label: 'BIT', custom: '' };
  }
  const preset = REGISTRAR_PRESETS.find(
    (p) => p.label.toLowerCase() === normalized.toLowerCase(),
  );
  if (preset) {
    return { id: preset.id, label: preset.label, custom: '' };
  }
  return { id: REGISTRAR_OTHER_ID, label: normalized, custom: normalized };
}

/** Resolve logo src for a registrar name (Other → globe icon). */
export function resolveRegistrarLogo(name) {
  const matched = matchRegistrarPreset(name);
  if (matched.id === REGISTRAR_OTHER_ID) return REGISTRAR_OTHER_LOGO;
  const preset = REGISTRAR_PRESETS.find((p) => p.id === matched.id);
  return preset?.logoSrc || REGISTRAR_OTHER_LOGO;
}

/** Logo for a preset id (including Other). */
export function resolvePresetLogo(presetId) {
  if (presetId === REGISTRAR_OTHER_ID) return REGISTRAR_OTHER_LOGO;
  const preset = REGISTRAR_PRESETS.find((p) => p.id === presetId);
  return preset?.logoSrc || REGISTRAR_OTHER_LOGO;
}

/** Brand accent color for a registrar (used by initials fallback). */
export function resolveRegistrarColor(name) {
  const matched = matchRegistrarPreset(name);
  if (matched.id === REGISTRAR_OTHER_ID) return '#2563eb';
  const preset = REGISTRAR_PRESETS.find((p) => p.id === matched.id);
  return preset?.color || '#2563eb';
}

/** 1–2 letter initials for fallback badge. */
export function registrarInitials(name) {
  const n = normalizeRegistrar(name);
  if (!n) return '?';
  const parts = n.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}

/**
 * Build the registrar string to persist.
 * Never returns the literal "Other".
 */
export function resolveRegistrarPayload(presetId, customName) {
  if (presetId === REGISTRAR_OTHER_ID) {
    const custom = normalizeRegistrar(customName);
    return custom || undefined;
  }
  const preset = REGISTRAR_PRESETS.find((p) => p.id === presetId);
  return preset?.label || 'BIT';
}
