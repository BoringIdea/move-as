'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type Chain = 'sui' | 'movement' | 'aptos';

interface ChainContextType {
  currentChain: Chain;
  setCurrentChain: (chain: Chain) => void;
}

const SUPPORTED_CHAINS: Chain[] = ['sui', 'movement', 'aptos'];

const normalizeChain = (value: string | null): Chain | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return SUPPORTED_CHAINS.includes(normalized as Chain) ? (normalized as Chain) : null;
};

const getInitialChain = (): Chain => {
  if (typeof window === 'undefined') {
    return 'aptos';
  }
  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeChain(params.get('network'));
  if (fromQuery) {
    return fromQuery;
  }
  const stored = normalizeChain(localStorage.getItem('currentChain'));
  return stored ?? 'aptos';
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChain, setCurrentChainState] = useState<Chain>(getInitialChain);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isUpdatingFromUrl = useRef(false);

  const setCurrentChain = useCallback((chain: Chain) => {
    isUpdatingFromUrl.current = false;
    setCurrentChainState(chain);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentChain', currentChain);
  }, [currentChain]);

  // Sync from URL to state
  useEffect(() => {
    const paramChain = normalizeChain(searchParams?.get('network') ?? null);
    if (paramChain && paramChain !== currentChain) {
      isUpdatingFromUrl.current = true;
      setCurrentChainState(paramChain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync from state to URL
  useEffect(() => {
    if (isUpdatingFromUrl.current) {
      isUpdatingFromUrl.current = false;
      return;
    }

    if (!router || !pathname) return;
    
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const currentParam = params.get('network');

    // Only update URL if it's different from current chain
    if (currentParam !== currentChain) {
      params.set('network', currentChain);
      const queryString = params.toString();
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    }
  }, [currentChain, pathname, router, searchParams]);

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