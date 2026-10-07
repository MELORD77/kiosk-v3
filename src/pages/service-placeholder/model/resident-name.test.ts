import { describe, expect, it } from 'vitest';
import { splitResidentName } from './resident-name';

describe('resident name date suffix', () => {
  it.each([
    ['EXAMPLE CITIZEN (15.04.1990)', 'EXAMPLE CITIZEN', '15.04.1990'],
    ['EXAMPLE (OTHER NAME) (29.02.2000)', 'EXAMPLE (OTHER NAME)', '29.02.2000'],
    ['EXAMPLE CITIZEN (29.02.2024)  ', 'EXAMPLE CITIZEN', '29.02.2024'],
  ])('separates a valid trailing date in %s', (input, fullName, birthday) => {
    expect(splitResidentName(input)).toEqual({ fullName, birthday });
  });

  it.each([
    'EXAMPLE CITIZEN (29.02.2023)',
    'EXAMPLE CITIZEN (31.04.1990)',
    'EXAMPLE CITIZEN (00.12.1990)',
    'EXAMPLE CITIZEN (15.13.1990)',
    'EXAMPLE (OTHER NAME)',
    'EXAMPLE (15.04.1990) CITIZEN',
    'EXAMPLE CITIZEN',
    '(15.04.1990)',
    '',
    null,
  ])('preserves names without a valid trailing date: %s', (fullName) => {
    expect(splitResidentName(fullName)).toEqual({ fullName, birthday: null });
  });
});
