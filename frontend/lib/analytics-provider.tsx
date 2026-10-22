'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import AnalyticsSDK from './analytics';

type SDK = InstanceType<typeof AnalyticsSDK>;

const AnalyticsContext = createContext<SDK | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<SDK | null>(null);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT!;
    const writeKey = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY ?? '';
    const instance = new AnalyticsSDK(endpoint, writeKey);
    instance.autoPage();
    setSdk(instance);
    (window as any).__analytics = instance;
  }, []);

  return (
    <AnalyticsContext.Provider value={sdk}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): SDK | null {
  return useContext(AnalyticsContext);
}
