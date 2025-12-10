import React, { useState, useEffect } from 'react';
import './Alert.css';

const Alert = ({ message, type = 'info', onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for fade animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div className={`alert alert-${type} ${isClosing ? 'alert-closing' : ''}`}>
      <span className="alert-message">{message}</span>
      <span className="closebtn" onClick={handleClose}>
        &times;
      </span>
    </div>
  );
};

export default Alert;