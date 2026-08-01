export interface Country {
  code: string;        // ISO 2 letter code, e.g. "CM"
  nameFr: string;      // French name
  nameEn: string;      // English name
  dialCode: string;    // e.g. "+237"
  flag: string;        // Flag emoji
  digits: number[];    // Expected digit count(s) e.g. [9] or [9, 10]
  placeholder: string; // e.g. "677 89 45 12"
}

export const COUNTRIES: Country[] = [
  {
    code: 'CM',
    nameFr: 'Cameroun',
    nameEn: 'Cameroon',
    dialCode: '+237',
    flag: '🇨🇲',
    digits: [9],
    placeholder: '677 89 45 12'
  },
  {
    code: 'NG',
    nameFr: 'Nigéria',
    nameEn: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    digits: [10, 11],
    placeholder: '801 234 5678'
  },
  {
    code: 'CI',
    nameFr: "Côte d'Ivoire",
    nameEn: 'Ivory Coast',
    dialCode: '+225',
    flag: '🇨🇮',
    digits: [10],
    placeholder: '07 01 02 03 04'
  },
  {
    code: 'SN',
    nameFr: 'Sénégal',
    nameEn: 'Senegal',
    dialCode: '+221',
    flag: '🇸🇳',
    digits: [9],
    placeholder: '77 123 45 67'
  },
  {
    code: 'GA',
    nameFr: 'Gabon',
    nameEn: 'Gabon',
    dialCode: '+241',
    flag: '🇬🇦',
    digits: [8, 9],
    placeholder: '07 12 34 56'
  },
  {
    code: 'CG',
    nameFr: 'Congo-Brazzaville',
    nameEn: 'Congo',
    dialCode: '+242',
    flag: '🇨🇬',
    digits: [9],
    placeholder: '06 123 4567'
  },
  {
    code: 'CD',
    nameFr: 'RDC (Congo-Kinshasa)',
    nameEn: 'DR Congo',
    dialCode: '+243',
    flag: '🇨🇩',
    digits: [9],
    placeholder: '81 234 5678'
  },
  {
    code: 'TD',
    nameFr: 'Tchad',
    nameEn: 'Chad',
    dialCode: '+235',
    flag: '🇹🇩',
    digits: [8],
    placeholder: '66 12 34 56'
  },
  {
    code: 'CF',
    nameFr: 'Centrafrique',
    nameEn: 'Central African Republic',
    dialCode: '+236',
    flag: '🇨🇫',
    digits: [8],
    placeholder: '75 12 34 56'
  },
  {
    code: 'GH',
    nameFr: 'Ghana',
    nameEn: 'Ghana',
    dialCode: '+233',
    flag: '🇬🇭',
    digits: [9, 10],
    placeholder: '24 123 4567'
  },
  {
    code: 'KE',
    nameFr: 'Kenya',
    nameEn: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    digits: [9],
    placeholder: '712 345678'
  },
  {
    code: 'TG',
    nameFr: 'Togo',
    nameEn: 'Togo',
    dialCode: '+228',
    flag: '🇹🇬',
    digits: [8],
    placeholder: '90 12 34 56'
  },
  {
    code: 'BJ',
    nameFr: 'Bénin',
    nameEn: 'Benin',
    dialCode: '+229',
    flag: '🇧🇯',
    digits: [8],
    placeholder: '97 12 34 56'
  },
  {
    code: 'RW',
    nameFr: 'Rwanda',
    nameEn: 'Rwanda',
    dialCode: '+250',
    flag: '🇷🇼',
    digits: [9],
    placeholder: '78 123 4567'
  },
  {
    code: 'GN',
    nameFr: 'Guinée',
    nameEn: 'Guinea',
    dialCode: '+224',
    flag: '🇬🇳',
    digits: [9],
    placeholder: '621 12 34 56'
  },
  {
    code: 'ML',
    nameFr: 'Mali',
    nameEn: 'Mali',
    dialCode: '+223',
    flag: '🇲🇱',
    digits: [8],
    placeholder: '66 12 34 56'
  },
  {
    code: 'BF',
    nameFr: 'Burkina Faso',
    nameEn: 'Burkina Faso',
    dialCode: '+226',
    flag: '🇧🇫',
    digits: [8],
    placeholder: '70 12 34 56'
  },
  {
    code: 'MA',
    nameFr: 'Maroc',
    nameEn: 'Morocco',
    dialCode: '+212',
    flag: '🇲🇦',
    digits: [9],
    placeholder: '6 12 34 56 78'
  },
  {
    code: 'DZ',
    nameFr: 'Algérie',
    nameEn: 'Algeria',
    dialCode: '+213',
    flag: '🇩🇿',
    digits: [9],
    placeholder: '5 12 34 56 78'
  },
  {
    code: 'TN',
    nameFr: 'Tunisie',
    nameEn: 'Tunisia',
    dialCode: '+216',
    flag: '🇹🇳',
    digits: [8],
    placeholder: '20 123 456'
  },
  {
    code: 'EG',
    nameFr: 'Égypte',
    nameEn: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    digits: [10],
    placeholder: '10 1234 5678'
  },
  {
    code: 'ZA',
    nameFr: 'Afrique du Sud',
    nameEn: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    digits: [9],
    placeholder: '82 123 4567'
  },
  {
    code: 'FR',
    nameFr: 'France',
    nameEn: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    digits: [9, 10],
    placeholder: '6 12 34 56 78'
  },
  {
    code: 'BE',
    nameFr: 'Belgique',
    nameEn: 'Belgium',
    dialCode: '+32',
    flag: '🇧🇪',
    digits: [9],
    placeholder: '470 12 34 56'
  },
  {
    code: 'CH',
    nameFr: 'Suisse',
    nameEn: 'Switzerland',
    dialCode: '+41',
    flag: '🇨🇭',
    digits: [9],
    placeholder: '79 123 45 67'
  },
  {
    code: 'CA',
    nameFr: 'Canada',
    nameEn: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    digits: [10],
    placeholder: '514 123 4567'
  },
  {
    code: 'US',
    nameFr: 'États-Unis',
    nameEn: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    digits: [10],
    placeholder: '202 555 0123'
  },
  {
    code: 'GB',
    nameFr: 'Royaume-Uni',
    nameEn: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    digits: [10],
    placeholder: '7123 456789'
  },
  {
    code: 'CN',
    nameFr: 'Chine',
    nameEn: 'China',
    dialCode: '+86',
    flag: '🇨🇳',
    digits: [11],
    placeholder: '138 1234 5678'
  },
  {
    code: 'AE',
    nameFr: 'Émirats Arabes Unis',
    nameEn: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    digits: [9],
    placeholder: '50 123 4567'
  }
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // 🇨🇲 Cameroun (+237)

/**
 * Detect user's country from timezone, locale, or browser settings.
 * Returns default country (CM) if detection fails or is inconclusive.
 */
export function detectUserCountry(): Country {
  try {
    // 1. Check navigator language (e.g., 'fr-CM', 'en-NG', 'fr-FR', 'en-US')
    if (typeof window !== 'undefined' && navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const parts = lang.split('-');
        if (parts.length > 1) {
          const region = parts[1].toUpperCase();
          const match = COUNTRIES.find(c => c.code === region);
          if (match) return match;
        }
      }
    }

    // 2. Check timezone hint
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        if (timeZone.includes('Douala') || timeZone.includes('Cameroon')) {
          return COUNTRIES.find(c => c.code === 'CM') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Lagos')) {
          return COUNTRIES.find(c => c.code === 'NG') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Abidjan')) {
          return COUNTRIES.find(c => c.code === 'CI') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Dakar')) {
          return COUNTRIES.find(c => c.code === 'SN') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Libreville')) {
          return COUNTRIES.find(c => c.code === 'GA') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Brazzaville')) {
          return COUNTRIES.find(c => c.code === 'CG') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Kinshasa')) {
          return COUNTRIES.find(c => c.code === 'CD') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Paris')) {
          return COUNTRIES.find(c => c.code === 'FR') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Accra')) {
          return COUNTRIES.find(c => c.code === 'GH') || DEFAULT_COUNTRY;
        }
        if (timeZone.includes('Nairobi')) {
          return COUNTRIES.find(c => c.code === 'KE') || DEFAULT_COUNTRY;
        }
      }
    }
  } catch (err) {
    console.warn('Country auto-detection fallback to CM:', err);
  }

  // Fallback default is Cameroon 🇨🇲
  return DEFAULT_COUNTRY;
}

/**
 * Validates phone digits against a country's digit rules
 */
export function validatePhoneDigits(digitsOnly: string, country: Country): boolean {
  if (!digitsOnly) return false;
  // Strip leading 0 if present in international format except when needed
  const clean = digitsOnly.replace(/\D/g, '');
  return country.digits.some(count => clean.length === count || (clean.length === count + 1 && clean.startsWith('0')));
}
