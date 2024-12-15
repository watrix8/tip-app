import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase/firestore';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import Stripe from 'stripe';

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
    const body = await request.json();
    console.log('Received request:', body);

    const { action, waiterId, stripeAccountId } = body;

    // Sprawdź waiterId tylko dla akcji, które go wymagają
    if (action !== 'create-login-link' && !waiterId) {
      return NextResponse.json(
        { error: 'waiterId is required' },
        { status: 400 }
      );
    }

    // Sprawdzenie statusu konta
    if (action === 'check-account-status') {
      try {
        const userRef = doc(db, 'Users', waiterId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists() || !userDoc.data().stripeAccountId) {
          return NextResponse.json({ 
            hasAccount: false,
            isEnabled: false 
          });
        }

        const account = await stripe.accounts.retrieve(userDoc.data().stripeAccountId);
        
        return NextResponse.json({
          hasAccount: true,
          isEnabled: account.charges_enabled && account.payouts_enabled,
          details_submitted: account.details_submitted
        });
      } catch (error) {
        console.error('Check account status error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to check account status: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie konta Connect
    if (action === 'create-connect-account') {
      try {
        const userRef = doc(db, 'Users', waiterId);
        console.log('Checking user document...');

        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().stripeAccountId) {
          console.log('Existing Stripe account found');
          const existingAccount = await stripe.accounts.retrieve(userDoc.data().stripeAccountId);
          if (existingAccount.charges_enabled) {
            return NextResponse.json({ 
              accountId: userDoc.data().stripeAccountId,
              alreadyEnabled: true 
            });
          }
        }

        console.log('Creating new Stripe account...');
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

        // Zapisz ID konta w Firestore
        await setDoc(userRef, {
          stripeAccountId: account.id,
          stripeOnboardingStatus: 'pending',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Creating account link...');
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/onboarding/refresh?userId=${waiterId}`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/onboarding/complete?userId=${waiterId}`,
          type: 'account_onboarding',
        });

        return NextResponse.json({
          accountId: account.id,
          accountLink: accountLink.url,
        });
      } catch (error) {
        console.error('Stripe account creation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to create Stripe account: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie intencji płatności
    if (action === 'create-payment-intent') {
      try {
        const userRef = doc(db, 'Users', waiterId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          return NextResponse.json(
            { error: 'No waiter found' },
            { status: 404 }
          );
        }

        const userData = userDoc.data();
        if (!userData.stripeAccountId) {
          return NextResponse.json(
            { error: 'No Stripe account found for waiter' },
            { status: 400 }
          );
        }

        // Sprawdź czy konto jest w pełni skonfigurowane
        const account = await stripe.accounts.retrieve(userData.stripeAccountId);
        if (!account.charges_enabled) {
          return NextResponse.json(
            { error: 'Stripe account is not fully set up' },
            { status: 400 }
          );
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: body.amount * 100, // Konwersja na grosze
          currency: 'pln',
          application_fee_amount: 50, // 50 groszy prowizji
          transfer_data: {
            destination: userData.stripeAccountId,
          },
        });

        return NextResponse.json({ 
          clientSecret: paymentIntent.client_secret 
        });
      } catch (error) {
        console.error('Payment intent creation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to create payment intent: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

    // Nowa akcja - generowanie linku logowania
    if (action === 'create-login-link') {
      if (!stripeAccountId) {
        return NextResponse.json(
          { error: 'stripeAccountId is required' },
          { status: 400 }
        );
      }

      try {
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        return NextResponse.json({ url: loginLink.url });
      } catch (error) {
        console.error('Login link creation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
          { error: `Failed to create login link: ${errorMessage}` },
          { status: 400 }
        );
      }
    }

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