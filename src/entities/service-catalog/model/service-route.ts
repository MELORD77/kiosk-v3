export type CitizenServiceRoute =
  'residence' | 'residents' | 'criminal-record' | 'release';

export function citizenServiceNumber(route: string): 7 | 8 | 12 | 22 | null {
  switch (route) {
    case 'residence':
      return 7;
    case 'residents':
      return 8;
    case 'criminal-record':
      return 12;
    case 'release':
      return 22;
    default:
      return null;
  }
}

export function citizenServiceRoute(
  number: number,
): CitizenServiceRoute | null {
  switch (number) {
    case 7:
      return 'residence';
    case 8:
      return 'residents';
    case 12:
      return 'criminal-record';
    case 22:
      return 'release';
    default:
      return null;
  }
}
