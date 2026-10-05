export type StatusIconKind =
  'info' | 'empty' | 'error' | 'success' | 'not-found';

interface StatusIconProps {
  kind: StatusIconKind;
}

export function StatusIcon({ kind }: StatusIconProps) {
  return (
    <svg
      className="status-icon w-kiosk-8 h-kiosk-8"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'empty' && (
        <>
          <path d="M8 20 14 9h20l6 11v19H8Z" />
          <path d="M8 20h10l3 6h6l3-6h10" />
        </>
      )}
      {kind === 'not-found' && (
        <>
          <path d="M12 7h17l8 8v11M29 7v9h8M12 7v34h14" />
          <circle cx="33" cy="33" r="7" />
          <path d="m38 38 5 5M18 23h8M18 29h4" />
        </>
      )}
      {kind === 'error' && (
        <>
          <path d="m24 7 19 33H5Z" />
          <path d="M24 18v10M24 34v1" />
        </>
      )}
      {kind === 'success' && (
        <>
          <circle cx="24" cy="24" r="18" />
          <path d="m15 24 6 6 12-13" />
        </>
      )}
      {kind === 'info' && (
        <>
          <circle cx="24" cy="24" r="18" />
          <path d="M24 21v12M24 15v1" />
        </>
      )}
    </svg>
  );
}
