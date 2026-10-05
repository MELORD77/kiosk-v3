import { Skeleton } from '@/shared/ui/skeleton';

interface FormFieldSkeletonProps {
  label: string;
  hint?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function FormFieldSkeleton({
  label,
  hint,
  inputClassName,
  placeholder,
}: FormFieldSkeletonProps) {
  return (
    <div
      className="form-field grid gap-kiosk-2 [&_label]:font-bold"
      aria-hidden="true"
    >
      <div className="form-field-label font-bold">
        <Skeleton variant="text">{label}</Skeleton>
      </div>
      <Skeleton variant="input" className={inputClassName}>
        {placeholder}
      </Skeleton>
      {hint && (
        <p className="muted text-kiosk-text-muted">
          <Skeleton variant="text">{hint}</Skeleton>
        </p>
      )}
    </div>
  );
}
