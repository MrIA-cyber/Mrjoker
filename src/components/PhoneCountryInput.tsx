import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Globe,
  Sparkles
} from 'lucide-react';
import { 
  Country, 
  COUNTRIES, 
  DEFAULT_COUNTRY, 
  detectUserCountryAsync,
  saveUserSelectedCountry,
  validatePhoneDigits 
} from '../data/countries';

export interface PhoneCountryInputProps {
  value: string; // E.164 full number e.g. "+237677894512" or national digits "677894512"
  onChange: (fullFormattedNumber: string, isValid: boolean, country: Country, nationalDigits: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  lang?: 'fr' | 'en';
  className?: string;
  error?: string;
  id?: string;
  onBlur?: () => void;
  autoDetect?: boolean;
}

export const PhoneCountryInput: React.FC<PhoneCountryInputProps> = ({
  value = '',
  onChange,
  label,
  required = false,
  placeholder,
  disabled = false,
  lang = 'fr',
  className = '',
  error,
  id = 'phone-input',
  onBlur,
  autoDetect = true
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [nationalDigits, setNationalDigits] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [isDetectedSuccess, setIsDetectedSuccess] = useState(false);
  const [detectionSource, setDetectionSource] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Asynchronous Country Auto-Detection (SIM -> Geolocation -> IP -> Default)
  useEffect(() => {
    let isMounted = true;

    if (value) {
      // Check if value starts with any known dial code
      const foundByDial = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (foundByDial) {
        setSelectedCountry(foundByDial);
        setNationalDigits(value.replace(foundByDial.dialCode, '').replace(/\D/g, ''));
        setIsDetectedSuccess(false);
        return;
      }
    }

    if (autoDetect) {
      detectUserCountryAsync().then((res) => {
        if (!isMounted) return;
        setSelectedCountry(res.country);
        setIsDetectedSuccess(res.detected); // true ONLY if SIM/Geo/IP was successful
        if (res.details) setDetectionSource(res.details);

        // Propagate changes if national digits already exist
        if (nationalDigits) {
          const valid = validatePhoneDigits(nationalDigits, res.country);
          const fullNumber = `${res.country.dialCode}${nationalDigits}`;
          onChange(fullNumber, valid, res.country, nationalDigits);
        }
      });
    }

    return () => { isMounted = false; };
  }, []);

  // Sync state if external value changes drastically
  useEffect(() => {
    if (!value) {
      setNationalDigits('');
      return;
    }
    // Extract digits
    if (value.startsWith(selectedCountry.dialCode)) {
      const digits = value.replace(selectedCountry.dialCode, '').replace(/\D/g, '');
      setNationalDigits(digits);
    } else {
      const found = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (found) {
        setSelectedCountry(found);
        setNationalDigits(value.replace(found.dialCode, '').replace(/\D/g, ''));
        setIsDetectedSuccess(false);
      }
    }
  }, [value]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isModalOpen]);

  // Digits validation
  const isValid = validatePhoneDigits(nationalDigits, selectedCountry);

  // Handle national digit changes
  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanDigits = rawValue.replace(/\D/g, '');
    setNationalDigits(cleanDigits);
    setIsTouched(true);

    const valid = validatePhoneDigits(cleanDigits, selectedCountry);
    const fullNumber = cleanDigits ? `${selectedCountry.dialCode}${cleanDigits}` : '';
    
    onChange(fullNumber, valid, selectedCountry, cleanDigits);
  };

  // Handle manual country selection
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    saveUserSelectedCountry(country.code); // Persist user's manual selection for next time
    setIsDetectedSuccess(false); // User selected manually, so "Pays détecté" is hidden
    setIsModalOpen(false);

    const valid = validatePhoneDigits(nationalDigits, country);
    const fullNumber = nationalDigits ? `${country.dialCode}${nationalDigits}` : '';

