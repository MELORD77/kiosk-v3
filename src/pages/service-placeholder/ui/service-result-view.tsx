import type { CitizenServiceResult } from '@/entities/citizen-service';
import { CriminalRecordResult } from './criminal-record-result';
import { ReleaseResult } from './release-result';
import { ResidenceResult } from './residence-result';
import { ResidentsResult } from './residents-result';

interface ServiceResultViewProps {
  data: CitizenServiceResult;
}

export function ServiceResultView({ data }: ServiceResultViewProps) {
  let content;
  switch (data.number) {
    case 7:
      content = <ResidenceResult data={data.result} />;
      break;
    case 8:
      content = <ResidentsResult data={data.result} />;
      break;
    case 12:
      content = <CriminalRecordResult data={data.result} />;
      break;
    case 22:
      content = <ReleaseResult data={data.result} />;
      break;
  }
  return (
    <div className="mb-kiosk-8 pb-5 grid grid-cols-2 items-stretch gap-kiosk-4 [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1 [&>.status-panel]:col-span-full">
      {content}
    </div>
  );
}
