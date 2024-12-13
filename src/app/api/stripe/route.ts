// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';
import { Stripe } from 'stripe';

interface StripeError {
  message: string;
  type?: string;
  stack?: string;
}

// Funkcja do bezpiecznej obsługi błędów
function handleError(error: unknown): StripeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: 'Error'
    };
  }
  if (typeof error === 'object' && error !== null) {
    return {
      message: String((error as any).message || 'Unknown error'),
      type: (error as any).type,
      stack: (error as any).stack
    };
  }
  return {
    message: String(error),
    type: 'Unknown'
  };
}

// Handler dla tworzenia konta Connect
async function handleConnectAccount(waiterId: string) {
  try {
    // Debugowanie zmiennych środowiskowych
    console.log('Environment variables check:', {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY
    });

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
  } catch (error: unknown) {
    // Szczegółowe logowanie błędu
    const handledError = handleError(error);
    console.error('Detailed error in handleConnectAccount:', handledError);
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
        if (!params.accountId) {
          return NextResponse.json(
            { error: 'accountId is required' },
            { status: 400 }
          );
        }
        const accountResult = await stripe.accounts.retrieve(params.accountId);
        return NextResponse.json(accountResult);

      case 'create-payment-intent':
        // ... pozostała implementacja

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    // Szczegółowe logowanie błędu
    const handledError = handleError(error);
    console.error('Detailed API error:', handledError);

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
          message: handledError.message,
          stack: handledError.stack
        } : undefined 
      },
      { status: 500 }
    );
  }
}