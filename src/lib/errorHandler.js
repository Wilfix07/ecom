/**
 * Centralized error handling for the application
 */
import React from 'react';

export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  const errorMessage = error.message || 'Yon erè te rive';
  
  // Map error types to user-friendly messages
  const errorMap = {
    'Row Level Security': 'Ou pa gen pèmisyon pou aksyon sa',
    'duplicate key': 'Sa deja egziste nan sistèm nan',
    'network': 'Pwoblèm koneksyon',
    'timeout': 'Twa tèlman long, eseye ankò',
    '401': 'Ou dwe konekte',
    '403': 'Ou pa gen pèmisyon',
    '404': 'Pa jwenn',
    '500': 'Erè serveur, eseye pi ta',
  };

  // Check if error message contains any mapped error
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }

  return errorMessage;
};

/**
 * Toast notification wrapper
 */
export const showToast = (message, type = 'info') => {
  // This can be integrated with a toast library like react-hot-toast
  if (type === 'error') {
    console.error(message);
    // Show error toast
    return;
  }
  console.log(message);
  // Show info toast
};

/**
 * Async error boundary wrapper
 */
export const withErrorHandling = (fn, errorContext = '') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = handleError(error, errorContext);
      showToast(message, 'error');
      return { error: message, data: null };
    }
  };
};

/**
 * Loading state management
 */
export const createAsyncState = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const execute = async (asyncFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

