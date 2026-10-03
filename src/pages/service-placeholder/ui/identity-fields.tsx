import { styles } from './styles';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/shared/ui/form-field';
import { TextField } from '@/shared/ui/text-field';
import { Fade } from '@/shared/ui/fade';
import type { IdentityField, IdentityInput } from '../model/identity-schema';

interface IdentityFieldsProps {
  form: UseFormReturn<IdentityInput>;
  method: IdentityInput['method'];
  onActivate: (field: IdentityField) => void;
  onEdit: (field: IdentityField, value: string) => void;
}

export function IdentityFields({
  form,
  method,
  onActivate,
  onEdit,
}: IdentityFieldsProps) {
  const { t } = useTranslation();
  const pinError = form.formState.errors.pin?.message;
  const seriesError = form.formState.errors.passportSeries?.message;
  const numberError = form.formState.errors.passportNumber?.message;

  if (method === 'pin') {
    return (
      <Fade key="pin">
        <FormField
          id="identity-pin"
          label={t('identity.pinLabel')}
          error={pinError}
        >
          <TextField
            {...form.register('pin')}
            id="identity-pin"
            className={styles['identity-input']}
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={14}
            placeholder={t('identity.pinPlaceholder')}
            aria-invalid={Boolean(pinError)}
            aria-describedby={pinError ? 'identity-pin-error' : undefined}
            onFocus={() => onActivate('pin')}
            onChange={(event) => onEdit('pin', event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              onEdit('pin', event.clipboardData.getData('text'));
            }}
          />
        </FormField>
      </Fade>
    );
  }

  return (
    <Fade key="passport" className={styles['identity-passport-fields']}>
      <FormField
        id="identity-series"
        label={t('identity.seriesLabel')}
        error={seriesError}
      >
        <TextField
          {...form.register('passportSeries')}
          id="identity-series"
          className={styles['identity-input']}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={2}
          placeholder={t('identity.seriesPlaceholder')}
          aria-invalid={Boolean(seriesError)}
          aria-describedby={seriesError ? 'identity-series-error' : undefined}
          onFocus={() => onActivate('passportSeries')}
          onChange={(event) => onEdit('passportSeries', event.target.value)}
          onPaste={(event) => {
            event.preventDefault();
            onEdit('passportSeries', event.clipboardData.getData('text'));
          }}
        />
      </FormField>
      <FormField
        id="identity-number"
        label={t('identity.numberLabel')}
        error={numberError}
      >
        <TextField
          {...form.register('passportNumber')}
          id="identity-number"
          className={styles['identity-input']}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={7}
          placeholder={t('identity.numberPlaceholder')}
          aria-invalid={Boolean(numberError)}
          aria-describedby={numberError ? 'identity-number-error' : undefined}
          onFocus={() => onActivate('passportNumber')}
          onChange={(event) => onEdit('passportNumber', event.target.value)}
          onPaste={(event) => {
            event.preventDefault();
            onEdit('passportNumber', event.clipboardData.getData('text'));
          }}
        />
      </FormField>
    </Fade>
  );
}
