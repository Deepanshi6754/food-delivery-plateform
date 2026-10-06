// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const TOAST_COLORS = {
  success: {
    bg: 'rgba(39, 174, 120, 0.12)',
    border: 'rgba(39, 174, 120, 0.30)',
    text: '#27AE78',
  },
  error: {
    bg: 'rgba(232, 85, 85, 0.12)',
    border: 'rgba(232, 85, 85, 0.30)',
    text: '#E85555',
  },
  info: {
    bg: 'rgba(74, 143, 212, 0.12)',
    border: 'rgba(74, 143, 212, 0.30)',
    text: '#4A8FD4',
  },
  warning: {
    bg: 'rgba(240, 160, 48, 0.12)',
    border: 'rgba(240, 160, 48, 0.30)',
    text: '#F0A030',
  },
};

let toastId = 0;
const listeners = new Set();

export const toast = {
  show(message, type = 'info', duration = 4000) {
    const id = ++toastId;
    listeners.forEach((fn) => fn({ id, message, type, duration }));
    return id;
  },
  success(message, duration) {
    return this.show(message, 'success', duration);
  },
  error(message, duration) {
    return this.show(message, 'error', duration);
  },
  info(message, duration) {
    return this.show(message, 'info', duration);
  },
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },
};

const ToastItem = ({ item, onDismiss }) => {
  const [exiting, setExiting] = useState(false);
  const colors = TOAST_COLORS[item.type] || TOAST_COLORS.info;
  const icon = TOAST_ICONS[item.type] || TOAST_ICONS.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(item.id), 320);
    }, item.duration || 4000);

    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  return (
    <div
      className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{
        background: colors.bg,
        borderLeft: `4px solid ${colors.text}`,
        borderTop: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span className="toast-icon">{icon}</span>
      <span className="toast-message" style={{ color: colors.text }}>
        {item.message}
      </span>
      <button
        type="button"
        className="toast-close"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(item.id), 320);
        }}
        style={{ color: colors.text }}
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (newToast) => {
      setToasts((prev) => [...prev.slice(-4), newToast]); // max 5
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
