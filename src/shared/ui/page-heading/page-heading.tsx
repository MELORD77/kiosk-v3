import { cn } from '@/shared/lib/classnames';

interface PageHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeading({
  title,
  description,
  className,
}: PageHeadingProps) {
  return (
    <div className={cn('w-full flex justify-between', className)}>
      <h1 className="page-heading text-kiosk-page-heading leading-[1.15] font-extrabold tracking-[-0.025em]">
        {title}
      </h1>
      {description && (
        <p className="page-subtitle text-kiosk-text-muted text-kiosk-description mt-kiosk-3">
          {description}
        </p>
      )}
    </div>
  );
}
