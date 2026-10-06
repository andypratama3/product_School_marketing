'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FlowKey } from '@/lib/types';
import { flowMap } from '@/data/flows';

const FLOW_KEYS = new Set(Object.keys(flowMap));

function isFlowKey(key: unknown): key is FlowKey {
  return typeof key === 'string' && FLOW_KEYS.has(key);
}

type FlowContextValue = {
  flowKey: FlowKey;
  /** Increments every time a flow is (re)opened — even for the same key. */
  flowNonce: number;
  setFlowKey: (key: FlowKey) => void;
};

const FlowContext = createContext<FlowContextValue>({
  flowKey: 'cms',
  flowNonce: 0,
  setFlowKey: () => {},
});

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowKey, setFlowKeyState] = useState<FlowKey>('cms');
  const [flowNonce, setFlowNonce] = useState(0);

  const setFlowKey = useCallback(
    (key: FlowKey) => {
      if (!isFlowKey(key)) return;
      setFlowKeyState(key);
      // Bump even when the key is unchanged so "Ulangi alur" resets step.
      setFlowNonce((n) => n + 1);
    },
    [],
  );

  useEffect(() => {
    const onOpen = (e: Event) => {
      const key = (e as CustomEvent<unknown>).detail;
      if (isFlowKey(key)) setFlowKey(key);
    };
    window.addEventListener('open-flow', onOpen);
    return () => window.removeEventListener('open-flow', onOpen);
  }, [setFlowKey]);

  const value = useMemo(
    () => ({ flowKey, flowNonce, setFlowKey }),
    [flowKey, flowNonce, setFlowKey],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  return useContext(FlowContext);
}
