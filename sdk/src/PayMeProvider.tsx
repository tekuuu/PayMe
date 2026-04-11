import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { PayMeClient } from './loadPayMe';

const PayMeContext = createContext<PayMeClient | null | undefined>(undefined);

export const PayMeProvider = ({ 
  payme, 
  children 
}: { 
  payme: Promise<PayMeClient> | PayMeClient | null; 
  children: ReactNode 
}) => {
  const [client, setClient] = useState<PayMeClient | null>(null);

  useEffect(() => {
    if (payme instanceof Promise) {
      payme.then(setClient);
    } else {
      setClient(payme);
    }
  }, [payme]);

  return <PayMeContext.Provider value={client}>{children}</PayMeContext.Provider>;
};

export const usePayMeContext = () => {
  const context = useContext(PayMeContext);
  if (context === undefined) {
    throw new Error('usePayMeContext must be used within a PayMeProvider');
  }
  return context;
};
