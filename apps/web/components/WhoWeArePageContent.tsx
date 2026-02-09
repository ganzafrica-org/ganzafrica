'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/components/analytics/google-analytics';

export default function WhoWeArePageContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    trackPageView('/about/who-we-are', 'Who We Are');
  }, []);

  return <>{children}</>;
}

