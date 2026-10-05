import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { TextField } from '@/shared/ui/text-field';
import { StatusPanel } from '@/shared/ui/status-panel';
import {
  createDemoLabelSchema,
  type DemoLabelInput,
} from '../model/demo-label-schema';
import { useSubmitDemoLabel } from '../api/demo-profiles';

export function DemoLabelForm() {
  const { t } = useTranslation();
  const signal = useKioskSessionStore((state) => state.signal);
  const schema = useMemo(
    () =>
      createDemoLabelSchema({
        required: t('demo.required'),
        minLength: t('demo.minLength'),
        maxLength: t('demo.maxLength'),
      }),
    [t],
  );
  const form = useForm<DemoLabelInput>({
    resolver: zodResolver(schema),
    defaultValues: { label: '' },
    mode: 'onBlur',
  });
  const submission = useSubmitDemoLabel(signal);
  const fieldError = form.formState.errors.label?.message;
  const descriptionIds = fieldError
    ? 'demo-label-hint demo-label-error'
    : 'demo-label-hint';

  async function submit(input: DemoLabelInput) {
    try {
      await submission.mutateAsync(input);
    } catch {
      // The mutation state renders the translated failure below.
    }
  }

  return (
    <section
      className="stack grid gap-kiosk-6"
      aria-labelledby="demo-form-title"
    >
      <h2 id="demo-form-title">{t('demo.formTitle')}</h2>
      <form
        className="stack grid gap-kiosk-6"
        noValidate
        onSubmit={(event) => {
          void form.handleSubmit(submit)(event);
        }}
      >
        <FormField
          id="demo-label"
          label={t('demo.label')}
          hint={t('demo.hint')}
          error={fieldError}
        >
          <TextField
            id="demo-label"
            autoComplete="off"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={descriptionIds}
            disabled={submission.isPending}
            {...form.register('label')}
          />
        </FormField>
        <div>
          <Button type="submit" disabled={submission.isPending}>
            {submission.isPending ? t('demo.pending') : t('demo.submit')}
          </Button>
        </div>
      </form>
      {submission.isError && (
        <StatusPanel tone="error" title={t('demo.submitError')} />
      )}
      {submission.isSuccess && (
        <StatusPanel
          tone="success"
          title={t('demo.result')}
          description={t('demo.submitted', { label: submission.data.label })}
        />
      )}
    </section>
  );
}
