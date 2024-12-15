// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

// Dodaj typ dla błędu Stripe
interface StripeError extends Error {
  type?: string;
  message: string;
  code?: string;
}

const stripe = new Stripe('sk_test_51QVeM9I7OiRMQyLiHQm1v50URNMyoaCwbToD0MAV5pYpK8vjOhFyTfUFTmP1lKOTKYI4NIKvCGq3reYKoXf1aIxM00VNyd4jMU', {
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

    if (action === 'create-connect-account') {
      try {
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

    // Istniejąca obsługa payment intent
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

      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount * 100,
        currency: 'pln',
        application_fee_amount: 50,
        transfer_data: {
          destination: waiterData.stripeAccountId,
        },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
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