import { useEffect, useMemo, useRef, useState } from 'react';
import type { BaseSyntheticEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { StatusPanel } from '@/shared/ui/status-panel';
import {
  createIdentitySchema,
  emptyIdentityInput,
  normalizeIdentityField,
} from '../model/identity-schema';
import type { IdentityField, IdentityInput } from '../model/identity-schema';
import { IdentityFields } from './identity-fields';
import { IdentityKeypad } from './identity-keypad';

interface IdentityFormProps {
  serviceName: string;
  onBack: () => void;
  onIdentify?: (values: IdentityInput) => Promise<void>;
  busy?: boolean;
  error?: string;
}

export function IdentityForm({
  serviceName,
  onBack,
  onIdentify,
  busy: externalBusy = false,
  error,
}: IdentityFormProps) {
  const { t, i18n } = useTranslation();
  const previousLanguage = useRef(i18n.language);
  const pendingIdentification = useRef(false);
  const [identifying, setIdentifying] = useState(false);
  const busy = externalBusy || identifying;
  const [activeField, setActiveField] = useState<IdentityField>('pin');
  const [checked, setChecked] = useState(false);
  const [focusResetCount, setFocusResetCount] = useState(0);
  const schema = useMemo(
    () =>
      createIdentitySchema({
        pin: t('identity.pinError'),
        series: t('identity.seriesError'),
        number: t('identity.numberError'),
        birthDate: t('identity.birthDateError'),
      }),
    [t],
  );
  const form = useForm<IdentityInput>({
    resolver: zodResolver(schema),
    defaultValues: emptyIdentityInput(),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const { errors } = form.formState;
  const { trigger } = form;
  useEffect(() => {
    if (previousLanguage.current === i18n.language) return;
    previousLanguage.current = i18n.language;
    const visibleErrorFields = (
      ['pin', 'passportSeries', 'passportNumber', 'birthDate'] as const
    ).filter((field) => Boolean(errors[field]));
    if (visibleErrorFields.length > 0) void trigger(visibleErrorFields);
  }, [errors, i18n.language, trigger]);
  const method = useWatch({ control: form.control, name: 'method' });
  const { setFocus } = form;
  useEffect(() => {
    setFocus(method === 'pin' ? 'pin' : 'passportSeries');
  }, [method, setFocus, focusResetCount]);
  const isPassport = method === 'passport';
  const title = t(isPassport ? 'identity.passportTitle' : 'identity.pinTitle');
  const hint = t(isPassport ? 'identity.passportHint' : 'identity.pinHint');

  function changeMethod(next: IdentityInput['method']) {
    if (busy) return;
    if (next === method) return;
    form.reset(emptyIdentityInput(next));
    setActiveField(next === 'pin' ? 'pin' : 'passportSeries');
    setChecked(false);
  }

  function editField(field: IdentityField, value: string) {
    if (busy) return;
    const normalized = normalizeIdentityField(field, value);
    form.setValue(field, normalized, {
      shouldDirty: true,
    });
    form.clearErrors(field);
    setChecked(false);
    if (field === 'passportSeries' && normalized.length === 2) {
      setFocus('passportNumber');
    }
    if (field === 'passportNumber' && normalized.length === 7) {
      setFocus('birthDate');
    }
  }

  function enterKey(key: string) {
    const next = normalizeIdentityField(
      activeField,
      form.getValues(activeField) + key,
    );
    editField(activeField, next);
  }

  function clearInput() {
    if (busy) return;
    form.reset(emptyIdentityInput(method));
    setActiveField(isPassport ? 'passportSeries' : 'pin');
    setChecked(false);
    setFocusResetCount((count) => count + 1);
  }

  function submit(event?: BaseSyntheticEvent) {
    return form.handleSubmit(async (values) => {
      if (externalBusy || pendingIdentification.current) return;
      if (!onIdentify) {
        setChecked(true);
        return;
      }
      pendingIdentification.current = true;
      setIdentifying(true);
      try {
        await onIdentify(values);
      } finally {
        pendingIdentification.current = false;
        setIdentifying(false);
      }
    })(event);
  }

  function nextField() {
    if (activeField === 'passportSeries') setFocus('passportNumber');
    else if (activeField === 'passportNumber') setFocus('birthDate');
    else void submit();
  }

  return (
    <form
      className="identity-form grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] grid-rows-[auto_1fr] gap-x-kiosk-8 gap-y-kiosk-4 items-start w-full mx-auto [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-col [[data-orientation='portrait']_&]:items-stretch [[data-orientation='portrait']_&]:gap-kiosk-6 compact:flex compact:flex-col compact:items-stretch compact:gap-kiosk-4"
      noValidate
      aria-busy={busy}
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <div className="identity-copy min-w-0 flex flex-col gap-kiosk-4 col-start-1 row-start-1 [[data-orientation='portrait']_&]:contents short:gap-kiosk-4 compact:contents">
        <div className="identity-navigation flex items-center justify-between gap-kiosk-4">
          <Button
            variant="secondary"
            className="identity-back rounded-kiosk-sm text-kiosk-md [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none"
            disabled={busy}
            onClick={onBack}
          >
            <span className="identity-back-arrow flex [transform:rotate(180deg)]">
              <ArrowIcon />
            </span>
            {t('common.back')}
          </Button>
        </div>
        <h1 className="identity-service-name bg-kiosk-primary-soft text-kiosk-primary p-kiosk-4 rounded-kiosk-sm text-kiosk-service-title font-bold leading-[1.4] wrap-anywhere">
          {serviceName}
        </h1>
        <div className="identity-intro grid gap-kiosk-3 [&_h2]:text-kiosk-page-heading [&_h2]:font-extrabold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.025em] [&_p]:text-kiosk-text-muted [&_p]:text-kiosk-description [&_p]:leading-[1.4]">
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
        <div
          className="identity-methods flex flex-wrap gap-kiosk-2 [&_.button]:flex-1 [&_.button]:min-w-0 [&_.button]:text-kiosk-description"
          role="group"
          aria-label={t('identity.methodLabel')}
        >
          <Button
            variant={isPassport ? 'secondary' : 'primary'}
            aria-pressed={!isPassport}
            disabled={busy}
            onClick={() => changeMethod('pin')}
          >
            {t('identity.pinMethod')}
          </Button>
          <Button
            variant={isPassport ? 'primary' : 'secondary'}
            aria-pressed={isPassport}
            disabled={busy}
            onClick={() => changeMethod('passport')}
          >
            {t('identity.passportMethod')}
          </Button>
        </div>
        {checked && (
          <StatusPanel
            icon="info"
            title={t('identity.nextTitle')}
            description={t('identity.nextDescription')}
          />
        )}
        {error && (
          <StatusPanel
            tone="error"
            title={t('identity.requestError')}
            description={error}
          />
        )}
      </div>
      <div
        className="identity-entry min-w-0 flex flex-col gap-kiosk-6 col-start-2 row-start-1 self-stretch [&_.form-field]:min-w-0 [&_.field-error]:text-kiosk-description [&_.field-error]:leading-[1.4] [&_.field-error]:wrap-anywhere [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto short:gap-kiosk-4 compact:col-auto compact:row-auto"
        inert={busy}
      >
        <IdentityFields
          form={form}
          method={method}
          onActivate={setActiveField}
          onEdit={editField}
        />
      </div>
      <div
        className="identity-keyboard-slot col-start-2 row-start-2 mt-auto w-full min-w-0 self-end order-last"
        inert={busy}
      >
        <IdentityKeypad
          alphabet={activeField === 'passportSeries'}
          onKey={enterKey}
          onClear={clearInput}
          onDelete={() =>
            editField(
              activeField,
              activeField === 'birthDate'
                ? form.getValues(activeField).replace(/\D/g, '').slice(0, -1)
                : form.getValues(activeField).slice(0, -1),
            )
          }
          onNext={nextField}
        />
      </div>
      <Button
        type="submit"
        className="identity-continue [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none col-start-1 row-start-2 self-end w-full min-h-kiosk-18 mt-auto text-kiosk-lg [&.identity-continue:disabled]:text-kiosk-text-muted [&.identity-continue:disabled]:bg-kiosk-surface-muted [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto compact:col-auto compact:row-auto"
        disabled={checked || busy}
      >
        {t('identity.continue')}
        <ArrowIcon />
      </Button>
    </form>
  );
}
