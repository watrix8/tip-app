import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import Stripe from 'stripe';
import { PAYMENT_CONFIG, validateTipAmount, calculateApplicationFee } from '@/lib/config/payment';
import { RATE_LIMITS } from '@/lib/config/rate-limits';
import { rateLimit } from '@/lib/utils/rate-limiter';
import { headers } from 'next/headers';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Inicjalizacja Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const headersList = await headers(); // Dodajemy await
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const body = await request.json();
    const { action, waiterId, stripeAccountId } = body;

    console.log('Received request:', {
      action: action,
      waiterId: waiterId,
      hasStripeAccountId: !!stripeAccountId,
      ip: ip
    });

    // Wybierz odpowiedni limit na podstawie akcji
    let rateLimitConfig = RATE_LIMITS.DEFAULT;
    switch (action) {
      case 'create-payment-intent':
        rateLimitConfig = RATE_LIMITS.PAYMENT;
        break;
      case 'create-connect-account':
      case 'check-account-status':
        rateLimitConfig = RATE_LIMITS.STRIPE_ACCOUNT;
        break;
    }

    // rateLimitConfig będzie teraz miał poprawne nazwy właściwości
    const rateLimitResult = await rateLimit(ip, action, rateLimitConfig);

    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Zbyt wiele prób. Spróbuj ponownie później.',
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
      }, {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitConfig.windowMs / 1000).toString(),
          'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      });
    }

    // Sprawdź waiterId tylko dla akcji, które go wymagają
    if (action !== 'create-login-link' && !waiterId) {
      console.error('Missing waiterId for action:', action);
      return NextResponse.json(
        { error: 'waiterId is required' },
        { status: 400 }
      );
    }

    // Sprawdzenie statusu konta
    if (action === 'check-account-status') {
      try {
        console.log('Checking account status for waiterId:', waiterId);
        const userRef = doc(db, 'Users', waiterId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log('User document not found for waiterId:', waiterId);
          return NextResponse.json({ 
            hasAccount: false,
            isEnabled: false,
            error: 'User not found'
          });
        }

        const userData = userDoc.data();
        if (!userData.stripeAccountId) {
          console.log('No Stripe account ID found for user:', waiterId);
          return NextResponse.json({ 
            hasAccount: false,
            isEnabled: false,
            error: 'No Stripe account associated'
          });
        }

        console.log('Retrieving Stripe account:', userData.stripeAccountId);
        const account = await stripe.accounts.retrieve(userData.stripeAccountId);
        
        const accountStatus = {
          hasAccount: true,
          isEnabled: account.charges_enabled && account.payouts_enabled,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled
        };

        console.log('Account status:', accountStatus);
        return NextResponse.json(accountStatus);
      } catch (stripeError) {
        console.error('Check account status error:', stripeError);
        const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to check account status: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie konta Connect
    if (action === 'create-connect-account') {
      try {
        console.log('Creating Connect account for waiterId:', waiterId);
        const userRef = doc(db, 'Users', waiterId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.error('User document not found');
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        const userData = userDoc.data();
        
        // Sprawdź czy użytkownik już ma konto Stripe
        if (userData.stripeAccountId) {
          console.log('Existing Stripe account found:', userData.stripeAccountId);
          try {
            const existingAccount = await stripe.accounts.retrieve(userData.stripeAccountId);
            if (existingAccount.charges_enabled) {
              return NextResponse.json({ 
                accountId: userData.stripeAccountId,
                alreadyEnabled: true 
              });
            }
          } catch (stripeError) {
            console.log('Error retrieving existing account, creating new one:', stripeError);
          }
        }

        // Tworzenie nowego konta Stripe Connect
        console.log('Creating new Stripe account');
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'PL',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: {
            waiterId,
          },
        });

        console.log('Created Stripe account:', account.id);

        // Aktualizacja dokumentu użytkownika
        await updateDoc(userRef, {
          stripeAccountId: account.id,
          stripeOnboardingStatus: 'pending',
          updatedAt: new Date().toISOString()
        });

        // Tworzenie linku do onboardingu
        console.log('Creating account link');
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/onboarding/refresh?userId=${waiterId}`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/onboarding/complete?userId=${waiterId}`,
          type: 'account_onboarding',
        });

        console.log('Account link created');
        return NextResponse.json({
          accountId: account.id,
          accountLink: accountLink.url,
        });
      } catch (stripeError) {
        console.error('Stripe account creation error:', stripeError);
        const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to create Stripe account: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie intencji płatności
// route.ts - w sekcji gdzie jest "if (action === 'create-payment-intent')"

if (action === 'create-payment-intent') {
  try {
    console.log('Creating payment intent for waiterId:', waiterId);
    if (!body.amount) {
      throw new Error('Amount is required');
    }

    // Walidacja kwoty
    if (!validateTipAmount(body.amount)) {
      throw new Error(
        `Kwota musi być między ${PAYMENT_CONFIG.TIPS.MIN_AMOUNT} PLN a ${PAYMENT_CONFIG.TIPS.MAX_AMOUNT} PLN`
      );
    }

    const userRef = doc(db, 'Users', waiterId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Waiter not found');
    }

    const userData = userDoc.data();
    if (!userData.stripeAccountId) {
      throw new Error('No Stripe account found for waiter');
    }

    // Sprawdź czy konto jest w pełni skonfigurowane
    const account = await stripe.accounts.retrieve(userData.stripeAccountId);
    if (!account.charges_enabled) {
      throw new Error('Stripe account is not fully set up');
    }

    // Obliczamy prowizję używając nowej funkcji z payment.ts
    const amountInCents = Math.round(body.amount * 100); // Konwersja na grosze
    const applicationFee = calculateApplicationFee(body.amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pln',
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: userData.stripeAccountId,
      },
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: amountInCents,
      applicationFee: applicationFee
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (stripeError) {
    console.error('Payment intent creation error:', stripeError);
    const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to create payment intent: ${errorMessage}` },
      { status: 400 }
    );
  }
}

    // Generowanie linku logowania
    if (action === 'create-login-link') {
      if (!stripeAccountId) {
        console.error('Missing stripeAccountId for login link creation');
        return NextResponse.json(
          { error: 'stripeAccountId is required' },
          { status: 400 }
        );
      }

      try {
        console.log('Creating login link for account:', stripeAccountId);
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        console.log('Login link created');
        return NextResponse.json({ url: loginLink.url });
      } catch (stripeError) {
        console.error('Login link creation error:', stripeError);
        const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to create login link: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    console.error('Invalid action requested:', action);
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}