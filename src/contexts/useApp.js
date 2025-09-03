// Custom hook for AppContext
import { useContext } from 'react';
import { createContext } from 'react';

const AppContext = createContext(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
