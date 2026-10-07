import { formatResultDate } from './service-result-values';

export function splitResidentName(fullName: string | null) {
  if (!fullName) return { fullName, birthday: null };
  const match = /^(.*?)\s*\((\d{2})\.(\d{2})\.(\d{4})\)\s*$/s.exec(fullName);
  if (!match) return { fullName, birthday: null };
  const [, name, day, month, year] = match;
  const birthday = `${day}.${month}.${year}`;
  if (
    !name ||
    !name.trim() ||
    formatResultDate(`${year}-${month}-${day}`) !== birthday
  )
    return { fullName, birthday: null };
  return { fullName: name.trim(), birthday };
}
