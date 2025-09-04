// lib/locales.js - This is your source of truth for ALL markets

export const LOCALE_CONFIG = {
  // English markets
  'en-US': {
    baseLanguage: 'en',
    urlPrefix: '', // Default, no prefix
    name: 'United States',
    currency: 'USD',
    flag: '🇺🇸',
  },
  'en-GB': {
    baseLanguage: 'en',
    urlPrefix: '/gb',
    name: 'United Kingdom',
    currency: 'GBP',
    flag: '🇬🇧',
  },
  'en-CA': {
    baseLanguage: 'en',
    urlPrefix: '/ca',
    name: 'Canada',
    currency: 'CAD',
    flag: '🇨🇦',
  },
  'en-AU': {
    baseLanguage: 'en',
    urlPrefix: '/au',
    name: 'Australia',
    currency: 'AUD',
    flag: '🇦🇺',
  },
  'en-IE': {
    baseLanguage: 'en',
    urlPrefix: '/ie',
    name: 'Ireland',
    currency: 'EUR',
    flag: '🇮🇪',
  },

  // Spanish markets
  'es-ES': {
    baseLanguage: 'es',
    urlPrefix: '/es',
    name: 'España',
    currency: 'EUR',
    flag: '🇪🇸',
  },
  'es-MX': {
    baseLanguage: 'es',
    urlPrefix: '/mx',
    name: 'México',
    currency: 'MXN',
    flag: '🇲🇽',
  },
  'es-AR': {
    baseLanguage: 'es',
    urlPrefix: '/ar',
    name: 'Argentina',
    currency: 'ARS',
    flag: '🇦🇷',
  },

  // German markets
  'de-DE': {
    baseLanguage: 'de',
    urlPrefix: '/de',
    name: 'Deutschland',
    currency: 'EUR',
    flag: '🇩🇪',
  },
  'de-AT': {
    baseLanguage: 'de',
    urlPrefix: '/at',
    name: 'Österreich',
    currency: 'EUR',
    flag: '🇦🇹',
  },
  'de-CH': {
    baseLanguage: 'de',
    urlPrefix: '/ch',
    name: 'Schweiz',
    currency: 'CHF',
    flag: '🇨🇭',
  },

  // French markets
  'fr-FR': {
    baseLanguage: 'fr',
    urlPrefix: '/fr',
    name: 'France',
    currency: 'EUR',
    flag: '🇫🇷',
  },
  'fr-CA': {
    baseLanguage: 'fr',
    urlPrefix: '/fr-ca',
    name: 'Canada (Français)',
    currency: 'CAD',
    flag: '🇨🇦',
  },

  // Portuguese markets
  'pt-BR': {
    baseLanguage: 'pt',
    urlPrefix: '/br',
    name: 'Brasil',
    currency: 'BRL',
    flag: '🇧🇷',
  },
  'pt-PT': {
    baseLanguage: 'pt',
    urlPrefix: '/pt',
    name: 'Portugal',
    currency: 'EUR',
    flag: '🇵🇹',
  },

  // Chinese markets
  'zh-CN': {
    baseLanguage: 'zh',
    urlPrefix: '/cn',
    name: '中国',
    currency: 'CNY',
    flag: '🇨🇳',
  },
};

// Helper to get all locales for a base language
export const getLocalesForLanguage = (language: string) => {
  return Object.entries(LOCALE_CONFIG)
    .filter(([_, config]) => config.baseLanguage === language)
    .map(([locale]) => locale);
};
