import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
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
    <div className={styles['form-field']} aria-hidden="true">
      <div className={styles['form-field-label']}>
        <Skeleton variant="text">{label}</Skeleton>
      </div>
      <Skeleton variant="input" className={inputClassName}>
        {placeholder}
      </Skeleton>
      {hint && (
        <p className={layoutStyles['muted']}>
          <Skeleton variant="text">{hint}</Skeleton>
        </p>
      )}
    </div>
  );
}
