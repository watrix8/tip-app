// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51QVeM9I7OiRMQyLiHQm1v50URNMyoaCwbToD0MAV5pYpK8vjOhFyTfUFTmP1lKOTKYI4NIKvCGq3reYKoXf1aIxM00VNyd4jMU', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, waiterId } = body;

    if (action === 'create-payment-intent') {
      // Sprawdź czy kelner istnieje i ma konto Stripe
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

      // Utwórz PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount * 100, // Konwersja na centy
        currency: 'pln',
        application_fee_amount: 50, // 50 groszy prowizji
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