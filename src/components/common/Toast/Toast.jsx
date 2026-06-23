// ============================================
// BIT SOFTWARE — TOAST SYSTEM
// Beautiful, premium, and dependency-free toast system
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

// Simple external listener pattern to allow calling toasts outside React
const listeners = new Set();

export const toast = {
  success: (message, options = {}) => {
    listeners.forEach((listener) => listener(message, 'success', options));
  },
  error: (message, options = {}) => {
    listeners.forEach((listener) => listener(message, 'error', options));
  },
  warning: (message, options = {}) => {
    listeners.forEach((listener) => listener(message, 'warning', options));
  },
  alert: (message, options = {}) => {
    listeners.forEach((listener) => listener(message, 'warning', options));
  },
  info: (message, options = {}) => {
    listeners.forEach((listener) => listener(message, 'info', options));
  },
};

// Toast Item Component
function ToastItem({ toastData, onRemove }) {
  const { id, message, type, duration = 4000 } = toastData;
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timeLeft = useRef(duration);
  const startTime = useRef(Date.now());
  const timerId = useRef(null);

  const startTimer = () => {
    startTime.current = Date.now();
    timerId.current = setTimeout(() => {
      triggerFadeOut();
    }, timeLeft.current);
  };

  const pauseTimer = () => {
    clearTimeout(timerId.current);
    timeLeft.current -= Date.now() - startTime.current;
  };

  const triggerFadeOut = () => {
    setIsFadingOut(true);
  };

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerId.current);
  }, []);

  // When fade out animation finishes, remove from parent list
  const handleAnimationEnd = (e) => {
    if (e.animationName.includes('toast-slide-out') || e.animationName.includes('toast-fade-out')) {
      onRemove(id);
    }
  };

  // Select appropriate icon
  const getIcon = () => {
    const iconSize = 18;
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon" size={iconSize} />;
      case 'error':
        return <AlertCircle className="toast-icon" size={iconSize} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={iconSize} />;
      case 'info':
      default:
        return <Info className="toast-icon" size={iconSize} />;
    }
  };

  return (
    <div
      className={`toast-item ${type} ${isFadingOut ? 'fade-out' : ''}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onAnimationEnd={handleAnimationEnd}
      style={{
        '--toast-duration': `${duration}ms`
      }}
    >
      {getIcon()}
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={triggerFadeOut} aria-label="Close toast">
        <X size={16} />
      </button>
      <div 
        className="toast-progress" 
        style={{ animationDuration: `${duration}ms` }} 
      />
    </div>
  );
}

// Toast Container & Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (message, type, options) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, ...options }]);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toastData={t} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
}

export default toast;
