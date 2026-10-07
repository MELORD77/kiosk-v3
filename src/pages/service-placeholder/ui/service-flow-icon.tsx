import type { ReactNode } from 'react';

export type ServiceFlowIconName =
  'document' | 'coins' | 'shield' | 'keyboard' | 'passport' | 'id-card';

const drawings: Record<ServiceFlowIconName, ReactNode> = {
  'id-card': (
    <>
      <rect x="2" y="5" width="16" height="14" rx="2" />
      <circle cx="7" cy="10" r="2" />
      <path d="M4 16c0-4 6-4 6 0M12 9h3M12 12h3M12 15h3M20 8c2 2 2 6 0 8" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 12h6M9 16h6" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v5c0 4 16 4 16 0V5M4 10v5c0 4 16 4 16 0v-5M4 15v4c0 4 16 4 16 0v-4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M5 9h1m3 0h1m3 0h1m3 0h1M5 12h1m3 0h1m3 0h1m3 0h1M7 16h10" />
    </>
  ),
  passport: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="10" r="4" />
      <path d="M8 10h8M12 6c-3 3-3 5 0 8 3-3 3-5 0-8M9 18h6" />
    </>
  ),
};

export function ServiceFlowIcon({ name }: { name: ServiceFlowIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {drawings[name]}
    </svg>
  );
}
