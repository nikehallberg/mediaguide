import React, { useState, useContext, createContext } from 'react';
import Alert from './Alert';
import './Alert.css';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      message,
      type,
      ...options
    };
    setAlerts(prev => [...prev, alert]);
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showAlert = (message, type = 'info') => addAlert(message, type);
  const showSuccess = (message) => addAlert(message, 'success');
  const showError = (message) => addAlert(message, 'error');
  const showWarning = (message) => addAlert(message, 'warning');

  return (
    <AlertContext.Provider value={{
      addAlert,
      removeAlert,
      showAlert,
      showSuccess,
      showError,
      showWarning
    }}>
      {children}
      <div className="alert-container">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
            autoClose={alert.autoClose !== false}
            duration={alert.duration || 5000}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export default AlertProvider;