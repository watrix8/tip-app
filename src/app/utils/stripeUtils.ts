import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

export const STRIPE_ONBOARDING_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Missing Stripe Publishable Key');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};


// Inicjalizacja procesu onboardingu dla kelnera
export const initializeStripeConnect = async (waiterId: string) => {
  if (!waiterId) {
    throw new Error('WaiterID is required');
  }

  try {
    // Zapisujemy ID użytkownika w localStorage przed rozpoczęciem procesu
    localStorage.setItem('onboarding_user_id', waiterId);
    
    // 1. Tworzymy konto Stripe
    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'create-connect-account',
        waiterId,
        // Dodajemy URL-e z parametrami użytkownika
        refreshUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/refresh?userId=${waiterId}`,
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/complete?userId=${waiterId}`
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 2. Sprawdzamy czy otrzymaliśmy wymagane dane
    if (!data.accountId || !data.accountLink) {
      throw new Error('Invalid response from Stripe API');
    }
    
    // 3. Aktualizujemy dokument w Firebase
    const db = getFirestore();
    const userRef = doc(db, 'Users', waiterId);
    
    // Sprawdzamy czy dokument istnieje
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    // Aktualizujemy dokument o Stripe Account ID
    await updateDoc(userRef, {
      stripeAccountId: data.accountId,
      stripeOnboardingStatus: STRIPE_ONBOARDING_STATUS.PENDING
    });
    
    // 4. Przekierowujemy do Stripe Onboarding
    window.location.href = data.accountLink;
  } catch (error) {
    console.error('Error initializing Stripe Connect:', error);
    throw error;
  }
};

// Sprawdzenie statusu konta Stripe kelnera
export const checkStripeAccountStatus = async (waiterId: string): Promise<boolean> => {
  if (!waiterId) {
    return false;
  }

  try {
    const db = getFirestore();
    const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
    
    if (!waiterDoc.exists()) {
      console.error('Waiter document not found');
      return false;
    }
    
    const waiterData = waiterDoc.data();
    
    if (!waiterData?.stripeAccountId) {
      console.log('No Stripe account found for waiter');
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
    
    if (!response.ok) {
      console.error('Error response from Stripe API');
      return false;
    }
    
    const account = await response.json();
    const isFullyEnabled = account.payouts_enabled && account.charges_enabled;
    
    // Aktualizujemy status onboardingu jeśli konto jest w pełni aktywowane
    if (isFullyEnabled) {
      await updateDoc(doc(db, 'Users', waiterId), {
        stripeOnboardingStatus: STRIPE_ONBOARDING_STATUS.COMPLETED
      });
    }
    
    return isFullyEnabled;
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
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  if (!waiterId) {
    throw new Error('Waiter ID is required');
  }

  try {
    const db = getFirestore();
    const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
    
    if (!waiterDoc.exists()) {
      throw new Error('Waiter not found');
    }
    
    const waiterData = waiterDoc.data();
    
    if (!waiterData?.stripeAccountId) {
      throw new Error('Waiter has no Stripe account');
    }
    
    if (waiterData.stripeOnboardingStatus !== STRIPE_ONBOARDING_STATUS.COMPLETED) {
      throw new Error('Waiter Stripe account is not fully set up');
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { clientSecret } = await response.json();
    
    if (!clientSecret) {
      throw new Error('No client secret received from Stripe');
    }
    
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
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