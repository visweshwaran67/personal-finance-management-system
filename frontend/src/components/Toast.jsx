import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ type = 'success', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className={`toast ${type}`} role="alert" aria-live="polite">
      {isSuccess && <CheckCircle2 size={18} color="#34d399" />}
      {isError && <AlertCircle size={18} color="#f87171" />}
      {!isSuccess && !isError && <Info size={18} color="#38bdf8" />}

      <span style={{ flex: 1 }}>{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
