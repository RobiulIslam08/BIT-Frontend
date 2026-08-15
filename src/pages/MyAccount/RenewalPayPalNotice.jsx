// ============================================
// BIT SOFTWARE — Domain & hosting renewal notice (PayPal hosted button)
// ============================================
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const HOSTED_BUTTON_ID = '43VR8ZAF72SEA';
const CONTAINER_ID = `paypal-container-${HOSTED_BUTTON_ID}`;
const NAMESPACE = 'paypalHostedButtons';
const SCRIPT_ID = 'paypal-hosted-buttons-sdk';
const SCRIPT_SRC =
  'https://www.paypal.com/sdk/js?client-id=BAAm1pTRa85w69LE_Gpt6yviJr61jvj_Ba14KmHzlQdXhH6XqWMKhaOGJ7oAQtxSDG-SqVszSz0wmsFlDo&components=hosted-buttons&disable-funding=venmo&currency=USD';

function getPaypalNamespace() {
  return window[NAMESPACE];
}

function loadHostedButtonsSdk() {
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    if (getPaypalNamespace()?.HostedButtons) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute('data-namespace', NAMESPACE);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal SDK failed to load.'));
    document.body.appendChild(script);
  });
}

export default function RenewalPayPalNotice() {
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    const renderButton = async () => {
      try {
        await loadHostedButtonsSdk();
        if (cancelled) return;

        const paypal = getPaypalNamespace();
        const container = document.getElementById(CONTAINER_ID);
        if (!paypal?.HostedButtons || !container) {
          throw new Error('PayPal hosted buttons are unavailable.');
        }

        container.innerHTML = '';
        await paypal.HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID }).render(`#${CONTAINER_ID}`);
        if (cancelled) {
          container.innerHTML = '';
          return;
        }
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    renderButton();

    return () => {
      cancelled = true;
      const container = document.getElementById(CONTAINER_ID);
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="myaccount__renewal-notice" role="alert">
      <div className="myaccount__renewal-notice__icon" aria-hidden="true">
        <AlertTriangle size={22} />
      </div>
      <div className="myaccount__renewal-notice__copy">
        <span className="myaccount__renewal-notice__eyebrow">Action required</span>
        <h3 className="myaccount__renewal-notice__title">Renew domain &amp; hosting as soon as possible</h3>
        <p className="myaccount__renewal-notice__body">
          Please complete your domain and hosting renewal now to avoid service interruption. Pay securely with PayPal below.
        </p>
        <div className="myaccount__renewal-notice__paypal">
          {status === 'loading' && (
            <div className="myaccount__renewal-notice__paypal-state">
              <Loader2 size={16} className="spin" />
              Loading PayPal…
            </div>
          )}
          {status === 'error' && (
            <div className="myaccount__renewal-notice__paypal-state myaccount__renewal-notice__paypal-state--error">
              PayPal could not be loaded. Please refresh the page and try again.
            </div>
          )}
          <div id={CONTAINER_ID} />
        </div>
      </div>
    </div>
  );
}
