// app/config/stripe.ts
import Stripe from 'stripe';

// Konfiguracja dla polskiego rynku
const stripeConfig: Stripe.StripeConfig = {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'TipApp',
    version: '1.0.0',
  },
  telemetry: false // Wyłączamy telemetrię dla RODO
};

// Podstawowa konfiguracja dla Express Connect
export const connectConfig = {
  country: 'PL',
  default_currency: 'pln',
  business_type: 'individual' as const,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  tos_acceptance: {
    service_agreement: 'recipient' // Dla polskiego rynku
  }
};

// Konfiguracja dla płatności
export const paymentConfig = {
  currency: 'pln',
  payment_method_types: ['card', 'blik'] as const,
  supported_locales: ['pl'],
  payment_method_options: {
    card: {
      request_three_d_secure: 'automatic'
    }
  }
};

// Główna instancja Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', stripeConfig);

// Pomocnicze typy dla polskiego rynku
export interface PolishPaymentIntent extends Stripe.PaymentIntent {
  currency: 'pln';
  amount: number; // W groszach (1 PLN = 100)
}

export interface PolishStripeAccount extends Stripe.Account {
  country: 'PL';
  default_currency: 'pln';
}