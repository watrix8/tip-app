// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';

// Handler dla tworzenia konta Connect
async function handleConnectAccount(waiterId: string, refreshUrl: string, returnUrl: string) {
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

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return { accountId: account.id, accountLink: accountLink.url };
}

// Handler dla tworzenia PaymentIntent
async function handlePaymentIntent(amount: number, waiterId: string, stripeAccountId: string) {
  const applicationFee = Math.round(amount * 0.05);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'pln',
    payment_method_types: ['card'],
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: stripeAccountId,
    },
    metadata: {
      waiterId,
      type: 'tip',
    },
  });

  return { clientSecret: paymentIntent.client_secret };
}

// Handler dla sprawdzania statusu konta
async function handleAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return account;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, ...params } = data;

    switch (action) {
      case 'create-connect-account':
        const connectResult = await handleConnectAccount(
          params.waiterId,
          params.refreshUrl,  // Używamy przekazanego URL
          params.returnUrl    // Używamy przekazanego URL
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
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}