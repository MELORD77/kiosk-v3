import { createContext } from 'react';
import type { MouseEventHandler } from 'react';

export interface BackAction {
  onBack: MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
}

export interface BackNavigationScope {
  enabled: boolean;
  action: BackAction;
  register: (action: BackAction) => () => void;
}

export const BackNavigationContext = createContext<BackNavigationScope | null>(
  null,
);
