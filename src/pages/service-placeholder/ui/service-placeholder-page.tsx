import { useParams } from 'react-router';
import { citizenServiceNumber } from '@/entities/service-catalog';
import { ServiceDetailPage } from './service-detail-page';
import { NamedServicePage } from './named-service-page';

export function ServicePlaceholderPage() {
  const { serviceId = '' } = useParams();
  const number = citizenServiceNumber(serviceId);
  return number === null ? (
    <ServiceDetailPage serviceId={serviceId} />
  ) : (
    <NamedServicePage number={number} />
  );
}
