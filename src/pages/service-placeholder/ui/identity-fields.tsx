import { useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/shared/ui/form-field';
import { TextField } from '@/shared/ui/text-field';
import { Fade } from '@/shared/ui/fade';
import { isValidIdentityField } from '../model/identity-schema';
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
  const values = useWatch({ control: form.control });
  const pinError = form.formState.errors.pin?.message;
  const seriesError = form.formState.errors.passportSeries?.message;
  const numberError = form.formState.errors.passportNumber?.message;
  const birthDateError = form.formState.errors.birthDate?.message;

  if (method === 'pin') {
    return (
      <Fade
        key="pin"
        className="compact:[&_.form-field]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] compact:[&_.form-field]:items-center compact:[&_label]:text-kiosk-description compact:[&_.field-error]:col-span-2"
      >
        <FormField
          id="identity-pin"
          label={t('identity.pinLabel')}
          error={pinError}
        >
          <TextField
            {...form.register('pin')}
            data-valid={isValidIdentityField('pin', values.pin ?? '')}
            id="identity-pin"
            className={
              'identity-input py-kiosk-2 leading-tight short-wide:text-kiosk-sm min-h-kiosk-service-input rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 compact:text-kiosk-lg'
            }
            inputMode="none"
            pattern="[0-9]*"
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
    <Fade
      key="passport"
      className="identity-passport-fields short-wide:[&_.form-field]:gap-kiosk-1 short-wide:[&_label]:leading-tight short-wide:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] short-wide:[&_.form-field:last-child]:col-span-1 grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] gap-kiosk-3 items-start [&_.form-field:last-child]:col-span-2"
    >
      <FormField
        id="identity-series"
        label={t('identity.seriesLabel')}
        error={seriesError}
      >
        <TextField
          {...form.register('passportSeries')}
          data-valid={isValidIdentityField(
            'passportSeries',
            values.passportSeries ?? '',
          )}
          id="identity-series"
          className={
            'identity-input py-kiosk-2 leading-tight short-wide:text-kiosk-sm min-h-kiosk-service-input rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 compact:text-kiosk-lg'
          }
          inputMode="none"
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
          data-valid={isValidIdentityField(
            'passportNumber',
            values.passportNumber ?? '',
          )}
          id="identity-number"
          className={
            'identity-input py-kiosk-2 leading-tight short-wide:text-kiosk-sm min-h-kiosk-service-input rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 compact:text-kiosk-lg'
          }
          inputMode="none"
          pattern="[0-9]*"
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
      <FormField
        id="identity-birth-date"
        label={t('identity.birthDateLabel')}
        error={birthDateError}
      >
        <TextField
          {...form.register('birthDate')}
          data-valid={isValidIdentityField('birthDate', values.birthDate ?? '')}
          id="identity-birth-date"
          className={
            'identity-input py-kiosk-2 leading-tight short-wide:text-kiosk-sm min-h-kiosk-service-input rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 compact:text-kiosk-lg'
          }
          inputMode="none"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          placeholder={t('identity.birthDatePlaceholder')}
          aria-invalid={Boolean(birthDateError)}
          aria-describedby={
            birthDateError ? 'identity-birth-date-error' : undefined
          }
          onFocus={() => onActivate('birthDate')}
          onChange={(event) => onEdit('birthDate', event.target.value)}
          onPaste={(event) => {
            event.preventDefault();
            onEdit('birthDate', event.clipboardData.getData('text'));
          }}
        />
      </FormField>
    </Fade>
  );
}
