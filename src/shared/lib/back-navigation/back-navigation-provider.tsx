import { useCallback, useMemo, useState } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import { BackNavigationContext } from './back-navigation-context';
import type { BackAction } from './back-navigation-context';

interface BackNavigationProviderProps {
  enabled: boolean;
  fallback: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

export function BackNavigationProvider({
  enabled,
  fallback,
  children,
}: BackNavigationProviderProps) {
  const [actions, setActions] = useState<ReadonlyMap<symbol, BackAction>>(
    new Map(),
  );
  const register = useCallback((action: BackAction) => {
    const owner = Symbol();
    setActions((current) => new Map(current).set(owner, action));
    return () => {
      setActions((current) => {
        const next = new Map(current);
        next.delete(owner);
        return next;
      });
    };
  }, []);
  const action = useMemo(
    () =>
      Array.from(actions.values()).at(-1) ?? {
        onBack: fallback,
        disabled: false,
      },
    [actions, fallback],
  );
  const scope = useMemo(
    () => ({ enabled, action, register }),
    [enabled, action, register],
  );
  return (
    <BackNavigationContext value={scope}>{children}</BackNavigationContext>
  );
}
