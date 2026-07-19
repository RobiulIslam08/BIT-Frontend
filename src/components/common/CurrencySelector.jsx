// ============================================
// BIT SOFTWARE — Currency Selector Component
// ============================================
import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import './CurrencySelector.css';

export function CurrencySelector() {
  const {
    currency,
    symbol,
    changeCurrency,
    SUPPORTED_CURRENCIES,
    CURRENCY_SYMBOLS,
    CURRENCY_NAMES
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    console.log('[CurrencySelector] Selected currency:', code);
    changeCurrency(code);
    setIsOpen(false);
  };

  const stopProp = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="currency-selector" 
      ref={dropdownRef}
      onClick={stopProp}
      onMouseDown={stopProp}
    >
      <button
        className="currency-selector__btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe size={16} />
        <span className="currency-selector__btn-text">
          {currency} ({symbol})
        </span>
        <ChevronDown size={14} className={`currency-selector__arrow ${isOpen ? 'currency-selector__arrow--open' : ''}`} />
      </button>

      {isOpen && (
        <ul className="currency-selector__dropdown" role="listbox">
          {SUPPORTED_CURRENCIES.map((code) => {
            const sym = CURRENCY_SYMBOLS[code];
            const name = CURRENCY_NAMES[code];
            const isSelected = currency === code;

            return (
              <li key={code} role="option" aria-selected={isSelected}>
                <button
                  className={`currency-selector__option ${isSelected ? 'currency-selector__option--active' : ''}`}
                  onClick={() => handleSelect(code)}
                >
                  <span style={{ fontWeight: 600, width: '35px', display: 'inline-block' }}>{code}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginRight: 'auto' }}>({sym}) - {name}</span>
                  {isSelected && <Check size={14} className="currency-selector__check" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
