import { useContext, useLayoutEffect, useRef } from 'react';
import type { MouseEventHandler } from 'react';
import { BackNavigationContext } from './back-navigation-context';

export function useBackNavigation() {
  return useContext(BackNavigationContext);
}

export function useFooterBackRegistration(
  handler: MouseEventHandler<HTMLButtonElement> | undefined,
  disabled: boolean,
  contentPlacement: boolean,
) {
  const scope = useBackNavigation();
  const latest = useRef(handler);
  useLayoutEffect(() => {
    latest.current = handler;
  }, [handler]);
  const register = scope?.register;
  const enabled = Boolean(scope?.enabled && contentPlacement);
  const hasHandler = handler !== undefined;
  useLayoutEffect(() => {
    if (!enabled || !register || !hasHandler) return;
    return register({ onBack: (event) => latest.current?.(event), disabled });
  }, [enabled, register, hasHandler, disabled]);
  return enabled;
}
