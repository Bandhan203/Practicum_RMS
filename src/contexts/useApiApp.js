import { useContext } from 'react';
import { ApiAppContext } from './ApiAppContext';

export const useApiApp = () => {
  const context = useContext(ApiAppContext);
  if (!context) {
    throw new Error('useApiApp must be used within an ApiAppProvider');
  }
  return context;
};
  