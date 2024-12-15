// src/app/config/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

console.log('Initializing Stripe with API version');

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Weryfikacja połączenia
stripe.accounts.list({ limit: 1 })
  .then(() => console.log('Stripe connection verified successfully'))
  .catch(error => console.error('Stripe connection test failed:', error));