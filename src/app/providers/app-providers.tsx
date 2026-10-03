import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { i18n } from '@/shared/lib/i18n';
import { createQueryClient } from './query-client';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <ThemeProvider>{children}</ThemeProvider>
          </MotionConfig>
        </LazyMotion>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
