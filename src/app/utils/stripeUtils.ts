// app/utils/stripeUtils.ts
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_51PcaqcEkSyI14zZVh7CYtUq6mGQrd6r1xSRrlfxExVg3BaIJkOfGYLQ5kSewrQldmu0nddVccFXgzMcyFGgPHpgv00b3kXldMS');
  }
  return stripePromise;
};

// Inicjalizacja procesu onboardingu dla kelnera
export const initializeStripeConnect = async (waiterId: string) => {
  try {
    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'create-connect-account',
        waiterId 
      }),
    });
    
    const data = await response.json();
    
    // Zapisz Stripe Account ID w Firestore
    const db = getFirestore();
    await updateDoc(doc(db, 'Users', waiterId), {
      stripeAccountId: data.accountId
    });
    
    // Przekieruj do Stripe Onboarding
    window.location.href = data.accountLink;
  } catch (error) {
    console.error('Error initializing Stripe Connect:', error);
    throw error;
  }
};

// Sprawdzenie statusu konta Stripe kelnera
export const checkStripeAccountStatus = async (waiterId: string): Promise<boolean> => {
  try {
    const db = getFirestore();
    const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
    const waiterData = waiterDoc.data();
    
    if (!waiterData?.stripeAccountId) {
      return false;
    }
    
    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'check-account-status',
        accountId: waiterData.stripeAccountId 
      }),
    });
    
    const account = await response.json();
    return account.payouts_enabled && account.charges_enabled;
  } catch (error) {
    console.error('Error checking Stripe account status:', error);
    return false;
  }
};

// Utworzenie płatności napiwku
export const createTipPayment = async (
  amount: number,
  waiterId: string,
  customerId?: string
) => {
  try {
    const db = getFirestore();
    const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
    const waiterData = waiterDoc.data();
    
    if (!waiterData?.stripeAccountId) {
      throw new Error('Waiter has no Stripe account');
    }
    
    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create-payment-intent',
        amount,
        waiterId,
        stripeAccountId: waiterData.stripeAccountId,
        customerId
      }),
    });
    
    const { clientSecret } = await response.json();
    
    const stripe = await getStripe();
    if (!stripe) throw new Error('Failed to load Stripe');
    
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          token: 'tok_visa' // W produkcji będzie to prawdziwa karta
        },
      },
    });
    
    if (result.error) {
      throw result.error;
    }
    
    return result;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};