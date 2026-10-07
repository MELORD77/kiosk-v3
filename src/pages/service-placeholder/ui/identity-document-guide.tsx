import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import type { IdentityInput } from '../model/identity-schema';

interface IdentityDocumentGuideProps {
  method: IdentityInput['method'];
  loading?: boolean;
}

export function IdentityDocumentGuide({
  method,
  loading = false,
}: IdentityDocumentGuideProps) {
  const { t } = useTranslation();
  const passport = method === 'passport';
  const title = t(
    passport ? 'identity.passportGuideTitle' : 'identity.pinGuideTitle',
  );
  const alt = t(
    passport ? 'identity.passportGuideAlt' : 'identity.pinGuideAlt',
  );
  const image = passport
    ? 'identity-passport-guide.png'
    : 'identity-pinfl-guide.png';
  const captions = passport
    ? [
        t('identity.passportGuideDocument'),
        t('identity.passportGuideBirthDate'),
      ]
    : [t('identity.pinGuideCaption')];

  return (
    <figure className="identity-document-guide m-0 min-h-0 flex-1 flex flex-col justify-center gap-kiosk-3">
      <h3 className="text-kiosk-service-title font-bold short-wide:text-kiosk-sm compact:hidden">
        {loading ? <Skeleton variant="text">{title}</Skeleton> : title}
      </h3>
      {loading ? (
        <Skeleton className="identity-document-guide-image w-full rounded-kiosk-md compact:hidden" />
      ) : (
        <img
          className="identity-document-guide-image w-full min-h-0 object-contain rounded-kiosk-md compact:hidden"
          src={`${import.meta.env.BASE_URL}images/${image}`}
          alt={alt}
        />
      )}
      <figcaption className="grid shrink-0 gap-kiosk-1 text-kiosk-description text-kiosk-text-muted leading-[1.3]">
        {captions.map((caption) => (
          <p key={caption}>
            {loading ? <Skeleton variant="text">{caption}</Skeleton> : caption}
          </p>
        ))}
      </figcaption>
    </figure>
  );
}
