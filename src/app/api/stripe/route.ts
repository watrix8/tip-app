// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';

// Pomocniczy typ dla błędów
type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

// Handler dla tworzenia konta Connect
async function handleConnectAccount(waiterId: string) {
  try {
    console.log('Creating Stripe Connect account for waiterId:', waiterId);
    
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

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/complete`,
      type: 'account_onboarding',
    });

    console.log('Account link created');

    return { accountId: account.id, accountLink: accountLink.url };
  } catch (error) {
    console.error('Error in handleConnectAccount:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, ...params } = data;

    console.log('Received request with action:', action, 'and params:', params);

    switch (action) {
      case 'create-connect-account':
        if (!params.waiterId) {
          return NextResponse.json(
            { error: 'waiterId is required' },
            { status: 400 }
          );
        }
        const connectResult = await handleConnectAccount(params.waiterId);
        return NextResponse.json(connectResult);

      case 'check-account-status':
        const accountResult = await handleAccountStatus(params.accountId);
        return NextResponse.json(accountResult);

      case 'create-payment-intent':
        const paymentResult = await handlePaymentIntent(
          params.amount,
          params.waiterId,
          params.stripeAccountId
        );
        return NextResponse.json(paymentResult);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (maybeError: unknown) {
    const error = toErrorWithMessage(maybeError);
    console.error('Stripe API error:', error);

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}

// Handler dla sprawdzania statusu konta
async function handleAccountStatus(accountId: string) {
  return await stripe.accounts.retrieve(accountId);
}

// Handler dla tworzenia PaymentIntent
async function handlePaymentIntent(
  amount: number,
  waiterId: string,
  stripeAccountId: string
) {
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