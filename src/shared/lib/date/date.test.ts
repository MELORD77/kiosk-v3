import { expect, it } from 'vitest';
import { getKioskDateParts } from './index';

it('uses the Tashkent calendar when UTC is still on the previous day', () => {
  expect(getKioskDateParts(new Date('2026-10-01T19:00:00Z'))).toEqual({
    year: 2026,
    day: 2,
    monthIndex: 9,
    weekdayIndex: 5,
    time: '00:00',
  });
});

it('uses the Tashkent year when UTC is still in the previous year', () => {
  expect(getKioskDateParts(new Date('2026-12-31T19:00:00Z'))).toEqual({
    year: 2027,
    day: 1,
    monthIndex: 0,
    weekdayIndex: 5,
    time: '00:00',
  });
});