    onChange(fullNumber, valid, country, nationalDigits);
  };

  // Filter countries for selector modal
  const filteredCountries = COUNTRIES.filter(c => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      c.nameFr.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    // Sort Cameroon first, then alphabetical
    if (a.code === 'CM') return -1;
    if (b.code === 'CM') return 1;
    const nameA = lang === 'fr' ? a.nameFr : a.nameEn;
    const nameB = lang === 'fr' ? b.nameFr : b.nameEn;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Country Indicators */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap mb-1">
        {label ? (
          <label htmlFor={id} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        ) : (
          <span />
        )}

        {/* Validation or Country Badge */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Rule 8: Show "Pays détecté" ONLY if detection was genuinely successful */}
          {isDetectedSuccess ? (
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0">
              <Sparkles className="w-3 h-3 text-[#16A34A] shrink-0" />
              <span>{selectedCountry.flag}</span>
              <span className="whitespace-nowrap">{lang === 'fr' ? 'Pays détecté' : 'Detected'}</span>
            </span>
          ) : (
            /* Rule 9: If default or user chosen, display simply country name without "Pays détecté" */
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <span>{selectedCountry.flag}</span>
              <span className="whitespace-nowrap">{lang === 'fr' ? selectedCountry.nameFr : selectedCountry.nameEn}</span>
            </span>
          )}

          {isValid && (
            <span className="text-[10px] font-extrabold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
              <span>{lang === 'fr' ? 'Valide' : 'Valid'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Input Group Container */}
      <div 
        className={`relative flex items-center bg-[#F8FAFC] hover:bg-white focus-within:bg-white border rounded-2xl transition duration-200 shadow-2xs ${
          error || (isTouched && nationalDigits && !isValid)
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/10'
            : isValid
            ? 'border-emerald-500/80 ring-2 ring-emerald-500/15'
            : 'border-slate-200 focus-within:border-[#16A34A] focus-within:ring-2 focus-within:ring-[#16A34A]/25'
        }`}
      >
        {/* Country Selector Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsModalOpen(true)}
          className="h-[48px] pl-3 pr-2 sm:pl-3.5 sm:pr-2.5 flex items-center gap-1 sm:gap-1.5 text-xs font-extrabold text-[#0F172A] hover:bg-slate-100/80 rounded-l-2xl border-r border-slate-200 transition cursor-pointer shrink-0 select-none group"
          title={lang === 'fr' ? 'Changer de pays' : 'Change country'}
        >
          <span className="text-lg sm:text-xl leading-none transition-transform group-hover:scale-110 shrink-0">
            {selectedCountry.flag}
          </span>
          <span className="font-mono font-black text-slate-800 text-xs sm:text-sm whitespace-nowrap shrink-0">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 group-hover:translate-y-0.5 shrink-0" />
        </button>

        {/* Telephone Number Input Field */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            disabled={disabled}
            value={nationalDigits}
            onBlur={() => {
              setIsTouched(true);
              if (onBlur) onBlur();
            }}
            onChange={handleDigitChange}
            placeholder={placeholder || selectedCountry.placeholder}
            className="w-full h-[48px] px-2.5 sm:px-3.5 bg-transparent text-sm sm:text-base font-mono font-extrabold text-[#0F172A] placeholder:text-slate-400 focus:outline-none min-w-0 truncate"
          />

          {/* Status Checkmark / Alert */}
          <div className="pr-2.5 sm:pr-3.5 flex items-center gap-1 shrink-0">
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 animate-in fade-in" />
            ) : isTouched && nationalDigits && !isValid ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 animate-in fade-in" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Error text */}
      {(error || (isTouched && nationalDigits && !isValid)) && (
        <p className="text-xs text-red-500 font-bold flex items-center gap-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {error ||
              (lang === 'fr'
                ? `Format incorrect (${selectedCountry.digits.join(' ou ')} chiffres requis pour ${selectedCountry.nameFr})`
                : `Invalid length (${selectedCountry.digits.join(' or ')} digits required for ${selectedCountry.nameEn})`)}
          </span>
        </p>
      )}

      {/* 2. COUNTRY SELECTOR MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">
                        {lang === 'fr' ? 'Sélectionner le pays' : 'Select Country'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {lang === 'fr'
                          ? 'Recherche par nom, indicatif ou code'
                          : 'Search by name, dial code or ISO'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition border border-slate-200/60 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'fr'
                        ? 'Ex: Cameroun, +237, Nigéria, France...'
                        : 'Ex: Cameroon, +237, Nigeria, France...'
                    }
                    className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => {
                    const isSelected = selectedCountry.code === country.code;
                    const countryName = lang === 'fr' ? country.nameFr : country.nameEn;

                    return (
                      <button
                        key={country.code}
                        onClick={() => handleSelectCountry(country)}
                        className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group ${
                          isSelected
                            ? 'bg-[#0F172A] text-white shadow-xs'
                            : 'hover:bg-emerald-50/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl leading-none group-hover:scale-110 transition-transform">
                            {country.flag}
                          </span>
                          <div>
                            <p className="font-extrabold text-xs sm:text-sm">
                              {countryName}
                            </p>
                            <p className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              Ex: {country.placeholder} ({country.digits.join('/')} chiffres)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl ${
                              isSelected
                                ? 'bg-white/15 text-emerald-300'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                            }`}
                          >
                            {country.dialCode}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Globe className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold">
                      {lang === 'fr' ? 'Aucun pays trouvé pour cette recherche.' : 'No country found matching your query.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] font-bold text-slate-400">
                {lang === 'fr' ? '🇨🇲 Cameroun (+237) par défaut' : '🇨🇲 Cameroon (+237) default fallback'}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneCountryInput;

