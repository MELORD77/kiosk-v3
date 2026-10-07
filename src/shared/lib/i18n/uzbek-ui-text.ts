export function toUzbekUiText(text: string): string {
  return text.replace(
    /\{\{[^}]*\}\}|\b(?:HTTPS?|MRZ|PINFL|NFC|ID)\b|[oOgG]['‘’ʻʼ`]|[sS][hH]|[cC][hH]/g,
    (match) => {
      if (match.startsWith('{{') || /^(?:HTTPS?|MRZ|PINFL|NFC|ID)$/.test(match))
        return match;
      const first = match[0];
      switch (first) {
        case 'o':
          return 'ö';
        case 'O':
          return 'Ö';
        case 'g':
          return 'ğ';
        case 'G':
          return 'Ğ';
        case 's':
          return 'ş';
        case 'S':
          return 'Ş';
        case 'c':
          return 'ç';
        case 'C':
          return 'Ç';
        default:
          return match;
      }
    },
  );
}
