export {
  citizenDocumentInputSchema,
  citizenServiceRequestSchema,
  citizenServiceKeys,
} from './api/citizen-request';
export type {
  CitizenDocumentInput,
  CitizenServiceRequest,
  CitizenServiceLanguage,
} from './api/citizen-request';
export { fetchResidence, residenceSchema } from './api/residence';
export type { Residence } from './api/residence';
export { fetchResidents, residentsSchema } from './api/residents';
export type { Residents } from './api/residents';
export { fetchRelease, releaseSchema } from './api/release';
export type { Release } from './api/release';
export {
  fetchCriminalRecord,
  criminalRecordSchema,
} from './api/criminal-record';
export type { CriminalRecord } from './api/criminal-record';
export {
  fetchCitizenService,
  useRequestCitizenService,
} from './api/citizen-service';
export type {
  CitizenServiceResult,
  RequestCitizenServiceVariables,
} from './api/citizen-service';
