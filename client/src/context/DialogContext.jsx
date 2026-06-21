import { createContext, useContext, useState, useCallback } from 'react';
import ThemeDialog from '../components/ThemeDialog';

const DialogContext = createContext(null);

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'alert',
    message: '',
    resolvePromise: null,
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        message,
        resolvePromise: resolve,
      });
    });
  }, []);

  const alert = useCallback((message) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'alert',
        message,
        resolvePromise: resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolvePromise) dialogState.resolvePromise(true);
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (dialogState.resolvePromise) dialogState.resolvePromise(false);
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <ThemeDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        message={dialogState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
