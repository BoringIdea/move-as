'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

export type Chain = 'sui' | 'movement' | 'aptos';

interface ChainContextType {
  currentChain: Chain;
  setCurrentChain: (chain: Chain) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChain, setCurrentChain] = useState<Chain>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('currentChain') as Chain) || 'aptos';
    }
    return 'aptos';
  });

  useEffect(() => {
    localStorage.setItem('currentChain', currentChain);
  }, [currentChain]);

  return (
    <ChainContext.Provider value={{ currentChain, setCurrentChain }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};