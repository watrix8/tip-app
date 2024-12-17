// lib/config/rate-limits.ts
export const RATE_LIMITS = {
    PAYMENT: {
      windowMs: 15 * 60 * 1000, // 15 minut
      maxRequests: 10, // max 10 prób płatności na 15 minut
    },
    STRIPE_ACCOUNT: {
      windowMs: 60 * 60 * 1000, // 1 godzina
      maxRequests: 5, // max 5 prób utworzenia/aktualizacji konta na godzinę
    },
    DEFAULT: {
      windowMs: 60 * 1000, // 1 minuta
      maxRequests: 100 // 100 requestów na minutę
    }
  };