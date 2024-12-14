// src/app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase'; // Importujemy już zainicjalizowaną instancję

// Interfejs dla błędów Stripe
interface StripeError extends Error {
   type?: string;
   code?: string;
   status?: number;
   details?: unknown;
}

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
      const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
      
      if (!waiterDoc.exists()) {
        throw new Error('Nie znaleziono kelnera');
      }
   
      const waiterData = waiterDoc.data();
      const connectedAccountId = stripeAccountId || waiterData?.stripeAccountId;
   
      if (!connectedAccountId) {
        throw new Error('Kelner nie ma skonfigurowanego konta Stripe');
      }
   
      const account = await stripe.accounts.retrieve(connectedAccountId);
      if (!account.charges_enabled || !account.payouts_enabled) {
        throw new Error('Konto Stripe kelnera nie jest w pełni skonfigurowane');
      }
   
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'pln',
        payment_method_types: ['card', 'blik'],
        application_fee_amount: Math.round(amount * 0.05 * 100),
        transfer_data: {
          destination: connectedAccountId,
        },
        metadata: {
          waiterId,
          type: 'tip',
        },
        statement_descriptor: 'NAPIWEK',
        statement_descriptor_suffix: 'TIP',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
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
   } catch (error: unknown) {
       console.error('Stripe API error:', error);
       
       // Casting error do naszego interfejsu
       const stripeError = error as StripeError;
       
       return NextResponse.json(
           { 
               error: stripeError.message || 'Wystąpił błąd wewnętrzny',
               details: stripeError.details || {},
               type: stripeError.type,
               code: stripeError.code
           },
           { status: stripeError.status || 500 }
       );
   }
}