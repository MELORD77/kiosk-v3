const calendarFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'Asia/Tashkent',
});

const clockFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Tashkent',
});

export function getKioskDateParts(date: Date) {
  const parts = calendarFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  return {
    year,
    day,
    monthIndex: month - 1,
    weekdayIndex: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    time: clockFormatter.format(date),
  };
}
