import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
  id: number;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: number) => void;
  index: number;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, duration = 5000, onClose, index }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mount animation
    setShow(true);

    // Auto close timer
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setShow(false);
  };

  const handleTransitionEnd = () => {
    if (!show) {
      onClose(id);
    }
  };

  const topPosition = 20 + (index * 90); // 90px per toast (height + gap)

  return (
    <div 
      className={`notification-toast ${show ? 'show' : ''}`}
      style={{ top: `${topPosition}px` }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="notification-toast-title">
        <span>{title}</span>
        <button onClick={handleClose} className="close-btn">&times;</button>
      </div>
      <div className="notification-toast-message">{message}</div>
    </div>
  );
};
