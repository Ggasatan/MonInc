import React from 'react';
import { useToast } from '../../hooks/useToast';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} index={index} />
      ))}
    </div>
  );
};
