export interface ResultField {
  label: string;
  value: string | null | undefined;
}

export function formatResultDate(value: string | null | undefined) {
  if (!value) return value;
  const date = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
  if (!date) return value;
  const [, year, month, day] = date;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(month) ||
    parsed.getUTCDate() !== Number(day)
  )
    return value;
  return `${day}.${month}.${year}`;
}

export function safeDocumentUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    return null;
  }
  return null;
}

export function primitiveDetails(values: unknown[]) {
  return values.flatMap((value) => {
    if (typeof value === 'string' && value.trim()) return [value];
    if (typeof value === 'number' && Number.isFinite(value))
      return [String(value)];
    return [];
  });
}
