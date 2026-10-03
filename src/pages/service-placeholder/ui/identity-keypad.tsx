import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';

interface IdentityKeypadProps {
  alphabet: boolean;
  onKey: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
}

const alphabetKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function IdentityKeypad({
  alphabet,
  onKey,
  onClear,
  onDelete,
}: IdentityKeypadProps) {
  const { t } = useTranslation();
  const keys = alphabet ? alphabetKeys : numberKeys;
  const className = alphabet
    ? cn(styles['identity-keypad'], styles['identity-keypad--alphabet'])
    : styles['identity-keypad'];

  return (
    <div
      className={className}
      role="group"
      aria-label={t(
        alphabet ? 'identity.alphabetKeyboard' : 'identity.numberKeyboard',
      )}
    >
      {keys.map((key) => (
        <Button
          key={key}
          variant="secondary"
          className={styles['identity-key']}
          onClick={() => onKey(key)}
        >
          {key}
        </Button>
      ))}
      <Button
        variant="secondary"
        className={cn(styles['identity-key'], styles['identity-key--action'])}
        onClick={onClear}
      >
        {t('identity.clear')}
      </Button>
      {!alphabet && (
        <Button
          variant="secondary"
          className={styles['identity-key']}
          onClick={() => onKey('0')}
        >
          0
        </Button>
      )}
      <Button
        variant="secondary"
        className={cn(styles['identity-key'], styles['identity-key--action'])}
        onClick={onDelete}
        aria-label={t('identity.delete')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M9 5h12v14H9l-7-7Z M12 9l6 6M18 9l-6 6" />
        </svg>
      </Button>
    </div>
  );
}
