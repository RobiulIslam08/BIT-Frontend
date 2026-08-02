// ============================================
// BIT SOFTWARE — Registrar logo badge
// ============================================

import {
  normalizeRegistrar,
  resolveRegistrarLogo,
  REGISTRAR_OTHER_LOGO,
} from '@/utils/registrars';

/**
 * Compact registrar mark for domain lists/forms.
 * Known brands use official logos; Other/custom uses the globe icon.
 */
export function RegistrarLogo({ registrar, size = 28, className = '', title, logoSrc: logoSrcProp }) {
  const name = normalizeRegistrar(registrar) || 'BIT';
  const logoSrc = logoSrcProp || resolveRegistrarLogo(name) || REGISTRAR_OTHER_LOGO;
  const label = title || name;

  return (
    <span
      className={`registrar-logo ${className}`.trim()}
      style={{ width: size, height: size }}
      title={label}
    >
      <img
        src={logoSrc}
        alt=""
        width={size}
        height={size}
        onError={(e) => {
          if (e.currentTarget.src.endsWith('other.png')) return;
          e.currentTarget.src = REGISTRAR_OTHER_LOGO;
        }}
      />
    </span>
  );
}

export default RegistrarLogo;
