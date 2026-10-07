import type { CitizenServiceResult } from '@/entities/citizen-service';

const registration = {
  cadaster: '10:01:01:01:01:0001',
  region: 'Example region',
  district: 'Example district',
  address: 'Example street, 1',
  registrationDate: '2015-03-12T00:00:00',
};
const term = { years: '3', months: '0', days: '0', hours: null };

export const citizenResults: CitizenServiceResult[] = [
  {
    number: 7,
    result: {
      firstName: 'EXAMPLE',
      lastName: 'CITIZEN',
      middleName: null,
      birthday: '15.04.1990',
      gender: null,
      birthPlace: 'Example city',
      permanentRegistration: registration,
      temporaryRegistrations: [
        {
          ...registration,
          address: 'Example temporary address',
          validDate: '2027-01-10T00:00:00',
        },
      ],
      document: {
        serialNumber: 'AA0000000',
        issuedBy: 'Example issuing office',
        dateIssue: '2020-02-01T00:00:00Z',
        dateValid: '31.01.2030',
      },
      pdfLink: 'https://documents.example.test/residence.pdf',
    },
  },
  {
    number: 8,
    result: {
      cadaster: registration.cadaster,
      address: registration.address,
      permanent: [
        {
          fullName: 'EXAMPLE RESIDENT',
          status: 'ДОИМИЙ РЎЙХАТДА',
          registrationDate: '2015-03-12T00:00:00',
        },
      ],
      temporary: [
        {
          fullName: 'EXAMPLE TEMPORARY RESIDENT',
          status: null,
          registrationDate: '2026-01-10T00:00:00',
          validDate: '2027-01-10T00:00:00',
        },
      ],
    },
  },
  {
    number: 12,
    result: {
      isConvicted: true,
      records: [
        {
          crimeCaseNum: 'EXAMPLE-12',
          convictedDate: '10.05.2018',
          court: {
            country: 'UZ',
            region: 'Example region',
            area: 'Example district',
            organAddress: 'Example court',
          },
          articles: [
            'Example article',
            { undocumented: 'UNCONFIRMED_NESTED_VALUE' },
          ],
          term,
          additionalMeasures: [],
          arrestDate: null,
          freedDate: '10.05.2021',
          freedBy: 'Example authority',
          note: null,
          additionalInfo: null,
        },
      ],
    },
  },
  {
    number: 22,
    result: {
      isReleased: true,
      records: [
        {
          crimeCaseNum: 'EXAMPLE-22',
          convictedDate: '10.05.2018',
          articles: [],
          term,
          freedDate: '2021-05-10T00:00:00',
          freedBy: 'Example release authority',
        },
      ],
    },
  },
];

export function citizenResultEnvelope(result: unknown) {
  return {
    message: 'Success',
    result,
    meta: null,
    time: '2026-10-06T00:00:00Z',
  };
}
