// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

async function handleConnectAccount(waiterId: string, refreshUrl: string, returnUrl: string) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'PL',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          blik_payments: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          waiterId,
        },
      });
  
      const accountDetails = await stripe.accounts.retrieve(account.id);
      const isComplete = accountDetails.details_submitted && 
                        accountDetails.payouts_enabled &&
                        accountDetails.charges_enabled;
  
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
  
      return { 
        accountId: account.id, 
        accountLink: accountLink.url,
        isComplete 
      };
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      throw error;
    }
}

async function handlePaymentIntent(amount: number, waiterId: string, stripeAccountId: string) {
  try {
    // Sprawdzanie czy kelner ma konto Stripe
    const db = getFirestore();
    const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
    
    if (!waiterDoc.exists()) {
      throw new Error('Nie znaleziono kelnera');
    }

    const waiterData = waiterDoc.data();
    const connectedAccountId = stripeAccountId || waiterData?.stripeAccountId;

    if (!connectedAccountId) {
      throw new Error('Kelner nie ma skonfigurowanego konta Stripe');
    }

    // Sprawdzanie statusu konta Stripe
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.charges_enabled || !account.payouts_enabled) {
      throw new Error('Konto Stripe kelnera nie jest w pełni skonfigurowane');
    }

    // Tworzenie PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Konwersja na centy
      currency: 'pln',
      payment_method_types: [
        'card',
        'blik',
        'google_pay', // Prawidłowa nazwa dla Google Pay
        'apple_pay'   // Prawidłowa nazwa dla Apple Pay
      ],
      application_fee_amount: Math.round(amount * 0.05 * 100), // 5% prowizji
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata: {
        waiterId,
        type: 'tip',
      },
      statement_descriptor: 'NAPIWEK', // Opis na wyciągu z karty
      statement_descriptor_suffix: 'TIP',
    });

    return { 
      clientSecret: paymentIntent.client_secret,
      accountId: connectedAccountId 
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

async function handleAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      capabilities: account.capabilities
    };
  } catch (error) {
    console.error('Error checking account status:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, ...params } = data;

    switch (action) {
      case 'create-connect-account':
        const connectResult = await handleConnectAccount(
          params.waiterId,
          params.refreshUrl,
          params.returnUrl
        );
        return NextResponse.json(connectResult);

      case 'create-payment-intent':
        const paymentResult = await handlePaymentIntent(
          params.amount,
          params.waiterId,
          params.stripeAccountId
        );
        return NextResponse.json(paymentResult);

      case 'check-account-status':
        const accountResult = await handleAccountStatus(params.accountId);
        return NextResponse.json(accountResult);

      default:
        return NextResponse.json(
          { error: 'Nieprawidłowa akcja' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Wystąpił błąd wewnętrzny',
        details: error.details || {} 
      },
      { status: error.status || 500 }
    );
  }
}