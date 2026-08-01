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

export interface CountryDetectionResult {
  country: Country;
  detected: boolean; // true ONLY if SIM, Geolocation, or IP detection successfully matched a country
  method: 'sim' | 'geolocation' | 'ip' | 'saved' | 'default';
  details?: string;
}

const STORAGE_KEY_COUNTRY = 'last_selected_country_code';

/**
 * Get previously saved user country from localStorage
 */
export function getSavedUserCountry(): Country | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const code = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (code) {
        const found = COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (found) return found;
      }
    }
  } catch (err) {
    // Ignore storage errors
  }
  return null;
}

/**
 * Save user selected country to localStorage for future sessions
 */
export function saveUserSelectedCountry(countryCode: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_COUNTRY, countryCode.toUpperCase());
    }
  } catch (err) {
    // Ignore storage errors
  }
}

// Mobile Country Code (MCC) mapping for SIM Detection
const MCC_TO_COUNTRY: Record<number, string> = {
  624: 'CM', // Cameroun
  621: 'NG', // Nigeria
  612: 'CI', // Côte d'Ivoire
  608: 'SN', // Sénégal
  628: 'GA', // Gabon
  629: 'CG', // Congo
  630: 'CD', // RDC
  622: 'TD', // Tchad
  623: 'CF', // Centrafrique
  620: 'GH', // Ghana
  639: 'KE', // Kenya
  615: 'TG', // Togo
  616: 'BJ', // Bénin
  635: 'RW', // Rwanda
  611: 'GN', // Guinée
  610: 'ML', // Mali
  613: 'BF', // Burkina Faso
  604: 'MA', // Maroc
  605: 'DZ', // Algérie
  607: 'TN', // Tunisie
  602: 'EG', // Égypte
  655: 'ZA', // Afrique du Sud
  208: 'FR', // France
  206: 'BE', // Belgique
  228: 'CH', // Suisse
  302: 'CA', // Canada
  310: 'US', 311: 'US', 312: 'US', 313: 'US', 314: 'US', 315: 'US', 316: 'US', // USA
  234: 'GB', 235: 'GB', // UK
  460: 'CN', 461: 'CN', // Chine
  424: 'AE', // Émirats
};

/**
 * 1. Attempt SIM Card Country Detection via Web Telemetry / SIM MCC APIs
 */
async function detectViaSimCard(): Promise<Country | null> {
  try {
    if (typeof window === 'undefined') return null;

    // Check Web Mobile Connection API or Android Hybrid Interface if injected
    const nav = navigator as any;
    const simConn = nav.mozMobileConnection || nav.telephony || (window as any).AndroidSim;
    if (simConn) {
      const mcc = simConn.iccInfo?.mcc || simConn.mcc || (typeof simConn.getMcc === 'function' && simConn.getMcc());
      if (mcc && MCC_TO_COUNTRY[Number(mcc)]) {
        const countryCode = MCC_TO_COUNTRY[Number(mcc)];
        return COUNTRIES.find(c => c.code === countryCode) || null;
      }
    }
  } catch (err) {
    // SIM API not available or blocked
  }
  return null;
}

/**
 * 2. Attempt Geolocation Detection via GPS / Browser Coordinates
 */
async function detectViaGeolocation(): Promise<Country | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(null), 2500); // Max 2.5s wait

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        const { latitude: lat, longitude: lon } = pos.coords;

        // Bounding boxes check
        // Cameroon: Lat 1.6 - 13.1, Lon 8.4 - 16.2
        if (lat >= 1.6 && lat <= 13.1 && lon >= 8.4 && lon <= 16.2) {
          return resolve(COUNTRIES.find(c => c.code === 'CM') || null);
        }
        // Nigeria: Lat 4.2 - 13.9, Lon 2.7 - 14.7
        if (lat >= 4.2 && lat <= 13.9 && lon >= 2.7 && lon <= 14.7) {
          return resolve(COUNTRIES.find(c => c.code === 'NG') || null);
        }
        // Ivory Coast: Lat 4.3 - 10.7, Lon -8.6 - -2.5
        if (lat >= 4.3 && lat <= 10.7 && lon >= -8.6 && lon <= -2.5) {
          return resolve(COUNTRIES.find(c => c.code === 'CI') || null);
        }
        // Senegal: Lat 12.3 - 16.7, Lon -17.5 - -11.3
        if (lat >= 12.3 && lat <= 16.7 && lon >= -17.5 && lon <= -11.3) {
          return resolve(COUNTRIES.find(c => c.code === 'SN') || null);
        }
        // Gabon: Lat -3.9 - 2.3, Lon 8.7 - 14.5
        if (lat >= -3.9 && lat <= 2.3 && lon >= 8.7 && lon <= 14.5) {
          return resolve(COUNTRIES.find(c => c.code === 'GA') || null);
        }
        // France: Lat 41.3 - 51.1, Lon -5.1 - 9.6
        if (lat >= 41.3 && lat <= 51.1 && lon >= -5.1 && lon <= 9.6) {
          return resolve(COUNTRIES.find(c => c.code === 'FR') || null);
        }

        resolve(null);
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
      { timeout: 2500, enableHighAccuracy: false }
    );
  });
}

/**
 * 3. Attempt IP Address Country Detection via Server or GeoIP Services
 */
async function detectViaIpAddress(): Promise<Country | null> {
  try {
    // Attempt internal server route
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/country-detect', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode) {
        const found = COUNTRIES.find(c => c.code === data.countryCode.toUpperCase());
        if (found) return found;
      }
    }
  } catch (err) {
    // Ignore fetch error, try public fallback
  }

  // Fallback public IP API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        const found = COUNTRIES.find(c => c.code === data.country_code.toUpperCase());
        if (found) return found;
      }
    }
  } catch (err) {
    // Ignore fallback IP error
  }

  return null;
}

/**
 * Full Async Detection Engine:
 * Order: Saved Preference -> SIM Card -> Geolocation -> IP Address -> Default (Cameroon 🇨🇲 +237)
 * NOTE: Never uses device language!
 */
export async function detectUserCountryAsync(): Promise<CountryDetectionResult> {
  // 0. Check previously saved user choice first
  const saved = getSavedUserCountry();
  if (saved) {
    return {
      country: saved,
      detected: false, // User selected or saved in prior session
      method: 'saved',
    };
  }

  // 1. Check SIM Card
  const simCountry = await detectViaSimCard();
  if (simCountry) {
    return {
      country: simCountry,
      detected: true,
      method: 'sim',
      details: 'SIM Card'
    };
  }

  // 2. Check Geolocation
  const geoCountry = await detectViaGeolocation();
  if (geoCountry) {
    return {
      country: geoCountry,
      detected: true,
      method: 'geolocation',
      details: 'Géolocalisation'
    };
  }

  // 3. Check IP Address
  const ipCountry = await detectViaIpAddress();
  if (ipCountry) {
    return {
      country: ipCountry,
      detected: true,
      method: 'ip',
      details: 'Adresse IP'
    };
  }

  // 4. Fallback Default (Cameroon 🇨🇲 +237)
  return {
    country: DEFAULT_COUNTRY,
    detected: false, // Detection failed or yielded default
    method: 'default',
  };
}

/**
 * Synchronous fallback detection function
 */
export function detectUserCountry(): Country {
  const saved = getSavedUserCountry();
  if (saved) return saved;
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

