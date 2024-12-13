// src/app/api/stripe/onboarding/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/config/stripe';

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();

    const account = await stripe.accounts.retrieve(accountId);
    
    const isFullyOnboarded = 
      account.details_submitted &&
      account.payouts_enabled &&
      account.charges_enabled;

    return NextResponse.json({
      success: true,
      isFullyOnboarded,
      accountStatus: account.charges_enabled ? 'active' : 'pending'
    });

  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}