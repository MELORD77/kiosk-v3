import { styles } from './styles';
import { useEffect, useMemo, useRef, useState } from 'react';
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
}

export function IdentityForm({ serviceName, onBack }: IdentityFormProps) {
  const { t, i18n } = useTranslation();
  const previousLanguage = useRef(i18n.language);
  const [activeField, setActiveField] = useState<IdentityField>('pin');
  const [checked, setChecked] = useState(false);
  const schema = useMemo(
    () =>
      createIdentitySchema({
        pin: t('identity.pinError'),
        series: t('identity.seriesError'),
        number: t('identity.numberError'),
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
      ['pin', 'passportSeries', 'passportNumber'] as const
    ).filter((field) => Boolean(errors[field]));
    if (visibleErrorFields.length > 0) void trigger(visibleErrorFields);
  }, [errors, i18n.language, trigger]);
  const method = useWatch({ control: form.control, name: 'method' });
  const isPassport = method === 'passport';
  const title = t(isPassport ? 'identity.passportTitle' : 'identity.pinTitle');
  const hint = t(isPassport ? 'identity.passportHint' : 'identity.pinHint');

  function changeMethod(next: IdentityInput['method']) {
    if (next === method) return;
    form.reset(emptyIdentityInput(next));
    setActiveField(next === 'pin' ? 'pin' : 'passportSeries');
    setChecked(false);
  }

  function editField(field: IdentityField, value: string) {
    form.setValue(field, normalizeIdentityField(field, value), {
      shouldDirty: true,
    });
    form.clearErrors(field);
    setChecked(false);
  }

  function enterKey(key: string) {
    const next = normalizeIdentityField(
      activeField,
      form.getValues(activeField) + key,
    );
    editField(activeField, next);
    if (activeField === 'passportSeries' && next.length === 2)
      setActiveField('passportNumber');
  }

  function clearInput() {
    form.reset(emptyIdentityInput(method));
    setActiveField(isPassport ? 'passportSeries' : 'pin');
    setChecked(false);
  }

  return (
    <form
      className={styles['identity-form']}
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(() => setChecked(true))(event);
      }}
    >
      <div className={styles['identity-copy']}>
        <div className={styles['identity-navigation']}>
          <Button
            variant="secondary"
            className={styles['identity-back']}
            onClick={onBack}
          >
            <span className={styles['identity-back-arrow']}>
              <ArrowIcon />
            </span>
            {t('common.back')}
          </Button>
          <span
            className={styles['identity-step']}
            aria-label={t('identity.step')}
          >
            {t('identity.stepCount')}
          </span>
        </div>
        <div className={styles['identity-progress']} aria-hidden="true">
          <span />
          <span />
        </div>
        <h1 className={styles['identity-service-name']}>{serviceName}</h1>
        <div className={styles['identity-intro']}>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
        <div
          className={styles['identity-methods']}
          role="group"
          aria-label={t('identity.methodLabel')}
        >
          <Button
            variant={isPassport ? 'secondary' : 'primary'}
            aria-pressed={!isPassport}
            onClick={() => changeMethod('pin')}
          >
            {t('identity.pinMethod')}
          </Button>
          <Button
            variant={isPassport ? 'primary' : 'secondary'}
            aria-pressed={isPassport}
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
      </div>
      <div className={styles['identity-entry']}>
        <IdentityFields
          form={form}
          method={method}
          onActivate={setActiveField}
          onEdit={editField}
        />
        <IdentityKeypad
          alphabet={activeField === 'passportSeries'}
          onKey={enterKey}
          onClear={clearInput}
          onDelete={() =>
            editField(activeField, form.getValues(activeField).slice(0, -1))
          }
        />
      </div>
      <Button
        type="submit"
        className={styles['identity-continue']}
        disabled={checked}
      >
        {t('identity.continue')}
        <ArrowIcon />
      </Button>
    </form>
  );
}
