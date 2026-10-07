import { useTranslation } from 'react-i18next';
import type { Residents } from '@/entities/citizen-service';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/classnames';
import { formatResultDate } from '../model/service-result-values';
import { splitResidentName } from '../model/resident-name';

interface ResidentsTableProps {
  residents: Residents['permanent'] | Residents['temporary'];
  temporary: boolean;
  title: string;
}

export function ResidentsTable({
  residents,
  temporary,
  title,
}: ResidentsTableProps) {
  const { t } = useTranslation();
  const columns = [
    'rowNumber',
    'fullName',
    'birthday',
    'status',
    'registrationDate',
  ];
  if (temporary) columns.push('validDate');
  return (
    <table className="w-full table-fixed border-collapse text-kiosk-description max-lg:block [&_th]:px-kiosk-3 [&_th]:py-kiosk-2 [&_td]:px-kiosk-3 [&_td]:py-kiosk-3 [&_td]:align-top [&_td]:wrap-anywhere">
      <caption className="sr-only">{title}</caption>
      <thead className="bg-kiosk-primary-soft text-kiosk-primary max-lg:sr-only">
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              scope="col"
              className={cn(
                'text-left font-bold',
                column === 'rowNumber' && 'w-kiosk-16 text-center',
                column === 'status' && 'w-1/5',
                ['birthday', 'registrationDate', 'validDate'].includes(
                  column,
                ) && 'w-36',
              )}
            >
              {t(`serviceResult.${column}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="max-lg:block">
        {residents.map((resident, index) => {
          const identity = splitResidentName(resident.fullName);
          const values = [
            String(index + 1),
            identity.fullName,
            identity.birthday,
            resident.status,
            formatResultDate(resident.registrationDate),
          ];
          if (temporary)
            values.push(
              formatResultDate(
                'validDate' in resident &&
                  typeof resident.validDate === 'string'
                  ? resident.validDate
                  : null,
              ),
            );
          return (
            <tr
              key={index}
              className="border-b border-kiosk-border last:border-b-0 even:bg-kiosk-surface-muted max-lg:grid max-lg:grid-cols-1"
            >
              {values.map((value, columnIndex) => (
                <td
                  key={columns[columnIndex]}
                  className={
                    columnIndex === 0
                      ? 'text-center whitespace-nowrap text-kiosk-primary font-bold max-lg:text-left'
                      : 'max-lg:grid max-lg:grid-cols-2 max-lg:gap-kiosk-3'
                  }
                >
                  {columnIndex !== 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden max-lg:block text-kiosk-text-muted"
                    >
                      {t(`serviceResult.${columns[columnIndex]}`)}
                    </span>
                  )}
                  {columns[columnIndex] === 'status' ? (
                    <Badge
                      tone="primary"
                      className="justify-start text-left whitespace-normal"
                    >
                      {value?.trim() || t('serviceResult.notProvided')}
                    </Badge>
                  ) : (
                    <span
                      className={cn(
                        columns[columnIndex] === 'fullName'
                          ? 'font-bold'
                          : 'tabular-nums',
                        ['birthday', 'registrationDate', 'validDate'].includes(
                          columns[columnIndex] ?? '',
                        ) &&
                          value?.trim() &&
                          'whitespace-nowrap max-lg:whitespace-normal',
                      )}
                    >
                      {value?.trim() || t('serviceResult.notProvided')}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
