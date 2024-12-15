// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';

// Interfejs dla błędu Stripe
interface StripeError extends Error {
  type?: string;
  message: string;
  code?: string;
}

// Inicjalizacja Stripe z zmiennej środowiskowej
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { action, waiterId, refreshUrl, returnUrl } = body;
    console.log('Parsed values:', { action, waiterId, refreshUrl, returnUrl });

    if (!waiterId) {
      console.log('Missing waiterId');
      return NextResponse.json(
        { error: 'waiterId is required' },
        { status: 400 }
      );
    }

    // Sprawdzenie statusu konta
    if (action === 'check-account-status') {
      try {
        const waiterRef = doc(db, 'waiters', waiterId);
        const waiterDoc = await getDoc(waiterRef);
        
        if (!waiterDoc.exists() || !waiterDoc.data().stripeAccountId) {
          return NextResponse.json({ hasAccount: false });
        }

        const account = await stripe.accounts.retrieve(waiterDoc.data().stripeAccountId);
        return NextResponse.json({
          hasAccount: true,
          isEnabled: account.charges_enabled && account.payouts_enabled
        });
      } catch (error) {
        const stripeError = error as StripeError;
        return NextResponse.json(
          { error: `Failed to check account status: ${stripeError.message}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie konta Connect
    if (action === 'create-connect-account') {
      try {
        // Najpierw sprawdź czy kelner już nie ma konta
        const waiterRef = doc(db, 'waiters', waiterId);
        const waiterDoc = await getDoc(waiterRef);
        
        if (waiterDoc.exists() && waiterDoc.data().stripeAccountId) {
          const existingAccount = await stripe.accounts.retrieve(waiterDoc.data().stripeAccountId);
          if (existingAccount.charges_enabled) {
            return NextResponse.json({ 
              accountId: waiterDoc.data().stripeAccountId,
              alreadyEnabled: true 
            });
          }
        }

        console.log('Creating Stripe account...');
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
        console.log('Stripe account created:', account.id);

        // Zapisz ID konta w Firestore
        await setDoc(waiterRef, {
          stripeAccountId: account.id,
          stripeOnboardingStatus: 'pending',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Creating account link...');
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: refreshUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/waiter`,
          return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/waiter`,
          type: 'account_onboarding',
        });
        console.log('Account link created');

        return NextResponse.json({
          accountId: account.id,
          accountLink: accountLink.url,
        });
      } catch (error: unknown) {
        const stripeError = error as StripeError;
        console.error('Stripe error details:', stripeError.message);
        return NextResponse.json(
          { error: `Failed to create Stripe account: ${stripeError.message}` },
          { status: 400 }
        );
      }
    }

    // Tworzenie intencji płatności
    if (action === 'create-payment-intent') {
      const waiterRef = doc(db, 'waiters', waiterId);
      const waiterDoc = await getDoc(waiterRef);
      
      if (!waiterDoc.exists()) {
        return NextResponse.json(
          { error: 'No waiter found' },
          { status: 404 }
        );
      }

      const waiterData = waiterDoc.data();
      if (!waiterData.stripeAccountId) {
        return NextResponse.json(
          { error: 'No Stripe account found for waiter' },
          { status: 400 }
        );
      }

      // Sprawdź czy konto jest w pełni skonfigurowane
      const account = await stripe.accounts.retrieve(waiterData.stripeAccountId);
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
          destination: waiterData.stripeAccountId,
        },
      });

      return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}