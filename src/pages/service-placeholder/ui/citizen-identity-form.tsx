import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/api';
import { localizedServerMessage } from '../model/backend-language';
import type { IdentityInput } from '../model/identity-schema';
import { IdentityForm } from './identity-form';

interface CitizenIdentityFormProps {
  serviceName: string;
  initialValues: IdentityInput;
  error?: unknown;
  unavailable?: boolean;
  onBack: () => void;
  onSubmit: (values: IdentityInput) => void;
  onChange: () => void;
}

export function CitizenIdentityForm({
  serviceName,
  initialValues,
  error,
  unavailable = false,
  onBack,
  onSubmit,
  onChange,
}: CitizenIdentityFormProps) {
  const { t, i18n } = useTranslation();
  let description = unavailable ? t('serviceResult.unavailable') : undefined;
  if (error instanceof ApiError) {
    const fallback =
      error.status === 404
        ? 'identity.citizenNotFound'
        : 'identity.pinUnavailable';
    description =
      localizedServerMessage(error.serverMessage, i18n.language) || t(fallback);
  }

  return (
    <IdentityForm
      serviceName={serviceName}
      initialValues={initialValues}
      onBack={onBack}
      onIdentify={async (values) => onSubmit(values)}
      onChange={onChange}
      error={description}
    />
  );
}
